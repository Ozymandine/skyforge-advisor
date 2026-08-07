import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const itemsDir = join(root, "public", "items");
const output = join(root, ".output", "wiki-icon-bad-assets.json");
const files = (await readdir(itemsDir)).filter((file) => file.endsWith(".png"));
const bad = [];

for (const file of files) {
  const bytes = await readFile(join(itemsDir, file));
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  const reasons = [];
  if (!width || !height) reasons.push("unreadable-dimensions");
  if (width > 512 || height > 512) reasons.push("oversized");
  if (width > height * 1.5 || height > width * 32) reasons.push("wrong-aspect-ratio");
  const squareAtlas = width === height && width >= 64 && width % 16 === 0;
  const stripAtlas =
    (width > height && width % height === 0) || (height > width && height % width === 0);
  if (squareAtlas || stripAtlas) reasons.push("atlas-like");
  if (reasons.length) bad.push({ file, width, height, reasons });
}

await writeFile(
  output,
  `${JSON.stringify({ generatedAt: new Date().toISOString(), checked: files.length, bad }, null, 2)}\n`,
  "utf8",
);
console.log(`Checked ${files.length} item PNGs; flagged ${bad.length} assets.`);
console.log(`Bad asset report: ${output}`);
