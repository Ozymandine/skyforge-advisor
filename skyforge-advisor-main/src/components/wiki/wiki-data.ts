export const CATEGORIES = [
  "All",
  "Weapons",
  "Armor",
  "Accessories",
  "Pets",
  "Collections",
  "Minions",
  "Slayer",
  "Enchanting",
  "Reforging",
  "Potions",
  "Mobs",
  "Locations",
  "NPCs",
  "Attributes",
] as const;

export type WikiCategory = (typeof CATEGORIES)[number];

export const RARITY_ORDER: Record<string, number> = {
  COMMON: 0,
  UNCOMMON: 1,
  RARE: 2,
  EPIC: 3,
  LEGENDARY: 4,
  MYTHIC: 5,
  DIVINE: 6,
  SPECIAL: 7,
  "VERY SPECIAL": 8,
};

/* ============================================================================
 * ITEM CLASSIFICATION
 * ========================================================================== */

export const WEAPON_IDS = new Set([
  "ASPECT_OF_THE_END",
  "ASPECT_OF_THE_DRAGONS",
  "ASPECT_OF_THE_VOID",
  "HYPERION",
  "VALKYRIE",
  "SCYLLA",
  "ASTRAEA",
  "GIANTS_SWORD",
  "LIVID_DAGGER",
  "SHADOW_FURY",
  "FELTHORN_REAPER",
  "BONZO_STAFF",
  "SPIRIT_SWORD",
  "MIDAS_SWORD",
  "MIDAS_STAFF",
  "JUDGEMENT_CORE",
  "DARK_CLAYMORE",
  "GIANT_CLEAVER",
  "DAEDALUS_AXE",
  "ATOMSPLIT_KATANA",
  "VORPAL_KATANA",
  "VOIDEDGE_KATANA",
  "END_STONE_SWORD",
  "SILENT_DEATH",
  "DREADLORD_SWORD",
  "ORNATE_ZOMBIE_SWORD",
  "REAPER_FALCHION",
  "REAPER_SCYTHE",
  "CRYPT_DREADLORD",
  "ZOMBIE_SWORD",
  "LEAPING_SWORD",
  "TACTICIAN_SWORD",
  "EMERALD_BLADE",
  "FEL_SWORD",
  "JUJU_SHORTBOW",
  "TERMINATOR",
  "SCORPION_BOW",
  "MOSQUITO_BOW",
  "RUNAANS_BOW",
  "MACHINE_GUN_BOW",
  "SPIRIT_BOW",
  "BONEMERANG",
  "LAST_BREATH",
  "ICE_SPRAY_WAND",
  "FROZEN_SCYTHE",
  "VOODOO_DOLL",
  "INK_WAND",
  "AURORA_STAFF",
  "GLACITE_FIREWORK",
  "RAGNAROCK_AXE",
  "FIRE_FREEZE_STAFF",
  "EDIBLE_MACE",
  "HOLLOW_WAND",
  "WAND_OF_RESTORATION",
  "WAND_OF_MENDING",
  "WAND_OF_ATONEMENT",
  "WEIRD_TUBA",
  "WEIRD_TUBA_PLUS",
  "FLORID_ZOMBIE_SWORD",
  "ORNATE_FLORID_ZOMBIE_SWORD",
]);

