(function () {
  function install() {
    if (!window.__AJIX_MEDLENS_SUMMARY_FETCH__) {
      const nativeFetch = window.fetch.bind(window);
      window.fetch = function (input, options) {
        const method = String(options?.method || 'GET').toUpperCase();
        const rawUrl = typeof input === 'string' ? input : input?.url || '';
        if (method === 'GET' && /\/admin\/medlens\/(drugs|diseases|interactions)(?:\?|$)/.test(rawUrl) && !/[?&]summary=1(?:&|$)/.test(rawUrl)) {
          input = rawUrl + (rawUrl.includes('?') ? '&' : '?') + 'summary=1';
        }
        return nativeFetch(input, options);
      };
      window.__AJIX_MEDLENS_SUMMARY_FETCH__ = true;
    }
    async function openDetail(kind, id, render, actions) {
      const screen = document.getElementById('previewScreen');
      if (!screen) return;
      if (!screen.parentElement) document.body.appendChild(screen);
      screen.classList.add('open');
      screen.style.display = 'block';
      screen.style.position = 'fixed';
      screen.style.inset = '0';
      screen.style.zIndex = '99999';
      screen.style.background = '#f4f7fb';
      screen.style.overflow = 'auto';
      document.body.style.overflow = 'hidden';
      const content = document.getElementById('previewContent');
      if (content) content.innerHTML = '<div class="notice"><strong>Loading record</strong>Opening the full MedLens record...</div>';
      try {
        const base = localStorage.getItem('quizApiBase') || (location.hostname === 'localhost' ? 'http://localhost:4000/api' : '/api');
        const response = await fetch(base + '/admin/medlens/' + kind + '/' + encodeURIComponent(id), { headers: { 'x-admin-key': localStorage.getItem('adminKey') || '' } });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Unable to load record');
        const item = result.item || result;
        render(item);
        const actionsNode = document.getElementById('previewActions');
        if (actionsNode) actionsNode.innerHTML = actions(item);
      } catch (error) {
        if (content) content.innerHTML = '<div class="notice"><strong>Record unavailable</strong>' + (window.previewText ? window.previewText(error.message) : error.message) + '</div>';
      }
    }
    window.viewDrug = (id) => openDetail('drugs', id, window.renderAdminDrugPreview, window.previewActionMarkup);
    window.viewDisease = (id) => openDetail('diseases', id, window.renderAdminDiseasePreview, window.diseasePreviewActions);
    window.viewInteraction = (id) => openDetail('interactions', id, window.renderInteractionPreview, window.interactionPreviewActions);
  }
  window.addEventListener('load', install, { once: true });
  window.setTimeout(install, 0);
})();
