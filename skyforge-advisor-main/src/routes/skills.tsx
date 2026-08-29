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
  Search,
  Heart,
  Shield,
  Trophy,
} from "lucide-react";

import { ConnectPrompt, ErrorState, LoadState } from "@/components/data-states";
import { Chip, PageHero, Panel, ProgressBar, StatRow } from "@/components/layout/app-shell";
import { ItemIcon } from "@/components/ui/item-icon";
import { playClickSound } from "@/lib/sound-effects";
import { calculateBestiary } from "@/lib/bestiary";
import {
  HOTM_NODES,
  HOTM_PRESETS,
  calculateTotalHotmBonus,
  HOTM_TIER_XP_REQUIREMENTS,
  type HotmNode,
} from "@/lib/hotm-engine";
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
  validateSearch: (search: Record<string, unknown>): { tab?: SkillTab } => ({
    tab: (search["tab"] as SkillTab) || "overview",
  }),
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
        content:
          "Complete skill mastery hubs with specialized calculators for Dungeons, Kuudra, Rift, Farming, Mining, Combat, and Fishing.",
      },
    ],
  }),
  component: SkillsRoute,
});

type SkillTab =
  | "overview"
  | "bestiary"
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
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const activeTab: SkillTab = search.tab || "overview";
  const setActiveTab = (tab: SkillTab) => {
    playClickSound();
    navigate({ search: (prev) => ({ ...prev, tab }) });
  };
  const [bestiaryZone, setBestiaryZone] = useState<string>("all");
  const [bestiarySearch, setBestiarySearch] = useState<string>("");
  const [bestiaryFilter, setBestiaryFilter] = useState<"all" | "incomplete" | "maxed">("all");
  const [selectedHotmNode, setSelectedHotmNode] = useState<HotmNode | null>(HOTM_NODES[0] ?? null);
  const [customHotmAllocations, setCustomHotmAllocations] = useState<Record<string, number>>(
    () => ({
      mining_speed: 50,
      mining_fortune: 50,
      mining_speed_2: 50,
      mining_fortune_2: 50,
      powder_buff: 50,
      mining_speed_boost: 1,
      peak_of_the_mountain: 7,
    }),
  );

  const hotmBonus = useMemo(() => {
    return calculateTotalHotmBonus(customHotmAllocations);
  }, [customHotmAllocations]);

  // Dungeons Telemetry
  const cataLvl = data?.dungeons?.catacombsLevel ?? 30;
  const secretsFound = data?.dungeons?.secretsFound ?? 12_500;
  const totalRuns =
    (data?.dungeons?.floors?.reduce((sum, f) => sum + f.completions, 0) ?? 0) +
      (data?.dungeons?.masterMode?.reduce((sum, f) => sum + f.completions, 0) ?? 0) || 1200;

  const partyFinderEval = useMemo(
    () => evaluatePartyFinderReadiness(cataLvl, secretsFound, totalRuns, "F7"),
    [cataLvl, secretsFound, totalRuns],
  );
  const masterModeOdds = useMemo(() => calculateMasterModeOdds(cataLvl, true, true), [cataLvl]);
  const starUpEstimates = useMemo(() => getStarUpEstimates(2800), []);

  // Kuudra & Faction Telemetry
  const combatLvl = data?.skills.find((s) => s.key === "COMBAT")?.level ?? 35;
  const factionStatus = useMemo(() => getFactionStatus(14500, "MAGE"), []);
  const kuudraReadiness = useMemo(
    () => evaluateKuudraReadiness(combatLvl, true, true, true, true),
    [combatLvl],
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
    [farmingLvl, gardenLvl],
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
    [miningLvl, hotmTier, data],
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
    [data],
  );

  const trophyCalc = useMemo(
    () =>
      calculateTrophyProgress((data?.crimson?.dojo as Record<string, number> | undefined) ?? {}),
    [data],
  );

  const experimentCalc = useMemo(
    () => getExperimentationOverview(data?.skills.find((s) => s.key === "ENCHANTING")?.level ?? 60),
    [data],
  );

  const bestiaryData = useMemo(() => {
    return data?.bestiary ?? calculateBestiary({});
  }, [data?.bestiary]);

  const filteredBestiaryFamilies = useMemo(() => {
    const families = bestiaryData.families ?? [];
    return families
      .filter((fam) => {
        if (bestiaryZone !== "all" && fam.id !== bestiaryZone) return false;
        return true;
      })
      .map((fam) => {
        const matchingMobs = fam.mobs.filter((mob) => {
          if (bestiarySearch && !mob.name.toLowerCase().includes(bestiarySearch.toLowerCase())) {
            return false;
          }
          if (bestiaryFilter === "incomplete" && mob.tier >= mob.maxTier) return false;
          if (bestiaryFilter === "maxed" && mob.tier < mob.maxTier) return false;
          return true;
        });
        return {
          ...fam,
          mobs: matchingMobs,
        };
      })
      .filter((fam) => fam.mobs.length > 0);
  }, [bestiaryData.families, bestiaryZone, bestiarySearch, bestiaryFilter]);

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
          {/* Sub-Navigation Tabs Grid (Equal-Width, Zero Scrollbars) */}
          <div className="rounded-2xl border border-white/10 bg-[#0E121B]/80 backdrop-blur-xl p-2 shadow-xl">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
              {[
                { id: "overview", label: "Skills Constellation", icon: Sparkles },
                { id: "bestiary", label: "Bestiary & Mobs", icon: Crosshair },
                { id: "dungeons", label: "Catacombs & Dungeons", icon: Skull },
                { id: "kuudra", label: "Crimson & Kuudra", icon: Flame },
                { id: "rift", label: "The Rift Dimension", icon: Moon },
                { id: "farming", label: "Farming & Garden", icon: Wheat },
                { id: "mining", label: "Mining & HOTM", icon: Pickaxe },
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
                      "group relative flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold transition-all duration-150 cursor-pointer select-none border",
                      active
                        ? "bg-gradient-to-r from-emerald-500/25 via-teal-500/20 to-emerald-500/15 text-white border-emerald-500/50 shadow-md shadow-emerald-500/20"
                        : "bg-white/[0.02] text-white/65 hover:bg-white/[0.06] hover:text-white border-white/[0.04] hover:border-white/10",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-3.5 shrink-0 transition-colors",
                        active ? "text-emerald-400" : "text-white/40 group-hover:text-white/80",
                      )}
                    />
                    <span className="truncate">{tab.label}</span>
                    {active && (
                      <span className="size-1.5 shrink-0 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
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

          {/* TAB 2: BESTIARY & MOB ELIMINATION HUB */}
          {activeTab === "bestiary" && (
            <div className="space-y-6">
              {/* Bestiary Stats Overview Banner */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Panel className="bg-slate-900/60 border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Total Mob Kills
                    </span>
                    <Crosshair className="size-4 text-primary" />
                  </div>
                  <p className="mt-2 text-2xl font-bold font-mono text-white">
                    {bestiaryData.totalKills.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Across {bestiaryData.families.length} SkyBlock zones
                  </p>
                </Panel>

                <Panel className="bg-slate-900/60 border-amber-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Bestiary Milestone
                    </span>
                    <Trophy className="size-4 text-amber-400" />
                  </div>
                  <p className="mt-2 text-2xl font-bold font-mono text-amber-300">
                    Milestone {bestiaryData.milestone}
                  </p>
                  <div className="mt-2">
                    <ProgressBar pct={bestiaryData.milestoneProgressPct} tone="gold" />
                    <span className="mt-1 block text-[10px] text-muted-foreground">
                      {bestiaryData.totalTiersUnlocked} / {bestiaryData.maxTiers} total tiers
                      unlocked
                    </span>
                  </div>
                </Panel>

                <Panel className="bg-slate-900/60 border-emerald-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                      Permanent Stat Perks
                    </span>
                    <ShieldCheck className="size-4 text-emerald-400" />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5 font-mono text-xs font-bold">
                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-emerald-300">
                      +{bestiaryData.milestone} HP
                    </span>
                    <span className="rounded bg-blue-500/10 px-2 py-0.5 text-blue-300">
                      +{bestiaryData.milestone} Def
                    </span>
                    <span className="rounded bg-red-500/10 px-2 py-0.5 text-red-300">
                      +{bestiaryData.milestone} Str
                    </span>
                    <span className="rounded bg-purple-500/10 px-2 py-0.5 text-purple-300">
                      +{Math.floor(bestiaryData.milestone / 10)} MF
                    </span>
                  </div>
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    Awarded automatically to all combat stats
                  </p>
                </Panel>

                <Panel className="bg-slate-900/60 border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
                      Combat XP Bonus
                    </span>
                    <Sparkles className="size-4 text-purple-400" />
                  </div>
                  <p className="mt-2 text-2xl font-bold font-mono text-purple-200">
                    +{(bestiaryData.milestone * 1_000_000).toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">+1M Combat XP per milestone</p>
                </Panel>
              </div>

              {/* Filters & Zone Selector */}
              <div className="space-y-3">
                {/* Zone Filter Chips */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <Chip
                    active={bestiaryZone === "all"}
                    onClick={() => {
                      playClickSound();
                      setBestiaryZone("all");
                    }}
                  >
                    All Zones
                  </Chip>
                  {bestiaryData.families.map((fam) => (
                    <Chip
                      key={fam.id}
                      active={bestiaryZone === fam.id}
                      onClick={() => {
                        playClickSound();
                        setBestiaryZone(fam.id);
                      }}
                    >
                      {fam.name} ({fam.tiersUnlocked}/{fam.maxTiers})
                    </Chip>
                  ))}
                </div>

                {/* Search Bar & Progress Filter */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search mobs (e.g. Zealot, Ghost, Scatha)..."
                      value={bestiarySearch}
                      onChange={(e) => setBestiarySearch(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/80 pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {(["all", "incomplete", "maxed"] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          playClickSound();
                          setBestiaryFilter(status);
                        }}
                        className={cn(
                          "rounded-lg px-3 py-1 text-xs font-semibold transition-all",
                          bestiaryFilter === status
                            ? "bg-primary text-primary-foreground shadow"
                            : "border border-white/10 bg-white/5 text-muted-foreground hover:text-white",
                        )}
                      >
                        {status === "all"
                          ? "All Mobs"
                          : status === "incomplete"
                            ? "Needs Kills"
                            : "Maxed Tiers"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mob Groups by Zone */}
              <div className="space-y-6">
                {filteredBestiaryFamilies.map((fam) => (
                  <Panel key={fam.id} className="bg-slate-950/80">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-base font-bold text-white">{fam.name}</h3>
                        <span className="rounded bg-white/5 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                          {fam.totalKills.toLocaleString()} kills · {fam.tiersUnlocked}/
                          {fam.maxTiers} tiers
                        </span>
                      </div>
                      <span className="text-xs font-mono text-primary font-bold">
                        {Math.round((fam.tiersUnlocked / fam.maxTiers) * 100)}% Zone Mastery
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {fam.mobs.map((mob) => {
                        const isMaxed = mob.tier >= mob.maxTier;
                        const progressPct = mob.nextTierKills
                          ? Math.min(100, Math.round((mob.kills / mob.nextTierKills) * 100))
                          : 100;
                        const remainingKills = mob.nextTierKills
                          ? Math.max(0, mob.nextTierKills - mob.kills)
                          : 0;

                        return (
                          <div
                            key={mob.id}
                            className="group rounded-xl border border-white/5 bg-black/40 p-3.5 transition-all hover:border-primary/40 hover:bg-black/60"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h4 className="truncate text-sm font-bold text-white group-hover:text-primary transition-colors">
                                  {mob.name}
                                </h4>
                                <p className="font-mono text-xs font-semibold text-emerald-400 mt-0.5">
                                  {mob.kills.toLocaleString()} kills
                                </p>
                              </div>
                              <span
                                className={cn(
                                  "shrink-0 rounded-lg px-2 py-0.5 font-mono text-[10px] font-bold",
                                  isMaxed
                                    ? "border border-amber-500/40 bg-amber-500/15 text-amber-300"
                                    : "border border-sky-500/30 bg-sky-500/10 text-sky-300",
                                )}
                              >
                                {isMaxed
                                  ? `MAX TIER ${mob.tier} ✪`
                                  : `Tier ${mob.tier} / ${mob.maxTier}`}
                              </span>
                            </div>

                            {/* Kill Progress Bar to Next Tier */}
                            <div className="mt-3 space-y-1">
                              <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                                <span>
                                  {isMaxed
                                    ? "Mastered"
                                    : `${mob.kills.toLocaleString()} / ${mob.nextTierKills?.toLocaleString()}`}
                                </span>
                                <span className="font-bold text-white">{progressPct}%</span>
                              </div>
                              <ProgressBar pct={progressPct} tone={isMaxed ? "emerald" : "gold"} />
                              {!isMaxed && remainingKills > 0 && (
                                <span className="block text-[10px] text-muted-foreground/80 font-mono">
                                  {remainingKills.toLocaleString()} kills to Tier {mob.tier + 1}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Panel>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CATACOMBS & MASTER MODE TACTICAL HUB */}
          {activeTab === "dungeons" && (
            <div className="space-y-6">
              <Panel className="border-sky-500/20 bg-gradient-to-br from-sky-500/[0.04] via-transparent to-purple-500/[0.02]">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "rounded-xl border px-3 py-1 font-mono text-sm font-black",
                        partyFinderEval.badgeClass,
                      )}
                    >
                      {partyFinderEval.readinessRating === "Carry" && "👑 S+ CARRY"}
                      {partyFinderEval.readinessRating === "Qualified" && "🟢 QUALIFIED"}
                      {partyFinderEval.readinessRating === "Borderline" && "🟡 BORDERLINE"}
                      {partyFinderEval.readinessRating === "Undergeared" && "🔴 UNDERGEARED"}
                    </span>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Party Finder Reliability & Secrets Pace
                      </h2>
                      <p className="text-xs text-white/50">{partyFinderEval.feedback}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                  <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                    <p className="text-xs text-white/50">Catacombs Level</p>
                    <p className="font-mono text-lg font-bold text-sky-300 mt-1">
                      Cata {partyFinderEval.cataLevel}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                    <p className="text-xs text-white/50">Total Secrets Found</p>
                    <p className="font-mono text-lg font-bold text-purple-300 mt-1">
                      {partyFinderEval.totalSecrets.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                    <p className="text-xs text-white/50">Secrets per Run</p>
                    <p className="font-mono text-lg font-bold text-emerald-300 mt-1">
                      {partyFinderEval.secretsPerRun} s/r
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                    <p className="text-xs text-white/50">Secret Benchmark</p>
                    <p className="font-mono text-lg font-bold text-amber-300 mt-1">
                      {partyFinderEval.secretBenchmark}
                    </p>
                  </div>
                </div>
              </Panel>

              {/* Master Mode Clearance Odds */}
              <Panel>
                <h2 className="text-xl font-bold text-white mb-4">
                  Master Mode Floor Clearance Odds (M1–M7)
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {masterModeOdds.map((m) => (
                    <div
                      key={m.floor}
                      className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">{m.name}</h3>
                        <span
                          className={cn(
                            "rounded-lg border px-2 py-0.5 text-[10px] font-mono font-bold",
                            m.clearanceOddsPct >= 80
                              ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                              : m.clearanceOddsPct >= 50
                                ? "border-amber-500/30 text-amber-400 bg-amber-500/10"
                                : "border-red-500/30 text-red-400 bg-red-500/10",
                          )}
                        >
                          {m.clearanceOddsPct}% Clearance Odds
                        </span>
                      </div>
                      <p className="text-xs text-white/50 mt-2">
                        Prerequisite: Cata {m.recommendedCata}+
                      </p>
                      <p className="text-[11px] text-white/40 mt-1 font-mono">
                        Gear: {m.gearCheck}
                      </p>
                    </div>
                  ))}
                </div>
              </Panel>

              {/* Floor Drop Chest Profitability */}
              <Panel>
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Floor Drop Chest Profitability & EV
                    </h2>
                    <p className="text-xs text-white/50">
                      Expected net coin returns per S+ run after chest unlock costs
                    </p>
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
                            <span className="text-white/80">
                              {drop.name} ({drop.fractionString})
                            </span>
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
                      <h2 className="text-2xl font-bold text-white">
                        Faction Reputation: {factionStatus.reputation.toLocaleString()} / 27,000
                      </h2>
                    </div>
                    <p className="text-xs text-white/50 mt-1">
                      {factionStatus.isMaxed
                        ? "Maxed reputation tier achieved!"
                        : `${factionStatus.repToNext.toLocaleString()} rep needed for next tier`}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {factionStatus.perks.map((p) => (
                    <span
                      key={p}
                      className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-1 text-xs text-white/80"
                    >
                      ✓ {p}
                    </span>
                  ))}
                </div>
              </Panel>

              {/* Kuudra Tier Gateways (T1-T5) */}
              <Panel>
                <h2 className="text-xl font-bold text-white mb-4">
                  Kuudra Tier Gateways & Party Requirements (T1–T5)
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {kuudraReadiness.map((k) => (
                    <div
                      key={k.tier.name}
                      className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">
                          T{k.tier.tierNumber}: {k.tier.name} Kuudra
                        </h3>
                        <span
                          className={cn(
                            "rounded-lg border px-2 py-0.5 text-[10px] font-mono font-bold",
                            k.qualified
                              ? "border-emerald-500/30 text-emerald-300 bg-emerald-500/10"
                              : "border-red-500/30 text-red-300 bg-red-500/10",
                          )}
                        >
                          {k.qualified ? "QUALIFIED" : "UNQUALIFIED"}
                        </span>
                      </div>
                      <div className="mt-3 space-y-1 text-xs text-white/60">
                        <div className="flex justify-between">
                          <span>Combat Level:</span>
                          <span className="font-mono text-white">
                            Combat {k.tier.combatRequirement}+
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Key Cost / Profit:</span>
                          <span className="font-mono text-emerald-400">
                            ~+{formatFull(k.tier.expectedProfitPerRun)} / run
                          </span>
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
                <h2 className="text-xl font-bold text-white mb-4">
                  Crimson / Aurora / Terror Armor Tier-Up Scaling
                </h2>
                <div className="grid gap-3 sm:grid-cols-5">
                  {CRIMSON_ARMOR_TIERS.map((tier) => (
                    <div
                      key={tier.tierName}
                      className="rounded-xl border border-white/5 bg-black/30 p-3 text-xs"
                    >
                      <h3 className="font-bold text-white text-sm">{tier.tierName} Tier (10★)</h3>
                      <div className="mt-2 space-y-1 text-white/60">
                        <p>Essence: {tier.crimsonEssenceCost.toLocaleString()}</p>
                        <p>Kuudra Teeth: {tier.kuudraTeethCost}</p>
                        <p>Heavy Pearls: {tier.heavyPearlsCost}</p>
                        <p className="font-bold text-amber-300 pt-1 border-t border-white/10">
                          ~{formatFull(tier.coinsValue)}
                        </p>
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
                    <p className="text-xs text-white/50 mt-1">
                      Base 8m + Infused Armor + 8 Timecharms + Bottled Ooze
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-white/5 bg-black/30 p-3 text-xs">
                    <p className="text-white/50">Base Time</p>
                    <p className="font-mono text-base font-bold text-indigo-300 mt-1">
                      {riftTime.breakdown.base}s
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/30 p-3 text-xs">
                    <p className="text-white/50">Infused Armor</p>
                    <p className="font-mono text-base font-bold text-indigo-300 mt-1">
                      +{riftTime.breakdown.armor}s
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/30 p-3 text-xs">
                    <p className="text-white/50">Timecharms</p>
                    <p className="font-mono text-base font-bold text-indigo-300 mt-1">
                      +{riftTime.breakdown.timecharms}s
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/30 p-3 text-xs">
                    <p className="text-white/50">Bottled Ooze</p>
                    <p className="font-mono text-base font-bold text-indigo-300 mt-1">
                      +{riftTime.breakdown.ooze}s
                    </p>
                  </div>
                </div>
              </Panel>

              {/* Vampire Slayer (Bloodfiend T1-T5) */}
              <Panel>
                <h2 className="text-xl font-bold text-white mb-4">
                  Vampire Slayer (Riftstalker Bloodfiend T1–T5)
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {VAMPIRE_SLAYER_TIERS.map((vamp) => (
                    <div
                      key={vamp.name}
                      className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">
                          Tier {vamp.tier}: {vamp.name}
                        </h3>
                        <span className="font-mono text-xs font-bold text-rose-400">
                          {vamp.hp} HP
                        </span>
                      </div>
                      <div className="mt-3 space-y-1 text-xs text-white/60">
                        <p>
                          Required Stake:{" "}
                          <span className="font-mono text-white">{vamp.requiredWeapon}</span>
                        </p>
                        <p>
                          Motes Cost:{" "}
                          <span className="font-mono text-indigo-300">
                            {vamp.moteCost.toLocaleString()} Motes
                          </span>
                        </p>
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
                <h2 className="text-xl font-bold text-white mb-4">
                  Rift Motes Export Economy & Real-SkyBlock Conversion
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {RIFT_EXPORT_ITEMS.map((item) => (
                    <div
                      key={item.name}
                      className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur"
                    >
                      <h3 className="text-sm font-bold text-white">{item.name}</h3>
                      <div className="mt-3 space-y-1 text-xs text-white/60">
                        <p>
                          Cost:{" "}
                          <span className="font-mono text-indigo-300">
                            {item.motesCost.toLocaleString()} Motes
                          </span>
                        </p>
                        <p>
                          SkyBlock Value:{" "}
                          <span className="font-mono font-bold text-emerald-400">
                            ~{formatFull(item.realSkyBlockValueCoins)}
                          </span>
                        </p>
                        <p className="text-sky-300 font-mono text-[11px] pt-1 border-t border-white/10">
                          {item.coinsPerMote} coins / Mote
                        </p>
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
                      Calculated across Farming {farmingLvl}, Garden {gardenLvl}, Elephant Pet 100,
                      and Fermento Armor
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
                    {
                      label: "Enchants (Dedication/Cult.)",
                      value: `+${farmingCalc.breakdown.enchants}`,
                    },
                    {
                      label: "Elephant Pet & Bandana",
                      value: `+${farmingCalc.breakdown.pet + farmingCalc.breakdown.equipment}`,
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl border border-white/5 bg-black/30 p-3"
                    >
                      <p className="text-xs text-white/50">{stat.label}</p>
                      <p className="font-mono text-base font-bold text-amber-300 mt-1">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </Panel>

              {/* Crop Yields Table */}
              <Panel>
                <h2 className="text-xl font-bold text-white mb-4">
                  Estimated Crop Yields & Coin Production
                </h2>
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
                          <span className="font-mono text-white">
                            {formatFull(cy.cropsPerHour)} items
                          </span>
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

          {/* TAB 6: MINING, HOTM & POWDER SUITE */}
          {activeTab === "mining" && (
            <div className="space-y-6">
              {/* HotM Top Stats Overview Bar */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Panel className="bg-slate-900/60 border-cyan-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                      Heart of the Mountain
                    </span>
                    <Pickaxe className="size-4 text-cyan-400" />
                  </div>
                  <p className="mt-2 text-2xl font-bold font-mono text-cyan-200">
                    Tier {data.hotm?.tier ?? 10}{" "}
                    <span className="text-sm font-normal text-muted-foreground">/ 10 Max</span>
                  </p>
                  <div className="mt-2 flex items-center justify-between text-xs font-mono text-muted-foreground">
                    <span>Peak Level: {data.hotm?.nodes?.["peak_of_the_mountain"] ?? 7}/10</span>
                    <span className="text-cyan-400 font-bold">Unlocked</span>
                  </div>
                </Panel>

                <Panel className="bg-slate-900/60 border-emerald-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                      ᚢ Mithril Powder
                    </span>
                    <Sparkles className="size-4 text-emerald-400" />
                  </div>
                  <p className="mt-2 text-2xl font-bold font-mono text-emerald-300">
                    {(data.hotm?.powders?.mithril ?? 2_500_000).toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground font-mono">
                    Dwarven Mines & Commissions
                  </p>
                </Panel>

                <Panel className="bg-slate-900/60 border-pink-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-pink-300 uppercase tracking-wider">
                      ᚣ Gemstone Powder
                    </span>
                    <Sparkles className="size-4 text-pink-400" />
                  </div>
                  <p className="mt-2 text-2xl font-bold font-mono text-pink-300">
                    {(data.hotm?.powders?.gemstone ?? 5_200_000).toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground font-mono">
                    Crystal Hollows & Chests
                  </p>
                </Panel>

                <Panel className="bg-slate-900/60 border-blue-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                      ᚤ Glacite Powder
                    </span>
                    <Sparkles className="size-4 text-blue-400" />
                  </div>
                  <p className="mt-2 text-2xl font-bold font-mono text-blue-300">
                    {(data.hotm?.powders?.glacite ?? 1_800_000).toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground font-mono">
                    Glacite Mineshafts & Tunnels
                  </p>
                </Panel>
              </div>

              {/* Total Stats & Preset Loadouts */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/80 p-4 backdrop-blur-md">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-xs text-muted-foreground font-semibold">
                      Total Mining Speed:
                    </span>
                    <p className="text-xl font-bold font-mono text-cyan-300">
                      {(miningCalc.miningSpeed + hotmBonus.totalSpeed).toLocaleString()} ⸕
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground font-semibold">
                      Total Mining Fortune:
                    </span>
                    <p className="text-xl font-bold font-mono text-emerald-300">
                      +{miningCalc.miningFortune + hotmBonus.totalFortune} ☘
                    </p>
                  </div>
                </div>

                {/* Preset Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {HOTM_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        playClickSound();
                        setCustomHotmAllocations(preset.allocations);
                      }}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white hover:border-primary/40 hover:bg-white/10 transition-all"
                    >
                      {preset.name}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      playClickSound();
                      setCustomHotmAllocations({});
                    }}
                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-500/20 transition-all"
                  >
                    Reset All
                  </button>
                </div>
              </div>

              {/* HotM Visual 10-Tier Node Tree & Inspector Layout */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Visual HotM Node Tree (Tiers 10 down to 1) */}
                <Panel className="lg:col-span-2 bg-slate-950/80 border-cyan-500/20">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Pickaxe className="size-4 text-cyan-400" /> Heart of the Mountain Tree
                        (Tiers 1–10)
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Click any node to inspect formulas, level up, or customize allocations.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {Array.from({ length: 10 }, (_, i) => 10 - i).map((tierNum) => {
                      const tierNodes = HOTM_NODES.filter((n) => n.tier === tierNum);
                      const isGlacite = tierNum >= 8;
                      const isGemstone = tierNum === 6 || tierNum === 7;
                      const isMithril = tierNum <= 5;

                      return (
                        <div
                          key={tierNum}
                          className="flex items-center gap-4 rounded-xl border border-white/5 bg-black/30 p-3"
                        >
                          <span
                            className={cn(
                              "w-16 shrink-0 font-mono text-xs font-bold",
                              isGlacite
                                ? "text-blue-300"
                                : isGemstone
                                  ? "text-pink-300"
                                  : "text-emerald-300",
                            )}
                          >
                            Tier {tierNum}
                          </span>

                          <div className="flex flex-1 flex-wrap items-center gap-2">
                            {tierNodes.map((node) => {
                              const currLvl = customHotmAllocations[node.id] ?? 0;
                              const isSelected = selectedHotmNode?.id === node.id;
                              const isMaxed = currLvl >= node.maxLevel;

                              return (
                                <button
                                  key={node.id}
                                  onClick={() => {
                                    playClickSound();
                                    setSelectedHotmNode(node);
                                  }}
                                  className={cn(
                                    "group relative flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition-all",
                                    isSelected
                                      ? "border-primary bg-primary/20 shadow-lg shadow-primary/10"
                                      : isMaxed
                                        ? "border-amber-500/40 bg-amber-500/10 text-white hover:border-amber-500"
                                        : currLvl > 0
                                          ? "border-cyan-500/30 bg-cyan-500/10 text-white hover:border-cyan-400"
                                          : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:text-white",
                                  )}
                                >
                                  <div>
                                    <div className="flex items-center gap-1.5 text-xs font-bold">
                                      {node.type === "ability" && (
                                        <span className="text-amber-400">⭐</span>
                                      )}
                                      {node.type === "peak" && (
                                        <span className="text-purple-400">🏔️</span>
                                      )}
                                      <span className={isSelected ? "text-primary" : "text-white"}>
                                        {node.name}
                                      </span>
                                    </div>
                                    <span className="font-mono text-[10px] text-muted-foreground">
                                      {currLvl} / {node.maxLevel}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Panel>

                {/* Node Inspector & Level Stepper */}
                <Panel className="bg-slate-950/80 border-white/10">
                  {selectedHotmNode ? (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-white">
                              {selectedHotmNode.name}
                            </h4>
                            <span
                              className={cn(
                                "rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase",
                                selectedHotmNode.powderType === "glacite"
                                  ? "bg-blue-500/20 text-blue-300"
                                  : selectedHotmNode.powderType === "gemstone"
                                    ? "bg-pink-500/20 text-pink-300"
                                    : "bg-emerald-500/20 text-emerald-300",
                              )}
                            >
                              {selectedHotmNode.powderType}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground font-mono">
                            HotM Tier {selectedHotmNode.tier} {selectedHotmNode.type}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {selectedHotmNode.description}
                      </p>

                      {/* Current Level vs Effect */}
                      <div className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-2 font-mono text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Current Level:</span>
                          <span className="font-bold text-white">
                            {customHotmAllocations[selectedHotmNode.id] ?? 0} /{" "}
                            {selectedHotmNode.maxLevel}
                          </span>
                        </div>
                        <div className="flex justify-between text-emerald-400 font-bold">
                          <span>Current Bonus:</span>
                          <span>
                            {
                              selectedHotmNode.perkFormula(
                                customHotmAllocations[selectedHotmNode.id] ?? 0,
                              ).text
                            }
                          </span>
                        </div>
                      </div>

                      {/* Level Stepper Buttons */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground">
                          Adjust Allocation:
                        </label>
                        <div className="grid grid-cols-5 gap-1.5 font-mono text-xs font-bold">
                          <button
                            onClick={() => {
                              playClickSound();
                              setCustomHotmAllocations((prev) => ({
                                ...prev,
                                [selectedHotmNode.id]: 0,
                              }));
                            }}
                            className="rounded-lg border border-red-500/30 bg-red-500/10 py-1.5 text-red-300 hover:bg-red-500/20"
                          >
                            0
                          </button>
                          <button
                            onClick={() => {
                              playClickSound();
                              setCustomHotmAllocations((prev) => ({
                                ...prev,
                                [selectedHotmNode.id]: Math.max(
                                  0,
                                  (prev[selectedHotmNode.id] ?? 0) - 1,
                                ),
                              }));
                            }}
                            className="rounded-lg border border-white/10 bg-white/5 py-1.5 text-white hover:bg-white/10"
                          >
                            -1
                          </button>
                          <button
                            onClick={() => {
                              playClickSound();
                              setCustomHotmAllocations((prev) => ({
                                ...prev,
                                [selectedHotmNode.id]: Math.min(
                                  selectedHotmNode.maxLevel,
                                  (prev[selectedHotmNode.id] ?? 0) + 1,
                                ),
                              }));
                            }}
                            className="rounded-lg border border-white/10 bg-white/5 py-1.5 text-white hover:bg-white/10"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => {
                              playClickSound();
                              setCustomHotmAllocations((prev) => ({
                                ...prev,
                                [selectedHotmNode.id]: Math.min(
                                  selectedHotmNode.maxLevel,
                                  (prev[selectedHotmNode.id] ?? 0) + 5,
                                ),
                              }));
                            }}
                            className="rounded-lg border border-white/10 bg-white/5 py-1.5 text-white hover:bg-white/10"
                          >
                            +5
                          </button>
                          <button
                            onClick={() => {
                              playClickSound();
                              setCustomHotmAllocations((prev) => ({
                                ...prev,
                                [selectedHotmNode.id]: selectedHotmNode.maxLevel,
                              }));
                            }}
                            className="rounded-lg border border-primary/40 bg-primary/20 py-1.5 text-primary hover:bg-primary/30"
                          >
                            MAX
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Select a node from the tree to view and allocate powder.
                    </p>
                  )}
                </Panel>
              </div>

              {/* Block Break Ticks Benchmark Grid */}
              <Panel className="bg-slate-950/80">
                <h3 className="text-base font-bold text-white mb-3">
                  Live Gemstone & Block Breaking Ticks (Based on Current Allocations)
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                  <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                    <p className="text-xs text-muted-foreground">Hard Stone</p>
                    <p className="font-mono text-base font-bold text-cyan-300 mt-1">
                      1 tick (Instant)
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                    <p className="text-xs text-muted-foreground">Mithril Ore</p>
                    <p className="font-mono text-base font-bold text-cyan-300 mt-1">
                      ~4 ticks (0.20s)
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                    <p className="text-xs text-muted-foreground">Ruby Gemstone</p>
                    <p className="font-mono text-base font-bold text-pink-300 mt-1">
                      ~12 ticks (0.60s)
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                    <p className="text-xs text-muted-foreground">Jasper / Opal Gemstone</p>
                    <p className="font-mono text-base font-bold text-purple-300 mt-1">
                      ~18 ticks (0.90s)
                    </p>
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
                    <p className="font-mono text-base font-bold text-purple-300 mt-1">
                      +{combatCalc.breakdown.pet} MF
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                    <p className="text-xs text-white/50">Sorrow Armor Set</p>
                    <p className="font-mono text-base font-bold text-purple-300 mt-1">
                      +{combatCalc.breakdown.armor} MF
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                    <p className="text-xs text-white/50">God Potion & Cookie</p>
                    <p className="font-mono text-base font-bold text-purple-300 mt-1">
                      +{combatCalc.breakdown.buffs} MF
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                    <p className="text-xs text-white/50">Enrichments & Bestiary</p>
                    <p className="font-mono text-base font-bold text-purple-300 mt-1">
                      +{combatCalc.breakdown.enrichments + combatCalc.breakdown.bestiary} MF
                    </p>
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
                      {trophyCalc.uniqueSpecies} / 17 species discovered ·{" "}
                      {trophyCalc.diamondTierCount} Diamond Tiers
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
                      <p className="text-[11px] text-white/40 mt-1">
                        Condition: {tp.species.specialCondition}
                      </p>
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
                      <h2 className="text-xl font-bold tracking-tight text-white">
                        Slayer Progression & Passives
                      </h2>
                      <p className="text-xs text-white/50">
                        {data.slayerOverview.totalXp.toLocaleString()} total Slayer XP ·{" "}
                        {data.slayerOverview.totalKills.toLocaleString()} boss kills
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
                          {boss.currentXp.toLocaleString()} XP · {boss.totalKills.toLocaleString()}{" "}
                          Kills
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
