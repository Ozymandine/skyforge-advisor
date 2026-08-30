// src/components/item-inspector.tsx
// Animated item inspection modal — full lore, rarity glow and market context
// for any inventory/auction item.

import { useMemo } from "react";
import { IconSparkles } from "@/assets/icons";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { RarityTag } from "@/components/layout/app-shell";
import { ItemIcon } from "@/components/ui/item-icon";
import { RenderMinecraftLore } from "@/lib/minecraft-text";
import { formatNumber } from "@/lib/skyblock";
import { estimateItemValue } from "@/lib/item-valuation";

export type InspectableItem = {
  name: string;
  id?: string;
  rarity: string;
  lore?: string[];
  count?: number;
  texture?: string;
  price?: number;
  lowestBin?: number | null;
  profit?: number;
};

export function ItemInspector({
  item,
  onClose,
}: {
  item: InspectableItem | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg border-white/10 bg-[#0E121B]/95 backdrop-blur-2xl">
        {item && (
          <div className="animate-fade-slide-up">
            <div className="flex items-start gap-4">
              <div
                className={`flex size-16 shrink-0 items-center justify-center rounded-xl border bg-black/40 ${
                  item.rarity === "MYTHIC"
                    ? "border-mythic/50 shadow-[0_0_24px_rgba(217,70,239,0.25)]"
                    : item.rarity === "LEGENDARY"
                      ? "border-legendary/50 shadow-[0_0_24px_rgba(250,204,21,0.25)]"
                      : item.rarity === "EPIC"
                        ? "border-epic/50 shadow-[0_0_24px_rgba(168,85,247,0.25)]"
                        : "border-white/10"
                }`}
              >
                <ItemIcon
                  id={item.id ?? item.name}
                  name={item.name}
                  {...(item.texture ? { texturePath: item.texture } : {})}
                  className="size-12"
                />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-lg font-bold leading-snug">
                  {item.name}
                  {(item.count ?? 1) > 1 && (
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ×{item.count}
                    </span>
                  )}
                </DialogTitle>
                <div className="mt-2 flex items-center gap-2">
                  <RarityTag rarity={item.rarity} />
                  {item.id && (
                    <span className="font-mono text-[10px] text-muted-foreground">{item.id}</span>
                  )}
                </div>
              </div>
            </div>

            {item.lore && item.lore.length > 0 && (
              <div className="mt-5 max-h-56 space-y-1 overflow-y-auto rounded-xl border border-slate-700/60 bg-slate-950/90 p-4 font-mono scroll-slim">
                {item.lore.map((line, i) => (
                  <p key={i} className="text-xs leading-relaxed">
                    <RenderMinecraftLore text={line} />
                  </p>
                ))}
              </div>
            )}

            <ValuationPanel item={item} />

            {(item.price !== undefined || item.lowestBin != null) && (
              <dl className="mt-5 grid grid-cols-3 gap-3 text-sm">
                {item.price !== undefined && (
                  <div className="glass-soft rounded-xl p-3 text-center">
                    <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Price
                    </dt>
                    <dd className="mt-1 font-mono font-semibold">{formatNumber(item.price)}</dd>
                  </div>
                )}
                {item.lowestBin != null && (
                  <div className="glass-soft rounded-xl p-3 text-center">
                    <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Lowest BIN
                    </dt>
                    <dd className="mt-1 font-mono font-semibold">{formatNumber(item.lowestBin)}</dd>
                  </div>
                )}
                {item.profit !== undefined && (
                  <div className="glass-soft rounded-xl p-3 text-center">
                    <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Flip profit
                    </dt>
                    <dd
                      className={`mt-1 font-mono font-semibold ${
                        item.profit > 0 ? "text-emerald-400" : "text-danger"
                      }`}
                    >
                      {item.profit > 0 ? "+" : ""}
                      {formatNumber(item.profit)}
                    </dd>
                  </div>
                )}
              </dl>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Estimated upgraded-item worth: base price + enchants + HPBs + stars. */
function ValuationPanel({ item }: { item: InspectableItem }) {
  const base = item.lowestBin ?? item.price ?? null;
  const valuation = useMemo(() => estimateItemValue(item.lore, base), [item.lore, base]);

  const hasUpgrades =
    valuation.enchants.length > 0 ||
    valuation.hotPotatoBooks > 0 ||
    valuation.fumingBooks > 0 ||
    valuation.stars > 0;

  if (!hasUpgrades) return null;

  return (
    <div className="mt-5 rounded-xl border border-primary/25 bg-primary/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <IconSparkles className="size-4 text-primary" /> Estimated value
        </p>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
              valuation.confidence === "market"
                ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                : "border-amber-400/40 bg-amber-400/10 text-amber-300"
            }`}
          >
            {valuation.confidence === "market" ? "Market-anchored" : "Estimate"}
          </span>
          <p className="font-mono text-lg font-bold text-primary">
            {valuation.total !== null ? formatNumber(valuation.total) : "—"}
          </p>
        </div>
      </div>

      <ul className="mt-3 space-y-1.5 text-xs">
        {valuation.base !== null && (
          <li className="flex justify-between">
            <span className="text-muted-foreground">Clean item (base)</span>
            <span className="font-mono">{formatNumber(valuation.base)}</span>
          </li>
        )}
        {valuation.enchants.map((enchant) => (
          <li key={enchant.name} className="flex justify-between">
            <span className="text-muted-foreground">
              {enchant.name}{" "}
              {["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][enchant.level - 1] ??
                enchant.level}
            </span>
            <span className="font-mono text-emerald-400">+{formatNumber(enchant.value)}</span>
          </li>
        ))}
        {valuation.hotPotatoBooks > 0 && (
          <li className="flex justify-between">
            <span className="text-muted-foreground">
              Hot Potato Book ×{valuation.hotPotatoBooks}
            </span>
            <span className="font-mono text-emerald-400">
              +{formatNumber(valuation.hotPotatoBooks * 350_000)}
            </span>
          </li>
        )}
        {valuation.fumingBooks > 0 && (
          <li className="flex justify-between">
            <span className="text-muted-foreground">
              Fuming Potato Book ×{valuation.fumingBooks}
            </span>
            <span className="font-mono text-emerald-400">
              +{formatNumber(valuation.fumingBooks * 1_000_000)}
            </span>
          </li>
        )}
        {valuation.stars > 0 && (
          <li className="flex justify-between">
            <span className="text-muted-foreground">
              {"✪".repeat(Math.min(valuation.stars, 10))} Dungeon stars ×{valuation.stars}
            </span>
            <span className="font-mono text-emerald-400">+{formatNumber(valuation.starTotal)}</span>
          </li>
        )}
      </ul>

      <p className="mt-2 text-[10px] text-muted-foreground">
        Rough market estimate from lore upgrades — actual sale price varies with demand.
      </p>
    </div>
  );
}
