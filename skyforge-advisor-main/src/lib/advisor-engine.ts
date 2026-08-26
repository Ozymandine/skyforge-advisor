// src/lib/advisor-engine.ts
// Autonomous SkyBlock Advisor & Progression Intelligence Engine:
// Game stage classifier, ROI-ranked next best actions, gear progression pathways,
// and skill leveling fast-track guides.

import { formatFull, formatNumber, type PlayerData } from "./skyblock";

// ---------------------------------------------------------------------------
// 1. GAME STAGE CLASSIFIER
// ---------------------------------------------------------------------------

export type GameStage = "Early Game" | "Mid Game" | "Late Game" | "End Game";

export type GameStageReport = {
  stage: GameStage;
  stageColor: string;
  badgeClass: string;
  sbLevel: number;
  netWorth: number;
  skillAverage: number;
  catacombsLevel: number;
  magicalPower: number;
  stageSummary: string;
};

export function evaluateGameStage(
  sbLevel = 50,
  netWorth = 50_000_000,
  skillAverage = 22,
  catacombsLevel = 12,
  magicalPower = 200,
): GameStageReport {
  let stage: GameStage = "Early Game";
  let stageColor = "#22c55e";
  let badgeClass = "border-emerald-500/40 bg-emerald-500/15 text-emerald-300";
  let stageSummary = "Focus on unlocking collections, fairy souls, basic dragon armor, and cheap talismans.";

  if (sbLevel >= 280 || netWorth >= 7_000_000_000 || (skillAverage >= 50 && catacombsLevel >= 42)) {
    stage = "End Game";
    stageColor = "#a855f7";
    badgeClass = "border-purple-500/40 bg-purple-500/15 text-purple-300";
    stageSummary = "Endgame mastery: Master Mode 7 clears, Kuudra T5 Infernal, 1,200+ MP, and Golden Dragon Level 200.";
  } else if (sbLevel >= 180 || netWorth >= 1_500_000_000 || (skillAverage >= 40 && catacombsLevel >= 30)) {
    stage = "Late Game";
    stageColor = "#38bdf8";
    badgeClass = "border-sky-400/40 bg-sky-500/15 text-sky-300";
    stageSummary = "Late game scaling: Wither blades (Hyperion), Terminator, Necron/Storm armor, and Slayer 8/9 passives.";
  } else if (sbLevel >= 80 || netWorth >= 150_000_000 || (skillAverage >= 26 && catacombsLevel >= 18)) {
    stage = "Mid Game";
    stageColor = "#eab308";
    badgeClass = "border-amber-400/40 bg-amber-500/15 text-amber-300";
    stageSummary = "Mid game transition: Shadow Assassin / Crimson armor, Juju Shortbow, Spirit Sceptre, and F5-F7 runs.";
  }

  return {
    stage,
    stageColor,
    badgeClass,
    sbLevel,
    netWorth,
    skillAverage,
    catacombsLevel,
    magicalPower,
    stageSummary,
  };
}

// ---------------------------------------------------------------------------
// 2. PERSONALIZED HIGH-ROI ACTION MATRIX
// ---------------------------------------------------------------------------

export type AdvisorAction = {
  id: string;
  title: string;
  category: "Accessories" | "Slayers" | "Skills" | "Dungeons" | "Minions" | "Farming" | "Mining";
  roiTier: "💎 S-Tier (Essential)" | "🟢 A-Tier (High Value)" | "🟡 B-Tier (Solid Upgrade)";
  estimatedCost: string;
  statReward: string;
  description: string;
  actionCommand?: string;
};

export type AdvisorPlayerInput = {
  fairySouls?: number | undefined;
  skillAverage?: number | undefined;
  dungeons?: { catacombsLevel?: number | undefined } | undefined;
  slayers?: Array<{ name: string; tier?: number | undefined; kills?: number | undefined }> | undefined;
  skills?: Array<{ key: string; level?: number | undefined }> | undefined;
};

