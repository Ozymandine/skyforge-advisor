// Client-safe SkyBlock helpers: XP tables, formatting, shared types.

export const SKILL_XP_PER_LEVEL = [
  50, 125, 200, 300, 500, 750, 1000, 1500, 2000, 3500, 5000, 7500, 10000, 15000, 20000, 30000,
  50000, 75000, 100000, 200000, 300000, 400000, 500000, 600000, 700000, 800000, 900000, 1000000,
  1100000, 1200000, 1300000, 1400000, 1500000, 1600000, 1700000, 1800000, 1900000, 2000000, 2100000,
  2200000, 2300000, 2400000, 2500000, 2600000, 2750000, 2900000, 3100000, 3400000, 3700000, 4000000,
  4300000, 4600000, 4900000, 5200000, 5500000, 5800000, 6100000, 6400000, 6700000, 7000000,
];

export const RUNECRAFTING_XP_PER_LEVEL = [
  50, 100, 125, 160, 200, 250, 315, 400, 500, 625, 785, 1000, 1250, 1600, 2000, 2465, 3125, 4000,
  5000, 6200, 7800, 9800, 12200, 15300,
];

export const SOCIAL_XP_PER_LEVEL = [
  50, 100, 150, 250, 500, 750, 1000, 1250, 1500, 2000, 2500, 3000, 3750, 4500, 6000, 8000, 10000,
  12500, 15000, 20000, 25000, 30000, 35000, 40000, 50000,
];

export type SkillKey =
  | "COMBAT"
  | "MINING"
  | "FARMING"
  | "FISHING"
  | "FORAGING"
  | "ENCHANTING"
  | "ALCHEMY"
  | "TAMING"
  | "CARPENTRY"
  | "RUNECRAFTING"
  | "SOCIAL"
  | "HUNTING";

export const SKILL_META: { key: SkillKey; name: string; cap: number }[] = [
  { key: "COMBAT", name: "Combat", cap: 60 },
  { key: "MINING", name: "Mining", cap: 60 },
  { key: "FARMING", name: "Farming", cap: 60 },
  { key: "FISHING", name: "Fishing", cap: 50 },
  { key: "FORAGING", name: "Foraging", cap: 50 },
  { key: "ENCHANTING", name: "Enchanting", cap: 60 },
  { key: "ALCHEMY", name: "Alchemy", cap: 50 },
  { key: "TAMING", name: "Taming", cap: 60 },
  { key: "CARPENTRY", name: "Carpentry", cap: 50 },
  { key: "RUNECRAFTING", name: "Runecrafting", cap: 25 },
  { key: "SOCIAL", name: "Social", cap: 25 },
  { key: "HUNTING", name: "Hunting", cap: 50 },
];

function tableFor(key: SkillKey) {
  if (key === "RUNECRAFTING") return RUNECRAFTING_XP_PER_LEVEL;
  if (key === "SOCIAL") return SOCIAL_XP_PER_LEVEL;
  return SKILL_XP_PER_LEVEL;
}

export type SkillProgress = {
  key: SkillKey;
  name: string;
  level: number;
  cap: number;
  totalXp: number;
  currentXp: number;
  neededXp: number;
  pct: number;
  maxed: boolean;
};

export function computeSkill(key: SkillKey, totalXp: number): SkillProgress {
  const meta = SKILL_META.find((m) => m.key === key)!;
  const table = tableFor(key).slice(0, meta.cap);
  let remaining = Math.max(0, totalXp);
  let level = 0;
  for (const req of table) {
    if (remaining >= req) {
      remaining -= req;
      level += 1;
    } else break;
  }
  const maxed = level >= meta.cap;
  const needed = maxed ? 0 : (table[level] ?? 0);
  return {
    key,
    name: meta.name,
    level,
    cap: meta.cap,
    totalXp: Math.round(totalXp),
    currentXp: Math.round(maxed ? 0 : remaining),
    neededXp: needed,
    pct: maxed ? 100 : needed ? Math.min(100, Math.round((remaining / needed) * 100)) : 0,
    maxed,
  };
}

export function formatNumber(n: number): string {
  if (!isFinite(n)) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return `${Math.round(n)}`;
}

export function formatFull(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

export function titleCase(id: string): string {
  return id
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) => w[0]!.toUpperCase() + w.slice(1))
    .join(" ");
}

export const RARITY_ORDER = [
  "COMMON",
  "UNCOMMON",
  "RARE",
  "EPIC",
  "LEGENDARY",
  "MYTHIC",
  "DIVINE",
  "SPECIAL",
  "VERY_SPECIAL",
];

export type WikiItemStat = {
  name: string;
  value: number | string;
};

export type WikiRecipeIngredient = {
  id: string;
  name: string;
  amount: number;
};

export type WikiRecipe = {
  ingredients: WikiRecipeIngredient[];
  craftingType?: string;
  outputAmount?: number;
};

export type WikiAbility = {
  name: string;
  description: string | string[];
  manaCost?: number;
  cooldown?: number;
};

export type WikiRequirement = {
  type: string;
  level?: number;
  value?: string;
};

export type LiveItem = {
  name: string;
  id: string;

  // Core item information
  material?: string;
  rarity: string;
  category: string;
  npcSell: number | null;

  // Item description / lore
  description?: string | string[];

  // Combat / item stats
  stats?: Record<string, number>;

  // Abilities
  abilities?: WikiAbility[];

  // Requirements
  requirements?: WikiRequirement[];

  // Crafting
  recipe?: WikiRecipe;

  // Acquisition
  obtainedFrom?: string[];

  // Progression
  collection?: string;
  minionSource?: string;
  npcSource?: string;
  upgradePath?: string[];

  // External / supplementary information
  museumValue?: number | null;
  wikiUrl?: string;
};

export type BazaarProduct = {
  id: string;
  name: string;
  buyPrice: number;
  sellPrice: number;
  spread: number;
  margin: number;
  buyVolume: number;
  sellVolume: number;
  buyMovingWeek: number;
  sellMovingWeek: number;
  profitPerHour: number;
  liquidity: number;
  health: number;
};

export type AuctionEntry = {
  uuid: string;
  id?: string;
  texture?: string;
  name: string;
  rarity: string;
  bin: boolean;
  price: number;
  lowestBin: number | null;
  profit: number;
  endsInMs: number;
  bids: number;
  category: string;
};

export type InventoryItem = {
  slot: number;
  name: string;
  id: string;
  texture?: string;
  rarity: string;
  count: number;
  lore: string[];
};

export type InventoryContainer = {
  id: string;
  label: string;
  slots: number;
  items: InventoryItem[];
  locked?: boolean;
};

export type ProfileSummary = {
  profileId: string;
  cuteName: string;
  gameMode: string;
  members: number;
  selected: boolean;
};

export type PlayerData = {
  username: string;
  uuid: string;
  profiles: ProfileSummary[];
  activeProfileId: string;
  skills: SkillProgress[];
  skillAverage: number;
  totalSkillXp: number;
  purse: number;
  bank: number | null;
  containers: InventoryContainer[];
  collections: { id: string; name: string; category: string; amount: number }[];
  fairySouls: number;
  lastSave: number;
};

export function formatDuration(ms: number): string {
  if (ms <= 0) return "Ended";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
