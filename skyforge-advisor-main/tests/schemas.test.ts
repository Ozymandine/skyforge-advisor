// tests/schemas.test.ts
// The PlayerData Zod boundary must accept every new parsed section, and
// reject genuinely malformed payloads.

import { describe, expect, it } from "vitest";
import { playerDataSchema } from "../src/lib/schemas";

const base = {
  username: "Tester",
  uuid: "abc123",
  profiles: [
    { profileId: "p1", cuteName: "Blueberry", gameMode: "Classic", members: 1, selected: true },
  ],
  activeProfileId: "p1",
  skills: [
    {
      key: "MINING",
      name: "Mining",
      level: 30,
      cap: 60,
      totalXp: 10_000,
      currentXp: 5_000,
      neededXp: 5_000,
      pct: 50,
      maxed: false,
    },
  ],
  skillAverage: 30,
  totalSkillXp: 10_000,
  purse: 100,
  bank: null,
  containers: [],
  collections: [],
  fairySouls: 10,
  lastSave: 1_700_000_000_000,
};

describe("playerDataSchema", () => {
  it("accepts the base payload without optional sections", () => {
    expect(playerDataSchema.safeParse(base).success).toBe(true);
  });

  it("accepts all new parsed sections", () => {
    const payload = {
      ...base,
      dungeons: {
        catacombsLevel: 35,
        catacombsXp: 100_000,
        secretsFound: 400,
        floors: [{ name: "Floor 1", completions: 12, bestScore: 300 }],
        masterMode: [{ name: "M1", completions: 3, bestScore: 270 }],
        masterModeLevel: 30,
        masterModeXp: 50_000,
        classes: [
          { name: "Archer", level: 40, selected: true },
          { name: "Mage", level: 20, selected: false },
        ],
        milestones: 5,
      },
      slayers: [{ name: "Revenant Horror", tier: 3, kills: 50, xp: 120_000 }],
      pets: [
        {
          name: "Ender Dragon",
          rarity: "LEGENDARY",
          level: 100,
          xp: 25_000_000,
          active: true,
          heldItem: "Reaper Gem",
          candyUsed: 10,
        },
      ],
      hotm: {
        tier: 7,
        xp: 500_000,
        powders: { mithril: 100_000, gemstone: 50_000, glacite: 10_000 },
        nodes: { pickaxe_tier: 5, gemstone_infusion: 2 },
      },
      garden: {
        level: 12,
        xp: 30_000,
        cropMilestones: { wheat: 100_000, carrot: 50_000 },
        visitorsServed: 42,
        compost: 3,
      },
      crimson: {
        dojo: { force: 800, control: 650 },
        kuudra: { normal: 5, hot: 2 },
        faction: "Barbarians",
        reputation: 1_200,
      },
      rift: { motes: 12_345, progress: { castle_time: 90 } },
      museum: { donatedItems: 15, appraised: 1 },
      achievements: { points: 1_500, categories: { hypixel_like_the_houses: 3, skyblock: 200 } },
      jacob: {
        gold: 10,
        silver: 5,
        bronze: 2,
        platinum: 1,
        diamond: 0,
        perCrop: { wheat: 250_000 },
      },
      experimentation: { claims: { simon_x: 12 } },
      lifetimeStats: { kills: 3_000, deaths: 120 },
      communityUpgrades: [{ upgrade: "Minion Storage", level: 5 }],
    };

    const result = playerDataSchema.safeParse(payload);
    if (!result.success) {
      console.error(result.error.issues.slice(0, 5));
    }
    expect(result.success).toBe(true);
  });

  it("accepts inventory items with NBT extras", () => {
    const payload = {
      ...base,
      containers: [
        {
          id: "inventory",
          label: "Inventory",
          slots: 36,
          items: [
            {
              slot: 0,
              name: "Aspect of the End",
              id: "ASPECT_OF_THE_END",
              rarity: "RARE",
              count: 1,
              lore: ["§7Damage: §c+100"],
              enchantments: { sharpness: 6, telekinesis: 1 },
              reforge: "Heroic",
              stars: 0,
              hotPotatoBooks: 2,
              gems: { jasper_0: "JASPER" },
              abilityScrolls: [],
            },
          ],
        },
      ],
    };
    expect(playerDataSchema.safeParse(payload).success).toBe(true);
  });

  it("rejects payloads with missing required sections", () => {
    const { skills, ...broken } = base;
    void skills;
    expect(playerDataSchema.safeParse(broken).success).toBe(false);
  });

  it("accepts hypixelPlayer with null and optional rank properties", () => {
    const payload = {
      ...base,
      hypixelPlayer: {
        rank: null,
        monthlyPackageRank: "SUPERSTAR",
        newPackageRank: null,
        packageRank: "MVP_PLUS",
        prefix: null,
        rankPlusColor: "RED",
        monthlyRankColor: null,
      },
    };
    expect(playerDataSchema.safeParse(payload).success).toBe(true);
  });

  it("rejects wrong-typed new sections", () => {
    const payload = { ...base, hotm: { tier: "seven" } };
    expect(playerDataSchema.safeParse(payload).success).toBe(false);
  });
});
