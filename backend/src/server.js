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
const frontendPath = path.join(__dirname, "..", "..", "www");
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
  const dailyQuizSummary = buildDailyQuizSummary(
    normalizeDailyQuizState(normalized.dailyQuiz),
    getLocalSeasonKey(),
  );
  const setupPoints = normalized.setupPoints && typeof normalized.setupPoints === "object"
    ? normalized.setupPoints
    : {};
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
    professionalType: normalized.professionalType,
    country: normalized.country,
    institution: normalized.institution,
    profileImage: normalized.profileImage,
    points: Math.max(0, Math.round(Number(normalized.points) || 0)),
    setupPoints: normalizeSetupPoints(setupPoints),
    dailyQuiz: {
      ...dailyQuizSummary,
      dailyStreak: dailyQuizSummary.streak,
    },
    createdAt: normalized.createdAt,
    updatedAt: normalized.updatedAt,
    deactivatedAt: normalized.deactivatedAt,
    deactivatedUntil: normalized.deactivatedUntil,
  };
}

function normalizeLawDrillLevelStatus(levelStatus, index, currentLevelIndex, reviewLevelIndex) {
  const safeStatus = String(levelStatus || "").trim().toLowerCase();
  if (index < currentLevelIndex) return "completed";
  if (index === currentLevelIndex) return reviewLevelIndex === index ? "review" : "current";
  return ["completed", "current", "review"].includes(safeStatus) ? safeStatus : "locked";
}

function normalizeLawDrillState(rawState = null) {
  if (!rawState || typeof rawState !== "object") return null;

  const rawLevels = Array.isArray(rawState.levels) ? rawState.levels : [];
  if (!rawLevels.length) return null;

  const totalLevels = Math.max(1, Math.round(Number(rawState.totalLevels) || LAW_DRILL_TOTAL_LEVELS));
  const questionsPerLevel = Math.max(
    1,
    Math.round(Number(rawState.questionsPerLevel) || LAW_DRILL_QUESTIONS_PER_LEVEL),
  );
  const currentLevelIndex = Math.max(
    0,
    Math.min(rawLevels.length - 1, Math.round(Number(rawState.currentLevelIndex) || 0)),
  );
  const hasReviewLevel =
    rawState.reviewLevelIndex !== null &&
    rawState.reviewLevelIndex !== undefined &&
    String(rawState.reviewLevelIndex).trim() !== "";
  const reviewLevelIndex = hasReviewLevel
    ? Math.max(0, Math.min(rawLevels.length - 1, Math.round(Number(rawState.reviewLevelIndex) || 0)))
    : null;
  const hasResultLevel =
    rawState.resultLevelIndex !== null &&
    rawState.resultLevelIndex !== undefined &&
    String(rawState.resultLevelIndex).trim() !== "";
  const resultLevelIndex = hasResultLevel
    ? Math.max(0, Math.min(rawLevels.length - 1, Math.round(Number(rawState.resultLevelIndex) || 0)))
    : null;
  const rawView = String(rawState.view || "").trim().toLowerCase();
  const view = ["ladder", "level", "review", "result"].includes(rawView) ? rawView : "ladder";

  const levels = rawLevels.map((level, index) => ({
    index,
    questionIds: Array.isArray(level?.questionIds)
      ? level.questionIds
          .map((value) => Number(value))
          .filter((value) => Number.isInteger(value) && value > 0)
      : [],
    status: normalizeLawDrillLevelStatus(level?.status, index, currentLevelIndex, reviewLevelIndex),
    history: Array.isArray(level?.history)
      ? level.history.map((entry) => ({ ...(entry && typeof entry === "object" ? entry : {}) }))
      : [],
    score: Math.max(0, Math.round(Number(level?.score) || 0)),
    completedAt: String(level?.completedAt || "").trim(),
  }));

  return {
    version: Math.max(1, Math.round(Number(rawState.version) || 1)),
    totalLevels,
    questionsPerLevel,
    currentLevelIndex,
    reviewLevelIndex,
    resultLevelIndex,
    view,
    levels,
  };
}

function normalizeLawDrillSession(rawSession = null) {
  if (!rawSession || typeof rawSession !== "object") return null;

  const rawState = rawSession.lawDrillState || rawSession.state || rawSession;
  const lawDrillState = normalizeLawDrillState(rawState);
  if (!lawDrillState) return null;

  const rawActive = Array.isArray(rawSession.active) ? rawSession.active : [];
  return {
    mode: String(rawSession.mode || "study").trim().toLowerCase() || "study",
    studyType: String(rawSession.studyType || "law").trim().toLowerCase() || "law",
    current: Math.max(0, Math.round(Number(rawSession.current) || 0)),
    currentStreak: Math.max(0, Math.round(Number(rawSession.currentStreak) || 0)),
    userAnswers:
      rawSession.userAnswers && typeof rawSession.userAnswers === "object" && !Array.isArray(rawSession.userAnswers)
        ? { ...rawSession.userAnswers }
        : {},
    active: rawActive.map((item) => (item && typeof item === "object" ? { ...item } : item)).filter(Boolean),
    answeredCurrent: Boolean(rawSession.answeredCurrent),
    inReview: Boolean(rawSession.inReview),
    inDetailedReview: Boolean(rawSession.inDetailedReview),
    activeCase: String(rawSession.activeCase || "").trim(),
    backendAttemptId: String(rawSession.backendAttemptId || "").trim(),
    timestamp: Math.max(0, Math.round(Number(rawSession.timestamp) || 0)),
    lawDrillState,
  };
}

function getLawDrillSessionProgress(session = null) {
  const normalized = normalizeLawDrillSession(session);
  if (!normalized) return -1;

  const state = normalized.lawDrillState || {};
  const levels = Array.isArray(state.levels) ? state.levels : [];
  const completedLevels = levels.filter((level) => String(level?.status || "").trim().toLowerCase() === "completed").length;
  const totalHistory = levels.reduce(
    (total, level) => total + (Array.isArray(level?.history) ? level.history.length : 0),
    0,
  );
  const currentAnswerIndex = Math.max(0, Math.round(Number(normalized.current) || 0));
  const answeredCount = Object.keys(normalized.userAnswers || {}).length;

  return (
    Math.max(0, Math.round(Number(state.currentLevelIndex) || 0)) * 100000 +
    completedLevels * 1000 +
    totalHistory * 10 +
    currentAnswerIndex +
    answeredCount / 1000
  );
}

function mergeLawDrillSessions(currentSession = null, incomingSession = null) {
  const current = normalizeLawDrillSession(currentSession);
  const incoming = normalizeLawDrillSession(incomingSession);
  if (!current) return incoming;
  if (!incoming) return current;
  return getLawDrillSessionProgress(incoming) >= getLawDrillSessionProgress(current) ? incoming : current;
}

function toCurrentUser(user) {
  const normalized = normalizeExistingUser(user);
  return {
    ...toPublicUser(normalized),
    lawDrillSession: normalizeLawDrillSession(normalized.lawDrillSession),
  };
}

const COMMUNITY_DEFAULT_PUSH_CONFIG = {
  enabled: false,
};

const COMMUNITY_DEFAULT_REALTIME_CONFIG = {
  enabled: false,
  presence: false,
  typing: false,
  calls: false,
  messages: false,
};

const COMMUNITY_ADMIN_NOTICE_SENDER_ID = "__admin_notice__";

function parseSafeLimit(value, fallback = 20, max = 100) {
  const parsed = safeNumber(value);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

function normalizeIdList(values = []) {
  return [...new Set(
    (Array.isArray(values) ? values : [])
      .map((value) => String(value || "").trim())
      .filter(Boolean),
  )];
}

function getCommunityUploadSummary(upload = null) {
  if (!upload || typeof upload !== "object") return null;
  return {
    id: String(upload.id || "").trim(),
    kind: String(upload.kind || "").trim(),
    mimeType: String(upload.mimeType || "").trim(),
    bytes: Math.max(0, Math.round(Number(upload.bytes ?? upload.size) || 0)),
    size: Math.max(0, Math.round(Number(upload.size ?? upload.bytes) || 0)),
    fileName: String(upload.fileName || upload.originalName || "").trim(),
    originalName: String(upload.originalName || upload.fileName || "").trim(),
    newFileName: String(upload.newFileName || upload.fileName || "").trim(),
    fileType: String(upload.fileType || "").trim(),
    extension: String(upload.extension || "").trim(),
    storageFolder: String(upload.storageFolder || "").trim(),
    storageProvider: String(upload.storageProvider || "").trim(),
    storageId: String(upload.storageId || "").trim(),
    storageResourceType: String(upload.storageResourceType || "").trim(),
    dataUrl: String(upload.dataUrl || "").trim(),
    remoteUrl: String(upload.remoteUrl || "").trim(),
    createdAt: String(upload.createdAt || "").trim(),
    updatedAt: String(upload.updatedAt || upload.createdAt || "").trim(),
  };
}

function bufferToDataUrl(buffer, mimeType = "application/octet-stream") {
  const safeBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer || []);
  return `data:${String(mimeType || "application/octet-stream")};base64,${safeBuffer.toString("base64")}`;
}

function inferFileTypeFromMime(mimeType = "") {
  const lower = String(mimeType || "").trim().toLowerCase();
  if (lower.startsWith("image/")) return "image";
  if (lower.startsWith("video/")) return "video";
  if (lower.startsWith("audio/")) return "audio";
  return "file";
}

function normalizeCommunityAttachmentUpload(attachment = null, uploadsById = new Map()) {
  if (!attachment || typeof attachment !== "object") return null;
  const upload = attachment.upload && typeof attachment.upload === "object"
    ? attachment.upload
    : uploadsById.get(String(attachment.uploadId || attachment.id || "").trim()) || null;
  const normalizedUpload = upload ? getCommunityUploadSummary(upload) : null;
  return {
    ...attachment,
    upload: normalizedUpload,
    uploadId: normalizedUpload?.id || String(attachment.uploadId || attachment.id || "").trim(),
  };
}

function summarizeCommunityMessage(message = {}, uploadsById = new Map()) {
  const attachment = normalizeCommunityAttachmentUpload(message.attachment, uploadsById);
  return {
    id: String(message.id || "").trim(),
    conversationId: String(message.conversationId || "").trim(),
    senderUserId: String(message.senderUserId || "").trim(),
    senderName: String(message.senderName || "").trim(),
    type: String(message.type || "text").trim() || "text",
    text: String(message.text || "").trim(),
    attachment,
    call: message.call && typeof message.call === "object" ? { ...message.call } : null,
    replyTo: message.replyTo && typeof message.replyTo === "object" ? { ...message.replyTo } : null,
    deliveredAt: String(message.deliveredAt || "").trim(),
    readAt: String(message.readAt || "").trim() || null,
    seenByUserIds: normalizeIdList(message.seenByUserIds),
    editedAt: String(message.editedAt || "").trim() || null,
    deletedAt: String(message.deletedAt || "").trim() || null,
    deletedForUserIds: normalizeIdList(message.deletedForUserIds),
    hiddenForUserIds: normalizeIdList(message.hiddenForUserIds),
    noticeThreadKey: String(message.noticeThreadKey || "").trim(),
    noticeBatchId: String(message.noticeBatchId || "").trim(),
    createdAt: String(message.createdAt || "").trim(),
    updatedAt: String(message.updatedAt || message.createdAt || "").trim(),
  };
}

async function loadCommunityContext() {
  const [users, friendRequests, friendships, blocks, conversations, messages, statuses, uploads] =
    await Promise.all([
      readCollection("users"),
      readCollection("friendRequests"),
      readCollection("friendships"),
      readCollection("blocks"),
      readCollection("conversations"),
      readCollection("messages"),
      readCollection("statuses"),
      readCollection("uploads"),
    ]);

  const normalizedUsers = users.map(normalizeExistingUser);
  const usersById = new Map(normalizedUsers.map((user) => [String(user.id || "").trim(), user]));
  const uploadsById = new Map(uploads.map((upload) => [String(upload.id || "").trim(), upload]));

  return {
    users: normalizedUsers,
    usersById,
    friendRequests: Array.isArray(friendRequests) ? friendRequests : [],
    friendships: Array.isArray(friendships) ? friendships : [],
    blocks: Array.isArray(blocks) ? blocks : [],
    conversations: Array.isArray(conversations) ? conversations : [],
    messages: Array.isArray(messages) ? messages : [],
    statuses: Array.isArray(statuses) ? statuses : [],
    uploads: Array.isArray(uploads) ? uploads : [],
    uploadsById,
  };
}

function getViewerIdFromReq(req) {
  return String(req.user?.sub || "").trim();
}

function getCurrentViewerUser(usersById, viewerId) {
  const safeId = String(viewerId || "").trim();
  if (!safeId) return null;
  return usersById.get(safeId) || null;
}

function getBlockedRecord(blocks, blockerUserId, blockedUserId) {
  const safeBlockerId = String(blockerUserId || "").trim();
  const safeBlockedId = String(blockedUserId || "").trim();
  if (!safeBlockerId || !safeBlockedId) return null;
  return (Array.isArray(blocks) ? blocks : []).find(
    (block) =>
      String(block?.blockerUserId || "").trim() === safeBlockerId &&
      String(block?.blockedUserId || "").trim() === safeBlockedId,
  ) || null;
}

function collectFriendIds(viewerId, friendRequests = [], friendships = []) {
  const safeViewerId = String(viewerId || "").trim();
  const ids = new Set();

  for (const friendship of friendships || []) {
    const userA = String(friendship?.userA || "").trim();
    const userB = String(friendship?.userB || "").trim();
    if (userA === safeViewerId && userB) ids.add(userB);
    if (userB === safeViewerId && userA) ids.add(userA);
  }

  for (const request of friendRequests || []) {
    if (String(request?.status || "").trim().toLowerCase() !== "accepted") continue;
    const fromUserId = String(request?.fromUserId || "").trim();
    const toUserId = String(request?.toUserId || "").trim();
    if (fromUserId === safeViewerId && toUserId) ids.add(toUserId);
    if (toUserId === safeViewerId && fromUserId) ids.add(fromUserId);
  }

  return ids;
}

function buildCommunityRelationship(viewerId, targetId, { friendRequests = [], friendships = [], blocks = [] } = {}) {
  const safeViewerId = String(viewerId || "").trim();
  const safeTargetId = String(targetId || "").trim();
  const viewerBlockedTarget = Boolean(getBlockedRecord(blocks, safeViewerId, safeTargetId));
  const targetBlockedViewer = Boolean(getBlockedRecord(blocks, safeTargetId, safeViewerId));
  const friendIds = collectFriendIds(safeViewerId, friendRequests, friendships);
  const pendingIncoming = (friendRequests || []).some(
    (request) =>
      String(request?.status || "").trim().toLowerCase() === "pending" &&
      String(request?.fromUserId || "").trim() === safeTargetId &&
      String(request?.toUserId || "").trim() === safeViewerId,
  );
  const pendingSent = (friendRequests || []).some(
    (request) =>
      String(request?.status || "").trim().toLowerCase() === "pending" &&
      String(request?.fromUserId || "").trim() === safeViewerId &&
      String(request?.toUserId || "").trim() === safeTargetId,
  );

  return {
    isSelf: Boolean(safeViewerId && safeViewerId === safeTargetId),
    isFriend: friendIds.has(safeTargetId),
    pendingIncoming,
    pendingSent,
    blocked: viewerBlockedTarget,
    blockedByUser: targetBlockedViewer,
    relationship: safeViewerId === safeTargetId
      ? "self"
      : viewerBlockedTarget
        ? "blocked"
        : targetBlockedViewer
          ? "blocked-by-user"
          : friendIds.has(safeTargetId)
            ? "friend"
            : pendingIncoming
              ? "incoming"
              : pendingSent
                ? "sent"
                : "none",
  };
}

function getConversationMemberIds(conversation = {}) {
  return normalizeIdList(conversation.memberIds);
}

function getConversationHiddenViewerIds(conversation = {}) {
  return new Set([
    ...normalizeIdList(conversation.hiddenForUserIds),
    ...normalizeIdList(conversation.deletedForUserIds),
  ]);
}

function isConversationHiddenForViewer(conversation = {}, viewerId = "") {
  const safeViewerId = String(viewerId || "").trim();
  if (!safeViewerId) return false;
  return getConversationHiddenViewerIds(conversation).has(safeViewerId);
}

function addConversationViewerHiddenId(conversation = {}, viewerId = "") {
  const safeViewerId = String(viewerId || "").trim();
  if (!safeViewerId) return conversation;
  const hiddenForUserIds = normalizeIdList(conversation.hiddenForUserIds);
  if (!hiddenForUserIds.includes(safeViewerId)) hiddenForUserIds.push(safeViewerId);
  return {
    ...conversation,
    hiddenForUserIds,
    updatedAt: new Date().toISOString(),
  };
}

function removeConversationViewerHiddenId(conversation = {}, viewerId = "") {
  const safeViewerId = String(viewerId || "").trim();
  if (!safeViewerId) return conversation;
  const hiddenForUserIds = normalizeIdList(conversation.hiddenForUserIds).filter((id) => id !== safeViewerId);
  const deletedForUserIds = normalizeIdList(conversation.deletedForUserIds).filter((id) => id !== safeViewerId);
  return {
    ...conversation,
    hiddenForUserIds,
    deletedForUserIds,
    updatedAt: new Date().toISOString(),
  };
}

function getCommunityConversationUnreadCount(conversation = {}, context = {}) {
  const { viewerId = "", messagesByConversation = new Map() } = context;
  const safeViewerId = String(viewerId || "").trim();
  if (!safeViewerId) return 0;
  const conversationId = String(conversation.id || "").trim();
  if (!conversationId) return 0;
  if (!getConversationMemberIds(conversation).includes(safeViewerId)) return 0;
  const rawMessages = Array.isArray(messagesByConversation.get(conversationId))
    ? messagesByConversation.get(conversationId)
    : [];
  return rawMessages.reduce((count, message) => {
    if (String(message?.senderUserId || "").trim() === safeViewerId) return count;
    const hiddenForUserIds = normalizeIdList(message?.hiddenForUserIds);
    const deletedForUserIds = normalizeIdList(message?.deletedForUserIds);
    if (hiddenForUserIds.includes(safeViewerId) || deletedForUserIds.includes(safeViewerId)) return count;
    const readAt = String(message?.readAt || "").trim();
    const seenByUserIds = normalizeIdList(message?.seenByUserIds);
    if (readAt && seenByUserIds.includes(safeViewerId)) return count;
    return count + 1;
  }, 0);
}

