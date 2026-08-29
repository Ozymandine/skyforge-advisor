import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { ConnectPrompt, ErrorState, LoadState } from "@/components/data-states";
import { Chip, PageHero, Panel, ProgressBar, StatRow } from "@/components/layout/app-shell";
import { ItemIcon } from "@/components/ui/item-icon";
import { TierTrack } from "@/components/progression-visuals";
import { usePlayer } from "@/hooks/use-account";
import { formatFull } from "@/lib/skyblock";
import { calculateMinionSlotRoadmap, calculateBankInterest } from "@/lib/collections-roadmap";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Collections — SkyBlock Assistant" },
      {
        name: "description",
        content:
          "Categorized collection tracking and live completion progress for your SkyBlock profile.",
      },
      { property: "og:title", content: "Collections — SkyBlock Assistant" },
      {
        property: "og:description",
        content:
          "Track collection categories and item progress from your connected SkyBlock profile.",
      },
    ],
  }),
  component: Collections,
});

/**
 * Normalized override lookup keys (all uppercase, NO spaces or special characters)
 */
const CATEGORY_OVERRIDES: Record<string, string> = {
  // Foraging
  LUSHLILAC: "Foraging",
  LILAC: "Foraging",
  PEONY: "Foraging",
  ROSEBUSH: "Foraging",
  DOUBLEPLANT: "Foraging",
  FIGLOG: "Foraging",

  // Mining
  ENDSTONE: "Mining",
  HARDSTONE: "Mining",
  GLOWSTONE: "Mining",
  QUARTZ: "Mining",
  LAPISLAZULI: "Mining",
  LAPIS: "Mining",

  // Farming
  SUNFLOWER: "Farming",
  POPPY: "Farming",
  DANDELION: "Farming",
};

// Helper to convert tier numbers to Roman Numerals (e.g., 7 -> VII)
function toRoman(num: number): string {
  const map: [number, string][] = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let res = "";
  for (const [val, roman] of map) {
    while (num >= val) {
      res += roman;
      num -= val;
    }
  }
  return res || "I";
}

// Estimates tier & next level target based on collected quantity
function getCollectionTier(amount: number) {
  if (amount <= 0) return { tier: "Tier I", tierNumber: 0, pct: 0, nextGoal: 50 };

  const tiers = [
    50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000,
  ];
  let currentTier = 1;
  let prevGoal = 0;
  let nextGoal = tiers[0]!;

  for (let i = 0; i < tiers.length; i++) {
    if (amount >= tiers[i]!) {
      currentTier = i + 1;
      prevGoal = tiers[i]!;
      nextGoal = tiers[i + 1] ?? tiers[i]! * 2;
    } else {
      nextGoal = tiers[i]!;
      break;
    }
  }

  const range = nextGoal - prevGoal;
  const progress = amount - prevGoal;
  const pct = Math.min(100, Math.max(5, Math.round((progress / range) * 100)));

  return {
    tier: `Tier ${toRoman(currentTier)}`,
    tierNumber: currentTier,
    pct,
    nextGoal,
  };
}

