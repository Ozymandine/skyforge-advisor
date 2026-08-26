// tests/collections-roadmap.test.ts
// Unit test suite for Block 13: Collections, Minion Slot Roadmap & Bank Interest.

import { describe, expect, it } from "vitest";
import {
  calculateMinionSlotRoadmap,
  calculateBankInterest,
  MINION_SLOT_THRESHOLDS,
  BANK_INTEREST_TIERS,
} from "../src/lib/collections-roadmap";

describe("T3.20: Minion Slot Unlock Roadmap", () => {
  it("calculates current unlocked slots and next target crafts needed", () => {
    const roadmap = calculateMinionSlotRoadmap(500);
    expect(roadmap.currentSlots).toBe(25);
    expect(roadmap.nextSlotTarget).toBeDefined();
    expect(roadmap.nextSlotTarget?.slotsCount).toBe(26);
    expect(roadmap.nextSlotTarget?.uniqueCraftsRemaining).toBe(25); // 525 - 500
  });
});

describe("T3.24: Personal Bank Interest Optimizer", () => {
  it("computes 2% interest up to account cap", () => {
    const interest = calculateBankInterest(50_000_000);
    expect(interest.interestGained).toBe(1_000_000);
    expect(interest.tier.tierName).toContain("Super Deluxe");
  });
});
