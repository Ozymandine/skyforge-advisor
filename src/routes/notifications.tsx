import { createFileRoute } from "@tanstack/react-router";
import { Bell, Coins, Gavel, RefreshCw, Sparkles, Target } from "lucide-react";
import { useState } from "react";

import { Chip, PageHero, Panel } from "@/components/layout/app-shell";
import { notifications as seed } from "@/data/mock";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — SkyBlock Assistant" },
      {
        name: "description",
        content: "Alerts for market flips, outbid events and goal achievements.",
      },
      { property: "og:title", content: "Notifications — SkyBlock Assistant" },
      {
        property: "og:description",
        content: "All profile alerts in one feed: flips, outbids and goals.",
      },
    ],
  }),
  component: Notifications,
});

const icons: Record<string, typeof Bell> = {
  market: Coins,
  auction: Gavel,
  goal: Target,
  skill: Sparkles,
  sync: RefreshCw,
};

function Notifications() {
  const [items, setItems] = useState(seed);
  const [filter, setFilter] = useState("All");

  const filtered =
    filter === "All"
      ? items
      : filter === "Unread"
        ? items.filter((i) => i.unread)
        : items.filter((i) => i.kind === filter.toLowerCase());

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHero
        eyebrow="Profile"
        title="Notifications"
        description="Market flips, outbid warnings, skill milestones and goal completions."
        actions={
          <button
            onClick={() => setItems((n) => n.map((i) => ({ ...i, unread: false })))}
            className="rounded-xl border border-border bg-secondary/50 px-4 py-2 text-sm transition-colors hover:border-ring/40"
          >
            Mark all read
          </button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {["All", "Unread", "Market", "Auction", "Goal", "Skill", "Sync"].map((f) => (
          <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f}
          </Chip>
        ))}
      </div>

      <Panel>
        <ul className="space-y-3">
          {filtered.map((n) => {
            const Icon = icons[n.kind] ?? Bell;
            return (
              <li key={n.title} className="glass-soft flex gap-4 rounded-2xl p-5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="shrink-0 text-xs text-muted-foreground">{n.time}</p>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">{n.body}</p>
                </div>
                {n.unread && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="py-8 text-center text-sm text-muted-foreground">Nothing here yet.</li>
          )}
        </ul>
      </Panel>
    </div>
  );
}
