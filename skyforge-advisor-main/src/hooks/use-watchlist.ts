// src/hooks/use-watchlist.ts
// Persisted item watchlist — used by the bazaar/auction pages for starring
// markets and filtering to watched items only.

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "watchlist";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function useWatchlist() {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    setItems(read());
  }, []);

  const persist = useCallback((next: string[]) => {
    setItems(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage unavailable (private mode) — keep in-memory only.
    }
  }, []);

  const toggle = useCallback(
    (id: string) => {
      const current = read();
      persist(current.includes(id) ? current.filter((v) => v !== id) : [...current, id]);
    },
    [persist],
  );

  const has = useCallback((id: string) => items.includes(id), [items]);

  return { items, toggle, has };
}
