// tests/accessory-data.test.ts
// Magical power math for accessories.

import { describe, expect, it } from "vitest";
import { mpForAccessory, mpToDamageBonus, normalizeAccessoryName } from "../src/lib/accessory-data";

describe("accessory-data", () => {
  it("normalizes accessory names consistently", () => {
    expect(normalizeAccessoryName("Wolf Talisman")).toBe(normalizeAccessoryName("wolf talisman"));
  });

  it("awards higher magical power for higher rarities", () => {
    const rarities = ["common", "uncommon", "rare", "epic", "legendary", "mythic"] as const;
    for (let i = 1; i < rarities.length; i++) {
      expect(mpForAccessory(rarities[i]!)).toBeGreaterThanOrEqual(mpForAccessory(rarities[i - 1]!));
    }
  });

  it("applies reforge bonus", () => {
    expect(mpForAccessory("legendary", 2)).toBeGreaterThan(mpForAccessory("legendary", 0));
  });

  it("gives a damage bonus that scales with magical power", () => {
    expect(mpToDamageBonus(0)).toBe(0);
    expect(mpToDamageBonus(100)).toBeGreaterThan(mpToDamageBonus(50));
  });
});
