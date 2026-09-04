const fs = require('fs');
const path = require('path');

const files = [
  path.join(process.cwd(), 'AjixPharmacy-mainmerge', 'www', 'news.html'),
  path.join(process.cwd(), 'AjixPharmacy-mainmerge', 'android', 'app', 'src', 'main', 'assets', 'public', 'news.html'),
];

function replaceOnce(text, from, to, label) {
  if (!text.includes(from)) throw new Error(`Missing block: ${label}`);
  return text.replace(from, to);
}

function replaceRegex(text, pattern, to, label) {
  if (!pattern.test(text)) throw new Error(`Missing pattern: ${label}`);
  return text.replace(pattern, to);
}

const topConstantsReplacement = `
  const popularStoryPanel = document.querySelector('.hero-side[data-news-feed-slot="popular-stories"]');
  const popularStorySlots = Array.from(document.querySelectorAll('.hero-side .side-card'));
  const latestGrid = document.querySelector('.article-grid[data-news-feed-slot="latest"]');
  const contentSelectors = '.hero-slide, .side-card, .article-card, .list-item, .trending-item';
  const contentItems = Array.from(document.querySelectorAll(contentSelectors));
  const MEDICINE_PAGE_SIZE = 10;
  const LATEST_STORY_LIMIT = 10;
  const POPULAR_STORY_LIMIT = 3;
  let medicineFeedItems = [];
  let medicineRenderedCount = 0;
`;

const itemRecordsReplacement = `  function createItemRecord(element, index = itemRecords.length) {
    const title = getItemTitle(element);
    const id = element.dataset.newsId || `${'${element.className.split(\' \')[0]}-${slugify(title) || index}'}`;
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

  const itemRecords = contentItems.map((element, index) => createItemRecord(element, index));`;

