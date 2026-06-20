import { ensureStore, readCollection, writeCollection } from "../store.js";
import { importQuestionsFromFrontend } from "../services/questions.js";

async function main() {
  await ensureStore();
  const questions = await importQuestionsFromFrontend();
  await writeCollection("questions", questions);
  const storedQuestions = await readCollection("questions");

  if (storedQuestions.length !== questions.length) {
    throw new Error(
      `Seed verification failed: wrote ${questions.length} questions but read back ${storedQuestions.length}.`,
    );
  }

  console.log(`Seed complete: ${storedQuestions.length} questions stored in Neon.`);
}

main().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exitCode = 1;
});
