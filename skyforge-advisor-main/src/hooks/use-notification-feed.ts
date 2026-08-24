// src/hooks/use-notification-feed.ts
// Shared, persisted notification feed. The /notifications page produces
// entries; the header bell (and anywhere else) consumes the same store.

import { useEffect, useReducer } from "react";
import { fetchServerNotifications } from "@/lib/hypixel.functions";

export type FeedItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  kind: string;
  unread: boolean;
};

const STORAGE_KEY = "notification-feed";
const MAX_ITEMS = 50;

function load(): FeedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

let items: FeedItem[] = [];
let hydrated = false;

const listeners = new Set<() => void>();

function emit() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // In-memory fallback for private browsing.
  }
  for (const listener of listeners) listener();
}

function ensureHydrated() {
  if (!hydrated) {
    items = load();
    hydrated = true;
  }
}

/** Push new notifications (deduplicated by id, newest first, capped). */
export function pushFeed(fresh: FeedItem[]) {
  ensureHydrated();
  if (fresh.length === 0) return;
  const existing = new Set(items.map((i) => i.id));
  const unique = fresh.filter((f) => !existing.has(f.id));
  if (unique.length === 0) return;
  items = [...unique, ...items].slice(0, MAX_ITEMS);
  emit();
}

export function markAllRead() {
  ensureHydrated();
  items = items.map((i) => ({ ...i, unread: false }));
  emit();
}

export function clearFeed() {
  ensureHydrated();
  items = [];
  emit();
}

/** Subscribe a component to the shared feed. */
export function useNotificationFeed() {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    ensureHydrated();
    const listener = () => forceUpdate();
    listeners.add(listener);
    forceUpdate(); // pick up anything pushed before mount

    // Pull server-side notifications (alerts fired while the app was closed).
    let cancelled = false;
    void fetchServerNotifications().then((serverItems) => {
      if (cancelled || !Array.isArray(serverItems) || serverItems.length === 0) return;
      const known = new Set(items.map((i) => i.id));
      const fresh = serverItems
        .filter((n) => !known.has(n.id))
        .map((n) => ({
          id: n.id,
          title: n.title,
          body: n.body,
          time: n.time,
          kind: n.kind,
          unread: n.unread,
        }));
      if (fresh.length > 0) pushFeed(fresh);
    });

    return () => {
      cancelled = true;
      listeners.delete(listener);
    };
  }, []);

  return {
    items,
    unreadCount: items.filter((i) => i.unread).length,
    markAllRead,
    clearFeed,
  };
}
