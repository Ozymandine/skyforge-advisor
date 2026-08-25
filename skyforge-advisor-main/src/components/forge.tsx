// src/components/forge.tsx
// Forge design system primitives: pixel-framed cards, rarity frames,
// animated stat tiles, shine-sweep progress bars and scroll reveals.

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ============================================================================
 * RARITY
 * ========================================================================== */

export type ForgeRarity =
  "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic" | "divine" | "special";

const RARITY_CLASS: Record<ForgeRarity, string> = {
  common: "frame-common",
  uncommon: "frame-uncommon",
  rare: "frame-rare",
  epic: "frame-epic",
  legendary: "frame-legendary",
  mythic: "frame-mythic",
  divine: "frame-divine",
  special: "frame-special",
};

/** Map a SkyBlock rarity string (COMMON..MYTHIC etc.) to a ForgeRarity. */
export function toForgeRarity(rarity: string): ForgeRarity {
  switch (rarity.toUpperCase()) {
    case "UNCOMMON":
      return "uncommon";
    case "RARE":
      return "rare";
    case "EPIC":
      return "epic";
    case "LEGENDARY":
      return "legendary";
    case "MYTHIC":
      return "mythic";
    case "DIVINE":
      return "divine";
    case "SPECIAL":
    case "VERY SPECIAL":
      return "special";
    default:
      return "common";
  }
}

/* ============================================================================
 * FORGE CARD — pixel-framed panel with rarity tinting
 * ========================================================================== */

export function ForgeCard({
  children,
  rarity,
  hover = true,
  className,
  style,
}: {
  children: ReactNode;
  /** Tints the frame + glow with a rarity color. */
  rarity?: ForgeRarity;
  hover?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn(
        "pixel-frame relative bg-slate-950/40 backdrop-blur-xl p-5",
        rarity && RARITY_CLASS[rarity],
        hover && "pixel-frame-hover",
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}

/* ============================================================================
 * RARITY FRAME — wraps arbitrary content (icons, cards) in a rarity frame
 * ========================================================================== */

export function RarityFrame({
  children,
  rarity,
  className,
}: {
  children: ReactNode;
  rarity: ForgeRarity;
  className?: string;
}) {
  return <div className={cn("pixel-frame", RARITY_CLASS[rarity], className)}>{children}</div>;
}

/* ============================================================================
 * SCROLL REVEAL — fades/slides children in when scrolled into view
 * ========================================================================== */

export function ScrollReveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal", revealed && "revealed", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ============================================================================
 * STAT TILE — animated value with delta indicator
 * ========================================================================== */

export function ForgeStat({
  label,
  value,
  sub,
  icon: Icon,
  delta,
  highlight = false,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  icon?: React.ComponentType<{ className?: string }>;
  /** Signed % or absolute delta — rendered as an up/down arrow chip. */
  delta?: { pct: number; label?: string } | null;
  /** Use the forge gradient for the value (reserved for live/valuable data). */
  highlight?: boolean;
}) {
  return (
    <div className="pixel-frame frame-common bg-slate-950/40 px-5 py-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        {Icon && <Icon className="size-3.5 text-primary/70" />}
      </div>

      <p
        className={cn("mt-2.5 text-2xl font-bold leading-none", highlight && "forge-gradient-text")}
      >
        {value}
      </p>

      <div className="mt-2 flex items-center gap-2">
        {delta && Number.isFinite(delta.pct) && delta.pct !== 0 && (
          <span
            className={cn(
              "rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold",
              delta.pct > 0 ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300",
            )}
          >
            {delta.pct > 0 ? "▲" : "▼"} {Math.abs(delta.pct).toFixed(1)}%
            {delta.label ? ` ${delta.label}` : ""}
          </span>
        )}
        {sub && <p className="truncate text-[11px] text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

/* ============================================================================
 * PROGRESS BAR — shine-sweep fill
 * ========================================================================== */

export function ForgeProgress({
  pct,
  rarity,
  shine = false,
  className,
}: {
  pct: number;
  rarity?: ForgeRarity;
  /** Animated glint across the fill (use for completed/near-complete bars). */
  shine?: boolean;
  className?: string;
}) {
  const clamped = Math.min(100, Math.max(0, pct));
  const colorVar = rarity
    ? `var(--r-${rarity})`
    : "linear-gradient(90deg, var(--forge-from), var(--forge-to))";

  return (
    <div className={cn("h-2 w-full overflow-hidden border border-white/10 bg-black/40", className)}>
      <div
        className={cn("h-full transition-all duration-500", shine && "shine-sweep")}
        style={{
          width: `${clamped}%`,
          background: colorVar,
        }}
      />
    </div>
  );
}

/* ============================================================================
 * SECTION HEADING — pixel font label with forge accent
 * ========================================================================== */

export function ForgeHeading({
  children,
  sub,
  className,
}: {
  children: ReactNode;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 className="font-pixel text-2xl font-semibold tracking-wide">{children}</h2>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
