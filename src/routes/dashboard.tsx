import { createFileRoute, Link } from "@tanstack/react-router";
import { CircleCheck, Lock } from "lucide-react";

import { Panel, PageHero, ProgressBar } from "@/components/layout/app-shell";
import { dashboardCoverage, eventHistory, profile, skills } from "@/data/mock";

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
  const topSkills = [...skills].sort((a, b) => b.level - a.level).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Panel className="flex flex-wrap items-center justify-between gap-8">
        <div>
          <p className="eyebrow">SkyBlock profile</p>
          <h1 className="mt-2 text-5xl font-semibold tracking-tight">{profile.username}</h1>
          <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
            <span>{profile.profileName}</span>
            <span className="rounded-md border border-border bg-secondary/60 px-2 py-0.5 text-xs">
              {profile.profileType}
            </span>
            <span>{profile.members} members</span>
          </div>
        </div>
        <div className="glass-soft rounded-2xl px-8 py-6 text-center">
          <p className="eyebrow">SkyBlock level</p>
          <p className="mt-2 text-4xl font-semibold text-primary">{profile.skyblockLevel}</p>
          <p className="mt-2 text-xs text-muted-foreground">Live Hypixel profile</p>
        </div>
      </Panel>

      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <p className="eyebrow">Account intelligence</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Profile analysis</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              A verified completion view of the connected SkyBlock profile. Categories without an
              authoritative value remain clearly marked instead of being estimated.
            </p>
          </div>
          <div className="glass-soft rounded-2xl px-6 py-5">
            <p className="eyebrow">Measured completion</p>
            <p className="mt-2 text-4xl font-semibold">39%</p>
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
                  <ProgressBar pct={parseInt(c.value) || 0} />
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
                5 progression categories currently have enough verified data to score. More sections
                activate automatically as Hypixel returns them.
              </p>
              <dl className="mt-5 space-y-3 text-sm">
                {[
                  ["SkyBlock level", String(profile.skyblockLevel)],
                  ["Magical Power", "1,204"],
                  ["Fairy Souls", "23 / 247"],
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
                {eventHistory.slice(0, 4).map((e) => (
                  <li key={e.label} className="flex gap-3">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    <div>
                      <p>{e.label}</p>
                      <p className="text-xs text-muted-foreground">{e.time}</p>
                    </div>
                  </li>
                ))}
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
            <div key={s.name} className="glass-soft rounded-2xl p-5">
              <p className="text-sm font-medium">
                {s.name} {s.level}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {s.current} / {s.target} XP
              </p>
              <div className="mt-4">
                <ProgressBar pct={s.pct} />
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function PageHeroUnused() {
  return <PageHero eyebrow="" title="" description="" />;
}
void PageHeroUnused;
