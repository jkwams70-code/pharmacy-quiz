import crypto from "node:crypto";
import { execFile } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import os from "node:os";
import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import agoraAccessTokenPackage from "agora-access-token";
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
import { inferQuestionRotation } from "../../rotationTaxonomy.js";

const app = express();
const execFileAsync = promisify(execFile);
const { RtcRole, RtcTokenBuilder } = agoraAccessTokenPackage;
const ALLOWED_ROTATIONS = new Set([
  "Internal Medicine",
  "Paediatrics",
  "Maternal and Child Health",
  "Accident & Emergency",
  "Emergency",
  "Surgery",
  "Mental Health",
  "Oncology",
  "ENT/Dental",
]);

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
let cachedFfmpegPath = "";
let cachedFfprobePath = "";
const COMMUNITY_REALTIME_GLOBAL_TOPIC = "community:global";
const COMMUNITY_REALTIME_PRESENCE_TOPIC = "community:presence";
const communityCallSessionsByConversation = new Map();

function resolveWingetFfmpegBinary(binaryName = "ffmpeg.exe") {
  const localAppData = String(process.env.LOCALAPPDATA || "").trim();
  if (!localAppData) return "";
  const packagesRoot = path.join(localAppData, "Microsoft", "WinGet", "Packages");
  if (!fs.existsSync(packagesRoot)) return "";
  const packageDir = fs.readdirSync(packagesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("Gyan.FFmpeg_"))
    .map((entry) => path.join(packagesRoot, entry.name))
    .sort((a, b) => b.localeCompare(a))[0];
  if (!packageDir) return "";
  const builds = fs.readdirSync(packageDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^ffmpeg-/i.test(entry.name))
    .map((entry) => path.join(packageDir, entry.name, "bin", binaryName))
    .filter((candidate) => fs.existsSync(candidate))
    .sort((a, b) => b.localeCompare(a));
  return builds[0] || "";
}

function getFfmpegPath() {
  if (cachedFfmpegPath && fs.existsSync(cachedFfmpegPath)) return cachedFfmpegPath;
  const candidate = String(process.env.FFMPEG_PATH || "").trim() || resolveWingetFfmpegBinary("ffmpeg.exe");
  if (!candidate || !fs.existsSync(candidate)) {
    throw new Error("FFmpeg is not installed on this server.");
  }
  cachedFfmpegPath = candidate;
  return cachedFfmpegPath;
}

function getFfprobePath() {
  if (cachedFfprobePath && fs.existsSync(cachedFfprobePath)) return cachedFfprobePath;
  const candidate = String(process.env.FFPROBE_PATH || "").trim() || resolveWingetFfmpegBinary("ffprobe.exe");
  if (!candidate || !fs.existsSync(candidate)) {
    throw new Error("FFprobe is not installed on this server.");
  }
  cachedFfprobePath = candidate;
  return cachedFfprobePath;
}

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function safeNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function isCommunityRealtimeConfigured() {
  return Boolean(
    config.supabaseRealtimeUrl &&
    config.supabaseRealtimeAnonKey &&
    config.supabaseRealtimeServiceKey,
  );
}

async function publishCommunityRealtimeMessages(messages = []) {
  const safeMessages = Array.isArray(messages)
    ? messages.filter(
        (entry) =>
          entry &&
          typeof entry === "object" &&
          String(entry.topic || "").trim() &&
          String(entry.event || "").trim(),
      )
    : [];
  if (!safeMessages.length || !isCommunityRealtimeConfigured() || typeof fetch !== "function") {
    return;
  }
  const endpoint = `${String(config.supabaseRealtimeUrl || "").replace(/\/+$/, "")}/realtime/v1/api/broadcast`;
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: config.supabaseRealtimeServiceKey,
        Authorization: `Bearer ${config.supabaseRealtimeServiceKey}`,
      },
      body: JSON.stringify({
        messages: safeMessages.map((entry) => ({
          topic: String(entry.topic || "").trim(),
          event: String(entry.event || "").trim(),
          payload: entry.payload && typeof entry.payload === "object" ? entry.payload : {},
          private: false,
        })),
      }),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn("Community realtime broadcast failed", response.status, detail.slice(0, 160));
    }
  } catch (error) {
    console.warn("Community realtime broadcast failed", error?.message || error);
  }
}

function fireCommunityRealtimeMessages(messages = []) {
  void publishCommunityRealtimeMessages(messages);
}

function buildCommunityOverviewRealtimeMessage(scope = "overview", payload = {}) {
  return {
    topic: COMMUNITY_REALTIME_GLOBAL_TOPIC,
    event: "community.overview.changed",
    payload: {
      scope,
      at: new Date().toISOString(),
      ...(payload && typeof payload === "object" ? payload : {}),
    },
  };
}

function buildCommunityConversationRealtimeMessages(conversationId = "", payload = {}) {
  const safeConversationId = String(conversationId || "").trim();
  if (!safeConversationId) return [];
  const safePayload = payload && typeof payload === "object" ? payload : {};
  return [
    {
      topic: `community:conversation:${safeConversationId}`,
      event: "community.conversation.changed",
      payload: {
        conversationId: safeConversationId,
        at: new Date().toISOString(),
        ...safePayload,
      },
    },
    buildCommunityOverviewRealtimeMessage("conversations", {
      conversationId: safeConversationId,
      ...safePayload,
    }),
  ];
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
const DAILY_QUIZ_SEASON = {
  key: "2026-03",
  start: "2026-03-01",
  end: "2026-12-31",
  timezone: "Africa/Accra",
  questionsPerDay: 10,
};
const DAILY_REWARD_RULES = {
  completion: 20,
  perCorrect: 1,
  perfect: 10,
  streakStep: 5,
  streakCap: 5,
  weekendStreakMultiplier: 2,
};
const PROFILE_VISIBILITY_VALUES = new Set(["everyone", "friends", "nobody"]);
const CONTACT_VISIBILITY_VALUES = new Set(["friends", "nobody"]);
const REQUEST_VISIBILITY_VALUES = new Set(["everyone", "nobody"]);
const MESSAGE_VISIBILITY_VALUES = new Set(["friends", "nobody"]);
const FRIEND_REQUEST_STATUS_VALUES = new Set([
  "pending",
  "accepted",
  "rejected",
  "cancelled",
]);
const MESSAGE_TYPE_VALUES = new Set(["text", "image", "video", "audio", "file", "document", "call"]);
const MESSAGE_DELETED_PLACEHOLDER = "message deleted";
const ADMIN_NOTICE_SENDER_ID = "__admin_notice__";
const ADMIN_NOTICE_SENDER_NAME = "AJIXPHARMACY Admin";
const ADMIN_NOTICE_PROFILE_IMAGE = "/icons/icon-512-s3.png?v=20260324-applogo1";
const ADMIN_BROADCAST_STATUS_TITLE = "AJIXPHARMACY Admin";
const ADMIN_BROADCAST_CONVERSATION_ID = "__admin_broadcast__";
const ADMIN_BROADCAST_THREAD_KEY = "broadcast";
const CONVERSATION_TYPE_VALUES = new Set(["direct", "group", "notice"]);
const UPLOAD_KIND_VALUES = new Set(["chat-image", "chat-video", "chat-audio", "chat-file", "status-image", "status-video", "group-avatar"]);
const STATUS_VISIBILITY_VALUES = new Set(["friends", "everyone"]);
const ALLOWED_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const ALLOWED_VIDEO_MIME_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const ALLOWED_AUDIO_MIME_TYPES = new Set(["audio/webm", "audio/ogg", "audio/mp4", "audio/mpeg", "audio/wav", "audio/x-wav"]);
const ALLOWED_DOCUMENT_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
]);
const MIME_TYPE_ALIASES = {
  "audio/mp3": "audio/mpeg",
  "audio/m4a": "audio/mp4",
  "audio/x-m4a": "audio/mp4",
  "audio/mp4a-latm": "audio/mp4",
  "audio/aac": "audio/mp4",
  "audio/3gpp": "audio/mp4",
  "audio/3gpp2": "audio/mp4",
  "audio/amr": "audio/mp4",
  "audio/x-wav": "audio/wav",
  "video/mp4v-es": "video/mp4",
  "video/x-quicktime": "video/quicktime",
  "application/x-pdf": "application/pdf",
};
const MAX_IMAGE_UPLOAD_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_UPLOAD_BYTES = 12 * 1024 * 1024;
const MAX_AUDIO_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_DOCUMENT_UPLOAD_BYTES = 20 * 1024 * 1024;
const STRUCTURED_STORAGE_FOLDERS = {
  image: "ajix-images",
  video: "ajix-videos",
  document: "ajix-documents",
};
const MAX_GROUP_MEMBERS = 50;
const COMMUNITY_GROUP_INVITE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_ACTIVE_STATUSES_PER_USER = 20;
const COMMUNITY_STATUS_MAX_VIDEO_SECONDS = 30;
const STATUS_TTL_MS = 24 * 60 * 60 * 1000;
const COMMUNITY_CALL_MODE_VALUES = new Set(["voice", "video"]);
const COMMUNITY_CALL_MAX_DURATION_MS = 2 * 60 * 60 * 1000;
const COMMUNITY_MODERATION_BLOCK_MESSAGE = "This content violates our guidelines and cannot be shared.";
const COMMUNITY_MODERATION_VIDEO_FRAME_INTERVAL_SECONDS = 2;
const COMMUNITY_RESTRICTED_TEXT_PATTERNS = [
  /\bfuck(?:ing|er|ed)?\b/i,
  /\bshit(?:ty|head)?\b/i,
  /\bbitch(?:es)?\b/i,
  /\basshole\b/i,
  /\bcunt\b/i,
  /\bmotherfucker\b/i,
  /\bnigg(?:er|a)\b/i,
];

function normalizeBioValue(value) {
  return normalizeWhitespace(String(value || "")).slice(0, 280);
}

function normalizeCommunityCallMode(value = "voice") {
  const mode = String(value || "").trim().toLowerCase();
  return COMMUNITY_CALL_MODE_VALUES.has(mode) ? mode : "voice";
}

function sanitizeCommunityCallChannelToken(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 60);
}

function buildCommunityCallChannelName(conversationId = "", callId = "") {
  const conversationToken = sanitizeCommunityCallChannelToken(conversationId).slice(0, 32);
  const callToken = sanitizeCommunityCallChannelToken(callId).slice(0, 18);
  return `ajix-${conversationToken || "community"}-${callToken || "call"}`;
}

function isCommunityCallSessionActive(session = null, nowMs = Date.now()) {
  const payload = session && typeof session === "object" ? session : null;
  if (!payload) return false;
  if (String(payload.endedAt || "").trim()) return false;
  const expiresMs = Date.parse(String(payload.expiresAt || ""));
  return Number.isFinite(expiresMs) && expiresMs > nowMs;
}

function pruneInactiveCommunityCallSessions(nowMs = Date.now()) {
  communityCallSessionsByConversation.forEach((session, conversationId) => {
    if (!isCommunityCallSessionActive(session, nowMs)) {
      communityCallSessionsByConversation.delete(conversationId);
    }
  });
}

function getActiveCommunityCallSession(conversationId = "", nowMs = Date.now()) {
  pruneInactiveCommunityCallSessions(nowMs);
  const safeConversationId = String(conversationId || "").trim();
  if (!safeConversationId) return null;
  const session = communityCallSessionsByConversation.get(safeConversationId);
  return isCommunityCallSessionActive(session, nowMs) ? session : null;
}

function buildCommunityCallPublicPayload(session = {}) {
  const safeSession = session && typeof session === "object" ? session : {};
  return {
    id: String(safeSession.id || "").trim(),
    conversationId: String(safeSession.conversationId || "").trim(),
    mode: normalizeCommunityCallMode(safeSession.mode),
    channelName: String(safeSession.channelName || "").trim(),
    startedByUserId: String(safeSession.startedByUserId || "").trim(),
    answeredByUserId: String(safeSession.answeredByUserId || "").trim(),
    startedAt: String(safeSession.startedAt || "").trim(),
    answeredAt: String(safeSession.answeredAt || "").trim(),
    expiresAt: String(safeSession.expiresAt || "").trim(),
    participantUserIds: Array.isArray(safeSession.participantUserIds)
      ? [...new Set(safeSession.participantUserIds.map((value) => String(value || "").trim()).filter(Boolean))]
      : [],
    active: isCommunityCallSessionActive(safeSession),
  };
}

function markCommunityCallSessionAnswered(session = {}, userId = "") {
  const safeSession = session && typeof session === "object" ? session : null;
  const safeUserId = String(userId || "").trim();
  if (!safeSession || !safeUserId) return safeSession;
  if (String(safeSession.startedByUserId || "").trim() === safeUserId) return safeSession;
  if (String(safeSession.answeredAt || "").trim()) return safeSession;
  const nowIso = new Date().toISOString();
  return {
    ...safeSession,
    answeredByUserId: safeUserId,
    answeredAt: nowIso,
    updatedAt: nowIso,
  };
}

function assertAgoraCallConfigReady() {
  if (!config.agoraAppId || !config.agoraAppCertificate) {
    const error = new Error("Voice and video calls are not configured yet.");
    error.status = 503;
    throw error;
  }
  if (!RtcTokenBuilder || typeof RtcTokenBuilder.buildTokenWithUid !== "function") {
    const error = new Error("Call token generator is unavailable on the server.");
    error.status = 503;
    throw error;
  }
}

function buildAgoraCallTokenPayload(session = {}, userId = "") {
  assertAgoraCallConfigReady();
  const safeSession = session && typeof session === "object" ? session : {};
  const safeUserId = String(userId || "").trim();
  if (!safeUserId) {
    const error = new Error("A valid call user is required.");
    error.status = 400;
    throw error;
  }
  const nowSeconds = Math.floor(Date.now() / 1000);
  const expiresAtSeconds = Number(safeSession.expiresAtSeconds || 0);
  const tokenExpirySeconds = Number.isFinite(expiresAtSeconds) && expiresAtSeconds > nowSeconds
    ? expiresAtSeconds
    : nowSeconds + config.agoraTokenExpirySeconds;
  const uid = crypto.randomInt(1, 2147483000);
  const token = RtcTokenBuilder.buildTokenWithUid(
    config.agoraAppId,
    config.agoraAppCertificate,
    String(safeSession.channelName || "").trim(),
    uid,
    RtcRole.PUBLISHER,
    tokenExpirySeconds,
  );
  return {
    appId: config.agoraAppId,
    channelName: String(safeSession.channelName || "").trim(),
    uid,
    token,
    tokenExpiresAt: new Date(tokenExpirySeconds * 1000).toISOString(),
  };
}

function createCommunityCallSession({
  conversationId = "",
  mode = "voice",
  startedByUserId = "",
} = {}) {
  const safeConversationId = String(conversationId || "").trim();
  const safeStartedByUserId = String(startedByUserId || "").trim();
  if (!safeConversationId || !safeStartedByUserId) return null;
  const nowMs = Date.now();
  const expiresAtMs = nowMs + Math.max(
    300 * 1000,
    Math.min(COMMUNITY_CALL_MAX_DURATION_MS, Number(config.agoraTokenExpirySeconds || 3600) * 1000),
  );
  const session = {
    id: crypto.randomUUID(),
    conversationId: safeConversationId,
    mode: normalizeCommunityCallMode(mode),
    channelName: "",
    startedByUserId: safeStartedByUserId,
    answeredByUserId: "",
    participantUserIds: [safeStartedByUserId],
    startedAt: new Date(nowMs).toISOString(),
    answeredAt: "",
    expiresAt: new Date(expiresAtMs).toISOString(),
    expiresAtSeconds: Math.floor(expiresAtMs / 1000),
    endedAt: "",
    updatedAt: new Date(nowMs).toISOString(),
  };
  session.channelName = buildCommunityCallChannelName(session.conversationId, session.id);
  return session;
}

async function getCommunityConversationForMember(conversationId = "", memberId = "") {
  const safeConversationId = String(conversationId || "").trim();
  const safeMemberId = String(memberId || "").trim();
  if (!safeConversationId || !safeMemberId) return null;
  const conversations = (await readCollection("conversations")).map(normalizeConversation);
  const conversation = conversations.find((entry) => entry.id === safeConversationId);
  if (!conversation || !Array.isArray(conversation.memberIds) || !conversation.memberIds.includes(safeMemberId)) {
    return null;
  }
  return conversation;
}

function getCommunityConversationStateKey(userId = "", conversationId = "") {
  return `${String(userId || "").trim()}::${String(conversationId || "").trim()}`;
}

function getCommunityConversationStateForViewer(states = [], userId = "", conversationId = "") {
  const safeUserId = String(userId || "").trim();
  const safeConversationId = String(conversationId || "").trim();
  if (!safeUserId || !safeConversationId) return null;
  return states.find(
    (entry) =>
      String(entry?.userId || "") === safeUserId &&
      String(entry?.conversationId || "") === safeConversationId,
  ) || null;
}

function isCommunityConversationHiddenForViewer(state = null) {
  return Boolean(String(state?.hiddenAt || "").trim());
}

function buildConversationStateRecord(existing = null, patch = {}) {
  const base = normalizeCommunityConversationState(existing || {});
  const next = normalizeCommunityConversationState({
    ...base,
    ...patch,
    userId: base.userId || String(patch.userId || "").trim(),
    conversationId: base.conversationId || String(patch.conversationId || "").trim(),
    createdAt: base.createdAt,
    updatedAt: new Date().toISOString(),
  });
  return next;
}

async function upsertCommunityConversationState({
  userId = "",
  conversationId = "",
  patch = {},
  removeIfEmpty = false,
} = {}) {
  const safeUserId = String(userId || "").trim();
  const safeConversationId = String(conversationId || "").trim();
  if (!safeUserId || !safeConversationId) return null;
  const states = (await readCollection("communityConversationStates")).map(normalizeCommunityConversationState);
  const index = states.findIndex(
    (entry) =>
      String(entry?.userId || "") === safeUserId &&
      String(entry?.conversationId || "") === safeConversationId,
  );
  const existing = index >= 0 ? states[index] : null;
  const next = buildConversationStateRecord(existing, {
    ...patch,
    userId: safeUserId,
    conversationId: safeConversationId,
  });
  const hasMeaningfulState = Boolean(next.isFavorite || String(next.hiddenAt || "").trim());
  if (!hasMeaningfulState && removeIfEmpty) {
    if (index >= 0) {
      states.splice(index, 1);
      await writeCollection("communityConversationStates", states);
    }
    return null;
  }
  if (index >= 0) {
    states[index] = next;
  } else {
    states.push(next);
  }
  await writeCollection("communityConversationStates", states);
  return next;
}

function normalizePrivacySettings(raw = {}) {
  const profileVisibility = String(raw?.profileVisibility || "everyone").trim().toLowerCase();
  const bioVisibility = String(raw?.bioVisibility || profileVisibility || "everyone")
    .trim()
    .toLowerCase();
  const institutionVisibility = String(
    raw?.institutionVisibility || bioVisibility || "friends",
  )
    .trim()
    .toLowerCase();
  const contactVisibility = String(raw?.contactVisibility || "friends").trim().toLowerCase();
  const allowFriendRequestsFrom = String(raw?.allowFriendRequestsFrom || "everyone")
    .trim()
    .toLowerCase();
  const allowMessagesFrom = String(raw?.allowMessagesFrom || "friends").trim().toLowerCase();
  const leaderboardVisibility = String(raw?.leaderboardVisibility || "everyone").trim().toLowerCase();
  const statusVisibility = String(raw?.statusVisibility || "friends").trim().toLowerCase();
  const onlineVisibility = String(raw?.onlineVisibility || "friends").trim().toLowerCase();
  const lastSeenVisibility = String(raw?.lastSeenVisibility || "friends").trim().toLowerCase();
  const groupAddVisibility = String(raw?.groupAddVisibility || "friends").trim().toLowerCase();

  return {
    profileVisibility: PROFILE_VISIBILITY_VALUES.has(profileVisibility)
      ? profileVisibility
      : "everyone",
    bioVisibility: PROFILE_VISIBILITY_VALUES.has(bioVisibility) ? bioVisibility : "everyone",
    institutionVisibility: PROFILE_VISIBILITY_VALUES.has(institutionVisibility)
      ? institutionVisibility
      : "friends",
    contactVisibility: CONTACT_VISIBILITY_VALUES.has(contactVisibility)
      ? contactVisibility
      : "friends",
    allowFriendRequestsFrom: REQUEST_VISIBILITY_VALUES.has(allowFriendRequestsFrom)
      ? allowFriendRequestsFrom
      : "everyone",
    allowMessagesFrom: MESSAGE_VISIBILITY_VALUES.has(allowMessagesFrom)
      ? allowMessagesFrom
      : "friends",
    leaderboardVisibility: PROFILE_VISIBILITY_VALUES.has(leaderboardVisibility)
      ? leaderboardVisibility
      : "everyone",
    statusVisibility: PROFILE_VISIBILITY_VALUES.has(statusVisibility) ? statusVisibility : "friends",
    onlineVisibility: PROFILE_VISIBILITY_VALUES.has(onlineVisibility) ? onlineVisibility : "friends",
    lastSeenVisibility: PROFILE_VISIBILITY_VALUES.has(lastSeenVisibility)
      ? lastSeenVisibility
      : "friends",
    groupAddVisibility: REQUEST_VISIBILITY_VALUES.has(groupAddVisibility) ? groupAddVisibility : "friends",
  };
}

function normalizeFriendRequest(raw = {}) {
  const createdAt = String(raw.createdAt || new Date().toISOString());
  const updatedAt = String(raw.updatedAt || createdAt);
  const status = String(raw.status || "pending").trim().toLowerCase();
  return {
    id: String(raw.id || crypto.randomUUID()),
    fromUserId: String(raw.fromUserId || ""),
    toUserId: String(raw.toUserId || ""),
    status: FRIEND_REQUEST_STATUS_VALUES.has(status) ? status : "pending",
    createdAt,
    updatedAt,
  };
}

function normalizeFriendship(raw = {}) {
  const members = [String(raw.userA || ""), String(raw.userB || "")]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
  return {
    id: String(raw.id || crypto.randomUUID()),
    userA: members[0] || "",
    userB: members[1] || "",
    createdAt: String(raw.createdAt || new Date().toISOString()),
  };
}

function normalizeBlock(raw = {}) {
  return {
    id: String(raw.id || crypto.randomUUID()),
    blockerUserId: String(raw.blockerUserId || ""),
    blockedUserId: String(raw.blockedUserId || ""),
    createdAt: String(raw.createdAt || new Date().toISOString()),
  };
}

function normalizeCommunityConversationState(raw = {}) {
  const createdAt = String(raw.createdAt || new Date().toISOString());
  return {
    id: String(raw.id || crypto.randomUUID()),
    userId: String(raw.userId || "").trim(),
    conversationId: String(raw.conversationId || "").trim(),
    isFavorite: raw.isFavorite === true,
    hiddenAt: String(raw.hiddenAt || "").trim(),
    createdAt,
    updatedAt: String(raw.updatedAt || createdAt),
  };
}

function normalizeConversation(raw = {}) {
  const memberIds = Array.isArray(raw.memberIds)
    ? [...new Set(raw.memberIds.map((value) => String(value || "").trim()).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b),
      )
    : [];
  const createdAt = String(raw.createdAt || new Date().toISOString());
  const type = String(raw.type || "direct").trim().toLowerCase();
  const adminIds = Array.isArray(raw.adminIds)
    ? [...new Set(raw.adminIds.map((value) => String(value || "").trim()).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b),
      )
    : [];
  const mutedMemberIds = Array.isArray(raw.mutedMemberIds)
    ? [...new Set(raw.mutedMemberIds.map((value) => String(value || "").trim()).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b),
      )
    : [];
  const permissions = normalizeGroupPermissions(raw.permissions || {});
  const inviteToken = normalizeWhitespace(raw.inviteToken).replace(/\s+/g, "");
  const inviteTokenCreatedAt = String(raw.inviteTokenCreatedAt || createdAt);
  const noticeTitle = normalizeWhitespace(raw.noticeTitle).slice(0, 72);
  const noticeSubtitle = normalizeWhitespace(raw.noticeSubtitle).slice(0, 180);
  const noticeBody = normalizeWhitespace(raw.noticeBody).slice(0, 240);
  const noticeAvatarUploadId = String(raw.noticeAvatarUploadId || "").trim();
  const noticeOriginType = normalizeWhitespace(raw.noticeOriginType).slice(0, 32);
  const noticeOriginId = String(raw.noticeOriginId || "").trim();
  const noticeOriginName = normalizeWhitespace(raw.noticeOriginName).slice(0, 120);
  const noticeSenderId = String(raw.noticeSenderId || "").trim();
  const noticeSenderName = normalizeWhitespace(raw.noticeSenderName).slice(0, 80);
  const noticeThreadKey = normalizeWhitespace(raw.noticeThreadKey || "").slice(0, 120);
  const noticeBatchId = String(raw.noticeBatchId || "").trim();
  const hiddenForUserIds = Array.isArray(raw.hiddenForUserIds)
    ? [...new Set(raw.hiddenForUserIds.map((value) => String(value || "").trim()).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b),
      )
    : [];
  return {
    id: String(raw.id || crypto.randomUUID()),
    type: CONVERSATION_TYPE_VALUES.has(type) ? type : "direct",
    memberIds,
    ownerUserId: String(raw.ownerUserId || memberIds[0] || ""),
    adminIds,
    mutedMemberIds,
    name: normalizeWhitespace(raw.name).slice(0, 72),
    bio: normalizeWhitespace(raw.bio).slice(0, 180),
    permissions,
    avatarUploadId: String(raw.avatarUploadId || ""),
    inviteToken: inviteToken || "",
    inviteTokenCreatedAt,
    noticeTitle,
    noticeSubtitle,
    noticeBody,
    noticeAvatarUploadId,
    noticeOriginType,
    noticeOriginId,
    noticeOriginName,
    noticeSenderId,
    noticeSenderName,
    noticeThreadKey,
    noticeBatchId,
    hiddenForUserIds,
    lastMessageId: String(raw.lastMessageId || ""),
    lastMessageAt: String(raw.lastMessageAt || createdAt),
    createdAt,
    updatedAt: String(raw.updatedAt || createdAt),
  };
}

function normalizeGroupPermissions(raw = {}) {
  return {
    membersCanEditSettings: Boolean(raw?.membersCanEditSettings),
    membersCanSendMessages: raw?.membersCanSendMessages !== false,
    membersCanAddMembers: raw?.membersCanAddMembers !== false,
    membersCanInviteByLink: raw?.membersCanInviteByLink !== false,
    adminsMustApproveNewMembers: Boolean(raw?.adminsMustApproveNewMembers),
  };
}

function getAdminNoticeThreadKeyFromConversation(conversation = {}) {
  const normalized = normalizeConversation(conversation);
  const explicitKey = normalizeWhitespace(normalized.noticeThreadKey || "");
  if (explicitKey) return explicitKey;
  const originType = normalizeWhitespace(normalized.noticeOriginType || "").toLowerCase();
  const originId = String(normalized.noticeOriginId || "").trim();
  if (originType === "broadcast" || originId === "all-users") return "broadcast";
  if (originType && originId) return `notice:${originType}:${originId}`;
  if (normalized.noticeSenderId === ADMIN_NOTICE_SENDER_ID) return `notice:${normalized.id}`;
  return `notice:${normalized.id}`;
}

function getAdminNoticeThreadTitle(conversation = {}) {
  const normalized = normalizeConversation(conversation);
  const threadKey = getAdminNoticeThreadKeyFromConversation(normalized);
  if (threadKey === "broadcast") return "Announcement";
  const originType = normalizeWhitespace(normalized.noticeOriginType || "").toLowerCase();
  const originName = normalizeWhitespace(normalized.noticeOriginName || "").slice(0, 120);
  if ((originType === "user" || originType === "group" || originType === "report") && originName) {
    return originName;
  }
  const title = normalizeWhitespace(normalized.noticeTitle || "").slice(0, 72);
  if (title) return title;
  if (originName) return originName;
  if (originType === "report") return "Warning";
  if (originType === "group") return "Group notice";
  if (originType === "user") return "User notice";
  return "Admin Notice";
}

function getAdminNoticeThreadSubtitle(conversation = {}) {
  const normalized = normalizeConversation(conversation);
  const originType = normalizeWhitespace(normalized.noticeOriginType || "").toLowerCase();
  const originName = normalizeWhitespace(normalized.noticeOriginName || "").slice(0, 120);
  const recipient = normalized.memberIds?.length === 1 ? normalized.memberIds[0] : "";
  if (originType === "broadcast" || normalizeWhitespace(normalized.noticeThreadKey || "") === "broadcast") {
    return "Broadcast to everyone";
  }
  if (originType === "report") {
    return originName ? `Warning for ${originName}` : "Warning notice";
  }
  if (originType === "group") {
    return originName ? `Group: ${originName}` : "Group notice";
  }
  if (originType === "user") {
    return originName ? `User: ${originName}` : "User notice";
  }
  return recipient ? `To ${recipient}` : "Admin notice";
}

function buildAdminNoticeThreadKey(originType = "", originId = "") {
  const safeOriginType = normalizeWhitespace(originType).toLowerCase();
  const safeOriginId = normalizeWhitespace(originId);
  if (safeOriginType === "broadcast" || safeOriginId === "all-users") {
    return "broadcast";
  }
  if (!safeOriginType || !safeOriginId) {
    return "";
  }
  return `notice:${safeOriginType}:${safeOriginId}`;
}

function parseAdminNoticeThreadKey(threadKey = "") {
  const safeThreadKey = normalizeWhitespace(threadKey);
  if (!safeThreadKey) return null;
  if (safeThreadKey === "broadcast") {
    return {
      threadKey: "broadcast",
      originType: "broadcast",
      originId: "all-users",
    };
  }
  const match = safeThreadKey.match(/^notice:([^:]+):(.+)$/i);
  if (!match) return null;
  return {
    threadKey: safeThreadKey,
    originType: normalizeWhitespace(match[1]).toLowerCase(),
    originId: normalizeWhitespace(match[2]),
  };
}

function getAdminNoticeThreadKeyFromMessage(message = {}, conversation = {}) {
  const explicitKey = normalizeWhitespace(message.noticeThreadKey || "");
  if (explicitKey) return explicitKey;
  const conversationKey = normalizeWhitespace(conversation.noticeThreadKey || "");
  if (conversationKey) return conversationKey;
  return getAdminNoticeThreadKeyFromConversation(conversation);
}

function getAdminNoticeThreadBatchIdFromMessage(message = {}, conversation = {}) {
  const explicitBatchId = String(message.noticeBatchId || "").trim();
  if (explicitBatchId) return explicitBatchId;
  const conversationBatchId = String(conversation.noticeBatchId || "").trim();
  if (conversationBatchId) return conversationBatchId;
  return String(message.id || crypto.randomUUID()).trim();
}

function resolveAdminNoticeAttachment(message = {}, uploads = []) {
  const attachment = message?.attachment && typeof message.attachment === "object" ? message.attachment : null;
  if (!attachment) return null;
  const upload = uploads.find((entry) => entry.id === attachment.uploadId) || null;
  return {
    ...attachment,
    upload: upload ? resolveUploadPublicView(upload) : null,
    dataUrl: upload ? resolveUploadPublicView(upload).dataUrl : "",
  };
}

function buildAdminNoticeMessagePayload(message = {}, { uploads = [] } = {}) {
  const normalized = sanitizeDeletedCommunityMessage(normalizeMessage(message));
  return {
    id: normalized.id,
    conversationId: normalized.conversationId,
    senderUserId: normalized.senderUserId,
    senderName: normalizeWhitespace(normalized.senderName || ADMIN_NOTICE_SENDER_NAME).slice(0, 80) || ADMIN_NOTICE_SENDER_NAME,
    text: normalized.text,
    type: normalized.type,
    attachment: resolveAdminNoticeAttachment(normalized, uploads),
    replyTo: normalized.replyTo,
    deliveredAt: normalized.deliveredAt,
    readAt: normalized.readAt,
    seenByUserIds: Array.isArray(normalized.seenByUserIds) ? [...normalized.seenByUserIds] : [],
    editedAt: normalized.editedAt,
    deletedAt: normalized.deletedAt,
    deletedForUserIds: Array.isArray(normalized.deletedForUserIds) ? [...normalized.deletedForUserIds] : [],
    hiddenForUserIds: Array.isArray(normalized.hiddenForUserIds) ? [...normalized.hiddenForUserIds] : [],
    noticeThreadKey: normalizeWhitespace(normalized.noticeThreadKey || ""),
    noticeBatchId: String(normalized.noticeBatchId || "").trim(),
    createdAt: normalized.createdAt,
    updatedAt: normalized.updatedAt,
    isDeletedForEveryone: Boolean(normalized.deletedAt),
  };
}

