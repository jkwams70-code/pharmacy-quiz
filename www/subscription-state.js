/* Canonical AJIX subscription client. It reads only /api/auth/entitlement. */
(() => {
  "use strict";
  const TOKEN_KEY = "quizAuthToken";
  const REQUEST_TIMEOUT_MS = 8000;
  let state = null;
  let inFlight = null;
  const listeners = new Set();

  function apiBase() {
    const host = String(location.hostname || "").toLowerCase();
    const isLocalHost = host === "localhost" || host === "127.0.0.1" || host === "::1";
    // Local development must never inherit a production API base from a prior session.
    if (isLocalHost) return "http://127.0.0.1:4000/api";
    let stored = "";
    try { stored = String(localStorage.getItem("quizApiBase") || "").trim().replace(/\/+$/, ""); } catch {}
    if (stored) {
      try {
        const parsed = new URL(stored);
        if (/ajixpharmacy\.online$/i.test(parsed.hostname)) return stored;
      } catch {}
    }
    if (/ajixpharmacy\.online$/i.test(host)) return "https://api.ajixpharmacy.online/api";
    return location.origin + "/api";
  }  function token() {
    try { return String(localStorage.getItem(TOKEN_KEY) || "").trim(); } catch { return ""; }
  }
  function normalize(snapshot) {
    if (!snapshot?.subscription) return null;
    const subscription = { ...snapshot.subscription };
    const expiration = Date.parse(String(subscription.expirationAt || ""));
    const status = String(subscription.status || "").toLowerCase();
    subscription.isActive = subscription.isActive === true &&
      (!Number.isFinite(expiration) || Date.now() < expiration);
    subscription.isLocked = !subscription.isActive;
    return { ...snapshot, subscription, checkedAt: snapshot.checkedAt || new Date().toISOString() };
  }
  function emit(next) {
    state = normalize(next);
    listeners.forEach((listener) => { try { listener(state); } catch {} });
  }
  async function request() {
    const authToken = token();
    if (!authToken) { emit(null); return null; }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(apiBase() + "/auth/entitlement", {
        cache: "no-store",
        credentials: "include",
        signal: controller.signal,
        headers: { Accept: "application/json", Authorization: "Bearer " + authToken },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.subscription) {
        const error = new Error(payload?.error || "Subscription entitlement unavailable.");
        error.status = response.status;
        throw error;
      }
      emit(payload);
      return state;
    } finally { clearTimeout(timer); }
  }
  function get({ fresh = true } = {}) {
    if (inFlight) return inFlight;
    if (!fresh && state) return Promise.resolve(state);
    inFlight = request().finally(() => { inFlight = null; });
    return inFlight;
  }
  function clear() { emit(null); }
  function subscribe(listener) {
    if (typeof listener !== "function") return () => {};
    listeners.add(listener);
    if (state) listener(state);
    return () => listeners.delete(listener);
  }
  window.AJIXSubscription = {
    get, refresh: () => get({ fresh: true }), clear, subscribe,
    getState: () => state,
    getAccess: () => state?.subscription || null,
    isActive: () => state?.subscription?.isActive === true,
    require: async (feature = "feature") => {
      const snapshot = await get();
      if (snapshot?.subscription?.isActive === true) return snapshot.subscription;
      const error = new Error("An active subscription is required for " + feature + ".");
      error.code = "SUBSCRIPTION_REQUIRED";
      throw error;
    },
  };
})();
