// tests/advisor-engine.test.ts
// Unit test suite for Autonomous Progression Advisor & Intelligence Engine.

import { describe, expect, it } from "vitest";
import {
  evaluateGameStage,
  generateAdvisorActions,
  CLASS_PROGRESSION_TREES,
  SKILL_LEVELING_GUIDES,
} from "../src/lib/advisor-engine";

describe("Autonomous Advisor: Game Stage Classifier", () => {
  it("classifies early game profile accurately", () => {
    const early = evaluateGameStage(35, 15_000_000, 18, 5, 120);
    expect(early.stage).toBe("Early Game");
    expect(early.stageColor).toBe("#22c55e");
  });

  it("classifies mid game profile accurately", () => {
    const mid = evaluateGameStage(120, 350_000_000, 32, 24, 480);
    expect(mid.stage).toBe("Mid Game");
  });

  it("classifies late game profile accurately", () => {
    const late = evaluateGameStage(210, 2_500_000_000, 44, 36, 850);
    expect(late.stage).toBe("Late Game");
  });

  it("classifies endgame profile accurately", () => {
    const endgame = evaluateGameStage(310, 12_000_000_000, 55, 48, 1350);
    expect(endgame.stage).toBe("End Game");
    expect(endgame.stageColor).toBe("#a855f7");
  });
});

describe("Autonomous Advisor: Personalized Action Matrix", () => {
  it("recommends fairy souls and cheap MP upgrades for low-level players", () => {
    const actions = generateAdvisorActions(null);
    expect(actions.length).toBeGreaterThanOrEqual(4);

    const souls = actions.find((a) => a.id === "fairy_souls");
    expect(souls).toBeDefined();
    expect(souls?.roiTier).toContain("S-Tier");

    const mp = actions.find((a) => a.id === "cheap_mp");
    expect(mp).toBeDefined();
  });
});

describe("Autonomous Advisor: Linear Gear Trees & Skill Fast-Tracks", () => {
  it("defines progression trees for Archer/Berserk, Mage, Mining, and Farming", () => {
    expect(CLASS_PROGRESSION_TREES.length).toBe(4);
    const mage = CLASS_PROGRESSION_TREES.find((c) => c.className === "Mage");
    expect(mage).toBeDefined();
    expect(mage?.steps.length).toBe(4);
    expect(mage?.steps[2]?.weapon).toContain("Hyperion");
  });

  it("defines skill leveling guides across core skills", () => {
    expect(SKILL_LEVELING_GUIDES.length).toBeGreaterThanOrEqual(5);
    const alchemy = SKILL_LEVELING_GUIDES.find((s) => s.skill === "Alchemy");
    expect(alchemy).toBeDefined();
    expect(alchemy?.fastestMethod).toContain("Sugar Cane");
  });
});