const dynamicHelpers = `
  function isImportantNewsItem(item = {}) {
    const category = normalizeFilterValue(item.category || item.filter || '');
    const priority = normalizeNewsPriority(item.importance || item.priority || '');
    const colorText = String(item.categoryColor || item.accentColor || item.color || '').toLowerCase();
    return Boolean(item.featured || item.alert || priority === 'high' || category === 'trending' || category === 'alert' || colorText.includes('red') || colorText.includes('#dc2626') || colorText.includes('#ef4444'));
  }

  function sortByPublishedDate(items = []) {
    return items.slice().sort((a, b) => (new Date(b.publishedAt || b.updatedAt || b.createdAt || 0).getTime() || 0) - (new Date(a.publishedAt || a.updatedAt || a.createdAt || 0).getTime() || 0));
  }

  function sortByPopularity(items = []) {
    return items.slice().sort((a, b) => getPopularityScore(b) - getPopularityScore(a));
  }

  function makeArticleCardElement() {
    const article = document.createElement('article');
    article.className = 'article-card';
    article.dataset.newsFeedSlot = NEWS_FEED_SLOTS.latest;
    article.innerHTML = '<div class="article-image image-art art-medicine" aria-hidden="true"><span class="tag-overlay">Medicine</span></div><div class="article-content"><div class="article-meta"><div class="source-avatar" aria-hidden="true"></div><span class="source-name"></span><span class="article-time"></span></div><h3 class="article-title"></h3><p class="article-excerpt"></p><div class="article-actions"><button class="action-btn like-btn" aria-label="Read later" type="button">+</button><button class="action-btn save-btn" aria-label="Save" type="button">+</button></div></div>';
    return article;
  }

  function makeListItemElement() {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.dataset.newsFeedSlot = NEWS_FEED_SLOTS.medicine;
    item.innerHTML = '<div class="list-thumb image-art art-medicine" aria-hidden="true"></div><div class="list-body"><div class="list-tag">MEDICINE</div><div class="list-title"></div><div class="list-meta"></div></div><div class="list-actions"><button class="action-btn like-btn" aria-label="Read later" type="button">+</button><button class="action-btn save-btn" aria-label="Save" type="button">+</button></div>';
    return item;
  }

  function makeSideCardElement() {
    const card = document.createElement('div');
    card.className = 'side-card';
    card.dataset.newsFeedSlot = NEWS_FEED_SLOTS.popularStories;
    card.innerHTML = '<div class="side-card-tag trending">MOST VIEWED</div><div class="side-card-title"></div><div class="side-card-meta"></div>';
    return card;
  }

  function makeTrendingItemElement() {
    const item = document.createElement('div');
    item.className = 'trending-item';
    item.dataset.newsFeedSlot = NEWS_FEED_SLOTS.trendingNow;
    item.innerHTML = '<div class="trending-rank top"></div><div class="trending-content"><div class="trending-title"></div><div class="trending-meta"></div></div>';
    return item;
  }

  function bindItemRecord(item) {
    if (!item || item.isNewsBound) return item;
    item.saveBtn?.addEventListener('click', (event) => { event.stopPropagation(); toggleBookmark(item); });
    item.readLaterBtn?.addEventListener('click', (event) => { event.stopPropagation(); toggleReadLater(item); });
    item.element.addEventListener('click', (event) => { if (event.target.closest('button, a, input, textarea, select')) return; incrementReadCount(item); openNewsStory(item); });
    item.isNewsBound = true;
    return item;
  }

  function replaceSectionRecords(className, container, items, createElement) {
    if (!container) return [];
    getRecordsByClass(className).forEach((record) => record.element.remove());
    for (let index = itemRecords.length - 1; index >= 0; index -= 1) {
      if (itemRecords[index]?.element?.classList.contains(className)) itemRecords.splice(index, 1);
    }
    return items.map((item, index) => {
      const element = createElement();
      container.appendChild(element);
      const record = createItemRecord(element, itemRecords.length + index);
      Object.assign(record, updateItemRecordFromFeed(record, item, index));
      bindItemRecord(record);
      itemRecords.push(record);
      return record;
    });
  }

  function updateMedicineViewButton() {
    if (!medicineViewToggle) return;
    const remaining = Math.max(0, medicineFeedItems.length - medicineRenderedCount);
    medicineViewToggle.hidden = remaining <= 0;
    medicineViewToggle.disabled = remaining <= 0;
    medicineViewToggle.setAttribute('aria-expanded', String(remaining <= 0));
    medicineViewToggle.textContent = remaining > 0 ? `View more (${Math.min(MEDICINE_PAGE_SIZE, remaining)} more) ->` : 'All stories loaded';
  }

  function renderMedicineChunk(reset = false) {
    if (!medicineList) return;
    if (reset) {
      medicineList.innerHTML = '';
      getRecordsByClass('list-item').forEach((record) => record.element.remove());
      for (let index = itemRecords.length - 1; index >= 0; index -= 1) {
        if (itemRecords[index]?.element?.classList.contains('list-item')) itemRecords.splice(index, 1);
      }
      medicineRenderedCount = 0;
    }
    const nextItems = medicineFeedItems.slice(medicineRenderedCount, medicineRenderedCount + MEDICINE_PAGE_SIZE);
    nextItems.forEach((item, index) => {
      const element = makeListItemElement();
      medicineList.appendChild(element);
      const record = createItemRecord(element, itemRecords.length + index);
      Object.assign(record, updateItemRecordFromFeed(record, item, medicineRenderedCount + index));
      bindItemRecord(record);
      itemRecords.push(record);
    });
    medicineRenderedCount += nextItems.length;
    updateMedicineViewButton();
  }
`;

const applyFeedReplacement = `  function applyPublishedNewsFeed(feed = {}) {
    const normalizedFeed = normalizePublishedNewsFeed(feed);
    const sections = normalizedFeed.sections || {};
    const allItems = sortByPublishedDate(Array.isArray(normalizedFeed?.items) ? normalizedFeed.items : []);
    const heroRecords = getRecordsByClass('hero-slide');
    const heroItems = Array.isArray(sections.hero) && sections.hero.length ? sections.hero : allItems.slice(0, heroRecords.length);
    const latestItems = sortByPublishedDate(Array.isArray(sections.latest) && sections.latest.length ? sections.latest : allItems).slice(0, LATEST_STORY_LIMIT);
    const medicineItems = sortByPublishedDate(Array.isArray(sections.medicine) && sections.medicine.length ? sections.medicine : allItems);
    const popularItems = sortByPopularity(Array.isArray(sections.popular) && sections.popular.length ? sections.popular : allItems).slice(0, POPULAR_STORY_LIMIT);
    const trendingItems = sortByPopularity((Array.isArray(sections.trendingNow) && sections.trendingNow.length ? sections.trendingNow : allItems).filter(isImportantNewsItem)).slice(0, 12);

    heroRecords.forEach((record, index) => {
      const item = heroItems[index];
      if (!item) { hideUnusedRecords([record]); return; }
      revealRecord(record);
      Object.assign(record, updateItemRecordFromFeed(record, item, index));
    });

    replaceSectionRecords('side-card', popularStoryPanel, popularItems, makeSideCardElement);
    replaceSectionRecords('article-card', latestGrid, latestItems, makeArticleCardElement);
    replaceSectionRecords('trending-item', document.querySelector('.widget[data-news-feed-slot="trending-now"]'), trendingItems, makeTrendingItemElement);
    medicineFeedItems = medicineItems;
    renderMedicineChunk(true);

    applyFilters();
    if (allItems.length) {
      hideNewsEmptyState();
      document.documentElement.setAttribute('data-news-shell', 'ready');
    } else {
      showNewsEmptyState('The admin-published feed is empty right now.');
    }
    return allItems.length;
  }`;

