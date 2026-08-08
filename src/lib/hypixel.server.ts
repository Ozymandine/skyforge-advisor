// Server-only Hypixel + Mojang API access.

import { decodeNbt, type NbtValue } from "./nbt.server";
import {
  computeSkill,
  SKILL_META,
  titleCase,
  type AuctionEntry,
  type BazaarProduct,
  type InventoryContainer,
  type InventoryItem,
  type LiveItem,
  type PlayerData,
  type ProfileSummary,
  type SkillKey,
  type WikiAbility,
  type WikiRecipe,
  type WikiRequirement,
} from "./skyblock";

const API = "https://api.hypixel.net/v2";

export class HypixelError extends Error {}

// ============================================================================
// GENERIC FETCH
// ============================================================================

async function getJson<T>(
  url: string,
  apiKey?: string,
): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: apiKey ? { "API-Key": apiKey } : {},
    });

    const text = await res.text();

    let body: unknown;

    try {
      body = JSON.parse(text);
    } catch {
      console.error(
        `Unexpected response from Hypixel (${res.status})`,
      );
      return null;
    }

    const payload = body as {
      success?: boolean;
      cause?: string;
    };

    if (!res.ok || payload.success === false) {
      console.warn(
        `Hypixel request failed (${res.status}): ${
          payload.cause ?? "Unknown"
        }`,
      );
      return null;
    }

    return body as T;
  } catch (err) {
    console.error(`Network fetch failed for ${url}:`, err);
    return null;
  }
}

// ============================================================================
// UUID
// ============================================================================

export async function resolveUuid(
  username: string,
): Promise<{ uuid: string; name: string } | null> {
  try {
    const clean = username.trim().replace(/-/g, "");

    if (/^[0-9a-f]{32}$/i.test(clean)) {
      return {
        uuid: clean,
        name: username,
      };
    }

    const res = await fetch(
      `https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(
        username.trim(),
      )}`,
    );

    if (res.ok) {
      const data = (await res.json()) as {
        id: string;
        name: string;
      };

      if (data?.id) {
        return {
          uuid: data.id,
          name: data.name,
        };
      }
    }

    const fallback = await fetch(
      `https://playerdb.co/api/player/minecraft/${encodeURIComponent(
        username.trim(),
      )}`,
    );

    if (fallback.ok) {
      const data = (await fallback.json()) as {
        data?: {
          player?: {
            raw_id?: string;
            username?: string;
          };
        };
      };

      const raw = data?.data?.player?.raw_id;

      if (raw) {
        return {
          uuid: raw,
          name: data.data?.player?.username ?? username,
        };
      }
    }
  } catch (err) {
    console.error("Failed to resolve UUID:", err);
  }

  return null;
}

// ============================================================================
// ITEM RESOURCE
// ============================================================================

type RawAbility = {
  name?: string;
  description?: string | string[];
  mana_cost?: number;
  cooldown?: number;
};

type RawRequirement = {
  type?: string;
  level?: number;
  value?: string;
  [key: string]: unknown;
};

type RawRecipe = {
  [key: string]: unknown;
};

type ItemsResponse = {
  items: Array<{
    id: string;
    name: string;
    material?: string;
    tier?: string;
    category?: string;
    npc_sell_price?: number;
    stats?: Record<string, number>;
    description?: string;
    lore?: string[];
    abilities?: RawAbility[];
    requirements?: RawRequirement[];
    recipe?: RawRecipe;
    [key: string]: unknown;
  }>;
};

export type WikiMarketData = {
  bazaar?: {
    buyPrice: number;
    sellPrice: number;
    buyVolume: number;
    sellVolume: number;
    buyMovingWeek: number;
    sellMovingWeek: number;
    buyOrders: number;
    sellOrders: number;
  };

  auctionHouse?: {
    lowestBin: number | null;
    averageBin: number | null;
    medianBin: number | null;
    listings: number;
  };

  museumValue?: number | null;
  historicalPrice?: number | null;
  demand?: number | null;
  volume?: number | null;
};

export type WikiItem = LiveItem & WikiMarketData;

let itemsCache: {
  at: number;
  items: WikiItem[];
} | null = null;

// ============================================================================
// ITEM HELPERS
// ============================================================================

function cleanText(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/§./g, "").trim();
}

function normalizeDescription(
  value: string | string[] | undefined,
): string | string[] | undefined {
  if (typeof value === "string") {
    const cleaned = cleanText(value);
    return cleaned || undefined;
  }

  if (Array.isArray(value)) {
    const lines = value
      .map((line) => cleanText(line))
      .filter(Boolean);

    return lines.length ? lines : undefined;
  }

  return undefined;
}

