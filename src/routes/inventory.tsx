import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Chip, PageHero, Panel, RarityTag } from "@/components/layout/app-shell";
import { inventoryTabs } from "@/data/mock";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — SkyBlock Assistant" },
      {
        name: "description",
        content: "Interactive viewer for Ender Chest, Wardrobe, Armor, Backpacks and Accessory Bag.",
      },
      { property: "og:title", content: "Inventory — SkyBlock Assistant" },
      {
        property: "og:description",
        content: "Browse every storage container on your SkyBlock profile.",
      },
    ],
  }),
  component: Inventory,
});

function Inventory() {
  const [tab, setTab] = useState(inventoryTabs[0].id);
  const current = inventoryTabs.find((t) => t.id === tab)!;
  const [selected, setSelected] = useState(0);
  const item = current.items[Math.min(selected, current.items.length - 1)];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHero
        eyebrow="Progression"
        title="Inventory"
        description="Inspect every container on the profile with decoded item metadata and valuations."
      />

      <div className="flex flex-wrap gap-2">
        {inventoryTabs.map((t) => (
          <Chip
            key={t.id}
            active={tab === t.id}
            onClick={() => {
              setTab(t.id);
              setSelected(0);
            }}
          >
            {t.label}
          </Chip>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-semibold">{current.label}</h2>
            <p className="text-xs text-muted-foreground">
              {current.items.length} of {current.slots} slots used
            </p>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: current.slots }).map((_, i) => {
              const it = current.items[i];
              return (
                <button
                  key={i}
                  onClick={() => it && setSelected(i)}
                  className={`aspect-square rounded-xl border border-border p-2 text-left transition-colors ${
                    it ? "bg-secondary/50 hover:border-primary/40" : "bg-secondary/15"
                  } ${it && selected === i ? "border-primary/60 ring-1 ring-primary/40" : ""}`}
                >
                  {it && (
                    <div className="flex h-full flex-col justify-between">
                      <span className="line-clamp-3 text-[11px] leading-tight">{it.name}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">x{it.qty}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Panel>

        <Panel>
          <p className="eyebrow">Item detail</p>
          {item ? (
            <>
              <h3 className="mt-3 text-2xl font-semibold">{item.name}</h3>
              <div className="mt-3">
                <RarityTag rarity={item.rarity} />
              </div>
              <dl className="mt-6 space-y-3 text-sm">
                {[
                  ["Quantity", `x${item.qty}`],
                  ["Estimated value", item.value],
                  ["Container", current.label],
                  ["Soulbound", item.rarity === "MYTHIC" ? "Yes" : "No"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-border pb-3">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Empty slot.</p>
          )}
        </Panel>
      </div>
    </div>
  );
}
