import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { ErrorState, LoadState } from "@/components/data-states";
import { PageHero, Panel, RarityTag } from "@/components/layout/app-shell";
import { MarketControls, MarketFreshness, marketControl } from "@/components/market-controls";
import { ItemIcon } from "@/components/ui/item-icon";
import { fetchAuctions } from "@/lib/hypixel.functions";
import { formatDuration, formatNumber, type AuctionEntry } from "@/lib/skyblock";

export const Route = createFileRoute("/auction-house")({
  head: () => ({ meta: [{ title: "Auction House — SkyForge" }] }),
  component: AuctionHouse,
});

const pageSize = 48;
const sorts = {
  "Ending soonest": (a: AuctionEntry, b: AuctionEntry) => a.endsInMs - b.endsInMs,
  "Lowest price": (a: AuctionEntry, b: AuctionEntry) => a.price - b.price,
  "Highest price": (a: AuctionEntry, b: AuctionEntry) => b.price - a.price,
} as const;

function AuctionHouse() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<keyof typeof sorts>("Ending soonest");
  const [kind, setKind] = useState("All listings");
  const [maxPrice, setMaxPrice] = useState("");
  const [category, setCategory] = useState("");
  const [visible, setVisible] = useState(pageSize);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 5_000);
    return () => window.clearInterval(timer);
  }, []);
  const [copyStatus, setCopyStatus] = useState<{ id: string; copied: boolean } | null>(null);
  const search = useDeferredValue(query.trim().toLowerCase());
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["auctions"],
    queryFn: () => fetchAuctions(),
    staleTime: 60_000,
    refetchInterval: 180_000,
  });
  const categories = useMemo(
    () => [...new Set((data?.entries ?? []).map((entry) => entry.category))].sort(),
    [data],
  );
  const rows = useMemo(
    () =>
      (data?.entries ?? [])
        .filter(
          (entry) =>
            (entry.endsAt === undefined || entry.endsAt > now) &&
            (kind === "All listings" || entry.bin === (kind === "BIN only")) &&
            (!category || entry.category === category) &&
            (!maxPrice || entry.price <= Number(maxPrice)) &&
            (entry.name.toLowerCase().includes(search) || entry.id?.toLowerCase().includes(search)),
        )
        .sort(sorts[sort]),
    [data, kind, category, maxPrice, search, sort, now],
  );
  const stale =
    data?.stale ||
    Boolean(error) ||
    Boolean(data?.lastUpdated && Date.now() - data.lastUpdated > 5 * 60_000);
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHero
        title="Auction House"
        actions={
          <button
            type="button"
            className={marketControl}
            disabled={isFetching}
            onClick={() => void refetch()}
          >
            {isFetching ? "Refreshing…" : "Refresh"}
          </button>
        }
      />
      <Panel className="space-y-4">
        <MarketControls
          query={query}
          onQuery={(value) => {
            setQuery(value);
            setVisible(pageSize);
          }}
          sort={sort}
          onSort={(value) => {
            setSort(value as keyof typeof sorts);
            setVisible(pageSize);
          }}
          sorts={Object.keys(sorts)}
        >
          <select
            className={marketControl}
            aria-label="Listing type"
            value={kind}
            onChange={(event) => {
              setKind(event.target.value);
              setVisible(pageSize);
            }}
          >
            <option>All listings</option>
            <option>BIN only</option>
            <option>Bids only</option>
          </select>
        </MarketControls>
        <details className="rounded-xl border border-border p-3 text-sm">
          <summary className="cursor-pointer">
            Filters{category || maxPrice ? " · Active" : ""}
          </summary>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1">
              Category
              <select
                className={marketControl}
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setVisible(pageSize);
                }}
              >
                <option value="">All categories</option>
                {categories.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              Maximum price (coins)
              <input
                type="number"
                min="0"
                step="1"
                className={marketControl}
                value={maxPrice}
                onChange={(event) => {
                  setMaxPrice(event.target.value);
                  setVisible(pageSize);
                }}
              />
            </label>
            {(category || maxPrice) && (
              <button
                type="button"
                className={marketControl}
                onClick={() => {
                  setCategory("");
                  setMaxPrice("");
                  setVisible(pageSize);
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        </details>
        {isLoading && <LoadState>Loading auction listings…</LoadState>}
        {error && !data && <ErrorState error={error} />}
        {data && !data.lastUpdated && (
          <p role="status" className="text-sm text-muted-foreground">
            Auction listings are unavailable. Try refreshing.
          </p>
        )}
        {data && data.lastUpdated > 0 && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
              <p>
                Up to 720 listings by expiry · {data.pagesScanned} of {data.totalPages} pages
                scanned
              </p>
              <MarketFreshness updated={data.lastUpdated} stale={stale} />
            </div>
            {!rows.length && (
              <p role="status" className="py-4 text-sm text-muted-foreground">
                No listings in this sample match your filters.
              </p>
            )}
            <ul className="grid gap-3 md:grid-cols-2">
              {rows.slice(0, visible).map((entry) => (
                <li
                  key={entry.uuid}
                  className="min-w-0 rounded-2xl border border-border bg-background/35 p-4"
                >
                  <div className="flex items-start gap-3">
                    <ItemIcon
                      id={entry.id ?? entry.name}
                      name={entry.name}
                      {...(entry.texture ? { texturePath: entry.texture } : {})}
                      className="size-7 shrink-0"
                    />
                    <div className="min-w-0">
                      <h2 className="break-words text-sm font-semibold">{entry.name}</h2>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <RarityTag rarity={entry.rarity} />
                        {!entry.bin && <span>{entry.bids} bids</span>}
                      </div>
                    </div>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-3 text-sm tabular-nums">
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        {entry.bin ? "Buy it now" : entry.topBid ? "Current bid" : "Starting bid"}
                      </dt>
                      <dd className="mt-1 font-medium">
                        {formatNumber(entry.bin ? entry.price : (entry.topBid ?? entry.price))}{" "}
                        coins
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Time remaining</dt>
                      <dd className="mt-1">
                        {(entry.endsAt ?? now + entry.endsInMs) > now
                          ? formatDuration((entry.endsAt ?? now + entry.endsInMs) - now)
                          : "Ended"}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs">
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText("/viewauction " + entry.uuid);
                          setCopyStatus({ id: entry.uuid, copied: true });
                        } catch {
                          setCopyStatus({ id: entry.uuid, copied: false });
                        }
                      }}
                    >
                      Copy auction command
                    </button>
                    {entry.id && (
                      <Link
                        to="/wiki/$itemId"
                        params={{ itemId: entry.id }}
                        className="text-primary hover:underline"
                      >
                        Item wiki
                      </Link>
                    )}
                  </div>
                  {copyStatus?.id === entry.uuid && (
                    <p role="status" className="mt-2 break-all text-xs text-muted-foreground">
                      {copyStatus.copied ? "Command copied." : "/viewauction " + entry.uuid}
                    </p>
                  )}
                </li>
              ))}
            </ul>
            {rows.length > visible && (
              <button
                type="button"
                className={marketControl}
                onClick={() => setVisible(visible + pageSize)}
              >
                Show more listings
              </button>
            )}
          </>
        )}
      </Panel>
    </div>
  );
}
