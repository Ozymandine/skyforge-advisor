import { createFileRoute } from "@tanstack/react-router";

import { ConnectPrompt, ErrorState, LoadState } from "@/components/data-states";
import { PageHero, Panel, StatRow } from "@/components/layout/app-shell";
import { usePlayer } from "@/hooks/use-account";
import { formatFull } from "@/lib/skyblock";

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

function Advisor() {
  const { data, isLoading, error, connected } = usePlayer();

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
              { label: "Total skill XP", value: formatFull(data.totalSkillXp), sub: "Current progress" },
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
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">Live recommendation overview</h2>
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
                <p className="mt-3 text-3xl font-semibold">
                  {data.collections?.length ?? 0}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Unique collection categories tracked
                </p>
              </div>
              <div className="glass-soft rounded-2xl p-5">
                <p className="text-sm font-medium">Active profiles</p>
                <p className="mt-3 text-3xl font-semibold">
                  {data.profiles?.length ?? 0}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Profiles loaded from your account
                </p>
              </div>
            </div>
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
                <p className="text-sm text-muted-foreground">No skill data available for this profile.</p>
              )}
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}