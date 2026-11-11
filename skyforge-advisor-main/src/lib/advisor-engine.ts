// src/lib/advisor-engine.ts
// Deep Personalized SkyBlock Advisor Engine:
// Ingests live player telemetry (skills, slayers, gear, containers, purse, bank, fairy souls,
// dungeons, garden, hotm) and computes tailored, math-driven recommendations.

import {
  formatFull,
  formatNumber,
  type PlayerData,
  type InventoryItem,
  type ProfileAvailability,
} from "./skyblock";
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
  availability?: ProfileAvailability | undefined;
  username?: string | undefined;
  uuid?: string | undefined;
  purse?: number | undefined;
  bank?: number | null | undefined;
  fairySouls?: number | undefined;
  skillAverage?: number | undefined;
  skills?:
    | Array<{
        name?: string | undefined;
        key?: string | undefined;
        level?: number | undefined;
        currentXp?: number | undefined;
        neededXp?: number | undefined;
        maxed?: boolean | undefined;
      }>
    | undefined;
  slayers?:
    | Array<{
        name: string;
        tier?: number | undefined;
        kills?: number | undefined;
        xp?: number | undefined;
      }>
    | undefined;
  dungeons?:
    | {
        catacombsLevel?: number | undefined;
        floors?: Array<{ name: string; completions: number }> | undefined;
      }
    | undefined;
  containers?: Array<{ id: string; items: InventoryItem[] }> | undefined;
  collections?: Array<{ id: string; name: string }> | undefined;
  hypixelPlayer?: import("./hypixel-rank").RawHypixelPlayerData | null | undefined;
};

function isAccessoryItem(item: InventoryItem): boolean {
  const name = item.name.toLowerCase();
  const id = (item.id || "").toLowerCase();
  return (
    name.includes("talisman") ||
    name.includes("ring") ||
    name.includes("artifact") ||
    name.includes("relic") ||
    name.includes("seal") ||
    name.includes("crest") ||
    name.includes("badge") ||
    name.includes("heart") ||
    name.includes("orb") ||
    name.includes("feather") ||
    name.includes("scarf") ||
    name.includes("cloak") ||
    name.includes("belt") ||
    name.includes("gauntlet") ||
    name.includes("glove") ||
    name.includes("tome") ||
    name.includes("melody's hair") ||
    name.includes("shrimp") ||
    name.includes("catacombs expert") ||
    id.includes("talisman") ||
    id.includes("ring") ||
    id.includes("artifact") ||
    id.includes("relic") ||
    id.includes("accessory")
  );
}

