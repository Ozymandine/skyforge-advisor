"use client";

import React from "react";
import { ItemIcon } from "@/components/ui/item-icon";
import { RenderMinecraftLore } from "@/lib/minecraft-text";
import { RARITY_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { InventoryItem } from "@/lib/skyblock";

export type MinecraftItemCardProps = {
  item: InventoryItem;
  className?: string;
  estimatedValue?: number | string | undefined;
};

export function MinecraftItemCard({
  item,
  className,
  estimatedValue,
}: MinecraftItemCardProps) {
  const rarityUpper = (item.rarity || "COMMON").toUpperCase();
  const rarityColor = RARITY_COLORS[rarityUpper] || "#ffffff";

  let starDisplay = "";
  if (item.stars && item.stars > 0) {
    if (item.stars <= 5) {
      starDisplay = " " + "✪".repeat(item.stars);
    } else {
      starDisplay = " " + "✪".repeat(5) + " " + "➊".repeat(item.stars - 5);
    }
  }

  const loreLines: string[] = Array.isArray(item.lore) ? item.lore : [];

  return (
    <div
      className={cn(
        "relative rounded-2xl border-2 border-[#2a0054] bg-[#100010]/95 p-4 shadow-2xl backdrop-blur-xl ring-2 ring-[#080008] text-white select-none transition-all",
        className
      )}
    >
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-purple-600/10 blur-3xl" />

      {/* Header: Item Icon + Authentic Minecraft Name + Stars */}
      <div className="flex items-center gap-3.5 border-b border-white/10 pb-3">
        <ItemIcon id={item.id} name={item.name} className="size-11 shrink-0 drop-shadow-md object-contain" />
        <div className="min-w-0 flex-1 font-mono">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              style={{ color: rarityColor }}
              className="text-base font-bold tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,1)] truncate"
            >
              {item.name}
              {starDisplay}
            </h3>
            {item.count > 1 && (
              <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-white">
                ×{item.count}
              </span>
            )}
          </div>
          <span
            style={{ color: rarityColor }}
            className="text-[11px] font-semibold tracking-wider opacity-85"
          >
            {rarityUpper}
          </span>
        </div>
      </div>

      {/* Complete In-Game Minecraft Tooltip Lore */}
      {loreLines.length > 0 && (
        <div className="mt-3.5 space-y-1 font-mono text-xs leading-relaxed">
          {loreLines.map((line, idx) => {
            const isBlank = !line || line.trim() === "";
            if (isBlank) {
              return <div key={idx} className="h-2" />;
            }
            return (
              <div key={idx} className="min-h-[16px] leading-snug">
                <RenderMinecraftLore text={line} />
              </div>
            );
          })}
        </div>
      )}

      {/* In-Game Tooltip Footer */}
      {estimatedValue !== undefined && (
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-2.5 font-mono text-[11px] font-bold">
          <span className="text-muted-foreground">Estimated Valuation</span>
          <span className="text-emerald-400">
            {typeof estimatedValue === "number"
              ? `${estimatedValue.toLocaleString()} coins`
              : estimatedValue}
          </span>
        </div>
      )}
    </div>
  );
}

