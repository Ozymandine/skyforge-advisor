import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useDeferredValue, useMemo, useState } from "react";
import { ErrorState, LoadState } from "@/components/data-states";
import { PageHero, Panel } from "@/components/layout/app-shell";
import { MarketControls, MarketFreshness, marketControl } from "@/components/market-controls";
import { ItemIcon } from "@/components/ui/item-icon";
import { useWatchlist } from "@/hooks/use-watchlist";
import { fetchBazaar } from "@/lib/hypixel.functions";
import { formatNumber, type BazaarProduct } from "@/lib/skyblock";

const pageSize = 48;
const volume = (item: BazaarProduct) => item.buyMovingWeek + item.sellMovingWeek;
const sorts = {
  "Weekly volume": (a: BazaarProduct, b: BazaarProduct) => volume(b) - volume(a),
  "Net spread": (a: BazaarProduct, b: BazaarProduct) => b.spread - a.spread,
  "Net margin": (a: BazaarProduct, b: BazaarProduct) => b.margin - a.margin,
  "Lowest order price": (a: BazaarProduct, b: BazaarProduct) => a.sellPrice - b.sellPrice,
} as const;

export function BazaarBoard({ spreadMode = false }: { spreadMode?: boolean }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<keyof typeof sorts>("Weekly volume");
  const [watching, setWatching] = useState(false);
  const [positiveOnly, setPositiveOnly] = useState(spreadMode);
  const [visible, setVisible] = useState(pageSize);
  const search = useDeferredValue(query.trim().toLowerCase());
  const watchlist = useWatchlist();
  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["bazaar"],
    queryFn: () => fetchBazaar(),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
  const rows = useMemo(
    () =>
      (data?.products ?? [])
        .filter(
          (item) =>
            (!watching || watchlist.items.includes(item.id)) &&
            (!positiveOnly || item.spread > 0) &&
            (item.name.toLowerCase().includes(search) || item.id.toLowerCase().includes(search)),
        )
        .sort(sorts[sort]),
    [data, search, sort, watching, positiveOnly, watchlist.items],
  );
  const unavailable = !data?.lastUpdated && (Boolean(error) || data?.stale);
  const stale =
    data?.stale ||
    Boolean(error) ||
    Boolean(data?.lastUpdated && Date.now() - data.lastUpdated > 5 * 60_000);
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHero
        title={spreadMode ? "Bazaar spreads" : "Bazaar"}
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
          <button
            type="button"
            className={marketControl + (watching ? " border-primary font-semibold" : "")}
            aria-pressed={watching}
            onClick={() => {
              setWatching(!watching);
              setVisible(pageSize);
            }}
          >
            Watchlist
          </button>
        </MarketControls>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={positiveOnly}
              onChange={(event) => {
                setPositiveOnly(event.target.checked);
                setVisible(pageSize);
              }}
            />
            Positive net spread
          </label>
          <MarketFreshness updated={data?.lastUpdated} stale={stale} />
        </div>
        {isLoading && <LoadState>Loading Bazaar prices…</LoadState>}
        {error && !data && <ErrorState error={error} />}
        {unavailable && !error && (
          <p role="status" className="text-sm text-muted-foreground">
            Bazaar prices are unavailable. Try refreshing.
          </p>
        )}
        {Boolean(data?.lastUpdated) && (
          <>
            <p className="border-t border-border pt-4 text-xs text-muted-foreground">
              Indicative order prices. Net spread assumes a 1.25% sell fee and both orders filling
              at the displayed prices.
            </p>
            {rows.length === 0 && (
              <p role="status" className="py-4 text-sm text-muted-foreground">
                {watching && !watchlist.items.length
                  ? "Your watchlist is empty. Save an item from the market list."
                  : "No items match your filters."}
              </p>
            )}
            <ul className="grid gap-3 md:grid-cols-2">
              {rows.slice(0, visible).map((item) => {
                const saved = watchlist.has(item.id);
                return (
                  <li
                    key={item.id}
                    className="min-w-0 rounded-2xl border border-border bg-background/35 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <ItemIcon id={item.id} name={item.name} className="size-7 shrink-0" />
                      <h2 className="min-w-0 flex-1 break-words text-sm font-semibold">
                        <Link
                          to="/wiki/$itemId"
                          params={{ itemId: item.id }}
                          className="hover:underline"
                        >
                          {item.name}
                        </Link>
                      </h2>
                      <button
                        type="button"
                        className="shrink-0 rounded-lg px-2 py-1 text-xs text-primary hover:underline"
                        aria-pressed={saved}
                        aria-label={
                          (saved ? "Remove " : "Save ") +
                          item.name +
                          (saved ? " from watchlist" : " to watchlist")
                        }
                        onClick={() => watchlist.toggle(item.id)}
                      >
                        {saved ? "Saved" : "Save"}
                      </button>
                    </div>
                    <dl className="mt-3 grid grid-cols-3 gap-2 text-xs tabular-nums">
                      <div>
                        <dt className="text-muted-foreground">Buy order</dt>
                        <dd className="mt-1 font-medium">{formatNumber(item.sellPrice)}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Sell offer</dt>
                        <dd className="mt-1 font-medium">{formatNumber(item.buyPrice)}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Net spread</dt>
                        <dd className="mt-1 font-medium">
                          {item.spread > 0 ? "+" : ""}
                          {formatNumber(item.spread)}
                        </dd>
                      </div>
                    </dl>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Weekly volume · {formatNumber(volume(item))} units
                    </p>
                  </li>
                );
              })}
            </ul>
            {rows.length > visible && (
              <button
                className={marketControl}
                type="button"
                onClick={() => setVisible(visible + pageSize)}
              >
                Show more items
              </button>
            )}
          </>
        )}
      </Panel>
    </div>
  );
}
