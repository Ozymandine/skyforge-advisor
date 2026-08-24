// scripts/generate-recipes.mjs
// Builds src/lib/items/generated-recipes.json and generated-items-extra.json
// from the NotEnoughUpdates repo. The Hypixel /resources/skyblock/items
// endpoint no longer includes recipes, so we source them from NEU's per-item
// JSON files (grid slots A1..I9 with "INTERNAL_ID:count" entries), aggregated
// into ingredient lists. Extras include the raw crafting grid, canonical wiki
// URL and craft text for the in-app item encyclopedia.
//
// Usage: bun scripts/generate-recipes.mjs

import { execFileSync } from "node:child_process";
import { readdir, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const outPath = join(root, "src", "lib", "items", "generated-recipes.json");
const outExtraPath = join(root, "src", "lib", "items", "generated-items-extra.json");
const tmp = join(root, ".neu-tmp");

const REPO = "https://github.com/NotEnoughUpdates/NotEnoughUpdates-REPO.git";

console.log("Cloning NEU repo (sparse, items only)…");
await rm(tmp, { recursive: true, force: true });
execFileSync("git", ["clone", "--depth", "1", "--filter=blob:none", "--sparse", REPO, tmp], {
  stdio: "inherit",
});
execFileSync("git", ["-C", tmp, "sparse-checkout", "set", "items"], { stdio: "inherit" });

const dir = join(tmp, "items");
const files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
console.log(`Parsing ${files.length} item files…`);

const STAT_NAME_RE =
  /^(Damage|Strength|Intelligence|Health|Defense|True Defense|Crit Chance|Crit Damage|Attack Speed|Ferocity|Ability Damage|Speed|Magic Find|Pet Luck|Sea Creature Chance|Fishing Speed|Mining Speed|Mining Fortune|Farming Fortune|Foraging Fortune|Pristine|Bonus Pest Chance|Breaking Power|Swing Range|Health Regen|Vitality|Mending|Heat Resistance|Cold Resistance|Rift Time|Rift Damage|Hearts|Gear Score)$/i;

// Parse tooltip lore into structured stats + abilities (NEU stores these as
// plain text lines rather than structured fields for most items).
function parseLore(lines) {
  const stats = {};
  const abilities = [];
  let current = null;

  for (const raw of lines) {
    if (typeof raw !== "string") continue;
    const line = raw
      .replace(/§./g, "")
      .replace(/[\uDC00-\uDFFF\uE000-\uF8FF]/g, "")
      .trim();

    const statMatch = line.match(/^([^:]+?):\s*§?.*?([+-]?[\d,.]+)\s*%?(?:\s*\([^)]*\))?$/);
    if (statMatch && STAT_NAME_RE.test(statMatch[1].trim())) {
      const value = Number(statMatch[2].replace(/,/g, ""));
      if (Number.isFinite(value)) {
        const key = statMatch[1]
          .trim()
          .toUpperCase()
          .replace(/[^A-Z]/g, "_");
        stats[key] = value;
      }
      continue;
    }

    const abilityMatch = line.match(/^(?:Ability|Full Set Bonus|Item Ability):\s*(.*)$/);
    if (abilityMatch) {
      if (current) abilities.push(current);
      const name = abilityMatch[1]
        .replace(/\s+/g, " ")
        .replace(/\s*(RIGHT CLICK|LEFT CLICK)\s*$/i, "")
        .trim();
      current = { name: name || "Ability", desc: "" };
      continue;
    }

    if (current) {
      const mana = line.match(/^Mana Cost:\s*([\d,]+)\s*$/i);
      const cd = line.match(/^Cooldown:\s*([\d.]+)\s*s\s*$/i);
      if (mana) {
        current.manaCost = Number(mana[1].replace(/,/g, ""));
      } else if (cd) {
        current.cooldown = Number(cd[1]);
      } else if (
        /^This item can be reforged/i.test(line) ||
        /^(COMMON|UNCOMMON|RARE|EPIC|LEGENDARY|MYTHIC|DIVINE|SPECIAL|VERY SPECIAL)\b/i.test(line) ||
        /^Rarity:/i.test(line) ||
        /^Gemstones:/i.test(line) ||
        /^Requires:/i.test(line)
      ) {
        // Metadata after the ability text — stop collecting description.
        abilities.push(current);
        current = null;
      } else if (line) {
        current.desc = current.desc ? `${current.desc} ${line}`.trim() : line;
      }
    }
  }
  if (current) abilities.push(current);

  return { stats, abilities: abilities.filter((a) => a.name || a.desc) };
}

