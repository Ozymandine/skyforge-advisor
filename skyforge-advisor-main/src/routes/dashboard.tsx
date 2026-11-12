import { createFileRoute, Link } from "@tanstack/react-router";
import { ConnectPrompt, ErrorState } from "@/components/data-states";
import { SkeletonPage } from "@/components/motion";
import { PageHero, Panel, PlayerHeadAvatar, ProgressBar } from "@/components/layout/app-shell";
import { ItemIcon } from "@/components/ui/item-icon";
import { RankBadge } from "@/components/ui/rank-badge";
import { usePlayer } from "@/hooks/use-account";
import { formatFull } from "@/lib/skyblock";
import { getReportedSkyBlockLevel } from "@/lib/skyblock-level";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — SkyForge" },
      {
        name: "description",
        content: "Your SkyBlock profile, progress, and latest reported stats.",
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
  if (!connected) return <ConnectPrompt what="your SkyBlock dashboard" />;
  if (isLoading) return <SkeletonPage />;
  if (error) return <ErrorState error={error} />;
  if (!data) return <p role="status">Profile data is unavailable.</p>;

  const profile = data.profiles.find((entry) => entry.profileId === data.activeProfileId);
  const purse = data.availability?.purse ? data.purse : null;
  const balance = purse !== null && data.bank !== null ? purse + data.bank : null;
  const skyBlockLevel = getReportedSkyBlockLevel(data.skyBlockXp);
  const mainSkills = data.skills.filter((skill) => !["RUNECRAFTING", "SOCIAL"].includes(skill.key));
  const fairySouls = data.availability?.fairySouls ? data.fairySouls : null;
  const topSkills = data.skills
    .filter((skill) => !data.availability || data.availability.skillKeys.includes(skill.key))
    .sort((a, b) => b.level - a.level || b.totalXp - a.totalXp)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHero title="Dashboard" />
      <Panel className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <PlayerHeadAvatar uuid={data.uuid} name={data.username} size={48} className="size-10" />
          <RankBadge rankData={data.hypixelPlayer} size="lg" />
          <h2 className="text-xl font-semibold">{data.username}</h2>
          {profile && (
            <span className="text-sm text-muted-foreground">
              {profile.cuteName}
              {profile.gameMode ? " · " + profile.gameMode : ""}
            </span>
          )}
        </div>
        <dl className="grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-4">
          {[
            [
              "Available skill average",
              mainSkills.length ? data.skillAverage.toFixed(2) : "Unavailable",
            ],
            [
              balance === null ? "Purse" : "Purse + bank",
              balance !== null
                ? formatFull(balance)
                : purse !== null
                  ? formatFull(purse)
                  : "Unavailable",
            ],
            ["Fairy Souls", fairySouls === null ? "Unavailable" : formatFull(fairySouls)],
            [
              "Catacombs XP",
              data.dungeons && data.availability?.catacombsXp
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
        <h2 className="text-lg font-semibold">SkyBlock level</h2>
        {skyBlockLevel ? (
          <>
            <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm">
              <span>Level {skyBlockLevel.level}</span>
              <span className="text-muted-foreground">
                {skyBlockLevel.remainingXp} XP to level {skyBlockLevel.level + 1}
              </span>
            </div>
            <div className="mt-2">
              <ProgressBar pct={skyBlockLevel.progress} />
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            Hypixel has no SkyBlock XP for this profile.
          </p>
        )}
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
