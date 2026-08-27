// src/routes/profile.$username.tsx
// Public shareable vanity profile page for any Hypixel SkyBlock player:
// Direct link sharing, live gear tooltips, skill averages, net worth, pets, and slayers.

import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Share2,
  Shield,
  Sparkles,
  Trophy,
  Sword,
  Check,
  ChevronRight,
  User,
  Clock,
  Layers,
} from "lucide-react";
import { fetchPlayer } from "@/lib/hypixel.functions";
import { Panel, ProgressBar } from "@/components/layout/app-shell";
import { ItemIcon } from "@/components/ui/item-icon";
import { MinecraftTooltip } from "@/components/ui/minecraft-tooltip";
import { playClickSound, playSuccessChime } from "@/lib/sound-effects";
import { formatNumber, type PlayerData, type InventoryItem, type PetInfo } from "@/lib/skyblock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile/$username")({
  loader: async ({ params }: { params: { username: string } }) => {
    const username = params.username.trim();
    try {
      const data = await fetchPlayer({ data: { username } });
      return { data: data as PlayerData | null, username, error: data ? null : "Player or SkyBlock profile not found." };
    } catch (err) {
      return {
        data: null,
        username,
        error: err instanceof Error ? err.message : "Failed to load player profile.",
      };
    }
  },
  head: ({ loaderData }: { loaderData?: { data: PlayerData | null; username: string } }) => {
    const user = loaderData?.username ?? "Player";
    const nw = formatNumber((loaderData?.data?.purse ?? 0) + (loaderData?.data?.bank ?? 0) + (loaderData?.data?.sacks?.totalValue ?? 0));
    const sa = (loaderData?.data?.skillAverage ?? 0).toFixed(1);

    return {
      meta: [
        { title: `${user}'s SkyBlock Profile — SkyForge Advisor` },
        {
          name: "description",
          content: `${user} • Net Worth: ${nw} • Skill Avg: ${sa}. View live gear, skills, slayer stats, and pets on SkyForge Advisor.`,
        },
        { property: "og:title", content: `${user}'s SkyBlock Profile — SkyForge Advisor` },
        {
          property: "og:description",
          content: `Net Worth: ${nw} coins • Skill Avg: ${sa} • Catacombs Lv ${loaderData?.data?.dungeons?.catacombsLevel ?? 0}`,
        },
        {
          property: "og:image",
          content: loaderData?.data?.uuid
            ? `https://visage.surgeplay.com/bust/512/${loaderData.data.uuid}`
            : "https://skyforge-advisor.vercel.app/og.png",
        },
      ],
    };
  },
  component: PublicProfileRoute,
});

type ProfileTab = "gear" | "skills" | "dungeons_slayers" | "pets_sacks";

