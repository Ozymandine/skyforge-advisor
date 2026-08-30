import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  IconCircleCheck,
  IconLock,
  IconBot,
  IconSwords,
  IconSkull,
  IconWheat,
  IconArrowRight,
} from "@/assets/icons";

import { ConnectPrompt, ErrorState } from "@/components/data-states";
import { CountUp, ProgressRing, SkeletonPage, Stagger } from "@/components/motion";
import { PageHero, Panel, ProgressBar } from "@/components/layout/app-shell";
import { ProfileShareCard } from "@/components/profile-share-card";
import { fetchGuild, fetchStatus } from "@/lib/hypixel.functions";
import { usePlayer } from "@/hooks/use-account";
import {
  MAX_COLLECTION_CATEGORIES,
  MAX_FAIRY_SOULS,
  MAX_SKILL_AVERAGE,
  TYPICAL_CONTAINER_COUNT,
} from "@/lib/constants";
import { formatFull } from "@/lib/skyblock";
import { calculateSkyBlockLevel } from "@/lib/skyblock-level";
import { RankBadge } from "@/components/ui/rank-badge";
import { playClickSound } from "@/lib/sound-effects";

function getCategoryLink(id: string): { to: string; search?: Record<string, string> } {
  switch (id) {
    case "skills":
      return { to: "/skills", search: { tab: "overview" } };
    case "dungeons":
      return { to: "/skills", search: { tab: "dungeons" } };
    case "slayers":
      return { to: "/skills", search: { tab: "experiments" } };
    case "collections":
    case "minions":
      return { to: "/collections" };
    case "bestiary":
      return { to: "/skills", search: { tab: "bestiary" } };
    case "fairy_souls":
      return { to: "/skills", search: { tab: "overview" } };
    case "museum":
    case "accessories":
      return { to: "/inventory" };
    case "hotm":
      return { to: "/skills", search: { tab: "mining" } };
    case "garden":
      return { to: "/skills", search: { tab: "farming" } };
    case "crimson":
      return { to: "/skills", search: { tab: "kuudra" } };
    case "rift":
      return { to: "/skills", search: { tab: "rift" } };
    case "pets":
      return { to: "/skills", search: { tab: "combat" } };
    default:
      return { to: "/skills" };
  }
}

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — SkyBlock Assistant" },
      {
        name: "description",
        content:
          "Command center overview of your SkyBlock profile: completion, highlights and live sync status.",
      },
      { property: "og:title", content: "Dashboard — SkyBlock Assistant" },
      {
        property: "og:description",
        content: "Account completion, active profile summary and key highlights.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data, isLoading, error, connected } = usePlayer();

  // Guild + live online status (second-tier endpoints, cached server-side).
  const guildQuery = useQuery({
    queryKey: ["guild", data?.uuid],
    queryFn: () => fetchGuild({ data: { uuid: data!.uuid } }),
    enabled: !!data?.uuid,
    staleTime: 10 * 60_000,
  });
  const statusQuery = useQuery({
    queryKey: ["status", data?.uuid],
    queryFn: () => fetchStatus({ data: { uuid: data!.uuid } }),
    enabled: !!data?.uuid,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
  const guild = guildQuery.data;
  const status = statusQuery.data;

  const profile = data?.profiles.find((p) => p.profileId === data.activeProfileId);

  const netWorth = data ? data.purse + (data.bank ?? 0) : 0;

  const sbLevel = useMemo(() => calculateSkyBlockLevel(data), [data]);

  const collectionCategories = useMemo(
    () => Array.from(new Set(data?.collections.map((c) => c.category) ?? [])),
    [data],
  );

  const topSkills = useMemo(
    () =>
      data
        ? [...data.skills].sort((a, b) => b.level - a.level || b.totalXp - a.totalXp).slice(0, 4)
        : [],
    [data],
  );

  const dashboardCoverage = useMemo(() => {
    if (!data) return [];

    const skillAvgPct = Math.min(100, Math.round((data.skillAverage / MAX_SKILL_AVERAGE) * 100));
    const maxedSkillsCount = data.skills.filter((s) => s.maxed).length;

    return [
      {
        label: "Skill Average",
        value: data.skillAverage.toFixed(2),
        meta: `${skillAvgPct}% of max`,
        pct: skillAvgPct,
        note: `${maxedSkillsCount} / ${data.skills.length} maxed skills`,
        verified: true,
        link: { to: "/skills", search: { tab: "overview" } },
      },
      {
        label: "Collections",
        value: String(collectionCategories.length),
        meta: `${data.collections.length} items`,
        pct: Math.min(
          100,
          Math.round((collectionCategories.length / MAX_COLLECTION_CATEGORIES) * 100),
        ),
        note: "Collection categories detected for this profile",
        verified: true,
        link: { to: "/collections" },
      },
      {
        label: "Fairy Souls",
        value: formatFull(data.fairySouls),
        meta: "Collected total",
        pct: Math.min(100, Math.round((data.fairySouls / MAX_FAIRY_SOULS) * 100)),
        note: "Live fairy soul count",
        verified: true,
        link: { to: "/skills", search: { tab: "overview" } },
      },
      {
        label: "Inventory",
        value: String(data.containers.length),
        meta: "Containers available",
        pct: Math.min(100, Math.round((data.containers.length / TYPICAL_CONTAINER_COUNT) * 100)),
        note: "Storage containers decoded from profile data",
        verified: true,
        link: { to: "/inventory" },
      },
      {
        label: "Profiles",
        value: String(data.profiles.length),
        meta: profile?.cuteName ?? "Active profile",
        pct: 100,
        note: "Loaded profiles from your Hypixel account",
        verified: true,
        link: { to: "/connect" },
      },
      {
        label: "Net worth",
        value: formatFull(netWorth),
        meta: data.bank === null ? "Bank hidden" : "Purse + bank",
        pct: 100,
        note: "Estimated live economy value",
        verified: true,
        link: { to: "/inventory" },
      },
    ];
  }, [data, collectionCategories.length, netWorth, profile?.cuteName]);

  if (!connected) return <ConnectPrompt what="your SkyBlock dashboard" />;
  if (isLoading) return <SkeletonPage />;
  if (error) return <ErrorState error={error} />;
  if (!data) return null;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageHero
        eyebrow="Command Center"
        title="Dashboard"
        description="High-level completion, active profile summary and instant links to all calculators."
      />

      <Stagger className="space-y-8">
        <Panel className="animate-pulse-glow relative overflow-hidden">
          <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="flex flex-col items-center gap-8 py-6 text-center lg:flex-row lg:justify-between lg:text-left">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:text-left">
              {/* Minecraft head render from the player's UUID */}
              <img
                src={`https://mc-heads.net/avatar/${data.uuid}/96`}
                alt={`${data.username}'s Minecraft avatar`}
                width={96}
                height={96}
                loading="eager"
                className="size-24 shrink-0 rounded-2xl border border-white/15 bg-black/40 shadow-xl [image-rendering:pixelated] animate-float-slow"
              />
              <div>
                <p className="eyebrow uppercase tracking-wider text-xs text-muted-foreground">
                  SkyBlock Profile
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <RankBadge rankData={data.hypixelPlayer} size="lg" />
                  <h1 className="mt-1 text-5xl font-bold tracking-tight">{data.username}</h1>
                  <span className="mt-1 flex items-center gap-1 rounded-xl border border-sky-400/40 bg-sky-500/15 px-3 py-1 font-mono text-sm font-black text-sky-300 shadow-md">
                    LVL {sbLevel.level}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground sm:justify-start">
                  <span>{profile?.cuteName ?? "Active profile"}</span>
                  <span className="glass-soft rounded-full px-2.5 py-0.5 text-xs font-medium">
                    {profile?.gameMode ?? "Classic"}
                  </span>
                  <span>{profile?.members ?? 1} member(s)</span>
                  {guild && (
                    <span className="glass-soft rounded-full px-2.5 py-0.5 text-xs font-medium text-cyan-300">
                      {guild.name}
                      {guild.tag ? ` [${guild.tag}]` : ""}
                    </span>
                  )}
                  {status?.online && (
                    <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                      <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
                      Online{status.game ? ` · ${status.game}` : ""}
                    </span>
                  )}
                </div>
              </div>
              <ProfileShareCard
                data={{
                  username: data.username,
                  uuid: data.uuid,
                  profileName: profile?.cuteName ?? "SkyBlock",
                  skillAverage: data.skillAverage,
                  netWorth,
                  fairySouls: data.fairySouls,
                  catacombsLevel: data.dungeons?.catacombsLevel ?? null,
                  collectionsCount: data.collections.length,
                }}
              />
            </div>

            {/* Overall account completion ring */}
            <ProgressRing
              pct={
                dashboardCoverage.length
                  ? dashboardCoverage.reduce((sum, c) => sum + c.pct, 0) / dashboardCoverage.length
                  : 0
              }
              size={132}
              label={
                <CountUp
                  value={Math.round(data.skillAverage * 10) / 10}
                  format={(n) => n.toFixed(1)}
                />
              }
              sublabel="skill average"
            />
          </div>
        </Panel>

        {/* Flagship Hubs Quick-Launcher */}
        <Panel className="relative overflow-hidden border-sky-500/20 bg-gradient-to-br from-sky-500/[0.04] via-transparent to-emerald-500/[0.02]">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center rounded-xl border border-sky-400/40 bg-sky-500/15 px-3 py-1 font-mono text-xl font-black text-sky-300 shadow-lg shadow-sky-500/10">
                  LVL {sbLevel.level}
                </span>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">
                    SkyBlock Level Engine
                  </h2>
                  <p className="text-xs text-white/50">
                    Total XP: {sbLevel.totalXp.toLocaleString()} XP · {sbLevel.xpToNextLevel} XP to
                    Level {sbLevel.level + 1}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="font-mono text-xs font-bold text-sky-400">
                  {sbLevel.progressPct}%
                </span>
                <p className="text-[10px] text-white/40">to Level {sbLevel.level + 1}</p>
              </div>
              <div className="w-32">
                <ProgressBar pct={sbLevel.progressPct} />
              </div>
            </div>
          </div>

          {/* 15-Source Grid */}
          <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {sbLevel.categories.map((cat) => {
              const target = getCategoryLink(cat.id);
              return (
                <Link
                  key={cat.id}
                  to={target.to}
                  search={target.search as unknown as Record<string, string>}
                  onClick={() => playClickSound()}
                  className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-all duration-150 ease-out hover:transition-none hover:-translate-y-1 hover:border-sky-400/70 hover:bg-white/[0.09] hover:shadow-xl hover:shadow-sky-500/15 active:translate-y-0 cursor-pointer will-change-transform block"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/90 group-hover:text-white transition-colors duration-75">
                      {cat.name}
                    </span>
                    <span className="font-mono text-xs font-black text-sky-400 group-hover:text-sky-300">
                      +{cat.levelContribution} LVL
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between text-xs">
                    <span className="font-mono font-bold text-white">
                      {cat.currentXp.toLocaleString()} XP
                    </span>
                    <span className="text-[10px] text-white/40">
                      / {cat.maxEstimatedXp.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-2.5">
                    <ProgressBar
                      pct={Math.min(100, Math.round((cat.currentXp / cat.maxEstimatedXp) * 100))}
                    />
                  </div>
                  <p className="mt-2 truncate text-[10px] text-white/50 group-hover:text-white/70 transition-colors duration-75">
                    {cat.details}
                  </p>
                </Link>
              );
            })}
          </div>
        </Panel>

        <Panel>
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <p className="eyebrow">Account intelligence</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">Profile analysis</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                A verified completion view of the connected SkyBlock profile. Categories without an
                authoritative value remain clearly marked instead of being estimated.
              </p>
            </div>
            <div className="glass-soft relative rounded-2xl px-6 py-5">
              <span className="absolute -top-1.5 right-4 flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" /> Live
              </span>
              <p className="eyebrow">Live net worth</p>
              <p className="mt-2 text-4xl font-semibold">
                <CountUp value={netWorth} format={(n) => formatFull(n)} duration={1200} />
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
              <Stagger className="contents">
                {dashboardCoverage.map((c) => (
                  <Link
                    key={c.label}
                    to={c.link.to}
                    search={c.link.search as unknown as Record<string, string>}
                    onClick={() => playClickSound()}
                    className="glass-soft rounded-2xl p-5 transition-all duration-150 hover:-translate-y-1 hover:border-emerald-500/40 hover:bg-white/[0.08] hover:shadow-lg hover:shadow-emerald-500/10 active:translate-y-0 cursor-pointer block"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white/90">{c.label}</p>
                      {c.verified ? (
                        <IconCircleCheck className="size-4 text-primary" />
                      ) : (
                        <IconLock className="size-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <p className="text-3xl font-semibold">{c.value}</p>
                      <p className="text-xs text-muted-foreground">{c.meta}</p>
                    </div>
                    <div className="mt-4">
                      <ProgressBar pct={c.pct} />
                    </div>
                    <p className="mt-3 truncate text-xs text-muted-foreground">{c.note}</p>
                  </Link>
                ))}
              </Stagger>
            </div>

            <div className="space-y-4">
              <div className="glass-soft rounded-2xl p-5">
                <p className="eyebrow">Reference</p>
                <h3 className="mt-2 text-xl font-semibold">Account coverage</h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  Live profile data is loaded from Hypixel. The dashboard updates automatically when
                  your connected profile changes.
                </p>
                <dl className="mt-5 space-y-3 text-sm">
                  {[
                    ["Skill average", data.skillAverage.toFixed(2)],
                    ["Total skill XP", formatFull(data.totalSkillXp)],
                    ["Fairy Souls", formatFull(data.fairySouls)],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-border pb-3">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="glass-soft rounded-2xl p-5">
                <p className="eyebrow">Recent activity</p>
                <ul className="mt-4 space-y-3 text-sm">
                  <li className="flex gap-3">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    <div>
                      <p>Profile refreshed from Hypixel</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(data.lastSave).toLocaleString()}
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    <div>
                      <p>{collectionCategories.length} collection categories loaded</p>
                      <p className="text-xs text-muted-foreground">Live collection summary</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    <div>
                      <p>{data.profiles.length} profile(s) available</p>
                      <p className="text-xs text-muted-foreground">Connected account state</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Highlights</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Top skills</h2>
            </div>
            <Link to="/skills" className="text-sm text-primary hover:underline">
              View all skills
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {topSkills.map((s) => (
              <div key={s.key} className="glass-soft rounded-2xl p-5">
                <p className="text-sm font-medium">
                  {s.name} {s.level}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {s.maxed
                    ? `${formatFull(s.totalXp)} XP`
                    : `${formatFull(s.currentXp)} / ${formatFull(s.neededXp)} XP`}
                </p>
                <div className="mt-4">
                  <ProgressBar pct={s.pct} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </Stagger>
    </div>
  );
}
