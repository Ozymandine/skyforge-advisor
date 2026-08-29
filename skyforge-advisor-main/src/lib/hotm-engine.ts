// src/lib/hotm-engine.ts
// Comprehensive Heart of the Mountain (HotM 1–10) Engine:
// Nodes catalog, abilities, powder cost formulas, perk allocations, and optimal mining setups.

export type PowderType = "mithril" | "gemstone" | "glacite";

export type HotmNodeType = "perk" | "ability" | "peak";

export type HotmNode = {
  id: string;
  name: string;
  tier: number; // 1 to 10
  column: number; // 1 to 7 (for visual grid alignment)
  type: HotmNodeType;
  powderType: PowderType;
  maxLevel: number;
  description: string;
  perkFormula: (level: number) => { speed?: number; fortune?: number; text: string };
  costFormula: (level: number) => number; // Cost to upgrade from level to level + 1
};

export const HOTM_TIER_XP_REQUIREMENTS: Record<number, number> = {
  1: 0,
  2: 3_000,
  3: 9_000,
  4: 25_000,
  5: 60_000,
  6: 100_000,
  7: 150_000,
  8: 210_000,
  9: 290_000,
  10: 400_000,
};

export const HOTM_NODES: HotmNode[] = [
  // TIER 1
  {
    id: "mining_speed",
    name: "Mining Speed",
    tier: 1,
    column: 4,
    type: "perk",
    powderType: "mithril",
    maxLevel: 50,
    description: "Grants +20 Mining Speed per level.",
    perkFormula: (lvl) => ({ speed: lvl * 20, text: `+${lvl * 20} ⸕ Mining Speed` }),
    costFormula: (lvl) => Math.floor(Math.pow(lvl + 1, 3.05) + 10),
  },

  // TIER 2
  {
    id: "mining_fortune",
    name: "Mining Fortune",
    tier: 2,
    column: 3,
    type: "perk",
    powderType: "mithril",
    maxLevel: 50,
    description: "Grants +5 Mining Fortune per level.",
    perkFormula: (lvl) => ({ fortune: lvl * 5, text: `+${lvl * 5} ☘ Mining Fortune` }),
    costFormula: (lvl) => Math.floor(Math.pow(lvl + 1, 3.05) + 10),
  },
  {
    id: "mining_speed_boost",
    name: "Mining Speed Boost",
    tier: 2,
    column: 4,
    type: "ability",
    powderType: "mithril",
    maxLevel: 1,
    description: "Pickaxe Ability: Grants +200% Mining Speed for 15s. (120s Cooldown)",
    perkFormula: () => ({ text: "+200% Mining Speed for 15s" }),
    costFormula: () => 0,
  },
  {
    id: "titanium_insanium",
    name: "Titanium Insanium",
    tier: 2,
    column: 5,
    type: "perk",
    powderType: "mithril",
    maxLevel: 50,
    description: "Grants +0.1% chance per level to find Titanium instead of Gray Mithril.",
    perkFormula: (lvl) => ({ text: `+${(lvl * 0.1).toFixed(1)}% Titanium Chance` }),
    costFormula: (lvl) => Math.floor(Math.pow(lvl + 1, 3.1) + 20),
  },

  // TIER 3
  {
    id: "luck_of_the_cave",
    name: "Luck of the Cave",
    tier: 3,
    column: 2,
    type: "perk",
    powderType: "mithril",
    maxLevel: 45,
    description: "Increases the chance of triggering Rare Powder & Gemstone procs.",
    perkFormula: (lvl) => ({ text: `+${(lvl * 1).toFixed(0)}% Trigger Chance` }),
    costFormula: (lvl) => Math.floor(Math.pow(lvl + 1, 3.0) + 15),
  },
  {
    id: "efficient_miner",
    name: "Efficient Miner",
    tier: 3,
    column: 4,
    type: "perk",
    powderType: "mithril",
    maxLevel: 100,
    description: "Grants a chance to instantly break adjacent blocks in a radius.",
    perkFormula: (lvl) => ({
      text: `Up to ${Math.min(5, 1 + Math.floor(lvl / 20))} adjacent blocks (${(lvl * 0.4).toFixed(1)}% chance)`,
    }),
    costFormula: (lvl) => Math.floor(Math.pow(lvl + 1, 2.6) + 10),
  },
  {
    id: "quick_forge",
    name: "Quick Forge",
    tier: 3,
    column: 6,
    type: "perk",
    powderType: "mithril",
    maxLevel: 20,
    description: "Decreases the time required to forge items in The Forge.",
    perkFormula: (lvl) => ({ text: `-${(lvl * 1.5).toFixed(1)}% Forge Time` }),
    costFormula: (lvl) => Math.floor(Math.pow(lvl + 1, 3.2) + 25),
  },

  // TIER 4
  {
    id: "mining_madness",
    name: "Mining Madness",
    tier: 4,
    column: 2,
    type: "perk",
    powderType: "mithril",
    maxLevel: 1,
    description: "Grants +50 Mining Speed and +12.5 Mining Fortune.",
    perkFormula: () => ({ speed: 50, fortune: 12.5, text: "+50 ⸕ Speed, +12.5 ☘ Fortune" }),
    costFormula: () => 0,
  },
  {
    id: "pickaxe_toss",
    name: "Pickobulus",
    tier: 4,
    column: 4,
    type: "ability",
    powderType: "mithril",
    maxLevel: 1,
    description:
      "Pickaxe Ability: Throws your pickaxe, destroying all blocks in a 3-block radius. (110s Cooldown)",
    perkFormula: () => ({ text: "Destroys 3-block sphere" }),
    costFormula: () => 0,
  },
  {
    id: "sky_mall",
    name: "Sky Mall",
    tier: 4,
    column: 6,
    type: "perk",
    powderType: "mithril",
    maxLevel: 1,
    description: "Every 20 minutes, gain a random powerful mining buff.",
    perkFormula: () => ({ text: "Rotating 20m passive mining buff" }),
    costFormula: () => 0,
  },

  // TIER 5
  {
    id: "daily_powder",
    name: "Daily Powder",
    tier: 5,
    column: 3,
    type: "perk",
    powderType: "mithril",
    maxLevel: 1,
    description: "Grants +400 bonus Powder on your first commission completed each day.",
    perkFormula: () => ({ text: "+400 Daily Commission Powder" }),
    costFormula: () => 0,
  },
  {
    id: "peak_of_the_mountain",
    name: "Peak of the Mountain",
    tier: 5,
    column: 4,
    type: "peak",
    powderType: "mithril",
    maxLevel: 10,
    description: "Unlocks extra HotM perk slots, tokens, and commission slots.",
    perkFormula: (lvl) => ({
      text: `Tier ${lvl}: +${lvl} Token, +${Math.min(2, Math.floor(lvl / 2))} Comm Slot`,
    }),
    costFormula: (lvl) =>
      [
        50_000, 100_000, 250_000, 500_000, 1_000_000, 2_000_000, 4_000_000, 7_000_000, 10_000_000,
        15_000_000,
      ][lvl] ?? 1_000_000,
  },
  {
    id: "goblin_killer",
    name: "Goblin Killer",
    tier: 5,
    column: 5,
    type: "perk",
    powderType: "mithril",
    maxLevel: 1,
    description: "Killing Goblins awards extra Mithril Powder.",
    perkFormula: () => ({ text: "+50% Powder from Goblin Raids" }),
    costFormula: () => 0,
  },

  // TIER 6
  {
    id: "mole",
    name: "Mole",
    tier: 6,
    column: 2,
    type: "perk",
    powderType: "gemstone",
    maxLevel: 190,
    description: "Grants a high chance to dig through large veins of Hard Stone and Gemstones.",
    perkFormula: (lvl) => ({
      text: `Dig up to ${Math.min(7, 1 + Math.floor(lvl / 30))} extra blocks (${(lvl * 0.5).toFixed(1)}% chance)`,
    }),
    costFormula: (lvl) => Math.floor(Math.pow(lvl + 1, 2.2) + 20),
  },
  {
    id: "mining_speed_2",
    name: "Mining Speed II",
    tier: 6,
    column: 4,
    type: "perk",
    powderType: "gemstone",
    maxLevel: 50,
    description: "Grants +40 Mining Speed per level.",
    perkFormula: (lvl) => ({ speed: lvl * 40, text: `+${lvl * 40} ⸕ Mining Speed` }),
    costFormula: (lvl) => Math.floor(Math.pow(lvl + 1, 3.2) + 50),
  },
  {
    id: "maniac_miner",
    name: "Maniac Miner",
    tier: 6,
    column: 6,
    type: "ability",
    powderType: "gemstone",
    maxLevel: 1,
    description: "Pickaxe Ability: Consumes all Mana to gain massive Mining Speed for 15s.",
    perkFormula: () => ({ text: "Mana-to-Speed conversion for 15s" }),
    costFormula: () => 0,
  },

  // TIER 7
  {
    id: "powder_buff",
    name: "Powder Buff",
    tier: 7,
    column: 2,
    type: "perk",
    powderType: "gemstone",
    maxLevel: 50,
    description: "Increases all Powder gained from all sources by +1% per level.",
    perkFormula: (lvl) => ({ text: `+${lvl}% All Powder Gained` }),
    costFormula: (lvl) => Math.floor(Math.pow(lvl + 1, 3.1) + 40),
  },
  {
    id: "mining_fortune_2",
    name: "Mining Fortune II",
    tier: 7,
    column: 4,
    type: "perk",
    powderType: "gemstone",
    maxLevel: 50,
    description: "Grants +5.5 Mining Fortune per level.",
    perkFormula: (lvl) => ({
      fortune: Math.round(lvl * 5.5),
      text: `+${(lvl * 5.5).toFixed(1)} ☘ Mining Fortune`,
    }),
    costFormula: (lvl) => Math.floor(Math.pow(lvl + 1, 3.2) + 50),
  },
  {
    id: "great_explorer",
    name: "Great Explorer",
    tier: 7,
    column: 6,
    type: "perk",
    powderType: "gemstone",
    maxLevel: 20,
    description:
      "Increases the chance to find Treasure Chests while mining in the Crystal Hollows.",
    perkFormula: (lvl) => ({ text: `+${(lvl * 4).toFixed(0)}% Treasure Chest Find Chance` }),
    costFormula: (lvl) => Math.floor(Math.pow(lvl + 1, 3.4) + 60),
  },

  // TIER 8 (GLACITE MINES)
  {
    id: "sub_zero_mining",
    name: "Sub-Zero Mining",
    tier: 8,
    column: 2,
    type: "perk",
    powderType: "glacite",
    maxLevel: 50,
    description: "Grants +1 Cold Resistance and +10 Mining Speed in the Glacite Mines per level.",
    perkFormula: (lvl) => ({
      speed: lvl * 10,
      text: `+${lvl} Cold Resist, +${lvl * 10} ⸕ Glacite Speed`,
    }),
    costFormula: (lvl) => Math.floor(Math.pow(lvl + 1, 3.1) + 40),
  },
  {
    id: "gemstone_infusion",
    name: "Gemstone Infusion",
    tier: 8,
    column: 4,
    type: "ability",
    powderType: "glacite",
    maxLevel: 1,
    description: "Pickaxe Ability: Boosts all gemstone stats and stats on armor by +50% for 16s.",
    perkFormula: () => ({ text: "+50% Gemstone & Armor stats for 16s" }),
    costFormula: () => 0,
  },
  {
    id: "surveyor",
    name: "Surveying",
    tier: 8,
    column: 6,
    type: "perk",
    powderType: "glacite",
    maxLevel: 20,
    description: "Increases chance of discovering hidden Glacite Mineshafts by +5% per level.",
    perkFormula: (lvl) => ({ text: `+${lvl * 5}% Mineshaft Discovery Rate` }),
    costFormula: (lvl) => Math.floor(Math.pow(lvl + 1, 3.3) + 50),
  },

  // TIER 9
  {
    id: "keen_eye",
    name: "Keen Eye",
    tier: 9,
    column: 2,
    type: "perk",
    powderType: "glacite",
    maxLevel: 20,
    description: "Highlights valuable gemstones and corpses through walls in Mineshafts.",
    perkFormula: (lvl) => ({ text: `Highlight radius ${lvl * 2}m` }),
    costFormula: (lvl) => Math.floor(Math.pow(lvl + 1, 3.2) + 40),
  },
  {
    id: "mineshaft_mayhem",
    name: "Mineshaft Mayhem",
    tier: 9,
    column: 4,
    type: "ability",
    powderType: "glacite",
    maxLevel: 1,
    description:
      "Pickaxe Ability: Triggers a frenzy in Glacite Mineshafts, doubling drop rates for 20s.",
    perkFormula: () => ({ text: "2× Mineshaft drops for 20s" }),
    costFormula: () => 0,
  },
  {
    id: "warm_heart",
    name: "Warm Heart",
    tier: 9,
    column: 6,
    type: "perk",
    powderType: "glacite",
    maxLevel: 50,
    description: "Slows down the rate at which you freeze in the Glacite Mines.",
    perkFormula: (lvl) => ({ text: `-${(lvl * 1.5).toFixed(1)}% Freezing Pace` }),
    costFormula: (lvl) => Math.floor(Math.pow(lvl + 1, 3.0) + 30),
  },

  // TIER 10
  {
    id: "dead_mans_chest",
    name: "Dead Man's Chest",
    tier: 10,
    column: 2,
    type: "perk",
    powderType: "glacite",
    maxLevel: 50,
    description: "Increases the quality and quantity of loot found inside Frozen Corpses.",
    perkFormula: (lvl) => ({ text: `+${(lvl * 2).toFixed(0)}% Corpse Loot Quality` }),
    costFormula: (lvl) => Math.floor(Math.pow(lvl + 1, 3.2) + 50),
  },
  {
    id: "eager_adventurer",
    name: "Eager Adventurer",
    tier: 10,
    column: 4,
    type: "perk",
    powderType: "glacite",
    maxLevel: 50,
    description: "Grants bonus Mining Speed and Fortune for every completed Glacite Commission.",
    perkFormula: (lvl) => ({
      speed: lvl * 8,
      fortune: Math.round(lvl * 2),
      text: `+${lvl * 8} ⸕ Speed, +${lvl * 2} ☘ Fortune`,
    }),
    costFormula: (lvl) => Math.floor(Math.pow(lvl + 1, 3.1) + 40),
  },
  {
    id: "gifts_from_the_departed",
    name: "Gifts of the Departed",
    tier: 10,
    column: 6,
    type: "perk",
    powderType: "glacite",
    maxLevel: 20,
    description: "Grants a chance to receive rare Ice & Glacite Artifacts when unfreezing corpses.",
    perkFormula: (lvl) => ({ text: `+${(lvl * 1.5).toFixed(1)}% Rare Corpse Drop Chance` }),
    costFormula: (lvl) => Math.floor(Math.pow(lvl + 1, 3.4) + 60),
  },
];