export const ARMOR_IDS = new Set([
  "ENDER_HELMET",
  "ENDER_CHESTPLATE",
  "ENDER_LEGGINGS",
  "ENDER_BOOTS",

  "YOUNG_DRAGON_HELMET",
  "YOUNG_DRAGON_CHESTPLATE",
  "YOUNG_DRAGON_LEGGINGS",
  "YOUNG_DRAGON_BOOTS",

  "OLD_DRAGON_HELMET",
  "OLD_DRAGON_CHESTPLATE",
  "OLD_DRAGON_LEGGINGS",
  "OLD_DRAGON_BOOTS",

  "PROTECTOR_DRAGON_HELMET",
  "PROTECTOR_DRAGON_CHESTPLATE",
  "PROTECTOR_DRAGON_LEGGINGS",
  "PROTECTOR_DRAGON_BOOTS",

  "WISE_DRAGON_HELMET",
  "WISE_DRAGON_CHESTPLATE",
  "WISE_DRAGON_LEGGINGS",
  "WISE_DRAGON_BOOTS",

  "STRONG_DRAGON_HELMET",
  "STRONG_DRAGON_CHESTPLATE",
  "STRONG_DRAGON_LEGGINGS",
  "STRONG_DRAGON_BOOTS",

  "UNSTABLE_DRAGON_HELMET",
  "UNSTABLE_DRAGON_CHESTPLATE",
  "UNSTABLE_DRAGON_LEGGINGS",
  "UNSTABLE_DRAGON_BOOTS",

  "SUPERIOR_DRAGON_HELMET",
  "SUPERIOR_DRAGON_CHESTPLATE",
  "SUPERIOR_DRAGON_LEGGINGS",
  "SUPERIOR_DRAGON_BOOTS",

  "HOLY_DRAGON_HELMET",
  "HOLY_DRAGON_CHESTPLATE",
  "HOLY_DRAGON_LEGGINGS",
  "HOLY_DRAGON_BOOTS",

  "NECRON_HELMET",
  "NECRON_CHESTPLATE",
  "NECRON_LEGGINGS",
  "NECRON_BOOTS",

  "STORM_HELMET",
  "STORM_CHESTPLATE",
  "STORM_LEGGINGS",
  "STORM_BOOTS",

  "GOLDOR_HELMET",
  "GOLDOR_CHESTPLATE",
  "GOLDOR_LEGGINGS",
  "GOLDOR_BOOTS",

  "MAXOR_HELMET",
  "MAXOR_CHESTPLATE",
  "MAXOR_LEGGINGS",
  "MAXOR_BOOTS",

  "SHADOW_ASSASSIN_HELMET",
  "SHADOW_ASSASSIN_CHESTPLATE",
  "SHADOW_ASSASSIN_LEGGINGS",
  "SHADOW_ASSASSIN_BOOTS",

  "FROZEN_BLAZE_HELMET",
  "FROZEN_BLAZE_CHESTPLATE",
  "FROZEN_BLAZE_LEGGINGS",
  "FROZEN_BLAZE_BOOTS",

  "CRIMSON_HELMET",
  "CRIMSON_CHESTPLATE",
  "CRIMSON_LEGGINGS",
  "CRIMSON_BOOTS",

  "AURORA_HELMET",
  "AURORA_CHESTPLATE",
  "AURORA_LEGGINGS",
  "AURORA_BOOTS",

  "TERROR_HELMET",
  "TERROR_CHESTPLATE",
  "TERROR_LEGGINGS",
  "TERROR_BOOTS",

  "HOLLOW_HELMET",
  "HOLLOW_CHESTPLATE",
  "HOLLOW_LEGGINGS",
  "HOLLOW_BOOTS",

  "EMERALD_HELMET",
  "EMERALD_CHESTPLATE",
  "EMERALD_LEGGINGS",
  "EMERALD_BOOTS",

  "SUPER_HEAVY_HELMET",
  "SUPER_HEAVY_CHESTPLATE",
  "SUPER_HEAVY_LEGGINGS",
  "SUPER_HEAVY_BOOTS",

  "ADAPTIVE_HELMET",
  "ADAPTIVE_CHESTPLATE",
  "ADAPTIVE_LEGGINGS",
  "ADAPTIVE_BOOTS",

  "FARM_SUIT_HELMET",
  "FARM_SUIT_CHESTPLATE",
  "FARM_SUIT_LEGGINGS",
  "FARM_SUIT_BOOTS",

  "ANGLER_HELMET",
  "ANGLER_CHESTPLATE",
  "ANGLER_LEGGINGS",
  "ANGLER_BOOTS",

  "DIVER_HELMET",
  "DIVER_CHESTPLATE",
  "DIVER_LEGGINGS",
  "DIVER_BOOTS",

  "MINERAL_HELMET",
  "MINERAL_CHESTPLATE",
  "MINERAL_LEGGINGS",
  "MINERAL_BOOTS",
]);