function summarizeCommunityConversation(conversation = {}, context = {}) {
  const { viewerId = "", usersById = new Map(), uploadsById = new Map(), friendRequests = [], friendships = [], blocks = [], messagesByConversation = new Map() } = context;
  const safeType = String(conversation.type || "").trim().toLowerCase();
  const memberIds = getConversationMemberIds(conversation);
  const lastMessageId = String(conversation.lastMessageId || "").trim();
  const conversationMessages = [...(messagesByConversation.get(String(conversation.id || "").trim()) || [])]
    .sort((left, right) => String(left?.createdAt || "").localeCompare(String(right?.createdAt || "")));
  const viewerVisibleMessages = String(viewerId || "").trim()
    ? conversationMessages.filter((message) => {
        const hiddenForUserIds = normalizeIdList(message?.hiddenForUserIds);
        const deletedForUserIds = normalizeIdList(message?.deletedForUserIds);
        return !hiddenForUserIds.includes(String(viewerId || "").trim()) && !deletedForUserIds.includes(String(viewerId || "").trim());
      })
    : conversationMessages;
  const lastMessage = lastMessageId
    ? viewerVisibleMessages.find((message) => String(message.id || "").trim() === lastMessageId) || viewerVisibleMessages[viewerVisibleMessages.length - 1] || null
    : viewerVisibleMessages[viewerVisibleMessages.length - 1] || null;
  const summarizedLastMessage = lastMessage ? summarizeCommunityMessage(lastMessage, uploadsById) : null;
  const unreadCount = safeType === "notice"
    ? 0
    : getCommunityConversationUnreadCount(conversation, { viewerId, messagesByConversation });

  if (safeType === "notice") {
    const noticeAvatarUpload = conversation.noticeAvatarUploadId
      ? getCommunityUploadSummary(uploadsById.get(String(conversation.noticeAvatarUploadId || "").trim()))
      : null;
    const partner = {
      id: String(conversation.id || "").trim(),
      type: "notice",
      isNotice: true,
      isGroup: false,
      name: String(conversation.noticeTitle || conversation.name || "Admin Notice").trim() || "Admin Notice",
      displayName: String(conversation.noticeSenderName || conversation.noticeTitle || conversation.name || "Admin Notice").trim() || "Admin Notice",
      username: "",
      noticeTitle: String(conversation.noticeTitle || conversation.name || "").trim(),
      noticeSubtitle: String(conversation.noticeSubtitle || "").trim(),
      noticeBody: String(conversation.noticeBody || "").trim(),
      noticeSenderId: String(conversation.noticeSenderId || "").trim(),
      noticeSenderName: String(conversation.noticeSenderName || "").trim() || "AJIXPHARMACY Admin",
      noticeOriginType: String(conversation.noticeOriginType || "").trim(),
      noticeOriginId: String(conversation.noticeOriginId || "").trim(),
      noticeOriginName: String(conversation.noticeOriginName || "").trim(),
      noticeThreadKey: String(conversation.noticeThreadKey || "").trim(),
      noticeBatchId: String(conversation.noticeBatchId || "").trim(),
      profileImage: noticeAvatarUpload?.dataUrl || noticeAvatarUpload?.remoteUrl || "",
    };
    return {
      id: String(conversation.id || "").trim(),
      type: "notice",
      partner,
      lastMessage: summarizedLastMessage,
      unreadCount: 0,
      isFavorite: false,
      updatedAt: String(conversation.updatedAt || conversation.lastMessageAt || conversation.createdAt || "").trim(),
    };
  }

  if (safeType === "group" || safeType === "groupchat" || safeType === "community-group") {
    const groupAvatar = conversation.avatarUploadId
      ? getCommunityUploadSummary(uploadsById.get(String(conversation.avatarUploadId || "").trim()))
      : null;
    const group = {
        id: String(conversation.id || "").trim(),
        type: "group",
        conversationType: "group",
        isGroup: true,
      name: String(conversation.name || "Study Group").trim() || "Study Group",
      displayName: String(conversation.name || "Study Group").trim() || "Study Group",
      bio: String(conversation.bio || "").trim(),
      ownerUserId: String(conversation.ownerUserId || "").trim(),
      adminIds: normalizeIdList(conversation.adminIds),
      memberIds,
      mutedMemberIds: normalizeIdList(conversation.mutedMemberIds),
      permissions: conversation.permissions && typeof conversation.permissions === "object"
        ? { ...conversation.permissions }
        : {
            membersCanEditSettings: false,
            membersCanSendMessages: true,
            membersCanAddMembers: true,
            membersCanInviteByLink: true,
            adminsMustApproveNewMembers: false,
          },
      avatarUploadId: String(conversation.avatarUploadId || "").trim(),
      profileImage: groupAvatar?.dataUrl || groupAvatar?.remoteUrl || "",
      inviteToken: String(conversation.inviteToken || "").trim(),
      inviteTokenCreatedAt: String(conversation.inviteTokenCreatedAt || "").trim(),
      inviteExpiresAt: String(conversation.inviteExpiresAt || "").trim(),
      createdAt: String(conversation.createdAt || "").trim(),
      updatedAt: String(conversation.updatedAt || conversation.lastMessageAt || conversation.createdAt || "").trim(),
    };
    const viewerRelationship = buildCommunityRelationship(viewerId, group.id, { friendRequests, friendships, blocks });
    const members = memberIds
      .map((memberId) => {
        const user = usersById.get(memberId);
        if (!user) return null;
        const publicUser = toPublicUser(user);
        const role = memberId === group.ownerUserId
          ? "owner"
          : group.adminIds.includes(memberId)
            ? "admin"
            : "member";
        return {
          ...publicUser,
          role,
        };
      })
      .filter(Boolean);
    return {
      group,
      relationship: {
        ...viewerRelationship,
        isAdmin:
          viewerRelationship.isSelf ||
          group.ownerUserId === viewerId ||
          group.adminIds.includes(viewerId),
        isMuted: group.mutedMemberIds.includes(viewerId),
      },
      members,
      conversation: {
        id: group.id,
        type: "group",
        partner: group,
        lastMessage: summarizedLastMessage,
        unreadCount,
        isFavorite: Boolean(conversation.isFavorite),
        updatedAt: group.updatedAt,
      },
    };
  }

  const viewerMemberId = memberIds.includes(viewerId) ? viewerId : "";
  const otherMemberId = memberIds.find((memberId) => memberId !== viewerMemberId) || memberIds[0] || "";
  const partnerUser = usersById.get(otherMemberId) || null;
  const publicPartner = partnerUser ? toPublicUser(partnerUser) : {
    id: otherMemberId,
    name: "User",
    username: "",
    contact: "",
    contactType: "",
    email: "",
    role: "student",
    professionalType: "Other",
    country: "",
    institution: "",
    profileImage: "",
    createdAt: "",
    updatedAt: "",
    deactivatedAt: null,
    deactivatedUntil: null,
    title: "",
    firstName: "",
    lastName: "",
    surname: "",
  };
  const relationship = buildCommunityRelationship(viewerId, otherMemberId, { friendRequests, friendships, blocks });
  const partner = {
    ...publicPartner,
    ...relationship,
    isGroup: false,
    isNotice: false,
    relationship: relationship.relationship,
  };
  return {
    id: String(conversation.id || "").trim(),
    type: safeType || "direct",
    partner,
    lastMessage: summarizedLastMessage,
    unreadCount,
    isFavorite: Boolean(conversation.isFavorite),
    updatedAt: String(conversation.updatedAt || conversation.lastMessageAt || conversation.createdAt || "").trim(),
  };
}

function buildCommunityStatusGroups(statuses = [], usersById = new Map(), uploadsById = new Map(), viewerId = "") {
  const grouped = new Map();
  for (const rawStatus of statuses || []) {
    const ownerUserId = String(rawStatus?.ownerUserId || rawStatus?.userId || rawStatus?.senderUserId || "").trim();
    if (!ownerUserId) continue;
    const ownerUser = usersById.get(ownerUserId);
    if (!ownerUser) continue;
    const upload = rawStatus?.upload && typeof rawStatus.upload === "object"
      ? rawStatus.upload
      : uploadsById.get(String(rawStatus?.uploadId || rawStatus?.mediaUploadId || "").trim()) || null;
    const item = {
      id: String(rawStatus.id || "").trim(),
      ownerUserId,
      userId: ownerUserId,
      type: String(rawStatus.type || "text").trim() || "text",
      text: String(rawStatus.text || "").trim(),
      caption: String(rawStatus.caption || "").trim(),
      background: String(rawStatus.background || "#2f80d0").trim(),
      textColor: String(rawStatus.textColor || "#ffffff").trim(),
      textAlign: String(rawStatus.textAlign || "center").trim(),
      textScale: Number(rawStatus.textScale || 1) || 1,
      imageFit: String(rawStatus.imageFit || "contain").trim(),
      imageRotate: Number(rawStatus.imageRotate || 0) || 0,
      imageFilter: String(rawStatus.imageFilter || "none").trim(),
      allowReplies: rawStatus.allowReplies !== false,
      upload: getCommunityUploadSummary(upload),
      imageDataUrl: String(rawStatus.imageDataUrl || rawStatus.mediaDataUrl || "").trim(),
      videoDataUrl: String(rawStatus.videoDataUrl || "").trim(),
      fileName: String(rawStatus.fileName || "").trim(),
      visibility: String(rawStatus.visibility || "friends").trim(),
      viewsCount: Math.max(0, Math.round(Number(rawStatus.viewsCount || 0) || 0)),
      likesCount: Math.max(0, Math.round(Number(rawStatus.likesCount || 0) || 0)),
      likedByViewer: Array.isArray(rawStatus.likedByUserIds)
        ? rawStatus.likedByUserIds.map((value) => String(value || "").trim()).includes(viewerId)
        : false,
      viewed: Array.isArray(rawStatus.viewedByUserIds)
        ? rawStatus.viewedByUserIds.map((value) => String(value || "").trim()).includes(viewerId)
        : false,
      viewedByUserIds: normalizeIdList(rawStatus.viewedByUserIds),
      likedByUserIds: normalizeIdList(rawStatus.likedByUserIds),
      createdAt: String(rawStatus.createdAt || "").trim(),
      updatedAt: String(rawStatus.updatedAt || rawStatus.createdAt || "").trim(),
      owner: toPublicUser(ownerUser),
    };
    const existing = grouped.get(ownerUserId) || {
      user: toPublicUser(ownerUser),
      items: [],
      hasUnseen: false,
    };
    existing.items.push(item);
    existing.hasUnseen = existing.hasUnseen || (!item.viewed && ownerUserId !== viewerId);
    grouped.set(ownerUserId, existing);
  }

  return [...grouped.values()]
    .map((group) => ({
      ...group,
      items: [...group.items].sort((a, b) => String(a.createdAt || "").localeCompare(String(b.createdAt || ""))),
    }))
    .sort((a, b) => String(a.user?.name || "").localeCompare(String(b.user?.name || "")));
}

async function storeCommunityUpload({
  ownerUserId = "",
  kind = "file",
  mimeType = "application/octet-stream",
  fileName = "upload",
  originalName = "",
  buffer = Buffer.alloc(0),
  storageFolder = "community",
  storageProvider = "local",
  storageResourceType = "",
}) {
  const safeOwnerUserId = String(ownerUserId || "").trim();
  const safeMimeType = String(mimeType || "application/octet-stream").trim() || "application/octet-stream";
  const safeFileName = String(fileName || "upload").trim() || "upload";
  const safeOriginalName = String(originalName || safeFileName).trim() || safeFileName;
  const upload = {
    id: crypto.randomUUID(),
    ownerUserId: safeOwnerUserId,
    userId: safeOwnerUserId,
    kind: String(kind || "file").trim() || "file",
    mimeType: safeMimeType,
    bytes: Buffer.isBuffer(buffer) ? buffer.length : Buffer.byteLength(Buffer.from(buffer || [])),
    size: Buffer.isBuffer(buffer) ? buffer.length : Buffer.byteLength(Buffer.from(buffer || [])),
    fileName: safeFileName,
    originalName: safeOriginalName,
    newFileName: safeFileName,
    fileType: inferFileTypeFromMime(safeMimeType),
    extension: path.extname(safeFileName).toLowerCase(),
    storageFolder,
    fileHash: crypto.createHash("sha256").update(Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer || [])).digest("hex"),
    dataUrl: bufferToDataUrl(buffer, safeMimeType),
    remoteUrl: "",
    storageProvider,
    storageId: `${storageFolder}/${safeFileName}`,
    storageResourceType: storageResourceType || inferFileTypeFromMime(safeMimeType),
    storageVersion: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await updateCollection("uploads", async (items) => {
    items.push(upload);
    return items;
  });
  return upload;
}

async function buildCommunityOverviewPayload(req) {
  await syncAdminBroadcastNoticeConversation();
  const { users, usersById, friendRequests, friendships, blocks, conversations, messages, statuses, uploadsById } =
    await loadCommunityContext();
  const viewerId = getViewerIdFromReq(req);
  const viewerUser = getCurrentViewerUser(usersById, viewerId);
  const friendIds = collectFriendIds(viewerId, friendRequests, friendships);
  const blockedByViewerIds = new Set(
    blocks
      .filter((block) => String(block?.blockerUserId || "").trim() === viewerId)
      .map((block) => String(block?.blockedUserId || "").trim())
      .filter(Boolean),
  );
  const blockedViewerIds = new Set(
    blocks
      .filter((block) => String(block?.blockedUserId || "").trim() === viewerId)
      .map((block) => String(block?.blockerUserId || "").trim())
      .filter(Boolean),
  );
  const messagesByConversation = new Map();
  for (const message of messages) {
    const conversationId = String(message?.conversationId || "").trim();
    if (!conversationId) continue;
    const list = messagesByConversation.get(conversationId) || [];
    list.push(message);
    messagesByConversation.set(conversationId, list);
  }
  for (const list of messagesByConversation.values()) {
    list.sort((left, right) => String(left?.createdAt || "").localeCompare(String(right?.createdAt || "")));
  }
  const chats = conversations
    .filter((conversation) => {
      const type = String(conversation?.type || "").trim().toLowerCase();
      if (!viewerId) return type !== "notice" ? true : false;
      const memberIds = getConversationMemberIds(conversation);
      if (isConversationHiddenForViewer(conversation, viewerId)) return false;
      return memberIds.includes(viewerId) || type === "notice";
    })
    .map((conversation) =>
      summarizeCommunityConversation(conversation, {
        viewerId,
        usersById,
        uploadsById,
        friendRequests,
        friendships,
        blocks,
        messagesByConversation,
      }),
    )
    .sort((left, right) => {
      const leftTime = new Date(left.updatedAt || left.lastMessage?.createdAt || 0).getTime() || 0;
      const rightTime = new Date(right.updatedAt || right.lastMessage?.createdAt || 0).getTime() || 0;
      return rightTime - leftTime;
    });
  const groups = conversations
    .filter((conversation) => {
      const type = String(conversation?.type || "").trim().toLowerCase();
      if (type !== "group" && type !== "groupchat" && type !== "community-group") return false;
      if (!viewerId) return true;
      if (isConversationHiddenForViewer(conversation, viewerId)) return false;
      return getConversationMemberIds(conversation).includes(viewerId);
    })
    .map((conversation) =>
      summarizeCommunityConversation(conversation, {
        viewerId,
        usersById,
        uploadsById,
        friendRequests,
        friendships,
        blocks,
        messagesByConversation,
      }),
    )
    .filter((entry) => Boolean(entry?.group))
    .sort((left, right) => {
      const leftTime = new Date(left.group?.updatedAt || left.conversation?.updatedAt || left.lastMessage?.createdAt || 0).getTime() || 0;
      const rightTime = new Date(right.group?.updatedAt || right.conversation?.updatedAt || right.lastMessage?.createdAt || 0).getTime() || 0;
      return rightTime - leftTime;
    });

  const incoming = friendRequests
    .filter(
      (request) =>
        String(request?.status || "").trim().toLowerCase() === "pending" &&
        String(request?.toUserId || "").trim() === viewerId,
    )
    .map((request) => {
      const user = usersById.get(String(request?.fromUserId || "").trim());
      if (!user) return null;
      return {
        id: String(request.id || "").trim(),
        user: {
          ...toPublicUser(user),
          relationship: "incoming",
        },
        createdAt: String(request.createdAt || "").trim(),
        updatedAt: String(request.updatedAt || request.createdAt || "").trim(),
      };
    })
    .filter(Boolean);

  const sent = friendRequests
    .filter(
      (request) =>
        String(request?.status || "").trim().toLowerCase() === "pending" &&
        String(request?.fromUserId || "").trim() === viewerId,
    )
    .map((request) => {
      const user = usersById.get(String(request?.toUserId || "").trim());
      if (!user) return null;
      return {
        id: String(request.id || "").trim(),
        user: {
          ...toPublicUser(user),
          relationship: "sent",
        },
        createdAt: String(request.createdAt || "").trim(),
        updatedAt: String(request.updatedAt || request.createdAt || "").trim(),
      };
    })
    .filter(Boolean);

  const friends = [...friendIds]
    .map((friendId) => usersById.get(friendId))
    .filter(Boolean)
    .filter((user) => !blockedByViewerIds.has(String(user.id || "").trim()) && !blockedViewerIds.has(String(user.id || "").trim()))
    .map((user) => ({
      ...toPublicUser(user),
      relationship: "friend",
    }))
    .sort((left, right) => String(left.name || "").localeCompare(String(right.name || "")));

  const blocked = [...blockedByViewerIds]
    .map((blockedId) => usersById.get(blockedId))
    .filter(Boolean)
    .map((user) => ({
      ...toPublicUser(user),
      relationship: "blocked",
    }))
    .sort((left, right) => String(left.name || "").localeCompare(String(right.name || "")));

  const excludedIds = new Set([
    viewerId,
    ...friendIds,
    ...blockedByViewerIds,
    ...blockedViewerIds,
    ...incoming.map((row) => String(row?.user?.id || "").trim()),
    ...sent.map((row) => String(row?.user?.id || "").trim()),
  ].filter(Boolean));

  const suggested = users
    .filter((user) => {
      const userId = String(user.id || "").trim();
      if (!userId) return false;
      if (userId === viewerId) return false;
      if (excludedIds.has(userId)) return false;
      return true;
    })
    .map((user) => ({
      ...toPublicUser(user),
      relationship: "none",
    }))
    .slice(0, 24);

  const statusesPayload = buildCommunityStatusGroups(statuses, usersById, uploadsById, viewerId);

  return {
    me: viewerUser ? toPublicUser(viewerUser) : null,
    friends,
    incoming,
    sent,
    suggested,
    blocked,
    chats,
    groups,
    statuses: statusesPayload,
    requests: incoming,
  };
}

async function buildCommunityProfilePayload(req, userId) {
  const { users, usersById, friendRequests, friendships, blocks } = await loadCommunityContext();
  const viewerId = getViewerIdFromReq(req);
  const targetId = String(userId || "").trim();
  const targetUser = usersById.get(targetId);
  if (!targetUser) {
    return null;
  }
  const relationship = buildCommunityRelationship(viewerId, targetId, { friendRequests, friendships, blocks });
  return {
    profile: toPublicUser(targetUser),
    relationship,
  };
}

async function buildCommunityGroupPayload(req, groupId) {
  const { usersById, friendRequests, friendships, blocks, conversations, messages, uploadsById } = await loadCommunityContext();
  const viewerId = getViewerIdFromReq(req);
  const targetId = String(groupId || "").trim();
  const conversation = conversations.find((entry) => String(entry?.id || "").trim() === targetId);
  if (!conversation) {
    return null;
  }
  const summary = summarizeCommunityConversation(conversation, {
    viewerId,
    usersById,
    uploadsById,
    friendRequests,
    friendships,
    blocks,
    messagesByConversation: new Map(
      messages.reduce((acc, message) => {
        const conversationKey = String(message?.conversationId || "").trim();
        if (!conversationKey) return acc;
        const existing = acc.get(conversationKey) || [];
        existing.push(message);
        acc.set(conversationKey, existing);
        return acc;
      }, new Map()),
    ),
  });
  if (!summary.group) {
    return null;
  }
  return summary;
}

const COMMUNITY_GROUP_INVITE_TTL_MS = 24 * 60 * 60 * 1000;

