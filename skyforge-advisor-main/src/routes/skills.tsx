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

              {/* Dungeon classes */}
              {data.dungeons.classes && data.dungeons.classes.length > 0 && (
                <div className="mt-6">
                  <p className="eyebrow mb-3">Dungeon classes</p>
                  <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
                    {data.dungeons.classes.map((cls) => (
                      <div
                        key={cls.name}
                        className={`rounded-xl px-4 py-3 text-center transition-all duration-75 ${
                          cls.selected ? "border border-primary/40 bg-primary/15" : "glass-soft"
                        }`}
                      >
                        <p className="text-sm font-semibold">{cls.name}</p>
                        <p className="mt-1 font-mono text-lg font-bold text-primary">{cls.level}</p>
                        {cls.selected && (
                          <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-primary">
                            Selected
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <p className="eyebrow mb-3">Floor map</p>
                <DungeonFloorMap floors={data.dungeons.floors} />
              </div>

              {/* Master Mode */}
              {data.dungeons.masterMode && data.dungeons.masterMode.length > 0 && (
                <div className="mt-6">
                  <p className="eyebrow mb-3">
                    Master Mode
                    {data.dungeons.masterModeLevel != null &&
                      ` · Level ${data.dungeons.masterModeLevel}`}
                  </p>
                  <DungeonFloorMap floors={data.dungeons.masterMode} />
                </div>
              )}
            </Panel>
          )}

          {/* Slayers & Permanent Stat Passives */}
          {data?.slayerOverview && (
            <Panel className="relative overflow-hidden border-rose-500/20 bg-gradient-to-br from-rose-500/[0.03] via-transparent to-amber-500/[0.02]">
              <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white">Slayer Progression & Passives</h2>
                  <p className="text-xs text-white/50">
                    {data.slayerOverview.totalXp.toLocaleString()} total Slayer XP · {data.slayerOverview.totalKills.toLocaleString()} total boss kills
                  </p>
                </div>
                {/* Permanent Passives Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-400">
                    +{data.slayerOverview.passives.health} HP
                  </span>
                  <span className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-400">
                    +{data.slayerOverview.passives.critDamage}% Crit Dmg
                  </span>
                  <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400">
                    +{data.slayerOverview.passives.speed} Speed
                  </span>
                </div>
              </div>

              {/* Boss Cards Grid */}
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.slayerOverview.bosses.map((boss) => {
                  const pct = boss.neededXp > 0 ? Math.min(100, Math.round((boss.currentXp / boss.neededXp) * 100)) : 100;
                  return (
                    <div
                      key={boss.id}
                      className="rounded-xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur transition-all hover:border-rose-500/30 hover:bg-white/[0.04]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{boss.name}</span>
                        <span className="rounded-lg border border-rose-500/40 bg-rose-500/15 px-2 py-0.5 font-mono text-xs font-black text-rose-300">
                          LVL {boss.level}
                        </span>
                      </div>
                      <div className="mt-3 flex items-baseline justify-between text-xs">
                        <span className="font-mono text-white/80">
                          {boss.currentXp.toLocaleString()} XP
                        </span>
                        <span className="text-[10px] text-white/40">
                          {boss.neededXp > 0 ? `Next: ${boss.neededXp.toLocaleString()} XP` : "MAXED"}
                        </span>
                      </div>
                      <div className="mt-2">
                        <ProgressBar pct={pct} />
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-[11px] text-white/50">
                        <span>Total Kills</span>
                        <span className="font-mono font-bold text-white/80">{boss.totalKills.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          )}

          {/* Bestiary Mob Tiers & Family Progression */}
          {data?.bestiary && data.bestiary.totalKills > 0 && (
            <Panel className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.03] via-transparent to-cyan-500/[0.02]">
              <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 font-mono text-lg font-black text-emerald-300">
                      Milestone {data.bestiary.milestone}
                    </span>
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-white">Bestiary Family Milestones</h2>
                      <p className="text-xs text-white/50">
                        {data.bestiary.totalKills.toLocaleString()} mob kills · {data.bestiary.totalTiersUnlocked} / {data.bestiary.maxTiers} tiers unlocked
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/40">Next Milestone:</span>
                  <div className="w-24">
                    <ProgressBar pct={data.bestiary.milestoneProgressPct} />
                  </div>
                </div>
              </div>

              {/* Family Breakdown Cards */}
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.bestiary.families.filter((f) => f.totalKills > 0).map((family) => {
                  const pct = family.maxTiers > 0 ? Math.min(100, Math.round((family.tiersUnlocked / family.maxTiers) * 100)) : 0;
                  return (
                    <div
                      key={family.id}
                      className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 backdrop-blur"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{family.name}</span>
                        <span className="font-mono text-xs font-bold text-emerald-400">
                          {family.tiersUnlocked} / {family.maxTiers} Tiers
                        </span>
                      </div>
                      <div className="mt-2 flex items-baseline justify-between text-[11px]">
                        <span className="font-mono text-white/70">{family.totalKills.toLocaleString()} kills</span>
                        <span className="text-white/40">{pct}%</span>
                      </div>
                      <div className="mt-2">
                        <ProgressBar pct={pct} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          )}

          {/* Heart of the Mountain */}
          {data?.hotm && (
            <Panel>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="text-xl font-semibold">Heart of the Mountain</h2>
                <p className="text-xs text-muted-foreground">Mining core progression</p>
              </div>

              <div className="mt-4">
                <StatRow
                  stats={[
                    {
                      label: "HOTM tier",
                      value: String(data.hotm.tier),
                      sub: `${formatFull(data.hotm.xp)} XP`,
                    },
                    {
                      label: "Mithril powder",
                      value: formatFull(data.hotm.powders.mithril),
                      sub: "Spent + available",
                    },
                    {
                      label: "Gemstone powder",
                      value: formatFull(data.hotm.powders.gemstone),
                      sub: "Crystal Hollows",
                    },
                    {
                      label: "Glacite powder",
                      value: formatFull(data.hotm.powders.glacite),
                      sub: "Mineshafts",
                    },
                  ]}
                />
              </div>

              {Object.keys(data.hotm.nodes).length > 0 && (
                <div className="mt-5">
                  <p className="eyebrow mb-3">Node levels</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(data.hotm.nodes)
                      .sort((a, b) => b[1] - a[1])
                      .map(([node, level]) => (
                        <span
                          key={node}
                          className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] capitalize"
                        >
                          {node.replace(/_/g, " ")}{" "}
                          <span className="font-mono font-bold text-primary">{level}</span>
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </Panel>
          )}

          {/* Garden */}
          {data?.garden && (
            <Panel>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="text-xl font-semibold">Garden</h2>
                <p className="text-xs text-muted-foreground">Farming hub progression</p>
              </div>

              <div className="mt-4">
                <StatRow
                  stats={[
                    {
                      label: "Garden level",
                      value: String(data.garden.level),
                      sub: `${formatFull(data.garden.xp)} XP`,
                    },
                    ...(data.garden.visitorsServed != null
                      ? [
                          {
                            label: "Visitors served",
                            value: formatFull(data.garden.visitorsServed),
                            sub: "Lifetime",
                          },
                        ]
                      : []),
                    ...(data.garden.compost != null
                      ? [
                          {
                            label: "Composts",
                            value: formatFull(data.garden.compost),
                            sub: "Organic matter used",
                          },
                        ]
                      : []),
                    {
                      label: "Crops tracked",
                      value: String(Object.keys(data.garden.cropMilestones).length),
                      sub: "With milestone data",
                    },
                  ]}
                />
              </div>

              {Object.keys(data.garden.cropMilestones).length > 0 && (
                <div className="mt-5 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-4">
                  {Object.entries(data.garden.cropMilestones)
                    .sort((a, b) => b[1] - a[1])
                    .map(([crop, milestone]) => (
                      <div
                        key={crop}
                        className="glass-soft flex items-center justify-between rounded-lg px-3 py-2 text-xs capitalize"
                      >
                        <span className="text-muted-foreground">{crop}</span>
                        <span className="font-mono font-semibold">{formatFull(milestone)}</span>
                      </div>
                    ))}
                </div>
              )}
            </Panel>
          )}

          {/* Crimson Isle */}
          {data?.crimson && (
            <Panel>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="text-xl font-semibold">Crimson Isle</h2>
                <p className="text-xs text-muted-foreground">
                  {data.crimson.faction ? `${data.crimson.faction} faction` : "Dojo & Kuudra"}
                </p>
              </div>

              {Object.keys(data.crimson.kuudra).length > 0 && (
                <div className="mt-4">
                  <p className="eyebrow mb-3">Kuudra completions</p>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {Object.entries(data.crimson.kuudra).map(([tier, count]) => (
                      <div key={tier} className="glass-soft rounded-xl px-4 py-3 text-center">
                        <p className="text-xs capitalize text-muted-foreground">{tier}</p>
                        <p className="mt-1 font-mono text-lg font-bold">{count}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Object.keys(data.crimson.dojo).length > 0 && (
                <div className="mt-5">
                  <p className="eyebrow mb-3">Dojo scores</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(data.crimson.dojo)
                      .sort((a, b) => b[1] - a[1])
                      .map(([challenge, score]) => (
                        <span
                          key={challenge}
                          className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] capitalize"
                        >
                          {challenge.replace(/_/g, " ")}{" "}
                          <span className="font-mono font-bold text-primary">{score}</span>
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </Panel>
          )}

          {/* Rift */}
          {data?.rift && (
            <Panel>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="text-xl font-semibold">Rift</h2>
                <p className="text-xs text-muted-foreground">Dimensional progress</p>
              </div>
              {data.rift.motes != null && (
                <p className="mt-3 font-mono text-lg font-bold text-primary">
                  {formatFull(data.rift.motes)}{" "}
                  <span className="text-xs text-muted-foreground">motes</span>
                </p>
              )}
              {Object.keys(data.rift.progress).length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {Object.entries(data.rift.progress)
                    .slice(0, 20)
                    .map(([key, value]) => (
                      <span
                        key={key}
                        className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px]"
                      >
                        {key.replace(/_/g, " ")}:{" "}
                        <span className="font-mono font-semibold">{formatNumber(value)}</span>
                      </span>
                    ))}
                </div>
              )}
            </Panel>
          )}
        </>
      )}
    </div>
  );
}
