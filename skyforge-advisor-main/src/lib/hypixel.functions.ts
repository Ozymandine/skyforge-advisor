import { createServerFn } from "@tanstack/react-start";
import { fetchPlayerInputSchema } from "./schemas";
import type { AlertRule } from "./market-history.server";

export const fetchBazaar = createServerFn({ method: "GET" }).handler(async () => {
  const { getBazaar } = await import("./hypixel.server");
  const data = await getBazaar();

  // Contribute a sample to the persistent market history store.
  const { recordMarketSample } = await import("./market-history.server");
  recordMarketSample({
    products: data.products.map((p) => ({
      id: p.id,
      buyPrice: p.buyPrice,
      sellPrice: p.sellPrice,
      buyMovingWeek: p.buyMovingWeek,
    })),
  });

  return data;
});

export const fetchAuctions = createServerFn({ method: "GET" }).handler(async () => {
  const { getAuctions } = await import("./hypixel.server");
  // Scan far more pages so the auction house covers the live market, not just
  // the first few pages of listings.
  const data = await getAuctions(24);
  // Trim payload: only the most interesting listings travel to the client.
  const entries = [...data.entries]
    .sort((a, b) => b.profit - a.profit || b.price - a.price)
    .slice(0, 720);

  // Record lowest-BIN observations into the market history store.
  const { recordBinSample } = await import("./market-history.server");
  const bins = new Map<string, number>();
  for (const entry of data.entries) {
    if (entry.id && entry.lowestBin != null && entry.lowestBin > 0) {
      const existing = bins.get(entry.id);
      if (existing == null || entry.lowestBin < existing) {
        bins.set(entry.id, entry.lowestBin);
      }
    }
  }
  recordBinSample([...bins].map(([id, lowestBin]) => ({ id, lowestBin })));

  return { ...data, entries };
});

export const fetchPriceHistory = createServerFn({ method: "POST" })
  .validator(
    (input: unknown) =>
      input as {
        ids: string[];
        rangeHours?: number;
      },
  )
  .handler(async ({ data }) => {
    const { getMarketHistory } = await import("./market-history.server");
    const rangeMs = (data?.rangeHours ?? 24) * 60 * 60 * 1000;
    return getMarketHistory(Array.isArray(data?.ids) ? data.ids : [], rangeMs);
  });

export const fetchTrackedIds = createServerFn({ method: "GET" }).handler(async () => {
  const { getTrackedIds } = await import("./market-history.server");
  return getTrackedIds();
});

/**
 * Cron endpoint helper: records a market history sample server-side.
 * Throttled internally to one sample per 5 minutes, so this is safe to ping
 * as often as desired (e.g. every minute from an uptime monitor).
 */
export const sampleMarket = createServerFn({ method: "GET" }).handler(async () => {
  const { getBazaar, getAuctions } = await import("./hypixel.server");
  const market = await import("./market-history.server");

  const [bazaar, auctions] = await Promise.all([getBazaar(), getAuctions(2)]);

  const bins = new Map<string, number>();
  for (const entry of auctions.entries) {
    if (entry.id && entry.lowestBin != null && entry.lowestBin > 0) {
      const existing = bins.get(entry.id);
      if (existing == null || entry.lowestBin < existing) bins.set(entry.id, entry.lowestBin);
    }
  }

  const sampled = market.recordMarketSample({
    products: bazaar.products.map((p) => ({
      id: p.id,
      buyPrice: p.buyPrice,
      sellPrice: p.sellPrice,
      buyMovingWeek: p.buyMovingWeek,
    })),
  });
  market.recordBinSample([...bins].map(([id, lowestBin]) => ({ id, lowestBin })));

  return { sampled, at: Date.now() };
});

