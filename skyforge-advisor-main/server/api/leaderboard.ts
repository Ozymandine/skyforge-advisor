// server/api/leaderboard.ts
// Proxy endpoint for Elite SkyBlock leaderboards to bypass client-side CORS.
// Registered as a Nitro handler in vite.config.ts (route: /api/leaderboard).

import { defineEventHandler, getHeader, getQuery, setHeader } from "h3";
import { leaderboardIdSchema } from "../../src/lib/schemas";

const ALLOWED_ORIGINS = (process.env["PUBLIC_API_ORIGINS"] ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

let windowStart = 0;
let windowCount = 0;
const RATE_LIMIT = 30;
const WINDOW_MS = 60_000;

export default defineEventHandler(async (event) => {
  const origin = getHeader(event, "origin");
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    setHeader(event, "Access-Control-Allow-Origin", origin);
    setHeader(event, "Vary", "Origin");
  }
  setHeader(event, "Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");

  const now = Date.now();
  if (now - windowStart > WINDOW_MS) {
    windowStart = now;
    windowCount = 0;
  }
  windowCount += 1;
  if (windowCount > RATE_LIMIT) {
    setHeader(event, "Retry-After", "60");
    return { error: "Rate limited", entries: [] };
  }

  const query = getQuery(event);
  const parsed = leaderboardIdSchema.safeParse(
    typeof query.id === "string" ? query.id : "",
  );

  if (!parsed.success) {
    return { error: "Invalid leaderboard id", entries: [] };
  }
  const id = parsed.data;

  try {
    const res = await fetch(
      `https://api.eliteskyblock.com/leaderboard/${encodeURIComponent(id)}?limit=100`,
      {
        headers: {
          "User-Agent": "SkyForgeAdvisor/1.0 (Mozilla/5.0)",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(8000),
      },
    );

    if (!res.ok) {
      return { id, entries: [], error: `Upstream ${res.status}` };
    }

    const data = await res.json();
    if (data && Array.isArray(data.entries)) {
      const entries = data.entries.slice(0, 100).map((entry: unknown, idx: number) => {
        if (entry && typeof entry === "object") {
          const { ...rest } = entry as Record<string, unknown>;
          return { ...rest, rank: idx + 1 };
        }
        return { rank: idx + 1 };
      });
      return { ...data, id, entries };
    }

    return data;
  } catch (err) {
    console.error(`Failed to proxy elite leaderboard for ${id}:`, err);
    return { id, entries: [], error: "Upstream unavailable" };
  }
});
