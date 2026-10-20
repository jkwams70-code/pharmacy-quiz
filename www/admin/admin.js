const storedApiBase = localStorage.getItem("quizApiBase")?.trim();
const currentHost = String(window.location.hostname || "").trim();
const currentOrigin = String(window.location.origin || "").trim();
const isLocalHost = ["localhost", "127.0.0.1"].includes(currentHost);
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
let API_BASE = hasStaleStoredApiBase ? inferredApiBase : storedApiBase || inferredApiBase;
let apiBaseResolvedPromise = null;

function normalizeApiBase(value = "") {
  return String(value || "").trim().replace(/\/+$/, "");
}

function getAdminApiBaseCandidates() {
  const candidates = [
    storedApiBase,
    `${currentOrigin}/api`,
    "https://api.ajixpharmacy.online/api",
    inferredApiBase,
    !isLocalHost && currentHost ? `http://${currentHost}:4000/api` : "",
    "http://localhost:4000/api",
  ]
    .map(normalizeApiBase)
    .filter(Boolean);
  return [...new Set(candidates)];
}

async function probeAdminApiBase(base = "") {
  const safeBase = normalizeApiBase(base);
  if (!safeBase) return false;
  try {
    const res = await fetchAdmin(`${safeBase}/health`, { cache: "no-store" }, { timeoutMs: 5000 });
    return Boolean(res && res.ok);
  } catch {
    return false;
  }
}

async function ensureAdminApiBase({ force = false } = {}) {
  if (apiBaseResolvedPromise && !force) return apiBaseResolvedPromise;
  apiBaseResolvedPromise = (async () => {
    const candidates = getAdminApiBaseCandidates();
    for (const candidate of candidates) {
      // eslint-disable-next-line no-await-in-loop
      if (await probeAdminApiBase(candidate)) {
        API_BASE = candidate;
        localStorage.setItem("quizApiBase", candidate);
        return candidate;
      }
    }
    return API_BASE;
  })();
  try {
    return await apiBaseResolvedPromise;
  } finally {
      apiBaseResolvedPromise = null;
  }
}

const ADMIN_REQUEST_TIMEOUT_MS = 10000;
async function fetchAdmin(path, options = {}, { timeoutMs = ADMIN_REQUEST_TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  const externalSignal = options?.signal;
  const onAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener("abort", onAbort, { once: true });
  }
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(path, { ...options, signal: controller.signal });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(`Request timed out after ${Math.round(timeoutMs / 1000)} seconds`);
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
    externalSignal?.removeEventListener("abort", onAbort);
  }
}
      const ADMIN_KEY_STORAGE = "adminKey";
      let adminKey = localStorage.getItem(ADMIN_KEY_STORAGE);
      const adminKeyInput = document.getElementById("admin-key");
      if (adminKeyInput && !adminKey) {
        adminKeyInput.value = "";
        window.setTimeout(() => {
          if (!localStorage.getItem(ADMIN_KEY_STORAGE)) {
            adminKeyInput.value = "";
          }
        }, 0);
      }
      let editingQuestionId = null;
      let cachedQuestions = [];
      let cachedUsers = [];
      let usersLoaded = false;
      let cachedGroups = [];
      let cachedDeletedGroups = [];
      let cachedReports = [];
      let cachedSubscriptionRequests = [];
      let cachedMonetizationCounts = { request: 0, activated: 0, rejected: 0, expired: 0 };
      let cachedMonetizationAmountTotals = { request: 0, activated: 0, rejected: 0, expired: 0 };
      const monetizationBucketRecords = {
        request: [],
        activated: [],
        rejected: [],
        expired: [],
      };
      const monetizationBucketPages = { request: 0, activated: 0, rejected: 0, expired: 0 };
      const monetizationBucketHasMore = { request: false, activated: false, rejected: false, expired: false };
      const monetizationBucketErrors = new Map();
      const monetizationLoadedBuckets = new Set();
      const monetizationLoadingBuckets = new Set();
      const subscriptionRequestsLoadingPromises = new Map();
      let cachedPasswordResetRequests = [];
      let cachedAdminStats = null;
      let cachedDeletedUsers = [];
      let deletedUsersLoaded = false;
      let groupsLoaded = false;
      let deletedGroupsLoaded = false;
      let reportsLoaded = false;
      let subscriptionRequestsLoaded = false;
      let questionSearchQuery = "";
      let selectedUserId = null;
      let selectedGroupId = null;
      let selectedReportId = null;
      let selectedReportSnapshot = null;
      let selectedReportWarningDraft = "";

      function closeReportEvidenceViewer() {
        document.getElementById("report-evidence-viewer-modal")?.classList.remove("active");
        const body = document.getElementById("report-evidence-viewer-body");
        if (body) body.innerHTML = "";
      }

      function getReportEvidenceUrl(item) {
        return String(item?.url || item?.dataUrl || item?.publicUrl || item?.remoteUrl || "").trim();
      }

      function getReportEvidenceMime(item) {
        const fileName = String(item?.fileName || "").toLowerCase();
        return String(item?.mimeType || "").toLowerCase() ||
          (/\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(fileName) ? "image/*" : "") ||
          (/\.(mp4|webm|mov|m4v|avi)$/i.test(fileName) ? "video/*" : "");
      }

      function downloadReportEvidence(item) {
        const url = getReportEvidenceUrl(item);
        if (!url) return;
        const link = document.createElement("a");
        link.href = url;
        link.download = String(item?.fileName || "evidence").trim() || "evidence";
        link.target = "_blank";
        link.rel = "noreferrer";
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      function openReportEvidence(index) {
        const evidence = Array.isArray(selectedReportSnapshot?.evidence) ? selectedReportSnapshot.evidence : [];
        const item = evidence[Number(index)];
        const url = getReportEvidenceUrl(item);
        const mimeType = getReportEvidenceMime(item);
        if (!item) return;
        const body = document.getElementById("report-evidence-viewer-body");
        const modal = document.getElementById("report-evidence-viewer-modal");
        if (!body || !modal) return;
        const title = escapeHtml(item.fileName || "Evidence");
        const isImage = Boolean(url) && mimeType.startsWith("image/");
        const isVideo = Boolean(url) && mimeType.startsWith("video/");
        const fileType = escapeHtml((mimeType.split("/").pop() || "file").slice(0, 5));
        const preview = isVideo
          ? `<video class="report-evidence-viewer-media" controls autoplay src="${escapeHtml(url)}"></video>`
          : isImage
            ? `<img class="report-evidence-viewer-media" src="${escapeHtml(url)}" alt="${title}" />`
            : `<div class="report-evidence-viewer-file"><span class="case-report-evidence-file-icon">${fileType}</span><strong>${title}</strong></div>`;
        body.innerHTML = `${preview}
          <div class="report-evidence-viewer-footer">
            <span class="report-evidence-viewer-name">${title}</span>
            <button type="button" class="report-evidence-download-btn" data-admin-evidence-download-index="${Number(index)}" aria-label="Download evidence" title="Download evidence"${url ? "" : " disabled"}>⇩</button>
          </div>`;
        modal.classList.add("active");
      }
      let broadcastChatAttachment = null;
      let broadcastChatSending = false;
      let broadcastChatClientRequestId = "";
      let broadcastChatEmojiPickerOpen = false;
      let broadcastChatAttachmentViewerMode = "sent";
      let broadcastChatAttachmentViewerAttachment = null;
      let broadcastReplyDraft = null;
      let pendingBroadcastComposerMessage = "";
      let pendingBroadcastWarningReportId = "";
      let broadcastMessageGesture = null;
      let broadcastStatusAttachment = null;
      let broadcastStatusBackground = "#2f80d0";
      let cachedBroadcastThreads = [];
      let cachedBroadcastStatuses = [];
      let cachedBroadcastThreadDetail = new Map();
      let selectedBroadcastThreadKey = "";
      let broadcastThreadOpen = false;
      let selectedBroadcastStatusId = "";
      let broadcastOverviewLoaded = false;
      let adminActiveTab = "stats";
      let adminBroadcastReturnTab = "stats";
      const ADMIN_NOTIFICATION_BANNER_STORAGE_KEY = "adminReportsNotificationSignature";
      let adminNotificationBannerHideTimer = null;
      let pendingDeleteUserId = null;
      let usersSearchQuery = "";
      let groupsSearchQuery = "";
      let deletedGroupsSearchQuery = "";
      let reportsSearchQuery = "";
      let passwordResetSearchQuery = "";
      let reportsViewType = "group";
      let deletedUsersSearchQuery = "";
      let monetizationSearchQuery = "";
      let selectedMonetizationBucket = "request";
      let monetizationSortDirection = "desc";
      let selectedSubscriptionRequestId = "";
      let selectedSubscriptionProofDataUrl = "";
      let passwordResetRequestsLoaded = false;
      let passwordResetRequestsLoadVersion = 0;
      let passwordResetRequestsMutationVersion = 0;
      let selectedAnalyticsPeriod = "week";
      let pendingSubscriptionApproveRequestId = "";
      let pendingSubscriptionRejectRequestId = "";
      const SUBSCRIPTION_REJECT_REASONS = [
        "Payment not received",
        "Invalid or unclear screenshot",
        "Amount does not match",
        "Other reason",
      ];
      const COMBO_OPTIONS = [
        { letter: "A", text: "1, 2 and 3" },
        { letter: "B", text: "1 and 2 only" },
        { letter: "C", text: "2 and 3 only" },
        { letter: "D", text: "1 only" },
        { letter: "E", text: "3 only" },
      ];

      function escapeHtml(value) {
        return String(value ?? "")
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")
          .replaceAll('"', "&quot;")
          .replaceAll("'", "&#39;");
      }

      function getEffectiveOptions(question) {
        const options = Array.isArray(question?.options)
          ? question.options
              .map((opt) => String(opt || "").trim())
              .filter(Boolean)
          : [];
        if (options.length) return options;

        if (String(question?.type || "").toLowerCase() === "combo") {
          return COMBO_OPTIONS.map((opt) => `${opt.letter}: ${opt.text}`);
        }

        return [];
      }

      function toCorrectOptionIndex(question) {
        const options = getEffectiveOptions(question);
        const rawCorrect = question?.correct;
        const rawText = String(rawCorrect ?? "").trim();

        const letterMatch = rawText.match(/^([A-H])(?:[.)\s:\-]|$)/i);
        if (letterMatch) {
          const letterIndex = letterMatch[1].toUpperCase().charCodeAt(0) - 65;
          if (letterIndex >= 0 && letterIndex < options.length) return letterIndex;
        }

        if (Number.isInteger(rawCorrect) && rawCorrect >= 0 && rawCorrect < options.length) {
          return rawCorrect;
        }

        if (rawText) {
          const byTextIndex = options.findIndex((option) => option === rawText);
          if (byTextIndex >= 0) return byTextIndex;
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

      const TABLE_TOUCH_CLICK_SUPPRESSION_MS = 450;
      const tableTouchActivationTimes = new Map();

      function markTableTouchActivation(tableKey) {
        tableTouchActivationTimes.set(tableKey, Date.now());
      }

      function hasRecentTableTouchActivation(tableKey) {
        const lastTouch = tableTouchActivationTimes.get(tableKey) || 0;
        return Date.now() - lastTouch < TABLE_TOUCH_CLICK_SUPPRESSION_MS;
      }

      function bindTouchFriendlyTableRows({
        tableKey,
        root,
        scrollContainer,
        rowSelector,
        onActivate,
        enableClickBinding = true,
      }) {
        if (!(root instanceof HTMLElement) || !(scrollContainer instanceof HTMLElement)) return;

        const interactiveSelector =
          "button, a, input, textarea, select, option, label, summary, [contenteditable='true'], [data-no-table-drag]";
        const dragThreshold = 8;
        const shouldUseNativeTouchScroll =
          window.matchMedia?.("(pointer: coarse)")?.matches || window.matchMedia?.("(hover: none)")?.matches;
        let activePointerId = null;
        let activePointerType = "";
        let startX = 0;
        let startY = 0;
        let startScrollLeft = 0;
        let startScrollTop = 0;
        let isDragging = false;

        const clearPointerState = () => {
          activePointerId = null;
          activePointerType = "";
          isDragging = false;
        };

        const getRowTarget = (event) => {
          const target = event.target instanceof Element ? event.target : null;
          if (!target) return null;
          if (target.closest(interactiveSelector)) return null;
          const row = target.closest(rowSelector);
          return row instanceof HTMLElement ? row : null;
        };

        const onPointerDown = (event) => {
          if (event.button != null && event.button !== 0) return;
          const row = getRowTarget(event);
          if (!row) return;

          activePointerId = event.pointerId;
          activePointerType = String(event.pointerType || "");
          startX = event.clientX;
          startY = event.clientY;
          startScrollLeft = scrollContainer.scrollLeft;
          startScrollTop = scrollContainer.scrollTop;
          isDragging = false;
        };

        const onPointerMove = (event) => {
          if (activePointerId === null || event.pointerId !== activePointerId) return;

          const deltaX = event.clientX - startX;
          const deltaY = event.clientY - startY;
          if (!isDragging && Math.abs(deltaX) < dragThreshold && Math.abs(deltaY) < dragThreshold) {
            return;
          }

          isDragging = true;
          markTableTouchActivation(tableKey);

          if (activePointerType === "mouse" || activePointerType === "pen") {
            const canScrollX = scrollContainer.scrollWidth > scrollContainer.clientWidth;
            const canScrollY = scrollContainer.scrollHeight > scrollContainer.clientHeight;
            if (canScrollX) {
              scrollContainer.scrollLeft = startScrollLeft - deltaX;
            }
            if (canScrollY) {
              scrollContainer.scrollTop = startScrollTop - deltaY;
            }
            event.preventDefault();
          }
        };

        const onPointerUp = () => {
          if (isDragging) {
            markTableTouchActivation(tableKey);
          }
          clearPointerState();
        };

        const onPointerCancel = () => {
          clearPointerState();
        };

        if (!shouldUseNativeTouchScroll) {
          root.addEventListener("pointerdown", onPointerDown);
          root.addEventListener("pointermove", onPointerMove);
          root.addEventListener("pointerup", onPointerUp);
          root.addEventListener("pointercancel", onPointerCancel);
        }

        if (enableClickBinding && typeof onActivate === "function") {
          root.addEventListener("click", (event) => {
            if (hasRecentTableTouchActivation(tableKey)) {
              const target = event.target instanceof Element ? event.target : null;
              if (target?.closest(rowSelector)) {
                event.preventDefault();
                event.stopPropagation();
                return;
              }
            }

            const row = getRowTarget(event);
            if (!row) return;
            onActivate(row);
          });

          root.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            const row = getRowTarget(event);
            if (!row) return;
            event.preventDefault();
            onActivate(row);
          });
        }
      }

      function readFileAsDataUrl(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ""));
          reader.onerror = () => reject(new Error("Could not read the selected file."));
          reader.readAsDataURL(file);
        });
      }

      function autoSizeBroadcastChatMessage() {
        const messageEl = document.getElementById("broadcast-chat-message");
        if (!(messageEl instanceof HTMLTextAreaElement)) return;
        messageEl.style.height = "0px";
        const safeMax = 180;
        const nextHeight = Math.min(safeMax, Math.max(36, messageEl.scrollHeight || 36));
        messageEl.style.height = `${nextHeight}px`;
        messageEl.style.overflowY = messageEl.scrollHeight > safeMax ? "auto" : "hidden";
      }

      function syncBroadcastViewportFrame() {
        const root = document.documentElement;
        if (!root) return;
        const vv = window.visualViewport;
        const bottomInset = vv
          ? Math.max(0, Math.round(window.innerHeight - (vv.height + vv.offsetTop)))
          : 0;
        root.style.setProperty("--broadcast-vv-bottom", `${bottomInset}px`);
      }

      function insertBroadcastChatEmoji(emoji = "") {
        const messageEl = document.getElementById("broadcast-chat-message");
        const safeEmoji = String(emoji || "").trim();
        if (!(messageEl instanceof HTMLTextAreaElement) || !safeEmoji) return;
        const start = Number(messageEl.selectionStart ?? messageEl.value.length);
        const end = Number(messageEl.selectionEnd ?? messageEl.value.length);
        const value = String(messageEl.value || "");
        const nextValue = `${value.slice(0, start)}${safeEmoji}${value.slice(end)}`;
        messageEl.value = nextValue;
        const cursor = start + safeEmoji.length;
        try {
          messageEl.setSelectionRange(cursor, cursor);
        } catch {}
        autoSizeBroadcastChatMessage();
        messageEl.focus();
      }

      function setBroadcastChatEmojiPickerOpen(open = false) {
        broadcastChatEmojiPickerOpen = Boolean(open);
        const panelEl = document.getElementById("broadcast-chat-emoji-panel");
        panelEl?.classList.toggle("hidden", !broadcastChatEmojiPickerOpen);
        const emojiBtn = document.getElementById("broadcast-chat-emoji-btn");
        emojiBtn?.classList.toggle("is-active", broadcastChatEmojiPickerOpen);
      }

      function syncBroadcastMobileComposerDock(open = false) {
        const composerEl = document.querySelector(".broadcast-thread-composer");
        if (!(composerEl instanceof HTMLElement)) return;
        const panelEl = composerEl.closest(".broadcast-thread-panel");
        if (panelEl instanceof HTMLElement && composerEl.parentElement !== panelEl) {
          panelEl.appendChild(composerEl);
        }
      }

      function buildBroadcastComposerAttachmentMarkup(attachment = {}) {
        const dataUrl = String(attachment?.dataUrl || "").trim();
        const mimeType = String(attachment?.mimeType || "").toLowerCase();
        const fileName = String(attachment?.fileName || "attachment").trim();
        if (!dataUrl) return "";
        const safeDataUrl = escapeHtml(dataUrl);
        const safeFileName = escapeHtml(fileName);
        const safeMimeType = escapeHtml(mimeType || "application/octet-stream");
        if (mimeType.startsWith("image/")) {
          return `
            <img
              class="broadcast-chat-attachment-preview-media"
              src="${safeDataUrl}"
              alt="${safeFileName}"
              loading="lazy"
            />
          `;
        }
        if (mimeType.startsWith("video/")) {
          return `
            <video
              class="broadcast-chat-attachment-preview-media"
              muted
              playsinline
              preload="metadata"
              src="${safeDataUrl}"
            ></video>
          `;
        }
        if (mimeType.startsWith("audio/")) {
          return `
            <div class="broadcast-chat-attachment-file">A</div>
            <div class="broadcast-chat-attachment-meta">
              <div class="broadcast-chat-attachment-name-text">${safeFileName}</div>
              <div class="broadcast-chat-attachment-type-text">Audio</div>
            </div>
            <button type="button" class="broadcast-chat-attachment-remove" data-broadcast-chat-remove-attachment aria-label="Remove attachment" title="Remove attachment">Ã—</button>
          `;
        }
        return `
          <div class="broadcast-chat-attachment-file">F</div>
          <div class="broadcast-chat-attachment-meta">
            <div class="broadcast-chat-attachment-name-text">${safeFileName}</div>
            <div class="broadcast-chat-attachment-type-text">${safeMimeType}</div>
          </div>
          <button type="button" class="broadcast-chat-attachment-remove" data-broadcast-chat-remove-attachment aria-label="Remove attachment" title="Remove attachment">Ã—</button>
        `;
      }

      function renderBroadcastChatAttachmentPreview() {
        const previewEl = document.getElementById("broadcast-chat-attachment-preview");
        const clearBtn = document.getElementById("broadcast-chat-clear-btn");
        if (clearBtn instanceof HTMLButtonElement) {
          clearBtn.classList.toggle("hidden", !broadcastChatAttachment);
        }
        if (!(previewEl instanceof HTMLElement)) return;
        if (!broadcastChatAttachment) {
          previewEl.innerHTML = "";
          previewEl.classList.add("hidden");
          return;
        }
        const dataUrl = String(broadcastChatAttachment.dataUrl || "").trim();
        const mimeType = String(broadcastChatAttachment.mimeType || "").toLowerCase();
        const fileName = String(broadcastChatAttachment.fileName || "attachment").trim();
        const safeFileName = escapeHtml(fileName);
        const safeMimeType = escapeHtml(mimeType || "application/octet-stream");
        const isImage = mimeType.startsWith("image/");
        const isVideo = mimeType.startsWith("video/");
        if (isImage || isVideo) {
          previewEl.innerHTML = `
            ${buildBroadcastComposerAttachmentMarkup(broadcastChatAttachment)}
            <div class="broadcast-chat-attachment-meta">
              <div class="broadcast-chat-attachment-name-text">${safeFileName}</div>
              <div class="broadcast-chat-attachment-type-text">${safeMimeType}</div>
            </div>
            <button type="button" class="broadcast-chat-attachment-remove" data-broadcast-chat-remove-attachment aria-label="Remove attachment" title="Remove attachment">Ã—</button>
          `;
        } else {
          previewEl.innerHTML = buildBroadcastComposerAttachmentMarkup(broadcastChatAttachment);
        }
        previewEl.classList.remove("hidden");
      }

      function formatDate(value) {
        if (!value) return "--";
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return "--";
        const day = String(parsed.getDate()).padStart(2, "0");
        const month = String(parsed.getMonth() + 1).padStart(2, "0");
        const year = String(parsed.getFullYear()).slice(-2);
        const time = parsed.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
        return `${day}/${month}/${year}, ${time}`;
      }

      async function copyTextToClipboard(text) {
        const value = String(text || "").trim();
        if (!value) return false;
        try {
          await navigator.clipboard.writeText(value);
          return true;
        } catch {
          const textarea = document.createElement("textarea");
          textarea.value = value;
          textarea.setAttribute("readonly", "readonly");
          textarea.style.position = "fixed";
          textarea.style.left = "-9999px";
          document.body.appendChild(textarea);
          textarea.select();
          try {
            return document.execCommand("copy");
          } catch {
            return false;
          } finally {
            document.body.removeChild(textarea);
          }
        }
      }

      function getMonetizationBucket(request = {}) {
  const requestStatus = String(request?.status || "").trim().toLowerCase();
  const expirationAt = String(request?.expirationAt || request?.expiresAt || request?.expiredAt || "").trim();
  const expirationTime = expirationAt ? Date.parse(expirationAt) : NaN;
  const hasFutureExpiry = Number.isFinite(expirationTime) && expirationTime > Date.now();
  const isExpired =
    requestStatus === "expired" ||
    Boolean(request?.isExpired) ||
    (Number.isFinite(expirationTime) && expirationTime <= Date.now());
  const isActive =
    requestStatus === "active" ||
    requestStatus === "approved" ||
    requestStatus === "trial" ||
    Boolean(request?.isActive) ||
    hasFutureExpiry;

  if (requestStatus === "rejected") {
    return "rejected";
  }
  if (requestStatus === "pending") {
    return "request";
  }
  if (isExpired) {
    return "expired";
  }
  if (isActive) {
    return "activated";
  }
  return "request";
}

