import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.join(__dirname, "..", "..");
const quizRoot = path.join(backendRoot, "..");

const dataJsPath = path.join(quizRoot, "data.js");
const questionsPath = path.join(backendRoot, "data", "questions.json");
const attemptsPath = path.join(backendRoot, "data", "attempts.json");
const syncPerformancePath = path.join(backendRoot, "data", "syncPerformance.json");
const backupsRoot = path.join(backendRoot, "backups");

function parseFlags(argv) {
  const args = new Set(argv.slice(2));
  return {
    apply: args.has("--apply"),
  };
}

function formatStamp(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  const yyyy = String(date.getUTCFullYear());
  const mm = pad(date.getUTCMonth() + 1);
  const dd = pad(date.getUTCDate());
  const hh = pad(date.getUTCHours());
  const min = pad(date.getUTCMinutes());
  const ss = pad(date.getUTCSeconds());
  return `${yyyy}${mm}${dd}_${hh}${min}${ss}`;
}

function ensurePositiveInt(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
}

function uniqueQuestionIds(questions) {
  const ids = [];
  const seen = new Set();
  for (const row of questions) {
    const id = ensurePositiveInt(row?.id);
    if (!id) {
      throw new Error(`Invalid question id detected: ${row?.id}`);
    }
    if (seen.has(id)) {
      throw new Error(`Duplicate question id detected: ${id}`);
    }
    seen.add(id);
    ids.push(id);
  }
  return ids;
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildDerangement(ids) {
  if (ids.length < 2) {
    throw new Error("Need at least 2 questions to renumber.");
  }

  for (let tries = 0; tries < 1000; tries += 1) {
    const perm = shuffle(ids);
    const fixedPoints = perm.filter((value, index) => value === ids[index]).length;
    if (fixedPoints > 0) continue;

    const map = new Map();
    ids.forEach((oldId, index) => {
      map.set(oldId, perm[index]);
    });
    return map;
  }

  throw new Error("Unable to create derangement mapping after many attempts.");
}

function updateQuestionPrefix(questionText, nextId) {
  const text = String(questionText || "");
  if (!/^Q\d+\.\s*/.test(text)) return text;
  return text.replace(/^Q\d+\.\s*/, `Q${nextId}. `);
}

function transformQuestionRow(row, idMap) {
  const currentId = ensurePositiveInt(row?.id);
  if (!currentId) {
    throw new Error(`Encountered invalid question id while transforming: ${row?.id}`);
  }
  const nextId = idMap.get(currentId);
  if (!nextId) {
    throw new Error(`Missing ID mapping for question ${currentId}`);
  }
  return {
    ...row,
    id: nextId,
    question: updateQuestionPrefix(row?.question, nextId),
  };
}

function transformAttempt(attempt, idMap) {
  const next = { ...attempt };
  const list = Array.isArray(next.questionIds) ? next.questionIds : [];
  next.questionIds = list.map((value) => {
    const id = ensurePositiveInt(value);
    return id && idMap.has(id) ? idMap.get(id) : value;
  });

  const answers = next.answers && typeof next.answers === "object" ? next.answers : {};
  const transformedAnswers = {};
  for (const [key, value] of Object.entries(answers)) {
    const parsed = ensurePositiveInt(key);
    if (parsed && idMap.has(parsed)) {
      transformedAnswers[String(idMap.get(parsed))] = value;
    } else {
      transformedAnswers[String(key)] = value;
    }
  }
  next.answers = transformedAnswers;
  return next;
}

function transformSyncPerformanceRow(row, idMap) {
  const next = { ...row };
  const questionId = ensurePositiveInt(next.questionId);
  if (questionId && idMap.has(questionId)) {
    next.questionId = idMap.get(questionId);
  }
  return next;
}

async function readJsonFile(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function writeJsonFile(filePath, data) {
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function copyFileIntoDir(sourcePath, outputDir) {
  const baseName = path.basename(sourcePath);
  const targetPath = path.join(outputDir, baseName);
  await fs.copyFile(sourcePath, targetPath);
  return targetPath;
}

async function run() {
  const { apply } = parseFlags(process.argv);
  const mode = apply ? "APPLY" : "DRY-RUN";

  const moduleUrl = `${pathToFileURL(dataJsPath).href}?renumber=${Date.now()}`;
  const imported = await import(moduleUrl);
  const sourceQuestions = Array.isArray(imported.baseQuestions)
    ? imported.baseQuestions
    : [];

  if (sourceQuestions.length < 2) {
    throw new Error("Quiz/data.js does not contain enough questions to renumber.");
  }

  const sourceIds = uniqueQuestionIds(sourceQuestions);
  const idMap = buildDerangement(sourceIds);

  const transformedFrontendQuestions = sourceQuestions.map((row) =>
    transformQuestionRow(row, idMap),
  );

  const backendQuestions = await readJsonFile(questionsPath);
  const transformedBackendQuestions = backendQuestions.map((row) =>
    transformQuestionRow(row, idMap),
  );

  const attempts = await readJsonFile(attemptsPath);
  const transformedAttempts = attempts.map((row) => transformAttempt(row, idMap));

  const syncPerformance = await readJsonFile(syncPerformancePath);
  const transformedSyncPerformance = syncPerformance.map((row) =>
    transformSyncPerformanceRow(row, idMap),
  );

  const mappingRows = sourceIds
    .slice()
    .sort((a, b) => a - b)
    .map((oldId) => ({
      oldId,
      newId: idMap.get(oldId),
    }));

  const unchanged = mappingRows.filter((row) => row.oldId === row.newId);
  if (unchanged.length > 0) {
    throw new Error("Derangement safeguard failed: some IDs did not change.");
  }

  console.log(`[${mode}] Questions detected: ${sourceQuestions.length}`);
  console.log(`[${mode}] Mapping entries: ${mappingRows.length}`);
  console.log(
    `[${mode}] Sample map: ${mappingRows
      .slice(0, 10)
      .map((row) => `${row.oldId}->${row.newId}`)
      .join(", ")}`,
  );

  if (!apply) {
    console.log(`[${mode}] No files were modified. Re-run with --apply to execute.`);
    return;
  }

  const backupDir = path.join(
    backupsRoot,
    `renumber_question_ids_${formatStamp(new Date())}`,
  );
  await fs.mkdir(backupDir, { recursive: true });

  await copyFileIntoDir(dataJsPath, backupDir);
  await copyFileIntoDir(questionsPath, backupDir);
  await copyFileIntoDir(attemptsPath, backupDir);
  await copyFileIntoDir(syncPerformancePath, backupDir);

  await fs.writeFile(
    path.join(backupDir, "id-map.json"),
    `${JSON.stringify(mappingRows, null, 2)}\n`,
    "utf8",
  );

  const frontendModuleText = `export const baseQuestions = ${JSON.stringify(
    transformedFrontendQuestions,
    null,
    2,
  )};\n`;

  await fs.writeFile(dataJsPath, frontendModuleText, "utf8");
  await writeJsonFile(questionsPath, transformedBackendQuestions);
  await writeJsonFile(attemptsPath, transformedAttempts);
  await writeJsonFile(syncPerformancePath, transformedSyncPerformance);

  console.log(`[APPLY] Backup created: ${backupDir}`);
  console.log("[APPLY] Updated files:");
  console.log(` - ${dataJsPath}`);
  console.log(` - ${questionsPath}`);
  console.log(` - ${attemptsPath}`);
  console.log(` - ${syncPerformancePath}`);
  console.log("[APPLY] Completed one-time renumbering.");
}

run().catch((error) => {
  console.error("Question ID renumbering failed:", error?.stack || error?.message || error);
  process.exitCode = 1;
});
