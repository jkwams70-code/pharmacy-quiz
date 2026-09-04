import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  collectionNames,
  ensureStore,
  readCollection,
  writeCollection,
} from "../store.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.join(__dirname, "..", "..");
const backupsRoot = path.join(backendRoot, "backups");

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

async function writeSafetySnapshot() {
  const safetyDir = path.join(backupsRoot, `pre_restore_${timestamp()}`);
  await fs.mkdir(safetyDir, { recursive: true });

  for (const collection of collectionNames) {
    const data = await readCollection(collection);
    await fs.writeFile(
      path.join(safetyDir, `${collection}.json`),
      JSON.stringify(data, null, 2),
      "utf8",
    );
  }

  return safetyDir;
}

async function run() {
  const backupFolderName = String(process.argv[2] || "").trim();
  if (!backupFolderName) {
    throw new Error("Usage: node src/scripts/restoreData.js <backup-folder-name>");
  }

  const sourceDir = path.join(backupsRoot, backupFolderName);
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  if (entries.length === 0) {
    throw new Error(`Backup folder is empty: ${sourceDir}`);
  }

  process.env.ALLOW_EMPTY_USERS_WRITE = "true";
  await ensureStore();
  const safetyDir = await writeSafetySnapshot();

  for (const collection of collectionNames) {
    const filePath = path.join(sourceDir, `${collection}.json`);
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    await writeCollection(collection, parsed);
  }

  console.log(`Restore completed from: ${sourceDir}`);
  console.log(`Safety snapshot created: ${safetyDir}`);
}

run().catch((error) => {
  console.error("Restore failed:", error);
  process.exitCode = 1;
});
