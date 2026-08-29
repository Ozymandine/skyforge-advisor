// src/lib/garden-ecosystem.ts
// Comprehensive Garden, Farming & Visitor Ecosystem Engine:
// Visitor queue profitability matrix, Crop pest spawn timers, Anita ROI calculator,
// Composter economy, Crop milestones, and Optimal angle/speed tuning guide.

import { formatFull } from "./skyblock";

// ---------------------------------------------------------------------------
// T2.19: GARDEN VISITOR QUEUE & SERVING PROFITABILITY MATRIX
// ---------------------------------------------------------------------------

export type VisitorRarity = "COMMON" | "UNCOMMON" | "RARE" | "LEGENDARY" | "SPECIAL";

export type VisitorDefinition = {
  name: string;
  rarity: VisitorRarity;
  copperReward: number;
  gardenXp: number;
  farmingXp: number;
  rareDrop?: {
    name: string;
    dropRate: string;
    marketValue: number;
  };
};

export const NOTABLE_GARDEN_VISITORS: VisitorDefinition[] = [
  {
    name: "Spaceman",
    rarity: "SPECIAL",
    copperReward: 1000,
    gardenXp: 10000,
    farmingXp: 2500000,
    rareDrop: { name: "Space Helmet", dropRate: "100%", marketValue: 2_500_000_000 },
  },
  {
    name: "Beth",
    rarity: "LEGENDARY",
    copperReward: 80,
    gardenXp: 250,
    farmingXp: 100000,
    rareDrop: { name: "Overgrown Grass", dropRate: "0.2%", marketValue: 85_000_000 },
  },
  {
    name: "Maeve",
    rarity: "LEGENDARY",
    copperReward: 80,
    gardenXp: 250,
    farmingXp: 100000,
    rareDrop: { name: "Green Bandana", dropRate: "0.5%", marketValue: 28_000_000 },
  },
  {
    name: "Sirius",
    rarity: "RARE",
    copperReward: 50,
    gardenXp: 150,
    farmingXp: 50000,
    rareDrop: { name: "Dedication IV", dropRate: "0.5%", marketValue: 125_000_000 },
  },
  {
    name: "Jacob",
    rarity: "RARE",
    copperReward: 40,
    gardenXp: 120,
    farmingXp: 40000,
    rareDrop: { name: "Cultivating I", dropRate: "1.0%", marketValue: 2_000_000 },
  },
  {
    name: "Jerry",
    rarity: "UNCOMMON",
    copperReward: 25,
    gardenXp: 80,
    farmingXp: 25000,
    rareDrop: { name: "Jerry Box (Green)", dropRate: "5.0%", marketValue: 500_000 },
  },
];

export type VisitorEvaluation = {
  visitor: VisitorDefinition;
  requestCostCoins: number;
  copperValueCoins: number; // Copper valued at ~15,000 coins each via Garden Shop items
  expectedValueCoins: number;
  netProfit: number;
  recommendation: "Accept (High Profit)" | "Accept (Copper/XP)" | "Reject / Skip";
  color: string;
};

export function evaluateVisitorOffer(
  visitor: VisitorDefinition,
  requestCostCoins: number,
  copperUnitValue = 15_000, // 1 Copper ~ 15k coins in Garden shop upgrades
): VisitorEvaluation {
  const copperValueCoins = visitor.copperReward * copperUnitValue;
  const rareDropEv = visitor.rareDrop
    ? visitor.rareDrop.marketValue * (parseFloat(visitor.rareDrop.dropRate) / 100)
    : 0;

  const expectedValueCoins = Math.round(copperValueCoins + rareDropEv);
  const netProfit = expectedValueCoins - requestCostCoins;

  let recommendation: VisitorEvaluation["recommendation"] = "Accept (Copper/XP)";
  let color = "#22c55e";

  if (visitor.rarity === "SPECIAL" || visitor.rarity === "LEGENDARY" || netProfit > 200_000) {
    recommendation = "Accept (High Profit)";
    color = "#38bdf8";
  } else if (netProfit < -500_000 && visitor.rarity === "COMMON") {
    recommendation = "Reject / Skip";
    color = "#ef4444";
  }

  return {
    visitor,
    requestCostCoins,
    copperValueCoins,
    expectedValueCoins,
    netProfit,
    recommendation,
    color,
  };
}

