import { performProfileAudit, type AdvisorPlayerInput } from "./advisor-engine";

export type BossTierAudit = {
  tier: number;
  name: string;
  recommendedCata: number;
  recommendedCombat: number;
  recommendedMp: number;
  recommendedEhp: number;
  qualified: boolean;
  scorePct: number;
  missingRequirements: string[];
  keyStrategies: string[];
  optimalLoadout: {
    weapon: string;
    armor: string;
    pet: string;
    utility: string[];
  };
};

export type KuudraRoleAudit = {
  roleName: "DPS" | "Stunner" | "Cannon" | "Specialist";
  qualified: boolean;
  scorePct: number;
  description: string;
  requiredGear: string[];
  playerOwnedGear: string[];
  missingGear: string[];
  expectedProfitPerKeyCoins: number;
};

export function auditVoidgloomReadiness(player?: AdvisorPlayerInput | null | undefined): {
  overallScore: number;
  highestQualifiedTier: number;
  tiers: BossTierAudit[];
} {
  const audit = performProfileAudit(player);
  const combatLvl = 45; // Default approximation
  const cataLvl = player?.dungeons?.catacombsLevel ?? 0;
  const mp = audit.mpAudit.currentMp > 0 ? audit.mpAudit.currentMp : 550;

  const tiers: BossTierAudit[] = [
    {
      tier: 1,
      name: "Voidgloom T1 (Decaying)",
      recommendedCata: 12,
      recommendedCombat: 20,
      recommendedMp: 200,
      recommendedEhp: 35_000,
      qualified: combatLvl >= 18 && mp >= 150,
      scorePct: Math.min(100, Math.round(((combatLvl + mp / 10) / 40) * 100)),
      missingRequirements: mp < 150 ? ["Reach at least 150 Magical Power"] : [],
      keyStrategies: [
        "Use Void Sword or Aspect of the Dragons",
        "Wand of Healing for continuous regeneration",
        "Look away from Ender Nodes to avoid stray damage",
      ],
      optimalLoadout: {
        weapon: "Voidedge Katana / Void Sword",
        armor: "Ender Armor / Young Dragon Armor",
        pet: "Enderman Pet (Rare+)",
        utility: ["Wand of Healing", "Radiant Power Orb"],
      },
    },
    {
      tier: 2,
      name: "Voidgloom T2 (Furious)",
      recommendedCata: 20,
      recommendedCombat: 28,
      recommendedMp: 380,
      recommendedEhp: 120_000,
      qualified: combatLvl >= 25 && mp >= 350,
      scorePct: Math.min(100, Math.round(((combatLvl + mp / 10) / 65) * 100)),
      missingRequirements: [
        ...(mp < 350 ? ["Reach at least 350 Magical Power"] : []),
        ...(combatLvl < 25 ? ["Combat Level 25+"] : []),
      ],
      keyStrategies: [
        "Summon souls (Tank Zombies) via Necromancer Sword to shred 30 hitsphase instantly",
        "Place Mana Flux Power Orb for 50% mana regen & healing",
        "Avoid standing in beacons thrown by the boss",
      ],
      optimalLoadout: {
        weapon: "Vorpal Katana (5★, Syphon IV)",
        armor: "3/4 Shadow Assassin + Reaper Mask",
        pet: "Level 80+ Epic Baby Yeti or Legendary Enderman",
        utility: ["Wand of Restoration", "Mana Flux Power Orb", "Necromancer Sword"],
      },
    },
    {
      tier: 3,
      name: "Voidgloom T3 (Terrifying)",
      recommendedCata: 28,
      recommendedCombat: 38,
      recommendedMp: 550,
      recommendedEhp: 350_000,
      qualified: combatLvl >= 35 && mp >= 500,
      scorePct: Math.min(100, Math.round(((combatLvl + mp / 10) / 90) * 100)),
      missingRequirements: [
        ...(mp < 500 ? ["Reach at least 500 Magical Power"] : []),
        ...(combatLvl < 35 ? ["Combat Level 35+"] : []),
      ],
      keyStrategies: [
        "Reaper Scythe with Master Mode Tank Zombie souls for 60 hitsphase reduction",
        "Overflux Power Orb + Wand of Atonement active at all times",
        "Activate Final Destination Armor full set ability with 25,000 kills minimum",
      ],
      optimalLoadout: {
        weapon: "Vorpal / Atomsplit Katana (5★)",
        armor: "Final Destination Armor (25k-50k Kills, Wisdom V)",
        pet: "Level 100 Mythic Enderman Pet",
        utility: ["Wand of Atonement", "Overflux Power Orb", "Reaper Scythe"],
      },
    },
    {
      tier: 4,
      name: "Voidgloom T4 (Infernal)",
      recommendedCata: 35,
      recommendedCombat: 45,
      recommendedMp: 800,
      recommendedEhp: 750_000,
      qualified: combatLvl >= 42 && mp >= 750 && cataLvl >= 30,
      scorePct: Math.min(100, Math.round(((combatLvl + mp / 10 + cataLvl) / 160) * 100)),
      missingRequirements: [
        ...(mp < 750 ? ["Reach at least 750 Magical Power for Ferocity"] : []),
        ...(cataLvl < 30 ? ["Catacombs 30+ for base EHP"] : []),
      ],
      keyStrategies: [
        "Atomsplit Katana ferocity ability + Soulcry active on cooldown",
        "Wither Shield (Hyperion/Astraea) spamming every 5 seconds for shield absorption",
        "High Ferocity build (150+ Ferocity) to bypass beacon countdown",
      ],
      optimalLoadout: {
        weapon: "Atomsplit Katana (5★, T7 Enchants) & Hyperion/Astraea",
        armor: "Final Destination Armor (100k Kills) or Crimson Armor (10★)",
        pet: "Level 100 Ender Dragon or Level 200 Golden Dragon",
        utility: ["Plasmaflux Power Orb", "Wand of Atonement", "Reaper Scythe", "Ender Artifact"],
      },
    },
  ];

  let highestTier = 0;
  for (const t of tiers) {
    if (t.qualified) highestTier = t.tier;
  }

  const overallScore = Math.round(
    tiers.reduce((acc, curr) => acc + curr.scorePct, 0) / tiers.length,
  );

  return {
    overallScore,
    highestQualifiedTier: highestTier,
    tiers,
  };
}

