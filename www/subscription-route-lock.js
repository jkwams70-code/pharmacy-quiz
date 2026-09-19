(() => {
  const loginPath = "/index.html";
  const isLogin = /(^|\/)index\.html$/.test(window.location.pathname) || window.location.pathname === "/";
  if (isLogin || !window.AJIXSubscription) return;
  let redirected = false;
  let verificationEl = null;
  const redirect = () => {
    if (redirected) return;
    redirected = true;
    const next = window.location.pathname + window.location.search + window.location.hash;
    const url = new URL(loginPath, window.location.href);
    url.searchParams.set("screen", "subscription-screen");
    if (next && next !== "/") url.searchParams.set("return", next);
    window.location.replace(url.toString());
  };
  function showVerificationState(message) {
    if (!verificationEl) {
      verificationEl = document.createElement("div");
      verificationEl.style.cssText = "position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;background:#f5f8fc;color:#0f3f7f;font:600 16px Inter,Arial,sans-serif;text-align:center;padding:24px";
      document.documentElement.appendChild(verificationEl);
    }
    verificationEl.textContent = message;
  }
  function clearVerificationState() {
    verificationEl?.remove();
    verificationEl = null;
  }
  async function verify() {
    const cached = await window.AJIXSubscription.get({ fresh: false });
    if (cached?.subscription?.isActive === true) {
      clearVerificationState();
      void window.AJIXSubscription.get({ fresh: true });
      return;
    }
    showVerificationState("Loading...");
    try {
      const snapshot = await window.AJIXSubscription.get({ fresh: true });
      clearVerificationState();
      if (snapshot && snapshot.subscription?.isActive !== true) redirect();
    } catch {
      showVerificationState("We are reconnecting to verify your subscription...");
      window.setTimeout(verify, 1500);
    }
  }
  let token = "";
  try { token = String(window.localStorage.getItem("quizAuthToken") || "").trim(); } catch {}
  if (!token) {
    redirect();
    return;
  }
  void verify();
})();
