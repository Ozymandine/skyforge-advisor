// src/lib/minions-engine.ts
// Authoritative SkyBlock Minion Economy, Placed Minion Loadouts,
// Daily Output Engine, Fuel ROI Calculator, and Slot Progression.

export type MinionCategory = "farming" | "mining" | "combat" | "foraging" | "fishing";

export type MinionDrop = {
  id: string;
  name: string;
  amountPerAction: number;
  npcPrice: number;
};

export type MinionDefinition = {
  id: string;
  name: string;
  category: MinionCategory;
  tier: number;
  maxTier: number;
  actionTime: number; // In seconds
  primaryDrop: MinionDrop;
  secondaryDrops?: MinionDrop[] | undefined;
  craftCostFormula?:
    | {
        baseItemId: string;
        baseItemCount: number;
        upgradedItemId?: string | undefined;
        upgradedItemCount?: number | undefined;
      }
    | undefined;
};

export type MinionFuel = {
  id: string;
  name: string;
  speedBonus: number; // e.g. 0.25 for +25%
  outputMultiplier?: number | undefined; // e.g. 4 for 4x output (Hyper Catalyst)
  durationHours?: number | undefined; // undefined = infinite/permanent
  costCoins?: number | undefined;
};

export type MinionUpgrade = {
  id: string;
  name: string;
  description: string;
  speedBonus?: number | undefined;
  extraDrops?: MinionDrop[] | undefined;
  isHopperCompatible?: boolean | undefined;
};

export type PlacedMinionSetup = {
  id: string;
  minionId: string;
  tier: number;
  fuelId?: string | undefined;
  upgrade1Id?: string | undefined;
  upgrade2Id?: string | undefined;
  hopperId?: "ENCHANTED_HOPPER" | "BUDGET_HOPPER" | "NONE" | undefined;
  storageChestId?: "SMALL_STORAGE" | "MEDIUM_STORAGE" | "LARGE_STORAGE" | "NONE" | undefined;
  lastClaimTimestamp?: number | undefined;
};

/* ============================================================================
 * FUELS CATALOG
 * ========================================================================== */

export const MINION_FUELS: MinionFuel[] = [
  { id: "NONE", name: "No Fuel", speedBonus: 0 },
  {
    id: "ENCHANTED_BREAD",
    name: "Enchanted Bread",
    speedBonus: 0.05,
    durationHours: 12,
    costCoins: 60,
  },
  {
    id: "ENCHANTED_COAL",
    name: "Enchanted Coal",
    speedBonus: 0.2,
    durationHours: 24,
    costCoins: 650,
  },
  {
    id: "ENCHANTED_CHARCOAL",
    name: "Enchanted Charcoal",
    speedBonus: 0.2,
    durationHours: 36,
    costCoins: 500,
  },
  { id: "SOLAR_PANEL", name: "Solar Panel", speedBonus: 0.25 },
  {
    id: "ENCHANTED_LAVA_BUCKET",
    name: "Enchanted Lava Bucket",
    speedBonus: 0.25,
    costCoins: 250_000,
  },
  { id: "MAGMA_BUCKET", name: "Magma Bucket", speedBonus: 0.3, costCoins: 3_500_000 },
  { id: "PLASMA_BUCKET", name: "Plasma Bucket", speedBonus: 0.35, costCoins: 25_000_000 },
  { id: "EVERBURNING_FLAME", name: "Everburning Flame", speedBonus: 0.35, costCoins: 120_000_000 },
  {
    id: "HAMSTER_WHEEL",
    name: "Hamster Wheel",
    speedBonus: 0.5,
    durationHours: 24,
    costCoins: 20_000,
  },
  { id: "FOUL_FLESH", name: "Foul Flesh", speedBonus: 0.9, durationHours: 5, costCoins: 25_000 },
  {
    id: "CATALYST",
    name: "Catalyst (3× Output)",
    speedBonus: 0,
    outputMultiplier: 3,
    durationHours: 3,
    costCoins: 75_000,
  },
  {
    id: "HYPER_CATALYST",
    name: "Hyper Catalyst (4× Output)",
    speedBonus: 0,
    outputMultiplier: 4,
    durationHours: 6,
    costCoins: 220_000,
  },
  {
    id: "TASTY_CHEESE",
    name: "Tasty Cheese (2× Output)",
    speedBonus: 0,
    outputMultiplier: 2,
    durationHours: 1,
    costCoins: 35_000,
  },
];

/* ============================================================================
 * UPGRADES CATALOG
 * ========================================================================== */

