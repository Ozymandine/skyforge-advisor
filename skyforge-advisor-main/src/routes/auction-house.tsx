import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Filter, RefreshCw, Search, SlidersHorizontal } from "lucide-react";
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";

import { ErrorState, LoadState } from "@/components/data-states";
import {
  Chip,
  PageHero,
  Panel,
  ProgressBar,
  RarityTag,
  StatRow,
} from "@/components/layout/app-shell";
import { ItemIcon } from "@/components/ui/item-icon";
import { ItemInspector, type InspectableItem } from "@/components/item-inspector";
import { FlipTrackRecord } from "@/components/flip-track-record";
import { useServerHistory } from "@/hooks/use-market-history";
import { fetchAuctions, logFlip } from "@/lib/hypixel.functions";
import { formatDuration, formatNumber, type AuctionEntry } from "@/lib/skyblock";
import { Sparkline } from "@/components/ui/sparkline";

const HistorySparkline = lazy(() => import("@/components/bin-history-sparkline"));

export const Route = createFileRoute("/auction-house")({
  head: () => ({
    meta: [
      { title: "Auction House — SkyBlock Assistant" },
      {
        name: "description",
        content: "Live auction listings, lowest BIN comparisons and flip margins from Hypixel.",
      },
      { property: "og:title", content: "Auction House — SkyBlock Assistant" },
      {
        property: "og:description",
        content: "Every active listing scanned for undercuts and flip profit.",
      },
    ],
  }),
  component: AuctionHouse,
});

const filters = ["All listings", "BIN only", "Bids only", "Underpriced", "Ending soon"];

const PAGE_SIZE = 60;

const sorts = {
  "Flip profit": (a: AuctionEntry, b: AuctionEntry) => b.profit - a.profit,
  "Highest price": (a: AuctionEntry, b: AuctionEntry) => b.price - a.price,
  "Lowest price": (a: AuctionEntry, b: AuctionEntry) => a.price - b.price,
  "Ending soonest": (a: AuctionEntry, b: AuctionEntry) => a.endsInMs - b.endsInMs,
} as const;

