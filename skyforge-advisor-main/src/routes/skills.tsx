import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Sparkles,
  Wheat,
  Pickaxe,
  Swords,
  Fish,
  FlaskConical,
  Flame,
  ShieldCheck,
  Zap,
  TrendingUp,
  Award,
  ChevronRight,
  Boxes,
  Skull,
  Crosshair,
  Crown,
  Key,
} from "lucide-react";

import { ConnectPrompt, ErrorState, LoadState } from "@/components/data-states";
import { PageHero, Panel, ProgressBar, StatRow } from "@/components/layout/app-shell";
import { ItemIcon } from "@/components/ui/item-icon";
import { DungeonFloorMap, SkillRadar } from "@/components/progression-visuals";
import { usePlayer } from "@/hooks/use-account";
import { formatFull, formatNumber } from "@/lib/skyblock";
import { calculateFarmingFortune } from "@/lib/farming-calculator";
import { calculateMiningStats } from "@/lib/mining-calculator";
import { calculateMagicFind } from "@/lib/combat-calculator";
import { calculateTrophyProgress } from "@/lib/fishing-calculator";
import { getExperimentationOverview } from "@/lib/experimentation-calculator";
import {
  evaluatePartyFinderReadiness,
  calculateMasterModeOdds,
  FLOOR_CHEST_LOOT_TABLES,
  getStarUpEstimates,
} from "@/lib/dungeons-engine";
import {
  NOTABLE_GARDEN_VISITORS,
  evaluateVisitorOffer,
  PEST_TYPES,
  CROP_TUNING_GUIDES,
} from "@/lib/garden-ecosystem";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/skills")({
  head: () => ({
    meta: [
      { title: "Skills & Specialization Suites — SkyForge Advisor" },
      {
        name: "description",
        content:
          "Track every SkyBlock skill, Catacombs tactical hub, Farming Fortune engine, Mining powder allocations, Magic Find rollups, and Crimson Isle Trophy Fish.",
      },
      { property: "og:title", content: "Skills & Specialization Suites — SkyForge Advisor" },
      {
        property: "og:description",
        content: "Complete skill mastery hubs with specialized calculators for Dungeons, Farming, Mining, Combat, and Fishing.",
      },
    ],
  }),
  component: SkillsRoute,
});

type SkillTab = "overview" | "dungeons" | "farming" | "mining" | "combat" | "fishing" | "experiments";

