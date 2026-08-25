// src/components/progression-visuals.tsx
// Visual progression components: a skill radar chart and a dungeon floor map.
// The radar chart lazy-loads recharts so it stays out of the main bundle.

import { Suspense, lazy } from "react";

export type RadarSkill = { name: string; level: number; cap: number; maxed: boolean };

const SkillRadarChart = lazy(async () => {
  const {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
    Tooltip,
  } = await import("recharts");
  function Composed({ skills }: { skills: RadarSkill[] }) {
    const data = skills.map((s) => ({
      skill: s.name,
      pct: s.cap > 0 ? Math.round((s.level / s.cap) * 100) : 0,
      level: s.level,
    }));

    // Small screens: hide axis labels (they clip) — the tooltip names skills.
    const isSmall =
      typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches;

    return (
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis
            dataKey="skill"
            tick={
              isSmall
                ? { fontSize: 0, fill: "transparent" }
                : { fontSize: 10, fill: "rgba(255,255,255,0.45)" }
            }
          />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Tooltip
            formatter={(value, _name, entry) => {
              const payload = (entry as { payload?: { level?: number } } | undefined)?.payload;
              return [`${payload?.level ?? "?"} (${String(value)}%)`, "Level"];
            }}
            contentStyle={{
              background: "rgba(2,6,23,0.9)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              fontSize: 12,
            }}
          />
          <Radar
            dataKey="pct"
            stroke="#34d399"
            strokeWidth={2}
            fill="#34d399"
            fillOpacity={0.25}
            animationDuration={900}
          />
        </RadarChart>
      </ResponsiveContainer>
    );
  }

  return { default: Composed };
});

/** Radar/"constellation" of every skill, filled by level relative to cap. */
export function SkillRadar({ skills }: { skills: RadarSkill[] }) {
  return (
    <div className="h-[340px] w-full">
      <Suspense fallback={<ChartLoading />}>
        <SkillRadarChart skills={skills} />
      </Suspense>
    </div>
  );
}

function ChartLoading() {
  return (
    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
      Loading chart…
    </div>
  );
}

/* ============================================================================
 * DUNGEON FLOOR MAP
 * ========================================================================== */

export type MapFloor = { name: string; completions: number; bestScore: number };

/** Vertical floor ladder: completed floors glow, next floor pulses. */
export function DungeonFloorMap({ floors }: { floors: MapFloor[] }) {
  if (floors.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No dungeon completions recorded on this profile yet.
      </p>
    );
  }

  const firstIncomplete = floors.findIndex((f) => f.completions === 0);

  return (
    <ol className="relative ml-3 space-y-1 border-l-2 border-white/10 pl-6">
      {floors.map((floor, index) => {
        const done = floor.completions > 0;
        const isNext = index === firstIncomplete;
        const scoreTiers = [
          { min: 300, label: "S+", color: "text-amber-300" },
          { min: 270, label: "S", color: "text-violet-300" },
          { min: 230, label: "A", color: "text-sky-300" },
          { min: 180, label: "B", color: "text-emerald-300" },
          { min: 0, label: "C", color: "text-muted-foreground" },
        ];
        const grade = scoreTiers.find((t) => floor.bestScore >= t.min);

        return (
          <li key={floor.name} className="relative py-2.5">
            {/* Node */}
            <span
              className={`absolute -left-[31px] top-1/2 flex size-4 -translate-y-1/2 items-center justify-center rounded-full border-2 ${
                done
                  ? "border-emerald-400 bg-emerald-400/30 shadow-[0_0_12px_rgba(52,211,153,0.6)]"
                  : isNext
                    ? "animate-pulse-glow border-amber-400/70 bg-amber-400/20"
                    : "border-white/15 bg-black/40"
              }`}
            />

            <div
              className={`flex flex-wrap items-center justify-between gap-2 rounded-xl px-4 py-2.5 transition-all duration-75 ${
                done
                  ? "glass-soft hover:scale-[1.01]"
                  : isNext
                    ? "border border-amber-400/25 bg-amber-400/5"
                    : "opacity-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`font-mono text-sm font-bold ${done ? "text-emerald-300" : "text-muted-foreground"}`}
                >
                  {floor.name}
                </span>
                {isNext && (
                  <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300">
                    Next up
                  </span>
                )}
              </div>

              <div className="flex w-full items-center gap-4 text-xs sm:w-auto sm:justify-end">
                {grade && done && (
                  <span className={`font-mono font-bold ${grade.color}`}>
                    {grade.label}
                    {floor.bestScore > 0 && (
                      <span className="ml-1 font-normal text-muted-foreground">
                        {floor.bestScore.toLocaleString()}
                      </span>
                    )}
                  </span>
                )}
                <span className="font-mono text-muted-foreground">
                  {floor.completions.toLocaleString()} runs
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ============================================================================
 * COLLECTION TIER TRACK
 * ========================================================================== */

/** Horizontal tier rail: filled to the current tier, nodes for each tier. */
export function TierTrack({
  currentTier,
  maxTier = 9,
  label,
}: {
  currentTier: number;
  maxTier?: number;
  label: string;
}) {
  const pct = Math.min(100, Math.round((currentTier / maxTier) * 100));

  return (
    <div className="mt-2">
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{label}</span>
        <span>
          Tier {currentTier}/{maxTier}
        </span>
      </div>
      <div className="relative mt-1.5 h-1.5">
        <div className="absolute inset-0 rounded-full bg-white/10" />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-300 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
        {Array.from({ length: maxTier }, (_, i) => (
          <span
            key={i}
            className={`absolute top-1/2 size-2.5 -translate-y-1/2 rounded-full border-2 transition-colors ${
              i < currentTier
                ? "border-emerald-300 bg-emerald-400"
                : i === currentTier
                  ? "border-amber-300 bg-amber-400/50 animate-pulse"
                  : "border-white/20 bg-black/50"
            }`}
            style={{ left: `calc(${((i + 0.5) / maxTier) * 100}% - 5px)` }}
          />
        ))}
      </div>
    </div>
  );
}
