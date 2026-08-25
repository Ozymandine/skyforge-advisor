// src/lib/combat-calculator.ts
// Comprehensive Hypixel SkyBlock Magic Find & Rare Drop Probability Engine:
// Exact Magic Find rollup from Bestiary, pets, sorrow armor, enrichments, cookies,
// and real Slayer / Dungeon boss drop probability calculations.

export type RareDropDefinition = {
  id: string;
  name: string;
  source: string;
  baseProbability: number; // 1 in N (e.g. 1/2500)
  baseFractionString: string;
  icon: string;
};

export const RARE_DROPS: RareDropDefinition[] = [
  {
    id: "JUDGMENT_CORE",
    name: "Judgment Core",
    source: "Voidgloom Seraph T4",
    baseProbability: 1 / 2500,
    baseFractionString: "1 in 2,500",
    icon: "🔮",
  },
  {
    id: "WARDEN_HEART",
    name: "Warden Heart",
    source: "Revenant Horror T5",
    baseProbability: 1 / 10000,
    baseFractionString: "1 in 10,000",
    icon: "❤️",
  },
  {
    id: "OVERFLUX_CAPACITOR",
    name: "Overflux Capacitor",
    source: "Sven Packmaster T4",
    baseProbability: 1 / 2000,
    baseFractionString: "1 in 2,000",
    icon: "⚡",
  },
  {
    id: "NECRON_HANDLE",
    name: "Necron's Handle",
    source: "Catacombs Floor 7 (S+)",
    baseProbability: 1 / 1000,
    baseFractionString: "1 in 1,000",
    icon: "🗡️",
  },
  {
    id: "SCATHA_PET",
    name: "Scatha Pet (Legendary)",
    source: "Crystal Hollows Scatha",
    baseProbability: 1 / 1000,
    baseFractionString: "1 in 1,000",
    icon: "🪱",
  },
  {
    id: "GIANT_SWORD",
    name: "Giant's Sword",
    source: "Catacombs Floor 6 (S+)",
    baseProbability: 1 / 1000,
    baseFractionString: "1 in 1,000",
    icon: "⚔️",
  },
];

export type MagicFindSetup = {
  bestiaryMilestones: number; // +1 MF per 10 milestones
  pet: "none" | "black_cat" | "gdrag" | "griffin";
  petLevel: number;
  hasLuckyClover: boolean; // +5 MF
  hasMinosRelic: boolean; // +33% pet stats
  hasSorrowArmor: boolean; // +60 MF (15 per piece)
  enrichmentsCount: number; // +1 MF per enrichment (up to 30)
  hasBoosterCookie: boolean; // +15 MF
  hasGodPotion: boolean; // +75 MF
  hasBeacon5: boolean; // +5 MF
};

export type DropChanceResult = {
  drop: RareDropDefinition;
  adjustedProbability: number;
  adjustedFraction: string;
  expectedKillsToDrop: number;
  percentageChance: number;
};

export type MagicFindRollup = {
  totalMagicFind: number;
  breakdown: {
    base: number;
    bestiary: number;
    pet: number;
    petItem: number;
    armor: number;
    enrichments: number;
    buffs: number;
    beacon: number;
  };
  drops: DropChanceResult[];
};

export const DEFAULT_MF_SETUP: MagicFindSetup = {
  bestiaryMilestones: 15,
  pet: "gdrag",
  petLevel: 200,
  hasLuckyClover: false,
  hasMinosRelic: true,
  hasSorrowArmor: true,
  enrichmentsCount: 25,
  hasBoosterCookie: true,
  hasGodPotion: true,
  hasBeacon5: true,
};

export function calculateMagicFind(setup: MagicFindSetup = DEFAULT_MF_SETUP): MagicFindRollup {
  const base = 10;
  const bestiary = Math.floor(setup.bestiaryMilestones / 10);

  let pet = 0;
  if (setup.pet === "black_cat") {
    pet = 15;
  } else if (setup.pet === "gdrag") {
    pet = Math.round(setup.petLevel * 0.25); // +50 MF at level 200
  } else if (setup.pet === "griffin") {
    pet = 10;
  }

  if (setup.hasMinosRelic) {
    pet = Math.round(pet * 1.33);
  }

  const petItem = setup.hasLuckyClover ? 5 : 0;
  const armor = setup.hasSorrowArmor ? 60 : 0;
  const enrichments = Math.min(35, setup.enrichmentsCount);
  const buffs = (setup.hasBoosterCookie ? 15 : 0) + (setup.hasGodPotion ? 75 : 0);
  const beacon = setup.hasBeacon5 ? 5 : 0;

  const totalMagicFind = base + bestiary + pet + petItem + armor + enrichments + buffs + beacon;

  const drops: DropChanceResult[] = RARE_DROPS.map((drop) => {
    const adjustedProbability = drop.baseProbability * (1 + totalMagicFind / 100);
    const expectedKillsToDrop = Math.round(1 / adjustedProbability);
    const percentageChance = Math.round(adjustedProbability * 100000) / 1000;

    return {
      drop,
      adjustedProbability,
      adjustedFraction: `1 in ${expectedKillsToDrop.toLocaleString()}`,
      expectedKillsToDrop,
      percentageChance,
    };
  });

  return {
    totalMagicFind,
    breakdown: {
      base,
      bestiary,
      pet,
      petItem,
      armor,
      enrichments,
      buffs,
      beacon,
    },
    drops,
  };
}