// ---------------------------------------------------------------------------
// T2.20: CROP PEST SPAWN TIMERS & EXTERMINATION
// ---------------------------------------------------------------------------

export type PestType = {
  id: string;
  name: string;
  favoredCrops: string[];
  vinylDrop: string;
  baseDropCoins: number;
};

export const PEST_TYPES: PestType[] = [
  {
    id: "mite",
    name: "Mite",
    favoredCrops: ["Wheat", "Carrot", "Potato"],
    vinylDrop: "Mite Vinyl",
    baseDropCoins: 45_000,
  },
  {
    id: "cricket",
    name: "Cricket",
    favoredCrops: ["Melon", "Pumpkin"],
    vinylDrop: "Cricket Vinyl",
    baseDropCoins: 55_000,
  },
  {
    id: "moth",
    name: "Moth",
    favoredCrops: ["Nether Wart", "Cocoa Beans"],
    vinylDrop: "Moth Vinyl",
    baseDropCoins: 65_000,
  },
  {
    id: "worm",
    name: "Earthworm",
    favoredCrops: ["Mushroom", "Wheat"],
    vinylDrop: "Worm Vinyl",
    baseDropCoins: 50_000,
  },
  {
    id: "mosquito",
    name: "Mosquito",
    favoredCrops: ["Sugar Cane", "Cactus"],
    vinylDrop: "Mosquito Vinyl",
    baseDropCoins: 60_000,
  },
  {
    id: "beetle",
    name: "Beetle",
    favoredCrops: ["Pumpkin", "Melon"],
    vinylDrop: "Beetle Vinyl",
    baseDropCoins: 75_000,
  },
  {
    id: "locust",
    name: "Locust",
    favoredCrops: ["Carrot", "Potato"],
    vinylDrop: "Locust Vinyl",
    baseDropCoins: 80_000,
  },
  {
    id: "slug",
    name: "Slug",
    favoredCrops: ["Mushroom", "Sugar Cane"],
    vinylDrop: "Slug Vinyl",
    baseDropCoins: 70_000,
  },
];

export type PestSpawnSchedule = {
  baseIntervalMinutes: number;
  bonusFortunePerPestKilled: number;
  maxActivePests: number;
  estimatedPestsPerHour: number;
};

export function getPestSchedule(hasPestRepellent = true): PestSpawnSchedule {
  // Base spawn interval is ~5 minutes of continuous farming (3.5 mins with repellent maxed)
  const baseIntervalMinutes = hasPestRepellent ? 3.5 : 5.0;
  const estimatedPestsPerHour = Math.round(60 / baseIntervalMinutes);

  return {
    baseIntervalMinutes,
    bonusFortunePerPestKilled: 1.0, // +1 Fortune per pest in Bestiary milestone
    maxActivePests: 8,
    estimatedPestsPerHour,
  };
}

// ---------------------------------------------------------------------------
// T2.21: ANITA UPGRADE ROI MATRIX
// ---------------------------------------------------------------------------

export type AnitaTierRoi = {
  tier: number;
  fortuneBonus: number;
  medalsCost: string;
  ticketsCost: number;
  totalCostCoins: number;
  hourlyExtraCoins: number;
  paybackHours: number;
};

export function calculateAnitaRoi(
  ticketPriceCoins = 25_000,
  goldMedalValueCoins = 1_200_000,
  hourlyBaseCropRevenue = 12_000_000,
): AnitaTierRoi[] {
  const tiers: AnitaTierRoi[] = [];

  for (let tier = 1; tier <= 15; tier++) {
    const fortuneBonus = tier * 4; // +4 Fortune per tier
    const goldMedalsNeeded = Math.ceil(tier / 2);
    const ticketsNeeded = tier * 25;
    const totalCostCoins =
      goldMedalsNeeded * goldMedalValueCoins + ticketsNeeded * ticketPriceCoins;

    // +4 Fortune yields approx +0.4% increase in crop revenue
    const hourlyExtraCoins = Math.round(hourlyBaseCropRevenue * 0.004 * tier);
    const paybackHours = Math.round((totalCostCoins / Math.max(1, hourlyExtraCoins)) * 10) / 10;

    tiers.push({
      tier,
      fortuneBonus,
      medalsCost: `${goldMedalsNeeded}x Gold Medals`,
      ticketsCost: ticketsNeeded,
      totalCostCoins,
      hourlyExtraCoins,
      paybackHours,
    });
  }

  return tiers;
}

