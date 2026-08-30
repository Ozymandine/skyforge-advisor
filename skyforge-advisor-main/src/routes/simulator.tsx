import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { usePlayer } from "@/hooks/use-account";
import { Panel } from "@/components/layout/app-shell";
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

  const loadFromProfile = () => {
    if (!player.data) return;
    const cata = player.data.dungeons?.catacombsLevel ?? 30;
    const combat = 45;
    setLoadout((prev: SimulatorLoadout) => ({
      ...prev,
      combatLevel: combat,
      catacombsLevel: cata,
      magicalPower: 750,
    }));
  };

  const resetDefaults = () => {
    setLoadout(getDefaultLoadout());
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-black shadow-lg">
              <IconSwords className="size-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Damage & Gear Simulator
            </h1>
          </div>
          <p className="mt-1.5 text-xs text-white/60 sm:text-sm">
            Hypixel combat sandbox — live damage calculation, Catacombs scaling, mob defenses, and
            cost-to-DPS optimizer.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {player.data && (
            <button
              onClick={loadFromProfile}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3.5 py-2 text-xs font-bold text-emerald-300 transition-none hover:bg-emerald-500/25 active:bg-emerald-500/30"
            >
              <IconSparkles className="size-3.5" /> Sync Profile
            </button>
          )}
          <button
            onClick={resetDefaults}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-bold text-white/70 transition-none hover:bg-white/10 hover:text-white"
          >
            <IconRotateCcw className="size-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Real-time KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Single Hit Damage */}
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

        {/* Sustained DPS */}
        <div className="rounded-2xl border border-red-500/30 bg-gradient-to-b from-red-500/10 to-transparent p-5">
          <div className="flex items-center justify-between text-red-400">
            <span className="text-xs font-bold uppercase tracking-wider">Sustained DPS</span>
            <IconZap className="size-4" />
          </div>
          <p className="mt-2 font-mono text-3xl font-black text-white">
            {formatNumber(result.dps)}
            <span className="text-sm text-white/40"> /s</span>
          </p>
          <div className="mt-1 flex items-center justify-between text-xs text-white/60">
            <span>Time to Kill Boss:</span>
            <span className="font-mono font-bold text-emerald-400">
              {result.mobKillTimeSeconds}s
            </span>
          </div>
        </div>

        {/* Effective Health (EHP) */}
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 to-transparent p-5">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider">Effective HP (EHP)</span>
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

        {/* Ability Damage */}
        <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-cyan-500/10 to-transparent p-5">
          <div className="flex items-center justify-between text-cyan-400">
            <span className="text-xs font-bold uppercase tracking-wider">Mage Ability DPS</span>
            <IconSparkles className="size-4" />
          </div>
          <p className="mt-2 font-mono text-3xl font-black text-white">
            {formatNumber(result.abilityDamage)}
          </p>
          <div className="mt-1 flex items-center justify-between text-xs text-white/60">
            <span>Intelligence:</span>
            <span className="font-mono font-bold text-cyan-300">
              {formatNumber(result.totalIntelligence)} ✎
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
          <Panel className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <IconTrendingUp className="size-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Highest ROI Upgrades
              </h2>
            </div>
            <p className="text-xs text-white/60">
              Ranked by damage increase per coin spent on your current build.
            </p>

            <div className="space-y-3">
              {result.upgradeSuggestions.map(
                (sug: (typeof result.upgradeSuggestions)[number], idx: number) => (
                  <div
                    key={sug.title}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-2 transition-none hover:border-emerald-500/40 hover:bg-white/[0.06]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-300">
                          #{idx + 1}
                        </span>
                        <h3 className="text-xs font-bold text-white">{sug.title}</h3>
                      </div>
                      <span className="rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-300">
                        +{sug.dpsGainPct}% DPS
                      </span>
                    </div>

                    <p className="text-[11px] text-white/60 leading-relaxed">{sug.description}</p>

                    <div className="flex items-center justify-between border-t border-white/10 pt-2 text-[11px]">
                      <span className="text-white/40">Est. Investment:</span>
                      <span className="font-mono font-bold text-white">
                        ~{formatNumber(sug.estimatedCostCoins)} coins
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>
          </Panel>

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
