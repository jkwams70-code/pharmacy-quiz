const CACHE_VERSION = "ajix-quiz-v10-iconsource1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/styles.css?v=20260228-darkfix2",
  "/engine.js?v=20260228-darkfix2",
  "/data.js",
  "/backendClient.js",
  "/manifest.webmanifest?v=20260301-pwasplit2",
  "/admin-manifest.webmanifest?v=20260301-adminpwa3",
  "/icons/icon-192-f1.png?v=20260301-iconsource1",
  "/icons/icon-512-f1.png?v=20260301-iconsource1",
  "/icons/favicon-48.png?v=20260301-iconsource1",
  "/icons/favicon-32.png?v=20260301-iconsource1",
  "/icons/favicon-16.png?v=20260301-iconsource1",
  "/icons/favicon-180.png?v=20260301-iconsource1",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never cache API calls.
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // App-shell navigation: network first, offline fallback to cached index.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cachedPage = await caches.match(request);
          if (cachedPage) return cachedPage;
          return caches.match("/index.html");
        }),
    );
    return;
  }

  // Static assets: cache first, then network.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const copy = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
        return response;
      });
    }),
  );
});

