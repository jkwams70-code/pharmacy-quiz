import {
  isOnline,
  onOfflineReconnect,
  readOfflineCache,
  writeOfflineCache,
} from "./offlineRepository.js";

// Restores stale data first, then refreshes it without blocking the screen.
export async function cacheFirstRefresh({
  domain,
  scope = "global",
  apply,
  refresh,
  contentVersion = "",
  onError,
} = {}) {
  if (typeof apply !== "function") return null;

  const cached = await readOfflineCache(domain, scope).catch(() => null);
  if (cached?.data !== undefined) {
    apply(cached.data, { cached: true, savedAt: cached.savedAt });
  }

  if (typeof refresh !== "function" || !isOnline()) return cached?.data ?? null;

  void Promise.resolve()
    .then(() => refresh())
    .then(async (fresh) => {
      if (fresh === undefined || fresh === null) return;
      await writeOfflineCache(domain, fresh, { scope, contentVersion });
      apply(fresh, { cached: false, savedAt: Date.now() });
    })
    .catch((error) => {
      if (typeof onError === "function") onError(error);
    });

  return cached?.data ?? null;
}

export function watchOfflineReconnect(refresh) {
  return onOfflineReconnect(() => {
    if (typeof refresh === "function") return refresh();
    return undefined;
  });
}
