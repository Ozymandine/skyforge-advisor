// tests/arbitrage-engine.test.ts
// Unit test suite for Block 9: Cross-Market Arbitrage, Pet Leveling Margins,
// Minion Setup ROI, Dark Auction Ceilings, and Shen's Matrix.

import { describe, expect, it } from "vitest";
import {
  calculateCrossMarketArbitrage,
  calculatePetLevelingOpportunities,
  calculateMinionSetups,
  getDarkAuctionCeilings,
  getShensAuctionMatrix,
} from "../src/lib/arbitrage-engine";

describe("T2.25: Cross-Market AH <-> Bazaar Arbitrage", () => {
  it("detects profitable margin spreads between Bazaar buy and AH BIN", () => {
    const bzPrices = new Map<string, { buyPrice: number; sellPrice: number }>();
    bzPrices.set("RECOMBOBULATOR_3000", { buyPrice: 9_000_000, sellPrice: 8_500_000 });

    const ahBins = new Map<string, number>();
    ahBins.set("RECOMBOBULATOR_3000", 11_500_000);

    const arb = calculateCrossMarketArbitrage(bzPrices, ahBins);
    expect(arb.length).toBeGreaterThan(0);

    const recomb = arb.find((a) => a.id === "RECOMBOBULATOR_3000");
    expect(recomb).toBeDefined();
    expect(recomb?.buyMarket).toBe("bazaar");
    expect(recomb?.sellMarket).toBe("ah");
    expect(recomb?.netProfit).toBeGreaterThan(2_000_000);
    expect(recomb?.commandBuy).toContain("/bz");
  });
});

describe("T2.26: Pet Leveling Margins", () => {
  it("calculates pet leveling margins and profit per million XP", () => {
    const ahBins = new Map<string, number>();
    ahBins.set("GOLDEN DRAGON_1", 500_000_000);
    ahBins.set("GOLDEN DRAGON_200", 1_300_000_000);

    const pets = calculatePetLevelingOpportunities(ahBins);
    expect(pets.length).toBeGreaterThanOrEqual(5);

    const gdrag = pets.find((p) => p.petName === "Golden Dragon");
    expect(gdrag).toBeDefined();
    expect(gdrag?.maxLevel).toBe(200);
    expect(gdrag?.netProfit).toBeGreaterThan(500_000_000);
    expect(gdrag?.profitPerMillionXp).toBeGreaterThan(2_000_000);
  });
});

describe("T2.27: Complete Minion Setup ROI & Payback", () => {
  it("computes payback days for high-yield minion setups", () => {
    const minions = calculateMinionSetups();
    expect(minions.length).toBeGreaterThanOrEqual(5);

    const slime = minions.find((m) => m.minionName.includes("Slime"));
    expect(slime).toBeDefined();
    expect(slime?.paybackDays).toBeLessThanOrEqual(70);
    expect(slime?.dailyCoinProfit).toBeGreaterThan(200_000);
  });
});

describe("T2.28: Sirius Dark Auction Bid Ceilings", () => {
  it("computes safe bid ceilings with a 10% safety margin", () => {
    const ceilings = getDarkAuctionCeilings();
    expect(ceilings.length).toBeGreaterThanOrEqual(5);

    const midas = ceilings.find((c) => c.name === "Midas Staff");
    expect(midas).toBeDefined();
    expect(midas?.maxProfitableBid).toBeLessThan(midas?.currentAhMarketValue ?? 0);
    expect(midas?.projectedResaleProfit).toBeGreaterThan(20_000_000);
  });
});

describe("T2.29: Shen's Special Auction Sniper Matrix", () => {
  it("returns projected profit and ROI for weekly Shen items", () => {
    const shens = getShensAuctionMatrix();
    expect(shens.length).toBeGreaterThanOrEqual(3);

    const control = shens.find((s) => s.name.includes("Control"));
    expect(control).toBeDefined();
    expect(control?.roiPct).toBeGreaterThan(30);
  });
});