export const MINION_UPGRADES: MinionUpgrade[] = [
  { id: "NONE", name: "None", description: "Empty upgrade slot" },
  {
    id: "CORRUPT_SOIL",
    name: "Corrupt Soil",
    description: "Produces 1 Corrupt Fragment and 1 Sulphur per harvest action",
    extraDrops: [
      { id: "CORRUPT_FRAGMENT", name: "Corrupt Fragment", amountPerAction: 1, npcPrice: 20 },
      { id: "SULPHUR", name: "Sulphur", amountPerAction: 1, npcPrice: 20 },
    ],
  },
  {
    id: "DIAMOND_SPREADING",
    name: "Diamond Spreading",
    description: "Generates 1 Diamond for every ~10 harvest actions (~0.1 per action)",
    extraDrops: [{ id: "DIAMOND", name: "Diamond", amountPerAction: 0.1, npcPrice: 8 }],
  },
  {
    id: "SUPER_COMPACTOR_3000",
    name: "Super Compactor 3000",
    description: "Automatically compacts items into enchanted forms",
  },
  {
    id: "FLYCATCHER",
    name: "Flycatcher",
    description: "Increases minion speed by +20%",
    speedBonus: 0.2,
  },
  {
    id: "MINION_EXPANDER",
    name: "Minion Expander",
    description: "Increases minion speed by +5% and working radius by 1",
    speedBonus: 0.05,
  },
  {
    id: "LESSER_SOULFLOW_ENGINE",
    name: "Lesser Soulflow Engine",
    description: "Generates Raw Soulflow passively",
  },
  {
    id: "BERRIES",
    name: "Berries",
    description: "Increases speed of animal farming minions",
    speedBonus: 0.1,
  },
];

/* ============================================================================
 * MINIONS CATALOG DATA (Tiers 1 through 12)
 * ========================================================================== */

// Base speed curves (seconds per action) for Tier 1 to 12
const ACTION_TIMES: Record<string, number[]> = {
  SLIME: [26, 26, 24, 24, 21, 21, 18, 18, 15, 15, 12],
  SNOW: [13, 13, 11, 11, 9, 9, 8, 8, 7, 7, 6.5],
  CLAY: [32, 32, 29, 29, 26, 26, 22, 22, 19, 19, 16],
  SHEEP: [24, 24, 22, 22, 19, 19, 16, 16, 13, 13, 10, 8],
  COW: [26, 26, 24, 24, 21, 21, 18, 18, 15, 15, 12, 9.5],
  PIG: [26, 26, 24, 24, 21, 21, 18, 18, 15, 15, 12, 9.5],
  CHICKEN: [26, 26, 24, 24, 21, 21, 18, 18, 15, 15, 12, 9.5],
  RABBIT: [26, 26, 24, 24, 21, 21, 18, 18, 15, 15, 12, 9.5],
  WHEAT: [15, 15, 13, 13, 11, 11, 10, 10, 9, 9, 8, 6.5],
  CARROT: [20, 20, 18, 18, 16, 16, 14, 14, 12, 12, 10, 8],
  POTATO: [20, 20, 18, 18, 16, 16, 14, 14, 12, 12, 10, 8],
  PUMPKIN: [32, 32, 29, 29, 26, 26, 23, 23, 20, 20, 16, 12],
  MELON: [26, 26, 23, 23, 20, 20, 17, 17, 14, 14, 11, 8.5],
  MUSHROOM: [32, 32, 29, 29, 26, 26, 23, 23, 20, 20, 16, 12],
  COCOA: [27, 27, 24, 24, 21, 21, 18, 18, 15, 15, 12, 9],
  CACTUS: [27, 27, 24, 24, 21, 21, 18, 18, 15, 15, 12, 9],
  SUGAR_CANE: [24, 24, 22, 22, 19, 19, 16, 16, 13, 13, 10, 7.5],
  NETHER_WART: [30, 30, 27, 27, 24, 24, 21, 21, 18, 18, 15, 11],
  COBBLESTONE: [14, 14, 12, 12, 10, 10, 9, 9, 8, 8, 7, 5.5],
  COAL: [15, 15, 13, 13, 11, 11, 10, 10, 9, 9, 8, 6.5],
  IRON: [17, 17, 15, 15, 13, 13, 11, 11, 9, 9, 8, 6],
  GOLD: [22, 22, 19, 19, 16, 16, 14, 14, 12, 12, 10, 7.5],
  DIAMOND: [29, 29, 26, 26, 23, 23, 19, 19, 16, 16, 13, 10],
  EMERALD: [28, 28, 25, 25, 22, 22, 18, 18, 15, 15, 12, 9.5],
  REDSTONE: [29, 29, 26, 26, 23, 23, 19, 19, 16, 16, 13, 10],
  LAPIS: [29, 29, 26, 26, 23, 23, 19, 19, 16, 16, 13, 10],
  QUARTZ: [22, 22, 19, 19, 16, 16, 14, 14, 12, 12, 10, 7.5],
  OBSIDIAN: [45, 45, 41, 41, 37, 37, 33, 33, 29, 29, 24, 18],
  GLOWSTONE: [25, 25, 22, 22, 19, 19, 16, 16, 13, 13, 10, 8],
  GRAVEL: [26, 26, 23, 23, 20, 20, 17, 17, 14, 14, 11, 8.5],
  MITHRIL: [80, 80, 75, 75, 70, 70, 65, 65, 60, 60, 55, 45],
  HARD_STONE: [16, 16, 14, 14, 12, 12, 10, 10, 8, 8, 6.5, 5],
  ZOMBIE: [26, 26, 24, 24, 21, 21, 18, 18, 15, 15, 12],
  SKELETON: [26, 26, 24, 24, 21, 21, 18, 18, 15, 15, 12],
  SPIDER: [26, 26, 24, 24, 21, 21, 18, 18, 15, 15, 12],
  CAVE_SPIDER: [26, 26, 24, 24, 21, 21, 18, 18, 15, 15, 12],
  CREEPER: [27, 27, 25, 25, 22, 22, 19, 19, 16, 16, 13],
  ENDERMAN: [32, 32, 29, 29, 26, 26, 23, 23, 20, 20, 16],
  GHAST: [50, 50, 46, 46, 42, 42, 38, 38, 33, 33, 27],
  BLAZE: [33, 33, 30, 30, 27, 27, 24, 24, 20, 20, 16],
  MAGMA_CUBE: [32, 32, 29, 29, 26, 26, 23, 23, 20, 20, 16],
  REVENANT: [29, 29, 27, 27, 24, 24, 21, 21, 18, 18, 14, 10],
  TARANTULA: [29, 29, 27, 27, 24, 24, 21, 21, 18, 18, 14, 10],
  VOIDLING: [36, 36, 33, 33, 29, 29, 25, 25, 21, 21, 17, 13],
  INFERNO: [115, 115, 110, 110, 105, 105, 95, 95, 85, 85, 75],
  OAK: [48, 48, 45, 45, 42, 42, 38, 38, 33, 33, 27, 20],
  SPRUCE: [48, 48, 45, 45, 42, 42, 38, 38, 33, 33, 27, 20],
  BIRCH: [48, 48, 45, 45, 42, 42, 38, 38, 33, 33, 27, 20],
  DARK_OAK: [48, 48, 45, 45, 42, 42, 38, 38, 33, 33, 27, 20],
  ACACIA: [48, 48, 45, 45, 42, 42, 38, 38, 33, 33, 27, 20],
  JUNGLE: [48, 48, 45, 45, 42, 42, 38, 38, 33, 33, 27, 20],
  FISHING: [75, 75, 70, 70, 65, 65, 60, 60, 55, 55, 48],
};

