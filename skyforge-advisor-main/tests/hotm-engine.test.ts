import { describe, it, expect } from "vitest";
import {
  HOTM_NODES,
  HOTM_PRESETS,
  calculateTotalHotmBonus,
  HOTM_TIER_XP_REQUIREMENTS,
} from "../src/lib/hotm-engine";

describe("Heart of the Mountain (HotM) Engine", () => {
  it("defines all 10 HotM tiers and nodes catalog", () => {
    expect(HOTM_NODES.length).toBeGreaterThanOrEqual(20);
    const tier1Nodes = HOTM_NODES.filter((n) => n.tier === 1);
    const tier10Nodes = HOTM_NODES.filter((n) => n.tier === 10);
    expect(tier1Nodes.length).toBeGreaterThan(0);
    expect(tier10Nodes.length).toBeGreaterThan(0);
  });

  it("calculates total speed and fortune from perk allocations", () => {
    const allocations = {
      mining_speed: 50, // +1000 speed
      mining_fortune: 50, // +250 fortune
      mining_speed_2: 50, // +2000 speed
      mining_fortune_2: 50, // +275 fortune
      mining_madness: 1, // +50 speed, +12.5 fortune
    };
    const bonus = calculateTotalHotmBonus(allocations);
    expect(bonus.totalSpeed).toBe(1000 + 2000 + 50);
    expect(bonus.totalFortune).toBe(250 + 275 + 12.5);
  });

  it("provides valid presets with defined node allocations", () => {
    for (const preset of HOTM_PRESETS) {
      expect(preset.name).toBeDefined();
      expect(Object.keys(preset.allocations).length).toBeGreaterThan(0);
      const bonus = calculateTotalHotmBonus(preset.allocations);
      expect(bonus.totalSpeed).toBeGreaterThan(0);
    }
  });

  it("contains XP requirements for Tiers 1 through 10", () => {
    expect(HOTM_TIER_XP_REQUIREMENTS[1]).toBe(0);
    expect(HOTM_TIER_XP_REQUIREMENTS[10]).toBe(400_000);
  });
});
