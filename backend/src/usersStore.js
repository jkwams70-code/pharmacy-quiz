import { promises as fs } from "node:fs";
import { createHash, randomUUID } from "node:crypto";

function storageError(code, message, status = 503, cause) {
  return Object.assign(new Error(message, { cause }), { code, status });
}

function validateUsers(data) {
  if (!Array.isArray(data)) throw storageError("USERS_STORE_UNAVAILABLE", "Account storage must contain an array.");
  const ids = new Set();
  for (const user of data) {
    if (!user || typeof user.id !== "string" || !user.id || ids.has(user.id)) {
      throw storageError("USERS_STORE_UNAVAILABLE", "Account storage contains invalid or duplicate user IDs.");
    }
    ids.add(user.id);
  }
}

const revisionOf = (raw) => createHash("sha256").update(raw).digest("hex");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const operationQueues = new Map();

// All processes writing this file must use this store. Never steal an old lock:
// a slow process could still own it. After a crash, stop all writers before
// removing users.json.lock and restarting the service.
export function createUsersStore(filePath, { allowEmpty = () => false, lockTimeoutMs = 5000 } = {}) {
  const lockPath = `${filePath}.lock`;
  const backupPath = filePath.replace(/\.json$/, ".bak.json");

  async function readSnapshot() {
    try {
      const raw = await fs.readFile(filePath, "utf8");
      const data = JSON.parse(raw);
      validateUsers(data);
      return { data, revision: revisionOf(raw), raw };
    } catch (cause) {
      throw storageError("USERS_STORE_UNAVAILABLE", "Account storage is unavailable. Preserve the files and inspect backups before recovery.", 503, cause);
    }
  }

  function withLock(operation) {
    const previous = operationQueues.get(filePath) || Promise.resolve();
    const result = previous.then(() => withFileLock(operation));
    const settled = result.then(() => {}, () => {});
    operationQueues.set(filePath, settled);
    void settled.then(() => {
      if (operationQueues.get(filePath) === settled) operationQueues.delete(filePath);
    });
    return result;
  }

  async function withFileLock(operation) {
    const deadline = Date.now() + lockTimeoutMs;
    while (true) {
      try {
        await fs.mkdir(lockPath);
        break;
      } catch (error) {
        if (!["EEXIST", "EPERM", "EBUSY"].includes(error.code)) throw error;
        if (Date.now() >= deadline) throw storageError("USERS_STORE_BUSY", "Account storage is busy. Please retry.");
        await sleep(25);
      }
    }
    try {
      return await operation();
    } finally {
      for (let attempt = 0; ; attempt += 1) {
        try {
          await fs.rmdir(lockPath);
          break;
        } catch (error) {
          if (!["EPERM", "EBUSY"].includes(error.code) || attempt >= 5) throw error;
          await sleep(40 * (attempt + 1));
        }
      }
    }
  }

  async function replaceAtomically(target, raw) {
    const temp = `${target}.${process.pid}.${randomUUID()}.tmp`;
    try {
      const handle = await fs.open(temp, "wx", 0o600);
      try {
        await handle.writeFile(raw, "utf8");
        await handle.sync();
      } finally {
        await handle.close();
      }
      for (let attempt = 0; ; attempt += 1) {
        try {
          await fs.rename(temp, target);
          break;
        } catch (error) {
          if (!["EPERM", "EBUSY"].includes(error.code) || attempt >= 5) throw error;
          await sleep(40 * (attempt + 1));
        }
      }
    } finally {
      await fs.rm(temp, { force: true }).catch(() => {});
    }
  }

  async function commit(snapshot, data) {
    validateUsers(data);
    if (!data.length && !allowEmpty()) {
      throw storageError("EMPTY_USERS_WRITE", "Refusing to write an empty users collection.");
    }
    const current = await readSnapshot();
    if (!snapshot?.revision || current.revision !== snapshot.revision) {
      throw storageError("USERS_WRITE_CONFLICT", "Account data changed during this request. Please retry.", 409);
    }
    const raw = JSON.stringify(data, null, 2);
    if (raw !== current.raw) {
      // A failed backup prevents the primary write; unreadable files are never
      // copied over a good backup, and readers only see complete primary files.
      await replaceAtomically(backupPath, current.raw);
      await replaceAtomically(filePath, raw);
    }
    snapshot.revision = revisionOf(raw);
    snapshot.data = structuredClone(data);
    snapshot.raw = raw;
    return snapshot;
  }

  return {
    // Windows can deny replacement while another process has the file open.
    // Readers share the lock too; internal transaction reads already own it.
    readSnapshot: () => withLock(readSnapshot),
    writeSnapshot: (snapshot, data) => withLock(() => commit(snapshot, data)),
    update: (updater) => withLock(async () => {
      const snapshot = await readSnapshot();
      const next = await updater(structuredClone(snapshot.data));
      await commit(snapshot, next);
      return next;
    }),
  };
}
