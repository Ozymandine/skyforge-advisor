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
  Compass,
  Hourglass,
  Moon,
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
import {
  getFactionStatus,
  evaluateKuudraReadiness,
  CRIMSON_ARMOR_TIERS,
  KUUDRA_T5_CHEST_DROPS,
} from "@/lib/kuudra-engine";
import {
  calculateRiftTime,
  RIFT_TIMECHARMS,
  VAMPIRE_SLAYER_TIERS,
  RIFT_EXPORT_ITEMS,
} from "@/lib/rift-engine";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/skills")({
  head: () => ({
    meta: [
      { title: "Skills & Specialization Suites — SkyForge Advisor" },
      {
        name: "description",
        content:
          "Track every SkyBlock skill, Catacombs tactical hub, Crimson Isle & Kuudra engine, Rift Dimension timecharms, Farming Fortune, and Trophy Fish.",
      },
      { property: "og:title", content: "Skills & Specialization Suites — SkyForge Advisor" },
      {
        property: "og:description",
        content: "Complete skill mastery hubs with specialized calculators for Dungeons, Kuudra, Rift, Farming, Mining, Combat, and Fishing.",
      },
    ],
  }),
  component: SkillsRoute,
});

type SkillTab =
  | "overview"
  | "dungeons"
  | "kuudra"
  | "rift"
  | "farming"
  | "mining"
  | "combat"
  | "fishing"
  | "experiments";