function buildAdminBroadcastThreadCollections({
  conversations = [],
  messages = [],
  uploads = [],
  broadcastMessages = [],
  broadcastRecipientCount = 0,
  reports = [],
} = {}) {
  const normalizedConversations = Array.isArray(conversations)
    ? conversations.map((conversation) => normalizeConversation(conversation))
    : [];
  const normalizedReports = Array.isArray(reports)
    ? reports.map((report) => normalizeAdminReport(report))
    : [];
  const existingThreadKeys = new Set(
    normalizedConversations
      .map((conversation) => getAdminNoticeThreadKeyFromConversation(conversation))
      .filter(Boolean),
  );
  const syntheticNoticeConversations = [];
  const syntheticNoticeMessages = [];
  normalizedReports.forEach((report) => {
    const warningMessage = normalizeWhitespace(report.warningMessage || "");
    if (!warningMessage) return;
    const threadKey = buildAdminNoticeThreadKey("report", report.id);
    if (!threadKey || existingThreadKeys.has(threadKey)) return;
    const createdAt = String(report.warningIssuedAt || report.updatedAt || report.createdAt || new Date().toISOString());
    const conversationId = `__admin_notice_report_${report.id}`;
    const targetLabel = normalizeWhitespace(report.targetName || report.targetUsername || report.targetId || "").slice(0, 120);
    const warningPreset = normalizeWhitespace(report.warningPreset || "Community rules reminder") || "Community rules reminder";
    syntheticNoticeConversations.push({
      id: conversationId,
      type: "notice",
      memberIds: [String(report.targetId || "").trim()].filter(Boolean),
      ownerUserId: ADMIN_NOTICE_SENDER_ID,
      adminIds: [],
      lastMessageId: `__admin_notice_report_message_${report.id}`,
      lastMessageAt: createdAt,
      updatedAt: createdAt,
      createdAt,
      noticeTitle: warningPreset,
      noticeSubtitle:
        report.type === "group"
          ? `Report warning for group ${targetLabel || "this group"}`
          : `Report warning for ${targetLabel || "this account"}`,
      noticeBody: warningMessage,
      noticeOriginType: "report",
      noticeOriginId: report.id,
      noticeOriginName: targetLabel,
      noticeSenderId: ADMIN_NOTICE_SENDER_ID,
      noticeSenderName: ADMIN_NOTICE_SENDER_NAME,
      noticeThreadKey: threadKey,
      noticeBatchId: String(report.warningIssuedAt || report.updatedAt || report.createdAt || report.id || ""),
    });
    syntheticNoticeMessages.push({
      id: `__admin_notice_report_message_${report.id}`,
      conversationId,
      senderUserId: ADMIN_NOTICE_SENDER_ID,
      senderName: ADMIN_NOTICE_SENDER_NAME,
      text: warningMessage,
      type: "text",
      attachment: null,
      replyTo: null,
      deliveredAt: createdAt,
      readAt: "",
      seenByUserIds: [],
      editedAt: "",
      deletedAt: "",
      deletedForUserIds: [],
      hiddenForUserIds: [],
      noticeThreadKey: threadKey,
      noticeBatchId: String(report.warningIssuedAt || report.updatedAt || report.createdAt || report.id || ""),
      createdAt,
      updatedAt: createdAt,
    });
    existingThreadKeys.add(threadKey);
  });
  const conversationById = new Map(
    [...normalizedConversations, ...syntheticNoticeConversations].map((conversation) => {
      return [conversation.id, conversation];
    }),
  );
  const threads = new Map();
  const archivedBroadcastMessages = Array.isArray(broadcastMessages)
    ? broadcastMessages.map(normalizeAdminBroadcastMessage)
    : [];
  const normalizedMessages = [
    ...(Array.isArray(messages) ? messages : []),
    ...syntheticNoticeMessages,
  ].map(normalizeMessage);
  const fallbackBroadcastMessages = normalizedMessages
    .filter(
      (message) =>
        getAdminNoticeThreadKeyFromMessage(message, conversationById.get(message.conversationId) || {}) ===
        ADMIN_BROADCAST_THREAD_KEY,
    )
    .map(normalizeAdminBroadcastMessage);
  const normalizedBroadcastMessages = archivedBroadcastMessages.length
    ? archivedBroadcastMessages
    : [...new Map(fallbackBroadcastMessages.map((message) => [message.noticeBatchId || message.id, message])).values()];

  const thread = {
    threadKey: ADMIN_BROADCAST_THREAD_KEY,
    conversationIds: new Set([ADMIN_BROADCAST_CONVERSATION_ID]),
    recipientIds: new Set(),
    batchMap: new Map(),
    latestAt: "",
    latestConversationId: ADMIN_BROADCAST_CONVERSATION_ID,
    broadcastMessages: normalizedBroadcastMessages,
  };
  normalizedBroadcastMessages.forEach((message) => {
    const batchId = getAdminNoticeThreadBatchIdFromMessage(message, {
      noticeThreadKey: ADMIN_BROADCAST_THREAD_KEY,
      noticeBatchId: message.noticeBatchId,
    });
    const batch = thread.batchMap.get(batchId) || {
      id: batchId,
      messageIds: new Set(),
      conversationIds: new Set([ADMIN_BROADCAST_CONVERSATION_ID]),
      latestAt: "",
      firstAt: "",
    };
    batch.messageIds.add(message.id);
    batch.conversationIds.add(ADMIN_BROADCAST_CONVERSATION_ID);
    batch.latestAt = [batch.latestAt, message.createdAt].filter(Boolean).sort().slice(-1)[0] || message.createdAt;
    batch.firstAt = batch.firstAt ? [batch.firstAt, message.createdAt].filter(Boolean).sort()[0] : message.createdAt;
    thread.batchMap.set(batchId, batch);
    if (!thread.latestAt || String(message.createdAt || "").localeCompare(String(thread.latestAt || "")) > 0) {
      thread.latestAt = message.createdAt;
    }
  });
  threads.set(ADMIN_BROADCAST_THREAD_KEY, thread);

  normalizedMessages
    .filter((message) => {
      const conversation = conversationById.get(message.conversationId);
      return conversation && conversation.type === "notice";
    })
    .filter((message) => getAdminNoticeThreadKeyFromMessage(message, conversationById.get(message.conversationId) || {}) !== ADMIN_BROADCAST_THREAD_KEY)
    .forEach((message) => {
      const conversation = conversationById.get(message.conversationId) || {};
      const threadKey = getAdminNoticeThreadKeyFromMessage(message, conversation);
      if (!threadKey) return;
      const thread = threads.get(threadKey) || {
        threadKey,
        conversationIds: new Set(),
        recipientIds: new Set(),
        batchMap: new Map(),
        latestAt: "",
        latestConversationId: "",
      };
      thread.conversationIds.add(message.conversationId);
      const conversationMemberId = Array.isArray(conversation.memberIds) ? conversation.memberIds[0] : "";
      if (conversationMemberId) {
        thread.recipientIds.add(conversationMemberId);
      }
      const batchId = getAdminNoticeThreadBatchIdFromMessage(message, conversation);
      const batch = thread.batchMap.get(batchId) || {
        id: batchId,
        messageIds: new Set(),
        conversationIds: new Set(),
        latestAt: "",
        firstAt: "",
      };
      batch.messageIds.add(message.id);
      batch.conversationIds.add(message.conversationId);
      batch.latestAt = [batch.latestAt, message.createdAt].filter(Boolean).sort().slice(-1)[0] || message.createdAt;
      batch.firstAt = batch.firstAt ? [batch.firstAt, message.createdAt].filter(Boolean).sort()[0] : message.createdAt;
      thread.batchMap.set(batchId, batch);
      if (!thread.latestAt || String(message.createdAt || "").localeCompare(String(thread.latestAt || "")) > 0) {
        thread.latestAt = message.createdAt;
        thread.latestConversationId = message.conversationId;
      }
      threads.set(threadKey, thread);
    });

  const sortThreads = (a, b) => {
    if (a.threadKey === "broadcast" && b.threadKey !== "broadcast") return -1;
    if (b.threadKey === "broadcast" && a.threadKey !== "broadcast") return 1;
    return String(b.latestAt || "").localeCompare(String(a.latestAt || ""));
  };

  const renderedThreads = [...threads.values()]
    .map((thread) => {
      const batches = [...thread.batchMap.values()]
        .map((batch) => {
          const sourceMessages =
            thread.threadKey === ADMIN_BROADCAST_THREAD_KEY
              ? normalizedBroadcastMessages
              : normalizedMessages;
          const batchMessages = [...batch.messageIds]
            .map((messageId) => sourceMessages.find((entry) => String(entry.id || "") === String(messageId)) || null)
            .filter(Boolean)
            .sort((a, b) => String(a.createdAt || "").localeCompare(String(b.createdAt || "")));
          const representativeMessage = batchMessages[batchMessages.length - 1] || batchMessages[0] || null;
          const representativeConversation = batch.conversationIds.size
            ? conversationById.get([...batch.conversationIds][batch.conversationIds.size - 1] || "")
            : conversationById.get(thread.latestConversationId) || null;
          const attachment = representativeMessage
            ? resolveAdminNoticeAttachment(representativeMessage, uploads)
            : null;
          return {
            id: batch.id,
            createdAt: representativeMessage?.createdAt || batch.latestAt || batch.firstAt || "",
            latestAt: batch.latestAt || representativeMessage?.createdAt || batch.firstAt || "",
            senderUserId: representativeMessage?.senderUserId || ADMIN_NOTICE_SENDER_ID,
            senderName: normalizeWhitespace(representativeMessage?.senderName || ADMIN_NOTICE_SENDER_NAME).slice(0, 80) || ADMIN_NOTICE_SENDER_NAME,
            text: representativeMessage?.text || "",
            type: representativeMessage?.type || "text",
            attachment,
            conversationIds: [...batch.conversationIds],
            recipientCount: batch.conversationIds.size,
            noticeThreadKey: thread.threadKey,
            noticeBatchId: batch.id,
            replyTo: representativeMessage?.replyTo || null,
            representativeConversationId: representativeConversation?.id || "",
          };
        })
        .sort((a, b) => String(b.latestAt || "").localeCompare(String(a.latestAt || "")));
      const latestBatch = batches[0] || null;
      const latestConversation = thread.threadKey === ADMIN_BROADCAST_THREAD_KEY
        ? null
        : latestBatch?.representativeConversationId
        ? conversationById.get(latestBatch.representativeConversationId)
        : thread.latestConversationId
          ? conversationById.get(thread.latestConversationId)
          : null;
      const recipientCount = thread.threadKey === ADMIN_BROADCAST_THREAD_KEY ? broadcastRecipientCount : thread.recipientIds.size;
      const title = thread.threadKey === ADMIN_BROADCAST_THREAD_KEY
        ? "Announcement"
        : latestConversation
          ? getAdminNoticeThreadTitle(latestConversation)
          : getAdminNoticeThreadTitle({ noticeThreadKey: thread.threadKey });
      const subtitle = thread.threadKey === ADMIN_BROADCAST_THREAD_KEY
        ? "Broadcast to everyone"
        : latestConversation
          ? getAdminNoticeThreadSubtitle(latestConversation)
          : getAdminNoticeThreadSubtitle({ noticeThreadKey: thread.threadKey });
      return {
        threadKey: thread.threadKey,
        title,
        subtitle,
        originType: thread.threadKey === ADMIN_BROADCAST_THREAD_KEY
          ? "broadcast"
          : normalizeWhitespace(latestConversation?.noticeOriginType || parseAdminNoticeThreadKey(thread.threadKey)?.originType || "").toLowerCase(),
        originId: thread.threadKey === ADMIN_BROADCAST_THREAD_KEY
          ? "all-users"
          : normalizeWhitespace(latestConversation?.noticeOriginId || parseAdminNoticeThreadKey(thread.threadKey)?.originId || ""),
        originName: thread.threadKey === ADMIN_BROADCAST_THREAD_KEY
          ? "All users"
          : normalizeWhitespace(latestConversation?.noticeOriginName || "").slice(0, 120),
        latestAt: latestBatch?.latestAt || thread.latestAt || "",
        recipientCount,
        batchCount: batches.length,
        previewText: latestBatch?.text || latestBatch?.attachment?.fileName || latestBatch?.attachment?.kind || (
          thread.threadKey === ADMIN_BROADCAST_THREAD_KEY ? "Broadcast to everyone" : ""
        ),
        lastMessage: latestBatch,
        batches,
      };
    })
    .sort(sortThreads);

  return renderedThreads;
}

function buildAdminBroadcastThreadDetail(threadKey = "", collections = {}) {
  const safeThreadKey = normalizeWhitespace(threadKey || "");
  const threads = buildAdminBroadcastThreadCollections(collections);
  const thread = threads.find((entry) => entry.threadKey === safeThreadKey) || null;
  if (!thread) return null;
  return thread;
}

function buildAdminBroadcastCommunityConversationView({
  viewerId = "",
  broadcastMessages = [],
  uploads = [],
} = {}) {
  const safeViewerId = String(viewerId || "").trim();
  const normalizedBroadcastMessages = Array.isArray(broadcastMessages)
    ? broadcastMessages.map(normalizeAdminBroadcastMessage)
    : [];
  if (!normalizedBroadcastMessages.length) return null;

  const lastMessage = normalizedBroadcastMessages
    .slice()
    .sort((a, b) => String(a.createdAt || "").localeCompare(String(b.createdAt || "")))
    .at(-1) || null;
  const unreadCount = normalizedBroadcastMessages.filter(
    (message) =>
      message.senderUserId !== safeViewerId &&
      !hasMessageBeenSeenByUser(message, safeViewerId) &&
      !message.deletedForUserIds?.includes(safeViewerId) &&
      !message.hiddenForUserIds?.includes(safeViewerId),
  ).length;
  const conversation = {
    id: ADMIN_BROADCAST_CONVERSATION_ID,
    type: "notice",
    memberIds: [safeViewerId],
    ownerUserId: ADMIN_NOTICE_SENDER_ID,
    adminIds: [],
    lastMessageId: lastMessage?.id || "",
    lastMessageAt: lastMessage?.createdAt || "",
    updatedAt: lastMessage?.createdAt || "",
    createdAt: normalizedBroadcastMessages[0]?.createdAt || "",
    noticeTitle: "Announcement",
    noticeSubtitle: "Broadcast to everyone",
    noticeBody: "",
    noticeOriginType: "broadcast",
    noticeOriginId: "all-users",
    noticeOriginName: "All users",
    noticeSenderId: ADMIN_NOTICE_SENDER_ID,
    noticeSenderName: ADMIN_NOTICE_SENDER_NAME,
  };

  return {
    id: ADMIN_BROADCAST_CONVERSATION_ID,
    updatedAt: lastMessage?.createdAt || "",
    unreadCount,
    isFavorite: false,
    partner: getConversationDisplayPayload(conversation, {
      viewerId: safeViewerId,
      uploads,
    }),
    lastMessage: buildConversationLastMessagePayload(lastMessage),
    conversation,
    messages: normalizedBroadcastMessages,
  };
}

function ensureConversationInviteToken(conversation = {}) {
  const normalized = normalizeConversation(conversation);
  const inviteToken = String(normalized.inviteToken || "").trim();
  if (inviteToken && !isConversationInviteExpired(normalized)) {
    return {
      ...normalized,
      inviteToken,
      inviteTokenCreatedAt: normalized.inviteTokenCreatedAt || normalized.createdAt || new Date().toISOString(),
    };
  }
  return {
    ...normalized,
    inviteToken: crypto.randomUUID().replace(/-/g, ""),
    inviteTokenCreatedAt: new Date().toISOString(),
  };
}

function getConversationInviteCreatedAt(conversation = {}) {
  const normalized = normalizeConversation(conversation);
  const raw = String(normalized.inviteTokenCreatedAt || normalized.createdAt || "").trim();
  const createdAt = Date.parse(raw);
  return Number.isFinite(createdAt) ? createdAt : 0;
}

function getConversationInviteExpiresAt(conversation = {}) {
  const createdAt = getConversationInviteCreatedAt(conversation);
  if (!createdAt) return "";
  return new Date(createdAt + COMMUNITY_GROUP_INVITE_TTL_MS).toISOString();
}

function isConversationInviteExpired(conversation = {}, now = Date.now()) {
  const normalized = normalizeConversation(conversation);
  const token = String(normalized.inviteToken || "").trim();
  if (!token) return true;
  const createdAt = getConversationInviteCreatedAt(normalized);
  if (!createdAt) return true;
  return now - createdAt >= COMMUNITY_GROUP_INVITE_TTL_MS;
}

function buildCommunityGroupInviteUrl(inviteToken = "", groupId = "") {
  const token = String(inviteToken || "").trim();
  const id = String(groupId || "").trim();
  if (!token || !id) return "";
  const params = new URLSearchParams();
  params.set("groupInvite", id);
  params.set("groupToken", token);
  const pathname = typeof window !== "undefined" && window.location?.pathname
    ? window.location.pathname
    : "/index.html";
  return `${pathname}?${params.toString()}`;
}

function getConversationMemberSet(conversation = {}) {
  return new Set((Array.isArray(conversation?.memberIds) ? conversation.memberIds : []).map((value) => String(value || "").trim()).filter(Boolean));
}

function getNextGroupOwnerId(conversation = {}, excludeUserId = "") {
  const excluded = String(excludeUserId || "").trim();
  const memberIds = Array.isArray(conversation?.memberIds)
    ? conversation.memberIds.map((value) => String(value || "").trim()).filter(Boolean)
    : [];
  const adminIds = Array.isArray(conversation?.adminIds)
    ? conversation.adminIds.map((value) => String(value || "").trim()).filter(Boolean)
    : [];
  const candidates = [...new Set([...adminIds, ...memberIds])].filter((value) => value !== excluded);
  return candidates[0] || "";
}

function normalizeUpload(raw = {}) {
  const createdAt = String(raw.createdAt || new Date().toISOString());
  const kind = String(raw.kind || "chat-image").trim().toLowerCase();
  const fileName = normalizeWhitespace(raw.fileName || raw.newFileName).slice(0, 180);
  const originalName = normalizeWhitespace(raw.originalName || "").slice(0, 180);
  const fileType = ["image", "video", "document"].includes(String(raw.fileType || "").trim().toLowerCase())
    ? String(raw.fileType || "").trim().toLowerCase()
    : "";
  const storageFolder = String(raw.storageFolder || "").trim().replace(/^\/+|\/+$/g, "");
  const extension = String(raw.extension || path.extname(fileName || "")).trim().toLowerCase().replace(/[^a-z0-9.]/g, "");
  const fileHash = String(raw.fileHash || "").trim().toLowerCase();
  return {
    id: String(raw.id || crypto.randomUUID()),
    ownerUserId: String(raw.ownerUserId || ""),
    userId: String(raw.userId || raw.ownerUserId || ""),
    kind: UPLOAD_KIND_VALUES.has(kind) ? kind : "chat-image",
    mimeType: String(raw.mimeType || "").trim().toLowerCase(),
    bytes: Math.max(0, Math.round(Number(raw.bytes) || 0)),
    size: Math.max(0, Math.round(Number(raw.size ?? raw.bytes) || 0)),
    fileName,
    originalName,
    newFileName: fileName,
    fileType,
    extension,
    storageFolder,
    fileHash,
    dataUrl: String(raw.dataUrl || "").trim(),
    remoteUrl: String(raw.remoteUrl || "").trim(),
    storageProvider: String(raw.storageProvider || "").trim().toLowerCase(),
    storageId: String(raw.storageId || "").trim(),
    storageResourceType: String(raw.storageResourceType || "").trim().toLowerCase(),
    storageVersion: String(raw.storageVersion || "").trim(),
    createdAt,
    uploadDate: String(raw.uploadDate || createdAt),
    updatedAt: String(raw.updatedAt || createdAt),
  };
}

function normalizeStatus(raw = {}) {
  const createdAt = String(raw.createdAt || new Date().toISOString());
  const expiresAt = String(raw.expiresAt || new Date(Date.parse(createdAt) + STATUS_TTL_MS).toISOString());
  const visibility = String(raw.visibility || "friends").trim().toLowerCase();
  const type = String(raw.type || (raw.uploadId ? "image" : "text")).trim().toLowerCase();
  const imageFit = String(raw.imageFit || "contain").trim().toLowerCase();
  const imageFilter = String(raw.imageFilter || "none").trim().toLowerCase();
  const imageRotate = Number(raw.imageRotate || 0) || 0;
  const textColor = String(raw.textColor || "#ffffff").trim().slice(0, 24);
  const textStyle = String(raw.textStyle || "default").trim().toLowerCase();
  const textAlign = String(raw.textAlign || "center").trim().toLowerCase();
  const textScale = Number(raw.textScale || 1) || 1;
  const textX = Number(raw.textX || 0.5) || 0.5;
  const textY = Number(raw.textY || 0.5) || 0.5;
  const textBold = raw.textBold === true || String(raw.textBold || "").trim().toLowerCase() === "true" || Number(raw.textBold || 0) === 1;
  const textItalic = raw.textItalic === true || String(raw.textItalic || "").trim().toLowerCase() === "true" || Number(raw.textItalic || 0) === 1;
  const textUnderline = raw.textUnderline === true || String(raw.textUnderline || "").trim().toLowerCase() === "true" || Number(raw.textUnderline || 0) === 1;
  const durationSeconds = Math.max(1, Math.min(30, Number(raw.durationSeconds || 30) || 30));
  const videoTrimStart = Math.max(0, Math.min(86_400, Number(raw.videoTrimStart || 0) || 0));
  const rawVideoTrimEnd = Number(raw.videoTrimEnd);
  const videoTrimEnd = Math.max(
    videoTrimStart + 1,
    Math.min(86_400, Number.isFinite(rawVideoTrimEnd) ? rawVideoTrimEnd : (videoTrimStart + durationSeconds)),
  );
  const videoTrimSpan = Math.max(1, Math.min(30, videoTrimEnd - videoTrimStart));
  return {
    id: String(raw.id || crypto.randomUUID()),
    ownerUserId: String(raw.ownerUserId || ""),
    uploadId: String(raw.uploadId || ""),
    type: ["text", "image", "video"].includes(type) ? type : "image",
    text: normalizeWhitespace(raw.text).slice(0, 280),
    background: String(raw.background || "#2f80d0").trim().slice(0, 160),
    textColor,
    textStyle: ["default", "serif", "mono", "hand"].includes(textStyle) ? textStyle : "default",
    textAlign: ["left", "center", "right"].includes(textAlign) ? textAlign : "center",
    textScale: Math.max(0.8, Math.min(2.4, textScale)),
    textX: Math.max(0.12, Math.min(0.88, textX)),
    textY: Math.max(0.18, Math.min(0.82, textY)),
    textBold,
    textItalic,
    textUnderline,
    imageFit: ["contain", "cover"].includes(imageFit) ? imageFit : "contain",
    imageFilter: ["none", "warm", "cool", "mono", "contrast"].includes(imageFilter) ? imageFilter : "none",
    imageRotate: [0, 90, 180, 270].includes((((Math.round(imageRotate / 90) * 90) % 360) + 360) % 360)
      ? ((((Math.round(imageRotate / 90) * 90) % 360) + 360) % 360)
      : 0,
    videoTrimStart,
    videoTrimEnd: videoTrimStart + videoTrimSpan,
    caption: normalizeWhitespace(raw.caption).slice(0, 140),
    durationSeconds: videoTrimSpan,
    visibility: STATUS_VISIBILITY_VALUES.has(visibility) ? visibility : "friends",
    allowReplies: raw?.allowReplies !== false,
    isAdminBroadcast: raw?.isAdminBroadcast === true || String(raw?.isAdminBroadcast || "").trim().toLowerCase() === "true",
    viewers: normalizeStatusActorEntries(raw.viewers, createdAt),
    likes: normalizeStatusActorEntries(raw.likes, createdAt),
    createdAt,
    expiresAt,
    updatedAt: String(raw.updatedAt || createdAt),
  };
}

function buildAdminBroadcastStatusOwnerView() {
  return {
    id: ADMIN_NOTICE_SENDER_ID,
    title: ADMIN_BROADCAST_STATUS_TITLE,
    name: ADMIN_BROADCAST_STATUS_TITLE,
    displayName: ADMIN_BROADCAST_STATUS_TITLE,
    username: "",
    profileImage: ADMIN_NOTICE_PROFILE_IMAGE,
    institution: "Admin broadcast",
    country: "",
    professionalType: "Admin broadcast",
    bio: "Messages from the admin team",
    contact: "",
    points: 0,
    privacy: {},
    lastSeenAt: "",
    onlineNow: false,
    isGroup: false,
    isNotice: false,
    isReadOnly: true,
    ownerUserId: ADMIN_NOTICE_SENDER_ID,
  };
}

function normalizeStatusActorEntries(rawEntries = [], fallbackAt = new Date().toISOString()) {
  if (!Array.isArray(rawEntries)) return [];
  const seen = new Map();
  rawEntries.forEach((entry) => {
    if (typeof entry === "string") {
      const userId = String(entry || "").trim();
      if (!userId) return;
      seen.set(userId, { userId, at: String(fallbackAt || new Date().toISOString()) });
      return;
    }
    if (!entry || typeof entry !== "object") return;
    const userId = String(entry.userId || entry.id || "").trim();
    if (!userId) return;
    seen.set(userId, {
      userId,
      at: String(entry.at || entry.createdAt || fallbackAt || new Date().toISOString()),
    });
  });
  return [...seen.values()].sort((a, b) => String(a.at || "").localeCompare(String(b.at || "")));
}

function statusActorIds(entries = []) {
  return Array.isArray(entries) ? entries.map((entry) => String(entry?.userId || "").trim()).filter(Boolean) : [];
}

function hasStatusActor(entries = [], userId = "") {
  const targetId = String(userId || "").trim();
  if (!targetId) return false;
  return Array.isArray(entries) && entries.some((entry) => String(entry?.userId || "").trim() === targetId);
}

function addStatusActor(entries = [], userId = "", at = new Date().toISOString()) {
  const targetId = String(userId || "").trim();
  if (!targetId) return normalizeStatusActorEntries(entries, at);
  const normalized = normalizeStatusActorEntries(entries, at);
  if (hasStatusActor(normalized, targetId)) return normalized;
  return normalizeStatusActorEntries([...normalized, { userId: targetId, at }], at);
}

function removeStatusActor(entries = [], userId = "", at = new Date().toISOString()) {
  const targetId = String(userId || "").trim();
  if (!targetId) return normalizeStatusActorEntries(entries, at);
  return normalizeStatusActorEntries(
    normalizeStatusActorEntries(entries, at).filter((entry) => String(entry?.userId || "").trim() !== targetId),
    at,
  );
}

function normalizeMessage(raw = {}) {
  const createdAt = String(raw.createdAt || new Date().toISOString());
  const type = String(raw.type || "text").trim().toLowerCase();
  return {
    id: String(raw.id || crypto.randomUUID()),
    conversationId: String(raw.conversationId || ""),
    senderUserId: String(raw.senderUserId || ""),
    senderName: normalizeWhitespace(raw.senderName || raw.senderDisplayName || raw.senderLabel || "").slice(0, 80),
    type: MESSAGE_TYPE_VALUES.has(type) ? type : "text",
    text: String(raw.text || "").trim(),
    attachment: raw.attachment && typeof raw.attachment === "object" ? raw.attachment : null,
    call: normalizeMessageCall(raw.call),
    replyTo: normalizeMessageReply(raw.replyTo),
    deliveredAt: raw.deliveredAt ? String(raw.deliveredAt) : null,
    readAt: raw.readAt ? String(raw.readAt) : null,
    seenByUserIds: Array.isArray(raw.seenByUserIds)
      ? [...new Set(raw.seenByUserIds.map((value) => String(value || "").trim()).filter(Boolean))]
      : [],
    editedAt: raw.editedAt ? String(raw.editedAt) : null,
    deletedAt: raw.deletedAt ? String(raw.deletedAt) : null,
    deletedForUserIds: Array.isArray(raw.deletedForUserIds)
      ? [...new Set(raw.deletedForUserIds.map((value) => String(value || "").trim()).filter(Boolean))]
      : [],
    hiddenForUserIds: Array.isArray(raw.hiddenForUserIds)
      ? [...new Set(raw.hiddenForUserIds.map((value) => String(value || "").trim()).filter(Boolean))]
      : [],
    noticeThreadKey: normalizeWhitespace(raw.noticeThreadKey || "").slice(0, 120),
    noticeBatchId: String(raw.noticeBatchId || "").trim(),
    createdAt,
    updatedAt: String(raw.updatedAt || createdAt),
  };
}

function normalizeAdminBroadcastMessage(raw = {}) {
  const normalized = normalizeMessage({
    ...raw,
    conversationId: ADMIN_BROADCAST_CONVERSATION_ID,
    senderUserId: raw.senderUserId || ADMIN_NOTICE_SENDER_ID,
    senderName: raw.senderName || ADMIN_NOTICE_SENDER_NAME,
    noticeThreadKey: ADMIN_BROADCAST_THREAD_KEY,
    noticeBatchId: raw.noticeBatchId || "",
  });
  return {
    ...normalized,
    conversationId: ADMIN_BROADCAST_CONVERSATION_ID,
    senderUserId: ADMIN_NOTICE_SENDER_ID,
    senderName: normalizeWhitespace(normalized.senderName || ADMIN_NOTICE_SENDER_NAME).slice(0, 80) || ADMIN_NOTICE_SENDER_NAME,
    noticeThreadKey: ADMIN_BROADCAST_THREAD_KEY,
    noticeBatchId: String(normalized.noticeBatchId || raw.noticeBatchId || "").trim(),
  };
}

function normalizeMessageCall(raw = null) {
  if (!raw || typeof raw !== "object") return null;
  const mode = normalizeCommunityCallMode(raw.mode || "voice");
  const startedAt = String(raw.startedAt || "").trim();
  const answeredAt = String(raw.answeredAt || "").trim();
  const endedAt = String(raw.endedAt || "").trim();
  const startedByUserId = String(raw.startedByUserId || "").trim();
  const answeredByUserId = String(raw.answeredByUserId || "").trim();
  const endedByUserId = String(raw.endedByUserId || "").trim();
  const durationSeconds = Math.max(0, Math.round(Number(raw.durationSeconds) || 0));
  const outcome = String(raw.outcome || "").trim().toLowerCase();
  return {
    mode,
    startedAt,
    answeredAt,
    endedAt,
    startedByUserId,
    answeredByUserId,
    endedByUserId,
    durationSeconds,
    outcome: outcome === "answered" ? "answered" : "missed",
  };
}

function hasMessageBeenSeenByUser(message = {}, userId = "") {
  const safeUserId = String(userId || "").trim();
  if (!safeUserId) return false;
  if (Array.isArray(message?.seenByUserIds) && message.seenByUserIds.includes(safeUserId)) {
    return true;
  }
  return Boolean(message?.readAt);
}

function normalizeMessageReply(raw = null) {
  if (!raw || typeof raw !== "object") return null;
  const type = String(raw.type || "message").trim().toLowerCase();
  return {
    type: type === "status" ? "status" : "message",
    sourceId: String(raw.sourceId || raw.messageId || raw.statusId || "").trim(),
    senderName: normalizeWhitespace(raw.senderName || raw.ownerName || raw.title || "").slice(0, 80),
    text: normalizeWhitespace(raw.text || raw.caption || "").slice(0, 240),
    imageDataUrl: String(raw.imageDataUrl || "").trim().slice(0, 5_000_000),
  };
}

function parseImageDataUrl(value = "") {
  const text = String(value || "").trim();
  const match = text.match(/^data:(image\/[a-z0-9.+-]+);base64,([a-z0-9+/=\s]+)$/i);
  if (!match) return null;
  const mimeType = String(match[1] || "").trim().toLowerCase();
  const base64 = String(match[2] || "").replace(/\s+/g, "");
  if (!ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) return null;
  const buffer = Buffer.from(base64, "base64");
  return {
    mimeType,
    bytes: buffer.byteLength,
    dataUrl: `data:${mimeType};base64,${base64}`,
  };
}

function parseDataUrlByMime(value = "") {
  const text = String(value || "").trim();
  if (!text.toLowerCase().startsWith("data:")) return null;
  const marker = ";base64,";
  const markerIndex = text.toLowerCase().indexOf(marker);
  if (markerIndex <= 5) return null;
  const header = text.slice(5, markerIndex);
  const mimeType = normalizeUploadMimeType(header);
  const base64 = String(text.slice(markerIndex + marker.length) || "").replace(/\s+/g, "");
  if (!mimeType || !base64) return null;
  const buffer = Buffer.from(base64, "base64");
  return {
    mimeType,
    bytes: buffer.byteLength,
    dataUrl: `data:${mimeType};base64,${base64}`,
  };
}

function createUploadFromDataUrl({ ownerUserId = "", kind = "chat-file", fileName = "", dataUrl = "" } = {}) {
  const parsed = parseDataUrlByMime(dataUrl);
  if (!parsed) {
    throw new Error("Unsupported attachment format.");
  }
  let maxBytes = MAX_DOCUMENT_UPLOAD_BYTES;
  if (ALLOWED_IMAGE_MIME_TYPES.has(parsed.mimeType)) {
    maxBytes = MAX_IMAGE_UPLOAD_BYTES;
  } else if (ALLOWED_VIDEO_MIME_TYPES.has(parsed.mimeType)) {
    maxBytes = MAX_VIDEO_UPLOAD_BYTES;
  } else if (ALLOWED_AUDIO_MIME_TYPES.has(parsed.mimeType)) {
    maxBytes = MAX_AUDIO_UPLOAD_BYTES;
  } else if (!ALLOWED_DOCUMENT_MIME_TYPES.has(parsed.mimeType)) {
    throw new Error("Only images, MP4/WEBM/MOV videos, voice notes, PDF, DOC, DOCX, PPT, PPTX, or TXT files are allowed.");
  }
  if (parsed.bytes <= 0 || parsed.bytes > maxBytes) {
    throw new Error(`Attachment must be ${Math.round(maxBytes / (1024 * 1024))}MB or less.`);
  }
  const originalName = normalizeWhitespace(fileName).slice(0, 180);
  const fileType = getUploadFileTypeFromMime(parsed.mimeType);
  const generatedFileName = buildStructuredUploadFileName({ mimeType: parsed.mimeType });
  const uploadDate = new Date().toISOString();
  return normalizeUpload({
    ownerUserId,
    userId: ownerUserId,
    kind,
    mimeType: parsed.mimeType,
    bytes: parsed.bytes,
    size: parsed.bytes,
    fileName: generatedFileName,
    originalName,
    newFileName: generatedFileName,
    fileType,
    extension: getUploadExtensionFromMime(parsed.mimeType),
    storageFolder: buildSupabaseStorageFolderByMime(parsed.mimeType),
    fileHash: createUploadFileHash(Buffer.from(parsed.dataUrl.split(";base64,")[1] || "", "base64")),
    dataUrl: parsed.dataUrl,
    uploadDate,
  });
}

function validateUploadBinary({ mimeType = "", buffer = Buffer.alloc(0) } = {}) {
  const safeMimeType = normalizeUploadMimeType(mimeType);
  const safeBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer || []);
  if (!safeMimeType || !safeBuffer.length) {
    throw new Error("Unsupported attachment format.");
  }
  let maxBytes = MAX_DOCUMENT_UPLOAD_BYTES;
  if (ALLOWED_IMAGE_MIME_TYPES.has(safeMimeType)) {
    maxBytes = MAX_IMAGE_UPLOAD_BYTES;
  } else if (ALLOWED_VIDEO_MIME_TYPES.has(safeMimeType)) {
    maxBytes = MAX_VIDEO_UPLOAD_BYTES;
  } else if (ALLOWED_AUDIO_MIME_TYPES.has(safeMimeType)) {
    maxBytes = MAX_AUDIO_UPLOAD_BYTES;
  } else if (!ALLOWED_DOCUMENT_MIME_TYPES.has(safeMimeType)) {
    throw new Error("Only images, MP4/WEBM/MOV videos, voice notes, PDF, DOC, DOCX, PPT, PPTX, or TXT files are allowed.");
  }
  if (safeBuffer.byteLength <= 0 || safeBuffer.byteLength > maxBytes) {
    throw new Error(`Attachment must be ${Math.round(maxBytes / (1024 * 1024))}MB or less.`);
  }
  return {
    mimeType: safeMimeType,
    buffer: safeBuffer,
  };
}

function isSupabaseStorageConfigured() {
  return Boolean(config.supabaseRealtimeUrl && config.supabaseRealtimeServiceKey && config.supabaseStorageBucket);
}

function getSupabaseStorageResourceTypeForUpload(kind = "", mimeType = "") {
  const safeMimeType = normalizeUploadMimeType(mimeType);
  const safeKind = String(kind || "").trim().toLowerCase();
  if (safeMimeType.startsWith("image/") || safeKind.includes("avatar") || safeKind.includes("image")) {
    return "image";
  }
  if (safeMimeType.startsWith("video/") || safeMimeType.startsWith("audio/") || safeKind.includes("video") || safeKind.includes("audio")) {
    return "video";
  }
  return "raw";
}

function getUploadFileTypeFromMime(mimeType = "") {
  const safeMimeType = normalizeUploadMimeType(mimeType);
  if (safeMimeType.startsWith("image/")) return "image";
  if (safeMimeType.startsWith("video/")) return "video";
  return "document";
}

function getUploadTypePrefix(fileType = "document") {
  const safeType = String(fileType || "document").trim().toLowerCase();
  if (safeType === "image") return "img";
  if (safeType === "video") return "vid";
  return "doc";
}

function buildSupabaseStorageFolderByMime(mimeType = "") {
  const base = String(config.supabaseStorageFolder || "ajix-community").trim().replace(/\/+$/g, "");
  const fileType = getUploadFileTypeFromMime(mimeType);
  const leaf = STRUCTURED_STORAGE_FOLDERS[fileType] || STRUCTURED_STORAGE_FOLDERS.document;
  return base ? `${base}/${leaf}` : leaf;
}

function getUploadExtensionFromMime(mimeType = "") {
  const safeMimeType = normalizeUploadMimeType(mimeType);
  if (safeMimeType === "video/mp4") return ".mp4";
  if (safeMimeType === "video/webm") return ".webm";
  if (safeMimeType === "video/quicktime") return ".mov";
  if (safeMimeType === "image/png") return ".png";
  if (safeMimeType === "image/webp") return ".webp";
  if (safeMimeType === "image/gif") return ".gif";
  if (safeMimeType === "image/jpeg") return ".jpg";
  if (safeMimeType === "audio/webm") return ".webm";
  if (safeMimeType === "audio/ogg") return ".ogg";
  if (safeMimeType === "audio/mp4") return ".m4a";
  if (safeMimeType === "audio/mpeg") return ".mp3";
  if (safeMimeType === "audio/wav" || safeMimeType === "audio/x-wav") return ".wav";
  if (safeMimeType === "application/pdf") return ".pdf";
  if (safeMimeType === "application/msword") return ".doc";
  if (safeMimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return ".docx";
  if (safeMimeType === "application/vnd.ms-powerpoint") return ".ppt";
  if (safeMimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation") return ".pptx";
  if (safeMimeType === "text/plain") return ".txt";
  return ".bin";
}

function inferUploadMimeTypeFromFileName(fileName = "") {
  const safeName = String(fileName || "").trim();
  if (!safeName) return "";
  const extension = path.extname(safeName).trim().toLowerCase();
  if (!extension) return "";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";
  if (extension === ".gif") return "image/gif";
  if (extension === ".mp4") return "video/mp4";
  if (extension === ".webm") return "video/webm";
  if (extension === ".mov" || extension === ".qt") return "video/quicktime";
  if (extension === ".ogg" || extension === ".oga") return "audio/ogg";
  if (extension === ".m4a") return "audio/mp4";
  if (extension === ".mp3") return "audio/mpeg";
  if (extension === ".wav") return "audio/wav";
  if (extension === ".pdf") return "application/pdf";
  if (extension === ".doc") return "application/msword";
  if (extension === ".docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (extension === ".ppt") return "application/vnd.ms-powerpoint";
  if (extension === ".pptx") return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  if (extension === ".txt") return "text/plain";
  return "";
}

function normalizeUploadMimeType(value = "") {
  const safeValue = String(value || "").trim().toLowerCase();
  if (!safeValue) return "";
  const baseMimeType = String(safeValue.split(";")[0] || "").trim();
  if (!baseMimeType) return "";
  return MIME_TYPE_ALIASES[baseMimeType] || baseMimeType;
}

function resolveUploadMimeType(contentType = "", fileName = "") {
  const safeContentType = normalizeUploadMimeType(contentType);
  if (safeContentType && safeContentType !== "application/octet-stream") {
    return safeContentType;
  }
  const inferred = inferUploadMimeTypeFromFileName(fileName);
  if (inferred) return inferred;
  return safeContentType || "application/octet-stream";
}

function buildStructuredUploadFileName({ mimeType = "", now = Date.now() } = {}) {
  const fileType = getUploadFileTypeFromMime(mimeType);
  const prefix = getUploadTypePrefix(fileType);
  const extension = getUploadExtensionFromMime(mimeType);
  const timestamp = Math.max(0, Math.round(Number(now) || Date.now()));
  const randomId = crypto.randomBytes(5).toString("base64url").replace(/[^a-z0-9]/gi, "").toLowerCase().slice(0, 8);
  return `ajix_${prefix}_${timestamp}_${randomId}${extension}`;
}

function createUploadFileHash(buffer = Buffer.alloc(0)) {
  const safeBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer || []);
  return safeBuffer.length ? crypto.createHash("sha256").update(safeBuffer).digest("hex") : "";
}

function getUploadDeviceFolderHint(fileType = "document") {
  const safeType = String(fileType || "document").trim().toLowerCase();
  if (safeType === "image") return "/Pictures/Ajix/";
  if (safeType === "video") return "/Movies/Ajix/";
  return "/Documents/Ajix/";
}

function persistUploadRecord(existingUploads = [], upload = null) {
  const uploads = Array.isArray(existingUploads) ? existingUploads.map(normalizeUpload) : [];
  const safeUpload = upload ? normalizeUpload(upload) : null;
  if (!safeUpload) {
    return { uploads, upload: null, reused: false };
  }
  const match = uploads.find((entry) =>
    String(entry.ownerUserId || "") === String(safeUpload.ownerUserId || "")
    && String(entry.kind || "") === String(safeUpload.kind || "")
    && String(entry.mimeType || "") === String(safeUpload.mimeType || "")
    && Number(entry.bytes || 0) === Number(safeUpload.bytes || 0)
    && String(entry.fileHash || "") !== ""
    && String(entry.fileHash || "") === String(safeUpload.fileHash || ""),
  );
  if (match) {
    return { uploads, upload: match, reused: true };
  }
  uploads.push(safeUpload);
  return { uploads, upload: safeUpload, reused: false };
}

async function uploadBufferToSupabaseStorage({
  ownerUserId = "",
  kind = "chat-file",
  fileName = "upload",
  mimeType = "",
  buffer = Buffer.alloc(0),
} = {}) {
  if (!isSupabaseStorageConfigured()) return null;
  const bucket = String(config.supabaseStorageBucket || "community-media").trim();
  const resourceType = getSupabaseStorageResourceTypeForUpload(kind, mimeType);
  const folder = buildSupabaseStorageFolderByMime(mimeType);
  const safeName = String(fileName || "").trim() || buildStructuredUploadFileName({ mimeType });
  const objectPath = `${folder}/${safeName}`.replace(/^\/+/, "");
  const baseUrl = String(config.supabaseRealtimeUrl || "").trim().replace(/\/+$/g, "");
  const endpoint = `${baseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${objectPath.split("/").map((part) => encodeURIComponent(part)).join("/")}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.supabaseRealtimeServiceKey}`,
      apikey: config.supabaseRealtimeServiceKey,
      "Content-Type": String(mimeType || "application/octet-stream").trim() || "application/octet-stream",
      "x-upsert": "false",
    },
    body: buffer,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(String(payload?.error || payload?.message || "Supabase Storage upload failed."));
  }
  const publicUrl = `${baseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${objectPath.split("/").map((part) => encodeURIComponent(part)).join("/")}`;
  return {
    secureUrl: publicUrl,
    publicId: objectPath,
    resourceType,
    version: "",
    bytes: Math.max(0, Number(payload?.metadata?.size || 0) || buffer.byteLength),
    storageFolder: folder,
  };
}

