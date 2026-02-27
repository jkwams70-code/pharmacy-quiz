import { baseQuestions } from "./data.js";
import { backendClient } from "./backendClient.js";

const MAJOR_CATEGORIES = [
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
  "Pharmacy Law & Ethics",
];

const LEGACY_CATEGORY_MAP = {
  Cardiology: "Cardiovascular Disorders",
  "Clinical Pharmacology": "Pharmacy Law & Ethics",
  Haematology: "Hematology",
  Hematology: "Hematology",
  Endocrinology: "Endocrinology",
  Oncology: "Oncology",
  Neurology: "Neurology & Psychiatry",
  Psychiatry: "Neurology & Psychiatry",
  Respiratory: "Respiratory Disorders",
  Gastroenterology: "Gastrointestinal Disorders",
  Rheumatology: "Rheumatology & Pain",
  Dermatology: "Rheumatology & Pain",
  Obstetrics: "Women's & Men's Health",
  "Allergy and Immunology": "Respiratory Disorders",
  "Infectious Diseases": "Infectious Diseases",
};

function normalizeMajorCategory(category, context = "") {
  const raw = String(category || "").trim();
  if (LEGACY_CATEGORY_MAP[raw]) return LEGACY_CATEGORY_MAP[raw];

  const combined = `${raw} ${String(context || "")}`.toLowerCase();
  if (combined.includes("cardio") || combined.includes("hypertens")) {
    return "Cardiovascular Disorders";
  }
  if (combined.includes("infect") || combined.includes("antibiotic")) {
    return "Infectious Diseases";
  }
  if (combined.includes("diabet") || combined.includes("thyroid")) {
    return "Endocrinology";
  }
  if (
    combined.includes("respir") ||
    combined.includes("asthma") ||
    combined.includes("allergic rhinitis")
  ) {
    return "Respiratory Disorders";
  }
  if (combined.includes("renal") || combined.includes("kidney")) {
    return "Renal & Electrolyte Disorders";
  }
  if (combined.includes("gastro") || combined.includes("hepat")) {
    return "Gastrointestinal Disorders";
  }
  if (combined.includes("neuro") || combined.includes("psy") || combined.includes("seizure")) {
    return "Neurology & Psychiatry";
  }
  if (combined.includes("haemat") || combined.includes("hemat") || combined.includes("anemia")) {
    return "Hematology";
  }
  if (combined.includes("onco") || combined.includes("cancer")) {
    return "Oncology";
  }
  if (
    combined.includes("rheuma") ||
    combined.includes("arthritis") ||
    combined.includes("gout") ||
    combined.includes("pain") ||
    combined.includes("dermat")
  ) {
    return "Rheumatology & Pain";
  }
  if (combined.includes("pregnan") || combined.includes("contraception") || combined.includes("bph")) {
    return "Women's & Men's Health";
  }
  if (combined.includes("vaccine") || combined.includes("immunization")) {
    return "Immunizations";
  }
  if (combined.includes("law") || combined.includes("ethic")) {
    return "Pharmacy Law & Ethics";
  }

  return "Pharmacy Law & Ethics";
}

function withMajorCategory(question) {
  const questionText = String(question?.question || question?.text || "");
  const explanation = String(question?.explanation || "");
  return {
    ...question,
    category: normalizeMajorCategory(question?.category, `${questionText} ${explanation}`),
  };
}

let current = 0;
let score = 0;
let mode = "";
let active = [];
let examTimer;
let reviewTimer;
let examTimeLeft = 0;
let userAnswers = {};
let activeCase = "";
let reviewTimeLeft = 0;
let inReview = false;
let answeredCurrent = false;
let inStudyReview = false;
let currentStreak = 0;
let studySessionEnded = false;
let inDetailedReview = false;
// ==============================
// WEAK PRACTICE TRACKER (Persistent)
// ==============================

let weakTracker = JSON.parse(localStorage.getItem("weakTracker")) || {};

function saveWeakTracker() {
  localStorage.setItem("weakTracker", JSON.stringify(weakTracker));
}

let bestStreak = parseInt(localStorage.getItem("quizBestStreak")) || 0;

let sessionHistory =
  JSON.parse(localStorage.getItem("quizSessionHistory")) || [];

function byQuestionIdAscending(a, b) {
  return Number(a?.id || 0) - Number(b?.id || 0);
}

let questionBank = baseQuestions.map(withMajorCategory).sort(byQuestionIdAscending);
const caseMap = {};
let backendReady = false;
let backendAttemptId = null;
let currentUser = null;
let authMode = "login";
let topicCatalog = { topics: [], categories: [] };
let topicCatalogLoaded = false;
let topicLibraryReturnScreen = "quiz-menu";
let topicViewerReturnScreen = "topic-library";

// Load questions from backend if available
async function loadQuestionsFromBackend() {
  try {
    const questions = await backendClient.fetchQuestions({ limit: 1000 });
    if (Array.isArray(questions) && questions.length > 0) {
      // Map backend format to local format for compatibility
      questionBank = questions
        .map((q) => ({
          id: q.id,
          text: q.text || q.question || "",
          question: q.question || q.text || "",
          category: normalizeMajorCategory(
            q.category,
            `${String(q.question || q.text || "")} ${String(q.explanation || "")}`,
          ),
          options: q.options,
          statements: Array.isArray(q.statements) ? q.statements : [],
          caseId: q.caseId || "",
          caseBlock: q.caseBlock || "",
          correct: q.correct,
          explanation: q.explanation || "",
          type: q.type || "single",
          topicSlug: q.topicSlug || "",
          sectionId: q.sectionId || "",
        }))
        .sort(byQuestionIdAscending);
      backendReady = true;
      reconcileLocalQuestionStats();
      console.info(`Loaded ${questionBank.length} questions from backend`);
    }
  } catch (error) {
    console.warn("Backend unavailable, using local questions:", error);
    // Keep using local questions from data.js
  }
}

function rebuildCaseMap() {
  Object.keys(caseMap).forEach((key) => delete caseMap[key]);
  questionBank.forEach((q) => {
    if (q.caseId && q.caseBlock) {
      caseMap[q.caseId] = q.caseBlock;
    }
  });
}

function findQuestionById(questionId) {
  return questionBank.find((q) => Number(q.id) === Number(questionId));
}

rebuildCaseMap();
/* ==============================
                     PERFORMANCE ENGINE
                  ================================= */

let performanceData = JSON.parse(localStorage.getItem("quizPerformance")) || {};

function savePerformance() {
  localStorage.setItem("quizPerformance", JSON.stringify(performanceData));
}

function normalizeQuestionIdKey(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? String(id) : "";
}

function reconcileLocalQuestionStats() {
  const validIds = new Set(
    (Array.isArray(questionBank) ? questionBank : [])
      .map((q) => normalizeQuestionIdKey(q?.id))
      .filter(Boolean),
  );

  let weakChanged = false;
  const nextWeak = {};
  Object.entries(weakTracker || {}).forEach(([rawId, row]) => {
    const key = normalizeQuestionIdKey(rawId);
    if (!key || !validIds.has(key)) {
      weakChanged = true;
      return;
    }
    nextWeak[key] = row;
  });
  if (weakChanged) {
    weakTracker = nextWeak;
    saveWeakTracker();
  }

  let perfChanged = false;
  const nextPerf = {};
  Object.entries(performanceData || {}).forEach(([rawId, row]) => {
    const key = normalizeQuestionIdKey(rawId);
    if (!key || !validIds.has(key)) {
      perfChanged = true;
      return;
    }
    nextPerf[key] = row;
  });
  if (perfChanged) {
    performanceData = nextPerf;
    savePerformance();
  }
}

reconcileLocalQuestionStats();

function updatePerformance(questionId, isCorrect) {
  if (!performanceData[questionId]) {
    performanceData[questionId] = {
      attempts: 0,
      correct: 0,
    };
  }

  performanceData[questionId].attempts++;

  if (isCorrect) {
    performanceData[questionId].correct++;
  }

  // FIXED CATEGORY TRACKING
  const question = findQuestionById(questionId);

  if (question && question.category) {
    updateCategoryPerformance(question.category, isCorrect);
  }

  backendClient.syncPerformance({
    questionId,
    isCorrect,
    category: question?.category || "General",
  });

  savePerformance();
}

function getAccuracy(questionId) {
  const data = performanceData[questionId];
  if (!data || data.attempts === 0) return 100;
  return Math.round((data.correct / data.attempts) * 100);
}

function isWeak(questionId) {
  const accuracy = getAccuracy(questionId);
  return accuracy < 60; // you can adjust threshold
}

/* ==============================
                     CATEGORY PERFORMANCE ENGINE
                  ================================= */

let categoryPerformance =
  JSON.parse(localStorage.getItem("quizCategoryPerformance")) || {};

function updateCategoryPerformance(category, isCorrect) {
  if (!categoryPerformance[category]) {
    categoryPerformance[category] = {
      attempts: 0,
      correct: 0,
    };
  }

  categoryPerformance[category].attempts++;

  if (isCorrect) {
    categoryPerformance[category].correct++;
  }

  localStorage.setItem(
    "quizCategoryPerformance",
    JSON.stringify(categoryPerformance),
  );
}

function getCategoryAccuracy(category) {
  const data = categoryPerformance[category];
  if (!data || data.attempts === 0) return 100;

  return Math.round((data.correct / data.attempts) * 100);
}

function getWeakCategories(threshold = 80) {
  return Object.keys(categoryPerformance).filter(
    (cat) => getCategoryAccuracy(cat) < threshold,
  );
}

const studyBtn = document.querySelector(".study-mode");
const examBtn = document.querySelector(".exam-mode");
const dashboardBtn = document.querySelector(".dashboard-mode");
const topicLibraryBtn = document.getElementById("open-topic-library-btn");
const historyBtn = document.querySelector(".history-mode");
if (historyBtn) {
  historyBtn.onclick = () => {
    // whatever it was supposed to do
  };
}
const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const nextBtn = document.getElementById("next-btn");
const prevBtn = document.getElementById("prev-btn");
const timerEl = document.getElementById("timer");
const explanationEl = document.getElementById("explanation");
const topicLinkWrapEl = document.getElementById("question-topic-link-wrap");
const topicLinkBtnEl = document.getElementById("topic-link-btn");
const aiExplainWrapEl = document.getElementById("ai-explain-wrap");
const aiExplainBtn = document.getElementById("ai-explain-btn");
const aiExplainToggleBtn = document.getElementById("ai-explain-toggle-btn");
const aiExplainPanelEl = document.getElementById("ai-explain-panel");
const aiExplainMetaEl = document.getElementById("ai-explain-meta");
const aiExplainOutputEl = document.getElementById("ai-explain-output");
const quizArea = document.getElementById("quiz-area");
const progressEl = document.getElementById("progress");
const liveScore = document.getElementById("live-score");
const backReviewBtn = document.getElementById("back-review-btn");
const quizMenu = document.getElementById("quiz-menu");
const homeScreen = document.getElementById("home-screen");
const backHomeBtn = document.getElementById("back-home-btn");
const backBtnQuiz = document.getElementById("back-btn-quiz");
const menuBtnQuiz = document.getElementById("menu-btn-quiz");
const comboBlock = document.getElementById("combo-block");
const examExitModal = document.getElementById("exam-exit-modal");
const cancelExitBtn = document.getElementById("cancel-exit-btn");
const confirmExitBtn = document.getElementById("confirm-exit-btn");
const authModal = document.getElementById("auth-modal");
const authForm = document.getElementById("auth-form");
const authTabLoginBtn = document.getElementById("auth-tab-login");
const authTabRegisterBtn = document.getElementById("auth-tab-register");
const authIdentifierWrap = document.getElementById("auth-identifier-wrap");
const authIdentifierInput = document.getElementById("auth-identifier");
const authTitleWrap = document.getElementById("auth-title-wrap");
const authTitleInput = document.getElementById("auth-title");
const authFirstNameWrap = document.getElementById("auth-first-name-wrap");
const authFirstNameInput = document.getElementById("auth-first-name");
const authLastNameWrap = document.getElementById("auth-last-name-wrap");
const authLastNameInput = document.getElementById("auth-last-name");
const authUsernameWrap = document.getElementById("auth-username-wrap");
const authUsernameInput = document.getElementById("auth-username");
const authContactWrap = document.getElementById("auth-contact-wrap");
const authContactTypeInput = document.getElementById("auth-contact-type");
const authContactEmailWrap = document.getElementById("auth-contact-email-wrap");
const authContactEmailInput = document.getElementById("auth-contact-email");
const authContactPhoneWrap = document.getElementById("auth-contact-phone-wrap");
const authContactCountryCodeInput = document.getElementById(
  "auth-contact-country-code",
);
const authContactPhoneLocalInput = document.getElementById(
  "auth-contact-phone-local",
);
const authRoleWrap = document.getElementById("auth-role-wrap");
const authProfTypeWrap = document.getElementById("auth-prof-type-wrap");
const authProfessionalTypeInput = document.getElementById("auth-professional-type");
const authCountryWrap = document.getElementById("auth-country-wrap");
const authCountryInput = document.getElementById("auth-country");
const authInstitutionWrap = document.getElementById("auth-institution-wrap");
const authInstitutionInput = document.getElementById("auth-institution");
const authResetCodeWrap = document.getElementById("auth-reset-code-wrap");
const authResetCodeInput = document.getElementById("auth-reset-code");
const authPasswordWrap = document.getElementById("auth-password-wrap");
const authPasswordInput = document.getElementById("auth-password");
const authPasswordToggleBtn = document.getElementById("auth-password-toggle");
const authForgotLinkBtn = document.getElementById("auth-forgot-link");
const authResetLinkBtn = document.getElementById("auth-reset-link");
const authBackLoginLinkBtn = document.getElementById("auth-back-login-link");
const authResetCodePreviewEl = document.getElementById("auth-reset-code-preview");
const authErrorEl = document.getElementById("auth-error");
const authSubmitBtn = document.getElementById("auth-submit-btn");
const authCancelBtn = document.getElementById("auth-cancel-btn");
const authUserLabel = document.getElementById("quiz-auth-user");
const profileBtn = document.getElementById("quiz-profile-btn");
const profileBtnIcon = profileBtn?.querySelector(".menu-profile-icon");
const logoutBtn = document.getElementById("quiz-logout-btn");
const profileBackBtn = document.getElementById("profile-back-btn");
const profileSaveBtn = document.getElementById("profile-save-btn");
const profilePasswordToggleBtn = document.getElementById(
  "profile-password-toggle-btn",
);
const profilePasswordPanel = document.getElementById("profile-password-panel");
const profileChangePasswordBtn = document.getElementById("profile-change-password-btn");
const profileDangerToggleBtn = document.getElementById("profile-danger-toggle-btn");
const profileDangerPanel = document.getElementById("profile-danger-panel");
const profileDeactivateBtn = document.getElementById("profile-deactivate-btn");
const profileDeleteBtn = document.getElementById("profile-delete-btn");
const profileFeedbackEl = document.getElementById("profile-feedback");
const profileAvatarPreviewEl = document.getElementById("profile-avatar-preview");
const profilePhotoCameraBtn = document.getElementById("profile-photo-camera-btn");
const profilePhotoGalleryBtn = document.getElementById("profile-photo-gallery-btn");
const profilePhotoDeleteBtn = document.getElementById("profile-photo-delete-btn");
const profilePhotoFileCameraInput = document.getElementById(
  "profile-photo-file-camera",
);
const profilePhotoFileGalleryInput = document.getElementById(
  "profile-photo-file-gallery",
);
const profilePhotoUrlInput = document.getElementById("profile-photo-url");
const profileTitleInput = document.getElementById("profile-title");
const profileFirstNameInput = document.getElementById("profile-first-name");
const profileLastNameInput = document.getElementById("profile-last-name");
const profileUsernameInput = document.getElementById("profile-username");
const profileContactInput = document.getElementById("profile-contact");
const profileProfessionalTypeInput = document.getElementById("profile-professional-type");
const profileCountryInput = document.getElementById("profile-country");
const profileInstitutionInput = document.getElementById("profile-institution");
const profileCurrentPasswordInput = document.getElementById("profile-current-password");
const profileNewPasswordInput = document.getElementById("profile-new-password");
const profileDeactivateDaysInput = document.getElementById("profile-deactivate-days");
const studyHistoryToggle = document.getElementById("study-history-toggle");
const studyHistoryBox = document.getElementById("study-history");
const topicLibraryCategorySelect = document.getElementById("topic-library-category");
const topicLibrarySearchInput = document.getElementById("topic-library-search");
const topicLibraryListEl = document.getElementById("topic-library-list");
const topicLibraryCountEl = document.getElementById("topic-library-count");
const topicLibraryEmptyEl = document.getElementById("topic-library-empty");
const topicLibraryBackBtn = document.getElementById("topic-library-back-btn");
const topicViewerBackBtn = document.getElementById("topic-viewer-back-btn");
const topicViewerMenuBtn = document.getElementById("topic-viewer-menu-btn");
const topicViewerTitleEl = document.getElementById("topic-viewer-title");
const topicViewerFrameEl = document.getElementById("topic-viewer-frame");
const menuUserHubBtn = document.getElementById("menu-user-hub-btn");
const menuUserHubPanel = document.getElementById("menu-user-hub-panel");
const menuUserHubCloseBtn = document.getElementById("menu-user-hub-close-btn");
const menuTourBtn = document.getElementById("menu-tour-btn");
const menuSettingsBtn = document.getElementById("menu-settings-btn");
const tourBackBtn = document.getElementById("tour-back-btn");
const tourMenuBtn = document.getElementById("tour-menu-btn");
const settingsBackBtn = document.getElementById("settings-back-btn");
const settingsMenuBtn = document.getElementById("settings-menu-btn");
const appThemeSelect = document.getElementById("app-theme-select");
const appTextSizeSelect = document.getElementById("app-text-size-select");
const appFontSelect = document.getElementById("app-font-select");
const appReduceMotionCheckbox = document.getElementById("app-reduce-motion");
const appClearLocalBtn = document.getElementById("app-clear-local-btn");
const settingsFeedbackEl = document.getElementById("settings-feedback");
const UI_PREFS_STORAGE_KEY = "quizUiPrefsV1";
const HEADER_COLLAPSE_STORAGE_KEY = "quizHeaderCollapseV1";
const themeMediaQuery =
  typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

