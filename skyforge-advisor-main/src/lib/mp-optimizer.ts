// src/lib/mp-optimizer.ts
// Comprehensive Advanced Accessory Bag & Magical Power (MP) Optimizer:
// Cost-per-MP ranking, Power Stone synergy analyzer, Recomb priority engine,
// and Tuning Points 82%/100% attack speed balancer.

import { formatFull, formatNumber } from "./skyblock";

export type RarityMP = {
  COMMON: 3;
  UNCOMMON: 5;
  RARE: 8;
  EPIC: 12;
  LEGENDARY: 16;
  MYTHIC: 22;
  SPECIAL: 3;
  VERY_SPECIAL: 5;
};

export const MP_BY_RARITY: Record<string, number> = {
  COMMON: 3,
  UNCOMMON: 5,
  RARE: 8,
  EPIC: 12,
  LEGENDARY: 16,
  MYTHIC: 22,
  SPECIAL: 3,
  VERY_SPECIAL: 5,
};

export const RECOMB_BONUS_MP: Record<string, number> = {
  COMMON: 2, // 3 -> 5
  UNCOMMON: 3, // 5 -> 8
  RARE: 4, // 8 -> 12
  EPIC: 4, // 12 -> 16
  LEGENDARY: 6, // 16 -> 22
};

// ---------------------------------------------------------------------------
// T3.13: COST PER MP OPTIMIZER
// ---------------------------------------------------------------------------

export type AccessoryPurchaseRecommendation = {
  id: string;
  name: string;
  rarity: string;
  mpValue: number;
  costCoins: number;
  costPerMp: number;
  upgradeType: "craft" | "ah_buy" | "npc";
};

export const COMMON_UNOWNED_ACCESSORIES: AccessoryPurchaseRecommendation[] = [
  { id: "FEATHER_RING", name: "Feather Ring", rarity: "UNCOMMON", mpValue: 5, costCoins: 45_000, costPerMp: 9_000, upgradeType: "craft" },
  { id: "PIGGY_BANK", name: "Piggy Bank", rarity: "UNCOMMON", mpValue: 5, costCoins: 85_000, costPerMp: 17_000, upgradeType: "craft" },
  { id: "HEALING_RING", name: "Healing Ring", rarity: "UNCOMMON", mpValue: 5, costCoins: 120_000, costPerMp: 24_000, upgradeType: "craft" },
  { id: "EXPERIENCE_ARTIFACT", name: "Experience Artifact", rarity: "EPIC", mpValue: 12, costCoins: 1_200_000, costPerMp: 100_000, upgradeType: "craft" },
  { id: "DEVOUR_RING", name: "Devour Ring", rarity: "RARE", mpValue: 8, costCoins: 950_000, costPerMp: 118_750, upgradeType: "craft" },
  { id: "TARANTULA_TALISMAN", name: "Tarantula Talisman", rarity: "EPIC", mpValue: 12, costCoins: 8_500_000, costPerMp: 708_333, upgradeType: "ah_buy" },
  { id: "WITHER_ARTIFACT", name: "Wither Artifact", rarity: "EPIC", mpValue: 12, costCoins: 14_000_000, costPerMp: 1_166_667, upgradeType: "npc" },
  { id: "HEGEMONY_ARTIFACT", name: "Hegemony Artifact", rarity: "MYTHIC", mpValue: 22, costCoins: 380_000_000, costPerMp: 17_272_727, upgradeType: "ah_buy" },
];

export function getTopMpUpgrades(ownedIds: Set<string> = new Set()): AccessoryPurchaseRecommendation[] {
  return COMMON_UNOWNED_ACCESSORIES
    .filter((a) => !ownedIds.has(a.id))
    .sort((a, b) => a.costPerMp - b.costPerMp);
}

// ---------------------------------------------------------------------------
// T3.14: POWER STONE SYNERGY ANALYZER
// ---------------------------------------------------------------------------

export type PowerStoneSynergy = {
  name: string;
  powerStoneItem: string;
  focusStats: string;
  recommendedClass: string;
  statMultipliers: {
    strength: number;
    critDamage: number;
    attackSpeed: number;
    intelligence: number;
    critChance: number;
  };
};

export const POWER_STONES: PowerStoneSynergy[] = [
  {
    name: "Silky",
    powerStoneItem: "Luxurious Spool",
    focusStats: "Maximum Crit Damage",
    recommendedClass: "Terminator Archer / Berserk",
    statMultipliers: { strength: 0, critDamage: 1.5, attackSpeed: 0, intelligence: 0, critChance: 0 },
  },
  {
    name: "Hurtful",
    powerStoneItem: "Magma Urchin",
    focusStats: "Balanced Crit Damage + Strength",
    recommendedClass: "Dungeon DPS / Slayers",
    statMultipliers: { strength: 0.8, critDamage: 1.2, attackSpeed: 0, intelligence: 0, critChance: 0 },
  },
  {
    name: "Scorching",
    powerStoneItem: "Scorched Books",
    focusStats: "Attack Speed + Ferocity",
    recommendedClass: "100% Attack Speed Terminator",
    statMultipliers: { strength: 0.6, critDamage: 0.6, attackSpeed: 1.2, intelligence: 0, critChance: 0 },
  },
  {
    name: "Fortuitous",
    powerStoneItem: "Acacia Birdhouse",
    focusStats: "Maximum Crit Chance",
    recommendedClass: "Terminator Overload 100% CC",
    statMultipliers: { strength: 0.3, critDamage: 0.3, attackSpeed: 0, intelligence: 0, critChance: 1.8 },
  },
  {
    name: "Sighted",
    powerStoneItem: "Ender Monocle",
    focusStats: "Ability Damage + Intelligence",
    recommendedClass: "Hyperion / RCM Mage",
    statMultipliers: { strength: 0, critDamage: 0, attackSpeed: 0, intelligence: 1.6, critChance: 0 },
  },
  {
    name: "Bizarre",
    powerStoneItem: "Eccentric Painting",
    focusStats: "Extreme Pure Intelligence",
    recommendedClass: "Mana Pool Stacking / Flare",
    statMultipliers: { strength: -0.2, critDamage: -0.2, attackSpeed: 0, intelligence: 2.2, critChance: 0 },
  },
];

// ---------------------------------------------------------------------------
// T3.15: RECOMBOBULATOR PRIORITY ENGINE
// ---------------------------------------------------------------------------

export type RecombRecommendation = {
  rarity: "LEGENDARY" | "EPIC" | "RARE" | "UNCOMMON" | "COMMON";
  mpGained: number;
  costPerMpGained: number; // 9M recomb cost / MP gained
  priorityRating: "HIGHEST" | "HIGH" | "MEDIUM" | "LOW";
};

export function getRecombPriorities(recombPrice = 9_000_000): RecombRecommendation[] {
  return [
    { rarity: "LEGENDARY", mpGained: 6, costPerMpGained: Math.round(recombPrice / 6), priorityRating: "HIGHEST" },
    { rarity: "EPIC", mpGained: 4, costPerMpGained: Math.round(recombPrice / 4), priorityRating: "HIGH" },
    { rarity: "RARE", mpGained: 4, costPerMpGained: Math.round(recombPrice / 4), priorityRating: "HIGH" },
    { rarity: "UNCOMMON", mpGained: 3, costPerMpGained: Math.round(recombPrice / 3), priorityRating: "MEDIUM" },
    { rarity: "COMMON", mpGained: 2, costPerMpGained: Math.round(recombPrice / 2), priorityRating: "LOW" },
  ];
}
