// src/lib/mining-calculator.ts
// Comprehensive Hypixel SkyBlock Mining Speed, Fortune & Powder Optimizer:
// Drill engine upgrades, HOTM perk allocations, and gemstone breaking ticks.

export type DrillType = "divan" | "dr_x655" | "dr_x555" | "titanium_dr_x455" | "gemstone_gauntlet";

export type MiningSetupInput = {
  miningLevel: number;
  hotmTier: number;
  drill: DrillType;
  hasAmberEngine: boolean; // Amber-polished drill engine (+400 Mining Speed, +100 Fortune)
  hasBlueCheese: boolean; // Blue Cheese Omelette (+1 Goblin Slayer, +100 Mining Speed, +30 Fortune)
  hasPerfectFuelTank: boolean; // +100,000 fuel + 50 Mining Speed
  mithrilPowder: number;
  gemstonePowder: number;
};

export type MiningStatsResult = {
  miningSpeed: number;
  miningFortune: number;
  blockBreakTicks: {
    mithril: number;
    hardStone: number;
    rubyGemstone: number;
    jasperGemstone: number;
  };
  powderAllocation: {
    miningSpeedLevel: number;
    miningFortuneLevel: number;
    efficientMinerLevel: number;
    miningSpeed2Level: number;
    miningFortune2Level: number;
    spentMithril: number;
    spentGemstone: number;
  };
};

export const DEFAULT_MINING_SETUP: MiningSetupInput = {
  miningLevel: 60,
  hotmTier: 10,
  drill: "divan",
  hasAmberEngine: true,
  hasBlueCheese: true,
  hasPerfectFuelTank: true,
  mithrilPowder: 4_000_000,
  gemstonePowder: 8_000_000,
};

export function calculateMiningStats(setup: MiningSetupInput = DEFAULT_MINING_SETUP): MiningStatsResult {
  // Base mining speed & fortune from Mining Level
  let baseSpeed = setup.miningLevel * 20; // +20 speed per level
  let baseFortune = setup.miningLevel * 4; // +4 fortune per level

  // Drill Base Stats
  switch (setup.drill) {
    case "divan":
      baseSpeed += 1800;
      baseFortune += 300;
      break;
    case "dr_x655":
      baseSpeed += 1600;
      baseFortune += 250;
      break;
    case "dr_x555":
      baseSpeed += 1200;
      baseFortune += 150;
      break;
    case "gemstone_gauntlet":
      baseSpeed += 800;
      baseFortune += 60;
      break;
    default:
      baseSpeed += 500;
      break;
  }

  // Drill Upgrade Modules
  if (setup.hasAmberEngine) {
    baseSpeed += 400;
    baseFortune += 100;
  }
  if (setup.hasBlueCheese) {
    baseSpeed += 100;
    baseFortune += 30;
  }
  if (setup.hasPerfectFuelTank) {
    baseSpeed += 50;
  }

  // Optimize Powder Allocations
  // Mithril Powder -> Mining Speed 1 (up to lvl 50) + Mining Fortune 1 (up to lvl 50) + Efficient Miner
  const miningSpeedLevel = Math.min(50, Math.floor(setup.mithrilPowder / 40_000));
  const miningFortuneLevel = Math.min(50, Math.floor((setup.mithrilPowder - miningSpeedLevel * 40_000) / 40_000));
  const efficientMinerLevel = Math.min(100, Math.floor((setup.mithrilPowder - (miningSpeedLevel + miningFortuneLevel) * 40_000) / 20_000));

  // Gemstone Powder -> Mining Speed 2 (up to lvl 50) + Mining Fortune 2 (up to lvl 50)
  const miningSpeed2Level = Math.min(50, Math.floor(setup.gemstonePowder / 80_000));
  const miningFortune2Level = Math.min(50, Math.floor((setup.gemstonePowder - miningSpeed2Level * 80_000) / 80_000));

  const totalSpeed =
    baseSpeed +
    miningSpeedLevel * 40 +
    miningSpeed2Level * 50;

  const totalFortune =
    baseFortune +
    miningFortuneLevel * 5 +
    miningFortune2Level * 5;

  // Calculate Gemstone Breaking Ticks (1 tick = 50ms)
  // Hardness: Hardstone = 50, Mithril = 500, Ruby = 2500, Jasper = 4000
  const calcTicks = (hardness: number) => {
    const damagePerTick = totalSpeed / 30;
    return Math.max(4, Math.ceil(hardness / damagePerTick));
  };

  return {
    miningSpeed: totalSpeed,
    miningFortune: totalFortune,
    blockBreakTicks: {
      hardStone: 4, // Instant at high speed
      mithril: calcTicks(500),
      rubyGemstone: calcTicks(2500),
      jasperGemstone: calcTicks(4000),
    },
    powderAllocation: {
      miningSpeedLevel,
      miningFortuneLevel,
      efficientMinerLevel: Math.max(0, efficientMinerLevel),
      miningSpeed2Level,
      miningFortune2Level,
      spentMithril: (miningSpeedLevel + miningFortuneLevel) * 40_000,
      spentGemstone: (miningSpeed2Level + miningFortune2Level) * 80_000,
    },
  };
}
