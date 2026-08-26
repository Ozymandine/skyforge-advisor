// tests/advisor-engine.test.ts
// Unit test suite for Personalized Profile Telemetry & Progression Advisor.

import { describe, expect, it } from "vitest";
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
        { name: "Combat", key: "COMBAT", level: 25, cap: 60, totalXp: 500_000, currentXp: 20_000, neededXp: 100_000, pct: 20, maxed: false },
        { name: "Mining", key: "MINING", level: 30, cap: 60, totalXp: 1_200_000, currentXp: 50_000, neededXp: 150_000, pct: 33, maxed: false },
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

describe("Tailored Action Plan", () => {
  it("generates specific actions tailored to missing stats and gates", () => {
    const actions = generateTailoredActionPlan({
      username: "Player123",
      uuid: "mock-uuid",
      profiles: [],
      activeProfileId: "mock-profile",
      skills: [],
      skillAverage: 20,
      totalSkillXp: 500_000,
      purse: 8_000_000,
      bank: 1_000_000,
      containers: [],
      collections: [],
      fairySouls: 120,
      lastSave: Date.now(),
      slayers: [{ name: "Voidgloom Seraph", tier: 3, kills: 10, xp: 3_000 }],
      dungeons: {
        catacombsLevel: 12,
        catacombsXp: 20_000,
        secretsFound: 200,
        classes: [],
        floors: [],
      },
    });

    expect(actions.length).toBeGreaterThanOrEqual(4);

    const soulsAction = actions.find((a) => a.id === "action_souls");
    expect(soulsAction).toBeDefined();
    expect(soulsAction?.currentStatText).toContain("120 / 242");

    const emanAction = actions.find((a) => a.id === "action_eman5");
    expect(emanAction).toBeDefined();
    expect(emanAction?.exactRewardText).toContain("Juju Shortbow");
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
            { slot: 3, name: "Unstable Dragon Helmet", id: "UNSTABLE_HELMET", rarity: "LEGENDARY", count: 1, lore: [] },
            { slot: 2, name: "Unstable Dragon Chestplate", id: "UNSTABLE_CHEST", rarity: "LEGENDARY", count: 1, lore: [] },
            { slot: 1, name: "Unstable Dragon Leggings", id: "UNSTABLE_LEGS", rarity: "LEGENDARY", count: 1, lore: [] },
            { slot: 0, name: "Unstable Dragon Boots", id: "UNSTABLE_BOOTS", rarity: "LEGENDARY", count: 1, lore: [] },
          ],
        },
        {
          id: "inventory",
          label: "Inventory",
          slots: 36,
          items: [
            { slot: 0, name: "Aspect of the Dragons", id: "AOTD", rarity: "LEGENDARY", count: 1, lore: [] },
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
