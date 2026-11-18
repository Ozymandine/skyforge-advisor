import { computeDungeonLevel, computeSkill, type PlayerData, type SkillKey } from "./skyblock";

// A fictional, deterministic training profile. It never represents a Hypixel
// account, never calls the profile API, and must not enter real profile history.
export const DEMO_USERNAME = "SkyForgeDemo";
export const DEMO_PROFILE_ID = "skyforge-demo-v1";
export const DEMO_SESSION_KEY = "sba.demo.v1";

export function createDemoProfile(): PlayerData {
  const skillXp: [SkillKey, number][] = [
    ["COMBAT", 300_000],
    ["MINING", 480_000],
    ["FARMING", 190_000],
    ["FISHING", 12_000],
    ["FORAGING", 60_000],
    ["ENCHANTING", 750_000],
    ["ALCHEMY", 8_000],
    ["TAMING", 300_000],
    ["CARPENTRY", 90_000],
  ];
  const skills = skillXp.map(([key, xp]) => computeSkill(key, xp));
  const catacombsXp = 10_000;
  const containers: PlayerData["containers"] = [
    {
      id: "inventory",
      label: "Inventory",
      slots: 36,
      items: [
        {
          slot: 0,
          id: "ASPECT_OF_THE_END",
          name: "Aspect of the End",
          rarity: "RARE",
          count: 1,
          lore: ["Damage: +100", "Strength: +100", "RARE SWORD"],
        },
        {
          slot: 1,
          id: "DIAMOND_PICKAXE",
          name: "Diamond Pickaxe",
          rarity: "COMMON",
          count: 1,
          lore: ["COMMON PICKAXE"],
        },
        {
          slot: 2,
          id: "FISHING_ROD",
          name: "Fishing Rod",
          rarity: "COMMON",
          count: 1,
          lore: ["COMMON FISHING ROD"],
        },
        {
          slot: 9,
          id: "ENCHANTED_ENDER_PEARL",
          name: "Enchanted Ender Pearl",
          rarity: "UNCOMMON",
          count: 32,
          lore: ["UNCOMMON"],
        },
        {
          slot: 10,
          id: "ENCHANTED_DIAMOND",
          name: "Enchanted Diamond",
          rarity: "UNCOMMON",
          count: 16,
          lore: ["UNCOMMON"],
        },
        {
          slot: 11,
          id: "ENCHANTED_WHEAT",
          name: "Enchanted Wheat",
          rarity: "UNCOMMON",
          count: 8,
          lore: ["UNCOMMON"],
        },
        {
          slot: 18,
          id: "SUPERBOOM_TNT",
          name: "Superboom TNT",
          rarity: "RARE",
          count: 16,
          lore: ["RARE"],
        },
      ],
    },
    {
      id: "armor",
      label: "Armor",
      slots: 4,
      items: [
        {
          slot: 0,
          id: "END_BOOTS",
          name: "Ender Boots",
          rarity: "EPIC",
          count: 1,
          lore: ["Health: +15", "Defense: +25", "EPIC BOOTS"],
        },
        {
          slot: 1,
          id: "END_LEGGINGS",
          name: "Ender Leggings",
          rarity: "EPIC",
          count: 1,
          lore: ["EPIC LEGGINGS"],
        },
        {
          slot: 2,
          id: "END_CHESTPLATE",
          name: "Ender Chestplate",
          rarity: "EPIC",
          count: 1,
          lore: ["EPIC CHESTPLATE"],
        },
        {
          slot: 3,
          id: "END_HELMET",
          name: "Ender Helmet",
          rarity: "EPIC",
          count: 1,
          lore: ["EPIC HELMET"],
        },
      ],
    },
    {
      id: "accessory-bag",
      label: "Accessory Bag",
      slots: 9,
      items: [
        {
          slot: 0,
          id: "FARMING_TALISMAN",
          name: "Farming Talisman",
          rarity: "COMMON",
          count: 1,
          lore: ["COMMON ACCESSORY"],
        },
        {
          slot: 1,
          id: "SPEED_TALISMAN",
          name: "Speed Talisman",
          rarity: "COMMON",
          count: 1,
          lore: ["COMMON ACCESSORY"],
        },
      ],
    },
    { id: "enderchest", label: "Ender Chest", slots: 27, items: [] },
    { id: "wardrobe", label: "Wardrobe", slots: 36, items: [] },
    { id: "equipment", label: "Equipment", slots: 4, items: [] },
    { id: "vault", label: "Personal Vault", slots: 54, items: [] },
  ];
  return {
    source: "demo",
    username: DEMO_USERNAME,
    uuid: DEMO_PROFILE_ID,
    activeProfileId: DEMO_PROFILE_ID,
    profiles: [
      {
        profileId: DEMO_PROFILE_ID,
        cuteName: "Training",
        gameMode: "Classic",
        members: 1,
        selected: true,
      },
    ],
    availability: {
      skillKeys: skills.map((skill) => skill.key),
      containerIds: containers.map((container) => container.id),
      accessoryStorage: true,
      fairySouls: true,
      purse: true,
      dungeonCompletions: true,
      catacombsXp: true,
      collections: true,
    },
    skills,
    skillAverage: skills.reduce((sum, skill) => sum + skill.level, 0) / skills.length,
    totalSkillXp: skills.reduce((sum, skill) => sum + skill.totalXp, 0),
    purse: 3_000_000,
    bank: 1_250_000,
    fairySouls: 8,
    skyBlockXp: 2_340,
    lastSave: Date.UTC(2026, 10, 18),
    containers,
    collections: [
      { id: "ENDER_PEARL", name: "Ender Pearl", category: "Combat", amount: 12_500 },
      { id: "DIAMOND", name: "Diamond", category: "Mining", amount: 10_000 },
      { id: "WHEAT", name: "Wheat", category: "Farming", amount: 7_500 },
    ],
    dungeons: {
      catacombsLevel: computeDungeonLevel(catacombsXp),
      catacombsXp,
      secretsFound: 124,
      floors: [
        { name: "Floor 0", completions: 3, bestScore: 280 },
        { name: "Floor 1", completions: 12, bestScore: 305 },
        { name: "Floor 2", completions: 5, bestScore: 298 },
        { name: "Floor 3", completions: 1, bestScore: 280 },
      ],
      masterMode: [],
      classes: [{ name: "Berserk", level: 10, selected: true }],
    },
  };
}
