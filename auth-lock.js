(() => {
  const AUTH_TOKEN_KEY = "quizAuthToken";
  const DEFAULT_LOGIN_PATH = "index.html";
  const LOGOUT_SELECTORS = ["#menu-logout-confirm-btn", "#quiz-logout-btn"];

  function getLoginPath() {
    const script = document.currentScript;
    const fromData = script?.dataset?.loginUrl || script?.dataset?.loginPath || "";
    return String(window.__AJIX_LOGIN_URL__ || fromData || DEFAULT_LOGIN_PATH).trim() || DEFAULT_LOGIN_PATH;
  }

  function getCurrentPath() {
    return window.location.pathname + window.location.search + window.location.hash;
  }

  function buildLoginUrl() {
    const loginPath = getLoginPath();
    const url = new URL(loginPath, window.location.href);
    const next = getCurrentPath();
    if (next && next !== "/" && next !== "/index.html") {
      url.searchParams.set("next", next);
    }
    return url.toString();
  }

  function hasStoredToken() {
    try {
      return Boolean(String(window.localStorage.getItem(AUTH_TOKEN_KEY) || "").trim());
    } catch {
      return false;
    }
  }

  function isPublicLoginPage() {
    const pathname = String(window.location.pathname || "");
    return pathname === "/" || pathname.endsWith("/index.html") || pathname === "/index.html";
  }

  function redirectToLogin() {
    if (isPublicLoginPage()) {
      return;
    }
    if (!hasStoredToken()) {
      window.location.replace(buildLoginUrl());
    }
  }

  function clearAuthState() {
    try {
      window.localStorage.removeItem(AUTH_TOKEN_KEY);
      window.localStorage.removeItem("adminKey");
    } catch {
      // Ignore storage failures during logout cleanup.
    }
  }

  async function callLogoutEndpoint() {
    if (window.location.protocol !== "http:" && window.location.protocol !== "https:") {
      return;
    }

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
    } catch {
      // Ignore network failures and fall back to client-side cleanup.
    }
  }

  async function logout() {
    await callLogoutEndpoint();
    clearAuthState();
    window.location.replace(buildLoginUrl());
  }

  function bindLogoutButtons() {
    document.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) {
        return;
      }

      const matchesLogout = LOGOUT_SELECTORS.some((selector) => target.closest(selector));
      if (!matchesLogout) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      void logout();
    }, true);
  }

  redirectToLogin();
  bindLogoutButtons();
  window.AJIXAuthLock = { ensure: redirectToLogin, logout };
})();
