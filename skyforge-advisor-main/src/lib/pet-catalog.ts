import data from "./items/generated-pets.json";
import { titleCase } from "./skyblock";

export type PetCombatStats = Partial<
  Record<"DAMAGE" | "STRENGTH" | "CRIT_DAMAGE" | "HEALTH" | "DEFENSE", number>
>;

type PetEntry = {
  name?: string;
  variants: Record<string, PetCombatStats[] | null>;
};

type CustomLeveling = {
  max_level?: number;
  rarity_offset?: Record<string, number>;
  type?: number;
  pet_levels?: number[];
  xp_multiplier?: number;
};

const pets: Record<string, PetEntry> = data.pets;
const offsets: Record<string, number> = data.offsets;
const customLeveling: Record<string, CustomLeveling> = data.custom;

export const PET_CATALOG = Object.entries(pets)
  .map(([id, pet]) => ({
    id,
    name: pet.name ?? titleCase(id),
    rarities: Object.keys(pet.variants),
    maxLevel: customLeveling[id]?.max_level ?? 100,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

function levelCosts(id: string, rarity: string): number[] | null {
  if (!Object.hasOwn(pets[id]?.variants ?? {}, rarity)) return null;
  const custom = customLeveling[id];
  const offset = (custom?.rarity_offset ?? offsets)[rarity];
  const maxLevel = custom?.max_level ?? 100;
  if (offset === undefined) return null;
  let costs: number[] = data.xp;
  if (custom?.type === 1 && custom.pet_levels) costs = [...costs, ...custom.pet_levels];
  else if (custom?.type === 2 && custom.pet_levels) costs = custom.pet_levels;
  else if (custom?.type) return null;
  const slice = costs.slice(offset, offset + maxLevel - 1);
  return slice.length === maxLevel - 1 ? slice : null;
}

export function getPetLevel(id: string, rarity: string, xp: number | null) {
  const costs = levelCosts(id, rarity);
  if (!costs || xp === null || !Number.isFinite(xp) || xp < 0) return null;
  let level = 1;
  let remaining = xp;
  for (const cost of costs) {
    if (remaining < cost) break;
    remaining -= cost;
    level++;
  }
  return { level, maxLevel: costs.length + 1 };
}

export function getPetXpBetween(id: string, rarity: string, from: number, to: number) {
  const costs = levelCosts(id, rarity);
  if (
    !costs ||
    !Number.isInteger(from) ||
    !Number.isInteger(to) ||
    from < 1 ||
    to > costs.length + 1 ||
    to < from
  )
    return null;
  return costs.slice(from - 1, to - 1).reduce((total, cost) => total + cost, 0);
}

export function getPetCombatStats(
  id: string,
  rarity: string,
  level: number,
): PetCombatStats | null {
  const endpoints = pets[id]?.variants[rarity];
  const max = customLeveling[id]?.max_level ?? 100;
  if (!endpoints || !Number.isInteger(level) || level < 1 || level > max) return null;
  const min = max === 200 ? 101 : 1;
  if (level < min) return {}; // The dragon egg has no equipped pet stats.
  const [first, last] = endpoints;
  if (!first || !last) return null;
  const progress = (level - min) / (max - min);
  const result: PetCombatStats = {};
  for (const key of ["DAMAGE", "STRENGTH", "CRIT_DAMAGE", "HEALTH", "DEFENSE"] as const) {
    const from = first[key];
    const to = last[key];
    if (from !== undefined && to !== undefined) result[key] = from + (to - from) * progress;
  }
  return result;
}
