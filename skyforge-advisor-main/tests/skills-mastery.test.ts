// tests/skills-mastery.test.ts
// Unit test suite for Block 6: Farming Fortune, Mining Engine, Combat Magic Find,
// Crimson Trophy Fish, and Experimentation Table.

import { describe, expect, it } from "vitest";
import { calculateFarmingFortune } from "../src/lib/farming-calculator";
import { calculateMiningStats } from "../src/lib/mining-calculator";
import { calculateMagicFind } from "../src/lib/combat-calculator";
import { calculateTrophyProgress } from "../src/lib/fishing-calculator";
import { getExperimentationOverview } from "../src/lib/experimentation-calculator";

describe("T2.07: Farming Fortune & Yields Engine", () => {
  it("calculates accurate universal farming fortune across gear and levels", () => {
    const result = calculateFarmingFortune({
      farmingLevel: 60,
      gardenLevel: 15,
      plotsUnlocked: 24,
      anitaBonus: 15,
      armorSet: "fermento",
      toolTier: 3,
      hasDedication4: true,
      hasCultivating10: true,
      pet: "elephant",
      petLevel: 100,
      hasGreenBandana: true,
    });

    expect(result.universalFortune).toBeGreaterThan(800);
    expect(result.breakdown.skill).toBe(240); // 60 * 4
    expect(result.breakdown.garden).toBe(75); // 15 * 5
    expect(result.breakdown.anita).toBe(60); // 15 * 4
    expect(result.cropYields.length).toBe(10);
    expect(result.cropYields[0]?.cropsPerHour).toBeGreaterThan(1_000_000);
  });
});

describe("T2.08: Mining Speed, Fortune & Powder Engine", () => {
  it("calculates drill speed, fortune, and gemstone breaking ticks", () => {
    const stats = calculateMiningStats({
      miningLevel: 60,
      hotmTier: 10,
      drill: "divan",
      hasAmberEngine: true,
      hasBlueCheese: true,
      hasPerfectFuelTank: true,
      mithrilPowder: 4_000_000,
      gemstonePowder: 8_000_000,
    });

    expect(stats.miningSpeed).toBeGreaterThan(8000);
    expect(stats.miningFortune).toBeGreaterThan(1000);
    expect(stats.blockBreakTicks.rubyGemstone).toBeLessThanOrEqual(15);
    expect(stats.blockBreakTicks.jasperGemstone).toBeLessThanOrEqual(25);
    expect(stats.powderAllocation.miningSpeedLevel).toBe(50);
  });
});

describe("T2.09: Combat Mastery & True Magic Find Engine", () => {
  it("rolls up Magic Find and calculates rare drop odds", () => {
    const mf = calculateMagicFind({
      bestiaryMilestones: 20,
      pet: "gdrag",
      petLevel: 200,
      hasLuckyClover: false,
      hasMinosRelic: true,
      hasSorrowArmor: true,
      enrichmentsCount: 30,
      hasBoosterCookie: true,
      hasGodPotion: true,
      hasBeacon5: true,
    });

    expect(mf.totalMagicFind).toBeGreaterThan(200);
    expect(mf.drops.length).toBeGreaterThan(4);

    const judgmentCore = mf.drops.find((d) => d.drop.id === "JUDGMENT_CORE");
    expect(judgmentCore).toBeDefined();
    expect(judgmentCore?.expectedKillsToDrop).toBeLessThan(1000); // 1/2500 base becomes ~1/700 at +250 MF
  });
});

describe("T2.10: Crimson Isle Trophy Fish Suite", () => {
  it("tracks 17 species and computes Odger hunter rank", () => {
    const catches = {
      blobfish_bronze: 10,
      blobfish_diamond: 1,
      golden_fish_gold: 1,
      karate_fish_silver: 2,
    };
    const trophy = calculateTrophyProgress(catches);
    expect(trophy.totalCaught).toBe(14);
    expect(trophy.diamondTierCount).toBe(1);
    expect(trophy.uniqueSpecies).toBe(3);
    expect(trophy.trophyProgress.length).toBe(17);
  });
});

describe("T2.12: Experimentation Table Helper", () => {
  it("computes T7 enchantment odds and daily XP", () => {
    const exp = getExperimentationOverview(60);
    expect(exp.dailyCostCoins).toBeGreaterThan(0);
    expect(exp.expectedDailyEnchantXp).toBeGreaterThan(3_000_000);
    expect(exp.t7Enchants.some((t) => t.name.includes("Growth VII"))).toBe(true);
  });
});
