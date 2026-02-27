import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import compression from "compression";
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
import {
  ensureQuestionsSeeded,
  normalizeStoredQuestionCategories,
} from "./services/questions.js";
import { generateAiExplanation } from "./services/ai.js";
import {
  ensureStore,
  readCollection,
  updateCollection,
  writeCollection,
} from "./store.js";
import {
  MAJOR_CATEGORIES,
  normalizeMajorCategory,
} from "./categoryTaxonomy.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, "..", "..");
const logPath = path.join(__dirname, "..", config.logDir);
fs.mkdirSync(logPath, { recursive: true });
const accessLogStream = fs.createWriteStream(path.join(logPath, "access.log"), {
  flags: "a",
});
const errorLogStream = fs.createWriteStream(path.join(logPath, "error.log"), {
  flags: "a",
});
const adminAccessLogStream = fs.createWriteStream(
  path.join(logPath, "admin-access.log"),
  { flags: "a" },
);

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function safeNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const USERNAME_REGEX = /^[a-z0-9][a-z0-9_.-]{2,29}$/;
const PHONE_CONTACT_REGEX = /^\+?[0-9][0-9()\-\s]{5,19}$/;
const USER_ROLE_VALUES = new Set(["student", "worker"]);
const SUBSCRIPTION_TIER_VALUES = new Set(["free", "premium"]);
const PROFESSIONAL_TYPE_VALUES = new Set([
  "Doctor of Pharmacy",
  "Pharmacy Technician",
  "MCA",
  "Other",
]);
const RESET_CODE_TTL_MINUTES = 15;
const DEACTIVATE_MAX_DAYS = 30;
const DELETE_ACCOUNT_CONFIRM_TOKEN = "DELETE_MY_ACCOUNT_CONFIRMED";

function isValidEmail(value) {
  return EMAIL_REGEX.test(String(value || "").trim());
}

function normalizeWhitespace(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function normalizeUsername(value) {
  return normalizeWhitespace(value).toLowerCase();
}

function isValidUsername(value) {
  return USERNAME_REGEX.test(String(value || ""));
}

function normalizePhoneComparable(value) {
  return String(value || "").replace(/\D/g, "");
}

function normalizeContactValue(value) {
  const next = normalizeWhitespace(value);
  if (!next) return "";

  if (isValidEmail(next)) {
    return next.toLowerCase();
  }

  if (!PHONE_CONTACT_REGEX.test(next)) {
    return null;
  }

  const digits = normalizePhoneComparable(next);
  if (!digits || digits.length < 6) {
    return null;
  }
  const hasPlus = next.startsWith("+");
  return `${hasPlus ? "+" : ""}${digits}`;
}

function detectContactType(contact) {
  return isValidEmail(contact) ? "email" : "phone";
}

function splitLegacyName(rawName) {
  const clean = normalizeWhitespace(rawName);
  if (!clean) {
    return { firstName: "", lastName: "" };
  }
  const parts = clean.split(" ").filter(Boolean);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function buildDisplayName(title, firstName, lastName, fallback = "User") {
  const merged = [title, firstName, lastName]
    .map((part) => normalizeWhitespace(part))
    .filter(Boolean)
    .join(" ");
  if (merged) return merged;
  return normalizeWhitespace(fallback) || "User";
}

function normalizeSubscriptionTierValue(value) {
  const tier = String(value || "").trim().toLowerCase();
  return SUBSCRIPTION_TIER_VALUES.has(tier) ? tier : null;
}

function normalizeExistingUser(rawUser = {}) {
  const legacy = splitLegacyName(rawUser.name);
  const title = normalizeWhitespace(rawUser.title);
  const firstName = normalizeWhitespace(rawUser.firstName || legacy.firstName);
  const lastName = normalizeWhitespace(
    rawUser.lastName || rawUser.surname || legacy.lastName,
  );
  const seededUsername = normalizeUsername(
    rawUser.username ||
      String(rawUser.email || "").split("@")[0] ||
      `${firstName}.${lastName}`,
  )
    .replace(/[^a-z0-9_.-]/g, "")
    .replace(/^\.+/, "");
  const safeUsername = isValidUsername(seededUsername)
    ? seededUsername
    : `user-${String(rawUser.id || crypto.randomUUID()).slice(0, 8).toLowerCase()}`;
  const normalizedContact = normalizeContactValue(rawUser.contact || rawUser.email);
  const email = isValidEmail(rawUser.email)
    ? normalizeContactValue(rawUser.email)
    : isValidEmail(normalizedContact)
      ? normalizedContact
      : "";
  const contact = normalizedContact || email || "";
  const role = USER_ROLE_VALUES.has(String(rawUser.role || "").toLowerCase())
    ? String(rawUser.role).toLowerCase()
    : "student";
  const subscriptionTier =
    normalizeSubscriptionTierValue(rawUser.subscriptionTier) || "free";
  const professionalType = PROFESSIONAL_TYPE_VALUES.has(rawUser.professionalType)
    ? rawUser.professionalType
    : "Other";
  const createdAt = String(rawUser.createdAt || new Date().toISOString());
  const updatedAt = String(rawUser.updatedAt || createdAt);
  const deactivatedUntil = rawUser.deactivatedUntil
    ? String(rawUser.deactivatedUntil)
    : null;
  const deactivatedAt = rawUser.deactivatedAt ? String(rawUser.deactivatedAt) : null;

  return {
    ...rawUser,
    title,
    firstName,
    lastName,
    surname: lastName,
    name: buildDisplayName(title, firstName, lastName, rawUser.name || safeUsername),
    username: safeUsername,
    contact,
    contactType: contact ? detectContactType(contact) : "",
    email: email || "",
    role,
    subscriptionTier,
    professionalType,
    country: normalizeWhitespace(rawUser.country),
    institution: normalizeWhitespace(rawUser.institution),
    profileImage:
      typeof rawUser.profileImage === "string"
        ? rawUser.profileImage.trim()
        : "",
    createdAt,
    updatedAt,
    deactivatedAt,
    deactivatedUntil,
    resetCodeHash: rawUser.resetCodeHash || null,
    resetCodeExpiresAt: rawUser.resetCodeExpiresAt || null,
  };
}

function toPublicUser(user) {
  const normalized = normalizeExistingUser(user);
  return {
    id: normalized.id,
    title: normalized.title,
    firstName: normalized.firstName,
    lastName: normalized.lastName,
    surname: normalized.lastName,
    name: normalized.name,
    username: normalized.username,
    contact: normalized.contact,
    contactType: normalized.contactType,
    email: normalized.email,
    role: normalized.role,
    subscriptionTier: normalized.subscriptionTier,
    professionalType: normalized.professionalType,
    country: normalized.country,
    institution: normalized.institution,
    profileImage: normalized.profileImage,
    createdAt: normalized.createdAt,
    updatedAt: normalized.updatedAt,
    deactivatedAt: normalized.deactivatedAt,
    deactivatedUntil: normalized.deactivatedUntil,
  };
}

function normalizeIdentifier(value) {
  return normalizeWhitespace(value).toLowerCase();
}

function findUserByIdentifier(users, identifierRaw) {
  const identifier = normalizeIdentifier(identifierRaw);
  if (!identifier) return null;
  const identifierDigits = normalizePhoneComparable(identifier);

  return users.find((rawUser) => {
    const user = normalizeExistingUser(rawUser);
    if (normalizeIdentifier(user.username) === identifier) return true;
    if (normalizeIdentifier(user.contact) === identifier) return true;
    if (normalizeIdentifier(user.email) === identifier) return true;

    const userPhoneDigits = normalizePhoneComparable(user.contact);
    if (identifierDigits && userPhoneDigits && identifierDigits === userPhoneDigits) {
      return true;
    }

    return false;
  });
}

function isUserCurrentlyDeactivated(user) {
  const untilMs = Date.parse(String(user?.deactivatedUntil || ""));
  return Number.isFinite(untilMs) && untilMs > Date.now();
}

function hashResetCode(code) {
  return crypto.createHash("sha256").update(String(code)).digest("hex");
}

function createResetCode() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, "0");
}

