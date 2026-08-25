// tests/item-valuation.test.ts
// Comprehensive item valuation test suite:
// Exponential regular enchants, base-book scaled ultimate enchants,
// Master Stars 6-10, Gemstone qualities, Reforge stones, Kuudra attributes,
// Art of War, and Wither scrolls.

import { describe, expect, it } from "vitest";
import { estimateItemValue } from "../src/lib/item-valuation";

describe("estimateItemValue", () => {
  it("returns a zero valuation for empty lore and no extras", () => {
    const result = estimateItemValue(undefined, 1000);
    expect(result.base).toBe(1000);
    expect(result.total).toBe(1000);
    expect(result.enchants).toHaveLength(0);
  });

  it("T1.05: values regular enchantments with exponential tier scaling", () => {
    // Sharpness VI (1.8M) + Looting IV (2.2M) = 4.0M
    const result = estimateItemValue(["§7Damage: §c+100", "§9Sharpness VI", "§9Looting IV"], 1_000_000);
    expect(result.enchantTotal).toBe(1_800_000 + 2_200_000);
    expect(result.total).toBe(1_000_000 + 4_000_000);

    // Growth VII (500M) vs Growth V (150k)
    const g7 = estimateItemValue(undefined, 1_000_000, { enchantments: { growth: 7 } });
    expect(g7.enchantTotal).toBe(500_000_000);

    const g5 = estimateItemValue(undefined, 1_000_000, { enchantments: { growth: 5 } });
    expect(g5.enchantTotal).toBe(150_000);

    // Efficiency X (175M)
    const eff10 = estimateItemValue(undefined, 50_000, { enchantments: { efficiency: 10 } });
    expect(eff10.enchantTotal).toBe(175_000_000);
  });

  it("T1.06: values ultimate enchantments using base-book powers (2^(lvl-1))", () => {
    // Chimera I = 75M, Chimera V = 16 * 75M = 1.2B
    const chim1 = estimateItemValue(undefined, 0, { enchantments: { chimera: 1 } });
    expect(chim1.enchantTotal).toBe(75_000_000);

    const chim5 = estimateItemValue(undefined, 0, { enchantments: { chimera: 5 } });
    expect(chim5.enchantTotal).toBe(1_200_000_000);

    // Soul Eater V = 16 * 3.5M = 56M
    const se5 = estimateItemValue(["§9Ultimate Soul Eater V"], 0);
    expect(se5.enchantTotal).toBe(56_000_000);

    // One For All (Flat 6M)
    const ofa = estimateItemValue(["§9Ultimate One For All I"], 0);
    expect(ofa.enchantTotal).toBe(6_000_000);
  });

  it("T1.07: values Master Stars 6 through 10 (First through Fifth Master Stars)", () => {
    // 5 Normal Stars (5 * 5% = 25% of 100M = 25M)
    const stars5 = estimateItemValue(undefined, 100_000_000, { stars: 5 });
    expect(stars5.stars).toBe(5);
    expect(stars5.masterStars).toBe(0);
    expect(stars5.starTotal).toBe(25_000_000);
    expect(stars5.masterStarTotal).toBe(0);

    // 10 Stars (5 Normal + 5 Master Stars)
    // Master star value = 15M + 25M + 45M + 75M + 120M = 280M
    const stars10 = estimateItemValue(undefined, 100_000_000, { stars: 10 });
    expect(stars10.stars).toBe(5);
    expect(stars10.masterStars).toBe(5);
    expect(stars10.masterStarTotal).toBe(280_000_000);
    expect(stars10.total).toBe(100_000_000 + 25_000_000 + 280_000_000);
  });

  it("T1.08: appraises gemstone qualities (Jasper, Ruby, Topaz, Jade, etc.)", () => {
    const val = estimateItemValue(undefined, 50_000_000, {
      gems: {
        jasper_0: "PERFECT", // 45M
        ruby_0: "FLAWLESS",  // 6.5M
        jade_0: "PERFECT",   // 32M (non-expensive set)
        topaz_0: "FINE",     // 250k
      },
    });
    expect(val.gems).toHaveLength(4);
    expect(val.gemTotal).toBe(45_000_000 + 6_500_000 + 32_000_000 + 250_000);
  });

  it("T1.09: prices reforge stones correctly", () => {
    const withered = estimateItemValue(undefined, 10_000_000, { reforge: "Withered" });
    expect(withered.reforgeValue).toBe(6_500_000);

    const renowned = estimateItemValue(undefined, 10_000_000, { reforge: "Renowned" });
    expect(renowned.reforgeValue).toBe(18_000_000);

    const ancient = estimateItemValue(undefined, 10_000_000, { reforge: "Ancient" });
    expect(ancient.reforgeValue).toBe(2_500_000);
  });

  it("T1.10: values high-tier Kuudra attributes (Mana Pool X, Veteran X)", () => {
    // Tier 10 = 2^9 = 512 base shards * 1.2M = 614.4M
    const attrVal = estimateItemValue(undefined, 20_000_000, {
      attributes: {
        mana_pool: 10,
        veteran: 10,
      },
    });
    expect(attrVal.attributes).toHaveLength(2);
    expect(attrVal.attributeTotal).toBe(512 * 1_200_000 + 512 * 1_200_000);
  });

  it("T1.11: credits Art of War, Wood Singularity, and Wither Impact scrolls", () => {
    const hyperMaxed = estimateItemValue(undefined, 1_000_000_000, {
      artOfWar: 1,           // 5.5M
      woodSingularity: 1,    // 4.5M
      abilityScrolls: ["Wither Shield", "Shadow Warp", "Implosion"], // 3 * 70M = 210M
      hotPotatoBooks: 15,    // 10 HPB (3.5M) + 5 Fuming (5.0M) = 8.5M
    });
    expect(hyperMaxed.artOfWar).toBe(1);
    expect(hyperMaxed.woodSingularity).toBe(1);
    expect(hyperMaxed.scrollTotal).toBe(210_000_000);
    expect(hyperMaxed.bookTotal).toBe(8_500_000);
    expect(hyperMaxed.extrasTotal).toBe(5_500_000 + 4_500_000);
    expect(hyperMaxed.total).toBe(1_000_000_000 + 210_000_000 + 8_500_000 + 10_000_000);
  });

  it("returns null total when upgrades exist but no base price", () => {
    const result = estimateItemValue(["§9Sharpness VI"], null);
    expect(result.base).toBeNull();
    expect(result.enchantTotal).toBeGreaterThan(0);
    expect(result.total).toBeNull();
    expect(result.confidence).toBe("estimated");
  });
});
