import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import express from "express";
import { readCollection, writeCollection } from "../store.js";
const aiProgress = new Map();
let progressWrite = Promise.resolve();
const progressRetentionMs = 15000;
const aiSections = ["Overview", "Indication & Dosage", "Mechanism of Action", "Warnings & Contraindication", "Adverse Reactions", "Drug Interactions", "Special Population", "Clinical Evidence", "Practical Information"];
const statuses = ["fetched", "in_review", "published", "rejected"];
const randomDrugCandidates = [
  "Aspirin", "Losartan", "Valsartan", "Hydrochlorothiazide", "Furosemide",
  "Spironolactone", "Carvedilol", "Metoprolol", "Bisoprolol", "Diltiazem",
  "Verapamil", "Clopidogrel", "Rivaroxaban", "Apixaban", "Enoxaparin",
  "Pantoprazole", "Omeprazole", "Famotidine", "Doxycycline", "Azithromycin",
  "Ceftriaxone", "Ciprofloxacin", "Fluconazole", "Acyclovir", "Prednisone",
  "Dexamethasone", "Montelukast", "Budesonide", "Tiotropium", "Ipratropium",
  "Loratadine", "Cetirizine", "Levothyroxine", "Insulin glargine", "Sitagliptin",
  "Gliclazide", "Pioglitazone", "Rosuvastatin", "Pravastatin", "Ezetimibe",
  "Sertraline", "Fluoxetine", "Escitalopram", "Amitriptyline", "Gabapentin",
  "Pregabalin", "Tramadol", "Morphine", "Ondansetron", "Metoclopramide"
];
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const admin = (req, config) => Boolean(config.adminKey && req.headers["x-admin-key"] === config.adminKey);
const clean = (v) => String(v || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const first = (v) => Array.isArray(v) ? String(v[0] || "") : String(v || "");
const displayText = (value) => {
  if (value && typeof value === "object") {
    return String(value.name || value.label || value.value || value.title || value.route || value.text || "");
  }
  return String(value || "");
};
const normalize = (raw, fallback = "fetched") => {
  const now = new Date().toISOString();
  const generic = displayText(raw.generic || raw.name || raw.id).trim();
  return { ...raw, id: String(raw.id || "drug-" + clean(generic)), name: displayText(raw.name || generic), generic, brand: displayText(raw.brand), class: displayText(raw.class), route: displayText(raw.route), source: displayText(raw.source || "openFDA"), sourceUrl: displayText(raw.sourceUrl || "https://open.fda.gov/apis/drug/label/"), status: statuses.includes(raw.status) ? raw.status : fallback, createdAt: String(raw.createdAt || now), updatedAt: String(raw.updatedAt || raw.createdAt || now) };
};
async function fetchLabel(term) {
  const q = encodeURIComponent("openfda.generic_name:\"" + String(term).replace(/"/g, "") + "\"");
  const response = await fetch("https://api.fda.gov/drug/label.json?search=" + q + "&limit=1", { headers: { Accept: "application/json" } });
  if (!response.ok) return null;
  const json = await response.json();
  return Array.isArray(json.results) ? json.results[0] || null : null;
}
async function getQueue(frontendPath) {
  const stored = await readCollection("medlensDrugQueue");
  if (stored.length) return stored;
  const sourcePath = path.join(frontendPath, "www", "medlens-database.js");
  try {
    const source = await fs.promises.readFile(sourcePath, "utf8");
    const entries = {};
    const pattern = /window\.MEDLENS_DATABASE\[(?:"([^"]+)"|'([^']+)')\]\s*=\s*({[\s\S]*?})\s*;/g;
    let match;
    while ((match = pattern.exec(source))) {
      const id = match[1] || match[2];
      const raw = JSON.parse(match[3]);
      entries[id] = normalize({ ...raw, id, source: raw.source || "MedLens database", status: raw.editor || raw.aiEdited ? "published" : "fetched" });
    }
    const seeded = Object.values(entries);
    if (seeded.length) await writeCollection("medlensDrugQueue", seeded);
    return seeded;
  } catch {
    return stored;
  }
}
function runAiEditor({ id, drugName, command, args, cwd }) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, env: process.env, stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    let errorOutput = "";
    const updateProgress = () => {
      const completed = aiSections.filter((label) => output.includes(`${label}... done`)).length;
      const current = aiSections.find((label) => output.includes(`${label}...`) && !output.includes(`${label}... done`));
      setProgress(id, { status: "running", percent: Math.round((completed / aiSections.length) * 100), completed, total: aiSections.length, step: current ? `${current}...` : completed ? `${aiSections[Math.min(completed - 1, aiSections.length - 1)]}...done` : "Starting AI editor...", drugName, error: "" });
    };
    child.stdout.on("data", (chunk) => { output += chunk.toString(); updateProgress(); });
    child.stderr.on("data", (chunk) => { errorOutput += chunk.toString(); });
    child.on("error", reject);
    child.on("close", (code) => code === 0 ? resolve() : reject(new Error(errorOutput.trim() || `AI editor exited with code ${code}.`)));
  });
}
function setProgress(id, state) {
  const next = { id, ...state, updatedAt: new Date().toISOString() };
  aiProgress.set(id, next);
  progressWrite = progressWrite.then(async () => {
    const all = await readCollection("medlensAiProgress");
    const index = all.findIndex((entry) => entry.id === id);
    if (index < 0) all.push(next); else all[index] = next;
    await writeCollection("medlensAiProgress", all);
  }).catch(() => {});
  if (state.status === "done" || state.status === "failed") {
    setTimeout(() => {
      aiProgress.delete(id);
      progressWrite = progressWrite.then(async () => {
        const all = await readCollection("medlensAiProgress");
        await writeCollection("medlensAiProgress", all.filter((entry) => entry.id !== id));
      }).catch(() => {});
    }, progressRetentionMs);
  }
}
async function readPersistedProgress() {
  const now = Date.now();
  const stored = await readCollection("medlensAiProgress");
  const active = stored.filter((entry) => entry.status === "running" || !entry.expiresAt || Date.parse(entry.expiresAt) > now);
  if (active.length !== stored.length) await writeCollection("medlensAiProgress", active);
  active.forEach((entry) => aiProgress.set(entry.id, entry));
  return active;
}
export function createMedLensRouter({ config, frontendPath }) {
  const router = express.Router();  router.get("/api/admin/medlens/progress", wrap(async (req, res) => {
    if (!admin(req, config)) return res.status(403).json({ error: "Forbidden" });
    res.json({ ok: true, progress: await readPersistedProgress() });
  }));
  router.get("/api/admin/medlens/drugs/:drugId/progress", wrap(async (req, res) => {
    if (!admin(req, config)) return res.status(403).json({ error: "Forbidden" });
    const id = String(req.params.drugId);
    const progress = aiProgress.get(id) || (await readPersistedProgress()).find((entry) => entry.id === id);
    res.json({ ok: true, progress: progress || { status: "idle", percent: 0, completed: 0, total: aiSections.length, step: "Not running", error: "" } });
  }));
  router.get("/api/medlens/drugs", wrap(async (_req, res) => {
    const items = (await getQueue(frontendPath)).map((x) => normalize(x)).filter((x) => x.status === "published");
    res.json({ ok: true, total: items.length, items });
  }));
  router.get("/api/admin/medlens/drugs", wrap(async (req, res) => {
    if (!admin(req, config)) return res.status(403).json({ error: "Forbidden" });
    const all = (await getQueue(frontendPath)).map((x) => normalize(x));
    const filter = String(req.query.status || "all").toLowerCase();
    const items = all.filter((x) => filter === "all" || x.status === filter);
    res.json({ ok: true, total: items.length, items, summary: Object.fromEntries(statuses.map((s) => [s, all.filter((x) => x.status === s).length])) });
  }));
  router.post("/api/admin/medlens/drugs/fetch", wrap(async (req, res) => {
    if (!admin(req, config)) return res.status(403).json({ error: "Forbidden" });
    const all = await getQueue(frontendPath);
    const existing = new Set(all.map((x) => clean(x.generic || x.name || x.id)));
    let terms = (Array.isArray(req.body?.terms) ? req.body.terms : String(req.body?.terms || "").split(/[,\n]/)).map((x) => String(x).trim()).filter(Boolean).slice(0, 10);
    if (req.body?.random) {
      terms = randomDrugCandidates
        .filter((term) => !existing.has(clean(term)))
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(Number(req.body.count) || 10, randomDrugCandidates.length));
    }
    if (!terms.length) return res.status(400).json({ error: "No unused drug records are available." });
    const next = [...all]; const fetched = []; const notFound = []; const duplicates = [];
    for (const term of terms) {
      const label = await fetchLabel(term).catch(() => null);
      if (!label) { notFound.push(term); continue; }
      const fda = label.openfda || {}; const generic = first(fda.generic_name) || first(fda.substance_name) || term;
      const item = normalize({ id: "drug-" + clean(generic), name: generic, generic, brand: first(fda.brand_name), class: first(fda.pharm_class_epc) || first(fda.pharm_class_moa), route: first(fda.route), source: "openFDA", sourceLabel: label });
      const index = next.findIndex((x) => x.id === item.id);
      if (index < 0) { next.push(item); fetched.push(item); } else { duplicates.push(term); }
    }
    await writeCollection("medlensDrugQueue", next); res.json({ ok: true, fetched, notFound, duplicates, total: fetched.length });
  }));
  router.post("/api/admin/medlens/drugs/:drugId/ai-edit", wrap(async (req, res) => {
    if (!admin(req, config)) return res.status(403).json({ error: "Forbidden" });
    const id = String(req.params.drugId); const all = await getQueue(frontendPath); const index = all.findIndex((x) => x.id === id);
    if (index < 0) return res.status(404).json({ error: "Drug not found" });
    if (!["fetched", "rejected"].includes(all[index].status)) return res.status(409).json({ error: "Only fetched or rejected drugs can be AI edited." });
    const input = path.join(os.tmpdir(), "ajix-medlens-" + crypto.randomUUID() + ".json"); const output = path.join(os.tmpdir(), "ajix-medlens-" + crypto.randomUUID() + ".json");
    if (aiProgress.get(id)?.status === "running") return res.status(409).json({ error: "AI editing is already running for this drug." });
    setProgress(id, { status: "running", percent: 0, completed: 0, total: aiSections.length, step: "Starting AI editor...", drugName: all[index].brand || all[index].generic || id, error: "" });
    try {
      await fs.promises.writeFile(input, JSON.stringify({ [id]: all[index] }), "utf8");
      await runAiEditor({ id, drugName: all[index].brand || all[index].generic || id, command: process.execPath, args: [path.join(frontendPath, "scripts", "medlens-ai-editor.cjs"), "--drug", id, "--input", input, "--output", output], cwd: frontendPath });
      const edited = JSON.parse(await fs.promises.readFile(output, "utf8")); all[index] = normalize({ ...all[index], ...(edited[0] || edited), status: "in_review", updatedAt: new Date().toISOString() }, "in_review");
      await writeCollection("medlensDrugQueue", all);
      setProgress(id, { status: "done", percent: 100, completed: aiSections.length, total: aiSections.length, step: "Complete", drugName: all[index].brand || all[index].generic || id, error: "", expiresAt: new Date(Date.now() + progressRetentionMs).toISOString() });
      res.json({ ok: true, item: all[index] });
    } catch (error) {
      setProgress(id, { status: "failed", percent: aiProgress.get(id)?.percent || 0, completed: aiProgress.get(id)?.completed || 0, total: aiSections.length, step: "AI editor failed", error: error.message || "unknown error", expiresAt: new Date(Date.now() + progressRetentionMs).toISOString() });
      res.status(502).json({ error: "AI editing failed: " + (error.message || "unknown error") });
    }
    finally { await fs.promises.rm(input, { force: true }).catch(() => {}); await fs.promises.rm(output, { force: true }).catch(() => {}); }
  }));
  router.post("/api/admin/medlens/drugs/:drugId/:action", wrap(async (req, res) => {
    if (!admin(req, config)) return res.status(403).json({ error: "Forbidden" });
    const action = String(req.params.action); if (!["publish", "reject", "unpublish", "requeue"].includes(action)) return res.status(404).json({ error: "Unknown action" });
    const all = await getQueue(frontendPath); const index = all.findIndex((x) => x.id === String(req.params.drugId));
    if (index < 0) return res.status(404).json({ error: "Drug not found" });
    const currentStatus = all[index].status;
    const allowed = action === "publish" ? currentStatus === "in_review" : action === "reject" ? currentStatus === "in_review" : action === "requeue" ? currentStatus === "rejected" : currentStatus === "published";
    if (!allowed) return res.status(409).json({ error: "This status transition is not allowed." });
    all[index] = normalize({ ...all[index], updatedAt: new Date().toISOString(), status: action === "publish" ? "published" : action === "requeue" ? "fetched" : "rejected" }); await writeCollection("medlensDrugQueue", all); res.json({ ok: true, item: all[index] });
  }));
  return router;
}



