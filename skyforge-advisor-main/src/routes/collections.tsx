import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useDeferredValue, useMemo, useState } from "react";
import { ConnectPrompt, ErrorState, LoadState } from "@/components/data-states";
import { PageHero, Panel, ProgressBar } from "@/components/layout/app-shell";
import { marketControl } from "@/components/market-controls";
import { ItemIcon } from "@/components/ui/item-icon";
import { usePlayer } from "@/hooks/use-account";
import { getCollectionProgress } from "@/lib/collection-progress";
import { fetchCollectionTiers } from "@/lib/hypixel.functions";
import { formatFull } from "@/lib/skyblock";

export const Route = createFileRoute("/collections")({
  head: () => ({ meta: [{ title: "Collections — SkyForge" }] }),
  component: Collections,
});

function Collections() {
  const { data, isLoading, error, connected } = usePlayer();
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const search = useDeferredValue(query.trim().toLowerCase());
  const tiers = useQuery({
    queryKey: ["collection-tiers"],
    queryFn: () => fetchCollectionTiers(),
    enabled: !!data?.availability?.collections,
    staleTime: 60 * 60_000,
  });
  const rows = useMemo(
    () =>
      (data?.collections ?? []).map((item) => {
        const definition = tiers.data?.[item.id];
        return {
          ...item,
          name: definition?.name ?? item.name,
          category: definition?.category ?? "Other collections",
          progress: definition ? getCollectionProgress(item.amount, definition.tiers) : null,
        };
      }),
    [data, tiers.data],
  );
  const categories = [...new Set(rows.map((row) => row.category))].sort();
  const visible = rows.filter(
    (row) =>
      (!category || row.category === category) &&
      (!search || row.name.toLowerCase().includes(search) || row.id.toLowerCase().includes(search)),
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHero title="Collections" />
      {!connected && <ConnectPrompt what="your collections" />}
      {connected && isLoading && <LoadState>Loading collections…</LoadState>}
      {connected && error && <ErrorState error={error} />}
      {connected && data && (
        <>
          <Panel>
            <div className="flex flex-wrap items-end gap-3">
              <label className="min-w-44 flex-1 text-sm">
                <span className="sr-only">Search collections</span>
                <input
                  type="search"
                  placeholder="Search collections…"
                  className={marketControl + " w-full"}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
              <label className="text-sm">
                <span className="sr-only">Collection category</span>
                <select
                  className={marketControl}
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  <option value="">All categories</option>
                  {categories.map((name) => (
                    <option key={name}>{name}</option>
                  ))}
                </select>
              </label>
            </div>
            {!data.availability?.collections ? (
              <p role="status" className="mt-4 text-sm text-muted-foreground">
                Collection data is unavailable for this profile.
              </p>
            ) : (
              <>
                {tiers.isPending && (
                  <p role="status" className="mt-4 text-sm text-muted-foreground">
                    Loading tier requirements…
                  </p>
                )}
                {(tiers.isError || tiers.data === null) && (
                  <p role="status" className="mt-4 text-sm text-muted-foreground">
                    Hypixel tier requirements are unavailable. Collected amounts are shown below.
                  </p>
                )}
                {visible.length === 0 && (
                  <p role="status" className="mt-4 text-sm text-muted-foreground">
                    {rows.length
                      ? "No collections match your filters."
                      : "This profile has no recorded collections."}
                  </p>
                )}
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {visible.map((item) => (
                    <li
                      key={item.id}
                      className="min-w-0 space-y-2 rounded-xl border border-border bg-background/35 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <ItemIcon id={item.id} name={item.name} className="size-6 shrink-0" />
                        <span className="min-w-0 flex-1 break-words text-sm font-medium">
                          {item.name}
                        </span>
                        <span className="text-sm tabular-nums">{formatFull(item.amount)}</span>
                      </div>
                      {item.progress && (
                        <>
                          <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                            <span>
                              {item.progress.tier > 0
                                ? `Tier ${item.progress.tier}`
                                : "First tier in progress"}
                            </span>
                            <span className="tabular-nums">
                              {item.progress.remaining
                                ? `${formatFull(item.progress.remaining)} to next tier`
                                : "Max tier"}
                            </span>
                          </div>
                          <ProgressBar pct={item.progress.progress} />
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Panel>
          <Panel className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Unique minion crafts</h2>
              <p className="text-sm text-muted-foreground">
                {data.craftedGenerators === undefined
                  ? "Craft history unavailable"
                  : formatFull(new Set(data.craftedGenerators).size)}
              </p>
            </div>
            <Link to="/minions" className="text-sm text-primary hover:underline">
              View minions
            </Link>
          </Panel>
        </>
      )}
    </div>
  );
}
