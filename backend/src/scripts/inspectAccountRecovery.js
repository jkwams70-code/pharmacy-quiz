// Read-only inspection of an incident copy. Never prints contacts or passwords.
import { promises as fs } from "node:fs";
import path from "node:path";

const rootArg = process.argv[2];
const search = String(process.argv.slice(3).join(" ") || "Paul Kelvin").trim().toLowerCase();
if (!rootArg) {
  console.error('Usage: node src/scripts/inspectAccountRecovery.js /root/ajix-account-incident-TIMESTAMP "Paul Kelvin"');
  process.exitCode = 1;
} else {
  const root = path.resolve(rootArg);
  const records = [];
  const errors = [];
  async function scan(dir) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory() && !["node_modules", ".git", "logs", "uploads"].includes(entry.name)) await scan(file);
      if (!entry.isFile() || !/^(users(?:\.bak)?|deletedUsers)\.json$/i.test(entry.name)) continue;
      try {
        const data = JSON.parse(await fs.readFile(file, "utf8"));
        if (!Array.isArray(data)) throw new Error("Expected an array");
        records.push({ file: path.relative(root, file), data, archived: entry.name === "deletedUsers.json" });
      } catch (error) {
        errors.push({ file: path.relative(root, file), error: error.message });
      }
    }
  }
  try {
    await scan(root);
    const primary = records.find((record) => record.file === path.join("data", "users.json"));
    const currentIds = primary ? new Set(primary.data.map((user) => user.id)) : null;
    const report = records.map((record) => {
      const users = record.data.map((row) => record.archived ? row.user : row).filter(Boolean);
      return {
        file: record.file,
        count: users.length,
        archived: record.archived,
        absentFromCurrent: currentIds ? users.filter((user) => !currentIds.has(user.id)).length : null,
        matches: users.filter((user) => {
          const name = [user.name, user.firstName, user.lastName, user.surname, user.username].filter(Boolean).join(" ").toLowerCase();
          return search.split(/\s+/).every((part) => name.includes(part));
        }).map((user) => ({ id: user.id, name: user.name, username: user.username, createdAt: user.createdAt, presentInCurrent: currentIds ? currentIds.has(user.id) : null })),
      };
    });
    console.log(JSON.stringify({ search, files: report, errors, note: "Absent records are recovery candidates only. Review deletion archives and identity conflicts before restoring. No files were changed." }, null, 2));
    if (errors.length) process.exitCode = 2;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
