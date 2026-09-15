(() => {
  "use strict";

  const stateKey = "ajix-question-review-state-v1";
  const isReviewPage = /question-review\.html$/i.test(location.pathname);
  const isQuestionApi = (url) => /\/api\/admin\/questions(?:\/|$)/i.test(String(url || ""));

  function readState() {
    try {
      const value = JSON.parse(sessionStorage.getItem(stateKey) || "null");
      return value && typeof value === "object" ? value : null;
    } catch {
      return null;
    }
  }

  function saveState(viewQuestionId = "") {
    if (!isReviewPage) return;
    const active = document.querySelector("[data-qa-filter].active");
    const search = document.querySelector("[data-qa-search]");
    const sort = document.querySelector("[data-qa-sort]");
    const tableScroll = document.querySelector(".ajx-table-scroll");
    const rows = [...document.querySelectorAll("[data-question-row]")]
      .map((row) => row.getAttribute("data-question-row"))
      .filter(Boolean);
    const label = String(sort?.textContent || "");
    sessionStorage.setItem(stateKey, JSON.stringify({
      filter: active?.dataset.qaFilter || "all",
      search: search?.value || "",
      ascending: label.indexOf("1") < label.indexOf("last"),
      order: rows,
      viewQuestionId: String(viewQuestionId || ""),
      windowScroll: window.scrollY || 0,
      tableScroll: tableScroll?.scrollTop || 0,
      savedAt: Date.now(),
    }));
  }

  function restoreState() {
    const state = readState();
    if (!state || Date.now() - Number(state.savedAt || 0) > 30 * 60 * 1000) return;

    const viewQuestionId = String(state.viewQuestionId || "");
    const filterValue = String(state.filter || "all");
    const tab = [...document.querySelectorAll("[data-qa-filter]")]
      .find((item) => item.dataset.qaFilter === filterValue);
    const search = document.querySelector("[data-qa-search]");
    const sort = document.querySelector("[data-qa-sort]");
    if (search && search.value !== String(state.search || "")) {
      search.value = String(state.search || "");
      search.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (tab && !tab.classList.contains("active")) tab.click();

    const desiredAscending = state.ascending !== false;
    const label = String(sort?.textContent || "");
    const currentAscending = label.indexOf("1") < label.indexOf("last");
    if (sort && currentAscending !== desiredAscending) sort.click();

    const body = document.querySelector("[data-qa-body]");
    if (body && Array.isArray(state.order) && state.order.length) {
      const rows = new Map([...body.querySelectorAll("[data-question-row]")]
        .map((row) => [row.getAttribute("data-question-row"), row]));
      state.order.forEach((id) => {
        const row = rows.get(String(id));
        if (row) body.appendChild(row);
      });
    }

    requestAnimationFrame(() => {
      const tableScroll = document.querySelector(".ajx-table-scroll");
      if (tableScroll) tableScroll.scrollTop = Number(state.tableScroll || 0);
      window.scrollTo(0, Number(state.windowScroll || 0));
      if (viewQuestionId) {
        setTimeout(() => {
          const button = [...document.querySelectorAll("[data-view]")]
            .find((item) => String(item.dataset.view) === viewQuestionId);
          if (button) button.click();
        }, 0);
      }
    });
    sessionStorage.removeItem(stateKey);
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href*="question-edit.html"]');
    if (link) {
      let viewQuestionId = "";
      if (document.querySelector("#ajxModal.open")) {
        try {
          viewQuestionId = new URL(link.href, location.href).searchParams.get("id") || "";
        } catch {}
      }
      saveState(viewQuestionId);
    }
  }, true);

  // Store the selected option text, not a transient UI index. This keeps the
  // saved answer stable when the editor rebuilds the option controls.
  const nativeFetch = window.fetch.bind(window);
  window.fetch = (input, init = {}) => {
    const method = String(init.method || (input && input.method) || "GET").toUpperCase();
    if (isQuestionApi(input?.url || input) && ["POST", "PUT", "PATCH"].includes(method) && init.body) {
      try {
        const body = JSON.parse(init.body);
        if (Array.isArray(body.options) && Number.isInteger(Number(body.correct))) {
          const index = Number(body.correct);
          if (index >= 0 && index < body.options.length) body.correct = body.options[index];
        }
        init = { ...init, body: JSON.stringify(body) };
      } catch {
        // Let the original request report malformed payloads normally.
      }
    }
    return nativeFetch(input, init);
  };

  if (isReviewPage) {
    let attempts = 0;
    const waitForRows = () => {
      const body = document.querySelector("[data-qa-body]");
      if (body && (body.children.length > 0 || attempts >= 80)) {
        restoreState();
        return;
      }
      attempts += 1;
      setTimeout(waitForRows, 100);
    };
    window.addEventListener("load", () => setTimeout(waitForRows, 50), { once: true });
  }
})();