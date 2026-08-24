// src/routes/cron-sample.tsx
// Cron ping target: any GET hit (uptime monitor, Cloudflare cron worker, or a
// browser tab) triggers a server-side market history sample. Sampling is
// throttled server-side to one sample per 5 minutes, so frequent pings are
// harmless. Render output is intentionally empty.

import { createFileRoute } from "@tanstack/react-router";
import { sampleMarket } from "@/lib/hypixel.functions";

export const Route = createFileRoute("/cron-sample")({
  head: () => ({
    meta: [{ title: "cron" }],
  }),
  loader: async () => {
    // Runs client-side (SPA mode) — the server function call itself executes
    // on the server, which is what records the sample.
    try {
      await sampleMarket();
    } catch {
      // Never surface errors to the ping.
    }
    return null;
  },
  component: () => null,
});
