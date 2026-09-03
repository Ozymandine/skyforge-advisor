import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { IconChevronDown, IconRefreshCw, IconSearch, IconStar } from "@/assets/icons";
import { Suspense, lazy, useEffect, useMemo, useRef, useState, useDeferredValue } from "react";

const BazaarHistoryChart = lazy(() => import("@/components/bazaar-history-chart"));

import { ErrorState, LoadState } from "@/components/data-states";
import { Chip, PageHero, Panel, ProgressBar, StatRow } from "@/components/layout/app-shell";
import { ForgeCard, ForgeProgress, type ForgeRarity } from "@/components/forge";
import { ItemIcon } from "@/components/ui/item-icon";
import { MinecraftTooltip } from "@/components/ui/minecraft-tooltip";
import { Sparkline } from "@/components/ui/sparkline";
import { useWatchlist } from "@/hooks/use-watchlist";
import { mergeHistory, useServerHistory } from "@/hooks/use-market-history";
import { FlipTrackRecord } from "@/components/flip-track-record";
import { fetchBazaar, logFlip } from "@/lib/hypixel.functions";
import { formatNumber, type BazaarProduct } from "@/lib/skyblock";
import { getPriceHistory, recordBazaarSnapshot, type PricePoint } from "@/lib/price-history";

