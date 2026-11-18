export type HistoryMarket = "auction" | "bazaar";
export type HistoryPoint = { t: number; v: number; sell?: number; volume?: number };
export type HistoryFailure = "rate-limited" | "restricted" | "invalid-response" | "upstream";
export type ExternalPriceHistory = {
  source: "coflnet";
  status: "ready" | "empty" | "unavailable" | "stale";
  market: HistoryMarket;
  days: number;
  fetchedAt: number;
  sourceUrl: string;
  points: HistoryPoint[];
  failure?: HistoryFailure;
};

function utcTimestamp(value: unknown): number {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(value)) return NaN;
  // Coflnet returns UTC values without an offset as well as explicit ISO UTC.
  return Date.parse(/(?:Z|[+-]\d{2}:\d{2})$/i.test(value) ? value : value + "Z");
}

export function parseHistoryPoints(raw: unknown, market: HistoryMarket): HistoryPoint[] | null {
  if (!Array.isArray(raw)) return null;
  const byTime = new Map<number, HistoryPoint>();
  for (const value of raw) {
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;
    const row = value as Record<string, unknown>;
    const t = utcTimestamp(market === "bazaar" ? row["timestamp"] : row["time"]);
    const v = market === "bazaar" ? row["buy"] : row["avg"];
    if (!Number.isFinite(t) || typeof v !== "number" || !Number.isFinite(v) || v <= 0) continue;
    if (market === "bazaar") {
      const sell = row["sell"];
      if (typeof sell !== "number" || !Number.isFinite(sell) || sell <= 0) continue;
      byTime.set(t, { t, v, sell });
    } else {
      const volume = row["volume"];
      byTime.set(t, {
        t,
        v,
        ...(typeof volume === "number" && Number.isSafeInteger(volume) && volume >= 0
          ? { volume }
          : {}),
      });
    }
  }
  if (raw.length && !byTime.size) return null;
  return [...byTime.values()].sort((a, b) => a.t - b.t);
}
