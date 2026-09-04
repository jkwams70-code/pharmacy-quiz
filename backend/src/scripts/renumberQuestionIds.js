import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.join(__dirname, "..", "..");
const quizRoot = path.join(backendRoot, "..");

const dataJsPath = path.join(quizRoot, "data.js");
const questionsPath = path.join(backendRoot, "data", "questions.json");
const attemptsPath = path.join(backendRoot, "data", "attempts.json");
const syncPerformancePath = path.join(backendRoot, "data", "syncPerformance.json");
const usersPath = path.join(backendRoot, "data", "users.json");
const backupsRoot = path.join(backendRoot, "backups");
const PERMANENT_REORDER_SEED = "20260325-permanent-bank-reshuffle-v1";

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

function buildSequentialIdMap(questions) {
  const ids = uniqueQuestionIds(questions);
  const map = new Map();
  ids.forEach((oldId, index) => {
    map.set(oldId, index + 1);
  });
  return map;
}

function stableHash(input) {
  return crypto.createHash("sha256").update(String(input)).digest("hex");
}

function deriveCaseGroupKey(row) {
  const questionText = String(row?.question || row?.text || "");
  const match = questionText.match(/^Case\s+(\d+)([A-Z])\.\s*/i);
  if (!match) return null;
  const topicSlug = String(row?.topicSlug || "").trim().toLowerCase();
  if (!topicSlug) return null;
  return `${topicSlug}::case-${match[1]}`;
}

function deriveCaseSortLetter(row) {
  const questionText = String(row?.question || row?.text || "");
  const match = questionText.match(/^Case\s+\d+([A-Z])\.\s*/i);
  return match ? String(match[1]).toUpperCase() : "";
}

function deriveSingleQuestionKey(row, index) {
  const topicSlug = String(row?.topicSlug || "").trim().toLowerCase();
  const category = String(row?.category || "").trim().toLowerCase();
  const type = String(row?.type || "").trim().toLowerCase();
  const questionText = String(row?.question || row?.text || "").trim();
  if (questionText) {
    return `single:${topicSlug}:${category}:${type}:${questionText}`;
  }
  return `single:fallback:${Number(row?.id) || index + 1}`;
}

function buildQuestionBlocks(questions) {
  const blocks = [];
  const caseBlocks = new Map();

  questions.forEach((row, index) => {
    const caseKey = deriveCaseGroupKey(row);
    if (!caseKey) {
      blocks.push({
        key: deriveSingleQuestionKey(row, index),
        questions: [{ ...row, __sourceIndex: index }],
        order: index,
      });
      return;
    }

    let block = caseBlocks.get(caseKey);
    if (!block) {
      block = {
        key: `case:${caseKey}`,
        questions: [],
        order: index,
      };
      caseBlocks.set(caseKey, block);
      blocks.push(block);
    }

    block.questions.push({ ...row, __sourceIndex: index });
  });

  blocks.forEach((block) => {
    block.questions.sort((a, b) => {
      const letterA = deriveCaseSortLetter(a);
      const letterB = deriveCaseSortLetter(b);
      if (letterA && letterB && letterA !== letterB) {
        return letterA.localeCompare(letterB);
      }
      return Number(a.__sourceIndex || 0) - Number(b.__sourceIndex || 0);
    });
  });

  return blocks;
}

function reorderQuestionsPermanently(questions) {
  const blocks = buildQuestionBlocks(questions);
  const reorderedBlocks = [...blocks].sort((a, b) => {
    const hashA = stableHash(`${PERMANENT_REORDER_SEED}:${a.key}`);
    const hashB = stableHash(`${PERMANENT_REORDER_SEED}:${b.key}`);
    if (hashA < hashB) return -1;
    if (hashA > hashB) return 1;
    return Number(a.order || 0) - Number(b.order || 0);
  });

  return reorderedBlocks.flatMap((block) =>
    block.questions.map(({ __sourceIndex: _sourceIndex, ...row }) => row),
  );
}

function updateQuestionPrefix(questionText, nextId) {
  const text = String(questionText || "");
  if (!/^Q\d+\.\s*/.test(text)) return text;
  return text.replace(/^Q\d+\.\s*/, `Q${nextId}. `);
}

function normalizeBackendOverlay(row, fallback = {}) {
  const next = {
    ...fallback,
    ...row,
  };
  const questionText = String(
    next.question || next.text || fallback.question || fallback.text || "",
  ).trim();
  return {
    ...next,
    question: questionText,
    text: questionText,
    id: ensurePositiveInt(next.id),
  };
}

