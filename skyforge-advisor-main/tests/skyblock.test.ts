import { describe, expect, it } from "vitest";

import { MAX_COLLECTION_CATEGORIES, MAX_FAIRY_SOULS, MAX_SKILL_AVERAGE } from "../src/lib/constants";
import { computeSkill, formatFull, formatNumber, titleCase, type PlayerData } from "../src/lib/skyblock";
import { calculateBestiary, calculateMobTier } from "../src/lib/bestiary";
import { calculateSlayerOverview, computeSlayerLevel } from "../src/lib/slayer";
import { calculateSkyBlockLevel } from "../src/lib/skyblock-level";

describe("formatNumber", () => {
  it("formats compact suffixes", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(999)).toBe("999");
    expect(formatNumber(1_500)).toBe("1.5K");
    expect(formatNumber(2_000_000)).toBe("2.00M");
    expect(formatNumber(3_400_000_000)).toBe("3.40B");
  });

  it("handles non-finite input", () => {
    expect(formatNumber(Number.NaN)).toBe("0");
    expect(formatNumber(Infinity)).toBe("0");
  });
});

describe("formatFull", () => {
  it("rounds and groups with commas", () => {
    expect(formatFull(1234567.8)).toBe("1,234,568");
    expect(formatFull(0)).toBe("0");
  });
});

describe("titleCase", () => {
  it("converts snake/upper ids to title case", () => {
    expect(titleCase("ASPECT_OF_THE_END")).toBe("Aspect Of The End");
    expect(titleCase("enchanted_diamond")).toBe("Enchanted Diamond");
  });
});

describe("computeSkill", () => {
  it("returns level 0 progress for zero xp", () => {
    const result = computeSkill("MINING", 0);
    expect(result.level).toBe(0);
    expect(result.pct).toBe(0);
    expect(result.maxed).toBe(false);
  });

  it("computes partial progress from total xp", () => {
    // Mining levels 1-3 cost 50 + 125 + 200 = 375 xp.
    const result = computeSkill("MINING", 300);
    expect(result.level).toBe(2);
    expect(result.currentXp).toBe(125);
    expect(result.neededXp).toBe(200);
    expect(result.maxed).toBe(false);
  });

  it("marks a skill maxed at or beyond its cap xp", () => {
    const result = computeSkill("TAMING", Number.MAX_SAFE_INTEGER);
    expect(result.maxed).toBe(true);
    expect(result.pct).toBe(100);
    expect(result.level).toBe(result.cap);
  });
});

describe("T1.13: calculateBestiary", () => {
  it("calculates mob kill tiers and next tier requirements", () => {
    const mob1 = calculateMobTier(100, 1); // 100 kills on bracket 1 = Tier 4
    expect(mob1.tier).toBe(4);
    expect(mob1.nextTierKills).toBe(250);

    const mobMax = calculateMobTier(5_000_000, 1);
    expect(mobMax.tier).toBe(25);
    expect(mobMax.nextTierKills).toBeNull();
  });

  it("calculates bestiary milestones across families", () => {
    const kills = {
      zombie: 5000, // tier 9
      skeleton: 2500, // tier 8
      creeper: 1000, // tier 7
      spider: 500, // tier 6
      wolf: 250, // tier 5
    };
    const result = calculateBestiary(kills);
    expect(result.totalKills).toBe(5000 + 2500 + 1000 + 500 + 250);
    expect(result.totalTiersUnlocked).toBe(9 + 8 + 7 + 6 + 5);
    expect(result.milestone).toBe(Math.floor(35 / 10)); // Milestone 3
    expect(result.milestoneProgressPct).toBe(50);
  });
});

describe("T1.14: calculateSlayerOverview", () => {
  it("computes slayer boss levels from XP", () => {
    const rev7 = computeSlayerLevel(100_000);
    expect(rev7.level).toBe(7);
    expect(rev7.neededXp).toBe(400_000);

    const rev9 = computeSlayerLevel(1_200_000);
    expect(rev9.level).toBe(9);
    expect(rev9.neededXp).toBe(0);
  });

  it("calculates permanent stat passives across unlocked bosses", () => {
    const overview = calculateSlayerOverview({
      zombie: { xp: 100_000, boss_kills_tier: { "0": 100, "1": 50, "2": 20, "3": 10 } }, // LVL 7 = +23 HP
      spider: { xp: 20_000, boss_kills_tier: { "0": 80, "1": 30 } },                      // LVL 6 = +8% CD
      wolf: { xp: 100_000, boss_kills_tier: { "0": 120, "1": 60, "2": 30 } },            // LVL 7 = +23 HP, +2% CD, +1 Speed
    });

    expect(overview.totalXp).toBe(220_000);
    expect(overview.passives.health).toBe(23 + 23); // 46 HP
    expect(overview.passives.critDamage).toBe(8 + 2); // 10% CD
    expect(overview.passives.speed).toBe(1); // 1 Speed
    expect(overview.bosses).toHaveLength(6);
  });
});

describe("T1.15: calculateSkyBlockLevel (15-Source Engine)", () => {
  it("calculates complete SkyBlock Level and 15 categories from player data", () => {
    const samplePlayer: PlayerData = {
      username: "SkyBlockKing",
      uuid: "00000000-0000-0000-0000-000000000000",
      profiles: [],
      activeProfileId: "prof1",
      skills: [
        computeSkill("COMBAT", 50_000_000), // LVL 60 = 300 XP
        computeSkill("MINING", 50_000_000), // LVL 60 = 300 XP
        computeSkill("FARMING", 50_000_000), // LVL 60 = 300 XP
      ],
      skillAverage: 60,
      totalSkillXp: 150_000_000,
      purse: 50_000_000,
      bank: 200_000_000,
      containers: [
        { id: "accessory-bag", label: "Accessory Bag", slots: 50, items: new Array(40).fill({ id: "TALISMAN", name: "Talisman", count: 1, rarity: "RARE", lore: [], slot: 0 }) }
      ],
      collections: [
        { id: "WHEAT", name: "Wheat", category: "Farming", amount: 100_000 },
        { id: "CARROT", name: "Carrot", category: "Farming", amount: 100_000 },
        { id: "POTATO", name: "Potato", category: "Farming", amount: 100_000 },
      ],
      fairySouls: 240, // 240 / 5 * 12 = 576 XP
      lastSave: Date.now(),
      dungeons: {
        catacombsLevel: 45, // 45 * 5 = 225 XP
        catacombsXp: 100_000_000,
        secretsFound: 15_000,
        floors: [],
      },
      slayers: [
        { name: "Revenant Horror", tier: 7, kills: 500, xp: 100_000 }, // 70 XP
      ],
      hotm: {
        tier: 7, // 7 * 100 = 700 XP
        xp: 150_000,
        powders: { mithril: 1_000_000, gemstone: 2_000_000, glacite: 500_000 },
        nodes: {},
      },
    };

    const levelData = calculateSkyBlockLevel(samplePlayer);
    expect(levelData.level).toBeGreaterThan(20);
    expect(levelData.totalXp).toBeGreaterThan(2000);
    expect(levelData.categories).toHaveLength(15);
    expect(levelData.progressPct).toBe(levelData.totalXp % 100);
    expect(levelData.xpToNextLevel).toBe(100 - levelData.progressPct);
  });
});

describe("constants sanity", () => {
  it("game caps are positive", () => {
    expect(MAX_FAIRY_SOULS).toBeGreaterThan(0);
    expect(MAX_SKILL_AVERAGE).toBeGreaterThan(0);
    expect(MAX_COLLECTION_CATEGORIES).toBeGreaterThan(0);
  });
});
