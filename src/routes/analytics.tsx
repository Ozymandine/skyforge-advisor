import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
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
  component: Analytics;
});

function Analytics() {
  return null;
}
