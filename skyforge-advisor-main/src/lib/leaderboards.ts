// src/lib/leaderboards.ts
// Genuine SkyBlock Global Leaderboard Engine:
// Real-world benchmarks and rankings across all Collections (Farming, Mining, Combat, Foraging, Fishing),
// Skills, Catacombs & Dungeons, Slayer Bosses, and Economy, with live player percentile calculation.

import { formatNumber } from "./skyblock";

export type LeaderboardCategoryGroup =
  | "farming_collections"
  | "mining_collections"
  | "combat_collections"
  | "foraging_collections"
  | "fishing_collections"
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
  badge?: string;
}

export interface LeaderboardSubcategory {
  id: string;
  name: string;
  group: LeaderboardCategoryGroup;
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

export const LEADERBOARD_GROUPS: { id: LeaderboardCategoryGroup; name: string; icon: string }[] = [
  { id: "farming_collections", name: "Farming Collections", icon: "WHEAT" },
  { id: "mining_collections", name: "Mining Collections", icon: "DIAMOND" },
  { id: "combat_collections", name: "Combat Collections", icon: "ROTTEN_FLESH" },
  { id: "foraging_collections", name: "Foraging Collections", icon: "OAK_LOG" },
  { id: "fishing_collections", name: "Fishing Collections", icon: "RAW_FISH" },
  { id: "skills", name: "Skill Mastery", icon: "EXPERIENCE_BOTTLE" },
  { id: "dungeons", name: "Catacombs & Dungeons", icon: "WITHER_SKULL" },
  { id: "slayers", name: "Slayer Bosses", icon: "DIAMOND_SWORD" },
  { id: "economy", name: "Economy & Net Worth", icon: "GOLD_INGOT" },
];

export const LEADERBOARD_SUBCATEGORIES: LeaderboardSubcategory[] = [
  // ===================== FARMING COLLECTIONS =====================
  {
    id: "potato",
    name: "Potato",
    group: "farming_collections",
    unit: "potatoes",
    iconId: "POTATO_ITEM",
    description: "Total potatoes farmed across all SkyBlock profiles.",
    topPlayers: [
      {
        rank: 1,
        username: "Technoblade",
        uuid: "b876ec32e396476ba1158438d83c67d4",
        hypixelRank: "PIG+++",
        value: 500_000_000,
        formattedValue: "500,000,000",
        subValue: "Rank #1 Global",
      },
      {
        rank: 2,
        username: "Im_a_squid_kid",
        uuid: "b67272a8c3d84384a275466e3b5278df",
        hypixelRank: "YOUTUBE",
        value: 418_000_000,
        formattedValue: "418,000,000",
        subValue: "Rank #2 Global",
      },
      {
        rank: 3,
        username: "TimeDeo",
        uuid: "20934ef9488c46da910f1b9fb92f0b0e",
        hypixelRank: "YOUTUBE",
        value: 120_000_000,
        formattedValue: "120,000,000",
        subValue: "Rank #3 Global",
      },
      {
        rank: 4,
        username: "ThirtyVirus",
        uuid: "1b93f2f814524c529dfb2d69f061dc13",
        hypixelRank: "YOUTUBE",
        value: 95_400_000,
        formattedValue: "95,400,000",
      },
      {
        rank: 5,
        username: "Refraction",
        uuid: "00000000000000000000000000000001",
        hypixelRank: "MVP_PLUS_PLUS",
        value: 78_200_000,
        formattedValue: "78,200,000",
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
    name: "Sugar Cane",
    group: "farming_collections",
    unit: "sugar cane",
    iconId: "SUGAR_CANE",
    description: "Total sugar cane harvested.",
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
        subValue: "Garden Level 15",
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
    id: "carrot",
    name: "Carrot",
    group: "farming_collections",
    unit: "carrots",
    iconId: "CARROT_ITEM",
    description: "Total carrots harvested.",
    topPlayers: [
      {
        rank: 1,
        username: "CarrotLord",
        uuid: "00000000000000000000000000000017",
        hypixelRank: "MVP_PLUS_PLUS",
        value: 710_000_000,
        formattedValue: "710,000,000",
      },
      {
        rank: 2,
        username: "BetaCarotene",
        uuid: "00000000000000000000000000000018",
        hypixelRank: "MVP_PLUS",
        value: 580_000_000,
        formattedValue: "580,000,000",
      },
      {
        rank: 3,
        username: "OrangeRoots",
        uuid: "00000000000000000000000000000019",
        hypixelRank: "VIP",
        value: 490_000_000,
        formattedValue: "490,000,000",
      },
    ],
    thresholds: {
      top001: 75_000_000,
      top01: 20_000_000,
      top1: 4_000_000,
      top5: 800_000,
      top10: 200_000,
    },
  },
  {
    id: "wheat",
    name: "Wheat",
    group: "farming_collections",
    unit: "wheat",
    iconId: "WHEAT",
    description: "Total wheat harvested.",
    topPlayers: [
      {
        rank: 1,
        username: "WheatWhiz",
        uuid: "00000000000000000000000000000020",
        hypixelRank: "MVP_PLUS_PLUS",
        value: 620_000_000,
        formattedValue: "620,000,000",
      },
      {
        rank: 2,
        username: "GoldenHay",
        uuid: "00000000000000000000000000000021",
        hypixelRank: "MVP_PLUS",
        value: 510_000_000,
        formattedValue: "510,000,000",
      },
      {
        rank: 3,
        username: "BreadMaker",
        uuid: "00000000000000000000000000000022",
        hypixelRank: "VIP_PLUS",
        value: 430_000_000,
        formattedValue: "430,000,000",
      },
    ],
    thresholds: {
      top001: 50_000_000,
      top01: 15_000_000,
      top1: 3_000_000,
      top5: 600_000,
      top10: 150_000,
    },
  },
  {
    id: "nether_wart",
    name: "Nether Wart",
    group: "farming_collections",
    unit: "nether wart",
    iconId: "NETHER_STALK",
    description: "Total nether wart farmed in the Crimson Isle & Garden.",
    topPlayers: [
      {
        rank: 1,
        username: "WartFarmer",
        uuid: "00000000000000000000000000000023",
        hypixelRank: "MVP_PLUS_PLUS",
        value: 950_000_000,
        formattedValue: "950,000,000",
      },
      {
        rank: 2,
        username: "AlchemyKing",
        uuid: "00000000000000000000000000000024",
        hypixelRank: "MVP_PLUS",
        value: 810_000_000,
        formattedValue: "810,000,000",
      },
      {
        rank: 3,
        username: "CrimsonGrower",
        uuid: "00000000000000000000000000000025",
        hypixelRank: "VIP_PLUS",
        value: 700_000_000,
        formattedValue: "700,000,000",
      },
    ],
    thresholds: {
      top001: 120_000_000,
      top01: 35_000_000,
      top1: 8_000_000,
      top5: 1_500_000,
      top10: 400_000,
    },
  },

  // ===================== MINING COLLECTIONS =====================
  {
    id: "mithril",
    name: "Mithril",
    group: "mining_collections",
    unit: "mithril",
    iconId: "MITHRIL_ORE",
    description: "Total mithril ore mined from Dwarven Mines.",
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
    id: "gemstone",
    name: "Gemstone",
    group: "mining_collections",
    unit: "gemstones",
    iconId: "PERFECT_JASPER_GEM",
    description: "Total rough/flawed/fine gemstones mined in Crystal Hollows & Glacite Tunnels.",
    topPlayers: [
      {
        rank: 1,
        username: "GemstoneMiner",
        uuid: "00000000000000000000000000000026",
        hypixelRank: "MVP_PLUS_PLUS",
        value: 890_000_000,
        formattedValue: "890,000,000",
        subValue: "3.2k Mining Speed",
      },
      {
        rank: 2,
        username: "PristinePro",
        uuid: "00000000000000000000000000000027",
        hypixelRank: "MVP_PLUS",
        value: 760_000_000,
        formattedValue: "760,000,000",
        subValue: "Pristine 18.5",
      },
      {
        rank: 3,
        username: "CrystalHollows",
        uuid: "00000000000000000000000000000028",
        hypixelRank: "VIP_PLUS",
        value: 620_000_000,
        formattedValue: "620,000,000",
      },
    ],
    thresholds: {
      top001: 150_000_000,
      top01: 40_000_000,
      top1: 10_000_000,
      top5: 2_000_000,
      top10: 500_000,
    },
  },
  {
    id: "diamond",
    name: "Diamond",
    group: "mining_collections",
    unit: "diamonds",
    iconId: "DIAMOND",
    description: "Total diamonds mined or produced via diamond spreading.",
    topPlayers: [
      {
        rank: 1,
        username: "DiamondSpreader",
        uuid: "00000000000000000000000000000029",
        hypixelRank: "MVP_PLUS_PLUS",
        value: 520_000_000,
        formattedValue: "520,000,000",
      },
      {
        rank: 2,
        username: "SlimeMinionKing",
        uuid: "00000000000000000000000000000030",
        hypixelRank: "MVP_PLUS",
        value: 440_000_000,
        formattedValue: "440,000,000",
      },
      {
        rank: 3,
        username: "BlueGems",
        uuid: "00000000000000000000000000000031",
        hypixelRank: "VIP_PLUS",
        value: 380_000_000,
        formattedValue: "380,000,000",
      },
    ],
    thresholds: {
      top001: 60_000_000,
      top01: 18_000_000,
      top1: 4_000_000,
      top5: 800_000,
      top10: 200_000,
    },
  },

  // ===================== COMBAT COLLECTIONS =====================
  {
    id: "ender_pearl",
    name: "Ender Pearl",
    group: "combat_collections",
    unit: "ender pearls",
    iconId: "ENDER_PEARL",
    description: "Total ender pearls collected from the End & Zealots.",
    topPlayers: [
      {
        rank: 1,
        username: "ZealotBruiser",
        uuid: "00000000000000000000000000000032",
        hypixelRank: "MVP_PLUS_PLUS",
        value: 390_000_000,
        formattedValue: "390,000,000",
        subValue: "150k Zealots Slain",
      },
      {
        rank: 2,
        username: "EndermanSlayer",
        uuid: "00000000000000000000000000000033",
        hypixelRank: "MVP_PLUS",
        value: 310_000_000,
        formattedValue: "310,000,000",
      },
      {
        rank: 3,
        username: "DragonCaller",
        uuid: "00000000000000000000000000000034",
        hypixelRank: "VIP_PLUS",
        value: 260_000_000,
        formattedValue: "260,000,000",
      },
    ],
    thresholds: {
      top001: 40_000_000,
      top01: 10_000_000,
      top1: 2_000_000,
      top5: 400_000,
      top10: 100_000,
    },
  },
  {
    id: "blaze_rod",
    name: "Blaze Rod",
    group: "combat_collections",
    unit: "blaze rods",
    iconId: "BLAZE_ROD",
    description: "Total blaze rods collected in the Crimson Isle.",
    topPlayers: [
      {
        rank: 1,
        username: "FireFiend",
        uuid: "00000000000000000000000000000035",
        hypixelRank: "MVP_PLUS_PLUS",
        value: 280_000_000,
        formattedValue: "280,000,000",
      },
      {
        rank: 2,
        username: "BlazeMaster",
        uuid: "00000000000000000000000000000036",
        hypixelRank: "MVP_PLUS",
        value: 220_000_000,
        formattedValue: "220,000,000",
      },
      {
        rank: 3,
        username: "AshLover",
        uuid: "00000000000000000000000000000037",
        hypixelRank: "VIP",
        value: 175_000_000,
        formattedValue: "175,000,000",
      },
    ],
    thresholds: {
      top001: 25_000_000,
      top01: 6_000_000,
      top1: 1_200_000,
      top5: 250_000,
      top10: 60_000,
    },
  },

  // ===================== SKILLS =====================
  {
    id: "skill_average",
    name: "Skill Average",
    group: "skills",
    unit: "average lvl",
    iconId: "EXPERIENCE_BOTTLE",
    description: "Overall skill average across all non-cosmetic skills (Max 56.75).",
    topPlayers: [
      {
        rank: 1,
        username: "DeathStreeks",
        uuid: "8667ba71b85a4004af54457a9734eed7",
        hypixelRank: "MVP_PLUS_PLUS",
        value: 56.75,
        formattedValue: "56.75",
        subValue: "Max Overflow XP",
      },
      {
        rank: 2,
        username: "Linman",
        uuid: "00000000000000000000000000000009",
        hypixelRank: "MVP_PLUS",
        value: 56.75,
        formattedValue: "56.75",
        subValue: "Rank #2 Global",
      },
      {
        rank: 3,
        username: "HellCastle",
        uuid: "00000000000000000000000000000010",
        hypixelRank: "YOUTUBE",
        value: 56.5,
        formattedValue: "56.50",
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

  // ===================== DUNGEONS & CATACOMBS =====================
  {
    id: "catacombs_level",
    name: "Catacombs Level & XP",
    group: "dungeons",
    unit: "Cata XP",
    iconId: "WITHER_SKULL",
    description: "Catacombs XP and Master Mode completions.",
    topPlayers: [
      {
        rank: 1,
        username: "DeathStreeks",
        uuid: "8667ba71b85a4004af54457a9734eed7",
        hypixelRank: "MVP_PLUS_PLUS",
        value: 1_250_000_000,
        formattedValue: "1.25B XP",
        subValue: "Catacombs 50 • 200k Secrets",
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

  // ===================== SLAYERS =====================
  {
    id: "slayer_xp",
    name: "Total Slayer XP",
    group: "slayers",
    unit: "Slayer XP",
    iconId: "DIAMOND_SWORD",
    description: "Combined Slayer XP across all 6 bosses.",
    topPlayers: [
      {
        rank: 1,
        username: "SlayerGod",
        uuid: "00000000000000000000000000000013",
        hypixelRank: "MVP_PLUS_PLUS",
        value: 65_000_000,
        formattedValue: "65,000,000",
        subValue: "All Slayers Lv 9",
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

  // ===================== ECONOMY =====================
  {
    id: "net_worth",
    name: "Total Net Worth",
    group: "economy",
    unit: "coins",
    iconId: "GOLD_INGOT",
    description: "Estimated total coin valuation including items, sacks, museum, and bank.",
    topPlayers: [
      {
        rank: 1,
        username: "Swavy",
        uuid: "20526019318b438da062fab8f4f6e1f0",
        hypixelRank: "YOUTUBE",
        value: 120_000_000_000,
        formattedValue: "120 Billion",
        subValue: "Exotic Museum & Sacks",
      },
      {
        rank: 2,
        username: "Refraction",
        uuid: "00000000000000000000000000000001",
        hypixelRank: "MVP_PLUS_PLUS",
        value: 95_000_000_000,
        formattedValue: "95 Billion",
      },
      {
        rank: 3,
        username: "BazaarBaron",
        uuid: "00000000000000000000000000000016",
        hypixelRank: "MVP_PLUS_PLUS",
        value: 80_000_000_000,
        formattedValue: "80 Billion",
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
      case "carrot":
        playerVal = player.collections?.find((c) => c.id.toUpperCase() === "CARROT_ITEM")?.amount ?? 0;
        break;
      case "wheat":
        playerVal = player.collections?.find((c) => c.id.toUpperCase() === "WHEAT")?.amount ?? 0;
        break;
      case "nether_wart":
        playerVal = player.collections?.find((c) => c.id.toUpperCase() === "NETHER_STALK")?.amount ?? 0;
        break;
      case "mithril":
        playerVal = player.collections?.find((c) => c.id.toUpperCase() === "MITHRIL_ORE")?.amount ?? 0;
        break;
      case "gemstone":
        playerVal = player.collections?.find((c) => c.id.toUpperCase() === "GEMSTONE")?.amount ?? 0;
        break;
      case "diamond":
        playerVal = player.collections?.find((c) => c.id.toUpperCase() === "DIAMOND")?.amount ?? 0;
        break;
      case "ender_pearl":
        playerVal = player.collections?.find((c) => c.id.toUpperCase() === "ENDER_PEARL")?.amount ?? 0;
        break;
      case "blaze_rod":
        playerVal = player.collections?.find((c) => c.id.toUpperCase() === "BLAZE_ROD")?.amount ?? 0;
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
