const fs = require('fs');
const files = [
  'C:/Users/John_Israel/Desktop/AJIXPHARM/AjixPharmacy-mainmerge/www/news.html',
  'C:/Users/John_Israel/Desktop/AJIXPHARM/AjixPharmacy-mainmerge/android/app/src/main/assets/public/news.html',
];
const replacement = String.raw`  function getVisibleHeroSlides() {
    return heroSlides.filter((slide) => !slide.classList.contains('news-filter-hidden') && !slide.hidden);
  }

  function setHeroSlide(nextIndex) {
    if (!heroSlides.length) return;
    const availableSlides = getVisibleHeroSlides();
    const slidesToUse = availableSlides.length ? availableSlides : heroSlides;
    const total = slidesToUse.length;
    heroSlideIndex = ((nextIndex % total) + total) % total;
    heroSlides.forEach((slide) => slide.classList.remove('active'));
    slidesToUse[heroSlideIndex]?.classList.add('active');
  }

  function syncHeroCarouselToVisibleSlides() {
    if (!heroSlides.length) return;
    const visibleSlides = getVisibleHeroSlides();
    if (!visibleSlides.length) return;
    const activeSlide = heroSlides.find((slide) => slide.classList.contains('active'));
    const activeVisibleIndex = visibleSlides.indexOf(activeSlide);
    setHeroSlide(activeVisibleIndex >= 0 ? activeVisibleIndex : 0);
  }

  function stopHeroRotation() {
    if (heroTimer) {
      window.clearInterval(heroTimer);
      heroTimer = null;
    }
  }

  function startHeroRotation() {
    if (!heroSlides.length) return;
    stopHeroRotation();
    heroTimer = window.setInterval(() => setHeroSlide(heroSlideIndex + 1), 7000);
  }

  function bumpHeroSlide(delta) {
    setHeroSlide(heroSlideIndex + delta);
    startHeroRotation();
  }

  const footerSheetContent = {
    about: {
      title: 'About',
      body: '<p><strong>Ajix News</strong> gathers health, pharmacy, and clinical updates in a quick-reading format.</p><p>It is built for fast scanning, easy reading on mobile, and a calmer way to keep up with important updates.</p>',
    },
    privacy: {
      title: 'Privacy',
      body: '<p>This news page may remember lightweight preferences such as theme and reading state on your device.</p><p>If you open an external link, that destination controls its own privacy and cookies policy.</p>',
    },
    terms: {
      title: 'Terms',
      body: '<p>Use Ajix News for learning, browsing, and general information. It is not a substitute for formal clinical advice.</p><ul><li>Always verify important medical details with trusted sources.</li><li>Stories may link out to third-party sources with their own rules.</li><li>Content is provided for informational use only.</li></ul>',
    },
    contact: {
      title: 'Contact',
      body: '<p>Reach the Ajix team through the same support channels used on the home page.</p><div class="footer-sheet-contact-list"><a class="footer-sheet-contact-btn" href="mailto:ajixpharmacy@gmail.com"><span>Email</span><span>ajixpharmacy@gmail.com</span></a><a class="footer-sheet-contact-btn" href="https://wa.me/233595597218" target="_blank" rel="noopener noreferrer"><span>WhatsApp</span><span>+233 595 597 218</span></a></div>',
    },
  };

  function renderFooterSheet(topic = 'about') {
    const entry = footerSheetContent[topic] || footerSheetContent.about;
    if (footerSheetTitle) footerSheetTitle.textContent = entry.title;
    if (footerSheetBody) footerSheetBody.innerHTML = entry.body;
  }

  function openFooterSheet(topic = 'about') {
    renderFooterSheet(topic);
    footerSheet?.classList.add('is-open');
    footerSheetBackdrop?.classList.add('is-open');
    footerSheet?.setAttribute('aria-hidden', 'false');
    footerSheetBackdrop?.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-footer-sheet-open');
  }

  function closeFooterSheet() {
    footerSheet?.classList.remove('is-open');
    footerSheetBackdrop?.classList.remove('is-open');
    footerSheet?.setAttribute('aria-hidden', 'true');
    footerSheetBackdrop?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-footer-sheet-open');
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
  }`;
for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  const start = text.indexOf('  function syncControlStates() {');
  const end = text.indexOf('\n\n  function updateSavedButtonStates()', start);
  if (start < 0 || end < 0) throw new Error('Could not find malformed syncControlStates block in ' + file);
  text = text.slice(0, start) + replacement + text.slice(end);
  fs.writeFileSync(file, text, 'utf8');
  console.log('fixed scope', file);
}
