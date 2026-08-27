// tests/minions-engine.test.ts
// Unit test suite for Automated Minion Economy, Placed Minions, Fuel ROI,
// Claimable Timers, and Minion Slot Unlock Progression.

import { describe, expect, it } from "vitest";
import {
  MINIONS_CATALOG,
  MINION_FUELS,
  MINION_UPGRADES,
  calculateMinionDailyOutput,
  getMinionSlotProgression,
  getCheapestMinionCrafts,
  calculatePlacedMinionClaims,
  type PlacedMinionSetup,
} from "../src/lib/minions-engine";

describe("Minions Engine: Daily Output & Economy Calculation", () => {
  it("calculates accurate daily actions and coin yields for Slime Minion XI with Corrupt Soil & Diamond Spreading", () => {
    const slime11 = MINIONS_CATALOG.find((m) => m.id === "SLIME" && m.tier === 11);
    expect(slime11).toBeDefined();

    if (slime11) {
      const lavaBucket = MINION_FUELS.find((f) => f.id === "ENCHANTED_LAVA_BUCKET")!;
      const corruptSoil = MINION_UPGRADES.find((u) => u.id === "CORRUPT_SOIL")!;
      const diamondSpreading = MINION_UPGRADES.find((u) => u.id === "DIAMOND_SPREADING")!;

      const output = calculateMinionDailyOutput({
        minion: slime11,
        fuel: lavaBucket,
        upgrade1: corruptSoil,
        upgrade2: diamondSpreading,
        hopper: "ENCHANTED_HOPPER",
      });

      expect(output.dailyActions).toBeGreaterThan(6000);
      expect(output.dailyNpcCoins).toBeGreaterThan(150_000);
      expect(output.itemsProduced.some((i) => i.id === "CORRUPT_FRAGMENT")).toBe(true);
      expect(output.itemsProduced.some((i) => i.id === "DIAMOND")).toBe(true);
    }
  });

  it("calculates fuel speed boosts and consumable multiplier rates", () => {
    const sheep12 = MINIONS_CATALOG.find((m) => m.id === "SHEEP" && m.tier === 12);
    expect(sheep12).toBeDefined();

    if (sheep12) {
      const noFuel = MINION_FUELS.find((f) => f.id === "NONE")!;
      const plasmaBucket = MINION_FUELS.find((f) => f.id === "PLASMA_BUCKET")!;

      const outBase = calculateMinionDailyOutput({ minion: sheep12, fuel: noFuel });
      const outPlasma = calculateMinionDailyOutput({ minion: sheep12, fuel: plasmaBucket });

      expect(outPlasma.dailyActions).toBeGreaterThan(outBase.dailyActions);
      expect(outPlasma.speedMultiplier).toBe(1.35);
    }
  });
});

describe("Minions Engine: Slot Unlock & Progression Engine", () => {
  it("calculates correct unlocked slots from unique crafts and community upgrades", () => {
    const mockCrafted = [
      "COBBLESTONE_1", "COBBLESTONE_2", "COBBLESTONE_3", "COBBLESTONE_4", "COBBLESTONE_5",
      "COAL_1", "COAL_2", "COAL_3", "COAL_4", "COAL_5",
      "IRON_1", "IRON_2", "IRON_3", "IRON_4", "IRON_5",
    ]; // 15 unique crafts

    const progression = getMinionSlotProgression(mockCrafted, 2); // +2 community center slots

    // 15 unique crafts = 7 slots from crafts + 2 from community = 9 total slots
    expect(progression.uniqueCraftsCount).toBe(15);
    expect(progression.craftSlotsUnlocked).toBe(7);
    expect(progression.communitySlots).toBe(2);
    expect(progression.totalSlotsUnlocked).toBe(9);
    expect(progression.craftsForNextSlot).toBe(15); // 30 - 15 = 15 needed for 8th craft slot
  });

  it("finds the cheapest missing minion tier crafts", () => {
    const mockCrafted = ["COBBLESTONE_1", "COAL_1"];
    const mockBazaarPrices = new Map<string, number>([
      ["COBBLESTONE", 3],
      ["ENCHANTED_COBBLESTONE", 480],
      ["COAL", 4],
      ["ENCHANTED_COAL", 640],
      ["WHEAT", 2],
      ["HAY_BLOCK", 18],
    ]);

    const cheapest = getCheapestMinionCrafts(mockCrafted, mockBazaarPrices, 5);

    expect(cheapest.length).toBe(5);
    expect(cheapest[0]!.craftCostCoins).toBeGreaterThan(0);
    expect(cheapest[0]!.minionId).toBeDefined();
  });
});

describe("Minions Engine: Placed Minions & Claimable Yields", () => {
  it("calculates real-time accumulated items and claimable coins", () => {
    const placed: PlacedMinionSetup[] = [
      {
        id: "slot-1",
        minionId: "SLIME",
        tier: 11,
        fuelId: "ENCHANTED_LAVA_BUCKET",
        upgrade1Id: "CORRUPT_SOIL",
        upgrade2Id: "DIAMOND_SPREADING",
        hopperId: "ENCHANTED_HOPPER",
        storageChestId: "LARGE_STORAGE",
      },
      {
        id: "slot-2",
        minionId: "SNOW",
        tier: 11,
        fuelId: "ENCHANTED_LAVA_BUCKET",
        upgrade1Id: "SUPER_COMPACTOR_3000",
        upgrade2Id: "DIAMOND_SPREADING",
        hopperId: "ENCHANTED_HOPPER",
        storageChestId: "LARGE_STORAGE",
      },
    ];

    const elapsedHours = 24; // 1 full day of offline generation
    const claims = calculatePlacedMinionClaims(placed, elapsedHours * 3600 * 1000);

    expect(claims.totalClaimableCoins).toBeGreaterThan(200_000);
    expect(claims.minionReports.length).toBe(2);
    expect(claims.minionReports[0]!.claimableCoins).toBeGreaterThan(0);
    expect(claims.totalDailyRate).toBeGreaterThan(200_000);
  });
});

