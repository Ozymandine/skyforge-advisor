// server/api/flips.ts
// Public JSON endpoint: current top flip suggestions + published accuracy.
// Registered as a Nitro handler in vite.config.ts (route: /api/flips).
// No auth, CORS open — intended for mods and third-party tools.

import { defineEventHandler, setHeader } from "h3";

export default defineEventHandler(async (event) => {
  setHeader(event, "Access-Control-Allow-Origin", "*");
  setHeader(event, "Cache-Control", "public, s-maxage=60");

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
