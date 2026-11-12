import { describe, expect, it } from "vitest";
import {
  buildWeaponCatalog,
  calculateSimulation,
  isOwnedMeleeWeapon,
  readDisplayedCombatStats,
  type SimulatorLoadout,
} from "../src/lib/damage-simulator";
import type { InventoryItem } from "../src/lib/skyblock";

const loadout: SimulatorLoadout = {
  combatLevel: 20,
  weapon: { DAMAGE: 100, STRENGTH: 100 },
  gear: [{ HEALTH: 100, DEFENSE: 50 }],
  pet: { DEFENSE: 50 },
  additional: {},
  targetDefense: 100,
};

describe("overworld melee estimate", () => {
  it("calculates standard and critical hits, defense and EHP from known stats", () => {
    // (5 + 100) × 2 Strength × 1.8 Warrior = 378. A crit adds 50%.
    expect(calculateSimulation(loadout)).toMatchObject({
      normalHit: 378,
      critHit: 567,
      afterDefense: { normal: 189, critical: 283 },
      effectiveHealth: 400,
    });
  });

  it("uses the smaller Warrior bonus above Combat 50", () => {
    const test = { ...loadout, weapon: { DAMAGE: 95 } };
    expect(calculateSimulation({ ...test, combatLevel: 50 }).normalHit).toBe(300);
    expect(calculateSimulation({ ...test, combatLevel: 60 }).normalHit).toBe(310);
  });

  it("keeps unavailable item and target stats unavailable", () => {
    expect(calculateSimulation({ ...loadout, weapon: {} }).normalHit).toBeNull();
    expect(calculateSimulation({ ...loadout, pet: null }).effectiveHealth).toBeNull();
    expect(calculateSimulation({ ...loadout, targetDefense: null }).afterDefense).toBeNull();
    expect(calculateSimulation({ ...loadout, targetDefense: -1 }).afterDefense).toBeNull();
  });
});

describe("weapon presets and owned variants", () => {
  const owned: InventoryItem = {
    id: "TEST_SWORD",
    slot: 4,
    name: "Test sword",
    rarity: "EPIC",
    count: 1,
    lore: [
      "Gear Score: 631 (1904)",
      "Damage: +265.1 (+40) (+842.96)",
      "Strength: +56.8 (+25)",
      "Crit Damage: +47.5% (+21%)",
      "",
      "Damage: +999",
      "EPIC DUNGEON SWORD",
    ],
  };

  it("reads each owned copy's leading displayed stats and excludes dungeon tooltips", () => {
    expect(readDisplayedCombatStats(owned)).toEqual({
      DAMAGE: 265.1,
      STRENGTH: 56.8,
      CRIT_DAMAGE: 47.5,
    });
    expect(isOwnedMeleeWeapon(owned, new Map())).toBe(true);
    expect(readDisplayedCombatStats({ lore: ["Unknown stats"] })).toBeNull();
  });

  it("preserves official stat aliases and keeps bows separate from melee", () => {
    const sword = {
      id: "SWORD",
      name: "Sword",
      rarity: "RARE",
      category: "Sword",
      npcSell: null,
      stats: { DAMAGE: 100, CRITICAL_DAMAGE: 35 },
    };
    const bow = { ...sword, id: "BOW", name: "Bow", category: "Bow" };
    const armor = { ...sword, id: "HELMET", category: "Helmet" };
    const result = buildWeaponCatalog([sword, bow, armor]);
    expect(result.map((item) => [item.id, item.melee])).toEqual([
      ["BOW", false],
      ["SWORD", true],
    ]);
    expect(result[1]?.stats).toEqual({ DAMAGE: 100, CRIT_DAMAGE: 35 });
  });
});
