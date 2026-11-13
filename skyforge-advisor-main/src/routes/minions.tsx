import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { IconTrendingUp, IconAward, IconZap, IconCompass } from "@/assets/icons";

import { Chip, PageHero, Panel, ProgressBar } from "@/components/layout/app-shell";
import { ItemIcon } from "@/components/ui/item-icon";
import { usePlayer } from "@/hooks/use-account";
import { fetchBazaar } from "@/lib/hypixel.functions";
import { playClickSound } from "@/lib/sound-effects";
import {
  MINIONS_CATALOG,
  MINION_FUELS,
  MINION_ESTIMATE_FUELS,
  MINION_ESTIMATE_IDS,
  ENCHANTED_HOPPER_RATE,
  estimateMinionYield,
  getMinionSlotProgression,
} from "@/lib/minions-engine";
import { MARKET_MAX_AGE_MS } from "@/lib/constants";
import { formatFull } from "@/lib/skyblock";
import { marketControl } from "@/components/market-controls";

export const Route = createFileRoute("/minions")({
  component: MinionsRoute,
});

type TabMode = "leaderboard" | "slots" | "fuels";

export function MinionsRoute() {
  const { data: player } = usePlayer();
  const craftHistoryKnown = player?.craftedGenerators !== undefined;
  const [tab, setTab] = useState<TabMode>("leaderboard");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sellMode, setSellMode] = useState<"npc" | "bazaar">("npc");
  const [fuelId, setFuelId] =
    useState<(typeof MINION_ESTIMATE_FUELS)[number]>("ENCHANTED_LAVA_BUCKET");

  // Live Bazaar query
  const {
    data: bazaarData,
    isLoading: marketLoading,
    isError: marketError,
  } = useQuery({
    queryKey: ["bazaar"],
    queryFn: fetchBazaar,
    staleTime: 45_000,
    refetchInterval: 60_000,
  });

  const freshMarket = Boolean(
    bazaarData &&
    !marketError &&
    !bazaarData.stale &&
    bazaarData.lastUpdated > 0 &&
    Date.now() - bazaarData.lastUpdated <= MARKET_MAX_AGE_MS,
  );
  const prices = useMemo(
    () => new Map(freshMarket ? bazaarData?.products.map((product) => [product.id, product]) : []),
    [bazaarData, freshMarket],
  );

  // Minion slot progression from profile
  const slotProgression = useMemo(() => {
    const communitySlots =
      player?.communityUpgrades?.find((u) => u.upgrade.toLowerCase().includes("minion"))?.level ??
      0;
    return getMinionSlotProgression(player?.craftedGenerators ?? [], communitySlots);
  }, [player?.craftedGenerators, player?.communityUpgrades]);

  const estimates = useMemo(
    () =>
      MINIONS_CATALOG.flatMap((minion) => {
        if (categoryFilter !== "all" && minion.category !== categoryFilter) return [];
        const estimate = estimateMinionYield(minion, fuelId, sellMode, prices);
        return estimate ? [{ minion, ...estimate }] : [];
      }).sort((a, b) => {
        if (a.dailyCoins === null) return b.dailyCoins === null ? 0 : 1;
        return b.dailyCoins === null ? -1 : b.dailyCoins - a.dailyCoins;
      }),
    [categoryFilter, fuelId, sellMode, prices],
  );
  const firstEstimate = estimates.find((entry) => entry.dailyCoins !== null);
  const supportedFuels = MINION_FUELS.filter((fuel) =>
    MINION_ESTIMATE_FUELS.some((id) => id === fuel.id),
  );

  return (
    <div className="space-y-6 pb-12">
      <PageHero
        title="Minions"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Chip
              active={tab === "leaderboard"}
              onClick={() => {
                playClickSound();
                setTab("leaderboard");
              }}
            >
              <IconTrendingUp className="size-3.5" /> Yield estimates
            </Chip>
            <Chip
              active={tab === "slots"}
              onClick={() => {
                playClickSound();
                setTab("slots");
              }}
            >
              <IconAward className="size-3.5" /> Slot Progression
            </Chip>
            <Chip
              active={tab === "fuels"}
              onClick={() => {
                playClickSound();
                setTab("fuels");
              }}
            >
              <IconZap className="size-3.5" /> Supported fuels
            </Chip>
          </div>
        }
      />

      {/* Top Level Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Panel className="relative overflow-hidden border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Unlocked Minion Slots
            </span>
            <IconAward className="size-4 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-amber-300">
            {craftHistoryKnown ? slotProgression.totalSlotsUnlocked : "—"}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              / {slotProgression.maxPossibleSlots} max
            </span>
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>
              {craftHistoryKnown
                ? slotProgression.uniqueCraftsCount + " unique crafts"
                : "Craft history unavailable"}
            </span>
            {slotProgression.communitySlots > 0 && (
              <span className="text-emerald-400 font-medium">
                (+{slotProgression.communitySlots} Elizabeth)
              </span>
            )}
          </div>
        </Panel>

        <Panel className="relative overflow-hidden border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Next Slot Goal
            </span>
            <IconCompass className="size-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-foreground">
            {craftHistoryKnown ? (
              slotProgression.nextSlotThreshold === null ? (
                "Craft slots complete"
              ) : (
                <>
                  {slotProgression.craftsForNextSlot}{" "}
                  <span className="text-xs text-muted-foreground font-normal">crafts needed</span>
                </>
              )
            ) : (
              "—"
            )}
          </p>
          {craftHistoryKnown && slotProgression.nextSlotThreshold !== null && (
            <div className="mt-2">
              <ProgressBar pct={slotProgression.progressToNextPct} tone="gold" />
              <span className="mt-1 block text-[10px] text-muted-foreground">
                {slotProgression.uniqueCraftsCount} / {slotProgression.nextSlotThreshold} threshold
              </span>
            </div>
          )}
        </Panel>
      </div>

      {/* =========================================================================
       * TAB 1: PROFITABILITY LEADERBOARD
       * ======================================================================= */}
      {tab === "leaderboard" && (
        <Panel className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <label className="grid gap-1 text-sm">
              Fuel
              <select
                value={fuelId}
                className={marketControl}
                onChange={(event) => {
                  const next = MINION_ESTIMATE_FUELS.find((id) => id === event.target.value);
                  if (next) setFuelId(next);
                }}
              >
                {supportedFuels.map((fuel) => (
                  <option key={fuel.id} value={fuel.id}>
                    {fuel.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              Selling method
              <select
                value={sellMode}
                className={marketControl}
                onChange={(event) =>
                  setSellMode(event.target.value === "bazaar" ? "bazaar" : "npc")
                }
              >
                <option value="npc">Enchanted Hopper ({ENCHANTED_HOPPER_RATE * 100}% NPC)</option>
                <option value="bazaar">Bazaar instant sell</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              Category
              <select
                value={categoryFilter}
                className={marketControl}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option value="all">All supported minions</option>
                <option value="combat">Combat</option>
                <option value="mining">Mining</option>
                <option value="fishing">Fishing</option>
              </select>
            </label>
          </div>
          <p className="text-sm text-muted-foreground">
            Daily estimates assume uninterrupted production in a standard layout without upgrades or
            external boosts. Hopper rates assume storage is already full. Bazaar proceeds use the
            current buy-order quote after the standard fee. Actual prices depend on order depth and
            can change before you sell. Consumable fuel is priced at the current sell-offer quote.
            Upfront setup costs are excluded.
          </p>
          {firstEstimate && (
            <p className="text-sm">
              Highest under these settings: <strong>{firstEstimate.minion.name}</strong>
            </p>
          )}
          {!freshMarket && (sellMode === "bazaar" || fuelId === "HAMSTER_WHEEL") && (
            <p role="status" className="text-sm text-muted-foreground">
              {marketLoading
                ? "Loading Bazaar quotes…"
                : bazaarData?.stale
                  ? "Bazaar quotes are stale."
                  : "Current Bazaar quotes are unavailable."}
            </p>
          )}
          {freshMarket && estimates.some((entry) => entry.dailyCoins === null) && (
            <p role="status" className="text-sm text-muted-foreground">
              Some drops or fuel have no usable market quote.
            </p>
          )}
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-primary/5 text-xs text-muted-foreground">
                <tr>
                  <th scope="col" className="px-3 py-2">
                    Minion
                  </th>
                  <th scope="col" className="px-3 py-2">
                    Drops / day
                  </th>
                  <th scope="col" className="px-3 py-2 text-right">
                    Fuel / day
                  </th>
                  <th scope="col" className="px-3 py-2 text-right">
                    Coins / day after fuel
                  </th>
                  {craftHistoryKnown && (
                    <th scope="col" className="px-3 py-2 text-right">
                      {slotProgression.totalSlotsUnlocked} slots / day
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {estimates.map(({ minion, output, dailyFuelCost, dailyCoins }) => (
                  <tr
                    key={minion.id + "-" + minion.tier}
                    className="transition-colors hover:bg-primary/5"
                  >
                    <th scope="row" className="px-3 py-2 font-medium">
                      <div className="flex items-center gap-2">
                        <ItemIcon
                          id={minion.id + "_GENERATOR_" + minion.tier}
                          name={minion.name}
                          className="size-7 shrink-0"
                        />
                        {minion.name}
                      </div>
                    </th>
                    <td className="px-3 py-2 text-muted-foreground">
                      {output.itemsProduced
                        .map((drop) => formatFull(drop.dailyAmount) + " × " + drop.name)
                        .join(", ")}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {dailyFuelCost === null ? "—" : formatFull(dailyFuelCost)}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold tabular-nums">
                      {dailyCoins === null ? "Unavailable" : formatFull(dailyCoins)}
                    </td>
                    {craftHistoryKnown && (
                      <td className="px-3 py-2 text-right tabular-nums">
                        {dailyCoins === null
                          ? "—"
                          : formatFull(dailyCoins * slotProgression.totalSlotsUnlocked)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground">
            Yield estimates cover {MINION_ESTIMATE_IDS.size} minion types. Inferno production
            depends on specialized fuel and setup.
          </p>
        </Panel>
      )}

      {/* =========================================================================
       * TAB 2: SLOT PROGRESSION & CHEAPEST CRAFTS
       * ======================================================================= */}
      {tab === "slots" && !craftHistoryKnown && (
        <Panel>
          <p className="text-sm text-muted-foreground">
            Minion craft history is unavailable for this profile.
          </p>
        </Panel>
      )}
      {tab === "slots" && craftHistoryKnown && (
        <div className="space-y-6">
          <Panel>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <IconAward className="size-5 text-amber-400" /> Minion Slot Roadmap
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
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Unique crafts: {slotProgression.uniqueCraftsCount}
                  {slotProgression.nextSlotThreshold !== null &&
                    ` / ${slotProgression.nextSlotThreshold}`}
                </span>
                <span className="font-bold text-primary">
                  {slotProgression.progressToNextPct}% to next slot
                </span>
              </div>
              <ProgressBar pct={slotProgression.progressToNextPct} tone="gold" />
            </div>
          </Panel>

          <Panel>
            <h3 className="text-base font-semibold">Minion recipes</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Check the materials and requirements for your next craft.
            </p>
            <Link
              to="/wiki"
              search={{ q: "minion" }}
              className="mt-2 inline-block text-sm text-primary hover:underline"
            >
              Browse minions in the Wiki
            </Link>
          </Panel>
        </div>
      )}

      {/* =========================================================================
       * TAB 3: FUEL & UPGRADE OPTIMIZER
       * ======================================================================= */}
      {tab === "fuels" && (
        <Panel className="space-y-3">
          <h2 className="text-lg font-semibold">Supported fuels</h2>
          <dl className="divide-y divide-border">
            {supportedFuels
              .filter((fuel) => fuel.id !== "NONE")
              .map((fuel) => {
                const price = prices.get(fuel.id)?.buyPrice;
                return (
                  <div
                    key={fuel.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                  >
                    <dt className="flex items-center gap-2 font-medium">
                      <ItemIcon id={fuel.id} name={fuel.name} className="size-6" />
                      {fuel.name}
                    </dt>
                    <dd className="text-muted-foreground">
                      +{Math.round(fuel.speedBonus * 100)}% speed ·{" "}
                      {fuel.durationHours ? fuel.durationHours + " hours" : "Permanent"}
                      {price && " · " + formatFull(price) + " coins per item (sell-offer quote)"}
                    </dd>
                  </div>
                );
              })}
          </dl>
        </Panel>
      )}
    </div>
  );
}
