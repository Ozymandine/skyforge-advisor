{/* Temporary test tag */}
<div className="flex items-center gap-2 p-4 bg-secondary/50 rounded-xl">
  <p className="text-xs font-mono">Direct test:</p>
  <img src="/items/farming_skill.png" alt="Test" className="size-8 pixelated" />
</div>


import { createFileRoute } from "@tanstack/react-router";

import { ConnectPrompt, ErrorState, LoadState } from "@/components/data-states";
import { PageHero, Panel, ProgressBar } from "@/components/layout/app-shell";
import { ItemIcon } from "@/components/ui/item-icon";
import { usePlayer } from "@/hooks/use-account";
import { formatFull, formatNumber } from "@/lib/skyblock";

export const Route = createFileRoute("/skills")({
  head: () => ({
    meta: [
      { title: "Skills — SkyBlock Assistant" },
      {
        name: "description",
        content: "Track every SkyBlock skill level, XP progress and milestone percentage.",
      },
      { property: "og:title", content: "Skills — SkyBlock Assistant" },
      {
        property: "og:description",
        content: "Every skill level with precise XP counters and progress bars.",
      },
    ],
  }),
  component: Skills,
});

function Skills() {
  const { data, isLoading, error, connected } = usePlayer();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHero
        eyebrow="Progression"
        title="Skills"
        description="Live skill levels and XP pulled from the Hypixel SkyBlock API."
      />

      {!connected && <ConnectPrompt what="your real skill levels" />}
      {connected && isLoading && <LoadState>Loading skills from Hypixel…</LoadState>}
      {connected && error && <ErrorState error={error} />}

      {data && (
        <Panel>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Skill Average</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight">
                {data.skillAverage.toFixed(2)}{" "}
                <span className="text-lg font-normal text-muted-foreground">/ 56.75</span>
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatFull(data.totalSkillXp)} total skill XP · {data.username}
            </p>
          </div>

          {/* Skill Average Progress Bar (Relative to 56.75 Max) */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs font-medium text-muted-foreground">
              <span>Progress to Max Skill Average</span>
              <span>{((data.skillAverage / 56.75) * 100).toFixed(1)}%</span>
            </div>
            <ProgressBar pct={Math.min(100, Math.round((data.skillAverage / 56.75) * 100))} />
          </div>

          {/* Individual Skills Grid */}
          <div className="mt-6 grid gap-3 rounded-2xl bg-secondary/25 p-4 lg:grid-cols-2">
            {data.skills.map((s) => (
              <div
                key={s.key}
                className="glass-soft rounded-2xl px-5 py-4 transition-all duration-75 ease-out hover:scale-[1.01] hover:border-primary/30"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <ItemIcon id={s.key} name={s.name} className="size-7 shrink-0" />
                    <p className="text-lg font-semibold">
                      {s.name} {s.level}
                      {s.maxed && (
                        <span className="ml-2 text-xs font-medium text-primary">MAXED</span>
                      )}
                    </p>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">
                    {s.maxed
                      ? `${formatNumber(s.totalXp)} XP`
                      : `${formatNumber(s.currentXp)} / ${formatNumber(s.neededXp)} XP`}
                  </p>
                </div>
                <div className="mt-3">
                  <ProgressBar pct={s.pct} />
                </div>
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>Cap {s.cap}</span>
                  <span>{s.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}