export const ACCESSORY_IDS = new Set([
  "VILLAGE_TALISMAN",
  "FARMING_TALISMAN",
  "MINING_TALISMAN",
  "VACCINE_TALISMAN",
  "BAT_TALISMAN",
  "FEATHER_TALISMAN",
  "FEATHER_ARTIFACT",
  "FEATHER_RING",
  "WOLF_PAW",
  "WOLF_RING",
  "WOLF_ARTIFACT",
  "WOLF_TALISMAN",

  "INTIMIDATION_TALISMAN",
  "INTIMIDATION_ARTIFACT",
  "HEALING_TALISMAN",
  "HEALING_RING",
  "HEALING_ARTIFACT",

  "SCAVENGER_TALISMAN",
  "SCAVENGER_RING",
  "SCAVENGER_ARTIFACT",
  "SCAVENGER_RELIC",

  "SPEED_TALISMAN",
  "SPEED_RING",
  "SPEED_ARTIFACT",
  "SPEED_RELIC",

  "BAT_RING",
  "BAT_ARTIFACT",
  "BAT_PERSONALITY",

  "PERSONAL_COMPACTOR_4000",
  "PERSONAL_COMPACTOR_5000",
  "PERSONAL_COMPACTOR_6000",
  "PERSONAL_COMPACTOR_7000",

  "BITS_TALISMAN",
  "BITS_RING",
  "BITS_ARTIFACT",
  "BITS_RELIC",

  "DANTE_TALISMAN",
  "HAPPY_DANTE_TALISMAN",

  "SCARF_THESIS",
  "SCARF_STUDIES",
  "SCARF_GRIMOIRE",

  "CAMPFIRE_TALISMAN",
  "CAMPFIRE_RING",
  "CAMPFIRE_ARTIFACT",
  "CAMPFIRE_BADGE",

  "CROOKED_TALISMAN",
  "CROOKED_ARTIFACT",

  "RING_OF_LOVE",
  "ROMANCE_TALISMAN",
  "ROMAN_EMPEROR",

  "HUNTER_TALISMAN",
  "HUNTER_RING",
  "HUNTER_ARTIFACT",

  "MASTER_SKULL_TIER_1",
  "MASTER_SKULL_TIER_2",
  "MASTER_SKULL_TIER_3",
  "MASTER_SKULL_TIER_4",
  "MASTER_SKULL_TIER_5",
  "MASTER_SKULL_TIER_6",
  "MASTER_SKULL_TIER_7",

  "BAT_PERSON_ARTIFACT",
  "BAT_PERSON_RING",
  "BAT_PERSON_TALISMAN",

  "TREASURE_TALISMAN",
  "TREASURE_RING",
  "TREASURE_ARTIFACT",
  "TREASURE_RELIC",

  "MAGMA_NECKLACE",
  "GLOWSTONE_GAUNTLET",
  "HEAT_RESISTANT_GLOVE",
]);

export const PET_IDS = new Set([
  "ENDERMAN_PET",
  "ENDER_DRAGON_PET",
  "GOLDEN_DRAGON",
  "TIGER_PET",
  "LION_PET",
  "WITHER_SKELETON_PET",
  "BLUE_WHALE",
  "BABY_YETI",
  "SHEEP",
  "MONKEY",
  "ELEPHANT",
  "ROCK",
  "SCATHA",
  "PHOENIX",
  "GRIFFIN",
  "JELLYFISH",
  "SPIDER",
  "SKELETON_HORSE",
  "SQUID",
  "BAT",
  "BEE",
  "PARROT",
  "MAGMA_CUBE",
  "GUARDIAN",
  "DOLPHIN",
  "SEAL",
  "GIRAFFE",
  "ELEPHANT_PET",
  "RABBIT",
  "OCELOT",
  "ENDERMAN",
  "GHOUL",
  "WOLF",
  "TURTLE",
  "AMMONITE",
  "MITHRIL_GOLEM",
  "BAL",
  "KUUDRA",
]);

