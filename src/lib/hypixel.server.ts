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
} from "./skyblock";

const API = "https://api.hypixel.net/v2";

export class HypixelError extends Error {}

async function getJson<T>(url: string, apiKey?: string): Promise<T> {
  const res = await fetch(url, {
    headers: apiKey ? { "API-Key": apiKey } : {},
  });
  const text = await res.text();
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    throw new HypixelError(`Unexpected response from Hypixel (${res.status})`);
  }
  const payload = body as { success?: boolean; cause?: string };
  if (!res.ok || payload.success === false) {
    throw new HypixelError(payload.cause ?? `Hypixel request failed (${res.status})`);
  }
  return body as T;
}

export async function resolveUuid(username: string): Promise<{ uuid: string; name: string }> {
  const clean = username.trim().replace(/-/g, "");
  if (/^[0-9a-f]{32}$/i.test(clean)) return { uuid: clean, name: username };
  const res = await fetch(
    `https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(username.trim())}`,
  );
  if (res.ok) {
    const data = (await res.json()) as { id: string; name: string };
    if (data?.id) return { uuid: data.id, name: data.name };
  }
  const fallback = await fetch(
    `https://playerdb.co/api/player/minecraft/${encodeURIComponent(username.trim())}`,
  );
  if (fallback.ok) {
    const data = (await fallback.json()) as {
      data?: { player?: { raw_id?: string; username?: string } };
    };
    const raw = data?.data?.player?.raw_id;
    if (raw) return { uuid: raw, name: data.data!.player!.username ?? username };
  }
  throw new HypixelError(`Minecraft account "${username}" not found`);
}

// ---------- resources ----------

type ItemsResponse = {
  items: {
    id: string;
    name: string;
    tier?: string;
    category?: string;
    npc_sell_price?: number;
  }[];
};

let itemsCache: { at: number; items: LiveItem[] } | null = null;

export async function getItems(): Promise<LiveItem[]> {
  if (itemsCache && Date.now() - itemsCache.at < 30 * 60_000) return itemsCache.items;
  const data = await getJson<ItemsResponse>(`${API}/resources/skyblock/items`);
  const items = data.items.map((i) => ({
    id: i.id,
    name: i.name ?? titleCase(i.id),
    rarity: i.tier ?? "COMMON",
    category: i.category ? titleCase(i.category) : "Misc",
    npcSell: typeof i.npc_sell_price === "number" ? i.npc_sell_price : null,
  }));
  itemsCache = { at: Date.now(), items };
  return items;
}

async function nameLookup(): Promise<Map<string, string>> {
  const items = await getItems();
  return new Map(items.map((i) => [i.id, i.name]));
}

// ---------- bazaar ----------

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

export async function getBazaar(): Promise<{ lastUpdated: number; products: BazaarProduct[] }> {
  const [data, names] = await Promise.all([
    getJson<BazaarResponse>(`${API}/skyblock/bazaar`),
    nameLookup(),
  ]);

  const products: BazaarProduct[] = [];
  for (const [id, entry] of Object.entries(data.products)) {
    const q = entry.quick_status;
    if (!q || !q.buyPrice || !q.sellPrice) continue;
    // buyPrice = instant-buy (what you pay), sellPrice = instant-sell (what you get).
    const gross = q.buyPrice - q.sellPrice;
    const spread = gross - q.buyPrice * 0.0125; // bazaar tax on the sell side
    if (spread <= 0) continue;
    const flipsPerHour = Math.min(q.buyMovingWeek, q.sellMovingWeek) / 168;
    const liquidity = Math.min(100, Math.round(Math.log10(Math.max(1, flipsPerHour)) * 25));
    const margin = (spread / q.sellPrice) * 100;
    products.push({
      id,
      name: names.get(id) ?? titleCase(id.replace(/^ENCHANTED_/, "Enchanted ")),
      buyPrice: q.buyPrice,
      sellPrice: q.sellPrice,
      spread,
      margin,
      buyVolume: q.buyVolume,
      sellVolume: q.sellVolume,
      buyMovingWeek: q.buyMovingWeek,
      sellMovingWeek: q.sellMovingWeek,
      profitPerHour: spread * flipsPerHour,
      liquidity,
      health: Math.min(100, Math.round((liquidity * 0.6 + Math.min(margin, 60) * 0.7) as number)),
    });
  }
  products.sort((a, b) => b.profitPerHour - a.profitPerHour);
  return { lastUpdated: data.lastUpdated, products };
}

