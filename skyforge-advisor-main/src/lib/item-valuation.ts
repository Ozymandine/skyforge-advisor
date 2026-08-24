// src/lib/item-valuation.ts
// Estimates the coin value of an upgraded item from its lore:
// base price (lowest BIN / bazaar) + enchantments + hot potato books +
// dungeon stars. Values are rough market estimates, clearly labeled as such.

export type EnchantEstimate = {
  name: string;
  level: number;
  value: number;
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
  reforge: string | null;
  total: number | null;
  /**
   * "market" when the total is anchored to a live base price;
   * "estimated" when only the upgrade components are heuristic-priced.
   */
  confidence: "market" | "estimated";
};

/** Approximate coins per enchant level for common enchantments. */
const ENCHANT_PER_LEVEL: Record<string, number> = {
  sharpness: 150_000,
  power: 120_000,
  protection: 180_000,
  growth: 120_000,
  efficiency: 80_000,
  fortune: 300_000,
  looting: 60_000,
  scavenger: 90_000,
  execute: 70_000,
  critical: 90_000,
  first_strike: 80_000,
  giant_killer: 90_000,
  cubism: 80_000,
  impaling: 100_000,
  thunderlord: 40_000,
  thunderbolt: 60_000,
  life_steal: 70_000,
  vampirism: 60_000,
  ferocious_mana: 100_000,
  sugar_rush: 40_000,
  true_protection: 150_000,
  angler: 50_000,
  caster: 60_000,
  frail: 40_000,
  rainbow: 200_000,
  big_brain: 120_000,
  bank: 150_000,
  last_stand: 100_000,
  legion: 150_000,
  overflux: 200_000,
  wisdom: 80_000,
  compact: 100_000,
  cultivating: 60_000,
  replenish: 150_000,
  turbo_crops: 50_000,
  dellicate: 40_000,
  delicate: 40_000,
  eco_friendly: 40_000,
  harvesting: 60_000,
  telekinesis: 20_000,
};

/** Fixed-value ultimate/special enchantments (name → total value). */
const ULTIMATE_VALUES: Record<string, number> = {
  chimera: 25_000_000,
  one_for_all: 8_000_000,
  soul_eater: 12_000_000,
  fatal_tempo: 10_000_000,
  inferno: 6_000_000,
  swarm: 4_000_000,
  wise: 3_000_000,
  jerry: 1_000_000,
  combo: 2_500_000,
  cloaked: 1_500_000,
  flash: 800_000,
  reroll: 600_000,
  ultimate_first_strike: 900_000,
};

const HOT_POTATO_VALUE = 350_000;
const FUMING_POTATO_VALUE = 1_000_000;

function stripColorCodes(line: string) {
  return line.replace(/§./g, "").trim();
}

/**
 * Estimate an item's value from its lore.
 * @param basePrice lowest BIN or bazaar price for the clean item (null if unknown)
 */
export function estimateItemValue(
  lore: string[] | undefined,
  basePrice: number | null,
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
    reforge: null,
    total: basePrice,
    confidence: basePrice !== null ? "market" : "estimated",
  };

  if (!lore?.length) return result;

  const romanToNumber: Record<string, number> = {
    I: 1,
    II: 2,
    III: 3,
    IV: 4,
    V: 5,
    VI: 6,
    VII: 7,
    VIII: 8,
    IX: 9,
    X: 10,
  };

  for (const rawLine of lore) {
    const line = stripColorCodes(rawLine);

    // Dungeon stars (✪ symbols).
    const starMatches = line.match(/✪/g);
    if (starMatches && !line.includes("Upgrade")) {
      result.stars += starMatches.length;
      continue;
    }

    // Hot potato books.
    if (/fuming hot potato book/i.test(line)) {
      result.fumingBooks += 1;
      continue;
    }
    if (/hot potato book/i.test(line)) {
      result.hotPotatoBooks += 1;
      continue;
    }

    // Reforge: first line often reads like "Heroic Aspect of the End".
    if (!result.reforge && line === stripColorCodes(lore[0]!) && lore[0]!.includes("§")) {
      const knownReforge =
        /^(heroic|spicy|sharp|legendary|fabled|suspicious|gilded|dirty|withered|aote|optical|clean|heavy|light|mythic|giant|odd|smart|epic|precise|deadly|fine|grand|hasty|rapid|unreal|very wise|wise|quick|strong|superior|ridiculous|obviously|gentle|awkward|rich|strange|dull|fair|fast|epic)\b/i;
      const match = line.match(/^([A-Za-z' ]+?)\s+(.+)$/);
      if (match && knownReforge.test(match[1]!)) {
        result.reforge = match[1] ?? null;
        continue;
      }
    }

    // Enchantments: "Name RomanNumeral" or "Ultimate Name RomanNumeral".
    const enchantMatch = line.match(/^(?:Ultimate\s+)?([A-Za-z][A-Za-z _']+?)\s+([IVX]+)$/);
    if (enchantMatch) {
      const name = enchantMatch[1]!.toLowerCase().replace(/\s+/g, "_");
      const isUltimate = /ultimate/i.test(rawLine);
      const level = romanToNumber[enchantMatch[2]!] ?? 0;
      if (level <= 0) continue;

      if (isUltimate || ULTIMATE_VALUES[name]) {
        const key = Object.keys(ULTIMATE_VALUES).find((k) => name.includes(k));
        if (key) {
          result.enchants.push({
            name: `Ultimate ${key.replace(/_/g, " ")}`,
            level,
            value: ULTIMATE_VALUES[key]!,
          });
          result.enchantTotal += ULTIMATE_VALUES[key]!;
          continue;
        }
      }
      const perLevelKey = Object.keys(ENCHANT_PER_LEVEL).find((k) => name.includes(k));
      if (perLevelKey) {
        const value = ENCHANT_PER_LEVEL[perLevelKey]! * level;
        result.enchants.push({ name: perLevelKey.replace(/_/g, " "), level, value });
        result.enchantTotal += value;
      }
    }
  }

  result.bookTotal =
    result.hotPotatoBooks * HOT_POTATO_VALUE + result.fumingBooks * FUMING_POTATO_VALUE;
  result.starTotal = result.base !== null ? Math.round(result.base * 0.05 * result.stars) : 0;

  if (result.base !== null) {
    result.total = result.base + result.enchantTotal + result.bookTotal + result.starTotal;
    result.confidence = "market";
  } else if (result.enchantTotal + result.bookTotal > 0) {
    result.total = null; // upgrades detected but no base price to anchor to
    result.confidence = "estimated";
  }

  return result;
}
