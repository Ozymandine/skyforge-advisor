import { describe, expect, it } from "vitest";
import {
  getPetCombatStats,
  getPetLevel,
  getPetXpBetween,
  PET_CATALOG,
} from "../src/lib/pet-catalog";

describe("pet catalog", () => {
  it("uses rarity-specific XP costs", () => {
    expect(getPetXpBetween("GRIFFIN", "COMMON", 1, 2)).toBe(100);
    expect(getPetXpBetween("GRIFFIN", "LEGENDARY", 1, 2)).toBe(660);
    expect(getPetXpBetween("GRIFFIN", "LEGENDARY", 1, 100)).toBe(25_353_230);
    expect(getPetLevel("GRIFFIN", "LEGENDARY", 659)).toEqual({ level: 1, maxLevel: 100 });
    expect(getPetLevel("GRIFFIN", "LEGENDARY", 660)).toEqual({ level: 2, maxLevel: 100 });
  });

  it("uses the custom dragon cap, with no base pet stats before hatching", () => {
    const maxXp = getPetXpBetween("GOLDEN_DRAGON", "LEGENDARY", 1, 200);
    expect(maxXp).toBeGreaterThan(200_000_000);
    expect(getPetLevel("GOLDEN_DRAGON", "LEGENDARY", maxXp)).toEqual({ level: 200, maxLevel: 200 });
    expect(getPetCombatStats("GOLDEN_DRAGON", "LEGENDARY", 50)).toEqual({});
    expect(getPetCombatStats("GOLDEN_DRAGON", "LEGENDARY", 200)).toMatchObject({ STRENGTH: 50 });
  });

  it("keeps missing XP and unsupported variants unavailable", () => {
    expect(PET_CATALOG.length).toBeGreaterThan(80);
    expect(getPetLevel("GRIFFIN", "LEGENDARY", null)).toBeNull();
    expect(getPetLevel("MISSING_PET", "LEGENDARY", 300)).toBeNull();
    expect(getPetCombatStats("GOLDEN_DRAGON", "COMMON", 100)).toBeNull();
    expect(getPetXpBetween("GRIFFIN", "COMMON", 100, 101)).toBeNull();
  });
});