export const Route = createFileRoute("/bazaar")({
  head: () => ({
    meta: [
      { title: "Bazaar — SkyForge" },
      {
        name: "description",
        content: "Live Bazaar liquidity, margin and order-flip analysis from Hypixel.",
      },
      { property: "og:title", content: "Bazaar — SkyForge" },
      {
        property: "og:description",
        content: "Live market pricing, order tracking and high-margin flip opportunities.",
      },
      { property: "og:url", content: "https://skyforge-advisor.vercel.app/bazaar" },
      {
        property: "og:image",
        content: "https://skyforge-advisor.vercel.app/og-image.png",
      },
      {
        name: "twitter:title",
        content: "Bazaar — SkyForge",
      },
      {
        name: "twitter:image",
        content: "https://skyforge-advisor.vercel.app/og-image.png",
      },
    ],
    links: [{ rel: "canonical", href: "https://skyforge-advisor.vercel.app/bazaar" }],
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

const filters = [
  "All markets",
  "Watchlist",
  "High liquidity",
  "Low competition",
  "Cheap entry",
  "Big ticket",
];

const PAGE_SIZE = 24;

function Bazaar() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [filter, setFilter] = useState<string>("All markets");
  const [sort, setSort] = useState<keyof typeof sorts>("Profit per hour");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const watchlist = useWatchlist();

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["bazaar"],
    queryFn: () => fetchBazaar(),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  // Record price snapshots (throttled inside the store) so charts build over time.
  useEffect(() => {
    if (!data?.products?.length) return;
    recordBazaarSnapshot(
      data.products.map((p) => ({
        id: p.id,
        buyPrice: p.buyPrice,
        buyMovingWeek: p.buyMovingWeek,
      })),
      watchlist.items,
    );
  }, [data, watchlist.items]);

  // Log the top flip suggestions so accuracy can be scored later against
  // real prices (server-side store, survives sessions).
  const loggedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!data?.products?.length) return;
    const hourBucket = Math.floor(Date.now() / (60 * 60 * 1000));
    // Prune buckets older than the previous hour so the set can't grow
    // forever across long sessions.
    for (const id of loggedRef.current) {
      const bucket = Number(id.split("-").pop());
      if (Number.isFinite(bucket) && bucket < hourBucket - 1) loggedRef.current.delete(id);
    }
    const top = [...data.products].sort((a, b) => b.profitPerHour - a.profitPerHour).slice(0, 10);
    for (const p of top) {
      const id = `bz-${p.id}-${hourBucket}`;
      if (loggedRef.current.has(id)) continue;
      loggedRef.current.add(id);
      void logFlip({
        data: {
          id,
          itemId: p.id,
          price: p.buyPrice,
          expected: p.sellPrice * 0.9875,
          kind: "bazaar",
        },
      });
    }
  }, [data]);

  // (Track record is rendered by the shared FlipTrackRecord component.)

  const items = useMemo(() => {
    if (!data) return [];
    const q = deferredQuery.toLowerCase();
    return data.products
      .filter((i) => i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q))
      .filter((i) => {
        if (filter === "Watchlist") return watchlist.items.includes(i.id);
        if (filter === "High liquidity") return i.liquidity >= 70;
        if (filter === "Low competition") return i.buyVolume < 500_000;
        if (filter === "Cheap entry") return i.buyPrice < 100_000;
        if (filter === "Big ticket") return i.buyPrice >= 1_000_000;
        return true;
      })
      .sort(sorts[sort]);
  }, [data, deferredQuery, filter, sort, watchlist.items]);

  // Reset pagination whenever the result set changes shape.
  const totalMatches = items.length;
  const shown = items.slice(0, visible);

  // Reset to first page on new search/filter/sort (otherwise stale `visible`
  // keeps a long list mounted and new results appear mid-scroll).
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [deferredQuery, filter, sort]);

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
          <span
            role="status"
            aria-label="Live market data"
            className="rounded-full border border-primary/40 bg-primary/15 px-3 py-1.5 text-xs font-medium text-primary"
          >
            <span aria-hidden="true">●</span> LIVE
          </span>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium backdrop-blur-md transition-all hover:bg-white/10"
          >
            <IconRefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
        {data && (
          <div className="mt-6">
            <StatRow stats={stats} />
          </div>
        )}

        <FlipTrackRecord />
      </Panel>

      {isLoading && <LoadState>Loading live Bazaar prices…</LoadState>}
      {error && !data && <ErrorState error={error} />}

      {data && (
        <Panel aria-busy={isFetching}>
          {error && (
            <p role="status" className="mb-3 text-xs text-amber-300">
              Showing last good data — refresh failed, retrying.
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex min-w-56 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-md">
              <IconSearch aria-hidden="true" className="size-4 text-muted-foreground" />
              <label htmlFor="bazaar-search" className="sr-only">
                Search bazaar products
              </label>
              <input
                id="bazaar-search"
                role="searchbox"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search 1,900+ products..."
                autoComplete="off"
                spellCheck={false}
                className="w-full bg-transparent text-base outline-none sm:text-sm"
              />
            </div>
            <label htmlFor="bazaar-sort" className="sr-only">
              Sort products
            </label>
            <select
              id="bazaar-sort"
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
            {shown.map((i, index) => (
              <BazaarCard key={i.id} product={i} hot={sort === "Profit per hour" && index < 3} />
            ))}
          </div>
          {totalMatches > shown.length && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="rounded-full border border-primary/40 bg-primary/15 px-6 py-2 text-sm font-medium text-primary transition-all duration-75 ease-out hover:scale-[1.03] hover:bg-primary/25 active:scale-95"
              >
                Load more ({formatNumber(totalMatches - shown.length)} remaining)
              </button>
            </div>
          )}
          {totalMatches === 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <p className="text-sm text-muted-foreground">No products match that filter.</p>
              <button
                onClick={() => {
                  setQuery("");
                  setFilter("All markets");
                }}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-muted-foreground hover:bg-white/10 hover:text-foreground"
              >
                Clear filters
              </button>
            </div>
          )}
        </Panel>
      )}
    </div>
  );
}

