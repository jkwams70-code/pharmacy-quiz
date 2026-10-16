(function () {
  // The question editor is a classic script and reads this value during
  // initialization. The taxonomy module loads later, so provide the same
  // canonical list synchronously as a bootstrap fallback.
  if (!Array.isArray(window.AJIX_CANONICAL_CATEGORIES)) {
    window.AJIX_CANONICAL_CATEGORIES = [
      "Cardiovascular Disorders",
      "Infectious Diseases",
      "Endocrinology",
      "Respiratory Disorders",
      "Renal & Electrolyte Disorders",
      "Gastrointestinal Disorders",
      "Neurology & Psychiatry",
      "Hematology",
      "Oncology",
      "Rheumatology & Pain",
      "Women's & Men's Health",
      "Immunizations",
      "Manufacturing and Calculation",
      "Pharmacy Practice",
      "Pharmacy Law & Ethics",
      "Research",
    ];
  }

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
  } else if (!document.querySelector('script[data-ajix-table-scroll]')) {
    const tableScrollScript = document.createElement("script");
    tableScrollScript.src = "/table-scroll.js?v=20261015-table-scroll4";
    tableScrollScript.dataset.ajixTableScroll = "true";
    document.head.appendChild(tableScrollScript);
  }
})();