async function createStoredUploadFromBuffer({
  ownerUserId = "",
  kind = "chat-file",
  fileName = "",
  mimeType = "",
  buffer = Buffer.alloc(0),
} = {}) {
  const validated = validateUploadBinary({ mimeType, buffer });
  const safeMimeType = validated.mimeType;
  const safeBuffer = validated.buffer;
  const originalName = normalizeWhitespace(fileName).slice(0, 180);
  const fileType = getUploadFileTypeFromMime(safeMimeType);
  const generatedFileName = buildStructuredUploadFileName({ mimeType: safeMimeType });
  const storageFolder = buildSupabaseStorageFolderByMime(safeMimeType);
  const fileHash = createUploadFileHash(safeBuffer);
  const uploadDate = new Date().toISOString();
  let remoteAsset = null;
  try {
    remoteAsset = await uploadBufferToSupabaseStorage({
      ownerUserId,
      kind,
      fileName: generatedFileName,
      mimeType: safeMimeType,
      buffer: safeBuffer,
    });
  } catch (error) {
    const message = String(error?.message || "").trim();
    if (message) {
      console.error(`[community-media] Supabase storage upload failed for ${kind}: ${message}`);
      errorLogStream.write(`${new Date().toISOString()} SUPABASE_STORAGE_UPLOAD_FAILED ${kind}: ${message}\n`);
    }
    remoteAsset = null;
  }
  return normalizeUpload({
    ownerUserId,
    userId: ownerUserId,
    kind,
    mimeType: safeMimeType,
    bytes: remoteAsset?.bytes || safeBuffer.byteLength,
    size: remoteAsset?.bytes || safeBuffer.byteLength,
    fileName: generatedFileName,
    originalName,
    newFileName: generatedFileName,
    fileType,
    extension: getUploadExtensionFromMime(safeMimeType),
    storageFolder: String(remoteAsset?.storageFolder || storageFolder || "").trim(),
    fileHash,
    dataUrl: remoteAsset ? "" : `data:${safeMimeType};base64,${safeBuffer.toString("base64")}`,
    remoteUrl: String(remoteAsset?.secureUrl || "").trim(),
    storageProvider: remoteAsset ? "supabase-storage" : "",
    storageId: String(remoteAsset?.publicId || "").trim(),
    storageResourceType: String(remoteAsset?.resourceType || "").trim(),
    storageVersion: String(remoteAsset?.version || "").trim(),
    uploadDate,
  });
}

async function createStoredUploadFromDataUrl({
  ownerUserId = "",
  kind = "chat-file",
  fileName = "",
  dataUrl = "",
} = {}) {
  const parsed = parseDataUrlByMime(dataUrl);
  if (!parsed) {
    throw new Error("Unsupported attachment format.");
  }
  return await createStoredUploadFromBuffer({
    ownerUserId,
    kind,
    fileName,
    mimeType: parsed.mimeType,
    buffer: Buffer.from(parsed.dataUrl.split(";base64,")[1] || "", "base64"),
  });
}

function createUploadFromBuffer({
  ownerUserId = "",
  kind = "chat-file",
  fileName = "",
  mimeType = "",
  buffer = Buffer.alloc(0),
} = {}) {
  const safeMimeType = normalizeUploadMimeType(mimeType);
  const safeBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer || []);
  if (!safeMimeType || !safeBuffer.length) {
    throw new Error("Unsupported attachment format.");
  }
  let maxBytes = MAX_DOCUMENT_UPLOAD_BYTES;
  if (ALLOWED_IMAGE_MIME_TYPES.has(safeMimeType)) {
    maxBytes = MAX_IMAGE_UPLOAD_BYTES;
  } else if (ALLOWED_VIDEO_MIME_TYPES.has(safeMimeType)) {
    maxBytes = MAX_VIDEO_UPLOAD_BYTES;
  } else if (ALLOWED_AUDIO_MIME_TYPES.has(safeMimeType)) {
    maxBytes = MAX_AUDIO_UPLOAD_BYTES;
  } else if (!ALLOWED_DOCUMENT_MIME_TYPES.has(safeMimeType)) {
    throw new Error("Only images, MP4/WEBM/MOV videos, voice notes, PDF, DOC, DOCX, PPT, PPTX, or TXT files are allowed.");
  }
  if (safeBuffer.byteLength <= 0 || safeBuffer.byteLength > maxBytes) {
    throw new Error(`Attachment must be ${Math.round(maxBytes / (1024 * 1024))}MB or less.`);
  }
  const originalName = normalizeWhitespace(fileName).slice(0, 180);
  const fileType = getUploadFileTypeFromMime(safeMimeType);
  const generatedFileName = buildStructuredUploadFileName({ mimeType: safeMimeType });
  const uploadDate = new Date().toISOString();
  return normalizeUpload({
    ownerUserId,
    userId: ownerUserId,
    kind,
    mimeType: safeMimeType,
    bytes: safeBuffer.byteLength,
    size: safeBuffer.byteLength,
    fileName: generatedFileName,
    originalName,
    newFileName: generatedFileName,
    fileType,
    extension: getUploadExtensionFromMime(safeMimeType),
    storageFolder: buildSupabaseStorageFolderByMime(safeMimeType),
    fileHash: createUploadFileHash(safeBuffer),
    dataUrl: `data:${safeMimeType};base64,${safeBuffer.toString("base64")}`,
    uploadDate,
  });
}

function createImageUpload({ ownerUserId = "", kind = "chat-image", fileName = "", dataUrl = "" } = {}) {
  const upload = createUploadFromDataUrl({ ownerUserId, kind, fileName, dataUrl });
  if (!ALLOWED_IMAGE_MIME_TYPES.has(upload.mimeType)) {
    throw new Error("Only JPG, PNG, WEBP, or GIF images are allowed.");
  }
  return upload;
}

async function probeVideoDurationSeconds(filePath = "") {
  const ffprobePath = getFfprobePath();
  const { stdout } = await execFileAsync(
    ffprobePath,
    [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      String(filePath || ""),
    ],
    {
      windowsHide: true,
      maxBuffer: 1024 * 1024,
    },
  );
  const duration = Number.parseFloat(String(stdout || "").trim());
  return Number.isFinite(duration) ? Math.max(0, duration) : 0;
}

function clampStatusVideoTrimRange(trim = {}, duration = 0) {
  const safeDuration = Math.max(0, Number(duration) || 0);
  if (safeDuration <= 0) {
    return { start: 0, end: COMMUNITY_STATUS_MAX_VIDEO_SECONDS };
  }
  const maxSpan = Math.min(COMMUNITY_STATUS_MAX_VIDEO_SECONDS, safeDuration);
  const minSpan = Math.min(1, maxSpan);
  let start = Number(trim?.start);
  let end = Number(trim?.end);
  const hasStart = Number.isFinite(start);
  const hasEnd = Number.isFinite(end);
  if (!hasStart && !hasEnd) {
    return { start: 0, end: maxSpan };
  }
  if (!hasStart) {
    start = end - maxSpan;
  }
  if (!hasEnd) {
    end = start + maxSpan;
  }
  start = Math.max(0, Math.min(safeDuration - minSpan, Number(start) || 0));
  end = Math.max(start + minSpan, Math.min(safeDuration, Number(end) || start + maxSpan));
  if (end - start > maxSpan) {
    if (hasEnd && !hasStart) {
      start = Math.max(0, end - maxSpan);
    } else {
      end = Math.min(safeDuration, start + maxSpan);
    }
  }
  if (end - start < minSpan) {
    end = Math.min(safeDuration, start + minSpan);
    start = Math.max(0, end - minSpan);
  }
  return { start, end };
}

async function trimStatusVideoBuffer(buffer = Buffer.alloc(0), mimeType = "video/mp4", trim = {}) {
  const safeBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer || []);
  const safeMimeType = String(mimeType || "video/mp4").trim().toLowerCase();
  if (!safeBuffer.length) {
    throw new Error("Invalid video upload.");
  }
  const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "ajix-status-video-"));
  try {
    const inputPath = path.join(tempDir, `input${getUploadExtensionFromMime(safeMimeType)}`);
    const outputPath = path.join(tempDir, "status-trimmed.mp4");
    await fs.promises.writeFile(inputPath, safeBuffer);
    const durationSeconds = await probeVideoDurationSeconds(inputPath);
    const clampedTrim = clampStatusVideoTrimRange(trim, durationSeconds || COMMUNITY_STATUS_MAX_VIDEO_SECONDS);
    const trimDurationSeconds = Math.max(1, Number((clampedTrim.end - clampedTrim.start).toFixed(3)) || COMMUNITY_STATUS_MAX_VIDEO_SECONDS);
    const shouldTrim =
      durationSeconds > COMMUNITY_STATUS_MAX_VIDEO_SECONDS ||
      clampedTrim.start > 0.05 ||
      clampedTrim.end < durationSeconds - 0.05;
    if (!shouldTrim) {
      return {
        buffer: safeBuffer,
        mimeType: safeMimeType,
        durationSeconds: Math.max(1, Math.min(30, durationSeconds || COMMUNITY_STATUS_MAX_VIDEO_SECONDS)),
        trimmed: false,
      };
    }
    const ffmpegPath = getFfmpegPath();
    await execFileAsync(
      ffmpegPath,
      [
        "-y",
        "-i",
        inputPath,
        "-ss",
        String(Math.max(0, clampedTrim.start)),
        "-t",
        String(trimDurationSeconds),
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "30",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "96k",
        "-movflags",
        "+faststart",
        outputPath,
      ],
      {
        windowsHide: true,
        maxBuffer: 10 * 1024 * 1024,
      },
    );
    const outputBuffer = await fs.promises.readFile(outputPath);
    const outputDurationSeconds = await probeVideoDurationSeconds(outputPath);
    return {
      buffer: outputBuffer,
      mimeType: "video/mp4",
      durationSeconds: Math.max(1, Math.min(COMMUNITY_STATUS_MAX_VIDEO_SECONDS, outputDurationSeconds || trimDurationSeconds)),
      trimmed: true,
    };
  } finally {
    await fs.promises.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}

function parseStatusMetaHeader(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return {};
  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function parseMessageMetaHeader(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return {};
  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function persistCommunityConversationMessage({
  viewerId = "",
  conversationId = "",
  text = "",
  replyTo = null,
  upload = null,
} = {}) {
  const safeConversationId = String(conversationId || "");
  const safeText = String(text || "").trim();
  const safeReplyTo = normalizeMessageReply(replyTo || null);
  const conversations = (await readCollection("conversations")).map(normalizeConversation);
  const messages = (await readCollection("messages")).map(normalizeMessage);
  const blocks = (await readCollection("blocks")).map(normalizeBlock);
  const conversationIndex = conversations.findIndex((entry) => entry.id === safeConversationId);
  if (conversationIndex < 0 || !conversations[conversationIndex].memberIds.includes(viewerId)) {
    throw new Error("conversation not found");
  }
  const conversation = conversations[conversationIndex];
  const partnerId =
    conversation.type === "direct"
      ? conversations[conversationIndex].memberIds.find((memberId) => memberId !== viewerId) || ""
      : "";
  if (conversation.type === "direct" && isBlocked(blocks, viewerId, partnerId)) {
    throw new Error("unblock user first");
  }
  if (conversation.type === "notice") {
    throw new Error("admin notices are read only");
  }
  if (!safeText && !upload) {
    throw new Error("message text or attachment is required");
  }
  if (
    conversation.type === "group" &&
    !normalizeGroupPermissions(conversation.permissions || {}).membersCanSendMessages &&
    String(conversation.ownerUserId || "") !== viewerId &&
    !Array.isArray(conversation.adminIds || []).includes(viewerId)
  ) {
    throw new Error("only admins can send messages in this group");
  }
  assertSafeCommunityText(safeText, "message");
  const uploadRecords = upload ? (await readCollection("uploads")).map(normalizeUpload) : [];
  const persistedUploadResult = upload ? persistUploadRecord(uploadRecords, upload) : { uploads: [], upload: null };
  const storedUpload = persistedUploadResult.upload;
  const hiddenForUserIds =
    conversation.type === "direct" && isBlocked(blocks, partnerId, viewerId) ? [partnerId] : [];
  const message = normalizeMessage({
    conversationId: safeConversationId,
    senderUserId: viewerId,
    type: storedUpload ? getMessageTypeFromUpload(storedUpload) : "text",
    text: safeText.slice(0, 2000),
    attachment: storedUpload
      ? {
          uploadId: storedUpload.id,
          kind: getMessageTypeFromUpload(storedUpload),
          fileName: storedUpload.fileName,
          mimeType: storedUpload.mimeType,
        }
      : null,
    replyTo: safeReplyTo,
    deliveredAt: null,
    readAt: null,
    seenByUserIds: [viewerId],
    hiddenForUserIds,
  });
  if (storedUpload) {
    await writeCollection("uploads", persistedUploadResult.uploads);
  }
  messages.push(message);
  conversations[conversationIndex] = {
    ...conversations[conversationIndex],
    lastMessageId: message.id,
    lastMessageAt: message.createdAt,
    updatedAt: message.createdAt,
  };
  await writeCollection("messages", messages);
  await writeCollection("conversations", conversations);
  fireCommunityRealtimeMessages(
    buildCommunityConversationRealtimeMessages(safeConversationId, {
      reason: "message-created",
      messageId: message.id,
    }),
  );
  return message;
}

async function persistAdminNoticeMessage({
  recipientId = "",
  text = "",
  title = "Admin Notice",
  subtitle = "Messages from the admin team",
  originType = "",
  originId = "",
  originName = "",
  senderName = ADMIN_NOTICE_SENDER_NAME,
  upload = null,
  storedUpload = null,
  noticeThreadKey = "",
  noticeBatchId = "",
} = {}) {
  const safeRecipientId = String(recipientId || "").trim();
  const safeText = String(text || "").trim();
  const safeTitle = normalizeWhitespace(title).slice(0, 72) || "Admin Notice";
  const safeSubtitle = normalizeWhitespace(subtitle).slice(0, 180) || "Messages from the admin team";
  const safeOriginType = normalizeWhitespace(originType).slice(0, 32);
  const safeOriginId = String(originId || "").trim();
  const safeOriginName = normalizeWhitespace(originName).slice(0, 120);
  const safeSenderName = normalizeWhitespace(senderName).slice(0, 80) || ADMIN_NOTICE_SENDER_NAME;
  const safeThreadKey = normalizeWhitespace(noticeThreadKey || "").slice(0, 120);
  const safeBatchId = String(noticeBatchId || "").trim() || crypto.randomUUID();
  if (!safeRecipientId) {
    throw new Error("recipient required");
  }

  const conversations = (await readCollection("conversations")).map(normalizeConversation);
  const messages = (await readCollection("messages")).map(normalizeMessage);
  let nextStoredUpload = storedUpload ? normalizeUpload(storedUpload) : null;
  if (!nextStoredUpload && upload) {
    const uploadRecords = (await readCollection("uploads")).map(normalizeUpload);
    const persistedUploadResult = persistUploadRecord(uploadRecords, upload);
    nextStoredUpload = persistedUploadResult.upload;
    if (nextStoredUpload) {
      await writeCollection("uploads", persistedUploadResult.uploads);
    }
  }
  if (!safeText && !nextStoredUpload) {
    throw new Error("message text or attachment is required");
  }
  const nowIso = new Date().toISOString();
  let conversationIndex = conversations.findIndex(
    (entry) =>
      entry.type === "notice" &&
      entry.memberIds.length === 1 &&
      entry.memberIds.includes(safeRecipientId),
  );
  const currentConversation = conversationIndex >= 0 ? conversations[conversationIndex] : null;
  const nextConversation = normalizeConversation({
    ...(currentConversation || {}),
    type: "notice",
    memberIds: [safeRecipientId],
    ownerUserId: safeRecipientId,
    name: safeTitle,
    bio: safeSubtitle,
    noticeTitle: safeTitle,
    noticeSubtitle: safeSubtitle,
    noticeBody: (safeText.slice(0, 240) || nextStoredUpload?.originalName || nextStoredUpload?.fileName || "").slice(0, 240),
    noticeOriginType: safeOriginType,
    noticeOriginId: safeOriginId,
    noticeOriginName: safeOriginName,
    noticeSenderId: ADMIN_NOTICE_SENDER_ID,
    noticeSenderName: safeSenderName,
    noticeThreadKey: safeThreadKey || (safeOriginType === "broadcast" || safeOriginId === "all-users" ? "broadcast" : `notice:${safeOriginType || "notice"}:${safeOriginId || safeRecipientId}`),
    noticeBatchId: safeBatchId,
    updatedAt: nowIso,
    createdAt: currentConversation?.createdAt || nowIso,
  });
  if (conversationIndex >= 0) {
    conversations[conversationIndex] = nextConversation;
  } else {
    conversations.push(nextConversation);
    conversationIndex = conversations.length - 1;
  }

  const message = normalizeMessage({
    conversationId: nextConversation.id,
    senderUserId: ADMIN_NOTICE_SENDER_ID,
    senderName: safeSenderName,
    type: nextStoredUpload ? getMessageTypeFromUpload(nextStoredUpload) : "text",
    text: safeText.slice(0, 2000),
    deliveredAt: nowIso,
    readAt: null,
    seenByUserIds: [],
    hiddenForUserIds: [],
    createdAt: nowIso,
    updatedAt: nowIso,
    attachment: nextStoredUpload
      ? {
          uploadId: nextStoredUpload.id,
          kind: getMessageTypeFromUpload(nextStoredUpload),
          fileName: nextStoredUpload.fileName,
          mimeType: nextStoredUpload.mimeType,
        }
      : null,
    noticeThreadKey: nextConversation.noticeThreadKey,
    noticeBatchId: safeBatchId,
  });
  messages.push(message);
  conversations[conversationIndex] = {
    ...nextConversation,
    lastMessageId: message.id,
    lastMessageAt: message.createdAt,
    updatedAt: message.createdAt,
  };
  await writeCollection("messages", messages);
  await writeCollection("conversations", conversations);
  fireCommunityRealtimeMessages([
    ...buildCommunityConversationRealtimeMessages(nextConversation.id, {
      reason: "message-created",
      messageId: message.id,
    }),
    buildCommunityOverviewRealtimeMessage("conversations", {
      reason: "admin-notice-created",
      conversationId: nextConversation.id,
      recipientUserId: safeRecipientId,
    }),
  ]);
  return {
    conversation: conversations[conversationIndex],
    message,
  };
}

async function persistCommunityCallLogMessage({
  conversationId = "",
  session = null,
  endedByUserId = "",
} = {}) {
  const safeConversationId = String(conversationId || "").trim();
  const safeSession = session && typeof session === "object" ? session : null;
  const safeEndedByUserId = String(endedByUserId || "").trim();
  if (!safeConversationId || !safeSession) return null;
  const conversations = (await readCollection("conversations")).map(normalizeConversation);
  const conversationIndex = conversations.findIndex((entry) => entry.id === safeConversationId);
  if (conversationIndex < 0) return null;
  const messages = (await readCollection("messages")).map(normalizeMessage);
  const endedAtIso = String(safeSession.endedAt || new Date().toISOString());
  const startedAtMs = new Date(String(safeSession.startedAt || "")).getTime();
  const answeredAtMs = new Date(String(safeSession.answeredAt || "")).getTime();
  const endedAtMs = new Date(endedAtIso).getTime();
  const hasAnsweredAt = Number.isFinite(answeredAtMs) && answeredAtMs > 0;
  const mode = normalizeCommunityCallMode(safeSession.mode);
  const modeLabel = mode === "video" ? "Video" : "Voice";
  const durationSeconds = hasAnsweredAt && Number.isFinite(endedAtMs)
    ? Math.max(0, Math.round((endedAtMs - answeredAtMs) / 1000))
    : 0;
  const message = normalizeMessage({
    conversationId: safeConversationId,
    senderUserId: safeEndedByUserId || String(safeSession.startedByUserId || "").trim(),
    type: "call",
    text: `${modeLabel} call`,
    call: {
      mode,
      startedByUserId: String(safeSession.startedByUserId || "").trim(),
      answeredByUserId: String(safeSession.answeredByUserId || "").trim(),
      endedByUserId: safeEndedByUserId || String(safeSession.startedByUserId || "").trim(),
      startedAt: Number.isFinite(startedAtMs) && startedAtMs > 0 ? new Date(startedAtMs).toISOString() : "",
      answeredAt: hasAnsweredAt ? new Date(answeredAtMs).toISOString() : "",
      endedAt: Number.isFinite(endedAtMs) && endedAtMs > 0 ? new Date(endedAtMs).toISOString() : endedAtIso,
      durationSeconds,
      outcome: hasAnsweredAt ? "answered" : "missed",
    },
    seenByUserIds: safeEndedByUserId ? [safeEndedByUserId] : [],
  });
  messages.push(message);
  conversations[conversationIndex] = {
    ...conversations[conversationIndex],
    lastMessageId: message.id,
    lastMessageAt: message.createdAt,
    updatedAt: message.createdAt,
  };
  await writeCollection("messages", messages);
  await writeCollection("conversations", conversations);
  fireCommunityRealtimeMessages(
    buildCommunityConversationRealtimeMessages(safeConversationId, {
      reason: "message-created",
      messageId: message.id,
    }),
  );
  return message;
}

async function persistCommunityStatus({
  viewerId = "",
  caption = "",
  text = "",
  background = "#2f80d0",
  visibility = "friends",
  style = {},
  upload = null,
  isAdminBroadcast = false,
} = {}) {
  const statuses = (await purgeExpiredStatuses()).map(normalizeStatus);
  const activeOwnCount = statuses.filter((entry) => entry.ownerUserId === viewerId).length;
  if (activeOwnCount >= MAX_ACTIVE_STATUSES_PER_USER) {
    throw new Error(`you can only keep ${MAX_ACTIVE_STATUSES_PER_USER} active statuses at a time`);
  }
  const uploadRecords = upload ? (await readCollection("uploads")).map(normalizeUpload) : [];
  const persistedUploadResult = upload ? persistUploadRecord(uploadRecords, upload) : { uploads: [], upload: null };
  const storedUpload = persistedUploadResult.upload;
  if (storedUpload) {
    await writeCollection("uploads", persistedUploadResult.uploads);
  }
  const status = normalizeStatus({
    ownerUserId: viewerId,
    uploadId: storedUpload?.id || "",
    type: storedUpload
      ? (String(storedUpload?.mimeType || "").trim().toLowerCase().startsWith("video/") ? "video" : "image")
      : "text",
    text,
    background,
    textColor: String(style?.textColor || "#ffffff"),
    textStyle: String(style?.textStyle || "default"),
    textAlign: String(style?.textAlign || "center"),
    textScale: Number(style?.textScale || 1) || 1,
    textX: Number(style?.textX || 0.5) || 0.5,
    textY: Number(style?.textY || 0.5) || 0.5,
    textBold: style?.textBold === true,
    textItalic: style?.textItalic === true,
    textUnderline: style?.textUnderline === true,
    imageFit: String(style?.imageFit || "contain"),
    imageFilter: String(style?.imageFilter || "none"),
    imageRotate: Number(style?.imageRotate || 0) || 0,
    videoTrimStart: Number(style?.videoTrimStart || 0) || 0,
    videoTrimEnd: Number(style?.videoTrimEnd || 0) || 0,
    durationSeconds: Math.max(1, Math.min(30, Number(style?.durationSeconds || 30) || 30)),
    allowReplies: isAdminBroadcast ? false : style?.allowReplies !== false,
    caption,
    visibility: isAdminBroadcast
      ? "everyone"
      : STATUS_VISIBILITY_VALUES.has(String(visibility || "").trim().toLowerCase())
        ? String(visibility || "").trim().toLowerCase()
        : "friends",
    expiresAt: new Date(Date.now() + STATUS_TTL_MS).toISOString(),
    isAdminBroadcast: Boolean(isAdminBroadcast),
  });
  statuses.push(status);
  await writeCollection("statuses", statuses);
  fireCommunityRealtimeMessages([
    buildCommunityOverviewRealtimeMessage("statuses", {
      reason: "status-created",
      statusId: status.id,
      ownerUserId: viewerId,
    }),
  ]);
  return status;
}

function getMessageTypeFromUpload(upload = null) {
  const mimeType = String(upload?.mimeType || "").trim().toLowerCase();
  if (ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) return "image";
  if (ALLOWED_VIDEO_MIME_TYPES.has(mimeType)) return "video";
  if (ALLOWED_AUDIO_MIME_TYPES.has(mimeType)) return "audio";
  if (mimeType === "application/pdf") return "document";
  return "file";
}

function containsRestrictedCommunityText(value = "") {
  const text = String(value || "").trim();
  if (!text) return false;
  return COMMUNITY_RESTRICTED_TEXT_PATTERNS.some((pattern) => pattern.test(text));
}

function assertSafeCommunityText(value = "", label = "text") {
  if (containsRestrictedCommunityText(value)) {
    throw new Error(COMMUNITY_MODERATION_BLOCK_MESSAGE);
  }
}

function throwCommunityModerationBlocked() {
  throw new Error(COMMUNITY_MODERATION_BLOCK_MESSAGE);
}

function createTimeoutController(timeoutMs = config.aiRequestTimeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.max(1000, Number(timeoutMs) || config.aiRequestTimeoutMs));
  return {
    controller,
    clear() {
      clearTimeout(timer);
    },
  };
}

function isCommunityGoogleVisionConfigured() {
  return Boolean(config.googleVisionApiKey && typeof fetch === "function");
}

function isCommunityModerationQuotaFallbackError(message = "") {
  const text = String(message || "").trim().toLowerCase();
  if (!text) return false;
  return (
    text.includes("quota")
    || text.includes("rate limit")
    || text.includes("resource exhausted")
    || text.includes("billing")
    || text.includes("permission denied")
    || text.includes("api key not valid")
    || text.includes("moderation_unavailable")
    || text.includes("insufficient")
  );
}

function isUnsafeVisionLikelihood(value = "") {
  const safeValue = String(value || "").trim().toUpperCase();
  // Treat anything beyond "UNLIKELY" as unsafe so explicit images do not slip through.
  return safeValue === "POSSIBLE" || safeValue === "LIKELY" || safeValue === "VERY_LIKELY";
}

async function requestGoogleVisionSafeSearch(buffer = Buffer.alloc(0)) {
  if (!isCommunityGoogleVisionConfigured()) {
    return null;
  }
  const safeBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer || []);
  const { controller, clear } = createTimeoutController(config.aiRequestTimeoutMs);
  try {
    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(config.googleVisionApiKey)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: safeBuffer.toString("base64"),
            },
            features: [
              { type: "SAFE_SEARCH_DETECTION", maxResults: 1 },
            ],
          },
        ],
      }),
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(String(payload?.error?.message || "vision_request_failed"));
    }
    const annotation = payload?.responses?.[0]?.safeSearchAnnotation || {};
    const blocked = (
      isUnsafeVisionLikelihood(annotation.adult)
      || isUnsafeVisionLikelihood(annotation.racy)
      || isUnsafeVisionLikelihood(annotation.violence)
    );
    if (blocked) {
      throwCommunityModerationBlocked();
    }
    return annotation;
  } finally {
    clear();
  }
}

async function moderateCommunityTextContent(value = "") {
  const text = normalizeWhitespace(value);
  if (!text) return;
  assertSafeCommunityText(text, "text");
}

async function moderateCommunityImageBuffer(buffer = Buffer.alloc(0), mimeType = "image/jpeg") {
  const safeBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer || []);
  if (!safeBuffer.length) return;
  try {
    await requestGoogleVisionSafeSearch(safeBuffer);
  } catch (error) {
    const message = String(error?.message || "").trim();
    if (message === COMMUNITY_MODERATION_BLOCK_MESSAGE) {
      throw error;
    }
    errorLogStream.write(`${new Date().toISOString()} COMMUNITY_IMAGE_MODERATION_FALLBACK ${message || "unknown"}\n`);
    return;
  }
}

async function extractCommunityModerationVideoFrames(videoBuffer = Buffer.alloc(0), mimeType = "video/mp4") {
  const safeBuffer = Buffer.isBuffer(videoBuffer) ? videoBuffer : Buffer.from(videoBuffer || []);
  if (!safeBuffer.length) return [];
  const safeMimeType = String(mimeType || "video/mp4").trim().toLowerCase() || "video/mp4";
  const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "ajix-moderation-video-"));
  try {
    const inputPath = path.join(tempDir, `input${getUploadExtensionFromMime(safeMimeType)}`);
    const framesDir = path.join(tempDir, "frames");
    await fs.promises.mkdir(framesDir, { recursive: true });
    await fs.promises.writeFile(inputPath, safeBuffer);
    await execFileAsync(
      getFfmpegPath(),
      [
        "-y",
        "-i",
        inputPath,
        "-vf",
        `fps=1/${COMMUNITY_MODERATION_VIDEO_FRAME_INTERVAL_SECONDS},scale='min(640,iw)':-2`,
        "-q:v",
        "5",
        path.join(framesDir, "frame-%04d.jpg"),
      ],
      {
        windowsHide: true,
        maxBuffer: 10 * 1024 * 1024,
      },
    );
    const frameFiles = (await fs.promises.readdir(framesDir))
      .filter((name) => /\.jpe?g$/i.test(name))
      .sort((a, b) => a.localeCompare(b));
    const frames = [];
    for (const fileName of frameFiles) {
      const framePath = path.join(framesDir, fileName);
      const frameBuffer = await fs.promises.readFile(framePath);
      if (frameBuffer.length) frames.push(frameBuffer);
    }
    if (!frames.length) {
      throwCommunityModerationBlocked();
    }
    return frames;
  } finally {
    await fs.promises.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}

async function moderateCommunityVideoBuffer(buffer = Buffer.alloc(0), mimeType = "video/mp4") {
  try {
    const frames = await extractCommunityModerationVideoFrames(buffer, mimeType);
    if (!frames.length) {
      errorLogStream.write(`${new Date().toISOString()} COMMUNITY_VIDEO_MODERATION_FALLBACK no_frames\n`);
      return;
    }
    for (const frame of frames) {
      await moderateCommunityImageBuffer(frame, "image/jpeg");
    }
  } catch (error) {
    const message = String(error?.message || "").trim();
    if (message === COMMUNITY_MODERATION_BLOCK_MESSAGE) {
      throw error;
    }
    errorLogStream.write(`${new Date().toISOString()} COMMUNITY_VIDEO_MODERATION_FALLBACK ${message || "unknown"}\n`);
  }
}

async function moderateCommunityUploadBuffer(buffer = Buffer.alloc(0), mimeType = "", {
  textFallback = "",
} = {}) {
  const safeMimeType = String(mimeType || "").trim().toLowerCase();
  if (!safeMimeType) return;
  if (safeMimeType.startsWith("image/")) {
    await moderateCommunityImageBuffer(buffer, safeMimeType);
    return;
  }
  if (safeMimeType.startsWith("video/")) {
    await moderateCommunityVideoBuffer(buffer, safeMimeType);
    return;
  }
  if (safeMimeType === "text/plain") {
    const safeBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer || []);
    const text = safeBuffer.toString("utf8").slice(0, 6000);
    await moderateCommunityTextContent(textFallback || text);
  }
}

function resolveUploadPublicView(upload = null) {
  const normalized = normalizeUpload(upload || {});
  return {
    id: normalized.id,
    mimeType: normalized.mimeType,
    bytes: normalized.bytes,
    size: normalized.size,
    fileType: normalized.fileType,
    fileName: normalized.fileName,
    originalName: normalized.originalName,
    newFileName: normalized.newFileName,
    extension: normalized.extension,
    storageFolder: normalized.storageFolder,
    downloadFolderHint: getUploadDeviceFolderHint(normalized.fileType),
    uploadDate: normalized.uploadDate,
    userId: normalized.userId,
    dataUrl: normalized.remoteUrl || normalized.dataUrl,
    remoteUrl: normalized.remoteUrl,
    storageProvider: normalized.storageProvider,
    storageId: normalized.storageId,
    createdAt: normalized.createdAt,
  };
}

function isStatusExpired(status = {}) {
  const expiresMs = Date.parse(String(status?.expiresAt || ""));
  return !Number.isFinite(expiresMs) || expiresMs <= Date.now();
}

function isSkippableUsersWriteError(error = null) {
  const code = String(error?.code || "").trim().toUpperCase();
  const message = String(error?.message || "").trim();
  return (
    code === "EBUSY" ||
    code === "EPERM" ||
    message.includes("Refusing to write an empty users collection")
  );
}

async function purgeExpiredStatuses() {
  const statuses = (await readCollection("statuses")).map(normalizeStatus);
  const active = statuses.filter((entry) => !isStatusExpired(entry));
  if (active.length !== statuses.length) {
    await writeCollection("statuses", active);
  }
  return active;
}

function getConversationLastVisibleMessage(messages = [], conversationId = "", viewerId = "") {
  return [...messages]
    .filter(
      (entry) =>
        entry.conversationId === conversationId &&
        !entry.deletedForUserIds?.includes(String(viewerId || "")) &&
        !entry.hiddenForUserIds?.includes(String(viewerId || "")),
    )
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))[0] || null;
}

function sanitizeDeletedCommunityMessage(message = {}) {
  if (!message?.deletedAt) return { ...(message && typeof message === "object" ? message : {}) };
  return {
    ...(message && typeof message === "object" ? message : {}),
    type: "text",
    text: MESSAGE_DELETED_PLACEHOLDER,
    attachment: null,
    call: null,
    replyTo: null,
    editedAt: null,
    isDeletedForEveryone: true,
  };
}

function buildConversationLastMessagePayload(message = null) {
  if (!message || typeof message !== "object") return null;
  const safeMessage = sanitizeDeletedCommunityMessage(message);
  return {
    id: safeMessage.id,
    text: safeMessage.text,
    senderUserId: safeMessage.senderUserId,
    senderName: String(safeMessage.senderName || "").trim(),
    createdAt: safeMessage.createdAt,
    type: safeMessage.type,
    attachment: safeMessage.attachment || null,
    call: safeMessage.call || null,
    isDeletedForEveryone: Boolean(safeMessage.deletedAt),
  };
}

async function touchUserLastSeen(userId = "") {
  const targetId = String(userId || "").trim();
  if (!targetId) return;
  const now = Date.now();
  const nowIso = new Date(now).toISOString();
  try {
    await updateCollection("users", (current = []) =>
      current.map((entry) => {
        const normalized = normalizeExistingUser(entry);
        if (normalized.id !== targetId) return entry;
        const previous = normalized.lastSeenAt ? new Date(normalized.lastSeenAt).getTime() : 0;
        if (Number.isFinite(previous) && now - previous < 45000) {
          return entry;
        }
        return {
          ...normalized,
          lastSeenAt: nowIso,
        };
      }),
    );
  } catch (error) {
    if (!isSkippableUsersWriteError(error)) {
      throw error;
    }
  }
}

function getFriendshipKey(userA = "", userB = "") {
  return [String(userA || ""), String(userB || "")]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
    .join("::");
}

function areFriends(friendships = [], userA = "", userB = "") {
  if (!userA || !userB) return false;
  const key = getFriendshipKey(userA, userB);
  return friendships.some((entry) => getFriendshipKey(entry.userA, entry.userB) === key);
}

function isBlocked(blocks = [], viewerId = "", subjectId = "") {
  if (!viewerId || !subjectId) return false;
  return blocks.some(
    (entry) =>
      String(entry.blockerUserId || "") === String(viewerId || "") &&
      String(entry.blockedUserId || "") === String(subjectId || ""),
  );
}

function getCommunityBlockState(blocks = [], viewerId = "", subjectId = "") {
  return {
    viewerBlockedSubject: isBlocked(blocks, viewerId, subjectId),
    subjectBlockedViewer: isBlocked(blocks, subjectId, viewerId),
  };
}

function canViewVisibility(visibility = "everyone", { viewerId = "", subjectId = "", isFriend = false } = {}) {
  if (!subjectId) return false;
  if (viewerId && viewerId === subjectId) return true;
  if (visibility === "everyone") return true;
  if (visibility === "friends") return isFriend;
  return false;
}

function applyCommunityProfileView(
  user,
  {
    viewerId = "",
    isFriend = false,
    leaderboardStats = null,
    viewerBlockedSubject = false,
    subjectBlockedViewer = false,
  } = {},
) {
  const normalized = normalizeExistingUser(user);
  const privacy = normalizePrivacySettings(normalized.privacy);
  const sameUser = viewerId && viewerId === normalized.id;
  const restrictedBySubject = !sameUser && subjectBlockedViewer;
  const canSeeProfile = canViewVisibility(privacy.profileVisibility, {
    viewerId,
    subjectId: normalized.id,
    isFriend,
  });
  const canSeeBio = canViewVisibility(privacy.bioVisibility, {
    viewerId,
    subjectId: normalized.id,
    isFriend,
  });
  const canSeeInstitution = canViewVisibility(privacy.institutionVisibility, {
    viewerId,
    subjectId: normalized.id,
    isFriend,
  });
  const canSeeContact =
    sameUser ||
    (privacy.contactVisibility === "friends" ? isFriend : false);
  const canSeeLeaderboard = canViewVisibility(privacy.leaderboardVisibility, {
    viewerId,
    subjectId: normalized.id,
    isFriend,
  });
  const canSeeOnline = canViewVisibility(privacy.onlineVisibility, {
    viewerId,
    subjectId: normalized.id,
    isFriend,
  });
  const canSeeLastSeen = canViewVisibility(privacy.lastSeenVisibility, {
    viewerId,
    subjectId: normalized.id,
    isFriend,
  });
  const lastSeenStamp = String(normalized.lastSeenAt || "").trim();
  const lastSeenMs = lastSeenStamp ? new Date(lastSeenStamp).getTime() : Number.NaN;
  const rawOnlineNow =
    Number.isFinite(lastSeenMs) &&
    Date.now() - lastSeenMs <= 45 * 1000;
  const onlineNow =
    canSeeOnline &&
    Number.isFinite(lastSeenMs) &&
    rawOnlineNow;

  if (restrictedBySubject) {
    return {
      id: normalized.id,
      role: normalized.role,
      title: "",
      firstName: "",
      lastName: "",
      name: "",
      username: normalized.username,
      profileImage: "",
      bio: "",
      institution: "",
      country: "",
      professionalType: "",
      contact: "",
      leaderboardStats: null,
      createdAt: normalized.createdAt,
      updatedAt: normalized.updatedAt,
      lastSeenAt: "",
      onlineNow: false,
      points: 0,
      privacy,
      viewerBlockedSubject: Boolean(viewerBlockedSubject),
      subjectBlockedViewer: true,
    };
  }

  return {
    id: normalized.id,
    role: normalized.role,
    title: canSeeProfile || sameUser ? normalized.title : "",
    firstName: canSeeProfile || sameUser ? normalized.firstName : "",
    lastName: canSeeProfile || sameUser ? normalized.lastName : "",
    name: canSeeProfile || sameUser ? normalized.name : "",
    username: normalized.username,
    profileImage: canSeeProfile || sameUser ? normalized.profileImage : "",
    bio: canSeeBio || sameUser ? normalized.bio : "",
    institution: canSeeInstitution || sameUser ? normalized.institution : "",
    country: canSeeInstitution || sameUser ? normalized.country : "",
    professionalType: canSeeInstitution || sameUser ? normalized.professionalType : "",
    contact: canSeeContact ? normalized.contact : "",
    leaderboardStats: canSeeLeaderboard || sameUser ? leaderboardStats : null,
    createdAt: normalized.createdAt,
    updatedAt: normalized.updatedAt,
    lastSeenAt: canSeeLastSeen || sameUser ? normalized.lastSeenAt : "",
    onlineNow: sameUser ? rawOnlineNow : onlineNow,
    points: normalizePointsValue(normalized.points),
    privacy,
    viewerBlockedSubject: Boolean(viewerBlockedSubject),
    subjectBlockedViewer: Boolean(subjectBlockedViewer),
  };
}

