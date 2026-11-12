// server/api/flips.ts
// Public JSON endpoint: current Bazaar order spreads and quote-based tracking.
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

  const [{ getBazaar }, market] = await Promise.all([
    import("../../src/lib/hypixel.server"),
    import("../../src/lib/market-history.server"),
  ]);
  const bazaar = await getBazaar();
  const fresh =
    !bazaar.stale && bazaar.lastUpdated > 0 && Date.now() - bazaar.lastUpdated <= 5 * 60_000;
  const products = fresh ? bazaar.products : [];
  const prices = new Map(products.map((product) => [product.id, product.sellPrice]));

  const topBazaar = products
    .filter(
      (product) => product.spread > 0 && product.buyMovingWeek > 0 && product.sellMovingWeek > 0,
    )
    .sort((a, b) => b.buyMovingWeek + b.sellMovingWeek - a.buyMovingWeek - a.sellMovingWeek)
    .slice(0, 25)
    .map((product) => ({
      id: product.id,
      name: product.name,
      buy: product.buyPrice,
      sell: product.sellPrice,
      buyOrder: product.sellPrice,
      sellOffer: product.buyPrice,
      grossSpreadPerUnit: product.buyPrice - product.sellPrice,
      netSpreadPerUnit: product.spread,
      marginPct: Number(product.margin.toFixed(2)),
      weeklyVolume: product.buyMovingWeek + product.sellMovingWeek,
    }));

  return {
    updatedAt: bazaar.lastUpdated > 0 ? new Date(bazaar.lastUpdated).toISOString() : null,
    stale: !fresh,
    assumptions: "Both orders fill at the observed quotes. Net spread includes a 1.25% sell fee.",
    bazaar: topBazaar,
    auctions: [],
    accuracy: market.getFlipAccuracy(prices),
    accuracyBasis: "Current Bazaar order quotes for logged suggestions",
  };
});
