import {
  parseHistoryPoints,
  type ExternalPriceHistory,
  type HistoryFailure,
  type HistoryMarket,
} from "./coflnet-history";

// Documented routes and object schemas: https://sky.coflnet.com/api
// Cache and in-flight requests are shared within this server process.
const cache = new Map<string, { until: number; data: ExternalPriceHistory }>();
const pending = new Map<string, Promise<ExternalPriceHistory>>();
const CACHE_MS = 15 * 60_000;
const DAY_MS = 86_400_000;

export function getExternalPriceHistory(
  itemId: string,
  days: number,
  market: HistoryMarket,
): Promise<ExternalPriceHistory> {
  const key = `${market}:${itemId}:${days}`;
  const cached = cache.get(key);
  const now = Date.now();
  if (cached && cached.until > now) return Promise.resolve(cached.data);
  const existing = pending.get(key);
  if (existing) return existing;

  const url = new URL(
    market === "bazaar"
      ? `https://sky.coflnet.com/api/bazaar/${encodeURIComponent(itemId)}/history`
      : `https://sky.coflnet.com/api/item/price/${encodeURIComponent(itemId)}/history/${days > 30 ? "full" : days <= 7 ? "week" : "month"}`,
  );
  if (market === "bazaar") {
    url.searchParams.set("start", new Date(now - days * DAY_MS).toISOString());
    url.searchParams.set("end", new Date(now).toISOString());
  }
  const base = { source: "coflnet" as const, market, days, fetchedAt: now, sourceUrl: url.href };
  const failureResult = (failure: HistoryFailure): ExternalPriceHistory =>
    cached?.data.points.length
      ? { ...cached.data, status: "stale", failure }
      : { ...base, status: "unavailable", failure, points: [] };

  const request = (async (): Promise<ExternalPriceHistory> => {
    let result: ExternalPriceHistory;
    try {
      const response = await fetch(url.href, {
        signal: AbortSignal.timeout(10_000),
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        result = failureResult(
          response.status === 429
            ? "rate-limited"
            : response.status === 401 || response.status === 403
              ? "restricted"
              : "upstream",
        );
      } else {
        const parsed = parseHistoryPoints(await response.json(), market);
        if (!parsed) result = failureResult("invalid-response");
        else {
          const points = parsed.filter(
            (point) => point.t >= now - days * DAY_MS && point.t <= now + 60_000,
          );
          result = { ...base, points, status: points.length >= 2 ? "ready" : "empty" };
        }
      }
    } catch {
      result = failureResult("upstream");
    }
    cache.set(key, {
      data: result,
      until:
        Date.now() +
        (result.status === "unavailable" || result.status === "stale" ? 30_000 : CACHE_MS),
    });
    while (cache.size > 100) cache.delete(cache.keys().next().value!);
    return result;
  })().finally(() => pending.delete(key));
  pending.set(key, request);
  return request;
}