let uiPrefs = {
  theme: "light",
  textSize: "default",
  fontFamily: "default",
  reduceMotion: false,
};
let headersCollapsed = false;

function setSettingsFeedback(message = "", isError = false) {
  if (!settingsFeedbackEl) return;
  const text = String(message || "").trim();
  settingsFeedbackEl.textContent = text;
  settingsFeedbackEl.classList.toggle("hidden", !text);
  settingsFeedbackEl.classList.remove("auth-error", "auth-info");
  if (text) {
    settingsFeedbackEl.classList.add(isError ? "auth-error" : "auth-info");
  }
}

function normalizeUiPrefs(raw = {}) {
  const theme = String(raw?.theme || "light").toLowerCase();
  const textSize = String(raw?.textSize || "default").toLowerCase();
  const rawFontFamily = String(raw?.fontFamily || raw?.font || "default").toLowerCase();
  const fontFamily =
    rawFontFamily === "modern"
      ? "neo"
      : rawFontFamily === "rounded"
        ? "condensed"
        : rawFontFamily;
  return {
    theme: ["system", "light", "dark", "teal", "sunset"].includes(theme)
      ? theme
      : "light",
    textSize: ["default", "large"].includes(textSize) ? textSize : "default",
    fontFamily: ["default", "neo", "classic", "editorial", "mono", "condensed", "hand"].includes(
      fontFamily,
    )
      ? fontFamily
      : "default",
    reduceMotion: Boolean(raw?.reduceMotion),
  };
}

function loadUiPrefs() {
  try {
    const parsed = JSON.parse(localStorage.getItem(UI_PREFS_STORAGE_KEY) || "{}");
    uiPrefs = normalizeUiPrefs(parsed);
  } catch {
    uiPrefs = normalizeUiPrefs({});
  }
}

function saveUiPrefs() {
  localStorage.setItem(UI_PREFS_STORAGE_KEY, JSON.stringify(uiPrefs));
}

function resolveEffectiveTheme() {
  if (uiPrefs.theme === "light") return "light";
  if (uiPrefs.theme === "dark") return "dark";
  if (uiPrefs.theme === "teal") return "teal";
  if (uiPrefs.theme === "sunset") return "sunset";
  return themeMediaQuery?.matches ? "dark" : "light";
}

function applyUiPrefs() {
  const effectiveTheme = resolveEffectiveTheme();
  document.body.classList.toggle("theme-dark", effectiveTheme === "dark");
  document.body.classList.toggle("theme-light", effectiveTheme !== "dark");
  document.body.classList.toggle("theme-teal", effectiveTheme === "teal");
  document.body.classList.toggle("theme-sunset", effectiveTheme === "sunset");
  document.body.classList.toggle("text-size-large", uiPrefs.textSize === "large");
  document.body.classList.toggle("font-neo", uiPrefs.fontFamily === "neo");
  document.body.classList.toggle("font-classic", uiPrefs.fontFamily === "classic");
  document.body.classList.toggle("font-editorial", uiPrefs.fontFamily === "editorial");
  document.body.classList.toggle("font-mono", uiPrefs.fontFamily === "mono");
  document.body.classList.toggle("font-condensed", uiPrefs.fontFamily === "condensed");
  document.body.classList.toggle("font-hand", uiPrefs.fontFamily === "hand");
  document.body.classList.toggle("reduce-motion", Boolean(uiPrefs.reduceMotion));
}

function setHeadersCollapsed(nextCollapsed) {
  headersCollapsed = Boolean(nextCollapsed);
  document.body.classList.toggle("headers-collapsed", headersCollapsed);
  document.querySelectorAll(".header-collapse-toggle").forEach((button) => {
    const collapsedText = headersCollapsed ? "v" : "^";
    const actionText = headersCollapsed ? "Expand header bars" : "Collapse header bars";
    button.textContent = collapsedText;
    button.setAttribute("aria-label", actionText);
    button.setAttribute("title", actionText);
    button.setAttribute("aria-pressed", headersCollapsed ? "true" : "false");
  });
  try {
    localStorage.setItem(HEADER_COLLAPSE_STORAGE_KEY, headersCollapsed ? "1" : "0");
  } catch {
    // Ignore storage errors silently.
  }
}

function toggleHeadersCollapsed() {
  setHeadersCollapsed(!headersCollapsed);
}

function ensureHeaderCollapseControls() {
  document
    .querySelectorAll(".menu-fixed-header, .study-fixed-header, .app-header")
    .forEach((header) => {
      if (header.querySelector(".header-collapse-toggle")) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "header-collapse-toggle";
      button.addEventListener("click", toggleHeadersCollapsed);
      header.appendChild(button);
    });
}

function initHeaderCollapseState() {
  try {
    headersCollapsed = localStorage.getItem(HEADER_COLLAPSE_STORAGE_KEY) === "1";
  } catch {
    headersCollapsed = false;
  }
  ensureHeaderCollapseControls();
  setHeadersCollapsed(headersCollapsed);
}

function syncSettingsControls() {
  if (appThemeSelect) appThemeSelect.value = uiPrefs.theme;
  if (appTextSizeSelect) appTextSizeSelect.value = uiPrefs.textSize;
  if (appFontSelect) appFontSelect.value = uiPrefs.fontFamily;
  if (appReduceMotionCheckbox) appReduceMotionCheckbox.checked = Boolean(uiPrefs.reduceMotion);
}

function openSettingsScreen() {
  syncSettingsControls();
  setSettingsFeedback("");
  showScreen("settings-screen");
}

function clearDeviceLocalCache() {
  const keysToClear = [
    "studySession",
    "practiceSession",
    "quizExamSession",
    "examAbandoned",
    "quizSessionHistory",
    "weakTracker",
    "quizBestStreak",
    "performanceData",
    "categoryPerformance",
    "currentStreak",
    "activeStudySessionId",
    "activeExamSessionId",
  ];
  keysToClear.forEach((key) => localStorage.removeItem(key));
}

loadUiPrefs();
applyUiPrefs();
initHeaderCollapseState();

if (themeMediaQuery) {
  const onThemeChange = () => {
    if (uiPrefs.theme === "system") {
      applyUiPrefs();
    }
  };
  if (typeof themeMediaQuery.addEventListener === "function") {
    themeMediaQuery.addEventListener("change", onThemeChange);
  } else if (typeof themeMediaQuery.addListener === "function") {
    themeMediaQuery.addListener(onThemeChange);
  }
}

if (studyHistoryToggle && studyHistoryBox) {
  studyHistoryToggle.addEventListener("click", () => {
    studyHistoryBox.classList.toggle("hidden");
    studyHistoryToggle.classList.toggle("open");
  });
}

const examHistoryToggle = document.getElementById("exam-history-toggle");
const examHistoryBox = document.getElementById("exam-history");

if (examHistoryToggle && examHistoryBox) {
  examHistoryToggle.addEventListener("click", () => {
    examHistoryBox.classList.toggle("hidden");
    examHistoryToggle.classList.toggle("open");
  });
}

if (topicLibraryCategorySelect) {
  topicLibraryCategorySelect.addEventListener("change", renderTopicLibrary);
}

if (topicLibrarySearchInput) {
  topicLibrarySearchInput.addEventListener("input", renderTopicLibrary);
}

if (topicLibraryBtn) {
  topicLibraryBtn.addEventListener("click", () => {
    openTopicLibrary("quiz-menu");
  });
}

if (topicLibraryBackBtn) {
  topicLibraryBackBtn.addEventListener("click", () => {
    showScreen(topicLibraryReturnScreen || "quiz-menu");
  });
}

if (topicViewerBackBtn) {
  topicViewerBackBtn.addEventListener("click", () => {
    showScreen(topicViewerReturnScreen || "topic-library");
  });
}

if (topicViewerMenuBtn) {
  topicViewerMenuBtn.addEventListener("click", () => {
    showScreen("quiz-menu");
  });
}

if (tourBackBtn) {
  tourBackBtn.addEventListener("click", () => {
    showScreen("quiz-menu");
  });
}

if (tourMenuBtn) {
  tourMenuBtn.addEventListener("click", () => {
    showScreen("quiz-menu");
  });
}

if (menuUserHubBtn) {
  menuUserHubBtn.addEventListener("click", async () => {
    const ok = await ensureAuthenticated();
    if (!ok) return;
    toggleMenuUserHub();
  });
}

if (menuUserHubCloseBtn) {
  menuUserHubCloseBtn.addEventListener("click", () => {
    closeMenuUserHub();
  });
}

if (menuTourBtn) {
  menuTourBtn.addEventListener("click", () => {
    closeMenuUserHub();
    showScreen("tour-screen");
  });
}

if (menuSettingsBtn) {
  menuSettingsBtn.addEventListener("click", () => {
    closeMenuUserHub();
    openSettingsScreen();
  });
}

if (settingsBackBtn) {
  settingsBackBtn.addEventListener("click", () => {
    showScreen("quiz-menu");
  });
}

if (settingsMenuBtn) {
  settingsMenuBtn.addEventListener("click", () => {
    showScreen("quiz-menu");
  });
}

if (appThemeSelect) {
  appThemeSelect.addEventListener("change", () => {
    uiPrefs.theme = String(appThemeSelect.value || "system");
    saveUiPrefs();
    applyUiPrefs();
    setSettingsFeedback("Theme updated.");
  });
}

if (appTextSizeSelect) {
  appTextSizeSelect.addEventListener("change", () => {
    uiPrefs.textSize = String(appTextSizeSelect.value || "default");
    saveUiPrefs();
    applyUiPrefs();
    setSettingsFeedback("Text size updated.");
  });
}

if (appFontSelect) {
  appFontSelect.addEventListener("change", () => {
    uiPrefs.fontFamily = String(appFontSelect.value || "default");
    saveUiPrefs();
    applyUiPrefs();
    setSettingsFeedback("Font updated.");
  });
}

if (appReduceMotionCheckbox) {
  appReduceMotionCheckbox.addEventListener("change", () => {
    uiPrefs.reduceMotion = Boolean(appReduceMotionCheckbox.checked);
    saveUiPrefs();
    applyUiPrefs();
    setSettingsFeedback("Motion preference updated.");
  });
}

if (appClearLocalBtn) {
  appClearLocalBtn.addEventListener("click", () => {
    if (!confirm("Clear local practice cache on this device?")) return;
    clearDeviceLocalCache();
    setSettingsFeedback("Local cache cleared on this device.");
  });
}

document.addEventListener("click", (event) => {
  if (!menuUserHubPanel || menuUserHubPanel.classList.contains("hidden")) return;
  const target = event.target;
  if (!(target instanceof Node)) return;
  if (menuUserHubPanel.contains(target)) return;
  if (menuUserHubBtn && menuUserHubBtn.contains(target)) return;
  closeMenuUserHub();
});

function setAuthPasswordVisibility(visible) {
  if (!authPasswordInput || !authPasswordToggleBtn) return;
  const show = Boolean(visible);
  authPasswordInput.type = show ? "text" : "password";
  authPasswordToggleBtn.setAttribute(
    "aria-label",
    show ? "Hide password" : "Show password",
  );
  authPasswordToggleBtn.setAttribute("aria-pressed", show ? "true" : "false");

  const eyeIcon = authPasswordToggleBtn.querySelector(".icon-eye");
  const eyeOffIcon = authPasswordToggleBtn.querySelector(".icon-eye-off");
  if (eyeIcon) eyeIcon.classList.toggle("hidden", show);
  if (eyeOffIcon) eyeOffIcon.classList.toggle("hidden", !show);
}

function toggleAuthPasswordVisibility() {
  if (!authPasswordInput) return;
  setAuthPasswordVisibility(authPasswordInput.type === "password");
}

function normalizeTopicPathToken(value) {
  const token = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/\s+/g, "-");
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(token) ? token : "";
}

function buildTopicUrl(question) {
  const slug = normalizeTopicPathToken(question?.topicSlug);
  if (!slug) return "";

  const sectionId = normalizeTopicPathToken(question?.sectionId);
  const hash = sectionId ? `#${sectionId}` : "";
  return `topics/${slug}.html${hash}`;
}

function renderQuestionTopicLink(question) {
  if (!topicLinkWrapEl || !topicLinkBtnEl) return;

  const isStudyMode = mode === "study";
  if (!isStudyMode) {
    topicLinkWrapEl.classList.add("hidden");
    topicLinkBtnEl.removeAttribute("href");
    return;
  }

  const url = buildTopicUrl(question);
  if (!url) {
    topicLinkWrapEl.classList.add("hidden");
    topicLinkBtnEl.removeAttribute("href");
    return;
  }

  topicLinkBtnEl.href = url;
  topicLinkWrapEl.classList.remove("hidden");
}

function prettifyTopicSlug(slug) {
  return String(slug || "")
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function normalizeTopicNotePath(pathValue) {
  const raw = String(pathValue || "").trim().toLowerCase();
  if (!raw) return "";
  if (!/^[a-z0-9-]+\.html(?:#[a-z0-9-]+)?$/.test(raw)) return "";
  return `topics/${raw}`;
}

function topicSearchText(topic) {
  const sectionTitles = Array.isArray(topic?.sections)
    ? topic.sections.map((section) => section.title || "")
    : [];
  return [
    topic?.title,
    topic?.slug,
    topic?.summary,
    topic?.category,
    ...(Array.isArray(topic?.tags) ? topic.tags : []),
    ...sectionTitles,
  ]
    .join(" ")
    .toLowerCase();
}

function topicTitle(topic) {
  return (
    String(topic?.title || "").trim() ||
    prettifyTopicSlug(topic?.slug) ||
    "Study Note"
  );
}

function getFilteredTopicsForLibrary() {
  const rawTopics = Array.isArray(topicCatalog?.topics) ? topicCatalog.topics : [];
  const category = String(topicLibraryCategorySelect?.value || "all");
  const search = String(topicLibrarySearchInput?.value || "").trim().toLowerCase();

  return rawTopics
    .filter((topic) => {
      if (category !== "all" && topic.category !== category) {
        return false;
      }
      if (!search) return true;
      return topicSearchText(topic).includes(search);
    })
    .sort((a, b) => topicTitle(a).localeCompare(topicTitle(b)));
}

function renderTopicLibrary() {
  if (!topicLibraryListEl || !topicLibraryEmptyEl || !topicLibraryCountEl) return;

  const filteredTopics = getFilteredTopicsForLibrary();
  topicLibraryListEl.innerHTML = "";

  filteredTopics.forEach((topic) => {
    const notePath =
      normalizeTopicNotePath(topic.notePath) ||
      normalizeTopicNotePath(`${String(topic.slug || "").toLowerCase()}.html`);
    if (!notePath) return;

    const item = document.createElement("button");
    item.type = "button";
    item.className = "topic-library-item";
    item.innerHTML = `
      <span class="topic-library-item-title">${topicTitle(topic)}</span>
      <span class="topic-library-item-meta">${topic.category || "General"}</span>
    `;
    item.addEventListener("click", () => {
      openTopicViewer(notePath, topicTitle(topic), "topic-library");
    });
    topicLibraryListEl.appendChild(item);
  });

  topicLibraryCountEl.textContent = `${filteredTopics.length} topic(s)`;
  topicLibraryEmptyEl.classList.toggle("hidden", filteredTopics.length > 0);
}

function populateTopicLibraryCategories() {
  if (!topicLibraryCategorySelect) return;

  topicLibraryCategorySelect.innerHTML = '<option value="all">All Categories</option>';
  MAJOR_CATEGORIES.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.innerText = category;
    topicLibraryCategorySelect.appendChild(option);
  });
}

async function ensureTopicCatalogLoaded() {
  if (topicCatalogLoaded) return;

  try {
    const response = await fetch("topics/topics.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`topics.json failed (${response.status})`);
    }
    topicCatalog = await response.json();
  } catch (error) {
    console.warn("Topic catalog fallback enabled:", error);
    topicCatalog = {
      topics: [
        {
          slug: "heart-failure",
          title: "Heart Failure",
          category: "Cardiovascular Disorders",
          summary:
            "HFrEF/HFpEF classification, four-pillar HFrEF therapy, and acute decompensation.",
          notePath: "heart-failure.html",
        },
        {
          slug: "hypertension",
          title: "Hypertension",
          category: "Cardiovascular Disorders",
          summary:
            "Blood pressure classification, first-line treatment, and hypertensive crisis.",
          notePath: "hypertension.html",
        },
      ],
      categories: [...MAJOR_CATEGORIES],
    };
  } finally {
    topicCatalogLoaded = true;
    renderTopicLibrary();
  }
}

function openTopicLibrary(returnScreen = "quiz-menu") {
  topicLibraryReturnScreen = returnScreen;
  showScreen("topic-library");
  ensureTopicCatalogLoaded();
  renderTopicLibrary();
}

function enforceTopicViewerMobileLayout() {
  if (!topicViewerFrameEl) return;
  try {
    const doc = topicViewerFrameEl.contentDocument;
    if (!doc) return;
    const head = doc.head || doc.getElementsByTagName("head")[0];
    if (!head) return;
    let styleEl = doc.getElementById("topic-viewer-mobile-layout");
    if (!styleEl) {
      styleEl = doc.createElement("style");
      styleEl.id = "topic-viewer-mobile-layout";
      styleEl.textContent = `
        html, body {
          max-width: 100% !important;
          overflow-x: hidden !important;
        }
        body {
          word-break: break-word;
          overflow-wrap: anywhere;
        }
        img, video, iframe, svg, canvas {
          max-width: 100% !important;
          height: auto !important;
        }
        table {
          width: 100% !important;
          table-layout: fixed !important;
          word-break: break-word;
        }
        th, td {
          word-break: break-word;
          overflow-wrap: anywhere;
          white-space: normal !important;
        }
        pre, code {
          white-space: pre-wrap !important;
          word-break: break-word;
          overflow-wrap: anywhere;
        }
      `;
      head.appendChild(styleEl);
    }
  } catch (error) {
    console.debug("Topic viewer style injection skipped:", error);
  }
}

function openTopicViewer(notePath, title = "Study Note", returnScreen = "topic-library") {
  if (!topicViewerFrameEl) return;
  topicViewerReturnScreen = returnScreen;
  topicViewerFrameEl.src = notePath;
  if (topicViewerTitleEl) {
    topicViewerTitleEl.innerText = `Study Note: ${title}`;
  }
  showScreen("topic-viewer");
}

if (topicViewerFrameEl) {
  topicViewerFrameEl.addEventListener("load", () => {
    enforceTopicViewerMobileLayout();
  });
}

function setAuthError(message = "") {
  if (!authErrorEl) return;
  const text = String(message || "").trim();
  authErrorEl.textContent = text;
  authErrorEl.classList.toggle("hidden", !text);
}

function setAuthInfo(message = "", isError = false) {
  if (!authResetCodePreviewEl) return;
  const text = String(message || "").trim();
  authResetCodePreviewEl.textContent = text;
  authResetCodePreviewEl.classList.toggle("hidden", !text);
  authResetCodePreviewEl.classList.remove("auth-error", "auth-info");
  if (text) {
    authResetCodePreviewEl.classList.add(isError ? "auth-error" : "auth-info");
  }
}

function readSelectedRadioValue(name, fallback = "") {
  const selected = document.querySelector(`input[name="${name}"]:checked`);
  return selected ? String(selected.value || "").trim() : fallback;
}

function setSelectedRadioValue(name, value) {
  const next = String(value || "").trim();
  document.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
    input.checked = String(input.value) === next;
  });
}

