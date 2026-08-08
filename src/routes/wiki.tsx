import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { ErrorState, LoadState } from "@/components/data-states";
import { Panel } from "@/components/layout/app-shell";
import { WikiSearch } from "@/components/wiki/WikiSearch";
import { WikiItemList } from "@/components/wiki/WikiItemList";
import { WikiItemDetails } from "@/components/wiki/WikiItemDetails";
import { fetchBazaar, fetchItems } from "@/lib/hypixel.functions";

export const Route = createFileRoute("/wiki")({
  head: () => ({
    meta: [
      { title: "Wiki — SkyBlock Assistant" },
      {
        name: "description",
        content:
          "Searchable index of every SkyBlock item with rarity, category and live pricing.",
      },
      {
        property: "og:title",
        content: "Wiki — SkyBlock Assistant",
      },
      {
        property: "og:description",
        content:
          "Every SkyBlock item, straight from the Hypixel resources API.",
      },
    ],
  }),
  component: Wiki,
});

const CATEGORIES = [
  "All",
  "Stats",
  "Skills",
  "Collections",
  "Weapons",
  "Armor",
  "Pets",
  "Accessories",
  "Locations",
  "Fairy Souls",
  "NPCs",
  "Mobs",
  "Enchanting",
  "Reforging",
  "Potions",
  "Minions",
  "Slayer",
  "Attributes",
  "Tutorials & Guides",
];

const RARITY_ORDER: Record<string, number> = {
  COMMON: 0,
  UNCOMMON: 1,
  RARE: 2,
  EPIC: 3,
  LEGENDARY: 4,
  MYTHIC: 5,
  DIVINE: 6,
  SPECIAL: 7,
  VERY_SPECIAL: 8,
};

