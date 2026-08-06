import { ITEM_ALIASES, REFORGE_PREFIX } from "./aliases";
import { getGeneratedItemMatch, getRegisteredItemTexture, getRegisteredVanillaTexture } from "./registry";
import type { ResolvedTexture, SkyBlockItem } from "./types";

const cache = new Map<string, ResolvedTexture>();
const skillKeys = new Set(["farming", "mining", "combat", "foraging", "fishing", "enchanting", "alchemy", "taming", "carpentry", "runecrafting", "social", "hunting"]);
const vanillaAliases: Record<string, string> = { redstone_dust: "redstone", ink_sack: "ink_sac", skull: "player_head" };

export function normalizeItemKey(value: string): string {
  return value.toLowerCase().trim().replace(/^minecraft:/, "").replace(/[’']s\b/g, "").replace(/[^a-z0-9_ ]/g, "").trim().replace(/\s+/g, "_");
}

function spellingKeys(key: string): string[] {
  return key.endsWith("s") ? [key, key.slice(0, -1)] : [key];
}

function fallbackKeys(key: string): string[] {
  return [key, key.replace(REFORGE_PREFIX, ""), key.replace(/^enchanted_/, ""), key.replace(/^(beginner|small|medium|large|large_tier|greater)_/, "")];
}

function baseTextureKeys(key: string): string[] {
  const bases = [
    key.replace(/_pulling(?:_\d+)?$/, ""),
    key.replace(/_fired$/, ""),
    key.replace(/_etherwarp(?:_(?:open|teleport|transmission))?$/, ""),
    key.replace(/_(?:berserk|archer|mage|tank|healer|swordsman)$/, ""),
  ];
  return [...new Set(bases)].filter((base) => base && base !== key);
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
    const result: ResolvedTexture = { ...(src ? { src } : {}), candidates: [...new Set(candidates)], source, attempted: [...attempted] };
    cache.set(cacheKey, result);
    return result;
  };

  if (item.texture) return finish(item.texture, "manual-override");
  if (!id && !name) return finish(undefined, "placeholder");
  if (skillKeys.has(id)) return finish(`/items/${id}_skill.png`, "exact-id");

  const generatedPaths = [...new Set([id, name, ...spellingKeys(id), ...spellingKeys(name)].filter(Boolean))].map(getGeneratedItemMatch).filter(Boolean) as string[];

  const mappedKeys = [ITEM_ALIASES[id], ITEM_ALIASES[name], ...spellingKeys(id).flatMap((key) => [ITEM_ALIASES[key]]), ...spellingKeys(name).flatMap((key) => [ITEM_ALIASES[key]])].filter(Boolean) as string[];
  const itemKeys = [...new Set([
    ...spellingKeys(id).flatMap((key) => [...baseTextureKeys(key), ...fallbackKeys(key)]),
    ...spellingKeys(name).flatMap((key) => [...baseTextureKeys(key), ...fallbackKeys(key)]),
    ...mappedKeys.flatMap((key) => [...baseTextureKeys(key), ...fallbackKeys(key)]),
  ])].filter(Boolean);
  const localPaths: Array<{ path: string; key: string }> = [];
  for (const key of itemKeys) {
    attempted.push(`local-items:${key}`);
    const path = getRegisteredItemTexture(key);
    if (path) localPaths.push({ path, key });
  }

  const vanillaKeys = [...new Set([...itemKeys, vanillaAliases[id], vanillaAliases[name]].filter(Boolean) as string[])];
  const vanillaPaths: string[] = [];
  for (const key of vanillaKeys) {
    attempted.push(`vanilla:${key}`);
    const path = getRegisteredVanillaTexture(key);
    if (path) vanillaPaths.push(path);
  }

  const orderedPaths = [...localPaths.map(({ path }) => path), ...generatedPaths, ...vanillaPaths];
  if (id) {
    const skyCrypt = `https://raw.githubusercontent.com/SkyCryptWebsite/SkyCryptWebsite/main/public/head/${id}`;
    attempted.push(`skycrypt:${id}`);
    orderedPaths.push(skyCrypt, `https://mc-heads.net/item/${id}`);
  }
  orderedPaths.push(getRegisteredVanillaTexture("barrier") ?? "/vanilla/barrier.png");
  candidates.push(...orderedPaths);
  const first = localPaths[0];
  return finish(first?.path ?? vanillaPaths[0] ?? orderedPaths[0], first ? (first.key === id ? "exact-id" : mappedKeys.includes(first.key) ? "alias" : "registry") : vanillaPaths.length ? "vanilla" : "skycrypt");
}

export function clearTextureCache() {
  cache.clear();
}
