import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.isAbsolute(config.dbPath)
  ? config.dbPath
  : path.join(__dirname, "..", config.dbPath);

<<<<<<< HEAD
<<<<<<< HEAD
const collectionLocks = new Map();

=======
>>>>>>> 6072f75 (Initial production-ready baseline + topic library updates)
=======
>>>>>>> 6072f75 (Initial production-ready baseline + topic library updates)
const defaults = {
  users: [],
  questions: [],
  attempts: [],
  syncSessions: [],
  syncPerformance: [],
<<<<<<< HEAD
<<<<<<< HEAD
  friendRequests: [],
  friendships: [],
  blocks: [],
  conversations: [],
  messages: [],
  statuses: [],
  uploads: [],
  adminBroadcastMessages: [],
  reports: [],
  deletedUsers: [],
  deletedGroups: [],
  communityConversationStates: [],
  aiUsage: [],
  pointEvents: [],
  syncWeakTracker: [],
=======
>>>>>>> 6072f75 (Initial production-ready baseline + topic library updates)
=======
>>>>>>> 6072f75 (Initial production-ready baseline + topic library updates)
};

function pathFor(collection) {
  return path.join(dataDir, `${collection}.json`);
}

<<<<<<< HEAD
<<<<<<< HEAD
async function withCollectionLock(collection, task) {
  const previous = collectionLocks.get(collection) || Promise.resolve();
  let releaseCurrent;
  const current = new Promise((resolve) => {
    releaseCurrent = resolve;
  });
  const chained = previous.then(() => current);
  collectionLocks.set(collection, chained);

  await previous;
  try {
    return await task();
  } finally {
    releaseCurrent?.();
    queueMicrotask(() => {
      if (collectionLocks.get(collection) === chained) {
        collectionLocks.delete(collection);
      }
    });
  }
}

=======
>>>>>>> 6072f75 (Initial production-ready baseline + topic library updates)
=======
>>>>>>> 6072f75 (Initial production-ready baseline + topic library updates)
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

<<<<<<< HEAD
<<<<<<< HEAD
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const raw = await fs.readFile(filePath, "utf8");
      return JSON.parse(raw);
    } catch (error) {
      const message = String(error?.message || "");
      const retryable =
        /Unexpected end of JSON input|Unexpected token|JSON/i.test(message) ||
        String(error?.code || "") === "ENOENT";
      if (!retryable || attempt >= 2) {
        return structuredClone(fallback);
      }
      await new Promise((resolve) => setTimeout(resolve, 25 * (attempt + 1)));
    }
  }

  return structuredClone(fallback);
=======
=======
>>>>>>> 6072f75 (Initial production-ready baseline + topic library updates)
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return structuredClone(fallback);
  }
<<<<<<< HEAD
>>>>>>> 6072f75 (Initial production-ready baseline + topic library updates)
=======
>>>>>>> 6072f75 (Initial production-ready baseline + topic library updates)
}

export async function writeCollection(collection, data) {
  const filePath = pathFor(collection);
<<<<<<< HEAD
<<<<<<< HEAD
  await withCollectionLock(collection, async () => {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
  });
}

export async function updateCollection(collection, updater) {
  return withCollectionLock(collection, async () => {
    const current = await readCollection(collection);
    const next = await updater(current);
    await fs.writeFile(pathFor(collection), JSON.stringify(next, null, 2), "utf8");
    return next;
  });
=======
=======
>>>>>>> 6072f75 (Initial production-ready baseline + topic library updates)
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

export async function updateCollection(collection, updater) {
  const current = await readCollection(collection);
  const next = await updater(current);
  await writeCollection(collection, next);
  return next;
<<<<<<< HEAD
>>>>>>> 6072f75 (Initial production-ready baseline + topic library updates)
=======
>>>>>>> 6072f75 (Initial production-ready baseline + topic library updates)
}