/** One market card, with live sparkline and an expandable price-history chart. */
function BazaarCard({ product, hot = false }: { product: BazaarProduct; hot?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const watchlist = useWatchlist();
  const i = product;

  // Local snapshots (recorded while browsing)…
  const localHistory: PricePoint[] = useMemo(() => getPriceHistory(i.id), [i.id]);
  // …plus server-side history (recorded across all visitors/sessions) once expanded.
  const serverQuery = useServerHistory([i.id], 24, expanded);
  const history: PricePoint[] = useMemo(() => {
    const serverSeries = serverQuery.series.get(i.id) ?? [];
    return expanded ? mergeHistory(localHistory, serverSeries) : localHistory;
  }, [expanded, localHistory, serverQuery.series, i.id]);

  const trendPct =
    history.length >= 2 && history[0]!.v > 0
      ? ((history[history.length - 1]!.v - history[0]!.v) / history[0]!.v) * 100
      : null;

  // Margin strength drives the rarity frame — stronger flips glow harder.
  const marginRarity: ForgeRarity =
    i.margin >= 15 ? "legendary" : i.margin >= 8 ? "epic" : i.margin >= 3 ? "rare" : "common";

  return (
    <div className="relative">
      {hot && (
        <span className="font-pixel absolute -top-2.5 left-4 z-10 flex items-center gap-1 border-2 border-amber-400/60 bg-amber-400/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-200 backdrop-blur-md">
          <span aria-hidden="true">🔥</span> Hot flip
        </span>
      )}
      <ForgeCard rarity={marginRarity} className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <ItemIcon id={i.id} name={i.name} className="size-8" />
            <div className="min-w-0">
              <button
                onClick={() => watchlist.toggle(i.id)}
                aria-pressed={watchlist.has(i.id)}
                aria-label={`${watchlist.has(i.id) ? "Remove" : "Add"} ${i.name} ${watchlist.has(i.id) ? "from" : "to"} watchlist`}
                title={watchlist.has(i.id) ? "Remove from watchlist" : "Add to watchlist"}
                className="group flex min-w-0 cursor-pointer text-left"
              >
                <IconStar
                  aria-hidden="true"
                  className={`mt-1 mr-1.5 size-3.5 shrink-0 transition-all duration-75 ${
                    watchlist.has(i.id)
                      ? "fill-gold-foil text-gold-foil"
                      : "text-muted-foreground opacity-40 group-hover:opacity-100"
                  }`}
                />
                <span>
                  <span className="block truncate text-base font-semibold group-hover:text-primary">
                    {i.name}
                  </span>
                  <span className="block truncate font-mono text-[10px] text-muted-foreground">
                    {i.id}
                  </span>
                </span>
              </button>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end">
            <span className="font-pixel text-3xl font-bold leading-none text-emerald-300">
              +{i.margin.toFixed(1)}%
            </span>
            <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              margin / flip
            </span>
            <span
              role="img"
              aria-label={`${i.name} price trend: ${trendPct !== null ? `${trendPct >= 0 ? "up" : "down"} ${Math.abs(trendPct).toFixed(1)} percent` : "building history"}`}
            >
              <Sparkline points={history} />
            </span>
            {trendPct !== null && (
              <p
                aria-hidden="true"
                className={`text-[11px] font-semibold ${trendPct >= 0 ? "text-emerald-400" : "text-red-400"}`}
              >
                {trendPct >= 0 ? "▲" : "▼"} {Math.abs(trendPct).toFixed(1)}%
              </p>
            )}
            <p className="text-right text-sm font-semibold text-emerald-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              +{formatNumber(i.profitPerHour)}/hr
            </p>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
          {[
            ["Buy", formatNumber(i.buyPrice)],
            ["Sell", formatNumber(i.sellPrice)],
            ["Spread", formatNumber(i.spread)],
            ["Margin", `${i.margin.toFixed(1)}%`],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="mt-0.5 font-mono font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {v}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="w-16 shrink-0">Liquidity</span>
            <div className="flex-1">
              <ForgeProgress pct={i.liquidity} shine={i.liquidity >= 80} />
            </div>
            <span className="w-8 text-right font-mono">{i.liquidity}</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="w-16 shrink-0">Health</span>
            <div className="flex-1">
              <ForgeProgress pct={i.health} shine={i.health >= 80} />
            </div>
            <span className="w-8 text-right font-mono">{i.health}</span>
          </div>
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls={`history-${i.id}`}
          className="mt-3 flex w-full items-center justify-between rounded-lg px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
        >
          <span>
            Weekly volume {formatNumber(i.buyMovingWeek)} bought · {formatNumber(i.sellMovingWeek)}{" "}
            sold
          </span>
          <span className="flex items-center gap-1">
            {history.length >= 2 ? `${history.length} price points` : "Building history…"}
            <IconChevronDown
              aria-hidden="true"
              className={`size-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </span>
        </button>

        {expanded && (
          <div
            id={`history-${i.id}`}
            className="mt-2 h-44 w-full rounded-xl border border-white/10 bg-black/40 p-2"
          >
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  Loading chart…
                </div>
              }
            >
              <BazaarHistoryChart productId={i.id} points={history} />
            </Suspense>
          </div>
        )}
      </ForgeCard>
    </div>
  );
}
