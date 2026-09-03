// src/lib/market-history.server.ts
// Server-side persistent market history. Every time the app fetches live
// Bazaar/Auction data we sample prices into a bounded, file-backed store so
// charts, alerts and flip accuracy survive across sessions and visitors.
//
// Storage strategy: in-memory ring buffers mirrored to `.data/market-store.json`
// when the filesystem is writable (node dev/preview). On read-only serverless
// filesystems the store degrades to in-memory for the isolate lifetime.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export type MarketPoint = {
  t: number;
  /** Bazaar buy (instant-buy) price. */
  b?: number;
  /** Bazaar sell (instant-sell) price. */
  s?: number;
  /** Lowest BIN, when known. */
  bin?: number;
};

export type AlertRule = {
  id: string;
  itemId: string;
  itemName: string;
  direction: "below" | "above";
  threshold: number;
};

export type ServerNotification = {
  id: string;
  title: string;
  body: string;
  time: string;
  kind: string;
  unread: boolean;
};

type MarketStore = {
  lastSample: number;
  series: Record<string, MarketPoint[]>;
  alertRules: AlertRule[];
  /** Per-rule armed state so a rule fires once per crossing. */
  armed: Record<string, boolean>;
  notifications: ServerNotification[];
  /** Discord webhook URLs that fired alerts are posted to. */
  webhooks: Array<{ url: string; failures: number }>;
  /** Flip suggestions logged for accuracy tracking: {id, ts, price, kind}. */
  flipLog: Array<{
    id: string;
    itemId: string;
    ts: number;
    price: number;
    expected: number;
    kind: "bazaar" | "ah";
  }>;
};

// Storage backends: Cloudflare KV (REST) when configured, else local file.
// Both persist the same single JSON blob.

const DATA_DIR = join(process.cwd(), ".data");
const DATA_FILE = join(DATA_DIR, "market-store.json");

function kvEnv(): {
  account: string | undefined;
  namespace: string | undefined;
  token: string | undefined;
} {
  return {
    account: process.env["CF_ACCOUNT_ID"],
    namespace: process.env["CF_KV_NAMESPACE"],
    token: process.env["CF_KV_TOKEN"],
  };
}

function kvConfigured(): boolean {
  const { account, namespace, token } = kvEnv();
  return Boolean(account && namespace && token);
}

async function kvGetRaw(): Promise<string | null> {
  const { account, namespace, token } = kvEnv();
  if (!account || !namespace || !token) return null;
  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${account}/storage/kv/namespaces/${namespace}/values/market-store`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function kvPutRaw(json: string): Promise<boolean> {
  const { account, namespace, token } = kvEnv();
  if (!account || !namespace || !token) return false;
  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${account}/storage/kv/namespaces/${namespace}/values/market-store`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: json,
      },
    );
    return res.ok;
  } catch {
    return false;
  }
}
const SAMPLE_INTERVAL_MS = 5 * 60 * 1000;
const MAX_POINTS_PER_ITEM = 400; // ~33h at 5-minute cadence
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000; // 14 days
const TOP_VOLUME_TRACKED = 400;
const MAX_NOTIFICATIONS = 100;
const MAX_FLIP_LOG = 2000;

let store: MarketStore | null = null;
let hydrated = false;
let dirty = false;
let persistTimer: ReturnType<typeof setTimeout> | null = null;

function emptyStore(): MarketStore {
  return {
    lastSample: 0,
    series: {},
    alertRules: [],
    armed: {},
    notifications: [],
    webhooks: [],
    flipLog: [],
  };
}

function load(): MarketStore {
  if (store) return store;
  store = emptyStore();
  void hydrate();
  return store;
}

async function hydrate() {
  if (hydrated) return;
  hydrated = true;
  try {
    // Prefer KV (works in production); fall back to the local file (dev).
    const raw = kvConfigured() ? await kvGetRaw() : await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw ?? "null") as Partial<MarketStore> | null;
    if (parsed && typeof parsed === "object" && store) {
      store = {
        ...emptyStore(),
        ...parsed,
        series: parsed.series ?? {},
        alertRules: Array.isArray(parsed.alertRules) ? parsed.alertRules : [],
        armed: parsed.armed ?? {},
        notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
        flipLog: Array.isArray(parsed.flipLog) ? parsed.flipLog : [],
      };
    }
  } catch {
    // Nothing stored yet, or read-only filesystem — in-memory only.
  }
}

