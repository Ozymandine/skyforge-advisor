// tests/kuudra-engine.test.ts
// Unit test suite for Block 10: Crimson Isle & Kuudra Specialization Engine.

import { describe, expect, it } from "vitest";
import {
  getFactionStatus,
  evaluateKuudraReadiness,
  KUUDRA_TIERS,
  CRIMSON_ARMOR_TIERS,
  KUUDRA_T5_CHEST_DROPS,
} from "../src/lib/kuudra-engine";

describe("T3.01: Faction Reputation", () => {
  it("calculates faction tier and perks from reputation score", () => {
    const mage = getFactionStatus(15_000, "MAGE");
    expect(mage.tierName).toBe("Respected");
    expect(mage.repToNext).toBe(3_000);
    expect(mage.perks.length).toBeGreaterThan(0);
  });
});

describe("T3.02: Kuudra Tier Gateways (T1 - T5)", () => {
  it("evaluates requirements for endgame Infernal T5 Kuudra", () => {
    const qualified = evaluateKuudraReadiness(45, true, true, true, true);
    const t5 = qualified.find((k) => k.tier.tierNumber === 5);
    expect(t5).toBeDefined();
    expect(t5?.qualified).toBe(true);
    expect(t5?.readinessPct).toBe(100);

    const undergeared = evaluateKuudraReadiness(20, false, false, false, false);
    const t5Under = undergeared.find((k) => k.tier.tierNumber === 5);
    expect(t5Under?.qualified).toBe(false);
    expect(t5Under?.missingRequirements.length).toBeGreaterThan(0);
  });
});

describe("T3.04: Crimson Armor Tier-Up Engine", () => {
  it("computes essence and teeth scaling from Base to Infernal", () => {
    expect(CRIMSON_ARMOR_TIERS.length).toBe(5);
    const infernal = CRIMSON_ARMOR_TIERS.find((a) => a.tierName === "Infernal");
    expect(infernal).toBeDefined();
    expect(infernal?.crimsonEssenceCost).toBe(120_000);
    expect(infernal?.kuudraTeethCost).toBe(400);
  });
});

describe("T3.05: Kuudra Chest Profitability", () => {
  it("tracks high-value Kuudra T5 chest drops", () => {
    expect(KUUDRA_T5_CHEST_DROPS.length).toBeGreaterThanOrEqual(4);
    const godRoll = KUUDRA_T5_CHEST_DROPS.find((d) => d.name.includes("God Roll"));
    expect(godRoll).toBeDefined();
    expect(godRoll?.marketValue).toBeGreaterThan(500_000_000);
  });
});
