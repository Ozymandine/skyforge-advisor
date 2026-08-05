import { createFileRoute } from "@tanstack/react-router";
import { Bell, Coins, Gavel, RefreshCw, Sparkles, Target } from "lucide-react";
import { useMemo, useState } from "react";

import { Chip, PageHero, Panel } from "@/components/layout/app-shell";
import { ConnectPrompt, ErrorState, LoadState } from "@/components/data-states";
import { usePlayer } from "@/hooks/use-account";

const icons: Record<string, typeof Bell> = {
  market: Coins,
  auction: Gavel,
  goal: Target,
  skill: Sparkles,
  sync: RefreshCw,
};

type NotificationItem = {
  title: string;
  body: string;
  time: string;
  kind: string;
  unread: boolean;
};

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

function Notifications() {
  const { connected, isLoading, error } = usePlayer();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState("All");

  const filtered = useMemo(
    () =>
      filter === "All"
        ? items
        : filter === "Unread"
        ? items.filter((item) => item.unread)
        : items.filter((item) => item.kind === filter.toLowerCase()),
    [filter, items],
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHero
        eyebrow="Profile"
        title="Notifications"
        description="Market flips, outbid warnings, skill milestones and goal completions."
        actions={
          <button
            onClick={() => setItems((current) => current.map((item) => ({ ...item, unread: false })))}
            disabled={items.length === 0}
            className="rounded-xl border border-border bg-secondary/50 px-4 py-2 text-sm transition-all duration-75 ease-out hover:scale-[1.02] hover:border-ring/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            Mark all read
          </button>
        }
      />

      {!connected && <ConnectPrompt what="your profile notifications" />}
      {connected && isLoading && <LoadState>Loading notifications…</LoadState>}
      {connected && error && <ErrorState error={error} />}

      {connected && !isLoading && !error && (
        <Panel>
          <div className="flex flex-wrap gap-2">
            {["All", "Unread", "Market", "Auction", "Goal", "Skill", "Sync"].map((f) => (
              <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
                {f}
              </Chip>
            ))}
          </div>

          <ul className="mt-6 space-y-3">
            {filtered.map((notification) => {
              const Icon = icons[notification.kind] ?? Bell;
              return (
                <li
                  key={notification.title}
                  className="glass-soft flex gap-4 rounded-2xl p-5 transition-all duration-75 ease-out hover:scale-[1.01] hover:border-primary/30"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="shrink-0 text-xs text-muted-foreground">{notification.time}</p>
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground">{notification.body}</p>
                  </div>
                  {notification.unread && (
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary animate-pulse" />
                  )}
                </li>
              );
            })}

            {filtered.length === 0 && (
              <li className="py-8 text-center text-sm text-muted-foreground">
                No notifications yet. Connect your account and enable live alerts to see activity here.
              </li>
            )}
          </ul>
        </Panel>
      )}
    </div>
  );
}