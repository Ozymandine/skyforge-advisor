import { describe, expect, it } from "vitest";
import {
  jungleAmuletBudget,
  lividDaggerBudget,
  recommendJungleAmulet,
  recommendLividDagger,
  recommendOdawaTrade,
  recommendRedClawUpgrade,
  redClawUpgradeBudget,
} from "../src/lib/advisor-market";
import { computeSkill } from "../src/lib/skyblock";
import type { WikiAuctionQuote } from "../src/lib/wiki-auction";

const now = Date.parse("2026-11-11T18:00:00Z");
const ring = {
  id: "RED_CLAW_RING",
  name: "Red Claw Ring",
  rarity: "RARE",
  count: 1,
  slot: 0,
  lore: [],
};
const player = {
  activeProfileId: "main",
  availability: {
    accessoryStorage: true,
    containerIds: ["inventory", "ender-chest", "accessory-bag", "vault"],
    dungeonCompletions: false,
    fairySouls: false,
    purse: true,
    skillKeys: [],
  },
  purse: 10_000_000,
  profiles: [
    { profileId: "main", cuteName: "Lime", gameMode: "Classic", members: 1, selected: true },
  ],
  containers: [{ id: "accessory-bag", label: "Accessory Bag", slots: 18, items: [ring] }],
  slayerOverview: {
    bosses: [
      {
        id: "wolf",
        name: "Sven Packmaster",
        level: 5,
        claimedLevel: 5,
        maxLevel: 9,
        currentXp: 5_000,
        neededXp: 20_000,
        totalKills: 10,
        tierKills: {},
        unlockedPassives: [],
      },
    ],
    totalKills: 10,
    totalXp: 5_000,
    passives: { health: 0, speed: 0, critDamage: 0, extraEffects: [] },
  },
};

const coverage = { lastUpdated: now, pagesScanned: 24, totalPages: 42, comparableListings: 8 };
const quote = {
  ...coverage,
  status: "quoted",
  price: 9_395_000,
  validUntil: now + 60_000,
} satisfies WikiAuctionQuote;

describe("Red Claw Artifact Advisor recommendation", () => {
  it("shows the current asking price and incremental power for a verified upgrade", () => {
    const budget = redClawUpgradeBudget(player);
    expect(budget).toBe(player.purse);
    expect(recommendRedClawUpgrade(budget, quote, now)).toMatchObject({
      marketItemId: "RED_CLAW_ARTIFACT",
      benefit: expect.stringContaining("Adds 4 Accessory Power"),
      cost: expect.stringContaining("9,395,000 coins"),
    });
  });

  it("skips unsupported modes, unknown purse or storage, and unclaimed slayer levels", () => {
    for (const gameMode of ["Ironman", "Stranded", "Bingo", "Unknown"]) {
      expect(
        redClawUpgradeBudget({
          ...player,
          profiles: [{ ...player.profiles[0]!, gameMode }],
        }),
      ).toBeNull();
    }
    expect(redClawUpgradeBudget({ ...player, activeProfileId: "different" })).toBeNull();
    expect(redClawUpgradeBudget({ ...player, availability: undefined })).toBeNull();
    for (const field of ["purse", "accessoryStorage"] as const) {
      expect(
        redClawUpgradeBudget({
          ...player,
          availability: { ...player.availability, [field]: false },
        }),
      ).toBeNull();
    }
    expect(redClawUpgradeBudget({ ...player, slayerOverview: undefined })).toBeNull();
    expect(
      redClawUpgradeBudget({
        ...player,
        slayerOverview: {
          ...player.slayerOverview,
          bosses: [{ ...player.slayerOverview.bosses[0]!, claimedLevel: 4 }],
        },
      }),
    ).toBeNull();
  });

  it("skips owned artifacts and rings without a confirmed positive upgrade", () => {
    const bag = player.containers[0]!;
    for (const items of [[], [{ ...ring, rarity: "EPIC" }], [{ ...ring, reforge: "Strong" }]]) {
      expect(redClawUpgradeBudget({ ...player, containers: [{ ...bag, items }] })).toBeNull();
    }
    expect(
      redClawUpgradeBudget({
        ...player,
        containers: [
          bag,
          {
            id: "backpack-0",
            label: "Backpack 1",
            slots: 18,
            items: [{ ...ring, id: "RED_CLAW_ARTIFACT" }],
          },
        ],
      }),
    ).toBeNull();
  });

  it("skips unaffordable, expired, stale, insufficient, and unavailable quotes", () => {
    expect(recommendRedClawUpgrade(quote.price - 1, quote, now)).toBeNull();
    expect(recommendRedClawUpgrade(player.purse, quote, quote.validUntil)).toBeNull();
    expect(recommendRedClawUpgrade(player.purse, { ...coverage, status: "stale" }, now)).toBeNull();
    expect(
      recommendRedClawUpgrade(player.purse, { ...coverage, status: "insufficient" }, now),
    ).toBeNull();
    expect(recommendRedClawUpgrade(player.purse, { status: "unavailable" }, now)).toBeNull();
  });
});

