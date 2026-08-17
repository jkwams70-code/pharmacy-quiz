const DB_NAME = "ajix-offline-store";
const DB_VERSION = 1;
const ENTRY_STORE = "entries";
const QUEUE_STORE = "queue";

let dbPromise = null;

function isIndexedDbAvailable() {
  return typeof indexedDB !== "undefined" && Boolean(indexedDB);
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => reject(request.error));
  });
}

function openDatabase() {
  if (!isIndexedDbAvailable()) {
    return Promise.resolve(null);
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.addEventListener("upgradeneeded", () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(ENTRY_STORE)) {
        db.createObjectStore(ENTRY_STORE, { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { keyPath: "id" });
      }
    });

    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => reject(request.error));
    request.addEventListener("blocked", () => reject(new Error("IndexedDB is blocked")));
  });

  return dbPromise;
}

async function withStore(storeName, mode, callback) {
  const db = await openDatabase();
  if (!db) return null;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    let settled = false;

    tx.addEventListener("error", () => {
      if (settled) return;
      settled = true;
      reject(tx.error);
    });
    tx.addEventListener("abort", () => {
      if (settled) return;
      settled = true;
      reject(tx.error || new Error("IndexedDB transaction aborted"));
    });
    tx.addEventListener("complete", () => {
      if (settled) return;
      settled = true;
      resolve(result);
    });

    let result = null;
    try {
      result = callback(store, tx);
      if (result && typeof result.then === "function") {
        result
          .then((value) => {
            result = value;
          })
          .catch((error) => {
            if (!settled) {
              settled = true;
              reject(error);
              tx.abort();
            }
          });
      }
    } catch (error) {
      if (!settled) {
        settled = true;
        reject(error);
        tx.abort();
      }
    }
  });
}

function createQueueId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

export async function getEntry(key) {
  const safeKey = String(key || "").trim();
  if (!safeKey) return null;
  return withStore(ENTRY_STORE, "readonly", (store) => requestToPromise(store.get(safeKey)));
}

export async function setEntry(key, value) {
  const safeKey = String(key || "").trim();
  if (!safeKey) return false;
  return withStore(ENTRY_STORE, "readwrite", (store) =>
    requestToPromise(
      store.put({
        key: safeKey,
        value,
        updatedAt: Date.now(),
      }),
    ),
  ).then(() => true);
}

export async function removeEntry(key) {
  const safeKey = String(key || "").trim();
  if (!safeKey) return false;
  return withStore(ENTRY_STORE, "readwrite", (store) => requestToPromise(store.delete(safeKey))).then(() => true);
}

export async function getQueue() {
  const rows = await withStore(QUEUE_STORE, "readonly", (store) => requestToPromise(store.getAll()));
  return Array.isArray(rows) ? rows : [];
}

export async function enqueueAction(action = {}) {
  const safeAction = action && typeof action === "object" ? { ...action } : null;
  if (!safeAction) return null;
  const row = {
    id: String(safeAction.id || createQueueId()).trim(),
    type: String(safeAction.type || "").trim(),
    payload: safeAction.payload && typeof safeAction.payload === "object" ? safeAction.payload : {},
    createdAt: Number.isFinite(Number(safeAction.createdAt)) ? Number(safeAction.createdAt) : Date.now(),
    attempts: Math.max(0, Math.round(Number(safeAction.attempts) || 0)),
  };
  if (!row.id || !row.type) return null;
  await withStore(QUEUE_STORE, "readwrite", (store) => requestToPromise(store.put(row)));
  return row;
}

export async function removeQueuedAction(id) {
  const safeId = String(id || "").trim();
  if (!safeId) return false;
  return withStore(QUEUE_STORE, "readwrite", (store) => requestToPromise(store.delete(safeId))).then(() => true);
}

export async function flushQueue(processor) {
  if (typeof processor !== "function") return [];
  const rows = await getQueue();
  const outcomes = [];
  for (const row of rows) {
    try {
      await processor(row);
      await removeQueuedAction(row.id);
      outcomes.push({ id: row.id, ok: true });
    } catch (error) {
      outcomes.push({ id: row.id, ok: false, error });
    }
  }
  return outcomes;
}
