// src/lib/leaderboards.ts
// Global SkyBlock Leaderboard Engine:
// Curated Hall of Fame (Technoblade Potato War, DeathStreeks Cata, Swavy Net Worth),
// Collections, Skills, Dungeons, Slayers, and live player rank/percentile calculator.

import { formatNumber, type PlayerData } from "./skyblock";

export type LeaderboardCategory =
  | "collections"
  | "skills"
  | "dungeons"
  | "slayers"
  | "economy";

export interface LeaderboardEntry {
  rank: number;
  username: string;
  uuid: string;
  hypixelRank?: string;
  value: number;
  formattedValue: string;
  subValue?: string;
  tag?: string;
  isHallOfFame?: boolean;
}

export interface LeaderboardSubcategory {
  id: string;
  name: string;
  category: LeaderboardCategory;
  unit: string;
  iconId: string;
  description: string;
  topPlayers: LeaderboardEntry[];
  thresholds: {
    top001: number;
    top01: number;
    top1: number;
    top5: number;
    top10: number;
  };
}

export const LEADERBOARD_SUBCATEGORIES: LeaderboardSubcategory[] = [
  {
    id: "potato",
    name: "Potato Collection (Potato War)",
    category: "collections",
    unit: "potatoes",
    iconId: "POTATO_ITEM",
    description: "The most legendary collection battle in SkyBlock history between Technoblade and Im_a_squid_kid.",
    topPlayers: [
      {
        rank: 1,
        username: "Technoblade",
        uuid: "b876ec32e396476ba1158438d83c67d4",
        hypixelRank: "PIG+++",
        value: 500_000_000,
        formattedValue: "500,000,000",
        subValue: "The Potato King 👑",
        tag: "WAR CHAMPION",
        isHallOfFame: true,
      },
      {
        rank: 2,
        username: "Im_a_squid_kid",
        uuid: "b67272a8c3d84384a275466e3b5278df",
        hypixelRank: "YOUTUBE",
        value: 418_000_000,
        formattedValue: "418,000,000",
        subValue: "Potato War Runner Up",
        tag: "WAR VETERAN",
        isHallOfFame: true,
      },
      {
        rank: 3,
        username: "TimeDeo",
        uuid: "20934ef9488c46da910f1b9fb92f0b0e",
        hypixelRank: "YOUTUBE",
        value: 120_000_000,
        formattedValue: "120,000,000",
        subValue: "All 50 Fairy Souls",
      },
      {
        rank: 4,
        username: "ThirtyVirus",
        uuid: "1b93f2f814524c529dfb2d69f061dc13",
        hypixelRank: "YOUTUBE",
        value: 95_400_000,
        formattedValue: "95,400,000",
        subValue: "Solo Profile",
      },
      {
        rank: 5,
        username: "Refraction",
        uuid: "00000000000000000000000000000001",
        hypixelRank: "MVP_PLUS_PLUS",
        value: 78_200_000,
        formattedValue: "78,200,000",
        subValue: "Potato Wizard",
      },
    ],
    thresholds: {
      top001: 50_000_000,
      top01: 15_000_000,
      top1: 3_000_000,
      top5: 500_000,
      top10: 100_000,
    },
  },
  {
    id: "sugar_cane",
    name: "Sugar Cane Collection",
    category: "collections",
    unit: "sugar cane",
    iconId: "SUGAR_CANE",
    description: "Speed & Alchemy powerhouses harvesting billions of enchanted sugar cane.",
    topPlayers: [
      {
        rank: 1,
        username: "SpeedFarmer99",
        uuid: "00000000000000000000000000000002",
        hypixelRank: "MVP_PLUS",
        value: 840_000_000,
        formattedValue: "840,000,000",
        subValue: "Farming 60 #1",
      },
      {
        rank: 2,
        username: "CaneGrinder",
        uuid: "00000000000000000000000000000003",
        hypixelRank: "MVP_PLUS_PLUS",
        value: 720_000_000,
        formattedValue: "720,000,000",
        subValue: "Garden Lv 15",
      },
      {
        rank: 3,
        username: "SweetTooth",
        uuid: "00000000000000000000000000000004",
        hypixelRank: "VIP_PLUS",
        value: 650_000_000,
        formattedValue: "650,000,000",
        subValue: "1.4k Farming Fortune",
      },
    ],
    thresholds: {
      top001: 100_000_000,
      top01: 25_000_000,
      top1: 5_000_000,
      top5: 1_000_000,
      top10: 250_000,
    },
  },
  {
    id: "mithril",
    name: "Mithril Collection",
    category: "collections",
    unit: "mithril",
    iconId: "MITHRIL_ORE",
    description: "Dwarven Mines excavation leaders mining pure Mithril with maxed Divan sets.",
    topPlayers: [
      {
        rank: 1,
        username: "MithrilKing",
        uuid: "00000000000000000000000000000005",
        hypixelRank: "MVP_PLUS_PLUS",
        value: 450_000_000,
        formattedValue: "450,000,000",
        subValue: "HOTM 10 • 12M Powder",
      },
      {
        rank: 2,
        username: "DwarvenDrill",
        uuid: "00000000000000000000000000000006",
        hypixelRank: "MVP_PLUS",
        value: 380_000_000,
        formattedValue: "380,000,000",
        subValue: "Divan Drill Maxed",
      },
      {
        rank: 3,
        username: "BlueCheese",
        uuid: "00000000000000000000000000000007",
        hypixelRank: "VIP",
        value: 290_000_000,
        formattedValue: "290,000,000",
        subValue: "Peak of the Mountain 10",
      },
    ],
    thresholds: {
      top001: 50_000_000,
      top01: 12_000_000,
      top1: 2_500_000,
      top5: 600_000,
      top10: 150_000,
    },
  },
  {
    id: "skill_average",
    name: "Skill Average Leaderboard",
    category: "skills",
    unit: "average lvl",
    iconId: "EXPERIENCE_BOTTLE",
    description: "The absolute masters of SkyBlock progression across all 9 skills (Max 56.75).",
    topPlayers: [
      {
        rank: 1,
        username: "DeathStreeks",
        uuid: "8667ba71b85a4004af54457a9734eed7",
        hypixelRank: "MVP_PLUS_PLUS",
        value: 56.75,
        formattedValue: "56.75",
        subValue: "All Skills Overflow XP",
        tag: "MAX OVERFLOW",
        isHallOfFame: true,
      },
      {
        rank: 2,
        username: "Minikloon",
        uuid: "069a79f444e94726a5befca90e38aaf5",
        hypixelRank: "ADMIN",
        value: 56.75,
        formattedValue: "56.75",
        subValue: "Hypixel Lead Dev",
        tag: "HYPIXEL ADMIN",
        isHallOfFame: true,
      },
      {
        rank: 3,
        username: "Linman",
        uuid: "00000000000000000000000000000009",
        hypixelRank: "MVP_PLUS",
        value: 56.75,
        formattedValue: "56.75",
        subValue: "First 50 SA Player",
        tag: "FIRST TO 50 SA",
        isHallOfFame: true,
      },
    ],
    thresholds: {
      top001: 56.5,
      top01: 55.0,
      top1: 50.0,
      top5: 42.0,
      top10: 35.0,
    },
  },
  {
    id: "catacombs_level",
    name: "Catacombs XP Leaderboard",
    category: "dungeons",
    unit: "Cata XP",
    iconId: "WITHER_SKULL",
    description: "The fastest dungeon crawlers clearing Master Mode Floor 7 in sub-4 minutes.",
    topPlayers: [
      {
        rank: 1,
        username: "DeathStreeks",
        uuid: "8667ba71b85a4004af54457a9734eed7",
        hypixelRank: "MVP_PLUS_PLUS",
        value: 1_250_000_000,
        formattedValue: "1.25B XP",
        subValue: "Catacombs 50 • 200k Secrets",
        tag: "CATA KING",
        isHallOfFame: true,
      },
      {
        rank: 2,
        username: "SpeedM7",
        uuid: "00000000000000000000000000000011",
        hypixelRank: "MVP_PLUS_PLUS",
        value: 980_000_000,
        formattedValue: "980M XP",
        subValue: "M7 Record 3:42",
      },
      {
        rank: 3,
        username: "ShadowAssassin",
        uuid: "00000000000000000000000000000012",
        hypixelRank: "MVP_PLUS",
        value: 820_000_000,
        formattedValue: "820M XP",
        subValue: "Terminator Archer Maxed",
      },
    ],
    thresholds: {
      top001: 569_809_640,
      top01: 200_000_000,
      top1: 50_000_000,
      top5: 15_000_000,
      top10: 5_000_000,
    },
  },
  {
    id: "slayer_xp",
    name: "Total Slayer XP Leaderboard",
    category: "slayers",
    unit: "Slayer XP",
    iconId: "DIAMOND_SWORD",
    description: "Revenant, Tarantula, Sven, Voidgloom, Inferno & Vampire slayer champions.",
    topPlayers: [
      {
        rank: 1,
        username: "SlayerGod",
        uuid: "00000000000000000000000000000013",
        hypixelRank: "MVP_PLUS_PLUS",
        value: 65_000_000,
        formattedValue: "65,000,000",
        subValue: "All Slayers Lv 9 • 100k Bosses",
        tag: "ALL LVL 9",
        isHallOfFame: true,
      },
      {
        rank: 2,
        username: "VoidGloom9",
        uuid: "00000000000000000000000000000014",
        hypixelRank: "MVP_PLUS",
        value: 52_000_000,
        formattedValue: "52,000,000",
        subValue: "15x Judgement Cores",
      },
      {
        rank: 3,
        username: "InfernoMaster",
        uuid: "00000000000000000000000000000015",
        hypixelRank: "VIP_PLUS",
        value: 44_000_000,
        formattedValue: "44,000,000",
        subValue: "Blaze Slayer Lv 9",
      },
    ],
    thresholds: {
      top001: 20_000_000,
      top01: 8_000_000,
      top1: 2_500_000,
      top5: 800_000,
      top10: 200_000,
    },
  },
  {
    id: "net_worth",
    name: "Total Net Worth Leaderboard",
    category: "economy",
    unit: "coins",
    iconId: "GOLD_INGOT",
    description: "The wealthiest SkyBlock tycoons holding tens of billions in pure coin value & exotic dyes.",
    topPlayers: [
      {
        rank: 1,
        username: "Swavy",
        uuid: "20526019318b438da062fab8f4f6e1f0",
        hypixelRank: "YOUTUBE",
        value: 120_000_000_000,
        formattedValue: "120 Billion",
        subValue: "Exotic Armor Museum & Sacks",
        tag: "COIN TYCOON",
        isHallOfFame: true,
      },
      {
        rank: 2,
        username: "Refraction",
        uuid: "00000000000000000000000000000001",
        hypixelRank: "MVP_PLUS_PLUS",
        value: 95_000_000_000,
        formattedValue: "95 Billion",
        subValue: "God Potions & Hyperions",
      },
      {
        rank: 3,
        username: "BazaarBaron",
        uuid: "00000000000000000000000000000016",
        hypixelRank: "MVP_PLUS_PLUS",
        value: 80_000_000_000,
        formattedValue: "80 Billion",
        subValue: "10 Billion Purse Cash",
      },
    ],
    thresholds: {
      top001: 30_000_000_000,
      top01: 10_000_000_000,
      top1: 3_000_000_000,
      top5: 1_000_000_000,
      top10: 350_000_000,
    },
  },
];

