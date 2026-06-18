import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

function parseArgs(argv) {
  const args = { startId: 0, file: "data.js" };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--start-id") {
      args.startId = Number(argv[i + 1] || 0);
      i += 1;
    } else if (arg === "--file") {
      args.file = String(argv[i + 1] || "data.js");
      i += 1;
    }
  }
  if (!Number.isInteger(args.startId) || args.startId <= 0) {
    throw new Error("Pass a valid --start-id value, for example: --start-id 501");
  }
  return args;
}

function spreadBatch(existing, incoming) {
  if (!incoming.length) return [...existing];
  if (!existing.length) return [...incoming];

  const totalExisting = existing.length;
  const totalIncoming = incoming.length;
  const chunkSize = totalExisting / (totalIncoming + 1);
  const output = [];
  let previousBoundary = 0;

  for (let i = 0; i < totalIncoming; i += 1) {
    const nextBoundary = Math.round((i + 1) * chunkSize);
    output.push(...existing.slice(previousBoundary, nextBoundary));
    output.push(incoming[i]);
    previousBoundary = nextBoundary;
  }

  output.push(...existing.slice(previousBoundary));
  return output;
}

function serializeQuestions(questions) {
  return `export const baseQuestions = ${JSON.stringify(questions, null, 2)};\n`;
}

async function main() {
  const { startId, file } = parseArgs(process.argv.slice(2));
  const filePath = path.resolve(process.cwd(), file);
  const moduleUrl = `${pathToFileURL(filePath).href}?t=${Date.now()}`;
  const imported = await import(moduleUrl);
  const baseQuestions = Array.isArray(imported.baseQuestions) ? imported.baseQuestions : [];

  const existing = [];
  const incoming = [];

  baseQuestions.forEach((question) => {
    if (Number(question?.id) >= startId) {
      incoming.push(question);
    } else {
      existing.push(question);
    }
  });

  const reordered = spreadBatch(existing, incoming);
  await fs.writeFile(filePath, serializeQuestions(reordered), "utf8");

  console.log(
    JSON.stringify(
      {
        file: path.basename(filePath),
        startId,
        existing: existing.length,
        incoming: incoming.length,
        total: reordered.length,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
