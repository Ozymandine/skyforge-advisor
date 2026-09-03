// server/api/flips.ts
// Public JSON endpoint: current top flip suggestions + published accuracy.
// Registered as a Nitro handler in vite.config.ts (route: /api/flips).
// CORS allowlisted + rate-limited — intended for mods and third-party tools.

import { defineEventHandler, getHeader, setHeader } from "h3";

const ALLOWED_ORIGINS = (process.env["PUBLIC_API_ORIGINS"] ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// Simple per-isolate token bucket: 30 req/min shared. Prevents quota burn
// from hot-looping clients; Vercel isolates make this best-effort.
let windowStart = 0;
let windowCount = 0;
const RATE_LIMIT = 30;
const WINDOW_MS = 60_000;

function rateLimited(): boolean {
  const now = Date.now();
  if (now - windowStart > WINDOW_MS) {
    windowStart = now;
    windowCount = 0;
  }
  windowCount += 1;
  return windowCount > RATE_LIMIT;
}

function corsOrigin(event: Parameters<Parameters<typeof defineEventHandler>[0]>[0]) {
  const origin = getHeader(event, "origin");
  if (!origin) return null;
  if (ALLOWED_ORIGINS.length === 0) return null;
  return ALLOWED_ORIGINS.includes(origin) ? origin : null;
}

export default defineEventHandler(async (event) => {
  const origin = corsOrigin(event);
  if (origin) {
    setHeader(event, "Access-Control-Allow-Origin", origin);
    setHeader(event, "Vary", "Origin");
  }
  setHeader(event, "Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");

  if (rateLimited()) {
    setHeader(event, "Retry-After", "60");
    return { error: "Rate limited", retryAfterMs: 60_000 };
  }

  const [{ getBazaar, getAuctions }, market] = await Promise.all([
    import("../../src/lib/hypixel.server"),
    import("../../src/lib/market-history.server"),
  ]);

  const [bazaar, auctions] = await Promise.all([getBazaar(), getAuctions(6)]);

  const prices = new Map<string, number>();
  for (const p of bazaar.products) prices.set(p.id, p.sellPrice);
  for (const e of auctions.entries) {
    if (e.id && e.lowestBin != null) {
      const existing = prices.get(e.id);
      if (existing == null || e.lowestBin < existing) prices.set(e.id, e.lowestBin);
    }
  }

  const topBazaar = [...bazaar.products]
    .sort((a, b) => b.profitPerHour - a.profitPerHour)
    .slice(0, 25)
    .map((p) => ({
      id: p.id,
      name: p.name,
      buy: p.buyPrice,
      sell: p.sellPrice,
      marginPct: Number(p.margin.toFixed(2)),
      profitPerHour: Math.round(p.profitPerHour),
      weeklyVolume: p.buyMovingWeek + p.sellMovingWeek,
    }));

  const topAuctions = auctions.entries
    .filter((e) => e.bin && e.profit > 0)
    .slice(0, 25)
    .map((e) => ({
      uuid: e.uuid,
      id: e.id ?? null,
      name: e.name,
      price: e.price,
      lowestBin: e.lowestBin,
      profit: Math.round(e.profit),
      endsInMs: e.endsInMs,
    }));

  return {
    updatedAt: new Date().toISOString(),
    bazaar: topBazaar,
    auctions: topAuctions,
    accuracy: market.getFlipAccuracy(prices),
  };
});
