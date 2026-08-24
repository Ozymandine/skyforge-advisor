// src/components/bin-history-sparkline.tsx
// Small BIN price sparkline for one item, backed by server-recorded history.
// Separate module so recharts stays code-split.

import { useServerHistory } from "@/hooks/use-market-history";
import { Sparkline } from "@/components/ui/sparkline";
import type { PricePoint } from "@/lib/price-history";

export default function BinHistorySparkline({ itemId }: { itemId: string }) {
  const { series } = useServerHistory([itemId], 24, true);
  const points: PricePoint[] = series.get(itemId) ?? [];
  if (points.length < 2) return null;
  return <Sparkline points={points.slice(-24)} />;
}