export const MINION_BASE_IDS = new Set([
  "WHEAT_MINION",
  "CARROT_MINION",
  "POTATO_MINION",
  "PUMPKIN_MINION",
  "MELON_MINION",
  "MUSHROOM_MINION",
  "COCOA_BEANS_MINION",
  "CACTUS_MINION",
  "SUGAR_CANE_MINION",
  "NETHER_WART_MINION",

  "COBBLESTONE_MINION",
  "COAL_MINION",
  "IRON_MINION",
  "GOLD_MINION",
  "DIAMOND_MINION",
  "EMERALD_MINION",
  "REDSTONE_MINION",
  "LAPIS_MINION",
  "QUARTZ_MINION",
  "OBSIDIAN_MINION",
  "GRAVEL_MINION",
  "SAND_MINION",
  "ICE_MINION",
  "SNOW_MINION",
  "CLAY_MINION",
  "END_STONE_MINION",
  "GLOWSTONE_MINION",
  "MITHRIL_MINION",
  "HARD_STONE_MINION",

  "ZOMBIE_MINION",
  "SKELETON_MINION",
  "SPIDER_MINION",
  "CAVE_SPIDER_MINION",
  "CREEPER_MINION",
  "ENDERMAN_MINION",
  "BLAZE_MINION",
  "MAGMA_CUBE_MINION",
  "GHAST_MINION",
  "SLIME_MINION",
  "REVENANT_MINION",
  "TARANTULA_MINION",
  "VOIDLING_MINION",
  "INFERNO_MINION",

  "CHICKEN_MINION",
  "COW_MINION",
  "PIG_MINION",
  "SHEEP_MINION",
  "RABBIT_MINION",
  "FISHING_MINION",

  "OAK_MINION",
  "SPRUCE_MINION",
  "BIRCH_MINION",
  "JUNGLE_MINION",
  "ACACIA_MINION",
  "DARK_OAK_MINION",
]);

export const COLLECTION_IDS = new Set([
  "WHEAT",
  "SEEDS",
  "CARROT_ITEM",
  "POTATO_ITEM",
  "PUMPKIN",
  "MELON",
  "MUSHROOM_COLLECTION",
  "INK_SACK",
  "CACTUS",
  "SUGAR_CANE",
  "COCOA_BEANS",
  "NETHER_STALK",

  "LOG",
  "LOG_2",
  "OAK_LOG",
  "SPRUCE_LOG",
  "BIRCH_LOG",
  "JUNGLE_LOG",
  "ACACIA_LOG",
  "DARK_OAK_LOG",

  "COBBLESTONE",
  "COAL",
  "IRON_INGOT",
  "GOLD_INGOT",
  "DIAMOND",
  "EMERALD",
  "REDSTONE",
  "QUARTZ",
  "OBSIDIAN",
  "GLOWSTONE_DUST",
  "GRAVEL",
  "SAND",
  "ICE",
  "NETHERRACK",
  "END_STONE",
  "MITHRIL_ORE",
  "TITANIUM_ORE",
  "HARD_STONE",
  "GEMSTONE",

  "ROTTEN_FLESH",
  "BONE",
  "STRING",
  "SPIDER_EYE",
  "GUNPOWDER",
  "ENDER_PEARL",
  "BLAZE_ROD",
  "SLIME_BALL",
  "MAGMA_CREAM",
  "GHAST_TEAR",

  "RAW_BEEF",
  "RAW_CHICKEN",
  "PORK",
  "MUTTON",
  "RABBIT",
  "LEATHER",
  "FEATHER",

  "RAW_FISH",
  "PRISMARINE_SHARD",
  "PRISMARINE_CRYSTALS",
  "CLAY_BALL",
  "WATER_LILY",
  "SPONGE",

  "SULPHUR",
]);

