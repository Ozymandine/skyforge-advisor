// src/routes/index.tsx
// Landing page — the storefront. Live proof (real flips from public data),
// feature grid, and a 2-step get-started strip. No connect wall.

import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Coins,
  Hammer,
  KeyRound,
  Sparkles,
  TrendingUp,
  User,
} from "lucide-react";

import { Panel } from "@/components/layout/app-shell";
import { ItemIcon } from "@/components/ui/item-icon";
import { fetchBazaar, fetchFlipAccuracy } from "@/lib/hypixel.functions";
import { formatNumber } from "@/lib/skyblock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkyForge — Live SkyBlock stats, flips & progression" },
      {
        name: "description",
        content:
          "Live Hypixel SkyBlock profile stats, market flip suggestions with a published accuracy score, a full item wiki, crafting cost trees and net worth tracking. No login.",
      },
      { property: "og:title", content: "SkyForge — Live SkyBlock stats, flips & progression" },
      { property: "og:image", content: "/og-image.png" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    to: "/dashboard",
    icon: User,
    title: "Profile command center",
    body: "Skills, dungeons, slayers, fairy souls and inventory — live from Hypixel the moment you connect.",
  },
  {
    to: "/bazaar",
    icon: TrendingUp,
    title: "Bazaar & AH flips",
    body: "Every listing scanned for margin, with liquidity scoring and BIN history sparklines.",
  },
  {
    to: "/flips",
    icon: TargetIcon,
    title: "Published accuracy score",
    body: "Our flip suggestions are logged and re-priced against the real market. We publish the win rate — good or bad.",
  },
  {
    to: "/wiki",
    icon: BookOpen,
    title: "8,700+ item wiki",
    body: "Real stats, abilities, requirements and crafting grids from the NEU dataset, linked to live prices.",
  },
  {
    to: "/crafting",
    icon: Hammer,
    title: "Crafting cost trees",
    body: "Craft it or buy it? Full dependency trees priced to raw materials with the cheapest path highlighted.",
  },
  {
    to: "/net-worth",
    icon: Coins,
    title: "Net worth & valuation",
    body: "Every container priced against live markets, with a most-valuable-items leaderboard.",
  },
];

function TargetIcon(props: { className?: string }) {
  return <BarChart3 {...props} />;
}

function Landing() {
  // Live proof: real flips + accuracy from public endpoints (no key needed).
  const bazaarQuery = useQuery({
    queryKey: ["bazaar"],
    queryFn: () => fetchBazaar(),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
  const accuracyQuery = useQuery({
    queryKey: ["flip-accuracy"],
    queryFn: () => fetchFlipAccuracy(),
    staleTime: 60_000,
  });

  const topFlips = (bazaarQuery.data?.products ?? [])
    .slice()
    .sort((a, b) => b.profitPerHour - a.profitPerHour)
    .slice(0, 3);

  const accuracy = accuracyQuery.data;
  const hasAccuracy = accuracy && accuracy.resolved > 0;

  return (
    <div className="mx-auto max-w-7xl space-y-14 pb-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/40 px-6 py-16 text-center backdrop-blur-xl sm:px-12">
        <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 size-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <p className="eyebrow">Free · No login · Open methodology</p>
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">
          Live SkyBlock stats,{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            flips & progression
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Profile analytics, market flip suggestions with a published accuracy score, a full item
          wiki and crafting cost trees — powered by the official Hypixel API and the NEU dataset.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/connect"
            className="flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-6 py-3 text-sm font-semibold text-primary transition-all duration-75 ease-out hover:scale-[1.03] hover:bg-primary/25 active:scale-95"
          >
            <Sparkles className="size-4" /> Connect your profile
          </Link>
          <a
            href="https://developer.hypixel.net/api-key"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-muted-foreground transition-all duration-75 ease-out hover:scale-[1.02] hover:text-foreground"
          >
            <KeyRound className="size-4" /> Get a free API key
          </a>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {[
            ["1", "Type your username", "We resolve it via Mojang instantly"],
            [
              "2",
              "Paste your free key",
              "One click at developer.hypixel.net — stays in your browser",
            ],
            ["3", "Everything loads", "Dashboard, flips, wiki, crafting — all live"],
          ].map(([step, title, body]) => (
            <div key={step} className="glass-soft rounded-2xl p-4 text-left">
              <p className="font-mono text-xs font-bold text-primary">STEP {step}</p>
              <p className="mt-1.5 text-sm font-semibold">{title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Live proof: real flips right now */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <TrendingUp className="size-5 text-primary" /> Live flips, right now
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Real Bazaar data — this is what the flip board looks like at this exact moment.
            </p>
          </div>
          <Link
            to="/bazaar"
            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            Open the flip board <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {topFlips.map((p) => (
            <Link
              key={p.id}
              to="/bazaar"
              className="glass-soft group rounded-2xl p-4 transition-all duration-75 ease-out hover:scale-[1.02] hover:border-primary/40"
            >
              <div className="flex items-center gap-3">
                <ItemIcon id={p.id} name={p.name} className="size-8 shrink-0" />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{p.name}</span>
              </div>
              <p className="mt-3 font-mono text-2xl font-black text-emerald-300">
                +{formatNumber(p.profitPerHour)}
                <span className="ml-1 text-xs font-semibold text-muted-foreground">/hr</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Margin {p.margin.toFixed(1)}% · {formatNumber(p.buyMovingWeek)} bought/wk
              </p>
            </Link>
          ))}
          {topFlips.length === 0 &&
            [0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-2xl border border-white/10 bg-black/20"
              />
            ))}
        </div>

        {hasAccuracy && (
          <Link
            to="/flips"
            className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-5 py-4 transition-all duration-75 hover:scale-[1.01]"
          >
            <p className="flex items-center gap-2 text-sm font-semibold">
              <TargetIcon className="size-4 text-emerald-300" />
              Our flip picks: {accuracy!.winRate?.toFixed(0)}% win rate over {accuracy!.resolved}{" "}
              scored suggestions
            </p>
            <span className="flex items-center gap-1 text-xs text-emerald-300">
              See the full scorecard <ArrowRight className="size-3.5" />
            </span>
          </Link>
        )}
      </section>

      {/* Feature grid */}
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">Everything in one place</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Link
              key={feature.to}
              to={feature.to}
              className="glass-soft group rounded-2xl p-5 transition-all duration-75 ease-out hover:scale-[1.02] hover:border-primary/40"
            >
              <feature.icon className="size-5 text-primary" />
              <p className="mt-3 font-semibold">{feature.title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{feature.body}</p>
              <span className="mt-3 flex items-center gap-1 text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Open <ArrowRight className="size-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section>
        <Panel className="text-center">
          <p className="text-sm font-medium">
            Powered by the official Hypixel API + the NEU community dataset
          </p>
          <p className="mx-auto mt-2 max-w-xl text-xs text-muted-foreground">
            Your API key stays in your browser and is only used to call Hypixel. Unknown values are
            shown as "not available" — never invented. Flip results are published unedited.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-primary">
            <Link to="/about" className="hover:underline">
              How we handle data
            </Link>
            <Link to="/flips" className="hover:underline">
              Flip methodology
            </Link>
            <Link to="/connect" className="hover:underline">
              Connect your profile
            </Link>
          </div>
        </Panel>
      </section>
    </div>
  );
}