function normalizeRoleValue(value) {
  const role = String(value || "").trim().toLowerCase();
  return USER_ROLE_VALUES.has(role) ? role : null;
}

function resolveSubscriptionTier(user) {
  const normalized = normalizeSubscriptionTierValue(user?.subscriptionTier);
  if (normalized) return normalized;
  if (user?.id && config.aiPremiumUserIds.includes(String(user.id))) {
    return "premium";
  }
  return "free";
}

function normalizeProfessionalTypeValue(value) {
  const clean = normalizeWhitespace(value);
  return PROFESSIONAL_TYPE_VALUES.has(clean) ? clean : null;
}

function getAiCapsForTier(tier) {
  const isPremium = tier === "premium";
  return {
    dailyRequests: isPremium
      ? config.aiPremiumDailyRequests
      : config.aiFreeDailyRequests,
    inputCharLimit: isPremium
      ? config.aiPremiumInputCharLimit
      : config.aiFreeInputCharLimit,
    maxOutputTokens: isPremium
      ? config.aiPremiumMaxOutputTokens
      : config.aiFreeMaxOutputTokens,
  };
}

function resolveAiProviderConfig(tier) {
  const provider =
    tier === "premium" ? config.aiPremiumProvider : config.aiFreeProvider;
  if (provider === "openai") {
    return {
      provider,
      apiKey: config.openAiApiKey,
      model: config.openAiModelPremium,
    };
  }
  if (provider === "openrouter") {
    return {
      provider,
      apiKey: config.openRouterApiKey,
      model: config.openRouterModelFree,
    };
  }
  return {
    provider: "gemini",
    apiKey: config.geminiApiKey,
    model: config.geminiModelFree,
  };
}

function aiUsageDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function trimAiInput(value, maxLength = 4000) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

async function reserveAiQuota({ actorId, tier, inputChars }) {
  const today = aiUsageDateKey();
  const { dailyRequests } = getAiCapsForTier(tier);
  let blocked = false;
  let remaining = 0;
  let used = 0;

  await updateCollection("aiUsage", async (rows) => {
    const usageRows = Array.isArray(rows) ? rows : [];
    let row = usageRows.find(
      (entry) => entry.actorId === actorId && entry.date === today,
    );
    if (!row) {
      row = {
        actorId,
        date: today,
        tier,
        requests: 0,
        inputChars: 0,
        outputChars: 0,
        lastRequestAt: null,
        lastResponseAt: null,
        provider: "",
        model: "",
      };
      usageRows.push(row);
    }

    row.tier = tier;
    if (row.requests >= dailyRequests) {
      blocked = true;
      used = row.requests;
      remaining = 0;
      return usageRows;
    }

    row.requests += 1;
    row.inputChars += Math.max(0, Number(inputChars) || 0);
    row.lastRequestAt = new Date().toISOString();
    used = row.requests;
    remaining = Math.max(0, dailyRequests - row.requests);
    return usageRows;
  });

  return {
    blocked,
    usageDate: today,
    used,
    remaining,
    limit: dailyRequests,
  };
}

async function recordAiResponse({
  actorId,
  usageDate,
  outputChars,
  provider,
  model,
}) {
  await updateCollection("aiUsage", async (rows) => {
    const usageRows = Array.isArray(rows) ? rows : [];
    const row = usageRows.find(
      (entry) => entry.actorId === actorId && entry.date === usageDate,
    );
    if (!row) return usageRows;
    row.outputChars += Math.max(0, Number(outputChars) || 0);
    row.lastResponseAt = new Date().toISOString();
    row.provider = String(provider || row.provider || "");
    row.model = String(model || row.model || "");
    return usageRows;
  });
}

function validateProfileImageValue(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const isDataImage = /^data:image\/[a-z0-9.+-]+;base64,/i.test(raw);
  const isHttpImage = /^https?:\/\/[^\s]+$/i.test(raw);
  if (!isDataImage && !isHttpImage) return null;
  if (raw.length > 3000000) return null;
  return raw;
}

async function purgeExpiredDeactivatedUsers() {
  const now = Date.now();
  let removed = 0;

  await updateCollection("users", async (users) => {
    const next = users
      .map(normalizeExistingUser)
      .filter((user) => {
        const untilMs = Date.parse(String(user.deactivatedUntil || ""));
        if (!Number.isFinite(untilMs)) return true;
        if (untilMs > now) return true;
        removed += 1;
        return false;
      });
    return next;
  });

  return removed;
}

async function normalizeStoredUsers() {
  let changed = 0;
  let total = 0;

  await updateCollection("users", async (users) => {
    total = users.length;
    const next = users.map((user) => {
      const normalized = normalizeExistingUser(user);
      if (JSON.stringify(normalized) !== JSON.stringify(user)) {
        changed += 1;
      }
      return normalized;
    });
    return next;
  });

  return { changed, total };
}

function normalizeSlugValue(value) {
  const next = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/\s+/g, "-");
  if (!next) return "";
  if (!SLUG_REGEX.test(next)) return null;
  return next;
}

