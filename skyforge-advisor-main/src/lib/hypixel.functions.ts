import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import {
  alertRulesInputSchema,
  externalPriceHistoryInputSchema,
  fetchPlayerInputSchema,
  itemIdSchema,
  logFlipInputSchema,
  ownerIdInputSchema,
  priceHistoryInputSchema,
  uuidOrNameSchema,
  webhookInputSchema,
} from "./schemas";
import { z as zod } from "zod";
import type { AlertRule } from "./market-history.server";
import { WIKI_AUCTION_PAGES } from "./wiki-auction";
import { MARKET_MAX_AGE_MS } from "./constants";

const uuidSchema = zod.object({
  uuid: uuidOrNameSchema,
});

export const fetchBazaar = createServerFn({ method: "GET" }).handler(async () => {
  const { getBazaar } = await import("./hypixel.server");
  const data = await getBazaar();

  // Contribute a sample to the persistent market history store.
  const { recordMarketSample } = await import("./market-history.server");
  if (!data.stale && data.lastUpdated > 0 && Date.now() - data.lastUpdated <= MARKET_MAX_AGE_MS)
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
  const data = await getAuctions(WIKI_AUCTION_PAGES);
  // Limit the listing sample payload to the soonest-ending rows.
  const entries = [...data.entries].sort((a, b) => a.endsInMs - b.endsInMs).slice(0, 720);

  return { ...data, entries };
});

export const fetchPriceHistory = createServerFn({ method: "POST" })
  .validator((input: unknown) => priceHistoryInputSchema.parse(input ?? { ids: [] }))
  .handler(async ({ data }) => {
    const { getMarketHistory } = await import("./market-history.server");
    const rangeMs = (data?.rangeHours ?? 24) * 60 * 60 * 1000;
    return getMarketHistory(data.ids, rangeMs);
  });

export const fetchTrackedIds = createServerFn({ method: "GET" }).handler(async () => {
  const { getTrackedIds } = await import("./market-history.server");
  return getTrackedIds(true);
});

/**
 * Cron endpoint helper: records a market history sample server-side.
 * Throttled to one sample per ~4 minutes at this layer (plus the store's own
 * 5-minute throttle), so pinging every minute from an uptime monitor burns no
 * extra Hypixel quota — repeat pings return { throttled: true } without
 * fetching.
 */
let lastSampleMarketAt = 0;
const SAMPLE_MARKET_MIN_GAP = 4 * 60_000;

export const sampleMarket = createServerFn({ method: "GET" }).handler(async () => {
  const now = Date.now();
  if (now - lastSampleMarketAt < SAMPLE_MARKET_MIN_GAP) {
    return { sampled: false, throttled: true as const, at: now };
  }
  lastSampleMarketAt = now;
  const { getBazaar } = await import("./hypixel.server");
  const market = await import("./market-history.server");
  const bazaar = await getBazaar();
  const sampled =
    !bazaar.stale &&
    bazaar.lastUpdated > 0 &&
    market.recordMarketSample({
      products: bazaar.products.map((product) => ({
        id: product.id,
        buyPrice: product.buyPrice,
        sellPrice: product.sellPrice,
        buyMovingWeek: product.buyMovingWeek,
      })),
    });
  return { sampled, at: Date.now() };
});

export const fetchFlipAccuracy = createServerFn({ method: "GET" }).handler(async () => {
  const [{ getBazaar }, market] = await Promise.all([
    import("./hypixel.server"),
    import("./market-history.server"),
  ]);
  const bazaar = await getBazaar();
  const prices = bazaar.stale
    ? new Map<string, number>()
    : new Map(bazaar.products.map((product) => [product.id, product.sellPrice]));
  return market.getFlipAccuracy(prices);
});

export const logFlip = createServerFn({ method: "POST" })
  .validator((input: unknown) => logFlipInputSchema.parse(input ?? {}))
  .handler(async ({ data }) => {
    const { logFlipSuggestion } = await import("./market-history.server");
    logFlipSuggestion({
      id: data.id,
      itemId: data.itemId,
      price: data.price,
      expected: data.expected,
      kind: data.kind,
    });
    return { ok: true };
  });

export const saveAlertRules = createServerFn({ method: "POST" })
  .validator((input: unknown) => alertRulesInputSchema.parse(input ?? []))
  .handler(async ({ data }) => {
    const { saveAlertRules: save } = await import("./market-history.server");
    save(data as AlertRule[]);
    return { ok: true };
  });

export const fetchServerNotifications = createServerFn({ method: "GET" }).handler(async () => {
  const { getNotifications } = await import("./market-history.server");
  return getNotifications();
});

export const saveDiscordWebhook = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    webhookInputSchema.parse(typeof input === "string" ? input : String(input ?? "")),
  )
  .handler(async ({ data }) => {
    const { saveDiscordWebhook: save } = await import("./market-history.server");
    return save(data);
  });

export const fetchDiscordWebhook = createServerFn({ method: "GET" }).handler(async () => {
  const { getDiscordWebhookMasked: get } = await import("./market-history.server");
  return get();
});

// --- Per-user store (Supabase when configured, fallback otherwise) -----------

const myAlertsInput = zod.object({
  ownerId: ownerIdInputSchema,
});

export const fetchMyAlertRules = createServerFn({ method: "POST" })
  .validator((input: unknown) => myAlertsInput.parse(input ?? {}))
  .handler(async ({ data }) => {
    const { getUserAlertRules } = await import("./user-store.server");
    return getUserAlertRules(data.ownerId);
  });

