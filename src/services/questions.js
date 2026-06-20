import path from "node:path";
import { promises as fs } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { readCollection, writeCollection } from "../store.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "..", "..");
const quizRoot = path.resolve(backendRoot, "..");
const questionSourceCandidates = [
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
  return {
    id: Number(q.id),
    type: q.type || "single",
    category: q.category || "General",
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
    topicSlug: q.topicSlug || undefined,
    sectionId: q.sectionId || undefined,
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
      const source = await importQuestionModule(dataModulePath);
      if (source.length > 0) {
        for (const question of source) {
          const questionId = Number(question?.id);
          if (Number.isFinite(questionId)) {
            questionsById.set(questionId, question);
          }
        }
        break;
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
  if (existing.length > 0) {
    return { seeded: false, count: existing.length };
  }

  const seededQuestions = await importQuestionsFromFrontend();
  await writeCollection("questions", seededQuestions);

  return {
    seeded: true,
    count: seededQuestions.length,
  };
}
