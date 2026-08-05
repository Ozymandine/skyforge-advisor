export const profile = {
  username: "Ozymandine",
  profileName: "Grapes",
  profileType: "Co Op",
  members: 2,
  syncedAt: "12:38 PM",
  skyblockLevel: 43,
  totalXp: "2.63K",
};

export const profiles = [
  { name: "Grapes", type: "co op", members: 2, active: true },
  { name: "Blueberry", type: "bingo", members: 1, active: false },
  { name: "Pineapple", type: "co op", members: 4, active: false },
  { name: "Lime", type: "Standard", members: 1, active: false },
];

export type Skill = {
  name: string;
  level: number;
  current: string;
  target: string;
  pct: number;
};

export const skills: Skill[] = [
  { name: "Combat", level: 18, current: "1.32K", target: "100K", pct: 1 },
  { name: "Mining", level: 20, current: "78.6K", target: "300K", pct: 26 },
  { name: "Farming", level: 14, current: "5.71K", target: "20K", pct: 29 },
  { name: "Fishing", level: 14, current: "3.90K", target: "20K", pct: 20 },
  { name: "Foraging", level: 12, current: "6.89K", target: "10K", pct: 69 },
  { name: "Enchanting", level: 22, current: "193.6K", target: "500K", pct: 39 },
  { name: "Alchemy", level: 4, current: "316", target: "500", pct: 63 },
  { name: "Taming", level: 17, current: "61.6K", target: "75K", pct: 82 },
  { name: "Carpentry", level: 6, current: "255", target: "1K", pct: 26 },
  { name: "Runecrafting", level: 2, current: "167", target: "200", pct: 83 },
  { name: "Social", level: 1, current: "37", target: "125", pct: 30 },
  { name: "Hunting", level: 0, current: "0", target: "50", pct: 0 },
];

export const collectionCategories = [
  {
    name: "Farming",
    unlocked: 12,
    total: 21,
    items: [
      { name: "Wheat", tier: "VII", amount: "412,904", pct: 74 },
      { name: "Carrot", tier: "V", amount: "88,120", pct: 42 },
      { name: "Sugar Cane", tier: "VI", amount: "150,331", pct: 61 },
      { name: "Nether Wart", tier: "IX", amount: "1,204,880", pct: 92 },
    ],
  },
  {
    name: "Mining",
    unlocked: 9,
    total: 18,
    items: [
      { name: "Cobblestone", tier: "VIII", amount: "620,440", pct: 81 },
      { name: "Coal", tier: "VI", amount: "94,201", pct: 55 },
      { name: "Mithril", tier: "IV", amount: "31,006", pct: 33 },
      { name: "Diamond", tier: "V", amount: "48,772", pct: 47 },
    ],
  },
  {
    name: "Combat",
    unlocked: 7,
    total: 12,
    items: [
      { name: "Rotten Flesh", tier: "VII", amount: "204,881", pct: 68 },
      { name: "Bone", tier: "VI", amount: "132,048", pct: 59 },
      { name: "Blaze Rod", tier: "III", amount: "9,204", pct: 22 },
      { name: "Ender Pearl", tier: "V", amount: "42,110", pct: 51 },
    ],
  },
  {
    name: "Foraging",
    unlocked: 5,
    total: 9,
    items: [
      { name: "Oak Wood", tier: "VI", amount: "180,441", pct: 63 },
      { name: "Spruce Wood", tier: "IV", amount: "40,922", pct: 38 },
      { name: "Jungle Wood", tier: "III", amount: "18,077", pct: 27 },
      { name: "Dark Oak Wood", tier: "V", amount: "62,410", pct: 49 },
    ],
  },
];