function normalizeRequirements(
  requirements: RawRequirement[] | undefined,
): WikiRequirement[] | undefined {
  if (!Array.isArray(requirements)) {
    return undefined;
  }

  const normalized = requirements
    .map((req) => {
      if (!req || typeof req !== "object") {
        return null;
      }

      const type =
        typeof req.type === "string"
          ? titleCase(req.type.replace(/_/g, " "))
          : "Requirement";

      const level =
        typeof req.level === "number"
          ? req.level
          : undefined;

      const value =
        typeof req.value === "string"
          ? req.value
          : undefined;

      return {
        type,
        ...(level !== undefined ? { level } : {}),
        ...(value !== undefined ? { value } : {}),
      };
    })
    .filter(
      (req): req is WikiRequirement =>
        req !== null,
    );

  return normalized.length ? normalized : undefined;
}

function normalizeAbilities(
  abilities: RawAbility[] | undefined,
): WikiAbility[] | undefined {
  if (!Array.isArray(abilities)) {
    return undefined;
  }

  const normalized = abilities
    .filter(
      (ability): ability is RawAbility =>
        !!ability &&
        typeof ability === "object",
    )
    .map((ability) => ({
      name: cleanText(ability.name) || "Ability",

      description:
        typeof ability.description === "string"
          ? cleanText(ability.description)
          : Array.isArray(ability.description)
            ? ability.description
                .map(cleanText)
                .filter(Boolean)
            : "",

      ...(typeof ability.mana_cost === "number"
        ? { manaCost: ability.mana_cost }
        : {}),

      ...(typeof ability.cooldown === "number"
        ? { cooldown: ability.cooldown }
        : {}),
    }));

  return normalized.length ? normalized : undefined;
}

// The Hypixel resource response contains recipe information on some items.
// Its exact structure has changed over time, so normalize the common forms
// without assuming every item has a recipe.
function normalizeRecipe(
  recipe: RawRecipe | undefined,
): WikiRecipe | undefined {
  if (!recipe || typeof recipe !== "object") {
    return undefined;
  }

  const ingredients: Array<{
    id: string;
    name: string;
    amount: number;
  }> = [];

  const pushIngredient = (
    id: string,
    amount: number,
  ) => {
    if (
      !id ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return;
    }

    ingredients.push({
      id,
      name: titleCase(id),
      amount,
    });
  };

  const rawIngredients = recipe["ingredients"];

  if (Array.isArray(rawIngredients)) {
    for (const ingredient of rawIngredients) {
      if (
        !ingredient ||
        typeof ingredient !== "object"
      ) {
        continue;
      }

      const obj =
        ingredient as Record<string, unknown>;

      const id =
        typeof obj.id === "string"
          ? obj.id
          : typeof obj.item_id === "string"
            ? obj.item_id
            : undefined;

      const amount =
        typeof obj.amount === "number"
          ? obj.amount
          : typeof obj.count === "number"
            ? obj.count
            : 1;

      if (id) {
        pushIngredient(id, amount);
      }
    }
  }

  // Some Hypixel recipe structures use a simple ID -> quantity map.
  if (
    rawIngredients &&
    typeof rawIngredients === "object" &&
    !Array.isArray(rawIngredients)
  ) {
    for (const [id, amount] of Object.entries(
      rawIngredients as Record<string, unknown>,
    )) {
      if (typeof amount === "number") {
        pushIngredient(id, amount);
      }
    }
  }

  if (!ingredients.length) {
    return undefined;
  }

  const craftingType =
    typeof recipe["crafting_type"] === "string"
      ? titleCase(
          String(recipe["crafting_type"]),
        )
      : typeof recipe["type"] === "string"
        ? titleCase(String(recipe["type"]))
        : undefined;

  const outputAmount =
    typeof recipe["output_amount"] === "number"
      ? recipe["output_amount"]
      : typeof recipe["count"] === "number"
        ? recipe["count"]
        : undefined;

  return {
    ingredients,
    ...(craftingType ? { craftingType } : {}),
    ...(outputAmount !== undefined
      ? { outputAmount }
      : {}),
  };
}

export async function getItems(): Promise<WikiItem[]> {
  try {
    if (
      itemsCache &&
      Date.now() - itemsCache.at < 30 * 60_000
    ) {
      return itemsCache.items;
    }

    const data = await getJson<ItemsResponse>(
      `${API}/resources/skyblock/items`,
    );

    console.log(
  "WIKI RAW ITEM:",
  JSON.stringify(
    data?.items?.find(
      (item) =>
        item.id === "ASPECT_OF_THE_END" ||
        item.name?.toLowerCase().includes("aspect of the end"),
    ),
    null,
    2,
  ),
);

    if (!data || !Array.isArray(data.items)) {
      return [];
    }

    const items: WikiItem[] = data.items.map(
      (item) => {
        const description =
          normalizeDescription(
            typeof item.description === "string"
              ? item.description
              : item.lore,
          );

        const abilities =
          normalizeAbilities(item.abilities);

        const requirements =
          normalizeRequirements(
            item.requirements,
          );

        const recipe = normalizeRecipe(
          item.recipe,
        );

        return {
          id: item.id,
          name:
            item.name ??
            titleCase(item.id),
          material: item.material,
          rarity: item.tier ?? "COMMON",
          category: item.category
            ? titleCase(item.category)
            : "Misc",

          npcSell:
            typeof item.npc_sell_price === "number"
              ? item.npc_sell_price
              : null,

          ...(description !== undefined
            ? { description }
            : {}),

          ...(item.stats &&
          typeof item.stats === "object"
            ? {
                stats:
                  item.stats as Record<
                    string,
                    number
                  >,
              }
            : {}),

          ...(abilities
            ? { abilities }
            : {}),

          ...(requirements
            ? { requirements }
            : {}),

          ...(recipe
            ? { recipe }
            : {}),
        };
      },
    );

    itemsCache = {
      at: Date.now(),
      items,
    };

    return items;
  } catch (err) {
    console.error("Error inside getItems:", err);
    return [];
  }
}

