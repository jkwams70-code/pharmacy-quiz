import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeMajorCategory } from "../backend/src/categoryTaxonomy.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const backendQuestionsPath = path.join(repoRoot, "backend", "data", "questions.json");
const rootQuestionsPath = path.join(repoRoot, "data", "questions.json");

const TABLE_COMBO_OPTIONS = [
  "I, II and III",
  "II and III only",
  "I only",
  "III only",
];

const ASSERTION_COMBO_OPTIONS = [
  "First statement is TRUE, Second statement is TRUE and they are RELATED",
  "First statement is TRUE, Second statement is TRUE but they are NOT related",
  "First statement is TRUE but Second statement is FALSE",
  "First statement is FALSE but Second statement is TRUE",
  "Both statements are FALSE",
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
      const match = line.match(/^[a-e]\)\s*(.*)$/i);
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
  const optionLines = lines.slice(1).filter((line) => /^[a-e]\)\s*/i.test(line));

  let question = {
    sourceNumber,
    bank: "gppqe",
    year: 2014,
    sourceTag: "gppqe-2014-december",
    category: category || "General",
    question: prompt,
    explanation,
  };

  if (isAssertion) {
    const [firstStatement, secondStatement] = parseAssertionStatements(prompt);
    question = {
      ...question,
      type: "combo",
      comboVariant: "assertion-5",
      statements: [firstStatement, secondStatement],
      options: ASSERTION_COMBO_OPTIONS.slice(),
      correct: answerLetter,
      answer: answerLetter ? answerLetter.charCodeAt(0) - 65 : undefined,
    };
    return question;
  }

  if (hasRomanStatements) {
    const statements = parseRomanStatements(lines.slice(1));
    question = {
      ...question,
      type: "combo",
      comboVariant: "table-4",
      statements,
      options: TABLE_COMBO_OPTIONS.slice(),
      correct: answerLetter,
      answer: answerLetter ? answerLetter.charCodeAt(0) - 65 : undefined,
    };
    return question;
  }

  const options = parseOptionLines(optionLines.length > 0 ? optionLines : lines.slice(1));
  if (options.length > 0) {
    const correctIndex = answerLetter ? answerLetter.charCodeAt(0) - 65 : -1;
    const correctText =
      Number.isInteger(correctIndex) && correctIndex >= 0 && correctIndex < options.length
        ? options[correctIndex]
        : answerLine.replace(/^[A-E]\)\s*/i, "").trim();
    question = {
      ...question,
      type: lowerPrompt.startsWith("match the following") ? "match" : "single",
      options,
      correct: correctText,
      answer: Number.isInteger(correctIndex) && correctIndex >= 0 ? correctIndex : undefined,
    };
    return question;
  }

  return null;
}

function sortById(a, b) {
  return Number(a?.id || 0) - Number(b?.id || 0);
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    throw new Error("Usage: node scripts/import-gppqe-2014-december.mjs <path-to-pasted-text.txt>");
  }

  const rawText = await fs.readFile(inputPath, "utf8");
  const blocks = splitBlocks(rawText);
  const parsedQuestions = blocks
    .map(buildQuestionFromBlock)
    .filter(Boolean)
    .sort((a, b) => a.sourceNumber - b.sourceNumber);

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
        Number(question?.year) === 2014 &&
        String(question?.sourceTag || "") === "gppqe-2014-december"
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
    `Imported ${reindexedQuestions.length} GPPQE 2014 December items into backend/data/questions.json and data/questions.json.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