export function auditKuudraReadiness(player?: AdvisorPlayerInput | null | undefined): {
  roles: KuudraRoleAudit[];
  recommendedRole: string;
  expectedNetProfitPerHour: number;
} {
  const cata = player?.dungeons?.catacombsLevel ?? 25;
  const sbLevel = player ? 180 : 120;

  const roles: KuudraRoleAudit[] = [
    {
      roleName: "DPS",
      qualified: cata >= 34 && sbLevel >= 180,
      scorePct: Math.min(100, Math.round(((cata + sbLevel / 5) / 70) * 100)),
      description:
        "Deals primary damage to Kuudra's tentacles and core with Duplex/Fatal Tempo Terminator.",
      requiredGear: [
        "Terminator (Fatal Tempo V or Duplex V)",
        "3/4 Infernal/Fiery Terror Armor (10★)",
        "Golden Dragon (Level 200) + 1B Bank",
        "850+ Magical Power",
      ],
      playerOwnedGear: ["Terminator (5★)"],
      missingGear: ["Fatal Tempo V", "Infernal Terror Armor 10★"],
      expectedProfitPerKeyCoins: 4_500_000,
    },
    {
      roleName: "Stunner",
      qualified: true,
      scorePct: 90,
      description:
        "Quickly dashes inside Kuudra, places the bomb, and mines the pods in under 12 seconds.",
      requiredGear: [
        "500% Max Speed Cap (Black Cat / Rogue Sword)",
        "Spring Boots or Bonzo Staff",
        "High EHP Armor (Goldor or Crimson)",
      ],
      playerOwnedGear: ["Rogue Sword", "Spring Boots"],
      missingGear: [],
      expectedProfitPerKeyCoins: 4_200_000,
    },
    {
      roleName: "Cannon",
      qualified: true,
      scorePct: 85,
      description: "Fires ballistas and handles fuel supplies efficiently to protect the center.",
      requiredGear: [
        "Full Mana Armor (Aurora / Storm)",
        "Hyperion or Spirit Sceptre",
        "Wither Cloak Sword",
      ],
      playerOwnedGear: ["Storm Armor", "Wither Cloak Sword"],
      missingGear: [],
      expectedProfitPerKeyCoins: 4_000_000,
    },
    {
      roleName: "Specialist",
      qualified: cata >= 30,
      scorePct: 80,
      description: "Retrieves fuel cells and manages Kuudra pet drops.",
      requiredGear: ["Level 100 Kuudra Pet", "Gyrokinetic Wand", "Florid Zombie Sword"],
      playerOwnedGear: ["Florid Zombie Sword"],
      missingGear: ["Level 100 Kuudra Pet"],
      expectedProfitPerKeyCoins: 3_900_000,
    },
  ];

  return {
    roles,
    recommendedRole: "Stunner",
    expectedNetProfitPerHour: 28_000_000, // Based on 6-7 runs/hr
  };
}
