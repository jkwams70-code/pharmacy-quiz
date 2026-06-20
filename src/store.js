import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "..", "data");

const defaults = {
  users: [],
  questions: [],
  attempts: [],
  syncSessions: [],
  syncPerformance: [],
};

const collectionCache = new Map();

function pathFor(collection) {
  return path.join(dataDir, `${collection}.json`);
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
  const fallback = defaults[collection];

  if (fallback === undefined) {
    throw new Error(`Unknown collection: ${collection}`);
  }

  const cached = collectionCache.get(collection);
  if (cached) {
    return structuredClone(cached.data);
  }

  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    collectionCache.set(collection, {
      data: parsed,
      updatedAt: new Date().toISOString(),
    });
    return structuredClone(parsed);
  } catch {
    const snapshot = structuredClone(fallback);
    collectionCache.set(collection, {
      data: snapshot,
      updatedAt: null,
    });
    return structuredClone(snapshot);
  }
}

export async function writeCollection(collection, data) {
  const filePath = pathFor(collection);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
  collectionCache.set(collection, {
    data: structuredClone(data),
    updatedAt: new Date().toISOString(),
  });
}

export async function updateCollection(collection, updater) {
  const current = await readCollection(collection);
  const next = await updater(current);
  await writeCollection(collection, next);
  return next;
}

export async function getCollectionMeta(collection) {
  const fallback = defaults[collection];
  if (fallback === undefined) {
    throw new Error(`Unknown collection: ${collection}`);
  }

  const cached = collectionCache.get(collection);
  if (cached) {
    return {
      count: Array.isArray(cached.data) ? cached.data.length : 0,
      updatedAt: cached.updatedAt,
    };
  }

  const items = await readCollection(collection);
  return {
    count: Array.isArray(items) ? items.length : 0,
    updatedAt: collectionCache.get(collection)?.updatedAt || null,
  };
}
