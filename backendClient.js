const storedApiBase = localStorage.getItem("quizApiBase")?.trim();
const isLocalHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const inferredApiBase = isLocalHost
  ? "http://localhost:4000/api"
  : "https://api.139.84.233.243.sslip.io/api";
const hasStaleStoredApiBase =
  !!storedApiBase &&
  (/trycloudflare\.com/i.test(storedApiBase) || /your-new-tunnel/i.test(storedApiBase));
if (hasStaleStoredApiBase) {
  localStorage.removeItem("quizApiBase");
}
const API_BASE = hasStaleStoredApiBase ? inferredApiBase : storedApiBase || inferredApiBase;

const CLIENT_ID_KEY = "quizClientId";
const AUTH_TOKEN_KEY = "quizAuthToken";

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

  return headers;
}

async function request(method, path, payload = undefined) {
  const useJson = payload !== undefined;
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: buildHeaders(useJson),
    body: useJson ? JSON.stringify(payload) : undefined,
  });

  if (!response.ok) {
    let message = `API request failed (${response.status})`;
    try {
      const body = await response.json();
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
  return response.json();
}

function post(path, payload) {
  return request("POST", path, payload);
}

function put(path, payload) {
  return request("PUT", path, payload);
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

  forgotPassword(payload = {}) {
    return post("/auth/forgot-password", payload);
  },

  resetPassword(payload = {}) {
    return post("/auth/reset-password", payload);
  },

  changePassword(payload = {}) {
    return post("/auth/change-password", payload);
  },

  updateProfile(payload = {}) {
    return put("/auth/profile", payload);
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

  fetchAiQuota() {
    return get("/ai/quota");
  },

  explainQuestion(payload = {}) {
    return post("/ai/explain", payload);
  },
};

