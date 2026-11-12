import { writeFile } from "node:fs/promises";

// Pin both NEU tables to the same revision so levels and stats update together.
const revision = process.argv[2] ?? "f315a139f067c1ac65272b70b294336b5327038e";
if (!/^[a-f0-9]{40}$/.test(revision)) throw new Error("Expected a full NEU repository commit SHA");
const source = `https://raw.githubusercontent.com/NotEnoughUpdates/NotEnoughUpdates-REPO/${revision}/`;

async function read(path) {
  const response = await fetch(source + path);
  if (!response.ok) throw new Error(`Cannot read ${path} (${response.status})`);
  return response.text();
}

const [levels, numbers, license] = await Promise.all([
  read("constants/pets.json").then(JSON.parse),
  read("constants/petnums.json").then(JSON.parse),
  read("LICENSE"),
]);

const { pet_levels: xp, pet_rarity_offset: offsets, custom_pet_leveling: custom } = levels;
const statKeys = ["DAMAGE", "STRENGTH", "CRIT_DAMAGE", "HEALTH", "DEFENSE"];
const combatStats = (stats) =>
  Object.fromEntries(
    statKeys.filter((key) => Number.isFinite(stats[key])).map((key) => [key, stats[key]]),
  );

const pets = Object.fromEntries(
  Object.entries(numbers).map(([id, rarities]) => {
    const variants = Object.fromEntries(
      Object.entries(rarities).map(([rarity, data]) => {
        const maxLevel = custom[id]?.max_level ?? 100;
        const points = Object.entries(data).filter(([key]) => /^\d+$/.test(key));
        const expected = data.stats_levelling_curve === "101:200:1" ? 200 : 100;
        // Future curve shapes remain selectable. Their numerical stats need validation first.
        const supported =
          (!data.stats_levelling_curve || data.stats_levelling_curve === "101:200:1") &&
          maxLevel === expected &&
          points.length === 2 &&
          data["1"]?.statNums &&
          data["100"]?.statNums;
        return [
          rarity,
          supported ? [combatStats(data["1"].statNums), combatStats(data["100"].statNums)] : null,
        ];
      }),
    );
    const name = levels.id_to_display_name?.[id];
    return [id, { ...(name ? { name } : {}), variants }];
  }),
);

if (!Array.isArray(xp) || xp.length < 99 || Object.keys(pets).length < 50) {
  throw new Error("Unexpected NEU pet data");
}
const out = new URL("../src/lib/items/", import.meta.url);
await Promise.all([
  writeFile(
    new URL("generated-pets.json", out),
    JSON.stringify({ revision, xp, offsets, custom, pets }) + "\n",
  ),
  writeFile(new URL("LICENSE.NEU-PET-DATA", out), license),
]);
console.log(`Generated ${Object.keys(pets).length} pet types from ${revision}`);
