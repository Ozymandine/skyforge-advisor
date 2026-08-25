// src/lib/item-valuation.ts
// Comprehensive item valuation engine for Hypixel SkyBlock items:
// Calculates accurate market value for base items + exponential enchantment tiers +
// base-book scaled ultimate enchantments (2^(level-1)) + Master Stars 6-10 +
// applied Gemstone quality sockets + Reforge stones + Kuudra Attributes + Art of War / Scrolls.

export type EnchantEstimate = {
  name: string;
  level: number;
  value: number;
};

export type GemEstimate = {
  slot: string;
  type: string;
  quality: string;
  value: number;
};

export type AttributeEstimate = {
  name: string;
  level: number;
  value: number;
};

export type ItemExtras = {
  enchantments?: Record<string, number> | undefined;
  stars?: number | undefined;
  hotPotatoBooks?: number | undefined;
  fumingBooks?: number | undefined;
  reforge?: string | undefined;
  gems?: Record<string, string> | undefined;
  attributes?: Record<string, number> | undefined;
  abilityScrolls?: string[] | undefined;
  artOfWar?: number | undefined;
  woodSingularity?: number | undefined;
};

export type ItemValuation = {
  base: number | null;
  enchants: EnchantEstimate[];
  enchantTotal: number;
  hotPotatoBooks: number;
  fumingBooks: number;
  bookTotal: number;
  stars: number;
  starTotal: number;
  masterStars: number;
  masterStarTotal: number;
  reforge: string | null;
  reforgeValue: number;
  gems: GemEstimate[];
  gemTotal: number;
  attributes: AttributeEstimate[];
  attributeTotal: number;
  scrolls: string[];
  scrollTotal: number;
  artOfWar: number;
  woodSingularity: number;
  extrasTotal: number;
  total: number | null;
  /**
   * "market" when the total is anchored to a live base price;
   * "estimated" when only the upgrade components are heuristic-priced.
   */
  confidence: "market" | "estimated";
};

// ---------------------------------------------------------------------------
// 1. EXPONENTIAL REGULAR ENCHANTMENTS (Tiers 1 through 7, Efficiency X, etc.)
// ---------------------------------------------------------------------------

