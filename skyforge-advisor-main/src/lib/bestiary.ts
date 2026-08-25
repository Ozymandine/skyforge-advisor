// src/lib/bestiary.ts
// Complete Hypixel SkyBlock Bestiary calculator:
// Brackets, mob families, kill tiers (1–25), and total family milestone calculations.

export type BestiaryMob = {
  id: string;
  name: string;
  kills: number;
  deaths: number;
  tier: number;
  maxTier: number;
  nextTierKills: number | null;
  bracket: number;
};

export type BestiaryFamily = {
  id: string;
  name: string;
  totalKills: number;
  totalDeaths: number;
  tiersUnlocked: number;
  maxTiers: number;
  mobs: BestiaryMob[];
};

export type BestiaryData = {
  totalKills: number;
  totalDeaths: number;
  totalTiersUnlocked: number;
  maxTiers: number;
  milestone: number;
  milestoneProgressPct: number;
  families: BestiaryFamily[];
};

// ---------------------------------------------------------------------------
// BESTIARY BRACKETS (Required kills per tier)
// ---------------------------------------------------------------------------

export const BESTIARY_BRACKETS: Record<number, number[]> = {
  // 1: Standard Mobs (25 tiers)
  1: [
    10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000,
    200000, 300000, 400000, 500000, 600000, 700000, 800000, 900000, 1000000,
    1500000, 2000000, 3000000,
  ],
  // 2: Minibosses / Special Mobs (12 tiers)
  2: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000],
  // 3: Bosses (10 tiers)
  3: [1, 2, 3, 4, 5, 10, 25, 50, 100, 250],
  // 4: Spooky / Rare Event Mobs (10 tiers)
  4: [5, 15, 30, 60, 125, 250, 500, 1000, 2000, 5000],
  // 5: Mythological Creatures (10 tiers)
  5: [5, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000],
  // 6: Pests / Garden (10 tiers)
  6: [10, 25, 50, 100, 200, 400, 800, 1500, 3000, 5000],
};

export type MobDefinition = {
  id: string;
  name: string;
  bracket: number;
};

export type FamilyDefinition = {
  id: string;
  name: string;
  mobs: MobDefinition[];
};

