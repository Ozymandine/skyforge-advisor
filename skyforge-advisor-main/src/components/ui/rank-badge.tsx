// src/components/ui/rank-badge.tsx
// Visual Minecraft-authentic Hypixel Rank Badge component:
// Renders [VIP], [VIP+], [MVP], [MVP+], [MVP++], [YOUTUBE], and [ADMIN]
// with exact Hypixel colors, plus customizations, and pixel styling.

import React from "react";
import {
  parseHypixelRank,
  type FormattedRank,
  type RawHypixelPlayerData,
} from "@/lib/hypixel-rank";
import { cn } from "@/lib/utils";

export type RankBadgeProps = {
  rankData?: RawHypixelPlayerData | null | undefined;
  rank?: FormattedRank | undefined;
  className?: string | undefined;
  size?: "sm" | "md" | "lg" | undefined;
};

export function RankBadge({ rankData, rank, className, size = "md" }: RankBadgeProps) {
  const parsed = rank ?? parseHypixelRank(rankData);

  if (!parsed || parsed.name === "NON" || !parsed.tag) {
    return null;
  }

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.2 rounded font-bold font-mono tracking-tight",
    md: "text-xs px-2 py-0.5 rounded-md font-black font-mono tracking-tight",
    lg: "text-sm px-2.5 py-1 rounded-lg font-black font-mono tracking-normal",
  }[size];

  // Specific plus coloring for MVP+, MVP++, VIP+
  if (parsed.name === "SUPERSTAR" || parsed.name === "MVP_PLUS") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-0.5 border select-none shadow-sm",
          parsed.badgeBg,
          parsed.badgeBorder,
          sizeClasses,
          className,
        )}
      >
        <span style={{ color: parsed.bracketColor }}>[</span>
        <span style={{ color: parsed.tagColor }}>MVP</span>
        <span style={{ color: parsed.plusColor ?? "#FF5555" }}>
          {parsed.name === "SUPERSTAR" ? "++" : "+"}
        </span>
        <span style={{ color: parsed.bracketColor }}>]</span>
      </span>
    );
  }

  if (parsed.name === "VIP_PLUS") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-0.5 border select-none shadow-sm",
          parsed.badgeBg,
          parsed.badgeBorder,
          sizeClasses,
          className,
        )}
      >
        <span style={{ color: "#55FF55" }}>[VIP</span>
        <span style={{ color: "#FFAA00" }}>+</span>
        <span style={{ color: "#55FF55" }}>]</span>
      </span>
    );
  }

  if (parsed.name === "YOUTUBER") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-0.5 border select-none shadow-sm",
          parsed.badgeBg,
          parsed.badgeBorder,
          sizeClasses,
          className,
        )}
      >
        <span style={{ color: "#FF5555" }}>[</span>
        <span style={{ color: "#FFFFFF" }}>YOUTUBE</span>
        <span style={{ color: "#FF5555" }}>]</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center border select-none shadow-sm",
        parsed.badgeBg,
        parsed.badgeBorder,
        sizeClasses,
        className,
      )}
    >
      <span style={{ color: parsed.bracketColor }}>[</span>
      <span style={{ color: parsed.tagColor }}>{parsed.tag}</span>
      <span style={{ color: parsed.bracketColor }}>]</span>
    </span>
  );
}