export const RAW_MINION_PROFILES: Array<{
  id: string;
  name: string;
  category: MinionCategory;
  primaryDrop: { id: string; name: string; amount: number; npcPrice: number };
  secondaryDrops?: Array<{ id: string; name: string; amount: number; npcPrice: number }>;
}> = [
  // Combat
  {
    id: "SLIME",
    name: "Slime Minion",
    category: "combat",
    primaryDrop: { id: "SLIME_BALL", name: "Slimeball", amount: 1.5, npcPrice: 5 },
  },
  {
    id: "REVENANT",
    name: "Revenant Minion",
    category: "combat",
    primaryDrop: { id: "ROTTEN_FLESH", name: "Rotten Flesh", amount: 1.5, npcPrice: 2 },
    secondaryDrops: [{ id: "DIAMOND", name: "Diamond", amount: 0.2, npcPrice: 8 }],
  },
  {
    id: "TARANTULA",
    name: "Tarantula Minion",
    category: "combat",
    primaryDrop: { id: "SPIDER_EYE", name: "Spider Eye", amount: 1.5, npcPrice: 3 },
    secondaryDrops: [
      { id: "STRING", name: "String", amount: 1.0, npcPrice: 3 },
      { id: "IRON_INGOT", name: "Iron Ingot", amount: 0.2, npcPrice: 3 },
    ],
  },
  {
    id: "VOIDLING",
    name: "Voidling Minion",
    category: "combat",
    primaryDrop: { id: "ENDER_PEARL", name: "Ender Pearl", amount: 1.5, npcPrice: 10 },
    secondaryDrops: [
      { id: "OBSIDIAN", name: "Obsidian", amount: 0.3, npcPrice: 12 },
      { id: "QUARTZ", name: "Quartz", amount: 0.3, npcPrice: 4 },
    ],
  },
  {
    id: "INFERNO",
    name: "Inferno Minion",
    category: "combat",
    primaryDrop: { id: "INFERNO_VERTEX", name: "Inferno Vertex", amount: 0.05, npcPrice: 50_000 },
    secondaryDrops: [{ id: "CRUDE_GABAGOOL", name: "Crude Gabagool", amount: 1.0, npcPrice: 100 }],
  },
  {
    id: "ZOMBIE",
    name: "Zombie Minion",
    category: "combat",
    primaryDrop: { id: "ROTTEN_FLESH", name: "Rotten Flesh", amount: 1, npcPrice: 2 },
  },
  {
    id: "SKELETON",
    name: "Skeleton Minion",
    category: "combat",
    primaryDrop: { id: "BONE", name: "Bone", amount: 1, npcPrice: 2 },
  },
  {
    id: "SPIDER",
    name: "Spider Minion",
    category: "combat",
    primaryDrop: { id: "STRING", name: "String", amount: 1, npcPrice: 3 },
    secondaryDrops: [{ id: "SPIDER_EYE", name: "Spider Eye", amount: 0.5, npcPrice: 3 }],
  },
  {
    id: "BLAZE",
    name: "Blaze Minion",
    category: "combat",
    primaryDrop: { id: "BLAZE_ROD", name: "Blaze Rod", amount: 1, npcPrice: 9 },
  },
  {
    id: "MAGMA_CUBE",
    name: "Magma Cube Minion",
    category: "combat",
    primaryDrop: { id: "MAGMA_CREAM", name: "Magma Cream", amount: 1, npcPrice: 8 },
  },
  {
    id: "ENDERMAN",
    name: "Enderman Minion",
    category: "combat",
    primaryDrop: { id: "ENDER_PEARL", name: "Ender Pearl", amount: 1, npcPrice: 10 },
  },
  {
    id: "GHAST",
    name: "Ghast Minion",
    category: "combat",
    primaryDrop: { id: "GHAST_TEAR", name: "Ghast Tear", amount: 1, npcPrice: 16 },
  },

  // Mining
  {
    id: "SNOW",
    name: "Snow Minion",
    category: "mining",
    primaryDrop: { id: "SNOW_BALL", name: "Snowball", amount: 4, npcPrice: 1 },
  },
  {
    id: "CLAY",
    name: "Clay Minion",
    category: "mining",
    primaryDrop: { id: "CLAY_BALL", name: "Clay", amount: 4, npcPrice: 3 },
  },
  {
    id: "DIAMOND",
    name: "Diamond Minion",
    category: "mining",
    primaryDrop: { id: "DIAMOND", name: "Diamond", amount: 1, npcPrice: 8 },
  },
  {
    id: "MITHRIL",
    name: "Mithril Minion",
    category: "mining",
    primaryDrop: { id: "MITHRIL_ORE", name: "Mithril", amount: 1, npcPrice: 10 },
  },
  {
    id: "HARD_STONE",
    name: "Hard Stone Minion",
    category: "mining",
    primaryDrop: { id: "HARD_STONE", name: "Hard Stone", amount: 1, npcPrice: 1 },
  },
  {
    id: "COBBLESTONE",
    name: "Cobblestone Minion",
    category: "mining",
    primaryDrop: { id: "COBBLESTONE", name: "Cobblestone", amount: 1, npcPrice: 3 },
  },
  {
    id: "COAL",
    name: "Coal Minion",
    category: "mining",
    primaryDrop: { id: "COAL", name: "Coal", amount: 1, npcPrice: 2 },
  },
  {
    id: "IRON",
    name: "Iron Minion",
    category: "mining",
    primaryDrop: { id: "IRON_INGOT", name: "Iron Ingot", amount: 1, npcPrice: 3 },
  },
  {
    id: "GOLD",
    name: "Gold Minion",
    category: "mining",
    primaryDrop: { id: "GOLD_INGOT", name: "Gold Ingot", amount: 1, npcPrice: 4 },
  },
  {
    id: "EMERALD",
    name: "Emerald Minion",
    category: "mining",
    primaryDrop: { id: "EMERALD", name: "Emerald", amount: 1, npcPrice: 6 },
  },
  {
    id: "REDSTONE",
    name: "Redstone Minion",
    category: "mining",
    primaryDrop: { id: "REDSTONE", name: "Redstone", amount: 1, npcPrice: 1 },
  },
  {
    id: "LAPIS",
    name: "Lapis Minion",
    category: "mining",
    primaryDrop: { id: "INK_SACK:4", name: "Lapis Lazuli", amount: 1, npcPrice: 1 },
  },
  {
    id: "QUARTZ",
    name: "Quartz Minion",
    category: "mining",
    primaryDrop: { id: "QUARTZ", name: "Quartz", amount: 1, npcPrice: 4 },
  },
  {
    id: "OBSIDIAN",
    name: "Obsidian Minion",
    category: "mining",
    primaryDrop: { id: "OBSIDIAN", name: "Obsidian", amount: 1, npcPrice: 12 },
  },
  {
    id: "GLOWSTONE",
    name: "Glowstone Minion",
    category: "mining",
    primaryDrop: { id: "GLOWSTONE_DUST", name: "Glowstone Dust", amount: 1, npcPrice: 2 },
  },
  {
    id: "GRAVEL",
    name: "Gravel Minion",
    category: "mining",
    primaryDrop: { id: "GRAVEL", name: "Gravel", amount: 1, npcPrice: 3 },
  },

  // Farming
  {
    id: "SHEEP",
    name: "Sheep Minion",
    category: "farming",
    primaryDrop: { id: "MUTTON", name: "Mutton", amount: 1, npcPrice: 5 },
    secondaryDrops: [{ id: "WOOL", name: "Wool", amount: 1, npcPrice: 2 }],
  },
  {
    id: "MELON",
    name: "Melon Minion",
    category: "farming",
    primaryDrop: { id: "MELON", name: "Melon Slice", amount: 4, npcPrice: 1 },
  },
  {
    id: "PUMPKIN",
    name: "Pumpkin Minion",
    category: "farming",
    primaryDrop: { id: "PUMPKIN", name: "Pumpkin", amount: 1, npcPrice: 4 },
  },
  {
    id: "WHEAT",
    name: "Wheat Minion",
    category: "farming",
    primaryDrop: { id: "WHEAT", name: "Wheat", amount: 1, npcPrice: 2 },
    secondaryDrops: [{ id: "SEEDS", name: "Seeds", amount: 1, npcPrice: 0.5 }],
  },
  {
    id: "CARROT",
    name: "Carrot Minion",
    category: "farming",
    primaryDrop: { id: "CARROT_ITEM", name: "Carrot", amount: 3, npcPrice: 1 },
  },
  {
    id: "POTATO",
    name: "Potato Minion",
    category: "farming",
    primaryDrop: { id: "POTATO_ITEM", name: "Potato", amount: 3, npcPrice: 1 },
  },
  {
    id: "SUGAR_CANE",
    name: "Sugar Cane Minion",
    category: "farming",
    primaryDrop: { id: "SUGAR_CANE", name: "Sugar Cane", amount: 1, npcPrice: 2 },
  },
  {
    id: "CACTUS",
    name: "Cactus Minion",
    category: "farming",
    primaryDrop: { id: "CACTUS", name: "Cactus", amount: 1, npcPrice: 1 },
  },
  {
    id: "COCOA",
    name: "Cocoa Beans Minion",
    category: "farming",
    primaryDrop: { id: "INK_SACK:3", name: "Cocoa Beans", amount: 3, npcPrice: 1 },
  },
  {
    id: "MUSHROOM",
    name: "Mushroom Minion",
    category: "farming",
    primaryDrop: { id: "RED_MUSHROOM", name: "Red Mushroom", amount: 1, npcPrice: 4 },
  },
  {
    id: "NETHER_WART",
    name: "Nether Wart Minion",
    category: "farming",
    primaryDrop: { id: "NETHER_STALK", name: "Nether Wart", amount: 2, npcPrice: 3 },
  },
  {
    id: "COW",
    name: "Cow Minion",
    category: "farming",
    primaryDrop: { id: "RAW_BEEF", name: "Raw Beef", amount: 1, npcPrice: 4 },
    secondaryDrops: [{ id: "LEATHER", name: "Leather", amount: 1, npcPrice: 3 }],
  },
  {
    id: "PIG",
    name: "Pig Minion",
    category: "farming",
    primaryDrop: { id: "PORK", name: "Raw Porkchop", amount: 1, npcPrice: 5 },
  },
  {
    id: "CHICKEN",
    name: "Chicken Minion",
    category: "farming",
    primaryDrop: { id: "RAW_CHICKEN", name: "Raw Chicken", amount: 1, npcPrice: 4 },
    secondaryDrops: [
      { id: "FEATHER", name: "Feather", amount: 1, npcPrice: 3 },
      { id: "EGG", name: "Egg", amount: 0.2, npcPrice: 3 },
    ],
  },
  {
    id: "RABBIT",
    name: "Rabbit Minion",
    category: "farming",
    primaryDrop: { id: "RABBIT", name: "Raw Rabbit", amount: 1, npcPrice: 4 },
    secondaryDrops: [
      { id: "RABBIT_HIDE", name: "Rabbit Hide", amount: 1, npcPrice: 4 },
      { id: "RABBIT_FOOT", name: "Rabbit's Foot", amount: 0.1, npcPrice: 10 },
    ],
  },

  // Foraging
  {
    id: "OAK",
    name: "Oak Minion",
    category: "foraging",
    primaryDrop: { id: "LOG", name: "Oak Wood", amount: 1, npcPrice: 2 },
  },
  {
    id: "SPRUCE",
    name: "Spruce Minion",
    category: "foraging",
    primaryDrop: { id: "LOG:1", name: "Spruce Wood", amount: 1, npcPrice: 2 },
  },
  {
    id: "BIRCH",
    name: "Birch Minion",
    category: "foraging",
    primaryDrop: { id: "LOG:2", name: "Birch Wood", amount: 1, npcPrice: 2 },
  },
  {
    id: "DARK_OAK",
    name: "Dark Oak Minion",
    category: "foraging",
    primaryDrop: { id: "LOG_2:1", name: "Dark Oak Wood", amount: 1, npcPrice: 2 },
  },
  {
    id: "ACACIA",
    name: "Acacia Minion",
    category: "foraging",
    primaryDrop: { id: "LOG_2", name: "Acacia Wood", amount: 1, npcPrice: 2 },
  },
  {
    id: "JUNGLE",
    name: "Jungle Minion",
    category: "foraging",
    primaryDrop: { id: "LOG:3", name: "Jungle Wood", amount: 1, npcPrice: 2 },
  },

  // Fishing
  {
    id: "FISHING",
    name: "Fishing Minion",
    category: "fishing",
    primaryDrop: { id: "RAW_FISH", name: "Raw Fish", amount: 1, npcPrice: 6 },
    secondaryDrops: [
      { id: "PRISMARINE_SHARD", name: "Prismarine Shard", amount: 0.2, npcPrice: 5 },
      { id: "SPONGE", name: "Sponge", amount: 0.02, npcPrice: 50 },
    ],
  },
];

