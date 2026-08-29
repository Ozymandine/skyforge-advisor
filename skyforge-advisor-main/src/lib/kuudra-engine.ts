// src/lib/kuudra-engine.ts
// Comprehensive Crimson Isle & Kuudra Specialization Engine:
// Faction reputation tiers, Kuudra T1-T5 tier gateways, Heavy Pearl / Matriarch timers,
// Crimson armor tier-up star calculator, and Kuudra chest key EV profitability.

import { formatFull, formatNumber } from "./skyblock";

// ---------------------------------------------------------------------------
// T3.01: FACTION REPUTATION & DAILY QUESTS
// ---------------------------------------------------------------------------

export type FactionType = "MAGE" | "BARBARIAN";

export type FactionReputationTier = {
  tier: string;
  minRep: number;
  maxRep: number;
  perks: string[];
};

export const FACTION_TIERS: FactionReputationTier[] = [
  { tier: "Novice", minRep: 0, maxRep: 3000, perks: ["Town entrance", "Basic vendor access"] },
  {
    tier: "Recognized",
    minRep: 3000,
    maxRep: 7000,
    perks: ["Daily quest tier 2", "Corrupted bait recipe"],
  },
  {
    tier: "Trusted",
    minRep: 7000,
    maxRep: 12000,
    perks: ["Faction armor reforge access", "Guard non-aggro"],
  },
  {
    tier: "Respected",
    minRep: 12000,
    maxRep: 18000,
    perks: ["Kuudra T3 key craft unlock", "Trophy fish fillets +10%"],
  },
  {
    tier: "Exalted",
    minRep: 18000,
    maxRep: 24000,
    perks: ["Kuudra T4 key craft unlock", "Town council perks"],
  },
  {
    tier: "Overlord",
    minRep: 24000,
    maxRep: 27000,
    perks: ["Kuudra T5 Infernal unlock", "Maxed faction passives"],
  },
];

export function getFactionStatus(reputation = 12500, faction: FactionType = "MAGE") {
  const currentTier =
    FACTION_TIERS.slice()
      .reverse()
      .find((t) => reputation >= t.minRep) ?? FACTION_TIERS[0]!;
  const nextTier = FACTION_TIERS.find((t) => t.minRep > reputation);
  const repToNext = nextTier ? nextTier.minRep - reputation : 0;

  return {
    faction,
    reputation,
    tierName: currentTier.tier,
    perks: currentTier.perks,
    repToNext,
    isMaxed: !nextTier,
  };
}

// ---------------------------------------------------------------------------
// T3.02: KUUDRA TIER GATEWAYS (T1 - T5)
// ---------------------------------------------------------------------------

export type KuudraTierDefinition = {
  tierNumber: 1 | 2 | 3 | 4 | 5;
  name: "Basic" | "Hot" | "Burning" | "Fiery" | "Infernal";
  combatRequirement: number;
  recommendedArmor: string;
  requiredWeapons: string[];
  keyCostCoins: number;
  expectedProfitPerRun: number;
};

export const KUUDRA_TIERS: KuudraTierDefinition[] = [
  {
    tierNumber: 1,
    name: "Basic",
    combatRequirement: 22,
    recommendedArmor: "Base Crimson / Aurora / Terror",
    requiredWeapons: ["Juju Shortbow", "Spirit Sceptre / Midas Staff"],
    keyCostCoins: 80_000,
    expectedProfitPerRun: 450_000,
  },
  {
    tierNumber: 2,
    name: "Hot",
    combatRequirement: 24,
    recommendedArmor: "Hot Tier 10★ Armor",
    requiredWeapons: ["Hyperion / Terminator", "Wither Cloak Sword"],
    keyCostCoins: 250_000,
    expectedProfitPerRun: 1_200_000,
  },
  {
    tierNumber: 3,
    name: "Burning",
    combatRequirement: 28,
    recommendedArmor: "Burning Tier 10★ Armor",
    requiredWeapons: ["Hyperion", "Terminator", "Gyrokinetic Wand", "Wither Cloak Sword"],
    keyCostCoins: 750_000,
    expectedProfitPerRun: 3_100_000,
  },
  {
    tierNumber: 4,
    name: "Fiery",
    combatRequirement: 32,
    recommendedArmor: "Fiery Tier 10★ Armor",
    requiredWeapons: ["Hyperion", "Terminator", "Precursor Eye", "Gyrokinetic Wand"],
    keyCostCoins: 2_200_000,
    expectedProfitPerRun: 7_800_000,
  },
  {
    tierNumber: 5,
    name: "Infernal",
    combatRequirement: 36,
    recommendedArmor: "Infernal Tier 10★ (God Roll Mana Pool/Veteran)",
    requiredWeapons: [
      "Hyperion",
      "Terminator (Duplex/Fatal)",
      "Precursor Eye",
      "Wither Cloak",
      "Edrag / GDrag 200",
    ],
    keyCostCoins: 6_500_000,
    expectedProfitPerRun: 24_000_000,
  },
];

