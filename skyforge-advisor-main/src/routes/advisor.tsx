import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowRight } from "lucide-react";

import { ConnectPrompt, ErrorState, LoadState } from "@/components/data-states";
import { PageHero, Panel, ProgressBar, StatRow } from "@/components/layout/app-shell";
import { usePlayer } from "@/hooks/use-account";
import { formatFull } from "@/lib/skyblock";
import { MAX_FAIRY_SOULS } from "@/lib/constants";

export const Route = createFileRoute("/advisor")({
  head: () => ({
    meta: [
      { title: "Advisor — SkyBlock Assistant" },
      {
        name: "description",
        content: "Recommendation matrix for the cheapest cost-per-stat progression upgrades.",
      },
      { property: "og:title", content: "Advisor — SkyBlock Assistant" },
      {
        property: "og:description",
        content: "What should I do next? Ranked by the lowest cost per stat and per level gained.",
      },
    ],
  }),
  component: Advisor,
});

const priorityClass: Record<string, string> = {
  High: "text-primary border-primary/40 bg-primary/15",
  Medium: "text-gold border-gold/40 bg-gold/10",
  Low: "text-muted-foreground border-border bg-secondary",
};

type RoadmapStep = {
  title: string;
  detail: string;
  priority: keyof typeof priorityClass;
  /** 0–100 progress toward completing this step (used for the bar). */
  pct?: number;
};

/**
 * Generate a ranked progression roadmap from live profile data.
 * Ordered by impact-per-effort: cheap wins first, grinds last.
 */
function buildRoadmap(data: NonNullable<ReturnType<typeof usePlayer>["data"]>): RoadmapStep[] {
  const steps: RoadmapStep[] = [];

  // 1. Fairy souls — free permanent stats.
  const soulsLeft = MAX_FAIRY_SOULS - data.fairySouls;
  if (soulsLeft > 0) {
    steps.push({
      title: `Collect ${soulsLeft} more fairy soul${soulsLeft > 1 ? "s" : ""}`,
      detail: `Free permanent stats — you're at ${data.fairySouls}/${MAX_FAIRY_SOULS}. Use a guide mod or the wiki's Locations page.`,
      priority: "High",
      pct: Math.round((data.fairySouls / MAX_FAIRY_SOULS) * 100),
    });
  }

  // 2. Skills closest to leveling — cheapest XP per level right now.
  const nearLevel = data.skills
    .filter((s) => !s.maxed)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3);
  for (const skill of nearLevel) {
    steps.push({
      title: `Push ${skill.name} to level ${skill.level + 1}`,
      detail: `Only ${formatFull(skill.neededXp - skill.currentXp)} XP away (${skill.pct}% done) — the cheapest level available to you.`,
      priority: skill.pct >= 75 ? "High" : "Medium",
      pct: skill.pct,
    });
  }

  // 3. Weakest non-maxed skills — biggest skill-average gains.
  const weakest = data.skills.filter((s) => !s.maxed).sort((a, b) => a.level - b.level)[0];
  if (weakest && weakest.level < 20) {
    steps.push({
      title: `Grind ${weakest.name} (level ${weakest.level})`,
      detail: `Your lowest skill — raising it lifts your skill average (${data.skillAverage.toFixed(2)}) and unlocks gated content.`,
      priority: "Medium",
      pct: weakest.pct,
    });
  }

  // 4. Dungeons: unlock the next floor, or push completions on the current one.
  const dungeons = data.dungeons;
  if (dungeons) {
    const unlockedFloors = dungeons.floors.filter((f) => f.completions > 0);
    const nextFloor = dungeons.floors.find((f) => f.completions === 0);
    if (nextFloor) {
      steps.push({
        title: `Unlock ${nextFloor.name} in the Catacombs`,
        detail: `Catacombs level ${dungeons.catacombsLevel} — completing ${nextFloor.name} unlocks better loot and XP tiers.`,
        priority: "Medium",
      });
    } else if (unlockedFloors.length > 0) {
      const current = unlockedFloors[unlockedFloors.length - 1]!;
      steps.push({
        title: `Grind ${current.name} completions`,
        detail: `${current.completions} runs so far${current.bestScore ? ` · best score ${current.bestScore}` : ""} — dungeon XP raises your Catacombs level (${dungeons.catacombsLevel}).`,
        priority: "Medium",
        pct: Math.min(100, Math.round((current.completions / 100) * 100)),
      });
    }

    // Secrets per run is the main gate for higher dungeon scores.
    if (dungeons.secretsFound < 500) {
      steps.push({
        title: `Find more dungeon secrets (${dungeons.secretsFound} found)`,
        detail:
          "Secrets per run drives your D rating → S+ score and party appeal. A secrets mod makes this trivial.",
        priority: "Low",
      });
    }
  }

  // 5. Slayers: push the lowest-tier bosses you've started.
  const topSlayer = data.slayers?.slice().sort((a, b) => b.tier - a.tier || b.kills - a.kills)[0];
  if (topSlayer && topSlayer.kills < 25) {
    steps.push({
      title: `${topSlayer.name} Tier ${topSlayer.tier}: ${25 - topSlayer.kills} more kills`,
      detail:
        "Slayer XP unlocks powerful perks and drops. Tier 4+ bosses are the long-term coin and XP source.",
      priority: "Low",
      pct: Math.round((topSlayer.kills / 25) * 100),
    });
  }

  // 6. Collections with headroom.
  const topCollection = data.collections?.[0];
  if (topCollection) {
    steps.push({
      title: `Expand ${topCollection.name} collection`,
      detail: `${data.collections.length} collections tracked — higher tiers unlock crafting recipes and minion slots.`,
      priority: "Low",
    });
  }

  // 7. Bank interest.
  if (data.bank !== null && data.bank < 50_000_000) {
    steps.push({
      title: "Grow your bank balance",
      detail: `Bank at ${formatFull(data.bank)} — daily interest compounds, and it's safe from death losses.`,
      priority: "Low",
    });
  }

  return steps.slice(0, 10);
}

