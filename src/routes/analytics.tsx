import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHero, Panel, StatRow } from "@/components/layout/app-shell";
import { eventHistory, netWorthTrend, xpHistory } from "@/data/mock";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — SkyBlock Assistant" },
      {
        name: "description",
        content: "Historical skill XP gains, net worth trends over time and event history.",
      },
      { property: "og:title", content: "Analytics — SkyBlock Assistant" },
      {
        property: "og:description",
        content: "Charts for XP gain, net worth trend and profile event history.",
      },
    ],
  }),
  component: Analytics,
});

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "0.75rem",
  fontSize: "12px",
  color: "var(--popover-foreground)",
};

function Analytics() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHero
        eyebrow="Tools"
        title="Analytics"
        description="Historical XP gain, net worth trend lines and a full event history for the profile."
      />

      <StatRow
        stats={[
          { label: "XP gained (7d)", value: "68.4K", sub: "All skills combined" },
          { label: "Best day", value: "Saturday", sub: "13.7K XP" },
          { label: "Net worth change", value: "+1.32B", sub: "Since Jul 01" },
          { label: "Events logged", value: "184", sub: "Last 30 days" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <h2 className="text-xl font-semibold">Skill XP gained</h2>
          <p className="mt-1 text-xs text-muted-foreground">Last 7 days, per skill</p>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={xpHistory}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="combat" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="mining" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="farming" stroke="var(--chart-3)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <h2 className="text-xl font-semibold">Net worth trend</h2>
          <p className="mt-1 text-xs text-muted-foreground">Billions of coins</p>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={netWorthTrend}>
                <defs>
                  <linearGradient id="nw" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  fill="url(#nw)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel>
        <h2 className="text-xl font-semibold">Event history</h2>
        <ul className="mt-6 space-y-3">
          {eventHistory.map((e) => (
            <li
              key={e.label}
              className="glass-soft flex items-center justify-between gap-4 rounded-xl px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="size-1.5 rounded-full bg-primary" />
                <p className="text-sm">{e.label}</p>
              </div>
              <p className="shrink-0 text-xs text-muted-foreground">{e.time}</p>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
