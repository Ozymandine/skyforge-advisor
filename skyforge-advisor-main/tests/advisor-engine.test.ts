// tests/advisor-engine.test.ts
// Unit test suite for Personalized Profile Telemetry & Progression Advisor.

import { describe, expect, it } from "vitest";
import { computeDungeonLevel } from "../src/lib/skyblock";
import {
  performProfileAudit,
  generateTailoredActionPlan,
  detectPlayerGear,
} from "../src/lib/advisor-engine";

describe("Personalized Profile Audit", () => {
  it("performs comprehensive stat audit with granular scores", () => {
    const audit = performProfileAudit({
      username: "Player123",
      uuid: "mock-uuid",
      profiles: [],
      activeProfileId: "mock-profile",
      skills: [
        {
          name: "Combat",
          key: "COMBAT",
          level: 25,
          cap: 60,
          totalXp: 500_000,
          currentXp: 20_000,
          neededXp: 100_000,
          pct: 20,
          maxed: false,
        },
        {
          name: "Mining",
          key: "MINING",
          level: 30,
          cap: 60,
          totalXp: 1_200_000,
          currentXp: 50_000,
          neededXp: 150_000,
          pct: 33,
          maxed: false,
        },
      ],
      skillAverage: 27.5,
      totalSkillXp: 1_700_000,
      purse: 15_000_000,
      bank: 5_000_000,
      containers: [],
      collections: [],
      fairySouls: 150,
      lastSave: Date.now(),
      slayers: [
        { name: "Revenant Horror", tier: 6, kills: 200, xp: 50_000 },
        { name: "Voidgloom Seraph", tier: 3, kills: 20, xp: 5_000 },
      ],
      dungeons: {
        catacombsLevel: 16,
        catacombsXp: 45_000,
        secretsFound: 850,
        classes: [],
        floors: [
          { name: "Floor 4", completions: 5, highestScore: 300, bestTimeS: 240 },
          { name: "Floor 5", completions: 0, highestScore: 0, bestTimeS: 0 },
        ],
      },
    });

    expect(audit.score).toBeGreaterThan(0);
    expect(audit.soulAudit.missing).toBe(92);
    expect(audit.slayerAudit.emanLvl).toBe(3);
    expect(audit.dungeonAudit.highestFloorCompleted).toBe("Floor 4");
    expect(audit.dungeonAudit.nextFloorTarget).toBe("Floor 5");
  });
});