export interface PlayerStanding {
  subcategoryId: string;
  categoryName: string;
  playerValue: number;
  formattedPlayerValue: string;
  percentileRank: string;
  percentilePct: number;
  badgeTone: "emerald" | "gold" | "sky" | "purple" | "muted";
  approximateRank: string;
  nextTierGoal: {
    tierName: string;
    amountNeeded: number;
    formattedAmountNeeded: string;
  } | null;
}

export function calculatePlayerLeaderboardStandings(player: {
  collections?: { id: string; amount: number }[] | null | undefined;
  skillAverage?: number | null | undefined;
  dungeons?: { catacombsLevel?: number | null | undefined } | null | undefined;
  slayerOverview?: { totalXp?: number | null | undefined } | null | undefined;
  purse?: number | null | undefined;
  bank?: number | null | undefined;
  sacks?: { totalValue?: number | null | undefined } | null | undefined;
}): PlayerStanding[] {
  const standings: PlayerStanding[] = [];

  for (const sub of LEADERBOARD_SUBCATEGORIES) {
    let playerVal = 0;

    switch (sub.id) {
      case "potato":
        playerVal = player.collections?.find((c) => c.id.toUpperCase() === "POTATO_ITEM")?.amount ?? 0;
        break;
      case "sugar_cane":
        playerVal = player.collections?.find((c) => c.id.toUpperCase() === "SUGAR_CANE")?.amount ?? 0;
        break;
      case "mithril":
        playerVal = player.collections?.find((c) => c.id.toUpperCase() === "MITHRIL_ORE")?.amount ?? 0;
        break;
      case "skill_average":
        playerVal = Number((player.skillAverage ?? 0).toFixed(2));
        break;
      case "catacombs_level":
        playerVal = player.dungeons?.catacombsLevel ?? 0;
        break;
      case "slayer_xp":
        playerVal = player.slayerOverview?.totalXp ?? 0;
        break;
      case "net_worth":
        playerVal = (player.purse ?? 0) + (player.bank ?? 0) + (player.sacks?.totalValue ?? 0);
        break;
      default:
        playerVal = 0;
    }

    let percentileRank = "Top 50%";
    let percentilePct = 50;
    let badgeTone: PlayerStanding["badgeTone"] = "muted";
    let approxRank = "#100,000+";
    let nextTierGoal: PlayerStanding["nextTierGoal"] = null;

    if (playerVal >= sub.thresholds.top001) {
      percentileRank = "Top 0.01% (Elite)";
      percentilePct = 0.01;
      badgeTone = "emerald";
      approxRank = "Top #500";
    } else if (playerVal >= sub.thresholds.top01) {
      percentileRank = "Top 0.1% (Grandmaster)";
      percentilePct = 0.1;
      badgeTone = "sky";
      approxRank = "Top #2,500";
      nextTierGoal = {
        tierName: "Top 0.01% (Elite)",
        amountNeeded: sub.thresholds.top001 - playerVal,
        formattedAmountNeeded: formatNumber(sub.thresholds.top001 - playerVal),
      };
    } else if (playerVal >= sub.thresholds.top1) {
      percentileRank = "Top 1% (Master)";
      percentilePct = 1.0;
      badgeTone = "purple";
      approxRank = "Top #15,000";
      nextTierGoal = {
        tierName: "Top 0.1% (Grandmaster)",
        amountNeeded: sub.thresholds.top01 - playerVal,
        formattedAmountNeeded: formatNumber(sub.thresholds.top01 - playerVal),
      };
    } else if (playerVal >= sub.thresholds.top5) {
      percentileRank = "Top 5% (Diamond)";
      percentilePct = 5.0;
      badgeTone = "gold";
      approxRank = "Top #50,000";
      nextTierGoal = {
        tierName: "Top 1% (Master)",
        amountNeeded: sub.thresholds.top1 - playerVal,
        formattedAmountNeeded: formatNumber(sub.thresholds.top1 - playerVal),
      };
    } else if (playerVal >= sub.thresholds.top10) {
      percentileRank = "Top 10% (Gold)";
      percentilePct = 10.0;
      badgeTone = "gold";
      approxRank = "Top #100,000";
      nextTierGoal = {
        tierName: "Top 5% (Diamond)",
        amountNeeded: sub.thresholds.top5 - playerVal,
        formattedAmountNeeded: formatNumber(sub.thresholds.top5 - playerVal),
      };
    } else {
      nextTierGoal = {
        tierName: "Top 10% (Gold)",
        amountNeeded: Math.max(0, sub.thresholds.top10 - playerVal),
        formattedAmountNeeded: formatNumber(Math.max(0, sub.thresholds.top10 - playerVal)),
      };
    }

    standings.push({
      subcategoryId: sub.id,
      categoryName: sub.name,
      playerValue: playerVal,
      formattedPlayerValue: formatNumber(playerVal),
      percentileRank,
      percentilePct,
      badgeTone,
      approximateRank: approxRank,
      nextTierGoal,
    });
  }

  return standings;
}
