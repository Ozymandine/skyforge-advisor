import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Target,
  TrendingUp,
  Scale,
  Hammer,
  AlertTriangle,
  Check,
  Copy,
  Flame,
  ShieldCheck,
  Zap,
  Boxes,
  ArrowRight,
  Filter,
} from "lucide-react";
import { useMemo, useState } from "react";

import { PageHero, Panel, StatRow, ProgressBar } from "@/components/layout/app-shell";
import { LoadState, ErrorState } from "@/components/data-states";
import { ItemIcon } from "@/components/ui/item-icon";
import { fetchBazaar, fetchAuctions, fetchFlipAccuracy } from "@/lib/hypixel.functions";
import { formatNumber, formatFull, type BazaarProduct, type AuctionEntry } from "@/lib/skyblock";
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
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/flips")({
  head: () => ({
    meta: [
      { title: "Market Flips & Margin Intelligence — SkyForge Advisor" },
      {
        name: "description",
        content:
          "Real-time Bazaar spread flips, Auction House BIN undercuts, craft-flip margins, trap filters, and 1-click in-game commands.",
      },
      { property: "og:title", content: "Market Flips & Margin Intelligence — SkyForge Advisor" },
      {
        property: "og:description",
        content: "Live tax-adjusted flip finder, craft margins, and anti-manipulation spoof detectors.",
      },
    ],
  }),
  component: FlipsRoute,
});

type TabType = "bazaar" | "auctions" | "crafts" | "scorecard";

