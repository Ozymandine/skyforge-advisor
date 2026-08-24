// src/hooks/use-net-worth-history.ts
// Records a net-worth snapshot per profile at most once per hour, persisted in
// localStorage, so the Net Worth page can chart growth over time.

import { useEffect, useState } from "react";

export type Snapshot = { t: number; v: number };

const STORAGE_KEY = "net-worth-history";
const MAX_POINTS = 120;
const MIN_INTERVAL_MS = 60 * 60_000; // 1 hour between snapshots

type Store = Record<string, Snapshot[]>;

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Record + read snapshots for a profile. Call with the current total whenever
 * fresh player data arrives — deduplication is handled internally.
 */
export function useNetWorthHistory(profileId: string | undefined, total: number) {
  const [history, setHistory] = useState<Snapshot[]>([]);

  useEffect(() => {
    if (!profileId || !Number.isFinite(total) || total <= 0) return;

    const store = read();
    const points = store[profileId] ?? [];
    const last = points[points.length - 1];

    // Skip if we already have a recent snapshot.
    if (last && Date.now() - last.t < MIN_INTERVAL_MS) {
      setHistory(points);
      return;
    }

    // Skip if the value hasn't meaningfully changed (<0.5%).
    if (last && Math.abs(total - last.v) / Math.max(1, last.v) < 0.005) {
      setHistory(points);
      return;
    }

    const next = [...points, { t: Date.now(), v: total }].slice(-MAX_POINTS);
    store[profileId] = next;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
      // Storage full/unavailable — keep in-memory only.
    }
    setHistory(next);
  }, [profileId, total]);

  return history;
}
