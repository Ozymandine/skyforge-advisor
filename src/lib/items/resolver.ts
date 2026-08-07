import { ITEM_ALIASES, REFORGE_PREFIX } from "./aliases";
import {
  getGeneratedItemMatch,
  getRegisteredItemTexture,
  getRegisteredVanillaTexture,
} from "./registry";
import type { ResolvedTexture, SkyBlockItem } from "./types";

const cache = new Map<string, ResolvedTexture>();
const skillIcons: Record<string, string> = {
  farming: "/vanilla/wheat.png",
  mining: "/vanilla/diamond_pickaxe.png",
  combat: "/vanilla/diamond_sword.png",
  foraging: "/vanilla/oak_log.png",
  fishing: "/vanilla/fishing_rod.png",
  enchanting: "/vanilla/enchanting_table.png",
  alchemy: "/vanilla/brewing_stand.png",
  taming: "/vanilla/bone.png",
  carpentry: "/vanilla/crafting_table.png",
  runecrafting: "/vanilla/book.png",
  social: "/vanilla/player_head.png",
  hunting: "/vanilla/bow.png",
};
const vanillaAliases: Record<string, string> = {
  redstone_dust: "redstone",
  ink_sack: "ink_sac",
  skull: "player_head",
};

export function normalizeItemKey(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/^minecraft:/, "")
    .replace(/[:/.-]+/g, "_")
    .replace(/[’']s\b/g, "")
    .replace(/[^a-z0-9_ ]/g, "")
    .trim()
    .replace(/\s+/g, "_");
}

function spellingKeys(key: string): string[] {
  return key.endsWith("s") ? [key, key.slice(0, -1)] : [key];
}

function fallbackKeys(key: string): string[] {
  return [
    key,
    key.replace(REFORGE_PREFIX, ""),
    key.replace(/^enchanted_/, ""),
    key.replace(/^(beginner|small|medium|large|large_tier|greater)_/, ""),
  ];
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

function familyFallbackTextures(id: string): string[] {
  if (id.startsWith("enchantment_")) {
    const key = id.startsWith("enchantment_ultimate_")
      ? "enchanted_book_ultimate"
      : "enchanted_book";
    const book = getRegisteredItemTexture(key);
    return book ? [book] : [];
  }

  // The Bazaar can list newly released product IDs before they are available in
  // Hypixel's item-resource catalog. Use the current texture service first,
  // then retain a local family sprite if that service is unavailable.
  const localFallback = id.startsWith("shard_")
    ? getRegisteredItemTexture("attribute_shard")
    : id.startsWith("essence_")
      ? getRegisteredItemTexture("true_essence")
      : undefined;
  if (!localFallback) return [];

  return [
    `https://api.eliteskyblock.com/textures/items/${encodeURIComponent(id.toUpperCase())}`,
    localFallback,
  ];
}

function currentCatalogFallback(rawId: string): string[] {
  const id = rawId.trim();
  // Only send canonical SkyBlock IDs to the live texture catalog. Display
  // names such as "Unreal Machine Gun Bow" are intentionally excluded.
  if (!/^[A-Z0-9:.-]+$/.test(id)) return [];
  return [`https://api.eliteskyblock.com/textures/items/${encodeURIComponent(id)}`];
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
    const result: ResolvedTexture = {
      ...(src ? { src } : {}),
      candidates: [...new Set(candidates)],
      source,
      attempted: [...attempted],
    };
    cache.set(cacheKey, result);
    return result;
  };

  if (item.texture) return finish(item.texture, "manual-override");
  if (!id && !name) return finish(undefined, "placeholder");
  if (skillIcons[id]) return finish(skillIcons[id], "exact-id");

  const generatedPaths = [
    ...new Set([id, name, ...spellingKeys(id), ...spellingKeys(name)].filter(Boolean)),
  ]
    .map(getGeneratedItemMatch)
    .filter(Boolean) as string[];

  const mappedKeys = [
    ITEM_ALIASES[id],
    ITEM_ALIASES[name],
    ...spellingKeys(id).flatMap((key) => [ITEM_ALIASES[key]]),
    ...spellingKeys(name).flatMap((key) => [ITEM_ALIASES[key]]),
  ].filter(Boolean) as string[];
  const itemKeys = [
    ...new Set([
      ...spellingKeys(id).flatMap((key) => [...baseTextureKeys(key), ...fallbackKeys(key)]),
      ...spellingKeys(name).flatMap((key) => [...baseTextureKeys(key), ...fallbackKeys(key)]),
      ...mappedKeys.flatMap((key) => [...baseTextureKeys(key), ...fallbackKeys(key)]),
    ]),
  ].filter(Boolean);
  const localPaths: Array<{ path: string; key: string }> = [];
  for (const key of itemKeys) {
    attempted.push(`local-items:${key}`);
    const path = getRegisteredItemTexture(key);
    if (path) localPaths.push({ path, key });
  }

  const vanillaKeys = [
    ...new Set([...itemKeys, vanillaAliases[id], vanillaAliases[name]].filter(Boolean) as string[]),
  ];
  const vanillaPaths: string[] = [];
  for (const key of vanillaKeys) {
    attempted.push(`vanilla:${key}`);
    const path = getRegisteredVanillaTexture(key);
    if (path) vanillaPaths.push(path);
  }

  const familyFallbacks = familyFallbackTextures(id);
  if (familyFallbacks.length) attempted.push(`family-fallback:${id}`);
  const catalogFallbacks = currentCatalogFallback(item.id);
  if (catalogFallbacks.length) attempted.push(`catalog-fallback:${item.id}`);
  const orderedPaths = [
    ...localPaths.map(({ path }) => path),
    ...generatedPaths,
    ...vanillaPaths,
    ...familyFallbacks,
    ...catalogFallbacks,
  ];
  orderedPaths.push(getRegisteredVanillaTexture("barrier") ?? "/vanilla/barrier.png");
  candidates.push(...orderedPaths);
  const first = localPaths[0];
  const generated = generatedPaths[0];
  return finish(
    first?.path ??
      generated ??
      vanillaPaths[0] ??
      familyFallbacks[0] ??
      catalogFallbacks[0] ??
      "/vanilla/barrier.png",
    first
      ? first.key === id
        ? "exact-id"
        : mappedKeys.includes(first.key)
          ? "alias"
          : "registry"
      : generated
        ? "registry"
        : vanillaPaths.length
          ? "vanilla"
          : familyFallbacks.length || catalogFallbacks.length
            ? "alias"
            : "placeholder",
  );
}

export function clearTextureCache() {
  cache.clear();
}
