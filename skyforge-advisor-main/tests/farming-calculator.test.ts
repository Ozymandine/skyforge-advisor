import { describe, it, expect } from "vitest";
import {
  calculateFarmingFortune,
  calculateAllCropProfits,
  getDefaultFarmingConfig,
} from "../src/lib/farming-calculator";

describe("Farming Calculator Engine", () => {
  it("calculates total Farming Fortune with base, skills, plots, and pets", () => {
    const config = getDefaultFarmingConfig();
    const fortune = calculateFarmingFortune(config);

    expect(fortune.totalFortune).toBeGreaterThan(300);
    expect(fortune.levelFortune).toBe(config.farmingLevel * 4);
    expect(fortune.plotFortune).toBe(config.unlockedPlots * 3);
    expect(fortune.petFortune).toBeGreaterThan(0);
  });

  it("calculates crop profits and Jacob contest projections across all 10 crops", () => {
    const config = getDefaultFarmingConfig();
    const profits = calculateAllCropProfits(config);

    expect(profits.length).toBe(10);
    for (const crop of profits) {
      expect(crop.dropsPerHour).toBeGreaterThan(0);
      expect(crop.bazaarCoinsPerHour).toBeGreaterThan(0);
      expect(crop.projectedContestYield).toBeGreaterThan(0);
      expect(["Diamond", "Gold", "Silver", "Bronze", "None"]).toContain(crop.predictedMedal);
    }
  });
});

