import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backupsDir = path.join(__dirname, "..", "backups");

const dataDir = path.isAbsolute(config.dbPath)
  ? config.dbPath
  : path.join(__dirname, "..", config.dbPath);

const defaults = {
  users: [],
  questions: [],
  attempts: [],
  pointEvents: [],
  friendRequests: [],
  friendships: [],
  blocks: [],
  conversations: [],
  messages: [],
  uploads: [],
  statuses: [],
  reports: [],
  syncSessions: [],
  syncPerformance: [],
  aiUsage: [],
};

const WRITE_RETRY_CODES = new Set(["EBUSY", "EPERM"]);
const WRITE_RETRY_DELAYS_MS = [40, 100, 180, 320, 520];
const READ_RETRY_CODES = new Set(["EBUSY", "EPERM"]);
const READ_RETRY_DELAYS_MS = [30, 80, 150, 260];

function pathFor(collection) {
  return path.join(dataDir, `${collection}.json`);
}

function backupPathFor(collection) {
  return path.join(dataDir, `${collection}.bak.json`);
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

async function readLatestUsersSnapshotBackup() {
  try {
    const entries = await fs.readdir(backupsDir, { withFileTypes: true });
    let latestPath = "";
    let latestTime = 0;
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const candidate = path.join(backupsDir, entry.name, "users.json");
      try {
        const stats = await fs.stat(candidate);
        const modified = stats.mtimeMs || 0;
        if (modified > latestTime && stats.size > 2) {
          latestTime = modified;
          latestPath = candidate;
        }
      } catch {
        // Ignore folders that do not contain a valid users snapshot.
      }
    }
    if (!latestPath) return null;
    const raw = await runWithReadRetry(() => fs.readFile(latestPath, "utf8"));
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // Ignore snapshot lookup failures and fall through to the default fallback.
  }
  return null;
}

export async function ensureStore() {
  await fs.mkdir(dataDir, { recursive: true });

  for (const [collection, initialValue] of Object.entries(defaults)) {
    const filePath = pathFor(collection);
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, JSON.stringify(initialValue, null, 2), "utf8");
    }
  }
}

export async function readCollection(collection) {
  const filePath = pathFor(collection);
  const backupPath = backupPathFor(collection);
  const fallback = defaults[collection];

  if (fallback === undefined) {
    throw new Error(`Unknown collection: ${collection}`);
  }

  try {
    const raw = await runWithReadRetry(() => fs.readFile(filePath, "utf8"));
    return JSON.parse(raw);
  } catch (primaryError) {
    if (collection === "users") {
      try {
        const backupRaw = await runWithReadRetry(() => fs.readFile(backupPath, "utf8"));
        const parsedBackup = JSON.parse(backupRaw);
        if (Array.isArray(parsedBackup) && parsedBackup.length > 0) {
          return parsedBackup;
        }
      } catch {
        // Fall through to the standard fallback below.
      }
      const latestSnapshotBackup = await readLatestUsersSnapshotBackup();
      if (latestSnapshotBackup) {
        return latestSnapshotBackup;
      }
    }
    const code = String(primaryError?.code || "").trim().toUpperCase();
    if (collection === "users" && READ_RETRY_CODES.has(code)) {
      throw primaryError;
    }
    return structuredClone(fallback);
  }
}

export async function writeCollection(collection, data) {
  const filePath = pathFor(collection);
  if (
    collection === "users" &&
    Array.isArray(data) &&
    data.length === 0 &&
    process.env.ENABLE_ADMIN_RESET !== "true" &&
    process.env.ALLOW_EMPTY_USERS_WRITE !== "true"
  ) {
    throw new Error(
      "Refusing to write an empty users collection. Set ALLOW_EMPTY_USERS_WRITE=true to override.",
    );
  }
  if (collection === "users") {
    try {
      await runWithWriteRetry(() => fs.copyFile(filePath, backupPathFor(collection)));
    } catch {
      // Ignore backup copy failure when file does not exist yet.
    }
  }
  await runWithWriteRetry(() =>
    fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8"),
  );
}

export async function updateCollection(collection, updater) {
  const current = await readCollection(collection);
  const next = await updater(current);
  await writeCollection(collection, next);
  return next;
}
