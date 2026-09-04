import crypto from "node:crypto";
import express from "express";
import { readCollection, writeCollection } from "../store.js";

const INITIAL_GUIDELINES = [
  { id: "gina-asthma", title: "GINA 2026: Asthma Management & Pharmacotherapy", source: "GINA", year: "2026", category: "respiratory", condition: "Asthma", specialty: "Respiratory Medicine", desc: "Global strategy for diagnosis, symptom control, Track 1 and Track 2 pharmacotherapy, step-down planning, and severe asthma management." },
  { id: "aha-hypertension", title: "AHA/ACC 2025: High Blood Pressure Guideline", source: "AHA/ACC", year: "2025", category: "cardiovascular", condition: "Hypertension", specialty: "Cardiology", desc: "Diagnosis, PREVENT-based risk assessment, blood pressure targets, lifestyle therapy, first-line antihypertensives, resistant hypertension, pregnancy, and crisis management." },
  { id: "ada-diabetes", title: "ADA 2026: Diabetes Mellitus Management & Pharmacotherapy", source: "ADA", year: "2026", category: "endocrine", condition: "Diabetes Mellitus", specialty: "Endocrinology", desc: "Diagnosis, glycemic targets, lifestyle therapy, cardiorenal risk reduction, insulin, hypoglycemia, diabetes technology, and follow-up." },
  { id: "gold-copd", title: "GOLD 2026: COPD Management & Pharmacotherapy", source: "GOLD", year: "2026", category: "respiratory", condition: "COPD", specialty: "Respiratory Medicine", desc: "Global strategy for COPD diagnosis, ABE grouping, bronchodilator-first treatment, eosinophil-guided ICS use, and exacerbation care." },
  { id: "idsa-pneumonia", title: "ATS/IDSA 2025: Community-Acquired Pneumonia", source: "IDSA/ATS", year: "2025", category: "infectious", condition: "Community-Acquired Pneumonia", specialty: "Infectious Diseases", desc: "Diagnosis, severity assessment, empiric antibiotics, resistant pathogens, viral-positive CAP, corticosteroids, duration, complications, and follow-up." },
  { id: "esc-heart-failure", title: "ESC 2026: Heart Failure Management & Pharmacotherapy", source: "ESC", year: "2026", category: "cardiovascular", condition: "Heart Failure", specialty: "Cardiology", desc: "Prevention, staging, LVEF phenotypes, foundational HFrEF therapy, HFpEF management, decompensation care, devices, advanced HF, and follow-up." },
];
const STATUSES = ["fetched", "manual_feed", "draft", "in_review", "published", "rejected"];
const APPROVED_SOURCE_DOMAINS = ["kdigo.org", "ginasthma.org", "goldcopd.org", "diabetes.org", "heart.org", "escardio.org", "idsociety.org", "nice.org.uk"];
function canonicalSourceUrl(value) {
  try {
    const url = new URL(clean(value));
    if (!["http:", "https:"].includes(url.protocol)) return "";
    url.hash = "";
    url.hostname = url.hostname.toLowerCase();
    if ((url.protocol === "http:" && url.port === "80") || (url.protocol === "https:" && url.port === "443")) url.port = "";
    if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, "");
    return url.href;
  } catch {
    return "";
  }
}

function isApprovedSourceUrl(value) {
  try {
    const hostname = new URL(value).hostname.toLowerCase().replace(/^www\./, "");
    return APPROVED_SOURCE_DOMAINS.some((domain) => hostname === domain || hostname.endsWith("." + domain));
  } catch {
    return false;
  }
}

