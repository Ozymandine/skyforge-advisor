// src/routes/leaderboards.tsx
// Real-Time Elite SkyBlock Leaderboards:
// 100% genuine Top 100 data queried directly from https://api.eliteskyblock.com/leaderboard/{id}?limit=100
// Real player face icons, gold/bronze/silver outlines, bottom-pinned profile ranking, and live player search.

import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  IconTrophy,
  IconSearch,
  IconChevronRight,
  IconTarget,
  IconRefreshCw,
  IconPin,
  IconExternalLink,
  IconUserCheck,
} from "@/assets/icons";
import { usePlayer, useAccount } from "@/hooks/use-account";
import { PageHero, Panel } from "@/components/layout/app-shell";
import { ItemIcon } from "@/components/ui/item-icon";
import { fetchPlayer } from "@/lib/hypixel.functions";
import { playClickSound } from "@/lib/sound-effects";
import {
  LEADERBOARD_GROUPS,
  LEADERBOARD_SUBCATEGORIES,
  calculatePlayerLeaderboardStandings,
  fetchEliteLeaderboard,
  type LeaderboardCategoryGroup,
  type LeaderboardSubcategory,
  type EliteLeaderboardEntry,
} from "@/lib/leaderboards";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/leaderboards")({
  head: () => ({
    meta: [
      { title: "Global Leaderboards — SkyForge Advisor" },
      {
        name: "description",
        content:
          "Live real-time Top 100 SkyBlock leaderboards powered by Elite SkyBlock: exact figures, real player face icons, rankings, and personal standing.",
      },
      { property: "og:title", content: "Global Leaderboards — SkyForge Advisor" },
      {
        property: "og:description",
        content:
          "Live global Top 100 SkyBlock leaderboards with exact numbers and real player rankings.",
      },
    ],
  }),
  component: LeaderboardsRoute,
});

