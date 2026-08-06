import { readdir, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const itemsDir = join(root, "public", "items");
const files = (await readdir(itemsDir)).filter((file) => /\.(png|jpg|jpeg|webp)$/i.test(file));
const registry = Object.fromEntries(files.map((file) => [file.replace(/\.[^.]+$/, "").toLowerCase(), `/items/${file}`]).sort(([a], [b]) => a.localeCompare(b)));
await writeFile(join(root, "src", "lib", "items", "generated-items.json"), `${JSON.stringify(registry, null, 2)}\n`, "utf8");
console.log(`Generated ${Object.keys(registry).length} item texture entries from ${relative(root, itemsDir)}`);

