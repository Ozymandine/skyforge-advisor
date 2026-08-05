import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { ErrorState, LoadState } from "@/components/data-states";
import { Chip, PageHero, Panel, ProgressBar, StatRow } from "@/components/layout/app-shell";
import { ItemIcon } from "@/components/ui/item-icon";
import { fetchBazaar } from "@/lib/hypixel.functions";
import { formatNumber, type BazaarProduct } from "@/lib/skyblock";

export const Route = createFileRoute("/bazaar")({
  head: () => ({
    meta: [
      { title: "Bazaar — SkyBlock Assistant" },
      {
        name: "description",
        content: "Live Bazaar liquidity, margin and order-flip analysis from Hypixel.",
      },
      { property: "og:title", content: "Bazaar — SkyBlock Assistant" },
      {
        property: "og:description",
        content: "Live market pricing, order tracking and high-margin flip opportunities.",
      },
    ],
  }),
  component: Bazaar,
});

const sorts = {
  "Profit per hour": (a: BazaarProduct, b: BazaarProduct) => b.profitPerHour - a.profitPerHour,
  "Margin %": (a: BazaarProduct, b: BazaarProduct) => b.margin - a.margin,
  "Spread per unit": (a: BazaarProduct, b: BazaarProduct) => b.spread - a.spread,
  "Weekly volume": (a: BazaarProduct, b: BazaarProduct) => b.buyMovingWeek - a.buyMovingWeek,
  "Buy price": (a: BazaarProduct, b: BazaarProduct) => b.buyPrice - a.buyPrice,
} as const;

function medianMargin(products: BazaarProduct[]): number {
  if (!products.length) return 0;
  const sorted = [...products].map((p) => p.margin).sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

const filters = ["All markets", "High liquidity", "Low competition", "Cheap entry", "Big ticket"];

function Bazaar() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("All markets");
  const [sort, setSort] = useState<keyof typeof sorts>("Profit per hour");

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["bazaar"],
    queryFn: () => fetchBazaar(),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const items = useMemo(() => {
    if (!data) return [];
    const q = query.toLowerCase();
    return data.products
      .filter((i) => i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q))
      .filter((i) => {
        if (filter === "High liquidity") return i.liquidity >= 70;
        if (filter === "Low competition") return i.buyVolume < 500_000;
        if (filter === "Cheap entry") return i.buyPrice < 100_000;
        if (filter === "Big ticket") return i.buyPrice >= 1_000_000;
        return true;
      })
      .sort(sorts[sort])
      .slice(0, 60);
  }, [data, query, filter, sort]);

  const stats = data
    ? [
        {
          label: "Bazaar products",
          value: formatNumber(data.products.length),
          sub: "Official Hypixel feed",
        },
        {
          label: "Profitable markets",
          value: formatNumber(data.products.filter((p) => p.spread > 0).length),
          sub: "After 1.25% tax",
        },
        {
          label: "Median margin",
          value: `${medianMargin(data.products).toFixed(1)}%`,
          sub: "Order-to-order",
        },
        {
          label: "Last updated",
          value: new Date(data.lastUpdated).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          sub: "Hypixel timestamp",
        },
      ]
    : [];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHero
        eyebrow="Market intelligence"
        title="Bazaar"
        description="Live liquidity, margin and order-flip analysis straight from the Hypixel Bazaar API."
      />

      <Panel>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="rounded-full border border-primary/40 bg-primary/15 px-3 py-1.5 text-xs font-medium text-primary">
            ● LIVE
          </span>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium backdrop-blur-md transition-all hover:bg-white/10"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
        {data && (
          <div className="mt-6">
            <StatRow stats={stats} />
          </div>
        )}
      </Panel>

      {isLoading && <LoadState>Loading live Bazaar prices…</LoadState>}
      {error && <ErrorState error={error} />}

      {data && (
        <Panel>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex min-w-56 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-md">
              <Search className="size-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search 1,900+ products..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as keyof typeof sorts)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none cursor-pointer backdrop-blur-md"
            >
              {Object.keys(sorts).map((s) => (
                <option key={s} className="bg-slate-950 text-white">
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {filters.map((f) => (
              <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
                {f}
              </Chip>
            ))}
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            {items.map((i) => (
              <div
                key={i.id}
                className="rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-md transition-all duration-75 ease-out hover:scale-[1.01] hover:border-primary/40 shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <ItemIcon id={i.id} name={i.name} className="size-8" />
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold">{i.name}</p>
                      <p className="truncate font-mono text-[10px] text-muted-foreground">{i.id}</p>
                    </div>
                  </div>
                  <p className="shrink-0 text-right text-sm font-semibold text-emerald-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    +{formatNumber(i.profitPerHour)}/hr
                  </p>
                </div>

                <dl className="mt-4 grid grid-cols-4 gap-2 text-xs">
                  {[
                    ["Buy", formatNumber(i.buyPrice)],
                    ["Sell", formatNumber(i.sellPrice)],
                    ["Spread", formatNumber(i.spread)],
                    ["Margin", `${i.margin.toFixed(1)}%`],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="mt-0.5 font-mono font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{v}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="w-16 shrink-0">Liquidity</span>
                    <div className="flex-1">
                      <ProgressBar pct={i.liquidity} />
                    </div>
                    <span className="w-8 text-right font-mono">{i.liquidity}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="w-16 shrink-0">Health</span>
                    <div className="flex-1">
                      <ProgressBar pct={i.health} />
                    </div>
                    <span className="w-8 text-right font-mono">{i.health}</span>
                  </div>
                </div>

                <p className="mt-3 text-[11px] text-muted-foreground">
                  Weekly volume {formatNumber(i.buyMovingWeek)} bought ·{" "}
                  {formatNumber(i.sellMovingWeek)} sold
                </p>
              </div>
            ))}
          </div>
          {items.length === 0 && (
            <p className="mt-6 text-sm text-muted-foreground">No products match that filter.</p>
          )}
        </Panel>
      )}
    </div>
  );
}