const CACHE_VERSION = "ajix-app-shell-v57";
const APP_SHELL_CACHE = `${CACHE_VERSION}:shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}:runtime`;

const SHELL_ASSETS = [
  "/",
  "/index.html",
  "/engine.js?v=20260620-smooth-cache-fix10",
  "/backendClient.js?v=20260619-cross-device-sync-fix3",
  "/styles.css",
  "/data.js?v=20260613-manufacturing-set2",
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
  const { request } = event;
  if (request.method !== "GET" || !isSameOriginRequest(request)) {
    return;
  }

  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(APP_SHELL_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;

        try {
          const response = await fetch(request);
          if (response && response.ok) {
            cache.put(request, response.clone()).catch(() => {});
          }
          return response;
        } catch {
          return (
            (await cache.match("/index.html")) ||
            (await cache.match("/")) ||
            Response.error()
          );
        }
      })(),
    );
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});
