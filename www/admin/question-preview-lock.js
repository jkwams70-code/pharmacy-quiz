(function () {
  "use strict";

  const apiBase = String(localStorage.getItem("quizApiBase") || "/api").replace(/\/+$/, "");

  fetch(apiBase + "/health", { cache: "no-store" })
    .then(function (response) {
      if (response.headers.get("X-AJIX-Question-Preview") !== "true") return;

      const banner = document.createElement("div");
      banner.textContent = "LOCAL PREVIEW — corrected 2023 question batch (read-only)";
      banner.style.cssText = "position:sticky;top:0;z-index:9999;padding:10px 16px;background:#fff3cd;color:#664d03;border-bottom:1px solid #ffda6a;font:600 14px system-ui;text-align:center";
      document.body.insertBefore(banner, document.body.firstChild);

      ["btnSave", "btnCorrect", "btnQuarantine"].forEach(function (id) {
        const button = document.getElementById(id);
        if (button) {
          button.disabled = true;
          button.title = "Preview mode is read-only";
        }
      });

      document.addEventListener("click", function (event) {
        const button = event.target.closest("#btnSave, #btnCorrect, #btnQuarantine, [data-modal-transition]");
        if (button) {
          event.preventDefault();
          event.stopPropagation();
        }
      }, true);
    })
    .catch(function () {});
}());