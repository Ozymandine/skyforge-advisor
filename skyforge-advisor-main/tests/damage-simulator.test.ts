import { describe, it, expect } from "vitest";
import { calculateSimulation, getDefaultLoadout } from "../src/lib/damage-simulator";

describe("Damage Simulator Engine", () => {
  it("calculates baseline damage and EHP for default loadout", () => {
    const loadout = getDefaultLoadout();
    const result = calculateSimulation(loadout);

    expect(result.singleHitDamage).toBeGreaterThan(0);
    expect(result.firstStrikeDamage).toBeGreaterThan(result.singleHitDamage);
    expect(result.effectiveHealth).toBeGreaterThan(result.totalHealth);
    expect(result.dps).toBeGreaterThan(0);
    expect(result.upgradeSuggestions.length).toBeGreaterThan(0);
  });

  it("scales damage upwards inside Dungeons with Catacombs level", () => {
    const overworldLoadout = { ...getDefaultLoadout(), insideDungeons: false };
    const dungeonLoadout = { ...getDefaultLoadout(), insideDungeons: true, catacombsLevel: 35 };

    const overworldResult = calculateSimulation(overworldLoadout);
    const dungeonResult = calculateSimulation(dungeonLoadout);

    expect(dungeonResult.singleHitDamage).toBeGreaterThan(overworldResult.singleHitDamage);
    expect(dungeonResult.effectiveHealth).toBeGreaterThan(overworldResult.effectiveHealth);
  });

  it("applies Master Mode extra scaling when Master Mode is toggled", () => {
    const normalDungeon = { ...getDefaultLoadout(), insideDungeons: true, masterMode: false };
    const masterModeDungeon = {
      ...getDefaultLoadout(),
      insideDungeons: true,
      masterMode: true,
      weapon: { ...getDefaultLoadout().weapon, masterStars: 3 },
    };

    const normalResult = calculateSimulation(normalDungeon);
    const mmResult = calculateSimulation(masterModeDungeon);

    expect(mmResult.singleHitDamage).toBeGreaterThan(normalResult.singleHitDamage);
  });
});