function normalizeQuestionForApi(rawQuestion) {
  const text = String(rawQuestion?.text ?? rawQuestion?.question ?? "").trim();
  const topicSlug = normalizeSlugValue(rawQuestion?.topicSlug);
  const sectionId = normalizeSlugValue(rawQuestion?.sectionId);
  const normalizedCategory = normalizeMajorCategory(
    rawQuestion?.category,
    `${text} ${String(rawQuestion?.explanation || "")}`,
  );

  return {
    ...rawQuestion,
    id: Number(rawQuestion?.id),
    text,
    question: text,
    category: normalizedCategory,
    options: Array.isArray(rawQuestion?.options) ? rawQuestion.options : [],
    correct: rawQuestion?.correct,
    explanation: String(rawQuestion?.explanation || ""),
    topicSlug: topicSlug || undefined,
    sectionId: sectionId || undefined,
  };
}

function extractQuestionOrderValue(question) {
  const text = String(question?.text || question?.question || "").trim();
  const match = text.match(/\bQ\s*\.?\s*(\d+)\b/i);
  if (match) return Number(match[1]);
  return Number(question?.id) || Number.MAX_SAFE_INTEGER;
}

function resolveCorrectAnswerValue(rawCorrect, options) {
  if (!Array.isArray(options) || options.length === 0) {
    return null;
  }

  const asNumber = Number(rawCorrect);
  if (Number.isInteger(asNumber) && asNumber >= 0 && asNumber < options.length) {
    return String(options[asNumber]);
  }

  const asString = String(rawCorrect || "").trim();
  if (!asString) return null;
  if (options.includes(asString)) return asString;
  return null;
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

      const mappedCategory = normalizeMajorCategory(
        question.category,
        `${String(question.question || question.text || "")} ${String(question.explanation || "")}`,
      );

      const stat = questionStats.get(id) || {
        attempts: 0,
        correct: 0,
        category: mappedCategory,
      };
      stat.attempts += 1;
      if (isCorrect) stat.correct += 1;
      questionStats.set(id, stat);

      const category = mappedCategory;
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
    const category = normalizeMajorCategory(event.category, "");

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

function createCorsOptions() {
  if (config.corsOrigins.includes("*")) {
    return { origin: true };
  }

  const allowed = new Set(config.corsOrigins);
  return {
    origin(origin, callback) {
      if (!origin || allowed.has(origin)) {
        callback(null, true);
        return;
      }
      // Block disallowed origins without generating noisy error stacks.
      callback(null, false);
    },
  };
}

function createRateLimiter(windowMs, maxRequests) {
  const buckets = new Map();

  return (req, res, next) => {
    if (!req.path.startsWith("/api")) {
      next();
      return;
    }
    if (req.path === "/api/health") {
      next();
      return;
    }

    const now = Date.now();
    const actorKey = getActorId(req);
    const ipKey = req.ip || "unknown";
    const key = `${actorKey}|${ipKey}`;
    const row = buckets.get(key);

    if (!row || now - row.windowStart >= windowMs) {
      buckets.set(key, { count: 1, windowStart: now });
      if (buckets.size > 5000) {
        for (const [bucketKey, bucket] of buckets.entries()) {
          if (now - bucket.windowStart >= windowMs) {
            buckets.delete(bucketKey);
          }
        }
      }
      next();
      return;
    }

    if (row.count >= maxRequests) {
      res.status(429).json({ error: "Too many requests. Please try again." });
      return;
    }

    row.count += 1;
    next();
  };
}

app.disable("x-powered-by");
if (config.trustProxy) {
  app.set("trust proxy", 1);
}
app.use(
  cors(createCorsOptions()),
);
app.use(helmet());
if (config.enableGzip) {
  app.use(compression());
}
app.use(express.json({ limit: "1mb" }));
app.use(createRateLimiter(config.rateLimitWindowMs, config.rateLimitMax));
if (config.logLevel === "debug") {
  app.use(morgan("dev"));
}
if (config.logLevel !== "silent") {
  app.use(morgan("combined", { stream: accessLogStream }));
}

// Never expose backend runtime files over static hosting.
app.use("/backend", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Serve static frontend files.
app.use(
  express.static(frontendPath, {
    dotfiles: "ignore",
  }),
);

// Audit admin endpoint access attempts.
app.use("/api/admin", (req, _res, next) => {
  const row = {
    at: new Date().toISOString(),
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    hasAdminKey: Boolean(req.headers["x-admin-key"]),
  };
  adminAccessLogStream.write(`${JSON.stringify(row)}\n`);
  next();
});

// API routes
app.get("/api/health", (_req, res) => {
  const mem = process.memoryUsage();
  res.json({
    status: "ok",
    service: "pharmacy-quiz-backend",
    uptimeSeconds: Math.round(process.uptime()),
    memory: {
      rssMb: Math.round((mem.rss / (1024 * 1024)) * 10) / 10,
      heapUsedMb: Math.round((mem.heapUsed / (1024 * 1024)) * 10) / 10,
    },
  });
});

app.post(
  "/api/auth/register",
  asyncHandler(async (req, res) => {
    await purgeExpiredDeactivatedUsers();

    const legacyName = normalizeWhitespace(req.body?.name);
    const legacyParts = splitLegacyName(legacyName);
    const title = normalizeWhitespace(req.body?.title || "Mr");
    const firstName = normalizeWhitespace(req.body?.firstName || legacyParts.firstName);
    const lastName = normalizeWhitespace(
      req.body?.lastName || req.body?.surname || legacyParts.lastName,
    );
    const username = normalizeUsername(
      req.body?.username || String(req.body?.email || "").split("@")[0],
    )
      .replace(/[^a-z0-9_.-]/g, "")
      .replace(/^\.+/, "");
    const contact = normalizeContactValue(req.body?.contact || req.body?.email);
    const password = String(req.body?.password || "");
    const role = normalizeRoleValue(req.body?.role) || "student";
    const professionalType =
      normalizeProfessionalTypeValue(req.body?.professionalType) || "Other";
    const country = normalizeWhitespace(req.body?.country || "Not Set");
    const institution = normalizeWhitespace(req.body?.institution || "Not Set");

    if (!firstName || !lastName) {
      res.status(400).json({
        error: "firstName and lastName are required",
      });
      return;
    }
    if (!isValidUsername(username)) {
      res.status(400).json({
        error:
          "username must be 3-30 chars and can include lowercase letters, numbers, ., _, -",
      });
      return;
    }
    if (contact === null) {
      res.status(400).json({
        error: "contact must be a valid email or phone number",
      });
      return;
    }
    if (!contact) {
      res.status(400).json({ error: "contact is required" });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: "password must be at least 6 characters" });
      return;
    }
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const contactDigits = normalizePhoneComparable(contact);
    if (users.some((u) => normalizeIdentifier(u.username) === username)) {
      res.status(409).json({ error: "username already in use" });
      return;
    }
    if (
      users.some(
        (u) =>
          normalizeIdentifier(u.contact) === normalizeIdentifier(contact) ||
          (contactDigits &&
            normalizePhoneComparable(u.contact) &&
            normalizePhoneComparable(u.contact) === contactDigits),
      )
    ) {
      res.status(409).json({ error: "contact already in use" });
      return;
    }

    const createdAt = new Date().toISOString();
    const name = buildDisplayName(title, firstName, lastName, username);
    const user = {
      id: crypto.randomUUID(),
      title,
      firstName,
      lastName,
      surname: lastName,
      name,
      username,
      contact,
      contactType: detectContactType(contact),
      email: isValidEmail(contact) ? contact : "",
      role,
      subscriptionTier: "free",
      professionalType,
      country,
      institution,
      profileImage: "",
      passwordHash: await hashPassword(password),
      createdAt,
      updatedAt: createdAt,
      deactivatedAt: null,
      deactivatedUntil: null,
      resetCodeHash: null,
      resetCodeExpiresAt: null,
    };

    users.push(user);
    await writeCollection("users", users);

    const token = createToken(user);
    res.status(201).json({
      token,
      user: toPublicUser(user),
    });
  }),
);

