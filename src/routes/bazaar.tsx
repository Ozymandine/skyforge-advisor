import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, ExternalLink, Info, Layers, RefreshCw } from "lucide-react";

import { Panel, RarityTag, Chip, PageHero } from "@/components/layout/app-shell";
import { ItemIcon } from "@/components/ui/item-icon";
import { formatNumber } from "@/lib/skyblock";

export const Route = createFileRoute("/wiki")({
  head: () => ({
    meta: [
      { title: "Wiki — SkyBlock Assistant" },
      {
        name: "description",
        content: "Every SkyBlock item with live market pricing, Auction House fallbacks, lore, and related items.",
      },
    ],
  }),
  component: WikiPage,
});

export interface WikiItem {
  id: string;
  name: string;
  rarity: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHIC";
  category: string;
  npcSell?: number;
  bazaarBuy?: number;
  bazaarSell?: number;
  lowestBin?: number; // Auction House fallback
  lore?: string[];
  relatedItems?: string[];
}

export function WikiPage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState<WikiItem | null>(null);

  // Replace fetchWikiItems with your actual API endpoint or function
  const { data: items, isLoading, refetch, isFetching } = useQuery<WikiItem[]>({
    queryKey: ["wiki-items"],
    queryFn: async () => {
      // Return your item database merged with Bazaar/AH prices
      return [];
    },
  });

  const categories = ["All", "Reforge Stone", "Accessory", "Sword", "Armor", "Bow", "Pet"];

  const filteredItems = useMemo(() => {
    if (!items) return [];
    const q = query.toLowerCase();
    return items.filter((i) => {
      const matchesQuery = i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q);
      const matchesCategory = selectedCategory === "All" || i.category === selectedCategory;
      return matchesQuery && matchesCategory;
    });
  }, [items, query, selectedCategory]);

  const activeItem = selectedItem ?? filteredItems[0] ?? null;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHero
        eyebrow="Database"
        title="Wiki"
        description="Every SkyBlock item with live Bazaar & Auction House pricing, item lore, and related recipes."
      />

      {/* Search & Filter Header */}
      <Panel>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-64 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 backdrop-blur-md">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search 5,600+ items..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium backdrop-blur-md transition-all hover:bg-white/10"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Chip key={cat} active={selectedCategory === cat} onClick={() => setSelectedCategory(cat)}>
              {cat}
            </Chip>
          ))}
        </div>
      </Panel>

      {/* Grid Layout: Scrollable List (Left) | Fixed Pinned Details (Right) */}
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        
        {/* Left Column: Scrollable Items List */}
        <div className="grid gap-3 sm:grid-cols-2 lg:col-span-2">
          {filteredItems.map((item) => {
            const isSelected = activeItem?.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-75 backdrop-blur-xl ${
                  isSelected
                    ? "border-primary/50 bg-primary/10 shadow-lg scale-[1.01]"
                    : "border-white/10 bg-slate-950/30 hover:border-white/20 hover:bg-slate-950/40"
                }`}
              >
                <ItemIcon id={item.id} name={item.name} className="size-9 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{item.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <RarityTag rarity={item.rarity} />
                    <span className="truncate text-[11px] text-muted-foreground">{item.category}</span>
                  </div>
                </div>
              </button>
            );
          })}

          {filteredItems.length === 0 && !isLoading && (
            <div className="col-span-2 rounded-2xl border border-white/10 bg-slate-950/30 p-8 text-center text-sm text-muted-foreground backdrop-blur-xl">
              No items matching your search criteria.
            </div>
          )}
        </div>

        {/* Right Column: Sticky Details Inspector (Does not scroll out of view) */}
        <aside className="sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/40 p-6 backdrop-blur-2xl shadow-2xl space-y-6">
          {activeItem ? (
            <>
              {/* Header Info */}
              <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <ItemIcon id={activeItem.id} name={activeItem.name} className="size-12" />
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">{activeItem.name}</h2>
                    <div className="mt-1 flex items-center gap-2">
                      <RarityTag rarity={activeItem.rarity} />
                      <span className="text-xs text-muted-foreground">{activeItem.category}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Market Valuation (Bazaar vs AH Fallback) */}
              <div>
                <p className="eyebrow mb-2 flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                  <Info className="size-3.5 text-primary" /> Market Pricing
                </p>
                <dl className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs backdrop-blur-md">
                  {activeItem.bazaarBuy ? (
                    <>
                      <div>
                        <dt className="text-muted-foreground">Bazaar Buy</dt>
                        <dd className="font-mono font-semibold text-emerald-400">
                          {formatNumber(activeItem.bazaarBuy)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Bazaar Sell</dt>
                        <dd className="font-mono font-semibold">
                          {formatNumber(activeItem.bazaarSell ?? 0)}
                        </dd>
                      </div>
                    </>
                  ) : activeItem.lowestBin ? (
                    <div className="col-span-2 flex justify-between items-center">
                      <div>
                        <dt className="text-muted-foreground">Lowest BIN (Auction House)</dt>
                        <dd className="font-mono font-semibold text-gold">
                          {formatNumber(activeItem.lowestBin)} coins
                        </dd>
                      </div>
                      <span className="rounded-md border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] text-gold font-bold">
                        AH EXCLUSIVE
                      </span>
                    </div>
                  ) : (
                    <div className="col-span-2">
                      <dt className="text-muted-foreground">NPC Sell Value</dt>
                      <dd className="font-mono font-semibold">
                        {activeItem.npcSell ? `${formatNumber(activeItem.npcSell)} coins` : "Untradeable"}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Item Lore / Description */}
              {activeItem.lore && activeItem.lore.length > 0 && (
                <div>
                  <p className="eyebrow mb-2 text-xs text-muted-foreground font-semibold">Item Lore</p>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs font-mono space-y-1 text-slate-300 leading-relaxed backdrop-blur-md">
                    {activeItem.lore.map((line, idx) => (
                      <p key={idx}>{line}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Items / Materials */}
              {activeItem.relatedItems && activeItem.relatedItems.length > 0 && (
                <div>
                  <p className="eyebrow mb-2 flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                    <Layers className="size-3.5 text-primary" /> Related Items
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {activeItem.relatedItems.map((relId) => (
                      <div
                        key={relId}
                        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium backdrop-blur-md hover:bg-white/10 cursor-pointer"
                      >
                        <ItemIcon id={relId} className="size-5" />
                        <span className="font-mono">{relId}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* External Wiki Link */}
              <a
                href={`https://wiki.hypixel.net/${activeItem.id}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-medium hover:bg-white/15 transition-all"
              >
                View on Hypixel Wiki <ExternalLink className="size-3.5" />
              </a>
            </>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-6">Select an item to view details.</p>
          )}
        </aside>

      </div>
    </div>
  );
}