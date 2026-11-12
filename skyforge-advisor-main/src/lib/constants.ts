// src/lib/constants.ts
// Central place for game-balance numbers that change with SkyBlock updates.
// Update these values when Hypixel raises caps — do not hardcode them in routes.

/** Maximum obtainable fairy souls (updates as new zones are released). */
export const MAX_FAIRY_SOULS = 242;

/** Total collection tiers tracked across all categories. */
export const MAX_COLLECTION_TIERS = 484;

/** Maximum skill average (all skills at their caps, weighted). */
export const MAX_SKILL_AVERAGE = 50.36;

/** Number of distinct collection categories in the game. */
export const MAX_COLLECTION_CATEGORIES = 6;

/** Number of storage containers typically decoded from a profile. */
export const TYPICAL_CONTAINER_COUNT = 10;

/** Public origin of this site — used for absolute og:image URLs. */
export const SITE_URL = "https://skyforge-advisor.vercel.app";

export const MARKET_MAX_AGE_MS = 5 * 60_000;
export const BAZAAR_SELL_FEE_RATE = 0.0125;

export const RARITY_COLORS: Record<string, string> = {
  COMMON: "#ffffff",
  UNCOMMON: "#55ff55",
  RARE: "#5555ff",
  EPIC: "#aa00aa",
  LEGENDARY: "#ffaa00",
  MYTHIC: "#ff55ff",
  DIVINE: "#55ffff",
  SPECIAL: "#ff5555",
  VERY_SPECIAL: "#ff5555",
};
