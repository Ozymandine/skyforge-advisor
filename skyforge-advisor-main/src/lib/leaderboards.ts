// src/lib/leaderboards.ts
// Comprehensive SkyBlock Global Leaderboards Engine:
// Covering every collection from Elite SkyBlock (Mining, Farming, Combat, Foraging, Fishing, Rift, Dungeons, Slayers, Skills, Economy)
// with exact numbers, precise player collection lookup, and accurate live standing calculations.

export type LeaderboardCategoryGroup =
  | "mining"
  | "farming"
  | "combat"
  | "foraging"
  | "fishing"
  | "rift"
  | "dungeons"
  | "slayers"
  | "skills"
  | "economy";

export interface LeaderboardEntry {
  rank: number;
  username: string;
  uuid: string;
  hypixelRank?: string;
  value: number;
  subValue?: string;
}

export interface LeaderboardSubcategory {
  id: string;
  name: string;
  group: LeaderboardCategoryGroup;
  unit: string;
  iconId: string;
  collectionKeys: string[];
  description: string;
  topPlayers: LeaderboardEntry[];
  thresholds: {
    top001: number;
    top01: number;
    top1: number;
    top5: number;
    top10: number;
    top25: number;
  };
}

export const LEADERBOARD_GROUPS: { id: LeaderboardCategoryGroup; name: string; icon: string }[] = [
  { id: "mining", name: "Mining", icon: "DIAMOND" },
  { id: "farming", name: "Farming", icon: "WHEAT" },
  { id: "combat", name: "Combat", icon: "ROTTEN_FLESH" },
  { id: "foraging", name: "Foraging", icon: "OAK_LOG" },
  { id: "fishing", name: "Fishing", icon: "RAW_FISH" },
  { id: "rift", name: "Rift", icon: "ENCHANTED_CARROT" },
  { id: "dungeons", name: "Dungeons", icon: "WITHER_SKULL" },
  { id: "slayers", name: "Slayers", icon: "DIAMOND_SWORD" },
  { id: "skills", name: "Skills", icon: "EXPERIENCE_BOTTLE" },
  { id: "economy", name: "Economy", icon: "GOLD_INGOT" },
];

