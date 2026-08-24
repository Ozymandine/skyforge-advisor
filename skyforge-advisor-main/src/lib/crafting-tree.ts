// src/lib/crafting-tree.ts
// Recursive crafting dependency resolver. Expands a target item's recipe into
// a full tree, pricing every node from live market data and choosing the
// cheapest acquisition path (buy from Bazaar/AH/NPC vs craft from ingredients)
// at every level. Pure functions — no I/O — so they're easy to test.

export type RecipeIndex = Record<string, Array<{ id: string; amount: number }>>;

export type PriceSource = "bazaar" | "auction" | "npc" | "unknown";

export type CraftNode = {
  id: string;
  name: string;
  /** Total units of this item needed for ONE craft of the parent chain. */
  amount: number;
  /** Direct purchase price per unit, when known. */
  buyPrice: number | null;
  buySource: PriceSource;
  /** Total cost to craft this node's subtree, null when unpriceable. */
  craftCost: number | null;
  /** Chosen (cheapest) per-unit cost backing the rollup. */
  unitCost: number | null;
  chosen: "buy" | "craft" | "unknown";
  children: CraftNode[];
  /** True when this node is part of a recipe cycle (stopped expanding). */
  cyclic: boolean;
};

export type TreeOptions = {
  recipes: RecipeIndex;
  names: Map<string, string>;
  /** Direct purchase price per unit for an item id (null when unknown). */
  priceOf: (id: string) => { price: number | null; source: PriceSource };
  maxDepth?: number;
};

const DEFAULT_MAX_DEPTH = 5;

/**
 * Build the full acquisition tree for an item.
 * `amount` is how many of the target item are needed.
 */
export function buildCraftTree(
  itemId: string,
  amount: number,
  options: TreeOptions,
): CraftNode | null {
  return expand(itemId, amount, options, new Set(), 0);
}

function expand(
  itemId: string,
  amount: number,
  options: TreeOptions,
  path: Set<string>,
  depth: number,
): CraftNode | null {
  const { recipes, names, priceOf, maxDepth = DEFAULT_MAX_DEPTH } = options;
  const direct = priceOf(itemId);
  const ingredients = recipes[itemId];
  const node: CraftNode = {
    id: itemId,
    name: names.get(itemId) ?? titleCaseFallback(itemId),
    amount,
    buyPrice: direct.price,
    buySource: direct.source,
    craftCost: null,
    unitCost: direct.price,
    chosen: direct.price !== null ? "buy" : "unknown",
    children: [],
    cyclic: false,
  };

  // No recipe, depth exhausted, or cycle — this is a leaf.
  if (!ingredients?.length || depth >= maxDepth || path.has(itemId)) {
    node.cyclic = path.has(itemId);
    return node;
  }

  const nextPath = new Set(path).add(itemId);
  let total = 0;
  let priceable = true;

  for (const ing of ingredients) {
    const child = expand(ing.id, ing.amount * amount, options, nextPath, depth + 1);
    if (!child) continue;
    node.children.push(child);
    if (child.unitCost === null) {
      priceable = false;
    } else {
      total += child.unitCost * child.amount;
    }
  }

  if (priceable && node.children.length > 0) {
    node.craftCost = total;
    // Choose the cheaper acquisition path for the subtree rollup.
    if (node.buyPrice === null || total < node.buyPrice * amount) {
      node.unitCost = amount > 0 ? total / amount : total;
      node.chosen = "craft";
    }
  }

  return node;
}

/** Flatten a tree into a list of raw-material leaves with total quantities. */
export function collectLeaves(node: CraftNode): CraftNode[] {
  if (node.children.length === 0 || node.chosen === "buy") {
    return [node];
  }
  return node.children.flatMap((child) => collectLeaves(child));
}

/** Total cost of the cheapest acquisition strategy for the tree root. */
export function treeCost(node: CraftNode | null): number | null {
  if (!node) return null;
  return node.unitCost !== null ? node.unitCost * node.amount : null;
}

/** Count of unique raw materials in the tree. */
export function leafCount(node: CraftNode | null): number {
  if (!node) return 0;
  return new Set(collectLeaves(node).map((n) => n.id)).size;
}

function titleCaseFallback(id: string): string {
  return id
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