// ---------- auctions ----------

type AuctionsResponse = {
  page: number;
  totalPages: number;
  totalAuctions: number;
  lastUpdated: number;
  auctions: {
    uuid: string;
    item_name: string;
    tier: string;
    bin: boolean;
    starting_bid: number;
    highest_bid_amount: number;
    end: number;
    bids: unknown[];
    category: string;
    item_lore: string;
  }[];
};

export async function getAuctions(pages = 6): Promise<{
  lastUpdated: number;
  totalAuctions: number;
  totalPages: number;
  binCount: number;
  auctionCount: number;
  uniqueItems: number;
  averageBin: number;
  entries: AuctionEntry[];
}> {
  const first = await getJson<AuctionsResponse>(`${API}/skyblock/auctions?page=0`);
  const wanted = Math.min(pages, first.totalPages);
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, wanted - 1) }, (_, i) =>
      getJson<AuctionsResponse>(`${API}/skyblock/auctions?page=${i + 1}`).catch(() => null),
    ),
  );
  const all = [first, ...rest.filter(Boolean as unknown as (v: unknown) => boolean)] as
    AuctionsResponse[];

  const raw = all.flatMap((p) => p.auctions);
  const lowestBin = new Map<string, number>();
  let binCount = 0;
  let binTotal = 0;
  for (const a of raw) {
    if (!a.bin) continue;
    binCount += 1;
    binTotal += a.starting_bid;
    const key = `${a.item_name}|${a.tier}`;
    const prev = lowestBin.get(key);
    if (prev === undefined || a.starting_bid < prev) lowestBin.set(key, a.starting_bid);
  }

  const now = Date.now();
  const entries: AuctionEntry[] = raw.map((a) => {
    const key = `${a.item_name}|${a.tier}`;
    const price = a.bin ? a.starting_bid : Math.max(a.highest_bid_amount, a.starting_bid);
    const lb = lowestBin.get(key) ?? null;
    return {
      uuid: a.uuid,
      name: a.item_name,
      rarity: a.tier,
      bin: a.bin,
      price,
      lowestBin: lb,
      profit: lb !== null ? lb - price : 0,
      endsInMs: a.end - now,
      bids: Array.isArray(a.bids) ? a.bids.length : 0,
      category: a.category ? titleCase(a.category) : "Misc",
    };
  });

  return {
    lastUpdated: first.lastUpdated,
    totalAuctions: first.totalAuctions,
    totalPages: first.totalPages,
    binCount,
    auctionCount: raw.length - binCount,
    uniqueItems: lowestBin.size,
    averageBin: binCount ? binTotal / binCount : 0,
    entries,
  };
}

// ---------- player profile ----------

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

function stripColors(s: string) {
  return s.replace(/§./g, "");
}

function rarityFromLore(lore: string[]): string {
  for (let i = lore.length - 1; i >= 0; i--) {
    const line = stripColors(lore[i] ?? "").toUpperCase();
    const hit = RARITY_WORDS.find((r) => line.includes(r));
    if (hit) return hit.replace(" ", "_");
  }
  return "COMMON";
}

async function parseContainer(
  base64: string | undefined,
  id: string,
  label: string,
): Promise<InventoryContainer | null> {
  if (!base64) return null;
  try {
    const root = await decodeNbt(base64);
    const list = (root["i"] ?? []) as NbtValue[];
    const items: InventoryItem[] = [];
    list.forEach((entry, index) => {
      const it = entry as Record<string, NbtValue> | null;
      if (!it || typeof it !== "object" || !("id" in it)) return;
      const tag = (it["tag"] ?? {}) as Record<string, NbtValue>;
      const display = (tag["display"] ?? {}) as Record<string, NbtValue>;
      const extra = (tag["ExtraAttributes"] ?? {}) as Record<string, NbtValue>;
      const lore = ((display["Lore"] ?? []) as NbtValue[]).map((l) => stripColors(String(l)));
      const name = stripColors(String(display["Name"] ?? extra["id"] ?? "Unknown Item"));
      items.push({
        slot: index,
        name,
        id: String(extra["id"] ?? "UNKNOWN"),
        rarity: rarityFromLore(lore),
        count: Number(it["Count"] ?? 1),
        lore,
      });
    });
    return { id, label, slots: Math.max(list.length, items.length), items };
  } catch {
    return { id, label, slots: 0, items: [], locked: true };
  }
}

