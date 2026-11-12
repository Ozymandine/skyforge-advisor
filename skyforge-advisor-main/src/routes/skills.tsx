import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { ConnectPrompt, ErrorState, LoadState } from "@/components/data-states";
import { PageHero, Panel, ProgressBar } from "@/components/layout/app-shell";
import { marketControl } from "@/components/market-controls";
import { ItemIcon } from "@/components/ui/item-icon";
import { usePlayer } from "@/hooks/use-account";
import { HOTM_NODES, HOTM_PRESETS, calculateTotalHotmBonus } from "@/lib/hotm-engine";
import type { PlayerDataValidated } from "@/lib/schemas";
import { formatFull, titleCase } from "@/lib/skyblock";

const tabs = [
  { id: "overview", label: "Overview", sprite: "experience_bottle" },
  { id: "bestiary", label: "Bestiary", sprite: "spider_eye" },
  { id: "dungeons", label: "Dungeons", sprite: "bone" },
  { id: "kuudra", label: "Crimson Isle", sprite: "blaze_powder" },
  { id: "rift", label: "The Rift", sprite: "ender_eye" },
  { id: "farming", label: "Farming", sprite: "wheat" },
  { id: "mining", label: "Mining", sprite: "iron_pickaxe" },
  { id: "combat", label: "Combat", sprite: "iron_sword" },
  { id: "fishing", label: "Fishing", sprite: "fishing_rod" },
  { id: "experiments", label: "Slayers", sprite: "book" },
] as const;

type SkillTab = (typeof tabs)[number]["id"];
type PlayerProps = { data: PlayerDataValidated };
type Stat = [label: string, value: string | number | undefined | null];

export const Route = createFileRoute("/skills")({
  validateSearch: (search: Record<string, unknown>): { tab?: SkillTab } => ({
    tab: tabs.find((tab) => tab.id === search["tab"])?.id ?? "overview",
  }),
  head: () => ({ meta: [{ title: "Skills — SkyForge" }] }),
  component: SkillsRoute,
});