for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  text = replaceRegex(text, /\s*\.article-list \.list-item\.is-extra \{ display: none; \}\r?\n\s*\.article-list\.is-expanded \.list-item\.is-extra \{ display: grid; \}\r?\n/, '\n  .article-list .list-item.is-extra { display: grid; }\n  .article-list.is-expanded .list-item.is-extra { display: grid; }\n', 'medicine extra css');
  text = replaceRegex(text, /\s*const popularStorySlots = Array\.from\(document\.querySelectorAll\('\.hero-side \.side-card'\)\);\r?\n\s*const contentSelectors = '\.hero-slide, \.side-card, \.article-card, \.list-item, \.trending-item';\r?\n\s*const contentItems = Array\.from\(document\.querySelectorAll\(contentSelectors\)\);\r?\n/, topConstantsReplacement, 'top constants');

  const recordStart = text.indexOf('  const itemRecords = contentItems.map((element, index) => {');
  const recordEnd = text.indexOf('\n\n  function getItemState(itemId) {', recordStart);
  if (recordStart < 0 || recordEnd < 0) throw new Error('Missing itemRecords block');
  text = text.slice(0, recordStart) + itemRecordsReplacement + text.slice(recordEnd);

  text = replaceOnce(text, '  function applyPublishedNewsFeed(feed = {}) {', dynamicHelpers + '\n  function applyPublishedNewsFeed(feed = {}) {', 'helper insertion');
  const applyStart = text.indexOf('  function applyPublishedNewsFeed(feed = {}) {');
  const applyEnd = text.indexOf('\n\n  function formatRelativeTime', applyStart);
  if (applyStart < 0 || applyEnd < 0) throw new Error('Missing apply feed block');
  text = text.slice(0, applyStart) + applyFeedReplacement + text.slice(applyEnd);

  const medicineStart = text.indexOf('  function syncMedicineViewToggle() {');
  const medicineEnd = text.indexOf('\n\n  function openNewsStory(item) {', medicineStart);
  if (medicineStart < 0 || medicineEnd < 0) throw new Error('Missing medicine toggle block');
  text = text.slice(0, medicineStart) + `  function syncMedicineViewToggle() {
    updateMedicineViewButton();
  }

  function toggleMedicineList() {
    renderMedicineChunk(false);
    applyFilters();
  }` + text.slice(medicineEnd);

  const popularStart = text.indexOf('  function refreshPopularStoryCards() {');
  const popularEnd = text.indexOf('\n\n  function syncControlStates()', popularStart);
  if (popularStart < 0 || popularEnd < 0) throw new Error('Missing popular refresh block');
  text = text.slice(0, popularStart) + `  function refreshPopularStoryCards() {
    // Popular cards are generated from the admin feed so each card keeps its own story id.
  }` + text.slice(popularEnd);

  const bindStart = text.indexOf('  itemRecords.forEach((item) => {');
  const bindEnd = text.indexOf('\n\n  desktopSearchInput?.addEventListener', bindStart);
  if (bindStart < 0 || bindEnd < 0) throw new Error('Missing bind loop');
  text = text.slice(0, bindStart) + '  itemRecords.forEach(bindItemRecord);' + text.slice(bindEnd);

  text = text.replace(/ajix-app-shell-v88-medlens-brand/g, 'ajix-app-shell-v89-news-feed');
  text = text.replace(/20260901-medlens-brand/g, '20260901-news-feed');
  fs.writeFileSync(file, text);
  console.log('patched', file);
}
