import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { collectionNames, ensureStore, readCollection } from "../store.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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

  await ensureStore();

  for (const collection of collectionNames) {
    const data = await readCollection(collection);
    await fs.writeFile(
      path.join(target, `${collection}.json`),
      JSON.stringify(data, null, 2),
      "utf8",
    );
  }

  console.log(`Backup created at: ${target}`);
  console.log(`Collections exported: ${collectionNames.length}`);
}

run().catch((error) => {
  console.error("Backup failed:", error);
  process.exitCode = 1;
});