// ---------------------------------------------------------------------------
// T2.22: COMPOSTER ECONOMY
// ---------------------------------------------------------------------------

export type ComposterProfitEstimate = {
  organicMatterCost: number;
  biofuelCost: number;
  totalCostPerCompost: number;
  bazaarCompostPrice: number;
  netProfitPerCompost: number;
  profitPerHour: number;
};

export function calculateCompostEconomy(
  bazaarPrices: Map<string, number> = new Map(),
): ComposterProfitEstimate {
  // 4,000 Organic Matter (e.g. 40x Enchanted Seeds ~ 18k coins)
  const organicMatterCost = 18_000;
  // 2,000 Biofuel (e.g. Oil barrel / Biofuel units ~ 12k coins)
  const biofuelCost = 12_000;
  const totalCostPerCompost = organicMatterCost + biofuelCost;

  const bazaarCompostPrice = bazaarPrices.get("COMPOST") ?? 75_000;
  const tax = Math.round(bazaarCompostPrice * 0.0125);
  const netProfitPerCompost = bazaarCompostPrice - tax - totalCostPerCompost;

  // Maxed composter produces ~6 compost per hour
  const profitPerHour = Math.round(netProfitPerCompost * 6);

  return {
    organicMatterCost,
    biofuelCost,
    totalCostPerCompost,
    bazaarCompostPrice,
    netProfitPerCompost,
    profitPerHour,
  };
}

// ---------------------------------------------------------------------------
// T2.24: OPTIMAL CROP FARMING ROTATION & SPEED TUNING GUIDE
// ---------------------------------------------------------------------------

export type CropTuningGuide = {
  crop: string;
  optimalSpeed: number;
  yawAngle: string;
  pitchAngle: string;
  blocksPerSecond: number;
  recommendedTool: string;
  notes: string;
};

export const CROP_TUNING_GUIDES: CropTuningGuide[] = [
  {
    crop: "Wheat / Carrot / Potato",
    optimalSpeed: 93,
    yawAngle: "90° or 0°",
    pitchAngle: "0° (Eye Level)",
    blocksPerSecond: 20.0,
    recommendedTool: "Euclid's / Pythagorean / Gauss Hoe (T3)",
    notes: "Run sideways in a 5-wide lane while holding A/D and breaking 5 rows simultaneously.",
  },
  {
    crop: "Pumpkin / Melon",
    optimalSpeed: 155,
    yawAngle: "45.0°",
    pitchAngle: "55.0° (Looking Down)",
    blocksPerSecond: 20.0,
    recommendedTool: "Pumpkin Dicer 3.0 / Melon Dicer 3.0",
    notes: "45-degree angle sprint while looking down breaks 2 rows at once at maximum 20 bps cap.",
  },
  {
    crop: "Sugar Cane",
    optimalSpeed: 327,
    yawAngle: "45.0°",
    pitchAngle: "0°",
    blocksPerSecond: 20.0,
    recommendedTool: "Turing Sugar Cane Hoe (T3)",
    notes: "Hold forward and sprint diagonally across double-height cane rows.",
  },
  {
    crop: "Cactus",
    optimalSpeed: 400,
    yawAngle: "90.0°",
    pitchAngle: "0°",
    blocksPerSecond: 20.0,
    recommendedTool: "Cactus Knife",
    notes: "Side-stepping through 2-high cactus rows with 400% speed.",
  },
  {
    crop: "Cocoa Beans",
    optimalSpeed: 155,
    yawAngle: "90.0°",
    pitchAngle: "-45.0° (Looking Up)",
    blocksPerSecond: 20.0,
    recommendedTool: "Coco Chopper",
    notes: "Vertical 4-high cocoa walls with Depth Strider boots.",
  },
  {
    crop: "Mushroom",
    optimalSpeed: 234,
    yawAngle: "0°",
    pitchAngle: "0°",
    blocksPerSecond: 20.0,
    recommendedTool: "Fungi Cutter",
    notes: "Hold A/D while walking backward in a shaded plot.",
  },
  {
    crop: "Nether Wart",
    optimalSpeed: 93,
    yawAngle: "90° or 0°",
    pitchAngle: "0°",
    blocksPerSecond: 20.0,
    recommendedTool: "Newton Nether Warts Hoe (T3)",
    notes: "Same layout as wheat/carrot; 5-wide rows with Soul Sand.",
  },
];
