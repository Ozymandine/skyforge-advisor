// src/routes/index.tsx
// Landing page — the storefront. Live proof (real flips from public data),
// feature grid, and a 2-step get-started strip. No connect wall.

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { IconArrowRight, IconSearch, IconTrendingUp } from "@/assets/icons";

import { Panel } from "@/components/layout/app-shell";
import { ItemIcon } from "@/components/ui/item-icon";
import { fetchBazaar, fetchElection, fetchFireSale, fetchNews } from "@/lib/hypixel.functions";
import { formatNumber } from "@/lib/skyblock";
import { useAccount, useConnectPlayer } from "@/hooks/use-account";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkyForge — Live SkyBlock stats, flips & progression" },
      {
        name: "description",
        content:
          "Live Hypixel SkyBlock profile stats, Bazaar order quotes, a full item wiki, crafting cost trees and net worth tracking. No login.",
      },
      { property: "og:title", content: "SkyForge — Live SkyBlock stats, flips & progression" },
      {
        property: "og:description",
        content:
          "Live Hypixel SkyBlock profile stats, Bazaar order quotes, item wiki and net worth tracking.",
      },
      { property: "og:url", content: "https://skyforge-advisor.vercel.app/" },
      {
        property: "og:image",
        content: "https://skyforge-advisor.vercel.app/og-image.png",
      },
      {
        name: "twitter:title",
        content: "SkyForge — Live SkyBlock stats, flips & progression",
      },
      {
        name: "twitter:image",
        content: "https://skyforge-advisor.vercel.app/og-image.png",
      },
    ],
    links: [{ rel: "canonical", href: "https://skyforge-advisor.vercel.app/" }],
  }),
  component: Landing,
});

const features = [
  { to: "/dashboard", sprite: "compass", title: "Dashboard" },
  { to: "/advisor", sprite: "ender_eye", title: "Advisor" },
  { to: "/simulator", sprite: "iron_sword", title: "Damage Simulator" },
  { to: "/calendar", sprite: "clock", title: "Calendar" },
  { to: "/wiki", sprite: "book", title: "Item Wiki" },
  { to: "/crafting", sprite: "crafting_table", title: "Crafting" },
] as const;

