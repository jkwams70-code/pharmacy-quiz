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
  getCollectionMeta,
  readCollection,
  updateCollection,
  writeCollection,
} from "./store.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, "..", "www");

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

function normalizeNewsStatus(status = "") {
  const next = String(status || "").trim().toLowerCase();
  if (!next) return "pending_review";
  if (next === "review" || next === "in_review" || next === "draft") return "pending_review";
  if (next === "approved" || next === "ready") return "approved";
  if (next === "published" || next === "live") return "published";
  if (next === "rejected" || next === "declined") return "rejected";
  return next;
}

function getNewsTimestamp(item = {}) {
  return String(
    item.publishedAt || item.updatedAt || item.createdAt || item.collectedAt || "",
  ).trim();
}

function sortNewsItemsDesc(items = []) {
  return [...items].sort((a, b) => {
    const aTime = new Date(getNewsTimestamp(a)).getTime() || 0;
    const bTime = new Date(getNewsTimestamp(b)).getTime() || 0;
    return bTime - aTime || String(b.storyKey || b.title || b.id || "").localeCompare(String(a.storyKey || a.title || a.id || ""));
  });
}

function getNewsItemIdentity(item = {}) {
  return String(item.id || item.storyKey || item.slug || item.title || "").trim();
}

function findNewsItemIndex(items = [], identifier = "") {
  const safeId = String(identifier || "").trim();
  if (!safeId) return -1;
  const normalized = safeId.toLowerCase();
  return items.findIndex((item) => {
    const identity = getNewsItemIdentity(item);
    const storyKey = String(item.storyKey || "").trim();
    return (
      identity === safeId ||
      storyKey === safeId ||
      identity.toLowerCase() === normalized ||
      storyKey.toLowerCase() === normalized
    );
  });
}

function applyNewsItemDefaults(item = {}, fallback = {}) {
  const now = new Date().toISOString();
  const title = String(item.title || fallback.title || "").trim();
  const storyKey = String(item.storyKey || fallback.storyKey || title || item.id || "").trim();
  const status = normalizeNewsStatus(item.status || fallback.status || "pending_review");

  return {
    id: String(item.id || fallback.id || crypto.randomUUID()).trim(),
    storyKey: storyKey || String(item.id || fallback.id || crypto.randomUUID()).trim(),
    title,
    summary: String(item.summary || item.excerpt || fallback.summary || "").trim(),
    content: String(item.content || item.body || fallback.content || "").trim(),
    category: String(item.category || fallback.category || "clinical-news").trim() || "clinical-news",
    tags: Array.isArray(item.tags)
      ? item.tags.map((tag) => String(tag || "").trim()).filter(Boolean)
      : Array.isArray(fallback.tags)
        ? fallback.tags.map((tag) => String(tag || "").trim()).filter(Boolean)
        : [],
    sourceName: String(item.sourceName || item.publishedByName || fallback.sourceName || "AjixPharmacy Desk").trim(),
    publishedByName: String(item.publishedByName || item.sourceName || fallback.publishedByName || "").trim(),
    author: String(item.author || fallback.author || item.publishedByName || item.sourceName || "AjixPharmacy Desk").trim(),
    sourceId: String(item.sourceId || fallback.sourceId || "").trim(),
    sourceType: String(item.sourceType || fallback.sourceType || "").trim(),
    feedSlot: String(item.feedSlot || fallback.feedSlot || "").trim(),
    importance: String(item.importance || fallback.importance || "").trim(),
    imageUrl: String(item.imageUrl || fallback.imageUrl || item.heroBackgroundImage || "").trim(),
    imageAlt: String(item.imageAlt || fallback.imageAlt || title || "").trim(),
    reviewNote: String(item.reviewNote || fallback.reviewNote || "").trim(),
    status,
    featured: Boolean(item.featured ?? fallback.featured ?? false),
    commentsEnabled: Boolean(item.commentsEnabled ?? fallback.commentsEnabled ?? true),
    newsletterEnabled: Boolean(item.newsletterEnabled ?? fallback.newsletterEnabled ?? false),
    likes: safeNumber(item.likes ?? fallback.likes) ?? 0,
    views: safeNumber(item.views ?? fallback.views) ?? 0,
    collectedAt: String(item.collectedAt || fallback.collectedAt || "").trim(),
    createdAt: String(item.createdAt || fallback.createdAt || now).trim() || now,
    updatedAt: String(item.updatedAt || fallback.updatedAt || now).trim() || now,
    publishedAt: String(item.publishedAt || fallback.publishedAt || "").trim(),
  };
}

