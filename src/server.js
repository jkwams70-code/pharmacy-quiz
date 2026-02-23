import crypto from "node:crypto";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createToken,
  hashPassword,
  optionalAuth,
  requireAuth,
  verifyPassword,
} from "./auth.js";
import { config } from "./config.js";
import { ensureQuestionsSeeded } from "./services/questions.js";
import {
  ensureStore,
  readCollection,
  updateCollection,
  writeCollection,
} from "./store.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, "..", "..");

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function safeNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function getActorId(req) {
  if (req.user?.sub) {
    return `user:${req.user.sub}`;
  }

  const clientId = req.headers["x-client-id"];
  if (typeof clientId === "string" && clientId.trim()) {
    return `client:${clientId.trim()}`;
  }

  return "client:anonymous";
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function summarizeAttempt(attempt) {
  return {
    id: attempt.id,
    mode: attempt.mode,
    category: attempt.category,
    total: attempt.total,
    score: attempt.score,
    percent: attempt.percent,
    startedAt: attempt.startedAt,
    finishedAt: attempt.finishedAt,
    durationSeconds: attempt.durationSeconds,
    metadata: attempt.metadata || {},
  };
}

function buildDashboardFromAttempts(attempts, questions) {
  const questionById = new Map(questions.map((q) => [Number(q.id), q]));
  const questionStats = new Map();
  const categoryStats = new Map();

  let totalQuestionAttempts = 0;
  let totalCorrect = 0;

  for (const attempt of attempts) {
    for (const rawId of attempt.questionIds || []) {
      const id = Number(rawId);
      const question = questionById.get(id);
      if (!question) continue;

      const answer = attempt.answers?.[String(id)];
      const isCorrect = answer === question.correct;

      totalQuestionAttempts += 1;
      if (isCorrect) totalCorrect += 1;

      const stat = questionStats.get(id) || {
        attempts: 0,
        correct: 0,
        category: question.category || "General",
      };
      stat.attempts += 1;
      if (isCorrect) stat.correct += 1;
      questionStats.set(id, stat);

      const category = question.category || "General";
      const categoryRow = categoryStats.get(category) || {
        attempts: 0,
        correct: 0,
      };
      categoryRow.attempts += 1;
      if (isCorrect) categoryRow.correct += 1;
      categoryStats.set(category, categoryRow);
    }
  }

  const weakQuestions = [...questionStats.values()].filter((row) => {
    const accuracy =
      row.attempts === 0 ? 100 : Math.round((row.correct / row.attempts) * 100);
    return accuracy < 60;
  }).length;

  const categories = [...categoryStats.entries()]
    .map(([category, stats]) => ({
      category,
      attempts: stats.attempts,
      correct: stats.correct,
      accuracy:
        stats.attempts === 0
          ? 0
          : Math.round((stats.correct / stats.attempts) * 100),
    }))
    .sort((a, b) => a.category.localeCompare(b.category));

  return {
    totalSessions: attempts.length,
    totalQuestionAttempts,
    overallAccuracy:
      totalQuestionAttempts === 0
        ? 0
        : Math.round((totalCorrect / totalQuestionAttempts) * 100),
    weakQuestions,
    categories,
  };
}

function buildDashboardFromSync(events, sessions) {
  const questionStats = new Map();
  const categoryStats = new Map();

  let totalAttempts = 0;
  let totalCorrect = 0;

  for (const event of events) {
    const id = Number(event.questionId);
    const isCorrect = Boolean(event.isCorrect);
    const category = event.category || "General";

    totalAttempts += 1;
    if (isCorrect) totalCorrect += 1;

    const q = questionStats.get(id) || { attempts: 0, correct: 0 };
    q.attempts += 1;
    if (isCorrect) q.correct += 1;
    questionStats.set(id, q);

    const cat = categoryStats.get(category) || { attempts: 0, correct: 0 };
    cat.attempts += 1;
    if (isCorrect) cat.correct += 1;
    categoryStats.set(category, cat);
  }

  const weakQuestions = [...questionStats.values()].filter((row) => {
    const accuracy =
      row.attempts === 0 ? 100 : Math.round((row.correct / row.attempts) * 100);
    return accuracy < 60;
  }).length;

  const categories = [...categoryStats.entries()]
    .map(([category, stats]) => ({
      category,
      attempts: stats.attempts,
      correct: stats.correct,
      accuracy:
        stats.attempts === 0
          ? 0
          : Math.round((stats.correct / stats.attempts) * 100),
    }))
    .sort((a, b) => a.category.localeCompare(b.category));

  return {
    totalSessions: sessions.length,
    totalAttempts,
    overallAccuracy:
      totalAttempts === 0
        ? 0
        : Math.round((totalCorrect / totalAttempts) * 100),
    weakQuestions,
    categories,
  };
}

app.use(
  cors({
    origin: config.corsOrigin === "*" ? true : config.corsOrigin,
  }),
);
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// Serve static frontend files
app.use(express.static(frontendPath));

// API routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "pharmacy-quiz-backend" });
});