export type KuudraReadiness = {
  tier: KuudraTierDefinition;
  qualified: boolean;
  missingRequirements: string[];
  readinessPct: number;
};

export function evaluateKuudraReadiness(
  combatLevel: number,
  hasHyperion: boolean,
  hasTerminator: boolean,
  hasWitherCloak: boolean,
  hasGyro: boolean,
): KuudraReadiness[] {
  return KUUDRA_TIERS.map((kt) => {
    const missing: string[] = [];
    let points = 0;
    const maxPoints = 5;

    if (combatLevel >= kt.combatRequirement) points++;
    else missing.push(`Combat Level ${kt.combatRequirement}+ (Current: ${combatLevel})`);

    if (kt.tierNumber >= 2) {
      if (hasHyperion || hasTerminator) points++;
      else missing.push("Hyperion or Terminator");
    } else {
      points++;
    }

    if (kt.tierNumber >= 3) {
      if (hasWitherCloak) points++;
      else missing.push("Wither Cloak Sword");

      if (hasGyro) points++;
      else missing.push("Gyrokinetic Wand");
    } else {
      points += 2;
    }

    if (kt.tierNumber >= 4) {
      if (hasHyperion && hasTerminator) points++;
      else missing.push("Both Hyperion AND Terminator required");
    } else {
      points++;
    }

    const readinessPct = Math.round((points / maxPoints) * 100);

    return {
      tier: kt,
      qualified: missing.length === 0,
      missingRequirements: missing,
      readinessPct,
    };
  });
}

// ---------------------------------------------------------------------------
// T3.04: CRIMSON ARMOR TIER-UP ENGINE
// ---------------------------------------------------------------------------

export type ArmorTierProgression = {
  tierName: "Base" | "Hot" | "Burning" | "Fiery" | "Infernal";
  crimsonEssenceCost: number;
  kuudraTeethCost: number;
  heavyPearlsCost: number;
  coinsValue: number;
};

export const CRIMSON_ARMOR_TIERS: ArmorTierProgression[] = [
  {
    tierName: "Base",
    crimsonEssenceCost: 2500,
    kuudraTeethCost: 0,
    heavyPearlsCost: 0,
    coinsValue: 12_000_000,
  },
  {
    tierName: "Hot",
    crimsonEssenceCost: 7500,
    kuudraTeethCost: 20,
    heavyPearlsCost: 10,
    coinsValue: 45_000_000,
  },
  {
    tierName: "Burning",
    crimsonEssenceCost: 18000,
    kuudraTeethCost: 60,
    heavyPearlsCost: 30,
    coinsValue: 140_000_000,
  },
  {
    tierName: "Fiery",
    crimsonEssenceCost: 45000,
    kuudraTeethCost: 160,
    heavyPearlsCost: 80,
    coinsValue: 450_000_000,
  },
  {
    tierName: "Infernal",
    crimsonEssenceCost: 120000,
    kuudraTeethCost: 400,
    heavyPearlsCost: 200,
    coinsValue: 1_400_000_000,
  },
];

// ---------------------------------------------------------------------------
// T3.05: KUUDRA CHEST PROFITABILITY & KEY EV
// ---------------------------------------------------------------------------

export type KuudraChestDrop = {
  name: string;
  dropChance: string;
  marketValue: number;
};

export const KUUDRA_T5_CHEST_DROPS: KuudraChestDrop[] = [
  {
    name: "God Roll Shard (Mana Pool X / Veteran X)",
    dropChance: "0.8%",
    marketValue: 650_000_000,
  },
  { name: "Kuudra Mandible", dropChance: "2.0%", marketValue: 85_000_000 },
  { name: "Wheel of Fate", dropChance: "5.0%", marketValue: 24_000_000 },
  { name: "Kuudra Follower Relic", dropChance: "1.5%", marketValue: 45_000_000 },
  { name: "Attribute Shard (Dominance / Vitality)", dropChance: "15.0%", marketValue: 18_000_000 },
];
