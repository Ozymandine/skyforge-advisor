import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { ErrorState, LoadState } from "@/components/data-states";
import { Chip, PageHero, Panel, ProgressBar, StatRow } from "@/components/layout/app-shell";
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
          label: "Average margin",
          value: `${(data.products.reduce((a, p) => a + p.margin, 0) / (data.products.length || 1)).toFixed(1)}%`,
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
            className="flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-xs font-medium transition-colors hover:border-ring/40"
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
            <div className="flex min-w-56 flex-1 items-center gap-2 rounded-xl border border-input bg-secondary/40 px-3 py-2">
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
              className="rounded-xl border border-input bg-secondary/40 px-3 py-2 text-sm outline-none"
            >
              {Object.keys(sorts).map((s) => (
                <option key={s}>{s}</option>
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
              <div key={i.id} className="glass-soft rounded-2xl px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold">{i.name}</p>
                    <p className="truncate font-mono text-[10px] text-muted-foreground">{i.id}</p>
                  </div>
                  <p className="shrink-0 text-right text-sm font-semibold text-primary">
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
                      <dd className="mt-0.5 font-mono font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="w-16 shrink-0">Liquidity</span>
                    <div className="flex-1">
                      <ProgressBar pct={i.liquidity} />
                    </div>
                    <span className="w-8 text-right">{i.liquidity}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="w-16 shrink-0">Health</span>
                    <div className="flex-1">
                      <ProgressBar pct={i.health} />
                    </div>
                    <span className="w-8 text-right">{i.health}</span>
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
