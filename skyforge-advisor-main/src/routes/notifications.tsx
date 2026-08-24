import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell, Coins, Gavel, Plus, RefreshCw, Sparkles, Target, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Chip, PageHero, Panel } from "@/components/layout/app-shell";
import { ConnectPrompt, ErrorState, LoadState } from "@/components/data-states";
import { usePlayer } from "@/hooks/use-account";
import {
  fetchAuctions,
  fetchBazaar,
  fetchDiscordWebhook,
  saveDiscordWebhook,
} from "@/lib/hypixel.functions";
import { evaluateAlerts, usePriceAlerts } from "@/hooks/use-price-alerts";
import { useWatchlist } from "@/hooks/use-watchlist";
import {
  clearFeed,
  markAllRead,
  pushFeed,
  useNotificationFeed,
  type FeedItem,
} from "@/hooks/use-notification-feed";
import { formatDuration, formatNumber } from "@/lib/skyblock";
import { MAX_FAIRY_SOULS } from "@/lib/constants";

const icons: Record<string, typeof Bell> = {
  market: Coins,
  auction: Gavel,
  goal: Target,
  skill: Sparkles,
  sync: RefreshCw,
};

type NotificationItem = FeedItem;

/** Minimum flip profit (coins) for an auction alert to fire. */
const FLIP_ALERT_THRESHOLD = 1_000_000;

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

