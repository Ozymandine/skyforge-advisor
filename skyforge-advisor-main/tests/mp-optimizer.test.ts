// tests/mp-optimizer.test.ts
// Unit test suite for Block 12: Advanced Accessory Bag & Magical Power Optimizer.

import { describe, expect, it } from "vitest";
import {
  MP_BY_RARITY,
  RECOMB_BONUS_MP,
  getTopMpUpgrades,
  POWER_STONES,
  getRecombPriorities,
} from "../src/lib/mp-optimizer";

describe("T3.13: Cost-per-MP Ranking", () => {
  it("ranks unowned accessories from cheapest to most expensive per MP", () => {
    const upgrades = getTopMpUpgrades(new Set());
    expect(upgrades.length).toBeGreaterThan(0);
    expect(upgrades[0]?.costPerMp).toBeLessThan(upgrades[upgrades.length - 1]?.costPerMp ?? 0);
  });
});

describe("T3.14: Power Stone Synergy", () => {
  it("defines power stone stat profiles accurately", () => {
    expect(POWER_STONES.length).toBeGreaterThanOrEqual(6);
    const silky = POWER_STONES.find((p) => p.name === "Silky");
    expect(silky?.statMultipliers.critDamage).toBeGreaterThan(1.0);

    const sighted = POWER_STONES.find((p) => p.name === "Sighted");
    expect(sighted?.statMultipliers.intelligence).toBeGreaterThan(1.0);
  });
});

describe("T3.15: Recombobulator Priority Engine", () => {
  it("prioritizes Legendary accessories (+6 MP) as highest recomb priority", () => {
    const recs = getRecombPriorities(9_000_000);
    expect(recs[0]?.rarity).toBe("LEGENDARY");
    expect(recs[0]?.mpGained).toBe(6);
    expect(recs[0]?.costPerMpGained).toBe(1_500_000);
  });
});