export const REFORGE_STONE_IDS = new Set([
  "DRAGON_CLAW",
  "PRECURSOR_GEAR",
  "GIANT_TOOTH",
  "DARK_ORB",
  "BEATING_HEART",
  "RED_NOSE",
  "MANA_DISINTEGRATOR",
  "HOT_STUFF",
  "JERRY_STONE",
  "PREMIUM_FLESH",
  "BLOOD_DONOR",
  "WITHER_BLOOD",
  "GOLDEN_BALL",
  "SUSPICIOUS_VIAL",
  "SILKY_LICHEN",
  "BLESSED_FRUIT",
  "ROOTED",
  "TOIL_LOG",
  "FLESH",
  "SALMON_OPAL",
  "HARDENED_WOOD",
  "MOLTEN_POWDER",
  "END_STONE_GEODE",
  "STONE_OF_THE_SHREDDED",
  "DRAGON_HORN",
  "MAGMA_URANIUM",
  "BEASTMASTER_CREST",
  "MIDAS_JEWEL",
  "SPOOKY_STONE",
  "HOT_POTATO_BOOK",
]);

export const REFORGE_IDS = new Set([
  "FIERCE",
  "SHARP",
  "GENTLE",
  "EPIC",
  "FAIR",
  "DIRTY",
  "ODD",
  "FAST",
  "HASTY",
  "HEAVY",
  "LIGHT",
  "PURE",
  "TITANIC",
  "SMART",
  "PROTECTIVE",
  "WISE",
  "CLEAN",
  "FABLED",
  "SUSPICIOUS",
  "WITHERED",
  "ANCIENT",
  "RENOWNED",
  "NECROTIC",
  "LOVING",
  "SPIKED",
  "GIANT",
  "PERFECT",
  "BLOOD",
  "PRETTY",
  "BIZARRE",
  "DECEITFUL",
  "ITCHY",
  "MENACING",
  "STRONG",
  "UNPLEASANT",
  "AWKWARD",
  "PRECISE",
  "FORTUITOUS",
  "TREACHEROUS",
  "SALTY",
  "LUCKY",
  "MAGNETIC",
  "FLEET",
  "SUBMERGED",
  "TOIL",
  "TREASURE",
  "REFINED",
  "HEATED",
  "FRUITFUL",
  "BLESSED",
  "AUSPICIOUS",
  "MOIL",
  "GLISTENING",
  "STURDY",
  "CUBIC",
  "ROOTED",
  "ANGLER",
  "DELICATE",
]);

export const SLAYER_IDS = new Set([
  "REVENANT_HORROR",
  "TARANTULA_BROODFATHER",
  "SVEN_PACKMASTER",
  "VOIDGLOOM_SERAPH",
  "INFERNO_DEMONLORD",
  "VAMPIRE",

  "REVENANT_FLESH",
  "REVENANT_VISCERA",
  "TARANTULA_SILK",
  "TARANTULA_WEB",
  "HAMSTER_WHEEL",
  "OVERFLUX_CAPACITOR",
  "CRAZY_RUNE",
  "JUDGEMENT_CORE",
  "WAND_OF_ATONEMENT",
  "REAPER_MASK",
  "REAPER_FALCHION",
  "REAPER_SCYTHE",
]);

export const ATTRIBUTE_IDS = new Set([
  "BLAZING",
  "BUBBA",
  "LIFELINE",
  "MANA_POOL",
  "MANA_REGEN",
  "VETERAN",
  "VITALITY",
  "MAGIC_FIND",
  "SPEED",
  "DOMINANCE",
  "FORTITUDE",
  "MIDAS_TOUCH",
  "UNYIELDING",
  "LIFE_REGEN",
  "ATTACK_SPEED",
  "HEAVY",
  "MAGIC_POWER",
]);

export const POTION_ID_PREFIXES = [
  "POTION_",
  "SPLASH_POTION_",
  "EXTENDED_POTION_",
  "GRAND_EXP_BOTTLE",
  "GOD_POTION",
] as const;

/* ============================================================================
 * API CATEGORY FALLBACKS
 * ========================================================================== */

