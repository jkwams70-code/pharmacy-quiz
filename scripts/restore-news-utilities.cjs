const fs = require('fs');
const files = [
  'C:/Users/John_Israel/Desktop/AJIXPHARM/AjixPharmacy-mainmerge/www/news.html',
  'C:/Users/John_Israel/Desktop/AJIXPHARM/AjixPharmacy-mainmerge/android/app/src/main/assets/public/news.html',
];
const utilities = String.raw`
  function getRecordsByClass(className) {
    return itemRecords.filter((item) => item?.element && item.element.classList.contains(className));
  }

  function resolveRecordElement(record) {
    if (!record) return null;
    if (record.element && typeof record.element === 'object') return record.element;
    return typeof record === 'object' ? record : null;
  }

  function hideUnusedRecords(records = []) {
    records.forEach((record) => {
      const element = resolveRecordElement(record);
      if (!element) return;
      element.hidden = true;
      element.classList.add('news-filter-hidden');
    });
  }

  function revealRecord(record) {
    const element = resolveRecordElement(record);
    if (!element) return;
    element.hidden = false;
    element.classList.remove('news-filter-hidden');
  }

  let newsEmptyStateEl = null;

  function hideNewsEmptyState() {
    if (!newsEmptyStateEl) return;
    newsEmptyStateEl.hidden = true;
    newsEmptyStateEl.textContent = '';
  }

  function showNewsEmptyState(message = 'No published stories are available yet.') {
    const content = document.querySelector('.main-content');
    if (!content) return;
    if (!newsEmptyStateEl) {
      newsEmptyStateEl = document.createElement('section');
      newsEmptyStateEl.className = 'news-empty-state';
      newsEmptyStateEl.style.margin = '24px 0 32px';
      newsEmptyStateEl.style.padding = '24px';
      newsEmptyStateEl.style.border = '1px solid var(--border)';
      newsEmptyStateEl.style.borderRadius = '24px';
      newsEmptyStateEl.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,250,252,0.96))';
      newsEmptyStateEl.style.boxShadow = '0 10px 30px rgba(15,23,42,0.06)';
      newsEmptyStateEl.style.color = 'var(--text-primary)';
      newsEmptyStateEl.style.display = 'grid';
      newsEmptyStateEl.style.gap = '8px';
      content.appendChild(newsEmptyStateEl);
    }
    newsEmptyStateEl.hidden = false;
    newsEmptyStateEl.innerHTML = '<h3 style="margin:0;font-size:20px;line-height:1.2;">No published stories yet</h3><p style="margin:0;color:var(--text-secondary);max-width:48rem;">' + message + '</p>';
  }

  async function hydratePublishedNewsFeed() {
    const cachedFeed = loadCachedPublishedNewsFeed();
    if (cachedFeed) applyPublishedNewsFeed(normalizePublishedNewsFeed(cachedFeed));
    try {
      const apiBase = await ensureNewsApiBase();
      const response = await fetch(apiBase + '/news/feed?limit=200', { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to load published news (' + response.status + ')');
      const feed = normalizePublishedNewsFeed(await response.json());
      saveCachedPublishedNewsFeed(feed);
      applyPublishedNewsFeed(feed);
      setNewsShellReady();
    } catch (error) {
      console.warn('Could not load live news feed:', error);
      if (!cachedFeed) {
        hideUnusedRecords(contentItems);
        showNewsEmptyState('The published feed could not be loaded right now.');
      } else {
        setNewsShellReady();
      }
      setNewsShellReady();
    }
  }
`;
for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  if (text.includes('function hideUnusedRecords(records = [])')) {
    console.log('already has utilities', file);
    continue;
  }
  const marker = '  hideUnusedRecords(contentItems);';
  if (!text.includes(marker)) throw new Error('Missing startup hide marker in ' + file);
  text = text.replace(marker, utilities + '\n' + marker);
  fs.writeFileSync(file, text, 'utf8');
  console.log('restored utilities', file);
}