export type HotmPreset = {
  id: string;
  name: string;
  description: string;
  allocations: Record<string, number>;
};

export const HOTM_PRESETS: HotmPreset[] = [
  {
    id: "gemstone_meta",
    name: "💎 Gemstone Mining Meta",
    description:
      "Maximizes Mining Speed I/II, Mining Fortune I/II, and Powder Buff for peak Gemstone coin yields.",
    allocations: {
      mining_speed: 50,
      mining_fortune: 50,
      mining_speed_2: 50,
      mining_fortune_2: 50,
      powder_buff: 50,
      mining_speed_boost: 1,
      peak_of_the_mountain: 7,
    },
  },
  {
    id: "powder_grinding",
    name: "📦 Powder Grinding Setup",
    description:
      "Max Great Explorer, Mole, Powder Buff, and Daily Powder for fastest Mithril & Gemstone powder farming in Crystal Hollows.",
    allocations: {
      mole: 120,
      great_explorer: 20,
      powder_buff: 50,
      daily_powder: 1,
      mining_speed: 40,
      mining_speed_2: 30,
      peak_of_the_mountain: 5,
    },
  },
  {
    id: "glacite_mineshafts",
    name: "❄️ Glacite Mineshafts Meta",
    description:
      "Optimized for Glacite Mineshafts, Frozen Corpse loot, Cold Resistance, and Sub-Zero Mining Speed.",
    allocations: {
      sub_zero_mining: 50,
      dead_mans_chest: 50,
      eager_adventurer: 50,
      surveyor: 20,
      keen_eye: 20,
      warm_heart: 30,
      gemstone_infusion: 1,
      peak_of_the_mountain: 10,
    },
  },
];

export function calculateTotalHotmBonus(allocations: Record<string, number>) {
  let totalSpeed = 0;
  let totalFortune = 0;

  for (const node of HOTM_NODES) {
    const lvl = allocations[node.id] ?? 0;
    if (lvl > 0) {
      const effect = node.perkFormula(lvl);
      if (effect.speed) totalSpeed += effect.speed;
      if (effect.fortune) totalFortune += effect.fortune;
    }
  }

  return {
    totalSpeed,
    totalFortune,
  };
}