app.post(
  "/api/auth/register",
  asyncHandler(async (req, res) => {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body?.password || "");

    if (!name || !email || !password) {
      res.status(400).json({ error: "name, email and password are required" });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: "password must be at least 6 characters" });
      return;
    }

    const users = await readCollection("users");
    if (users.some((u) => u.email === email)) {
      res.status(409).json({ error: "email already in use" });
      return;
    }

    const user = {
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    await writeCollection("users", users);

    const token = createToken(user);
    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  }),
);

app.post(
  "/api/auth/login",
  asyncHandler(async (req, res) => {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body?.password || "");

    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }

    const users = await readCollection("users");
    const user = users.find((u) => u.email === email);

    if (!user) {
      res.status(401).json({ error: "invalid credentials" });
      return;
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "invalid credentials" });
      return;
    }

    const token = createToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  }),
);

app.get(
  "/api/auth/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const users = await readCollection("users");
    const user = users.find((u) => u.id === req.user.sub);

    if (!user) {
      res.status(404).json({ error: "user not found" });
      return;
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    });
  }),
);

app.get(
  "/api/questions",
  asyncHandler(async (req, res) => {
    const category = String(req.query.category || "").trim();
    const idsRaw = String(req.query.ids || "").trim();
    const start = safeNumber(req.query.start);
    const limit = safeNumber(req.query.limit);
    const shouldShuffle =
      String(req.query.shuffle || "").toLowerCase() === "true";

    let questions = await readCollection("questions");

    if (category && category !== "all") {
      questions = questions.filter((q) => q.category === category);
    }

    if (idsRaw) {
      const ids = idsRaw
        .split(",")
        .map((id) => Number(id.trim()))
        .filter((id) => Number.isFinite(id));

      const questionById = new Map(questions.map((q) => [Number(q.id), q]));
      questions = ids.map((id) => questionById.get(id)).filter(Boolean);
    }

    if (shouldShuffle) {
      questions = shuffle(questions);
    }

    if (start && start > 1) {
      questions = questions.slice(start - 1);
    }

    if (limit && limit > 0) {
      questions = questions.slice(0, limit);
    }

    res.json({
      total: questions.length,
      questions,
    });
  }),
);

app.get(
  "/api/categories",
  asyncHandler(async (_req, res) => {
    const questions = await readCollection("questions");
    const categories = [...new Set(questions.map((q) => q.category))]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    res.json({ categories });
  }),
);

app.post(
  "/api/attempts/start",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const actorId = getActorId(req);
    const mode = String(req.body?.mode || "study");
    const category = String(req.body?.category || "all");
    const count = safeNumber(req.body?.count);
    const metadata =
      typeof req.body?.metadata === "object" ? req.body.metadata : {};

    const allQuestions = await readCollection("questions");
    let questionIds = Array.isArray(req.body?.questionIds)
      ? req.body.questionIds
          .map((id) => Number(id))
          .filter((id) => Number.isFinite(id))
      : [];

    if (questionIds.length === 0) {
      let pool =
        category && category !== "all"
          ? allQuestions.filter((q) => q.category === category)
          : [...allQuestions];

      pool = shuffle(pool);
      if (count && count > 0) {
        pool = pool.slice(0, count);
      }

      questionIds = pool.map((q) => Number(q.id));
    }

    if (questionIds.length === 0) {
      res
        .status(400)
        .json({ error: "No questions available for this attempt" });
      return;
    }

    const attempt = {
      id: crypto.randomUUID(),
      actorId,
      userId: req.user?.sub || null,
      mode,
      category,
      questionIds,
      answers: {},
      total: questionIds.length,
      score: null,
      percent: null,
      startedAt: new Date().toISOString(),
      finishedAt: null,
      durationSeconds: null,
      metadata,
    };

    await updateCollection("attempts", async (items) => {
      items.push(attempt);
      return items;
    });

    res.status(201).json({
      attemptId: attempt.id,
      mode: attempt.mode,
      questionIds: attempt.questionIds,
      total: attempt.total,
      startedAt: attempt.startedAt,
    });
  }),
);