function getConversationDisplayPayload(conversation, {
  viewerId = "",
  users = [],
  friendships = [],
  blocks = [],
  uploads = [],
} = {}) {
  const normalizedConversation = normalizeConversation(conversation);
  if (normalizedConversation.type === "notice") {
    const avatarUpload = uploads.find((entry) => entry.id === normalizedConversation.noticeAvatarUploadId) || null;
    const isBroadcastNotice =
      String(normalizedConversation.noticeOriginType || "").trim().toLowerCase() === "broadcast" ||
      String(normalizedConversation.noticeThreadKey || "").trim().toLowerCase() === "broadcast";
    const noticeSubtitle = normalizedConversation.noticeSubtitle || (isBroadcastNotice
      ? "Announcement sent to all users"
      : "Messages from the admin team");
    return {
      id: normalizedConversation.id,
      kind: "notice",
      type: "notice",
      name: normalizedConversation.noticeTitle || "Admin Notice",
      displayName: normalizedConversation.noticeTitle || "Admin Notice",
      title: normalizedConversation.noticeTitle || "Admin Notice",
      username: "",
      profileImage: avatarUpload ? resolveUploadPublicView(avatarUpload).dataUrl : ADMIN_NOTICE_PROFILE_IMAGE,
      institution: noticeSubtitle,
      country: "",
      professionalType: "Admin Notice",
      bio: normalizedConversation.noticeBody || "",
      contact: "",
      points: 0,
      privacy: {},
      lastSeenAt: "",
      onlineNow: false,
      isGroup: false,
      isNotice: true,
      isReadOnly: true,
      ownerUserId: normalizedConversation.ownerUserId,
      adminIds: [],
      memberIds: normalizedConversation.memberIds,
      permissions: {},
      inviteToken: "",
      createdAt: normalizedConversation.createdAt,
      noticeTitle: normalizedConversation.noticeTitle || "Admin Notice",
      noticeSubtitle,
      noticeBody: normalizedConversation.noticeBody || "",
      noticeOriginType: normalizedConversation.noticeOriginType || "",
      noticeOriginId: normalizedConversation.noticeOriginId || "",
      noticeOriginName: normalizedConversation.noticeOriginName || "",
      noticeSenderId: normalizedConversation.noticeSenderId || ADMIN_NOTICE_SENDER_ID,
      noticeSenderName: normalizedConversation.noticeSenderName || ADMIN_NOTICE_SENDER_NAME,
      conversationType: "notice",
    };
  }
  if (normalizedConversation.type === "group") {
    const avatarUpload = uploads.find((entry) => entry.id === normalizedConversation.avatarUploadId);
    return {
      id: normalizedConversation.id,
      kind: "group",
      type: "group",
      name: normalizedConversation.name || "Study Group",
      username: "",
      profileImage: avatarUpload ? resolveUploadPublicView(avatarUpload).dataUrl : "",
      institution: `${normalizedConversation.memberIds.length} members`,
      country: "",
      professionalType: "Study Group",
      bio: normalizedConversation.bio || "",
      contact: "",
      points: 0,
      privacy: {},
      lastSeenAt: "",
      isGroup: true,
      ownerUserId: normalizedConversation.ownerUserId,
      adminIds: normalizedConversation.adminIds,
      memberIds: normalizedConversation.memberIds,
      permissions: normalizeGroupPermissions(normalizedConversation.permissions || {}),
      isMuted: Array.isArray(normalizedConversation.mutedMemberIds) && normalizedConversation.mutedMemberIds.includes(viewerId),
      inviteToken: normalizedConversation.inviteToken || "",
      createdAt: normalizedConversation.createdAt,
    };
  }
  const partnerId = normalizedConversation.memberIds.find((memberId) => memberId !== viewerId) || "";
  const partner = users.find((user) => user.id === partnerId);
  return partner
    ? applyCommunityProfileView(partner, {
        viewerId,
        isFriend: areFriends(friendships, viewerId, partner.id),
        ...getCommunityBlockState(blocks, viewerId, partner.id),
      })
    : null;
}

function buildCommunityConversationRows({
  viewerId = "",
  users = [],
  friendships = [],
  blocks = [],
  uploads = [],
  conversations = [],
  messages = [],
  conversationStates = [],
} = {}) {
  const safeViewerId = String(viewerId || "").trim();
  const states = Array.isArray(conversationStates)
    ? conversationStates.map(normalizeCommunityConversationState)
    : [];
  const normalizedMessages = Array.isArray(messages) ? messages.map(normalizeMessage) : [];
  const conversationRows = conversations
    .filter((entry) => Array.isArray(entry?.memberIds) && entry.memberIds.includes(safeViewerId))
    .filter((entry) => {
      if (entry.type !== "direct") return true;
      const partnerId = entry.memberIds.find((memberId) => memberId !== safeViewerId) || "";
      if (!partnerId) return false;
      return !isBlocked(blocks, safeViewerId, partnerId) && !isBlocked(blocks, partnerId, safeViewerId);
    })
    .filter((entry) => {
      const state = getCommunityConversationStateForViewer(states, safeViewerId, entry.id);
      const hiddenInConversation = Array.isArray(entry.hiddenForUserIds)
        && entry.hiddenForUserIds.includes(safeViewerId);
      return !hiddenInConversation && !isCommunityConversationHiddenForViewer(state);
    })
    .map((entry) => {
      const state = getCommunityConversationStateForViewer(states, safeViewerId, entry.id);
      const entryMessages = normalizedMessages.filter((message) => message.conversationId === entry.id);
      const lastMessage =
        normalizedMessages.find(
          (message) =>
            message.id === entry.lastMessageId &&
            !message.deletedForUserIds?.includes(safeViewerId) &&
            !message.hiddenForUserIds?.includes(safeViewerId),
        ) || getConversationLastVisibleMessage(normalizedMessages, entry.id, safeViewerId);
      const unreadCount = entryMessages.filter(
        (message) =>
          message.senderUserId !== safeViewerId &&
          !message.deletedAt &&
          !hasMessageBeenSeenByUser(message, safeViewerId) &&
          !message.deletedForUserIds?.includes(safeViewerId) &&
          !message.hiddenForUserIds?.includes(safeViewerId),
      ).length;
      return {
        id: entry.id,
        updatedAt: lastMessage?.createdAt || entry.updatedAt,
        unreadCount,
        isFavorite: Boolean(state?.isFavorite),
        partner: getConversationDisplayPayload(entry, {
          viewerId: safeViewerId,
          users,
          friendships,
          blocks,
          uploads,
        }),
        lastMessage: buildConversationLastMessagePayload(lastMessage),
      };
    });
  return conversationRows
    .filter((entry) => entry.partner)
    .sort((a, b) => {
      const aFavorite = Boolean(a.isFavorite);
      const bFavorite = Boolean(b.isFavorite);
      if (aFavorite !== bFavorite) return bFavorite ? 1 : -1;
      return String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""));
    });
}

function canViewerSeeStatus(status, {
  viewerId = "",
  owner = null,
  isFriend = false,
  blocks = [],
} = {}) {
  const normalizedStatus = normalizeStatus(status);
  if (normalizedStatus.isAdminBroadcast) {
    return !isStatusExpired(normalizedStatus);
  }
  const normalizedOwner = normalizeExistingUser(owner || {});
  if (!viewerId || !normalizedOwner.id) return false;
  if (viewerId === normalizedOwner.id) return !isStatusExpired(normalizedStatus);
  if (isStatusExpired(normalizedStatus)) return false;
  if (isBlocked(blocks, viewerId, normalizedOwner.id) || isBlocked(blocks, normalizedOwner.id, viewerId)) {
    return false;
  }
  if (normalizedStatus.visibility === "everyone") return true;
  return isFriend;
}

function isValidEmail(value) {
  return EMAIL_REGEX.test(String(value || "").trim());
}

function normalizeWhitespace(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function normalizeMultilineText(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim().replace(/\s+/g, " "))
    .join("\n")
    .trim();
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

function normalizePointsValue(value) {
  const points = Number(value);
  return Number.isFinite(points) && points > 0 ? Math.round(points) : 0;
}

function normalizePointEvent(rawEvent = {}) {
  return {
    id: String(rawEvent.id || crypto.randomUUID()),
    userId: String(rawEvent.userId || "").trim(),
    delta: Math.max(0, Math.round(Number(rawEvent.delta) || 0)),
    createdAt: String(rawEvent.createdAt || new Date().toISOString()),
  };
}

function getPointsScopeMeta(scope = "daily", nowKey = dateKeyInTimeZone(new Date())) {
  const safeScope = String(scope || "daily").trim().toLowerCase();
  const todayKey = String(nowKey || dateKeyInTimeZone(new Date()));
  if (safeScope === "alltime") {
    return {
      scope: "alltime",
      label: "All Time",
      matches: () => true,
    };
  }

  if (safeScope === "yearly") {
    const yearPrefix = todayKey.slice(0, 4);
    return {
      scope: "yearly",
      label: `Year ${yearPrefix}`,
      matches: (eventKey) => String(eventKey || "").startsWith(yearPrefix),
    };
  }

  if (safeScope === "monthly") {
    const monthPrefix = todayKey.slice(0, 7);
    return {
      scope: "monthly",
      label: monthPrefix,
      matches: (eventKey) => String(eventKey || "").startsWith(monthPrefix),
    };
  }

  if (safeScope === "weekly") {
    const startKey = shiftDateKey(todayKey, -6);
    return {
      scope: "weekly",
      label: `${startKey} to ${todayKey}`,
      matches: (eventKey) => {
        const key = String(eventKey || "");
        return key >= startKey && key <= todayKey;
      },
    };
  }

  return {
    scope: "daily",
    label: todayKey,
    matches: (eventKey) => String(eventKey || "") === todayKey,
  };
}

function buildPointsLeaderboardSnapshot({
  users = [],
  pointEvents = [],
  requestUserId = "",
  scope = "daily",
  limit = null,
}) {
  const safeLimit = Number.isFinite(Number(limit)) && Number(limit) > 0
    ? Math.max(3, Math.round(Number(limit)))
    : null;
  const normalizedUsers = users
    .map(normalizeExistingUser)
    .filter((user) => !isUserCurrentlyDeactivated(user));
  const nowKey = dateKeyInTimeZone(new Date(), DAILY_QUIZ_SEASON.timezone);
  const scopeMeta = getPointsScopeMeta(scope, nowKey);
  const totals = new Map();

  if (scopeMeta.scope === "alltime") {
    normalizedUsers.forEach((user) => {
      totals.set(user.id, normalizePointsValue(user.points));
    });
  } else {
    pointEvents
      .map(normalizePointEvent)
      .filter((row) => row.userId && row.delta > 0)
      .forEach((row) => {
        const eventKey = dateKeyInTimeZone(row.createdAt, DAILY_QUIZ_SEASON.timezone);
        if (!scopeMeta.matches(eventKey)) return;
        totals.set(row.userId, (totals.get(row.userId) || 0) + row.delta);
      });
  }

  const ranked = normalizedUsers
    .map((user) => ({
      userId: user.id,
      displayName: buildDisplayName(user.title, user.firstName, user.lastName, user.username),
      username: user.username,
      profileImage: String(user.profileImage || "").trim(),
      points: Math.max(0, Math.round(Number(totals.get(user.id)) || 0)),
    }))
    .filter((row) => row.points > 0)
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return a.displayName.localeCompare(b.displayName);
    })
    .map((row, index) => ({
      ...row,
      rank: index + 1,
    }));

  const topThree = ranked.slice(0, 3);
  const leaderboard = safeLimit ? ranked.slice(0, safeLimit) : ranked;
  const yourEntry =
    requestUserId && ranked.find((row) => String(row.userId) === String(requestUserId))
      ? ranked.find((row) => String(row.userId) === String(requestUserId))
      : null;

  return {
    scope: scopeMeta.scope,
    label: scopeMeta.label,
    totalPlayers: ranked.length,
    leaderboard,
    topThree,
    yourEntry,
  };
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
  const lastSeenAt = rawUser.lastSeenAt ? String(rawUser.lastSeenAt) : updatedAt;
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
    bio: normalizeBioValue(rawUser.bio),
    profileImage:
      typeof rawUser.profileImage === "string"
        ? rawUser.profileImage.trim()
        : "",
    privacy: normalizePrivacySettings(rawUser.privacy),
    createdAt,
    updatedAt,
    lastSeenAt,
    deactivatedAt,
    deactivatedUntil,
    resetCodeHash: rawUser.resetCodeHash || null,
    resetCodeExpiresAt: rawUser.resetCodeExpiresAt || null,
    points: normalizePointsValue(rawUser.points),
    dailyQuiz: normalizeDailyQuizState(rawUser.dailyQuiz),
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
    bio: normalized.bio,
    profileImage: normalized.profileImage,
    privacy: normalized.privacy,
    createdAt: normalized.createdAt,
    updatedAt: normalized.updatedAt,
    lastSeenAt: normalized.lastSeenAt,
    deactivatedAt: normalized.deactivatedAt,
    deactivatedUntil: normalized.deactivatedUntil,
    points: normalizePointsValue(normalized.points),
    dailyQuiz: summarizeDailyQuizState(normalized.dailyQuiz),
  };
}

function normalizeDeletedUserArchive(rawArchive = {}) {
  const user = normalizeExistingUser(rawArchive.user || {});
  return {
    archiveId: String(rawArchive.archiveId || rawArchive.id || crypto.randomUUID()),
    user,
    userId: user.id,
    deletedAt: String(rawArchive.deletedAt || new Date().toISOString()),
    deletedByType: normalizeWhitespace(rawArchive.deletedByType),
    deletedById: normalizeWhitespace(rawArchive.deletedById),
    deletedByName: normalizeWhitespace(rawArchive.deletedByName),
    deletionReason: normalizeWhitespace(rawArchive.deletionReason),
    restoredAt: rawArchive.restoredAt ? String(rawArchive.restoredAt) : null,
    restoredByType: normalizeWhitespace(rawArchive.restoredByType),
    restoredById: normalizeWhitespace(rawArchive.restoredById),
    restoredByName: normalizeWhitespace(rawArchive.restoredByName),
  };
}

function toPublicDeletedUserArchive(rawArchive) {
  const archive = normalizeDeletedUserArchive(rawArchive);
  const user = toPublicUser(archive.user);
  return {
    ...user,
    archiveId: archive.archiveId,
    deletedAt: archive.deletedAt,
    deletedByType: archive.deletedByType,
    deletedById: archive.deletedById,
    deletedByName: archive.deletedByName,
    deletionReason: archive.deletionReason,
    restoredAt: archive.restoredAt,
    restoredByType: archive.restoredByType,
    restoredById: archive.restoredById,
    restoredByName: archive.restoredByName,
  };
}

function buildAdminGroupSummary(conversation = {}, { users = [], uploads = [] } = {}) {
  const normalized = normalizeConversation(conversation);
  const owner = users.find((entry) => entry.id === normalized.ownerUserId) || null;
  const avatarUpload = uploads.find((entry) => entry.id === normalized.avatarUploadId) || null;
  return {
    id: normalized.id,
    name: normalized.name || "Study Group",
    bio: normalized.bio || "",
    ownerId: normalized.ownerUserId || "",
    ownerName: owner?.name || owner?.username || "Unknown",
    ownerUsername: owner?.username || "",
    ownerProfileImage: owner?.profileImage || "",
    avatarUrl: avatarUpload ? resolveUploadPublicView(avatarUpload).dataUrl : "",
    memberCount: normalized.memberIds.length,
    adminCount: normalized.adminIds.length,
    createdAt: normalized.createdAt,
    updatedAt: normalized.updatedAt,
    inviteToken: normalized.inviteToken || "",
    inviteExpiresAt: getConversationInviteExpiresAt(normalized),
    inviteExpired: isConversationInviteExpired(normalized),
    permissions: normalizeGroupPermissions(normalized.permissions || {}),
  };
}

function buildAdminGroupDetail(conversation = {}, { users = [], uploads = [] } = {}) {
  const normalized = normalizeConversation(conversation);
  const group = buildAdminGroupSummary(normalized, { users, uploads });
  const members = normalized.memberIds
    .map((memberId) => {
      const member = users.find((entry) => entry.id === memberId);
      if (!member) {
        return {
          id: memberId,
          title: "",
          firstName: "",
          lastName: "",
          surname: "",
          name: "Unknown member",
          username: "",
          contact: "",
          contactType: "",
          email: "",
          role:
            memberId === normalized.ownerUserId
              ? "owner"
              : normalized.adminIds.includes(memberId)
                ? "admin"
                : "member",
          subscriptionTier: "",
          professionalType: "",
          country: "",
          institution: "",
          bio: "",
          profileImage: "",
          privacy: {},
          createdAt: "",
          updatedAt: "",
          lastSeenAt: "",
          deactivatedAt: "",
          deactivatedUntil: "",
          points: 0,
          dailyQuiz: null,
        };
      }
      return {
        ...toPublicUser(member),
        role:
          memberId === normalized.ownerUserId
            ? "owner"
            : normalized.adminIds.includes(memberId)
              ? "admin"
              : "member",
      };
    })
    .filter(Boolean);
  return {
    ...group,
    members,
  };
}

function getAdminNoticeRecipientIdsForGroup(conversation = {}, { users = [] } = {}) {
  const normalized = normalizeConversation(conversation);
  const candidateIds = [...new Set([normalized.ownerUserId, ...normalized.adminIds])]
    .map((value) => String(value || "").trim())
    .filter(Boolean);
  return candidateIds.filter((userId) => users.some((entry) => entry.id === userId));
}

function normalizeAdminWarningTitle(value = "") {
  const title = normalizeWhitespace(value);
  if (!title || title.toLowerCase() === "custom") {
    return "Community rules reminder";
  }
  return title.slice(0, 120);
}

function buildAdminWarningNoticeBody(report = {}, warningTitle = "") {
  const normalizedReport = normalizeAdminReport(report);
  const title = normalizeAdminWarningTitle(warningTitle);
  const targetLabel =
    normalizedReport.type === "group"
      ? `the group "${normalizeWhitespace(normalizedReport.targetName || normalizedReport.targetId || "this group").slice(0, 120)}"`
      : normalizedReport.targetUsername
        ? `@${normalizeWhitespace(normalizedReport.targetUsername).slice(0, 120)}`
        : `the account "${normalizeWhitespace(normalizedReport.targetName || normalizedReport.targetId || "this user").slice(0, 120)}"`;
  const reportDate = normalizedReport.createdAt ? new Date(normalizedReport.createdAt) : null;
  const formattedDate =
    reportDate && !Number.isNaN(reportDate.getTime())
      ? reportDate.toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "the reported time";
  const reason = normalizeWhitespace(normalizedReport.reason || "a community standards concern").slice(0, 240);
  const closingLineByTitle = {
    "Community rules reminder":
      "Please take this warning seriously to avoid suspension or permanent deletion of your account.",
    "Please keep the discussion respectful": "Please keep all communication respectful and avoid harassment, threats, or abuse.",
    "No spam, scams, or impersonation": "Do not send spam, scams, deceptive links, or impersonate other people.",
    "Follow the group guidelines": "Please follow the group guidelines immediately and avoid any further violations.",
  };
  const closingLine =
    closingLineByTitle[title] || "Please review this warning carefully and correct the reported conduct immediately.";
  return [
    `We received a report on ${formattedDate} concerning ${targetLabel}.`,
    `Reported concern: ${reason}.`,
    "This appears to violate our community guidelines and requires immediate attention.",
    "Please review this notice carefully and ensure all future activity follows the rules.",
    closingLine,
  ].join("\n\n");
}

async function sendAdminNoticeToRecipients(
  recipientIds = [],
  {
    text = "",
    title = "Admin Notice",
    subtitle = "Messages from the admin team",
    originType = "",
    originId = "",
    originName = "",
    senderName = ADMIN_NOTICE_SENDER_NAME,
    upload = null,
    noticeThreadKey = "",
    noticeBatchId = "",
  } = {},
) {
  const uniqueRecipientIds = [...new Set(
    Array.isArray(recipientIds)
      ? recipientIds.map((value) => String(value || "").trim()).filter(Boolean)
      : [],
  )];
  if (!uniqueRecipientIds.length) {
    throw new Error("recipient required");
  }
  if (!String(text || "").trim()) {
    if (!upload) {
      throw new Error("message text is required");
    }
  }

  let storedUpload = null;
  if (upload) {
    const uploadRecords = (await readCollection("uploads")).map(normalizeUpload);
    const persistedUploadResult = persistUploadRecord(uploadRecords, upload);
    storedUpload = persistedUploadResult.upload;
    if (storedUpload) {
      await writeCollection("uploads", persistedUploadResult.uploads);
    }
  }

  const results = [];
  const safeThreadKey = normalizeWhitespace(noticeThreadKey || "").slice(0, 120);
  const safeBatchId = String(noticeBatchId || "").trim() || crypto.randomUUID();
  for (const recipientId of uniqueRecipientIds) {
    // Send each recipient their own inbox thread so notices stay private and readable.
    // eslint-disable-next-line no-await-in-loop
    results.push(await persistAdminNoticeMessage({
      recipientId,
      text,
      title,
      subtitle,
      originType,
      originId,
      originName,
      senderName,
      storedUpload,
      noticeThreadKey: safeThreadKey,
      noticeBatchId: safeBatchId,
    }));
  }
  return results;
}

async function persistGlobalAdminBroadcastMessage({
  text = "",
  senderName = ADMIN_NOTICE_SENDER_NAME,
  upload = null,
  noticeBatchId = "",
} = {}) {
  const safeText = String(text || "").trim();
  const safeSenderName = normalizeWhitespace(senderName).slice(0, 80) || ADMIN_NOTICE_SENDER_NAME;
  const safeBatchId = String(noticeBatchId || "").trim() || crypto.randomUUID();
  let storedUpload = null;
  if (upload) {
    const uploadRecords = (await readCollection("uploads")).map(normalizeUpload);
    const persistedUploadResult = persistUploadRecord(uploadRecords, upload);
    storedUpload = persistedUploadResult.upload;
    if (storedUpload) {
      await writeCollection("uploads", persistedUploadResult.uploads);
    }
  }
  if (!safeText && !storedUpload) {
    throw new Error("message text or attachment is required");
  }
  const broadcastMessages = (await readCollection("adminBroadcastMessages")).map(normalizeAdminBroadcastMessage);
  const message = normalizeAdminBroadcastMessage({
    conversationId: ADMIN_BROADCAST_CONVERSATION_ID,
    senderUserId: ADMIN_NOTICE_SENDER_ID,
    senderName: safeSenderName,
    text: safeText,
    type: storedUpload ? getMessageTypeFromUpload(storedUpload) : "text",
    attachment: storedUpload
      ? {
          uploadId: storedUpload.id,
          kind: getMessageTypeFromUpload(storedUpload),
          fileName: storedUpload.fileName,
          mimeType: storedUpload.mimeType,
        }
      : null,
    deliveredAt: null,
    readAt: null,
    seenByUserIds: [],
    hiddenForUserIds: [],
    noticeThreadKey: ADMIN_BROADCAST_THREAD_KEY,
    noticeBatchId: safeBatchId,
  });
  broadcastMessages.push(message);
  await writeCollection("adminBroadcastMessages", broadcastMessages);
  fireCommunityRealtimeMessages([
    buildCommunityOverviewRealtimeMessage("conversations", {
      reason: "admin-broadcast-message-created",
      conversationId: ADMIN_BROADCAST_CONVERSATION_ID,
      messageId: message.id,
    }),
  ]);
  return message;
}

async function createAdminNoticeAttachmentUpload({
  attachmentDataUrl = "",
  attachmentFileName = "",
} = {}) {
  const safeAttachmentDataUrl = String(attachmentDataUrl || "").trim();
  if (!safeAttachmentDataUrl) {
    return null;
  }
  const parsedAttachment = parseDataUrlByMime(safeAttachmentDataUrl);
  if (!parsedAttachment) {
    throw new Error("Invalid attachment.");
  }
  try {
    await moderateCommunityUploadBuffer(
      Buffer.from(parsedAttachment.dataUrl.split(";base64,")[1] || "", "base64"),
      parsedAttachment.mimeType,
    );
    const attachmentKind = ALLOWED_IMAGE_MIME_TYPES.has(parsedAttachment.mimeType)
      ? "chat-image"
      : ALLOWED_VIDEO_MIME_TYPES.has(parsedAttachment.mimeType)
        ? "chat-video"
        : ALLOWED_AUDIO_MIME_TYPES.has(parsedAttachment.mimeType)
          ? "chat-audio"
          : "chat-file";
    return createStoredUploadFromDataUrl({
      ownerUserId: ADMIN_NOTICE_SENDER_ID,
      kind: attachmentKind,
      fileName: attachmentFileName || "attachment",
      dataUrl: parsedAttachment.dataUrl,
    });
  } catch (error) {
    throw new Error(String(error?.message || "Invalid attachment."));
  }
}

function getAdminNoticeThreadSendMetadata(threadKey = "", { users = [], conversations = [], reports = [] } = {}) {
  const parsed = parseAdminNoticeThreadKey(threadKey);
  if (!parsed) return null;
  const { originType, originId } = parsed;
  if (originType === "broadcast") {
    return {
      recipientIds: users.filter((entry) => !isUserCurrentlyDeactivated(entry)).map((entry) => entry.id),
      title: "Broadcast",
      subtitle: "Announcement sent to all users",
      originType: "broadcast",
      originId: "all-users",
      originName: "All users",
      threadKey: "broadcast",
    };
  }
  if (originType === "user") {
    const targetUser = users.find((entry) => entry.id === originId) || null;
    if (!targetUser) return null;
    return {
      recipientIds: [targetUser.id],
      title: "Admin Message",
      subtitle: `Direct message for ${targetUser.name || targetUser.username || "this user"}`,
      originType: "user",
      originId: targetUser.id,
      originName: targetUser.name || targetUser.username || targetUser.id,
      threadKey: buildAdminNoticeThreadKey("user", targetUser.id),
    };
  }
  if (originType === "group") {
    const conversation = conversations.find((entry) => entry.id === originId && entry.type === "group") || null;
    if (!conversation) return null;
    const recipientIds = getAdminNoticeRecipientIdsForGroup(conversation, { users });
    if (!recipientIds.length) return null;
    return {
      recipientIds,
      title: "Group Notice",
      subtitle: `Group: ${conversation.name || conversation.id}`,
      originType: "group",
      originId: conversation.id,
      originName: conversation.name || conversation.id,
      threadKey: buildAdminNoticeThreadKey("group", conversation.id),
    };
  }
  if (originType === "report") {
    const report = reports.find((entry) => entry.id === originId) || null;
    if (!report) return null;
    const recipientIds =
      report.type === "group"
        ? getAdminNoticeRecipientIdsForGroup(
            conversations.find((entry) => entry.id === report.targetId && entry.type === "group") || {},
            { users },
          )
        : [report.targetId];
    const safeRecipients = [...new Set(recipientIds.map((value) => String(value || "").trim()).filter(Boolean))];
    if (!safeRecipients.length) return null;
    return {
      recipientIds: safeRecipients,
      title: report.warningPreset || "Community rules reminder",
      subtitle: `Report warning for ${report.targetName || report.targetUsername || report.targetId || "this account"}`,
      originType: "report",
      originId: report.id,
      originName: report.targetName || report.targetUsername || report.targetId || "",
      threadKey: buildAdminNoticeThreadKey("report", report.id),
    };
  }
  return null;
}

function buildAdminBroadcastThreadOverview(thread = {}) {
  const latestMessage = thread?.lastMessage || null;
  return {
    threadKey: thread.threadKey,
    title: thread.title,
    subtitle: thread.subtitle,
    originType: thread.originType,
    originId: thread.originId,
    originName: thread.originName,
    latestAt: thread.latestAt,
    recipientCount: thread.recipientCount || 0,
    batchCount: thread.batchCount || 0,
    previewText: thread.previewText || "",
    lastMessage: latestMessage,
  };
}

function normalizeAdminReport(rawReport = {}) {
  const type = String(rawReport.type || "group").trim().toLowerCase();
  return {
    id: String(rawReport.id || crypto.randomUUID()),
    type: type === "user" ? "user" : "group",
    status: normalizeWhitespace(rawReport.status) || "open",
    targetId: String(rawReport.targetId || ""),
    targetName: normalizeWhitespace(rawReport.targetName),
    targetUsername: normalizeWhitespace(rawReport.targetUsername),
    reporterUserId: String(rawReport.reporterUserId || ""),
    reporterName: normalizeWhitespace(rawReport.reporterName),
    reason: normalizeWhitespace(rawReport.reason),
    warningMessage: normalizeMultilineText(rawReport.warningMessage),
    warningPreset: normalizeWhitespace(rawReport.warningPreset),
    warningById: String(rawReport.warningById || ""),
    warningByName: normalizeWhitespace(rawReport.warningByName),
    warningIssuedAt: String(rawReport.warningIssuedAt || ""),
    createdAt: String(rawReport.createdAt || new Date().toISOString()),
    updatedAt: String(rawReport.updatedAt || rawReport.createdAt || new Date().toISOString()),
  };
}

function buildAdminReportSnapshot(
  rawReport = {},
  { users = [], conversations = [], uploads = [], includeTargetDetails = true } = {},
) {
  const report = normalizeAdminReport(rawReport);
  const reporter = users.find((entry) => entry.id === report.reporterUserId) || null;
  let target = null;
  if (report.type === "group") {
    const conversation = conversations.find((entry) => entry.id === report.targetId && entry.type === "group") || null;
    target = conversation
      ? includeTargetDetails
        ? buildAdminGroupDetail(conversation, { users, uploads })
        : buildAdminGroupSummary(conversation, { users, uploads })
      : {
          id: report.targetId,
          name: report.targetName || "Study Group",
          bio: "",
          ownerId: "",
          ownerName: "",
          ownerUsername: "",
          ownerProfileImage: "",
          avatarUrl: "",
          memberCount: 0,
          adminCount: 0,
          createdAt: "",
          updatedAt: "",
          inviteToken: "",
          inviteExpiresAt: "",
          inviteExpired: true,
          permissions: normalizeGroupPermissions({}),
          members: [],
        };
  } else if (report.type === "user") {
    const user = users.find((entry) => entry.id === report.targetId) || null;
    target = user
      ? toPublicUser(user)
      : {
          id: report.targetId,
          name: report.targetName || "",
          username: report.targetUsername || "",
          profileImage: "",
        };
  }
  return {
    ...report,
    reporter: reporter
      ? toPublicUser(reporter)
      : {
          id: report.reporterUserId,
          name: report.reporterName || "",
          username: "",
          profileImage: "",
        },
    target,
  };
}

async function archiveDeletedUser(user, metadata = {}) {
  const normalizedUser = normalizeExistingUser(user);
  const nowIso = new Date().toISOString();
  const archiveRecord = {
    archiveId: crypto.randomUUID(),
    userId: normalizedUser.id,
    deletedAt: nowIso,
    deletedByType: normalizeWhitespace(metadata.deletedByType),
    deletedById: normalizeWhitespace(metadata.deletedById),
    deletedByName: normalizeWhitespace(metadata.deletedByName),
    deletionReason: normalizeWhitespace(metadata.deletionReason),
    restoredAt: null,
    restoredByType: "",
    restoredById: "",
    restoredByName: "",
    user: {
      ...normalizedUser,
      deactivatedAt: normalizedUser.deactivatedAt || null,
      deactivatedUntil: normalizedUser.deactivatedUntil || null,
    },
  };

  await updateCollection("deletedUsers", async (items) => [...items, archiveRecord]);
  return archiveRecord;
}

async function appendAdminReportRecord(reportRecord = {}) {
  const reports = await readCollection("reports");
  reports.push(reportRecord);
  await writeCollection("reports", reports);
  return reportRecord;
}

function normalizeDeletedGroupArchive(rawArchive = {}) {
  const group = normalizeConversation(rawArchive.group || {});
  return {
    archiveId: String(rawArchive.archiveId || rawArchive.id || crypto.randomUUID()),
    group,
    groupId: group.id,
    deletedAt: String(rawArchive.deletedAt || new Date().toISOString()),
    deletedByType: normalizeWhitespace(rawArchive.deletedByType),
    deletedById: normalizeWhitespace(rawArchive.deletedById),
    deletedByName: normalizeWhitespace(rawArchive.deletedByName),
    deletionReason: normalizeWhitespace(rawArchive.deletionReason),
    restoredAt: rawArchive.restoredAt ? String(rawArchive.restoredAt) : null,
    restoredByType: normalizeWhitespace(rawArchive.restoredByType),
    restoredById: normalizeWhitespace(rawArchive.restoredById),
    restoredByName: normalizeWhitespace(rawArchive.restoredByName),
  };
}

function toPublicDeletedGroupArchive(rawArchive, { users = [], uploads = [] } = {}) {
  const archive = normalizeDeletedGroupArchive(rawArchive);
  const summary = buildAdminGroupSummary(archive.group, { users, uploads });
  return {
    ...summary,
    archiveId: archive.archiveId,
    deletedAt: archive.deletedAt,
    deletedByType: archive.deletedByType,
    deletedById: archive.deletedById,
    deletedByName: archive.deletedByName,
    deletionReason: archive.deletionReason,
    restoredAt: archive.restoredAt,
    restoredByType: archive.restoredByType,
    restoredById: archive.restoredById,
    restoredByName: archive.restoredByName,
  };
}

async function archiveDeletedGroup(group, metadata = {}) {
  const normalizedGroup = normalizeConversation(group);
  const nowIso = new Date().toISOString();
  const archiveRecord = {
    archiveId: crypto.randomUUID(),
    groupId: normalizedGroup.id,
    deletedAt: nowIso,
    deletedByType: normalizeWhitespace(metadata.deletedByType),
    deletedById: normalizeWhitespace(metadata.deletedById),
    deletedByName: normalizeWhitespace(metadata.deletedByName),
    deletionReason: normalizeWhitespace(metadata.deletionReason),
    restoredAt: null,
    restoredByType: "",
    restoredById: "",
    restoredByName: "",
    group: {
      ...normalizedGroup,
      updatedAt: normalizedGroup.updatedAt || nowIso,
    },
  };

  await updateCollection("deletedGroups", async (items) => [...items, archiveRecord]);
  return archiveRecord;
}

function buildRestoredGroupFromArchive(archive) {
  const restoredGroup = normalizeConversation(archive.group);
  return {
    ...restoredGroup,
    updatedAt: new Date().toISOString(),
  };
}

function buildRestoredUserFromArchive(archive) {
  const nowIso = new Date().toISOString();
  const restoredUser = normalizeExistingUser(archive.user);
  return {
    ...restoredUser,
    deactivatedAt: null,
    deactivatedUntil: null,
    updatedAt: nowIso,
  };
}

function findRestoreConflicts(activeUsers, restoredUser) {
  const normalizedUsername = normalizeIdentifier(restoredUser.username);
  const normalizedEmail = normalizeIdentifier(restoredUser.email);
  const normalizedContact = normalizeIdentifier(restoredUser.contact);
  const contactDigits = normalizePhoneComparable(restoredUser.contact);

  return activeUsers.filter((candidate) => {
    if (candidate.id === restoredUser.id) return true;
    if (normalizedUsername && normalizeIdentifier(candidate.username) === normalizedUsername) {
      return true;
    }
    if (normalizedEmail && normalizeIdentifier(candidate.email) === normalizedEmail) {
      return true;
    }
    if (normalizedContact && normalizeIdentifier(candidate.contact) === normalizedContact) {
      return true;
    }
    if (contactDigits && normalizePhoneComparable(candidate.contact) === contactDigits) {
      return true;
    }
    return false;
  });
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

function dateKeyInTimeZone(dateInput = new Date(), timeZone = DAILY_QUIZ_SEASON.timezone) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return date.toLocaleDateString("en-CA", { timeZone });
}

function shiftDateKey(dateKey, days = 0) {
  const [year, month, day] = String(dateKey || "")
    .split("-")
    .map((part) => Number(part));
  if (!year || !month || !day) return "";
  const utc = new Date(Date.UTC(year, month - 1, day));
  utc.setUTCDate(utc.getUTCDate() + Number(days || 0));
  return utc.toISOString().slice(0, 10);
}

function isDateWithinDailySeason(dateKey) {
  const value = String(dateKey || "");
  return value >= DAILY_QUIZ_SEASON.start && value <= DAILY_QUIZ_SEASON.end;
}

function isWeekendInTimeZone(dateInput = new Date(), timeZone = DAILY_QUIZ_SEASON.timezone) {
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone,
  }).format(dateInput instanceof Date ? dateInput : new Date(dateInput));
  return weekday === "Sat" || weekday === "Sun";
}