const EXPONENTIAL_ENCHANTS: Record<string, Record<number, number>> = {
  growth: { 1: 10_000, 2: 20_000, 3: 40_000, 4: 80_000, 5: 150_000, 6: 3_500_000, 7: 500_000_000 },
  protection: { 1: 10_000, 2: 20_000, 3: 40_000, 4: 80_000, 5: 180_000, 6: 4_000_000, 7: 450_000_000 },
  sharpness: { 1: 10_000, 2: 20_000, 3: 40_000, 4: 80_000, 5: 150_000, 6: 1_800_000, 7: 250_000_000 },
  power: { 1: 10_000, 2: 20_000, 3: 40_000, 4: 80_000, 5: 150_000, 6: 4_500_000, 7: 400_000_000 },
  critical: { 1: 10_000, 2: 20_000, 3: 40_000, 4: 80_000, 5: 150_000, 6: 8_000_000, 7: 160_000_000 },
  giant_killer: { 1: 10_000, 2: 20_000, 3: 40_000, 4: 80_000, 5: 150_000, 6: 3_500_000, 7: 180_000_000 },
  first_strike: { 1: 10_000, 2: 25_000, 3: 60_000, 4: 150_000, 5: 18_000_000 },
  triple_strike: { 1: 10_000, 2: 25_000, 3: 60_000, 4: 150_000, 5: 18_000_000 },
  looting: { 1: 10_000, 2: 30_000, 3: 80_000, 4: 2_200_000, 5: 120_000_000 },
  scavenger: { 1: 10_000, 2: 30_000, 3: 80_000, 4: 600_000, 5: 35_000_000 },
  vampirism: { 1: 10_000, 2: 25_000, 3: 60_000, 4: 120_000, 5: 250_000, 6: 15_000_000 },
  life_steal: { 1: 10_000, 2: 30_000, 3: 80_000, 4: 500_000, 5: 35_000_000 },
  syphon: { 1: 10_000, 2: 30_000, 3: 80_000, 4: 700_000, 5: 38_000_000 },
  fortune: { 1: 20_000, 2: 60_000, 3: 200_000, 4: 1_800_000 },
  efficiency: {
    1: 5_000,
    2: 10_000,
    3: 25_000,
    4: 60_000,
    5: 150_000,
    6: 1_200_000,
    7: 12_000_000,
    8: 35_000_000,
    9: 80_000_000,
    10: 175_000_000,
  },
  sugar_rush: { 1: 50_000, 2: 150_000, 3: 500_000 },
  overload: { 1: 1_200_000, 2: 2_400_000, 3: 4_800_000, 4: 9_600_000, 5: 19_200_000 },
  vicious: { 1: 22_000_000, 2: 44_000_000, 3: 88_000_000, 4: 176_000_000, 5: 350_000_000 },
  ender_slayer: { 1: 10_000, 2: 25_000, 3: 60_000, 4: 120_000, 5: 250_000, 6: 1_800_000, 7: 85_000_000 },
  smite: { 1: 5_000, 2: 15_000, 3: 35_000, 4: 80_000, 5: 150_000, 6: 300_000, 7: 45_000_000 },
  bane_of_arthropods: { 1: 5_000, 2: 15_000, 3: 35_000, 4: 80_000, 5: 150_000, 6: 250_000, 7: 35_000_000 },
  dragon_hunter: { 1: 4_500_000, 2: 9_000_000, 3: 18_000_000, 4: 36_000_000, 5: 72_000_000 },
  dedication: { 1: 150_000, 2: 600_000, 3: 2_500_000, 4: 125_000_000 },
  cultivating: { 1: 100_000, 2: 250_000, 3: 500_000, 4: 1_000_000, 5: 2_000_000, 6: 3_500_000, 7: 5_500_000, 8: 8_000_000, 9: 11_500_000, 10: 16_000_000 },
  compact: { 1: 200_000, 2: 400_000, 3: 800_000, 4: 1_500_000, 5: 2_500_000, 6: 4_000_000, 7: 6_000_000, 8: 8_500_000, 9: 12_000_000, 10: 18_000_000 },
  replenish: { 1: 1_600_000 },
  pristine: { 1: 500_000, 2: 1_200_000, 3: 2_800_000, 4: 6_500_000, 5: 15_000_000 },
  champion: { 1: 150_000, 2: 300_000, 3: 600_000, 4: 1_200_000, 5: 2_500_000, 6: 4_500_000, 7: 7_500_000, 8: 12_000_000, 9: 18_000_000, 10: 28_000_000 },
  hecatomb: { 1: 200_000, 2: 400_000, 3: 800_000, 4: 1_600_000, 5: 3_200_000, 6: 6_000_000, 7: 10_000_000, 8: 16_000_000, 9: 25_000_000, 10: 40_000_000 },
};

const DEFAULT_LINEAR_ENCHANTS: Record<string, number> = {
  execute: 80_000,
  cubism: 80_000,
  impaling: 100_000,
  thunderlord: 60_000,
  thunderbolt: 70_000,
  ferocious_mana: 120_000,
  hardened_mana: 100_000,
  mana_vampire: 150_000,
  strong_mana: 120_000,
  true_protection: 250_000,
  angler: 60_000,
  caster: 80_000,
  frail: 50_000,
  rainbow: 250_000,
  big_brain: 200_000,
  delicate: 50_000,
  eco_friendly: 50_000,
  harvesting: 80_000,
  turbo_crops: 100_000,
  chance: 80_000,
  feather_falling: 50_000,
  respiration: 50_000,
  aqua_affinity: 50_000,
  depth_strider: 80_000,
  frost_walker: 50_000,
  blast_protection: 50_000,
  fire_protection: 50_000,
  projectile_protection: 50_000,
  thorns: 50_000,
};

// ---------------------------------------------------------------------------
// 2. ULTIMATE ENCHANTMENTS (Tier 1 Base Book × 2^(level - 1))
// ---------------------------------------------------------------------------

const ULTIMATE_BASE_BOOK_COSTS: Record<string, number> = {
  chimera: 75_000_000,
  fatal_tempo: 60_000_000,
  soul_eater: 3_500_000,
  duplex: 12_000_000,
  inferno: 8_000_000,
  one_for_all: 6_000_000, // Flat (only Tier 1 exists)
  legion: 4_000_000,
  swarm: 1_000_000,
  wisdom: 600_000,
  last_stand: 400_000,
  combo: 300_000,
  rend: 800_000,
  habanero_tactics: 20_000_000,
  ultimate_wise: 500_000,
  wise: 500_000,
  flash: 2_500_000,
  bank: 150_000,
  no_pain_no_gain: 200_000,
  refrigerate: 2_500_000,
  the_one: 3_000_000,
};

// ---------------------------------------------------------------------------
// 3. MASTER STARS (Stars 6 through 10)
// ---------------------------------------------------------------------------

