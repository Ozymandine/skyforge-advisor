import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Sparkles,
  Award,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Flame,
  Boxes,
  Swords,
  Pickaxe,
  Wheat,
  FlaskConical,
  Target,
  ChevronRight,
  Filter,
  CheckCircle2,
} from "lucide-react";

import { ConnectPrompt, ErrorState, LoadState } from "@/components/data-states";
import { PageHero, Panel, ProgressBar, StatRow } from "@/components/layout/app-shell";
import { ItemIcon } from "@/components/ui/item-icon";
import { usePlayer } from "@/hooks/use-account";
import { formatFull, formatNumber } from "@/lib/skyblock";
import { calculateSkyBlockLevel } from "@/lib/skyblock-level";
import {
  evaluateGameStage,
  generateAdvisorActions,
  CLASS_PROGRESSION_TREES,
  SKILL_LEVELING_GUIDES,
  type AdvisorAction,
} from "@/lib/advisor-engine";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/advisor")({
  head: () => ({
    meta: [
      { title: "Autonomous Progression Advisor — SkyForge" },
      {
        name: "description",
        content:
          "Autonomous SkyBlock progression mentor: game stage classification, personalized next best upgrades, linear gear trees, and fast-track leveling guides.",
      },
      { property: "og:title", content: "Autonomous Progression Advisor — SkyForge" },
      {
        property: "og:description",
        content: "What should you do next? Personalized next best upgrades ranked by highest return on investment.",
      },
    ],
  }),
  component: AdvisorRoute,
});

type FilterCategory = "all" | "Accessories" | "Slayers" | "Skills" | "Dungeons" | "Minions" | "Farming" | "Mining";
type ClassTab = "Archer / Berserk" | "Mage" | "Mining Specialist" | "Farming Specialist";

