const API_BASE =
  localStorage.getItem("quizApiBase")?.trim() || "http://localhost:4000/api";

const CLIENT_ID_KEY = "quizClientId";

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

async function post(path, payload) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": getClientId(),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`API request failed (${response.status})`);
  }

  return response.json();
}

async function get(path) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "x-client-id": getClientId(),
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed (${response.status})`);
  }

  return response.json();
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
};
