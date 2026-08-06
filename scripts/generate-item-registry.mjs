import { readdir, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const normalizeKey = (value) => value.toLowerCase().trim().replace(/^minecraft:/, "").replace(/[\u2018\u2019\u201a\u201b]/g, "'").replace(/[â€™â€˜]/g, "'").replace(/['’]s\b/g, "").replace(/[^a-z0-9_ ]/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "").replace(/\s+/g, "_");

const baseStem = (key) => key
  .replace(/_model$/, "")
  .replace(/_overlay$/, "")
  .replace(/_dyed$/, "")
  .replace(/_fired$/, "")
  .replace(/_pulling(?:_\d+)?$/, "")
  .replace(/_(?:berserk|archer|mage|tank|healer|swordsman)$/, "");

const matchKeys = (stem) => {
  const normalized = normalizeKey(stem);
  const base = baseStem(normalized);
  const keys = new Set([normalized, base]);
  const words = base.split("_");
  if (words.length > 1 && words.at(-1)?.endsWith("s")) keys.add([...words.slice(0, -1), words.at(-1).slice(0, -1)].join("_"));
  if (words.length > 1 && !words.at(-1)?.endsWith("s")) keys.add([...words.slice(0, -1), `${words.at(-1)}s`].join("_"));
  if (words.length > 1 && !words[0].endsWith("s")) keys.add([`${words[0]}s`, ...words.slice(1)].join("_"));
  return [...keys].filter(Boolean);
};

const root = fileURLToPath(new URL("..", import.meta.url));
const buildRegistry = async (directory, prefix) => {
  const files = (await readdir(directory)).filter((file) => /\.(png|jpg|jpeg|webp)$/i.test(file) && !/_model\.(png|jpg|jpeg|webp)$/i.test(file));
  const entries = files.flatMap((file) => {
    const baseName = file.replace(/\.[^.]+$/, "");
    const path = `${prefix}/${file}`;
    return [[baseName.toLowerCase(), path], [normalizeKey(baseName), path]];
  });
  return Object.fromEntries(entries.sort(([a], [b]) => a.localeCompare(b)));
};

const buildMatches = (items) => {
  const matches = new Map();
  for (const path of Object.values(items)) {
    const stem = path.split("/").pop().replace(/\.[^.]+$/, "");
    for (const key of matchKeys(stem)) {
      const current = matches.get(key);
      const score = (candidate) => [candidate.includes("/items/") ? 0 : 1, candidate.includes(`${key}.`) ? 0 : 1, candidate.length, candidate];
      if (!current || score(path).join("|") < score(current).join("|")) matches.set(key, path);
    }
  }
  return Object.fromEntries([...matches.entries()].sort(([a], [b]) => a.localeCompare(b)));
};

const itemsDir = join(root, "public", "items");
const vanillaDir = join(root, "public", "vanilla");
const items = await buildRegistry(itemsDir, "/items");
const vanilla = await buildRegistry(vanillaDir, "/vanilla");
const matches = buildMatches(items);
await writeFile(join(root, "src", "lib", "items", "generated-items.json"), `${JSON.stringify(items, null, 2)}\n`, "utf8");
await writeFile(join(root, "src", "lib", "items", "generated-vanilla.json"), `${JSON.stringify(vanilla, null, 2)}\n`, "utf8");
await writeFile(join(root, "src", "lib", "items", "generated-item-matches.json"), `${JSON.stringify(matches, null, 2)}\n`, "utf8");
console.log(`Generated ${Object.keys(items).length} item, ${Object.keys(vanilla).length} vanilla, and ${Object.keys(matches).length} item match entries`);
