import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const rootDir = path.resolve(process.cwd());
const batchDir = path.join(rootDir, "www", "question-batches");

const titledPatientPattern =
  /\b(Mr\.?\s+[A-Z][A-Za-z-]*|Mrs\.?\s+[A-Z][A-Za-z-]*|Ms\.?\s+[A-Z][A-Za-z-]*|Miss\s+[A-Z][A-Za-z-]*|Dr\.?\s+[A-Z][A-Za-z-]*)\b/;
const contextOnlyPattern =
  /\b(above patient|above case|above prescription|above treatment|same laboratory|same patient|based on your answer|does he have|does she have)\b/i;
const comboOnlyOptionPattern =
  /^(?:[A-D]\.\s*)?(?:I|II|III|IV|1|2|3|4)(?:\s*(?:,|&|and)\s*(?:I|II|III|IV|1|2|3|4))*\s*(?:only)?$/i;
const mojibakePattern = /Ã|Â|â€™|â€œ|â€|�/;
const excludedPossessives = new Set([
  "parkinson",
  "wernicke",
  "kaposi",
  "ghana",
  "graves",
  "hashimoto",
  "ludwig",
  "vincent",
  "kournis",
  "light",
]);

function hasLikelyPatientPossessive(text = "") {
  const matches = text.match(/\b([A-Z][a-z]{2,})'s\b/g) || [];
  return matches.some((token) => {
    const name = token.replace(/'s\b/, "").toLowerCase();
    return !excludedPossessives.has(name);
  });
}

function classifyQuestion(question = {}) {
  const id = Number(question?.id);
  const text = String(question?.question || "");
  const options = Array.isArray(question?.options)
    ? question.options.map((option) => String(option || ""))
    : [];
  const statements = Array.isArray(question?.statements)
    ? question.statements.map((statement) => String(statement || ""))
    : [];
  const correct = String(question?.correct ?? "");
  const explanation = String(question?.explanation || "");
  const explainCorrect = String(question?.explainCorrect || "");
  const type = String(question?.type || "single");
  const hasCaseId = String(question?.caseId || "").trim().length > 0;
  const hasCaseBlock = String(question?.caseBlock || "").trim().length > 0;
  const hasCase = hasCaseId && hasCaseBlock;

  const findings = [];

  if (!text.trim()) findings.push("missing question text");
  if ((type === "single" || type === "multiple") && options.length === 0) {
    findings.push("missing options");
  }
  if (type === "combo" && statements.length === 0) {
    findings.push("combo question missing statements");
  }
  if (type === "combo" && !/^[A-E]$/i.test(correct)) {
    findings.push("combo question has invalid correct letter");
  }
  if (type === "single" && options.length > 0 && correct && !options.includes(correct)) {
    findings.push("correct answer not found in options");
  }
  if (!explanation.trim()) findings.push("missing explanation");
  if (!explainCorrect.trim()) findings.push("missing explainCorrect");

  if ((titledPatientPattern.test(text) || hasLikelyPatientPossessive(text)) && !hasCase) {
    findings.push("named patient without case metadata");
  }
  if (contextOnlyPattern.test(text) && !hasCase) {
    findings.push("context-dependent question without case metadata");
  }

  const allText = [text, ...options, correct, explanation, explainCorrect].join(" ");
  if (mojibakePattern.test(allText)) {
    findings.push("contains mojibake/encoding corruption");
  }

  const hasComboOnlyOptions =
    options.length > 0 && options.every((option) => comboOnlyOptionPattern.test(option.trim()));
  if (hasComboOnlyOptions) {
    findings.push("combination-only options with no visible source statements");
  }

  if (/question\s+\d+/i.test(text) && /based on your answer/i.test(text)) {
    findings.push("references another question number; verify numbering/source linkage");
  }

  return {
    id,
    question: text,
    findings,
  };
}

async function loadBatchQuestions(filePath) {
  const moduleUrl = pathToFileURL(filePath).href;
  const imported = await import(moduleUrl);
  return Object.values(imported).filter(Array.isArray).flat();
}

async function main() {
  if (!fs.existsSync(batchDir)) {
    throw new Error(`Question batch directory not found: ${batchDir}`);
  }

  const files = fs
    .readdirSync(batchDir)
    .filter((entry) => entry.toLowerCase().endsWith(".js"))
    .sort((a, b) => a.localeCompare(b));

  for (const file of files) {
    const questions = await loadBatchQuestions(path.join(batchDir, file));
    const flagged = questions
      .map((question) => classifyQuestion(question))
      .filter((row) => row.findings.length > 0);

    console.log(`===== ${file} (${questions.length}) =====`);
    if (flagged.length === 0) {
      console.log("NO_ISSUES");
      continue;
    }
    for (const row of flagged) {
      console.log(`${row.id}: ${row.findings.join("; ")}`);
      console.log(`  ${row.question}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
