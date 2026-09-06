(() => {
  const DEFAULT_BACK_URL = "index.html?screen=extra-screen";

  function getBackUrl() {
    const script = document.currentScript;
    return String(script?.dataset?.backUrl || window.__AJIX_STANDALONE_BACK_URL__ || DEFAULT_BACK_URL).trim() || DEFAULT_BACK_URL;
  }

  function isNativeApp() {
    try {
      return Boolean(
        window.Capacitor?.isNativePlatform?.() ||
        ["android", "ios"].includes(String(window.Capacitor?.getPlatform?.() || "").toLowerCase())
      );
    } catch {
      return false;
    }
  }

  function goBackToAppShell() {
    const target = new URL(getBackUrl(), window.location.href);
    window.location.href = target.toString();
  }

  function registerNativeBack() {
    const appPlugin = window.Capacitor?.Plugins?.App;
    if (!isNativeApp() || !appPlugin || typeof appPlugin.addListener !== "function") return;

    appPlugin.addListener("backButton", () => {
      if (window.history.length > 1) {
        window.history.back();
        return;
      }
      goBackToAppShell();
    });
  }

  registerNativeBack();
  window.AJIXStandaloneBack = { goBack: goBackToAppShell };
})();
