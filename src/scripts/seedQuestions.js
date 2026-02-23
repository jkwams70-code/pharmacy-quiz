import { ensureStore, writeCollection } from "../store.js";
import { importQuestionsFromFrontend } from "../services/questions.js";

async function main() {
  await ensureStore();
  const questions = await importQuestionsFromFrontend();
  await writeCollection("questions", questions);

  console.log(`Seed complete: ${questions.length} questions imported.`);
}

main().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exitCode = 1;
});
