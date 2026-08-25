// src/lib/fishing-calculator.ts
// Comprehensive Crimson Isle Trophy Fish & Sea Creature Suite:
// Sea Creature Chance (SCC), fishing speed ticks, and all 18 Trophy Fish species tracker.

export type TrophyTier = "BRONZE" | "SILVER" | "GOLD" | "DIAMOND";

export type TrophyFishSpecies = {
  id: string;
  name: string;
  rarity: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";
  location: string;
  specialCondition: string;
  filletValue: number;
};

export const TROPHY_FISH_SPECIES: TrophyFishSpecies[] = [
  { id: "blobfish", name: "Blobfish", rarity: "COMMON", location: "Anywhere", specialCondition: "None", filletValue: 1 },
  { id: "gusher", name: "Gusher", rarity: "COMMON", location: "Anywhere", specialCondition: "Cast into erupting volcano", filletValue: 2 },
  { id: "steaming_hot_flounder", name: "Steaming Hot Flounder", rarity: "COMMON", location: "Volcano", specialCondition: "None", filletValue: 2 },
  { id: "slugfish", name: "Slugfish", rarity: "UNCOMMON", location: "Anywhere", specialCondition: "Bobber in lava for 20+ seconds", filletValue: 5 },
  { id: "flyfish", name: "Flyfish", rarity: "UNCOMMON", location: "Anywhere", specialCondition: "Fish while 8+ blocks above lava", filletValue: 5 },
  { id: "obfuscated_1", name: "Obfuscated 1", rarity: "UNCOMMON", location: "Anywhere", specialCondition: "Use Corrupted Bait", filletValue: 5 },
  { id: "lavahorse", name: "Lavahorse", rarity: "RARE", location: "Anywhere", specialCondition: "None", filletValue: 10 },
  { id: "mana_ray", name: "Mana Ray", rarity: "RARE", location: "Mage Outpost", specialCondition: "Requires 1,200+ Mana", filletValue: 15 },
  { id: "volcanic_stonefish", name: "Volcanic Stonefish", rarity: "RARE", location: "Inside Volcano", specialCondition: "None", filletValue: 15 },
  { id: "vanille", name: "Vanille", rarity: "RARE", location: "Anywhere", specialCondition: "Use Starter Lava Rod", filletValue: 20 },
  { id: "skeleton_fish", name: "Skeleton Fish", rarity: "RARE", location: "Anywhere", specialCondition: "None", filletValue: 20 },
  { id: "moldfin", name: "Moldfin", rarity: "RARE", location: "Mystic Marsh", specialCondition: "None", filletValue: 25 },
  { id: "soul_fish", name: "Soul Fish", rarity: "RARE", location: "Stronghold", specialCondition: "None", filletValue: 25 },
  { id: "obfuscated_2", name: "Obfuscated 2", rarity: "EPIC", location: "Anywhere", specialCondition: "Use Obfuscated 1 as bait", filletValue: 30 },
  { id: "obfuscated_3", name: "Obfuscated 3", rarity: "EPIC", location: "Anywhere", specialCondition: "Use Obfuscated 2 as bait", filletValue: 50 },
  { id: "karate_fish", name: "Karate Fish", rarity: "EPIC", location: "Dojo", specialCondition: "Wear Black Belt", filletValue: 50 },
  { id: "golden_fish", name: "Golden Fish", rarity: "LEGENDARY", location: "Anywhere", specialCondition: "Cast every 15-20 minutes when Golden Fish spawns", filletValue: 100 },
];

export type TrophyHunterRank = "Novice" | "Adept" | "Expert" | "Master" | "Diamond Hunter";

export type TrophyFishProgress = {
  species: TrophyFishSpecies;
  highestTier: TrophyTier | null;
  counts: Record<TrophyTier, number>;
  totalCaught: number;
};

export type TrophyOverviewResult = {
  totalCaught: number;
  uniqueSpecies: number;
  diamondTierCount: number;
  goldTierCount: number;
  silverTierCount: number;
  bronzeTierCount: number;
  odgerRank: TrophyHunterRank;
  trophyProgress: TrophyFishProgress[];
};

export function calculateTrophyProgress(
  rawCatches: Record<string, number> = {},
): TrophyOverviewResult {
  let totalCaught = 0;
  let bronzeCount = 0;
  let silverCount = 0;
  let goldCount = 0;
  let diamondCount = 0;

  const trophyProgress: TrophyFishProgress[] = TROPHY_FISH_SPECIES.map((species) => {
    const bronze = rawCatches[`${species.id}_bronze`] ?? rawCatches[species.id] ?? 0;
    const silver = rawCatches[`${species.id}_silver`] ?? 0;
    const gold = rawCatches[`${species.id}_gold`] ?? 0;
    const diamond = rawCatches[`${species.id}_diamond`] ?? 0;

    const speciesTotal = bronze + silver + gold + diamond;
    totalCaught += speciesTotal;

    if (diamond > 0) diamondCount++;
    if (gold > 0) goldCount++;
    if (silver > 0) silverCount++;
    if (bronze > 0) bronzeCount++;

    let highestTier: TrophyTier | null = null;
    if (diamond > 0) highestTier = "DIAMOND";
    else if (gold > 0) highestTier = "GOLD";
    else if (silver > 0) highestTier = "SILVER";
    else if (bronze > 0) highestTier = "BRONZE";

    return {
      species,
      highestTier,
      counts: {
        BRONZE: bronze,
        SILVER: silver,
        GOLD: gold,
        DIAMOND: diamond,
      },
      totalCaught: speciesTotal,
    };
  });

  const uniqueSpecies = trophyProgress.filter((p) => p.totalCaught > 0).length;

  let odgerRank: TrophyHunterRank = "Novice";
  if (diamondCount >= 17) odgerRank = "Diamond Hunter";
  else if (goldCount >= 17) odgerRank = "Master";
  else if (silverCount >= 17) odgerRank = "Expert";
  else if (bronzeCount >= 17) odgerRank = "Adept";

  return {
    totalCaught,
    uniqueSpecies,
    diamondTierCount: diamondCount,
    goldTierCount: goldCount,
    silverTierCount: silverCount,
    bronzeTierCount: bronzeCount,
    odgerRank,
    trophyProgress,
  };
}