async function nameLookup(): Promise<
  Map<string, string>
> {
  try {
    const items = await getItems();

    return new Map(
      items.map((item) => [
        item.id,
        item.name,
      ]),
    );
  } catch {
    return new Map();
  }
}

// ============================================================================
// BAZAAR
// ============================================================================

type BazaarResponse = {
  lastUpdated: number;

  products: Record<
    string,
    {
      quick_status: {
        productId: string;
        buyPrice: number;
        sellPrice: number;
        buyVolume: number;
        sellVolume: number;
        buyMovingWeek: number;
        sellMovingWeek: number;
        buyOrders: number;
        sellOrders: number;
      };
    }
  >;
};

export async function getBazaar(): Promise<{
  lastUpdated: number;
  products: BazaarProduct[];
}> {
  try {
    const [data, names] = await Promise.all([
      getJson<BazaarResponse>(
        `${API}/skyblock/bazaar`,
      ),
      nameLookup(),
    ]);

    if (!data || !data.products) {
      return {
        lastUpdated: Date.now(),
        products: [],
      };
    }

    const products: BazaarProduct[] = [];

    for (const [id, entry] of Object.entries(
      data.products,
    )) {
      const q = entry.quick_status;

      if (
        !q ||
        !Number.isFinite(q.buyPrice) ||
        !Number.isFinite(q.sellPrice) ||
        q.buyPrice <= 0 ||
        q.sellPrice <= 0
      ) {
        continue;
      }

      const gross =
        q.buyPrice - q.sellPrice;

      const spread =
        gross - q.buyPrice * 0.0125;

      if (spread <= 0) {
        continue;
      }

      const flipsPerHour =
        Math.min(
          q.buyMovingWeek,
          q.sellMovingWeek,
        ) / 168;

      const liquidity = Math.min(
        100,
        Math.round(
          Math.log10(
            Math.max(1, flipsPerHour),
          ) * 25,
        ),
      );

      const margin =
        (spread / q.sellPrice) * 100;

      products.push({
        id,

        name:
          names.get(id) ??
          titleCase(
            id.replace(
              /^ENCHANTED_/,
              "Enchanted ",
            ),
          ),

        buyPrice: q.buyPrice,
        sellPrice: q.sellPrice,
        spread,
        margin,

        buyVolume: q.buyVolume,
        sellVolume: q.sellVolume,

        buyMovingWeek:
          q.buyMovingWeek,

        sellMovingWeek:
          q.sellMovingWeek,

        profitPerHour:
          spread * flipsPerHour,

        liquidity,

        health: Math.min(
          100,
          Math.round(
            liquidity * 0.6 +
              Math.min(margin, 60) * 0.7,
          ),
        ),
      });
    }

    products.sort(
      (a, b) =>
        b.profitPerHour -
        a.profitPerHour,
    );

    return {
      lastUpdated:
        data.lastUpdated || Date.now(),
      products,
    };
  } catch (err) {
    console.error(
      "Error in getBazaar:",
      err,
    );

    return {
      lastUpdated: Date.now(),
      products: [],
    };
  }
}

// ============================================================================
// AUCTIONS
// ============================================================================

type AuctionsResponse = {
  page: number;
  totalPages: number;
  totalAuctions: number;
  lastUpdated: number;

  auctions: Array<{
    uuid: string;

    item_bytes?:
      | string
      | {
          type?: number;
          data?: string;
        };

    item_id?: string;
    item_name: string;
    tier: string;
    bin: boolean;
    starting_bid: number;
    highest_bid_amount: number;
    end: number;
    bids: unknown[];
    category: string;
    item_lore: string;
  }>;
};

type AuctionItemIdentity = Pick<
  AuctionEntry,
  "id" | "texture"
>;

type AuctionCandidate = {
  entry: AuctionEntry;
  uuid: string;
  itemBytes:
    AuctionsResponse["auctions"][number]["item_bytes"];
};

const auctionItemCache = new Map<
  string,
  {
    at: number;
    identity: AuctionItemIdentity;
  }
>();

const AUCTION_ITEM_CACHE_TTL_MS =
  15 * 60_000;

