import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { usePlayer } from "@/hooks/use-account";
import { Panel } from "@/components/layout/app-shell";
import {
  auditVoidgloomReadiness,
  auditKuudraReadiness,
  type BossTierAudit,
  type KuudraRoleAudit,
} from "@/lib/boss-tactics";
import {
  Skull,
  Flame,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/bosses")({
  component: BossTacticsPage,
});

export function BossTacticsPage() {
  const player = usePlayer();
  const [activeTab, setActiveTab] = useState<"voidgloom" | "kuudra">("voidgloom");

  const voidgloomAudit = useMemo(() => auditVoidgloomReadiness(player.data), [player.data]);
  const kuudraAudit = useMemo(() => auditKuudraReadiness(player.data), [player.data]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg">
              <Skull className="size-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Boss Tactics & Combat Hub
            </h1>
          </div>
          <p className="mt-1.5 text-xs text-white/60 sm:text-sm">
            Endgame qualification engine — Voidgloom Seraph T1–T4 survivability audits and Infernal Kuudra role optimizer.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center rounded-2xl border border-white/10 bg-white/[0.04] p-1">
          <button
            onClick={() => setActiveTab("voidgloom")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-none",
              activeTab === "voidgloom"
                ? "bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/40"
                : "text-white/60 hover:text-white"
            )}
          >
            <Skull className="size-3.5" /> Voidgloom Seraph (T1–T4)
          </button>
          <button
            onClick={() => setActiveTab("kuudra")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-none",
              activeTab === "kuudra"
                ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40"
                : "text-white/60 hover:text-white"
            )}
          >
            <Flame className="size-3.5" /> Infernal Kuudra (T1–T5)
          </button>
        </div>
      </div>

      {/* TAB 1: VOIDGLOOM SERAPH */}
      {activeTab === "voidgloom" && (
        <div className="space-y-6">
          {/* Top Summary Banner */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-5">
              <span className="text-xs font-bold uppercase text-purple-300 tracking-wider">
                Overall Slayer Readiness
              </span>
              <p className="mt-2 font-mono text-3xl font-black text-white">
                {voidgloomAudit.overallScore}%
              </p>
              <p className="mt-1 text-xs text-white/60">
                Highest Qualified:{" "}
                <span className="font-bold text-purple-300">
                  Tier {voidgloomAudit.highestQualifiedTier || 1}
                </span>
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <span className="text-xs font-bold uppercase text-white/60 tracking-wider">
                Hitsphase Key Factor
              </span>
              <p className="mt-2 font-mono text-xl font-bold text-white">
                Reaper Scythe & Summons
              </p>
              <p className="mt-1 text-xs text-white/60">Shreds 30/60 hitsphase shield in &lt;3s</p>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
              <span className="text-xs font-bold uppercase text-emerald-300 tracking-wider">
                Recommended Pet
              </span>
              <p className="mt-2 font-mono text-xl font-bold text-white">Mythic Enderman 100</p>
              <p className="mt-1 text-xs text-white/60">-25% damage taken from all Enderman attacks</p>
            </div>
          </div>

          {/* Tier Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {voidgloomAudit.tiers.map((tier: BossTierAudit) => (
              <Panel key={tier.tier} className="space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md border border-purple-500/40 bg-purple-500/20 px-2 py-0.5 font-mono text-xs font-bold text-purple-300">
                        Tier {tier.tier}
                      </span>
                      <h3 className="text-base font-bold text-white">{tier.name}</h3>
                    </div>
                    <p className="mt-1 text-xs text-white/60">
                      Req: Combat {tier.recommendedCombat} · {tier.recommendedMp} MP
                    </p>
                  </div>

                  <span
                    className={cn(
                      "flex items-center gap-1 rounded-xl border px-2.5 py-1 text-xs font-bold",
                      tier.qualified
                        ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                        : "border-red-500/40 bg-red-500/20 text-red-300"
                    )}
                  >
                    {tier.qualified ? (
                      <>
                        <CheckCircle2 className="size-3.5" /> Qualified
                      </>
                    ) : (
                      <>
                        <AlertCircle className="size-3.5" /> Incomplete
                      </>
                    )}
                  </span>
                </div>

                {/* Strategy Notes */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase text-white/50">Tactical Strategy:</span>
                  <ul className="space-y-1 text-xs text-white/80">
                    {tier.keyStrategies.map((strat: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-purple-400 font-bold">•</span>
                        <span>{strat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Optimal Loadout Box */}
                <div className="rounded-xl bg-black/40 p-3 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-white/60">
                    <span>Weapon:</span>
                    <span className="text-amber-300 font-bold">{tier.optimalLoadout.weapon}</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Armor:</span>
                    <span className="text-sky-300 font-bold">{tier.optimalLoadout.armor}</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Pet:</span>
                    <span className="text-emerald-300 font-bold">{tier.optimalLoadout.pet}</span>
                  </div>
                </div>

                {tier.missingRequirements.length > 0 && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-300 space-y-1">
                    <span className="font-bold">Missing Prerequisites:</span>
                    {tier.missingRequirements.map((req: string, idx: number) => (
                      <p key={idx} className="text-[11px]">
                        • {req}
                      </p>
                    ))}
                  </div>
                )}
              </Panel>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: INFERNAL KUUDRA */}
      {activeTab === "kuudra" && (
        <div className="space-y-6">
          {/* Top Kuudra Summary Banner */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
              <span className="text-xs font-bold uppercase text-amber-300 tracking-wider">
                Recommended Role
              </span>
              <p className="mt-2 font-mono text-3xl font-black text-white">
                {kuudraAudit.recommendedRole}
              </p>
              <p className="mt-1 text-xs text-white/60">Based on your highest stat attributes</p>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
              <span className="text-xs font-bold uppercase text-emerald-300 tracking-wider">
                Est. Net Profit / Hour
              </span>
              <p className="mt-2 font-mono text-3xl font-black text-emerald-400">
                +{(kuudraAudit.expectedNetProfitPerHour / 1_000_000).toFixed(1)}M coins
              </p>
              <p className="mt-1 text-xs text-white/60">Assuming 6-7 full clears/hr</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <span className="text-xs font-bold uppercase text-white/60 tracking-wider">
                Key Resource
              </span>
              <p className="mt-2 font-mono text-xl font-bold text-white">Crimson Essence</p>
              <p className="mt-1 text-xs text-white/60">Primary liquid profit driver</p>
            </div>
          </div>

          {/* Kuudra Role Audit Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {kuudraAudit.roles.map((role: KuudraRoleAudit) => (
              <Panel key={role.roleName} className="space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white">{role.roleName} Role</h3>
                    <p className="mt-1 text-xs text-white/60">{role.description}</p>
                  </div>
                  <span
                    className={cn(
                      "flex items-center gap-1 rounded-xl border px-2.5 py-1 text-xs font-bold shrink-0",
                      role.qualified
                        ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                        : "border-amber-500/40 bg-amber-500/20 text-amber-300"
                    )}
                  >
                    {role.qualified ? "Ready to Queue" : "Gear Needed"}
                  </span>
                </div>

                {/* Required Gear */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase text-white/50">Required Gear:</span>
                  <div className="space-y-1">
                    {role.requiredGear.map((item: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-white/80">
                        <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-black/40 p-3 text-xs">
                  <span className="text-white/60">Profit Per Run Key:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    +{(role.expectedProfitPerKeyCoins / 1_000_000).toFixed(2)}M coins
                  </span>
                </div>
              </Panel>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
