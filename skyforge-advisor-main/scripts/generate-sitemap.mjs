// scripts/generate-sitemap.mjs
// Writes public/sitemap.xml with static pages + all wiki items, so search
// engines can index the encyclopedia. Re-run when the item dataset changes.
//
// Usage: node scripts/generate-sitemap.mjs [--base https://your-domain]

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const baseArg = process.argv.find((_, i, a) => a[i - 1] === "--base");
const BASE = (baseArg ?? "https://example.com").replace(/\/$/, "");

const staticPages = [
  "/",
  "/wiki",
  "/flips",
  "/bazaar",
  "/auction-house",
  "/crafting",
  "/about",
  "/connect",
];

const items = JSON.parse(
  await readFile(join(root, "src", "lib", "items", "generated-items-extra.json"), "utf8"),
);

const urls = [
  ...staticPages.map((path) => ({ loc: `${BASE}${path}`, priority: path === "/" ? "1.0" : "0.7" })),
  ...Object.keys(items).map((id) => ({
    loc: `${BASE}/wiki/${encodeURIComponent(id)}`,
    priority: "0.6",
  })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><priority>${u.priority}</priority></url>`).join("\n")}
</urlset>
`;

await writeFile(join(root, "public", "sitemap.xml"), xml);
console.log(`Wrote public/sitemap.xml with ${urls.length} URLs (base: ${BASE})`);