app.post(
  "/api/auth/login",
  asyncHandler(async (req, res) => {
    await purgeExpiredDeactivatedUsers();

    const identifier = String(
      req.body?.identifier ||
        req.body?.contact ||
        req.body?.email ||
        req.body?.username ||
        "",
    ).trim();
    const password = String(req.body?.password || "");

    if (!identifier || !password) {
      res.status(400).json({
        error: "identifier (username/email/contact) and password are required",
      });
      return;
    }

    const users = (await readCollection("users")).map(normalizeExistingUser);
    const user = findUserByIdentifier(users, identifier);

    if (!user) {
      res.status(401).json({ error: "invalid credentials" });
      return;
    }
    if (isUserCurrentlyDeactivated(user)) {
      res.status(403).json({
        error:
          "This account is deactivated. Reactivation is not available in this window.",
        deactivatedUntil: user.deactivatedUntil,
      });
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
      user: toPublicUser(user),
    });
  }),
);

app.get(
  "/api/auth/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    await purgeExpiredDeactivatedUsers();
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const user = users.find((u) => u.id === req.user.sub);

    if (!user) {
      res.status(404).json({ error: "user not found" });
      return;
    }
    if (isUserCurrentlyDeactivated(user)) {
      res.status(403).json({
        error: "Account is deactivated.",
        deactivatedUntil: user.deactivatedUntil,
      });
      return;
    }

    res.json(toPublicUser(user));
  }),
);

app.post(
  "/api/auth/forgot-password",
  asyncHandler(async (req, res) => {
    await purgeExpiredDeactivatedUsers();
    const genericResetMessage =
      "If the account exists, a reset code has been sent to the registered contact.";
    const identifier = String(
      req.body?.identifier ||
        req.body?.contact ||
        req.body?.email ||
        req.body?.username ||
        "",
    ).trim();

    if (!identifier) {
      res.status(400).json({ error: "identifier is required" });
      return;
    }

    const users = (await readCollection("users")).map(normalizeExistingUser);
    const user = findUserByIdentifier(users, identifier);

    if (!user) {
      res.json({ ok: true, message: genericResetMessage });
      return;
    }

    const resetCode = createResetCode();
    const expiresAt = new Date(
      Date.now() + RESET_CODE_TTL_MINUTES * 60 * 1000,
    ).toISOString();

    const nextUsers = users.map((entry) => {
      if (entry.id !== user.id) return entry;
      return {
        ...entry,
        resetCodeHash: hashResetCode(resetCode),
        resetCodeExpiresAt: expiresAt,
        updatedAt: new Date().toISOString(),
      };
    });
    await writeCollection("users", nextUsers);

    errorLogStream.write(
      `${new Date().toISOString()} password-reset-request userId=${user.id} expiresAt=${expiresAt}\n`,
    );

    const response = {
      ok: true,
      message: genericResetMessage,
    };

    if (config.exposeResetCode) {
      response.devResetCode = resetCode;
      response.expiresAt = expiresAt;
    }

    res.json(response);
  }),
);

app.post(
  "/api/auth/reset-password",
  asyncHandler(async (req, res) => {
    await purgeExpiredDeactivatedUsers();
    const identifier = String(
      req.body?.identifier ||
        req.body?.contact ||
        req.body?.email ||
        req.body?.username ||
        "",
    ).trim();
    const code = String(req.body?.code || "").trim();
    const newPassword = String(req.body?.newPassword || "");

    if (!identifier || !code || !newPassword) {
      res.status(400).json({
        error: "identifier, code and newPassword are required",
      });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ error: "newPassword must be at least 6 characters" });
      return;
    }

    const users = (await readCollection("users")).map(normalizeExistingUser);
    const user = findUserByIdentifier(users, identifier);
    if (!user || !user.resetCodeHash || !user.resetCodeExpiresAt) {
      res.status(400).json({ error: "invalid or expired reset code" });
      return;
    }

    const expiresMs = Date.parse(String(user.resetCodeExpiresAt));
    if (!Number.isFinite(expiresMs) || expiresMs < Date.now()) {
      res.status(400).json({ error: "invalid or expired reset code" });
      return;
    }
    if (hashResetCode(code) !== user.resetCodeHash) {
      res.status(400).json({ error: "invalid or expired reset code" });
      return;
    }

    const updatedUsers = await Promise.all(
      users.map(async (entry) => {
        if (entry.id !== user.id) return entry;
        return {
          ...entry,
          passwordHash: await hashPassword(newPassword),
          resetCodeHash: null,
          resetCodeExpiresAt: null,
          updatedAt: new Date().toISOString(),
        };
      }),
    );
    await writeCollection("users", updatedUsers);
    res.json({ ok: true, message: "Password reset successful. You can now sign in." });
  }),
);