const AUCTION_ICON_LIMIT = 240;
const AUCTION_ITEM_DECODE_CONCURRENCY = 8;

function itemBytesData(
  itemBytes:
    AuctionsResponse["auctions"][number]["item_bytes"],
): string | undefined {
  if (typeof itemBytes === "string") {
    return itemBytes;
  }

  if (
    typeof itemBytes?.data === "string"
  ) {
    return itemBytes.data;
  }

  return undefined;
}

function nbtObject(
  value: NbtValue | undefined,
): Record<string, NbtValue> | null {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return null;
  }

  const object =
    value as Record<string, NbtValue>;

  const wrapped = object["value"];

  if (
    wrapped &&
    typeof wrapped === "object" &&
    !Array.isArray(wrapped)
  ) {
    return wrapped as Record<
      string,
      NbtValue
    >;
  }

  return object;
}

function nbtArray(
  value: NbtValue | undefined,
): NbtValue[] {
  if (Array.isArray(value)) {
    return value;
  }

  const object = nbtObject(value);
  const wrapped = object?.["value"];

  return Array.isArray(wrapped)
    ? wrapped
    : [];
}

function textureFromTag(
  tag: Record<string, NbtValue>,
): string | undefined {
  const skullOwner =
    nbtObject(tag["SkullOwner"]);

  const properties =
    nbtObject(
      skullOwner?.["Properties"],
    );

  const textures =
    nbtArray(
      properties?.["textures"],
    );

  const firstTexture =
    nbtObject(textures[0]);

  const value =
    firstTexture?.["Value"] ??
    firstTexture?.["value"];

  if (
    typeof value !== "string" ||
    !value
  ) {
    return undefined;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(
        value,
        "base64",
      ).toString("utf8"),
    ) as {
      textures?: {
        SKIN?: {
          url?: string;
        };
      };
    };

    return decoded.textures?.SKIN?.url?.replace(
      /^http:/,
      "https:",
    );
  } catch {
    return value.startsWith("http")
      ? value.replace(
          /^http:/,
          "https:",
        )
      : `https://textures.minecraft.net/texture/${value}`;
  }
}

async function extractAuctionItemIdentity(
  itemBytes:
    AuctionsResponse["auctions"][number]["item_bytes"],
): Promise<AuctionItemIdentity> {
  const data = itemBytesData(itemBytes);

  if (!data) {
    return {};
  }

  try {
    const root = await decodeNbt(data);

    const itemStack =
      nbtObject(
        nbtArray(root["i"])[0],
      );

    const tag =
      nbtObject(itemStack?.["tag"]);

    const extra =
      nbtObject(
        tag?.["ExtraAttributes"],
      );

    const id = extra?.["id"];

    const texture = tag
      ? textureFromTag(tag)
      : undefined;

    return {
      ...(typeof id === "string" && id
        ? { id }
        : {}),

      ...(texture
        ? { texture }
        : {}),
    };
  } catch {
    return {};
  }
}

function pruneAuctionItemCache(
  now: number,
) {
  for (const [
    uuid,
    cached,
  ] of auctionItemCache) {
    if (
      now - cached.at >
      AUCTION_ITEM_CACHE_TTL_MS
    ) {
      auctionItemCache.delete(uuid);
    }
  }
}

async function auctionItemIdentity(
  uuid: string,
  itemBytes:
    AuctionsResponse["auctions"][number]["item_bytes"],
): Promise<AuctionItemIdentity> {
  const now = Date.now();

  const cached =
    auctionItemCache.get(uuid);

  if (
    cached &&
    now - cached.at <=
      AUCTION_ITEM_CACHE_TTL_MS
  ) {
    return cached.identity;
  }

  const identity =
    await extractAuctionItemIdentity(
      itemBytes,
    );

  auctionItemCache.set(uuid, {
    at: now,
    identity,
  });

  return identity;
}

async function hydrateAuctionEntries(
  candidates: AuctionCandidate[],
): Promise<AuctionEntry[]> {
  const entries =
    candidates.map(
      ({ entry }) => entry,
    );

  let next = 0;

  const worker = async () => {
    for (;;) {
      const index = next++;
      const candidate =
        candidates[index];

      if (!candidate) {
        return;
      }

      const identity =
        await auctionItemIdentity(
          candidate.uuid,
          candidate.itemBytes,
        );

      const id =
        candidate.entry.id ??
        identity.id;

      entries[index] = {
        ...candidate.entry,

        ...(id
          ? { id }
          : {}),

        ...(identity.texture
          ? {
              texture:
                identity.texture,
            }
          : {}),
      };
    }
  };

  await Promise.all(
    Array.from(
      {
        length: Math.min(
          AUCTION_ITEM_DECODE_CONCURRENCY,
          candidates.length,
        ),
      },
      worker,
    ),
  );

  return entries;
}