const MASTER_STAR_VALUES: Record<number, number> = {
  6: 15_000_000,  // First Master Star
  7: 25_000_000,  // Second Master Star
  8: 45_000_000,  // Third Master Star
  9: 75_000_000,  // Fourth Master Star
  10: 120_000_000 // Fifth Master Star
};

// ---------------------------------------------------------------------------
// 4. GEMSTONE QUALITY TIERS (Jasper, Ruby, Topaz, Opal, Onyx vs others)
// ---------------------------------------------------------------------------

const EXPENSIVE_GEMS = new Set(["jasper", "ruby", "topaz", "opal", "onyx", "peridot", "aquamarine", "citrine"]);

function getGemstoneValue(gemType: string, quality: string): number {
  const q = quality.toUpperCase();
  const isHighValue = EXPENSIVE_GEMS.has(gemType.toLowerCase());

  switch (q) {
    case "PERFECT":
      return isHighValue ? 45_000_000 : 32_000_000;
    case "FLAWLESS":
      return isHighValue ? 6_500_000 : 3_500_000;
    case "FINE":
      return isHighValue ? 250_000 : 150_000;
    case "FLAWED":
      return 25_000;
    case "ROUGH":
      return 3_000;
    default:
      return 0;
  }
}

// ---------------------------------------------------------------------------
// 5. REFORGE STONES
// ---------------------------------------------------------------------------

const REFORGE_STONE_VALUES: Record<string, number> = {
  withered: 6_500_000,     // Wither Blood
  fabled: 1_800_000,       // Dragon Claw
  ancient: 2_500_000,      // Precursor Gear
  renowned: 18_000_000,    // Dragon Horn
  giant: 1_200_000,        // Giant Tooth
  loving: 1_500_000,       // Red Scarf
  hyper: 1_000_000,        // End Stone Geode
  gilded: 15_000_000,      // Midas Jewel
  suspicious: 2_000_000,   // Suspicious Vial
  jerry: 4_000_000,        // Jerry Stone
  strengthened: 6_000_000, // Diamond Atom
  spiritual: 2_000_000,    // Spirit Stone
  headstrong: 1_500_000,   // Salmon Opal
  submerged: 14_000_000,   // Deep Sea Orb
  blessed: 1_200_000,      // Blessed Fruit
  undead: 1_000_000,       // Undead Catalyst
  pitchin: 2_000_000,      // Pitchfork
  ambered: 9_000_000,      // Amber Material
  perfect: 30_000_000,     // Divan's Powder Coating
  divan: 30_000_000,
  fruitful: 1_200_000,
  bountiful: 1_000_000,
};

// ---------------------------------------------------------------------------
// 6. KUUDRA ATTRIBUTES (Base Shard × 2^(tier - 1))
// ---------------------------------------------------------------------------

const KUUDRA_ATTRIBUTE_BASE_COSTS: Record<string, number> = {
  mana_pool: 1_200_000,
  veteran: 1_200_000,
  magic_find: 1_800_000,
  dominance: 800_000,
  vitality: 600_000,
  speed: 400_000,
  lifeline: 500_000,
  breeze: 500_000,
  undead: 400_000,
  fortitude: 350_000,
  mana_regeneration: 500_000,
  blazing_fortune: 2_000_000,
  fishing_experience: 1_500_000,
};

// ---------------------------------------------------------------------------
// 7. OTHER MODIFIERS
// ---------------------------------------------------------------------------

const HOT_POTATO_VALUE = 350_000;
const FUMING_POTATO_VALUE = 1_000_000;
const ART_OF_WAR_VALUE = 5_500_000;
const WOOD_SINGULARITY_VALUE = 4_500_000;
const WITHER_SCROLL_VALUE = 70_000_000;

function stripColorCodes(line: string) {
  return line.replace(/§./g, "").trim();
}

/**
 * Calculates accurate valuation for an item given its lore and optional structured ExtraAttributes.
 */