app.post(
  "/api/attempts/:attemptId/answer",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const actorId = getActorId(req);
    const attemptId = req.params.attemptId;
    const questionId = safeNumber(req.body?.questionId);
    const answer = req.body?.answer;

    if (!questionId || answer === undefined || answer === null) {
      res.status(400).json({ error: "questionId and answer are required" });
      return;
    }

    let found = null;
    await updateCollection("attempts", async (attempts) => {
      const attempt = attempts.find(
        (a) => a.id === attemptId && a.actorId === actorId,
      );

      if (!attempt) {
        return attempts;
      }

      if (attempt.finishedAt) {
        found = "finished";
        return attempts;
      }

      if (!attempt.questionIds.includes(Number(questionId))) {
        found = "missing-question";
        return attempts;
      }

      attempt.answers[String(questionId)] = String(answer);
      found = "ok";
      return attempts;
    });

    if (!found) {
      res.status(404).json({ error: "Attempt not found" });
      return;
    }
    if (found === "finished") {
      res.status(409).json({ error: "Attempt already finished" });
      return;
    }
    if (found === "missing-question") {
      res
        .status(400)
        .json({ error: "Question does not belong to this attempt" });
      return;
    }

    res.json({ ok: true });
  }),
);

app.post(
  "/api/attempts/:attemptId/finish",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const actorId = getActorId(req);
    const attemptId = req.params.attemptId;
    const providedAnswers =
      req.body?.answers && typeof req.body.answers === "object"
        ? req.body.answers
        : null;
    const durationSeconds = safeNumber(req.body?.durationSeconds);

    const questions = await readCollection("questions");
    const questionById = new Map(questions.map((q) => [Number(q.id), q]));

    let finishedAttempt = null;

    await updateCollection("attempts", async (attempts) => {
      const attempt = attempts.find(
        (a) => a.id === attemptId && a.actorId === actorId,
      );

      if (!attempt || attempt.finishedAt) {
        return attempts;
      }

      if (providedAnswers) {
        for (const [id, answer] of Object.entries(providedAnswers)) {
          attempt.answers[String(id)] = String(answer);
        }
      }

      let score = 0;
      for (const rawId of attempt.questionIds) {
        const id = Number(rawId);
        const q = questionById.get(id);
        if (!q) continue;

        const selected = attempt.answers?.[String(id)];
        if (selected === q.correct) {
          score += 1;
        }
      }

      attempt.score = score;
      attempt.total = attempt.questionIds.length;
      attempt.percent = attempt.total
        ? Math.round((score / attempt.total) * 100)
        : 0;
      attempt.durationSeconds = durationSeconds ?? attempt.durationSeconds;
      attempt.finishedAt = new Date().toISOString();

      finishedAttempt = attempt;
      return attempts;
    });

    if (!finishedAttempt) {
      res.status(404).json({ error: "Active attempt not found" });
      return;
    }

    res.json({
      attempt: summarizeAttempt(finishedAttempt),
    });
  }),
);

app.get(
  "/api/attempts/history",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const actorId = getActorId(req);
    const mode = String(req.query.mode || "")
      .trim()
      .toLowerCase();
    const limit = safeNumber(req.query.limit) || 20;

    const attempts = await readCollection("attempts");
    const filtered = attempts
      .filter((a) => a.actorId === actorId && a.finishedAt)
      .filter((a) => (mode ? String(a.mode).toLowerCase() === mode : true))
      .sort((a, b) => new Date(b.finishedAt) - new Date(a.finishedAt))
      .slice(0, limit)
      .map(summarizeAttempt);

    res.json({ attempts: filtered });
  }),
);

app.get(
  "/api/dashboard",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const actorId = getActorId(req);
    const attempts = (await readCollection("attempts")).filter(
      (a) => a.actorId === actorId && a.finishedAt,
    );
    const questions = await readCollection("questions");
    const dashboard = buildDashboardFromAttempts(attempts, questions);

    res.json(dashboard);
  }),
);

app.post(
  "/api/sync/performance",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const actorId = getActorId(req);
    const questionId = safeNumber(req.body?.questionId);
    const isCorrect = Boolean(req.body?.isCorrect);
    const category = String(req.body?.category || "").trim() || "General";

    if (!questionId) {
      res.status(400).json({ error: "questionId is required" });
      return;
    }

    const event = {
      id: crypto.randomUUID(),
      actorId,
      questionId,
      isCorrect,
      category,
      createdAt: new Date().toISOString(),
    };

    await updateCollection("syncPerformance", async (events) => {
      events.push(event);
      return events;
    });

    res.status(201).json({ ok: true });
  }),
);

