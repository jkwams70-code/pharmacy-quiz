import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT || 4000);
const corsOrigin = process.env.CORS_ORIGIN || "*";
const jwtSecret = process.env.JWT_SECRET || "";
const adminKey = process.env.ADMIN_KEY || "";
const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60000);
const rateLimitMax = Number(process.env.RATE_LIMIT_MAX || 120);
const trustProxy = process.env.TRUST_PROXY === "true";
const logDir = process.env.LOG_DIR || "logs";
const logRetentionDays = Number(process.env.LOG_RETENTION_DAYS || 30);
const logLevel = (process.env.LOG_LEVEL || "info").toLowerCase();
const dbPath = process.env.DB_PATH || "./data";
const enableGzip = String(process.env.ENABLE_GZIP || "true").toLowerCase() !== "false";
const httpsEnabled = process.env.HTTPS_ENABLED === "true";
const httpsEnforce = process.env.HTTPS_ENFORCE === "true";
const httpsPort = Number(process.env.HTTPS_PORT || 4443);
const httpsPfxPath = process.env.HTTPS_PFX_PATH || "";
const httpsPfxPassphrase = process.env.HTTPS_PFX_PASSPHRASE || "";
const exposeResetCode = process.env.EXPOSE_RESET_CODE === "true";
const aiEnabled = String(process.env.AI_ENABLED || "true").toLowerCase() !== "false";
const aiFreeProvider = String(process.env.AI_FREE_PROVIDER || "openrouter")
  .trim()
  .toLowerCase();
const aiPremiumProvider = String(process.env.AI_PREMIUM_PROVIDER || "openai")
  .trim()
  .toLowerCase();
const geminiApiKey = String(process.env.GEMINI_API_KEY || "").trim();
const geminiModelFree = String(process.env.GEMINI_MODEL_FREE || "gemini-2.0-flash")
  .trim();
const openRouterApiKey = String(process.env.OPENROUTER_API_KEY || "").trim();
const openRouterModelFree = String(
  process.env.OPENROUTER_MODEL_FREE || "meta-llama/llama-3.1-8b-instruct:free",
).trim();
const openAiApiKey = String(process.env.OPENAI_API_KEY || "").trim();
const openAiModelPremium = String(process.env.OPENAI_MODEL_PREMIUM || "gpt-5-mini")
  .trim();
