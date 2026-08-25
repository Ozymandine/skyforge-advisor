// tests/dungeons-engine.test.ts
// Unit test suite for Block 7: Dungeons & Catacombs Tactical Breakdown, Party Finder
// reliability, Master Mode clearance odds, Floor Drop Chest EV, and Star-up costs.

import { describe, expect, it } from "vitest";
import {
  evaluatePartyFinderReadiness,
  calculateMasterModeOdds,
  FLOOR_CHEST_LOOT_TABLES,
  getStarUpEstimates,
} from "../src/lib/dungeons-engine";

describe("T2.13 & T2.16: Party Finder Evaluator & Secret Benchmarks", () => {
  it("rates high Cata and high secret players as S+ Carry", () => {
    const evalResult = evaluatePartyFinderReadiness(42, 25_000, 2_000, "F7");
    expect(evalResult.readinessRating).toBe("Carry");
    expect(evalResult.secretBenchmark).toBe("Expert");
    expect(evalResult.secretsPerRun).toBeGreaterThan(11);
  });

  it("identifies undergeared or low-level players", () => {
    const undergeared = evaluatePartyFinderReadiness(20, 500, 300, "F7");
    expect(undergeared.readinessRating).toBe("Undergeared");
    expect(undergeared.secretBenchmark).toBe("Beginner");
  });
});

describe("T2.15: Master Mode Floor Clearance Odds", () => {
  it("calculates progressive clearance odds across M1 to M7", () => {
    const odds = calculateMasterModeOdds(48, true, true);
    expect(odds.length).toBe(7);

    const m1 = odds.find((f) => f.floor === "M1");
    const m7 = odds.find((f) => f.floor === "M7");

    expect(m1?.clearanceOddsPct).toBeGreaterThanOrEqual(90);
    expect(m7?.clearanceOddsPct).toBeGreaterThanOrEqual(75);
  });

  it("penalizes players without Terminator bow on high Master Mode floors", () => {
    const withTerm = calculateMasterModeOdds(40, true, true);
    const withoutTerm = calculateMasterModeOdds(40, false, true);

    const m5With = withTerm.find((f) => f.floor === "M5")?.clearanceOddsPct ?? 0;
    const m5Without = withoutTerm.find((f) => f.floor === "M5")?.clearanceOddsPct ?? 0;

    expect(m5Without).toBeLessThan(m5With);
  });
});

describe("T2.18: Floor Drop Chest EV & Loot Tables", () => {
  it("calculates expected net value per S+ run for F7 and M7", () => {
    const f7 = FLOOR_CHEST_LOOT_TABLES.find((f) => f.floor === "F7");
    const m7 = FLOOR_CHEST_LOOT_TABLES.find((f) => f.floor === "M7");

    expect(f7).toBeDefined();
    expect(f7?.expectedValuePerRun).toBeGreaterThan(1_000_000);
    expect(f7?.topDrops.some((d) => d.name.includes("Necron's Handle"))).toBe(true);

    expect(m7).toBeDefined();
    expect(m7?.expectedValuePerRun).toBeGreaterThan(3_000_000);
    expect(m7?.topDrops.some((d) => d.name.includes("Dark Claymore"))).toBe(true);
  });
});

describe("T2.17: Dungeon Item Essence & Star-up Costs", () => {
  it("computes 1-5 essence star-up and 6-10 master star values", () => {
    const estimates = getStarUpEstimates(2800);
    expect(estimates.length).toBe(3);

    const hyperion = estimates.find((e) => e.itemType.includes("Hyperion"));
    expect(hyperion).toBeDefined();
    expect(hyperion?.stars1to5Cost).toBe(2850);
    expect(hyperion?.totalCoinsValue).toBeGreaterThan(280_000_000);
  });
});

