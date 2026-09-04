import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "./config.js";

const TOKEN_PREFIX = "Bearer ";
export const AUTH_COOKIE_NAME = "quizAuthToken";

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  const safePassword = String(password || "");
  const safeHash = String(hash || "");
  if (!safePassword || !safeHash) {
    return false;
  }
  try {
    return await bcrypt.compare(safePassword, safeHash);
  } catch {
    return false;
  }
}

export function createToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      contact: user.contact,
      username: user.username,
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

export function parseCookieToken(cookieHeader = "") {
  const rawHeader = String(cookieHeader || "").trim();
  if (!rawHeader) {
    return null;
  }

  for (const part of rawHeader.split(";")) {
    const [rawName, ...rawValueParts] = part.split("=");
    const name = String(rawName || "").trim();
    if (name !== AUTH_COOKIE_NAME) {
      continue;
    }

    const value = rawValueParts.join("=").trim();
    if (!value) {
      return null;
    }

    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  return null;
}

export function getAuthTokenFromRequest(req) {
  const bearerToken = parseBearerToken(req?.headers?.authorization || "");
  if (bearerToken) {
    return bearerToken;
  }

  return parseCookieToken(req?.headers?.cookie || "");
}

export function optionalAuth(req, _res, next) {
  const token = getAuthTokenFromRequest(req);
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
