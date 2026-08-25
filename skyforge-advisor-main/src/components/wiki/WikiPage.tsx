"use client";

import {
  Search,
  SlidersHorizontal,
  X,
  Check,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Coins,
  ShoppingCart,
  Store,
  Tag,
  Lock,
  Hammer,
  ArrowRight,
  TrendingUp,
  Boxes,
  Gem,
  Sparkles,
  Trophy,
  Bot,
  MapPin,
  ScrollText,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { memo, useDeferredValue, useEffect, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { WikiItemIcon } from "./WikiItemIcon";
import { cn } from "@/lib/utils";

import { fetchItemDetail } from "@/lib/hypixel.functions";
import { titleCase } from "@/lib/skyblock";

export interface WikiItem {
  id: string;
  name: string;
  category: string;
  rarity?: string;
  icon?: string;
  description?: string | string[];
  lore?: string[];

  material?: string;
  stats?: Record<string, number>;
  abilities?: Array<{
    name: string;
    description: string | string[];
    manaCost?: number;
    cooldown?: number;
  }>;
  npcSell?: number | null;
  bazaar?: {
    buyPrice: number;
    sellPrice: number;
    buyVolume: number;
    sellVolume: number;
    buyMovingWeek: number;
    sellMovingWeek: number;
  };
  auctionHouse?: {
    lowestBin: number | null;
    averageBin: number | null;
    listings: number;
  };

  requirements?: Array<{
    type: string;
    level?: number;
    value?: string;
  }>;

  recipe?: {
    ingredients: Array<{
      id: string;
      name: string;
      amount: number;
    }>;
    craftingType?: string;
    outputAmount?: number;
  };

  obtainedFrom?: string[];
  collection?: string;
  minionSource?: string;
  npcSource?: string;
  upgradePath?: string[];
  museumValue?: number | null;
  enchantments?: string[];
  reforges?: string[];
  wikiUrl?: string;
}

interface WikiPageProps {
  items: WikiItem[];
  categories?: string[];
  title?: string;
  description?: string;
  onItemClick?: (item: WikiItem) => void;

  /** Controlled search value (optional — falls back to internal state). */
  query?: string;
  onQueryChange?: (value: string) => void;
  /** Controlled category (optional). */
  category?: string;
  onCategoryChange?: (value: string) => void;
  itemCount?: number;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  selectedItem?: WikiItem;
  selectedPrice?: WikiSelectedPrice;
  footer?: React.ReactNode;
}

/** Live market snapshot for the currently selected item. */
export interface WikiSelectedPrice {
  buyPrice?: number;
  sellPrice?: number;
  buyVolume?: number;
  sellVolume?: number;
  buyMovingWeek?: number;
  sellMovingWeek?: number;
}

const DEFAULT_CATEGORIES = [
  "All",
  "Stats",
  "Skills",
  "Collections",
  "Weapons",
  "Armor",
  "Pets",
  "Accessories",
  "Locations",
  "NPCs",
  "Mobs",
  "Enchanting",
  "Reforging",
  "Potions",
  "Minions",
  "Slayer",
  "Tutorials & Guides",
];

const RARITIES = [
  "COMMON",
  "UNCOMMON",
  "RARE",
  "EPIC",
  "LEGENDARY",
  "MYTHIC",
  "DIVINE",
  "SPECIAL",
  "VERY SPECIAL",
] as const;

const MAX_RENDERED_RESULTS = 1000;

const RARITY_META: Record<
  string,
  {
    label: string;
    className: string;
    badgeClassName: string;
    dotClassName: string;
    rank: number;
  }
> = {
  COMMON: {
    label: "Common",
    className: "text-slate-300",
    badgeClassName: "border-slate-400/20 bg-slate-400/10 text-slate-300",
    dotClassName: "bg-slate-300",
    rank: 0,
  },
  UNCOMMON: {
    label: "Uncommon",
    className: "text-green-400",
    badgeClassName: "border-green-400/20 bg-green-400/10 text-green-400",
    dotClassName: "bg-green-400",
    rank: 1,
  },
  RARE: {
    label: "Rare",
    className: "text-blue-400",
    badgeClassName: "border-blue-400/20 bg-blue-400/10 text-blue-400",
    dotClassName: "bg-blue-400",
    rank: 2,
  },
  EPIC: {
    label: "Epic",
    className: "text-purple-400",
    badgeClassName: "border-purple-400/20 bg-purple-400/10 text-purple-400",
    dotClassName: "bg-purple-400",
    rank: 3,
  },
  LEGENDARY: {
    label: "Legendary",
    className: "text-yellow-400",
    badgeClassName: "border-yellow-400/20 bg-yellow-400/10 text-yellow-400",
    dotClassName: "bg-yellow-400",
    rank: 4,
  },
  MYTHIC: {
    label: "Mythic",
    className: "text-pink-400",
    badgeClassName: "border-pink-400/20 bg-pink-400/10 text-pink-400",
    dotClassName: "bg-pink-400",
    rank: 5,
  },
  DIVINE: {
    label: "Divine",
    className: "text-cyan-300",
    badgeClassName: "border-cyan-300/20 bg-cyan-300/10 text-cyan-300",
    dotClassName: "bg-cyan-300",
    rank: 6,
  },
  SPECIAL: {
    label: "Special",
    className: "text-red-400",
    badgeClassName: "border-red-400/20 bg-red-400/10 text-red-400",
    dotClassName: "bg-red-400",
    rank: 7,
  },
  "VERY SPECIAL": {
    label: "Very Special",
    className: "text-red-300",
    badgeClassName: "border-red-300/20 bg-red-300/10 text-red-300",
    dotClassName: "bg-red-300",
    rank: 8,
  },
};

function normalizeRarity(rarity?: string) {
  return rarity?.trim().toUpperCase().replace(/_/g, " ") ?? "";
}

function rarityMeta(rarity?: string) {
  return (
    RARITY_META[normalizeRarity(rarity)] ?? {
      label: rarity || "Unknown",
      className: "text-muted-foreground",
      badgeClassName: "border-border bg-muted/50 text-muted-foreground",
      dotClassName: "bg-muted-foreground",
      rank: 99,
    }
  );
}

function normalizeDescription(description?: string | string[]) {
  if (!description) {
    return "";
  }

  if (Array.isArray(description)) {
    return description.join(" ");
  }

  return description;
}

function formatStatValue(value: number) {
  if (!Number.isFinite(value)) {
    return "0";
  }

  return Math.abs(value) >= 1000 ? value.toLocaleString() : String(value);
}

function getStatEntries(stats?: Record<string, number>) {
  if (!stats) {
    return [];
  }

  return Object.entries(stats)
    .filter(([, value]) => Number.isFinite(value))
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 3);
}

function scoreSearchResult(item: WikiItem, query: string) {
  if (!query) {
    return 0;
  }

  const normalizedQuery = query.toLowerCase();
  const name = item.name.toLowerCase();
  const id = item.id.toLowerCase();
  const category = item.category.toLowerCase();
  const rarity = normalizeRarity(item.rarity).toLowerCase();
  const description = normalizeDescription(item.description).toLowerCase();

  let score = 0;

  if (name === normalizedQuery) {
    score += 1000;
  }

  if (id === normalizedQuery) {
    score += 950;
  }

  if (name.startsWith(normalizedQuery)) {
    score += 700;
  }

  if (id.startsWith(normalizedQuery)) {
    score += 650;
  }

  if (name.split(/[\s_-]+/).some((word) => word.startsWith(normalizedQuery))) {
    score += 450;
  }

  if (id.includes(normalizedQuery)) {
    score += 250;
  }

  if (name.includes(normalizedQuery)) {
    score += 350;
  }

  if (category.includes(normalizedQuery)) {
    score += 125;
  }

  if (rarity.includes(normalizedQuery)) {
    score += 75;
  }

  if (description.includes(normalizedQuery)) {
    score += 35;
  }

  score += Math.max(0, 40 - name.length);

  return score;
}

export function WikiPage({
  items,
  categories = DEFAULT_CATEGORIES,
  title = "SkyBlock Wiki",
  description = "Explore items, mechanics, recipes, abilities, and everything else in Hypixel SkyBlock.",
  onItemClick,
  query,
  onQueryChange,
  category,
  onCategoryChange,
  itemCount,
  selectedId,
  selectedItem,
  selectedPrice,
  footer,
  onSelect,
}: WikiPageProps) {
  const [internalSearch, setInternalSearch] = useState("");
  const [internalCategory, setInternalCategory] = useState("All");
  // Internal pagination: the route sends a large batch; we render in chunks.
  const [renderLimit, setRenderLimit] = useState(MAX_RENDERED_RESULTS);

  // Controlled when the parent supplies query/category, else internal state.
  const search = query ?? internalSearch;
  const setSearch = (value: string) => {
    setInternalSearch(value);
    onQueryChange?.(value);
  };

  const selectedCategory = category ?? internalCategory;
  const setSelectedCategory = (value: string) => {
    setInternalCategory(value);
    onCategoryChange?.(value);
  };
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedRarity, setSelectedRarity] = useState<string | null>(null);

  const deferredSearch = useDeferredValue(search);

  const rarityCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    for (const rarity of RARITIES) {
      counts[rarity] = 0;
    }

    for (const item of items) {
      const rarity = normalizeRarity(item.rarity);

      if (rarity in counts) {
        counts[rarity] = (counts[rarity] ?? 0) + 1;
      }
    }

    return counts;
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    const filtered = items.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();

      if (!matchesCategory) {
        return false;
      }

      if (selectedRarity) {
        const itemRarity = normalizeRarity(item.rarity);

        if (itemRarity !== selectedRarity) {
          return false;
        }
      }

      if (!query) {
        return true;
      }

      const itemDescription = normalizeDescription(item.description);

      return (
        item.name.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        normalizeRarity(item.rarity).toLowerCase().includes(query) ||
        itemDescription.toLowerCase().includes(query)
      );
    });

    if (query) {
      return filtered
        .map((item, index) => ({
          item,
          score: scoreSearchResult(item, query),
          index,
        }))
        .sort((a, b) => {
          if (b.score !== a.score) {
            return b.score - a.score;
          }

          return (
            a.item.name.localeCompare(b.item.name, undefined, { sensitivity: "base" }) ||
            a.index - b.index
          );
        })
        .map(({ item }) => item);
    }

    return [...filtered].sort((a, b) => {
      const rarityDifference = rarityMeta(a.rarity).rank - rarityMeta(b.rarity).rank;

      if (rarityDifference !== 0) {
        return rarityDifference;
      }

      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    });
  }, [deferredSearch, items, selectedCategory, selectedRarity]);

  const clearFilters = () => {
    setSelectedCategory("All");
    setSelectedRarity(null);
  };

  const clearAll = () => {
    setSearch("");
    clearFilters();
  };

  const hasFilters = Boolean(search) || selectedCategory !== "All" || selectedRarity !== null;

  const activeFilterCount = (selectedCategory !== "All" ? 1 : 0) + (selectedRarity ? 1 : 0);

  const renderedItems = filteredItems.slice(0, renderLimit);

  const hasMoreResults = filteredItems.length > renderedItems.length;

  const loadMoreBlock = hasMoreResults ? (
    <div className="mt-5 flex items-center justify-center">
      <button
        onClick={() => setRenderLimit((v) => v + 1000)}
        className="rounded-full border border-primary/40 bg-primary/15 px-6 py-2 text-sm font-medium text-primary transition-all duration-75 ease-out hover:scale-[1.03] hover:bg-primary/25 active:scale-95"
      >
        Load more ({(filteredItems.length - renderedItems.length).toLocaleString()} remaining)
      </button>
    </div>
  ) : null;

  return (
    <main className="min-h-0 flex-1 overflow-x-hidden">
      <div className="mx-auto w-full max-w-[1700px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {/* Header */}
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-3">
            <div className="w-fit rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              Hypixel SkyBlock
            </div>

            <div className="max-w-4xl">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.65rem]">
                {title}
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:mt-3 sm:text-base">
                {description}
              </p>
            </div>
          </div>
        </header>

        {/* Search / filters */}
        <section className="relative z-40 mb-6 sm:mb-8">
          <div className="rounded-2xl border border-border/70 bg-card/90 shadow-sm backdrop-blur-md">
            {/* Main controls */}
            <div className="p-3 sm:p-4">
              <div className="flex flex-col gap-3 lg:flex-row">
                {/* Search */}
                <div className="relative min-w-0 flex-1">
                  <Search
                    size={18}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search items, IDs, categories..."
                    aria-label="Search the SkyBlock Wiki"
                    className={cn(
                      "h-11 w-full rounded-xl border border-input bg-background/80 pl-10",
                      search ? "pr-10" : "pr-4",
                      "text-sm text-foreground outline-none",
                      "placeholder:text-muted-foreground",
                      "transition-all duration-150",
                      "focus:border-primary/60 focus:bg-background focus:ring-2 focus:ring-primary/10",
                      "hover:border-ring/30",
                    )}
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                      className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <X size={15} aria-hidden="true" />
                    </button>
                  )}
                </div>

                {/* Filter button */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setFiltersOpen((open) => !open)}
                    aria-expanded={filtersOpen}
                    aria-controls="wiki-filter-panel"
                    className={cn(
                      "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 lg:w-auto",
                      "bg-background/80 text-sm font-medium",
                      "transition-all duration-150",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
                      filtersOpen || activeFilterCount > 0
                        ? "border-primary/50 bg-primary/10 text-foreground"
                        : "hover:border-ring/40 hover:bg-muted/60",
                    )}
                  >
                    <SlidersHorizontal size={16} aria-hidden="true" />

                    <span>Filters</span>

                    {activeFilterCount > 0 && (
                      <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {activeFilterCount}
                      </span>
                    )}

                    <ChevronDown
                      size={14}
                      aria-hidden="true"
                      className={cn(
                        "transition-transform duration-150",
                        filtersOpen && "rotate-180",
                      )}
                    />
                  </button>

                  {/* Filter panel */}
                  {filtersOpen && (
                    <div
                      id="wiki-filter-panel"
                      className={cn(
                        "absolute right-0 top-[calc(100%+0.6rem)]",
                        "z-[100] w-[min(22rem,calc(100vw-2rem))]",
                        "overflow-hidden rounded-2xl",
                        "border border-border/80",
                        "bg-background/98",
                        "shadow-2xl shadow-black/25",
                        "ring-1 ring-black/10",
                        "backdrop-blur-xl",
                      )}
                    >
                      <div className="border-b border-border/70 bg-muted/20 px-4 py-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h2 className="text-sm font-semibold text-foreground">Filters</h2>

                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                              Narrow down the Wiki results.
                            </p>
                          </div>

                          {activeFilterCount > 0 && (
                            <button
                              type="button"
                              onClick={clearFilters}
                              className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="p-4">
                        <div>
                          <div className="mb-2.5 flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                              Rarity
                            </p>

                            <span className="text-[11px] text-muted-foreground/70">
                              {RARITIES.length} options
                            </span>
                          </div>

                          <div className="grid grid-cols-1 gap-1.5">
                            {RARITIES.map((rarity) => {
                              const active = selectedRarity === rarity;

                              const count = rarityCounts[rarity] ?? 0;

                              const unavailable = count === 0;

                              const meta = rarityMeta(rarity);

                              return (
                                <button
                                  key={rarity}
                                  type="button"
                                  disabled={unavailable}
                                  onClick={() => setSelectedRarity(active ? null : rarity)}
                                  className={cn(
                                    "group flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm",
                                    "transition-all duration-150",
                                    active
                                      ? "border-primary/40 bg-primary/10 text-foreground shadow-sm"
                                      : unavailable
                                        ? "cursor-not-allowed border-transparent text-muted-foreground/40"
                                        : "border-transparent text-muted-foreground hover:border-border/70 hover:bg-muted/60 hover:text-foreground",
                                  )}
                                >
                                  <div className="flex min-w-0 items-center gap-2.5">
                                    <span
                                      className={cn(
                                        "size-2 shrink-0 rounded-full",
                                        meta.dotClassName,
                                        unavailable && "opacity-30",
                                      )}
                                    />

                                    <span className={cn("font-medium", active && meta.className)}>
                                      {meta.label}
                                    </span>
                                  </div>

                                  <div className="ml-3 flex shrink-0 items-center gap-2">
                                    <span
                                      className={cn(
                                        "text-xs tabular-nums",
                                        active
                                          ? "text-primary"
                                          : unavailable
                                            ? "text-muted-foreground/30"
                                            : "text-muted-foreground/70",
                                      )}
                                    >
                                      {count.toLocaleString()}
                                    </span>

                                    {active && (
                                      <Check
                                        size={15}
                                        aria-hidden="true"
                                        className="text-primary"
                                      />
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-border/70 bg-muted/20 px-4 py-3">
                        <p className="text-xs text-muted-foreground">
                          {selectedRarity
                            ? `Showing ${rarityMeta(selectedRarity).label} items.`
                            : "Select a rarity to filter the results."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Category navigation */}
            <div className="border-t border-border/50 px-3 py-2.5 sm:px-4">
              <div
                className={cn(
                  "overflow-x-auto overflow-y-hidden",
                  "[scrollbar-width:none]",
                  "[&::-webkit-scrollbar]:hidden",
                )}
              >
                <div className="flex min-w-max items-center gap-1.5">
                  {categories.map((category) => {
                    const active = selectedCategory === category;

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setSelectedCategory(category)}
                        className={cn(
                          "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium",
                          "transition-all duration-150",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                          active
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                        )}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Results toolbar */}
        <div className="relative z-10 mb-4 flex min-h-8 items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {filteredItems.length.toLocaleString()}
              </span>{" "}
              {filteredItems.length === 1 ? "result" : "results"}
            </p>

            {hasMoreResults && (
              <p className="mt-0.5 text-xs text-muted-foreground/70">
                Showing {renderedItems.length.toLocaleString()} of{" "}
                {filteredItems.length.toLocaleString()} results
              </p>
            )}
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="shrink-0 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Results + built-in detail card */}
        {filteredItems.length === 0 ? (
          <>
            <WikiEmptyState hasFilters={hasFilters} search={search} onClear={clearAll} />

            {footer}
          </>
        ) : selectedItem ? (
          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
            {/* Results column — shrinks while the detail card is open */}
            <div className="min-w-0">
              <WikiItemGrid
                items={renderedItems}
                onItemClick={onItemClick}
                selectedId={selectedId ?? null}
                hasPanel
              />

              {hasMoreResults && loadMoreBlock}
              {footer}
            </div>

            {/* Built-in detail card — sticky, non-modal, page stays interactive */}
            <aside className="order-first min-w-0 xl:order-none xl:sticky xl:top-24">
              <WikiItemDetailCard
                key={selectedItem.id}
                item={selectedItem}
                price={selectedPrice}
                onClose={() => onSelect?.(null)}
              />
            </aside>
          </div>
        ) : (
          <>
            <WikiItemGrid
              items={renderedItems}
              onItemClick={onItemClick}
              selectedId={selectedId ?? null}
            />

            {hasMoreResults && loadMoreBlock}
            {footer}
          </>
        )}

        {typeof itemCount === "number" && (
          <p className="mt-8 text-center text-xs text-muted-foreground/70">
            Indexing {itemCount.toLocaleString()} wiki entries.
          </p>
        )}
      </div>
    </main>
  );
}

/* ============================================================================
 * ITEM DETAIL CARD (built-in, non-modal)
 * ========================================================================== */

const RARITY_GLOW: Record<string, string> = {
  COMMON: "from-slate-400/20",
  UNCOMMON: "from-green-400/20",
  RARE: "from-blue-400/25",
  EPIC: "from-purple-400/25",
  LEGENDARY: "from-yellow-400/25",
  MYTHIC: "from-pink-400/25",
  DIVINE: "from-cyan-300/25",
  SPECIAL: "from-red-400/25",
  "VERY SPECIAL": "from-red-300/25",
};

const PRICE_TONES = {
  buy: "border-sky-400/25 bg-sky-400/10 text-sky-300",
  sell: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  bin: "border-amber-400/25 bg-amber-400/10 text-amber-300",
  npc: "border-purple-400/25 bg-purple-400/10 text-purple-300",
} as const;

const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});

function formatCompact(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) {
    return "—";
  }

  return compactFormatter.format(value);
}

function DetailSection({
  icon: Icon,
  title,
  hint,
  children,
}: {
  icon: typeof Coins;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        <Icon size={12} aria-hidden="true" className="text-primary/70" />
        {title}
        {hint ? (
          <span className="ml-auto text-[10px] font-medium normal-case tracking-normal text-muted-foreground/50">
            {hint}
          </span>
        ) : null}
      </h3>

      {children}
    </section>
  );
}

function PriceTile({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number | null;
  icon: typeof Coins;
  tone: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-2.5 transition-colors",
        value != null ? tone : "border-white/10 bg-black/20 text-muted-foreground",
      )}
    >
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider opacity-80">
        <Icon size={11} aria-hidden="true" />
        {label}
      </div>

      <p className="mt-1.5 font-mono text-base font-bold leading-none">{formatCompact(value)}</p>
    </div>
  );
}

function WikiItemDetailCard({
  item,
  price,
  onClose,
}: {
  item: WikiItem;
  price: WikiSelectedPrice | undefined;
  onClose: () => void;
}) {
  const meta = rarityMeta(item.rarity);
  const glow = RARITY_GLOW[normalizeRarity(item.rarity)] ?? "from-primary/20";
  const allStats = Object.entries(item.stats ?? {}).filter(([, value]) => Number.isFinite(value));
  const maxStat = Math.max(1, ...allStats.map(([, value]) => Math.abs(value)));
  const description = normalizeDescription(item.description);
  const lore = (item.lore ?? []).filter(Boolean);
  const abilities = item.abilities ?? [];
  const requirements = item.requirements ?? [];
  const recipeIngredients = item.recipe?.ingredients ?? [];
  const outputAmount = item.recipe?.outputAmount ?? 1;
  const obtainedFrom = item.obtainedFrom ?? [];
  const enchantments = item.enchantments ?? [];
  const reforges = item.reforges ?? [];
  const upgradePath = item.upgradePath ?? [];

  // Esc closes the card without leaving the page.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Full encyclopedia entry: recipe grid, wiki link, "used to craft".
  const detailQuery = useQuery({
    queryKey: ["item-detail", item.id],
    queryFn: () => fetchItemDetail({ data: item.id }),
    staleTime: 30 * 60_000,
  });

  const extra = detailQuery.data?.extra ?? null;
  const usedIn = detailQuery.data?.usedIn ?? [];
  const wikiUrl = item.wikiUrl ?? extra?.wikiUrl ?? null;

  // Visual 3x3 crafting grid from NEU data (same source as the detail page).
  const gridCells = useMemo(() => {
    const grid = extra?.grid;

    if (!grid) {
      return null;
    }

    return ["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3"].map((slot) => {
      const raw = grid[slot];

      if (typeof raw !== "string" || !raw) {
        return null;
      }

      const [id, amountRaw] = raw.split(":");

      return id ? { id, amount: Number(amountRaw ?? 1) || 1 } : null;
    });
  }, [extra]);

  const bazaarBuy = price?.buyPrice ?? item.bazaar?.buyPrice ?? null;
  const bazaarSell = price?.sellPrice ?? item.bazaar?.sellPrice ?? null;
  const buyVolume = price?.buyVolume ?? item.bazaar?.buyVolume ?? 0;
  const sellVolume = price?.sellVolume ?? item.bazaar?.sellVolume ?? 0;
  const weeklyVolume = buyVolume + sellVolume;
  const maxVolume = Math.max(buyVolume, sellVolume, 1);
  const spread = bazaarBuy != null && bazaarSell != null ? bazaarBuy - bazaarSell : null;
  const marginPct = spread != null && bazaarBuy ? (spread / bazaarBuy) * 100 : null;
  const lowestBin = item.auctionHouse?.lowestBin ?? null;
  const averageBin = item.auctionHouse?.averageBin ?? null;
  const npcSell = typeof item.npcSell === "number" && item.npcSell > 0 ? item.npcSell : null;

  const bestPrice =
    [bazaarBuy, lowestBin, npcSell]
      .filter((value): value is number => value != null && value > 0)
      .sort((a, b) => b - a)[0] ?? null;

  const hasMarket =
    bazaarBuy != null || bazaarSell != null || item.auctionHouse != null || npcSell != null;

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl border",
        "border-border/70 shadow-xl backdrop-blur-md",
        "xl:max-h-[calc(100vh-7rem)]",
      )}
    >
      {/* Darkened translucent backdrop — readable, page still shows through */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-zinc-950/80" />

      <div className="relative flex min-h-0 flex-1 flex-col">
        {/* Header */}
        <header
          className={cn(
            "relative shrink-0 border-b border-white/10 p-4",
            "bg-gradient-to-br to-transparent",
            glow,
          )}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className={cn(
              "absolute right-2.5 top-2.5 z-10 flex size-8 items-center justify-center rounded-lg",
              "text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground",
            )}
          >
            <X size={16} aria-hidden="true" />
          </button>

          <div className="flex items-center gap-3.5 pr-9">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/30">
              <WikiItemIcon
                id={item.id}
                name={item.name}
                category={item.category}
                {...(item.icon !== undefined ? { icon: item.icon } : {})}
                {...(item.material !== undefined ? { material: item.material } : {})}
                className="size-11"
              />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-black leading-tight text-white">{item.name}</h2>

              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span
                  className={cn(
                    "rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    meta.badgeClassName,
                  )}
                >
                  {meta.label}
                </span>

                <span className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-white/60">
                  {item.category}
                </span>

                {wikiUrl ? (
                  <a
                    href={wikiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-white/50 transition hover:text-white"
                  >
                    Wiki ↗
                  </a>
                ) : null}
              </div>

              <p className="mt-1 truncate font-mono text-[10px] text-white/30">{item.id}</p>
            </div>
          </div>
        </header>

        {/* Quick-glance strip */}
        <div className="grid shrink-0 grid-cols-4 divide-x divide-white/10 border-b border-white/10 bg-black/25">
          {[
            {
              label: "Top price",
              value: formatCompact(bestPrice),
              icon: Coins,
              tone: "text-amber-300",
            },
            {
              label: "Orders/wk",
              value: weeklyVolume > 0 ? formatCompact(weeklyVolume) : "—",
              icon: TrendingUp,
              tone: "text-sky-300",
            },
            {
              label: "Listings",
              value: item.auctionHouse ? String(item.auctionHouse.listings) : "—",
              icon: Tag,
              tone: "text-purple-300",
            },
            {
              label: "Museum",
              value: item.museumValue != null ? formatCompact(item.museumValue) : "—",
              icon: Gem,
              tone: "text-pink-300",
            },
          ].map((tile) => (
            <div key={tile.label} className="px-2 py-2.5 text-center">
              <tile.icon size={13} aria-hidden="true" className={cn("mx-auto", tile.tone)} />
              <p className="mt-1 font-mono text-sm font-bold leading-none text-white">
                {tile.value}
              </p>
              <p className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {tile.label}
              </p>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
          {/* Market */}
          <DetailSection icon={Coins} title="Market">
            <div className="grid grid-cols-2 gap-2">
              <PriceTile
                label="Bazaar buy"
                value={bazaarBuy}
                icon={ShoppingCart}
                tone={PRICE_TONES.buy}
              />
              <PriceTile
                label="Bazaar sell"
                value={bazaarSell}
                icon={Store}
                tone={PRICE_TONES.sell}
              />
              <PriceTile label="Lowest BIN" value={lowestBin} icon={Tag} tone={PRICE_TONES.bin} />
              <PriceTile label="NPC sell" value={npcSell} icon={Coins} tone={PRICE_TONES.npc} />
            </div>

            {bazaarBuy != null && bazaarSell != null && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-white/10 bg-black/25 px-2.5 py-1.5">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    Buy→sell spread
                  </p>
                  <p className="mt-0.5 font-mono text-sm font-bold text-orange-300">
                    {formatCompact(spread)}
                  </p>
                </div>

                <div className="rounded-lg border border-white/10 bg-black/25 px-2.5 py-1.5">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    Flip margin
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 font-mono text-sm font-bold",
                      (marginPct ?? 0) >= 0 ? "text-emerald-300" : "text-red-300",
                    )}
                  >
                    {marginPct != null ? `${marginPct.toFixed(1)}%` : "—"}
                  </p>
                </div>
              </div>
            )}

            {weeklyVolume > 0 && (
              <div className="mt-2 space-y-1.5 rounded-lg border border-white/10 bg-black/25 p-2.5">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Weekly orders
                </p>

                {[
                  { label: "Buy", value: buyVolume, bar: "bg-sky-400" },
                  { label: "Sell", value: sellVolume, bar: "bg-emerald-400" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-2">
                    <span className="w-7 text-[10px] text-muted-foreground/70">{row.label}</span>

                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                      <div
                        className={cn("h-full rounded-full", row.bar)}
                        style={{ width: `${Math.max(2, (row.value / maxVolume) * 100)}%` }}
                      />
                    </div>

                    <span className="w-12 text-right font-mono text-[10px] text-muted-foreground">
                      {formatCompact(row.value)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {averageBin != null && (
              <p className="mt-2 text-[11px] text-muted-foreground/60">
                Average BIN:{" "}
                <span className="font-mono font-semibold text-foreground/80">
                  {formatCompact(averageBin)}
                </span>
              </p>
            )}

            {!hasMarket && (
              <p className="rounded-lg border border-dashed border-white/10 bg-black/20 p-3 text-xs text-muted-foreground/60">
                Not traded on the Bazaar or Auction House.
              </p>
            )}
          </DetailSection>

          {/* Stats */}
          {allStats.length > 0 && (
            <DetailSection icon={BarChart3} title="Stats" hint={`${allStats.length} tracked`}>
              <ul className="space-y-2.5">
                {allStats.map(([name, value]) => {
                  const pct = Math.max(3, (Math.abs(value) / maxStat) * 100);

                  return (
                    <li key={name}>
                      <div className="flex items-baseline justify-between gap-2 text-xs">
                        <span className="capitalize text-muted-foreground/80">
                          {name.replace(/_/g, " ")}
                        </span>

                        <span className="font-mono font-bold text-foreground">
                          {formatStatValue(value)}
                        </span>
                      </div>

                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary/50 to-primary"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </DetailSection>
          )}

          {/* Abilities */}
          {abilities.length > 0 && (
            <DetailSection icon={Sparkles} title="Abilities">
              <div className="space-y-2">
                {abilities.map((ability, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-black/25 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{ability.name}</span>

                      {ability.manaCost ? (
                        <span className="rounded-full bg-sky-400/15 px-2 py-0.5 text-[10px] font-bold text-sky-300">
                          {ability.manaCost} Mana
                        </span>
                      ) : null}

                      {ability.cooldown ? (
                        <span className="rounded-full bg-orange-400/15 px-2 py-0.5 text-[10px] font-bold text-orange-300">
                          {ability.cooldown}s CD
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {normalizeDescription(ability.description)}
                    </p>
                  </div>
                ))}
              </div>
            </DetailSection>
          )}

          {/* Requirements */}
          {requirements.length > 0 && (
            <DetailSection icon={Lock} title="Requirements">
              <div className="flex flex-wrap gap-1.5">
                {requirements.map((req, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-lg border border-orange-400/25 bg-orange-400/10 px-2 py-1 text-[11px] font-semibold text-orange-300"
                  >
                    <Lock size={10} aria-hidden="true" />
                    {req.type}
                    {req.level != null ? ` ${req.level}` : ""}
                    {req.value ? `: ${req.value}` : ""}
                  </span>
                ))}
              </div>
            </DetailSection>
          )}

          {/* Crafting */}
          {(gridCells || recipeIngredients.length > 0) && (
            <DetailSection icon={Hammer} title="Crafting">
              {gridCells ? (
                <div className="flex items-center gap-2.5">
                  <div className="grid shrink-0 grid-cols-3 gap-1 rounded-xl border border-white/10 bg-black/40 p-1.5">
                    {gridCells.map((cell, i) => (
                      <div
                        key={i}
                        className="relative flex size-10 items-center justify-center rounded-md border border-white/5 bg-white/5"
                      >
                        {cell ? (
                          <Link
                            to="/wiki/$itemId"
                            params={{ itemId: cell.id }}
                            title={titleCase(cell.id)}
                          >
                            <WikiItemIcon
                              id={cell.id}
                              name={titleCase(cell.id)}
                              category={item.category}
                              className="size-8"
                            />
                          </Link>
                        ) : null}

                        {cell && cell.amount > 1 ? (
                          <span className="absolute bottom-0 right-0.5 font-mono text-[9px] font-bold text-white drop-shadow">
                            {cell.amount}
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>

                  <ArrowRight
                    size={16}
                    aria-hidden="true"
                    className="shrink-0 text-muted-foreground"
                  />

                  <div className="flex flex-col items-center gap-0.5 rounded-xl border border-primary/30 bg-primary/10 p-1.5">
                    <WikiItemIcon
                      id={item.id}
                      name={item.name}
                      category={item.category}
                      {...(item.icon !== undefined ? { icon: item.icon } : {})}
                      {...(item.material !== undefined ? { material: item.material } : {})}
                      className="size-10"
                    />
                    {outputAmount > 1 ? (
                      <span className="font-mono text-[10px] font-bold text-primary">
                        ×{outputAmount}
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : recipeIngredients.length > 0 ? (
                <ul className="space-y-1">
                  {recipeIngredients.map((ing) => (
                    <li key={ing.id}>
                      <Link
                        to="/wiki/$itemId"
                        params={{ itemId: ing.id }}
                        className="flex items-center gap-2 rounded-lg border border-transparent px-1.5 py-1 text-sm transition hover:border-white/10 hover:bg-white/5"
                      >
                        <WikiItemIcon
                          id={ing.id}
                          name={ing.name}
                          category={item.category}
                          className="size-6 shrink-0"
                        />
                        <span className="min-w-0 flex-1 truncate text-foreground/80">
                          {ing.name}
                        </span>
                        <span className="shrink-0 font-mono text-xs font-bold text-primary">
                          ×{ing.amount}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </DetailSection>
          )}

          {/* Used to craft */}
          {usedIn.length > 0 && (
            <DetailSection icon={Boxes} title="Used to craft" hint={`${usedIn.length} recipes`}>
              <ul className="max-h-52 space-y-1 overflow-y-auto pr-1 text-sm">
                {usedIn.map((entry) => (
                  <li key={entry.id}>
                    <Link
                      to="/wiki/$itemId"
                      params={{ itemId: entry.id }}
                      className="flex items-center gap-2 rounded-lg border border-transparent px-1.5 py-1 transition hover:border-white/10 hover:bg-white/5"
                    >
                      <WikiItemIcon
                        id={entry.id}
                        name={entry.name}
                        category={item.category}
                        className="size-6 shrink-0"
                      />
                      <span className="min-w-0 flex-1 truncate text-foreground/80">
                        {entry.name}
                      </span>
                      <span className="shrink-0 rounded-md bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary">
                        ×{entry.amount}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </DetailSection>
          )}

          {/* Sources */}
          {(item.collection || item.minionSource || item.npcSource || obtainedFrom.length > 0) && (
            <DetailSection icon={MapPin} title="How to get">
              <div className="space-y-1.5">
                {item.collection ? (
                  <p className="flex items-center gap-2 rounded-lg bg-black/25 px-2.5 py-1.5 text-xs text-muted-foreground">
                    <Trophy size={12} aria-hidden="true" className="shrink-0 text-yellow-300" />
                    <span>
                      Collection:{" "}
                      <span className="font-semibold text-foreground/80">{item.collection}</span>
                    </span>
                  </p>
                ) : null}

                {item.minionSource ? (
                  <p className="flex items-center gap-2 rounded-lg bg-black/25 px-2.5 py-1.5 text-xs text-muted-foreground">
                    <Bot size={12} aria-hidden="true" className="shrink-0 text-cyan-300" />
                    <span>
                      Minion:{" "}
                      <span className="font-semibold text-foreground/80">{item.minionSource}</span>
                    </span>
                  </p>
                ) : null}

                {item.npcSource ? (
                  <p className="flex items-center gap-2 rounded-lg bg-black/25 px-2.5 py-1.5 text-xs text-muted-foreground">
                    <Store size={12} aria-hidden="true" className="shrink-0 text-emerald-300" />
                    <span>
                      NPC:{" "}
                      <span className="font-semibold text-foreground/80">{item.npcSource}</span>
                    </span>
                  </p>
                ) : null}

                {obtainedFrom.length > 0 ? (
                  <p className="flex flex-wrap items-center gap-1.5 rounded-lg bg-black/25 px-2.5 py-1.5 text-xs text-muted-foreground">
                    <MapPin size={12} aria-hidden="true" className="shrink-0 text-pink-300" />
                    {obtainedFrom.slice(0, 4).map((source) => (
                      <span
                        key={source}
                        className="rounded-md bg-white/5 px-1.5 py-0.5 text-[11px] text-foreground/70"
                      >
                        {source}
                      </span>
                    ))}
                  </p>
                ) : null}
              </div>
            </DetailSection>
          )}

          {/* Upgrade path */}
          {upgradePath.length > 0 && (
            <DetailSection icon={TrendingUp} title="Upgrade path">
              <div className="flex flex-wrap items-center gap-1">
                {upgradePath.map((step, i) => (
                  <span key={step + String(i)} className="flex items-center gap-1">
                    <code className="rounded-md border border-white/10 bg-black/30 px-1.5 py-0.5 font-mono text-[10px] text-foreground/80">
                      {step}
                    </code>
                    {i < upgradePath.length - 1 ? (
                      <ArrowRight
                        size={11}
                        aria-hidden="true"
                        className="text-muted-foreground/50"
                      />
                    ) : null}
                  </span>
                ))}
              </div>
            </DetailSection>
          )}

          {/* Enchantments & reforges */}
          {(enchantments.length > 0 || reforges.length > 0) && (
            <DetailSection icon={Gem} title="Enchants & reforges">
              <div className="space-y-2">
                {enchantments.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {enchantments.slice(0, 10).map((ench) => (
                      <span
                        key={ench}
                        className="rounded-md border border-sky-400/20 bg-sky-400/10 px-1.5 py-0.5 text-[10px] font-medium text-sky-300"
                      >
                        {ench}
                      </span>
                    ))}
                  </div>
                ) : null}

                {reforges.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {reforges.slice(0, 10).map((reforge) => (
                      <span
                        key={reforge}
                        className="rounded-md border border-purple-400/20 bg-purple-400/10 px-1.5 py-0.5 text-[10px] font-medium text-purple-300"
                      >
                        {reforge}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </DetailSection>
          )}

          {/* Minecraft tooltip lore */}
          {lore.length > 0 && (
            <DetailSection icon={ScrollText} title="Tooltip">
              <div className="rounded-xl border border-slate-700/60 bg-slate-950/90 p-3 font-mono text-[13px] leading-5 text-slate-200">
                {lore.map((line, i) => (
                  <p key={i} className={i === 0 ? "text-white" : undefined}>
                    {line}
                  </p>
                ))}
              </div>
            </DetailSection>
          )}

          {/* Description */}
          {description && (
            <DetailSection icon={BookOpen} title="Description">
              <p className="text-sm leading-6 text-muted-foreground">{description}</p>
            </DetailSection>
          )}
        </div>

        {/* Footer */}
        <footer className="shrink-0 border-t border-white/10 p-3">
          <div className="flex gap-2">
            <Link
              to="/wiki/$itemId"
              params={{ itemId: item.id }}
              className={cn(
                "flex h-10 flex-1 items-center justify-center gap-2 rounded-xl",
                "border border-primary/40 bg-primary/15 text-sm font-medium text-primary",
                "transition-all hover:bg-primary/25",
              )}
            >
              Open full page
              <ChevronRight size={15} aria-hidden="true" />
            </Link>

            {wikiUrl ? (
              <a
                href={wikiUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Official wiki"
                className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground transition hover:text-foreground"
              >
                <ExternalLink size={15} aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ============================================================================
 * ITEM GRID
 * ========================================================================== */

function WikiItemGrid({
  items,
  onItemClick,
  selectedId = null,
  hasPanel = false,
}: {
  items: WikiItem[];
  onItemClick?: ((item: WikiItem) => void) | undefined;
  selectedId?: string | null;
  hasPanel?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid gap-3",
        "grid-cols-1",
        "sm:grid-cols-2",
        hasPanel ? "xl:grid-cols-2 2xl:grid-cols-3" : "xl:grid-cols-3 2xl:grid-cols-4",
      )}
    >
      {items.map((item) => (
        <WikiItemCard
          key={item.id}
          item={item}
          selected={item.id === selectedId}
          onClick={() => onItemClick?.(item)}
        />
      ))}
    </div>
  );
}

/* ============================================================================
 * ITEM CARD
 * ========================================================================== */

const WikiItemCard = memo(function WikiItemCard({
  item,
  selected,
  onClick,
}: {
  item: WikiItem;
  selected: boolean;
  onClick: () => void;
}) {
  const meta = rarityMeta(item.rarity);
  const stats = getStatEntries(item.stats);
  const description = normalizeDescription(item.description);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex min-h-[124px] w-full gap-3 overflow-hidden rounded-2xl border",
        "border-border/70 bg-card/90 p-3 text-left shadow-sm",
        "transition-all duration-200",
        selected
          ? "border-primary/50 ring-1 ring-primary/30"
          : "hover:-translate-y-0.5 hover:border-primary/35 hover:bg-card hover:shadow-lg",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
      )}
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: "124px",
      }}
    >
      {/* Rarity accent */}
      <div className={cn("absolute inset-y-0 left-0 w-0.5 opacity-60", meta.dotClassName)} />

      {/* Item icon */}
      <div
        className={cn(
          "relative flex size-[52px] shrink-0 items-center justify-center",
          "rounded-xl border border-border/60 bg-muted/30",
          "transition-all duration-200",
          "group-hover:border-primary/20 group-hover:bg-muted/50",
        )}
      >
        <WikiItemIcon
          id={item.id}
          name={item.name}
          category={item.category}
          {...(item.icon !== undefined ? { icon: item.icon } : {})}
          {...(item.material !== undefined ? { material: item.material } : {})}
          className="size-10"
        />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Title + rarity */}
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <h2
              className={cn(
                "truncate font-semibold leading-5 text-foreground",
                "transition-colors group-hover:text-primary",
              )}
            >
              {item.name}
            </h2>

            <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground/60">
              {item.id}
            </p>
          </div>

          <span
            className={cn(
              "shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              meta.badgeClassName,
            )}
          >
            {meta.label}
          </span>
        </div>

        {/* Category */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">{item.category}</span>

          {item.material && (
            <>
              <span className="text-muted-foreground/30">•</span>

              <span className="truncate text-xs text-muted-foreground/60">{item.material}</span>
            </>
          )}
        </div>

        {/* Stats */}
        {stats.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
            {stats.map(([statName, value]) => (
              <div key={statName} className="flex items-center gap-1 text-[11px]">
                <span className="text-muted-foreground">{statName}</span>

                <span className="font-semibold text-foreground">{formatStatValue(value)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Description */}
        {description && stats.length === 0 && (
          <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted-foreground">{description}</p>
        )}

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
            {item.abilities && item.abilities.length > 0 && (
              <>
                <BarChart3 size={11} aria-hidden="true" />

                <span>
                  {item.abilities.length} {item.abilities.length === 1 ? "ability" : "abilities"}
                </span>
              </>
            )}
          </div>

          <ChevronRight
            size={15}
            aria-hidden="true"
            className="shrink-0 text-muted-foreground/40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
          />
        </div>
      </div>
    </button>
  );
});

/* ============================================================================
 * EMPTY STATE
 * ========================================================================== */

function WikiEmptyState({
  hasFilters,
  search,
  onClear,
}: {
  hasFilters: boolean;
  search: string;
  onClear: () => void;
}) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/40 px-6 text-center">
      <div className="mb-5 flex size-16 items-center justify-center rounded-2xl border border-border/70 bg-muted/40 shadow-sm">
        <Search aria-hidden="true" size={26} className="text-muted-foreground" />
      </div>

      <h2 className="text-lg font-semibold text-foreground">
        {hasFilters ? "No matching items" : "No wiki data available"}
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {hasFilters
          ? search
            ? `Nothing matched "${search}". Try a different search or filter.`
            : "No items match the current filters. Try broadening your selection."
          : "There are currently no Wiki entries available."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:opacity-90"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
