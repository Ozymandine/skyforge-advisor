// tests/crafting-tree.test.ts
// Recursive crafting dependency resolver.

import { describe, expect, it } from "vitest";
import {
  buildCraftTree,
  collectLeaves,
  leafCount,
  treeCost,
  type RecipeIndex,
} from "../src/lib/crafting-tree";

const recipes: RecipeIndex = {
  SWORD: [
    { id: "STICK", amount: 1 },
    { id: "GEM", amount: 2 },
  ],
  GEM: [{ id: "RAW_GEM", amount: 4 }],
};

const names = new Map([
  ["SWORD", "Fancy Sword"],
  ["STICK", "Stick"],
  ["GEM", "Polished Gem"],
  ["RAW_GEM", "Raw Gem"],
]);

function makePriceOf(prices: Record<string, number>) {
  return (id: string) => ({
    price: prices[id] ?? null,
    source: (prices[id] != null ? "bazaar" : "unknown") as "bazaar" | "unknown",
  });
}

describe("buildCraftTree", () => {
  it("expands multi-level recipes and rolls up craft costs", () => {
    const tree = buildCraftTree("SWORD", 1, {
      recipes,
      names,
      // STICK cheap to buy; RAW_GEM only craftable via purchase — GEM is
      // cheaper to craft (8) than to buy (1000).
      priceOf: makePriceOf({ STICK: 10, GEM: 1000, RAW_GEM: 1 }),
    });

    expect(tree).not.toBeNull();
    expect(tree!.craftCost).toBe(10 + 2 * 4); // stick bought + 8 raw gems
    expect(tree!.chosen).toBe("craft");
    expect(tree!.children).toHaveLength(2);

    const gem = tree!.children.find((c) => c.id === "GEM")!;
    expect(gem.chosen).toBe("craft");
    expect(gem.craftCost).toBe(8);
    expect(gem.children[0]!.id).toBe("RAW_GEM");
  });

  it("prefers buying when the market is cheaper than crafting", () => {
    const tree = buildCraftTree("SWORD", 1, {
      recipes,
      names,
      priceOf: makePriceOf({ STICK: 10, GEM: 1 }), // buying GEM is way cheaper
    });

    const gem = tree!.children.find((c) => c.id === "GEM")!;
    expect(gem.chosen).toBe("buy");
    expect(tree!.craftCost).toBe(10 + 2 * 1);
  });

  it("stops at recipe cycles and marks them", () => {
    const cyclic: RecipeIndex = {
      A: [{ id: "B", amount: 1 }],
      B: [{ id: "A", amount: 1 }],
    };
    const tree = buildCraftTree("A", 1, {
      recipes: cyclic,
      names,
      priceOf: makePriceOf({}),
    });
    expect(tree).not.toBeNull();
    const b = tree!.children[0]!;
    expect(b.children[0]!.cyclic).toBe(true);
  });

  it("respects maxDepth", () => {
    const tree = buildCraftTree("SWORD", 1, {
      recipes,
      names,
      priceOf: makePriceOf({}),
      maxDepth: 1,
    });
    const gem = tree!.children.find((c) => c.id === "GEM")!;
    expect(gem.children).toHaveLength(0); // RAW_GEM expansion suppressed
  });

  it("collects raw-material leaves and unique counts", () => {
    const tree = buildCraftTree("SWORD", 1, {
      recipes,
      names,
      priceOf: makePriceOf({ STICK: 10, RAW_GEM: 1 }), // GEM crafted from raw gems
    });
    const leaves = collectLeaves(tree!);
    expect(leaves.map((l) => l.id).sort()).toEqual(["RAW_GEM", "STICK"]);
    expect(leafCount(tree)).toBe(2);
    expect(treeCost(tree)).toBe(10 + 2 * 4);
  });
});
