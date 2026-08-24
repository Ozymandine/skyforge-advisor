// src/routes/about.tsx
// Trust surface: what data we use, where it comes from, how keys are handled,
// and how estimates are labeled. Linked from the connect flow and footer.

import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHero, Panel } from "@/components/layout/app-shell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About & Data — SkyForge" },
      {
        name: "description",
        content:
          "Where SkyForge's data comes from (Hypixel API + NEU), how API keys are handled, and how estimates are labeled.",
      },
    ],
  }),
  component: About,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Panel>
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </Panel>
  );
}

function About() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHero
        eyebrow="Transparency"
        title="About & data"
        description="Exactly what this site uses, where it comes from, and what stays on your device."
      />

      <Section title="Where the data comes from">
        <p>
          Everything shown is derived from two sources: the{" "}
          <span className="font-medium text-foreground">official Hypixel API</span> (items, Bazaar,
          Auction House, player profiles) and the{" "}
          <span className="font-medium text-foreground">NotEnoughUpdates community dataset</span>{" "}
          (recipes, item lore, stats, abilities, requirements, crafting grids).
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
            href="https://developer.hypixel.net/api-key"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            developer.hypixel.net/api-key
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
