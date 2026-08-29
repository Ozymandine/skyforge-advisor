// src/routes/crafting.tsx
// Crafting cost calculator — compares the coin cost of crafting an item from
// its recipe against buying it directly, pricing every ingredient from live
// Bazaar / Auction House / NPC data.

import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ChevronDown, Hammer, Layers, Search, ShoppingCart } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHero, Panel, ProgressBar } from "@/components/layout/app-shell";
import { ErrorState, LoadState } from "@/components/data-states";
import { ItemIcon } from "@/components/ui/item-icon";
import { fetchBazaar, fetchItems } from "@/lib/hypixel.functions";
import { formatNumber, titleCase, type LiveItem } from "@/lib/skyblock";
import {
  buildCraftTree,
  collectLeaves,
  leafCount,
  treeCost,
  type CraftNode,
  type PriceSource,
  type RecipeIndex,
} from "@/lib/crafting-tree";

export const Route = createFileRoute("/crafting")({
  head: () => ({
    meta: [
      { title: "Crafting Calculator — SkyBlock Assistant" },
      {
        name: "description",
        content: "Compare crafting costs against market prices for any craftable item.",
      },
      { property: "og:title", content: "Crafting Calculator — SkyBlock Assistant" },
      {
        property: "og:description",
        content: "Craft it or buy it? Live cost analysis for every recipe.",
      },
    ],
  }),
  component: CraftingPage,
});

type PricedIngredient = {
  id: string;
  name: string;
  amount: number;
  unitPrice: number | null;
  source: "bazaar" | "auction" | "npc" | "craft" | "unknown";
};