function schedulePersist() {
  dirty = true;
  if (persistTimer) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    void persistNow();
  }, 2000);
}

async function persistNow() {
  if (!store || !dirty) return;
  dirty = false;
  const json = JSON.stringify(store);

  if (kvConfigured()) {
    const ok = await kvPutRaw(json);
    if (ok) return;
    // KV failed — still try the file as a best-effort mirror below.
  }

  try {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(DATA_FILE, json);
  } catch {
    // Read-only filesystem (serverless) — in-memory only.
  }
}

function pruneSeries(points: MarketPoint[]): MarketPoint[] {
  const cutoff = Date.now() - MAX_AGE_MS;
  const filtered = points.filter((p) => p.t >= cutoff);
  return filtered.length > MAX_POINTS_PER_ITEM ? filtered.slice(-MAX_POINTS_PER_ITEM) : filtered;
}

// ============================================================================
// DISCORD WEBHOOKS
// ============================================================================

/** Register (or replace) a Discord webhook for alert pushes. Empty removes. */
export function saveDiscordWebhook(url: string): { ok: boolean } {
  const trimmed = url.trim().slice(0, 500);
  const db = load();
  if (!trimmed) {
    db.webhooks = [];
    schedulePersist();
    return { ok: true };
  }
  if (!/^https:\/\/(discord|discordapp)\.com\/api\/webhooks\//.test(trimmed)) {
    return { ok: false };
  }
  db.webhooks = [{ url: trimmed, failures: 0 }];
  schedulePersist();
  return { ok: true };
}

export function getDiscordWebhook(): string | null {
  return load().webhooks[0]?.url ?? null;
}

/**
 * Masked webhook status for clients. Never exposes the secret URL —
 * callers learn only whether one is configured plus a non-sensitive hint.
 */
export function getDiscordWebhookMasked(): { configured: boolean; hint: string | null } {
  const url = load().webhooks[0]?.url ?? null;
  if (!url) return { configured: false, hint: null };
  const tail = url.split("/").slice(-2).join("/");
  return { configured: true, hint: tail ? `…/${tail.slice(-12)}` : null };
}

async function postToDiscord(webhook: string, notification: ServerNotification): Promise<boolean> {
  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            title: notification.title,
            description: notification.body,
            color: 0x34d399,
            timestamp: notification.time,
          },
        ],
      }),
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Fire-and-forget push of notifications to all healthy webhooks. */
async function pushWebhooks(items: ServerNotification[]): Promise<void> {
  const db = load();
  for (const hook of db.webhooks) {
    for (const item of items.slice(0, 3)) {
      const ok = await postToDiscord(hook.url, item);
      if (!ok) {
        hook.failures += 1;
      } else {
        hook.failures = 0;
      }
    }
  }
  // Drop webhooks that failed 5 times in a row (deleted or revoked).
  db.webhooks = db.webhooks.filter((hook) => hook.failures < 5);
  schedulePersist();
}

export type SampleInput = {
  products: Array<{
    id: string;
    buyPrice: number;
    sellPrice: number;
    buyMovingWeek: number;
  }>;
  bins?: Map<string, number>;
  extraTrackedIds?: string[];
};

/**
 * Record a market snapshot. Throttled to one sample per SAMPLE_INTERVAL_MS;
 * safe to call on every bazaar/auction fetch.
 */
export function recordMarketSample(input: SampleInput): boolean {
  const db = load();
  const now = Date.now();
  if (now - db.lastSample < SAMPLE_INTERVAL_MS) return false;

  const volumeSorted = [...input.products].sort((a, b) => b.buyMovingWeek - a.buyMovingWeek);
  const tracked = new Set<string>([
    ...volumeSorted.slice(0, TOP_VOLUME_TRACKED).map((p) => p.id),
    ...(input.extraTrackedIds ?? []),
  ]);

  for (const product of input.products) {
    if (!tracked.has(product.id)) continue;
    if (!(product.buyPrice > 0) && !(product.sellPrice > 0)) continue;
    const point: MarketPoint = { t: now };
    if (product.buyPrice > 0) point.b = product.buyPrice;
    if (product.sellPrice > 0) point.s = product.sellPrice;
    const bin = input.bins?.get(product.id);
    if (bin != null && bin > 0) point.bin = bin;
    db.series[product.id] = pruneSeries([...(db.series[product.id] ?? []), point]);
  }

  db.lastSample = now;
  schedulePersist();

  evaluateAlertRules(buildPriceMap(db));
  return true;
}

