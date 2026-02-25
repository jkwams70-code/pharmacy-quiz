import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.join(__dirname, "..", "..");

dotenv.config({ path: path.join(backendRoot, ".env") });

const EDGE_PATH =
  process.env.EDGE_PATH ||
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const HOST = process.env.UI_SMOKE_HOST || "http://localhost:4000";
const ADMIN_KEY = process.env.UI_SMOKE_ADMIN_KEY || process.env.ADMIN_KEY || "";
const DEBUG_PORT = Number(process.env.UI_SMOKE_DEBUG_PORT || 9229);

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.json();
}

class CdpSession {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);

    await new Promise((resolve, reject) => {
      this.ws.addEventListener("open", () => resolve());
      this.ws.addEventListener("error", (event) => {
        reject(event?.error || new Error("WebSocket connection failed"));
      });
    });

    this.ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);

      if (message.id) {
        const row = this.pending.get(message.id);
        if (!row) return;
        this.pending.delete(message.id);
        if (message.error) {
          row.reject(new Error(message.error.message || "CDP command failed"));
          return;
        }
        row.resolve(message.result);
        return;
      }

      const eventHandlers = this.listeners.get(message.method) || [];
      eventHandlers.forEach((handler) => handler(message.params || {}));
    });
  }

  on(method, handler) {
    const rows = this.listeners.get(method) || [];
    rows.push(handler);
    this.listeners.set(method, rows);
  }

  once(method, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Timeout waiting for CDP event: ${method}`));
      }, timeoutMs);

      const handler = (params) => {
        clearTimeout(timeout);
        const rows = this.listeners.get(method) || [];
        this.listeners.set(
          method,
          rows.filter((row) => row !== handler),
        );
        resolve(params);
      };

      this.on(method, handler);
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    const payload = { id, method, params };

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify(payload));
    });
  }

  async evaluate(expression) {
    const response = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (response?.exceptionDetails) {
      const message =
        response.exceptionDetails.text ||
        response.exceptionDetails.exception?.description ||
        "Runtime.evaluate failed";
      throw new Error(message);
    }
    return response?.result?.value;
  }

  async navigate(url) {
    await this.send("Page.navigate", { url });
    await this.once("Page.loadEventFired");
  }

  async waitForCondition(expression, timeoutMs = 15000) {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      const ok = await this.evaluate(expression);
      if (ok) return true;
      await sleep(150);
    }
    return false;
  }

  async close() {
    if (!this.ws) return;
    this.ws.close();
  }

  async setViewport({ width, height, mobile, deviceScaleFactor = 1 }) {
    await this.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      mobile,
      deviceScaleFactor,
    });
    await this.send("Emulation.setTouchEmulationEnabled", {
      enabled: Boolean(mobile),
      maxTouchPoints: mobile ? 5 : 1,
    });
  }

  async clearViewport() {
    await this.send("Emulation.clearDeviceMetricsOverride");
    await this.send("Emulation.setTouchEmulationEnabled", {
      enabled: false,
      maxTouchPoints: 1,
    });
  }
}

async function waitForDebugger(port, timeoutMs = 20000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const info = await fetchJson(`http://127.0.0.1:${port}/json/list`);
      if (Array.isArray(info) && info.length > 0) {
        return info;
      }
    } catch {
      // Keep retrying until timeout.
    }
    await sleep(200);
  }
  throw new Error("Edge DevTools endpoint did not become ready in time");
}

async function stopProcessTree(pid) {
  await new Promise((resolve) => {
    const killer = spawn("cmd", ["/c", "taskkill", "/PID", String(pid), "/T", "/F"], {
      stdio: "ignore",
    });
    killer.on("exit", () => resolve());
    killer.on("error", () => resolve());
  });
}

async function safeRemoveDirectory(targetPath) {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      await fs.rm(targetPath, { recursive: true, force: true });
      return;
    } catch (error) {
      if (error?.code !== "EBUSY" && error?.code !== "EPERM") {
        return;
      }
      await sleep(250 * attempt);
    }
  }
}

