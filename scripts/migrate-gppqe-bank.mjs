import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const backendQuestionsPath = path.join(repoRoot, "backend", "data", "questions.json");
const gppqeSourcePath = path.join(repoRoot, "www", "gppqe-data.js");
const enginePaths = [
  path.join(repoRoot, "www", "engine.js"),
  path.join(repoRoot, "engine.js"),
  path.join(repoRoot, "android", "app", "src", "main", "assets", "public", "engine.js"),
];

function replaceOrThrow(source, search, replacement, label) {
  if (!source.includes(search)) {
    throw new Error(`Could not find ${label}`);
  }
  return source.replace(search, replacement);
}

async function loadGppqeQuestions() {
  const imported = await import(pathToFileURL(gppqeSourcePath).href);
  const questions = Array.isArray(imported.GPPQE_QUESTION_BANK) ? imported.GPPQE_QUESTION_BANK : [];
  if (!questions.length) {
    throw new Error("No GPPQE questions were exported from www/gppqe-data.js");
  }
  return questions;
}

async function mergeBackendQuestions() {
  const raw = await fs.readFile(backendQuestionsPath, "utf8");
  const existing = JSON.parse(raw);
  if (!Array.isArray(existing)) {
    throw new Error("backend/data/questions.json is not an array");
  }

  const gppqeQuestions = await loadGppqeQuestions();
  const normalizedExisting = existing
    .filter((question) => String(question?.bank || "main").trim().toLowerCase() !== "gppqe")
    .map((question) => ({
      ...question,
      bank: String(question?.bank || "main").trim().toLowerCase() || "main",
    }));
  const maxId = normalizedExisting.reduce((max, question) => {
    const value = Number(question?.id);
    return Number.isFinite(value) && value > max ? value : max;
  }, 0);

  const gppqeBank = gppqeQuestions.map((question, index) => {
    const answerIndex = Number(question?.answer);
    const options = Array.isArray(question?.options) ? question.options : [];
    const correctAnswer =
      Number.isInteger(answerIndex) && answerIndex >= 0 && answerIndex < options.length
        ? options[answerIndex]
        : String(question?.correct || "").trim();

    return {
      id: maxId + index + 1,
      bank: "gppqe",
      year: Number(question?.year) || undefined,
      displayNumber: Number(question?.displayNumber) || undefined,
      type: question?.type || "single",
      category: String(question?.category || "General").trim() || "General",
      text: String(question?.question || "").trim(),
      question: String(question?.question || "").trim(),
      options,
      correct: correctAnswer,
      answer: Number.isInteger(answerIndex) && answerIndex >= 0 ? answerIndex : undefined,
      explanation: String(question?.explanation || "").trim(),
    };
  });

  const merged = [...normalizedExisting, ...gppqeBank];
  await fs.writeFile(backendQuestionsPath, JSON.stringify(merged, null, 2), "utf8");
  return { existing: normalizedExisting.length, added: gppqeBank.length };
}

