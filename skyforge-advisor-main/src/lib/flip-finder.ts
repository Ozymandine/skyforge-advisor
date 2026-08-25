// src/lib/flip-finder.ts
// Comprehensive SkyBlock Flip Detection & Margin Intelligence Suite:
// Tax & fee calculator, volume-to-competition velocity index, craft-flip finder,
// price manipulation & spoof detector, risk rating, and in-game clipboard commands.

import generatedRecipes from "./items/generated-recipes.json";
import { titleCase } from "./skyblock";

// ---------------------------------------------------------------------------
// T2.01: TAX & FEE CALCULATOR
// ---------------------------------------------------------------------------

export type TaxBreakdown = {
  grossProfit: number;
  tax: number;
  netProfit: number;
  marginPct: number;
};

/**
 * Calculates exact Bazaar transaction tax (default 1.25% or 1.125% with upgrades).
 */
export function calculateBazaarTax(sellPrice: number, taxRate = 0.0125): number {
  if (sellPrice <= 0) return 0;
  return Math.round(sellPrice * taxRate);
}

/**
 * Calculates exact Hypixel Auction House listing and collection fees.
 * - Under 10M: 1% total fee
 * - 10M to 100M: 2% total fee (1% creation + 1% collection)
 * - Over 100M: 2.5% total fee (1% creation capped at 3.5M + 1.5% collection)
 */
export function calculateAuctionHouseTax(sellPrice: number): number {
  if (sellPrice <= 0) return 0;

  if (sellPrice < 10_000_000) {
    return Math.round(sellPrice * 0.01);
  }

  if (sellPrice < 100_000_000) {
    return Math.round(sellPrice * 0.02);
  }

  // 100M+ coins: Creation fee is 1% capped at 3.5M + 1.5% collection fee
  const creationFee = Math.min(3_500_000, sellPrice * 0.01);
  const collectionFee = sellPrice * 0.015;
  return Math.round(creationFee + collectionFee);
}

/**
 * Computes exact Net Profit and Margin after all taxes and market deductions.
 */
export function calculateNetProfit(
  costPrice: number,
  sellPrice: number,
  market: "bazaar" | "ah" = "bazaar",
  bazaarTaxRate = 0.0125,
): TaxBreakdown {
  const grossProfit = sellPrice - costPrice;
  const tax =
    market === "bazaar"
      ? calculateBazaarTax(sellPrice, bazaarTaxRate)
      : calculateAuctionHouseTax(sellPrice);

  const netProfit = grossProfit - tax;
  const marginPct = costPrice > 0 ? (netProfit / costPrice) * 100 : 0;

  return {
    grossProfit,
    tax,
    netProfit,
    marginPct: Math.round(marginPct * 10) / 10,
  };
}

// ---------------------------------------------------------------------------
// T2.02: VOLUME-TO-COMPETITION VELOCITY INDEX & TRAP DETECTOR
// ---------------------------------------------------------------------------

export type VelocityRating = {
  score: number; // 0 to 100
  label: "Instant" | "Fast" | "Moderate" | "Slow" | "Trap";
  isTrap: boolean;
  estimatedMinutesToSell: number;
  reason: string;
};

export function calculateVelocityIndex(
  dailyVolume: number,
  activeCompetitors: number,
  marginPct: number,
): VelocityRating {
  if (dailyVolume < 5 && marginPct > 20) {
    return {
      score: 10,
      label: "Trap",
      isTrap: true,
      estimatedMinutesToSell: 720,
      reason: "High paper margin with almost 0 real daily sales. Very high risk of stuck capital.",
    };
  }

  const comp = Math.max(1, activeCompetitors);
  const hourlySales = dailyVolume / 24;
  const salesRatio = hourlySales / comp;

  let score = 50;
  let label: VelocityRating["label"] = "Moderate";
  let estimatedMinutes = 30;
  let reason = "Balanced trading volume with regular sales.";

  if (salesRatio >= 5) {
    score = 95;
    label = "Instant";
    estimatedMinutes = 2;
    reason = "Massive hourly demand. Sells almost instantly.";
  } else if (salesRatio >= 1.5) {
    score = 80;
    label = "Fast";
    estimatedMinutes = 10;
    reason = "Strong continuous liquidity with low competition.";
  } else if (salesRatio < 0.2 || dailyVolume < 15) {
    score = 25;
    label = "Slow";
    estimatedMinutes = 180;
    reason = "Low sales frequency. Expect orders to take hours to fill.";
  }

  return {
    score,
    label,
    isTrap: false,
    estimatedMinutesToSell: estimatedMinutes,
    reason,
  };
}

// ---------------------------------------------------------------------------
// T2.04: PRICE MANIPULATION & SPOOF DETECTOR
// ---------------------------------------------------------------------------

export type ManipulationAlert = {
  isManipulated: boolean;
  confidence: "high" | "medium" | "low" | "none";
  reason: string | null;
};

export function detectPriceManipulation(
  currentPrice: number,
  historicalMedian: number | null | undefined,
  competitorPrices: number[] = [],
): ManipulationAlert {
  if (!historicalMedian || historicalMedian <= 0) {
    return { isManipulated: false, confidence: "none", reason: null };
  }

  if (currentPrice > historicalMedian * 2.5 && currentPrice > 500_000) {
    return {
      isManipulated: true,
      confidence: "high",
      reason: `Price (${Math.round(currentPrice).toLocaleString()}) is ${(currentPrice / historicalMedian).toFixed(1)}x higher than the 7-day median (${Math.round(historicalMedian).toLocaleString()}).`,
    };
  }

  if (currentPrice < historicalMedian * 0.35 && competitorPrices.length <= 1) {
    return {
      isManipulated: true,
      confidence: "medium",
      reason: "Isolated ultra-low listing on low-volume item. Possible bait or market dump.",
    };
  }

  return { isManipulated: false, confidence: "none", reason: null };
}