/** Build the full expanded catalog with every individual tier 1 to 11/12 */
export const MINIONS_CATALOG: MinionDefinition[] = [];

for (const profile of RAW_MINION_PROFILES) {
  const times = ACTION_TIMES[profile.id] ?? [30, 28, 26, 24, 22, 20, 18, 16, 14, 12, 10];
  const maxTier = times.length;

  for (let tier = 1; tier <= maxTier; tier++) {
    MINIONS_CATALOG.push({
      id: profile.id,
      name: `${profile.name} ${toRoman(tier)}`,
      category: profile.category,
      tier,
      maxTier,
      actionTime: times[tier - 1] ?? 20,
      primaryDrop: {
        id: profile.primaryDrop.id,
        name: profile.primaryDrop.name,
        amountPerAction: profile.primaryDrop.amount,
        npcPrice: profile.primaryDrop.npcPrice,
      },
      secondaryDrops: profile.secondaryDrops?.map((d) => ({
        id: d.id,
        name: d.name,
        amountPerAction: d.amount,
        npcPrice: d.npcPrice,
      })),
    });
  }
}

/* ============================================================================
 * DAILY OUTPUT & REVENUE CALCULATOR
 * ========================================================================== */

export type CalculatedDailyOutput = {
  dailyActions: number;
  dailyHarvests: number;
  effectiveActionTime: number;
  speedMultiplier: number;
  dailyNpcCoins: number;
  dailyBazaarCoins: number;
  itemsProduced: Array<{
    id: string;
    name: string;
    dailyAmount: number;
    npcCoinValue: number;
    bazaarCoinValue: number;
  }>;
};

