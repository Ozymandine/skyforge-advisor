import { createFileRoute } from "@tanstack/react-router";

import { PageHero, Panel, StatRow } from "@/components/layout/app-shell";
import { advisorRecommendations } from "@/data/mock";

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
        content: "What should I do next? Ranked upgrades by cost efficiency.",
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
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHero
        eyebrow="Tools"
        title="Advisor"
        description="What should you do next? Ranked by the lowest cost per stat and per level gained."
      />

      <StatRow
        stats={[
          { label: "Open recommendations", value: String(advisorRecommendations.length), sub: "Refreshed 12:38 PM" },
          { label: "High priority", value: "2", sub: "Biggest measured impact" },
          { label: "Budget assumed", value: "1.22B", sub: "Liquid coins available" },
          { label: "Projected gain", value: "+168 stats", sub: "If all applied" },
        ]}
      />

      <Panel>
        <h2 className="text-xl font-semibold">Recommendation matrix</h2>
        <div className="mt-6 space-y-3">
          {advisorRecommendations.map((r) => (
            <div key={r.title} className="glass-soft rounded-2xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold">{r.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{r.category}</p>
                </div>
                <span
                  className={`rounded-md border px-2 py-1 text-[10px] font-semibold tracking-widest ${priorityClass[r.priority]}`}
                >
                  {r.priority.toUpperCase()}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">Impact</p>
                  <p className="mt-1 font-medium text-primary">{r.impact}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cost</p>
                  <p className="mt-1 font-medium">{r.cost}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Efficiency</p>
                  <p className="mt-1 font-medium">{r.efficiency}</p>
                </div>
              </div>

              <p className="mt-4 text-sm text-muted-foreground">{r.note}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