const EMAIL_INPUT_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_INPUT_REGEX = /^[a-z0-9][a-z0-9_.-]{2,29}$/;
const CONTACT_RULES_BY_COUNTRY = {
  "United States": { code: "+1", min: 10, max: 10, label: "10 digits" },
  Canada: { code: "+1", min: 10, max: 10, label: "10 digits" },
  "United Kingdom": { code: "+44", min: 10, max: 10, label: "10 digits" },
  Nigeria: { code: "+234", min: 10, max: 10, label: "10 digits" },
  Ghana: { code: "+233", min: 9, max: 9, label: "9 digits" },
  Kenya: { code: "+254", min: 9, max: 9, label: "9 digits" },
  India: { code: "+91", min: 10, max: 10, label: "10 digits" },
  Pakistan: { code: "+92", min: 10, max: 10, label: "10 digits" },
  Philippines: { code: "+63", min: 10, max: 10, label: "10 digits" },
  Australia: { code: "+61", min: 9, max: 9, label: "9 digits" },
  "South Africa": { code: "+27", min: 9, max: 9, label: "9 digits" },
  Other: { code: "", min: 6, max: 14, label: "6-14 digits" },
};

function normalizeDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function getContactRule(country) {
  return CONTACT_RULES_BY_COUNTRY[String(country || "").trim()] || null;
}

function clearFieldValidation(fieldWrap) {
  if (!fieldWrap) return;
  fieldWrap.classList.remove("field-invalid");
  const hint = fieldWrap.querySelector(".field-error-text");
  if (hint) hint.remove();
}

function setFieldValidation(fieldWrap, message = "Required") {
  if (!fieldWrap) return;
  clearFieldValidation(fieldWrap);
  fieldWrap.classList.add("field-invalid");
  const hint = document.createElement("div");
  hint.className = "field-error-text";
  hint.textContent = message;
  fieldWrap.appendChild(hint);
}

function clearAuthFieldValidations() {
  [
    authTitleWrap,
    authFirstNameWrap,
    authLastNameWrap,
    authUsernameWrap,
    authContactWrap,
    authContactEmailWrap,
    authContactPhoneWrap,
    authProfTypeWrap,
    authCountryWrap,
    authInstitutionWrap,
    authPasswordWrap,
  ].forEach(clearFieldValidation);
}

function toggleAuthContactFields() {
  const isRegister = authMode === "register";
  const contactType = String(authContactTypeInput?.value || "email")
    .trim()
    .toLowerCase();

  if (authContactEmailWrap) {
    authContactEmailWrap.classList.toggle(
      "hidden",
      !isRegister || contactType !== "email",
    );
  }
  if (authContactPhoneWrap) {
    authContactPhoneWrap.classList.toggle(
      "hidden",
      !isRegister || contactType !== "phone",
    );
  }
}

function syncCountryCodeWithCountry() {
  const country = String(authCountryInput?.value || "").trim();
  const rule = getContactRule(country);
  if (!rule || !authContactCountryCodeInput) return;
  if (!rule.code) return;
  authContactCountryCodeInput.value = rule.code;
}

function bindValidationClear(inputEl, fieldWrap, eventName = "input") {
  if (!inputEl || !fieldWrap) return;
  inputEl.addEventListener(eventName, () => clearFieldValidation(fieldWrap));
}

function isValidContactValue(value) {
  const contact = String(value || "").trim();
  if (!contact) return false;
  if (EMAIL_INPUT_REGEX.test(contact)) return true;
  return /^\+[1-9]\d{5,15}$/.test(contact);
}

let pendingProfileImage = "";
let profileImageMarkedForDeletion = false;

function getCurrentProfileImage() {
  if (profileImageMarkedForDeletion) return "";
  const typed = String(profilePhotoUrlInput?.value || "").trim();
  if (typed) return typed;
  const pending = String(pendingProfileImage || "").trim();
  if (pending) return pending;
  return String(currentUser?.profileImage || "").trim();
}

function refreshProfilePhotoDeleteVisibility() {
  if (!profilePhotoDeleteBtn) return;
  const hasImage = Boolean(getCurrentProfileImage());
  profilePhotoDeleteBtn.classList.toggle("hidden", !hasImage);
}

