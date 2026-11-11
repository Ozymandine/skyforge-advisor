import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ConnectPrompt, ErrorState } from "@/components/data-states";
import { SkeletonPage } from "@/components/motion";
import { PageHero, Panel, ProgressBar } from "@/components/layout/app-shell";
import { ProfileShareCard } from "@/components/profile-share-card";
import { ItemIcon } from "@/components/ui/item-icon";
import { RankBadge } from "@/components/ui/rank-badge";
import { usePlayer } from "@/hooks/use-account";
import { formatFull } from "@/lib/skyblock";
import { calculateSkyBlockLevel } from "@/lib/skyblock-level";

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
      { title: "Dashboard — SkyForge" },
      {
        name: "description",
        content:
          "Command center overview of your SkyBlock profile: completion, highlights and live sync status.",
      },
      { property: "og:title", content: "Dashboard — SkyForge" },
      {
        property: "og:description",
        content: "Account completion, active profile summary and key highlights.",
      },
      { property: "og:url", content: "https://skyforge-advisor.vercel.app/dashboard" },
      {
        property: "og:image",
        content: "https://skyforge-advisor.vercel.app/og-image.png",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: "https://skyforge-advisor.vercel.app/dashboard" }],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data, isLoading, error, connected } = usePlayer();
  const estimatedLevel = useMemo(() => calculateSkyBlockLevel(data), [data]);
  if (!connected) return <ConnectPrompt what="your SkyBlock dashboard" />;
  if (isLoading) return <SkeletonPage />;
  if (error) return <ErrorState error={error} />;
  if (!data) return <p role="status">Profile data is unavailable.</p>;

  const profile = data.profiles.find((entry) => entry.profileId === data.activeProfileId);
  const balance = data.purse + (data.bank ?? 0);
  const topSkills = data.skills
    .filter((skill) => !data.availability || data.availability.skillKeys.includes(skill.key))
    .sort((a, b) => b.level - a.level || b.totalXp - a.totalXp)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHero title="Dashboard" />
      <Panel className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <RankBadge rankData={data.hypixelPlayer} size="lg" />
          <h2 className="text-xl font-semibold">{data.username}</h2>
          {profile && (
            <span className="text-sm text-muted-foreground">
              {profile.cuteName}
              {profile.gameMode ? " · " + profile.gameMode : ""}
            </span>
          )}
          <div className="sm:ml-auto">
            <ProfileShareCard
              data={{
                username: data.username,
                uuid: data.uuid,
                profileName: profile?.cuteName ?? "SkyBlock",
                skillAverage: data.skillAverage,
                netWorth: balance,
                fairySouls: data.fairySouls,
                catacombsLevel: data.dungeons?.catacombsLevel ?? null,
                collectionsCount: data.collections.length,
              }}
            />
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-4">
          {[
            [
              "Skill average",
              data.availability && !data.availability.skillKeys.length
                ? "Unavailable"
                : data.skillAverage.toFixed(2),
            ],
            [data.bank == null ? "Purse (bank unavailable)" : "Purse + bank", formatFull(balance)],
            [
              "Fairy Souls",
              data.availability?.fairySouls === false ? "Unavailable" : formatFull(data.fairySouls),
            ],
            [
              "Catacombs XP",
              data.dungeons && data.availability?.dungeonCompletions !== false
                ? formatFull(data.dungeons.catacombsXp)
                : "Unavailable",
            ],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </Panel>
      <Panel>
        <h2 className="text-lg font-semibold">SkyBlock level estimate</h2>
        <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm">
          <span>Level {estimatedLevel.level}</span>
          <span className="text-muted-foreground">
            {estimatedLevel.xpToNextLevel} estimated XP to level {estimatedLevel.level + 1}
          </span>
        </div>
        <div className="mt-2">
          <ProgressBar pct={estimatedLevel.progressPct} />
        </div>
        <details className="mt-4 border-t border-border pt-3">
          <summary className="cursor-pointer text-sm font-medium">Estimated XP breakdown</summary>
          <ul className="mt-2 divide-y divide-border">
            {estimatedLevel.categories.map((category) => {
              const target = getCategoryLink(category.id);
              return (
                <li key={category.id}>
                  <Link
                    to={target.to}
                    search={target.search ?? {}}
                    className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2.5 text-sm hover:underline"
                  >
                    <span>{category.name}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {formatFull(category.currentXp)} XP
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </details>
      </Panel>
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Top skills</h2>
          <Link to="/skills" className="text-sm text-primary hover:underline">
            View skills
          </Link>
        </div>
        <ul className="mt-3 grid gap-x-8 sm:grid-cols-2">
          {!topSkills.length && (
            <li className="py-2 text-sm text-muted-foreground">Skill progress unavailable.</li>
          )}
          {topSkills.map((skill) => (
            <li key={skill.key} className="border-t border-border py-3">
              <div className="flex items-center gap-2 text-sm">
                <ItemIcon id={skill.key} name={skill.name} className="size-5" />
                <span className="flex-1">{skill.name}</span>
                <span className="tabular-nums">Level {skill.level}</span>
              </div>
              <div className="mt-2">
                <ProgressBar pct={skill.pct} />
              </div>
            </li>
          ))}
        </ul>
        <Link to="/advisor" className="mt-3 inline-block text-sm text-primary hover:underline">
          View next steps
        </Link>
      </Panel>
    </div>
  );
}