function PublicProfileRoute() {
  const { data, username, error } = Route.useLoaderData() as {
    data: PlayerData | null;
    username: string;
    error: string | null;
  };
  const [activeTab, setActiveTab] = useState<ProfileTab>("gear");
  const [copied, setCopied] = useState(false);

  const copyShareLink = async () => {
    playSuccessChime();
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback if clipboard permission denied
    }
  };

  if (error || !data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center space-y-6">
        <div className="mx-auto flex size-20 items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/10 text-red-400">
          <User className="size-10" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white">Player Not Found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Could not retrieve SkyBlock profile telemetry for <span className="font-bold text-white font-mono">{username}</span>.
          </p>
          <p className="mt-1 text-xs text-red-400/80">{error}</p>
        </div>
        <div className="flex justify-center gap-3">
          <Link
            to="/connect"
            className="rounded-xl border border-primary/40 bg-primary/20 px-5 py-2.5 text-sm font-bold text-primary hover:bg-primary/30 transition-all"
          >
            Connect Your Account
          </Link>
          <Link
            to="/dashboard"
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10 transition-all"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Active Profile Name
  const activeProfile = data.profiles.find((p) => p.profileId === data.activeProfileId)?.cuteName ?? "SkyBlock";

  // Rank Styling
  const rank = data.hypixelPlayer?.rank || data.hypixelPlayer?.newPackageRank || data.hypixelPlayer?.packageRank || "NONE";
  const rankText =
    rank === "MVP_PLUS_PLUS"
      ? "[MVP++]"
      : rank === "MVP_PLUS"
      ? "[MVP+]"
      : rank === "MVP"
      ? "[MVP]"
      : rank === "VIP_PLUS"
      ? "[VIP+]"
      : rank === "VIP"
      ? "[VIP]"
      : "";

  // Containers
  const armorItems = data.containers.find((c) => c.id === "armor")?.items ?? [];
  const equipmentItems = data.containers.find((c) => c.id === "equipment")?.items ?? [];
  const inventoryItems = data.containers.find((c) => c.id === "inventory")?.items ?? [];

  const totalPurseBank = (data.purse ?? 0) + (data.bank ?? 0);
  const totalNetWorthEstimate = totalPurseBank + (data.sacks?.totalValue ?? 0);

  return (
    <div className="space-y-6">
      {/* Profile Header Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-black/90 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            {/* 3D Player Bust Avatar */}
            <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl border-2 border-primary/30 bg-black/50 shadow-inner">
              <img
                src={`https://visage.surgeplay.com/bust/256/${data.uuid}`}
                alt={data.username}
                className="size-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                {rankText && (
                  <span className="rounded-lg bg-cyan-500/20 px-2 py-0.5 font-mono text-xs font-black text-cyan-300">
                    {rankText}
                  </span>
                )}
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">{data.username}</h1>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  Active Profile: <strong className="text-white">{activeProfile}</strong>
                </span>
                {data.lastSave && (
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" />
                    Last Saved: {new Date(data.lastSave).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={copyShareLink}
              className="flex items-center gap-2 rounded-full border border-primary/40 bg-primary/20 px-4 py-2.5 text-xs font-bold text-primary hover:bg-primary/30 transition-all shadow-lg shadow-primary/10"
            >
              {copied ? (
                <>
                  <Check className="size-4 text-emerald-400" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="size-4" />
                  <span>Share Profile</span>
                </>
              )}
            </button>
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10 transition-all"
            >
              <span>Advisor Dashboard</span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          </div>
        </div>

        {/* Profile Stats Quick Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 border-t border-white/10 pt-6">
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-center">
            <span className="text-[11px] font-semibold text-muted-foreground">Coins & Bank</span>
            <p className="mt-1 font-mono text-lg font-black text-amber-300">
              {formatNumber(totalPurseBank)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-center">
            <span className="text-[11px] font-semibold text-muted-foreground">Skill Average</span>
            <p className="mt-1 font-mono text-lg font-black text-cyan-300">
              {(data.skillAverage ?? 0).toFixed(1)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-center">
            <span className="text-[11px] font-semibold text-muted-foreground">Catacombs</span>
            <p className="mt-1 font-mono text-lg font-black text-purple-300">
              Lv {data.dungeons?.catacombsLevel ?? 0}
            </p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-center">
            <span className="text-[11px] font-semibold text-muted-foreground">Slayer XP</span>
            <p className="mt-1 font-mono text-lg font-black text-red-300">
              {formatNumber(data.slayerOverview?.totalXp ?? 0)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-center">
            <span className="text-[11px] font-semibold text-muted-foreground">Fairy Souls</span>
            <p className="mt-1 font-mono text-lg font-black text-pink-300">
              {data.fairySouls ?? 0}
            </p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-center">
            <span className="text-[11px] font-semibold text-muted-foreground">HOTM Tier</span>
            <p className="mt-1 font-mono text-lg font-black text-emerald-300">
              Tier {data.hotm?.tier ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
        {(
          [
            { id: "gear", label: "🛡️ Gear & Inventory" },
            { id: "skills", label: "📊 Skills & Bestiary" },
            { id: "dungeons_slayers", label: "⚔️ Dungeons & Slayers" },
            { id: "pets_sacks", label: "🐾 Pets & Sacks" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              playClickSound();
              setActiveTab(tab.id);
            }}
            className={cn(
              "rounded-xl px-4 py-2 text-xs font-bold transition-all",
              activeTab === tab.id
                ? "border border-primary/40 bg-primary/20 text-primary shadow-lg shadow-primary/10"
                : "border border-white/5 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: GEAR & INVENTORY */}
      {activeTab === "gear" && (
        <div className="space-y-6">
          {/* Equipped Armor & Equipment */}
          <div className="grid gap-6 md:grid-cols-2">
            <Panel className="bg-slate-950/80 border-cyan-500/20">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="size-4 text-cyan-400" /> Equipped Armor Set ({armorItems.length}/4)
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {armorItems.map((item: InventoryItem, idx: number) => (
                  <MinecraftTooltip
                    key={idx}
                    name={item.name}
                    rarity={item.rarity}
                    lore={item.lore}
                  >
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/40 p-4 transition-all hover:border-cyan-400/60 hover:bg-white/[0.04]">
                      <ItemIcon id={item.id} name={item.name} className="size-10 object-contain" />
                      <span className="mt-2 text-center text-xs font-bold text-white line-clamp-1">
                        {item.name}
                      </span>
                    </div>
                  </MinecraftTooltip>
                ))}
              </div>
            </Panel>

            <Panel className="bg-slate-950/80 border-purple-500/20">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="size-4 text-purple-400" /> Equipped Equipment ({equipmentItems.length}/4)
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {equipmentItems.map((item: InventoryItem, idx: number) => (
                  <MinecraftTooltip
                    key={idx}
                    name={item.name}
                    rarity={item.rarity}
                    lore={item.lore}
                  >
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/40 p-4 transition-all hover:border-purple-400/60 hover:bg-white/[0.04]">
                      <ItemIcon id={item.id} name={item.name} className="size-10 object-contain" />
                      <span className="mt-2 text-center text-xs font-bold text-white line-clamp-1">
                        {item.name}
                      </span>
                    </div>
                  </MinecraftTooltip>
                ))}
              </div>
            </Panel>
          </div>

          {/* Active Inventory Grid */}
          <Panel className="bg-slate-950/80 border-white/10">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Layers className="size-4 text-primary" /> Active Inventory ({inventoryItems.length} items)
            </h3>
            <div className="grid grid-cols-9 gap-2 rounded-2xl border border-white/10 bg-black/60 p-3">
              {Array.from({ length: 36 }).map((_, slot) => {
                const item = inventoryItems.find((i: InventoryItem) => i.slot === slot);
                return (
                  <MinecraftTooltip
                    key={slot}
                    name={item?.name ?? "Empty Slot"}
                    rarity={item?.rarity ?? "COMMON"}
                    lore={item?.lore}
                    disabled={!item}
                  >
                    <div
                      className={cn(
                        "flex aspect-square w-full items-center justify-center rounded-xl border p-1",
                        item
                          ? "border-white/10 bg-white/[0.03] hover:border-primary/60 hover:bg-white/[0.08]"
                          : "border-white/5 bg-black/30 opacity-30"
                      )}
                    >
                      {item && (
                        <div className="relative">
                          <ItemIcon id={item.id} name={item.name} className="size-8 object-contain" />
                          {item.count > 1 && (
                            <span className="absolute -bottom-1 -right-1 font-mono text-[10px] font-black text-white">
                              {item.count}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </MinecraftTooltip>
                );
              })}
            </div>
          </Panel>
        </div>
      )}

      {/* TAB 2: SKILLS & BESTIARY */}
      {activeTab === "skills" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.skills.map((skill) => (
              <Panel key={skill.key} className="bg-slate-950/80 border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{skill.name}</span>
                  <span className="font-mono text-sm font-black text-primary">Lv {skill.level}</span>
                </div>
                <div className="mt-3">
                  <ProgressBar
                    pct={skill.pct}
                    tone={skill.maxed ? "emerald" : "gold"}
                  />
                </div>
                <div className="mt-2 flex justify-between font-mono text-[11px] text-muted-foreground">
                  <span>{formatNumber(skill.totalXp)} XP</span>
                  <span>Max Lv {skill.cap}</span>
                </div>
              </Panel>
            ))}
          </div>

          {/* Bestiary Stats Banner */}
          {data.bestiary && (
            <Panel className="bg-slate-950/80 border-amber-500/20">
              <h3 className="text-base font-bold text-white mb-3">Bestiary Progress</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                  <span className="text-xs text-muted-foreground">Total Mob Kills</span>
                  <p className="font-mono text-base font-bold text-amber-300 mt-1">
                    {data.bestiary.totalKills.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                  <span className="text-xs text-muted-foreground">Milestone</span>
                  <p className="font-mono text-base font-bold text-purple-300 mt-1">
                    Milestone {data.bestiary.milestone}
                  </p>
                </div>
                <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                  <span className="text-xs text-muted-foreground">Tiers Unlocked</span>
                  <p className="font-mono text-base font-bold text-cyan-300 mt-1">
                    {data.bestiary.totalTiersUnlocked} / {data.bestiary.maxTiers}
                  </p>
                </div>
                <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                  <span className="text-xs text-muted-foreground">Permanent HP</span>
                  <p className="font-mono text-base font-bold text-emerald-300 mt-1">
                    +{data.bestiary.milestone * 1} HP
                  </p>
                </div>
              </div>
            </Panel>
          )}
        </div>
      )}

      {/* TAB 3: DUNGEONS & SLAYERS */}
      {activeTab === "dungeons_slayers" && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Dungeons Panel */}
            <Panel className="bg-slate-950/80 border-purple-500/20">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="size-4 text-purple-400" /> Catacombs Telemetry
              </h3>
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-muted-foreground">Catacombs Level:</span>
                  <span className="font-bold text-purple-300">Lv {data.dungeons?.catacombsLevel ?? 0}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-muted-foreground">Secrets Found:</span>
                  <span className="font-bold text-white">{data.dungeons?.secretsFound?.toLocaleString() ?? 0}</span>
                </div>
                {data.dungeons?.classes?.map((c) => (
                  <div key={c.name} className="flex justify-between">
                    <span className="text-muted-foreground">{c.name}:</span>
                    <span className="font-bold text-cyan-300">Lv {c.level}</span>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Slayers Panel */}
            <Panel className="bg-slate-950/80 border-red-500/20">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Sword className="size-4 text-red-400" /> Slayer Bosses
              </h3>
              <div className="space-y-3 font-mono text-xs">
                {data.slayerOverview?.bosses.map((boss) => (
                  <div key={boss.id} className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div>
                      <span className="font-bold text-white">{boss.name}</span>
                      <span className="text-muted-foreground text-[10px] block">
                        {boss.totalKills.toLocaleString()} kills
                      </span>
                    </div>
                    <span className="rounded bg-red-500/20 px-2 py-0.5 font-bold text-red-300">
                      Lv {boss.level}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      )}

      {/* TAB 4: PETS & SACKS */}
      {activeTab === "pets_sacks" && (
        <div className="space-y-6">
          {/* Pets Roster */}
          <Panel className="bg-slate-950/80 border-white/10">
            <h3 className="text-base font-bold text-white mb-4">
              Pets Roster ({data.pets?.length ?? 0} pets)
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(data.pets ?? []).map((pet: PetInfo, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3"
                >
                  <ItemIcon id={pet.name.toUpperCase()} name={pet.name} className="size-10 object-contain" />
                  <div>
                    <span className="text-xs font-bold text-white block">{pet.name}</span>
                    <span className="font-mono text-[10px] font-bold text-amber-300">
                      Lv {pet.level} • {pet.rarity}
                    </span>
                    {pet.heldItem && (
                      <span className="font-mono text-[9px] text-muted-foreground block truncate">
                        Held: {pet.heldItem}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Sacks Valuation */}
          {data.sacks && (
            <Panel className="bg-slate-950/80 border-amber-500/20">
              <h3 className="text-base font-bold text-white mb-4">
                Sacks Valuation ({formatNumber(data.sacks.totalValue)} coins)
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 font-mono text-xs">
                {data.sacks.items.slice(0, 18).map((sackItem) => (
                  <div key={sackItem.id} className="rounded-xl border border-white/5 bg-black/30 p-3">
                    <span className="text-[10px] text-muted-foreground truncate block">{sackItem.name}</span>
                    <p className="font-bold text-amber-300 mt-1">{sackItem.count.toLocaleString()}x</p>
                    <span className="text-[9px] text-emerald-400 font-bold block">{formatNumber(sackItem.value)}</span>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>
      )}
    </div>
  );
}
