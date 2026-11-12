export type CollectionTier = { tier: number; amountRequired: number };

export type OfficialCollection = {
  name: string;
  category: string;
  tiers: CollectionTier[];
};

export function getCollectionProgress(amount: number, tiers: CollectionTier[]) {
  if (!tiers.length || !Number.isFinite(amount) || amount < 0) return null;
  const next = tiers.findIndex(({ amountRequired }) => amountRequired > amount);
  if (next < 0) return { tier: tiers.at(-1)!.tier, remaining: 0, progress: 100 };
  const previous = tiers[next - 1];
  const current = tiers[next]!;
  const start = previous?.amountRequired ?? 0;
  return {
    tier: previous?.tier ?? 0,
    remaining: current.amountRequired - amount,
    progress: Math.round((100 * (amount - start)) / (current.amountRequired - start)),
  };
}
