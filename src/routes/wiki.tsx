import { RenderMinecraftLore } from "@/lib/minecraft-text";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { ErrorState, LoadState } from "@/components/data-states";
import { Chip, PageHero, Panel, RarityTag } from "@/components/layout/app-shell";
import { ItemIcon } from "@/components/ui/item-icon";
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
        <div className="grid gap-4 lg:grid-cols-3 items-start">
          {/* Main List Column */}
          <Panel className="lg:col-span-2">
            <div className="flex items-center gap-2 rounded-xl border border-input bg-secondary/40 px-3 py-2 transition-all duration-75 hover:border-ring/40">
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
                  className={`glass-soft flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-75 ease-out hover:scale-[1.02] hover:border-primary/40 active:scale-95 ${
                    selected?.id === i.id ? "ring-2 ring-primary/40 bg-primary/10" : ""
                  }`}
                >
                  <ItemIcon id={i.id} name={i.name} className="size-8 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{i.name}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <RarityTag rarity={i.rarity} />
                      <span className="truncate text-[10px] text-muted-foreground">{i.category}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {results.length === 0 && (
              <p className="mt-6 text-sm text-muted-foreground">No items match that search.</p>
            )}
          </Panel>

          {/* Sticky Inspector Panel (Pins to top as you scroll) */}
          <Panel className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <p className="eyebrow">Item detail</p>
            {selected ? (
              <>
                <div className="mt-3 flex items-center gap-3">
                  <ItemIcon id={selected.id} name={selected.name} className="size-12 shrink-0" />
                  <div className="min-w-0">
                    <h3 className="text-xl font-semibold truncate">{selected.name}</h3>
                    <div className="mt-1.5 flex items-center gap-2">
                      <RarityTag rarity={selected.rarity} />
                    </div>
                  </div>
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
                    <div key={k} className="flex justify-between gap-3 border-b border-white/10 pb-3">
                      <dt className="shrink-0 text-muted-foreground">{k}</dt>
                      <dd className="truncate font-mono text-xs font-semibold">{v}</dd>
                    </div>
                  ))}
                </dl>

                {/* Subtly tinted, low-opacity lore box (semi-transparent so video shows through) */}
                {selected.description && (
                  <div className="mt-6">
                    <p className="eyebrow mb-2">Lore & Description</p>
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4 font-mono text-xs leading-relaxed text-slate-100 shadow-xl backdrop-blur-sm">
                      {Array.isArray(selected.description) ? (
                        selected.description.map((line: string, idx: number) => (
                          <p key={idx} className="min-h-[1.25rem] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                            <RenderMinecraftLore text={line} />
                          </p>
                        ))
                      ) : (
                        <p className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                          <RenderMinecraftLore text={selected.description} />
                        </p>
                      )}
                    </div>
                  </div>
                )}
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