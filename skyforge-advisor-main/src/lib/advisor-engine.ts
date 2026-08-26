// src/lib/advisor-engine.ts
// Deep Personalized SkyBlock Advisor Engine:
// Ingests live player telemetry (skills, slayers, gear, containers, purse, bank, fairy souls,
// dungeons, garden, hotm) and computes tailored, math-driven recommendations.

import { formatFull, formatNumber, type PlayerData, type InventoryItem } from "./skyblock";
import { MP_BY_RARITY, type AccessoryRarity } from "./accessory-data";
import { calculateSkyBlockLevel } from "./skyblock-level";

// ---------------------------------------------------------------------------
// 1. DYNAMIC GAME STAGE CLASSIFIER & STAT AUDIT
// ---------------------------------------------------------------------------

export type GameStage = "Early Game" | "Mid Game" | "Late Game" | "End Game";

export type ProfileAudit = {
  score: number; // 0–100 overall score
  stage: GameStage;
  stageColor: string;
  badgeClass: string;
  summary: string;

  // Granular Audits
  mpAudit: {
    currentMp: number;
    targetMp: number;
    deficit: number;
    score: number; // 0–100
    statusText: string;
  };
  soulAudit: {
    collected: number;
    max: number;
    missing: number;
    lostHp: number;
    score: number;
    statusText: string;
  };
  skillAudit: {
    skillAverage: number;
    lowestSkillName: string;
    lowestSkillLevel: number;
    lowestSkillXpToNext: number;
    score: number;
    statusText: string;
  };
  slayerAudit: {
    totalXp: number;
    revLvl: number;
    taraLvl: number;
    svenLvl: number;
    emanLvl: number;
    score: number;
    statusText: string;
  };
  dungeonAudit: {
    catacombsLevel: number;
    highestFloorCompleted: string;
    nextFloorTarget: string;
    score: number;
    statusText: string;
  };
  minionAudit: {
    uniqueCrafts: number;
    currentSlots: number;
    craftsToNextSlot: number;
    score: number;
    statusText: string;
  };
};

export type AdvisorPlayerInput = {
  username?: string | undefined;
  uuid?: string | undefined;
  purse?: number | undefined;
  bank?: number | null | undefined;
  fairySouls?: number | undefined;
  skillAverage?: number | undefined;
  skills?: Array<{ name?: string | undefined; key?: string | undefined; level?: number | undefined; currentXp?: number | undefined; neededXp?: number | undefined; maxed?: boolean | undefined }> | undefined;
  slayers?: Array<{ name: string; tier?: number | undefined; kills?: number | undefined; xp?: number | undefined }> | undefined;
  dungeons?: {
    catacombsLevel?: number | undefined;
    floors?: Array<{ name: string; completions: number }> | undefined;
  } | undefined;
  containers?: Array<{ id: string; items: InventoryItem[] }> | undefined;
  collections?: Array<{ id: string; name: string }> | undefined;
  hypixelPlayer?: {
    rank?: string | undefined;
    monthlyPackageRank?: string | undefined;
    newPackageRank?: string | undefined;
    packageRank?: string | undefined;
    prefix?: string | undefined;
    rankPlusColor?: string | undefined;
    monthlyRankColor?: string | undefined;
  } | undefined;
};