function Advisor() {
  const { data, isLoading, error, connected } = usePlayer();

  const roadmap = useMemo(() => (data ? buildRoadmap(data) : []), [data]);

  const topSkills = data?.skills
    .slice()
    .sort((a, b) => b.level - a.level)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHero
        eyebrow="Tools"
        title="Advisor"
        description="What should you do next? Ranked by the lowest cost per stat and per level gained."
      />

      {!connected && <ConnectPrompt what="your advisor summary" />}
      {connected && isLoading && <LoadState>Loading profile data…</LoadState>}
      {connected && error && <ErrorState error={error} />}

      {connected && data && (
        <>
          <StatRow
            stats={[
              { label: "Connected profile", value: data.username, sub: "Live Hypixel account" },
              { label: "Skill average", value: data.skillAverage.toFixed(2), sub: "All skills" },
              {
                label: "Total skill XP",
                value: formatFull(data.totalSkillXp),
                sub: "Current progress",
              },
              {
                label: "Liquid coins",
                value: formatFull(data.purse),
                sub: data.bank === null ? "Bank hidden" : `Bank ${formatFull(data.bank)}`,
              },
            ]}
          />

          <Panel>
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-2xl">
                <p className="eyebrow">Advisor summary</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                  Live recommendation overview
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  This page shows your connected profile performance and highlights. Once connected,
                  recommendations are generated from your actual SkyBlock profile data.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              <div className="glass-soft rounded-2xl p-5">
                <p className="text-sm font-medium">Top skill</p>
                <p className="mt-3 text-3xl font-semibold">
                  {topSkills?.[0]?.name ?? "N/A"} {topSkills?.[0]?.level ?? ""}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Highest live skill level in this profile
                </p>
              </div>
              <div className="glass-soft rounded-2xl p-5">
                <p className="text-sm font-medium">Available collections</p>
                <p className="mt-3 text-3xl font-semibold">{data.collections?.length ?? 0}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Unique collection categories tracked
                </p>
              </div>
              <div className="glass-soft rounded-2xl p-5">
                <p className="text-sm font-medium">Active profiles</p>
                <p className="mt-3 text-3xl font-semibold">{data.profiles?.length ?? 0}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Profiles loaded from your account
                </p>
              </div>
            </div>
          </Panel>

          <Panel>
            <h2 className="text-xl font-semibold">Progression roadmap</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ranked next-steps generated from your live profile — cheapest wins first.
            </p>
            <ol className="mt-6 space-y-3">
              {roadmap.map((step, index) => (
                <li key={step.title} className="glass-soft rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border text-xs font-semibold text-muted-foreground">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{step.title}</p>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${priorityClass[step.priority]}`}
                        >
                          {step.priority}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{step.detail}</p>
                      {step.pct !== undefined && (
                        <div className="mt-3 max-w-sm">
                          <ProgressBar pct={step.pct} />
                        </div>
                      )}
                    </div>
                    <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
                  </div>
                </li>
              ))}
              {roadmap.length === 0 && (
                <li className="py-6 text-center text-sm text-muted-foreground">
                  Everything tracked is complete — incredible profile!
                </li>
              )}
            </ol>
          </Panel>

          <Panel>
            <h2 className="text-xl font-semibold">Top skills</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {topSkills?.map((skill) => (
                <div key={skill.key} className="glass-soft rounded-2xl p-5">
                  <p className="text-sm font-medium">
                    {skill.name} {skill.level}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {skill.maxed
                      ? `${formatFull(skill.totalXp)} XP`
                      : `${formatFull(skill.currentXp)} / ${formatFull(skill.neededXp)} XP`}
                  </p>
                  <div className="mt-4">
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${skill.pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {!topSkills?.length && (
                <p className="text-sm text-muted-foreground">
                  No skill data available for this profile.
                </p>
              )}
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}
