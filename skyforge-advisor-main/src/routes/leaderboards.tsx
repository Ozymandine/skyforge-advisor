// src/routes/leaderboards.tsx
// Genuine SkyBlock Global Leaderboards:
// Real-world rankings across Collections (Farming, Mining, Combat), Skills,
// Catacombs & Dungeons, Slayer Bosses, and Economy with live player lookup & percentile calculation.

import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Trophy,
  Crown,
  Medal,
  Sparkles,
  Search,
  ChevronRight,
  Target,
  User,
  Activity,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { usePlayer, useAccount } from "@/hooks/use-account";
import { PageHero, Panel, ProgressBar } from "@/components/layout/app-shell";
import { ItemIcon } from "@/components/ui/item-icon";
import { RankBadge } from "@/components/ui/rank-badge";
import { fetchPlayer } from "@/lib/hypixel.functions";
import { playClickSound } from "@/lib/sound-effects";
import {
  LEADERBOARD_GROUPS,
  LEADERBOARD_SUBCATEGORIES,
  calculatePlayerLeaderboardStandings,
  type LeaderboardCategoryGroup,
  type LeaderboardSubcategory,
} from "@/lib/leaderboards";
import { formatNumber } from "@/lib/skyblock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/leaderboards")({
  head: () => ({
    meta: [
      { title: "Global Leaderboards — SkyForge Advisor" },
      {
        name: "description",
        content:
          "Official global SkyBlock leaderboards: Top collections, Skill Averages, Catacombs 50, Slayer XP, and multi-billion coin Net Worth rankings.",
      },
      { property: "og:title", content: "Global Leaderboards — SkyForge Advisor" },
      {
        property: "og:description",
        content: "Official global SkyBlock leaderboards with live ranking and player percentile lookup.",
      },
    ],
  }),
  component: LeaderboardsRoute,
});