function defaultProfileAvatarDataUri() {
  const label = String(
    currentUser?.username || currentUser?.firstName || currentUser?.name || "U",
  )
    .trim()
    .slice(0, 2)
    .toUpperCase();
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect width='120' height='120' rx='18' fill='#0f3f7f'/><text x='60' y='72' text-anchor='middle' font-size='42' font-family='Arial' fill='#fff'>${label || "U"}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function setProfileAvatarPreview(src = "") {
  if (!profileAvatarPreviewEl) return;
  const cleaned = String(src || "").trim();
  profileAvatarPreviewEl.src = cleaned || defaultProfileAvatarDataUri();
}

function updateProfileButtonAvatar(src = "") {
  if (!profileBtn) return;
  const cleaned = String(src || "").trim();

  if (cleaned) {
    profileBtn.style.backgroundImage = `url("${cleaned}")`;
    profileBtn.style.backgroundSize = "cover";
    profileBtn.style.backgroundPosition = "center";
    profileBtn.style.backgroundRepeat = "no-repeat";
    profileBtn.classList.add("has-avatar");
    if (profileBtnIcon) profileBtnIcon.classList.add("hidden");
    return;
  }

  profileBtn.style.backgroundImage = "";
  profileBtn.style.backgroundSize = "";
  profileBtn.style.backgroundPosition = "";
  profileBtn.style.backgroundRepeat = "";
  profileBtn.classList.remove("has-avatar");
  if (profileBtnIcon) profileBtnIcon.classList.remove("hidden");
}

let profileFeedbackTimer = null;

function setProfileFeedback(message = "", isError = false) {
  if (!profileFeedbackEl) return;
  const text = String(message || "").trim();
  if (profileFeedbackTimer) {
    clearTimeout(profileFeedbackTimer);
    profileFeedbackTimer = null;
  }
  profileFeedbackEl.textContent = text;
  profileFeedbackEl.classList.toggle("hidden", !text);
  profileFeedbackEl.classList.remove("auth-error", "auth-info", "profile-toast");
  if (text) {
    profileFeedbackEl.classList.add(
      isError ? "auth-error" : "auth-info",
      "profile-toast",
    );
    profileFeedbackTimer = setTimeout(() => {
      if (!profileFeedbackEl) return;
      profileFeedbackEl.classList.add("hidden");
      profileFeedbackEl.classList.remove(
        "auth-error",
        "auth-info",
        "profile-toast",
      );
      profileFeedbackEl.textContent = "";
      profileFeedbackTimer = null;
    }, isError ? 6500 : 4200);
  }
}

function setProfilePanelOpen(panelEl, toggleBtnEl, open, openLabel, closeLabel) {
  if (!panelEl || !toggleBtnEl) return;
  panelEl.classList.toggle("hidden", !open);
  toggleBtnEl.setAttribute("aria-expanded", open ? "true" : "false");
  toggleBtnEl.textContent = open ? closeLabel : openLabel;
}

function fillProfileForm() {
  if (!currentUser) return;
  if (profileTitleInput) profileTitleInput.value = currentUser.title || "";
  if (profileFirstNameInput) profileFirstNameInput.value = currentUser.firstName || "";
  if (profileLastNameInput) profileLastNameInput.value = currentUser.lastName || "";
  if (profileUsernameInput) profileUsernameInput.value = currentUser.username || "";
  if (profileContactInput) profileContactInput.value = currentUser.contact || "";
  if (profileProfessionalTypeInput) {
    profileProfessionalTypeInput.value = currentUser.professionalType || "Other";
  }
  if (profileCountryInput) profileCountryInput.value = currentUser.country || "";
  if (profileInstitutionInput) profileInstitutionInput.value = currentUser.institution || "";
  setSelectedRadioValue("profile-role", currentUser.role || "student");

  profileImageMarkedForDeletion = false;
  pendingProfileImage = String(currentUser.profileImage || "").trim();
  if (profilePhotoUrlInput) {
    profilePhotoUrlInput.value = /^https?:\/\//i.test(pendingProfileImage)
      ? pendingProfileImage
      : "";
  }
  setProfileAvatarPreview(pendingProfileImage);
  updateProfileButtonAvatar(pendingProfileImage);
  refreshProfilePhotoDeleteVisibility();
}

function closeMenuUserHub() {
  if (menuUserHubPanel) {
    menuUserHubPanel.classList.add("hidden");
  }
  if (menuUserHubBtn) {
    menuUserHubBtn.setAttribute("aria-expanded", "false");
  }
}

function toggleMenuUserHub() {
  if (!menuUserHubPanel || !menuUserHubBtn) return;
  const opening = menuUserHubPanel.classList.contains("hidden");
  menuUserHubPanel.classList.toggle("hidden", !opening);
  menuUserHubBtn.setAttribute("aria-expanded", opening ? "true" : "false");
}

function renderAuthState() {
  if (!authUserLabel || !logoutBtn || !profileBtn) return;

  if (currentUser) {
    const username = String(currentUser.username || "").trim();
    const fallbackLabel =
      currentUser.name || currentUser.contact || "User";
    authUserLabel.textContent = username ? `@${username}` : fallbackLabel;
    authUserLabel.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");
    profileBtn.classList.remove("hidden");
    if (menuUserHubBtn) menuUserHubBtn.classList.remove("hidden");
    updateProfileButtonAvatar(currentUser.profileImage || "");
    fillProfileForm();
    refreshProfilePhotoDeleteVisibility();
    return;
  }

  authUserLabel.textContent = "";
  authUserLabel.classList.add("hidden");
  logoutBtn.classList.add("hidden");
  profileBtn.classList.add("hidden");
  if (menuUserHubBtn) menuUserHubBtn.classList.add("hidden");
  closeMenuUserHub();
  updateProfileButtonAvatar("");
  refreshProfilePhotoDeleteVisibility();
}

function setAuthMode(nextMode = "login") {
  const allowedModes = new Set(["login", "register", "forgot", "reset"]);
  authMode = allowedModes.has(nextMode) ? nextMode : "login";

  const isLogin = authMode === "login";
  const isRegister = authMode === "register";
  const isForgot = authMode === "forgot";
  const isReset = authMode === "reset";

  if (authTabLoginBtn) {
    authTabLoginBtn.classList.toggle("active", isLogin);
  }
  if (authTabRegisterBtn) {
    authTabRegisterBtn.classList.toggle("active", isRegister);
  }

  if (authIdentifierWrap) authIdentifierWrap.classList.toggle("hidden", isRegister);
  if (authTitleWrap) authTitleWrap.classList.toggle("hidden", !isRegister);
  if (authFirstNameWrap) authFirstNameWrap.classList.toggle("hidden", !isRegister);
  if (authLastNameWrap) authLastNameWrap.classList.toggle("hidden", !isRegister);
  if (authUsernameWrap) authUsernameWrap.classList.toggle("hidden", !isRegister);
  if (authContactWrap) authContactWrap.classList.toggle("hidden", !isRegister);
  toggleAuthContactFields();
  if (authRoleWrap) authRoleWrap.classList.toggle("hidden", !isRegister);
  if (authProfTypeWrap) authProfTypeWrap.classList.toggle("hidden", !isRegister);
  if (authCountryWrap) authCountryWrap.classList.toggle("hidden", !isRegister);
  if (authInstitutionWrap) authInstitutionWrap.classList.toggle("hidden", !isRegister);
  if (authResetCodeWrap) authResetCodeWrap.classList.toggle("hidden", !isReset);
  if (authPasswordWrap) authPasswordWrap.classList.toggle("hidden", isForgot);
  if (authForgotLinkBtn) authForgotLinkBtn.classList.toggle("hidden", !isLogin);
  if (authResetLinkBtn) authResetLinkBtn.classList.toggle("hidden", !isLogin);
  if (authBackLoginLinkBtn) authBackLoginLinkBtn.classList.toggle("hidden", isLogin);

  if (authPasswordInput) {
    authPasswordInput.setAttribute(
      "autocomplete",
      isLogin ? "current-password" : "new-password",
    );
  }

  if (authSubmitBtn) {
    if (isRegister) authSubmitBtn.textContent = "Create Account";
    if (isLogin) authSubmitBtn.textContent = "Sign In";
    if (isForgot) authSubmitBtn.textContent = "Send Reset Code";
    if (isReset) authSubmitBtn.textContent = "Reset Password";
  }

  setAuthPasswordVisibility(false);
  clearAuthFieldValidations();
  setAuthError("");
  setAuthInfo("");

  if (isRegister) {
    if (authContactTypeInput && !authContactTypeInput.value) {
      authContactTypeInput.value = "email";
    }
    syncCountryCodeWithCountry();
    toggleAuthContactFields();
  }
}

function openAuthModal(nextMode = "login") {
  if (!authModal) return;
  setAuthMode(nextMode);
  setAuthError("");
  setAuthInfo("");
  authModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  if (authMode === "register" && authTitleInput) {
    authTitleInput.focus();
    return;
  }
  if (authMode === "reset" && authResetCodeInput) {
    authResetCodeInput.focus();
    return;
  }
  if (authIdentifierInput) authIdentifierInput.focus();
}

function closeAuthModal() {
  if (!authModal) return;
  authModal.classList.add("hidden");
  setAuthPasswordVisibility(false);
  setAuthInfo("");
  document.body.style.overflow = "";
}

function authErrorMessage(error) {
  const message = String(error?.message || "");
  if (message.includes("invalid credentials") || message.includes("(401)")) {
    return "Invalid username/contact/email or password.";
  }
  if (message.includes("deactivated") || message.includes("(403)")) {
    return message.replace(/\s+\(\d+\)\s*$/, "");
  }
  if (message.includes("(409)")) return message.replace(/\s+\(\d+\)\s*$/, "");
  if (message.includes("(400)")) return message.replace(/\s+\(\d+\)\s*$/, "");
  return "Unable to sign in right now. Please try again.";
}

let aiExplainInFlightQuestionKey = "";
let aiExplainStateByQuestion = Object.create(null);

function getCurrentQuestionForAi() {
  return Array.isArray(active) ? active[current] : null;
}

function getAiQuestionKey(question = getCurrentQuestionForAi()) {
  if (!question) return "";
  const id = String(question.id || "").trim();
  if (id) return id;

  const questionText = String(question.question || question.text || "").trim();
  if (questionText) return `${mode || "mode"}:${questionText}`;

  return `${mode || "mode"}:${current}`;
}

function getAiState(question = getCurrentQuestionForAi(), createIfMissing = false) {
  const key = getAiQuestionKey(question);
  if (!key) return null;

  if (!aiExplainStateByQuestion[key] && createIfMissing) {
    aiExplainStateByQuestion[key] = {
      meta: "",
      metaIsError: false,
      output: "",
      outputIsError: false,
      generated: false,
      collapsed: false,
    };
  }

  return aiExplainStateByQuestion[key] || null;
}

function clearAiExplainStateSession() {
  aiExplainInFlightQuestionKey = "";
  aiExplainStateByQuestion = Object.create(null);
}

function canUseAiForCurrentQuestion() {
  if (!currentUser) return false;
  if ((mode === "exam" || mode === "smart") && !inReview && !inDetailedReview) {
    return false;
  }
  return true;
}

function hasAnsweredCurrentQuestionForAi() {
  const question = getCurrentQuestionForAi();
  if (!question?.id) return false;
  const answer = String(userAnswers?.[question.id] || "").trim();
  return Boolean(answer);
}

function isExplanationVisibleForCurrentQuestion() {
  return Boolean(explanationEl) && !explanationEl.classList.contains("hidden");
}

function isAiExplainInFlightForCurrentQuestion() {
  if (!aiExplainInFlightQuestionKey) return false;
  return aiExplainInFlightQuestionKey === getAiQuestionKey();
}

function syncAiExplainPanelForCurrentQuestion() {
  const question = getCurrentQuestionForAi();
  const state = getAiState(question, false);
  const modeAllowed = canUseAiForCurrentQuestion();
  const answerAllowed = hasAnsweredCurrentQuestionForAi();
  const explanationReady = isExplanationVisibleForCurrentQuestion();
  const showControls = modeAllowed && explanationReady;
  const inFlightAny = Boolean(aiExplainInFlightQuestionKey);

  const hasMeta = Boolean(String(state?.meta || "").trim());
  const hasOutput = Boolean(String(state?.output || "").trim());
  const hasContent = hasMeta || hasOutput;
  const hasGenerated = Boolean(state?.generated && hasOutput);
  const isCollapsed = Boolean(state?.collapsed);
  const showPanel = showControls && hasContent && (!hasGenerated || !isCollapsed);

  if (aiExplainWrapEl) {
    aiExplainWrapEl.classList.toggle("hidden", !showControls);
  }

  if (aiExplainPanelEl) {
    aiExplainPanelEl.classList.toggle("hidden", !showPanel);
  }

  if (aiExplainMetaEl) {
    const showMeta = showPanel && hasMeta;
    aiExplainMetaEl.textContent = showMeta ? String(state?.meta || "").trim() : "";
    aiExplainMetaEl.classList.toggle("hidden", !showMeta);
    aiExplainMetaEl.style.color = state?.metaIsError ? "#b91c1c" : "#475569";
  }

  if (aiExplainOutputEl) {
    const showOutput = showPanel && hasOutput;
    aiExplainOutputEl.textContent = showOutput ? String(state?.output || "").trim() : "";
    aiExplainOutputEl.classList.toggle("hidden", !showOutput);
    aiExplainOutputEl.style.borderLeftColor = state?.outputIsError ? "#dc2626" : "#7c3aed";
    aiExplainOutputEl.style.background = state?.outputIsError ? "#fef2f2" : "#ede9fe";
    aiExplainOutputEl.style.color = state?.outputIsError ? "#7f1d1d" : "#4c1d95";
  }

  if (aiExplainBtn) {
    if (isAiExplainInFlightForCurrentQuestion()) {
      aiExplainBtn.textContent = "Thinking...";
    } else if (hasGenerated) {
      aiExplainBtn.textContent = "AI Generated";
    } else {
      aiExplainBtn.textContent = "Explain With AI";
    }

    aiExplainBtn.disabled =
      !(showControls && answerAllowed) || hasGenerated || inFlightAny;
  }

  if (aiExplainToggleBtn) {
    const showToggle = showControls && hasGenerated;
    aiExplainToggleBtn.classList.toggle("hidden", !showToggle);
    aiExplainToggleBtn.disabled = inFlightAny;

    if (showToggle) {
      const isClosed = Boolean(state?.collapsed);
      aiExplainToggleBtn.textContent = isClosed ? "+" : "x";
      aiExplainToggleBtn.setAttribute(
        "title",
        isClosed ? "Show AI explanation" : "Close AI explanation",
      );
      aiExplainToggleBtn.setAttribute(
        "aria-label",
        isClosed ? "Show AI explanation" : "Close AI explanation",
      );
    }
  }
}

function refreshAiExplainAvailability() {
  syncAiExplainPanelForCurrentQuestion();
}

function setAiExplainMetaForQuestion(question, message = "", isError = false) {
  const state = getAiState(question, true);
  if (!state) return;
  state.meta = String(message || "").trim();
  state.metaIsError = Boolean(isError);
}

function setAiExplainOutputForQuestion(question, message = "", isError = false) {
  const state = getAiState(question, true);
  if (!state) return;
  state.output = String(message || "").trim();
  state.outputIsError = Boolean(isError);
}

function setAiExplainMeta(message = "", isError = false) {
  const question = getCurrentQuestionForAi();
  setAiExplainMetaForQuestion(question, message, isError);
  syncAiExplainPanelForCurrentQuestion();
}

function setAiExplainOutput(message = "", isError = false) {
  const question = getCurrentQuestionForAi();
  setAiExplainOutputForQuestion(question, message, isError);
  syncAiExplainPanelForCurrentQuestion();
}

function closeAiExplainPanel() {
  if (Boolean(aiExplainInFlightQuestionKey)) return;
  const question = getCurrentQuestionForAi();
  const state = getAiState(question, false);
  if (!state?.generated) return;
  state.collapsed = true;
  syncAiExplainPanelForCurrentQuestion();
}

function reopenAiExplainPanel() {
  if (Boolean(aiExplainInFlightQuestionKey)) return;
  const question = getCurrentQuestionForAi();
  const state = getAiState(question, false);
  if (!state?.generated) return;
  state.collapsed = false;
  syncAiExplainPanelForCurrentQuestion();
}

function toggleAiExplainPanel() {
  const question = getCurrentQuestionForAi();
  const state = getAiState(question, false);
  if (!state?.generated) return;
  if (state.collapsed) {
    reopenAiExplainPanel();
    return;
  }
  closeAiExplainPanel();
}

function resetAiExplainPanel() {
  syncAiExplainPanelForCurrentQuestion();
}

function getOptionListForAi(question) {
  if (Array.isArray(question?.options) && question.options.length > 0) {
    return question.options;
  }

  if (Array.isArray(question?.statements) && question.statements.length > 0) {
    return question.statements;
  }

  return [];
}

function buildAiPayloadForQuestion(question) {
  const options = getOptionListForAi(question);
  return {
    question: String(question?.question || question?.text || "").trim(),
    options,
    selectedAnswer: String(userAnswers?.[question?.id] || "").trim(),
    correctAnswer: String(question?.correct || "").trim(),
    category: String(question?.category || "").trim(),
    mode: String(mode || "").trim(),
    topicSlug: String(question?.topicSlug || "").trim(),
    existingExplanation: String(question?.explanation || "").trim(),
  };
}

async function handleAiExplainClick() {
  if (!aiExplainBtn || aiExplainInFlightQuestionKey) return;
  if (!canUseAiForCurrentQuestion()) {
    setAiExplainMeta("AI explanation is available in Study or Review mode only.", true);
    return;
  }
  if (!hasAnsweredCurrentQuestionForAi()) {
    setAiExplainMeta("Select an answer first before using AI explanation.", true);
    return;
  }

  const question = Array.isArray(active) ? active[current] : null;
  if (!question) {
    setAiExplainMeta("No active question to explain.", true);
    return;
  }

  const payload = buildAiPayloadForQuestion(question);
  if (!payload.question) {
    setAiExplainMeta("Question text is missing; AI explain skipped.", true);
    return;
  }

  const questionKey = getAiQuestionKey(question);
  if (!questionKey) {
    setAiExplainMeta("Question key is missing; AI explain skipped.", true);
    return;
  }

  aiExplainInFlightQuestionKey = questionKey;
  setAiExplainMetaForQuestion(question, "Requesting explanation...");
  setAiExplainOutputForQuestion(question, "");
  const preState = getAiState(question, true);
  if (preState) {
    preState.generated = false;
    preState.collapsed = false;
  }
  syncAiExplainPanelForCurrentQuestion();

  try {
    const data = await backendClient.explainQuestion(payload);
    const answerText = String(data?.answer || "").trim();
    setAiExplainOutputForQuestion(question, answerText);
    const remaining = Number(data?.usage?.remaining);
    const limit = Number(data?.usage?.limit);
    const tier = String(data?.tier || "").trim() || "free";
    const provider = String(data?.provider || "").trim();
    if (Number.isFinite(remaining) && Number.isFinite(limit)) {
      setAiExplainMetaForQuestion(
        question,
        `AI: ${provider} (${tier}) | Daily remaining: ${remaining}/${limit}`,
      );
    } else {
      setAiExplainMetaForQuestion(question, `AI: ${provider} (${tier})`);
    }

    const state = getAiState(question, true);
    if (state) {
      state.generated = Boolean(answerText);
      state.collapsed = false;
    }
  } catch (error) {
    const message = String(error?.message || "AI request failed");
    setAiExplainMetaForQuestion(question, message, true);
    setAiExplainOutputForQuestion(
      question,
      "Couldn't load AI explanation right now. Please try again.",
      true,
    );
    const state = getAiState(question, true);
    if (state) {
      state.generated = false;
      state.collapsed = false;
    }
  } finally {
    aiExplainInFlightQuestionKey = "";
    syncAiExplainPanelForCurrentQuestion();
  }
}

async function restoreAuthSession() {
  if (!backendClient.isAuthenticated()) {
    currentUser = null;
    renderAuthState();
    return false;
  }

  try {
    currentUser = await backendClient.fetchMe();
    renderAuthState();
    return true;
  } catch {
    backendClient.clearToken();
    currentUser = null;
    renderAuthState();
    return false;
  }
}

async function ensureAuthenticated() {
  if (currentUser) return true;
  const restored = await restoreAuthSession();
  if (restored) return true;
  openAuthModal("login");
  return false;
}

async function handlePortalEntry() {
  const allowed = await ensureAuthenticated();
  if (!allowed) return;
  showScreen("quiz-menu");
}

async function handleAuthSubmit(event) {
  event.preventDefault();

  const identifier = String(authIdentifierInput?.value || "").trim();
  const title = String(authTitleInput?.value || "").trim();
  const firstName = String(authFirstNameInput?.value || "").trim();
  const lastName = String(authLastNameInput?.value || "").trim();
  const username = String(authUsernameInput?.value || "").trim().toLowerCase();
  const contactType = String(authContactTypeInput?.value || "email")
    .trim()
    .toLowerCase();
  const contactEmail = String(authContactEmailInput?.value || "").trim().toLowerCase();
  const contactCountryCode = String(authContactCountryCodeInput?.value || "").trim();
  const contactLocalNumberRaw = String(authContactPhoneLocalInput?.value || "").trim();
  const role = readSelectedRadioValue("auth-role", "student");
  const professionalType = String(authProfessionalTypeInput?.value || "").trim();
  const country = String(authCountryInput?.value || "").trim();
  const institution = String(authInstitutionInput?.value || "").trim();
  const code = String(authResetCodeInput?.value || "").trim();
  const password = String(authPasswordInput?.value || "");
  let contact = "";

  if (authMode === "login") {
    if (!identifier) {
      setAuthError("Username/contact/email is required.");
      return;
    }
    if (!password || password.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }
  }

  if (authMode === "register") {
    clearAuthFieldValidations();
    let hasInvalidRequired = false;

    if (!title) {
      setFieldValidation(authTitleWrap, "Required");
      hasInvalidRequired = true;
    }
    if (!firstName) {
      setFieldValidation(authFirstNameWrap, "Required");
      hasInvalidRequired = true;
    }
    if (!lastName) {
      setFieldValidation(authLastNameWrap, "Required");
      hasInvalidRequired = true;
    }
    if (!username) {
      setFieldValidation(authUsernameWrap, "Required");
      hasInvalidRequired = true;
    } else if (!USERNAME_INPUT_REGEX.test(username)) {
      setFieldValidation(
        authUsernameWrap,
        "3-30 chars: lowercase letters, numbers, ., _, -",
      );
      hasInvalidRequired = true;
    }
    if (!professionalType) {
      setFieldValidation(authProfTypeWrap, "Required");
      hasInvalidRequired = true;
    }
    if (!country) {
      setFieldValidation(authCountryWrap, "Required");
      hasInvalidRequired = true;
    }
    if (!institution) {
      setFieldValidation(authInstitutionWrap, "Required");
      hasInvalidRequired = true;
    }
    if (!password || password.length < 6) {
      setFieldValidation(authPasswordWrap, "Minimum 6 characters");
      hasInvalidRequired = true;
    }

    if (contactType === "phone") {
      const localRule = getContactRule(country);
      let localDigits = normalizeDigits(contactLocalNumberRaw);
      if (
        localRule &&
        localDigits.length === localRule.max + 1 &&
        localDigits.startsWith("0")
      ) {
        localDigits = localDigits.slice(1);
      }

      if (!contactCountryCode) {
        setFieldValidation(authContactPhoneWrap, "Country code is required");
        hasInvalidRequired = true;
      } else if (localRule?.code && contactCountryCode !== localRule.code) {
        setFieldValidation(
          authContactPhoneWrap,
          `Use ${localRule.code} for ${country}`,
        );
        hasInvalidRequired = true;
      }
      if (!contactLocalNumberRaw) {
        setFieldValidation(authContactPhoneWrap, "Personal number is required");
        hasInvalidRequired = true;
      } else if (localRule && (localDigits.length < localRule.min || localDigits.length > localRule.max)) {
        setFieldValidation(
          authContactPhoneWrap,
          `${country}: enter ${localRule.label}`,
        );
        hasInvalidRequired = true;
      } else if (!localRule && (localDigits.length < 6 || localDigits.length > 14)) {
        setFieldValidation(authContactPhoneWrap, "Enter 6-14 digits");
        hasInvalidRequired = true;
      }

      contact = `${contactCountryCode}${localDigits}`;
    } else {
      if (!contactEmail) {
        setFieldValidation(authContactEmailWrap, "Required");
        hasInvalidRequired = true;
      } else if (!EMAIL_INPUT_REGEX.test(contactEmail)) {
        setFieldValidation(authContactEmailWrap, "Enter a valid email address");
        hasInvalidRequired = true;
      }
      contact = contactEmail;
    }

    if (hasInvalidRequired) {
      setAuthError("Complete all required fields correctly.");
      return;
    }
  }

  if (authMode === "forgot" && !identifier) {
    setAuthError("Enter your username/contact/email first.");
    return;
  }

  if (authMode === "reset") {
    if (!identifier || !code) {
      setAuthError("Identifier and reset code are required.");
      return;
    }
    if (!password || password.length < 6) {
      setAuthError("New password must be at least 6 characters.");
      return;
    }
  }

  if (authSubmitBtn) authSubmitBtn.disabled = true;
  if (authCancelBtn) authCancelBtn.disabled = true;
  if (authTabLoginBtn) authTabLoginBtn.disabled = true;
  if (authTabRegisterBtn) authTabRegisterBtn.disabled = true;
  setAuthError("");

  try {
    if (authMode === "login") {
      const response = await backendClient.login({ identifier, password });
      currentUser = response?.user || (await backendClient.fetchMe());
      renderAuthState();
      closeAuthModal();
      showScreen("quiz-menu");
      return;
    }

    if (authMode === "register") {
      const response = await backendClient.register({
        title,
        firstName,
        lastName,
        username,
        contact,
        role,
        professionalType,
        country,
        institution,
        password,
      });
      currentUser = response?.user || (await backendClient.fetchMe());
      renderAuthState();
      closeAuthModal();
      showScreen("quiz-menu");
      return;
    }

    if (authMode === "forgot") {
      const response = await backendClient.forgotPassword({ identifier });
      const codePreview = String(response?.devResetCode || response?.code || "").trim();
      setAuthMode("reset");
      setAuthInfo(
        codePreview
          ? `Reset code: ${codePreview}. Use it now to set a new password.`
          : String(response?.message || "Reset code sent."),
      );
      if (authResetCodeInput && codePreview) authResetCodeInput.value = codePreview;
      return;
    }

    if (authMode === "reset") {
      await backendClient.resetPassword({
        identifier,
        code,
        newPassword: password,
      });
      setAuthMode("login");
      setAuthInfo("Password reset complete. Sign in with your new password.");
      if (authPasswordInput) authPasswordInput.value = "";
      return;
    }
  } catch (error) {
    setAuthInfo("");
    setAuthError(authErrorMessage(error));
  } finally {
    if (authSubmitBtn) authSubmitBtn.disabled = false;
    if (authCancelBtn) authCancelBtn.disabled = false;
    if (authTabLoginBtn) authTabLoginBtn.disabled = false;
    if (authTabRegisterBtn) authTabRegisterBtn.disabled = false;
  }
}

if (authForm) {
  authForm.addEventListener("submit", handleAuthSubmit);
}

if (authPasswordToggleBtn) {
  authPasswordToggleBtn.onclick = toggleAuthPasswordVisibility;
}

if (authTabLoginBtn) {
  authTabLoginBtn.onclick = () => setAuthMode("login");
}

if (authTabRegisterBtn) {
  authTabRegisterBtn.onclick = () => setAuthMode("register");
}

if (authForgotLinkBtn) {
  authForgotLinkBtn.onclick = () => setAuthMode("forgot");
}

if (authResetLinkBtn) {
  authResetLinkBtn.onclick = () => setAuthMode("reset");
}

if (authBackLoginLinkBtn) {
  authBackLoginLinkBtn.onclick = () => setAuthMode("login");
}

bindValidationClear(authTitleInput, authTitleWrap, "change");
bindValidationClear(authFirstNameInput, authFirstNameWrap);
bindValidationClear(authLastNameInput, authLastNameWrap);
bindValidationClear(authUsernameInput, authUsernameWrap);
bindValidationClear(authContactTypeInput, authContactWrap, "change");
bindValidationClear(authContactEmailInput, authContactEmailWrap);
bindValidationClear(authContactCountryCodeInput, authContactPhoneWrap, "change");
bindValidationClear(authProfessionalTypeInput, authProfTypeWrap, "change");
bindValidationClear(authCountryInput, authCountryWrap, "change");
bindValidationClear(authInstitutionInput, authInstitutionWrap);
bindValidationClear(authPasswordInput, authPasswordWrap);

if (authContactTypeInput) {
  authContactTypeInput.addEventListener("change", () => {
    clearFieldValidation(authContactEmailWrap);
    clearFieldValidation(authContactPhoneWrap);
    if (String(authContactTypeInput.value || "").toLowerCase() === "phone") {
      syncCountryCodeWithCountry();
    }
    toggleAuthContactFields();
  });
}

if (authCountryInput) {
  authCountryInput.addEventListener("change", () => {
    clearFieldValidation(authCountryWrap);
    syncCountryCodeWithCountry();
  });
}

if (authContactPhoneLocalInput) {
  authContactPhoneLocalInput.addEventListener("input", () => {
    const digits = normalizeDigits(authContactPhoneLocalInput.value);
    authContactPhoneLocalInput.value = digits;
    clearFieldValidation(authContactPhoneWrap);
  });
}

if (authCancelBtn) {
  authCancelBtn.onclick = () => {
    closeAuthModal();
    showScreen("home-screen");
  };
}

if (logoutBtn) {
  logoutBtn.onclick = () => {
    closeMenuUserHub();
    backendClient.clearToken();
    profileImageMarkedForDeletion = false;
    pendingProfileImage = "";
    if (profilePhotoUrlInput) profilePhotoUrlInput.value = "";
    refreshProfilePhotoDeleteVisibility();
    currentUser = null;
    renderAuthState();
    closeAuthModal();
    showScreen("home-screen");
  };
}

async function loadProfilePhotoFromFile(file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    setProfileFeedback("Please choose an image file.", true);
    return;
  }
  if (file.size > 15 * 1024 * 1024) {
    setProfileFeedback("Image is too large. Use a file under 15MB.", true);
    return;
  }

  const readAsDataUrl = (sourceFile) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsDataURL(sourceFile);
    });

  const loadImageFromDataUrl = (dataUrl) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = dataUrl;
    });

  const originalDataUrl = await readAsDataUrl(file);
  let dataUrl = originalDataUrl;

  // Optimize local images so typical phone/camera files can be used reliably.
  if (!/^data:image\/gif;base64,/i.test(originalDataUrl)) {
    try {
      const img = await loadImageFromDataUrl(originalDataUrl);
      const canvas = document.createElement("canvas");
      let width = Number(img.naturalWidth || img.width || 0);
      let height = Number(img.naturalHeight || img.height || 0);

      if (width > 0 && height > 0) {
        const maxDim = 720;
        const scale = Math.min(1, maxDim / Math.max(width, height));
        width = Math.max(1, Math.round(width * scale));
        height = Math.max(1, Math.round(height * scale));
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          const targetChars = 2400000; // Keep below backend ceiling.
          let quality = 0.9;
          let pass = 0;
          let workingW = width;
          let workingH = height;

          do {
            canvas.width = workingW;
            canvas.height = workingH;
            ctx.clearRect(0, 0, workingW, workingH);
            ctx.drawImage(img, 0, 0, workingW, workingH);
            const candidateWebp = canvas.toDataURL("image/webp", quality);
            const candidateJpeg = canvas.toDataURL("image/jpeg", quality);
            dataUrl =
              candidateWebp.length <= candidateJpeg.length
                ? candidateWebp
                : candidateJpeg;

            if (dataUrl.length <= targetChars) break;
            quality = Math.max(0.55, quality - 0.1);
            workingW = Math.max(220, Math.round(workingW * 0.88));
            workingH = Math.max(220, Math.round(workingH * 0.88));
            pass += 1;
          } while (pass < 6);
        }
      }
    } catch {
      // Keep original data URL if optimization fails.
      dataUrl = originalDataUrl;
    }
  }

  if (dataUrl.length > 2900000) {
    setProfileFeedback(
      "This image format/size is still too large. Try JPG/PNG under ~5MB.",
      true,
    );
    return;
  }

  profileImageMarkedForDeletion = false;
  pendingProfileImage = dataUrl;
  if (profilePhotoUrlInput) profilePhotoUrlInput.value = "";
  setProfileAvatarPreview(dataUrl);
  updateProfileButtonAvatar(dataUrl);
  refreshProfilePhotoDeleteVisibility();
  setProfileFeedback("Profile picture ready. Click Save Profile to apply.");
}

