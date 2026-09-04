import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.join(__dirname, "..", "..");

dotenv.config({ path: path.join(backendRoot, ".env") });
const { config } = await import("../config.js");

function hasLocalhostOrigin(origins) {
  return origins.some((origin) =>
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin),
  );
}

async function verifyDataPathWritable() {
  const targetDir = path.isAbsolute(config.dbPath)
    ? config.dbPath
    : path.join(backendRoot, config.dbPath);

  const probe = path.join(targetDir, `.preflight-${Date.now()}-${process.pid}.tmp`);
  await fs.mkdir(targetDir, { recursive: true });
  await fs.writeFile(probe, "ok", "utf8");
  await fs.rm(probe, { force: true });
}

async function run() {
  const checks = [];

  const push = (name, pass, detail) => {
    checks.push({ name, pass: Boolean(pass), detail: String(detail || "") });
  };

  push(
    "NODE_ENV is production",
    process.env.NODE_ENV === "production",
    `NODE_ENV=${process.env.NODE_ENV || "(missing)"}`,
  );

  push(
    "JWT_SECRET length >= 32",
    String(process.env.JWT_SECRET || "").length >= 32,
    `length=${String(process.env.JWT_SECRET || "").length}`,
  );

  push(
    "ADMIN_KEY length >= 20",
    String(process.env.ADMIN_KEY || "").length >= 20,
    `length=${String(process.env.ADMIN_KEY || "").length}`,
  );

  push(
    "EXPOSE_RESET_CODE disabled",
    config.exposeResetCode !== true,
    `EXPOSE_RESET_CODE=${String(process.env.EXPOSE_RESET_CODE || "false")}`,
  );

  push(
    "CORS_ORIGIN is explicit (not *)",
    !config.corsOrigins.includes("*"),
    `CORS_ORIGIN=${process.env.CORS_ORIGIN || "(missing)"}`,
  );

  push(
    "CORS_ORIGIN has no localhost origins",
    !hasLocalhostOrigin(config.corsOrigins),
    `origins=${config.corsOrigins.join(",") || "(none)"}`,
  );

  push(
    "TRUST_PROXY enabled (recommended behind reverse proxy)",
    config.trustProxy === true,
    `TRUST_PROXY=${String(process.env.TRUST_PROXY || "false")}`,
  );

  try {
    await verifyDataPathWritable();
    push("DB_PATH is writable", true, `DB_PATH=${config.dbPath}`);
  } catch (error) {
    push(
      "DB_PATH is writable",
      false,
      `DB_PATH=${config.dbPath}; error=${error?.message || String(error)}`,
    );
  }

  const maxName = checks.reduce((max, row) => Math.max(max, row.name.length), 0);
  console.log("Production Preflight");
  console.log(`Host: ${os.hostname()}`);
  console.log("");
  checks.forEach((row) => {
    const label = row.pass ? "PASS" : "FAIL";
    console.log(
      `[${label}] ${row.name.padEnd(maxName, " ")} | ${row.detail}`,
    );
  });

  const failed = checks.filter((row) => !row.pass);
  if (failed.length > 0) {
    console.error("");
    console.error(`Preflight failed: ${failed.length} check(s) not ready.`);
    process.exitCode = 1;
    return;
  }

  console.log("");
  console.log("Preflight passed. Environment looks deployment-ready.");
}

run().catch((error) => {
  console.error("Preflight execution failed:", error?.stack || error?.message || error);
  process.exitCode = 1;
});
