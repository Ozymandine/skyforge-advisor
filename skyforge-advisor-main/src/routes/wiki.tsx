import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useDeferredValue } from "react";
import { useQuery } from "@tanstack/react-query";

import { ErrorState, LoadState } from "@/components/data-states";

import { WikiPage, type WikiSelectedPrice } from "@/components/wiki/WikiPage";

import {
  CATEGORIES,
  VIRTUAL_PAGES,
  classifyItem,
  enchantmentBaseName,
  enchantmentLevel,
  rarityRank,
  type WikiCategory,
} from "@/components/wiki/wiki-data";

import { fetchBazaar, fetchItemIndex } from "@/lib/hypixel.functions";

/** Shareable wiki state lives in the URL: /wiki?q=aspect&item=ASPECT_OF_THE_END */
function validateSearch(search: Record<string, unknown>): {
  q?: string;
  item?: string;
} {
  return {
    ...(typeof search["q"] === "string" && search["q"] ? { q: search["q"] } : {}),
    ...(typeof search["item"] === "string" && search["item"] ? { item: search["item"] } : {}),
  };
}

export const Route = createFileRoute("/wiki")({
  validateSearch,
  head: () => ({
    meta: [
      {
        title: "Wiki — SkyBlock Assistant",
      },
      {
        name: "description",
        content:
          "Searchable Hypixel SkyBlock Wiki with categorized items, collections, weapons, armor, pets, accessories, enchantments, reforges, potions and minions.",
      },
      {
        property: "og:title",
        content: "Wiki — SkyBlock Assistant",
      },
      {
        property: "og:description",
        content: "Browse categorized Hypixel SkyBlock Wiki content.",
      },
    ],
  }),

  component: Wiki,
});

/* ============================================================================
 * TYPES
 * ========================================================================== */

type ClassifiedItem = {
  id: string;
  name: string;
  rarity: string;
  category: string;
  wikiCategory: WikiCategory | null;
  vanilla: boolean;
  enchantmentBase: string;
  enchantmentLevel: number | null;
};

type SearchableItem = ClassifiedItem | (typeof VIRTUAL_PAGES)[number];

/* ============================================================================
 * PAGE CONTROLLER
 * ========================================================================== */

const PAGE_SIZE = 5000;