async function saveProfile() {
  if (!currentUser) return;

  const currentImage = String(currentUser.profileImage || "").trim();
  const typedImageUrl = String(profilePhotoUrlInput?.value || "").trim();
  const resolvedImage = profileImageMarkedForDeletion
    ? ""
    : typedImageUrl || pendingProfileImage || currentImage;
  const payload = {
    title: String(profileTitleInput?.value || "").trim() || String(currentUser.title || "").trim() || "Mr",
    firstName:
      String(profileFirstNameInput?.value || "").trim() ||
      String(currentUser.firstName || "").trim(),
    lastName:
      String(profileLastNameInput?.value || "").trim() ||
      String(currentUser.lastName || "").trim(),
    username:
      String(profileUsernameInput?.value || "").trim().toLowerCase() ||
      String(currentUser.username || "").trim().toLowerCase(),
    contact:
      String(profileContactInput?.value || "").trim() ||
      String(currentUser.contact || currentUser.email || "").trim(),
    role:
      readSelectedRadioValue("profile-role", String(currentUser.role || "student").trim().toLowerCase()),
    professionalType:
      String(profileProfessionalTypeInput?.value || "").trim() ||
      String(currentUser.professionalType || "Other").trim(),
    country:
      String(profileCountryInput?.value || "").trim() ||
      String(currentUser.country || "").trim() ||
      "Not Set",
    institution:
      String(profileInstitutionInput?.value || "").trim() ||
      String(currentUser.institution || "").trim() ||
      "Not Set",
    profileImage: resolvedImage,
  };

  if (
    !payload.firstName ||
    !payload.lastName ||
    !payload.username ||
    !payload.contact
  ) {
    setProfileFeedback(
      "First name, surname, username and contact are required.",
      true,
    );
    return;
  }
  if (!isValidContactValue(payload.contact)) {
    setProfileFeedback(
      "Contact must be a valid email or phone in international format (e.g., +233XXXXXXXXX).",
      true,
    );
    return;
  }

  try {
    const response = await backendClient.updateProfile(payload);
    currentUser = response?.user || (await backendClient.fetchMe());
    profileImageMarkedForDeletion = false;
    pendingProfileImage = String(currentUser.profileImage || "").trim();
    if (profilePhotoUrlInput) {
      profilePhotoUrlInput.value = /^https?:\/\//i.test(pendingProfileImage)
        ? pendingProfileImage
        : "";
    }
    refreshProfilePhotoDeleteVisibility();
    renderAuthState();
    setProfileFeedback("Profile updated successfully.");
  } catch (error) {
    setProfileFeedback(authErrorMessage(error), true);
  }
}

async function changeProfilePassword() {
  const currentPassword = String(profileCurrentPasswordInput?.value || "");
  const newPassword = String(profileNewPasswordInput?.value || "");
  if (!currentPassword || !newPassword) {
    setProfileFeedback("Enter current and new password.", true);
    return;
  }
  if (newPassword.length < 6) {
    setProfileFeedback("New password must be at least 6 characters.", true);
    return;
  }

  try {
    await backendClient.changePassword({ currentPassword, newPassword });
    if (profileCurrentPasswordInput) profileCurrentPasswordInput.value = "";
    if (profileNewPasswordInput) profileNewPasswordInput.value = "";
    setProfileFeedback("Password changed successfully.");
  } catch (error) {
    setProfileFeedback(authErrorMessage(error), true);
  }
}

async function deactivateProfileAccount() {
  const days = Number(profileDeactivateDaysInput?.value || 30);
  if (!Number.isInteger(days) || days < 1 || days > 30) {
    setProfileFeedback("Deactivate days must be between 1 and 30.", true);
    return;
  }
  if (
    !confirm(
      `Deactivate this account for ${days} day(s)? It will be auto-deleted after that window.`,
    )
  ) {
    return;
  }

  try {
    await backendClient.deactivateAccount(days);
    backendClient.clearToken();
    profileImageMarkedForDeletion = false;
    pendingProfileImage = "";
    if (profilePhotoUrlInput) profilePhotoUrlInput.value = "";
    refreshProfilePhotoDeleteVisibility();
    currentUser = null;
    renderAuthState();
    showScreen("home-screen");
    alert("Account deactivated. It will be deleted automatically after the selected period.");
  } catch (error) {
    setProfileFeedback(authErrorMessage(error), true);
  }
}

async function deleteProfileAccount() {
  if (!confirm("Delete account permanently? This cannot be undone.")) return;
  if (!confirm("Final warning: this will delete your account and history forever.")) return;

  try {
    await backendClient.deleteAccount();
    backendClient.clearToken();
    profileImageMarkedForDeletion = false;
    pendingProfileImage = "";
    if (profilePhotoUrlInput) profilePhotoUrlInput.value = "";
    refreshProfilePhotoDeleteVisibility();
    currentUser = null;
    renderAuthState();
    showScreen("home-screen");
    alert("Account deleted.");
  } catch (error) {
    setProfileFeedback(authErrorMessage(error), true);
  }
}

async function openProfileScreen() {
  const ok = await ensureAuthenticated();
  if (!ok || !currentUser) return;
  setProfileFeedback("");
  fillProfileForm();
  setProfilePanelOpen(
    profilePasswordPanel,
    profilePasswordToggleBtn,
    false,
    "Open Password Section",
    "Close Password Section",
  );
  setProfilePanelOpen(
    profileDangerPanel,
    profileDangerToggleBtn,
    false,
    "Open Account Controls",
    "Close Account Controls",
  );
  showScreen("profile-screen");
}

if (profileBtn) {
  profileBtn.onclick = () => {
    closeMenuUserHub();
    openProfileScreen();
  };
}

if (profileBackBtn) {
  profileBackBtn.onclick = () => showScreen("quiz-menu");
}

if (profileSaveBtn) {
  profileSaveBtn.onclick = saveProfile;
}

if (profilePasswordToggleBtn) {
  profilePasswordToggleBtn.onclick = () => {
    const shouldOpen = profilePasswordPanel?.classList.contains("hidden");
    setProfilePanelOpen(
      profilePasswordPanel,
      profilePasswordToggleBtn,
      Boolean(shouldOpen),
      "Open Password Section",
      "Close Password Section",
    );
  };
}

if (profileChangePasswordBtn) {
  profileChangePasswordBtn.onclick = changeProfilePassword;
}

if (profileDangerToggleBtn) {
  profileDangerToggleBtn.onclick = () => {
    const shouldOpen = profileDangerPanel?.classList.contains("hidden");
    setProfilePanelOpen(
      profileDangerPanel,
      profileDangerToggleBtn,
      Boolean(shouldOpen),
      "Open Account Controls",
      "Close Account Controls",
    );
  };
}

if (profileDeactivateBtn) {
  profileDeactivateBtn.onclick = deactivateProfileAccount;
}

if (profileDeleteBtn) {
  profileDeleteBtn.onclick = deleteProfileAccount;
}

if (profilePhotoUrlInput) {
  profilePhotoUrlInput.addEventListener("input", () => {
    const next = String(profilePhotoUrlInput.value || "").trim();
    profileImageMarkedForDeletion = false;
    if (next) {
      pendingProfileImage = next;
      setProfileAvatarPreview(next);
      updateProfileButtonAvatar(next);
      refreshProfilePhotoDeleteVisibility();
      return;
    }

    pendingProfileImage = String(currentUser?.profileImage || "").trim();
    const fallback = getCurrentProfileImage();
    setProfileAvatarPreview(fallback);
    updateProfileButtonAvatar(fallback);
    refreshProfilePhotoDeleteVisibility();
  });
}

if (profilePhotoCameraBtn && profilePhotoFileCameraInput) {
  profilePhotoCameraBtn.addEventListener("click", () => {
    profilePhotoFileCameraInput.click();
  });
}

if (profilePhotoGalleryBtn && profilePhotoFileGalleryInput) {
  profilePhotoGalleryBtn.addEventListener("click", () => {
    profilePhotoFileGalleryInput.click();
  });
}

if (profilePhotoFileCameraInput) {
  profilePhotoFileCameraInput.addEventListener("change", () => {
    const file = profilePhotoFileCameraInput.files?.[0];
    loadProfilePhotoFromFile(file).catch(() => {
      setProfileFeedback("Failed to read selected image.", true);
    });
    profilePhotoFileCameraInput.value = "";
  });
}

if (profilePhotoFileGalleryInput) {
  profilePhotoFileGalleryInput.addEventListener("change", () => {
    const file = profilePhotoFileGalleryInput.files?.[0];
    loadProfilePhotoFromFile(file).catch(() => {
      setProfileFeedback("Failed to read selected image.", true);
    });
    profilePhotoFileGalleryInput.value = "";
  });
}

if (profilePhotoDeleteBtn) {
  profilePhotoDeleteBtn.addEventListener("click", () => {
    profileImageMarkedForDeletion = true;
    pendingProfileImage = "";
    if (profilePhotoUrlInput) profilePhotoUrlInput.value = "";
    setProfileAvatarPreview("");
    updateProfileButtonAvatar("");
    refreshProfilePhotoDeleteVisibility();
    setProfileFeedback("Profile picture removed. Click Save Profile to apply.");
  });
}

if (aiExplainBtn) {
  aiExplainBtn.addEventListener("click", () => {
    handleAiExplainClick();
  });
}

if (aiExplainToggleBtn) {
  aiExplainToggleBtn.addEventListener("click", () => {
    toggleAiExplainPanel();
  });
}

if (topicLinkBtnEl) {
  topicLinkBtnEl.addEventListener("click", (event) => {
    const href = String(topicLinkBtnEl.getAttribute("href") || "").trim();
    if (!href || href === "#") return;

    event.preventDefault();
    const currentQuestion = Array.isArray(active) ? active[current] : null;
    const title = currentQuestion?.topicSlug
      ? prettifyTopicSlug(currentQuestion.topicSlug)
      : "Study Note";
    openTopicViewer(href, title, "quiz-area");
  });
}

