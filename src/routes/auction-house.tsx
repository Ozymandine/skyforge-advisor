import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { ErrorState, LoadState } from "@/components/data-states";
import { Chip, PageHero, Panel, ProgressBar, RarityTag, StatRow } from "@/components/layout/app-shell";
import { ItemIcon } from "@/components/ui/item-icon";
import { fetchAuctions } from "@/lib/hypixel.functions";
import { formatDuration, formatNumber, type AuctionEntry } from "@/lib/skyblock";

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

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["auctions"],
    queryFn: () => fetchAuctions(),
    staleTime: 60_000,
    refetchInterval: 180_000,
  });

  const listings = useMemo(() => {
    if (!data) return [];
    const q = query.toLowerCase();
    return data.entries
      .filter((a) => a.name.toLowerCase().includes(q))
      .filter((a) => {
        if (filter === "BIN only") return a.bin;
        if (filter === "Bids only") return !a.bin;
        if (filter === "Underpriced") return a.profit > 0;
        if (filter === "Ending soon") return a.endsInMs < 3600_000;
        return true;
      })
      .sort(sorts[sort])
      .slice(0, 60);
  }, [data, query, filter, sort]);

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
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            {listings.map((a) => {
              const value =
                a.lowestBin && a.lowestBin > 0
                  ? Math.max(0, Math.min(100, Math.round((1 - a.price / a.lowestBin) * 100 + 50)))
                  : 50;
              return (
                <div
                  key={a.uuid}
                  className="glass-soft rounded-2xl px-5 py-4 transition-all duration-75 ease-out hover:scale-[1.01] hover:border-primary/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <ItemIcon id={a.id ?? a.name} name={a.name} className="size-8" />
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
                    <p className="shrink-0 text-right text-sm font-semibold">
                      {formatNumber(a.price)}
                    </p>
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
                </div>
              );
            })}
          </div>
          {listings.length === 0 && (
            <p className="mt-6 text-sm text-muted-foreground">No listings match that filter.</p>
          )}
        </Panel>
      )}
    </div>
  );
}
