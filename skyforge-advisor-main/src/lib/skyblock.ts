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

  material?: string;
  rarity: string;
  category: string;

  lore?: string[];
  description?: string | string[];
  stats?: Record<string, number>;
  abilities?: WikiAbility[];
  requirements?: WikiRequirement[];

  npcSell: number | null;

  bazaar?: {
    buyPrice: number;
    sellPrice: number;
    buyVolume: number;
    sellVolume: number;
    buyMovingWeek: number;
    sellMovingWeek: number;
  };

  auctionHouse?: {
    lowestBin: number | null;
    averageBin: number | null;
    listings: number;
  };

  recipe?: WikiRecipe;

  obtainedFrom?: string[];
  collection?: string;
  minionSource?: string;
  npcSource?: string;

  upgradePath?: string[];

  museumValue?: number | null;
  enchantments?: string[];
  reforges?: string[];
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
  /** Current top bid for non-BIN auctions (null for BIN). */
  topBid: number | null;
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
  texture?: string | undefined;
  rarity: string;
  count: number;
  lore: string[];
  /** Enchantment levels parsed from NBT ExtraAttributes. */
  enchantments?: Record<string, number> | undefined;
  reforge?: string | undefined;
  /** Dungeon stars (0–10). */
  stars?: number | undefined;
  hotPotatoBooks?: number | undefined;
  /** Gemstone slots filled, keyed by slot name. */
  gems?: Record<string, string> | undefined;
  /** Essence cost tier / ability scroll info when present. */
  abilityScrolls?: string[] | undefined;
  /** Kuudra attributes (keyed by attribute id e.g. mana_pool, veteran) */
  attributes?: Record<string, number> | undefined;
  /** The Art of War applied (+5 Strength) */
  artOfWar?: number | undefined;
  /** Wood Singularity applied (+100 HP) */
  woodSingularity?: number | undefined;
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

/** Cumulative XP required per pet level (levels 1–100). */
export const PET_XP_PER_LEVEL = [
  100, 215, 330, 450, 570, 690, 810, 930, 1050, 1170, 1290, 1410, 1530, 1650, 1770, 1890, 2010,
  2130, 2250, 2370, 2500, 2630, 2760, 2890, 3020, 3150, 3280, 3410, 3540, 3670, 3800, 3930, 4060,
  4190, 4320, 4450, 4580, 4710, 4840, 4970, 5100, 5240, 5380, 5520, 5660, 5800, 5940, 6080, 6220,
  6360, 6500, 6650, 6800, 6950, 7100, 7250, 7400, 7550, 7700, 7850, 8000, 8200, 8400, 8600, 8800,
  9000, 9200, 9400, 9600, 9800, 10000, 10300, 10600, 10900, 11200, 11500, 11800, 12100, 12400,
  12700, 13000, 13500, 14000, 14500, 15000, 15500, 16000, 16500, 17000, 17500, 18000, 18500, 19000,
  19500, 20000, 21000, 22000, 23000, 24000, 25000,
];

export function computePetLevel(xp: number): number {
  let remaining = Math.max(0, xp);
  let level = 1;
  for (const req of PET_XP_PER_LEVEL) {
    if (remaining >= req) {
      remaining -= req;
      level += 1;
    } else break;
  }
  return Math.min(100, level);
}

export type PetInfo = {
  name: string;
  rarity: string;
  level: number;
  xp: number;
  /** True when this pet is currently summoned. */
  active?: boolean;
  heldItem?: string;
  skin?: string;
  candyUsed?: number;
};

export type DungeonFloor = {
  name: string;
  completions: number;
  bestScore: number;
};

export type DungeonStats = {
  catacombsLevel: number;
  catacombsXp: number;
  secretsFound: number;
  floors: DungeonFloor[];
  /** Master Mode floors (M1–M7), when the player has data for them. */
  masterMode?: DungeonFloor[];
  masterModeLevel?: number;
  masterModeXp?: number;
  /** Dungeon class levels (healer/mage/berserk/archer/tank). */
  classes?: { name: string; level: number; selected: boolean }[];
  /** Milestone completions (tier milestones across floors). */
  milestones?: number;
};

export type SlayerStats = {
  name: string;
  tier: number;
  kills: number;
  /** Slayer XP earned for this boss/tier, when present. */
  xp?: number;
}[];

export type HotmStats = {
  tier: number;
  xp: number;
  /** Powder totals by type. */
  powders: { mithril: number; gemstone: number; glacite: number };
  /** Heart of the Mountain node levels (keyed by node id). */
  nodes: Record<string, number>;
};

export type GardenStats = {
  level: number;
  xp: number;
  /** Crop milestones: crop id → milestone value. */
  cropMilestones: Record<string, number>;
  visitorsServed?: number;
  compost?: number;
};

export type CrimsonStats = {
  /** Dojo faction points by challenge id. */
  dojo: Record<string, number>;
  /** Kuudra completion counts keyed by tier type (normal/hot/fiery/burning). */
  kuudra: Record<string, number>;
  faction?: string;
  reputation?: number;
};

export type RiftStats = {
  motes?: number;
  /** Arbitrary rift progress values keyed by milestone id. */
  progress: Record<string, number>;
};

export type MuseumStats = {
  donatedItems?: number;
  /** Museum value/bonus flags when present. */
  appraised?: number;
};

export type AchievementStats = {
  points: number;
  /** Per-category completed counts. */
  categories: Record<string, number>;
};

export type JacobStats = {
  gold: number;
  silver: number;
  bronze: number;
  platinum?: number;
  diamond?: number;
  /** Per-crop contest bests, keyed by crop id. */
  perCrop: Record<string, number>;
};

export type ExperimentationStats = {
  /** Serums/simons claim counts keyed by experiment id. */
  claims: Record<string, number>;
};

export type LifetimeStats = {
  kills?: number;
  deaths?: number;
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
  dungeons?: DungeonStats;
  slayers?: SlayerStats;
  pets?: PetInfo[];
  hotm?: HotmStats;
  garden?: GardenStats;
  crimson?: CrimsonStats;
  rift?: RiftStats;
  museum?: MuseumStats;
  achievements?: AchievementStats;
  jacob?: JacobStats;
  experimentation?: ExperimentationStats;
  lifetimeStats?: LifetimeStats;
  communityUpgrades?: { upgrade: string; level: number }[];
  sacks?: SacksData;
  bestiary?: import("./bestiary").BestiaryData;
  slayerOverview?: import("./slayer").SlayerOverview;
  hypixelPlayer?: import("./hypixel-rank").RawHypixelPlayerData | null | undefined;
};

export type SackItem = {
  id: string;
  name: string;
  count: number;
  value: number;
};

export type SacksData = {
  totalValue: number;
  items: SackItem[];
};

export function formatDuration(ms: number): string {
  if (ms <= 0) return "Ended";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