export const inventoryTabs = [
  {
    id: "ender-chest",
    label: "Ender Chest",
    slots: 45,
    items: [
      { name: "Hyperion", rarity: "MYTHIC", qty: 1, value: "980M" },
      { name: "Necron's Handle", rarity: "EPIC", qty: 1, value: "112M" },
      { name: "Enchanted Diamond Block", rarity: "RARE", qty: 64, value: "18M" },
      { name: "Superior Dragon Fragment", rarity: "LEGENDARY", qty: 12, value: "34M" },
      { name: "Wither Catalyst", rarity: "EPIC", qty: 4, value: "22M" },
      { name: "Refined Mithril", rarity: "RARE", qty: 160, value: "9.4M" },
    ],
  },
  {
    id: "wardrobe",
    label: "Wardrobe",
    slots: 18,
    items: [
      { name: "Necron's Chestplate", rarity: "LEGENDARY", qty: 1, value: "88M" },
      { name: "Storm's Leggings", rarity: "LEGENDARY", qty: 1, value: "54M" },
      { name: "Shadow Assassin Boots", rarity: "EPIC", qty: 1, value: "12M" },
      { name: "Crimson Helmet", rarity: "EPIC", qty: 1, value: "7.2M" },
    ],
  },
  {
    id: "armor",
    label: "Armor",
    slots: 4,
    items: [
      { name: "Necron's Helmet", rarity: "LEGENDARY", qty: 1, value: "64M" },
      { name: "Necron's Chestplate", rarity: "LEGENDARY", qty: 1, value: "88M" },
      { name: "Necron's Leggings", rarity: "LEGENDARY", qty: 1, value: "71M" },
      { name: "Necron's Boots", rarity: "LEGENDARY", qty: 1, value: "58M" },
    ],
  },
  {
    id: "backpacks",
    label: "Backpacks",
    slots: 36,
    items: [
      { name: "Jumbo Backpack", rarity: "EPIC", qty: 2, value: "16M" },
      { name: "Greater Backpack", rarity: "RARE", qty: 3, value: "4.8M" },
      { name: "Enchanted Cobblestone", rarity: "RARE", qty: 512, value: "2.1M" },
    ],
  },
  {
    id: "accessory-bag",
    label: "Accessory Bag",
    slots: 42,
    items: [
      { name: "Hegemony Artifact", rarity: "MYTHIC", qty: 1, value: "240M" },
      { name: "Wither Artifact", rarity: "LEGENDARY", qty: 1, value: "31M" },
      { name: "Titanium Talisman", rarity: "RARE", qty: 1, value: "1.2M" },
      { name: "Bat Person Artifact", rarity: "EPIC", qty: 1, value: "9.9M" },
    ],
  },
];

export const bazaarStats = [
  { label: "Bazaar products", value: "1,939", sub: "Official Hypixel feed" },
  { label: "Profitable markets", value: "1,532", sub: "After 1.25% tax" },
  { label: "Average spread", value: "18.4%", sub: "Order-to-order" },
  { label: "Hourly volume", value: "8.6M", sub: "Refreshes in 52s" },
];

export const bazaarItems = [
  {
    name: "Enchanted Titanium",
    id: "ENCHANTED_TITANIUM",
    buy: "31K",
    sell: "40.9K",
    profit: "9.4K",
    perHour: "88.2M",
    liquidity: 87,
    health: 90,
    roi: 100,
  },
  {
    name: "Booster Cookie",
    id: "BOOSTER_COOKIE",
    buy: "12.5M",
    sell: "12.8M",
    profit: "156.6K",
    perHour: "71.5M",
    liquidity: 59,
    health: 70,
    roi: 13,
  },
  {
    name: "Fifth Master Star",
    id: "FIFTH_MASTER_STAR",
    buy: "109.4M",
    sell: "128.4M",
    profit: "19M",
    perHour: "3.7M",
    liquidity: 15,
    health: 37,
    roi: 100,
  },
  {
    name: "Hyper Catalyst",
    id: "HYPER_CATALYST",
    buy: "1.1M",
    sell: "1.4M",
    profit: "260K",
    perHour: "22.4M",
    liquidity: 74,
    health: 81,
    roi: 24,
  },
  {
    name: "Enchanted Redstone Block",
    id: "ENCHANTED_REDSTONE_BLOCK",
    buy: "412K",
    sell: "498K",
    profit: "72.4K",
    perHour: "14.9M",
    liquidity: 66,
    health: 78,
    roi: 18,
  },
  {
    name: "Grand Experience Bottle",
    id: "GRAND_EXP_BOTTLE",
    buy: "244K",
    sell: "301K",
    profit: "48.2K",
    perHour: "9.8M",
    liquidity: 52,
    health: 63,
    roi: 20,
  },
];

export const auctionStats = [
  { label: "Active auctions", value: "49,616", sub: "50 API pages" },
  { label: "BIN / bid listings", value: "46,576 / 3,040", sub: "2,445 unique items" },
  { label: "Average BIN", value: "55.3M", sub: "Active BIN listings" },
  { label: "Lowest BIN opportunities", value: "5,294", sub: "Refreshes in 50s" },
];

