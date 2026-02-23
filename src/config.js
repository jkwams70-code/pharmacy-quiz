import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 4000),
  corsOrigin: process.env.CORS_ORIGIN || "*",
  jwtSecret: process.env.JWT_SECRET || "change-this-in-env",
  adminKey: process.env.ADMIN_KEY || "",
  tokenTtl: "7d",
};