function upsertNewsItem(items = [], item = {}, fallback = {}) {
  const nextItem = applyNewsItemDefaults(item, fallback);
  const existingIndex = findNewsItemIndex(items, nextItem.id || nextItem.storyKey);
  const existingItem = existingIndex >= 0 ? items[existingIndex] : null;
  const now = new Date().toISOString();

  const merged = {
    ...existingItem,
    ...nextItem,
    id: nextItem.id || existingItem?.id || crypto.randomUUID(),
    storyKey: nextItem.storyKey || existingItem?.storyKey || nextItem.id || existingItem?.id || "",
    createdAt: existingItem?.createdAt || nextItem.createdAt || now,
    updatedAt: now,
  };

  merged.status = normalizeNewsStatus(merged.status);
  if (merged.status === "published") {
    merged.publishedAt = merged.publishedAt || existingItem?.publishedAt || now;
  } else if (!merged.publishedAt) {
    merged.publishedAt = existingItem?.publishedAt || "";
  }

  if (!merged.summary) merged.summary = merged.content ? merged.content.slice(0, 220) : "";

  if (existingIndex >= 0) {
    items[existingIndex] = merged;
  } else {
    items.push(merged);
  }

  return merged;
}

function buildPublishedNewsSections(items = []) {
  const heroCandidates = items.filter((item) => {
    const slot = String(item.feedSlot || "").trim().toLowerCase();
    const importance = String(item.importance || "").trim().toLowerCase();
    const category = String(item.category || "").trim().toLowerCase();
    return (
      item.featured ||
      importance === "high" ||
      slot === "hero" ||
      slot === "popular-stories" ||
      category === "trending" ||
      category === "alert"
    );
  });

  const medicineCandidates = items.filter((item) => {
    const category = String(item.category || "").trim().toLowerCase();
    const slot = String(item.feedSlot || "").trim().toLowerCase();
    return category === "medicine" || category === "clinical-news" || slot === "medicine";
  });

  const trendingCandidates = items.filter((item) => {
    const category = String(item.category || "").trim().toLowerCase();
    const slot = String(item.feedSlot || "").trim().toLowerCase();
    const importance = String(item.importance || "").trim().toLowerCase();
    return category === "trending" || category === "alert" || slot === "trending-now" || importance === "high";
  });

  return {
    hero: heroCandidates.slice(0, 3),
    latest: items.slice(0, 4),
    medicine: medicineCandidates.slice(0, 5),
    trendingNow: trendingCandidates.slice(0, 5),
  };
}

function buildPublicNewsFeed(items = []) {
  const publishedItems = sortNewsItemsDesc(
    items.filter((item) => normalizeNewsStatus(item.status) === "published"),
  );

  return {
    ok: true,
    total: publishedItems.length,
    items: publishedItems,
    sections: buildPublishedNewsSections(publishedItems),
    updatedAt: publishedItems[0]?.updatedAt || publishedItems[0]?.publishedAt || null,
  };
}

function slugifyNewsKey(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function requireAdminNewsAccess(req, res) {
  if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
    res.status(403).json({ error: "Forbidden" });
    return false;
  }
  return true;
}

function normalizeNewsSourceEntry(raw = {}, fallback = {}) {
  const now = new Date().toISOString();
  const name = String(raw.name || raw.title || fallback.name || "Source").trim() || "Source";
  const slug = slugifyNewsKey(raw.slug || raw.id || fallback.slug || name || "source") || "source";

  return {
    id: String(raw.id || fallback.id || slug || crypto.randomUUID()).trim() || slug,
    name,
    slug,
    url: String(raw.url || fallback.url || "").trim(),
    description: String(raw.description || fallback.description || "").trim(),
    category: String(raw.category || fallback.category || "clinical-news").trim() || "clinical-news",
    extractMode: String(raw.extractMode || raw.type || fallback.extractMode || "structured").trim().toLowerCase() || "structured",
    priority: safeNumber(raw.priority ?? fallback.priority) ?? 50,
    enabled: Boolean(raw.enabled ?? fallback.enabled ?? true),
    reviewRequired: Boolean(raw.reviewRequired ?? fallback.reviewRequired ?? true),
    system: Boolean(raw.system ?? fallback.system ?? false),
    createdAt: String(raw.createdAt || fallback.createdAt || now).trim() || now,
    updatedAt: String(raw.updatedAt || fallback.updatedAt || now).trim() || now,
    lastFetchedAt: String(raw.lastFetchedAt || fallback.lastFetchedAt || "").trim(),
    lastError: String(raw.lastError || fallback.lastError || "").trim(),
  };
}

