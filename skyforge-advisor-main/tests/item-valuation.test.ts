// tests/item-valuation.test.ts
// Lore-based item valuation: enchants, potato books, stars, totals.

import { describe, expect, it } from "vitest";
import { estimateItemValue } from "../src/lib/item-valuation";

describe("estimateItemValue", () => {
  it("returns a zero valuation for empty lore", () => {
    const result = estimateItemValue(undefined, 1000);
    expect(result.base).toBe(1000);
    expect(result.total).toBe(1000);
    expect(result.enchants).toHaveLength(0);
  });

  it("values standard enchantments per level", () => {
    const lore = ["§7Damage: §c+100", "§9Sharpness VI", "§9Looting IV"];
    const result = estimateItemValue(lore, 1_000_000);
    // sharpness 6 × 150k = 900k; looting 4 × 60k = 240k
    expect(result.enchantTotal).toBe(900_000 + 240_000);
    expect(result.enchants.map((e) => e.name).sort()).toEqual(["looting", "sharpness"]);
    expect(result.total).toBe(1_000_000 + 1_140_000);
  });

  it("values ultimate enchantments at their fixed price", () => {
    const lore = ["§9Ultimate Soul Eater V"];
    const result = estimateItemValue(lore, 0);
    expect(result.enchantTotal).toBe(12_000_000);
  });

  it("counts hot potato and fuming potato books", () => {
    const lore = ["§9Hot Potato Book", "§9Hot Potato Book", "§9Fuming Hot Potato Book"];
    const result = estimateItemValue(lore, 500_000);
    expect(result.hotPotatoBooks).toBe(2);
    expect(result.fumingBooks).toBe(1);
    expect(result.bookTotal).toBe(2 * 350_000 + 1_000_000);
  });

  it("counts dungeon stars at 5% of base each", () => {
    const lore = ["§8✪✪✪", "§7Some stat line"];
    const result = estimateItemValue(lore, 2_000_000);
    expect(result.stars).toBe(3);
    expect(result.starTotal).toBe(300_000);
    expect(result.total).toBe(2_300_000);
  });

  it("detects a reforge prefix", () => {
    const lore = ["§8Heroic Aspect of the End", "§7Damage: §c+100"];
    const result = estimateItemValue(lore, 100);
    expect(result.reforge).toBe("Heroic");
  });

  it("returns null total when upgrades exist but no base price", () => {
    const result = estimateItemValue(["§9Sharpness VI"], null);
    expect(result.base).toBeNull();
    expect(result.enchantTotal).toBeGreaterThan(0);
    expect(result.total).toBeNull();
  });
});
