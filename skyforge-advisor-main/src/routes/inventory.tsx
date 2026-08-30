import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { IconCalculator, IconCheck, IconPlus, IconSearch } from "@/assets/icons";

import { ConnectPrompt, ErrorState, LoadState } from "@/components/data-states";
import {
  Chip,
  PageHero,
  Panel,
  ProgressBar,
  RarityTag,
  StatRow,
} from "@/components/layout/app-shell";
import { ItemIcon } from "@/components/ui/item-icon";
import { MinecraftTooltip } from "@/components/ui/minecraft-tooltip";
import { MinecraftItemCard } from "@/components/ui/minecraft-item-card";
import { playClickSound, playSlotHoverSound, playSuccessChime } from "@/lib/sound-effects";
import { RenderMinecraftLore } from "@/lib/minecraft-text";
import { usePlayer } from "@/hooks/use-account";
import {
  ACCESSORY_FAMILIES,
  MP_BY_RARITY,
  REFORGES,
  mpToDamageBonus,
  normalizeAccessoryName,
  type AccessoryRarity,
} from "@/lib/accessory-data";
import { formatNumber, formatFull } from "@/lib/skyblock";
import { cn } from "@/lib/utils";
import { getTopMpUpgrades, POWER_STONES, getRecombPriorities } from "@/lib/mp-optimizer";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — SkyBlock Assistant" },
      {
        name: "description",
        content:
          "Decoded viewer for Ender Chest, Wardrobe, Armor, Backpacks and Accessory Bag — plus accessory magical power and pet leveling calculators.",
      },
      { property: "og:title", content: "Inventory — SkyBlock Assistant" },
      {
        property: "og:description",
        content: "Browse every storage container, accessory and pet on your SkyBlock profile.",
      },
    ],
  }),
  component: Inventory,
});

type Mode = "containers" | "accessories" | "pets" | "profile";

/* ============================================================================
 * PET XP TABLE (cumulative XP required to reach each level, 1-100)
 * ========================================================================== */

const PET_XP_LEVELS = [
  0, 100, 275, 525, 850, 1250, 1725, 2275, 2900, 3600, 4375, 5225, 6150, 7150, 8225, 9375, 10600,
  11900, 13275, 14725, 16250, 17850, 19525, 21275, 23100, 25000, 26975, 29025, 31150, 33350, 35625,
  37975, 40400, 42900, 45475, 48125, 50850, 53650, 56525, 59475, 62500, 65600, 68775, 72025, 75350,
  78750, 82225, 85775, 89400, 93100, 96875, 100725, 104650, 108650, 112725, 116875, 121100, 125400,
  129775, 134225, 138750, 143350, 148025, 152775, 157600, 162500, 167475, 172525, 177650, 182850,
  188125, 193475, 198900, 204400, 209975, 215625, 221350, 227150, 233025, 238975, 245000, 251100,
  257275, 263525, 269850, 276250, 282725, 289275, 295900, 302600, 309375, 316225, 323150, 330150,
  337225, 344375, 351600, 358900, 366275, 373725, 381250,
];

function petXpForLevel(level: number) {
  return PET_XP_LEVELS[Math.min(99, Math.max(0, level))] ?? 0;
}

/** Total XP needed to go from `fromLevel` to `toLevel` at a given rarity multiplier. */
const RARITY_XP_MULT: Record<string, number> = {
  COMMON: 1,
  UNCOMMON: 1.5,
  RARE: 2,
  EPIC: 3,
  LEGENDARY: 4,
  MYTHIC: 5,
};

/* ============================================================================
 * PAGE
 * ========================================================================== */