// ---------------------------------------------------------------------------
// T2.05: HISTORICAL VOLATILITY & RISK RATING
// ---------------------------------------------------------------------------

export type RiskLevel = "safe" | "moderate" | "volatile" | "extreme";

export type RiskAssessment = {
  risk: RiskLevel;
  label: string;
  color: string;
  badgeClass: string;
};

export function calculateRiskRating(
  dailyVolume: number,
  marginPct: number,
  isManipulated: boolean,
  isTrap: boolean,
): RiskAssessment {
  if (isManipulated || isTrap) {
    return {
      risk: "extreme",
      label: "Extreme / Trap",
      color: "#ef4444",
      badgeClass: "border-red-500/40 bg-red-500/15 text-red-300",
    };
  }

  if (dailyVolume > 500 && marginPct < 15) {
    return {
      risk: "safe",
      label: "Low Risk (Safe)",
      color: "#22c55e",
      badgeClass: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
    };
  }

  if (dailyVolume > 100 && marginPct < 25) {
    return {
      risk: "moderate",
      label: "Moderate",
      color: "#eab308",
      badgeClass: "border-amber-500/40 bg-amber-500/15 text-amber-300",
    };
  }

  return {
    risk: "volatile",
    label: "High Volatility",
    color: "#f97316",
    badgeClass: "border-orange-500/40 bg-orange-500/15 text-orange-300",
  };
}

// ---------------------------------------------------------------------------
// T2.03: LIVE CRAFT-FLIP MARGIN FINDER
// ---------------------------------------------------------------------------

export type CraftIngredient = {
  id: string;
  name: string;
  amount: number;
  unitPrice: number;
  totalCost: number;
};

export type CraftFlip = {
  id: string;
  name: string;
  targetMarket: "ah" | "bazaar";
  craftCost: number;
  sellPrice: number;
  tax: number;
  netProfit: number;
  marginPct: number;
  ingredients: CraftIngredient[];
  risk: RiskAssessment;
  velocity: VelocityRating;
};

export function generateCraftFlips(
  bazaarPrices: Map<string, { buyPrice: number; sellPrice: number; weeklyVolume?: number }>,
  ahLowestBins: Map<string, number>,
  itemNames: Map<string, string> = new Map(),
  maxResults = 40,
): CraftFlip[] {
  const flips: CraftFlip[] = [];
  const recipes = generatedRecipes as Record<string, Array<{ id: string; amount: number }>>;

  for (const [targetId, ingredientsList] of Object.entries(recipes)) {
    if (!ingredientsList || ingredientsList.length === 0) continue;

    let totalCraftCost = 0;
    let hasAllPrices = true;
    const ingredients: CraftIngredient[] = [];

    for (const ing of ingredientsList) {
      const bz = bazaarPrices.get(ing.id);
      const unitPrice = bz?.buyPrice || bz?.sellPrice || ahLowestBins.get(ing.id) || 0;
      if (unitPrice <= 0) {
        hasAllPrices = false;
        break;
      }
      const cost = Math.round(unitPrice * ing.amount);
      totalCraftCost += cost;
      ingredients.push({
        id: ing.id,
        name: itemNames.get(ing.id) ?? titleCase(ing.id.replace(/_/g, " ")),
        amount: ing.amount,
        unitPrice,
        totalCost: cost,
      });
    }

    if (!hasAllPrices || totalCraftCost <= 0) continue;

    const ahBin = ahLowestBins.get(targetId);
    const bzSell = bazaarPrices.get(targetId)?.sellPrice;

    let sellPrice = 0;
    let targetMarket: "ah" | "bazaar" = "bazaar";

    if (ahBin && ahBin > 0) {
      sellPrice = ahBin;
      targetMarket = "ah";
    } else if (bzSell && bzSell > 0) {
      sellPrice = bzSell;
      targetMarket = "bazaar";
    }

    if (sellPrice <= totalCraftCost) continue;

    const { tax, netProfit, marginPct } = calculateNetProfit(totalCraftCost, sellPrice, targetMarket);
    if (netProfit < 20_000 || marginPct < 3) continue;

    const weeklyVol = bazaarPrices.get(targetId)?.weeklyVolume ?? 200;
    const velocity = calculateVelocityIndex(Math.round(weeklyVol / 7), 5, marginPct);
    const risk = calculateRiskRating(Math.round(weeklyVol / 7), marginPct, false, velocity.isTrap);

    flips.push({
      id: targetId,
      name: itemNames.get(targetId) ?? titleCase(targetId.replace(/_/g, " ")),
      targetMarket,
      craftCost: totalCraftCost,
      sellPrice,
      tax,
      netProfit,
      marginPct,
      ingredients,
      risk,
      velocity,
    });
  }

  flips.sort((a, b) => b.netProfit - a.netProfit || b.marginPct - a.marginPct);
  return flips.slice(0, maxResults);
}

// ---------------------------------------------------------------------------
// T2.06: QUICK-COPY IN-GAME CLIPBOARD COMMANDS
// ---------------------------------------------------------------------------

export function getAuctionCommand(auctionIdOrUuid: string): string {
  return `/viewauction ${auctionIdOrUuid}`;
}

export function getBazaarCommand(itemId: string): string {
  return `/bz ${itemId.toLowerCase().replace(/_/g, " ")}`;
}

export function getCraftCommand(itemId: string): string {
  return `/recipe ${itemId.toLowerCase().replace(/_/g, " ")}`;
}