export function calculateMinionDailyOutput({
  minion,
  fuel,
  upgrade1,
  upgrade2,
  hopper = "ENCHANTED_HOPPER",
  bazaarPriceMap = new Map<string, number>(),
}: {
  minion: MinionDefinition;
  fuel?: MinionFuel | undefined;
  upgrade1?: MinionUpgrade | undefined;
  upgrade2?: MinionUpgrade | undefined;
  hopper?: "ENCHANTED_HOPPER" | "BUDGET_HOPPER" | "NONE" | undefined;
  bazaarPriceMap?: Map<string, number> | undefined;
}): CalculatedDailyOutput {
  const fuelSpeed = fuel?.speedBonus ?? 0;
  const up1Speed = upgrade1?.speedBonus ?? 0;
  const up2Speed = upgrade2?.speedBonus ?? 0;

  const totalSpeedBonus = fuelSpeed + up1Speed + up2Speed;
  const speedMultiplier = 1 + totalSpeedBonus;
  const outputMult = fuel?.outputMultiplier ?? 1;

  // Minions perform 2 actions per harvest cycle in SkyBlock (1 placing + 1 harvesting).
  // Total harvest actions per 24 hours (86,400 seconds) = 86400 / (actionTime * 2) * speedMultiplier
  const secondsPerDay = 86_400;
  const effectiveActionTime = minion.actionTime / Math.max(0.1, speedMultiplier);
  const dailyActions = Math.round((secondsPerDay / effectiveActionTime) * outputMult);
  const dailyHarvests = Math.round(dailyActions / 2);

  const hopperMultiplier =
    hopper === "ENCHANTED_HOPPER" ? 0.9 : hopper === "BUDGET_HOPPER" ? 0.5 : 1.0;

  const itemsProduced: CalculatedDailyOutput["itemsProduced"] = [];

  // Primary Drop
  const primaryDailyAmount = Math.round(dailyHarvests * minion.primaryDrop.amountPerAction);
  const primaryBzPrice = bazaarPriceMap.get(minion.primaryDrop.id) ?? minion.primaryDrop.npcPrice;
  itemsProduced.push({
    id: minion.primaryDrop.id,
    name: minion.primaryDrop.name,
    dailyAmount: primaryDailyAmount,
    npcCoinValue: Math.round(primaryDailyAmount * minion.primaryDrop.npcPrice * hopperMultiplier),
    bazaarCoinValue: Math.round(primaryDailyAmount * primaryBzPrice),
  });

  // Secondary Drops
  for (const sec of minion.secondaryDrops ?? []) {
    const secDailyAmount = Math.round(dailyHarvests * sec.amountPerAction);
    const secBzPrice = bazaarPriceMap.get(sec.id) ?? sec.npcPrice;
    itemsProduced.push({
      id: sec.id,
      name: sec.name,
      dailyAmount: secDailyAmount,
      npcCoinValue: Math.round(secDailyAmount * sec.npcPrice * hopperMultiplier),
      bazaarCoinValue: Math.round(secDailyAmount * secBzPrice),
    });
  }

  // Upgrade Extra Drops (e.g. Corrupt Soil, Diamond Spreading)
  const extraDropSources = [...(upgrade1?.extraDrops ?? []), ...(upgrade2?.extraDrops ?? [])];
  for (const extra of extraDropSources) {
    const extraDailyAmount = Math.round(dailyHarvests * extra.amountPerAction);
    const extraBzPrice = bazaarPriceMap.get(extra.id) ?? extra.npcPrice;
    itemsProduced.push({
      id: extra.id,
      name: extra.name,
      dailyAmount: extraDailyAmount,
      npcCoinValue: Math.round(extraDailyAmount * extra.npcPrice * hopperMultiplier),
      bazaarCoinValue: Math.round(extraDailyAmount * extraBzPrice),
    });
  }

  const dailyNpcCoins = itemsProduced.reduce((sum, item) => sum + item.npcCoinValue, 0);
  const dailyBazaarCoins = itemsProduced.reduce((sum, item) => sum + item.bazaarCoinValue, 0);

  return {
    dailyActions,
    dailyHarvests,
    effectiveActionTime: Math.round(effectiveActionTime * 10) / 10,
    speedMultiplier: Math.round(speedMultiplier * 100) / 100,
    dailyNpcCoins,
    dailyBazaarCoins,
    itemsProduced,
  };
}

