// server/api/leaderboard.ts
// Proxy endpoint for Elite SkyBlock leaderboards to bypass client-side CORS.
// Registered as a Nitro handler in vite.config.ts (route: /api/leaderboard).

import { defineEventHandler, getQuery, setHeader } from "h3";

export default defineEventHandler(async (event) => {
  setHeader(event, "Access-Control-Allow-Origin", "*");
  setHeader(event, "Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");

  const query = getQuery(event);
  const id = typeof query.id === "string" ? query.id.trim() : "";

  if (!id) {
    return { error: "Missing leaderboard id query parameter", entries: [] };
  }

  try {
    const res = await fetch(`https://api.eliteskyblock.com/leaderboard/${encodeURIComponent(id)}?limit=100`, {
      headers: {
        "User-Agent": "SkyForgeAdvisor/1.0 (Mozilla/5.0)",
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return { id, entries: [] };
    }

    const data = await res.json();
    if (data && Array.isArray(data.entries)) {
      data.entries = data.entries.map((entry: any, idx: number) => ({
        ...entry,
        rank: idx + 1,
      }));
    }

    return data;
  } catch (err) {
    console.error(`Failed to proxy elite leaderboard for ${id}:`, err);
    return { id, entries: [] };
  }
});
