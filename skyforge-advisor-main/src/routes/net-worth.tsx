import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Share2 } from "lucide-react";

import { useShare } from "@/hooks/use-share";
import { fetchBazaar } from "@/lib/hypixel.functions";

import { PageHero, Panel, ProgressBar, StatRow } from "@/components/layout/app-shell";
import { ConnectPrompt, ErrorState, LoadState } from "@/components/data-states";
import { ItemIcon } from "@/components/ui/item-icon";
import { MinecraftTooltip } from "@/components/ui/minecraft-tooltip";
import { RarityTag } from "@/components/layout/app-shell";
import { usePlayer } from "@/hooks/use-account";
import { useNetWorthHistory } from "@/hooks/use-net-worth-history";
import { formatFull } from "@/lib/skyblock";
import { estimateItemValue } from "@/lib/item-valuation";

export const Route = createFileRoute("/net-worth")({
  head: () => ({
    meta: [
      { title: "Net Worth — SkyBlock Assistant" },
      {
        name: "description",
        content: "Portfolio valuation across purse, bank, inventory, armor and storage.",
      },
      { property: "og:title", content: "Net Worth — SkyBlock Assistant" },
      {
        property: "og:description",
        content: "Full breakdown of your SkyBlock portfolio valuation.",
      },
    ],
  }),
  component: NetWorth,
});

const DONUT_COLORS = [
  "#34d399",
  "#2dd4bf",
  "#22d3ee",
  "#60a5fa",
  "#a78bfa",
  "#f472b6",
  "#fbbf24",
  "#f87171",
];