function openExamExitModal() {
  confirmExitBtn.disabled = false; // 🔥 reset button every time modal opens
  examExitModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeExamExitModal() {
  examExitModal.classList.add("hidden");
  document.body.style.overflow = ""; // restore scroll
}

cancelExitBtn.onclick = closeExamExitModal;

confirmExitBtn.onclick = function () {
  confirmExitBtn.disabled = true; // prevent double tap
  closeExamExitModal();
  finishExam();
};

// ==============================
// STUDY EXIT MODAL
// ==============================

const studyExitModal = document.getElementById("study-exit-modal");
const cancelStudyExitBtn = document.getElementById("cancel-study-exit-btn");
const confirmStudyExitBtn = document.getElementById("confirm-study-exit-btn");
const endStudyBtn = document.getElementById("end-study-btn");

function openStudyExitModal() {
  confirmStudyExitBtn.disabled = false;
  studyExitModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeStudyExitModal() {
  studyExitModal.classList.add("hidden");
  document.body.style.overflow = "";
}

endStudyBtn.onclick = openStudyExitModal;

cancelStudyExitBtn.onclick = closeStudyExitModal;

confirmStudyExitBtn.onclick = function () {
  confirmStudyExitBtn.disabled = true;
  closeStudyExitModal();
  endStudySession();
};

backBtnQuiz.onclick = function () {
  if (mode === "study") {
    saveStudyProgress();
    showScreen("study-setup");
    return;
  }

  if (mode === "exam" || mode === "smart") {
    openExamExitModal();
  }
};

if (menuBtnQuiz) {
  menuBtnQuiz.onclick = function () {
    if (mode === "study") {
      saveStudyProgress();
      showScreen("quiz-menu");
      return;
    }

    if (mode === "exam" || mode === "smart") {
      openExamExitModal();
    }
  };
}

if (backHomeBtn) {
  backHomeBtn.onclick = () => {
    closeMenuUserHub();
    closeAuthModal();
    showScreen("home-screen");
  };
}

document.getElementById("study-back-btn").onclick = () => {
  showScreen("quiz-menu");
};
document.getElementById("exam-back-btn").onclick = () => {
  showScreen("quiz-menu");
};

const enterBtn = document.getElementById("enter-platform-btn");
if (enterBtn) {
  enterBtn.onclick = handlePortalEntry;
}

document.getElementById("start-exam-btn").onclick = async function () {
  const count = document.getElementById("exam-count-select").value;

  if (!count) {
    showCountTooltip();
    return;
  }

  await startExam(count);
};

function showCountTooltip() {
  const select = document.getElementById("exam-count-select");

  const tooltip = document.createElement("div");
  tooltip.innerText = "Please select question count";
  tooltip.style.position = "absolute";
  tooltip.style.background = "#d32f2f";
  tooltip.style.color = "white";
  tooltip.style.padding = "6px 12px";
  tooltip.style.borderRadius = "6px";
  tooltip.style.fontSize = "12px";
  tooltip.style.marginTop = "5px";

  select.parentElement.appendChild(tooltip);

  setTimeout(() => {
    tooltip.remove();
  }, 2000);
}

backReviewBtn.onclick = function () {
  inReview = false; // 🔥 reset properly
  showScreen("review-screen");
  buildReviewPalette();
  backReviewBtn.classList.add("hidden");
};

if (studyBtn) {
  studyBtn.onclick = () => {
    document.getElementById("start-study-btn").onclick = startStudy;
    updateStudyBestStreakDisplay();
    renderModeHistory("Study", "study-history");
    showScreen("study-setup");

    nextBtn.onclick = nextQuestion;
    prevBtn.onclick = previousQuestion;
  };
}

if (examBtn) {
  examBtn.onclick = () => {
    showScreen("exam-setup");
  };
}

/* ==============================
                     DASHBOARD
                  ================================= */

const dashboardDiv = document.getElementById("dashboard");

if (dashboardBtn) {
  dashboardBtn.onclick = showDashboard;
}

function renderDashboardValues({
  totalAttempts = 0,
  overallAccuracy = 0,
  weakCount = 0,
  categories = [],
}) {
  document.getElementById("dash-total").innerText = totalAttempts;
  document.getElementById("dash-accuracy").innerText = overallAccuracy + "%";
  document.getElementById("dash-weak").innerText = weakCount;

  const container = document.getElementById("dash-categories");
  container.innerHTML = "";

  if (!Array.isArray(categories) || categories.length === 0) {
    container.innerHTML = '<div class="no-data">No category data yet.</div>';
    return;
  }

  categories.forEach((rowData) => {
    const category = rowData.category || "General";
    const attempts = Number(rowData.attempts) || 0;
    const accuracy = Number(rowData.accuracy) || 0;

    const row = document.createElement("div");
    row.className = "category-row";

    row.innerHTML = `
      <div class="category-info">
        <div class="category-name">${category}</div>
        <div class="category-meta">${attempts} attempts</div>
      </div>
      <div class="category-bar">
        <div class="category-fill" style="width:${accuracy}%"></div>
      </div>
      <div class="category-percent">${accuracy}%</div>
    `;

    container.appendChild(row);
  });
}

function showDashboard() {
  showScreen("dashboard");

  let totalAttempts = 0;
  let totalCorrect = 0;
  let weakCount = 0;

  questionBank.forEach((q) => {
    const data = performanceData[q.id];
    if (data) {
      totalAttempts += data.attempts;
      totalCorrect += data.correct;
      if (isWeak(q.id)) weakCount++;
    }
  });

  const overallAccuracy =
    totalAttempts === 0 ? 0 : Math.round((totalCorrect / totalAttempts) * 100);

  renderDashboardValues({
    totalAttempts,
    overallAccuracy,
    weakCount,
    categories: Object.keys(categoryPerformance).map((cat) => ({
      category: cat,
      attempts: categoryPerformance[cat].attempts,
      accuracy: getCategoryAccuracy(cat),
    })),
  });

  backendClient
    .fetchSyncedDashboard()
    .then((remote) => {
      if (!remote || typeof remote !== "object") return;

      renderDashboardValues({
        totalAttempts:
          Number(remote.totalAttempts ?? remote.totalQuestionAttempts) || 0,
        overallAccuracy: Number(remote.overallAccuracy) || 0,
        weakCount: Number(remote.weakQuestions) || 0,
        categories: Array.isArray(remote.categories) ? remote.categories : [],
      });
    })
    .catch(() => {
      // Keep local dashboard when backend is not reachable.
    });

  document.getElementById("dashboard-close-btn").onclick = hideDashboard;
}

function hideDashboard() {
  showScreen("quiz-menu");
}

function saveSession(mode, score, total, duration = null) {
  const percent = Math.round((score / total) * 100);

  const entry = {
    mode,
    score,
    total,
    percent,
    date: new Date().toLocaleString(),
    duration,
  };

  // Add to top
  sessionHistory.unshift(entry);

  // Keep only last 20 sessions
  if (sessionHistory.length > 20) {
    sessionHistory.pop();
  }

  localStorage.setItem("quizSessionHistory", JSON.stringify(sessionHistory));

  backendClient.syncSession(entry);

  renderModeHistory("Study", "study-history");
  renderModeHistory("Exam", "exam-history");
}

function getTrend() {
  if (sessionHistory.length < 2) return "";

  const latest = sessionHistory[0].percent;
  const previous = sessionHistory[1].percent;

  if (latest > previous) return "📈 Improving";
  if (latest < previous) return "📉 Declining";
  return "➡ Stable";
}

function renderModeHistory(modeName, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const renderEntries = (entries) => {
    container.innerHTML = "";

    if (entries.length === 0) {
      container.innerHTML = `
        <div style="font-size:13px; font-weight:700; margin-bottom:14px;">
          No attempts yet.
        </div>
      `;
      return;
    }

    entries.forEach((s) => {
      const div = document.createElement("div");
      div.innerHTML = `
    <div style="
      display:flex;
      justify-content:space-between;
      align-items:center;
      padding:14px 0;
      border-bottom:1px solid #eef2f7;
    ">
      <div>
        <div style="
          font-size:16px;
          font-weight:700;
          color:#1e3c72;
        ">
          ${s.score}/${s.total}
        </div>

        <div style="
          font-size:11px;
          opacity:0.6;
          margin-top:4px;
        ">
          ${s.date}
        </div>
      </div>

      <div style="
        padding:6px 16px;
        border-radius:20px;
        font-size:12px;
        font-weight:600;
        background:${s.percent >= 80 ? "#e6f4ea" : "#fdecea"};
        color:${s.percent >= 80 ? "#2e7d32" : "#c62828"};
      ">
        ${s.percent}%
      </div>
    </div>
  `;

      container.appendChild(div);
    });
  };

  const localEntries = sessionHistory.filter((s) =>
    s.mode.startsWith(modeName),
  );
  renderEntries(localEntries);

  backendClient
    .fetchSyncedHistory(modeName)
    .then((data) => {
      if (!Array.isArray(data?.sessions) || data.sessions.length === 0) return;

      const remoteEntries = data.sessions.map((s) => ({
        mode: s.mode || modeName,
        score: Number(s.score) || 0,
        total: Number(s.total) || 0,
        percent: Number(s.percent) || 0,
        date: s.date || "",
        duration: s.duration || null,
      }));

      renderEntries(remoteEntries);
    })
    .catch(() => {
      // Keep local history when backend is offline.
    });
}

function toggleHistory() {
  const list = document.getElementById("history-list");
  if (!list) return;

  if (list.style.display === "none") {
    list.style.display = "block";
  } else {
    list.style.display = "none";
  }
}

function clearHistory() {
  const confirmClear = confirm("Clear all session history?");
  if (!confirmClear) return;

  sessionHistory = [];

  localStorage.removeItem("quizSessionHistory");

  renderModeHistory("Study", "study-history");
  renderModeHistory("Exam", "exam-history");
  renderModeHistory("Smart", "smart-history");
}

function backToMenu() {
  showScreen("quiz-menu");
}

function buildCategorySummary() {
  let summary = "";

  Object.keys(categoryPerformance).forEach((cat) => {
    const accuracy = getCategoryAccuracy(cat);
    summary += `
                        <p>
                          <strong>${cat}</strong> — ${accuracy}%
                        </p>
                      `;
  });

  return summary || "<p>No category data yet.</p>";
}

function getAdaptiveQuestions(count) {
  const weakCats = getWeakCategories();
  const weighted = [];

  questionBank.forEach((q) => {
    let weight = 1;

    if (weakCats.includes(q.category)) {
      weight = 3;
    }

    weighted.push({
      question: q,
      weight: weight,
    });
  });

  const selected = [];

  while (selected.length < count && weighted.length > 0) {
    const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < weighted.length; i++) {
      random -= weighted[i].weight;

      if (random <= 0) {
        selected.push(weighted[i].question);
        weighted.splice(i, 1); // remove to prevent duplicates
        break;
      }
    }
  }

  return selected;
}

function updateStreak(isCorrect) {
  if (mode !== "study") return;

  const streakBox = document.getElementById("streak-box");
  const streakValue = document.getElementById("streak-value");

  if (isCorrect) {
    currentStreak++;

    if (currentStreak > bestStreak) {
      bestStreak = currentStreak;
      localStorage.setItem("quizBestStreak", bestStreak);
    }

    // Animate
    streakBox.classList.add("streak-animate");
    setTimeout(() => {
      streakBox.classList.remove("streak-animate");
    }, 400);
  } else {
    currentStreak = 0;
  }

  streakValue.innerText = currentStreak;

  // heat classes
  streakBox.classList.remove(
    "tier-basic",
    "tier-blue",
    "tier-green",
    "tier-gold",
    "tier-fire",
    "tier-legend",
  );

  if (currentStreak < 5) {
    streakBox.classList.add("tier-basic");
  } else if (currentStreak < 10) {
    streakBox.classList.add("tier-blue");
  } else if (currentStreak < 25) {
    streakBox.classList.add("tier-green");
  } else if (currentStreak < 50) {
    streakBox.classList.add("tier-gold");
  } else if (currentStreak < 100) {
    streakBox.classList.add("tier-fire");
  } else {
    streakBox.classList.add("tier-legend");
  }
}

function populateExamCategories() {
  const select = document.getElementById("category-select");
  if (!select) return;

  select.innerHTML = '<option value="">All Categories</option>';

  MAJOR_CATEGORIES.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.innerText = cat;
    select.appendChild(option);
  });
}
function populateStudyCategories() {
  const select = document.getElementById("study-category-select");
  if (!select) return;

  select.innerHTML = '<option value="all">All Categories</option>';

  MAJOR_CATEGORIES.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.innerText = `Study – ${cat}`;
    select.appendChild(option);
  });
}

function updateModeIndicator(studyType = null) {
  const indicator = document.getElementById("mode-indicator");
  const headerStats = document.getElementById("header-stats");
  const timerEl = document.getElementById("timer");

  if (!indicator) return;
  if (quizArea) {
    quizArea.classList.remove("mode-study", "mode-exam", "mode-smart");
  }

  if (mode === "study") {
    if (studyType === "weak") {
      indicator.innerText = "📚 Practice Weak Areas";
    } else {
      indicator.innerText = "📚 Study Mode";
    }

    if (headerStats) headerStats.style.display = "flex";
    if (timerEl) timerEl.classList.add("hidden");
    if (quizArea) quizArea.classList.add("mode-study");
  } else if (mode === "exam") {
    indicator.innerText = "📝 Exam Mode";

    if (headerStats) headerStats.style.display = "none";
    if (timerEl) timerEl.classList.remove("hidden");
    if (quizArea) quizArea.classList.add("mode-exam");
  } else if (mode === "smart") {
    indicator.innerText = "Smart Exam";

    if (headerStats) headerStats.style.display = "none";
    if (timerEl) timerEl.classList.remove("hidden");
    if (quizArea) quizArea.classList.add("mode-smart");
  }
}
/* ==============================
                           START MODES
                        ================================= */

function startStudy() {
  studySessionEnded = false;
  clearAiExplainStateSession();

  clearInterval(examTimer);
  examTimer = null;

  timerEl.classList.add("hidden");
  timerEl.innerText = "";

  const studyType = document.getElementById("study-type-select").value;
  const selectedCategory = document.getElementById(
    "study-category-select",
  ).value;

  const sessionKey = studyType === "weak" ? "practiceSession" : "studySession";

  const savedSession = localStorage.getItem(sessionKey);

  if (savedSession) {
    const state = JSON.parse(savedSession);
    const resume = confirm("Resume previous session?");

    if (resume) {
      mode = "study";
      const studyType = document.getElementById("study-type-select").value;
      activeCase = "";
      active = state.active;
      current = state.current;
      userAnswers = state.userAnswers;
      currentStreak = state.currentStreak || 0;

      updateModeIndicator(state.studyType);

      showScreen("quiz-area");

      showQuestion();

      restoreStreakUI();

      return;
    } else {
      localStorage.removeItem(sessionKey);
    }
  }

  // ===============================
  // Fresh Session
  // ===============================
  mode = "study";
  clearInterval(examTimer);
  examTimer = null;
  current = 0;
  score = 0;
  userAnswers = {};
  currentStreak = 0;

  // ===============================
  // NORMAL STUDY (Chronological)
  // ===============================
  if (studyType === "normal") {
    updateModeIndicator("normal");

    if (selectedCategory === "all") {
      active = JSON.parse(JSON.stringify(questionBank));
      // chronological
    } else {
      active = questionBank.filter((q) => q.category === selectedCategory);
      if (active.length === 0) {
        alert("No questions available in this category yet.");
        return;
      }
    }

    // Start attempt on backend if ready
    if (backendReady) {
      backendClient
        .startAttempt({
          mode: "study",
          category: selectedCategory,
          questionIds: active.map((q) => Number(q.id)),
        })
        .then((result) => {
          backendAttemptId = result.attemptId;
          console.info("Backend study attempt started:", backendAttemptId);
        })
        .catch((err) => {
          console.warn("Failed to start backend attempt:", err);
        });
    }
    // 🔥 Start From Logic (Normal Study Only)
    const startNumberInput =
      document.getElementById("study-start-number").value;

    if (startNumberInput && selectedCategory === "all") {
      const startIndex = parseInt(startNumberInput) - 1;

      if (startIndex >= 0 && startIndex < active.length) {
        current = startIndex;
      }
    }

    const masteryEl = document.getElementById("mastery-progress");
    if (masteryEl) masteryEl.classList.add("hidden");
  }

  // ===============================
  // NEW WEAK PRACTICE ENGINE
  // ===============================
  // ===============================
  // NEW WEAK PRACTICE ENGINE
  // ===============================
  if (studyType === "weak") {
    updateModeIndicator("weak");

    const weakIds = Object.keys(weakTracker);

    if (weakIds.length === 0) {
      alert("No weak questions available yet.");
      return;
    }

    active = weakIds.map((id) => findQuestionById(id)).filter(Boolean);

    current = 0;
  }
  showScreen("quiz-area");

  showQuestion();
}

function startExam(count) {
  mode = "exam";
  clearAiExplainStateSession();

  clearInterval(examTimer);
  examTimer = null;

  current = 0;
  score = 0;
  userAnswers = {};
  inReview = false;

  count = count === "all" ? questionBank.length : parseInt(count);

  let questionPool;

  if (mode === "smart") {
    questionPool = getAdaptiveQuestions(count);
  } else {
    const selectedCategory = document.getElementById("category-select").value;

    if (selectedCategory) {
      questionPool = questionBank.filter(
        (q) => q.category === selectedCategory,
      );

      if (questionPool.length === 0) {
        alert("No questions available in this category yet.");
        return;
      }

      questionPool = shuffle([...questionPool]);
    } else {
      questionPool = shuffle([...questionBank]);
    }
  }

  active = questionPool.slice(0, count);

  if (mode === "smart") {
    active.forEach((q) => (q.smartFlag = true));
  }

  // Start attempt on backend if ready
  if (backendReady) {
    backendClient
      .startAttempt({
        mode: "exam",
        category: document.getElementById("category-select")?.value || "all",
        questionIds: active.map((q) => Number(q.id)),
      })
      .then((result) => {
        backendAttemptId = result.attemptId;
        console.info("Backend attempt started:", backendAttemptId);
      })
      .catch((err) => {
        console.warn("Failed to start backend attempt:", err);
      });
  }

  examTimeLeft = active.length * 40;

  updateModeIndicator();
  showScreen("quiz-area");
  startExamTimer();
  showQuestion();
}

function startQuiz() {
  showScreen("quiz-area");
  showQuestion();
}

/* ==============================
                           SHOW QUESTION
                        ================================= */

function showQuestion() {
  // 🔥 HARD RESET NAVIGATION STATE
  prevBtn.classList.remove("hidden");
  nextBtn.classList.remove("hidden");
  if (!inReview) {
    backReviewBtn.classList.add("hidden");
  }
  answersEl.innerHTML = "";
  document.getElementById("combo-block").innerHTML = "";

  if (explanationEl) {
    explanationEl.classList.add("hidden");
    explanationEl.innerText = "";
  }
  if (topicLinkWrapEl) {
    topicLinkWrapEl.classList.add("hidden");
  }
  resetAiExplainPanel();
  answersEl.innerHTML = "";

  const q = active[current];

  answeredCurrent = false;

  // Study Mode Progress
  if (mode === "study") {
    progressEl.innerText = `Question ${current + 1} of ${active.length}`;
    const answered = Object.keys(userAnswers).length;
    const correctSoFar = calculateScore();
    liveScore.innerText = `${correctSoFar}/${answered}`;
  } else {
    progressEl.innerText = "";
    liveScore.innerText = "";
  }

  const endStudyBtn = document.getElementById("end-study-btn");

  if (mode === "study" && !inStudyReview) {
    endStudyBtn.classList.remove("hidden");
  } else {
    endStudyBtn.classList.add("hidden");
  }

  if (mode === "study") {
    const questionAccuracy = getAccuracy(q.id);
    const categoryAccuracy = getCategoryAccuracy(q.category);

    progressEl.innerText +=
      ` | Q Accuracy: ${questionAccuracy}%` +
      ` | Category: ${q.category} (${categoryAccuracy}%)`;
  }

  let displayText = q.question;

  if (mode === "exam" || mode === "smart") {
    const chronologicalNumber = current + 1;
    displayText =
      `Question ${chronologicalNumber}<br><br>` +
      q.question.replace(/^Q\d+\.\s*/, "");
  }

  // Find case text if this question belongs to a case group
  let caseText = "";

  if (q.caseId && caseMap[q.caseId]) {
    caseText = caseMap[q.caseId];
  }

  // Render
  if (caseText) {
    questionEl.innerHTML =
      `<strong>Case:</strong><br>${caseText}<br><br>` + displayText;
  } else {
    questionEl.innerHTML = displayText;
  }

  const optionList = Array.isArray(q.options) ? q.options : [];
  const statementList = Array.isArray(q.statements) ? q.statements : [];

  if (q.type === "match" || q.type === "single") {
    optionList.forEach((opt) => {
      const btn = document.createElement("button");
      btn.innerText = opt;
      btn.dataset.value = opt;
      btn.onclick = () => selectAnswer(opt, q);
      answersEl.appendChild(btn);
    });
  }

  if (q.type === "combo") {
    statementList.forEach((s, index) => {
      const p = document.createElement("p");

      // Auto-number if not already numbered
      if (!/^\d+\./.test(s.trim())) {
        p.innerText = `${index + 1}. ${s}`;
      } else {
        p.innerText = s;
      }

      comboBlock.appendChild(p);
    });

    const comboOptions = [
      { letter: "A", text: "A: 1, 2 and 3" },
      { letter: "B", text: "B: 1 and 2 only" },
      { letter: "C", text: "C: 2 and 3 only" },
      { letter: "D", text: "D: 1 only" },
      { letter: "E", text: "E: 3 only" },
    ];

    comboOptions.forEach((option) => {
      const btn = document.createElement("button");
      btn.innerText = option.text;
      btn.dataset.value = option.letter;
      btn.onclick = () => selectAnswer(option.letter, q);
      answersEl.appendChild(btn);
    });
  }

  if (answersEl.children.length === 0) {
    const fallback = document.createElement("div");
    fallback.className = "no-options-fallback";
    fallback.innerText = "This question has no answer options configured yet.";
    answersEl.appendChild(fallback);
  }

  restoreSelection(q);
}

/* ==============================
                            SELECT ANSWER
                        ================================= */

