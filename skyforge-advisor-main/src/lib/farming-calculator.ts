export type CropId =
  | "wheat"
  | "carrot"
  | "potato"
  | "pumpkin"
  | "melon"
  | "mushroom"
  | "cocoa_beans"
  | "cactus"
  | "sugar_cane"
  | "nether_wart";

export type FarmingConfig = {
  farmingLevel?: number;
  gardenLevel?: number;
  plotsUnlocked?: number;
  unlockedPlots?: number;
  anitaBonus?: number;
  armorSet?: string;
  toolTier?: number;
  hasDedication4?: boolean;
  hasCultivating10?: boolean;
  hasGreenBandana?: boolean;
  greenThumbTier?: number;
  visitorsServed?: number;
  pet?: string;
  activePet?: "elephant" | "mooshroom_cow" | "none";
  petLevel?: number;
  totalStrength?: number;
  toolFortune?: number;
  dedicationTier?: number;
};

export type CropProfitReport = {
  cropId: CropId;
  name: string;
  baseDropsPerBlock: number;
  totalFortune: number;
  dropsPerHour: number;
  npcCoinsPerHour: number;
  bazaarCoinsPerHour: number;
  recommendedSpeed: number;
  jacobGoldBracketTarget: number;
  projectedContestYield: number;
  predictedMedal: "Diamond" | "Gold" | "Silver" | "Bronze" | "None";
};

export const CROP_DATA: Record<
  CropId,
  {
    name: string;
    icon: string;
    baseDrops: number;
    npcPricePerDrop: number;
    bazaarFallbackPrice: number;
    recommendedSpeed: number;
    jacobGoldTarget: number;
    jacobDiamondTarget: number;
  }
> = {
  wheat: {
    name: "Wheat",
    icon: "🌾",
    baseDrops: 1,
    npcPricePerDrop: 4,
    bazaarFallbackPrice: 6.5,
    recommendedSpeed: 93,
    jacobGoldTarget: 145_000,
    jacobDiamondTarget: 185_000,
  },
  carrot: {
    name: "Carrot",
    icon: "🥕",
    baseDrops: 3,
    npcPricePerDrop: 3,
    bazaarFallbackPrice: 4.8,
    recommendedSpeed: 93,
    jacobGoldTarget: 420_000,
    jacobDiamondTarget: 510_000,
  },
  potato: {
    name: "Potato",
    icon: "🥔",
    baseDrops: 3,
    npcPricePerDrop: 3,
    bazaarFallbackPrice: 4.5,
    recommendedSpeed: 93,
    jacobGoldTarget: 410_000,
    jacobDiamondTarget: 505_000,
  },
  pumpkin: {
    name: "Pumpkin",
    icon: "🎃",
    baseDrops: 1,
    npcPricePerDrop: 10,
    bazaarFallbackPrice: 12.0,
    recommendedSpeed: 260,
    jacobGoldTarget: 115_000,
    jacobDiamondTarget: 140_000,
  },
  melon: {
    name: "Melon",
    icon: "🍉",
    baseDrops: 5,
    npcPricePerDrop: 2,
    bazaarFallbackPrice: 3.2,
    recommendedSpeed: 400,
    jacobGoldTarget: 650_000,
    jacobDiamondTarget: 780_000,
  },
  mushroom: {
    name: "Mushroom",
    icon: "🍄",
    baseDrops: 1,
    npcPricePerDrop: 10,
    bazaarFallbackPrice: 16.0,
    recommendedSpeed: 232,
    jacobGoldTarget: 130_000,
    jacobDiamondTarget: 165_000,
  },
  cocoa_beans: {
    name: "Cocoa Beans",
    icon: "🍫",
    baseDrops: 3,
    npcPricePerDrop: 3,
    bazaarFallbackPrice: 5.2,
    recommendedSpeed: 155,
    jacobGoldTarget: 410_000,
    jacobDiamondTarget: 500_000,
  },
  cactus: {
    name: "Cactus",
    icon: "🌵",
    baseDrops: 2,
    npcPricePerDrop: 3,
    bazaarFallbackPrice: 5.8,
    recommendedSpeed: 400,
    jacobGoldTarget: 320_000,
    jacobDiamondTarget: 390_000,
  },
  sugar_cane: {
    name: "Sugar Cane",
    icon: "🎋",
    baseDrops: 2,
    npcPricePerDrop: 4,
    bazaarFallbackPrice: 6.2,
    recommendedSpeed: 327,
    jacobGoldTarget: 290_000,
    jacobDiamondTarget: 360_000,
  },
  nether_wart: {
    name: "Nether Wart",
    icon: "🍄",
    baseDrops: 2.5,
    npcPricePerDrop: 4,
    bazaarFallbackPrice: 6.5,
    recommendedSpeed: 93,
    jacobGoldTarget: 360_000,
    jacobDiamondTarget: 440_000,
  },
};

export function getDefaultFarmingConfig(): FarmingConfig {
  return {
    farmingLevel: 50,
    gardenLevel: 15,
    unlockedPlots: 24,
    plotsUnlocked: 24,
    anitaBonus: 15,
    greenThumbTier: 5,
    visitorsServed: 120,
    activePet: "elephant",
    pet: "elephant",
    petLevel: 100,
    totalStrength: 850,
    toolFortune: 70,
    dedicationTier: 4,
  };
}