const CATEGORY_ALIASES: Record<string, WikiCategory> = {
  COLLECTION: "Collections",
  COLLECTIONS: "Collections",
  WEAPON: "Weapons",
  WEAPONS: "Weapons",
  ARMOR: "Armor",
  PET: "Pets",
  PETS: "Pets",
  ACCESSORY: "Accessories",
  ACCESSORIES: "Accessories",
  ATTRIBUTE: "Attributes",
  ATTRIBUTES: "Attributes",
  LOCATION: "Locations",
  LOCATIONS: "Locations",
  NPC: "NPCs",
  NPCS: "NPCs",
  MOB: "Mobs",
  MOBS: "Mobs",
  ENCHANTMENT: "Enchanting",
  ENCHANTMENTS: "Enchanting",
  REFORGE: "Reforging",
  REFORGING: "Reforging",
  POTION: "Potions",
  POTIONS: "Potions",
  MINION: "Minions",
  MINIONS: "Minions",
  SLAYER: "Slayer",
};

/* ============================================================================
 * STATS
 * ========================================================================== */

export const STAT_GROUPS = [
  "Combat",
  "Mining",
  "Farming",
  "Foraging",
  "Fishing",
  "Hunting",
  "Misc",
  "Wisdom",
  "Rift",
  "Other",
] as const;

export type StatGroup = (typeof STAT_GROUPS)[number];

/* ============================================================================
 * NORMALIZATION
 * ========================================================================== */

