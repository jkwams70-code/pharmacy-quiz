const storedApiBase = localStorage.getItem("quizApiBase")?.trim();
const currentHost = String(window.location.hostname || "").trim();
const currentProtocol = String(window.location.protocol || "").trim().toLowerCase();
const currentPort = String(window.location.port || "").trim();
const userAgent = String(
  typeof navigator !== "undefined" ? navigator.userAgent || "" : "",
);
const hasCapacitorGlobal =
  typeof window !== "undefined" && typeof window.Capacitor === "object";
const isAndroidWebView = /\bwv\b/i.test(userAgent);
const isLikelyNativeHost = ["localhost", "127.0.0.1"].includes(currentHost) && !currentPort;
const isNativeShell =
  currentProtocol.startsWith("capacitor:") ||
  currentProtocol.startsWith("ionic:") ||
  hasCapacitorGlobal ||
  isAndroidWebView ||
  isLikelyNativeHost ||
  Boolean(
    typeof window !== "undefined" &&
      window.Capacitor &&
      typeof window.Capacitor.isNativePlatform === "function" &&
      window.Capacitor.isNativePlatform(),
  );
const isLocalHost = ["localhost", "127.0.0.1"].includes(currentHost);
const isFilePreview = currentProtocol === "file:";
const isProductionHost = /ajixpharmacy\.online$/i.test(currentHost);
const isLanPreview =
  !!currentHost &&
  !isLocalHost &&
  !isProductionHost &&
  window.location.protocol === "http:";
const shouldUseLocalApi = (isFilePreview || (isLocalHost && !isLikelyNativeHost)) && !isNativeShell;
const inferredApiBase = shouldUseLocalApi
  ? "http://localhost:4000/api"
  : isLanPreview
    ? `http://${currentHost}:4000/api`
    : "https://api.ajixpharmacy.online/api";
const hasStaleStoredApiBase =
  !!storedApiBase &&
  (/trycloudflare\.com/i.test(storedApiBase) ||
    ((shouldUseLocalApi || isLanPreview) && /https:\/\/api\.ajixpharmacy\.online\/api/i.test(storedApiBase)) ||
    /your-new-tunnel/i.test(storedApiBase) ||
    /api\.139\.84\.233\.243\.sslip\.io/i.test(storedApiBase) ||
    (isLanPreview && /localhost:4000/i.test(storedApiBase)) ||
    ((isNativeShell || isLikelyNativeHost) && /localhost:4000/i.test(storedApiBase)));
if (hasStaleStoredApiBase) {
  localStorage.removeItem("quizApiBase");
}
const API_BASE = hasStaleStoredApiBase ? inferredApiBase : storedApiBase || inferredApiBase;

