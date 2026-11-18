import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { lazy, Suspense, useDeferredValue, useMemo, useState } from "react";
import { ErrorState, LoadState } from "@/components/data-states";
import { PageHero, Panel } from "@/components/layout/app-shell";
import { MarketControls, MarketFreshness, marketControl } from "@/components/market-controls";
import { ItemIcon } from "@/components/ui/item-icon";
import { useWatchlist } from "@/hooks/use-watchlist";
import { fetchBazaar } from "@/lib/hypixel.functions";
import { formatNumber, type BazaarProduct } from "@/lib/skyblock";
import { formatCoins } from "@/lib/market-format";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CoflnetPriceChart = lazy(() => import("@/components/wiki/CoflnetPriceChart"));

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
  const [historyItem, setHistoryItem] = useState<BazaarProduct | null>(null);
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
              {data?.products.length.toLocaleString()} markets · Indicative order quotes per item.
              After-fee spread assumes a 1.25% sell fee and both orders filling at the displayed
              prices. Volume does not guarantee a fill.
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
                        <dd
                          className="mt-1 font-mono text-base font-semibold"
                          title={item.sellPrice.toLocaleString("en-US", {
                            maximumFractionDigits: 4,
                          })}
                        >
                          {formatCoins(item.sellPrice)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Sell offer</dt>
                        <dd
                          className="mt-1 font-mono text-base font-semibold"
                          title={item.buyPrice.toLocaleString("en-US", {
                            maximumFractionDigits: 4,
                          })}
                        >
                          {formatCoins(item.buyPrice)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Est. net / unit</dt>
                        <dd
                          className={
                            "mt-1 font-mono text-base font-semibold " +
                            (item.spread >= 0 ? "text-emerald-400" : "text-rose-400")
                          }
                          title={item.spread.toLocaleString("en-US", { maximumFractionDigits: 4 })}
                        >
                          {item.spread > 0 ? "+" : ""}
                          {formatCoins(item.spread)}
                        </dd>
                      </div>
                    </dl>
                    <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3 text-xs tabular-nums">
                      <div>
                        <dt className="text-muted-foreground">Gross spread</dt>
                        <dd className="mt-1 font-medium">
                          {formatCoins(item.buyPrice - item.sellPrice)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Sale fee / unit</dt>
                        <dd className="mt-1 font-medium">
                          {formatCoins(item.buyPrice - item.sellPrice - item.spread)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Est. margin</dt>
                        <dd className="mt-1 font-medium">{item.margin.toFixed(2)}%</dd>
                      </div>
                    </dl>
                    <div className="mt-4 rounded-xl bg-background/25 p-3">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-muted-foreground">Buy volume · 7d</p>
                          <p className="mt-1 font-mono text-sky-400">
                            {formatNumber(item.buyMovingWeek)} units
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground">Sell volume · 7d</p>
                          <p className="mt-1 font-mono text-emerald-400">
                            {formatNumber(item.sellMovingWeek)} units
                          </p>
                        </div>
                      </div>
                      <div
                        aria-hidden="true"
                        className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-foreground/10"
                      >
                        <div
                          className="bg-sky-400 transition-[width] duration-300"
                          style={{
                            width: `${volume(item) ? (item.buyMovingWeek / volume(item)) * 100 : 0}%`,
                          }}
                        />
                        <div
                          className="bg-emerald-400 transition-[width] duration-300"
                          style={{
                            width: `${volume(item) ? (item.sellMovingWeek / volume(item)) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                      <Link
                        to="/wiki/$itemId"
                        params={{ itemId: item.id }}
                        className="text-muted-foreground hover:text-primary hover:underline"
                      >
                        Item guide →
                      </Link>
                      <button
                        type="button"
                        onClick={() => setHistoryItem(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-primary transition-colors hover:bg-primary/10"
                        aria-label={`Price history for ${item.name}`}
                      >
                        <img
                          src="/vanilla/clock.png"
                          alt=""
                          className="size-4 [image-rendering:pixelated]"
                        />
                        Price history
                      </button>
                    </div>
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
      <Dialog
        open={Boolean(historyItem)}
        onOpenChange={(open) => {
          if (!open) setHistoryItem(null);
        }}
      >
        <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-2xl border-border bg-background p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{historyItem?.name} · price history</DialogTitle>
            <DialogDescription>
              Historical quotes from Coflnet, separate from the current Hypixel snapshot.
            </DialogDescription>
          </DialogHeader>
          {historyItem && (
            <Suspense
              fallback={
                <p role="status" className="py-10 text-center text-sm text-muted-foreground">
                  Loading chart…
                </p>
              }
            >
              <CoflnetPriceChart
                key={historyItem.id}
                itemId={historyItem.id}
                itemName={historyItem.name}
                market="bazaar"
              />
            </Suspense>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
