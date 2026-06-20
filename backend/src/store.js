import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import { config } from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.isAbsolute(config.dbPath)
  ? config.dbPath
  : path.join(__dirname, "..", config.dbPath);
const backupsDir = path.join(__dirname, "..", "backups");
const databaseSchema = "public";
const collectionTable = "app_collections";
const databaseUrl = String(config.databaseUrl || "").trim();
const useDatabase = Boolean(databaseUrl);
const databaseSslEnabled = Boolean(config.databaseSsl);
const databasePoolMax = Number(config.databasePoolMax || 5);

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
  reports: [],
  syncSessions: [],
  syncPerformance: [],
  syncPerformanceState: [],
  syncWeakTracker: [],
  aiUsage: [],
};

export const collectionNames = Object.keys(defaults);

const WRITE_RETRY_CODES = new Set(["EBUSY", "EPERM"]);
const WRITE_RETRY_DELAYS_MS = [40, 100, 180, 320, 520];
const READ_RETRY_CODES = new Set(["EBUSY", "EPERM"]);
const READ_RETRY_DELAYS_MS = [30, 80, 150, 260];

let pool = null;
let ensureStorePromise = null;

function pathFor(collection) {
  return path.join(dataDir, `${collection}.json`);
}

function backupPathFor(collection) {
  return path.join(dataDir, `${collection}.bak.json`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function quoteIdentifier(identifier) {
  return `"${String(identifier).replace(/"/g, '""')}"`;
}

function qualifiedTableName(schema, table) {
  return `${quoteIdentifier(schema)}.${quoteIdentifier(table)}`;
}

const publicCollectionTable = qualifiedTableName(databaseSchema, collectionTable);

function cloneDefault(collection) {
  return structuredClone(defaults[collection]);
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

async function getPool() {
  if (!useDatabase) return null;
  if (pool) return pool;

  pool = new Pool({
    connectionString: databaseUrl,
    ssl: databaseSslEnabled ? { rejectUnauthorized: false } : undefined,
    max: databasePoolMax,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
  return pool;
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

async function readLegacyCollection(collection) {
  const fallback = defaults[collection];
  try {
    const raw = await runWithReadRetry(() => fs.readFile(pathFor(collection), "utf8"));
    return JSON.parse(raw);
  } catch {
    if (collection === "users") {
      try {
        const backupRaw = await runWithReadRetry(() =>
          fs.readFile(backupPathFor(collection), "utf8"),
        );
        const parsedBackup = JSON.parse(backupRaw);
        if (Array.isArray(parsedBackup) && parsedBackup.length > 0) {
          return parsedBackup;
        }
      } catch {
        // Fall through to the snapshot fallback below.
      }

      const latestSnapshotBackup = await readLatestUsersSnapshotBackup();
      if (latestSnapshotBackup) {
        return latestSnapshotBackup;
      }
    }

    return cloneDefault(collection);
  }
}

async function ensureDatabaseCollectionTable(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS ${publicCollectionTable} (
      collection TEXT PRIMARY KEY,
      payload JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function copyLegacyDatabaseCollections(db) {
  const schemaResult = await db.query(
    `
      SELECT schemaname
      FROM pg_tables
      WHERE tablename = $1
      ORDER BY CASE WHEN schemaname = $2 THEN 0 ELSE 1 END, schemaname
    `,
    [collectionTable, databaseSchema],
  );

  const schemas = schemaResult.rows
    .map((row) => String(row?.schemaname || "").trim())
    .filter(Boolean);

  if (schemas.length === 0) {
    return;
  }

  for (const schema of schemas) {
    if (schema === databaseSchema) {
      continue;
    }

    const sourceTable = qualifiedTableName(schema, collectionTable);
    const sourceRows = await db.query(
      `SELECT collection, payload, updated_at FROM ${sourceTable}`,
    );

    if (sourceRows.rowCount === 0) {
      continue;
    }

    for (const row of sourceRows.rows) {
      if (!row?.collection) {
        continue;
      }

      await db.query(
        `
          INSERT INTO ${publicCollectionTable} (collection, payload, updated_at)
          VALUES ($1, $2::jsonb, COALESCE($3, NOW()))
          ON CONFLICT (collection) DO NOTHING
        `,
        [row.collection, JSON.stringify(row.payload ?? cloneDefault(row.collection)), row.updated_at],
      );
    }
  }
}

async function readDbCollection(collection, { allowMissing = true } = {}) {
  const db = await getPool();
  if (!db) return null;
  await ensureDatabaseCollectionTable(db);

  const result = await db.query(
    `SELECT payload FROM ${publicCollectionTable} WHERE collection = $1 LIMIT 1`,
    [collection],
  );

  if (result.rowCount > 0) {
    return result.rows[0]?.payload ?? cloneDefault(collection);
  }

  if (allowMissing) return null;
  return cloneDefault(collection);
}

async function writeDbCollection(collection, data) {
  const db = await getPool();
  if (!db) return null;
  await ensureDatabaseCollectionTable(db);

  await db.query(
    `INSERT INTO ${publicCollectionTable} (collection, payload, updated_at)
     VALUES ($1, $2::jsonb, NOW())
     ON CONFLICT (collection)
     DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
    [collection, JSON.stringify(data)],
  );
  return data;
}

async function seedDatabaseFromLegacyFiles() {
  const db = await getPool();
  if (!db) return;
  await fs.mkdir(dataDir, { recursive: true });
  await ensureDatabaseCollectionTable(db);
  await copyLegacyDatabaseCollections(db);

  for (const [collection, fallback] of Object.entries(defaults)) {
    const existing = await db.query(
      `SELECT 1 FROM ${publicCollectionTable} WHERE collection = $1 LIMIT 1`,
      [collection],
    );
    if (existing.rowCount > 0) continue;

    const seedValue = await readLegacyCollection(collection).catch(() => cloneDefault(collection));
    const payload = Array.isArray(seedValue) || (seedValue && typeof seedValue === "object")
      ? seedValue
      : cloneDefault(collection);

    await db.query(
      `INSERT INTO ${publicCollectionTable} (collection, payload, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (collection)
       DO NOTHING`,
      [collection, JSON.stringify(payload)],
    );
  }
}

async function initializeStore() {
  await fs.mkdir(dataDir, { recursive: true });

  if (!useDatabase) {
    for (const [collection, initialValue] of Object.entries(defaults)) {
      const filePath = pathFor(collection);
      try {
        await fs.access(filePath);
      } catch {
        await fs.writeFile(filePath, JSON.stringify(initialValue, null, 2), "utf8");
      }
    }
    return;
  }

  await seedDatabaseFromLegacyFiles();
}

async function ensureStoreReady() {
  if (!ensureStorePromise) {
    ensureStorePromise = initializeStore().finally(() => {
      ensureStorePromise = null;
    });
  }
  return ensureStorePromise;
}

export async function ensureStore() {
  await ensureStoreReady();
}

export async function readCollection(collection) {
  const fallback = defaults[collection];

  if (fallback === undefined) {
    throw new Error(`Unknown collection: ${collection}`);
  }

  await ensureStoreReady();

  if (useDatabase) {
    const dbValue = await readDbCollection(collection, { allowMissing: true });
    if (dbValue !== null) {
      return dbValue;
    }

    const legacyValue = await readLegacyCollection(collection);
    await writeDbCollection(collection, legacyValue);
    return legacyValue;
  }

  const filePath = pathFor(collection);

  try {
    const raw = await runWithReadRetry(() => fs.readFile(filePath, "utf8"));
    return JSON.parse(raw);
  } catch (primaryError) {
    if (collection === "users") {
      try {
        const backupRaw = await runWithReadRetry(() =>
          fs.readFile(backupPathFor(collection), "utf8"),
        );
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

    return cloneDefault(collection);
  }
}

export async function writeCollection(collection, data) {
  const fallback = defaults[collection];

  if (fallback === undefined) {
    throw new Error(`Unknown collection: ${collection}`);
  }

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

  await ensureStoreReady();

  if (useDatabase) {
    return writeDbCollection(collection, data);
  }

  const filePath = pathFor(collection);

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

  return data;
}

export async function updateCollection(collection, updater) {
  const current = await readCollection(collection);
  const next = await updater(current);
  await writeCollection(collection, next);
  return next;
}
