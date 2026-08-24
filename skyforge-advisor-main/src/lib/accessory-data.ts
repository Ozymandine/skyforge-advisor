// src/lib/accessory-data.ts
// Accessory family catalog + Magical Power math.
// A "family" groups all tiers of one accessory line (e.g. every Talisman of
// Power upgrade). Owning the highest tier of a family is what counts for MP.

export type AccessoryRarity =
  "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHIC" | "DIVINE" | "SPECIAL";

/** Base magical power granted per rarity (before reforge bonuses). */
export const MP_BY_RARITY: Record<AccessoryRarity, number> = {
  COMMON: 3,
  UNCOMMON: 5,
  RARE: 8,
  EPIC: 12,
  LEGENDARY: 16,
  MYTHIC: 20,
  DIVINE: 22,
  SPECIAL: 25,
};

/** Reforge bonuses applied per accessory (approximate, at max reforge level). */
export const REFORGES = [
  { id: "none", label: "No reforge", bonus: 0 },
  { id: "odd", label: "Odd (common/uncommon)", bonus: 2 },
  { id: "smart", label: "Smart (rare)", bonus: 3 },
  { id: "epic", label: "Epic (epic)", bonus: 4 },
  { id: "giant", label: "Giant (legendary+)", bonus: 5 },
  { id: "mythic", label: "Mythic (mythic+)", bonus: 6 },
] as const;

export type AccessoryTier = {
  name: string;
  rarity: AccessoryRarity;
};

export type AccessoryFamily = {
  id: string;
  label: string;
  /** How the family is obtained (shown for missing tiers). */
  obtain: string;
  tiers: AccessoryTier[];
};

/**
 * Curated catalog of the most impactful accessory families, ordered roughly by
 * progression. Matching against owned items is done by normalized name.
 */
