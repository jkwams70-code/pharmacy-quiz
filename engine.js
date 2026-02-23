console.log("JS LOADED");
import { baseQuestions } from "./data.js";
import { backendClient } from "./backendClient.js";

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

let questionBank = [...baseQuestions];
const caseMap = {};
let backendReady = false;
let backendAttemptId = null;

// Load questions from backend if available
async function loadQuestionsFromBackend() {
  try {
    const questions = await backendClient.fetchQuestions({ limit: 1000 });
    if (Array.isArray(questions) && questions.length > 0) {
      // Map backend format to local format for compatibility
      questionBank = questions.map((q) => ({
        id: q.id,
        text: q.text,
        category: q.category,
        options: q.options,
        correct: q.correct,
      }));
      backendReady = true;
      console.log(`✓ Loaded ${questionBank.length} questions from backend`);
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
const studyHistoryToggle = document.getElementById("study-history-toggle");
const studyHistoryBox = document.getElementById("study-history");

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
  enterBtn.onclick = () => {
    showScreen("quiz-menu");
  };
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
  const categories = [...new Set(questionBank.map((q) => q.category))];

  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.innerText = cat;
    select.appendChild(option);
  });
}
function populateStudyCategories() {
  const select = document.getElementById("study-category-select");
  const categories = [...new Set(questionBank.map((q) => q.category))];

  categories.forEach((cat) => {
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
          console.log("✓ Backend study attempt started:", backendAttemptId);
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
        console.log("✓ Backend attempt started:", backendAttemptId);
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

  document.getElementById("explanation").classList.add("hidden");
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

  if (q.type === "match" || q.type === "single") {
    q.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.innerText = opt;
      btn.dataset.value = opt;
      btn.onclick = () => selectAnswer(opt, q);
      answersEl.appendChild(btn);
    });
  }

  if (q.type === "combo") {
    q.statements.forEach((s, index) => {
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
  document.getElementById("explanation").innerText = q.explanation;
  document.getElementById("explanation").classList.remove("hidden");
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

      document.getElementById("explanation").innerText = q.explanation;
      document.getElementById("explanation").classList.remove("hidden");

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
    const explanationBox = document.getElementById("explanation");
    explanationBox.innerText = q.explanation;
    explanationBox.classList.remove("hidden");
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
  const explanationBox = document.getElementById("explanation");
  explanationBox.innerText = q.explanation || "No explanation provided.";
  explanationBox.classList.remove("hidden");
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
  // Load questions from backend first
  loadQuestionsFromBackend().then(() => {
    rebuildCaseMap();
  });

  backendClient.warmup().catch(() => {
    // Keep local-first behavior if backend is offline.
  });

  populateStudyCategories();
  populateExamCategories();

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
    "study-setup",
    "exam-setup",
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

  if (activeId === "quiz-menu") {
    showScreen("home-screen");
    return;
  }
});
