// src/lib/experimentation-calculator.ts
// Comprehensive Experimentation Table & Superpairs Helper:
// Calculates Superpairs click rewards, Tier 7 enchantment odds, and Titanic bottle costs.

export type SuperpairsEnchantOdds = {
  name: string;
  tier: number;
  marketValue: number;
  oddsPerGame: number;
  expectedGamesToHit: number;
};

export const SUPERPAIRS_T7_ENCHANTS: SuperpairsEnchantOdds[] = [
  { name: "Growth VII", tier: 7, marketValue: 500_000_000, oddsPerGame: 1 / 450, expectedGamesToHit: 450 },
  { name: "Protection VII", tier: 7, marketValue: 450_000_000, oddsPerGame: 1 / 450, expectedGamesToHit: 450 },
  { name: "Sharpness VII", tier: 7, marketValue: 250_000_000, oddsPerGame: 1 / 300, expectedGamesToHit: 300 },
  { name: "Giant Killer VII", tier: 7, marketValue: 220_000_000, oddsPerGame: 1 / 350, expectedGamesToHit: 350 },
  { name: "Power VII", tier: 7, marketValue: 400_000_000, oddsPerGame: 1 / 400, expectedGamesToHit: 400 },
  { name: "Looting V", tier: 5, marketValue: 120_000_000, oddsPerGame: 1 / 200, expectedGamesToHit: 200 },
  { name: "Critical VII", tier: 7, marketValue: 180_000_000, oddsPerGame: 1 / 300, expectedGamesToHit: 300 },
];

export type ExperimentationOverview = {
  dailyCostCoins: number;
  expectedDailyEnchantXp: number;
  t7Enchants: SuperpairsEnchantOdds[];
};

export function getExperimentationOverview(enchantingLevel = 60): ExperimentationOverview {
  // Metaphysical Experiments cost 1 Titanic Bottle (approx 350k coins) + Grand Bottles
  const dailyCostCoins = 450_000;
  const baseEnchantXp = 1_200_000;
  const levelBonus = 1 + (enchantingLevel * 0.04); // +4% XP per level
  const expectedDailyEnchantXp = Math.round(baseEnchantXp * levelBonus);

  return {
    dailyCostCoins,
    expectedDailyEnchantXp,
    t7Enchants: SUPERPAIRS_T7_ENCHANTS,
  };
}

