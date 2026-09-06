import {
  enqueueAction,
  flushQueue,
  getEntry,
  removeEntry,
  setEntry,
} from "./offlineStore.js";

const OFFLINE_CACHE_VERSION = 1;

function safePart(value) {
  return String(value || "").trim().replace(/[^a-zA-Z0-9._:-]/g, "_");
}

export function offlineCacheKey(domain, scope = "global") {
  const safeDomain = safePart(domain);
  const safeScope = safePart(scope) || "global";
  return `cache:${OFFLINE_CACHE_VERSION}:${safeDomain}:${safeScope}`;
}

export async function readOfflineCache(domain, scope = "global") {
  const entry = await getEntry(offlineCacheKey(domain, scope));
  const value = entry?.value;
  if (!value || typeof value !== "object") return null;

  return {
    data: value.data,
    savedAt: Number(value.savedAt) || Number(entry.updatedAt) || 0,
    version: Number(value.version) || 0,
  };
}

export async function writeOfflineCache(domain, data, {
  scope = "global",
  contentVersion = "",
} = {}) {
  return setEntry(offlineCacheKey(domain, scope), {
    data,
    contentVersion: String(contentVersion || ""),
    savedAt: Date.now(),
    version: OFFLINE_CACHE_VERSION,
  });
}

export async function clearOfflineCache(domain, scope = "global") {
  return removeEntry(offlineCacheKey(domain, scope));
}

export async function queueOfflineAction(action) {
  return enqueueAction({
    ...action,
    createdAt: Number(action?.createdAt) || Date.now(),
  });
}

export async function syncOfflineActions(processor) {
  if (typeof processor !== "function" || !isOnline()) return [];
  return flushQueue(processor);
}

export function isOnline() {
  return typeof navigator === "undefined" || navigator.onLine !== false;
}

export function onOfflineReconnect(callback) {
  if (typeof window === "undefined" || typeof callback !== "function") {
    return () => {};
  }

  const handleOnline = () => {
    void callback();
  };
  window.addEventListener("online", handleOnline);
  return () => window.removeEventListener("online", handleOnline);
}
