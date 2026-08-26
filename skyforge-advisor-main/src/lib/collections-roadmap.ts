// src/lib/collections-roadmap.ts
// Comprehensive Collections, Minions, Museum & Bank Interest Engine:
// Collection tier matrix, Minion slot roadmap (25->31 slots), Museum appraisal,
// Community Center upgrades, and Personal Bank interest optimizer.

import { formatFull, formatNumber } from "./skyblock";

// ---------------------------------------------------------------------------
// T3.20: MINION SLOT UNLOCK ROADMAP
// ---------------------------------------------------------------------------

export type MinionSlotMilestone = {
  slotsCount: number;
  uniqueCraftsRequired: number;
  uniqueCraftsRemaining: number;
  unlocked: boolean;
};

export const MINION_SLOT_THRESHOLDS = [
  { slots: 15, requiredCrafts: 150 },
  { slots: 20, requiredCrafts: 300 },
  { slots: 24, requiredCrafts: 450 },
  { slots: 25, requiredCrafts: 475 },
  { slots: 26, requiredCrafts: 525 },
  { slots: 27, requiredCrafts: 575 },
  { slots: 28, requiredCrafts: 625 },
  { slots: 29, requiredCrafts: 675 },
  { slots: 30, requiredCrafts: 725 },
  { slots: 31, requiredCrafts: 775 },
];

export function calculateMinionSlotRoadmap(currentUniqueCrafts = 510): {
  currentSlots: number;
  nextSlotTarget: MinionSlotMilestone | null;
  milestones: MinionSlotMilestone[];
} {
  let currentSlots = 5;
  for (const t of MINION_SLOT_THRESHOLDS) {
    if (currentUniqueCrafts >= t.requiredCrafts) {
      currentSlots = t.slots;
    }
  }

  const milestones: MinionSlotMilestone[] = MINION_SLOT_THRESHOLDS.map((t) => ({
    slotsCount: t.slots,
    uniqueCraftsRequired: t.requiredCrafts,
    uniqueCraftsRemaining: Math.max(0, t.requiredCrafts - currentUniqueCrafts),
    unlocked: currentUniqueCrafts >= t.requiredCrafts,
  }));

  const nextSlotTarget = milestones.find((m) => !m.unlocked) ?? null;

  return {
    currentSlots,
    nextSlotTarget,
    milestones,
  };
}

// ---------------------------------------------------------------------------
// T3.24: PERSONAL BANK INTEREST OPTIMIZER
// ---------------------------------------------------------------------------

export type BankTier = {
  tierName: string;
  goldInterestCapCoins: number;
  requiredPurseBalance: number;
  cooldownHours: number;
};

export const BANK_INTEREST_TIERS: BankTier[] = [
  { tierName: "Starter Bank", goldInterestCapCoins: 200_000, requiredPurseBalance: 10_000_000, cooldownHours: 31 },
  { tierName: "Gold Account", goldInterestCapCoins: 300_000, requiredPurseBalance: 15_000_000, cooldownHours: 31 },
  { tierName: "Deluxe Account", goldInterestCapCoins: 500_000, requiredPurseBalance: 25_000_000, cooldownHours: 31 },
  { tierName: "Super Deluxe Account", goldInterestCapCoins: 1_000_000, requiredPurseBalance: 50_000_000, cooldownHours: 31 },
  { tierName: "Premier Account", goldInterestCapCoins: 2_000_000, requiredPurseBalance: 100_000_000, cooldownHours: 31 },
];

export function calculateBankInterest(currentBankBalance: number): {
  interestGained: number;
  tier: BankTier;
  optimalBalanceForCap: number;
} {
  const tier = BANK_INTEREST_TIERS.find((t) => currentBankBalance <= t.requiredPurseBalance) ?? BANK_INTEREST_TIERS[4]!;
  // 2% interest up to cap
  const interestGained = Math.min(tier.goldInterestCapCoins, Math.round(currentBankBalance * 0.02));

  return {
    interestGained,
    tier,
    optimalBalanceForCap: tier.requiredPurseBalance,
  };
}
