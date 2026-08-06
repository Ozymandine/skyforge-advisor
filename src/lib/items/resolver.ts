import { ITEM_ALIASES, REFORGE_PREFIX } from "./aliases";
import { getRegisteredItemTexture } from "./registry";
import type { ResolvedTexture, SkyBlockItem } from "./types";

const cache = new Map<string, ResolvedTexture>();
const skillKeys = new Set(["farming", "mining", "combat", "foraging", "fishing", "enchanting", "alchemy", "taming", "carpentry", "runecrafting", "social", "hunting"]);

export function normalizeItemKey(value: string): string {
  return value.toLowerCase().trim().replace(/^minecraft:/, "").replace(REFORGE_PREFIX, "").replace(/^(beginner|small|medium|large|large_tier|greater)_/, "").replace(/^enchanted_/, "").replace(/[^a-z0-9_ ]/g, "").trim().replace(/\s+/g, "_");
}

export function resolveItemTexture(item: SkyBlockItem): ResolvedTexture {
  const id = normalizeItemKey(item.id);
  const name = normalizeItemKey(item.name);
  const key = `${id}|${name}|${item.texture ?? ""}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const attempted: string[] = [];
  const finish = (src: string | undefined, source: ResolvedTexture["source"]): ResolvedTexture => {
    const result: ResolvedTexture = src
      ? { src, source, attempted: [...attempted] }
      : { source, attempted: [...attempted] };
    cache.set(key, result);
    return result;
  };
  if (item.texture) return finish(item.texture, "manual-override");
  if (!id && !name) return finish(undefined, "placeholder");
  if (skillKeys.has(id)) return finish(`/items/${id}_skill.png`, "exact-id");

  const alias = ITEM_ALIASES[id] ?? ITEM_ALIASES[name];
  const candidates: Array<{ key: string; source: ResolvedTexture["source"] }> = [
    { key: id, source: "exact-id" },
    { key: alias ?? "", source: "alias" },
    { key: name, source: "normalized-filename" },
  ];
  for (const candidate of candidates) {
    if (!candidate.key) continue;
    const path = getRegisteredItemTexture(candidate.key);
    attempted.push(`registry:${candidate.key}`);
    if (path) return finish(path, candidate.source === "exact-id" ? "exact-id" : "registry");
  }

  const vanillaKeys = [alias, id, name, name.split("_").pop()].filter(Boolean) as string[];
  for (const vanillaKey of vanillaKeys) {
    const path = `/vanilla/${vanillaKey}.png`;
    attempted.push(`vanilla:${vanillaKey}`);
    return finish(path, "vanilla");
  }

  attempted.push(`skycrypt:${id}`);
  return finish(id ? `https://raw.githubusercontent.com/SkyCryptWebsite/SkyCryptWebsite/main/public/head/${id}` : undefined, id ? "skycrypt" : "placeholder");
}

export function clearTextureCache() {
  cache.clear();
}
