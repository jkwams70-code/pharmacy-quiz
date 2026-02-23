import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "./config.js";

const TOKEN_PREFIX = "Bearer ";

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function createToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
    },
    config.jwtSecret,
    { expiresIn: config.tokenTtl },
  );
}

export function parseBearerToken(authHeader = "") {
  if (!authHeader.startsWith(TOKEN_PREFIX)) {
    return null;
  }
  return authHeader.slice(TOKEN_PREFIX.length).trim();
}

export function optionalAuth(req, _res, next) {
  const token = parseBearerToken(req.headers.authorization);
  if (!token) {
    req.user = null;
    next();
    return;
  }

  try {
    req.user = jwt.verify(token, config.jwtSecret);
  } catch {
    req.user = null;
  }

  next();
}

export function requireAuth(req, res, next) {
  optionalAuth(req, res, () => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    next();
  });
}
