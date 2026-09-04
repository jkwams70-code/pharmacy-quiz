import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeMajorCategory } from "../backend/src/categoryTaxonomy.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const backendQuestionsPath = path.join(repoRoot, "backend", "data", "questions.json");
const rootQuestionsPath = path.join(repoRoot, "data", "questions.json");

const ASSERTION_COMBO_OPTIONS = [
  "First statement is TRUE, Second statement is TRUE and they are RELATED",
  "First statement is TRUE, Second statement is TRUE but they are NOT related",
  "First statement is TRUE but Second statement is FALSE",
  "First statement is FALSE but Second statement is TRUE",
  "Both statements are FALSE",
];

const MULTI_51_55_OPTIONS = ["i, ii, iii", "i & ii only", "ii & iii only", "i only"];
const MULTI_81_90_OPTIONS = ["1, 2, 3", "1 & 2 only", "2 & 3 only", "1 only"];
const MULTI_121_130_OPTIONS = ["I only", "I and II only", "I, II and III", "III only"];
const SHARED_54_57_OPTIONS = [
  "Cefalorine",
  "Piperacillin + Tazobactam",
  "Linezolid",
  "Flucloxacillin",
];

const CASE_DEFINITIONS = [
  {
    caseId: "gppqe-2023-case-1-ckd",
    heading: "## CASE 1: Mr. AB - Chronic Kidney Disease",
    rangeStart: 61,
    rangeEnd: 70,
    questionMarker: "**61.",
  },
  {
    caseId: "gppqe-2023-case-2-asthma",
    heading: "## CASE 2: Mr. GO - Asthma Exacerbation",
    rangeStart: 71,
    rangeEnd: 80,
    questionMarker: "**71.",
  },
  {
    caseId: "gppqe-2023-case-3-ra",
    heading: "## CASE 3: Mrs Appiah - Rheumatoid Arthritis",
    rangeStart: 81,
    rangeEnd: 90,
    questionMarker: "**81.",
  },
  {
    caseId: "gppqe-2023-case-4-south-tongu",
    heading: "## CASE 1: South Tongu District - Emergency Response",
    rangeStart: 131,
    rangeEnd: 140,
    questionMarker: "**131.",
    stopBeforeSummary: true,
    summaryMarker: "Use the answer code below to answer questions 131-140",
  },
  {
    caseId: "gppqe-2023-case-5-community-pharmacy",
    heading: "## CASE 2: Community Pharmacy - Data Protection and Regulatory Issues",
    rangeStart: 141,
    rangeEnd: 150,
    questionMarker: "**141.",
  },
];

function scrambleDisplayNumber(index, total) {
  return ((index + 1) * 37) % total + 1;
}

function stripStars(value = "") {
  return String(value || "").replace(/\*\*/g, "").trim();
}

function splitBlocks(sourceText = "") {
  const text = String(sourceText || "").replace(/\r\n/g, "\n");
  const blocks = [];
  const blockPattern = /\*\*(\d+)\.\s*([\s\S]*?)(?=(?:\n\*\*\d+\.\s)|\s*$)/g;
  for (const match of text.matchAll(blockPattern)) {
    blocks.push(`**${match[1]}. ${String(match[2] || "").trim()}`);
  }
  return blocks;
}

function parseAnswerLetter(answerLine = "") {
  const match = String(answerLine || "").trim().match(/^([A-E])(?:\)|\b)/i);
  return match ? match[1].toUpperCase() : "";
}

function parseOptionLines(lines = []) {
  return lines
    .map((line) => String(line || "").trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^[A-E][\).\:\-]?\s*(.*)$/i);
      return match ? match[1].trim() : "";
    })
    .filter(Boolean);
}

function parseStatementLines(lines = []) {
  return lines
    .map((line) => String(line || "").trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(?:\(?\s*(?:[ivx]+|\d+)\s*\)?)[\).\:]?\s*(.*)$/i);
      return match ? match[1].trim() : "";
    })
    .filter(Boolean);
}

function parseAssertionStatements(prompt = "") {
  const parts = String(prompt || "").split(/\s+because\s+/i);
  if (parts.length >= 2) {
    return [parts[0].trim(), parts.slice(1).join(" because ").trim()].filter(Boolean);
  }
  return [String(prompt || "").trim()].filter(Boolean);
}

