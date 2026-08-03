import { createFileRoute } from "@tanstack/react-router";

import { PageHero, Panel, ProgressBar, RarityTag, StatRow } from "@/components/layout/app-shell";
import { netWorth } from "@/data/mock";

export const Route = createFileRoute("/net-worth")({
  head: () => ({
    meta: [
      { title: "Net Worth — SkyBlock Assistant" },
      {
        name: "description",
        content: "Portfolio valuation across purse, bank, inventory, armor and storage.",
      },
      { property: "og:title", content: "Net Worth — SkyBlock Assistant" },
      {
        property: "og:description",
        content: "Full breakdown of your SkyBlock portfolio valuation.",
      },
    ],
  }),
  component: NetWorth,
});

function NetWorth() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHero
        eyebrow="Economy"
        title="Net Worth"
        description="A full valuation of everything the profile holds, priced against live market data."
      />

      <StatRow
        stats={[
          { label: "Total net worth", value: netWorth.total, sub: "Coins, liquid + assets" },
          { label: "Soulbound value", value: netWorth.soulbound, sub: "Excluded from trade value" },
          { label: "Liquid coins", value: "1.22B", sub: "Purse and bank" },
          { label: "Weekly change", value: "+10.3%", sub: "Versus 7 days ago" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <h2 className="text-xl font-semibold">Portfolio breakdown</h2>
          <ul className="mt-6 space-y-4">
            {netWorth.breakdown.map((b) => (
              <li key={b.label}>
                <div className="flex items-baseline justify-between text-sm">
                  <p className="font-medium">{b.label}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {b.value} · {b.pct}%
                  </p>
                </div>
                <div className="mt-2">
                  <ProgressBar pct={b.pct * 3} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <h2 className="text-xl font-semibold">Top assets</h2>
          <ul className="mt-6 space-y-3">
            {netWorth.topAssets.map((a) => (
              <li
                key={a.name}
                className="glass-soft flex items-center justify-between gap-3 rounded-xl px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{a.name}</p>
                  <div className="mt-1.5">
                    <RarityTag rarity={a.rarity} />
                  </div>
                </div>
                <p className="shrink-0 text-sm font-semibold text-primary">{a.value}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