function hashString32(text) {
  let hash = 2166136261;
  const value = String(text || "");
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededShuffle(array, seedText) {
  let seed = hashString32(seedText);
  const nextRand = () => {
    seed = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    seed ^= seed + Math.imul(seed ^ (seed >>> 7), 61 | seed);
    return ((seed ^ (seed >>> 14)) >>> 0) / 4294967296;
  };
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(nextRand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalizeDailyQuizState(rawState = {}) {
  const days = rawState?.days && typeof rawState.days === "object" ? rawState.days : {};
  const normalizedDays = {};

  Object.entries(days).forEach(([dateKey, value]) => {
    if (!isDateWithinDailySeason(dateKey)) return;
    if (!value || typeof value !== "object") return;
    const questionIds = Array.isArray(value.questionIds)
      ? value.questionIds
          .map((id) => Number(id))
          .filter((id) => Number.isFinite(id))
      : [];
    normalizedDays[dateKey] = {
      questionIds,
      submittedAt: value.submittedAt ? String(value.submittedAt) : null,
      score: Number.isFinite(Number(value.score)) ? Number(value.score) : null,
      total: Number.isFinite(Number(value.total)) ? Number(value.total) : null,
      percent: Number.isFinite(Number(value.percent)) ? Number(value.percent) : null,
      rewards: value.rewards && typeof value.rewards === "object" ? value.rewards : null,
    };
  });

  return {
    seasonKey: String(rawState?.seasonKey || DAILY_QUIZ_SEASON.key),
    gems: Number.isFinite(Number(rawState?.gems)) ? Number(rawState.gems) : 0,
    streak: Number.isFinite(Number(rawState?.streak)) ? Number(rawState.streak) : 0,
    lastCompletedDate: rawState?.lastCompletedDate
      ? String(rawState.lastCompletedDate)
      : null,
    totalCompleted: Number.isFinite(Number(rawState?.totalCompleted))
      ? Number(rawState.totalCompleted)
      : 0,
    days: normalizedDays,
  };
}

function getDailySeasonTotalDays() {
  const start = new Date(`${DAILY_QUIZ_SEASON.start}T00:00:00.000Z`);
  const end = new Date(`${DAILY_QUIZ_SEASON.end}T00:00:00.000Z`);
  const startMs = start.getTime();
  const endMs = end.getTime();
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs < startMs) {
    return 1;
  }
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.max(1, Math.floor((endMs - startMs) / dayMs) + 1);
}

function summarizeDailyQuizState(rawState = {}) {
  const state = normalizeDailyQuizState(rawState);
  const completedDays = Object.values(state.days).filter((row) => Boolean(row?.submittedAt)).length;
  const totalSeasonDays = getDailySeasonTotalDays();
  return {
    seasonKey: state.seasonKey,
    gems: state.gems,
    streak: state.streak,
    lastCompletedDate: state.lastCompletedDate,
    totalCompleted: state.totalCompleted,
    completedDays,
    totalSeasonDays,
    progressPercent: Math.round((completedDays / totalSeasonDays) * 100),
  };
}

function ensureDailyQuizQuestionsForDate(state, userId, dateKey, allQuestions = []) {
  const perDay = DAILY_QUIZ_SEASON.questionsPerDay;
  const existingDay = state.days[dateKey];
  if (existingDay?.questionIds?.length === perDay) {
    return existingDay.questionIds;
  }

  const questionIds = allQuestions
    .map((q) => Number(q.id))
    .filter((id) => Number.isFinite(id));
  const seed = `${DAILY_QUIZ_SEASON.key}:${userId}:${dateKey}`;
  const shuffled = seededShuffle(questionIds, seed);
  const picked = shuffled.slice(0, perDay);
  state.days[dateKey] = {
    ...(existingDay || {}),
    questionIds: picked,
    submittedAt: existingDay?.submittedAt || null,
    score: existingDay?.score ?? null,
    total: existingDay?.total ?? null,
    percent: existingDay?.percent ?? null,
    rewards: existingDay?.rewards || null,
  };
  return picked;
}

function buildDailyQuizResponse(state, dateKey) {
  const summary = summarizeDailyQuizState(state);
  const day = state.days[dateKey] || {
    questionIds: [],
    submittedAt: null,
    score: null,
    total: DAILY_QUIZ_SEASON.questionsPerDay,
    percent: null,
    rewards: null,
  };
  const nowKey = dateKeyInTimeZone();
  const seasonActive = isDateWithinDailySeason(nowKey);
  const history = Object.entries(state.days || {})
    .filter(([, row]) => row && typeof row === "object" && row.submittedAt)
    .sort(([leftDate], [rightDate]) => rightDate.localeCompare(leftDate))
    .slice(0, 20)
    .map(([historyDate, row]) => {
      const rewards =
        row.rewards && typeof row.rewards === "object" ? row.rewards : {};
      return {
        date: historyDate,
        score: Number.isFinite(Number(row.score)) ? Number(row.score) : 0,
        total:
          Number.isFinite(Number(row.total)) && Number(row.total) > 0
            ? Number(row.total)
            : DAILY_QUIZ_SEASON.questionsPerDay,
        percent: Number.isFinite(Number(row.percent)) ? Number(row.percent) : 0,
        gems: Number(rewards.total) || 0,
        submittedAt: String(row.submittedAt || ""),
      };
    });
  return {
    ok: true,
    season: {
      key: DAILY_QUIZ_SEASON.key,
      start: DAILY_QUIZ_SEASON.start,
      end: DAILY_QUIZ_SEASON.end,
      timezone: DAILY_QUIZ_SEASON.timezone,
      active: seasonActive,
      questionsPerDay: DAILY_QUIZ_SEASON.questionsPerDay,
    },
    rewardRules: DAILY_REWARD_RULES,
    today: {
      date: dateKey,
      completed: Boolean(day.submittedAt),
      questionIds: day.questionIds || [],
      score: day.score,
      total: day.total ?? DAILY_QUIZ_SEASON.questionsPerDay,
      percent: day.percent,
      rewards: day.rewards || null,
      submittedAt: day.submittedAt || null,
    },
    stats: summary,
    history,
  };
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
  const users = await readCollection("users");
  if (!Array.isArray(users) || users.length === 0) {
    return 0;
  }

  const now = Date.now();
  const nowIso = new Date(now).toISOString();
  let cleared = 0;
  const next = users.map((user) => {
    const normalized = normalizeExistingUser(user);
    const untilMs = Date.parse(String(normalized.deactivatedUntil || ""));
    if (!Number.isFinite(untilMs) || untilMs > now) return normalized;

    cleared += 1;
    return {
      ...normalized,
      deactivatedUntil: null,
      updatedAt: nowIso,
    };
  });

  if (cleared === 0) {
    return 0;
  }

  try {
    await writeCollection("users", next);
  } catch (error) {
    if (!isSkippableUsersWriteError(error)) {
      throw error;
    }
  }

  return cleared;
}

async function normalizeStoredUsers() {
  let changed = 0;
  let total = 0;
  const existingUsers = await readCollection("users");
  if (!Array.isArray(existingUsers) || existingUsers.length === 0) {
    return { changed: 0, total: Array.isArray(existingUsers) ? existingUsers.length : 0 };
  }

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
  const drillTags = Array.isArray(rawQuestion?.drillTags)
    ? rawQuestion.drillTags.map((tag) => String(tag || "").trim().toLowerCase()).filter(Boolean)
    : [];
  const normalizedCategory = normalizeMajorCategory(
    rawQuestion?.category,
    [
      text,
      String(rawQuestion?.explanation || ""),
      `sectionid:${sectionId || ""}`,
      `topic:${topicSlug || ""}`,
      `drilltags:${drillTags.join(",")}`,
      `lawdrill:${rawQuestion?.lawDrill === true ? "true" : "false"}`,
    ]
      .filter(Boolean)
      .join(" "),
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
    drillTags: drillTags.length > 0 ? drillTags : undefined,
    lawDrill:
      rawQuestion?.lawDrill === true ||
      drillTags.includes("law") ||
      String(sectionId || "").includes("law-drill"),
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

function normalizeChoiceText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function extractOptionLetter(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (/^[A-E]$/i.test(text)) return text.toUpperCase();
  const match = text.match(/^([A-E])(?:[\).:\-\s]|$)/i);
  return match ? match[1].toUpperCase() : "";
}

function trimLeadingOptionLetter(value) {
  return String(value || "")
    .trim()
    .replace(/^[A-E](?:[\).:\-\s])+/i, "")
    .trim();
}

function buildChoiceCatalog(question = {}) {
  const options = Array.isArray(question?.options) ? question.options : [];
  let rows = options.map((option, index) => {
    const letter = String.fromCharCode(65 + index);
    return {
      letter,
      text: String(option || "").trim(),
      normalized: normalizeChoiceText(option),
      normalizedNoPrefix: normalizeChoiceText(trimLeadingOptionLetter(option)),
    };
  });

  if (rows.length === 0 && String(question?.type || "").trim().toLowerCase() === "combo") {
    rows = ["A", "B", "C", "D", "E"].map((letter) => ({
      letter,
      text: `Option ${letter}`,
      normalized: normalizeChoiceText(letter),
      normalizedNoPrefix: normalizeChoiceText(letter),
    }));
  }

  let correctLetter = extractOptionLetter(question?.correct);

  if (!correctLetter && rows.length > 0) {
    const correctNorm = normalizeChoiceText(question?.correct);
    const match = rows.find(
      (row) =>
        row.normalized === correctNorm || row.normalizedNoPrefix === correctNorm,
    );
    if (match) {
      correctLetter = match.letter;
    }
  }

  if (!correctLetter && rows.length > 0) {
    const correctIndex = safeNumber(question?.correct);
    if (Number.isInteger(correctIndex) && correctIndex >= 0 && correctIndex < rows.length) {
      correctLetter = rows[correctIndex].letter;
    }
  }

  if (correctLetter && !rows.some((row) => row.letter === correctLetter)) {
    correctLetter = "";
  }

  return { rows, correctLetter };
}

function resolveSelectionLetter(selection, catalog) {
  const rows = Array.isArray(catalog?.rows) ? catalog.rows : [];
  if (rows.length === 0) return "";

  const direct = extractOptionLetter(selection);
  if (direct && rows.some((row) => row.letter === direct)) {
    return direct;
  }

  const normalized = normalizeChoiceText(selection);
  if (!normalized) return "";

  const match = rows.find(
    (row) =>
      row.normalized === normalized || row.normalizedNoPrefix === normalized,
  );
  return match ? match.letter : "";
}

function buildQuestionMemoryTrick(question, correctLetter, mostChosenLetter) {
  const explicit = normalizeWhitespace(question?.memoryTrick);
  if (explicit) return explicit;
  return "";
}

function parseDurationSeconds(value) {
  if (value === null || value === undefined) return null;
  const numeric = safeNumber(value);
  if (Number.isFinite(numeric) && numeric >= 0) return Math.round(numeric);
  const match = String(value).match(/(\d+)\s*s/i);
  if (match) return Number(match[1]);
  return null;
}

function compareRowsByDuration(a, b) {
  const aHas = Number.isFinite(a?.durationSeconds);
  const bHas = Number.isFinite(b?.durationSeconds);
  if (aHas && bHas) {
    return a.durationSeconds - b.durationSeconds;
  }
  if (aHas) return -1;
  if (bHas) return 1;
  return 0;
}

function isBetterDailyLeaderboardRow(nextRow, currentRow) {
  if (!currentRow) return true;
  if (nextRow.percent !== currentRow.percent) {
    return nextRow.percent > currentRow.percent;
  }
  if (nextRow.score !== currentRow.score) {
    return nextRow.score > currentRow.score;
  }
  if (nextRow.total !== currentRow.total) {
    return nextRow.total > currentRow.total;
  }
  const durationCompare = compareRowsByDuration(nextRow, currentRow);
  if (durationCompare !== 0) {
    return durationCompare < 0;
  }
  return new Date(nextRow.createdAt).getTime() < new Date(currentRow.createdAt).getTime();
}

function displayNameForActor(actorId, usersById, requestActorId) {
  if (actorId === requestActorId) {
    return "You";
  }

  const actor = String(actorId || "");
  if (actor.startsWith("user:")) {
    const userId = actor.slice("user:".length);
    const user = usersById.get(userId);
    const preferred = normalizeWhitespace(user?.username);
    if (preferred) return preferred;
    return `Learner ${userId.slice(0, 4)}`;
  }

  if (actor.startsWith("client:")) {
    const suffix = actor.slice("client:".length).replace(/[^a-z0-9]/gi, "");
    const short = suffix.slice(-4).toUpperCase() || "GUEST";
    return `Guest ${short}`;
  }

  return "Learner";
}

function buildDailyLeaderboardSnapshot({
  sessions = [],
  usersById = new Map(),
  requestActorId = "",
  dateKey = dateKeyInTimeZone(),
  limit = 10,
}) {
  const perActorBest = new Map();

  sessions.forEach((session) => {
    const actorId = String(session?.actorId || "").trim();
    if (!actorId) return;

    const mode = String(session?.mode || "")
      .trim()
      .toLowerCase();
    if (!mode.startsWith("daily")) return;

    const createdAt = new Date(session?.createdAt || "");
    if (Number.isNaN(createdAt.getTime())) return;
    if (dateKeyInTimeZone(createdAt) !== dateKey) return;

    const score = Math.max(0, Number(session?.score) || 0);
    const total = Math.max(0, Number(session?.total) || 0);
    if (total <= 0) return;
    const percent = Math.max(
      0,
      Math.min(
        100,
        Number.isFinite(Number(session?.percent))
          ? Number(session.percent)
          : Math.round((score / total) * 100),
      ),
    );

    const row = {
      actorId,
      score,
      total,
      percent,
      durationSeconds: parseDurationSeconds(session?.duration),
      createdAt: String(session?.createdAt || new Date().toISOString()),
    };

    const currentBest = perActorBest.get(actorId);
    if (isBetterDailyLeaderboardRow(row, currentBest)) {
      perActorBest.set(actorId, row);
    }
  });

  const sorted = [...perActorBest.values()].sort((a, b) => {
    if (b.percent !== a.percent) return b.percent - a.percent;
    if (b.score !== a.score) return b.score - a.score;
    if (b.total !== a.total) return b.total - a.total;
    const durationCompare = compareRowsByDuration(a, b);
    if (durationCompare !== 0) return durationCompare;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const totalPlayers = sorted.length;
  const topRows = sorted.slice(0, Math.max(1, limit)).map((row, index) => {
    const rank = index + 1;
    return {
      rank,
      displayName: displayNameForActor(row.actorId, usersById, requestActorId),
      score: row.score,
      total: row.total,
      percent: row.percent,
      durationSeconds: row.durationSeconds,
      isYou: row.actorId === requestActorId,
      topPercentile: Math.max(1, Math.round((rank / Math.max(1, totalPlayers)) * 100)),
    };
  });

  const yourIndex = sorted.findIndex((row) => row.actorId === requestActorId);
  const yourBest =
    yourIndex === -1
      ? null
      : {
          rank: yourIndex + 1,
          score: sorted[yourIndex].score,
          total: sorted[yourIndex].total,
          percent: sorted[yourIndex].percent,
          durationSeconds: sorted[yourIndex].durationSeconds,
          topPercentile: Math.max(
            1,
            Math.round(((yourIndex + 1) / Math.max(1, totalPlayers)) * 100),
          ),
        };

  return {
    totalPlayers,
    leaderboard: topRows,
    yourBest,
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
app.use(express.json({ limit: "220mb" }));
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
    const title = normalizeWhitespace(req.body?.title || "");
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
      normalizeProfessionalTypeValue(req.body?.professionalType) || "";
    const country = normalizeWhitespace(req.body?.country || "");
    const institution = normalizeWhitespace(req.body?.institution || "");

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
      bio: "",
      profileImage: "",
      privacy: normalizePrivacySettings({}),
      passwordHash: await hashPassword(password),
      createdAt,
      updatedAt: createdAt,
      deactivatedAt: null,
      deactivatedUntil: null,
      resetCodeHash: null,
      resetCodeExpiresAt: null,
      points: 0,
      dailyQuiz: normalizeDailyQuizState({}),
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
  "/api/auth/points",
  requireAuth,
  asyncHandler(async (req, res) => {
    await purgeExpiredDeactivatedUsers();
    const delta = Math.round(Number(req.body?.delta || 0));

    if (!Number.isFinite(delta) || delta < 1 || delta > 50) {
      res.status(400).json({ error: "delta must be between 1 and 50" });
      return;
    }

    const users = (await readCollection("users")).map(normalizeExistingUser);
    const pointEvents = (await readCollection("pointEvents")).map(normalizePointEvent);
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

    const nextUser = {
      ...currentUser,
      points: normalizePointsValue(currentUser.points) + delta,
      updatedAt: new Date().toISOString(),
    };
    const nextPointEvent = normalizePointEvent({
      userId: currentUser.id,
      delta,
      createdAt: new Date().toISOString(),
    });

    users[userIndex] = nextUser;
    await writeCollection("users", users);
    pointEvents.push(nextPointEvent);
    await writeCollection("pointEvents", pointEvents);

    res.json({
      ok: true,
      points: nextUser.points,
      user: toPublicUser(nextUser),
    });
  }),
);

app.get(
  "/api/points/leaderboard",
  optionalAuth,
  asyncHandler(async (req, res) => {
    await purgeExpiredDeactivatedUsers();
    const scope = String(req.query?.scope || "daily").trim().toLowerCase();
    const allowedScopes = new Set(["daily", "weekly", "monthly", "yearly", "alltime"]);
    if (!allowedScopes.has(scope)) {
      res.status(400).json({ error: "scope must be daily, weekly, monthly, yearly, or alltime" });
      return;
    }

    const rawLimit = Number(req.query?.limit);
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.round(rawLimit) : null;
    const users = await readCollection("users");
    const pointEvents = await readCollection("pointEvents");
    const snapshot = buildPointsLeaderboardSnapshot({
      users,
      pointEvents,
      requestUserId: req.user?.sub || "",
      scope,
      limit,
    });

    res.json(snapshot);
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
  "/api/auth/verify-password",
  requireAuth,
  asyncHandler(async (req, res) => {
    const password = String(req.body?.password || "");
    if (!password) {
      res.status(400).json({ error: "password is required" });
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

    const validPassword = await verifyPassword(password, user.passwordHash);
    if (!validPassword) {
      res.status(401).json({ error: "password is invalid" });
      return;
    }
    res.json({ ok: true });
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

    if (req.body?.bio !== undefined) {
      nextUser.bio = normalizeBioValue(req.body?.bio);
    }

    if (req.body?.privacy !== undefined) {
      nextUser.privacy = normalizePrivacySettings(req.body?.privacy);
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

app.get(
  "/api/community/overview",
  requireAuth,
  asyncHandler(async (req, res) => {
    await purgeExpiredDeactivatedUsers();
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const activeStatuses = await purgeExpiredStatuses();
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const friendships = (await readCollection("friendships")).map(normalizeFriendship);
    const friendRequests = (await readCollection("friendRequests")).map(normalizeFriendRequest);
    const blocks = (await readCollection("blocks")).map(normalizeBlock);
    const conversations = (await readCollection("conversations")).map(normalizeConversation);
    const messages = (await readCollection("messages")).map(normalizeMessage);
    const uploads = (await readCollection("uploads")).map(normalizeUpload);
    const conversationStates = (await readCollection("communityConversationStates")).map(
      normalizeCommunityConversationState,
    );
    const visibleUsers = users.filter(
      (entry) =>
        entry.id !== viewerId &&
        !isBlocked(blocks, viewerId, entry.id) &&
        !isBlocked(blocks, entry.id, viewerId),
    );

    const incoming = friendRequests
      .filter((entry) => entry.toUserId === viewerId && entry.status === "pending")
      .map((entry) => {
        const actor = users.find((user) => user.id === entry.fromUserId);
        const blockState = actor ? getCommunityBlockState(blocks, viewerId, actor.id) : {};
        return {
          ...entry,
          user: actor ? applyCommunityProfileView(actor, { viewerId, isFriend: false, ...blockState }) : null,
        };
      })
      .filter((entry) => entry.user);

    const sent = friendRequests
      .filter((entry) => entry.fromUserId === viewerId && entry.status === "pending")
      .map((entry) => {
        const actor = users.find((user) => user.id === entry.toUserId);
        const blockState = actor ? getCommunityBlockState(blocks, viewerId, actor.id) : {};
        return {
          ...entry,
          user: actor ? applyCommunityProfileView(actor, { viewerId, isFriend: false, ...blockState }) : null,
        };
      })
      .filter((entry) => entry.user);

    const friends = friendships
      .filter((entry) => entry.userA === viewerId || entry.userB === viewerId)
      .map((entry) => {
        const friendId = entry.userA === viewerId ? entry.userB : entry.userA;
        const actor = users.find((user) => user.id === friendId);
        const blockState = actor ? getCommunityBlockState(blocks, viewerId, actor.id) : {};
        return actor ? applyCommunityProfileView(actor, { viewerId, isFriend: true, ...blockState }) : null;
      })
      .filter(Boolean);

    const chats = buildCommunityConversationRows({
      viewerId,
      users,
      friendships,
      blocks,
      uploads,
      conversations,
      messages,
      conversationStates,
    });

    const statuses = users
      .map((owner) => {
        const ownerStatuses = activeStatuses
          .filter((entry) =>
            entry.ownerUserId === owner.id &&
            canViewerSeeStatus(entry, {
              viewerId,
              owner,
              isFriend: areFriends(friendships, viewerId, owner.id),
              blocks,
            }),
          )
          .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
        if (!ownerStatuses.length) return null;
        const ownerView =
          owner.id === viewerId
            ? applyCommunityProfileView(owner, { viewerId, isFriend: true })
            : applyCommunityProfileView(owner, {
                viewerId,
                isFriend: areFriends(friendships, viewerId, owner.id),
                ...getCommunityBlockState(blocks, viewerId, owner.id),
              });
        return {
          user: ownerView,
          latestAt: ownerStatuses[0].createdAt,
          hasUnseen: ownerStatuses.some((entry) => !hasStatusActor(entry.viewers, viewerId)),
          items: ownerStatuses.map((entry) => {
            const upload = uploads.find((candidate) => candidate.id === entry.uploadId);
            return {
              id: entry.id,
              type: entry.type,
              text: entry.text,
              background: entry.background,
              textColor: entry.textColor,
              textStyle: entry.textStyle,
              textAlign: entry.textAlign,
              textScale: entry.textScale,
              textX: entry.textX,
              textY: entry.textY,
              textBold: entry.textBold === true,
              textItalic: entry.textItalic === true,
              textUnderline: entry.textUnderline === true,
              caption: entry.caption,
              allowReplies: entry.allowReplies !== false,
              isAdminBroadcast: entry.isAdminBroadcast === true,
              imageFit: entry.imageFit,
              imageFilter: entry.imageFilter,
              imageRotate: entry.imageRotate,
              videoTrimStart: entry.videoTrimStart,
              videoTrimEnd: entry.videoTrimEnd,
              durationSeconds: entry.durationSeconds,
              createdAt: entry.createdAt,
              expiresAt: entry.expiresAt,
              viewed: hasStatusActor(entry.viewers, viewerId),
              likedByViewer: hasStatusActor(entry.likes, viewerId),
              likesCount: entry.likes.length,
              viewsCount: entry.viewers.length,
              upload: upload ? resolveUploadPublicView(upload) : null,
            };
          }),
        };
      })
      .filter((entry) => entry?.user)
      .sort((a, b) => String(b.latestAt || "").localeCompare(String(a.latestAt || "")));

    const adminBroadcastStatuses = activeStatuses
      .filter((entry) => entry.isAdminBroadcast === true)
      .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
    if (adminBroadcastStatuses.length) {
      statuses.push({
        user: buildAdminBroadcastStatusOwnerView(),
        latestAt: adminBroadcastStatuses[0].createdAt,
        hasUnseen: adminBroadcastStatuses.some((entry) => !hasStatusActor(entry.viewers, viewerId)),
        items: adminBroadcastStatuses.map((entry) => {
          const upload = uploads.find((candidate) => candidate.id === entry.uploadId);
          return {
            id: entry.id,
            type: entry.type,
            text: entry.text,
            background: entry.background,
            textColor: entry.textColor,
            textStyle: entry.textStyle,
            textAlign: entry.textAlign,
            textScale: entry.textScale,
            textX: entry.textX,
            textY: entry.textY,
            textBold: entry.textBold === true,
            textItalic: entry.textItalic === true,
            textUnderline: entry.textUnderline === true,
            caption: entry.caption,
            allowReplies: false,
            isAdminBroadcast: true,
            imageFit: entry.imageFit,
            imageFilter: entry.imageFilter,
            imageRotate: entry.imageRotate,
            videoTrimStart: entry.videoTrimStart,
            videoTrimEnd: entry.videoTrimEnd,
            durationSeconds: entry.durationSeconds,
            createdAt: entry.createdAt,
            expiresAt: entry.expiresAt,
            viewed: hasStatusActor(entry.viewers, viewerId),
            likedByViewer: hasStatusActor(entry.likes, viewerId),
            likesCount: entry.likes.length,
            viewsCount: entry.viewers.length,
            upload: upload ? resolveUploadPublicView(upload) : null,
          };
        }),
      });
    }
    statuses.sort((a, b) => String(b.latestAt || "").localeCompare(String(a.latestAt || "")));

    res.json({
      incoming,
      sent,
      friends,
      chats,
      statuses,
      suggested: visibleUsers
        .filter(
          (entry) =>
            !areFriends(friendships, viewerId, entry.id) &&
            !incoming.some((row) => row.user?.id === entry.id) &&
            !sent.some((row) => row.user?.id === entry.id),
        )
        .slice(0, 8)
        .map((entry) =>
          applyCommunityProfileView(entry, {
            viewerId,
            isFriend: false,
            ...getCommunityBlockState(blocks, viewerId, entry.id),
          }),
        ),
    });
  }),
);

app.get(
  "/api/community/search",
  requireAuth,
  asyncHandler(async (req, res) => {
    await purgeExpiredDeactivatedUsers();
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const query = normalizeWhitespace(req.query?.q || req.query?.query || "").toLowerCase();
    const limit = Math.max(1, Math.min(30, Math.round(Number(req.query?.limit) || 20)));
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const friendships = (await readCollection("friendships")).map(normalizeFriendship);
    const friendRequests = (await readCollection("friendRequests")).map(normalizeFriendRequest);
    const blocks = (await readCollection("blocks")).map(normalizeBlock);
    const results = users
      .filter((entry) => entry.id !== viewerId)
      .filter(
        (entry) =>
          !isBlocked(blocks, viewerId, entry.id) && !isBlocked(blocks, entry.id, viewerId),
      )
      .filter((entry) => {
        if (!query) return true;
        const haystack = [
          entry.name,
          entry.username,
          entry.firstName,
          entry.lastName,
          entry.institution,
          entry.country,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(query);
      })
      .slice(0, limit)
      .map((entry) => {
        const isFriend = areFriends(friendships, viewerId, entry.id);
        const pendingIncoming = friendRequests.some(
          (row) =>
            row.fromUserId === entry.id && row.toUserId === viewerId && row.status === "pending",
        );
        const pendingSent = friendRequests.some(
          (row) =>
            row.fromUserId === viewerId && row.toUserId === entry.id && row.status === "pending",
        );
        return {
          ...applyCommunityProfileView(entry, { viewerId, isFriend }),
          relationship: isFriend
            ? "friend"
            : pendingIncoming
              ? "incoming"
              : pendingSent
                ? "sent"
                : "none",
        };
      });

    res.json({ users: results });
  }),
);

app.get(
  "/api/community/profile/:userId",
  requireAuth,
  asyncHandler(async (req, res) => {
    await purgeExpiredDeactivatedUsers();
    const targetId = String(req.params.userId || "");
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const pointEvents = (await readCollection("pointEvents")).map(normalizePointEvent);
    const friendships = (await readCollection("friendships")).map(normalizeFriendship);
    const friendRequests = (await readCollection("friendRequests")).map(normalizeFriendRequest);
    const blocks = (await readCollection("blocks")).map(normalizeBlock);
    const target = users.find((entry) => entry.id === targetId);

    if (!target) {
      res.status(404).json({ error: "user not found" });
      return;
    }
    const isFriend = areFriends(friendships, viewerId, targetId);
    const viewerBlockedTarget = isBlocked(blocks, viewerId, targetId);
    const targetBlockedViewer = isBlocked(blocks, targetId, viewerId);
    const leaderboardSnapshot = buildPointsLeaderboardSnapshot({
      users,
      pointEvents,
      requestUserId: targetId,
      scope: "alltime",
      limit: users.length || null,
    });
    const leaderboardStats =
      leaderboardSnapshot.topThree.find((entry) => entry.userId === targetId) ||
      leaderboardSnapshot.leaderboard.find((entry) => entry.userId === targetId) ||
      leaderboardSnapshot.yourEntry ||
      {
        userId: targetId,
        points: normalizePointsValue(target.points),
        rank: null,
      };
    const incoming = friendRequests.find(
      (row) => row.fromUserId === targetId && row.toUserId === viewerId && row.status === "pending",
    );
    const sent = friendRequests.find(
      (row) => row.fromUserId === viewerId && row.toUserId === targetId && row.status === "pending",
    );

    res.json({
      profile: applyCommunityProfileView(target, {
        viewerId,
        isFriend,
        leaderboardStats,
        viewerBlockedSubject: viewerBlockedTarget,
        subjectBlockedViewer: targetBlockedViewer,
      }),
      relationship: {
        isSelf: viewerId === targetId,
        isFriend,
        pendingIncoming: !targetBlockedViewer && Boolean(incoming),
        pendingSent: !targetBlockedViewer && Boolean(sent),
        blocked: viewerBlockedTarget,
        blockedByUser: targetBlockedViewer,
      },
    });
  }),
);

app.post(
  "/api/community/users/:userId/report",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const targetId = String(req.params.userId || "").trim();
    const reason = normalizeWhitespace(req.body?.reason || "").slice(0, 240);
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const target = users.find((entry) => entry.id === targetId);
    if (!target) {
      res.status(404).json({ error: "user not found" });
      return;
    }
    const reporter = users.find((entry) => entry.id === viewerId) || null;
    await appendAdminReportRecord({
      id: crypto.randomUUID(),
      type: "user",
      status: "open",
      targetId,
      targetName: target.name || target.username || "",
      targetUsername: target.username || "",
      reporterUserId: viewerId,
      reporterName: reporter?.name || reporter?.username || "",
      reason: reason || "reported from community",
      warningMessage: "",
      warningPreset: "",
      warningById: "",
      warningByName: "",
      warningIssuedAt: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    res.json({ ok: true });
  }),
);

app.get(
  "/api/community/friends",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const friendships = (await readCollection("friendships")).map(normalizeFriendship);
    const blocks = (await readCollection("blocks")).map(normalizeBlock);
    const rows = friendships
      .filter((entry) => entry.userA === viewerId || entry.userB === viewerId)
      .map((entry) => {
        const friendId = entry.userA === viewerId ? entry.userB : entry.userA;
        const user = users.find((candidate) => candidate.id === friendId);
        return user
          ? applyCommunityProfileView(user, {
              viewerId,
              isFriend: true,
              ...getCommunityBlockState(blocks, viewerId, user.id),
            })
          : null;
      })
      .filter(Boolean);
    res.json({ friends: rows });
  }),
);

app.delete(
  "/api/community/friends/:userId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "").trim();
    const targetId = String(req.params.userId || "").trim();
    if (!viewerId || !targetId) {
      res.status(400).json({ error: "user not found" });
      return;
    }
    const friendships = (await readCollection("friendships")).map(normalizeFriendship);
    const friendshipKey = getFriendshipKey(viewerId, targetId);
    const nextFriendships = friendships.filter(
      (entry) => getFriendshipKey(entry.userA, entry.userB) !== friendshipKey,
    );
    if (nextFriendships.length === friendships.length) {
      res.status(404).json({ error: "friendship not found" });
      return;
    }
    await writeCollection("friendships", nextFriendships);
    res.json({ ok: true });
  }),
);

app.get(
  "/api/community/requests",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const friendRequests = (await readCollection("friendRequests")).map(normalizeFriendRequest);
    const blocks = (await readCollection("blocks")).map(normalizeBlock);
    const incoming = friendRequests
      .filter((entry) => entry.toUserId === viewerId && entry.status === "pending")
      .map((entry) => ({
        ...entry,
        user: applyCommunityProfileView(
          users.find((user) => user.id === entry.fromUserId),
          {
            viewerId,
            isFriend: false,
            ...getCommunityBlockState(blocks, viewerId, entry.fromUserId),
          },
        ),
      }));
    const sent = friendRequests
      .filter((entry) => entry.fromUserId === viewerId && entry.status === "pending")
      .map((entry) => ({
        ...entry,
        user: applyCommunityProfileView(
          users.find((user) => user.id === entry.toUserId),
          {
            viewerId,
            isFriend: false,
            ...getCommunityBlockState(blocks, viewerId, entry.toUserId),
          },
        ),
      }));
    res.json({ incoming: incoming.filter((row) => row.user), sent: sent.filter((row) => row.user) });
  }),
);

app.post(
  "/api/community/requests",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    const toUserId = String(req.body?.toUserId || "").trim();
    if (!toUserId || toUserId === viewerId) {
      res.status(400).json({ error: "valid recipient is required" });
      return;
    }
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const target = users.find((entry) => entry.id === toUserId);
    if (!target) {
      res.status(404).json({ error: "recipient not found" });
      return;
    }
    const friendships = (await readCollection("friendships")).map(normalizeFriendship);
    const friendRequests = (await readCollection("friendRequests")).map(normalizeFriendRequest);
    const blocks = (await readCollection("blocks")).map(normalizeBlock);
    if (isBlocked(blocks, viewerId, toUserId) || isBlocked(blocks, toUserId, viewerId)) {
      res.status(403).json({ error: "request unavailable" });
      return;
    }
    if (areFriends(friendships, viewerId, toUserId)) {
      res.status(409).json({ error: "already friends" });
      return;
    }
    const targetPrivacy = normalizePrivacySettings(target.privacy);
    if (targetPrivacy.allowFriendRequestsFrom === "nobody") {
      res.status(403).json({ error: "this user is not accepting requests" });
      return;
    }
    const existing = friendRequests.find(
      (entry) =>
        ((entry.fromUserId === viewerId && entry.toUserId === toUserId) ||
          (entry.fromUserId === toUserId && entry.toUserId === viewerId)) &&
        entry.status === "pending",
    );
    if (existing) {
      res.status(409).json({ error: "request already pending" });
      return;
    }
    const requestEntry = normalizeFriendRequest({
      fromUserId: viewerId,
      toUserId,
      status: "pending",
    });
    friendRequests.push(requestEntry);
    await writeCollection("friendRequests", friendRequests);
    const requester = users.find((entry) => entry.id === viewerId) || null;
    fireCommunityRealtimeMessages([
      buildCommunityOverviewRealtimeMessage("requests", {
        reason: "request-created",
        requestId: requestEntry.id,
        actorUserId: viewerId,
        targetUserId: toUserId,
        requesterName: requester?.name || requester?.username || "",
      }),
    ]);
    res.status(201).json({ ok: true, request: requestEntry });
  }),
);

app.post(
  "/api/community/requests/:requestId/respond",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    const requestId = String(req.params.requestId || "");
    const action = String(req.body?.action || "").trim().toLowerCase();
    if (!["accept", "reject"].includes(action)) {
      res.status(400).json({ error: "action must be accept or reject" });
      return;
    }
    const friendRequests = (await readCollection("friendRequests")).map(normalizeFriendRequest);
    const friendships = (await readCollection("friendships")).map(normalizeFriendship);
    const requestIndex = friendRequests.findIndex((entry) => entry.id === requestId);
    if (requestIndex < 0) {
      res.status(404).json({ error: "request not found" });
      return;
    }
    const requestEntry = friendRequests[requestIndex];
    if (requestEntry.toUserId !== viewerId || requestEntry.status !== "pending") {
      res.status(403).json({ error: "request unavailable" });
      return;
    }
    friendRequests[requestIndex] = {
      ...requestEntry,
      status: action === "accept" ? "accepted" : "rejected",
      updatedAt: new Date().toISOString(),
    };
    if (action === "accept" && !areFriends(friendships, requestEntry.fromUserId, requestEntry.toUserId)) {
      friendships.push(
        normalizeFriendship({
          userA: requestEntry.fromUserId,
          userB: requestEntry.toUserId,
        }),
      );
    }
    await writeCollection("friendRequests", friendRequests);
    await writeCollection("friendships", friendships);
    fireCommunityRealtimeMessages([
      buildCommunityOverviewRealtimeMessage("requests", {
        reason: "request-updated",
        requestId,
        actorUserId: viewerId,
        targetUserId: requestEntry.fromUserId === viewerId ? requestEntry.toUserId : requestEntry.fromUserId,
      }),
    ]);
    res.json({ ok: true, request: friendRequests[requestIndex] });
  }),
);

app.delete(
  "/api/community/requests/:requestId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    const requestId = String(req.params.requestId || "");
    const friendRequests = (await readCollection("friendRequests")).map(normalizeFriendRequest);
    const requestIndex = friendRequests.findIndex((entry) => entry.id === requestId);
    if (requestIndex < 0) {
      res.status(404).json({ error: "request not found" });
      return;
    }
    const requestEntry = friendRequests[requestIndex];
    if (
      requestEntry.status !== "pending" ||
      (requestEntry.fromUserId !== viewerId && requestEntry.toUserId !== viewerId)
    ) {
      res.status(403).json({ error: "request unavailable" });
      return;
    }
    friendRequests[requestIndex] = {
      ...requestEntry,
      status: "cancelled",
      updatedAt: new Date().toISOString(),
    };
    await writeCollection("friendRequests", friendRequests);
    fireCommunityRealtimeMessages([
      buildCommunityOverviewRealtimeMessage("requests", {
        reason: "request-updated",
        requestId,
        actorUserId: viewerId,
        targetUserId: requestEntry.fromUserId === viewerId ? requestEntry.toUserId : requestEntry.fromUserId,
      }),
    ]);
    res.json({ ok: true });
  }),
);

app.get(
  "/api/community/blocks",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const blocks = (await readCollection("blocks")).map(normalizeBlock);
    const blockedUsers = blocks
      .filter((entry) => entry.blockerUserId === viewerId)
      .map((entry) => users.find((user) => user.id === entry.blockedUserId))
      .filter(Boolean)
      .map((entry) => applyCommunityProfileView(entry, { viewerId, isFriend: false }));
    res.json({ blocked: blockedUsers });
  }),
);

app.post(
  "/api/community/presence",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    res.json({ ok: true, lastSeenAt: new Date().toISOString() });
  }),
);

app.get(
  "/api/community/realtime/config",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    res.json({
      enabled: isCommunityRealtimeConfigured(),
      url: config.supabaseRealtimeUrl || "",
      anonKey: config.supabaseRealtimeAnonKey || "",
      topics: {
        global: COMMUNITY_REALTIME_GLOBAL_TOPIC,
        presence: COMMUNITY_REALTIME_PRESENCE_TOPIC,
      },
    });
  }),
);

app.get(
  "/api/push/config",
  requireAuth,
  asyncHandler(async (_req, res) => {
    res.json({
      enabled: Boolean(config.oneSignalAppId),
      provider: config.oneSignalAppId ? "onesignal" : "",
      oneSignal: {
        appId: config.oneSignalAppId || "",
        safariWebId: config.oneSignalSafariWebId || "",
      },
    });
  }),
);

