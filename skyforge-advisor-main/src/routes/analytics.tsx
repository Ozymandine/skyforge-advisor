import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { getHistory } from "@/lib/history";
import { fetchItems, fetchPriceHistory, fetchTrackedIds } from "@/lib/hypixel.functions";
import { formatFull, formatNumber, titleCase } from "@/lib/skyblock";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
        content: "Live profile analytics for skill progress, balances, and collections.",
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
        t: new Date(p.t).toLocaleString([], {
          ...(range === 168 ? { weekday: "short" } : {}),
          hour: "2-digit",
          minute: "2-digit",
        }),
        v: p.b ?? 0,
      }))
      .filter((p) => p.v > 0);
  }, [marketHistoryQuery.data, activeId, range]);

  const nameOf = useMemo(() => {
    const map = new Map((itemsQuery.data ?? []).map((i) => [i.id, i.name]));
    return (id: string) => map.get(id) ?? titleCase(id);
  }, [itemsQuery.data]);

  const trendData = useMemo(
    () =>
      history
        .filter((snapshot) => snapshot.reported)
        .map((s) => ({
          date: new Date(s.t).toLocaleDateString([], { month: "short", day: "numeric" }),
          coins: s.coins,
          skillAverage: s.skillAverage,
          fairySouls: s.fairySouls,
        })),
    [history],
  );

  const purse = data?.availability?.purse ? data.purse : null;
  const bank = data?.bank ?? null;
  const balance = purse !== null && bank !== null ? purse + bank : null;
  const skillAverage = data?.skills.some((skill) => !["SOCIAL", "RUNECRAFTING"].includes(skill.key))
    ? data.skillAverage.toFixed(2)
    : "Unavailable";
  const topSkills = data
    ? [...data.skills].sort((a, b) => b.level - a.level || b.totalXp - a.totalXp).slice(0, 4)
    : [];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHero title="Player analytics" />

      {/* Compare Profiles Quick Access Card */}
      {connected && isLoading && <LoadState>Loading analytics data…</LoadState>}
      {connected && error && <ErrorState error={error} />}

      {connected && data && (
        <>
          <StatRow
            stats={[
              { label: "Available skill average", value: skillAverage },
              {
                label: "Total skill XP",
                value: data.skills.length ? formatFull(data.totalSkillXp) : "Unavailable",
              },
              {
                label: balance === null ? "Purse" : "Purse + bank",
                value:
                  balance !== null
                    ? formatFull(balance)
                    : purse !== null
                      ? formatFull(purse)
                      : "Unavailable",
              },
              {
                label: "Fairy Souls",
                value: data.availability?.fairySouls ? formatFull(data.fairySouls) : "Unavailable",
              },
            ]}
          />

          <p className="text-sm text-muted-foreground">
            {history.length
              ? `${history.length} daily snapshots stored on this device.`
              : "Daily snapshots are stored on this device."}
          </p>

          {trendData.length >= 2 && (
            <Panel>
              <h2 className="text-xl font-semibold">Trends over time</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Reported balances and skill averages from daily snapshots.
              </p>
              <div className="mt-6 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="date" stroke="var(--color-parchment-muted)" fontSize={12} />
                    <YAxis
                      yAxisId="worth"
                      stroke="var(--color-parchment-muted)"
                      fontSize={12}
                      tickFormatter={(v) => formatNumber(Number(v))}
                    />
                    <YAxis
                      yAxisId="skill"
                      orientation="right"
                      domain={[0, 60]}
                      stroke="var(--color-parchment-muted)"
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#0E121B",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 12,
                      }}
                      formatter={(value, name) =>
                        name === "Purse + bank" ? formatFull(Number(value)) : String(value)
                      }
                    />
                    <Line
                      yAxisId="worth"
                      type="monotone"
                      dataKey="coins"
                      name="Purse + bank"
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
                <h2 className="text-xl font-semibold">Bazaar price history</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Recorded sell offer quotes.
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
                <Select value={activeId ?? ""} onValueChange={setSelectedId}>
                  <SelectTrigger
                    aria-label="Bazaar market"
                    className="mt-4 max-w-full rounded-lg bg-background/40 sm:max-w-72"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[...trackedIds]
                      .sort((a, b) => nameOf(a).localeCompare(nameOf(b)))
                      .map((id) => (
                        <SelectItem key={id} value={id}>
                          {nameOf(id)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                <div className="mt-4 h-64 w-full">
                  {marketChart.length >= 2 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={marketChart}
                        margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                        <XAxis
                          dataKey="t"
                          stroke="var(--color-parchment-muted)"
                          fontSize={11}
                          minTickGap={40}
                        />
                        <YAxis
                          stroke="var(--color-parchment-muted)"
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
