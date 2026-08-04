import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { ConnectPrompt, ErrorState, LoadState } from "@/components/data-states";
import { Chip, PageHero, Panel, RarityTag } from "@/components/layout/app-shell";
import { usePlayer } from "@/hooks/use-account";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — SkyBlock Assistant" },
      {
        name: "description",
        content: "Decoded viewer for Ender Chest, Wardrobe, Armor, Backpacks and Accessory Bag.",
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
  const { data, isLoading, error, connected } = usePlayer();
  const [tab, setTab] = useState<string | null>(null);
  const [selected, setSelected] = useState(0);

  const containers = useMemo(() => data?.containers ?? [], [data]);
  const current = containers.find((c) => c.id === tab) ?? containers[0];
  const item = current?.items.find((i) => i.slot === selected) ?? current?.items[0];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHero
        eyebrow="Progression"
        title="Inventory"
        description="Every container on the profile, decoded from the raw Hypixel item data."
      />

      {!connected && <ConnectPrompt what="your real inventories" />}
      {connected && isLoading && <LoadState>Decoding inventory data…</LoadState>}
      {connected && error && <ErrorState error={error} />}

      {data && containers.length === 0 && (
        <Panel>
          <p className="text-sm text-muted-foreground">
            This profile does not share inventory data. Enable inventory API access in SkyBlock
            (Settings → API Settings) and refresh.
          </p>
        </Panel>
      )}

      {current && (
        <>
          <div className="flex flex-wrap gap-2">
            {containers.map((c) => (
              <Chip
                key={c.id}
                active={current.id === c.id}
                onClick={() => {
                  setTab(c.id);
                  setSelected(0);
                }}
              >
                {c.label} · {c.items.length}
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

              <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6 lg:grid-cols-9">
                {Array.from({ length: Math.max(current.slots, 1) }).map((_, i) => {
                  const it = current.items.find((x) => x.slot === i);
                  return (
                    <button
                      key={i}
                      onClick={() => it && setSelected(i)}
                      className={`aspect-square rounded-xl border border-border p-2 text-left transition-colors ${
                        it ? "bg-secondary/50 hover:border-primary/40" : "bg-secondary/15"
                      } ${it && item?.slot === i ? "border-primary/60 ring-1 ring-primary/40" : ""}`}
                    >
                      {it && (
                        <div className="flex h-full flex-col justify-between">
                          <span className="line-clamp-3 text-[10px] leading-tight">{it.name}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            x{it.count}
                          </span>
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
                  <div className="mt-3 flex items-center gap-2">
                    <RarityTag rarity={item.rarity} />
                    <span className="font-mono text-[10px] text-muted-foreground">{item.id}</span>
                  </div>
                  <dl className="mt-6 space-y-3 text-sm">
                    {[
                      ["Quantity", `x${item.count}`],
                      ["Slot", `#${item.slot + 1}`],
                      ["Container", current.label],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between border-b border-border pb-3">
                        <dt className="text-muted-foreground">{k}</dt>
                        <dd className="font-medium">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  {item.lore.length > 0 && (
                    <pre className="mt-5 whitespace-pre-wrap break-words font-sans text-xs leading-relaxed text-muted-foreground">
                      {item.lore.join("\n")}
                    </pre>
                  )}
                </>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">Empty container.</p>
              )}
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
