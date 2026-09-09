import test from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawn } from "node:child_process";
import { createUsersStore } from "../src/usersStore.js";

async function fixture(t, initial = [{ id: "existing", passwordHash: "original" }]) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "ajix-users-test-"));
  t.after(async () => {
    const resolved = path.resolve(root);
    if (path.dirname(resolved) !== path.resolve(os.tmpdir()) || !path.basename(resolved).startsWith("ajix-users-test-")) throw new Error("Unsafe test cleanup path");
    await fs.rm(resolved, { recursive: true, force: true });
  });
  const file = path.join(root, "users.json");
  await fs.writeFile(file, JSON.stringify(initial, null, 2));
  return { root, file, store: createUsersStore(file) };
}

test("an old login snapshot cannot remove a successfully registered account", async (t) => {
  const { store } = await fixture(t);
  const oldLogin = await store.readSnapshot();
  await store.update((users) => [...users, { id: "paul-kelvin" }]);
  oldLogin.data[0].lastSeenAt = "today";
  await assert.rejects(store.writeSnapshot(oldLogin, oldLogin.data), { code: "USERS_WRITE_CONFLICT", status: 409 });
  assert.deepEqual((await store.readSnapshot()).data.map((u) => u.id), ["existing", "paul-kelvin"]);
});

test("overlapping registrations and login updates preserve every account", async (t) => {
  const { store } = await fixture(t);
  await Promise.all(Array.from({ length: 30 }, (_, i) => store.update(async (users) => {
    await new Promise((resolve) => setTimeout(resolve, i % 3));
    return [...users.map((user) => ({ ...user, lastSeenAt: String(i) })), { id: `new-${i}` }];
  })));
  const data = (await store.readSnapshot()).data;
  assert.equal(data.length, 31);
  assert.equal(new Set(data.map((u) => u.id)).size, 31);
});

test("stale updates cannot revert passwords or resurrect deleted accounts", async (t) => {
  const { store } = await fixture(t, [{ id: "existing", passwordHash: "old" }, { id: "deleted" }]);
  const stale = await store.readSnapshot();
  await store.update((users) => users.filter((u) => u.id !== "deleted").map((u) => ({ ...u, passwordHash: "new" })));
  await assert.rejects(store.writeSnapshot(stale, stale.data), { code: "USERS_WRITE_CONFLICT" });
  assert.deepEqual((await store.readSnapshot()).data, [{ id: "existing", passwordHash: "new" }]);
});

test("explicit deletion and sequential writes from a fresh snapshot work", async (t) => {
  const { store } = await fixture(t, [{ id: "keep" }, { id: "remove" }]);
  const snapshot = await store.readSnapshot();
  await store.writeSnapshot(snapshot, [{ id: "keep" }]);
  await store.writeSnapshot(snapshot, [{ id: "keep", lastSeenAt: "now" }]);
  assert.deepEqual((await store.readSnapshot()).data, [{ id: "keep", lastSeenAt: "now" }]);
});

test("corrupt or missing primary files never fall back to or overwrite backups", async (t) => {
  const { root, file, store } = await fixture(t);
  const stale = await store.readSnapshot();
  const backup = path.join(root, "users.bak.json");
  const saved = '[{"id":"backup-account"}]';
  await fs.writeFile(backup, saved);
  for (const invalid of ["", "[{", "null", "{}", '[{"id":"same"},{"id":"same"}]']) {
    await fs.writeFile(file, invalid);
    await assert.rejects(store.readSnapshot(), { code: "USERS_STORE_UNAVAILABLE" });
    await assert.rejects(store.writeSnapshot(stale, stale.data), { code: "USERS_STORE_UNAVAILABLE" });
    assert.equal(await fs.readFile(backup, "utf8"), saved);
    assert.equal(await fs.readFile(file, "utf8"), invalid);
  }
  await fs.unlink(file);
  await assert.rejects(store.readSnapshot(), { code: "USERS_STORE_UNAVAILABLE" });
});

test("a failed backup leaves the primary intact and releases the lock", async (t) => {
  const { root, file, store } = await fixture(t);
  const before = await fs.readFile(file, "utf8");
  await fs.mkdir(path.join(root, "users.bak.json"));
  await assert.rejects(store.update((users) => [...users, { id: "new" }]));
  assert.equal(await fs.readFile(file, "utf8"), before);
  await assert.rejects(fs.access(`${file}.lock`), { code: "ENOENT" });
});

test("reads always see complete JSON during repeated writes", async (t) => {
  const { store } = await fixture(t);
  let done = false;
  const writer = (async () => {
    for (let i = 0; i < 20; i += 1) await store.update((users) => [...users, { id: `new-${i}`, bio: "x".repeat(5000) }]);
  })().finally(() => { done = true; });
  let reads = 0;
  await Promise.all([writer, (async () => {
    while (!done) {
      assert.ok((await store.readSnapshot()).data.length >= 1);
      reads += 1;
    }
  })()]);
  assert.ok(reads > 0);
  assert.equal((await store.readSnapshot()).data.length, 21);
});

test("a busy lock fails safely without stealing ownership", async (t) => {
  const { file } = await fixture(t);
  await fs.mkdir(`${file}.lock`);
  const store = createUsersStore(file, { lockTimeoutMs: 30 });
  await assert.rejects(store.update((users) => users), { code: "USERS_STORE_BUSY" });
  assert.ok((await fs.stat(`${file}.lock`)).isDirectory());
});

test("multiple server processes share the same write lock", async (t) => {
  const { file, store } = await fixture(t);
  const moduleUrl = new URL("../src/usersStore.js", import.meta.url).href;
  function worker(prefix) {
    const code = `import {createUsersStore} from ${JSON.stringify(moduleUrl)};
      const store = createUsersStore(${JSON.stringify(file)});
      for(let i=0;i<10;i++) await store.update(users => [...users,{id:${JSON.stringify(prefix)}+i}]);`;
    return new Promise((resolve, reject) => {
      const child = spawn(process.execPath, ["--input-type=module", "-e", code], { windowsHide: true, stdio: ["ignore", "ignore", "pipe"] });
      let error = "";
      child.stderr.on("data", (chunk) => { error += chunk; });
      child.on("error", reject);
      child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(error)));
    });
  }
  await Promise.all([worker("a"), worker("b"), worker("c")]);
  assert.equal((await store.readSnapshot()).data.length, 31);
});

test("empty writes remain blocked unless explicitly enabled", async (t) => {
  const { file, store } = await fixture(t);
  await assert.rejects(store.update(() => []), { code: "EMPTY_USERS_WRITE" });
  await createUsersStore(file, { allowEmpty: () => true }).update(() => []);
  assert.deepEqual((await store.readSnapshot()).data, []);
});
