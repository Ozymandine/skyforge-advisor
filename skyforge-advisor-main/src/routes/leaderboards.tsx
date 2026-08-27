// src/routes/leaderboards.tsx
// Global SkyBlock Leaderboards & Hall of Fame:
// Curated rankings across Collections, Skills, Dungeons, Slayers, and Economy,
// featuring the legendary Potato War Hall of Fame honoring Technoblade, with live personal player standing.

import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Trophy,
  Crown,
  Medal,
  Sparkles,
  Search,
  ChevronRight,
  TrendingUp,
  User,
  ShieldCheck,
  Target,
  Award,
} from "lucide-react";
import { usePlayer, useAccount } from "@/hooks/use-account";
import { PageHero, Panel, ProgressBar } from "@/components/layout/app-shell";
import { ItemIcon } from "@/components/ui/item-icon";
import { RankBadge } from "@/components/ui/rank-badge";
import { playClickSound } from "@/lib/sound-effects";
import {
  LEADERBOARD_SUBCATEGORIES,
  calculatePlayerLeaderboardStandings,
  type LeaderboardCategory,
  type LeaderboardSubcategory,
} from "@/lib/leaderboards";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/leaderboards")({
  head: () => ({
    meta: [
      { title: "Global Leaderboards & Hall of Fame — SkyForge Advisor" },
      {
        name: "description",
        content:
          "Global SkyBlock leaderboards: Potato War Hall of Fame honoring Technoblade, top Skill Averages, Catacombs 50, Slayer XP, and multi-billion coin Net Worth rankings.",
      },
      { property: "og:title", content: "Global Leaderboards & Hall of Fame — SkyForge Advisor" },
      {
        property: "og:description",
        content:
          "Official global SkyBlock leaderboards and legendary Hall of Fame champions.",
      },
    ],
  }),
  component: LeaderboardsRoute,
});