function selectAnswer(value, q) {
  if (inDetailedReview) return;
  userAnswers[q.id] = value;

  // Sync answer to backend if available
  if (backendReady && backendAttemptId) {
    backendClient.answerAttempt(backendAttemptId, q.id, value);
  }

  if (mode === "study") {
    updatePerformance(q.id, value === q.correct);
    const studyType = document.getElementById("study-type-select").value;

    if (mode === "study" && studyType === "normal") {
      if (value !== q.correct) {
        if (!weakTracker[q.id]) {
          weakTracker[q.id] = { roundsPassed: 0 };
          saveWeakTracker();
        }
      }
    }
  }
  // ===============================
  // WEAK ROUND PROGRESSION
  // ===============================
  const studyType = document.getElementById("study-type-select").value;

  if (mode === "study" && studyType === "weak") {
    const isCorrect = value === q.correct;

    if (isCorrect) {
      weakTracker[q.id].roundsPassed++;

      // If 2 consecutive rounds passed → remove permanently
      if (weakTracker[q.id].roundsPassed >= 2) {
        delete weakTracker[q.id];
      }
    } else {
      // Reset progress on wrong answer
      weakTracker[q.id].roundsPassed = 0;
    }

    saveWeakTracker();
  }
  // 🔥 Mastery Engine Refresh
  if (mode === "study") {
    const studyType = document.getElementById("study-type-select").value;
  }

  updateStreak(value === q.correct);
  if (!studySessionEnded) {
    saveStudyProgress();
  }

  if ((mode === "exam" || mode === "smart") && !inReview) {
    saveExamSession();
    if (current < active.length - 1) {
      current++;
      showQuestion();
    } else {
      goToReview();
    }
    return;
  }

  // Study logic continues...

  // -------- STUDY MODE --------

  const buttons = document.querySelectorAll("#answers button");

  buttons.forEach((btn) => {
    btn.disabled = true;

    const btnValue = btn.dataset.value;
    btn.innerText.startsWith("A") ||
    btn.innerText.startsWith("B") ||
    btn.innerText.startsWith("C") ||
    btn.innerText.startsWith("D") ||
    btn.innerText.startsWith("E")
      ? btn.innerText[0]
      : btn.innerText;

    if (btnValue === q.correct) {
      btn.classList.add("correct");
    }

    if (btnValue === value && value !== q.correct) {
      btn.classList.add("wrong");
    }
  });

  const answered = Object.keys(userAnswers).length;
  const correctNow = calculateScore();
  liveScore.innerText = `${correctNow}/${answered}`;
  if (explanationEl) {
    explanationEl.innerText = q.explanation;
    explanationEl.classList.remove("hidden");
  }
  renderQuestionTopicLink(q);
  refreshAiExplainAvailability();
  answeredCurrent = true;
  nextBtn.innerText = current === active.length - 1 ? "Finish" : "Next";
}

/* ==============================
                           NAVIGATION
                        ================================= */

function nextQuestion() {
  if (inStudyReview) return;
  if (mode === "exam" || mode === "smart") {
    nextBtn.innerText = "Skip";

    // That will count as wrong later
    saveExamSession();
    if (current < active.length - 1) {
      current++;
      showQuestion();
    } else {
      goToReview();
    }

    return;
  }

  // STUDY MODE
  if (mode === "study") {
    const q = active[current];

    // If user skipped without answering
    if (!answeredCurrent && !userAnswers[q.id]) {
      userAnswers[q.id] = "Skipped";
      updatePerformance(q.id, false);
      updateStreak(false);

      const buttons = document.querySelectorAll("#answers button");

      buttons.forEach((btn) => {
        btn.disabled = true;

        const btnValue = btn.dataset.value;
        btn.innerText.startsWith("A") ||
        btn.innerText.startsWith("B") ||
        btn.innerText.startsWith("C") ||
        btn.innerText.startsWith("D") ||
        btn.innerText.startsWith("E")
          ? btn.innerText[0]
          : btn.innerText;

        if (btnValue === q.correct) {
          btn.classList.add("correct");
        }
      });

      if (explanationEl) {
        explanationEl.innerText = q.explanation;
        explanationEl.classList.remove("hidden");
      }
      renderQuestionTopicLink(q);
      refreshAiExplainAvailability();

      answeredCurrent = true;
      nextBtn.innerText = current === active.length - 1 ? "Finish" : "Next";

      return; // stay on same question
    }

    // Move forward
    if (current < active.length - 1) {
      current++;
      showQuestion();
    } else {
      finishStudy();
    }
  }
  saveStudyProgress();
}

/* ==============================
                           RESTORE SELECTION
                        ================================= */
function restoreSelection(q) {
  const saved = userAnswers[q.id];
  if (!saved) return;

  const buttons = document.querySelectorAll("#answers button");

  buttons.forEach((btn) => {
    const btnValue = btn.dataset.value;
    btn.innerText.startsWith("A") ||
    btn.innerText.startsWith("B") ||
    btn.innerText.startsWith("C") ||
    btn.innerText.startsWith("D") ||
    btn.innerText.startsWith("E")
      ? btn.innerText[0]
      : btn.innerText;

    if (mode === "study") {
      btn.disabled = true;

      if (btnValue === q.correct) {
        btn.classList.add("correct");
      }

      if (btnValue === saved && saved !== q.correct) {
        btn.classList.add("wrong");
      }
    }

    if (mode === "exam") {
      // During exam, just highlight selected option visually (neutral)
      if (btnValue === saved) {
        btn.style.background = "#dbe7ff";
      }
    }
  });
  // Show explanation again in study mode
  if (mode === "study") {
    if (explanationEl) {
      explanationEl.innerText = q.explanation;
      explanationEl.classList.remove("hidden");
    }
    renderQuestionTopicLink(q);
    refreshAiExplainAvailability();
  }

  if (mode === "study") {
    nextBtn.classList.remove("hidden");
  }
}

function calculateScore() {
  let total = 0;

  Object.keys(userAnswers).forEach((id) => {
    const q = active.find((q) => q.id == id);
    if (q && userAnswers[id] === q.correct) total++;
  });

  return total;
}

function previousQuestion() {
  if (current > 0) {
    current--;
    showQuestion();
  }
  saveStudyProgress();
}

function goHome() {
  const studyReview = document.getElementById("study-review");
  if (studyReview) studyReview.remove();

  const studyResult = document.getElementById("study-result");
  if (studyResult) studyResult.remove();

  const detailedReview = document.getElementById("detailed-review");
  if (detailedReview) detailedReview.remove();

  clearInterval(examTimer);
  clearInterval(reviewTimer);

  if (mode === "study") {
    localStorage.removeItem("studySession");
  }

  showScreen("home-screen");
}

/* ==============================
                           EXAM TIMER
                        ================================= */

function startExamTimer() {
  // 🔥 IMPORTANT — Prevent multiple timers
  if (examTimer) {
    clearInterval(examTimer);
  }

  timerEl.classList.remove("hidden");
  updateTimerDisplay();

  examTimer = setInterval(() => {
    if (examTimeLeft > 0) {
      examTimeLeft--;
      updateTimerDisplay();
    } else {
      clearInterval(examTimer);
      goToReview();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(examTimeLeft / 60);
  const seconds = examTimeLeft % 60;

  const formatted =
    String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");

  timerEl.innerHTML = `<span class="timer-icon">⏱</span> ${formatted}`;

  updateTimerColor();
}

function updateTimerColor() {
  const percentLeft = examTimeLeft / (active.length * 40);

  timerEl.classList.remove("timer-safe", "timer-warning", "timer-danger");

  if (percentLeft > 0.5) {
    timerEl.classList.add("timer-safe");
  } else if (percentLeft > 0.2) {
    timerEl.classList.add("timer-warning");
  } else {
    timerEl.classList.add("timer-danger");
  }
}

/* ==============================
                           REVIEW SCREEN
                        ================================= */

function goToReview() {
  clearInterval(examTimer);
  examTimer = null;

  inReview = true;
  reviewTimeLeft = active.length;

  showScreen("review-screen");

  buildReviewPalette();

  const submitBtn = document.getElementById("submit-exam");
  submitBtn.classList.remove("hidden");
  submitBtn.onclick = finishExam;

  startReviewTimer();
}

/* ==============================
                           REVIEW TIMER
                        ================================= */
function startReviewTimer() {
  const reviewTimerEl = document.getElementById("review-timer");

  reviewTimerEl.innerText = `Review Time Left: ${reviewTimeLeft}s`;

  reviewTimer = setInterval(() => {
    reviewTimeLeft--;
    reviewTimerEl.innerText = `Review Time Left: ${reviewTimeLeft}s`;

    if (reviewTimeLeft <= 0) {
      clearInterval(reviewTimer);
      finishExam();
    }
  }, 1000);
}

/* ==============================
                           FINISH EXAM
                        ================================= */

function finishExam() {
  clearInterval(examTimer);
  examTimer = null;

  clearInterval(reviewTimer);

  inReview = false;
  backReviewBtn.classList.add("hidden");
  const finishedMode = mode; // 🔥 SAVE IT FIRST
  mode = ""; // then reset

  localStorage.removeItem("quizExamSession");
  localStorage.removeItem("examAbandoned");

  let finalScore = 0;
  const answers = {};

  active.forEach((q) => {
    const isCorrect = userAnswers[q.id] === q.correct;
    if (isCorrect) finalScore++;

    answers[q.id] = userAnswers[q.id];
    updatePerformance(q.id, isCorrect);
  });

  // Finish attempt on backend if available
  if (backendReady && backendAttemptId) {
    const durationSeconds = Math.max(
      0,
      active.length * 40 - (examTimeLeft || 0),
    );
    backendClient.finishAttempt(backendAttemptId, answers, durationSeconds);
    backendAttemptId = null;
  }

  let percent = Math.round((finalScore / active.length) * 100);

  const sessionLabel =
    finishedMode === "smart"
      ? "Smart (" + active.length + ")"
      : "Exam (" + active.length + ")";

  saveSession(
    sessionLabel,

    finalScore,
    active.length,
    "Time Used: " + (active.length * 40 - examTimeLeft) + "s",
  );

  const resultScreen = document.getElementById("study-result-screen");
  const resultTitle = document.getElementById("result-title");
  const percentEl = document.getElementById("result-percentage");
  const scoreEl = document.getElementById("result-score");
  const feedbackEl = document.getElementById("result-feedback");

  resultTitle.innerText = "Exam Complete";
  percentEl.innerText = percent + "%";
  scoreEl.innerText = finalScore + " / " + active.length + " Correct";

  if (percent >= 80) {
    feedbackEl.innerText = "Excellent performance. You're exam ready.";
    percentEl.style.color = "#15803d";
  } else if (percent >= 60) {
    feedbackEl.innerText = "Good effort. Review weak areas.";
    percentEl.style.color = "#f9a825";
  } else {
    feedbackEl.innerText = "Needs improvement. Focus and repeat.";
    percentEl.style.color = "#dc2626";
  }

  showScreen("study-result-screen");

  document.getElementById("result-review-btn").onclick = showDetailedReview;
  document.getElementById("result-menu-btn").onclick = goToMenu;
}

/* ==============================
                           STUDY FINISH
                        ================================= */

function finishStudy() {
  backReviewBtn.classList.add("hidden");
  const studyType = document.getElementById("study-type-select").value;
  studySessionEnded = true;

  const totalAnswered = Object.keys(userAnswers).length;
  const correctAnswers = calculateScore();
  const percent =
    totalAnswered === 0
      ? 0
      : Math.round((correctAnswers / totalAnswered) * 100);

  // Finish attempt on backend if available
  if (backendReady && backendAttemptId) {
    const answers = {};
    Object.keys(userAnswers).forEach((qId) => {
      answers[qId] = userAnswers[qId];
    });
    backendClient.finishAttempt(backendAttemptId, answers);
    backendAttemptId = null;
  }

  // 🔥 Clear both study and practice sessions
  localStorage.removeItem("studySession");
  localStorage.removeItem("practiceSession");

  const resultScreen = document.getElementById("study-result-screen");

  const resultTitle = document.getElementById("result-title");
  const percentEl = document.getElementById("result-percentage");
  const scoreEl = document.getElementById("result-score");
  const feedbackEl = document.getElementById("result-feedback");

  resultTitle.innerText = "Study Session Complete";
  percentEl.innerText = percent + "%";
  scoreEl.innerText = correctAnswers + " / " + totalAnswered + " Correct";

  if (percent >= 80) {
    feedbackEl.innerText = "Strong mastery demonstrated.";
    percentEl.style.color = "#15803d";
  } else if (percent >= 60) {
    feedbackEl.innerText = "Progressing well. Keep refining.";
    percentEl.style.color = "#f9a825";
  } else {
    feedbackEl.innerText = "More reinforcement needed.";
    percentEl.style.color = "#dc2626";
  }

  showScreen("study-result-screen");

  document.getElementById("result-review-btn").onclick = showStudyReviewPalette;

  document.getElementById("result-menu-btn").onclick = goToMenu;
}

function endStudySession() {
  studySessionEnded = true;

  const totalAnswered = Object.keys(userAnswers).length;
  const correctAnswers = calculateScore();
  const percent =
    totalAnswered === 0
      ? 0
      : Math.round((correctAnswers / totalAnswered) * 100);

  // 🔥 Store result AFTER calculating
  window.lastStudyResult = {
    correct: correctAnswers,
    total: totalAnswered,
    percent: percent,
  };

  saveSession("Study", correctAnswers, totalAnswered);

  const old = document.getElementById("study-result");
  if (old) old.remove();

  const resultScreen = document.getElementById("study-result-screen");

  const resultTitle = document.getElementById("result-title");
  const percentEl = document.getElementById("result-percentage");
  const scoreEl = document.getElementById("result-score");
  const feedbackEl = document.getElementById("result-feedback");

  resultTitle.innerText = "Study Session Complete";
  percentEl.innerText = percent + "%";
  scoreEl.innerText = correctAnswers + " / " + totalAnswered + " Correct";

  if (percent >= 80) {
    feedbackEl.innerText = "Strong mastery demonstrated.";
    percentEl.style.color = "#15803d";
  } else if (percent >= 60) {
    feedbackEl.innerText = "Progressing well. Keep refining.";
    percentEl.style.color = "#f9a825";
  } else {
    feedbackEl.innerText = "More reinforcement needed.";
    percentEl.style.color = "#dc2626";
  }

  showScreen("study-result-screen");

  document.getElementById("result-review-btn").onclick = showStudyReviewPalette;

  document.getElementById("result-menu-btn").onclick = goToMenu;

  localStorage.removeItem("studySession");
  localStorage.removeItem("practiceSession");
}

function goToMenu() {
  const detailedReview = document.getElementById("detailed-review");
  if (detailedReview) detailedReview.remove();

  // 🔥 Reset review states
  inStudyReview = false;
  answeredCurrent = false;

  // Restore normal navigation bindings
  nextBtn.onclick = nextQuestion;
  prevBtn.onclick = previousQuestion;

  // Restore header buttons
  document.getElementById("back-btn-quiz").classList.remove("hidden");
  if (menuBtnQuiz) menuBtnQuiz.classList.remove("hidden");

  nextBtn.onclick = nextQuestion;
  prevBtn.onclick = previousQuestion;
  showScreen("quiz-menu");
}

function rebuildStudyResult() {
  const resultScreen = document.getElementById("study-result-screen");

  const data = window.lastStudyResult;
  if (!data) return;

  const resultTitle = document.getElementById("result-title");
  const percentEl = document.getElementById("result-percentage");
  const scoreEl = document.getElementById("result-score");
  const feedbackEl = document.getElementById("result-feedback");

  resultTitle.innerText = "Study Session Complete";
  percentEl.innerText = data.percent + "%";
  scoreEl.innerText = data.correct + " / " + data.total + " Correct";

  if (data.percent >= 80) {
    feedbackEl.innerText = "Strong mastery demonstrated.";
    percentEl.style.color = "#15803d";
  } else if (data.percent >= 60) {
    feedbackEl.innerText = "Progressing well. Keep refining.";
    percentEl.style.color = "#f9a825";
  } else {
    feedbackEl.innerText = "More reinforcement needed.";
    percentEl.style.color = "#dc2626";
  }

  showScreen("study-result-screen");

  document.getElementById("result-review-btn").onclick = showStudyReviewPalette;

  document.getElementById("result-menu-btn").onclick = goToMenu;
}

/* ==============================
                           PALETTE FOR EXAM NAVIGATION
                        ================================= */
function buildReviewPalette() {
  const reviewList = document.getElementById("review-list");
  reviewList.innerHTML = "";

  active.forEach((q, index) => {
    const btn = document.createElement("button");
    btn.innerText = index + 1;
    btn.classList.add("review-btn");

    if (!userAnswers[q.id]) {
      btn.classList.add("review-unanswered");
    } else {
      btn.classList.add("review-answered");
    }

    btn.onclick = () => openQuestionFromReview(index);

    reviewList.appendChild(btn);
  });
}

function openQuestionFromReview(index) {
  inReview = true;
  backReviewBtn.classList.remove("hidden");
  showScreen("quiz-area");

  current = index;
  showQuestion();
}

function returnToReview() {
  inReview = false;
  backReviewBtn.classList.add("hidden");
  showScreen("review-screen");
  buildReviewPalette();
}

function showDetailedReview() {
  const reviewSection = document.getElementById("result-review-section");
  const content = document.getElementById("result-review-content");

  inDetailedReview = false;
  reviewSection.classList.remove("hidden");
  content.classList.remove("review-palette-grid");
  content.classList.add("analysis-list");
  content.innerHTML = "";

  active.forEach((q, index) => {
    const user = userAnswers[q.id] || "Not Answered";
    const isCorrect = user === q.correct;

    const card = document.createElement("div");
    card.className =
      "analysis-card " + (isCorrect ? "analysis-correct" : "analysis-wrong");
    card.classList.add("analysis-clickable");
    card.onclick = () => openDetailedQuestion(index);

    card.innerHTML = `
      <div class="analysis-header">
        <div>Question ${index + 1}</div>
        <div>${isCorrect ? "✓ Correct" : "✕ Incorrect"}</div>
      </div>
      <div class="analysis-question">
        ${q.question.replace(/^Q\\d+\\.\\s*/, "")}
      </div>
      <div class="analysis-answer">
        <strong>Your Answer:</strong> ${user}
      </div>
      ${!isCorrect ? `<div><strong>Correct:</strong> ${q.correct}</div>` : ""}
    `;

    content.appendChild(card);
  });

  document.getElementById("result-back-btn").onclick = function () {
    document.getElementById("result-review-section").classList.add("hidden");
    content.classList.remove("analysis-list");

    // Clear dynamic content (important)
    document.getElementById("result-review-content").innerHTML = "";

    // Ensure main result body is visible
    document.querySelector(".result-body").scrollTop = 0;
  };
}

function openDetailedQuestion(index) {
  inDetailedReview = true;
  current = index;

  showScreen("quiz-area");
  backReviewBtn.classList.remove("hidden");
  backReviewBtn.onclick = returnToExamDetailedReview;
  document.getElementById("back-btn-quiz").classList.add("hidden");

  renderDetailedQuestion();

  nextBtn.classList.remove("hidden");
  prevBtn.classList.remove("hidden");

  nextBtn.onclick = () => {
    if (current < active.length - 1) {
      current++;
      renderDetailedQuestion();
    }
  };

  prevBtn.onclick = () => {
    if (current > 0) {
      current--;
      renderDetailedQuestion();
    }
  };
}

function returnToExamDetailedReview() {
  inDetailedReview = false;
  backReviewBtn.classList.add("hidden");
  document.getElementById("back-btn-quiz").classList.remove("hidden");

  nextBtn.onclick = nextQuestion;
  prevBtn.onclick = previousQuestion;

  showScreen("study-result-screen");
  showDetailedReview();
}

function renderDetailedQuestion() {
  const q = active[current];
  answersEl.innerHTML = "";
  resetAiExplainPanel();

  // Question title
  let caseText = "";

  if (q.caseId && caseMap[q.caseId]) {
    caseText = `<strong>Case:</strong><br>` + caseMap[q.caseId] + `<br><br>`;
  }

  questionEl.innerHTML =
    caseText +
    `<strong>Question ${current + 1}</strong><br><br>` +
    q.question.replace(/^Q\d+\.\s*/, "");

  const savedAnswer = userAnswers[q.id];

  // ==============================
  // SINGLE / MATCH TYPE
  // ==============================
  if (q.type === "match" || q.type === "single") {
    q.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.innerText = opt;
      btn.disabled = true;

      if (opt === q.correct) {
        btn.classList.add("correct");
      }

      if (savedAnswer === opt && opt !== q.correct) {
        btn.classList.add("wrong");
      }

      answersEl.appendChild(btn);
    });
  }

  // ==============================
  // COMBO TYPE
  // ==============================
  else if (q.type === "combo") {
    // Show statements
    comboBlock.innerHTML = "";
    answersEl.innerHTML = "";

    q.statements.forEach((s, index) => {
      const p = document.createElement("p");

      if (!/^\d+\./.test(s.trim())) {
        p.innerText = `${index + 1}. ${s}`;
      } else {
        p.innerText = s;
      }

      comboBlock.appendChild(p);
    });

    const comboOptions = [
      { letter: "A", text: "A: 1, 2 and 3" },
      { letter: "B", text: "B: 1 and 2 only" },
      { letter: "C", text: "C: 2 and 3 only" },
      { letter: "D", text: "D: 1 only" },
      { letter: "E", text: "E: 3 only" },
    ];

    comboOptions.forEach((option) => {
      const btn = document.createElement("button");
      btn.innerText = option.text;
      btn.disabled = true;

      if (option.letter === q.correct) {
        btn.classList.add("correct");
      }

      if (savedAnswer === option.letter && option.letter !== q.correct) {
        btn.classList.add("wrong");
      }

      answersEl.appendChild(btn);
    });
  }

  // ==============================
  // FALLBACK (if type undefined)
  // ==============================
  else if (q.options) {
    q.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.innerText = opt;
      btn.disabled = true;

      if (opt === q.correct) {
        btn.classList.add("correct");
      }

      if (savedAnswer === opt && opt !== q.correct) {
        btn.classList.add("wrong");
      }

      answersEl.appendChild(btn);
    });
  }

  // Always show explanation
  if (explanationEl) {
    explanationEl.innerText = q.explanation || "No explanation provided.";
    explanationEl.classList.remove("hidden");
  }
  renderQuestionTopicLink(q);
  refreshAiExplainAvailability();
}

