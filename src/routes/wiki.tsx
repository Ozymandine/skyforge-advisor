import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { ErrorState, LoadState } from "@/components/data-states";
import { Chip, PageHero, Panel, RarityTag } from "@/components/layout/app-shell";
import { fetchBazaar, fetchItems } from "@/lib/hypixel.functions";
import { formatNumber } from "@/lib/skyblock";

export const Route = createFileRoute("/wiki")({
  head: () => ({
    meta: [
      { title: "Wiki — SkyBlock Assistant" },
      {
        name: "description",
        content: "Searchable index of every SkyBlock item with rarity, category and live pricing.",
      },
      { property: "og:title", content: "Wiki — SkyBlock Assistant" },
      {
        property: "og:description",
        content: "Every SkyBlock item, straight from the Hypixel resources API.",
      },
    ],
  }),
  component: Wiki,
});

function Wiki() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const items = useQuery({
    queryKey: ["items"],
    queryFn: () => fetchItems(),
    staleTime: 30 * 60_000,
  });
  const bazaar = useQuery({
    queryKey: ["bazaar"],
    queryFn: () => fetchBazaar(),
    staleTime: 60_000,
  });

  const prices = useMemo(
    () => new Map((bazaar.data?.products ?? []).map((p) => [p.id, p])),
    [bazaar.data],
  );

  const categories = useMemo(() => {
    const set = new Set((items.data ?? []).map((i) => i.category));
    return ["All", ...[...set].sort()].slice(0, 14);
  }, [items.data]);

  const results = useMemo(() => {
    const q = query.toLowerCase();
    return (items.data ?? [])
      .filter((i) => (category === "All" ? true : i.category === category))
      .filter((i) => i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q))
      .slice(0, 60);
  }, [items.data, query, category]);

  const selected = (items.data ?? []).find((i) => i.id === selectedId) ?? results[0];
  const price = selected ? prices.get(selected.id) : undefined;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHero
        eyebrow="Tools"
        title="Wiki"
        description="Every SkyBlock item from the official resources API, cross-referenced with live Bazaar pricing."
      />

      {items.isLoading && <LoadState>Loading the item database…</LoadState>}
      {items.error && <ErrorState error={items.error} />}

      {items.data && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Panel className="lg:col-span-2">
            <div className="flex items-center gap-2 rounded-xl border border-input bg-secondary/40 px-3 py-2">
              <Search className="size-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${formatNumber(items.data.length)} items...`}
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((c) => (
                <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                  {c}
                </Chip>
              ))}
            </div>

            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {results.map((i) => (
                <button
                  key={i.id}
                  onClick={() => setSelectedId(i.id)}
                  className={`glass-soft rounded-2xl px-4 py-3 text-left transition-colors hover:border-primary/40 ${
                    selected?.id === i.id ? "ring-1 ring-primary/40" : ""
                  }`}
                >
                  <p className="truncate text-sm font-semibold">{i.name}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <RarityTag rarity={i.rarity} />
                    <span className="truncate text-[10px] text-muted-foreground">{i.category}</span>
                  </div>
                </button>
              ))}
            </div>
            {results.length === 0 && (
              <p className="mt-6 text-sm text-muted-foreground">No items match that search.</p>
            )}
          </Panel>

          <Panel>
            <p className="eyebrow">Item detail</p>
            {selected ? (
              <>
                <h3 className="mt-3 text-2xl font-semibold">{selected.name}</h3>
                <div className="mt-3">
                  <RarityTag rarity={selected.rarity} />
                </div>
                <dl className="mt-6 space-y-3 text-sm">
                  {[
                    ["Item ID", selected.id],
                    ["Category", selected.category],
                    ["NPC sell", selected.npcSell ? formatNumber(selected.npcSell) : "—"],
                    ["Bazaar buy", price ? formatNumber(price.buyPrice) : "Not on Bazaar"],
                    ["Bazaar sell", price ? formatNumber(price.sellPrice) : "—"],
                    ["Weekly volume", price ? formatNumber(price.buyMovingWeek) : "—"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 border-b border-border pb-3">
                      <dt className="shrink-0 text-muted-foreground">{k}</dt>
                      <dd className="truncate font-mono text-xs font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">Pick an item to inspect it.</p>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}