function normalizeNewsCategoryEntry(raw = {}, fallback = {}) {
  const now = new Date().toISOString();
  const name = String(raw.name || raw.title || raw.label || fallback.name || "Category").trim() || "Category";
  const slug = slugifyNewsKey(raw.slug || raw.id || fallback.slug || name || "category") || "category";

  return {
    id: String(raw.id || fallback.id || slug || crypto.randomUUID()).trim() || slug,
    name,
    slug,
    color: String(raw.color || fallback.color || "#64748b").trim() || "#64748b",
    description: String(raw.description || fallback.description || "").trim(),
    system: Boolean(raw.system ?? fallback.system ?? false),
    createdAt: String(raw.createdAt || fallback.createdAt || now).trim() || now,
    updatedAt: String(raw.updatedAt || fallback.updatedAt || now).trim() || now,
  };
}

function normalizeNewsRunEntry(raw = {}, fallback = {}) {
  const now = new Date().toISOString();
  const status = String(raw.status || fallback.status || "success").trim().toLowerCase() || "success";

  return {
    id: String(raw.id || fallback.id || crypto.randomUUID()).trim(),
    status,
    sourceCount: safeNumber(raw.sourceCount ?? fallback.sourceCount) ?? 0,
    addedCount: safeNumber(raw.addedCount ?? fallback.addedCount) ?? 0,
    updatedCount: safeNumber(raw.updatedCount ?? fallback.updatedCount) ?? 0,
    errorCount: safeNumber(raw.errorCount ?? fallback.errorCount) ?? 0,
    triggeredBy: String(raw.triggeredBy || fallback.triggeredBy || "system").trim() || "system",
    message: String(raw.message || fallback.message || "").trim(),
    startedAt: String(raw.startedAt || fallback.startedAt || now).trim() || now,
    finishedAt: String(raw.finishedAt || fallback.finishedAt || now).trim() || now,
    createdAt: String(raw.createdAt || fallback.createdAt || now).trim() || now,
    updatedAt: String(raw.updatedAt || fallback.updatedAt || now).trim() || now,
  };
}

function upsertNewsSource(items = [], item = {}, fallback = {}) {
  const nextItem = normalizeNewsSourceEntry(item, fallback);
  const existingIndex = findNewsItemIndex(items, nextItem.id || nextItem.slug);
  const existingItem = existingIndex >= 0 ? items[existingIndex] : null;
  const now = new Date().toISOString();

  const merged = {
    ...existingItem,
    ...nextItem,
    id: nextItem.id || existingItem?.id || crypto.randomUUID(),
    slug: nextItem.slug || existingItem?.slug || slugifyNewsKey(nextItem.name || existingItem?.name || nextItem.id || ""),
    createdAt: existingItem?.createdAt || nextItem.createdAt || now,
    updatedAt: now,
  };

  if (existingIndex >= 0) {
    items[existingIndex] = merged;
  } else {
    items.push(merged);
  }

  return merged;
}

function upsertNewsCategory(items = [], item = {}, fallback = {}) {
  const nextItem = normalizeNewsCategoryEntry(item, fallback);
  const existingIndex = findNewsItemIndex(items, nextItem.id || nextItem.slug);
  const existingItem = existingIndex >= 0 ? items[existingIndex] : null;
  const now = new Date().toISOString();

  const merged = {
    ...existingItem,
    ...nextItem,
    id: nextItem.id || existingItem?.id || crypto.randomUUID(),
    slug: nextItem.slug || existingItem?.slug || slugifyNewsKey(nextItem.name || existingItem?.name || nextItem.id || ""),
    createdAt: existingItem?.createdAt || nextItem.createdAt || now,
    updatedAt: now,
  };

  if (existingIndex >= 0) {
    items[existingIndex] = merged;
  } else {
    items.push(merged);
  }

  return merged;
}

async function loadNewsState() {
  const [items, sources, categories, runs] = await Promise.all([
    readCollection("newsItems"),
    readCollection("newsSources"),
    readCollection("newsCategories"),
    readCollection("newsRuns"),
  ]);

  return {
    items: Array.isArray(items) ? items.map((item) => applyNewsItemDefaults(item, item)) : [],
    sources: Array.isArray(sources) ? sources.map((entry) => normalizeNewsSourceEntry(entry, entry)) : [],
    categories: Array.isArray(categories) ? categories.map((entry) => normalizeNewsCategoryEntry(entry, entry)) : [],
    runs: Array.isArray(runs) ? runs.map((entry) => normalizeNewsRunEntry(entry, entry)) : [],
  };
}