describe("gemstone progression advice", () => {
  const mining = {
    ...player,
    collections: [{ id: "GEMSTONE_COLLECTION", name: "Gemstone", category: "Mining", amount: 300 }],
    skills: [computeSkill("MINING", 1_000_000)],
    hotm: { tier: 4, xp: 37_000, powders: { mithril: 0, gemstone: 0, glacite: 0 }, nodes: {} },
  };
  it("recommends a quoted Jungle Amulet to a Classic profile with gemstone progress", () => {
    const budget = jungleAmuletBudget(mining);
    expect(recommendJungleAmulet(budget, quote, now)).toMatchObject({
      marketItemId: "JUNGLE_AMULET",
      benefit: expect.stringContaining("+10 Gemstone Fortune"),
    });
    expect(jungleAmuletBudget({ ...mining, collections: [] })).toBeNull();
  });

  it("uses the verified Odawa trade for Ironman only with access and enough materials", () => {
    const ironman = {
      ...mining,
      profiles: [{ ...player.profiles[0]!, gameMode: "Ironman" }],
      containers: [
        ...player.containers,
        {
          id: "inventory",
          label: "Inventory",
          slots: 36,
          items: [
            { ...ring, id: "JUNGLE_HEART", count: 4 },
            { ...ring, id: "SLUDGE_JUICE", count: 500 },
          ],
        },
      ],
    };
    expect(jungleAmuletBudget(ironman)).toBeNull();
    expect(recommendOdawaTrade(ironman)).toMatchObject({
      cost: "4 Jungle Hearts and 500 Sludge Juice",
    });
    expect(recommendOdawaTrade({ ...ironman, hotm: { ...ironman.hotm, xp: 36_999 } })).toBeNull();
    expect(recommendOdawaTrade({ ...ironman, containers: player.containers })).toBeNull();
  });
});

describe("Livid Dagger comparison", () => {
  const aspect = {
    ...ring,
    id: "ASPECT_OF_THE_END",
    name: "Aspect of the End",
    lore: ["§7Damage: §c+100", "§7Strength: §c+100", "", "§9§lRARE SWORD"],
  };
  const inventory = { id: "inventory", label: "Inventory", slots: 36, items: [aspect] };
  const combat = {
    ...player,
    availability: { ...player.availability, dungeonCompletions: true },
    containers: [inventory],
    dungeons: {
      catacombsLevel: 14,
      catacombsXp: 14_000,
      secretsFound: 10,
      floors: [{ name: "Floor 5", completions: 1, bestScore: 280 }],
    },
  };

  it("requires a recorded clear, readable base sword, and a current affordable quote", () => {
    expect(recommendLividDagger(lividDaggerBudget(combat), quote, now)).toMatchObject({
      marketItemId: "LIVID_DAGGER",
      cost: expect.stringContaining("9,395,000 coins"),
    });
    expect(
      lividDaggerBudget({ ...combat, dungeons: { ...combat.dungeons, floors: [] } }),
    ).toBeNull();
    expect(
      lividDaggerBudget({
        ...combat,
        availability: { ...combat.availability, dungeonCompletions: false },
      }),
    ).toBeNull();
    expect(recommendLividDagger(combat.purse, quote, quote.validUntil)).toBeNull();
    expect(recommendLividDagger(quote.price - 1, quote, now)).toBeNull();
  });

  it("skips other modes, unreadable inventory, modified swords, and other melee weapons", () => {
    expect(
      lividDaggerBudget({
        ...combat,
        profiles: [{ ...combat.profiles[0]!, gameMode: "Ironman" }],
      }),
    ).toBeNull();
    for (const items of [
      [],
      [{ ...aspect, lore: [] }],
      [{ ...aspect, slot: 10 }],
      [{ ...aspect, rarity: "EPIC" }],
      [{ ...aspect, enchantments: { sharpness: 5 } }],
      [aspect, { ...aspect, id: "LIVID_DAGGER", lore: [] }],
      [aspect, { ...aspect, id: "HYPERION", lore: ["§6§lLEGENDARY DUNGEON SWORD"] }],
    ]) {
      expect(lividDaggerBudget({ ...combat, containers: [{ ...inventory, items }] })).toBeNull();
    }
  });
});