const clean = (value) => String(value || "").trim();
const admin = (req, config) => Boolean(config.adminKey && req.headers["x-admin-key"] === config.adminKey);
async function fetchOpenAiWithRetry(url, options) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await fetch(url, { ...options, signal: AbortSignal.timeout(180000) });
    } catch (error) {
      lastError = error;
      const code = error?.cause?.code || error?.code;
      if (attempt < 2 && (["ECONNRESET", "ECONNREFUSED", "ETIMEDOUT", "UND_ERR_CONNECT_TIMEOUT"].includes(code) || error?.message === "fetch failed")) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }
      throw new Error(code === "ECONNRESET" ? "The AI provider closed the connection. Please try AI Edit again." : error.message || "Unable to connect to the AI provider.");
    }
  }
  throw lastError || new Error("Unable to connect to the AI provider.");
}
function sanitizeAiHtml(value) {
  return String(value || "")
    .replace(/<\/?(?:script|style|iframe|object|embed)[^>]*>[\s\S]*?<\/?(?:script|style|iframe|object|embed)>/gi, "")
    .replace(/<(?!(?:\/?(?:p|br|strong|b|em|i|u|ul|ol|li|blockquote|a|table|thead|tbody|tr|td|th|img|figure|figcaption|h1|h2|h3|h4|h5|h6|div|span|colgroup|col))(?:\s|>))[^>]*>/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*(['"])[\s\S]*?\1/gi, "")
    .replace(/\s+(?:href|src)\s*=\s*(['"])\s*(?:javascript:|data:)[\s\S]*?\1/gi, "");
}

function removeAttentionLabels(value) {
  return String(value || "").replace(/(<blockquote\b[^>]*class=["\x27][^"\x27]*attention-card[^"\x27]*["\x27][^>]*>\s*)(?:(?:<(?:strong|b|span)[^>]*>\s*)?)(?:critical(?=\s|:|in\b)|important|warning|caution|key notice)\s*:?[ ]*(?:<\/(?:strong|b|span)>\s*)?/i, "$1");
}

function sourceHtmlContext(sourceHtml, sourceUrl) {
  const stripMarkup = (value) => String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
  const links = [...sourceHtml.matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .map((match) => {
      try {
        const href = new URL(match[1], sourceUrl).href;
        return { href, text: stripMarkup(match[2]).slice(0, 180) };
      } catch {
        return null;
      }
    })
    .filter((link) => link && /^https?:\/\//i.test(link.href))
    .slice(0, 40);
  const tables = [...sourceHtml.matchAll(/<table\b[\s\S]*?<\/table>/gi)]
    .map((match) => stripMarkup(match[0]).slice(0, 3000))
    .filter(Boolean)
    .slice(0, 10);
  return { links, tables };
}

function normalize(raw = {}, fallback = "draft") {
  const now = new Date().toISOString();
  const title = clean(raw.title || raw.name) || "Untitled guideline";
  const sections = raw.sections && typeof raw.sections === "object" ? raw.sections : {};
  return {
    ...raw,
    id: String(raw.id || crypto.randomUUID()),
    title,
    condition: clean(raw.condition),
    specialty: clean(raw.specialty),
    org: clean(raw.org || raw.organization || raw.source || "AjiX Internal"),
    organization: clean(raw.organization || raw.org || raw.source || "AjiX Internal"),
    entryType: raw.entryType === "Live Source" ? "Live Source" : "Manual Entry",
    version: clean(raw.version || "v1.0"),
    source: clean(raw.source || raw.sourceUrl),
    sourceUrl: clean(raw.sourceUrl),
    sections,
    status: STATUSES.includes(raw.status) ? raw.status : fallback,
    createdAt: clean(raw.createdAt) || now,
    updatedAt: clean(raw.updatedAt) || now,
    activity: clean(raw.activity || raw.updatedAt || raw.createdAt) || now,
  };
}

async function getQueue() {
  let recovered = false;
  const cutoff = Date.now() - 3 * 60 * 1000;
  const stored = (await readCollection("guidelineQueue")).map((item) => {
    const normalized = normalize(item, item.status || "draft");
    const process = normalized.aiProcess;
    if (process?.status === "processing" && Date.parse(process.startedAt || 0) < cutoff) {
      recovered = true;
      const now = new Date().toISOString();
      return normalize({ ...normalized, aiProcess: { ...process, status: "failed", completedAt: now, error: "Processing stopped before completion. You can run AI Edit again." }, updatedAt: now, activity: now }, normalized.status);
    }
    return normalized;
  });
  if (recovered && stored.length) await writeCollection("guidelineQueue", stored);
  if (stored.length) return stored;
  const seeded = INITIAL_GUIDELINES.map((item) => normalize({
    ...item,
    entryType: "Manual Entry",
    version: "v" + item.year,
    sourceUrl: "",
    source: item.source,
    sections: { overview: "<p>" + item.desc + "</p>" },
    status: "published",
  }, "published"));
  await writeCollection("guidelineQueue", seeded);
  return seeded;
}

function summary(items) {
  return Object.fromEntries(["fetched", "manual_feed", "draft", "in_review", "published", "rejected"].map((status) => [status, items.filter((item) => item.status === status).length]));
}

function updateItem(items, id, mutate) {
  const index = items.findIndex((item) => item.id === id);
  if (index < 0) return null;
  items[index] = normalize(mutate(items[index]), items[index].status);
  return items[index];
}

export function createGuidelineRouter({ config }) {
  const router = express.Router();

  router.get("/api/guidelines", async (_req, res) => {
    const items = (await getQueue()).filter((item) => item.status === "published");
    res.json({ ok: true, total: items.length, items });
  });

  router.get("/api/admin/guidelines", async (req, res) => {
    if (!admin(req, config)) return res.status(403).json({ error: "Forbidden" });
    const all = await getQueue();
    const status = clean(req.query.status || "all").toLowerCase();
    const items = status === "all" ? all : all.filter((item) => item.status === status);
    res.json({ ok: true, total: items.length, items, summary: summary(all) });
  });

  router.post("/api/admin/guidelines/fetch", async (req, res) => {
    if (!admin(req, config)) return res.status(403).json({ error: "Forbidden" });
    const terms = Array.isArray(req.body?.terms)
      ? req.body.terms
      : String(req.body?.terms || "").split(/[\n,]+/);
    const values = terms.map((value) => clean(value)).filter(Boolean).slice(0, 20);
    if (!values.length) return res.status(400).json({ error: "Enter at least one approved guideline source URL." });

    const requested = values.map((value) => ({ value, sourceUrl: canonicalSourceUrl(value) }));
    const invalid = requested.filter((entry) => !entry.sourceUrl || !isApprovedSourceUrl(entry.sourceUrl));
    if (invalid.length) {
      return res.status(400).json({
        error: "Use valid HTTP(S) URLs from an approved guideline source.",
        invalid: invalid.map((entry) => entry.value),
      });
    }

    const all = await getQueue();
    const existingUrls = new Set(all.map((item) => canonicalSourceUrl(item.sourceUrl)).filter(Boolean));
    const requestedUrls = new Set();
    const created = [];
    const skipped = [];

    for (const entry of requested) {
      if (existingUrls.has(entry.sourceUrl) || requestedUrls.has(entry.sourceUrl)) {
        skipped.push(entry.sourceUrl);
        continue;
      }
      const sourceUrl = new URL(entry.sourceUrl);
      const title = sourceUrl.hostname.replace(/^www\./, "") + (sourceUrl.pathname && sourceUrl.pathname !== "/" ? sourceUrl.pathname.replace(/\/+$/, "") : "");
      const item = normalize({
        id: crypto.randomUUID(),
        title,
        org: sourceUrl.hostname.replace(/^www\./, ""),
        organization: sourceUrl.hostname.replace(/^www\./, ""),
        source: sourceUrl.href,
        sourceUrl: sourceUrl.href,
        entryType: "Live Source",
        version: "Pending review",
        condition: "Clinical guidance",
        specialty: "General Medicine",
        desc: "Fetched from a connected live source and awaiting editorial review.",
        sections: { overview: `<p>Source record fetched for editorial review: <a href="${sourceUrl.href}">${sourceUrl.href}</a></p>` },
        status: "fetched",
      }, "fetched");
      all.push(item);
      existingUrls.add(entry.sourceUrl);
      requestedUrls.add(entry.sourceUrl);
      created.push(item);
    }

    if (created.length) await writeCollection("guidelineQueue", all);
    res.status(created.length ? 201 : 200).json({ ok: true, total: created.length, skipped: skipped.length, items: created });
  });
  router.post("/api/admin/guidelines/manual", async (req, res) => {
    if (!admin(req, config)) return res.status(403).json({ error: "Forbidden" });
    const item = normalize({ ...req.body, entryType: "Manual Entry" }, "draft");
    const all = await getQueue();
    all.push(item);
    await writeCollection("guidelineQueue", all);
    res.status(201).json({ ok: true, item });
  });

  router.post("/api/admin/guidelines/manual-feed", async (req, res) => {
    if (!admin(req, config)) return res.status(403).json({ error: "Forbidden" });
    const feed = clean(req.body?.content);
    if (!feed) return res.status(400).json({ error: "Paste guideline text or upload a supported text file." });
    if (feed.length > 100000) return res.status(413).json({ error: "The manual feed is too large. Limit it to 100,000 characters." });
    let sourceUrl = "";
    if (clean(req.body?.sourceUrl)) { sourceUrl = canonicalSourceUrl(req.body.sourceUrl); if (!sourceUrl) return res.status(400).json({ error: "The optional source URL is invalid." }); }
    const now = new Date().toISOString();
    const item = normalize({ id: crypto.randomUUID(), title: clean(req.body?.title) || clean(req.body?.fileName) || "Untitled manual feed", condition: clean(req.body?.condition), specialty: clean(req.body?.specialty), org: clean(req.body?.organization) || "AjiX Internal", organization: clean(req.body?.organization) || "AjiX Internal", version: clean(req.body?.version) || "Pending structure", source: sourceUrl || "Manual Feed", sourceUrl, entryType: "Manual Entry", description: "Raw manual guideline feed awaiting AI structure.", manualFeed: feed, manualFeedFileName: clean(req.body?.fileName), sections: {}, status: "manual_feed", createdAt: now, updatedAt: now, activity: now }, "manual_feed");
    const all = await getQueue(); all.push(item); await writeCollection("guidelineQueue", all);
    res.status(201).json({ ok: true, item });
  });
  router.put("/api/admin/guidelines/:id/manual-feed", async (req, res) => {
    if (!admin(req, config)) return res.status(403).json({ error: "Forbidden" });
    const all = await getQueue(); const index = all.findIndex((entry) => entry.id === String(req.params.id));
    if (index < 0) return res.status(404).json({ error: "Guideline not found" });
    if (all[index].status !== "manual_feed") return res.status(409).json({ error: "Only manual feeds can be edited here." });
    const feed = clean(req.body?.content);
    if (!feed) return res.status(400).json({ error: "The manual feed cannot be empty." });
    if (feed.length > 100000) return res.status(413).json({ error: "The manual feed is too large. Limit it to 100,000 characters." });
    let sourceUrl = "";
    if (clean(req.body?.sourceUrl)) { sourceUrl = canonicalSourceUrl(req.body.sourceUrl); if (!sourceUrl) return res.status(400).json({ error: "The optional source URL is invalid." }); }
    const now = new Date().toISOString();
    all[index] = normalize({ ...all[index], title: clean(req.body?.title) || all[index].title, condition: clean(req.body?.condition), specialty: clean(req.body?.specialty), org: clean(req.body?.organization) || all[index].org, organization: clean(req.body?.organization) || all[index].organization, version: clean(req.body?.version) || all[index].version, source: sourceUrl || "Manual Feed", sourceUrl, manualFeed: feed, manualFeedFileName: clean(req.body?.fileName) || all[index].manualFeedFileName, updatedAt: now, activity: now }, "manual_feed");
    await writeCollection("guidelineQueue", all); res.json({ ok: true, item: all[index] });
  });

  router.post("/api/admin/guidelines/manual-ai", async (req, res) => {
    if (!admin(req, config)) return res.status(403).json({ error: "Forbidden" });
    if (!config.openAiApiKey) return res.status(503).json({ error: "OpenAI is not configured." });

    const feed = clean(req.body?.content);
    const suppliedTitle = clean(req.body?.title);
    const suppliedSourceUrl = clean(req.body?.sourceUrl);
    const fileName = clean(req.body?.fileName);
    if (!feed) return res.status(400).json({ error: "Paste guideline text or upload a supported text file." });
    if (feed.length > 100000) return res.status(413).json({ error: "The manual feed is too large. Limit it to 100,000 characters." });

    let sourceUrl = "";
    if (suppliedSourceUrl) {
      sourceUrl = canonicalSourceUrl(suppliedSourceUrl);
      if (!sourceUrl) return res.status(400).json({ error: "The optional source URL is invalid." });
    }

    try {
      const sourceContext = sourceHtmlContext(feed, sourceUrl || "https://manual-feed.invalid/");
      const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + config.openAiApiKey },
        body: JSON.stringify({
          model: config.openAiModelPremium || "gpt-5-mini",
          max_completion_tokens: 6000,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: "You are a clinical guideline editor. Return only JSON with title, condition, specialty, org, version, and sections. sections must be an array of objects with title and safe HTML content. Use only supported HTML tags: p, br, strong, b, em, i, u, ul, ol, li, blockquote, a, table, thead, tbody, tr, td, th, img, figure, figcaption, h1, h2, h3, h4, h5, h6, div, span, colgroup, and col. Preserve useful links from sourceLinks as <a href=...>descriptive text</a>. Recreate supplied comparative, dosing, staging, criteria, or other tabular data as real HTML tables with thead, tbody, tr, th, and td. Use blockquote class=attention-card attention-key for key notices, attention-info for important information, attention-warning for warnings, and attention-caution for cautions, only where appropriate. Do not add a heading or label such as CRITICAL, IMPORTANT, WARNING, or CAUTION inside a callout; put only the informational text in the card. Structure the supplied feed faithfully, do not invent recommendations, and include references when present."
            },
            {
              role: "user",
              content: JSON.stringify({
                sourceUrl,
                fileName,
                existingTitle: suppliedTitle,
                requestedCondition: clean(req.body?.condition),
                requestedSpecialty: clean(req.body?.specialty),
                requestedOrganization: clean(req.body?.organization),
                requestedVersion: clean(req.body?.version),
                sourceText: feed,
                sourceLinks: sourceContext.links,
                sourceTables: sourceContext.tables
              })
            }
          ]
        })
      });
      const aiBody = await aiResponse.json();
      if (!aiResponse.ok) throw new Error(aiBody.error?.message || "AI processing failed.");
      const raw = aiBody.choices?.[0]?.message?.content || "";
      const edited = JSON.parse(raw.replace(/^\x60\x60\x60json\s*|\s*\x60\x60\x60$/g, ""));
      const sections = Array.isArray(edited.sections)
        ? edited.sections
            .filter((section) => section && clean(section.title))
            .map((section) => ({ id: crypto.randomUUID(), title: clean(section.title), content: removeAttentionLabels(sanitizeAiHtml(section.content || "")) }))
        : [];
      if (!sections.length) throw new Error("AI returned no usable guideline sections.");

      const item = normalize({
        id: crypto.randomUUID(),
        title: clean(edited.title) || suppliedTitle || "Manual AI guideline",
        condition: clean(edited.condition) || clean(req.body?.condition) || "Clinical guidance",
        specialty: clean(edited.specialty) || clean(req.body?.specialty) || "General Medicine",
        org: clean(edited.org) || clean(req.body?.organization) || "AjiX Internal",
        organization: clean(edited.org) || clean(req.body?.organization) || "AjiX Internal",
        version: clean(edited.version) || clean(req.body?.version) || "Pending review",
        source: sourceUrl || "Manual AI Feed",
        sourceUrl,
        entryType: "Manual Entry",
        description: "Structured from a manually supplied guideline feed and awaiting editorial review.",
        manualFeed: feed,
        manualFeedFileName: fileName,
        sections,
        status: "in_review"
      }, "in_review");

      const all = await getQueue();
      all.push(item);
      await writeCollection("guidelineQueue", all);
      res.status(201).json({ ok: true, item });
    } catch (error) {
      console.error("manual-guideline-ai-failed", error);
      res.status(502).json({ error: error.message || "Unable to structure the manual guideline feed." });
    }
  });
  router.post("/api/admin/guidelines/live", async (req, res) => {
    if (!admin(req, config)) return res.status(403).json({ error: "Forbidden" });
    const item = normalize({ ...req.body, entryType: "Live Source" }, "fetched");
    const all = await getQueue();
    all.push(item);
    await writeCollection("guidelineQueue", all);
    res.status(201).json({ ok: true, item });
  });

  router.post("/api/admin/guidelines/:id/ai-edit", async (req, res) => {
    if (!admin(req, config)) return res.status(403).json({ error: "Forbidden" });
    const all = await getQueue();
    const index = all.findIndex((entry) => entry.id === String(req.params.id));
    if (index < 0) return res.status(404).json({ error: "Guideline not found" });
    const current = all[index];
    if (!["fetched", "manual_feed"].includes(current.status)) return res.status(409).json({ error: "Only fetched guidelines or saved manual feeds can be AI edited." });
    if (!config.openAiApiKey) return res.status(503).json({ error: "OpenAI is not configured." });
    let sourceUrl = current.sourceUrl || "";
    if (current.status === "fetched") { try { sourceUrl = new URL(current.sourceUrl); } catch { return res.status(400).json({ error: "AI Edit requires a valid public source URL." }); } if (!isApprovedSourceUrl(sourceUrl.href)) return res.status(400).json({ error: "This source is not on the approved public guideline domain list." }); sourceUrl = sourceUrl.href; }
    const startedAt = new Date().toISOString();
    all[index] = normalize({ ...current, aiProcess: { status: "processing", action: current.status === "manual_feed" ? "Structure" : "AI Edit", startedAt, error: "" }, updatedAt: startedAt, activity: startedAt }, current.status);
    await writeCollection("guidelineQueue", all);
    try {     let sourceText = clean(current.manualFeed).slice(0, 20000);
      let sourceContext = { links: [], tables: [] };
      if (current.status === "fetched") {
        const sourceResponse = await fetch(sourceUrl, { headers: { "User-Agent": "AjiX-Guideline-Importer/1.0" }, signal: AbortSignal.timeout(30000) });
        if (!sourceResponse.ok) throw new Error("Source returned HTTP " + sourceResponse.status);
        const sourceHtml = await sourceResponse.text();
        sourceText = sourceHtml.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim().slice(0, 20000);
        sourceContext = sourceHtmlContext(sourceHtml, sourceUrl);
      } else { sourceContext = sourceHtmlContext(sourceText, sourceUrl || "https://manual-feed.invalid/"); }
      if (!sourceText) throw new Error("The source did not contain readable content.");
      const aiResponse = await fetchOpenAiWithRetry("https://api.openai.com/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + config.openAiApiKey }, body: JSON.stringify({ model: config.openAiModelPremium || "gpt-5-mini", max_completion_tokens: 6000, response_format: { type: "json_object" }, messages: [{ role: "system", content: "You are a clinical guideline editor. Return only JSON with title, condition, specialty, org, version, and sections. sections must be an array of objects with title and safe HTML content. Use only supported HTML tags: p, br, strong, b, em, i, u, ul, ol, li, blockquote, a, table, thead, tbody, tr, td, th, img, figure, figcaption, h1, h2, h3, h4, h5, h6, div, span, colgroup, and col. Preserve useful source links as <a href=...>descriptive text</a> using only URLs supplied in sourceLinks. Recreate source tables as real HTML tables when the source contains comparative, dosing, staging, criteria, or other tabular data; include thead, tbody, tr, th, and td. Use blockquote class=attention-card attention-key for key notices, attention-info for important information, attention-warning for warnings, and attention-caution for cautions, only where appropriate. Do not add a heading or label such as CRITICAL, IMPORTANT, WARNING, or CAUTION inside a callout; put only the informational text in the card. Preserve the source meaning, do not invent recommendations, and include references when present." }, { role: "user", content: JSON.stringify({ sourceUrl, existingTitle: current.title, sourceText, sourceLinks: sourceContext.links, sourceTables: sourceContext.tables }) }] }) });
      const aiBody = await aiResponse.json();
      if (!aiResponse.ok) throw new Error(aiBody.error?.message || "AI processing failed.");
      const raw = aiBody.choices?.[0]?.message?.content || "";
      if (aiBody.choices?.[0]?.finish_reason === "length") throw new Error("The AI response was incomplete. Please try AI Edit again.");
      const jsonText = raw.replace(/^```json\s*|\s*```$/g, "").trim();
      const edited = JSON.parse(jsonText);
      const sections = Array.isArray(edited.sections) ? edited.sections.filter((section) => section && clean(section.title)).map((section) => ({ id: crypto.randomUUID(), title: clean(section.title), content: removeAttentionLabels(sanitizeAiHtml(section.content || "")) })) : [];
      if (!sections.length) throw new Error("AI returned no usable guideline sections.");
      const now = new Date().toISOString();
      all[index] = normalize({ ...current, title: clean(edited.title) || current.title, condition: clean(edited.condition) || current.condition, specialty: clean(edited.specialty) || current.specialty, org: clean(edited.org) || current.org, organization: clean(edited.org) || current.organization, version: clean(edited.version) || current.version, sections, status: "in_review", aiProcess: { status: "completed", action: current.status === "manual_feed" ? "Structure" : "AI Edit", startedAt: all[index]?.aiProcess?.startedAt || now, completedAt: now, error: "" }, updatedAt: now, activity: now }, "in_review");
      await writeCollection("guidelineQueue", all);
      res.json({ ok: true, item: all[index] });
    } catch (error) { const now = new Date().toISOString(); all[index] = normalize({ ...all[index], aiProcess: { status: "failed", action: current.status === "manual_feed" ? "Structure" : "AI Edit", startedAt: all[index]?.aiProcess?.startedAt || now, completedAt: now, error: error.message || "AI processing failed." }, updatedAt: now, activity: now }, current.status); await writeCollection("guidelineQueue", all); console.error("guideline-ai-failed", error); res.status(502).json({ error: error.message || "Unable to AI edit guideline." }); }
  });
  router.get("/api/admin/guidelines/:id", async (req, res) => {
    if (!admin(req, config)) return res.status(403).json({ error: "Forbidden" });
    const item = (await getQueue()).find((entry) => entry.id === String(req.params.id));
    if (!item) return res.status(404).json({ error: "Guideline not found" });
    res.json({ ok: true, item });
  });

  router.put("/api/admin/guidelines/:id", async (req, res) => {
    if (!admin(req, config)) return res.status(403).json({ error: "Forbidden" });
    const all = await getQueue();
    const index = all.findIndex((entry) => entry.id === String(req.params.id));
    if (index < 0) return res.status(404).json({ error: "Guideline not found" });
    const now = new Date().toISOString();
    all[index] = normalize({
      ...all[index],
      ...req.body,
      id: all[index].id,
      status: req.body?.workflowStatus === "in_review" && all[index].status === "fetched" ? "in_review" : "draft",
      createdAt: all[index].createdAt,
      updatedAt: now,
      activity: now,
    }, "draft");
    await writeCollection("guidelineQueue", all);
    res.json({ ok: true, item: all[index] });
  });
  router.delete("/api/admin/guidelines/:id", async (req, res) => {
    if (!admin(req, config)) return res.status(403).json({ error: "Forbidden" });
    const all = await getQueue();
    const index = all.findIndex((entry) => entry.id === String(req.params.id));
    if (index < 0) return res.status(404).json({ error: "Guideline not found" });
    const [removed] = all.splice(index, 1);
    await writeCollection("guidelineQueue", all);
    res.json({ ok: true, item: removed });
  });
  router.post("/api/admin/guidelines/:id/:action", async (req, res) => {
    if (!admin(req, config)) return res.status(403).json({ error: "Forbidden" });
    const action = clean(req.params.action).toLowerCase();
    const allowed = {
      submit: ["draft", "fetched", "rejected"],
      publish: ["draft", "in_review"],
      reject: ["draft", "in_review"],
      unpublish: ["published"],
      requeue: ["rejected"],
    };
    if (!allowed[action]) return res.status(404).json({ error: "Unknown action" });
    const all = await getQueue();
    const current = all.find((item) => item.id === String(req.params.id));
    if (!current) return res.status(404).json({ error: "Guideline not found" });
    if (!allowed[action].includes(current.status)) return res.status(409).json({ error: "This status transition is not allowed." });
    const nextStatus = { submit: "in_review", publish: "published", reject: "rejected", unpublish: "rejected", requeue: "fetched" }[action];
    const item = updateItem(all, current.id, (value) => ({ ...value, status: nextStatus }));
    await writeCollection("guidelineQueue", all);
    res.json({ ok: true, item });
  });

  return router;
}