function parseTimestamp(value) {
  const parsed = Date.parse(String(value || "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function buildCommunityGroupInviteState(conversation = {}) {
  const inviteToken = String(conversation.inviteToken || "").trim();
  const inviteTokenCreatedAt = String(conversation.inviteTokenCreatedAt || "").trim();
  const explicitExpiresAt = String(conversation.inviteExpiresAt || "").trim();
  const createdAtMs = parseTimestamp(inviteTokenCreatedAt);
  const computedExpiresAt = createdAtMs ? new Date(createdAtMs + COMMUNITY_GROUP_INVITE_TTL_MS).toISOString() : "";
  const inviteExpiresAt = explicitExpiresAt || computedExpiresAt;
  const expiresAtMs = parseTimestamp(inviteExpiresAt);
  const expired = !inviteToken || (expiresAtMs ? Date.now() >= expiresAtMs : false);

  return {
    inviteToken,
    inviteTokenCreatedAt,
    inviteExpiresAt,
    expired,
  };
}

function buildAdminGroupRecord(conversation = {}, { usersById = new Map(), uploadsById = new Map(), messagesByConversation = new Map() } = {}) {
  const summary = summarizeCommunityConversation(conversation, {
    viewerId: "",
    usersById,
    uploadsById,
    friendRequests: [],
    friendships: [],
    blocks: [],
    messagesByConversation,
  });
  if (!summary?.group) return null;

  const group = summary.group;
  const ownerUser = usersById.get(String(group.ownerUserId || "").trim()) || null;
  const avatarUpload = conversation.avatarUploadId
    ? getCommunityUploadSummary(uploadsById.get(String(conversation.avatarUploadId || "").trim()))
    : null;

  return {
    ...group,
    avatarUrl: avatarUpload?.dataUrl || avatarUpload?.remoteUrl || group.profileImage || "",
    ownerName: String(ownerUser?.name || "").trim(),
    ownerUsername: String(ownerUser?.username || "").trim(),
    memberCount: Array.isArray(group.memberIds) ? group.memberIds.length : 0,
    adminCount: Array.isArray(group.adminIds) ? group.adminIds.length : 0,
    inviteTokenCreatedAt: String(conversation.inviteTokenCreatedAt || "").trim(),
    inviteExpiresAt: String(conversation.inviteExpiresAt || "").trim(),
    members: Array.isArray(summary.members) ? summary.members : [],
    conversation: summary.conversation,
  };
}

function parseDataUrlMimeType(dataUrl = "") {
  const match = String(dataUrl || "").trim().match(/^data:([^;,]+)[;,]/i);
  return match ? match[1].trim().toLowerCase() : "";
}

function normalizeAdminBroadcastAttachment(attachment = {}, uploadsById = new Map()) {
  if (!attachment || typeof attachment !== "object") return null;
  const rawUpload =
    attachment.upload && typeof attachment.upload === "object"
      ? attachment.upload
      : uploadsById.get(String(attachment.uploadId || attachment.id || "").trim()) || null;
  const upload = rawUpload ? getCommunityUploadSummary(rawUpload) : null;
  const dataUrl = String(attachment.dataUrl || upload?.dataUrl || attachment.remoteUrl || "").trim();
  const mimeType =
    String(attachment.mimeType || upload?.mimeType || parseDataUrlMimeType(dataUrl) || "").trim() ||
    "application/octet-stream";
  const fileName = String(attachment.fileName || upload?.fileName || "attachment").trim() || "attachment";
  return {
    ...attachment,
    dataUrl,
    mimeType,
    fileName,
    upload,
    uploadId: upload?.id || String(attachment.uploadId || attachment.id || "").trim(),
  };
}

function normalizeAdminBroadcastMessage(message = {}, uploadsById = new Map()) {
  const attachment = normalizeAdminBroadcastAttachment(message.attachment, uploadsById);
  const type = String(
    message.type ||
      (attachment?.mimeType
        ? inferFileTypeFromMime(attachment.mimeType)
        : attachment?.dataUrl
          ? inferFileTypeFromMime(parseDataUrlMimeType(attachment.dataUrl))
          : "text"),
  ).trim() || "text";

  return {
    id: String(message.id || "").trim(),
    conversationId: String(message.conversationId || "").trim(),
    senderUserId: String(message.senderUserId || "").trim(),
    senderName: String(message.senderName || "").trim() || "AJIXPHARMACY Admin",
    type,
    text: String(message.text || "").trim(),
    attachment,
    call: message.call && typeof message.call === "object" ? { ...message.call } : null,
    replyTo: message.replyTo && typeof message.replyTo === "object" ? { ...message.replyTo } : null,
    deliveredAt: String(message.deliveredAt || "").trim() || null,
    readAt: String(message.readAt || "").trim() || null,
    seenByUserIds: normalizeIdList(message.seenByUserIds),
    editedAt: String(message.editedAt || "").trim() || null,
    deletedAt: String(message.deletedAt || "").trim() || null,
    deletedForUserIds: normalizeIdList(message.deletedForUserIds),
    hiddenForUserIds: normalizeIdList(message.hiddenForUserIds),
    noticeThreadKey: String(message.noticeThreadKey || "broadcast").trim() || "broadcast",
    noticeBatchId: String(message.noticeBatchId || "").trim() || String(message.id || "").trim(),
    createdAt: String(message.createdAt || "").trim(),
    updatedAt: String(message.updatedAt || message.createdAt || "").trim(),
  };
}

function buildAdminBroadcastThreadSummary(messages = [], recipientCount = 0, uploadsById = new Map()) {
  const groupedBatches = new Map();
  for (const rawMessage of Array.isArray(messages) ? messages : []) {
    const message = normalizeAdminBroadcastMessage(rawMessage, uploadsById);
    const batchKey = String(message.noticeBatchId || message.id || "").trim() || message.id;
    const existing = groupedBatches.get(batchKey);
    if (!existing) {
      groupedBatches.set(batchKey, {
        ...message,
        messageCount: 1,
      });
      continue;
    }
    existing.messageCount += 1;
    if (String(message.createdAt || "").localeCompare(String(existing.createdAt || "")) >= 0) {
      groupedBatches.set(batchKey, {
        ...existing,
        ...message,
        messageCount: existing.messageCount,
      });
    }
  }

  const batches = [...groupedBatches.values()].sort((left, right) =>
    String(left.createdAt || "").localeCompare(String(right.createdAt || "")),
  );
  const lastBatch = batches[batches.length - 1] || null;
  return {
    threadKey: "broadcast",
    title: "Announcement",
    subtitle: "Broadcast to everyone",
    originType: "broadcast",
    originId: "all-users",
    originName: "All users",
    latestAt: String(lastBatch?.createdAt || "").trim(),
    recipientCount: Math.max(0, Math.round(Number(recipientCount) || 0)),
    batchCount: batches.length,
    previewText: String(lastBatch?.text || "").trim() || (lastBatch?.attachment ? "Attachment only message" : "Broadcast to everyone"),
    lastMessage: lastBatch,
    batches,
  };
}

async function syncAdminBroadcastNoticeConversation(latestMessage = null) {
  const noticeConversationId = "__admin_broadcast__";
  const now = new Date().toISOString();

  if (latestMessage && typeof latestMessage === "object") {
    const message = normalizeAdminBroadcastMessage(latestMessage);
    const conversationNow = String(message.createdAt || message.updatedAt || now).trim() || now;
    const conversation = {
      id: noticeConversationId,
      type: "notice",
      conversationType: "notice",
      memberIds: [],
      ownerUserId: "__admin_notice__",
      adminIds: [],
      mutedMemberIds: [],
      name: "Announcement",
      bio: "Broadcast to everyone",
      permissions: {
        membersCanEditSettings: false,
        membersCanSendMessages: false,
        membersCanAddMembers: false,
        membersCanInviteByLink: false,
        adminsMustApproveNewMembers: false,
      },
      avatarUploadId: "",
      inviteToken: "",
      noticeTitle: "Announcement",
      noticeSubtitle: "Broadcast to everyone",
      noticeBody: String(message.text || "").trim(),
      noticeSenderId: "__admin_notice__",
      noticeSenderName: "AJIXPHARMACY Admin",
      noticeOriginType: "broadcast",
      noticeOriginId: "all-users",
      noticeOriginName: "All users",
      noticeThreadKey: "broadcast",
      noticeBatchId: String(message.noticeBatchId || message.id || "").trim() || String(message.id || "").trim(),
      lastMessageId: String(message.id || "").trim(),
      lastMessageAt: String(message.createdAt || message.updatedAt || conversationNow).trim() || conversationNow,
      createdAt: conversationNow,
      updatedAt: String(message.updatedAt || message.createdAt || conversationNow).trim() || conversationNow,
    };

    await updateCollection("messages", async (items) => {
      const existingIndex = items.findIndex(
        (entry) => String(entry?.id || "").trim() === String(message.id || "").trim(),
      );
      if (existingIndex === -1) {
        items.push(message);
        return items;
      }
      items[existingIndex] = {
        ...items[existingIndex],
        ...message,
      };
      return items;
    });

    await updateCollection("conversations", async (items) => {
      const existingIndex = items.findIndex(
        (entry) => String(entry?.id || "").trim() === noticeConversationId,
      );
      if (existingIndex === -1) {
        items.push(conversation);
        return items;
      }
      items[existingIndex] = {
        ...items[existingIndex],
        ...conversation,
      };
      return items;
    });

    return true;
  }

  const [conversations, adminBroadcastMessages, messages] = await Promise.all([
    readCollection("conversations"),
    readCollection("adminBroadcastMessages"),
    readCollection("messages"),
  ]);
  const broadcastMessages = adminBroadcastMessages
    .filter((message) => String(message?.noticeThreadKey || "broadcast").trim() === "broadcast")
    .sort((left, right) => String(left?.createdAt || "").localeCompare(String(right?.createdAt || "")));
  if (!broadcastMessages.length) {
    return false;
  }

  const normalizedMessages = broadcastMessages.map((entry) => normalizeAdminBroadcastMessage(entry));
  const latest = normalizedMessages[normalizedMessages.length - 1];
  const conversationNow = String(latest.createdAt || latest.updatedAt || now).trim() || now;
  const conversation = {
    id: noticeConversationId,
    type: "notice",
    conversationType: "notice",
    memberIds: [],
    ownerUserId: "__admin_notice__",
    adminIds: [],
    mutedMemberIds: [],
    name: "Announcement",
    bio: "Broadcast to everyone",
    permissions: {
      membersCanEditSettings: false,
      membersCanSendMessages: false,
      membersCanAddMembers: false,
      membersCanInviteByLink: false,
      adminsMustApproveNewMembers: false,
    },
    avatarUploadId: "",
    inviteToken: "",
    noticeTitle: "Announcement",
    noticeSubtitle: "Broadcast to everyone",
    noticeBody: String(latest.text || "").trim(),
    noticeSenderId: "__admin_notice__",
    noticeSenderName: "AJIXPHARMACY Admin",
    noticeOriginType: "broadcast",
    noticeOriginId: "all-users",
    noticeOriginName: "All users",
    noticeThreadKey: "broadcast",
    noticeBatchId: String(latest.noticeBatchId || latest.id || "").trim() || String(latest.id || "").trim(),
    lastMessageId: String(latest.id || "").trim(),
    lastMessageAt: String(latest.createdAt || latest.updatedAt || conversationNow).trim() || conversationNow,
    createdAt: conversationNow,
    updatedAt: String(latest.updatedAt || latest.createdAt || conversationNow).trim() || conversationNow,
  };

  const messageRecords = normalizedMessages.map((entry) => ({
    id: String(entry.id || "").trim(),
    conversationId: noticeConversationId,
    senderUserId: "__admin_notice__",
    senderName: "AJIXPHARMACY Admin",
    type: String(entry.type || "text").trim() || "text",
    text: String(entry.text || "").trim(),
    attachment: entry.attachment
      ? {
          ...entry.attachment,
          dataUrl: String(entry.attachment?.dataUrl || "").trim(),
        }
      : null,
    call: null,
    replyTo: null,
    deliveredAt: String(entry.deliveredAt || entry.createdAt || "").trim() || null,
    readAt: String(entry.readAt || "").trim() || null,
    seenByUserIds: normalizeIdList(entry.seenByUserIds),
    editedAt: String(entry.editedAt || "").trim() || null,
    deletedAt: String(entry.deletedAt || "").trim() || null,
    deletedForUserIds: normalizeIdList(entry.deletedForUserIds),
    hiddenForUserIds: normalizeIdList(entry.hiddenForUserIds),
    noticeThreadKey: "broadcast",
    noticeBatchId: String(entry.noticeBatchId || entry.id || "").trim() || String(entry.id || "").trim(),
    createdAt: String(entry.createdAt || entry.updatedAt || conversationNow).trim() || conversationNow,
    updatedAt: String(entry.updatedAt || entry.createdAt || conversationNow).trim() || conversationNow,
  }));

  await updateCollection("messages", async (items) => {
    const existingIds = new Set(items.map((entry) => String(entry?.id || "").trim()).filter(Boolean));
    for (const record of messageRecords) {
      if (!record.id) continue;
      const existingIndex = items.findIndex((entry) => String(entry?.id || "").trim() === record.id);
      if (existingIndex === -1) {
        if (!existingIds.has(record.id)) {
          items.push(record);
          existingIds.add(record.id);
        }
        continue;
      }
      items[existingIndex] = {
        ...items[existingIndex],
        ...record,
      };
    }
    return items;
  });

  const existingConversation = conversations.find(
    (entry) => String(entry?.id || "").trim() === noticeConversationId,
  );
  if (!existingConversation || String(existingConversation?.type || "").trim().toLowerCase() !== "notice") {
    await updateCollection("conversations", async (items) => {
      const existingIndex = items.findIndex(
        (entry) => String(entry?.id || "").trim() === noticeConversationId,
      );
      if (existingIndex === -1) {
        items.push(conversation);
        return items;
      }
      items[existingIndex] = {
        ...items[existingIndex],
        ...conversation,
      };
      return items;
    });
    return true;
  }

  const currentLastMessageId = String(existingConversation?.lastMessageId || "").trim();
  const currentUpdatedAt = String(existingConversation?.updatedAt || "").trim();
  if (
    currentLastMessageId !== String(latest.id || "").trim() ||
    currentUpdatedAt !== String(conversation.updatedAt || "").trim() ||
    String(existingConversation?.noticeBody || "").trim() !== String(conversation.noticeBody || "").trim()
  ) {
    await updateCollection("conversations", async (items) => {
      return items.map((entry) =>
        String(entry?.id || "").trim() === noticeConversationId
          ? {
              ...entry,
              ...conversation,
            }
          : entry,
      );
    });
  }
  return true;
}

function buildAdminBroadcastStatusRecord(status = {}, uploadsById = new Map()) {
  const rawUpload =
    status.upload && typeof status.upload === "object"
      ? status.upload
      : {
          dataUrl: String(status.imageDataUrl || status.videoDataUrl || "").trim(),
          fileName: String(status.fileName || "broadcast-status").trim() || "broadcast-status",
          mimeType:
            String(status.mimeType || (String(status.type || "").trim() === "video" ? "video/mp4" : "")).trim(),
        };
  const upload = normalizeAdminBroadcastAttachment(rawUpload, uploadsById);
  const type = String(status.type || "").trim().toLowerCase() || (upload?.mimeType ? inferFileTypeFromMime(upload.mimeType) : "text");

  return {
    ...status,
    id: String(status.id || "").trim(),
    ownerUserId: String(status.ownerUserId || status.userId || "__admin_notice__").trim() || "__admin_notice__",
    userId: String(status.userId || status.ownerUserId || "__admin_notice__").trim() || "__admin_notice__",
    type,
    text: String(status.text || "").trim(),
    caption: String(status.caption || status.text || "").trim(),
    background: String(status.background || "#2f80d0").trim() || "#2f80d0",
    textColor: String(status.textColor || "#ffffff").trim() || "#ffffff",
    textAlign: String(status.textAlign || "center").trim() || "center",
    textScale: Number(status.textScale || 1) || 1,
    imageFit: String(status.imageFit || "contain").trim() || "contain",
    imageRotate: Number(status.imageRotate || 0) || 0,
    imageFilter: String(status.imageFilter || "none").trim() || "none",
    allowReplies: status.allowReplies !== false,
    upload,
    imageDataUrl: String(status.imageDataUrl || upload?.dataUrl || "").trim(),
    videoDataUrl: String(status.videoDataUrl || "").trim() || (type === "video" ? String(upload?.dataUrl || "").trim() : ""),
    fileName: String(status.fileName || upload?.fileName || "").trim(),
    visibility: String(status.visibility || "broadcast").trim() || "broadcast",
    viewsCount: Math.max(0, Math.round(Number(status.viewsCount || 0) || 0)),
    likesCount: Math.max(0, Math.round(Number(status.likesCount || 0) || 0)),
    likedByUserIds: normalizeIdList(status.likedByUserIds),
    viewedByUserIds: normalizeIdList(status.viewedByUserIds),
    createdAt: String(status.createdAt || "").trim(),
    updatedAt: String(status.updatedAt || status.createdAt || "").trim(),
  };
}

function buildAdminReportRecord(report = {}, { usersById = new Map(), conversations = [] } = {}) {
  const type = String(report.type || "user").trim().toLowerCase() === "group" ? "group" : "user";
  const targetId = String(report.targetId || report.targetUserId || report.targetConversationId || "").trim();
  const reporter = usersById.get(String(report.reporterUserId || "").trim()) || null;
  const targetUser = type === "user" ? usersById.get(targetId) || null : null;
  const targetConversation = type === "group"
    ? conversations.find((entry) => String(entry?.id || "").trim() === targetId && String(entry?.type || "").trim().toLowerCase() === "group") || null
    : null;

  return {
    ...report,
    id: String(report.id || "").trim(),
    type,
    reporterUserId: String(report.reporterUserId || "").trim(),
    reporterName: String(report.reporterName || reporter?.name || "").trim(),
    reporterUsername: String(report.reporterUsername || reporter?.username || "").trim(),
    targetId,
    targetUserId: type === "user" ? targetId : String(report.targetUserId || "").trim(),
    targetConversationId: type === "group" ? targetId : String(report.targetConversationId || "").trim(),
    targetName: String(report.targetName || targetConversation?.name || targetUser?.name || "").trim(),
    targetUsername: String(report.targetUsername || targetUser?.username || "").trim(),
    reason: String(report.reason || "").trim(),
    status: String(report.status || "open").trim() || "open",
    warningPreset: String(report.warningPreset || "").trim(),
    warningMessage: String(report.warningMessage || "").trim(),
    warningById: String(report.warningById || "").trim(),
    warningByName: String(report.warningByName || "").trim(),
    warningIssuedAt: String(report.warningIssuedAt || "").trim(),
    createdAt: String(report.createdAt || "").trim(),
    updatedAt: String(report.updatedAt || report.createdAt || "").trim(),
  };
}

async function loadAdminCommunityContext() {
  const [users, conversations, messages, reports, deletedGroups, statuses, adminBroadcastMessages, uploads] =
    await Promise.all([
      readCollection("users"),
      readCollection("conversations"),
      readCollection("messages"),
      readCollection("reports"),
      readCollection("deletedGroups"),
      readCollection("statuses"),
      readCollection("adminBroadcastMessages"),
      readCollection("uploads"),
    ]);

  const normalizedUsers = users.map(normalizeExistingUser);
  const usersById = new Map(normalizedUsers.map((user) => [String(user.id || "").trim(), user]));
  const uploadsById = new Map(uploads.map((upload) => [String(upload.id || "").trim(), upload]));
  const messagesByConversation = new Map();
  for (const message of messages) {
    const conversationId = String(message?.conversationId || "").trim();
    if (!conversationId) continue;
    const list = messagesByConversation.get(conversationId) || [];
    list.push(message);
    messagesByConversation.set(conversationId, list);
  }
  for (const list of messagesByConversation.values()) {
    list.sort((left, right) => String(left?.createdAt || "").localeCompare(String(right?.createdAt || "")));
  }

  return {
    users: normalizedUsers,
    usersById,
    conversations: Array.isArray(conversations) ? conversations : [],
    messages: Array.isArray(messages) ? messages : [],
    messagesByConversation,
    reports: Array.isArray(reports) ? reports : [],
    deletedGroups: Array.isArray(deletedGroups) ? deletedGroups : [],
    statuses: Array.isArray(statuses) ? statuses : [],
    adminBroadcastMessages: Array.isArray(adminBroadcastMessages) ? adminBroadcastMessages : [],
    uploadsById,
  };
}

async function buildCommunityConversationMessagesPayload(req, conversationId, { markRead = true } = {}) {
  await syncAdminBroadcastNoticeConversation();
  const { usersById, friendRequests, friendships, blocks, conversations, messages, uploadsById } = await loadCommunityContext();
  const viewerId = getViewerIdFromReq(req);
  const safeConversationId = String(conversationId || "").trim();
  const conversation = conversations.find((entry) => String(entry?.id || "").trim() === safeConversationId);
  if (!conversation) {
    return null;
  }
  const messagesByConversation = new Map();
  for (const message of messages) {
    const key = String(message?.conversationId || "").trim();
    if (!key) continue;
    const list = messagesByConversation.get(key) || [];
    list.push(message);
    messagesByConversation.set(key, list);
  }
  for (const list of messagesByConversation.values()) {
    list.sort((left, right) => String(left?.createdAt || "").localeCompare(String(right?.createdAt || "")));
  }
  const summary = summarizeCommunityConversation(conversation, {
    viewerId,
    usersById,
    uploadsById,
    friendRequests,
    friendships,
    blocks,
    messagesByConversation,
  });
  const rawMessages = messagesByConversation.get(safeConversationId) || [];
  const visibleMessages = rawMessages.filter((message) => {
    const hiddenForUserIds = normalizeIdList(message?.hiddenForUserIds);
    const deletedForUserIds = normalizeIdList(message?.deletedForUserIds);
    if (viewerId && hiddenForUserIds.includes(viewerId)) return false;
    if (viewerId && deletedForUserIds.includes(viewerId)) return false;
    return true;
  }).sort((left, right) => String(left?.createdAt || "").localeCompare(String(right?.createdAt || "")));
  const summarizedMessages = visibleMessages.map((message) => summarizeCommunityMessage(message, uploadsById));
  if (markRead && viewerId) {
    const viewerMemberIds = new Set(getConversationMemberIds(conversation));
    if (viewerMemberIds.has(viewerId)) {
      const now = new Date().toISOString();
      await updateCollection("messages", async (items) => {
        let changed = false;
        const nextItems = items.map((item) => {
          if (String(item?.conversationId || "").trim() !== safeConversationId) return item;
          if (String(item?.senderUserId || "").trim() === viewerId) return item;
          const readAt = String(item?.readAt || "").trim();
          const seenByUserIds = normalizeIdList(item?.seenByUserIds);
          if (readAt && seenByUserIds.includes(viewerId)) return item;
          changed = true;
          return {
            ...item,
            readAt: now,
            seenByUserIds: [...new Set([...seenByUserIds, viewerId])],
            updatedAt: now,
          };
        });
        return changed ? nextItems : items;
      });
    }
  }
  const responseMessages = markRead && viewerId
    ? summarizedMessages.map((message) =>
        String(message.senderUserId || "").trim() === viewerId
          ? message
          : {
              ...message,
              readAt: message.readAt || new Date().toISOString(),
              seenByUserIds: [...new Set([...normalizeIdList(message.seenByUserIds), viewerId])],
            },
      )
    : summarizedMessages;
  if (markRead && viewerId && getConversationMemberIds(conversation).includes(viewerId)) {
    summary.unreadCount = 0;
  }
  return {
    conversation: summary,
    partner: summary.partner,
    messages: responseMessages,
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

function maskContactForMessage(contact) {
  if (!contact) return "your registered contact";
  if (isValidEmail(contact)) {
    const [local, domain] = contact.split("@");
    const visible = local.slice(0, 2);
    return `${visible}${"*".repeat(Math.max(1, local.length - 2))}@${domain}`;
  }
  const digits = normalizePhoneComparable(contact);
  if (!digits) return "your registered contact";
  const tail = digits.slice(-3);
  return `${"*".repeat(Math.max(3, digits.length - 3))}${tail}`;
}

function normalizeRoleValue(value) {
  const role = String(value || "").trim().toLowerCase();
  return USER_ROLE_VALUES.has(role) ? role : null;
}

function normalizeProfessionalTypeValue(value) {
  const clean = normalizeWhitespace(value);
  return PROFESSIONAL_TYPE_VALUES.has(clean) ? clean : null;
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

function padTwoDigits(value) {
  return String(value).padStart(2, "0");
}

function getLocalDateKey(date = new Date()) {
  const current = date instanceof Date ? date : new Date(date);
  return `${current.getFullYear()}-${padTwoDigits(current.getMonth() + 1)}-${padTwoDigits(
    current.getDate(),
  )}`;
}

function getLocalSeasonKey(date = new Date()) {
  const current = date instanceof Date ? date : new Date(date);
  return `${current.getFullYear()}-${padTwoDigits(current.getMonth() + 1)}`;
}

function getDailyQuizSeasonWindow(date = new Date()) {
  const current = date instanceof Date ? date : new Date(date);
  const year = current.getFullYear();
  const monthIndex = current.getMonth();
  const start = new Date(year, monthIndex, 1, 0, 0, 0, 0);
  const end = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

  return {
    key: `${year}-${padTwoDigits(monthIndex + 1)}`,
    start: start.toISOString(),
    end: end.toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    active: true,
    questionsPerDay: 10,
  };
}

function normalizeDailyQuizState(rawDailyQuiz = {}) {
  return {
    seasonKey: String(rawDailyQuiz?.seasonKey || ""),
    gems: Math.max(0, Math.round(Number(rawDailyQuiz?.gems) || 0)),
    streak: Math.max(0, Math.round(Number(rawDailyQuiz?.streak) || 0)),
    lastCompletedDate: rawDailyQuiz?.lastCompletedDate
      ? String(rawDailyQuiz.lastCompletedDate)
      : null,
    totalCompleted: Math.max(0, Math.round(Number(rawDailyQuiz?.totalCompleted) || 0)),
    days:
      rawDailyQuiz?.days && typeof rawDailyQuiz.days === "object"
        ? { ...rawDailyQuiz.days }
        : {},
  };
}

function createEmptySetupPoints() {
  return {
    study: 0,
    exam: 0,
    daily: 0,
    rapid: 0,
    sudden: 0,
    clinical: 0,
    law: 0,
  };
}

function normalizeSetupPoints(rawSetupPoints = {}) {
  const next = createEmptySetupPoints();
  if (!rawSetupPoints || typeof rawSetupPoints !== "object") {
    return next;
  }
  for (const key of Object.keys(next)) {
    next[key] = Math.max(0, Math.round(Number(rawSetupPoints[key]) || 0));
  }
  return next;
}

function mergeSetupPoints(current = {}, incoming = {}) {
  const merged = createEmptySetupPoints();
  const safeCurrent = normalizeSetupPoints(current);
  const safeIncoming = normalizeSetupPoints(incoming);
  for (const key of Object.keys(merged)) {
    merged[key] = Math.max(safeCurrent[key], safeIncoming[key]);
  }
  return merged;
}

function normalizeSyncedSessionMode(mode = "") {
  const raw = String(mode || "").trim();
  const lower = raw.toLowerCase();
  if (!lower) return "Session";
  if (lower.includes("law drill") || lower.includes("pharmacy law quiz")) return "Law Drill";
  if (lower.includes("sudden death")) return "Sudden Death";
  if (lower.includes("clinical judgement") || lower.includes("clinical drill")) {
    return "Clinical Judgement";
  }
  if (lower.includes("rapid fire") || lower.includes("rapid drill")) return "Rapid Fire";
  if (lower.startsWith("daily")) return "Daily";
  if (lower.startsWith("study") || lower.includes("topic quiz")) return "Study";
  if (lower.startsWith("exam")) return "Exam";
  if (lower.startsWith("smart")) return "Smart";
  return raw;
}

function getSetupPointsBucketFromSessionMode(mode = "") {
  const normalized = normalizeSyncedSessionMode(mode).toLowerCase();
  if (normalized.startsWith("daily")) return "daily";
  if (normalized.startsWith("study")) return "study";
  if (normalized.startsWith("smart")) return "exam";
  if (normalized.startsWith("exam")) return "exam";
  if (normalized.includes("rapid fire")) return "rapid";
  if (normalized.includes("sudden death")) return "sudden";
  if (normalized.includes("clinical judgement")) return "clinical";
  if (normalized.includes("law drill")) return "law";
  return "";
}

function dedupeUserSyncedSessions(sessions = [], userId = "") {
  const safeUserId = String(userId || "").trim();
  if (!safeUserId) return [];

  const merged = new Map();
  for (const session of Array.isArray(sessions) ? sessions : []) {
    if (String(session?.actorId || "").trim() !== safeUserId) continue;

    const createdAtRaw = session?.createdAt || session?.timestamp || session?.date || "";
    const createdAt = new Date(String(createdAtRaw || ""));
    const timestamp = Number.isNaN(createdAt.getTime()) ? 0 : createdAt.getTime();
    const normalizedMode = normalizeSyncedSessionMode(session?.mode || "");
    const score = Math.max(0, Math.round(Number(session?.score) || 0));
    const total = Math.max(0, Math.round(Number(session?.total) || 0));
    const percent = Math.max(0, Math.round(Number(session?.percent) || 0));
    const duration = String(session?.duration || "").trim();
    const sessionKey = String(session?.sessionId || "").trim();
    const fingerprint = [normalizedMode, score, total, percent, duration].join("|");
    const timeBucket = Math.floor(timestamp / 10000);
    const key = sessionKey ? `sid:${sessionKey}` : `fp:${fingerprint}|${timeBucket}`;
    const next = {
      ...session,
      mode: normalizedMode,
      score,
      total,
      percent,
      duration,
      timestamp,
    };
    const existing = merged.get(key);
    if (!existing || next.timestamp >= existing.timestamp) {
      merged.set(key, next);
    }
  }

  return [...merged.values()].sort((left, right) => left.timestamp - right.timestamp);
}

function deriveSetupPointsFromSyncedSessions(sessions = [], userId = "") {
  const totals = createEmptySetupPoints();
  for (const session of dedupeUserSyncedSessions(sessions, userId)) {
    const bucket = getSetupPointsBucketFromSessionMode(session?.mode || "");
    const score = Math.max(0, Math.round(Number(session?.score) || 0));
    if (!bucket || score <= 0) continue;
    totals[bucket] += score;
  }
  return totals;
}

function hashDailyQuizSelection(seed, questionId) {
  return crypto.createHash("sha256").update(`${seed}:${questionId}`).digest("hex");
}

function selectDailyQuizQuestionIds(questionBank = [], dateKey, count = 10) {
  const ids = [...new Set(
    questionBank
      .map((question) => Number(question?.id))
      .filter((id) => Number.isInteger(id) && id > 0),
  )];

  const scored = ids.map((id) => ({
    id,
    hash: hashDailyQuizSelection(dateKey, id),
  }));

  scored.sort((left, right) =>
    left.hash.localeCompare(right.hash) || left.id - right.id,
  );

  return scored.slice(0, Math.max(1, count)).map((entry) => entry.id);
}

function getDailyQuizRewardRules() {
  return {
    completion: 5,
    perCorrect: 1,
    perfect: 5,
    streakStep: 0,
    streakCap: 0,
    weekendStreakMultiplier: 1,
  };
}

function buildDailyQuizHistory(dailyQuizState, seasonKey) {
  const days = dailyQuizState?.days && typeof dailyQuizState.days === "object"
    ? dailyQuizState.days
    : {};

  return Object.entries(days)
    .filter(([, entry]) => Boolean(entry?.submittedAt))
    .map(([date, entry]) => ({
      date,
      score: Math.max(0, Math.round(Number(entry?.score) || 0)),
      total: Math.max(0, Math.round(Number(entry?.total) || 0)),
      percent: Math.max(0, Math.round(Number(entry?.percent) || 0)),
      gems: Math.max(0, Math.round(Number(entry?.rewards?.total || 0))),
      submittedAt: String(entry?.submittedAt || ""),
    }))
    .sort((left, right) => String(right.date).localeCompare(String(left.date)))
    .slice(0, 20);
}

function buildDailyQuizSummary(dailyQuizState, currentSeasonKey) {
  const seasonKey = String(currentSeasonKey || getLocalSeasonKey());
  const seasonDayCount = new Date(
    Number(seasonKey.slice(0, 4)),
    Number(seasonKey.slice(5, 7)) || 1,
    0,
  ).getDate();
  const completedDays = Object.entries(dailyQuizState?.days || {}).filter(
    ([date, entry]) => date.startsWith(`${seasonKey}-`) && Boolean(entry?.submittedAt),
  ).length;

  return {
    seasonKey,
    gems: Math.max(0, Math.round(Number(dailyQuizState?.gems) || 0)),
    streak: Math.max(0, Math.round(Number(dailyQuizState?.streak) || 0)),
    lastCompletedDate: dailyQuizState?.lastCompletedDate
      ? String(dailyQuizState.lastCompletedDate)
      : null,
    totalCompleted: Math.max(0, Math.round(Number(dailyQuizState?.totalCompleted) || 0)),
    completedDays,
    totalSeasonDays: seasonDayCount,
    progressPercent: seasonDayCount
      ? Math.round((completedDays / seasonDayCount) * 100)
      : 0,
  };
}

function buildDailyQuizPayloadForUser(
  user,
  { date = new Date(), questionBank = [], result = null } = {},
) {
  const season = getDailyQuizSeasonWindow(date);
  const dateKey = getLocalDateKey(date);
  const normalizedState = normalizeDailyQuizState(user?.dailyQuiz);
  const todayEntry = normalizedState.days[dateKey] && typeof normalizedState.days[dateKey] === "object"
    ? normalizedState.days[dateKey]
    : null;
  const questionIds = Array.isArray(todayEntry?.questionIds) && todayEntry.questionIds.length
    ? todayEntry.questionIds.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0)
    : selectDailyQuizQuestionIds(questionBank, dateKey, season.questionsPerDay);
  const today = {
    date: dateKey,
    completed: Boolean(todayEntry?.submittedAt),
    questionIds,
    score: todayEntry?.submittedAt ? Math.max(0, Math.round(Number(todayEntry?.score) || 0)) : null,
    total: todayEntry?.submittedAt
      ? Math.max(0, Math.round(Number(todayEntry?.total) || questionIds.length))
      : questionIds.length,
    percent: todayEntry?.submittedAt
      ? Math.max(0, Math.round(Number(todayEntry?.percent) || 0))
      : null,
    submittedAt: todayEntry?.submittedAt ? String(todayEntry.submittedAt) : null,
    rewards: todayEntry?.submittedAt && todayEntry?.rewards && typeof todayEntry.rewards === "object"
      ? {
          completion: Math.max(0, Math.round(Number(todayEntry.rewards.completion) || 0)),
          perCorrect: Math.max(0, Math.round(Number(todayEntry.rewards.perCorrect) || 0)),
          perfect: Math.max(0, Math.round(Number(todayEntry.rewards.perfect) || 0)),
          total: Math.max(0, Math.round(Number(todayEntry.rewards.total) || 0)),
        }
      : null,
  };

  return {
    season,
    rewardRules: getDailyQuizRewardRules(),
    today,
    stats: buildDailyQuizSummary(normalizedState, season.key),
    history: buildDailyQuizHistory(normalizedState, season.key),
    result,
  };
}

function calculateDailyQuizRewards(score, total) {
  const rewardRules = getDailyQuizRewardRules();
  const totalQuestions = Math.max(1, Math.round(Number(total) || 0));
  const correctCount = Math.max(0, Math.round(Number(score) || 0));
  const completion = rewardRules.completion;
  const perCorrect = rewardRules.perCorrect * correctCount;
  const perfect = correctCount === totalQuestions ? rewardRules.perfect : 0;
  const totalRewards = Math.max(0, completion + perCorrect + perfect);

  return {
    completion,
    perCorrect,
    perfect,
    total: totalRewards,
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

function getPointScopeLabel(scope = "daily") {
  const normalized = String(scope || "daily").trim().toLowerCase();
  if (normalized === "weekly") return "Weekly";
  if (normalized === "monthly") return "Monthly";
  if (normalized === "yearly") return "Yearly";
  if (normalized === "alltime") return "All Time";
  return "Daily";
}

function getPointScopeBounds(scope = "daily", now = new Date()) {
  const safeNow = new Date(now);
  const startOfDay = new Date(safeNow);
  startOfDay.setHours(0, 0, 0, 0);

  const normalized = String(scope || "daily").trim().toLowerCase();
  if (normalized === "weekly") {
    const start = new Date(startOfDay);
    const dayIndex = start.getDay();
    const offset = (dayIndex + 6) % 7;
    start.setDate(start.getDate() - offset);
    return { start, end: new Date(safeNow) };
  }
  if (normalized === "monthly") {
    const start = new Date(startOfDay);
    start.setDate(1);
    return { start, end: new Date(safeNow) };
  }
  if (normalized === "yearly") {
    const start = new Date(startOfDay);
    start.setMonth(0, 1);
    return { start, end: new Date(safeNow) };
  }
  if (normalized === "alltime") {
    return { start: null, end: null };
  }
  return { start: startOfDay, end: new Date(safeNow) };
}

function aggregatePointEvents(pointEvents = [], scope = "daily", now = new Date()) {
  const { start, end } = getPointScopeBounds(scope, now);
  const totals = new Map();
  for (const event of pointEvents || []) {
    const userId = String(event?.userId || "").trim();
    const delta = Math.max(0, Math.round(Number(event?.delta) || 0));
    if (!userId || delta <= 0) continue;
    const createdAt = new Date(String(event?.createdAt || ""));
    if (Number.isNaN(createdAt.getTime())) continue;
    if (start && createdAt < start) continue;
    if (end && createdAt > end) continue;
    totals.set(userId, (totals.get(userId) || 0) + delta);
  }
  return totals;
}

async function repairStoredUserPointTotals() {
  const [users, pointEvents] = await Promise.all([
    readCollection("users"),
    readCollection("pointEvents"),
  ]);
  const allTimeTotals = aggregatePointEvents(pointEvents, "alltime");
  const now = new Date().toISOString();
  let changed = false;
  const nextUsers = users.map((user) => {
    const userId = String(user?.id || "").trim();
    if (!userId) return user;
    const eventTotal = Math.max(0, Math.round(Number(allTimeTotals.get(userId) || 0)));
    const storedTotal = Math.max(0, Math.round(Number(user?.points) || 0));
    const nextTotal = Math.max(storedTotal, eventTotal);
    if (nextTotal === storedTotal) return user;
    changed = true;
    return {
      ...user,
      points: nextTotal,
      updatedAt: now,
    };
  });
  if (changed) {
    await writeCollection("users", nextUsers);
  }
  return { changed, users: nextUsers, pointEvents };
}

async function repairStoredUserProgress(userId = "") {
  const safeUserId = String(userId || "").trim();
  if (!safeUserId) return null;

  const [users, pointEvents, syncSessions] = await Promise.all([
    readCollection("users"),
    readCollection("pointEvents"),
    readCollection("syncSessions"),
  ]);

  const userIndex = users.findIndex((user) => String(user?.id || "").trim() === safeUserId);
  if (userIndex === -1) return null;

  const currentUser = normalizeExistingUser(users[userIndex]);
  const allTimeTotals = aggregatePointEvents(pointEvents, "alltime");
  const eventTotal = Math.max(0, Math.round(Number(allTimeTotals.get(safeUserId) || 0)));
  const storedTotal = Math.max(0, Math.round(Number(currentUser.points) || 0));
  const nextTotal = Math.max(storedTotal, eventTotal);

  const derivedSetupPoints = deriveSetupPointsFromSyncedSessions(syncSessions, safeUserId);
  const nextSetupPoints = mergeSetupPoints(currentUser.setupPoints, derivedSetupPoints);
  const normalizedLawDrillSession = normalizeLawDrillSession(currentUser.lawDrillSession);
  const nextLawDrillSession = normalizedLawDrillSession || currentUser.lawDrillSession || null;

  const currentSetupPoints = normalizeSetupPoints(currentUser.setupPoints);
  const setupChanged = JSON.stringify(nextSetupPoints) !== JSON.stringify(currentSetupPoints);
  const pointsChanged = nextTotal !== storedTotal;
  const lawChanged =
    JSON.stringify(nextLawDrillSession) !== JSON.stringify(currentUser.lawDrillSession || null);

  if (!pointsChanged && !setupChanged && !lawChanged) {
    return {
      ...currentUser,
      points: nextTotal,
      setupPoints: nextSetupPoints,
      lawDrillSession: nextLawDrillSession,
    };
  }

  users[userIndex] = {
    ...users[userIndex],
    points: nextTotal,
    setupPoints: nextSetupPoints,
    lawDrillSession: nextLawDrillSession,
    updatedAt: new Date().toISOString(),
  };
  await writeCollection("users", users);

  return normalizeExistingUser(users[userIndex]);
}

async function syncUserPointsFromEvents(userId = "") {
  const repaired = await repairStoredUserProgress(userId);
  if (!repaired) return null;
  return repaired;
}

async function buildPointsLeaderboardSnapshot(req, scope = "daily", limit = 20) {
  const { users, pointEvents } = await repairStoredUserPointTotals();
  const viewerId = getViewerIdFromReq(req);
  const safeScope = String(scope || "daily").trim().toLowerCase();
  const safeLimit = Math.max(1, Math.min(100, Math.round(Number(limit) || 20)));
  const now = new Date();
  const periodTotals = safeScope === "alltime"
    ? null
    : aggregatePointEvents(pointEvents, safeScope, now);
  const allTimeTotals = aggregatePointEvents(pointEvents, "alltime", now);

  const rows = users
    .map((user) => {
      const userId = String(user?.id || "").trim();
      const allTimePoints = Math.max(
        0,
        Math.round(
          Math.max(
            Number(user?.points) || 0,
            Number(allTimeTotals.get(userId) || 0),
          ),
        ),
      );
      const periodPoints = safeScope === "alltime"
        ? allTimePoints
        : Math.max(0, Math.round(Number(periodTotals?.get(userId) || 0)));
      return {
        userId,
        username: user.username,
        name: user.name,
        profileImage: user.profileImage,
        points: periodPoints,
        allTimePoints,
      };
    })
    .filter((entry) => Boolean(entry.userId))
    .sort((left, right) => {
      if ((right.points || 0) !== (left.points || 0)) return (right.points || 0) - (left.points || 0);
      if ((right.allTimePoints || 0) !== (left.allTimePoints || 0)) {
        return (right.allTimePoints || 0) - (left.allTimePoints || 0);
      }
      return String(left.name || "").localeCompare(String(right.name || ""));
    })
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

  const leaderboard = rows.slice(0, safeLimit);
  const yourEntry = viewerId ? rows.find((entry) => entry.userId === viewerId) || null : null;
  if (yourEntry && !leaderboard.some((entry) => entry.userId === yourEntry.userId)) {
    leaderboard.push(yourEntry);
  }

  return {
    label: getPointScopeLabel(safeScope),
    totalPlayers: rows.length,
    topThree: rows.slice(0, 3),
    leaderboard,
    yourEntry,
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
app.use(
  helmet(
    process.env.NODE_ENV === "production"
      ? undefined
      : {
          contentSecurityPolicy: {
            useDefaults: true,
            directives: {
              "upgrade-insecure-requests": null,
            },
          },
        },
  ),
);
if (config.enableGzip) {
  app.use(compression());
}
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
  });
  app.get("/", (req, res, next) => {
    if (req.query && req.query.cb) {
      next();
      return;
    }
    const cacheBusted = `/?cb=${Date.now()}`;
    res.redirect(302, cacheBusted);
  });
}
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
    etag: false,
    maxAge: process.env.NODE_ENV === "production" ? "1y" : 0,
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
    const repairedUser = await repairStoredUserProgress(user.id);
    res.status(201).json({
      token,
      user: toCurrentUser(repairedUser || user),
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
    const repairedUser = await repairStoredUserProgress(user.id);
    res.json({
      token,
      user: toCurrentUser(repairedUser || user),
    });
  }),
);

app.get(
  "/api/auth/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    await purgeExpiredDeactivatedUsers();
    const user = await syncUserPointsFromEvents(req.user.sub);

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

    res.json(toCurrentUser(user));
  }),
);

app.post(
  "/api/auth/points",
  requireAuth,
  asyncHandler(async (req, res) => {
    const delta = safeNumber(req.body?.delta);
    if (!Number.isInteger(delta) || delta <= 0) {
      res.status(400).json({ error: "delta must be a positive integer" });
      return;
    }
    if (delta > 100000) {
      res.status(400).json({ error: "delta is too large" });
      return;
    }

    const viewerId = String(req.user.sub || "").trim();
    const now = new Date().toISOString();
    const event = {
      id: crypto.randomUUID(),
      userId: viewerId,
      delta,
      createdAt: now,
    };

    await updateCollection("pointEvents", async (items) => {
      items.push(event);
      return items;
    });

    const updatedUser = await syncUserPointsFromEvents(viewerId);
    if (!updatedUser) {
      res.status(404).json({ error: "user not found" });
      return;
    }

    res.status(201).json({
      ok: true,
      points: Math.max(0, Math.round(Number(updatedUser.points) || 0)),
      user: toCurrentUser(updatedUser),
      event,
    });
  }),
);

app.post(
  "/api/auth/setup-points",
  requireAuth,
  asyncHandler(async (req, res) => {
    const incoming =
      req.body && typeof req.body.setupPoints === "object" && !Array.isArray(req.body.setupPoints)
        ? req.body.setupPoints
        : null;
    if (!incoming) {
      res.status(400).json({ error: "setupPoints object is required" });
      return;
    }

    const viewerId = String(req.user.sub || "").trim();
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const userIndex = users.findIndex((entry) => String(entry?.id || "").trim() === viewerId);
    if (userIndex === -1) {
      res.status(404).json({ error: "user not found" });
      return;
    }

    const currentUser = users[userIndex];
    const nextSetupPoints = mergeSetupPoints(currentUser.setupPoints, incoming);
    const now = new Date().toISOString();
    users[userIndex] = {
      ...currentUser,
      setupPoints: nextSetupPoints,
      updatedAt: now,
    };
    await writeCollection("users", users);
    const repairedUser = await repairStoredUserProgress(viewerId);

    res.status(201).json({
      ok: true,
      setupPoints: nextSetupPoints,
      user: toCurrentUser(repairedUser || users[userIndex]),
    });
  }),
);

app.post(
  "/api/auth/law-drill-session",
  requireAuth,
  asyncHandler(async (req, res) => {
    const incoming =
      req.body && typeof req.body.lawDrillSession === "object" && !Array.isArray(req.body.lawDrillSession)
        ? req.body.lawDrillSession
        : req.body && typeof req.body.session === "object" && !Array.isArray(req.body.session)
          ? req.body.session
          : null;
    if (!incoming) {
      res.status(400).json({ error: "lawDrillSession object is required" });
      return;
    }

    const viewerId = String(req.user.sub || "").trim();
    const users = (await readCollection("users")).map(normalizeExistingUser);
    const userIndex = users.findIndex((entry) => String(entry?.id || "").trim() === viewerId);
    if (userIndex === -1) {
      res.status(404).json({ error: "user not found" });
      return;
    }

    const currentUser = users[userIndex];
    const nextLawDrillSession = mergeLawDrillSessions(currentUser.lawDrillSession, incoming);
    const now = new Date().toISOString();
    users[userIndex] = {
      ...currentUser,
      lawDrillSession: nextLawDrillSession,
      updatedAt: now,
    };
    await writeCollection("users", users);
    const repairedUser = await repairStoredUserProgress(viewerId);

    res.status(201).json({
      ok: true,
      lawDrillSession: nextLawDrillSession,
      user: toCurrentUser(repairedUser || users[userIndex]),
    });
  }),
);

app.post(
  "/api/auth/forgot-password",
  asyncHandler(async (req, res) => {
    await purgeExpiredDeactivatedUsers();
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
      res.json({
        ok: true,
        message:
          "If the account exists, a reset code has been sent to the registered contact.",
      });
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
      `${new Date().toISOString()} password-reset-code userId=${user.id} contact=${user.contact} code=${resetCode} expiresAt=${expiresAt}\n`,
    );

    res.json({
      ok: true,
      message: `Reset code sent to ${maskContactForMessage(user.contact)}.`,
      code: resetCode,
      expiresAt,
    });
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
    res.json({ ok: true, user: toCurrentUser(nextUser) });
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

app.get(
  "/api/daily-quiz/today",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = String(req.user?.sub || "").trim();
    const [users, questions] = await Promise.all([
      readCollection("users"),
      readCollection("questions"),
    ]);
    const user = users.find((entry) => String(entry?.id || "").trim() === userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const payload = buildDailyQuizPayloadForUser(user, {
      date: new Date(),
      questionBank: questions,
    });
    res.json(payload);
  }),
);

app.post(
  "/api/daily-quiz/submit",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = String(req.user?.sub || "").trim();
    const answers =
      req.body && typeof req.body.answers === "object" && !Array.isArray(req.body.answers)
        ? req.body.answers
        : {};
    const now = new Date();
    const dateKey = getLocalDateKey(now);
    const season = getDailyQuizSeasonWindow(now);
    const questions = await readCollection("questions");
    const users = await readCollection("users");
    const userIndex = users.findIndex((entry) => String(entry?.id || "").trim() === userId);

    if (userIndex === -1) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const currentUser = normalizeExistingUser(users[userIndex]);
    const dailyQuizState = normalizeDailyQuizState(currentUser.dailyQuiz);
    const existingEntry = dailyQuizState.days[dateKey] && typeof dailyQuizState.days[dateKey] === "object"
      ? dailyQuizState.days[dateKey]
      : null;

    if (existingEntry?.submittedAt) {
      res.status(409).json({ error: "Today's Daily Quiz has already been submitted." });
      return;
    }

    const questionIds = Array.isArray(existingEntry?.questionIds) && existingEntry.questionIds.length
      ? existingEntry.questionIds.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0)
      : selectDailyQuizQuestionIds(questions, dateKey, season.questionsPerDay);

    if (!questionIds.length) {
      res.status(503).json({ error: "Daily questions are not ready yet." });
      return;
    }

    const questionById = new Map(
      questions.map((question) => [Number(question?.id), question]),
    );

    let score = 0;
    const wrongQuestionIds = [];
    const correctQuestionIds = [];

    for (const questionId of questionIds) {
      const question = questionById.get(Number(questionId));
      const selectedAnswer = String(answers[String(questionId)] || "").trim();
      const correctAnswer = String(question?.correct || "").trim();
      const isCorrect = Boolean(question) && selectedAnswer === correctAnswer;
      if (isCorrect) {
        score += 1;
        correctQuestionIds.push(Number(questionId));
      } else {
        wrongQuestionIds.push(Number(questionId));
      }
    }

    const total = questionIds.length;
    const percent = total ? Math.round((score / total) * 100) : 0;
    const rewards = calculateDailyQuizRewards(score, total);
    const previousCompletedDate = String(dailyQuizState.lastCompletedDate || "");
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = getLocalDateKey(yesterday);
    const streak = previousCompletedDate === yesterdayKey ? dailyQuizState.streak + 1 : 1;
    const totalCompleted = dailyQuizState.totalCompleted + 1;
    const totalGems = dailyQuizState.gems + rewards.total;

    const nextDailyQuizState = {
      ...dailyQuizState,
      seasonKey: season.key,
      gems: totalGems,
      streak,
      lastCompletedDate: dateKey,
      totalCompleted,
      days: {
        ...dailyQuizState.days,
        [dateKey]: {
          questionIds: [...questionIds],
          submittedAt: now.toISOString(),
          score,
          total,
          percent,
          rewards,
        },
      },
    };

    users[userIndex] = {
      ...currentUser,
      dailyQuiz: nextDailyQuizState,
      updatedAt: now.toISOString(),
    };
    await writeCollection("users", users);

    const result = {
      date: dateKey,
      questionIds: [...questionIds],
      score,
      total,
      percent,
      submittedAt: now.toISOString(),
      gemsAwarded: rewards.total,
      gems: totalGems,
      streak,
      rewards,
      wrongQuestionIds,
      correctQuestionIds,
    };

    res.json(
      buildDailyQuizPayloadForUser(users[userIndex], {
        date: now,
        questionBank: questions,
        result,
      }),
    );
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
      sessionId: String(req.body?.sessionId || req.body?.clientSessionId || "").trim(),
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
  "/api/points/leaderboard",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const scope = String(req.query.scope || "daily").trim().toLowerCase();
    const limit = safeNumber(req.query.limit) || 20;
    const snapshot = await buildPointsLeaderboardSnapshot(req, scope, limit);
    res.json(snapshot);
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
      name: u.name,
      username: u.username,
      contact: u.contact,
      email: u.email,
      role: u.role,
      professionalType: u.professionalType,
      country: u.country,
      institution: u.institution,
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

    const userId = String(req.params.userId || "").trim();
    const users = await readCollection("users");
    const target = users.find((u) => String(u?.id || "").trim() === userId);

    if (!target) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const now = new Date().toISOString();
    const normalized = normalizeExistingUser(target);
    const archiveRecord = {
      archiveId: crypto.randomUUID(),
      ...normalized,
      userSnapshot: normalized,
      deletedAt: now,
      deletedByType: "admin",
      deletedByName: "AJIXPHARMACY Admin",
      restoredAt: "",
      restoredByType: "",
      restoredByName: "",
    };

    await writeCollection(
      "users",
      users.filter((entry) => String(entry?.id || "").trim() !== userId),
    );
    await updateCollection("deletedUsers", async (items) => {
      items.push(archiveRecord);
      return items;
    });
    res.json({ ok: true, message: "User moved to archive", archive: archiveRecord });
  }),
);

