(function () {
  const ADMIN_KEY_STORAGE = "adminKey";
  const currentPath = window.location.pathname + window.location.search + window.location.hash;

  function hasAdminKey() {
    try {
      return Boolean(String(window.localStorage.getItem(ADMIN_KEY_STORAGE) || "").trim());
    } catch {
      return false;
    }
  }

  function redirectToAdminLogin() {
    const loginUrl = new URL("index.html", window.location.href);
    if (currentPath && !/\/admin\/?(?:index\.html)?(?:[?#].*)?$/i.test(currentPath)) {
      loginUrl.searchParams.set("next", currentPath);
    }
    window.location.replace(loginUrl.toString());
  }

  if (!hasAdminKey()) {
    redirectToAdminLogin();
  }
})();