/* ============================================================================
 * MINION SLOT PROGRESSION & CRAFTING ENGINE
 * ========================================================================== */

// Unique craft milestone thresholds to unlock minion slots (starts at 5 base slots)
export const MINION_SLOT_THRESHOLDS = [
  5, 15, 30, 50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300, 350, 400, 450, 500, 550, 600, 650,
  700, 750, 800, 850,
];

export type MinionSlotProgression = {
  uniqueCraftsCount: number;
  craftSlotsUnlocked: number;
  communitySlots: number;
  totalSlotsUnlocked: number;
  maxPossibleSlots: number;
  nextSlotThreshold: number;
  craftsForNextSlot: number;
  progressToNextPct: number;
};

export function getMinionSlotProgression(
  craftedGenerators: string[] = [],
  communityCenterSlots = 0,
): MinionSlotProgression {
  const uniqueCraftsCount = new Set(craftedGenerators).size;

  let craftSlots = 5; // Base 5 slots
  for (const threshold of MINION_SLOT_THRESHOLDS) {
    if (uniqueCraftsCount >= threshold) {
      craftSlots++;
    } else {
      break;
    }
  }

  const currentSlotIndex = Math.min(MINION_SLOT_THRESHOLDS.length - 1, Math.max(0, craftSlots - 5));
  const nextSlotThreshold = MINION_SLOT_THRESHOLDS[currentSlotIndex] ?? 850;
  const prevThreshold =
    currentSlotIndex > 0 ? (MINION_SLOT_THRESHOLDS[currentSlotIndex - 1] ?? 0) : 0;

  const craftsForNextSlot = Math.max(0, nextSlotThreshold - uniqueCraftsCount);
  const delta = nextSlotThreshold - prevThreshold;
  const progressToNextPct =
    delta > 0
      ? Math.min(100, Math.round(((uniqueCraftsCount - prevThreshold) / delta) * 100))
      : 100;

  return {
    uniqueCraftsCount,
    craftSlotsUnlocked: craftSlots,
    communitySlots: communityCenterSlots,
    totalSlotsUnlocked: craftSlots + communityCenterSlots,
    maxPossibleSlots: 30 + 5, // 30 from crafts + 5 from Elizabeth Community Center
    nextSlotThreshold,
    craftsForNextSlot,
    progressToNextPct,
  };
}