function buildNewsAdminResponse(state, { limit = 200, status = "all" } = {}) {
  const normalizedStatus = String(status || "all").trim().toLowerCase() || "all";
  const filteredItems = sortNewsItemsDesc(state.items).filter((item) => (
    normalizedStatus === "all" ? true : normalizeNewsStatus(item.status) === normalizedStatus
  ));

  return {
    ok: true,
    total: filteredItems.length,
    items: filteredItems.slice(0, Math.max(1, limit || 200)),
    sources: state.sources,
    categories: state.categories,
    runs: sortNewsItemsDesc(state.runs).slice(0, Math.max(1, limit || 200)),
  };
}

async function replacePublishedNewsFeed(items = []) {
  const publishedById = new Map();
  for (const item of items) {
    const normalized = applyNewsItemDefaults(item, item);
    if (normalizeNewsStatus(normalized.status) !== "published") continue;
    const identity = getNewsItemIdentity(normalized) || normalized.id || normalized.storyKey;
    if (identity) {
      publishedById.set(identity.toLowerCase(), normalized);
    }
  }

  let nextItems = [];
  await updateCollection("newsItems", async (currentItems) => {
    const sourceItems = Array.isArray(currentItems) ? [...currentItems] : [];
    const publishedMap = new Map(publishedById);

    sourceItems.forEach((item) => {
      const normalized = applyNewsItemDefaults(item, item);
      const identity = (getNewsItemIdentity(normalized) || normalized.id || normalized.storyKey || "").trim().toLowerCase();
      if (!identity || !publishedMap.has(identity)) {
        return;
      }
      publishedMap.set(identity, applyNewsItemDefaults(publishedMap.get(identity), normalized));
    });

    for (const [identity, item] of publishedMap.entries()) {
      const normalized = applyNewsItemDefaults(item, item);
      const index = sourceItems.findIndex((entry) => {
        const entryIdentity = (getNewsItemIdentity(entry) || entry.id || entry.storyKey || "").trim().toLowerCase();
        return entryIdentity === identity;
      });
      if (index >= 0) {
        sourceItems[index] = upsertNewsItem(sourceItems, normalized, sourceItems[index]);
      } else {
        upsertNewsItem(sourceItems, normalized, normalized);
      }
    }

    nextItems = sortNewsItemsDesc(sourceItems);
    return nextItems;
  });

  return buildPublicNewsFeed(nextItems);
}