function AuctionHouse() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All listings");
  const [sort, setSort] = useState<keyof typeof sorts>("Flip profit");
  const [inspecting, setInspecting] = useState<InspectableItem | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);

  // Flip finder configuration
  const [minProfit, setMinProfit] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minMargin, setMinMargin] = useState("");
  const [category, setCategory] = useState("All");
  const [showFlipConfig, setShowFlipConfig] = useState(false);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["auctions"],
    queryFn: () => fetchAuctions(),
    staleTime: 60_000,
    refetchInterval: 180_000,
  });

  const categories = useMemo(() => {
    if (!data) return ["All"];
    return ["All", ...new Set(data.entries.map((a) => a.category).filter(Boolean))];
  }, [data]);

  const listings = useMemo(() => {
    if (!data) return [];
    const q = query.toLowerCase();
    const minProfitNum = Number(minProfit.replace(/[^0-9.]/g, "")) || 0;
    const maxPriceNum = Number(maxPrice.replace(/[^0-9.]/g, "")) || Infinity;
    const minMarginNum = Number(minMargin.replace(/[^0-9.]/g, "")) || 0;
    return data.entries
      .filter((a) => a.name.toLowerCase().includes(q))
      .filter((a) => {
        if (filter === "BIN only") return a.bin;
        if (filter === "Bids only") return !a.bin;
        if (filter === "Underpriced") return a.profit > 0;
        if (filter === "Ending soon") return a.endsInMs < 3600_000;
        return true;
      })
      .filter((a) => {
        if (category !== "All" && a.category !== category) return false;
        if (a.price > maxPriceNum) return false;
        if (a.profit < minProfitNum) return false;
        if (minMarginNum > 0 && a.lowestBin && a.lowestBin > 0) {
          const margin = ((a.lowestBin - a.price) / a.price) * 100;
          if (margin < minMarginNum) return false;
        } else if (minMarginNum > 0) {
          return false;
        }
        return true;
      })
      .sort(sorts[sort]);
  }, [data, query, filter, sort, minProfit, maxPrice, minMargin, category]);

  // Flip finder summary over the filtered set.
  const flipSummary = useMemo(() => {
    const flips = listings.filter((a) => a.profit > 0 && a.bin);
    const bestMargin = flips.reduce((best, a) => {
      if (!a.lowestBin || a.price <= 0) return best;
      const margin = ((a.lowestBin - a.price) / a.price) * 100;
      return Math.max(best, margin);
    }, 0);
    const totalProfit = flips.reduce((sum, a) => sum + a.profit, 0);
    return { count: flips.length, bestMargin, totalProfit };
  }, [listings]);

  const totalMatches = listings.length;
  const shown = listings.slice(0, visible);

  // Log the top flip suggestions (hourly bucket) for accuracy scoring later.
  const loggedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!data?.entries?.length) return;
    const hourBucket = Math.floor(Date.now() / (60 * 60 * 1000));
    const top = [...data.entries]
      .filter((a) => a.bin && a.profit > 0)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 10);
    for (const a of top) {
      const id = `ah-${a.uuid}-${hourBucket}`;
      if (loggedRef.current.has(id)) continue;
      loggedRef.current.add(id);
      void logFlip({
        data: {
          id,
          itemId: a.id ?? a.name,
          price: a.price,
          expected: (a.lowestBin ?? a.price) * 0.9875,
          kind: "ah",
        },
      });
    }
  }, [data]);

  // BIN history for the visible listings (batched, server-recorded).
  const sparkIds = useMemo(
    () => Array.from(new Set(shown.map((a) => a.id).filter((v): v is string => !!v))),
    [shown],
  );
  const sparkHistory = useServerHistory(sparkIds, 24, true);

  const stats = data
    ? [
        {
          label: "Active auctions",
          value: formatNumber(data.totalAuctions),
          sub: `${data.totalPages} API pages`,
        },
        {
          label: "BIN / bid listings",
          value: `${formatNumber(data.binCount)} / ${formatNumber(data.auctionCount)}`,
          sub: `${formatNumber(data.uniqueItems)} unique items scanned`,
        },
        { label: "Average BIN", value: formatNumber(data.averageBin), sub: "Scanned BIN listings" },
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
        eyebrow="Economy"
        title="Auction House"
        description="Live listings scanned from the Hypixel auction API with lowest-BIN comparisons."
      />

      <Panel>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="rounded-full border border-primary/40 bg-primary/15 px-3 py-1.5 text-xs font-medium text-primary">
            ● LIVE
          </span>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-xs font-medium transition-all duration-75 ease-out hover:scale-[1.03] hover:border-ring/40 active:scale-95"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
        {data && (
          <div className="mt-6">
            <StatRow stats={stats} />
          </div>
        )}

        <FlipTrackRecord />
      </Panel>

      {isLoading && <LoadState>Scanning active auctions…</LoadState>}
      {error && <ErrorState error={error} />}

      {data && (
        <Panel>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex min-w-56 flex-1 items-center gap-2 rounded-xl border border-input bg-secondary/40 px-3 py-2 transition-all duration-75 hover:border-ring/40">
              <Search className="size-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search listings..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as keyof typeof sorts)}
              className="rounded-xl border border-input bg-secondary/40 px-3 py-2 text-sm outline-none transition-all duration-75 hover:border-ring/40 cursor-pointer"
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
            <Chip active={showFlipConfig} onClick={() => setShowFlipConfig((v) => !v)}>
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="size-3" /> Flip finder
              </span>
            </Chip>
          </div>

          {showFlipConfig && (
            <div className="mt-4 rounded-2xl border border-primary/25 bg-primary/5 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Filter className="size-4 text-primary" /> Flip finder
                <span className="text-xs font-normal text-muted-foreground">
                  {flipSummary.count} qualifying flips · best margin{" "}
                  {flipSummary.bestMargin.toFixed(0)}% · {formatNumber(flipSummary.totalProfit)}{" "}
                  total profit on screen
                </span>
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-4">
                <label className="text-xs text-muted-foreground">
                  Min profit (coins)
                  <input
                    value={minProfit}
                    onChange={(e) => setMinProfit(e.target.value)}
                    placeholder="e.g. 500k"
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary/60"
                  />
                </label>
                <label className="text-xs text-muted-foreground">
                  Max price (coins)
                  <input
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="e.g. 20m"
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary/60"
                  />
                </label>
                <label className="text-xs text-muted-foreground">
                  Min margin (%)
                  <input
                    value={minMargin}
                    onChange={(e) => setMinMargin(e.target.value)}
                    placeholder="e.g. 25"
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary/60"
                  />
                </label>
                <label className="text-xs text-muted-foreground">
                  Category
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary/60"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {(minProfit || maxPrice || minMargin || category !== "All") && (
                <button
                  onClick={() => {
                    setMinProfit("");
                    setMaxPrice("");
                    setMinMargin("");
                    setCategory("All");
                  }}
                  className="mt-3 text-xs text-primary hover:underline"
                >
                  Reset flip filters
                </button>
              )}
            </div>
          )}

          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            {shown.map((a, index) => {
              const value =
                a.lowestBin && a.lowestBin > 0
                  ? Math.max(0, Math.min(100, Math.round((1 - a.price / a.lowestBin) * 100 + 50)))
                  : 50;
              const hot = sort === "Flip profit" && a.profit > 0 && index < 3;
              const spark = a.id ? sparkHistory.series.get(a.id) : undefined;
              return (
                <button
                  key={a.uuid}
                  onClick={() =>
                    setInspecting({
                      name: a.name,
                      ...(a.id ? { id: a.id } : {}),
                      rarity: a.rarity,
                      price: a.price,
                      lowestBin: a.lowestBin,
                      profit: a.profit,
                    })
                  }
                  className={`glass-soft relative w-full cursor-pointer rounded-2xl px-5 py-4 text-left transition-all duration-75 ease-out hover:scale-[1.01] hover:border-primary/30 ${
                    hot ? "border-amber-400/40 shadow-[0_0_20px_rgba(251,191,36,0.12)]" : ""
                  }`}
                >
                  {hot && (
                    <span className="absolute -top-2.5 left-4 rounded-full border border-amber-400/50 bg-amber-400/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-300 backdrop-blur-md animate-pulse">
                      🔥 Hot flip
                    </span>
                  )}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <ItemIcon
                        id={a.id ?? a.name}
                        name={a.name}
                        {...(a.texture ? { texturePath: a.texture } : {})}
                        className="size-8"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold">{a.name}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <RarityTag rarity={a.rarity} />
                          <span className="rounded-md border border-border px-1.5 py-0.5 text-[10px] tracking-widest text-muted-foreground">
                            {a.bin ? "BIN" : `AUCTION · ${a.bids} bids`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      {spark && spark.length >= 2 && (
                        <Suspense fallback={null}>
                          <HistorySparkline itemId={a.id!} />
                        </Suspense>
                      )}
                      <p className="text-right text-sm font-semibold">{formatNumber(a.price)}</p>
                    </div>
                  </div>

                  <dl className="mt-4 grid grid-cols-3 gap-2 text-xs">
                    {[
                      ["Lowest BIN", a.lowestBin ? formatNumber(a.lowestBin) : "—"],
                      [
                        "Flip profit",
                        a.profit > 0 ? `+${formatNumber(a.profit)}` : formatNumber(a.profit),
                      ],
                      ["Ends in", formatDuration(a.endsInMs)],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <dt className="text-muted-foreground">{k}</dt>
                        <dd className="mt-0.5 font-mono font-medium">{v}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-4 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="w-16 shrink-0">Value</span>
                    <div className="flex-1">
                      <ProgressBar pct={value} />
                    </div>
                    <span className="w-8 text-right">{value}</span>
                  </div>
                  <p className="mt-3 truncate font-mono text-[10px] text-muted-foreground">
                    {a.category} · {a.uuid}
                  </p>
                </button>
              );
            })}
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
            <p className="mt-6 text-sm text-muted-foreground">No listings match that filter.</p>
          )}
        </Panel>
      )}

      <ItemInspector item={inspecting} onClose={() => setInspecting(null)} />
    </div>
  );
}
