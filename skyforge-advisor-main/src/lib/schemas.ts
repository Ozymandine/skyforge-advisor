// src/lib/schemas.ts
// Runtime validation boundaries using Zod.
// - Validates server function inputs from the browser.
// - Validates normalized API payloads before they cross the network boundary,
//   so upstream Hypixel API changes surface as clear errors instead of
//   silently breaking pages.

import { z } from "zod";

// ---------------------------------------------------------------------------
// Server function input
// ---------------------------------------------------------------------------

export const fetchPlayerInputSchema = z.object({
  apiKey: z.string().trim().min(1).optional(),
  username: z.string().trim().min(1, "A Minecraft username is required").max(64),
  profileId: z.string().trim().optional(),
});

export type FetchPlayerInput = z.infer<typeof fetchPlayerInputSchema>;

// ---------------------------------------------------------------------------
// Normalized domain models (mirror the types in skyblock.ts)
// ---------------------------------------------------------------------------

export const inventoryItemSchema = z.object({
  slot: z.number(),
  name: z.string(),
  id: z.string(),
  texture: z.string().optional(),
  rarity: z.string(),
  count: z.number(),
  lore: z.array(z.string()),
});

export const inventoryContainerSchema = z.object({
  id: z.string(),
  label: z.string(),
  slots: z.number(),
  items: z.array(inventoryItemSchema),
  locked: z.boolean().optional(),
});

export const profileSummarySchema = z.object({
  profileId: z.string(),
  cuteName: z.string(),
  gameMode: z.string(),
  members: z.number(),
  selected: z.boolean(),
});

export const skillProgressSchema = z.object({
  key: z.string(),
  name: z.string(),
  level: z.number(),
  cap: z.number(),
  totalXp: z.number(),
  currentXp: z.number(),
  neededXp: z.number(),
  pct: z.number(),
  maxed: z.boolean(),
});

export const collectionEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  amount: z.number(),
});

export const dungeonFloorSchema = z.object({
  name: z.string(),
  completions: z.number(),
  bestScore: z.number(),
});

export const dungeonStatsSchema = z.object({
  catacombsLevel: z.number(),
  catacombsXp: z.number(),
  secretsFound: z.number(),
  floors: z.array(dungeonFloorSchema),
});

export const slayerEntrySchema = z.object({
  name: z.string(),
  tier: z.number(),
  kills: z.number(),
});

export const petSchema = z.object({
  name: z.string(),
  rarity: z.string(),
  level: z.number(),
  xp: z.number(),
});

export const playerDataSchema = z.object({
  username: z.string(),
  uuid: z.string(),
  profiles: z.array(profileSummarySchema),
  activeProfileId: z.string(),
  skills: z.array(skillProgressSchema),
  skillAverage: z.number(),
  totalSkillXp: z.number(),
  purse: z.number(),
  bank: z.number().nullable(),
  containers: z.array(inventoryContainerSchema),
  collections: z.array(collectionEntrySchema),
  fairySouls: z.number(),
  lastSave: z.number(),
  dungeons: dungeonStatsSchema.optional(),
  slayers: z.array(slayerEntrySchema).optional(),
  pets: z.array(petSchema).optional(),
});

export type PlayerDataValidated = z.infer<typeof playerDataSchema>;

/**
 * Validate a normalized PlayerData payload. Returns the parsed data on
 * success, or null (with a console warning) if the shape is unexpected.
 */
export function validatePlayerData(data: unknown): PlayerDataValidated | null {
  const result = playerDataSchema.safeParse(data);
  if (!result.success) {
    console.warn(
      "Player data failed validation:",
      result.error.issues.slice(0, 5).map((i) => `${i.path.join(".")}: ${i.message}`),
    );
    return null;
  }
  return result.data;
}
