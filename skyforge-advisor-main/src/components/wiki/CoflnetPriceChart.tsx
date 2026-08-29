// src/components/wiki/CoflnetPriceChart.tsx
// 30-90 Day Historical Auction & Bazaar price charts powered by Coflnet.

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp, TrendingDown, History, AlertCircle, Loader2 } from "lucide-react";

import { fetchExternalPriceHistory } from "@/lib/hypixel.functions";
import { formatNumber } from "@/lib/skyblock";
import { cn } from "@/lib/utils";

export default function CoflnetPriceChart({
  itemId,
  itemName,
}: {
  itemId: string;
  itemName?: string;
}) {
  const [days, setDays] = useState<30 | 90>(30);

  const historyQuery = useQuery({
    queryKey: ["coflnet-price-history", itemId, days],
    queryFn: () => fetchExternalPriceHistory({ data: { itemId, days } }),
    staleTime: 15 * 60_000,
  });

  const rawPoints = historyQuery.data?.points;

  const chartData = useMemo(() => {
    const points = rawPoints ?? [];
    return points.map((p) => ({
      date: new Date(p.t).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      price: Math.round(p.v),
      volume: p.s ?? 0,
      timestamp: p.t,
    }));
  }, [rawPoints]);

  const stats = useMemo(() => {
    if (chartData.length < 2) return null;
    const prices = chartData.map((d) => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const first = prices[0] ?? 0;
    const last = prices[prices.length - 1] ?? 0;
    const changePct = first > 0 ? ((last - first) / first) * 100 : 0;

    return { min, max, first, last, changePct };
  }, [chartData]);

  return (
    <div className="space-y-4">
      {/* Header Controls & Summary Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <History className="size-4 text-sky-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-white/70">
            Coflnet Price History
          </span>
          {stats && (
            <span
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                stats.changePct >= 0
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-red-500/15 text-red-400",
              )}
            >
              {stats.changePct >= 0 ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              {stats.changePct >= 0 ? "+" : ""}
              {stats.changePct.toFixed(1)}% ({days}d)
            </span>
          )}
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-0.5 text-xs">
          <button
            onClick={() => setDays(30)}
            className={cn(
              "rounded-md px-2.5 py-1 font-medium transition-all",
              days === 30
                ? "bg-sky-500/20 text-sky-300 font-semibold shadow-sm"
                : "text-white/50 hover:text-white",
            )}
          >
            30 Days
          </button>
          <button
            onClick={() => setDays(90)}
            className={cn(
              "rounded-md px-2.5 py-1 font-medium transition-all",
              days === 90
                ? "bg-sky-500/20 text-sky-300 font-semibold shadow-sm"
                : "text-white/50 hover:text-white",
            )}
          >
            90 Days
          </button>
        </div>
      </div>

      {/* Mini Metrics Bar */}
      {stats && (
        <div className="grid grid-cols-3 gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs">
          <div>
            <span className="text-white/40 block text-[10px] uppercase font-semibold">
              Period Low
            </span>
            <span className="font-mono font-bold text-white/90">{formatNumber(stats.min)}</span>
          </div>
          <div>
            <span className="text-white/40 block text-[10px] uppercase font-semibold">
              Period High
            </span>
            <span className="font-mono font-bold text-white/90">{formatNumber(stats.max)}</span>
          </div>
          <div>
            <span className="text-white/40 block text-[10px] uppercase font-semibold">
              Latest Sample
            </span>
            <span className="font-mono font-bold text-sky-300">{formatNumber(stats.last)}</span>
          </div>
        </div>
      )}

      {/* Chart Canvas */}
      <div className="h-64 w-full">
        {historyQuery.isLoading ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-xs text-white/40">
            <Loader2 className="size-5 animate-spin text-sky-400" />
            Loading historical market samples…
          </div>
        ) : chartData.length < 2 ? (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-center text-xs text-white/40 p-4">
            <AlertCircle className="size-5 text-white/30" />
            <p>No historical Coflnet auction samples found for {itemName || itemId}.</p>
            <p className="text-[11px] text-white/30">
              (Historical trends populate for actively traded Auction House and Bazaar goods).
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`cofl-${itemId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }}
                tickLine={false}
                axisLine={false}
                minTickGap={40}
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }}
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={(v: number) => formatNumber(v)}
              />
              <ChartTooltip
                formatter={(value: unknown) => [
                  `${formatNumber(Number(value))} coins`,
                  "Market Price",
                ]}
                labelFormatter={(label) => `Date: ${label}`}
                contentStyle={{
                  backgroundColor: "rgba(14, 18, 27, 0.95)",
                  borderColor: "rgba(255, 255, 255, 0.15)",
                  borderRadius: "12px",
                  fontSize: "12px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#38bdf8"
                strokeWidth={2}
                fill={`url(#cofl-${itemId})`}
                activeDot={{ r: 4, fill: "#38bdf8", stroke: "#ffffff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
