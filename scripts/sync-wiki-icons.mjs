import { mkdir, writeFile, access, readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const itemsDir = join(root, "public", "items");
const reportPath = join(root, ".output", "wiki-icon-missing.json");
const aliasesPath = join(root, ".output", "wiki-icon-aliases.json");
const wikiApi = "https://hypixelskyblock.minecraft.wiki/api.php";
const hypixelApi = "https://api.hypixel.net/v2/resources/skyblock/items";
const args = new Set(process.argv.slice(2));
const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.slice("--limit=".length)) : Infinity;
const concurrencyArg = process.argv.find((arg) => arg.startsWith("--concurrency="));
const concurrency = Math.max(1, Number(concurrencyArg?.slice("--concurrency=".length) ?? 6));
const dryRun = args.has("--dry-run");
const maxAttempts = 3;
const requestTimeoutMs = 15000;

const normalize = (value) =>
  value
    .toLowerCase()
    .replace(/^minecraft:/, "")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const wikiName = (value) =>
  value
    .split("_")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join("_");

async function request(url) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "Skyforge-Advisor/1.0" },
        signal: controller.signal,
      });
      if (response.ok) return response;
      if (response.status < 500 && response.status !== 429) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      lastError = new Error(`${response.status} ${response.statusText}`);
    } catch (error) {
      lastError = error;
    } finally {
      clearTimeout(timeout);
    }
    if (attempt < maxAttempts)
      await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** (attempt - 1)));
  }
  throw lastError;
}

async function getJson(url) {
  const response = await request(url);
  return response.json();
}

async function findWikiImage(item) {
  const keys = [...new Set([item.id, normalize(item.id), normalize(item.name), wikiName(normalize(item.name)), item.name])].filter(Boolean);
  const titles = keys.flatMap((key) => [
      `File:${key}.png`,
      `File:${wikiName(key)}.png`,
      `File:${key}.webp`,
      `File:${wikiName(key)}.webp`,
    ]);
  const query = new URLSearchParams({
      action: "query",
      titles: titles.join("|"),
      prop: "imageinfo",
      iiprop: "url",
      format: "json",
      formatversion: "2",
  });
  const data = await getJson(`${wikiApi}?${query}`);
  const page = data.query?.pages?.find((candidate) => candidate.imageinfo?.[0]?.url);
  if (page?.imageinfo?.[0]?.url) return { url: page.imageinfo[0].url, title: page.title };

  const pageQuery = new URLSearchParams({ action: "query", titles: item.name, prop: "pageimages|images", piprop: "original", pithumbsize: "64", imlimit: "20", format: "json", formatversion: "2" });
  const pageData = await getJson(`${wikiApi}?${pageQuery}`);
  const wikiPage = pageData.query?.pages?.[0];
  if (wikiPage?.original?.source) return { url: wikiPage.original.source, title: wikiPage.title };
  const file = wikiPage?.images?.find((candidate) => /\.(png|webp|jpg|jpeg)$/i.test(candidate.title ?? ""));
  if (file?.title) {
    const infoQuery = new URLSearchParams({ action: "query", titles: file.title, prop: "imageinfo", iiprop: "url", format: "json", formatversion: "2" });
    const info = await getJson(`${wikiApi}?${infoQuery}`);
    const url = info.query?.pages?.[0]?.imageinfo?.[0]?.url;
    if (url) return { url, title: file.title };
  }
  return null;
}

function aliasKeys(id, name) {
  const values = new Set([normalize(id), normalize(name)]);
  for (const value of [...values]) {
    values.add(value.replace(/_(?:generator|minion|upgrade_stone)_\d+$/, "_1"));
    values.add(value.replace(/_\d+$/, "_1"));
    values.add(value.replace(/_mk_[ivx]+$/, ""));
    values.add(value.replace(/_(?:i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii)$/, ""));
  }
  return [...values].filter(Boolean);
}

await mkdir(itemsDir, { recursive: true });
if (!dryRun) await mkdir(join(root, ".output"), { recursive: true });

const response = await getJson(hypixelApi);
const items = Array.isArray(response.items) ? response.items.slice(0, limit) : [];
const missing = [];
let downloaded = 0;
let skipped = 0;
let checked = 0;

async function syncItem(item) {
  const key = normalize(item.id);
  if (!key) return;
  const destination = join(itemsDir, `${key}.png`);
  try {
    await access(destination);
    skipped += 1;
    return;
  } catch {
    // The icon is absent, so continue to the wiki lookup.
  }

  try {
    const image = await findWikiImage(item);
    if (!image) {
      missing.push({ id: item.id, name: item.name, reason: "wiki-file-not-found" });
      return;
    }
    if (dryRun) {
      console.log(`${item.id} -> ${image.title}`);
      return;
    }
    const imageResponse = await request(image.url);
    const contentType = imageResponse.headers.get("content-type") ?? "";
    if (!imageResponse.ok || !contentType.startsWith("image/")) {
      missing.push({
        id: item.id,
        name: item.name,
        reason: "invalid-image-response",
        status: imageResponse.status,
      });
      return;
    }
    const bytes = Buffer.from(await imageResponse.arrayBuffer());
    await writeFile(destination, bytes);
    downloaded += 1;
    console.log(`Downloaded ${item.id} from ${image.title}`);
  } catch (error) {
    missing.push({ id: item.id, name: item.name, reason: "request-failed", error: error.message });
  }
}

let cursor = 0;
async function worker() {
  while (cursor < items.length) {
    const item = items[cursor++];
    await syncItem(item);
    checked += 1;
    if (checked % 25 === 0 || checked === items.length) {
      console.log(`${checked}/${items.length} checked`);
    }
  }
}

await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));

const localFiles = new Set((await readdir(itemsDir)).filter((file) => file.toLowerCase().endsWith(".png")).map((file) => file.toLowerCase()));
const aliases = {};
for (const item of missing) {
  const target = aliasKeys(item.id, item.name).map((key) => `${key}.png`).find((file) => localFiles.has(file));
  if (target) aliases[normalize(item.id)] = target;
}

if (!dryRun)
  await writeFile(
    reportPath,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), checked: items.length, downloaded, skipped, missing }, null, 2)}\n`,
    "utf8",
  );
if (!dryRun) await writeFile(aliasesPath, `${JSON.stringify(aliases, null, 2)}\n`, "utf8");
console.log(
  `${dryRun ? "Checked" : "Synced"} ${items.length} items: ${downloaded} downloaded, ${skipped} already present, ${missing.length} unresolved.`,
);
if (!dryRun) console.log(`Unresolved report: ${reportPath}`);