export const saveMyAlertRules = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    zod.object({ ownerId: ownerIdInputSchema, rules: alertRulesInputSchema }).parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const { saveUserAlertRules } = await import("./user-store.server");
    return saveUserAlertRules(data.ownerId, data.rules);
  });

export const fetchMyWebhookStatus = createServerFn({ method: "POST" })
  .validator((input: unknown) => myAlertsInput.parse(input ?? {}))
  .handler(async ({ data }) => {
    const { getUserWebhookStatus } = await import("./user-store.server");
    return getUserWebhookStatus(data.ownerId);
  });

export const saveMyWebhook = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    zod.object({ ownerId: ownerIdInputSchema, url: webhookInputSchema }).parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const { saveUserWebhook } = await import("./user-store.server");
    return saveUserWebhook(data.ownerId, data.url);
  });

// --- Second-tier player endpoints -------------------------------------------

export const fetchGuild = createServerFn({ method: "POST" })
  .validator((input: unknown) => uuidSchema.parse(input ?? {}))
  .handler(async ({ data }) => {
    const { getGuild } = await import("./hypixel.server");
    return getGuild(data.uuid);
  });

export const fetchStatus = createServerFn({ method: "POST" })
  .validator((input: unknown) => uuidSchema.parse(input ?? {}))
  .handler(async ({ data }) => {
    const { getStatus } = await import("./hypixel.server");
    return getStatus(data.uuid);
  });

export const fetchFriendsCount = createServerFn({ method: "POST" })
  .validator((input: unknown) => uuidSchema.parse(input ?? {}))
  .handler(async ({ data }) => {
    const { getFriendsCount } = await import("./hypixel.server");
    return getFriendsCount(data.uuid);
  });

export const fetchBankTransactions = createServerFn({ method: "POST" })
  .validator((input: unknown) => uuidSchema.parse(input ?? {}))
  .handler(async ({ data }) => {
    const { getBankTransactions } = await import("./hypixel.server");
    return getBankTransactions(data.uuid);
  });

// --- Site-wide resources ------------------------------------------------------

export const fetchElection = createServerFn({ method: "GET" }).handler(async () => {
  const { getElection } = await import("./hypixel.server");
  return getElection();
});

export const fetchNews = createServerFn({ method: "GET" }).handler(async () => {
  const { getNews } = await import("./hypixel.server");
  return getNews();
});

export const fetchFireSaleSnapshot = createServerFn({ method: "GET" }).handler(async () => {
  const { getFireSaleSnapshot } = await import("./hypixel.server");
  return getFireSaleSnapshot();
});

export const fetchFireSale = createServerFn({ method: "GET" }).handler(async () => {
  const { getFireSale } = await import("./hypixel.server");
  return getFireSale();
});

// --- Third-party enrichment: Coflnet long-range price history ----------------

export const fetchExternalPriceHistory = createServerFn({ method: "POST" })
  .validator((input: unknown) => externalPriceHistoryInputSchema.parse(input ?? {}))
  .handler(async ({ data }) => {
    const days = data.days ?? 30;
    try {
      const res = await fetch(
        `https://api.coflnet.com/skyblock/price/${encodeURIComponent(data.itemId)}/history/compact`,
        { signal: AbortSignal.timeout(8000) },
      );
      if (!res.ok) return { points: [], source: "none" as const };
      const raw = (await res.json()) as Array<[number, number, number?]>;
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      const points = (Array.isArray(raw) ? raw : [])
        .map((entry) => ({
          t: Number(entry[0] ?? 0),
          v: Number(entry[1] ?? 0),
          s: Number(entry[2] ?? 0),
        }))
        .filter((p) => p.t >= cutoff && p.v > 0);
      return { points, source: "coflnet" as const };
    } catch {
      return { points: [], source: "none" as const };
    }
  });

export const fetchItems = createServerFn({ method: "GET" }).handler(async () => {
  const { getItems } = await import("./hypixel.server");
  return getItems();
});

export const fetchSimulatorWeapons = createServerFn({ method: "GET" }).handler(async () => {
  const [{ getItems }, { buildWeaponCatalog }] = await Promise.all([
    import("./hypixel.server"),
    import("./damage-simulator"),
  ]);
  return buildWeaponCatalog(await getItems());
});

export const fetchCollectionTiers = createServerFn({ method: "GET" }).handler(async () => {
  const { getOfficialCollectionTiers } = await import("./hypixel.server");
  return getOfficialCollectionTiers();
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
  .validator((input: unknown) =>
    itemIdSchema.parse(typeof input === "string" ? input : String(input ?? "")),
  )
  .handler(async ({ data }) => {
    const { getItemEncyclopedia } = await import("./hypixel.server");
    return getItemEncyclopedia(data);
  });

export const fetchWikiAuctionQuote = createServerFn({ method: "GET" })
  .validator((input: unknown) => itemIdSchema.parse(input))
  .handler(async ({ data }) => {
    setResponseHeader("Cache-Control", "no-store");
    const { getWikiAuctionQuote } = await import("./hypixel.server");
    return getWikiAuctionQuote(data);
  });

export const fetchPlayer = createServerFn({ method: "POST" })
  .validator((input: unknown) => fetchPlayerInputSchema.parse(input ?? {}))
  .handler(async ({ data }) => {
    const { getPlayerData } = await import("./hypixel.server");
    return getPlayerData(data.username, data.profileId);
  });

export const fetchApiHealth = createServerFn({ method: "GET" }).handler(async () => {
  const { profileApiHealth } = await import("./hypixel.server");
  return { profileApi: profileApiHealth() };
});
