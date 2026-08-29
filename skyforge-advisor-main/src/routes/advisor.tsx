import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Sparkles,
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
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  Shield,
  Heart,
  Crown,
} from "lucide-react";

import { ConnectPrompt, ErrorState, LoadState } from "@/components/data-states";
import { PageHero, Panel, ProgressBar, StatRow } from "@/components/layout/app-shell";
import { RankBadge } from "@/components/ui/rank-badge";
import { usePlayer } from "@/hooks/use-account";
import { formatFull, formatNumber } from "@/lib/skyblock";
import { calculateSkyBlockLevel } from "@/lib/skyblock-level";
import {
  performProfileAudit,
  generateTailoredActionPlan,
  detectPlayerGear,
  type TailoredAction,
} from "@/lib/advisor-engine";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/advisor")({
  head: () => ({
    meta: [
      { title: "Personalized Progression Advisor — SkyForge" },
      {
        name: "description",
        content:
          "Autonomous progression mentor tailored to your specific account: profile telemetry audits, highest-ROI next steps, and detected gear upgrade pathways.",
      },
      { property: "og:title", content: "Personalized Progression Advisor — SkyForge" },
      {
        property: "og:description",
        content:
          "What should you do next? Personalized next best upgrades calculated from your exact account stats.",
      },
    ],
  }),
  component: AdvisorRoute,
});

type FilterCategory =
  "all" | "Accessories" | "Skills" | "Slayers" | "Dungeons" | "Minions" | "Economy";