/**
 * Merge lowest-BIN observations into the most recent sample (or start a new
 * one). Called from auction fetches; bazaar fetches call recordMarketSample.
 */
export function recordBinSample(bins: Array<{ id: string; lowestBin: number }>): boolean {
  const db = load();
  const now = Date.now();
  const fresh = now - db.lastSample < SAMPLE_INTERVAL_MS;

  let changed = false;
  for (const { id, lowestBin } of bins) {
    if (!(lowestBin > 0)) continue;
    const series = db.series[id] ?? [];
    const latest = series[series.length - 1];
    if (fresh && latest && now - latest.t < SAMPLE_INTERVAL_MS) {
      if (latest.bin == null) {
        latest.bin = lowestBin;
        changed = true;
      }
    } else if (!fresh) {
      series.push({ t: now, bin: lowestBin });
      db.series[id] = pruneSeries(series);
      changed = true;
    }
  }

  if (changed) {
    if (!fresh) db.lastSample = now;
    schedulePersist();
    evaluateAlertRules(buildPriceMap(db));
  }
  return changed;
}

function buildPriceMap(db: MarketStore): Map<string, number> {
  const prices = new Map<string, number>();
  for (const [id, points] of Object.entries(db.series)) {
    const latest = points[points.length - 1];
    if (latest) {
      // Prefer BIN, then bazaar buy price.
      prices.set(id, latest.bin ?? latest.b ?? latest.s ?? 0);
    }
  }
  return prices;
}

/* ============================================================================
 * ALERTS
 * ========================================================================== */

export function saveAlertRules(rules: AlertRule[]): void {
  const db = load();
  // Defense-in-depth: server functions already zod-validate, but sanitize here
  // too so no caller can poison the shared store with unbounded junk.
  const clean = (Array.isArray(rules) ? rules : [])
    .filter(
      (r): r is AlertRule =>
        !!r &&
        typeof r === "object" &&
        typeof r.id === "string" &&
        typeof r.itemId === "string" &&
        typeof r.itemName === "string" &&
        (r.direction === "below" || r.direction === "above") &&
        Number.isFinite(r.threshold),
    )
    .map((r) => ({
      id: r.id.trim().slice(0, 128),
      itemId: r.itemId.trim().slice(0, 64),
      itemName: r.itemName.trim().slice(0, 128),
      direction: r.direction,
      threshold: Math.min(Math.max(r.threshold, 0), 1e12),
    }))
    .filter((r) => r.id && r.itemId && r.threshold > 0)
    .slice(0, 100);
  db.alertRules = clean;
  // Re-arm rules whose definition changed.
  const ids = new Set(db.alertRules.map((r) => r.id));
  for (const id of Object.keys(db.armed)) {
    if (!ids.has(id)) delete db.armed[id];
  }
  for (const rule of db.alertRules) {
    if (!(rule.id in db.armed)) db.armed[rule.id] = true;
  }
  schedulePersist();
}

export function getAlertRules(): AlertRule[] {
  return load().alertRules;
}

function evaluateAlertRules(prices: Map<string, number>): ServerNotification[] {
  const db = load();
  const fired: ServerNotification[] = [];

  for (const rule of db.alertRules) {
    const price = prices.get(rule.itemId);
    if (price == null || price <= 0) continue;

    const isBeyond = rule.direction === "below" ? price <= rule.threshold : price >= rule.threshold;
    const armed = db.armed[rule.id] ?? true;

    if (isBeyond && armed) {
      // Fire once, then stay quiet until price crosses back.
      db.armed[rule.id] = false;
      fired.push({
        id: `alert-${rule.id}-${Date.now()}`,
        title: `${rule.itemName} alert`,
        body:
          rule.direction === "below"
            ? `Price dropped to ${formatCoins(price)} (below ${formatCoins(rule.threshold)})`
            : `Price rose to ${formatCoins(price)} (above ${formatCoins(rule.threshold)})`,
        time: new Date().toISOString(),
        kind: "price-alert",
        unread: true,
      });
    } else if (!isBeyond && !armed) {
      db.armed[rule.id] = true;
    }
  }

  if (fired.length) {
    pushNotifications(fired);
    schedulePersist();
    // Push to Discord webhooks (fire-and-forget; failures degrade silently).
    void pushWebhooks(fired);
  }
  return fired;
}

