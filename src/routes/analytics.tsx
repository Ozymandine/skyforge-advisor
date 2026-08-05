import { createFileRoute } from "@tanstack/react-router";

import { ConnectPrompt, ErrorState, LoadState } from "@/components/data-states";
import { PageHero, Panel, StatRow } from "@/components/layout/app-shell";
import { usePlayer } from "@/hooks/use-account";
import { formatFull } from "@/lib/skyblock";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — SkyBlock Assistant" },
      {
        name: "description",
        content: "Live SkyBlock profile analytics, progress summaries and trend breakdowns.",
      },
      { property: "og:title", content: "Analytics — SkyBlock Assistant" },
      {
        property: "og:description",
        content: "Live profile analytics for skill progress, net worth and collection tracking.",
      },
    ],
  }),
  component: Analytics,
});

function Analytics() {
  const { data, isLoading, error, connected } = usePlayer();

  const netWorth = data ? data.purse + (data.bank ?? 0) : 0;
  const topSkills = data
    ? [...data.skills]
        .sort((a, b) => b.level - a.level || b.totalXp - a.totalXp)
        .slice(0, 4)
    : [];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHero
        eyebrow="Tools"
        title="Analytics"
        description="Live trend summaries, profile performance and progress metrics from your connected account."
      />

      {!connected && <ConnectPrompt what="analytics for your SkyBlock profile" />}
      {connected && isLoading && <LoadState>Loading analytics data…</LoadState>}
      {connected && error && <ErrorState error={error} />}

      {connected && data && (
        <>
          <StatRow
            stats={[
              { label: "Skill average", value: data.skillAverage.toFixed(2), sub: "All skills" },
              { label: "Total skill XP", value: formatFull(data.totalSkillXp), sub: "Current progress" },
              { label: "Net worth estimate", value: formatFull(netWorth), sub: "Purse + bank" },
              {
                label: "Collections tracked",
                value: String(data.collections.length),
                sub: "Unique categories",
              },
            ]}
          />

          <Panel>
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-2xl">
                <p className="eyebrow">Profile performance</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">Connected account analytics</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  These insights are pulled from your live Hypixel SkyBlock profile. Historical trend
                  data is available once the app has connected and collected profile snapshots over time.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              <div className="glass-soft rounded-2xl p-5">
                <p className="text-sm font-medium">Live net worth</p>
                <p className="mt-3 text-3xl font-semibold">{formatFull(netWorth)}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {data.bank === null
                    ? "Bank hidden by profile"
                    : `${formatFull(data.purse)} purse · ${formatFull(data.bank)} bank`}
                </p>
              </div>

              <div className="glass-soft rounded-2xl p-5">
                <p className="text-sm font-medium">Fairy souls</p>
                <p className="mt-3 text-3xl font-semibold">{formatFull(data.fairySouls)}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Total fairy souls collected for this profile
                </p>
              </div>

              <div className="glass-soft rounded-2xl p-5">
                <p className="text-sm font-medium">Active profiles</p>
                <p className="mt-3 text-3xl font-semibold">{data.profiles.length}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Profiles loaded from your connected account
                </p>
              </div>
            </div>
          </Panel>

          <Panel>
            <h2 className="text-xl font-semibold">Top skills</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {topSkills.map((skill) => (
                <div key={skill.key} className="glass-soft rounded-2xl p-5">
                  <p className="text-sm font-medium">
                    {skill.name} {skill.level}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {skill.maxed
                      ? `${formatFull(skill.totalXp)} XP · Maxed`
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
                  <p className="mt-2 text-xs text-muted-foreground">{skill.pct}% to next level</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <h2 className="text-xl font-semibold">Collection overview</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Your connected profile currently reports {data.collections.length} collection categories.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.collections.slice(0, 6).map((collection) => (
                <div key={`${collection.category}-${collection.name}`} className="glass-soft rounded-2xl p-5">
                  <p className="text-sm font-medium">{collection.name}</p>
                  <p className="mt-3 text-2xl font-semibold">{formatFull(collection.amount)}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{collection.category}</p>
                </div>
              ))}
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}