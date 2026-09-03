import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  IconTarget,
  IconTrendingUp,
  IconScale,
  IconHammer,
  IconAlertTriangle,
  IconCheck,
  IconCopy,
  IconFlame,
  IconShieldCheck,
  IconZap,
  IconBoxes,
  IconArrowRight,
  IconFilter,
  IconRefreshCw,
  IconSparkles,
  IconCoins,
  IconCrown,
  IconDog,
  IconBot,
  IconVolume2,
  IconVolumeX,
  IconRadio,
} from "@/assets/icons";
import { useMemo, useState, useEffect, useDeferredValue } from "react";

import { PageHero, Panel, StatRow, ProgressBar } from "@/components/layout/app-shell";
import { LoadState, ErrorState } from "@/components/data-states";
import { ItemIcon } from "@/components/ui/item-icon";
import { fetchBazaar, fetchAuctions, fetchFlipAccuracy } from "@/lib/hypixel.functions";
import { formatNumber, formatFull, type BazaarProduct, type AuctionEntry } from "@/lib/skyblock";
import { playSnipeChime, playJackpotChime } from "@/lib/flip-audio";
import {
  calculateNetProfit,
  calculateVelocityIndex,
  calculateRiskRating,
  detectPriceManipulation,
  generateCraftFlips,
  getAuctionCommand,
  getBazaarCommand,
  getCraftCommand,
  type CraftFlip,
} from "@/lib/flip-finder";
import {
  calculateCrossMarketArbitrage,
  calculatePetLevelingOpportunities,
  calculateMinionSetups,
  getDarkAuctionCeilings,
  getShensAuctionMatrix,
} from "@/lib/arbitrage-engine";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/flips")({
  head: () => ({
    meta: [
      { title: "Market Flips & Arbitrage Matrix — SkyForge" },
      {
        name: "description",
        content:
          "Real-time Bazaar spread flips, Auction House undercuts, cross-market AH <-> BZ arbitrage, pet leveling margins, minion ROI, and Sirius bid ceilings.",
      },
      { property: "og:title", content: "Market Flips & Arbitrage Matrix — SkyForge" },
      {
        property: "og:description",
        content:
          "Complete flip finder with cross-market arbitrage, pet leveling margins, and anti-manipulation spoof detectors.",
      },
      { property: "og:url", content: "https://skyforge-advisor.vercel.app/flips" },
      {
        property: "og:image",
        content: "https://skyforge-advisor.vercel.app/og-image.png",
      },
      {
        name: "twitter:title",
        content: "Market Flips & Arbitrage Matrix — SkyForge",
      },
      {
        name: "twitter:image",
        content: "https://skyforge-advisor.vercel.app/og-image.png",
      },
    ],
    links: [{ rel: "canonical", href: "https://skyforge-advisor.vercel.app/flips" }],
  }),
  component: FlipsRoute,
});

type TabType =
  | "bazaar"
  | "auctions"
  | "crafts"
  | "arbitrage"
  | "pets"
  | "minions"
  | "dark_auction"
  | "scorecard";

type BudgetTier = "all" | "low" | "mid" | "high" | "whale";

