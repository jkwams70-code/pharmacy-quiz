import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "..", "..", "data");
const backupRoot = path.join(__dirname, "..", "..", "backups");

function timestamp() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}_${hh}${min}${ss}`;
}

async function run() {
  await fs.mkdir(backupRoot, { recursive: true });
  const target = path.join(backupRoot, `data_${timestamp()}`);
  await fs.mkdir(target, { recursive: true });

  const files = await fs.readdir(dataDir);
  const jsonFiles = files.filter((file) => file.endsWith(".json"));

  for (const file of jsonFiles) {
    await fs.copyFile(path.join(dataDir, file), path.join(target, file));
  }

  console.log(`Backup created at: ${target}`);
  console.log(`Files copied: ${jsonFiles.length}`);
}

run().catch((error) => {
  console.error("Backup failed:", error);
  process.exitCode = 1;
});