export function calculateFarmingFortune(config: FarmingConfig) {
  const farmingLevel = config.farmingLevel ?? 50;
  const gardenLevel = config.gardenLevel ?? 15;
  const anitaBonus = config.anitaBonus ?? 15;
  const plotsUnlocked = config.plotsUnlocked ?? config.unlockedPlots ?? 24;

  const skillFortune = farmingLevel * 4;
  const gardenFortune = gardenLevel * 5;
  const plotsFortune = plotsUnlocked * 3;
  const anitaFortune = anitaBonus * 4;
  const armorFortune = config.armorSet === "fermento" ? 140 : 80;
  const toolBase = (config.toolTier ?? 3) * 30;
  const enchants = (config.hasDedication4 ? 36 : 0) + (config.hasCultivating10 ? 20 : 0) + (config.toolFortune ?? 70);
  const toolTotal = toolBase + enchants;

  const selectedPet = config.pet ?? config.activePet ?? "elephant";
  const petLevel = config.petLevel ?? 100;
  let petFortune = 0;
  let equipment = 0;
  if (selectedPet === "elephant") {
    petFortune = Math.round((petLevel / 100) * 180);
    equipment = config.hasGreenBandana ? (gardenLevel * 4) : 40;
  } else if (selectedPet === "mooshroom_cow") {
    petFortune = Math.round((petLevel / 100) * 110) + Math.floor((config.totalStrength ?? 850) / 20);
    equipment = 40;
  }

  const baseFortune = 100;
  const totalFortune =
    baseFortune +
    skillFortune +
    gardenFortune +
    plotsFortune +
    anitaFortune +
    armorFortune +
    toolTotal +
    petFortune +
    equipment;

  const blocksPerHour = 72_000;
  const cropList: CropId[] = [
    "carrot",
    "potato",
    "melon",
    "wheat",
    "pumpkin",
    "mushroom",
    "cocoa_beans",
    "cactus",
    "sugar_cane",
    "nether_wart",
  ];
  const cropYields = cropList.map((cropId) => {
    const data = CROP_DATA[cropId];
    const dropMultiplier = totalFortune / 100;
    const cropsPerHour = Math.round(blocksPerHour * data.baseDrops * dropMultiplier);
    const coinsPerHour = Math.round(cropsPerHour * data.bazaarFallbackPrice);

    return {
      crop: { id: cropId, name: data.name, icon: data.icon },
      fortune: totalFortune,
      cropsPerHour,
      coinsPerHour,
    };
  });

  return {
    baseFortune,
    levelFortune: skillFortune,
    plotFortune: plotsFortune,
    anitaFortune,
    greenThumbFortune: 50,
    petFortune,
    toolFortune: toolTotal,
    totalFortune,
    universalFortune: totalFortune,
    breakdown: {
      skill: skillFortune,
      garden: gardenFortune,
      plots: plotsFortune,
      anita: anitaFortune,
      armor: armorFortune,
      tool: toolTotal,
      toolBase,
      enchants,
      pet: petFortune,
      equipment,
    },
    cropYields,
  };
}

export function calculateAllCropProfits(
  config: FarmingConfig,
  bazaarPrices: Record<string, number> = {}
): CropProfitReport[] {
  const { totalFortune } = calculateFarmingFortune(config);
  const blocksPerHour = 72_000;
  const contestBlocks = 24_000;

  return (Object.keys(CROP_DATA) as CropId[]).map((cropId) => {
    const data = CROP_DATA[cropId];
    const dropMultiplier = totalFortune / 100;
    const totalDropsPerBlock = data.baseDrops * dropMultiplier;

    const dropsPerHour = Math.round(blocksPerHour * totalDropsPerBlock);
    const projectedContestYield = Math.round(contestBlocks * totalDropsPerBlock);

    const bzPrice = bazaarPrices[cropId] ?? data.bazaarFallbackPrice;
    const npcCoinsPerHour = Math.round(dropsPerHour * data.npcPricePerDrop);
    const bazaarCoinsPerHour = Math.round(dropsPerHour * bzPrice);

    let predictedMedal: CropProfitReport["predictedMedal"] = "None";
    if (projectedContestYield >= data.jacobDiamondTarget) {
      predictedMedal = "Diamond";
    } else if (projectedContestYield >= data.jacobGoldTarget) {
      predictedMedal = "Gold";
    } else if (projectedContestYield >= data.jacobGoldTarget * 0.6) {
      predictedMedal = "Silver";
    } else if (projectedContestYield >= data.jacobGoldTarget * 0.25) {
      predictedMedal = "Bronze";
    }

    return {
      cropId,
      name: data.name,
      baseDropsPerBlock: data.baseDrops,
      totalFortune,
      dropsPerHour,
      npcCoinsPerHour,
      bazaarCoinsPerHour,
      recommendedSpeed: data.recommendedSpeed,
      jacobGoldBracketTarget: data.jacobGoldTarget,
      projectedContestYield,
      predictedMedal,
    };
  });
}
