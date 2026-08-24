// src/components/ui/sparkline.tsx
// Tiny inline SVG trend line used in market rows.

import { useMemo } from "react";

import type { PricePoint } from "@/lib/price-history";
import { cn } from "@/lib/utils";

export function Sparkline({
  points,
  className,
  width = 90,
  height = 26,
}: {
  points: PricePoint[];
  className?: string;
  width?: number;
  height?: number;
}) {
  const path = useMemo(() => {
    if (points.length < 2) return null;
    const values = points.map((p) => p.v);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const stepX = width / (points.length - 1);
    return points
      .map(
        (p, i) =>
          `${i === 0 ? "M" : "L"}${(i * stepX).toFixed(1)},${(height - ((p.v - min) / range) * (height - 4) - 2).toFixed(1)}`,
      )
      .join(" ");
  }, [points, width, height]);

  if (!path) return null;

  const rising = points[points.length - 1]!.v >= points[0]!.v;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("shrink-0", rising ? "text-emerald-400" : "text-red-400", className)}
      aria-hidden
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
