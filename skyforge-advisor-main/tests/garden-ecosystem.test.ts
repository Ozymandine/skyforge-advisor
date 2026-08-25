// tests/garden-ecosystem.test.ts
// Unit test suite for Block 8: Garden Visitor Queue, Crop Pest Timers,
// Anita ROI Matrix, Composter Economy, and Speed Tuning Guide.

import { describe, expect, it } from "vitest";
import {
  NOTABLE_GARDEN_VISITORS,
  evaluateVisitorOffer,
  PEST_TYPES,
  getPestSchedule,
  calculateAnitaRoi,
  calculateCompostEconomy,
  CROP_TUNING_GUIDES,
} from "../src/lib/garden-ecosystem";

describe("T2.19: Garden Visitor Queue & Profitability", () => {
  it("evaluates high-value visitors like Beth and Spaceman positively", () => {
    const beth = NOTABLE_GARDEN_VISITORS.find((v) => v.name === "Beth");
    expect(beth).toBeDefined();

    if (beth) {
      const evalResult = evaluateVisitorOffer(beth, 200_000, 15_000);
      expect(evalResult.expectedValueCoins).toBeGreaterThan(1_000_000);
      expect(evalResult.recommendation).toContain("Accept");
    }
  });

  it("handles standard visitors with copper and XP valuation", () => {
    const jerry = NOTABLE_GARDEN_VISITORS.find((v) => v.name === "Jerry");
    expect(jerry).toBeDefined();

    if (jerry) {
      const evalResult = evaluateVisitorOffer(jerry, 50_000, 15_000);
      expect(evalResult.copperValueCoins).toBe(25 * 15_000);
    }
  });
});

describe("T2.20: Crop Pest Spawn Timers & Extermination", () => {
  it("computes reduced spawn intervals with Pest Repellent", () => {
    const scheduleWithRepellent = getPestSchedule(true);
    const scheduleWithout = getPestSchedule(false);

    expect(scheduleWithRepellent.baseIntervalMinutes).toBeLessThan(scheduleWithout.baseIntervalMinutes);
    expect(scheduleWithRepellent.estimatedPestsPerHour).toBeGreaterThan(scheduleWithout.estimatedPestsPerHour);
  });

  it("tracks all 8 distinct pest species and vinyl drops", () => {
    expect(PEST_TYPES.length).toBe(8);
    expect(PEST_TYPES.some((p) => p.name === "Mite")).toBe(true);
    expect(PEST_TYPES.some((p) => p.vinylDrop === "Cricket Vinyl")).toBe(true);
  });
});

describe("T2.21: Anita Upgrade ROI Matrix", () => {
  it("calculates payback hours across 15 Anita tiers", () => {
    const roiTiers = calculateAnitaRoi(25_000, 1_200_000, 12_000_000);
    expect(roiTiers.length).toBe(15);
    expect(roiTiers[0]?.fortuneBonus).toBe(4);
    expect(roiTiers[14]?.fortuneBonus).toBe(60);
    expect(roiTiers[0]?.paybackHours).toBeGreaterThan(0);
  });
});

describe("T2.22: Composter Economy", () => {
  it("computes net profit per compost unit and hourly returns", () => {
    const bzPrices = new Map<string, number>();
    bzPrices.set("COMPOST", 80_000);

    const compost = calculateCompostEconomy(bzPrices);
    expect(compost.totalCostPerCompost).toBe(30_000);
    expect(compost.netProfitPerCompost).toBeGreaterThan(45_000);
    expect(compost.profitPerHour).toBeGreaterThan(250_000);
  });
});

describe("T2.24: Optimal Crop Speed & Angle Tuning", () => {
  it("provides optimal speed tuning configurations for all main crops", () => {
    expect(CROP_TUNING_GUIDES.length).toBeGreaterThanOrEqual(7);

    const melon = CROP_TUNING_GUIDES.find((g) => g.crop.includes("Melon"));
    expect(melon).toBeDefined();
    expect(melon?.optimalSpeed).toBe(155);
    expect(melon?.yawAngle).toBe("45.0°");
    expect(melon?.blocksPerSecond).toBe(20.0);
  });
});

