import { ensureStore, readCollection, writeCollection } from "../store.js";

const DAY_MS = 24 * 60 * 60 * 1000;

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

function parseDateMs(value) {
  const ms = Date.parse(String(value || ""));
  return Number.isFinite(ms) ? ms : null;
}

function parseUserIdFromActor(actorId) {
  if (typeof actorId !== "string") return null;
  if (!actorId.startsWith("user:")) return null;
  const userId = actorId.slice("user:".length).trim();
  return userId || null;
}

function markLatest(map, key, timestampMs) {
  if (!key || !Number.isFinite(timestampMs)) return;
  const current = map.get(key);
  if (!Number.isFinite(current) || timestampMs > current) {
    map.set(key, timestampMs);
  }
}

async function run() {
  await ensureStore();

  const inactivityDays = parsePositiveInt(process.env.INACTIVE_USER_DAYS, 180);
  const dryRun = String(process.env.INACTIVE_USER_DRY_RUN || "false").toLowerCase() === "true";
  const cutoffMs = Date.now() - inactivityDays * DAY_MS;

  const users = await readCollection("users");
  const attempts = await readCollection("attempts");
  const syncSessions = await readCollection("syncSessions");
  const syncPerformance = await readCollection("syncPerformance");

  const hasHistory = new Set();
  const latestSeenByUser = new Map();

  for (const user of users) {
    markLatest(latestSeenByUser, user.id, parseDateMs(user.createdAt));
  }

  for (const attempt of attempts) {
    const userId = attempt.userId || parseUserIdFromActor(attempt.actorId);
    if (!userId) continue;
    hasHistory.add(userId);
    const latestAttemptMs = Math.max(
      parseDateMs(attempt.finishedAt) ?? 0,
      parseDateMs(attempt.startedAt) ?? 0,
    );
    markLatest(latestSeenByUser, userId, latestAttemptMs);
  }

  for (const session of syncSessions) {
    const userId = parseUserIdFromActor(session.actorId);
    if (!userId) continue;
    hasHistory.add(userId);
    const latestSessionMs = Math.max(
      parseDateMs(session.createdAt) ?? 0,
      parseDateMs(session.date) ?? 0,
    );
    markLatest(latestSeenByUser, userId, latestSessionMs);
  }

  for (const event of syncPerformance) {
    const userId = parseUserIdFromActor(event.actorId);
    if (!userId) continue;
    hasHistory.add(userId);
    markLatest(latestSeenByUser, userId, parseDateMs(event.createdAt));
  }

  const usersToRemove = users.filter((user) => {
    if (!user?.id) return false;
    if (hasHistory.has(user.id)) return false;
    const latestSeenMs = latestSeenByUser.get(user.id);
    if (!Number.isFinite(latestSeenMs)) return false;
    return latestSeenMs <= cutoffMs;
  });

  const removeIds = new Set(usersToRemove.map((user) => user.id));
  const cleanedUsers = users.filter((user) => !removeIds.has(user.id));

  console.log(
    JSON.stringify(
      {
        dryRun,
        inactivityDays,
        cutoffIso: new Date(cutoffMs).toISOString(),
        totalUsers: users.length,
        removableUsers: usersToRemove.length,
        usersAfterCleanup: cleanedUsers.length,
        removedUserIds: usersToRemove.map((user) => user.id),
      },
      null,
      2,
    ),
  );

  if (!dryRun && usersToRemove.length > 0) {
    await writeCollection("users", cleanedUsers);
    console.log("Inactive user cleanup applied.");
  } else if (dryRun) {
    console.log("Dry run only; no files were changed.");
  } else {
    console.log("No inactive users matched cleanup criteria.");
  }
}

run().catch((error) => {
  console.error("Inactive user cleanup failed:", error);
  process.exitCode = 1;
});