function FlipsRoute() {
  const [activeTab, setActiveTab] = useState<TabType>("bazaar");
  const [query, setQuery] = useState("");
  const [minProfit, setMinProfit] = useState<number>(50_000);
  const [minMargin, setMinMargin] = useState<number>(3);
  const [hideTraps, setHideTraps] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
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

  // Process Bazaar Flips
  const bazaarFlips = useMemo(() => {
    if (!bazaarData?.products) return [];
    const q = query.toLowerCase();

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
      .filter((p) => p.netProfit >= minProfit && p.marginPct >= minMargin)
      .filter((p) => (!hideTraps ? true : !p.velocity.isTrap))
      .sort((a, b) => b.netProfit - a.netProfit || b.marginPct - a.marginPct);
  }, [bazaarData, query, minProfit, minMargin, hideTraps]);

  // Process Auction Flips
  const auctionFlips = useMemo(() => {
    if (!auctionsData?.entries) return [];
    const q = query.toLowerCase();

    return auctionsData.entries
      .filter((a) => a.bin && a.profit > 0)
      .filter((a) => a.name.toLowerCase().includes(q))
      .map((a) => {
        const sellPrice = a.lowestBin ?? a.price + a.profit;
        const { tax, netProfit, marginPct } = calculateNetProfit(a.price, sellPrice, "ah");
        const manipulation = detectPriceManipulation(sellPrice, a.lowestBin ? a.lowestBin * 0.9 : a.price);
        const velocity = calculateVelocityIndex(50, 4, marginPct);
        const risk = calculateRiskRating(50, marginPct, manipulation.isManipulated, velocity.isTrap);

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
      .filter((a) => a.netProfit >= minProfit && a.marginPct >= minMargin)
      .filter((a) => (!hideTraps ? true : !a.manipulation.isManipulated))
      .sort((a, b) => b.netProfit - a.netProfit);
  }, [auctionsData, query, minProfit, minMargin, hideTraps]);

  // Process Craft Flips
  const craftFlips = useMemo(() => {
    if (!bazaarData?.products) return [];

    const bzMap = new Map<string, { buyPrice: number; sellPrice: number; weeklyVolume?: number }>();
    const names = new Map<string, string>();
    for (const p of bazaarData.products) {
      bzMap.set(p.id, { buyPrice: p.buyPrice, sellPrice: p.sellPrice, weeklyVolume: p.buyMovingWeek });
      names.set(p.id, p.name);
    }

    const ahMap = new Map<string, number>();
    for (const a of auctionsData?.entries ?? []) {
      if (a.bin && a.price > 0 && a.id) {
        const existing = ahMap.get(a.id);
        if (!existing || a.price < existing) {
          ahMap.set(a.id, a.price);
        }
      }
    }

    const allCrafts = generateCraftFlips(bzMap, ahMap, names, 50);
    const q = query.toLowerCase();

    return allCrafts
      .filter((c) => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q))
      .filter((c) => c.netProfit >= minProfit && c.marginPct >= minMargin)
      .filter((c) => (!hideTraps ? true : !c.velocity.isTrap));
  }, [bazaarData, auctionsData, query, minProfit, minMargin, hideTraps]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHero
        eyebrow="Market Intelligence"
        title="Live Flips & Margin Finder"
        description="Tax-adjusted profit calculations, volume velocity indices, live craft-flips, and 1-click in-game clipboard execution."
      />

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "bazaar", label: "Bazaar Spread Flips", count: bazaarFlips.length, icon: TrendingUp },
            { id: "auctions", label: "Auction House Undercuts", count: auctionFlips.length, icon: Hammer },
            { id: "crafts", label: "Craft-Flip Margins", count: craftFlips.length, icon: Boxes },
            { id: "scorecard", label: "Transparency Scorecard", count: null, icon: Scale },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all",
                  active
                    ? "border border-sky-400/40 bg-sky-500/20 text-white shadow-lg shadow-sky-500/10"
                    : "border border-white/5 bg-white/[0.02] text-white/60 hover:bg-white/[0.05] hover:text-white"
                )}
              >
                <Icon className="size-4 text-sky-400" />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-mono font-bold text-white/80">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Global Filters */}
        {activeTab !== "scorecard" && (
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Filter items..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:border-sky-400 focus:outline-none"
            />
            <label className="flex items-center gap-1.5 text-xs text-white/70 cursor-pointer">
              <input
                type="checkbox"
                checked={hideTraps}
                onChange={(e) => setHideTraps(e.target.checked)}
                className="rounded border-white/20 accent-sky-400"
              />
              Hide Illiquid Traps
            </label>
          </div>
        )}
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
                  className="flex flex-col justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur transition-all duration-75 hover:border-sky-500/30 hover:bg-white/[0.04]"
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
                      <span className={cn("rounded-lg border px-2 py-0.5 text-[10px] font-bold shrink-0", flip.risk.badgeClass)}>
                        {flip.risk.label}
                      </span>
                    </div>

                    {/* Price Breakdown */}
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

                    {/* Velocity Index */}
                    <div className="mt-3 flex items-center justify-between text-[11px]">
                      <span className="text-white/50">Sell Velocity:</span>
                      <span className="font-mono font-semibold text-sky-300">
                        {flip.velocity.label} (~{flip.velocity.estimatedMinutesToSell}m)
                      </span>
                    </div>
                  </div>

                  {/* 1-Click Clipboard Execution */}
                  <button
                    onClick={() => copyToClipboard(cmd, flip.id)}
                    className={cn(
                      "mt-4 flex w-full items-center justify-center gap-2 rounded-xl border py-2 text-xs font-bold transition-all",
                      isCopied
                        ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                        : "border-sky-400/30 bg-sky-500/15 text-sky-300 hover:bg-sky-500/25"
                    )}
                  >
                    {isCopied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
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
                  className="flex flex-col justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur transition-all duration-75 hover:border-purple-500/30 hover:bg-white/[0.04]"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <ItemIcon id={flip.id ?? flip.name} name={flip.name} className="size-8 shrink-0" />
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-white">{flip.name}</h3>
                          <span className="font-mono text-[10px] text-white/40">{flip.rarity}</span>
                        </div>
                      </div>
                      <span className={cn("rounded-lg border px-2 py-0.5 text-[10px] font-bold shrink-0", flip.risk.badgeClass)}>
                        {flip.risk.label}
                      </span>
                    </div>

                    {/* Price Breakdown */}
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

                    {/* Spoof Warning */}
                    {flip.manipulation.isManipulated && (
                      <div className="mt-3 flex items-start gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-[10px] text-red-300">
                        <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
                        <span>{flip.manipulation.reason}</span>
                      </div>
                    )}
                  </div>

                  {/* 1-Click Clipboard Execution */}
                  <button
                    onClick={() => copyToClipboard(cmd, flip.uuid)}
                    className={cn(
                      "mt-4 flex w-full items-center justify-center gap-2 rounded-xl border py-2 text-xs font-bold transition-all",
                      isCopied
                        ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                        : "border-purple-400/30 bg-purple-500/15 text-purple-300 hover:bg-purple-500/25"
                    )}
                  >
                    {isCopied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    <span>{isCopied ? "Command Copied!" : `Copy ${cmd}`}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CRAFT-FLIP MARGIN FINDER */}
      {activeTab === "crafts" && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {craftFlips.map((flip) => {
              const cmd = getCraftCommand(flip.id);
              const isCopied = copiedId === flip.id;

              return (
                <div
                  key={flip.id}
                  className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 backdrop-blur transition-all duration-75 hover:border-amber-500/30"
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

                  {/* Crafting Recipe Ingredients Checklist */}
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-white/70 mb-2">Required Ingredients (Bazaar Buy Orders):</p>
                    <div className="space-y-1.5">
                      {flip.ingredients.map((ing) => (
                        <div
                          key={ing.id}
                          className="flex items-center justify-between rounded-lg bg-black/30 px-3 py-1.5 text-xs"
                        >
                          <span className="text-white/80">
                            {ing.amount}x {ing.name}
                          </span>
                          <span className="font-mono text-white/50">{formatFull(ing.totalCost)} coins</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial Rollup */}
                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs">
                    <div>
                      <span className="text-white/50">Total Craft Cost:</span>{" "}
                      <span className="font-mono font-bold text-white">{formatFull(flip.craftCost)}</span>
                    </div>
                    <div>
                      <span className="text-white/50">Market Value:</span>{" "}
                      <span className="font-mono font-bold text-white">{formatFull(flip.sellPrice)}</span>
                    </div>
                  </div>

                  {/* Quick Copy Command */}
                  <button
                    onClick={() => copyToClipboard(cmd, flip.id)}
                    className={cn(
                      "mt-4 flex w-full items-center justify-center gap-2 rounded-xl border py-2 text-xs font-bold transition-all",
                      isCopied
                        ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                        : "border-amber-400/30 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25"
                    )}
                  >
                    {isCopied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    <span>{isCopied ? "Command Copied!" : `Copy ${cmd}`}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: TRANSPARENCY SCORECARD */}
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
                  <Scale className="size-5 text-primary" /> How scoring works
                </h2>
                <ol className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="font-mono font-bold text-primary">1.</span>
                    Every hour, the site logs its top flip suggestions with the exact price and expected margin at that moment.
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono font-bold text-primary">2.</span>
                    After at least 10 minutes, each suggestion is re-priced against the live market with tax applied.
                  </li>
                </ol>
              </Panel>
            </>
          ) : (
            <Panel>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="size-4 text-primary" />
                The scorecard is being built — suggestions need at least 10 minutes of market movement before they can be scored.
              </p>
            </Panel>
          )}
        </div>
      )}
    </div>
  );
}
