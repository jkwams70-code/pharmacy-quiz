import { ensureStore, readCollection } from "../store.js";

function parseUserIdFromActor(actorId) {
  if (typeof actorId !== "string") return null;
  if (!actorId.startsWith("user:")) return null;
  const userId = actorId.slice("user:".length).trim();
  return userId || null;
}

async function run() {
  await ensureStore();

  const users = await readCollection("users");
  const questions = await readCollection("questions");
  const attempts = await readCollection("attempts");
  const syncSessions = await readCollection("syncSessions");
  const syncPerformance = await readCollection("syncPerformance");

  const userIds = new Set(users.map((user) => user.id));
  const questionIds = new Set(questions.map((question) => Number(question.id)));

  const missingAttemptUserRefs = [];
  const missingAttemptQuestionRefs = [];
  const missingSyncUserRefs = [];

  for (const attempt of attempts) {
    if (attempt.userId && !userIds.has(attempt.userId)) {
      missingAttemptUserRefs.push({
        attemptId: attempt.id,
        userId: attempt.userId,
      });
    }

    for (const rawQuestionId of attempt.questionIds || []) {
      const questionId = Number(rawQuestionId);
      if (!questionIds.has(questionId)) {
        missingAttemptQuestionRefs.push({
          attemptId: attempt.id,
          questionId,
        });
      }
    }
  }

  for (const event of [...syncSessions, ...syncPerformance]) {
    const userId = parseUserIdFromActor(event.actorId);
    if (userId && !userIds.has(userId)) {
      missingSyncUserRefs.push({
        eventId: event.id,
        userId,
      });
    }
  }

  const summary = {
    users: users.length,
    questions: questions.length,
    attempts: attempts.length,
    syncSessions: syncSessions.length,
    syncPerformance: syncPerformance.length,
    missingAttemptUserRefs: missingAttemptUserRefs.length,
    missingAttemptQuestionRefs: missingAttemptQuestionRefs.length,
    missingSyncUserRefs: missingSyncUserRefs.length,
  };

  console.log(JSON.stringify(summary, null, 2));

  if (
    missingAttemptUserRefs.length > 0 ||
    missingAttemptQuestionRefs.length > 0 ||
    missingSyncUserRefs.length > 0
  ) {
    console.error("Data relationship validation failed.");
    process.exitCode = 1;
    return;
  }

  console.log("Data relationship validation passed.");
}

run().catch((error) => {
  console.error("Data relationship validation failed:", error);
  process.exitCode = 1;
});
