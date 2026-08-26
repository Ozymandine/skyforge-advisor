// tests/rift-engine.test.ts
// Unit test suite for Block 11: The Rift Dimension & Enigma Hub Engine.

import { describe, expect, it } from "vitest";
import {
  calculateRiftTime,
  RIFT_TIMECHARMS,
  VAMPIRE_SLAYER_TIERS,
  RIFT_EXPORT_ITEMS,
} from "../src/lib/rift-engine";

describe("T3.07: Rift Time Calculation & 8 Timecharms", () => {
  it("calculates total Rift time accurately with gear and timecharms", () => {
    const time = calculateRiftTime(4, 8, 10);
    expect(time.totalSeconds).toBeGreaterThan(1000);
    expect(time.formatted).toContain("m");
    expect(RIFT_TIMECHARMS.length).toBe(8);
  });
});

describe("T3.09: Vampire Slayer (Bloodfiend T1 - T5)", () => {
  it("tracks all 5 Vampire Slayer boss tiers and mechanics", () => {
    expect(VAMPIRE_SLAYER_TIERS.length).toBe(5);
    const t5 = VAMPIRE_SLAYER_TIERS.find((b) => b.tier === 5);
    expect(t5).toBeDefined();
    expect(t5?.requiredWeapon).toContain("Steak Stake");
    expect(t5?.slayerXp).toBe(1500);
  });
});

describe("T3.10: Rift Motes Export Economy", () => {
  it("computes coins per mote for high-tier exports like Rift Prism", () => {
    expect(RIFT_EXPORT_ITEMS.length).toBeGreaterThanOrEqual(4);
    const prism = RIFT_EXPORT_ITEMS.find((e) => e.name === "Rift Prism");
    expect(prism).toBeDefined();
    expect(prism?.coinsPerMote).toBeGreaterThanOrEqual(500);
  });
});