app.post(
  "/api/auth/change-password",
  requireAuth,
  asyncHandler(async (req, res) => {
    const currentPassword = String(req.body?.currentPassword || "");
    const newPassword = String(req.body?.newPassword || "");

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "currentPassword and newPassword are required" });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ error: "newPassword must be at least 6 characters" });
      return;
    }

    const users = (await readCollection("users")).map(normalizeExistingUser);
    const user = users.find((entry) => entry.id === req.user.sub);
    if (!user) {
      res.status(404).json({ error: "user not found" });
      return;
    }
    if (isUserCurrentlyDeactivated(user)) {
      res.status(403).json({ error: "Account is deactivated." });
      return;
    }

    const validCurrent = await verifyPassword(currentPassword, user.passwordHash);
    if (!validCurrent) {
      res.status(401).json({ error: "current password is invalid" });
      return;
    }

    const updatedUsers = await Promise.all(
      users.map(async (entry) => {
        if (entry.id !== user.id) return entry;
        return {
          ...entry,
          passwordHash: await hashPassword(newPassword),
          resetCodeHash: null,
          resetCodeExpiresAt: null,
          updatedAt: new Date().toISOString(),
        };
      }),
    );
    await writeCollection("users", updatedUsers);
    res.json({ ok: true, message: "Password changed successfully." });
  }),
);

app.put(
  "/api/auth/profile",
  requireAuth,
  asyncHandler(async (req, res) => {
    await purgeExpiredDeactivatedUsers();
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const userIndex = users.findIndex((entry) => entry.id === req.user.sub);

    if (userIndex === -1) {
      res.status(404).json({ error: "user not found" });
      return;
    }

    const currentUser = users[userIndex];
    if (isUserCurrentlyDeactivated(currentUser)) {
      res.status(403).json({ error: "Account is deactivated." });
      return;
    }

    const nextUser = { ...currentUser };
    const titleProvided = req.body?.title !== undefined;
    const firstNameProvided = req.body?.firstName !== undefined;
    const lastNameProvided =
      req.body?.lastName !== undefined || req.body?.surname !== undefined;

    if (titleProvided) {
      nextUser.title = normalizeWhitespace(req.body?.title);
    }
    if (firstNameProvided) {
      const nextFirstName = normalizeWhitespace(req.body?.firstName);
      if (!nextFirstName) {
        res.status(400).json({ error: "firstName cannot be empty" });
        return;
      }
      nextUser.firstName = nextFirstName;
    }
    if (lastNameProvided) {
      const nextLastName = normalizeWhitespace(req.body?.lastName || req.body?.surname);
      if (!nextLastName) {
        res.status(400).json({ error: "lastName cannot be empty" });
        return;
      }
      nextUser.lastName = nextLastName;
      nextUser.surname = nextLastName;
    }

    if (req.body?.username !== undefined) {
      const nextUsername = normalizeUsername(req.body?.username)
        .replace(/[^a-z0-9_.-]/g, "")
        .replace(/^\.+/, "");
      if (!isValidUsername(nextUsername)) {
        res.status(400).json({
          error:
            "username must be 3-30 chars and can include lowercase letters, numbers, ., _, -",
        });
        return;
      }
      if (
        users.some(
          (entry, idx) =>
            idx !== userIndex &&
            normalizeIdentifier(entry.username) === normalizeIdentifier(nextUsername),
        )
      ) {
        res.status(409).json({ error: "username already in use" });
        return;
      }
      nextUser.username = nextUsername;
    }

    if (req.body?.contact !== undefined) {
      const nextContact = normalizeContactValue(req.body?.contact);
      if (!nextContact) {
        res
          .status(400)
          .json({ error: "contact must be a valid email or phone number" });
        return;
      }
      const contactDigits = normalizePhoneComparable(nextContact);
      if (
        users.some(
          (entry, idx) =>
            idx !== userIndex &&
            (normalizeIdentifier(entry.contact) === normalizeIdentifier(nextContact) ||
              (contactDigits &&
                normalizePhoneComparable(entry.contact) &&
                normalizePhoneComparable(entry.contact) === contactDigits)),
        )
      ) {
        res.status(409).json({ error: "contact already in use" });
        return;
      }
      nextUser.contact = nextContact;
      nextUser.contactType = detectContactType(nextContact);
      nextUser.email = isValidEmail(nextContact) ? nextContact : "";
    }

    if (req.body?.role !== undefined) {
      const nextRole = normalizeRoleValue(req.body?.role);
      if (!nextRole) {
        res.status(400).json({ error: "role must be either student or worker" });
        return;
      }
      nextUser.role = nextRole;
    }

    if (req.body?.professionalType !== undefined) {
      const nextProfessionalType = normalizeProfessionalTypeValue(
        req.body?.professionalType,
      );
      if (!nextProfessionalType) {
        res.status(400).json({
          error:
            "professionalType must be one of: Doctor of Pharmacy, Pharmacy Technician, MCA, Other",
        });
        return;
      }
      nextUser.professionalType = nextProfessionalType;
    }

    if (req.body?.country !== undefined) {
      const nextCountry = normalizeWhitespace(req.body?.country);
      if (!nextCountry) {
        res.status(400).json({ error: "country cannot be empty" });
        return;
      }
      nextUser.country = nextCountry;
    }

    if (req.body?.institution !== undefined) {
      const nextInstitution = normalizeWhitespace(req.body?.institution);
      if (!nextInstitution) {
        res.status(400).json({ error: "institution cannot be empty" });
        return;
      }
      nextUser.institution = nextInstitution;
    }

    if (req.body?.profileImage !== undefined) {
      const nextImage = validateProfileImageValue(req.body?.profileImage);
      if (nextImage === null) {
        res.status(400).json({
          error:
            "profileImage must be an image data URL or HTTP(S) URL and under size limit",
        });
        return;
      }
      nextUser.profileImage = nextImage;
    }

    nextUser.name = buildDisplayName(
      nextUser.title,
      nextUser.firstName,
      nextUser.lastName,
      nextUser.username,
    );
    nextUser.updatedAt = new Date().toISOString();

    users[userIndex] = nextUser;
    await writeCollection("users", users);
    res.json({ ok: true, user: toPublicUser(nextUser) });
  }),
);

