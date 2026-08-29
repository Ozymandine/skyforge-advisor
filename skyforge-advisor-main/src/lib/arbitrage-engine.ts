// src/lib/arbitrage-engine.ts
// Comprehensive SkyBlock Arbitrage & Investment ROI Matrix:
// Cross-market AH <-> BZ arbitrage, Pet leveling margins, Minion setup ROI & payback,
// Dark Auction bid ceiling estimator, Shen's auction sniper, and budget presets.

import { calculateNetProfit, type TaxBreakdown } from "./flip-finder";
import { formatFull, formatNumber } from "./skyblock";

// ---------------------------------------------------------------------------
// T2.25: CROSS-MARKET AH <-> BAZAAR ARBITRAGE
// ---------------------------------------------------------------------------

export type CrossMarketArbitrage = {
  id: string;
  name: string;
  buyMarket: "bazaar" | "ah";
  sellMarket: "bazaar" | "ah";
  buyPrice: number;
  sellPrice: number;
  tax: number;
  netProfit: number;
  marginPct: number;
  commandBuy: string;
  commandSell: string;
};

export const ARBITRAGE_WATCHLIST = [
  { id: "RECOMBOBULATOR_3000", name: "Recombobulator 3000" },
  { id: "HOT_POTATO_BOOK", name: "Hot Potato Book" },
  { id: "FUMING_POTATO_BOOK", name: "Fuming Potato Book" },
  { id: "SUMMONING_EYE", name: "Summoning Eye" },
  { id: "BOOSTER_COOKIE", name: "Booster Cookie" },
  { id: "JACOBS_TICKET", name: "Jacob's Ticket" },
  { id: "ULTIMATE_CARROT_CANDY", name: "Ultimate Carrot Candy" },
  { id: "SUPER_COMPACTOR_3000", name: "Super Compactor 3000" },
  { id: "ENCHANTED_LAVA_BUCKET", name: "Enchanted Lava Bucket" },
  { id: "PLASMA_BUCKET", name: "Plasma Bucket" },
];

export function calculateCrossMarketArbitrage(
  bazaarPrices: Map<string, { buyPrice: number; sellPrice: number }>,
  ahLowestBins: Map<string, number>,
): CrossMarketArbitrage[] {
  const results: CrossMarketArbitrage[] = [];

  for (const item of ARBITRAGE_WATCHLIST) {
    const bz = bazaarPrices.get(item.id);
    const ahBin = ahLowestBins.get(item.id);

    if (!bz || !ahBin) continue;

    // Direction 1: Buy on Bazaar (Instant Buy / Buy Order) -> Sell on AH (Lowest BIN)
    if (ahBin > bz.buyPrice) {
      const { tax, netProfit, marginPct } = calculateNetProfit(bz.buyPrice, ahBin, "ah");
      if (netProfit > 10_000 && marginPct > 2) {
        results.push({
          id: item.id,
          name: item.name,
          buyMarket: "bazaar",
          sellMarket: "ah",
          buyPrice: bz.buyPrice,
          sellPrice: ahBin,
          tax,
          netProfit,
          marginPct,
          commandBuy: `/bz ${item.id.toLowerCase().replace(/_/g, " ")}`,
          commandSell: `/ah`,
        });
      }
    }

    // Direction 2: Buy on AH (Sniped BIN) -> Sell on Bazaar (Instant Sell)
    if (bz.sellPrice > ahBin) {
      const { tax, netProfit, marginPct } = calculateNetProfit(ahBin, bz.sellPrice, "bazaar");
      if (netProfit > 10_000 && marginPct > 2) {
        results.push({
          id: item.id,
          name: item.name,
          buyMarket: "ah",
          sellMarket: "bazaar",
          buyPrice: ahBin,
          sellPrice: bz.sellPrice,
          tax,
          netProfit,
          marginPct,
          commandBuy: `/ah`,
          commandSell: `/bz ${item.id.toLowerCase().replace(/_/g, " ")}`,
        });
      }
    }
  }

  return results.sort((a, b) => b.netProfit - a.netProfit);
}

// ---------------------------------------------------------------------------
// T2.26: PET LEVELING MARGIN CALCULATOR
// ---------------------------------------------------------------------------

