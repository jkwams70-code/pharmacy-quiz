const fs = require('fs');
const files = [
  'C:/Users/John_Israel/Desktop/AJIXPHARM/AjixPharmacy-mainmerge/www/news.html',
  'C:/Users/John_Israel/Desktop/AJIXPHARM/AjixPharmacy-mainmerge/android/app/src/main/assets/public/news.html',
];
function once(text, regex, replacement, label) {
  let count = 0;
  const next = text.replace(regex, () => { count += 1; return replacement; });
  if (count !== 1) throw new Error(label + ' replacements: ' + count);
  return next;
}
const constantsNew = `
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
  let medicineRenderedCount = 0;`;
const itemRecordsNew = `  const itemRecords = contentItems.map((element, index) => createNewsItemRecord(element, index));`;
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
  text = once(text, /\s*const popularStorySlots = Array\.from\(document\.querySelectorAll\('\.hero-side \.side-card'\)\);\r?\n\s*const contentSelectors = '\.hero-slide, \.side-card, \.article-card, \.list-item, \.trending-item';\r?\n\s*const contentItems = Array\.from\(document\.querySelectorAll\(contentSelectors\)\);/, constantsNew, 'constants');
  text = once(text, /\s*const itemRecords = contentItems\.map\(\(element, index\) => \{[\s\S]*?\r?\n\s*\}\);\r?\n(?=\r?\n\s*function getItemState\(itemId\) \{)/, '\n' + itemRecordsNew + '\n', 'itemRecords');
  text = text.replace('  function getItemState(itemId) {', helpers + '\n  function getItemState(itemId) {');
  text = once(text, /\s*function applyPublishedNewsFeed\(feed = \{\}\) \{[\s\S]*?\r?\n\s*\}\r?\n(?=\r?\n\s*function formatRelativeTime)/, '\n' + applyNew + '\n', 'applyPublishedNewsFeed');
  text = once(text, /\s*function syncMedicineViewToggle\(\) \{[\s\S]*?\r?\n\s*function toggleMedicineList\(forceExpanded\) \{[\s\S]*?\r?\n\s*\}\r?\n(?=\r?\n\s*function openNewsStory)/, '\n  function syncMedicineViewToggle() {\n    updateMedicineViewButton();\n  }\n\n  function toggleMedicineList() {\n    renderNextMedicineChunk(false);\n    applyFilters();\n  }\n', 'medicine toggle');
  text = once(text, /\s*function refreshPopularStoryCards\(\) \{[\s\S]*?\r?\n\s*\}\r?\n(?=\r?\n\s*function syncControlStates)/, '\n  function refreshPopularStoryCards() {\n    // Most-viewed cards are generated from admin-published records, keeping title and newsId together.\n  }\n', 'popular refresh');
  text = once(text, /\s*itemRecords\.forEach\(\(item\) => \{[\s\S]*?\r?\n\s*\}\);\r?\n(?=\r?\n\s*desktopSearchInput\?\.addEventListener)/, '\n  itemRecords.forEach(bindNewsItemRecord);\n', 'bind loop');
  text = text.replace('.article-list .list-item.is-extra { display: none; }', '.article-list .list-item.is-extra { display: grid; }');
  fs.writeFileSync(file, text, 'utf8');
  console.log('patched', file);
}