function showQuestionDetailedMode() {
  answersEl.innerHTML = "";

  const q = active[current];

  questionEl.innerHTML =
    `<strong>Question ${current + 1}</strong><br><br>` +
    q.question.replace(/^Q\d+\.\s*/, "");

  if (q.type === "match" || q.type === "single") {
    q.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.innerText = opt;

      if (opt === q.correct) {
        btn.classList.add("correct");
      }

      if (userAnswers[q.id] === opt && opt !== q.correct) {
        btn.classList.add("wrong");
      }

      btn.disabled = true;

      answersEl.appendChild(btn);
    });
  }

  if (q.type === "combo") {
    q.statements.forEach((s) => {
      const p = document.createElement("p");
      p.innerText = s;
      answersEl.appendChild(p);
    });

    const options = ["A", "B", "C", "D", "E"];

    options.forEach((letter) => {
      const btn = document.createElement("button");
      btn.innerText = letter;

      if (letter === q.correct) {
        btn.classList.add("correct");
      }

      if (userAnswers[q.id] === letter && letter !== q.correct) {
        btn.classList.add("wrong");
      }

      btn.disabled = true;

      answersEl.appendChild(btn);
    });
  }
}

function saveExamSession() {
  const session = {
    active,
    current,
    userAnswers,
    examTimeLeft,
    timestamp: Date.now(),
  };

  localStorage.setItem("quizExamSession", JSON.stringify(session));
}

function loadExamSession() {
  const saved = JSON.parse(localStorage.getItem("quizExamSession"));
  if (!saved) return false;
  clearAiExplainStateSession();

  active = saved.active;
  current = saved.current;
  userAnswers = saved.userAnswers;

  const now = Date.now();
  const timePassed = Math.floor((now - saved.timestamp) / 1000);

  examTimeLeft = saved.examTimeLeft - timePassed;

  if (examTimeLeft <= 0) {
    localStorage.removeItem("quizExamSession");
    finishExam();
    return true;
  }

  mode = "exam"; // or smart (see next line)

  // 🔥 Detect if smart exam
  if (saved.active && saved.active.length && saved.active[0].smartFlag) {
    mode = "smart";
  }

  updateModeIndicator();

  showScreen("quiz-area");

  startExamTimer();
  showQuestion();

  return true;
}

function saveStudyProgress() {
  if (mode !== "study" || studySessionEnded) return;

  const studyState = {
    current,
    userAnswers,
    active,
    currentStreak,
    studyType: document.getElementById("study-type-select").value,
  };

  const key =
    studyState.studyType === "weak" ? "practiceSession" : "studySession";

  localStorage.setItem(key, JSON.stringify(studyState));
}

/* ==============================
                     PAGE LOAD – STUDY RESUME ONLY
                  ================================= */

window.addEventListener("load", function () {
  setAuthMode("login");
  profileImageMarkedForDeletion = false;
  setProfileAvatarPreview("");
  updateProfileButtonAvatar("");
  refreshProfilePhotoDeleteVisibility();
  renderAuthState();
  restoreAuthSession();

  // Load questions from backend first
  loadQuestionsFromBackend().then(() => {
    rebuildCaseMap();
  });

  backendClient.warmup().catch(() => {
    // Keep local-first behavior if backend is offline.
  });

  populateStudyCategories();
  populateExamCategories();
  populateTopicLibraryCategories();

  renderModeHistory("Study", "study-history");
  renderModeHistory("Exam", "exam-history");

  const abandoned = localStorage.getItem("examAbandoned");

  if (abandoned) {
    localStorage.removeItem("examAbandoned");

    const saved = JSON.parse(localStorage.getItem("quizExamSession"));

    if (saved) {
      active = saved.active;
      userAnswers = saved.userAnswers || {};
      mode = "exam";

      // Finish immediately
      finishExam();
      return;
    }

    const homeTotalQuestions = document.getElementById("home-total-questions");
    const homeTotalSessions = document.getElementById("home-total-sessions");
    const homeBestStreak = document.getElementById("home-best-streak");

    if (homeTotalQuestions) {
      homeTotalQuestions.innerText = questionBank.length;
    }

    if (homeTotalSessions) {
      homeTotalSessions.innerText = sessionHistory.length;
    }

    if (homeBestStreak) {
      homeBestStreak.innerText = localStorage.getItem("quizBestStreak") || 0;
    }
  }

  showScreen("home-screen");
});
function showStudyReviewPalette() {
  const reviewSection = document.getElementById("result-review-section");
  const content = document.getElementById("result-review-content");

  reviewSection.classList.remove("hidden");
  content.classList.remove("analysis-list");
  content.classList.add("review-palette-grid");
  content.innerHTML = "";

  active.forEach((q, index) => {
    if (!userAnswers[q.id]) return;

    const btn = document.createElement("button");
    btn.className = "review-btn";
    btn.innerText = index + 1;

    if (userAnswers[q.id] === q.correct) {
      btn.classList.add("review-correct");
    } else if (userAnswers[q.id] === "Skipped") {
      btn.classList.add("review-skipped");
    } else {
      btn.classList.add("review-wrong");
    }

    btn.onclick = () => openStudyReviewQuestion(index);

    content.appendChild(btn);
  });

  document.getElementById("result-back-btn").onclick = function () {
    document.getElementById("result-review-section").classList.add("hidden");
    content.classList.remove("review-palette-grid");

    // Clear dynamic content (important)
    document.getElementById("result-review-content").innerHTML = "";

    // Ensure main result body is visible
    document.querySelector(".result-body").scrollTop = 0;
  };
}

function openStudyReviewQuestion(index) {
  current = index;
  inStudyReview = true;

  const reviewDiv = document.getElementById("study-review");
  if (reviewDiv) reviewDiv.remove();

  showScreen("quiz-area");
  backReviewBtn.classList.remove("hidden");
  backReviewBtn.onclick = returnToStudyReviewPalette;
  nextBtn.onclick = () => {
    const answeredIndexes = active
      .map((q, i) => (userAnswers[q.id] ? i : null))
      .filter((i) => i !== null);

    const position = answeredIndexes.indexOf(current);

    if (position < answeredIndexes.length - 1) {
      current = answeredIndexes[position + 1];
      showStudyReviewQuestion();
    }
  };

  prevBtn.onclick = () => {
    const answeredIndexes = active
      .map((q, i) => (userAnswers[q.id] ? i : null))
      .filter((i) => i !== null);

    const position = answeredIndexes.indexOf(current);

    if (position > 0) {
      current = answeredIndexes[position - 1];
      showStudyReviewQuestion();
    }
  };

  showStudyReviewQuestion();
}

function returnToStudyReviewPalette() {
  inStudyReview = false;
  backReviewBtn.classList.add("hidden");

  document.getElementById("back-btn-quiz").classList.remove("hidden");
  if (menuBtnQuiz) menuBtnQuiz.classList.remove("hidden");

  nextBtn.onclick = nextQuestion;
  prevBtn.onclick = previousQuestion;

  showScreen("study-result-screen");
  showStudyReviewPalette();
}

function showStudyReviewQuestion() {
  document.getElementById("end-study-btn").classList.add("hidden");
  // 🔥 Hide quiz header buttons during review
  document.getElementById("back-btn-quiz").classList.add("hidden");
  if (menuBtnQuiz) menuBtnQuiz.classList.add("hidden");

  const q = active[current];

  answersEl.innerHTML = "";
  comboBlock.innerHTML = "";
  resetAiExplainPanel();
  questionEl.innerHTML = q.question;

  const saved = userAnswers[q.id];

  if (q.type === "match" || q.type === "single") {
    q.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.innerText = opt;
      btn.disabled = true;

      if (opt === q.correct) btn.classList.add("correct");
      if (saved === opt && opt !== q.correct) btn.classList.add("wrong");

      answersEl.appendChild(btn);
    });
  } else if (q.type === "combo") {
    comboBlock.innerHTML = "";
    answersEl.innerHTML = "";

    q.statements.forEach((s, index) => {
      const p = document.createElement("p");
      p.innerText = /^\d+\./.test(s.trim()) ? s : `${index + 1}. ${s}`;
      comboBlock.appendChild(p);
    });

    const comboOptions = [
      { letter: "A", text: "A: 1, 2 and 3" },
      { letter: "B", text: "B: 1 and 2 only" },
      { letter: "C", text: "C: 2 and 3 only" },
      { letter: "D", text: "D: 1 only" },
      { letter: "E", text: "E: 3 only" },
    ];

    comboOptions.forEach((option) => {
      const btn = document.createElement("button");
      btn.innerText = option.text;
      btn.dataset.value = option.letter;
      btn.disabled = true;

      if (option.letter === q.correct) {
        btn.classList.add("correct");
      }

      if (saved === option.letter && option.letter !== q.correct) {
        btn.classList.add("wrong");
      }

      answersEl.appendChild(btn);
    });
  }

  if (explanationEl) {
    explanationEl.innerText = q.explanation || "No explanation provided.";
    explanationEl.classList.remove("hidden");
  }
  renderQuestionTopicLink(q);
  refreshAiExplainAvailability();
}

function updateStudyBestStreakDisplay() {
  const container = document.getElementById("study-best-streak");
  const numberEl = document.getElementById("study-badge-number");

  const best = parseInt(localStorage.getItem("quizBestStreak")) || 0;

  numberEl.innerText = best;

  container.classList.remove(
    "tier-basic",
    "tier-blue",
    "tier-green",
    "tier-gold",
    "tier-fire",
    "tier-legend",
  );

  if (best < 5) {
    container.classList.add("tier-basic");
  } else if (best < 10) {
    container.classList.add("tier-blue");
  } else if (best < 25) {
    container.classList.add("tier-green");
  } else if (best < 50) {
    container.classList.add("tier-gold");
  } else if (best < 100) {
    container.classList.add("tier-fire");
  } else {
    container.classList.add("tier-legend");
  }
}

function toggleModeHistory(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  el.classList.toggle("hidden");
}

function showScreen(id) {
  const screens = [
    "home-screen",
    "quiz-menu",
    "profile-screen",
    "study-setup",
    "exam-setup",
    "topic-library",
    "topic-viewer",
    "tour-screen",
    "settings-screen",
    "quiz-area",
    "review-screen",
    "dashboard",
    "study-result-screen",
  ];

  screens.forEach((screen) => {
    const el = document.getElementById(screen);
    if (el) el.classList.remove("screen-active");
  });

  const target = document.getElementById(id);
  if (target) {
    target.classList.add("screen-active");
  }

  if (id !== "quiz-menu") {
    closeMenuUserHub();
  }

  if (id !== "quiz-area") {
    if (timerEl) timerEl.classList.add("hidden");
  }

  // Browser back support
  if (!history.state || history.state.screen !== id) {
    history.pushState({ screen: id }, "", "");
  }
}
function restoreStreakUI() {
  const streakBox = document.getElementById("streak-box");
  const streakValue = document.getElementById("streak-value");

  if (!streakBox || !streakValue) return;

  streakValue.innerText = currentStreak;

  streakBox.classList.remove(
    "tier-basic",
    "tier-blue",
    "tier-green",
    "tier-gold",
    "tier-fire",
    "tier-legend",
  );

  if (currentStreak < 5) {
    streakBox.classList.add("tier-basic");
  } else if (currentStreak < 10) {
    streakBox.classList.add("tier-blue");
  } else if (currentStreak < 25) {
    streakBox.classList.add("tier-green");
  } else if (currentStreak < 50) {
    streakBox.classList.add("tier-gold");
  } else if (currentStreak < 100) {
    streakBox.classList.add("tier-fire");
  } else {
    streakBox.classList.add("tier-legend");
  }
}
/* ==============================
                           UTIL
                        ================================= */

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

document.addEventListener("keydown", function (e) {
  if (authModal && !authModal.classList.contains("hidden") && e.key === "Escape") {
    closeAuthModal();
    return;
  }
  if (menuUserHubPanel && !menuUserHubPanel.classList.contains("hidden") && e.key === "Escape") {
    closeMenuUserHub();
    return;
  }
  if (!examExitModal.classList.contains("hidden") && e.key === "Escape") {
    closeExamExitModal();
  }
  if (!studyExitModal.classList.contains("hidden") && e.key === "Escape") {
    closeStudyExitModal();
  }
});

// ==============================
// AUTO SUBMIT ON REFRESH
// ==============================

window.addEventListener("beforeunload", function () {
  if ((mode === "exam" || mode === "smart") && active.length > 0) {
    localStorage.setItem("examAbandoned", "true");
    saveExamSession();
  }
});

// ==============================
// SMART PHONE BACK SUPPORT
// ==============================

window.addEventListener("popstate", function () {
  const activeScreen = document.querySelector(".screen-active");
  const activeId = activeScreen ? activeScreen.id : null;

  if (authModal && !authModal.classList.contains("hidden")) {
    closeAuthModal();
    return;
  }

  // 1️⃣ If Study exit modal is open → close it
  const studyModal = document.getElementById("study-exit-modal");
  if (studyModal && !studyModal.classList.contains("hidden")) {
    studyModal.classList.add("hidden");
    document.body.style.overflow = "";
    return;
  }

  // 2️⃣ If Exam exit modal is open → close it
  if (!examExitModal.classList.contains("hidden")) {
    closeExamExitModal();
    return;
  }

  // 3️⃣ Navigation based on CURRENT SCREEN (not mode)

  if (activeId === "quiz-area") {
    if (mode === "study") {
      saveStudyProgress();
      showScreen("study-setup");
      return;
    }

    if (mode === "exam" || mode === "smart") {
      openExamExitModal();
      return;
    }
  }

  if (activeId === "study-setup" || activeId === "exam-setup") {
    showScreen("quiz-menu");
    return;
  }

  if (activeId === "profile-screen") {
    showScreen("quiz-menu");
    return;
  }

  if (activeId === "topic-viewer") {
    showScreen(topicViewerReturnScreen || "topic-library");
    return;
  }

  if (activeId === "topic-library") {
    showScreen(topicLibraryReturnScreen || "quiz-menu");
    return;
  }

  if (activeId === "tour-screen") {
    showScreen("quiz-menu");
    return;
  }

  if (activeId === "settings-screen") {
    showScreen("quiz-menu");
    return;
  }

  if (activeId === "quiz-menu") {
    showScreen("home-screen");
    return;
  }
});

