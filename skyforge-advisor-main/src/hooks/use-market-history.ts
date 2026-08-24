// src/hooks/use-market-history.ts
// Access server-recorded market history (survives across sessions/visitors)
// and merge it with the client's own localStorage snapshots.

import { useQuery } from "@tanstack/react-query";
import { fetchPriceHistory } from "@/lib/hypixel.functions";
import type { PricePoint } from "@/lib/price-history";

type MarketPoint = { t: number; b?: number; s?: number; bin?: number };

/**
 * Fetch server-side history for a set of item ids over a time range.
 * Returns a map of id → price points (oldest → newest).
 */
export function useServerHistory(ids: string[], rangeHours = 24, enabled = true) {
  const key = [...ids].sort().join(",");
  const { data, isLoading } = useQuery({
    queryKey: ["market-history", key, rangeHours],
    queryFn: () => fetchPriceHistory({ data: { ids, rangeHours } }),
    enabled: enabled && ids.length > 0,
    staleTime: 5 * 60_000,
  });

  const series = new Map<string, PricePoint[]>();
  if (data) {
    for (const [id, points] of Object.entries(data)) {
      series.set(
        id,
        (points as MarketPoint[]).map((p) => ({
          t: p.t,
          v: p.bin ?? p.b ?? p.s ?? 0,
        })),
      );
    }
  }
  return { series, isLoading };
}

/** Merge local and server series, deduped by timestamp, oldest → newest. */
export function mergeHistory(local: PricePoint[], server: PricePoint[]): PricePoint[] {
  if (!server.length) return local;
  const byTime = new Map<number, PricePoint>();
  for (const p of [...local, ...server]) byTime.set(p.t, p);
  return [...byTime.entries()].sort((a, b) => a[0] - b[0]).map(([, p]) => p);
}