export const ACCESSORY_FAMILIES: AccessoryFamily[] = [
  {
    id: "talisman-of-power",
    label: "Talisman of Power",
    obtain: "Craft from raw materials / buy from Bazaar",
    tiers: [
      { name: "Talisman of Power", rarity: "UNCOMMON" },
      { name: "Ring of Power", rarity: "RARE" },
      { name: "Artifact of Power", rarity: "EPIC" },
      { name: "Relic of Power", rarity: "LEGENDARY" },
    ],
  },
  {
    id: "speed-talisman",
    label: "Speed Talisman",
    obtain: "Craft with sugar cane around an enchanted feather",
    tiers: [
      { name: "Speed Talisman", rarity: "COMMON" },
      { name: "Speed Ring", rarity: "UNCOMMON" },
      { name: "Speed Artifact", rarity: "RARE" },
    ],
  },
  {
    id: "zombie-talisman",
    label: "Zombie Talisman",
    obtain: "Drops from Zombie slayer tiers",
    tiers: [
      { name: "Zombie Talisman", rarity: "UNCOMMON" },
      { name: "Zombie Ring", rarity: "RARE" },
      { name: "Zombie Artifact", rarity: "EPIC" },
    ],
  },
  {
    id: "spider-talisman",
    label: "Spider Talisman",
    obtain: "Drops from Spider slayer tiers",
    tiers: [
      { name: "Spider Talisman", rarity: "UNCOMMON" },
      { name: "Spider Ring", rarity: "RARE" },
      { name: "Spider Artifact", rarity: "EPIC" },
    ],
  },
  {
    id: "wolf-talisman",
    label: "Wolf Talisman",
    obtain: "Drops from Sven (Wolf) slayer tiers",
    tiers: [
      { name: "Wolf Talisman", rarity: "UNCOMMON" },
      { name: "Wolf Ring", rarity: "RARE" },
      { name: "Wolf Artifact", rarity: "EPIC" },
    ],
  },
  {
    id: "ender-artifact",
    label: "Ender Artifact",
    obtain: "Craft from Ender Pearls / Zealot drops",
    tiers: [
      { name: "Ender Talisman", rarity: "UNCOMMON" },
      { name: "Ender Ring", rarity: "RARE" },
      { name: "Ender Artifact", rarity: "EPIC" },
    ],
  },
  {
    id: "red-claw",
    label: "Red Claw Talisman",
    obtain: "Craft from Red Sand collection",
    tiers: [
      { name: "Red Claw Talisman", rarity: "RARE" },
      { name: "Red Claw Ring", rarity: "EPIC" },
      { name: "Red Claw Artifact", rarity: "LEGENDARY" },
    ],
  },
  {
    id: "bat-person",
    label: "Bat Person",
    obtain: "Spooky Festival event rewards",
    tiers: [
      { name: "Bat Person Talisman", rarity: "UNCOMMON" },
      { name: "Bat Person Ring", rarity: "RARE" },
      { name: "Bat Person Artifact", rarity: "EPIC" },
    ],
  },
  {
    id: "day-saver",
    label: "Day/Night Saver",
    obtain: "Craft with enchanted clock components",
    tiers: [
      { name: "Day Crystal", rarity: "UNCOMMON" },
      { name: "Night Crystal", rarity: "UNCOMMON" },
      { name: "Day Saver Talisman", rarity: "RARE" },
      { name: "Night Saver Charm", rarity: "RARE" },
    ],
  },
  {
    id: "hegemony",
    label: "Hegemony Artifact",
    obtain: "Craft from a Relic of Power + gold artifacts",
    tiers: [{ name: "Hegemony Artifact", rarity: "LEGENDARY" }],
  },
  {
    id: "survivor-cube",
    label: "Survivor Cube",
    obtain: "Craft from farming collections",
    tiers: [{ name: "Survivor Cube Artifact", rarity: "EPIC" }],
  },
  {
    id: "treasure-talisman",
    label: "Treasure Talisman",
    obtain: "Craft from Treasure Hoarder drops",
    tiers: [
      { name: "Treasure Talisman", rarity: "UNCOMMON" },
      { name: "Treasure Ring", rarity: "RARE" },
      { name: "Treasure Artifact", rarity: "EPIC" },
    ],
  },
  {
    id: "personal-compactor",
    label: "Personal Compactor",
    obtain: "Craft from redstone collection",
    tiers: [
      { name: "Personal Compactor 4000", rarity: "UNCOMMON" },
      { name: "Personal Compactor 5000", rarity: "RARE" },
      { name: "Personal Compactor 6000", rarity: "EPIC" },
      { name: "Personal Compactor 7000", rarity: "LEGENDARY" },
    ],
  },
  {
    id: "great-spook",
    label: "Great Spook",
    obtain: "Great Spook event (Spooky Festival)",
    tiers: [
      { name: "Great Spook Talisman", rarity: "SPECIAL" },
      { name: "Great Spook Ring", rarity: "SPECIAL" },
      { name: "Great Spook Artifact", rarity: "SPECIAL" },
    ],
  },
  {
    id: "scavenger",
    label: "Scavenger Talisman",
    obtain: "Craft from rotten flesh collection",
    tiers: [
      { name: "Scavenger Talisman", rarity: "UNCOMMON" },
      { name: "Scavenger Ring", rarity: "RARE" },
      { name: "Scavenger Artifact", rarity: "EPIC" },
    ],
  },
  {
    id: "piggy-bank",
    label: "Piggy Bank",
    obtain: "Craft from pork collection",
    tiers: [
      { name: "Piggy Bank", rarity: "UNCOMMON" },
      { name: "Cracked Piggy Bank", rarity: "RARE" },
      { name: "Broken Piggy Bank", rarity: "EPIC" },
    ],
  },
  {
    id: "campfire",
    label: "Campfire Talisman",
    obtain: "Campfire Trial rewards",
    tiers: [
      { name: "Campfire Talisman Tier 1", rarity: "UNCOMMON" },
      { name: "Campfire Ring Tier 10", rarity: "RARE" },
      { name: "Campfire Artifact Tier 20", rarity: "EPIC" },
      { name: "Campfire Relic Tier 30", rarity: "LEGENDARY" },
    ],
  },
  {
    id: "melody-hair",
    label: "Melody's Hair",
    obtain: "Complete Melody's Harp minigame",
    tiers: [{ name: "Melody's Hair", rarity: "EPIC" }],
  },
  {
    id: "shrimp-the-what",
    label: "Shrimp The What",
    obtain: "Fishing event reward",
    tiers: [{ name: "Shrimp The What", rarity: "UNCOMMON" }],
  },
  {
    id: "bit-bag",
    label: "Bits Talisman",
    obtain: "Bits shop (boosters tier)",
    tiers: [
      { name: "Bits Talisman", rarity: "UNCOMMON" },
      { name: "Bits Ring", rarity: "RARE" },
      { name: "Bits Artifact", rarity: "EPIC" },
    ],
  },
];

/** Normalize an item name for family matching. */
export function normalizeAccessoryName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Magical power for a single accessory, including a reforge bonus. */
export function mpForAccessory(rarity: AccessoryRarity, reforgeBonus = 0) {
  return (MP_BY_RARITY[rarity] ?? 0) + reforgeBonus;
}

/**
 * Magical power conversion: every MP point grants +0.1% damage on most weapons
 * and small stat boosts. Shown as a friendly summary in the calculator.
 */
export function mpToDamageBonus(mp: number) {
  return mp * 0.1;
}