function FlipsRoute() {
  const [activeTab, setActiveTab] = useState<TabType>("bazaar");
  const [budgetTier, setBudgetTier] = useState<BudgetTier>("all");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [minProfit, setMinProfit] = useState<number>(50_000);
  const [minMargin, setMinMargin] = useState<number>(3);
  const [hideTraps, setHideTraps] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [sniperThreshold, setSniperThreshold] = useState<number>(3_000_000);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    if (soundEnabled) {
      playSnipeChime(0.5);
    }
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Queries
  const bazaarQuery = useQuery({
    queryKey: ["bazaar"],
    queryFn: () => fetchBazaar(),
    staleTime: 45_000,
    refetchInterval: 60_000,
  });

  const auctionsQuery = useQuery({
    queryKey: ["auctions"],
    queryFn: () => fetchAuctions(),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const accuracyQuery = useQuery({
    queryKey: ["flip-accuracy"],
    queryFn: () => fetchFlipAccuracy(),
    staleTime: 60_000,
  });

  const bazaarData = bazaarQuery.data;
  const auctionsData = auctionsQuery.data;
  const accuracy = accuracyQuery.data;

  // Process Maps
  const bzMap = useMemo(() => {
    const map = new Map<string, { buyPrice: number; sellPrice: number; weeklyVolume?: number }>();
    for (const p of bazaarData?.products ?? []) {
      map.set(p.id, {
        buyPrice: p.buyPrice,
        sellPrice: p.sellPrice,
        weeklyVolume: p.buyMovingWeek,
      });
    }
    return map;
  }, [bazaarData]);

  const ahMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of auctionsData?.entries ?? []) {
      if (a.bin && a.price > 0 && a.id) {
        const existing = map.get(a.id);
        if (!existing || a.price < existing) {
          map.set(a.id, a.price);
        }
      }
    }
    return map;
  }, [auctionsData]);

  // Arbitrage Results
  const crossArbitrage = useMemo(() => calculateCrossMarketArbitrage(bzMap, ahMap), [bzMap, ahMap]);
  const petFlips = useMemo(() => calculatePetLevelingOpportunities(ahMap), [ahMap]);
  const minionSetups = useMemo(() => calculateMinionSetups(), []);
  const daCeilings = useMemo(() => getDarkAuctionCeilings(), []);
  const shensMatrix = useMemo(() => getShensAuctionMatrix(), []);

  // Process Bazaar Flips
  const bazaarFlips = useMemo(() => {
    if (!bazaarData?.products) return [];
    const q = deferredQuery.toLowerCase();

    return bazaarData.products
      .filter((p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q))
      .map((p) => {
        const { tax, netProfit, marginPct } = calculateNetProfit(p.buyPrice, p.sellPrice, "bazaar");
        const dailyVol = Math.round(p.buyMovingWeek / 7);
        const velocity = calculateVelocityIndex(dailyVol, 10, marginPct);
        const risk = calculateRiskRating(dailyVol, marginPct, false, velocity.isTrap);

        return {
          ...p,
          tax,
          netProfit,
          marginPct,
          velocity,
          risk,
        };
      })
      .filter((p) => {
        if (budgetTier === "low") return p.buyPrice < 1_000_000;
        if (budgetTier === "mid") return p.buyPrice >= 1_000_000 && p.buyPrice <= 25_000_000;
        if (budgetTier === "high") return p.buyPrice > 25_000_000 && p.buyPrice <= 100_000_000;
        if (budgetTier === "whale") return p.buyPrice > 100_000_000;
        return true;
      })
      .filter((p) => p.netProfit >= minProfit && p.marginPct >= minMargin)
      .filter((p) => (!hideTraps ? true : !p.velocity.isTrap))
      .sort((a, b) => b.netProfit - a.netProfit || b.marginPct - a.marginPct);
  }, [bazaarData, deferredQuery, minProfit, minMargin, hideTraps, budgetTier]);

  // Process Auction Flips
  const auctionFlips = useMemo(() => {
    if (!auctionsData?.entries) return [];
    const q = deferredQuery.toLowerCase();

    return auctionsData.entries
      .filter((a) => a.bin && a.profit > 0)
      .filter((a) => a.name.toLowerCase().includes(q))
      .map((a) => {
        const sellPrice = a.lowestBin ?? a.price + a.profit;
        const { tax, netProfit, marginPct } = calculateNetProfit(a.price, sellPrice, "ah");
        const manipulation = detectPriceManipulation(
          sellPrice,
          a.lowestBin ? a.lowestBin * 0.9 : a.price,
        );
        const velocity = calculateVelocityIndex(50, 4, marginPct);
        const risk = calculateRiskRating(
          50,
          marginPct,
          manipulation.isManipulated,
          velocity.isTrap,
        );

        return {
          ...a,
          sellPrice,
          tax,
          netProfit,
          marginPct,
          manipulation,
          velocity,
          risk,
        };
      })
      .filter((a) => {
        if (budgetTier === "low") return a.price < 1_000_000;
        if (budgetTier === "mid") return a.price >= 1_000_000 && a.price <= 25_000_000;
        if (budgetTier === "high") return a.price > 25_000_000 && a.price <= 100_000_000;
        if (budgetTier === "whale") return a.price > 100_000_000;
        return true;
      })
      .filter((a) => a.netProfit >= minProfit && a.marginPct >= minMargin)
      .filter((a) => (!hideTraps ? true : !a.manipulation.isManipulated))
      .sort((a, b) => b.netProfit - a.netProfit);
  }, [auctionsData, deferredQuery, minProfit, minMargin, hideTraps, budgetTier]);

  // Process Craft Flips
  const craftFlips = useMemo(() => {
    if (!bazaarData?.products) return [];
    const names = new Map<string, string>();
    for (const p of bazaarData.products) names.set(p.id, p.name);

    const allCrafts = generateCraftFlips(bzMap, ahMap, names, 50);
    const q = deferredQuery.toLowerCase();

    return allCrafts
      .filter((c) => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q))
      .filter((c) => c.netProfit >= minProfit && c.marginPct >= minMargin)
      .filter((c) => (!hideTraps ? true : !c.velocity.isTrap));
  }, [bazaarData, bzMap, ahMap, deferredQuery, minProfit, minMargin, hideTraps]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHero
        eyebrow="Market Intelligence"
        title="Flips & Arbitrage Matrix"
        description="Bazaar spread flips, AH undercuts, cross-market arbitrage, pet leveling margins, minion ROI, and 1-click clipboard execution."
      />

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex flex-wrap gap-2">
          {[
            {
              id: "bazaar",
              label: "Bazaar Flips",
              count: bazaarFlips.length,
              icon: IconTrendingUp,
            },
            { id: "auctions", label: "AH Undercuts", count: auctionFlips.length, icon: IconHammer },
            { id: "crafts", label: "Craft Margins", count: craftFlips.length, icon: IconBoxes },
            {
              id: "arbitrage",
              label: "AH ↔ BZ Arbitrage",
              count: crossArbitrage.length,
              icon: IconRefreshCw,
            },
            { id: "pets", label: "Pet Leveling ROI", count: petFlips.length, icon: IconDog },
            {
              id: "minions",
              label: "Minion Setup Payback",
              count: minionSetups.length,
              icon: IconBot,
            },
            {
              id: "dark_auction",
              label: "Sirius Bid Ceilings",
              count: daCeilings.length,
              icon: IconCrown,
            },
            { id: "scorecard", label: "Scorecard", count: null, icon: IconScale },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all",
                  active
                    ? "border border-sky-400/40 bg-sky-500/20 text-white shadow-lg shadow-sky-500/10"
                    : "border border-white/5 bg-white/[0.02] text-white/60 hover:bg-white/[0.05] hover:text-white",
                )}
              >
                <IconTrendingUp className="size-3.5 text-sky-400" />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-mono font-bold text-white/80">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Budget Preset Filter Controls */}
        {(activeTab === "bazaar" || activeTab === "auctions") && (
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-black/40 p-1">
            {[
              { id: "all", label: "All" },
              { id: "low", label: "🟢 <1M" },
              { id: "mid", label: "🟡 1M–25M" },
              { id: "high", label: "🟣 25M–100M" },
              { id: "whale", label: "🐋 >100M" },
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => setBudgetTier(b.id as BudgetTier)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all",
                  budgetTier === b.id
                    ? "bg-white/20 text-white font-bold"
                    : "text-white/50 hover:text-white",
                )}
              >
                {b.label}
              </button>
            ))}
          </div>
        )}

        {/* Live Audio Sniper Radar Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              if (next) playJackpotChime(0.5);
            }}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-none",
              soundEnabled
                ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300 shadow-lg shadow-emerald-500/10"
                : "border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/10 hover:text-white",
            )}
            title="Play Minecraft audio chime when copying or finding top flips"
          >
            {soundEnabled ? (
              <>
                <IconVolume2 className="size-3.5 text-emerald-400" />
                <span>Audio Radar: ON</span>
              </>
            ) : (
              <>
                <IconVolumeX className="size-3.5 text-white/40" />
                <span>Audio Radar: OFF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading States */}
      {(bazaarQuery.isLoading || auctionsQuery.isLoading) && (
        <LoadState>Scanning live market liquidity & margins…</LoadState>
      )}

      {/* TAB 1: BAZAAR SPREAD FLIPS */}
      {activeTab === "bazaar" && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {bazaarFlips.slice(0, 30).map((flip) => {
              const cmd = getBazaarCommand(flip.id);
              const isCopied = copiedId === flip.id;

              return (
                <div
                  key={flip.id}
                  className="flex flex-col justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-colors duration-75 hover:border-sky-500/30 hover:bg-white/[0.04]"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <ItemIcon id={flip.id} name={flip.name} className="size-8 shrink-0" />
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-white">{flip.name}</h3>
                          <span className="font-mono text-[10px] text-white/40">{flip.id}</span>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "rounded-lg border px-2 py-0.5 text-[10px] font-bold shrink-0",
                          flip.risk.badgeClass,
                        )}
                      >
                        {flip.risk.label}
                      </span>
                    </div>

                    <div className="mt-4 space-y-1.5 rounded-xl bg-black/30 p-3 text-xs">
                      <div className="flex justify-between text-white/60">
                        <span>Buy Order (Cost):</span>
                        <span className="font-mono text-white">{formatFull(flip.buyPrice)}</span>
                      </div>
                      <div className="flex justify-between text-white/60">
                        <span>Sell Offer:</span>
                        <span className="font-mono text-white">{formatFull(flip.sellPrice)}</span>
                      </div>
                      <div className="flex justify-between text-white/40 text-[11px]">
                        <span>Bazaar Tax (1.25%):</span>
                        <span className="font-mono text-rose-400">-{formatFull(flip.tax)}</span>
                      </div>
                      <div className="flex justify-between border-t border-white/10 pt-1.5 font-bold">
                        <span className="text-emerald-300">Net Profit:</span>
                        <span className="font-mono text-emerald-400">
                          +{formatFull(flip.netProfit)} ({flip.marginPct}%)
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px]">
                      <span className="text-white/50">Sell Velocity:</span>
                      <span className="font-mono font-semibold text-sky-300">
                        {flip.velocity.label} (~{flip.velocity.estimatedMinutesToSell}m)
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => copyToClipboard(cmd, flip.id)}
                    className={cn(
                      "mt-4 flex w-full items-center justify-center gap-2 rounded-xl border py-2 text-xs font-bold transition-all",
                      isCopied
                        ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                        : "border-sky-400/30 bg-sky-500/15 text-sky-300 hover:bg-sky-500/25",
                    )}
                  >
                    {isCopied ? (
                      <IconCheck className="size-3.5" />
                    ) : (
                      <IconCopy className="size-3.5" />
                    )}
                    <span>{isCopied ? "Command Copied!" : `Copy ${cmd}`}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: AUCTION HOUSE UNDERCUTS */}
      {activeTab === "auctions" && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {auctionFlips.slice(0, 30).map((flip) => {
              const cmd = getAuctionCommand(flip.uuid);
              const isCopied = copiedId === flip.uuid;

              return (
                <div
                  key={flip.uuid}
                  className="flex flex-col justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-colors duration-75 hover:border-purple-500/30 hover:bg-white/[0.04]"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <ItemIcon
                          id={flip.id ?? flip.name}
                          name={flip.name}
                          className="size-8 shrink-0"
                        />
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-white">{flip.name}</h3>
                          <span className="font-mono text-[10px] text-white/40">{flip.rarity}</span>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "rounded-lg border px-2 py-0.5 text-[10px] font-bold shrink-0",
                          flip.risk.badgeClass,
                        )}
                      >
                        {flip.risk.label}
                      </span>
                    </div>

                    <div className="mt-4 space-y-1.5 rounded-xl bg-black/30 p-3 text-xs">
                      <div className="flex justify-between text-white/60">
                        <span>Listing BIN Price:</span>
                        <span className="font-mono text-white">{formatFull(flip.price)}</span>
                      </div>
                      <div className="flex justify-between text-white/60">
                        <span>Target Resell Price:</span>
                        <span className="font-mono text-white">{formatFull(flip.sellPrice)}</span>
                      </div>
                      <div className="flex justify-between text-white/40 text-[11px]">
                        <span>AH Taxes & Fees:</span>
                        <span className="font-mono text-rose-400">-{formatFull(flip.tax)}</span>
                      </div>
                      <div className="flex justify-between border-t border-white/10 pt-1.5 font-bold">
                        <span className="text-emerald-300">Net Profit:</span>
                        <span className="font-mono text-emerald-400">
                          +{formatFull(flip.netProfit)} ({flip.marginPct}%)
                        </span>
                      </div>
                    </div>

                    {flip.manipulation.isManipulated && (
                      <div className="mt-3 flex items-start gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-[10px] text-red-300">
                        <IconAlertTriangle className="size-3.5 shrink-0 mt-0.5" />
                        <span>{flip.manipulation.reason}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => copyToClipboard(cmd, flip.uuid)}
                    className={cn(
                      "mt-4 flex w-full items-center justify-center gap-2 rounded-xl border py-2 text-xs font-bold transition-all",
                      isCopied
                        ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                        : "border-purple-400/30 bg-purple-500/15 text-purple-300 hover:bg-purple-500/25",
                    )}
                  >
                    {isCopied ? (
                      <IconCheck className="size-3.5" />
                    ) : (
                      <IconCopy className="size-3.5" />
                    )}
                    <span>{isCopied ? "Command Copied!" : `Copy ${cmd}`}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CRAFT-FLIP MARGINS */}
      {activeTab === "crafts" && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {craftFlips.map((flip) => {
              const cmd = getCraftCommand(flip.id);
              const isCopied = copiedId === flip.id;

              return (
                <div
                  key={flip.id}
                  className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-colors duration-75 hover:border-amber-500/30"
                >
                  <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <ItemIcon id={flip.id} name={flip.name} className="size-10 shrink-0" />
                      <div>
                        <h3 className="text-base font-bold text-white">{flip.name}</h3>
                        <p className="text-xs text-white/40">
                          Craft via Bazaar $\to$ Sell on {flip.targetMarket.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-base font-black text-emerald-400">
                        +{formatFull(flip.netProfit)}
                      </p>
                      <p className="font-mono text-xs font-bold text-sky-400">
                        {flip.marginPct}% ROI
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-semibold text-white/70 mb-2">
                      Required Ingredients (Bazaar Buy Orders):
                    </p>
                    <div className="space-y-1.5">
                      {flip.ingredients.map((ing) => (
                        <div
                          key={ing.id}
                          className="flex items-center justify-between rounded-lg bg-black/30 px-3 py-1.5 text-xs"
                        >
                          <span className="text-white/80">
                            {ing.amount}x {ing.name}
                          </span>
                          <span className="font-mono text-white/50">
                            {formatFull(ing.totalCost)} coins
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs">
                    <div>
                      <span className="text-white/50">Total Craft Cost:</span>{" "}
                      <span className="font-mono font-bold text-white">
                        {formatFull(flip.craftCost)}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/50">Market Value:</span>{" "}
                      <span className="font-mono font-bold text-white">
                        {formatFull(flip.sellPrice)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => copyToClipboard(cmd, flip.id)}
                    className={cn(
                      "mt-4 flex w-full items-center justify-center gap-2 rounded-xl border py-2 text-xs font-bold transition-all",
                      isCopied
                        ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                        : "border-amber-400/30 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25",
                    )}
                  >
                    {isCopied ? (
                      <IconCheck className="size-3.5" />
                    ) : (
                      <IconCopy className="size-3.5" />
                    )}
                    <span>{isCopied ? "Command Copied!" : `Copy ${cmd}`}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: CROSS-MARKET ARBITRAGE */}
      {activeTab === "arbitrage" && (
        <div className="space-y-4">
          <Panel>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Cross-Market AH ↔ Bazaar Arbitrage Matrix
                </h2>
                <p className="text-xs text-white/50">
                  Instant margin gaps between Bazaar orders and Auction House Lowest BIN
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {crossArbitrage.map((a) => {
                const isCopied = copiedId === a.id;
                return (
                  <div
                    key={a.id}
                    className="flex flex-col justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur transition-all hover:border-emerald-500/30"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">{a.name}</h3>
                        <span className="rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-300">
                          {a.marginPct}% ROI
                        </span>
                      </div>

                      <div className="mt-3 space-y-1.5 rounded-xl bg-black/30 p-3 text-xs">
                        <div className="flex justify-between text-white/60">
                          <span>Buy on {a.buyMarket.toUpperCase()}:</span>
                          <span className="font-mono text-white">{formatFull(a.buyPrice)}</span>
                        </div>
                        <div className="flex justify-between text-white/60">
                          <span>Sell on {a.sellMarket.toUpperCase()}:</span>
                          <span className="font-mono text-white">{formatFull(a.sellPrice)}</span>
                        </div>
                        <div className="flex justify-between border-t border-white/10 pt-1.5 font-bold">
                          <span className="text-emerald-300">Net Profit:</span>
                          <span className="font-mono text-emerald-400">
                            +{formatFull(a.netProfit)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => copyToClipboard(a.commandBuy, a.id)}
                      className={cn(
                        "mt-4 flex w-full items-center justify-center gap-2 rounded-xl border py-2 text-xs font-bold transition-all",
                        isCopied
                          ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                          : "border-emerald-400/30 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25",
                      )}
                    >
                      {isCopied ? (
                        <IconCheck className="size-3.5" />
                      ) : (
                        <IconCopy className="size-3.5" />
                      )}
                      <span>{isCopied ? "Command Copied!" : `Copy ${a.commandBuy}`}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      )}

      {/* TAB 5: PET LEVELING ROI */}
      {activeTab === "pets" && (
        <div className="space-y-4">
          <Panel>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Pet Leveling Margins & ROI</h2>
                <p className="text-xs text-white/50">
                  Level 1 buy cost + candy/XP investment vs Level 100/200 resale price
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {petFlips.map((pet) => (
                <div
                  key={pet.petName}
                  className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">{pet.petName}</h3>
                    <span className="rounded-lg border border-purple-500/40 bg-purple-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-purple-300">
                      Lv 1 $\to$ {pet.maxLevel}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 rounded-xl bg-black/30 p-3 text-xs">
                    <div className="flex justify-between text-white/60">
                      <span>Lv 1 Base Cost:</span>
                      <span className="font-mono text-white">{formatFull(pet.level1BuyPrice)}</span>
                    </div>
                    <div className="flex justify-between text-white/60">
                      <span>Lv {pet.maxLevel} Market Resale:</span>
                      <span className="font-mono text-white">
                        {formatFull(pet.levelMaxSellPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between text-white/50 text-[11px]">
                      <span>XP Required:</span>
                      <span className="font-mono text-sky-300">
                        {(pet.xpRequired / 1_000_000).toFixed(1)}M XP
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-1.5 font-bold">
                      <span className="text-emerald-300">Net Profit:</span>
                      <span className="font-mono text-emerald-400">
                        +{formatFull(pet.netProfit)} ({pet.roiPct}%)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {/* TAB 6: MINION SETUP PAYBACK */}
      {activeTab === "minions" && (
        <div className="space-y-4">
          <Panel>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Full Minion Setup ROI & Payback Engine
                </h2>
                <p className="text-xs text-white/50">
                  Initial setup cost vs daily coin generation & days to break even
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {minionSetups.map((m) => (
                <div
                  key={m.minionName}
                  className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">
                      {m.minionName} T{m.tier}
                    </h3>
                    <span className="rounded-lg border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-300">
                      {m.paybackDays} Days Payback
                    </span>
                  </div>

                  <p className="text-[11px] text-white/50 mt-1">{m.upgradesUsed}</p>

                  <div className="mt-3 space-y-1.5 rounded-xl bg-black/30 p-3 text-xs">
                    <div className="flex justify-between text-white/60">
                      <span>Setup Cost:</span>
                      <span className="font-mono text-white">{formatFull(m.setupCostCoins)}</span>
                    </div>
                    <div className="flex justify-between text-white/60">
                      <span>Daily Profit:</span>
                      <span className="font-mono text-emerald-400">
                        +{formatFull(m.dailyCoinProfit)} / day
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-1.5 font-bold">
                      <span className="text-sky-300">30-Day Profit:</span>
                      <span className="font-mono text-sky-400">
                        +{formatFull(m.tier30DayProfit)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {/* TAB 7: SIRIUS DARK AUCTION BID CEILINGS */}
      {activeTab === "dark_auction" && (
        <div className="space-y-4">
          <Panel>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Sirius Dark Auction Bid Ceiling Estimator
                </h2>
                <p className="text-xs text-white/50">
                  Maximum profitable bid limit with a 10% safety margin after AH listing fees
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {daCeilings.map((item) => (
                <div
                  key={item.name}
                  className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">{item.name}</h3>
                    <span className="rounded-lg border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-300">
                      Max Bid Cap
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 rounded-xl bg-black/30 p-3 text-xs">
                    <div className="flex justify-between text-white/60">
                      <span>AH Lowest BIN Value:</span>
                      <span className="font-mono text-white">
                        {formatFull(item.currentAhMarketValue)}
                      </span>
                    </div>
                    <div className="flex justify-between text-amber-300 font-bold">
                      <span>Max Safe Bid Ceiling:</span>
                      <span className="font-mono">{formatFull(item.maxProfitableBid)}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-1.5 font-bold">
                      <span className="text-emerald-300">Target Profit Margin:</span>
                      <span className="font-mono text-emerald-400">
                        +{formatFull(item.projectedResaleProfit)} (10%)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {/* TAB 8: TRANSPARENCY SCORECARD */}
      {activeTab === "scorecard" && (
        <div className="space-y-6">
          {accuracy && accuracy.resolved > 0 ? (
            <>
              <StatRow
                stats={[
                  {
                    label: "Win rate",
                    value: `${accuracy.winRate?.toFixed(1)}%`,
                    sub: `${accuracy.wins}W / ${accuracy.losses}L of ${accuracy.resolved} resolved`,
                  },
                  {
                    label: "Avg actual margin",
                    value: `${(accuracy.avgActualMarginPct ?? 0).toFixed(1)}%`,
                    sub: "After real market taxes",
                  },
                  {
                    label: "Avg predicted margin",
                    value: `${(accuracy.avgExpectedMarginPct ?? 0).toFixed(1)}%`,
                    sub: "What the suggestion promised",
                  },
                  {
                    label: "Suggestions logged",
                    value: formatNumber(accuracy.tracked),
                    sub: `${accuracy.resolved} resolved so far`,
                  },
                ]}
              />

              <Panel>
                <h2 className="flex items-center gap-2 text-xl font-semibold">
                  <IconScale className="size-5 text-primary" /> How scoring works
                </h2>
                <ol className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="font-mono font-bold text-primary">1.</span>
                    Every hour, the site logs its top flip suggestions with the exact price and
                    expected margin at that moment.
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono font-bold text-primary">2.</span>
                    After at least 10 minutes, each suggestion is re-priced against the live market
                    with tax applied.
                  </li>
                </ol>
              </Panel>
            </>
          ) : (
            <Panel>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <IconTarget className="size-4 text-primary" />
                The scorecard is being built — suggestions need at least 10 minutes of market
                movement before they can be scored.
              </p>
            </Panel>
          )}
        </div>
      )}
    </div>
  );
}