app.post(
  "/api/sync/sessions",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const actorId = getActorId(req);

    const session = {
      id: crypto.randomUUID(),
      actorId,
      mode: String(req.body?.mode || "").trim() || "Unknown",
      score: safeNumber(req.body?.score) || 0,
      total: safeNumber(req.body?.total) || 0,
      percent: safeNumber(req.body?.percent) || 0,
      duration: req.body?.duration || null,
      date: req.body?.date || new Date().toLocaleString(),
      createdAt: new Date().toISOString(),
    };

    await updateCollection("syncSessions", async (sessions) => {
      sessions.push(session);
      return sessions;
    });

    res.status(201).json({ ok: true });
  }),
);

app.get(
  "/api/sync/history",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const actorId = getActorId(req);
    const mode = String(req.query.mode || "").trim();
    const limit = safeNumber(req.query.limit) || 20;

    let sessions = (await readCollection("syncSessions")).filter(
      (s) => s.actorId === actorId,
    );

    if (mode) {
      sessions = sessions.filter((s) => String(s.mode).startsWith(mode));
    }

    sessions = sessions
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);

    res.json({ sessions });
  }),
);

app.get(
  "/api/sync/dashboard",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const actorId = getActorId(req);

    const sessions = (await readCollection("syncSessions")).filter(
      (s) => s.actorId === actorId,
    );
    const events = (await readCollection("syncPerformance")).filter(
      (e) => e.actorId === actorId,
    );

    res.json(buildDashboardFromSync(events, sessions));
  }),
);

app.post(
  "/api/admin/seed-questions",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const result = await ensureQuestionsSeeded();
    res.json(result);
  }),
);

// Admin: Get all users
app.get(
  "/api/admin/users",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const users = await readCollection("users");
    const sanitized = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      createdAt: u.createdAt,
    }));

    res.json({
      total: sanitized.length,
      users: sanitized,
    });
  }),
);

// Admin: Delete user
app.delete(
  "/api/admin/users/:userId",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const userId = req.params.userId;
    const users = await readCollection("users");
    const filtered = users.filter((u) => u.id !== userId);

    if (filtered.length === users.length) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    await writeCollection("users", filtered);
    res.json({ ok: true, message: "User deleted" });
  }),
);

// Admin: Get all questions
app.get(
  "/api/admin/questions",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const questions = await readCollection("questions");
    res.json({
      total: questions.length,
      questions,
    });
  }),
);

// Admin: Add question
app.post(
  "/api/admin/questions",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const { text, category, options, correct } = req.body;

    if (
      !text ||
      !category ||
      !Array.isArray(options) ||
      options.length === 0 ||
      correct === undefined
    ) {
      res.status(400).json({
        error:
          "Required fields: text, category, options (array), correct (option index)",
      });
      return;
    }

    const questions = await readCollection("questions");
    const newId =
      questions.length > 0
        ? Math.max(...questions.map((q) => Number(q.id))) + 1
        : 1;

    const newQuestion = {
      id: String(newId),
      text,
      category,
      options,
      correct: String(correct),
    };

    questions.push(newQuestion);
    await writeCollection("questions", questions);

    res.status(201).json({ ok: true, question: newQuestion });
  }),
);

// Admin: Update question
app.put(
  "/api/admin/questions/:questionId",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const questionId = req.params.questionId;
    const { text, category, options, correct } = req.body;

    const questions = await readCollection("questions");
    const idx = questions.findIndex((q) => String(q.id) === questionId);

    if (idx === -1) {
      res.status(404).json({ error: "Question not found" });
      return;
    }

    if (text) questions[idx].text = text;
    if (category) questions[idx].category = category;
    if (Array.isArray(options) && options.length > 0)
      questions[idx].options = options;
    if (correct !== undefined) questions[idx].correct = String(correct);

    await writeCollection("questions", questions);
    res.json({ ok: true, question: questions[idx] });
  }),
);

// Admin: Delete question
app.delete(
  "/api/admin/questions/:questionId",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const questionId = req.params.questionId;
    const questions = await readCollection("questions");
    const filtered = questions.filter((q) => String(q.id) !== questionId);

    if (filtered.length === questions.length) {
      res.status(404).json({ error: "Question not found" });
      return;
    }

    await writeCollection("questions", filtered);
    res.json({ ok: true, message: "Question deleted" });
  }),
);