function SkillsRoute() {
  const { data, isLoading, error, connected } = usePlayer();
  const [activeTab, setActiveTab] = useState<SkillTab>("overview");

  // Specialized Engine Rollups
  const cataLvl = data?.dungeons?.catacombsLevel ?? 30;
  const secretsFound = data?.dungeons?.secretsFound ?? 12_500;
  const totalRuns =
    (data?.dungeons?.floors?.reduce((sum, f) => sum + f.completions, 0) ?? 0) +
    (data?.dungeons?.masterMode?.reduce((sum, f) => sum + f.completions, 0) ?? 0) || 1200;

  const partyFinderEval = useMemo(
    () => evaluatePartyFinderReadiness(cataLvl, secretsFound, totalRuns, "F7"),
    [cataLvl, secretsFound, totalRuns]
  );

  const masterModeOdds = useMemo(() => calculateMasterModeOdds(cataLvl, true, true), [cataLvl]);
  const starUpEstimates = useMemo(() => getStarUpEstimates(2800), []);

  const farmingLvl = data?.skills.find((s) => s.key === "FARMING")?.level ?? 40;
  const gardenLvl = data?.garden?.level ?? 10;
  const farmingCalc = useMemo(
    () =>
      calculateFarmingFortune({
        farmingLevel: farmingLvl,
        gardenLevel: gardenLvl,
        plotsUnlocked: 24,
        anitaBonus: 10,
        armorSet: "fermento",
        toolTier: 3,
        hasDedication4: true,
        hasCultivating10: true,
        pet: "elephant",
        petLevel: 100,
        hasGreenBandana: true,
      }),
    [farmingLvl, gardenLvl]
  );

  const miningLvl = data?.skills.find((s) => s.key === "MINING")?.level ?? 50;
  const hotmTier = data?.hotm?.tier ?? 7;
  const miningCalc = useMemo(
    () =>
      calculateMiningStats({
        miningLevel: miningLvl,
        hotmTier,
        drill: "divan",
        hasAmberEngine: true,
        hasBlueCheese: true,
        hasPerfectFuelTank: true,
        mithrilPowder: data?.hotm?.powders?.mithril ?? 2_000_000,
        gemstonePowder: data?.hotm?.powders?.gemstone ?? 4_000_000,
      }),
    [miningLvl, hotmTier, data]
  );

  const combatCalc = useMemo(
    () =>
      calculateMagicFind({
        bestiaryMilestones: data?.bestiary?.milestone ?? 15,
        pet: "gdrag",
        petLevel: 200,
        hasLuckyClover: false,
        hasMinosRelic: true,
        hasSorrowArmor: true,
        enrichmentsCount: 20,
        hasBoosterCookie: true,
        hasGodPotion: true,
        hasBeacon5: true,
      }),
    [data]
  );

  const trophyCalc = useMemo(
    () => calculateTrophyProgress((data?.crimson?.dojo as Record<string, number> | undefined) ?? {}),
    [data]
  );

  const experimentCalc = useMemo(
    () => getExperimentationOverview(data?.skills.find((s) => s.key === "ENCHANTING")?.level ?? 60),
    [data]
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHero
        eyebrow="Progression Intelligence"
        title="Skills & Specialization Suites"
        description="Skill levels, Catacombs tactical breakdowns, Farming Fortune engines, Mining powder allocations, and Trophy Fish suites."
      />

      {!connected && <ConnectPrompt what="your real skill levels" />}
      {connected && isLoading && <LoadState>Loading skill telemetry from Hypixel…</LoadState>}
      {connected && error && <ErrorState error={error} />}

      {data && (
        <>
          {/* Sub-Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
            {[
              { id: "overview", label: "Skills Constellation", icon: Sparkles },
              { id: "dungeons", label: "Catacombs & Master Mode", icon: Skull },
              { id: "farming", label: "Farming Fortune & Yields", icon: Wheat },
              { id: "mining", label: "Mining Speed & Powder", icon: Pickaxe },
              { id: "combat", label: "Combat & Magic Find", icon: Swords },
              { id: "fishing", label: "Crimson Trophy Fish", icon: Fish },
              { id: "experiments", label: "Slayers & Experiments", icon: FlaskConical },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SkillTab)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all",
                    active
                      ? "border border-sky-400/40 bg-sky-500/20 text-white shadow-lg shadow-sky-500/10"
                      : "border border-white/5 bg-white/[0.02] text-white/60 hover:bg-white/[0.05] hover:text-white"
                  )}
                >
                  <Icon className="size-4 text-sky-400" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: SKILLS OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <Panel>
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="eyebrow">Skill Average</p>
                    <p className="mt-2 text-4xl font-semibold tracking-tight">
                      {data.skillAverage.toFixed(2)}{" "}
                      <span className="text-lg font-normal text-muted-foreground">/ 56.75</span>
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatFull(data.totalSkillXp)} total skill XP · {data.username}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs font-medium text-muted-foreground">
                    <span>Progress to Max Skill Average</span>
                    <span>{((data.skillAverage / 56.75) * 100).toFixed(1)}%</span>
                  </div>
                  <ProgressBar pct={Math.min(100, Math.round((data.skillAverage / 56.75) * 100))} />
                </div>

                {/* Radar Chart */}
                <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="eyebrow">Skill constellation</p>
                  <SkillRadar skills={data.skills} />
                </div>

                {/* Grid */}
                <div className="mt-6 grid gap-3 rounded-2xl bg-secondary/25 p-4 lg:grid-cols-2">
                  {data.skills.map((s) => (
                    <div
                      key={s.key}
                      className="glass-soft rounded-2xl px-5 py-4 transition-all duration-75 ease-out hover:scale-[1.01] hover:border-primary/30"
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <ItemIcon id={s.key} name={s.name} className="size-7 shrink-0" />
                          <p className="text-lg font-semibold">
                            {s.name} {s.level}
                            {s.maxed && (
                              <span className="ml-2 text-xs font-medium text-primary">MAXED</span>
                            )}
                          </p>
                        </div>
                        <p className="font-mono text-xs text-muted-foreground">
                          {s.maxed
                            ? `${formatNumber(s.totalXp)} XP`
                            : `${formatNumber(s.currentXp)} / ${formatNumber(s.neededXp)} XP`}
                        </p>
                      </div>
                      <div className="mt-3">
                        <ProgressBar pct={s.pct} />
                      </div>
                      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                        <span>Cap {s.cap}</span>
                        <span>{s.pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          )}

          {/* TAB 2: CATACOMBS & MASTER MODE TACTICAL HUB */}
          {activeTab === "dungeons" && (
            <div className="space-y-6">
              {/* Party Finder Readiness */}
              <Panel className="border-sky-500/20 bg-gradient-to-br from-sky-500/[0.04] via-transparent to-purple-500/[0.02]">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <span className={cn("rounded-xl border px-3 py-1 font-mono text-sm font-black", partyFinderEval.badgeClass)}>
                      {partyFinderEval.readinessRating === "Carry" && "👑 S+ CARRY"}
                      {partyFinderEval.readinessRating === "Qualified" && "🟢 QUALIFIED"}
                      {partyFinderEval.readinessRating === "Borderline" && "🟡 BORDERLINE"}
                      {partyFinderEval.readinessRating === "Undergeared" && "🔴 UNDERGEARED"}
                    </span>
                    <div>
                      <h2 className="text-xl font-bold text-white">Party Finder Reliability & Secrets Pace</h2>
                      <p className="text-xs text-white/50">{partyFinderEval.feedback}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                  <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                    <p className="text-xs text-white/50">Catacombs Level</p>
                    <p className="font-mono text-lg font-bold text-sky-300 mt-1">Cata {partyFinderEval.cataLevel}</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                    <p className="text-xs text-white/50">Total Secrets Found</p>
                    <p className="font-mono text-lg font-bold text-purple-300 mt-1">{partyFinderEval.totalSecrets.toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                    <p className="text-xs text-white/50">Secrets per Run</p>
                    <p className="font-mono text-lg font-bold text-emerald-300 mt-1">{partyFinderEval.secretsPerRun} s/r</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                    <p className="text-xs text-white/50">Secret Benchmark</p>
                    <p className="font-mono text-lg font-bold text-amber-300 mt-1">{partyFinderEval.secretBenchmark}</p>
                  </div>
                </div>
              </Panel>

              {/* Master Mode Clearance Odds */}
              <Panel>
                <h2 className="text-xl font-bold text-white mb-4">Master Mode Floor Clearance Odds (M1–M7)</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {masterModeOdds.map((m) => (
                    <div
                      key={m.floor}
                      className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur transition-all hover:border-purple-500/30"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">{m.name}</h3>
                        <span className={cn(
                          "rounded-lg border px-2 py-0.5 text-[10px] font-mono font-bold",
                          m.clearanceOddsPct >= 80 ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" :
                          m.clearanceOddsPct >= 50 ? "border-amber-500/30 text-amber-400 bg-amber-500/10" :
                          "border-red-500/30 text-red-400 bg-red-500/10"
                        )}>
                          {m.clearanceOddsPct}% Clearance Odds
                        </span>
                      </div>
                      <p className="text-xs text-white/50 mt-2">Prerequisite: Cata {m.recommendedCata}+</p>
                      <p className="text-[11px] text-white/40 mt-1 font-mono">Gear: {m.gearCheck}</p>
                    </div>
                  ))}
                </div>
              </Panel>

              {/* Floor Drop Chest Profitability & Expected Value */}
              <Panel>
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">Floor Drop Chest Profitability & EV</h2>
                    <p className="text-xs text-white/50">Expected net coin returns per S+ run after chest unlock costs</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {FLOOR_CHEST_LOOT_TABLES.map((floor) => (
                    <div
                      key={floor.floor}
                      className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur"
                    >
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div>
                          <h3 className="text-sm font-bold text-white">{floor.name}</h3>
                          <span className="font-mono text-xs font-bold text-emerald-400">
                            ~+{formatFull(floor.expectedValuePerRun)} EV / run
                          </span>
                        </div>
                        <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-mono font-bold text-white/80">
                          {floor.floor}
                        </span>
                      </div>

                      <div className="mt-3 space-y-1.5">
                        {floor.topDrops.map((drop) => (
                          <div
                            key={drop.name}
                            className="flex items-center justify-between rounded-lg bg-black/30 px-3 py-1.5 text-xs"
                          >
                            <span className="text-white/80">{drop.name} ({drop.fractionString})</span>
                            <span className="font-mono font-bold text-emerald-300">
                              +{formatFull(drop.netProfit)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              {/* Essence Star-Up Estimator */}
              <Panel>
                <h2 className="text-xl font-bold text-white mb-4">Essence & Master Star (6–10) Star-Up Costs</h2>
                <div className="grid gap-3 sm:grid-cols-3">
                  {starUpEstimates.map((s) => (
                    <div
                      key={s.itemType}
                      className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur"
                    >
                      <h3 className="text-sm font-bold text-white">{s.itemType}</h3>
                      <p className="text-xs text-white/50 mt-1">
                        1–5 Stars: {s.stars1to5Cost} {s.essenceType}
                      </p>
                      <p className="text-xs text-white/50">
                        6–10 Stars: Master Stars 1–5 (~280M)
                      </p>
                      <div className="mt-3 border-t border-white/10 pt-2 flex justify-between text-xs">
                        <span className="text-white/40">Total Star Value:</span>
                        <span className="font-mono font-bold text-amber-300">~{formatFull(s.totalCoinsValue)} coins</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              {/* Dungeon Floor Maps */}
              {data?.dungeons && (
                <Panel>
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h2 className="text-xl font-semibold">Floor Maps</h2>
                    <p className="text-xs text-muted-foreground">Catacombs & Master Mode ladder</p>
                  </div>

                  <div className="mt-4">
                    <p className="eyebrow mb-3">The Catacombs (Normal)</p>
                    <DungeonFloorMap floors={data.dungeons.floors} />
                  </div>

                  {data.dungeons.masterMode && data.dungeons.masterMode.length > 0 && (
                    <div className="mt-6">
                      <p className="eyebrow mb-3">
                        Master Mode
                        {data.dungeons.masterModeLevel != null &&
                          ` · Level ${data.dungeons.masterModeLevel}`}
                      </p>
                      <DungeonFloorMap floors={data.dungeons.masterMode} />
                    </div>
                  )}
                </Panel>
              )}
            </div>
          )}

          {/* TAB 3: FARMING FORTUNE & YIELDS */}
          {activeTab === "farming" && (
            <div className="space-y-6">
              <Panel className="border-amber-500/20 bg-gradient-to-br from-amber-500/[0.04] via-transparent to-orange-500/[0.02]">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <span className="font-mono text-3xl font-black text-amber-300">
                      +{farmingCalc.universalFortune} ☘ Farming Fortune
                    </span>
                    <p className="text-xs text-white/50 mt-1">
                      Calculated across Farming {farmingLvl}, Garden {gardenLvl}, Elephant Pet 100, and Fermento Armor
                    </p>
                  </div>
                </div>

                {/* Fortune Breakdown Grid */}
                <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                  {[
                    { label: "Farming Skill", value: `+${farmingCalc.breakdown.skill}` },
                    { label: "Garden Level", value: `+${farmingCalc.breakdown.garden}` },
                    { label: "Unlocked Plots", value: `+${farmingCalc.breakdown.plots}` },
                    { label: "Anita Bonus", value: `+${farmingCalc.breakdown.anita}` },
                    { label: "Armor Set", value: `+${farmingCalc.breakdown.armor}` },
                    { label: "T3 Hoe / Dicer", value: `+${farmingCalc.breakdown.toolBase}` },
                    { label: "Enchants (Dedication/Cult.)", value: `+${farmingCalc.breakdown.enchants}` },
                    { label: "Elephant Pet & Bandana", value: `+${farmingCalc.breakdown.pet + farmingCalc.breakdown.equipment}` },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-white/5 bg-black/30 p-3">
                      <p className="text-xs text-white/50">{stat.label}</p>
                      <p className="font-mono text-base font-bold text-amber-300 mt-1">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </Panel>

              {/* Crop Yields Table */}
              <Panel>
                <h2 className="text-xl font-bold text-white mb-4">Estimated Crop Yields & Coin Production</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {farmingCalc.cropYields.map((cy) => (
                    <div
                      key={cy.crop.id}
                      className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur transition-all hover:border-amber-500/30"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{cy.crop.icon}</span>
                        <div>
                          <h3 className="text-sm font-bold text-white">{cy.crop.name}</h3>
                          <span className="font-mono text-[10px] text-amber-400">
                            +{cy.fortune} Dedicated Fortune
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 space-y-1.5 rounded-xl bg-black/30 p-2.5 text-xs">
                        <div className="flex justify-between text-white/60">
                          <span>Harvest / Hour:</span>
                          <span className="font-mono text-white">{formatFull(cy.cropsPerHour)} items</span>
                        </div>
                        <div className="flex justify-between text-white/60">
                          <span>Coins / Hour:</span>
                          <span className="font-mono font-bold text-emerald-400">
                            ~{formatFull(cy.coinsPerHour)} coins/hr
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              {/* Garden Visitor Queue Profitability Matrix */}
              <Panel>
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">Garden Visitor Queue Profitability Matrix</h2>
                    <p className="text-xs text-white/50">Evaluates material costs vs Copper, Dedication IV, and Overgrown Grass value</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {NOTABLE_GARDEN_VISITORS.map((v) => {
                    const evalResult = evaluateVisitorOffer(v, v.rarity === "SPECIAL" ? 50_000_000 : 150_000);
                    return (
                      <div
                        key={v.name}
                        className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-white">{v.name}</h3>
                          <span className="rounded-lg border border-sky-400/40 bg-sky-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-sky-300">
                            {v.rarity}
                          </span>
                        </div>
                        <div className="mt-3 space-y-1 text-xs text-white/60">
                          <div className="flex justify-between">
                            <span>Rewards:</span>
                            <span className="font-mono text-amber-300">+{v.copperReward} Copper · +{formatNumber(v.farmingXp)} XP</span>
                          </div>
                          {v.rareDrop && (
                            <div className="flex justify-between text-purple-300">
                              <span>Rare Drop:</span>
                              <span className="font-mono font-bold">{v.rareDrop.name} ({v.rareDrop.dropRate})</span>
                            </div>
                          )}
                          <div className="flex justify-between border-t border-white/10 pt-1.5 font-bold">
                            <span className="text-white/80">Recommendation:</span>
                            <span style={{ color: evalResult.color }}>{evalResult.recommendation}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Panel>

              {/* Crop Pest Spawn Timers & Vinyl Drops */}
              <Panel>
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">Crop Pest Spawn Intervals & Extermination</h2>
                    <p className="text-xs text-white/50">Average ~3.5 min spawn intervals with max repellent · Vinyl drops & Fortune bonus</p>
                  </div>
                  <span className="rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 font-mono text-xs font-bold text-emerald-300">
                    ~17 Pests / Hour
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                  {PEST_TYPES.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-xl border border-white/5 bg-black/30 p-3"
                    >
                      <h3 className="text-xs font-bold text-white">{p.name}</h3>
                      <p className="text-[10px] text-white/50 mt-1">Crops: {p.favoredCrops.join(", ")}</p>
                      <div className="mt-2 flex justify-between text-[11px] font-mono">
                        <span className="text-sky-300">{p.vinylDrop}</span>
                        <span className="text-emerald-400">+{formatFull(p.baseDropCoins)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              {/* Optimal Crop Speed & Angle Tuning Guide */}
              <Panel>
                <h2 className="text-xl font-bold text-white mb-4">Optimal Crop Speed & Angle Tuning Guide (20 BPS Max)</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {CROP_TUNING_GUIDES.map((g) => (
                    <div
                      key={g.crop}
                      className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur"
                    >
                      <h3 className="text-sm font-bold text-white">{g.crop}</h3>
                      <div className="mt-2 space-y-1 text-xs text-white/60">
                        <div className="flex justify-between">
                          <span>Optimal Speed:</span>
                          <span className="font-mono font-bold text-amber-300">{g.optimalSpeed}% Speed</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Angles (Yaw / Pitch):</span>
                          <span className="font-mono text-sky-300">{g.yawAngle} / {g.pitchAngle}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Recommended Tool:</span>
                          <span className="font-mono text-white/80">{g.recommendedTool}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-white/40 mt-2 border-t border-white/10 pt-2">{g.notes}</p>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          )}

          {/* TAB 4: MINING SPEED & POWDER */}
          {activeTab === "mining" && (
            <div className="space-y-6">
              <Panel className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.04] via-transparent to-blue-500/[0.02]">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="font-mono text-3xl font-black text-cyan-300">
                        {miningCalc.miningSpeed.toLocaleString()} ⸕ Mining Speed
                      </span>
                      <p className="text-xs text-white/50 mt-1">Divan's Drill + Amber Engine + Blue Cheese Omelette</p>
                    </div>
                    <div>
                      <span className="font-mono text-3xl font-black text-emerald-300">
                        +{miningCalc.miningFortune} ☘ Mining Fortune
                      </span>
                      <p className="text-xs text-white/50 mt-1">HOTM 10 + Powder Allocations</p>
                    </div>
                  </div>
                </div>

                {/* Gemstone Break Speed Ticks */}
                <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                  <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                    <p className="text-xs text-white/50">Hard Stone Break</p>
                    <p className="font-mono text-base font-bold text-cyan-300 mt-1">{miningCalc.blockBreakTicks.hardStone} ticks (Instant)</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                    <p className="text-xs text-white/50">Mithril Break</p>
                    <p className="font-mono text-base font-bold text-cyan-300 mt-1">{miningCalc.blockBreakTicks.mithril} ticks (~0.35s)</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                    <p className="text-xs text-white/50">Ruby Gemstone Break</p>
                    <p className="font-mono text-base font-bold text-cyan-300 mt-1">{miningCalc.blockBreakTicks.rubyGemstone} ticks (~1.2s)</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                    <p className="text-xs text-white/50">Jasper Gemstone Break</p>
                    <p className="font-mono text-base font-bold text-cyan-300 mt-1">{miningCalc.blockBreakTicks.jasperGemstone} ticks (~1.8s)</p>
                  </div>
                </div>
              </Panel>
            </div>
          )}

          {/* TAB 5: COMBAT & MAGIC FIND */}
          {activeTab === "combat" && (
            <div className="space-y-6">
              <Panel className="border-purple-500/20 bg-gradient-to-br from-purple-500/[0.04] via-transparent to-pink-500/[0.02]">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <span className="font-mono text-3xl font-black text-purple-300">
                      +{combatCalc.totalMagicFind} ✯ True Magic Find
                    </span>
                    <p className="text-xs text-white/50 mt-1">
                      Golden Dragon 200 + Minos Relic + Sorrow Armor + Enrichments + God Potion
                    </p>
                  </div>
                </div>

                {/* Magic Find Breakdown */}
                <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                  <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                    <p className="text-xs text-white/50">GDrag Pet (Level 200)</p>
                    <p className="font-mono text-base font-bold text-purple-300 mt-1">+{combatCalc.breakdown.pet} MF</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                    <p className="text-xs text-white/50">Sorrow Armor Set</p>
                    <p className="font-mono text-base font-bold text-purple-300 mt-1">+{combatCalc.breakdown.armor} MF</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                    <p className="text-xs text-white/50">God Potion & Cookie</p>
                    <p className="font-mono text-base font-bold text-purple-300 mt-1">+{combatCalc.breakdown.buffs} MF</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                    <p className="text-xs text-white/50">Enrichments & Bestiary</p>
                    <p className="font-mono text-base font-bold text-purple-300 mt-1">+{combatCalc.breakdown.enrichments + combatCalc.breakdown.bestiary} MF</p>
                  </div>
                </div>
              </Panel>

              {/* Rare Drops Probability Table */}
              <Panel>
                <h2 className="text-xl font-bold text-white mb-4">Slayer & Dungeon Drop Probability at +{combatCalc.totalMagicFind} MF</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {combatCalc.drops.map((d) => (
                    <div
                      key={d.drop.id}
                      className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur transition-all hover:border-purple-500/30"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{d.drop.icon}</span>
                        <div>
                          <h3 className="text-sm font-bold text-white">{d.drop.name}</h3>
                          <span className="font-mono text-[10px] text-white/40">{d.drop.source}</span>
                        </div>
                      </div>
                      <div className="mt-3 space-y-1 rounded-xl bg-black/30 p-2.5 text-xs">
                        <div className="flex justify-between text-white/50">
                          <span>Base Drop Rate:</span>
                          <span className="font-mono">{d.drop.baseFractionString}</span>
                        </div>
                        <div className="flex justify-between font-bold text-emerald-300">
                          <span>Adjusted Odds:</span>
                          <span className="font-mono">{d.adjustedFraction} ({d.percentageChance}%)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          )}

          {/* TAB 6: CRIMSON TROPHY FISH */}
          {activeTab === "fishing" && (
            <div className="space-y-6">
              <Panel className="border-rose-500/20 bg-gradient-to-br from-rose-500/[0.04] via-transparent to-red-500/[0.02]">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-xl border border-rose-400/40 bg-rose-500/15 px-3 py-1 font-mono text-lg font-black text-rose-300">
                        {trophyCalc.odgerRank}
                      </span>
                      <h2 className="text-2xl font-bold text-white">Crimson Isle Trophy Fish</h2>
                    </div>
                    <p className="text-xs text-white/50 mt-1">
                      {trophyCalc.uniqueSpecies} / 17 species discovered · {trophyCalc.diamondTierCount} Diamond Tiers
                    </p>
                  </div>
                </div>

                {/* 17 Species Grid */}
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {trophyCalc.trophyProgress.map((tp) => (
                    <div
                      key={tp.species.id}
                      className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur transition-all hover:border-rose-500/30"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">{tp.species.name}</h3>
                        <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-mono text-white/60">
                          {tp.species.rarity}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/40 mt-1">Condition: {tp.species.specialCondition}</p>
                      <div className="mt-3 grid grid-cols-4 gap-1 text-center text-[10px] font-mono font-bold">
                        <span className="rounded bg-amber-950/40 border border-amber-800/40 py-1 text-amber-600">
                          B: {tp.counts.BRONZE}
                        </span>
                        <span className="rounded bg-slate-800/40 border border-slate-600/40 py-1 text-slate-300">
                          S: {tp.counts.SILVER}
                        </span>
                        <span className="rounded bg-yellow-950/40 border border-yellow-500/40 py-1 text-yellow-400">
                          G: {tp.counts.GOLD}
                        </span>
                        <span className="rounded bg-cyan-950/40 border border-cyan-500/40 py-1 text-cyan-300">
                          D: {tp.counts.DIAMOND}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          )}

          {/* TAB 7: EXPERIMENTS & SLAYERS */}
          {activeTab === "experiments" && (
            <div className="space-y-6">
              {/* Slayer Passives */}
              {data?.slayerOverview && (
                <Panel className="border-rose-500/20 bg-gradient-to-br from-rose-500/[0.03] via-transparent to-amber-500/[0.02]">
                  <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-white/10 pb-4">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-white">Slayer Progression & Passives</h2>
                      <p className="text-xs text-white/50">
                        {data.slayerOverview.totalXp.toLocaleString()} total Slayer XP · {data.slayerOverview.totalKills.toLocaleString()} boss kills
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-400">
                        +{data.slayerOverview.passives.health} HP
                      </span>
                      <span className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-400">
                        +{data.slayerOverview.passives.critDamage}% Crit Dmg
                      </span>
                      <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400">
                        +{data.slayerOverview.passives.speed} Speed
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {data.slayerOverview.bosses.map((boss) => (
                      <div
                        key={boss.id}
                        className="rounded-xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white">{boss.name}</span>
                          <span className="rounded-lg border border-rose-500/40 bg-rose-500/15 px-2 py-0.5 font-mono text-xs font-black text-rose-300">
                            LVL {boss.level}
                          </span>
                        </div>
                        <div className="mt-2 text-xs font-mono text-white/60">
                          {boss.currentXp.toLocaleString()} XP · {boss.totalKills.toLocaleString()} Kills
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>
              )}

              {/* Experimentation Table Superpairs */}
              <Panel>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">Experimentation Table: Superpairs T7 Odds</h2>
                    <p className="text-xs text-white/50">Expected games to hit high-tier enchantments at Grand/Titanic costs</p>
                  </div>
                  <span className="font-mono text-xs font-bold text-sky-400">
                    ~{formatFull(experimentCalc.expectedDailyEnchantXp)} XP / day
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {experimentCalc.t7Enchants.map((t7) => (
                    <div
                      key={t7.name}
                      className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">{t7.name}</h3>
                        <span className="font-mono text-xs font-bold text-emerald-400">
                          ~{formatFull(t7.marketValue)} coins
                        </span>
                      </div>
                      <div className="mt-3 space-y-1 text-xs text-white/60">
                        <div className="flex justify-between">
                          <span>Drop Odds:</span>
                          <span className="font-mono">1 in {t7.expectedGamesToHit} games</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          )}
        </>
      )}
    </div>
  );
}