app.post(
  "/api/community/block/:userId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    const targetId = String(req.params.userId || "");
    if (!targetId || targetId === viewerId) {
      res.status(400).json({ error: "valid user required" });
      return;
    }
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const target = users.find((entry) => entry.id === targetId) || null;
    if (target?.role === "admin") {
      res.status(403).json({ error: "admin users cannot be blocked" });
      return;
    }
    const blocks = (await readCollection("blocks")).map(normalizeBlock);
    if (!isBlocked(blocks, viewerId, targetId)) {
      blocks.push(normalizeBlock({ blockerUserId: viewerId, blockedUserId: targetId }));
      await writeCollection("blocks", blocks);
    }
    res.json({ ok: true });
  }),
);

app.delete(
  "/api/community/block/:userId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    const targetId = String(req.params.userId || "");
    const blocks = (await readCollection("blocks")).map(normalizeBlock);
    await writeCollection(
      "blocks",
      blocks.filter(
        (entry) =>
          !(
            entry.blockerUserId === viewerId && entry.blockedUserId === targetId
          ),
      ),
    );
    res.json({ ok: true });
  }),
);

app.get(
  "/api/community/conversations",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const friendships = (await readCollection("friendships")).map(normalizeFriendship);
    const conversations = (await readCollection("conversations")).map(normalizeConversation);
    const messages = (await readCollection("messages")).map(normalizeMessage);
    const blocks = (await readCollection("blocks")).map(normalizeBlock);
    const uploads = (await readCollection("uploads")).map(normalizeUpload);
    const conversationStates = (await readCollection("communityConversationStates")).map(
      normalizeCommunityConversationState,
    );
    const rows = buildCommunityConversationRows({
      viewerId,
      users,
      friendships,
      blocks,
      uploads,
      conversations,
      messages,
      conversationStates,
    });
    res.json({ conversations: rows });
  }),
);

app.post(
  "/api/community/conversations/direct",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const partnerId = String(req.body?.userId || "").trim();
    if (!partnerId || partnerId === viewerId) {
      res.status(400).json({ error: "valid user required" });
      return;
    }
    const friendships = (await readCollection("friendships")).map(normalizeFriendship);
    const blocks = (await readCollection("blocks")).map(normalizeBlock);
    const users = (await readCollection("users")).map(normalizeExistingUser);
    if (!areFriends(friendships, viewerId, partnerId)) {
      res.status(403).json({ error: "messages are limited to friends" });
      return;
    }
    if (isBlocked(blocks, viewerId, partnerId)) {
      res.status(403).json({ error: "unblock user first" });
      return;
    }
    const partner = users.find((entry) => entry.id === partnerId);
    if (!partner) {
      res.status(404).json({ error: "user not found" });
      return;
    }
    const partnerPrivacy = normalizePrivacySettings(partner.privacy);
    if (partnerPrivacy.allowMessagesFrom === "nobody") {
      res.status(403).json({ error: "this user is not accepting messages" });
      return;
    }
    const conversations = (await readCollection("conversations")).map(normalizeConversation);
    let conversation = conversations.find(
      (entry) =>
        entry.type === "direct" &&
        entry.memberIds.length === 2 &&
        entry.memberIds.includes(viewerId) &&
        entry.memberIds.includes(partnerId),
    );
    if (!conversation) {
      conversation = normalizeConversation({
        type: "direct",
        memberIds: [viewerId, partnerId],
      });
      conversations.push(conversation);
      await writeCollection("conversations", conversations);
      fireCommunityRealtimeMessages([
        buildCommunityOverviewRealtimeMessage("conversations", {
          reason: "conversation-created",
          conversationId: conversation.id,
        }),
      ]);
    } else {
      const hiddenForUserIds = Array.isArray(conversation.hiddenForUserIds)
        ? [...conversation.hiddenForUserIds]
        : [];
      const hiddenIndex = hiddenForUserIds.indexOf(viewerId);
      if (hiddenIndex >= 0) {
        hiddenForUserIds.splice(hiddenIndex, 1);
        const conversationIndex = conversations.findIndex((entry) => entry.id === conversation.id);
        if (conversationIndex >= 0) {
          conversations[conversationIndex] = {
            ...conversations[conversationIndex],
            hiddenForUserIds,
            updatedAt: new Date().toISOString(),
          };
          await writeCollection("conversations", conversations);
          fireCommunityRealtimeMessages([
            buildCommunityOverviewRealtimeMessage("conversations", {
              reason: "conversation-unhidden",
              conversationId: conversation.id,
              actorUserId: viewerId,
            }),
          ]);
        }
      }
    }
    res.status(201).json({ ok: true, conversation });
  }),
);

app.post(
  "/api/community/conversations/:conversationId/favorite",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const conversationId = String(req.params.conversationId || "").trim();
    const conversation = await getCommunityConversationForMember(conversationId, viewerId);
    if (!conversation) {
      res.status(404).json({ error: "conversation not found" });
      return;
    }
    const states = (await readCollection("communityConversationStates")).map(
      normalizeCommunityConversationState,
    );
    const favoriteCount = states.filter(
      (entry) =>
        entry.userId === viewerId &&
        entry.isFavorite &&
        !isCommunityConversationHiddenForViewer(entry),
    ).length;
    const existingState = getCommunityConversationStateForViewer(states, viewerId, conversationId);
    if (!existingState?.isFavorite && favoriteCount >= 5) {
      res.status(409).json({ error: "You can only keep 5 favorites." });
      return;
    }
    const nextState = await upsertCommunityConversationState({
      userId: viewerId,
      conversationId,
      patch: {
        isFavorite: true,
      },
    });
    fireCommunityRealtimeMessages([
      buildCommunityOverviewRealtimeMessage("conversations", {
        reason: "conversation-favorited",
        conversationId,
        viewerUserId: viewerId,
        isFavorite: true,
      }),
    ]);
    res.json({ ok: true, state: nextState });
  }),
);

app.delete(
  "/api/community/conversations/:conversationId/favorite",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const conversationId = String(req.params.conversationId || "").trim();
    const conversation = await getCommunityConversationForMember(conversationId, viewerId);
    if (!conversation) {
      res.status(404).json({ error: "conversation not found" });
      return;
    }
    const nextState = await upsertCommunityConversationState({
      userId: viewerId,
      conversationId,
      patch: {
        isFavorite: false,
      },
      removeIfEmpty: true,
    });
    fireCommunityRealtimeMessages([
      buildCommunityOverviewRealtimeMessage("conversations", {
        reason: "conversation-unfavorited",
        conversationId,
        viewerUserId: viewerId,
        isFavorite: false,
      }),
    ]);
    res.json({ ok: true, state: nextState });
  }),
);

app.post(
  "/api/community/conversations/:conversationId/clear",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const conversationId = String(req.params.conversationId || "").trim();
    const conversation = await getCommunityConversationForMember(conversationId, viewerId);
    if (!conversation) {
      res.status(404).json({ error: "conversation not found" });
      return;
    }
    const conversations = (await readCollection("conversations")).map(normalizeConversation);
    const messages = (await readCollection("messages")).map(normalizeMessage);
    const nextMessages = messages.map((message) => {
      if (String(message.conversationId || "") !== conversationId) return message;
      const deletedForUserIds = Array.isArray(message.deletedForUserIds)
        ? [...message.deletedForUserIds]
        : [];
      if (!deletedForUserIds.includes(viewerId)) {
        deletedForUserIds.push(viewerId);
      }
      return {
        ...message,
        deletedForUserIds,
        updatedAt: new Date().toISOString(),
      };
    });
    const latestVisible = getConversationLastVisibleMessage(nextMessages, conversationId, viewerId);
    const conversationIndex = conversations.findIndex((entry) => entry.id === conversationId);
    if (conversationIndex >= 0) {
      conversations[conversationIndex] = {
        ...conversations[conversationIndex],
        lastMessageId: latestVisible?.id || conversations[conversationIndex].lastMessageId || "",
        lastMessageAt: latestVisible?.createdAt || conversations[conversationIndex].createdAt,
        updatedAt: latestVisible?.createdAt || conversations[conversationIndex].updatedAt,
      };
    }
    await writeCollection("messages", nextMessages);
    await writeCollection("conversations", conversations);
    fireCommunityRealtimeMessages([
      ...buildCommunityConversationRealtimeMessages(conversationId, {
        reason: "conversation-cleared",
        viewerUserId: viewerId,
      }),
      buildCommunityOverviewRealtimeMessage("conversations", {
        reason: "conversation-cleared",
        conversationId,
        viewerUserId: viewerId,
      }),
    ]);
    res.json({ ok: true });
  }),
);

app.delete(
  "/api/community/conversations/:conversationId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const conversationId = String(req.params.conversationId || "").trim();
    const conversation = await getCommunityConversationForMember(conversationId, viewerId);
    if (!conversation) {
      res.status(404).json({ error: "conversation not found" });
      return;
    }
    if (String(conversation.type || "").trim().toLowerCase() !== "direct") {
      res.status(400).json({ error: "only direct chats can be deleted from the list" });
      return;
    }
    const conversations = (await readCollection("conversations")).map(normalizeConversation);
    const conversationIndex = conversations.findIndex((entry) => entry.id === conversationId);
    if (conversationIndex < 0) {
      res.status(404).json({ error: "conversation not found" });
      return;
    }
    const hiddenForUserIds = Array.isArray(conversations[conversationIndex].hiddenForUserIds)
      ? [...conversations[conversationIndex].hiddenForUserIds]
      : [];
    if (!hiddenForUserIds.includes(viewerId)) {
      hiddenForUserIds.push(viewerId);
    }
    conversations[conversationIndex] = {
      ...conversations[conversationIndex],
      hiddenForUserIds,
      updatedAt: new Date().toISOString(),
    };
    await writeCollection("conversations", conversations);
    await upsertCommunityConversationState({
      userId: viewerId,
      conversationId,
      patch: {
        isFavorite: false,
      },
      removeIfEmpty: true,
    });
    fireCommunityRealtimeMessages([
      buildCommunityOverviewRealtimeMessage("conversations", {
        reason: "conversation-hidden",
        conversationId,
        viewerUserId: viewerId,
      }),
    ]);
    res.json({ ok: true });
  }),
);

app.get(
  "/api/community/conversations/:conversationId/calls/active",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const conversationId = String(req.params.conversationId || "").trim();
    const conversation = await getCommunityConversationForMember(conversationId, viewerId);
    if (!conversation) {
      res.status(404).json({ error: "conversation not found" });
      return;
    }
    if (String(conversation.type || "").trim().toLowerCase() !== "direct") {
      res.status(400).json({ error: "Calls are only available for direct chats right now." });
      return;
    }
    const activeSession = getActiveCommunityCallSession(conversation.id);
    res.json({
      call: activeSession ? buildCommunityCallPublicPayload(activeSession) : null,
    });
  }),
);

app.post(
  "/api/community/conversations/:conversationId/calls/start",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const conversationId = String(req.params.conversationId || "").trim();
    const mode = normalizeCommunityCallMode(req.body?.mode || "voice");
    const conversation = await getCommunityConversationForMember(conversationId, viewerId);
    if (!conversation) {
      res.status(404).json({ error: "conversation not found" });
      return;
    }
    if (String(conversation.type || "").trim().toLowerCase() !== "direct") {
      res.status(400).json({ error: "Calls are only available for direct chats right now." });
      return;
    }
    try {
      assertAgoraCallConfigReady();
    } catch (error) {
      res.status(Number(error?.status) || 503).json({ error: String(error?.message || "Call setup failed.") });
      return;
    }
    const blocks = (await readCollection("blocks")).map(normalizeBlock);
    const partnerId =
      conversation.type === "direct"
        ? String(conversation.memberIds.find((memberId) => memberId !== viewerId) || "").trim()
        : "";
    if (partnerId && isBlocked(blocks, viewerId, partnerId)) {
      res.status(403).json({ error: "unblock user first" });
      return;
    }

    let session = getActiveCommunityCallSession(conversation.id);
    let created = false;
    if (session && normalizeCommunityCallMode(session.mode) !== mode) {
      res.status(409).json({
        error: "An active call already exists in this conversation.",
        call: buildCommunityCallPublicPayload(session),
      });
      return;
    }
    if (!session) {
      session = createCommunityCallSession({
        conversationId: conversation.id,
        mode,
        startedByUserId: viewerId,
      });
      if (!session) {
        res.status(400).json({ error: "Call could not be started." });
        return;
      }
      communityCallSessionsByConversation.set(conversation.id, session);
      created = true;
    }
    if (!session.participantUserIds.includes(viewerId)) {
      session.participantUserIds = [...session.participantUserIds, viewerId];
    }
    session = markCommunityCallSessionAnswered(session, viewerId);
    session.updatedAt = new Date().toISOString();
    communityCallSessionsByConversation.set(conversation.id, session);

    const rtc = buildAgoraCallTokenPayload(session, viewerId);
    fireCommunityRealtimeMessages(
      buildCommunityConversationRealtimeMessages(conversation.id, {
        reason: created ? "call-started" : "call-joined",
        actorUserId: viewerId,
        callId: session.id,
        mode: session.mode,
      }),
    );
    res.status(created ? 201 : 200).json({
      ok: true,
      created,
      call: buildCommunityCallPublicPayload(session),
      rtc,
    });
  }),
);

app.post(
  "/api/community/conversations/:conversationId/calls/join",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const conversationId = String(req.params.conversationId || "").trim();
    const requestedCallId = String(req.body?.callId || "").trim();
    const conversation = await getCommunityConversationForMember(conversationId, viewerId);
    if (!conversation) {
      res.status(404).json({ error: "conversation not found" });
      return;
    }
    if (String(conversation.type || "").trim().toLowerCase() !== "direct") {
      res.status(400).json({ error: "Calls are only available for direct chats right now." });
      return;
    }
    let session = getActiveCommunityCallSession(conversation.id);
    if (!session) {
      res.status(404).json({ error: "no active call in this conversation" });
      return;
    }
    if (requestedCallId && session.id !== requestedCallId) {
      res.status(409).json({
        error: "That call session has ended.",
        call: buildCommunityCallPublicPayload(session),
      });
      return;
    }
    try {
      assertAgoraCallConfigReady();
    } catch (error) {
      res.status(Number(error?.status) || 503).json({ error: String(error?.message || "Call join failed.") });
      return;
    }
    if (!session.participantUserIds.includes(viewerId)) {
      session.participantUserIds = [...session.participantUserIds, viewerId];
    }
    session = markCommunityCallSessionAnswered(session, viewerId);
    session.updatedAt = new Date().toISOString();
    communityCallSessionsByConversation.set(conversation.id, session);
    const rtc = buildAgoraCallTokenPayload(session, viewerId);
    fireCommunityRealtimeMessages(
      buildCommunityConversationRealtimeMessages(conversation.id, {
        reason: "call-joined",
        actorUserId: viewerId,
        callId: session.id,
        mode: session.mode,
      }),
    );
    res.json({
      ok: true,
      call: buildCommunityCallPublicPayload(session),
      rtc,
    });
  }),
);

app.post(
  "/api/community/conversations/:conversationId/calls/end",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const conversationId = String(req.params.conversationId || "").trim();
    const requestedCallId = String(req.body?.callId || "").trim();
    const conversation = await getCommunityConversationForMember(conversationId, viewerId);
    if (!conversation) {
      res.status(404).json({ error: "conversation not found" });
      return;
    }
    if (String(conversation.type || "").trim().toLowerCase() !== "direct") {
      res.status(400).json({ error: "Calls are only available for direct chats right now." });
      return;
    }
    const session = getActiveCommunityCallSession(conversation.id);
    if (!session) {
      res.json({ ok: true });
      return;
    }
    if (requestedCallId && session.id !== requestedCallId) {
      res.status(409).json({
        error: "That call session has already changed.",
        call: buildCommunityCallPublicPayload(session),
      });
      return;
    }
    const endedAtIso = new Date().toISOString();
    session.endedAt = endedAtIso;
    session.updatedAt = endedAtIso;
    communityCallSessionsByConversation.delete(conversation.id);
    await persistCommunityCallLogMessage({
      conversationId: conversation.id,
      session,
      endedByUserId: viewerId,
    });
    fireCommunityRealtimeMessages(
      buildCommunityConversationRealtimeMessages(conversation.id, {
        reason: "call-ended",
        actorUserId: viewerId,
        callId: session.id,
        mode: session.mode,
      }),
    );
    res.json({ ok: true });
  }),
);

app.post(
  "/api/community/groups",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const name = normalizeWhitespace(req.body?.name || "").slice(0, 72);
    const requestedMembers = Array.isArray(req.body?.memberIds) ? req.body.memberIds : [];
    if (!name) {
      res.status(400).json({ error: "group name is required" });
      return;
    }
    try {
      assertSafeCommunityText(name, "group name");
    } catch (error) {
      res.status(400).json({ error: String(error?.message || "Group name was rejected.") });
      return;
    }
    const memberIds = [...new Set([viewerId, ...requestedMembers.map((value) => String(value || "").trim()).filter(Boolean)])];
    if (memberIds.length < 2) {
      res.status(400).json({ error: "select at least one friend" });
      return;
    }
    if (memberIds.length > MAX_GROUP_MEMBERS) {
      res.status(400).json({ error: `group can have at most ${MAX_GROUP_MEMBERS} members` });
      return;
    }
    const friendships = (await readCollection("friendships")).map(normalizeFriendship);
    const blocks = (await readCollection("blocks")).map(normalizeBlock);
    const users = (await readCollection("users")).map(normalizeExistingUser);
    for (const memberId of memberIds) {
      if (memberId === viewerId) continue;
      if (!users.find((entry) => entry.id === memberId)) {
        res.status(404).json({ error: "one or more selected users do not exist" });
        return;
      }
      if (!areFriends(friendships, viewerId, memberId)) {
        res.status(403).json({ error: "study groups can only be created with friends" });
        return;
      }
      const member = users.find((entry) => entry.id === memberId);
      const memberPrivacy = normalizePrivacySettings(member?.privacy || {});
      if (memberPrivacy.groupAddVisibility === "nobody") {
        res.status(403).json({ error: "one or more selected users do not allow group adds" });
        return;
      }
      if (isBlocked(blocks, viewerId, memberId) || isBlocked(blocks, memberId, viewerId)) {
        res.status(403).json({ error: "blocked users cannot be added to a study group" });
        return;
      }
    }
    const conversations = (await readCollection("conversations")).map(normalizeConversation);
    const conversation = ensureConversationInviteToken({
      type: "group",
      name,
      memberIds,
      ownerUserId: viewerId,
      adminIds: [viewerId],
      bio: "",
      permissions: normalizeGroupPermissions({}),
    });
    conversations.push(conversation);
    await writeCollection("conversations", conversations);
    fireCommunityRealtimeMessages([
      buildCommunityOverviewRealtimeMessage("groups", {
        reason: "group-created",
        conversationId: conversation.id,
      }),
    ]);
    res.status(201).json({ ok: true, conversation });
  }),
);

app.get(
  "/api/community/groups/:groupId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const groupId = String(req.params.groupId || "");
    const conversations = (await readCollection("conversations")).map(normalizeConversation);
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const friendships = (await readCollection("friendships")).map(normalizeFriendship);
    const blocks = (await readCollection("blocks")).map(normalizeBlock);
    const uploads = (await readCollection("uploads")).map(normalizeUpload);
    const conversation = conversations.find((entry) => entry.id === groupId && entry.type === "group");
    if (!conversation || !conversation.memberIds.includes(viewerId)) {
      res.status(404).json({ error: "group not found" });
      return;
    }
    const group = getConversationDisplayPayload(conversation, {
      viewerId,
      users,
      friendships,
      blocks,
      uploads,
    });
    const members = conversation.memberIds
      .map((memberId) => {
        const member = users.find((entry) => entry.id === memberId);
        if (!member) return null;
        const memberView = applyCommunityProfileView(member, {
          viewerId,
          isFriend: areFriends(friendships, viewerId, member.id),
          ...getCommunityBlockState(blocks, viewerId, member.id),
        });
        return {
          ...memberView,
          role:
            memberId === conversation.ownerUserId
              ? "owner"
              : conversation.adminIds.includes(memberId)
                ? "admin"
                : "member",
        };
      })
      .filter(Boolean);
    const isOwner = String(conversation.ownerUserId || "") === viewerId;
    const isAdmin = isOwner || conversation.adminIds.includes(viewerId);
    const isMuted = Array.isArray(conversation.mutedMemberIds) && conversation.mutedMemberIds.includes(viewerId);
    res.json({
      ok: true,
      group,
      members,
      relationship: {
        isOwner,
        isAdmin,
        isMuted,
      },
    });
  }),
);

app.post(
  "/api/community/groups/:groupId/invite-link",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const groupId = String(req.params.groupId || "").trim();
    const conversations = (await readCollection("conversations")).map(normalizeConversation);
    const index = conversations.findIndex((entry) => entry.id === groupId && entry.type === "group");
    if (index < 0 || !conversations[index].memberIds.includes(viewerId)) {
      res.status(404).json({ error: "group not found" });
      return;
    }
    const conversation = conversations[index];
    const viewerIsOwner = String(conversation.ownerUserId || "") === viewerId;
    const viewerIsAdmin = viewerIsOwner || conversation.adminIds.includes(viewerId);
    const permissions = normalizeGroupPermissions(conversation.permissions || {});
    if (!viewerIsAdmin && !permissions.membersCanInviteByLink) {
      res.status(403).json({ error: "invite links are disabled for this group" });
      return;
    }
    const nextConversation = ensureConversationInviteToken(conversation);
    conversations[index] = nextConversation;
    await writeCollection("conversations", conversations);
    const requestOrigin = `${String(req.protocol || "https").trim()}://${String(req.get("host") || "").trim()}`.replace(/\/+$/g, "");
    res.json({
      ok: true,
      groupId: nextConversation.id,
      inviteToken: nextConversation.inviteToken,
      inviteExpiresAt: getConversationInviteExpiresAt(nextConversation),
      inviteUrl: requestOrigin
        ? `${requestOrigin}${buildCommunityGroupInviteUrl(nextConversation.inviteToken, nextConversation.id)}`
        : buildCommunityGroupInviteUrl(nextConversation.inviteToken, nextConversation.id),
    });
  }),
);

app.get(
  "/api/community/groups/:groupId/invite-preview",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user?.sub || "");
    if (viewerId) {
      await touchUserLastSeen(viewerId);
    }
    const groupId = String(req.params.groupId || "").trim();
    const inviteToken = String(req.query?.inviteToken || "").trim();
    if (!groupId || !inviteToken) {
      res.status(400).json({ error: "inviteToken is required" });
      return;
    }
    const conversations = (await readCollection("conversations")).map(normalizeConversation);
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const friendships = (await readCollection("friendships")).map(normalizeFriendship);
    const blocks = (await readCollection("blocks")).map(normalizeBlock);
    const uploads = (await readCollection("uploads")).map(normalizeUpload);
    const conversation = conversations.find((entry) => entry.id === groupId && entry.type === "group");
    if (!conversation) {
      res.status(404).json({ error: "group not found" });
      return;
    }
    const normalized = normalizeConversation(conversation);
    if (normalized.inviteToken !== inviteToken) {
      res.status(403).json({ error: "invite link is invalid or expired" });
      return;
    }
    const expired = isConversationInviteExpired(normalized);
    const group = getConversationDisplayPayload(normalized, {
      viewerId,
      users,
      friendships,
      blocks,
      uploads,
    });
    const members = normalized.memberIds
      .slice(0, 5)
      .map((memberId) => {
        const member = users.find((entry) => entry.id === memberId);
        if (!member) return null;
        return {
          ...applyCommunityProfileView(member, {
            viewerId,
            isFriend: areFriends(friendships, viewerId, member.id),
            ...getCommunityBlockState(blocks, viewerId, member.id),
          }),
          role:
            memberId === normalized.ownerUserId
              ? "owner"
              : normalized.adminIds.includes(memberId)
                ? "admin"
                : "member",
        };
      })
      .filter(Boolean);
    const isMember = Boolean(viewerId && normalized.memberIds.includes(viewerId));
    const isOwner = Boolean(viewerId && String(normalized.ownerUserId || "") === viewerId);
    const isAdmin = Boolean(viewerId && (isOwner || normalized.adminIds.includes(viewerId)));
    res.json({
      ok: true,
      group,
      members,
      memberCount: normalized.memberIds.length,
      invite: {
        inviteToken: normalized.inviteToken,
        inviteExpiresAt: getConversationInviteExpiresAt(normalized),
        expired,
      },
      relationship: {
        isMember,
        isOwner,
        isAdmin,
        isMuted: Boolean(viewerId && Array.isArray(normalized.mutedMemberIds) && normalized.mutedMemberIds.includes(viewerId)),
      },
    });
  }),
);

app.post(
  "/api/community/groups/:groupId/join",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const groupId = String(req.params.groupId || "").trim();
    const inviteToken = String(req.body?.inviteToken || "").trim();
    if (!groupId || !inviteToken) {
      res.status(400).json({ error: "inviteToken is required" });
      return;
    }
    const conversations = (await readCollection("conversations")).map(normalizeConversation);
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const friendships = (await readCollection("friendships")).map(normalizeFriendship);
    const blocks = (await readCollection("blocks")).map(normalizeBlock);
    const uploads = (await readCollection("uploads")).map(normalizeUpload);
    const index = conversations.findIndex((entry) => entry.id === groupId && entry.type === "group");
    if (index < 0) {
      res.status(404).json({ error: "group not found" });
      return;
    }
    const conversation = conversations[index];
    const normalized = ensureConversationInviteToken(conversation);
    if (normalized.inviteToken !== inviteToken) {
      res.status(403).json({ error: "invite link is invalid or expired" });
      return;
    }
    if (isConversationInviteExpired(normalized)) {
      res.status(403).json({ error: "invite link is invalid or expired" });
      return;
    }
    if (!normalized.memberIds.includes(viewerId)) {
      if (normalized.memberIds.length >= MAX_GROUP_MEMBERS) {
        res.status(400).json({ error: "group is full" });
        return;
      }
      normalized.memberIds = [...new Set([...normalized.memberIds, viewerId])].sort((a, b) => a.localeCompare(b));
      if (!normalized.ownerUserId) {
        normalized.ownerUserId = viewerId;
      }
      normalized.inviteToken = "";
      normalized.inviteTokenCreatedAt = "";
      normalized.updatedAt = new Date().toISOString();
      conversations[index] = normalized;
      await writeCollection("conversations", conversations);
      fireCommunityRealtimeMessages([
        buildCommunityOverviewRealtimeMessage("groups", {
          reason: "group-joined",
          conversationId: normalized.id,
          actorUserId: viewerId,
        }),
        ...buildCommunityConversationRealtimeMessages(normalized.id, {
          reason: "group-joined",
          actorUserId: viewerId,
        }),
      ]);
    }
    const group = getConversationDisplayPayload(normalized, { viewerId, users, friendships, blocks, uploads });
    const members = normalized.memberIds
      .map((memberId) => {
        const member = users.find((entry) => entry.id === memberId);
        if (!member) return null;
        return {
          ...applyCommunityProfileView(member, {
            viewerId,
            isFriend: areFriends(friendships, viewerId, member.id),
            ...getCommunityBlockState(blocks, viewerId, member.id),
          }),
          role:
            memberId === normalized.ownerUserId
              ? "owner"
              : normalized.adminIds.includes(memberId)
                ? "admin"
                : "member",
        };
      })
      .filter(Boolean);
    res.json({
      ok: true,
      group,
      members,
      relationship: {
        isOwner: String(normalized.ownerUserId || "") === viewerId,
        isAdmin: normalized.adminIds.includes(viewerId),
        isMuted: Array.isArray(normalized.mutedMemberIds) && normalized.mutedMemberIds.includes(viewerId),
      },
    });
  }),
);

app.post(
  "/api/community/groups/:groupId/members",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const groupId = String(req.params.groupId || "").trim();
    const requestedMembers = Array.isArray(req.body?.memberIds) ? req.body.memberIds : [];
    const memberIds = [...new Set(requestedMembers.map((value) => String(value || "").trim()).filter(Boolean))];
    if (!groupId || !memberIds.length) {
      res.status(400).json({ error: "memberIds are required" });
      return;
    }
    const conversations = (await readCollection("conversations")).map(normalizeConversation);
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const friendships = (await readCollection("friendships")).map(normalizeFriendship);
    const blocks = (await readCollection("blocks")).map(normalizeBlock);
    const index = conversations.findIndex((entry) => entry.id === groupId && entry.type === "group");
    if (index < 0 || !conversations[index].memberIds.includes(viewerId)) {
      res.status(404).json({ error: "group not found" });
      return;
    }
    const conversation = conversations[index];
    const viewerIsOwner = String(conversation.ownerUserId || "") === viewerId;
    const viewerIsAdmin = viewerIsOwner || conversation.adminIds.includes(viewerId);
    const permissions = normalizeGroupPermissions(conversation.permissions || {});
    if (!viewerIsAdmin && !permissions.membersCanAddMembers) {
      res.status(403).json({ error: "you cannot add participants to this group" });
      return;
    }
    const existingMembers = getConversationMemberSet(conversation);
    const additions = [];
    for (const candidateId of memberIds) {
      if (candidateId === viewerId || existingMembers.has(candidateId)) continue;
      const user = users.find((entry) => entry.id === candidateId);
      if (!user) {
        res.status(404).json({ error: "one or more selected users do not exist" });
        return;
      }
      if (!areFriends(friendships, viewerId, candidateId)) {
        res.status(403).json({ error: "study groups can only add friends" });
        return;
      }
      const memberPrivacy = normalizePrivacySettings(user.privacy || {});
      if (memberPrivacy.groupAddVisibility === "nobody") {
        res.status(403).json({ error: "one or more selected users do not allow group adds" });
        return;
      }
      if (isBlocked(blocks, viewerId, candidateId) || isBlocked(blocks, candidateId, viewerId)) {
        res.status(403).json({ error: "blocked users cannot be added to a study group" });
        return;
      }
      additions.push(candidateId);
    }
    if (!additions.length) {
      res.status(400).json({ error: "no eligible friends were selected" });
      return;
    }
    if (conversation.memberIds.length + additions.length > MAX_GROUP_MEMBERS) {
      res.status(400).json({ error: `group can have at most ${MAX_GROUP_MEMBERS} members` });
      return;
    }
    conversation.memberIds = [...new Set([...conversation.memberIds, ...additions])].sort((a, b) => a.localeCompare(b));
    conversation.updatedAt = new Date().toISOString();
    conversations[index] = normalizeConversation(conversation);
    await writeCollection("conversations", conversations);
    fireCommunityRealtimeMessages([
      buildCommunityOverviewRealtimeMessage("groups", {
        reason: "group-members-added",
        conversationId: conversation.id,
        actorUserId: viewerId,
        memberIds: additions,
      }),
      ...buildCommunityConversationRealtimeMessages(conversation.id, {
        reason: "group-members-added",
        actorUserId: viewerId,
        memberIds: additions,
      }),
    ]);
    const uploads = (await readCollection("uploads")).map(normalizeUpload);
    const group = getConversationDisplayPayload(conversation, { viewerId, users, friendships, blocks, uploads });
    const members = conversation.memberIds
      .map((memberId) => {
        const member = users.find((entry) => entry.id === memberId);
        if (!member) return null;
        return {
          ...applyCommunityProfileView(member, {
            viewerId,
            isFriend: areFriends(friendships, viewerId, member.id),
            ...getCommunityBlockState(blocks, viewerId, member.id),
          }),
          role:
            memberId === conversation.ownerUserId
              ? "owner"
              : conversation.adminIds.includes(memberId)
                ? "admin"
                : "member",
        };
      })
      .filter(Boolean);
    res.status(201).json({ ok: true, group, members });
  }),
);

app.post(
  "/api/community/groups/:groupId/leave",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const groupId = String(req.params.groupId || "").trim();
    const conversations = (await readCollection("conversations")).map(normalizeConversation);
    const index = conversations.findIndex((entry) => entry.id === groupId && entry.type === "group");
    if (index < 0 || !conversations[index].memberIds.includes(viewerId)) {
      res.status(404).json({ error: "group not found" });
      return;
    }
    const conversation = conversations[index];
    const remainingMembers = conversation.memberIds.filter((memberId) => memberId !== viewerId);
    if (remainingMembers.length === 0) {
      conversations.splice(index, 1);
      await writeCollection("conversations", conversations);
      fireCommunityRealtimeMessages([
        buildCommunityOverviewRealtimeMessage("groups", {
          reason: "group-deleted",
          conversationId: groupId,
          actorUserId: viewerId,
        }),
      ]);
      res.json({ ok: true, removed: true });
      return;
    }
    const nextOwnerId = String(conversation.ownerUserId || "") === viewerId
      ? getNextGroupOwnerId(conversation, viewerId)
      : String(conversation.ownerUserId || "");
    const nextAdminIds = Array.isArray(conversation.adminIds)
      ? conversation.adminIds.filter((memberId) => memberId !== viewerId)
      : [];
    if (nextOwnerId && !nextAdminIds.includes(nextOwnerId)) {
      nextAdminIds.push(nextOwnerId);
    }
    conversation.memberIds = remainingMembers.sort((a, b) => a.localeCompare(b));
    conversation.adminIds = [...new Set(nextAdminIds)].sort((a, b) => a.localeCompare(b));
    conversation.ownerUserId = nextOwnerId || remainingMembers[0] || "";
    conversation.mutedMemberIds = Array.isArray(conversation.mutedMemberIds)
      ? conversation.mutedMemberIds.filter((memberId) => memberId !== viewerId)
      : [];
    conversation.updatedAt = new Date().toISOString();
    conversations[index] = normalizeConversation(conversation);
    await writeCollection("conversations", conversations);
    fireCommunityRealtimeMessages([
      buildCommunityOverviewRealtimeMessage("groups", {
        reason: "group-member-left",
        conversationId: groupId,
        actorUserId: viewerId,
      }),
      ...buildCommunityConversationRealtimeMessages(groupId, {
        reason: "group-member-left",
        actorUserId: viewerId,
      }),
    ]);
    res.json({ ok: true });
  }),
);

app.delete(
  "/api/community/groups/:groupId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const groupId = String(req.params.groupId || "").trim();
    const conversations = (await readCollection("conversations")).map(normalizeConversation);
    const conversationIndex = conversations.findIndex((entry) => entry.id === groupId && entry.type === "group");
    if (conversationIndex < 0 || !conversations[conversationIndex].memberIds.includes(viewerId)) {
      res.status(404).json({ error: "group not found" });
      return;
    }
    const conversation = conversations[conversationIndex];
    const viewerIsOwner = String(conversation.ownerUserId || "") === viewerId;
    const viewerIsAdmin = viewerIsOwner || conversation.adminIds.includes(viewerId);
    if (!viewerIsOwner && !viewerIsAdmin) {
      res.status(403).json({ error: "only group owners or admins can delete groups" });
      return;
    }
    conversations.splice(conversationIndex, 1);
    const messages = (await readCollection("messages")).map(normalizeMessage);
    const conversationStates = (await readCollection("communityConversationStates")).map(
      normalizeCommunityConversationState,
    );
    await writeCollection(
      "messages",
      messages.filter((message) => String(message.conversationId || "") !== groupId),
    );
    await writeCollection(
      "communityConversationStates",
      conversationStates.filter((state) => String(state.conversationId || "") !== groupId),
    );
    await writeCollection("conversations", conversations);
    fireCommunityRealtimeMessages([
      buildCommunityOverviewRealtimeMessage("groups", {
        reason: "group-deleted",
        conversationId: groupId,
        actorUserId: viewerId,
      }),
    ]);
    res.json({ ok: true, deleted: true });
  }),
);

app.post(
  "/api/community/groups/:groupId/report",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const groupId = String(req.params.groupId || "").trim();
    const reason = normalizeWhitespace(req.body?.reason || "").slice(0, 240);
    const conversations = (await readCollection("conversations")).map(normalizeConversation);
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const group = conversations.find((entry) => entry.id === groupId && entry.type === "group");
    if (!group) {
      res.status(404).json({ error: "group not found" });
      return;
    }
    const reporter = users.find((entry) => entry.id === viewerId) || null;
    await appendAdminReportRecord({
      id: crypto.randomUUID(),
      type: "group",
      status: "open",
      targetId: groupId,
      targetName: group.name || "Study Group",
      reporterUserId: viewerId,
      reporterName: reporter?.name || reporter?.username || "",
      reason: reason || "reported from community",
      warningMessage: "",
      warningPreset: "",
      warningById: "",
      warningByName: "",
      warningIssuedAt: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    res.json({ ok: true });
  }),
);

app.post(
  "/api/community/groups/:groupId/avatar/file",
  requireAuth,
  express.raw({
    type: ["image/jpeg", "image/png", "image/webp", "image/gif", "application/octet-stream"],
    limit: "12mb",
  }),
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const groupId = String(req.params.groupId || "");
    const conversations = (await readCollection("conversations")).map(normalizeConversation);
    const uploads = (await readCollection("uploads")).map(normalizeUpload);
    const conversation = conversations.find((entry) => entry.id === groupId && entry.type === "group");
    if (!conversation || !conversation.memberIds.includes(viewerId)) {
      res.status(404).json({ error: "group not found" });
      return;
    }
    const viewerIsOwner = String(conversation.ownerUserId || "") === viewerId;
    const viewerIsAdmin = viewerIsOwner || conversation.adminIds.includes(viewerId);
    const viewerCanEditCoreSettings = viewerIsAdmin || Boolean(conversation.permissions?.membersCanEditSettings);
    if (!viewerCanEditCoreSettings) {
      res.status(403).json({ error: "only authorized members can edit group info" });
      return;
    }
    const contentType = String(req.get("content-type") || "application/octet-stream").trim().toLowerCase();
    const bodyBuffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || []);
    if (!bodyBuffer.length) {
      res.status(400).json({ error: "group photo file is required" });
      return;
    }
    const rawName = String(req.get("x-group-avatar-name") || "").trim();
    let fileName = "group-avatar";
    if (rawName) {
      try {
        fileName = decodeURIComponent(rawName).trim() || fileName;
      } catch {
        fileName = rawName.trim() || fileName;
      }
    }
    const effectiveMimeType = resolveUploadMimeType(contentType, fileName);
    if (!ALLOWED_IMAGE_MIME_TYPES.has(effectiveMimeType)) {
      res.status(400).json({ error: "Only JPG, PNG, WEBP, or GIF images are allowed." });
      return;
    }
    try {
      await moderateCommunityUploadBuffer(bodyBuffer, effectiveMimeType);
      const upload = await createStoredUploadFromBuffer({
        ownerUserId: viewerId,
        kind: "group-avatar",
        fileName: fileName.slice(0, 160),
        mimeType: effectiveMimeType,
        buffer: bodyBuffer,
      });
      const persistedUploadResult = persistUploadRecord(uploads, upload);
      const storedUpload = persistedUploadResult.upload;
      await writeCollection("uploads", persistedUploadResult.uploads);
      res.status(201).json({
        ok: true,
        upload: {
          id: storedUpload.id,
          fileName: storedUpload.fileName,
          originalName: storedUpload.originalName,
          mimeType: storedUpload.mimeType,
          bytes: storedUpload.bytes,
          fileType: storedUpload.fileType,
          dataUrl: resolveUploadPublicView(storedUpload).dataUrl,
        },
      });
    } catch (error) {
      res.status(400).json({ error: String(error?.message || "Group photo could not upload.") });
    }
  }),
);