function relativeTime(ms: number): string {
  const minutes = Math.max(0, Math.round(ms / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function Notifications() {
  const { data, connected, isLoading, error } = usePlayer();
  const { items, unreadCount } = useNotificationFeed();
  const [filter, setFilter] = useState("All");
  const [browserAlerts, setBrowserAlerts] = useState(false);
  const seenFlips = useRef<Set<string>>(new Set());
  const firstAuctionLoad = useRef(true);
  const priceAlerts = usePriceAlerts();
  const watchlist = useWatchlist();
  const lastPricesRef = useRef<Map<string, number>>(new Map());
  const [draftItem, setDraftItem] = useState("");
  const [draftThreshold, setDraftThreshold] = useState("");
  const [draftDirection, setDraftDirection] = useState<"below" | "above">("below");

  // ---------------------------------------------------------------------------
  // Discord webhook (server-side, so alerts fire while you're away)
  // ---------------------------------------------------------------------------

  const webhookQuery = useQuery({
    queryKey: ["discord-webhook"],
    queryFn: () => fetchDiscordWebhook(),
    staleTime: 60_000,
  });
  const [webhookDraft, setWebhookDraft] = useState("");
  const [webhookSaved, setWebhookSaved] = useState(false);
  const webhookHydrated = useRef(false);

  useEffect(() => {
    if (webhookQuery.data && !webhookHydrated.current) {
      webhookHydrated.current = true;
      setWebhookDraft(webhookQuery.data);
    }
  }, [webhookQuery.data]);

  const saveWebhook = async () => {
    const result = await saveDiscordWebhook({ data: webhookDraft.trim() });
    if (result?.ok) {
      setWebhookSaved(true);
      setTimeout(() => setWebhookSaved(false), 3000);
      void webhookQuery.refetch();
    }
  };

  const removeWebhook = async () => {
    await saveDiscordWebhook({ data: "" });
    setWebhookDraft("");
    void webhookQuery.refetch();
  };

  // ---------------------------------------------------------------------------
  // Live profile-derived notifications
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!data) return;
    const generated: NotificationItem[] = [];

    const maxed = data.skills.filter((s) => s.maxed);
    if (maxed.length > 0) {
      generated.push({
        id: `skills-maxed-${data.activeProfileId}`,
        title: `${maxed.length} skill${maxed.length > 1 ? "s" : ""} maxed`,
        body: `Maxed: ${maxed.map((s) => s.name).join(", ")}.`,
        time: relativeTime(Date.now() - data.lastSave),
        kind: "skill",
        unread: true,
      });
    }

    const nearMaxed = data.skills.find((s) => !s.maxed && s.pct >= 90);
    if (nearMaxed) {
      generated.push({
        id: `skill-near-${nearMaxed.key}`,
        title: `${nearMaxed.name} almost maxed`,
        body: `Level ${nearMaxed.level} — ${nearMaxed.pct}% to level ${nearMaxed.level + 1}.`,
        time: relativeTime(Date.now() - data.lastSave),
        kind: "goal",
        unread: true,
      });
    }

    if (data.fairySouls >= MAX_FAIRY_SOULS) {
      generated.push({
        id: "fairy-souls-complete",
        title: "All fairy souls collected",
        body: `You've found all ${MAX_FAIRY_SOULS} fairy souls on this profile.`,
        time: relativeTime(Date.now() - data.lastSave),
        kind: "goal",
        unread: true,
      });
    }

    generated.push({
      id: `sync-${data.lastSave}`,
      title: "Profile synced",
      body: `${data.username}'s ${data.profiles.find((p) => p.selected)?.cuteName ?? "profile"} data refreshed from Hypixel.`,
      time: relativeTime(Date.now() - data.lastSave),
      kind: "sync",
      unread: false,
    });

    pushFeed(generated);
  }, [data]);

  // ---------------------------------------------------------------------------
  // Auction flip alerts (polled; fires browser notifications when enabled)
  // ---------------------------------------------------------------------------

  const auctionsQuery = useQuery({
    queryKey: ["auctions"],
    queryFn: () => fetchAuctions(),
    enabled: connected,
    staleTime: 60_000,
    refetchInterval: 180_000,
  });

  useEffect(() => {
    const entries = auctionsQuery.data?.entries;
    if (!entries?.length) return;

    const flips = entries.filter(
      (a) => a.bin && a.profit >= FLIP_ALERT_THRESHOLD && !seenFlips.current.has(a.uuid),
    );
    if (!flips.length) return;

    for (const flip of flips.slice(0, 5)) seenFlips.current.add(flip.uuid);

    if (firstAuctionLoad.current) {
      firstAuctionLoad.current = false;
      return; // Don't spam on first load — only alert on *new* flips.
    }

    const fresh: NotificationItem[] = flips.map((flip) => ({
      id: `flip-${flip.uuid}`,
      title: `Flip opportunity: ${flip.name}`,
      body: `Listed at ${formatNumber(flip.price)} vs lowest BIN ${formatNumber(flip.lowestBin ?? 0)} (+${formatNumber(flip.profit)} profit). Ends in ${formatDuration(flip.endsInMs)}.`,
      time: "just now",
      kind: "auction",
      unread: true,
    }));

    pushFeed(fresh);

    if (
      browserAlerts &&
      typeof Notification !== "undefined" &&
      Notification.permission === "granted"
    ) {
      for (const item of fresh.slice(0, 3)) {
        new Notification(item.title, { body: item.body });
      }
    }
  }, [auctionsQuery.data, browserAlerts]);

  // ---------------------------------------------------------------------------
  // Watchlist price-threshold alerts (evaluated against live Bazaar data)
  // ---------------------------------------------------------------------------

  const bazaarQuery = useQuery({
    queryKey: ["bazaar"],
    queryFn: () => fetchBazaar(),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  useEffect(() => {
    const products = bazaarQuery.data?.products;
    if (!products?.length || priceAlerts.alerts.length === 0) return;

    const prices = new Map(products.map((p) => [p.id, p.buyPrice]));
    const fired = evaluateAlerts(priceAlerts.alerts, prices, lastPricesRef.current);

    if (!fired.length) {
      lastPricesRef.current = prices;
      return;
    }

    const fresh: NotificationItem[] = fired.map(({ alert, price }) => ({
      id: `price-${alert.id}-${Date.now()}`,
      title: `Price alert: ${alert.itemName}`,
      body: `Buy price is now ${formatNumber(price)} — ${alert.direction} your ${formatNumber(alert.threshold)} target.`,
      time: "just now",
      kind: "market",
      unread: true,
    }));

    pushFeed(fresh);

    if (
      browserAlerts &&
      typeof Notification !== "undefined" &&
      Notification.permission === "granted"
    ) {
      for (const item of fresh.slice(0, 3)) new Notification(item.title, { body: item.body });
    }

    lastPricesRef.current = prices;
  }, [bazaarQuery.data, priceAlerts.alerts, browserAlerts]);

  const addPriceAlert = () => {
    const threshold = Number(draftThreshold.replace(/[^0-9.]/g, ""));
    if (!draftItem || !Number.isFinite(threshold) || threshold <= 0) return;
    const name = draftItem;
    priceAlerts.add({ itemId: name, itemName: name, direction: draftDirection, threshold });
    setDraftThreshold("");
  };

  const enableBrowserAlerts = async () => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "granted") {
      setBrowserAlerts(true);
      return;
    }
    const permission = await Notification.requestPermission();
    setBrowserAlerts(permission === "granted");
  };

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
        description="Market flips, skill milestones and goal completions from your live account."
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              onClick={enableBrowserAlerts}
              className={`rounded-xl border px-4 py-2 text-sm transition-all duration-75 ease-out hover:scale-[1.02] active:scale-95 ${
                browserAlerts
                  ? "border-primary/40 bg-primary/15 text-primary"
                  : "border-border bg-secondary/50"
              }`}
            >
              {browserAlerts ? "Browser alerts on" : "Enable browser alerts"}
            </button>
            <button
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="rounded-xl border border-border bg-secondary/50 px-4 py-2 text-sm transition-all duration-75 ease-out hover:scale-[1.02] hover:border-ring/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              Mark all read{unreadCount > 0 ? ` (${unreadCount})` : ""}
            </button>
          </div>
        }
      />

      {!connected && <ConnectPrompt what="your profile notifications" />}
      {connected && isLoading && <LoadState>Loading notifications…</LoadState>}
      {connected && error && <ErrorState error={error} />}

      {connected && !isLoading && !error && (
        <>
          {/* Price alert rules */}
          <Panel>
            <h2 className="text-lg font-semibold">Price alerts</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Get notified when a watched item's Bazaar buy price crosses your target. Star items in
              the{" "}
              <a href="/bazaar" className="text-primary hover:underline">
                Bazaar
              </a>{" "}
              to build your watchlist.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <select
                value={draftItem}
                onChange={(e) => setDraftItem(e.target.value)}
                className="min-w-48 rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm outline-none"
              >
                <option value="">Select item…</option>
                {(watchlist.items.length
                  ? watchlist.items
                  : (bazaarQuery.data?.products ?? []).slice(0, 50).map((p) => p.id)
                ).map((id) => (
                  <option key={id} value={id}>
                    {bazaarQuery.data?.products.find((p) => p.id === id)?.name ?? id}
                  </option>
                ))}
              </select>
              <select
                value={draftDirection}
                onChange={(e) => setDraftDirection(e.target.value as "below" | "above")}
                className="rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm outline-none"
              >
                <option value="below">drops below</option>
                <option value="above">rises above</option>
              </select>
              <input
                value={draftThreshold}
                onChange={(e) => setDraftThreshold(e.target.value)}
                placeholder="Price (coins)"
                inputMode="numeric"
                className="w-36 rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm outline-none"
              />
              <button
                onClick={addPriceAlert}
                disabled={!draftItem || !draftThreshold}
                className="flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/15 px-4 py-2 text-sm font-medium text-primary transition-all duration-75 ease-out hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="size-4" /> Add alert
              </button>
            </div>

            {priceAlerts.alerts.length > 0 && (
              <ul className="mt-4 space-y-2">
                {priceAlerts.alerts.map((alert) => (
                  <li
                    key={alert.id}
                    className="glass-soft flex items-center justify-between rounded-xl px-4 py-2.5 text-sm"
                  >
                    <span>
                      <span className="font-medium">{alert.itemName}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        — notify when price{" "}
                        {alert.direction === "below" ? "drops below" : "rises above"}{" "}
                        <span className="font-mono">{formatNumber(alert.threshold)}</span>
                      </span>
                    </span>
                    <button
                      onClick={() => priceAlerts.remove(alert.id)}
                      aria-label="Remove alert"
                      className="rounded-lg p-1.5 text-muted-foreground transition-all hover:bg-white/10 hover:text-danger"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {/* Discord webhook */}
          <Panel>
            <h2 className="text-lg font-semibold">Discord alerts</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Get price alerts pushed to a Discord channel — even when this site is closed. Create a
              webhook in your server (Channel settings → Integrations → Webhooks) and paste the URL.
              Note: the webhook URL is stored server-side so alerts can fire while you're away.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <input
                value={webhookDraft}
                onChange={(e) => setWebhookDraft(e.target.value)}
                placeholder="https://discord.com/api/webhooks/…"
                className="min-w-64 flex-1 rounded-xl border border-border bg-secondary/40 px-3 py-2 font-mono text-sm outline-none"
              />
              <button
                onClick={() => void saveWebhook()}
                disabled={!webhookDraft.trim()}
                className="flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/15 px-4 py-2 text-sm font-medium text-primary transition-all duration-75 ease-out hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {webhookSaved ? "Saved!" : "Save webhook"}
              </button>
              {webhookDraft && (
                <button
                  onClick={() => void removeWebhook()}
                  className="rounded-xl border border-border bg-secondary/40 px-4 py-2 text-sm text-muted-foreground transition-all duration-75 ease-out hover:scale-[1.02] hover:text-foreground"
                >
                  Remove
                </button>
              )}
            </div>
            {webhookSaved && (
              <p className="mt-2 text-xs text-emerald-400">
                Webhook saved — fired alerts will be pushed to your channel.
              </p>
            )}
          </Panel>

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
                    key={notification.id}
                    className="glass-soft flex gap-4 rounded-2xl p-5 transition-all duration-75 ease-out hover:scale-[1.01] hover:border-primary/30"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium">
                          {notification.title}
                          {notification.id.startsWith("alert-") && (
                            <span className="ml-2 rounded-full border border-sky-400/40 bg-sky-400/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-sky-300">
                              Server
                            </span>
                          )}
                        </p>
                        <p className="shrink-0 text-xs text-muted-foreground">
                          {notification.time}
                        </p>
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
                  No notifications yet. Alerts appear as your profile syncs and new flip
                  opportunities are detected.
                </li>
              )}
            </ul>
          </Panel>
        </>
      )}
    </div>
  );
}