describe("Advisor next steps", () => {
  it("does not turn missing or defaulted profile data into advice", () => {
    expect(generateTailoredActionPlan(undefined)).toEqual([]);
    expect(
      generateTailoredActionPlan({
        fairySouls: 0,
        skills: [{ name: "Combat", key: "COMBAT", level: 0, currentXp: 0, neededXp: 50 }],
        dungeons: { catacombsLevel: 10, floors: [{ name: "Floor 4", completions: 1 }] },
        availability: {
          skillKeys: [],
          containerIds: [],
          fairySouls: false,
          purse: false,
          dungeonCompletions: false,
        },
      }),
    ).toEqual([]);
  });

  it("uses recorded floor completions and measured skill progress", () => {
    const actions = generateTailoredActionPlan({
      activeProfileId: "p1",
      profiles: [{ profileId: "p1", gameMode: "Classic" }],
      availability: {
        skillKeys: ["COMBAT", "FARMING"],
        containerIds: [],
        fairySouls: true,
        purse: false,
        dungeonCompletions: true,
        catacombsXp: true,
      },
      fairySouls: 8,
      skills: [
        { name: "Combat", key: "COMBAT", level: 16, currentXp: 400, neededXp: 500 },
        { name: "Farming", key: "FARMING", level: 3, currentXp: 20, neededXp: 150 },
      ],
      dungeons: {
        catacombsLevel: 10,
        floors: [
          { name: "Floor 2", completions: 3 },
          { name: "Floor 4", completions: 0 },
          { name: "Floor 3", completions: 1 },
        ],
      },
    });

    expect(actions.map((action) => action.title)).toEqual([
      "Run Floor 4",
      "Reach Combat 17",
      "Check uncollected Fairy Souls",
    ]);
    expect(actions[1]?.detail).toContain("100 XP");
  });

  it("does not recommend clearing an unverified floor from a sparse record", () => {
    const actions = generateTailoredActionPlan({ dungeons: { catacombsLevel: 10, floors: [] } });
    expect(actions).toEqual([]);
  });

  it("only presents Master Mode 7 as a future goal below its verified requirement", () => {
    const player = {
      activeProfileId: "p1",
      profiles: [{ profileId: "p1", gameMode: "Ironman" }],
      availability: {
        skillKeys: ["COMBAT"],
        containerIds: [],
        fairySouls: false,
        purse: false,
        dungeonCompletions: true,
        catacombsXp: true,
      },
      skills: [{ key: "COMBAT", level: 45 }],
      dungeons: {
        catacombsLevel: 34,
        floors: [{ name: "Floor 7", completions: 1 }],
        masterMode: [{ name: "M6", completions: 2 }],
      },
    };
    expect(generateTailoredActionPlan(player)[0]).toMatchObject({
      title: "Reach Catacombs 36",
      futureGoal: true,
      detail: expect.stringContaining("Master Mode Floor 7"),
    });
    expect(
      generateTailoredActionPlan({
        ...player,
        dungeons: { ...player.dungeons, catacombsLevel: 36 },
      })[0]?.title,
    ).toBe("Run Master Mode Floor 7");
    expect(
      generateTailoredActionPlan({
        ...player,
        profiles: [{ profileId: "p1", gameMode: "Stranded" }],
      }),
    ).toEqual([]);
  });
});

describe("Detected Gear & Next Upgrade", () => {
  it("detects equipped gear pieces and computes appropriate next upgrade", () => {
    const gear = detectPlayerGear({
      username: "Player123",
      uuid: "mock-uuid",
      profiles: [],
      activeProfileId: "mock-profile",
      skills: [],
      skillAverage: 22,
      totalSkillXp: 600_000,
      purse: 12_000_000,
      bank: 0,
      containers: [
        {
          id: "armor",
          label: "Armor",
          slots: 4,
          items: [
            {
              slot: 3,
              name: "Unstable Dragon Helmet",
              id: "UNSTABLE_HELMET",
              rarity: "LEGENDARY",
              count: 1,
              lore: [],
            },
            {
              slot: 2,
              name: "Unstable Dragon Chestplate",
              id: "UNSTABLE_CHEST",
              rarity: "LEGENDARY",
              count: 1,
              lore: [],
            },
            {
              slot: 1,
              name: "Unstable Dragon Leggings",
              id: "UNSTABLE_LEGS",
              rarity: "LEGENDARY",
              count: 1,
              lore: [],
            },
            {
              slot: 0,
              name: "Unstable Dragon Boots",
              id: "UNSTABLE_BOOTS",
              rarity: "LEGENDARY",
              count: 1,
              lore: [],
            },
          ],
        },
        {
          id: "inventory",
          label: "Inventory",
          slots: 36,
          items: [
            {
              slot: 0,
              name: "Aspect of the Dragons",
              id: "AOTD",
              rarity: "LEGENDARY",
              count: 1,
              lore: [],
            },
          ],
        },
      ],
      collections: [],
      fairySouls: 180,
      lastSave: Date.now(),
    });

    expect(gear.detectedHelmet).toContain("Unstable");
    expect(gear.detectedWeapon).toContain("Aspect of the Dragons");
    expect(gear.recommendedNextUpgrade.weaponTarget).toContain("Juju Shortbow");
  });
});

describe("Dungeon XP", () => {
  it("uses dungeon thresholds rather than Combat skill thresholds", () => {
    expect(computeDungeonLevel(49)).toBe(0);
    expect(computeDungeonLevel(50)).toBe(1);
    expect(computeDungeonLevel(124)).toBe(1);
    expect(computeDungeonLevel(125)).toBe(2);
    expect(computeDungeonLevel(569_809_640)).toBe(50);
  });
});