export async function getAuctions(
  pages = 6,
): Promise<{
  lastUpdated: number;
  totalAuctions: number;
  totalPages: number;
  binCount: number;
  auctionCount: number;
  uniqueItems: number;
  averageBin: number;
  entries: AuctionEntry[];
}> {
  const fallback = {
    lastUpdated: Date.now(),
    totalAuctions: 0,
    totalPages: 0,
    binCount: 0,
    auctionCount: 0,
    uniqueItems: 0,
    averageBin: 0,
    entries: [] as AuctionEntry[],
  };

  try {
    const first =
      await getJson<AuctionsResponse>(
        `${API}/skyblock/auctions?page=0`,
      );

    if (
      !first ||
      !Array.isArray(first.auctions)
    ) {
      return fallback;
    }

    const wanted = Math.min(
      Math.max(1, pages),
      first.totalPages || 1,
    );

    const rest =
      await Promise.all(
        Array.from(
          {
            length: Math.max(
              0,
              wanted - 1,
            ),
          },
          (_, i) =>
            getJson<AuctionsResponse>(
              `${API}/skyblock/auctions?page=${
                i + 1
              }`,
            ).catch(() => null),
        ),
      );

    const all = [
      first,
      ...rest.filter(
        (
          value,
        ): value is AuctionsResponse =>
          value !== null &&
          Array.isArray(
            value.auctions,
          ),
      ),
    ];

    const raw = all.flatMap(
      (page) => page.auctions,
    );

    const lowestBin =
      new Map<string, number>();

    let binCount = 0;
    let binTotal = 0;

    for (const auction of raw) {
      if (!auction.bin) {
        continue;
      }

      binCount += 1;
      binTotal +=
        auction.starting_bid;

      const key = `${auction.item_name}|${auction.tier}`;

      const previous =
        lowestBin.get(key);

      if (
        previous === undefined ||
        auction.starting_bid <
          previous
      ) {
        lowestBin.set(
          key,
          auction.starting_bid,
        );
      }
    }

    const now = Date.now();

    pruneAuctionItemCache(now);

    const candidates: AuctionCandidate[] =
      raw.map((auction) => {
        const key = `${auction.item_name}|${auction.tier}`;

        const price = auction.bin
          ? auction.starting_bid
          : Math.max(
              auction.highest_bid_amount,
              auction.starting_bid,
            );

        const lb =
          lowestBin.get(key) ??
          null;

        return {
          uuid: auction.uuid,

          itemBytes:
            auction.item_bytes,

          entry: {
            uuid: auction.uuid,

            ...(auction.item_id
              ? {
                  id: auction.item_id,
                }
              : {}),

            name:
              auction.item_name,

            rarity:
              auction.tier,

            bin:
              auction.bin,

            price,

            lowestBin: lb,

            profit:
              lb !== null
                ? lb - price
                : 0,

            endsInMs:
              auction.end - now,

            bids:
              Array.isArray(
                auction.bids,
              )
                ? auction.bids.length
                : 0,

            category:
              auction.category
                ? titleCase(
                    auction.category,
                  )
                : "Misc",
          },
        };
      });

    const entries =
      await hydrateAuctionEntries(
        candidates
          .sort(
            (a, b) =>
              b.entry.profit -
                a.entry.profit ||
              b.entry.price -
                a.entry.price,
          )
          .slice(
            0,
            AUCTION_ICON_LIMIT,
          ),
      );

    return {
      lastUpdated:
        first.lastUpdated ||
        now,

      totalAuctions:
        first.totalAuctions ||
        raw.length,

      totalPages:
        first.totalPages ||
        1,

      binCount,

      auctionCount:
        raw.length - binCount,

      uniqueItems:
        lowestBin.size,

      averageBin:
        binCount
          ? binTotal / binCount
          : 0,

      entries,
    };
  } catch (err) {
    console.error(
      "Error in getAuctions:",
      err,
    );

    return fallback;
  }
}

// ============================================================================
// WIKI MARKET DATA
// ============================================================================

type WikiAuctionStats = {
  lowestBin: number | null;
  averageBin: number | null;
  medianBin: number | null;
  listings: number;
};

function calculateAuctionStats(
  auctions: AuctionEntry[],
): Map<string, WikiAuctionStats> {
  const grouped =
    new Map<string, number[]>();

  for (const auction of auctions) {
    if (!auction.bin) {
      continue;
    }

    if (!auction.id) {
      continue;
    }

    const prices =
      grouped.get(auction.id) ??
      [];

    prices.push(auction.price);

    grouped.set(
      auction.id,
      prices,
    );
  }

  const result =
    new Map<string, WikiAuctionStats>();

  for (const [
    id,
    prices,
  ] of grouped) {
    if (!prices.length) {
      continue;
    }

    prices.sort(
      (a, b) => a - b,
    );

    const total =
      prices.reduce(
        (sum, value) =>
          sum + value,
        0,
      );

    const middle =
      Math.floor(
        prices.length / 2,
      );

    const median =
      prices.length % 2 === 0
        ? (prices[middle - 1] +
            prices[middle]) /
          2
        : prices[middle];

    result.set(id, {
      lowestBin:
        prices[0] ?? null,

      averageBin:
        prices.length
          ? total / prices.length
          : null,

      medianBin: median,

      listings:
        prices.length,
    });
  }

  return result;
}

