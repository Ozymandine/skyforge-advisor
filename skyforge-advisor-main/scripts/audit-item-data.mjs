// scripts/audit-item-data.mjs
// Reports data coverage of generated-items-extra.json: how many items have
// lore / stats / abilities / requirements, and which well-known items are
// missing structured data (parser gaps).
//
// Usage: node scripts/audit-item-data.mjs

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const extras = JSON.parse(
  await readFile(join(root, "src", "lib", "items", "generated-items-extra.json"), "utf8"),
);

const ids = Object.keys(extras);
const total = ids.length;

const withLore = ids.filter((id) => extras[id].lore?.length).length;
const withStats = ids.filter((id) => Object.keys(extras[id].stats ?? {}).length).length;
const withAbilities = ids.filter((id) => extras[id].abilities?.length).length;
const withRequirements = ids.filter((id) => extras[id].requirements?.length).length;

console.log(`Total items: ${total}`);
console.log(`  lore:         ${withLore} (${pct(withLore)})`);
console.log(`  stats:        ${withStats} (${pct(withStats)})`);
console.log(`  abilities:    ${withAbilities} (${pct(withAbilities)})`);
console.log(`  requirements: ${withRequirements} (${pct(withRequirements)})`);

// Suspected gaps: lore mentions stats/abilities that didn't parse.
const statLine =
  /^(Damage|Strength|Intelligence|Health|Defense|Crit Chance|Crit Damage|Attack Speed|Ferocity|Speed|Magic Find|Sea Creature Chance|Mining Speed|Fishing Speed|Pristine|Breaking Power):/i;
const abilityLine = /^(Ability|Full Set Bonus|Item Ability):/i;

const statGaps = [];
const abilityGaps = [];

for (const id of ids) {
  const extra = extras[id];
  // Skip templated lines (pet/dynamic stats like "{SEA_CREATURE_CHANCE}").
  const lore = (extra.lore ?? []).filter((l) => !l.includes("{"));
  const hasStatLine = lore.some((l) => statLine.test(l.replace(/§./g, "").trim()));
  const hasAbilityLine = lore.some((l) => abilityLine.test(l.replace(/§./g, "").trim()));

  if (hasStatLine && !Object.keys(extra.stats ?? {}).length) statGaps.push(id);
  if (hasAbilityLine && !extra.abilities?.length) abilityGaps.push(id);
}

console.log(`\nLore contains stat lines but no parsed stats: ${statGaps.length}`);
console.log(statGaps.slice(0, 15).join(", "));
console.log(`\nLore contains ability lines but no parsed abilities: ${abilityGaps.length}`);
console.log(abilityGaps.slice(0, 15).join(", "));

// Spot-check well-known items.
const spot = [
  "ASPECT_OF_THE_END",
  "ASPECT_OF_THE_VOID",
  "HYPERION",
  "NECRON_CHESTPLATE",
  "PET_ENDERMAN",
  "ENCHANTMENT_SHARPNESS_1",
  "RECOMBOBULATOR_3000",
];
console.log("\nSpot checks:");
for (const id of spot) {
  const extra = extras[id];
  if (!extra) {
    console.log(`  ${id}: MISSING`);
    continue;
  }
  console.log(
    `  ${id}: stats=${Object.keys(extra.stats ?? {}).length} abilities=${extra.abilities?.length ?? 0} reqs=${extra.requirements?.length ?? 0} lore=${extra.lore?.length ?? 0}`,
  );
}

function pct(n) {
  return `${Math.round((n / total) * 100)}%`;
}
