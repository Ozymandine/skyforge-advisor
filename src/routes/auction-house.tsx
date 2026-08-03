import { createFileRoute } from "@tanstack/react-router";
import { Heart, RefreshCw, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Chip, PageHero, Panel, ProgressBar, RarityTag, StatRow } from "@/components/layout/app-shell";
import { auctionStats, auctions } from "@/data/mock";

export const Route = createFileRoute("/auction-house")({
  head: () => ({
    meta: [
      { title: "Auction House — SkyBlock Assistant" },
      {
        name: "description",
        content: "Lowest BIN lookup, item price history and a live auction tracker.",
      },
      { property: "og:title", content: "Auction House — SkyBlock Assistant" },
      {
        property: "og:description",
        content: "Inspect every live listing with decoded item metadata and price context.",
      },
    ],
  }),
  component: AuctionHouse,
});

const filters = [
  "All listings",
  "Active",
  "Best flips",
  "Ending soon",
  "Recently listed",
  "Dungeon",
  "Pets",
  "Soulbound",
  "Legendary",
  "Mythic",
];

function AuctionHouse() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"ALL" | "BIN" | "AUCTION">("ALL");
  const [filter, setFilter] = useState("All listings");

  const listings = useMemo(
    () =>
      auctions.filter(
        (a) =>
          (mode === "ALL" || a.type === mode) &&
          (a.name.toLowerCase().includes(query.toLowerCase()) ||
            a.uuid.toLowerCase().includes(query.toLowerCase())),
      ),
    [query, mode],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Live marketplace</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Auction House</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Inspect every live listing with decoded item metadata and price context.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-primary/40 bg-primary/15 px-3 py-1.5 text-xs font-medium text-primary">
              ● LIVE
            </span>
            <button className="flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-xs font-medium transition-colors hover:border-ring/40">
              <RefreshCw className="size-3.5" /> Refreshing
            </button>
          </div>
        </div>
        <div className="mt-8">
          <StatRow stats={auctionStats} />
        </div>
      </Panel>

      <Panel>
        <div className="flex flex-wrap gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-input bg-secondary/40 px-4 py-2.5">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search item, seller, UUID, reforge, enchantment..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex overflow-hidden rounded-xl border border-input">
            {(["ALL", "BIN", "AUCTION"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-2.5 text-xs font-medium transition-colors ${
                  mode === m ? "bg-primary/15 text-primary" : "text-muted-foreground"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {filters.map((f) => (
            <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
              {f}
            </Chip>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
          <p>{listings.length} matching listings</p>
          <p>Updated 12:37 PM</p>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {listings.map((a) => (
            <div key={a.uuid} className="glass-soft rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold">{a.name}</p>
                  <div className="mt-2 flex gap-1.5">
                    <RarityTag rarity={a.rarity} />
                    <span className="rounded-md border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-semibold tracking-widest text-muted-foreground">
                      {a.type}
                    </span>
                  </div>
                </div>
                <button aria-label="Favorite" className="text-muted-foreground hover:text-primary">
                  <Heart className="size-4" />
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Current price</p>
                  <p className="mt-1 font-medium">{a.price}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Lowest BIN</p>
                  <p className="mt-1 font-medium">{a.lowestBin}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Potential profit</p>
                  <p className="mt-1 font-medium text-primary">{a.profit}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Time remaining</p>
                  <p className="mt-1 font-medium">{a.time}</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  ["Value score", a.value],
                  ["Competition", a.competition],
                ].map(([label, val]) => (
                  <div key={label as string}>
                    <p className="flex justify-between text-[11px] text-muted-foreground">
                      <span>{label}</span>
                      <span>{val}%</span>
                    </p>
                    <div className="mt-1.5">
                      <ProgressBar pct={val as number} />
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-5 truncate font-mono text-[10px] text-muted-foreground">{a.uuid}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
