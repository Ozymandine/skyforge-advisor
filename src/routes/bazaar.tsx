import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Chip, PageHero, Panel, ProgressBar, StatRow } from "@/components/layout/app-shell";
import { bazaarItems, bazaarStats } from "@/data/mock";

export const Route = createFileRoute("/bazaar")({
  head: () => ({
    meta: [
      { title: "Bazaar — SkyBlock Assistant" },
      {
        name: "description",
        content: "Live Bazaar liquidity, margin and order-flip analysis from Hypixel.",
      },
      { property: "og:title", content: "Bazaar — SkyBlock Assistant" },
      {
        property: "og:description",
        content: "Live market pricing, order tracking and high-margin flip opportunities.",
      },
    ],
  }),
  component: Bazaar,
});

const filters = [
  "All markets",
  "Profitable",
  "Most active",
  "Fastest selling",
  "Low competition",
  "Stable",
  "High risk",
  "Favorites",
];

function Bazaar() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All markets");
  const [sort, setSort] = useState("Profit per hour");

  const items = useMemo(
    () =>
      bazaarItems.filter(
        (i) =>
          i.name.toLowerCase().includes(query.toLowerCase()) ||
          i.id.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex justify-end">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary" /> LIVE · SYNCED 12:37 PM
        </p>
      </div>

      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Market intelligence</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Bazaar</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Live liquidity, margin, and order-flip analysis from Hypixel.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-primary/40 bg-primary/15 px-3 py-1.5 text-xs font-medium text-primary">
              ● LIVE
            </span>
            <button className="flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-xs font-medium transition-colors hover:border-ring/40">
              <RefreshCw className="size-3.5" /> Refresh
            </button>
          </div>
        </div>

        <div className="mt-8">
          <StatRow stats={bazaarStats} />
        </div>
      </Panel>

      <Panel>
        <div className="flex flex-wrap gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-input bg-secondary/40 px-4 py-2.5">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a Bazaar item or internal ID..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-xl border border-input bg-secondary/40 px-4 py-2.5 text-sm outline-none"
          >
            {[
              "Profit per hour",
              "Profit per flip",
              "Spread",
              "Spread %",
              "ROI",
              "Weekly volume",
              "Liquidity",
              "Demand",
              "Alphabetical",
            ].map((s) => (
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

        <p className="mt-6 text-xs text-muted-foreground">{items.length} matching markets</p>

        <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="glass-soft rounded-2xl p-5">
              <p className="text-base font-semibold">{item.name}</p>
              <p className="font-mono text-[11px] text-muted-foreground">{item.id}</p>

              <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Acquire price</p>
                  <p className="mt-1 font-medium">{item.buy}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Sale price</p>
                  <p className="mt-1 font-medium">{item.sell}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Net profit</p>
                  <p className="mt-1 font-medium text-primary">{item.profit}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Profit / hr</p>
                  <p className="mt-1 font-medium text-primary">{item.perHour}</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  ["Liquidity", item.liquidity],
                  ["Health", item.health],
                  ["ROI", item.roi],
                ].map(([label, val]) => (
                  <div key={label as string}>
                    <p className="flex justify-between text-[11px] text-muted-foreground">
                      <span>{label}</span>
                      <span>{val}%</span>
                    </p>
                    <div className="mt-1.5">
                      <ProgressBar
                        pct={val as number}
                        tone={
                          (val as number) >= 60 ? "emerald" : (val as number) >= 30 ? "gold" : "danger"
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between">
                <span className="rounded-md border border-primary/40 bg-primary/15 px-2 py-1 text-[10px] font-semibold tracking-widest text-primary">
                  PROFITABLE
                </span>
                <span className="text-xs text-muted-foreground">{item.perHour} / hr</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