export const BESTIARY_FAMILIES: FamilyDefinition[] = [
  {
    id: "hub",
    name: "Hub",
    mobs: [
      { id: "zombie", name: "Zombie", bracket: 1 },
      { id: "skeleton", name: "Skeleton", bracket: 1 },
      { id: "creeper", name: "Creeper", bracket: 1 },
      { id: "spider", name: "Spider", bracket: 1 },
      { id: "wolf", name: "Wolf", bracket: 1 },
      { id: "graveyard_zombie", name: "Graveyard Zombie", bracket: 1 },
      { id: "zombie_villager", name: "Zombie Villager", bracket: 1 },
      { id: "crypt_ghoul", name: "Crypt Ghoul", bracket: 1 },
      { id: "golden_ghoul", name: "Golden Ghoul", bracket: 2 },
    ],
  },
  {
    id: "farming",
    name: "The Farming Islands",
    mobs: [
      { id: "cow", name: "Cow", bracket: 1 },
      { id: "pig", name: "Pig", bracket: 1 },
      { id: "sheep", name: "Sheep", bracket: 1 },
      { id: "chicken", name: "Chicken", bracket: 1 },
      { id: "mushroom_cow", name: "Mooshroom", bracket: 1 },
      { id: "rabbit", name: "Rabbit", bracket: 1 },
    ],
  },
  {
    id: "park",
    name: "The Park",
    mobs: [
      { id: "howling_spirit", name: "Howling Spirit", bracket: 1 },
      { id: "soul_of_the_alpha", name: "Soul of the Alpha", bracket: 2 },
    ],
  },
  {
    id: "spiders_den",
    name: "Spider's Den",
    mobs: [
      { id: "dasher_spider", name: "Dasher Spider", bracket: 1 },
      { id: "weaver_spider", name: "Weaver Spider", bracket: 1 },
      { id: "voracious_spider", name: "Voracious Spider", bracket: 1 },
      { id: "brood_mother", name: "Brood Mother", bracket: 3 },
      { id: "arachne", name: "Arachne", bracket: 3 },
      { id: "arachne_keeper", name: "Arachne's Keeper", bracket: 2 },
    ],
  },
  {
    id: "deep_caverns",
    name: "Deep Caverns",
    mobs: [
      { id: "sneaky_creeper", name: "Sneaky Creeper", bracket: 1 },
      { id: "lapis_zombie", name: "Lapis Zombie", bracket: 1 },
      { id: "redstone_pigman", name: "Redstone Pigman", bracket: 1 },
      { id: "emerald_slime", name: "Emerald Slime", bracket: 1 },
      { id: "miner_zombie", name: "Miner Zombie", bracket: 1 },
      { id: "miner_skeleton", name: "Miner Skeleton", bracket: 1 },
    ],
  },
  {
    id: "dwarven_mines",
    name: "Dwarven Mines",
    mobs: [
      { id: "goblin", name: "Goblin", bracket: 1 },
      { id: "ice_walker", name: "Ice Walker", bracket: 1 },
      { id: "ghost", name: "Ghost", bracket: 1 },
      { id: "treasure_hoarder", name: "Treasure Hoarder", bracket: 1 },
      { id: "star_sentry", name: "Star Sentry", bracket: 2 },
    ],
  },
  {
    id: "crystal_hollows",
    name: "Crystal Hollows",
    mobs: [
      { id: "automaton", name: "Automaton", bracket: 1 },
      { id: "sludge", name: "Sludge", bracket: 1 },
      { id: "thyst", name: "Thyst", bracket: 1 },
      { id: "worm", name: "Worm", bracket: 2 },
      { id: "scatha", name: "Scatha", bracket: 2 },
      { id: "corleone", name: "Boss Corleone", bracket: 3 },
      { id: "team_treasurite", name: "Team Treasurite", bracket: 1 },
    ],
  },
  {
    id: "the_end",
    name: "The End",
    mobs: [
      { id: "enderman", name: "Enderman", bracket: 1 },
      { id: "zealot", name: "Zealot", bracket: 1 },
      { id: "voidling_fanatic", name: "Voidling Fanatic", bracket: 1 },
      { id: "voidling_extremist", name: "Voidling Extremist", bracket: 1 },
      { id: "watcher", name: "The Watcher", bracket: 2 },
      { id: "obsidian_defender", name: "Obsidian Defender", bracket: 1 },
      { id: "ender_dragon", name: "Ender Dragon", bracket: 3 },
    ],
  },
  {
    id: "crimson_isle",
    name: "Crimson Isle",
    mobs: [
      { id: "magma_cube", name: "Magma Cube", bracket: 1 },
      { id: "blaze", name: "Blaze", bracket: 1 },
      { id: "flaming_spider", name: "Flaming Spider", bracket: 1 },
      { id: "barbarian_guard", name: "Barbarian Guard", bracket: 1 },
      { id: "mage_guard", name: "Mage Guard", bracket: 1 },
      { id: "bladesoul", name: "Bladesoul", bracket: 3 },
      { id: "magma_boss", name: "Magma Boss", bracket: 3 },
      { id: "mage_outlaw", name: "Mage Outlaw", bracket: 3 },
      { id: "ashfang", name: "Ashfang", bracket: 3 },
    ],
  },
  {
    id: "catacombs",
    name: "Catacombs",
    mobs: [
      { id: "dungeon_undead", name: "Crypt Undead", bracket: 1 },
      { id: "skeleton_master", name: "Skeleton Master", bracket: 1 },
      { id: "withermancer", name: "Withermancer", bracket: 1 },
      { id: "lost_adventurer", name: "Lost Adventurer", bracket: 2 },
      { id: "shadow_assassin", name: "Shadow Assassin", bracket: 2 },
      { id: "king_midas", name: "King Midas", bracket: 2 },
      { id: "bonzo", name: "Bonzo", bracket: 3 },
      { id: "scarf", name: "Scarf", bracket: 3 },
      { id: "professor", name: "The Professor", bracket: 3 },
      { id: "thorn", name: "Thorn", bracket: 3 },
      { id: "livid", name: "Livid", bracket: 3 },
      { id: "sadan", name: "Sadan", bracket: 3 },
      { id: "necron", name: "Necron", bracket: 3 },
    ],
  },
  {
    id: "fishing",
    name: "Fishing & Sea Creatures",
    mobs: [
      { id: "sea_walker", name: "Sea Walker", bracket: 1 },
      { id: "sea_guardian", name: "Sea Guardian", bracket: 1 },
      { id: "sea_witch", name: "Sea Witch", bracket: 1 },
      { id: "night_squid", name: "Night Squid", bracket: 1 },
      { id: "sea_emperor", name: "Sea Emperor", bracket: 2 },
      { id: "yeti", name: "Yeti", bracket: 2 },
      { id: "reindrake", name: "Reindrake", bracket: 3 },
      { id: "water_hydra", name: "Water Hydra", bracket: 2 },
      { id: "lord_jawbus", name: "Lord Jawbus", bracket: 3 },
      { id: "thunder", name: "Thunder", bracket: 3 },
      { id: "great_white_shark", name: "Great White Shark", bracket: 2 },
    ],
  },
  {
    id: "mythological",
    name: "Mythological Ritual",
    mobs: [
      { id: "minos_hunter", name: "Minos Hunter", bracket: 5 },
      { id: "siamese_lynx", name: "Siamese Lynx", bracket: 5 },
      { id: "minotaur", name: "Minotaur", bracket: 5 },
      { id: "gaia_construct", name: "Gaia Construct", bracket: 5 },
      { id: "minos_champion", name: "Minos Champion", bracket: 5 },
      { id: "minos_inquisitor", name: "Minos Inquisitor", bracket: 5 },
    ],
  },
  {
    id: "garden_pests",
    name: "Garden Pests",
    mobs: [
      { id: "fly", name: "Fly", bracket: 6 },
      { id: "cricket", name: "Cricket", bracket: 6 },
      { id: "locust", name: "Locust", bracket: 6 },
      { id: "rat", name: "Rat", bracket: 6 },
      { id: "mosquito", name: "Mosquito", bracket: 6 },
      { id: "beetle", name: "Beetle", bracket: 6 },
      { id: "mite", name: "Mite", bracket: 6 },
      { id: "moth", name: "Moth", bracket: 6 },
      { id: "slug", name: "Slug", bracket: 6 },
      { id: "earthworm", name: "Earthworm", bracket: 6 },
    ],
  },
];