export function performProfileAudit(player?: AdvisorPlayerInput | null | undefined): ProfileAudit {
  const sbLevel = player ? calculateSkyBlockLevel(player as PlayerData).level : 25;
  const netWorth = player ? (player.purse ?? 0) + (player.bank ?? 0) : 10_000_000;
  const skillAvg = player?.skillAverage ?? 18;
  const cataLvl = player?.dungeons?.catacombsLevel ?? 0;
  const souls = player?.fairySouls ?? 0;

  // Calculate actual Magical Power from accessory bag / inventory
  let currentMp = 0;
  for (const c of player?.containers ?? []) {
    if (c.id === "accessory_bag" || c.id === "inventory" || c.id === "talisman_bag") {
      for (const item of c.items) {
        const rar = (item.rarity?.toUpperCase() ?? "COMMON") as AccessoryRarity;
        if (MP_BY_RARITY[rar]) {
          currentMp += MP_BY_RARITY[rar];
        }
      }
    }
  }

  // Determine Game Stage
  let stage: GameStage = "Early Game";
  let stageColor = "#22c55e";
  let badgeClass = "border-emerald-500/40 bg-emerald-500/15 text-emerald-300";
  let summary = "You are in the foundational phase of SkyBlock. Focus on low-hanging permanent stats, cheap accessories, and unlocking collections.";

  if (sbLevel >= 280 || netWorth >= 7_000_000_000 || (skillAvg >= 50 && cataLvl >= 42)) {
    stage = "End Game";
    stageColor = "#a855f7";
    badgeClass = "border-purple-500/40 bg-purple-500/15 text-purple-300";
    summary = "Endgame powerhouse. Focus on Master Mode 7 speedruns, Kuudra T5 Infernal, Golden Dragon 200, and maxing out remaining Slayer 9 passives.";
  } else if (sbLevel >= 180 || netWorth >= 1_500_000_000 || (skillAvg >= 40 && cataLvl >= 30)) {
    stage = "Late Game";
    stageColor = "#38bdf8";
    badgeClass = "border-sky-400/40 bg-sky-500/15 text-sky-300";
    summary = "Late game scaling. You have high base stats — focus on Terminator/Hyperion optimizations, 800+ MP, and Master Mode clearances.";
  } else if (sbLevel >= 80 || netWorth >= 150_000_000 || (skillAvg >= 26 && cataLvl >= 18)) {
    stage = "Mid Game";
    stageColor = "#eab308";
    badgeClass = "border-amber-400/40 bg-amber-500/15 text-amber-300";
    summary = "Mid game transition. Focus on Juju Shortbow, Shadow Assassin / Necron armor, 500+ MP, and pushing Catacombs Floor 7.";
  }

  // 1. MP Benchmark based on Stage
  const targetMp = stage === "Early Game" ? 300 : stage === "Mid Game" ? 550 : stage === "Late Game" ? 850 : 1200;
  const mpScore = Math.min(100, Math.round((currentMp / targetMp) * 100));
  const mpDeficit = Math.max(0, targetMp - currentMp);
  const mpStatusText =
    mpDeficit === 0
      ? `Strong accessory bag (${currentMp} MP). Matches your ${stage} benchmark.`
      : `Missing ${mpDeficit} MP for your game stage (Current: ${currentMp} MP / Target: ${targetMp} MP). You are losing ~${Math.min(60, Math.round(mpDeficit * 0.12))}% potential damage.`;

  // 2. Fairy Soul Audit
  const maxSouls = 242;
  const missingSouls = Math.max(0, maxSouls - souls);
  const soulScore = Math.min(100, Math.round((souls / maxSouls) * 100));
  const lostHp = missingSouls * 2;
  const soulStatusText =
    missingSouls === 0
      ? "All 242 Fairy Souls collected. Max permanent HP bonus achieved."
      : `Missing ${missingSouls} Fairy Souls (-${lostHp} Max HP, -${Math.round(missingSouls * 0.5)} Defense).`;

  // 3. Skill Balance Audit
  const nonMaxedSkills = (player?.skills?.filter((s) => !s.maxed) ?? []).filter((s) => typeof s.level === "number");
  const lowestSkill = nonMaxedSkills.sort((a, b) => (a.level ?? 0) - (b.level ?? 0))[0] ?? {
    name: "Combat",
    level: 15,
    neededXp: 100_000,
    currentXp: 20_000,
  };
  const lowestSkillName = lowestSkill.name ?? "Combat";
  const lowestSkillLevel = lowestSkill.level ?? 15;
  const skillScore = Math.min(100, Math.round((skillAvg / 55) * 100));
  const skillStatusText = `Skill Avg: ${skillAvg.toFixed(2)}. Your lowest skill is ${lowestSkillName} (Lvl ${lowestSkillLevel}), dragging down your profile progression.`;

  // 4. Slayer Audit
  const slayers = player?.slayers ?? [];
  const rev = slayers.find((s) => s.name.toLowerCase().includes("zombie") || s.name.toLowerCase().includes("revenant"))?.tier ?? 0;
  const tara = slayers.find((s) => s.name.toLowerCase().includes("spider") || s.name.toLowerCase().includes("tarantula"))?.tier ?? 0;
  const sven = slayers.find((s) => s.name.toLowerCase().includes("wolf") || s.name.toLowerCase().includes("sven"))?.tier ?? 0;
  const eman = slayers.find((s) => s.name.toLowerCase().includes("enderman") || s.name.toLowerCase().includes("voidgloom"))?.tier ?? 0;
  const slayerXpTotal = slayers.reduce((sum, s) => sum + (s.xp ?? 0), 0);
  const slayerScore = Math.min(100, Math.round((slayerXpTotal / 1_000_000) * 100));
  const slayerStatusText = `Rev ${rev} · Tara ${tara} · Sven ${sven} · Eman ${eman}. ${eman < 5 ? "Need Eman 5 for Juju Shortbow." : rev < 7 ? "Need Rev 7 for Reaper Falchion." : "Slayer passives in good standing."}`;

  // 5. Dungeon Audit
  const floors = player?.dungeons?.floors ?? [];
  const completedFloors = floors.filter((f) => f.completions > 0);
  const highestFloor = completedFloors.length > 0 ? completedFloors[completedFloors.length - 1]!.name : "None";
  const nextFloor = floors.find((f) => f.completions === 0)?.name ?? "Master Mode Floor 7";
  const dungeonScore = Math.min(100, Math.round((cataLvl / 50) * 100));
  const dungeonStatusText =
    cataLvl === 0
      ? "Catacombs not started. Run Entrance & Floor 1 to unlock dungeon stats."
      : `Catacombs Level ${cataLvl}. Highest Floor: ${highestFloor}. Next Target: ${nextFloor}.`;

  // 6. Minion Audit
  const uniqueCrafts = player?.collections?.length ?? 120;
  const currentSlots = Math.min(31, Math.max(5, Math.floor(uniqueCrafts / 25) + 5));
  const craftsToNextSlot = Math.max(1, 25 - (uniqueCrafts % 25));
  const minionScore = Math.min(100, Math.round((currentSlots / 31) * 100));
  const minionStatusText = `${currentSlots} / 31 Minion Slots unlocked. Craft ${craftsToNextSlot} more unique minion tiers to unlock Slot ${currentSlots + 1}.`;

  const overallScore = Math.round((mpScore + soulScore + skillScore + slayerScore + dungeonScore + minionScore) / 6);

  return {
    score: overallScore,
    stage,
    stageColor,
    badgeClass,
    summary,
    mpAudit: {
      currentMp,
      targetMp,
      deficit: mpDeficit,
      score: mpScore,
      statusText: mpStatusText,
    },
    soulAudit: {
      collected: souls,
      max: maxSouls,
      missing: missingSouls,
      lostHp,
      score: soulScore,
      statusText: soulStatusText,
    },
    skillAudit: {
      skillAverage: skillAvg,
      lowestSkillName,
      lowestSkillLevel,
      lowestSkillXpToNext: Math.max(0, (lowestSkill.neededXp ?? 0) - (lowestSkill.currentXp ?? 0)),
      score: skillScore,
      statusText: skillStatusText,
    },
    slayerAudit: {
      totalXp: slayerXpTotal,
      revLvl: rev,
      taraLvl: tara,
      svenLvl: sven,
      emanLvl: eman,
      score: slayerScore,
      statusText: slayerStatusText,
    },
    dungeonAudit: {
      catacombsLevel: cataLvl,
      highestFloorCompleted: highestFloor,
      nextFloorTarget: nextFloor,
      score: dungeonScore,
      statusText: dungeonStatusText,
    },
    minionAudit: {
      uniqueCrafts,
      currentSlots,
      craftsToNextSlot,
      score: minionScore,
      statusText: minionStatusText,
    },
  };
}