// Admin: Get archived users
app.get(
  "/api/admin/deleted-users",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const archivedUsers = (await readCollection("deletedUsers"))
      .map((entry) => {
        const user = entry.userSnapshot && typeof entry.userSnapshot === "object" ? entry.userSnapshot : entry;
        return {
          archiveId: String(entry.archiveId || "").trim(),
          id: String(user.id || "").trim(),
          name: String(user.name || "").trim(),
          title: String(user.title || "").trim(),
          firstName: String(user.firstName || "").trim(),
          lastName: String(user.lastName || "").trim(),
          surname: String(user.surname || "").trim(),
          username: String(user.username || "").trim(),
          contact: String(user.contact || "").trim(),
          contactType: String(user.contactType || "").trim(),
          email: String(user.email || "").trim(),
          role: String(user.role || "").trim(),
          professionalType: String(user.professionalType || "").trim(),
          country: String(user.country || "").trim(),
          institution: String(user.institution || "").trim(),
          profileImage: String(user.profileImage || "").trim(),
          createdAt: String(user.createdAt || "").trim(),
          updatedAt: String(user.updatedAt || "").trim(),
          deletedAt: String(entry.deletedAt || "").trim(),
          deletedByType: String(entry.deletedByType || "admin").trim() || "admin",
          deletedByName: String(entry.deletedByName || "AJIXPHARMACY Admin").trim() || "AJIXPHARMACY Admin",
          restoredAt: String(entry.restoredAt || "").trim(),
          restoredByType: String(entry.restoredByType || "").trim(),
          restoredByName: String(entry.restoredByName || "").trim(),
        };
      })
      .sort((left, right) => String(right.deletedAt || "").localeCompare(String(left.deletedAt || "")));

    res.json({ deletedUsers: archivedUsers });
  }),
);

