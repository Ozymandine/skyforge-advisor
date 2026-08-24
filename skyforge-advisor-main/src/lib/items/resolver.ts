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
    key.replace(/pulling(?:_\d+)?$/, ""),
    key.replace(/fired$/, ""),
    key.replace(/etherwarp(?:_(?:open|teleport|transmission))?$/, ""),
    key.replace(/(?:berserk|archer|mage|tank|healer|swordsman)$/, ""),
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

  // The Bazaar can contain newly released product IDs before they
  // appear in the local item-resource catalog. Try the live texture
  // service first, then fall back to a local family sprite.
  const localFallback = id.startsWith("shard_")
    ? getRegisteredItemTexture("attribute_shard")
    : id.startsWith("essence_")
      ? getRegisteredItemTexture("true_essence")
      : undefined;

  if (!localFallback) {
    return [];
  }

  return [
    `https://api.eliteskyblock.com/textures/items/${encodeURIComponent(id.toUpperCase())}`,
    localFallback,
  ];
}

function currentCatalogFallback(rawId: string): string[] {
  const id = rawId.trim();

  // Only send canonical SkyBlock IDs to the live texture catalog.
  // Display names such as "Unreal Machine Gun Bow" are intentionally excluded.
  if (!/^[A-Z0-9:._-]+$/.test(id)) {
    return [];
  }

  return [`https://api.eliteskyblock.com/textures/items/${encodeURIComponent(id)}`];
}

export function resolveItemTexture(item: SkyBlockItem): ResolvedTexture {
  const id = normalizeItemKey(item.id);
  const name = normalizeItemKey(item.name);

  const cacheKey = `${id}|${name}|${item.texture ?? ""}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    return cached;
  }

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

  // Explicit texture always wins.
  if (item.texture) {
    return finish(item.texture, "manual-override");
  }

  if (!id && !name) {
    return finish(undefined, "placeholder");
  }

  // Skill icons are intentionally handled before generic item matching.
  if (skillIcons[id]) {
    return finish(skillIcons[id], "exact-id");
  }

  /*
   * Generated item paths.
   *
   * This catches assets that follow the generated resource-pack naming
   * convention without requiring every single item to be registered
   * manually.
   */
  const generatedKeys = [
    ...new Set([id, name, ...spellingKeys(id), ...spellingKeys(name)].filter(Boolean)),
  ];

  const generatedPaths = generatedKeys.map(getGeneratedItemMatch).filter(Boolean) as string[];

  /*
   * Alias resolution.
   *
   * Example:
   * "aspect of the end" -> registered canonical item key.
   */
  const mappedKeys = [
    ITEM_ALIASES[id],
    ITEM_ALIASES[name],

    ...spellingKeys(id).flatMap((key) => [ITEM_ALIASES[key]]),

    ...spellingKeys(name).flatMap((key) => [ITEM_ALIASES[key]]),
  ].filter(Boolean) as string[];

  /*
   * Build all possible local item keys.
   *
   * The ordering here matters. More specific forms should be tried
   * before progressively weaker fallbacks.
   */
  const itemKeys = [
    ...new Set(
      [
        ...spellingKeys(id).flatMap((key) => [...baseTextureKeys(key), ...fallbackKeys(key)]),

        ...spellingKeys(name).flatMap((key) => [...baseTextureKeys(key), ...fallbackKeys(key)]),

        ...mappedKeys.flatMap((key) => [...baseTextureKeys(key), ...fallbackKeys(key)]),
      ].filter(Boolean),
    ),
  ];

  /*
   * Local resource-pack textures.
   */
  const localPaths: Array<{
    path: string;
    key: string;
  }> = [];

  for (const key of itemKeys) {
    attempted.push(`local-items:${key}`);

    const path = getRegisteredItemTexture(key);

    if (path) {
      localPaths.push({
        path,
        key,
      });
    }
  }

  /*
   * Vanilla Minecraft textures.
   */
  const vanillaKeys = [
    ...new Set([...itemKeys, vanillaAliases[id], vanillaAliases[name]].filter(Boolean) as string[]),
  ];

  const vanillaPaths: string[] = [];

  for (const key of vanillaKeys) {
    attempted.push(`vanilla:${key}`);

    const path = getRegisteredVanillaTexture(key);

    if (path) {
      vanillaPaths.push(path);
    }
  }

  /*
   * Family-level fallbacks.
   */
  const familyFallbacks = familyFallbackTextures(id);

  if (familyFallbacks.length) {
    attempted.push(`family-fallback:${id}`);
  }

  /*
   * Current live catalog fallback.
   */
  const catalogFallbacks = currentCatalogFallback(item.id);

  if (catalogFallbacks.length) {
    attempted.push(`catalog-fallback:${item.id}`);
  }

  /*
   * Final priority:
   *
   * 1. Local registered item
   * 2. Generated resource-pack match
   * 3. Vanilla texture
   * 4. Family fallback
   * 5. Live catalog
   * 6. Barrier
   */
  const orderedPaths = [
    ...localPaths.map(({ path }) => path),
    ...generatedPaths,
    ...vanillaPaths,
    ...familyFallbacks,
    ...catalogFallbacks,
  ];

  const barrier = getRegisteredVanillaTexture("barrier") ?? "/vanilla/barrier.png";

  orderedPaths.push(barrier);

  candidates.push(...orderedPaths);

  const first = localPaths[0];
  const generated = generatedPaths[0];

  const source = first
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
          : "placeholder";

  return finish(
    first?.path ??
      generated ??
      vanillaPaths[0] ??
      familyFallbacks[0] ??
      catalogFallbacks[0] ??
      barrier,
    source,
  );
}

export function clearTextureCache(): void {
  cache.clear();
}