async function main() {
  if (!ADMIN_KEY) {
    throw new Error("UI smoke test requires ADMIN_KEY in environment.");
  }

  await fs.access(EDGE_PATH);

  const profileDir = await fs.mkdtemp(path.join(os.tmpdir(), "quiz-ui-smoke-"));
  const edgeArgs = [
    "--headless=new",
    "--disable-gpu",
    `--remote-debugging-port=${DEBUG_PORT}`,
    "--no-first-run",
    "--no-default-browser-check",
    `--user-data-dir=${profileDir}`,
    "about:blank",
  ];

  const edge = spawn(EDGE_PATH, edgeArgs, { stdio: "ignore" });
  const runtimeErrors = [];
  const jsExceptions = [];

  try {
    const targets = await waitForDebugger(DEBUG_PORT);
    const pageTarget = targets.find((target) => target.type === "page");
    if (!pageTarget?.webSocketDebuggerUrl) {
      throw new Error("No page target available in Edge DevTools.");
    }

    const cdp = new CdpSession(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();

    cdp.on("Runtime.exceptionThrown", (params) => {
      jsExceptions.push(
        JSON.stringify({
          text: params?.exceptionDetails?.text || "Runtime exception",
          url: params?.exceptionDetails?.url || "",
          lineNumber: params?.exceptionDetails?.lineNumber ?? null,
          columnNumber: params?.exceptionDetails?.columnNumber ?? null,
          description:
            params?.exceptionDetails?.exception?.description ||
            params?.exceptionDetails?.exception?.value ||
            "",
        }),
      );
    });
    cdp.on("Log.entryAdded", (params) => {
      const level = params?.entry?.level || "info";
      const text = params?.entry?.text || "";
      if (level === "error") {
        runtimeErrors.push(text);
      }
    });

    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Log.enable");
    await cdp.send("Page.addScriptToEvaluateOnNewDocument", {
      source: `
        window.confirm = () => true;
        window.alert = () => {};
      `,
    });

    console.log("UI smoke: quiz flow");
    await cdp.navigate(`${HOST}/`);

    const enterVisible = await cdp.waitForCondition(
      "!!document.querySelector('#enter-platform-btn')",
    );
    if (!enterVisible) throw new Error("Quiz home button not found.");

    await cdp.evaluate(
      "document.querySelector('#enter-platform-btn')?.click(); true;",
    );
    const authModalShown = await cdp.waitForCondition(
      "document.getElementById('auth-modal') && !document.getElementById('auth-modal').classList.contains('hidden')",
    );
    if (!authModalShown) throw new Error("Auth modal did not open after portal entry.");

    const smokeUserEmail = `ui-quiz-smoke+${Date.now()}@example.com`;
    const smokeUsername = `uismoke${Date.now()}`;
    await cdp.evaluate(`
      (() => {
        document.getElementById('auth-tab-register')?.click();
        document.getElementById('auth-title').value = 'Dr';
        document.getElementById('auth-first-name').value = 'UI';
        document.getElementById('auth-last-name').value = 'Smoke';
        document.getElementById('auth-username').value = ${JSON.stringify(smokeUsername)};
        document.getElementById('auth-contact').value = ${JSON.stringify(smokeUserEmail)};
        const role = document.querySelector('input[name="auth-role"][value="student"]');
        if (role) role.checked = true;
        document.getElementById('auth-professional-type').value = 'Doctor of Pharmacy';
        document.getElementById('auth-country').value = 'United States';
        document.getElementById('auth-institution').value = 'UI Smoke Institute';
        document.getElementById('auth-password').value = 'Strong123';
        document.getElementById('auth-form')?.requestSubmit();
        return true;
      })();
    `);

    const menuShown = await cdp.waitForCondition(
      "document.getElementById('quiz-menu')?.classList.contains('screen-active') === true",
      20000,
    );
    if (!menuShown) throw new Error("Quiz menu did not open after authentication.");

    // Validate dashboard open/close button flow.
    await cdp.evaluate("document.querySelector('.dashboard-mode')?.click(); true;");
    const dashboardShown = await cdp.waitForCondition(
      "document.getElementById('dashboard')?.classList.contains('screen-active') === true",
    );
    if (!dashboardShown) throw new Error("Dashboard did not open from menu.");
    await cdp.evaluate("document.getElementById('dashboard-close-btn')?.click(); true;");
    const dashboardClosed = await cdp.waitForCondition(
      "document.getElementById('quiz-menu')?.classList.contains('screen-active') === true",
    );
    if (!dashboardClosed) throw new Error("Dashboard close button did not return to menu.");

    // Validate exam setup buttons.
    await cdp.evaluate("document.querySelector('.exam-mode')?.click(); true;");
    const examSetupShown = await cdp.waitForCondition(
      "document.getElementById('exam-setup')?.classList.contains('screen-active') === true",
    );
    if (!examSetupShown) throw new Error("Exam setup did not open.");
    await cdp.evaluate("document.getElementById('exam-back-btn')?.click(); true;");
    const examBackWorked = await cdp.waitForCondition(
      "document.getElementById('quiz-menu')?.classList.contains('screen-active') === true",
    );
    if (!examBackWorked) throw new Error("Exam back button did not return to menu.");

    await cdp.evaluate("document.querySelector('.study-mode')?.click(); true;");
    const setupShown = await cdp.waitForCondition(
      "document.getElementById('study-setup')?.classList.contains('screen-active') === true",
    );
    if (!setupShown) throw new Error("Study setup did not open.");

    await cdp.evaluate("document.getElementById('study-history-toggle')?.click(); true;");
    const studyHistoryOpened = await cdp.waitForCondition(
      "!document.getElementById('study-history')?.classList.contains('hidden')",
    );
    if (!studyHistoryOpened) throw new Error("Study history toggle did not open.");

    await cdp.evaluate("document.getElementById('start-study-btn')?.click(); true;");
    const questionVisible = await cdp.waitForCondition(
      "(document.getElementById('question')?.textContent || '').trim().length > 0",
      20000,
    );
    if (!questionVisible) throw new Error("Question text not rendered.");

    const answerClicked = await cdp.evaluate(`
      (() => {
        const btn = document.querySelector('#answers button');
        if (!btn) return false;
        btn.click();
        return true;
      })();
    `);
    if (!answerClicked) throw new Error("No answer button available.");

    await cdp.evaluate("document.getElementById('end-study-btn')?.click(); true;");
    const studyExitVisible = await cdp.waitForCondition(
      "!document.getElementById('study-exit-modal')?.classList.contains('hidden')",
    );
    if (!studyExitVisible) throw new Error("Study exit modal did not open.");

    await cdp.evaluate("document.getElementById('confirm-study-exit-btn')?.click(); true;");
    const resultVisible = await cdp.waitForCondition(
      "document.getElementById('study-result-screen')?.classList.contains('screen-active') === true",
      20000,
    );
    if (!resultVisible) throw new Error("Study result screen did not open.");

    const scoreText = await cdp.evaluate(
      "(document.getElementById('result-score')?.textContent || '').trim()",
    );
    if (!/\d+\s*\/\s*\d+/.test(scoreText)) {
      throw new Error(`Unexpected result score text: ${scoreText}`);
    }

    await cdp.evaluate("document.getElementById('result-menu-btn')?.click(); true;");
    const resultMenuWorked = await cdp.waitForCondition(
      "document.getElementById('quiz-menu')?.classList.contains('screen-active') === true",
    );
    if (!resultMenuWorked) throw new Error("Result menu button did not return to menu.");

    // Full exam flow: setup -> start -> answer -> exit modal cancel/confirm -> result.
    await cdp.evaluate("document.querySelector('.exam-mode')?.click(); true;");
    const examSetupReady = await cdp.waitForCondition(
      "document.getElementById('exam-setup')?.classList.contains('screen-active') === true",
    );
    if (!examSetupReady) throw new Error("Exam setup not reachable for full flow.");

    await cdp.evaluate(`
      (() => {
        const count = document.getElementById('exam-count-select');
        if (count) count.value = '30';
        document.getElementById('start-exam-btn')?.click();
        return true;
      })();
    `);
    const examStarted = await cdp.waitForCondition(
      "document.getElementById('quiz-area')?.classList.contains('screen-active') === true",
      20000,
    );
    if (!examStarted) throw new Error("Exam did not start.");

    const examQuestionReady = await cdp.waitForCondition(
      "(document.getElementById('question')?.textContent || '').trim().length > 0",
      20000,
    );
    if (!examQuestionReady) throw new Error("Exam question did not render.");

    const examAnswerClicked = await cdp.evaluate(`
      (() => {
        const btn = document.querySelector('#answers button');
        if (!btn) return null;
        btn.click();
        return true;
      })();
    `);
    if (examAnswerClicked === false) {
      throw new Error("Exam answer interaction failed.");
    }

    await cdp.evaluate("document.getElementById('back-btn-quiz')?.click(); true;");
    const examExitOpened = await cdp.waitForCondition(
      "!document.getElementById('exam-exit-modal')?.classList.contains('hidden')",
    );
    if (!examExitOpened) throw new Error("Exam exit modal did not open.");

    await cdp.evaluate("document.getElementById('cancel-exit-btn')?.click(); true;");
    const examExitClosed = await cdp.waitForCondition(
      "document.getElementById('exam-exit-modal')?.classList.contains('hidden')",
    );
    if (!examExitClosed) throw new Error("Exam exit modal cancel did not close.");

    await cdp.evaluate("document.getElementById('back-btn-quiz')?.click(); true;");
    const examExitOpenedAgain = await cdp.waitForCondition(
      "!document.getElementById('exam-exit-modal')?.classList.contains('hidden')",
    );
    if (!examExitOpenedAgain) throw new Error("Exam exit modal did not reopen.");

    await cdp.evaluate("document.getElementById('confirm-exit-btn')?.click(); true;");
    const examResultVisible = await cdp.waitForCondition(
      "document.getElementById('study-result-screen')?.classList.contains('screen-active') === true",
      20000,
    );
    if (!examResultVisible) throw new Error("Exam result screen did not open.");

    const examTitle = await cdp.evaluate(
      "(document.getElementById('result-title')?.textContent || '').trim()",
    );
    if (!/Exam Complete/i.test(examTitle)) {
      throw new Error(`Unexpected exam result title: ${examTitle}`);
    }

    await cdp.evaluate("document.getElementById('result-menu-btn')?.click(); true;");
    const examMenuReturn = await cdp.waitForCondition(
      "document.getElementById('quiz-menu')?.classList.contains('screen-active') === true",
    );
    if (!examMenuReturn) throw new Error("Exam result menu button did not return to menu.");

    await cdp.evaluate("document.querySelector('.exam-mode')?.click(); true;");
    const examSetupBack = await cdp.waitForCondition(
      "document.getElementById('exam-setup')?.classList.contains('screen-active') === true",
    );
    if (!examSetupBack) throw new Error("Exam setup not available after exam flow.");

    await cdp.evaluate("document.getElementById('exam-history-toggle')?.click(); true;");
    const examHistoryOpened = await cdp.waitForCondition(
      "!document.getElementById('exam-history')?.classList.contains('hidden')",
    );
    if (!examHistoryOpened) throw new Error("Exam history toggle did not open.");

    await cdp.evaluate("document.getElementById('exam-back-btn')?.click(); true;");
    const examBackToMenu = await cdp.waitForCondition(
      "document.getElementById('quiz-menu')?.classList.contains('screen-active') === true",
    );
    if (!examBackToMenu) throw new Error("Exam back button did not return to menu.");

    console.log("UI smoke: admin flow");
    await cdp.navigate(`${HOST}/admin/`);

    const adminReady = await cdp.waitForCondition(
      "!!document.getElementById('admin-key')",
    );
    if (!adminReady) throw new Error("Admin login form not visible.");

    await cdp.evaluate(`
      (() => {
        localStorage.removeItem('adminKey');
        localStorage.setItem('quizApiBase', ${JSON.stringify(`${HOST}/api`)});
        document.getElementById('admin-key').value = ${JSON.stringify(ADMIN_KEY)};
        return true;
      })();
    `);
    const loginResult = await cdp.evaluate(`
      Promise.resolve()
        .then(() => login())
        .then(() => ({ ok: true }))
        .catch((err) => ({ ok: false, error: String(err) }));
    `);
    if (loginResult && loginResult.ok === false) {
      throw new Error(`Admin login promise rejected: ${loginResult.error}`);
    }

    let dashboardReady = await cdp.waitForCondition(
      "document.getElementById('dashboard')?.classList.contains('active') === true",
      15000,
    );

    if (!dashboardReady) {
      await cdp.evaluate(`
        (() => {
          adminKey = ${JSON.stringify(ADMIN_KEY)};
          localStorage.setItem('adminKey', adminKey);
          document.getElementById('login-screen').style.display = 'none';
          document.getElementById('dashboard').classList.add('active');
          refreshData();
          return true;
        })();
      `);
      dashboardReady = await cdp.waitForCondition(
        "document.getElementById('dashboard')?.classList.contains('active') === true",
        10000,
      );
    }

    if (!dashboardReady) {
      const loginDebug = await cdp.evaluate(`
        (() => ({
          loginScreenDisplay: document.getElementById('login-screen')?.style?.display || '',
          dashboardActive: document.getElementById('dashboard')?.classList?.contains('active') || false,
          adminKeyLength: (document.getElementById('admin-key')?.value || '').length,
          statsText: document.getElementById('stat-users')?.textContent || ''
        }))();
      `);
      throw new Error(`Admin dashboard login failed: ${JSON.stringify(loginDebug)}`);
    }

    const hasStats = await cdp.waitForCondition(
      "Number(document.getElementById('stat-users')?.textContent || '0') > 0",
      15000,
    );
    if (!hasStats) {
      const statsDebug = await cdp.evaluate(`
        (() => {
          return fetch(\`\${API_BASE}/admin/stats\`, { headers: getHeaders() })
            .then(async (res) => {
              let body = null;
              try { body = await res.json(); } catch {}
              return {
                apiBase: API_BASE,
                ok: res.ok,
                status: res.status,
                body,
                statUsersText: document.getElementById('stat-users')?.textContent || '',
                dashboardActive: document.getElementById('dashboard')?.classList?.contains('active') || false
              };
            })
            .catch((err) => ({ apiBase: API_BASE, error: String(err) }));
        })();
      `);
      throw new Error(`Admin statistics did not load: ${JSON.stringify(statsDebug)}`);
    }

    // Validate tab navigation buttons.
    const tabsCheck = await cdp.evaluate(`
      (() => {
        const tabPairs = [
          ['users', ".tab-btn[data-tab='users']"],
          ['questions', ".tab-btn[data-tab='questions']"],
          ['export', ".tab-btn[data-tab='export']"],
          ['settings', ".tab-btn[data-tab='settings']"],
          ['stats', ".tab-btn[data-tab='stats']"]
        ];
        const details = [];

        for (const [tabId, selector] of tabPairs) {
          const btn = document.querySelector(selector);
          const panel = document.getElementById(tabId);
          if (!btn || !panel) {
            details.push({ tabId, selector, status: 'missing' });
            return { ok: false, details };
          }
          btn.click();
          const active = panel.classList.contains('active');
          details.push({ tabId, selector, active });
          if (!active) {
            return { ok: false, details };
          }
        }
        return { ok: true, details };
      })();
    `);
    if (!tabsCheck?.ok) {
      throw new Error(
        `Admin tab buttons did not switch panels correctly: ${JSON.stringify(tabsCheck)}`,
      );
    }

    const smokeEmail = await cdp.evaluate(`
      (() => {
        switchTab('users', document.querySelector(".tab-btn[data-tab='users']"));
        openUserModal();
        const email = 'ui-smoke+' + Date.now() + '@example.com';
        document.getElementById('user-name').value = 'UI Smoke';
        document.getElementById('user-email').value = email;
        document.getElementById('user-password').value = 'Strong123';
        return email;
      })();
    `);
    await cdp.evaluate("saveUser();");

    const userCreated = await cdp.waitForCondition(
      `document.getElementById('users-table')?.textContent?.includes(${JSON.stringify(
        smokeEmail,
      )}) === true`,
      20000,
    );
    if (!userCreated) throw new Error("Admin user creation did not appear in table.");

    const createdUserId = await cdp.evaluate(`
      (() => {
        const rows = [...document.querySelectorAll('#users-table tr')];
        const row = rows.find((item) => item.textContent.includes(${JSON.stringify(smokeEmail)}));
        const actionBtn = row?.querySelector("button[data-action='delete-user']");
        return actionBtn?.dataset?.userId || null;
      })();
    `);
    if (!createdUserId) throw new Error("Created user ID not found in table.");

    const smokeQuestionText = `UI Smoke Question ${Date.now()}`;
    await cdp.evaluate(`
      (() => {
        switchTab('questions', document.querySelector(".tab-btn[data-tab='questions']"));
        openQuestionModal();
        document.getElementById('q-text').value = ${JSON.stringify(smokeQuestionText)};
        document.getElementById('q-category').value = 'Pharmacy Law & Ethics';
        const opts = [...document.querySelectorAll('.q-option')];
        opts[0].value = 'Option A';
        opts[1].value = 'Option B';
        opts[2].value = 'Option C';
        opts[3].value = 'Option D';
        document.getElementById('q-correct').value = '0';
        return true;
      })();
    `);
    await cdp.evaluate("saveQuestion();");

    const questionCreated = await cdp.waitForCondition(
      `Array.isArray(cachedQuestions) && cachedQuestions.some((q) => String(q.text || '').includes(${JSON.stringify(
        smokeQuestionText,
      )}))`,
      20000,
    );
    if (!questionCreated) {
      const questionDebug = await cdp.evaluate(`
        (() => ({
          questionsAlert: document.getElementById('questions-alerts')?.textContent || '',
          modalActive: document.getElementById('question-modal')?.classList?.contains('active') || false,
          qText: document.getElementById('q-text')?.value || '',
          qCategory: document.getElementById('q-category')?.value || '',
          qCorrect: document.getElementById('q-correct')?.value || '',
          qOptions: [...document.querySelectorAll('.q-option')].map((el) => el.value || ''),
          tableText: document.getElementById('questions-table')?.textContent?.slice(0, 200) || '',
          cachedMatchCount: Array.isArray(cachedQuestions)
            ? cachedQuestions.filter((q) => String(q.text || '').includes(${JSON.stringify(
                smokeQuestionText,
              )})).length
            : -1
        }))();
      `);
      throw new Error(`Admin question creation failed: ${JSON.stringify(questionDebug)}`);
    }

    const createdQuestionId = await cdp.evaluate(`
      (() => {
        const row = Array.isArray(cachedQuestions)
          ? cachedQuestions.find((q) => String(q.text || '').includes(${JSON.stringify(smokeQuestionText)}))
          : null;
        return row?.id ? String(row.id) : null;
      })();
    `);
    if (!createdQuestionId) throw new Error("Created question ID not found.");

    const exportOk = await cdp.evaluate(`
      fetch(\`\${API_BASE}/admin/export?format=json\`, { headers: getHeaders() })
        .then((res) => res.ok)
        .catch(() => false);
    `);
    if (!exportOk) throw new Error("Admin export endpoint failed from UI context.");

    await cdp.evaluate(`deleteQuestion(${JSON.stringify(createdQuestionId)});`);
    const questionDeleted = await cdp.waitForCondition(
      `Array.isArray(cachedQuestions) && cachedQuestions.some((q) => String(q.text || '').includes(${JSON.stringify(
        smokeQuestionText,
      )})) === false`,
      20000,
    );
    if (!questionDeleted) throw new Error("Admin question delete failed.");

    await cdp.evaluate(`deleteUser(${JSON.stringify(createdUserId)});`);
    const userDeleted = await cdp.waitForCondition(
      `document.getElementById('users-table')?.textContent?.includes(${JSON.stringify(
        smokeEmail,
      )}) === false`,
      20000,
    );
    if (!userDeleted) throw new Error("Admin user delete failed.");

    console.log("UI smoke: mobile layout checks");
    await cdp.setViewport({
      width: 390,
      height: 844,
      mobile: true,
      deviceScaleFactor: 3,
    });

    await cdp.navigate(`${HOST}/`);
    const quizMobileOk = await cdp.evaluate(`
      (() => {
        const getSize = (selector) => {
          const el = document.querySelector(selector);
          if (!el) return null;
          const value = parseFloat(getComputedStyle(el).fontSize || "0");
          return Number.isFinite(value) ? value : null;
        };

        const noHorizontalScroll =
          document.documentElement.scrollWidth <= window.innerWidth + 1;
        const enterButton = document.getElementById('enter-platform-btn');
        const enterRect = enterButton?.getBoundingClientRect();
        const enterUsable =
          Boolean(enterRect) &&
          enterRect.width >= 120 &&
          enterRect.height >= 40 &&
          enterRect.bottom <= window.innerHeight + 1;

        if (enterButton) enterButton.click();
        const studyBtn = document.querySelector('.study-mode');
        if (studyBtn) studyBtn.click();

        const startStudyBtn = document.getElementById('start-study-btn');
        const categorySelect = document.getElementById('study-category-select');
        const startRect = startStudyBtn?.getBoundingClientRect();
        const selectRect = categorySelect?.getBoundingClientRect();
        const formUsable =
          Boolean(startRect) &&
          Boolean(selectRect) &&
          startRect.width > 120 &&
          startRect.height >= 40 &&
          selectRect.width > 120 &&
          selectRect.height >= 40;

        const sizes = {
          portalDescription: getSize('.portal-description'),
          menuSubtitle: getSize('.menu-subtitle'),
          studyLabel: getSize('#study-setup label'),
          studySelect: getSize('#study-category-select'),
          startButton: getSize('#start-study-btn'),
        };

        const textReadable = Object.values(sizes).every(
          (size) => Number.isFinite(size) && size >= 16,
        );

        return { noHorizontalScroll, enterUsable, formUsable, textReadable, sizes };
      })();
    `);

    if (!quizMobileOk?.noHorizontalScroll) {
      throw new Error("Quiz mobile layout has horizontal scrolling.");
    }
    if (!quizMobileOk?.enterUsable || !quizMobileOk?.formUsable) {
      throw new Error("Quiz mobile controls are not usable.");
    }
    if (!quizMobileOk?.textReadable) {
      throw new Error(
        `Quiz mobile text size is below 16px: ${JSON.stringify(quizMobileOk?.sizes)}`,
      );
    }

    await cdp.navigate(`${HOST}/admin/`);
    const adminMobileOk = await cdp.evaluate(`
      (() => {
        const getSize = (selector) => {
          const el = document.querySelector(selector);
          if (!el) return null;
          const value = parseFloat(getComputedStyle(el).fontSize || "0");
          return Number.isFinite(value) ? value : null;
        };

        const noHorizontalScroll =
          document.documentElement.scrollWidth <= window.innerWidth + 1;
        const keyInput = document.getElementById('admin-key');
        const loginBtn = document.getElementById('admin-login-btn');
        const inputRect = keyInput?.getBoundingClientRect();
        const btnRect = loginBtn?.getBoundingClientRect();
        const loginScreenVisible =
          document.getElementById('login-screen')?.style?.display !== 'none';

        const loginFormUsable =
          Boolean(inputRect) &&
          Boolean(btnRect) &&
          inputRect.width > 180 &&
          inputRect.height >= 36 &&
          btnRect.width > 120 &&
          btnRect.height >= 38;

        const usersTabBtn = document.querySelector(".tab-btn[data-tab='users']");
        const questionsTabBtn = document.querySelector(".tab-btn[data-tab='questions']");
        if (usersTabBtn) switchTab('users', usersTabBtn);
        const addUserBtn = document.getElementById('add-user-btn');
        const addUserRect = addUserBtn?.getBoundingClientRect();
        if (questionsTabBtn) switchTab('questions', questionsTabBtn);
        const addQuestionBtn = document.getElementById('add-question-btn');
        const addQuestionRect = addQuestionBtn?.getBoundingClientRect();
        const dashboardFormUsable =
          Boolean(addUserRect) &&
          Boolean(addQuestionRect) &&
          addUserRect.height >= 40 &&
          addQuestionRect.height >= 40;

        const formUsable = loginScreenVisible ? loginFormUsable : dashboardFormUsable;
        const sizes = loginScreenVisible
          ? {
              loginLabel: getSize('#login-screen label'),
              loginInput: getSize('#admin-key'),
              loginButton: getSize('#admin-login-btn'),
            }
          : {
              tabButton: getSize('.tab-btn'),
              tableCell: getSize('#users-table td'),
              addUserButton: getSize('#add-user-btn'),
            };

        const textReadable = Object.values(sizes).every(
          (size) => Number.isFinite(size) && size >= 16,
        );
        return {
          noHorizontalScroll,
          formUsable,
          textReadable,
          sizes,
          loginScreenVisible,
          loginRect: inputRect
            ? {
                w: Math.round(inputRect.width),
                h: Math.round(inputRect.height),
              }
            : null,
          loginBtnRect: btnRect
            ? {
                w: Math.round(btnRect.width),
                h: Math.round(btnRect.height),
              }
            : null,
          addUserRect: addUserRect
            ? {
                w: Math.round(addUserRect.width),
                h: Math.round(addUserRect.height),
              }
            : null,
          addQuestionRect: addQuestionRect
            ? {
                w: Math.round(addQuestionRect.width),
                h: Math.round(addQuestionRect.height),
              }
            : null,
        };
      })();
    `);

    if (!adminMobileOk?.noHorizontalScroll) {
      throw new Error("Admin mobile layout has horizontal scrolling.");
    }
    if (!adminMobileOk?.formUsable) {
      throw new Error(
        `Admin mobile login form is not usable: ${JSON.stringify(adminMobileOk)}`,
      );
    }
    if (!adminMobileOk?.textReadable) {
      throw new Error(
        `Admin mobile text size is below 16px: ${JSON.stringify(adminMobileOk?.sizes)}`,
      );
    }

    await cdp.clearViewport();

    await cdp.close();

    if (jsExceptions.length > 0 || runtimeErrors.length > 0) {
      throw new Error(
        `Runtime errors detected. exceptions=${jsExceptions.length}, logErrors=${runtimeErrors.length}, details=${jsExceptions.join(" | ")}`,
      );
    }

    console.log("UI smoke test passed.");
  } finally {
    if (edge.pid) {
      await stopProcessTree(edge.pid);
    }
    await safeRemoveDirectory(profileDir);
  }
}

main().catch((error) => {
  console.error("UI smoke test failed:", error.stack || error.message);
  process.exitCode = 1;
});