export function normalize(value: unknown): string {
  return String(value ?? "")
    .replace(/§./g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9_ ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeId(value: unknown): string {
  return normalize(value).replace(/ /g, "_");
}

/* ============================================================================
 * ENCHANTMENT HELPERS
 * ========================================================================== */

export function enchantmentBaseName(id: string): string {
  const normalized = normalizeId(id);

  return normalized
    .replace(/^ENCHANTMENT_/, "")
    .replace(/^ENCHANTED_BOOK_/, "")
    .replace(/_\d+$/, "");
}

export function enchantmentLevel(id: string): number | null {
  const normalized = normalizeId(id);
  const match = normalized.match(/_(\d+)$/);

  return match ? Number(match[1]) : null;
}

/* ============================================================================
 * RARITY HELPERS
 * ========================================================================== */

export function rarityRank(rarity: unknown): number {
  return RARITY_ORDER[normalize(rarity)] ?? 999;
}

/* ============================================================================
 * CLASSIFICATION HELPERS
 * ========================================================================== */

export function isMinionId(id: string): boolean {
  const normalizedIdValue = normalizeId(id);

  if (MINION_BASE_IDS.has(normalizedIdValue)) {
    return true;
  }

  const match = normalizedIdValue.match(/^(.+)_MINION_(\d+)$/);

  if (!match) {
    return false;
  }

  const base = `${match[1]}_MINION`;
  const tier = Number(match[2]);

  return MINION_BASE_IDS.has(base) && Number.isInteger(tier) && tier >= 1 && tier <= 15;
}

export function isPotionId(id: string): boolean {
  const normalizedIdValue = normalizeId(id);

  return POTION_ID_PREFIXES.some((prefix) => normalizedIdValue.startsWith(prefix));
}

export function isSlayerId(id: string): boolean {
  return SLAYER_IDS.has(normalizeId(id));
}

export function isAttribute(item: { id: string; category: string }): boolean {
  const id = normalizeId(item.id);
  const category = normalize(item.category);

  return (
    id.startsWith("ATTRIBUTE_") ||
    id.startsWith("ATTRIBUTE_SHARD_") ||
    ATTRIBUTE_IDS.has(id) ||
    category === "ATTRIBUTE" ||
    category === "ATTRIBUTES"
  );
}

/* ============================================================================
 * MAIN CLASSIFIER
 * ========================================================================== */

export function classifyItem(item: { id: string; category: string }): {
  category: WikiCategory | null;
  vanilla: boolean;
} {
  const id = normalizeId(item.id);
  const apiCategory = normalize(item.category);

  /*
   * Enchantments
   */
  if (
    id.startsWith("ENCHANTMENT_") ||
    id.startsWith("ENCHANTED_BOOK_") ||
    apiCategory === "ENCHANTMENT" ||
    apiCategory === "ENCHANTMENTS"
  ) {
    return {
      category: "Enchanting",
      vanilla: false,
    };
  }

  /*
   * Reforging
   */
  if (
    REFORGE_STONE_IDS.has(id) ||
    REFORGE_IDS.has(id) ||
    apiCategory === "REFORGE" ||
    apiCategory === "REFORGING" ||
    apiCategory === "REFORGE_STONE"
  ) {
    return {
      category: "Reforging",
      vanilla: false,
    };
  }

  /*
   * Minions
   */
  if (isMinionId(id)) {
    return {
      category: "Minions",
      vanilla: false,
    };
  }

  /*
   * Pets
   */
  if (PET_IDS.has(id) || apiCategory === "PET" || apiCategory === "PETS") {
    return {
      category: "Pets",
      vanilla: false,
    };
  }

  /*
   * Accessories
   */
  if (ACCESSORY_IDS.has(id) || apiCategory === "ACCESSORY" || apiCategory === "ACCESSORIES") {
    return {
      category: "Accessories",
      vanilla: false,
    };
  }

  /*
   * Armor
   */
  if (
    ARMOR_IDS.has(id) ||
    apiCategory === "ARMOR" ||
    apiCategory === "HELMET" ||
    apiCategory === "CHESTPLATE" ||
    apiCategory === "LEGGINGS" ||
    apiCategory === "BOOTS"
  ) {
    return {
      category: "Armor",
      vanilla: false,
    };
  }

  /*
   * Weapons
   */
  if (WEAPON_IDS.has(id) || apiCategory === "WEAPON" || apiCategory === "WEAPONS") {
    return {
      category: "Weapons",
      vanilla: false,
    };
  }

  /*
   * Potions
   */
  if (isPotionId(id) || apiCategory === "POTION" || apiCategory === "POTIONS") {
    return {
      category: "Potions",
      vanilla: false,
    };
  }

  /*
   * Slayer
   */
  if (isSlayerId(id)) {
    return {
      category: "Slayer",
      vanilla: false,
    };
  }

  /*
   * Attributes
   */
  if (isAttribute(item)) {
    return {
      category: "Attributes",
      vanilla: false,
    };
  }

  /*
   * Collections
   */
  if (COLLECTION_IDS.has(id)) {
    return {
      category: "Collections",
      vanilla: false,
    };
  }

  /*
   * API category fallback
   *
   * This catches legitimate SkyBlock content that isn't present
   * in one of the hardcoded ID sets above.
   */
  const fallbackCategory = CATEGORY_ALIASES[apiCategory];

  if (fallbackCategory) {
    return {
      category: fallbackCategory,
      vanilla: false,
    };
  }

  /*
   * Truly unknown items remain searchable without being
   * forced into a fake Wiki category.
   */
  return {
    category: null,
    vanilla: true,
  };
}

/* ============================================================================
 * VIRTUAL WIKI PAGES
 * ========================================================================== */

export interface WikiVirtualPage {
  id: string;
  name: string;
  rarity: string;
  category: WikiCategory;
  npcSell: null;
  description: string;
  virtual: true;
  statGroup?: StatGroup;
}

export const VIRTUAL_PAGES: WikiVirtualPage[] = [
  /*
   * Locations
   */
  ...[
    "Hub",
    "Private Island",
    "Barn",
    "Mushroom Desert",
    "Gold Mine",
    "Deep Caverns",
    "Dwarven Mines",
    "Crystal Hollows",
    "The End",
    "Crimson Isle",
    "Spider's Den",
    "Dungeon Hub",
    "Catacombs",
    "Rift",
    "Garden",
  ].map(
    (name) =>
      ({
        id: `WIKI_LOCATION_${name.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}`,
        name,
        rarity: "COMMON",
        category: "Locations",
        npcSell: null,
        description: `Hypixel SkyBlock location: ${name}.`,
        virtual: true,
      }) satisfies WikiVirtualPage,
  ),
];