const VANILLA_ITEM_IDS = new Set([
  "AIR",
  "STONE",
  "GRANITE",
  "POLISHED_GRANITE",
  "DIORITE",
  "POLISHED_DIORITE",
  "ANDESITE",
  "POLISHED_ANDESITE",
  "DEEPSLATE",
  "COBBLED_DEEPSLATE",
  "POLISHED_DEEPSLATE",
  "CALCITE",
  "TUFF",
  "DRIPSTONE_BLOCK",
  "GRASS_BLOCK",
  "DIRT",
  "COARSE_DIRT",
  "PODZOL",
  "ROOTED_DIRT",
  "MUD",
  "SAND",
  "RED_SAND",
  "GRAVEL",
  "CLAY",
  "SNOW",
  "SNOW_BLOCK",
  "ICE",
  "PACKED_ICE",
  "BLUE_ICE",
  "OBSIDIAN",
  "COBBLESTONE",
  "BEDROCK",
  "OAK_LOG",
  "SPRUCE_LOG",
  "BIRCH_LOG",
  "JUNGLE_LOG",
  "ACACIA_LOG",
  "DARK_OAK_LOG",
  "MANGROVE_LOG",
  "CHERRY_LOG",
  "OAK_PLANKS",
  "SPRUCE_PLANKS",
  "BIRCH_PLANKS",
  "JUNGLE_PLANKS",
  "ACACIA_PLANKS",
  "DARK_OAK_PLANKS",
  "MANGROVE_PLANKS",
  "CHERRY_PLANKS",
  "COAL",
  "CHARCOAL",
  "IRON_INGOT",
  "GOLD_INGOT",
  "COPPER_INGOT",
  "DIAMOND",
  "EMERALD",
  "LAPIS_LAZULI",
  "REDSTONE",
  "QUARTZ",
  "AMETHYST_SHARD",
  "RAW_IRON",
  "RAW_GOLD",
  "RAW_COPPER",
  "WHEAT",
  "WHEAT_SEEDS",
  "CARROT",
  "POTATO",
  "BEETROOT",
  "BEETROOT_SEEDS",
  "MELON",
  "MELON_SLICE",
  "PUMPKIN",
  "PUMPKIN_SEEDS",
  "SUGAR_CANE",
  "CACTUS",
  "COCOA_BEANS",
  "BROWN_MUSHROOM",
  "RED_MUSHROOM",
  "NETHER_WART",
  "APPLE",
  "BREAD",
  "COOKIE",
  "CAKE",
  "BEEF",
  "COOKED_BEEF",
  "PORKCHOP",
  "COOKED_PORKCHOP",
  "CHICKEN",
  "COOKED_CHICKEN",
  "MUTTON",
  "COOKED_MUTTON",
  "RABBIT",
  "COOKED_RABBIT",
  "COD",
  "COOKED_COD",
  "SALMON",
  "COOKED_SALMON",
  "TROPICAL_FISH",
  "PUFFERFISH",
  "ROTTEN_FLESH",
  "BONE",
  "STRING",
  "SPIDER_EYE",
  "GUNPOWDER",
  "BLAZE_ROD",
  "ENDER_PEARL",
  "ENDER_EYE",
  "SLIME_BALL",
  "MAGMA_CREAM",
  "GHAST_TEAR",
  "FEATHER",
  "LEATHER",
  "INK_SAC",
  "BOWL",
  "STICK",
  "PAPER",
  "BOOK",
  "WRITABLE_BOOK",
  "WRITTEN_BOOK",
  "LEAD",
  "NAME_TAG",
  "SHEARS",
  "FLINT",
  "FLINT_AND_STEEL",
  "TORCH",
  "LANTERN",
  "CHEST",
  "BARREL",
  "CRAFTING_TABLE",
  "FURNACE",
  "BLAST_FURNACE",
  "SMOKER",
  "ANVIL",
  "ENCHANTING_TABLE",
  "GRINDSTONE",
  "STONECUTTER",
  "BREWING_STAND",
  "CAULDRON",
  "LADDER",
  "SIGN",
  "OAK_SIGN",
  "SPRUCE_SIGN",
  "BIRCH_SIGN",
  "JUNGLE_SIGN",
  "ACACIA_SIGN",
  "DARK_OAK_SIGN",
  "MANGROVE_SIGN",
  "CHEST_MINECART",
  "FURNACE_MINECART",
  "HOPPER_MINECART",
  "TNT_MINECART",
  "OAK_BOAT",
  "SPRUCE_BOAT",
  "BIRCH_BOAT",
  "JUNGLE_BOAT",
  "ACACIA_BOAT",
  "DARK_OAK_BOAT",
  "MANGROVE_BOAT",
  "ARROW",
  "SPECTRAL_ARROW",
  "SHIELD",
  "LEATHER_HELMET",
  "LEATHER_CHESTPLATE",
  "LEATHER_LEGGINGS",
  "LEATHER_BOOTS",
  "CHAINMAIL_HELMET",
  "CHAINMAIL_CHESTPLATE",
  "CHAINMAIL_LEGGINGS",
  "CHAINMAIL_BOOTS",
  "IRON_HELMET",
  "IRON_CHESTPLATE",
  "IRON_LEGGINGS",
  "IRON_BOOTS",
  "GOLDEN_HELMET",
  "GOLDEN_CHESTPLATE",
  "GOLDEN_LEGGINGS",
  "GOLDEN_BOOTS",
  "DIAMOND_HELMET",
  "DIAMOND_CHESTPLATE",
  "DIAMOND_LEGGINGS",
  "DIAMOND_BOOTS",
  "NETHERITE_HELMET",
  "NETHERITE_CHESTPLATE",
  "NETHERITE_LEGGINGS",
  "NETHERITE_BOOTS",
  "WOODEN_SWORD",
  "STONE_SWORD",
  "IRON_SWORD",
  "GOLDEN_SWORD",
  "DIAMOND_SWORD",
  "NETHERITE_SWORD",
  "WOODEN_AXE",
  "STONE_AXE",
  "IRON_AXE",
  "GOLDEN_AXE",
  "DIAMOND_AXE",
  "NETHERITE_AXE",
  "WOODEN_PICKAXE",
  "STONE_PICKAXE",
  "IRON_PICKAXE",
  "GOLDEN_PICKAXE",
  "DIAMOND_PICKAXE",
  "NETHERITE_PICKAXE",
  "WOODEN_SHOVEL",
  "STONE_SHOVEL",
  "IRON_SHOVEL",
  "GOLDEN_SHOVEL",
  "DIAMOND_SHOVEL",
  "NETHERITE_SHOVEL",
  "WOODEN_HOE",
  "STONE_HOE",
  "IRON_HOE",
  "GOLDEN_HOE",
  "DIAMOND_HOE",
  "NETHERITE_HOE",
  "BOW",
  "CROSSBOW",
  "TRIDENT",
  "FISHING_ROD",
  "CARROT_ON_A_STICK",
  "FLINT_AND_STEEL",
]);