export function estimateItemValue(
  lore: string[] | undefined,
  basePrice: number | null,
  extras?: ItemExtras,
): ItemValuation {
  const result: ItemValuation = {
    base: basePrice,
    enchants: [],
    enchantTotal: 0,
    hotPotatoBooks: 0,
    fumingBooks: 0,
    bookTotal: 0,
    stars: 0,
    starTotal: 0,
    masterStars: 0,
    masterStarTotal: 0,
    reforge: null,
    reforgeValue: 0,
    gems: [],
    gemTotal: 0,
    attributes: [],
    attributeTotal: 0,
    scrolls: [],
    scrollTotal: 0,
    artOfWar: 0,
    woodSingularity: 0,
    extrasTotal: 0,
    total: basePrice,
    confidence: basePrice !== null ? "market" : "estimated",
  };

  const romanToNumber: Record<string, number> = {
    I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10,
  };

  // Helper to value a specific enchantment
  function applyEnchant(rawName: string, level: number) {
    const name = rawName.toLowerCase().replace(/[\s-]/g, "_");
    const cleanDisplayName = rawName.replace(/_/g, " ");

    // Check Ultimate enchants
    const ultKey = Object.keys(ULTIMATE_BASE_BOOK_COSTS).find((k) => name.includes(k));
    if (ultKey) {
      const baseCost = ULTIMATE_BASE_BOOK_COSTS[ultKey]!;
      const bookCount = ultKey === "one_for_all" ? 1 : Math.pow(2, Math.max(level - 1, 0));
      const value = baseCost * bookCount;
      result.enchants.push({ name: `Ultimate ${cleanDisplayName}`, level, value });
      result.enchantTotal += value;
      return;
    }

    // Check Exponential regular enchants
    const expKey = Object.keys(EXPONENTIAL_ENCHANTS).find((k) => name.includes(k));
    if (expKey && EXPONENTIAL_ENCHANTS[expKey]) {
      const table = EXPONENTIAL_ENCHANTS[expKey]!;
      const value = table[level] ?? (table[5] ? table[5]! * level : 100_000 * level);
      result.enchants.push({ name: expKey.replace(/_/g, " "), level, value });
      result.enchantTotal += value;
      return;
    }

    // Check Linear fallback enchants
    const linKey = Object.keys(DEFAULT_LINEAR_ENCHANTS).find((k) => name.includes(k));
    if (linKey && DEFAULT_LINEAR_ENCHANTS[linKey]) {
      const value = DEFAULT_LINEAR_ENCHANTS[linKey]! * level;
      result.enchants.push({ name: linKey.replace(/_/g, " "), level, value });
      result.enchantTotal += value;
      return;
    }

    // Default unknown enchant fallback
    const fallbackValue = 50_000 * level;
    result.enchants.push({ name: cleanDisplayName, level, value: fallbackValue });
    result.enchantTotal += fallbackValue;
  }

  // Process structured ExtraAttributes if available
  if (extras) {
    // 1. Structured Enchantments
    if (extras.enchantments) {
      for (const [ench, lvl] of Object.entries(extras.enchantments)) {
        if (typeof lvl === "number" && lvl > 0) {
          applyEnchant(ench, lvl);
        }
      }
    }

    // 2. Structured Stars & Master Stars
    if (typeof extras.stars === "number" && extras.stars > 0) {
      result.stars = Math.min(extras.stars, 5);
      result.starTotal = result.base !== null ? Math.round(result.base * 0.05 * result.stars) : 0;
      if (extras.stars > 5) {
        result.masterStars = extras.stars - 5;
        let msVal = 0;
        for (let s = 6; s <= extras.stars; s++) {
          msVal += MASTER_STAR_VALUES[s] ?? 50_000_000;
        }
        result.masterStarTotal = msVal;
      }
    }

    // 3. Structured Potato Books
    if (typeof extras.hotPotatoBooks === "number") {
      result.hotPotatoBooks = Math.min(extras.hotPotatoBooks, 10);
      result.fumingBooks = Math.max(extras.hotPotatoBooks - 10, 0);
    }
    if (typeof extras.fumingBooks === "number") {
      result.fumingBooks = extras.fumingBooks;
    }

    // 4. Structured Reforge
    if (typeof extras.reforge === "string" && extras.reforge) {
      result.reforge = extras.reforge;
      const refKey = extras.reforge.toLowerCase().replace(/[\s-]/g, "_");
      const matchedRef = Object.keys(REFORGE_STONE_VALUES).find((k) => refKey.includes(k));
      if (matchedRef) {
        result.reforgeValue = REFORGE_STONE_VALUES[matchedRef]!;
      }
    }

    // 5. Structured Gemstones
    if (extras.gems) {
      for (const [slot, gemQuality] of Object.entries(extras.gems)) {
        if (typeof gemQuality === "string" && gemQuality && !slot.endsWith("_gem")) {
          const gemType = slot.replace(/_\d+$/, "");
          const gemVal = getGemstoneValue(gemType, gemQuality);
          result.gems.push({ slot, type: gemType, quality: gemQuality, value: gemVal });
          result.gemTotal += gemVal;
        }
      }
    }

    // 6. Structured Kuudra Attributes
    if (extras.attributes) {
      for (const [attrName, attrLvl] of Object.entries(extras.attributes)) {
        if (typeof attrLvl === "number" && attrLvl > 0) {
          const key = attrName.toLowerCase().replace(/[\s-]/g, "_");
          const baseCost = KUUDRA_ATTRIBUTE_BASE_COSTS[key] ?? 300_000;
          const count = Math.pow(2, Math.max(attrLvl - 1, 0));
          const val = baseCost * count;
          result.attributes.push({ name: key.replace(/_/g, " "), level: attrLvl, value: val });
          result.attributeTotal += val;
        }
      }
    }

    // 7. Structured Scrolls (Wither Impact)
    if (extras.abilityScrolls?.length) {
      result.scrolls = extras.abilityScrolls;
      result.scrollTotal = extras.abilityScrolls.length * WITHER_SCROLL_VALUE;
    }

    // 8. Structured Art of War & Wood Singularity
    if (extras.artOfWar) {
      result.artOfWar = extras.artOfWar;
      result.extrasTotal += extras.artOfWar * ART_OF_WAR_VALUE;
    }
    if (extras.woodSingularity) {
      result.woodSingularity = extras.woodSingularity;
      result.extrasTotal += extras.woodSingularity * WOOD_SINGULARITY_VALUE;
    }
  }

  // Fallback lore parsing if structured data wasn't fully supplied
  if (lore?.length && result.enchants.length === 0) {
    for (const rawLine of lore) {
      const line = stripColorCodes(rawLine);

      // Dungeon stars (✪ and ➊-➎ master stars)
      const starMatches = line.match(/✪/g);
      const masterStarMatches = line.match(/[➊➋➌➍➎]/g);
      if ((starMatches || masterStarMatches) && !line.includes("Upgrade")) {
        const starCount = starMatches ? starMatches.length : 0;
        const masterCount = masterStarMatches ? masterStarMatches.length : 0;
        result.stars = Math.max(result.stars, starCount);
        if (masterCount > 0) {
          result.masterStars = masterCount;
          let msVal = 0;
          for (let s = 6; s <= 5 + masterCount; s++) {
            msVal += MASTER_STAR_VALUES[s] ?? 50_000_000;
          }
          result.masterStarTotal = msVal;
        }
        continue;
      }

      // Hot Potato & Fuming Books
      if (/fuming hot potato book/i.test(line) && result.fumingBooks === 0) {
        result.fumingBooks += 1;
        continue;
      }
      if (/hot potato book/i.test(line) && result.hotPotatoBooks === 0) {
        result.hotPotatoBooks += 1;
        continue;
      }

      // Reforge detection from first line
      if (!result.reforge && line === stripColorCodes(lore[0]!) && lore[0]!.includes("§")) {
        const match = line.match(/^([A-Za-z' ]+?)\s+(.+)$/);
        if (match) {
          const possibleRef = match[1]!.toLowerCase().replace(/[\s-]/g, "_");
          const matchedRef = Object.keys(REFORGE_STONE_VALUES).find((k) => possibleRef.includes(k));
          if (matchedRef) {
            result.reforge = match[1]!;
            result.reforgeValue = REFORGE_STONE_VALUES[matchedRef]!;
            continue;
          }
        }
      }

      // Lore Enchantments: "Name RomanNumeral" or "Ultimate Name RomanNumeral"
      const enchantMatch = line.match(/^(?:Ultimate\s+)?([A-Za-z][A-Za-z _']+?)\s+([IVX]+)$/);
      if (enchantMatch) {
        const name = enchantMatch[1]!;
        const level = romanToNumber[enchantMatch[2]!] ?? 0;
        if (level > 0) {
          applyEnchant(name, level);
        }
      }
    }
  }

  result.bookTotal =
    result.hotPotatoBooks * HOT_POTATO_VALUE + result.fumingBooks * FUMING_POTATO_VALUE;

  if (result.base !== null) {
    if (result.starTotal === 0 && result.stars > 0) {
      result.starTotal = Math.round(result.base * 0.05 * result.stars);
    }
    result.total =
      result.base +
      result.enchantTotal +
      result.bookTotal +
      result.starTotal +
      result.masterStarTotal +
      result.reforgeValue +
      result.gemTotal +
      result.attributeTotal +
      result.scrollTotal +
      result.extrasTotal;
    result.confidence = "market";
  } else if (
    result.enchantTotal +
      result.bookTotal +
      result.masterStarTotal +
      result.gemTotal +
      result.attributeTotal >
    0
  ) {
    result.total = null; // upgrades detected but no base price to anchor to
    result.confidence = "estimated";
  }

  return result;
}
