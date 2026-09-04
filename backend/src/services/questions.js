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
  path.join(quizRoot, "www", "data.js"),
  path.join(quizRoot, "android", "app", "src", "main", "assets", "public", "data.js"),
  path.join(quizRoot, "data.js"),
  path.join(backendRoot, "data", "questions.json"),
];
const questionBatchDirectories = [
  path.join(quizRoot, "www", "question-batches"),
  path.join(quizRoot, "android", "app", "src", "main", "assets", "public", "question-batches"),
  path.join(quizRoot, "question-batches"),
];
const EXCLUDED_QUESTION_IDS = new Set([1203, 1300, 1345]);

const CASE_SERIES_KEYWORDS = [
  "asthma",
  "bronchodilator",
  "inhaler",
  "ipratropium",
  "formoterol",
  "rheumatoid",
  "arthritis",
  "methotrexate",
  "dmard",
  "stomatitis",
  "pregnan",
  "gestational",
  "diabet",
  "glucose",
  "insulin",
  "hypertens",
  "pre-eclamps",
  "thyroid",
  "renal",
  "kidney",
  "stroke",
  "gout",
];

function stripQuestionNumber(value = "") {
  return String(value || "").replace(/^Q\d+\.\s*/i, "").trim();
}

function extractNamedCaseSubject(questionText = "") {
  const raw = stripQuestionNumber(questionText);
  if (!raw) return null;

  const titledMatch = raw.match(
    /\b(Mr\.?\s+(?:[A-Z][A-Za-z-]*|[A-Z]{2,})|Mrs\.?\s+(?:[A-Z][A-Za-z-]*|[A-Z]{2,})|Ms\.?\s+(?:[A-Z][A-Za-z-]*|[A-Z]{2,})|Miss\s+(?:[A-Z][A-Za-z-]*|[A-Z]{2,})|Dr\.?\s+(?:[A-Z][A-Za-z-]*|[A-Z]{2,}))\b/,
  );
  if (titledMatch) {
    const label = String(titledMatch[1] || "").replace(/\s+/g, " ").trim();
    return {
      key: label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
      label,
    };
  }

  const possessiveMatch = raw.match(/\b([A-Z][a-z]+)'s\b/);
  if (possessiveMatch) {
    const label = String(possessiveMatch[1] || "").trim();
    return {
      key: label.toLowerCase(),
      label,
    };
  }

  return null;
}

function collectCaseSeriesKeywords(text = "") {
  const lower = String(text || "").toLowerCase();
  return CASE_SERIES_KEYWORDS.filter((keyword) => lower.includes(keyword));
}

function buildDerivedCaseBlock(subjectLabel = "", questions = []) {
  const safeSubject = String(subjectLabel || "this patient").trim() || "this patient";
  const textBlob = questions
    .map((question) => `${question?.question || ""} ${question?.explanation || ""}`)
    .join(" ")
    .toLowerCase();

  const hasKeyword = (value) => textBlob.includes(value);
  const hasPregnancy = hasKeyword("pregnan") || hasKeyword("gestational");
  const hasDiabetes =
    hasKeyword("diabet") || hasKeyword("glucose") || hasKeyword("insulin");
  const hasHypertension =
    hasKeyword("hypertens") || hasKeyword("blood pressure") || hasKeyword("pre-eclamps");
  const hasAsthma = hasKeyword("asthma");
  const hasRa = hasKeyword("rheumatoid") || hasKeyword("arthritis");

  if (hasPregnancy && hasDiabetes && hasHypertension) {
    return `${safeSubject} is pregnant and has pre-existing diabetes and hypertension. Use this shared case context for the questions in this series.`;
  }

  if (hasPregnancy && hasDiabetes) {
    return `${safeSubject} is pregnant and has diabetes. Use this shared case context for the questions in this series.`;
  }

  if (hasAsthma && hasKeyword("hypertension") && hasKeyword("diabetes")) {
    return `${safeSubject} is being assessed for asthma with co-existing hypertension and diabetes mellitus. Use this shared case context for the questions in this series.`;
  }

  if (hasAsthma) {
    return `${safeSubject} is being assessed for asthma-related problems. Use this shared case context for the questions in this series.`;
  }

  if (hasRa) {
    return `${safeSubject} is being assessed for rheumatoid arthritis and related systemic features. Use this shared case context for the questions in this series.`;
  }

  return `Case series about ${safeSubject}. Use this shared case context for the questions in this series.`;
}

function shouldExtendDerivedCaseSeries(question, anchorCategory, anchorKeywords = []) {
  if (!question) return false;
  if (String(question.caseId || "").trim() || String(question.caseBlock || "").trim()) {
    return false;
  }
  if (String(question.category || "").trim() !== String(anchorCategory || "").trim()) {
    return false;
  }

  const nextSubject = extractNamedCaseSubject(question.question || question.text || "");
  if (nextSubject) return false;

  const text = `${question.question || ""} ${question.explanation || ""}`.toLowerCase();
  return anchorKeywords.some((keyword) => text.includes(keyword));
}

function enrichDerivedCaseSeries(questions = []) {
  const enriched = Array.isArray(questions)
    ? questions.map((question) => ({ ...question }))
    : [];

  let index = 0;
  while (index < enriched.length) {
    const category = String(enriched[index]?.category || "").trim();
    let runEnd = index;
    while (
      runEnd + 1 < enriched.length &&
      String(enriched[runEnd + 1]?.category || "").trim() === category
    ) {
      runEnd += 1;
    }

    const run = enriched.slice(index, runEnd + 1);
    const subjects = new Map();
    run.forEach((question, runIndex) => {
      const subject = extractNamedCaseSubject(question?.question || question?.text || "");
      if (!subject?.key) return;
      if (!subjects.has(subject.key)) {
        subjects.set(subject.key, {
          label: subject.label,
          indexes: [],
        });
      }
      subjects.get(subject.key).indexes.push(runIndex);
    });

    subjects.forEach((subject, subjectKey) => {
      if (!Array.isArray(subject.indexes) || subject.indexes.length < 2) return;

      const firstIndex = subject.indexes[0];
      const lastIndex = subject.indexes[subject.indexes.length - 1];
      const baseGroup = run.slice(firstIndex, lastIndex + 1);
      const anchorKeywords = collectCaseSeriesKeywords(
        baseGroup
          .map((question) => `${question?.question || ""} ${question?.explanation || ""}`)
          .join(" "),
      );

      let groupEnd = lastIndex;
      while (
        groupEnd + 1 < run.length &&
        shouldExtendDerivedCaseSeries(run[groupEnd + 1], category, anchorKeywords)
      ) {
        groupEnd += 1;
      }

      const seriesQuestions = run.slice(firstIndex, groupEnd + 1);
      const derivedCaseId = `derived-case-${subjectKey}-${Number(seriesQuestions[0]?.id) || index + firstIndex + 1}`;
      const derivedCaseBlock = buildDerivedCaseBlock(subject.label, seriesQuestions);

      for (let offset = firstIndex; offset <= groupEnd; offset += 1) {
        const target = run[offset];
        if (!target) continue;
        if (!String(target.caseId || "").trim()) {
          target.caseId = derivedCaseId;
        }
        if (!String(target.caseBlock || "").trim()) {
          target.caseBlock = derivedCaseBlock;
        }
      }
    });

    for (let runIndex = 0; runIndex < run.length; runIndex += 1) {
      enriched[index + runIndex] = run[runIndex];
    }
    index = runEnd + 1;
  }

  return enriched;
}

function buildQuestionSignature(question = {}) {
  return JSON.stringify({
    id: Number(question?.id),
    bank: String(question?.bank || "main").trim().toLowerCase() || "main",
    comboVariant: String(question?.comboVariant || "").trim().toLowerCase() || "",
    year: Number(question?.year) || null,
    displayNumber: Number(question?.displayNumber) || null,
    type: question?.type || "single",
    category: question?.category || "",
    question: question?.question || "",
    options: Array.isArray(question?.options) ? question.options : [],
    statements: Array.isArray(question?.statements) ? question.statements : [],
    caseId: question?.caseId || "",
    caseBlock: question?.caseBlock || "",
    correct: question?.correct ?? "",
    answer: Number.isFinite(Number(question?.answer)) ? Number(question.answer) : null,
    explanation: question?.explanation || "",
    explainCorrect: question?.explainCorrect || "",
    wrongOptionExplanations:
      question?.wrongOptionExplanations && typeof question.wrongOptionExplanations === "object"
        ? question.wrongOptionExplanations
        : {},
    memoryTrick: question?.memoryTrick || "",
    drillTags: Array.isArray(question?.drillTags) ? question.drillTags : [],
    drillTrack: question?.drillTrack || "",
    lawDrill: question?.lawDrill === true,
    topicSlug: question?.topicSlug || "",
    sectionId: question?.sectionId || "",
    rotation: question?.rotation || "",
  });
}

function normalizeQuestion(q) {
  const topicSlug = String(q.topicSlug || "").trim().toLowerCase();
  const sectionId = String(q.sectionId || "").trim().toLowerCase();
  const questionText = String(q.question || q.text || "");
  const explanationText = String(q.explanation || "");
  const bank = String(q.bank || "main").trim().toLowerCase() || "main";
  const comboVariant = String(q.comboVariant || "").trim().toLowerCase();
  const year = Number(q.year);
  const displayNumber = Number(q.displayNumber);
  const answer = Number(q.answer);

  return {
    id: Number(q.id),
    bank,
    comboVariant: comboVariant || undefined,
    year: Number.isFinite(year) ? year : undefined,
    displayNumber: Number.isFinite(displayNumber) ? displayNumber : undefined,
    type: q.type || "single",
    category: normalizeMajorCategory(q.category, `${questionText} ${explanationText}`),
    question: q.question || "",
    options: Array.isArray(q.options) ? q.options : undefined,
    statements: Array.isArray(q.statements) ? q.statements : undefined,
    caseId: q.caseId || undefined,
    caseBlock: q.caseBlock || undefined,
    correct: q.correct,
    answer: Number.isFinite(answer) ? answer : undefined,
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

function filterExcludedQuestions(questions = []) {
  return Array.isArray(questions)
    ? questions.filter((question) => !EXCLUDED_QUESTION_IDS.has(Number(question?.id)))
    : [];
}

async function importQuestionModule(modulePath) {
  const moduleUrl = pathToFileURL(modulePath).href;
  const imported = await import(moduleUrl);
  const arrays = Object.values(imported).filter(
    (value) =>
      Array.isArray(value) &&
      value.some((entry) => entry && typeof entry === "object" && "id" in entry),
  );
  return filterExcludedQuestions(enrichDerivedCaseSeries(arrays.flat()).map(normalizeQuestion));
}

async function importQuestionJson(modulePath) {
  const raw = await fs.readFile(modulePath, "utf8");
  const parsed = JSON.parse(raw);
  const source = Array.isArray(parsed) ? parsed : [];
  return filterExcludedQuestions(enrichDerivedCaseSeries(source).map(normalizeQuestion));
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
  const existingById = new Map(
    existing
      .map((row) => [Number(row?.id), row])
      .filter(([id]) => Number.isFinite(id)),
  );
  const hasChangedRows = seededQuestions.some((row) => {
    const current = existingById.get(Number(row?.id));
    if (!current) return true;
    return buildQuestionSignature(current) !== buildQuestionSignature(row);
  });
  const shouldReseed =
    existing.length === 0 ||
    existing.length !== seededQuestions.length ||
    hasMissingSourceRows ||
    hasExtraStoredRows ||
    hasChangedRows;

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
