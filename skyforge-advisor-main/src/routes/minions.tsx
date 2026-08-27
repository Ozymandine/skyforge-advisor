import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  Award,
  Zap,
  Sparkles,
  Search,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  Coins,
  Compass,
} from "lucide-react";

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
import { usePlayer } from "@/hooks/use-account";
import { fetchBazaar } from "@/lib/hypixel.functions";
import { playClickSound } from "@/lib/sound-effects";
import {
  MINIONS_CATALOG,
  MINION_FUELS,
  MINION_UPGRADES,
  RAW_MINION_PROFILES,
  calculateMinionDailyOutput,
  getMinionSlotProgression,
  getCheapestMinionCrafts,
  type MinionDefinition,
  type MinionCategory,
} from "@/lib/minions-engine";

export const Route = createFileRoute("/minions")({
  component: MinionsRoute,
});

type TabMode = "leaderboard" | "slots" | "fuels";

export function MinionsRoute() {
  const { data: player, isLoading, error } = usePlayer();
  const [tab, setTab] = useState<TabMode>("leaderboard");
  const [categoryFilter, setCategoryFilter] = useState<"all" | MinionCategory>("all");
  const [sellMode, setSellMode] = useState<"npc" | "bazaar">("npc");
  const [searchQuery, setSearchQuery] = useState("");

  // Live Bazaar query
  const { data: bazaarData } = useQuery({
    queryKey: ["bazaar"],
    queryFn: fetchBazaar,
    staleTime: 45_000,
  });

  const bazaarPriceMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const prod of bazaarData?.products ?? []) {
      map.set(prod.id, prod.sellPrice || prod.buyPrice || 0);
    }
    return map;
  }, [bazaarData]);

  // Minion slot progression from profile
  const slotProgression = useMemo(() => {
    const communitySlots = player?.communityUpgrades?.find(
      (u) => u.upgrade.toLowerCase().includes("minion"),
    )?.level ?? 0;
    return getMinionSlotProgression(player?.craftedGenerators ?? [], communitySlots);
  }, [player?.craftedGenerators, player?.communityUpgrades]);

  // Leaderboard calculation across all catalog minions
  const leaderboardEntries = useMemo(() => {
    return MINIONS_CATALOG.filter((m) => {
      if (categoryFilter !== "all" && m.category !== categoryFilter) return false;
      if (searchQuery && !m.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
      .map((minion) => {
        const lava = MINION_FUELS.find((f) => f.id === "ENCHANTED_LAVA_BUCKET");
        const corruptSoil = minion.category === "combat"
          ? MINION_UPGRADES.find((u) => u.id === "CORRUPT_SOIL")
          : undefined;
        const diamondSpreading = MINION_UPGRADES.find((u) => u.id === "DIAMOND_SPREADING");

        const output = calculateMinionDailyOutput({
          minion,
          fuel: lava,
          upgrade1: corruptSoil,
          upgrade2: diamondSpreading,
          hopper: sellMode === "npc" ? "ENCHANTED_HOPPER" : "NONE",
          bazaarPriceMap,
        });

        const dailyCoins = sellMode === "npc" ? output.dailyNpcCoins : output.dailyBazaarCoins;
        return {
          minion,
          output,
          dailyCoins,
          fullSetupDailyCoins: dailyCoins * (slotProgression.totalSlotsUnlocked || 24),
        };
      })
      .sort((a, b) => b.dailyCoins - a.dailyCoins);
  }, [categoryFilter, searchQuery, sellMode, bazaarPriceMap, slotProgression.totalSlotsUnlocked]);

  // Cheapest missing unique crafts
  const cheapestCrafts = useMemo(() => {
    return getCheapestMinionCrafts(player?.craftedGenerators ?? [], bazaarPriceMap, 18);
  }, [player?.craftedGenerators, bazaarPriceMap]);

  // Top meta recommendations
  const topAfkMinion = leaderboardEntries[0];
  const topBazaarMinion = useMemo(() => {
    const bzList = [...leaderboardEntries].sort((a, b) => b.output.dailyBazaarCoins - a.output.dailyBazaarCoins);
    return bzList[0];
  }, [leaderboardEntries]);

  return (
    <div className="space-y-6 pb-12">
      <PageHero
        eyebrow="MINION AUTOMATION"
        title="Minion Economy & Craft Roadmap"
        description="Real-time minion output calculator, live Bazaar/NPC profitability leaderboard, fuel ROI optimizer, and cheapest slot craft roadmap."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Chip
              active={tab === "leaderboard"}
              onClick={() => {
                playClickSound();
                setTab("leaderboard");
              }}
            >
              <TrendingUp className="size-3.5" /> Profit Leaderboard
            </Chip>
            <Chip
              active={tab === "slots"}
              onClick={() => {
                playClickSound();
                setTab("slots");
              }}
            >
              <Award className="size-3.5" /> Slot Progression ({slotProgression.uniqueCraftsCount}/850)
            </Chip>
            <Chip
              active={tab === "fuels"}
              onClick={() => {
                playClickSound();
                setTab("fuels");
              }}
            >
              <Zap className="size-3.5" /> Fuel & Upgrade ROI
            </Chip>
          </div>
        }
      />

      {/* Top Level Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel className="relative overflow-hidden bg-slate-900/60 border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Unlocked Minion Slots
            </span>
            <Award className="size-4 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-amber-300">
            {slotProgression.totalSlotsUnlocked}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              / {slotProgression.maxPossibleSlots} max
            </span>
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>{slotProgression.uniqueCraftsCount} unique crafts</span>
            {slotProgression.communitySlots > 0 && (
              <span className="text-emerald-400 font-medium">
                (+{slotProgression.communitySlots} Elizabeth)
              </span>
            )}
          </div>
        </Panel>

        <Panel className="relative overflow-hidden bg-slate-900/60 border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Next Slot Goal
            </span>
            <Compass className="size-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-white">
            {slotProgression.craftsForNextSlot}{" "}
            <span className="text-xs text-muted-foreground font-normal">crafts needed</span>
          </p>
          <div className="mt-2">
            <ProgressBar pct={slotProgression.progressToNextPct} tone="gold" />
            <span className="mt-1 block text-[10px] text-muted-foreground">
              {slotProgression.uniqueCraftsCount} / {slotProgression.nextSlotThreshold} threshold
            </span>
          </div>
        </Panel>

        <Panel className="relative overflow-hidden bg-slate-900/60 border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Top AFK Minion Meta
            </span>
            <Coins className="size-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-lg font-bold text-white truncate">
            {topAfkMinion?.minion.name ?? "Slime XI"}
          </p>
          <p className="text-xs font-mono font-bold text-emerald-400">
            +{topAfkMinion?.dailyCoins.toLocaleString()}{" "}
            <span className="text-[10px] text-muted-foreground font-normal">/ day per minion</span>
          </p>
        </Panel>

        <Panel className="relative overflow-hidden bg-slate-900/60 border-purple-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
              Top Bazaar Meta
            </span>
            <Sparkles className="size-4 text-purple-400" />
          </div>
          <p className="mt-2 text-lg font-bold text-white truncate">
            {topBazaarMinion?.minion.name ?? "Sheep XII"}
          </p>
          <p className="text-xs font-mono font-bold text-purple-300">
            +{topBazaarMinion?.output.dailyBazaarCoins.toLocaleString()}{" "}
            <span className="text-[10px] text-muted-foreground font-normal">/ day per minion</span>
          </p>
        </Panel>
      </div>

      {/* =========================================================================
       * TAB 1: PROFITABILITY LEADERBOARD
       * ======================================================================= */}
      {tab === "leaderboard" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(["all", "combat", "farming", "mining", "foraging", "fishing"] as const).map(
                (cat) => (
                  <Chip
                    key={cat}
                    active={categoryFilter === cat}
                    onClick={() => {
                      playClickSound();
                      setCategoryFilter(cat);
                    }}
                  >
                    {cat.toUpperCase()}
                  </Chip>
                ),
              )}
            </div>

            {/* Sell Mode Toggle (NPC vs Bazaar) */}
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 p-1">
              <button
                onClick={() => {
                  playClickSound();
                  setSellMode("npc");
                }}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  sellMode === "npc"
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                AFK Hopper (NPC 90%)
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  setSellMode("bazaar");
                }}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  sellMode === "bazaar"
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                Manual Bazaar Sell
              </button>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 shadow-2xl backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-white/10 bg-white/5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-center">#</th>
                    <th className="px-4 py-3">Minion & Tier</th>
                    <th className="px-4 py-3">Speed</th>
                    <th className="px-4 py-3">Primary Drops</th>
                    <th className="px-4 py-3 text-right">Daily Coins (1 Minion)</th>
                    <th className="px-4 py-3 text-right">Full Setup ({slotProgression.totalSlotsUnlocked || 24} Slots)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {leaderboardEntries.map((entry, index) => (
                    <tr key={`${entry.minion.id}-${entry.minion.tier}`} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-center font-bold text-muted-foreground">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <ItemIcon
                            id={`${entry.minion.id}_GENERATOR_${entry.minion.tier}`}
                            name={entry.minion.name}
                            className="size-8 object-contain"
                          />
                          <div>
                            <p className="font-bold text-white text-sm">{entry.minion.name}</p>
                            <span className="text-[10px] text-muted-foreground uppercase">
                              {entry.minion.category}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300 font-medium">
                        {entry.output.effectiveActionTime}s / action
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {entry.output.itemsProduced.map((item) => (
                            <span
                              key={item.id}
                              className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-300"
                            >
                              {item.dailyAmount.toLocaleString()}× {item.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-400 text-sm">
                        +{entry.dailyCoins.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-amber-300 text-sm">
                        +{entry.fullSetupDailyCoins.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
       * TAB 2: SLOT PROGRESSION & CHEAPEST CRAFTS
       * ======================================================================= */}
      {tab === "slots" && (
        <div className="space-y-6">
          <Panel className="bg-slate-950/80">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="size-5 text-amber-400" /> Minion Slot Roadmap
                </h3>
                <p className="text-xs text-muted-foreground">
                  Craft unique minion tiers to expand your island's production capacity.
                </p>
              </div>
              <span className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-xs font-bold text-amber-300">
                {slotProgression.totalSlotsUnlocked} / {slotProgression.maxPossibleSlots} Max Slots
              </span>
            </div>

            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">
                  Unique Crafts: {slotProgression.uniqueCraftsCount} / {slotProgression.nextSlotThreshold}
                </span>
                <span className="font-bold text-primary">{slotProgression.progressToNextPct}% to next slot</span>
              </div>
              <ProgressBar pct={slotProgression.progressToNextPct} tone="gold" />
            </div>
          </Panel>

          {/* Cheapest Missing Crafts */}
          <Panel className="bg-slate-950/80">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="size-4 text-emerald-400" /> Cheapest Unique Crafts to Unlock Next Slot
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Ranked by lowest Bazaar material cost to unlock your next minion slot with the fewest coins possible.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cheapestCrafts.map((craft) => (
                <div
                  key={`${craft.minionId}-${craft.tier}`}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 p-3 hover:border-primary/30 transition-all"
                >
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-bold text-white">{craft.minionName}</h4>
                    <span className="text-[11px] text-muted-foreground">{craft.materialsNeeded}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      ≈ {craft.craftCostCoins.toLocaleString()} coins
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {/* =========================================================================
       * TAB 3: FUEL & UPGRADE OPTIMIZER
       * ======================================================================= */}
      {tab === "fuels" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Permanent Fuels */}
            <Panel className="bg-slate-950/80">
              <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <Zap className="size-4" /> Permanent Fuel Options
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                One-time cost fuels that provide permanent continuous speed boosts.
              </p>
              <div className="mt-4 space-y-2.5">
                {MINION_FUELS.filter((f) => !f.durationHours && f.id !== "NONE").map((fuel) => (
                  <div
                    key={fuel.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 p-3"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white">{fuel.name}</h4>
                      <span className="text-xs text-emerald-400 font-medium">
                        +{(fuel.speedBonus * 100).toFixed(0)}% Speed
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-amber-300">
                      ≈ {fuel.costCoins?.toLocaleString()} coins
                    </span>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Consumable Fuels */}
            <Panel className="bg-slate-950/80">
              <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                <Sparkles className="size-4" /> Consumable & Timed Boosters
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                High-power timed fuels used for max output scaling or special events.
              </p>
              <div className="mt-4 space-y-2.5">
                {MINION_FUELS.filter((f) => f.durationHours).map((fuel) => (
                  <div
                    key={fuel.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 p-3"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white">{fuel.name}</h4>
                      <span className="text-xs text-purple-300 font-medium">
                        {fuel.outputMultiplier
                          ? `${fuel.outputMultiplier}× Output Multiplier`
                          : `+${(fuel.speedBonus * 100).toFixed(0)}% Speed`}{" "}
                        ({fuel.durationHours}h duration)
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-muted-foreground">
                      ≈ {fuel.costCoins?.toLocaleString()} coins / item
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}