function Inventory() {
  const { data, isLoading, error, connected } = usePlayer();
  const [mode, setMode] = useState<Mode>("containers");

  // Container viewer state
  const [tab, setTab] = useState<string | null>(null);
  const [selected, setSelected] = useState(0);

  const containers = useMemo(() => data?.containers ?? [], [data]);
  const current = containers.find((c) => c.id === tab) ?? containers[0];
  const item = current?.items.find((i) => i.slot === selected) ?? current?.items[0];

  const armorContainer = useMemo(() => containers.find((c) => c.id === "armor"), [containers]);
  const equipmentContainer = useMemo(
    () => containers.find((c) => c.id === "equipment"),
    [containers],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHero
        eyebrow="Progression"
        title="Inventory"
        description="Every container on the profile, decoded from the raw Hypixel item data — plus your accessories and pets."
      />

      {!connected && <ConnectPrompt what="your real inventories" />}
      {connected && !data && !error && <LoadState>Decoding inventory data…</LoadState>}
      {connected && error && <ErrorState error={error} />}

      {connected && data && (
        <>
          <div className="flex flex-wrap gap-2">
            <Chip active={mode === "containers"} onClick={() => setMode("containers")}>
              Containers
            </Chip>
            <Chip active={mode === "accessories"} onClick={() => setMode("accessories")}>
              Accessories & Magical Power
            </Chip>
            <Chip active={mode === "pets"} onClick={() => setMode("pets")}>
              Pets
            </Chip>
            <Chip active={mode === "profile"} onClick={() => setMode("profile")}>
              Museum & Achievements
            </Chip>
          </div>
          {mode === "containers" && (
            <>
              {containers.length === 0 ? (
                <Panel>
                  <p className="text-sm text-muted-foreground">
                    This profile does not share inventory data. Enable inventory API access in
                    SkyBlock (Settings → API Settings) and refresh.
                  </p>
                </Panel>
              ) : current ? (
                <>
                  <div className="flex flex-wrap gap-2">
                    {containers.map((c) => (
                      <Chip
                        key={c.id}
                        active={current.id === c.id}
                        onClick={() => {
                          setTab(c.id);
                          setSelected(0);
                        }}
                      >
                        {c.label} · {c.items.length}
                      </Chip>
                    ))}
                  </div>

                  <div className="grid gap-4 lg:grid-cols-3 items-start">
                    <Panel className="lg:col-span-2">
                      <div className="flex items-baseline justify-between">
                        <h2 className="text-xl font-semibold">{current.label}</h2>
                        <p className="text-xs text-muted-foreground">
                          {current.items.length} of {current.slots} slots used
                        </p>
                      </div>
                      <div className="mt-4">
                        <ProgressBar
                          pct={Math.round(
                            (current.items.length / Math.max(1, current.slots)) * 100,
                          )}
                        />
                      </div>
                      <div className="mt-5 grid grid-cols-9 gap-2 rounded-2xl border border-white/10 bg-black/50 p-3 shadow-inner">
                        {Array.from({ length: current.slots }).map((_, slot) => {
                          const slotItem = current.items.find((i) => i.slot === slot);
                          return (
                            <MinecraftTooltip
                              key={slot}
                              name={slotItem?.name ?? "Empty Slot"}
                              rarity={slotItem?.rarity ?? "COMMON"}
                              lore={slotItem?.lore}
                              disabled={!slotItem}
                            >
                              <button
                                onClick={() => {
                                  if (slotItem) {
                                    playClickSound();
                                    setSelected(slot);
                                  }
                                }}
                                onMouseEnter={() => {
                                  if (slotItem) playSlotHoverSound();
                                }}
                                className={cn(
                                  "group relative flex aspect-square w-full items-center justify-center rounded-xl border p-1 transition-none select-none",
                                  selected === slot
                                    ? "border-emerald-400 bg-emerald-500/25 ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-500/20"
                                    : slotItem
                                      ? "border-white/10 bg-white/[0.04] hover:border-emerald-400/60 hover:bg-white/[0.08]"
                                      : "border-white/5 bg-black/40 opacity-40 cursor-default",
                                )}
                              >
                                {slotItem && (
                                  <>
                                    <ItemIcon
                                      id={slotItem.id}
                                      name={slotItem.name}
                                      className="size-8 object-contain"
                                    />
                                    {slotItem.count > 1 && (
                                      <span className="absolute bottom-1 right-1.5 font-mono text-[10px] font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
                                        {slotItem.count}
                                      </span>
                                    )}
                                  </>
                                )}
                              </button>
                            </MinecraftTooltip>
                          );
                        })}
                      </div>
                    </Panel>

                    <div className="lg:col-span-1">
                      {item ? (
                        <MinecraftItemCard item={item} />
                      ) : (
                        <Panel className="bg-slate-950/85 text-center py-10">
                          <p className="text-sm text-muted-foreground">
                            Select a slot to inspect it.
                          </p>
                        </Panel>
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </>
          )}

          {mode === "accessories" && <AccessoriesSection />}
          {mode === "pets" && <PetsSection />}
          {mode === "profile" && <ProfileSection />}
        </>
      )}
    </div>
  );
}

/* ============================================================================
 * PROFILE — museum, achievements, lifetime stats, co-op upgrades
 * ========================================================================== */

function ProfileSection() {
  const { data } = usePlayer();

  const hasAnything =
    data?.museum ||
    data?.achievements ||
    data?.lifetimeStats ||
    (data?.communityUpgrades && data.communityUpgrades.length > 0);

  if (!hasAnything) {
    return (
      <Panel>
        <p className="text-sm text-muted-foreground">
          No museum, achievement or lifetime-stat data is available for this profile.
        </p>
      </Panel>
    );
  }

  return (
    <>
      {data?.museum && (
        <Panel>
          <h2 className="text-xl font-semibold">Museum</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {data.museum.donatedItems != null && (
              <div className="glass-soft rounded-2xl p-5">
                <p className="text-sm font-medium">Items donated</p>
                <p className="mt-3 text-3xl font-semibold">{data.museum.donatedItems}</p>
                <p className="mt-2 text-xs text-muted-foreground">Unique items in the museum</p>
              </div>
            )}
            {data.museum.appraised != null && (
              <div className="glass-soft rounded-2xl p-5">
                <p className="text-sm font-medium">Appraised</p>
                <p className="mt-3 text-3xl font-semibold">Yes</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Museum bonus applied to this profile
                </p>
              </div>
            )}
          </div>
        </Panel>
      )}

      {data?.achievements && (
        <Panel>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-xl font-semibold">Achievements</h2>
            <p className="font-mono text-sm font-bold text-primary">
              {data.achievements.points.toLocaleString()} points
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {Object.entries(data.achievements.categories)
              .sort((a, b) => b[1] - a[1])
              .map(([category, count]) => (
                <span
                  key={category}
                  className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] capitalize"
                >
                  {category} <span className="font-mono font-bold text-primary">{count}</span>
                </span>
              ))}
          </div>
        </Panel>
      )}

      {data?.lifetimeStats && (
        <Panel>
          <h2 className="text-xl font-semibold">Lifetime stats</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {data.lifetimeStats.kills != null && (
              <div className="glass-soft rounded-2xl p-5">
                <p className="text-sm font-medium">Kills</p>
                <p className="mt-3 text-3xl font-semibold">
                  {data.lifetimeStats.kills.toLocaleString()}
                </p>
              </div>
            )}
            {data.lifetimeStats.deaths != null && (
              <div className="glass-soft rounded-2xl p-5">
                <p className="text-sm font-medium">Deaths</p>
                <p className="mt-3 text-3xl font-semibold">
                  {data.lifetimeStats.deaths.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </Panel>
      )}

      {data?.communityUpgrades && data.communityUpgrades.length > 0 && (
        <Panel>
          <h2 className="text-xl font-semibold">Co-op upgrades</h2>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {data.communityUpgrades.map((upgrade) => (
              <span
                key={upgrade.upgrade}
                className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px]"
              >
                {upgrade.upgrade}{" "}
                <span className="font-mono font-bold text-primary">Tier {upgrade.level}</span>
              </span>
            ))}
          </div>
        </Panel>
      )}
    </>
  );
}

/* ============================================================================
 * ACCESSORIES — owned, missing, and magical power calculator
 * ========================================================================== */

type OwnedAccessory = { name: string; count: number; rarity: string };

function AccessoriesSection() {
  const { data } = usePlayer();
  const [reforgeId, setReforgeId] = useState<string>("none");
  const [checkedMissing, setCheckedMissing] = useState<Set<string>>(new Set());

  // Collect every accessory-looking item across all containers.
  const owned = useMemo<OwnedAccessory[]>(() => {
    const seen = new Map<string, OwnedAccessory>();
    for (const container of data?.containers ?? []) {
      for (const item of container.items) {
        const normalized = normalizeAccessoryName(item.name);
        const isAccessory =
          normalized.includes("talisman") ||
          normalized.includes("ring") ||
          normalized.includes("artifact") ||
          normalized.includes("relic") ||
          normalized.includes("orb") ||
          normalized.includes("crystal") ||
          normalized.includes("charm");
        if (!isAccessory) continue;
        const existing = seen.get(item.name);
        if (existing) {
          existing.count += item.count;
        } else {
          seen.set(item.name, { name: item.name, count: item.count, rarity: item.rarity });
        }
      }
    }
    return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  const ownedNames = useMemo(
    () => new Set(owned.map((a) => normalizeAccessoryName(a.name))),
    [owned],
  );

  // Family progress + missing tiers.
  const families = useMemo(() => {
    return ACCESSORY_FAMILIES.map((family) => {
      const tiersWithOwned = family.tiers.map((tier) => ({
        ...tier,
        owned: ownedNames.has(normalizeAccessoryName(tier.name)),
      }));
      const ownedCount = tiersWithOwned.filter((t) => t.owned).length;
      const highestOwnedTier = [...tiersWithOwned].reverse().find((t) => t.owned);
      return { ...family, tiers: tiersWithOwned, ownedCount, highestOwnedTier };
    });
  }, [ownedNames]);

  // Current MP from owned catalog items + any owned items outside the catalog.
  const reforgeBonus = REFORGES.find((r) => r.id === reforgeId)?.bonus ?? 0;

  const catalogMp = useMemo(() => {
    let total = 0;
    for (const family of families) {
      const highest = [...family.tiers].reverse().find((t) => t.owned);
      if (highest) {
        total += (MP_BY_RARITY[highest.rarity] ?? 0) + reforgeBonus;
      }
    }
    return total;
  }, [families, reforgeBonus]);

  // Accessories owned but not in the curated catalog still grant MP by rarity.
  const extraMp = useMemo(() => {
    const catalogNames = new Set(
      ACCESSORY_FAMILIES.flatMap((f) => f.tiers.map((t) => normalizeAccessoryName(t.name))),
    );
    let total = 0;
    for (const accessory of owned) {
      if (!catalogNames.has(normalizeAccessoryName(accessory.name))) {
        total += MP_BY_RARITY[accessory.rarity as AccessoryRarity] ?? 3;
      }
    }
    return total;
  }, [owned]);

  const currentMp = catalogMp + extraMp;

  // Preview MP from checked missing accessories.
  const previewGain = useMemo(() => {
    let gain = 0;
    for (const family of families) {
      for (const tier of family.tiers) {
        if (checkedMissing.has(tier.name)) {
          gain += (MP_BY_RARITY[tier.rarity] ?? 0) + reforgeBonus;
        }
      }
    }
    return gain;
  }, [checkedMissing, families, reforgeBonus]);

  const toggleMissing = (name: string) => {
    setCheckedMissing((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const missingTiers = families.flatMap((f) =>
    f.tiers.filter((t) => !t.owned).map((t) => ({ ...t, familyLabel: f.label, obtain: f.obtain })),
  );

  return (
    <div className="space-y-6">
      <StatRow
        stats={[
          {
            label: "Unique accessories",
            value: String(owned.length),
            sub: "Across all containers",
          },
          {
            label: "Families started",
            value: `${families.filter((f) => f.ownedCount > 0).length}/${families.length}`,
            sub: "From the catalog",
          },
          { label: "Estimated MP", value: String(currentMp), sub: "Catalog + extras" },
          {
            label: "Damage bonus",
            value: `+${mpToDamageBonus(currentMp).toFixed(1)}%`,
            sub: "From magical power",
          },
        ]}
      />

      {/* MP Calculator */}
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <IconCalculator className="size-5 text-primary" />
            <h2 className="text-xl font-semibold">Magical Power Calculator</h2>
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            Reforge bonus per accessory
            <select
              value={reforgeId}
              onChange={(e) => setReforgeId(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary/60"
            >
              {REFORGES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label} (+{r.bonus})
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="glass-soft rounded-xl px-4 py-3">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Current MP</p>
            <p className="mt-1 text-2xl font-semibold text-primary">{currentMp}</p>
          </div>
          <div className="glass-soft rounded-xl px-4 py-3">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Selected upgrades
            </p>
            <p className="mt-1 text-2xl font-semibold">+{previewGain} MP</p>
          </div>
          <div className="glass-soft rounded-xl px-4 py-3">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Projected MP</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-400">
              {currentMp + previewGain}
            </p>
            <p className="text-[11px] text-muted-foreground">
              +{mpToDamageBonus(previewGain).toFixed(1)}% damage
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Tick missing accessories below to preview the magical power they would add. MP values are
          base-per-rarity (
          {Object.entries(MP_BY_RARITY)
            .map(([k, v]) => `${k[0]}${k.slice(1).toLowerCase()} ${v}`)
            .join(", ")}
          ) plus your chosen reforge bonus.
        </p>
      </Panel>

      {/* Top Cost-per-MP Upgrade Recommendations */}
      <Panel>
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Cheapest Magical Power (MP) Upgrades</h2>
            <p className="text-xs text-white/50">
              Ranked by lowest coin cost per Magical Power point gained
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {getTopMpUpgrades(new Set(owned.map((o) => o.name)))
            .slice(0, 8)
            .map((t) => (
              <div key={t.id} className="rounded-xl border border-white/5 bg-black/30 p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{t.name}</span>
                  <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-amber-300">
                    +{t.mpValue} MP
                  </span>
                </div>
                <div className="mt-2 space-y-0.5 text-white/60">
                  <p>
                    Est. Cost:{" "}
                    <span className="font-mono text-white">{formatFull(t.costCoins)}</span>
                  </p>
                  <p className="font-mono font-bold text-emerald-400">
                    ~{formatFull(t.costPerMp)} / MP
                  </p>
                </div>
              </div>
            ))}
        </div>
      </Panel>

      {/* Power Stone Synergies */}
      <Panel>
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Power Stone Synergy & Stats</h2>
            <p className="text-xs text-white/50">
              Stat specialization profiles for Maxwell the Thaumaturgist
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {POWER_STONES.map((ps) => (
            <div
              key={ps.name}
              className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">{ps.name} Power</h3>
                <span className="text-xs font-mono text-white/50">{ps.powerStoneItem}</span>
              </div>
              <p className="text-xs text-sky-300 mt-1 font-semibold">{ps.focusStats}</p>
              <p className="text-[11px] text-white/40 mt-0.5">{ps.recommendedClass}</p>
            </div>
          ))}
        </div>
      </Panel>

      {/* Recombobulator Priority Engine */}
      <Panel>
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Recombobulator 3000 Priority Ranking</h2>
            <p className="text-xs text-white/50">
              Optimal rarity tiers to recombobulate first for maximum MP return
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-5">
          {getRecombPriorities(9_000_000).map((r) => (
            <div
              key={r.rarity}
              className="rounded-xl border border-white/5 bg-black/30 p-3 text-xs"
            >
              <span className="font-mono text-[10px] font-bold text-amber-400">
                {r.priorityRating}
              </span>
              <h3 className="font-bold text-white mt-1">{r.rarity}</h3>
              <p className="text-emerald-400 font-mono font-bold mt-1">+{r.mpGained} MP Gain</p>
              <p className="text-white/40 text-[10px] mt-0.5">
                ~{formatFull(r.costPerMpGained)} / MP
              </p>
            </div>
          ))}
        </div>
      </Panel>

      {/* Owned */}
      <Panel>
        <h2 className="text-xl font-semibold">Owned accessories</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Every talisman, ring, artifact and relic found across your containers.
        </p>
        {owned.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No accessories detected. Enable inventory API access to see them here.
          </p>
        ) : (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {owned.map((accessory) => (
              <li
                key={accessory.name}
                className="glass-soft flex items-center justify-between gap-3 rounded-xl px-4 py-3"
              >
                <span className="min-w-0 truncate text-sm font-medium">{accessory.name}</span>
                <span className="flex shrink-0 items-center gap-2">
                  <RarityTag rarity={accessory.rarity} />
                  {accessory.count > 1 && (
                    <span className="text-xs text-muted-foreground">×{accessory.count}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* Families progress */}
      <Panel>
        <h2 className="text-xl font-semibold">Accessory families</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Progress through each upgrade line. Only your highest tier counts toward MP.
        </p>
        <ul className="mt-4 space-y-3">
          {families.map((family) => (
            <li key={family.id} className="glass-soft rounded-xl px-4 py-3">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-medium">{family.label}</p>
                <p className="shrink-0 text-xs text-muted-foreground">
                  {family.ownedCount}/{family.tiers.length} tiers
                </p>
              </div>
              <div className="mt-2">
                <ProgressBar pct={Math.round((family.ownedCount / family.tiers.length) * 100)} />
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {family.tiers.map((tier) => (
                  <span
                    key={tier.name}
                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] ${
                      tier.owned
                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                        : "border-border/60 bg-secondary/20 text-muted-foreground"
                    }`}
                  >
                    {tier.owned && <IconCheck className="size-11" />}
                    {tier.name}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      {/* Missing */}
      <Panel>
        <h2 className="text-xl font-semibold">Not yet unlocked</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Missing tiers from the catalog. Tick them to add to the MP projection above.
        </p>
        {missingTiers.length === 0 ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-emerald-400">
            <IconCheck className="size-16" /> You own every tier in the catalog. Impressive!
          </p>
        ) : (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {missingTiers.map((tier) => {
              const checked = checkedMissing.has(tier.name);
              return (
                <li key={tier.name}>
                  <button
                    onClick={() => toggleMissing(tier.name)}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition-all duration-75 ease-out hover:scale-[1.02] ${
                      checked
                        ? "border-primary/50 bg-primary/10"
                        : "border-border/60 bg-secondary/20 hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="min-w-0 truncate text-sm font-medium">{tier.name}</span>
                      {checked ? (
                        <IconCheck className="size-14 shrink-0 text-primary" />
                      ) : (
                        <IconPlus className="size-14 shrink-0 text-muted-foreground" />
                      )}
                    </div>
                    <p className="mt-1 truncate text-[11px] text-muted-foreground">
                      {tier.familyLabel} · {tier.obtain}
                    </p>
                    <p className="mt-1 text-[11px] text-primary">
                      +{(MP_BY_RARITY[tier.rarity] ?? 0) + reforgeBonus} MP
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}

/* ============================================================================
 * PETS — owned pets + leveling calculator
 * ========================================================================== */

function PetsSection() {
  const { data } = usePlayer();
  const [query, setQuery] = useState("");
  const [rarityFilter, setRarityFilter] = useState("All");

  // Leveling calculator state
  const [calcPet, setCalcPet] = useState("");
  const [calcFrom, setCalcFrom] = useState(1);
  const [calcTo, setCalcTo] = useState(100);

  const pets = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data?.pets ?? [])
      .filter((pet) => !q || pet.name.toLowerCase().includes(q))
      .filter((pet) => rarityFilter === "All" || pet.rarity === rarityFilter)
      .sort((a, b) => b.level - a.level || a.name.localeCompare(b.name));
  }, [data?.pets, query, rarityFilter]);

  const rarities = useMemo(
    () => ["All", ...new Set((data?.pets ?? []).map((p) => p.rarity))],
    [data?.pets],
  );

  const maxedPets = (data?.pets ?? []).filter((p) => p.level >= 100).length;

  // Best pet per skill (highest level pet whose name matches a skill keyword).
  const bestPets = useMemo(() => {
    const keywords: Record<string, string[]> = {
      Mining: ["pig", "bat"],
      Farming: ["pig", "rabbit", "cow"],
      Combat: ["enderman", "wolf", "tiger", "lion", "blaze"],
      Foraging: ["monkey", "elephant"],
      Fishing: ["squid", "dolphin", "flyfish"],
      Alchemy: ["parrot", "jerry"],
      Enchanting: ["sheep"],
      Taming: ["rock", "griffin"],
    };
    const all = data?.pets ?? [];
    return Object.entries(keywords)
      .map(([skill, names]) => {
        const best = all
          .filter((p) => names.some((n) => p.name.toLowerCase().includes(n)))
          .sort((a, b) => b.level - a.level)[0];
        return best ? { skill, pet: best } : null;
      })
      .filter((x): x is { skill: string; pet: (typeof all)[number] } => x !== null);
  }, [data?.pets]);

  const rarityOfCalcPet =
    (data?.pets ?? []).find((p) => `${p.name} (${p.rarity})` === calcPet)?.rarity ?? "COMMON";

  const calcXp = useMemo(() => {
    const mult = RARITY_XP_MULT[rarityOfCalcPet] ?? 1;
    const fromXp = petXpForLevel(calcFrom - 1);
    const toXp = petXpForLevel(Math.min(99, calcTo - 1));
    return Math.max(0, Math.round((toXp - fromXp) * mult));
  }, [calcFrom, calcTo, rarityOfCalcPet]);

  return (
    <div className="space-y-6">
      <StatRow
        stats={[
          { label: "Pets owned", value: String(data?.pets?.length ?? 0), sub: "On this profile" },
          { label: "Level 100 pets", value: String(maxedPets), sub: "Fully leveled" },
          {
            label: "Taming level",
            value: String(data?.skills.find((s) => s.key === "TAMING")?.level ?? 0),
            sub: "Raises pet power",
          },
        ]}
      />

      {/* Leveling calculator */}
      <Panel>
        <div className="flex items-center gap-3">
          <IconCalculator className="size-5 text-primary" />
          <h2 className="text-xl font-semibold">Pet leveling calculator</h2>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <label className="text-sm text-muted-foreground sm:col-span-2">
            Pet
            <select
              value={calcPet}
              onChange={(e) => setCalcPet(e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary/60"
            >
              <option value="">Select a pet…</option>
              {(data?.pets ?? []).map((p) => (
                <option key={`${p.name}-${p.rarity}`} value={`${p.name} (${p.rarity})`}>
                  {p.name} ({p.rarity}) · Lv {p.level}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-muted-foreground">
            From level
            <input
              type="number"
              min={1}
              max={100}
              value={calcFrom}
              onChange={(e) => setCalcFrom(Math.min(100, Math.max(1, Number(e.target.value))))}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary/60"
            />
          </label>
          <label className="text-sm text-muted-foreground">
            To level
            <input
              type="number"
              min={1}
              max={100}
              value={calcTo}
              onChange={(e) => setCalcTo(Math.min(100, Math.max(1, Number(e.target.value))))}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary/60"
            />
          </label>
        </div>
        {calcPet && (
          <p className="mt-4 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
            Estimated XP to go from level {calcFrom} → {calcTo}:{" "}
            <span className="font-mono font-semibold text-primary">{formatNumber(calcXp)} XP</span>{" "}
            <span className="text-xs text-muted-foreground">
              (at {rarityOfCalcPet.toLowerCase()} rarity ×{RARITY_XP_MULT[rarityOfCalcPet] ?? 1}{" "}
              rate)
            </span>
          </p>
        )}
      </Panel>

      {/* Best pet per skill */}
      {bestPets.length > 0 && (
        <Panel>
          <h2 className="text-xl font-semibold">Best pet per skill</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {bestPets.map(({ skill, pet }) => (
              <li key={skill} className="glass-soft rounded-xl px-4 py-3">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">{skill}</p>
                <p className="mt-1 truncate text-sm font-medium">{pet.name}</p>
                <p className="text-xs text-primary">Level {pet.level}</p>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {/* All pets */}
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">All pets</h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <IconSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-14" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pets…"
                className="h-9 w-44 rounded-lg border border-input bg-background pl-8 pr-3 text-sm outline-none focus:border-primary/60"
              />
            </div>
            {rarities.map((rarity) => (
              <Chip
                key={rarity}
                active={rarityFilter === rarity}
                onClick={() => setRarityFilter(rarity)}
              >
                {rarity}
              </Chip>
            ))}
          </div>
        </div>

        {pets.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No pets match. Enable the pets API or adjust your filters.
          </p>
        ) : (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {pets.map((pet) => (
              <li key={`${pet.name}-${pet.rarity}`} className="glass-soft rounded-xl px-4 py-3">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="min-w-0 truncate text-sm font-medium">{pet.name}</p>
                  <RarityTag rarity={pet.rarity} />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs font-semibold text-primary">Lv {pet.level}</span>
                  <div className="flex-1">
                    <ProgressBar pct={Math.round((pet.level / 100) * 100)} />
                  </div>
                </div>
                <p className="mt-1 text-right text-[11px] text-muted-foreground">
                  {formatNumber(pet.xp)} XP
                </p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
