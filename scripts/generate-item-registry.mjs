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
const itemsDir = join(root, "public", "items");
const files = (await readdir(itemsDir)).filter((file) => /\.(png|jpg|jpeg|webp)$/i.test(file));
const entries = files.flatMap((file) => {
  const baseName = file.replace(/\.[^.]+$/, "");
  const path = `/items/${file}`;
  return [
    [baseName.toLowerCase(), path],
    [normalizeKey(baseName), path],
  ];
});
const registry = Object.fromEntries(entries.sort(([a], [b]) => a.localeCompare(b)));
await writeFile(join(root, "src", "lib", "items", "generated-items.json"), `${JSON.stringify(registry, null, 2)}\n`, "utf8");
console.log(`Generated ${Object.keys(registry).length} item texture entries from ${relative(root, itemsDir)}`);