export const auctions = [
  {
    name: "Blue Crush Sheep Skin",
    rarity: "EPIC",
    type: "BIN",
    price: "300M",
    lowestBin: "300M",
    profit: "950M",
    time: "238h 12m",
    value: 100,
    competition: 100,
    uuid: "3DA9D8B9EAE74EC2AE02D50D66ECF62B",
  },
  {
    name: "Withered Scylla",
    rarity: "MYTHIC",
    type: "BIN",
    price: "688M",
    lowestBin: "688M",
    profit: "812M",
    time: "330h 55m",
    value: 100,
    competition: 100,
    uuid: "4455EC4CA4204D1195EA1B6F7A91F613",
  },
  {
    name: "Beagle Hound Skin",
    rarity: "RARE",
    type: "BIN",
    price: "190M",
    lowestBin: "190M",
    profit: "610M",
    time: "266h 3m",
    value: 100,
    competition: 100,
    uuid: "165887F30B604F7FA680F1ED025EFBD5",
  },
  {
    name: "Blinking Rock Skin",
    rarity: "MYTHIC",
    type: "BIN",
    price: "144M",
    lowestBin: "150M",
    profit: "410M",
    time: "112h 44m",
    value: 92,
    competition: 74,
    uuid: "9F41B0D8B1A34D0FA0D2C5CE38B4B9E1",
  },
  {
    name: "Jinn Goblin Skin",
    rarity: "EPIC",
    type: "AUCTION",
    price: "88M",
    lowestBin: "96M",
    profit: "204M",
    time: "18h 9m",
    value: 81,
    competition: 62,
    uuid: "C21F1B77A5F44E30A3B01E4C1E9A4B02",
  },
  {
    name: "Necron's Blade",
    rarity: "LEGENDARY",
    type: "BIN",
    price: "410M",
    lowestBin: "418M",
    profit: "126M",
    time: "44h 28m",
    value: 77,
    competition: 88,
    uuid: "77BE3A11D2C64BF7A2C40E3E10A9E0DD",
  },
];

export const netWorth = {
  total: "3.42B",
  soulbound: "612M",
  breakdown: [
    { label: "Purse", value: "124.8M", pct: 4 },
    { label: "Bank", value: "1.10B", pct: 32 },
    { label: "Inventory", value: "486.2M", pct: 14 },
    { label: "Armor & Equipment", value: "281.0M", pct: 8 },
    { label: "Ender Chest & Storage", value: "902.4M", pct: 26 },
    { label: "Accessories", value: "310.1M", pct: 9 },
    { label: "Pets", value: "215.5M", pct: 7 },
  ],
  topAssets: [
    { name: "Hyperion", rarity: "MYTHIC", value: "980M" },
    { name: "Hegemony Artifact", rarity: "MYTHIC", value: "240M" },
    { name: "Necron's Chestplate", rarity: "LEGENDARY", value: "88M" },
    { name: "Golden Dragon (Lvl 187)", rarity: "LEGENDARY", value: "612M" },
    { name: "Shadow Fury", rarity: "LEGENDARY", value: "142M" },
  ],
};

export const advisorRecommendations = [
  {
    title: "Upgrade to Necron's Leggings",
    category: "Gear",
    impact: "+142 Strength",
    cost: "71M",
    efficiency: "500K / stat",
    priority: "High",
    note: "Largest single strength jump available at your current budget.",
  },
  {
    title: "Push Enchanting to level 25",
    category: "Skill",
    impact: "+18 Intelligence",
    cost: "12h grind",
    efficiency: "40m / level",
    priority: "High",
    note: "Superpairs + Grand XP bottles is the fastest active route right now.",
  },
  {
    title: "Buy Bat Person Artifact upgrade",
    category: "Accessory",
    impact: "+8 Magic Find",
    cost: "9.9M",
    efficiency: "1.2M / MF",
    priority: "Medium",
    note: "Cheapest magic find per coin in the accessory bag tier list.",
  },
  {
    title: "Complete Catacombs Floor 6 mastery",
    category: "Dungeons",
    impact: "+1 Cata level",
    cost: "3h runs",
    efficiency: "Free",
    priority: "Medium",
    note: "Unlocks better drop pool and raises your effective health cap.",
  },
  {
    title: "Refine Mithril into Titanium",
    category: "Economy",
    impact: "+18.4M coins",
    cost: "45m",
    efficiency: "24M / hr",
    priority: "Low",
    note: "Bazaar spread is above the weekly average by 14%.",
  },
];

export const goals = [
  { title: "Reach Combat 20", progress: 62, due: "This week", tag: "Skill" },
  { title: "Net worth 4B", progress: 85, due: "This month", tag: "Economy" },
  { title: "Unlock Wither Blade", progress: 41, due: "Aug 20", tag: "Gear" },
  { title: "Farming 20", progress: 24, due: "Sep 01", tag: "Skill" },
];

export const tasks = {
  daily: [
    { label: "Claim daily Bazaar flips", done: true },
    { label: "Run 4 Catacombs F6", done: true },
    { label: "Harvest garden crops", done: false },
    { label: "Complete Kuudra tier 3", done: false },
  ],
  weekly: [
    { label: "Slayer: Enderman tier 4 x5", done: true },
    { label: "Mine 8 Titanium", done: false },
    { label: "Trade with Kat", done: false },
  ],
};