const CLIENT_ID_KEY = "quizClientId";
const AUTH_TOKEN_KEY = "quizAuthToken";
const ADMIN_KEY_KEY = "quizAdminKey";
const UPLOAD_MIME_TYPE_ALIASES = {
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

function normalizeUploadMimeType(value = "") {
  const safeValue = String(value || "").trim().toLowerCase();
  if (!safeValue) return "";
  const baseMimeType = String(safeValue.split(";")[0] || "").trim();
  if (!baseMimeType) return "";
  return UPLOAD_MIME_TYPE_ALIASES[baseMimeType] || baseMimeType;
}

function getClientId() {
  const existing = localStorage.getItem(CLIENT_ID_KEY);
  if (existing) return existing;

  const next =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `client-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  localStorage.setItem(CLIENT_ID_KEY, next);
  return next;
}

function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) || "";
}

function getAdminKey() {
  return localStorage.getItem(ADMIN_KEY_KEY) || "";
}

function buildHeaders(includeJson = false) {
  const headers = {
    "x-client-id": getClientId(),
  };

  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }

  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const adminKey = getAdminKey();
  if (adminKey) {
    headers["x-admin-key"] = adminKey;
  }

  return headers;
}

async function parseResponseBody(res) {
  const text = await res.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text);
  } catch {
    const snippet = text.trim().slice(0, 80);
    const err = new Error(
      snippet.startsWith("<")
        ? `API returned HTML instead of JSON. Check the local backend at ${inferredApiBase}.`
        : `API returned an invalid response. ${snippet}`,
    );
    err.status = res.status;
    throw err;
  }
}

async function request(method, path, payload = undefined) {
  const useJson = payload !== undefined;
  const send = (base = API_BASE) =>
    fetch(`${base}${path}`, {
      method,
      headers: buildHeaders(useJson),
      body: useJson ? JSON.stringify(payload) : undefined,
    });

  let response;
  try {
    response = await send();
  } catch (networkError) {
    if (storedApiBase && API_BASE !== inferredApiBase) {
      try {
        response = await send(inferredApiBase);
      } catch {
        throw networkError;
      }
    } else {
      throw networkError;
    }
  }

  // OpenRouter free endpoints can return transient 502s. Retry once for AI explain.
  if (path === "/ai/explain" && response.status === 502) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    response = await send();
  }

  const retryAgainstInferredBase = async () => {
    if (!storedApiBase || API_BASE === inferredApiBase) return null;
    try {
      localStorage.removeItem("quizApiBase");
      const retried = await send(inferredApiBase);
      return retried;
    } catch {
      return null;
    }
  };

  if (!response.ok) {
    let message = `API request failed (${response.status})`;
    try {
      const body = await parseResponseBody(response);
      if (body?.error) {
        message = `${body.error} (${response.status})`;
      }
    } catch {
      // Ignore parse failures and keep fallback message.
    }
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }

  if (response.status === 204) return {};
  const contentType = String(response.headers.get("content-type") || "").toLowerCase();
  if (!contentType.includes("application/json")) {
    const retried = await retryAgainstInferredBase();
    if (retried) {
      response = retried;
    }
  }
  return parseResponseBody(response);
}

async function requestBinary(method, path, body, {
  contentType = "application/octet-stream",
  headers = {},
} = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        ...buildHeaders(false),
        "Content-Type": contentType,
        ...headers,
      },
      body,
    });
  } catch (networkError) {
    if (storedApiBase && API_BASE !== inferredApiBase) {
      try {
        response = await fetch(`${inferredApiBase}${path}`, {
          method,
          headers: {
            ...buildHeaders(false),
            "Content-Type": contentType,
            ...headers,
          },
          body,
        });
      } catch {
        throw networkError;
      }
    } else {
      throw networkError;
    }
  }
  if (!response.ok) {
    let message = `API request failed (${response.status})`;
    try {
      const parsed = await parseResponseBody(response);
      if (parsed?.error) {
        message = `${parsed.error} (${response.status})`;
      }
    } catch {
      // keep fallback message
    }
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }
  return parseResponseBody(response);
}

function post(path, payload) {
  return request("POST", path, payload);
}

function put(path, payload) {
  return request("PUT", path, payload);
}

function patch(path, payload) {
  return request("PATCH", path, payload);
}

function del(path, payload = undefined) {
  return request("DELETE", path, payload);
}

function get(path) {
  return request("GET", path);
}

function fireAndForget(promise) {
  promise.catch(() => {
    // Keep frontend fully functional even if backend is down.
  });
}

function toQuery(params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

export const backendClient = {
  getToken() {
    return getAuthToken();
  },

  setToken(token) {
    const cleaned = String(token || "").trim();
    if (!cleaned) return;
    localStorage.setItem(AUTH_TOKEN_KEY, cleaned);
  },

  clearToken() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },

  isAuthenticated() {
    return Boolean(getAuthToken());
  },

  async register(payload = {}) {
    const data = await post("/auth/register", payload);
    if (data?.token) {
      this.setToken(data.token);
    }
    return data;
  },

  async login(payload = {}) {
    const data = await post("/auth/login", payload);
    if (data?.token) {
      this.setToken(data.token);
    }
    return data;
  },

  fetchMe() {
    return get("/auth/me");
  },

  addPoints(payload = {}) {
    return post("/auth/points", payload);
  },

  fetchPointsLeaderboard(scope = "daily", limit = null) {
    const query = toQuery({ scope, limit });
    return get(`/points/leaderboard${query}`);
  },

  forgotPassword(payload = {}) {
    return post("/auth/forgot-password", payload);
  },

  resetPassword(payload = {}) {
    return post("/auth/reset-password", payload);
  },

  changePassword(payload = {}) {
    return post("/auth/change-password", payload);
  },

  verifyPassword(payload = {}) {
    return post("/auth/verify-password", payload);
  },

  updateProfile(payload = {}) {
    return put("/auth/profile", payload);
  },

  fetchSubscriptionPlans() {
    return get("/subscriptions/plans");
  },

  fetchMySubscription() {
    return get("/subscriptions/me");
  },

  submitSubscriptionRequest(payload = {}) {
    return post("/subscriptions/requests", payload);
  },

  fetchCommunityOverview() {
    return get("/community/overview");
  },

  searchCommunityUsers(query = "", limit = 20) {
    const qs = toQuery({ q: query, limit });
    return get(`/community/search${qs}`);
  },

  fetchCommunityProfile(userId) {
    return get(`/community/profile/${encodeURIComponent(userId)}`);
  },

  fetchFriendRequests() {
    return get("/community/requests");
  },

  sendFriendRequest(toUserId) {
    return post("/community/requests", { toUserId });
  },

  respondToFriendRequest(requestId, action) {
    return post(`/community/requests/${encodeURIComponent(requestId)}/respond`, { action });
  },

  cancelFriendRequest(requestId) {
    return del(`/community/requests/${encodeURIComponent(requestId)}`);
  },

  fetchFriends() {
    return get("/community/friends");
  },

  unfriendUser(userId) {
    return del(`/community/friends/${encodeURIComponent(userId)}`);
  },

  fetchBlockedUsers() {
    return get("/community/blocks");
  },

  pingCommunityPresence() {
    return post("/community/presence");
  },

  fetchCommunityRealtimeConfig() {
    return get("/community/realtime/config");
  },

  fetchPushConfig() {
    return get("/push/config");
  },

  blockUser(userId) {
    return post(`/community/block/${encodeURIComponent(userId)}`);
  },

  unblockUser(userId) {
    return del(`/community/block/${encodeURIComponent(userId)}`);
  },

  fetchConversations() {
    return get("/community/conversations");
  },

  openDirectConversation(userId) {
    return post("/community/conversations/direct", { userId });
  },

  favoriteCommunityConversation(conversationId) {
    return post(`/community/conversations/${encodeURIComponent(conversationId)}/favorite`);
  },

  unfavoriteCommunityConversation(conversationId) {
    return del(`/community/conversations/${encodeURIComponent(conversationId)}/favorite`);
  },

  clearCommunityConversation(conversationId) {
    return post(`/community/conversations/${encodeURIComponent(conversationId)}/clear`);
  },

  deleteCommunityConversation(conversationId) {
    return del(`/community/conversations/${encodeURIComponent(conversationId)}`);
  },

  createStudyGroup(name = "", memberIds = []) {
    return post("/community/groups", { name, memberIds });
  },

  fetchCommunityGroup(groupId) {
    return get(`/community/groups/${encodeURIComponent(groupId)}`);
  },

  createCommunityGroupInviteLink(groupId) {
    return post(`/community/groups/${encodeURIComponent(groupId)}/invite-link`);
  },

  fetchCommunityGroupInvitePreview(groupId, inviteToken = "") {
    const params = new URLSearchParams();
    params.set("inviteToken", inviteToken);
    return get(`/community/groups/${encodeURIComponent(groupId)}/invite-preview?${params.toString()}`);
  },

  joinCommunityGroupInvite(groupId, inviteToken = "") {
    return post(`/community/groups/${encodeURIComponent(groupId)}/join`, { inviteToken });
  },

  addCommunityGroupMembers(groupId, memberIds = []) {
    return post(`/community/groups/${encodeURIComponent(groupId)}/members`, { memberIds });
  },

  updateCommunityGroup(groupId, payload = {}) {
    return patch(`/community/groups/${encodeURIComponent(groupId)}`, payload);
  },

  leaveCommunityGroup(groupId) {
    return post(`/community/groups/${encodeURIComponent(groupId)}/leave`);
  },

  deleteCommunityGroup(groupId) {
    return del(`/community/groups/${encodeURIComponent(groupId)}`);
  },

  reportCommunityGroup(groupId, reason = "") {
    return post(`/community/groups/${encodeURIComponent(groupId)}/report`, { reason });
  },

  reportCommunityUser(userId, reason = "") {
    return post(`/community/users/${encodeURIComponent(userId)}/report`, { reason });
  },

  uploadCommunityGroupAvatarFile(groupId, file = null) {
    if (!(file instanceof Blob)) {
      return Promise.reject(new Error("A group photo is required."));
    }
    return requestBinary("POST", `/community/groups/${encodeURIComponent(groupId)}/avatar/file`, file, {
      contentType: normalizeUploadMimeType(file.type) || "application/octet-stream",
      headers: {
        "x-group-avatar-name": encodeURIComponent(
          file instanceof File ? (file.name || "group-avatar") : "group-avatar",
        ),
      },
    });
  },

  fetchConversationMessages(conversationId, { markRead = true } = {}) {
    const query = markRead ? "" : "?markRead=false";
    return get(`/community/conversations/${encodeURIComponent(conversationId)}/messages${query}`);
  },

  fetchCommunityConversationActiveCall(conversationId) {
    return get(`/community/conversations/${encodeURIComponent(conversationId)}/calls/active`);
  },

  startCommunityConversationCall(conversationId, mode = "voice") {
    return post(`/community/conversations/${encodeURIComponent(conversationId)}/calls/start`, { mode });
  },

  joinCommunityConversationCall(conversationId, callId = "") {
    return post(`/community/conversations/${encodeURIComponent(conversationId)}/calls/join`, { callId });
  },

  endCommunityConversationCall(conversationId, callId = "") {
    return post(`/community/conversations/${encodeURIComponent(conversationId)}/calls/end`, { callId });
  },

  sendConversationMessage(conversationId, text = "", attachment = null, replyTo = null) {
    return post(`/community/conversations/${encodeURIComponent(conversationId)}/messages`, {
      text,
      attachmentDataUrl: attachment?.dataUrl || "",
      attachmentFileName: attachment?.fileName || "",
      attachmentMimeType: attachment?.mimeType || "",
      replyTo: replyTo && typeof replyTo === "object" ? replyTo : null,
    });
  },

  sendConversationMessageFile(conversationId, file = null, text = "", replyTo = null, mediaStyle = null) {
    if (!(file instanceof Blob)) {
      return Promise.reject(new Error("A file is required."));
    }
    const meta = encodeURIComponent(JSON.stringify({
      fileName: file instanceof File ? (file.name || "attachment") : "attachment",
      text,
      replyTo: replyTo && typeof replyTo === "object" ? replyTo : null,
      mediaStyle: mediaStyle && typeof mediaStyle === "object" ? mediaStyle : null,
    }));
    return requestBinary("POST", `/community/conversations/${encodeURIComponent(conversationId)}/messages/file`, file, {
      contentType: normalizeUploadMimeType(file.type) || "application/octet-stream",
      headers: {
        "x-message-meta": meta,
      },
    });
  },

  uploadStatusMedia(mediaDataUrl = "", fileName = "", caption = "", visibility = "friends", style = null, options = {}) {
    return post("/community/statuses", {
      mediaDataUrl,
      imageDataUrl: mediaDataUrl,
      fileName,
      caption,
      visibility,
      style,
      isAdminBroadcast: Boolean(options?.isAdminBroadcast),
    });
  },

  uploadStatusImage(imageDataUrl = "", fileName = "", caption = "", visibility = "friends", style = null, options = {}) {
    return this.uploadStatusMedia(imageDataUrl, fileName, caption, visibility, style, options);
  },

  uploadStatusMediaFile(file = null, caption = "", visibility = "friends", style = null, options = {}) {
    if (!(file instanceof Blob)) {
      return Promise.reject(new Error("A media file is required."));
    }
    const meta = encodeURIComponent(JSON.stringify({
      fileName: file instanceof File ? (file.name || "status-media") : "status-media",
      caption,
      visibility,
      style,
      isAdminBroadcast: Boolean(options?.isAdminBroadcast),
    }));
    return requestBinary("POST", "/community/statuses/file", file, {
      contentType: normalizeUploadMimeType(file.type) || "application/octet-stream",
      headers: {
        "x-status-meta": meta,
      },
    });
  },

  uploadStatusVideoFile(file = null, caption = "", visibility = "friends", style = null, options = {}) {
    if (!(file instanceof Blob)) {
      return Promise.reject(new Error("A video file is required."));
    }
    const meta = encodeURIComponent(JSON.stringify({
      fileName: file instanceof File ? (file.name || "status-video") : "status-video",
      caption,
      visibility,
      style,
      isAdminBroadcast: Boolean(options?.isAdminBroadcast),
    }));
    return requestBinary("POST", "/community/statuses/video", file, {
      contentType: normalizeUploadMimeType(file.type) || "application/octet-stream",
      headers: {
        "x-status-meta": meta,
      },
    });
  },

  uploadStatusText(text = "", background = "", visibility = "friends", style = null, options = {}) {
    return post("/community/statuses", {
      text,
      background,
      visibility,
      style,
      isAdminBroadcast: Boolean(options?.isAdminBroadcast),
    });
  },

  markStatusViewed(statusId) {
    return post(`/community/statuses/${encodeURIComponent(statusId)}/view`);
  },

  toggleStatusLike(statusId) {
    return post(`/community/statuses/${encodeURIComponent(statusId)}/like`);
  },

  fetchStatusLikes(statusId) {
    return get(`/community/statuses/${encodeURIComponent(statusId)}/likes`);
  },

  fetchStatusViews(statusId) {
    return get(`/community/statuses/${encodeURIComponent(statusId)}/views`);
  },

  deleteStatus(statusId) {
    return del(`/community/statuses/${encodeURIComponent(statusId)}`);
  },

  broadcastAdminMessage(message = "", attachment = null) {
    return post("/admin/broadcast/message", {
      message,
      attachmentDataUrl: attachment?.dataUrl || "",
      attachmentFileName: attachment?.fileName || "",
      attachmentMimeType: attachment?.mimeType || "",
    });
  },

  editConversationMessage(messageId, text = "") {
    return patch(`/community/messages/${encodeURIComponent(messageId)}`, { text });
  },

  deleteConversationMessage(messageId, scope = "self") {
    return del(`/community/messages/${encodeURIComponent(messageId)}`, { scope });
  },

  deactivateAccount(days = 30) {
    return post("/auth/deactivate", { days });
  },

  deleteAccount(confirmToken = "DELETE_MY_ACCOUNT_CONFIRMED") {
    return del("/auth/account", { confirmToken });
  },

  warmup() {
    return get("/health");
  },

  async fetchQuestions(filters = {}) {
    const query = toQuery(filters);
    const data = await get(`/questions${query}`);
    return Array.isArray(data?.questions) ? data.questions : [];
  },

  async fetchQuestionsByIds(ids = []) {
    if (!Array.isArray(ids) || ids.length === 0) return [];
    const data = await this.fetchQuestions({
      ids: ids.join(","),
    });
    return data;
  },

  async fetchCategories() {
    const data = await get("/categories");
    return Array.isArray(data?.categories) ? data.categories : [];
  },

  fetchDailyQuizToday() {
    return get("/daily-quiz/today");
  },

  // Backward-compatible aliases for older engine bundles.
  fetchDailyQuiz() {
    return get("/daily-quiz/today");
  },

  fetchQuizToday() {
    return get("/daily-quiz/today");
  },

  fetchquiztoday() {
    return get("/daily-quiz/today");
  },

  fecthQuizToday() {
    return get("/daily-quiz/today");
  },

  fecthquiztoday() {
    return get("/daily-quiz/today");
  },

  submitDailyQuiz(payload = {}) {
    return post("/daily-quiz/submit", payload);
  },

  startAttempt(payload) {
    return post("/attempts/start", payload);
  },

  answerAttempt(attemptId, questionId, answer) {
    fireAndForget(
      post(`/attempts/${encodeURIComponent(attemptId)}/answer`, {
        questionId,
        answer,
      }),
    );
  },

  finishAttempt(attemptId, answers, durationSeconds = null) {
    fireAndForget(
      post(`/attempts/${encodeURIComponent(attemptId)}/finish`, {
        answers,
        durationSeconds,
      }),
    );
  },

  fetchAttemptHistory(mode = "", limit = 20) {
    const query = toQuery({ mode, limit });
    return get(`/attempts/history${query}`);
  },

  fetchDashboard() {
    return get("/dashboard");
  },

  syncPerformance(event) {
    fireAndForget(post("/sync/performance", event));
  },

  syncSession(entry) {
    fireAndForget(post("/sync/sessions", entry));
  },

  fetchSyncedDashboard() {
    return get("/sync/dashboard");
  },

  fetchSyncedHistory(mode) {
    const query = mode ? `?mode=${encodeURIComponent(mode)}` : "";
    return get(`/sync/history${query}`);
  },

  fetchDailyLeaderboard(limit = 10, date = "") {
    const query = toQuery({ limit, date });
    return get(`/sync/leaderboard${query}`);
  },

  fetchQuestionInsights(questionId) {
    const id = Number(questionId);
    if (!Number.isFinite(id) || id <= 0) {
      return Promise.resolve({
        ok: false,
        questionId: 0,
        sampleSize: 0,
        distribution: [],
        wrongOptionNotes: [],
      });
    }
    return get(`/questions/${encodeURIComponent(id)}/insights`);
  },

  fetchAiQuota() {
    return get("/ai/quota");
  },

  explainQuestion(payload = {}) {
    return post("/ai/explain", payload);
  },
};

