const storedApiBase = localStorage.getItem("quizApiBase")?.trim();
const isLocalHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const inferredApiBase = isLocalHost
  ? "http://localhost:4000/api"
  : "https://api.ajixpharmacy.online/api";
const hasStaleStoredApiBase =
  !!storedApiBase &&
  (/trycloudflare\.com/i.test(storedApiBase) ||
    /your-new-tunnel/i.test(storedApiBase) ||
    /api\.139\.84\.233\.243\.sslip\.io/i.test(storedApiBase));
if (hasStaleStoredApiBase) {
  localStorage.removeItem("quizApiBase");
}
const API_BASE = hasStaleStoredApiBase ? inferredApiBase : storedApiBase || inferredApiBase;
      const ADMIN_KEY_STORAGE = "adminKey";
      let adminKey = localStorage.getItem(ADMIN_KEY_STORAGE);
      let editingQuestionId = null;
      let cachedQuestions = [];

      function escapeHtml(value) {
        return String(value ?? "")
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")
          .replaceAll('"', "&quot;")
          .replaceAll("'", "&#39;");
      }

      function toCorrectOptionIndex(question) {
        const options = Array.isArray(question?.options) ? question.options : [];
        const rawCorrect = question?.correct;

        if (Number.isInteger(rawCorrect) && rawCorrect >= 0 && rawCorrect < options.length) {
          return rawCorrect;
        }

        if (typeof rawCorrect === "string" && rawCorrect.trim()) {
          const byTextIndex = options.indexOf(rawCorrect);
          if (byTextIndex >= 0) {
            return byTextIndex;
          }
        }

        const numeric = Number(rawCorrect);
        if (Number.isInteger(numeric) && numeric >= 0 && numeric < options.length) {
          return numeric;
        }

        return 0;
      }

      function normalizeOptionalSlug(value) {
        const next = String(value || "")
          .trim()
          .toLowerCase()
          .replace(/_/g, "-")
          .replace(/\s+/g, "-");
        return next;
      }

      function displayValue(value) {
        const next = String(value ?? "").trim();
        return next || "--";
      }

      function formatDate(value) {
        if (!value) return "--";
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return "--";
        return parsed.toLocaleString();
      }

      function getCorrectDisplay(question) {
        const options = Array.isArray(question?.options) ? question.options : [];
        if (!options.length) {
          return { index: null, text: String(question?.correct || "").trim() || "--" };
        }

        const byIndex = toCorrectOptionIndex(question);
        const text = options[byIndex] || String(question?.correct || "").trim() || "--";
        const index = options[byIndex] ? byIndex : null;

        return { index, text };
      }

      function getHeaders() {
        return {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        };
      }

      function showAlert(containerId, message, type = "info") {
        const container = document.getElementById(containerId);
        if (!container) {
          console.warn(`Missing alert container: ${containerId}`);
          return;
        }
        const alert = document.createElement("div");
        alert.className = `alert ${type}`;
        alert.textContent = message;
        container.innerHTML = "";
        container.appendChild(alert);
      }

      function setAdminKeyVisibility(visible) {
        const passwordInput = document.getElementById("admin-key");
        const toggleBtn = document.querySelector(".password-toggle");
        if (!passwordInput || !toggleBtn) return;

        const show = Boolean(visible);
        passwordInput.type = show ? "text" : "password";
        toggleBtn.setAttribute("aria-label", show ? "Hide admin key" : "Show admin key");
        toggleBtn.setAttribute("aria-pressed", show ? "true" : "false");

        const eyeIcon = toggleBtn.querySelector(".icon-eye");
        const eyeOffIcon = toggleBtn.querySelector(".icon-eye-off");
        if (eyeIcon) eyeIcon.classList.toggle("hidden", show);
        if (eyeOffIcon) eyeOffIcon.classList.toggle("hidden", !show);
      }

      function togglePasswordVisibility() {
        const passwordInput = document.getElementById("admin-key");
        if (!passwordInput) return;
        setAdminKeyVisibility(passwordInput.type === "password");
      }

      async function login() {
        adminKey = document.getElementById("admin-key").value.trim();
        if (!adminKey) {
          alert("Please enter admin key");
          return;
        }

        try {
          // Validate the key against a protected admin endpoint.
          const res = await fetch(`${API_BASE}/admin/stats`, {
            headers: getHeaders(),
          });

          if (res.ok) {
            localStorage.setItem(ADMIN_KEY_STORAGE, adminKey);
            document.getElementById("login-screen").style.display = "none";
            document.getElementById("dashboard").classList.add("active");
            refreshData();
          } else {
            alert("Invalid admin key");
          }
        } catch (err) {
          alert("Failed to connect to backend: " + err.message);
        }
      }

      function logout() {
        localStorage.removeItem(ADMIN_KEY_STORAGE);
        adminKey = null;
        document.getElementById("login-screen").style.display = "block";
        document.getElementById("dashboard").classList.remove("active");
        document.getElementById("admin-key").value = "";
        setAdminKeyVisibility(false);
      }

      async function refreshData() {
        const refreshBtn = document.getElementById("refresh-data-btn");
        const originalText = refreshBtn?.textContent || "Refresh";

        if (refreshBtn) {
          refreshBtn.disabled = true;
          refreshBtn.textContent = "Refreshing...";
        }

        const [statsOk, usersOk, questionsOk, exportOk] = await Promise.all([
          loadStats(),
          loadUsers(),
          loadQuestions(),
          loadExportData(),
        ]);

        if (statsOk && usersOk && questionsOk && exportOk) {
          showAlert("stats-alerts", "Dashboard refreshed successfully", "success");
        } else {
          showAlert(
            "stats-alerts",
            "Refresh completed with some errors. Check active tab alerts.",
            "info",
          );
        }

        if (refreshBtn) {
          refreshBtn.disabled = false;
          refreshBtn.textContent = originalText;
        }
      }

      async function loadStats() {
        try {
          const res = await fetch(`${API_BASE}/admin/stats`, {
            headers: getHeaders(),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || `Failed to load stats (${res.status})`);
          }
          const data = await res.json();

          document.getElementById("stat-users").textContent = data.totalUsers;
          document.getElementById("stat-questions").textContent =
            data.totalQuestions;
          document.getElementById("stat-attempts").textContent =
            data.totalAttempts;
          document.getElementById("stat-categories").textContent =
            data.totalCategories;
          document.getElementById("stat-avg-score").textContent =
            data.averageScore + "%";
          document.getElementById("stat-sync-events").textContent =
            data.totalSyncEvents;

          const catPerf = document.getElementById("category-performance");
          catPerf.innerHTML = "";
          const categoryRows = Array.isArray(data.categories)
            ? data.categories
                .map((cat) => {
                  if (typeof cat === "string") {
                    return {
                      category: cat.trim(),
                      attempts: 0,
                      correct: 0,
                      accuracy: null,
                    };
                  }
                  const rawAccuracy = Number(cat?.accuracy);
                  return {
                    category: String(cat?.category || "").trim(),
                    attempts: Number(cat?.attempts) || 0,
                    correct: Number(cat?.correct) || 0,
                    accuracy: Number.isFinite(rawAccuracy) ? rawAccuracy : null,
                  };
                })
                .filter((row) => row.category.length > 0)
            : [];

          if (categoryRows.length === 0) {
            catPerf.innerHTML =
              '<div style="background: white; padding: 15px; border-radius: 5px; color: #666;">No categories found.</div>';
          } else {
            categoryRows.forEach((row) => {
              const hasAccuracy = Number.isFinite(row.accuracy);
              const safePercent = hasAccuracy
                ? Math.max(0, Math.min(100, Number(row.accuracy)))
                : 0;
              const safeCategory = escapeHtml(row.category);
              const safeCorrect = Number(row.correct) || 0;
              const safeAttempts = Number(row.attempts) || 0;
              const scoreText = hasAccuracy
                ? `${safePercent}% (${safeCorrect}/${safeAttempts})`
                : "No attempt data yet";
              const barText = hasAccuracy ? `${safePercent}%` : "--";

              const div = document.createElement("div");
              div.style.marginBottom = "15px";
              div.style.background = "white";
              div.style.padding = "15px";
              div.style.borderRadius = "5px";
              div.innerHTML = `
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <strong style="color: #333;">${safeCategory}</strong>
                                <span style="color: #667eea; font-weight: 600;">${scoreText}</span>
                            </div>
                            <div class="accuracy-bar">
                                <div class="accuracy-fill" style="width: ${safePercent}%">${barText}</div>
                            </div>
                        `;
              catPerf.appendChild(div);
            });
          }
          return true;
        } catch (err) {
          console.error("Failed to load stats:", err);
          showAlert("stats-alerts", "Failed to load statistics", "error");
          return false;
        }
      }

      async function loadUsers() {
        try {
          const res = await fetch(`${API_BASE}/admin/users`, {
            headers: getHeaders(),
          });
          const data = await res.json();
          if (!res.ok || !Array.isArray(data.users)) {
            throw new Error(data.error || "Failed to load users");
          }

          const tbody = document.getElementById("users-table");
          tbody.innerHTML = "";

          if (data.users.length === 0) {
            tbody.innerHTML =
              '<tr><td colspan="12" style="text-align: center; color: #ccc;">No users yet</td></tr>';
            return true;
          }

          data.users.forEach((user) => {
            const tr = document.createElement("tr");
            const safeId = escapeHtml(displayValue(user.id));
            const safeName = escapeHtml(displayValue(user.name));
            const safeUsername = escapeHtml(displayValue(user.username));
            const safeContact = escapeHtml(displayValue(user.contact));
            const safeEmail = escapeHtml(displayValue(user.email));
            const safeRole = escapeHtml(displayValue(user.role));
            const safeProfessionalType = escapeHtml(
              displayValue(user.professionalType),
            );
            const safeCountry = escapeHtml(displayValue(user.country));
            const safeInstitution = escapeHtml(displayValue(user.institution));
            const safeCreatedDate = escapeHtml(formatDate(user.createdAt));
            const safeProfileImage = escapeHtml(String(user.profileImage || "").trim());
            const initials = escapeHtml(
              String(user.name || user.username || "U")
                .trim()
                .slice(0, 2)
                .toUpperCase() || "U",
            );
            const avatarMarkup = safeProfileImage
              ? `<img class="user-avatar" src="${safeProfileImage}" alt="Avatar of ${safeUsername}" loading="lazy" referrerpolicy="no-referrer" />`
              : `<span class="user-avatar-fallback">${initials}</span>`;
            tr.innerHTML = `
                        <td>${safeId}</td>
                        <td class="user-avatar-cell">${avatarMarkup}</td>
                        <td class="cell-wrap">${safeName}</td>
                        <td>${safeUsername}</td>
                        <td>${safeContact}</td>
                        <td>${safeEmail}</td>
                        <td>${safeRole}</td>
                        <td>${safeProfessionalType}</td>
                        <td>${safeCountry}</td>
                        <td class="cell-wrap">${safeInstitution}</td>
                        <td>${safeCreatedDate}</td>
                        <td>
                            <div class="actions">
                                <button class="btn-small danger" data-action="delete-user" data-user-id="${safeId}">Delete</button>
                            </div>
                        </td>
                    `;
            tbody.appendChild(tr);
          });
          return true;
        } catch (err) {
          console.error("Failed to load users:", err);
          showAlert("users-alerts", "Failed to load users", "error");
          return false;
        }
      }

      async function loadQuestions() {
        try {
          const res = await fetch(`${API_BASE}/admin/questions`, {
            headers: getHeaders(),
          });
          const data = await res.json();
          if (!res.ok || !Array.isArray(data.questions)) {
            throw new Error(data.error || "Failed to load questions");
          }
          cachedQuestions = data.questions;

          const tbody = document.getElementById("questions-table");
          tbody.innerHTML = "";

          if (data.questions.length === 0) {
            tbody.innerHTML =
              '<tr><td colspan="6" style="text-align: center; color: #ccc;">No questions yet</td></tr>';
            return true;
          }

          data.questions.forEach((q) => {
            const tr = document.createElement("tr");
            const options = Array.isArray(q.options) ? q.options : [];
            const { index: correctIndex, text: correctText } = getCorrectDisplay(q);
            const safeId = escapeHtml(q.id);
            const safeText = escapeHtml(String(q.text || ""));
            const safeCategory = escapeHtml(displayValue(q.category));
            const safeTopic = escapeHtml(q.topicSlug || "");
            const safeSection = escapeHtml(q.sectionId || "");
            const safeCorrectText = escapeHtml(correctText);
            const safeCorrectIndex =
              Number.isInteger(correctIndex) ? String(correctIndex) : null;
            const optionsMarkup = options.length
              ? options
                  .map((opt, idx) => {
                    const line = `${idx}. ${escapeHtml(String(opt || ""))}`;
                    const isCorrect =
                      safeCorrectIndex !== null && String(idx) === safeCorrectIndex;
                    return `<div class="${isCorrect ? "is-correct" : ""}">${line}</div>`;
                  })
                  .join("")
              : "<div>--</div>";

            tr.innerHTML = `
                        <td>${safeId}</td>
                        <td class="cell-wrap">${safeText}</td>
                        <td>
                          <span class="category-chip">${safeCategory}</span>
                          ${safeTopic ? `<div style="font-size:12px;color:#64748b;margin-top:6px;">topic: ${safeTopic}${safeSection ? `#${safeSection}` : ""}</div>` : ""}
                        </td>
                        <td><div class="question-options-list">${optionsMarkup}</div></td>
                        <td class="cell-wrap">${safeCorrectIndex !== null ? `${safeCorrectIndex}. ${safeCorrectText}` : safeCorrectText}</td>
                        <td>
                            <div class="actions">
                                <button class="btn-small" data-action="edit-question" data-question-id="${safeId}">Edit</button>
                                <button class="btn-small danger" data-action="delete-question" data-question-id="${safeId}">Delete</button>
                            </div>
                        </td>
                    `;
            tbody.appendChild(tr);
          });
          return true;
        } catch (err) {
          console.error("Failed to load questions:", err);
          showAlert("questions-alerts", "Failed to load questions", "error");
          return false;
        }
      }

      async function loadExportData() {
        try {
          const res = await fetch(`${API_BASE}/admin/stats`, {
            headers: getHeaders(),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || `Failed to load export stats (${res.status})`);
          }
          const data = await res.json();

          document.getElementById("export-users").textContent = data.totalUsers;
          document.getElementById("export-questions").textContent =
            data.totalQuestions;
          document.getElementById("export-attempts").textContent =
            data.totalAttempts;
          document.getElementById("export-sync").textContent =
            data.totalSyncEvents;
          return true;
        } catch (err) {
          console.error("Failed to load export data:", err);
          showAlert("export-alerts", "Failed to load export summary", "error");
          return false;
        }
      }

      async function deleteUser(userId) {
        if (!confirm("Delete this user? This action cannot be undone.")) return;

        try {
          const safeUserId = encodeURIComponent(userId);
          const res = await fetch(`${API_BASE}/admin/users/${safeUserId}`, {
            method: "DELETE",
            headers: getHeaders(),
          });

          if (res.ok) {
            showAlert("users-alerts", "User deleted successfully", "success");
            loadUsers();
          } else {
            showAlert("users-alerts", "Failed to delete user", "error");
          }
        } catch (err) {
          showAlert("users-alerts", "Error: " + err.message, "error");
        }
      }

      async function deleteQuestion(questionId) {
        if (!confirm("Delete this question? This action cannot be undone."))
          return;

        try {
          const safeQuestionId = encodeURIComponent(questionId);
          const res = await fetch(
            `${API_BASE}/admin/questions/${safeQuestionId}`,
            {
            method: "DELETE",
            headers: getHeaders(),
            },
          );

          if (res.ok) {
            showAlert(
              "questions-alerts",
              "Question deleted successfully",
              "success",
            );
            loadQuestions();
          } else {
            showAlert("questions-alerts", "Failed to delete question", "error");
          }
        } catch (err) {
          showAlert("questions-alerts", "Error: " + err.message, "error");
        }
      }

      function switchTab(tabName, btnEl = null) {
        // Hide all content
        document
          .querySelectorAll(".content")
          .forEach((el) => el.classList.remove("active"));
        document
          .querySelectorAll(".tab-btn")
          .forEach((el) => el.classList.remove("active"));

        // Show selected content
        document.getElementById(tabName).classList.add("active");
        if (btnEl) {
          btnEl.classList.add("active");
          return;
        }
        const activeBtn = document.querySelector(
          `.tab-btn[data-tab="${tabName}"]`,
        );
        if (activeBtn) activeBtn.classList.add("active");
      }

      function openUserModal() {
        document.getElementById("user-modal").classList.add("active");
      }

      function closeUserModal() {
        document.getElementById("user-modal").classList.remove("active");
        document.getElementById("user-name").value = "";
        document.getElementById("user-email").value = "";
        document.getElementById("user-password").value = "";
      }

      async function saveUser() {
        const name = document.getElementById("user-name").value;
        const email = document.getElementById("user-email").value;
        const password = document.getElementById("user-password").value;

        if (!name || !email || !password) {
          alert("All fields required");
          return;
        }

        try {
          const res = await fetch(`${API_BASE}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
          });

          if (res.ok) {
            showAlert("users-alerts", "User created successfully", "success");
            closeUserModal();
            loadUsers();
          } else {
            const data = await res.json();
            showAlert(
              "users-alerts",
              data.error || "Failed to create user",
              "error",
            );
          }
        } catch (err) {
          showAlert("users-alerts", "Error: " + err.message, "error");
        }
      }

      function openQuestionModal() {
        editingQuestionId = null;
        document.getElementById("question-modal-title").textContent =
          "Add Question";
        document.getElementById("question-save-btn").textContent =
          "Create Question";
        document.getElementById("question-modal").classList.add("active");
      }

      function closeQuestionModal() {
        editingQuestionId = null;
        document.getElementById("question-modal-title").textContent =
          "Add Question";
        document.getElementById("question-save-btn").textContent =
          "Create Question";
        document.getElementById("question-modal").classList.remove("active");
        document.getElementById("q-text").value = "";
        document.getElementById("q-category").value = "";
        document.getElementById("q-topic-slug").value = "";
        document.getElementById("q-section-id").value = "";
        document.getElementById("q-correct").value = "";
        document.querySelectorAll(".q-option").forEach((el) => (el.value = ""));
      }

      async function editQuestion(questionId) {
        let question = cachedQuestions.find((q) => String(q.id) === String(questionId));

        if (!question) {
          const res = await fetch(`${API_BASE}/admin/questions`, {
            headers: getHeaders(),
          });
          const data = await res.json();
          if (!res.ok || !Array.isArray(data.questions)) {
            alert(data.error || "Failed to load questions");
            return;
          }
          cachedQuestions = data.questions;
          question = cachedQuestions.find((q) => String(q.id) === String(questionId));
        }

        if (!question) {
          alert("Question not found");
          return;
        }

        editingQuestionId = String(question.id);
        document.getElementById("question-modal-title").textContent =
          "Edit Question";
        document.getElementById("question-save-btn").textContent =
          "Update Question";
        document.getElementById("question-modal").classList.add("active");

        document.getElementById("q-text").value = question.text || "";
        document.getElementById("q-category").value = question.category || "";
        document.getElementById("q-topic-slug").value = question.topicSlug || "";
        document.getElementById("q-section-id").value = question.sectionId || "";
        document.getElementById("q-correct").value = toCorrectOptionIndex(question);

        const optionEls = document.querySelectorAll(".q-option");
        optionEls.forEach((el, index) => {
          el.value = Array.isArray(question.options) ? question.options[index] || "" : "";
        });
      }

      async function saveQuestion() {
        const text = document.getElementById("q-text").value;
        const category = document.getElementById("q-category").value;
        const topicSlug = normalizeOptionalSlug(
          document.getElementById("q-topic-slug").value,
        );
        const sectionId = normalizeOptionalSlug(
          document.getElementById("q-section-id").value,
        );
        const correct = parseInt(document.getElementById("q-correct").value);
        const options = [];

        document.querySelectorAll(".q-option").forEach((el) => {
          if (el.value) options.push(el.value);
        });

        if (!text || !category || options.length < 2 || isNaN(correct)) {
          alert("Fill all fields. Need at least 2 options.");
          return;
        }
        if (correct < 0 || correct >= options.length) {
          alert("Correct answer index must match one of the provided options.");
          return;
        }

        try {
          const isEdit = Boolean(editingQuestionId);
          const endpoint = isEdit
            ? `${API_BASE}/admin/questions/${encodeURIComponent(editingQuestionId)}`
            : `${API_BASE}/admin/questions`;
          const method = isEdit ? "PUT" : "POST";
          const payload = { text, category, options, correct };
          if (topicSlug) {
            payload.topicSlug = topicSlug;
          }
          if (sectionId) {
            payload.sectionId = sectionId;
          }
          const res = await fetch(endpoint, {
            method,
            headers: getHeaders(),
            body: JSON.stringify(payload),
          });

          if (res.ok) {
            showAlert(
              "questions-alerts",
              isEdit
                ? "Question updated successfully"
                : "Question created successfully",
              "success",
            );
            closeQuestionModal();
            loadQuestions();
          } else {
            const data = await res.json();
            showAlert(
              "questions-alerts",
              data.error || "Failed to create question",
              "error",
            );
          }
        } catch (err) {
          showAlert("questions-alerts", "Error: " + err.message, "error");
        }
      }

      async function exportData(format) {
        try {
          const res = await fetch(`${API_BASE}/admin/export?format=${format}`, {
            headers: getHeaders(),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || `Export failed (${res.status})`);
          }

          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          const ext = format === "csv" ? "csv" : "json";
          a.href = url;
          a.download = `pharmacy-quiz-export-${new Date().toISOString().slice(0, 10)}.${ext}`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        } catch (err) {
          showAlert("export-alerts", "Export failed: " + err.message, "error");
        }
      }

      async function seedQuestions() {
        const force = confirm(
          "Use FORCE reseed?\nOK = replace all existing questions from Quiz/data.js\nCancel = seed only if questions table is empty",
        );

        try {
          const res = await fetch(`${API_BASE}/admin/seed-questions`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ force }),
          });

          const data = await res.json();
          if (data.seeded) {
            const detail = data.replaced
              ? `Replaced ${data.previousCount || 0} existing questions with ${data.count} fresh questions`
              : `Seeded ${data.count} questions`;
            showAlert(
              "settings-alerts",
              detail,
              "success",
            );
            loadQuestions();
            loadStats();
          } else {
            showAlert(
              "settings-alerts",
              "Questions already exist. Run force reseed to replace them.",
              "info",
            );
          }
        } catch (err) {
          showAlert("settings-alerts", "Error: " + err.message, "error");
        }
      }

      async function resetSystem() {
        if (
          !confirm(
            "⚠️ This will DELETE all users and attempts. Questions will be re-seeded.",
          )
        )
          return;
        if (!confirm("This action CANNOT be undone. Are you absolutely sure?"))
          return;

        try {
          const res = await fetch(`${API_BASE}/admin/reset`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({
              confirmToken: "RESET_PHARMACY_QUIZ_DATA_CONFIRMED",
            }),
          });

          if (res.ok) {
            showAlert(
              "settings-alerts",
              "System reset successfully",
              "success",
            );
            refreshData();
          } else {
            showAlert("settings-alerts", "Reset failed", "error");
          }
        } catch (err) {
          showAlert("settings-alerts", "Error: " + err.message, "error");
        }
      }

      function setupEventBindings() {
        document
          .getElementById("admin-key-toggle")
          ?.addEventListener("click", togglePasswordVisibility);
        document.getElementById("admin-login-btn")?.addEventListener("click", login);
        document
          .getElementById("refresh-data-btn")
          ?.addEventListener("click", refreshData);
        document.getElementById("logout-btn")?.addEventListener("click", logout);
        document
          .getElementById("add-user-btn")
          ?.addEventListener("click", openUserModal);
        document
          .getElementById("add-question-btn")
          ?.addEventListener("click", openQuestionModal);
        document
          .getElementById("export-json-btn")
          ?.addEventListener("click", () => exportData("json"));
        document
          .getElementById("export-csv-btn")
          ?.addEventListener("click", () => exportData("csv"));
        document
          .getElementById("seed-questions-btn")
          ?.addEventListener("click", seedQuestions);
        document
          .getElementById("reset-system-btn")
          ?.addEventListener("click", resetSystem);
        document
          .getElementById("user-cancel-btn")
          ?.addEventListener("click", closeUserModal);
        document.getElementById("user-save-btn")?.addEventListener("click", saveUser);
        document
          .getElementById("question-cancel-btn")
          ?.addEventListener("click", closeQuestionModal);
        document
          .getElementById("question-save-btn")
          ?.addEventListener("click", saveQuestion);

        document.querySelectorAll(".tab-btn[data-tab]").forEach((button) => {
          button.addEventListener("click", () => {
            switchTab(button.dataset.tab, button);
          });
        });

        document.getElementById("users-table")?.addEventListener("click", (event) => {
          const btn = event.target.closest("button[data-action='delete-user']");
          if (!btn) return;
          const userId = btn.dataset.userId;
          if (userId) {
            deleteUser(userId);
          }
        });

        document
          .getElementById("questions-table")
          ?.addEventListener("click", (event) => {
            const editBtn = event.target.closest(
              "button[data-action='edit-question']",
            );
            if (editBtn?.dataset.questionId) {
              editQuestion(editBtn.dataset.questionId);
              return;
            }

            const deleteBtn = event.target.closest(
              "button[data-action='delete-question']",
            );
            if (deleteBtn?.dataset.questionId) {
              deleteQuestion(deleteBtn.dataset.questionId);
            }
          });

        document.getElementById("admin-key")?.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            login();
          }
        });

        setAdminKeyVisibility(false);
      }

      // Initialize
      setupEventBindings();
      if (adminKey) {
        document.getElementById("login-screen").style.display = "none";
        document.getElementById("dashboard").classList.add("active");
        refreshData();
      }