function SkillsRoute() {
  const { data, isLoading, error, connected } = usePlayer();
  const [activeTab, setActiveTab] = useState<SkillTab>("overview");

  // Dungeons Telemetry
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

  // Kuudra & Faction Telemetry
  const combatLvl = data?.skills.find((s) => s.key === "COMBAT")?.level ?? 35;
  const factionStatus = useMemo(() => getFactionStatus(14500, "MAGE"), []);
  const kuudraReadiness = useMemo(
    () => evaluateKuudraReadiness(combatLvl, true, true, true, true),
    [combatLvl]
  );

  // Rift Telemetry
  const riftTime = useMemo(() => calculateRiftTime(4, 7, 6), []);

  // Farming & Mining
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
        description="Skill levels, Catacombs tactical breakdowns, Crimson Isle & Kuudra hubs, The Rift Dimension, Farming Fortune, and Trophy Fish."
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
              { id: "kuudra", label: "Crimson Isle & Kuudra", icon: Flame },
              { id: "rift", label: "The Rift Dimension", icon: Moon },
              { id: "farming", label: "Farming & Garden", icon: Wheat },
              { id: "mining", label: "Mining & Powder", icon: Pickaxe },
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
                    "flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all",
                    active
                      ? "border border-sky-400/40 bg-sky-500/20 text-white shadow-lg shadow-sky-500/10"
                      : "border border-white/5 bg-white/[0.02] text-white/60 hover:bg-white/[0.05] hover:text-white"
                  )}
                >
                  <Icon className="size-3.5 text-sky-400" />
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

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs font-medium text-muted-foreground">
                    <span>Progress to Max Skill Average</span>
                    <span>{((data.skillAverage / 56.75) * 100).toFixed(1)}%</span>
                  </div>
                  <ProgressBar pct={Math.min(100, Math.round((data.skillAverage / 56.75) * 100))} />
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="eyebrow">Skill constellation</p>
                  <SkillRadar skills={data.skills} />
                </div>

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
                      className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur"
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

              {/* Floor Drop Chest Profitability */}
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
            </div>
          )}

          {/* TAB 3: CRIMSON ISLE & KUUDRA HUB */}
          {activeTab === "kuudra" && (
            <div className="space-y-6">
              {/* Faction Reputation Banner */}
              <Panel className="border-red-500/20 bg-gradient-to-br from-red-500/[0.04] via-transparent to-amber-500/[0.02]">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-xl border border-red-500/40 bg-red-500/15 px-3 py-1 font-mono text-base font-black text-red-300">
                        {factionStatus.faction} · {factionStatus.tierName}
                      </span>
                      <h2 className="text-2xl font-bold text-white">Faction Reputation: {factionStatus.reputation.toLocaleString()} / 27,000</h2>
                    </div>
                    <p className="text-xs text-white/50 mt-1">
                      {factionStatus.isMaxed ? "Maxed reputation tier achieved!" : `${factionStatus.repToNext.toLocaleString()} rep needed for next tier`}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {factionStatus.perks.map((p) => (
                    <span key={p} className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-1 text-xs text-white/80">
                      ✓ {p}
                    </span>
                  ))}
                </div>
              </Panel>

              {/* Kuudra Tier Gateways (T1-T5) */}
              <Panel>
                <h2 className="text-xl font-bold text-white mb-4">Kuudra Tier Gateways & Party Requirements (T1–T5)</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {kuudraReadiness.map((k) => (
                    <div
                      key={k.tier.name}
                      className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">T{k.tier.tierNumber}: {k.tier.name} Kuudra</h3>
                        <span className={cn(
                          "rounded-lg border px-2 py-0.5 text-[10px] font-mono font-bold",
                          k.qualified ? "border-emerald-500/30 text-emerald-300 bg-emerald-500/10" : "border-red-500/30 text-red-300 bg-red-500/10"
                        )}>
                          {k.qualified ? "QUALIFIED" : "UNQUALIFIED"}
                        </span>
                      </div>
                      <div className="mt-3 space-y-1 text-xs text-white/60">
                        <div className="flex justify-between">
                          <span>Combat Level:</span>
                          <span className="font-mono text-white">Combat {k.tier.combatRequirement}+</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Key Cost / Profit:</span>
                          <span className="font-mono text-emerald-400">~+{formatFull(k.tier.expectedProfitPerRun)} / run</span>
                        </div>
                      </div>
                      <div className="mt-2 text-[11px] font-mono text-white/40">
                        Gear: {k.tier.requiredWeapons.join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              {/* Crimson Armor Tier-Up Engine */}
              <Panel>
                <h2 className="text-xl font-bold text-white mb-4">Crimson / Aurora / Terror Armor Tier-Up Scaling</h2>
                <div className="grid gap-3 sm:grid-cols-5">
                  {CRIMSON_ARMOR_TIERS.map((tier) => (
                    <div key={tier.tierName} className="rounded-xl border border-white/5 bg-black/30 p-3 text-xs">
                      <h3 className="font-bold text-white text-sm">{tier.tierName} Tier (10★)</h3>
                      <div className="mt-2 space-y-1 text-white/60">
                        <p>Essence: {tier.crimsonEssenceCost.toLocaleString()}</p>
                        <p>Kuudra Teeth: {tier.kuudraTeethCost}</p>
                        <p>Heavy Pearls: {tier.heavyPearlsCost}</p>
                        <p className="font-bold text-amber-300 pt-1 border-t border-white/10">~{formatFull(tier.coinsValue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          )}

          {/* TAB 4: THE RIFT DIMENSION */}
          {activeTab === "rift" && (
            <div className="space-y-6">
              {/* Rift Time Banner */}
              <Panel className="border-indigo-500/20 bg-gradient-to-br from-indigo-500/[0.04] via-transparent to-purple-500/[0.02]">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-xl border border-indigo-400/40 bg-indigo-500/15 px-3 py-1 font-mono text-xl font-black text-indigo-300">
                        {riftTime.formatted}
                      </span>
                      <h2 className="text-2xl font-bold text-white">Dimensional Rift Time</h2>
                    </div>
                    <p className="text-xs text-white/50 mt-1">Base 8m + Infused Armor + 8 Timecharms + Bottled Ooze</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-white/5 bg-black/30 p-3 text-xs">
                    <p className="text-white/50">Base Time</p>
                    <p className="font-mono text-base font-bold text-indigo-300 mt-1">{riftTime.breakdown.base}s</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/30 p-3 text-xs">
                    <p className="text-white/50">Infused Armor</p>
                    <p className="font-mono text-base font-bold text-indigo-300 mt-1">+{riftTime.breakdown.armor}s</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/30 p-3 text-xs">
                    <p className="text-white/50">Timecharms</p>
                    <p className="font-mono text-base font-bold text-indigo-300 mt-1">+{riftTime.breakdown.timecharms}s</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/30 p-3 text-xs">
                    <p className="text-white/50">Bottled Ooze</p>
                    <p className="font-mono text-base font-bold text-indigo-300 mt-1">+{riftTime.breakdown.ooze}s</p>
                  </div>
                </div>
              </Panel>

              {/* Vampire Slayer (Bloodfiend T1-T5) */}
              <Panel>
                <h2 className="text-xl font-bold text-white mb-4">Vampire Slayer (Riftstalker Bloodfiend T1–T5)</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {VAMPIRE_SLAYER_TIERS.map((vamp) => (
                    <div key={vamp.name} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">Tier {vamp.tier}: {vamp.name}</h3>
                        <span className="font-mono text-xs font-bold text-rose-400">{vamp.hp} HP</span>
                      </div>
                      <div className="mt-3 space-y-1 text-xs text-white/60">
                        <p>Required Stake: <span className="font-mono text-white">{vamp.requiredWeapon}</span></p>
                        <p>Motes Cost: <span className="font-mono text-indigo-300">{vamp.moteCost.toLocaleString()} Motes</span></p>
                        <div className="mt-2 border-t border-white/10 pt-2 text-[11px] text-white/50">
                          Mechanics: {vamp.mechanics.join(" · ")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              {/* Motes Export Economy */}
              <Panel>
                <h2 className="text-xl font-bold text-white mb-4">Rift Motes Export Economy & Real-SkyBlock Conversion</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {RIFT_EXPORT_ITEMS.map((item) => (
                    <div key={item.name} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur">
                      <h3 className="text-sm font-bold text-white">{item.name}</h3>
                      <div className="mt-3 space-y-1 text-xs text-white/60">
                        <p>Cost: <span className="font-mono text-indigo-300">{item.motesCost.toLocaleString()} Motes</span></p>
                        <p>SkyBlock Value: <span className="font-mono font-bold text-emerald-400">~{formatFull(item.realSkyBlockValueCoins)}</span></p>
                        <p className="text-sky-300 font-mono text-[11px] pt-1 border-t border-white/10">{item.coinsPerMote} coins / Mote</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          )}

          {/* TAB 5: FARMING & GARDEN */}
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
                      className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur"
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
            </div>
          )}

          {/* TAB 6: MINING & POWDER */}
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

          {/* TAB 7: COMBAT & MAGIC FIND */}
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
            </div>
          )}

          {/* TAB 8: CRIMSON TROPHY FISH */}
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

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {trophyCalc.trophyProgress.map((tp) => (
                    <div
                      key={tp.species.id}
                      className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur"
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

          {/* TAB 9: EXPERIMENTS & SLAYERS */}
          {activeTab === "experiments" && (
            <div className="space-y-6">
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
            </div>
          )}
        </>
      )}
    </div>
  );
}
