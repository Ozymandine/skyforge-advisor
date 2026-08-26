import React from "react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { RenderMinecraftLore } from "@/lib/minecraft-text";
import { RARITY_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type MinecraftTooltipProps = {
  children: React.ReactNode;
  name: string;
  rarity?: string;
  lore?: string[] | string | undefined;
  estimatedValue?: number | string | undefined;
  recombobulated?: boolean;
  stars?: number;
  className?: string;
  disabled?: boolean;
};

export function MinecraftTooltip({
  children,
  name,
  rarity = "COMMON",
  lore,
  estimatedValue,
  recombobulated,
  stars,
  className,
  disabled = false,
}: MinecraftTooltipProps) {
  if (disabled) {
    return <>{children}</>;
  }

  const rarityUpper = (rarity || "COMMON").toUpperCase();
  const rarityColor = RARITY_COLORS[rarityUpper] || "#ffffff";

  let starDisplay = "";
  if (stars && stars > 0) {
    if (stars <= 5) {
      starDisplay = " " + "✪".repeat(stars);
    } else {
      starDisplay = " " + "✪".repeat(5) + " " + "➊".repeat(stars - 5);
    }
  }

  const loreLines: string[] = Array.isArray(lore)
    ? lore
    : typeof lore === "string"
      ? lore.split("\n")
      : [];

  return (
    <TooltipProvider delayDuration={50}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("inline-flex items-center justify-center cursor-pointer", className)}>
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          sideOffset={8}
          className="z-50 max-w-sm sm:max-w-md border-2 border-[#2a0054] bg-[#100010]/95 p-3 text-xs shadow-2xl backdrop-blur-md ring-2 ring-[#080008] text-white"
        >
          {/* Item Title */}
          <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-1.5 font-bold font-mono">
            <span style={{ color: rarityColor }} className="text-sm">
              {name}
              {starDisplay}
            </span>
            {recombobulated && (
              <span className="rounded bg-pink-500/20 px-1 py-0.2 text-[9px] text-pink-300">
                RECOMB
              </span>
            )}
          </div>

          {/* Minecraft Lore Content */}
          {loreLines.length > 0 && (
            <div className="mt-2 space-y-0.5 font-mono text-[11px] leading-snug">
              {loreLines.map((line, idx) => (
                <div key={idx} className="min-h-[14px]">
                  <RenderMinecraftLore text={line} />
                </div>
              ))}
            </div>
          )}

          {/* Rarity & Estimated Value Footer */}
          <div className="mt-2.5 flex items-center justify-between border-t border-white/10 pt-1.5 text-[10px] font-mono font-bold">
            <span style={{ color: rarityColor }}>
              {rarityUpper} {recombobulated ? "(RECOMBOBULATED)" : ""}
            </span>
            {estimatedValue !== undefined && (
              <span className="text-emerald-400">
                Est. Value: {typeof estimatedValue === "number" ? estimatedValue.toLocaleString() + " coins" : estimatedValue}
              </span>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
