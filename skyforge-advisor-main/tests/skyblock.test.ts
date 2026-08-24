import { describe, expect, it } from "vitest";

import { MAX_COLLECTION_CATEGORIES, MAX_FAIRY_SOULS, MAX_SKILL_AVERAGE } from "@/lib/constants";
import { computeSkill, formatFull, formatNumber, titleCase } from "@/lib/skyblock";

describe("formatNumber", () => {
  it("formats compact suffixes", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(999)).toBe("999");
    expect(formatNumber(1_500)).toBe("1.5K");
    expect(formatNumber(2_000_000)).toBe("2.00M");
    expect(formatNumber(3_400_000_000)).toBe("3.40B");
  });

  it("handles non-finite input", () => {
    expect(formatNumber(Number.NaN)).toBe("0");
    expect(formatNumber(Infinity)).toBe("0");
  });
});

describe("formatFull", () => {
  it("rounds and groups with commas", () => {
    expect(formatFull(1234567.8)).toBe("1,234,568");
    expect(formatFull(0)).toBe("0");
  });
});

describe("titleCase", () => {
  it("converts snake/upper ids to title case", () => {
    expect(titleCase("ASPECT_OF_THE_END")).toBe("Aspect Of The End");
    expect(titleCase("enchanted_diamond")).toBe("Enchanted Diamond");
  });
});

describe("computeSkill", () => {
  it("returns level 0 progress for zero xp", () => {
    const result = computeSkill("MINING", 0);
    expect(result.level).toBe(0);
    expect(result.pct).toBe(0);
    expect(result.maxed).toBe(false);
  });

  it("computes partial progress from total xp", () => {
    // Mining levels 1-3 cost 50 + 125 + 200 = 375 xp.
    const result = computeSkill("MINING", 300);
    expect(result.level).toBe(2);
    expect(result.currentXp).toBe(125);
    expect(result.neededXp).toBe(200);
    expect(result.maxed).toBe(false);
  });

  it("marks a skill maxed at or beyond its cap xp", () => {
    // Feed an enormous amount of XP; every skill should cap out.
    const result = computeSkill("TAMING", Number.MAX_SAFE_INTEGER);
    expect(result.maxed).toBe(true);
    expect(result.pct).toBe(100);
    expect(result.level).toBe(result.cap);
  });
});

describe("constants sanity", () => {
  it("game caps are positive", () => {
    expect(MAX_FAIRY_SOULS).toBeGreaterThan(0);
    expect(MAX_SKILL_AVERAGE).toBeGreaterThan(0);
    expect(MAX_COLLECTION_CATEGORIES).toBeGreaterThan(0);
  });
});