function extractCaseBlock(rawText = "", definition = {}) {
  const text = String(rawText || "").replace(/\r\n/g, "\n");
  const headingIndex = text.indexOf(definition.heading || "");
  if (headingIndex < 0) return "";

  const rangeMarker = `**(Questions ${definition.rangeStart}-${definition.rangeEnd} depend on this case)**`;
  const rangeIndex = text.indexOf(rangeMarker, headingIndex);
  if (rangeIndex < 0) return "";

  const contentStart = rangeIndex + rangeMarker.length;
  const questionMarker = definition.questionMarker || `**${definition.rangeStart}.`;
  const questionIndex = text.indexOf(questionMarker, contentStart);
  if (questionIndex < 0) return "";

  let caseBlock = text.slice(contentStart, questionIndex).trim();
  if (definition.stopBeforeSummary && definition.summaryMarker) {
    const summaryIndex = caseBlock.indexOf(definition.summaryMarker);
    if (summaryIndex >= 0) {
      caseBlock = caseBlock.slice(0, summaryIndex).trim();
    }
  }
  return caseBlock;
}

function buildCaseAssignments(rawText = "") {
  const assignments = new Map();
  for (const definition of CASE_DEFINITIONS) {
    const caseBlock = extractCaseBlock(rawText, definition);
    if (!caseBlock) continue;
    for (let sourceNumber = definition.rangeStart; sourceNumber <= definition.rangeEnd; sourceNumber++) {
      assignments.set(sourceNumber, {
        caseId: definition.caseId,
        caseBlock,
      });
    }
  }
  return assignments;
}