export async function getWikiItems(): Promise<
  WikiItem[]
> {
  const [
    items,
    bazaarResponse,
    auctionResponse,
  ] = await Promise.all([
    getItems(),

    getJson<BazaarResponse>(
      `${API}/skyblock/bazaar`,
    ),

    getAuctions(6),
  ]);

  const bazaarMap =
    new Map<
      string,
      WikiMarketData["bazaar"]
    >();

  if (bazaarResponse?.products) {
    for (const [
      id,
      entry,
    ] of Object.entries(
      bazaarResponse.products,
    )) {
      const q =
        entry.quick_status;

      if (!q) {
        continue;
      }

      bazaarMap.set(id, {
        buyPrice: q.buyPrice,
        sellPrice: q.sellPrice,
        buyVolume: q.buyVolume,
        sellVolume: q.sellVolume,
        buyMovingWeek:
          q.buyMovingWeek,
        sellMovingWeek:
          q.sellMovingWeek,
        buyOrders: q.buyOrders,
        sellOrders: q.sellOrders,
      });
    }
  }

  const auctionMap =
    calculateAuctionStats(
      auctionResponse.entries,
    );

  return items.map((item) => {
    const bazaar =
      bazaarMap.get(item.id);

    const auctionHouse =
      auctionMap.get(item.id);

    const demand =
      bazaar
        ? Math.min(
            100,
            Math.round(
              Math.log10(
                Math.max(
                  1,
                  bazaar.buyMovingWeek +
                    bazaar.sellMovingWeek,
                ),
              ) * 20,
            ),
          )
        : null;

    const volume =
      bazaar
        ? bazaar.buyMovingWeek +
          bazaar.sellMovingWeek
        : null;

    return {
      ...item,

      ...(bazaar
        ? {
            bazaar,
          }
        : {}),

      ...(auctionHouse
        ? {
            auctionHouse,
          }
        : {}),

      // Hypixel's public item API does not provide
      // a true historical price series. Keep this
      // null rather than inventing historical data.
      historicalPrice: null,

      ...(demand !== null
        ? { demand }
        : {}),

      ...(volume !== null
        ? { volume }
        : {}),
    };
  });
}

// ============================================================================
// ITEM LOOKUP
// ============================================================================

export async function getWikiItem(
  itemId: string,
): Promise<WikiItem | null> {
  const normalized =
    itemId.trim().toUpperCase();

  if (!normalized) {
    return null;
  }

  const items =
    await getWikiItems();

  return (
    items.find(
      (item) =>
        item.id.toUpperCase() ===
        normalized,
    ) ?? null
  );
}

// ============================================================================
// PLAYER PROFILE + COLLECTIONS
// ============================================================================

const RARITY_WORDS = [
  "DIVINE",
  "VERY SPECIAL",
  "SPECIAL",
  "MYTHIC",
  "LEGENDARY",
  "EPIC",
  "RARE",
  "UNCOMMON",
  "COMMON",
];

function stripColors(
  value: string,
): string {
  return value.replace(
    /§./g,
    "",
  );
}

function rarityFromLore(
  lore: string[],
): string {
  for (
    let i = lore.length - 1;
    i >= 0;
    i--
  ) {
    const line =
      stripColors(
        lore[i] ?? "",
      ).toUpperCase();

    const hit =
      RARITY_WORDS.find(
        (rarity) =>
          line.includes(rarity),
      );

    if (hit) {
      return hit.replace(
        " ",
        "_",
      );
    }
  }

  return "COMMON";
}

