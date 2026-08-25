// src/lib/farming-calculator.ts
// Comprehensive Hypixel SkyBlock Farming Fortune & Hourly Yields Engine:
// Calculates exact Fortune from Garden level, plots, crop milestones, Anita perks,
// armor sets, tools, and pets, plus hourly crop yield and live Bazaar coin revenue.

import { FARMING_CROPS, type FarmingCrop } from "./calendar";

export type FarmingToolTier = 1 | 2 | 3;

export type FarmingArmorSet = "none" | "farm" | "pumpkin" | "cropie" | "squash" | "fermento";

export type FarmingPet = "none" | "elephant" | "mooshroom_cow";

export type FarmingSetupInput = {
  farmingLevel: number;
  gardenLevel: number;
  plotsUnlocked: number;
  anitaBonus: number; // 0 to 15 (+4 fortune per tier)
  armorSet: FarmingArmorSet;
  toolTier: FarmingToolTier;
  hasDedication4: boolean;
  hasCultivating10: boolean;
  pet: FarmingPet;
  petLevel: number;
  hasGreenBandana: boolean;
};

export type CropYieldEstimate = {
  crop: FarmingCrop;
  fortune: number;
  blocksPerHour: number;
  cropsPerHour: number;
  bazaarUnitPrice: number;
  coinsPerHour: number;
};

export type FarmingCalculationResult = {
  universalFortune: number;
  breakdown: {
    skill: number;
    garden: number;
    plots: number;
    anita: number;
    armor: number;
    toolBase: number;
    enchants: number;
    pet: number;
    equipment: number;
  };
  cropYields: CropYieldEstimate[];
};

export const DEFAULT_FARMING_SETUP: FarmingSetupInput = {
  farmingLevel: 45,
  gardenLevel: 12,
  plotsUnlocked: 24,
  anitaBonus: 10,
  armorSet: "fermento",
  toolTier: 3,
  hasDedication4: true,
  hasCultivating10: true,
  pet: "elephant",
  petLevel: 100,
  hasGreenBandana: true,
};

export function calculateFarmingFortune(
  setup: FarmingSetupInput = DEFAULT_FARMING_SETUP,
  bazaarPrices: Map<string, number> = new Map(),
): FarmingCalculationResult {
  // 1. Skill Fortune: +4 Farming Fortune per Farming Level
  const skill = setup.farmingLevel * 4;

  // 2. Garden Level: +5 Fortune per Garden Level
  const garden = setup.gardenLevel * 5;

  // 3. Plots: +3 Fortune per plot unlocked
  const plots = Math.min(24, setup.plotsUnlocked) * 3;

  // 4. Anita: +4 Fortune per tier (up to 15 tiers = 60 Fortune)
  const anita = setup.anitaBonus * 4;

  // 5. Armor Set:
  let armor = 0;
  switch (setup.armorSet) {
    case "fermento":
      armor = 140; // 35 * 4 pieces
      break;
    case "squash":
      armor = 100;
      break;
    case "cropie":
      armor = 70;
      break;
    case "pumpkin":
    case "farm":
      armor = 30;
      break;
    case "none":
    default:
      armor = 0;
      break;
  }

  // 6. Tool Base & Tier:
  let toolBase = 0;
  if (setup.toolTier === 3) toolBase = 50;
  else if (setup.toolTier === 2) toolBase = 30;
  else if (setup.toolTier === 1) toolBase = 15;

  // 7. Enchants: Dedication 4 (+20 per crop milestone ~ +40) + Cultivating 10 (+20) + Harvest 6 (+75)
  const enchants = (setup.hasDedication4 ? 40 : 15) + (setup.hasCultivating10 ? 20 : 5) + 75;

  // 8. Pet:
  let pet = 0;
  if (setup.pet === "elephant") {
    // Elephant gives +1.8 Fortune per level (180 at level 100)
    pet = Math.round(setup.petLevel * 1.8);
  } else if (setup.pet === "mooshroom_cow") {
    // Mooshroom Cow gives +1.1 Fortune per level (110 at level 100) + mushroom drops
    pet = Math.round(setup.petLevel * 1.1);
  }
  // Green Bandana gives +4 Fortune per Garden Level
  const equipment = setup.hasGreenBandana ? setup.gardenLevel * 4 : 0;

  const universalFortune =
    skill + garden + plots + anita + armor + toolBase + enchants + pet + equipment;

  // Hourly harvest at 20 blocks/sec (72,000 blocks/hour)
  const BLOCKS_PER_HOUR = 72_000;

  const cropYields: CropYieldEstimate[] = FARMING_CROPS.map((crop) => {
    // Specific tool multiplier bonuses (e.g. T3 hoes grant +50 dedicated crop fortune)
    const specificFortune = universalFortune + 50;
    const dropsMultiplier = 1 + specificFortune / 100;

    // Base drops per block:
    let baseDrops = 1;
    if (crop.id === "WHEAT" || crop.id === "CARROT" || crop.id === "POTATO") baseDrops = 3;
    else if (crop.id === "NETHER_STALK") baseDrops = 2.5;
    else if (crop.id === "MELON") baseDrops = 5;
    else if (crop.id === "PUMPKIN") baseDrops = 1;
    else if (crop.id === "CACTUS" || crop.id === "SUGAR_CANE") baseDrops = 2;

    const cropsPerHour = Math.round(BLOCKS_PER_HOUR * baseDrops * dropsMultiplier);
    const bazaarUnitPrice = bazaarPrices.get(crop.id) ?? (crop.id === "WHEAT" ? 6 : 12);
    const coinsPerHour = Math.round(cropsPerHour * bazaarUnitPrice);

    return {
      crop,
      fortune: specificFortune,
      blocksPerHour: BLOCKS_PER_HOUR,
      cropsPerHour,
      bazaarUnitPrice,
      coinsPerHour,
    };
  });

  return {
    universalFortune,
    breakdown: {
      skill,
      garden,
      plots,
      anita,
      armor,
      toolBase,
      enchants,
      pet,
      equipment,
    },
    cropYields,
  };
}
