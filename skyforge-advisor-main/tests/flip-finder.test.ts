// tests/flip-finder.test.ts
// Unit test suite for Block 5: Flip Detection, Tax Calculations, Velocity Index,
// Price Manipulation detection, Craft Flips, and In-game Commands.

import { describe, expect, it } from "vitest";
import {
  calculateBazaarTax,
  calculateAuctionHouseTax,
  calculateNetProfit,
  calculateVelocityIndex,
  detectPriceManipulation,
  calculateRiskRating,
  generateCraftFlips,
  getAuctionCommand,
  getBazaarCommand,
  getCraftCommand,
} from "../src/lib/flip-finder";

describe("T2.01: Tax & Fee Calculations", () => {
  it("calculates 1.25% Bazaar tax accurately", () => {
    expect(calculateBazaarTax(100_000)).toBe(1_250);
    expect(calculateBazaarTax(10_000_000)).toBe(125_000);
    expect(calculateBazaarTax(0)).toBe(0);
  });

  it("calculates tiered Auction House taxes across brackets", () => {
    // Under 10M: 1%
    expect(calculateAuctionHouseTax(5_000_000)).toBe(50_000);

    // 10M to 100M: 2%
    expect(calculateAuctionHouseTax(50_000_000)).toBe(1_000_000);

    // Over 100M: 1% creation (capped at 3.5M) + 1.5% collection
    // 500M * 0.015 = 7.5M + 3.5M = 11M
    expect(calculateAuctionHouseTax(500_000_000)).toBe(11_000_000);
  });

  it("calculates net profit after all market deductions", () => {
    // Buy at 1M, sell at 1.5M on Bazaar (tax = 18,750)
    const bzFlip = calculateNetProfit(1_000_000, 1_500_000, "bazaar");
    expect(bzFlip.grossProfit).toBe(500_000);
    expect(bzFlip.tax).toBe(18_750);
    expect(bzFlip.netProfit).toBe(481_250);
    expect(bzFlip.marginPct).toBe(48.1);
  });
});

describe("T2.02: Volume Velocity & Trap Index", () => {
  it("flags illiquid paper-margin traps", () => {
    // High margin (50%) but 2 daily volume
    const trap = calculateVelocityIndex(2, 5, 50);
    expect(trap.isTrap).toBe(true);
    expect(trap.label).toBe("Trap");
    expect(trap.score).toBeLessThanOrEqual(15);
  });

  it("rates high-volume liquid items as Fast or Instant", () => {
    const instant = calculateVelocityIndex(1000, 5, 10);
    expect(instant.isTrap).toBe(false);
    expect(instant.label).toBe("Instant");
    expect(instant.score).toBeGreaterThanOrEqual(80);
  });
});

describe("T2.04: Price Manipulation / Spoof Detector", () => {
  it("detects artificially inflated listings (> 2.5x historical median)", () => {
    const check = detectPriceManipulation(5_000_000, 1_000_000);
    expect(check.isManipulated).toBe(true);
    expect(check.confidence).toBe("high");
    expect(check.reason).toContain("higher than the 7-day median");
  });

  it("passes normal market variations", () => {
    const normal = detectPriceManipulation(1_100_000, 1_000_000);
    expect(normal.isManipulated).toBe(false);
    expect(normal.confidence).toBe("none");
  });
});

describe("T2.05: Volatility & Risk Rating", () => {
  it("classifies safe flips with high volume and low spread", () => {
    const safe = calculateRiskRating(1000, 8, false, false);
    expect(safe.risk).toBe("safe");
    expect(safe.label).toContain("Safe");
  });

  it("classifies traps or manipulated items as extreme risk", () => {
    const extreme = calculateRiskRating(10, 80, true, false);
    expect(extreme.risk).toBe("extreme");
  });
});

describe("T2.03: Craft-Flip Margin Engine", () => {
  it("generates profitable craft flips with ingredient checklists", () => {
    const bzPrices = new Map<string, { buyPrice: number; sellPrice: number; weeklyVolume?: number }>();
    bzPrices.set("ENCHANTED_COBBLESTONE", { buyPrice: 1000, sellPrice: 1200, weeklyVolume: 50000 });
    bzPrices.set("ENCHANTED_IRON", { buyPrice: 1500, sellPrice: 1800, weeklyVolume: 40000 });
    bzPrices.set("ENCHANTED_REDSTONE", { buyPrice: 1200, sellPrice: 1400, weeklyVolume: 40000 });

    const ahBins = new Map<string, number>();
    ahBins.set("AATROX_BATPHONE", 250_000);

    const crafts = generateCraftFlips(bzPrices, ahBins, new Map(), 10);
    expect(crafts.length).toBeGreaterThan(0);

    const batphone = crafts.find((c) => c.id === "AATROX_BATPHONE");
    expect(batphone).toBeDefined();
    expect(batphone?.ingredients.length).toBe(3);
    expect(batphone?.craftCost).toBe(7 * 1000 + 1 * 1500 + 1 * 1200);
    expect(batphone?.netProfit).toBeGreaterThan(200_000);
  });
});

describe("T2.06: In-game Clipboard Commands", () => {
  it("formats /viewauction and /bz commands correctly", () => {
    expect(getAuctionCommand("12345-abcde")).toBe("/viewauction 12345-abcde");
    expect(getBazaarCommand("ENCHANTED_DIAMOND")).toBe("/bz enchanted diamond");
    expect(getCraftCommand("SUPER_COMPACTOR_3000")).toBe("/recipe super compactor 3000");
  });
});

