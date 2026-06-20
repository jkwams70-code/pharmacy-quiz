import path from "node:path";
import { promises as fs } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { readCollection, writeCollection } from "../store.js";
import { normalizeMajorCategory } from "../categoryTaxonomy.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "..", "..");
const quizRoot = path.resolve(backendRoot, "..");
const questionSourceCandidates = [
  path.join(backendRoot, "backups", "data_20260619_183446", "questions.json"),
  path.join(quizRoot, "www", "data.js"),
  path.join(quizRoot, "android", "app", "src", "main", "assets", "public", "data.js"),
  path.join(quizRoot, "data.js"),
];
const questionBatchDirectories = [
  path.join(quizRoot, "www", "question-batches"),
  path.join(quizRoot, "android", "app", "src", "main", "assets", "public", "question-batches"),
  path.join(quizRoot, "question-batches"),
];

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
    explainCorrect: q.explainCorrect || undefined,
    wrongOptionExplanations:
      q.wrongOptionExplanations && typeof q.wrongOptionExplanations === "object"
        ? q.wrongOptionExplanations
        : undefined,
    memoryTrick: q.memoryTrick || undefined,
    drillTags: Array.isArray(q.drillTags)
      ? q.drillTags.map((tag) => String(tag || "").trim()).filter(Boolean)
      : undefined,
    drillTrack: q.drillTrack || undefined,
    lawDrill: q.lawDrill === true ? true : undefined,
    topicSlug: topicSlug || undefined,
    sectionId: sectionId || undefined,
    rotation: q.rotation || undefined,
  };
}

async function importQuestionModule(modulePath) {
  const moduleUrl = pathToFileURL(modulePath).href;
  const imported = await import(moduleUrl);
  const arrays = Object.values(imported).filter(
    (value) =>
      Array.isArray(value) &&
      value.some((entry) => entry && typeof entry === "object" && "id" in entry),
  );
  return arrays.flat().map(normalizeQuestion);
}

async function importQuestionJson(modulePath) {
  const raw = await fs.readFile(modulePath, "utf8");
  const parsed = JSON.parse(raw);
  const source = Array.isArray(parsed) ? parsed : [];
  return source.map(normalizeQuestion);
}

async function readQuestionModulePaths(directory) {
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".js"))
      .map((entry) => path.join(directory, entry.name))
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

export async function importQuestionsFromFrontend() {
  const questionsById = new Map();

  for (const dataModulePath of questionSourceCandidates) {
    try {
      const source = dataModulePath.toLowerCase().endsWith(".json")
        ? await importQuestionJson(dataModulePath)
        : await importQuestionModule(dataModulePath);
      if (source.length > 0) {
        for (const question of source) {
          const questionId = Number(question?.id);
          if (Number.isFinite(questionId)) {
            questionsById.set(questionId, question);
          }
        }
      }
    } catch (error) {
      const message = String(error?.message || error);
      if (!/Unexpected token|Cannot find module|Cannot use import statement/i.test(message)) {
        throw error;
      }
    }
  }

  for (const directory of questionBatchDirectories) {
    const modulePaths = await readQuestionModulePaths(directory);
    for (const modulePath of modulePaths) {
      const source = await importQuestionModule(modulePath).catch((error) => {
        const message = String(error?.message || error);
        if (/Unexpected token|Cannot find module|Cannot use import statement/i.test(message)) {
          return [];
        }
        throw error;
      });
      for (const question of source) {
        const questionId = Number(question?.id);
        if (Number.isFinite(questionId)) {
          questionsById.set(questionId, question);
        }
      }
    }
  }

  const questions = [...questionsById.values()].sort((a, b) => Number(a.id || 0) - Number(b.id || 0));
  if (questions.length === 0) {
    throw new Error("Unable to load questions from any frontend data source.");
  }
  return questions;
}

export async function ensureQuestionsSeeded() {
  const existing = await readCollection("questions");
  const seededQuestions = await importQuestionsFromFrontend();
  const existingIds = new Set(
    existing
      .map((row) => Number(row?.id))
      .filter((id) => Number.isFinite(id)),
  );
  const sourceIds = new Set(
    seededQuestions
      .map((row) => Number(row?.id))
      .filter((id) => Number.isFinite(id)),
  );

  const hasMissingSourceRows = seededQuestions.some((row) => !existingIds.has(Number(row?.id)));
  const hasExtraStoredRows = existing.some((row) => !sourceIds.has(Number(row?.id)));
  const shouldReseed =
    existing.length === 0 ||
    existing.length !== seededQuestions.length ||
    hasMissingSourceRows ||
    hasExtraStoredRows;

  if (shouldReseed) {
    await writeCollection("questions", seededQuestions);
    return {
      seeded: true,
      count: seededQuestions.length,
    };
  }

  return { seeded: false, count: existing.length };
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
