import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { readCollection, writeCollection } from "../store.js";
import { normalizeMajorCategory } from "../categoryTaxonomy.js";
import { inferQuestionRotation } from "../../../rotationTaxonomy.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "..", "..");
const quizRoot = path.resolve(backendRoot, "..");

function normalizeQuestion(q) {
  const topicSlug = String(q.topicSlug || "").trim().toLowerCase();
  const sectionId = String(q.sectionId || "").trim().toLowerCase();
  const drillTags = Array.isArray(q.drillTags)
    ? q.drillTags.map((tag) => String(tag || "").trim().toLowerCase()).filter(Boolean)
    : [];
  const questionText = String(q.question || q.text || "");
  const explanationText = String(q.explanation || "");
  const categoryContext = [
    questionText,
    explanationText,
    `sectionid:${sectionId}`,
    `topic:${topicSlug}`,
    `drilltags:${drillTags.join(",")}`,
    `lawdrill:${q.lawDrill === true ? "true" : "false"}`,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    id: Number(q.id),
    type: q.type || "single",
    category: normalizeMajorCategory(q.category, categoryContext),
    question: q.question || "",
    options: Array.isArray(q.options) ? q.options : undefined,
    statements: Array.isArray(q.statements) ? q.statements : undefined,
    caseId: q.caseId || undefined,
    caseBlock: q.caseBlock || undefined,
    correct: q.correct,
    explanation: q.explanation || "",
    topicSlug: topicSlug || undefined,
    sectionId: sectionId || undefined,
    drillTags: drillTags.length > 0 ? drillTags : undefined,
    lawDrill: q.lawDrill === true || drillTags.includes("law") || sectionId.includes("law-drill"),
    rotation: String(q.rotation || q.rotations?.[0] || "").trim() || inferQuestionRotation(q) || undefined,
  };
}

export async function importQuestionsFromFrontend() {
  const dataModulePath = path.join(quizRoot, "data.js");
  const moduleUrl = pathToFileURL(dataModulePath).href;
  const imported = await import(moduleUrl);
  const source = Array.isArray(imported.baseQuestions) ? imported.baseQuestions : [];
  return source.map(normalizeQuestion);
}

export async function ensureQuestionsSeeded({ force = false } = {}) {
  const existing = await readCollection("questions");
  const seededQuestions = await importQuestionsFromFrontend();

  if (existing.length > 0 && !force) {
    const existingIds = new Set(existing.map((row) => String(row?.id || "")));
    const missingQuestions = seededQuestions.filter((question) => !existingIds.has(String(question?.id || "")));
    if (missingQuestions.length === 0) {
      return { seeded: false, count: existing.length, replaced: false };
    }
    const mergedQuestions = [...existing, ...missingQuestions];
    await writeCollection("questions", mergedQuestions);
    return {
      seeded: true,
      count: mergedQuestions.length,
      replaced: false,
      previousCount: existing.length,
      appended: missingQuestions.length,
    };
  }

  await writeCollection("questions", seededQuestions);

  return {
    seeded: true,
    count: seededQuestions.length,
    replaced: existing.length > 0,
    previousCount: existing.length,
  };
}

export async function normalizeStoredQuestionCategories() {
  const questions = await readCollection("questions");
  let changed = 0;

  const normalized = questions.map((row) => {
    const drillTags = Array.isArray(row.drillTags)
      ? row.drillTags.map((tag) => String(tag || "").trim().toLowerCase()).filter(Boolean)
      : [];
    const categoryContext = [
      String(row.question || row.text || ""),
      String(row.explanation || ""),
      `sectionid:${String(row.sectionId || "").trim().toLowerCase()}`,
      `topic:${String(row.topicSlug || "").trim().toLowerCase()}`,
      `drilltags:${drillTags.join(",")}`,
      `lawdrill:${row.lawDrill === true ? "true" : "false"}`,
    ]
      .filter(Boolean)
      .join(" ");
    const nextCategory = normalizeMajorCategory(row.category, categoryContext);
    const nextRotation = String(row.rotation || row.rotations?.[0] || "").trim() || inferQuestionRotation(row) || undefined;
    const rotationChanged = String(row.rotation || "") !== String(nextRotation || "");
    if (String(row.category || "") !== nextCategory || rotationChanged) {
      changed += 1;
    }
    return {
      ...row,
      category: nextCategory,
      drillTags: drillTags.length > 0 ? drillTags : row.drillTags,
      rotation: nextRotation,
    };
  });

  if (changed > 0) {
    await writeCollection("questions", normalized);
  }

  return { changed, total: questions.length };
}