async function updateNewsItemStatus(req, res, status) {
  const safeId = String(req.params.newsId || "").trim();
  if (!safeId) {
    res.status(400).json({ error: "newsId is required" });
    return;
  }

  const payload = req.body && typeof req.body === "object" ? req.body : {};
  const state = await loadNewsState();
  const item = state.items.find((entry) => {
    const identity = getNewsItemIdentity(entry);
    const slug = String(entry.storyKey || entry.slug || "").trim();
    const requested = safeId.toLowerCase();
    return identity === safeId || slug === safeId || identity.toLowerCase() === requested || slug.toLowerCase() === requested;
  });

  if (!item) {
    res.status(404).json({ error: "News item not found" });
    return;
  }

  const updatedItem = upsertNewsItem(
    state.items,
    {
      ...item,
      ...payload,
      id: item.id,
      storyKey: item.storyKey || item.id,
      status,
      publishedAt: status === "published" ? item.publishedAt || new Date().toISOString() : item.publishedAt || "",
    },
    item,
  );

  await writeCollection("newsItems", sortNewsItemsDesc(state.items));
  res.json({ ok: true, item: updatedItem });
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
    origin: config.corsOrigins.includes("*") ? true : config.corsOrigins,
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
  "/api/questions/meta",
  asyncHandler(async (_req, res) => {
    const meta = await getCollectionMeta("questions");
    res.json(meta);
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

app.get(
  "/api/admin/news",
  asyncHandler(async (req, res) => {
    if (!requireAdminNewsAccess(req, res)) {
      return;
    }

    const state = await loadNewsState();
    const limit = safeNumber(req.query.limit) || 200;
    const status = String(req.query.status || "all").trim().toLowerCase() || "all";

    res.json(buildNewsAdminResponse(state, { limit, status }));
  }),
);

app.get(
  "/api/admin/news/:newsId",
  asyncHandler(async (req, res, next) => {
    if (!requireAdminNewsAccess(req, res)) {
      return;
    }

    const safeId = String(req.params.newsId || "").trim();
    const reserved = new Set(["feed", "collect", "sources", "categories"]);
    if (reserved.has(safeId.toLowerCase())) {
      next();
      return;
    }
    if (!safeId) {
      res.status(400).json({ error: "newsId is required" });
      return;
    }

    const state = await loadNewsState();
    const item = sortNewsItemsDesc(state.items).find((entry) => {
      const identity = getNewsItemIdentity(entry);
      const slug = String(entry.storyKey || entry.slug || "").trim();
      const requested = safeId.toLowerCase();
      return identity === safeId || slug === safeId || identity.toLowerCase() === requested || slug.toLowerCase() === requested;
    }) || null;

    if (!item) {
      res.status(404).json({ error: "News item not found" });
      return;
    }

    res.json({ ok: true, item });
  }),
);

app.post(
  "/api/admin/news",
  asyncHandler(async (req, res) => {
    if (!requireAdminNewsAccess(req, res)) {
      return;
    }

    const payload = req.body && typeof req.body === "object" ? req.body : {};
    const title = String(payload.title || payload.headline || "").trim();
    const content = String(payload.content || payload.body || "").trim();
    if (!title) {
      res.status(400).json({ error: "title is required" });
      return;
    }
    if (!content) {
      res.status(400).json({ error: "content is required" });
      return;
    }

    const state = await loadNewsState();
    const nextItem = upsertNewsItem(state.items, {
      ...payload,
      title,
      content,
      status: payload.status || "pending_review",
      storyKey: payload.storyKey || payload.slug || slugifyNewsKey(title),
    });

    await writeCollection("newsItems", sortNewsItemsDesc(state.items));
    res.status(201).json({ ok: true, item: nextItem });
  }),
);

app.patch(
  "/api/admin/news/:newsId",
  asyncHandler(async (req, res) => {
    if (!requireAdminNewsAccess(req, res)) {
      return;
    }

    const safeId = String(req.params.newsId || "").trim();
    if (!safeId) {
      res.status(400).json({ error: "newsId is required" });
      return;
    }

    const state = await loadNewsState();
    const item = state.items.find((entry) => {
      const identity = getNewsItemIdentity(entry);
      const slug = String(entry.storyKey || entry.slug || "").trim();
      const requested = safeId.toLowerCase();
      return identity === safeId || slug === safeId || identity.toLowerCase() === requested || slug.toLowerCase() === requested;
    });

    if (!item) {
      res.status(404).json({ error: "News item not found" });
      return;
    }

    const updatedItem = upsertNewsItem(state.items, {
      ...item,
      ...(req.body && typeof req.body === "object" ? req.body : {}),
      id: item.id,
      storyKey: item.storyKey || item.id,
    }, item);

    await writeCollection("newsItems", sortNewsItemsDesc(state.items));
    res.json({ ok: true, item: updatedItem });
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

app.post(
  "/api/admin/news/:newsId/approve",
  asyncHandler(async (req, res) => {
    if (!requireAdminNewsAccess(req, res)) {
      return;
    }
    await updateNewsItemStatus(req, res, "approved");
  }),
);

app.post(
  "/api/admin/news/:newsId/publish",
  asyncHandler(async (req, res) => {
    if (!requireAdminNewsAccess(req, res)) {
      return;
    }
    await updateNewsItemStatus(req, res, "published");
  }),
);

app.post(
  "/api/admin/news/:newsId/reject",
  asyncHandler(async (req, res) => {
    if (!requireAdminNewsAccess(req, res)) {
      return;
    }
    await updateNewsItemStatus(req, res, "rejected");
  }),
);

app.post(
  "/api/admin/news/feed",
  asyncHandler(async (req, res) => {
    if (!requireAdminNewsAccess(req, res)) {
      return;
    }

    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    const feed = await replacePublishedNewsFeed(items);
    res.json(feed);
  }),
);

app.post(
  "/api/admin/news/collect",
  asyncHandler(async (req, res) => {
    if (!requireAdminNewsAccess(req, res)) {
      return;
    }

    const now = new Date().toISOString();
    const state = await loadNewsState();
    const run = normalizeNewsRunEntry({
      status: "success",
      sourceCount: state.sources.length,
      addedCount: 0,
      updatedCount: 0,
      errorCount: 0,
      triggeredBy: "admin",
      message: "News collection is driven by the admin-published feed.",
      startedAt: now,
      finishedAt: now,
    });

    state.runs.unshift(run);
    await writeCollection("newsRuns", state.runs.slice(0, 50));
    res.json({ ok: true, run, items: state.items });
  }),
);

app.get(
  "/api/admin/news/sources",
  asyncHandler(async (req, res) => {
    if (!requireAdminNewsAccess(req, res)) {
      return;
    }

    const state = await loadNewsState();
    res.json({ ok: true, sources: state.sources });
  }),
);

app.post(
  "/api/admin/news/sources",
  asyncHandler(async (req, res) => {
    if (!requireAdminNewsAccess(req, res)) {
      return;
    }

    const payload = req.body && typeof req.body === "object" ? req.body : {};
    const name = String(payload.name || "").trim();
    const url = String(payload.url || "").trim();
    if (!name) {
      res.status(400).json({ error: "name is required" });
      return;
    }
    if (!url) {
      res.status(400).json({ error: "url is required" });
      return;
    }

    const state = await loadNewsState();
    const nextItem = upsertNewsSource(state.sources, {
      ...payload,
      name,
      url,
      id: payload.id || slugifyNewsKey(name),
    });

    await writeCollection("newsSources", sortNewsItemsDesc(state.sources));
    res.status(201).json({ ok: true, source: nextItem });
  }),
);

app.patch(
  "/api/admin/news/sources/:sourceId",
  asyncHandler(async (req, res) => {
    if (!requireAdminNewsAccess(req, res)) {
      return;
    }

    const safeId = String(req.params.sourceId || "").trim();
    if (!safeId) {
      res.status(400).json({ error: "sourceId is required" });
      return;
    }

    const state = await loadNewsState();
    const source = state.sources.find((entry) => {
      const identity = getNewsItemIdentity(entry);
      const slug = String(entry.slug || "").trim();
      const requested = safeId.toLowerCase();
      return identity === safeId || slug === safeId || identity.toLowerCase() === requested || slug.toLowerCase() === requested;
    });

    if (!source) {
      res.status(404).json({ error: "Source not found" });
      return;
    }

    const updatedSource = upsertNewsSource(state.sources, {
      ...source,
      ...(req.body && typeof req.body === "object" ? req.body : {}),
      id: source.id,
      slug: source.slug || source.id,
    }, source);

    await writeCollection("newsSources", sortNewsItemsDesc(state.sources));
    res.json({ ok: true, source: updatedSource });
  }),
);

app.delete(
  "/api/admin/news/sources/:sourceId",
  asyncHandler(async (req, res) => {
    if (!requireAdminNewsAccess(req, res)) {
      return;
    }

    const safeId = String(req.params.sourceId || "").trim();
    if (!safeId) {
      res.status(400).json({ error: "sourceId is required" });
      return;
    }

    const state = await loadNewsState();
    const source = state.sources.find((entry) => {
      const identity = getNewsItemIdentity(entry);
      const slug = String(entry.slug || "").trim();
      const requested = safeId.toLowerCase();
      return identity === safeId || slug === safeId || identity.toLowerCase() === requested || slug.toLowerCase() === requested;
    });

    if (!source) {
      res.status(404).json({ error: "Source not found" });
      return;
    }

    state.sources = state.sources.filter((entry) => {
      const identity = getNewsItemIdentity(entry);
      const slug = String(entry.slug || "").trim();
      const requested = safeId.toLowerCase();
      return !(identity === safeId || slug === safeId || identity.toLowerCase() === requested || slug.toLowerCase() === requested);
    });

    state.items = state.items.map((item) => {
      if (String(item.sourceId || "").trim() === safeId || String(item.sourceName || "").trim().toLowerCase() === String(source.name || "").trim().toLowerCase()) {
        return {
          ...item,
          sourceId: "",
          sourceName: "",
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });

    await writeCollection("newsItems", sortNewsItemsDesc(state.items));
    await writeCollection("newsSources", sortNewsItemsDesc(state.sources));
    res.json({ ok: true, message: "Source removed" });
  }),
);

app.get(
  "/api/admin/news/categories",
  asyncHandler(async (req, res) => {
    if (!requireAdminNewsAccess(req, res)) {
      return;
    }

    const state = await loadNewsState();
    res.json({ ok: true, categories: state.categories });
  }),
);

app.post(
  "/api/admin/news/categories",
  asyncHandler(async (req, res) => {
    if (!requireAdminNewsAccess(req, res)) {
      return;
    }

    const payload = req.body && typeof req.body === "object" ? req.body : {};
    const name = String(payload.name || "").trim();
    if (!name) {
      res.status(400).json({ error: "name is required" });
      return;
    }

    const state = await loadNewsState();
    const nextItem = upsertNewsCategory(state.categories, {
      ...payload,
      name,
      id: payload.id || slugifyNewsKey(name),
    });

    await writeCollection("newsCategories", sortNewsItemsDesc(state.categories));
    res.status(201).json({ ok: true, category: nextItem });
  }),
);

app.patch(
  "/api/admin/news/categories/:categoryId",
  asyncHandler(async (req, res) => {
    if (!requireAdminNewsAccess(req, res)) {
      return;
    }

    const safeId = String(req.params.categoryId || "").trim();
    if (!safeId) {
      res.status(400).json({ error: "categoryId is required" });
      return;
    }

    const state = await loadNewsState();
    const category = state.categories.find((entry) => {
      const identity = getNewsItemIdentity(entry);
      const slug = String(entry.slug || "").trim();
      const requested = safeId.toLowerCase();
      return identity === safeId || slug === safeId || identity.toLowerCase() === requested || slug.toLowerCase() === requested;
    });

    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    const updatedCategory = upsertNewsCategory(state.categories, {
      ...category,
      ...(req.body && typeof req.body === "object" ? req.body : {}),
      id: category.id,
      slug: category.slug || category.id,
    }, category);

    await writeCollection("newsCategories", sortNewsItemsDesc(state.categories));
    res.json({ ok: true, category: updatedCategory });
  }),
);

app.delete(
  "/api/admin/news/categories/:categoryId",
  asyncHandler(async (req, res) => {
    if (!requireAdminNewsAccess(req, res)) {
      return;
    }

    const safeId = String(req.params.categoryId || "").trim();
    if (!safeId) {
      res.status(400).json({ error: "categoryId is required" });
      return;
    }

    const state = await loadNewsState();
    const category = state.categories.find((entry) => {
      const identity = getNewsItemIdentity(entry);
      const slug = String(entry.slug || "").trim();
      const requested = safeId.toLowerCase();
      return identity === safeId || slug === safeId || identity.toLowerCase() === requested || slug.toLowerCase() === requested;
    });

    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    state.categories = state.categories.filter((entry) => {
      const identity = getNewsItemIdentity(entry);
      const slug = String(entry.slug || "").trim();
      const requested = safeId.toLowerCase();
      return !(identity === safeId || slug === safeId || identity.toLowerCase() === requested || slug.toLowerCase() === requested);
    });

    state.items = state.items.map((item) => {
      if (String(item.category || "").trim().toLowerCase() === String(category.slug || category.id || "").trim().toLowerCase()) {
        return {
          ...item,
          category: "clinical-news",
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });

    await writeCollection("newsItems", sortNewsItemsDesc(state.items));
    await writeCollection("newsCategories", sortNewsItemsDesc(state.categories));
    res.json({ ok: true, message: "Category removed" });
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
    const comboVariant = String(req.body?.comboVariant || "").trim().toLowerCase();
    const allowedComboVariants = new Set([
      "pair-relationship",
      "assertion-5",
      "table-4",
      "three-statement",
    ]);
    const getComboOptionTexts = (variant = "") => {
      const normalized = String(variant || "").trim().toLowerCase();
      if (normalized === "assertion-5") {
        return [
          "First statement is TRUE, Second statement is TRUE and they are RELATED",
          "First statement is TRUE, Second statement is TRUE but they are NOT related",
          "First statement is TRUE but Second statement is FALSE",
          "First statement is FALSE but Second statement is TRUE",
          "Both statements are FALSE",
        ];
      }
      if (normalized === "table-4") {
        return ["I, II and III", "II and III only", "I only", "III only"];
      }
      if (normalized === "pair-relationship") {
        return [
          "first statement is true, second statement is true and the two are related",
          "first statement is true, second statement is true but the two are not related",
          "first statement is false, second statement is true",
          "both statements are false",
        ];
      }
      if (normalized === "three-statement") {
        return ["1, 2 and 3", "1 and 2 only", "2 and 3 only", "1 only", "3 only"];
      }
      return [];
    };
    const normalizedOptions = Array.isArray(options)
      ? options.map((option) => String(option || "").trim()).filter(Boolean)
      : [];
    const resolvedOptions =
      normalizedOptions.length > 0
        ? normalizedOptions
        : comboVariant
          ? getComboOptionTexts(comboVariant)
          : [];

    if (
      !text ||
      !category ||
      resolvedOptions.length < 2 ||
      correct === undefined
    ) {
      res.status(400).json({
        error:
          "Required fields: text, category, options (array), correct (option index)",
      });
      return;
    }
    if (comboVariant && !allowedComboVariants.has(comboVariant)) {
      res.status(400).json({
        error: "comboVariant must be pair-relationship, assertion-5, table-4 or three-statement",
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
      comboVariant: comboVariant || undefined,
      options: resolvedOptions,
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
    const comboVariant = String(req.body?.comboVariant || "").trim().toLowerCase();
    const allowedComboVariants = new Set([
      "pair-relationship",
      "assertion-5",
      "table-4",
      "three-statement",
    ]);
    const getComboOptionTexts = (variant = "") => {
      const normalized = String(variant || "").trim().toLowerCase();
      if (normalized === "assertion-5") {
        return [
          "First statement is TRUE, Second statement is TRUE and they are RELATED",
          "First statement is TRUE, Second statement is TRUE but they are NOT related",
          "First statement is TRUE but Second statement is FALSE",
          "First statement is FALSE but Second statement is TRUE",
          "Both statements are FALSE",
        ];
      }
      if (normalized === "table-4") {
        return ["I, II and III", "II and III only", "I only", "III only"];
      }
      if (normalized === "pair-relationship") {
        return [
          "first statement is true, second statement is true and the two are related",
          "first statement is true, second statement is true but the two are not related",
          "first statement is false, second statement is true",
          "both statements are false",
        ];
      }
      if (normalized === "three-statement") {
        return ["1, 2 and 3", "1 and 2 only", "2 and 3 only", "1 only", "3 only"];
      }
      return [];
    };
    const normalizedOptions = Array.isArray(options)
      ? options.map((option) => String(option || "").trim()).filter(Boolean)
      : [];

    const questions = await readCollection("questions");
    const idx = questions.findIndex((q) => String(q.id) === questionId);

    if (idx === -1) {
      res.status(404).json({ error: "Question not found" });
      return;
    }
    if (comboVariant && !allowedComboVariants.has(comboVariant)) {
      res.status(400).json({
        error: "comboVariant must be pair-relationship, assertion-5, table-4 or three-statement",
      });
      return;
    }

    if (text) questions[idx].text = text;
    if (category) questions[idx].category = category;
    if (comboVariant) {
      questions[idx].comboVariant = comboVariant || undefined;
    }
    if (normalizedOptions.length > 0) {
      questions[idx].options = normalizedOptions;
    } else if (comboVariant) {
      questions[idx].options = getComboOptionTexts(comboVariant);
    }
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

app.get(
  "/api/news/feed",
  asyncHandler(async (req, res) => {
    const state = await loadNewsState();
    const limit = safeNumber(req.query.limit) || 50;
    const feed = buildPublicNewsFeed(state.items);

    res.json({
      ...feed,
      items: feed.items.slice(0, limit),
      sections: {
        hero: feed.sections.hero.slice(0, Math.min(limit, feed.sections.hero.length)),
        latest: feed.sections.latest.slice(0, Math.min(limit, feed.sections.latest.length)),
        medicine: feed.sections.medicine.slice(0, Math.min(limit, feed.sections.medicine.length)),
        trendingNow: feed.sections.trendingNow.slice(0, Math.min(limit, feed.sections.trendingNow.length)),
      },
    });
  }),
);

app.post(
  "/api/news/feed",
  asyncHandler(async (req, res) => {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    const feed = await replacePublishedNewsFeed(items);
    res.json(feed);
  }),
);

app.get(
  "/api/news/:newsId",
  asyncHandler(async (req, res) => {
    const safeId = String(req.params.newsId || "").trim();
    if (!safeId) {
      res.status(400).json({ error: "newsId is required" });
      return;
    }

    const state = await loadNewsState();
    const item = sortNewsItemsDesc(state.items).find((entry) => {
      if (normalizeNewsStatus(entry.status) !== "published") {
        return false;
      }
      const identity = getNewsItemIdentity(entry);
      const slug = String(entry.storyKey || entry.slug || "").trim();
      const title = String(entry.title || "").trim();
      const requested = safeId.toLowerCase();
      return (
        identity === safeId ||
        slug === safeId ||
        title === safeId ||
        identity.toLowerCase() === requested ||
        slug.toLowerCase() === requested ||
        title.toLowerCase() === requested
      );
    }) || null;

    if (!item) {
      res.status(404).json({ error: "News item not found" });
      return;
    }

    res.json({ ok: true, item });
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