function getCollectionCategory(
  itemId: string,
): string {
  const id =
    itemId.toUpperCase();

  // Mining
  if (
    id.includes("GEMSTONE") ||
    id.includes("MINING") ||
    [
      "COBBLESTONE",
      "COAL",
      "IRON_INGOT",
      "GOLD_INGOT",
      "DIAMOND",
      "EMERALD",
      "REDSTONE",
      "QUARTZ",
      "OBSIDIAN",
      "GLOWSTONE",
      "GRAVEL",
      "ICE",
      "NETHERRACK",
      "SAND",
      "END_STONE",
      "MITHRIL_ORE",
      "TITANIUM_ORE",
      "HARD_STONE",
      "SULPHUR",
    ].some((key) =>
      id.includes(key),
    )
  ) {
    return "Mining";
  }

  // Farming
  if (
    id.includes("FARMING") ||
    [
      "WHEAT",
      "CARROT",
      "POTATO",
      "PUMPKIN",
      "MELON",
      "SEEDS",
      "MUSHROOM",
      "COCOA",
      "CACTUS",
      "SUGAR_CANE",
      "NETHER_STALK",
      "FEATHER",
      "LEATHER",
      "PORK",
      "RAW_CHICKEN",
      "MUTTON",
      "RABBIT",
    ].some((key) =>
      id.includes(key),
    )
  ) {
    return "Farming";
  }

  // Combat
  if (
    id.includes("COMBAT") ||
    [
      "ROTTEN_FLESH",
      "BONE",
      "STRING",
      "SPIDER_EYE",
      "GUNPOWDER",
      "ENDER_PEARL",
      "BLAZE_ROD",
      "SLIME_BALL",
      "MAGMA_CREAM",
      "GHAST_TEAR",
      "ENDERMITE",
    ].some((key) =>
      id.includes(key),
    )
  ) {
    return "Combat";
  }

  // Foraging
  if (
    id.includes("LOG") ||
    id.includes("WOOD") ||
    [
      "JUNGLE",
      "ACACIA",
      "DARK_OAK",
      "BIRCH",
      "SPRUCE",
      "OAK",
    ].some((key) =>
      id.includes(key),
    )
  ) {
    return "Foraging";
  }

  // Fishing
  if (
    id.includes("FISH") ||
    [
      "RAW_FISH",
      "PRISMARINE_SHARD",
      "PRISMARINE_CRYSTALS",
      "CLAY_BALL",
      "WATER_LILY",
      "INK_SACK",
      "SPONGE",
    ].some((key) =>
      id.includes(key),
    )
  ) {
    return "Fishing";
  }

  if (id.includes("RIFT")) {
    return "Rift";
  }

  return "Misc";
}

// ============================================================================
// CONTAINERS
// ============================================================================

async function parseContainer(
  base64: string | undefined,
  id: string,
  label: string,
): Promise<InventoryContainer | null> {
  if (!base64) {
    return null;
  }

  try {
    const root =
      await decodeNbt(base64);

    const list =
      nbtArray(root["i"]);

    const items: InventoryItem[] = [];

    list.forEach(
      (
        entry,
        index,
      ) => {
        const it =
          nbtObject(entry);

        if (!it) {
          return;
        }

        const tag =
          nbtObject(
            it["tag"],
          ) ?? {};

        const display =
          nbtObject(
            tag["display"],
          ) ?? {};

        const extra =
          nbtObject(
            tag["ExtraAttributes"],
          ) ?? {};

        const lore =
          nbtArray(
            display["Lore"],
          ).map((line) =>
            stripColors(
              String(
                line,
              ),
            ),
          );

        const rawName =
          display["Name"] ??
          extra["id"] ??
          "Unknown Item";

        const name =
          stripColors(
            String(rawName),
          );

        const texture =
          textureFromTag(tag);

        const rawCount =
          it["Count"];

        const count =
          typeof rawCount === "number"
            ? rawCount
            : Number(rawCount ?? 1);

        items.push({
          slot: index,
          name,

          id: String(
            extra["id"] ??
              "UNKNOWN",
          ),

          ...(texture
            ? { texture }
            : {}),

          rarity:
            rarityFromLore(lore),

          count:
            Number.isFinite(count)
              ? count
              : 1,

          lore,
        });
      },
    );

    return {
      id,
      label,

      slots: Math.max(
        list.length,
        items.length,
      ),

      items,
    };
  } catch {
    return {
      id,
      label,
      slots: 0,
      items: [],
      locked: true,
    };
  }
}

// ============================================================================
// PROFILES
// ============================================================================

type ProfilesResponse = {
  profiles:
    | Array<{
        profile_id: string;
        cute_name: string;
        game_mode?: string;
        selected: boolean;

        banking?: {
          balance?: number;
        };

        members: Record<
          string,
          Record<string, unknown>
        >;
      }>
    | null;
};