// ---------------------------------------------------------------------------
// 2. TAILORED DYNAMIC ACTION PLAN
// ---------------------------------------------------------------------------

export type TailoredAction = {
  id: string;
  title: string;
  category: "Accessories" | "Skills" | "Slayers" | "Dungeons" | "Minions" | "Farming" | "Economy";
  priority: "🔥 URGENT (Highest ROI)" | "💎 HIGH VALUE" | "🎯 SOLID PROGRESSION";
  currentStatText: string;
  targetGoalText: string;
  exactRewardText: string;
  estimatedCost: string;
  actionGuidance: string;
  inGameCommand?: string;
};

export function generateTailoredActionPlan(player?: AdvisorPlayerInput | null | undefined): TailoredAction[] {
  const audit = performProfileAudit(player);
  const actions: TailoredAction[] = [];
  const purse = player?.purse ?? 0;

  // 1. Missing Fairy Souls (Urgent if missing > 10)
  if (audit.soulAudit.missing > 0) {
    actions.push({
      id: "action_souls",
      title: `Claim ${audit.soulAudit.missing} Missing Fairy Souls`,
      category: "Skills",
      priority: audit.soulAudit.missing >= 20 ? "🔥 URGENT (Highest ROI)" : "💎 HIGH VALUE",
      currentStatText: `Current: ${audit.soulAudit.collected} / 242 Souls`,
      targetGoalText: `Collect remaining ${Math.min(30, audit.soulAudit.missing)} souls in Hub & Crimson Isle`,
      exactRewardText: `+${audit.soulAudit.lostHp} Max HP, +${Math.round(audit.soulAudit.missing * 0.5)} Defense`,
      estimatedCost: "0 coins (Free permanent stats)",
      actionGuidance: "Fairy souls give massive permanent survival stats that scale with dungeon percentages and armor modifiers.",
      inGameCommand: "/warp hub",
    });
  }

  // 2. Magical Power Deficit
  if (audit.mpAudit.deficit > 0) {
    actions.push({
      id: "action_mp",
      title: `Upgrade Magical Power (+${Math.min(50, audit.mpAudit.deficit)} MP Gap)`,
      category: "Accessories",
      priority: "🔥 URGENT (Highest ROI)",
      currentStatText: `Current: ${audit.mpAudit.currentMp} MP (Stage Target: ${audit.mpAudit.targetMp} MP)`,
      targetGoalText: "Purchase cheap unowned Talismans (<500k coins each on Auction House)",
      exactRewardText: `+${Math.min(50, audit.mpAudit.deficit) * 1.8} Strength / Crit Damage from Power Stone`,
      estimatedCost: `~${formatNumber(Math.min(50, audit.mpAudit.deficit) * 45_000)} coins`,
      actionGuidance: "Magical Power directly multiplies all Power Stone stats (Silky, Hurtful, Fortuitous, Scorching). Visit Maxwell in the Hub.",
      inGameCommand: "/ah",
    });
  }

  // 3. Juju Shortbow / Enderman Slayer 5 Gate
  if (audit.slayerAudit.emanLvl < 5) {
    actions.push({
      id: "action_eman5",
      title: "Reach Enderman Slayer Level 5 (Unlock Juju Shortbow)",
      category: "Slayers",
      priority: "🔥 URGENT (Highest ROI)",
      currentStatText: `Current: Enderman Slayer Level ${audit.slayerAudit.emanLvl}`,
      targetGoalText: "Reach Enderman Slayer 5 (5,000 Slayer XP)",
      exactRewardText: "Unlocks Juju Shortbow requirement (Triples Dungeon room clear speed)",
      estimatedCost: "~2.5M - 4.5M coins in carry / slayer quests",
      actionGuidance: "Juju Shortbow is the mandatory progression weapon for Catacombs Floor 5 through Floor 7.",
      inGameCommand: "/warp hub",
    });
  }

  // 4. Lowest Skill Leveling Push
  if (audit.skillAudit.lowestSkillLevel < 40) {
    actions.push({
      id: "action_lowest_skill",
      title: `Level Up ${audit.skillAudit.lowestSkillName} (Level ${audit.skillAudit.lowestSkillLevel} $\to$ ${audit.skillAudit.lowestSkillLevel + 5})`,
      category: "Skills",
      priority: "💎 HIGH VALUE",
      currentStatText: `Current: Level ${audit.skillAudit.lowestSkillLevel} (${formatNumber(audit.skillAudit.lowestSkillXpToNext)} XP to next level)`,
      targetGoalText: `Push ${audit.skillAudit.lowestSkillName} by +5 levels to raise Skill Average (${audit.skillAudit.skillAverage.toFixed(1)})`,
      exactRewardText: `+0.62 Skill Average, +${audit.skillAudit.lowestSkillName === "Combat" ? "Crit Chance & Damage" : audit.skillAudit.lowestSkillName === "Mining" ? "Defense & Mining Fortune" : "Health & Intelligence"}`,
      estimatedCost: audit.skillAudit.lowestSkillName === "Alchemy" ? "~4M coins (Brewing Sugar Cane)" : "Low (Time-based)",
      actionGuidance: `Your lowest skill is holding back your SkyBlock Level. Raising low skill tiers takes minimal XP compared to high levels.`,
    });
  }

  // 5. Next Dungeon Floor Clearance
  if (audit.dungeonAudit.catacombsLevel < 24) {
    actions.push({
      id: "action_dungeon_floor",
      title: `Clear ${audit.dungeonAudit.nextFloorTarget} in Catacombs`,
      category: "Dungeons",
      priority: "💎 HIGH VALUE",
      currentStatText: `Current: Catacombs Level ${audit.dungeonAudit.catacombsLevel} (Highest: ${audit.dungeonAudit.highestFloorCompleted})`,
      targetGoalText: `Obtain 1 completion on ${audit.dungeonAudit.nextFloorTarget}`,
      exactRewardText: "Unlocks next armor requirement tier + higher Catacombs XP multipliers",
      estimatedCost: "Dungeon entry cost / chest coins",
      actionGuidance: "Every floor completed unlocks higher floor requirements, master mode prerequisites, and better floor chest drops.",
      inGameCommand: "/warp dungeon_hub",
    });
  }

  // 6. Minion Slot Unlock
  if (audit.minionAudit.currentSlots < 25) {
    actions.push({
      id: "action_minion_slots",
      title: `Unlock Minion Slot ${audit.minionAudit.currentSlots + 1} (${audit.minionAudit.craftsToNextSlot} Unique Crafts Needed)`,
      category: "Minions",
      priority: "🎯 SOLID PROGRESSION",
      currentStatText: `Current: ${audit.minionAudit.currentSlots} Slots (${audit.minionAudit.uniqueCrafts} unique crafts)`,
      targetGoalText: `Craft Tier 1–4 of ${audit.minionAudit.craftsToNextSlot} uncrafted minion types`,
      exactRewardText: "+1 Minion Slot (+150k - 300k passive coins/day forever)",
      estimatedCost: `~${formatNumber(audit.minionAudit.craftsToNextSlot * 80_000)} coins in Bazaar materials`,
      actionGuidance: "Crafting Tier 1 through Tier 4 of unused minions (e.g. Flower, Clay, Obsidian, Redstone) is extremely cheap and unlocks slots rapidly.",
      inGameCommand: "/bz",
    });
  }

  // 7. Personal Bank Gold Interest Deposit
  const bankBalance = player?.bank ?? 0;
  if (bankBalance < 10_000_000 && purse > 5_000_000) {
    actions.push({
      id: "action_bank_interest",
      title: "Deposit Purse into Personal Bank before Season Ends",
      category: "Economy",
      priority: "🎯 SOLID PROGRESSION",
      currentStatText: `Bank Balance: ${formatFull(bankBalance)} · Purse: ${formatFull(purse)}`,
      targetGoalText: "Deposit at least 10,000,000 coins into Bank",
      exactRewardText: `+200,000 to +500,000 coins free passive interest every SkyBlock season (31 hours)`,
      estimatedCost: "0 coins (Depositing coins)",
      actionGuidance: "The Hypixel SkyBlock bank pays 2% interest on your balance up to your account cap every 31 real hours.",
      inGameCommand: "/bank",
    });
  }

  return actions;
}