// Admin: Get platform statistics
app.get(
  "/api/admin/stats",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const users = await readCollection("users");
    const questions = await readCollection("questions");
    const attempts = await readCollection("attempts");
    const syncPerformance = await readCollection("syncPerformance");
    const syncSessions = await readCollection("syncSessions");

    const categories = [...new Set(questions.map((q) => q.category))].filter(
      Boolean,
    );

    const totalAttempts = attempts.filter((a) => a.finishedAt).length;
    const avgScore =
      totalAttempts === 0
        ? 0
        : Math.round(
            attempts
              .filter((a) => a.finishedAt)
              .reduce((sum, a) => sum + (a.percent || 0), 0) / totalAttempts,
          );

    res.json({
      totalUsers: users.length,
      totalQuestions: questions.length,
      totalCategories: categories.length,
      categories: categories.sort(),
      totalAttempts,
      totalSyncEvents: syncPerformance.length,
      totalSessions: syncSessions.length,
      averageScore: avgScore,
      storageUsage: {
        users: users.length,
        questions: questions.length,
        attempts: attempts.length,
        syncEvents: syncPerformance.length,
        syncSessions: syncSessions.length,
      },
    });
  }),
);

// Admin: Export all data
app.get(
  "/api/admin/export",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const format = String(req.query.format || "json").toLowerCase();
    const users = (await readCollection("users")).map((u) => ({
      ...u,
      passwordHash: undefined,
    }));
    const questions = await readCollection("questions");
    const attempts = await readCollection("attempts");
    const syncPerformance = await readCollection("syncPerformance");
    const syncSessions = await readCollection("syncSessions");

    const exportData = {
      exportedAt: new Date().toISOString(),
      summary: {
        users: users.length,
        questions: questions.length,
        attempts: attempts.length,
        syncEvents: syncPerformance.length,
        syncSessions: syncSessions.length,
      },
      data: {
        users,
        questions,
        attempts,
        syncPerformance,
        syncSessions,
      },
    };

    if (format === "csv") {
      // Export attempts as CSV
      const csvHeader = [
        "Attempt ID",
        "Actor ID",
        "User ID",
        "Mode",
        "Category",
        "Score",
        "Total",
        "Percent",
        "Started",
        "Finished",
        "Duration (s)",
      ].join(",");

      const csvRows = attempts
        .filter((a) => a.finishedAt)
        .map((a) =>
          [
            a.id,
            a.actorId,
            a.userId || "",
            a.mode,
            a.category,
            a.score,
            a.total,
            a.percent,
            a.startedAt,
            a.finishedAt,
            a.durationSeconds || "",
          ]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(","),
        )
        .join("\n");

      res.header("Content-Type", "text/csv");
      res.header(
        "Content-Disposition",
        "attachment; filename=quiz-attempts.csv",
      );
      res.send(`${csvHeader}\n${csvRows}`);
      return;
    }

    res.header("Content-Type", "application/json");
    res.header("Content-Disposition", "attachment; filename=quiz-export.json");
    res.json(exportData);
  }),
);

// Admin: Clear all data (careful!)
app.post(
  "/api/admin/reset",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const confirmToken = req.body?.confirmToken;
    if (confirmToken !== "RESET_PHARMACY_QUIZ_DATA_CONFIRMED") {
      res.status(400).json({
        error:
          "Reset not confirmed. Send confirmToken: 'RESET_PHARMACY_QUIZ_DATA_CONFIRMED'",
      });
      return;
    }

    await writeCollection("users", []);
    await writeCollection("attempts", []);
    await writeCollection("syncPerformance", []);
    await writeCollection("syncSessions", []);

    const result = await ensureQuestionsSeeded();

    res.json({
      ok: true,
      message: "All data reset. Questions re-seeded.",
      seeded: result.seeded,
    });
  }),
);

// Serve index.html for all non-API routes (SPA support)
app.get("*", (_req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Internal server error" });
});

async function start() {
  await ensureStore();
  const seedInfo = await ensureQuestionsSeeded();
  if (seedInfo.seeded) {
    console.log(
      `[seed] imported ${seedInfo.count} questions from Quiz/data.js`,
    );
  }

  app.listen(config.port, () => {
    console.log(`Backend running on http://localhost:${config.port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exitCode = 1;
});
