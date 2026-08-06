import { ITEM_ALIASES, REFORGE_PREFIX } from "./aliases";
import { getRegisteredItemTexture, getRegisteredVanillaTexture } from "./registry";
import type { ResolvedTexture, SkyBlockItem } from "./types";

const cache = new Map<string, ResolvedTexture>();
const skillKeys = new Set(["farming", "mining", "combat", "foraging", "fishing", "enchanting", "alchemy", "taming", "carpentry", "runecrafting", "social", "hunting"]);
const vanillaAliases: Record<string, string> = { redstone: "redstone", "redstone dust": "redstone", ink_sack: "ink_sac", skull: "player_head" };

export function normalizeItemKey(value: string): string {
  return value.toLowerCase().trim().replace(/^minecraft:/, "").replace(/[^a-z0-9_ ]/g, "").trim().replace(/\s+/g, "_");
}

function fallbackKeys(key: string): string[] {
  return [key, key.replace(REFORGE_PREFIX, ""), key.replace(/^enchanted_/, ""), key.replace(/^(beginner|small|medium|large|large_tier|greater)_/, "")];
}

export function resolveItemTexture(item: SkyBlockItem): ResolvedTexture {
  const id = normalizeItemKey(item.id);
  const name = normalizeItemKey(item.name);
  const cacheKey = `${id}|${name}|${item.texture ?? ""}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const attempted: string[] = [];
  const candidates: string[] = [];
  const finish = (src: string | undefined, source: ResolvedTexture["source"]): ResolvedTexture => {
    const result: ResolvedTexture = { src, candidates: [...new Set(candidates)], source, attempted: [...attempted] };
    cache.set(cacheKey, result);
    return result;
  };

  if (item.texture) return finish(item.texture, "manual-override");
  if (!id && !name) return finish(undefined, "placeholder");
  if (skillKeys.has(id)) return finish(`/items/${id}_skill.png`, "exact-id");

  const aliasKeys = [ITEM_ALIASES[id], ITEM_ALIASES[name]].filter(Boolean) as string[];
  const itemKeys = [...new Set([...fallbackKeys(id), ...fallbackKeys(name), ...aliasKeys])].filter(Boolean);
  for (const key of itemKeys) {
    attempted.push(`local-items:${key}`);
    const path = getRegisteredItemTexture(key);
    if (path) {
      candidates.push(path);
      return finish(path, key === id ? "exact-id" : aliasKeys.includes(key) ? "alias" : "registry");
    }
  }

  const vanillaKeys = [...new Set([...itemKeys, vanillaAliases[id], vanillaAliases[name]].filter(Boolean) as string[])];
  for (const key of vanillaKeys) {
    attempted.push(`vanilla:${key}`);
    const path = getRegisteredVanillaTexture(key);
    if (path) {
      candidates.push(path);
      return finish(path, "vanilla");
    }
  }

  if (id) {
    const skyCrypt = `https://raw.githubusercontent.com/SkyCryptWebsite/SkyCryptWebsite/main/public/head/${id}`;
    attempted.push(`skycrypt:${id}`);
    candidates.push(skyCrypt);
    return finish(skyCrypt, "skycrypt");
  }
  return finish(getRegisteredVanillaTexture("barrier"), "placeholder");
}

export function clearTextureCache() {
  cache.clear();
}
