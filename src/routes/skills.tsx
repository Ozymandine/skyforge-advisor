import { createFileRoute } from "@tanstack/react-router";

import { PageHero, Panel, ProgressBar } from "@/components/layout/app-shell";
import { profile, skills } from "@/data/mock";

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
  return (
    <div className="mx-auto max-w-7xl">
      <PageHero
        eyebrow="Progression"
        title="Skills"
        description="Track every skill level and see exactly how close you are to the next milestone."
      />

      <Panel>
        <p className="eyebrow">Total SkyBlock level</p>
        <div className="mt-3 h-0.5 w-10 rounded-full bg-foreground/60" />
        <p className="mt-5 text-sm text-muted-foreground">{profile.totalXp} total SkyBlock XP</p>

        <div className="mt-6 grid gap-3 rounded-2xl bg-secondary/25 p-4 lg:grid-cols-2">
          {skills.map((s) => (
            <div key={s.name} className="glass-soft rounded-2xl px-5 py-4">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-lg font-semibold">
                  {s.name} {s.level}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {s.current} / {s.target} XP
                </p>
              </div>
              <div className="mt-3">
                <ProgressBar pct={s.pct} />
              </div>
              <p className="mt-2 text-right text-xs text-muted-foreground">{s.pct}%</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
