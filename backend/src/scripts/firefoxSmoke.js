import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.join(__dirname, "..", "..");

const defaultFirefoxPaths = [
  "C:\\Program Files\\Mozilla Firefox\\firefox.exe",
  "C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe",
];

const FIREFOX_PATH = process.env.FIREFOX_PATH || defaultFirefoxPaths[0];
const HOST = process.env.FIREFOX_SMOKE_HOST || "http://localhost:4000";
const PORT = Number(process.env.FIREFOX_SMOKE_PORT || "4000");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function resolveFirefoxPath() {
  if (await exists(FIREFOX_PATH)) {
    return FIREFOX_PATH;
  }
  for (const candidate of defaultFirefoxPaths) {
    if (await exists(candidate)) {
      return candidate;
    }
  }
  throw new Error(
    `Firefox executable not found. Checked: ${[FIREFOX_PATH, ...defaultFirefoxPaths].join(", ")}`,
  );
}

async function requestHealth(baseUrl) {
  const res = await fetch(`${baseUrl}/api/health`);
  if (!res.ok) {
    throw new Error(`Health endpoint returned ${res.status}`);
  }
  return res.json();
}

async function waitForBackend(baseUrl, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const payload = await requestHealth(baseUrl);
      if (payload?.status === "ok") {
        return;
      }
    } catch {
      // Keep polling.
    }
    await sleep(250);
  }
  throw new Error("Backend did not become healthy in time.");
}

async function stopProcessTree(pid) {
  await new Promise((resolve) => {
    const killer = spawn("cmd", ["/c", "taskkill", "/PID", String(pid), "/T", "/F"], {
      stdio: "ignore",
    });
    killer.on("exit", () => resolve());
    killer.on("error", () => resolve());
  });
}

async function captureScreenshot(
  firefoxPath,
  profileDir,
  url,
  outputPath,
  windowSize,
) {
  let capturedStdout = "";
  let capturedStderr = "";

  await new Promise((resolve, reject) => {
    const proc = spawn(
      firefoxPath,
      [
        "-no-remote",
        "-new-instance",
        "--headless",
        "--profile",
        profileDir,
        `--window-size=${windowSize}`,
        "--screenshot",
        outputPath,
        url,
      ],
      { stdio: ["ignore", "pipe", "pipe"] },
    );

    proc.stdout.on("data", (chunk) => {
      capturedStdout += chunk.toString();
    });
    proc.stderr.on("data", (chunk) => {
      capturedStderr += chunk.toString();
    });
    proc.on("error", reject);
    proc.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `Firefox exited with code ${code} for ${url}. stdout=${capturedStdout.trim()} stderr=${capturedStderr.trim()}`,
          ),
        );
      }
    });
  });

  if (!(await exists(outputPath))) {
    throw new Error(
      `Firefox did not generate screenshot for ${url}. stdout=${capturedStdout.trim()} stderr=${capturedStderr.trim()}`,
    );
  }

  const stats = await fs.stat(outputPath);
  if (stats.size < 8000) {
    throw new Error(
      `Firefox screenshot appears invalid for ${url}. File size=${stats.size} bytes`,
    );
  }
}

async function run() {
  const firefoxPath = await resolveFirefoxPath();
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "quiz-firefox-smoke-"));
  const profileDir = path.join(tempDir, "profile");
  await fs.mkdir(profileDir, { recursive: true });
  const screenshotQuiz = path.join(tempDir, "quiz-home.png");
  const screenshotAdmin = path.join(tempDir, "admin-home.png");
  const screenshotQuizMobile = path.join(tempDir, "quiz-home-mobile.png");
  const screenshotAdminMobile = path.join(tempDir, "admin-home-mobile.png");

  const env = {
    ...process.env,
    PORT: String(PORT),
  };

  const server = spawn("node", ["src/server.js"], {
    cwd: backendRoot,
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  let serverLogs = "";
  server.stdout.on("data", (chunk) => {
    serverLogs += chunk.toString();
  });
  server.stderr.on("data", (chunk) => {
    serverLogs += chunk.toString();
  });

  try {
    await waitForBackend(HOST);

    await captureScreenshot(
      firefoxPath,
      profileDir,
      `${HOST}/`,
      screenshotQuiz,
      "1366,900",
    );
    await captureScreenshot(
      firefoxPath,
      profileDir,
      `${HOST}/admin/`,
      screenshotAdmin,
      "1366,900",
    );
    await captureScreenshot(
      firefoxPath,
      profileDir,
      `${HOST}/`,
      screenshotQuizMobile,
      "390,844",
    );
    await captureScreenshot(
      firefoxPath,
      profileDir,
      `${HOST}/admin/`,
      screenshotAdminMobile,
      "390,844",
    );

    console.log(
      JSON.stringify(
        {
          ok: true,
          browser: "firefox",
          firefoxPath,
          host: HOST,
          screenshots: [
            { name: "quiz", path: screenshotQuiz },
            { name: "admin", path: screenshotAdmin },
            { name: "quiz-mobile", path: screenshotQuizMobile },
            { name: "admin-mobile", path: screenshotAdminMobile },
          ],
        },
        null,
        2,
      ),
    );
  } finally {
    if (server.pid) {
      await stopProcessTree(server.pid);
    }
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

run().catch((error) => {
  console.error("Firefox smoke failed:", error.message);
  process.exitCode = 1;
});