export const xpHistory = [
  { day: "Mon", combat: 1200, mining: 3400, farming: 900 },
  { day: "Tue", combat: 2100, mining: 2800, farming: 1400 },
  { day: "Wed", combat: 1800, mining: 4200, farming: 1100 },
  { day: "Thu", combat: 3200, mining: 3900, farming: 2200 },
  { day: "Fri", combat: 2600, mining: 5100, farming: 1800 },
  { day: "Sat", combat: 4400, mining: 6200, farming: 3100 },
  { day: "Sun", combat: 3900, mining: 5800, farming: 2700 },
];

export const netWorthTrend = [
  { day: "Jul 01", value: 2.1 },
  { day: "Jul 08", value: 2.4 },
  { day: "Jul 15", value: 2.35 },
  { day: "Jul 22", value: 2.9 },
  { day: "Jul 29", value: 3.1 },
  { day: "Aug 03", value: 3.42 },
];

export const eventHistory = [
  { time: "12:38 PM", label: "Profile synced from Hypixel", kind: "sync" },
  { time: "11:04 AM", label: "Sold Hyperion for 980M", kind: "economy" },
  { time: "09:52 AM", label: "Mining reached level 20", kind: "skill" },
  { time: "Yesterday", label: "Goal completed: Net worth 3B", kind: "goal" },
  { time: "Yesterday", label: "Outbid on Withered Scylla", kind: "auction" },
];

export const wikiItems = [
  {
    name: "Hyperion",
    rarity: "MYTHIC",
    category: "Sword",
    lore: "Forged in the Wither King's vault, the Hyperion channels Implosion at devastating range.",
    recipe: ["Necron's Blade", "Wither Catalyst x1", "Aspect of the Void"],
  },
  {
    name: "Necron's Chestplate",
    rarity: "LEGENDARY",
    category: "Armor",
    lore: "Plating pulled from the Master Mode vaults, humming faintly with wither energy.",
    recipe: ["Wither Chestplate", "Necron Handle", "Wither Catalyst x8"],
  },
  {
    name: "Hegemony Artifact",
    rarity: "MYTHIC",
    category: "Accessory",
    lore: "A relic of absolute authority, doubling the reforge stats of your accessory bag.",
    recipe: ["Kuudra Chest drop"],
  },
  {
    name: "Booster Cookie",
    rarity: "EPIC",
    category: "Consumable",
    lore: "Baked with a hint of dragon spice. Grants Cookie Buff for four days.",
    recipe: ["Bazaar purchase"],
  },
  {
    name: "Titanium Talisman",
    rarity: "RARE",
    category: "Accessory",
    lore: "Miners swear by its faint pull toward untouched titanium veins.",
    recipe: ["Refined Titanium x10", "Gold Ingot x32"],
  },
  {
    name: "Grand Experience Bottle",
    rarity: "RARE",
    category: "Consumable",
    lore: "Bottled knowledge, corked before it can escape.",
    recipe: ["Experience Bottle x8"],
  },
];

export const notifications = [
  {
    title: "Flip opportunity: Enchanted Titanium",
    body: "Spread widened to 9.4K per unit — 88.2M profit per hour.",
    time: "2m ago",
    kind: "market",
    unread: true,
  },
  {
    title: "You were outbid",
    body: "Withered Scylla is now at 688M by MelonKnight.",
    time: "14m ago",
    kind: "auction",
    unread: true,
  },
  {
    title: "Goal achieved: Net worth 3B",
    body: "Portfolio crossed 3,000,000,000 coins.",
    time: "1h ago",
    kind: "goal",
    unread: false,
  },
  {
    title: "Mining reached level 20",
    body: "300K XP required for level 21.",
    time: "3h ago",
    kind: "skill",
    unread: false,
  },
  {
    title: "Profile sync complete",
    body: "Grapes profile refreshed from the Hypixel API.",
    time: "5h ago",
    kind: "sync",
    unread: false,
  },
];

export const dashboardCoverage = [
  { label: "Skills", value: "43%", meta: "43 / 100", note: "11 skills with verified XP", verified: true },
  { label: "Collections", value: "9%", meta: "5 / 57", note: "57 collection records available", verified: true },
  { label: "Pets", value: "0", meta: "Verified signal", note: "Pet data is not shared by this profile", verified: false },
  { label: "Dungeons", value: "80%", meta: "4 / 5", note: "5 Dungeon classes tracked", verified: true },
  { label: "Fishing", value: "28%", meta: "14 / 50", note: "Fishing skill progress", verified: true },
  { label: "Accessories", value: "0", meta: "Verified signal", note: "Accessory bag data is not shared", verified: false },
  { label: "Museum", value: "0", meta: "Verified signal", note: "Museum data is not shared", verified: false },
  { label: "Bestiary", value: "0", meta: "Verified signal", note: "Bestiary data is not shared", verified: false },
  { label: "Collection tiers", value: "34%", meta: "166 / 484", note: "Tier unlocks across all categories", verified: true },
];
