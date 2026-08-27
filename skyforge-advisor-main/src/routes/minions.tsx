import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bot,
  Coins,
  TrendingUp,
  Sparkles,
  Zap,
  Plus,
  Trash2,
  RefreshCw,
  Sliders,
  Award,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Shield,
  Layers,
  ChevronRight,
  HelpCircle,
  Info,
  Edit3,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePlayer } from "@/hooks/use-account";
import { fetchBazaar } from "@/lib/hypixel.functions";
import { playClickSound, playSuccessChime } from "@/lib/sound-effects";
import {
  MINIONS_CATALOG,
  MINION_FUELS,
  MINION_UPGRADES,
  RAW_MINION_PROFILES,
  calculateMinionDailyOutput,
  getMinionSlotProgression,
  getCheapestMinionCrafts,
  calculatePlacedMinionClaims,
  type MinionDefinition,
  type MinionCategory,
  type PlacedMinionSetup,
} from "@/lib/minions-engine";

export const Route = createFileRoute("/minions")({
  component: MinionsRoute,
});

type TabMode = "placed" | "leaderboard" | "fuels" | "slots";

const DEFAULT_PLACED_SETUP: PlacedMinionSetup[] = Array.from({ length: 24 }, (_, i) => ({
  id: `slot-${i + 1}`,
  minionId: "SLIME",
  tier: 11,
  fuelId: "ENCHANTED_LAVA_BUCKET",
  upgrade1Id: "CORRUPT_SOIL",
  upgrade2Id: "DIAMOND_SPREADING",
  hopperId: "ENCHANTED_HOPPER",
  storageChestId: "LARGE_STORAGE",
  lastClaimTimestamp: Date.now() - 14 * 3600 * 1000,
}));