function getMonetizationBucketMeta(bucket = "request") {
        const safeBucket = String(bucket || "request").trim().toLowerCase();
        const meta = {
          request: {
            title: "Incoming payment proofs",
            empty: "No pending subscription requests yet.",
            rowColumns: "minmax(0, 1.15fr) minmax(0, 1fr) minmax(0, 0.8fr) minmax(0, 1.1fr) minmax(0, 1fr) auto",
            rowLabels: ["Name", "Subscription Type", "Amount", "Contact", "Requested"],
          },
          activated: {
            title: "Activated subscriptions",
            empty: "No activated subscriptions yet.",
            rowColumns: "minmax(0, 1.05fr) minmax(0, 1fr) minmax(0, 0.8fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) auto",
            rowLabels: ["Name", "Subscription Type", "Amount", "Contact", "Activated", "Expires"],
          },
          rejected: {
            title: "Rejected requests",
            empty: "No rejected subscription requests yet.",
            rowColumns: "minmax(180px, 1.25fr) minmax(170px, 1.1fr) minmax(120px, 0.9fr) minmax(180px, 1.1fr) minmax(180px, 1fr) minmax(220px, 1.2fr) auto",
            rowLabels: ["Name", "Subscription Type", "Amount", "Contact", "Rejected", "Reason"],
          },
          expired: {
            title: "Expired access",
            empty: "No expired subscriptions yet.",
            rowColumns: "minmax(0, 1.15fr) minmax(0, 1fr) minmax(0, 0.8fr) minmax(0, 1.1fr) minmax(0, 1fr) minmax(0, 1fr) auto",
            rowLabels: ["Name", "Subscription Type", "Amount", "Contact", "Activated", "Expired"],
          },
        };
        return meta[safeBucket] || meta.request;
      }

      function getMonetizationRequestModalTitle(bucket = "request") {
        const safeBucket = String(bucket || "request").trim().toLowerCase();
        const titles = {
          request: "Request Details",
          activated: "Activated Subscription",
          rejected: "Rejected Request",
          expired: "Expired Access",
        };
        return titles[safeBucket] || titles.request;
      }

      function getMonetizationRequestTitle(request = {}) {
        const name = String(request?.user?.name || request?.userName || request?.username || request?.contact || "").trim();
        return name || "Subscription request";
      }

      function getMonetizationRequestContact(request = {}) {
        return String(request?.user?.contact || request?.contact || "--").trim() || "--";
      }

      function getMonetizationRequestDate(request = {}, bucket = "request") {
        const metaBucket = String(bucket || "request").trim().toLowerCase();
        if (metaBucket === "activated") {
          return formatDate(request?.approvedAt || request?.reviewedAt || request?.user?.subscriptionApprovedAt || request?.user?.subscriptionReviewedAt);
        }
        if (metaBucket === "rejected") {
          return formatDate(request?.rejectedAt || request?.reviewedAt || request?.user?.subscriptionRejectedAt || request?.user?.subscriptionReviewedAt);
        }
        if (metaBucket === "expired") {
          return formatDate(
            request?.expirationAt ||
            request?.user?.subscriptionAccess?.expirationAt ||
              request?.user?.subscriptionExpirationAt ||
              request?.user?.subscriptionEndsAt,
          );
        }
        return formatDate(request?.requestedAt);
      }

      function getMonetizationRequestActivatedAt(request = {}) {
        return formatDate(
          request?.activatedAt ||
            request?.approvedAt ||
            request?.reviewedAt ||
            request?.user?.subscriptionAccess?.activatedAt ||
            request?.user?.subscriptionAccess?.activationAt ||
            request?.user?.subscriptionActivatedAt ||
            request?.user?.subscriptionApprovedAt ||
            request?.user?.subscriptionReviewedAt,
        );
      }

      function getMonetizationRequestExpiry(request = {}) {
        return formatDate(
          request?.expirationAt ||
          request?.user?.subscriptionAccess?.expirationAt ||
            request?.user?.subscriptionExpirationAt ||
            request?.user?.subscriptionEndsAt,
        );
      }

      function getMonetizationRequestAmount(request = {}) {
        const amount = Number(
          request?.priceGhs ??
            request?.user?.subscriptionPlanPriceGhs ??
            request?.amountGhs ??
            0,
        );
        return Number.isFinite(amount) && amount > 0 ? amount : null;
      }

      function formatGhsAmount(amount) {
        const numeric = Number(amount);
        if (!Number.isFinite(numeric) || numeric <= 0) return "GHS 0";
        const display = Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(2).replace(/\.00$/, "");
        return `GHS ${display}`;
      }

      function getMonetizationBucketTotalAmount(bucket) {
        return cachedSubscriptionRequests
          .filter((entry) => getMonetizationBucket(entry) === bucket)
          .reduce((sum, entry) => sum + (getMonetizationRequestAmount(entry) || 0), 0);
      }

      function getMonetizationRequestProofLabel(request = {}) {
        return String(
          request?.paymentReference ||
            request?.proofText ||
            request?.reviewNote ||
            "Payment proof",
        ).trim();
      }

      function getMonetizationRequestReason(request = {}) {
        return String(
          request?.rejectedReason ||
            request?.subscriptionRejectedReason ||
            request?.subscriptionReviewNote ||
            request?.reviewNote ||
            "--",
        ).trim() || "--";
      }

      function getMonetizationDateLabel(bucket = "request") {
        const safeBucket = String(bucket || "request").trim().toLowerCase();
        if (safeBucket === "activated") return "Activated";
        if (safeBucket === "rejected") return "Rejected";
        if (safeBucket === "expired") return "Expired";
        return "Requested";
      }

      function getMonetizationRequestSortTimestamp(request = {}, bucket = "request") {
        const safeBucket = String(bucket || "request").trim().toLowerCase();
        if (safeBucket === "activated") {
          return Date.parse(
            request?.approvedAt ||
              request?.reviewedAt ||
              request?.user?.subscriptionApprovedAt ||
              request?.user?.subscriptionReviewedAt ||
              request?.requestedAt ||
              0,
          );
        }
        if (safeBucket === "rejected") {
          return Date.parse(
            request?.rejectedAt ||
              request?.reviewedAt ||
              request?.user?.subscriptionRejectedAt ||
              request?.user?.subscriptionReviewedAt ||
              request?.requestedAt ||
              0,
          );
        }
        if (safeBucket === "expired") {
          return Date.parse(
            request?.expirationAt ||
            request?.user?.subscriptionAccess?.expirationAt ||
              request?.user?.subscriptionExpirationAt ||
              request?.user?.subscriptionEndsAt ||
              request?.requestedAt ||
              0,
          );
        }
        return Date.parse(request?.requestedAt || 0);
      }

      function toggleMonetizationSortDirection() {
        monetizationSortDirection = monetizationSortDirection === "desc" ? "asc" : "desc";
        const sortIcon = document.querySelector("#monetization .monetization-sort-icon svg");
        const sortButton = document.querySelector("#monetization .monetization-sort-icon");
        if (sortIcon) {
          sortIcon.classList.toggle("sort-icon-desc", monetizationSortDirection === "desc");
          sortIcon.classList.toggle("sort-icon-asc", monetizationSortDirection === "asc");
        }
        if (sortButton) {
          sortButton.setAttribute(
            "aria-label",
            monetizationSortDirection === "desc" ? "Sorted newest first" : "Sorted oldest first",
          );
        }
        renderMonetizationPanel();
      }

      function buildMonetizationHeader(bucket, count) {
        const meta = getMonetizationBucketMeta(bucket);
        const labels = meta.rowLabels || [];
        const dateLabel = getMonetizationDateLabel(bucket);
        return `
          <thead>
            <tr>
              ${labels
                .map((label) => {
                  if (label !== dateLabel) {
                    return `<th data-label="${escapeHtml(label)}">${escapeHtml(label)}</th>`;
                  }
                  return `
                    <th data-label="${escapeHtml(label)}">
                      <span class="monetization-header-date">
                        <span>${escapeHtml(label)}</span>
                        <button
                          type="button"
                          class="monetization-sort-toggle"
                          data-action="toggle-monetization-sort"
                          aria-label="Toggle date sort"
                          title="${monetizationSortDirection === "desc" ? "Newest first" : "Oldest first"}"
                        >â†•</button>
                      </span>
                    </th>
                  `;
                })
                .join("")}
            </tr>
          </thead>
        `;
      }

      function buildMonetizationRequestRow(request, bucket) {
        const safeId = escapeHtml(request?.id || "");
        const title = escapeHtml(getMonetizationRequestTitle(request));
        const subscriptionType = escapeHtml(
          request?.planLabel || request?.user?.subscriptionPlanLabel || request?.plan || "--",
        );
        const amount = getMonetizationRequestAmount(request);
        const amountLabel = amount ? formatGhsAmount(amount) : "None";
        const contact = escapeHtml(getMonetizationRequestContact(request));
        const mainDate =
          bucket === "expired"
            ? escapeHtml(getMonetizationRequestActivatedAt(request))
            : escapeHtml(getMonetizationRequestDate(request, bucket));
        const dateLabel = escapeHtml(bucket === "expired" ? "Activated" : getMonetizationDateLabel(bucket));
        const reasonLabel = escapeHtml(getMonetizationRequestReason(request));
        const proofLabel = escapeHtml(getMonetizationRequestProofLabel(request));
        const proofPreview = request?.proofDataUrl
          ? `<button type="button" class="monetization-proof-chip" data-action="open-proof-image" data-request-id="${safeId}" data-proof-url="${escapeHtml(request.proofDataUrl)}" data-proof-title="${title}">
              <img src="${escapeHtml(request.proofDataUrl)}" alt="${title} proof preview" />
              <span>${proofLabel || "Screenshot available"}</span>
            </button>`
          : `<div class="monetization-cell-value is-muted">No screenshot uploaded</div>`;
        const statusLabel =
          bucket === "activated"
            ? "Activated"
            : bucket === "rejected"
              ? "Rejected"
              : bucket === "expired"
                ? "Expired"
                : "Requested";
        const expiryCell =
          bucket === "activated"
            ? `<td>${escapeHtml(getMonetizationRequestExpiry(request))}</td>`
            : "";
        const expiredCell =
          bucket === "expired"
            ? `<td data-label="Expired"><div class="monetization-cell-value">${escapeHtml(getMonetizationRequestDate(request, bucket))}</div></td>`
            : "";

        return `
          <tr
            class="monetization-table-row"
            data-request-id="${safeId}"
            data-action="open-subscription-request"
          >
            <td class="cell-wrap" data-label="Name">
              <div class="monetization-cell-value">${title}</div>
            </td>
            <td class="cell-wrap" data-label="Subscription Type">
              <div class="monetization-cell-value">${subscriptionType}</div>
            </td>
            <td class="cell-wrap" data-label="Amount">
              <div class="monetization-cell-value">${escapeHtml(amountLabel)}</div>
            </td>
            <td class="cell-wrap" data-label="Contact">
              <div class="monetization-cell-value">${contact}</div>
            </td>
            <td data-label="${dateLabel}">
              <div class="monetization-cell-value">${escapeHtml(mainDate)}</div>
            </td>
            ${
              bucket === "rejected"
                ? `<td class="cell-wrap" data-label="Reason"><div class="monetization-cell-value">${reasonLabel}</div></td>`
                : ""
            }
            ${expiryCell ? expiryCell.replace("<td>", '<td data-label="Expires">') : ""}
            ${expiredCell}
          </tr>
        `;
      }

      function buildMonetizationEmptyState(bucket) {
        const meta = getMonetizationBucketMeta(bucket);
        return `<div class="monetization-empty-state">${escapeHtml(meta.empty)}</div>`;
      }

      function matchesMonetizationSearch(request, query) {
        const normalizedQuery = normalizeSearchText(query);
        if (!normalizedQuery) return true;

        const haystack = normalizeSearchText(
          [
            request?.id,
            getMonetizationRequestTitle(request),
            request?.planLabel,
            request?.user?.subscriptionPlanLabel,
            request?.plan,
            getMonetizationRequestContact(request),
            getMonetizationRequestDate(request, getMonetizationBucket(request)),
            getMonetizationRequestAmount(request),
            getMonetizationRequestProofLabel(request),
            request?.paymentReference,
            request?.proofText,
          ]
            .filter(Boolean)
            .join(" "),
        );
        return haystack.includes(normalizedQuery);
      }

      function buildMonetizationRequestDetailHtml(request = {}) {
        const bucket = getMonetizationBucket(request);
        const title = escapeHtml(getMonetizationRequestTitle(request));
        const contact = escapeHtml(getMonetizationRequestContact(request));
        const planLabel = escapeHtml(request?.planLabel || request?.user?.subscriptionPlanLabel || request?.plan || "--");
        const amount = getMonetizationRequestAmount(request);
        const amountText = amount ? `GHS ${amount}` : "GHS --";
        const paymentMethod = String(request?.paymentMethod || request?.user?.subscriptionAccess?.paymentMethod || "").trim() || "--";
        const proofReference = escapeHtml(request?.paymentReference || request?.proofText || "--");
        const reviewDeadline = escapeHtml(formatDate(request?.reviewDeadlineAt || request?.user?.subscriptionApprovalDeadlineAt));
        const requestedAt = escapeHtml(formatDate(request?.requestedAt));
        const reviewedAt = escapeHtml(formatDate(request?.reviewedAt));
        const approvedAt = escapeHtml(formatDate(request?.approvedAt));
        const rejectedAt = escapeHtml(formatDate(request?.rejectedAt));
        const expiryAt = escapeHtml(getMonetizationRequestExpiry(request));
        const proofUrl = String(request?.proofDataUrl || "").trim();
        const proofFileName = escapeHtml(request?.proofFileName || "Payment screenshot");
        const proofMimeType = escapeHtml(request?.proofMimeType || "image");
        const proofBlock = proofUrl
          ? `
            <div class="subscription-detail-card">
              <div class="subscription-detail-pill" style="margin-bottom: 12px;">Transaction screenshot</div>
              <button
                type="button"
                class="monetization-proof-chip"
                data-action="open-proof-image"
                data-proof-url="${escapeHtml(proofUrl)}"
                data-proof-title="${title}"
                style="width: 100%; justify-content: center; border-radius: 18px; padding: 12px 14px;"
              >
                <img src="${escapeHtml(proofUrl)}" alt="${title} proof preview" />
                <span>${proofFileName} Â· ${proofMimeType}</span>
              </button>
            </div>
          `
          : `
            <div class="subscription-detail-card">
              <div class="subscription-proof-placeholder">No payment screenshot was uploaded for this request.</div>
            </div>
          `;

        const reviewActionButtons =
          bucket === "request"
            ? `
              <div class="modal-actions" style="margin-top: 6px;">
                <button type="button" class="approve" data-action="approve-subscription-request" data-request-id="${escapeHtml(request?.id || "")}">Activate</button>
                <button type="button" class="reject" data-action="reject-subscription-request" data-request-id="${escapeHtml(request?.id || "")}">Reject</button>
              </div>
            `
            : "";

        return `
          <div class="subscription-detail-card">
            <div class="subscription-detail-hero">
              <div>
                <div class="subscription-detail-amount-label">Amount due</div>
                <div class="subscription-detail-amount">${amountText}</div>
              </div>
              <div class="subscription-detail-pill">Status: <strong>${escapeHtml(bucket)}</strong></div>
            </div>
          </div>

            <div class="subscription-detail-card">
              <div class="subscription-detail-pill" style="margin-bottom: 14px;">${planLabel}</div>
              <div class="subscription-approval-row" style="margin-top: 6px;">
                <div class="subscription-approval-label">Amount:</div>
                <div class="subscription-approval-value">${escapeHtml(amountText)}</div>
              </div>
              <div class="subscription-payment-box">
              <div class="subscription-payment-row">
                <div class="subscription-payment-left">
                  <div class="subscription-payment-method">MTN Mobile Money</div>
                  <div class="subscription-payment-name">NAME: ISRAEL JOHN ASKENT</div>
                </div>
                <div class="subscription-payment-value">0595597218</div>
              </div>
              <div class="subscription-payment-row">
                <div class="subscription-payment-left">
                  <div class="subscription-payment-method">Fidelity Bank</div>
                  <div class="subscription-payment-name">NAME: ISRAEL JOHN ASKENT</div>
                </div>
                <div class="subscription-payment-value">2100316766815</div>
              </div>
            </div>
          </div>

          <div class="subscription-detail-card">
            <div class="subscription-detail-pill" style="margin-bottom: 14px;">Steps</div>
            <div class="subscription-proof-placeholder" style="border-style: solid; border-color: #e2e8f0; background: #ffffff;">
              1. Send the exact amount via MTN Mobile Money or Fidelity Bank.<br />
              2. Take a screenshot of the transaction confirmation or type the transaction ID.<br />
              3. Return to this app and upload the proof.<br />
              4. The subscription unlocks after admin approval within 24 hours.
            </div>
          </div>

          ${proofBlock}

          <div class="subscription-detail-card">
            <div class="subscription-detail-pill" style="margin-bottom: 14px;">Request details</div>
            <div style="display: grid; gap: 10px;">
              <div><strong>Name:</strong> ${title}</div>
              <div><strong>Contact:</strong> ${contact}</div>
              <div><strong>Requested:</strong> ${requestedAt}</div>
              <div><strong>Reviewed:</strong> ${reviewedAt}</div>
              <div><strong>Approved:</strong> ${approvedAt}</div>
              <div><strong>Rejected:</strong> ${rejectedAt}</div>
              <div><strong>Review window:</strong> Up to 24 hours</div>
              <div><strong>Review deadline:</strong> ${reviewDeadline}</div>
              <div><strong>Expected expire:</strong> ${expiryAt}</div>
              <div><strong>Payment reference:</strong> ${proofReference}</div>
            </div>
          </div>

          ${reviewActionButtons}
        `;
      }

      function buildCompactMonetizationRequestDetailHtmlLegacy(request = {}) {
        const bucket = getMonetizationBucket(request);
        const title = escapeHtml(getMonetizationRequestTitle(request));
        const contact = escapeHtml(getMonetizationRequestContact(request));
        const planLabel = escapeHtml(request?.planLabel || request?.user?.subscriptionPlanLabel || request?.plan || "--");
        const amount = getMonetizationRequestAmount(request);
        const amountText = amount ? `GHS ${amount}` : "GHS --";
        const proofReference = escapeHtml(request?.paymentReference || request?.proofText || "--");
        const reviewDeadline = escapeHtml(formatDate(request?.reviewDeadlineAt || request?.user?.subscriptionApprovalDeadlineAt));
        const requestedAt = escapeHtml(formatDate(request?.requestedAt));
        const expiryAt = escapeHtml(getMonetizationRequestExpiry(request));
        const proofUrl = String(request?.proofDataUrl || "").trim();
        const proofBlock = proofUrl
          ? `
            <button
              type="button"
              class="monetization-proof-chip subscription-proof-thumb"
              data-action="open-proof-image"
              data-proof-url="${escapeHtml(proofUrl)}"
              data-proof-title="${title}"
            >
              <img src="${escapeHtml(proofUrl)}" alt="${title} proof preview" />
              <span>Tap to expand screenshot</span>
            </button>
          `
          : `
            <div class="subscription-proof-placeholder">No payment screenshot was uploaded for this request.</div>
          `;

        const reviewActionButtons =
          bucket === "request"
            ? `
              <div class="subscription-detail-actions">
                <button type="button" class="approve" data-action="approve-subscription-request" data-request-id="${escapeHtml(request?.id || "")}">Activate</button>
                <button type="button" class="reject" data-action="reject-subscription-request" data-request-id="${escapeHtml(request?.id || "")}">Reject</button>
              </div>
            `
            : "";

        return `
          <div class="subscription-detail-grid subscription-detail-grid--compact">
            <div class="subscription-detail-card subscription-detail-card--hero">
              <div class="subscription-detail-hero">
                <div>
                  <div class="subscription-detail-amount-label">Amount due</div>
                  <div class="subscription-detail-amount">${amountText}</div>
                </div>
                <div class="subscription-detail-pill">Status: <strong>${escapeHtml(bucket)}</strong></div>
              </div>
            </div>

            <div class="subscription-detail-card">
              <div class="subscription-detail-mini-label">Plan</div>
              <div class="subscription-detail-value">${planLabel}</div>
              <div class="subscription-detail-meta">${title} Â· ${contact}</div>
            </div>

            <div class="subscription-detail-card">
              <div class="subscription-detail-mini-label">Transaction ID</div>
              <div class="subscription-detail-value">${proofReference}</div>
              <div class="subscription-proof-thumb-wrap">${proofBlock}</div>
            </div>

            <div class="subscription-detail-card">
              <div class="subscription-detail-mini-label">Request details</div>
              <div class="subscription-detail-meta" style="display: grid; gap: 8px;">
                <div><strong>Requested:</strong> ${requestedAt}</div>
                <div><strong>Review window:</strong> Up to 24 hours</div>
                <div><strong>Review deadline:</strong> ${reviewDeadline}</div>
                <div><strong>Expected expire:</strong> ${expiryAt}</div>
              </div>
            </div>

            ${reviewActionButtons}
          </div>
        `;
      }

      function setMonetizationBucket(bucket) {
        const nextBucket = String(bucket || "request").trim().toLowerCase();
        selectedMonetizationBucket = ["request", "activated", "rejected", "expired"].includes(nextBucket)
          ? nextBucket
          : "request";
         document.querySelectorAll("[data-monetization-bucket]").forEach((el) => {
          const isActive = el.dataset.monetizationBucket === selectedMonetizationBucket;
          el.classList.toggle("is-active", isActive);
          el.setAttribute("aria-pressed", isActive ? "true" : "false");
        });

        if (monetizationLoadedBuckets.has(selectedMonetizationBucket)) {
          renderMonetizationPanel();
        } else if (adminKey) {
          renderMonetizationPanel();
          void loadMonetizationRequests(selectedMonetizationBucket);
        }
      }

      function renderMonetizationPanel() {
        const root = document.getElementById("monetization-list-root");
        if (!root) return;

        const counts = cachedMonetizationCounts;

        const updateCount = (id, value) => {
          const el = document.getElementById(id);
          if (el) el.textContent = String(value);
        };
        updateCount("monetization-request-count", counts.request);
        updateCount("monetization-activated-count", counts.activated);
        updateCount("monetization-rejected-count", counts.rejected);
        updateCount("monetization-expired-count", counts.expired);
        const monetizationDot = document.getElementById("monetization-tab-dot");
        if (monetizationDot) {
          monetizationDot.classList.toggle("hidden", Number(counts.request) <= 0);
        }

        const bucket = selectedMonetizationBucket;
        const meta = getMonetizationBucketMeta(bucket);
        if (!monetizationLoadedBuckets.has(bucket) && monetizationLoadingBuckets.has(bucket)) {
          const panelTitle = document.getElementById("monetization-panel-title");
          const panelKicker = document.getElementById("monetization-panel-kicker");
          const summaryCount = document.getElementById("monetization-summary-count");
          const summaryTotal = document.getElementById("monetization-summary-total");
          if (panelTitle) {
            panelTitle.textContent = meta.title;
            panelTitle.style.display = "";
          }
          if (panelKicker) panelKicker.textContent = bucket;
          if (summaryCount) summaryCount.innerHTML = "Loading subscription records…";
          if (summaryTotal) summaryTotal.textContent = "";
          root.innerHTML = '<div class="monetization-empty-state is-loading">Loading subscription records…</div>';
          return;
        }
        const bucketError = monetizationBucketErrors.get(bucket);
        if (!monetizationLoadedBuckets.has(bucket) && bucketError) {
          const panelTitle = document.getElementById("monetization-panel-title");
          const panelKicker = document.getElementById("monetization-panel-kicker");
          const summaryCount = document.getElementById("monetization-summary-count");
          const summaryTotal = document.getElementById("monetization-summary-total");
          if (panelTitle) {
            panelTitle.textContent = meta.title;
            panelTitle.style.display = "";
          }
          if (panelKicker) panelKicker.textContent = bucket;
          if (summaryCount) summaryCount.textContent = "Unable to load subscription records";
          if (summaryTotal) summaryTotal.textContent = "";
          root.innerHTML = `
            <div class="monetization-empty-state">
              <div>${escapeHtml(bucketError)}</div>
              <button type="button" class="admin-secondary-btn" data-action="retry-monetization-bucket" data-bucket="${escapeHtml(bucket)}">Retry</button>
            </div>
          `;
          return;
        }
        const sortMultiplier = monetizationSortDirection === "asc" ? 1 : -1;
        const items = [...(monetizationBucketRecords[bucket] || [])]
          .sort((a, b) => {
            const aValue = getMonetizationRequestSortTimestamp(a, bucket);
            const bValue = getMonetizationRequestSortTimestamp(b, bucket);
            if (aValue !== bValue) return (aValue - bValue) * sortMultiplier;
            return getMonetizationRequestTitle(a).localeCompare(getMonetizationRequestTitle(b));
          });
        const filteredItems = items.filter((entry) => matchesMonetizationSearch(entry, monetizationSearchQuery));
        const bucketTotal = Number(cachedMonetizationAmountTotals[bucket]) || getMonetizationBucketTotalAmount(bucket);

        const panelTitle = document.getElementById("monetization-panel-title");
        const panelKicker = document.getElementById("monetization-panel-kicker");
        const summaryCount = document.getElementById("monetization-summary-count");
        const summaryTotal = document.getElementById("monetization-summary-total");
        if (panelTitle) {
          panelTitle.textContent = bucket === "rejected" ? "" : meta.title;
          panelTitle.style.display = bucket === "rejected" ? "none" : "";
        }
        if (panelKicker) panelKicker.textContent = bucket;
        if (summaryCount) {
          const summaryLabel =
            bucket === "request"
              ? "requests"
              : bucket === "activated"
                ? "activated subscriptions"
                : bucket === "rejected"
                  ? "rejected requests"
                  : "expired subscriptions";
          const totalLabel = Number(counts[bucket]) > filteredItems.length
            ? ` of <strong>${Number(counts[bucket])}</strong>`
            : "";
          summaryCount.innerHTML = `Showing <strong>${filteredItems.length}</strong>${totalLabel} ${summaryLabel}`;
        }
        if (summaryTotal) {
          summaryTotal.textContent = `Total: ${formatGhsAmount(bucketTotal)}`;
        }

        if (!items.length) {
          root.innerHTML = buildMonetizationEmptyState(bucket);
          return;
        }

        const headerHtml = buildMonetizationHeader(bucket, filteredItems.length);
        const rowsHtml = filteredItems.map((request) => buildMonetizationRequestRow(request, bucket)).join("");
        const columnCount = bucket === "activated" || bucket === "rejected" || bucket === "expired" ? 6 : 5;
        const isLoadingMore = monetizationLoadingBuckets.has(bucket);
        const loadMoreMarkup = monetizationBucketHasMore[bucket]
          ? `<div class="monetization-load-more"><button type="button" class="admin-secondary-btn" data-action="load-more-monetization" data-bucket="${escapeHtml(bucket)}"${isLoadingMore ? " disabled" : ""}>${isLoadingMore ? "Loading…" : "Load more"}</button></div>`
          : "";
        root.innerHTML = `
          <div class="table-container monetization-table-container">
            <table class="user-table monetization-table">
              ${headerHtml}
              <tbody>
                ${
                  rowsHtml ||
                  `<tr><td colspan="${columnCount}" style="text-align:center;color:#64748b;">${
                    normalizeSearchText(monetizationSearchQuery)
                      ? "No subscription requests match this search"
                      : "No subscription requests yet."
                  }</td></tr>`
                }
              </tbody>
            </table>
          </div>
          <div class="monetization-horizontal-scroll" aria-label="Scroll table horizontally" tabindex="0">
            <div class="monetization-horizontal-scroll-content"></div>
          </div>
          ${loadMoreMarkup}
        `;
        const tableScroller = root.querySelector(".monetization-table-container");
        const horizontalScroller = root.querySelector(".monetization-horizontal-scroll");
        const horizontalContent = root.querySelector(".monetization-horizontal-scroll-content");
        if (tableScroller && horizontalScroller && horizontalContent) {
          const syncScrollWidth = () => {
            horizontalContent.style.width = String(Math.max(tableScroller.scrollWidth, tableScroller.clientWidth)) + "px";
            horizontalScroller.scrollLeft = tableScroller.scrollLeft;
          };
          tableScroller.addEventListener("scroll", () => {
            horizontalScroller.scrollLeft = tableScroller.scrollLeft;
          });
          horizontalScroller.addEventListener("scroll", () => {
            tableScroller.scrollLeft = horizontalScroller.scrollLeft;
          });
          window.requestAnimationFrame(syncScrollWidth);
        }
      }

      async function loadMonetizationRequests(bucket = selectedMonetizationBucket, page = 1) {
  const statusByBucket = {
    request: "pending",
    activated: "active",
    rejected: "rejected",
    expired: "expired",
  };
  const requestedBucket = Object.prototype.hasOwnProperty.call(statusByBucket, bucket)
    ? bucket
    : "request";
  const requestStatus = statusByBucket[requestedBucket];
  const requestedPage = Math.max(1, Number(page) || 1);
  const promiseKey = `${requestedBucket}:${requestedPage}`;
  const existingPromise = subscriptionRequestsLoadingPromises.get(promiseKey);
  if (existingPromise) return existingPromise;

  monetizationLoadingBuckets.add(requestedBucket);
  if (selectedMonetizationBucket === requestedBucket) renderMonetizationPanel();
  const loadingPromise = (async () => {
    try {
      const query = new URLSearchParams({ status: requestStatus, page: String(requestedPage), limit: "100" });
      const res = await fetchAdmin(withNoCache(`${API_BASE}/admin/subscription-requests?${query.toString()}`), {
        headers: getHeaders(),
        cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !Array.isArray(data.requests)) {
        throw new Error(data.error || "Failed to load subscription requests");
      }

      const existingById = new Map(
        (requestedPage === 1 ? [] : monetizationBucketRecords[requestedBucket])
          .map((entry) => [String(entry?.id || ""), entry]),
      );
      data.requests.forEach((entry) => existingById.set(String(entry?.id || ""), entry));
      monetizationBucketRecords[requestedBucket] = [...existingById.values()];
      monetizationBucketPages[requestedBucket] = requestedPage;
      monetizationBucketHasMore[requestedBucket] = data.hasMore === true;
      cachedSubscriptionRequests = Object.values(monetizationBucketRecords).flat();
      if (data.counts && typeof data.counts === "object") {
        cachedMonetizationCounts = {
          request: Number(data.counts.request) || 0,
          activated: Number(data.counts.activated) || 0,
          rejected: Number(data.counts.rejected) || 0,
          expired: Number(data.counts.expired) || 0,
        };
      }
      if (data.amountTotals && typeof data.amountTotals === "object") {
        cachedMonetizationAmountTotals = {
          request: Number(data.amountTotals.request) || 0,
          activated: Number(data.amountTotals.activated) || 0,
          rejected: Number(data.amountTotals.rejected) || 0,
          expired: Number(data.amountTotals.expired) || 0,
        };
      }
      monetizationBucketErrors.delete(requestedBucket);
      monetizationLoadedBuckets.add(requestedBucket);

      subscriptionRequestsLoaded = true;
      if (selectedMonetizationBucket === requestedBucket) renderMonetizationPanel();
      return true;
    } catch (err) {
      console.error("Failed to load subscription requests:", err);
      monetizationBucketErrors.set(requestedBucket, err.message || "Failed to load subscription records");
      showAlert("monetization-alerts", "Failed to load subscription requests", "error");
      return false;
    }
  })();
  subscriptionRequestsLoadingPromises.set(promiseKey, loadingPromise);

  try {
    return await loadingPromise;
  } finally {
    monetizationLoadingBuckets.delete(requestedBucket);
    subscriptionRequestsLoadingPromises.delete(promiseKey);
    if (selectedMonetizationBucket === requestedBucket) renderMonetizationPanel();
  }
}

      function invalidateMonetizationBuckets(bucketNames = []) {
        for (const bucket of bucketNames) {
          if (!monetizationBucketRecords[bucket]) continue;
          monetizationBucketRecords[bucket] = [];
          monetizationBucketPages[bucket] = 0;
          monetizationBucketHasMore[bucket] = false;
          monetizationBucketErrors.delete(bucket);
          monetizationLoadedBuckets.delete(bucket);
        }
      }

      async function refreshMonetizationBuckets(bucketNames = []) {
        const uniqueBuckets = [...new Set(bucketNames)].filter((bucket) => monetizationBucketRecords[bucket]);
        invalidateMonetizationBuckets(uniqueBuckets);
        const loads = uniqueBuckets.map((bucket) => loadMonetizationRequests(bucket, 1));
        renderMonetizationPanel();
        await Promise.all(loads);
      }

      function getPasswordResetRequestName(request = {}) {
        return String(request?.name || request?.user?.name || request?.username || request?.contact || "Password reset request").trim() || "Password reset request";
      }

      function getPasswordResetRequestContact(request = {}) {
        return String(request?.contact || request?.user?.contact || request?.email || request?.user?.email || "--").trim() || "--";
      }

      function getPasswordResetRequestMethod(request = {}) {
        const method = String(request?.deliveryMethod || request?.contactType || "").trim().toLowerCase();
        if (method === "email") return "email";
        if (method === "phone") return "whatsapp";
        const contact = getPasswordResetRequestContact(request);
        if (contact.includes("@")) return "email";
        if (/^\+?[0-9()\-\s]{6,}$/.test(contact)) return "whatsapp";
        return "";
      }

      function getPasswordResetRequestStatus(request = {}) {
        const rawStatus = String(request?.status || "").trim().toLowerCase();
        if (["pending", "sent", "resolved", "expired", "cancelled"].includes(rawStatus)) {
          return rawStatus;
        }
        if (String(request?.sentAt || "").trim()) return "sent";
        if (String(request?.resolvedAt || "").trim()) return "resolved";
        return "pending";
      }

      function getPasswordResetRequestStatusLabel(request = {}) {
        switch (getPasswordResetRequestStatus(request)) {
          case "sent":
            return "Sent";
          case "resolved":
            return "Resolved";
          case "expired":
            return "Expired";
          case "cancelled":
            return "Cancelled";
          default:
            return "Pending";
        }
      }

      function getPasswordResetRequestStatusClass(request = {}) {
        switch (getPasswordResetRequestStatus(request)) {
          case "sent":
            return "is-sent";
          case "resolved":
            return "is-good";
          case "expired":
            return "is-muted";
          case "cancelled":
            return "is-bad";
          default:
            return "is-pending";
        }
      }

      function getPasswordResetRequestCode(request = {}) {
        return String(request?.resetCode || "").trim();
      }

      function getPasswordResetRequestSortTimestamp(request = {}) {
        return Date.parse(request?.requestedAt || 0) || 0;
      }

      function getPasswordResetComposeMessage(request = {}) {
        const name = getPasswordResetRequestName(request);
        const code = getPasswordResetRequestCode(request);
        return [
          `Hi ${name},`,
          "",
          `You requested a password reset for AjixPharmacy.`,
          `Your password reset code is ${code}.`,
          "Open https://ajixpharmacy.online, tap Have reset code?, and enter this code to set a new password.",
          "",
          "Keep this code safe and do not share it.",
          "If you did not request this, please ignore this message.",
        ].join("\n");
      }

      function getPasswordResetComposeUrl(request = {}) {
        const contact = getPasswordResetRequestContact(request);
        const code = getPasswordResetRequestCode(request);
        const status = getPasswordResetRequestStatus(request);
        if (!contact || !code || status !== "pending") return "";

        const message = getPasswordResetComposeMessage(request);
        const method = getPasswordResetRequestMethod(request);
        if (method === "email") {
          const subject = encodeURIComponent("AjixPharmacy password reset code");
          const body = encodeURIComponent(message);
          return `mailto:${contact}?subject=${subject}&body=${body}`;
        }

        if (method === "whatsapp") {
          const digits = contact.replace(/\D/g, "");
          if (!digits) return "";
          return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
        }

        return "";
      }

      function matchesPasswordResetSearch(request = {}, query = "") {
        const normalizedQuery = normalizeSearchText(query);
        if (!normalizedQuery) return true;
        const haystack = normalizeSearchText(
          [
            request?.id,
            getPasswordResetRequestName(request),
            request?.username,
            getPasswordResetRequestContact(request),
            getPasswordResetRequestCode(request),
            request?.deliveryMethod,
            request?.deliveryLabel,
            request?.note,
            request?.status,
          ]
            .filter(Boolean)
            .join(" "),
        );
        return normalizedQuery
          .split(" ")
          .filter(Boolean)
          .every((term) => haystack.includes(term));
      }

      function buildPasswordResetRequestRow(request = {}) {
        const requestId = String(request?.id || "").trim();
        const contact = getPasswordResetRequestContact(request);
        const code = getPasswordResetRequestCode(request);
        const composeUrl = getPasswordResetComposeUrl(request);
        const method = getPasswordResetRequestMethod(request);
        const status = getPasswordResetRequestStatus(request);
        const statusLabel = getPasswordResetRequestStatusLabel(request);
        const isPending = status === "pending";
        const codeMarkup = code && isPending
          ? `<code class="password-reset-code password-reset-copyable" data-action="copy-password-reset-code" data-request-id="${escapeHtml(requestId)}" role="button" tabindex="0" title="Click to copy the reset code">${escapeHtml(code)}</code>`
          : `<span class="password-reset-code is-muted">--</span>`;
        const contactMarkup = status !== "pending"
          ? `<span class="password-reset-contact-link is-muted" aria-disabled="true" title="This reset request is no longer actionable">${escapeHtml(contact)}</span>`
          : composeUrl
          ? `<a class="password-reset-contact-link" href="${escapeHtml(composeUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(contact)}</a>`
          : `<span class="password-reset-contact-link is-muted">${escapeHtml(contact)}</span>`;
        const methodLabel = method === "email" ? "Email" : method === "whatsapp" ? "WhatsApp" : "Contact";
        const expiresMarkup = isPending
          ? `<span class="password-reset-code is-muted">--</span>`
          : `<span>${escapeHtml(formatDate(request?.expiresAt))}</span>`;
        const statusMarkup = isPending
          ? `<button type="button" class="password-reset-status password-reset-status-action ${escapeHtml(getPasswordResetRequestStatusClass(request))}" data-action="mark-password-reset-sent" data-request-id="${escapeHtml(requestId)}" aria-label="Mark sent">${escapeHtml(statusLabel)}</button>`
          : `<span class="password-reset-status ${escapeHtml(getPasswordResetRequestStatusClass(request))}">${escapeHtml(statusLabel)}</span>`;
        return `
          <tr data-password-reset-request-id="${escapeHtml(requestId)}">
            <td>
              <div class="cell-wrap">
                <strong>${escapeHtml(getPasswordResetRequestName(request))}</strong>
                <div class="cell-subtle">${escapeHtml(request?.username || "--")}</div>
              </div>
            </td>
            <td>
              <div class="cell-wrap">
                ${contactMarkup}
                <div class="cell-subtle">${escapeHtml(methodLabel)}</div>
              </div>
            </td>
            <td>
              <div class="password-reset-code-cell">
                ${codeMarkup}
              </div>
            </td>
            <td>${escapeHtml(formatDate(request?.requestedAt))}</td>
            <td>${expiresMarkup}</td>
            <td>${statusMarkup}</td>
          </tr>
        `;
      }

      function renderPasswordResetRequests() {
        const root = document.getElementById("password-reset-list-root");
        if (!root) return;

        const items = [...cachedPasswordResetRequests]
          .sort((a, b) => getPasswordResetRequestSortTimestamp(b) - getPasswordResetRequestSortTimestamp(a))
          .filter((entry) => matchesPasswordResetSearch(entry, passwordResetSearchQuery));
        const pendingCount = cachedPasswordResetRequests.filter((entry) =>
          getPasswordResetRequestStatus(entry) === "pending",
        ).length;

        const summaryCount = document.getElementById("password-reset-summary-count");
        const summaryTotal = document.getElementById("password-reset-summary-total");
        const badge = document.getElementById("password-reset-tab-badge");
        if (summaryCount) {
          summaryCount.innerHTML = `Showing <strong>${items.length}</strong> reset request${items.length === 1 ? "" : "s"}`;
        }
        if (summaryTotal) {
          summaryTotal.textContent = `Pending: ${pendingCount}`;
        }
        if (badge) {
          badge.classList.toggle("hidden", pendingCount === 0);
        }

        if (!cachedPasswordResetRequests.length) {
          root.innerHTML = `
            <div class="monetization-empty-state">
              No password reset requests yet.
            </div>
          `;
          return;
        }

        const tableRows = items.map((request) => buildPasswordResetRequestRow(request)).join("");
        root.innerHTML = `
          <div class="table-container password-reset-table-container">
            <table class="user-table password-reset-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Code</th>
                  <th>Requested</th>
                  <th>Expires</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${
                  tableRows ||
                  `<tr><td colspan="6" style="text-align:center;color:#64748b;">${
                    normalizeSearchText(passwordResetSearchQuery)
                      ? "No password reset requests match this search"
                      : "No password reset requests yet."
                  }</td></tr>`
                }
              </tbody>
            </table>
          </div>
        `;
      }

      async function loadPasswordResetRequests() {
        const loadVersion = ++passwordResetRequestsLoadVersion;
        const mutationVersion = passwordResetRequestsMutationVersion;
        try {
          const res = await fetchAdmin(withNoCache(`${API_BASE}/admin/password-reset-requests`), {
            headers: getHeaders(),
            cache: "no-store",
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !Array.isArray(data.requests)) {
            throw new Error(data.error || "Failed to load password reset requests");
          }

          if (
            loadVersion !== passwordResetRequestsLoadVersion ||
            mutationVersion !== passwordResetRequestsMutationVersion
          ) {
            return true;
          }

          cachedPasswordResetRequests = data.requests;
          passwordResetRequestsLoaded = true;
          renderPasswordResetRequests();
          return true;
        } catch (err) {
          console.error("Failed to load password reset requests:", err);
          showAlert("password-reset-alerts", "Failed to load password reset requests", "error");
          return false;
        }
      }

      async function markPasswordResetRequestSent(requestId = "") {
        const safeRequestId = String(requestId || "").trim();
        if (!safeRequestId) return;
        try {
          const res = await fetch(`${API_BASE}/admin/password-reset-requests/${encodeURIComponent(safeRequestId)}/mark-sent`, {
            method: "POST",
            headers: getHeaders(),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data?.request) {
            throw new Error(data.error || "Failed to update password reset request");
          }
          passwordResetRequestsMutationVersion += 1;
          const updatedRequest = data.request;
          const updatedRequestId = String(updatedRequest.id || safeRequestId).trim();
          const cachedRequestIndex = cachedPasswordResetRequests.findIndex(
            (entry) => {
              const entryId = String(entry?.id || "").trim();
              return entryId === safeRequestId || entryId === updatedRequestId;
            },
          );
          if (cachedRequestIndex >= 0) {
            cachedPasswordResetRequests[cachedRequestIndex] = {
              ...cachedPasswordResetRequests[cachedRequestIndex],
              ...updatedRequest,
              status: "sent",
            };
          }
          renderPasswordResetRequests();
          showAlert("password-reset-alerts", "Password reset request marked as sent", "success");
          await loadPasswordResetRequests();
          await loadStats();
        } catch (err) {
          showAlert("password-reset-alerts", "Error: " + err.message, "error");
        }
      }

      async function copyPasswordResetCode(requestId = "") {
        const request = cachedPasswordResetRequests.find((entry) => entry.id === String(requestId || "").trim());
        if (!request) return;
        const code = getPasswordResetRequestCode(request);
        if (!code) return;
        const copied = await copyTextToClipboard(code);
        showAlert("password-reset-alerts", copied ? "Reset code copied" : "Unable to copy reset code", copied ? "success" : "error");
      }

      function openSubscriptionRequestModalLegacy(requestId) {
        const request = cachedSubscriptionRequests.find((entry) => entry.id === requestId);
        if (!request) return;
        selectedSubscriptionRequestId = request.id;
        selectedSubscriptionProofDataUrl = String(request?.proofDataUrl || "").trim();
        const modal = document.getElementById("subscription-request-modal");
        const body = document.getElementById("subscription-request-body");
        const title = document.getElementById("subscription-request-title");
        const subtitle = document.getElementById("subscription-request-subtitle");
        if (body) body.innerHTML = buildCompactMonetizationRequestDetailHtml(request);
        if (title) title.textContent = `${getMonetizationRequestTitle(request)} â€¢ ${request.planLabel || request.plan || "Subscription"}`;
        if (subtitle) subtitle.textContent = `${getMonetizationRequestContact(request)} â€¢ ${formatDate(request.requestedAt)}`;
        if (title) title.textContent = getMonetizationRequestModalTitle(getMonetizationBucket(request));
        modal?.classList.add("active");
      }

      function closeSubscriptionRequestModal() {
        selectedSubscriptionRequestId = "";
        document.getElementById("subscription-request-modal")?.classList.remove("active");
      }

      function openSubscriptionProofModal({ proofUrl = "", title: proofTitle = "Payment proof" } = {}) {
        const safeUrl = String(proofUrl || "").trim();
        const modal = document.getElementById("subscription-proof-modal");
        const img = document.getElementById("subscription-proof-image");
        const placeholder = document.getElementById("subscription-proof-placeholder");
        const modalTitle = document.getElementById("subscription-proof-title");
        const modalSubtitle = document.getElementById("subscription-proof-subtitle");
        if (modalTitle) modalTitle.textContent = proofTitle || "Payment Proof";
        if (modalSubtitle) modalSubtitle.textContent = safeUrl ? "Expanded transaction screenshot." : "No screenshot available.";
        if (safeUrl) {
          if (img) {
            img.src = safeUrl;
            img.classList.remove("hidden");
          }
          if (placeholder) placeholder.classList.add("hidden");
        } else {
          if (img) {
            img.removeAttribute("src");
            img.classList.add("hidden");
          }
          if (placeholder) placeholder.classList.remove("hidden");
        }
        modal?.classList.add("active");
      }

      function closeSubscriptionProofModal() {
        document.getElementById("subscription-proof-modal")?.classList.remove("active");
      }

      function buildCompactMonetizationRequestDetailHtml(request = {}) {
        const title = escapeHtml(getMonetizationRequestTitle(request));
        const contact = escapeHtml(getMonetizationRequestContact(request));
        const planLabel = escapeHtml(request?.planLabel || request?.user?.subscriptionPlanLabel || request?.plan || "None");
        const amount = getMonetizationRequestAmount(request);
        const amountText = amount ? `GHS ${amount}` : "GHS --";
        const transactionId = escapeHtml(request?.transactionId || request?.paymentReference || request?.proofText || "None");
        const proofUrl = String(request?.proofDataUrl || "").trim();
        const proofBlock = proofUrl
          ? `
            <button
              type="button"
              class="subscription-proof-link"
              data-action="open-proof-image"
              data-proof-url="${escapeHtml(proofUrl)}"
              data-proof-title="${title}"
            >
              View payment proof
            </button>
          `
          : `<div class="subscription-proof-empty">No payment proof uploaded.</div>`;

        const reviewActionButtons =
          getMonetizationBucket(request) === "request"
            ? `
              <div class="subscription-detail-actions">
                <button type="button" class="approve" data-action="approve-subscription-request" data-request-id="${escapeHtml(request?.id || "")}">Activate</button>
                <button type="button" class="reject" data-action="reject-subscription-request" data-request-id="${escapeHtml(request?.id || "")}">Reject</button>
              </div>
            `
            : "";

        return `
          <div class="subscription-detail-card subscription-approval-card">
            <div class="subscription-approval-row">
              <div class="subscription-approval-label">Student:</div>
              <div class="subscription-approval-value">${title}</div>
            </div>
            <div class="subscription-approval-row">
              <div class="subscription-approval-label">Contact:</div>
              <div class="subscription-approval-value">${contact}</div>
            </div>
            <div class="subscription-approval-row">
              <div class="subscription-approval-label">Plan:</div>
              <div class="subscription-approval-value">${planLabel}</div>
            </div>
            <div class="subscription-approval-row">
              <div class="subscription-approval-label">Amount:</div>
              <div class="subscription-approval-value">${escapeHtml(amountText)}</div>
            </div>
            <div class="subscription-approval-row">
              <div class="subscription-approval-label">Transaction ID:</div>
              <div class="subscription-approval-value">${transactionId}</div>
            </div>
            <div class="subscription-approval-proof">${proofBlock}</div>
          </div>

          ${reviewActionButtons}
        `;
      }

      function openSubscriptionRequestModal(requestId) {
        const request = cachedSubscriptionRequests.find((entry) => entry.id === requestId);
        if (!request) return;
        selectedSubscriptionRequestId = request.id;
        selectedSubscriptionProofDataUrl = String(request?.proofDataUrl || "").trim();
        const modal = document.getElementById("subscription-request-modal");
        const body = document.getElementById("subscription-request-body");
        const title = document.getElementById("subscription-request-title");
        if (body) body.innerHTML = buildCompactMonetizationRequestDetailHtml(request);
        if (title) title.textContent = getMonetizationRequestModalTitle(getMonetizationBucket(request));
        modal?.classList.add("active");
      }

      window.openSubscriptionRequestModal = openSubscriptionRequestModal;

      function openSubscriptionRejectModal(requestId) {
        const request = cachedSubscriptionRequests.find((entry) => entry.id === requestId);
        if (!request) return;
        pendingSubscriptionRejectRequestId = request.id;
        const modal = document.getElementById("subscription-reject-modal");
        const title = document.getElementById("subscription-reject-title");
        const subtitle = document.getElementById("subscription-reject-subtitle");
        const summary = document.getElementById("subscription-reject-summary");
        const select = document.getElementById("subscription-reject-reason");
        const amount = getMonetizationRequestAmount(request);
        if (title) title.textContent = "Reject with Reason";
        if (subtitle) subtitle.textContent = `${getMonetizationRequestTitle(request)} Â· ${request.planLabel || request.plan || "Subscription"}`;
        if (summary) {
          summary.innerHTML = `
            <div><strong>Student:</strong> ${escapeHtml(getMonetizationRequestTitle(request))}</div>
            <div><strong>Contact:</strong> ${escapeHtml(getMonetizationRequestContact(request))}</div>
            <div><strong>Plan:</strong> ${escapeHtml(request?.planLabel || request?.user?.subscriptionPlanLabel || request?.plan || "--")}</div>
            <div><strong>Amount:</strong> ${escapeHtml(amount ? formatGhsAmount(amount) : "GHS --")}</div>
          `;
        }
        if (select) {
          select.value = SUBSCRIPTION_REJECT_REASONS[0];
        }
        modal?.classList.add("active");
      }

      window.openSubscriptionRejectModal = openSubscriptionRejectModal;

      function buildSubscriptionDecisionSummaryHtml(request = {}) {
        const student = getMonetizationRequestTitle(request);
        const contact = getMonetizationRequestContact(request);
        const plan = String(request.planLabel || request.plan || "Subscription").trim();
        const amount = getMonetizationRequestAmount(request);
        const amountText = amount ? `GHS ${amount}` : "GHS --";
        const requestedAt = formatDate(request.requestedAt);
        return `
          <div><strong>Student:</strong> ${escapeHtml(student)}</div>
          <div><strong>Contact:</strong> ${escapeHtml(contact)}</div>
          <div><strong>Plan:</strong> ${escapeHtml(plan)}</div>
          <div><strong>Amount:</strong> ${escapeHtml(amountText)}</div>
          <div><strong>Requested:</strong> ${escapeHtml(requestedAt || "Unknown")}</div>
        `;
      }

      function openSubscriptionApproveModal(requestId) {
        const request = cachedSubscriptionRequests.find((entry) => entry.id === requestId);
        if (!request) return;
        pendingSubscriptionApproveRequestId = request.id;
        const modal = document.getElementById("subscription-approve-modal");
        const summary = document.getElementById("subscription-approve-summary");
        const title = document.getElementById("subscription-approve-title");
        const subtitle = document.getElementById("subscription-approve-subtitle");
        if (summary) summary.innerHTML = buildSubscriptionDecisionSummaryHtml(request);
        if (title) title.textContent = "Activate Subscription";
        if (subtitle) subtitle.textContent = "Confirm to unlock this member's access immediately.";
        modal?.classList.add("active");
      }

      window.openSubscriptionApproveModal = openSubscriptionApproveModal;

      function closeSubscriptionApproveModal() {
        pendingSubscriptionApproveRequestId = "";
        document.getElementById("subscription-approve-modal")?.classList.remove("active");
      }

      function closeSubscriptionRejectModal() {
        pendingSubscriptionRejectRequestId = "";
        document.getElementById("subscription-reject-modal")?.classList.remove("active");
      }

      async function reviewSubscriptionRequest(requestId, action, reviewNote = "") {
        const safeRequestId = String(requestId || "").trim();
        const safeAction = String(action || "").trim().toLowerCase();
        if (!safeRequestId || !["approve", "reject"].includes(safeAction)) return false;
        const promptLabel = safeAction === "approve" ? "activate" : "reject";
        try {
          const res = await fetch(`${API_BASE}/admin/subscription-requests/${encodeURIComponent(safeRequestId)}/${safeAction === "approve" ? "approve" : "reject"}`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(reviewNote ? { reviewNote } : {}),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(data.error || `Failed to ${promptLabel} subscription request`);
          }
          showAlert("monetization-alerts", `Subscription request ${promptLabel}d successfully`, "success");
          await refreshMonetizationBuckets(["request", "activated", "rejected"]);
          await loadStats();
          return true;
        } catch (err) {
          showAlert("monetization-alerts", `Error: ${err.message}`, "error");
          return false;
        }
      }

      function normalizeReportWarningTitle(value = "") {
        const title = String(value || "").trim();
        if (!title || title.toLowerCase() === "custom") {
          return "Community rules reminder";
        }
        return title;
      }

      function getReportWarningTargetLabel(report = {}) {
        const targetType = String(report?.type || "").trim().toLowerCase();
        const target = report?.target || {};
        const safeName = String(
          target?.name ||
            target?.displayName ||
            report?.targetName ||
            report?.targetUsername ||
            target?.username ||
            report?.targetId ||
            "",
        ).trim();
        if (targetType === "group") {
          return `the group "${safeName || "this group"}"`;
        }
        const username = String(target?.username || report?.targetUsername || "").trim();
        if (username) {
          return `@${username}`;
        }
        return `the account "${safeName || "this user"}"`;
      }

      function buildReportWarningBody(report = {}, title = "") {
        const resolvedTitle = normalizeReportWarningTitle(title);
        const warningDate = formatDate(report?.createdAt);
        const reportDate = warningDate === "--" ? "the reported time" : warningDate;
        const reason = String(report?.reason || "").trim() || "a community standards concern";
        const targetLabel = getReportWarningTargetLabel(report);
        const closingLineByTitle = {
          "Community rules reminder":
            "Please take this warning seriously to avoid suspension or permanent deletion of your account.",
          "Please keep the discussion respectful":
            "Please keep all communication respectful and avoid harassment, threats, or abuse.",
          "No spam, scams, or impersonation":
            "Do not send spam, scams, deceptive links, or impersonate other people.",
          "Follow the group guidelines":
            "Please follow the group guidelines immediately and avoid any further violations.",
        };
        const closingLine =
          closingLineByTitle[resolvedTitle] ||
          "Please review this warning carefully and correct the reported conduct immediately.";
        return [
          `We received a report on ${reportDate} concerning ${targetLabel}.`,
          `Reported concern: ${reason}.`,
          "This appears to violate our community guidelines and requires immediate attention.",
          "Please review this notice carefully and ensure all future activity follows the rules.",
          closingLine,
        ].join("\n\n");
      }

      function formatDetailValue(value) {
        if (value === null || value === undefined || value === "") {
          return "--";
        }
        if (typeof value === "object") {
          try {
            return JSON.stringify(value, null, 2);
          } catch {
            return String(value);
          }
        }
        return String(value);
      }

      function normalizeSearchText(value) {
        return String(value ?? "")
          .toLowerCase()
          .replace(/\s+/g, " ")
          .trim();
      }

      function formatPrivacyScope(value) {
        const normalized = normalizeSearchText(value);
        if (normalized === "everyone") return "Everyone";
        if (normalized === "friends") return "Friends only";
        if (normalized === "nobody") return "Only me";
        return displayValue(value);
      }

      function matchesUserSearch(user, query) {
        const normalizedQuery = normalizeSearchText(query);
        if (!normalizedQuery) return true;

        const haystack = normalizeSearchText(
          [
            user?.id,
            user?.title,
            user?.username,
            user?.name,
            user?.firstName,
            user?.lastName,
            user?.surname,
            user?.institution,
            user?.country,
            user?.email,
            user?.contact,
            user?.role,
            user?.professionalType,
            user?.subscriptionTier,
            user?.bio,
            user?.deactivatedAt,
            user?.deactivatedUntil,
          ]
            .filter(Boolean)
            .join(" "),
        );

        return normalizedQuery
          .split(" ")
          .filter(Boolean)
          .every((term) => haystack.includes(term));
      }

      function getArchivedUserById(archiveId) {
        const targetId = String(archiveId || "");
        return cachedDeletedUsers.find((entry) => String(entry?.archiveId || "") === targetId) || null;
      }

      function getArchivedGroupById(archiveId) {
        const targetId = String(archiveId || "");
        return cachedDeletedGroups.find((entry) => String(entry?.archiveId || "") === targetId) || null;
      }

      function renderPrivacyItem(label, value) {
        return `
          <div class="privacy-pill">
            <span class="privacy-pill-label">${escapeHtml(label)}</span>
            <div class="privacy-pill-value">${escapeHtml(formatPrivacyScope(value))}</div>
          </div>
        `;
      }

      function buildPrivacySummaryHtml(privacy) {
        const safePrivacy = privacy && typeof privacy === "object" ? privacy : {};
        return `
          <div class="detail-item" style="margin-top: 12px;">
            <span class="detail-label">Privacy</span>
            <div class="privacy-explainer">
              These settings control what other people can see about this account in the community area.
            </div>
            <div class="privacy-grid">
              ${renderPrivacyItem("Profile", safePrivacy.profileVisibility)}
              ${renderPrivacyItem("Bio", safePrivacy.bioVisibility)}
              ${renderPrivacyItem("School / Institution", safePrivacy.institutionVisibility)}
              ${renderPrivacyItem("Contact", safePrivacy.contactVisibility)}
              ${renderPrivacyItem("Leaderboard", safePrivacy.leaderboardVisibility)}
              ${renderPrivacyItem("Online status", safePrivacy.onlineVisibility)}
              ${renderPrivacyItem("Last seen", safePrivacy.lastSeenVisibility)}
              ${renderPrivacyItem("Friend requests", safePrivacy.allowFriendRequestsFrom)}
              ${renderPrivacyItem("Messages", safePrivacy.allowMessagesFrom)}
              ${renderPrivacyItem("Group adds", safePrivacy.groupAddVisibility)}
              ${renderPrivacyItem("Status posts", safePrivacy.statusVisibility)}
            </div>
          </div>
        `;
      }

      function getUserById(userId) {
        const targetId = String(userId || "");
        return cachedUsers.find((user) => String(user?.id || "") === targetId) || null;
      }

      function renderDetailItem(label, value, { preformatted = false } = {}) {
        const safeLabel = escapeHtml(label);
        const safeValue = escapeHtml(formatDetailValue(value));
        return `
          <div class="detail-item">
            <span class="detail-label">${safeLabel}</span>
            <div class="detail-value${preformatted ? " preformatted" : ""}">${safeValue}</div>
          </div>
        `;
      }

      function renderIdentityStack(primary = "", secondary = "", fallback = "--") {
        const safePrimary = String(primary || "").trim() || String(fallback || "--").trim() || "--";
        const safeSecondary = String(secondary || "").trim();
        if (!safeSecondary || safeSecondary.toLowerCase() === safePrimary.toLowerCase()) {
          return escapeHtml(safePrimary);
        }
        return `
          <div style="color:#0f172a;font-weight:600;line-height:1.2;">${escapeHtml(safePrimary)}</div>
          <div style="font-size:12px;color:#64748b;line-height:1.2;">${escapeHtml(safeSecondary)}</div>
        `;
      }

      function renderDetailIdentityItem(label, primary, secondary, fallback) {
        return `
          <div class="detail-item">
            <span class="detail-label">${escapeHtml(label)}</span>
            <div class="detail-value">${renderIdentityStack(primary, secondary, fallback)}</div>
          </div>
        `;
      }

      function renderProfileField(label, value, { wide = false } = {}) {
        const formattedValue = formatDetailValue(value);
        const safeValue = formattedValue === "--" ? "" : formattedValue;
        return `
          <div class="profile-field${wide ? " is-wide" : ""}">
            <span>${escapeHtml(label)}</span>
            <strong>${safeValue ? escapeHtml(safeValue) : "-"}</strong>
          </div>
        `;
      }

      function buildUserDetailsHtml(user) {
        const profileImage = String(user?.profileImage || "").trim();
        const contact = String(user?.contact || "").trim();
        const contactType = String(user?.contactType || "").trim().toLowerCase();
        const email = String(user?.email || (contactType === "email" ? contact : "")).trim();
        const phone = String(user?.phone || (contactType === "phone" ? contact : "")).trim();
        const initials = String(user?.name || user?.username || "U")
          .trim()
          .slice(0, 2)
          .toUpperCase() || "U";
        const avatarMarkup = profileImage
          ? `<img class="user-detail-avatar" src="${escapeHtml(profileImage)}" alt="Avatar of ${escapeHtml(displayValue(user?.username))}" loading="lazy" referrerpolicy="no-referrer" />`
          : `<span class="user-detail-avatar-fallback">${escapeHtml(initials)}</span>`;
        const reportCount = cachedReports.filter((report) =>
          String(report?.targetId || "") === String(user?.id || ""),
        ).length;

        return `
          <div class="profile-hero user-details-hero">
            ${avatarMarkup}
            <div class="profile-identity">
              <div class="user-details-name">${escapeHtml(displayValue(user?.name || user?.username))}</div>
              <div class="user-details-subtitle">@${escapeHtml(displayValue(user?.username))}</div>
              <div class="profile-status"><span></span>${escapeHtml(displayValue(user?.role || "Member"))} · ${escapeHtml(displayValue(user?.professionalType || "Platform user"))}</div>
            </div>
            <div class="profile-id">ID ${escapeHtml(displayValue(user?.id))}</div>
          </div>
          <div class="profile-section">
            <div class="profile-section-heading">Profile information</div>
            <div class="profile-fields">
              ${renderProfileField("Full name", user?.name)}
              ${renderProfileField("Email", email)}
              ${renderProfileField("Phone", phone)}
              ${renderProfileField("Role", user?.role)}
              ${renderProfileField("Professional type", user?.professionalType)}
              ${renderProfileField("Level", user?.level)}
              ${renderProfileField("Country", user?.country)}
              ${renderProfileField("Institution", user?.institution)}
              ${renderProfileField("Subscription", user?.subscriptionTier)}
              ${renderProfileField("Points", user?.points)}
              ${renderProfileField("Joined", formatDate(user?.createdAt))}
              ${renderProfileField("Last seen", formatDate(user?.lastSeenAt))}
              ${renderProfileField("Reports", reportCount)}
              ${renderProfileField("Bio", user?.bio, { wide: true })}
            </div>
          </div>
        `;
      }

      function updateUsersSummary(totalCount, visibleCount) {
        const summaryEl = document.getElementById("users-summary");
        const countEl = document.getElementById("users-result-count");
        if (countEl) {
          countEl.textContent = String(visibleCount);
        }
        if (!summaryEl) return;
        const searchActive = Boolean(normalizeSearchText(usersSearchQuery));
        summaryEl.innerHTML = searchActive
          ? `Showing <strong>${visibleCount}</strong> of <strong>${totalCount}</strong> users`
          : `Showing <strong>${visibleCount}</strong> users`;
      }

      function renderUsersTable() {
        const tbody = document.getElementById("users-table");
        if (!tbody) return;

        const filteredUsers = cachedUsers.filter((user) => matchesUserSearch(user, usersSearchQuery));
        tbody.innerHTML = "";

        updateUsersSummary(cachedUsers.length, filteredUsers.length);

        if (filteredUsers.length === 0) {
          const message = normalizeSearchText(usersSearchQuery)
            ? "No users match this search"
            : "No users yet";
          tbody.innerHTML = `
            <tr>
              <td colspan="4" style="text-align: center; color: #64748b;">${escapeHtml(message)}</td>
            </tr>
          `;
          return;
        }

        filteredUsers.forEach((user) => {
          const tr = document.createElement("tr");
          const userId = String(user.id || "");
          const safeUsername = escapeHtml(displayValue(user.username));
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
          tr.classList.add("user-row");
          tr.dataset.userId = userId;
          tr.tabIndex = 0;
          tr.setAttribute("role", "button");
          tr.innerHTML = `
            <td class="user-avatar-cell">${avatarMarkup}</td>
            <td>${safeUsername}</td>
            <td class="cell-wrap">${safeInstitution}</td>
            <td>${safeCreatedDate}</td>
          `;
          tbody.appendChild(tr);
        });
      }

      function updateDeletedUsersSummary(visibleCount, totalCount, restoredCount) {
        const summaryEl = document.getElementById("deleted-users-summary");
        const countEl = document.getElementById("deleted-users-result-count");
        if (countEl) {
          countEl.textContent = String(visibleCount);
        }
        if (!summaryEl) return;
        const restoredText = restoredCount > 0 ? `, <strong>${restoredCount}</strong> restored` : "";
        const searchActive = Boolean(normalizeSearchText(deletedUsersSearchQuery));
        summaryEl.innerHTML = searchActive
          ? `Showing <strong>${visibleCount}</strong> of <strong>${totalCount}</strong> archived accounts${restoredText}`
          : `Showing <strong>${visibleCount}</strong> archived accounts${restoredText}`;
      }

      function renderDeletedUsersTable() {
        const tbody = document.getElementById("deleted-users-table");
        if (!tbody) return;

        const archivedUsers = [...cachedDeletedUsers]
          .filter((user) => matchesUserSearch(user, deletedUsersSearchQuery))
          .sort((a, b) => String(b.deletedAt || "").localeCompare(String(a.deletedAt || "")));

        const restoredCount = cachedDeletedUsers.filter((entry) => entry.restoredAt).length;
        updateDeletedUsersSummary(archivedUsers.length, cachedDeletedUsers.length, restoredCount);
        tbody.innerHTML = "";

        if (archivedUsers.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="6" style="text-align: center; color: #64748b;">${escapeHtml(
                normalizeSearchText(deletedUsersSearchQuery)
                  ? "No archived accounts match this search"
                  : "No archived accounts yet",
              )}</td>
            </tr>
          `;
          return;
        }

        archivedUsers.forEach((entry) => {
          const user = entry || {};
          const row = document.createElement("tr");
          const safeArchiveId = String(user.archiveId || "");
          const safeUsername = escapeHtml(displayValue(user.username));
          const safeInstitution = escapeHtml(displayValue(user.institution));
          const safeDeletedAt = escapeHtml(formatDate(user.deletedAt));
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
          const restored = Boolean(user.restoredAt);
          const statusLabel = restored ? `Restored ${formatDate(user.restoredAt)}` : "Ready to restore";
          const deletedBy = escapeHtml(displayValue(user.deletedByName || user.deletedByType || "Unknown"));
          const actionButton = restored
            ? `<button class="btn-small" disabled>Restored</button>`
            : `<button class="btn-small archive-restore-btn" data-archive-id="${escapeHtml(safeArchiveId)}">Restore</button>`;

          row.classList.add("archive-row");
          row.innerHTML = `
            <td class="user-avatar-cell">${avatarMarkup}</td>
            <td>
              <div style="color:#0f172a;font-weight:600;">${safeUsername}</div>
              <div style="font-size:12px;color:#64748b;">${deletedBy}</div>
            </td>
            <td class="cell-wrap">${safeInstitution}</td>
            <td>${safeDeletedAt}</td>
            <td>
              <span class="archive-status ${restored ? "archive-status-restored" : ""}">${escapeHtml(statusLabel)}</span>
            </td>
            <td class="archive-action-cell">${actionButton}</td>
          `;
          tbody.appendChild(row);
        });
      }

      function updateDeletedGroupsSummary(visibleCount, totalCount, restoredCount) {
        const summaryEl = document.getElementById("deleted-groups-summary");
        const countEl = document.getElementById("deleted-groups-result-count");
        if (countEl) {
          countEl.textContent = String(visibleCount);
        }
        if (!summaryEl) return;
        const restoredText = restoredCount > 0 ? `, <strong>${restoredCount}</strong> restored` : "";
        const searchActive = Boolean(normalizeSearchText(deletedGroupsSearchQuery));
        summaryEl.innerHTML = searchActive
          ? `Showing <strong>${visibleCount}</strong> of <strong>${totalCount}</strong> archived groups${restoredText}`
          : `Showing <strong>${visibleCount}</strong> archived groups${restoredText}`;
      }

      function renderDeletedGroupsTable() {
        const tbody = document.getElementById("deleted-groups-table");
        if (!tbody) return;

        const archivedGroups = [...cachedDeletedGroups]
          .filter((group) => matchesGroupSearch(group, deletedGroupsSearchQuery))
          .sort((a, b) => String(b.deletedAt || "").localeCompare(String(a.deletedAt || "")));

        const restoredCount = cachedDeletedGroups.filter((entry) => entry.restoredAt).length;
        updateDeletedGroupsSummary(archivedGroups.length, cachedDeletedGroups.length, restoredCount);
        tbody.innerHTML = "";

        if (archivedGroups.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="6" style="text-align: center; color: #64748b;">${escapeHtml(
                normalizeSearchText(deletedGroupsSearchQuery)
                  ? "No archived groups match this search"
                  : "No archived groups yet",
              )}</td>
            </tr>
          `;
          return;
        }

        archivedGroups.forEach((entry) => {
          const group = entry || {};
          const row = document.createElement("tr");
          const safeArchiveId = String(group.archiveId || "");
          const safeName = escapeHtml(displayValue(group.name));
          const safeOwner = escapeHtml(displayValue(group.ownerName || group.ownerUsername));
          const safeMembers = escapeHtml(String(group.memberCount || 0));
          const safeDeletedAt = escapeHtml(formatDate(group.deletedAt));
          const safeAvatar = escapeHtml(String(group.avatarUrl || "").trim());
          const initials = escapeHtml(
            String(group.name || "G")
              .trim()
              .slice(0, 2)
              .toUpperCase() || "G",
          );
          const avatarMarkup = safeAvatar
            ? `<img class="group-avatar" src="${safeAvatar}" alt="Avatar of ${safeName}" loading="lazy" referrerpolicy="no-referrer" />`
            : `<span class="group-avatar-fallback">${initials}</span>`;
          const restored = Boolean(group.restoredAt);
          const statusLabel = restored ? `Restored ${formatDate(group.restoredAt)}` : "Ready to restore";
          const deletedBy = escapeHtml(displayValue(group.deletedByName || group.deletedByType || "Unknown"));
          const actionButton = restored
            ? `<button class="btn-small" disabled>Restored</button>`
            : `<button class="btn-small archive-restore-group-btn" data-archive-id="${escapeHtml(safeArchiveId)}">Restore</button>`;

          row.classList.add("archive-row");
          row.innerHTML = `
            <td class="group-avatar-cell">${avatarMarkup}</td>
            <td>
              <div style="color:#0f172a;font-weight:600;">${safeName}</div>
              <div style="font-size:12px;color:#64748b;">${escapeHtml(displayValue(group.bio || "No description"))}</div>
            </td>
            <td>
              <div style="color:#0f172a;font-weight:600;">${safeOwner}</div>
              <div style="font-size:12px;color:#64748b;">${deletedBy}</div>
            </td>
            <td>${safeMembers}</td>
            <td>
              <span class="archive-status ${restored ? "archive-status-restored" : ""}">${escapeHtml(statusLabel)}</span>
              <div style="font-size:12px;color:#64748b;margin-top:4px;">${safeDeletedAt}</div>
            </td>
            <td class="archive-action-cell">${actionButton}</td>
          `;
          tbody.appendChild(row);
        });
      }

      function matchesGroupSearch(group, query) {
        const normalizedQuery = normalizeSearchText(query);
        if (!normalizedQuery) return true;

        const haystack = normalizeSearchText(
          [
            group?.id,
            group?.name,
            group?.bio,
            group?.ownerName,
            group?.ownerUsername,
            group?.memberCount,
            group?.createdAt,
            group?.updatedAt,
          ]
            .filter(Boolean)
            .join(" "),
        );

        return normalizedQuery
          .split(" ")
          .filter(Boolean)
          .every((term) => haystack.includes(term));
      }

      function matchesReportSearch(report, query) {
        const normalizedQuery = normalizeSearchText(query);
        if (!normalizedQuery) return true;

        const haystack = normalizeSearchText(
          [
            report?.id,
            report?.type,
            report?.reporterName,
            report?.targetName,
            report?.targetUsername,
            report?.reason,
            report?.status,
            report?.warningMessage,
            report?.createdAt,
          ]
            .filter(Boolean)
            .join(" "),
        );

        return normalizedQuery
          .split(" ")
          .filter(Boolean)
          .every((term) => haystack.includes(term));
      }

      function getGroupById(groupId) {
        const targetId = String(groupId || "");
        return cachedGroups.find((entry) => String(entry?.id || "") === targetId) || null;
      }

      function getReportById(reportId) {
        const targetId = String(reportId || "");
        return cachedReports.find((entry) => String(entry?.id || "") === targetId) || null;
      }

      function buildLegacyGroupDetailsHtml(group) {
        const safeAvatar = String(group?.avatarUrl || "").trim();
        const initials = String(group?.name || "G")
          .trim()
          .slice(0, 2)
          .toUpperCase() || "G";
        const avatarMarkup = safeAvatar
          ? `<img class="group-details-avatar" src="${escapeHtml(safeAvatar)}" alt="Avatar of ${escapeHtml(displayValue(group?.name))}" loading="lazy" referrerpolicy="no-referrer" />`
          : `<span class="group-details-avatar-fallback">${escapeHtml(initials)}</span>`;
        const members = Array.isArray(group?.members) ? group.members : [];

        return `
          <div class="profile-hero group-details-hero">
            ${avatarMarkup}
            <div class="profile-identity">
              <div class="group-details-name">${escapeHtml(displayValue(group?.name))}</div>
              <div class="group-details-subtitle">${escapeHtml(displayValue(group?.bio || "Community group"))}</div>
              <div class="profile-status"><span></span>${escapeHtml(displayValue(group?.memberCount || 0))} members · Owner: ${escapeHtml(displayValue(group?.ownerName || group?.ownerUsername))}</div>
            </div>
            <div class="profile-id">ID ${escapeHtml(displayValue(group?.id))}</div>
          </div>
          <div class="profile-section">
            <div class="profile-section-heading">Group information</div>
            <div class="profile-fields">
              ${renderProfileField("Owner", group?.ownerUsername)}
              ${renderProfileField("Members", group?.memberCount)}
              ${renderProfileField("Admins", group?.adminCount)}
              ${renderProfileField("Created", formatDate(group?.createdAt))}
              ${renderProfileField("Updated", formatDate(group?.updatedAt))}
            </div>
          </div>
          <div class="group-details-members">
            <div class="group-details-members-title">Members</div>
            <div class="group-details-members-list">
              ${
                members.length
                  ? members
                      .map((member) => {
                        const memberAvatar = String(member?.profileImage || "").trim();
                        const memberInitials = String(member?.name || member?.username || "M")
                          .trim()
                          .slice(0, 2)
                          .toUpperCase() || "M";
                        const role = String(member?.role || "member");
                        const memberId = String(member?.id || member?.userId || member?._id || "").trim();
                        return `
                          <div class="group-member-row${memberId ? " is-clickable" : ""}"${memberId ? ` data-member-user-id="${escapeHtml(memberId)}" tabindex="0" role="button"` : ""}>
                            ${
                              memberAvatar
                                ? `<img class="group-member-avatar" src="${escapeHtml(memberAvatar)}" alt="Avatar of ${escapeHtml(displayValue(member?.name || member?.username))}" loading="lazy" referrerpolicy="no-referrer" />`
                                : `<span class="group-member-avatar-fallback">${escapeHtml(memberInitials)}</span>`
                            }
                            <div>
                              <div class="group-member-name">${escapeHtml(displayValue(member?.name || member?.username))}</div>
                              <div class="group-member-meta">@${escapeHtml(displayValue(member?.username))} â€¢ ${escapeHtml(displayValue(member?.country || member?.institution || "Member"))}</div>
                            </div>
                            <div class="group-member-role">${escapeHtml(role.charAt(0).toUpperCase() + role.slice(1))}</div>
                          </div>
                        `;
                      })
                      .join("")
                  : '<div style="text-align:center;color:#64748b;padding:12px 0;">No members found.</div>'
              }
            </div>
          </div>
        `;
      }

      // Keep the group profile markup in one clean renderer so legacy encoded separators
      // cannot leak into the details modal.
      function buildGroupDetailsHtml(group) {
        const safeAvatar = String(group?.avatarUrl || "").trim();
        const initials = String(group?.name || "G").trim().slice(0, 2).toUpperCase() || "G";
        const avatarMarkup = safeAvatar
          ? `<img class="group-details-avatar" src="${escapeHtml(safeAvatar)}" alt="Avatar of ${escapeHtml(displayValue(group?.name))}" loading="lazy" referrerpolicy="no-referrer" />`
          : `<span class="group-details-avatar-fallback">${escapeHtml(initials)}</span>`;
        const members = Array.isArray(group?.members) ? group.members : [];
        const reportCount = cachedReports.filter((report) =>
          String(report?.targetId || "") === String(group?.id || ""),
        ).length;
        return `
          <div class="profile-hero group-details-hero">
            ${avatarMarkup}
            <div class="profile-identity">
              <div class="group-details-name">${escapeHtml(displayValue(group?.name))}</div>
              <div class="group-details-subtitle">${escapeHtml(displayValue(group?.bio || "Community group"))}</div>
              <div class="profile-status"><span></span>${escapeHtml(displayValue(group?.memberCount || 0))} members - Owner: ${escapeHtml(displayValue(group?.ownerName || group?.ownerUsername))}</div>
            </div>
            <div class="profile-id">ID ${escapeHtml(displayValue(group?.id))}</div>
          </div>
          <div class="profile-section">
            <div class="profile-section-heading">Group information</div>
            <div class="profile-fields">
              ${renderProfileField("Owner", group?.ownerUsername)}
              ${renderProfileField("Members", group?.memberCount)}
              ${renderProfileField("Admins", group?.adminCount)}
              ${renderProfileField("Created", formatDate(group?.createdAt))}
              ${renderProfileField("Updated", formatDate(group?.updatedAt))}
              ${renderProfileField("Reports", reportCount)}
            </div>
          </div>
          <div class="group-details-members">
            <div class="group-details-members-title">Members</div>
            <div class="group-details-members-list">
              ${members.length ? members.map((member) => {
                const memberAvatar = String(member?.profileImage || "").trim();
                const memberInitials = String(member?.name || member?.username || "M").trim().slice(0, 2).toUpperCase() || "M";
                const role = String(member?.role || "member");
                const memberId = String(member?.id || member?.userId || member?._id || "").trim();
                return `
                  <div class="group-member-row${memberId ? " is-clickable" : ""}"${memberId ? ` data-member-user-id="${escapeHtml(memberId)}" tabindex="0" role="button"` : ""}>
                    ${memberAvatar ? `<img class="group-member-avatar" src="${escapeHtml(memberAvatar)}" alt="Avatar of ${escapeHtml(displayValue(member?.name || member?.username))}" loading="lazy" referrerpolicy="no-referrer" />` : `<span class="group-member-avatar-fallback">${escapeHtml(memberInitials)}</span>`}
                    <div>
                      <div class="group-member-name">${escapeHtml(displayValue(member?.name || member?.username))}</div>
                      <div class="group-member-meta">@${escapeHtml(displayValue(member?.username))} - ${escapeHtml(displayValue(member?.country || member?.institution || "Member"))}</div>
                    </div>
                    <div class="group-member-role">${escapeHtml(role.charAt(0).toUpperCase() + role.slice(1))}</div>
                  </div>`;
              }).join("") : '<div style="text-align:center;color:#64748b;padding:12px 0;">No members found.</div>'}
            </div>
          </div>`;
      }

      function buildLegacyReportDetailsHtml(report) {
        const reporterUsername = displayValue(report?.reporter?.username || report?.reporterUsername || report?.reporterName);
        const reporterName = displayValue(report?.reporter?.name || report?.reporterName);
        const targetUsername = displayValue(report?.target?.username || report?.targetUsername || report?.targetName);
        const targetName = displayValue(report?.target?.name || report?.targetName);
        const targetType = String(report?.type || "").trim().toLowerCase() === "group" ? "Group" : "User";
        const status = String(report?.status || "open").trim();
        return `
          <div class="report-details-grid">
            ${renderDetailItem("Type", targetType)}
            ${renderDetailIdentityItem("Reporter", reporterUsername, reporterName, "Unknown reporter")}
            ${renderDetailIdentityItem("Target", targetUsername, targetName, "Unknown target")}
            ${renderDetailItem("Target username", targetUsername)}
            ${renderDetailItem("Reason", report?.reason)}
            ${renderDetailItem("Reported at", formatDate(report?.createdAt))}
            ${renderDetailItem("Status", status)}
            ${renderDetailItem("Warning", report?.warningMessage || "None yet")}
          </div>
          ${
            report?.type === "group" && report?.target
              ? `<div class="group-details-members">
                  <div class="group-details-members-title">Reported group summary</div>
                  <div class="group-details-members-list">
                    <div class="group-member-row">
                      ${
                        String(report?.target?.avatarUrl || "").trim()
                          ? `<img class="group-member-avatar" src="${escapeHtml(String(report.target.avatarUrl || ""))}" alt="Group avatar" loading="lazy" referrerpolicy="no-referrer" />`
                          : `<span class="group-member-avatar-fallback">${escapeHtml(String(targetName || "G").slice(0, 2).toUpperCase())}</span>`
                      }
                      <div>
                        <div class="group-member-name">${escapeHtml(targetName)}</div>
                        <div class="group-member-meta">Owner: ${escapeHtml(displayValue(report?.target?.ownerName || report?.target?.ownerUsername))} â€¢ ${escapeHtml(String(report?.target?.memberCount || 0))} members</div>
                      </div>
                      <div class="group-member-role">${escapeHtml(status)}</div>
                    </div>
                  </div>
                </div>`
              : ""
          }
        `;
      }

      function buildStructuredReportDetailsHtml(report) {
        const reporterUsername = displayValue(report?.reporter?.username || report?.reporterUsername || report?.reporterName);
        const reporterName = displayValue(report?.reporter?.name || report?.reporterName);
        const targetUsername = displayValue(report?.target?.username || report?.targetUsername || report?.targetName);
        const targetName = displayValue(report?.target?.name || report?.targetName);
        const targetType = String(report?.type || "").trim().toLowerCase() === "group" ? "Group" : "User";
        const status = String(report?.status || "open").trim();
        const reason = displayValue(report?.reason || "No reason provided");
        const statusClass = status.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        return `
          <div class="case-report">
            <div class="case-report-header">
              <div>
                <div class="case-report-eyebrow">Case report</div>
                <h2>${escapeHtml(reason)}</h2>
                <p>Submitted ${escapeHtml(formatDate(report?.createdAt))}</p>
              </div>
              <span class="case-report-status ${escapeHtml(statusClass)}">${escapeHtml(status)}</span>
            </div>
            <div class="case-report-parties">
              <div><span>Reported by</span><strong>${escapeHtml(reporterName)}</strong><small>@${escapeHtml(reporterUsername)}</small></div>
              <div><span>Reported account</span><strong>${escapeHtml(targetName)}</strong><small>@${escapeHtml(targetUsername)} · ${escapeHtml(targetType)}</small></div>
            </div>
            <dl class="case-report-facts">
              <div><dt>Case ID</dt><dd>${escapeHtml(displayValue(report?.id || report?.reportId))}</dd></div>
              <div><dt>Report type</dt><dd>${escapeHtml(targetType)}</dd></div>
              <div><dt>Current status</dt><dd>${escapeHtml(status)}</dd></div>
              <div><dt>Warning sent</dt><dd>${escapeHtml(report?.warningMessage ? "Yes" : "No")}</dd></div>
            </dl>
            ${report?.type === "group" && report?.target ? `<div class="case-report-context"><span>Group context</span><strong>${escapeHtml(targetName)}</strong><p>Owner: ${escapeHtml(displayValue(report?.target?.ownerName || report?.target?.ownerUsername))} · ${escapeHtml(String(report?.target?.memberCount || 0))} members</p></div>` : ""}
          </div>
        `;
      }

      function getAdminReportStatusLabel(value = "") {
        const status = String(value || "").trim().toLowerCase();
        if (status === "warned" || status === "warn") return "Warned";
        if (status === "opened" || status === "open") return status === "open" ? "Reported" : "Opened";
        return status ? status.charAt(0).toUpperCase() + status.slice(1) : "Reported";
      }

      function buildReportDetailsHtml(report) {
        const reporterName = displayValue(report?.reporter?.name || report?.reporterName || report?.reporter?.username);
        const reporterUsername = displayValue(report?.reporter?.username || report?.reporterUsername);
        const targetName = displayValue(report?.target?.name || report?.targetName || report?.target?.username);
        const targetUsername = displayValue(report?.target?.username || report?.targetUsername);
        const target = report?.target || {};
        const isGroupReport = String(report?.type || "").toLowerCase() === "group";
        const targetDescription = String(target?.bio || target?.description || "").trim();
        const targetAvatar = String(target?.profileImage || target?.avatarUrl || "").trim();
        const targetInitials = String(targetName || targetUsername || "U").slice(0, 2).toUpperCase();
        const targetAvatarMarkup = targetAvatar
          ? `<img class="case-subject-avatar" src="${escapeHtml(targetAvatar)}" alt="${escapeHtml(targetName)}" loading="lazy" referrerpolicy="no-referrer" />`
          : `<span class="case-subject-avatar case-subject-avatar-fallback">${escapeHtml(targetInitials)}</span>`;
        const reason = displayValue(report?.reason || "No reason provided");
        const userDetails = String(report?.description || "").trim();
        const reportCount = cachedReports.filter((entry) =>
          String(entry?.targetId || "") === String(report?.targetId || target?.id || ""),
        ).length || 1;
        const pendingReportCount = cachedReports.filter((entry) =>
          String(entry?.targetId || "") === String(report?.targetId || target?.id || "") &&
          String(entry?.status || "").toLowerCase() !== "warned",
        ).length;
        const evidence = Array.isArray(report?.evidence) ? report.evidence : [];
        const evidenceMarkup = evidence.length
          ? `<div class="case-report-evidence"><div class="case-report-evidence-list">${evidence.map((item) => {
              const url = getReportEvidenceUrl(item);
              const fileName = escapeHtml(item?.fileName || "Evidence");
              const mimeType = getReportEvidenceMime(item);
              const index = evidence.indexOf(item);
              if (url && mimeType.startsWith("image/")) return `<div role="button" tabindex="0" class="case-report-evidence-tile" data-admin-evidence-index="${index}"><img src="${escapeHtml(url)}" alt="${fileName}" loading="lazy" /><span>${fileName}</span></div>`;
              if (url && mimeType.startsWith("video/")) return `<div role="button" tabindex="0" class="case-report-evidence-tile" data-admin-evidence-index="${index}"><video muted preload="metadata" src="${escapeHtml(url)}"></video><span>${fileName}</span></div>`;
              return `<div role="button" tabindex="0" class="case-report-evidence-tile is-file" data-admin-evidence-index="${index}"><span class="case-report-evidence-file-icon">${escapeHtml((mimeType.split("/").pop() || "file").slice(0, 5))}</span><span>${fileName}</span></div>`;
            }).join("")}</div></div>`
          : "";
        const groupAdminNames = Array.isArray(target?.members)
          ? target.members
              .filter((member) => ["admin", "owner"].includes(String(member?.role || "").toLowerCase()))
              .map((member) => String(member?.name || member?.username || "").trim())
              .filter(Boolean)
          : [];
        const groupAdmins = groupAdminNames.length ? groupAdminNames.join(" · ") : "--";
        const groupMemberCount = Number(target?.memberCount) || (Array.isArray(target?.members) ? target.members.length : 0);
        const contactValues = [target?.email, target?.phone, target?.phoneNumber]
          .map((value) => String(value || "").trim())
          .filter(Boolean)
          .filter((value, index, values) => values.indexOf(value) === index);
        const targetContact = contactValues.join(" · ") || String(target?.contact || "").trim() || "--";
        return `
          <div class="case-form">
            <section class="case-form-section">
              <div class="case-form-grid">
                <div><span>Reported by</span><strong>${escapeHtml(reporterName)}</strong></div>
                <div><span>Target</span><strong>${escapeHtml(targetName)}</strong></div>
                <div><span>Reported on</span><strong>${escapeHtml(formatDate(report?.createdAt))}</strong></div>
                <div><span>Case ID</span><strong>${escapeHtml(displayValue(report?.id || report?.reportId))}</strong></div>
              </div>
            </section>
            <section class="case-form-section case-form-user">
              <div class="case-form-user-head">
                ${targetAvatarMarkup}
                <div><strong>${escapeHtml(targetName)}</strong><small>${isGroupReport ? escapeHtml(targetDescription || "Group") : (targetUsername ? `@${escapeHtml(targetUsername)}` : "-")}</small></div>
              </div>
              <div class="case-form-grid">
                ${isGroupReport
                  ? `<div><span>Admins</span><strong>${escapeHtml(groupAdmins)}</strong></div>
                     <div><span>Members</span><strong>${escapeHtml(String(groupMemberCount))}</strong></div>
                     <div><span>Created</span><strong>${escapeHtml(formatDate(target?.createdAt))}</strong></div>
                     <div><span>Last activity</span><strong>${escapeHtml(formatDate(target?.updatedAt))}</strong></div>`
                  : `<div><span>Email / phone</span><strong>${escapeHtml(targetContact)}</strong></div>
                     <div><span>Joined</span><strong>${escapeHtml(formatDate(target?.createdAt))}</strong></div>
                     <div><span>Last activity</span><strong>${escapeHtml(formatDate(target?.lastSeenAt || target?.updatedAt))}</strong></div>`}
                <div><span>Previous reports</span><strong>${reportCount} total · ${pendingReportCount} pending</strong></div>
              </div>
            </section>
            <div class="case-form-case-content">
              <span>Case content:</span>
              <strong>${escapeHtml(reason)}</strong>
              ${userDetails ? `<div class="case-form-case-detail">${escapeHtml(userDetails)}</div>` : ""}
            </div>
            ${evidenceMarkup}
          </div>
        `;
      }

      function updateGroupsSummary(totalCount, visibleCount) {
        const summaryEl = document.getElementById("groups-summary");
        const countEl = document.getElementById("groups-result-count");
        if (countEl) {
          countEl.textContent = String(visibleCount);
        }
        if (!summaryEl) return;
        const searchActive = Boolean(normalizeSearchText(groupsSearchQuery));
        summaryEl.innerHTML = searchActive
          ? `Showing <strong>${visibleCount}</strong> of <strong>${totalCount}</strong> groups`
          : `Showing <strong>${visibleCount}</strong> groups`;
      }

      function updateReportsSummary(totalCount, visibleCount) {
        const summaryEl = document.getElementById("reports-summary");
        const countEl = document.getElementById("reports-result-count");
        if (countEl) {
          countEl.textContent = String(visibleCount);
        }
        if (!summaryEl) return;
        const searchActive = Boolean(normalizeSearchText(reportsSearchQuery));
        summaryEl.innerHTML = searchActive
          ? `Showing <strong>${visibleCount}</strong> of <strong>${totalCount}</strong> ${reportsViewType === "group" ? "group reports" : "user reports"}`
          : `Showing <strong>${visibleCount}</strong> ${reportsViewType === "group" ? "group reports" : "user reports"}`;
      }

      function renderGroupsTable() {
        const tbody = document.getElementById("groups-table");
        if (!tbody) return;

        const filteredGroups = cachedGroups
          .filter((group) => matchesGroupSearch(group, groupsSearchQuery))
          .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));

        updateGroupsSummary(cachedGroups.length, filteredGroups.length);
        tbody.innerHTML = "";

        if (filteredGroups.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="5" style="text-align: center; color: #64748b;">${escapeHtml(
                normalizeSearchText(groupsSearchQuery) ? "No groups match this search" : "No groups yet",
              )}</td>
            </tr>
          `;
          return;
        }

        filteredGroups.forEach((group) => {
          const row = document.createElement("tr");
          row.classList.add("group-row");
          row.dataset.groupId = String(group.id || "");
          row.tabIndex = 0;
          row.setAttribute("role", "button");
          const safeName = escapeHtml(displayValue(group.name));
          const safeOwner = escapeHtml(displayValue(group.ownerName || group.ownerUsername));
          const safeCreatedAt = escapeHtml(formatDate(group.createdAt));
          const safeMembers = escapeHtml(String(group.memberCount ?? 0));
          const safeAvatar = escapeHtml(String(group.avatarUrl || "").trim());
          const initials = escapeHtml(
            String(group.name || "G")
              .trim()
              .slice(0, 2)
              .toUpperCase() || "G",
          );
          const avatarMarkup = safeAvatar
            ? `<img class="group-avatar" src="${safeAvatar}" alt="Avatar of ${safeName}" loading="lazy" referrerpolicy="no-referrer" />`
            : `<span class="group-avatar-fallback">${initials}</span>`;
          row.innerHTML = `
            <td class="group-avatar-cell">${avatarMarkup}</td>
            <td class="cell-wrap">
              <div style="color:#0f172a;font-weight:600;">${safeName}</div>
              <div style="font-size:12px;color:#64748b;">${escapeHtml(displayValue(group.bio || "No description"))}</div>
            </td>
            <td class="cell-wrap">${safeOwner}</td>
            <td>${safeMembers}</td>
            <td>${safeCreatedAt}</td>
          `;
          tbody.appendChild(row);
        });
      }

      function renderReportsTable() {
        const tbody = document.getElementById("reports-table");
        if (!tbody) return;

        const groupBtn = document.getElementById("reports-group-btn");
        const userBtn = document.getElementById("reports-user-btn");
        if (groupBtn) groupBtn.classList.toggle("active", reportsViewType === "group");
        if (userBtn) userBtn.classList.toggle("active", reportsViewType === "user");

        const filteredReports = cachedReports
          .filter((report) => String(report?.type || "").trim().toLowerCase() === reportsViewType)
          .filter((report) => matchesReportSearch(report, reportsSearchQuery))
          .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));

        const typeCount = cachedReports.filter(
          (report) => String(report?.type || "").trim().toLowerCase() === reportsViewType,
        ).length;
        updateReportsSummary(typeCount, filteredReports.length);
        tbody.innerHTML = "";

        if (filteredReports.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="5" style="text-align: center; color: #64748b;">${escapeHtml(
                normalizeSearchText(reportsSearchQuery)
                  ? "No reports match this search"
                  : reportsViewType === "group"
                    ? "No group reports yet"
                    : "No user reports yet",
              )}</td>
            </tr>
          `;
          return;
        }

        filteredReports.forEach((report) => {
          const row = document.createElement("tr");
          row.classList.add("report-row");
          row.dataset.reportId = String(report.id || "");
          row.tabIndex = 0;
          row.setAttribute("role", "button");
          const safeReporter = escapeHtml(displayValue(report.reporterName || report.reporter?.name));
          const safeTarget = escapeHtml(displayValue(report.targetName || report.target?.name || report.targetUsername || report.target?.username));
          const safeReportedAt = escapeHtml(formatDate(report.createdAt));
          const safeWarnedAt = escapeHtml(report.warningIssuedAt ? formatDate(report.warningIssuedAt) : "-");
          const reportStatus = getAdminReportStatusLabel(report.status);
          const statusClass = reportStatus.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          const safeStatus = escapeHtml(reportStatus);
          row.innerHTML = `
            <td><span class="report-status-chip report-status-${escapeHtml(statusClass)}">${safeStatus}</span></td>
            <td class="cell-wrap">${safeReporter}</td>
            <td class="cell-wrap">${safeTarget}</td>
            <td>${safeReportedAt}</td>
            <td>${safeWarnedAt}</td>
          `;
          tbody.appendChild(row);
        });
      }

      function getCorrectDisplay(question) {
        const options = getEffectiveOptions(question);
        if (!options.length) {
          return { index: null, text: String(question?.correct || "").trim() || "--" };
        }

        const byIndex = toCorrectOptionIndex(question);
        const text = options[byIndex] || String(question?.correct || "").trim() || "--";
        const index = options[byIndex] ? byIndex : null;

        return { index, text };
      }

      function questionOrderValue(question) {
        const rawText = String(question?.text || question?.question || "").trim();
        const match = rawText.match(/\bQ\s*\.?\s*(\d+)\b/i);
        if (match) return Number(match[1]);
        return Number(question?.id) || Number.MAX_SAFE_INTEGER;
      }

      function buildQuestionPreview(questionText, maxLen = 84) {
        const text = String(questionText || "").replace(/\s+/g, " ").trim();
        if (!text) return "--";
        return text.length > maxLen ? `${text.slice(0, maxLen).trimEnd()}...` : text;
      }

      function matchesQuestionSearch(question, query) {
        const normalizedQuery = normalizeSearchText(query);
        if (!normalizedQuery) return true;

        const questionNumber = String(questionOrderValue(question) || "").trim();
        const questionId = String(question?.id || "").trim();
        const questionText = String(question?.text || question?.question || "").trim();
        const category = String(question?.category || "").trim();
        const topicSlug = String(question?.topicSlug || "").trim();
        const sectionId = String(question?.sectionId || "").trim();
        const correctText = getCorrectDisplay(question)?.text || "";
        const optionsText = getEffectiveOptions(question).join(" ");
        const haystack = normalizeSearchText(
          [
            questionId,
            questionNumber,
            questionText,
            category,
            topicSlug,
            sectionId,
            correctText,
            optionsText,
          ]
            .filter(Boolean)
            .join(" "),
        );

        return normalizedQuery
          .split(" ")
          .filter(Boolean)
          .every((term) => haystack.includes(term));
      }

      function getHeaders() {
        return {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        };
      }

      function withNoCache(url) {
        const sep = url.includes("?") ? "&" : "?";
        return `${url}${sep}_ts=${Date.now()}`;
      }

      function showAlert(containerId, message, type = "info") {
        if (type === "success") {
          showAdminActionNotice(message, type);
          return;
        }
        const container = document.getElementById(containerId);
        if (!container) return;
        const alert = document.createElement("div");
        const isSuccessNotice = type === "success";
        alert.className = `alert ${type}${isSuccessNotice ? " admin-notice-toast" : ""}`;
        if (isSuccessNotice) alert.setAttribute("role", "status");
        alert.textContent = message;
        container.innerHTML = "";
        container.appendChild(alert);
        const dismissAfterMs = type === "error" ? 8000 : isSuccessNotice ? 4000 : 5000;
        if (dismissAfterMs > 0) {
          window.setTimeout(() => {
            if (!alert.isConnected) return;
            alert.classList.add("is-leaving");
            window.setTimeout(() => alert.remove(), 220);
          }, 4000);
        }
      }

      function showAdminActionNotice(message = "", type = "success") {
        const notice = document.getElementById("admin-action-notice");
        if (!notice) return;
        const text = String(message || "").trim();
        if (!text) {
          notice.textContent = "";
          notice.classList.add("hidden");
          return;
        }
        notice.textContent = text;
        notice.classList.remove("hidden", "is-leaving", "error");
        if (type === "error") notice.classList.add("error");
        window.clearTimeout(showAdminActionNotice.timer);
        showAdminActionNotice.timer = window.setTimeout(() => {
          if (!notice.isConnected) return;
          notice.classList.add("is-leaving");
          window.setTimeout(() => {
            notice.classList.add("hidden");
            notice.classList.remove("is-leaving");
          }, 220);
        }, 4000);
      }

function getAdminLoginScreen() {
        return document.getElementById("login-screen") || document.querySelector(".login-screen");
      }

      function getAdminDashboard() {
        return document.getElementById("dashboard") || document.querySelector(".dashboard");
      }

            function getAdminNotificationBannerEl() {
        return document.getElementById("admin-notification-banner");
      }

      function hideAdminNotificationBanner() {
        if (adminNotificationBannerHideTimer) {
          clearTimeout(adminNotificationBannerHideTimer);
          adminNotificationBannerHideTimer = null;
        }
        const banner = getAdminNotificationBannerEl();
        if (!banner) return;
        banner.textContent = "";
        banner.classList.add("hidden");
      }

      function showAdminNotificationBanner(message = "", { durationMs = 5500 } = {}) {
        const banner = getAdminNotificationBannerEl();
        if (!banner) return;
        const text = String(message || "").trim();
        if (!text) {
          hideAdminNotificationBanner();
          return;
        }
        banner.textContent = text;
        banner.classList.remove("hidden");
        if (adminNotificationBannerHideTimer) {
          clearTimeout(adminNotificationBannerHideTimer);
        }
        adminNotificationBannerHideTimer = durationMs > 0
          ? window.setTimeout(() => hideAdminNotificationBanner(), durationMs)
          : null;
      }

      function maybeShowAdminReportsBanner(reports = []) {
        const actionableReports = (Array.isArray(reports) ? reports : []).filter((report) => {
          const status = String(report?.status || "open").trim().toLowerCase();
          return !["warned", "warn", "resolved", "closed"].includes(status);
        });
        const totalReports = actionableReports.length;
        if (totalReports <= 0) {
          hideAdminNotificationBanner();
          return;
        }
        const groupReports = actionableReports.filter(
          (report) => String(report?.type || "").trim().toLowerCase() === "group",
        ).length;
        const userReports = actionableReports.filter(
          (report) => String(report?.type || "").trim().toLowerCase() === "user",
        ).length;
        const signature = `${totalReports}:${groupReports}:${userReports}`;
        try {
          const banner = getAdminNotificationBannerEl();
          if (
            sessionStorage.getItem(ADMIN_NOTIFICATION_BANNER_STORAGE_KEY) === signature &&
            banner &&
            !banner.classList.contains("hidden")
          ) {
            return;
          }
          sessionStorage.setItem(ADMIN_NOTIFICATION_BANNER_STORAGE_KEY, signature);
        } catch {
          // If storage is unavailable, still show the live notice.
        }
        const details = [];
        if (groupReports) details.push(`${groupReports} group${groupReports === 1 ? "" : "s"}`);
        if (userReports) details.push(`${userReports} user${userReports === 1 ? "" : "s"}`);
        showAdminNotificationBanner(
          `${totalReports} report${totalReports === 1 ? "" : "s"} awaiting review${details.length ? ` - ${details.join(", ")}` : ""}`,
        );
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
          await ensureAdminApiBase();
          // Validate the key against a protected admin endpoint.
          const res = await fetchAdmin(`${API_BASE}/admin/stats`, {
            headers: getHeaders(),
            cache: "no-store",
          });

          if (res.ok) {
            localStorage.setItem(ADMIN_KEY_STORAGE, adminKey);
            const loginScreen = getAdminLoginScreen();
            if (loginScreen) loginScreen.style.display = "none";
            const dashboard = getAdminDashboard();
            if (dashboard) dashboard.classList.add("active");
            refreshData();
            startAdminLiveRefresh();
          } else {
            alert("Invalid admin key");
          }
        } catch (err) {
          alert("Failed to connect to backend: " + err.message);
        }
      }

      function logout() {
        if (adminLiveRefreshTimer) window.clearInterval(adminLiveRefreshTimer);
        adminLiveRefreshTimer = null;
        localStorage.removeItem(ADMIN_KEY_STORAGE);
        adminKey = null;
        hideAdminNotificationBanner();
        broadcastChatAttachment = null;
        broadcastChatEmojiPickerOpen = false;
        broadcastStatusAttachment = null;
        cachedBroadcastThreads = [];
        cachedBroadcastStatuses = [];
        cachedBroadcastThreadDetail = new Map();
        selectedBroadcastThreadKey = "";
        broadcastThreadOpen = false;
        selectedBroadcastStatusId = "";
        broadcastOverviewLoaded = false;
        const loginScreen = getAdminLoginScreen();
        if (loginScreen) loginScreen.style.display = "block";
        const dashboard = getAdminDashboard();
        if (dashboard) dashboard.classList.remove("active");
        document.getElementById("admin-key").value = "";
        setAdminKeyVisibility(false);
      }

      async function refreshData() {
        const refreshBtn = document.getElementById("refresh-data-btn");
        const originalMarkup = refreshBtn?.innerHTML || "Refresh";

        if (refreshBtn) {
          refreshBtn.disabled = true;
          refreshBtn.classList.add("is-refreshing");
          refreshBtn.setAttribute("aria-label", "Refreshing data");
          refreshBtn.innerHTML = '<span class="header-btn-icon refresh-symbol" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M20 11a8 8 0 0 0-14.7-4L3 10m0 0V5m0 5h5M4 13a8 8 0 0 0 14.7 4L21 14m0 0v5m0-5h-5"/></svg></span><span class="header-btn-label">Refreshing...</span>';
        }

        await ensureAdminApiBase();

        const statsOk = await loadStats();
        const reportsOk = await loadReports();
        const broadcastOk = await loadBroadcastOverview();
        let activeTabOk = true;
        if (adminActiveTab === "users") activeTabOk = await loadUsers();
        if (adminActiveTab === "groups") activeTabOk = await loadGroups();
        if (adminActiveTab === "reports") activeTabOk = reportsOk;
        if (adminActiveTab === "broadcast") activeTabOk = broadcastOk;
        if (adminActiveTab === "monetization") activeTabOk = await loadMonetizationRequests();
        if (adminActiveTab === "password-resets") activeTabOk = await loadPasswordResetRequests();

        if (statsOk && reportsOk && activeTabOk) {
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
          refreshBtn.classList.remove("is-refreshing");
          refreshBtn.setAttribute("aria-label", "Refresh dashboard data");
          refreshBtn.innerHTML = originalMarkup;
        }
      }

      let adminLiveRefreshTimer = null;
      let adminLiveRefreshInFlight = null;

      async function refreshAdminLiveData() {
        if (!adminKey || adminLiveRefreshInFlight) return;
        adminLiveRefreshInFlight = (async () => {
          await ensureAdminApiBase();
          await loadStats();
          await loadBroadcastOverview();
          if (adminActiveTab === "users") await loadUsers();
          if (adminActiveTab === "monetization") await loadMonetizationRequests();
          if (adminActiveTab === "groups") await loadGroups();
          if (adminActiveTab === "reports") await loadReports();
          if (adminActiveTab === "questions") await loadQuestions();
          if (adminActiveTab === "password-resets") await loadPasswordResetRequests();
        })().catch((error) => {
          console.warn("Admin live refresh failed:", error);
        }).finally(() => {
          adminLiveRefreshInFlight = null;
        });
        return adminLiveRefreshInFlight;
      }

      function startAdminLiveRefresh() {
        if (adminLiveRefreshTimer) window.clearInterval(adminLiveRefreshTimer);
        adminLiveRefreshTimer = null;
        if (!adminKey) return;
        adminLiveRefreshTimer = window.setInterval(() => {
          if (document.visibilityState === "visible") void refreshAdminLiveData();
        }, 30_000);
      }

      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible" && adminKey) void refreshAdminLiveData();
      });

      function getAnalyticsPeriodData(period = selectedAnalyticsPeriod) {
        const analytics = cachedAdminStats?.activityAnalytics || null;
        return analytics?.periods?.[period] || analytics?.periods?.week || null;
      }

      function formatAnalyticsDuration(minutes = 0) {
        const value = Math.max(0, Number(minutes) || 0);
        if (value < 1) return `${value.toFixed(1)}m`;
        if (value < 60) return `${Math.round(value * 10) / 10}m`;
        const hours = Math.floor(value / 60);
        const remaining = Math.round((value - hours * 60) * 10) / 10;
        return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
      }

      function buildAnalyticsChartSvg({
        labels = [],
        primary = [],
        secondary = [],
        primaryLabel = "Series A",
        secondaryLabel = "Series B",
        primaryColor = "#0f3f7f",
        secondaryColor = "#0f766e",
      } = {}) {
        const width = 980;
        const height = 260;
        const paddingX = 36;
        const paddingTop = 18;
        const paddingBottom = 42;
        const chartHeight = height - paddingTop - paddingBottom;
        const values = [...primary, ...secondary].map((value) => Math.max(0, Number(value) || 0));
        const maxValue = Math.max(1, ...values);
        if (!labels.length) {
          return '<div class="analytics-empty">No activity data yet.</div>';
        }

        const xStep = labels.length > 1 ? (width - paddingX * 2) / (labels.length - 1) : 0;
        const yFor = (value) => paddingTop + chartHeight - ((Math.max(0, Number(value) || 0) / maxValue) * chartHeight);
        const buildPath = (series = []) =>
          series
            .map((value, index) => `${index === 0 ? "M" : "L"}${(paddingX + index * xStep).toFixed(1)},${yFor(value).toFixed(1)}`)
            .join(" ");
        const primaryPath = buildPath(primary);
        const secondaryPath = buildPath(secondary);
        const baselineY = paddingTop + chartHeight;
        const tickStep = Math.max(1, Math.ceil(labels.length / 6));
        const ticks = labels
          .map((label, index) => {
            if (index !== 0 && index !== labels.length - 1 && index % tickStep !== 0) return "";
            const x = paddingX + index * xStep;
            return `
              <text x="${x.toFixed(1)}" y="${height - 12}" text-anchor="middle" fill="#64748b" font-size="11" font-weight="700">${escapeHtml(label)}</text>
            `;
          })
          .join("");

        return `
          <svg viewBox="0 0 ${width} ${height}" class="analytics-chart-svg" role="img" aria-label="${escapeHtml(primaryLabel)} and ${escapeHtml(secondaryLabel)} chart">
            ${[0, 0.25, 0.5, 0.75, 1]
              .map((ratio) => {
                const y = paddingTop + chartHeight - chartHeight * ratio;
                const label = `${Math.round(maxValue * ratio)}`;
                return `
                  <line x1="${paddingX}" y1="${y.toFixed(1)}" x2="${width - paddingX}" y2="${y.toFixed(1)}" stroke="#e2e8f0" stroke-width="1" />
                  <text x="10" y="${(y + 4).toFixed(1)}" fill="#94a3b8" font-size="11" font-weight="700">${escapeHtml(label)}</text>
                `;
              })
              .join("")}
            <line x1="${paddingX}" y1="${baselineY}" x2="${width - paddingX}" y2="${baselineY}" stroke="#cbd5e1" stroke-width="1.4" />
            <path d="${primaryPath}" fill="none" stroke="${primaryColor}" stroke-width="3.75" stroke-linecap="round" stroke-linejoin="round" />
            <path d="${secondaryPath}" fill="none" stroke="${secondaryColor}" stroke-width="3.75" stroke-linecap="round" stroke-linejoin="round" />
            ${primary.map((value, index) => {
              const cx = paddingX + index * xStep;
              const cy = yFor(value);
              return `
                <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="6" fill="#ffffff" opacity="0.9" />
                <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="4.25" fill="#ffffff" stroke="${primaryColor}" stroke-width="2.6" vector-effect="non-scaling-stroke" />
              `;
            }).join("")}
            ${secondary.map((value, index) => {
              const cx = paddingX + index * xStep;
              const cy = yFor(value);
              return `
                <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="6" fill="#ffffff" opacity="0.9" />
                <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="4.25" fill="#ffffff" stroke="${secondaryColor}" stroke-width="2.6" vector-effect="non-scaling-stroke" />
              `;
            }).join("")}
            ${ticks}
            <text x="${width - paddingX}" y="${paddingTop + 12}" text-anchor="end" fill="${primaryColor}" font-size="11" font-weight="800">${escapeHtml(primaryLabel)}</text>
            <text x="${width - paddingX}" y="${paddingTop + 28}" text-anchor="end" fill="${secondaryColor}" font-size="11" font-weight="800">${escapeHtml(secondaryLabel)}</text>
          </svg>
        `;
      }

      function renderAdminAnalyticsPanel() {
        const analytics = cachedAdminStats?.activityAnalytics || null;
        const period = selectedAnalyticsPeriod || "week";
        const periodData = getAnalyticsPeriodData(period);

        document.querySelectorAll("[data-analytics-period]").forEach((button) => {
          button.classList.toggle("active", button.dataset.analyticsPeriod === period);
        });

        const summary = periodData?.summary || {};
        const series = Array.isArray(periodData?.series) ? periodData.series : [];
        const labels = series.map((row) => String(row?.label || "").trim());
        const signups = series.map((row) => Number(row?.signups) || 0);
        const sessions = series.map((row) => Number(row?.sessions) || 0);
        const resets = series.map((row) => Number(row?.resets) || 0);
        const subscriptions = series.map((row) => Number(row?.subscriptions) || 0);

        const setText = (id, value) => {
          const el = document.getElementById(id);
          if (el) el.textContent = String(value);
        };

        setText("analytics-new-users", summary.signups ?? 0);
        setText("analytics-active-users", summary.activeUsers ?? 0);
        setText("analytics-sessions", summary.sessions ?? 0);
        setText("analytics-avg-time", formatAnalyticsDuration(summary.avgSessionMinutes ?? 0));
        setText("analytics-resets", summary.resets ?? 0);
        setText("analytics-subscriptions", summary.subscriptions ?? 0);

        const periodLabel = document.getElementById("analytics-period-label");
        if (periodLabel) periodLabel.textContent = periodData?.label || "Last 7 days";

        const activityNote = document.getElementById("analytics-activity-note");
        if (activityNote) {
          activityNote.textContent = `${String(analytics?.overall?.totalUsers ?? 0)} total users tracked`;
        }

        const mainChart = document.getElementById("analytics-main-chart");
        if (mainChart) {
          mainChart.innerHTML = buildAnalyticsChartSvg({
            labels,
            primary: signups,
            secondary: sessions,
            primaryLabel: "New users",
            secondaryLabel: "Sessions",
            primaryColor: "#0f3f7f",
            secondaryColor: "#0f766e",
          });
        }

        const secondaryChart = document.getElementById("analytics-secondary-chart");
        if (secondaryChart) {
          secondaryChart.innerHTML = buildAnalyticsChartSvg({
            labels,
            primary: resets,
            secondary: subscriptions,
            primaryLabel: "Reset requests",
            secondaryLabel: "Subscription requests",
            primaryColor: "#b45309",
            secondaryColor: "#7c3aed",
          });
        }

        const feed = Array.isArray(analytics?.recentActivity) ? analytics.recentActivity : [];
        const feedEl = document.getElementById("analytics-feed");
        const feedCountEl = document.getElementById("analytics-feed-count");
        if (feedCountEl) {
          feedCountEl.textContent = `${feed.length} recent items`;
        }
        if (feedEl) {
          if (feed.length === 0) {
            feedEl.innerHTML = '<div class="analytics-empty">No recent activity yet.</div>';
          } else {
            feedEl.innerHTML = feed
              .map((entry) => {
                const type = String(entry?.type || "activity").trim();
                const title = escapeHtml(String(entry?.title || "Activity").trim());
                const subtitle = escapeHtml(String(entry?.subtitle || "").trim());
                const time = escapeHtml(formatDate(entry?.at));
                const typeLabel = escapeHtml(type.replace(/_/g, " "));
                return `
                  <div class="analytics-feed-item">
                    <div class="analytics-feed-type">${typeLabel}</div>
                    <div>
                      <div class="analytics-feed-title">${title}</div>
                      <div class="analytics-feed-subtitle">${subtitle || "&nbsp;"}</div>
                    </div>
                    <div class="analytics-feed-time">${time}</div>
                  </div>
                `;
              })
              .join("");
          }
        }
      }

      async function loadStats() {
        try {
          const res = await fetchAdmin(withNoCache(`${API_BASE}/admin/stats`), {
            headers: getHeaders(),
            cache: "no-store",
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || `Failed to load stats (${res.status})`);
          }
          const data = await res.json();
          cachedAdminStats = data;

          const exportUsers = document.getElementById("export-users");
          if (exportUsers) exportUsers.textContent = String(data.totalUsers ?? 0);
          const exportQuestions = document.getElementById("export-questions");
          if (exportQuestions) exportQuestions.textContent = String(data.totalQuestions ?? 0);
          const exportAttempts = document.getElementById("export-attempts");
          if (exportAttempts) exportAttempts.textContent = String(data.totalAttempts ?? 0);
          const exportSync = document.getElementById("export-sync");
          if (exportSync) exportSync.textContent = String(data.totalSyncEvents ?? 0);

          const statUsers = document.getElementById("stat-users");
          if (statUsers) statUsers.textContent = String(data.totalUsers ?? 0);
          const statQuestions = document.getElementById("stat-questions");
          if (statQuestions) statQuestions.textContent = String(data.totalQuestions ?? 0);
          const statAttempts = document.getElementById("stat-attempts");
          if (statAttempts) statAttempts.textContent = String(data.totalAttempts ?? 0);
          const statCategories = document.getElementById("stat-categories");
          if (statCategories) statCategories.textContent = String(data.totalCategories ?? 0);
          const statAvgScore = document.getElementById("stat-avg-score");
          if (statAvgScore) statAvgScore.textContent = String(data.averageScore ?? 0) + "%";
          const statSyncEvents = document.getElementById("stat-sync-events");
          if (statSyncEvents) statSyncEvents.textContent = String(data.totalSyncEvents ?? 0);
          const statGroups = document.getElementById("stat-groups");
          if (statGroups) {
            statGroups.textContent = String(data.totalGroups ?? 0);
          }
          const statReports = document.getElementById("stat-reports");
          if (statReports) {
            statReports.textContent = String(data.totalReports ?? 0);
          }
          const reportsTabBadge = document.getElementById("reports-tab-badge");
          if (reportsTabBadge) {
            syncReportsTabDot();
          }

          const monetizationCounts = data.subscriptionCounts || {};
          const monetizationRequestCount = document.getElementById("monetization-request-count");
          if (monetizationRequestCount) {
            monetizationRequestCount.textContent = String(monetizationCounts.request ?? 0);
          }
          const monetizationActivatedCount = document.getElementById("monetization-activated-count");
          if (monetizationActivatedCount) {
            monetizationActivatedCount.textContent = String(monetizationCounts.activated ?? 0);
          }
          const monetizationRejectedCount = document.getElementById("monetization-rejected-count");
          if (monetizationRejectedCount) {
            monetizationRejectedCount.textContent = String(monetizationCounts.rejected ?? 0);
          }
          const monetizationExpiredCount = document.getElementById("monetization-expired-count");
          if (monetizationExpiredCount) {
            monetizationExpiredCount.textContent = String(monetizationCounts.expired ?? 0);
          }
          const monetizationDot = document.getElementById("monetization-tab-dot");
          if (monetizationDot) {
            monetizationDot.classList.toggle("hidden", Number(monetizationCounts.request ?? 0) <= 0);
          }
          const passwordResetDot = document.getElementById("password-reset-tab-badge");
          if (passwordResetDot) {
            passwordResetDot.classList.toggle("hidden", Number(data.passwordResetCounts?.pending ?? 0) <= 0);
          }

          const catPerf = document.getElementById("category-performance");
          if (!catPerf) {
            renderAdminAnalyticsPanel();
            return true;
          }
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
              const div = document.createElement("div");
              div.className = "category-performance-card";
              div.innerHTML = `
                            <div class="category-performance-row">
                                <strong class="category-performance-name">${safeCategory}</strong>
                                <span class="category-performance-score">${scoreText}</span>
                            </div>
                            <div class="category-performance-track" aria-hidden="true">
                                <div class="category-performance-fill" style="width: ${safePercent}%"></div>
                            </div>
                        `;
              catPerf.appendChild(div);
            });
          }

          renderAdminAnalyticsPanel();
          return true;
        } catch (err) {
          console.error("Failed to load stats:", err);
          showAlert("stats-alerts", "Failed to load statistics", "error");
          return false;
        }
      }

      async function loadUsers() {
        try {
          const res = await fetchAdmin(withNoCache(`${API_BASE}/admin/users`), {
            headers: getHeaders(),
            cache: "no-store",
          });
          const data = await res.json();
          if (!res.ok || !Array.isArray(data.users)) {
            throw new Error(data.error || "Failed to load users");
          }

          cachedUsers = data.users;
          usersLoaded = true;
          renderUsersTable();
          return true;
        } catch (err) {
          console.error("Failed to load users:", err);
          showAlert("users-alerts", "Failed to load users", "error");
          return false;
        }
      }

      async function loadDeletedUsers() {
        try {
          const res = await fetch(withNoCache(`${API_BASE}/admin/deleted-users`), {
            headers: getHeaders(),
            cache: "no-store",
          });
          const data = await res.json();
          if (!res.ok || !Array.isArray(data.deletedUsers)) {
            throw new Error(data.error || "Failed to load archived users");
          }

          cachedDeletedUsers = data.deletedUsers;
          deletedUsersLoaded = true;
          renderDeletedUsersTable();
          return true;
        } catch (err) {
          console.error("Failed to load archived users:", err);
          showAlert("deleted-users-alerts", "Failed to load archived accounts", "error");
          return false;
        }
      }

      async function loadDeletedGroups() {
        try {
          const res = await fetch(withNoCache(`${API_BASE}/admin/deleted-groups`), {
            headers: getHeaders(),
            cache: "no-store",
          });
          const data = await res.json();
          if (!res.ok || !Array.isArray(data.deletedGroups)) {
            throw new Error(data.error || "Failed to load archived groups");
          }

          cachedDeletedGroups = data.deletedGroups;
          deletedGroupsLoaded = true;
          renderDeletedGroupsTable();
          return true;
        } catch (err) {
          console.error("Failed to load archived groups:", err);
          showAlert("deleted-groups-alerts", "Failed to load archived groups", "error");
          return false;
        }
      }

      async function loadGroups() {
        try {
          const res = await fetch(withNoCache(`${API_BASE}/admin/groups`), {
            headers: getHeaders(),
            cache: "no-store",
          });
          const data = await res.json();
          if (!res.ok || !Array.isArray(data.groups)) {
            throw new Error(data.error || "Failed to load groups");
          }

          cachedGroups = data.groups;
          groupsLoaded = true;
          renderGroupsTable();
          return true;
        } catch (err) {
          console.error("Failed to load groups:", err);
          showAlert("groups-alerts", "Failed to load groups", "error");
          return false;
        }
      }

      async function loadReports() {
        try {
          const res = await fetch(withNoCache(`${API_BASE}/admin/reports`), {
            headers: getHeaders(),
            cache: "no-store",
          });
          const data = await res.json();
          if (!res.ok || !Array.isArray(data.reports)) {
            throw new Error(data.error || "Failed to load reports");
          }

          cachedReports = data.reports;
          reportsLoaded = true;
          syncReportsTabDot();
          renderReportsTable();
          return true;
        } catch (err) {
          console.error("Failed to load reports:", err);
          showAlert("reports-alerts", "Failed to load reports", "error");
          return false;
        }
      }

      function syncReportsTabDot() {
        const reportsDot = document.getElementById("reports-tab-badge");
        if (!reportsDot) return;
        const hasUnwarnedReports = cachedReports.some((report) => String(report?.status || "").trim().toLowerCase() !== "warned");
        reportsDot.classList.toggle("hidden", !hasUnwarnedReports);
      }

      async function loadQuestions() {
        try {
          const res = await fetch(withNoCache(`${API_BASE}/admin/questions`), {
            headers: getHeaders(),
            cache: "no-store",
          });
          const data = await res.json();
          if (!res.ok || !Array.isArray(data.questions)) {
            throw new Error(data.error || "Failed to load questions");
          }
          const sortedQuestions = [...data.questions].sort((a, b) => {
            const aOrder = questionOrderValue(a);
            const bOrder = questionOrderValue(b);
            if (aOrder !== bOrder) return aOrder - bOrder;
            return (Number(a?.id) || 0) - (Number(b?.id) || 0);
          });
          cachedQuestions = sortedQuestions;
          renderQuestionsTable();
          return true;
        } catch (err) {
          console.error("Failed to load questions:", err);
          showAlert("questions-alerts", "Failed to load questions", "error");
          return false;
        }
      }

      function renderQuestionsTable() {
        const tbody = document.getElementById("questions-table");
        if (!tbody) return;

        const query = String(questionSearchQuery || "").trim();
        const filteredQuestions = cachedQuestions.filter((question) =>
          matchesQuestionSearch(question, query),
        );

        tbody.innerHTML = "";

        if (!cachedQuestions.length) {
          tbody.innerHTML =
            '<tr><td colspan="5" style="text-align: center; color: #ccc;">No questions yet</td></tr>';
          return;
        }

        if (!filteredQuestions.length) {
          tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #ccc;">${
            query ? "No questions match this search" : "No questions yet"
          }</td></tr>`;
          return;
        }

        filteredQuestions.forEach((q) => {
          const tr = document.createElement("tr");
          const { index: correctIndex, text: correctText } = getCorrectDisplay(q);
          const safeId = escapeHtml(q.id);
          const fullText = String(q.text || "").trim();
          const safeText = escapeHtml(fullText);
          const safePreview = escapeHtml(buildQuestionPreview(fullText));
          const safeCategory = escapeHtml(displayValue(q.category));
          const safeTopic = escapeHtml(q.topicSlug || "");
          const safeSection = escapeHtml(q.sectionId || "");
          const safeCorrectText = escapeHtml(correctText);
          const safeOrder = questionOrderValue(q);
          const safeCorrectIndex =
            Number.isInteger(correctIndex) ? String(correctIndex) : null;
          tr.innerHTML = `
                      <td class="question-id-cell">${safeOrder || safeId}</td>
                      <td class="cell-wrap question-text-cell" title="${safeText}">
                        <div class="question-preview">${safePreview}</div>
                      </td>
                      <td class="question-category-cell">
                        <span class="category-chip">${safeCategory}</span>
                        ${safeTopic ? `<div style="font-size:12px;color:#64748b;margin-top:6px;">topic: ${safeTopic}${safeSection ? `#${safeSection}` : ""}</div>` : ""}
                      </td>
                      <td class="cell-wrap question-correct-cell">${safeCorrectIndex !== null ? `${safeCorrectIndex}. ${safeCorrectText}` : safeCorrectText}</td>
                      <td class="question-actions-cell">
                          <div class="actions">
                              <button class="btn-small" data-action="edit-question" data-question-id="${safeId}">Edit</button>
                              <button class="btn-small danger" data-action="delete-question" data-question-id="${safeId}">Delete</button>
                          </div>
                      </td>
                  `;
          tbody.appendChild(tr);
        });
      }

      async function loadExportData() {
        try {
          const data = cachedAdminStats || await (async () => {
            const res = await fetchAdmin(withNoCache(`${API_BASE}/admin/stats`), {
              headers: getHeaders(),
              cache: "no-store",
            });
            if (!res.ok) {
              const errorData = await res.json().catch(() => ({}));
              throw new Error(errorData.error || `Failed to load export stats (${res.status})`);
            }
            return res.json();
          })();

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

      function closeDeleteUserConfirmModal() {
        pendingDeleteUserId = null;
        document.getElementById("delete-user-confirm-modal")?.classList.remove("active");
      }

      function closeUserDetailsModal() {
        selectedUserId = null;
        const messageEl = document.getElementById("user-message-body");
        if (messageEl) messageEl.value = "";
        document.getElementById("user-details-modal")?.classList.remove("active");
        closeDeleteUserConfirmModal();
      }

      async function openAdminProfileChat(threadKey = "", label = "This profile", prefillMessage = "", warningReportId = "") {
        const safeThreadKey = String(threadKey || "").trim();
        if (!safeThreadKey) return;
        pendingBroadcastComposerMessage = String(prefillMessage || "").trim();
        pendingBroadcastWarningReportId = String(warningReportId || "").trim();
        closeUserDetailsModal();
        closeGroupDetailsModal();
        switchTab("broadcast");
        const loaded = await loadBroadcastOverview();
        if (!loaded) return;
        if (!getBroadcastThreadSummary(safeThreadKey)) {
          const isGroup = safeThreadKey.startsWith("notice:group:");
          const syntheticThread = {
            threadKey: safeThreadKey,
            title: String(label || (isGroup ? "Group" : "User")).trim(),
            subtitle: `${isGroup ? "Group" : "User"}: ${String(label || "").trim()}`,
            originType: isGroup ? "group" : "user",
            originId: safeThreadKey.split(":").slice(2).join(":"),
            originName: String(label || "").trim(),
            latestAt: "",
            recipientCount: 1,
            batchCount: 0,
            previewText: "No messages yet — start the conversation",
            unreadMessageCount: 0,
            hasUnreadMessages: false,
            lastMessage: null,
            batches: [],
          };
          cachedBroadcastThreads = [syntheticThread, ...cachedBroadcastThreads];
          cachedBroadcastThreadDetail.set(safeThreadKey, { thread: syntheticThread, batches: [] });
          renderBroadcastOverview();
        }
        await openBroadcastThread(safeThreadKey);
        const messageEl = document.getElementById("broadcast-chat-message");
        if (messageEl && pendingBroadcastComposerMessage) {
          messageEl.value = pendingBroadcastComposerMessage;
          pendingBroadcastComposerMessage = "";
          autoSizeBroadcastChatMessage();
          messageEl.focus();
        }
      }

      function closeDeletedUsersModal() {
        document.getElementById("deleted-users-modal")?.classList.remove("active");
      }

      async function openDeletedUsersModal() {
        if (!deletedUsersLoaded) {
          await loadDeletedUsers();
        } else {
          renderDeletedUsersTable();
        }
        document.getElementById("deleted-users-modal")?.classList.add("active");
        document.getElementById("deleted-users-search")?.focus();
      }

      function closeDeletedGroupsModal() {
        document.getElementById("deleted-groups-modal")?.classList.remove("active");
      }

      async function openDeletedGroupsModal() {
        if (!deletedGroupsLoaded) {
          await loadDeletedGroups();
        } else {
          renderDeletedGroupsTable();
        }
        document.getElementById("deleted-groups-modal")?.classList.add("active");
        document.getElementById("deleted-groups-search")?.focus();
      }

      async function restoreArchivedGroup(archiveId) {
        try {
          if (!confirm("Restore this archived group?")) {
            return;
          }
          const safeArchiveId = encodeURIComponent(archiveId);
          const res = await fetch(`${API_BASE}/admin/deleted-groups/${safeArchiveId}/restore`, {
            method: "POST",
            headers: getHeaders(),
          });

          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(data.error || "Failed to restore archived group");
          }

          showAlert("deleted-groups-alerts", "Archived group restored successfully", "success");
          await Promise.all([loadGroups(), loadDeletedGroups(), loadStats(), loadExportData()]);
        } catch (err) {
          showAlert("deleted-groups-alerts", "Error: " + err.message, "error");
        }
      }

      function closeGroupDetailsModal() {
        selectedGroupId = null;
        const messageEl = document.getElementById("group-message-body");
        if (messageEl) messageEl.value = "";
        document.getElementById("group-details-modal")?.classList.remove("active");
      }

      async function openGroupDetailsModal(groupId) {
        const safeGroupId = String(groupId || "").trim();
        if (!safeGroupId) return;
        try {
          if (!reportsLoaded) await loadReports();
          const res = await fetch(withNoCache(`${API_BASE}/admin/groups/${encodeURIComponent(safeGroupId)}`), {
            headers: getHeaders(),
            cache: "no-store",
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data?.group) {
            throw new Error(data.error || "Group details could not be loaded");
          }
          selectedGroupId = safeGroupId;
          document.getElementById("group-details-body").innerHTML = buildGroupDetailsHtml(data.group);
          const messageEl = document.getElementById("group-message-body");
          if (messageEl) messageEl.value = "";
          document.getElementById("group-details-modal")?.classList.add("active");
        } catch (err) {
          showAlert("groups-alerts", "Failed to load group details: " + err.message, "error");
        }
      }

      async function archiveGroup(groupId) {
        try {
          if (!confirm("Archive this group? This will move it into the deleted groups archive.")) {
            return;
          }
          const safeGroupId = encodeURIComponent(groupId);
          const res = await fetch(`${API_BASE}/admin/groups/${safeGroupId}`, {
            method: "DELETE",
            headers: getHeaders(),
          });

          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(data.error || "Failed to archive group");
          }

          closeGroupDetailsModal();
          showAlert("groups-alerts", "Group archived successfully", "success");
          await Promise.all([loadGroups(), loadDeletedGroups(), loadStats(), loadExportData()]);
        } catch (err) {
          showAlert("groups-alerts", "Error: " + err.message, "error");
        }
      }

      function closeReportDetailsModal() {
        selectedReportId = null;
        selectedReportSnapshot = null;
        selectedReportWarningDraft = "";
        document.getElementById("report-details-modal")?.classList.remove("active");
      }

      function syncReportWarningMessagePreset() {
        const presetEl = document.getElementById("report-warning-preset");
        const messageEl = document.getElementById("report-warning-message");
        if (!presetEl || !messageEl) return;
        const preset = normalizeReportWarningTitle(presetEl.value || "");
        if (!selectedReportSnapshot) return;
        const currentMessage = String(messageEl.value || "").trim();
        const shouldRefreshDraft =
          !selectedReportSnapshot.warningMessage ||
          !currentMessage ||
          currentMessage === selectedReportWarningDraft;
        if (!selectedReportSnapshot.warningMessage && shouldRefreshDraft) {
          selectedReportWarningDraft = buildReportWarningBody(selectedReportSnapshot, preset);
          messageEl.value = selectedReportWarningDraft;
        }
        messageEl.placeholder = "The full warning message will be sent to the recipient inbox";
      }

      async function setAdminReportStatus(reportId, status, warningIssuedAt = "") {
        const res = await fetch(`${API_BASE}/admin/reports/${encodeURIComponent(reportId)}/status`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ status, warningIssuedAt }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.report) throw new Error(data.error || "Failed to update report status");
        cachedReports = cachedReports.map((entry) => String(entry?.id || "") === String(reportId) ? { ...entry, ...data.report } : entry);
        syncReportsTabDot();
        return data.report;
      }

      async function openReportDetailsModal(reportId) {
        const safeReportId = String(reportId || "").trim();
        if (!safeReportId) return;
        try {
          const res = await fetch(withNoCache(`${API_BASE}/admin/reports/${encodeURIComponent(safeReportId)}`), {
            headers: getHeaders(),
            cache: "no-store",
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data?.report) {
            throw new Error(data.error || "Report details could not be loaded");
          }
          selectedReportId = safeReportId;
           let report = data.report;
           if (String(report.status || "").toLowerCase() !== "warned") {
             try {
               const statusReport = await setAdminReportStatus(safeReportId, "opened");
               // The status endpoint returns the stored report without the
               // expanded upload URLs. Keep the full evidence from the detail
               // response so media remains viewable after marking it opened.
               report = { ...report, ...statusReport, evidence: report.evidence };
             } catch (statusError) {
               console.warn("Could not mark report as opened:", statusError);
             }
           }
          selectedReportSnapshot = report;
          document.getElementById("report-details-body").innerHTML = buildReportDetailsHtml(report);
          document.getElementById("report-details-modal")?.classList.add("active");
        } catch (err) {
          showAlert("reports-alerts", "Failed to load report details: " + err.message, "error");
        }
      }

      async function warnSelectedReport() {
        const report = selectedReportSnapshot || {};
        const targetId = String(report?.target?.id || report?.target?.userId || report?.targetId || "").trim();
        if (!targetId) {
          showAlert("reports-alerts", "This report has no target user to warn", "error");
          return;
        }
        const message = buildReportWarningBody(report, "Community rules reminder");
        const targetName = displayValue(report?.target?.name || report?.targetName || "User");
        const reportId = String(selectedReportId || "").trim();
        closeReportDetailsModal();
        await openAdminProfileChat(`notice:user:${targetId}`, targetName, message, reportId);
      }

      async function suspendSelectedReportUser() {
        const report = selectedReportSnapshot || {};
        const targetId = String(report?.target?.id || report?.target?.userId || report?.targetId || "").trim();
        if (!targetId) {
          showAlert("reports-alerts", "This report has no target user to suspend", "error");
          return;
        }
        const targetName = displayValue(report?.target?.name || report?.targetName || "this user");
        if (!confirm(`Archive ${targetName}'s account?`)) return;
        try {
          const res = await fetch(`${API_BASE}/admin/users/${encodeURIComponent(targetId)}`, {
            method: "DELETE",
            headers: getHeaders(),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error || "Failed to archive user account");
          closeReportDetailsModal();
          showAlert("reports-alerts", "User account archived", "success");
          await Promise.all([loadUsers(), loadReports(), loadDeletedUsers(), loadStats(), loadExportData()]);
        } catch (err) {
          showAlert("reports-alerts", "Error: " + err.message, "error");
        }
      }

      async function sendAdminUserMessage(userId) {
        const safeUserId = String(userId || "").trim();
        const messageEl = document.getElementById("user-message-body");
        const message = String(messageEl?.value || "").trim();
        if (!safeUserId) {
          showAlert("users-alerts", "Choose a user first", "error");
          return;
        }
        if (!message) {
          showAlert("users-alerts", "Write a message first", "error");
          return;
        }
        try {
          const res = await fetch(`${API_BASE}/admin/users/${encodeURIComponent(safeUserId)}/message`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ message }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(data.error || "Failed to send message");
          }
          if (messageEl) messageEl.value = "";
          showAlert("users-alerts", "Message sent successfully", "success");
        } catch (err) {
          showAlert("users-alerts", "Error: " + err.message, "error");
        }
      }

      async function sendAdminGroupMessage(groupId) {
        const safeGroupId = String(groupId || "").trim();
        const messageEl = document.getElementById("group-message-body");
        const message = String(messageEl?.value || "").trim();
        if (!safeGroupId) {
          showAlert("groups-alerts", "Choose a group first", "error");
          return;
        }
        if (!message) {
          showAlert("groups-alerts", "Write a message first", "error");
          return;
        }
        try {
          const res = await fetch(`${API_BASE}/admin/groups/${encodeURIComponent(safeGroupId)}/message`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ message }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(data.error || "Failed to send message");
          }
          if (messageEl) messageEl.value = "";
          showAlert("groups-alerts", "Message sent successfully", "success");
        } catch (err) {
          showAlert("groups-alerts", "Error: " + err.message, "error");
        }
      }

      function formatBroadcastDateTime(value) {
        if (!value) return "--";
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return "--";
        const day = String(parsed.getDate()).padStart(2, "0");
        const month = String(parsed.getMonth() + 1).padStart(2, "0");
        const year = String(parsed.getFullYear()).slice(-2);
        const time = parsed.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
        return `${day}/${month}/${year}, ${time}`;
      }

      function formatBroadcastTime(value) {
        if (!value) return "--";
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return "--";
        return parsed.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        });
      }

      function formatBroadcastDateLabel(value) {
        if (!value) return "";
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return "";
        const day = String(parsed.getDate()).padStart(2, "0");
        const month = String(parsed.getMonth() + 1).padStart(2, "0");
        const year = String(parsed.getFullYear()).slice(-2);
        return `${day}/${month}/${year}`;
      }

      function isSameBroadcastCalendarDay(left = "", right = "") {
        const leftDate = new Date(left);
        const rightDate = new Date(right);
        if (Number.isNaN(leftDate.getTime()) || Number.isNaN(rightDate.getTime())) return false;
        return leftDate.toDateString() === rightDate.toDateString();
      }

      function getBroadcastThreadSummary(threadKey = "") {
        return cachedBroadcastThreads.find((entry) => entry.threadKey === threadKey) || null;
      }

      function getBroadcastThreadDetail(threadKey = "") {
        return cachedBroadcastThreadDetail.get(threadKey) || null;
      }

      function clearBroadcastReplyDraft() {
        broadcastReplyDraft = null;
        const previewEl = document.getElementById("broadcast-chat-reply-preview");
        if (previewEl) {
          previewEl.innerHTML = "";
          previewEl.classList.add("hidden");
        }
      }

      function setBroadcastReplyDraft(batch = {}) {
        const conversationId = String(
          batch.representativeConversationId ||
          (Array.isArray(batch.conversationIds) ? batch.conversationIds.find((id) => id && id !== "__admin_broadcast__") : "") ||
          (Array.isArray(batch.conversationIds) ? batch.conversationIds.find(Boolean) : "") ||
          "__admin_broadcast__",
        ).trim();
        const sourceId = String(batch.id || "").trim();
        if (!sourceId || String(batch.senderUserId || "") === "__admin_notice__") return;
        broadcastReplyDraft = {
          type: "message",
          sourceId,
          conversationId,
          senderUserId: String(batch.senderUserId || "").trim(),
          senderName: String(batch.senderName || "User").trim() || "User",
          text: String(batch.text || "").trim(),
        };
        const previewEl = document.getElementById("broadcast-chat-reply-preview");
        if (previewEl) {
          previewEl.innerHTML = `
            <div class="broadcast-chat-reply-copy">
              <strong>Replying to ${escapeHtml(broadcastReplyDraft.senderName)}</strong>
              <span>${escapeHtml(broadcastReplyDraft.text || "Attachment")}</span>
            </div>
            <button type="button" class="broadcast-chat-reply-clear" id="broadcast-chat-reply-clear-btn" aria-label="Cancel reply" title="Cancel reply">×</button>
          `;
          previewEl.classList.remove("hidden");
          document.getElementById("broadcast-chat-reply-clear-btn")?.addEventListener("click", clearBroadcastReplyDraft);
        }
        document.getElementById("broadcast-chat-message")?.focus();
      }

      function getBroadcastReplyableBatch(target) {
        const messageId = String(target?.dataset?.broadcastMessageId || "").trim();
        if (!messageId) return null;
        const detail = getBroadcastThreadDetail(getActiveBroadcastThreadKey());
        return detail?.batches?.find((batch) => String(batch.id || "") === messageId) || null;
      }

      function finishBroadcastMessageGesture(event) {
        const gesture = broadcastMessageGesture;
        broadcastMessageGesture = null;
        if (!gesture) return;
        const row = gesture.rowEl;
        if (row instanceof HTMLElement) {
          row.classList.remove("is-swipe-dragging");
          row.style.removeProperty("transform");
        }
        const deltaX = (event?.clientX ?? gesture.startX) - gesture.startX;
        const deltaY = (event?.clientY ?? gesture.startY) - gesture.startY;
        if (deltaX < 42 || Math.abs(deltaY) > Math.abs(deltaX) * 1.25) return;
        const batch = getBroadcastReplyableBatch(row);
        if (batch) setBroadcastReplyDraft(batch);
      }

      function getActiveBroadcastThreadKey() {
        if (selectedBroadcastThreadKey && getBroadcastThreadSummary(selectedBroadcastThreadKey)) {
          return selectedBroadcastThreadKey;
        }
        return "";
      }

      function getBroadcastUnreadMessageCount() {
        return (Array.isArray(cachedBroadcastThreads) ? cachedBroadcastThreads : []).reduce(
          (total, thread) => total + (Number(thread?.unreadMessageCount) || 0),
          0,
        );
      }

      function getBroadcastThreadDotTone(threadKey = "") {
        const tones = ["teal", "amber", "violet", "rose", "blue"];
        const value = String(threadKey || "broadcast");
        let hash = 0;
        for (let index = 0; index < value.length; index += 1) {
          hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
        }
        return tones[hash % tones.length];
      }

      function syncBroadcastTabUnreadDot() {
        const dot = document.getElementById("broadcast-tab-dot");
        if (!dot) return;
        const unreadCount = getBroadcastUnreadMessageCount();
        dot.classList.toggle("hidden", unreadCount <= 0);
        dot.title = unreadCount > 0 ? `${unreadCount} unread user message${unreadCount === 1 ? "" : "s"}` : "";
      }

      function syncBroadcastThreadUi() {
        const mainEl = document.getElementById("broadcast-main");
        const listPanelEl = document.querySelector(".broadcast-thread-list-panel");
        const panelEl = document.getElementById("broadcast-thread-panel");
        const hasSelectedThread = Boolean(selectedBroadcastThreadKey && getBroadcastThreadSummary(selectedBroadcastThreadKey));
        const isDesktop = window.matchMedia("(min-width: 769px)").matches;
        const shouldShowThreadPanel = isDesktop || (broadcastThreadOpen && hasSelectedThread);
        const shouldShowListPanel = isDesktop || !shouldShowThreadPanel;
        document.getElementById("broadcast")?.classList.toggle(
          "thread-open",
          !isDesktop && broadcastThreadOpen && hasSelectedThread,
        );
        if (mainEl) {
          mainEl.classList.toggle("thread-open", isDesktop ? true : (broadcastThreadOpen && hasSelectedThread));
        }
        listPanelEl?.classList.toggle("hidden", !shouldShowListPanel);
        if (panelEl) {
          panelEl.classList.toggle("hidden", !shouldShowThreadPanel);
        }
        syncBroadcastMobileComposerDock(!isDesktop && broadcastThreadOpen && hasSelectedThread);
      }

      function buildBroadcastAttachmentMarkup(attachment = {}, { compact = false } = {}) {
        const dataUrl = String(attachment?.dataUrl || attachment?.upload?.dataUrl || "").trim();
        const mimeType = String(attachment?.mimeType || attachment?.upload?.mimeType || "").toLowerCase();
        const fileName = String(attachment?.fileName || attachment?.upload?.fileName || "attachment").trim();
        if (!dataUrl) return "";
        const safeDataUrl = escapeHtml(dataUrl);
        const safeFileName = escapeHtml(fileName);
        const safeMimeType = escapeHtml(mimeType || "application/octet-stream");
        const isImage = mimeType.startsWith("image/");
        const isVideo = mimeType.startsWith("video/");
        const isAudio = mimeType.startsWith("audio/");
        const isPreviewable = isImage || isVideo || isAudio;
        if (compact && isPreviewable) {
          const media =
            isImage
              ? `<img src="${safeDataUrl}" alt="${safeFileName}" loading="lazy" />`
              : isVideo
                ? `<video muted playsinline preload="metadata" src="${safeDataUrl}"></video>`
                : `<div class="broadcast-message-audio-preview"><div class="broadcast-message-file-icon">A</div><div class="broadcast-message-file-text"><div class="broadcast-message-file-name">${safeFileName}</div><div class="broadcast-message-file-meta">Audio</div></div></div>`;
          return `
            <button
              type="button"
              class="broadcast-message-attachment-preview ${isAudio ? "broadcast-message-audio-preview" : "broadcast-message-attachment-preview-media"}"
              data-broadcast-attachment-preview="true"
              data-preview-url="${safeDataUrl}"
              data-preview-name="${safeFileName}"
              data-preview-mime="${safeMimeType}"
              data-preview-kind="${isImage ? "image" : isVideo ? "video" : "audio"}"
            >
              ${media}
            </button>
          `;
        }
        if (mimeType.startsWith("image/")) {
          return `<img src="${safeDataUrl}" alt="${safeFileName}" loading="lazy" />`;
        }
        if (mimeType.startsWith("video/")) {
          return `<video controls playsinline src="${safeDataUrl}"></video>`;
        }
        if (mimeType.startsWith("audio/")) {
          return `<audio controls src="${safeDataUrl}"></audio>`;
        }
        if (compact) {
          return `
            <button
              type="button"
              class="broadcast-message-attachment-preview broadcast-message-file-preview"
              data-broadcast-attachment-preview="true"
              data-preview-url="${safeDataUrl}"
              data-preview-name="${safeFileName}"
              data-preview-mime="${safeMimeType}"
              data-preview-kind="file"
            >
              <div class="broadcast-message-file-icon">F</div>
              <div class="broadcast-message-file-text">
                <div class="broadcast-message-file-name">${safeFileName}</div>
                <div class="broadcast-message-file-meta">File attachment</div>
              </div>
            </button>
          `;
        }
        return `
          <a class="broadcast-message-attachment-preview broadcast-message-file-preview" href="${safeDataUrl}" download="${safeFileName}" target="_blank" rel="noreferrer">
            <div class="broadcast-message-file-icon">F</div>
            <div class="broadcast-message-file-text">
              <div class="broadcast-message-file-name">${safeFileName}</div>
              <div class="broadcast-message-file-meta">File attachment</div>
            </div>
          </a>
        `;
      }

      function openBroadcastAttachmentViewer(attachment = {}) {
        const dataUrl = String(attachment?.dataUrl || attachment?.upload?.dataUrl || "").trim();
        const mimeType = String(attachment?.mimeType || attachment?.upload?.mimeType || "").toLowerCase();
        const fileName = String(attachment?.fileName || attachment?.upload?.fileName || "attachment").trim();
        if (!dataUrl) return;
        const titleEl = document.getElementById("broadcast-attachment-viewer-title");
        const subtitleEl = document.getElementById("broadcast-attachment-viewer-subtitle");
        const bodyEl = document.getElementById("broadcast-attachment-viewer-body");
        if (!titleEl || !subtitleEl || !bodyEl) return;
        const modalEl = document.getElementById("broadcast-attachment-viewer-modal");
        const safeDataUrl = escapeHtml(dataUrl);
        const safeFileName = escapeHtml(fileName);
        const safeMimeType = escapeHtml(mimeType || "application/octet-stream");
        const isMedia = mimeType.startsWith("image/") || mimeType.startsWith("video/") || mimeType.startsWith("audio/");
        titleEl.textContent = isMedia ? "" : (fileName || "Attachment");
        subtitleEl.textContent = isMedia ? "" : (mimeType || "Broadcast attachment");
        modalEl?.classList.toggle("is-simple-view", isMedia);
        if (mimeType.startsWith("image/")) {
          bodyEl.innerHTML = `
            <div class="broadcast-attachment-viewer-stage is-media-only">
              <img src="${safeDataUrl}" alt="${safeFileName}" loading="lazy" />
            </div>
          `;
        } else if (mimeType.startsWith("video/")) {
          bodyEl.innerHTML = `
            <div class="broadcast-attachment-viewer-stage is-media-only">
              <video controls playsinline src="${safeDataUrl}"></video>
            </div>
          `;
        } else if (mimeType.startsWith("audio/")) {
          bodyEl.innerHTML = `
            <div class="broadcast-attachment-viewer-stage is-media-only">
              <audio controls src="${safeDataUrl}"></audio>
            </div>
          `;
        } else {
          bodyEl.innerHTML = `
            <div class="broadcast-attachment-viewer-stage">
              <div class="broadcast-attachment-viewer-file">
                <div class="broadcast-attachment-viewer-file-icon">â¤“</div>
                <div class="broadcast-attachment-viewer-file-text">
                  <div class="broadcast-attachment-viewer-file-name">${safeFileName}</div>
                  <div class="broadcast-attachment-viewer-file-meta">${safeMimeType}</div>
                </div>
              </div>
            </div>
            <div class="broadcast-attachment-viewer-actions">
              <a class="primary" href="${safeDataUrl}" download="${safeFileName}" target="_blank" rel="noreferrer">Download</a>
            </div>
          `;
        }
        document.getElementById("broadcast-attachment-viewer-actions")?.replaceChildren();
        modalEl?.classList.add("active");
      }

      function closeBroadcastAttachmentViewer() {
        const modalEl = document.getElementById("broadcast-attachment-viewer-modal");
        modalEl?.classList.remove("active", "is-simple-view");
        broadcastChatAttachmentViewerMode = "sent";
        broadcastChatAttachmentViewerAttachment = null;
      }

      function renderBroadcastComposerAttachmentViewerBody(attachment = {}, { mode = "sent" } = {}) {
        const bodyEl = document.getElementById("broadcast-attachment-viewer-body");
        const actionsEl = document.getElementById("broadcast-attachment-viewer-actions");
        if (!(bodyEl instanceof HTMLElement)) return;
        const dataUrl = String(attachment?.dataUrl || attachment?.upload?.dataUrl || "").trim();
        const mimeType = String(attachment?.mimeType || attachment?.upload?.mimeType || "").toLowerCase();
        const fileName = String(attachment?.fileName || attachment?.upload?.fileName || "attachment").trim();
        const safeDataUrl = escapeHtml(dataUrl);
        const safeFileName = escapeHtml(fileName);
        const safeMimeType = escapeHtml(mimeType || "application/octet-stream");
        if (mimeType.startsWith("image/")) {
          bodyEl.innerHTML = `
            <div class="broadcast-attachment-viewer-stage">
              <img src="${safeDataUrl}" alt="${safeFileName}" loading="lazy" />
            </div>
          `;
        } else if (mimeType.startsWith("video/")) {
          bodyEl.innerHTML = `
            <div class="broadcast-attachment-viewer-stage">
              <video controls playsinline src="${safeDataUrl}"></video>
            </div>
          `;
        } else if (mimeType.startsWith("audio/")) {
          bodyEl.innerHTML = `
            <div class="broadcast-attachment-viewer-stage">
              <audio controls src="${safeDataUrl}"></audio>
            </div>
          `;
        } else {
          bodyEl.innerHTML = `
            <div class="broadcast-attachment-viewer-stage">
              <div class="broadcast-attachment-viewer-file">
                <div class="broadcast-attachment-viewer-file-icon">â§‰</div>
                <div class="broadcast-attachment-viewer-file-text">
                  <div class="broadcast-attachment-viewer-file-name">${safeFileName}</div>
                  <div class="broadcast-attachment-viewer-file-meta">${safeMimeType}</div>
                </div>
              </div>
            </div>
          `;
        }
        if (actionsEl instanceof HTMLElement) {
          const isComposer = String(mode || "sent").toLowerCase() === "composer";
          actionsEl.innerHTML = isComposer
            ? `
              <button type="button" class="secondary" id="broadcast-attachment-viewer-replace-btn">Replace attachment</button>
              <button type="button" class="secondary" id="broadcast-attachment-viewer-remove-btn">Remove attachment</button>
              <a class="primary" href="${safeDataUrl}" download="${safeFileName}" target="_blank" rel="noreferrer">Download</a>
            `
            : `
              <a class="primary" href="${safeDataUrl}" download="${safeFileName}" target="_blank" rel="noreferrer">Download</a>
            `;
          document.getElementById("broadcast-attachment-viewer-replace-btn")?.addEventListener("click", () => {
            closeBroadcastComposerAttachmentViewer();
            const fileInput = document.getElementById("broadcast-chat-file");
            if (fileInput instanceof HTMLInputElement) {
              fileInput.value = "";
              fileInput.click();
            }
          });
          document.getElementById("broadcast-attachment-viewer-remove-btn")?.addEventListener("click", () => {
            broadcastChatAttachment = null;
            syncBroadcastAttachmentUi("chat");
            closeBroadcastComposerAttachmentViewer();
          });
        }
      }

      function openBroadcastComposerAttachmentViewer(attachment = {}, { mode = "sent" } = {}) {
        const dataUrl = String(attachment?.dataUrl || attachment?.upload?.dataUrl || "").trim();
        const mimeType = String(attachment?.mimeType || attachment?.upload?.mimeType || "").toLowerCase();
        const fileName = String(attachment?.fileName || attachment?.upload?.fileName || "attachment").trim();
        if (!dataUrl) return;
        const titleEl = document.getElementById("broadcast-attachment-viewer-title");
        const subtitleEl = document.getElementById("broadcast-attachment-viewer-subtitle");
        const bodyEl = document.getElementById("broadcast-attachment-viewer-body");
        if (!titleEl || !subtitleEl || !bodyEl) return;
        const modalEl = document.getElementById("broadcast-attachment-viewer-modal");
        modalEl?.classList.remove("is-simple-view");
        titleEl.textContent = fileName || "Attachment";
        subtitleEl.textContent = String(mode || "sent").toLowerCase() === "composer"
          ? "Preview and edit the selected attachment"
          : mimeType || "Broadcast attachment";
        broadcastChatAttachmentViewerMode = String(mode || "sent").toLowerCase() === "composer" ? "composer" : "sent";
        broadcastChatAttachmentViewerAttachment = {
          dataUrl,
          fileName,
          mimeType,
        };
        renderBroadcastComposerAttachmentViewerBody(broadcastChatAttachmentViewerAttachment, { mode: broadcastChatAttachmentViewerMode });
        document.getElementById("broadcast-attachment-viewer-modal")?.classList.add("active");
      }

      function closeBroadcastComposerAttachmentViewer() {
        const modalEl = document.getElementById("broadcast-attachment-viewer-modal");
        modalEl?.classList.remove("active", "is-simple-view");
        broadcastChatAttachmentViewerMode = "sent";
        broadcastChatAttachmentViewerAttachment = null;
      }

      function syncBroadcastAttachmentUi(kind = "chat") {
        const safeKind = String(kind || "chat").trim().toLowerCase() === "status" ? "status" : "chat";
        const attachment = safeKind === "status" ? broadcastStatusAttachment : broadcastChatAttachment;
        const nameEl = document.getElementById(
          safeKind === "status" ? "broadcast-status-attachment-name" : "broadcast-chat-attachment-name",
        );
        const clearBtn = document.getElementById(
          safeKind === "status" ? "broadcast-status-clear-btn" : "broadcast-chat-clear-btn",
        );
        const previewEl = safeKind === "status" ? null : document.getElementById("broadcast-chat-attachment-preview");
        if (nameEl) {
          nameEl.textContent = attachment?.fileName || (safeKind === "status" ? "No media selected." : "No attachment selected.");
          nameEl.classList.toggle("hidden", !attachment);
        }
        if (clearBtn) {
          clearBtn.classList.toggle("hidden", !attachment);
        }
        if (safeKind === "chat" && previewEl instanceof HTMLElement) {
          if (attachment) {
            renderBroadcastChatAttachmentPreview();
          } else {
            previewEl.innerHTML = "";
            previewEl.classList.add("hidden");
          }
        }
        if (safeKind === "chat") {
          const sendBtn = document.getElementById("broadcast-chat-send-btn");
          if (sendBtn instanceof HTMLElement) {
            sendBtn.disabled = broadcastChatSending;
            sendBtn.classList.toggle("is-disabled", broadcastChatSending);
          }
        }
      }

      function renderBroadcastStatusStrip() {
        const stripEl = document.getElementById("broadcast-status-strip");
        if (!stripEl) return;
        const statuses = Array.isArray(cachedBroadcastStatuses) ? cachedBroadcastStatuses : [];
        stripEl.innerHTML = [
          `<button id="broadcast-status-add-tile" type="button" class="broadcast-status-add">+ Add status</button>`,
          ...statuses.map((status) => {
            const title = String(status?.caption || status?.text || "Status").trim();
            const createdAt = formatBroadcastDateTime(status?.createdAt);
            return `
              <button type="button" class="broadcast-status-card" data-status-id="${escapeHtml(status.id || "")}">
                <div class="broadcast-status-card-title">${escapeHtml(title)}</div>
                <div class="broadcast-status-card-meta">${escapeHtml(createdAt)}</div>
              </button>
            `;
          }),
        ].join("");
        document.getElementById("broadcast-status-add-tile")?.addEventListener("click", openBroadcastStatusComposer);
        stripEl.querySelectorAll("[data-status-id]").forEach((button) => {
          button.addEventListener("click", () => {
            openBroadcastStatusViewer(button.dataset.statusId || "");
          });
        });
      }

      function renderBroadcastThreadList() {
        const listEl = document.getElementById("broadcast-thread-list");
        if (!listEl) return;
        const threads = Array.isArray(cachedBroadcastThreads) ? [...cachedBroadcastThreads] : [];
        const announcementExists = threads.some((entry) => String(entry?.threadKey || "").trim() === "broadcast");
        if (!announcementExists) {
          threads.unshift({
            threadKey: "broadcast",
            title: "Announcement",
            subtitle: "Broadcast to everyone",
            originType: "broadcast",
            originId: "all-users",
            originName: "All users",
            latestAt: "",
            recipientCount: 0,
            batchCount: 0,
            previewText: "Broadcast to everyone",
            lastMessage: null,
            batches: [],
          });
        }
        if (!threads.length) {
          threads.push({
            threadKey: "broadcast",
            title: "Announcement",
            subtitle: "Broadcast to everyone",
            originType: "broadcast",
            originId: "all-users",
            originName: "All users",
            latestAt: "",
            recipientCount: 0,
            batchCount: 0,
            previewText: "Broadcast to everyone",
            lastMessage: null,
            batches: [],
          });
        }
        syncBroadcastTabUnreadDot();
        const activeThreadKey = getActiveBroadcastThreadKey();
        listEl.innerHTML = threads
          .map((thread) => {
            const title = String(thread.title || "Admin Notice").trim();
            const preview = String(thread.previewText || thread.subtitle || "No messages yet").trim();
            const time = formatBroadcastTime(thread.latestAt);
            const badgeMarkup =
              thread.threadKey === "broadcast"
                ? `<span class="broadcast-thread-row-badge is-logo" aria-hidden="true"></span>`
                : `<span class="broadcast-thread-row-badge">${escapeHtml(String(title.charAt(0) || "?").toUpperCase())}</span>`;
            const activeClass = thread.threadKey === activeThreadKey ? " active" : "";
            const unreadCount = Number(thread.unreadMessageCount) || 0;
            const unreadMarkup = unreadCount > 0
              ? `<span class="broadcast-thread-unread-dot tone-${getBroadcastThreadDotTone(thread.threadKey)}" title="${unreadCount} unread user message${unreadCount === 1 ? "" : "s"}" aria-label="${unreadCount} unread user message${unreadCount === 1 ? "" : "s"}"></span>`
              : "";
            return `
              <button type="button" class="broadcast-thread-row${activeClass}" data-thread-key="${escapeHtml(thread.threadKey)}">
                ${badgeMarkup}
                <div class="broadcast-thread-row-body">
                  <div class="broadcast-thread-row-head">
                    <div class="broadcast-thread-row-title">${escapeHtml(title)}</div>
                    <div class="broadcast-thread-row-meta">${unreadMarkup}<div class="broadcast-thread-row-time">${escapeHtml(time)}</div></div>
                  </div>
                  <div class="broadcast-thread-row-preview">${escapeHtml(preview)}</div>
                </div>
              </button>
            `;
          })
          .join("");
        listEl.querySelectorAll("[data-thread-key]").forEach((button) => {
          button.addEventListener("click", () => {
            void openBroadcastThread(button.dataset.threadKey || "");
          });
        });
      }

      function renderBroadcastThreadMessages() {
        const detail = getBroadcastThreadDetail(getActiveBroadcastThreadKey());
        const messagesEl = document.getElementById("broadcast-thread-messages");
        const emptyEl = document.getElementById("broadcast-thread-empty");
        const titleEl = document.getElementById("broadcast-thread-title");
        const subtitleEl = document.getElementById("broadcast-thread-subtitle");
        if (!messagesEl || !emptyEl || !titleEl || !subtitleEl) return;

        const summary = getBroadcastThreadSummary(getActiveBroadcastThreadKey());
        if (!summary) {
          titleEl.textContent = "Announcement";
          subtitleEl.textContent = "Broadcast to everyone";
          messagesEl.innerHTML = "";
          emptyEl.classList.remove("hidden");
          emptyEl.textContent = "Select Announcement or a warning thread to view its history.";
          syncBroadcastThreadUi();
          return;
        }

        titleEl.textContent = summary.title || "Admin Notice";
        subtitleEl.textContent = summary.originType === "report" ? "" : (summary.subtitle || "Admin notice");
        subtitleEl.classList.toggle("hidden", summary.originType === "report");

        if (!detail) {
          messagesEl.innerHTML = "";
          emptyEl.classList.remove("hidden");
          emptyEl.textContent = "Loading thread history...";
          syncBroadcastThreadUi();
          return;
        }

        if (!Array.isArray(detail.batches) || !detail.batches.length) {
          messagesEl.innerHTML = "";
          emptyEl.classList.remove("hidden");
          emptyEl.textContent = "No messages have been sent in this thread yet.";
          return;
        }

        emptyEl.classList.add("hidden");
        const orderedBatches = [...detail.batches].sort((a, b) => {
          const left = String(a.createdAt || a.latestAt || "");
          const right = String(b.createdAt || b.latestAt || "");
          return left.localeCompare(right);
        });
        messagesEl.innerHTML = orderedBatches
          .map((batch) => {
            const text = String(batch.text || "").trim();
            const attachmentHtml = buildBroadcastAttachmentMarkup(batch.attachment, { compact: true });
            const metaTime = formatBroadcastTime(batch.createdAt);
            const senderName = String(batch.senderName || "AJIXPHARMACY Admin").trim() || "AJIXPHARMACY Admin";
            const isAdminSender = senderName.toLowerCase() === "ajixpharmacy admin";
            const senderMarkup = isAdminSender
              ? `<span class="broadcast-message-sender is-admin"><span class="broadcast-message-sender-avatar" aria-hidden="true"></span><span class="broadcast-message-sender-name">${escapeHtml(senderName)}</span></span>`
              : `<span class="broadcast-message-sender-name">${escapeHtml(senderName)}</span>`;
            const replyMarkup = batch.replyTo?.sourceId
              ? `<div class="broadcast-message-reply-snippet"><strong>${escapeHtml(batch.replyTo.senderName || "Message")}</strong><span>${escapeHtml(batch.replyTo.text || "Attachment")}</span></div>`
              : "";
            return `
              <div class="broadcast-message-row ${isAdminSender ? "is-admin" : "is-user"}" data-broadcast-message-id="${escapeHtml(batch.id || "")}" ${!isAdminSender ? 'data-broadcast-replyable="true"' : ""}>
                <div class="broadcast-message-bubble">
                  <div class="broadcast-message-meta">
                    ${senderMarkup}
                    <span>${escapeHtml(metaTime)}</span>
                  </div>
                  ${replyMarkup}
                  <div class="broadcast-message-text">${escapeHtml(text || "Attachment only message")}</div>
                  ${attachmentHtml ? `<div class="broadcast-message-attachment">${attachmentHtml}</div>` : ""}
                </div>
              </div>
            `;
          })
          .join("");
        if (!messagesEl.dataset.broadcastReplyGesturesBound) {
          messagesEl.dataset.broadcastReplyGesturesBound = "true";
          messagesEl.addEventListener("pointerdown", (event) => {
            if (event.button !== 0) return;
            const row = event.target instanceof HTMLElement ? event.target.closest('[data-broadcast-replyable="true"]') : null;
            if (!(row instanceof HTMLElement)) return;
            broadcastMessageGesture = {
              startX: event.clientX,
              startY: event.clientY,
              rowEl: row,
            };
          });
          messagesEl.addEventListener("pointermove", (event) => {
            const gesture = broadcastMessageGesture;
            if (!gesture) return;
            const deltaX = event.clientX - gesture.startX;
            const deltaY = event.clientY - gesture.startY;
            if (deltaX <= 0 || Math.abs(deltaY) > Math.abs(deltaX) * 1.25) return;
            gesture.rowEl.classList.add("is-swipe-dragging");
            gesture.rowEl.style.transform = `translate3d(${Math.min(70, deltaX * 0.7)}px, 0, 0)`;
          });
          messagesEl.addEventListener("pointerup", finishBroadcastMessageGesture);
          messagesEl.addEventListener("pointercancel", () => {
            const gesture = broadcastMessageGesture;
            broadcastMessageGesture = null;
            gesture?.rowEl?.classList.remove("is-swipe-dragging");
            gesture?.rowEl?.style.removeProperty("transform");
          });
        }
        messagesEl.querySelectorAll("[data-broadcast-attachment-preview]").forEach((button) => {
          button.addEventListener("click", () => {
            openBroadcastAttachmentViewer({
              dataUrl: button.dataset.previewUrl || "",
              mimeType: button.dataset.previewMime || "",
              fileName: button.dataset.previewName || "attachment",
            });
          });
        });
        messagesEl.scrollTop = messagesEl.scrollHeight;
        syncBroadcastThreadUi();
      }

      function renderBroadcastOverview() {
        renderBroadcastStatusStrip();
        renderBroadcastThreadList();
        renderBroadcastThreadMessages();
        syncBroadcastThreadUi();
      }

      async function loadBroadcastOverview() {
        const hadLoadedOverview = broadcastOverviewLoaded;
        try {
          if (!hadLoadedOverview) {
            cachedBroadcastThreads = [{
              threadKey: "broadcast",
              title: "Announcement",
              subtitle: "Broadcast to everyone",
              originType: "broadcast",
              originId: "all-users",
              originName: "All users",
              latestAt: "",
              recipientCount: 0,
              batchCount: 0,
              previewText: "Broadcast to everyone",
              lastMessage: null,
              batches: [],
            }];
            renderBroadcastOverview();
          }
          const res = await fetch(`${API_BASE}/admin/broadcast/overview`, {
            headers: getHeaders(),
            cache: "no-store",
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(data.error || "Failed to load broadcast inbox");
          }
          const nextThreads = Array.isArray(data.threads) ? data.threads : [];
          const nextStatuses = Array.isArray(data.statuses) ? data.statuses : [];
          const overviewChanged =
            JSON.stringify(cachedBroadcastThreads) !== JSON.stringify(nextThreads) ||
            JSON.stringify(cachedBroadcastStatuses) !== JSON.stringify(nextStatuses);
          cachedBroadcastThreads = nextThreads;
          cachedBroadcastStatuses = nextStatuses;
          broadcastOverviewLoaded = true;
          if (!getBroadcastThreadSummary(selectedBroadcastThreadKey)) {
            selectedBroadcastThreadKey = "";
          }
          if (overviewChanged || !hadLoadedOverview) {
            renderBroadcastOverview();
          }
          if (broadcastThreadOpen && selectedBroadcastThreadKey) {
            await loadBroadcastThreadDetail(selectedBroadcastThreadKey);
          }
          return true;
        } catch (err) {
          broadcastOverviewLoaded = true;
          if (!hadLoadedOverview) {
            cachedBroadcastThreads = [{
              threadKey: "broadcast",
              title: "Announcement",
              subtitle: "Broadcast to everyone",
              originType: "broadcast",
              originId: "all-users",
              originName: "All users",
              latestAt: "",
              recipientCount: 0,
              batchCount: 0,
              previewText: "Broadcast to everyone",
              lastMessage: null,
              batches: [],
            }];
            renderBroadcastOverview();
          }
          showAlert("broadcast-alerts", "Error: " + err.message, "error");
          return false;
        }
      }

      async function loadBroadcastThreadDetail(threadKey = "") {
        const safeThreadKey = String(threadKey || "").trim();
        if (!safeThreadKey) return false;
        try {
          const res = await fetch(`${API_BASE}/admin/broadcast/threads/${encodeURIComponent(safeThreadKey)}`, {
            headers: getHeaders(),
            cache: "no-store",
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(data.error || "Failed to load thread history");
          }
          const nextDetail = {
            thread: data.thread || null,
            batches: Array.isArray(data.batches) ? data.batches : [],
          };
          const previousDetail = cachedBroadcastThreadDetail.get(safeThreadKey) || null;
          const detailChanged = JSON.stringify(previousDetail) !== JSON.stringify(nextDetail);
          cachedBroadcastThreadDetail.set(safeThreadKey, nextDetail);
          if (detailChanged && safeThreadKey === getActiveBroadcastThreadKey()) {
            renderBroadcastThreadMessages();
          }
          return true;
        } catch (err) {
          showAlert("broadcast-alerts", "Error: " + err.message, "error");
          return false;
        }
      }

      async function markBroadcastThreadRead(threadKey = "") {
        const safeThreadKey = String(threadKey || "").trim();
        if (!safeThreadKey) return false;
        try {
          const res = await fetch(`${API_BASE}/admin/broadcast/threads/${encodeURIComponent(safeThreadKey)}/read`, {
            method: "POST",
            headers: getHeaders(),
          });
          if (!res.ok) return false;
          const summary = cachedBroadcastThreads.find((entry) => entry.threadKey === safeThreadKey);
          if (summary) {
            summary.unreadMessageCount = 0;
            summary.hasUnreadMessages = false;
          }
          syncBroadcastTabUnreadDot();
          renderBroadcastThreadList();
          return true;
        } catch {
          return false;
        }
      }

      async function openBroadcastThread(threadKey = "") {
        const safeThreadKey = String(threadKey || "").trim();
        if (!safeThreadKey) return;
        selectedBroadcastThreadKey = safeThreadKey;
        broadcastThreadOpen = true;
        syncBroadcastThreadUi();
        renderBroadcastThreadList();
        renderBroadcastThreadMessages();
        autoSizeBroadcastChatMessage();
        if (!getBroadcastThreadDetail(safeThreadKey)) {
          await loadBroadcastThreadDetail(safeThreadKey);
        }
        await markBroadcastThreadRead(safeThreadKey);
      }

      function closeBroadcastThread() {
        selectedBroadcastThreadKey = "";
        broadcastThreadOpen = false;
        syncBroadcastThreadUi();
        renderBroadcastThreadList();
        renderBroadcastThreadMessages();
        setBroadcastChatEmojiPickerOpen(false);
      }

      function openBroadcastStatusComposer() {
        syncBroadcastAttachmentUi("status");
        const backgroundEl = document.getElementById("broadcast-status-background");
        if (backgroundEl instanceof HTMLInputElement) {
          backgroundEl.value = broadcastStatusBackground || "#2f80d0";
        }
        document.getElementById("broadcast-status-modal")?.classList.add("active");
      }

      function closeBroadcastStatusComposer() {
        document.getElementById("broadcast-status-modal")?.classList.remove("active");
      }

      function openBroadcastStatusViewer(statusId = "") {
        const status = cachedBroadcastStatuses.find((entry) => entry.id === statusId) || null;
        if (!status) return;
        selectedBroadcastStatusId = status.id;
        const titleEl = document.getElementById("broadcast-status-viewer-title");
        const subtitleEl = document.getElementById("broadcast-status-viewer-subtitle");
        const bodyEl = document.getElementById("broadcast-status-viewer-body");
        if (titleEl) titleEl.textContent = String(status.caption || status.text || "Status").trim() || "Status";
        if (subtitleEl) subtitleEl.textContent = formatBroadcastDateTime(status.createdAt);
        if (bodyEl) {
          const attachmentHtml = buildBroadcastAttachmentMarkup(status.upload || {}, { compact: false });
          bodyEl.innerHTML = `
            <div class="broadcast-status-viewer-card" style="background: linear-gradient(180deg, ${escapeHtml(status.background || "#2f80d0")}1f, #ffffff);">
              <div class="broadcast-status-card-title">${escapeHtml(status.caption || status.text || "Status")}</div>
              <div class="broadcast-status-card-meta" style="margin-bottom: 12px;">${escapeHtml(formatBroadcastDateTime(status.createdAt))}</div>
              ${status.text ? `<div class="broadcast-message-text">${escapeHtml(status.text)}</div>` : ""}
              ${attachmentHtml ? `<div class="broadcast-message-attachment" style="margin-top: 12px;">${attachmentHtml}</div>` : ""}
            </div>
          `;
        }
        document.getElementById("broadcast-status-viewer-modal")?.classList.add("active");
      }

      function closeBroadcastStatusViewer() {
        document.getElementById("broadcast-status-viewer-modal")?.classList.remove("active");
        selectedBroadcastStatusId = "";
      }

      async function sendAdminBroadcastMessage() {
        if (broadcastChatSending) return;
        const threadKey = getActiveBroadcastThreadKey();
        const messageEl = document.getElementById("broadcast-chat-message");
        const message = String(messageEl?.value || "").trim();
        if (!threadKey) {
          showAlert("broadcast-alerts", "Choose a thread first", "error");
          return;
        }
        if (!message && !broadcastChatAttachment) {
          showAlert("broadcast-alerts", "Write a message or attach a file first", "error");
          return;
        }
        broadcastChatSending = true;
        if (!broadcastChatClientRequestId) {
          broadcastChatClientRequestId = `broadcast-chat-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
        }
        syncBroadcastAttachmentUi("chat");
        try {
          const res = await fetch(`${API_BASE}/admin/broadcast/threads/${encodeURIComponent(threadKey)}/message`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({
              message,
              attachmentDataUrl: broadcastChatAttachment?.dataUrl || "",
              attachmentFileName: broadcastChatAttachment?.fileName || "",
              clientRequestId: broadcastChatClientRequestId,
              replyTo: broadcastReplyDraft,
            }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(data.error || "Failed to send notice");
          }
          if (messageEl instanceof HTMLTextAreaElement) {
            messageEl.value = "";
            autoSizeBroadcastChatMessage();
          }
          broadcastChatAttachment = null;
          broadcastChatClientRequestId = "";
          clearBroadcastReplyDraft();
          const fileInput = document.getElementById("broadcast-chat-file");
          if (fileInput) fileInput.value = "";
          syncBroadcastAttachmentUi("chat");
          setBroadcastChatEmojiPickerOpen(false);
          await Promise.all([
            loadBroadcastOverview(),
            loadBroadcastThreadDetail(threadKey),
          ]);
           if (pendingBroadcastWarningReportId) {
             const warningReportId = pendingBroadcastWarningReportId;
             pendingBroadcastWarningReportId = "";
             try {
               await setAdminReportStatus(warningReportId, "warned", data.sentAt || "");
               renderReportsTable();
             } catch (statusError) {
               showAlert("reports-alerts", "Message sent, but the report timestamp could not be updated: " + statusError.message, "error");
             }
           }
          showAlert("broadcast-alerts", `Notice sent to ${Number(data.deliveredTo || 0)} recipients.`, "success");
        } catch (err) {
          showAlert("broadcast-alerts", "Error: " + err.message, "error");
        } finally {
          broadcastChatSending = false;
          syncBroadcastAttachmentUi("chat");
        }
      }

      async function sendAdminBroadcastStatus() {
        const messageEl = document.getElementById("broadcast-status-message");
        const backgroundEl = document.getElementById("broadcast-status-background");
        const text = String(messageEl?.value || "").trim();
        const background = String(backgroundEl?.value || broadcastStatusBackground || "#2f80d0").trim() || "#2f80d0";
        if (!text && !broadcastStatusAttachment) {
          showAlert("broadcast-alerts", "Write a status or attach media first", "error");
          return;
        }
        try {
          const res = await fetch(`${API_BASE}/admin/broadcast/status`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({
              text: broadcastStatusAttachment ? "" : text,
              caption: broadcastStatusAttachment ? text : "",
              background,
              attachmentDataUrl: broadcastStatusAttachment?.dataUrl || "",
              attachmentFileName: broadcastStatusAttachment?.fileName || "",
            }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(data.error || "Failed to publish status");
          }
          if (messageEl) messageEl.value = "";
          broadcastStatusBackground = "#2f80d0";
          if (backgroundEl) backgroundEl.value = "#2f80d0";
          broadcastStatusAttachment = null;
          const fileInput = document.getElementById("broadcast-status-file");
          if (fileInput) fileInput.value = "";
          syncBroadcastAttachmentUi("status");
          closeBroadcastStatusComposer();
          await loadBroadcastOverview();
          showAlert("broadcast-alerts", "Status published successfully", "success");
        } catch (err) {
          showAlert("broadcast-alerts", "Error: " + err.message, "error");
        }
      }

      async function openUserDetailsModal(userId) {
        closeDeleteUserConfirmModal();
        if (!reportsLoaded) await loadReports();
        let user = getUserById(userId);
        if (!user) {
          const loaded = await loadUsers();
          if (loaded) user = getUserById(userId);
        }
        if (!user) {
          showAlert("users-alerts", "User details could not be loaded", "error");
          return;
        }

        selectedUserId = String(user.id || "");
        document.getElementById("user-details-body").innerHTML = buildUserDetailsHtml(user);
        const messageEl = document.getElementById("user-message-body");
        if (messageEl) messageEl.value = "";
        document.getElementById("user-details-modal").classList.add("active");
      }

      function openDeleteUserConfirmModal() {
        const user = getUserById(selectedUserId);
        if (!user) return;

        pendingDeleteUserId = String(user.id || "");
        const label = String(user.name || user.username || "this user").trim();
        document.getElementById("delete-user-confirm-text").textContent =
          `Archive ${label}? This will move the account out of the active list and keep a restore record.`;
        document.getElementById("delete-user-confirm-modal").classList.add("active");
      }

      async function deleteUser(userId) {
        try {
          const safeUserId = encodeURIComponent(userId);
          const res = await fetch(`${API_BASE}/admin/users/${safeUserId}`, {
            method: "DELETE",
            headers: getHeaders(),
          });

          if (res.ok) {
            closeDeleteUserConfirmModal();
            closeUserDetailsModal();
            showAlert("users-alerts", "User moved to archive successfully", "success");
            await Promise.all([
              loadUsers(),
              loadDeletedUsers(),
              loadStats(),
              loadExportData(),
            ]);
          } else {
            const data = await res.json().catch(() => ({}));
            showAlert("users-alerts", data.error || "Failed to archive user", "error");
          }
        } catch (err) {
          showAlert("users-alerts", "Error: " + err.message, "error");
        }
      }

      async function confirmDeleteSelectedUser() {
        if (!pendingDeleteUserId) return;
        const userId = pendingDeleteUserId;
        await deleteUser(userId);
      }

      async function restoreArchivedUser(archiveId) {
        try {
          if (!confirm("Restore this archived account?")) {
            return;
          }
          const safeArchiveId = encodeURIComponent(archiveId);
          const res = await fetch(`${API_BASE}/admin/deleted-users/${safeArchiveId}/restore`, {
            method: "POST",
            headers: getHeaders(),
          });

          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            const conflictFields = Array.isArray(data.conflictFields) && data.conflictFields.length
              ? ` (${data.conflictFields.join(", ")})`
              : "";
            throw new Error((data.error || "Failed to restore archived user") + conflictFields);
          }

          showAlert("deleted-users-alerts", "Archived user restored successfully", "success");
          await Promise.all([loadUsers(), loadDeletedUsers(), loadStats(), loadExportData()]);
        } catch (err) {
          showAlert("deleted-users-alerts", "Error: " + err.message, "error");
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

      const adminActivityState = {
        days: 7,
        from: "",
        to: "",
        search: "",
        type: "",
        status: "",
        events: [],
        total: 0,
        loaded: false,
        listenersBound: false,
      };

      function adminActivityQuery(offset = 0, limit = 200) {
        const params = new URLSearchParams({ offset: String(offset), limit: String(limit) });
        if (adminActivityState.from) params.set("from", adminActivityState.from);
        if (adminActivityState.to) params.set("to", adminActivityState.to);
        if (!adminActivityState.from && !adminActivityState.to) params.set("days", String(adminActivityState.days || 7));
        if (adminActivityState.search) params.set("search", adminActivityState.search);
        if (adminActivityState.type) params.set("type", adminActivityState.type);
        if (adminActivityState.status) params.set("status", adminActivityState.status);
        return `${API_BASE}/admin/activity?${params.toString()}`;
      }

      function adminActivityDate(value) {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
      }

      function adminActivityTime(value) {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? "" : date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      }

      function adminActivityInitials(value) {
        return String(value || "User").split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
      }

      function renderAdminActivityCards(summary = {}) {
        const cards = [
          ["New users", summary.newUsers, "registered in period"],
          ["Active users", summary.activeUsers, "performed activity"],
          ["Total sessions", summary.sessions, "login and session events"],
          ["Quiz activity", summary.quizActivity, "attempts and completions"],
          ["Password resets", summary.passwordResets, "requests recorded"],
          ["Subscription events", summary.subscriptionEvents, "requests and decisions"],
          ["Security events", summary.securityEvents, "sensitive activity"],
        ];
        const target = document.getElementById("admin-activity-cards");
        if (target) target.innerHTML = cards.map(([label, value, note]) => `<div class="admin-activity-card"><label>${label}</label><strong>${Number(value) || 0}</strong><small>${note}</small></div>`).join("");
      }

      function renderAdminActivityChart() {
        const target = document.getElementById("admin-activity-bars");
        if (!target) return;
        if (!adminActivityState.events.length) {
          target.innerHTML = '<div class="admin-activity-chart-empty">No activity recorded for this period.</div>';
          return;
        }
        const days = adminActivityState.from && adminActivityState.to
          ? Math.min(90, Math.max(1, Math.ceil((Date.parse(`${adminActivityState.to}T23:59:59`) - Date.parse(adminActivityState.from)) / 86400000)))
          : adminActivityState.days;
        const start = adminActivityState.from ? Date.parse(adminActivityState.from) : Date.now() - days * 86400000;
        const span = Math.max(1, Date.now() - start);
        const counts = Array(days).fill(0);
        adminActivityState.events.forEach((event) => {
          const timestamp = Date.parse(event.at);
          if (!Number.isFinite(timestamp)) return;
          const index = Math.min(days - 1, Math.max(0, Math.floor((timestamp - start) / (span / days))));
          counts[index] += 1;
        });
        const max = Math.max(1, ...counts);
        target.innerHTML = counts.map((count, index) => `<div class="admin-activity-bar" style="height:${Math.max(4, count / max * 100)}%" title="${adminActivityDate(start + index * span / days)}: ${count} events"></div>`).join("");
      }

      function renderAdminActivityRows() {
        const body = document.getElementById("admin-activity-rows");
        const footer = document.getElementById("admin-activity-footer");
        if (!body || !footer) return;
        if (!adminActivityState.events.length) {
          body.innerHTML = '<tr><td colspan="5"><div class="admin-activity-state">No activity matches your filters.<br>Try clearing a filter or selecting a wider period.</div></td></tr>';
          footer.innerHTML = "";
          return;
        }
        body.innerHTML = adminActivityState.events.map((event, index) => {
          const user = event.user || {};
          const statusClass = event.security ? "security" : String(event.status || "success").toLowerCase();
          const statusLabel = event.security && event.status === "success" ? "Security" : event.status || "success";
          return `<tr class="admin-activity-row" data-activity-index="${index}"><td><div class="admin-activity-user"><div class="admin-activity-avatar">${escapeHtml(adminActivityInitials(user.name))}</div><div>${escapeHtml(user.name || "System")}<div class="admin-activity-muted">${escapeHtml(user.contact || user.username || "")}</div></div></div></td><td><strong>${escapeHtml(event.title || event.type || "Activity")}</strong><div class="admin-activity-muted">${escapeHtml(event.type || "")}</div></td><td><span class="admin-activity-badge admin-activity-${escapeHtml(statusClass)}">${escapeHtml(statusLabel)}</span></td><td>${adminActivityDate(event.at)}<div class="admin-activity-muted">${adminActivityTime(event.at)}</div></td><td><div>${escapeHtml(event.device || "Web activity")}</div><div class="admin-activity-muted">${escapeHtml([event.ip, event.sessionId].filter(Boolean).join(" - "))}</div></td></tr>`;
        }).join("");
        footer.innerHTML = adminActivityState.total > adminActivityState.events.length ? `<button class="toolbar-button admin-activity-more" id="admin-activity-more">Load more (${adminActivityState.total - adminActivityState.events.length} remaining)</button>` : "";
        document.getElementById("admin-activity-more")?.addEventListener("click", () => void loadMoreAdminActivity());
      }

      function openAdminActivityDetail(event) {
        if (!event) return;
        const user = event.user || {};
        const detail = document.getElementById("admin-activity-detail");
        if (!detail) return;
        const rows = [["Activity", event.title || event.type], ["Status", event.status], ["Date", adminActivityDate(event.at)], ["Exact time", adminActivityTime(event.at)], ["IP address", event.ip || "Not recorded"], ["Device", event.device || "Not recorded"], ["User agent", event.userAgent || "Not recorded"], ["Session ID", event.sessionId || "Not recorded"], ["Record ID", event.id || "Not recorded"]];
        detail.innerHTML = `<div class="admin-activity-user" style="margin:18px 0"><div class="admin-activity-avatar">${escapeHtml(adminActivityInitials(user.name))}</div><div><strong>${escapeHtml(user.name || "System")}</strong><div class="admin-activity-muted">${escapeHtml(user.contact || user.username || "")}</div></div></div><h4>What happened</h4>${(event.details || [event.subtitle || event.title]).map((item) => `<div class="admin-activity-kv"><span>Detail</span><span>${escapeHtml(item)}</span></div>`).join("")}<h4>Full record</h4>${rows.map(([label, value]) => `<div class="admin-activity-kv"><span>${escapeHtml(label)}</span><span>${escapeHtml(value)}</span></div>`).join("")}`;
        document.getElementById("admin-activity-drawer")?.classList.add("open");
        document.getElementById("admin-activity-overlay")?.classList.add("open");
      }

      function closeAdminActivityDetail() {
        document.getElementById("admin-activity-drawer")?.classList.remove("open");
        document.getElementById("admin-activity-overlay")?.classList.remove("open");
      }

      async function loadMoreAdminActivity() {
        const response = await fetch(withNoCache(adminActivityQuery(adminActivityState.events.length, 100)), { headers: getHeaders(), cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        adminActivityState.events = adminActivityState.events.concat(Array.isArray(data.events) ? data.events : []);
        adminActivityState.total = Number(data.total) || adminActivityState.total;
        renderAdminActivityChart();
        renderAdminActivityRows();
      }

      async function loadAdminActivity({ force = false } = {}) {
        if (adminActivityState.loaded && !force) return;
        const error = document.getElementById("admin-activity-error");
        const rows = document.getElementById("admin-activity-rows");
        if (error) error.classList.add("hidden");
        if (rows) rows.innerHTML = '<tr><td colspan="5"><div class="admin-activity-state">Loading activity...</div></td></tr>';
        try {
          const response = await fetch(withNoCache(adminActivityQuery()), { headers: getHeaders(), cache: "no-store" });
          if (!response.ok) throw new Error(response.status === 403 ? "Admin access is required to load activity." : `Activity request failed (${response.status})`);
          const data = await response.json();
          adminActivityState.events = Array.isArray(data.events) ? data.events : [];
          adminActivityState.total = Number(data.total) || adminActivityState.events.length;
          adminActivityState.loaded = true;
          renderAdminActivityCards(data.summary || {});
          renderAdminActivityChart();
          renderAdminActivityRows();
        } catch (errorValue) {
          if (error) {
            error.textContent = errorValue?.message || "Unable to load activity.";
            error.classList.remove("hidden");
          }
        }
      }

      function bindAdminActivityEvents() {
        if (adminActivityState.listenersBound) return;
        adminActivityState.listenersBound = true;
        document.getElementById("admin-activity-periods")?.addEventListener("click", (event) => {
          const button = event.target.closest("button");
          if (!button) return;
          document.querySelectorAll("#admin-activity-periods button").forEach((item) => item.classList.remove("active"));
          button.classList.add("active");
          if (button.dataset.days === "custom") {
            document.getElementById("admin-activity-custom")?.classList.remove("hidden");
            return;
          }
          document.getElementById("admin-activity-custom")?.classList.add("hidden");
          adminActivityState.days = Number(button.dataset.days) || 7;
          adminActivityState.from = "";
          adminActivityState.to = "";
          document.getElementById("admin-activity-period-label").textContent = `Complete platform activity for the last ${adminActivityState.days} day${adminActivityState.days === 1 ? "" : "s"}`;
          void loadAdminActivity({ force: true });
        });
        document.getElementById("admin-activity-apply")?.addEventListener("click", () => {
          const from = document.getElementById("admin-activity-from")?.value || "";
          const to = document.getElementById("admin-activity-to")?.value || "";
          if (!from || !to || from > to) return;
          adminActivityState.from = from;
          adminActivityState.to = to;
          document.getElementById("admin-activity-period-label").textContent = `Complete platform activity: ${from} to ${to}`;
          void loadAdminActivity({ force: true });
        });
        ["search", "type", "status"].forEach((suffix) => document.getElementById(`admin-activity-${suffix}`)?.addEventListener("input", () => {
          adminActivityState.search = document.getElementById("admin-activity-search")?.value.trim() || "";
          adminActivityState.type = document.getElementById("admin-activity-type")?.value || "";
          adminActivityState.status = document.getElementById("admin-activity-status")?.value || "";
          void loadAdminActivity({ force: true });
        }));
        document.getElementById("admin-activity-clear")?.addEventListener("click", () => {
          ["search", "type", "status"].forEach((suffix) => { const element = document.getElementById(`admin-activity-${suffix}`); if (element) element.value = ""; });
          adminActivityState.search = adminActivityState.type = adminActivityState.status = "";
          void loadAdminActivity({ force: true });
        });
        document.getElementById("admin-activity-rows")?.addEventListener("click", (event) => {
          const row = event.target.closest("[data-activity-index]");
          if (row) openAdminActivityDetail(adminActivityState.events[Number(row.dataset.activityIndex)]);
        });
        document.getElementById("admin-activity-close")?.addEventListener("click", closeAdminActivityDetail);
        document.getElementById("admin-activity-cancel")?.addEventListener("click", closeAdminActivityDetail);
        document.getElementById("admin-activity-overlay")?.addEventListener("click", closeAdminActivityDetail);
      }

      function switchTab(tabName, btnEl = null) {
        const requestedTab = String(tabName || "stats").trim().toLowerCase();
        const previousTab = adminActiveTab || "stats";
        adminActiveTab = requestedTab;
        if (requestedTab === "broadcast") {
          adminBroadcastReturnTab = previousTab && previousTab !== "broadcast" ? previousTab : adminBroadcastReturnTab || "stats";
        }

        // Hide all content
        document
          .querySelectorAll(".content")
          .forEach((el) => el.classList.remove("active"));
        document
          .querySelectorAll(".tab-btn")
          .forEach((el) => el.classList.remove("active"));

        // Show selected content
        document.getElementById(requestedTab)?.classList.add("active");
        if (btnEl) {
          btnEl.classList.add("active");
        }
        const activeBtn = document.querySelector(
          `.tab-btn[data-tab="${requestedTab}"]`,
        );
        if (activeBtn) activeBtn.classList.add("active");

        const dashboardEl = document.getElementById("dashboard");
        document.body.classList.toggle("admin-broadcast-active", requestedTab === "broadcast");
        dashboardEl?.classList.toggle("broadcast-mode", requestedTab === "broadcast");

        const reportsTabBadge = document.getElementById("reports-tab-badge");
        if (requestedTab === "users") {
          if (usersLoaded) {
            renderUsersTable();
          } else {
            void loadUsers();
          }
        }
        if (requestedTab === "groups") {
          if (groupsLoaded) renderGroupsTable();
          else void loadGroups();
        }
        if (requestedTab === "reports") {
          syncReportsTabDot();
          if (reportsLoaded) renderReportsTable();
          else void loadReports();
        }
        if (requestedTab === "broadcast") {
          if (broadcastOverviewLoaded) {
            renderBroadcastOverview();
          } else {
            void loadBroadcastOverview();
          }
        }
        if (requestedTab === "monetization") {
          if (monetizationLoadedBuckets.has(selectedMonetizationBucket)) {
            renderMonetizationPanel();
          } else {
            void loadMonetizationRequests(selectedMonetizationBucket);
          }
        }
        if (requestedTab === "analytics") {
          bindAdminActivityEvents();
          void loadAdminActivity();
        }
        if (requestedTab === "password-resets") {
          if (passwordResetRequestsLoaded) {
            renderPasswordResetRequests();
          } else {
            void loadPasswordResetRequests();
          }
        }
      }

      function openReportsTab(type = "group") {
        reportsViewType = String(type || "group").trim().toLowerCase() === "user" ? "user" : "group";
        const groupBtn = document.getElementById("reports-group-btn");
        const userBtn = document.getElementById("reports-user-btn");
        if (groupBtn) groupBtn.classList.toggle("active", reportsViewType === "group");
        if (userBtn) userBtn.classList.toggle("active", reportsViewType === "user");
        syncReportsTabDot();
        switchTab("reports");
        if (reportsLoaded) {
          renderReportsTable();
        } else {
          void loadReports();
        }
      }

      function openGroupsTab() {
        switchTab("groups");
        if (groupsLoaded) {
          renderGroupsTable();
        } else {
          void loadGroups();
        }
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
        document.getElementById("q-rotation").value = "";
        document.getElementById("q-topic-slug").value = "";
        document.getElementById("q-section-id").value = "";
        document.getElementById("q-correct").value = "";
        document.querySelectorAll(".q-option").forEach((el) => (el.value = ""));
      }

      async function editQuestion(questionId) {
        let question = cachedQuestions.find((q) => String(q.id) === String(questionId));

        if (!question) {
          const res = await fetch(withNoCache(`${API_BASE}/admin/questions`), {
            headers: getHeaders(),
            cache: "no-store",
          });
          const data = await res.json();
          if (!res.ok || !Array.isArray(data.questions)) {
            alert(data.error || "Failed to load questions");
            return;
          }
          cachedQuestions = [...data.questions].sort((a, b) => {
            const aOrder = questionOrderValue(a);
            const bOrder = questionOrderValue(b);
            if (aOrder !== bOrder) return aOrder - bOrder;
            return (Number(a?.id) || 0) - (Number(b?.id) || 0);
          });
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
        document.getElementById("q-rotation").value = question.rotation || question.rotations?.[0] || "";
        document.getElementById("q-topic-slug").value = question.topicSlug || "";
        document.getElementById("q-section-id").value = question.sectionId || "";
        document.getElementById("q-correct").value = toCorrectOptionIndex(question);

        const effectiveOptions = getEffectiveOptions(question);
        const optionEls = document.querySelectorAll(".q-option");
        optionEls.forEach((el, index) => {
          el.value = effectiveOptions[index] || "";
        });
      }

      async function saveQuestion() {
        const text = document.getElementById("q-text").value;
        const category = document.getElementById("q-category").value;
        const rotation = document.getElementById("q-rotation").value;
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
          if (rotation) {
            payload.rotation = rotation;
          }
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
        const importNew = confirm("Import new questions from Quiz/data.js?\nExisting admin questions will be preserved.\nOK = import new IDs\nCancel = cancel");

        try {
          const res = await fetch(`${API_BASE}/admin/seed-questions`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ importNew }),
          });

          const data = await res.json();
          if (data.seeded) {
            const detail = data.imported
              ? `Imported ${data.imported} new questions; preserved ${data.preserved || 0} admin questions`
              : `No new questions found. Preserved ${data.count} admin questions`;
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
              "No new questions found. Existing admin questions were preserved.",
              "info",
            );
          }
        } catch (err) {
          showAlert("settings-alerts", "Error: " + err.message, "error");
        }
      }

      async function resetSystem() {
        showAlert(
          "settings-alerts",
          "System reset is disabled in this build.",
          "info",
        );
        return;
        if (
          !confirm(
            "âš ï¸ This will DELETE all users and attempts. Questions will be re-seeded.",
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

      function enableTableDragScroll() {
        // Keep native touch scrolling on phones, but explicitly route horizontal
        // trackpad/shift-wheel gestures to the table that is under the pointer.
        // Some desktop browsers dispatch those gestures as wheel events on the
        // table itself instead of moving its overflow container.
        if (document.documentElement.dataset.tableWheelScrollBound === "true") return;
        document.documentElement.dataset.tableWheelScrollBound = "true";
        document.addEventListener(
          "wheel",
          (event) => {
            const target = event.target instanceof Element ? event.target : null;
            const scrollContainer = target?.closest(
              ".table-container, .ajx-table-scroll, .preview-table-scroll",
            );
            if (!(scrollContainer instanceof HTMLElement)) return;

            const horizontalDelta = event.deltaX || (event.shiftKey ? event.deltaY : 0);
            if (!horizontalDelta) return;

            const maxScrollLeft = scrollContainer.scrollWidth - scrollContainer.clientWidth;
            if (maxScrollLeft <= 0) return;

            const nextScrollLeft = Math.max(
              0,
              Math.min(maxScrollLeft, scrollContainer.scrollLeft + horizontalDelta),
            );
            if (nextScrollLeft === scrollContainer.scrollLeft) return;

            scrollContainer.scrollLeft = nextScrollLeft;
            event.preventDefault();
          },
          { passive: false },
        );
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
          .getElementById("open-deleted-users-btn")
          ?.addEventListener("click", () => {
            void openDeletedUsersModal();
          });
        document
          .getElementById("open-deleted-groups-btn")
          ?.addEventListener("click", () => {
            void openDeletedGroupsModal();
          });
        document
          .getElementById("add-question-btn")
          ?.addEventListener("click", openQuestionModal);
        document.getElementById("users-search")?.addEventListener("input", (event) => {
          usersSearchQuery = event.target.value || "";
          renderUsersTable();
        });
        document.getElementById("groups-search")?.addEventListener("input", (event) => {
          groupsSearchQuery = event.target.value || "";
          renderGroupsTable();
        });
        document.getElementById("reports-search")?.addEventListener("input", (event) => {
          reportsSearchQuery = event.target.value || "";
          renderReportsTable();
        });
        document.getElementById("questions-search")?.addEventListener("input", (event) => {
          questionSearchQuery = event.target.value || "";
          renderQuestionsTable();
        });
        document.getElementById("monetization-search")?.addEventListener("input", (event) => {
          monetizationSearchQuery = event.target.value || "";
          renderMonetizationPanel();
        });
        document.getElementById("password-reset-search")?.addEventListener("input", (event) => {
          passwordResetSearchQuery = event.target.value || "";
          renderPasswordResetRequests();
        });
        document.getElementById("deleted-users-search")?.addEventListener("input", (event) => {
          deletedUsersSearchQuery = event.target.value || "";
          renderDeletedUsersTable();
        });
        document.getElementById("deleted-groups-search")?.addEventListener("input", (event) => {
          deletedGroupsSearchQuery = event.target.value || "";
          renderDeletedGroupsTable();
        });
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
          .getElementById("reports-group-btn")
          ?.addEventListener("click", () => {
            openReportsTab("group");
          });
        document
          .getElementById("reports-user-btn")
          ?.addEventListener("click", () => {
            openReportsTab("user");
          });
        const resetButton = document.getElementById("reset-system-btn");
        if (resetButton) {
          resetButton.disabled = true;
          resetButton.title = "System reset is disabled";
        }
        document
          .getElementById("user-cancel-btn")
          ?.addEventListener("click", closeUserModal);
        document.getElementById("user-save-btn")?.addEventListener("click", saveUser);
        document
          .getElementById("user-details-close-btn")
          ?.addEventListener("click", closeUserDetailsModal);
        document
          .getElementById("user-profile-close-btn")
          ?.addEventListener("click", closeUserDetailsModal);
        document
          .getElementById("user-details-delete-btn")
          ?.addEventListener("click", openDeleteUserConfirmModal);
        document
          .getElementById("user-open-chat-btn")
          ?.addEventListener("click", () => {
            const user = getUserById(selectedUserId);
            void openAdminProfileChat(
              `notice:user:${String(selectedUserId || "").trim()}`,
              user?.name || user?.username || "This user",
            );
          });
        document
          .getElementById("delete-user-confirm-cancel-btn")
          ?.addEventListener("click", closeDeleteUserConfirmModal);
        document
          .getElementById("delete-user-confirm-btn")
          ?.addEventListener("click", confirmDeleteSelectedUser);
        document
          .getElementById("deleted-users-close-btn")
          ?.addEventListener("click", closeDeletedUsersModal);
        document
          .getElementById("deleted-groups-close-btn")
          ?.addEventListener("click", closeDeletedGroupsModal);
        document
          .getElementById("group-details-close-btn")
          ?.addEventListener("click", closeGroupDetailsModal);
        document
          .getElementById("group-profile-close-btn")
          ?.addEventListener("click", closeGroupDetailsModal);
        document.getElementById("group-details-body")?.addEventListener("click", (event) => {
          const memberRow = event.target.closest("[data-member-user-id]");
          if (!memberRow) return;
          openUserDetailsModal(memberRow.dataset.memberUserId || "");
        });
        document.getElementById("group-details-body")?.addEventListener("keydown", (event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          const memberRow = event.target.closest("[data-member-user-id]");
          if (!memberRow) return;
          event.preventDefault();
          openUserDetailsModal(memberRow.dataset.memberUserId || "");
        });
        document
          .getElementById("group-details-archive-btn")
          ?.addEventListener("click", () => {
            void archiveGroup(selectedGroupId || "");
          });
        document
          .getElementById("group-open-chat-btn")
          ?.addEventListener("click", () => {
            const group = getGroupById(selectedGroupId);
            void openAdminProfileChat(
              `notice:group:${String(selectedGroupId || "").trim()}`,
              group?.name || "This group",
            );
          });
        document
          .getElementById("user-message-send-btn")
          ?.addEventListener("click", () => {
            void sendAdminUserMessage(selectedUserId || "");
          });
        document
          .getElementById("group-message-send-btn")
          ?.addEventListener("click", () => {
            void sendAdminGroupMessage(selectedGroupId || "");
          });
        document
          .getElementById("broadcast-chat-emoji-btn")
          ?.addEventListener("click", () => {
            setBroadcastChatEmojiPickerOpen(!broadcastChatEmojiPickerOpen);
          });
        document
          .getElementById("broadcast-chat-attach-btn")
          ?.addEventListener("click", () => {
            setBroadcastChatEmojiPickerOpen(false);
            document.getElementById("broadcast-chat-file")?.click();
          });
        document
          .getElementById("broadcast-chat-message")
          ?.addEventListener("input", () => {
            broadcastChatClientRequestId = "";
            requestAnimationFrame(() => {
              autoSizeBroadcastChatMessage();
            });
          });
        document
          .getElementById("broadcast-chat-message")
          ?.addEventListener("keyup", () => {
            requestAnimationFrame(() => {
              autoSizeBroadcastChatMessage();
            });
          });
        document
          .getElementById("broadcast-chat-message")
          ?.addEventListener("compositionend", () => {
            requestAnimationFrame(() => {
              autoSizeBroadcastChatMessage();
            });
          });
        document
          .getElementById("broadcast-chat-message")
          ?.addEventListener("focus", () => {
            setBroadcastChatEmojiPickerOpen(false);
            requestAnimationFrame(() => {
              autoSizeBroadcastChatMessage();
            });
          });
        document
          .getElementById("broadcast-chat-emoji-panel")
          ?.addEventListener("click", (event) => {
            const option = event.target instanceof HTMLElement ? event.target.closest("[data-broadcast-emoji]") : null;
            if (!(option instanceof HTMLElement)) return;
            const emoji = String(option.dataset.broadcastEmoji || "").trim();
            if (!emoji) return;
            insertBroadcastChatEmoji(emoji);
            setBroadcastChatEmojiPickerOpen(false);
          });
        document
          .getElementById("broadcast-chat-file")
          ?.addEventListener("change", async (event) => {
            const file = event.target instanceof HTMLInputElement ? event.target.files?.[0] : null;
            if (file instanceof File) {
              broadcastChatClientRequestId = "";
              broadcastChatAttachment = {
                dataUrl: await readFileAsDataUrl(file),
                fileName: file.name || "attachment",
                mimeType: String(file.type || "").trim().toLowerCase(),
              };
            } else {
              broadcastChatClientRequestId = "";
              broadcastChatAttachment = null;
            }
            syncBroadcastAttachmentUi("chat");
            if (event.target instanceof HTMLInputElement) {
              event.target.value = "";
            }
          });
        document
          .getElementById("broadcast-chat-attachment-preview")
          ?.addEventListener("click", (event) => {
            const removeBtn = event.target instanceof HTMLElement ? event.target.closest("[data-broadcast-chat-remove-attachment]") : null;
            if (removeBtn instanceof HTMLElement) {
              broadcastChatClientRequestId = "";
              broadcastChatAttachment = null;
              syncBroadcastAttachmentUi("chat");
              return;
            }
            if (broadcastChatAttachment) {
              openBroadcastComposerAttachmentViewer(broadcastChatAttachment);
            }
          });
        document
          .getElementById("broadcast-chat-clear-btn")
          ?.addEventListener("click", () => {
            broadcastChatClientRequestId = "";
            broadcastChatAttachment = null;
            syncBroadcastAttachmentUi("chat");
          });
        document
          .getElementById("broadcast-chat-send-btn")
          ?.addEventListener("click", () => {
            setBroadcastChatEmojiPickerOpen(false);
            void sendAdminBroadcastMessage();
          });
        document
          .getElementById("broadcast-status-open-btn")
          ?.addEventListener("click", openBroadcastStatusComposer);
        document
          .getElementById("broadcast-status-close-btn")
          ?.addEventListener("click", closeBroadcastStatusComposer);
        document
          .getElementById("broadcast-status-attach-btn")
          ?.addEventListener("click", () => {
            document.getElementById("broadcast-status-file")?.click();
          });
        document
          .getElementById("broadcast-status-file")
          ?.addEventListener("change", async (event) => {
            const file = event.target instanceof HTMLInputElement ? event.target.files?.[0] : null;
            if (file instanceof File) {
              broadcastStatusAttachment = {
                dataUrl: await readFileAsDataUrl(file),
                fileName: file.name || "media",
                mimeType: String(file.type || "").trim().toLowerCase(),
              };
            } else {
              broadcastStatusAttachment = null;
            }
            syncBroadcastAttachmentUi("status");
            if (event.target instanceof HTMLInputElement) {
              event.target.value = "";
            }
          });
        document
          .getElementById("broadcast-status-clear-btn")
          ?.addEventListener("click", () => {
            broadcastStatusAttachment = null;
            syncBroadcastAttachmentUi("status");
          });
        document
          .getElementById("broadcast-status-send-btn")
          ?.addEventListener("click", () => {
            void sendAdminBroadcastStatus();
          });
        document
          .getElementById("broadcast-status-viewer-close-btn")
          ?.addEventListener("click", closeBroadcastStatusViewer);
        document
          .getElementById("broadcast-attachment-viewer-close-btn")
          ?.addEventListener("click", closeBroadcastAttachmentViewer);
        document
          .getElementById("broadcast-thread-back-btn")
          ?.addEventListener("click", closeBroadcastThread);
        document
          .getElementById("broadcast-page-back-btn")
          ?.addEventListener("click", () => {
            const returnTab = adminBroadcastReturnTab || "stats";
            switchTab(returnTab === "broadcast" ? "stats" : returnTab);
          });
        document.addEventListener("pointerdown", (event) => {
          if (!broadcastChatEmojiPickerOpen) return;
          const target = event.target instanceof HTMLElement ? event.target : null;
          if (!target) {
            setBroadcastChatEmojiPickerOpen(false);
            return;
          }
          if (
            target.closest("#broadcast-chat-emoji-panel") ||
            target.closest("#broadcast-chat-emoji-btn")
          ) {
            return;
          }
          setBroadcastChatEmojiPickerOpen(false);
        });
        autoSizeBroadcastChatMessage();
        requestAnimationFrame(() => {
          autoSizeBroadcastChatMessage();
        });
        syncBroadcastViewportFrame();
        window.addEventListener("resize", syncBroadcastViewportFrame);
        window.visualViewport?.addEventListener("resize", syncBroadcastViewportFrame);
        window.visualViewport?.addEventListener("scroll", syncBroadcastViewportFrame);
        syncBroadcastMobileComposerDock(Boolean(selectedBroadcastThreadKey && getBroadcastThreadSummary(selectedBroadcastThreadKey)));
        document
          .getElementById("broadcast-status-background")
          ?.addEventListener("input", (event) => {
            if (event.target instanceof HTMLInputElement) {
              broadcastStatusBackground = String(event.target.value || "#2f80d0").trim() || "#2f80d0";
            }
          });
        document
          .getElementById("report-details-close-btn")
          ?.addEventListener("click", closeReportDetailsModal);
        document
          .getElementById("report-details-header-close-btn")
          ?.addEventListener("click", closeReportDetailsModal);
        document
          .getElementById("report-evidence-viewer-close-btn")
          ?.addEventListener("click", closeReportEvidenceViewer);
        document.addEventListener("click", (event) => {
          const downloadTile = event.target.closest("[data-admin-evidence-download-index]");
          if (downloadTile) {
            event.preventDefault();
            event.stopPropagation();
            const evidence = Array.isArray(selectedReportSnapshot?.evidence) ? selectedReportSnapshot.evidence : [];
            downloadReportEvidence(evidence[Number(downloadTile.dataset.adminEvidenceDownloadIndex)]);
            return;
          }
          const evidenceTile = event.target.closest("[data-admin-evidence-index]");
          if (!evidenceTile) return;
          event.preventDefault();
          event.stopPropagation();
          openReportEvidence(evidenceTile.dataset.adminEvidenceIndex);
        });
        document
          .getElementById("report-warning-send-btn")
          ?.addEventListener("click", warnSelectedReport);
        document
          .getElementById("report-suspend-btn")
          ?.addEventListener("click", () => {
            void suspendSelectedReportUser();
          });
        document
          .getElementById("report-warning-preset")
          ?.addEventListener("change", syncReportWarningMessagePreset);
        document
          .getElementById("report-warning-message")
          ?.addEventListener("input", () => {
            // Intentionally keep the selected title unchanged while the message draft is edited.
          });
        document
          .getElementById("question-cancel-btn")
          ?.addEventListener("click", closeQuestionModal);
        document
          .getElementById("question-save-btn")
          ?.addEventListener("click", saveQuestion);

        document.querySelectorAll(".tab-btn[data-tab]").forEach((button) => {
          button.addEventListener("click", () => {
            switchTab(button.dataset.tab, button);
            document.getElementById("dashboard")?.classList.remove("admin-nav-open");
            const scrim = document.getElementById("admin-shell-scrim");
            if (scrim) scrim.hidden = true;
            document.getElementById("admin-mobile-menu-btn")?.setAttribute("aria-expanded", "false");
          });
        });
        document.getElementById("admin-mobile-menu-btn")?.addEventListener("click", () => {
          const dashboard = document.getElementById("dashboard");
          const scrim = document.getElementById("admin-shell-scrim");
          const open = !dashboard?.classList.contains("admin-nav-open");
          dashboard?.classList.toggle("admin-nav-open", open);
          if (scrim) scrim.hidden = !open;
          document.getElementById("admin-mobile-menu-btn")?.setAttribute("aria-expanded", String(open));
        });
        document.getElementById("admin-shell-scrim")?.addEventListener("click", () => {
          document.getElementById("dashboard")?.classList.remove("admin-nav-open");
          document.getElementById("admin-shell-scrim").hidden = true;
          document.getElementById("admin-mobile-menu-btn")?.setAttribute("aria-expanded", "false");
        });
        document.querySelector("#dashboard>.tabs a.tab-btn")?.addEventListener("click", () => {
          document.getElementById("dashboard")?.classList.remove("admin-nav-open");
          document.getElementById("admin-shell-scrim").hidden = true;
          document.getElementById("admin-mobile-menu-btn")?.setAttribute("aria-expanded", "false");
        });
        document.querySelectorAll("[data-analytics-period]").forEach((button) => {
          button.addEventListener("click", () => {
            selectedAnalyticsPeriod = String(button.dataset.analyticsPeriod || "week").trim().toLowerCase();
            renderAdminAnalyticsPanel();
          });
        });

        bindTouchFriendlyTableRows({
          tableKey: "users-table",
          root: document.getElementById("users-table"),
          scrollContainer: document.querySelector("#users .table-container"),
          rowSelector: "tr[data-user-id]",
          onActivate: (row) => {
            openUserDetailsModal(row.dataset.userId || "");
          },
        });

        bindTouchFriendlyTableRows({
          tableKey: "groups-table",
          root: document.getElementById("groups-table"),
          scrollContainer: document.querySelector("#groups .table-container"),
          rowSelector: "tr[data-group-id]",
          onActivate: (row) => {
            void openGroupDetailsModal(row.dataset.groupId || "");
          },
        });

        bindTouchFriendlyTableRows({
          tableKey: "reports-table",
          root: document.getElementById("reports-table"),
          scrollContainer: document.querySelector("#reports .table-container"),
          rowSelector: "tr[data-report-id]",
          onActivate: (row) => {
            void openReportDetailsModal(row.dataset.reportId || "");
          },
        });

        bindTouchFriendlyTableRows({
          tableKey: "questions-table",
          root: document.getElementById("questions-table"),
          scrollContainer: document.querySelector("#questions .table-container"),
          rowSelector: "tr",
          enableClickBinding: false,
        });

        bindTouchFriendlyTableRows({
          tableKey: "monetization-list-root",
          root: document.getElementById("monetization-list-root"),
          scrollContainer: document.querySelector("#monetization .monetization-table-container, #monetization .table-container"),
          rowSelector: "tr[data-action='open-subscription-request'][data-request-id]",
          enableClickBinding: false,
          onActivate: (row) => {
            openSubscriptionRequestModal(row.dataset.requestId || "");
          },
        });

        document.querySelectorAll("[data-monetization-bucket]").forEach((button) => {
          button.addEventListener("click", () => {
            setMonetizationBucket(button.dataset.monetizationBucket || "request");
            if (adminActiveTab !== "monetization") {
              switchTab("monetization");
            }
          });
          button.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setMonetizationBucket(button.dataset.monetizationBucket || "request");
              if (adminActiveTab !== "monetization") {
                switchTab("monetization");
              }
            }
          });
        });

        document.getElementById("deleted-users-table")?.addEventListener("click", (event) => {
          const button = event.target.closest("button[data-archive-id]");
          if (!button) return;
          restoreArchivedUser(button.dataset.archiveId || "");
        });

        document.getElementById("deleted-groups-table")?.addEventListener("click", (event) => {
          const button = event.target.closest("button[data-archive-id]");
          if (!button) return;
          restoreArchivedGroup(button.dataset.archiveId || "");
        });

        document.getElementById("monetization-list-root")?.addEventListener("click", (event) => {
          const viewBtn = event.target.closest("button[data-action='view-subscription-request']");
          if (viewBtn?.dataset.requestId) {
            openSubscriptionRequestModal(viewBtn.dataset.requestId || "");
            return;
          }

          const approveBtn = event.target.closest("button[data-action='approve-subscription-request']");
          if (approveBtn?.dataset.requestId) {
            openSubscriptionApproveModal(approveBtn.dataset.requestId || "");
            return;
          }

          const rejectBtn = event.target.closest("button[data-action='reject-subscription-request']");
          if (rejectBtn?.dataset.requestId) {
            openSubscriptionRejectModal(rejectBtn.dataset.requestId || "");
            return;
          }

          if (hasRecentTableTouchActivation("monetization-list-root")) return;

          const row = event.target.closest("tr[data-action='open-subscription-request'][data-request-id]");
          if (row?.dataset.requestId && event.target.closest("button") === null) {
            openSubscriptionRequestModal(row.dataset.requestId || "");
          }
        });

        document.getElementById("password-reset-list-root")?.addEventListener("click", async (event) => {
          const target = event.target instanceof HTMLElement ? event.target : null;
          if (!target) return;
          const copyCodeTarget = target.closest("[data-action='copy-password-reset-code']");
          if (copyCodeTarget?.dataset.requestId) {
            await copyPasswordResetCode(copyCodeTarget.dataset.requestId || "");
            return;
          }

          const markSentBtn = target.closest("button[data-action='mark-password-reset-sent']");
          if (markSentBtn?.dataset.requestId) {
            await markPasswordResetRequestSent(markSentBtn.dataset.requestId || "");
          }
        });

        document.addEventListener("click", (event) => {
          const retryMonetizationBtn = event.target.closest("button[data-action='retry-monetization-bucket']");
          if (retryMonetizationBtn?.dataset.bucket) {
            const bucket = retryMonetizationBtn.dataset.bucket;
            monetizationBucketErrors.delete(bucket);
            monetizationLoadedBuckets.delete(bucket);
            renderMonetizationPanel();
            void loadMonetizationRequests(bucket, 1);
            return;
          }

          const loadMoreMonetizationBtn = event.target.closest("button[data-action='load-more-monetization']");
          if (loadMoreMonetizationBtn?.dataset.bucket) {
            const bucket = loadMoreMonetizationBtn.dataset.bucket;
            void loadMonetizationRequests(bucket, (monetizationBucketPages[bucket] || 0) + 1);
            return;
          }

          const sortToggle = event.target.closest("button[data-action='toggle-monetization-sort']");
          if (sortToggle) {
            event.preventDefault();
            event.stopPropagation();
            toggleMonetizationSortDirection();
            return;
          }

          const viewBtn = event.target.closest("button[data-action='view-subscription-request']");
          if (viewBtn?.dataset.requestId) {
            openSubscriptionRequestModal(viewBtn.dataset.requestId || "");
            return;
          }

          if (hasRecentTableTouchActivation("monetization-list-root")) return;

          const row = event.target.closest("tr[data-action='open-subscription-request'][data-request-id]");
          if (row?.dataset.requestId && !event.target.closest("button")) {
            openSubscriptionRequestModal(row.dataset.requestId || "");
          }
        });

        document.getElementById("subscription-request-body")?.addEventListener("click", (event) => {
          const approveBtn = event.target.closest("button[data-action='approve-subscription-request']");
          if (approveBtn?.dataset.requestId) {
            openSubscriptionApproveModal(approveBtn.dataset.requestId || "");
            return;
          }

          const rejectBtn = event.target.closest("button[data-action='reject-subscription-request']");
          if (rejectBtn?.dataset.requestId) {
            openSubscriptionRejectModal(rejectBtn.dataset.requestId || "");
            return;
          }

          const proofBtn = event.target.closest("button[data-action='open-proof-image']");
          if (!(proofBtn instanceof HTMLElement)) return;
          openSubscriptionProofModal({
            proofUrl: proofBtn.dataset.proofUrl || "",
            title: proofBtn.dataset.proofTitle || "Payment Proof",
          });
        });

        document
          .getElementById("subscription-request-close-btn")
          ?.addEventListener("click", closeSubscriptionRequestModal);
        document
          .getElementById("subscription-approve-close-btn")
          ?.addEventListener("click", closeSubscriptionApproveModal);
        document
          .getElementById("subscription-proof-close-btn")
          ?.addEventListener("click", closeSubscriptionProofModal);
        document
          .getElementById("subscription-reject-close-btn")
          ?.addEventListener("click", closeSubscriptionRejectModal);
        document
          .getElementById("subscription-reject-cancel-btn")
          ?.addEventListener("click", closeSubscriptionRejectModal);
        document
          .getElementById("subscription-reject-confirm-btn")
          ?.addEventListener("click", async () => {
            const select = document.getElementById("subscription-reject-reason");
            const reviewNote = String(select?.value || "").trim() || SUBSCRIPTION_REJECT_REASONS[0];
            const requestId = pendingSubscriptionRejectRequestId;
            if (!requestId) return;
            closeSubscriptionRejectModal();
            closeSubscriptionRequestModal();
            void reviewSubscriptionRequest(requestId, "reject", reviewNote);
          });

        document
          .getElementById("subscription-approve-cancel-btn")
          ?.addEventListener("click", () => {
            closeSubscriptionApproveModal();
          });
        document
          .getElementById("subscription-approve-confirm-btn")
          ?.addEventListener("click", () => {
            const requestId = pendingSubscriptionApproveRequestId;
            if (!requestId) return;
            closeSubscriptionApproveModal();
            closeSubscriptionRequestModal();
            void reviewSubscriptionRequest(requestId, "approve");
          });

        document.querySelectorAll(".modal").forEach((modal) => {
          modal.addEventListener("click", (event) => {
            if (event.target !== modal) return;
            if (modal.id === "user-details-modal") {
              closeUserDetailsModal();
            } else if (modal.id === "group-details-modal") {
              closeGroupDetailsModal();
            } else if (modal.id === "report-details-modal") {
              closeReportDetailsModal();
            } else if (modal.id === "report-evidence-viewer-modal") {
              closeReportEvidenceViewer();
            } else if (modal.id === "delete-user-confirm-modal") {
              closeDeleteUserConfirmModal();
            } else if (modal.id === "deleted-users-modal") {
              closeDeletedUsersModal();
            } else if (modal.id === "deleted-groups-modal") {
              closeDeletedGroupsModal();
            } else if (modal.id === "user-modal") {
              closeUserModal();
            } else if (modal.id === "question-modal") {
              closeQuestionModal();
            } else if (modal.id === "broadcast-status-modal") {
              closeBroadcastStatusComposer();
            } else if (modal.id === "broadcast-status-viewer-modal") {
              closeBroadcastStatusViewer();
            } else if (modal.id === "broadcast-attachment-viewer-modal") {
              closeBroadcastAttachmentViewer();
            } else if (modal.id === "subscription-request-modal") {
              closeSubscriptionRequestModal();
            } else if (modal.id === "subscription-approve-modal") {
              closeSubscriptionApproveModal();
            } else if (modal.id === "subscription-proof-modal") {
              closeSubscriptionProofModal();
            } else if (modal.id === "subscription-reject-modal") {
              closeSubscriptionRejectModal();
            }
          });
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

        document.addEventListener("keydown", (event) => {
          if (event.key !== "Escape") return;
          closeDeleteUserConfirmModal();
          closeUserDetailsModal();
          closeGroupDetailsModal();
          closeReportDetailsModal();
          closeDeletedUsersModal();
          closeDeletedGroupsModal();
          closeUserModal();
          closeQuestionModal();
          closeBroadcastStatusComposer();
          closeBroadcastStatusViewer();
          closeSubscriptionRequestModal();
          closeSubscriptionProofModal();
        });

        setAdminKeyVisibility(false);
      }

      // Initialize
      setupEventBindings();
      enableTableDragScroll();
      if (adminKey) {
        (async () => {
          await ensureAdminApiBase();
          const loginScreen = getAdminLoginScreen();
            if (loginScreen) loginScreen.style.display = "none";
          const dashboard = getAdminDashboard();
            if (dashboard) dashboard.classList.add("active");
          refreshData();
          startAdminLiveRefresh();
        })();
      }