function patchEngineContents(contents) {
  let next = contents;
  next = replaceOrThrow(
    next,
    'import { GPPQE_QUESTION_BANK } from "./gppqe-data.js?v=20260827-gppqe1";\n',
    "",
    "GPPQE import",
  );
  next = replaceOrThrow(
    next,
    'const GPPQE_YEARS = [...new Set(GPPQE_QUESTION_BANK.map((question) => question.year))].sort((a, b) => b - a);\nconst GPPQE_CATEGORIES = [...new Set(GPPQE_QUESTION_BANK.map((question) => question.category))].sort();\n',
    "",
    "GPPQE constant block",
  );
  next = replaceOrThrow(
    next,
    `function gppqeGetYearLabel(year = "all") {
  if (!year) return "Select year";
  return String(year) === "all" ? "All years" : String(year);
}

function gppqeGetDisplayNumber(question, fallbackIndex = 0) {
  const value = Number(question?.displayNumber);
  if (Number.isFinite(value) && value > 0) {
    return value;
  }
  return Number(fallbackIndex) + 1;
}

function gppqeGetPool() {
  let pool = GPPQE_QUESTION_BANK;
  if (gppqeState.selectedYear && gppqeState.selectedYear !== "all") {
    pool = pool.filter((question) => question.year === gppqeState.selectedYear);
  }
  if (gppqeState.selectedCategories.length > 0) {
    pool = pool.filter((question) => gppqeState.selectedCategories.includes(question.category));
  }
  return pool;
}
`,
    `function gppqeGetYearLabel(year = "all") {
  if (!year) return "Select year";
  return String(year) === "all" ? "All years" : String(year);
}

function gppqeGetBankQuestions() {
  const source = Array.isArray(questionBank) ? questionBank : [];
  return source.filter((question) => String(question?.bank || "main").trim().toLowerCase() === "gppqe");
}

function gppqeGetYears() {
  return [...new Set(gppqeGetBankQuestions().map((question) => Number(question.year)).filter((year) => Number.isFinite(year)))].sort((a, b) => b - a);
}

function gppqeGetCategoriesForYear(year = "all") {
  const pool = gppqeGetBankQuestions();
  const normalizedYear = year === "all" ? "all" : Number(year);
  const filtered = normalizedYear === "all"
    ? pool
    : pool.filter((question) => Number(question.year) === normalizedYear);
  return [...new Set(filtered.map((question) => String(question.category || "").trim()).filter(Boolean))].sort();
}

function gppqeGetDisplayNumber(question, fallbackIndex = 0) {
  const value = Number(question?.displayNumber);
  if (Number.isFinite(value) && value > 0) {
    return value;
  }
  return Number(fallbackIndex) + 1;
}

function gppqeGetPool() {
  let pool = gppqeGetBankQuestions();
  if (gppqeState.selectedYear && gppqeState.selectedYear !== "all") {
    pool = pool.filter((question) => Number(question.year) === Number(gppqeState.selectedYear));
  }
  if (gppqeState.selectedCategories.length > 0) {
    pool = pool.filter((question) => gppqeState.selectedCategories.includes(question.category));
  }
  return pool;
}
`,
    "GPPQE helper block",
  );
  next = replaceOrThrow(
    next,
    `function gppqeBuildHubMarkup() {
  const totalCategories = GPPQE_CATEGORIES.length;
  const selectedCategory = gppqeState.selectedCategories[0] || "";
  const canStart = Boolean(gppqeState.selectedYear);
  const startLabel = canStart ? "Start Quiz" : "Select year to begin";
  const availableQuestions = gppqeGetPool().length;
  const availabilityLabel =
    availableQuestions === 1
      ? "1 question ready"
      : \`\${availableQuestions} questions ready\`;
  const setupPoints = readCurrentSetupPoints({ scope: "gppqe" });
  const studyPoints = Math.max(0, Math.round(Number(setupPoints.gppqeStudy) || 0));
  const examPoints = Math.max(0, Math.round(Number(setupPoints.gppqeExam) || 0));
  const recentResults = gppqeGetRecentResults(20);
`,
    `function gppqeBuildHubMarkup() {
  const totalCategories = gppqeGetCategoriesForYear(gppqeState.selectedYear || "all").length;
  const selectedCategory = gppqeState.selectedCategories[0] || "";
  const canStart = Boolean(gppqeState.selectedYear);
  const startLabel = canStart ? "Start Quiz" : "Select year to begin";
  const availableQuestions = gppqeGetPool().length;
  const availabilityLabel =
    availableQuestions === 1
      ? "1 question ready"
      : \`\${availableQuestions} questions ready\`;
  const setupPoints = readCurrentSetupPoints({ scope: "gppqe" });
  const studyPoints = Math.max(0, Math.round(Number(setupPoints.gppqeStudy) || 0));
  const examPoints = Math.max(0, Math.round(Number(setupPoints.gppqeExam) || 0));
  const recentResults = gppqeGetRecentResults(20);
`,
    "GPPQE hub header",
  );
  next = replaceOrThrow(
    next,
    '                ${GPPQE_YEARS.map((year) => `<option value="${year}" ${Number(gppqeState.selectedYear) === year ? "selected" : ""}>${year}</option>`).join("")}\n',
    '                ${gppqeGetYears().map((year) => `<option value="${year}" ${Number(gppqeState.selectedYear) === year ? "selected" : ""}>${year}</option>`).join("")}\n',
    "GPPQE year selector",
  );
  next = replaceOrThrow(
    next,
    '                ${GPPQE_CATEGORIES.map((category) => `<option value="${escapeHtml(category)}" ${selectedCategory === category ? "selected" : ""}>${escapeHtml(category)}</option>`).join("")}\n',
    '                ${gppqeGetCategoriesForYear(gppqeState.selectedYear || "all").map((category) => `<option value="${escapeHtml(category)}" ${selectedCategory === category ? "selected" : ""}>${escapeHtml(category)}</option>`).join("")}\n',
    "GPPQE category selector",
  );
  const beforeYearBlock = next;
  next = next.replace(
    /\s*const activeYearYears = year === "all" \? `\$\{GPPQE_YEARS\.length\} written years` : `Written paper \$\{year\}`;\s*\n\s*const categories = year === "all"\s*\n\s*\? GPPQE_CATEGORIES\s*\n\s*: \[\.\.\.new Set\(GPPQE_QUESTION_BANK\.filter\(\(question\) => question\.year === year\)\.map\(\(question\) => question\.category\)\)\]\.sort\(\);\s*\n/,
    `
  const availableYears = gppqeGetYears();
  const activeYearYears = year === "all" ? \`\${availableYears.length} written years\` : \`Written paper \${year}\`;
  const categories = gppqeGetCategoriesForYear(year);
`,
  );
  if (next === beforeYearBlock) {
    throw new Error("Could not find GPPQE year view helper block");
  }
  next = replaceOrThrow(
    next,
    '            <div class="gppqe-metric-value">${year === "all" ? GPPQE_YEARS.length : 1}</div>\n',
    '            <div class="gppqe-metric-value">${year === "all" ? gppqeGetYears().length : 1}</div>\n',
    "GPPQE year metric",
  );
  const beforeMapper = next;
  next = next.replace(
    /function mapBackendQuestionToLocal\(q = \{\}\) \{[\s\S]*?\/\/ Load questions from backend if available\n/,
    `function mapBackendQuestionToLocal(q = {}) {
  const fallback = localQuestionFallbackById.get(Number(q?.id)) || {};
  return {
    id: q.id,
    bank: String(q.bank || fallback.bank || "main").trim().toLowerCase() || "main",
    year: Number.isFinite(Number(q.year)) ? Number(q.year) : Number(fallback.year) || undefined,
    displayNumber: Number.isFinite(Number(q.displayNumber))
      ? Number(q.displayNumber)
      : Number(fallback.displayNumber) || undefined,
    text: q.text || q.question || fallback.text || fallback.question || "",
    question: q.question || q.text || fallback.question || fallback.text || "",
    category: normalizeQuestionCategory({
      ...q,
      question: q.question || q.text || fallback.question || fallback.text || "",
      explanation: q.explanation || fallback.explanation || "",
    }),
    options: Array.isArray(q.options)
      ? q.options
      : Array.isArray(fallback.options)
        ? fallback.options
        : [],
    statements: Array.isArray(q.statements)
      ? q.statements
      : Array.isArray(fallback.statements)
        ? fallback.statements
        : [],
    caseId: q.caseId || fallback.caseId || "",
    caseBlock: q.caseBlock || fallback.caseBlock || "",
    correct: q.correct || fallback.correct,
    answer: Number.isFinite(Number(q.answer)) ? Number(q.answer) : Number(fallback.answer) || undefined,
    explanation: q.explanation || fallback.explanation || "",
    explainCorrect: q.explainCorrect || fallback.explainCorrect || "",
    wrongOptionExplanations:
      q.wrongOptionExplanations && typeof q.wrongOptionExplanations === "object"
        ? q.wrongOptionExplanations
        : fallback.wrongOptionExplanations &&
            typeof fallback.wrongOptionExplanations === "object"
          ? fallback.wrongOptionExplanations
          : {},
    memoryTrick: q.memoryTrick || fallback.memoryTrick || "",
    type: q.type || fallback.type || "single",
    topicSlug: q.topicSlug || fallback.topicSlug || "",
    sectionId: q.sectionId || fallback.sectionId || "",
    drillTags: Array.isArray(q.drillTags)
      ? q.drillTags
      : Array.isArray(fallback.drillTags)
        ? fallback.drillTags
        : [],
    drillTrack: q.drillTrack || fallback.drillTrack || "",
    lawDrill: q.lawDrill ?? fallback.lawDrill ?? false,
  };
}

// Load questions from backend if available
`,
  );
  if (next === beforeMapper) {
    throw new Error("Could not find Backend question mapper");
  }

  return next;
}

async function patchEngines() {
  for (const enginePath of enginePaths) {
    const original = await fs.readFile(enginePath, "utf8");
    const patched = patchEngineContents(original);
    await fs.writeFile(enginePath, patched, "utf8");
  }
}

const mergeStats = await mergeBackendQuestions();
await patchEngines();
console.log(`Merged ${mergeStats.added} GPPQE questions into backend/data/questions.json.`);