const recipes = {};
const extras = {};
let count = 0;
for (const file of files) {
  let data;
  try {
    data = JSON.parse(await readFile(join(dir, file), "utf8"));
  } catch {
    continue;
  }

  const id = data.internalname ?? file.replace(/\.json$/, "");

  // Extra per-item data: raw crafting grid + canonical wiki URL + rich item
  // data (lore, stats, requirements, abilities) that the Hypixel items API
  // no longer provides.
  const info = Array.isArray(data.info)
    ? data.info.find((u) => typeof u === "string" && u.includes("minecraft.wiki"))
    : undefined;

  const extra = {};

  const grid = data.recipe;
  if (grid && typeof grid === "object") extra.grid = grid;

  if (info) extra.wikiUrl = info;

  if (typeof data.crafttext === "string" && data.crafttext) {
    extra.craftText = data.crafttext.replace(/§./g, "");
  }
  if (typeof data.displayname === "string" && data.displayname) {
    extra.displayName = data.displayname.replace(/§./g, "");
  }

  if (Array.isArray(data.lore) && data.lore.length > 0) {
    extra.lore = data.lore.filter((l) => typeof l === "string");

    const parsed = parseLore(extra.lore);
    if (Object.keys(parsed.stats).length > 0 && !extra.stats) {
      extra.stats = parsed.stats;
    }
    if (parsed.abilities.length > 0 && !extra.abilities) {
      extra.abilities = parsed.abilities.map((a) => ({
        name: a.name,
        desc: a.desc,
        ...(a.manaCost != null ? { manaCost: a.manaCost } : {}),
        ...(a.cooldown != null ? { cooldown: a.cooldown } : {}),
      }));
    }
  }

  if (data.stats && typeof data.stats === "object") {
    const stats = {};
    for (const [key, value] of Object.entries(data.stats)) {
      const num =
        typeof value === "number"
          ? value
          : typeof value === "string"
            ? Number(value.replace(/[^0-9.\-]/g, ""))
            : NaN;
      if (key && Number.isFinite(num)) stats[key] = num;
    }
    if (Object.keys(stats).length > 0) extra.stats = stats;
  }

  const requirements = [];
  if (typeof data.skill_req === "string" && data.skill_req) {
    const m = data.skill_req.match(/^([A-Za-z_ ]+?)(?:\s+(\d+))?$/);
    requirements.push({
      type: m ? m[1].trim().replace(/_/g, " ") : data.skill_req,
      ...(m && m[2] ? { level: Number(m[2]) } : {}),
    });
  }
  for (const key of [
    "slayer_req",
    "dungeon_req",
    "catacombs_req",
    "hotm_req",
    "faction_req",
    "essence_req",
  ]) {
    const value = data[key];
    if (typeof value === "string" && value) {
      const m = value.match(/^(.*?)(?:\s+(\d+))?$/);
      requirements.push({
        type: (m ? m[1] : value).trim().replace(/_/g, " "),
        ...(m && m[2] ? { level: Number(m[2]) } : {}),
      });
    }
  }
  if (requirements.length > 0) extra.requirements = requirements;

  // Lore-based requirements: "§4❣ §cRequires The Catacombs Floor VII Completion."
  const loreRequirements = [];
  for (const raw of extra.lore ?? []) {
    const line = raw
      .replace(/§./g, "")
      .replace(/[\uDC00-\uDFFF\uE000-\uF8FF]/g, "")
      .trim();
    const req = line.match(/Requires\s+(.+?)(?:\s+Completion\.?)?$/i);
    if (req && req[1] && !/^This item can be reforged/i.test(line)) {
      loreRequirements.push({ type: req[1].trim() });
    }
  }
  if (loreRequirements.length > 0) {
    extra.requirements = extra.requirements
      ? [...extra.requirements, ...loreRequirements]
      : loreRequirements;
  }

  const abilities = [];
  for (const ability of [data.ability, data.ability_2, data.ability_3].filter(Boolean)) {
    if (typeof ability !== "object") continue;
    const name = typeof ability.name === "string" ? ability.name.replace(/§./g, "").trim() : "";
    const desc = typeof ability.desc === "string" ? ability.desc.replace(/§./g, "").trim() : "";
    if (!name && !desc) continue;
    abilities.push({
      name,
      desc,
      ...(typeof ability.manaCost === "number" ? { manaCost: ability.manaCost } : {}),
      ...(typeof ability.cooldown === "number" ? { cooldown: ability.cooldown } : {}),
    });
  }
  if (abilities.length > 0) extra.abilities = abilities;

  if (Object.keys(extra).length > 0) extras[id] = extra;

  // Recipes: aggregate grid slots into merged ingredient totals.
  if (!grid || typeof grid !== "object") continue;
  const totals = new Map();
  for (const value of Object.values(grid)) {
    if (typeof value !== "string" || !value) continue;
    const [ingId, amountRaw] = value.split(":");
    if (!ingId) continue;
    const amount = Number(amountRaw ?? 1) || 1;
    totals.set(ingId, (totals.get(ingId) ?? 0) + amount);
  }
  if (totals.size === 0) continue;

  recipes[id] = [...totals.entries()]
    .map(([ingId, amount]) => ({ id: ingId, amount }))
    .sort((a, b) => a.id.localeCompare(b.id));
  count++;
}

await rm(tmp, { recursive: true, force: true });
await mkdir(join(root, "src", "lib", "items"), { recursive: true });
await writeFile(outPath, JSON.stringify(recipes));
await writeFile(outExtraPath, JSON.stringify(extras));
console.log(`Wrote ${count} recipes to ${outPath} (+extras)`);
