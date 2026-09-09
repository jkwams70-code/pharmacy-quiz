import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";
import { createUsersStore } from "./usersStore.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backupsDir = path.join(__dirname, "..", "backups");

const dataDir = path.isAbsolute(config.dbPath)
  ? config.dbPath
  : path.join(__dirname, "..", config.dbPath);

const COLLECTION_ALIASES = {
  syncPerformanceState: "syncPerformance",
};

function resolveCollectionName(collection) {
  return COLLECTION_ALIASES[collection] || collection;
}

const defaults = {
  users: [],
  deletedUsers: [],
  deletedGroups: [],
  questions: [],
  attempts: [],
  pointEvents: [],
  friendRequests: [],
  friendships: [],
  blocks: [],
  conversations: [],
  communityConversationStates: [],
  messages: [],
  adminBroadcastMessages: [],
  uploads: [],
  statuses: [],
  subscriptionRequests: [],
  passwordResetRequests: [],
  newsCategories: [],
  newsSources: [],
  newsItems: [],
  newsCollectRuns: [],
  reports: [],
  syncSessions: [],
  syncPerformance: [],
  syncWeakTracker: [],
  aiUsage: [],
  medlensDrugQueue: [],
  medlensAiProgress: [],
  medlensDiseaseQueue: [],
  medlensInteractionQueue: [],
  guidelineQueue: [],
};

export const collectionNames = Object.freeze(Object.keys(defaults));
const usersStore = createUsersStore(path.join(dataDir, "users.json"), {
  allowEmpty: () => process.env.ENABLE_ADMIN_RESET === "true" || process.env.ALLOW_EMPTY_USERS_WRITE === "true",
});
export const readUsersSnapshot = () => usersStore.readSnapshot();
export const writeUsersSnapshot = (snapshot, data) => usersStore.writeSnapshot(snapshot, data);

const WRITE_RETRY_CODES = new Set(["EBUSY", "EPERM"]);
const WRITE_RETRY_DELAYS_MS = [40, 100, 180, 320, 520];
const READ_RETRY_CODES = new Set(["EBUSY", "EPERM"]);
const READ_RETRY_DELAYS_MS = [30, 80, 150, 260];

function pathFor(collection) {
  return path.join(dataDir, `${resolveCollectionName(collection)}.json`);
}

function backupPathFor(collection) {
  return path.join(dataDir, `${resolveCollectionName(collection)}.bak.json`);
}

async function writeGuidelineQueueAtomically(filePath, data) {
  const tempPath = filePath + "." + process.pid + "." + randomUUID() + ".tmp";
  const serialized = JSON.stringify(data, null, 2);
  try {
    await runWithWriteRetry(() => fs.writeFile(tempPath, serialized, "utf8"));
    const verification = JSON.parse(await fs.readFile(tempPath, "utf8"));
    if (!Array.isArray(verification)) throw new Error("Guideline queue safety check failed: expected an array.");
    await runWithWriteRetry(() => fs.rename(tempPath, filePath));
  } finally {
    await fs.rm(tempPath, { force: true }).catch(() => {});
  }
}


function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runWithWriteRetry(operation) {
  let lastError = null;
  for (let attempt = 0; attempt <= WRITE_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const code = String(error?.code || "").trim().toUpperCase();
      if (!WRITE_RETRY_CODES.has(code) || attempt === WRITE_RETRY_DELAYS_MS.length) {
        throw error;
      }
      await sleep(WRITE_RETRY_DELAYS_MS[attempt]);
    }
  }
  throw lastError;
}

async function runWithReadRetry(operation) {
  let lastError = null;
  for (let attempt = 0; attempt <= READ_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const code = String(error?.code || "").trim().toUpperCase();
      if (!READ_RETRY_CODES.has(code) || attempt === READ_RETRY_DELAYS_MS.length) {
        throw error;
      }
      await sleep(READ_RETRY_DELAYS_MS[attempt]);
    }
  }
  throw lastError;
}

export async function ensureStore() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(pathFor("users"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const existingFiles = await fs.readdir(dataDir);
    const backupEntries = await fs.readdir(backupsDir, { withFileTypes: true }).catch((backupError) => {
      if (backupError.code === "ENOENT") return [];
      throw backupError;
    });
    let hasUserBackup = false;
    for (const entry of backupEntries) {
      if (!entry.isDirectory()) continue;
      try {
        await fs.access(path.join(backupsDir, entry.name, "users.json"));
        hasUserBackup = true;
      } catch (backupError) {
        if (backupError.code !== "ENOENT") throw backupError;
      }
    }
    if (existingFiles.some((name) => name.endsWith(".json")) || hasUserBackup) {
      throw new Error("users.json is missing from an existing store. Preserve data and recover it explicitly; refusing to initialize empty accounts.");
    }
  }

  for (const [collection, initialValue] of Object.entries(defaults)) {
    const filePath = pathFor(collection);
    try {
      await fs.access(filePath);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      await fs.writeFile(filePath, JSON.stringify(initialValue, null, 2), { encoding: "utf8", flag: "wx", mode: 0o600 }).catch((writeError) => {
        if (writeError.code !== "EEXIST") throw writeError;
      });
    }
  }
}

export async function readCollection(collection) {
  if (collection === "users") return (await readUsersSnapshot()).data;
  const resolvedCollection = resolveCollectionName(collection);
  const filePath = pathFor(resolvedCollection);
  const backupPath = backupPathFor(resolvedCollection);
  const fallback = defaults[resolvedCollection];

  if (fallback === undefined) {
    throw new Error(`Unknown collection: ${collection}`);
  }

  try {
    const raw = await runWithReadRetry(() => fs.readFile(filePath, "utf8"));
    return JSON.parse(raw);
  } catch (primaryError) {
    if (resolvedCollection === "guidelineQueue") {
      try {
        const backupRaw = await runWithReadRetry(() => fs.readFile(backupPath, "utf8"));
        const parsedBackup = JSON.parse(backupRaw);
        if (Array.isArray(parsedBackup)) return parsedBackup;
      } catch {
        // Fall through to the standard collection fallback below.
      }
    }
    return structuredClone(fallback);
  }
}

export async function writeCollection(collection, data) {
  if (collection === "users") {
    throw new Error("Account writes require writeUsersSnapshot(snapshot, data) or updateCollection(\"users\", updater).");
  }
  const resolvedCollection = resolveCollectionName(collection);
  const filePath = pathFor(resolvedCollection);
  if (resolvedCollection === "guidelineQueue") {
    try {
      await runWithWriteRetry(() => fs.copyFile(filePath, backupPathFor(resolvedCollection)));
    } catch (error) {
      if (String(error?.code || "").toUpperCase() !== "ENOENT") throw error;
    }
    await writeGuidelineQueueAtomically(filePath, data);
    return;
  }
  await runWithWriteRetry(() =>
    fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8"),
  );
}

export async function updateCollection(collection, updater) {
  if (collection === "users") return usersStore.update(updater);
  const current = await readCollection(collection);
  const next = await updater(current);
  await writeCollection(collection, next);
  return next;
}

