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

const CASE_DEFINITIONS = [
  {
    caseId: "gppqe-2021-case-1",
    heading: "## CASE 1: K.B - Adolescent Depression",
    rangeStart: 40,
    rangeEnd: 41,
    questionMarker: "**40.",
  },
  {
    caseId: "gppqe-2021-case-3",
    heading: "## CASE 3: Mr AT - COPD and Hepatitis B",
    rangeStart: 111,
    rangeEnd: 120,
    questionMarker: "**111.",
  },
  {
    caseId: "gppqe-2021-case-4",
    heading: "## CASE 4: Mr KO - Type 2 Diabetes, Hypertension, Obesity",
    rangeStart: 121,
    rangeEnd: 130,
    questionMarker: "**121.",
  },
  {
    caseId: "gppqe-2021-case-5",
    heading: "## CASE 5: Mr PK - Possession of Codeine-containing Syrup",
    rangeStart: 131,
    rangeEnd: 140,
    questionMarker: "**131.",
    stopBeforeSummary: true,
  },
];

const TABLE_COMBO_OPTIONS = [
  "I, II and III",
  "II and III only",
  "I only",
  "III only",
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

function parseRomanStatements(lines = []) {
  return lines
    .map((line) => String(line || "").trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^[IVX]+\.\s*(.*)$/i);
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

function parseRomanAnswer(answerLine = "") {
  const trimmed = String(answerLine || "").trim();
  const singleMatch = trimmed.match(/^([IVX]+)\.\s*(.+)$/i);
  if (singleMatch) {
    return {
      kind: "single",
      roman: singleMatch[1].toUpperCase(),
      text: singleMatch[2].trim(),
    };
  }

  const normalized = trimmed.toUpperCase().replace(/[.,]/g, " ").replace(/\s+/g, " ").trim();
  const romans = normalized.match(/\b(?:III|II|I)\b/g) || [];
  if (romans.length > 0) {
    return {
      kind: "subset",
      romans,
    };
  }

  return { kind: "none" };
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
  if (definition.stopBeforeSummary) {
    const summaryIndex = caseBlock.indexOf("Use the answer code summary below");
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
  const isAssertion =
    /statement\s*1:/i.test(preAnswer) ||
    /relation:/i.test(preAnswer) ||
    (/(\s|^)because(\s|$)/i.test(prompt) && answerLetter);
  const hasRomanStatements = lines.some((line) => /^[IVX]+\.\s*/i.test(line));
  const romanAnswer = hasRomanStatements ? parseRomanAnswer(answerLine) : { kind: "none" };
  const optionLines = lines.slice(1).filter((line) => /^[A-E][\).\:\-]?\s*/i.test(line));

  const question = {
    sourceNumber,
    bank: "gppqe",
    year: 2021,
    sourceTag: "gppqe-2021",
    category: category || "General",
    question: prompt,
    explanation,
  };

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

  if (hasRomanStatements) {
    const romanStatements = parseRomanStatements(lines.slice(1));

    if (romanAnswer.kind === "single") {
      const romanIndexMap = { I: 0, II: 1, III: 2, IV: 3, V: 4 };
      const choiceIndex = romanIndexMap[romanAnswer.roman];
      const correctText =
        Number.isInteger(choiceIndex) && choiceIndex >= 0 && choiceIndex < romanStatements.length
          ? romanStatements[choiceIndex]
          : romanAnswer.text;
      return {
        ...question,
        type: "single",
        options: romanStatements,
        correct: correctText,
        answer: Number.isInteger(choiceIndex) && choiceIndex >= 0 ? choiceIndex : undefined,
      };
    }

    if (romanAnswer.kind === "subset") {
      const subsetKey = romanAnswer.romans.join(",");
      const subsetMap = {
        "I,II,III": "A",
        "I,II": "B",
        "II,III": "C",
        I: "D",
        III: "E",
      };
      const correctLetter = subsetMap[subsetKey];
      if (correctLetter) {
        return {
          ...question,
          type: "combo",
          comboVariant: "three-statement",
          statements: romanStatements,
          correct: correctLetter,
          answer: correctLetter.charCodeAt(0) - 65,
        };
      }
    }

    if (!answerLetter) return null;
    return {
      ...question,
      type: "combo",
      comboVariant: "table-4",
      statements: romanStatements,
      options: TABLE_COMBO_OPTIONS.slice(),
      correct: answerLetter,
      answer: answerLetter.charCodeAt(0) - 65,
    };
  }

  const options = parseOptionLines(optionLines.length > 0 ? optionLines : lines.slice(1));
  if (options.length > 0 && answerLetter) {
    const correctIndex = answerLetter.charCodeAt(0) - 65;
    const correctText =
      Number.isInteger(correctIndex) && correctIndex >= 0 && correctIndex < options.length
        ? options[correctIndex]
        : answerLine.replace(/^[A-E]\)\s*/i, "").trim();
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

function sortById(a, b) {
  return Number(a?.id || 0) - Number(b?.id || 0);
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    throw new Error("Usage: node scripts/import-gppqe-2021.mjs <path-to-pasted-text.txt>");
  }

  const rawText = await fs.readFile(inputPath, "utf8");
  const caseAssignments = buildCaseAssignments(rawText);
  const blocks = splitBlocks(rawText);
  const parsedQuestions = blocks
    .map(buildQuestionFromBlock)
    .filter(Boolean)
    .sort((a, b) => a.sourceNumber - b.sourceNumber)
    .map((question) => {
      const caseMeta = caseAssignments.get(question.sourceNumber);
      return caseMeta ? { ...question, ...caseMeta } : question;
    });

  if (parsedQuestions.length === 0) {
    throw new Error("No questions could be parsed from the provided file.");
  }

  const quizReadyQuestions = parsedQuestions.filter((question) => question.type !== "note");
  const displayNumberBySourceNumber = new Map(
    quizReadyQuestions.map((question, index) => [
      question.sourceNumber,
      scrambleDisplayNumber(index, quizReadyQuestions.length),
    ]),
  );

  const raw = await fs.readFile(backendQuestionsPath, "utf8");
  const existing = JSON.parse(raw);
  if (!Array.isArray(existing)) {
    throw new Error("backend/data/questions.json is not an array");
  }

  const cleanedExisting = existing.filter(
    (question) =>
      !(
        String(question?.bank || "main").trim().toLowerCase() === "gppqe" &&
        Number(question?.year) === 2021 &&
        String(question?.sourceTag || "") === "gppqe-2021"
      ),
  );

  const maxId = cleanedExisting.reduce((max, question) => {
    const value = Number(question?.id);
    return Number.isFinite(value) && value > max ? value : max;
  }, 0);

  const reindexedQuestions = parsedQuestions.map((question, index) => {
    const displayNumber =
      question.type === "note" ? undefined : displayNumberBySourceNumber.get(question.sourceNumber);
    return {
      ...question,
      id: maxId + index + 1,
      displayNumber,
    };
  });

  const output = [...cleanedExisting, ...reindexedQuestions].sort(sortById);
  const serialized = JSON.stringify(output, null, 2);
  await fs.writeFile(backendQuestionsPath, serialized, "utf8");
  await fs.writeFile(rootQuestionsPath, serialized, "utf8");

  console.log(
    `Imported ${reindexedQuestions.length} GPPQE 2021 items into backend/data/questions.json and data/questions.json.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