function formatCoins(value: number): string {
  if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(1)}k`;
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

/* ============================================================================
 * NOTIFICATIONS
 * ========================================================================== */

function pushNotifications(items: ServerNotification[]): void {
  const db = load();
  const existing = new Set(db.notifications.map((n) => n.id));
  const unique = items.filter((n) => !existing.has(n.id));
  if (!unique.length) return;
  db.notifications = [...unique, ...db.notifications].slice(0, MAX_NOTIFICATIONS);
}

export function getNotifications(): ServerNotification[] {
  return load().notifications;
}

export function markNotificationsRead(): void {
  const db = load();
  db.notifications = db.notifications.map((n) => ({ ...n, unread: false }));
  schedulePersist();
}

/* ============================================================================
 * HISTORY READS
 * ========================================================================== */

export function getMarketHistory(
  ids: string[],
  rangeMs = 24 * 60 * 60 * 1000,
): Record<string, MarketPoint[]> {
  const db = load();
  const cutoff = Date.now() - rangeMs;
  const result: Record<string, MarketPoint[]> = {};

  for (const id of ids.slice(0, 200)) {
    const points = db.series[id];
    if (!points?.length) continue;
    const filtered = points.filter((p) => p.t >= cutoff);
    if (filtered.length) result[id] = filtered;
  }
  return result;
}

export function getTrackedIds(): string[] {
  return Object.keys(load().series);
}

/* ============================================================================
 * FLIP ACCURACY LOG
 * ========================================================================== */

export function logFlipSuggestion(entry: {
  id: string;
  itemId: string;
  price: number;
  expected: number;
  kind: "bazaar" | "ah";
}): void {
  // Sanitize: shared accuracy log must not accept unbounded attacker input.
  if (
    typeof entry.id !== "string" ||
    typeof entry.itemId !== "string" ||
    !Number.isFinite(entry.price) ||
    !Number.isFinite(entry.expected)
  ) {
    return;
  }
  const clean = {
    id: entry.id.trim().slice(0, 128),
    itemId: entry.itemId.trim().slice(0, 64),
    price: Math.min(Math.max(entry.price, 0), 1e12),
    expected: Math.min(Math.max(entry.expected, 0), 1e12),
    kind: entry.kind === "ah" ? ("ah" as const) : ("bazaar" as const),
  };
  if (!clean.id || !clean.itemId || clean.price <= 0 || clean.expected <= 0) return;
  const db = load();
  db.flipLog = [...db.flipLog.filter((f) => f.id !== clean.id), { ...clean, ts: Date.now() }].slice(
    -MAX_FLIP_LOG,
  );
  schedulePersist();
}

export type FlipAccuracy = {
  tracked: number;
  resolved: number;
  wins: number;
  losses: number;
  winRate: number | null;
  avgActualMarginPct: number | null;
  avgExpectedMarginPct: number | null;
};

/**
 * Compare logged flip suggestions against current prices to estimate how
 * often the app's suggestions would have been profitable.
 */
export function getFlipAccuracy(
  currentPrices: Map<string, number>,
  minAgeMs = 10 * 60 * 1000,
): FlipAccuracy {
  const db = load();
  const now = Date.now();
  let wins = 0;
  let losses = 0;
  let actualSum = 0;
  let expectedSum = 0;
  let resolved = 0;

  for (const flip of db.flipLog) {
    if (now - flip.ts < minAgeMs) continue;
    const current = currentPrices.get(flip.itemId);
    if (current == null || current <= 0 || flip.price <= 0) continue;

    // Sell into the order book after fees (1.25% tax like the flip board).
    const actualMarginPct = ((current * 0.9875 - flip.price) / flip.price) * 100;
    const expectedMarginPct = ((flip.expected - flip.price) / flip.price) * 100;

    resolved++;
    actualSum += actualMarginPct;
    expectedSum += expectedMarginPct;
    if (actualMarginPct > 0) wins++;
    else losses++;
  }

  return {
    tracked: db.flipLog.length,
    resolved,
    wins,
    losses,
    winRate: resolved > 0 ? (wins / resolved) * 100 : null,
    avgActualMarginPct: resolved > 0 ? actualSum / resolved : null,
    avgExpectedMarginPct: resolved > 0 ? expectedSum / resolved : null,
  };
}
