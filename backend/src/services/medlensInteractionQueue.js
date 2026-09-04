import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import { spawn } from "node:child_process";
import express from "express";
import vm from "node:vm";
import { readCollection, writeCollection } from "../store.js";
const progress = new Map();
const statuses = ["fetched", "in_review", "published", "rejected"];
const clean = (v) => String(v || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const admin = (req, config) => Boolean(config.adminKey && req.headers["x-admin-key"] === config.adminKey);
const normalize = (raw, fallback = "fetched") => { const now = new Date().toISOString(); const drugs = Array.isArray(raw.drugs) ? raw.drugs.map((x) => String(x || "").trim()).filter(Boolean) : []; return { ...raw, id: String(raw.id || drugs.map(clean).sort().join("__")), drugs, severity: String(raw.severity || "unknown").toLowerCase() === "unknown" ? inferInteractionSeverity(raw.sourceText || raw.evidence || raw.clinicalConcern) : raw.severity, source: String(raw.source || raw.sourceUrl || "MedLens interaction source"), status: statuses.includes(raw.status) ? raw.status : fallback, createdAt: String(raw.createdAt || raw.extractedAt || now), updatedAt: String(raw.updatedAt || raw.createdAt || raw.extractedAt || now) }; };
function parseSource(content) { const sandbox = { window: { MEDLENS_INTERACTIONS_DATABASE: {} } }; vm.runInNewContext(content, sandbox, { timeout: 1000 }); return sandbox.window.MEDLENS_INTERACTIONS_DATABASE || {}; }
function inferInteractionSeverity(value) { const text = String(value || "").toLowerCase(); if (["contraindicated", "do not use", "avoid concomitant", "boxed warning"].some((term) => text.includes(term))) return "contraindicated"; if (["life-threatening", "fatal", "serious toxicity", "significantly increase", "significantly decrease"].some((term) => text.includes(term))) return "major"; if (["monitor closely", "monitor", "caution", "increase the risk", "decrease the effect"].some((term) => text.includes(term))) return "moderate"; if (["mild", "minor"].some((term) => text.includes(term))) return "minor"; return "unknown"; }
async function fetchLiveLabel(term) {
  const q = encodeURIComponent('openfda.generic_name:"' + String(term).replace(/"/g, '') + '"');
  const response = await fetch('https://api.fda.gov/drug/label.json?search=' + q + '&limit=1', { headers: { Accept: 'application/json' } });
  if (!response.ok) return null;
  const result = (await response.json())?.results?.[0];
  if (!result) return null;
  const sections = ['boxed_warning', 'warnings', 'contraindications', 'drug_interactions', 'precautions'];
  const sourceText = sections.flatMap((key) => Array.isArray(result[key]) ? result[key] : []).join('\n\n').trim();
  if (!sourceText) return null;
  const name = result.openfda?.generic_name?.[0] || result.openfda?.brand_name?.[0] || term;
  return { name: String(name).trim(), sourceText, url: 'https://api.fda.gov/drug/label.json?search=' + q + '&limit=1' };
}
const liveInteractionCandidates = [
  ['warfarin', 'aspirin'], ['warfarin', 'ibuprofen'], ['lisinopril', 'aliskiren'],
  ['simvastatin', 'clarithromycin'], ['sildenafil', 'nitroglycerin'], ['metformin', 'alcohol'],
  ['fluoxetine', 'linezolid'], ['digoxin', 'amiodarone'], ['methotrexate', 'trimethoprim'],
  ['clopidogrel', 'omeprazole'], ['apixaban', 'ketoconazole'], ['lithium', 'ibuprofen'],
  ['potassium chloride', 'spironolactone'], ['ciprofloxacin', 'tizanidine'], ['theophylline', 'ciprofloxacin']
];async function sourceEntries(frontendPath) { return parseSource(await fs.readFile(path.join(frontendPath, "www", "medlens-interactions-database.js"), "utf8")); }
async function getQueue(frontendPath) { const stored = await readCollection("medlensInteractionQueue"); if (stored.length) return stored; const source = await sourceEntries(frontendPath).catch(() => ({})); const seeded = Object.values(source).map((x) => normalize(x, "published")); if (seeded.length) await writeCollection("medlensInteractionQueue", seeded); return seeded; }
function runEditor({ id, name, command, args, cwd }) { return new Promise((resolve, reject) => { const child = spawn(command, args, { cwd, env: process.env, stdio: ["ignore", "pipe", "pipe"] }); let error = ""; child.stdout.on("data", () => progress.set(id, { status: "running", percent: 50, completed: 1, total: 1, step: "Editing interaction card...", drugName: name, error: "" })); child.stderr.on("data", (x) => { error += x.toString(); }); child.on("error", reject); child.on("close", (code) => code === 0 ? resolve() : reject(new Error(error.trim() || `AI editor exited with code ${code}.`))); }); }
export function createMedLensInteractionRouter({ config, frontendPath }) { const router = express.Router();
  router.get("/api/medlens/interactions", async (_req, res) => { const items = (await getQueue(frontendPath)).map((x) => normalize(x)).filter((x) => x.status === "published"); res.json({ ok: true, total: items.length, items }); });
  router.get("/api/admin/medlens/interactions/:interactionId/progress", async (req, res) => { if (!admin(req, config)) return res.status(403).json({ error: "Forbidden" }); const id = String(req.params.interactionId); res.json({ ok: true, progress: progress.get(id) || { status: "idle", percent: 0, completed: 0, total: 1, step: "Not running", error: "" } }); });
  router.get("/api/admin/medlens/interactions", async (req, res) => { if (!admin(req, config)) return res.status(403).json({ error: "Forbidden" }); const all = (await getQueue(frontendPath)).map((x) => normalize(x)); const filter = String(req.query.status || "all").toLowerCase(); const items = all.filter((x) => filter === "all" || x.status === filter); res.json({ ok: true, total: items.length, items, summary: Object.fromEntries(statuses.map((s) => [s, all.filter((x) => x.status === s).length])) }); });
  router.post("/api/admin/medlens/interactions/fetch", async (req, res) => {
    if (!admin(req, config)) return res.status(403).json({ error: "Forbidden" });
    const all = await getQueue(frontendPath);
    const source = await sourceEntries(frontendPath).catch(() => ({}));
    const requestedCount = Math.max(1, Math.min(Number(req.body?.count) || 10, 50));
    let terms = (Array.isArray(req.body?.terms) ? req.body.terms : String(req.body?.terms || "").split(/[,\n]/)).map((x) => String(x).trim()).filter(Boolean).slice(0, 50);
    if (req.body?.random) {
      const existing = new Set(all.map((x) => String(x.id)));
      terms = liveInteractionCandidates
        .map((pair) => ({ pair, id: pair.map(clean).sort().join("__") }))
        .filter((x) => !existing.has(x.id))
        .sort(() => Math.random() - 0.5)
        .slice(0, requestedCount)
        .map((x) => x.pair.join(" + "));
    }
    if (!terms.length) return res.status(400).json({ error: "No unused interaction records are available." });
    const fetched = [];
    const duplicates = [];
    const notFound = [];
    for (const term of terms) {
      const needle = term.toLowerCase();
      const found = Object.values(source).find((x) => x.id.toLowerCase() === clean(term) || x.drugs.join(" + ").toLowerCase() === needle || x.drugs.slice().reverse().join(" + ").toLowerCase() === needle || x.drugs.some((d) => d.toLowerCase() === needle));
      if (found) {
        if (all.some((x) => x.id === found.id)) { duplicates.push(term); continue; }
        const item = normalize({ ...found, status: "fetched", createdAt: new Date().toISOString() });
        all.push(item); fetched.push(item); continue;
      }
      const parts = term.split(/\s+\+\s+|\s+&\s+|\s+\band\b\s+/i).map((x) => x.trim()).filter(Boolean).slice(0, 2);
      if (parts.length !== 2) { notFound.push(term); continue; }
      const labels = await Promise.all(parts.map((part) => fetchLiveLabel(part).catch(() => null)));
      const usable = labels.filter(Boolean);
      if (!usable.length) { notFound.push(term); continue; }
      const drugs = usable.map((label, index) => label.name || parts[index]);
      const id = drugs.map(clean).sort().join("__");
      if (all.some((x) => x.id === id)) { duplicates.push(term); continue; }
      const sourceText = usable.map((label) => label.name + ": " + label.sourceText).join('\n\n');
      const item = normalize({
        id,
        drugs,
        type: "live-label",
        severity: inferInteractionSeverity(sourceText),
        sourceType: "openFDA live label",
        clinicalConcern: "Source label interaction and warning text requires AI structuring.",
        mechanism: "",
        management: "",
        monitoring: "",
        counseling: "",
        evidence: sourceText,
        sourceText,
        source: "openFDA",
        sourceUrl: usable.map((label) => label.url).join(" | "),
        needsReview: true,
        status: "fetched",
        createdAt: new Date().toISOString()
      });
      all.push(item); fetched.push(item);
    }
    await writeCollection("medlensInteractionQueue", all);
    res.json({ ok: true, fetched, duplicates, notFound, total: fetched.length });
  });  router.post("/api/admin/medlens/interactions/:interactionId/ai-edit", async (req,res)=>{if(!admin(req,config))return res.status(403).json({error:"Forbidden"});const id=String(req.params.interactionId);const all=await getQueue(frontendPath);const index=all.findIndex((x)=>x.id===id);if(index<0)return res.status(404).json({error:"Interaction not found"});if(!["fetched","rejected"].includes(all[index].status))return res.status(409).json({error:"Only fetched or rejected interactions can be AI edited."});if(progress.get(id)?.status==="running")return res.status(409).json({error:"AI editing is already running for this interaction."});const input=path.join(os.tmpdir(),`ajix-medlens-interaction-${crypto.randomUUID()}.js`);const output=path.join(os.tmpdir(),`ajix-medlens-interaction-${crypto.randomUUID()}.json`);progress.set(id,{status:"running",percent:0,completed:0,total:1,step:"Starting AI editor...",drugName:all[index].drugs.join(" + "),error:""});try{const source=`window.MEDLENS_INTERACTIONS_DATABASE = window.MEDLENS_INTERACTIONS_DATABASE || {};
window.MEDLENS_INTERACTIONS_DATABASE[${JSON.stringify(id)}] = ${JSON.stringify(all[index],null,2)};
`;await fs.writeFile(input,source,"utf8");await runEditor({id,name:all[index].drugs.join(" + "),command:process.execPath,args:[path.join(frontendPath,"scripts","medlens-interactions-ai-editor.cjs"),"--pair",all[index].drugs.join(" + "),"--source",input,"--output",output],cwd:frontendPath});const edited=JSON.parse(await fs.readFile(output,"utf8"));all[index]=normalize({...all[index],...(edited[0]||edited),status:"in_review",updatedAt:new Date().toISOString()},"in_review");await writeCollection("medlensInteractionQueue",all);progress.set(id,{status:"done",percent:100,completed:1,total:1,step:"Complete",drugName:all[index].drugs.join(" + "),error:""});res.json({ok:true,item:all[index]})}catch(error){progress.set(id,{status:"failed",percent:progress.get(id)?.percent||0,completed:0,total:1,step:"AI editor failed",drugName:all[index].drugs.join(" + "),error:error.message||"unknown error"});res.status(502).json({error:"AI editing failed: "+(error.message||"unknown error")})}finally{await fs.rm(input,{force:true}).catch(()=>{});await fs.rm(output,{force:true}).catch(()=>{})}});
  router.post("/api/admin/medlens/interactions/:interactionId/:action", async(req,res)=>{if(!admin(req,config))return res.status(403).json({error:"Forbidden"});const action=String(req.params.action);if(!["publish","reject","unpublish","requeue"].includes(action))return res.status(404).json({error:"Unknown action"});const all=await getQueue(frontendPath);const index=all.findIndex((x)=>x.id===String(req.params.interactionId));if(index<0)return res.status(404).json({error:"Interaction not found"});const current=all[index].status;const allowed=action==="publish"?current==="in_review":action==="reject"?current==="in_review":action==="requeue"?current==="rejected":current==="published";if(!allowed)return res.status(409).json({error:"This status transition is not allowed."});all[index]=normalize({...all[index],updatedAt:new Date().toISOString(),status:action==="publish"?"published":action==="requeue"?"fetched":"rejected"});await writeCollection("medlensInteractionQueue",all);res.json({ok:true,item:all[index]})}); return router; }