export type PetLevelingOpportunity = {
  petName: string;
  rarity: "LEGENDARY" | "MYTHIC";
  level1BuyPrice: number;
  levelMaxSellPrice: number;
  maxLevel: 100 | 200;
  xpRequired: number;
  candyCostEstimate: number;
  netProfit: number;
  profitPerMillionXp: number;
  roiPct: number;
};

export function calculatePetLevelingOpportunities(
  ahBins: Map<string, number> = new Map(),
): PetLevelingOpportunity[] {
  const PET_PROFILES = [
    {
      petName: "Golden Dragon",
      rarity: "LEGENDARY" as const,
      maxLevel: 200 as const,
      xpRequired: 210_000_000,
      baseBuyPrice: 500_000_000,
      baseMaxPrice: 1_250_000_000,
      candyCost: 35_000_000,
    },
    {
      petName: "Ender Dragon",
      rarity: "LEGENDARY" as const,
      maxLevel: 100 as const,
      xpRequired: 25_353_230,
      baseBuyPrice: 420_000_000,
      baseMaxPrice: 680_000_000,
      candyCost: 12_000_000,
    },
    {
      petName: "Black Cat",
      rarity: "MYTHIC" as const,
      maxLevel: 100 as const,
      xpRequired: 25_353_230,
      baseBuyPrice: 45_000_000,
      baseMaxPrice: 95_000_000,
      candyCost: 10_000_000,
    },
    {
      petName: "Bal",
      rarity: "LEGENDARY" as const,
      maxLevel: 100 as const,
      xpRequired: 25_353_230,
      baseBuyPrice: 14_000_000,
      baseMaxPrice: 38_000_000,
      candyCost: 5_000_000,
    },
    {
      petName: "Mooshroom Cow",
      rarity: "LEGENDARY" as const,
      maxLevel: 100 as const,
      xpRequired: 25_353_230,
      baseBuyPrice: 12_000_000,
      baseMaxPrice: 32_000_000,
      candyCost: 4_500_000,
    },
    {
      petName: "Sheep",
      rarity: "LEGENDARY" as const,
      maxLevel: 100 as const,
      xpRequired: 25_353_230,
      baseBuyPrice: 6_000_000,
      baseMaxPrice: 18_000_000,
      candyCost: 3_000_000,
    },
  ];

  return PET_PROFILES.map((p) => {
    const buyPrice = ahBins.get(`${p.petName.toUpperCase()}_1`) ?? p.baseBuyPrice;
    const sellPrice = ahBins.get(`${p.petName.toUpperCase()}_${p.maxLevel}`) ?? p.baseMaxPrice;
    const totalCost = buyPrice + p.candyCost;
    const { netProfit, marginPct } = calculateNetProfit(totalCost, sellPrice, "ah");
    const millionsXp = p.xpRequired / 1_000_000;
    const profitPerMillionXp = Math.round(netProfit / millionsXp);

    return {
      petName: p.petName,
      rarity: p.rarity,
      level1BuyPrice: buyPrice,
      levelMaxSellPrice: sellPrice,
      maxLevel: p.maxLevel,
      xpRequired: p.xpRequired,
      candyCostEstimate: p.candyCost,
      netProfit,
      profitPerMillionXp,
      roiPct: marginPct,
    };
  }).sort((a, b) => b.netProfit - a.netProfit);
}

// ---------------------------------------------------------------------------
// T2.27: COMPLETE MINION SETUP ROI & PAYBACK ENGINE
// ---------------------------------------------------------------------------

export type MinionSetupRoi = {
  minionName: string;
  tier: number;
  setupCostCoins: number;
  upgradesUsed: string;
  dailyCoinProfit: number;
  paybackDays: number;
  tier30DayProfit: number;
};

