// src/routes/index.tsx
// Landing page — the storefront. Live proof (real flips from public data),
// feature grid, and a 2-step get-started strip. No connect wall.

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  IconArrowRight,
  IconBarChart3,
  IconBookOpen,
  IconCoins,
  IconHammer,
  IconKeyRound,
  IconSparkles,
  IconTrendingUp,
  IconUser,
  IconSwords,
  IconSkull,
  IconSprout,
  IconBot,
  IconSearch,
  IconTarget,
} from "@/assets/icons";

import { Panel } from "@/components/layout/app-shell";
import { ItemIcon } from "@/components/ui/item-icon";
import {
  fetchBazaar,
  fetchElection,
  fetchFireSale,
  fetchFlipAccuracy,
  fetchNews,
} from "@/lib/hypixel.functions";
import { DEVELOPER_DASHBOARD_URL } from "@/lib/constants";
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
      {
        property: "og:description",
        content:
          "Live Hypixel SkyBlock profile stats, market flips with a published accuracy score, item wiki and net worth tracking.",
      },
      { property: "og:url", content: "https://skyforge-advisor.vercel.app/" },
      {
        property: "og:image",
        content: "https://skyforge-advisor.vercel.app/og-image.png",
      },
      {
        name: "twitter:title",
        content: "SkyForge — Live SkyBlock stats, flips & progression",
      },
      {
        name: "twitter:image",
        content: "https://skyforge-advisor.vercel.app/og-image.png",
      },
    ],
    links: [{ rel: "canonical", href: "https://skyforge-advisor.vercel.app/" }],
  }),
  component: Landing,
});

const FEATURES = [
  {
    to: "/advisor",
    icon: IconBot,
    title: "Autonomous Progression Advisor",
    body: "Real-time account audit across MP, Slayers, Dungeons, and Minions with 1-click in-game commands.",
    badge: "NEW",
  },
  {
    to: "/simulator",
    icon: IconSwords,
    title: "Damage & Gear Lab",
    body: "Live Hypixel damage formula sandbox, Catacombs scaling, mob defenses, and cost-to-DPS optimizer.",
    badge: "NEW",
  },
  {
    to: "/bosses",
    icon: IconSkull,
    title: "Boss Tactics & Kuudra Hub",
    body: "Voidgloom T1–T4 hitsphase/survival audit and Infernal Kuudra role qualifications with profit-per-key forecasts.",
    badge: "NEW",
  },
  {
    to: "/garden",
    icon: IconSprout,
    title: "Garden & Farming Engine",
    body: "Universal Farming Fortune breakdown, live coins/hr across 10 crops, and Jacob's Contest medal brackets.",
    badge: "NEW",
  },
  {
    to: "/flips",
    icon: IconTarget,
    title: "Live Flip Radar & Audio Sniper",
    body: "Synthesized Web Audio Minecraft chimes, margin filters, liquidity scores, and 1-click clipboard execution.",
    badge: "UPDATED",
  },
  {
    to: "/dashboard",
    icon: IconUser,
    title: "Profile Command Center",
    body: "Skills, dungeons, slayers, fairy souls, and inventory decoded live from Hypixel.",
  },
  {
    to: "/net-worth",
    icon: IconCoins,
    title: "Net Worth & Valuation",
    body: "Every container and accessory priced against live Bazaar and AH order books.",
  },
  {
    to: "/wiki",
    icon: IconBookOpen,
    title: "8,700+ Item Wiki",
    body: "Real stats, abilities, requirements and crafting grids from the NEU dataset, linked to live prices.",
  },
  {
    to: "/crafting",
    icon: IconHammer,
    title: "Crafting Cost Trees",
    body: "Full dependency trees priced to raw materials with the cheapest craft path highlighted.",
  },
];

function TargetIcon(props: { className?: string }) {
  return <IconTarget {...props} />;
}