app.post(
  "/api/auth/deactivate",
  requireAuth,
  asyncHandler(async (req, res) => {
    const days = Number(req.body?.days ?? DEACTIVATE_MAX_DAYS);
    if (!Number.isInteger(days) || days < 1 || days > DEACTIVATE_MAX_DAYS) {
      res.status(400).json({
        error: `days must be an integer between 1 and ${DEACTIVATE_MAX_DAYS}`,
      });
      return;
    }

    const users = (await readCollection("users")).map(normalizeExistingUser);
    const userIndex = users.findIndex((entry) => entry.id === req.user.sub);
    if (userIndex === -1) {
      res.status(404).json({ error: "user not found" });
      return;
    }

    const nowIso = new Date().toISOString();
    const deactivatedUntil = new Date(
      Date.now() + days * 24 * 60 * 60 * 1000,
    ).toISOString();
    users[userIndex] = {
      ...users[userIndex],
      deactivatedAt: nowIso,
      deactivatedUntil,
      updatedAt: nowIso,
    };

    await writeCollection("users", users);
    res.json({
      ok: true,
      message: `Account deactivated for ${days} day(s).`,
      deactivatedUntil,
    });
  }),
);

app.delete(
  "/api/auth/account",
  requireAuth,
  asyncHandler(async (req, res) => {
    const confirmToken = String(req.body?.confirmToken || "");
    if (confirmToken !== DELETE_ACCOUNT_CONFIRM_TOKEN) {
      res.status(400).json({
        error: `confirmToken must be '${DELETE_ACCOUNT_CONFIRM_TOKEN}'`,
      });
      return;
    }

    const userId = req.user.sub;
    const actorId = `user:${userId}`;
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const filteredUsers = users.filter((entry) => entry.id !== userId);
    if (filteredUsers.length === users.length) {
      res.status(404).json({ error: "user not found" });
      return;
    }

    await writeCollection("users", filteredUsers);
    await updateCollection("attempts", async (items) =>
      items.filter((item) => item.userId !== userId && item.actorId !== actorId),
    );
    await updateCollection("syncSessions", async (items) =>
      items.filter((item) => item.actorId !== actorId),
    );
    await updateCollection("syncPerformance", async (items) =>
      items.filter((item) => item.actorId !== actorId),
    );

    res.json({ ok: true, message: "Account deleted permanently." });
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

    let questions = (await readCollection("questions")).map(normalizeQuestionForApi);

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
    } else {
      questions = questions.sort((a, b) => Number(a.id || 0) - Number(b.id || 0));
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
    res.json({ categories: [...MAJOR_CATEGORIES] });
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

    const allowedModes = new Set(["study", "exam", "smart"]);
    if (!allowedModes.has(mode)) {
      res.status(400).json({ error: "mode must be one of: study, exam, smart" });
      return;
    }
    if (count !== null && (!Number.isInteger(count) || count < 1 || count > 500)) {
      res
        .status(400)
        .json({ error: "count must be an integer between 1 and 500" });
      return;
    }

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
    const category = normalizeMajorCategory(req.body?.category, "");

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
    const score = safeNumber(req.body?.score) || 0;
    const total = safeNumber(req.body?.total) || 0;
    const percent = safeNumber(req.body?.percent) || 0;

    if (score < 0 || total < 0 || percent < 0 || percent > 100) {
      res.status(400).json({
        error: "score/total must be >= 0 and percent must be between 0 and 100",
      });
      return;
    }

    const session = {
      id: crypto.randomUUID(),
      actorId,
      mode: String(req.body?.mode || "").trim() || "Unknown",
      score,
      total,
      percent,
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
  "/api/ai/quota",
  requireAuth,
  asyncHandler(async (req, res) => {
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const user = users.find((entry) => entry.id === req.user.sub);
    if (!user) {
      res.status(404).json({ error: "user not found" });
      return;
    }
    if (isUserCurrentlyDeactivated(user)) {
      res.status(403).json({ error: "Account is deactivated." });
      return;
    }

    const tier = resolveSubscriptionTier(user);
    const caps = getAiCapsForTier(tier);
    const providerConfig = resolveAiProviderConfig(tier);
    const actorId = getActorId(req);
    const today = aiUsageDateKey();
    const usageRows = await readCollection("aiUsage");
    const row = usageRows.find(
      (entry) => entry.actorId === actorId && entry.date === today,
    );
    const used = Math.max(0, Number(row?.requests) || 0);

    res.json({
      ok: true,
      enabled: config.aiEnabled,
      tier,
      usage: {
        date: today,
        limit: caps.dailyRequests,
        used,
        remaining: Math.max(0, caps.dailyRequests - used),
      },
      provider: providerConfig.provider,
      model: providerConfig.model,
    });
  }),
);

app.post(
  "/api/ai/explain",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!config.aiEnabled) {
      res.status(503).json({ error: "AI feature is currently disabled." });
      return;
    }

    const users = (await readCollection("users")).map(normalizeExistingUser);
    const user = users.find((entry) => entry.id === req.user.sub);
    if (!user) {
      res.status(404).json({ error: "user not found" });
      return;
    }
    if (isUserCurrentlyDeactivated(user)) {
      res.status(403).json({ error: "Account is deactivated." });
      return;
    }

    const tier = resolveSubscriptionTier(user);
    const caps = getAiCapsForTier(tier);
    const providerConfig = resolveAiProviderConfig(tier);

    const question = trimAiInput(req.body?.question, 4500);
    if (!question) {
      res.status(400).json({ error: "question is required" });
      return;
    }

    const options = Array.isArray(req.body?.options)
      ? req.body.options.map((opt) => trimAiInput(opt, 400)).filter(Boolean).slice(0, 8)
      : [];
    const selectedAnswer = trimAiInput(req.body?.selectedAnswer, 500);
    const correctAnswer = trimAiInput(req.body?.correctAnswer, 500);
    const category = trimAiInput(req.body?.category, 200);
    const mode = trimAiInput(req.body?.mode, 80);
    const topicSlug = trimAiInput(req.body?.topicSlug, 120);
    const existingExplanation = trimAiInput(req.body?.existingExplanation, 2500);

    const inputChars =
      question.length +
      options.join("").length +
      selectedAnswer.length +
      correctAnswer.length +
      category.length +
      mode.length +
      topicSlug.length +
      existingExplanation.length;

    if (inputChars > caps.inputCharLimit) {
      res.status(400).json({
        error: `AI input is too large for your tier. Limit: ${caps.inputCharLimit} characters.`,
      });
      return;
    }

    if (!providerConfig.apiKey) {
      res.status(503).json({
        error: `AI provider is not configured for ${providerConfig.provider}.`,
      });
      return;
    }

    const actorId = getActorId(req);
    const quota = await reserveAiQuota({
      actorId,
      tier,
      inputChars,
    });

    if (quota.blocked) {
      res.status(429).json({
        error: `Daily AI limit reached (${quota.limit}). Try again tomorrow or upgrade to premium.`,
      });
      return;
    }

    try {
      const result = await generateAiExplanation({
        provider: providerConfig.provider,
        apiKey: providerConfig.apiKey,
        model: providerConfig.model,
        maxOutputTokens: caps.maxOutputTokens,
        timeoutMs: config.aiRequestTimeoutMs,
        payload: {
          question,
          options,
          selectedAnswer,
          correctAnswer,
          category,
          mode,
          topicSlug,
          existingExplanation,
        },
      });

      await recordAiResponse({
        actorId,
        usageDate: quota.usageDate,
        outputChars: String(result.answer || "").length,
        provider: result.provider,
        model: result.model,
      });

      res.json({
        ok: true,
        answer: result.answer,
        tier,
        provider: result.provider,
        model: result.model,
        usage: {
          limit: quota.limit,
          used: quota.used,
          remaining: quota.remaining,
        },
      });
    } catch (error) {
      const message = String(error?.message || "AI request failed");
      res.status(502).json({
        error: `AI provider error: ${message}`,
      });
    }
  }),
);