export type CheapestCraftRecommendation = {
  minionId: string;
  minionName: string;
  category: MinionCategory;
  tier: number;
  craftCostCoins: number;
  materialsNeeded: string;
};

export function getCheapestMinionCrafts(
  craftedGenerators: string[] = [],
  bazaarPriceMap = new Map<string, number>(),
  limit = 10,
): CheapestCraftRecommendation[] {
  const craftedSet = new Set(craftedGenerators.map((s) => s.toUpperCase()));
  const missing: CheapestCraftRecommendation[] = [];

  for (const profile of RAW_MINION_PROFILES) {
    const times = ACTION_TIMES[profile.id] ?? [];
    const maxTier = times.length;

    for (let tier = 1; tier <= maxTier; tier++) {
      const tag = `${profile.id}_${tier}`.toUpperCase();
      if (craftedSet.has(tag)) continue;

      // Estimate craft materials cost based on tier exponential curve
      const baseItemPrice =
        bazaarPriceMap.get(profile.primaryDrop.id) ?? profile.primaryDrop.npcPrice;
      const rawMaterialsCount = tier === 1 ? 80 : Math.round(80 * Math.pow(1.8, tier - 1));
      const craftCost = Math.round(rawMaterialsCount * baseItemPrice);

      missing.push({
        minionId: profile.id,
        minionName: `${profile.name} ${toRoman(tier)}`,
        category: profile.category,
        tier,
        craftCostCoins: Math.max(100, craftCost),
        materialsNeeded: `${rawMaterialsCount.toLocaleString()}× ${profile.primaryDrop.name}`,
      });
    }
  }

  return missing.sort((a, b) => a.craftCostCoins - b.craftCostCoins).slice(0, limit);
}

