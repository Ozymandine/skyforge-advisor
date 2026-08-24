import {
  ATTRIBUTE_IDS,
  ARMOR_IDS,
  ACCESSORY_IDS,
  COLLECTION_IDS,
  MINION_BASE_IDS,
  PET_IDS,
  POTION_ID_PREFIXES,
  REFORGE_IDS,
  REFORGE_STONE_IDS,
  SLAYER_IDS,
  WEAPON_IDS,
  RARITY_ORDER,
  type WikiCategory,
} from "./wiki-data";

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
 * MINIONS
 * ========================================================================== */

export function isMinionId(id: string): boolean {
  if (MINION_BASE_IDS.has(id)) {
    return true;
  }

  const match = id.match(/^(.+)_MINION_(\d+)$/);

  if (!match) {
    return false;
  }

  const base = `${match[1]}_MINION`;
  const tier = Number(match[2]);

  return MINION_BASE_IDS.has(base) && Number.isInteger(tier) && tier >= 1 && tier <= 15;
}

/* ============================================================================
 * POTIONS
 * ========================================================================== */

export function isPotionId(id: string): boolean {
  return POTION_ID_PREFIXES.some((prefix) => id.startsWith(prefix));
}

/* ============================================================================
 * SLAYER
 * ========================================================================== */

export function isSlayerId(id: string): boolean {
  return SLAYER_IDS.has(id);
}

/* ============================================================================
 * ATTRIBUTES
 * ========================================================================== */

export function isAttribute(item: { id: string; category: string }): boolean {
  const id = normalizeId(item.id);

  if (id.startsWith("ATTRIBUTE_") || id.startsWith("ATTRIBUTE_SHARD_")) {
    return true;
  }

  const category = normalize(item.category);

  return category === "ATTRIBUTE" || category === "ATTRIBUTES" || ATTRIBUTE_IDS.has(id);
}

/* ============================================================================
 * CATEGORY RESOLUTION
 * ========================================================================== */

export function classifyItem(item: { id: string; category: string }): {
  category: WikiCategory | null;
  vanilla: boolean;
} {
  const id = normalizeId(item.id);
  const apiCategory = normalize(item.category);

  /*
   * Most specific categories first.
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

  if (isMinionId(id)) {
    return {
      category: "Minions",
      vanilla: false,
    };
  }

  if (PET_IDS.has(id)) {
    return {
      category: "Pets",
      vanilla: false,
    };
  }

  if (ACCESSORY_IDS.has(id)) {
    return {
      category: "Accessories",
      vanilla: false,
    };
  }

  if (ARMOR_IDS.has(id)) {
    return {
      category: "Armor",
      vanilla: false,
    };
  }

  if (WEAPON_IDS.has(id)) {
    return {
      category: "Weapons",
      vanilla: false,
    };
  }

  if (isPotionId(id)) {
    return {
      category: "Potions",
      vanilla: false,
    };
  }

  if (isSlayerId(id)) {
    return {
      category: "Slayer",
      vanilla: false,
    };
  }

  if (isAttribute(item)) {
    return {
      category: "Attributes",
      vanilla: false,
    };
  }

  if (COLLECTION_IDS.has(id)) {
    return {
      category: "Collections",
      vanilla: false,
    };
  }

  /*
   * API categories we trust directly.
   */

  if (apiCategory === "WEAPON" || apiCategory === "WEAPONS") {
    return {
      category: "Weapons",
      vanilla: false,
    };
  }

  if (
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

  if (apiCategory === "PET" || apiCategory === "PETS") {
    return {
      category: "Pets",
      vanilla: false,
    };
  }

  if (apiCategory === "ACCESSORY" || apiCategory === "ACCESSORIES") {
    return {
      category: "Accessories",
      vanilla: false,
    };
  }

  if (apiCategory === "POTION" || apiCategory === "POTIONS") {
    return {
      category: "Potions",
      vanilla: false,
    };
  }

  /*
   * Unknown items remain unclassified.
   */

  return {
    category: null,
    vanilla: true,
  };
}

/* ============================================================================
 * RARITY
 * ========================================================================== */

export function rarityRank(rarity: string | undefined): number {
  const normalized = normalize(rarity).replace(/\s+/g, "_");

  return RARITY_ORDER[normalized] ?? 99;
}

/* ============================================================================
 * ENCHANTMENTS
 * ========================================================================== */

const ROMAN_LEVELS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export function enchantmentBaseName(name: string): string | null {
  const normalized = name.replace(/§./g, "").trim();

  const match = normalized.match(/^(.+?)\s+(I|II|III|IV|V|VI|VII|VIII|IX|X|\d+)$/);

  if (!match) {
    return null;
  }

  return match[1] ?? null;
}

export function enchantmentLevel(name: string): number | null {
  const match = name.match(/\s+(I|II|III|IV|V|VI|VII|VIII|IX|X|\d+)$/);

  if (!match) {
    return null;
  }

  const value = match[1] ?? "";

  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  const index = ROMAN_LEVELS.indexOf(value);

  return index >= 0 ? index + 1 : null;
}
