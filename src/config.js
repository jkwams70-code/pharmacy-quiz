import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
const corsOrigin = process.env.CORS_ORIGIN || "*";

const corsOrigins = (() => {
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
  port: Number(process.env.PORT || 4000),
  corsOrigins,
  jwtSecret: process.env.JWT_SECRET || "change-this-in-env",
  adminKey: process.env.ADMIN_KEY || "",
  tokenTtl: "7d",
};
