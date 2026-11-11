// src/routes/about.tsx
// Trust surface: what data we use, where it comes from, how keys are handled,
// and how estimates are labeled. Linked from the connect flow and footer.

import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHero, Panel } from "@/components/layout/app-shell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About SkyForge — Zero Invented Numbers" },
      {
        name: "description",
        content:
          "SkyForge is a real-time SkyBlock advisor and tracker. SkyBlock data from the Hypixel API with clearly labeled estimates.",
      },
    ],
  }),
  component: AboutPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass rounded-3xl p-6 sm:p-8">
      <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHero
        title="About SkyForge"
        description="SkyBlock profile lookup, market quotes, and item reference."
      />

      <Section title="Profile lookup">
        <p>
          SkyForge resolves your Minecraft username to a player ID and uses its server-side Hypixel
          application credential to read public SkyBlock profile data.
        </p>
      </Section>

      <Section title="Estimates vs market prices">
        <p>
          Values anchored to a live market price are labeled{" "}
          <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-1.5 text-[10px] font-bold text-emerald-300">
            MARKET-ANCHORED
          </span>{" "}
          — the base price comes straight from current orders.
        </p>
        <p>
          Items valued by their upgrades alone (enchantments, hot potato books, dungeon stars) are
          labeled{" "}
          <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-1.5 text-[10px] font-bold text-amber-300">
            ESTIMATE
          </span>{" "}
          — these use transparent per-enchant price tables and should be treated as ballpark
          figures.
        </p>
      </Section>

      <Section title="Market quotes">
        <p>
          Bazaar spreads are per-unit estimates based on Hypixel quotes and an assumed 1.25% sell
          fee. They assume both orders fill at the displayed prices. Auction House shows a sample of
          active listings and their asking prices or bids.
        </p>
      </Section>

      <Section title="Privacy">
        <p>
          No accounts, no tracking pixels, no analytics scripts. Your username, watchlist and goals
          live in your browser; server-side stores hold only anonymous market samples and alert
          rules. Delete everything at any time via Settings → Disconnect.
        </p>
      </Section>

      <div className="pb-4">
        <Link to="/" className="text-sm text-muted-foreground transition hover:text-foreground">
          ← Back home
        </Link>
      </div>
    </div>
  );
}