// ---------------------------------------------------------------------------
// 3. DETECTED GEAR AUDIT & NEXT GEAR UPGRADE
// ---------------------------------------------------------------------------

export type DetectedGearReport = {
  detectedHelmet: string;
  detectedChestplate: string;
  detectedLeggings: string;
  detectedBoots: string;
  detectedWeapon: string;
  recommendedNextUpgrade: {
    weaponTarget: string;
    armorTarget: string;
    estimatedCostCoins: number;
    estimatedCostText: string;
    statBenefit: string;
    unlockedAt: string;
  };
};

export function detectPlayerGear(player?: AdvisorPlayerInput | null | undefined): DetectedGearReport {
  const containers = player?.containers ?? [];
  const armorItems = containers.find((c) => c.id === "armor")?.items ?? [];
  const invItems = containers.find((c) => c.id === "inventory")?.items ?? [];

  // Parse equipped pieces
  const helmet = armorItems.find((i) => i.slot === 3 || i.name.toLowerCase().includes("helmet") || i.name.toLowerCase().includes("goggles"))?.name ?? "Glacite Helmet";
  const chest = armorItems.find((i) => i.slot === 2 || i.name.toLowerCase().includes("chestplate"))?.name ?? "Glacite Chestplate";
  const legs = armorItems.find((i) => i.slot === 1 || i.name.toLowerCase().includes("leggings"))?.name ?? "Glacite Leggings";
  const boots = armorItems.find((i) => i.slot === 0 || i.name.toLowerCase().includes("boots"))?.name ?? "Glacite Boots";

  // Find primary weapon
  const weapon =
    invItems.find((i) =>
      i.name.toLowerCase().includes("sword") ||
      i.name.toLowerCase().includes("bow") ||
      i.name.toLowerCase().includes("staff") ||
      i.name.toLowerCase().includes("aspect") ||
      i.name.toLowerCase().includes("blade") ||
      i.name.toLowerCase().includes("scythe") ||
      i.name.toLowerCase().includes("hyperion") ||
      i.name.toLowerCase().includes("terminator") ||
      i.name.toLowerCase().includes("juju") ||
      i.name.toLowerCase().includes("claymore") ||
      i.name.toLowerCase().includes("dagger")
    )?.name ?? "Aspect of the End";

  const audit = performProfileAudit(player);

  let nextUpgrade = {
    weaponTarget: "Juju Shortbow (5★) & Void Sword",
    armorTarget: "3/4 Shadow Assassin + Zombie Knight Chestplate",
    estimatedCostCoins: 28_000_000,
    estimatedCostText: "~28,000,000 coins",
    statBenefit: "+180 Strength, +95 Crit Damage, Triples Dungeon DPS",
    unlockedAt: "Catacombs Floor 5 Completion + Enderman Slayer 5",
  };

  if (audit.stage === "Mid Game") {
    nextUpgrade = {
      weaponTarget: "Giant's Sword / Terminator (3★+)",
      armorTarget: "3/4 Necron's Armor + Maxor's Boots (5★)",
      estimatedCostCoins: 450_000_000,
      estimatedCostText: "~450,000,000 coins",
      statBenefit: "+340 Strength, +120 Speed, +400% Crit DPS",
      unlockedAt: "Catacombs Floor 7 Completion",
    };
  } else if (audit.stage === "Late Game") {
    nextUpgrade = {
      weaponTarget: "Hyperion (Wither Impact, 5★) / Terminator (Duplex V)",
      armorTarget: "Infernal Crimson / Terror Armor (10★ Master Stars)",
      estimatedCostCoins: 2_200_000_000,
      estimatedCostText: "~2.2B coins",
      statBenefit: "Wither Shield healing + 2,000,000 AOE ability damage",
      unlockedAt: "Kuudra T5 Infernal & Master Mode 7",
    };
  } else if (audit.stage === "End Game") {
    nextUpgrade = {
      weaponTarget: "Chimera V Hyperion & Fatal Tempo V Terminator",
      armorTarget: "10★ Infernal Aurora & Crimson (Full Perfect Gemstones)",
      estimatedCostCoins: 5_500_000_000,
      estimatedCostText: "~5.5B coins",
      statBenefit: "Maximum possible stat cap in Hypixel SkyBlock",
      unlockedAt: "Golden Dragon Level 200 + 1B Bank",
    };
  }

  return {
    detectedHelmet: helmet,
    detectedChestplate: chest,
    detectedLeggings: legs,
    detectedBoots: boots,
    detectedWeapon: weapon,
    recommendedNextUpgrade: nextUpgrade,
  };
}
