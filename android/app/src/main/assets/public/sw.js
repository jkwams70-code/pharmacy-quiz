const CUTOVER_VERSION = "ajix-quiz-cutover-v39";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.clients.claim();
      const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      await Promise.all(
        clients.map((client) => {
          if ("navigate" in client) {
            return client.navigate(client.url);
          }
          return Promise.resolve();
        }),
      );
      await self.registration.unregister();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "QUIZ_APP_CUTOVER_VERSION") {
    event.source?.postMessage?.({ type: "QUIZ_APP_CUTOVER_VERSION", version: CUTOVER_VERSION });
  }
});
