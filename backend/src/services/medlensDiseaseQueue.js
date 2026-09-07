import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import { spawn } from "node:child_process";
import express from "express";
import { readCollection, writeCollection } from "../store.js";

const randomDiseaseCandidates = ["asthma","diabetes mellitus","hypertension","malaria","pneumonia","tuberculosis","migraine","epilepsy","heart failure","chronic obstructive pulmonary disease","peptic ulcer disease","osteoarthritis","rheumatoid arthritis","sickle cell disease","gastroesophageal reflux disease","hepatitis B","hepatitis C","HIV/AIDS","influenza","meningitis","stroke","acute kidney injury","chronic kidney disease","iron deficiency anemia","thyroid disease"];
const sections = ["Overview", "Causes & Risk Factors", "Clinical Presentation", "Diagnosis", "Treatment & Management", "Complications", "Prevention", "Patient Education", "Clinical Evidence"];
const progress = new Map();
const clean = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const admin = (req, config) => Boolean(config.adminKey && req.headers["x-admin-key"] === config.adminKey);
const normalize = (raw, fallback = "fetched") => {
  const now = new Date().toISOString();
  const name = String(raw.name || raw.title || raw.id || "Disease").trim();
  return { ...raw, id: String(raw.id || clean(name)), name, category: String(raw.category || "Disease"), icon: raw.icon || "&#x2695;", source: String(raw.sourceProvider || raw.source || "Wikipedia"), sourceUrl: String(raw.sourceUrl || ""), status: ["fetched", "in_review", "published", "rejected"].includes(raw.status) ? raw.status : fallback, createdAt: String(raw.createdAt || raw.fetchedAt || now), updatedAt: String(raw.updatedAt || raw.createdAt || raw.fetchedAt || now) };
};
function parseSource(content) {
  const entries = {};
  const regex = /window\.MEDLENS_DISEASE_DATABASE\[(?:"([^"]+)"|'([^']+)')\]\s*=\s*({[\s\S]*?})\s*;/g;
  let match;
  while ((match = regex.exec(content))) entries[match[1] || match[2]] = JSON.parse(match[3]);
  return entries;
}
async function sourceEntries(frontendPath) {
  const file = path.join(frontendPath, "www", "medlens-disease-database.js");
  return parseSource(await fs.readFile(file, "utf8"));
}
async function fetchWikipediaDisease(term) {
  const endpoint = "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&redirects=1&titles=" + encodeURIComponent(term) + "&format=json&origin=*";
  const response = await fetch(endpoint, { headers: { Accept: "application/json", "User-Agent": "MedLens/1.0 disease fetcher" } });
  if (!response.ok) return null;
  const json = await response.json();
  const page = Object.values(json?.query?.pages || {})[0] || {};
  if (page.missing || !page.extract) return null;
  const title = String(page.title || term).trim();
  return normalize({ id: clean(title), name: title, category: "Disease", sourceProvider: "Wikipedia MediaWiki API", sourceUrl: "https://en.wikipedia.org/wiki/" + encodeURIComponent(title.replace(/ /g, "_")), rawSources: [{ provider: "Wikipedia", title, sourceText: String(page.extract).trim() }], overview: "<p>" + String(page.extract).split(/\\n\\n/)[0].slice(0, 700) + "</p>", status: "fetched" }, "fetched");
}
async function getQueue(frontendPath) {
  const stored = await readCollection("medlensDiseaseQueue");
  if (stored.length) return stored;
  const source = await sourceEntries(frontendPath).catch(() => ({}));
  const seeded = Object.values(source).map((item) => normalize(item, "published"));
  if (seeded.length) await writeCollection("medlensDiseaseQueue", seeded);
  return seeded;
}
function runEditor({ id, name, command, args, cwd }) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, env: process.env, stdio: ["ignore", "pipe", "pipe"] });
    let output = ""; let error = "";
    const update = () => {
      const completed = sections.filter((label) => output.includes(`${label}... done`)).length;
      const current = sections.find((label) => output.includes(`${label}...`) && !output.includes(`${label}... done`));
      progress.set(id, { status: "running", percent: Math.round(completed / sections.length * 100), completed, total: sections.length, step: current ? `${current}...` : completed ? `${sections[Math.min(completed - 1, sections.length - 1)]}...done` : "Starting AI editor...", drugName: name, error: "" });
    };
    child.stdout.on("data", (chunk) => { output += chunk.toString(); update(); });
    child.stderr.on("data", (chunk) => { error += chunk.toString(); });
    child.on("error", reject);
    child.on("close", (code) => code === 0 ? resolve() : reject(new Error(error.trim() || `AI editor exited with code ${code}.`)));
  });
}
export function createMedLensDiseaseRouter({ config, frontendPath }) {
  const router = express.Router();
  router.get("/api/medlens/diseases", async (_req, res) => { const items = (await getQueue(frontendPath)).map((x) => normalize(x)).filter((x) => x.status === "published"); res.json({ ok: true, total: items.length, items }); });
  router.get("/api/admin/medlens/diseases/:diseaseId/progress", async (req, res) => { if (!admin(req, config)) return res.status(403).json({ error: "Forbidden" }); const id = String(req.params.diseaseId); res.json({ ok: true, progress: progress.get(id) || { status: "idle", percent: 0, completed: 0, total: sections.length, step: "Not running", error: "" } }); });
  router.get("/api/admin/medlens/diseases", async (req, res) => { if (!admin(req, config)) return res.status(403).json({ error: "Forbidden" }); const all = (await getQueue(frontendPath)).map((x) => normalize(x)); const filter = String(req.query.status || "all").toLowerCase(); const items = all.filter((x) => filter === "all" || x.status === filter); res.json({ ok: true, total: items.length, items, summary: Object.fromEntries(["fetched", "in_review", "published", "rejected"].map((s) => [s, all.filter((x) => x.status === s).length])) }); });
  router.post("/api/admin/medlens/diseases/fetch", async (req, res) => { if (!admin(req, config)) return res.status(403).json({ error: "Forbidden" }); const all = await getQueue(frontendPath); const source = await sourceEntries(frontendPath).catch(() => ({})); const requestedCount = Math.max(1, Math.min(Number(req.body?.count) || 10, 50)); let terms = (Array.isArray(req.body?.terms) ? req.body.terms : String(req.body?.terms || "").split(/[,\n]/)).map((x) => String(x).trim()).filter(Boolean).slice(0, 50); if (req.body?.random) { const existing = new Set(all.map((x) => clean(x.id || x.name))); const candidates = [...Object.values(source).map((x) => x.name || x.title || x.id), ...randomDiseaseCandidates].map((x) => String(x).trim()).filter(Boolean); terms = [...new Set(candidates.map((x) => [x, clean(x)]))].filter(([, id]) => !existing.has(id)).sort(() => Math.random() - 0.5).slice(0, requestedCount).map(([name]) => name); } if (!terms.length) return res.status(400).json({ error: "No unused disease records are available." }); const fetched = []; const duplicates = []; const notFound = []; for (const term of terms) { const found = Object.values(source).find((x) => String(x.id).toLowerCase() === clean(term) || String(x.name).toLowerCase() === term.toLowerCase() || String(x.name).toLowerCase().includes(term.toLowerCase())) || await fetchWikipediaDisease(term); if (!found) { notFound.push(term); continue; } if (all.some((x) => clean(x.id || x.name) === clean(found.id || found.name))) { duplicates.push(term); continue; } const item = normalize({ ...found, status: "fetched", createdAt: new Date().toISOString() }); all.push(item); fetched.push(item); } await writeCollection("medlensDiseaseQueue", all); res.json({ ok: true, fetched, duplicates, notFound, total: fetched.length }); });
  router.post("/api/admin/medlens/diseases/:diseaseId/ai-edit", async (req, res) => { if (!admin(req, config)) return res.status(403).json({ error: "Forbidden" }); const id = String(req.params.diseaseId); const all = await getQueue(frontendPath); const index = all.findIndex((x) => x.id === id); if (index < 0) return res.status(404).json({ error: "Disease not found" }); if (!["fetched", "rejected"].includes(all[index].status)) return res.status(409).json({ error: "Only fetched or rejected diseases can be AI edited." }); if (progress.get(id)?.status === "running") return res.status(409).json({ error: "AI editing is already running for this disease." }); const input = path.join(os.tmpdir(), `ajix-medlens-disease-${crypto.randomUUID()}.js`); const output = path.join(os.tmpdir(), `ajix-medlens-disease-${crypto.randomUUID()}.json`); progress.set(id, { status: "running", percent: 0, completed: 0, total: sections.length, step: "Starting AI editor...", drugName: all[index].name, error: "" }); try { const source = `window.MEDLENS_DISEASE_DATABASE = window.MEDLENS_DISEASE_DATABASE || {};\nwindow.MEDLENS_DISEASE_DATABASE[${JSON.stringify(id)}] = ${JSON.stringify(all[index], null, 2)};\n`; await fs.writeFile(input, source, "utf8"); await runEditor({ id, name: all[index].name, command: process.execPath, args: [path.join(frontendPath, "scripts", "medlens-disease-ai-editor.cjs"), "--disease", id, "--source", input, "--output", output], cwd: frontendPath }); const edited = JSON.parse(await fs.readFile(output, "utf8")); all[index] = normalize({ ...all[index], ...(edited[0] || edited), status: "in_review", updatedAt: new Date().toISOString() }, "in_review"); await writeCollection("medlensDiseaseQueue", all); progress.set(id, { status: "done", percent: 100, completed: sections.length, total: sections.length, step: "Complete", drugName: all[index].name, error: "" }); res.json({ ok: true, item: all[index] }); } catch (error) { progress.set(id, { status: "failed", percent: progress.get(id)?.percent || 0, completed: progress.get(id)?.completed || 0, total: sections.length, step: "AI editor failed", drugName: all[index].name, error: error.message || "unknown error" }); res.status(502).json({ error: "AI editing failed: " + (error.message || "unknown error") }); } finally { await fs.rm(input, { force: true }).catch(() => {}); await fs.rm(output, { force: true }).catch(() => {}); } });
  router.post("/api/admin/medlens/diseases/:diseaseId/:action", async (req, res) => { if (!admin(req, config)) return res.status(403).json({ error: "Forbidden" }); const action = String(req.params.action); if (!["publish", "reject", "unpublish", "requeue"].includes(action)) return res.status(404).json({ error: "Unknown action" }); const all = await getQueue(frontendPath); const index = all.findIndex((x) => x.id === String(req.params.diseaseId)); if (index < 0) return res.status(404).json({ error: "Disease not found" }); const status = all[index].status; const allowed = action === "publish" ? status === "in_review" : action === "reject" ? status === "in_review" : action === "requeue" ? status === "rejected" : status === "published"; if (!allowed) return res.status(409).json({ error: "This status transition is not allowed." }); all[index] = normalize({ ...all[index], updatedAt: new Date().toISOString(), status: action === "publish" ? "published" : action === "requeue" ? "fetched" : "rejected" }); await writeCollection("medlensDiseaseQueue", all); res.json({ ok: true, item: all[index] }); });
  return router;
}