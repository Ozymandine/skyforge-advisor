import { readdir, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const normalizeKey = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/^minecraft:/, "")
    .replace(/[^a-z0-9_ ]/g, "")
    .trim()
    .replace(/\s+/g, "_");

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

const itemsDir = join(root, "public", "items");
const vanillaDir = join(root, "public", "vanilla");
const items = await buildRegistry(itemsDir, "/items");
const vanilla = await buildRegistry(vanillaDir, "/vanilla");
await writeFile(join(root, "src", "lib", "items", "generated-items.json"), `${JSON.stringify(items, null, 2)}\n`, "utf8");
await writeFile(join(root, "src", "lib", "items", "generated-vanilla.json"), `${JSON.stringify(vanilla, null, 2)}\n`, "utf8");
console.log(`Generated ${Object.keys(items).length} item and ${Object.keys(vanilla).length} vanilla texture entries`);
