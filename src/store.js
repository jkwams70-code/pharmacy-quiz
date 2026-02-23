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

  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return structuredClone(fallback);
  }
}

export async function writeCollection(collection, data) {
  const filePath = pathFor(collection);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

export async function updateCollection(collection, updater) {
  const current = await readCollection(collection);
  const next = await updater(current);
  await writeCollection(collection, next);
  return next;
}
