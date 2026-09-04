
(function(){
  const STORAGE_KEY = 'ajix-news-saved-state-v1';
  const READ_KEY = 'ajix-news-read-counts-v1';
  const THEME_KEY = 'ajix-news-theme-v1';
  const backBtn = document.querySelector('.nav-back-btn');
  const searchToggleBtn = document.querySelector('.nav-search-toggle');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const footerSheetBackdrop = document.getElementById('footer-sheet-backdrop');
  const footerSheet = document.getElementById('footer-sheet');
  const footerSheetCloseBtn = document.getElementById('footer-sheet-close');
  const footerSheetTitle = document.getElementById('footer-sheet-title');
  const footerSheetBody = document.getElementById('footer-sheet-body');
  const footerSheetLinks = Array.from(document.querySelectorAll('[data-footer-topic]'));
  const desktopSearchInput = document.querySelector('.nav-search input');
  const mobileSearchPanel = document.getElementById('mobile-search-panel');
  const mobileSearchInput = document.getElementById('mobile-search-input');
  const mobileSearchCloseBtn = document.getElementById('mobile-search-close');
  const dashboardToggleBtn = document.getElementById('mobile-dashboard-toggle');
  const mobileDashboardPanel = document.getElementById('mobile-dashboard-panel');
  const mobileDashboardBackdrop = document.getElementById('mobile-dashboard-backdrop');
  const mobileDashboardCloseBtn = document.getElementById('mobile-dashboard-close');
  const dashboardItems = Array.from(document.querySelectorAll('[data-dashboard-item]'));
  const filterControls = Array.from(document.querySelectorAll('.sidebar-item[data-news-filter], .nav-icon-btn[data-news-filter], .topic-tag[data-news-filter]'));
  const latestFilterControls = Array.from(document.querySelectorAll('.filter-chip[data-latest-filter]'));
  const topicControls = Array.from(document.querySelectorAll('.topic-tag[data-news-filter]'));
  const countTargets = Array.from(document.querySelectorAll('[data-news-count]'));
  const medicineViewToggle = document.getElementById('medicine-view-toggle');
  const medicineList = document.getElementById('medicine-list');
  const mainContent = document.querySelector('.main-content');
  const sidebarRight = document.querySelector('.sidebar-right');
  const popularStoryPanel = document.querySelector('.hero-side[data-news-feed-slot="popular-stories"]');
  const popularStorySlots = Array.from(document.querySelectorAll('.hero-side .side-card'));
  const latestGrid = document.querySelector('.article-grid[data-news-feed-slot="latest"]');
  const trendingWidget = document.querySelector('.widget[data-news-feed-slot="trending-now"]');
  const contentSelectors = '.hero-slide, .side-card, .article-card, .list-item, .trending-item';
  const contentItems = Array.from(document.querySelectorAll(contentSelectors));
  const POPULAR_STORY_LIMIT = 3;
  const LATEST_STORY_LIMIT = 10;
  const MEDICINE_PAGE_SIZE = 10;
  let medicineFeedItems = [];
  let medicineRenderedCount = 0;
  const heroCarousel = document.querySelector('.hero-main');
  const heroSlides = Array.from(document.querySelectorAll('.hero-slide'));
  const heroPrevBtn = document.getElementById('hero-carousel-prev');
  const heroNextBtn = document.getElementById('hero-carousel-next');
  let heroSlideIndex = 0;
  let heroTimer = null;
  let currentFilter = 'all';
  let currentLatestFilter = 'all';
  const NEWS_FEED_SLOTS = Object.freeze({
    popularStories: 'popular-stories',
    latest: 'latest',
    medicine: 'medicine',
    trendingNow: 'trending-now',
  });
  let currentQuery = '';
  let savedState = loadSavedState();
  let readCounts = loadReadCounts();
  let newsLockStateEl = null;

  hideUnusedRecords(contentItems);

  const popularitySeeds = {
    'FDA approves novel oral GLP-1 drug for type 2 diabetes in landmark decision': { reads: 9600, likes: 640 },
    'WHO updates pandemic preparedness guidance as new variants spread': { reads: 9100, likes: 610 },
    'AI model predicts drug interactions with 94% accuracy in clinical validation': { reads: 8700, likes: 590 },
    'New antibiotic class shows promise against resistant superbugs': { reads: 7400, likes: 470 },
    'Mediterranean diet scores another win for cognitive decline prevention': { reads: 7100, likes: 450 },
    'Pharmacists warn of shortages in common blood pressure medications': { reads: 6800, likes: 430 },
    'Pfizer announces Phase II results for next-gen pneumococcal vaccine': { reads: 5900, likes: 380 },
    'High-intensity interval training reduces all-cause mortality by 15%': { reads: 5600, likes: 340 },
    'Gene therapy restores hearing in children with congenital deafness': { reads: 5300, likes: 320 },
    'Updated RSV vaccine guidance expands protection for older adults': { reads: 5100, likes: 300 },
    'Digital CBT program shows sustained benefit for adolescent anxiety': { reads: 4700, likes: 280 },
    'Liquid biopsy flags colorectal cancer recurrence earlier than scans': { reads: 4500, likes: 260 },
    'WHO updates pandemic preparedness guidelines for 2026': { reads: 9400, likes: 620 },
    'CRISPR therapy achieves sustained remission in sickle cell trial': { reads: 9000, likes: 600 },
    'Sleep quality linked to cardiovascular risk in new 10-year study': { reads: 8500, likes: 560 },
  };

  const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);
  const NEWS_THEME_BY_CATEGORY = {
    medicine: {
      label: 'Medicine',
      heroClass: 'hero-slide--medicine',
      cardClass: 'art-medicine',
      accent: '#2563eb',
      badge: 'BREAKING',
    },
    wellness: {
      label: 'Wellness',
      heroClass: 'hero-slide--medicine',
      cardClass: 'art-wellness',
      accent: '#16a34a',
      badge: 'HEALTH',
    },
    research: {
      label: 'Research',
      heroClass: 'hero-slide--research',
      cardClass: 'art-research',
      accent: '#9333ea',
      badge: 'INSIGHT',
    },
    trending: {
      label: 'Trending',
      heroClass: 'hero-slide--alert',
      cardClass: 'art-alert',
      accent: '#dc2626',
      badge: 'ALERT',
    },
    'clinical-news': {
      label: 'Clinical news',
      heroClass: 'hero-slide--medicine',
      cardClass: 'art-medicine',
      accent: '#2563eb',
      badge: 'BREAKING',
    },
  };
  const NEWS_FALLBACK_ACCENTS = ['#2563eb', '#16a34a', '#9333ea', '#dc2626', '#ea580c', '#0891b2', '#4f46e5'];

  function normalizeApiBase(value = '') {
    return String(value || '').trim().replace(/\/+$/, '');
  }

  function getApiBaseCandidates() {
    const storedApiBase = normalizeApiBase(window.localStorage.getItem('quizApiBase'));
    const currentHost = String(window.location.hostname || '').trim().toLowerCase();
    const currentOrigin = String(window.location.origin || '').trim();
    const sameOriginApiBase = currentOrigin && currentOrigin.startsWith('http')
      ? normalizeApiBase(`${currentOrigin}/api`)
      : '';
    const inferredApiBase = LOOPBACK_HOSTS.has(currentHost)
      ? 'http://127.0.0.1:4000/api'
      : 'https://api.ajixpharmacy.online/api';
    const hostApiBase = currentHost && String(window.location.protocol || '').startsWith('http')
      ? `http://${currentHost}:4000/api`
      : '';

    return Array.from(
      new Set(
        [storedApiBase, sameOriginApiBase, inferredApiBase, hostApiBase, 'http://127.0.0.1:4000/api', 'http://localhost:4000/api']
          .map(normalizeApiBase)
          .filter(Boolean),
      ),
    );
  }

  async function ensureNewsApiBase() {
    const candidates = getApiBaseCandidates();
    for (const candidate of candidates) {
      try {
        const response = await fetch(`${candidate}/health`, { cache: 'no-store' });
        if (response && response.ok) {
          try {
            window.localStorage.setItem('quizApiBase', candidate);
          } catch (error) {
            void error;
          }
          return candidate;
        }
      } catch (error) {
        void error;
      }
    }
    return candidates[0] || '';
  }

  function getNewsTheme(category = '', importance = '') {
    const rawCategory = String(category || '').trim();
    const normalized = rawCategory.toLowerCase();
    if (normalized === 'high' || String(importance || '').trim().toLowerCase() === 'high') {
      return NEWS_THEME_BY_CATEGORY.trending;
    }
    if (NEWS_THEME_BY_CATEGORY[normalized]) {
      return NEWS_THEME_BY_CATEGORY[normalized];
    }
    return {
      label: getNewsCategoryDisplayLabel(rawCategory),
      heroClass: 'hero-slide--medicine',
      cardClass: 'art-medicine',
      accent: getNewsFallbackAccent(rawCategory),
      badge: 'NEWS',
    };
  }

  function getNewsCategoryLabel(category = '') {
    return getNewsTheme(category).label;
  }

  function getNewsCategoryAccent(category = '', importance = '') {
    return getNewsTheme(category, importance).accent;
  }

  function getNewsCategoryDisplayLabel(category = '') {
    const text = String(category || '').trim();
    if (!text) return 'News';
    return text.replace(/[-_]+/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase());
  }

  function getNewsFallbackAccent(category = '') {
    const seed = String(category || '').trim().toLowerCase();
    if (!seed) return NEWS_FALLBACK_ACCENTS[0];
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    return NEWS_FALLBACK_ACCENTS[Math.abs(hash) % NEWS_FALLBACK_ACCENTS.length];
  }

  function decodeNewsPreviewText(value = '') {
    const raw = String(value || '').trim();
    if (!raw) return '';
    const normalized = raw
      .replace(/\\(?=[<>/])/g, '')
      .replace(/&nbsp;/gi, ' ');
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${normalized}</div>`, 'text/html');
    const text = doc.body?.textContent || '';
    return text.replace(/\s+/g, ' ').trim();
  }

  function getNewsCardExcerpt(item = {}) {
    const summaryText = decodeNewsPreviewText(item.summary || item.excerpt || '');
    if (summaryText) return summaryText;
    const bodyText = decodeNewsPreviewText(item.content || item.body || '');
    if (!bodyText) return 'Preview unavailable.';
    return bodyText.length > 220 ? `${bodyText.slice(0, 217).trimEnd()}...` : bodyText;
  }

  const PUBLIC_NEWS_FEED_CACHE_KEY = 'ajix-news-public-feed-v1';

  function loadCachedPublishedNewsFeed() {
    try {
      const raw = window.localStorage.getItem(PUBLIC_NEWS_FEED_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (error) {
      return null;
    }
  }

  function normalizeNewsStatusValue(value = "") {
  const next = String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (!next) return "pending_review";
  if (next === "draft" || next === "queued" || next === "pending") return "pending_review";
  if (next === "approved" || next === "reviewed") return "approved";
  if (next === "published" || next === "live" || next.startsWith("publish") || next.startsWith("live_")) return "published";
  if (next === "rejected" || next === "rejected_by_admin") return "rejected";
  if (next === "archived" || next === "hidden") return "archived";
  return next;
}

function isPublishedNewsItem(value = "") {
  return normalizeNewsStatusValue(value) === "published";
}

function normalizePublishedNewsFeed(feed = {}) {
    const sourceSections = feed?.sections && typeof feed.sections === 'object' ? feed.sections : {};
    const seen = new Set();
    const items = [];
    const isPublishedItem = (item) => isPublishedNewsItem(item?.status || '');
    const pushItem = (item) => {
      if (!item || typeof item !== 'object') return;
      if (!isPublishedItem(item)) return;
      const identity = String(item.id || item.storyKey || item.slug || item.title || '').trim().toLowerCase();
      const fingerprint = identity || String(item.title || item.publishedAt || item.updatedAt || '').trim().toLowerCase();
      if (!fingerprint || seen.has(fingerprint)) return;
      seen.add(fingerprint);
      items.push({ ...item });
    };

    const rawItems = Array.isArray(feed?.items) ? feed.items : [];
    rawItems.forEach(pushItem);
    if (!items.length) {
      ['hero', 'latest', 'medicine', 'trendingNow'].forEach((sectionName) => {
        const sectionItems = Array.isArray(sourceSections[sectionName]) ? sourceSections[sectionName] : [];
        sectionItems.forEach(pushItem);
      });
    }

    const normalizedItems = items;
    const normalizeSectionItems = (sectionName, fallback = []) => {
      const sectionItems = Array.isArray(sourceSections[sectionName])
        ? sourceSections[sectionName].filter(isPublishedItem).map((item) => ({ ...item }))
        : [];
      return sectionItems.length ? sectionItems : fallback;
    };

    const normalizedSections = {
      hero: normalizeSectionItems('hero', normalizedItems.slice(0, 3)),
      latest: normalizeSectionItems('latest', normalizedItems.slice(0, 4)),
      medicine: normalizeSectionItems('medicine', normalizedItems),
      trendingNow: normalizeSectionItems('trendingNow', normalizedItems),
    };

    return {
      ...feed,
      ok: feed?.ok !== false,
      total: normalizedItems.length,
      items: normalizedItems,
      sections: normalizedSections,
    };
  }

  function saveCachedPublishedNewsFeed(feed = {}) {
    try {
      const normalizedFeed = normalizePublishedNewsFeed(feed);
      const items = Array.isArray(normalizedFeed.items) ? normalizedFeed.items : [];
      const publishedItems = items.filter((item) => isPublishedNewsItem(item?.status || ''));
      if (!publishedItems.length) return;
      window.localStorage.setItem(PUBLIC_NEWS_FEED_CACHE_KEY, JSON.stringify({
        ok: true,
        total: publishedItems.length,
        items: publishedItems,
        sections: normalizedFeed.sections && typeof normalizedFeed.sections === 'object' ? normalizedFeed.sections : {},
        cachedAt: new Date().toISOString(),
      }));
    } catch (error) {
      void error;
    }
  }

  function escapeHtml(value = '') {
    return String(value || '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[char]));
  }

  function setNewsShellReady() {
    document.documentElement.setAttribute('data-news-shell', 'ready');
  }

  function hideNewsContentForLock() {
    Array.from(mainContent?.children || []).forEach((child) => {
      if (child === newsLockStateEl) return;
      child.hidden = true;
    });
    if (sidebarRight) {
      sidebarRight.hidden = true;
    }
  }

  function getNewsLockMessage(access = null) {
    const lockedReason = String(access?.lockedReason || '').trim();
    if (lockedReason) return lockedReason;
    if (!window.localStorage.getItem('quizAuthToken')) {
      return 'Sign in and subscribe to unlock the admin-published news feed.';
    }
    return 'Your subscription is not active right now. Renew access to continue reading published stories.';
  }

  function renderNewsLockState(access = null) {
    if (!mainContent) {
      setNewsShellReady();
      return;
    }

    hideNewsContentForLock();

    if (!newsLockStateEl) {
      newsLockStateEl = document.createElement('section');
      newsLockStateEl.className = 'news-lock-state';
      newsLockStateEl.style.margin = '24px 0 32px';
      newsLockStateEl.style.padding = '28px';
      newsLockStateEl.style.border = '1px solid var(--border)';
      newsLockStateEl.style.borderRadius = '24px';
      newsLockStateEl.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.97), rgba(244,247,252,0.98))';
      newsLockStateEl.style.boxShadow = '0 16px 40px rgba(15, 23, 42, 0.08)';
      newsLockStateEl.style.maxWidth = '780px';
      newsLockStateEl.style.display = 'grid';
      newsLockStateEl.style.gap = '14px';
      newsLockStateEl.style.color = 'var(--text-primary)';
      mainContent.prepend(newsLockStateEl);
    }

    newsLockStateEl.hidden = false;
    newsLockStateEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <span style="display:inline-flex;align-items:center;padding:6px 12px;border-radius:999px;background:rgba(37,99,235,0.12);color:var(--accent-blue);font-size:12px;font-weight:700;letter-spacing:0.02em;text-transform:uppercase;">News locked</span>
        <span style="font-size:12px;color:var(--text-tertiary);">Admin-published feed only</span>
      </div>
      <h3 style="margin:0;font-size:24px;line-height:1.15;letter-spacing:-0.02em;">Subscribe to unlock news</h3>
      <p style="margin:0;color:var(--text-secondary);max-width:58ch;">${escapeHtml(getNewsLockMessage(access))}</p>
      <p style="margin:0;color:var(--text-secondary);max-width:58ch;">There is no fallback demo feed on this page. Once your subscription is active, the published admin stories will appear here automatically.</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:4px;">
        <button type="button" id="news-lock-back-btn" style="display:inline-flex;align-items:center;justify-content:center;padding:10px 16px;border-radius:12px;background:var(--text-primary);color:#fff;font-weight:700;box-shadow:0 8px 18px rgba(15,23,42,0.14);">Go back</button>
      </div>
    `;

    const backButton = newsLockStateEl.querySelector('#news-lock-back-btn');
    backButton?.addEventListener('click', () => {
      if (window.history.length > 1) {
        window.history.back();
        return;
      }
      window.location.href = '/';
    });

    setNewsShellReady();
  }

  async function loadNewsSubscriptionAccess() {
    const token = String(window.localStorage.getItem('quizAuthToken') || '').trim();
    if (!token) {
      return {
        isActive: false,
        isLocked: true,
        lockedReason: 'Sign in and subscribe to unlock the admin-published news feed.',
      };
    }

    try {
      const apiBase = await ensureNewsApiBase();
      const response = await fetch(`${apiBase}/subscriptions/me`, {
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      const data = await response.json().catch(() => ({}));
      const access = data?.subscription && typeof data.subscription === 'object'
        ? data.subscription
        : data?.user?.subscriptionAccess && typeof data.user.subscriptionAccess === 'object'
          ? data.user.subscriptionAccess
          : null;
      if (!response.ok || !access) {
        return {
          isActive: false,
          isLocked: true,
          lockedReason: data?.error || 'Your subscription could not be verified. Please sign in again or renew access.',
        };
      }
      return access;
    } catch (error) {
      return {
        isActive: false,
        isLocked: true,
        lockedReason: error?.message || 'Your subscription could not be verified right now.',
      };
    }
  }
  function applyPublishedNewsFeed(feed = {}) {
    const normalizedFeed = normalizePublishedNewsFeed(feed);
    const sections = normalizedFeed.sections || {};
    const allItems = sortNewsByDate(Array.isArray(normalizedFeed?.items) ? normalizedFeed.items : []);
    const heroRecords = getRecordsByClass('hero-slide');
    const heroItems = Array.isArray(sections.hero) && sections.hero.length ? sections.hero : allItems.slice(0, heroRecords.length);
    const latestItems = sortNewsByDate(Array.isArray(sections.latest) && sections.latest.length ? sections.latest : allItems).slice(0, LATEST_STORY_LIMIT);
    const medicineItems = sortNewsByDate(Array.isArray(sections.medicine) && sections.medicine.length ? sections.medicine : allItems);
    const popularItems = sortNewsByPopularity(Array.isArray(sections.popular) && sections.popular.length ? sections.popular : allItems).slice(0, POPULAR_STORY_LIMIT);
    const importantItems = allItems.filter(isImportantNewsItem);
    const trendingItems = sortNewsByPopularity(Array.isArray(sections.trendingNow) && sections.trendingNow.length ? sections.trendingNow.filter(isImportantNewsItem) : importantItems).slice(0, 12);
    heroRecords.forEach((record, index) => {
      const item = heroItems[index];
      if (!item) { hideUnusedRecords([record]); return; }
      revealRecord(record);
      Object.assign(record, updateItemRecordFromFeed(record, item, index));
    });
    replaceGeneratedSection('side-card', popularStoryPanel, popularItems, makeSideCardElement);
    replaceGeneratedSection('article-card', latestGrid, latestItems, makeArticleCardElement);
    replaceGeneratedSection('trending-item', trendingWidget, trendingItems, makeTrendingItemElement);
    medicineFeedItems = medicineItems;
    renderNextMedicineChunk(true);
    applyFilters();
    if (allItems.length) {
      hideNewsEmptyState();
      document.documentElement.setAttribute('data-news-shell', 'ready');
    } else {
      showNewsEmptyState('The admin-published feed is empty right now.');
    }
    return allItems.length;
  }

  function formatRelativeTime(value = '') {
    const timestamp = new Date(String(value || '')).getTime();
    if (!Number.isFinite(timestamp) || timestamp <= 0) {
      return '';
    }
    const delta = Date.now() - timestamp;
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    if (delta < minute) return 'Just now';
    if (delta < hour) return `${Math.max(1, Math.round(delta / minute))} min ago`;
    if (delta < day) return `${Math.max(1, Math.round(delta / hour))} hr ago`;
    if (delta < 7 * day) return `${Math.max(1, Math.round(delta / day))} day ago`;
    return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  function estimateReadTime(item = {}) {
    const text = String([item.summary, item.content, item.title].filter(Boolean).join(' ')).trim();
    const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 180;
    return `${Math.max(1, Math.round(wordCount / 220))} min read`;
  }

  function getStoryLabel(item = {}) {
    return item.sourceName || item.publishedByName || item.source || 'Ajix News';
  }

  function getStoryTitleCase(value = '') {
    return String(value || '')
      .toLowerCase()
      .replace(/(^|[\s-])([a-z])/g, (_, prefix, letter) => `${prefix}${letter.toUpperCase()}`);
  }

  function getStoryBadge(item = {}) {
    if (item.featured) return 'FEATURED';
    if (normalizeFilterValue(item.category) === 'trending' || normalizeNewsPriority(item.importance) === 'high') {
      return 'ALERT';
    }
    return getNewsTheme(item.category, item.importance).badge;
  }

  function normalizeNewsPriority(value = '') {
    return String(value || '').trim().toLowerCase();
  }

  function getItemViews(item = {}) {
    return Math.max(
      0,
      Math.round(Number(item.views ?? item.viewCount ?? item.readCount ?? item.metrics?.views) || 0),
    );
  }

  function getItemLikes(item = {}) {
    return Math.max(
      0,
      Math.round(Number(item.likes ?? item.likesCount ?? item.likeCount ?? item.metrics?.likes) || 0),
    );
  }

  function getNewsItemPopularityScore(item = {}) {
    const views = getItemViews(item);
    const likes = getItemLikes(item);
    if (views > 0 || likes > 0) {
      return views * 10 + likes * 120 + (item.featured ? 2500 : 0) + (normalizeNewsPriority(item.importance) === 'high' ? 1200 : 0);
    }
    const seed = getPopularitySeed(item.title, item.filter);
    return seed.reads + seed.likes * 8 + (item.featured ? 2500 : 0);
  }

  function getNewsFeedText(item = {}) {
    return String([
      item.title,
      decodeNewsPreviewText(item.summary || item.excerpt || ''),
      decodeNewsPreviewText(item.content || item.body || ''),
      item.category,
      item.sourceName,
      item.tags?.join(' '),
    ].filter(Boolean).join(' '))
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  function getNewsCardSourceAvatar(name = '') {
    const parts = String(name || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const initials = parts.slice(0, 2).map((part) => part[0]).join('');
    return (initials || 'AJ').toUpperCase().slice(0, 2);
  }

  const NEWS_MASCOT_AVATAR_URL = '/images/app-logo.png?v=20260617-admin-avatar';

  function isAjixpharmacyDesk(name = '') {
    return String(name || '').trim().toLowerCase() === 'ajixpharmacy desk';
  }

  function setAvatarBackground(node, name = '', fallback = 'AJ') {
    if (!node) return;
    const initials = getNewsCardSourceAvatar(name || fallback);
    const useMascot = isAjixpharmacyDesk(name);
    node.classList.toggle('avatar-image', useMascot);
    node.style.backgroundImage = useMascot ? `url("${NEWS_MASCOT_AVATAR_URL}")` : '';
    node.style.backgroundSize = useMascot ? 'contain' : '';
    node.style.backgroundPosition = useMascot ? 'center' : '';
    node.style.backgroundRepeat = useMascot ? 'no-repeat' : '';
    node.style.backgroundColor = useMascot ? '#fff' : '';
    node.textContent = useMascot ? '' : initials;
  }

  function setHeroSlideTheme(element, item = {}) {
    const theme = getNewsTheme(item.category, item.importance);
    element.classList.remove('hero-slide--medicine', 'hero-slide--alert', 'hero-slide--research');
    element.classList.add(theme.heroClass);
    const heroImageUrl = String(item.imageUrl || item.heroBackgroundImage || '').trim();
    if (heroImageUrl) {
      element.style.setProperty('--hero-image', `url("${heroImageUrl.replace(/"/g, '%22')}")`);
    } else {
      element.style.setProperty('--hero-image', 'none');
    }
  }

  function setCardImageBackground(node, imageUrl = '') {
    if (!node) return;
    if (imageUrl) {
      node.hidden = false;
      node.style.display = '';
      node.style.backgroundImage = `url("${imageUrl.replace(/"/g, '%22')}")`;
      node.classList.remove('image-art');
    } else {
      node.hidden = true;
      node.style.display = 'none';
      node.style.backgroundImage = '';
      node.classList.remove('image-art');
    }
  }

  function updateHeroElement(itemRecord, item) {
    const element = itemRecord.element;
    const rawCategory = String(item.category || item.filter || itemRecord.filter || '').trim();
    const category = normalizeFilterValue(rawCategory || 'all');
    const theme = getNewsTheme(rawCategory || category, item.importance);
    const heroBadge = element.querySelector('.hero-badge');
    const heroCategory = element.querySelector('.hero-category');
    const heroTitle = element.querySelector('.hero-title');
    const heroExcerpt = element.querySelector('.hero-excerpt');
    const heroMeta = element.querySelector('.hero-meta');

    setHeroSlideTheme(element, item);
    element.dataset.newsFilter = category;
    element.dataset.newsTopics = Array.isArray(item.tags) && item.tags.length ? item.tags.join(',') : category;
    element.dataset.newsAlert = String(item.featured || normalizeNewsPriority(item.importance) === 'high' || category === 'trending');
    element.dataset.newsId = item.id;
    element.dataset.newsStoryKey = item.storyKey || slugify(item.title || item.id);

    if (heroBadge) heroBadge.textContent = getStoryBadge(item);
    if (heroCategory) heroCategory.textContent = theme.label.toUpperCase();
    if (heroTitle) heroTitle.textContent = item.title || 'Untitled update';
    if (heroExcerpt) heroExcerpt.textContent = getNewsCardExcerpt(item);
    if (heroMeta) {
      const readTime = estimateReadTime(item);
      const relativeTime = formatRelativeTime(item.publishedAt || item.updatedAt || item.createdAt);
      const sourceLabel = getStoryLabel(item);
      heroMeta.innerHTML = `
        <span>${readTime}</span>
        <span>${relativeTime || ''}</span>
        <span>${sourceLabel}</span>
      `;
    }
  }

  function updateArticleElement(itemRecord, item) {
    const element = itemRecord.element;
    const rawCategory = String(item.category || item.filter || itemRecord.filter || '').trim();
    const category = normalizeFilterValue(rawCategory || 'all');
    const theme = getNewsTheme(rawCategory || category, item.importance);
    const imageNode = element.querySelector('.article-image');
    const tagOverlay = element.querySelector('.tag-overlay');
    const titleNode = element.querySelector('.article-title');
    const excerptNode = element.querySelector('.article-excerpt');
    const sourceNameNode = element.querySelector('.source-name');
    const sourceAvatarNode = element.querySelector('.source-avatar');
    const timeNode = element.querySelector('.article-time');

    element.dataset.newsFilter = category;
    element.dataset.newsTopics = Array.isArray(item.tags) && item.tags.length ? item.tags.join(',') : category;
    element.dataset.newsAlert = String(item.featured || normalizeNewsPriority(item.importance) === 'high' || category === 'trending');
    element.dataset.newsId = item.id;
    element.dataset.newsStoryKey = item.storyKey || slugify(item.title || item.id);
    element.classList.remove('art-medicine', 'art-wellness', 'art-research', 'art-alert');
    element.classList.add(theme.cardClass);
    if (imageNode) {
      imageNode.classList.remove('art-medicine', 'art-wellness', 'art-research', 'art-alert');
      imageNode.classList.add(theme.cardClass);
      setCardImageBackground(imageNode, item.imageUrl || item.heroBackgroundImage || '');
    }
    if (tagOverlay) {
      tagOverlay.textContent = theme.label;
      tagOverlay.style.background = theme.accent;
    }
    if (titleNode) titleNode.textContent = item.title || 'Untitled update';
    if (excerptNode) excerptNode.textContent = getNewsCardExcerpt(item);
    if (sourceNameNode) sourceNameNode.textContent = getStoryLabel(item);
    setAvatarBackground(sourceAvatarNode, getStoryLabel(item));
    if (timeNode) timeNode.textContent = estimateReadTime(item);
  }

  function updateListElement(itemRecord, item) {
    const element = itemRecord.element;
    const rawCategory = String(item.category || item.filter || itemRecord.filter || '').trim();
    const category = normalizeFilterValue(rawCategory || 'all');
    const theme = getNewsTheme(rawCategory || category, item.importance);
    const imageNode = element.querySelector('.list-thumb');
    const tagNode = element.querySelector('.list-tag');
    const titleNode = element.querySelector('.list-title');
    const metaNode = element.querySelector('.list-meta');

    element.dataset.newsFilter = category;
    element.dataset.newsTopics = Array.isArray(item.tags) && item.tags.length ? item.tags.join(',') : category;
    element.dataset.newsAlert = String(item.featured || normalizeNewsPriority(item.importance) === 'high' || category === 'trending');
    element.dataset.newsId = item.id;
    element.dataset.newsStoryKey = item.storyKey || slugify(item.title || item.id);
    element.classList.remove('art-medicine', 'art-wellness', 'art-research', 'art-alert');
    element.classList.add(theme.cardClass);
    if (imageNode) {
      imageNode.classList.remove('art-medicine', 'art-wellness', 'art-research', 'art-alert');
      imageNode.classList.add(theme.cardClass);
      setCardImageBackground(imageNode, item.imageUrl || item.heroBackgroundImage || '');
    }
    if (tagNode) {
      tagNode.textContent = theme.label.toUpperCase();
      tagNode.style.color = theme.accent;
    }
    if (titleNode) titleNode.textContent = item.title || 'Untitled update';
    if (metaNode) {
      const readTime = estimateReadTime(item);
      const relativeTime = formatRelativeTime(item.publishedAt || item.updatedAt || item.createdAt);
      metaNode.textContent = [getStoryLabel(item), readTime, relativeTime].filter(Boolean).join(' Â· ');
    }
  }

  function updateTrendingElement(itemRecord, item, rank) {
    const element = itemRecord.element;
    const rawCategory = String(item.category || item.filter || itemRecord.filter || '').trim();
    const category = normalizeFilterValue(rawCategory || 'trending');
    const theme = getNewsTheme(rawCategory || category, item.importance);
    const rankNode = element.querySelector('.trending-rank');
    const titleNode = element.querySelector('.trending-title');
    const metaNode = element.querySelector('.trending-meta');

    element.dataset.newsFilter = category;
    element.dataset.newsTopics = Array.isArray(item.tags) && item.tags.length ? item.tags.join(',') : category;
    element.dataset.newsAlert = String(item.featured || normalizeNewsPriority(item.importance) === 'high' || category === 'trending');
    element.dataset.newsId = item.id;
    element.dataset.newsStoryKey = item.storyKey || slugify(item.title || item.id);
    if (rankNode) {
      rankNode.textContent = String(rank);
      rankNode.classList.toggle('top', rank <= 2);
    }
    if (titleNode) titleNode.textContent = item.title || 'Untitled update';
    if (metaNode) {
      const views = getItemViews(item);
      const relativeTime = formatRelativeTime(item.publishedAt || item.updatedAt || item.createdAt);
      metaNode.textContent = `${Math.max(1, Math.round(views / 1000))}K views Â· ${relativeTime || estimateReadTime(item)}`;
    }
    element.style.setProperty('--trending-accent', theme.accent);
  }

  function updateItemRecordFromFeed(itemRecord, item, index = 0) {
    const rawCategory = String(item.category || item.filter || itemRecord.filter || '').trim();
    const category = normalizeFilterValue(rawCategory || 'all');
    const theme = getNewsTheme(rawCategory || category, item.importance);
    const nextItem = {
      ...itemRecord,
      ...item,
    };
    nextItem.filter = category;
    nextItem.categoryLabel = theme.label;
    nextItem.source = getStoryLabel(item);
    nextItem.readTime = estimateReadTime(item);
    nextItem.metaLabel = `${nextItem.source} Â· ${nextItem.readTime}`;
    nextItem.searchableText = getNewsFeedText(item);
    nextItem.isAlert = Boolean(item.featured || normalizeNewsPriority(item.importance) === 'high' || nextItem.filter === 'trending');
    nextItem.topics = parseTopics(
      Array.isArray(item.tags) && item.tags.length ? item.tags.join(',') : nextItem.filter,
      [nextItem.filter].filter(Boolean),
    );
    nextItem.title = item.title || itemRecord.title;
    nextItem.storyKey = item.storyKey || slugify(item.title || item.id || itemRecord.id);
    nextItem.views = getItemViews(item);
    nextItem.viewCount = nextItem.views;
    nextItem.readCount = nextItem.views;
    nextItem.likes = getItemLikes(item);
    nextItem.likesCount = nextItem.likes;
    nextItem.likeCount = nextItem.likes;
    nextItem.metrics = {
      views: nextItem.views,
      likes: nextItem.likes,
    };
    nextItem.publishedAt = item.publishedAt || item.updatedAt || item.createdAt || nextItem.publishedAt;
    nextItem.updatedAt = item.updatedAt || item.createdAt || nextItem.updatedAt;
    nextItem.createdAt = item.createdAt || nextItem.createdAt;
    nextItem.sourceName = item.sourceName || item.publishedByName || item.sourceName || nextItem.source;
    nextItem.author = item.author || item.publishedByName || item.sourceName || nextItem.author || nextItem.source;
    nextItem.imageUrl = item.imageUrl || item.heroBackgroundImage || '';

    if (itemRecord.element.classList.contains('hero-slide')) {
      updateHeroElement(nextItem, item);
    } else if (itemRecord.element.classList.contains('article-card')) {
      updateArticleElement(nextItem, item);
    } else if (itemRecord.element.classList.contains('list-item')) {
      updateListElement(nextItem, item);
    } else if (itemRecord.element.classList.contains('trending-item')) {
      updateTrendingElement(nextItem, item, index + 1);
    }

    return nextItem;
  }

  function loadThemePreference() {
    try {
      const stored = window.localStorage.getItem(THEME_KEY);
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }
    } catch (error) {
      void error;
    }
    return 'light';
  }

  function syncThemeToggle(theme) {
    if (!themeToggleBtn) return;
    const isDark = theme === 'dark';
    themeToggleBtn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    themeToggleBtn.setAttribute('title', isDark ? 'Light mode' : 'Dark mode');
  }

  function applyTheme(theme) {
    const nextTheme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', nextTheme);
    syncThemeToggle(nextTheme);
    try {
      window.localStorage.setItem(THEME_KEY, nextTheme);
    } catch (error) {
      void error;
    }
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || loadThemePreference();
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
  }

  function normalizeFilterValue(value) {
    const normalized = String(value || '').trim().toLowerCase();
    if (!normalized || normalized === 'for-you' || normalized === 'for_you' || normalized === 'all') {
      return 'all';
    }
    if (normalized === 'saved' || normalized === 'bookmark' || normalized === 'bookmarks') {
      return 'bookmarks';
    }
    if (normalized === 'like' || normalized === 'likes') {
      return 'read-later';
    }
    if (normalized === 'readlater' || normalized === 'read later' || normalized === 'read-later') {
      return 'read-later';
    }
    if (normalized === 'news-alert' || normalized === 'alerts') {
      return 'alert';
    }
    return normalized;
  }

  function slugify(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 120);
  }

  function parseTopics(value, fallbackTopics) {
    const topics = String(value || '')
      .split(',')
      .map((entry) => slugify(entry))
      .filter(Boolean);
    if (topics.length) {
      return topics;
    }
    return Array.isArray(fallbackTopics) ? fallbackTopics.filter(Boolean) : [];
  }

  function loadSavedState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  function loadReadCounts() {
    try {
      const raw = window.localStorage.getItem(READ_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  function persistReadCounts() {
    try {
      window.localStorage.setItem(READ_KEY, JSON.stringify(readCounts));
    } catch (error) {
      // Ignore storage failures in restricted environments.
    }
  }

  function persistSavedState() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));
    } catch (error) {
      // Ignore storage failures in restricted environments.
    }
  }

  function getItemTitle(element) {
    const titleNode = element.querySelector('.hero-title, .side-card-title, .article-title, .list-title, .trending-title');
    return titleNode ? titleNode.textContent.trim() : element.textContent.trim();
  }

  function getItemSource(element) {
    const heroSource = element.querySelector('.hero-meta span:last-child');
    const articleSource = element.querySelector('.source-name');
    const listMeta = element.querySelector('.list-meta');
    const sideMeta = element.querySelector('.side-card-meta');
    if (articleSource?.textContent.trim()) return articleSource.textContent.trim();
    if (heroSource?.textContent.trim()) return heroSource.textContent.trim();
    if (listMeta?.textContent.trim()) {
      return listMeta.textContent.split('Â·')[0].trim();
    }
    if (sideMeta?.textContent.trim()) {
      return sideMeta.textContent.split('Â·')[0].trim();
    }
    return 'Ajix';
  }

  function getItemReadTime(element) {
    const articleTime = element.querySelector('.article-time');
    const heroRead = element.querySelector('.hero-meta span:first-child');
    const listMeta = element.querySelector('.list-meta');
    const sideMeta = element.querySelector('.side-card-meta');
    const trendingMeta = element.querySelector('.trending-meta');
    if (articleTime?.textContent.trim()) return articleTime.textContent.trim();
    if (heroRead?.textContent.trim()) return heroRead.textContent.trim();
    if (listMeta?.textContent.trim()) {
      const parts = listMeta.textContent.split('Â·').map((part) => part.trim()).filter(Boolean);
      if (parts[1]) return parts[1];
    }
    if (sideMeta?.textContent.trim()) {
      const parts = sideMeta.textContent.split('Â·').map((part) => part.trim()).filter(Boolean);
      if (parts[1]) return parts[1];
    }
    if (trendingMeta?.textContent.trim()) {
      const parts = trendingMeta.textContent.split('Â·').map((part) => part.trim()).filter(Boolean);
      if (parts[1]) return parts[1];
    }
    return '3 min read';
  }

  function getItemMetaLabel(element, source, readTime) {
    const trendingMeta = element.querySelector('.trending-meta');
    if (trendingMeta?.textContent.trim()) {
      return trendingMeta.textContent.trim();
    }
    return `${source} Â· ${readTime}`;
  }

  function getItemSource(element) {
    const heroSource = element.querySelector('.hero-meta span:last-child');
    const articleSource = element.querySelector('.source-name');
    const listMeta = element.querySelector('.list-meta');
    const sideMeta = element.querySelector('.side-card-meta');
    if (articleSource?.textContent.trim()) return articleSource.textContent.trim();
    if (heroSource?.textContent.trim()) return heroSource.textContent.trim();
    if (listMeta?.textContent.trim()) {
      return listMeta.textContent.split('\u00B7')[0].trim();
    }
    if (sideMeta?.textContent.trim()) {
      return sideMeta.textContent.split('\u00B7')[0].trim();
    }
    return 'Ajix';
  }

  function getItemReadTime(element) {
    const articleTime = element.querySelector('.article-time');
    const heroRead = element.querySelector('.hero-meta span:first-child');
    const listMeta = element.querySelector('.list-meta');
    const sideMeta = element.querySelector('.side-card-meta');
    const trendingMeta = element.querySelector('.trending-meta');
    if (articleTime?.textContent.trim()) return articleTime.textContent.trim();
    if (heroRead?.textContent.trim()) return heroRead.textContent.trim();
    if (listMeta?.textContent.trim()) {
      const parts = listMeta.textContent.split('\u00B7').map((part) => part.trim()).filter(Boolean);
      if (parts[1]) return parts[1];
    }
    if (sideMeta?.textContent.trim()) {
      const parts = sideMeta.textContent.split('\u00B7').map((part) => part.trim()).filter(Boolean);
      if (parts[1]) return parts[1];
    }
    if (trendingMeta?.textContent.trim()) {
      const parts = trendingMeta.textContent.split('\u00B7').map((part) => part.trim()).filter(Boolean);
      if (parts[1]) return parts[1];
    }
    return '3 min read';
  }

  function getItemMetaLabel(element, source, readTime) {
    const trendingMeta = element.querySelector('.trending-meta');
    if (trendingMeta?.textContent.trim()) {
      return trendingMeta.textContent.trim();
    }
    return `${source} \u00B7 ${readTime}`;
  }

  function getPopularitySeed(title, filter) {
    return popularitySeeds[title] || popularitySeeds[filter] || { reads: 1200, likes: 80 };
  }

  function getReadCount(itemId) {
    return Number(readCounts[itemId] || 0);
  }

  function incrementReadCount(item) {
    if (!item?.id) return;
    readCounts[item.id] = getReadCount(item.id) + 1;
    persistReadCounts();
    refreshPopularStoryCards();
  }

  function getPopularityScore(item) {
    const state = getItemState(item.id);
    const localReads = getReadCount(item.id);
    const likesBoost = (state.bookmarked ? 1 : 0) + (state.readLater ? 1 : 0);
    const liveViews = getItemViews(item);
    const liveLikes = getItemLikes(item);
    if (liveViews > 0 || liveLikes > 0) {
      return liveViews * 10 + liveLikes * 120 + localReads * 120 + likesBoost * 500 + (item.featured ? 2500 : 0);
    }
    const seed = getPopularitySeed(item.title, item.filter);
    return seed.reads + seed.likes * 8 + localReads * 120 + likesBoost * 500;
  }

  function getItemText(element) {
    return element.textContent.replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function inferItemFilter(element) {
    const explicitFilter = normalizeFilterValue(element.dataset.newsFilter);
    if (explicitFilter && explicitFilter !== 'all') {
      return explicitFilter;
    }
    const tagNode = element.querySelector('.tag-overlay, .side-card-tag, .list-tag');
    const titleNode = element.querySelector('.hero-category');
    const rawText = [tagNode?.textContent, titleNode?.textContent]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    if (element.classList.contains('trending-item')) {
      return 'trending';
    }
    if (rawText.includes('wellness')) {
      return 'wellness';
    }
    if (rawText.includes('research')) {
      return 'research';
    }
    if (rawText.includes('trending')) {
      return 'trending';
    }
    if (rawText.includes('medicine') || rawText.includes('medical')) {
      return 'medicine';
    }
    return 'all';
  }

  function getNewsFeedSlot(element) {
    const explicitSlot = String(element.dataset.newsFeedSlot || '').trim();
    if (explicitSlot) {
      return explicitSlot;
    }
    if (element.classList.contains('article-card')) {
      return NEWS_FEED_SLOTS.latest;
    }
    if (element.classList.contains('list-item')) {
      return NEWS_FEED_SLOTS.medicine;
    }
    if (element.classList.contains('trending-item')) {
      return NEWS_FEED_SLOTS.trendingNow;
    }
    if (element.classList.contains('side-card')) {
      return NEWS_FEED_SLOTS.popularStories;
    }
    return 'other';
  }
  const itemRecords = contentItems.map((element, index) => createNewsItemRecord(element, index));



  function isImportantNewsItem(item = {}) {
    const category = normalizeFilterValue(item.category || item.filter || '');
    const importance = normalizeNewsPriority(item.importance || item.priority || '');
    const color = String(item.categoryColor || item.accentColor || item.color || '').toLowerCase();
    return Boolean(item.featured || item.alert || importance === 'high' || category === 'trending' || category === 'alert' || color.includes('red') || color.includes('#dc2626') || color.includes('#ef4444'));
  }

  function sortNewsByDate(items = []) {
    return items.slice().sort((a, b) => {
      const bTime = new Date(b.publishedAt || b.updatedAt || b.createdAt || 0).getTime() || 0;
      const aTime = new Date(a.publishedAt || a.updatedAt || a.createdAt || 0).getTime() || 0;
      return bTime - aTime;
    });
  }

  function sortNewsByPopularity(items = []) {
    return items.slice().sort((a, b) => getPopularityScore(b) - getPopularityScore(a));
  }

  function createNewsItemRecord(element, index) {
    const title = getItemTitle(element);
    const id = element.dataset.newsId || (element.className.split(' ')[0] + '-' + (slugify(title) || index || 0));
    const storyKey = element.dataset.newsStoryKey || slugify(title) || id;
    element.dataset.newsId = id;
    element.dataset.newsStoryKey = storyKey;
    const saveBtn = element.querySelector('.save-btn');
    const readLaterBtn = element.querySelector('.like-btn');
    const fallbackTopics = [];
    const explicitFilter = inferItemFilter(element);
    if (explicitFilter && explicitFilter !== 'all' && !String(explicitFilter).startsWith('topic:')) fallbackTopics.push(explicitFilter);
    return { id, storyKey, element, title, filter: explicitFilter, feedSlot: getNewsFeedSlot(element), section: element.classList.contains('article-card') ? 'latest' : 'other', topics: parseTopics(element.dataset.newsTopics, fallbackTopics), searchableText: getItemText(element), isAlert: String(element.dataset.newsAlert).toLowerCase() === 'true', source: getItemSource(element), readTime: getItemReadTime(element), metaLabel: getItemMetaLabel(element, getItemSource(element), getItemReadTime(element)), saveBtn, readLaterBtn };
  }

  function bindNewsItemRecord(item) {
    if (!item || item.isBound) return item;
    item.saveBtn?.addEventListener('click', (event) => { event.stopPropagation(); toggleBookmark(item); });
    item.readLaterBtn?.addEventListener('click', (event) => { event.stopPropagation(); toggleReadLater(item); });
    item.element.addEventListener('click', (event) => { if (event.target.closest('button, a, input, textarea, select')) return; incrementReadCount(item); openNewsStory(item); });
    item.isBound = true;
    return item;
  }

  function removeRecordsByClass(className) {
    getRecordsByClass(className).forEach((record) => record.element.remove());
    for (let index = itemRecords.length - 1; index >= 0; index -= 1) {
      if (itemRecords[index]?.element?.classList.contains(className)) itemRecords.splice(index, 1);
    }
  }

  function makeSideCardElement() {
    const element = document.createElement('div');
    element.className = 'side-card';
    element.dataset.newsFeedSlot = NEWS_FEED_SLOTS.popularStories;
    element.innerHTML = '<div class="side-card-tag trending">MOST VIEWED</div><div class="side-card-title"></div><div class="side-card-meta"></div>';
    return element;
  }

  function makeArticleCardElement() {
    const element = document.createElement('article');
    element.className = 'article-card';
    element.dataset.newsFeedSlot = NEWS_FEED_SLOTS.latest;
    const sample = document.querySelector('.article-card .article-actions');
    const actions = sample ? sample.outerHTML : '<div class="article-actions"><button class="action-btn like-btn" type="button" aria-label="Read later">+</button><button class="action-btn save-btn" type="button" aria-label="Save">+</button></div>';
    element.innerHTML = '<div class="article-image image-art art-medicine" aria-hidden="true"><span class="tag-overlay">Medicine</span></div><div class="article-content"><div class="article-meta"><div class="source-avatar" aria-hidden="true"></div><span class="source-name"></span><span class="article-time"></span></div><h3 class="article-title"></h3><p class="article-excerpt"></p>' + actions + '</div>';
    return element;
  }

  function makeListItemElement() {
    const element = document.createElement('div');
    element.className = 'list-item';
    element.dataset.newsFeedSlot = NEWS_FEED_SLOTS.medicine;
    const sample = document.querySelector('.list-item .list-actions');
    const actions = sample ? sample.outerHTML : '<div class="list-actions"><button class="action-btn like-btn" type="button" aria-label="Read later">+</button><button class="action-btn save-btn" type="button" aria-label="Save">+</button></div>';
    element.innerHTML = '<div class="list-thumb image-art art-medicine" aria-hidden="true"></div><div class="list-body"><div class="list-tag">MEDICINE</div><div class="list-title"></div><div class="list-meta"></div></div>' + actions;
    return element;
  }

  function makeTrendingItemElement() {
    const element = document.createElement('div');
    element.className = 'trending-item';
    element.dataset.newsFeedSlot = NEWS_FEED_SLOTS.trendingNow;
    element.innerHTML = '<div class="trending-rank top"></div><div class="trending-content"><div class="trending-title"></div><div class="trending-meta"></div></div>';
    return element;
  }

  function addGeneratedNewsRecord(container, item, createElement, index) {
    if (!container) return null;
    const element = createElement();
    container.appendChild(element);
    const record = createNewsItemRecord(element, itemRecords.length + index);
    Object.assign(record, updateItemRecordFromFeed(record, item, index));
    bindNewsItemRecord(record);
    itemRecords.push(record);
    return record;
  }

  function replaceGeneratedSection(className, container, items, createElement) {
    if (!container) return;
    removeRecordsByClass(className);
    items.forEach((item, index) => addGeneratedNewsRecord(container, item, createElement, index));
  }

  function updateMedicineViewButton() {
    if (!medicineViewToggle) return;
    const remaining = Math.max(0, medicineFeedItems.length - medicineRenderedCount);
    medicineViewToggle.hidden = remaining <= 0;
    medicineViewToggle.disabled = remaining <= 0;
    medicineViewToggle.setAttribute('aria-expanded', String(remaining <= 0));
    medicineViewToggle.textContent = remaining > 0 ? 'View more (' + Math.min(MEDICINE_PAGE_SIZE, remaining) + ' more) ->' : 'All stories loaded';
  }

  function renderNextMedicineChunk(reset) {
    if (!medicineList) return;
    if (reset) {
      medicineList.innerHTML = '';
      removeRecordsByClass('list-item');
      medicineRenderedCount = 0;
    }
    const nextItems = medicineFeedItems.slice(medicineRenderedCount, medicineRenderedCount + MEDICINE_PAGE_SIZE);
    nextItems.forEach((item, index) => addGeneratedNewsRecord(medicineList, item, makeListItemElement, medicineRenderedCount + index));
    medicineRenderedCount += nextItems.length;
    updateMedicineViewButton();
  }

  function getItemState(itemId) {
    const state = savedState[itemId];
    if (!state || typeof state !== 'object') {
      return { bookmarked: false, readLater: false };
    }
    return {
      bookmarked: Boolean(state.bookmarked),
      readLater: Boolean(state.readLater),
    };
  }

  function ensureItemState(itemId) {
    if (!savedState[itemId] || typeof savedState[itemId] !== 'object') {
      savedState[itemId] = { bookmarked: false, readLater: false };
    }
    return savedState[itemId];
  }

  function setBodyScrollLock(locked) {
    document.body.style.overflow = locked ? 'hidden' : '';
  }

  function openMobileSearch() {
    if (!mobileSearchPanel) return;
    closeMobileDashboard();
    mobileSearchPanel.classList.add('is-open');
    mobileSearchPanel.setAttribute('aria-hidden', 'false');
    setBodyScrollLock(true);
    window.setTimeout(() => mobileSearchInput?.focus(), 0);
  }

  function closeMobileSearch() {
    if (!mobileSearchPanel) return;
    mobileSearchPanel.classList.remove('is-open');
    mobileSearchPanel.setAttribute('aria-hidden', 'true');
    if (!mobileDashboardPanel?.classList.contains('is-open')) {
      setBodyScrollLock(false);
    }
  }

  function openMobileDashboard() {
    if (!mobileDashboardPanel) return;
    closeMobileSearch();
    mobileDashboardPanel.classList.add('is-open');
    mobileDashboardPanel.setAttribute('aria-hidden', 'false');
    mobileDashboardBackdrop?.classList.add('is-open');
    mobileDashboardBackdrop?.removeAttribute('hidden');
    setBodyScrollLock(true);
  }

  function closeMobileDashboard() {
    if (!mobileDashboardPanel) return;
    mobileDashboardPanel.classList.remove('is-open');
    mobileDashboardPanel.setAttribute('aria-hidden', 'true');
    mobileDashboardBackdrop?.classList.remove('is-open');
    if (mobileDashboardBackdrop) mobileDashboardBackdrop.setAttribute('hidden', '');
    if (!mobileSearchPanel?.classList.contains('is-open')) {
      setBodyScrollLock(false);
    }
  }
  function syncMedicineViewToggle() {
    updateMedicineViewButton();
  }

  function toggleMedicineList() {
    renderNextMedicineChunk(false);
    applyFilters();
  }

  function openNewsStory(item) {
    if (!item) return;
    const imageNode = item.element.querySelector('.article-image, .list-thumb, .hero-slide, .side-card');
    const imageStyles = imageNode ? window.getComputedStyle(imageNode) : null;
    const imageClass = imageNode ? Array.from(imageNode.classList || []).find((className) => className.startsWith('art-')) || '' : '';
        const storyPayload = {
      id: item.id,
      storyKey: item.storyKey,
      title: item.title,
      summary: item.summary || item.excerpt || '',
      content: item.content || item.body || '',
      body: item.body || item.content || '',
      category: item.category,
      publishedAt: item.publishedAt || item.updatedAt || item.createdAt || '',
      updatedAt: item.updatedAt || item.createdAt || '',
      createdAt: item.createdAt || '',
      filter: item.filter,
      feedSlot: item.feedSlot,
      source: item.source,
      sourceName: item.sourceName || item.publishedByName || item.source,
      author: item.author || item.publishedByName || item.sourceName || item.source,
      readTime: item.readTime,
      metaLabel: item.metaLabel,
      topics: item.topics,
      tags: item.tags,
      alert: item.isAlert,
      reviewNote: item.reviewNote,
      likes: getItemLikes(item),
      likesCount: getItemLikes(item),
      likeCount: getItemLikes(item),
      heroBackgroundImage: imageStyles?.backgroundImage || '',
      heroBackgroundColor: imageStyles?.backgroundColor || '',
      heroBackgroundSize: imageStyles?.backgroundSize || '',
      heroBackgroundPosition: imageStyles?.backgroundPosition || '',
      heroBackgroundRepeat: imageStyles?.backgroundRepeat || '',
      heroImageClass: imageClass,
      heroLabel: item.element.querySelector('.tag-overlay, .side-card-tag, .hero-category')?.textContent?.trim() || '',
      imageUrl: item.imageUrl || item.heroBackgroundImage || '',
      imageAlt: item.imageAlt || item.title || '',
    };

    try {
      window.sessionStorage.setItem('ajix-news-story-v1', JSON.stringify(storyPayload));
    } catch (error) {
      void error;
    }

    const newsId = String(item.id || '').trim();
    const storyKey = String(item.storyKey || item.id || '').trim();
    window.location.href = newsId
      ? './news-story.html?newsId=' + encodeURIComponent(newsId) + '&story=' + encodeURIComponent(storyKey)
      : './news-story.html?story=' + encodeURIComponent(storyKey);
  }

  backBtn?.addEventListener('click', () => {
    window.location.href = './index.html?screen=extra-screen';
  });

  searchToggleBtn?.addEventListener('click', () => {
    if (mobileSearchPanel?.classList.contains('is-open')) {
      closeMobileSearch();
    } else {
      openMobileSearch();
    }
  });

  mobileSearchCloseBtn?.addEventListener('click', closeMobileSearch);

  mobileSearchPanel?.addEventListener('click', (event) => {
    if (event.target === mobileSearchPanel) {
      closeMobileSearch();
    }
  });

  dashboardToggleBtn?.addEventListener('click', () => {
    if (mobileDashboardPanel?.classList.contains('is-open')) {
      closeMobileDashboard();
    } else {
      openMobileDashboard();
    }
  });

  mobileDashboardBackdrop?.addEventListener('click', closeMobileDashboard);
  mobileDashboardCloseBtn?.addEventListener('click', closeMobileDashboard);
  medicineViewToggle?.addEventListener('click', () => {
    toggleMedicineList();
  });

  function setSearchQuery(nextQuery) {
    currentQuery = String(nextQuery || '');
    if (desktopSearchInput && desktopSearchInput.value !== currentQuery) {
      desktopSearchInput.value = currentQuery;
    }
    if (mobileSearchInput && mobileSearchInput.value !== currentQuery) {
      mobileSearchInput.value = currentQuery;
    }
    applyFilters();
  }

  function setFilter(nextFilter) {
    currentFilter = normalizeFilterValue(nextFilter);
    syncControlStates();
    applyFilters();
  }

  function setLatestFilter(nextFilter) {
    currentLatestFilter = normalizeFilterValue(nextFilter);
    syncControlStates();
    applyFilters();
  }

  function toggleBookmark(item) {
    const state = getItemState(item.id);
    const nextState = ensureItemState(item.id);
    nextState.bookmarked = !state.bookmarked;
    if (!nextState.bookmarked && !nextState.readLater) {
      delete savedState[item.id];
    }
    persistSavedState();
    applyFilters();
  }

  function toggleReadLater(item) {
    const state = getItemState(item.id);
    const nextState = ensureItemState(item.id);
    nextState.readLater = !state.readLater;
    if (!nextState.bookmarked && !nextState.readLater) {
      delete savedState[item.id];
    }
    persistSavedState();
    applyFilters();
  }

  function getSideCardTagClass(item) {
    if (item.filter === 'medicine') return 'medicine';
    if (item.filter === 'wellness') return 'wellness';
    if (item.filter === 'research') return 'research';
    if (item.filter === 'alert' || item.isAlert) return 'alert';
    if (item.filter === 'trending') return 'trending';
    return 'medicine';
  }

  function getSideCardTagLabel(item) {
    const tagNode = item.element.querySelector('.tag-overlay, .side-card-tag, .list-tag, .hero-category');
    if (tagNode?.textContent.trim()) {
      return tagNode.textContent.trim();
    }
    return item.filter === 'all' ? 'Top story' : item.filter.toUpperCase();
  }
  function refreshPopularStoryCards() {
    // Most-viewed cards are generated from admin-published records, keeping title and newsId together.
  }

  function syncControlStates() {
    filterControls.forEach((control) => {
      const filterValue = normalizeFilterValue(control.dataset.newsFilter);
      control.classList.toggle('active', filterValue === currentFilter);
      if (control.id === 'news-alert-btn') {
        control.setAttribute('aria-pressed', String(filterValue === currentFilter));
      }
    });

    latestFilterControls.forEach((control) => {
      const filterValue = normalizeFilterValue(control.dataset.latestFilter);
      control.classList.toggle('active', filterValue === currentLatestFilter);
      control.setAttribute('aria-pressed', String(filterValue === currentLatestFilter));
    });

    dashboardItems.forEach((control) => {
      const filterValue = normalizeFilterValue(control.dataset.dashboardItem);
      control.classList.toggle('active', filterValue === currentFilter);
    });
  }

  function updateSavedButtonStates() {
  itemRecords.forEach(bindNewsItemRecord);

  desktopSearchInput?.addEventListener('input', (event) => {
    setSearchQuery(event.target.value);
  });

  mobileSearchInput?.addEventListener('input', (event) => {
    setSearchQuery(event.target.value);
  });

  mobileSearchInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMobileSearch();
      searchToggleBtn?.focus();
      return;
    }
    if (event.key === 'Enter') {
      setSearchQuery(mobileSearchInput.value);
    }
  });

  desktopSearchInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setSearchQuery('');
      desktopSearchInput.blur();
    }
    if (event.key === 'Enter') {
      setSearchQuery(desktopSearchInput.value);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMobileSearch();
      closeMobileDashboard();
    }
  });

  if (savedState && typeof savedState !== 'object') {
    savedState = {};
  }

  applyTheme(loadThemePreference());
  syncControlStates();
  latestFilterControls.forEach((control) => {
    const filterValue = normalizeFilterValue(control.dataset.latestFilter);
    control.classList.toggle('active', filterValue === currentLatestFilter);
    control.setAttribute('aria-pressed', String(filterValue === currentLatestFilter));
  });
  syncMedicineViewToggle();
  setHeroSlide(0);
  startHeroRotation();
  applyFilters();
  hydratePublishedNewsFeed();
  window.addEventListener('storage', (event) => {
    if (event.key !== PUBLIC_NEWS_FEED_CACHE_KEY) return;
    const nextFeed = loadCachedPublishedNewsFeed();
    applyPublishedNewsFeed(normalizePublishedNewsFeed(nextFeed || {}));
  });

  themeToggleBtn?.addEventListener('click', toggleTheme);
  footerSheetLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      openFooterSheet(link.dataset.footerTopic || 'about');
    });
  });
  footerSheetCloseBtn?.addEventListener('click', closeFooterSheet);
  footerSheetBackdrop?.addEventListener('click', closeFooterSheet);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeFooterSheet();
    }
  });
})();