function Wiki() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const [query, setQuery] = useState(search.q ?? "");
  const deferredQuery = useDeferredValue(query);
  const [category, setCategory] = useState<WikiCategory>("All");

  const [selectedId, setSelectedId] = useState<string | null>(search.item ?? null);

  const [visible, setVisible] = useState(PAGE_SIZE);

  const handleQueryChange = (newQ: string) => {
    setQuery(newQ);
    navigate({
      search: (prev) => {
        const next: { q?: string; item?: string } = {};
        if (newQ) next.q = newQ;
        if (prev.item) next.item = prev.item;
        return next;
      },
      replace: true,
    });
  };

  const handleSelect = (newItem: string | null) => {
    setSelectedId(newItem);
    navigate({
      search: (prev) => {
        const next: { q?: string; item?: string } = {};
        if (prev.q) next.q = prev.q;
        if (newItem) next.item = newItem;
        return next;
      },
      replace: true,
    });
  };

  /* --------------------------------------------------------------------------
   * DATA
   * ------------------------------------------------------------------------ */

  const itemsQuery = useQuery({
    queryKey: ["item-index"],
    queryFn: fetchItemIndex,
    staleTime: 30 * 60_000,
  });

  const bazaarQuery = useQuery({
    queryKey: ["bazaar"],
    queryFn: fetchBazaar,
    staleTime: 60_000,
  });

  /* --------------------------------------------------------------------------
   * BAZAAR PRICES
   * ------------------------------------------------------------------------ */

  const prices = useMemo(() => {
    return new Map((bazaarQuery.data?.products ?? []).map((product) => [product.id, product]));
  }, [bazaarQuery.data]);

  /* --------------------------------------------------------------------------
   * CLASSIFICATION
   * ------------------------------------------------------------------------ */

  const classifiedItems = useMemo<ClassifiedItem[]>(() => {
    if (!itemsQuery.data) {
      return [];
    }

    return itemsQuery.data.map((item) => {
      const classification = classifyItem(item);

      return {
        ...item,

        category: classification.category ?? "Uncategorized",

        wikiCategory: classification.category,

        vanilla: classification.vanilla,

        enchantmentBase: enchantmentBaseName(item.id),

        enchantmentLevel: enchantmentLevel(item.id),
      };
    });
  }, [itemsQuery.data]);

  /* --------------------------------------------------------------------------
   * SEARCHABLE DATA
   * ------------------------------------------------------------------------ */

  const allSearchableItems = useMemo<SearchableItem[]>(() => {
    return [...VIRTUAL_PAGES, ...classifiedItems];
  }, [classifiedItems]);

  /* --------------------------------------------------------------------------
   * FILTER + SORT
   * ------------------------------------------------------------------------ */

  const results = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();

    return (
      allSearchableItems
        .filter((item) => {
          /*
           * Virtual Wiki pages are always available.
           */
          if ("virtual" in item && item.virtual) {
            return true;
          }

          /*
           * Vanilla Minecraft items are hidden from
           * the normal browser unless explicitly searched.
           */
          if ("vanilla" in item && item.vanilla) {
            if (!q) {
              return false;
            }

            return item.name.toLowerCase().includes(q) || item.id.toLowerCase().includes(q);
          }

          return true;
        })

        .filter((item) => {
          if (category === "All") {
            return true;
          }

          return item.category === category;
        })

        .filter((item) => {
          if (!q) {
            return true;
          }

          const name = item.name.toLowerCase();

          const id = item.id.toLowerCase();

          const base = "enchantmentBase" in item ? item.enchantmentBase.toLowerCase() : "";

          return name.includes(q) || id.includes(q) || base.includes(q);
        })

        /*
         * Stable Wiki ordering:
         * rarity → name → ID
         */
        .sort((a, b) => {
          const rarityDifference = rarityRank(a.rarity) - rarityRank(b.rarity);

          if (rarityDifference !== 0) {
            return rarityDifference;
          }

          const nameDifference = a.name.localeCompare(b.name, undefined, {
            sensitivity: "base",
          });

          if (nameDifference !== 0) {
            return nameDifference;
          }

          return a.id.localeCompare(b.id);
        })
    );

    /*
     * Full result set — rendering is paginated below.
     */
  }, [allSearchableItems, category, deferredQuery]);

  const totalMatches = results.length;
  const shownResults = results.slice(0, visible);

  /* --------------------------------------------------------------------------
   * SELECTED ITEM
   * ------------------------------------------------------------------------ */

  /*
   * Only an explicit selection (user click or ?item= deep link)
   * opens the detail card. No silent fallback to the first result.
   */
  const selected = useMemo(() => {
    if (!selectedId) {
      return null;
    }

    return allSearchableItems.find((item) => item.id === selectedId) ?? null;
  }, [allSearchableItems, selectedId]);

  /* --------------------------------------------------------------------------
   * SELECTED PRICE
   * ------------------------------------------------------------------------ */

  const selectedPrice = useMemo<WikiSelectedPrice | undefined>(() => {
    if (!selected || "virtual" in selected) {
      return undefined;
    }

    const product = prices.get(selected.id);

    if (!product) {
      return undefined;
    }

    return {
      buyPrice: product.buyPrice,
      sellPrice: product.sellPrice,
      buyVolume: product.buyVolume,
      sellVolume: product.sellVolume,
      buyMovingWeek: product.buyMovingWeek,
      sellMovingWeek: product.sellMovingWeek,
    };
  }, [prices, selected]);

  const selectedItemProp = selected && !("virtual" in selected) ? selected : undefined;

  const footer =
    totalMatches > shownResults.length ? (
      <div className="flex justify-center pt-4">
        <button
          onClick={() => setVisible((v) => v + PAGE_SIZE)}
          className="rounded-full border border-primary/40 bg-primary/15 px-6 py-2 text-sm font-medium text-primary transition-all duration-75 ease-out hover:scale-[1.03] hover:bg-primary/25 active:scale-95"
        >
          Load more ({totalMatches - shownResults.length} remaining)
        </button>
      </div>
    ) : null;

  /* --------------------------------------------------------------------------
   * STATES
   * ------------------------------------------------------------------------ */

  if (itemsQuery.isLoading) {
    return <LoadState>Loading the SkyBlock Wiki…</LoadState>;
  }

  if (itemsQuery.error) {
    return <ErrorState error={itemsQuery.error} />;
  }

  if (!itemsQuery.data) {
    return null;
  }

  /* --------------------------------------------------------------------------
   * PAGE
   * ------------------------------------------------------------------------ */

  return (
    <WikiPage
      query={query}
      onQueryChange={handleQueryChange}
      categories={[...CATEGORIES]}
      category={category}
      onCategoryChange={(value) => setCategory(value as WikiCategory)}
      itemCount={allSearchableItems.length}
      items={shownResults}
      selectedId={selected?.id ?? null}
      onSelect={handleSelect}
      {...(selectedItemProp ? { selectedItem: selectedItemProp } : {})}
      {...(selectedPrice !== undefined ? { selectedPrice } : {})}
      {...(footer ? { footer } : {})}
      onItemClick={(item) => handleSelect(item.id)}
    />
  );
}