export function generateAdvisorActions(player?: AdvisorPlayerInput | null | undefined): AdvisorAction[] {
  const actions: AdvisorAction[] = [];

  const fairySouls = player?.fairySouls ?? 50;
  const skillAvg = player?.skillAverage ?? 25;
  const cataLvl = player?.dungeons?.catacombsLevel ?? 15;
  const slayers = player?.slayers ?? [];
  const emanSlayer = slayers.find((s) => s.name.toLowerCase().includes("voidgloom") || s.name.toLowerCase().includes("enderman"));
  const emanLvl = emanSlayer?.tier ?? 3;

  // 1. Fairy Souls
  if (fairySouls < 220) {
    actions.push({
      id: "fairy_souls",
      title: `Claim ${242 - fairySouls} Missing Fairy Souls`,
      category: "Skills",
      roiTier: "💎 S-Tier (Essential)",
      estimatedCost: "Free (0 coins)",
      statReward: `+${(242 - fairySouls) * 2} HP, +Defense, +Speed`,
      description: "Fairy souls grant permanent base HP, Defense, Strength, and Speed without spending coins.",
    });
  }

  // 2. Juju Shortbow / Eman Slayer
  if (emanLvl < 5) {
    actions.push({
      id: "juju_unlock",
      title: "Unlock Enderman Slayer Level 5 (Juju Shortbow)",
      category: "Slayers",
      roiTier: "💎 S-Tier (Essential)",
      estimatedCost: "~3M - 5M coins in carry / gear",
      statReward: "Unlocks Juju Shortbow (Best Mid-game weapon)",
      description: "Juju Shortbow triples your Dungeon room-clearing speed and DPS compared to standard bows.",
    });
  }

  // 3. Cheap MP Accessory Buys
  actions.push({
    id: "cheap_mp",
    title: "Craft & Buy Low-Tier Missing Accessories (<100k coins)",
    category: "Accessories",
    roiTier: "💎 S-Tier (Essential)",
    estimatedCost: "< 250k coins total",
    statReward: "+15 to +35 Magical Power",
    description: "Feather Ring, Piggy Bank, Healing Ring, and Farming Talisman give massive damage bonus per coin spent.",
    actionCommand: "/ah",
  });

  // 4. Daily Enchanting Experimentation
  const enchantingSkill = player?.skills?.find((s) => s.key === "ENCHANTING");
  if ((enchantingSkill?.level ?? 30) < 60) {
    actions.push({
      id: "daily_superpairs",
      title: "Complete Daily Superpairs & Experimentation Table",
      category: "Skills",
      roiTier: "💎 S-Tier (Essential)",
      estimatedCost: "1 Titanic EXP Bottle (~350k)",
      statReward: "+500k to +1.2M Enchanting XP / day + T7 books",
      description: "Fastest skill to Level 60 in SkyBlock. Grants massive Intelligence and Ability Damage.",
    });
  }

  // 5. Minion Slots Expansion
  actions.push({
    id: "minion_expansion",
    title: "Craft Unique Minions to reach 20-25 Minion Slots",
    category: "Minions",
    roiTier: "🟢 A-Tier (High Value)",
    estimatedCost: "~2M - 4M coins",
    statReward: "+1-3 Passive Minion Slots (+250k-750k coins/day)",
    description: "Crafting Tier 1-5 of every minion type is extremely cheap and permanently expands passive income.",
  });

  // 6. Catacombs Floor 5 / Shadow Assassin
  if (cataLvl < 14) {
    actions.push({
      id: "f5_shadow_assassin",
      title: "Clear Floor 5 & Equip Shadow Assassin Armor",
      category: "Dungeons",
      roiTier: "🟢 A-Tier (High Value)",
      estimatedCost: "~15M coins",
      statReward: "+150 Strength, +Crit Damage, +Dungeon Survivability",
      description: "Clearing Floor 5 unlocks the Shadow Assassin armor set requirement, boosting your DPS.",
    });
  }

  // 7. Garden Visitor Dedication 4 & Plots
  actions.push({
    id: "garden_expansion",
    title: "Unlock 10+ Garden Plots & Level Garden to 10",
    category: "Farming",
    roiTier: "🟡 B-Tier (Solid Upgrade)",
    estimatedCost: "Compost & Garden Cleanups",
    statReward: "+30 to +50 Farming Fortune",
    description: "Every plot unlocked permanently adds +3 Farming Fortune across all crops.",
  });

  return actions;
}

// ---------------------------------------------------------------------------
// 3. LINEAR GEAR PROGRESSION TREES
// ---------------------------------------------------------------------------