export function MinionsRoute() {
  const { data: player, isLoading, error } = usePlayer();
  const [tab, setTab] = useState<TabMode>("placed");
  const [categoryFilter, setCategoryFilter] = useState<"all" | MinionCategory>("all");
  const [sellMode, setSellMode] = useState<"npc" | "bazaar">("npc");
  const [searchQuery, setSearchQuery] = useState("");
  const [placedMinions, setPlacedMinions] = useState<PlacedMinionSetup[]>(DEFAULT_PLACED_SETUP);
  const [lastClaimTime, setLastClaimTime] = useState<number>(Date.now() - 18 * 3600 * 1000);
  const [now, setNow] = useState<number>(Date.now());
  const [editingSlot, setEditingSlot] = useState<PlacedMinionSetup | null>(null);

  // Live timer tick every 10 seconds for real-time claim accumulation
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(timer);
  }, []);

  // Load custom placed minions from localStorage if saved
  useEffect(() => {
    if (!player?.activeProfileId) return;
    const key = `skyforge_placed_minions_${player.activeProfileId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setPlacedMinions(JSON.parse(saved));
      } catch {}
    }
  }, [player?.activeProfileId]);

  const savePlacedMinions = (updated: PlacedMinionSetup[]) => {
    setPlacedMinions(updated);
    if (player?.activeProfileId) {
      localStorage.setItem(`skyforge_placed_minions_${player.activeProfileId}`, JSON.stringify(updated));
    }
  };

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

  // Placed minions claims calculation
  const elapsedMs = Math.max(0, now - lastClaimTime);
  const claimsReport = useMemo(() => {
    return calculatePlacedMinionClaims(placedMinions, elapsedMs, bazaarPriceMap);
  }, [placedMinions, elapsedMs, bazaarPriceMap]);

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
    return getCheapestMinionCrafts(player?.craftedGenerators ?? [], bazaarPriceMap, 12);
  }, [player?.craftedGenerators, bazaarPriceMap]);

  const handleClaimAll = () => {
    playSuccessChime();
    setLastClaimTime(Date.now());
  };

  const handleApplyPreset = (presetType: "slime" | "sheep" | "snow") => {
    playClickSound();
    let updated: PlacedMinionSetup[] = [];
    const count = slotProgression.totalSlotsUnlocked || 24;

    if (presetType === "slime") {
      updated = Array.from({ length: count }, (_, i) => ({
        id: `slot-${i + 1}`,
        minionId: "SLIME",
        tier: 11,
        fuelId: "ENCHANTED_LAVA_BUCKET",
        upgrade1Id: "CORRUPT_SOIL",
        upgrade2Id: "DIAMOND_SPREADING",
        hopperId: "ENCHANTED_HOPPER",
        storageChestId: "LARGE_STORAGE",
      }));
    } else if (presetType === "sheep") {
      updated = Array.from({ length: count }, (_, i) => ({
        id: `slot-${i + 1}`,
        minionId: "SHEEP",
        tier: 12,
        fuelId: "PLASMA_BUCKET",
        upgrade1Id: "BERRIES",
        upgrade2Id: "SUPER_COMPACTOR_3000",
        hopperId: "ENCHANTED_HOPPER",
        storageChestId: "LARGE_STORAGE",
      }));
    } else {
      updated = Array.from({ length: count }, (_, i) => ({
        id: `slot-${i + 1}`,
        minionId: "SNOW",
        tier: 11,
        fuelId: "ENCHANTED_LAVA_BUCKET",
        upgrade1Id: "SUPER_COMPACTOR_3000",
        upgrade2Id: "DIAMOND_SPREADING",
        hopperId: "ENCHANTED_HOPPER",
        storageChestId: "LARGE_STORAGE",
      }));
    }

    savePlacedMinions(updated);
  };

  const handleAutoDetectFromCrafts = () => {
    playClickSound();
    const crafted = player?.craftedGenerators ?? [];
    if (!crafted.length) {
      handleApplyPreset("slime");
      return;
    }

    const highestTiers = new Map<string, number>();
    for (const gen of crafted) {
      const match = gen.match(/^([A-Z_]+)_(\d+)$/);
      if (match) {
        const id = match[1]!;
        const tier = Number(match[2]);
        const curr = highestTiers.get(id) ?? 0;
        if (tier > curr) highestTiers.set(id, tier);
      }
    }

    const sortedMinions = Array.from(highestTiers.entries())
      .filter(([id]) => RAW_MINION_PROFILES.some((p) => p.id === id))
      .sort((a, b) => b[1] - a[1]);

    const count = slotProgression.totalSlotsUnlocked || 24;
    const updated: PlacedMinionSetup[] = [];

    for (let i = 0; i < count; i++) {
      const minionEntry = sortedMinions[i % sortedMinions.length] ?? ["SLIME", 11];
      const minionId = minionEntry[0] ?? "SLIME";
      const tier = minionEntry[1] ?? 11;
      const isCombat = RAW_MINION_PROFILES.find((p) => p.id === minionId)?.category === "combat";

      updated.push({
        id: `slot-${i + 1}`,
        minionId,
        tier,
        fuelId: "ENCHANTED_LAVA_BUCKET",
        upgrade1Id: isCombat ? "CORRUPT_SOIL" : "SUPER_COMPACTOR_3000",
        upgrade2Id: "DIAMOND_SPREADING",
        hopperId: "ENCHANTED_HOPPER",
        storageChestId: "LARGE_STORAGE",
      });
    }

    savePlacedMinions(updated);
  };

  const handleSaveSlot = (updatedSlot: PlacedMinionSetup, applyToAll = false) => {
    playClickSound();
    let updated: PlacedMinionSetup[];
    if (applyToAll) {
      updated = placedMinions.map((slot, i) => ({
        ...updatedSlot,
        id: `slot-${i + 1}`,
      }));
    } else {
      updated = placedMinions.map((slot) => (slot.id === updatedSlot.id ? updatedSlot : slot));
    }
    savePlacedMinions(updated);
    setEditingSlot(null);
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHero
        eyebrow="MINION AUTOMATION"
        title="Minion Economy & Claims"
        description="Real-time minion output calculator, live claim accumulator, Bazaar/NPC profitability leaderboard, fuel ROI optimizer, and cheapest slot craft roadmap."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Chip
              active={tab === "placed"}
              onClick={() => {
                playClickSound();
                setTab("placed");
              }}
            >
              <Bot className="size-3.5" /> Placed Minions & Claims
            </Chip>
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
              active={tab === "fuels"}
              onClick={() => {
                playClickSound();
                setTab("fuels");
              }}
            >
              <Zap className="size-3.5" /> Fuel & Upgrade ROI
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
          </div>
        }
      />

      {/* Top Level Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel className="relative overflow-hidden bg-slate-900/60 border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Placed Minions
            </span>
            <Bot className="size-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-white">
            {placedMinions.length}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              / {slotProgression.totalSlotsUnlocked} slots
            </span>
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="size-3.5" /> Active & Calculating
          </div>
        </Panel>

        <Panel className="relative overflow-hidden bg-slate-900/60 border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Daily Coin Yield
            </span>
            <Coins className="size-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            +{claimsReport.totalDailyRate.toLocaleString()}{" "}
            <span className="text-xs text-muted-foreground font-normal">/ day</span>
          </p>
          <div className="mt-2 text-xs text-muted-foreground">
            ≈ {Math.round(claimsReport.totalDailyRate / 24).toLocaleString()} coins / hour
          </div>
        </Panel>

        <Panel className="relative overflow-hidden bg-gradient-to-br from-purple-950/40 to-slate-900/80 border-purple-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
              Ready to Claim
            </span>
            <Clock className="size-4 text-purple-400" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-purple-200">
            {claimsReport.totalClaimableCoins.toLocaleString()} coins
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] text-purple-300/80">
              Accumulated over {(elapsedMs / (3600 * 1000)).toFixed(1)}h
            </span>
            <button
              onClick={handleClaimAll}
              className="rounded bg-purple-500/20 px-2 py-0.5 text-xs font-bold text-purple-300 hover:bg-purple-500/30 transition-colors"
            >
              Claim & Reset
            </button>
          </div>
        </Panel>

        <Panel className="relative overflow-hidden bg-slate-900/60 border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Slot Unlock Status
            </span>
            <Award className="size-4 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-amber-300">
            {slotProgression.totalSlotsUnlocked}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              ({slotProgression.uniqueCraftsCount} crafts)
            </span>
          </p>
          <div className="mt-2">
            <ProgressBar pct={slotProgression.progressToNextPct} tone="gold" />
            <span className="mt-1 block text-[10px] text-muted-foreground">
              {slotProgression.craftsForNextSlot} unique crafts to next slot
            </span>
          </div>
        </Panel>
      </div>

      {/* =========================================================================
       * TAB 1: PLACED MINIONS & CLAIMS
       * ======================================================================= */}
      {tab === "placed" && (
        <div className="space-y-6">
          {/* API Limitation Transparency Banner */}
          <div className="flex items-start gap-3 rounded-2xl border border-blue-500/20 bg-blue-950/20 p-4 text-xs text-blue-200 backdrop-blur-md">
            <Info className="size-4 shrink-0 text-blue-400 mt-0.5" />
            <div>
              <p className="font-bold text-blue-100">
                Why configure placed minions?
              </p>
              <p className="mt-0.5 text-blue-200/80 leading-relaxed">
                Hypixel&apos;s public API provides your lifetime unique crafted tiers (<code className="bg-blue-950 px-1 py-0.5 rounded">crafted_generators</code>) and community upgrades, but does not serialize private island block placements. Click any slot to configure your exact minions, or use the 1-click presets below to simulate your live daily profits and claim timers!
              </p>
            </div>
          </div>

          {/* Preset Quick Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4 backdrop-blur-md">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="size-4 text-primary" /> Active Minion Presets & Loadouts
              </h3>
              <p className="text-xs text-muted-foreground">
                Click any slot below to customize, or apply a high-yield meta setup:
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleAutoDetectFromCrafts}
                className="rounded-xl border border-primary/40 bg-primary/20 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/30 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="size-3.5" /> Auto-Fill from My Highest Crafts
              </button>
              <button
                onClick={() => handleApplyPreset("slime")}
                className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition-all"
              >
                24× Slime T11 (AFK King)
              </button>
              <button
                onClick={() => handleApplyPreset("sheep")}
                className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-300 hover:bg-blue-500/20 transition-all"
              >
                24× Sheep T12 (Bazaar Meta)
              </button>
              <button
                onClick={() => handleApplyPreset("snow")}
                className="rounded-xl border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/10 transition-all"
              >
                24× Snow T11 (Mining XP)
              </button>
              <button
                onClick={handleClaimAll}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110 transition-all"
              >
                <Coins className="size-3.5" /> Claim All ({claimsReport.totalClaimableCoins.toLocaleString()} coins)
              </button>
            </div>
          </div>

          {/* Placed Minions Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {claimsReport.minionReports.map((report, idx) => {
              const fuel = MINION_FUELS.find((f) => f.id === report.setup.fuelId);
              const up1 = MINION_UPGRADES.find((u) => u.id === report.setup.upgrade1Id);
              const up2 = MINION_UPGRADES.find((u) => u.id === report.setup.upgrade2Id);

              return (
                <div
                  key={report.setup.id}
                  onClick={() => {
                    playClickSound();
                    setEditingSlot(report.setup);
                  }}
                  className="group relative cursor-pointer rounded-2xl border border-white/10 bg-slate-950/80 p-4 transition-all duration-150 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <ItemIcon
                          id={`${report.setup.minionId}_GENERATOR_${report.setup.tier}`}
                          name={report.minion.name}
                          className="size-11 rounded-lg border border-white/10 bg-black/40 p-1 object-contain"
                        />
                        <span className="absolute -bottom-1 -right-1 rounded bg-primary px-1 font-mono text-[9px] font-bold text-primary-foreground">
                          {report.setup.tier}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="truncate text-sm font-bold text-white group-hover:text-primary transition-colors flex items-center gap-1.5">
                          {report.minion.name} <Edit3 className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h4>
                        <span className="text-[11px] font-mono text-muted-foreground">
                          {report.minion.actionTime}s / action
                        </span>
                      </div>
                    </div>
                    <span className="rounded bg-white/5 px-2 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">
                      Slot #{idx + 1}
                    </span>
                  </div>

                  {/* Installed Upgrades & Fuel Badges */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {fuel && fuel.id !== "NONE" && (
                      <span className="rounded bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] text-amber-300 font-medium">
                        ⛽ {fuel.name}
                      </span>
                    )}
                    {up1 && up1.id !== "NONE" && (
                      <span className="rounded bg-purple-500/10 px-1.5 py-0.5 font-mono text-[10px] text-purple-300 font-medium">
                        ✦ {up1.name}
                      </span>
                    )}
                    {up2 && up2.id !== "NONE" && (
                      <span className="rounded bg-blue-500/10 px-1.5 py-0.5 font-mono text-[10px] text-blue-300 font-medium">
                        ✦ {up2.name}
                      </span>
                    )}
                    {report.setup.hopperId === "ENCHANTED_HOPPER" && (
                      <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] text-emerald-300 font-medium">
                        💰 90% Hopper
                      </span>
                    )}
                  </div>

                  {/* Daily Output & Accumulated Claim Status */}
                  <div className="mt-3.5 space-y-1.5 border-t border-white/10 pt-2.5 font-mono text-xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Daily Revenue:</span>
                      <span className="font-bold text-emerald-400">
                        +{report.dailyCoins.toLocaleString()} coins
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-300">Ready to Claim:</span>
                      <span className="font-bold text-purple-200">
                        {report.claimableCoins.toLocaleString()} coins
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
       * TAB 2: PROFITABILITY LEADERBOARD
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
                  {leaderboardEntries.slice(0, 30).map((entry, index) => (
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

      {/* =========================================================================
       * TAB 4: SLOT PROGRESSION & CHEAPEST CRAFTS
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
       * SLOT EDITOR MODAL
       * ======================================================================= */}
      {editingSlot && (
        <Dialog open={!!editingSlot} onOpenChange={(open) => !open && setEditingSlot(null)}>
          <DialogContent className="max-w-md border-white/10 bg-slate-950/95 text-white backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <Edit3 className="size-4 text-primary" /> Edit Minion Slot #{editingSlot.id.replace("slot-", "")}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-xs">
              {/* Minion Type Selector */}
              <div>
                <label className="text-muted-foreground font-semibold">Minion Type:</label>
                <select
                  value={editingSlot.minionId}
                  onChange={(e) => setEditingSlot({ ...editingSlot, minionId: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/50 p-2.5 text-xs text-white focus:border-primary focus:outline-none"
                >
                  {RAW_MINION_PROFILES.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                      {p.name} ({p.category.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Tier Selector */}
              <div>
                <label className="text-muted-foreground font-semibold">Tier (1–12):</label>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((tierNum) => (
                    <button
                      key={tierNum}
                      type="button"
                      onClick={() => setEditingSlot({ ...editingSlot, tier: tierNum })}
                      className={`size-7 rounded-lg font-mono text-xs font-bold transition-all ${
                        editingSlot.tier === tierNum
                          ? "bg-primary text-primary-foreground shadow"
                          : "border border-white/10 bg-white/5 text-muted-foreground hover:text-white"
                      }`}
                    >
                      {tierNum}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fuel Selector */}
              <div>
                <label className="text-muted-foreground font-semibold">Fuel:</label>
                <select
                  value={editingSlot.fuelId ?? "NONE"}
                  onChange={(e) => setEditingSlot({ ...editingSlot, fuelId: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/50 p-2.5 text-xs text-white focus:border-primary focus:outline-none"
                >
                  {MINION_FUELS.map((f) => (
                    <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                      {f.name} {f.speedBonus > 0 ? `(+${(f.speedBonus * 100).toFixed(0)}%)` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Upgrade 1 */}
              <div>
                <label className="text-muted-foreground font-semibold">Upgrade Slot 1:</label>
                <select
                  value={editingSlot.upgrade1Id ?? "NONE"}
                  onChange={(e) => setEditingSlot({ ...editingSlot, upgrade1Id: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/50 p-2.5 text-xs text-white focus:border-primary focus:outline-none"
                >
                  {MINION_UPGRADES.map((u) => (
                    <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Upgrade 2 */}
              <div>
                <label className="text-muted-foreground font-semibold">Upgrade Slot 2:</label>
                <select
                  value={editingSlot.upgrade2Id ?? "NONE"}
                  onChange={(e) => setEditingSlot({ ...editingSlot, upgrade2Id: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/50 p-2.5 text-xs text-white focus:border-primary focus:outline-none"
                >
                  {MINION_UPGRADES.map((u) => (
                    <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hopper */}
              <div>
                <label className="text-muted-foreground font-semibold">Automated Hopper:</label>
                <select
                  value={editingSlot.hopperId ?? "ENCHANTED_HOPPER"}
                  onChange={(e) => setEditingSlot({ ...editingSlot, hopperId: e.target.value as any })}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/50 p-2.5 text-xs text-white focus:border-primary focus:outline-none"
                >
                  <option value="ENCHANTED_HOPPER" className="bg-slate-900 text-white">Enchanted Hopper (90% NPC Sell)</option>
                  <option value="BUDGET_HOPPER" className="bg-slate-900 text-white">Budget Hopper (50% NPC Sell)</option>
                  <option value="NONE" className="bg-slate-900 text-white">None (Manual Chest Collect)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-end gap-2 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => handleSaveSlot(editingSlot, true)}
                  className="rounded-xl border border-primary/40 bg-primary/10 px-3.5 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition-all"
                >
                  Apply to All Slots
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveSlot(editingSlot, false)}
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:brightness-110 transition-all"
                >
                  Save This Slot
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
