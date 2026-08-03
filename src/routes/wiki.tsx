import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Chip, PageHero, Panel, RarityTag } from "@/components/layout/app-shell";
import { wikiItems } from "@/data/mock";

export const Route = createFileRoute("/wiki")({
  head: () => ({
    meta: [
      { title: "Wiki & Item Guide — SkyBlock Assistant" },
      {
        name: "description",
        content: "Searchable item database with lore, recipe trees and rarity metadata.",
      },
      { property: "og:title", content: "Wiki & Item Guide — SkyBlock Assistant" },
      {
        property: "og:description",
        content: "Look up any SkyBlock item, its lore and its recipe tree.",
      },
    ],
  }),
  component: Wiki,
});

function Wiki() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  const [selected, setSelected] = useState(wikiItems[0]!.name);

  const categories = ["All", ...Array.from(new Set(wikiItems.map((i) => i.category)))];
  const items = useMemo(
    () =>
      wikiItems.filter(
        (i) =>
          (cat === "All" || i.category === cat) &&
          i.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, cat],
  );
  const active = wikiItems.find((i) => i.name === selected)!;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHero
        eyebrow="Tools"
        title="Wiki & Item Guide"
        description="Search the item database, read the lore and expand full recipe trees."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="flex items-center gap-3 rounded-xl border border-input bg-secondary/40 px-4 py-2.5">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search items, lore, recipes..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((c) => (
              <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
                {c}
              </Chip>
            ))}
          </div>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {items.map((i) => (
              <li key={i.name}>
                <button
                  onClick={() => setSelected(i.name)}
                  className={`glass-soft w-full rounded-2xl p-4 text-left transition-colors hover:border-primary/40 ${
                    selected === i.name ? "border-primary/50" : ""
                  }`}
                >
                  <p className="text-sm font-medium">{i.name}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <RarityTag rarity={i.rarity} />
                    <span className="text-xs text-muted-foreground">{i.category}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <p className="eyebrow">Item detail</p>
          <h2 className="mt-3 text-2xl font-semibold">{active.name}</h2>
          <div className="mt-3 flex items-center gap-2">
            <RarityTag rarity={active.rarity} />
            <span className="text-xs text-muted-foreground">{active.category}</span>
          </div>
          <p className="mt-5 text-sm italic text-muted-foreground">{active.lore}</p>

          <p className="eyebrow mt-8">Recipe tree</p>
          <ul className="mt-3 space-y-2">
            {active.recipe.map((r, i) => (
              <li
                key={r}
                className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm"
                style={{ marginLeft: `${i * 10}px` }}
              >
                <span className="size-1.5 rounded-full bg-primary" />
                {r}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