export const fetchFlipAccuracy = createServerFn({ method: "GET" }).handler(async () => {
  const [{ getBazaar }, market] = await Promise.all([
    import("./hypixel.server"),
    import("./market-history.server"),
  ]);
  const { getAuctions } = await import("./hypixel.server");
  const [bazaar, auctions] = await Promise.all([getBazaar(), getAuctions(6)]);

  const prices = new Map<string, number>();
  for (const p of bazaar.products) prices.set(p.id, p.sellPrice);
  for (const e of auctions.entries) {
    if (e.id && e.lowestBin != null) {
      const existing = prices.get(e.id);
      if (existing == null || e.lowestBin < existing) prices.set(e.id, e.lowestBin);
    }
  }
  return market.getFlipAccuracy(prices);
});

export const logFlip = createServerFn({ method: "POST" })
  .validator(
    (input: unknown) =>
      input as {
        id: string;
        itemId: string;
        price: number;
        expected: number;
        kind: "bazaar" | "ah";
      },
  )
  .handler(async ({ data }) => {
    const { logFlipSuggestion } = await import("./market-history.server");
    if (
      data &&
      typeof data.id === "string" &&
      typeof data.itemId === "string" &&
      Number.isFinite(data.price) &&
      Number.isFinite(data.expected)
    ) {
      logFlipSuggestion({
        id: data.id,
        itemId: data.itemId,
        price: Number(data.price),
        expected: Number(data.expected),
        kind: data.kind === "ah" ? "ah" : "bazaar",
      });
    }
    return { ok: true };
  });

export const saveAlertRules = createServerFn({ method: "POST" })
  .validator((input: unknown) => input as unknown[])
  .handler(async ({ data }) => {
    const { saveAlertRules: save } = await import("./market-history.server");
    const rules = (Array.isArray(data) ? data : []).filter(
      (r): r is AlertRule => !!r && typeof r === "object",
    );
    save(rules);
    return { ok: true };
  });

export const fetchServerNotifications = createServerFn({ method: "GET" }).handler(async () => {
  const { getNotifications } = await import("./market-history.server");
  return getNotifications();
});

export const saveDiscordWebhook = createServerFn({ method: "POST" })
  .validator((input: unknown) => String(input ?? ""))
  .handler(async ({ data }) => {
    const { saveDiscordWebhook: save } = await import("./market-history.server");
    return save(String(data));
  });

export const fetchDiscordWebhook = createServerFn({ method: "GET" }).handler(async () => {
  const { getDiscordWebhook: get } = await import("./market-history.server");
  return get();
});

export const fetchItems = createServerFn({ method: "GET" }).handler(async () => {
  const { getItems } = await import("./hypixel.server");
  return getItems();
});

/**
 * Lightweight search index for the ⌘K palette and wiki browsing: only the
 * fields needed for search/display, without recipes/lore/market payloads.
 */
export const fetchItemIndex = createServerFn({ method: "GET" }).handler(async () => {
  const { getItems } = await import("./hypixel.server");
  const items = await getItems();
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    rarity: item.rarity,
    category: item.category,
  }));
});

export const fetchItemDetail = createServerFn({ method: "GET" })
  .validator((input: unknown) => String(input ?? "").trim())
  .handler(async ({ data }) => {
    const { getItemEncyclopedia } = await import("./hypixel.server");
    return getItemEncyclopedia(String(data));
  });
export const fetchPlayer = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    // Runtime-validated with Zod; throws a clear error on bad input.
    const parsed = fetchPlayerInputSchema.parse(input ?? {});

    // The user's own key (BYOK) is preferred. When absent, the server's
    // shared operator key pool serves the request — username-only access.
    return {
      apiKey: parsed.apiKey?.trim() || "",
      username: parsed.username.trim(),
      profileId: parsed.profileId?.trim() || undefined,
    };
  })
  .handler(async ({ data }) => {
    const { getPlayerData } = await import("./hypixel.server");
    return getPlayerData(data.apiKey, data.username, data.profileId);
  });

export const fetchApiHealth = createServerFn({ method: "GET" }).handler(async () => {
  const { profileApiHealth } = await import("./hypixel.server");
  return { profileApi: profileApiHealth() };
});