function buildEffectiveQuestionBank(localQuestions, backendQuestions) {
  const backendById = new Map(
    backendQuestions
      .map((row) => normalizeBackendOverlay(row))
      .filter((row) => row.id)
      .map((row) => [row.id, row]),
  );

  const merged = localQuestions.map((row) => {
    const localId = ensurePositiveInt(row?.id);
    const backendRow = localId ? backendById.get(localId) : null;
    return normalizeBackendOverlay(backendRow || row, row);
  });

  const localIds = new Set(
    localQuestions.map((row) => ensurePositiveInt(row?.id)).filter(Boolean),
  );
  const backendOnly = [...backendById.values()]
    .filter((row) => !localIds.has(row.id))
    .sort((a, b) => a.id - b.id);

  return [...merged, ...backendOnly];
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
  const { text: _legacyText, ...rest } = row;
  return {
    ...rest,
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

function remapIdArray(values, idMap) {
  if (!Array.isArray(values)) return values;
  return values.map((value) => {
    const id = ensurePositiveInt(value);
    return id && idMap.has(id) ? idMap.get(id) : value;
  });
}

function transformUser(user, idMap) {
  const next = { ...user };
  const dailyQuiz =
    next.dailyQuiz && typeof next.dailyQuiz === "object" ? { ...next.dailyQuiz } : null;
  if (!dailyQuiz) return next;

  const days =
    dailyQuiz.days && typeof dailyQuiz.days === "object" ? { ...dailyQuiz.days } : {};

  Object.entries(days).forEach(([dateKey, entry]) => {
    const day = entry && typeof entry === "object" ? { ...entry } : {};
    if (Array.isArray(day.questionIds)) {
      day.questionIds = remapIdArray(day.questionIds, idMap);
    }
    if (Array.isArray(day.wrongQuestionIds)) {
      day.wrongQuestionIds = remapIdArray(day.wrongQuestionIds, idMap);
    }
    days[dateKey] = day;
  });

  dailyQuiz.days = days;
  next.dailyQuiz = dailyQuiz;
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
  const localQuestions = Array.isArray(imported.baseQuestions)
    ? imported.baseQuestions
    : [];

  if (localQuestions.length < 2) {
    throw new Error("Quiz/data.js does not contain enough questions to renumber.");
  }

  const backendQuestions = await readJsonFile(questionsPath);
  const effectiveQuestions = buildEffectiveQuestionBank(localQuestions, backendQuestions);
  const sourceQuestions = reorderQuestionsPermanently(effectiveQuestions);
  const sourceIds = uniqueQuestionIds(sourceQuestions);
  const idMap = buildSequentialIdMap(sourceQuestions);

  const transformedFrontendQuestions = sourceQuestions.map((row) =>
    transformQuestionRow(row, idMap),
  );
  const transformedBackendQuestions = transformedFrontendQuestions.map((row) => ({
    ...row,
    text: String(row?.question || row?.text || ""),
  }));

  const attempts = await readJsonFile(attemptsPath);
  const transformedAttempts = attempts.map((row) => transformAttempt(row, idMap));

  const syncPerformance = await readJsonFile(syncPerformancePath);
  const transformedSyncPerformance = syncPerformance.map((row) =>
    transformSyncPerformanceRow(row, idMap),
  );

  const users = await readJsonFile(usersPath);
  const transformedUsers = users.map((row) => transformUser(row, idMap));

  const mappingRows = sourceIds
    .slice()
    .sort((a, b) => a - b)
    .map((oldId) => ({
      oldId,
      newId: idMap.get(oldId),
    }));
  const changedCount = mappingRows.filter((row) => row.oldId !== row.newId).length;

  console.log(`[${mode}] Questions detected: ${sourceQuestions.length}`);
  console.log(`[${mode}] Mapping entries: ${mappingRows.length}`);
  console.log(`[${mode}] IDs changed: ${changedCount}`);
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
  await copyFileIntoDir(usersPath, backupDir);

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
  await writeJsonFile(usersPath, transformedUsers);

  console.log(`[APPLY] Backup created: ${backupDir}`);
  console.log("[APPLY] Updated files:");
  console.log(` - ${dataJsPath}`);
  console.log(` - ${questionsPath}`);
  console.log(` - ${attemptsPath}`);
  console.log(` - ${syncPerformancePath}`);
  console.log(` - ${usersPath}`);
  console.log("[APPLY] Completed one-time renumbering.");
}

run().catch((error) => {
  console.error("Question ID renumbering failed:", error?.stack || error?.message || error);
  process.exitCode = 1;
});
