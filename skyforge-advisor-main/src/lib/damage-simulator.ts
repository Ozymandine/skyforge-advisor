import type { InventoryItem, LiveItem } from "./skyblock";
import type { PetCombatStats } from "./pet-catalog";

export type CombatStats = Partial<
  Record<"DAMAGE" | "STRENGTH" | "CRIT_DAMAGE" | "HEALTH" | "DEFENSE", number>
>;

const combatKeys = ["DAMAGE", "STRENGTH", "CRIT_DAMAGE", "HEALTH", "DEFENSE"] as const;

export type SimulatorWeapon = {
  id: string;
  name: string;
  category: string;
  stats: CombatStats;
  melee: boolean;
};

export function buildWeaponCatalog(items: LiveItem[]): SimulatorWeapon[] {
  const weapons = new Map<string, SimulatorWeapon>();
  for (const item of items) {
    const melee =
      item.category === "Sword" ||
      item.category === "Longsword" ||
      (item.category === "Axe" && Number.isFinite(item.stats?.["DAMAGE"]));
    if (!melee && item.category !== "Bow" && item.category !== "Wand") continue;

    const stats: CombatStats = {};
    for (const key of combatKeys) {
      const value =
        item.stats?.[key] ?? (key === "CRIT_DAMAGE" ? item.stats?.["CRITICAL_DAMAGE"] : undefined);
      if (typeof value === "number" && Number.isFinite(value)) stats[key] = value;
    }
    weapons.set(item.id, {
      id: item.id,
      name: item.name,
      category: item.category,
      stats,
      melee,
    });
  }
  return [...weapons.values()].sort((a, b) => a.name.localeCompare(b.name));
}

const loreKeys = {
  damage: "DAMAGE",
  strength: "STRENGTH",
  "crit damage": "CRIT_DAMAGE",
  health: "HEALTH",
  defense: "DEFENSE",
} as const;

export function readDisplayedCombatStats(item: Pick<InventoryItem, "lore">): CombatStats | null {
  const stats: CombatStats = {};
  for (const text of item.lore) {
    const line = text
      .replace(/§./g, "")
      .replace(/[\uE000-\uF8FF]/g, "")
      .trim();
    // The leading number is the displayed overworld total. Parentheses list
    // included sources or the in-dungeon value, so adding them double counts.
    if (!line) {
      if (Object.keys(stats).length) break;
      continue;
    }
    const match =
      /^(Damage|Strength|Crit Damage|Health|Defense):\s*([+−-]?\d[\d,]*(?:\.\d+)?)(?:%|\s|$)/i.exec(
        line,
      );
    if (!match) continue;
    const key = loreKeys[match[1]!.toLowerCase() as keyof typeof loreKeys];
    const value = Number(match[2]!.replace(/,/g, "").replace("−", "-"));
    if (!Number.isFinite(value) || stats[key] !== undefined) return null;
    stats[key] = value;
  }
  return Object.keys(stats).length ? stats : null;
}

export function isOwnedMeleeWeapon(
  item: InventoryItem,
  catalog?: ReadonlyMap<string, SimulatorWeapon>,
): boolean {
  const weapon = catalog?.get(item.id);
  if (weapon) return weapon.melee;
  return item.lore.some((line) =>
    /^(?:DUNGEON |RIFT )?(?:COMMON|UNCOMMON|RARE|EPIC|LEGENDARY|MYTHIC|DIVINE|SPECIAL|VERY SPECIAL|SUPREME) (?:DUNGEON )?(?:SWORD|LONGSWORD|AXE)$/.test(
      line
        .replace(/§./g, "")
        .replace(/[\uE000-\uF8FF]/g, "")
        .trim(),
    ),
  );
}

export type MobTarget = { id: string; name: string; health: number; defense?: number };

// Explicit variants from the community SkyBlock mob index. A missing
// Defense stat stays unknown. Health alone cannot establish hits to kill.
export const MOB_TARGETS: MobTarget[] = [
  { id: "graveyard_zombie", name: "Graveyard Zombie · Lv 1", health: 100 },
  { id: "crypt_ghoul", name: "Crypt Ghoul · Lv 33", health: 2_000 },
  { id: "golden_ghoul", name: "Golden Ghoul · Lv 65", health: 20_000 },
  { id: "seer", name: "Seer · Lv 55", health: 9_500 },
  { id: "zealot", name: "Zealot · Lv 73", health: 13_000 },
  { id: "special_zealot", name: "Special Zealot · Lv 73", health: 13_000 },
  { id: "zealot_bruiser", name: "Zealot Bruiser · Lv 115", health: 65_000 },
  { id: "voidling_fanatic", name: "Voidling Fanatic · Lv 183", health: 750_000 },
  { id: "voidling_extremist", name: "Voidling Extremist · Lv 305", health: 8_000_000 },
  { id: "goblin", name: "Goblin · Lv 23", health: 800 },
  { id: "knifethrower", name: "Knifethrower · Lv 23", health: 800 },
  { id: "glacite_walker", name: "Glacite Walker · Lv 24", health: 888, defense: 1_000 },
  { id: "treasure_hoarder", name: "Treasure Hoarder · Lv 61", health: 15_000 },
  { id: "ghost", name: "Ghost · Lv 157", health: 1_000_000 },
];

export type SimulatorLoadout = {
  combatLevel: number;
  weapon: CombatStats | null;
  pet: PetCombatStats | null;
  gear: CombatStats[];
  additional: CombatStats;
  targetDefense: number | null;
};

export function calculateSimulation({
  combatLevel,
  weapon,
  pet,
  gear,
  additional,
  targetDefense,
}: SimulatorLoadout) {
  const sources = [weapon, pet, ...gear, additional];
  const stat = (key: keyof CombatStats) =>
    sources.reduce((total, source) => total + (source?.[key] ?? 0), 0);
  const strength = stat("STRENGTH");
  const critDamage = 50 + stat("CRIT_DAMAGE");
  const health = 100 + stat("HEALTH");
  const defense = stat("DEFENSE");
  const effectiveHealth =
    pet !== null &&
    Number.isFinite(health) &&
    health > 0 &&
    Number.isFinite(defense) &&
    defense >= 0
      ? Math.floor(health * (1 + defense / 100))
      : null;

  // Warrior gives 4% per level through 50, then 1% per level through 60.
  const validCombat = Number.isInteger(combatLevel) && combatLevel >= 0 && combatLevel <= 60;
  const warriorBonus = Math.min(combatLevel, 50) * 0.04 + Math.max(0, combatLevel - 50) * 0.01;
  const raw =
    weapon?.DAMAGE !== undefined &&
    Number.isFinite(weapon.DAMAGE) &&
    weapon.DAMAGE >= 0 &&
    pet !== null &&
    validCombat &&
    strength >= -100 &&
    critDamage >= -100
      ? Math.max(0, (5 + stat("DAMAGE")) * (1 + strength / 100) * (1 + warriorBonus))
      : null;
  const damageFactor =
    targetDefense !== null && Number.isFinite(targetDefense) && targetDefense >= 0
      ? 100 / (100 + targetDefense)
      : null;
  const normalHit = raw === null ? null : Math.floor(raw);
  const critHit = raw === null ? null : Math.floor(raw * (1 + critDamage / 100));
  const afterDefense =
    raw === null || damageFactor === null
      ? null
      : {
          normal: Math.floor(raw * damageFactor),
          critical: Math.floor(raw * (1 + critDamage / 100) * damageFactor),
        };
  return {
    normalHit,
    critHit,
    afterDefense,
    effectiveHealth,
    strength,
    critDamage,
    health,
    defense,
  };
}
