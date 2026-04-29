import { useSyncExternalStore } from "react";

const KEY = "hearth_nicknames";
const HINT_KEY = "hearth_nicknames_hint_seen";

const readFromStorage = (): Record<string, string> => {
  if (typeof window === "undefined") {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof k === "string" && typeof v === "string") {
        out[k] = v;
      }
    }
    return out;
  } catch {
    return {};
  }
};

let cache: Record<string, string> = readFromStorage();
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notify = () => {
  listeners.forEach((l) => l());
};

const writeToStorage = (next: Record<string, string>) => {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // localStorage may be unavailable (private mode etc.) — keep in-memory cache anyway.
  }
  notify();
};

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === KEY) {
      cache = readFromStorage();
      notify();
    }
  });
}

const getSnapshot = () => cache;

export const useNicknames = () => {
  const nicknames = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setNickname = (address: string, name: string) => {
    if (!address) {
      return;
    }
    const trimmed = name.trim();
    const next = { ...cache };
    if (!trimmed) {
      delete next[address];
    } else {
      next[address] = trimmed;
    }
    writeToStorage(next);
  };

  const getNickname = (address: string | null | undefined): string | null => {
    if (!address) {
      return null;
    }
    return cache[address] || null;
  };

  return { nicknames, setNickname, getNickname };
};

export const hasSeenNicknameHint = (): boolean => {
  if (typeof window === "undefined") {
    return true;
  }
  try {
    return window.localStorage.getItem(HINT_KEY) === "1";
  } catch {
    return true;
  }
};

export const markNicknameHintSeen = (): void => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(HINT_KEY, "1");
  } catch {
    // ignore
  }
};