// Admin: Restore archived user
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

    const now = new Date().toISOString();
    let restoredArchive = null;
    await updateCollection("deletedUsers", async (items) => {
      const nextItems = items.map((entry) => {
        if (String(entry?.archiveId || "").trim() !== archiveId) return entry;
        restoredArchive = entry;
        return {
          ...entry,
          restoredAt: String(entry.restoredAt || now).trim() || now,
          restoredByType: "admin",
          restoredByName: "AJIXPHARMACY Admin",
          updatedAt: now,
        };
      });
      return nextItems;
    });

    if (!restoredArchive) {
      res.status(404).json({ error: "Archived user not found" });
      return;
    }

    const snapshot = restoredArchive.userSnapshot && typeof restoredArchive.userSnapshot === "object"
      ? normalizeExistingUser(restoredArchive.userSnapshot)
      : normalizeExistingUser(restoredArchive);
    await updateCollection("users", async (items) => {
      const exists = items.some((entry) => String(entry?.id || "").trim() === String(snapshot.id || "").trim());
      if (exists) return items;
      items.push(snapshot);
      return items;
    });

    res.json({
      ok: true,
      deletedUser: {
        archiveId,
        restoredAt: now,
      },
      user: snapshot,
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

    const questions = (await readCollection("questions")).map(
      normalizeQuestionForApi,
    );
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

// Admin: Get archived groups
app.get(
  "/api/admin/deleted-groups",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const { deletedGroups } = await loadAdminCommunityContext();
    const archivedGroups = deletedGroups
      .map((entry) => ({
        archiveId: String(entry.archiveId || "").trim(),
        groupId: String(entry.groupId || entry.conversationSnapshot?.id || "").trim(),
        name: String(entry.name || entry.conversationSnapshot?.name || "").trim(),
        bio: String(entry.bio || entry.conversationSnapshot?.bio || "").trim(),
        ownerUserId: String(entry.ownerUserId || entry.conversationSnapshot?.ownerUserId || "").trim(),
        ownerName: String(entry.ownerName || "").trim(),
        ownerUsername: String(entry.ownerUsername || "").trim(),
        memberCount: Math.max(0, Math.round(Number(entry.memberCount || entry.conversationSnapshot?.memberIds?.length || 0) || 0)),
        adminCount: Math.max(0, Math.round(Number(entry.adminCount || entry.conversationSnapshot?.adminIds?.length || 0) || 0)),
        avatarUrl: String(entry.avatarUrl || "").trim(),
        createdAt: String(entry.createdAt || entry.conversationSnapshot?.createdAt || "").trim(),
        updatedAt: String(entry.updatedAt || entry.conversationSnapshot?.updatedAt || entry.createdAt || "").trim(),
        deletedAt: String(entry.deletedAt || "").trim(),
        deletedByType: String(entry.deletedByType || "admin").trim() || "admin",
        deletedByName: String(entry.deletedByName || "AJIXPHARMACY Admin").trim() || "AJIXPHARMACY Admin",
        restoredAt: String(entry.restoredAt || "").trim(),
        restoredByType: String(entry.restoredByType || "").trim(),
        restoredByName: String(entry.restoredByName || "").trim(),
      }))
      .sort((left, right) => String(right.deletedAt || "").localeCompare(String(left.deletedAt || "")));

    res.json({ deletedGroups: archivedGroups });
  }),
);

// Admin: Restore archived group
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

    const now = new Date().toISOString();
    let restoredArchive = null;
    await updateCollection("deletedGroups", async (items) => {
      const nextItems = items.map((entry) => {
        if (String(entry?.archiveId || "").trim() !== archiveId) return entry;
        restoredArchive = entry;
        return {
          ...entry,
          restoredAt: String(entry.restoredAt || now).trim() || now,
          restoredByType: "admin",
          restoredByName: "AJIXPHARMACY Admin",
          updatedAt: now,
        };
      });
      return nextItems;
    });

    if (!restoredArchive) {
      res.status(404).json({ error: "Archived group not found" });
      return;
    }

    const snapshot = restoredArchive.conversationSnapshot && typeof restoredArchive.conversationSnapshot === "object"
      ? restoredArchive.conversationSnapshot
      : {
          id: String(restoredArchive.groupId || restoredArchive.id || "").trim(),
          type: "group",
          memberIds: normalizeIdList(restoredArchive.memberIds || []),
          ownerUserId: String(restoredArchive.ownerUserId || "").trim(),
          adminIds: normalizeIdList(restoredArchive.adminIds || []),
          mutedMemberIds: [],
          name: String(restoredArchive.name || "Study Group").trim() || "Study Group",
          bio: String(restoredArchive.bio || "").trim(),
          permissions: {
            membersCanEditSettings: false,
            membersCanSendMessages: true,
            membersCanAddMembers: true,
            membersCanInviteByLink: true,
            adminsMustApproveNewMembers: false,
          },
          avatarUploadId: "",
          inviteToken: "",
          isFavorite: false,
          hiddenForUserIds: [],
          deletedForUserIds: [],
          inviteTokenCreatedAt: String(restoredArchive.createdAt || now).trim(),
          createdAt: String(restoredArchive.createdAt || now).trim(),
          updatedAt: String(restoredArchive.updatedAt || now).trim(),
          lastMessageId: "",
          lastMessageAt: "",
        };

    await updateCollection("conversations", async (items) => {
      const groupId = String(snapshot.id || restoredArchive.groupId || restoredArchive.archiveId || "").trim();
      const exists = items.some((entry) => String(entry?.id || "").trim() === groupId);
      if (exists) return items;
      items.push({
        ...snapshot,
        id: groupId,
        type: "group",
        memberIds: normalizeIdList(snapshot.memberIds || restoredArchive.memberIds || []),
        adminIds: normalizeIdList(snapshot.adminIds || restoredArchive.adminIds || []),
      });
      return items;
    });

    const payload = await loadAdminCommunityContext();
    const restoredGroup = payload.conversations.find((entry) => String(entry?.id || "").trim() === String(snapshot.id || restoredArchive.groupId || "").trim());
    res.json({
      ok: true,
      deletedGroup: {
        archiveId,
        restoredAt: now,
      },
      group: restoredGroup || null,
    });
  }),
);

