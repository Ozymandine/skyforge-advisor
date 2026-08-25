// src/routes/about.tsx
// Trust surface: what data we use, where it comes from, how keys are handled,
// and how estimates are labeled. Linked from the connect flow and footer.

import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHero, Panel } from "@/components/layout/app-shell";
import { DEVELOPER_DASHBOARD_URL } from "@/lib/constants";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About SkyForge — Zero Invented Numbers" },
      {
        name: "description",
        content:
          "SkyForge is a real-time SkyBlock advisor and tracker. Direct from the Hypixel API, zero estimation where real numbers exist, BYOK privacy.",
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
        eyebrow="Provenance & Philosophy"
        title="About SkyForge"
        description="A real-time SkyBlock companion built on the principles of precision, live market samples, and complete client-side privacy."
      />

      <Section title="Zero invented numbers">
        <p>
          SkyBlock players make multi-million coin decisions based on tool data. When a tool
          guesses, players lose coins.
        </p>
        <p>
          SkyForge is built on a strict rule: every stat, recipe, multiplier, and price is either
          pulled directly from the official Hypixel API, verified against game constants, or
          computed from live market samples.
        </p>
        <p>
          When a value is unknown, we show a dash or "Not available" — we never invent numbers.
          Price history and flip-accuracy records are built from real samples recorded since the
          site started tracking, not backfilled.
        </p>
      </Section>

      <Section title="Your API key">
        <p>
          To load your profile, SkyForge uses a Hypixel API key. You generate it yourself in one
          click at{" "}
          <a
            href={DEVELOPER_DASHBOARD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            developer.hypixel.net/dashboard
          </a>{" "}
          — it's free and tied to your Minecraft account.
        </p>
        <p>
          Your key is stored{" "}
          <span className="font-medium text-foreground">only in your browser</span> (localStorage)
          and is used solely to call the Hypixel API. It is never sent to any third-party service.
          Clearing your browser data removes it completely.
        </p>
        <p>
          If you don't add a key, profile pages may use a shared server-side key with strict
          caching. Market pages (Bazaar, Auction House, Wiki, Crafting) never need a key at all.
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

      <Section title="Flip suggestions & accuracy">
        <p>
          Flip suggestions are generated from live market spreads (Bazaar order margins after the
          1.25% tax, and Auction listings under their lowest BIN). Every suggestion is logged and
          later re-priced against the real market — the{" "}
          <Link to="/flips" className="text-primary hover:underline">
            flips page
          </Link>{" "}
          publishes the actual win rate and average realized margin, good or bad. No cherry-picking.
        </p>
      </Section>

      <Section title="Privacy">
        <p>
          No accounts, no tracking pixels, no analytics scripts. Your username, API key, watchlist
          and goals live in your browser; server-side stores hold only anonymous market samples and
          alert rules. Delete everything at any time via Settings → Disconnect.
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