function NetWorth() {
  const { data, isLoading, error, connected } = usePlayer();
  const { share, copied } = useShare();

  // Live bazaar prices for valuing container items.
  const bazaarQuery = useQuery({
    queryKey: ["bazaar"],
    queryFn: fetchBazaar,
    staleTime: 60_000,
  });

  const priceIndex = useMemo(() => {
    const byId = new Map<string, number>();
    const byName = new Map<string, number>();
    for (const product of bazaarQuery.data?.products ?? []) {
      if (product.buyPrice > 0) {
        byId.set(product.id, product.buyPrice);
        byName.set(product.name.toLowerCase().trim(), product.buyPrice);
      }
    }
    return { byId, byName };
  }, [bazaarQuery.data]);

  const priceOf = (item: { id: string; name: string; count: number }) => {
    const unit =
      priceIndex.byId.get(item.id) ?? priceIndex.byName.get(item.name.toLowerCase().trim()) ?? 0;
    return unit * Math.max(1, item.count);
  };

  const handleShare = () => {
    if (!data) return;
    void share(
      "My SkyBlock Net Worth",
      `Total: ${formatFull(total)} · Purse ${formatFull(data.purse)} · Bank ${
        data.bank === null ? "hidden" : formatFull(data.bank)
      }`,
    );
  };

  const valueOfItem = (item: import("@/lib/skyblock").InventoryItem) => {
    const rawBase = priceOf(item);
    const valuation = estimateItemValue(item.lore, rawBase > 0 ? rawBase : null, {
      enchantments: item.enchantments,
      stars: item.stars,
      hotPotatoBooks: item.hotPotatoBooks,
      reforge: item.reforge,
      gems: item.gems,
      attributes: item.attributes,
      abilityScrolls: item.abilityScrolls,
      artOfWar: item.artOfWar,
      woodSingularity: item.woodSingularity,
    });
    if (valuation.total !== null && valuation.total > 0) {
      return valuation.total;
    }
    const upgrades =
      valuation.enchantTotal +
      valuation.bookTotal +
      valuation.masterStarTotal +
      valuation.gemTotal +
      valuation.attributeTotal +
      valuation.reforgeValue +
      valuation.scrollTotal +
      valuation.extrasTotal;
    return Math.max(rawBase, upgrades);
  };

  const containers = data?.containers ?? [];

  // Value every container against live bazaar prices and upgraded item valuation.
  const containerValues = useMemo(() => {
    const list = containers
      .map((container) => ({
        id: container.id,
        label: container.label,
        items: container.items.length,
        value: container.items.reduce((sum, item) => sum + valueOfItem(item), 0),
      }));

    if (data?.sacks && data.sacks.totalValue > 0) {
      list.push({
        id: "sacks",
        label: "Sacks & Storage",
        items: data.sacks.items.length,
        value: data.sacks.totalValue,
      });
    }

    return list.sort((a, b) => b.value - a.value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containers, data?.sacks, priceIndex]);

  const itemsValue = containerValues.reduce((sum, c) => sum + c.value, 0);
  const sacksValue = data?.sacks?.totalValue ?? 0;
  const total = data ? data.purse + (data.bank ?? 0) + itemsValue : 0;
  const containerItems = containers.reduce((sum, container) => sum + container.items.length, 0) + (data?.sacks?.items.length ?? 0);
  const bankPct = total > 0 ? Math.round(((data?.bank ?? 0) / total) * 100) : 0;
  const pursePct = total > 0 ? Math.round(((data?.purse ?? 0) / total) * 100) : 0;
  const itemsPct = total > 0 ? Math.round((itemsValue / total) * 100) : 0;

  // Donut composition: purse, bank, and top 5 containers by value.
  const composition = useMemo(() => {
    const slices = [
      { name: "Purse", value: data?.purse ?? 0 },
      ...(data?.bank ? [{ name: "Bank", value: data.bank }] : []),
      ...containerValues
        .filter((c) => c.value > 0)
        .slice(0, 5)
        .map((c) => ({ name: c.label, value: c.value })),
    ];
    const other = total - slices.reduce((sum, s) => sum + s.value, 0);
    if (other > 0) slices.push({ name: "Other storage", value: other });
    return slices.filter((s) => s.value > 0);
  }, [data, containerValues, total]);

  const history = useNetWorthHistory(data?.activeProfileId, total);

  // Most valuable single items across every container & sacks, priced from the
  // bazaar when possible, otherwise from exponential upgrade valuation.
  const topItems = useMemo(() => {
    const all = containers.flatMap((container) =>
      container.items
        .filter((item) => item.count > 0)
        .map((item) => ({
          id: item.id,
          name: item.name,
          rarity: item.rarity,
          lore: item.lore,
          count: item.count,
          container: container.label,
          value: valueOfItem(item),
        })),
    );

    if (data?.sacks?.items) {
      for (const sack of data.sacks.items) {
        if (sack.value > 100_000) {
          all.push({
            id: sack.id,
            name: sack.name,
            rarity: "UNCOMMON",
            lore: [],
            count: sack.count,
            container: "Sacks",
            value: sack.value,
          });
        }
      }
    }

    return all.sort((a, b) => b.value - a.value).slice(0, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containers, data?.sacks, priceIndex]);
  const firstPoint = history[0];
  const growth =
    firstPoint && firstPoint.v > 0 ? ((total - firstPoint.v) / firstPoint.v) * 100 : null;
  const chartData = history.map((p) => ({
    t: new Date(p.t).toLocaleDateString([], { month: "short", day: "numeric" }),
    v: p.v,
  }));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHero
        eyebrow="Economy"
        title="Net Worth"
        description="A full valuation of everything the profile holds, priced against live market data."
        actions={
          connected && data ? (
            <button
              onClick={handleShare}
              className="flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-5 py-2.5 text-sm font-medium text-primary transition-all duration-75 ease-out hover:scale-[1.03] hover:bg-primary/25 active:scale-95"
            >
              <Share2 className="size-4" />
              {copied ? "Copied!" : "Share"}
            </button>
          ) : undefined
        }
      />

      {!connected && <ConnectPrompt what="your live net worth" />}
      {connected && isLoading && <LoadState>Loading net worth data…</LoadState>}
      {connected && error && <ErrorState error={error} />}

      {connected && data && (
        <>
          <StatRow
            stats={[
              {
                label: "Total net worth",
                value: formatFull(total),
                sub: "Purse + bank",
              },
              {
                label: "Purse",
                value: formatFull(data.purse),
                sub: "Coins currently on hand",
              },
              {
                label: "Bank",
                value: data.bank === null ? "Hidden" : formatFull(data.bank),
                sub: "Bank balance",
              },
              {
                label: "Items value",
                value: formatFull(itemsValue),
                sub: `${containerItems} items at bazaar prices`,
              },
            ]}
          />

          {topItems.length > 0 && topItems[0]!.value > 0 && (
            <Panel>
              <div className="flex items-baseline justify-between">
                <h2 className="text-xl font-semibold">Most valuable items</h2>
                <p className="text-xs text-muted-foreground">
                  Top {topItems.length} across all containers
                </p>
              </div>
              <ol className="mt-5 space-y-2">
                {topItems.map((item, index) => (
                  <li
                    key={`${item.container}-${item.name}-${index}`}
                    className="glass-soft flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-75 hover:scale-[1.01] hover:border-primary/30"
                  >
                    <span className="w-5 shrink-0 text-center font-mono text-xs font-bold text-muted-foreground">
                      {index + 1}
                    </span>
                    <MinecraftTooltip
                      name={item.name}
                      rarity={item.rarity}
                      lore={item.lore}
                      estimatedValue={item.value}
                    >
                      <ItemIcon id={item.id} name={item.name} className="size-7 shrink-0 cursor-pointer" />
                    </MinecraftTooltip>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">{item.container}</p>
                    </div>
                    <RarityTag rarity={item.rarity} />
                    <span className="w-24 shrink-0 text-right font-mono text-sm font-bold text-amber-300">
                      {formatFull(item.value)}
                    </span>
                  </li>
                ))}
              </ol>
            </Panel>
          )}

          {chartData.length >= 2 && (
            <Panel>
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-semibold">Net worth over time</h2>
                {growth !== null && (
                  <span
                    className={`text-sm font-semibold ${growth >= 0 ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {growth >= 0 ? "+" : ""}
                    {growth.toFixed(1)}% since first snapshot
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Snapshots are recorded hourly while you visit. {chartData.length} data points stored
                locally.
              </p>
              <div className="mt-4 h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="nwFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="t"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      minTickGap={40}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      width={70}
                      tickFormatter={(v: number) => formatFull(v)}
                    />
                    <ChartTooltip
                      formatter={(value) => [formatFull(Number(value)), "Net worth"]}
                      contentStyle={{
                        background: "rgba(2,6,23,0.9)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke="var(--color-primary)"
                      strokeWidth={2}
                      fill="url(#nwFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          )}

          <div className="grid gap-4 lg:grid-cols-3">
            <Panel className="lg:col-span-2">
              <h2 className="text-xl font-semibold">Portfolio breakdown</h2>
              <ul className="mt-6 space-y-4">
                <li>
                  <div className="flex items-baseline justify-between text-sm">
                    <p className="font-medium">Purse</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {formatFull(data.purse)} · {pursePct}%
                    </p>
                  </div>
                  <div className="mt-2">
                    <ProgressBar pct={pursePct} />
                  </div>
                </li>
                <li>
                  <div className="flex items-baseline justify-between text-sm">
                    <p className="font-medium">Bank</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {data.bank === null ? "Hidden" : `${formatFull(data.bank)} · ${bankPct}%`}
                    </p>
                  </div>
                  <div className="mt-2">
                    <ProgressBar pct={data.bank === null ? 0 : bankPct} />
                  </div>
                </li>
                <li>
                  <div className="flex items-baseline justify-between text-sm">
                    <p className="font-medium">Items (Upgraded & Bazaar)</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {formatFull(itemsValue)} · {itemsPct}%
                    </p>
                  </div>
                  <div className="mt-2">
                    <ProgressBar pct={itemsPct} />
                  </div>
                </li>
                {sacksValue > 0 && (
                  <li>
                    <div className="flex items-baseline justify-between text-sm">
                      <p className="font-medium">Sacks & Material Storage</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {formatFull(sacksValue)} · {total > 0 ? Math.round((sacksValue / total) * 100) : 0}%
                      </p>
                    </div>
                    <div className="mt-2">
                      <ProgressBar pct={total > 0 ? Math.round((sacksValue / total) * 100) : 0} />
                    </div>
                  </li>
                )}
              </ul>
            </Panel>

            <Panel>
              <h2 className="text-xl font-semibold">Composition</h2>
              {composition.length > 0 ? (
                <>
                  <div className="mt-2 h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={composition}
                          dataKey="value"
                          nameKey="name"
                          innerRadius="55%"
                          outerRadius="85%"
                          paddingAngle={2}
                          stroke="none"
                        >
                          {composition.map((_, index) => (
                            <Cell key={index} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip
                          formatter={(value, name) => [formatFull(Number(value)), String(name)]}
                          contentStyle={{
                            background: "rgba(2,6,23,0.9)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 12,
                            fontSize: 12,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {composition.map((slice, index) => (
                      <li
                        key={slice.name}
                        className="flex items-center justify-between gap-2 text-xs"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <span
                            className="size-2 shrink-0 rounded-full"
                            style={{ background: DONUT_COLORS[index % DONUT_COLORS.length] }}
                          />
                          <span className="truncate text-muted-foreground">{slice.name}</span>
                        </span>
                        <span className="shrink-0 font-mono text-foreground/80">
                          {formatFull(slice.value)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  Connect your profile to see your portfolio composition.
                </p>
              )}
            </Panel>
          </div>

          <Panel>
            <h2 className="text-xl font-semibold">Container values</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Every item priced against live bazaar sell prices.
            </p>
            <ul className="mt-5 space-y-4">
              {containerValues.map((container) => {
                const pct = itemsValue > 0 ? Math.round((container.value / itemsValue) * 100) : 0;
                return (
                  <li key={container.id}>
                    <div className="flex items-baseline justify-between text-sm">
                      <p className="font-medium">
                        {container.label}
                        <span className="ml-2 text-xs text-muted-foreground">
                          {container.items} item{container.items === 1 ? "" : "s"}
                        </span>
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {formatFull(container.value)} · {pct}%
                      </p>
                    </div>
                    <div className="mt-2">
                      <ProgressBar pct={pct} />
                    </div>
                  </li>
                );
              })}
              {containerValues.length === 0 && (
                <li className="text-sm text-muted-foreground">
                  No container data is available for this profile.
                </li>
              )}
            </ul>
          </Panel>
        </>
      )}
    </div>
  );
}
