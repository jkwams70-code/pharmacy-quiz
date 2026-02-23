import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { readCollection, writeCollection } from "../store.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "..", "..");
const quizRoot = path.resolve(backendRoot, "..");

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
  };
}

export async function importQuestionsFromFrontend() {
  const dataModulePath = path.join(quizRoot, "data.js");
  const moduleUrl = pathToFileURL(dataModulePath).href;
  const imported = await import(moduleUrl);
  const source = Array.isArray(imported.baseQuestions) ? imported.baseQuestions : [];
  return source.map(normalizeQuestion);
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
