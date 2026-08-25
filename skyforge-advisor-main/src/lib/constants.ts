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

/** Hypixel API key length (UUID format). */
export const API_KEY_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Where users create/manage their Hypixel API key. */
export const DEVELOPER_DASHBOARD_URL = "https://developer.hypixel.net/dashboard";

/** Public origin of this site — used for absolute og:image URLs. */
export const SITE_URL = "https://skyforge-advisor.vercel.app";
