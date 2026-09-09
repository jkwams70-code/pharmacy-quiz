import test from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";
import net from "node:net";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { once } from "node:events";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(testDir, "..");

test("real API keeps registrations through overlapping logins, edits, backups, and restart", { timeout: 120000 }, async (t) => {
  const root = await fs.mkdtemp(path.join(testDir, ".account-integration-"));
  const backend = path.join(root, "backend");
  let child;
  let serverLog = "";
  async function stop() {
    if (child && child.exitCode === null && child.signalCode === null) {
      const exited = once(child, "exit");
      child.kill();
      await exited;
    }
  }
  t.after(async () => {
    await stop();
    if (path.dirname(path.resolve(root)) !== testDir || !path.basename(root).startsWith(".account-integration-")) throw new Error("Unsafe test cleanup path");
    await fs.rm(root, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  });
  await fs.mkdir(backend);
  await fs.cp(path.join(backendRoot, "src"), path.join(backend, "src"), { recursive: true });
  await fs.copyFile(path.join(backendRoot, "..", "rotationTaxonomy.js"), path.join(root, "rotationTaxonomy.js"));
  await fs.writeFile(path.join(root, "data.js"), 'export const baseQuestions = [{id:1, question:"Synthetic test question?", options:["A","B"], correctAnswer:0, category:"Pharmacology"}];');
  const probe = net.createServer();
  probe.listen(0, "127.0.0.1");
  await once(probe, "listening");
  const port = probe.address().port;
  await new Promise((resolve) => probe.close(resolve));
  const env = { ...process.env, NODE_ENV: "test", PORT: String(port), DB_PATH: path.join(backend, "data"), LOG_DIR: "logs", JWT_SECRET: "synthetic-test-secret-000000000000000", ADMIN_KEY: "synthetic-admin-secret-000000000", DATABASE_URL: "", HTTPS_ENABLED: "false", HTTPS_ENFORCE: "false", RATE_LIMIT_MAX: "10000", AI_ENABLED: "false", OPENAI_API_KEY: "", OPENROUTER_API_KEY: "", GEMINI_API_KEY: "", GOOGLE_VISION_API_KEY: "", ALLOW_EMPTY_USERS_WRITE: "false", ENABLE_ADMIN_RESET: "false" };
  async function start() {
    child = spawn(process.execPath, ["src/server.js"], { cwd: backend, env, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
    await new Promise((resolve, reject) => {
      let log = "";
      const timer = setTimeout(() => reject(new Error(`Test server did not start: ${log}`)), 15000);
      const inspect = (chunk) => {
        log = (log + chunk).slice(-4000);
        serverLog = (serverLog + chunk).slice(-8000);
        if (log.includes("Backend running on http://")) { clearTimeout(timer); resolve(); }
      };
      child.stdout.on("data", inspect);
      child.stderr.on("data", inspect);
      child.once("error", (error) => { clearTimeout(timer); reject(error); });
      child.once("exit", (code) => { clearTimeout(timer); reject(new Error(`Test server exited (${code}): ${log}`)); });
    });
  }
  async function request(route, body, { token, method = body ? "POST" : "GET", admin = false } = {}) {
    const response = await fetch(`http://127.0.0.1:${port}/api${route}`, {
      method, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(admin ? { "x-admin-key": env.ADMIN_KEY } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(20000),
    });
    return { status: response.status, body: await response.json() };
  }
  const credentials = (i) => ({ firstName: "Synthetic", lastName: "User", username: `testuser${i}`, contact: `testuser${i}@example.test`, password: "synthetic-password" });
  await start();
  const first = await request("/auth/register", credentials(0));
  assert.equal(first.status, 201, JSON.stringify(first.body));
  const overlap = await Promise.all([
    ...Array.from({ length: 8 }, (_, i) => request("/auth/register", credentials(i + 1))),
    ...Array.from({ length: 4 }, () => request("/auth/login", { identifier: "testuser0", password: "synthetic-password" })),
  ]);
  assert.deepEqual(overlap.map((r) => r.status), [...Array(8).fill(201), ...Array(4).fill(200)], serverLog);
  const duplicate = await Promise.all([request("/auth/register", credentials(9)), request("/auth/register", credentials(9))]);
  assert.deepEqual(duplicate.map((r) => r.status).sort(), [201, 409]);
  for (const registered of [first, ...overlap.slice(0, 8)]) {
    const me = await request("/auth/me", null, { token: registered.body.token });
    assert.equal(me.status, 200, JSON.stringify(me.body));
    assert.equal(me.body.id, registered.body.user.id);
  }
  const profile = await request("/auth/profile", { bio: "Preserved after restart" }, { token: first.body.token, method: "PUT" });
  assert.equal(profile.status, 200, JSON.stringify(profile.body));
  const changed = await request("/auth/change-password", { currentPassword: "synthetic-password", newPassword: "new-synthetic-password" }, { token: first.body.token });
  assert.equal(changed.status, 200, JSON.stringify(changed.body));
  const removed = await request(`/admin/users/${overlap[7].body.user.id}`, null, { admin: true, method: "DELETE" });
  assert.equal(removed.status, 200, JSON.stringify(removed.body));
  await stop();
  await start();
  const login = await request("/auth/login", { identifier: "testuser0", password: "new-synthetic-password" });
  assert.equal(login.status, 200, JSON.stringify(login.body));
  assert.equal(login.body.user.bio, "Preserved after restart");
  const laterLogin = await request("/auth/login", { identifier: "testuser1", password: "synthetic-password" });
  assert.equal(laterLogin.status, 200, JSON.stringify(laterLogin.body));
  // Wait for detached post-login reconciliation by taking a protected snapshot.
  const me = await request("/auth/me", null, { token: laterLogin.body.token });
  assert.equal(me.status, 200);
  await stop();
  const users = JSON.parse(await fs.readFile(path.join(backend, "data", "users.json"), "utf8"));
  assert.equal(users.length, 9);
  assert.ok(!users.some((u) => u.id === overlap[7].body.user.id));
  const backup = spawn(process.execPath, ["src/scripts/backupData.js"], { cwd: backend, env, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
  let output = "";
  backup.stdout.on("data", (chunk) => { output += chunk; });
  backup.stderr.on("data", (chunk) => { output += chunk; });
  assert.equal((await once(backup, "exit"))[0], 0, output);
  const dirs = await fs.readdir(path.join(backend, "backups"));
  const backupUsers = JSON.parse(await fs.readFile(path.join(backend, "backups", dirs[0], "users.json"), "utf8"));
  assert.equal(backupUsers.length, 9);
});