function LeaderboardsRoute() {
  const player = usePlayer();
  const account = useAccount();

  const [activeGroup, setActiveGroup] = useState<LeaderboardCategoryGroup>("farming_collections");
  const [selectedSubId, setSelectedSubId] = useState<string>("potato");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [liveSearchUser, setLiveSearchUser] = useState<string>("");

  // Filter subcategories by current group
  const groupSubcategories = useMemo(() => {
    return LEADERBOARD_SUBCATEGORIES.filter((s) => s.group === activeGroup);
  }, [activeGroup]);

  // Selected subcategory
  const activeSubcategory = useMemo<LeaderboardSubcategory>(() => {
    const found = LEADERBOARD_SUBCATEGORIES.find((s) => s.id === selectedSubId);
    if (found) return found;
    return groupSubcategories[0] ?? LEADERBOARD_SUBCATEGORIES[0]!;
  }, [selectedSubId, groupSubcategories]);

  // Live lookup query for searching arbitrary player rankings
  const liveLookupQuery = useQuery({
    queryKey: ["leaderboard-lookup", liveSearchUser.trim().toLowerCase()],
    queryFn: () => fetchPlayer({ data: { player: liveSearchUser.trim() } }),
    enabled: liveSearchUser.trim().length >= 3,
    staleTime: 60_000,
  });

  const inspectedPlayer = liveLookupQuery.data ?? player.data ?? null;

  // Calculate personal standings if player is connected or looked up
  const personalStandings = useMemo(() => {
    if (!inspectedPlayer) return null;
    return calculatePlayerLeaderboardStandings(inspectedPlayer);
  }, [inspectedPlayer]);

  const activeStanding = useMemo(() => {
    if (!personalStandings) return null;
    return personalStandings.find((s) => s.subcategoryId === activeSubcategory.id) ?? null;
  }, [personalStandings, activeSubcategory.id]);

  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) return activeSubcategory.topPlayers;
    const q = searchQuery.toLowerCase().trim();
    return activeSubcategory.topPlayers.filter(
      (p) =>
        p.username.toLowerCase().includes(q) ||
        (p.badge && p.badge.toLowerCase().includes(q)) ||
        (p.subValue && p.subValue.toLowerCase().includes(q))
    );
  }, [activeSubcategory, searchQuery]);

  const top1 = activeSubcategory.topPlayers[0];
  const top2 = activeSubcategory.topPlayers[1];
  const top3 = activeSubcategory.topPlayers[2];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHero
        eyebrow="Global Competition"
        title="SkyBlock Leaderboards"
        description="Real-world rankings across Collections, Skill Mastery, Catacombs, Slayers, and Economy."
      />

      {/* Group Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scroll-slim border-b border-white/10">
        {LEADERBOARD_GROUPS.map((group) => {
          const active = activeGroup === group.id;
          return (
            <button
              key={group.id}
              onClick={() => {
                playClickSound();
                setActiveGroup(group.id);
                const firstSub = LEADERBOARD_SUBCATEGORIES.find((s) => s.group === group.id);
                if (firstSub) setSelectedSubId(firstSub.id);
              }}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer will-change-transform",
                "hover:transition-none hover:-translate-y-0.5",
                active
                  ? "border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-lg shadow-emerald-500/10"
                  : "border border-white/5 bg-white/[0.03] text-white/70 hover:bg-white/[0.08] hover:text-white hover:border-white/15"
              )}
            >
              <ItemIcon id={group.icon} name={group.name} className="size-4 object-contain" />
              <span>{group.name}</span>
            </button>
          );
        })}
      </div>

      {/* Subcategory Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {groupSubcategories.map((sub) => {
          const active = activeSubcategory.id === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => {
                playClickSound();
                setSelectedSubId(sub.id);
              }}
              className={cn(
                "group relative flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-150 cursor-pointer will-change-transform",
                "hover:transition-none hover:-translate-y-0.5",
                active
                  ? "border border-amber-400/40 bg-amber-400/15 text-amber-300 shadow-md shadow-amber-500/10 font-bold"
                  : "border border-white/5 bg-white/[0.03] text-white/60 hover:bg-white/[0.08] hover:text-white"
              )}
            >
              <ItemIcon id={sub.iconId} name={sub.name} className="size-4 object-contain" />
              <span>{sub.name}</span>
            </button>
          );
        })}
      </div>

      {/* Live Player Standing & Real-Time Lookup Bar */}
      <Panel className="bg-gradient-to-r from-emerald-950/30 via-slate-950/60 to-black/70 border-emerald-500/30">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/20 text-emerald-400 shrink-0">
              <Target className="size-6" />
            </div>
            <div>
              <p className="eyebrow text-emerald-400">
                {inspectedPlayer ? `${inspectedPlayer.username}'s Standing` : "Personal Standing"}
              </p>
              {activeStanding ? (
                <>
                  <div className="mt-1 flex flex-wrap items-center gap-2.5">
                    <h3 className="text-lg font-black text-white">{activeStanding.percentileRank}</h3>
                    <span className="rounded-md border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 font-mono text-xs font-bold text-emerald-300">
                      Est. {activeStanding.approximateRank}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground font-mono">
                    Record: <strong className="text-white">{activeStanding.formattedPlayerValue}</strong> {activeSubcategory.unit}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">
                  Connect your profile or look up a player to view real-time standing on this leaderboard.
                </p>
              )}
            </div>
          </div>

          {/* Quick Player Lookup Search Box */}
          <div className="flex items-center gap-2 lg:w-96">
            <div className="relative flex-1">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={liveSearchUser}
                onChange={(e) => setLiveSearchUser(e.target.value)}
                placeholder="Look up player (e.g. Swavy, Refraction)..."
                className="w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-3 py-2 text-xs text-white placeholder:text-muted-foreground outline-none focus:border-emerald-400/50 transition-colors"
              />
            </div>
            {liveLookupQuery.isFetching && (
              <span className="text-[10px] font-mono text-emerald-400 animate-pulse">Loading...</span>
            )}
          </div>
        </div>
      </Panel>

      {/* Podium Top 3 View */}
      <div className="grid gap-4 md:grid-cols-3 pt-2">
        {/* 2nd Place (Silver) */}
        {top2 && (
          <div className="order-2 md:order-1 flex flex-col justify-between rounded-3xl border border-slate-400/30 bg-gradient-to-b from-slate-800/40 via-slate-950/60 to-black/80 p-5 shadow-xl transition-all duration-150 hover:transition-none hover:-translate-y-1 hover:border-slate-300/50 will-change-transform">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 rounded-full border border-slate-400/40 bg-slate-400/10 px-3 py-1 font-mono text-xs font-black text-slate-200">
                <Medal className="size-3.5" /> #2 Silver
              </div>
              <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] font-bold text-white/70">
                RANK #2
              </span>
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
              <Crown className="size-4 fill-black" /> #1 RANK
            </div>

            <div className="mt-2 flex items-start justify-between">
              <span className="rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-300">
                LEADER
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
              <span>View Leader Profile</span>
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
              <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] font-bold text-white/70">
                RANK #3
              </span>
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

      {/* Ranked Players Roster Table */}
      <Panel>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Trophy className="size-5 text-amber-400" />
              {activeSubcategory.name} Global Rankings
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{activeSubcategory.description}</p>
          </div>

          <div className="relative sm:w-64">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter leaderboard table..."
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