app.patch(
  "/api/community/groups/:groupId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const groupId = String(req.params.groupId || "");
    const conversations = (await readCollection("conversations")).map(normalizeConversation);
    const conversationIndex = conversations.findIndex((entry) => entry.id === groupId && entry.type === "group");
    if (conversationIndex < 0 || !conversations[conversationIndex].memberIds.includes(viewerId)) {
      res.status(404).json({ error: "group not found" });
      return;
    }
    const conversation = conversations[conversationIndex];
    const viewerIsOwner = String(conversation.ownerUserId || "") === viewerId;
    const viewerIsAdmin = viewerIsOwner || conversation.adminIds.includes(viewerId);
    const viewerCanEditCoreSettings = viewerIsAdmin || Boolean(conversation.permissions?.membersCanEditSettings);
    const wantsCoreSettingsUpdate =
      req.body?.name !== undefined ||
      req.body?.bio !== undefined ||
      req.body?.avatarUploadId !== undefined ||
      req.body?.clearAvatar !== undefined;
    const wantsAdminSettingsUpdate = req.body?.permissions !== undefined;
    if (wantsCoreSettingsUpdate && !viewerCanEditCoreSettings) {
      res.status(403).json({ error: "only authorized members can update group settings" });
      return;
    }
    if (wantsAdminSettingsUpdate && !viewerIsAdmin) {
      res.status(403).json({ error: "only admins can update group settings" });
      return;
    }
    const nextConversation = { ...conversation };
    if (req.body?.isMuted !== undefined) {
      const mutedMemberIds = new Set(Array.isArray(nextConversation.mutedMemberIds) ? nextConversation.mutedMemberIds : []);
      if (Boolean(req.body.isMuted)) {
        mutedMemberIds.add(viewerId);
      } else {
        mutedMemberIds.delete(viewerId);
      }
      nextConversation.mutedMemberIds = [...mutedMemberIds].sort((a, b) => a.localeCompare(b));
    }
    if (req.body?.name !== undefined) {
      const name = normalizeWhitespace(req.body?.name || "").slice(0, 72);
      if (!name) {
        res.status(400).json({ error: "group name is required" });
        return;
      }
      try {
        assertSafeCommunityText(name, "group name");
      } catch (error) {
        res.status(400).json({ error: String(error?.message || "Group name was rejected.") });
        return;
      }
      nextConversation.name = name;
    }
    if (req.body?.bio !== undefined) {
      const bio = normalizeWhitespace(req.body?.bio || "").slice(0, 180);
      try {
        assertSafeCommunityText(bio, "group bio");
      } catch (error) {
        res.status(400).json({ error: String(error?.message || "Group bio was rejected.") });
        return;
      }
      nextConversation.bio = bio;
    }
    if (Boolean(req.body?.clearAvatar)) {
      nextConversation.avatarUploadId = "";
    } else if (req.body?.avatarUploadId !== undefined) {
      const uploadId = String(req.body?.avatarUploadId || "").trim();
      if (!uploadId) {
        nextConversation.avatarUploadId = "";
      } else {
        const uploads = (await readCollection("uploads")).map(normalizeUpload);
        const upload = uploads.find((entry) => entry.id === uploadId);
        if (!upload || upload.kind !== "group-avatar") {
          res.status(400).json({ error: "Group photo could not be found." });
          return;
        }
        if (upload.ownerUserId !== viewerId && !viewerIsAdmin) {
          res.status(403).json({ error: "You cannot use that group photo." });
          return;
        }
        nextConversation.avatarUploadId = upload.id;
      }
    }
    if (req.body?.permissions !== undefined) {
      nextConversation.permissions = normalizeGroupPermissions(req.body.permissions || {});
    }
    nextConversation.updatedAt = new Date().toISOString();
    conversations[conversationIndex] = normalizeConversation(nextConversation);
    await writeCollection("conversations", conversations);
    fireCommunityRealtimeMessages([
      buildCommunityOverviewRealtimeMessage("groups", {
        reason: "group-updated",
        conversationId: groupId,
      }),
      ...buildCommunityConversationRealtimeMessages(groupId, {
        reason: "group-updated",
      }),
    ]);
    res.json({ ok: true, group: conversations[conversationIndex] });
  }),
);

app.post(
  "/api/community/statuses",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const viewer = users.find((entry) => entry.id === viewerId) || null;
    const isAdminBroadcast = req.body?.isAdminBroadcast === true || String(req.body?.isAdminBroadcast || "").trim().toLowerCase() === "true";
    if (isAdminBroadcast && String(viewer?.role || "").trim().toLowerCase() !== "admin") {
      res.status(403).json({ error: "admin broadcast is restricted" });
      return;
    }
    const caption = normalizeWhitespace(req.body?.caption || "").slice(0, 140);
    const imageDataUrl = String(req.body?.imageDataUrl || req.body?.mediaDataUrl || "").trim();
    const text = normalizeWhitespace(req.body?.text || "").slice(0, 280);
    const background = String(req.body?.background || "#2f80d0").trim().slice(0, 160);
    const style = req.body?.style && typeof req.body.style === "object" ? req.body.style : {};
    const fileName = String(req.body?.fileName || "").trim();
    const visibility = String(req.body?.visibility || "friends").trim().toLowerCase();
    if (!imageDataUrl && !text) {
      res.status(400).json({ error: "status image or text is required" });
      return;
    }
    try {
      await moderateCommunityTextContent(caption);
      await moderateCommunityTextContent(text);
    } catch (error) {
      res.status(400).json({ error: String(error?.message || "Status was rejected.") });
      return;
    }
    let upload = null;
    if (imageDataUrl) {
      try {
        const parsedMedia = parseDataUrlByMime(imageDataUrl);
        if (!parsedMedia) {
          throw new Error("Invalid status media.");
        }
        await moderateCommunityUploadBuffer(
          Buffer.from(parsedMedia.dataUrl.split(";base64,")[1] || "", "base64"),
          parsedMedia.mimeType,
        );
        upload = await createStoredUploadFromDataUrl({
          ownerUserId: viewerId,
          kind: imageDataUrl.startsWith("data:video/") ? "status-video" : "status-image",
          fileName,
          dataUrl: imageDataUrl,
        });
      } catch (error) {
        res.status(400).json({ error: String(error?.message || "Invalid status media.") });
        return;
      }
    }
    try {
      const status = await persistCommunityStatus({
        viewerId,
        caption,
        text,
        background,
        visibility,
        style,
        upload,
        isAdminBroadcast,
      });
      res.status(201).json({ ok: true, status });
    } catch (error) {
      res.status(400).json({ error: String(error?.message || "Status could not be created.") });
    }
  }),
);

app.post(
  "/api/community/statuses/file",
  requireAuth,
  express.raw({
    type: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "application/octet-stream",
    ],
    limit: "220mb",
  }),
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const meta = parseStatusMetaHeader(req.get("x-status-meta"));
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const viewer = users.find((entry) => entry.id === viewerId) || null;
    const isAdminBroadcast = meta?.isAdminBroadcast === true || String(meta?.isAdminBroadcast || "").trim().toLowerCase() === "true";
    if (isAdminBroadcast && String(viewer?.role || "").trim().toLowerCase() !== "admin") {
      res.status(403).json({ error: "admin broadcast is restricted" });
      return;
    }
    const caption = normalizeWhitespace(meta?.caption || "").slice(0, 140);
    const visibility = String(meta?.visibility || "friends").trim().toLowerCase();
    const fileName = String(meta?.fileName || "status-media").trim().slice(0, 160) || "status-media";
    const style = meta?.style && typeof meta.style === "object" ? meta.style : {};
    const contentType = String(req.get("content-type") || "application/octet-stream").trim().toLowerCase();
    const effectiveMimeType = resolveUploadMimeType(contentType, fileName);
    const bodyBuffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || []);
    if (!bodyBuffer.length) {
      res.status(400).json({ error: "status media file is required" });
      return;
    }
    if (!ALLOWED_IMAGE_MIME_TYPES.has(effectiveMimeType) && !ALLOWED_VIDEO_MIME_TYPES.has(effectiveMimeType)) {
      res.status(400).json({ error: "Only image or video files are allowed." });
      return;
    }
    try {
      await moderateCommunityTextContent(caption);
      await moderateCommunityUploadBuffer(bodyBuffer, effectiveMimeType);
    } catch (error) {
      res.status(400).json({ error: String(error?.message || "Status was rejected.") });
      return;
    }
    try {
      let upload;
      let nextStyle = { ...style };
      if (ALLOWED_VIDEO_MIME_TYPES.has(effectiveMimeType)) {
        const processed = await trimStatusVideoBuffer(bodyBuffer, effectiveMimeType, {
          start: Number(style?.videoTrimStart || 0) || 0,
          end: Number(style?.videoTrimEnd || 0) || 0,
        });
        upload = await createStoredUploadFromBuffer({
          ownerUserId: viewerId,
          kind: "status-video",
          fileName: processed.trimmed
            ? fileName.replace(/\.[a-z0-9]+$/i, "") + ".mp4"
            : fileName,
          mimeType: processed.mimeType,
          buffer: processed.buffer,
        });
        nextStyle = {
          ...nextStyle,
          type: "video",
          videoTrimStart: 0,
          videoTrimEnd: Math.max(1, Math.min(COMMUNITY_STATUS_MAX_VIDEO_SECONDS, processed.durationSeconds || COMMUNITY_STATUS_MAX_VIDEO_SECONDS)),
          durationSeconds: Math.max(1, Math.min(COMMUNITY_STATUS_MAX_VIDEO_SECONDS, processed.durationSeconds || COMMUNITY_STATUS_MAX_VIDEO_SECONDS)),
        };
      } else {
        upload = await createStoredUploadFromBuffer({
          ownerUserId: viewerId,
          kind: "status-image",
          fileName,
          mimeType: effectiveMimeType,
          buffer: bodyBuffer,
        });
        nextStyle = {
          ...nextStyle,
          type: "image",
          durationSeconds: COMMUNITY_STATUS_MAX_VIDEO_SECONDS,
        };
      }
      const status = await persistCommunityStatus({
        viewerId,
        caption,
        visibility,
        style: nextStyle,
        upload,
        isAdminBroadcast,
      });
      res.status(201).json({ ok: true, status });
    } catch (error) {
      res.status(400).json({ error: String(error?.message || "Status media could not upload.") });
    }
  }),
);

app.post(
  "/api/community/statuses/video",
  requireAuth,
  express.raw({
    type: ["video/mp4", "video/webm", "video/quicktime", "application/octet-stream"],
    limit: "220mb",
  }),
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const meta = parseStatusMetaHeader(req.get("x-status-meta"));
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const viewer = users.find((entry) => entry.id === viewerId) || null;
    const isAdminBroadcast = meta?.isAdminBroadcast === true || String(meta?.isAdminBroadcast || "").trim().toLowerCase() === "true";
    if (isAdminBroadcast && String(viewer?.role || "").trim().toLowerCase() !== "admin") {
      res.status(403).json({ error: "admin broadcast is restricted" });
      return;
    }
    const caption = normalizeWhitespace(meta?.caption || "").slice(0, 140);
    const visibility = String(meta?.visibility || "friends").trim().toLowerCase();
    const fileName = String(meta?.fileName || "status-video").trim().slice(0, 160) || "status-video";
    const style = meta?.style && typeof meta.style === "object" ? meta.style : {};
    const contentType = String(req.get("content-type") || "application/octet-stream").trim().toLowerCase();
    const effectiveMimeType = resolveUploadMimeType(contentType, fileName);
    const bodyBuffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || []);
    if (!bodyBuffer.length) {
      res.status(400).json({ error: "status video file is required" });
      return;
    }
    if (!ALLOWED_VIDEO_MIME_TYPES.has(effectiveMimeType)) {
      res.status(400).json({ error: "Only MP4, WEBM, or MOV videos are allowed." });
      return;
    }
    try {
      await moderateCommunityTextContent(caption);
      await moderateCommunityUploadBuffer(bodyBuffer, effectiveMimeType);
    } catch (error) {
      res.status(400).json({ error: String(error?.message || "Status was rejected.") });
      return;
    }
    try {
      const processed = await trimStatusVideoBuffer(bodyBuffer, effectiveMimeType, {
        start: Number(style?.videoTrimStart || 0) || 0,
        end: Number(style?.videoTrimEnd || 0) || 0,
      });
      const upload = await createStoredUploadFromBuffer({
        ownerUserId: viewerId,
        kind: "status-video",
        fileName: processed.trimmed
          ? fileName.replace(/\.[a-z0-9]+$/i, "") + ".mp4"
          : fileName,
        mimeType: processed.mimeType,
        buffer: processed.buffer,
      });
      const status = await persistCommunityStatus({
        viewerId,
        caption,
        visibility,
        style: {
          ...style,
          type: "video",
          videoTrimStart: 0,
          videoTrimEnd: Math.max(1, Math.min(COMMUNITY_STATUS_MAX_VIDEO_SECONDS, processed.durationSeconds || COMMUNITY_STATUS_MAX_VIDEO_SECONDS)),
          durationSeconds: Math.max(1, Math.min(COMMUNITY_STATUS_MAX_VIDEO_SECONDS, processed.durationSeconds || COMMUNITY_STATUS_MAX_VIDEO_SECONDS)),
        },
        upload,
        isAdminBroadcast,
      });
      res.status(201).json({ ok: true, status, processed: processed.trimmed });
    } catch (error) {
      res.status(400).json({ error: String(error?.message || "Status video could not upload.") });
    }
  }),
);

app.post(
  "/api/community/statuses/:statusId/view",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const statusId = String(req.params.statusId || "");
    const statuses = (await purgeExpiredStatuses()).map(normalizeStatus);
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const friendships = (await readCollection("friendships")).map(normalizeFriendship);
    const blocks = (await readCollection("blocks")).map(normalizeBlock);
    const statusIndex = statuses.findIndex((entry) => entry.id === statusId);
    if (statusIndex < 0) {
      res.status(404).json({ error: "status not found" });
      return;
    }
    const status = statuses[statusIndex];
    const owner = users.find((entry) => entry.id === status.ownerUserId) || (status.isAdminBroadcast ? buildAdminBroadcastStatusOwnerView() : null);
    if (!owner || !canViewerSeeStatus(status, { viewerId, owner, isFriend: areFriends(friendships, viewerId, owner.id), blocks })) {
      res.status(403).json({ error: "status unavailable" });
      return;
    }
    if (!hasStatusActor(status.viewers, viewerId)) {
      statuses[statusIndex] = {
        ...status,
        viewers: addStatusActor(status.viewers, viewerId, new Date().toISOString()),
        updatedAt: new Date().toISOString(),
      };
      await writeCollection("statuses", statuses);
      fireCommunityRealtimeMessages([
        buildCommunityOverviewRealtimeMessage("statuses", {
          reason: "status-viewed",
          statusId,
          ownerUserId: status.ownerUserId,
        }),
      ]);
    }
    res.json({ ok: true });
  }),
);

app.post(
  "/api/community/statuses/:statusId/like",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const statusId = String(req.params.statusId || "");
    const statuses = (await purgeExpiredStatuses()).map(normalizeStatus);
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const friendships = (await readCollection("friendships")).map(normalizeFriendship);
    const blocks = (await readCollection("blocks")).map(normalizeBlock);
    const statusIndex = statuses.findIndex((entry) => entry.id === statusId);
    if (statusIndex < 0) {
      res.status(404).json({ error: "status not found" });
      return;
    }
    const status = statuses[statusIndex];
    const owner = users.find((entry) => entry.id === status.ownerUserId) || (status.isAdminBroadcast ? buildAdminBroadcastStatusOwnerView() : null);
    if (!owner || !canViewerSeeStatus(status, { viewerId, owner, isFriend: areFriends(friendships, viewerId, owner.id), blocks })) {
      res.status(403).json({ error: "status unavailable" });
      return;
    }
    const hasLiked = hasStatusActor(status.likes, viewerId);
    const nextLikes = hasLiked
      ? removeStatusActor(status.likes, viewerId, new Date().toISOString())
      : addStatusActor(status.likes, viewerId, new Date().toISOString());
    statuses[statusIndex] = {
      ...status,
      likes: nextLikes,
      updatedAt: new Date().toISOString(),
    };
    await writeCollection("statuses", statuses);
    fireCommunityRealtimeMessages([
      buildCommunityOverviewRealtimeMessage("statuses", {
        reason: "status-liked",
        statusId,
        ownerUserId: status.ownerUserId,
      }),
    ]);
    res.json({ ok: true, liked: !hasLiked, likesCount: nextLikes.length });
  }),
);

app.get(
  "/api/community/statuses/:statusId/likes",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const statusId = String(req.params.statusId || "");
    const statuses = (await purgeExpiredStatuses()).map(normalizeStatus);
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const friendships = (await readCollection("friendships")).map(normalizeFriendship);
    const blocks = (await readCollection("blocks")).map(normalizeBlock);
    const status = statuses.find((entry) => entry.id === statusId);
    if (!status) {
      res.status(404).json({ error: "status not found" });
      return;
    }
    if (String(status.ownerUserId || "") !== viewerId) {
      res.status(403).json({ error: "only the owner can view likes" });
      return;
    }
    const likes = [...status.likes]
      .sort((a, b) => String(b?.at || "").localeCompare(String(a?.at || "")))
      .map((entry) => {
        const user = users.find((candidate) => candidate.id === entry.userId);
        if (!user) return null;
        return {
          ...applyCommunityProfileView(user, {
            viewerId,
            isFriend: areFriends(friendships, viewerId, user.id),
            ...getCommunityBlockState(blocks, viewerId, user.id),
          }),
          likedAt: entry.at,
        };
      })
      .filter(Boolean);
    res.json({ likes });
  }),
);

app.get(
  "/api/community/statuses/:statusId/views",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const statusId = String(req.params.statusId || "");
    const statuses = (await purgeExpiredStatuses()).map(normalizeStatus);
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const friendships = (await readCollection("friendships")).map(normalizeFriendship);
    const blocks = (await readCollection("blocks")).map(normalizeBlock);
    const status = statuses.find((entry) => entry.id === statusId);
    if (!status) {
      res.status(404).json({ error: "status not found" });
      return;
    }
    if (String(status.ownerUserId || "") !== viewerId) {
      res.status(403).json({ error: "only the owner can view views" });
      return;
    }
    const views = [...status.viewers]
      .sort((a, b) => String(b?.at || "").localeCompare(String(a?.at || "")))
      .map((entry) => {
        const user = users.find((candidate) => candidate.id === entry.userId);
        if (!user) return null;
        return {
          ...applyCommunityProfileView(user, {
            viewerId,
            isFriend: areFriends(friendships, viewerId, user.id),
            ...getCommunityBlockState(blocks, viewerId, user.id),
          }),
          viewedAt: entry.at,
        };
      })
      .filter(Boolean);
    res.json({ views });
  }),
);

app.delete(
  "/api/community/statuses/:statusId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const statusId = String(req.params.statusId || "");
    const statuses = (await purgeExpiredStatuses()).map(normalizeStatus);
    const status = statuses.find((entry) => entry.id === statusId);
    if (!status) {
      res.status(404).json({ error: "status not found" });
      return;
    }
    if (status.ownerUserId !== viewerId) {
      res.status(403).json({ error: "only the owner can delete this status" });
      return;
    }
    await writeCollection("statuses", statuses.filter((entry) => entry.id !== statusId));
    fireCommunityRealtimeMessages([
      buildCommunityOverviewRealtimeMessage("statuses", {
        reason: "status-deleted",
        statusId,
        ownerUserId: viewerId,
      }),
    ]);
    res.json({ ok: true });
  }),
);

app.get(
  "/api/community/conversations/:conversationId/messages",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const conversationId = String(req.params.conversationId || "");
    const markRead = String(req.query?.markRead || "true").trim().toLowerCase() !== "false";
    const conversations = (await readCollection("conversations")).map(normalizeConversation);
    const messages = (await readCollection("messages")).map(normalizeMessage);
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const friendships = (await readCollection("friendships")).map(normalizeFriendship);
    const blocks = (await readCollection("blocks")).map(normalizeBlock);
    const uploads = (await readCollection("uploads")).map(normalizeUpload);
    const conversation = conversations.find((entry) => entry.id === conversationId);
    if (!conversation || !conversation.memberIds.includes(viewerId)) {
      res.status(404).json({ error: "conversation not found" });
      return;
    }
    const nowIso = new Date().toISOString();
    let changed = false;
    const nextMessages = messages.map((entry) => {
      if (
        entry.conversationId !== conversationId ||
        entry.senderUserId === viewerId ||
        entry.hiddenForUserIds?.includes(viewerId)
      ) {
        return entry;
      }
      const seenByUserIds = Array.isArray(entry.seenByUserIds) ? [...entry.seenByUserIds] : [];
      if (!seenByUserIds.includes(viewerId)) {
        seenByUserIds.push(viewerId);
      }
      const deliveredChanged = !entry.deliveredAt;
      const readChanged = markRead && !entry.readAt;
      const seenChanged = !Array.isArray(entry.seenByUserIds) || !entry.seenByUserIds.includes(viewerId);
      const nextEntry = {
        ...entry,
        deliveredAt: entry.deliveredAt || nowIso,
        readAt: markRead ? (entry.readAt || nowIso) : entry.readAt,
        seenByUserIds,
        updatedAt: deliveredChanged || readChanged || seenChanged ? nowIso : entry.updatedAt,
      };
      if (
        deliveredChanged ||
        readChanged ||
        seenChanged ||
        nextEntry.updatedAt !== entry.updatedAt
      ) {
        changed = true;
      }
      return nextEntry;
    });
    if (changed) {
      await writeCollection("messages", nextMessages);
      fireCommunityRealtimeMessages(
        buildCommunityConversationRealtimeMessages(conversationId, {
          reason: "message-read",
        }),
      );
    }
    res.json({
      partner: getConversationDisplayPayload(conversation, {
        viewerId,
        users,
        friendships,
        blocks,
        uploads,
      }),
      conversation,
      messages: (changed ? nextMessages : messages)
        .filter(
          (entry) =>
            entry.conversationId === conversationId &&
            !entry.deletedForUserIds?.includes(viewerId) &&
            !entry.hiddenForUserIds?.includes(viewerId),
        )
        .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)))
        .map((entry) => {
          const safeEntry = sanitizeDeletedCommunityMessage(entry);
          const sender = users.find((candidate) => candidate.id === entry.senderUserId);
          const fallbackSenderName =
            safeEntry.senderName ||
            sender?.name ||
            sender?.username ||
            (String(safeEntry.senderUserId || "") === ADMIN_NOTICE_SENDER_ID ? ADMIN_NOTICE_SENDER_NAME : "");
          if (!safeEntry.attachment?.uploadId) {
            return {
              ...safeEntry,
              senderName: fallbackSenderName,
              isDeletedForEveryone: Boolean(safeEntry.deletedAt),
            };
          }
          const upload = uploads.find((candidate) => candidate.id === safeEntry.attachment.uploadId);
          return {
            ...safeEntry,
            senderName: fallbackSenderName,
            attachment: {
              ...safeEntry.attachment,
              upload: upload ? resolveUploadPublicView(upload) : null,
            },
            isDeletedForEveryone: Boolean(safeEntry.deletedAt),
          };
        })
        .map((entry) => ({
          ...entry,
          senderName: entry.senderName || users.find((candidate) => candidate.id === entry.senderUserId)?.name || "",
        })),
    });
  }),
);

app.post(
  "/api/community/conversations/:conversationId/messages",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const conversationId = String(req.params.conversationId || "");
    const text = String(req.body?.text || "").trim();
    const replyTo = normalizeMessageReply(req.body?.replyTo || null);
    const attachmentDataUrl = String(req.body?.attachmentDataUrl || "").trim();
    const attachmentFileName = String(req.body?.attachmentFileName || "").trim();
    const attachmentMimeType = String(req.body?.attachmentMimeType || "").trim().toLowerCase();
    const conversations = (await readCollection("conversations")).map(normalizeConversation);
    const messages = (await readCollection("messages")).map(normalizeMessage);
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const blocks = (await readCollection("blocks")).map(normalizeBlock);
    const uploads = (await readCollection("uploads")).map(normalizeUpload);
    const conversationIndex = conversations.findIndex((entry) => entry.id === conversationId);
    if (conversationIndex < 0 || !conversations[conversationIndex].memberIds.includes(viewerId)) {
      res.status(404).json({ error: "conversation not found" });
      return;
    }
    const conversation = conversations[conversationIndex];
    if (conversation.type === "notice") {
      res.status(403).json({ error: "admin notices are read only" });
      return;
    }
    const partnerId =
      conversation.type === "direct"
        ? conversations[conversationIndex].memberIds.find((memberId) => memberId !== viewerId) || ""
        : "";
    if (conversation.type === "direct" && isBlocked(blocks, viewerId, partnerId)) {
      res.status(403).json({ error: "unblock user first" });
      return;
    }
    if (!text && !attachmentDataUrl) {
      res.status(400).json({ error: "message text or attachment is required" });
      return;
    }
    if (
      conversation.type === "group" &&
      !normalizeGroupPermissions(conversation.permissions || {}).membersCanSendMessages &&
      String(conversation.ownerUserId || "") !== viewerId &&
      !Array.isArray(conversation.adminIds || []).includes(viewerId)
    ) {
      res.status(403).json({ error: "only admins can send messages in this group" });
      return;
    }
    try {
      await moderateCommunityTextContent(text);
    } catch (error) {
      res.status(400).json({ error: String(error?.message || "Message was rejected.") });
      return;
    }
    let upload = null;
    if (attachmentDataUrl) {
      try {
        const normalizedAttachmentMimeType = normalizeUploadMimeType(attachmentMimeType);
        const parsedAttachment = parseDataUrlByMime(attachmentDataUrl);
        if (!parsedAttachment) {
          throw new Error("Invalid attachment.");
        }
        await moderateCommunityUploadBuffer(
          Buffer.from(parsedAttachment.dataUrl.split(";base64,")[1] || "", "base64"),
          parsedAttachment.mimeType,
        );
        upload = await createStoredUploadFromDataUrl({
          ownerUserId: viewerId,
          kind:
            normalizedAttachmentMimeType && ALLOWED_VIDEO_MIME_TYPES.has(normalizedAttachmentMimeType)
              ? "chat-video"
              : normalizedAttachmentMimeType && ALLOWED_AUDIO_MIME_TYPES.has(normalizedAttachmentMimeType)
                ? "chat-audio"
              : normalizedAttachmentMimeType && ALLOWED_IMAGE_MIME_TYPES.has(normalizedAttachmentMimeType)
                ? "chat-image"
                : "chat-file",
          fileName: attachmentFileName,
          dataUrl: attachmentDataUrl,
        });
      } catch (error) {
        res.status(400).json({ error: String(error?.message || "Invalid attachment.") });
        return;
      }
      uploads.push(upload);
    }
    const hiddenForUserIds =
      conversation.type === "direct" && isBlocked(blocks, partnerId, viewerId) ? [partnerId] : [];
    const message = normalizeMessage({
      conversationId,
      senderUserId: viewerId,
      type: upload ? getMessageTypeFromUpload(upload) : "text",
      text: text.slice(0, 2000),
      attachment: upload
        ? {
            uploadId: upload.id,
            kind: getMessageTypeFromUpload(upload),
            fileName: upload.fileName,
            mimeType: upload.mimeType,
          }
        : null,
      replyTo,
      deliveredAt: null,
      readAt: null,
      seenByUserIds: [viewerId],
      hiddenForUserIds,
    });
    messages.push(message);
    conversations[conversationIndex] = {
      ...conversations[conversationIndex],
      lastMessageId: message.id,
      lastMessageAt: message.createdAt,
      updatedAt: message.createdAt,
    };
    if (upload) {
      await writeCollection("uploads", uploads);
    }
    await writeCollection("messages", messages);
    await writeCollection("conversations", conversations);
    const sender = users.find((entry) => entry.id === viewerId) || null;
    fireCommunityRealtimeMessages(
      buildCommunityConversationRealtimeMessages(conversationId, {
        reason: "message-created",
        messageId: message.id,
        actorUserId: viewerId,
        actorName: sender?.name || sender?.username || "",
        conversationType: conversation.type,
        conversationName: conversation.type === "group" ? conversation.name || "Study Group" : "",
      }),
    );
    res.status(201).json({ ok: true, message });
  }),
);

app.post(
  "/api/community/conversations/:conversationId/messages/file",
  requireAuth,
  express.raw({
    type: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "audio/webm",
      "audio/ogg",
      "audio/mp4",
      "audio/mpeg",
      "audio/wav",
      "audio/x-wav",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
      "application/octet-stream",
    ],
    limit: "220mb",
  }),
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const conversationId = String(req.params.conversationId || "");
    const meta = parseMessageMetaHeader(req.get("x-message-meta"));
    const text = String(meta?.text || "").trim();
    const replyTo = normalizeMessageReply(meta?.replyTo || null);
    const fileName = String(meta?.fileName || "attachment").trim().slice(0, 160) || "attachment";
    const mediaStyle = meta?.mediaStyle && typeof meta.mediaStyle === "object" ? meta.mediaStyle : null;
    const contentType = String(req.get("content-type") || "application/octet-stream").trim().toLowerCase();
    const effectiveMimeType = resolveUploadMimeType(contentType, fileName);
    const bodyBuffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || []);
    if (!bodyBuffer.length) {
      res.status(400).json({ error: "attachment file is required" });
      return;
    }
    try {
      await moderateCommunityTextContent(text);
      await moderateCommunityUploadBuffer(bodyBuffer, effectiveMimeType);
    } catch (error) {
      res.status(400).json({ error: String(error?.message || "Invalid attachment.") });
      return;
    }
    let upload = null;
    try {
      let kind = "chat-file";
      if (ALLOWED_VIDEO_MIME_TYPES.has(effectiveMimeType)) kind = "chat-video";
      else if (ALLOWED_AUDIO_MIME_TYPES.has(effectiveMimeType)) kind = "chat-audio";
      else if (ALLOWED_IMAGE_MIME_TYPES.has(effectiveMimeType)) kind = "chat-image";
      let bufferToStore = bodyBuffer;
      let mimeTypeToStore = effectiveMimeType;
      let fileNameToStore = fileName;
      if (kind === "chat-video" && mediaStyle) {
        const processed = await trimStatusVideoBuffer(bodyBuffer, effectiveMimeType, {
          start: Number(mediaStyle?.videoTrimStart || 0) || 0,
          end: Number(mediaStyle?.videoTrimEnd || 0) || 0,
        });
        bufferToStore = processed.buffer;
        mimeTypeToStore = processed.mimeType;
        if (processed.trimmed) {
          fileNameToStore = fileName.replace(/\.[a-z0-9]+$/i, "") + ".mp4";
        }
      }
      upload = await createStoredUploadFromBuffer({
        ownerUserId: viewerId,
        kind,
        fileName: fileNameToStore,
        mimeType: mimeTypeToStore,
        buffer: bufferToStore,
      });
    } catch (error) {
      res.status(400).json({ error: String(error?.message || "Invalid attachment.") });
      return;
    }
    try {
      const message = await persistCommunityConversationMessage({
        viewerId,
        conversationId,
        text,
        replyTo,
        upload,
      });
      res.status(201).json({ ok: true, message });
    } catch (error) {
      const messageText = String(error?.message || "Message could not send right now.");
      const statusCode =
        messageText === "conversation not found" ? 404
          : messageText === "unblock user first" || messageText.includes("only admins can send messages") || messageText === "admin notices are read only" ? 403
            : messageText.includes("message text or attachment is required") ? 400
              : 400;
      res.status(statusCode).json({ error: messageText });
    }
  }),
);

app.patch(
  "/api/community/messages/:messageId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const messageId = String(req.params.messageId || "");
    const text = String(req.body?.text || "").trim();
    if (!text) {
      res.status(400).json({ error: "message text is required" });
      return;
    }
    try {
      await moderateCommunityTextContent(text);
    } catch (error) {
      res.status(400).json({ error: String(error?.message || "Message was rejected.") });
      return;
    }
    const messages = (await readCollection("messages")).map(normalizeMessage);
    const messageIndex = messages.findIndex((entry) => entry.id === messageId);
    if (messageIndex < 0) {
      res.status(404).json({ error: "message not found" });
      return;
    }
    const existing = messages[messageIndex];
    if (existing.senderUserId !== viewerId) {
      res.status(403).json({ error: "only the sender can edit this message" });
      return;
    }
    if (existing.deletedAt) {
      res.status(409).json({ error: "message is no longer available" });
      return;
    }
    const ageMs = Date.now() - new Date(existing.createdAt).getTime();
    if (!Number.isFinite(ageMs) || ageMs > 60 * 1000) {
      res.status(403).json({ error: "messages can only be edited within the first minute" });
      return;
    }
    const nowIso = new Date().toISOString();
    messages[messageIndex] = {
      ...existing,
      text: text.slice(0, 2000),
      editedAt: nowIso,
      updatedAt: nowIso,
    };
    await writeCollection("messages", messages);
    fireCommunityRealtimeMessages(
      buildCommunityConversationRealtimeMessages(existing.conversationId, {
        reason: "message-edited",
        messageId,
      }),
    );
    res.json({ ok: true, message: messages[messageIndex] });
  }),
);

app.delete(
  "/api/community/messages/:messageId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const viewerId = String(req.user.sub || "");
    await touchUserLastSeen(viewerId);
    const messageId = String(req.params.messageId || "");
    const scope = String(req.body?.scope || "self").trim().toLowerCase();
    const messages = (await readCollection("messages")).map(normalizeMessage);
    const conversations = (await readCollection("conversations")).map(normalizeConversation);
    const messageIndex = messages.findIndex((entry) => entry.id === messageId);
    if (messageIndex < 0) {
      res.status(404).json({ error: "message not found" });
      return;
    }
    const existing = messages[messageIndex];
    const conversationIndex = conversations.findIndex((entry) => entry.id === existing.conversationId);
    if (conversationIndex < 0 || !conversations[conversationIndex].memberIds.includes(viewerId)) {
      res.status(404).json({ error: "conversation not found" });
      return;
    }
    const isSender = existing.senderUserId === viewerId;
    const nowIso = new Date().toISOString();
    if (scope === "everyone") {
      if (!isSender) {
        res.status(403).json({ error: "only the sender can delete for everyone" });
        return;
      }
      messages[messageIndex] = {
        ...existing,
        type: "text",
        text: MESSAGE_DELETED_PLACEHOLDER,
        attachment: null,
        replyTo: null,
        editedAt: null,
        deletedAt: nowIso,
        updatedAt: nowIso,
      };
    } else {
      const deletedForUserIds = Array.isArray(existing.deletedForUserIds) ? [...existing.deletedForUserIds] : [];
      if (!deletedForUserIds.includes(viewerId)) {
        deletedForUserIds.push(viewerId);
      }
      messages[messageIndex] = {
        ...existing,
        deletedForUserIds,
        updatedAt: nowIso,
      };
    }

    if (scope === "everyone") {
      const latestVisible = getConversationLastVisibleMessage(messages, existing.conversationId, "");
      if (!latestVisible) {
        conversations[conversationIndex] = {
          ...conversations[conversationIndex],
          lastMessageId: "",
          lastMessageAt: conversations[conversationIndex].createdAt,
        };
      } else if (conversations[conversationIndex].lastMessageId === messageId) {
        conversations[conversationIndex] = {
          ...conversations[conversationIndex],
          lastMessageId: latestVisible.id,
          lastMessageAt: latestVisible.createdAt,
          updatedAt: latestVisible.createdAt,
        };
      }
    }

    await writeCollection("messages", messages);
    await writeCollection("conversations", conversations);
    fireCommunityRealtimeMessages(
      buildCommunityConversationRealtimeMessages(existing.conversationId, {
        reason: scope === "everyone" ? "message-deleted" : "message-hidden",
        messageId,
      }),
    );
    res.json({ ok: true });
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
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const user = users.find((entry) => entry.id === userId);
    if (!user) {
      res.status(404).json({ error: "user not found" });
      return;
    }

    const archiveRecord = await archiveDeletedUser(user, {
      deletedByType: "self",
      deletedById: userId,
      deletedByName: user.username || user.name || userId,
      deletionReason: "self-delete",
    });

    const filteredUsers = users.filter((entry) => entry.id !== userId);
    try {
      await writeCollection("users", filteredUsers);
    } catch (error) {
      await updateCollection("deletedUsers", async (items) =>
        items.filter((entry) => entry.archiveId !== archiveRecord.archiveId),
      );
      throw error;
    }

    res.json({
      ok: true,
      message: "Account moved to archive.",
      archiveId: archiveRecord.archiveId,
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
  "/api/questions/:questionId/insights",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const questionId = safeNumber(req.params.questionId);
    if (!Number.isInteger(questionId) || questionId <= 0) {
      res.status(400).json({ error: "questionId must be a positive integer" });
      return;
    }

    const questions = await readCollection("questions");
    const questionRaw = questions.find((entry) => Number(entry?.id) === questionId);
    if (!questionRaw) {
      res.status(404).json({ error: "question not found" });
      return;
    }

    const question = normalizeQuestionForApi(questionRaw);
    const catalog = buildChoiceCatalog(question);
    const rows = Array.isArray(catalog.rows) ? catalog.rows : [];
    const correctLetter = String(catalog.correctLetter || "");

    const events = (await readCollection("syncPerformance")).filter(
      (event) => Number(event?.questionId) === questionId,
    );

    const counts = new Map(rows.map((row) => [row.letter, 0]));
    events.forEach((event) => {
      const selectedAnswer = String(event?.selectedAnswer || "").trim();
      if (!selectedAnswer || /^skipped$/i.test(selectedAnswer)) return;
      const letter = resolveSelectionLetter(selectedAnswer, catalog);
      if (!letter) return;
      counts.set(letter, (counts.get(letter) || 0) + 1);
    });

    const sampleSize = [...counts.values()].reduce((sum, value) => sum + value, 0);
    const distribution = rows.map((row) => {
      const count = counts.get(row.letter) || 0;
      return {
        option: row.letter,
        text: row.text,
        count,
        percent: sampleSize > 0 ? Math.round((count / sampleSize) * 100) : 0,
        isCorrect: row.letter === correctLetter,
      };
    });

    const mostChosen =
      distribution
        .filter((row) => row.count > 0)
        .sort((a, b) => b.count - a.count || a.option.localeCompare(b.option))[0] ||
      null;

    const memoryTrick = buildQuestionMemoryTrick(
      question,
      correctLetter,
      mostChosen?.option || "",
    );

    res.json({
      ok: true,
      questionId,
      sampleSize,
      correctOption: correctLetter,
      mostChosen: mostChosen
        ? {
            option: mostChosen.option,
            count: mostChosen.count,
            percent: mostChosen.percent,
          }
        : null,
      distribution,
      memoryTrick,
    });
  }),
);

