const fs = require('fs');
const files = [
  'C:/Users/John_Israel/Desktop/AJIXPHARM/AjixPharmacy-mainmerge/www/news.html',
  'C:/Users/John_Israel/Desktop/AJIXPHARM/AjixPharmacy-mainmerge/android/app/src/main/assets/public/news.html',
];
const restoreBlock = String.raw`  function updateSavedButtonStates() {
    itemRecords.forEach((item) => {
      const state = getItemState(item.id);
      item.saveBtn?.classList.toggle('saved', state.bookmarked);
      item.saveBtn?.setAttribute('aria-pressed', String(state.bookmarked));
      item.readLaterBtn?.classList.toggle('liked', state.readLater);
      item.readLaterBtn?.setAttribute('aria-pressed', String(state.readLater));
    });
  }

  function updateSavedCounts() {
    let bookmarks = 0;
    let readLater = 0;
    Object.values(savedState).forEach((state) => {
      if (state?.bookmarked) bookmarks += 1;
      if (state?.readLater) readLater += 1;
    });
    countTargets.forEach((target) => {
      const key = target.getAttribute('data-news-count');
      if (key === 'bookmarks') target.textContent = String(bookmarks);
      if (key === 'read-later') target.textContent = String(readLater);
    });
  }

  function itemMatchesFilter(item) {
    if (item.element.classList.contains('side-card')) return true;
    const matchesGlobalFilter = (() => {
      if (currentFilter.startsWith('topic:')) return item.topics.includes(currentFilter.slice(6));
      switch (currentFilter) {
        case 'all': return true;
        case 'alert': return item.isAlert;
        case 'bookmarks': return getItemState(item.id).bookmarked;
        case 'read-later': return getItemState(item.id).readLater;
        default: return item.filter === currentFilter;
      }
    })();
    const matchesLatestFilter = item.feedSlot !== NEWS_FEED_SLOTS.latest || currentLatestFilter === 'all' || item.filter === currentLatestFilter;
    return matchesGlobalFilter && matchesLatestFilter;
  }

  function itemMatchesQuery(item) {
    if (item.element.classList.contains('side-card')) return true;
    if (!currentQuery.trim()) return true;
    return item.searchableText.includes(currentQuery.trim().toLowerCase());
  }

  function applyFilters() {
    itemRecords.forEach((item) => {
      const visible = itemMatchesFilter(item) && itemMatchesQuery(item);
      item.element.classList.toggle('news-filter-hidden', !visible);
    });
    updateSavedButtonStates();
    updateSavedCounts();
    refreshPopularStoryCards();
    syncHeroCarouselToVisibleSlides();
  }

  itemRecords.forEach(bindNewsItemRecord);
`;
for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  const start = text.indexOf('  function updateSavedButtonStates() {');
  const end = text.indexOf('  desktopSearchInput?.addEventListener', start);
  if (start < 0 || end < 0) throw new Error('Missing damaged saved/filter block in ' + file);
  text = text.slice(0, start) + restoreBlock + '\n' + text.slice(end);
  fs.writeFileSync(file, text, 'utf8');
  console.log('restored', file);
}