// Admin: Get groups
app.get(
  "/api/admin/groups",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const { usersById, conversations, messagesByConversation, uploadsById } = await loadAdminCommunityContext();
    const groups = conversations
      .filter((conversation) => String(conversation?.type || "").trim().toLowerCase() === "group")
      .map((conversation) => buildAdminGroupRecord(conversation, { usersById, uploadsById, messagesByConversation }))
      .filter(Boolean)
      .sort((left, right) => String(right.createdAt || "").localeCompare(String(left.createdAt || "")));

    res.json({ groups });
  }),
);

// Admin: Get group details
app.get(
  "/api/admin/groups/:groupId",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const groupId = String(req.params.groupId || "").trim();
    const { usersById, conversations, messagesByConversation, uploadsById } = await loadAdminCommunityContext();
    const conversation = conversations.find(
      (entry) => String(entry?.id || "").trim() === groupId && String(entry?.type || "").trim().toLowerCase() === "group",
    );
    if (!conversation) {
      res.status(404).json({ error: "Group not found" });
      return;
    }

    const group = buildAdminGroupRecord(conversation, { usersById, uploadsById, messagesByConversation });
    if (!group) {
      res.status(404).json({ error: "Group not found" });
      return;
    }

    res.json({ group });
  }),
);

// Admin: Archive group
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

    const { usersById, conversations, messagesByConversation, uploadsById } = await loadAdminCommunityContext();
    const conversation = conversations.find(
      (entry) => String(entry?.id || "").trim() === groupId && String(entry?.type || "").trim().toLowerCase() === "group",
    );
    if (!conversation) {
      res.status(404).json({ error: "Group not found" });
      return;
    }

    const group = buildAdminGroupRecord(conversation, { usersById, uploadsById, messagesByConversation });
    const now = new Date().toISOString();
    const archiveRecord = {
      archiveId: crypto.randomUUID(),
      groupId,
      ...group,
      deletedAt: now,
      deletedByType: "admin",
      deletedByName: "AJIXPHARMACY Admin",
      restoredAt: "",
      restoredByType: "",
      restoredByName: "",
      conversationSnapshot: {
        ...conversation,
      },
    };

    await updateCollection("conversations", async (items) => {
      return items.filter((entry) => String(entry?.id || "").trim() !== groupId);
    });
    await updateCollection("deletedGroups", async (items) => {
      items.push(archiveRecord);
      return items;
    });

    res.json({ ok: true, group: archiveRecord });
  }),
);

// Admin: Send a message to a group
app.post(
  "/api/admin/groups/:groupId/message",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const groupId = String(req.params.groupId || "").trim();
    const text = String(req.body?.message || req.body?.text || "").trim();
    const attachmentDataUrl = String(req.body?.attachmentDataUrl || "").trim();
    const attachmentFileName = String(req.body?.attachmentFileName || "attachment").trim() || "attachment";
    const attachmentMimeType = parseDataUrlMimeType(attachmentDataUrl) || String(req.body?.attachmentMimeType || "").trim() || "application/octet-stream";
    if (!groupId) {
      res.status(400).json({ error: "groupId is required" });
      return;
    }
    if (!text && !attachmentDataUrl) {
      res.status(400).json({ error: "message or attachment is required" });
      return;
    }

    const { usersById, conversations } = await loadAdminCommunityContext();
    const conversation = conversations.find(
      (entry) => String(entry?.id || "").trim() === groupId && String(entry?.type || "").trim().toLowerCase() === "group",
    );
    if (!conversation) {
      res.status(404).json({ error: "Group not found" });
      return;
    }

    const now = new Date().toISOString();
    const message = {
      id: crypto.randomUUID(),
      conversationId: groupId,
      senderUserId: "__admin_notice__",
      senderName: "AJIXPHARMACY Admin",
      type: attachmentDataUrl ? inferFileTypeFromMime(attachmentMimeType) : "text",
      text,
      attachment: attachmentDataUrl
        ? {
            dataUrl: attachmentDataUrl,
            fileName: attachmentFileName,
            mimeType: attachmentMimeType,
          }
        : null,
      call: null,
      replyTo: null,
      deliveredAt: now,
      readAt: now,
      seenByUserIds: [],
      editedAt: null,
      deletedAt: null,
      deletedForUserIds: [],
      hiddenForUserIds: [],
      noticeThreadKey: "",
      noticeBatchId: "",
      createdAt: now,
      updatedAt: now,
    };

    await updateCollection("messages", async (items) => {
      items.push(message);
      return items;
    });
    await updateCollection("conversations", async (items) => {
      return items.map((entry) =>
        String(entry?.id || "").trim() === groupId
          ? {
              ...entry,
              lastMessageId: message.id,
              lastMessageAt: now,
              updatedAt: now,
            }
          : entry,
      );
    });

    res.json({
      ok: true,
      deliveredTo: normalizeIdList(conversation.memberIds).length,
      message: {
        ...message,
        senderName: String(usersById.get("__admin_notice__")?.name || "AJIXPHARMACY Admin").trim() || "AJIXPHARMACY Admin",
      },
    });
  }),
);

// Admin: Get reports
app.get(
  "/api/admin/reports",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const { usersById, conversations, reports } = await loadAdminCommunityContext();
    const normalizedReports = reports
      .map((report) => buildAdminReportRecord(report, { usersById, conversations }))
      .sort((left, right) => String(right.createdAt || "").localeCompare(String(left.createdAt || "")));

    res.json({ reports: normalizedReports });
  }),
);

// Admin: Get report details
app.get(
  "/api/admin/reports/:reportId",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const reportId = String(req.params.reportId || "").trim();
    const { usersById, conversations, reports } = await loadAdminCommunityContext();
    const report = reports.find((entry) => String(entry?.id || "").trim() === reportId);
    if (!report) {
      res.status(404).json({ error: "Report not found" });
      return;
    }

    res.json({ report: buildAdminReportRecord(report, { usersById, conversations }) });
  }),
);

// Admin: Warn report target
app.post(
  "/api/admin/reports/:reportId/warn",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const reportId = String(req.params.reportId || "").trim();
    const preset = String(req.body?.preset || "").trim() || "Community rules reminder";
    const message = String(req.body?.message || "").trim();
    if (!message) {
      res.status(400).json({ error: "warning message is required" });
      return;
    }

    let updatedReport = null;
    const now = new Date().toISOString();
    await updateCollection("reports", async (items) => {
      const nextItems = items.map((entry) => {
        if (String(entry?.id || "").trim() !== reportId) return entry;
        updatedReport = {
          ...entry,
          status: "warned",
          warningPreset: preset,
          warningMessage: message,
          warningById: "admin",
          warningByName: "AJIXPHARMACY Admin",
          warningIssuedAt: now,
          updatedAt: now,
        };
        return updatedReport;
      });
      return nextItems;
    });

    if (!updatedReport) {
      res.status(404).json({ error: "Report not found" });
      return;
    }

    const { usersById, conversations } = await loadAdminCommunityContext();
    res.json({ ok: true, report: buildAdminReportRecord(updatedReport, { usersById, conversations }) });
  }),
);

// Admin: Broadcast overview
app.get(
  "/api/admin/broadcast/overview",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const { users, statuses, adminBroadcastMessages, uploadsById } = await loadAdminCommunityContext();
    const broadcastMessages = adminBroadcastMessages.filter(
      (message) => String(message?.noticeThreadKey || "broadcast").trim() === "broadcast",
    );
    const thread = buildAdminBroadcastThreadSummary(broadcastMessages, users.length, uploadsById);
    const adminStatuses = statuses
      .filter((status) =>
        String(status?.ownerUserId || status?.userId || "").trim() === "__admin_notice__" ||
        String(status?.visibility || "").trim().toLowerCase() === "broadcast",
      )
      .map((status) => buildAdminBroadcastStatusRecord(status, uploadsById))
      .sort((left, right) => String(right.createdAt || "").localeCompare(String(left.createdAt || "")));

    res.json({
      threads: [thread],
      statuses: adminStatuses,
    });
  }),
);

// Admin: Broadcast thread detail
app.get(
  "/api/admin/broadcast/threads/:threadKey",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const threadKey = String(req.params.threadKey || "").trim();
    if (threadKey !== "broadcast") {
      res.status(404).json({ error: "Thread not found" });
      return;
    }

    const { users, adminBroadcastMessages, uploadsById } = await loadAdminCommunityContext();
    const batches = adminBroadcastMessages
      .filter((message) => String(message?.noticeThreadKey || "broadcast").trim() === threadKey)
      .map((message) => normalizeAdminBroadcastMessage(message, uploadsById))
      .sort((left, right) => String(left.createdAt || "").localeCompare(String(right.createdAt || "")));
    const thread = buildAdminBroadcastThreadSummary(batches, users.length, uploadsById);

    res.json({
      thread,
      batches: thread.batches,
    });
  }),
);

// Admin: Send broadcast message
app.post(
  "/api/admin/broadcast/threads/:threadKey/message",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const threadKey = String(req.params.threadKey || "").trim();
    if (threadKey !== "broadcast") {
      res.status(404).json({ error: "Thread not found" });
      return;
    }

    const messageText = String(req.body?.message || "").trim();
    const attachmentDataUrl = String(req.body?.attachmentDataUrl || "").trim();
    const attachmentFileName = String(req.body?.attachmentFileName || "attachment").trim() || "attachment";
    const attachmentMimeType = parseDataUrlMimeType(attachmentDataUrl) || String(req.body?.attachmentMimeType || "").trim() || "application/octet-stream";
    if (!messageText && !attachmentDataUrl) {
      res.status(400).json({ error: "message or attachment is required" });
      return;
    }

    const now = new Date().toISOString();
    const batchId = crypto.randomUUID();
    const message = {
      id: crypto.randomUUID(),
      conversationId: "__admin_broadcast__",
      senderUserId: "__admin_notice__",
      senderName: "AJIXPHARMACY Admin",
      type: attachmentDataUrl ? inferFileTypeFromMime(attachmentMimeType) : "text",
      text: messageText,
      attachment: attachmentDataUrl
        ? {
            dataUrl: attachmentDataUrl,
            fileName: attachmentFileName,
            mimeType: attachmentMimeType,
          }
        : null,
      call: null,
      replyTo: null,
      deliveredAt: null,
      readAt: null,
      seenByUserIds: [],
      editedAt: null,
      deletedAt: null,
      deletedForUserIds: [],
      hiddenForUserIds: [],
      noticeThreadKey: threadKey,
      noticeBatchId: batchId,
      createdAt: now,
      updatedAt: now,
    };

    await updateCollection("adminBroadcastMessages", async (items) => {
      items.push(message);
      return items;
    });

    await syncAdminBroadcastNoticeConversation(message);

    const { users } = await loadAdminCommunityContext();
    res.status(201).json({
      ok: true,
      deliveredTo: users.length,
      batchId,
      message: normalizeAdminBroadcastMessage(message),
    });
  }),
);

// Admin: Publish broadcast status
app.post(
  "/api/admin/broadcast/status",
  asyncHandler(async (req, res) => {
    if (!config.adminKey || req.headers["x-admin-key"] !== config.adminKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const text = String(req.body?.text || "").trim();
    const caption = String(req.body?.caption || "").trim();
    const background = String(req.body?.background || "#2f80d0").trim() || "#2f80d0";
    const attachmentDataUrl = String(req.body?.attachmentDataUrl || "").trim();
    const attachmentFileName = String(req.body?.attachmentFileName || "broadcast-status").trim() || "broadcast-status";
    const attachmentMimeType = parseDataUrlMimeType(attachmentDataUrl) || String(req.body?.attachmentMimeType || "").trim() || "application/octet-stream";
    if (!text && !caption && !attachmentDataUrl) {
      res.status(400).json({ error: "status text or attachment is required" });
      return;
    }

    const now = new Date().toISOString();
    const statusType = attachmentDataUrl ? inferFileTypeFromMime(attachmentMimeType) : "text";
    const status = {
      id: crypto.randomUUID(),
      ownerUserId: "__admin_notice__",
      userId: "__admin_notice__",
      type: statusType,
      text: attachmentDataUrl ? "" : text,
      caption: attachmentDataUrl ? (caption || text) : (caption || text),
      background,
      textColor: "#ffffff",
      textAlign: "center",
      textScale: 1,
      imageFit: "contain",
      imageRotate: 0,
      imageFilter: "none",
      allowReplies: false,
      imageDataUrl: statusType === "image" ? attachmentDataUrl : "",
      videoDataUrl: statusType === "video" ? attachmentDataUrl : "",
      fileName: attachmentFileName,
      upload: attachmentDataUrl
        ? {
            dataUrl: attachmentDataUrl,
            fileName: attachmentFileName,
            mimeType: attachmentMimeType,
          }
        : null,
      visibility: "broadcast",
      viewsCount: 0,
      likesCount: 0,
      likedByUserIds: [],
      viewedByUserIds: [],
      createdAt: now,
      updatedAt: now,
    };

    await updateCollection("statuses", async (items) => {
      items.push(status);
      return items;
    });

    res.status(201).json({
      ok: true,
      status: buildAdminBroadcastStatusRecord(status),
      upload: status.upload,
    });
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
    const conversations = await readCollection("conversations");
    const reports = await readCollection("reports");

    const categories = [...MAJOR_CATEGORIES];
    const totalGroups = conversations.filter(
      (conversation) => String(conversation?.type || "").trim().toLowerCase() === "group",
    ).length;

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
      totalGroups,
      totalReports: reports.length,
      totalQuestions: questions.length,
      totalCategories: MAJOR_CATEGORIES.length,
      categories,
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

app.get("/api/push/config", (_req, res) => {
  res.json(COMMUNITY_DEFAULT_PUSH_CONFIG);
});

app.get("/api/community/realtime/config", (_req, res) => {
  res.json(COMMUNITY_DEFAULT_REALTIME_CONFIG);
});

app.post(
  "/api/community/presence",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const viewerId = getViewerIdFromReq(req);
    if (!viewerId) {
      res.json({ ok: true, tracked: false });
      return;
    }
    await updateCollection("users", async (users) => {
      const now = new Date().toISOString();
      return users.map((user) =>
        String(user?.id || "").trim() === viewerId
          ? {
              ...user,
              lastSeenAt: now,
              updatedAt: now,
            }
          : user,
      );
    });
    res.json({ ok: true, tracked: true });
  }),
);

app.get(
  "/api/community/overview",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const payload = await buildCommunityOverviewPayload(req);
    res.json(payload);
  }),
);

app.get(
  "/api/community/search",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { usersById, users, friendRequests, friendships, blocks } = await loadCommunityContext();
    const viewerId = getViewerIdFromReq(req);
    const query = normalizeWhitespace(req.query.q || req.query.query || "").toLowerCase();
    const limit = parseSafeLimit(req.query.limit, 20, 100);
    const friendIds = collectFriendIds(viewerId, friendRequests, friendships);
    const blockedIds = new Set(
      blocks
        .filter((block) => String(block?.blockerUserId || "").trim() === viewerId)
        .map((block) => String(block?.blockedUserId || "").trim())
        .filter(Boolean),
    );
    const blockedByUserIds = new Set(
      blocks
        .filter((block) => String(block?.blockedUserId || "").trim() === viewerId)
        .map((block) => String(block?.blockerUserId || "").trim())
        .filter(Boolean),
    );
    const results = users
      .filter((user) => {
        const userId = String(user.id || "").trim();
        if (!userId || userId === viewerId) return false;
        if (blockedIds.has(userId) || blockedByUserIds.has(userId)) return false;
        if (!query) return true;
        const haystack = [
          user.name,
          user.username,
          user.contact,
          user.email,
          user.institution,
          user.country,
          user.professionalType,
          user.title,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(query);
      })
      .map((user) => ({
        ...toPublicUser(user),
        relationship: friendIds.has(String(user.id || "").trim()) ? "friend" : "none",
      }))
      .slice(0, limit);

    res.json({ users: results });
  }),
);

app.get(
  "/api/community/profile/:userId",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const payload = await buildCommunityProfilePayload(req, req.params.userId);
    if (!payload) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(payload);
  }),
);

app.get(
  "/api/community/friends",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const payload = await buildCommunityOverviewPayload(req);
    res.json({ friends: payload.friends });
  }),
);

app.get(
  "/api/community/requests",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const payload = await buildCommunityOverviewPayload(req);
    res.json({
      incoming: payload.incoming,
      sent: payload.sent,
      requests: payload.incoming,
    });
  }),
);

app.post(
  "/api/community/requests",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const viewerId = getViewerIdFromReq(req);
    const toUserId = String(req.body?.toUserId || "").trim();
    if (!viewerId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!toUserId || toUserId === viewerId) {
      res.status(400).json({ error: "toUserId is required" });
      return;
    }

    const { usersById, friendRequests, friendships, blocks } = await loadCommunityContext();
    const targetUser = usersById.get(toUserId);
    if (!targetUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const relationship = buildCommunityRelationship(viewerId, toUserId, { friendRequests, friendships, blocks });
    if (relationship.isFriend) {
      res.status(409).json({ error: "Already connected" });
      return;
    }
    if (relationship.blocked || relationship.blockedByUser) {
      res.status(409).json({ error: "Connection unavailable" });
      return;
    }
    const existingRequest = friendRequests.find(
      (request) =>
        String(request?.status || "").trim().toLowerCase() === "pending" &&
        String(request?.fromUserId || "").trim() === viewerId &&
        String(request?.toUserId || "").trim() === toUserId,
    );
    if (existingRequest) {
      res.status(409).json({ requestId: existingRequest.id, error: "Request already sent" });
      return;
    }

    const request = {
      id: crypto.randomUUID(),
      fromUserId: viewerId,
      toUserId,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await updateCollection("friendRequests", async (items) => {
      items.push(request);
      return items;
    });
    res.status(201).json({
      request: {
        id: request.id,
        user: {
          ...toPublicUser(targetUser),
          relationship: "sent",
        },
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
      },
    });
  }),
);

app.post(
  "/api/community/requests/:requestId/respond",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const viewerId = getViewerIdFromReq(req);
    const requestId = String(req.params.requestId || "").trim();
    const action = String(req.body?.action || "").trim().toLowerCase();
    if (!viewerId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!["accept", "reject", "decline"].includes(action)) {
      res.status(400).json({ error: "Unsupported action" });
      return;
    }
    let targetRequest = null;
    await updateCollection("friendRequests", async (items) => {
      const request = items.find((entry) => String(entry?.id || "").trim() === requestId);
      if (!request) {
        return items;
      }
      if (String(request.toUserId || "").trim() !== viewerId && String(request.fromUserId || "").trim() !== viewerId) {
        targetRequest = "forbidden";
        return items;
      }
      if (String(request.status || "").trim().toLowerCase() !== "pending") {
        targetRequest = "inactive";
        return items;
      }
      request.status = action === "accept" ? "accepted" : "rejected";
      request.updatedAt = new Date().toISOString();
      targetRequest = request;
      return items;
    });

    if (targetRequest === "forbidden") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (targetRequest === "inactive") {
      res.status(409).json({ error: "Request already handled" });
      return;
    }
    if (!targetRequest) {
      res.status(404).json({ error: "Request not found" });
      return;
    }

    if (action === "accept") {
      const friendA = String(targetRequest.fromUserId || "").trim();
      const friendB = String(targetRequest.toUserId || "").trim();
      await updateCollection("friendships", async (items) => {
        const exists = items.some(
          (entry) =>
            (String(entry?.userA || "").trim() === friendA && String(entry?.userB || "").trim() === friendB) ||
            (String(entry?.userA || "").trim() === friendB && String(entry?.userB || "").trim() === friendA),
        );
        if (!exists) {
          items.push({
            id: crypto.randomUUID(),
            userA: friendA,
            userB: friendB,
            createdAt: new Date().toISOString(),
          });
        }
        return items;
      });
    }

    res.json({
      ok: true,
      requestId,
      status: action === "accept" ? "accepted" : "rejected",
    });
  }),
);

