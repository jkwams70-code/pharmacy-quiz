import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { readCollection, writeCollection } from "../store.js";
import { normalizeMajorCategory } from "../categoryTaxonomy.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "..", "..");
const quizRoot = path.resolve(backendRoot, "..");

function normalizeQuestion(q) {
  const topicSlug = String(q.topicSlug || "").trim().toLowerCase();
  const sectionId = String(q.sectionId || "").trim().toLowerCase();
  const questionText = String(q.question || q.text || "");
  const explanationText = String(q.explanation || "");

  return {
    id: Number(q.id),
    type: q.type || "single",
    category: normalizeMajorCategory(q.category, `${questionText} ${explanationText}`),
    question: q.question || "",
    options: Array.isArray(q.options) ? q.options : undefined,
    statements: Array.isArray(q.statements) ? q.statements : undefined,
    caseId: q.caseId || undefined,
    caseBlock: q.caseBlock || undefined,
    correct: q.correct,
    explanation: q.explanation || "",
    topicSlug: topicSlug || undefined,
    sectionId: sectionId || undefined,
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
  if (existing.length > 0 && !force) {
    return { seeded: false, count: existing.length, replaced: false };
  }

  const seededQuestions = await importQuestionsFromFrontend();
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
    const nextCategory = normalizeMajorCategory(
      row.category,
      `${String(row.question || row.text || "")} ${String(row.explanation || "")}`,
    );
    if (String(row.category || "") !== nextCategory) {
      changed += 1;
    }
    return {
      ...row,
      category: nextCategory,
    };
  });

  if (changed > 0) {
    await writeCollection("questions", normalized);
  }

  return { changed, total: questions.length };
}