function LeaderboardsRoute() {
  const player = usePlayer();
  const account = useAccount();

  const [activeGroup, setActiveGroup] = useState<LeaderboardCategoryGroup>("mining");
  const [selectedSubId, setSelectedSubId] = useState<string>("diamond");
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchedUsername, setSearchedUsername] = useState<string>("");

  // Filter subcategories by current group
  const groupSubcategories = useMemo(() => {
    return LEADERBOARD_SUBCATEGORIES.filter((s) => s.group === activeGroup);
  }, [activeGroup]);

  // Selected subcategory
  const activeSubcategory = useMemo<LeaderboardSubcategory>(() => {
    const found = LEADERBOARD_SUBCATEGORIES.find((s) => s.id === selectedSubId);
    if (found && found.group === activeGroup) return found;
    return groupSubcategories[0] ?? LEADERBOARD_SUBCATEGORIES[0]!;
  }, [selectedSubId, activeGroup, groupSubcategories]);

  // Live query to fetch actual real-time Elite SkyBlock leaderboard (Top 100)
  const eliteLeaderboardQuery = useQuery({
    queryKey: ["elite-leaderboard-top100", activeSubcategory.eliteId],
    queryFn: () => fetchEliteLeaderboard(activeSubcategory.eliteId),
    staleTime: 60_000,
  });

  const rawEntries: EliteLeaderboardEntry[] = useMemo(() => {
    const list = eliteLeaderboardQuery.data?.entries ?? [];
    return list.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
  }, [eliteLeaderboardQuery.data]);

  // Live query for dynamically searching an arbitrary player's position
  const searchedPlayerQuery = useQuery({
    queryKey: ["leaderboard-search-player", searchedUsername.toLowerCase(), account.apiKey],
    queryFn: () =>
      fetchPlayer({
        data: {
          username: searchedUsername.trim(),
          apiKey: account.apiKey || undefined,
        },
      }),
    enabled: searchedUsername.trim().length >= 2,
    staleTime: 60_000,
  });

  // Inspected player: either searched player or connected player
  const inspectedPlayer =
    searchedUsername.trim() && searchedPlayerQuery.data
      ? searchedPlayerQuery.data
      : (player.data ?? null);

  // Calculate top 1 & top 100 benchmarks for accurate formula
  const top100Map = useMemo(() => {
    if (rawEntries.length === 0) return undefined;
    const top1 = rawEntries[0]?.amount ?? 1_000_000_000;
    const top100 = rawEntries[rawEntries.length - 1]?.amount ?? 50_000_000;
    return { [activeSubcategory.id]: { top1, top100 } };
  }, [rawEntries, activeSubcategory.id]);

  // Calculate personal standings if player is connected or looked up
  const personalStandings = useMemo(() => {
    if (!inspectedPlayer) return null;
    return calculatePlayerLeaderboardStandings(inspectedPlayer, top100Map);
  }, [inspectedPlayer, top100Map]);

  const activeStanding = useMemo(() => {
    if (!personalStandings) return null;
    return personalStandings.find((s) => s.subcategoryId === activeSubcategory.id) ?? null;
  }, [personalStandings, activeSubcategory.id]);

  // Check if inspected player is in top 100 list
  const inspectedTopRank = useMemo(() => {
    if (!inspectedPlayer) return null;
    const found = rawEntries.find(
      (e) => e.ign.toLowerCase() === inspectedPlayer.username.toLowerCase(),
    );
    return found?.rank ?? null;
  }, [inspectedPlayer, rawEntries]);

  // Filtered leaderboard players by search term
  const filteredPlayers = useMemo(() => {
    if (!searchInput.trim()) return rawEntries;
    const q = searchInput.toLowerCase().trim();
    return rawEntries.filter(
      (p) => p.ign.toLowerCase().includes(q) || (p.profile && p.profile.toLowerCase().includes(q)),
    );
  }, [rawEntries, searchInput]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim().length >= 2) {
      playClickSound();
      setSearchedUsername(searchInput.trim());
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHero
        eyebrow="Global Competition"
        title="SkyBlock Leaderboards"
        description="Real-time Top 100 rankings and exact numbers powered by Elite SkyBlock across all Collections, Skills, Dungeons, Slayers, and Economy."
      />

      {/* Group Navigation Tabs */}
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
                  : "border border-white/5 bg-white/[0.03] text-white/70 hover:bg-white/[0.08] hover:text-white hover:border-white/15",
              )}
            >
              <ItemIcon id={group.icon} name={group.name} className="size-4 object-contain" />
              <span>{group.name}</span>
            </button>
          );
        })}
      </div>

      {/* Subcategory Collection Pills */}
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
                  : "border border-white/5 bg-white/[0.03] text-white/60 hover:bg-white/[0.08] hover:text-white",
              )}
            >
              <ItemIcon id={sub.iconId} name={sub.name} className="size-4 object-contain" />
              <span>{sub.name}</span>
            </button>
          );
        })}
      </div>

      {/* Clean Player Standing Banner (No search clutter) */}
      <Panel className="bg-gradient-to-r from-emerald-950/30 via-slate-950/60 to-black/70 border-emerald-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center">
              {inspectedPlayer ? (
                <img
                  src={`https://visage.surgeplay.com/bust/128/${inspectedPlayer.uuid}`}
                  alt={inspectedPlayer.username}
                  className="size-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <IconTarget className="size-6 text-emerald-400" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <p className="eyebrow text-emerald-400">
                  {inspectedPlayer ? `${inspectedPlayer.username}'s Standing` : "Personal Standing"}
                </p>
                {searchedUsername && (
                  <button
                    onClick={() => {
                      setSearchedUsername("");
                      setSearchInput("");
                    }}
                    className="text-[10px] text-muted-foreground hover:text-white underline cursor-pointer"
                  >
                    (Reset to Connected Profile)
                  </button>
                )}
              </div>

              {activeStanding ? (
                <>
                  <div className="mt-1 flex flex-wrap items-center gap-2.5">
                    <h3 className="text-xl font-black text-white">
                      {inspectedTopRank
                        ? `Rank #${inspectedTopRank} (Top 100)`
                        : `Rank ${activeStanding.approximateRank}`}
                    </h3>
                    <span className="rounded-md border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 font-mono text-xs font-bold text-emerald-300">
                      {activeStanding.percentileRank}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground font-mono">
                    Exact Record:{" "}
                    <strong className="text-white">{activeStanding.formattedPlayerValue}</strong>{" "}
                    {activeSubcategory.unit}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">
                  Connect your profile or search a player using the search bar below to view exact
                  standings.
                </p>
              )}
            </div>
          </div>

          {inspectedPlayer && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs font-semibold text-white/70">
                {activeSubcategory.name}
              </span>
            </div>
          )}
        </div>
      </Panel>

      {/* Loading state indicator */}
      {eliteLeaderboardQuery.isLoading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground text-sm gap-2">
          <IconRefreshCw className="size-4 animate-spin text-emerald-400" />
          <span>Fetching Top 100 leaderboard from Elite SkyBlock...</span>
        </div>
      )}

      {/* Top 100 Ranked Players Table */}
      {!eliteLeaderboardQuery.isLoading && (
        <Panel>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <IconTrophy className="size-5 text-amber-400" />
                {eliteLeaderboardQuery.data?.title || activeSubcategory.name} Top 100
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Top 100 World Records from Elite SkyBlock. {activeSubcategory.description}
              </p>
            </div>

            {/* Search Player Input */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 sm:w-80">
              <div className="relative flex-1">
                <IconSearch className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search player or filter table..."
                  className="w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-3 py-2 text-xs text-white placeholder:text-muted-foreground outline-none focus:border-amber-400/50 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl border border-amber-400/30 bg-amber-400/15 px-3 py-2 text-xs font-bold text-amber-300 hover:bg-amber-400/25 transition-colors cursor-pointer"
              >
                Search
              </button>
            </form>
          </div>

          <div className="mt-4 space-y-1.5">
            {filteredPlayers.map((p) => {
              const isCurrentPlayer =
                inspectedPlayer && p.ign.toLowerCase() === inspectedPlayer.username.toLowerCase();

              // Outlines: 1st = Gold, 2nd = Bronze, 3rd = Silver, rest = normal
              const outlineClass =
                p.rank === 1
                  ? "border-2 border-amber-400 bg-amber-400/10 shadow-md shadow-amber-500/15 text-amber-300"
                  : p.rank === 2
                    ? "border-2 border-amber-700/80 bg-amber-950/20 text-amber-500 shadow-sm"
                    : p.rank === 3
                      ? "border-2 border-slate-300/80 bg-slate-400/15 text-slate-200 shadow-sm"
                      : isCurrentPlayer
                        ? "border border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                        : "border border-white/5 bg-transparent hover:bg-white/[0.04]";

              const badgeClass =
                p.rank === 1
                  ? "border border-amber-400/60 bg-amber-400/20 text-amber-300 font-black"
                  : p.rank === 2
                    ? "border border-amber-700/60 bg-amber-700/20 text-amber-500 font-black"
                    : p.rank === 3
                      ? "border border-slate-300/60 bg-slate-300/20 text-slate-200 font-black"
                      : "text-muted-foreground font-bold";

              return (
                <div
                  key={`${p.ign}-${p.rank}`}
                  className={cn(
                    "flex items-center justify-between py-2.5 px-3.5 rounded-xl transition-all duration-150 will-change-transform",
                    "hover:transition-none hover:translate-x-1",
                    outlineClass,
                  )}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span
                      className={cn(
                        "flex size-7 items-center justify-center rounded-lg font-mono text-xs shrink-0",
                        badgeClass,
                      )}
                    >
                      #{p.rank}
                    </span>

                    {/* Face Icon */}
                    <div className="relative size-7 shrink-0 overflow-hidden rounded-md border border-white/10 bg-black/40">
                      <img
                        src={`https://visage.surgeplay.com/face/64/${p.uuid}`}
                        alt={p.ign}
                        className="size-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>

                    <div className="min-w-0 flex items-center gap-2">
                      <span className="font-bold text-sm text-white truncate">
                        {p.ign} {isCurrentPlayer && "(You)"}
                      </span>
                      {p.profile && (
                        <span className="rounded bg-white/5 border border-white/10 px-1.5 py-0.2 font-mono text-[9px] font-semibold text-muted-foreground capitalize">
                          {p.profile}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-mono text-sm font-black text-white">
                        {Math.round(p.amount).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {activeSubcategory.unit}
                      </p>
                    </div>

                    <Link
                      to="/profile/$username"
                      params={{ username: p.ign }}
                      className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-muted-foreground hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <IconChevronRight className="size-4" />
                    </Link>
                  </div>
                </div>
              );
            })}

            {filteredPlayers.length === 0 && (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No players in the Top 100 match "{searchInput}". Loading player rank at the
                bottom...
              </div>
            )}

            {/* DISPLAY AT THE BOTTOM: Selected/Searched Profile (If not in Top 100) */}
            {inspectedPlayer && activeStanding && inspectedTopRank === null && (
              <div className="mt-4 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between py-3.5 px-4 rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-r from-emerald-950/50 via-emerald-900/20 to-black/70 shadow-lg shadow-emerald-500/10">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/20 px-2.5 py-1 font-mono text-xs font-black text-emerald-300">
                      <IconPin className="size-3" />
                      <span>{activeStanding.approximateRank}</span>
                    </div>

                    {/* Face Icon */}
                    <div className="relative size-8 shrink-0 overflow-hidden rounded-lg border border-emerald-500/40 bg-black/40">
                      <img
                        src={`https://visage.surgeplay.com/face/64/${inspectedPlayer.uuid}`}
                        alt={inspectedPlayer.username}
                        className="size-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-black text-sm text-emerald-300 truncate">
                          {inspectedPlayer.username} ({searchedUsername ? "Searched Player" : "You"}
                          )
                        </span>
                        <span className="rounded bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.2 font-mono text-[9px] font-bold text-emerald-300">
                          {activeStanding.percentileRank}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Estimated profile ranking position
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-mono text-sm font-black text-white">
                        {activeStanding.formattedPlayerValue}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {activeSubcategory.unit}
                      </p>
                    </div>

                    <Link
                      to="/profile/$username"
                      params={{ username: inspectedPlayer.username }}
                      className="rounded-lg border border-emerald-500/30 bg-emerald-500/20 p-2 text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                    >
                      <IconChevronRight className="size-4" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Panel>
      )}
    </div>
  );
}