function StatList({ rows }: { rows: Stat[] }) {
  return (
    <dl
      className={
        rows.length > 1 ? "grid gap-x-6 divide-y divide-border sm:grid-cols-2 sm:divide-y-0" : ""
      }
    >
      {rows.map(([label, value]) => (
        <div
          className="flex flex-wrap items-baseline justify-between gap-2 border-border py-2.5 text-sm sm:border-b"
          key={label}
        >
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="font-medium tabular-nums">
            {typeof value === "number" ? formatFull(value) : (value ?? "Unavailable")}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Panel className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </Panel>
  );
}

function Note({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

function SkillsOverview({ data }: PlayerProps) {
  const mainSkills = data.skills.filter(
    (skill) => skill.key !== "SOCIAL" && skill.key !== "RUNECRAFTING",
  );
  return (
    <Section title="Skill progress">
      {data.skills.length ? (
        <>
          <StatList
            rows={[
              [
                "Available skill average",
                mainSkills.length ? data.skillAverage.toFixed(2) : undefined,
              ],
              ["Total reported skill XP", data.totalSkillXp],
            ]}
          />
          <ul className="grid gap-x-8 lg:grid-cols-2">
            {data.skills.map((skill) => (
              <li key={skill.key} className="space-y-2 border-b border-border py-3">
                <div className="flex items-center gap-2 text-sm">
                  <ItemIcon id={skill.key} name={skill.name} className="size-6 shrink-0" />
                  <span className="flex-1 font-medium">{skill.name}</span>
                  <span className="tabular-nums">Level {skill.level}</span>
                </div>
                <div className="flex items-center gap-3 pl-8">
                  <div className="min-w-8 flex-1">
                    <ProgressBar pct={skill.pct} />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {skill.maxed
                      ? "Max level"
                      : `${formatFull(skill.currentXp)} / ${formatFull(skill.neededXp)} XP`}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <Note>Hypixel has no skill XP for this profile.</Note>
      )}
    </Section>
  );
}

function DungeonProgress({ data }: PlayerProps) {
  const dungeon = data.dungeons;
  const clears = [
    ...(dungeon?.floors ?? []).map((floor) => ({
      ...floor,
      name: floor.name === "Floor 0" ? "Entrance" : floor.name,
    })),
    ...(dungeon?.masterMode ?? []).map((floor) => ({
      ...floor,
      name: "Master Mode " + floor.name,
    })),
  ].filter((floor) => floor.completions > 0);
  return (
    <Section title="Catacombs">
      <StatList
        rows={[
          ["Catacombs level", data.availability?.catacombsXp ? dungeon?.catacombsLevel : undefined],
          ["Catacombs XP", data.availability?.catacombsXp ? dungeon?.catacombsXp : undefined],
          ["Secrets found", dungeon?.secretsFound],
        ]}
      />
      {clears.length ? (
        <>
          <h3 className="text-sm font-semibold">Recorded clears</h3>
          <ul className="divide-y divide-border">
            {clears.map((floor) => (
              <li key={floor.name} className="flex flex-wrap justify-between gap-2 py-2.5 text-sm">
                <span>{floor.name}</span>
                <span className="text-muted-foreground">
                  {formatFull(floor.completions)} clears
                  {floor.bestScore > 0 ? ` · Best score ${floor.bestScore}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <Note>There are no recorded clears in this profile response.</Note>
      )}
      {dungeon?.classes?.length ? (
        <>
          <h3 className="text-sm font-semibold">Dungeon classes</h3>
          <StatList
            rows={dungeon.classes.map((entry) => [
              entry.name + (entry.selected ? " · Selected" : ""),
              `Level ${entry.level}`,
            ])}
          />
        </>
      ) : null}
      <Link to="/advisor" className="inline-block text-sm text-primary hover:underline">
        View verified next steps
      </Link>
    </Section>
  );
}

function Bestiary({ data }: PlayerProps) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("");
  const [sort, setSort] = useState("kills");
  const groups = data.bestiary?.families ?? [];
  const search = query.trim().toLowerCase();
  const families = groups
    .filter((family) => !group || group === family.id)
    .map((family) => ({
      ...family,
      mobs: family.mobs
        .filter((mob) => mob.kills > 0 && (!search || mob.name.toLowerCase().includes(search)))
        .sort((a, b) =>
          sort === "name"
            ? a.name.localeCompare(b.name)
            : b.kills - a.kills || a.name.localeCompare(b.name),
        ),
    }))
    .filter((family) => family.mobs.length > 0);
  return (
    <Section title="Bestiary">
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-36 flex-1 text-sm">
          Search mobs
          <input
            type="search"
            className={marketControl + " mt-1 block w-full"}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="text-sm">
          Area
          <select
            className={marketControl + " mt-1 block"}
            value={group}
            onChange={(event) => setGroup(event.target.value)}
          >
            <option value="">All areas</option>
            {groups
              .filter((family) => family.mobs.some((mob) => mob.kills > 0))
              .map((family) => (
                <option key={family.id} value={family.id}>
                  {family.name}
                </option>
              ))}
          </select>
        </label>
        <label className="text-sm">
          Sort by
          <select
            className={marketControl + " mt-1 block"}
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="kills">Most kills</option>
            <option value="name">Name A–Z</option>
          </select>
        </label>
      </div>
      {!families.length && <Note>No recorded kills match these filters.</Note>}
      <div className="grid items-start gap-3 md:grid-cols-2 xl:grid-cols-3">
        {families.map((family) => (
          <section key={family.id} className="rounded-xl border border-border bg-background/25 p-3">
            <h3 className="flex items-center justify-between gap-2 text-sm font-semibold">
              {family.name}
              <span className="text-xs font-normal text-muted-foreground">
                {family.mobs.length} mobs
              </span>
            </h3>
            <ul className="mt-2 divide-y divide-border">
              {family.mobs.map((mob) => (
                <li key={mob.id} className="flex items-center justify-between gap-2 py-1.5 text-sm">
                  <span>{mob.name}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {formatFull(mob.kills)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Section>
  );
}

function Mining({ data }: PlayerProps) {
  const [levels, setLevels] = useState<Record<string, number>>({});
  const [nodeId, setNodeId] = useState(HOTM_NODES[0]?.id ?? "");
  const node = HOTM_NODES.find((entry) => entry.id === nodeId);
  const estimate = calculateTotalHotmBonus(levels);
  return (
    <div className="space-y-4">
      <Section title="Mining progress">
        <StatList
          rows={[
            ["Mining level", data.skills.find((skill) => skill.key === "MINING")?.level],
            ["Heart of the Mountain tier", data.hotm?.tier],
            ["Heart of the Mountain XP", data.hotm?.xp],
            ["Mithril powder", data.hotm?.powders.mithril],
            ["Gemstone powder", data.hotm?.powders.gemstone],
            ["Glacite powder", data.hotm?.powders.glacite],
          ]}
        />
      </Section>
      <Section title="Heart of the Mountain planner">
        <Note>
          Preview selected perk bonuses. Check unlocks, prerequisites, and powder costs in game.
        </Note>
        <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-40 flex-1 text-sm">
            Perk
            <select
              className={marketControl + " mt-1 block w-full"}
              value={nodeId}
              onChange={(event) => setNodeId(event.target.value)}
            >
              {HOTM_NODES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name}
                </option>
              ))}
            </select>
          </label>
          {node && (
            <label className="text-sm">
              Planned level
              <input
                className={marketControl + " mt-1 block w-24"}
                type="number"
                min={0}
                max={node.maxLevel}
                value={levels[node.id] ?? 0}
                onChange={(event) => {
                  const value = Math.max(
                    0,
                    Math.min(node.maxLevel, Math.trunc(Number(event.target.value))),
                  );
                  setLevels((previous) => ({ ...previous, [node.id]: value }));
                }}
              />
            </label>
          )}
          <label className="text-sm">
            Load preset
            <select
              className={marketControl + " mt-1 block"}
              value=""
              onChange={(event) => {
                const preset = HOTM_PRESETS.find((entry) => entry.id === event.target.value);
                if (preset) setLevels(preset.allocations);
              }}
            >
              <option value="">Choose a preset</option>
              {HOTM_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
          </label>
          {data.hotm && (
            <button
              type="button"
              className={marketControl}
              onClick={() => setLevels(data.hotm?.nodes ?? {})}
            >
              Use profile perks
            </button>
          )}
          <button type="button" className={marketControl} onClick={() => setLevels({})}>
            Reset
          </button>
        </div>
        {node && <Note>{node.description}</Note>}
        <StatList
          rows={[
            ["Estimated speed bonus", estimate.totalSpeed],
            ["Estimated fortune bonus", estimate.totalFortune],
          ]}
        />
      </Section>
    </div>
  );
}

function ReportedProgress({
  data,
  tab,
}: PlayerProps & { tab: Exclude<SkillTab, "overview" | "bestiary" | "dungeons" | "mining"> }) {
  const level = (key: string) => data.skills.find((skill) => skill.key === key)?.level;
  switch (tab) {
    case "kuudra":
      return (
        <Section title="Crimson Isle">
          <StatList
            rows={[
              ["Faction", data.crimson?.faction],
              ["Reputation", data.crimson?.reputation],
              ...Object.entries(data.crimson?.kuudra ?? {}).map(([key, count]): Stat => [
                titleCase(key) + " Kuudra clears",
                count,
              ]),
            ]}
          />
        </Section>
      );
    case "rift":
      return (
        <Section title="The Rift">
          <StatList rows={[["Motes", data.rift?.motes]]} />
          <Note>Check your Rift Guide in game for unlocked timecharms and current Rift Time.</Note>
        </Section>
      );
    case "farming":
      return (
        <Section title="Farming and Garden">
          <StatList
            rows={[
              ["Farming level", level("FARMING")],
              ["Garden XP", data.garden?.xp],
              ["Visitors served", data.garden?.visitorsServed],
              ["Compost made", data.garden?.compost],
            ]}
          />
          <Link to="/calendar" className="text-sm text-primary hover:underline">
            View contest schedule
          </Link>
        </Section>
      );
    case "combat": {
      const combat = data.skills.find((skill) => skill.key === "COMBAT");
      return (
        <Section title="Combat">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
            <div className="rounded-xl border border-border bg-background/25 p-4">
              <div className="flex items-center gap-3">
                <ItemIcon id="IRON_SWORD" name="Iron Sword" className="size-9 shrink-0" />
                <div>
                  <p className="text-xl font-bold">
                    {combat ? `Level ${combat.level}` : "Combat XP unavailable"}
                  </p>
                  {combat && (
                    <p className="text-sm text-muted-foreground">
                      {formatFull(combat.totalXp)} total XP
                    </p>
                  )}
                </div>
              </div>
              {combat && (
                <div className="mt-4 space-y-1.5">
                  <ProgressBar pct={combat.pct} />
                  <p className="text-xs text-muted-foreground">
                    {combat.maxed
                      ? "Max level"
                      : `${formatFull(Math.max(0, combat.neededXp - combat.currentXp))} XP to level ${combat.level + 1}`}
                  </p>
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Link
                to="/simulator"
                className="game-tile flex items-center gap-3 rounded-xl border border-border bg-background/25 p-3 text-sm font-medium"
              >
                <ItemIcon id="IRON_SWORD" name="Iron Sword" className="size-5" /> Damage Simulator
              </Link>
              <Link
                to="/skills"
                search={{ tab: "bestiary" }}
                className="game-tile flex items-center gap-3 rounded-xl border border-border bg-background/25 p-3 text-sm font-medium"
              >
                <ItemIcon id="SPIDER_EYE" name="Spider Eye" className="size-5" /> Bestiary
              </Link>
            </div>
          </div>
        </Section>
      );
    }
    case "fishing":
      return (
        <Section title="Fishing">
          <StatList rows={[["Fishing level", level("FISHING")]]} />
          <Note>Check Odger in game for your Trophy Fish collection.</Note>
        </Section>
      );
    case "experiments":
      return (
        <Section title="Slayers and enchanting">
          <StatList
            rows={[
              ["Enchanting level", level("ENCHANTING")],
              ...(data.slayerOverview?.bosses ?? [])
                .filter((boss) => boss.currentXp > 0 || boss.claimedLevel !== undefined)
                .map((boss): Stat => [
                  boss.name,
                  `${formatFull(boss.currentXp)} XP${boss.claimedLevel === undefined ? "" : ` · Level ${boss.claimedLevel} claimed`}`,
                ]),
            ]}
          />
        </Section>
      );
  }
}

function SkillsRoute() {
  const { data, isLoading, error, connected } = usePlayer();
  const { tab = "overview" } = Route.useSearch();
  const active = tabs.find((entry) => entry.id === tab)!;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHero title="Skills" />
      {!connected && <ConnectPrompt what="your skills" />}
      {connected && isLoading && <LoadState>Loading skills…</LoadState>}
      {connected && error && <ErrorState error={error} />}
      {data && (
        <>
          <nav aria-label="Skill views" className="flex flex-wrap gap-1.5">
            {tabs.map((entry) => (
              <Link
                key={entry.id}
                to="/skills"
                search={{ tab: entry.id }}
                aria-current={entry.id === tab ? "page" : undefined}
                className={`game-tile inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-ring ${entry.id === tab ? "border-primary/40 bg-primary/15 font-semibold text-foreground" : "border-border bg-card/45 text-muted-foreground hover:text-foreground"}`}
              >
                <ItemIcon id={entry.sprite} name={entry.label} className="size-4 shrink-0" />
                {entry.label}
              </Link>
            ))}
          </nav>
          <div key={active.id} className="animate-fade-slide-up">
            {active.id === "overview" ? (
              <SkillsOverview data={data} />
            ) : active.id === "bestiary" ? (
              <Bestiary data={data} />
            ) : active.id === "dungeons" ? (
              <DungeonProgress data={data} />
            ) : active.id === "mining" ? (
              <Mining data={data} />
            ) : (
              <ReportedProgress data={data} tab={active.id} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