export async function getPlayerData(
  apiKey: string,
  username: string,
  profileId?: string,
): Promise<PlayerData | null> {
  try {
    if (!username) {
      return null;
    }

    const resolved =
      await resolveUuid(username);

    if (!resolved) {
      return null;
    }

    const {
      uuid,
      name,
    } = resolved;

    const data =
      await getJson<ProfilesResponse>(
        `${API}/skyblock/profiles?uuid=${uuid}`,
        apiKey,
      );

    const list =
      data?.profiles ?? [];

    if (!list.length) {
      return null;
    }

    const chosen =
      list.find(
        (profile) =>
          profile.profile_id ===
          profileId,
      ) ??
      list.find(
        (profile) =>
          profile.selected,
      ) ??
      list[0]!;

    const member =
      chosen.members[uuid] ?? {};

    const summaries: ProfileSummary[] =
      list.map(
        (profile) => ({
          profileId:
            profile.profile_id,

          cuteName:
            profile.cute_name,

          gameMode:
            profile.game_mode
              ? titleCase(
                  profile.game_mode,
                )
              : "Classic",

          members:
            Object.keys(
              profile.members,
            ).length,

          selected:
            profile.profile_id ===
            chosen.profile_id,
        }),
      );

    const experience =
      (
        member[
          "player_data"
        ] as
          | {
              experience?: Record<
                string,
                number
              >;
            }
          | undefined
      )?.experience ?? {};

    const skills =
      SKILL_META.map(
        (meta) =>
          computeSkill(
            meta.key as SkillKey,
            Number(
              experience[
                `SKILL_${meta.key}`
              ] ?? 0,
            ),
          ),
      );

    const rated =
      skills.filter(
        (skill) =>
          skill.key !==
            "RUNECRAFTING" &&
          skill.key !==
            "SOCIAL",
      );

    const skillAverage =
      rated.reduce(
        (sum, skill) =>
          sum + skill.level,
        0,
      ) /
      (rated.length || 1);

    const inv =
      (member["inventory"] ??
        {}) as Record<
        string,
        any
      >;

    const containerDefs: Array<
      [
        string | undefined,
        string,
        string,
      ]
    > = [
      [
        inv?.["inv_contents"]
          ?.["data"],
        "inventory",
        "Inventory",
      ],

      [
        inv?.[
          "ender_chest_contents"
        ]?.["data"],
        "ender-chest",
        "Ender Chest",
      ],

      [
        inv?.["inv_armor"]
          ?.["data"],
        "armor",
        "Armor",
      ],

      [
        inv?.[
          "equipment_contents"
        ]?.["data"],
        "equipment",
        "Equipment",
      ],

      [
        inv?.[
          "wardrobe_contents"
        ]?.["data"],
        "wardrobe",
        "Wardrobe",
      ],

      [
        inv?.["bag_contents"]
          ?.["talisman_bag"]
          ?.["data"],
        "accessory-bag",
        "Accessory Bag",
      ],

      [
        inv?.["bag_contents"]
          ?.["quiver"]
          ?.["data"],
        "quiver",
        "Quiver",
      ],

      [
        inv?.["bag_contents"]
          ?.["potion_bag"]
          ?.["data"],
        "potion-bag",
        "Potion Bag",
      ],

      [
        inv?.["bag_contents"]
          ?.["fishing_bag"]
          ?.["data"],
        "fishing-bag",
        "Fishing Bag",
      ],

      [
        inv?.[
          "personal_vault_contents"
        ]?.["data"],
        "vault",
        "Personal Vault",
      ],
    ];

    const backpacks =
      (inv?.[
        "backpack_contents"
      ] ?? {}) as Record<
        string,
        {
          data?: string;
        }
      >;

    for (const [
      key,
      value,
    ] of Object.entries(
      backpacks,
    )) {
      containerDefs.push([
        value?.data,
        `backpack-${key}`,
        `Backpack ${Number(key) + 1}`,
      ]);
    }

    const containers =
      (
        await Promise.all(
          containerDefs.map(
            ([
              encoded,
              id,
              label,
            ]) =>
              parseContainer(
                encoded,
                id,
                label,
              ),
          ),
        )
      ).filter(
        (
          container,
        ): container is InventoryContainer =>
          !!container &&
          (container.items.length >
            0 ||
            !!container.locked),
      );

    const collectionRaw =
      (member[
        "collection"
      ] ?? {}) as Record<
        string,
        number
      >;

    const names =
      await nameLookup();

    const collections =
      Object.entries(
        collectionRaw,
      )
        .map(
          ([
            id,
            amount,
          ]) => ({
            id,

            name:
              names.get(id) ??
              titleCase(id),

            category:
              getCollectionCategory(
                id,
              ),

            amount:
              Number(amount) ||
              0,
          }),
        )
        .sort(
          (a, b) =>
            b.amount -
            a.amount,
        );

    const currencies =
      member["currencies"] as
        | {
            coin_purse?: number;
          }
        | undefined;

    const fairySoul =
      member["fairy_soul"] as
        | {
            total_collected?: number;
          }
        | undefined;

    const profile =
      member["profile"] as
        | {
            last_save?: number;
          }
        | undefined;

    const lastSaveRaw =
      member["last_save"];

    return {
      username: name,
      uuid,

      profiles: summaries,

      activeProfileId:
        chosen.profile_id,

      skills,

      skillAverage:
        Math.round(
          skillAverage * 100,
        ) / 100,

      totalSkillXp:
        skills.reduce(
          (sum, skill) =>
            sum +
            skill.totalXp,
          0,
        ),

      purse: Number(
        currencies?.coin_purse ??
          0,
      ),

      bank:
        typeof chosen.banking
          ?.balance === "number"
          ? chosen.banking.balance
          : null,

      containers,

      collections,

      fairySouls: Number(
        fairySoul?.total_collected ??
          0,
      ),

      lastSave: Number(
        profile?.last_save ??
          lastSaveRaw ??
          Date.now(),
      ),
    };
  } catch (err) {
    console.error(
      "Error in getPlayerData:",
      err,
    );

    return null;
  }
}