function buildQuestionFromBlock(blockText = "") {
  const headerMatch = blockText.match(/^\*\*(\d+)\.\s*([\s\S]*)$/);
  if (!headerMatch) return null;

  const sourceNumber = Number(headerMatch[1]);
  const body = String(headerMatch[2] || "").trim();
  const answerSplit = body.split(/\*\*Answer:\s*/);
  if (answerSplit.length < 2) return null;

  const preAnswer = stripStars(answerSplit[0]);
  const answerAndExplanation = String(answerSplit.slice(1).join("**Answer:")).trim();
  const explanationSplit = answerAndExplanation.split(/\*\*Explanation:\*\*/);
  const answerLine = stripStars(explanationSplit[0] || "");
  const answerTextOnly = answerLine.replace(/^[A-E][\)\.]\s*/i, "").trim();
  const explanation = stripStars(explanationSplit.slice(1).join("**Explanation:**"));
  const lines = preAnswer
    .split(/\n/)
    .map((line) => stripStars(line))
    .filter(Boolean);

  if (lines.length === 0) return null;

  const prompt = lines[0];
  const answerLetter = parseAnswerLetter(answerLine);
  const bodyText = `${prompt} ${lines.slice(1).join(" ")} ${explanation}`.trim();
  const category = normalizeMajorCategory("", bodyText);
  const lowerPrompt = prompt.toLowerCase();
  const optionLines = lines.slice(1).filter((line) => /^[A-E][\).\:\-]?\s*/i.test(line));
  const options = parseOptionLines(optionLines.length > 0 ? optionLines : lines.slice(1));
  const statementLines = lines.slice(1).filter((line) => /^(?:\(?\s*(?:[ivx]+|\d+)\s*\)?)[\).\:]?\s*/i.test(line));
  const statements = parseStatementLines(statementLines);

  const question = {
    sourceNumber,
    bank: "gppqe",
    year: 2023,
    sourceTag: "gppqe-2023",
    category: category || "General",
    question: prompt,
    explanation,
  };

  if (sourceNumber === 7 && /incomplete/i.test(answerLine)) {
    const visibleAnswer = options[0] || "";
    return {
      ...question,
      type: "single",
      options: options.length > 0 ? options : [visibleAnswer].filter(Boolean),
      correct: visibleAnswer || answerLine,
      answer: 0,
      sourceNote: "Source question is incomplete in the pasted text; only the visible option was imported.",
    };
  }

  if (sourceNumber === 25 && /incomplete/i.test(answerLine)) {
    return {
      ...question,
      type: "single",
      options,
      correct: answerLine,
      answer: null,
      sourceNote: "Source question is incomplete in the pasted text; the missing option could not be recovered.",
    };
  }

  if (sourceNumber === 41 && /hence/i.test(prompt)) {
    const [firstStatement, secondStatement] = prompt.split(/\s+hence\s+/i).map((part) => part.trim());
    return {
      ...question,
      type: "combo",
      comboVariant: "assertion-5",
      statements: [firstStatement, secondStatement].filter(Boolean),
      options: ASSERTION_COMBO_OPTIONS.slice(),
      correct: "D",
      answer: 3,
      sourceNote: "Source prompt was compressed into one line; the assertion/reason structure was reconstructed from the prompt and explanation.",
    };
  }

  if (sourceNumber >= 54 && sourceNumber <= 57) {
    const correctIndex = answerLetter.charCodeAt(0) - 65;
    const correctText =
      Number.isInteger(correctIndex) && correctIndex >= 0 && correctIndex < SHARED_54_57_OPTIONS.length
        ? SHARED_54_57_OPTIONS[correctIndex]
        : answerLine.replace(/^[A-E][\)\.]\s*/i, "").trim();
    return {
      ...question,
      type: "single",
      options: SHARED_54_57_OPTIONS.slice(),
      correct: correctText,
      answer: Number.isInteger(correctIndex) && correctIndex >= 0 ? correctIndex : undefined,
    };
  }

  if (sourceNumber === 109) {
    const correctIndex = 3;
    return {
      ...question,
      type: "combo",
      comboVariant: "table-4",
      statements,
      options: MULTI_121_130_OPTIONS.slice(),
      correct: MULTI_121_130_OPTIONS[correctIndex],
      answer: correctIndex,
      sourceNote: "The source answer line was truncated; the explanation identifies only statement III as correct.",
    };
  }

  if (sourceNumber >= 51 && sourceNumber <= 55 && statements.length > 0 && answerLetter) {
    const correctIndex = answerLetter.charCodeAt(0) - 65;
    const correctText =
      Number.isInteger(correctIndex) && correctIndex >= 0 && correctIndex < MULTI_51_55_OPTIONS.length
        ? MULTI_51_55_OPTIONS[correctIndex]
        : answerLine.replace(/^[A-E][\)\.]\s*/i, "").trim();
    return {
      ...question,
      type: "combo",
      comboVariant: "table-4",
      statements,
      options: MULTI_51_55_OPTIONS.slice(),
      correct: correctText,
      answer: Number.isInteger(correctIndex) && correctIndex >= 0 ? correctIndex : undefined,
    };
  }

  if (sourceNumber >= 81 && sourceNumber <= 90 && statements.length > 0 && answerLetter) {
    const correctIndex = answerLetter.charCodeAt(0) - 65;
    const correctText =
      Number.isInteger(correctIndex) && correctIndex >= 0 && correctIndex < MULTI_81_90_OPTIONS.length
        ? MULTI_81_90_OPTIONS[correctIndex]
        : answerLine.replace(/^[A-E][\)\.]\s*/i, "").trim();
    return {
      ...question,
      type: "combo",
      comboVariant: "table-4",
      statements,
      options: MULTI_81_90_OPTIONS.slice(),
      correct: correctText,
      answer: Number.isInteger(correctIndex) && correctIndex >= 0 ? correctIndex : undefined,
    };
  }

  if (sourceNumber >= 121 && sourceNumber <= 130 && statements.length > 0 && answerLetter) {
    const correctIndex = answerLetter.charCodeAt(0) - 65;
    const correctText =
      Number.isInteger(correctIndex) && correctIndex >= 0 && correctIndex < MULTI_121_130_OPTIONS.length
        ? MULTI_121_130_OPTIONS[correctIndex]
        : answerLine.replace(/^[A-E][\)\.]\s*/i, "").trim();
    return {
      ...question,
      type: "combo",
      comboVariant: "table-4",
      statements,
      options: MULTI_121_130_OPTIONS.slice(),
      correct: correctText,
      answer: Number.isInteger(correctIndex) && correctIndex >= 0 ? correctIndex : undefined,
    };
  }

  if (lines.length === 1 && /^(TRUE|FALSE)$/i.test(answerTextOnly)) {
    const correctIndex = answerTextOnly.toUpperCase() === "TRUE" ? 0 : 1;
    return {
      ...question,
      type: "single",
      options: ["TRUE", "FALSE"],
      correct: correctIndex === 0 ? "TRUE" : "FALSE",
      answer: correctIndex,
    };
  }

  const isAssertion =
    /statement\s*1:/i.test(preAnswer) ||
    /relation:/i.test(preAnswer) ||
    (/(\s|^)because(\s|$)/i.test(prompt) && answerLetter);

  if (isAssertion) {
    if (!answerLetter) return null;
    const [firstStatement, secondStatement] = parseAssertionStatements(prompt);
    return {
      ...question,
      type: "combo",
      comboVariant: "assertion-5",
      statements: [firstStatement, secondStatement],
      options: ASSERTION_COMBO_OPTIONS.slice(),
      correct: answerLetter,
      answer: answerLetter.charCodeAt(0) - 65,
    };
  }

  if (statements.length > 0 && options.length > 0 && answerLetter) {
    const correctIndex = answerLetter.charCodeAt(0) - 65;
    const correctText =
      Number.isInteger(correctIndex) && correctIndex >= 0 && correctIndex < options.length
        ? options[correctIndex]
        : answerLine.replace(/^[A-E][\)\.]\s*/i, "").trim();
    return {
      ...question,
      type: "combo",
      comboVariant: "table-4",
      statements,
      options,
      correct: correctText,
      answer: Number.isInteger(correctIndex) && correctIndex >= 0 ? correctIndex : undefined,
    };
  }

  if (options.length > 0 && answerLetter) {
    const correctIndex = answerLetter.charCodeAt(0) - 65;
    const correctText =
      Number.isInteger(correctIndex) && correctIndex >= 0 && correctIndex < options.length
        ? options[correctIndex]
        : answerLine.replace(/^[A-E][\)\.]\s*/i, "").trim();
    return {
      ...question,
      type: lowerPrompt.startsWith("match the following") ? "match" : "single",
      options,
      correct: correctText,
      answer: Number.isInteger(correctIndex) && correctIndex >= 0 ? correctIndex : undefined,
    };
  }

  return null;
}

