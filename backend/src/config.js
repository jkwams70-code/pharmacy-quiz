import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, "..", ".env"),
  override: true,
});

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
const databaseUrl = String(process.env.DATABASE_URL || "").trim();
const databaseSsl =
  String(process.env.DATABASE_SSL || "").trim().toLowerCase() === "true" ||
  /supabase\.co/i.test(databaseUrl) ||
  /sslmode=require/i.test(databaseUrl);
const databasePoolMax = Math.max(
  1,
  Math.round(Number(process.env.DATABASE_POOL_MAX || 5) || 5),
);
const enableGzip = String(process.env.ENABLE_GZIP || "true").toLowerCase() !== "false";
const httpsEnabled = process.env.HTTPS_ENABLED === "true";
const httpsEnforce = process.env.HTTPS_ENFORCE === "true";
const httpsPort = Number(process.env.HTTPS_PORT || 4443);
const httpsPfxPath = process.env.HTTPS_PFX_PATH || "";
const httpsPfxPassphrase = process.env.HTTPS_PFX_PASSPHRASE || "";
const openAiApiKey = process.env.OPENAI_API_KEY || "";
const openRouterApiKey = process.env.OPENROUTER_API_KEY || "";
const geminiApiKey = process.env.GEMINI_API_KEY || "";
const googleVisionApiKey = process.env.GOOGLE_VISION_API_KEY || "";
const aiFreeProvider = (process.env.AI_FREE_PROVIDER || "gemini").trim().toLowerCase();
const aiPremiumProvider = (process.env.AI_PREMIUM_PROVIDER || "openai").trim().toLowerCase();
const aiFreeDailyRequests = Math.max(0, Math.round(Number(process.env.AI_FREE_DAILY_REQUESTS || 20) || 20));
const aiPremiumDailyRequests = Math.max(0, Math.round(Number(process.env.AI_PREMIUM_DAILY_REQUESTS || 100) || 100));
const aiFreeInputCharLimit = Math.max(0, Math.round(Number(process.env.AI_FREE_INPUT_CHAR_LIMIT || 6000) || 6000));
const aiPremiumInputCharLimit = Math.max(0, Math.round(Number(process.env.AI_PREMIUM_INPUT_CHAR_LIMIT || 12000) || 12000));
const aiFreeMaxOutputTokens = Math.max(0, Math.round(Number(process.env.AI_FREE_MAX_OUTPUT_TOKENS || 1000) || 1000));
const aiPremiumMaxOutputTokens = Math.max(0, Math.round(Number(process.env.AI_PREMIUM_MAX_OUTPUT_TOKENS || 1800) || 1800));
const aiRequestTimeoutMs = Math.max(1000, Math.round(Number(process.env.AI_REQUEST_TIMEOUT_MS || 30000) || 30000));
const aiEnabled =
  String(process.env.AI_ENABLED || "").trim().toLowerCase() === "true" ||
  Boolean(openAiApiKey || openRouterApiKey || geminiApiKey);

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

if (!["debug", "info", "silent"].includes(logLevel)) {
  throw new Error("Invalid LOG_LEVEL. Use one of: debug, info, silent.");
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
  (() => {
    const parsed =
      corsOrigin === "*"
        ? []
        : corsOrigin
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean);
    if (!isProduction) {
      return corsOrigin === "*" ? ["*"] : parsed;
    }
    const defaults = new Set([
      "https://ajixpharmacy.online",
      "https://www.ajixpharmacy.online",
    ]);
    for (const origin of parsed) {
      defaults.add(origin);
    }
    return Array.from(defaults);
  })();

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
  databaseUrl,
  databaseSsl,
  databasePoolMax,
  enableGzip,
  httpsEnabled,
  httpsEnforce,
  httpsPort,
  httpsPfxPath,
  httpsPfxPassphrase,
  openAiApiKey,
  openRouterApiKey,
  geminiApiKey,
  googleVisionApiKey,
  aiEnabled,
  aiFreeProvider,
  aiPremiumProvider,
  aiFreeDailyRequests,
  aiPremiumDailyRequests,
  aiFreeInputCharLimit,
  aiPremiumInputCharLimit,
  aiFreeMaxOutputTokens,
  aiPremiumMaxOutputTokens,
  aiRequestTimeoutMs,
  tokenTtl: "7d",
};
