// src/components/bazaar-history-chart.tsx
// Expanded price-history chart for one Bazaar product. Kept in its own module
// so recharts (~650KB) is code-split and only loaded when a chart is opened.

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNumber } from "@/lib/skyblock";
import type { PricePoint } from "@/lib/price-history";

export default function BazaarHistoryChart({
  productId,
  points,
}: {
  productId: string;
  points: PricePoint[];
}) {
  const chartData = points.map((p) => ({
    t: new Date(p.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    v: p.v,
  }));

  if (chartData.length < 2) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-center text-xs text-muted-foreground">
        Price history builds from live market samples (roughly every 5 minutes) — check back soon.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 6, right: 6, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`bz-${productId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="t"
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          minTickGap={50}
        />
        <YAxis
          domain={["auto", "auto"]}
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          width={64}
          tickFormatter={(v: number) => formatNumber(v)}
        />
        <ChartTooltip
          formatter={(value) => [`${formatNumber(Number(value))} coins`, "Buy price"]}
          contentStyle={{
            background: "rgba(2,6,23,0.9)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="v"
          stroke="#34d399"
          strokeWidth={2}
          fill={`url(#bz-${productId})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
