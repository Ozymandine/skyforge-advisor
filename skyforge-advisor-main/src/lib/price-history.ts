// src/lib/price-history.ts
// Client-side Bazaar price history. Snapshots are recorded while the app is
// open (throttled), persisted to localStorage, and pruned to a rolling window.
// We track the highest-volume products plus anything on the user's watchlist,
// so storage stays small while covering the items people actually trade.

import { useWatchlist } from "@/hooks/use-watchlist";

export type PricePoint = { t: number; v: number };

const STORAGE_KEY = "price-history-v1";
const MAX_POINTS_PER_ITEM = 96; // ~16h at 10-minute cadence
const SNAPSHOT_INTERVAL_MS = 10 * 60 * 1000;
const TOP_VOLUME_TRACKED = 150;

type HistoryStore = {
  lastSnapshot: number;
  series: Record<string, PricePoint[]>;
};

let store: HistoryStore | null = null;

function load(): HistoryStore {
  if (store) return store;
  // SSR guard: server render sees an empty store.
  if (typeof window === "undefined") {
    store = { lastSnapshot: 0, series: {} };
    return store;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    store =
      parsed && typeof parsed === "object" && parsed.series
        ? (parsed as HistoryStore)
        : { lastSnapshot: 0, series: {} };
  } catch {
    store = { lastSnapshot: 0, series: {} };
  }
  return store;
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Storage full or unavailable — keep in-memory only.
  }
}

/**
 * Record a snapshot of bazaar prices. Throttled internally; safe to call on
 * every fetch. Tracks top-volume products plus watchlist items.
 */
export function recordBazaarSnapshot(
  products: { id: string; buyPrice: number; buyMovingWeek: number }[],
  extraTrackedIds: string[] = [],
) {
  const db = load();
  const now = Date.now();
  if (now - db.lastSnapshot < SNAPSHOT_INTERVAL_MS) return false;

  const volumeSorted = [...products].sort((a, b) => b.buyMovingWeek - a.buyMovingWeek);
  const tracked = new Set<string>([
    ...volumeSorted.slice(0, TOP_VOLUME_TRACKED).map((p) => p.id),
    ...extraTrackedIds,
  ]);

  for (const product of products) {
    if (!tracked.has(product.id) || !(product.buyPrice > 0)) continue;
    const series = db.series[product.id] ?? [];
    series.push({ t: now, v: product.buyPrice });
    db.series[product.id] = series.slice(-MAX_POINTS_PER_ITEM);
  }

  // Drop series for items we no longer track (keeps storage bounded).
  for (const id of Object.keys(db.series)) {
    if (!tracked.has(id)) delete db.series[id];
  }

  db.lastSnapshot = now;
  persist();
  return true;
}

/** Price points for one item (oldest → newest). */
export function getPriceHistory(id: string): PricePoint[] {
  return load().series[id] ?? [];
}

/** How long ago the last snapshot was taken (ms), for UI hints. */
export function lastSnapshotAge(): number {
  return Date.now() - load().lastSnapshot;
}