function AdvisorRoute() {
  const { data, isLoading, error, connected } = usePlayer();
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>("all");
  const [selectedClass, setSelectedClass] = useState<ClassTab>("Archer / Berserk");

  const netWorth = data ? data.purse + (data.bank ?? 0) : 0;
  const sbLevel = useMemo(() => calculateSkyBlockLevel(data).level, [data]);
  const cataLvl = data?.dungeons?.catacombsLevel ?? 0;
  const skillAvg = data?.skillAverage ?? 0;

  // Evaluate Game Stage
  const stageReport = useMemo(
    () => evaluateGameStage(sbLevel, netWorth, skillAvg, cataLvl, 450),
    [sbLevel, netWorth, skillAvg, cataLvl]
  );

  // Generate Personalized Recommendations
  const actions = useMemo(() => generateAdvisorActions(data), [data]);

  const filteredActions = useMemo(() => {
    if (selectedCategory === "all") return actions;
    return actions.filter((a) => a.category === selectedCategory);
  }, [actions, selectedCategory]);

  const activeTree = useMemo(
    () => CLASS_PROGRESSION_TREES.find((t) => t.className === selectedClass) ?? CLASS_PROGRESSION_TREES[0]!,
    [selectedClass]
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHero
        eyebrow="AI Mentor"
        title="Progression Advisor"
        description="Autonomous progression intelligence: game stage assessment, personalized highest-ROI next actions, linear gear upgrade trees, and skill fast-tracks."
      />

      {!connected && <ConnectPrompt what="your live profile for personalized recommendations" />}
      {connected && isLoading && <LoadState>Analyzing profile telemetry & calculating upgrade ROI…</LoadState>}
      {connected && error && <ErrorState error={error} />}

      {data && (
        <>
          {/* SECTION 1: GAME STAGE CLASSIFICATION HERO */}
          <Panel className="border-sky-500/20 bg-gradient-to-br from-sky-500/[0.04] via-transparent to-purple-500/[0.02]">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-4">
                <span className={cn("rounded-2xl border px-4 py-2 font-mono text-xl font-black shadow-lg", stageReport.badgeClass)}>
                  {stageReport.stage}
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-white">Profile Game Stage Assessment</h2>
                  <p className="text-xs text-white/50">{stageReport.stageSummary}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                <p className="text-xs text-white/50">SkyBlock Level</p>
                <p className="font-mono text-lg font-bold text-sky-300 mt-1">Level {stageReport.sbLevel}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                <p className="text-xs text-white/50">Estimated Net Worth</p>
                <p className="font-mono text-lg font-bold text-emerald-400 mt-1">{formatFull(stageReport.netWorth)}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                <p className="text-xs text-white/50">Skill Average</p>
                <p className="font-mono text-lg font-bold text-purple-300 mt-1">{stageReport.skillAverage.toFixed(2)}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                <p className="text-xs text-white/50">Catacombs Level</p>
                <p className="font-mono text-lg font-bold text-amber-300 mt-1">Cata {stageReport.catacombsLevel}</p>
              </div>
            </div>
          </Panel>

          {/* SECTION 2: PERSONALIZED NEXT BEST ACTIONS */}
          <Panel>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Personalized Next Best Upgrades (Ranked by ROI)</h2>
                <p className="text-xs text-white/50">Highest impact-per-coin actions tailored to your current stats</p>
              </div>

              {/* Category Filter Chips */}
              <div className="flex flex-wrap gap-1.5 rounded-xl border border-white/10 bg-black/40 p-1">
                {[
                  { id: "all", label: "All" },
                  { id: "Skills", label: "Skills" },
                  { id: "Accessories", label: "Accessories" },
                  { id: "Slayers", label: "Slayers" },
                  { id: "Dungeons", label: "Dungeons" },
                  { id: "Minions", label: "Minions" },
                  { id: "Farming", label: "Farming" },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id as FilterCategory)}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
                      selectedCategory === c.id
                        ? "bg-white/20 text-white font-bold"
                        : "text-white/50 hover:text-white"
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredActions.map((action) => (
                <div
                  key={action.id}
                  className="flex flex-col justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur transition-all duration-75 hover:border-sky-500/30 hover:bg-white/[0.04]"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-white leading-tight">{action.title}</h3>
                      <span className="shrink-0 rounded-lg border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-300">
                        {action.roiTier}
                      </span>
                    </div>

                    <p className="text-xs text-white/60 mt-2 leading-relaxed">{action.description}</p>

                    <div className="mt-3 space-y-1 rounded-xl bg-black/30 p-2.5 text-xs font-mono">
                      <div className="flex justify-between text-white/60">
                        <span>Cost:</span>
                        <span className="text-white">{action.estimatedCost}</span>
                      </div>
                      <div className="flex justify-between border-t border-white/10 pt-1 text-emerald-400 font-bold">
                        <span>Reward:</span>
                        <span className="truncate ml-2">{action.statReward}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-2.5 text-[11px] text-white/40">
                    <span>Category: {action.category}</span>
                    {action.actionCommand && (
                      <span className="font-mono text-sky-400">{action.actionCommand}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* SECTION 3: LINEAR GEAR PROGRESSION TREES */}
          <Panel>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Linear Gear Progression Trees</h2>
                <p className="text-xs text-white/50">Optimal gear progression from Starter to Endgame for every playstyle</p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {CLASS_PROGRESSION_TREES.map((tree) => (
                  <button
                    key={tree.className}
                    onClick={() => setSelectedClass(tree.className as ClassTab)}
                    className={cn(
                      "rounded-xl px-3 py-1.5 text-xs font-semibold transition-all",
                      selectedClass === tree.className
                        ? "border border-sky-400/40 bg-sky-500/20 text-white font-bold shadow-md"
                        : "border border-white/5 bg-white/[0.02] text-white/60 hover:text-white"
                    )}
                  >
                    {tree.className}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-white/60 mb-4">{activeTree.description}</p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {activeTree.steps.map((step, idx) => (
                <div
                  key={step.stage}
                  className="relative rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <span className="font-mono text-xs font-bold text-sky-300">Step {idx + 1}</span>
                    <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-mono text-white/80">
                      {step.stage}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-white/40">Weapon</p>
                      <p className="font-bold text-white mt-0.5">{step.weapon}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-white/40">Armor</p>
                      <p className="font-bold text-white mt-0.5">{step.armor}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-white/40">Pet</p>
                      <p className="font-mono text-amber-300 mt-0.5">{step.recommendedPet}</p>
                    </div>
                    <div className="border-t border-white/10 pt-2">
                      <p className="text-[10px] uppercase tracking-wider text-white/40">Est. Price</p>
                      <p className="font-mono font-bold text-emerald-400 mt-0.5">{step.estimatedPrice}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* SECTION 4: SKILL FAST-TRACK LEVELING GUIDES */}
          <Panel>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Skill Fast-Track Leveling Guides</h2>
                <p className="text-xs text-white/50">Fastest and most cost-effective methods to max out all core skills</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SKILL_LEVELING_GUIDES.map((guide) => (
                <div
                  key={guide.skill}
                  className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{guide.icon}</span>
                      <h3 className="text-sm font-bold text-white">{guide.skill}</h3>
                    </div>
                    <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                      {guide.hourlyXpRate}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-sky-400 font-bold">Fastest Route</p>
                      <p className="text-white/80 mt-0.5">{guide.fastestMethod}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">Budget Route</p>
                      <p className="text-white/60 mt-0.5">{guide.budgetMethod}</p>
                    </div>
                    <div className="border-t border-white/10 pt-2">
                      <p className="text-[10px] uppercase tracking-wider text-purple-400 font-bold">Recommended Pet</p>
                      <p className="font-mono text-white/80 mt-0.5">{guide.recommendedPet}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}
