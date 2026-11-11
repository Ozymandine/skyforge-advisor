import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { usePlayer } from "@/hooks/use-account";
import { PageHero, Panel } from "@/components/layout/app-shell";
import {
  calculateSimulation,
  getDefaultLoadout,
  ACCESSORY_POWERS,
  MOB_TARGETS,
  type SimulatorLoadout,
} from "@/lib/damage-simulator";
import {
  IconSwords,
  IconShield,
  IconZap,
  IconTarget,
  IconSparkles,
  IconFlame,
  IconTrendingUp,
  IconRotateCcw,
  IconSliders,
  IconCrosshair,
} from "@/assets/icons";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/simulator")({
  component: SimulatorPage,
});

function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
  return num.toLocaleString();
}

export function SimulatorPage() {
  const player = usePlayer();
  const [loadout, setLoadout] = useState<SimulatorLoadout>(() => getDefaultLoadout());

  const result = useMemo(() => calculateSimulation(loadout), [loadout]);

  const combat = player.data?.skills.find(
    (skill) => skill.key === "COMBAT" && player.data?.availability?.skillKeys.includes(skill.key),
  );
  const loadFromProfile = () => {
    if (combat) setLoadout((previous) => ({ ...previous, combatLevel: combat.level }));
  };

  const resetDefaults = () => {
    setLoadout(getDefaultLoadout());
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHero
        title="Damage Simulator"
        actions={
          <div className="flex flex-wrap gap-2">
            {combat && (
              <button
                type="button"
                className="rounded-xl border border-border px-3 py-2 text-sm"
                onClick={loadFromProfile}
              >
                Use profile Combat level
              </button>
            )}
            <button
              type="button"
              className="rounded-xl border border-border px-3 py-2 text-sm"
              onClick={resetDefaults}
            >
              Reset example
            </button>
          </div>
        }
      />
      <p className="text-sm text-muted-foreground">
        Starts with an example loadout. Results are approximate and do not model every ability,
        modifier, or boss phase.
      </p>

      {/* Real-time KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Estimated hit damage */}
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 to-transparent p-5">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider">Single Hit Damage</span>
            <IconFlame className="size-4" />
          </div>
          <p className="mt-2 font-mono text-3xl font-black text-white">
            {formatNumber(result.singleHitDamage)}
          </p>
          <div className="mt-1 flex items-center justify-between text-xs text-white/60">
            <span>First Strike:</span>
            <span className="font-mono font-bold text-amber-300">
              {formatNumber(result.firstStrikeDamage)}
            </span>
          </div>
        </div>

        {/* Effective Health (EHP) */}
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 to-transparent p-5">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              Estimated effective HP
            </span>
            <IconShield className="size-4" />
          </div>
          <p className="mt-2 font-mono text-3xl font-black text-white">
            {formatNumber(result.effectiveHealth)}
          </p>
          <div className="mt-1 flex items-center justify-between text-xs text-white/60">
            <span>HP / Defense:</span>
            <span className="font-mono text-white/80">
              {formatNumber(result.totalHealth)} / {formatNumber(result.totalDefense)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Interactive Gear & Profile Controls */}
        <div className="space-y-6 lg:col-span-2">
          {/* Environment & Target Selection */}
          <Panel className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <IconTarget className="size-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Target Mob & Environment
                </h2>
              </div>
              <span className="text-xs text-white/40">Affects mitigation & enchants</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-white/70">Select Target Mob</label>
                <select
                  value={loadout.targetMob}
                  onChange={(e) =>
                    setLoadout((prev: SimulatorLoadout) => ({
                      ...prev,
                      targetMob: e.target.value as SimulatorLoadout["targetMob"],
                    }))
                  }
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0B0E14] px-3 py-2 text-xs font-bold text-white outline-none"
                >
                  {(Object.keys(MOB_TARGETS) as Array<keyof typeof MOB_TARGETS>).map((key) => {
                    const mob = MOB_TARGETS[key];
                    return (
                      <option key={key} value={key}>
                        {mob?.name ?? key} ({formatNumber(mob?.maxHp ?? 0)} HP · {mob?.defense ?? 0}
                        % Def)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex items-end gap-3">
                <button
                  onClick={() =>
                    setLoadout((prev: SimulatorLoadout) => ({
                      ...prev,
                      insideDungeons: !prev.insideDungeons,
                    }))
                  }
                  className={cn(
                    "flex-1 rounded-xl border py-2 text-xs font-bold transition-none",
                    loadout.insideDungeons
                      ? "border-purple-500/40 bg-purple-500/20 text-purple-300"
                      : "border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/10",
                  )}
                >
                  {loadout.insideDungeons ? "🏰 Inside Dungeons (Active)" : "🌲 Overworld Mode"}
                </button>

                {loadout.insideDungeons && (
                  <button
                    onClick={() =>
                      setLoadout((prev: SimulatorLoadout) => ({
                        ...prev,
                        masterMode: !prev.masterMode,
                      }))
                    }
                    className={cn(
                      "flex-1 rounded-xl border py-2 text-xs font-bold transition-none",
                      loadout.masterMode
                        ? "border-red-500/40 bg-red-500/20 text-red-300"
                        : "border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/10",
                    )}
                  >
                    {loadout.masterMode ? "☠️ Master Mode" : "Normal F1-F7"}
                  </button>
                )}
              </div>
            </div>
          </Panel>

          {/* Player Core Progression (Cata & MP) */}
          <Panel className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <IconSliders className="size-4 text-sky-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Core Progression & Magical Power
                </h2>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="flex justify-between text-xs text-white/70">
                  <span>Combat Level</span>
                  <span className="font-mono font-bold text-white">{loadout.combatLevel}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={loadout.combatLevel}
                  onChange={(e) =>
                    setLoadout((prev: SimulatorLoadout) => ({
                      ...prev,
                      combatLevel: Number(e.target.value),
                    }))
                  }
                  className="mt-2 w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              <div>
                <label className="flex justify-between text-xs text-white/70">
                  <span>Catacombs Level</span>
                  <span className="font-mono font-bold text-purple-300">
                    {loadout.catacombsLevel}
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={loadout.catacombsLevel}
                  onChange={(e) =>
                    setLoadout((prev: SimulatorLoadout) => ({
                      ...prev,
                      catacombsLevel: Number(e.target.value),
                    }))
                  }
                  className="mt-2 w-full accent-purple-400 cursor-pointer"
                />
              </div>

              <div>
                <label className="flex justify-between text-xs text-white/70">
                  <span>Magical Power (MP)</span>
                  <span className="font-mono font-bold text-amber-300">{loadout.magicalPower}</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="1600"
                  step="25"
                  value={loadout.magicalPower}
                  onChange={(e) =>
                    setLoadout((prev: SimulatorLoadout) => ({
                      ...prev,
                      magicalPower: Number(e.target.value),
                    }))
                  }
                  className="mt-2 w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="text-xs font-semibold text-white/70">Accessory Power Tuning</label>
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {Object.keys(ACCESSORY_POWERS).map((powerName) => {
                  const power = ACCESSORY_POWERS[powerName];
                  return (
                    <button
                      key={powerName}
                      onClick={() =>
                        setLoadout((prev: SimulatorLoadout) => ({
                          ...prev,
                          accessoryPowerTuning: powerName,
                        }))
                      }
                      className={cn(
                        "flex flex-col items-center justify-center rounded-xl border p-2 text-xs font-bold transition-none",
                        loadout.accessoryPowerTuning === powerName
                          ? "border-amber-400/50 bg-amber-400/15 text-amber-300"
                          : "border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      <span>{powerName}</span>
                      <span className="text-[10px] font-normal text-white/40">
                        {power?.bonusName ?? ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Panel>

          {/* Weapon & Pet Config */}
          <Panel className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <IconSwords className="size-4 text-red-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Primary Weapon & Pet
                </h2>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Weapon */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    Weapon: {loadout.weapon.name}
                  </span>
                  <span className="rounded-md border border-white/10 bg-black/40 px-2 py-0.5 font-mono text-[10px] text-amber-300">
                    +{loadout.weapon.damage} Base DMG
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] text-white/60">Weapon Stars</label>
                    <select
                      value={loadout.weapon.stars}
                      onChange={(e) =>
                        setLoadout((prev: SimulatorLoadout) => ({
                          ...prev,
                          weapon: { ...prev.weapon, stars: Number(e.target.value) },
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-white/10 bg-[#0B0E14] p-1.5 text-xs text-white"
                    >
                      {[0, 1, 2, 3, 4, 5].map((s) => (
                        <option key={s} value={s}>
                          {s}★ Stars
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-white/60">Master Stars</label>
                    <select
                      value={loadout.weapon.masterStars}
                      onChange={(e) =>
                        setLoadout((prev: SimulatorLoadout) => ({
                          ...prev,
                          weapon: { ...prev.weapon, masterStars: Number(e.target.value) },
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-white/10 bg-[#0B0E14] p-1.5 text-xs text-white"
                    >
                      {[0, 1, 2, 3, 4, 5].map((s) => (
                        <option key={s} value={s}>
                          {s}✪ Master Stars
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Pet */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Pet: {loadout.pet.name}</span>
                  <span className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] text-amber-300">
                    LVL {loadout.pet.level}
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="flex justify-between text-xs text-white/60">
                    <span>Pet Level</span>
                    <span className="font-mono text-white">{loadout.pet.level}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="200"
                    value={loadout.pet.level}
                    onChange={(e) =>
                      setLoadout((prev: SimulatorLoadout) => ({
                        ...prev,
                        pet: { ...prev.pet, level: Number(e.target.value) },
                      }))
                    }
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </Panel>
        </div>

        {/* Right Column: Upgrade ROI & DPS Recommendations */}
        <div className="space-y-6">
          {/* Stat Totals Summary */}
          <Panel className="space-y-3">
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <IconCrosshair className="size-4 text-purple-400" />
              <h3 className="text-xs font-bold uppercase text-white tracking-wider">
                Active Combat Stats
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="flex justify-between rounded-lg bg-black/40 p-2 text-white/60">
                <span>Strength:</span>
                <span className="text-red-400 font-bold">+{result.totalStrength} ❁</span>
              </div>
              <div className="flex justify-between rounded-lg bg-black/40 p-2 text-white/60">
                <span>Crit Damage:</span>
                <span className="text-blue-400 font-bold">+{result.totalCritDamage}% ☠</span>
              </div>
              <div className="flex justify-between rounded-lg bg-black/40 p-2 text-white/60">
                <span>Ferocity:</span>
                <span className="text-red-500 font-bold">+{result.ferocity} ⫽</span>
              </div>
              <div className="flex justify-between rounded-lg bg-black/40 p-2 text-white/60">
                <span>Intelligence:</span>
                <span className="text-cyan-400 font-bold">+{result.totalIntelligence} ✎</span>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