function LeaderboardsRoute() {
  const player = usePlayer();
  const account = useAccount();

  const [selectedSubId, setSelectedSubId] = useState<string>("potato");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const activeSubcategory = useMemo<LeaderboardSubcategory>(() => {
    return (
      LEADERBOARD_SUBCATEGORIES.find((s) => s.id === selectedSubId) ??
      LEADERBOARD_SUBCATEGORIES[0]!
    );
  }, [selectedSubId]);

  // Calculate personal standings if player is connected
  const personalStandings = useMemo(() => {
    if (!player.data) return null;
    return calculatePlayerLeaderboardStandings(player.data);
  }, [player.data]);

  const activeStanding = useMemo(() => {
    if (!personalStandings) return null;
    return personalStandings.find((s) => s.subcategoryId === selectedSubId) ?? null;
  }, [personalStandings, selectedSubId]);

  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) return activeSubcategory.topPlayers;
    const q = searchQuery.toLowerCase().trim();
    return activeSubcategory.topPlayers.filter(
      (p) =>
        p.username.toLowerCase().includes(q) ||
        (p.tag && p.tag.toLowerCase().includes(q)) ||
        (p.subValue && p.subValue.toLowerCase().includes(q))
    );
  }, [activeSubcategory, searchQuery]);

  const top1 = activeSubcategory.topPlayers[0];
  const top2 = activeSubcategory.topPlayers[1];
  const top3 = activeSubcategory.topPlayers[2];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHero
        eyebrow="Global Hall of Fame"
        title="SkyBlock Leaderboards"
        description="Official global rankings & legendary records across Collections, Skills, Catacombs, Slayers, and Net Worth."
      />

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
        {LEADERBOARD_SUBCATEGORIES.map((sub) => {
          const active = selectedSubId === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => {
                playClickSound();
                setSelectedSubId(sub.id);
              }}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-150 cursor-pointer will-change-transform",
                "hover:transition-none hover:-translate-y-0.5",
                active
                  ? "border border-amber-400/40 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent text-amber-300 shadow-lg shadow-amber-500/10"
                  : "border border-white/5 bg-white/[0.03] text-white/70 hover:bg-white/[0.08] hover:text-white hover:border-white/15"
              )}
            >
              <ItemIcon id={sub.iconId} name={sub.name} className="size-5 object-contain" />
              <span>{sub.name}</span>
            </button>
          );
        })}
      </div>

      {/* Personal Standing Card (When connected) */}
      {activeStanding && (
        <Panel className="bg-gradient-to-r from-emerald-950/40 via-slate-950/70 to-black/60 border-emerald-500/30">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/20 text-emerald-400">
                <Target className="size-6" />
              </div>
              <div>
                <p className="eyebrow text-emerald-400">Your Global Standing</p>
                <div className="mt-1 flex flex-wrap items-center gap-2.5">
                  <h3 className="text-lg font-black text-white">{activeStanding.percentileRank}</h3>
                  <span className="rounded-md border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 font-mono text-xs font-bold text-emerald-300">
                    Est. {activeStanding.approximateRank}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground font-mono">
                  Your Record: <strong className="text-white">{activeStanding.formattedPlayerValue}</strong> {activeSubcategory.unit}
                </p>
              </div>
            </div>

            {activeStanding.nextTierGoal && (
              <div className="rounded-2xl border border-white/10 bg-black/40 p-3.5 md:w-80">
                <div className="flex items-center justify-between text-xs font-semibold text-white/80">
                  <span>Next: {activeStanding.nextTierGoal.tierName}</span>
                  <span className="font-mono text-emerald-400">
                    +{activeStanding.nextTierGoal.formattedAmountNeeded} {activeSubcategory.unit}
                  </span>
                </div>
                <div className="mt-2">
                  <ProgressBar pct={Math.min(100, Math.max(10, 100 - activeStanding.percentilePct * 2))} />
                </div>
              </div>
            )}
          </div>
        </Panel>
      )}

      {/* Podium Display (Top 3) */}
      <div className="grid gap-4 md:grid-cols-3 pt-2">
        {/* 2nd Place (Silver) */}
        {top2 && (
          <div className="order-2 md:order-1 flex flex-col justify-between rounded-3xl border border-slate-400/30 bg-gradient-to-b from-slate-800/40 via-slate-950/60 to-black/80 p-5 shadow-xl transition-all duration-150 hover:transition-none hover:-translate-y-1 hover:border-slate-300/50 will-change-transform">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 rounded-full border border-slate-400/40 bg-slate-400/10 px-3 py-1 font-mono text-xs font-black text-slate-200">
                <Medal className="size-3.5" /> #2 Silver
              </div>
              {top2.tag && (
                <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] font-bold text-white/70">
                  {top2.tag}
                </span>
              )}
            </div>

            <div className="my-6 flex flex-col items-center text-center">
              <div className="relative size-20 overflow-hidden rounded-2xl border-2 border-slate-400/40 bg-black/40 shadow-inner">
                <img
                  src={`https://visage.surgeplay.com/bust/256/${top2.uuid}`}
                  alt={top2.username}
                  className="size-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                <RankBadge rankData={{ rank: top2.hypixelRank }} size="sm" />
                <h4 className="text-base font-black text-white">{top2.username}</h4>
              </div>
              <p className="mt-1 font-mono text-lg font-black text-slate-200">
                {top2.formattedValue} <span className="text-xs font-normal text-muted-foreground">{activeSubcategory.unit}</span>
              </p>
              {top2.subValue && (
                <p className="mt-1 text-xs text-muted-foreground">{top2.subValue}</p>
              )}
            </div>

            <Link
              to="/profile/$username"
              params={{ username: top2.username }}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] py-2 text-xs font-bold text-white transition-all hover:bg-white/[0.1] hover:border-white/20"
            >
              <span>View Profile</span>
              <ChevronRight className="size-3.5 text-muted-foreground" />
            </Link>
          </div>
        )}

        {/* 1st Place (Gold Champion 👑) */}
        {top1 && (
          <div className="order-1 md:order-2 relative flex flex-col justify-between rounded-3xl border-2 border-amber-400/60 bg-gradient-to-b from-amber-500/20 via-slate-950/80 to-black/90 p-6 shadow-2xl shadow-amber-500/10 transition-all duration-150 hover:transition-none hover:-translate-y-1.5 hover:border-amber-300 will-change-transform">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full border border-amber-400/60 bg-amber-400 px-3.5 py-1 font-mono text-xs font-black text-black shadow-lg">
              <Crown className="size-4 fill-black" /> #1 CHAMPION
            </div>

            <div className="mt-2 flex items-start justify-between">
              <span className="rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-300">
                {top1.tag ?? "HALL OF FAME"}
              </span>
              <Sparkles className="size-4 text-amber-400 animate-pulse" />
            </div>

            <div className="my-6 flex flex-col items-center text-center">
              <div className="relative size-24 overflow-hidden rounded-2xl border-2 border-amber-400/60 bg-black/50 shadow-xl">
                <img
                  src={`https://visage.surgeplay.com/bust/256/${top1.uuid}`}
                  alt={top1.username}
                  className="size-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                <RankBadge rankData={{ rank: top1.hypixelRank }} size="sm" />
                <h4 className="text-lg font-black text-amber-300">{top1.username}</h4>
              </div>
              <p className="mt-1 font-mono text-2xl font-black text-white">
                {top1.formattedValue} <span className="text-xs font-normal text-muted-foreground">{activeSubcategory.unit}</span>
              </p>
              {top1.subValue && (
                <p className="mt-1 text-xs font-semibold text-amber-200/80">{top1.subValue}</p>
              )}
            </div>

            <Link
              to="/profile/$username"
              params={{ username: top1.username }}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-400/20 py-2.5 text-xs font-bold text-amber-300 transition-all hover:bg-amber-400/30 shadow-lg shadow-amber-500/10"
            >
              <span>View Champion Profile</span>
              <ChevronRight className="size-3.5 text-amber-300" />
            </Link>
          </div>
        )}

        {/* 3rd Place (Bronze) */}
        {top3 && (
          <div className="order-3 flex flex-col justify-between rounded-3xl border border-amber-700/30 bg-gradient-to-b from-amber-950/30 via-slate-950/60 to-black/80 p-5 shadow-xl transition-all duration-150 hover:transition-none hover:-translate-y-1 hover:border-amber-600/50 will-change-transform">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 rounded-full border border-amber-700/40 bg-amber-700/10 px-3 py-1 font-mono text-xs font-black text-amber-500">
                <Medal className="size-3.5" /> #3 Bronze
              </div>
              {top3.tag && (
                <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] font-bold text-white/70">
                  {top3.tag}
                </span>
              )}
            </div>

            <div className="my-6 flex flex-col items-center text-center">
              <div className="relative size-20 overflow-hidden rounded-2xl border-2 border-amber-700/40 bg-black/40 shadow-inner">
                <img
                  src={`https://visage.surgeplay.com/bust/256/${top3.uuid}`}
                  alt={top3.username}
                  className="size-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                <RankBadge rankData={{ rank: top3.hypixelRank }} size="sm" />
                <h4 className="text-base font-black text-white">{top3.username}</h4>
              </div>
              <p className="mt-1 font-mono text-lg font-black text-amber-500">
                {top3.formattedValue} <span className="text-xs font-normal text-muted-foreground">{activeSubcategory.unit}</span>
              </p>
              {top3.subValue && (
                <p className="mt-1 text-xs text-muted-foreground">{top3.subValue}</p>
              )}
            </div>

            <Link
              to="/profile/$username"
              params={{ username: top3.username }}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] py-2 text-xs font-bold text-white transition-all hover:bg-white/[0.1] hover:border-white/20"
            >
              <span>View Profile</span>
              <ChevronRight className="size-3.5 text-muted-foreground" />
            </Link>
          </div>
        )}
      </div>

      {/* Top 100 Roster List & Filter */}
      <Panel>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Trophy className="size-5 text-amber-400" />
              {activeSubcategory.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{activeSubcategory.description}</p>
          </div>

          <div className="relative sm:w-64">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ranked player..."
              className="w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-3 py-2 text-xs text-white placeholder:text-muted-foreground outline-none focus:border-amber-400/50 transition-colors"
            />
          </div>
        </div>

        <div className="mt-4 divide-y divide-white/5">
          {filteredPlayers.map((player) => (
            <div
              key={player.username}
              className="flex items-center justify-between py-3.5 px-3 rounded-xl transition-all duration-150 hover:transition-none hover:bg-white/[0.04] hover:translate-x-1 will-change-transform"
            >
              <div className="flex items-center gap-4 min-w-0">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-lg font-mono text-xs font-black",
                    player.rank === 1
                      ? "border border-amber-400/40 bg-amber-400/20 text-amber-300"
                      : player.rank === 2
                      ? "border border-slate-300/40 bg-slate-300/20 text-slate-200"
                      : player.rank === 3
                      ? "border border-amber-700/40 bg-amber-700/20 text-amber-500"
                      : "text-muted-foreground"
                  )}
                >
                  #{player.rank}
                </span>

                <div className="relative size-8 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black/40">
                  <img
                    src={`https://visage.surgeplay.com/bust/128/${player.uuid}`}
                    alt={player.username}
                    className="size-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <RankBadge rankData={{ rank: player.hypixelRank }} size="sm" />
                    <span className="font-bold text-sm text-white truncate">{player.username}</span>
                    {player.isHallOfFame && (
                      <span className="rounded bg-amber-400/15 border border-amber-400/30 px-1.5 py-0.2 font-mono text-[9px] font-black text-amber-300">
                        HOF
                      </span>
                    )}
                  </div>
                  {player.subValue && (
                    <p className="text-[11px] text-muted-foreground truncate">{player.subValue}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-mono text-sm font-black text-white">
                    {player.formattedValue}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {activeSubcategory.unit}
                  </p>
                </div>

                <Link
                  to="/profile/$username"
                  params={{ username: player.username }}
                  className="rounded-lg border border-white/10 bg-white/5 p-2 text-muted-foreground hover:bg-white/10 hover:text-white transition-colors"
                >
                  <ChevronRight className="size-4" />
                </Link>
              </div>
            </div>
          ))}

          {filteredPlayers.length === 0 && (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No players found matching "{searchQuery}".
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
