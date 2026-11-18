import { formatNumber } from "./skyblock";

/** Preserve fractions on low-priced markets instead of displaying positive quotes as zero. */
export function formatCoins(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (value > 0 && value < 0.01) return "<0.01";
  if (value < 0 && value > -0.01) return ">-0.01";
  if (Math.abs(value) >= 1000) return formatNumber(value);
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}
