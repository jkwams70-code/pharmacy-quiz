const CACHE_VERSION = "ajix-app-shell-v128-subscription-cache";
const APP_SHELL_CACHE = `${CACHE_VERSION}:shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}:runtime`;

const SHELL_ASSETS = [
  "/",
  "/index.html",
"/engine.js?v=20260919-subscription-cache1",
  "/backendClient.js?v=20260913-entitlement-live1",
  "/offlineStore.js?v=20260907-idb-recovery-v1",
  "/subscription-state.js?v=20260919-cache2",
  "/subscription-route-lock.js?v=20260919-cache1",
  "/auth-lock.js",
  "/standalone-back.js?v=20260914-fast-back1",
  "/medlens-interactions-database.js",
  "/medlens-disease-database.js",
  "/styles.css",
  "/rotationTaxonomy.js",
  "/pwa-launch.html",
  "/manifest.webmanifest",
  "/admin/index.html",
  "/admin/manifest.webmanifest",
  "/app-update.json",
  "/icons/favicon-16.png",
  "/icons/favicon-32.png",
  "/icons/favicon-48.png",
  "/icons/favicon-180.png",
  "/icons/icon-192-f1.png",
  "/icons/icon-512-f1.png",
  "/images/app-logo.png",
  "/images/ajix-logo.png",
  "/guidelines.html",
"/news.html",
"/news-story.html",
"/medlens.html",
"/gppqe-data.js",
"/medlens-database.js",
];

function isSameOriginRequest(request) {
  return new URL(request.url).origin === self.location.origin;
}

async function cacheShellAssets() {
  const cache = await caches.open(APP_SHELL_CACHE);
  await Promise.all(
    SHELL_ASSETS.map(async (asset) => {
      try {
        await cache.add(new Request(asset, { cache: "reload" }));
      } catch {
        // Best-effort only. Missing optional assets should not block install.
      }
    }),
  );
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone()).catch(() => {});
    }
    return cached || response;
  } catch {
    return cached || Response.error();
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      await cacheShellAssets();
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("ajix-app-shell-v") && key !== APP_SHELL_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  if (!isSameOriginRequest(event.request)) return;

  // Never cache API responses. Auth, subscription, and admin data must be live.
  const requestUrl = new URL(event.request.url);
  if (requestUrl.pathname.startsWith("/api/")) return;
  if (requestUrl.pathname === "/data.js") {
    event.respondWith(new Response("Not found", { status: 404 }));
    return;
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);
      const isVersionedStatic = requestUrl.searchParams.has("v") && ["script", "style", "font", "image"].includes(event.request.destination);
      const refresh = fetch(event.request).then(async (response) => {
        if (response && response.ok) {
          const cache = await caches.open(RUNTIME_CACHE);
          await cache.put(event.request, response.clone());
        }
        return response;
      });

      if (cached && isVersionedStatic) {
        event.waitUntil(refresh.catch(() => {}));
        return cached;
      }

      try {
        return await refresh;
      } catch {
  if (cached) return cached;

  if (
    event.request.mode === "navigate" ||
    event.request.destination === "document"
  ) {
    return caches.match("/index.html");
  }

  return Response.error();
}
    })(),
  );
});




