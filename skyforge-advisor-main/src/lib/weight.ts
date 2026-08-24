// src/lib/weight.ts
// SkyForge weight — a Senither-style progression score computed from skills,
// dungeons and slayers. Higher is better; useful for comparing profiles.

import type { PlayerData } from "@/lib/skyblock";

/** Senither-style skill multipliers. */
const SKILL_MULTIPLIERS: Record<string, number> = {
  FARMING: 0.07,
  MINING: 0.08,
  COMBAT: 0.05,
  FISHING: 0.06,
  FORAGING: 0.04,
  ENCHANTING: 0.05,
  ALCHEMY: 0.05,
  TAMING: 0.05,
  CARPENTRY: 0.02,
};

/** Approximate slayer XP value per kill by tier. */
const SLAYER_TIER_WEIGHT = [0.15, 0.6, 2.4, 10, 40];

export type WeightBreakdown = {
  skillWeight: number;
  dungeonWeight: number;
  slayerWeight: number;
  total: number;
};

export function computeWeight(player: PlayerData): WeightBreakdown {
  let skillWeight = 0;
  for (const skill of player.skills) {
    const mult = SKILL_MULTIPLIERS[skill.key];
    if (!mult) continue;
    // Level + progress into current level, raised to 1.5 like Senither.
    const effective = skill.level + (skill.maxed ? 1 : skill.pct / 100);
    skillWeight += Math.pow(effective, 1.5) * mult;
  }

  let dungeonWeight = 0;
  if (player.dungeons) {
    // Catacombs level dominates dungeon weight (Senither: level^4.65).
    dungeonWeight += Math.pow(player.dungeons.catacombsLevel, 4.65) * 0.000453;
    dungeonWeight += player.dungeons.secretsFound * 0.001;
    dungeonWeight += player.dungeons.floors.reduce((sum, f) => sum + f.completions * 0.002, 0);
  }

  let slayerWeight = 0;
  if (player.slayers) {
    for (const entry of player.slayers) {
      const tierValue =
        SLAYER_TIER_WEIGHT[Math.min(entry.tier - 1, SLAYER_TIER_WEIGHT.length - 1)] ?? 0;
      slayerWeight += entry.kills * tierValue;
    }
    slayerWeight /= 1000;
  }

  const total = skillWeight + dungeonWeight + slayerWeight;
  return {
    skillWeight: Math.round(skillWeight),
    dungeonWeight: Math.round(dungeonWeight),
    slayerWeight: Math.round(slayerWeight),
    total: Math.round(total),
  };
}
