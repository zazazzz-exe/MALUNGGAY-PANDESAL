import { useSyncExternalStore } from "react";

const KEY = "hearth_notifications_dismissed";

const readFromStorage = (): Set<string> => {
  if (typeof window === "undefined") {
    return new Set();
  }
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      return new Set();
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return new Set();
    }
    return new Set(parsed.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
};

let cache = readFromStorage();
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notify = () => listeners.forEach((l) => l());
const getSnapshot = () => cache;

const persist = () => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify([...cache]));
  } catch {
    // ignore
  }
};

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === KEY) {
      cache = readFromStorage();
      notify();
    }
  });
}

export const useNotificationsDismissed = () => {
  const dismissed = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const dismiss = (id: string) => {
    if (cache.has(id)) {
      return;
    }
    cache = new Set(cache);
    cache.add(id);
    persist();
    notify();
  };

  const reset = () => {
    cache = new Set();
    persist();
    notify();
  };

  return { dismissed, dismiss, reset };
};
