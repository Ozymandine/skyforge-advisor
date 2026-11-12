import { describe, expect, it } from "vitest";
import { getCollectionProgress } from "../src/lib/collection-progress";
import { getReportedSkyBlockLevel } from "../src/lib/skyblock-level";
import { getHotmTier } from "../src/lib/hotm-engine";

describe("reported profile progression", () => {
  it("uses collection-specific thresholds and preserves zero progress", () => {
    const tiers = [
      { tier: 1, amountRequired: 100 },
      { tier: 2, amountRequired: 1_000 },
    ];
    expect(getCollectionProgress(0, tiers)).toEqual({ tier: 0, remaining: 100, progress: 0 });
    expect(getCollectionProgress(100, tiers)).toEqual({ tier: 1, remaining: 900, progress: 0 });
    expect(getCollectionProgress(550, tiers)).toEqual({ tier: 1, remaining: 450, progress: 50 });
    expect(getCollectionProgress(2_000, tiers)).toEqual({ tier: 2, remaining: 0, progress: 100 });
    expect(getCollectionProgress(100, [])).toBeNull();
  });

  it("uses actual SkyBlock XP and the cumulative Heart of the Mountain table", () => {
    expect(getReportedSkyBlockLevel(undefined)).toBeNull();
    expect(getReportedSkyBlockLevel(3_451)).toEqual({ level: 34, progress: 51, remainingXp: 49 });
    expect(getHotmTier(36_999)).toBe(3);
    expect(getHotmTier(37_000)).toBe(4);
  });
});