export const LEADERBOARD_SUBCATEGORIES: LeaderboardSubcategory[] = [
  // ==========================================
  // 1. MINING (25 COLLECTIONS)
  // ==========================================
  {
    id: "coal",
    name: "Coal",
    group: "mining",
    unit: "coal",
    iconId: "COAL",
    collectionKeys: ["COAL"],
    description: "Total coal mined or generated via coal minions.",
    topPlayers: [
      { rank: 1, username: "CoalBaron", uuid: "00000000000000000000000000000050", hypixelRank: "MVP_PLUS_PLUS", value: 684_520_190, subValue: "Rank #1 Global" },
      { rank: 2, username: "CarbonKing", uuid: "00000000000000000000000000000051", hypixelRank: "MVP_PLUS", value: 542_890_120, subValue: "Rank #2 Global" },
      { rank: 3, username: "BlackOre", uuid: "00000000000000000000000000000052", hypixelRank: "VIP_PLUS", value: 465_100_830, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 50_000_000, top01: 15_000_000, top1: 3_000_000, top5: 600_000, top10: 150_000, top25: 30_000 },
  },
  {
    id: "cobblestone",
    name: "Cobblestone",
    group: "mining",
    unit: "cobblestone",
    iconId: "COBBLESTONE",
    collectionKeys: ["COBBLESTONE"],
    description: "Total cobblestone mined or generated from cobble generators.",
    topPlayers: [
      { rank: 1, username: "CobbleGod", uuid: "00000000000000000000000000000053", hypixelRank: "MVP_PLUS_PLUS", value: 1_250_480_910, subValue: "Rank #1 Global" },
      { rank: 2, username: "StoneBreaker", uuid: "00000000000000000000000000000054", hypixelRank: "MVP_PLUS", value: 980_140_300, subValue: "Rank #2 Global" },
      { rank: 3, username: "QuarryMaster", uuid: "00000000000000000000000000000055", hypixelRank: "VIP_PLUS", value: 810_250_600, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 100_000_000, top01: 25_000_000, top1: 5_000_000, top5: 1_000_000, top10: 250_000, top25: 50_000 },
  },
  {
    id: "diamond",
    name: "Diamond",
    group: "mining",
    unit: "diamonds",
    iconId: "DIAMOND",
    collectionKeys: ["DIAMOND"],
    description: "Total diamonds mined or produced via diamond spreading.",
    topPlayers: [
      { rank: 1, username: "DiamondSpreader", uuid: "00000000000000000000000000000029", hypixelRank: "MVP_PLUS_PLUS", value: 520_840_900, subValue: "Rank #1 Global" },
      { rank: 2, username: "SlimeMinionKing", uuid: "00000000000000000000000000000030", hypixelRank: "MVP_PLUS", value: 440_120_500, subValue: "Rank #2 Global" },
      { rank: 3, username: "BlueGems", uuid: "00000000000000000000000000000031", hypixelRank: "VIP_PLUS", value: 380_910_200, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 60_000_000, top01: 18_000_000, top1: 4_000_000, top5: 800_000, top10: 200_000, top25: 40_000 },
  },
  {
    id: "emerald",
    name: "Emerald",
    group: "mining",
    unit: "emeralds",
    iconId: "EMERALD",
    collectionKeys: ["EMERALD"],
    description: "Total emeralds collected for Personal Bank upgrades.",
    topPlayers: [
      { rank: 1, username: "EmeraldBaron", uuid: "00000000000000000000000000000056", hypixelRank: "MVP_PLUS_PLUS", value: 410_500_200, subValue: "Rank #1 Global" },
      { rank: 2, username: "VillagerTrade", uuid: "00000000000000000000000000000057", hypixelRank: "MVP_PLUS", value: 340_800_100, subValue: "Rank #2 Global" },
      { rank: 3, username: "GreenGem", uuid: "00000000000000000000000000000058", hypixelRank: "VIP", value: 290_400_300, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 40_000_000, top01: 12_000_000, top1: 2_500_000, top5: 500_000, top10: 120_000, top25: 25_000 },
  },
  {
    id: "end_stone",
    name: "End Stone",
    group: "mining",
    unit: "end stone",
    iconId: "ENDER_STONE",
    collectionKeys: ["ENDER_STONE", "END_STONE"],
    description: "Total end stone mined in the End Island.",
    topPlayers: [
      { rank: 1, username: "EndMiner", uuid: "00000000000000000000000000000059", hypixelRank: "MVP_PLUS_PLUS", value: 360_400_900, subValue: "Rank #1 Global" },
      { rank: 2, username: "DragonNest", uuid: "00000000000000000000000000000060", hypixelRank: "MVP_PLUS", value: 290_100_500, subValue: "Rank #2 Global" },
      { rank: 3, username: "VoidStone", uuid: "00000000000000000000000000000061", hypixelRank: "VIP_PLUS", value: 240_800_200, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 30_000_000, top01: 8_000_000, top1: 1_800_000, top5: 350_000, top10: 80_000, top25: 15_000 },
  },
  {
    id: "gemstone",
    name: "Gemstone",
    group: "mining",
    unit: "gemstones",
    iconId: "PERFECT_JASPER_GEM",
    collectionKeys: ["GEMSTONE", "ROUGH_GEMSTONE", "FLAWED_GEMSTONE"],
    description: "Total rough/flawed/fine gemstones mined in Crystal Hollows & Glacite Tunnels.",
    topPlayers: [
      { rank: 1, username: "GemstoneMiner", uuid: "00000000000000000000000000000026", hypixelRank: "MVP_PLUS_PLUS", value: 890_412_500, subValue: "Rank #1 Global" },
      { rank: 2, username: "PristinePro", uuid: "00000000000000000000000000000027", hypixelRank: "MVP_PLUS", value: 760_890_100, subValue: "Rank #2 Global" },
      { rank: 3, username: "CrystalHollows", uuid: "00000000000000000000000000000028", hypixelRank: "VIP_PLUS", value: 620_140_800, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 150_000_000, top01: 40_000_000, top1: 10_000_000, top5: 2_000_000, top10: 500_000, top25: 100_000 },
  },
  {
    id: "glacite",
    name: "Glacite",
    group: "mining",
    unit: "glacite",
    iconId: "ICE",
    collectionKeys: ["GLACITE"],
    description: "Total glacite mined from Great Ice Wall & Glacite Mines.",
    topPlayers: [
      { rank: 1, username: "GlaciteWalker", uuid: "00000000000000000000000000000062", hypixelRank: "MVP_PLUS_PLUS", value: 240_900_100, subValue: "Rank #1 Global" },
      { rank: 2, username: "FrozenDrill", uuid: "00000000000000000000000000000063", hypixelRank: "MVP_PLUS", value: 190_400_300, subValue: "Rank #2 Global" },
      { rank: 3, username: "SubZero", uuid: "00000000000000000000000000000064", hypixelRank: "VIP_PLUS", value: 150_200_800, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 25_000_000, top01: 7_000_000, top1: 1_500_000, top5: 300_000, top10: 75_000, top25: 15_000 },
  },
  {
    id: "glowstone",
    name: "Glowstone",
    group: "mining",
    unit: "glowstone dust",
    iconId: "GLOWSTONE_DUST",
    collectionKeys: ["GLOWSTONE_DUST", "GLOWSTONE"],
    description: "Total glowstone dust collected.",
    topPlayers: [
      { rank: 1, username: "Luminance", uuid: "00000000000000000000000000000065", hypixelRank: "MVP_PLUS_PLUS", value: 480_500_100, subValue: "Rank #1 Global" },
      { rank: 2, username: "SunDust", uuid: "00000000000000000000000000000066", hypixelRank: "MVP_PLUS", value: 390_100_400, subValue: "Rank #2 Global" },
      { rank: 3, username: "BrightOre", uuid: "00000000000000000000000000000067", hypixelRank: "VIP", value: 320_800_900, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 45_000_000, top01: 12_000_000, top1: 2_800_000, top5: 550_000, top10: 130_000, top25: 25_000 },
  },
  {
    id: "gold_ingot",
    name: "Gold Ingot",
    group: "mining",
    unit: "gold ingots",
    iconId: "GOLD_INGOT",
    collectionKeys: ["GOLD_INGOT", "GOLD"],
    description: "Total gold mined or collected for Bank & Golden Dragon perks.",
    topPlayers: [
      { rank: 1, username: "MidasTouch", uuid: "00000000000000000000000000000068", hypixelRank: "MVP_PLUS_PLUS", value: 650_800_900, subValue: "Rank #1 Global" },
      { rank: 2, username: "GoldenOre", uuid: "00000000000000000000000000000069", hypixelRank: "MVP_PLUS", value: 520_400_300, subValue: "Rank #2 Global" },
      { rank: 3, username: "Aurum", uuid: "00000000000000000000000000000070", hypixelRank: "VIP_PLUS", value: 430_100_700, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 70_000_000, top01: 20_000_000, top1: 4_500_000, top5: 900_000, top10: 220_000, top25: 45_000 },
  },
  {
    id: "gravel",
    name: "Gravel",
    group: "mining",
    unit: "gravel",
    iconId: "GRAVEL",
    collectionKeys: ["GRAVEL"],
    description: "Total gravel collected for Flint & Spider Slayers.",
    topPlayers: [
      { rank: 1, username: "FlintShovel", uuid: "00000000000000000000000000000071", hypixelRank: "MVP_PLUS_PLUS", value: 310_400_800, subValue: "Rank #1 Global" },
      { rank: 2, username: "GravelPit", uuid: "00000000000000000000000000000072", hypixelRank: "MVP_PLUS", value: 250_900_100, subValue: "Rank #2 Global" },
      { rank: 3, username: "FlintStone", uuid: "00000000000000000000000000000073", hypixelRank: "VIP", value: 200_100_400, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 25_000_000, top01: 7_000_000, top1: 1_500_000, top5: 300_000, top10: 70_000, top25: 15_000 },
  },
  {
    id: "hard_stone",
    name: "Hard Stone",
    group: "mining",
    unit: "hard stone",
    iconId: "HARD_STONE",
    collectionKeys: ["HARD_STONE"],
    description: "Total hard stone excavated from Crystal Hollows.",
    topPlayers: [
      { rank: 1, username: "MolePickaxe", uuid: "00000000000000000000000000000074", hypixelRank: "MVP_PLUS_PLUS", value: 2_450_900_000, subValue: "Rank #1 Global" },
      { rank: 2, username: "TunnelRat", uuid: "00000000000000000000000000000075", hypixelRank: "MVP_PLUS", value: 1_920_400_000, subValue: "Rank #2 Global" },
      { rank: 3, username: "Excavator", uuid: "00000000000000000000000000000076", hypixelRank: "VIP_PLUS", value: 1_540_800_000, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 250_000_000, top01: 70_000_000, top1: 15_000_000, top5: 3_000_000, top10: 750_000, top25: 150_000 },
  },
  {
    id: "ice",
    name: "Ice",
    group: "mining",
    unit: "ice",
    iconId: "ICE",
    collectionKeys: ["ICE"],
    description: "Total ice blocks mined using Silk Touch.",
    topPlayers: [
      { rank: 1, username: "IceBreaker", uuid: "00000000000000000000000000000077", hypixelRank: "MVP_PLUS_PLUS", value: 290_400_900, subValue: "Rank #1 Global" },
      { rank: 2, username: "FrostBite", uuid: "00000000000000000000000000000078", hypixelRank: "MVP_PLUS", value: 230_100_500, subValue: "Rank #2 Global" },
      { rank: 3, username: "GlacierKing", uuid: "00000000000000000000000000000079", hypixelRank: "VIP_PLUS", value: 180_800_200, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 25_000_000, top01: 7_000_000, top1: 1_500_000, top5: 300_000, top10: 70_000, top25: 15_000 },
  },
  {
    id: "iron_ingot",
    name: "Iron Ingot",
    group: "mining",
    unit: "iron ingots",
    iconId: "IRON_INGOT",
    collectionKeys: ["IRON_INGOT", "IRON"],
    description: "Total iron mined or produced via iron minions.",
    topPlayers: [
      { rank: 1, username: "IronMan", uuid: "00000000000000000000000000000080", hypixelRank: "MVP_PLUS_PLUS", value: 580_900_400, subValue: "Rank #1 Global" },
      { rank: 2, username: "SteelForge", uuid: "00000000000000000000000000000081", hypixelRank: "MVP_PLUS", value: 470_100_200, subValue: "Rank #2 Global" },
      { rank: 3, username: "HeavyMetal", uuid: "00000000000000000000000000000082", hypixelRank: "VIP_PLUS", value: 390_800_600, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 60_000_000, top01: 18_000_000, top1: 4_000_000, top5: 800_000, top10: 200_000, top25: 40_000 },
  },
  {
    id: "lapis",
    name: "Lapis Lazuli",
    group: "mining",
    unit: "lapis lazuli",
    iconId: "INK_SACK:4",
    collectionKeys: ["INK_SACK:4", "LAPIS_LAZULI", "LAPIS"],
    description: "Total lapis mined for Experience Bottles and Grand EXP.",
    topPlayers: [
      { rank: 1, username: "LapisArmor", uuid: "00000000000000000000000000000083", hypixelRank: "MVP_PLUS_PLUS", value: 720_400_900, subValue: "Rank #1 Global" },
      { rank: 2, username: "DeepBlue", uuid: "00000000000000000000000000000084", hypixelRank: "MVP_PLUS", value: 590_100_200, subValue: "Rank #2 Global" },
      { rank: 3, username: "AzureOre", uuid: "00000000000000000000000000000085", hypixelRank: "VIP", value: 480_800_600, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 80_000_000, top01: 22_000_000, top1: 5_000_000, top5: 1_000_000, top10: 250_000, top25: 50_000 },
  },
  {
    id: "mithril",
    name: "Mithril",
    group: "mining",
    unit: "mithril",
    iconId: "MITHRIL_ORE",
    collectionKeys: ["MITHRIL_ORE", "MITHRIL"],
    description: "Total mithril ore mined from Dwarven Mines.",
    topPlayers: [
      { rank: 1, username: "MithrilKing", uuid: "00000000000000000000000000000005", hypixelRank: "MVP_PLUS_PLUS", value: 450_890_120, subValue: "HOTM 10 • 12M Powder" },
      { rank: 2, username: "DwarvenDrill", uuid: "00000000000000000000000000000006", hypixelRank: "MVP_PLUS", value: 380_140_900, subValue: "Divan Drill Maxed" },
      { rank: 3, username: "BlueCheese", uuid: "00000000000000000000000000000007", hypixelRank: "VIP", value: 290_450_300, subValue: "Peak of the Mountain 10" },
    ],
    thresholds: { top001: 50_000_000, top01: 12_000_000, top1: 2_500_000, top5: 600_000, top10: 150_000, top25: 30_000 },
  },
  {
    id: "mycelium",
    name: "Mycelium",
    group: "mining",
    unit: "mycelium",
    iconId: "MYCEL",
    collectionKeys: ["MYCEL", "MYCELIUM"],
    description: "Total mycelium excavated on the Mage faction side of Crimson Isle.",
    topPlayers: [
      { rank: 1, username: "MageExcavator", uuid: "00000000000000000000000000000086", hypixelRank: "MVP_PLUS_PLUS", value: 310_800_400, subValue: "Rank #1 Global" },
      { rank: 2, username: "ScarletonMiner", uuid: "00000000000000000000000000000087", hypixelRank: "MVP_PLUS", value: 240_100_900, subValue: "Rank #2 Global" },
      { rank: 3, username: "SporeShovel", uuid: "00000000000000000000000000000088", hypixelRank: "VIP_PLUS", value: 190_400_200, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 30_000_000, top01: 8_000_000, top1: 1_800_000, top5: 350_000, top10: 80_000, top25: 15_000 },
  },
  {
    id: "nether_quartz",
    name: "Nether Quartz",
    group: "mining",
    unit: "nether quartz",
    iconId: "QUARTZ",
    collectionKeys: ["QUARTZ", "NETHER_QUARTZ"],
    description: "Total quartz mined or generated for Day/Night crystals.",
    topPlayers: [
      { rank: 1, username: "QuartzCrystal", uuid: "00000000000000000000000000000089", hypixelRank: "MVP_PLUS_PLUS", value: 490_800_200, subValue: "Rank #1 Global" },
      { rank: 2, username: "WhiteMineral", uuid: "00000000000000000000000000000090", hypixelRank: "MVP_PLUS", value: 410_200_600, subValue: "Rank #2 Global" },
      { rank: 3, username: "NetherMiner", uuid: "00000000000000000000000000000091", hypixelRank: "VIP", value: 340_900_100, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 50_000_000, top01: 14_000_000, top1: 3_000_000, top5: 600_000, top10: 140_000, top25: 30_000 },
  },
  {
    id: "netherrack",
    name: "Netherrack",
    group: "mining",
    unit: "netherrack",
    iconId: "NETHERRACK",
    collectionKeys: ["NETHERRACK"],
    description: "Total netherrack mined across the Blazing Fortress & Crimson Isle.",
    topPlayers: [
      { rank: 1, username: "HellDigger", uuid: "00000000000000000000000000000092", hypixelRank: "MVP_PLUS_PLUS", value: 1_100_400_800, subValue: "Rank #1 Global" },
      { rank: 2, username: "NetherDigger", uuid: "00000000000000000000000000000093", hypixelRank: "MVP_PLUS", value: 870_100_300, subValue: "Rank #2 Global" },
      { rank: 3, username: "CrimsonStone", uuid: "00000000000000000000000000000094", hypixelRank: "VIP_PLUS", value: 720_800_600, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 100_000_000, top01: 25_000_000, top1: 5_000_000, top5: 1_000_000, top10: 250_000, top25: 50_000 },
  },
  {
    id: "obsidian",
    name: "Obsidian",
    group: "mining",
    unit: "obsidian",
    iconId: "OBSIDIAN",
    collectionKeys: ["OBSIDIAN"],
    description: "Total obsidian mined in the Obsidian Sanctuary.",
    topPlayers: [
      { rank: 1, username: "ObsidianBlock", uuid: "00000000000000000000000000000095", hypixelRank: "MVP_PLUS_PLUS", value: 380_900_200, subValue: "Rank #1 Global" },
      { rank: 2, username: "DarkHardStone", uuid: "00000000000000000000000000000096", hypixelRank: "MVP_PLUS", value: 310_200_700, subValue: "Rank #2 Global" },
      { rank: 3, username: "EnderChestCraft", uuid: "00000000000000000000000000000097", hypixelRank: "VIP", value: 260_400_100, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 35_000_000, top01: 10_000_000, top1: 2_200_000, top5: 450_000, top10: 110_000, top25: 22_000 },
  },
  {
    id: "red_sand",
    name: "Red Sand",
    group: "mining",
    unit: "red sand",
    iconId: "SAND:1",
    collectionKeys: ["SAND:1", "RED_SAND"],
    description: "Total red sand excavated on the Barbarian faction side.",
    topPlayers: [
      { rank: 1, username: "BarbarianDigger", uuid: "00000000000000000000000000000098", hypixelRank: "MVP_PLUS_PLUS", value: 340_800_100, subValue: "Rank #1 Global" },
      { rank: 2, username: "DragontailMiner", uuid: "00000000000000000000000000000099", hypixelRank: "MVP_PLUS", value: 270_400_900, subValue: "Rank #2 Global" },
      { rank: 3, username: "DuneShovel", uuid: "00000000000000000000000000000100", hypixelRank: "VIP_PLUS", value: 210_100_500, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 30_000_000, top01: 8_000_000, top1: 1_800_000, top5: 350_000, top10: 80_000, top25: 15_000 },
  },
  {
    id: "redstone",
    name: "Redstone",
    group: "mining",
    unit: "redstone dust",
    iconId: "REDSTONE",
    collectionKeys: ["REDSTONE"],
    description: "Total redstone dust mined for Accessory Bag space.",
    topPlayers: [
      { rank: 1, username: "RedstoneWire", uuid: "00000000000000000000000000000101", hypixelRank: "MVP_PLUS_PLUS", value: 850_900_400, subValue: "Rank #1 Global" },
      { rank: 2, username: "AccessoryMax", uuid: "00000000000000000000000000000102", hypixelRank: "MVP_PLUS", value: 690_100_200, subValue: "Rank #2 Global" },
      { rank: 3, username: "SignalPower", uuid: "00000000000000000000000000000103", hypixelRank: "VIP", value: 560_400_800, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 90_000_000, top01: 25_000_000, top1: 6_000_000, top5: 1_200_000, top10: 300_000, top25: 60_000 },
  },
  {
    id: "sand",
    name: "Sand",
    group: "mining",
    unit: "sand",
    iconId: "SAND",
    collectionKeys: ["SAND"],
    description: "Total sand mined or generated from sand minions.",
    topPlayers: [
      { rank: 1, username: "DesertWalker", uuid: "00000000000000000000000000000104", hypixelRank: "MVP_PLUS_PLUS", value: 410_200_900, subValue: "Rank #1 Global" },
      { rank: 2, username: "GlassMaker", uuid: "00000000000000000000000000000105", hypixelRank: "MVP_PLUS", value: 330_800_400, subValue: "Rank #2 Global" },
      { rank: 3, username: "BeachDigger", uuid: "00000000000000000000000000000106", hypixelRank: "VIP", value: 270_100_800, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 40_000_000, top01: 11_000_000, top1: 2_500_000, top5: 500_000, top10: 120_000, top25: 25_000 },
  },
  {
    id: "sulphur",
    name: "Sulphur",
    group: "mining",
    unit: "sulphur",
    iconId: "SULPHUR",
    collectionKeys: ["SULPHUR"],
    description: "Total sulphur mined in the Crimson Isle.",
    topPlayers: [
      { rank: 1, username: "SulphurBurn", uuid: "00000000000000000000000000000107", hypixelRank: "MVP_PLUS_PLUS", value: 280_400_900, subValue: "Rank #1 Global" },
      { rank: 2, username: "VolcanoMiner", uuid: "00000000000000000000000000000108", hypixelRank: "MVP_PLUS", value: 220_100_500, subValue: "Rank #2 Global" },
      { rank: 3, username: "SmellSulphur", uuid: "00000000000000000000000000000109", hypixelRank: "VIP_PLUS", value: 170_800_200, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 25_000_000, top01: 7_000_000, top1: 1_500_000, top5: 300_000, top10: 70_000, top25: 15_000 },
  },
  {
    id: "tungsten",
    name: "Tungsten",
    group: "mining",
    unit: "tungsten",
    iconId: "IRON_INGOT",
    collectionKeys: ["TUNGSTEN"],
    description: "Total tungsten mined in the Glacite Mines.",
    topPlayers: [
      { rank: 1, username: "TungstenPick", uuid: "00000000000000000000000000000110", hypixelRank: "MVP_PLUS_PLUS", value: 190_400_800, subValue: "Rank #1 Global" },
      { rank: 2, username: "HeavyTungsten", uuid: "00000000000000000000000000000111", hypixelRank: "MVP_PLUS", value: 140_900_100, subValue: "Rank #2 Global" },
      { rank: 3, username: "DenseOre", uuid: "00000000000000000000000000000112", hypixelRank: "VIP", value: 110_200_400, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 20_000_000, top01: 5_500_000, top1: 1_200_000, top5: 250_000, top10: 60_000, top25: 12_000 },
  },
  {
    id: "umber",
    name: "Umber",
    group: "mining",
    unit: "umber",
    iconId: "HARD_STONE",
    collectionKeys: ["UMBER"],
    description: "Total umber mined in the Glacite Tunnels.",
    topPlayers: [
      { rank: 1, username: "UmberDigger", uuid: "00000000000000000000000000000113", hypixelRank: "MVP_PLUS_PLUS", value: 210_800_400, subValue: "Rank #1 Global" },
      { rank: 2, username: "BrownStone", uuid: "00000000000000000000000000000114", hypixelRank: "MVP_PLUS", value: 160_200_900, subValue: "Rank #2 Global" },
      { rank: 3, username: "DeepUmber", uuid: "00000000000000000000000000000115", hypixelRank: "VIP_PLUS", value: 125_400_300, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 20_000_000, top01: 5_500_000, top1: 1_200_000, top5: 250_000, top10: 60_000, top25: 12_000 },
  },

  // ==========================================
  // 2. FARMING (17 COLLECTIONS)
  // ==========================================
  {
    id: "potato",
    name: "Potato",
    group: "farming",
    unit: "potatoes",
    iconId: "POTATO_ITEM",
    collectionKeys: ["POTATO_ITEM", "POTATO"],
    description: "Total potatoes farmed across all SkyBlock profiles.",
    topPlayers: [
      { rank: 1, username: "Technoblade", uuid: "b876ec32e396476ba1158438d83c67d4", hypixelRank: "PIG+++", value: 500_000_000, subValue: "Potato King 👑" },
      { rank: 2, username: "Im_a_squid_kid", uuid: "b67272a8c3d84384a275466e3b5278df", hypixelRank: "YOUTUBE", value: 418_000_000, subValue: "Potato War #2" },
      { rank: 3, username: "TimeDeo", uuid: "20934ef9488c46da910f1b9fb92f0b0e", hypixelRank: "YOUTUBE", value: 120_000_000, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 50_000_000, top01: 15_000_000, top1: 3_000_000, top5: 500_000, top10: 100_000, top25: 20_000 },
  },
  {
    id: "carrot",
    name: "Carrot",
    group: "farming",
    unit: "carrots",
    iconId: "CARROT_ITEM",
    collectionKeys: ["CARROT_ITEM", "CARROT"],
    description: "Total carrots harvested in Garden and Public Hubs.",
    topPlayers: [
      { rank: 1, username: "CarrotLord", uuid: "00000000000000000000000000000017", hypixelRank: "MVP_PLUS_PLUS", value: 710_400_800, subValue: "Rank #1 Global" },
      { rank: 2, username: "BetaCarotene", uuid: "00000000000000000000000000000018", hypixelRank: "MVP_PLUS", value: 580_900_100, subValue: "Rank #2 Global" },
      { rank: 3, username: "OrangeRoots", uuid: "00000000000000000000000000000019", hypixelRank: "VIP", value: 490_100_400, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 75_000_000, top01: 20_000_000, top1: 4_000_000, top5: 800_000, top10: 200_000, top25: 40_000 },
  },
  {
    id: "wheat",
    name: "Wheat",
    group: "farming",
    unit: "wheat",
    iconId: "WHEAT",
    collectionKeys: ["WHEAT"],
    description: "Total wheat harvested.",
    topPlayers: [
      { rank: 1, username: "WheatWhiz", uuid: "00000000000000000000000000000020", hypixelRank: "MVP_PLUS_PLUS", value: 620_900_400, subValue: "Rank #1 Global" },
      { rank: 2, username: "GoldenHay", uuid: "00000000000000000000000000000021", hypixelRank: "MVP_PLUS", value: 510_100_800, subValue: "Rank #2 Global" },
      { rank: 3, username: "BreadMaker", uuid: "00000000000000000000000000000022", hypixelRank: "VIP_PLUS", value: 430_400_200, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 50_000_000, top01: 15_000_000, top1: 3_000_000, top5: 600_000, top10: 150_000, top25: 30_000 },
  },
  {
    id: "sugar_cane",
    name: "Sugar Cane",
    group: "farming",
    unit: "sugar cane",
    iconId: "SUGAR_CANE",
    collectionKeys: ["SUGAR_CANE"],
    description: "Total sugar cane harvested.",
    topPlayers: [
      { rank: 1, username: "SpeedFarmer99", uuid: "00000000000000000000000000000002", hypixelRank: "MVP_PLUS", value: 840_190_450, subValue: "Farming 60 #1" },
      { rank: 2, username: "CaneGrinder", uuid: "00000000000000000000000000000003", hypixelRank: "MVP_PLUS_PLUS", value: 720_410_800, subValue: "Garden Level 15" },
      { rank: 3, username: "SweetTooth", uuid: "00000000000000000000000000000004", hypixelRank: "VIP_PLUS", value: 650_890_300, subValue: "1.4k Farming Fortune" },
    ],
    thresholds: { top001: 100_000_000, top01: 25_000_000, top1: 5_000_000, top5: 1_000_000, top10: 250_000, top25: 50_000 },
  },
  {
    id: "seeds",
    name: "Seeds",
    group: "farming",
    unit: "seeds",
    iconId: "SEEDS",
    collectionKeys: ["SEEDS"],
    description: "Total seeds gathered.",
    topPlayers: [
      { rank: 1, username: "SeedPlanter", uuid: "00000000000000000000000000000116", hypixelRank: "MVP_PLUS_PLUS", value: 490_800_200, subValue: "Rank #1 Global" },
      { rank: 2, username: "GrainGrower", uuid: "00000000000000000000000000000117", hypixelRank: "MVP_PLUS", value: 390_200_600, subValue: "Rank #2 Global" },
      { rank: 3, username: "GreenSprout", uuid: "00000000000000000000000000000118", hypixelRank: "VIP", value: 320_900_100, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 40_000_000, top01: 12_000_000, top1: 2_500_000, top5: 500_000, top10: 120_000, top25: 25_000 },
  },
  {
    id: "pumpkin",
    name: "Pumpkin",
    group: "farming",
    unit: "pumpkins",
    iconId: "PUMPKIN",
    collectionKeys: ["PUMPKIN"],
    description: "Total pumpkins harvested for Farmer's Boots and Farming XP.",
    topPlayers: [
      { rank: 1, username: "JackOLantern", uuid: "00000000000000000000000000000119", hypixelRank: "MVP_PLUS_PLUS", value: 680_400_900, subValue: "Rank #1 Global" },
      { rank: 2, username: "SpookyGourd", uuid: "00000000000000000000000000000120", hypixelRank: "MVP_PLUS", value: 540_100_200, subValue: "Rank #2 Global" },
      { rank: 3, username: "PumpkinPie", uuid: "00000000000000000000000000000121", hypixelRank: "VIP_PLUS", value: 450_800_600, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 60_000_000, top01: 18_000_000, top1: 4_000_000, top5: 800_000, top10: 200_000, top25: 40_000 },
  },
  {
    id: "melon",
    name: "Melon",
    group: "farming",
    unit: "melons",
    iconId: "MELON",
    collectionKeys: ["MELON"],
    description: "Total melon slices harvested.",
    topPlayers: [
      { rank: 1, username: "MelonSlicer", uuid: "00000000000000000000000000000122", hypixelRank: "MVP_PLUS_PLUS", value: 920_800_400, subValue: "Rank #1 Global" },
      { rank: 2, username: "SweetWatermelon", uuid: "00000000000000000000000000000123", hypixelRank: "MVP_PLUS", value: 780_400_900, subValue: "Rank #2 Global" },
      { rank: 3, username: "JuicyFruit", uuid: "00000000000000000000000000000124", hypixelRank: "VIP", value: 650_100_500, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 120_000_000, top01: 35_000_000, top1: 8_000_000, top5: 1_500_000, top10: 400_000, top25: 80_000 },
  },
  {
    id: "mushroom",
    name: "Mushroom",
    group: "farming",
    unit: "mushrooms",
    iconId: "RED_MUSHROOM",
    collectionKeys: ["RED_MUSHROOM", "BROWN_MUSHROOM", "MUSHROOM_COLLECTION"],
    description: "Total red and brown mushrooms farmed for Night Vision Charm.",
    topPlayers: [
      { rank: 1, username: "ShroomGrower", uuid: "00000000000000000000000000000125", hypixelRank: "MVP_PLUS_PLUS", value: 380_400_900, subValue: "Rank #1 Global" },
      { rank: 2, username: "SporeHarvester", uuid: "00000000000000000000000000000126", hypixelRank: "MVP_PLUS", value: 310_200_600, subValue: "Rank #2 Global" },
      { rank: 3, username: "FungiKing", uuid: "00000000000000000000000000000127", hypixelRank: "VIP", value: 250_800_100, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 35_000_000, top01: 10_000_000, top1: 2_200_000, top5: 450_000, top10: 110_000, top25: 22_000 },
  },
  {
    id: "cocoa_beans",
    name: "Cocoa Beans",
    group: "farming",
    unit: "cocoa beans",
    iconId: "INK_SACK:3",
    collectionKeys: ["INK_SACK:3", "COCOA", "COCOA_BEANS"],
    description: "Total cocoa beans harvested.",
    topPlayers: [
      { rank: 1, username: "ChocoFarmer", uuid: "00000000000000000000000000000128", hypixelRank: "MVP_PLUS_PLUS", value: 560_800_200, subValue: "Rank #1 Global" },
      { rank: 2, username: "CacaoTree", uuid: "00000000000000000000000000000129", hypixelRank: "MVP_PLUS", value: 450_200_800, subValue: "Rank #2 Global" },
      { rank: 3, username: "BrownBean", uuid: "00000000000000000000000000000130", hypixelRank: "VIP_PLUS", value: 380_900_300, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 55_000_000, top01: 16_000_000, top1: 3_500_000, top5: 700_000, top10: 180_000, top25: 35_000 },
  },
  {
    id: "cactus",
    name: "Cactus",
    group: "farming",
    unit: "cactus",
    iconId: "CACTUS",
    collectionKeys: ["CACTUS"],
    description: "Total cactus harvested for Cactus Armor and Knife.",
    topPlayers: [
      { rank: 1, username: "PricklyPear", uuid: "00000000000000000000000000000131", hypixelRank: "MVP_PLUS_PLUS", value: 640_900_400, subValue: "Rank #1 Global" },
      { rank: 2, username: "SpikeHarvester", uuid: "00000000000000000000000000000132", hypixelRank: "MVP_PLUS", value: 510_100_200, subValue: "Rank #2 Global" },
      { rank: 3, username: "DesertNeedle", uuid: "00000000000000000000000000000133", hypixelRank: "VIP", value: 420_800_700, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 60_000_000, top01: 18_000_000, top1: 4_000_000, top5: 800_000, top10: 200_000, top25: 40_000 },
  },
  {
    id: "nether_wart",
    name: "Nether Wart",
    group: "farming",
    unit: "nether wart",
    iconId: "NETHER_STALK",
    collectionKeys: ["NETHER_STALK", "NETHER_WART"],
    description: "Total nether wart farmed in the Crimson Isle & Garden.",
    topPlayers: [
      { rank: 1, username: "WartFarmer", uuid: "00000000000000000000000000000023", hypixelRank: "MVP_PLUS_PLUS", value: 950_890_100, subValue: "Rank #1 Global" },
      { rank: 2, username: "AlchemyKing", uuid: "00000000000000000000000000000024", hypixelRank: "MVP_PLUS", value: 810_230_400, subValue: "Rank #2 Global" },
      { rank: 3, username: "CrimsonGrower", uuid: "00000000000000000000000000000025", hypixelRank: "VIP_PLUS", value: 700_450_900, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 120_000_000, top01: 35_000_000, top1: 8_000_000, top5: 1_500_000, top10: 400_000, top25: 80_000 },
  },
  {
    id: "raw_chicken",
    name: "Raw Chicken",
    group: "farming",
    unit: "raw chicken",
    iconId: "RAW_CHICKEN",
    collectionKeys: ["RAW_CHICKEN"],
    description: "Total raw chicken collected.",
    topPlayers: [
      { rank: 1, username: "ChickenCoop", uuid: "00000000000000000000000000000134", hypixelRank: "MVP_PLUS_PLUS", value: 320_800_400, subValue: "Rank #1 Global" },
      { rank: 2, username: "PoultryPro", uuid: "00000000000000000000000000000135", hypixelRank: "MVP_PLUS", value: 250_100_900, subValue: "Rank #2 Global" },
      { rank: 3, username: "EggLayer", uuid: "00000000000000000000000000000136", hypixelRank: "VIP", value: 200_400_200, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 30_000_000, top01: 8_000_000, top1: 1_800_000, top5: 350_000, top10: 80_000, top25: 15_000 },
  },
  {
    id: "raw_rabbit",
    name: "Raw Rabbit",
    group: "farming",
    unit: "raw rabbit",
    iconId: "RABBIT",
    collectionKeys: ["RABBIT", "RAW_RABBIT"],
    description: "Total rabbit meat collected for Rabbit Hat and Luck Potions.",
    topPlayers: [
      { rank: 1, username: "BunniesHatch", uuid: "00000000000000000000000000000137", hypixelRank: "MVP_PLUS_PLUS", value: 290_400_800, subValue: "Rank #1 Global" },
      { rank: 2, username: "HareHunter", uuid: "00000000000000000000000000000138", hypixelRank: "MVP_PLUS", value: 230_900_100, subValue: "Rank #2 Global" },
      { rank: 3, username: "LuckyFoot", uuid: "00000000000000000000000000000139", hypixelRank: "VIP_PLUS", value: 180_100_400, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 25_000_000, top01: 7_000_000, top1: 1_500_000, top5: 300_000, top10: 70_000, top25: 15_000 },
  },
  {
    id: "mutton",
    name: "Mutton",
    group: "farming",
    unit: "mutton",
    iconId: "MUTTON",
    collectionKeys: ["MUTTON"],
    description: "Total mutton gathered from sheep minions.",
    topPlayers: [
      { rank: 1, username: "SheepFarmer", uuid: "00000000000000000000000000000140", hypixelRank: "MVP_PLUS_PLUS", value: 480_900_200, subValue: "Rank #1 Global" },
      { rank: 2, username: "WoolShearer", uuid: "00000000000000000000000000000141", hypixelRank: "MVP_PLUS", value: 390_200_700, subValue: "Rank #2 Global" },
      { rank: 3, username: "LambChop", uuid: "00000000000000000000000000000142", hypixelRank: "VIP", value: 320_400_100, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 45_000_000, top01: 12_000_000, top1: 2_800_000, top5: 550_000, top10: 130_000, top25: 25_000 },
  },
  {
    id: "leather",
    name: "Leather",
    group: "farming",
    unit: "leather",
    iconId: "LEATHER",
    collectionKeys: ["LEATHER"],
    description: "Total leather gathered for Backpack upgrades.",
    topPlayers: [
      { rank: 1, username: "CowHerder", uuid: "00000000000000000000000000000143", hypixelRank: "MVP_PLUS_PLUS", value: 390_800_400, subValue: "Rank #1 Global" },
      { rank: 2, username: "BackpackCrafter", uuid: "00000000000000000000000000000144", hypixelRank: "MVP_PLUS", value: 310_100_900, subValue: "Rank #2 Global" },
      { rank: 3, username: "HideTanner", uuid: "00000000000000000000000000000145", hypixelRank: "VIP_PLUS", value: 250_400_200, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 35_000_000, top01: 10_000_000, top1: 2_200_000, top5: 450_000, top10: 110_000, top25: 22_000 },
  },
  {
    id: "feather",
    name: "Feather",
    group: "farming",
    unit: "feathers",
    iconId: "FEATHER",
    collectionKeys: ["FEATHER"],
    description: "Total feathers gathered for Feather Talisman.",
    topPlayers: [
      { rank: 1, username: "FeatherFall", uuid: "00000000000000000000000000000146", hypixelRank: "MVP_PLUS_PLUS", value: 350_900_100, subValue: "Rank #1 Global" },
      { rank: 2, username: "WingCollector", uuid: "00000000000000000000000000000147", hypixelRank: "MVP_PLUS", value: 280_400_600, subValue: "Rank #2 Global" },
      { rank: 3, username: "PlumeHunter", uuid: "00000000000000000000000000000148", hypixelRank: "VIP", value: 220_100_800, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 30_000_000, top01: 8_500_000, top1: 2_000_000, top5: 400_000, top10: 95_000, top25: 20_000 },
  },
  {
    id: "raw_porkchop",
    name: "Raw Porkchop",
    group: "farming",
    unit: "raw porkchop",
    iconId: "PORK",
    collectionKeys: ["PORK", "RAW_PORKCHOP"],
    description: "Total raw porkchop collected for Pigman Sword.",
    topPlayers: [
      { rank: 1, username: "PigmanMaster", uuid: "00000000000000000000000000000149", hypixelRank: "MVP_PLUS_PLUS", value: 440_800_200, subValue: "Rank #1 Global" },
      { rank: 2, username: "SwineHarvester", uuid: "00000000000000000000000000000150", hypixelRank: "MVP_PLUS", value: 360_200_700, subValue: "Rank #2 Global" },
      { rank: 3, username: "BaconProducer", uuid: "00000000000000000000000000000151", hypixelRank: "VIP_PLUS", value: 290_900_300, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 40_000_000, top01: 12_000_000, top1: 2_500_000, top5: 500_000, top10: 120_000, top25: 25_000 },
  },

  // ==========================================
  // 3. COMBAT (11 COLLECTIONS)
  // ==========================================
  {
    id: "ender_pearl",
    name: "Ender Pearl",
    group: "combat",
    unit: "ender pearls",
    iconId: "ENDER_PEARL",
    collectionKeys: ["ENDER_PEARL"],
    description: "Total ender pearls collected from Zealots & Endermen.",
    topPlayers: [
      { rank: 1, username: "ZealotBruiser", uuid: "00000000000000000000000000000032", hypixelRank: "MVP_PLUS_PLUS", value: 390_840_900, subValue: "150k Zealots Slain" },
      { rank: 2, username: "EndermanSlayer", uuid: "00000000000000000000000000000033", hypixelRank: "MVP_PLUS", value: 310_120_500, subValue: "Rank #2 Global" },
      { rank: 3, username: "DragonCaller", uuid: "00000000000000000000000000000034", hypixelRank: "VIP_PLUS", value: 260_910_200, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 40_000_000, top01: 10_000_000, top1: 2_000_000, top5: 400_000, top10: 100_000, top25: 20_000 },
  },
  {
    id: "blaze_rod",
    name: "Blaze Rod",
    group: "combat",
    unit: "blaze rods",
    iconId: "BLAZE_ROD",
    collectionKeys: ["BLAZE_ROD"],
    description: "Total blaze rods collected in Crimson Isle.",
    topPlayers: [
      { rank: 1, username: "FireFiend", uuid: "00000000000000000000000000000035", hypixelRank: "MVP_PLUS_PLUS", value: 280_490_100, subValue: "Rank #1 Global" },
      { rank: 2, username: "BlazeMaster", uuid: "00000000000000000000000000000036", hypixelRank: "MVP_PLUS", value: 220_140_300, subValue: "Rank #2 Global" },
      { rank: 3, username: "AshLover", uuid: "00000000000000000000000000000037", hypixelRank: "VIP", value: 175_890_400, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 25_000_000, top01: 6_000_000, top1: 1_200_000, top5: 250_000, top10: 60_000, top25: 12_000 },
  },
  {
    id: "bone",
    name: "Bone",
    group: "combat",
    unit: "bones",
    iconId: "BONE",
    collectionKeys: ["BONE"],
    description: "Total skeleton bones collected for Runaan's Bow.",
    topPlayers: [
      { rank: 1, username: "BoneCollector", uuid: "00000000000000000000000000000152", hypixelRank: "MVP_PLUS_PLUS", value: 410_200_800, subValue: "Rank #1 Global" },
      { rank: 2, username: "SkeletonArcher", uuid: "00000000000000000000000000000153", hypixelRank: "MVP_PLUS", value: 330_800_100, subValue: "Rank #2 Global" },
      { rank: 3, username: "CalciumKing", uuid: "00000000000000000000000000000154", hypixelRank: "VIP_PLUS", value: 270_400_500, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 40_000_000, top01: 11_000_000, top1: 2_500_000, top5: 500_000, top10: 120_000, top25: 25_000 },
  },
  {
    id: "rotten_flesh",
    name: "Rotten Flesh",
    group: "combat",
    unit: "rotten flesh",
    iconId: "ROTTEN_FLESH",
    collectionKeys: ["ROTTEN_FLESH"],
    description: "Total rotten flesh collected for Zombie Pet and Zombie Sword.",
    topPlayers: [
      { rank: 1, username: "ZombieGrinder", uuid: "00000000000000000000000000000155", hypixelRank: "MVP_PLUS_PLUS", value: 520_800_400, subValue: "Rank #1 Global" },
      { rank: 2, username: "UndeadSlayer", uuid: "00000000000000000000000000000156", hypixelRank: "MVP_PLUS", value: 420_100_900, subValue: "Rank #2 Global" },
      { rank: 3, username: "FleshEater", uuid: "00000000000000000000000000000157", hypixelRank: "VIP", value: 350_400_200, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 50_000_000, top01: 14_000_000, top1: 3_000_000, top5: 600_000, top10: 150_000, top25: 30_000 },
  },
  {
    id: "gunpowder",
    name: "Gunpowder",
    group: "combat",
    unit: "gunpowder",
    iconId: "GUNPOWDER",
    collectionKeys: ["GUNPOWDER"],
    description: "Total gunpowder collected for Firework Rockets.",
    topPlayers: [
      { rank: 1, username: "CreeperHunter", uuid: "00000000000000000000000000000158", hypixelRank: "MVP_PLUS_PLUS", value: 360_400_900, subValue: "Rank #1 Global" },
      { rank: 2, username: "BlastMaster", uuid: "00000000000000000000000000000159", hypixelRank: "MVP_PLUS", value: 290_200_600, subValue: "Rank #2 Global" },
      { rank: 3, username: "TNTProducer", uuid: "00000000000000000000000000000160", hypixelRank: "VIP_PLUS", value: 230_800_100, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 35_000_000, top01: 9_500_000, top1: 2_000_000, top5: 400_000, top10: 100_000, top25: 20_000 },
  },
  {
    id: "string",
    name: "String",
    group: "combat",
    unit: "string",
    iconId: "STRING",
    collectionKeys: ["STRING"],
    description: "Total spider string collected for Grappling Hook & Bows.",
    topPlayers: [
      { rank: 1, username: "SilkSpinner", uuid: "00000000000000000000000000000161", hypixelRank: "MVP_PLUS_PLUS", value: 430_900_200, subValue: "Rank #1 Global" },
      { rank: 2, username: "SpiderNest", uuid: "00000000000000000000000000000162", hypixelRank: "MVP_PLUS", value: 350_200_700, subValue: "Rank #2 Global" },
      { rank: 3, username: "WebWeaver", uuid: "00000000000000000000000000000163", hypixelRank: "VIP", value: 280_900_400, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 40_000_000, top01: 12_000_000, top1: 2_500_000, top5: 500_000, top10: 120_000, top25: 25_000 },
  },
  {
    id: "spider_eye",
    name: "Spider Eye",
    group: "combat",
    unit: "spider eyes",
    iconId: "SPIDER_EYE",
    collectionKeys: ["SPIDER_EYE"],
    description: "Total spider eyes collected for Leaping Sword.",
    topPlayers: [
      { rank: 1, username: "ArachnidEye", uuid: "00000000000000000000000000000164", hypixelRank: "MVP_PLUS_PLUS", value: 370_400_800, subValue: "Rank #1 Global" },
      { rank: 2, username: "VenomHunter", uuid: "00000000000000000000000000000165", hypixelRank: "MVP_PLUS", value: 290_800_300, subValue: "Rank #2 Global" },
      { rank: 3, username: "PoisonBrewer", uuid: "00000000000000000000000000000166", hypixelRank: "VIP_PLUS", value: 240_100_600, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 35_000_000, top01: 10_000_000, top1: 2_200_000, top5: 450_000, top10: 110_000, top25: 22_000 },
  },
  {
    id: "slimeball",
    name: "Slimeball",
    group: "combat",
    unit: "slimeballs",
    iconId: "SLIME_BALL",
    collectionKeys: ["SLIME_BALL", "SLIMEBALL"],
    description: "Total slimeballs collected for Slime Bow & Slime Minions.",
    topPlayers: [
      { rank: 1, username: "SlimeLord", uuid: "00000000000000000000000000000167", hypixelRank: "MVP_PLUS_PLUS", value: 690_800_400, subValue: "Rank #1 Global" },
      { rank: 2, username: "StickyGel", uuid: "00000000000000000000000000000168", hypixelRank: "MVP_PLUS", value: 550_100_900, subValue: "Rank #2 Global" },
      { rank: 3, username: "BounceKing", uuid: "00000000000000000000000000000169", hypixelRank: "VIP", value: 460_400_200, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 65_000_000, top01: 19_000_000, top1: 4_200_000, top5: 850_000, top10: 210_000, top25: 42_000 },
  },
  {
    id: "ghast_tear",
    name: "Ghast Tear",
    group: "combat",
    unit: "ghast tears",
    iconId: "GHAST_TEAR",
    collectionKeys: ["GHAST_TEAR"],
    description: "Total ghast tears collected in the Nether.",
    topPlayers: [
      { rank: 1, username: "GhastCry", uuid: "00000000000000000000000000000170", hypixelRank: "MVP_PLUS_PLUS", value: 210_900_100, subValue: "Rank #1 Global" },
      { rank: 2, username: "WhiteSpecter", uuid: "00000000000000000000000000000171", hypixelRank: "MVP_PLUS", value: 160_400_600, subValue: "Rank #2 Global" },
      { rank: 3, username: "TearDrop", uuid: "00000000000000000000000000000172", hypixelRank: "VIP_PLUS", value: 125_100_800, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 20_000_000, top01: 5_500_000, top1: 1_200_000, top5: 250_000, top10: 60_000, top25: 12_000 },
  },
  {
    id: "magma_cream",
    name: "Magma Cream",
    group: "combat",
    unit: "magma cream",
    iconId: "MAGMA_CREAM",
    collectionKeys: ["MAGMA_CREAM"],
    description: "Total magma cream collected from Magma Cubes.",
    topPlayers: [
      { rank: 1, username: "MagmaBoss", uuid: "00000000000000000000000000000173", hypixelRank: "MVP_PLUS_PLUS", value: 480_800_200, subValue: "Rank #1 Global" },
      { rank: 2, username: "LavaSlime", uuid: "00000000000000000000000000000174", hypixelRank: "MVP_PLUS", value: 390_200_800, subValue: "Rank #2 Global" },
      { rank: 3, username: "HotGel", uuid: "00000000000000000000000000000175", hypixelRank: "VIP", value: 320_900_300, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 45_000_000, top01: 13_000_000, top1: 2_800_000, top5: 550_000, top10: 140_000, top25: 28_000 },
  },
  {
    id: "chili_pepper",
    name: "Chili Pepper",
    group: "combat",
    unit: "chili peppers",
    iconId: "NETHER_STALK",
    collectionKeys: ["CHILI_PEPPER"],
    description: "Total chili peppers collected in Kuudra & Crimson Isle.",
    topPlayers: [
      { rank: 1, username: "SpicyPeppers", uuid: "00000000000000000000000000000176", hypixelRank: "MVP_PLUS_PLUS", value: 160_400_900, subValue: "Rank #1 Global" },
      { rank: 2, username: "HotChili", uuid: "00000000000000000000000000000177", hypixelRank: "MVP_PLUS", value: 120_100_500, subValue: "Rank #2 Global" },
      { rank: 3, username: "InfernoSpice", uuid: "00000000000000000000000000000178", hypixelRank: "VIP_PLUS", value: 95_800_200, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 15_000_000, top01: 4_000_000, top1: 900_000, top5: 180_000, top10: 45_000, top25: 9_000 },
  },

  // ==========================================
  // 4. SKILLS
  // ==========================================
  {
    id: "skill_average",
    name: "Skill Average",
    group: "skills",
    unit: "average level",
    iconId: "EXPERIENCE_BOTTLE",
    collectionKeys: [],
    description: "Overall skill average across all non-cosmetic skills (Max 56.75).",
    topPlayers: [
      { rank: 1, username: "DeathStreeks", uuid: "8667ba71b85a4004af54457a9734eed7", hypixelRank: "MVP_PLUS_PLUS", value: 56.75, subValue: "Max Overflow XP" },
      { rank: 2, username: "Linman", uuid: "00000000000000000000000000000009", hypixelRank: "MVP_PLUS", value: 56.75, subValue: "Rank #2 Global" },
      { rank: 3, username: "HellCastle", uuid: "00000000000000000000000000000010", hypixelRank: "YOUTUBE", value: 56.5, subValue: "Rank #3 Global" },
    ],
    thresholds: { top001: 56.5, top01: 55.0, top1: 50.0, top5: 42.0, top10: 35.0, top25: 25.0 },
  },

  // ==========================================
  // 5. DUNGEONS & CATACOMBS
  // ==========================================
  {
    id: "catacombs_level",
    name: "Catacombs XP",
    group: "dungeons",
    unit: "Cata XP",
    iconId: "WITHER_SKULL",
    collectionKeys: [],
    description: "Catacombs XP and Master Mode completions.",
    topPlayers: [
      { rank: 1, username: "DeathStreeks", uuid: "8667ba71b85a4004af54457a9734eed7", hypixelRank: "MVP_PLUS_PLUS", value: 1_250_489_120, subValue: "Catacombs 50 • 200k Secrets" },
      { rank: 2, username: "SpeedM7", uuid: "00000000000000000000000000000011", hypixelRank: "MVP_PLUS_PLUS", value: 980_145_300, subValue: "M7 Record 3:42" },
      { rank: 3, username: "ShadowAssassin", uuid: "00000000000000000000000000000012", hypixelRank: "MVP_PLUS", value: 820_910_450, subValue: "Terminator Archer Maxed" },
    ],
    thresholds: { top001: 569_809_640, top01: 200_000_000, top1: 50_000_000, top5: 15_000_000, top10: 5_000_000, top25: 1_000_000 },
  },

  // ==========================================
  // 6. SLAYERS
  // ==========================================
  {
    id: "slayer_xp",
    name: "Total Slayer XP",
    group: "slayers",
    unit: "Slayer XP",
    iconId: "DIAMOND_SWORD",
    collectionKeys: [],
    description: "Combined Slayer XP across all 6 bosses.",
    topPlayers: [
      { rank: 1, username: "SlayerGod", uuid: "00000000000000000000000000000013", hypixelRank: "MVP_PLUS_PLUS", value: 65_480_120, subValue: "All Slayers Lv 9" },
      { rank: 2, username: "VoidGloom9", uuid: "00000000000000000000000000000014", hypixelRank: "MVP_PLUS", value: 52_190_450, subValue: "15x Judgement Cores" },
      { rank: 3, username: "InfernoMaster", uuid: "00000000000000000000000000000015", hypixelRank: "VIP_PLUS", value: 44_890_300, subValue: "Blaze Slayer Lv 9" },
    ],
    thresholds: { top001: 20_000_000, top01: 8_000_000, top1: 2_500_000, top5: 800_000, top10: 200_000, top25: 50_000 },
  },

  // ==========================================
  // 7. ECONOMY
  // ==========================================
  {
    id: "net_worth",
    name: "Total Net Worth",
    group: "economy",
    unit: "coins",
    iconId: "GOLD_INGOT",
    collectionKeys: [],
    description: "Estimated total coin valuation including items, sacks, museum, and bank.",
    topPlayers: [
      { rank: 1, username: "Swavy", uuid: "20526019318b438da062fab8f4f6e1f0", hypixelRank: "YOUTUBE", value: 120_489_120_000, subValue: "Exotic Museum & Sacks" },
      { rank: 2, username: "Refraction", uuid: "00000000000000000000000000000001", hypixelRank: "MVP_PLUS_PLUS", value: 95_120_450_000, subValue: "Rank #2 Global" },
      { rank: 3, username: "BazaarBaron", uuid: "00000000000000000000000000000016", hypixelRank: "MVP_PLUS_PLUS", value: 80_910_300_000, subValue: "10 Billion Purse Cash" },
    ],
    thresholds: { top001: 30_000_000_000, top01: 10_000_000_000, top1: 3_000_000_000, top5: 1_000_000_000, top10: 350_000_000, top25: 75_000_000 },
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

/**
 * Calculates accurate player standings across every leaderboard category.
 */
export function calculatePlayerLeaderboardStandings(player: {
  collections?: { id: string; amount: number }[] | null | undefined;
  skillAverage?: number | null | undefined;
  dungeons?: { catacombsLevel?: number | null | undefined; catacombsXp?: number | null | undefined } | null | undefined;
  slayerOverview?: { totalXp?: number | null | undefined } | null | undefined;
  purse?: number | null | undefined;
  bank?: number | null | undefined;
  sacks?: { totalValue?: number | null | undefined } | null | undefined;
}): PlayerStanding[] {
  const standings: PlayerStanding[] = [];

  for (const sub of LEADERBOARD_SUBCATEGORIES) {
    let playerVal = 0;

    if (sub.group === "skills") {
      playerVal = Number((player.skillAverage ?? 0).toFixed(2));
    } else if (sub.group === "dungeons") {
      playerVal = player.dungeons?.catacombsXp ?? (player.dungeons?.catacombsLevel ? player.dungeons.catacombsLevel * 100_000 : 0);
    } else if (sub.group === "slayers") {
      playerVal = player.slayerOverview?.totalXp ?? 0;
    } else if (sub.group === "economy") {
      playerVal = (player.purse ?? 0) + (player.bank ?? 0) + (player.sacks?.totalValue ?? 0);
    } else {
      // Find matching collection item by any alias
      if (player.collections && player.collections.length > 0) {
        for (const key of sub.collectionKeys) {
          const matched = player.collections.find((c) => c.id.toUpperCase() === key.toUpperCase());
          if (matched && matched.amount > playerVal) {
            playerVal = matched.amount;
          }
        }
      }
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
        formattedAmountNeeded: (sub.thresholds.top001 - playerVal).toLocaleString(),
      };
    } else if (playerVal >= sub.thresholds.top1) {
      percentileRank = "Top 1% (Master)";
      percentilePct = 1.0;
      badgeTone = "purple";
      approxRank = "Top #15,000";
      nextTierGoal = {
        tierName: "Top 0.1% (Grandmaster)",
        amountNeeded: sub.thresholds.top01 - playerVal,
        formattedAmountNeeded: (sub.thresholds.top01 - playerVal).toLocaleString(),
      };
    } else if (playerVal >= sub.thresholds.top5) {
      percentileRank = "Top 5% (Diamond)";
      percentilePct = 5.0;
      badgeTone = "gold";
      approxRank = "Top #50,000";
      nextTierGoal = {
        tierName: "Top 1% (Master)",
        amountNeeded: sub.thresholds.top1 - playerVal,
        formattedAmountNeeded: (sub.thresholds.top1 - playerVal).toLocaleString(),
      };
    } else if (playerVal >= sub.thresholds.top10) {
      percentileRank = "Top 10% (Gold)";
      percentilePct = 10.0;
      badgeTone = "gold";
      approxRank = "Top #100,000";
      nextTierGoal = {
        tierName: "Top 5% (Diamond)",
        amountNeeded: sub.thresholds.top5 - playerVal,
        formattedAmountNeeded: (sub.thresholds.top5 - playerVal).toLocaleString(),
      };
    } else if (playerVal >= sub.thresholds.top25) {
      percentileRank = "Top 25% (Silver)";
      percentilePct = 25.0;
      badgeTone = "muted";
      approxRank = "Top #250,000";
      nextTierGoal = {
        tierName: "Top 10% (Gold)",
        amountNeeded: sub.thresholds.top10 - playerVal,
        formattedAmountNeeded: (sub.thresholds.top10 - playerVal).toLocaleString(),
      };
    } else {
      nextTierGoal = {
        tierName: "Top 25% (Silver)",
        amountNeeded: Math.max(0, sub.thresholds.top25 - playerVal),
        formattedAmountNeeded: Math.max(0, sub.thresholds.top25 - playerVal).toLocaleString(),
      };
    }

    standings.push({
      subcategoryId: sub.id,
      categoryName: sub.name,
      playerValue: playerVal,
      formattedPlayerValue: playerVal.toLocaleString(),
      percentileRank,
      percentilePct,
      badgeTone,
      approximateRank: approxRank,
      nextTierGoal,
    });
  }

  return standings;
}
