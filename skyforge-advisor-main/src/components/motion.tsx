// src/components/motion.tsx
// Shared motion primitives: staggered reveals, count-up numbers, progress
// rings, and skeleton loaders. All respect prefers-reduced-motion via CSS.

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Reveal — fades/slides children in when mounted (optionally staggered)
// ---------------------------------------------------------------------------

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  /** Delay in ms before the reveal starts. */
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("animate-fade-slide-up", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/** Wraps children and assigns incremental --stagger-index to direct children. */
export function Stagger({
  children,
  delay = 60,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("stagger", className)}
      style={{ "--stagger-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CountUp — animates a number from 0 (or previous value) to target
// ---------------------------------------------------------------------------

export function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(target);
  const previous = useRef(target);

  useEffect(() => {
    const from = previous.current;
    const to = target;
    if (from === to) return;

    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else previous.current = to;
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

export function CountUp({
  value,
  format = (n: number) => n.toLocaleString("en-US"),
  duration = 900,
  className,
}: {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  className?: string;
}) {
  const current = useCountUp(value, duration);
  return <span className={className}>{format(current)}</span>;
}

// ---------------------------------------------------------------------------
// ProgressRing — animated circular progress indicator
// ---------------------------------------------------------------------------

export function ProgressRing({
  pct,
  size = 120,
  stroke = 10,
  label,
  sublabel,
  className,
}: {
  pct: number;
  size?: number;
  stroke?: number;
  label?: ReactNode;
  sublabel?: ReactNode;
  className?: string;
}) {
  const clamped = Math.min(100, Math.max(0, pct));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const animatedPct = useCountUp(clamped, 1100);
  const offset = circumference * (1 - animatedPct / 100);

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {label && <span className="text-xl font-bold">{label}</span>}
        {sublabel && <span className="text-[10px] text-muted-foreground">{sublabel}</span>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeletons — shimmer placeholders matching final layouts
// ---------------------------------------------------------------------------

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton-shimmer rounded-lg bg-white/5", className)} />;
}

export function SkeletonStatRow({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 rounded-3xl border border-white/10 bg-slate-950/30 p-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3 px-2 py-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-2 w-full" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonCards({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-white/10 bg-black/30 p-5">
          <div className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-2 w-24" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((__, j) => (
              <Skeleton key={j} className="h-8" />
            ))}
          </div>
          <Skeleton className="mt-4 h-1.5 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-3 w-96 max-w-full" />
      </div>
      <SkeletonStatRow />
      <SkeletonCards count={4} />
    </div>
  );
}
