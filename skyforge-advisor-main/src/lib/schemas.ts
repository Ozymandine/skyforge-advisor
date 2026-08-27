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
  enchantments: z.record(z.string(), z.number()).optional(),
  reforge: z.string().optional(),
  stars: z.number().optional(),
  hotPotatoBooks: z.number().optional(),
  gems: z.record(z.string(), z.string()).optional(),
  abilityScrolls: z.array(z.string()).optional(),
  attributes: z.record(z.string(), z.number()).optional(),
  artOfWar: z.number().optional(),
  woodSingularity: z.number().optional(),
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
  masterMode: z.array(dungeonFloorSchema).optional(),
  masterModeLevel: z.number().optional(),
  masterModeXp: z.number().optional(),
  classes: z
    .array(
      z.object({
        name: z.string(),
        level: z.number(),
        selected: z.boolean(),
      }),
    )
    .optional(),
  milestones: z.number().optional(),
});

export const slayerEntrySchema = z.object({
  name: z.string(),
  tier: z.number(),
  kills: z.number(),
  xp: z.number().optional(),
});

export const petSchema = z.object({
  name: z.string(),
  rarity: z.string(),
  level: z.number(),
  xp: z.number(),
  active: z.boolean().optional(),
  heldItem: z.string().optional(),
  skin: z.string().optional(),
  candyUsed: z.number().optional(),
});

const recordNumber = z.record(z.string(), z.number());

export const hotmSchema = z.object({
  tier: z.number(),
  xp: z.number(),
  powders: z.object({
    mithril: z.number(),
    gemstone: z.number(),
    glacite: z.number(),
  }),
  nodes: recordNumber,
});

export const gardenSchema = z.object({
  level: z.number(),
  xp: z.number(),
  cropMilestones: recordNumber,
  visitorsServed: z.number().optional(),
  compost: z.number().optional(),
});

export const crimsonSchema = z.object({
  dojo: recordNumber,
  kuudra: recordNumber,
  faction: z.string().optional(),
  reputation: z.number().optional(),
});

export const riftSchema = z.object({
  motes: z.number().optional(),
  progress: recordNumber,
});

export const museumSchema = z.object({
  donatedItems: z.number().optional(),
  appraised: z.number().optional(),
});

export const achievementsSchema = z.object({
  points: z.number(),
  categories: recordNumber,
});

export const jacobSchema = z.object({
  gold: z.number(),
  silver: z.number(),
  bronze: z.number(),
  platinum: z.number().optional(),
  diamond: z.number().optional(),
  perCrop: recordNumber,
});

export const experimentationSchema = z.object({
  claims: recordNumber,
});

export const lifetimeStatsSchema = z.object({
  kills: z.number().optional(),
  deaths: z.number().optional(),
});

export const communityUpgradeSchema = z.object({
  upgrade: z.string(),
  level: z.number(),
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
  hotm: hotmSchema.optional(),
  garden: gardenSchema.optional(),
  crimson: crimsonSchema.optional(),
  rift: riftSchema.optional(),
  museum: museumSchema.optional(),
  achievements: achievementsSchema.optional(),
  jacob: jacobSchema.optional(),
  experimentation: experimentationSchema.optional(),
  lifetimeStats: lifetimeStatsSchema.optional(),
  communityUpgrades: z.array(communityUpgradeSchema).optional(),
  craftedGenerators: z.array(z.string()).optional(),
  sacks: z
    .object({
      totalValue: z.number(),
      items: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          count: z.number(),
          value: z.number(),
        }),
      ),
    })
    .optional(),
  bestiary: z
    .object({
      totalKills: z.number(),
      totalDeaths: z.number(),
      totalTiersUnlocked: z.number(),
      maxTiers: z.number(),
      milestone: z.number(),
      milestoneProgressPct: z.number(),
      families: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          totalKills: z.number(),
          totalDeaths: z.number(),
          tiersUnlocked: z.number(),
          maxTiers: z.number(),
          mobs: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              kills: z.number(),
              deaths: z.number(),
              tier: z.number(),
              maxTier: z.number(),
              nextTierKills: z.number().nullable(),
              bracket: z.number(),
            }),
          ),
        }),
      ),
    })
    .optional(),
  slayerOverview: z
    .object({
      totalXp: z.number(),
      totalKills: z.number(),
      bosses: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          level: z.number(),
          maxLevel: z.number(),
          currentXp: z.number(),
          neededXp: z.number(),
          totalKills: z.number(),
          tierKills: z.record(z.string(), z.number()),
          unlockedPassives: z.array(z.string()),
        }),
      ),
      passives: z.object({
        health: z.number(),
        critDamage: z.number(),
        speed: z.number(),
        extraEffects: z.array(z.string()),
      }),
    })
    .optional(),
  hypixelPlayer: z
    .object({
      rank: z.string().nullable().optional(),
      monthlyPackageRank: z.string().nullable().optional(),
      newPackageRank: z.string().nullable().optional(),
      packageRank: z.string().nullable().optional(),
      prefix: z.string().nullable().optional(),
      rankPlusColor: z.string().nullable().optional(),
      monthlyRankColor: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
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
