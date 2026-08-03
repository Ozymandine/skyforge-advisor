import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Chip, PageHero, Panel, ProgressBar, StatRow } from "@/components/layout/app-shell";
import { collectionCategories } from "@/data/mock";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Collections — SkyBlock Assistant" },
      {
        name: "description",
        content: "Categorized collection tier tracking and unlock completion percentages.",
      },
      { property: "og:title", content: "Collections — SkyBlock Assistant" },
      {
        property: "og:description",
        content: "Track collection tiers and unlock completion across every category.",
      },
    ],
  }),
  component: Collections,
});

function Collections() {
  const [active, setActive] = useState("All");
  const categories =
    active === "All" ? collectionCategories : collectionCategories.filter((c) => c.name === active);

  const unlocked = collectionCategories.reduce((n, c) => n + c.unlocked, 0);
  const total = collectionCategories.reduce((n, c) => n + c.total, 0);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHero
        eyebrow="Progression"
        title="Collections"
        description="Every collection category, tier unlock and completion percentage in one place."
      />

      <StatRow
        stats={[
          { label: "Categories", value: String(collectionCategories.length), sub: "Tracked groups" },
          { label: "Unlocked", value: `${unlocked} / ${total}`, sub: "Collection records" },
          {
            label: "Completion",
            value: `${Math.round((unlocked / total) * 100)}%`,
            sub: "Across all categories",
          },
          { label: "Tier unlocks", value: "166 / 484", sub: "Individual tiers" },
        ]}
      />

      <div className="flex flex-wrap gap-2">
        {["All", ...collectionCategories.map((c) => c.name)].map((c) => (
          <Chip key={c} active={active === c} onClick={() => setActive(c)}>
            {c}
          </Chip>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {categories.map((cat) => (
          <Panel key={cat.name}>
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-semibold">{cat.name}</h2>
              <p className="text-xs text-muted-foreground">
                {cat.unlocked} / {cat.total} unlocked
              </p>
            </div>
            <div className="mt-4">
              <ProgressBar pct={(cat.unlocked / cat.total) * 100} />
            </div>
            <ul className="mt-6 space-y-3">
              {cat.items.map((item) => (
                <li key={item.name} className="glass-soft rounded-xl px-4 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-medium">
                      {item.name}{" "}
                      <span className="text-xs text-muted-foreground">Tier {item.tier}</span>
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">{item.amount}</p>
                  </div>
                  <div className="mt-2.5">
                    <ProgressBar pct={item.pct} />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        ))}
      </div>
    </div>
  );
}