function getAccessoryFamily(item: InventoryItem): string {
  return item.name
    .toLowerCase()
    .replace(/\b(tier\s+\d+|t\d+|relic|artifact|ring|talisman)\b/gi, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function computeAccurateMagicalPower(
  containers: Array<{ id: string; items: InventoryItem[] }> = [],
): number {
  const bestByFamily = new Map<string, number>();

  for (const c of containers) {
    const isAccBag = c.id === "accessory_bag" || c.id === "talisman_bag";
    for (const item of c.items) {
      if (isAccBag || isAccessoryItem(item)) {
        const rar = (item.rarity?.toUpperCase() ?? "COMMON") as AccessoryRarity;
        const mpValue = MP_BY_RARITY[rar] ?? 3;
        const family = getAccessoryFamily(item);
        const existing = bestByFamily.get(family) ?? 0;
        if (mpValue > existing) {
          bestByFamily.set(family, mpValue);
        }
      }
    }
  }

  let total = 0;
  for (const val of bestByFamily.values()) {
    total += val;
  }
  return total;
}

export function performProfileAudit(player?: AdvisorPlayerInput | null | undefined): ProfileAudit {
  const sbLevel = player ? calculateSkyBlockLevel(player as PlayerData).level : 25;
  const netWorth = player ? (player.purse ?? 0) + (player.bank ?? 0) : 10_000_000;
  const skillAvg = player?.skillAverage ?? 18;
  const cataLvl = player?.dungeons?.catacombsLevel ?? 0;
  const souls = player?.fairySouls ?? 0;

  // Calculate deduplicated Magical Power
  const currentMp = computeAccurateMagicalPower(player?.containers ?? []);

  // Determine Game Stage
  let stage: GameStage = "Early Game";
  let stageColor = "#22c55e";
  let badgeClass = "border-emerald-500/40 bg-emerald-500/15 text-emerald-300";
  let summary =
    "You are in the foundational phase of SkyBlock. Focus on low-hanging permanent stats, cheap accessories, and unlocking collections.";

  if (sbLevel >= 280 || netWorth >= 7_000_000_000 || (skillAvg >= 50 && cataLvl >= 42)) {
    stage = "End Game";
    stageColor = "#a855f7";
    badgeClass = "border-purple-500/40 bg-purple-500/15 text-purple-300";
    summary =
      "Endgame powerhouse. Focus on Master Mode 7 speedruns, Kuudra T5 Infernal, Golden Dragon 200, and maxing out remaining Slayer 9 passives.";
  } else if (sbLevel >= 180 || netWorth >= 1_500_000_000 || (skillAvg >= 40 && cataLvl >= 30)) {
    stage = "Late Game";
    stageColor = "#38bdf8";
    badgeClass = "border-sky-400/40 bg-sky-500/15 text-sky-300";
    summary =
      "Late game scaling. You have high base stats — focus on Terminator/Hyperion optimizations, 800+ MP, and Master Mode clearances.";
  } else if (sbLevel >= 80 || netWorth >= 150_000_000 || (skillAvg >= 26 && cataLvl >= 18)) {
    stage = "Mid Game";
    stageColor = "#eab308";
    badgeClass = "border-amber-400/40 bg-amber-500/15 text-amber-300";
    summary =
      "Mid game transition. Focus on Juju Shortbow, Shadow Assassin / Necron armor, 500+ MP, and pushing Catacombs Floor 7.";
  }

  // 1. MP Benchmark based on Stage
  const targetMp =
    stage === "Early Game" ? 300 : stage === "Mid Game" ? 550 : stage === "Late Game" ? 850 : 1200;
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
  const nonMaxedSkills = (player?.skills?.filter((s) => !s.maxed) ?? []).filter(
    (s) => typeof s.level === "number",
  );
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
  const rev =
    slayers.find(
      (s) => s.name.toLowerCase().includes("zombie") || s.name.toLowerCase().includes("revenant"),
    )?.tier ?? 0;
  const tara =
    slayers.find(
      (s) => s.name.toLowerCase().includes("spider") || s.name.toLowerCase().includes("tarantula"),
    )?.tier ?? 0;
  const sven =
    slayers.find(
      (s) => s.name.toLowerCase().includes("wolf") || s.name.toLowerCase().includes("sven"),
    )?.tier ?? 0;
  const eman =
    slayers.find(
      (s) =>
        s.name.toLowerCase().includes("enderman") || s.name.toLowerCase().includes("voidgloom"),
    )?.tier ?? 0;
  const slayerXpTotal = slayers.reduce((sum, s) => sum + (s.xp ?? 0), 0);
  const slayerScore = Math.min(100, Math.round((slayerXpTotal / 1_000_000) * 100));
  const slayerStatusText = `Rev ${rev} · Tara ${tara} · Sven ${sven} · Eman ${eman}. ${eman < 5 ? "Need Eman 5 for Juju Shortbow." : rev < 7 ? "Need Rev 7 for Reaper Falchion." : "Slayer passives in good standing."}`;

  // 5. Dungeon Audit
  const floors = player?.dungeons?.floors ?? [];
  const completedFloors = floors.filter((f) => f.completions > 0);
  const highestFloor =
    completedFloors.length > 0 ? completedFloors[completedFloors.length - 1]!.name : "None";
  const nextFloor = floors.find((f) => f.completions === 0)?.name ?? "No verified next floor";
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

  const overallScore = Math.round(
    (mpScore + soulScore + skillScore + slayerScore + dungeonScore + minionScore) / 6,
  );

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
  detail: string;
  benefit: string;
  cost?: string;
  link?: "/skills" | "/inventory";
};

export function generateTailoredActionPlan(player?: AdvisorPlayerInput | null): TailoredAction[] {
  if (!player) return [];
  const actions: TailoredAction[] = [];
  const availability = player.availability;

  // Repeat only a floor the profile has actually cleared. Skill XP and net
  // worth cannot establish an unlocked floor, and sparse records omit floors.
  const completedFloor =
    availability?.dungeonCompletions === false
      ? undefined
      : player.dungeons?.floors
          ?.filter((floor) => /^Floor [1-7]$/.test(floor.name) && floor.completions > 0)
          .sort((a, b) => Number(b.name.at(-1)) - Number(a.name.at(-1)))[0];
  if (completedFloor) {
    actions.push({
      id: "repeat-dungeon-floor",
      title: "Run " + completedFloor.name + " again",
      detail:
        "This profile has " +
        formatFull(completedFloor.completions) +
        " recorded " +
        (completedFloor.completions === 1 ? "clear" : "clears") +
        " on this floor. Check Mort for current entry requirements.",
      benefit: "Earn Catacombs XP without assuming the next floor is unlocked.",
      link: "/skills",
    });
  }

  const nextSkill = (player.skills ?? [])
    .filter(
      (skill) =>
        skill.name &&
        skill.key &&
        !["SOCIAL", "RUNECRAFTING"].includes(skill.key) &&
        (!availability || availability.skillKeys.includes(skill.key)) &&
        !skill.maxed &&
        typeof skill.level === "number" &&
        typeof skill.neededXp === "number" &&
        Number.isFinite(skill.neededXp) &&
        typeof skill.currentXp === "number" &&
        Number.isFinite(skill.currentXp) &&
        skill.neededXp > skill.currentXp,
    )
    .map((skill) => ({ ...skill, remaining: skill.neededXp! - skill.currentXp! }))
    .sort((a, b) => a.remaining - b.remaining || a.name!.localeCompare(b.name!))[0];
  if (nextSkill) {
    actions.push({
      id: "next-skill-level",
      title: "Reach " + nextSkill.name + " " + (nextSkill.level! + 1),
      detail:
        formatFull(nextSkill.remaining) +
        " XP to the next level, based on the skill XP in this profile.",
      benefit: "The smallest remaining XP gap among the skills SkyForge can read.",
      link: "/skills",
    });
  }

  if (
    availability?.fairySouls !== false &&
    typeof player.fairySouls === "number" &&
    Number.isFinite(player.fairySouls) &&
    player.fairySouls >= 0 &&
    player.fairySouls < 20
  ) {
    actions.push({
      id: "check-fairy-souls",
      title: "Check uncollected Fairy Souls",
      detail:
        "This profile has " +
        formatFull(player.fairySouls) +
        " collected. Open the Fairy Souls tracker in SkyBlock and choose an area you already have access to.",
      benefit: "Fairy Soul milestones grant SkyBlock XP and unlock backpack slots.",
      cost: "No purchase needed",
    });
  }

  return actions;
}

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

export function detectPlayerGear(
  player?: AdvisorPlayerInput | null | undefined,
): DetectedGearReport {
  const containers = player?.containers ?? [];

  // Collect all owned items across armor, wardrobe, inventory, and enderchest
  const allGearItems: InventoryItem[] = [];
  for (const c of containers) {
    if (
      c.id === "armor" ||
      c.id === "wardrobe" ||
      c.id === "inventory" ||
      c.id === "enderchest" ||
      c.id === "storage"
    ) {
      allGearItems.push(...c.items);
    }
  }

  // Weapon tier ranker
  const getWeaponTier = (name: string): number => {
    const n = name.toLowerCase();
    if (
      n.includes("hyperion") ||
      n.includes("astraea") ||
      n.includes("scylla") ||
      n.includes("valkyrie") ||
      n.includes("terminator") ||
      n.includes("claymore")
    )
      return 500;
    if (
      n.includes("giant's sword") ||
      n.includes("shadow fury") ||
      n.includes("juju") ||
      n.includes("felthorn") ||
      n.includes("midas staff") ||
      n.includes("reaper scythe") ||
      n.includes("spirit sceptre")
    )
      return 400;
    if (
      n.includes("livid") ||
      n.includes("flower of truth") ||
      n.includes("dragons") ||
      n.includes("voidedge") ||
      n.includes("dreadlord") ||
      n.includes("bonzo")
    )
      return 300;
    if (
      n.includes("aspect of the end") ||
      n.includes("void sword") ||
      n.includes("aurora staff") ||
      n.includes("raider")
    )
      return 200;
    if (
      n.includes("sword") ||
      n.includes("bow") ||
      n.includes("staff") ||
      n.includes("dagger") ||
      n.includes("blade")
    )
      return 100;
    return 0;
  };

  // Armor tier ranker
  const getArmorTier = (name: string): number => {
    const n = name.toLowerCase();
    if (
      n.includes("infernal") ||
      n.includes("crimson") ||
      n.includes("aurora") ||
      n.includes("terror") ||
      n.includes("fervor") ||
      n.includes("hollow")
    )
      return 500;
    if (
      n.includes("necron") ||
      n.includes("storm") ||
      n.includes("maxor") ||
      n.includes("goldor") ||
      n.includes("divan")
    )
      return 400;
    if (
      n.includes("shadow assassin") ||
      n.includes("frozen blaze") ||
      n.includes("adaptive") ||
      n.includes("werewolf")
    )
      return 300;
    if (
      n.includes("superior") ||
      n.includes("strong") ||
      n.includes("unstable") ||
      n.includes("wise") ||
      n.includes("young") ||
      n.includes("holy")
    )
      return 200;
    if (
      n.includes("glacite") ||
      n.includes("miner") ||
      n.includes("lapis") ||
      n.includes("hardened") ||
      n.includes("goggles")
    )
      return 100;
    return 50;
  };

  const helmets = allGearItems
    .filter(
      (i) =>
        i.name.toLowerCase().includes("helmet") ||
        i.name.toLowerCase().includes("goggles") ||
        i.name.toLowerCase().includes("crown") ||
        i.name.toLowerCase().includes("fedora") ||
        i.name.toLowerCase().includes("mask"),
    )
    .sort((a, b) => getArmorTier(b.name) - getArmorTier(a.name));
  const chests = allGearItems
    .filter(
      (i) =>
        i.name.toLowerCase().includes("chestplate") ||
        i.name.toLowerCase().includes("tunic") ||
        i.name.toLowerCase().includes("jacket"),
    )
    .sort((a, b) => getArmorTier(b.name) - getArmorTier(a.name));
  const legs = allGearItems
    .filter(
      (i) =>
        i.name.toLowerCase().includes("leggings") ||
        i.name.toLowerCase().includes("trousers") ||
        i.name.toLowerCase().includes("pants"),
    )
    .sort((a, b) => getArmorTier(b.name) - getArmorTier(a.name));
  const bootsList = allGearItems
    .filter(
      (i) =>
        i.name.toLowerCase().includes("boots") ||
        i.name.toLowerCase().includes("shoes") ||
        i.name.toLowerCase().includes("oxfords"),
    )
    .sort((a, b) => getArmorTier(b.name) - getArmorTier(a.name));
  const weapons = allGearItems
    .filter((i) => getWeaponTier(i.name) > 0)
    .sort((a, b) => getWeaponTier(b.name) - getWeaponTier(a.name));

  const helmet = helmets[0]?.name ?? "Glacite Helmet";
  const chest = chests[0]?.name ?? "Glacite Chestplate";
  const legPiece = legs[0]?.name ?? "Glacite Leggings";
  const bootPiece = bootsList[0]?.name ?? "Glacite Boots";
  const weapon = weapons[0]?.name ?? "Aspect of the End";

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
    detectedLeggings: legPiece,
    detectedBoots: bootPiece,
    detectedWeapon: weapon,
    recommendedNextUpgrade: nextUpgrade,
  };
}
