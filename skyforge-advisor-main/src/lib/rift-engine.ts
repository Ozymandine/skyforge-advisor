// src/lib/rift-engine.ts
// Comprehensive The Rift Dimension & Enigma Hub Engine:
// Rift time & dimensional infusion, 8 Timecharms, 42 Enigma Souls,
// Vampire Slayer (Bloodfiend T1-T5) mechanics, and Rift Mote export economy.

import { formatFull, formatNumber } from "./skyblock";

// ---------------------------------------------------------------------------
// T3.07: RIFT TIME & 8 TIMECHARMS
// ---------------------------------------------------------------------------

export type TimecharmDefinition = {
  id: string;
  name: string;
  location: string;
  bonusTimeSeconds: number;
  obtainedFrom: string;
};

export const RIFT_TIMECHARMS: TimecharmDefinition[] = [
  { id: "wyld", name: "Wyld Timecharm", location: "Wyld Woods", bonusTimeSeconds: 60, obtainedFrom: "Kat Questline" },
  { id: "enigma", name: "Enigma Timecharm", location: "Enigma's Crib", bonusTimeSeconds: 60, obtainedFrom: "20 Enigma Souls" },
  { id: "dreadfarm", name: "Dreadfarm Timecharm", location: "Dreadfarm", bonusTimeSeconds: 60, obtainedFrom: "Farmhand Quests" },
  { id: "mountain", name: "Mountain Timecharm", location: "Colosseum Mountain", bonusTimeSeconds: 60, obtainedFrom: "Mountain Top" },
  { id: "west_village", name: "West Village Timecharm", location: "West Village", bonusTimeSeconds: 60, obtainedFrom: "Mayor Election" },
  { id: "mirrorverse", name: "Mirrorverse Timecharm", location: "Mirrorverse", bonusTimeSeconds: 90, obtainedFrom: "Mirrorverse Puzzles" },
  { id: "blood", name: "Blood Timecharm", location: "Stillgore Chateau", bonusTimeSeconds: 90, obtainedFrom: "Vampire Slayer T4" },
  { id: "barrier", name: "Barrier Timecharm", location: "Dreadfarm Edge", bonusTimeSeconds: 90, obtainedFrom: "Rift Barrier Unlock" },
];

export function calculateRiftTime(
  infusedArmorCount = 4,
  timecharmsUnlocked = 6,
  bottledOozeCount = 5,
) {
  const baseSeconds = 480; // 8 minutes base
  const armorBonusSeconds = infusedArmorCount * 45;
  const timecharmsBonus = Math.min(8, timecharmsUnlocked) * 60;
  const oozeBonus = Math.min(10, bottledOozeCount) * 15;

  const totalSeconds = baseSeconds + armorBonusSeconds + timecharmsBonus + oozeBonus;
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSecs = totalSeconds % 60;

  return {
    totalSeconds,
    formatted: `${minutes}m ${remainingSecs}s`,
    breakdown: {
      base: baseSeconds,
      armor: armorBonusSeconds,
      timecharms: timecharmsBonus,
      ooze: oozeBonus,
    },
  };
}

// ---------------------------------------------------------------------------
// T3.09: VAMPIRE SLAYER (RIFTSTALKER BLOODFIEND T1 - T5)
// ---------------------------------------------------------------------------

export type VampireBossTier = {
  tier: number;
  name: string;
  hp: string;
  requiredWeapon: string;
  mechanics: string[];
  moteCost: number;
  slayerXp: number;
};

export const VAMPIRE_SLAYER_TIERS: VampireBossTier[] = [
  { tier: 1, name: "Bloodfiend I", hp: "1,000", requiredWeapon: "Silver Stake", mechanics: ["Basic attacks", "Stake finisher"], moteCost: 500, slayerXp: 5 },
  { tier: 2, name: "Bloodfiend II", hp: "5,000", requiredWeapon: "Silver Stake", mechanics: ["Healing circles", "Stake finisher"], moteCost: 1500, slayerXp: 25 },
  { tier: 3, name: "Bloodfiend III", hp: "25,000", requiredWeapon: "Silver Stake", mechanics: ["Mania phase", "Blood beams", "Holy Ice"], moteCost: 5000, slayerXp: 100 },
  { tier: 4, name: "Bloodfiend IV", hp: "150,000", requiredWeapon: "Steak Stake", mechanics: ["Twinclaws", "Mania blood jump", "Impel aura", "Holy Ice timing"], moteCost: 15000, slayerXp: 500 },
  { tier: 5, name: "Bloodfiend V", hp: "750,000", requiredWeapon: "Steak Stake (Reforged)", mechanics: ["Quad Mania", "Hyper-speed Twinclaws", "Death pulse", "Sub-second Holy Ice"], moteCost: 50000, slayerXp: 1500 },
];

// ---------------------------------------------------------------------------
// T3.10: RIFT MOTES EXPORT ECONOMY
// ---------------------------------------------------------------------------

export type RiftExportItem = {
  name: string;
  motesCost: number;
  realSkyBlockValueCoins: number;
  coinsPerMote: number;
};

export const RIFT_EXPORT_ITEMS: RiftExportItem[] = [
  { name: "Rift Prism", motesCost: 500_000, realSkyBlockValueCoins: 350_000_000, coinsPerMote: 700 },
  { name: "Shen's Auction Relics", motesCost: 250_000, realSkyBlockValueCoins: 120_000_000, coinsPerMote: 480 },
  { name: "MC0-1 Microcontroller", motesCost: 100_000, realSkyBlockValueCoins: 42_000_000, coinsPerMote: 420 },
  { name: "Half-Eaten Carrot", motesCost: 15_000, realSkyBlockValueCoins: 4_500_000, coinsPerMote: 300 },
];