function Landing() {
  const navigate = useNavigate();
  const [searchIgn, setSearchIgn] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchIgn.trim();
    if (trimmed) {
      void navigate({ to: `/profile/${encodeURIComponent(trimmed)}` });
    }
  };

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

  // Site-wide Hypixel context: mayor, news, fire sale (long-cached).
  const electionQuery = useQuery({
    queryKey: ["election"],
    queryFn: () => fetchElection(),
    staleTime: 30 * 60_000,
  });
  const newsQuery = useQuery({
    queryKey: ["sb-news"],
    queryFn: () => fetchNews(),
    staleTime: 60 * 60_000,
  });
  const fireSaleQuery = useQuery({
    queryKey: ["fire-sale"],
    queryFn: () => fetchFireSale(),
    staleTime: 30 * 60_000,
  });

  const mayor = electionQuery.data?.mayor;
  const news = (newsQuery.data ?? []).slice(0, 2);
  const fireSale = (fireSaleQuery.data ?? []).slice(0, 4);

  const topFlips = (bazaarQuery.data?.products ?? [])
    .slice()
    .sort((a, b) => b.profitPerHour - a.profitPerHour)
    .slice(0, 3);

  const accuracy = accuracyQuery.data;
  const hasAccuracy = accuracy && accuracy.resolved > 0;

  return (
    <div className="mx-auto max-w-7xl space-y-14 pb-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/75 px-6 py-16 text-center backdrop-blur-xl sm:px-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-32 size-52 rounded-full bg-emerald-500/10 blur-3xl sm:size-96"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-32 size-52 rounded-full bg-cyan-500/10 blur-3xl sm:size-96"
        />

        <p className="eyebrow">Free · No login · Open methodology</p>
        <h1 className="mx-auto mt-4 max-w-3xl break-words text-4xl font-black leading-tight tracking-tight sm:text-6xl">
          Live SkyBlock stats,{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            flips & progression
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Profile analytics, market flip suggestions with a published accuracy score, a full item
          wiki and crafting cost trees — powered by the official Hypixel API and the NEU dataset.
        </p>

        {/* 1-Click Search Input */}
        <form
          onSubmit={handleSearch}
          className="mx-auto mt-8 flex max-w-lg flex-wrap items-center justify-center gap-2"
        >
          <div className="relative flex-1 min-w-[240px]">
            <IconSearch
              aria-hidden="true"
              className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
            />
            <label htmlFor="hero-username" className="sr-only">
              Minecraft username
            </label>
            <input
              id="hero-username"
              value={searchIgn}
              onChange={(e) => setSearchIgn(e.target.value)}
              placeholder="Enter Minecraft username..."
              autoComplete="username"
              autoCapitalize="off"
              spellCheck={false}
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-base outline-none transition-all focus:border-primary focus:bg-white/[0.08] sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-2xl border border-primary/40 bg-primary/20 px-6 py-3.5 text-sm font-semibold text-primary transition-all duration-75 ease-out hover:scale-[1.02] hover:bg-primary/30 active:scale-95"
          >
            <IconSparkles className="size-4" /> Explore Profile
          </button>
        </form>

        {/* Quick picks */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <span>Popular profiles:</span>
          {["Deathstreeks", "Refraction", "Hellcastle", "56ms"].map((name) => (
            <Link
              key={name}
              to="/profile/$username"
              params={{ username: name }}
              className="rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-1 transition-colors hover:border-primary/30 hover:text-primary"
            >
              {name}
            </Link>
          ))}
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {[
            ["1", "Type Any Username", "Resolves instantly via Mojang — no key or sign in"],
            ["2", "Live Server Decoder", "Decodes inventory, skills, net worth, gear & pets"],
            [
              "3",
              "Actionable Guidance",
              "Autonomous advisor suggests your next highest-ROI upgrades",
            ],
          ].map(([step, title, body]) => (
            <div key={step} className="glass-soft rounded-2xl p-4 text-left">
              <p className="font-mono text-xs font-bold text-primary">STEP {step}</p>
              <p className="mt-1.5 text-sm font-semibold">{title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Hypixel context strip: mayor, fire sale, news */}
      {(mayor || fireSale.length > 0 || news.length > 0) && (
        <section className="grid gap-3 sm:grid-cols-3">
          {mayor && (
            <Panel className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Current mayor
              </p>
              <p className="font-pixel mt-1.5 text-xl font-semibold text-amber-300">
                {mayor.name ?? "—"}
              </p>
              {(mayor.perks ?? []).slice(0, 2).map((perk) => (
                <p key={perk.name} className="mt-1 text-[11px] text-muted-foreground">
                  <span className="font-semibold text-foreground/80">{perk.name}</span>
                  {perk.description ? ` — ${perk.description}` : ""}
                </p>
              ))}
            </Panel>
          )}

          {fireSale.length > 0 && (
            <Panel className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Fire sale
              </p>
              <div className="mt-2 space-y-2">
                {fireSale.map((sale) => (
                  <div key={sale.item_id} className="flex items-center gap-2">
                    <ItemIcon id={sale.item_id!} name={sale.item_id!} className="size-6" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium capitalize">
                        {sale.item_id!.replace(/_/g, " ").toLowerCase()}
                      </p>
                      {sale.end && (
                        <p className="font-mono text-[10px] text-muted-foreground">
                          ends {new Date(sale.end).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {news.length > 0 && (
            <Panel className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                SkyBlock news
              </p>
              <div className="mt-2 space-y-3">
                {news.map((item) => (
                  <div key={item.title}>
                    <p className="text-xs font-semibold">{item.title}</p>
                    {item.text && (
                      <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                        {item.text}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </section>
      )}

      {/* Live proof: real flips right now */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <IconTrendingUp className="size-5 text-primary" /> Live flips, right now
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Real Bazaar data — this is what the flip board looks like at this exact moment.
            </p>
          </div>
          <Link
            to="/flips"
            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            Open the flip board <IconArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {topFlips.map((p) => (
            <Link
              key={p.id}
              to="/flips"
              aria-label={`${p.name}: +${formatNumber(p.profitPerHour)} coins per hour. Open the flip board.`}
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
                role="status"
                aria-label="Loading live flip data"
                className="h-32 animate-pulse rounded-2xl border border-white/10 bg-black/20"
              />
            ))}
        </div>

        {hasAccuracy && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-5 py-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <TargetIcon className="size-4 text-emerald-300" />
              Our flip picks: {accuracy!.winRate?.toFixed(1)}% win rate over {accuracy!.resolved}{" "}
              scored suggestions
            </p>
            <Link
              to="/flips"
              className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-emerald-300 outline-none transition-colors hover:text-emerald-200 focus-visible:ring-2 focus-visible:ring-emerald-300"
            >
              See the full scorecard <IconArrowRight className="size-3.5" />
            </Link>
          </div>
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
              className="glass-soft group relative rounded-2xl p-5 transition-all duration-75 ease-out hover:scale-[1.02] hover:border-primary/40"
            >
              <div className="flex items-center justify-between">
                <feature.icon className="size-5 text-primary" />
                {feature.badge && (
                  <span className="rounded-md border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-300">
                    {feature.badge}
                  </span>
                )}
              </div>
              <p className="mt-3 font-semibold text-white">{feature.title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{feature.body}</p>
              <span className="mt-3 flex items-center gap-1 text-xs text-primary opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
                Open <IconArrowRight className="size-3" aria-hidden="true" />
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
            Your API key stays in this browser's session and is sent only to our server to call
            Hypixel. Unknown values are shown as "not available" — never invented. Flip results
            are published unedited.
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