app.get(
  "/api/categories",
  asyncHandler(async (_req, res) => {
    res.json({ categories: [...MAJOR_CATEGORIES] });
  }),
);

app.get(
  "/api/daily-quiz/today",
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

    const todayKey = dateKeyInTimeZone();
    const seasonActive = isDateWithinDailySeason(todayKey);

    let dailyState = normalizeDailyQuizState(currentUser.dailyQuiz);
    let changed = false;

    if (dailyState.seasonKey !== DAILY_QUIZ_SEASON.key) {
      dailyState = {
        ...dailyState,
        seasonKey: DAILY_QUIZ_SEASON.key,
        streak: 0,
        lastCompletedDate: null,
        totalCompleted: 0,
        days: {},
      };
      changed = true;
    }

    if (seasonActive) {
      const allQuestions = await readCollection("questions");
      if (allQuestions.length < DAILY_QUIZ_SEASON.questionsPerDay) {
        res.status(503).json({
          error: `Daily quiz needs at least ${DAILY_QUIZ_SEASON.questionsPerDay} questions.`,
        });
        return;
      }
      const before = JSON.stringify(dailyState.days[todayKey] || null);
      ensureDailyQuizQuestionsForDate(
        dailyState,
        currentUser.id,
        todayKey,
        allQuestions,
      );
      const after = JSON.stringify(dailyState.days[todayKey] || null);
      if (before !== after) changed = true;
    }

    if (changed) {
      users[userIndex] = {
        ...currentUser,
        dailyQuiz: dailyState,
        updatedAt: new Date().toISOString(),
      };
      await writeCollection("users", users);
    }

    res.json(buildDailyQuizResponse(dailyState, todayKey));
  }),
);

app.post(
  "/api/daily-quiz/submit",
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

    const todayKey = dateKeyInTimeZone();
    if (!isDateWithinDailySeason(todayKey)) {
      res.status(400).json({ error: "Daily quiz season is not active." });
      return;
    }

    let dailyState = normalizeDailyQuizState(currentUser.dailyQuiz);
    if (dailyState.seasonKey !== DAILY_QUIZ_SEASON.key) {
      dailyState = {
        ...dailyState,
        seasonKey: DAILY_QUIZ_SEASON.key,
        streak: 0,
        lastCompletedDate: null,
        totalCompleted: 0,
        days: {},
      };
    }

    const allQuestions = await readCollection("questions");
    if (allQuestions.length < DAILY_QUIZ_SEASON.questionsPerDay) {
      res.status(503).json({
        error: `Daily quiz needs at least ${DAILY_QUIZ_SEASON.questionsPerDay} questions.`,
      });
      return;
    }
    const questionById = new Map(
      allQuestions.map((q) => [Number(q.id), normalizeQuestionForApi(q)]),
    );

    const questionIds = ensureDailyQuizQuestionsForDate(
      dailyState,
      currentUser.id,
      todayKey,
      allQuestions,
    );
    const day = dailyState.days[todayKey];

    if (day?.submittedAt) {
      res.status(409).json({
        error: "Daily quiz already submitted for today.",
        ...buildDailyQuizResponse(dailyState, todayKey),
      });
      return;
    }

    const answers =
      req.body?.answers && typeof req.body.answers === "object" ? req.body.answers : {};

    let score = 0;
    const wrongQuestionIds = [];

    for (const rawId of questionIds) {
      const id = Number(rawId);
      const question = questionById.get(id);
      if (!question) {
        wrongQuestionIds.push(id);
        continue;
      }
      const selected = String(answers[String(id)] || "").trim();
      const correct = String(question.correct || "").trim();
      if (selected && selected === correct) {
        score += 1;
      } else {
        wrongQuestionIds.push(id);
      }
    }

    const total = questionIds.length;
    const percent = total ? Math.round((score / total) * 100) : 0;
    const yesterdayKey = shiftDateKey(todayKey, -1);
    const previousStreak =
      dailyState.lastCompletedDate && dailyState.lastCompletedDate === yesterdayKey
        ? Number(dailyState.streak || 0)
        : 0;
    const streak = previousStreak + 1;

    const isStreakBonusEligible = previousStreak > 0;
    let streakBonus = 0;
    if (isStreakBonusEligible) {
      streakBonus =
        DAILY_REWARD_RULES.streakStep *
        Math.min(streak, DAILY_REWARD_RULES.streakCap);
      if (isWeekendInTimeZone(new Date(), DAILY_QUIZ_SEASON.timezone)) {
        streakBonus *= DAILY_REWARD_RULES.weekendStreakMultiplier;
      }
    }

    const rewards = {
      completion: DAILY_REWARD_RULES.completion,
      correctBonus: score * DAILY_REWARD_RULES.perCorrect,
      perfectBonus: score === total ? DAILY_REWARD_RULES.perfect : 0,
      streakBonus,
    };
    rewards.total =
      rewards.completion +
      rewards.correctBonus +
      rewards.perfectBonus +
      rewards.streakBonus;

    dailyState.gems = Number(dailyState.gems || 0) + rewards.total;
    dailyState.streak = streak;
    dailyState.lastCompletedDate = todayKey;
    dailyState.totalCompleted = Number(dailyState.totalCompleted || 0) + 1;
    dailyState.days[todayKey] = {
      questionIds,
      submittedAt: new Date().toISOString(),
      score,
      total,
      percent,
      rewards,
    };

    users[userIndex] = {
      ...currentUser,
      dailyQuiz: dailyState,
      updatedAt: new Date().toISOString(),
    };
    await writeCollection("users", users);

    res.json({
      ...buildDailyQuizResponse(dailyState, todayKey),
      result: {
        score,
        total,
        percent,
        streak,
        gemsAwarded: rewards.total,
        wrongQuestionIds,
        rewards,
      },
    });
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
    const rotation = inferQuestionRotation({
      rotation: req.body?.rotation,
      rotations: Array.isArray(req.body?.rotations) ? req.body.rotations : [],
      category: req.body?.category,
      question: "",
      explanation: "",
    }) || String(req.body?.rotation || "").trim();
    const selectedAnswer = String(req.body?.selectedAnswer || "")
      .trim()
      .slice(0, 220);

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
      rotation: String(rotation || "").trim() || undefined,
      selectedAnswer,
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
      date: req.body?.date || new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date()),
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
  "/api/sync/leaderboard",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const actorId = getActorId(req);
    const rawLimit = safeNumber(req.query.limit);
    const limit = Math.min(50, Math.max(3, Number(rawLimit) || 10));
    const requestedDate = String(req.query.date || "").trim();
    const dateKey = /^\d{4}-\d{2}-\d{2}$/.test(requestedDate)
      ? requestedDate
      : dateKeyInTimeZone();

    const sessions = await readCollection("syncSessions");
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const usersById = new Map(users.map((user) => [String(user.id), user]));

    const snapshot = buildDailyLeaderboardSnapshot({
      sessions,
      usersById,
      requestActorId: actorId,
      dateKey,
      limit,
    });

    res.json({
      ok: true,
      scope: "daily",
      date: dateKey,
      totalPlayers: snapshot.totalPlayers,
      leaderboard: snapshot.leaderboard,
      yourBest: snapshot.yourBest,
      topMessage: snapshot.yourBest
        ? `You're in the top ${snapshot.yourBest.topPercentile}% today.`
        : "Complete today's Daily Quiz to enter today's leaderboard.",
    });
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
      bio: u.bio,
      profileImage: u.profileImage,
      privacy: u.privacy,
      lastSeenAt: u.lastSeenAt,
      deactivatedAt: u.deactivatedAt,
      deactivatedUntil: u.deactivatedUntil,
      points: u.points,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));

    res.json({
      total: sanitized.length,
      users: sanitized,
    });
  }),
);

app.get(
  "/api/admin/deleted-users",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const deletedUsers = (await readCollection("deletedUsers"))
      .map(normalizeDeletedUserArchive)
      .sort((a, b) => String(b.deletedAt || "").localeCompare(String(a.deletedAt || "")));

    res.json({
      total: deletedUsers.length,
      deletedUsers: deletedUsers.map(toPublicDeletedUserArchive),
    });
  }),
);

app.post(
  "/api/admin/deleted-users/:archiveId/restore",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const archiveId = String(req.params.archiveId || "").trim();
    if (!archiveId) {
      res.status(400).json({ error: "archiveId is required" });
      return;
    }

    const deletedUsers = (await readCollection("deletedUsers")).map(
      normalizeDeletedUserArchive,
    );
    const archiveIndex = deletedUsers.findIndex((entry) => entry.archiveId === archiveId);
    if (archiveIndex < 0) {
      res.status(404).json({ error: "Archived user not found" });
      return;
    }

    const archive = deletedUsers[archiveIndex];
    if (archive.restoredAt) {
      res.status(409).json({ error: "This archive entry has already been restored" });
      return;
    }

    const activeUsers = (await readCollection("users")).map(normalizeExistingUser);
    const restoredUser = buildRestoredUserFromArchive(archive);
    const conflicts = findRestoreConflicts(activeUsers, restoredUser);
    if (conflicts.length > 0) {
      const conflictLabels = [];
      if (
        restoredUser.username &&
        conflicts.some((entry) => normalizeIdentifier(entry.username) === normalizeIdentifier(restoredUser.username))
      ) {
        conflictLabels.push("username");
      }
      if (
        restoredUser.email &&
        conflicts.some((entry) => normalizeIdentifier(entry.email) === normalizeIdentifier(restoredUser.email))
      ) {
        conflictLabels.push("email");
      }
      if (
        restoredUser.contact &&
        conflicts.some((entry) => normalizeIdentifier(entry.contact) === normalizeIdentifier(restoredUser.contact))
      ) {
        conflictLabels.push("contact");
      }

      res.status(409).json({
        error: "Cannot restore this account because an active account already uses the same identifier.",
        conflictFields: [...new Set(conflictLabels)],
      });
      return;
    }

    const restoredAt = new Date().toISOString();
    const restoredArchive = {
      ...archive,
      restoredAt,
      restoredByType: "admin",
      restoredById: "admin-dashboard",
      restoredByName: "Admin dashboard",
    };
    const nextUsers = [...activeUsers, restoredUser];
    const nextDeletedUsers = [...deletedUsers];
    nextDeletedUsers[archiveIndex] = restoredArchive;

    try {
      await writeCollection("users", nextUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to restore archived user" });
      return;
    }

    try {
      await writeCollection("deletedUsers", nextDeletedUsers);
    } catch (error) {
      await writeCollection("users", activeUsers);
      throw error;
    }

    res.json({
      ok: true,
      message: "Archived user restored",
      user: toPublicUser(restoredUser),
      archive: toPublicDeletedUserArchive(restoredArchive),
    });
  }),
);

app.get(
  "/api/admin/deleted-groups",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const deletedGroups = (await readCollection("deletedGroups"))
      .map(normalizeDeletedGroupArchive)
      .sort((a, b) => String(b.deletedAt || "").localeCompare(String(a.deletedAt || "")));
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const uploads = (await readCollection("uploads")).map(normalizeUpload);

    res.json({
      total: deletedGroups.length,
      deletedGroups: deletedGroups.map((archive) => toPublicDeletedGroupArchive(archive, { users, uploads })),
    });
  }),
);

app.post(
  "/api/admin/deleted-groups/:archiveId/restore",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const archiveId = String(req.params.archiveId || "").trim();
    if (!archiveId) {
      res.status(400).json({ error: "archiveId is required" });
      return;
    }

    const deletedGroups = (await readCollection("deletedGroups")).map(normalizeDeletedGroupArchive);
    const archiveIndex = deletedGroups.findIndex((entry) => entry.archiveId === archiveId);
    if (archiveIndex < 0) {
      res.status(404).json({ error: "Archive entry not found" });
      return;
    }

    const archive = deletedGroups[archiveIndex];
    if (archive.restoredAt) {
      res.status(409).json({ error: "This archive entry has already been restored" });
      return;
    }

    const restoredGroup = buildRestoredGroupFromArchive(archive);
    const conversations = (await readCollection("conversations")).map(normalizeConversation);
    const existingIndex = conversations.findIndex((entry) => entry.id === restoredGroup.id);
    if (existingIndex >= 0) {
      res.status(409).json({ error: "A group with this id already exists" });
      return;
    }

    conversations.push(restoredGroup);
    await writeCollection("conversations", conversations);

    const restoredArchive = {
      ...archive,
      restoredAt: new Date().toISOString(),
      restoredByType: "admin",
      restoredById: req.headers["x-admin-key"] ? "admin" : "",
      restoredByName: "Administrator",
    };
    const nextDeletedGroups = [...deletedGroups];
    nextDeletedGroups[archiveIndex] = restoredArchive;
    await writeCollection("deletedGroups", nextDeletedGroups);
    fireCommunityRealtimeMessages([
      buildCommunityOverviewRealtimeMessage("groups", {
        reason: "group-restored",
        conversationId: restoredGroup.id,
      }),
    ]);

    const users = (await readCollection("users")).map(normalizeExistingUser);
    const uploads = (await readCollection("uploads")).map(normalizeUpload);

    res.json({
      ok: true,
      archive: toPublicDeletedGroupArchive(restoredArchive, { users, uploads }),
      group: buildAdminGroupSummary(restoredGroup, { users, uploads }),
    });
  }),
);

app.get(
  "/api/admin/groups",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const conversations = (await readCollection("conversations")).map(normalizeConversation);
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const uploads = (await readCollection("uploads")).map(normalizeUpload);
    const groups = conversations
      .filter((conversation) => conversation.type === "group")
      .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
      .map((conversation) => buildAdminGroupSummary(conversation, { users, uploads }));

    res.json({
      total: groups.length,
      groups,
    });
  }),
);

app.get(
  "/api/admin/groups/:groupId",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const groupId = String(req.params.groupId || "").trim();
    const conversations = (await readCollection("conversations")).map(normalizeConversation);
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const uploads = (await readCollection("uploads")).map(normalizeUpload);
    const conversation = conversations.find((entry) => entry.id === groupId && entry.type === "group");
    if (!conversation) {
      res.status(404).json({ error: "Group not found" });
      return;
    }

    res.json({
      ok: true,
      group: buildAdminGroupDetail(conversation, { users, uploads }),
    });
  }),
);

app.delete(
  "/api/admin/groups/:groupId",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const groupId = String(req.params.groupId || "").trim();
    if (!groupId) {
      res.status(400).json({ error: "groupId is required" });
      return;
    }

    const conversations = (await readCollection("conversations")).map(normalizeConversation);
    const index = conversations.findIndex((entry) => entry.id === groupId && entry.type === "group");
    if (index < 0) {
      res.status(404).json({ error: "Group not found" });
      return;
    }

    const group = conversations[index];
    const archiveRecord = await archiveDeletedGroup(group, {
      deletedByType: "admin",
      deletedById: "admin",
      deletedByName: "Administrator",
      deletionReason: "Archived from admin dashboard",
    });

    conversations.splice(index, 1);
    await writeCollection("conversations", conversations);
    fireCommunityRealtimeMessages([
      buildCommunityOverviewRealtimeMessage("groups", {
        reason: "group-archived",
        conversationId: groupId,
      }),
    ]);

    const users = (await readCollection("users")).map(normalizeExistingUser);
    const uploads = (await readCollection("uploads")).map(normalizeUpload);
    res.json({
      ok: true,
      message: "Group archived.",
      archive: toPublicDeletedGroupArchive(archiveRecord, { users, uploads }),
    });
  }),
);

app.post(
  "/api/admin/users/:userId/message",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const userId = String(req.params.userId || "").trim();
    const message = normalizeWhitespace(req.body?.message || "").slice(0, 2000);
    if (!userId) {
      res.status(400).json({ error: "userId is required" });
      return;
    }
    if (!message) {
      res.status(400).json({ error: "message is required" });
      return;
    }

    const users = (await readCollection("users")).map(normalizeExistingUser);
    const targetUser = users.find((entry) => entry.id === userId);
    if (!targetUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const results = await sendAdminNoticeToRecipients([targetUser.id], {
      text: message,
      title: "Admin Message",
      subtitle: `Direct message for ${targetUser.name || targetUser.username || "this user"}`,
      originType: "user",
      originId: targetUser.id,
      originName: targetUser.name || targetUser.username || targetUser.id,
      noticeThreadKey: buildAdminNoticeThreadKey("user", targetUser.id),
    });

    res.json({
      ok: true,
      deliveredTo: results.length,
      conversationId: results[0]?.conversation?.id || "",
      messageId: results[0]?.message?.id || "",
    });
  }),
);

app.post(
  "/api/admin/groups/:groupId/message",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const groupId = String(req.params.groupId || "").trim();
    const message = normalizeWhitespace(req.body?.message || "").slice(0, 2000);
    if (!groupId) {
      res.status(400).json({ error: "groupId is required" });
      return;
    }
    if (!message) {
      res.status(400).json({ error: "message is required" });
      return;
    }

    const conversations = (await readCollection("conversations")).map(normalizeConversation);
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const uploads = (await readCollection("uploads")).map(normalizeUpload);
    const conversation = conversations.find((entry) => entry.id === groupId && entry.type === "group");
    if (!conversation) {
      res.status(404).json({ error: "Group not found" });
      return;
    }

    const recipientIds = getAdminNoticeRecipientIdsForGroup(conversation, { users });
    if (!recipientIds.length) {
      res.status(400).json({ error: "No group owners or admins found to receive this message" });
      return;
    }

    const results = await sendAdminNoticeToRecipients(recipientIds, {
      text: message,
      title: "Group Notice",
      subtitle: `Group: ${buildAdminGroupSummary(conversation, { users, uploads }).name}`,
      originType: "group",
      originId: conversation.id,
      originName: conversation.name || conversation.id,
      noticeThreadKey: buildAdminNoticeThreadKey("group", conversation.id),
    });

    res.json({
      ok: true,
      deliveredTo: results.length,
      conversationIds: results.map((entry) => entry.conversation?.id || "").filter(Boolean),
    });
  }),
);

app.post(
  "/api/admin/broadcast/message",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const message = normalizeWhitespace(req.body?.message || "").slice(0, 2000);
    const attachmentDataUrl = String(req.body?.attachmentDataUrl || "").trim();
    const attachmentFileName = String(req.body?.attachmentFileName || "").trim();
    const attachmentMimeType = String(req.body?.attachmentMimeType || "").trim().toLowerCase();
    if (!message && !attachmentDataUrl) {
      res.status(400).json({ error: "message text or attachment is required" });
      return;
    }

    const users = (await readCollection("users")).map(normalizeExistingUser);
    const recipientIds = users.filter((entry) => !isUserCurrentlyDeactivated(entry)).map((entry) => entry.id);
    if (!recipientIds.length) {
      res.status(400).json({ error: "No users found to receive this message" });
      return;
    }

    let upload = null;
    if (attachmentDataUrl) {
      const parsedAttachment = parseDataUrlByMime(attachmentDataUrl);
      if (!parsedAttachment) {
        res.status(400).json({ error: "Invalid attachment." });
        return;
      }
      try {
        await moderateCommunityUploadBuffer(
          Buffer.from(parsedAttachment.dataUrl.split(";base64,")[1] || "", "base64"),
          parsedAttachment.mimeType,
        );
        const attachmentKind = ALLOWED_IMAGE_MIME_TYPES.has(parsedAttachment.mimeType)
          ? "chat-image"
          : ALLOWED_VIDEO_MIME_TYPES.has(parsedAttachment.mimeType)
            ? "chat-video"
            : ALLOWED_AUDIO_MIME_TYPES.has(parsedAttachment.mimeType)
              ? "chat-audio"
              : "chat-file";
        upload = await createStoredUploadFromDataUrl({
          ownerUserId: ADMIN_NOTICE_SENDER_ID,
          kind: attachmentKind,
          fileName: attachmentFileName || "attachment",
          dataUrl: parsedAttachment.dataUrl,
        });
      } catch (error) {
        res.status(400).json({ error: String(error?.message || "Invalid attachment.") });
        return;
      }
    }

    const noticeBatchId = crypto.randomUUID();
    const deliveryResults = await sendAdminNoticeToRecipients(recipientIds, {
      text: message,
      title: "Broadcast",
      subtitle: "Announcement sent to all users",
      originType: "broadcast",
      originId: "all-users",
      originName: "All users",
      senderName: ADMIN_NOTICE_SENDER_NAME,
      upload,
      noticeThreadKey: buildAdminNoticeThreadKey("broadcast", "all-users"),
      noticeBatchId,
    });
    const storedMessage = await persistGlobalAdminBroadcastMessage({
      text: message,
      senderName: ADMIN_NOTICE_SENDER_NAME,
      upload,
      noticeBatchId,
    });

    res.json({
      ok: true,
      deliveredTo: deliveryResults.length,
      conversationIds: deliveryResults.map((entry) => entry.conversation?.id || "").filter(Boolean),
      messageId: storedMessage.id,
    });
  }),
);

app.post(
  "/api/admin/broadcast/status",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const caption = normalizeWhitespace(req.body?.caption || "").slice(0, 140);
    const text = normalizeWhitespace(req.body?.text || "").slice(0, 280);
    const background = String(req.body?.background || "#2f80d0").trim().slice(0, 160);
    const style = req.body?.style && typeof req.body.style === "object" ? req.body.style : {};
    const attachmentDataUrl = String(req.body?.attachmentDataUrl || req.body?.mediaDataUrl || "").trim();
    const attachmentFileName = String(req.body?.attachmentFileName || req.body?.fileName || "").trim();
    if (!text && !attachmentDataUrl) {
      res.status(400).json({ error: "status text or attachment is required" });
      return;
    }

    let upload = null;
    if (attachmentDataUrl) {
      const parsedAttachment = parseDataUrlByMime(attachmentDataUrl);
      if (!parsedAttachment) {
        res.status(400).json({ error: "Invalid status attachment." });
        return;
      }
      if (!ALLOWED_IMAGE_MIME_TYPES.has(parsedAttachment.mimeType) && !ALLOWED_VIDEO_MIME_TYPES.has(parsedAttachment.mimeType)) {
        res.status(400).json({ error: "Only image or video files are allowed for broadcast status." });
        return;
      }
      try {
        await moderateCommunityUploadBuffer(
          Buffer.from(parsedAttachment.dataUrl.split(";base64,")[1] || "", "base64"),
          parsedAttachment.mimeType,
        );
        const attachmentKind = ALLOWED_VIDEO_MIME_TYPES.has(parsedAttachment.mimeType)
          ? "status-video"
          : "status-image";
        upload = await createStoredUploadFromDataUrl({
          ownerUserId: ADMIN_NOTICE_SENDER_ID,
          kind: attachmentKind,
          fileName: attachmentFileName || (attachmentKind === "status-video" ? "broadcast-status.mp4" : "broadcast-status.jpg"),
          dataUrl: parsedAttachment.dataUrl,
        });
      } catch (error) {
        res.status(400).json({ error: String(error?.message || "Invalid status attachment.") });
        return;
      }
    }

    try {
      const status = await persistCommunityStatus({
        viewerId: ADMIN_NOTICE_SENDER_ID,
        caption,
        text,
        background,
        style,
        upload,
        isAdminBroadcast: true,
      });
      res.status(201).json({ ok: true, status });
    } catch (error) {
      res.status(400).json({ error: String(error?.message || "Status could not be created.") });
    }
  }),
);

app.get(
  "/api/admin/broadcast/overview",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const conversations = (await readCollection("conversations")).map(normalizeConversation);
    const messages = (await readCollection("messages")).map(normalizeMessage);
    const broadcastMessages = (await readCollection("adminBroadcastMessages")).map(normalizeAdminBroadcastMessage);
    const reports = (await readCollection("reports")).map(normalizeAdminReport);
    const uploads = (await readCollection("uploads")).map(normalizeUpload);
    const activeStatuses = await purgeExpiredStatuses();
    const activeUsers = (await readCollection("users")).map(normalizeExistingUser).filter((entry) => !isUserCurrentlyDeactivated(entry));

    const threads = buildAdminBroadcastThreadCollections({
      conversations,
      messages,
      uploads,
      broadcastMessages,
      broadcastRecipientCount: activeUsers.length,
      reports,
    }).map(buildAdminBroadcastThreadOverview);

    const statuses = activeStatuses
      .filter((entry) => entry.isAdminBroadcast === true)
      .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
      .map((entry) => {
        const upload = uploads.find((candidate) => candidate.id === entry.uploadId);
        return {
          id: entry.id,
          type: entry.type,
          text: entry.text,
          background: entry.background,
          textColor: entry.textColor,
          textStyle: entry.textStyle,
          textAlign: entry.textAlign,
          textScale: entry.textScale,
          textX: entry.textX,
          textY: entry.textY,
          textBold: entry.textBold === true,
          textItalic: entry.textItalic === true,
          textUnderline: entry.textUnderline === true,
          caption: entry.caption,
          allowReplies: false,
          isAdminBroadcast: true,
          imageFit: entry.imageFit,
          imageFilter: entry.imageFilter,
          imageRotate: entry.imageRotate,
          videoTrimStart: entry.videoTrimStart,
          videoTrimEnd: entry.videoTrimEnd,
          durationSeconds: entry.durationSeconds,
          createdAt: entry.createdAt,
          expiresAt: entry.expiresAt,
          owner: buildAdminBroadcastStatusOwnerView(),
          upload: upload ? resolveUploadPublicView(upload) : null,
        };
      });

    res.json({
      ok: true,
      threads,
      statuses,
    });
  }),
);

app.get(
  "/api/admin/broadcast/threads/:threadKey",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const threadKey = String(req.params.threadKey || "").trim();
    if (!threadKey) {
      res.status(400).json({ error: "threadKey is required" });
      return;
    }

    const conversations = (await readCollection("conversations")).map(normalizeConversation);
    const messages = (await readCollection("messages")).map(normalizeMessage);
    const broadcastMessages = (await readCollection("adminBroadcastMessages")).map(normalizeAdminBroadcastMessage);
    const reports = (await readCollection("reports")).map(normalizeAdminReport);
    const uploads = (await readCollection("uploads")).map(normalizeUpload);
    const thread = buildAdminBroadcastThreadDetail(threadKey, {
      conversations,
      messages,
      uploads,
      broadcastMessages,
      reports,
      broadcastRecipientCount: (await readCollection("users")).map(normalizeExistingUser).filter((entry) => !isUserCurrentlyDeactivated(entry)).length,
    });

    if (!thread) {
      res.status(404).json({ error: "Thread not found" });
      return;
    }

    res.json({
      ok: true,
      thread: buildAdminBroadcastThreadOverview(thread),
      batches: thread.batches,
    });
  }),
);

app.post(
  "/api/admin/broadcast/threads/:threadKey/message",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const threadKey = String(req.params.threadKey || "").trim();
    const message = normalizeWhitespace(req.body?.message || "").slice(0, 2000);
    const attachmentDataUrl = String(req.body?.attachmentDataUrl || "").trim();
    const attachmentFileName = String(req.body?.attachmentFileName || "").trim();
    if (!threadKey) {
      res.status(400).json({ error: "threadKey is required" });
      return;
    }
    if (!message && !attachmentDataUrl) {
      res.status(400).json({ error: "message text or attachment is required" });
      return;
    }

    const users = (await readCollection("users")).map(normalizeExistingUser);
    const conversations = (await readCollection("conversations")).map(normalizeConversation);
    const reports = (await readCollection("reports")).map(normalizeAdminReport);
    const metadata = getAdminNoticeThreadSendMetadata(threadKey, {
      users,
      conversations,
      reports,
    });
    if (!metadata) {
      res.status(404).json({ error: "Thread not found" });
      return;
    }

    let upload = null;
    if (attachmentDataUrl) {
      try {
        upload = await createAdminNoticeAttachmentUpload({
          attachmentDataUrl,
          attachmentFileName,
        });
      } catch (error) {
        res.status(400).json({ error: String(error?.message || "Invalid attachment.") });
        return;
      }
    }

    if (metadata.threadKey === ADMIN_BROADCAST_THREAD_KEY) {
      const noticeBatchId = crypto.randomUUID();
      const deliveryResults = await sendAdminNoticeToRecipients(
        users.filter((entry) => !isUserCurrentlyDeactivated(entry)).map((entry) => entry.id),
        {
          text: message,
          title: "Broadcast",
          subtitle: "Announcement sent to all users",
          originType: "broadcast",
          originId: "all-users",
          originName: "All users",
          senderName: ADMIN_NOTICE_SENDER_NAME,
          upload,
          noticeThreadKey: metadata.threadKey,
          noticeBatchId,
        },
      );
      const storedMessage = await persistGlobalAdminBroadcastMessage({
        text: message,
        senderName: ADMIN_NOTICE_SENDER_NAME,
        upload,
        noticeBatchId,
      });
      res.json({
        ok: true,
        deliveredTo: deliveryResults.length,
        threadKey: metadata.threadKey,
        conversationIds: deliveryResults.map((entry) => entry.conversation?.id || "").filter(Boolean),
        messageId: storedMessage.id,
      });
      return;
    }

    const results = await sendAdminNoticeToRecipients(metadata.recipientIds, {
      text: message,
      title: metadata.title,
      subtitle: metadata.subtitle,
      originType: metadata.originType,
      originId: metadata.originId,
      originName: metadata.originName,
      senderName: ADMIN_NOTICE_SENDER_NAME,
      upload,
      noticeThreadKey: metadata.threadKey,
    });

    res.json({
      ok: true,
      deliveredTo: results.length,
      threadKey: metadata.threadKey,
      conversationIds: results.map((entry) => entry.conversation?.id || "").filter(Boolean),
      messageId: results[0]?.message?.id || "",
    });
  }),
);

app.get(
  "/api/admin/reports",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const typeFilter = String(req.query.type || "").trim().toLowerCase();
    const conversations = (await readCollection("conversations")).map(normalizeConversation);
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const uploads = (await readCollection("uploads")).map(normalizeUpload);
    const reports = (await readCollection("reports"))
      .map(normalizeAdminReport)
      .filter((report) => {
        if (typeFilter !== "group" && typeFilter !== "user") return true;
        return report.type === typeFilter;
      })
      .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
      .map((report) =>
        buildAdminReportSnapshot(report, {
          users,
          conversations,
          uploads,
          includeTargetDetails: false,
        }),
      );

    res.json({
      total: reports.length,
      reports,
    });
  }),
);

app.get(
  "/api/admin/reports/:reportId",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const reportId = String(req.params.reportId || "").trim();
    const conversations = (await readCollection("conversations")).map(normalizeConversation);
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const uploads = (await readCollection("uploads")).map(normalizeUpload);
    const reports = (await readCollection("reports")).map(normalizeAdminReport);
    const report = reports.find((entry) => entry.id === reportId);
    if (!report) {
      res.status(404).json({ error: "Report not found" });
      return;
    }

    res.json({
      ok: true,
      report: buildAdminReportSnapshot(report, { users, conversations, uploads }),
    });
  }),
);

app.post(
  "/api/admin/reports/:reportId/warn",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const reportId = String(req.params.reportId || "").trim();
    const preset = normalizeAdminWarningTitle(req.body?.preset || "");
    const message = normalizeMultilineText(req.body?.message || "").slice(0, 2000);

    const reports = (await readCollection("reports")).map(normalizeAdminReport);
    const reportIndex = reports.findIndex((entry) => entry.id === reportId);
    if (reportIndex < 0) {
      res.status(404).json({ error: "Report not found" });
      return;
    }

    reports[reportIndex] = {
      ...reports[reportIndex],
      status: "warned",
      warningMessage: message || buildAdminWarningNoticeBody(reports[reportIndex], preset),
      warningPreset: preset,
      warningById: "admin",
      warningByName: ADMIN_NOTICE_SENDER_NAME,
      warningIssuedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await writeCollection("reports", reports);

    const conversations = (await readCollection("conversations")).map(normalizeConversation);
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const uploads = (await readCollection("uploads")).map(normalizeUpload);
    const report = reports[reportIndex];
    let deliveredTo = 0;
    try {
      const targetRecipients =
        report.type === "group"
          ? getAdminNoticeRecipientIdsForGroup(
              conversations.find((entry) => entry.id === report.targetId && entry.type === "group") || {},
              { users },
            )
          : [report.targetId];
      if (!targetRecipients.length) {
        res.status(400).json({ error: "No recipients found for this warning" });
        return;
      }
      const warningMessage = reports[reportIndex].warningMessage || buildAdminWarningNoticeBody(report, preset);
      const noticeResults = await sendAdminNoticeToRecipients(targetRecipients, {
        text: warningMessage,
        title: preset || "Community rules reminder",
        subtitle: `Report warning for ${report.targetName || report.targetUsername || report.targetId || "this account"}`,
        originType: "report",
        originId: report.id,
        originName: report.targetName || report.targetUsername || report.targetId || "",
        senderName: ADMIN_NOTICE_SENDER_NAME,
        noticeThreadKey: buildAdminNoticeThreadKey("report", report.id),
      });
      deliveredTo = noticeResults.length;
    } catch (error) {
      res.status(500).json({ error: String(error?.message || "Failed to send warning") });
      return;
    }

    res.json({
      ok: true,
      deliveredTo,
      report: buildAdminReportSnapshot(report, { users, conversations, uploads }),
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
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const user = users.find((entry) => entry.id === userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const archiveRecord = await archiveDeletedUser(user, {
      deletedByType: "admin",
      deletedById: "admin-dashboard",
      deletedByName: "Admin dashboard",
      deletionReason: "admin-delete",
    });

    const filtered = users.filter((entry) => entry.id !== userId);
    try {
      await writeCollection("users", filtered);
    } catch (error) {
      await updateCollection("deletedUsers", async (items) =>
        items.filter((entry) => entry.archiveId !== archiveRecord.archiveId),
      );
      throw error;
    }

    res.json({
      ok: true,
      message: "User moved to archive",
      archiveId: archiveRecord.archiveId,
    });
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
    const topicSlug = normalizeSlugValue(req.body?.topicSlug);
    const sectionId = normalizeSlugValue(req.body?.sectionId);
    const rotation = String(req.body?.rotation || "").trim();
    const drillTags = Array.isArray(req.body?.drillTags)
      ? req.body.drillTags.map((tag) => String(tag || "").trim().toLowerCase()).filter(Boolean)
      : [];
    const category = normalizeMajorCategory(
      rawCategory,
      [
        text,
        String(req.body?.explanation || ""),
        `sectionid:${sectionId || ""}`,
        `topic:${topicSlug || ""}`,
        `drilltags:${drillTags.join(",")}`,
        `lawdrill:${req.body?.lawDrill === true ? "true" : "false"}`,
      ]
        .filter(Boolean)
        .join(" "),
    );
    const options = Array.isArray(req.body?.options)
      ? req.body.options.map((opt) => String(opt || "").trim()).filter(Boolean)
      : [];
    const correct = req.body?.correct;

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
    if (rotation && !ALLOWED_ROTATIONS.has(rotation)) {
      res.status(400).json({
        error: "rotation must be one of the supported rotation names",
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
      drillTags: drillTags.length > 0 ? drillTags : undefined,
      lawDrill:
        req.body?.lawDrill === true ||
        drillTags.includes("law") ||
        String(sectionId || "").includes("law-drill"),
    };
    newQuestion.rotation = rotation || inferQuestionRotation(newQuestion) || undefined;

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
    const rotationProvided = req.body?.rotation !== undefined;
    const rotation = String(req.body?.rotation || "").trim();

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
    if (rotationProvided && rotation && !ALLOWED_ROTATIONS.has(rotation)) {
      res.status(400).json({
        error: "rotation must be one of the supported rotation names",
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
      const existingDrillTags = Array.isArray(questions[idx].drillTags)
        ? questions[idx].drillTags.map((tag) => String(tag || "").trim().toLowerCase()).filter(Boolean)
        : [];
      const categoryContext = [
        textProvided ? text : String(questions[idx].question || questions[idx].text || ""),
        String(questions[idx].explanation || ""),
        `sectionid:${String(questions[idx].sectionId || "").trim().toLowerCase()}`,
        `topic:${String(questions[idx].topicSlug || "").trim().toLowerCase()}`,
        `drilltags:${existingDrillTags.join(",")}`,
        `lawdrill:${questions[idx].lawDrill === true ? "true" : "false"}`,
      ]
        .filter(Boolean)
        .join(" ");
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
    questions[idx].rotation =
      (rotationProvided ? rotation : String(questions[idx].rotation || "").trim()) ||
      inferQuestionRotation(questions[idx]) ||
      undefined;

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
    const conversations = await readCollection("conversations");
    const reports = await readCollection("reports");
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
      totalGroups: conversations.filter((conversation) => String(conversation?.type || "").toLowerCase() === "group").length,
      totalReports: reports.length,
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
        groups: conversations.filter((conversation) => String(conversation?.type || "").toLowerCase() === "group").length,
        reports: reports.length,
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
    if (!config.enableAdminReset) {
      res.status(403).json({ error: "Admin reset is disabled on this deployment." });
      return;
    }
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

app.use("/api/*", (_req, res) => {
  res.status(404).json({ error: "API route not found. Restart the backend if new routes were just added." });
});

// Serve index.html for all non-API routes (SPA support)
app.get("*", (_req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.use((error, _req, res, _next) => {
  console.error(error);
  errorLogStream.write(
    `${new Date().toISOString()} ${error?.stack || String(error)}\n`,
  );
  if (String(error?.type || "").trim() === "entity.too.large" || Number(error?.status) === 413) {
    res.status(413).json({ error: "Attachment is too large for upload." });
    return;
  }
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
    console.log(
      `[users] cleared ${purgedDeactivatedUsers} expired deactivation(s) without deleting accounts`,
    );
  }
  if (seedInfo.seeded) {
    console.log(
      `[seed] imported ${seedInfo.count} questions from Quiz/data.js`,
    );
  }
  if (categoryNormalizeInfo.changed > 0) {
    console.log(
      `[taxonomy] normalized ${categoryNormalizeInfo.changed}/${categoryNormalizeInfo.total} question categories and rotation tags`,
    );
  }

  const purgeTimer = setInterval(async () => {
    try {
      const removed = await purgeExpiredDeactivatedUsers();
      if (removed > 0) {
        console.log(
          `[users] cleared ${removed} expired deactivation(s) without deleting accounts`,
        );
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
