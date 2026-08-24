import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { ErrorState, LoadState } from "@/components/data-states";
import { WikiItemIcon } from "@/components/wiki/WikiItemIcon";
import { cn } from "@/lib/utils";
import { titleCase } from "@/lib/skyblock";

import { fetchItemDetail } from "@/lib/hypixel.functions";

export const Route = createFileRoute("/wiki/$itemId")({
  head: () => ({
    meta: [{ title: "Item Encyclopedia — SkyBlock Assistant" }],
  }),
  component: ItemEncyclopediaPage,
});

const RARITY_COLORS: Record<string, string> = {
  COMMON: "text-zinc-300 border-zinc-500/40 bg-zinc-500/10",
  UNCOMMON: "text-emerald-300 border-emerald-500/40 bg-emerald-500/10",
  RARE: "text-sky-300 border-sky-500/40 bg-sky-500/10",
  EPIC: "text-violet-300 border-violet-500/40 bg-violet-500/10",
  LEGENDARY: "text-amber-300 border-amber-500/40 bg-amber-500/10",
  MYTHIC: "text-pink-300 border-pink-500/40 bg-pink-500/10",
  DIVINE: "text-cyan-200 border-cyan-300/40 bg-cyan-300/10",
  SPECIAL: "text-red-300 border-red-500/40 bg-red-500/10",
  "VERY SPECIAL": "text-red-200 border-red-400/50 bg-red-400/10",
};

function fmt(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (Math.abs(n) >= 1e3) return `${(n / 1e3).toFixed(1)}k`;
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/50">
        {title}
      </h2>
      {children}
    </section>
  );
}