app.delete(
  "/api/community/requests/:requestId",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const viewerId = getViewerIdFromReq(req);
    const requestId = String(req.params.requestId || "").trim();
    if (!viewerId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    let deleted = false;
    await updateCollection("friendRequests", async (items) => {
      const nextItems = items.filter((entry) => {
        if (String(entry?.id || "").trim() !== requestId) return true;
        const canCancel =
          String(entry?.fromUserId || "").trim() === viewerId &&
          String(entry?.status || "").trim().toLowerCase() === "pending";
        if (!canCancel) return true;
        deleted = true;
        return false;
      });
      return nextItems;
    });
    if (!deleted) {
      res.status(404).json({ error: "Request not found" });
      return;
    }
    res.json({ ok: true, removed: true });
  }),
);

app.get(
  "/api/community/blocks",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const payload = await buildCommunityOverviewPayload(req);
    res.json({ blocked: payload.blocked });
  }),
);

app.post(
  "/api/community/block/:userId",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const viewerId = getViewerIdFromReq(req);
    const blockedUserId = String(req.params.userId || "").trim();
    if (!viewerId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!blockedUserId || blockedUserId === viewerId) {
      res.status(400).json({ error: "Invalid user" });
      return;
    }
    const { usersById } = await loadCommunityContext();
    if (!usersById.get(blockedUserId)) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    await updateCollection("blocks", async (items) => {
      const exists = items.some(
        (entry) =>
          String(entry?.blockerUserId || "").trim() === viewerId &&
          String(entry?.blockedUserId || "").trim() === blockedUserId,
      );
      if (!exists) {
        items.push({
          id: crypto.randomUUID(),
          blockerUserId: viewerId,
          blockedUserId,
          createdAt: new Date().toISOString(),
        });
      }
      return items;
    });
    res.json({ ok: true, blocked: true });
  }),
);

app.delete(
  "/api/community/block/:userId",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const viewerId = getViewerIdFromReq(req);
    const blockedUserId = String(req.params.userId || "").trim();
    if (!viewerId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    let removed = false;
    await updateCollection("blocks", async (items) => {
      const nextItems = items.filter((entry) => {
        const match =
          String(entry?.blockerUserId || "").trim() === viewerId &&
          String(entry?.blockedUserId || "").trim() === blockedUserId;
        if (match) {
          removed = true;
          return false;
        }
        return true;
      });
      return nextItems;
    });
    if (!removed) {
      res.status(404).json({ error: "Block not found" });
      return;
    }
    res.json({ ok: true, blocked: false });
  }),
);

app.delete(
  "/api/community/friends/:userId",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const viewerId = getViewerIdFromReq(req);
    const targetUserId = String(req.params.userId || "").trim();
    if (!viewerId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!targetUserId || targetUserId === viewerId) {
      res.status(400).json({ error: "Invalid user" });
      return;
    }
    const { usersById } = await loadCommunityContext();
    if (!usersById.get(targetUserId)) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const userPairMatches = (entry = {}) => {
      const fromUserId = String(entry?.fromUserId || "").trim();
      const toUserId = String(entry?.toUserId || "").trim();
      const pairMatches =
        (fromUserId === viewerId && toUserId === targetUserId) ||
        (fromUserId === targetUserId && toUserId === viewerId);
      return pairMatches;
    };
    await updateCollection("friendRequests", async (items) => items.filter((entry) => !userPairMatches(entry)));
    await updateCollection("friendships", async (items) => items.filter((entry) => {
      const userA = String(entry?.userA || "").trim();
      const userB = String(entry?.userB || "").trim();
      const pairMatches =
        (userA === viewerId && userB === targetUserId) ||
        (userA === targetUserId && userB === viewerId);
      return !pairMatches;
    }));
    res.json({ ok: true, unfriended: true });
  }),
);

app.post(
  "/api/community/conversations/:conversationId/favorite",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const viewerId = getViewerIdFromReq(req);
    const conversationId = String(req.params.conversationId || "").trim();
    if (!viewerId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!conversationId) {
      res.status(400).json({ error: "Conversation not found" });
      return;
    }
    let updatedConversation = null;
    await updateCollection("conversations", async (items) => items.map((conversation) => {
      if (String(conversation?.id || "").trim() !== conversationId) return conversation;
      if (getConversationMemberIds(conversation).length && !getConversationMemberIds(conversation).includes(viewerId)) {
        return conversation;
      }
      updatedConversation = {
        ...conversation,
        isFavorite: true,
        updatedAt: new Date().toISOString(),
      };
      return updatedConversation;
    }));
    if (!updatedConversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    res.json({ ok: true, conversationId, isFavorite: true });
  }),
);

app.delete(
  "/api/community/conversations/:conversationId/favorite",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const viewerId = getViewerIdFromReq(req);
    const conversationId = String(req.params.conversationId || "").trim();
    if (!viewerId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!conversationId) {
      res.status(400).json({ error: "Conversation not found" });
      return;
    }
    let updatedConversation = null;
    await updateCollection("conversations", async (items) => items.map((conversation) => {
      if (String(conversation?.id || "").trim() !== conversationId) return conversation;
      if (getConversationMemberIds(conversation).length && !getConversationMemberIds(conversation).includes(viewerId)) {
        return conversation;
      }
      updatedConversation = {
        ...conversation,
        isFavorite: false,
        updatedAt: new Date().toISOString(),
      };
      return updatedConversation;
    }));
    if (!updatedConversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    res.json({ ok: true, conversationId, isFavorite: false });
  }),
);

app.delete(
  "/api/community/conversations/:conversationId",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const viewerId = getViewerIdFromReq(req);
    const conversationId = String(req.params.conversationId || "").trim();
    if (!viewerId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!conversationId) {
      res.status(400).json({ error: "Conversation not found" });
      return;
    }
    let updatedConversation = null;
    await updateCollection("conversations", async (items) => items.map((conversation) => {
      if (String(conversation?.id || "").trim() !== conversationId) return conversation;
      if (getConversationMemberIds(conversation).length && !getConversationMemberIds(conversation).includes(viewerId)) {
        return conversation;
      }
      updatedConversation = addConversationViewerHiddenId(conversation, viewerId);
      return updatedConversation;
    }));
    if (!updatedConversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    res.json({ ok: true, conversationId, hidden: true });
  }),
);

app.delete(
  "/api/community/groups/:groupId",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const viewerId = getViewerIdFromReq(req);
    const groupId = String(req.params.groupId || "").trim();
    if (!viewerId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!groupId) {
      res.status(400).json({ error: "Group not found" });
      return;
    }
    let updatedConversation = null;
    await updateCollection("conversations", async (items) => items.map((conversation) => {
      if (String(conversation?.id || "").trim() !== groupId) return conversation;
      const type = String(conversation?.type || "").trim().toLowerCase();
      if (type !== "group" && type !== "groupchat" && type !== "community-group") {
        return conversation;
      }
      if (getConversationMemberIds(conversation).length && !getConversationMemberIds(conversation).includes(viewerId)) {
        return conversation;
      }
      updatedConversation = addConversationViewerHiddenId(conversation, viewerId);
      return updatedConversation;
    }));
    if (!updatedConversation) {
      res.status(404).json({ error: "Group not found" });
      return;
    }
    res.json({ ok: true, groupId, hidden: true });
  }),
);

app.post(
  "/api/community/groups/:groupId/leave",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const viewerId = getViewerIdFromReq(req);
    const groupId = String(req.params.groupId || "").trim();
    if (!viewerId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!groupId) {
      res.status(400).json({ error: "Group not found" });
      return;
    }
    const { conversations } = await loadCommunityContext();
    const existing = conversations.find((entry) => String(entry?.id || "").trim() === groupId);
    if (!existing) {
      res.status(404).json({ error: "Group not found" });
      return;
    }
    const type = String(existing?.type || "").trim().toLowerCase();
    if (type !== "group" && type !== "groupchat" && type !== "community-group") {
      res.status(400).json({ error: "Not a group conversation" });
      return;
    }
    const memberIds = getConversationMemberIds(existing);
    if (!memberIds.includes(viewerId)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const nextMemberIds = memberIds.filter((memberId) => memberId !== viewerId);
    await updateCollection("conversations", async (items) => {
      return items
        .map((conversation) => {
          if (String(conversation?.id || "").trim() !== groupId) return conversation;
          const conversationType = String(conversation?.type || "").trim().toLowerCase();
          if (conversationType !== "group" && conversationType !== "groupchat" && conversationType !== "community-group") {
            return conversation;
          }
          const currentMemberIds = getConversationMemberIds(conversation).filter((memberId) => memberId !== viewerId);
          const currentAdminIds = normalizeIdList(conversation.adminIds).filter((memberId) => memberId !== viewerId);
          if (!currentMemberIds.length) {
            return null;
          }
          const nextOwnerUserId = String(conversation.ownerUserId || "").trim() === viewerId
            ? currentMemberIds[0]
            : String(conversation.ownerUserId || "").trim();
          return {
            ...conversation,
            memberIds: currentMemberIds,
            adminIds: currentAdminIds,
            ownerUserId: nextOwnerUserId,
            updatedAt: new Date().toISOString(),
          };
        })
        .filter(Boolean);
    });
    res.json({ ok: true, groupId, left: true, removed: nextMemberIds.length === 0 });
  }),
);

app.get(
  "/api/community/conversations",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const payload = await buildCommunityOverviewPayload(req);
    res.json({
      conversations: payload.chats,
      chats: payload.chats,
    });
  }),
);

app.post(
  "/api/community/conversations/direct",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const viewerId = getViewerIdFromReq(req);
    const userId = String(req.body?.userId || "").trim();
    if (!viewerId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!userId || userId === viewerId) {
      res.status(400).json({ error: "userId is required" });
      return;
    }
    const { usersById, conversations, messages, friendRequests, friendships, blocks, uploadsById } = await loadCommunityContext();
    const targetUser = usersById.get(userId);
    if (!targetUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const existing = conversations.find(
      (conversation) =>
        String(conversation?.type || "").trim().toLowerCase() === "direct" &&
        normalizeIdList(conversation?.memberIds).length === 2 &&
        normalizeIdList(conversation?.memberIds).includes(viewerId) &&
        normalizeIdList(conversation?.memberIds).includes(userId),
    );
    if (existing) {
      let restoredConversation = null;
      await updateCollection("conversations", async (items) => items.map((conversation) => {
        if (String(conversation?.id || "").trim() !== String(existing.id || "").trim()) return conversation;
        restoredConversation = removeConversationViewerHiddenId(conversation, viewerId);
        return restoredConversation;
      }));
      const responseConversation = restoredConversation || existing;
      res.json({
        conversation: summarizeCommunityConversation(responseConversation, {
          viewerId,
          usersById,
          uploadsById,
          friendRequests,
          friendships,
          blocks,
          messagesByConversation: new Map(
            messages.reduce((acc, message) => {
              const key = String(message?.conversationId || "").trim();
              if (!key) return acc;
              const list = acc.get(key) || [];
              list.push(message);
              acc.set(key, list);
              return acc;
            }, new Map()),
          ),
        }),
      });
      return;
    }

    const now = new Date().toISOString();
    const conversation = {
      id: crypto.randomUUID(),
      type: "direct",
      memberIds: [viewerId, userId],
      ownerUserId: viewerId,
      adminIds: [viewerId],
      mutedMemberIds: [],
      name: "",
      bio: "",
      permissions: {
        membersCanEditSettings: false,
        membersCanSendMessages: true,
        membersCanAddMembers: false,
        membersCanInviteByLink: false,
        adminsMustApproveNewMembers: false,
      },
      avatarUploadId: "",
      inviteToken: "",
      isFavorite: false,
      hiddenForUserIds: [],
      deletedForUserIds: [],
      createdAt: now,
      updatedAt: now,
      lastMessageId: "",
      lastMessageAt: "",
    };
    await updateCollection("conversations", async (items) => {
      items.push(conversation);
      return items;
    });
    res.status(201).json({
      conversation: summarizeCommunityConversation(conversation, {
        viewerId,
        usersById,
        uploadsById: new Map(),
        friendRequests: [],
        friendships: [],
        blocks: [],
        messagesByConversation: new Map(),
      }),
    });
  }),
);

app.get(
  "/api/community/conversations/:conversationId/messages",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const payload = await buildCommunityConversationMessagesPayload(req, req.params.conversationId, {
      markRead: String(req.query.markRead || "").trim().toLowerCase() !== "false",
    });
    if (!payload) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    res.json(payload);
  }),
);

app.post(
  "/api/community/conversations/:conversationId/messages",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const viewerId = getViewerIdFromReq(req);
    if (!viewerId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const conversationId = String(req.params.conversationId || "").trim();
    const text = String(req.body?.text || "").trim();
    const attachmentDataUrl = String(req.body?.attachmentDataUrl || "").trim();
    const attachmentFileName = String(req.body?.attachmentFileName || "attachment").trim() || "attachment";
    const attachmentMimeType = String(req.body?.attachmentMimeType || "").trim() || "application/octet-stream";
    const replyTo = req.body?.replyTo && typeof req.body.replyTo === "object" ? req.body.replyTo : null;
    const { usersById, conversations, uploadsById, friendRequests, friendships, blocks } = await loadCommunityContext();
    const conversation = conversations.find((entry) => String(entry?.id || "").trim() === conversationId);
    if (!conversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    const memberIds = getConversationMemberIds(conversation);
    if (memberIds.length && !memberIds.includes(viewerId)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (!text && !attachmentDataUrl) {
      res.status(400).json({ error: "Message text or attachment is required" });
      return;
    }
    const now = new Date().toISOString();
    const attachment = attachmentDataUrl
      ? {
          fileName: attachmentFileName,
          mimeType: attachmentMimeType,
          dataUrl: attachmentDataUrl,
          remoteUrl: attachmentDataUrl,
          upload: null,
        }
      : null;
    const message = {
      id: crypto.randomUUID(),
      conversationId,
      senderUserId: viewerId,
      senderName: String(usersById.get(viewerId)?.name || "").trim(),
      type: attachment ? inferFileTypeFromMime(attachmentMimeType) : "text",
      text,
      attachment,
      call: null,
      replyTo,
      deliveredAt: now,
      readAt: now,
      seenByUserIds: [viewerId],
      editedAt: null,
      deletedAt: null,
      deletedForUserIds: [],
      hiddenForUserIds: [],
      noticeThreadKey: String(conversation.noticeThreadKey || "").trim(),
      noticeBatchId: String(conversation.noticeBatchId || "").trim(),
      createdAt: now,
      updatedAt: now,
    };
    await updateCollection("messages", async (items) => {
      items.push(message);
      return items;
    });
    await updateCollection("conversations", async (items) => {
      return items.map((entry) =>
        String(entry?.id || "").trim() === conversationId
          ? {
              ...entry,
              lastMessageId: message.id,
              lastMessageAt: now,
              updatedAt: now,
            }
          : entry,
      );
    });
    res.status(201).json({
      message: summarizeCommunityMessage(message, uploadsById),
    });
  }),
);

app.post(
  "/api/community/conversations/:conversationId/messages/file",
  optionalAuth,
  express.raw({ type: "*/*", limit: "25mb" }),
  asyncHandler(async (req, res) => {
    const viewerId = getViewerIdFromReq(req);
    if (!viewerId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const conversationId = String(req.params.conversationId || "").trim();
    const metaRaw = String(req.headers["x-message-meta"] || "").trim();
    let meta = {};
    if (metaRaw) {
      try {
        meta = JSON.parse(decodeURIComponent(metaRaw));
      } catch {
        meta = {};
      }
    }
    const fileName = String(meta.fileName || "attachment").trim() || "attachment";
    const text = String(meta.text || "").trim();
    const replyTo = meta.replyTo && typeof meta.replyTo === "object" ? meta.replyTo : null;
    const mediaStyle = meta.mediaStyle && typeof meta.mediaStyle === "object" ? meta.mediaStyle : null;
    const buffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || []);
    const mimeType = String(req.headers["content-type"] || "application/octet-stream").trim() || "application/octet-stream";
    const { usersById, conversations, friendRequests, friendships, blocks } = await loadCommunityContext();
    const conversation = conversations.find((entry) => String(entry?.id || "").trim() === conversationId);
    if (!conversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    const memberIds = getConversationMemberIds(conversation);
    if (memberIds.length && !memberIds.includes(viewerId)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const upload = await storeCommunityUpload({
      ownerUserId: viewerId,
      kind: "chat-attachment",
      mimeType,
      fileName,
      originalName: fileName,
      buffer,
      storageFolder: "community/chat",
      storageResourceType: inferFileTypeFromMime(mimeType),
    });
    const now = new Date().toISOString();
    const message = {
      id: crypto.randomUUID(),
      conversationId,
      senderUserId: viewerId,
      senderName: String(usersById.get(viewerId)?.name || "").trim(),
      type: inferFileTypeFromMime(mimeType),
      text,
      attachment: {
        fileName,
        mimeType,
        upload: getCommunityUploadSummary(upload),
      },
      call: null,
      replyTo,
      mediaStyle,
      deliveredAt: now,
      readAt: now,
      seenByUserIds: [viewerId],
      editedAt: null,
      deletedAt: null,
      deletedForUserIds: [],
      hiddenForUserIds: [],
      noticeThreadKey: String(conversation.noticeThreadKey || "").trim(),
      noticeBatchId: String(conversation.noticeBatchId || "").trim(),
      createdAt: now,
      updatedAt: now,
    };
    await updateCollection("messages", async (items) => {
      items.push(message);
      return items;
    });
    await updateCollection("conversations", async (items) => {
      return items.map((entry) =>
        String(entry?.id || "").trim() === conversationId
          ? {
              ...entry,
              lastMessageId: message.id,
              lastMessageAt: now,
              updatedAt: now,
            }
          : entry,
      );
    });
    res.status(201).json({ message: summarizeCommunityMessage(message, new Map([[upload.id, upload]])) });
  }),
);

app.get(
  "/api/community/conversations/:conversationId/calls/active",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const payload = await buildCommunityConversationMessagesPayload(req, req.params.conversationId, {
      markRead: false,
    });
    if (!payload) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    res.json({ call: null, active: false, conversation: payload.conversation });
  }),
);

app.post(
  "/api/community/conversations/:conversationId/calls/start",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const payload = await buildCommunityConversationMessagesPayload(req, req.params.conversationId, {
      markRead: false,
    });
    if (!payload) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    res.json({ ok: true, call: null });
  }),
);

app.post(
  "/api/community/conversations/:conversationId/calls/join",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const payload = await buildCommunityConversationMessagesPayload(req, req.params.conversationId, {
      markRead: false,
    });
    if (!payload) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    res.json({ ok: true, call: null });
  }),
);

app.post(
  "/api/community/conversations/:conversationId/calls/end",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const payload = await buildCommunityConversationMessagesPayload(req, req.params.conversationId, {
      markRead: false,
    });
    if (!payload) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    res.json({ ok: true, call: null });
  }),
);