function sortBySourceNumberThenOrder(a, b) {
  const diff = Number(a?.sourceNumber || 0) - Number(b?.sourceNumber || 0);
  if (diff !== 0) return diff;
  return Number(a?.sourceOrder || 0) - Number(b?.sourceOrder || 0);
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    throw new Error("Usage: node scripts/import-gppqe-2023.mjs <path-to-pasted-text.txt>");
  }

  const rawText = await fs.readFile(inputPath, "utf8");
  const caseAssignments = buildCaseAssignments(rawText);
  const blocks = splitBlocks(rawText);
  const parsedQuestions = blocks
    .map((blockText, index) => ({ question: buildQuestionFromBlock(blockText), sourceOrder: index }))
    .filter((entry) => Boolean(entry.question))
    .map(({ question, sourceOrder }) => ({ ...question, sourceOrder }))
    .sort(sortBySourceNumberThenOrder)
    .map((question) => {
      const caseMeta = caseAssignments.get(question.sourceNumber);
      return caseMeta ? { ...question, ...caseMeta } : question;
    });

  if (parsedQuestions.length === 0) {
    throw new Error("No questions could be parsed from the provided file.");
  }

  const raw = await fs.readFile(backendQuestionsPath, "utf8");
  const existing = JSON.parse(raw);
  if (!Array.isArray(existing)) {
    throw new Error("backend/data/questions.json is not an array");
  }

  const cleanedExisting = existing.filter(
    (question) =>
      !(
        String(question?.bank || "main").trim().toLowerCase() === "gppqe" &&
        Number(question?.year) === 2023 &&
        String(question?.sourceTag || "") === "gppqe-2023"
      ),
  );

  const maxId = cleanedExisting.reduce((max, question) => {
    const value = Number(question?.id);
    return Number.isFinite(value) && value > max ? value : max;
  }, 0);

  const total = parsedQuestions.length;
  const reindexedQuestions = parsedQuestions.map((question, index) => {
    const displayNumber = scrambleDisplayNumber(index, total);
    return {
      ...question,
      id: maxId + index + 1,
      displayNumber,
    };
  });

  const output = [...cleanedExisting, ...reindexedQuestions].sort((a, b) => Number(a.id) - Number(b.id));
  const serialized = JSON.stringify(output, null, 2);
  await fs.writeFile(backendQuestionsPath, serialized, "utf8");
  await fs.writeFile(rootQuestionsPath, serialized, "utf8");

  console.log(
    `Imported ${reindexedQuestions.length} GPPQE 2023 items into backend/data/questions.json and data/questions.json.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
