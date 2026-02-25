import { spawn } from "node:child_process";
import http from "node:http";
import https from "node:https";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.join(__dirname, "..", "..");

const httpPort = Number(process.env.HTTPS_TEST_HTTP_PORT || 4100);
const httpsPort = Number(process.env.HTTPS_TEST_HTTPS_PORT || 4443);
const certPath =
  process.env.HTTPS_TEST_PFX_PATH || "./certs/localhost-dev.pfx";
const certPassphrase =
  process.env.HTTPS_TEST_PFX_PASSPHRASE || "quiz-local-dev";

function requestHttp(url) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body,
        });
      });
    });
    req.on("error", reject);
    req.end();
  });
}

function requestHttps(url) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        rejectUnauthorized: false,
      },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body,
          });
        });
      },
    );
    req.on("error", reject);
    req.end();
  });
}

async function waitForReady(url, timeoutMs = 20000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await requestHttps(url);
      if (res.status === 200) {
        return;
      }
    } catch {
      // Retry until timeout.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("HTTPS server did not become ready in time.");
}

async function stopProcessTree(pid) {
  await new Promise((resolve) => {
    const killer = spawn(
      "cmd",
      ["/c", "taskkill", "/PID", String(pid), "/T", "/F"],
      { stdio: "ignore" },
    );
    killer.on("exit", () => resolve());
    killer.on("error", () => resolve());
  });
}

async function run() {
  const env = {
    ...process.env,
    PORT: String(httpPort),
    HTTPS_ENABLED: "true",
    HTTPS_ENFORCE: "true",
    HTTPS_PORT: String(httpsPort),
    HTTPS_PFX_PATH: certPath,
    HTTPS_PFX_PASSPHRASE: certPassphrase,
  };

  const server = spawn("node", ["src/server.js"], {
    cwd: backendRoot,
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  let logs = "";
  server.stdout.on("data", (chunk) => {
    logs += chunk.toString();
  });
  server.stderr.on("data", (chunk) => {
    logs += chunk.toString();
  });

  try {
    await waitForReady(`https://localhost:${httpsPort}/api/health`);

    const httpsHealth = await requestHttps(
      `https://localhost:${httpsPort}/api/health`,
    );
    if (httpsHealth.status !== 200) {
      throw new Error(
        `Expected HTTPS /api/health to return 200, got ${httpsHealth.status}`,
      );
    }

    const parsed = JSON.parse(httpsHealth.body);
    if (parsed?.status !== "ok") {
      throw new Error("HTTPS /api/health payload is invalid.");
    }

    const httpHealth = await requestHttp(`http://localhost:${httpPort}/api/health`);
    if (httpHealth.status !== 301) {
      throw new Error(
        `Expected HTTP redirect status 301, got ${httpHealth.status}`,
      );
    }

    const location = String(httpHealth.headers.location || "");
    const expectedPrefix = `https://localhost:${httpsPort}/api/health`;
    if (!location.startsWith(expectedPrefix)) {
      throw new Error(
        `Unexpected redirect location. expected prefix="${expectedPrefix}", actual="${location}"`,
      );
    }

    console.log(
      JSON.stringify(
        {
          ok: true,
          httpsHealthStatus: httpsHealth.status,
          httpRedirectStatus: httpHealth.status,
          httpRedirectLocation: location,
        },
        null,
        2,
      ),
    );
  } finally {
    if (server.pid) {
      await stopProcessTree(server.pid);
    }
  }
}

run().catch((error) => {
  console.error("HTTPS verification failed:", error.message);
  process.exitCode = 1;
});
