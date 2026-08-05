import { createFileRoute, Link } from "@tanstack/react-router";
import { CircleCheck, Lock } from "lucide-react";
import { useMemo } from "react";

import { ConnectPrompt, ErrorState, LoadState } from "@/components/data-states";
import { Panel, ProgressBar } from "@/components/layout/app-shell";
import { usePlayer } from "@/hooks/use-account";
import { formatFull } from "@/lib/skyblock";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — SkyBlock Assistant" },
      {
        name: "description",
        content:
          "Command center overview of your SkyBlock profile: completion, highlights and live sync status.",
      },
      { property: "og:title", content: "Dashboard — SkyBlock Assistant" },
      {
        property: "og:description",
        content: "Account completion, active profile summary and key highlights.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data, isLoading, error, connected } = usePlayer();

  const profile = data?.profiles.find((p) => p.profileId === data.activeProfileId);

  const netWorth = data ? data.purse + (data.bank ?? 0) : 0;

  const collectionCategories = useMemo(
    () => Array.from(new Set(data?.collections.map((c) => c.category) ?? [])),
    [data],
  );

  const topSkills = useMemo(
    () =>
      data
        ? [...data.skills]
            .sort((a, b) => b.level - a.level || b.totalXp - a.totalXp)
            .slice(0, 4)
        : [],
    [data],
  );

  const dashboardCoverage = useMemo(
    () =>
      data
        ? [
            {
              label: "Skills",
              value: String(data.skills.length),
              meta: `${data.skills.filter((s) => s.maxed).length} maxed`,
              note: "Live skill progress from your profile",
              verified: true,
            },
            {
              label: "Collections",
              value: String(collectionCategories.length),
              meta: `${data.collections.length} items`,
              note: "Collection categories detected for this profile",
              verified: true,
            },
            {
              label: "Fairy Souls",
              value: formatFull(data.fairySouls),
              meta: "Collected total",
              note: "Live fairy soul count",
              verified: true,
            },
            {
              label: "Inventory",
              value: String(data.containers.length),
              meta: "Containers available",
              note: "Storage containers decoded from profile data",
              verified: true,
            },
            {
              label: "Profiles",
              value: String(data.profiles.length),
              meta: profile?.cuteName ?? "Active profile",
              note: "Loaded profiles from your Hypixel account",
              verified: true,
            },
            {
              label: "Net worth",
              value: formatFull(netWorth),
              meta: data.bank === null ? "Bank hidden" : "Purse + bank",
              note: "Estimated live economy value",
              verified: true,
            },
          ]
        : [],
    [data, collectionCategories.length, netWorth, profile?.cuteName],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {!connected && <ConnectPrompt what="your live dashboard overview" />}
      {connected && isLoading && <LoadState>Loading dashboard data…</LoadState>}
      {connected && error && <ErrorState error={error} />}

      {connected && data && (
        <>
          <Panel className="flex flex-wrap items-center justify-between gap-8">
            <div>
              <p className="eyebrow">SkyBlock profile</p>
              <h1 className="mt-2 text-5xl font-semibold tracking-tight">
                {data.username}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span>{profile?.cuteName ?? "Active profile"}</span>
                <span className="rounded-md border border-border bg-secondary/60 px-2 py-0.5 text-xs">
                  {profile?.gameMode ?? "Unknown mode"}
                </span>
                <span>{profile?.members ?? 1} members</span>
              </div>
            </div>
            <div className="glass-soft rounded-2xl px-8 py-6 text-center">
              <p className="eyebrow">Skill average</p>
              <p className="mt-2 text-4xl font-semibold text-primary">
                {data.skillAverage.toFixed(2)}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">Live profile summary</p>
            </div>
          </Panel>

          <Panel>
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-2xl">
                <p className="eyebrow">Account intelligence</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">Profile analysis</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  A verified completion view of the connected SkyBlock profile. Categories without
                  an authoritative value remain clearly marked instead of being estimated.
                </p>
              </div>
              <div className="glass-soft rounded-2xl px-6 py-5">
                <p className="eyebrow">Live net worth</p>
                <p className="mt-2 text-4xl font-semibold">
                  {formatFull(netWorth)}
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
                {dashboardCoverage.map((c) => (
                  <div key={c.label} className="glass-soft rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{c.label}</p>
                      {c.verified ? (
                        <CircleCheck className="size-4 text-primary" />
                      ) : (
                        <Lock className="size-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <p className="text-3xl font-semibold">{c.value}</p>
                      <p className="text-xs text-muted-foreground">{c.meta}</p>
                    </div>
                    <div className="mt-4">
                      <ProgressBar pct={Math.min(100, Number(c.value.replace(/[^0-9]/g, "")) || 0)} />
                    </div>
                    <p className="mt-3 truncate text-xs text-muted-foreground">{c.note}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="glass-soft rounded-2xl p-5">
                  <p className="eyebrow">Reference</p>
                  <h3 className="mt-2 text-xl font-semibold">Account coverage</h3>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Live profile data is loaded from Hypixel. The dashboard updates automatically
                    when your connected profile changes.
                  </p>
                  <dl className="mt-5 space-y-3 text-sm">
                    {[
                      ["Skill average", data.skillAverage.toFixed(2)],
                      ["Total skill XP", formatFull(data.totalSkillXp)],
                      ["Fairy Souls", formatFull(data.fairySouls)],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between border-b border-border pb-3">
                        <dt className="text-muted-foreground">{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="glass-soft rounded-2xl p-5">
                  <p className="eyebrow">Recent activity</p>
                  <ul className="mt-4 space-y-3 text-sm">
                    <li className="flex gap-3">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                      <div>
                        <p>Profile refreshed from Hypixel</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(data.lastSave).toLocaleString()}
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                      <div>
                        <p>{collectionCategories.length} collection categories loaded</p>
                        <p className="text-xs text-muted-foreground">Live collection summary</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                      <div>
                        <p>{data.profiles.length} profile(s) available</p>
                        <p className="text-xs text-muted-foreground">Connected account state</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow">Highlights</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Top skills</h2>
              </div>
              <Link to="/skills" className="text-sm text-primary hover:underline">
                View all skills
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {topSkills.map((s) => (
                <div key={s.key} className="glass-soft rounded-2xl p-5">
                  <p className="text-sm font-medium">
                    {s.name} {s.level}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {s.maxed
                      ? `${formatFull(s.totalXp)} XP`
                      : `${formatFull(s.currentXp)} / ${formatFull(s.neededXp)} XP`}
                  </p>
                  <div className="mt-4">
                    <ProgressBar pct={s.pct} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}