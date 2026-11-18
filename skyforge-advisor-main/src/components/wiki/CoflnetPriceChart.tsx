import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchExternalPriceHistory } from "@/lib/hypixel.functions";
import { formatNumber } from "@/lib/skyblock";
import { formatCoins } from "@/lib/market-format";
import type { HistoryMarket, HistoryPoint } from "@/lib/coflnet-history";
import { cn } from "@/lib/utils";

const emptyPoints: HistoryPoint[] = [];
const dateLabel = (time: number) =>
  new Date(time).toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" });

export default function CoflnetPriceChart({
  itemId,
  itemName,
  market = "auction",
}: {
  itemId: string;
  itemName?: string;
  market?: HistoryMarket;
}) {
  const [days, setDays] = useState<30 | 90>(30);
  const history = useQuery({
    queryKey: ["coflnet-price-history", market, itemId, days],
    queryFn: () => fetchExternalPriceHistory({ data: { itemId, days, market } }),
    staleTime: 15 * 60_000,
    retry: false,
  });
  const points = history.data?.points ?? emptyPoints;
  const stats = useMemo(() => {
    if (points.length < 2) return null;
    const prices = points.map((point) => point.v);
    return { min: Math.min(...prices), max: Math.max(...prices), last: points.at(-1)!.v };
  }, [points]);
  const unavailable = history.isError || history.data?.status === "unavailable";
  const failure = history.data?.failure;
  const reason =
    failure === "rate-limited"
      ? "Coflnet is limiting requests. Please try again shortly."
      : failure === "restricted"
        ? "Coflnet requires additional access for this history."
        : "The Coflnet history feed could not be read. This does not mean the item has no trading history.";
  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <img src="/vanilla/clock.png" alt="" className="size-5 [image-rendering:pixelated]" />
          <h3 className="text-sm font-semibold">
            Coflnet {market === "bazaar" ? "Bazaar quotes" : "auction sale history"}
          </h3>
        </div>
        <div className="flex gap-1 rounded-xl border border-border bg-background/35 p-1">
          {([30, 90] as const).map((range) => (
            <button
              key={range}
              type="button"
              aria-pressed={days === range}
              onClick={() => setDays(range)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs transition-colors",
                days === range
                  ? "bg-primary/15 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {range} days
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {market === "auction"
          ? "Historical average auction sale prices across item variants. These samples are separate from the comparable active BIN quote above."
          : "Historical Bazaar buy and sell quotes reported by Coflnet. Quotes are indicative and do not guarantee an order will fill."}
      </p>
      {history.isLoading ? (
        <p role="status" className="py-10 text-center text-sm text-muted-foreground">
          Loading Coflnet history…
        </p>
      ) : unavailable ? (
        <div role="status" className="rounded-xl border border-border bg-background/35 p-4 text-sm">
          <p>{reason}</p>
          <button
            type="button"
            onClick={() => void history.refetch()}
            disabled={history.isFetching}
            className="mt-3 text-primary hover:underline disabled:opacity-50"
          >
            {history.isFetching ? "Retrying…" : "Retry history"}
          </button>
        </div>
      ) : !stats ? (
        <p
          role="status"
          className="rounded-xl border border-border p-4 text-sm text-muted-foreground"
        >
          Coflnet returned fewer than two usable samples for {itemName || itemId} in this window. A
          trend cannot be drawn.
        </p>
      ) : (
        <>
          {history.data?.status === "stale" && (
            <p role="status" className="text-xs text-amber-500">
              Cached history · Coflnet could not be refreshed. The dates below show the saved sample
              coverage.
            </p>
          )}
          <dl className="grid grid-cols-3 gap-3 rounded-xl border border-border bg-background/35 p-3 text-xs">
            {[
              [market === "bazaar" ? "Low buy quote" : "Low sample average", stats.min],
              [market === "bazaar" ? "High buy quote" : "High sample average", stats.max],
              ["Latest sample", stats.last],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="mt-1 font-mono text-sm font-semibold tabular-nums">
                  {formatCoins(Number(value))}
                </dd>
              </div>
            ))}
          </dl>
          <div
            className="h-64 min-w-0 w-full"
            role="img"
            aria-label={`${itemName || itemId} price history from ${dateLabel(points[0]!.t)} to ${dateLabel(points.at(-1)!.t)}. Latest sample ${formatCoins(stats.last)} coins.`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={points} margin={{ top: 12, right: 12, bottom: 4, left: 0 }}>
                <CartesianGrid
                  stroke="var(--color-border)"
                  strokeDasharray="3 4"
                  vertical={false}
                />
                <XAxis
                  dataKey="t"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  tickFormatter={dateLabel}
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  tickLine={false}
                  minTickGap={30}
                />
                <YAxis
                  width={58}
                  tickFormatter={formatCoins}
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  tickLine={false}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  labelFormatter={(value) => `${dateLabel(Number(value))} · UTC`}
                  formatter={(value: unknown, name: unknown) => [
                    `${formatCoins(Number(value))} coins`,
                    String(name),
                  ]}
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    borderColor: "var(--color-border)",
                    borderRadius: 12,
                    color: "var(--color-foreground)",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="linear"
                  dataKey="v"
                  name={market === "bazaar" ? "Buy quote" : "Average sale price"}
                  stroke="#53b8ee"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                {market === "bazaar" && (
                  <Line
                    type="linear"
                    dataKey="sell"
                    name="Sell quote"
                    stroke="#5dca98"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
          {market === "bazaar" && (
            <p className="flex flex-wrap gap-4 text-xs">
              <span className="text-sky-400">● Buy quote</span>
              <span className="text-emerald-400">● Sell quote</span>
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              {points.length} samples · {dateLabel(points[0]!.t)} – {dateLabel(points.at(-1)!.t)}{" "}
              UTC
            </span>
            <span>Sample spacing and coverage may vary.</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Retrieved{" "}
            {new Date(history.data!.fetchedAt).toLocaleString(undefined, {
              timeZone: "UTC",
              dateStyle: "medium",
              timeStyle: "short",
            })}{" "}
            UTC
          </p>
        </>
      )}
      <a
        href={
          market === "bazaar"
            ? `https://sky.coflnet.com/bazaar/${encodeURIComponent(itemId)}`
            : `https://sky.coflnet.com/item/${encodeURIComponent(itemId)}`
        }
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-xs text-primary hover:underline"
      >
        Source: SkyCofl / Coflnet ↗
      </a>
    </div>
  );
}