app.post(
  "/api/admin/seed-questions",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const force = Boolean(req.body?.force);
    const result = await ensureQuestionsSeeded({ force });
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

    const users = (await readCollection("users")).map(normalizeExistingUser);
    const sanitized = users.map((u) => ({
      id: u.id,
      title: u.title,
      firstName: u.firstName,
      lastName: u.lastName,
      surname: u.surname,
      name: u.name,
      username: u.username,
      contact: u.contact,
      contactType: u.contactType,
      email: u.email,
      role: u.role,
      subscriptionTier: u.subscriptionTier,
      professionalType: u.professionalType,
      country: u.country,
      institution: u.institution,
      profileImage: u.profileImage,
      deactivatedAt: u.deactivatedAt,
      deactivatedUntil: u.deactivatedUntil,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
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

app.put(
  "/api/admin/users/:userId/subscription",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const userId = String(req.params.userId || "");
    const nextTier = normalizeSubscriptionTierValue(req.body?.subscriptionTier);
    if (!nextTier) {
      res.status(400).json({ error: "subscriptionTier must be 'free' or 'premium'" });
      return;
    }

    const users = (await readCollection("users")).map(normalizeExistingUser);
    const idx = users.findIndex((entry) => entry.id === userId);
    if (idx < 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    users[idx] = {
      ...users[idx],
      subscriptionTier: nextTier,
      updatedAt: new Date().toISOString(),
    };
    await writeCollection("users", users);

    res.json({
      ok: true,
      user: toPublicUser(users[idx]),
    });
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

    const questions = (await readCollection("questions"))
      .map(normalizeQuestionForApi)
      .sort((a, b) => {
        const aOrder = extractQuestionOrderValue(a);
        const bOrder = extractQuestionOrderValue(b);
        if (aOrder !== bOrder) return aOrder - bOrder;
        return Number(a.id || 0) - Number(b.id || 0);
      });
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

    const text = String(req.body?.text || req.body?.question || "").trim();
    const rawCategory = String(req.body?.category || "").trim();
    const category = normalizeMajorCategory(rawCategory, text);
    const options = Array.isArray(req.body?.options)
      ? req.body.options.map((opt) => String(opt || "").trim()).filter(Boolean)
      : [];
    const correct = req.body?.correct;
    const topicSlug = normalizeSlugValue(req.body?.topicSlug);
    const sectionId = normalizeSlugValue(req.body?.sectionId);

    if (!text || !rawCategory || options.length < 2 || correct === undefined) {
      res.status(400).json({
        error:
          "Required fields: text, category, options (at least 2), correct (index or exact option text)",
      });
      return;
    }
    if (options.length > 8) {
      res.status(400).json({ error: "options cannot exceed 8 items" });
      return;
    }
    if (topicSlug === null) {
      res.status(400).json({
        error: "topicSlug must use lowercase kebab-case (a-z, 0-9, -)",
      });
      return;
    }
    if (sectionId === null) {
      res.status(400).json({
        error: "sectionId must use lowercase kebab-case (a-z, 0-9, -)",
      });
      return;
    }

    const resolvedCorrect = resolveCorrectAnswerValue(correct, options);
    if (!resolvedCorrect) {
      res.status(400).json({
        error:
          "correct must reference a valid option (index 0..n-1 or exact option text)",
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
      question: text,
      category,
      options,
      correct: resolvedCorrect,
      explanation: String(req.body?.explanation || ""),
      topicSlug: topicSlug || undefined,
      sectionId: sectionId || undefined,
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
    const textProvided =
      req.body?.text !== undefined || req.body?.question !== undefined;
    const text = String(req.body?.text ?? req.body?.question ?? "").trim();
    const categoryProvided = req.body?.category !== undefined;
    const rawCategory = String(req.body?.category || "").trim();
    const optionsProvided = Array.isArray(req.body?.options);
    const options = optionsProvided
      ? req.body.options.map((opt) => String(opt || "").trim()).filter(Boolean)
      : null;
    const correctProvided = req.body?.correct !== undefined;
    const correct = req.body?.correct;
    const explanationProvided = req.body?.explanation !== undefined;
    const explanation = String(req.body?.explanation || "");
    const topicSlugProvided = req.body?.topicSlug !== undefined;
    const topicSlug = normalizeSlugValue(req.body?.topicSlug);
    const sectionIdProvided = req.body?.sectionId !== undefined;
    const sectionId = normalizeSlugValue(req.body?.sectionId);

    const questions = await readCollection("questions");
    const idx = questions.findIndex((q) => String(q.id) === questionId);

    if (idx === -1) {
      res.status(404).json({ error: "Question not found" });
      return;
    }
    if (topicSlugProvided && topicSlug === null) {
      res.status(400).json({
        error: "topicSlug must use lowercase kebab-case (a-z, 0-9, -)",
      });
      return;
    }
    if (sectionIdProvided && sectionId === null) {
      res.status(400).json({
        error: "sectionId must use lowercase kebab-case (a-z, 0-9, -)",
      });
      return;
    }

    if (textProvided) {
      if (!text) {
        res.status(400).json({ error: "text cannot be empty" });
        return;
      }
      questions[idx].text = text;
      questions[idx].question = text;
    }
    if (categoryProvided) {
      if (!rawCategory) {
        res.status(400).json({ error: "category cannot be empty" });
        return;
      }
      const categoryContext = textProvided
        ? text
        : String(questions[idx].question || questions[idx].text || "");
      questions[idx].category = normalizeMajorCategory(rawCategory, categoryContext);
    }
    if (optionsProvided) {
      if (!options || options.length < 2) {
        res.status(400).json({ error: "options must contain at least 2 items" });
        return;
      }
      if (options.length > 8) {
        res.status(400).json({ error: "options cannot exceed 8 items" });
        return;
      }
      questions[idx].options = options;
    }
    if (correctProvided) {
      const optionPool = Array.isArray(questions[idx].options)
        ? questions[idx].options
        : [];
      const resolvedCorrect = resolveCorrectAnswerValue(correct, optionPool);
      if (!resolvedCorrect) {
        res.status(400).json({
          error:
            "correct must reference a valid option (index 0..n-1 or exact option text)",
        });
        return;
      }
      questions[idx].correct = resolvedCorrect;
    }
    if (explanationProvided) {
      questions[idx].explanation = explanation;
    }
    if (topicSlugProvided) {
      questions[idx].topicSlug = topicSlug || undefined;
    }
    if (sectionIdProvided) {
      questions[idx].sectionId = sectionId || undefined;
    }

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
    const aiUsage = await readCollection("aiUsage");

    const normalizedQuestions = questions.map(normalizeQuestionForApi);
    const finishedAttempts = attempts.filter((a) => a.finishedAt);
    const totalAttempts = finishedAttempts.length;
    const avgScore =
      totalAttempts === 0
        ? 0
        : Math.round(
            finishedAttempts.reduce((sum, a) => sum + (a.percent || 0), 0) /
              totalAttempts,
          );
    const dashboard = buildDashboardFromAttempts(
      finishedAttempts,
      normalizedQuestions,
    );
    const categoryStatsByName = new Map(
      dashboard.categories.map((row) => [row.category, row]),
    );
    const categories = [...MAJOR_CATEGORIES].map((category) => {
      const row = categoryStatsByName.get(category);
      if (!row) {
        return {
          category,
          attempts: 0,
          correct: 0,
          accuracy: null,
        };
      }
      return {
        category,
        attempts: row.attempts,
        correct: row.correct,
        accuracy: row.accuracy,
      };
    });

    res.json({
      totalUsers: users.length,
      totalQuestions: questions.length,
      totalCategories: MAJOR_CATEGORIES.length,
      categories,
      totalAttempts,
      totalSyncEvents: syncPerformance.length,
      totalSessions: syncSessions.length,
      totalAiUsageDays: aiUsage.length,
      totalAiRequests: aiUsage.reduce(
        (sum, row) => sum + (Number(row?.requests) || 0),
        0,
      ),
      averageScore: avgScore,
      storageUsage: {
        users: users.length,
        questions: questions.length,
        attempts: attempts.length,
        syncEvents: syncPerformance.length,
        syncSessions: syncSessions.length,
        aiUsage: aiUsage.length,
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
      ...normalizeExistingUser(u),
      passwordHash: undefined,
      resetCodeHash: undefined,
      resetCodeExpiresAt: undefined,
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
        aiUsage: aiUsage.length,
      },
      data: {
        users,
        questions,
        attempts,
        syncPerformance,
        syncSessions,
        aiUsage,
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
    await writeCollection("aiUsage", []);

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
  errorLogStream.write(
    `${new Date().toISOString()} ${error?.stack || String(error)}\n`,
  );
  res.status(500).json({ error: "Internal server error" });
});

async function start() {
  await ensureStore();
  const userNormalizeInfo = await normalizeStoredUsers();
  const purgedDeactivatedUsers = await purgeExpiredDeactivatedUsers();
  const seedInfo = await ensureQuestionsSeeded();
  const categoryNormalizeInfo = await normalizeStoredQuestionCategories();
  if (userNormalizeInfo.changed > 0) {
    console.log(
      `[users] normalized ${userNormalizeInfo.changed}/${userNormalizeInfo.total} user records`,
    );
  }
  if (purgedDeactivatedUsers > 0) {
    console.log(`[users] deleted ${purgedDeactivatedUsers} expired deactivated account(s)`);
  }
  if (seedInfo.seeded) {
    console.log(
      `[seed] imported ${seedInfo.count} questions from Quiz/data.js`,
    );
  }
  if (categoryNormalizeInfo.changed > 0) {
    console.log(
      `[taxonomy] normalized ${categoryNormalizeInfo.changed}/${categoryNormalizeInfo.total} question categories to 13 major categories`,
    );
  }

  const purgeTimer = setInterval(async () => {
    try {
      const removed = await purgeExpiredDeactivatedUsers();
      if (removed > 0) {
        console.log(`[users] deleted ${removed} expired deactivated account(s)`);
      }
    } catch (error) {
      errorLogStream.write(
        `${new Date().toISOString()} deactivate-purge-failed ${String(error?.stack || error)}\n`,
      );
    }
  }, 60 * 60 * 1000);
  if (typeof purgeTimer.unref === "function") {
    purgeTimer.unref();
  }

  if (config.httpsEnabled) {
    const pfxPath = path.isAbsolute(config.httpsPfxPath)
      ? config.httpsPfxPath
      : path.resolve(__dirname, "..", config.httpsPfxPath);

    if (!fs.existsSync(pfxPath)) {
      throw new Error(`HTTPS certificate file not found: ${pfxPath}`);
    }

    const tlsServer = https.createServer(
      {
        pfx: fs.readFileSync(pfxPath),
        passphrase: config.httpsPfxPassphrase || undefined,
      },
      app,
    );

    await new Promise((resolve, reject) => {
      tlsServer.once("error", reject);
      tlsServer.listen(config.httpsPort, resolve);
    });

    console.log(`Backend running on https://localhost:${config.httpsPort}`);

    if (config.httpsEnforce) {
      const redirectServer = http.createServer((req, res) => {
        const hostHeader = String(req.headers.host || "localhost");
        let hostname = "localhost";

        try {
          hostname = new URL(`http://${hostHeader}`).hostname;
        } catch {
          hostname = hostHeader.split(":")[0] || "localhost";
        }

        const httpsPort =
          config.httpsPort === 443 ? "" : `:${String(config.httpsPort)}`;
        const destination = `https://${hostname}${httpsPort}${req.url || "/"}`;

        res.statusCode = 301;
        res.setHeader("Location", destination);
        res.end("Redirecting to HTTPS");
      });

      await new Promise((resolve, reject) => {
        redirectServer.once("error", reject);
        redirectServer.listen(config.port, resolve);
      });

      console.log(
        `HTTP redirect server running on http://localhost:${config.port} -> https://localhost:${config.httpsPort}`,
      );
    }

    return;
  }

  app.listen(config.port, () => {
    console.log(`Backend running on http://localhost:${config.port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exitCode = 1;
});
