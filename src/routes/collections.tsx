import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { ConnectPrompt, ErrorState, LoadState } from "@/components/data-states";
import { Chip, PageHero, Panel, ProgressBar, StatRow } from "@/components/layout/app-shell";
import { ItemIcon } from "@/components/ui/item-icon";
import { usePlayer } from "@/hooks/use-account";
import { formatFull } from "@/lib/skyblock";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Collections — SkyBlock Assistant" },
      {
        name: "description",
        content: "Categorized collection tracking and live completion progress for your SkyBlock profile.",
      },
      { property: "og:title", content: "Collections — SkyBlock Assistant" },
      {
        property: "og:description",
        content: "Track collection categories and item progress from your connected SkyBlock profile.",
      },
    ],
  }),
  component: Collections,
});

/**
 * Maps items that Hypixel puts in unconventional API categories or unique IDs directly to standard Skill categories
 */
const CATEGORY_OVERRIDES: Record<string, string> = {
  // Mining
  END_STONE: "Mining",
  ENDSTONE: "Mining",
  HARD_STONE: "Mining",
  GLOWSTONE: "Mining",
  QUARTZ: "Mining",

  // Foraging
  LUSH_LILAC: "Foraging",
  "LUSH LILAC": "Foraging",
  LILAC: "Foraging",
  PEONY: "Foraging",
  ROSE_BUSH: "Foraging",
  DOUBLE_PLANT: "Foraging",

  // Farming
  SUNFLOWER: "Farming",
  POPPY: "Farming",
  DANDELION: "Farming",
};

/**
 * Ensures collection display names map cleanly to texture asset IDs
 */
const CATEGORY_ITEM_IDS: Record<string, string> = {
  "End Stone": "ENDSTONE",
  "Lush Lilac": "DOUBLE_PLANT",
  "Lilac": "DOUBLE_PLANT",
  "Peony": "DOUBLE_PLANT",
  "Rose Bush": "DOUBLE_PLANT",
  "Sunflower": "DOUBLE_PLANT",
  "Redstone Dust": "REDSTONE",
  "Sugar Cane": "SUGAR_CANE",
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
  if (amount <= 0) return { tier: "Tier I", pct: 0, nextGoal: 50 };

  const tiers = [50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000];
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
    pct,
    nextGoal,
  };
}

function Collections() {
  const { data, isLoading, error, connected } = usePlayer();
  const [active, setActive] = useState("All");

  const collections = data?.collections ?? [];

  const categories = useMemo(() => {
    const map = new Map<
      string,
      { name: string; total: number; items: { name: string; amount: number }[] }
    >();

    for (const collection of collections) {
      const rawId = collection.name.toUpperCase().replace(/\s+/g, "_");
      const rawNameUpper = collection.name.toUpperCase().trim();

      // Check explicit overrides by raw snake_case ID or string name
      const categoryName =
        CATEGORY_OVERRIDES[rawId] ||
        CATEGORY_OVERRIDES[rawNameUpper] ||
        collection.category ||
        "Boss & Misc";

      const existing = map.get(categoryName);
      if (existing) {
        existing.total += collection.amount;
        existing.items.push({ name: collection.name, amount: collection.amount });
      } else {
        map.set(categoryName, {
          name: categoryName,
          total: collection.amount,
          items: [{ name: collection.name, amount: collection.amount }],
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [collections]);

  const visibleCategories =
    active === "All"
      ? categories
      : categories.filter((category) => category.name === active);

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
                sub: data.profiles.find((p) => p.profileId === data.activeProfileId)?.cuteName ?? "",
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
                        const { tier, pct } = getCollectionTier(item.amount);
                        const itemId =
                          CATEGORY_ITEM_IDS[item.name] || item.name.toUpperCase().replace(/\s+/g, "_");

                        return (
                          <li
                            key={item.name}
                            className="glass-soft rounded-xl px-4 py-3 space-y-2 border border-border/40 hover:border-primary/30"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                {/* Explicitly sized icon wrapper (size-6 = 24px) */}
                                <div className="size-6 shrink-0 flex items-center justify-center">
                                  <ItemIcon
                                    id={itemId}
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
                          </li>
                        );
                      })}
                    </ul>
                  </Panel>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}