export function calculateMinionSetups(
  bazaarPrices: Map<string, number> = new Map(),
): MinionSetupRoi[] {
  return [
    {
      minionName: "Slime Minion",
      tier: 11,
      setupCostCoins: 14_500_000,
      upgradesUsed: "Corrupt Soil + Diamond Spreading + Enchanted Hopper + Plasma Bucket",
      dailyCoinProfit: 245_000,
      paybackDays: Math.round(14_500_000 / 245_000),
      tier30DayProfit: 245_000 * 30,
    },
    {
      minionName: "Sheep Minion",
      tier: 12,
      setupCostCoins: 28_000_000,
      upgradesUsed: "Berberis Fuel Injector + Corrupt Soil + Enchanted Hopper + Plasma Bucket",
      dailyCoinProfit: 310_000,
      paybackDays: Math.round(28_000_000 / 310_000),
      tier30DayProfit: 310_000 * 30,
    },
    {
      minionName: "Clay Minion",
      tier: 11,
      setupCostCoins: 4_200_000,
      upgradesUsed: "Diamond Spreading + Super Compactor 3000 + Enchanted Lava",
      dailyCoinProfit: 78_000,
      paybackDays: Math.round(4_200_000 / 78_000),
      tier30DayProfit: 78_000 * 30,
    },
    {
      minionName: "Snow Minion",
      tier: 11,
      setupCostCoins: 5_500_000,
      upgradesUsed: "Diamond Spreading + Super Compactor 3000 + Plasma Bucket",
      dailyCoinProfit: 85_000,
      paybackDays: Math.round(5_500_000 / 85_000),
      tier30DayProfit: 85_000 * 30,
    },
    {
      minionName: "Melon Minion",
      tier: 12,
      setupCostCoins: 35_000_000,
      upgradesUsed: "Flycatcher + Diamond Spreading + Super Compactor 3000 + Plasma Bucket",
      dailyCoinProfit: 290_000,
      paybackDays: Math.round(35_000_000 / 290_000),
      tier30DayProfit: 290_000 * 30,
    },
  ];
}

// ---------------------------------------------------------------------------
// T2.28: DARK AUCTION BID CEILING ESTIMATOR
// ---------------------------------------------------------------------------

export type DarkAuctionItemCeiling = {
  name: string;
  currentAhMarketValue: number;
  maxProfitableBid: number; // Bid ceiling giving at least 10% safety margin after AH tax
  projectedResaleProfit: number;
  safetyMarginPct: number;
};

export function getDarkAuctionCeilings(): DarkAuctionItemCeiling[] {
  const ITEMS = [
    { name: "Midas Staff", market: 320_000_000 },
    { name: "Plasma Nucleus", market: 110_000_000 },
    { name: "Hegemony Artifact", market: 380_000_000 },
    { name: "Ender Artifact", market: 220_000_000 },
    { name: "Nether Artifact", market: 140_000_000 },
    { name: "Flower of Truth", market: 14_000_000 },
  ];

  return ITEMS.map((item) => {
    // AH tax on high ticket items is 2.5%
    const afterTaxSell = Math.round(item.market * 0.975);
    // Safe bid ceiling leaves a 10% net profit buffer
    const maxProfitableBid = Math.round(afterTaxSell * 0.9);
    const projectedResaleProfit = afterTaxSell - maxProfitableBid;

    return {
      name: item.name,
      currentAhMarketValue: item.market,
      maxProfitableBid,
      projectedResaleProfit,
      safetyMarginPct: 10.0,
    };
  });
}

// ---------------------------------------------------------------------------
// T2.29: SHEN'S SPECIAL AUCTION SNIPER MATRIX
// ---------------------------------------------------------------------------

export type ShensAuctionSniper = {
  name: string;
  category: string;
  estimatedWinningBid: number;
  resaleMarketValue: number;
  projectedProfit: number;
  roiPct: number;
};

export function getShensAuctionMatrix(): ShensAuctionSniper[] {
  return [
    {
      name: "Artifact of Control",
      category: "Accessory / Rift",
      estimatedWinningBid: 85_000_000,
      resaleMarketValue: 120_000_000,
      projectedProfit: 32_000_000,
      roiPct: 37.6,
    },
    {
      name: "Shen's Regalia",
      category: "Accessory",
      estimatedWinningBid: 45_000_000,
      resaleMarketValue: 68_000_000,
      projectedProfit: 21_300_000,
      roiPct: 47.3,
    },
    {
      name: "Titanium Relic",
      category: "Mining Relic",
      estimatedWinningBid: 60_000_000,
      resaleMarketValue: 88_000_000,
      projectedProfit: 25_800_000,
      roiPct: 43.0,
    },
  ];
}
