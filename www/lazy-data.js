(function installAjixLazyDataLoader() {
  const inFlight = new Map();
  const cache = new Map();

  async function requestJson(url, options = {}, settings = {}) {
    const key = String(settings.key || url);
    const ttl = Math.max(0, Number(settings.ttl) || 0);
    const cached = cache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.value;
    if (inFlight.has(key)) return inFlight.get(key);

    const controller = new AbortController();
    const timeoutMs = Math.max(1000, Number(settings.timeoutMs) || 8000);
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);
    const promise = fetch(url, { ...options, signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
        if (ttl > 0) cache.set(key, { value: payload, expiresAt: Date.now() + ttl });
        return payload;
      })
      .finally(() => {
        window.clearTimeout(timer);
        inFlight.delete(key);
      });

    inFlight.set(key, promise);
    return promise;
  }

  window.AJIX_LAZY_DATA = {
    requestJson,
    clear(key) {
      if (key) cache.delete(String(key));
      else cache.clear();
    },
  };
})();
