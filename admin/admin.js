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
    const res = await fetch(`${safeBase}/health`, { cache: "no-store" });
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
      let cachedGroups = [];
      let cachedDeletedGroups = [];
      let cachedReports = [];
      let cachedSubscriptionRequests = [];
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
      let broadcastChatAttachment = null;
      let broadcastChatSending = false;
      let broadcastChatClientRequestId = "";
      let broadcastChatEmojiPickerOpen = false;
      let broadcastChatAttachmentViewerMode = "sent";
      let broadcastChatAttachmentViewerAttachment = null;
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

        if (
          String(question?.type || "").toLowerCase() === "combo" &&
          typeof rawCorrect === "string"
        ) {
          const comboIndex = COMBO_OPTIONS.findIndex(
            (opt) => opt.letter === rawCorrect.trim().toUpperCase(),
          );
          if (comboIndex >= 0) return comboIndex;
        }

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

        root.addEventListener("pointerdown", onPointerDown);
        root.addEventListener("pointermove", onPointerMove);
        root.addEventListener("pointerup", onPointerUp);
        root.addEventListener("pointercancel", onPointerCancel);

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
            <button type="button" class="broadcast-chat-attachment-remove" data-broadcast-chat-remove-attachment aria-label="Remove attachment" title="Remove attachment">×</button>
          `;
        }
        return `
          <div class="broadcast-chat-attachment-file">F</div>
          <div class="broadcast-chat-attachment-meta">
            <div class="broadcast-chat-attachment-name-text">${safeFileName}</div>
            <div class="broadcast-chat-attachment-type-text">${safeMimeType}</div>
          </div>
          <button type="button" class="broadcast-chat-attachment-remove" data-broadcast-chat-remove-attachment aria-label="Remove attachment" title="Remove attachment">×</button>
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
            <button type="button" class="broadcast-chat-attachment-remove" data-broadcast-chat-remove-attachment aria-label="Remove attachment" title="Remove attachment">×</button>
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

      function getUserPrimaryLabel(user = {}, fallback = "") {
        return String(
          user?.username ||
            user?.userName ||
            user?.contact ||
            fallback ||
            "",
        ).trim();
      }

      function getUserSecondaryLabel(user = {}) {
        return String(user?.name || user?.fullName || user?.displayName || "").trim();
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

      function getMonetizationBucket(request = {}) {
        const requestStatus = String(request?.status || "").trim().toLowerCase();
        const userStatus = String(
          request?.user?.subscriptionAccess?.status ||
            request?.user?.subscriptionStatus ||
            "",
        )
          .trim()
          .toLowerCase();
        const expirationAt = String(
          request?.user?.subscriptionAccess?.expirationAt ||
            request?.user?.subscriptionExpirationAt ||
            request?.user?.subscriptionEndsAt ||
            request?.expirationAt ||
            "",
        ).trim();
        const expirationTime = expirationAt ? Date.parse(expirationAt) : NaN;
        const isExpiredByDate = Number.isFinite(expirationTime) && expirationTime <= Date.now();

        if (requestStatus === "rejected") {
          return "rejected";
        }
        if (requestStatus === "expired" || userStatus === "expired" || isExpiredByDate) {
          return "expired";
        }
        if (["approved", "active"].includes(requestStatus) || ["active", "trial"].includes(userStatus)) {
          return "activated";
        }
        if (requestStatus === "pending" || userStatus === "pending") {
          return "request";
        }
        if (userStatus === "rejected") {
          return "rejected";
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
            rowLabels: ["Name", "Subscription Type", "Amount", "Contact", "Requested", "View"],
          },
          activated: {
            title: "Activated subscriptions",
            empty: "No activated subscriptions yet.",
            rowColumns: "minmax(0, 1.05fr) minmax(0, 1fr) minmax(0, 0.8fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) auto",
            rowLabels: ["Name", "Subscription Type", "Amount", "Contact", "Activated", "Expires", "View"],
          },
          rejected: {
            title: "Rejected requests",
            empty: "No rejected subscription requests yet.",
            rowColumns: "minmax(180px, 1.25fr) minmax(170px, 1.1fr) minmax(120px, 0.9fr) minmax(180px, 1.1fr) minmax(180px, 1fr) minmax(220px, 1.2fr) auto",
            rowLabels: ["Name", "Subscription Type", "Amount", "Contact", "Rejected", "Reason", "View"],
          },
          expired: {
            title: "Expired access",
            empty: "No expired subscriptions yet.",
            rowColumns: "minmax(0, 1.15fr) minmax(0, 1fr) minmax(0, 0.8fr) minmax(0, 1.1fr) minmax(0, 1fr) minmax(0, 1fr) auto",
            rowLabels: ["Name", "Subscription Type", "Amount", "Contact", "Activated", "Expired", "View"],
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
        return getUserPrimaryLabel(request?.user || request, "Subscription request") || "Subscription request";
      }

      function getMonetizationRequestSecondaryName(request = {}) {
        const secondary = getUserSecondaryLabel(request?.user || request);
        const primary = getMonetizationRequestTitle(request);
        if (!secondary || secondary.toLowerCase() === primary.toLowerCase()) {
          return "";
        }
        return secondary;
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
            request?.user?.subscriptionAccess?.expirationAt ||
              request?.user?.subscriptionExpirationAt ||
              request?.user?.subscriptionEndsAt ||
              request?.reviewDeadlineAt,
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
          request?.user?.subscriptionAccess?.expirationAt ||
            request?.user?.subscriptionExpirationAt ||
            request?.user?.subscriptionEndsAt ||
            request?.reviewDeadlineAt,
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
            request?.user?.subscriptionAccess?.expirationAt ||
              request?.user?.subscriptionExpirationAt ||
              request?.user?.subscriptionEndsAt ||
              request?.reviewDeadlineAt ||
              request?.requestedAt ||
              0,
          );
        }
        return Date.parse(request?.requestedAt || 0);
      }

      function toggleMonetizationSortDirection() {
        monetizationSortDirection = monetizationSortDirection === "desc" ? "asc" : "desc";
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
                    return `<th>${escapeHtml(label)}</th>`;
                  }
                  return `
                    <th>
                      <span class="monetization-header-date">
                        <span>${escapeHtml(label)}</span>
                        <button
                          type="button"
                          class="monetization-sort-toggle"
                          data-action="toggle-monetization-sort"
                          aria-label="Toggle date sort"
                          title="${monetizationSortDirection === "desc" ? "Newest first" : "Oldest first"}"
                        >↕</button>
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
        const titlePrimary = getMonetizationRequestTitle(request);
        const titleSecondary = getMonetizationRequestSecondaryName(request);
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
          ? `<button type="button" class="monetization-proof-chip" data-action="open-proof-image" data-request-id="${safeId}" data-proof-url="${escapeHtml(request.proofDataUrl)}" data-proof-title="${escapeHtml(titlePrimary)}">
              <img src="${escapeHtml(request.proofDataUrl)}" alt="${escapeHtml(titlePrimary)} proof preview" />
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
              <div class="monetization-cell-value">${renderIdentityStack(titlePrimary, titleSecondary, "Subscription request")}</div>
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
            <td data-label="View">
              <button
                type="button"
                class="btn-small"
                data-action="view-subscription-request"
                data-request-id="${safeId}"
              >View</button>
            </td>
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
        const titlePrimary = getMonetizationRequestTitle(request);
        const titleSecondary = getMonetizationRequestSecondaryName(request);
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
                data-proof-title="${escapeHtml(titlePrimary)}"
                style="width: 100%; justify-content: center; border-radius: 18px; padding: 12px 14px;"
              >
                <img src="${escapeHtml(proofUrl)}" alt="${escapeHtml(titlePrimary)} proof preview" />
                <span>${proofFileName} · ${proofMimeType}</span>
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
              <div><strong>Name:</strong> ${renderIdentityStack(titlePrimary, titleSecondary, "Subscription request")}</div>
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
        const titlePrimary = getMonetizationRequestTitle(request);
        const titleSecondary = getMonetizationRequestSecondaryName(request);
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
              data-proof-title="${escapeHtml(titlePrimary)}"
            >
              <img src="${escapeHtml(proofUrl)}" alt="${escapeHtml(titlePrimary)} proof preview" />
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
              <div class="subscription-detail-meta">${renderIdentityStack(titlePrimary, titleSecondary, "Subscription request")} · ${contact}</div>
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
        renderMonetizationPanel();
      }

      function renderMonetizationPanel() {
        const root = document.getElementById("monetization-list-root");
        if (!root) return;

        const counts = {
          request: cachedSubscriptionRequests.filter((entry) => getMonetizationBucket(entry) === "request").length,
          activated: cachedSubscriptionRequests.filter((entry) => getMonetizationBucket(entry) === "activated").length,
          rejected: cachedSubscriptionRequests.filter((entry) => getMonetizationBucket(entry) === "rejected").length,
          expired: cachedSubscriptionRequests.filter((entry) => getMonetizationBucket(entry) === "expired").length,
        };

        const updateCount = (id, value) => {
          const el = document.getElementById(id);
          if (el) el.textContent = String(value);
        };
        updateCount("monetization-request-count", counts.request);
        updateCount("monetization-activated-count", counts.activated);
        updateCount("monetization-rejected-count", counts.rejected);
        updateCount("monetization-expired-count", counts.expired);

        const bucket = selectedMonetizationBucket;
        const meta = getMonetizationBucketMeta(bucket);
        const sortMultiplier = monetizationSortDirection === "asc" ? 1 : -1;
        const items = cachedSubscriptionRequests
          .filter((entry) => getMonetizationBucket(entry) === bucket)
          .sort((a, b) => {
            const aValue = getMonetizationRequestSortTimestamp(a, bucket);
            const bValue = getMonetizationRequestSortTimestamp(b, bucket);
            if (aValue !== bValue) return (aValue - bValue) * sortMultiplier;
            return getMonetizationRequestTitle(a).localeCompare(getMonetizationRequestTitle(b));
          });
        const filteredItems = items.filter((entry) => matchesMonetizationSearch(entry, monetizationSearchQuery));
        const bucketTotal = getMonetizationBucketTotalAmount(bucket);

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
          summaryCount.innerHTML = `Showing <strong>${filteredItems.length}</strong> ${summaryLabel}`;
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
        const columnCount = bucket === "activated" || bucket === "rejected" || bucket === "expired" ? 7 : 6;
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
        `;
      }

      async function loadMonetizationRequests() {
        try {
          const res = await fetch(withNoCache(`${API_BASE}/admin/subscription-requests`), {
            headers: getHeaders(),
            cache: "no-store",
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !Array.isArray(data.requests)) {
            throw new Error(data.error || "Failed to load subscription requests");
          }

          cachedSubscriptionRequests = data.requests;
          subscriptionRequestsLoaded = true;
          renderMonetizationPanel();
          return true;
        } catch (err) {
          console.error("Failed to load subscription requests:", err);
          showAlert("monetization-alerts", "Failed to load subscription requests", "error");
          return false;
        }
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
        const status = String(request?.status || "pending").trim().toLowerCase();
        if (["pending", "sent", "resolved", "expired", "cancelled"].includes(status)) {
          return status;
        }
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
        if (!contact || !code) return "";

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
        const contactMarkup = status === "sent"
          ? `<span class="password-reset-contact-link is-muted">${escapeHtml(contact)}</span>`
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
          badge.textContent = String(pendingCount);
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
        try {
          const res = await fetch(withNoCache(`${API_BASE}/admin/password-reset-requests`), {
            headers: getHeaders(),
            cache: "no-store",
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !Array.isArray(data.requests)) {
            throw new Error(data.error || "Failed to load password reset requests");
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
        if (title) title.textContent = `${getMonetizationRequestTitle(request)} • ${request.planLabel || request.plan || "Subscription"}`;
        if (subtitle) subtitle.textContent = `${getMonetizationRequestContact(request)} • ${formatDate(request.requestedAt)}`;
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
        const titlePrimary = getMonetizationRequestTitle(request);
        const titleSecondary = getMonetizationRequestSecondaryName(request);
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
              data-proof-title="${escapeHtml(titlePrimary)}"
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
              <div class="subscription-approval-value">${renderIdentityStack(titlePrimary, titleSecondary, "Subscription request")}</div>
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
        if (subtitle) subtitle.textContent = `${getMonetizationRequestTitle(request)} · ${request.planLabel || request.plan || "Subscription"}`;
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
        const studentPrimary = getMonetizationRequestTitle(request);
        const studentSecondary = getMonetizationRequestSecondaryName(request);
        const contact = getMonetizationRequestContact(request);
        const plan = String(request.planLabel || request.plan || "Subscription").trim();
        const amount = getMonetizationRequestAmount(request);
        const amountText = amount ? `GHS ${amount}` : "GHS --";
        const requestedAt = formatDate(request.requestedAt);
        return `
          <div><strong>Student:</strong> ${renderIdentityStack(studentPrimary, studentSecondary, "Subscription request")}</div>
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
          await loadMonetizationRequests();
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

      function buildUserDetailsHtml(user) {
        const profileImage = String(user?.profileImage || "").trim();
        const initials = String(user?.name || user?.username || "U")
          .trim()
          .slice(0, 2)
          .toUpperCase() || "U";
        const avatarMarkup = profileImage
          ? `<img class="user-detail-avatar" src="${escapeHtml(profileImage)}" alt="Avatar of ${escapeHtml(displayValue(user?.username))}" loading="lazy" referrerpolicy="no-referrer" />`
          : `<span class="user-detail-avatar-fallback">${escapeHtml(initials)}</span>`;

        return `
          <div class="user-details-hero">
            ${avatarMarkup}
            <div>
              <div class="user-details-name">${escapeHtml(displayValue(user?.name || user?.username))}</div>
              <div class="user-details-subtitle">
                <div><strong>Username:</strong> ${escapeHtml(displayValue(user?.username))}</div>
                <div><strong>User ID:</strong> ${escapeHtml(displayValue(user?.id))}</div>
              </div>
            </div>
          </div>
          <div class="user-details-grid">
            ${renderDetailItem("Full name", user?.name)}
            ${renderDetailItem("Title", user?.title)}
            ${renderDetailItem("First name", user?.firstName)}
            ${renderDetailItem("Last name", user?.lastName)}
            ${renderDetailItem("Surname", user?.surname)}
            ${renderDetailItem("Username", user?.username)}
            ${renderDetailItem("Contact", user?.contact)}
            ${renderDetailItem("Contact type", user?.contactType)}
            ${renderDetailItem("Email", user?.email)}
            ${renderDetailItem("Role", user?.role)}
            ${renderDetailItem("Subscription tier", user?.subscriptionTier)}
            ${renderDetailItem("Professional type", user?.professionalType)}
            ${renderDetailItem("Country", user?.country)}
            ${renderDetailItem("Institution", user?.institution)}
            ${renderDetailItem("Bio", user?.bio)}
            ${renderDetailItem("Points", user?.points)}
            ${renderDetailItem("Created at", formatDate(user?.createdAt))}
            ${renderDetailItem("Updated at", formatDate(user?.updatedAt))}
            ${renderDetailItem("Last seen at", formatDate(user?.lastSeenAt))}
            ${renderDetailItem("Deactivated at", formatDate(user?.deactivatedAt))}
            ${renderDetailItem("Deactivated until", formatDate(user?.deactivatedUntil))}
          </div>
          ${buildPrivacySummaryHtml(user?.privacy)}
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

      function buildGroupDetailsHtml(group) {
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
          <div class="group-details-hero">
            ${avatarMarkup}
            <div>
              <div class="group-details-name">${escapeHtml(displayValue(group?.name))}</div>
              <div class="group-details-subtitle">
                <div><strong>Owner:</strong> ${renderIdentityStack(group?.ownerUsername, group?.ownerName, "Unknown owner")}</div>
                <div><strong>Group ID:</strong> ${escapeHtml(displayValue(group?.id))}</div>
              </div>
            </div>
          </div>
          <div class="group-details-grid">
            ${renderDetailItem("Owner username", group?.ownerUsername)}
            ${renderDetailItem("Members", group?.memberCount)}
            ${renderDetailItem("Admins", group?.adminCount)}
            ${renderDetailItem("Created", formatDate(group?.createdAt))}
            ${renderDetailItem("Updated", formatDate(group?.updatedAt))}
            ${renderDetailItem("Invite expiry", formatDate(group?.inviteExpiresAt))}
            ${renderDetailItem("Description", group?.bio)}
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
                        return `
                          <div class="group-member-row">
                            ${
                              memberAvatar
                                ? `<img class="group-member-avatar" src="${escapeHtml(memberAvatar)}" alt="Avatar of ${escapeHtml(displayValue(member?.name || member?.username))}" loading="lazy" referrerpolicy="no-referrer" />`
                                : `<span class="group-member-avatar-fallback">${escapeHtml(memberInitials)}</span>`
                            }
                            <div>
                              <div class="group-member-name">${renderIdentityStack(member?.username, member?.name, "Member")}</div>
                              <div class="group-member-meta">@${escapeHtml(displayValue(member?.username))} • ${escapeHtml(displayValue(member?.country || member?.institution || "Member"))}</div>
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

      function buildReportDetailsHtml(report) {
        const reporterUsername = displayValue(report?.reporter?.username || report?.reporterUsername || report?.reporterName);
        const reporterName = displayValue(report?.reporter?.name || report?.reporterName);
        const targetUsername = displayValue(report?.target?.username || report?.targetUsername || report?.targetName);
        const targetName = displayValue(report?.target?.name || report?.targetName);
        const targetType = String(report?.type || "").trim().toLowerCase() === "group" ? "Group" : "User";
        const status = String(report?.status || "open").trim();
        return `
          <div class="report-details-grid">
            ${renderDetailItem("Type", targetType)}
            ${renderDetailItem("Reporter", renderIdentityStack(reporterUsername, reporterName, "Unknown reporter"))}
            ${renderDetailItem("Target", renderIdentityStack(targetUsername, targetName, "Unknown target"))}
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
                        <div class="group-member-meta">Owner: ${escapeHtml(displayValue(report?.target?.ownerName || report?.target?.ownerUsername))} • ${escapeHtml(String(report?.target?.memberCount || 0))} members</div>
                      </div>
                      <div class="group-member-role">${escapeHtml(status)}</div>
                    </div>
                  </div>
                </div>`
              : ""
          }
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
          const targetLabel = String(report?.type || "").toLowerCase() === "group" ? "Group" : "User";
          const safeType = escapeHtml(targetLabel);
          const safeReporter = escapeHtml(displayValue(report.reporterName || report.reporter?.name));
          const safeTarget = escapeHtml(displayValue(report.targetName || report.target?.name || report.targetUsername || report.target?.username));
          const safeReportedAt = escapeHtml(formatDate(report.createdAt));
          const safeStatus = escapeHtml(displayValue(report.status || "open"));
          row.innerHTML = `
            <td>${safeType}</td>
            <td class="cell-wrap">${safeReporter}</td>
            <td class="cell-wrap">${safeTarget}</td>
            <td>${safeReportedAt}</td>
            <td>${safeStatus}</td>
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

      function showAdminNotificationBanner(message = "") {
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
        adminNotificationBannerHideTimer = window.setTimeout(() => {
          hideAdminNotificationBanner();
        }, 5000);
      }

      function maybeShowAdminReportsBanner(reports = []) {
        const reportsTabEl = document.getElementById("reports");
        if (reportsTabEl?.classList.contains("active")) {
          hideAdminNotificationBanner();
          return;
        }
        const totalReports = Array.isArray(reports) ? reports.length : 0;
        if (totalReports <= 0) {
          hideAdminNotificationBanner();
          return;
        }
        const groupReports = reports.filter(
          (report) => String(report?.type || "").trim().toLowerCase() === "group",
        ).length;
        const userReports = reports.filter(
          (report) => String(report?.type || "").trim().toLowerCase() === "user",
        ).length;
        const signature = `${totalReports}:${groupReports}:${userReports}`;
        try {
          if (sessionStorage.getItem(ADMIN_NOTIFICATION_BANNER_STORAGE_KEY) === signature) {
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
          const res = await fetch(`${API_BASE}/admin/stats`, {
            headers: getHeaders(),
            cache: "no-store",
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

        await ensureAdminApiBase();

        const [statsOk, usersOk, deletedUsersOk, deletedGroupsOk, groupsOk, reportsOk, questionsOk, exportOk, broadcastOk, monetizationOk, passwordResetOk] = await Promise.all([
          loadStats(),
          loadUsers(),
          loadDeletedUsers(),
          loadDeletedGroups(),
          loadGroups(),
          loadReports(),
          loadQuestions(),
          loadExportData(),
          loadBroadcastOverview(),
          loadMonetizationRequests(),
          loadPasswordResetRequests(),
        ]);

        if (statsOk && usersOk && deletedUsersOk && deletedGroupsOk && groupsOk && reportsOk && questionsOk && exportOk && broadcastOk && monetizationOk && passwordResetOk) {
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
            <path d="${primaryPath}" fill="none" stroke="${primaryColor}" stroke-width="3.25" stroke-linecap="round" stroke-linejoin="round" />
            <path d="${secondaryPath}" fill="none" stroke="${secondaryColor}" stroke-width="3.25" stroke-linecap="round" stroke-linejoin="round" />
            ${primary.map((value, index) => {
              const cx = paddingX + index * xStep;
              const cy = yFor(value);
              return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="3.25" fill="${primaryColor}" />`;
            }).join("")}
            ${secondary.map((value, index) => {
              const cx = paddingX + index * xStep;
              const cy = yFor(value);
              return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="3.25" fill="${secondaryColor}" />`;
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

      async function loadStats({ silent = false } = {}) {
        try {
          const res = await fetch(withNoCache(`${API_BASE}/admin/stats`), {
            headers: getHeaders(),
            cache: "no-store",
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || `Failed to load stats (${res.status})`);
          }
          const data = await res.json();
          cachedAdminStats = data;

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
            const reportCount = Number(data.totalReports ?? 0) || 0;
            reportsTabBadge.textContent = String(reportCount);
            reportsTabBadge.classList.add("hidden");
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

          renderAdminAnalyticsPanel();
          return true;
        } catch (err) {
          console.error("Failed to load stats:", err);
          if (!silent) showAlert("stats-alerts", "Failed to load statistics", "error");
          return false;
        }
      }

      window.setInterval(() => {
        if (adminActiveTab === "analytics") {
          void loadStats({ silent: true });
        }
      }, 30000);

      async function loadUsers() {
        try {
          const res = await fetch(withNoCache(`${API_BASE}/admin/users`), {
            headers: getHeaders(),
            cache: "no-store",
          });
          const data = await res.json();
          if (!res.ok || !Array.isArray(data.users)) {
            throw new Error(data.error || "Failed to load users");
          }

          cachedUsers = data.users;
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
          renderReportsTable();
          maybeShowAdminReportsBanner(cachedReports);
          return true;
        } catch (err) {
          console.error("Failed to load reports:", err);
          showAlert("reports-alerts", "Failed to load reports", "error");
          return false;
        }
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
          const res = await fetch(withNoCache(`${API_BASE}/admin/stats`), {
            headers: getHeaders(),
            cache: "no-store",
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

      async function openReportDetailsModal(reportId) {
        const safeReportId = String(reportId || "").trim();
        if (!safeReportId) return;
        try {
          hideAdminNotificationBanner();
          const res = await fetch(withNoCache(`${API_BASE}/admin/reports/${encodeURIComponent(safeReportId)}`), {
            headers: getHeaders(),
            cache: "no-store",
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data?.report) {
            throw new Error(data.error || "Report details could not be loaded");
          }
          selectedReportId = safeReportId;
          const report = data.report;
          selectedReportSnapshot = report;
          document.getElementById("report-details-body").innerHTML = buildReportDetailsHtml(report);
          document.getElementById("report-details-modal")?.classList.add("active");
          const presetEl = document.getElementById("report-warning-preset");
          const messageEl = document.getElementById("report-warning-message");
          if (presetEl && messageEl) {
            presetEl.value = normalizeReportWarningTitle(report.warningPreset || "Community rules reminder");
            selectedReportWarningDraft =
              report.warningMessage || buildReportWarningBody(report, presetEl.value || "Community rules reminder");
            messageEl.value = selectedReportWarningDraft;
          }
          syncReportWarningMessagePreset();
        } catch (err) {
          showAlert("reports-alerts", "Failed to load report details: " + err.message, "error");
        }
      }

      async function warnSelectedReport() {
        if (!selectedReportId) return;
        const presetEl = document.getElementById("report-warning-preset");
        const messageEl = document.getElementById("report-warning-message");
        const preset = normalizeReportWarningTitle(presetEl?.value || "");
        const message = String(messageEl?.value || "").trim();
        const finalMessage = message || buildReportWarningBody(selectedReportSnapshot || {}, preset);
        if (!finalMessage) {
          showAlert("reports-alerts", "Choose a warning message first", "error");
          return;
        }
        try {
          const res = await fetch(`${API_BASE}/admin/reports/${encodeURIComponent(selectedReportId)}/warn`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({
              preset,
              message: finalMessage,
            }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data?.report) {
            throw new Error(data.error || "Failed to send warning");
          }
          cachedReports = cachedReports.map((entry) =>
            String(entry?.id || "") === String(selectedReportId || "")
              ? data.report
              : entry,
          );
          selectedReportSnapshot = data.report;
          selectedReportWarningDraft = data.report.warningMessage || finalMessage;
          document.getElementById("report-details-body").innerHTML = buildReportDetailsHtml(data.report);
          document.getElementById("report-warning-message").value = data.report.warningMessage || finalMessage;
          showAlert("reports-alerts", "Warning sent successfully", "success");
          renderReportsTable();
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

      function getActiveBroadcastThreadKey() {
        if (selectedBroadcastThreadKey && getBroadcastThreadSummary(selectedBroadcastThreadKey)) {
          return selectedBroadcastThreadKey;
        }
        return "";
      }

      function syncBroadcastThreadUi() {
        const mainEl = document.getElementById("broadcast-main");
        const listPanelEl = document.querySelector(".broadcast-thread-list-panel");
        const panelEl = document.getElementById("broadcast-thread-panel");
        const hasSelectedThread = Boolean(selectedBroadcastThreadKey && getBroadcastThreadSummary(selectedBroadcastThreadKey));
        const isDesktop = window.matchMedia("(min-width: 769px)").matches;
        const shouldShowThreadPanel = isDesktop || (broadcastThreadOpen && hasSelectedThread);
        const shouldShowListPanel = isDesktop || !shouldShowThreadPanel;
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
                <div class="broadcast-attachment-viewer-file-icon">⤓</div>
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
                <div class="broadcast-attachment-viewer-file-icon">⧉</div>
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
            return `
              <button type="button" class="broadcast-thread-row${activeClass}" data-thread-key="${escapeHtml(thread.threadKey)}">
                ${badgeMarkup}
                <div class="broadcast-thread-row-body">
                  <div class="broadcast-thread-row-head">
                    <div class="broadcast-thread-row-title">${escapeHtml(title)}</div>
                    <div class="broadcast-thread-row-time">${escapeHtml(time)}</div>
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
        subtitleEl.textContent = summary.subtitle || "Admin notice";

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
            return `
              <div class="broadcast-message-row">
                <div class="broadcast-message-bubble">
                  <div class="broadcast-message-meta">
                    ${senderMarkup}
                    <span>${escapeHtml(metaTime)}</span>
                  </div>
                  <div class="broadcast-message-text">${escapeHtml(text || "Attachment only message")}</div>
                  ${attachmentHtml ? `<div class="broadcast-message-attachment">${attachmentHtml}</div>` : ""}
                </div>
              </div>
            `;
          })
          .join("");
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
        try {
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
          const res = await fetch(`${API_BASE}/admin/broadcast/overview`, {
            headers: getHeaders(),
            cache: "no-store",
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(data.error || "Failed to load broadcast inbox");
          }
          cachedBroadcastThreads = Array.isArray(data.threads) ? data.threads : [];
          cachedBroadcastStatuses = Array.isArray(data.statuses) ? data.statuses : [];
          broadcastOverviewLoaded = true;
          if (!getBroadcastThreadSummary(selectedBroadcastThreadKey)) {
            selectedBroadcastThreadKey = "";
          }
          renderBroadcastOverview();
          if (broadcastThreadOpen && selectedBroadcastThreadKey) {
            await loadBroadcastThreadDetail(selectedBroadcastThreadKey);
          }
          return true;
        } catch (err) {
          broadcastOverviewLoaded = true;
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
          cachedBroadcastThreadDetail.set(safeThreadKey, {
            thread: data.thread || null,
            batches: Array.isArray(data.batches) ? data.batches : [],
          });
          if (safeThreadKey === getActiveBroadcastThreadKey()) {
            renderBroadcastThreadMessages();
          }
          return true;
        } catch (err) {
          showAlert("broadcast-alerts", "Error: " + err.message, "error");
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
          const fileInput = document.getElementById("broadcast-chat-file");
          if (fileInput) fileInput.value = "";
          syncBroadcastAttachmentUi("chat");
          setBroadcastChatEmojiPickerOpen(false);
          await Promise.all([
            loadBroadcastOverview(),
            loadBroadcastThreadDetail(threadKey),
          ]);
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

      function openUserDetailsModal(userId) {
        closeDeleteUserConfirmModal();
        const user = getUserById(userId);
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
        if (requestedTab === "groups" && groupsLoaded) {
          renderGroupsTable();
        }
        if (requestedTab === "reports" && reportsLoaded) {
          hideAdminNotificationBanner();
          reportsTabBadge?.classList.add("hidden");
          renderReportsTable();
        }
        if (requestedTab === "broadcast") {
          if (broadcastOverviewLoaded) {
            renderBroadcastOverview();
          } else {
            void loadBroadcastOverview();
          }
        }
        if (requestedTab === "monetization") {
          if (subscriptionRequestsLoaded) {
            renderMonetizationPanel();
          } else {
            void loadMonetizationRequests();
          }
        }
        if (requestedTab === "analytics") {
          if (cachedAdminStats) {
            renderAdminAnalyticsPanel();
          }
          void loadStats({ silent: Boolean(cachedAdminStats) });
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
        hideAdminNotificationBanner();
        document.getElementById("reports-tab-badge")?.classList.add("hidden");
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
        showAlert(
          "settings-alerts",
          "System reset is disabled in this build.",
          "info",
        );
        return;
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

      function enableTableDragScroll() {
        // Native overflow scrolling now handles touch drag reliably on mobile.
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
          .getElementById("user-details-delete-btn")
          ?.addEventListener("click", openDeleteUserConfirmModal);
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
          .getElementById("group-details-archive-btn")
          ?.addEventListener("click", () => {
            void archiveGroup(selectedGroupId || "");
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
          .getElementById("report-warning-send-btn")
          ?.addEventListener("click", warnSelectedReport);
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
          });
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
          document.getElementById("login-screen").style.display = "none";
          document.getElementById("dashboard").classList.add("active");
          refreshData();
        })();
      }