function Landing() {
  const navigate = useNavigate();
  const [searchIgn, setSearchIgn] = useState("");

  const account = useAccount();
  const { connect, connecting, error, clearError } = useConnectPlayer();

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    const player = await connect(searchIgn);
    if (player) await navigate({ to: "/profile/$username", params: { username: player.username } });
  }

  // Live proof: real flips + accuracy from public endpoints (no key needed).
  const bazaarQuery = useQuery({
    queryKey: ["bazaar"],
    queryFn: () => fetchBazaar(),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  // Site-wide Hypixel context: mayor, news, fire sale (long-cached).
  const electionQuery = useQuery({
    queryKey: ["election"],
    queryFn: () => fetchElection(),
    staleTime: 30 * 60_000,
  });
  const newsQuery = useQuery({
    queryKey: ["sb-news"],
    queryFn: () => fetchNews(),
    staleTime: 60 * 60_000,
  });
  const fireSaleQuery = useQuery({
    queryKey: ["fire-sale"],
    queryFn: () => fetchFireSale(),
    staleTime: 30 * 60_000,
  });

  const mayor = electionQuery.data?.mayor;
  const news = (newsQuery.data ?? []).slice(0, 2);
  const fireSale = (fireSaleQuery.data ?? []).slice(0, 4);

  const topFlips = (bazaarQuery.data?.stale ? [] : (bazaarQuery.data?.products ?? []))
    .slice()
    .filter((item) => item.spread > 0)
    .sort((a, b) => b.buyMovingWeek - a.buyMovingWeek)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-8">
      <section className="panel-card rounded-2xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            {account.connected ? "SkyForge" : "Connect your profile"}
          </h1>
          <form
            onSubmit={(event) => void handleSearch(event)}
            className="mt-5 flex flex-col gap-2 sm:flex-row"
          >
            <div className="relative min-w-0 flex-1">
              <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <label htmlFor="hero-username" className="sr-only">
                Minecraft username
              </label>
              <input
                id="hero-username"
                value={searchIgn}
                onChange={(event) => {
                  setSearchIgn(event.target.value);
                  clearError();
                }}
                placeholder={account.username || "Minecraft username"}
                autoComplete="username"
                autoCapitalize="off"
                spellCheck={false}
                maxLength={16}
                required
                disabled={connecting}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "hero-connection-error" : undefined}
                className="w-full rounded-lg border border-input bg-background/65 py-3 pl-10 pr-3 text-foreground outline-none placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring"
              />
            </div>
            <button
              type="submit"
              disabled={connecting}
              className="rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
            >
              {connecting ? "Connecting…" : "Connect profile"}
            </button>
          </form>
          {error && (
            <p id="hero-connection-error" role="alert" className="mt-2 text-sm text-destructive">
              {error}
            </p>
          )}
          {account.connected && (
            <Link
              to="/dashboard"
              className="mt-3 inline-flex w-fit items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Open dashboard <IconArrowRight className="size-4" />
            </Link>
          )}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <span>Popular profiles</span>
            {["Deathstreeks", "Refraction", "Hellcastle", "56ms"].map((name) => (
              <Link
                key={name}
                to="/profile/$username"
                params={{ username: name }}
                className="rounded-md border border-border px-2 py-1 transition-colors hover:bg-primary/10 hover:text-primary"
              >
                {name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Hypixel context strip: mayor, fire sale, news */}
      {(mayor || fireSale.length > 0 || news.length > 0) && (
        <section className="grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(14rem,1fr))]">
          {mayor && (
            <Panel className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Current mayor
              </p>
              <p className="font-pixel mt-1.5 text-xl font-semibold text-amber-300">
                {mayor.name ?? "—"}
              </p>
              {(mayor.perks ?? []).slice(0, 2).map((perk) => (
                <p key={perk.name} className="mt-1 text-[11px] text-muted-foreground">
                  <span className="font-semibold text-foreground/80">{perk.name}</span>
                  {perk.description ? ` · ${perk.description.replace(/§./g, "")}` : ""}
                </p>
              ))}
            </Panel>
          )}

          {fireSale.length > 0 && (
            <Panel className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Fire sale
              </p>
              <div className="mt-2 space-y-2">
                {fireSale.map((sale) => (
                  <div key={sale.item_id} className="flex items-center gap-2">
                    <ItemIcon id={sale.item_id!} name={sale.item_id!} className="size-6" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium capitalize">
                        {sale.item_id!.replace(/_/g, " ").toLowerCase()}
                      </p>
                      {sale.end && (
                        <p className="font-mono text-[10px] text-muted-foreground">
                          ends {new Date(sale.end).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {news.length > 0 && (
            <Panel className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                SkyBlock news
              </p>
              <div className="mt-2 space-y-3">
                {news.map((item) => (
                  <div key={item.title}>
                    <p className="text-xs font-semibold">{item.title}</p>
                    {item.text && (
                      <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                        {item.text}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </section>
      )}

      {/* Live proof: real flips right now */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <IconTrendingUp className="size-5 text-primary" /> Bazaar order spreads
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Estimated net spread per unit if both orders fill.
            </p>
          </div>
          <Link
            to="/flips"
            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            Open the flip board <IconArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {topFlips.map((p) => (
            <Link
              key={p.id}
              to="/flips"
              aria-label={`${p.name}: +${formatNumber(p.spread)} coins estimated net spread per unit. Open the flip board.`}
              className="glass-soft group rounded-2xl p-4 transition-all duration-75 ease-out hover:scale-[1.02] hover:border-primary/40"
            >
              <div className="flex items-center gap-3">
                <ItemIcon id={p.id} name={p.name} className="size-8 shrink-0" />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{p.name}</span>
              </div>
              <p className="mt-3 font-mono text-2xl font-black text-emerald-300">
                +{formatNumber(p.spread)}
                <span className="ml-1 text-xs font-semibold text-muted-foreground"> per unit</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Margin {p.margin.toFixed(1)}% · {formatNumber(p.buyMovingWeek)} bought/wk
              </p>
            </Link>
          ))}
          {topFlips.length === 0 && (
            <p role="status" className="text-sm text-muted-foreground">
              {bazaarQuery.isPending
                ? "Loading Bazaar quotes…"
                : "No current Bazaar spreads are available."}
            </p>
          )}
        </div>
      </section>

      <nav
        aria-label="SkyForge tools"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
      >
        {features.map(({ to, sprite, title }) => (
          <Link
            key={to}
            to={to}
            className="panel-card game-tile flex items-center gap-2 rounded-xl p-3 text-sm font-semibold"
          >
            <img
              src={`/vanilla/${sprite}.png`}
              alt=""
              width={22}
              height={22}
              className="shrink-0 [image-rendering:pixelated]"
            />
            {title}
          </Link>
        ))}
      </nav>
    </div>
  );
}
