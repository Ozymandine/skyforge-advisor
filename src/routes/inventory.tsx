import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { ConnectPrompt, ErrorState, LoadState } from "@/components/data-states";
import { Chip, PageHero, Panel, RarityTag } from "@/components/layout/app-shell";
import { ItemIcon } from "@/components/ui/item-icon";
import { RenderMinecraftLore } from "@/lib/minecraft-text";
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

          <div className="grid gap-4 lg:grid-cols-3 items-start">
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
                  const isSelected = it && item?.slot === i;

                  return (
                    <button
                      key={i}
                      onClick={() => it && setSelected(i)}
                      className={`relative aspect-square rounded-xl border p-2 text-left transition-all duration-75 ease-out ${
                        it
                          ? "bg-secondary/50 border-border hover:border-primary/50 hover:scale-105 active:scale-95 cursor-pointer"
                          : "bg-secondary/15 border-border/50 cursor-default"
                      } ${isSelected ? "border-primary/80 ring-2 ring-primary/40 bg-primary/10" : ""}`}
                    >
                      {it && (
                        <div className="flex h-full flex-col items-center justify-between">
                          <ItemIcon id={it.id} name={it.name} className="size-8 my-auto" />
                          <span className="self-end font-mono text-[10px] font-semibold text-muted-foreground">
                            x{it.count}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </Panel>

            {/* Sticky Inspector Panel */}
            <Panel className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
              <p className="eyebrow">Item detail</p>
              {item ? (
                <>
                  <div className="mt-3 flex items-center gap-3">
                    <ItemIcon id={item.id} name={item.name} className="size-12 shrink-0" />
                    <div className="min-w-0">
                      <h3 className="text-xl font-semibold truncate">{item.name}</h3>
                      <div className="mt-1 flex items-center gap-2">
                        <RarityTag rarity={item.rarity} />
                        <span className="font-mono text-[10px] text-muted-foreground truncate">{item.id}</span>
                      </div>
                    </div>
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

                  {/* Lore / Description Box */}
                  <div className="mt-6">
                    <p className="eyebrow mb-2">Item Description</p>
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-xs leading-relaxed text-slate-100 shadow-xl backdrop-blur-md space-y-1.5">
                      {item.lore && item.lore.length > 0 ? (
                        item.lore.map((line, idx) => (
                          <p key={idx} className="min-h-[1.25rem]">
                            <RenderMinecraftLore text={line} />
                          </p>
                        ))
                      ) : (
                        <p className="text-slate-400 italic">
                          <RenderMinecraftLore text={`§7Standard §f${item.name}§7 item.`} />
                        </p>
                      )}
                    </div>
                  </div>
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