export function calculateMobTier(kills: number, bracket: number): {
  tier: number;
  maxTier: number;
  nextTierKills: number | null;
} {
  const reqs = BESTIARY_BRACKETS[bracket] ?? BESTIARY_BRACKETS[1]!;
  const maxTier = reqs.length;
  let tier = 0;

  for (let i = 0; i < reqs.length; i++) {
    if (kills >= reqs[i]!) {
      tier = i + 1;
    } else {
      break;
    }
  }

  const nextTierKills = tier < maxTier ? reqs[tier]! : null;
  return { tier, maxTier, nextTierKills };
}

export function calculateBestiary(
  rawKills: Record<string, number> | undefined,
  rawDeaths?: Record<string, number> | undefined,
): BestiaryData {
  const killsMap = rawKills ?? {};
  const deathsMap = rawDeaths ?? {};

  let totalKills = 0;
  let totalDeaths = 0;
  let totalTiersUnlocked = 0;
  let maxPossibleTiers = 0;

  const families: BestiaryFamily[] = BESTIARY_FAMILIES.map((familyDef) => {
    let familyKills = 0;
    let familyDeaths = 0;
    let familyTiers = 0;
    let familyMaxTiers = 0;

    const mobs: BestiaryMob[] = familyDef.mobs.map((mobDef) => {
      // Lookup by exact id or variations (e.g. "zombie", "zombie_villager")
      const kills =
        killsMap[mobDef.id] ??
        killsMap[`kills_${mobDef.id}`] ??
        killsMap[mobDef.id.replace(/_/g, "")] ??
        0;
      const deaths = deathsMap[mobDef.id] ?? 0;

      const { tier, maxTier, nextTierKills } = calculateMobTier(kills, mobDef.bracket);

      familyKills += kills;
      familyDeaths += deaths;
      familyTiers += tier;
      familyMaxTiers += maxTier;

      return {
        id: mobDef.id,
        name: mobDef.name,
        kills,
        deaths,
        tier,
        maxTier,
        nextTierKills,
        bracket: mobDef.bracket,
      };
    });

    totalKills += familyKills;
    totalDeaths += familyDeaths;
    totalTiersUnlocked += familyTiers;
    maxPossibleTiers += familyMaxTiers;

    return {
      id: familyDef.id,
      name: familyDef.name,
      totalKills: familyKills,
      totalDeaths: familyDeaths,
      tiersUnlocked: familyTiers,
      maxTiers: familyMaxTiers,
      mobs: mobs.sort((a, b) => b.kills - a.kills || b.tier - a.tier),
    };
  });

  const milestone = Math.floor(totalTiersUnlocked / 10);
  const milestoneProgressPct = ((totalTiersUnlocked % 10) / 10) * 100;

  return {
    totalKills,
    totalDeaths,
    totalTiersUnlocked,
    maxTiers: maxPossibleTiers,
    milestone,
    milestoneProgressPct,
    families,
  };
}
