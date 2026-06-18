import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "../config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.join(__dirname, "..", "..");
const logDir = path.join(backendRoot, config.logDir);
const backupsDir = path.join(backendRoot, "backups");

async function removeOlderThan(targetDir, maxAgeDays) {
  const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
  let removed = 0;

  try {
    const entries = await fs.readdir(targetDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(targetDir, entry.name);
      const stats = await fs.stat(fullPath);
      if (stats.mtimeMs <= cutoff) {
        await fs.rm(fullPath, { recursive: true, force: true });
        removed += 1;
      }
    }
  } catch {
    return 0;
  }

  return removed;
}

async function run() {
  const removedLogs = await removeOlderThan(logDir, config.logRetentionDays);
  const removedBackups = await removeOlderThan(backupsDir, 30);
  console.log(`Removed old log files: ${removedLogs}`);
  console.log(`Removed old backup folders: ${removedBackups}`);
}

run().catch((error) => {
  console.error("Cleanup failed:", error);
  process.exitCode = 1;
});
