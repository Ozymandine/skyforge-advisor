// src/routes/compare.tsx
// Side-by-side profile comparison with mirrored stat bars, Senither-style
// weight breakdown and a local leaderboard of everyone you've compared.

import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Crown, Swords, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PageHero, Panel, ProgressBar, StatRow } from "@/components/layout/app-shell";
import { ErrorState, LoadState } from "@/components/data-states";
import { useAccount } from "@/hooks/use-account";
import { fetchPlayer } from "@/lib/hypixel.functions";
import { computeWeight, type WeightBreakdown } from "@/lib/weight";
import { formatNumber, formatFull, type PlayerData } from "@/lib/skyblock";
import { RankBadge } from "@/components/ui/rank-badge";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare — SkyBlock Assistant" },
      {
        name: "description",
        content: "Compare two SkyBlock profiles side by side with weight scores.",
      },
      { property: "og:title", content: "Compare — SkyBlock Assistant" },
      {
        property: "og:description",
        content: "Head-to-head profile comparison with weight leaderboards.",
      },
    ],
  }),
  component: ComparePage,
});

const LEADERBOARD_KEY = "skyforge-weight-leaderboard";

type LeaderEntry = { username: string; weight: number };

function readLeaderboard(): LeaderEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function recordLeaderboard(player: PlayerData, weight: number) {
  const entries = readLeaderboard().filter((e) => e.username !== player.username);
  entries.push({ username: player.username, weight });
  entries.sort((a, b) => b.weight - a.weight);
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries.slice(0, 25)));
  } catch {
    /* ignore */
  }
}