app.post(
  "/api/community/groups",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const viewerId = getViewerIdFromReq(req);
    const name = normalizeWhitespace(req.body?.name || "Study Group");
    const memberIds = normalizeIdList(req.body?.memberIds);
    if (!viewerId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const { usersById } = await loadCommunityContext();
    const uniqueMemberIds = normalizeIdList([viewerId, ...memberIds]);
    if (!name) {
      res.status(400).json({ error: "Group name is required" });
      return;
    }
    if (uniqueMemberIds.length < 2) {
      res.status(400).json({ error: "At least one other member is required" });
      return;
    }
    for (const memberId of uniqueMemberIds) {
      if (!usersById.get(memberId)) {
        res.status(404).json({ error: `User not found: ${memberId}` });
        return;
      }
    }
    const now = new Date().toISOString();
    const conversation = {
      id: crypto.randomUUID(),
      type: "group",
      memberIds: uniqueMemberIds,
      ownerUserId: viewerId,
      adminIds: [viewerId],
      mutedMemberIds: [],
      name,
      bio: "",
      permissions: {
        membersCanEditSettings: false,
        membersCanSendMessages: true,
        membersCanAddMembers: true,
        membersCanInviteByLink: true,
        adminsMustApproveNewMembers: false,
      },
      avatarUploadId: "",
      inviteToken: crypto.randomUUID().replace(/-/g, "").slice(0, 18),
      isFavorite: false,
      hiddenForUserIds: [],
      deletedForUserIds: [],
      inviteTokenCreatedAt: now,
      createdAt: now,
      updatedAt: now,
      lastMessageId: "",
      lastMessageAt: "",
    };
    await updateCollection("conversations", async (items) => {
      items.push(conversation);
      return items;
    });
    const payload = await buildCommunityGroupPayload(req, conversation.id);
    res.status(201).json({
      conversation: payload?.conversation || summarizeCommunityConversation(conversation, {
        viewerId,
        usersById,
        uploadsById: new Map(),
        friendRequests: [],
        friendships: [],
        blocks: [],
        messagesByConversation: new Map(),
      }),
    });
  }),
);

app.get(
  "/api/community/groups/:groupId",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const payload = await buildCommunityGroupPayload(req, req.params.groupId);
    if (!payload) {
      res.status(404).json({ error: "Group not found" });
      return;
    }
    res.json(payload);
  }),
);

app.get(
  "/api/community/groups/:groupId/invite/:inviteToken",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const viewerId = getViewerIdFromReq(req);
    const groupId = String(req.params.groupId || "").trim();
    const inviteToken = String(req.params.inviteToken || "").trim();
    if (!groupId || !inviteToken) {
      res.status(400).json({ error: "Invite not found" });
      return;
    }

    const {
      usersById,
      friendRequests,
      friendships,
      blocks,
      conversations,
      messages,
      uploadsById,
    } = await loadCommunityContext();
    const conversation = conversations.find((entry) => String(entry?.id || "").trim() === groupId);
    if (!conversation) {
      res.status(404).json({ error: "Group not found" });
      return;
    }
    const type = String(conversation?.type || "").trim().toLowerCase();
    if (type !== "group" && type !== "groupchat" && type !== "community-group") {
      res.status(404).json({ error: "Group not found" });
      return;
    }
    if (String(conversation.inviteToken || "").trim() !== inviteToken) {
      res.status(404).json({ error: "Invite not found" });
      return;
    }

    const summary = summarizeCommunityConversation(conversation, {
      viewerId,
      usersById,
      uploadsById,
      friendRequests,
      friendships,
      blocks,
      messagesByConversation: new Map(
        messages.reduce((acc, message) => {
          const conversationKey = String(message?.conversationId || "").trim();
          if (!conversationKey) return acc;
          const existing = acc.get(conversationKey) || [];
          existing.push(message);
          acc.set(conversationKey, existing);
          return acc;
        }, new Map()),
      ),
    });
    if (!summary.group) {
      res.status(404).json({ error: "Group not found" });
      return;
    }

    res.json({
      ...summary,
      invite: buildCommunityGroupInviteState(conversation),
    });
  }),
);

app.post(
  "/api/community/groups/:groupId/invite/:inviteToken/join",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const viewerId = getViewerIdFromReq(req);
    const groupId = String(req.params.groupId || "").trim();
    const inviteToken = String(req.params.inviteToken || "").trim();
    if (!viewerId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!groupId || !inviteToken) {
      res.status(400).json({ error: "Invite not found" });
      return;
    }

    const { usersById, conversations } = await loadCommunityContext();
    const existing = conversations.find((entry) => String(entry?.id || "").trim() === groupId);
    if (!existing) {
      res.status(404).json({ error: "Group not found" });
      return;
    }
    const type = String(existing?.type || "").trim().toLowerCase();
    if (type !== "group" && type !== "groupchat" && type !== "community-group") {
      res.status(404).json({ error: "Group not found" });
      return;
    }
    if (String(existing.inviteToken || "").trim() !== inviteToken) {
      res.status(404).json({ error: "Invite not found" });
      return;
    }

    const inviteState = buildCommunityGroupInviteState(existing);
    if (inviteState.expired) {
      res.status(410).json({ error: "Invite expired" });
      return;
    }

    let updatedConversation = null;
    await updateCollection("conversations", async (items) => {
      return items.map((conversation) => {
        if (String(conversation?.id || "").trim() !== groupId) return conversation;
        const conversationType = String(conversation?.type || "").trim().toLowerCase();
        if (conversationType !== "group" && conversationType !== "groupchat" && conversationType !== "community-group") {
          return conversation;
        }
        const memberIds = getConversationMemberIds(conversation);
        if (!memberIds.includes(viewerId)) {
          updatedConversation = {
            ...conversation,
            memberIds: [...memberIds, viewerId],
            updatedAt: new Date().toISOString(),
          };
          return updatedConversation;
        }
        updatedConversation = conversation;
        return conversation;
      });
    });

    const payload = await buildCommunityGroupPayload(req, groupId);
    if (!payload) {
      res.status(404).json({ error: "Group not found" });
      return;
    }

    res.json({
      ...payload,
      invite: buildCommunityGroupInviteState(updatedConversation || existing),
      joined: !getConversationMemberIds(existing).includes(viewerId),
    });
  }),
);

app.patch(
  "/api/community/groups/:groupId",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const viewerId = getViewerIdFromReq(req);
    const groupId = String(req.params.groupId || "").trim();
    if (!viewerId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    let updated = null;
    await updateCollection("conversations", async (items) => {
      const nextItems = items.map((entry) => {
        if (String(entry?.id || "").trim() !== groupId) return entry;
        if (String(entry?.type || "").trim().toLowerCase() !== "group") return entry;
        const memberIds = normalizeIdList(entry.memberIds);
        const adminIds = normalizeIdList(entry.adminIds);
        const isOwner = String(entry.ownerUserId || "").trim() === viewerId;
        const isAdmin = isOwner || adminIds.includes(viewerId);
        if (!isAdmin) {
          updated = "forbidden";
          return entry;
        }
        const nextGroup = { ...entry };
        if (typeof req.body?.name === "string") {
          nextGroup.name = normalizeWhitespace(req.body.name) || nextGroup.name;
        }
        if (typeof req.body?.bio === "string") {
          nextGroup.bio = normalizeWhitespace(req.body.bio);
        }
        if (req.body?.clearAvatar) {
          nextGroup.avatarUploadId = "";
        } else if (typeof req.body?.avatarUploadId === "string") {
          nextGroup.avatarUploadId = String(req.body.avatarUploadId || "").trim();
        }
        if (req.body?.permissions && typeof req.body.permissions === "object") {
          nextGroup.permissions = {
            ...(nextGroup.permissions || {}),
            ...req.body.permissions,
          };
        }
        if (typeof req.body?.isMuted === "boolean") {
          const nextMuted = new Set(normalizeIdList(nextGroup.mutedMemberIds));
          if (req.body.isMuted) {
            nextMuted.add(viewerId);
          } else {
            nextMuted.delete(viewerId);
          }
          nextGroup.mutedMemberIds = [...nextMuted];
        }
        nextGroup.memberIds = memberIds;
        nextGroup.adminIds = adminIds;
        nextGroup.updatedAt = new Date().toISOString();
        updated = nextGroup;
        return nextGroup;
      });
      return nextItems;
    });
    if (updated === "forbidden") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const payload = await buildCommunityGroupPayload(req, groupId);
    if (!payload) {
      res.status(404).json({ error: "Group not found" });
      return;
    }
    res.json(payload);
  }),
);

app.post(
  "/api/community/groups/:groupId/avatar/file",
  optionalAuth,
  express.raw({ type: "*/*", limit: "25mb" }),
  asyncHandler(async (req, res) => {
    const viewerId = getViewerIdFromReq(req);
    const groupId = String(req.params.groupId || "").trim();
    if (!viewerId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const metaName = String(req.headers["x-group-avatar-name"] || "").trim();
    const fileName = metaName ? decodeURIComponent(metaName) : "group-avatar";
    const mimeType = String(req.headers["content-type"] || "application/octet-stream").trim() || "application/octet-stream";
    const buffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || []);
    const upload = await storeCommunityUpload({
      ownerUserId: viewerId,
      kind: "group-avatar",
      mimeType,
      fileName,
      originalName: fileName,
      buffer,
      storageFolder: "community/group-avatar",
      storageResourceType: inferFileTypeFromMime(mimeType),
    });
    res.status(201).json({ upload: getCommunityUploadSummary(upload) });
  }),
);

app.post(
  "/api/community/statuses",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const viewerId = getViewerIdFromReq(req);
    if (!viewerId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const text = String(req.body?.text || "").trim();
    const background = String(req.body?.background || "#2f80d0").trim() || "#2f80d0";
    const visibility = String(req.body?.visibility || "friends").trim() || "friends";
    const caption = String(req.body?.caption || "").trim();
    const style = req.body?.style && typeof req.body.style === "object" ? req.body.style : {};
    const mediaDataUrl = String(req.body?.mediaDataUrl || req.body?.imageDataUrl || "").trim();
    const fileName = String(req.body?.fileName || "status-media").trim() || "status-media";
    const type = mediaDataUrl
      ? mediaDataUrl.startsWith("data:video/")
        ? "video"
        : "image"
      : "text";
    const now = new Date().toISOString();
    const status = {
      id: crypto.randomUUID(),
      ownerUserId: viewerId,
      userId: viewerId,
      type,
      text,
      caption,
      background,
      visibility,
      textColor: String(style.textColor || req.body?.textColor || "#ffffff").trim() || "#ffffff",
      textAlign: String(style.textAlign || req.body?.textAlign || "center").trim() || "center",
      textScale: Number(style.textScale || req.body?.textScale || 1) || 1,
      imageFit: String(style.imageFit || req.body?.imageFit || "contain").trim() || "contain",
      imageRotate: Number(style.imageRotate || req.body?.imageRotate || 0) || 0,
      imageFilter: String(style.imageFilter || req.body?.imageFilter || "none").trim() || "none",
      allowReplies: req.body?.allowReplies !== false,
      imageDataUrl: type === "image" ? mediaDataUrl : "",
      videoDataUrl: type === "video" ? mediaDataUrl : "",
      fileName,
      upload: null,
      likesCount: 0,
      viewsCount: 0,
      likedByUserIds: [],
      viewedByUserIds: [viewerId],
      createdAt: now,
      updatedAt: now,
    };
    await updateCollection("statuses", async (items) => {
      items.push(status);
      return items;
    });
    res.status(201).json({ status });
  }),
);

app.post(
  "/api/community/statuses/file",
  optionalAuth,
  express.raw({ type: "*/*", limit: "25mb" }),
  asyncHandler(async (req, res) => {
    const viewerId = getViewerIdFromReq(req);
    if (!viewerId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const metaRaw = String(req.headers["x-status-meta"] || "").trim();
    let meta = {};
    if (metaRaw) {
      try {
        meta = JSON.parse(decodeURIComponent(metaRaw));
      } catch {
        meta = {};
      }
    }
    const mimeType = String(req.headers["content-type"] || "application/octet-stream").trim() || "application/octet-stream";
    const fileName = String(meta.fileName || "status-media").trim() || "status-media";
    const buffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || []);
    const upload = await storeCommunityUpload({
      ownerUserId: viewerId,
      kind: "status-media",
      mimeType,
      fileName,
      originalName: fileName,
      buffer,
      storageFolder: "community/status",
      storageResourceType: inferFileTypeFromMime(mimeType),
    });
    const now = new Date().toISOString();
    const isVideo = mimeType.startsWith("video/");
    const status = {
      id: crypto.randomUUID(),
      ownerUserId: viewerId,
      userId: viewerId,
      type: isVideo ? "video" : "image",
      text: String(meta.caption || "").trim(),
      caption: String(meta.caption || "").trim(),
      background: "#2f80d0",
      visibility: String(meta.visibility || "friends").trim() || "friends",
      textColor: "#ffffff",
      textAlign: "center",
      textScale: 1,
      imageFit: "contain",
      imageRotate: 0,
      imageFilter: "none",
      allowReplies: true,
      imageDataUrl: isVideo ? "" : upload.dataUrl,
      videoDataUrl: isVideo ? upload.dataUrl : "",
      fileName,
      upload,
      likesCount: 0,
      viewsCount: 0,
      likedByUserIds: [],
      viewedByUserIds: [viewerId],
      createdAt: now,
      updatedAt: now,
    };
    await updateCollection("statuses", async (items) => {
      items.push(status);
      return items;
    });
    res.status(201).json({
      status,
      upload: getCommunityUploadSummary(upload),
    });
  }),
);

app.post(
  "/api/community/statuses/video",
  optionalAuth,
  express.raw({ type: "*/*", limit: "25mb" }),
  asyncHandler(async (req, res) => {
    const viewerId = getViewerIdFromReq(req);
    if (!viewerId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const metaRaw = String(req.headers["x-status-meta"] || "").trim();
    let meta = {};
    if (metaRaw) {
      try {
        meta = JSON.parse(decodeURIComponent(metaRaw));
      } catch {
        meta = {};
      }
    }
    const mimeType = String(req.headers["content-type"] || "application/octet-stream").trim() || "application/octet-stream";
    const fileName = String(meta.fileName || "status-video").trim() || "status-video";
    const buffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || []);
    const upload = await storeCommunityUpload({
      ownerUserId: viewerId,
      kind: "status-video",
      mimeType,
      fileName,
      originalName: fileName,
      buffer,
      storageFolder: "community/status",
      storageResourceType: "video",
    });
    const now = new Date().toISOString();
    const status = {
      id: crypto.randomUUID(),
      ownerUserId: viewerId,
      userId: viewerId,
      type: "video",
      text: String(meta.caption || "").trim(),
      caption: String(meta.caption || "").trim(),
      background: "#2f80d0",
      visibility: String(meta.visibility || "friends").trim() || "friends",
      textColor: "#ffffff",
      textAlign: "center",
      textScale: 1,
      imageFit: "contain",
      imageRotate: 0,
      imageFilter: "none",
      allowReplies: true,
      imageDataUrl: "",
      videoDataUrl: upload.dataUrl,
      fileName,
      upload,
      likesCount: 0,
      viewsCount: 0,
      likedByUserIds: [],
      viewedByUserIds: [viewerId],
      createdAt: now,
      updatedAt: now,
    };
    await updateCollection("statuses", async (items) => {
      items.push(status);
      return items;
    });
    res.status(201).json({
      status,
      upload: getCommunityUploadSummary(upload),
    });
  }),
);

app.post(
  "/api/community/statuses/:statusId/view",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const viewerId = getViewerIdFromReq(req);
    const statusId = String(req.params.statusId || "").trim();
    let found = false;
    await updateCollection("statuses", async (items) => {
      const now = new Date().toISOString();
      return items.map((status) => {
        if (String(status?.id || "").trim() !== statusId) return status;
        found = true;
        const viewedByUserIds = normalizeIdList(status.viewedByUserIds);
        if (viewerId && !viewedByUserIds.includes(viewerId)) viewedByUserIds.push(viewerId);
        return {
          ...status,
          viewedByUserIds,
          viewsCount: Math.max(status.viewsCount || 0, viewedByUserIds.length),
          updatedAt: now,
        };
      });
    });
    if (!found) {
      res.status(404).json({ error: "Status not found" });
      return;
    }
    res.json({ ok: true });
  }),
);

app.post(
  "/api/community/statuses/:statusId/like",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const viewerId = getViewerIdFromReq(req);
    const statusId = String(req.params.statusId || "").trim();
    if (!viewerId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    let found = false;
    await updateCollection("statuses", async (items) => {
      const now = new Date().toISOString();
      return items.map((status) => {
        if (String(status?.id || "").trim() !== statusId) return status;
        found = true;
        const likedByUserIds = normalizeIdList(status.likedByUserIds);
        const index = likedByUserIds.indexOf(viewerId);
        if (index >= 0) {
          likedByUserIds.splice(index, 1);
        } else {
          likedByUserIds.push(viewerId);
        }
        return {
          ...status,
          likedByUserIds,
          likesCount: likedByUserIds.length,
          updatedAt: now,
        };
      });
    });
    if (!found) {
      res.status(404).json({ error: "Status not found" });
      return;
    }
    res.json({ ok: true });
  }),
);

app.get(
  "/api/community/statuses/:statusId/likes",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { usersById, statuses } = await loadCommunityContext();
    const statusId = String(req.params.statusId || "").trim();
    const status = statuses.find((entry) => String(entry?.id || "").trim() === statusId);
    if (!status) {
      res.status(404).json({ error: "Status not found" });
      return;
    }
    const likes = normalizeIdList(status.likedByUserIds)
      .map((userId) => usersById.get(userId))
      .filter(Boolean)
      .map((user) => toPublicUser(user));
    res.json({ likes });
  }),
);

app.get(
  "/api/community/statuses/:statusId/views",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { usersById, statuses } = await loadCommunityContext();
    const statusId = String(req.params.statusId || "").trim();
    const status = statuses.find((entry) => String(entry?.id || "").trim() === statusId);
    if (!status) {
      res.status(404).json({ error: "Status not found" });
      return;
    }
    const views = normalizeIdList(status.viewedByUserIds)
      .map((userId) => usersById.get(userId))
      .filter(Boolean)
      .map((user) => toPublicUser(user));
    res.json({ views });
  }),
);

app.delete(
  "/api/community/statuses/:statusId",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const viewerId = getViewerIdFromReq(req);
    const statusId = String(req.params.statusId || "").trim();
    if (!viewerId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    let removed = false;
    await updateCollection("statuses", async (items) => {
      const nextItems = items.filter((entry) => {
        if (String(entry?.id || "").trim() !== statusId) return true;
        if (String(entry?.ownerUserId || "").trim() !== viewerId) return true;
        removed = true;
        return false;
      });
      return nextItems;
    });
    if (!removed) {
      res.status(404).json({ error: "Status not found" });
      return;
    }
    res.json({ ok: true, removed: true });
  }),
);

app.patch(
  "/api/community/messages/:messageId",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const viewerId = getViewerIdFromReq(req);
    const messageId = String(req.params.messageId || "").trim();
    const nextText = String(req.body?.text || "").trim();
    if (!viewerId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    let updated = null;
    await updateCollection("messages", async (items) => {
      const now = new Date().toISOString();
      return items.map((message) => {
        if (String(message?.id || "").trim() !== messageId) return message;
        if (String(message?.senderUserId || "").trim() !== viewerId) {
          updated = "forbidden";
          return message;
        }
        updated = true;
        return {
          ...message,
          text: nextText,
          editedAt: now,
          updatedAt: now,
        };
      });
    });
    if (updated === "forbidden") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (!updated) {
      res.status(404).json({ error: "Message not found" });
      return;
    }
    res.json({ ok: true });
  }),
);

app.delete(
  "/api/community/messages/:messageId",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const viewerId = getViewerIdFromReq(req);
    const messageId = String(req.params.messageId || "").trim();
    const scope = String(req.body?.scope || "self").trim().toLowerCase();
    if (!viewerId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    let matched = false;
    let forbidden = false;
    await updateCollection("messages", async (items) => {
      const now = new Date().toISOString();
      return items.map((message) => {
        if (String(message?.id || "").trim() !== messageId) return message;
        matched = true;
        if (scope === "everyone") {
          if (String(message?.senderUserId || "").trim() !== viewerId) {
            forbidden = true;
            return message;
          }
          return {
            ...message,
            text: "message deleted",
            type: "text",
            attachment: null,
            replyTo: null,
            deletedAt: now,
            updatedAt: now,
          };
        }
        const hiddenForUserIds = normalizeIdList(message.hiddenForUserIds);
        if (!hiddenForUserIds.includes(viewerId)) hiddenForUserIds.push(viewerId);
        return {
          ...message,
          hiddenForUserIds,
          updatedAt: now,
        };
      });
    });
    if (forbidden) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (!matched) {
      res.status(404).json({ error: "Message not found" });
      return;
    }
    res.json({ ok: true, scope });
  }),
);

app.all("/api/community/*", (_req, res) => {
  res.status(404).json({ error: "Not found" });
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
