import { ensureStore, readCollection, writeCollection } from "../store.js";

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
  const questionById = new Map(
    questions.map((question) => [String(Number(question.id)), question]),
  );
  const validQuestionIds = new Set(questionById.keys());

  let attemptsUserRefsCleared = 0;
  let attemptsQuestionRefsRemoved = 0;
  let attemptsAnswersPruned = 0;
  let attemptsScoresRecomputed = 0;

  const repairedAttempts = attempts.map((attempt) => {
    const next = { ...attempt };

    if (next.userId && !userIds.has(next.userId)) {
      next.userId = null;
      attemptsUserRefsCleared += 1;
    }

    const sourceIds = Array.isArray(next.questionIds)
      ? next.questionIds.map((id) => String(Number(id)))
      : [];
    const filteredIds = sourceIds.filter((id) => validQuestionIds.has(id));
    if (filteredIds.length !== sourceIds.length) {
      attemptsQuestionRefsRemoved += sourceIds.length - filteredIds.length;
      next.questionIds = filteredIds.map((id) => Number(id));
      next.total = next.questionIds.length;
    }

    const answers = next.answers && typeof next.answers === "object" ? next.answers : {};
    const validAnswerKeys = new Set(filteredIds);
    const prunedAnswers = {};
    let removedAnswers = 0;
    Object.entries(answers).forEach(([key, value]) => {
      const normalized = String(Number(key));
      if (!validAnswerKeys.has(normalized)) {
        removedAnswers += 1;
        return;
      }
      prunedAnswers[normalized] = value;
    });
    if (removedAnswers > 0) {
      next.answers = prunedAnswers;
      attemptsAnswersPruned += removedAnswers;
    }

    if (next.finishedAt) {
      const answersMap = next.answers && typeof next.answers === "object" ? next.answers : {};
      const score = filteredIds.reduce((sum, id) => {
        const question = questionById.get(id);
        if (!question) return sum;
        return String(answersMap[id] || "") === String(question.correct || "")
          ? sum + 1
          : sum;
      }, 0);
      const total = filteredIds.length;
      const percent = total > 0 ? Math.round((score / total) * 100) : 0;
      if (
        Number(next.score) !== score ||
        Number(next.total) !== total ||
        Number(next.percent) !== percent
      ) {
        next.score = score;
        next.total = total;
        next.percent = percent;
        attemptsScoresRecomputed += 1;
      }
    }

    return next;
  });

  const missingSyncUserRef = (entry) => {
    const userId = parseUserIdFromActor(entry?.actorId);
    return Boolean(userId && !userIds.has(userId));
  };

  const syncSessionsBefore = syncSessions.length;
  const syncPerformanceBefore = syncPerformance.length;
  const repairedSyncSessions = syncSessions.filter((entry) => !missingSyncUserRef(entry));
  const repairedSyncPerformance = syncPerformance.filter(
    (entry) => !missingSyncUserRef(entry),
  );
  const syncSessionsRemoved = syncSessionsBefore - repairedSyncSessions.length;
  const syncPerformanceRemoved = syncPerformanceBefore - repairedSyncPerformance.length;

  await writeCollection("attempts", repairedAttempts);
  await writeCollection("syncSessions", repairedSyncSessions);
  await writeCollection("syncPerformance", repairedSyncPerformance);

  console.log(
    JSON.stringify(
      {
        attemptsUserRefsCleared,
        attemptsQuestionRefsRemoved,
        attemptsAnswersPruned,
        attemptsScoresRecomputed,
        syncSessionsRemoved,
        syncPerformanceRemoved,
      },
      null,
      2,
    ),
  );
}

run().catch((error) => {
  console.error("Data relationship repair failed:", error);
  process.exitCode = 1;
});
