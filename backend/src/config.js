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
  tokenTtl: "7d",
};