type ProfilesResponse = {
  profiles:
    | {
        profile_id: string;
        cute_name: string;
        game_mode?: string;
        selected: boolean;
        banking?: { balance?: number };
        members: Record<string, Record<string, unknown>>;
      }[]
    | null;
};

export async function getPlayerData(
  apiKey: string,
  username: string,
  profileId?: string,
): Promise<PlayerData> {
  const { uuid, name } = await resolveUuid(username);
  const data = await getJson<ProfilesResponse>(`${API}/skyblock/profiles?uuid=${uuid}`, apiKey);
  const list = data.profiles ?? [];
  if (!list.length) throw new HypixelError(`No SkyBlock profiles found for ${name}`);

  const chosen = list.find((p) => p.profile_id === profileId) ?? list.find((p) => p.selected) ?? list[0]!;
  const member = (chosen.members[uuid] ?? {}) as Record<string, any>;

  const summaries: ProfileSummary[] = list.map((p) => ({
    profileId: p.profile_id,
    cuteName: p.cute_name,
    gameMode: p.game_mode ? titleCase(p.game_mode) : "Classic",
    members: Object.keys(p.members).length,
    selected: p.profile_id === chosen.profile_id,
  }));

  const experience = (member?.player_data?.experience ?? {}) as Record<string, number>;
  const skills = SKILL_META.map((m) =>
    computeSkill(m.key as SkillKey, Number(experience[`SKILL_${m.key}`] ?? 0)),
  );
  const rated = skills.filter((s) => s.key !== "RUNECRAFTING" && s.key !== "SOCIAL");
  const skillAverage = rated.reduce((a, s) => a + s.level, 0) / (rated.length || 1);

  const inv = (member?.inventory ?? {}) as Record<string, any>;
  const containerDefs: [string | undefined, string, string][] = [
    [inv?.inv_contents?.data, "inventory", "Inventory"],
    [inv?.ender_chest_contents?.data, "ender-chest", "Ender Chest"],
    [inv?.inv_armor?.data, "armor", "Armor"],
    [inv?.equipment_contents?.data, "equipment", "Equipment"],
    [inv?.wardrobe_contents?.data, "wardrobe", "Wardrobe"],
    [inv?.bag_contents?.talisman_bag?.data, "accessory-bag", "Accessory Bag"],
    [inv?.bag_contents?.quiver?.data, "quiver", "Quiver"],
    [inv?.bag_contents?.potion_bag?.data, "potion-bag", "Potion Bag"],
    [inv?.bag_contents?.fishing_bag?.data, "fishing-bag", "Fishing Bag"],
    [inv?.personal_vault_contents?.data, "vault", "Personal Vault"],
  ];
  const backpacks = (inv?.backpack_contents ?? {}) as Record<string, { data?: string }>;
  for (const [key, val] of Object.entries(backpacks)) {
    containerDefs.push([val?.data, `backpack-${key}`, `Backpack ${Number(key) + 1}`]);
  }

  const containers = (
    await Promise.all(containerDefs.map(([d, id, label]) => parseContainer(d, id, label)))
  ).filter((c): c is InventoryContainer => !!c && (c.items.length > 0 || !!c.locked));

  const collectionRaw = (member?.collection ?? {}) as Record<string, number>;
  const names = await nameLookup();
  const collections = Object.entries(collectionRaw)
    .map(([id, amount]) => ({
      name: names.get(id) ?? titleCase(id),
      category: titleCase(id.split(":")[0] ?? id),
      amount: Number(amount) || 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    username: name,
    uuid,
    profiles: summaries,
    activeProfileId: chosen.profile_id,
    skills,
    skillAverage: Math.round(skillAverage * 100) / 100,
    totalSkillXp: skills.reduce((a, s) => a + s.totalXp, 0),
    purse: Number(member?.currencies?.coin_purse ?? 0),
    bank: typeof chosen.banking?.balance === "number" ? chosen.banking.balance : null,
    containers,
    collections,
    fairySouls: Number(member?.fairy_soul?.total_collected ?? 0),
    lastSave: Number(member?.profile?.last_save ?? chosen.members[uuid]?.["last_save"] ?? Date.now()),
  };
}
