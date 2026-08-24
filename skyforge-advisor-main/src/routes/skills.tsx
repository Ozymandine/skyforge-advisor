import { createFileRoute } from "@tanstack/react-router";

import { ConnectPrompt, ErrorState, LoadState } from "@/components/data-states";
import { PageHero, Panel, ProgressBar, StatRow } from "@/components/layout/app-shell";
import { ItemIcon } from "@/components/ui/item-icon";
import { DungeonFloorMap, SkillRadar } from "@/components/progression-visuals";
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
        <>
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

            {/* Skill constellation radar */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="eyebrow">Skill constellation</p>
              <SkillRadar skills={data.skills} />
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

          {/* Dungeons */}
          {data?.dungeons && (
            <Panel>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="text-xl font-semibold">Dungeons</h2>
                <p className="text-xs text-muted-foreground">Catacombs progression</p>
              </div>

              <div className="mt-4">
                <StatRow
                  stats={[
                    {
                      label: "Catacombs level",
                      value: String(data.dungeons.catacombsLevel),
                      sub: `${formatNumber(data.dungeons.catacombsXp)} XP`,
                    },
                    {
                      label: "Secrets found",
                      value: formatNumber(data.dungeons.secretsFound),
                      sub: "Across all runs",
                    },
                    {
                      label: "Floors completed",
                      value: String(data.dungeons.floors.filter((f) => f.completions > 0).length),
                      sub: "Distinct floors",
                    },
                    {
                      label: "Total completions",
                      value: formatNumber(
                        data.dungeons.floors.reduce((sum, f) => sum + f.completions, 0),
                      ),
                      sub: "All floors combined",
                    },
                  ]}
                />
              </div>

              <div className="mt-6">
                <p className="eyebrow mb-3">Floor map</p>
                <DungeonFloorMap floors={data.dungeons.floors} />
              </div>
            </Panel>
          )}

          {/* Slayers */}
          {data?.slayers && data.slayers.length > 0 && (
            <Panel>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="text-xl font-semibold">Slayers</h2>
                <p className="text-xs text-muted-foreground">Boss kills by tier</p>
              </div>

              <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {data.slayers.map((slayer) => (
                  <li
                    key={`${slayer.name}-${slayer.tier}`}
                    className="glass-soft flex items-center justify-between gap-3 rounded-xl px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{slayer.name}</p>
                      <p className="text-xs text-muted-foreground">Tier {slayer.tier}</p>
                    </div>
                    <p className="shrink-0 font-mono text-sm font-semibold text-primary">
                      {slayer.kills.toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </>
      )}
    </div>
  );
}
