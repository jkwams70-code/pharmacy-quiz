const fs = require('fs');
const files = [
  'C:/Users/John_Israel/Desktop/AJIXPHARM/AjixPharmacy-mainmerge/www/news.html',
  'C:/Users/John_Israel/Desktop/AJIXPHARM/AjixPharmacy-mainmerge/android/app/src/main/assets/public/news.html',
];
function replaceBlock(text, startNeedle, endNeedle, replacement, label) {
  const start = text.indexOf(startNeedle);
  if (start < 0) throw new Error('Missing start block: ' + label);
  const end = text.indexOf(endNeedle, start);
  if (end < 0) throw new Error('Missing end block: ' + label);
  return text.slice(0, start) + replacement + text.slice(end);
}
function ensureOnce(text, needle, replacement, label) {
  if (!text.includes(needle)) throw new Error('Missing exact block: ' + label);
  return text.replace(needle, replacement);
}
const constantsOld = "  const popularStorySlots = Array.from(document.querySelectorAll('.hero-side .side-card'));\n  const contentSelectors = '.hero-slide, .side-card, .article-card, .list-item, .trending-item';\n  const contentItems = Array.from(document.querySelectorAll(contentSelectors));";
const constantsNew = "  const popularStoryPanel = document.querySelector('.hero-side[data-news-feed-slot=\"popular-stories\"]');\n  const popularStorySlots = Array.from(document.querySelectorAll('.hero-side .side-card'));\n  const latestGrid = document.querySelector('.article-grid[data-news-feed-slot=\"latest\"]');\n  const trendingWidget = document.querySelector('.widget[data-news-feed-slot=\"trending-now\"]');\n  const contentSelectors = '.hero-slide, .side-card, .article-card, .list-item, .trending-item';\n  const contentItems = Array.from(document.querySelectorAll(contentSelectors));\n  const POPULAR_STORY_LIMIT = 3;\n  const LATEST_STORY_LIMIT = 10;\n  const MEDICINE_PAGE_SIZE = 10;\n  let medicineFeedItems = [];\n  let medicineRenderedCount = 0;";
const helpers = String.raw`
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
`;
const applyNew = String.raw`  function applyPublishedNewsFeed(feed = {}) {
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
  }`;
for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  text = ensureOnce(text, constantsOld, constantsNew, 'constants');
  text = replaceBlock(text, '  const itemRecords = contentItems.map((element, index) => {', '\n\n  function getItemState(itemId) {', '  const itemRecords = contentItems.map((element, index) => createNewsItemRecord(element, index));', 'itemRecords');
  text = text.replace('  function getItemState(itemId) {', helpers + '\n  function getItemState(itemId) {');
  text = replaceBlock(text, '  function applyPublishedNewsFeed(feed = {}) {', '\n\n  function formatRelativeTime', applyNew, 'applyPublishedNewsFeed');
  text = replaceBlock(text, '  function syncMedicineViewToggle() {', '\n\n  function openNewsStory(item) {', '  function syncMedicineViewToggle() {\n    updateMedicineViewButton();\n  }\n\n  function toggleMedicineList() {\n    renderNextMedicineChunk(false);\n    applyFilters();\n  }', 'medicine toggle');
  text = replaceBlock(text, '  function refreshPopularStoryCards() {', '\n\n  function syncControlStates()', '  function refreshPopularStoryCards() {\n    // Most-viewed cards are generated from admin-published records, keeping title and newsId together.\n  }', 'popular refresh');
  text = replaceBlock(text, '  itemRecords.forEach((item) => {', '\n\n  desktopSearchInput?.addEventListener', '  itemRecords.forEach(bindNewsItemRecord);', 'bind loop');
  text = text.replace('.article-list .list-item.is-extra { display: none; }', '.article-list .list-item.is-extra { display: grid; }');
  fs.writeFileSync(file, text, 'utf8');
  console.log('patched', file);
}