function normalize(value: string | undefined): string {
  return (value ?? "")
    .toUpperCase()
    .replace(/§./g, "")
    .replace(/[^A-Z0-9_ ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isVanillaItem(item: {
  id: string;
  name: string;
}): boolean {
  const id = normalize(item.id).replace(/ /g, "_");

  if (VANILLA_ITEM_IDS.has(id)) {
    return true;
  }

  /*
   * Vanilla blocks/items frequently arrive from the resource endpoint with
   * the Minecraft material as their ID. These are intentionally hidden from
   * the default wiki index.
   */
  const vanillaPrefixes = [
    "OAK_",
    "SPRUCE_",
    "BIRCH_",
    "JUNGLE_",
    "ACACIA_",
    "DARK_OAK_",
    "MANGROVE_",
    "CHERRY_",
    "CRIMSON_",
    "WARPED_",
    "BAMBOO_",
    "POLISHED_",
    "CHISELED_",
    "CUT_",
    "SMOOTH_",
    "STRIPPED_",
  ];

  if (
    vanillaPrefixes.some((prefix) =>
      id.startsWith(prefix),
    )
  ) {
    return true;
  }

  const vanillaSuffixes = [
    "_PLANKS",
    "_STAIRS",
    "_SLAB",
    "_WALL",
    "_FENCE",
    "_FENCE_GATE",
    "_DOOR",
    "_TRAPDOOR",
    "_BUTTON",
    "_PRESSURE_PLATE",
    "_SIGN",
    "_BANNER",
    "_CARPET",
  ];

  if (
    vanillaSuffixes.some((suffix) =>
      id.endsWith(suffix),
    )
  ) {
    return true;
  }

  return false;
}

/**
 * These are the actual vanilla Minecraft enchantments.
 *
 * SkyBlock enchantment books are represented by individual levels, so
 * ENCHANTMENT_SMITE_1 through ENCHANTMENT_SMITE_7, etc. all resolve to
 * Enchanting.
 */
const ENCHANTMENT_IDS = [
  "AQUA_AFFINITY",
  "BANE_OF_ARTHROPODS",
  "BLAST_PROTECTION",
  "BREACH",
  "CHANNELING",
  "CLEAVING",
  "CRITICAL",
  "CUBISM",
  "DIVINE_GIFT",
  "EFFICIENCY",
  "ENDER_SLAYER",
  "FEATHER_FALLING",
  "FIRE_ASPECT",
  "FIRE_PROTECTION",
  "FIRST_STRIKE",
  "FORTUNE",
  "GIANT_KILLER",
  "IMPALING",
  "INFINITE_QUIVER",
  "KNOCKBACK",
  "LIFE_STEAL",
  "LOOTING",
  "LUCK",
  "LURE",
  "MANA_STEAL",
  "MENDING",
  "OVERLOAD",
  "PIERCING",
  "POWER",
  "PROSECUTE",
  "PROTECTION",
  "PUNCH",
  "RESPIRATION",
  "SCAVENGER",
  "SHARPNESS",
  "SILK_TOUCH",
  "SMITE",
  "SMITE_",
  "SNIPE",
  "SOUL_EATER",
  "SWEEPING_EDGE",
  "THORNS",
  "TRIPLE_STRIKE",
  "TRUE_PROTECTION",
  "VAMPIRISM",
  "VENOMOUS",
  "ULTIMATE_WISE",
  "WISDOM",
  "REJUVENATE",
  "FEROCIOUS_MANA",
  "ONE_FOR_ALL",
  "NO_PAIN_NO_GAIN",
  "REFLECTION",
  "TABasco",
];

function isEnchantment(item: {
  id: string;
  name: string;
  category?: string;
  description?: string | string[];
  lore?: string[];
}): boolean {
  const id = normalize(item.id).replace(/ /g, "_");
  const name = normalize(item.name);
  const category = normalize(item.category);

  if (
    id.startsWith("ENCHANTMENT_") ||
    id.startsWith("ENCHANTED_BOOK_") ||
    id.includes("_ENCHANTMENT_")
  ) {
    return true;
  }

  if (
    category === "ENCHANTMENT" ||
    category === "ENCHANTMENTS"
  ) {
    return true;
  }

  /*
   * The resource API can represent enchantment books with an item name such
   * as "Smite I", "Smite V", etc. Match the actual enchantment name plus a
   * Roman/Arabic level instead of just looking for the word "book".
   */
  const enchantmentNamePattern =
    /^(AQUA AFFINITY|BANE OF ARTHROPODS|BLAST PROTECTION|BREACH|CHANNELING|CLEAVING|CRITICAL|CUBISM|DIVINE GIFT|EFFICIENCY|ENDER SLAYER|FEATHER FALLING|FIRE ASPECT|FIRE PROTECTION|FIRST STRIKE|FORTUNE|GIANT KILLER|IMPALING|INFINITE QUIVER|KNOCKBACK|LIFE STEAL|LOOTING|LUCK|LURE|MANA STEAL|MENDING|OVERLOAD|PIERCING|POWER|PROSECUTE|PROTECTION|PUNCH|RESPIRATION|SCAVENGER|SHARPNESS|SILK TOUCH|SMITE|SNIPE|SOUL EATER|SWEEPING EDGE|THORNS|TRIPLE STRIKE|TRUE PROTECTION|VAMPIRISM|VENOMOUS|ULTIMATE WISE|WISDOM|REJUVENATE|FEROCIOUS MANA|ONE FOR ALL|NO PAIN NO GAIN|REFLECTION)\s+(I|II|III|IV|V|VI|VII|VIII|IX|X|\d+)$/;

  if (
    enchantmentNamePattern.test(name)
  ) {
    return true;
  }

  if (
    ENCHANTMENT_IDS.some((enchantment) =>
      id.includes(enchantment),
    )
  ) {
    return true;
  }

  return false;
}

const COLLECTION_IDS = new Set([
  "WHEAT",
  "CARROT_ITEM",
  "POTATO_ITEM",
  "PUMPKIN",
  "MELON",
  "SEEDS",
  "MUSHROOM_COLLECTION",
  "INK_SACK",
  "CACTUS",
  "SUGAR_CANE",
  "COCOA_BEANS",
  "CACTUS_GREEN",
  "RAW_FISH",
  "RAW_SALMON",
  "CLAY_BALL",
  "SPONGE",
  "PRISMARINE_SHARD",
  "PRISMARINE_CRYSTALS",
  "LILY_PAD",
  "INK_SACK",
  "RAW_CHICKEN",
  "FEATHER",
  "LEATHER",
  "PORK",
  "MUTTON",
  "RABBIT",
  "ROTTEN_FLESH",
  "BONE",
  "STRING",
  "SPIDER_EYE",
  "GUNPOWDER",
  "ENDER_PEARL",
  "BLAZE_ROD",
  "MAGMA_CREAM",
  "GHAST_TEAR",
  "SLIME_BALL",
  "SULPHUR",
  "COBBLESTONE",
  "COAL",
  "IRON_INGOT",
  "GOLD_INGOT",
  "DIAMOND",
  "EMERALD",
  "REDSTONE",
  "LAPIS_LAZULI",
  "QUARTZ",
  "OBSIDIAN",
  "GLOWSTONE_DUST",
  "GRAVEL",
  "SAND",
  "END_STONE",
  "NETHERRACK",
  "MITHRIL_ORE",
  "TITANIUM_ORE",
  "HARD_STONE",
  "GEMSTONE",
  "LOG",
  "LOG_2",
  "OAK_LOG",
  "SPRUCE_LOG",
  "BIRCH_LOG",
  "JUNGLE_LOG",
  "ACACIA_LOG",
  "DARK_OAK_LOG",
  "INK_SACK:3",
]);

function isCollectionItem(item: {
  id: string;
  name: string;
  category?: string;
}): boolean {
  const id = normalize(item.id).replace(/ /g, "_");
  const category = normalize(item.category);

  if (
    category === "COLLECTION" ||
    category === "COLLECTIONS"
  ) {
    return true;
  }

  if (COLLECTION_IDS.has(id)) {
    return true;
  }

  /*
   * SkyBlock collection items frequently use IDs such as:
   * ENCHANTED_WHEAT
   * ENCHANTED_CARROT
   * ENCHANTED_IRON
   * etc.
   *
   * These should remain in Collections, unless they are a more specific
   * category such as an enchantment itself.
   */
  if (
    id.startsWith("ENCHANTED_") &&
    !id.startsWith("ENCHANTED_BOOK")
  ) {
    return true;
  }

  return false;
}

function getWikiCategory(item: {
  id: string;
  name: string;
  category?: string;
  material?: string;
  description?: string | string[];
  lore?: string[];
}): string {
  const id = normalize(item.id).replace(/ /g, "_");
  const name = normalize(item.name);
  const apiCategory = normalize(item.category);

  // Specific categories first.

  if (isEnchantment(item)) {
    return "Enchanting";
  }

  if (
    id.includes("REFORGE_STONE") ||
    apiCategory === "REFORGE" ||
    apiCategory === "REFORGING" ||
    apiCategory === "REFORGE_STONE" ||
    apiCategory === "REFORGE_STONES"
  ) {
    return "Reforging";
  }

  if (
    id.includes("MINION") ||
    apiCategory === "MINION" ||
    apiCategory === "MINIONS" ||
    name.includes("MINION TIER")
  ) {
    return "Minions";
  }

  if (
    id.endsWith("_PET") ||
    id.includes("_PET_") ||
    id.startsWith("PET_") ||
    apiCategory === "PET" ||
    apiCategory === "PETS" ||
    name.includes("PET ITEM") ||
    name.includes("PET SKIN")
  ) {
    return "Pets";
  }

  if (
    id.includes("TALISMAN") ||
    id.includes("ACCESSORY") ||
    apiCategory === "ACCESSORY" ||
    apiCategory === "ACCESSORIES" ||
    apiCategory === "TALISMAN" ||
    apiCategory === "TALISMANS"
  ) {
    return "Accessories";
  }

  if (
    apiCategory === "ARMOR" ||
    apiCategory === "HELMET" ||
    apiCategory === "CHESTPLATE" ||
    apiCategory === "LEGGINGS" ||
    apiCategory === "BOOTS" ||
    id.endsWith("_HELMET") ||
    id.endsWith("_CHESTPLATE") ||
    id.endsWith("_LEGGINGS") ||
    id.endsWith("_BOOTS")
  ) {
    return "Armor";
  }

  if (
    apiCategory === "WEAPON" ||
    apiCategory === "WEAPONS" ||
    [
      "SWORD",
      "BOW",
      "DAGGER",
      "STAFF",
      "WAND",
      "SPEAR",
      "GAUNTLET",
      "DRILL",
      "CLAYMORE",
      "KATANA",
      "RIFLE",
      "CANNON",
      "SHOTGUN",
      "GIANT_SWORD",
      "ASPECT_OF_THE_",
      "JUJU",
      "TERMINATOR",
      "HYPERION",
      "VALKYRIE",
      "SCYLLA",
      "ASTRAEA",
    ].some((pattern) =>
      id.includes(pattern),
    )
  ) {
    return "Weapons";
  }

  if (
    apiCategory === "POTION" ||
    apiCategory === "POTIONS" ||
    id.startsWith("POTION_") ||
    id.endsWith("_POTION") ||
    id.includes("POTION")
  ) {
    return "Potions";
  }

  if (
    id.includes("FAIRY_SOUL") ||
    id.includes("FAIRY_SOULS") ||
    name === "FAIRY SOUL"
  ) {
    return "Fairy Souls";
  }

  if (
    id.includes("SLAYER") ||
    id.includes("REVENANT") ||
    id.includes("TARANTULA") ||
    id.includes("SVEN") ||
    id.includes("VOIDGLOOM") ||
    id.includes("RIFTSTALKER") ||
    id.includes("DEMONLORD")
  ) {
    return "Slayer";
  }

  if (
    id.includes("ATTRIBUTE") ||
    apiCategory === "ATTRIBUTE" ||
    apiCategory === "ATTRIBUTES" ||
    name.includes("ATTRIBUTE SHARD")
  ) {
    return "Attributes";
  }

  if (
    apiCategory === "MOB" ||
    apiCategory === "MOBS" ||
    id.startsWith("SPAWN_EGG_") ||
    id.endsWith("_SPAWN_EGG")
  ) {
    return "Mobs";
  }

  if (
    apiCategory === "NPC" ||
    apiCategory === "NPCS"
  ) {
    return "NPCs";
  }

  if (isCollectionItem(item)) {
    return "Collections";
  }

  /*
   * Items that cannot be confidently assigned to one of the actual item
   * categories are not forced into a random category.
   */
  return "Collections";
}

function rarityRank(rarity: string | undefined): number {
  const normalized = normalize(rarity).replace(
    /\s+/g,
    "_",
  );

  return RARITY_ORDER[normalized] ?? 99;
}

function Wiki() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(
    null,
  );

  const items = useQuery({
    queryKey: ["items"],
    queryFn: () => fetchItems(),
    staleTime: 30 * 60_000,
  });

  const bazaar = useQuery({
    queryKey: ["bazaar"],
    queryFn: () => fetchBazaar(),
    staleTime: 60_000,
  });

  const prices = useMemo(
    () =>
      new Map(
        (bazaar.data?.products ?? []).map((p) => [
          p.id,
          p,
        ]),
      ),
    [bazaar.data],
  );

  const categorizedItems = useMemo(() => {
    return (items.data ?? []).map((item) => ({
      ...item,
      category: getWikiCategory(item),
      isVanilla: isVanillaItem(item),
    }));
  }, [items.data]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    return categorizedItems
      .filter((item) => {
        /*
         * Vanilla items are hidden from the normal wiki index.
         *
         * Once the user actually searches for something, however, they are
         * allowed back into the results. This makes searching "Chiseled
         * Sandstone" still work without polluting the entire wiki.
         */
        if (!item.isVanilla) {
          return true;
        }

        if (!q) {
          return false;
        }

        return (
          item.name.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q)
        );
      })
      .filter((item) =>
        category === "All"
          ? true
          : item.category === category,
      )
      .filter((item) => {
        if (!q) {
          return true;
        }

        return (
          item.name.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        /*
         * Default sorting:
         *
         * Common
         * Uncommon
         * Rare
         * Epic
         * Legendary
         * Mythic
         * Divine
         * Special
         * Very Special
         */
        const rarityDifference =
          rarityRank(a.rarity) -
          rarityRank(b.rarity);

        if (rarityDifference !== 0) {
          return rarityDifference;
        }

        return a.name.localeCompare(
          b.name,
          undefined,
          {
            sensitivity: "base",
          },
        );
      })
      .slice(0, 60);
  }, [
    categorizedItems,
    query,
    category,
  ]);

  const selected =
    categorizedItems.find(
      (item) => item.id === selectedId,
    ) ?? results[0];

  const price = selected
    ? prices.get(selected.id)
    : undefined;

  if (items.isLoading) {
    return (
      <LoadState>
        Loading the item database…
      </LoadState>
    );
  }

  if (items.error) {
    return (
      <ErrorState error={items.error} />
    );
  }

  if (!items.data) {
    return null;
  }

  return (
    <div className="grid items-start gap-4 lg:grid-cols-3">
      <Panel className="lg:col-span-2">
        <WikiSearch
          query={query}
          onQueryChange={setQuery}
          categories={CATEGORIES}
          category={category}
          onCategoryChange={setCategory}
          itemCount={items.data.length}
        />

        <WikiItemList
          items={results}
          selectedId={selected?.id ?? null}
          onSelect={setSelectedId}
        />
      </Panel>

      <WikiItemDetails
        item={selected}
        price={price}
      />
    </div>
  );
}