function Collections() {
  const { data, isLoading, error, connected } = usePlayer();
  const [active, setActive] = useState("All");

  const rawCollections = data?.collections;
  const collections = useMemo(() => rawCollections ?? [], [rawCollections]);

  const categories = useMemo(() => {
    const map = new Map<
      string,
      { name: string; total: number; items: { id: string; name: string; amount: number }[] }
    >();

    for (const collection of collections) {
      // Clean string by removing spaces & special characters for 100% resilient matching
      const keyClean = collection.name.toUpperCase().replace(/[^A-Z0-9]/g, "");

      // Determine category with normalized key
      const categoryName = CATEGORY_OVERRIDES[keyClean] || collection.category || "Boss & Misc";

      const existing = map.get(categoryName);
      if (existing) {
        existing.total += collection.amount;
        existing.items.push({
          id: collection.id,
          name: collection.name,
          amount: collection.amount,
        });
      } else {
        map.set(categoryName, {
          name: categoryName,
          total: collection.amount,
          items: [{ id: collection.id, name: collection.name, amount: collection.amount }],
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [collections]);

  const visibleCategories =
    active === "All" ? categories : categories.filter((category) => category.name === active);

  const totalAmount = collections.reduce((sum, collection) => sum + collection.amount, 0);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHero
        eyebrow="Progression"
        title="Collections"
        description="Every collection category, tier unlock and completion percentage in one place."
      />

      {!connected && <ConnectPrompt what="your live collections" />}
      {connected && isLoading && <LoadState>Loading collections from Hypixel…</LoadState>}
      {connected && error && <ErrorState error={error} />}

      {connected && data && (
        <>
          <StatRow
            stats={[
              { label: "Categories", value: String(categories.length), sub: "Tracked groups" },
              { label: "Collection rows", value: String(collections.length), sub: "Unique items" },
              { label: "Total amount", value: formatFull(totalAmount), sub: "Collected quantity" },
              {
                label: "Profile",
                value: data.username,
                sub:
                  data.profiles.find((p) => p.profileId === data.activeProfileId)?.cuteName ?? "",
              },
            ]}
          />

          <div className="flex flex-wrap gap-2">
            {["All", ...categories.map((category) => category.name)].map((category) => (
              <Chip key={category} active={active === category} onClick={() => setActive(category)}>
                {category}
              </Chip>
            ))}
          </div>

          {visibleCategories.length === 0 ? (
            <Panel>
              <p className="text-sm text-muted-foreground">
                No collection data is available for this profile. Make sure collection sharing is
                enabled in SkyBlock and refresh the page.
              </p>
            </Panel>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {visibleCategories.map((category) => {
                const unlockedCount = category.items.filter((i) => i.amount > 0).length;
                return (
                  <Panel key={category.name}>
                    <div className="flex items-baseline justify-between">
                      <h2 className="text-xl font-semibold">{category.name}</h2>
                      <p className="text-xs text-muted-foreground">
                        {unlockedCount} / {category.items.length} unlocked
                      </p>
                    </div>

                    <div className="mt-2">
                      <ProgressBar
                        pct={Math.round((unlockedCount / (category.items.length || 1)) * 100)}
                      />
                    </div>

                    <ul className="mt-6 space-y-3">
                      {category.items.map((item) => {
                        const { tier, tierNumber, pct } = getCollectionTier(item.amount);
                        return (
                          <li
                            key={item.name}
                            className="glass-soft rounded-xl px-4 py-3 space-y-2 border border-border/40 hover:border-primary/30"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="size-6 shrink-0 flex items-center justify-center">
                                  <ItemIcon
                                    id={item.id}
                                    name={item.name}
                                    className="size-6 hover:scale-100 transition-none"
                                  />
                                </div>
                                <p className="text-sm font-medium truncate">
                                  {item.name}{" "}
                                  <span className="text-xs font-normal text-muted-foreground">
                                    {tier}
                                  </span>
                                </p>
                              </div>
                              <p className="font-mono text-xs text-muted-foreground shrink-0">
                                {formatFull(item.amount)}
                              </p>
                            </div>
                            <ProgressBar pct={pct} />
                            <TierTrack currentTier={tierNumber} label="Tier track" />
                          </li>
                        );
                      })}
                    </ul>
                  </Panel>
                );
              })}
            </div>
          )}

          {/* Minion Slot Unlock Roadmap */}
          <Panel className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.04] via-transparent to-teal-500/[0.02]">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Minion Slot Unlock Roadmap</h2>
                <p className="text-xs text-white/50">
                  Unique minion crafting thresholds for profile expansion
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {calculateMinionSlotRoadmap(510)
                .milestones.slice(3)
                .map((m) => (
                  <div
                    key={m.slotsCount}
                    className="rounded-xl border border-white/5 bg-black/30 p-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{m.slotsCount} Slots</span>
                      <span
                        className={
                          m.unlocked ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"
                        }
                      >
                        {m.unlocked ? "UNLOCKED" : `${m.uniqueCraftsRemaining} left`}
                      </span>
                    </div>
                    <p className="text-white/50 text-[11px] mt-1">
                      {m.uniqueCraftsRequired} unique crafts
                    </p>
                  </div>
                ))}
            </div>
          </Panel>

          {/* Personal Bank Interest Optimizer */}
          <Panel className="border-amber-500/20 bg-gradient-to-br from-amber-500/[0.04] via-transparent to-yellow-500/[0.02]">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Personal Bank Gold Interest Optimizer
                </h2>
                <p className="text-xs text-white/50">
                  Maximize 2% seasonal interest caps every 31 SkyBlock days
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { tier: "Starter", cap: 200_000, req: 10_000_000 },
                { tier: "Gold", cap: 300_000, req: 15_000_000 },
                { tier: "Deluxe", cap: 500_000, req: 25_000_000 },
                { tier: "Super Deluxe", cap: 1_000_000, req: 50_000_000 },
                { tier: "Premier", cap: 2_000_000, req: 100_000_000 },
              ].map((b) => (
                <div
                  key={b.tier}
                  className="rounded-xl border border-white/5 bg-black/30 p-3 text-xs"
                >
                  <h3 className="font-bold text-white">{b.tier} Account</h3>
                  <p className="text-amber-300 font-mono font-bold mt-1">
                    +{formatFull(b.cap)} Interest
                  </p>
                  <p className="text-white/40 text-[11px] mt-0.5">
                    Optimal Balance: {formatFull(b.req)}
                  </p>
                </div>
              ))}
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}