function CraftingPage() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const itemsQuery = useQuery({
    queryKey: ["items"],
    queryFn: () => fetchItems(),
    staleTime: 10 * 60_000,
  });
  const bazaarQuery = useQuery({
    queryKey: ["bazaar"],
    queryFn: () => fetchBazaar(),
    staleTime: 60_000,
  });

  const rawItems = itemsQuery.data;
  const items = useMemo(() => rawItems ?? [], [rawItems]);
  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);

  const bazaarPrices = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of bazaarQuery.data?.products ?? []) {
      if (p.buyPrice > 0) map.set(p.id, p.buyPrice);
    }
    return map;
  }, [bazaarQuery.data]);

  /** Best known purchase price for an item id. */
  const buyPriceOf = (
    item: LiveItem,
  ): { price: number | null; source: PricedIngredient["source"] } => {
    if (bazaarPrices.has(item.id)) return { price: bazaarPrices.get(item.id)!, source: "bazaar" };
    if (item.auctionHouse?.lowestBin)
      return { price: item.auctionHouse.lowestBin, source: "auction" };
    if (item.npcSell && item.npcSell > 0) return { price: item.npcSell, source: "npc" };
    return { price: null, source: "unknown" };
  };

  /** Craft cost of an item's recipe, recursing one level into unpriced ingredients. */
  const craftCostOf = (item: LiveItem, depth = 0): number | null => {
    if (!item.recipe?.ingredients?.length) return null;
    let total = 0;
    for (const ing of item.recipe.ingredients) {
      const ingItem = byId.get(ing.id);
      let unit: number | null = null;
      let source: PricedIngredient["source"] = "unknown";

      if (ingItem) {
        const direct = buyPriceOf(ingItem);
        if (direct.price !== null) {
          unit = direct.price;
          source = direct.source;
        } else if (depth < 1 && ingItem.recipe) {
          const sub = craftCostOf(ingItem, depth + 1);
          if (sub !== null) {
            unit = sub;
            source = "craft";
          }
        }
      }
      if (unit === null) return null; // can't fully price this recipe
      total += unit * ing.amount;
    }
    return total;
  };

  const selected = selectedId ? (byId.get(selectedId) ?? null) : null;

  const ingredients: PricedIngredient[] = useMemo(() => {
    if (!selected?.recipe?.ingredients?.length) return [];
    return selected.recipe.ingredients.map((ing) => {
      const ingItem = byId.get(ing.id);
      if (!ingItem) {
        return {
          id: ing.id,
          name: ing.name || titleCase(ing.id),
          amount: ing.amount,
          unitPrice: null,
          source: "unknown",
        };
      }
      const direct = buyPriceOf(ingItem);
      if (direct.price !== null) {
        return {
          id: ing.id,
          name: ingItem.name,
          amount: ing.amount,
          unitPrice: direct.price,
          source: direct.source,
        };
      }
      const sub = craftCostOf(ingItem, 1);
      if (sub !== null) {
        return {
          id: ing.id,
          name: ingItem.name,
          amount: ing.amount,
          unitPrice: sub,
          source: "craft",
        };
      }
      return {
        id: ing.id,
        name: ingItem.name,
        amount: ing.amount,
        unitPrice: null,
        source: "unknown",
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, byId, bazaarPrices]);

  const craftTotal = ingredients.every((i) => i.unitPrice !== null)
    ? ingredients.reduce((sum, i) => sum + i.unitPrice! * i.amount, 0)
    : null;

  const buyOption = selected ? buyPriceOf(selected) : null;
  const verdict =
    craftTotal !== null && buyOption?.price
      ? craftTotal < buyOption.price
        ? "craft"
        : craftTotal > buyOption.price
          ? "buy"
          : "tie"
      : null;
  const savings =
    verdict && craftTotal !== null && buyOption?.price
      ? Math.abs(buyOption.price - craftTotal)
      : null;

  // Craftable items matching the search box.
  const craftable = useMemo(() => {
    const q = query.toLowerCase();
    return items
      .filter((i) => i.recipe?.ingredients?.length)
      .filter((i) => !q || i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q))
      .slice(0, 40);
  }, [items, query]);

  const maxBar = Math.max(craftTotal ?? 0, buyOption?.price ?? 0, 1);

  // Full dependency tree: every ingredient expanded until raw materials.
  const recipeIndex: RecipeIndex = useMemo(() => {
    const index: RecipeIndex = {};
    for (const item of items) {
      if (item.recipe?.ingredients?.length) {
        index[item.id] = item.recipe.ingredients.map((ing) => ({
          id: ing.id,
          amount: ing.amount,
        }));
      }
    }
    return index;
  }, [items]);

  const tree = useMemo(() => {
    if (!selected) return null;
    return buildCraftTree(selected.id, 1, {
      recipes: recipeIndex,
      names: new Map(items.map((i) => [i.id, i.name])),
      priceOf: (id: string): { price: number | null; source: PriceSource } => {
        const item = byId.get(id);
        if (!item) return { price: null, source: "unknown" };
        const direct = buyPriceOf(item);
        return { price: direct.price, source: direct.source as PriceSource };
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, recipeIndex, byId, bazaarPrices]);

  const leaves = tree ? collectLeaves(tree) : [];
  const treeTotal = treeCost(tree);
  const rawCount = leafCount(tree);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHero
        eyebrow="Tools"
        title="Crafting Calculator"
        description="Craft it or buy it? Every ingredient priced against live Bazaar, Auction House and NPC data."
      />

      {itemsQuery.isLoading && <LoadState>Loading item registry…</LoadState>}
      {itemsQuery.error && <ErrorState error={itemsQuery.error as Error} />}

      {items.length > 0 && (
        <>
          <Panel>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-md">
              <Search className="size-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${formatNumber(items.filter((i) => i.recipe?.ingredients?.length).length)} craftable items…`}
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            {query && (
              <ul className="mt-3 max-h-72 space-y-1 overflow-y-auto scroll-slim">
                {craftable.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setSelectedId(item.id);
                        setQuery("");
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-white/10"
                    >
                      <ItemIcon id={item.id} name={item.name} className="size-6 shrink-0" />
                      <span className="min-w-0 flex-1 truncate">{item.name}</span>
                      <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                        {item.id}
                      </span>
                    </button>
                  </li>
                ))}
                {craftable.length === 0 && (
                  <li className="px-3 py-4 text-center text-sm text-muted-foreground">
                    No craftable items match that search.
                  </li>
                )}
              </ul>
            )}
          </Panel>

          {selected && (
            <>
              {/* Verdict card */}
              <Panel
                className={
                  verdict === "craft"
                    ? "border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 to-transparent"
                    : verdict === "buy"
                      ? "border-cyan-500/40 bg-gradient-to-r from-cyan-500/10 to-transparent"
                      : ""
                }
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-black/40">
                      <ItemIcon id={selected.id} name={selected.name} className="size-10" />
                    </div>
                    <div>
                      <p className="eyebrow">Verdict</p>
                      <p className="mt-1 flex items-center gap-2 text-2xl font-bold">
                        {verdict === "craft" && (
                          <>
                            <Hammer className="size-6 text-emerald-400" /> Craft it
                          </>
                        )}
                        {verdict === "buy" && (
                          <>
                            <ShoppingCart className="size-6 text-cyan-300" /> Buy it
                          </>
                        )}
                        {verdict === "tie" && "Even either way"}
                        {!verdict && "Incomplete data"}
                      </p>
                      {savings !== null && (
                        <p className="text-sm text-muted-foreground">
                          Saves {formatNumber(savings)} coins (
                          {((savings / maxBar) * 100).toFixed(0)}% cheaper)
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid w-full gap-4 sm:w-auto sm:min-w-96">
                    <div>
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-emerald-400">Craft cost</span>
                        <span className="font-mono">
                          {craftTotal !== null ? formatNumber(craftTotal) : "—"}
                        </span>
                      </div>
                      <div className="mt-1.5">
                        <ProgressBar pct={craftTotal !== null ? (craftTotal / maxBar) * 100 : 0} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-cyan-300">
                          Buy price{" "}
                          <span className="font-normal text-muted-foreground">
                            (
                            {buyOption?.source === "bazaar"
                              ? "Bazaar"
                              : buyOption?.source === "auction"
                                ? "lowest BIN"
                                : buyOption?.source === "npc"
                                  ? "NPC"
                                  : "unknown"}
                            )
                          </span>
                        </span>
                        <span className="font-mono">
                          {buyOption?.price ? formatNumber(buyOption.price) : "—"}
                        </span>
                      </div>
                      <div className="mt-1.5">
                        <ProgressBar
                          pct={buyOption?.price ? (buyOption.price / maxBar) * 100 : 0}
                          tone="gold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Panel>

              {/* Ingredients */}
              <Panel>
                <h2 className="text-lg font-semibold">Ingredients</h2>
                <ul className="mt-4 space-y-2">
                  {ingredients.map((ing) => (
                    <li
                      key={ing.id}
                      className="glass-soft flex items-center gap-3 rounded-xl px-4 py-3"
                    >
                      <ItemIcon id={ing.id} name={ing.name} className="size-7 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{ing.name}</p>
                        <p className="text-[11px] capitalize text-muted-foreground">
                          ×{formatNumber(ing.amount)} · via {ing.source}
                        </p>
                      </div>
                      <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
                      <p className="shrink-0 text-right font-mono text-sm font-semibold">
                        {ing.unitPrice !== null ? formatNumber(ing.unitPrice * ing.amount) : "?"}
                      </p>
                    </li>
                  ))}
                </ul>
                {ingredients.some((i) => i.unitPrice === null) && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Some ingredients have no market price — the craft total may be unavailable.
                  </p>
                )}
              </Panel>
            </>
          )}

          {/* Dependency tree */}
          {tree && tree.children.length > 0 && (
            <Panel>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <Layers className="size-4 text-primary" /> Dependency tree
                </h2>
                <p className="text-xs text-muted-foreground">
                  {rawCount} raw materials ·{" "}
                  {treeTotal !== null ? (
                    <>
                      cheapest total{" "}
                      <span className="font-mono font-semibold text-emerald-300">
                        {formatNumber(treeTotal)}
                      </span>
                    </>
                  ) : (
                    "cost incomplete (unpriced materials)"
                  )}
                </p>
              </div>
              <div className="mt-4 space-y-1">
                {tree.children.map((child) => (
                  <TreeNode key={child.id} node={child} depth={0} />
                ))}
              </div>
              {leaves.some((l) => l.unitCost === null) && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Items marked “?” have no known price or recipe — their subtree cost is excluded
                  from the rollup.
                </p>
              )}
            </Panel>
          )}

          {!selected && !query && (
            <Panel>
              <p className="text-sm text-muted-foreground">
                Search for a craftable item above to see whether crafting or buying is cheaper right
                now.
              </p>
            </Panel>
          )}
        </>
      )}
    </div>
  );
}

/** One expandable node of the crafting dependency tree. */
function TreeNode({ node, depth }: { node: CraftNode; depth: number }) {
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = node.children.length > 0;
  const cost = node.unitCost !== null ? node.unitCost * node.amount : null;

  return (
    <div>
      <div
        className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/5 sm:flex-nowrap"
        style={{ paddingLeft: `${Math.min(depth, 6) * 12 + 8}px` }}
      >
        {hasChildren ? (
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Collapse" : "Expand"}
            className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
          >
            <ChevronDown className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        ) : (
          <span className="w-3.5 shrink-0" />
        )}

        <ItemIcon id={node.id} name={node.name} className="size-5 shrink-0" />

        <span className="min-w-0 flex-1 truncate text-sm">
          {node.name}
          <span className="ml-1.5 font-mono text-[10px] text-muted-foreground">
            ×{formatNumber(node.amount)}
          </span>
        </span>

        <span
          className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase ${
            node.chosen === "craft"
              ? "bg-emerald-500/15 text-emerald-300"
              : node.chosen === "buy"
                ? "bg-cyan-500/15 text-cyan-300"
                : "bg-white/5 text-muted-foreground"
          }`}
        >
          {node.chosen === "unknown" ? (node.cyclic ? "cycle" : "?") : node.chosen}
        </span>

        <span className="w-20 shrink-0 text-right font-mono text-xs font-semibold">
          {cost !== null ? formatNumber(cost) : "?"}
        </span>
      </div>

      {open && hasChildren && (
        <div>
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