const aiRequestTimeoutMs = Number(process.env.AI_REQUEST_TIMEOUT_MS || 25000);
const aiFreeDailyRequests = Number(process.env.AI_FREE_DAILY_REQUESTS || 25);
const aiPremiumDailyRequests = Number(process.env.AI_PREMIUM_DAILY_REQUESTS || 300);
const aiFreeInputCharLimit = Number(process.env.AI_FREE_INPUT_CHAR_LIMIT || 4000);
const aiPremiumInputCharLimit = Number(
  process.env.AI_PREMIUM_INPUT_CHAR_LIMIT || 12000,
);
const aiFreeMaxOutputTokens = Number(process.env.AI_FREE_MAX_OUTPUT_TOKENS || 450);
const aiPremiumMaxOutputTokens = Number(
  process.env.AI_PREMIUM_MAX_OUTPUT_TOKENS || 900,
);
const aiPremiumUserIds = String(process.env.AI_PREMIUM_USER_IDS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

if (!Number.isFinite(port) || port <= 0) {
  throw new Error("Invalid PORT. Set a positive numeric PORT value.");
}

if (!Number.isFinite(httpsPort) || httpsPort <= 0) {
  throw new Error("Invalid HTTPS_PORT. Set a positive numeric HTTPS_PORT value.");
}

if (!Number.isFinite(rateLimitWindowMs) || rateLimitWindowMs <= 0) {
  throw new Error("Invalid RATE_LIMIT_WINDOW_MS. Use a positive number.");
}

if (!Number.isFinite(rateLimitMax) || rateLimitMax <= 0) {
  throw new Error("Invalid RATE_LIMIT_MAX. Use a positive number.");
}

if (!Number.isFinite(logRetentionDays) || logRetentionDays <= 0) {
  throw new Error("Invalid LOG_RETENTION_DAYS. Use a positive number.");
}

if (!Number.isFinite(aiRequestTimeoutMs) || aiRequestTimeoutMs < 3000) {
  throw new Error("Invalid AI_REQUEST_TIMEOUT_MS. Use a number >= 3000.");
}

if (!Number.isFinite(aiFreeDailyRequests) || aiFreeDailyRequests < 1) {
  throw new Error("Invalid AI_FREE_DAILY_REQUESTS. Use a positive number.");
}

if (!Number.isFinite(aiPremiumDailyRequests) || aiPremiumDailyRequests < 1) {
  throw new Error("Invalid AI_PREMIUM_DAILY_REQUESTS. Use a positive number.");
}

if (!Number.isFinite(aiFreeInputCharLimit) || aiFreeInputCharLimit < 300) {
  throw new Error("Invalid AI_FREE_INPUT_CHAR_LIMIT. Use a number >= 300.");
}

if (!Number.isFinite(aiPremiumInputCharLimit) || aiPremiumInputCharLimit < 300) {
  throw new Error("Invalid AI_PREMIUM_INPUT_CHAR_LIMIT. Use a number >= 300.");
}

if (!Number.isFinite(aiFreeMaxOutputTokens) || aiFreeMaxOutputTokens < 64) {
  throw new Error("Invalid AI_FREE_MAX_OUTPUT_TOKENS. Use a number >= 64.");
}

if (!Number.isFinite(aiPremiumMaxOutputTokens) || aiPremiumMaxOutputTokens < 64) {
  throw new Error("Invalid AI_PREMIUM_MAX_OUTPUT_TOKENS. Use a number >= 64.");
}

if (!["debug", "info", "silent"].includes(logLevel)) {
  throw new Error("Invalid LOG_LEVEL. Use one of: debug, info, silent.");
}

if (!["gemini", "openai", "openrouter"].includes(aiFreeProvider)) {
  throw new Error(
    "Invalid AI_FREE_PROVIDER. Use 'gemini', 'openrouter', or 'openai'.",
  );
}

if (!["gemini", "openai", "openrouter"].includes(aiPremiumProvider)) {
  throw new Error(
    "Invalid AI_PREMIUM_PROVIDER. Use 'gemini', 'openrouter', or 'openai'.",
  );
}

if (isProduction && corsOrigin === "*") {
  throw new Error("CORS_ORIGIN cannot be '*' in production.");
}

if (isProduction && jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters in production.");
}

if (isProduction && adminKey.length < 20) {
  throw new Error("ADMIN_KEY must be at least 20 characters in production.");
}

if (httpsEnabled && !httpsPfxPath) {
  throw new Error("HTTPS_PFX_PATH is required when HTTPS_ENABLED=true.");
}

if (httpsEnabled && httpsEnforce && port === httpsPort) {
  throw new Error("PORT and HTTPS_PORT must be different when HTTPS_ENFORCE=true.");
}

const corsOrigins =
  corsOrigin === "*"
    ? ["*"]
    : corsOrigin
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);

export const config = {
  port,
  corsOrigins,
  jwtSecret: jwtSecret || "dev-insecure-secret-change-me",
  adminKey,
  trustProxy,
  rateLimitWindowMs,
  rateLimitMax,
  logDir,
  logRetentionDays,
  logLevel,
  dbPath,
  enableGzip,
  httpsEnabled,
  httpsEnforce,
  httpsPort,
  httpsPfxPath,
  httpsPfxPassphrase,
  exposeResetCode,
  aiEnabled,
  aiFreeProvider,
  aiPremiumProvider,
  geminiApiKey,
  geminiModelFree,
  openRouterApiKey,
  openRouterModelFree,
  openAiApiKey,
  openAiModelPremium,
  aiRequestTimeoutMs,
  aiFreeDailyRequests,
  aiPremiumDailyRequests,
  aiFreeInputCharLimit,
  aiPremiumInputCharLimit,
  aiFreeMaxOutputTokens,
  aiPremiumMaxOutputTokens,
  aiPremiumUserIds,
  tokenTtl: "7d",
};
