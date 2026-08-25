// src/lib/dungeons-engine.ts
// Comprehensive Hypixel SkyBlock Dungeons & Catacombs Tactical Engine:
// Party Finder reliability evaluator, Class synergy & milestones, Master Mode clearance odds,
// Secret benchmarks, Floor chest EV profitability, and Essence star-up cost estimator.

export type FloorLootItem = {
  name: string;
  dropRate: number;
  fractionString: string;
  chestCost: number;
  marketValue: number;
  netProfit: number;
};

export type FloorChestProfitability = {
  floor: string;
  name: string;
  isMasterMode: boolean;
  expectedValuePerRun: number;
  topDrops: FloorLootItem[];
};

export const FLOOR_CHEST_LOOT_TABLES: FloorChestProfitability[] = [
  {
    floor: "F7",
    name: "The Catacombs - Floor VII (Necron)",
    isMasterMode: false,
    expectedValuePerRun: 1_450_000,
    topDrops: [
      {
        name: "Necron's Handle",
        dropRate: 1 / 1000,
        fractionString: "1 in 1,000 (0.1%)",
        chestCost: 100_000_000,
        marketValue: 1_100_000_000,
        netProfit: 1_000_000_000,
      },
      {
        name: "Wither Shield Scroll",
        dropRate: 1 / 300,
        fractionString: "1 in 300 (0.33%)",
        chestCost: 10_000_000,
        marketValue: 70_000_000,
        netProfit: 60_000_000,
      },
      {
        name: "Shadow Warp Scroll",
        dropRate: 1 / 300,
        fractionString: "1 in 300 (0.33%)",
        chestCost: 10_000_000,
        marketValue: 70_000_000,
        netProfit: 60_000_000,
      },
      {
        name: "Implosion Scroll",
        dropRate: 1 / 300,
        fractionString: "1 in 300 (0.33%)",
        chestCost: 10_000_000,
        marketValue: 70_000_000,
        netProfit: 60_000_000,
      },
      {
        name: "Auto-Recombobulator",
        dropRate: 1 / 150,
        fractionString: "1 in 150 (0.67%)",
        chestCost: 5_000_000,
        marketValue: 14_000_000,
        netProfit: 9_000_000,
      },
    ],
  },
  {
    floor: "F6",
    name: "The Catacombs - Floor VI (Sadan)",
    isMasterMode: false,
    expectedValuePerRun: 420_000,
    topDrops: [
      {
        name: "Giant's Sword",
        dropRate: 1 / 1000,
        fractionString: "1 in 1,000 (0.1%)",
        chestCost: 25_000_000,
        marketValue: 155_000_000,
        netProfit: 130_000_000,
      },
      {
        name: "Precursor Eye",
        dropRate: 1 / 500,
        fractionString: "1 in 500 (0.2%)",
        chestCost: 15_000_000,
        marketValue: 35_000_000,
        netProfit: 20_000_000,
      },
      {
        name: "Summoning Ring",
        dropRate: 1 / 250,
        fractionString: "1 in 250 (0.4%)",
        chestCost: 6_000_000,
        marketValue: 16_000_000,
        netProfit: 10_000_000,
      },
    ],
  },
  {
    floor: "F5",
    name: "The Catacombs - Floor V (Livid)",
    isMasterMode: false,
    expectedValuePerRun: 280_000,
    topDrops: [
      {
        name: "Shadow Assassin Chestplate",
        dropRate: 1 / 300,
        fractionString: "1 in 300 (0.33%)",
        chestCost: 6_000_000,
        marketValue: 26_000_000,
        netProfit: 20_000_000,
      },
      {
        name: "Shadow Fury",
        dropRate: 1 / 500,
        fractionString: "1 in 500 (0.2%)",
        chestCost: 15_000_000,
        marketValue: 46_000_000,
        netProfit: 31_000_000,
      },
      {
        name: "Last Breath",
        dropRate: 1 / 200,
        fractionString: "1 in 200 (0.5%)",
        chestCost: 4_000_000,
        marketValue: 12_000_000,
        netProfit: 8_000_000,
      },
    ],
  },
  {
    floor: "M7",
    name: "Master Mode - Floor VII (Master Necron)",
    isMasterMode: true,
    expectedValuePerRun: 3_850_000,
    topDrops: [
      {
        name: "Dark Claymore",
        dropRate: 1 / 500,
        fractionString: "1 in 500 (0.2%)",
        chestCost: 150_000_000,
        marketValue: 420_000_000,
        netProfit: 270_000_000,
      },
      {
        name: "Necron's Handle",
        dropRate: 1 / 800,
        fractionString: "1 in 800 (0.125%)",
        chestCost: 100_000_000,
        marketValue: 1_100_000_000,
        netProfit: 1_000_000_000,
      },
      {
        name: "Fifth Master Star",
        dropRate: 1 / 150,
        fractionString: "1 in 150 (0.67%)",
        chestCost: 50_000_000,
        marketValue: 120_000_000,
        netProfit: 70_000_000,
      },
      {
        name: "Fourth Master Star",
        dropRate: 1 / 100,
        fractionString: "1 in 100 (1.0%)",
        chestCost: 35_000_000,
        marketValue: 75_000_000,
        netProfit: 40_000_000,
      },
    ],
  },
  {
    floor: "M6",
    name: "Master Mode - Floor VI (Master Sadan)",
    isMasterMode: true,
    expectedValuePerRun: 1_200_000,
    topDrops: [
      {
        name: "Giant's Sword",
        dropRate: 1 / 600,
        fractionString: "1 in 600 (0.167%)",
        chestCost: 25_000_000,
        marketValue: 155_000_000,
        netProfit: 130_000_000,
      },
      {
        name: "Third Master Star",
        dropRate: 1 / 100,
        fractionString: "1 in 100 (1.0%)",
        chestCost: 20_000_000,
        marketValue: 45_000_000,
        netProfit: 25_000_000,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// T2.13 & T2.16: PARTY FINDER EVALUATOR & SECRET BENCHMARKS
// ---------------------------------------------------------------------------

export type PartyFinderEvaluation = {
  cataLevel: number;
  totalSecrets: number;
  totalRuns: number;
  secretsPerRun: number;
  secretBenchmark: "Beginner" | "Average" | "Experienced" | "Expert";
  readinessRating: "Carry" | "Qualified" | "Borderline" | "Undergeared";
  badgeColor: string;
  badgeClass: string;
  feedback: string;
};

export function evaluatePartyFinderReadiness(
  cataLevel: number,
  secretsFound: number,
  totalCompletions: number,
  targetFloor = "F7",
): PartyFinderEvaluation {
  const runs = Math.max(1, totalCompletions);
  const secretsPerRun = Math.round((secretsFound / runs) * 10) / 10;

  let secretBenchmark: PartyFinderEvaluation["secretBenchmark"] = "Average";
  if (secretsPerRun >= 11) secretBenchmark = "Expert";
  else if (secretsPerRun >= 8) secretBenchmark = "Experienced";
  else if (secretsPerRun >= 5) secretBenchmark = "Average";
  else secretBenchmark = "Beginner";

  let minCata = 24;
  if (targetFloor === "F7") minCata = 30;
  else if (targetFloor === "M6") minCata = 40;
  else if (targetFloor === "M7") minCata = 45;

  let readinessRating: PartyFinderEvaluation["readinessRating"] = "Qualified";
  let badgeColor = "#22c55e";
  let badgeClass = "border-emerald-500/40 bg-emerald-500/15 text-emerald-300";
  let feedback = "Solid stats with good secret pace for standard Party Finder teams.";

  if (cataLevel >= minCata + 10 && secretsPerRun >= 9) {
    readinessRating = "Carry";
    badgeColor = "#38bdf8";
    badgeClass = "border-sky-400/40 bg-sky-500/15 text-sky-300";
    feedback = "High Cata level and expert secret efficiency. Suitable for sub-6m S+ speedruns.";
  } else if (cataLevel < minCata) {
    readinessRating = "Undergeared";
    badgeColor = "#ef4444";
    badgeClass = "border-red-500/40 bg-red-500/15 text-red-300";
    feedback = `Below Party Finder entry benchmark (Cata ${minCata}+ recommended). High risk of party kicks.`;
  } else if (secretsPerRun < 5) {
    readinessRating = "Borderline";
    badgeColor = "#eab308";
    badgeClass = "border-amber-500/40 bg-amber-500/15 text-amber-300";
    feedback = "Cata level is sufficient, but secrets per run is low (<5 s/r). Practice secret routes.";
  }

  return {
    cataLevel,
    totalSecrets: secretsFound,
    totalRuns: runs,
    secretsPerRun,
    secretBenchmark,
    readinessRating,
    badgeColor,
    badgeClass,
    feedback,
  };
}

// ---------------------------------------------------------------------------
// T2.15: MASTER MODE CLEARANCE ODDS & GATEWAYS
// ---------------------------------------------------------------------------

export type MasterFloorOdds = {
  floor: string;
  name: string;
  recommendedCata: number;
  gearCheck: string;
  clearanceOddsPct: number;
  status: "Easy" | "Normal" | "Challenging" | "Extreme" | "Locked";
};

export function calculateMasterModeOdds(cataLevel: number, hasTerminator = true, hasHyperion = true): MasterFloorOdds[] {
  const floors = [
    { floor: "M1", name: "Floor I (Bonzo)", cata: 32, gear: "Juju / GS / 3/4 Necron" },
    { floor: "M2", name: "Floor II (Scarf)", cata: 34, gear: "Terminator / Necron" },
    { floor: "M3", name: "Floor III (Professor)", cata: 36, gear: "Terminator / Maxor Boots" },
    { floor: "M4", name: "Floor IV (Thorn)", cata: 38, gear: "Terminator / Spirit Bow" },
    { floor: "M5", name: "Floor V (Livid)", cata: 40, gear: "Terminator / Dia Livid Head" },
    { floor: "M6", name: "Floor VI (Sadan)", cata: 42, gear: "Terminator / Dia Sadan Head / Gyro" },
    { floor: "M7", name: "Floor VII (Master Necron)", cata: 48, gear: "Terminator / Hyperion / Dia Necron Head / Master Stars" },
  ];

  return floors.map((f) => {
    let odds = 0;
    let status: MasterFloorOdds["status"] = "Locked";

    if (cataLevel < f.cata - 4) {
      odds = 5;
      status = "Locked";
    } else if (cataLevel < f.cata) {
      odds = 35;
      status = "Extreme";
    } else if (cataLevel < f.cata + 3) {
      odds = 75;
      status = "Challenging";
    } else if (cataLevel < f.cata + 6) {
      odds = 90;
      status = "Normal";
    } else {
      odds = 99;
      status = "Easy";
    }

    if (!hasTerminator && f.cata >= 34) {
      odds = Math.max(10, odds - 30);
    }
    if (!hasHyperion && f.cata >= 42) {
      odds = Math.max(10, odds - 25);
    }

    return {
      floor: f.floor,
      name: f.name,
      recommendedCata: f.cata,
      gearCheck: f.gear,
      clearanceOddsPct: odds,
      status,
    };
  });
}

// ---------------------------------------------------------------------------
// T2.17: ESSENCE & STAR-UP ESTIMATOR
// ---------------------------------------------------------------------------

export type StarUpEstimate = {
  itemType: "Wither Armor Piece" | "Hyperion/Wither Blade" | "Terminator/Bow";
  essenceType: "Wither Essence" | "Dragon Essence" | "Undead Essence";
  stars1to5Cost: number;
  masterStarsCostCoins: number;
  totalCoinsValue: number;
};

export function getStarUpEstimates(witherEssencePrice = 2800): StarUpEstimate[] {
  return [
    {
      itemType: "Hyperion/Wither Blade",
      essenceType: "Wither Essence",
      stars1to5Cost: 2850,
      masterStarsCostCoins: 280_000_000,
      totalCoinsValue: Math.round(2850 * witherEssencePrice + 280_000_000),
    },
    {
      itemType: "Wither Armor Piece",
      essenceType: "Wither Essence",
      stars1to5Cost: 1250,
      masterStarsCostCoins: 280_000_000,
      totalCoinsValue: Math.round(1250 * witherEssencePrice + 280_000_000),
    },
    {
      itemType: "Terminator/Bow",
      essenceType: "Dragon Essence",
      stars1to5Cost: 1800,
      masterStarsCostCoins: 280_000_000,
      totalCoinsValue: Math.round(1800 * 3200 + 280_000_000),
    },
  ];
}

