import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const inputPath = path.join(root, "data", "questions.json");
const args = process.argv.slice(2);
const outArgIndex = args.indexOf("--out");
const outputPath = outArgIndex >= 0 && args[outArgIndex + 1]
  ? path.resolve(args[outArgIndex + 1])
  : "";

const raw = JSON.parse(await fs.readFile(inputPath, "utf8"));
const questions = Array.isArray(raw) ? raw : [];
const issues = [];
const byQuestion = new Map();
const seenIds = new Map();
const mojibakePattern = /(Ã.|Â.|â€|ï¿½|ðŸ)/;

function text(value) {
  return String(value ?? "").trim();
}

function normalizedQuestion(value) {
  return text(value)
    .replace(/^q\s*\d+\s*[.)-]?\s*/i, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function addIssue(question, code, severity, detail) {
  issues.push({
    id: question?.id ?? null,
    type: text(question?.type) || "unknown",
    severity,
    code,
    detail,
  });
}

for (const question of questions) {
  const id = Number(question?.id);
  const type = text(question?.type).toLowerCase() || "single";
  const questionText = text(question?.question || question?.text);
  const options = Array.isArray(question?.options) ? question.options.map(text) : [];
  const statements = Array.isArray(question?.statements) ? question.statements.map(text) : [];
  const correct = text(question?.correct);
  const key = normalizedQuestion(questionText);

  if (!Number.isInteger(id)) addIssue(question, "invalid_id", "error", "Question ID is missing or not an integer.");
  else if (seenIds.has(id)) addIssue(question, "duplicate_id", "error", `Duplicate question ID; first seen at record ${seenIds.get(id)}.`);
  else seenIds.set(id, questions.indexOf(question) + 1);

  if (!questionText) addIssue(question, "missing_question", "error", "Question text is empty.");
  else if (questionText.length < 12) addIssue(question, "very_short_question", "warning", "Question text is unusually short.");
  if (mojibakePattern.test(JSON.stringify(question))) addIssue(question, "encoding_damage", "warning", "Record contains likely mojibake or replacement characters.");

  if (type === "combo") {
    if (statements.length < 2) addIssue(question, "combo_missing_statements", "error", "Combo question has fewer than two statements.");
    if (!correct) addIssue(question, "combo_missing_answer", "error", "Combo answer is empty.");
    else if (!/^[A-E]$/i.test(correct)) addIssue(question, "combo_legacy_answer_label", "warning", `Combo answer uses legacy text: ${correct}.`);
  } else if (type === "single" || type === "match") {
    if (options.length < 2) addIssue(question, "missing_options", "error", "Question has fewer than two options.");
    if (!correct) addIssue(question, "missing_correct_answer", "error", "Correct answer is empty.");
    else if (options.length && !options.some((option) => option === correct)) {
      addIssue(question, "answer_not_in_options", "error", "Correct answer does not exactly match any option.");
    }
    if (new Set(options.map((option) => option.toLowerCase())).size !== options.length) {
      addIssue(question, "duplicate_options", "warning", "Two or more options are identical after case normalization.");
    }
  } else {
    addIssue(question, "unknown_type", "warning", `Question type ${type} is not covered by the validator.`);
  }

  if (!text(question?.explanation) && !text(question?.explainCorrect)) {
    addIssue(question, "missing_explanation", "warning", "Question has no explanation or correct-answer explanation.");
  }
  if (key) {
    const previous = byQuestion.get(key);
    if (previous) addIssue(question, "duplicate_question_text", "warning", `Same normalized question text as question ${previous}.`);
    else byQuestion.set(key, id);
  }
}

const summary = {
  generatedAt: new Date().toISOString(),
  source: path.relative(root, inputPath),
  questionCount: questions.length,
  issueCount: issues.length,
  errorCount: issues.filter((issue) => issue.severity === "error").length,
  warningCount: issues.filter((issue) => issue.severity === "warning").length,
  byCode: Object.fromEntries(
    [...issues.reduce((map, issue) => map.set(issue.code, (map.get(issue.code) || 0) + 1), new Map())]
      .sort(([a], [b]) => a.localeCompare(b)),
  ),
  issues,
};

if (outputPath) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(summary, null, 2)}\n`);
}

console.log(JSON.stringify({
  source: summary.source,
  questionCount: summary.questionCount,
  issueCount: summary.issueCount,
  errorCount: summary.errorCount,
  warningCount: summary.warningCount,
  byCode: summary.byCode,
  output: outputPath || null,
}, null, 2));