function ItemEncyclopediaPage() {
  const { itemId } = Route.useParams();

  const detailQuery = useQuery({
    queryKey: ["item-detail", itemId],
    queryFn: () => fetchItemDetail({ data: itemId }),
    staleTime: 30 * 60_000,
  });

  const item = detailQuery.data?.item ?? null;
  const extra = detailQuery.data?.extra ?? null;
  const usedIn = detailQuery.data?.usedIn ?? [];

  // Visual 3x3 crafting grid from NEU data.
  const gridCells = useMemo(() => {
    if (!extra?.grid) return null;
    return ["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3"].map((slot) => {
      const raw = (extra.grid as Record<string, unknown>)[slot];
      if (typeof raw !== "string" || !raw) return null;
      const [id, amountRaw] = raw.split(":");
      return id ? { id, amount: Number(amountRaw ?? 1) || 1 } : null;
    });
  }, [extra]);

  if (detailQuery.isLoading) {
    return <LoadState>Loading item encyclopedia…</LoadState>;
  }

  if (detailQuery.error) {
    return <ErrorState error={detailQuery.error} />;
  }

  if (!item) {
    return (
      <div className="mx-auto max-w-xl p-10 text-center">
        <h1 className="text-2xl font-bold">Item not found</h1>
        <p className="mt-2 text-white/60">No SkyBlock item matches “{itemId}”.</p>
        <Link
          to="/wiki"
          className="mt-6 inline-block rounded-full border border-primary/40 bg-primary/15 px-6 py-2 text-sm font-medium text-primary hover:bg-primary/25"
        >
          Back to the Wiki
        </Link>
      </div>
    );
  }

  const rarityClass = RARITY_COLORS[item.rarity.toUpperCase()] ?? RARITY_COLORS["COMMON"]!;

  const descriptionLines = Array.isArray(item.description)
    ? item.description
    : item.description
      ? [item.description]
      : [];

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      {/* Header */}
      <header className="flex flex-wrap items-center gap-5">
        <WikiItemIcon
          id={item.id}
          name={item.name}
          category={item.category}
          className="h-20 w-20 shrink-0"
        />
        <div className="min-w-0">
          <h1 className="truncate text-3xl font-black tracking-tight">{item.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span
              className={cn(
                "rounded-full border px-3 py-1 font-semibold uppercase tracking-wide",
                rarityClass,
              )}
            >
              {item.rarity}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
              {item.category}
            </span>
            <code className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-white/50">
              {item.id}
            </code>
            {extra?.wikiUrl ? (
              <a
                href={extra.wikiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/50 transition hover:text-white"
              >
                Official wiki ↗
              </a>
            ) : null}
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Description / lore */}
        {descriptionLines.length > 0 ? (
          <Section title="Description">
            <div className="space-y-1 text-sm leading-relaxed text-white/80">
              {descriptionLines.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </Section>
        ) : null}

        {/* Stats */}
        {item.stats && Object.keys(item.stats).length > 0 ? (
          <Section title="Stats">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {Object.entries(item.stats).map(([key, value]) => (
                <div key={key} className="flex justify-between gap-2">
                  <dt className="text-white/50">{key}</dt>
                  <dd className="font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </Section>
        ) : null}

        {/* Abilities */}
        {item.abilities && item.abilities.length > 0 ? (
          <Section title="Abilities">
            <div className="space-y-4">
              {item.abilities.map((ability, i) => (
                <div key={i}>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{ability.name}</span>
                    {ability.manaCost ? (
                      <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-xs text-sky-300">
                        {ability.manaCost} Mana
                      </span>
                    ) : null}
                    {ability.cooldown ? (
                      <span className="rounded-full bg-orange-500/15 px-2 py-0.5 text-xs text-orange-300">
                        {ability.cooldown}s CD
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 whitespace-pre-line text-sm text-white/70">
                    {Array.isArray(ability.description)
                      ? ability.description.join(" · ")
                      : ability.description}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {/* Requirements */}
        {item.requirements && item.requirements.length > 0 ? (
          <Section title="Requirements">
            <ul className="flex flex-wrap gap-2 text-sm">
              {item.requirements.map((req, i) => (
                <li key={i} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1">
                  <span className="text-white/50">{req.type}</span>{" "}
                  <span className="font-semibold">
                    {req.level !== undefined ? req.level : req.value}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {/* Crafting grid */}
        {gridCells ? (
          <Section title="Crafting Recipe">
            <div className="flex flex-wrap items-center gap-6">
              <div className="grid w-fit grid-cols-3 gap-1 rounded-xl border border-white/10 bg-black/30 p-2">
                {gridCells.map((cell, i) => (
                  <div
                    key={i}
                    className="flex h-14 w-14 items-center justify-center rounded-md border border-white/10 bg-white/[0.04]"
                    title={cell ? `${cell.id} ×${cell.amount}` : undefined}
                  >
                    {cell ? (
                      <WikiItemIcon
                        id={cell.id}
                        name={titleCase(cell.id)}
                        category="Misc"
                        className="h-11 w-11"
                      />
                    ) : null}
                  </div>
                ))}
              </div>
              {extra?.craftText ? <p className="text-sm text-white/60">{extra.craftText}</p> : null}
            </div>
          </Section>
        ) : null}

        {/* Market */}
        <Section title="Live Market">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-white/50">NPC sell</dt>
              <dd className="font-semibold">{fmt(item.npcSell)} coins</dd>
            </div>
            {item.bazaar ? (
              <>
                <div className="flex justify-between gap-2">
                  <dt className="text-white/50">Bazaar buy</dt>
                  <dd className="font-semibold">{fmt(item.bazaar.buyPrice)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-white/50">Bazaar sell</dt>
                  <dd className="font-semibold">{fmt(item.bazaar.sellPrice)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-white/50">Weekly volume</dt>
                  <dd className="font-semibold">{fmt(item.volume ?? 0)}</dd>
                </div>
              </>
            ) : null}
            {item.auctionHouse ? (
              <>
                <div className="flex justify-between gap-2">
                  <dt className="text-white/50">Lowest BIN</dt>
                  <dd className="font-semibold">{fmt(item.auctionHouse.lowestBin)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-white/50">Median BIN</dt>
                  <dd className="font-semibold">{fmt(item.auctionHouse.medianBin)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-white/50">AH listings</dt>
                  <dd className="font-semibold">{item.auctionHouse.listings}</dd>
                </div>
              </>
            ) : null}
          </dl>
          {!item.bazaar && !item.auctionHouse ? (
            <p className="text-sm text-white/40">Not traded on the Bazaar or Auction House.</p>
          ) : null}
        </Section>

        {/* Used to craft */}
        {usedIn.length > 0 ? (
          <Section title={`Used to Craft (${usedIn.length})`}>
            <ul className="grid max-h-72 grid-cols-1 gap-1 overflow-y-auto pr-1 text-sm sm:grid-cols-2">
              {usedIn.map((entry) => (
                <li key={entry.id}>
                  <Link
                    to="/wiki/$itemId"
                    params={{ itemId: entry.id }}
                    className="flex items-center justify-between gap-2 rounded-lg border border-transparent px-2 py-1 transition hover:border-white/10 hover:bg-white/5"
                  >
                    <span className="truncate text-white/80">{entry.name}</span>
                    <span className="shrink-0 text-xs text-white/40">×{entry.amount}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}
      </div>

      <div className="pt-2">
        <Link to="/wiki" className="text-sm text-white/50 transition hover:text-white">
          ← Back to the Wiki
        </Link>
      </div>
    </div>
  );
}