export type GearStep = {
  stage: string;
  weapon: string;
  armor: string;
  estimatedPrice: string;
  recommendedPet: string;
};

export type ClassProgressionTree = {
  className: "Archer / Berserk" | "Mage" | "Mining Specialist" | "Farming Specialist";
  description: string;
  steps: GearStep[];
};

export const CLASS_PROGRESSION_TREES: ClassProgressionTree[] = [
  {
    className: "Archer / Berserk",
    description: "High single-target DPS and fast Dungeon clear speed with bows and swords.",
    steps: [
      {
        stage: "Starter (Level 1–40)",
        weapon: "Void Sword / Aspect of the End",
        armor: "Glacite Armor $\to$ Unstable Dragon Armor",
        estimatedPrice: "500k - 1.5M coins",
        recommendedPet: "Rare Tiger (Level 70+)",
      },
      {
        stage: "Mid-Game (Level 40–120)",
        weapon: "Juju Shortbow (5★) / Shadow Fury",
        armor: "3/4 Shadow Assassin + Zombie Knight Chest",
        estimatedPrice: "25M - 45M coins",
        recommendedPet: "Epic Baby Yeti / Wither Skeleton",
      },
      {
        stage: "Late Game (Level 120–220)",
        weapon: "Terminator Bow / Giant's Sword",
        armor: "3/4 Necron Armor + Maxor Boots (5★)",
        estimatedPrice: "650M - 900M coins",
        recommendedPet: "Legendary Ender Dragon / Lion",
      },
      {
        stage: "Endgame (Level 220+)",
        weapon: "Terminator (Duplex V / Fatal V, 10★)",
        armor: "Infernal Terror / Crimson Armor (10★)",
        estimatedPrice: "2.5B - 4.5B coins",
        recommendedPet: "Golden Dragon (Level 200 + 1B Bank)",
      },
    ],
  },
  {
    className: "Mage",
    description: "Massive area-of-effect ability damage and lightning-fast mob clearing.",
    steps: [
      {
        stage: "Starter (Level 1–40)",
        weapon: "Dreadlord Sword / Aurora Staff",
        armor: "Wise Dragon Armor (5★)",
        estimatedPrice: "2M - 4M coins",
        recommendedPet: "Rare Sheep Pet (Level 70+)",
      },
      {
        stage: "Mid-Game (Level 40–120)",
        weapon: "Spirit Sceptre (5★) / Midas Staff (100M)",
        armor: "3/4 Wise / Necromancer Lord + Shadow Goggles",
        estimatedPrice: "30M - 120M coins",
        recommendedPet: "Legendary Sheep (with Text Book)",
      },
      {
        stage: "Late Game (Level 120–220)",
        weapon: "Hyperion (Wither Impact, 5★)",
        armor: "3/4 Storm's Armor + Wither Goggles",
        estimatedPrice: "1.2B - 1.5B coins",
        recommendedPet: "Mythic Black Cat / Sheep",
      },
      {
        stage: "Endgame (Level 220+)",
        weapon: "Hyperion (Chimera V / 10★ Master Stars)",
        armor: "Infernal Aurora Armor (Mana Pool X / Veteran X)",
        estimatedPrice: "3.5B - 6.0B coins",
        recommendedPet: "Golden Dragon (Level 200)",
      },
    ],
  },
  {
    className: "Mining Specialist",
    description: "Gemstone and Mithril mining for high hourly coin yields and powder.",
    steps: [
      {
        stage: "Starter (HOTM 1–3)",
        weapon: "Pickonimbus 2000 / Bandaged Mithril Pick",
        armor: "Glacite Armor",
        estimatedPrice: "300k coins",
        recommendedPet: "Uncommon Armadillo Pet",
      },
      {
        stage: "Mid-Game (HOTM 4–6)",
        weapon: "Titanium Drill DR-X355 / Mithril Drill SX-R326",
        armor: "Sorrow Armor (Fine Gemstones)",
        estimatedPrice: "35M - 60M coins",
        recommendedPet: "Epic Mithril Golem / Scatha",
      },
      {
        stage: "Late Game (HOTM 7–10)",
        weapon: "Titanium Drill DR-X655 (Amber Engine)",
        armor: "Divan's Armor (Perfect Topaz & Jade)",
        estimatedPrice: "450M - 750M coins",
        recommendedPet: "Legendary Bal / Rare Scatha",
      },
      {
        stage: "Endgame (HOTM 10)",
        weapon: "Divan's Drill (Full Perfect Gemstones)",
        armor: "Divan's Armor (Perfect Gemstones + Recomb)",
        estimatedPrice: "1.8B - 2.5B coins",
        recommendedPet: "Legendary Scatha (Level 100)",
      },
    ],
  },
  {
    className: "Farming Specialist",
    description: "Garden crop farming for steady 12M–16M coins/hour and Jacob medals.",
    steps: [
      {
        stage: "Starter (Garden 1–4)",
        weapon: "T2 Rookie Hoe / Advanced Gardening Axe",
        armor: "Farm Suit $\to$ Farm Armor",
        estimatedPrice: "100k - 500k coins",
        recommendedPet: "Rare Rabbit Pet (for XP)",
      },
      {
        stage: "Mid-Game (Garden 5–8)",
        weapon: "T2 Mathematical Hoe / Dicer 2.0",
        armor: "Crop Armor $\to$ Melon Armor $\to$ Cropie Armor",
        estimatedPrice: "8M - 20M coins",
        recommendedPet: "Epic Elephant Pet",
      },
      {
        stage: "Late Game (Garden 9–12)",
        weapon: "T3 Mathematical Hoe (Cultivating 9, Turbo V)",
        armor: "Squash Armor $\to$ Fermento Armor",
        estimatedPrice: "45M - 80M coins",
        recommendedPet: "Legendary Elephant (Green Bandana)",
      },
      {
        stage: "Endgame (Garden 15+)",
        weapon: "T3 Mathematical Hoe (Dedication IV, Cultivating 10)",
        armor: "Fermento Armor (Mossy Reforge, Pesterminator V)",
        estimatedPrice: "150M - 250M coins",
        recommendedPet: "Legendary Mooshroom Cow / Elephant 100",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// 4. SKILL FAST-TRACK LEVELING GUIDES
// ---------------------------------------------------------------------------

export type SkillLevelingGuide = {
  skill: string;
  icon: string;
  recommendedPet: string;
  fastestMethod: string;
  budgetMethod: string;
  hourlyXpRate: string;
};

export const SKILL_LEVELING_GUIDES: SkillLevelingGuide[] = [
  {
    skill: "Combat",
    icon: "⚔️",
    recommendedPet: "Wolf (for +30% Combat XP) or GDrag",
    fastestMethod: "Tier 5 Revenant Horror slayers (with God Pot + Cookie)",
    budgetMethod: "Bestiary milestone hunting in Crimson Isle / End",
    hourlyXpRate: "1.5M - 3.2M XP/hr",
  },
  {
    skill: "Mining",
    icon: "⛏️",
    recommendedPet: "Silverfish (for +30% Mining XP) or Mithril Golem",
    fastestMethod: "Glacite Tunnels Mithril & Tungsten / Umber routes",
    budgetMethod: "Dwarven Mines Mithril vein commissions",
    hourlyXpRate: "1.2M - 2.8M XP/hr",
  },
  {
    skill: "Farming",
    icon: "🌾",
    recommendedPet: "Legendary Rabbit (+30% Farming XP)",
    fastestMethod: "Mushroom / Pumpkin / Sugar Cane with 20 BPS speed tuning",
    budgetMethod: "Wheat in Hub / Garden plot lane farming",
    hourlyXpRate: "800k - 1.6M XP/hr",
  },
  {
    skill: "Enchanting",
    icon: "🔮",
    recommendedPet: "Guardian Pet (+30% Enchanting XP)",
    fastestMethod: "Daily Superpairs + Chronomatron + Ultra-Sequencer",
    budgetMethod: "Titanic EXP Bottles on Grand enchanting table",
    hourlyXpRate: "1.0M - 2.5M XP/day (Time-gated)",
  },
  {
    skill: "Alchemy",
    icon: "🧪",
    recommendedPet: "Black Cat / Sheep / GDrag",
    fastestMethod: "Brewing Enchanted Sugar Cane with Speed Potion base (Alchemy 50 in 30 mins)",
    budgetMethod: "Brewing Enchanted Fermented Spider Eyes",
    hourlyXpRate: "15M - 25M XP/hr (Cost: ~35M coins)",
  },
];
