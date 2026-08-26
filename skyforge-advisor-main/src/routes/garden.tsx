import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { usePlayer } from "@/hooks/use-account";
import { Panel } from "@/components/layout/app-shell";
import {
  calculateFarmingFortune,
  calculateAllCropProfits,
  getDefaultFarmingConfig,
  type FarmingConfig,
  type CropProfitReport,
} from "@/lib/farming-calculator";
import {
  Sprout,
  Coins,
  Trophy,
  Sliders,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/garden")({
  component: GardenPage,
});

function formatCoins(coins: number): string {
  if (coins >= 1_000_000_000) return `${(coins / 1_000_000_000).toFixed(2)}B`;
  if (coins >= 1_000_000) return `${(coins / 1_000_000).toFixed(2)}M`;
  if (coins >= 1_000) return `${(coins / 1_000).toFixed(1)}k`;
  return coins.toLocaleString();
}

export function GardenPage() {
  const player = usePlayer();
  const [config, setConfig] = useState<FarmingConfig>(() => getDefaultFarmingConfig());

  const fortune = useMemo(() => calculateFarmingFortune(config), [config]);
  const cropProfits = useMemo(() => {
    const list = calculateAllCropProfits(config);
    return list.sort((a: CropProfitReport, b: CropProfitReport) => b.bazaarCoinsPerHour - a.bazaarCoinsPerHour);
  }, [config]);

  const topCrop = cropProfits[0];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 text-black shadow-lg">
              <Sprout className="size-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Garden & Farming Fortune Engine
            </h1>
          </div>
          <p className="mt-1.5 text-xs text-white/60 sm:text-sm">
            Live crop yields, Bazaar vs NPC coins/hour comparisons, and Jacob's Contest medal brackets.
          </p>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Total Farming Fortune */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Farming Fortune</span>
            <Sparkles className="size-4" />
          </div>
          <p className="mt-2 font-mono text-3xl font-black text-white">
            {fortune.totalFortune} ☘
          </p>
          <p className="mt-1 text-xs text-white/60">
            Base + Level + Plots + Pet + Tool
          </p>
        </div>

        {/* Highest Earning Crop */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider">Top Earning Crop</span>
            <TrendingUp className="size-4" />
          </div>
          <p className="mt-2 font-mono text-3xl font-black text-white">
            {topCrop?.name ?? "Melon"}
          </p>
          <p className="mt-1 text-xs text-amber-300 font-bold font-mono">
            ~{formatCoins(topCrop?.bazaarCoinsPerHour ?? 0)} coins / hr
          </p>
        </div>

        {/* Jacob Contest Forecast */}
        <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5">
          <div className="flex items-center justify-between text-yellow-400">
            <span className="text-xs font-bold uppercase tracking-wider">Jacob Medal Forecast</span>
            <Trophy className="size-4" />
          </div>
          <p className="mt-2 font-mono text-3xl font-black text-yellow-300">
            {topCrop?.predictedMedal} Medal
          </p>
          <p className="mt-1 text-xs text-white/60">
            Projected: {topCrop?.projectedContestYield.toLocaleString()} drops
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Crop Profit Leaderboard */}
        <div className="space-y-4 lg:col-span-2">
          <Panel className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Coins className="size-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Crop Leaderboard (Live Coins / Hour)
                </h2>
              </div>
              <span className="text-xs text-white/40">20 blocks/sec farming speed</span>
            </div>

            <div className="space-y-3">
              {cropProfits.map((crop: CropProfitReport, idx: number) => (
                <div
                  key={crop.cropId}
                  className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-none hover:border-emerald-500/30 hover:bg-white/[0.04]"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <span className="flex size-7 items-center justify-center rounded-xl bg-white/5 font-mono text-xs font-bold text-white/60">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{crop.name}</h3>
                          <span
                            className={cn(
                              "rounded-md border px-2 py-0.5 text-[10px] font-bold font-mono",
                              crop.predictedMedal === "Diamond"
                                ? "border-cyan-400/50 bg-cyan-500/20 text-cyan-300"
                                : crop.predictedMedal === "Gold"
                                  ? "border-yellow-400/50 bg-yellow-500/20 text-yellow-300"
                                  : "border-slate-400/40 bg-slate-500/20 text-slate-300"
                            )}
                          >
                            {crop.predictedMedal} Bracket
                          </span>
                        </div>
                        <p className="text-[11px] text-white/50">
                          Recommended Speed: <span className="font-mono text-sky-300">{crop.recommendedSpeed}✦</span> · Yield: {formatCoins(crop.dropsPerHour)} drops/hr
                        </p>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-4 sm:text-right">
                      <div>
                        <span className="text-[10px] uppercase text-white/40 block">Bazaar Sell:</span>
                        <span className="font-mono text-sm font-black text-emerald-400">
                          +{formatCoins(crop.bazaarCoinsPerHour)}/hr
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-white/40 block">NPC Sell:</span>
                        <span className="font-mono text-xs font-bold text-white/60">
                          +{formatCoins(crop.npcCoinsPerHour)}/hr
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Right Column: Interactive Fortune Controls */}
        <div className="space-y-6">
          <Panel className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Sliders className="size-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Farming Fortune Modifiers
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex justify-between text-xs text-white/70">
                  <span>Farming Skill Level</span>
                  <span className="font-mono font-bold text-white">LVL {config.farmingLevel ?? 50}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={config.farmingLevel ?? 50}
                  onChange={(e) => setConfig((p: FarmingConfig) => ({ ...p, farmingLevel: Number(e.target.value) }))}
                  className="mt-2 w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              <div>
                <label className="flex justify-between text-xs text-white/70">
                  <span>Unlocked Garden Plots</span>
                  <span className="font-mono font-bold text-white">{config.unlockedPlots ?? 24} / 24</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={config.unlockedPlots ?? 24}
                  onChange={(e) => setConfig((p: FarmingConfig) => ({ ...p, unlockedPlots: Number(e.target.value) }))}
                  className="mt-2 w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              <div>
                <label className="flex justify-between text-xs text-white/70">
                  <span>Tool Fortune & Enchants</span>
                  <span className="font-mono font-bold text-white">+{config.toolFortune ?? 70} ☘</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="150"
                  value={config.toolFortune ?? 70}
                  onChange={(e) => setConfig((p: FarmingConfig) => ({ ...p, toolFortune: Number(e.target.value) }))}
                  className="mt-2 w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/70">Active Farming Pet</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setConfig((p: FarmingConfig) => ({ ...p, activePet: "elephant" }))}
                    className={cn(
                      "rounded-xl border p-2 text-xs font-bold transition-none",
                      config.activePet === "elephant"
                        ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300"
                        : "border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/10"
                    )}
                  >
                    🐘 Elephant (+180 ☘)
                  </button>
                  <button
                    onClick={() => setConfig((p: FarmingConfig) => ({ ...p, activePet: "mooshroom_cow" }))}
                    className={cn(
                      "rounded-xl border p-2 text-xs font-bold transition-none",
                      config.activePet === "mooshroom_cow"
                        ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300"
                        : "border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/10"
                    )}
                  >
                    🍄 Cow (+Str Fortune)
                  </button>
                </div>
              </div>
            </div>
          </Panel>

          {/* Fortune Breakdown Card */}
          <Panel className="space-y-3">
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <Sparkles className="size-4 text-emerald-400" />
              <h3 className="text-xs font-bold uppercase text-white tracking-wider">
                Fortune Breakdown
              </h3>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-white/60">
                <span>Base Fortune:</span>
                <span className="text-white">+{fortune.baseFortune} ☘</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Farming Level:</span>
                <span className="text-emerald-400">+{fortune.levelFortune} ☘</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Garden Plots:</span>
                <span className="text-emerald-400">+{fortune.plotFortune} ☘</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Active Pet:</span>
                <span className="text-amber-400">+{fortune.petFortune} ☘</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Tool & Enchants:</span>
                <span className="text-sky-400">+{fortune.toolFortune} ☘</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 font-bold text-emerald-300">
                <span>Total Fortune:</span>
                <span>{fortune.totalFortune} ☘</span>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