function ComparePage() {
  const account = useAccount();
  const [nameA, setNameA] = useState("");
  const [nameB, setNameB] = useState("");
  const [submitted, setSubmitted] = useState<{ a: string; b: string } | null>(null);

  useEffect(() => {
    if (account.username && !nameA && !submitted) setNameA(account.username);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account.username]);

  const queryA = useQuery({
    queryKey: ["player-compare-a", submitted?.a],
    enabled: !!submitted && account.connected,
    staleTime: 60_000,
    retry: false,
    queryFn: () => fetchPlayer({ data: { apiKey: account.apiKey, username: submitted!.a } }),
  });
  const queryB = useQuery({
    queryKey: ["player-compare-b", submitted?.b],
    enabled: !!submitted && account.connected,
    staleTime: 60_000,
    retry: false,
    queryFn: () => fetchPlayer({ data: { apiKey: account.apiKey, username: submitted!.b } }),
  });

  // The wire type adds `| undefined` to optional props (exactOptionalPropertyTypes);
  // the runtime payload always matches PlayerData, so cast once here.
  const dataA = (queryA.data ?? null) as PlayerData | null;
  const dataB = (queryB.data ?? null) as PlayerData | null;

  useEffect(() => {
    if (dataA) recordLeaderboard(dataA, computeWeight(dataA).total);
    if (dataB) recordLeaderboard(dataB, computeWeight(dataB).total);
  }, [dataA, dataB]);

  const leaderboard = useMemo(() => readLeaderboard(), [dataA, dataB]);

  const compare = () => {
    if (!nameA.trim() || !nameB.trim()) return;
    setSubmitted({ a: nameA.trim(), b: nameB.trim() });
  };

  const loading = (!!submitted && (queryA.isLoading || queryB.isLoading)) || !account.hydrated;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHero
        eyebrow="Tools"
        title="Profile Comparison"
        description="Head-to-head stats with mirrored bars, weight scoring and your local leaderboard."
      />

      {!account.connected && (
        <Panel>
          <p className="text-sm text-muted-foreground">
            Connect an API key in{" "}
            <a href="/settings" className="text-primary hover:underline">
              Settings
            </a>{" "}
            to compare profiles.
          </p>
        </Panel>
      )}

      {account.connected && (
        <>
          <Panel>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
              <label className="text-xs text-muted-foreground">
                Player A
                <input
                  value={nameA}
                  onChange={(e) => setNameA(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && compare()}
                  placeholder="Username"
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary/60"
                />
              </label>
              <button
                onClick={compare}
                disabled={!nameA.trim() || !nameB.trim()}
                className="flex items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/15 px-6 py-2.5 text-sm font-medium text-primary transition-all duration-75 ease-out hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Swords className="size-4" /> Compare
              </button>
              <label className="text-xs text-muted-foreground">
                Player B
                <input
                  value={nameB}
                  onChange={(e) => setNameB(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && compare()}
                  placeholder="Username"
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary/60"
                />
              </label>
            </div>
          </Panel>

          {loading && <LoadState>Loading both profiles…</LoadState>}
          {(queryA.error || queryB.error) && (
            <ErrorState error={(queryA.error ?? queryB.error) as Error} />
          )}

          {dataA && dataB && (
            <>
              <WinnerBanner a={dataA} b={dataB} />
              <StatRow
                stats={[
                  {
                    label: `${dataA.username} · skill avg`,
                    value: dataA.skillAverage.toFixed(1),
                    sub: `vs ${dataB.skillAverage.toFixed(1)}`,
                  },
                  {
                    label: "Skill XP gap",
                    value: formatNumber(Math.abs(dataA.totalSkillXp - dataB.totalSkillXp)),
                    sub: `${dataA.totalSkillXp > dataB.totalSkillXp ? dataA.username : dataB.username} ahead`,
                  },
                  {
                    label: "Fairy souls",
                    value: `${dataA.fairySouls} / ${dataB.fairySouls}`,
                    sub: "A / B",
                  },
                  {
                    label: "Pets found",
                    value: `${dataA.pets?.length ?? 0} / ${dataB.pets?.length ?? 0}`,
                    sub: "A / B",
                  },
                ]}
              />
              <MirroredSkills a={dataA} b={dataB} />
              <WeightPanels a={dataA} b={dataB} />
              <LeaderboardPanel entries={leaderboard} />
            </>
          )}
        </>
      )}
    </div>
  );
}

function WinnerBanner({ a, b }: { a: PlayerData; b: PlayerData }) {
  const wa = computeWeight(a).total;
  const wb = computeWeight(b).total;
  const winner = wa >= wb ? a : b;
  const loserWeight = wa >= wb ? wb : wa;
  const winWeight = Math.max(wa, wb);
  const leadPct = winWeight > 0 ? (((winWeight - loserWeight) / winWeight) * 100).toFixed(1) : "0";

  return (
    <Panel className="border-gold/30 bg-gradient-to-r from-gold/10 via-transparent to-transparent">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex size-14 items-center justify-center rounded-2xl border border-gold/40 bg-gold/15 text-gold shadow-[0_0_24px_rgba(250,204,21,0.25)]">
            <Crown className="size-7" />
          </span>
          <div>
            <p className="eyebrow">Overall Progression Winner</p>
            <div className="flex items-center gap-2 mt-1">
              <RankBadge rankData={winner.hypixelPlayer} />
              <p className="text-2xl font-bold text-white">{winner.username}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Leads by {leadPct}% on Senither weight ({formatNumber(winWeight)} pts)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="rounded-xl border border-white/5 bg-black/30 p-3 text-right">
            <div className="flex items-center justify-end gap-1.5">
              <RankBadge rankData={a.hypixelPlayer} size="sm" />
              <span className="text-emerald-400 font-bold">{a.username}</span>
            </div>
            <p className="text-white/60 mt-1">{formatNumber(wa)} pts</p>
          </div>
          <span className="text-muted-foreground font-bold">VS</span>
          <div className="rounded-xl border border-white/5 bg-black/30 p-3 text-left">
            <div className="flex items-center gap-1.5">
              <RankBadge rankData={b.hypixelPlayer} size="sm" />
              <span className="text-cyan-300 font-bold">{b.username}</span>
            </div>
            <p className="text-white/60 mt-1">{formatNumber(wb)} pts</p>
          </div>
        </div>
      </div>
    </Panel>
  );
}

/** Mirrored horizontal bars: A grows left, B grows right. */
function MirroredSkills({ a, b }: { a: PlayerData; b: PlayerData }) {
  const rows = useMemo(() => {
    const keys = new Set([...a.skills.map((s) => s.key), ...b.skills.map((s) => s.key)]);
    return [...keys]
      .map((key) => {
        const sa = a.skills.find((s) => s.key === key);
        const sb = b.skills.find((s) => s.key === key);
        const la = sa ? sa.level + (sa.maxed ? 1 : sa.pct / 100) : 0;
        const lb = sb ? sb.level + (sb.maxed ? 1 : sb.pct / 100) : 0;
        const cap = Math.max(sa?.cap ?? 60, sb?.cap ?? 60);
        return {
          key,
          name: sa?.name ?? sb?.name ?? key,
          la,
          lb,
          pa: (la / cap) * 100,
          pb: (lb / cap) * 100,
          levelTextA: sa ? `${sa.level}${sa.maxed ? "" : ` (${sa.pct}%)`}` : "—",
          levelTextB: sb ? `${sb.level}${sb.maxed ? "" : ` (${sb.pct}%)`}` : "—",
        };
      })
      .sort((x, y) => y.la + y.lb - (x.la + x.lb));
  }, [a, b]);

  return (
    <Panel>
      <h2 className="text-lg font-semibold">Skills head-to-head</h2>
      <div className="mt-2 flex justify-between text-xs font-semibold">
        <span className="text-emerald-400">{a.username}</span>
        <span className="text-cyan-300">{b.username}</span>
      </div>
      <ul className="mt-4 space-y-3">
        {rows.map((row) => (
          <li key={row.key}>
            <div className="flex items-center gap-3">
              <span
                className={`w-12 shrink-0 text-right font-mono text-xs ${row.la >= row.lb ? "font-bold text-emerald-400" : "text-muted-foreground"}`}
              >
                {row.levelTextA}
              </span>
              <div className="flex h-2.5 min-w-0 flex-1 items-center justify-end overflow-hidden rounded-l-full bg-white/5">
                <div
                  className="h-full rounded-l-full bg-gradient-to-l from-emerald-500 to-emerald-300 transition-all duration-300"
                  style={{ width: `${row.pa}%` }}
                />
              </div>
              <span className="w-20 shrink-0 truncate text-center text-xs font-medium">
                {row.name}
              </span>
              <div className="flex h-2.5 min-w-0 flex-1 items-center overflow-hidden rounded-r-full bg-white/5">
                <div
                  className="h-full rounded-r-full bg-gradient-to-r from-cyan-500 to-cyan-300 transition-all duration-300"
                  style={{ width: `${row.pb}%` }}
                />
              </div>
              <span
                className={`w-12 shrink-0 font-mono text-xs ${row.lb > row.la ? "font-bold text-cyan-300" : "text-muted-foreground"}`}
              >
                {row.levelTextB}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function WeightPanels({ a, b }: { a: PlayerData; b: PlayerData }) {
  const wa = computeWeight(a);
  const wb = computeWeight(b);

  const sections: { label: string; a: number; b: number }[] = [
    { label: "Skill weight", a: wa.skillWeight, b: wb.skillWeight },
    { label: "Dungeon weight", a: wa.dungeonWeight, b: wb.dungeonWeight },
    { label: "Slayer weight", a: wa.slayerWeight, b: wb.slayerWeight },
  ];
  const maxSection = Math.max(...sections.flatMap((s) => [s.a, s.b]), 1);

  return (
    <Panel>
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <Trophy className="size-4 text-gold" /> Weight breakdown
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Senither-style score from skills, Catacombs and slayer kills.
      </p>

      <div className="mt-5 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="eyebrow">{a.username}</p>
          <p className="mt-1 text-2xl font-bold text-emerald-400">{formatNumber(wa.total)}</p>
        </div>
        <div>
          <p className="eyebrow">Total</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {wa.total === wb.total
              ? "Tied!"
              : wa.total > wb.total
                ? `${a.username} leads`
                : `${b.username} leads`}
          </p>
        </div>
        <div>
          <p className="eyebrow">{b.username}</p>
          <p className="mt-1 text-2xl font-bold text-cyan-300">{formatNumber(wb.total)}</p>
        </div>
      </div>

      <ul className="mt-6 space-y-4">
        {sections.map((section) => (
          <li key={section.label}>
            <div className="flex justify-between text-xs">
              <span
                className={
                  section.a >= section.b
                    ? "font-semibold text-emerald-400"
                    : "text-muted-foreground"
                }
              >
                {formatNumber(section.a)}
              </span>
              <span className="font-medium">{section.label}</span>
              <span
                className={
                  section.b > section.a ? "font-semibold text-cyan-300" : "text-muted-foreground"
                }
              >
                {formatNumber(section.b)}
              </span>
            </div>
            <div className="mt-1.5 flex gap-1">
              <div className="flex flex-1 justify-end">
                <div className="h-2 w-full overflow-hidden rounded-l-full bg-white/5">
                  <div
                    className="ml-auto h-full rounded-l-full bg-emerald-500/80"
                    style={{ width: `${(section.a / maxSection) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex flex-1">
                <div className="h-2 w-full overflow-hidden rounded-r-full bg-white/5">
                  <div
                    className="h-full rounded-r-full bg-cyan-500/80"
                    style={{ width: `${(section.b / maxSection) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {(a.dungeons || b.dungeons) && (
        <dl className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          {[
            [
              "Catacombs",
              `${a.dungeons?.catacombsLevel ?? "—"} / ${b.dungeons?.catacombsLevel ?? "—"}`,
            ],
            [
              "Secrets",
              `${formatNumber(a.dungeons?.secretsFound ?? 0)} / ${formatNumber(b.dungeons?.secretsFound ?? 0)}`,
            ],
            [
              "Floor clears",
              `${a.dungeons?.floors.reduce((s, f) => s + f.completions, 0) ?? 0} / ${b.dungeons?.floors.reduce((s, f) => s + f.completions, 0) ?? 0}`,
            ],
            [
              "Slayer kills",
              `${formatNumber(a.slayers?.reduce((s, x) => s + x.kills, 0) ?? 0)} / ${formatNumber(b.slayers?.reduce((s, x) => s + x.kills, 0) ?? 0)}`,
            ],
          ].map(([k, v]) => (
            <div key={k} className="glass-soft rounded-xl p-3 text-center">
              <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</dt>
              <dd className="mt-1 font-mono text-xs font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
      )}
    </Panel>
  );
}

function LeaderboardPanel({ entries }: { entries: LeaderEntry[] }) {
  if (entries.length === 0) return null;
  const top = entries.slice(0, 10);
  const max = top[0]?.weight || 1;

  return (
    <Panel>
      <h2 className="text-lg font-semibold">Your leaderboard</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Every profile you've compared, ranked by weight (stored locally).
      </p>
      <ol className="mt-4 space-y-2">
        {top.map((entry, index) => (
          <li key={entry.username} className="flex items-center gap-3">
            <span
              className={`w-6 shrink-0 text-right font-mono text-sm ${
                index === 0
                  ? "font-bold text-gold"
                  : index < 3
                    ? "font-semibold text-muted-foreground"
                    : "text-muted-foreground"
              }`}
            >
              #{index + 1}
            </span>
            <span className="w-32 shrink-0 truncate text-sm font-medium">{entry.username}</span>
            <div className="min-w-0 flex-1">
              <ProgressBar
                pct={(entry.weight / max) * 100}
                tone={index === 0 ? "gold" : "emerald"}
              />
            </div>
            <span className="w-16 shrink-0 text-right font-mono text-xs text-muted-foreground">
              {formatNumber(entry.weight)}
            </span>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
