// src/routes/flips.tsx
// Public flip-accuracy page: how well the site's flip suggestions actually
// perform. Every suggestion is logged and later re-priced against live
// markets — this page publishes the results, good or bad.

import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Target, TrendingUp, Scale } from "lucide-react";

import { PageHero, Panel, StatRow } from "@/components/layout/app-shell";
import { LoadState } from "@/components/data-states";
import { fetchFlipAccuracy } from "@/lib/hypixel.functions";
import { formatNumber } from "@/lib/skyblock";

export const Route = createFileRoute("/flips")({
  head: () => ({
    meta: [
      { title: "Flip Accuracy — SkyForge" },
      {
        name: "description",
        content:
          "Our Bazaar and Auction flip suggestions, scored against real market outcomes. Published win rate and realized margins — no cherry-picking.",
      },
    ],
  }),
  component: Flips,
});

function Flips() {
  const accuracyQuery = useQuery({
    queryKey: ["flip-accuracy"],
    queryFn: () => fetchFlipAccuracy(),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const a = accuracyQuery.data;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHero
        eyebrow="Transparency"
        title="Flip accuracy"
        description="Every flip suggestion this site shows is logged and later re-priced against the live market. These are the real results."
      />

      {accuracyQuery.isLoading && <LoadState>Scoring flip history…</LoadState>}

      {a && a.resolved === 0 && (
        <Panel>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="size-4 text-primary" />
            The scorecard is being built — suggestions need at least 10 minutes of market movement
            before they can be scored. Check back soon.
          </p>
        </Panel>
      )}

      {a && a.resolved > 0 && (
        <>
          <StatRow
            stats={[
              {
                label: "Win rate",
                value: `${a.winRate?.toFixed(1)}%`,
                sub: `${a.wins}W / ${a.losses}L of ${a.resolved} resolved`,
              },
              {
                label: "Avg actual margin",
                value: `${(a.avgActualMarginPct ?? 0).toFixed(1)}%`,
                sub: "After the 1.25% market tax",
              },
              {
                label: "Avg predicted margin",
                value: `${(a.avgExpectedMarginPct ?? 0).toFixed(1)}%`,
                sub: "What the suggestion promised",
              },
              {
                label: "Suggestions logged",
                value: formatNumber(a.tracked),
                sub: `${a.resolved} resolved so far`,
              },
            ]}
          />

          <Panel>
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Scale className="size-5 text-primary" /> How scoring works
            </h2>
            <ol className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
              <li className="flex gap-3">
                <span className="font-mono font-bold text-primary">1.</span>
                Every hour, the site logs its top flip suggestions (Bazaar spread flips and
                under-BIN auction flips) with the exact price and expected margin at that moment.
              </li>
              <li className="flex gap-3">
                <span className="font-mono font-bold text-primary">2.</span>
                After at least 10 minutes, each suggestion is re-priced against the live market —
                sell-side price for Bazaar, lowest BIN for Auctions — with the 1.25% tax applied.
              </li>
              <li className="flex gap-3">
                <span className="font-mono font-bold text-primary">3.</span>A suggestion "wins" if
                the realized margin is positive. Win rate and average realized vs predicted margin
                are published here, unedited.
              </li>
            </ol>
            <p className="mt-4 flex items-start gap-2 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-muted-foreground">
              <TrendingUp className="mt-0.5 size-3.5 shrink-0 text-primary" />
              Past performance doesn't guarantee future results — margins move fast and this data
              reflects historical snapshots, not a promise.
            </p>
          </Panel>
        </>
      )}
    </div>
  );
}