function AdvisorRoute() {
  const { data, isLoading, error, connected } = usePlayer();
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const sbLevel = useMemo(() => (data ? calculateSkyBlockLevel(data).level : 0), [data]);

  // Perform Deep Profile Telemetry Audit
  const audit = useMemo(() => performProfileAudit(data), [data]);

  // Generate Ranked Tailored Actions
  const actionPlan = useMemo(() => generateTailoredActionPlan(data), [data]);

  // Detect Current Gear
  const gearReport = useMemo(() => detectPlayerGear(data), [data]);

  const filteredActions = useMemo(() => {
    if (selectedCategory === "all") return actionPlan;
    return actionPlan.filter((a) => a.category === selectedCategory);
  }, [actionPlan, selectedCategory]);

  const copyCommand = (id: string, text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHero
        eyebrow="Autonomous Mentor"
        title="Personalized Progression Advisor"
        description="Every recommendation on this page is calculated specifically for your connected profile based on your exact skills, gear, slayers, and accessory bag."
      />

      {!connected && <ConnectPrompt what="your live profile for tailored progression advice" />}
      {connected && isLoading && (
        <LoadState>Auditing profile telemetry and calculating highest-ROI upgrades…</LoadState>
      )}
      {connected && error && <ErrorState error={error} />}

      {data && (
        <>
          {/* SECTION 1: PERSONALIZED PROFILE TELEMETRY AUDIT */}
          <Panel className="border-sky-500/25 bg-gradient-to-br from-sky-500/[0.05] via-black/40 to-emerald-500/[0.02]">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-4">
                <img
                  src={`https://mc-heads.net/avatar/${data.uuid}/64`}
                  alt={data.username}
                  className="size-14 rounded-2xl border border-white/15 bg-black/40 p-1 [image-rendering:pixelated]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <RankBadge rankData={data.hypixelPlayer} />
                    <h2 className="text-2xl font-bold text-white">{data.username}</h2>
                    <span className="rounded-lg border border-sky-400/30 bg-sky-500/15 px-2 py-0.5 font-mono text-xs font-bold text-sky-300">
                      LVL {sbLevel}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 mt-0.5">{audit.summary}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-right">
                  <p className="text-[10px] uppercase tracking-wider text-white/50">
                    Progression Health
                  </p>
                  <p className="font-mono text-2xl font-black text-emerald-400">
                    {audit.score} / 100
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-2xl border px-3.5 py-2.5 font-mono text-sm font-bold shadow-lg",
                    audit.badgeClass,
                  )}
                >
                  {audit.stage}
                </span>
              </div>
            </div>

            {/* 6 Sub-Audits */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {/* 1. Magical Power Audit */}
              <div className="rounded-2xl border border-white/5 bg-black/30 p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white/80">⚡ Magical Power</span>
                  <span className="font-mono font-bold text-amber-300">
                    {audit.mpAudit.currentMp} / {audit.mpAudit.targetMp} MP
                  </span>
                </div>
                <div className="mt-2">
                  <ProgressBar pct={audit.mpAudit.score} />
                </div>
                <p className="text-[11px] text-white/60 mt-2 leading-relaxed">
                  {audit.mpAudit.statusText}
                </p>
              </div>

              {/* 2. Fairy Souls Audit */}
              <div className="rounded-2xl border border-white/5 bg-black/30 p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white/80">🧚 Fairy Souls</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {audit.soulAudit.collected} / {audit.soulAudit.max}
                  </span>
                </div>
                <div className="mt-2">
                  <ProgressBar pct={audit.soulAudit.score} />
                </div>
                <p className="text-[11px] text-white/60 mt-2 leading-relaxed">
                  {audit.soulAudit.statusText}
                </p>
              </div>

              {/* 3. Skill Balance Audit */}
              <div className="rounded-2xl border border-white/5 bg-black/30 p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white/80">📈 Skill Average</span>
                  <span className="font-mono font-bold text-purple-300">
                    {audit.skillAudit.skillAverage.toFixed(2)}
                  </span>
                </div>
                <div className="mt-2">
                  <ProgressBar pct={audit.skillAudit.score} />
                </div>
                <p className="text-[11px] text-white/60 mt-2 leading-relaxed">
                  {audit.skillAudit.statusText}
                </p>
              </div>

              {/* 4. Slayer Boss Audit */}
              <div className="rounded-2xl border border-white/5 bg-black/30 p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white/80">💀 Slayer Progression</span>
                  <span className="font-mono font-bold text-red-400">
                    {formatNumber(audit.slayerAudit.totalXp)} XP
                  </span>
                </div>
                <div className="mt-2">
                  <ProgressBar pct={audit.slayerAudit.score} />
                </div>
                <p className="text-[11px] text-white/60 mt-2 leading-relaxed">
                  {audit.slayerAudit.statusText}
                </p>
              </div>

              {/* 5. Dungeon Clearance Audit */}
              <div className="rounded-2xl border border-white/5 bg-black/30 p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white/80">🗝️ Catacombs</span>
                  <span className="font-mono font-bold text-cyan-300">
                    Cata {audit.dungeonAudit.catacombsLevel}
                  </span>
                </div>
                <div className="mt-2">
                  <ProgressBar pct={audit.dungeonAudit.score} />
                </div>
                <p className="text-[11px] text-white/60 mt-2 leading-relaxed">
                  {audit.dungeonAudit.statusText}
                </p>
              </div>

              {/* 6. Minion Slots Audit */}
              <div className="rounded-2xl border border-white/5 bg-black/30 p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white/80">⛏️ Minion Slots</span>
                  <span className="font-mono font-bold text-yellow-300">
                    {audit.minionAudit.currentSlots} / 31 Slots
                  </span>
                </div>
                <div className="mt-2">
                  <ProgressBar pct={audit.minionAudit.score} />
                </div>
                <p className="text-[11px] text-white/60 mt-2 leading-relaxed">
                  {audit.minionAudit.statusText}
                </p>
              </div>
            </div>
          </Panel>

          {/* SECTION 2: DETECTED GEAR & NEXT UPGRADE TARGET */}
          <Panel>
            <div className="border-b border-white/10 pb-4 mb-4">
              <h2 className="text-xl font-bold text-white">
                Detected Gear & Recommended Next Upgrade
              </h2>
              <p className="text-xs text-white/50">
                Based on your equipped armor and inventory items
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {/* Currently Equipped */}
              <div className="rounded-2xl border border-white/5 bg-black/30 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-white/50 mb-3">
                  Currently Equipped Gear
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between rounded-xl bg-white/[0.02] p-2 border border-white/5">
                    <span className="text-white/50">Primary Weapon:</span>
                    <span className="font-semibold text-sky-300">{gearReport.detectedWeapon}</span>
                  </div>
                  <div className="flex justify-between rounded-xl bg-white/[0.02] p-2 border border-white/5">
                    <span className="text-white/50">Helmet:</span>
                    <span className="font-semibold text-white">{gearReport.detectedHelmet}</span>
                  </div>
                  <div className="flex justify-between rounded-xl bg-white/[0.02] p-2 border border-white/5">
                    <span className="text-white/50">Chestplate:</span>
                    <span className="font-semibold text-white">
                      {gearReport.detectedChestplate}
                    </span>
                  </div>
                  <div className="flex justify-between rounded-xl bg-white/[0.02] p-2 border border-white/5">
                    <span className="text-white/50">Leggings:</span>
                    <span className="font-semibold text-white">{gearReport.detectedLeggings}</span>
                  </div>
                  <div className="flex justify-between rounded-xl bg-white/[0.02] p-2 border border-white/5">
                    <span className="text-white/50">Boots:</span>
                    <span className="font-semibold text-white">{gearReport.detectedBoots}</span>
                  </div>
                </div>
              </div>

              {/* Recommended Next Upgrade */}
              <div className="flex flex-col justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.03] p-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Target Next Gear Upgrade
                    </p>
                    <span className="rounded-lg bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-300">
                      {gearReport.recommendedNextUpgrade.unlockedAt}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-white/50">
                        Target Weapon
                      </p>
                      <p className="font-bold text-white mt-0.5 text-sm">
                        {gearReport.recommendedNextUpgrade.weaponTarget}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-white/50">
                        Target Armor Set
                      </p>
                      <p className="font-bold text-white mt-0.5 text-sm">
                        {gearReport.recommendedNextUpgrade.armorTarget}
                      </p>
                    </div>
                    <div className="rounded-xl bg-black/40 p-2.5 border border-white/5">
                      <p className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                        Expected Stat Gain
                      </p>
                      <p className="text-white/80 mt-0.5 font-mono">
                        {gearReport.recommendedNextUpgrade.statBenefit}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs">
                  <span className="text-white/50">Estimated Investment:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {gearReport.recommendedNextUpgrade.estimatedCostText}
                  </span>
                </div>
              </div>
            </div>
          </Panel>

          {/* SECTION 3: TAILORED ACTIONS RANKED BY ROI */}
          <Panel>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Your Tailored Next Best Upgrades (Ranked by ROI)
                </h2>
                <p className="text-xs text-white/50">
                  Calculated directly from your missing stats, slayer requirements, and budget
                </p>
              </div>

              {/* Filter Chips */}
              <div className="flex flex-wrap gap-1.5 rounded-xl border border-white/10 bg-black/40 p-1">
                {[
                  { id: "all", label: "All" },
                  { id: "Skills", label: "Skills" },
                  { id: "Accessories", label: "Accessories" },
                  { id: "Slayers", label: "Slayers" },
                  { id: "Dungeons", label: "Dungeons" },
                  { id: "Minions", label: "Minions" },
                  { id: "Economy", label: "Economy" },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id as FilterCategory)}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
                      selectedCategory === c.id
                        ? "bg-white/20 text-white font-bold"
                        : "text-white/50 hover:text-white",
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredActions.map((action) => (
                <div
                  key={action.id}
                  className="flex flex-col justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-none hover:border-sky-500/30 hover:bg-white/[0.04]"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-white leading-tight">{action.title}</h3>
                      <span
                        className={cn(
                          "shrink-0 rounded-lg border px-2 py-0.5 font-mono text-[10px] font-bold",
                          action.priority.includes("URGENT")
                            ? "border-red-500/40 bg-red-500/15 text-red-300"
                            : action.priority.includes("HIGH")
                              ? "border-amber-400/40 bg-amber-500/15 text-amber-300"
                              : "border-sky-400/40 bg-sky-500/15 text-sky-300",
                        )}
                      >
                        {action.priority}
                      </span>
                    </div>

                    <p className="text-xs text-white/60 mt-2 leading-relaxed">
                      {action.actionGuidance}
                    </p>

                    <div className="mt-3 space-y-1.5 rounded-xl bg-black/40 p-2.5 text-xs font-mono">
                      <div className="flex justify-between text-white/50">
                        <span>Current:</span>
                        <span className="text-white truncate ml-2">{action.currentStatText}</span>
                      </div>
                      <div className="flex justify-between text-sky-300">
                        <span>Target:</span>
                        <span className="truncate ml-2 font-semibold">{action.targetGoalText}</span>
                      </div>
                      <div className="flex justify-between border-t border-white/10 pt-1 text-emerald-400 font-bold">
                        <span>Reward:</span>
                        <span className="truncate ml-2">{action.exactRewardText}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-2.5 text-xs">
                    <span className="text-white/40 font-mono">{action.estimatedCost}</span>
                    {action.inGameCommand && (
                      <button
                        onClick={() => copyCommand(action.id, action.inGameCommand)}
                        className="flex items-center gap-1 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 font-mono text-[11px] text-sky-300 hover:bg-sky-500/20"
                      >
                        {copiedId === action.id ? (
                          <>
                            <Check className="size-3 text-emerald-400" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="size-3" /> {action.inGameCommand}
                          </>
                        )}
                      </button>
                    )}
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