/* ============================================================================
 * PLACED MINIONS & CLAIMABLE VALUE GENERATOR
 * ========================================================================== */

export type PlacedMinionReport = {
  setup: PlacedMinionSetup;
  minion: MinionDefinition;
  dailyCoins: number;
  claimableCoins: number;
  accumulatedItems: Array<{ name: string; count: number; value: number }>;
};

export function calculatePlacedMinionClaims(
  placedSetups: PlacedMinionSetup[],
  elapsedMs: number,
  bazaarPriceMap = new Map<string, number>(),
): {
  totalClaimableCoins: number;
  totalDailyRate: number;
  minionReports: PlacedMinionReport[];
} {
  const elapsedDays = Math.max(0, elapsedMs) / (86_400 * 1000);
  let totalClaimableCoins = 0;
  let totalDailyRate = 0;
  const minionReports: PlacedMinionReport[] = [];

  for (const setup of placedSetups) {
    const minionDef =
      MINIONS_CATALOG.find((m) => m.id === setup.minionId && m.tier === setup.tier) ||
      MINIONS_CATALOG.find((m) => m.id === setup.minionId && m.tier === 11) ||
      MINIONS_CATALOG[0]!;

    const fuel = MINION_FUELS.find((f) => f.id === setup.fuelId);
    const up1 = MINION_UPGRADES.find((u) => u.id === setup.upgrade1Id);
    const up2 = MINION_UPGRADES.find((u) => u.id === setup.upgrade2Id);

    const output = calculateMinionDailyOutput({
      minion: minionDef,
      fuel,
      upgrade1: up1,
      upgrade2: up2,
      hopper: setup.hopperId,
      bazaarPriceMap,
    });

    const minionClaimCoins = Math.round(output.dailyNpcCoins * elapsedDays);
    totalClaimableCoins += minionClaimCoins;
    totalDailyRate += output.dailyNpcCoins;

    const accumulatedItems = output.itemsProduced.map((item) => ({
      name: item.name,
      count: Math.round(item.dailyAmount * elapsedDays),
      value: Math.round(item.npcCoinValue * elapsedDays),
    }));

    minionReports.push({
      setup,
      minion: minionDef,
      dailyCoins: output.dailyNpcCoins,
      claimableCoins: minionClaimCoins,
      accumulatedItems,
    });
  }

  return {
    totalClaimableCoins,
    totalDailyRate,
    minionReports,
  };
}

/* ============================================================================
 * UTILITIES
 * ========================================================================== */

function toRoman(num: number): string {
  const romanMap: Record<number, string> = {
    1: "I",
    2: "II",
    3: "III",
    4: "IV",
    5: "V",
    6: "VI",
    7: "VII",
    8: "VIII",
    9: "IX",
    10: "X",
    11: "XI",
    12: "XII",
  };
  return romanMap[num] ?? String(num);
}
