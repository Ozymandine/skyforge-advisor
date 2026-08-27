import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Swords, ChevronRight } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ConnectPrompt, ErrorState, LoadState } from "@/components/data-states";
import { PageHero, Panel, ProgressBar, StatRow } from "@/components/layout/app-shell";
import { ItemIcon } from "@/components/ui/item-icon";
import { useAccount, usePlayer } from "@/hooks/use-account";
import { getHistory, hasTrend, historySpanDays } from "@/lib/history";
import { fetchItems, fetchPriceHistory, fetchTrackedIds } from "@/lib/hypixel.functions";
import { formatFull, formatNumber } from "@/lib/skyblock";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — SkyBlock Assistant" },
      {
        name: "description",
        content: "Live SkyBlock profile analytics, progress summaries and trend breakdowns.",
      },
      { property: "og:title", content: "Analytics — SkyBlock Assistant" },
      {
        property: "og:description",
        content: "Live profile analytics for skill progress, net worth and collection tracking.",
      },
    ],
  }),
  component: Analytics,
});

function Analytics() {
  const { data, isLoading, error, connected } = usePlayer();
  const account = useAccount();
  const [range, setRange] = useState<24 | 168>(24);

  // Local snapshot history for the connected profile (recorded automatically).
  const history = useMemo(
    () => (data ? getHistory(data.uuid, account.profileId || data.activeProfileId) : []),
    [data, account.profileId],
  );

  // Server-recorded market history (survives across sessions/visitors).
  const trackedQuery = useQuery({
    queryKey: ["tracked-ids"],
    queryFn: () => fetchTrackedIds(),
    staleTime: 5 * 60_000,
  });
  const itemsQuery = useQuery({
    queryKey: ["items"],
    queryFn: () => fetchItems(),
    staleTime: 10 * 60_000,
  });
  const trackedIds = (trackedQuery.data ?? []).slice(0, 40);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const activeId = selectedId ?? trackedIds[0] ?? null;
  const marketHistoryQuery = useQuery({
    queryKey: ["market-history-analytics", activeId, range],
    queryFn: () =>
      fetchPriceHistory({ data: { ids: activeId ? [activeId] : [], rangeHours: range } }),
    enabled: !!activeId,
    staleTime: 5 * 60_000,
  });

  const marketChart = useMemo(() => {
    if (!activeId) return [];
    const points = marketHistoryQuery.data?.[activeId] ?? [];
    return points
      .map((p) => ({
        t: new Date(p.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        v:
          (p as { b?: number; bin?: number; s?: number }).bin ??
          (p as { b?: number }).b ??
          (p as { s?: number }).s ??
          0,
      }))
      .filter((p) => p.v > 0);
  }, [marketHistoryQuery.data, activeId]);

  const nameOf = useMemo(() => {
    const map = new Map((itemsQuery.data ?? []).map((i) => [i.id, i.name]));
    return (id: string) => map.get(id) ?? id;
  }, [itemsQuery.data]);

  const trendData = useMemo(
    () =>
      history.map((s) => ({
        date: new Date(s.t).toLocaleDateString([], { month: "short", day: "numeric" }),
        netWorth: s.netWorth,
        skillAverage: s.skillAverage,
        fairySouls: s.fairySouls,
      })),
    [history],
  );

  const netWorth = data ? data.purse + (data.bank ?? 0) : 0;
  const topSkills = data
    ? [...data.skills].sort((a, b) => b.level - a.level || b.totalXp - a.totalXp).slice(0, 4)
    : [];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHero
        eyebrow="Tools"
        title="Analytics"
        description="Live trend summaries, profile performance and progress metrics from your connected account."
      />

      {/* Compare Profiles Quick Access Card */}
      {connected && isLoading && <LoadState>Loading analytics data…</LoadState>}
      {connected && error && <ErrorState error={error} />}

      {connected && data && (
        <>
          <StatRow
            stats={[
              { label: "Skill average", value: data.skillAverage.toFixed(2), sub: "All skills" },
              {
                label: "Total skill XP",
                value: formatFull(data.totalSkillXp),
                sub: "Current progress",
              },
              { label: "Net worth estimate", value: formatFull(netWorth), sub: "Purse + bank" },
              {
                label: "Collections tracked",
                value: String(data.collections.length),
                sub: "Unique categories",
              },
            ]}
          />

          <Panel>
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-2xl">
                <p className="eyebrow">Profile performance</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                  Connected account analytics
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  These insights are pulled from your live Hypixel SkyBlock profile. A daily
                  snapshot of your profile is stored locally each time you visit, building up trend
                  history over time.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              <div className="glass-soft rounded-2xl p-5">
                <p className="text-sm font-medium">Live net worth</p>
                <p className="mt-3 text-3xl font-semibold">{formatFull(netWorth)}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {data.bank === null
                    ? "Bank hidden by profile"
                    : `${formatFull(data.purse)} purse · ${formatFull(data.bank)} bank`}
                </p>
              </div>

              <div className="glass-soft rounded-2xl p-5">
                <p className="text-sm font-medium">Fairy souls</p>
                <p className="mt-3 text-3xl font-semibold">{formatFull(data.fairySouls)}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Total fairy souls collected for this profile
                </p>
              </div>

              <div className="glass-soft rounded-2xl p-5">
                <p className="text-sm font-medium">History recorded</p>
                <p className="mt-3 text-3xl font-semibold">{history.length}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {hasTrend(history)
                    ? `${historySpanDays(history)} day${historySpanDays(history) > 1 ? "s" : ""} of daily snapshots`
                    : "Daily snapshots appear here as you keep visiting"}
                </p>
              </div>
            </div>
          </Panel>

          {hasTrend(history) && (
            <Panel>
              <h2 className="text-xl font-semibold">Trends over time</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Net worth and skill average captured from your daily local snapshots.
              </p>
              <div className="mt-6 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                    <YAxis
                      yAxisId="worth"
                      stroke="#94a3b8"
                      fontSize={12}
                      tickFormatter={(v) => formatNumber(Number(v))}
                    />
                    <YAxis
                      yAxisId="skill"
                      orientation="right"
                      domain={[0, 60]}
                      stroke="#94a3b8"
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#0E121B",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 12,
                      }}
                      formatter={(value, name) =>
                        name === "Net worth" ? formatFull(Number(value)) : String(value)
                      }
                    />
                    <Line
                      yAxisId="worth"
                      type="monotone"
                      dataKey="netWorth"
                      name="Net worth"
                      stroke="#34d399"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      yAxisId="skill"
                      type="monotone"
                      dataKey="skillAverage"
                      name="Skill average"
                      stroke="#fbbf24"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          )}

          <Panel>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Market trends</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Server-recorded price history — survives across sessions and visitors.
                  {trackedIds.length > 0 && ` ${trackedIds.length} markets tracked.`}
                </p>
              </div>
              <div className="flex gap-1.5">
                {([24, 168] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${
                      range === r
                        ? "border-primary/40 bg-primary/15 text-primary"
                        : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r === 24 ? "24h" : "7d"}
                  </button>
                ))}
              </div>
            </div>

            {trackedIds.length === 0 ? (
              <p className="mt-4 rounded-lg border border-dashed border-white/10 bg-black/20 p-3 text-xs text-muted-foreground">
                No market history recorded yet — it builds automatically as the site fetches live
                prices (roughly every 5 minutes).
              </p>
            ) : (
              <>
                <select
                  value={activeId ?? ""}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="mt-4 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
                >
                  {trackedIds.map((id) => (
                    <option key={id} value={id} className="bg-slate-950">
                      {nameOf(id)}
                    </option>
                  ))}
                </select>

                <div className="mt-4 h-64 w-full">
                  {marketChart.length >= 2 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={marketChart}
                        margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                        <XAxis dataKey="t" stroke="#94a3b8" fontSize={11} minTickGap={40} />
                        <YAxis
                          stroke="#94a3b8"
                          fontSize={11}
                          width={70}
                          tickFormatter={(v) => formatNumber(Number(v))}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "#0E121B",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 12,
                          }}
                          formatter={(value) => [`${formatNumber(Number(value))} coins`, "Price"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="v"
                          name={activeId ? nameOf(activeId) : "Price"}
                          stroke="#34d399"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/20 text-xs text-muted-foreground">
                      Not enough samples yet — check back after a few snapshots.
                    </div>
                  )}
                </div>
              </>
            )}
          </Panel>

          <Panel>
            <h2 className="text-xl font-semibold">Top skills</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {topSkills.map((skill) => (
                <div key={skill.key} className="glass-soft rounded-2xl p-5">
                  <p className="text-sm font-medium">
                    {skill.name} {skill.level}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {skill.maxed
                      ? `${formatFull(skill.totalXp)} XP · Maxed`
                      : `${formatFull(skill.currentXp)} / ${formatFull(skill.neededXp)} XP`}
                  </p>
                  <div className="mt-4">
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${skill.pct}%` }}
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{skill.pct}% to next level</p>
                </div>
              ))}
            </div>
          </Panel>

          {data.dungeons && (
            <Panel>
              <h2 className="text-xl font-semibold">Dungeons — Catacombs</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="glass-soft rounded-2xl p-5">
                  <p className="text-sm font-medium">Catacombs level</p>
                  <p className="mt-3 text-3xl font-semibold">{data.dungeons.catacombsLevel}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatFull(data.dungeons.catacombsXp)} total XP
                  </p>
                </div>
                <div className="glass-soft rounded-2xl p-5">
                  <p className="text-sm font-medium">Secrets found</p>
                  <p className="mt-3 text-3xl font-semibold">
                    {formatFull(data.dungeons.secretsFound)}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">Lifetime secret count</p>
                </div>
                <div className="glass-soft rounded-2xl p-5">
                  <p className="text-sm font-medium">Floors completed</p>
                  <p className="mt-3 text-3xl font-semibold">
                    {data.dungeons.floors.filter((f) => f.completions > 0).length}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">With at least one run</p>
                </div>
              </div>

              {data.dungeons.floors.length > 0 && (
                <ul className="mt-6 space-y-2">
                  {data.dungeons.floors.map((floor) => (
                    <li
                      key={floor.name}
                      className="glass-soft flex items-center gap-4 rounded-xl px-4 py-3"
                    >
                      <span className="w-20 shrink-0 text-sm font-medium">{floor.name}</span>
                      <div className="flex-1">
                        <ProgressBar pct={Math.min(100, (floor.bestScore / 300) * 100)} />
                      </div>
                      <span className="w-28 shrink-0 text-right text-xs text-muted-foreground">
                        {formatFull(floor.completions)} runs · S{Math.round(floor.bestScore)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          )}

          {data.slayers && data.slayers.length > 0 && (
            <Panel>
              <h2 className="text-xl font-semibold">Slayer bosses</h2>
              <p className="mt-1 text-sm text-muted-foreground">Total kills per boss tier.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(
                  data.slayers.reduce<Record<string, number>>((acc, s) => {
                    acc[s.name] = (acc[s.name] ?? 0) + s.kills;
                    return acc;
                  }, {}),
                ).map(([name, kills]) => (
                  <div key={name} className="glass-soft rounded-2xl p-5">
                    <p className="text-sm font-medium">{name}</p>
                    <p className="mt-3 text-2xl font-semibold">{formatFull(kills)}</p>
                    <p className="mt-2 text-xs text-muted-foreground">total kills</p>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          <Panel>
            <h2 className="text-xl font-semibold">Collection overview</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Your connected profile currently reports {data.collections.length} collection
              categories.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.collections.slice(0, 6).map((collection) => (
                <div
                  key={`${collection.category}-${collection.name}`}
                  className="glass-soft rounded-2xl p-5"
                >
                  <p className="text-sm font-medium">{collection.name}</p>
                  <p className="mt-3 text-2xl font-semibold">{formatFull(collection.amount)}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{collection.category}</p>
                </div>
              ))}
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}
