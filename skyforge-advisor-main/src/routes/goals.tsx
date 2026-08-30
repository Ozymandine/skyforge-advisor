import { createFileRoute } from "@tanstack/react-router";
import { IconCheck, IconPlus, IconSparkles, IconX } from "@/assets/icons";
import { useEffect, useMemo, useState } from "react";

import { PageHero, Panel, ProgressBar } from "@/components/layout/app-shell";
import { ConnectPrompt, ErrorState, LoadState } from "@/components/data-states";
import { useAccount, usePlayer } from "@/hooks/use-account";
import { getHistory } from "@/lib/history";
import { MAX_COLLECTION_CATEGORIES, MAX_FAIRY_SOULS } from "@/lib/constants";
import { formatFull } from "@/lib/skyblock";

type Recommendation = {
  title: string;
  detail: string;
  pct: number;
};

/** Derive actionable recommendations from live profile data + local history. */
function useRecommendations(): Recommendation[] {
  const { data } = usePlayer();
  const account = useAccount();

  return useMemo(() => {
    if (!data) return [];
    const recs: Recommendation[] = [];

    // Skills closest to maxing — highest-leverage progression targets.
    const nearMaxed = [...data.skills]
      .filter((s) => !s.maxed)
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 3);
    for (const skill of nearMaxed) {
      recs.push({
        title: `Level ${skill.name} to ${skill.level + 1}`,
        detail: `${formatFull(skill.currentXp)} / ${formatFull(skill.neededXp)} XP (${skill.pct}% there)`,
        pct: skill.pct,
      });
    }

    // Fairy souls remaining.
    if (data.fairySouls < MAX_FAIRY_SOULS) {
      const pct = Math.round((data.fairySouls / MAX_FAIRY_SOULS) * 100);
      recs.push({
        title: `Collect ${MAX_FAIRY_SOULS - data.fairySouls} more fairy souls`,
        detail: `${data.fairySouls} / ${MAX_FAIRY_SOULS} collected — permanent stats on offer`,
        pct,
      });
    }

    // Collection category coverage.
    const categories = new Set(data.collections.map((c) => c.category));
    if (categories.size < MAX_COLLECTION_CATEGORIES) {
      recs.push({
        title: `Unlock ${MAX_COLLECTION_CATEGORIES - categories.size} more collection categories`,
        detail: `${categories.size} / ${MAX_COLLECTION_CATEGORIES} categories detected on this profile`,
        pct: Math.round((categories.size / MAX_COLLECTION_CATEGORIES) * 100),
      });
    }

    // Skill average gap vs theoretical max.
    const avgPct = Math.min(100, Math.round((data.skillAverage / 50.36) * 100));
    if (avgPct < 100) {
      recs.push({
        title: "Raise your skill average",
        detail: `${data.skillAverage.toFixed(2)} average — every level counts toward it`,
        pct: avgPct,
      });
    }

    return recs.slice(0, 6);
  }, [data]);
}

type Goal = {
  title: string;
  progress: number;
  due: string;
  tag: string;
};

type Task = {
  label: string;
  done: boolean;
  /** Default quests are curated; user-added ones are custom. */
  custom?: boolean;
};

/** Curated default quests — always offered unless removed by the user. */
const DEFAULT_TASKS: Record<"daily" | "weekly", string[]> = {
  daily: [
    "Complete 3 daily commissions",
    "Check the Bazaar flip board",
    "Claim minion earnings",
    "Do one slayer quest",
  ],
  weekly: [
    "Grind a dungeon floor",
    "Kill a Tier 4+ slayer",
    "Farm for 30 minutes",
    "Hunt for underpriced BINs on the Auction House",
  ],
};

function dayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function weekKey(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now.getTime() - start.getTime()) / 86_400_000 + start.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${week}`;
}

const TASKS_STORAGE = "sba.tasks";

type StoredTasks = {
  day: string;
  week: string;
  /** Per-list task state. Removed default labels tracked so they stay gone. */
  daily: Task[];
  weekly: Task[];
  removed: { daily: string[]; weekly: string[] };
};

function loadTasks(): StoredTasks {
  const day = dayKey();
  const week = weekKey();
  let stored: StoredTasks | null = null;
  try {
    const raw = localStorage.getItem(TASKS_STORAGE);
    stored = raw ? (JSON.parse(raw) as StoredTasks) : null;
  } catch {
    stored = null;
  }

  // Reset daily tasks on a new day, weekly tasks on a new week.
  const dailyCarry = stored && stored.day === day ? stored.daily : [];
  const weeklyCarry = stored && stored.week === week ? stored.weekly : [];
  const removed = stored?.removed ?? { daily: [], weekly: [] };

  const build = (list: "daily" | "weekly", carry: Task[]): Task[] => {
    const custom = carry.filter((t) => t.custom);
    const defaults = DEFAULT_TASKS[list]
      .filter((label) => !removed[list].includes(label))
      .map((label) => ({
        label,
        done: carry.some((t) => t.label === label && t.done),
      }));
    return [...defaults, ...custom];
  };

  return {
    day,
    week,
    daily: build("daily", dailyCarry),
    weekly: build("weekly", weeklyCarry),
    removed,
  };
}

function saveTasks(tasks: StoredTasks): void {
  try {
    localStorage.setItem(TASKS_STORAGE, JSON.stringify(tasks));
  } catch {
    // Storage unavailable — in-memory only.
  }
}

export const Route = createFileRoute("/goals")({
  head: () => ({
    meta: [
      { title: "Goals — SkyBlock Assistant" },
      {
        name: "description",
        content: "Custom goal setup, target trackers and daily / weekly task checklists.",
      },
      { property: "og:title", content: "Goals — SkyBlock Assistant" },
      {
        property: "og:description",
        content: "Set targets and track daily and weekly SkyBlock tasks.",
      },
    ],
  }),
  component: Goals,
});

function Goals() {
  const { connected, isLoading, error } = usePlayer();
  const recommendations = useRecommendations();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [draft, setDraft] = useState("");
  const [tasks, setTasks] = useState<{ daily: Task[]; weekly: Task[] }>(() => {
    const stored = loadTasks();
    return { daily: stored.daily, weekly: stored.weekly };
  });
  const [removed, setRemoved] = useState<{ daily: string[]; weekly: string[] }>(() => {
    return loadTasks().removed;
  });
  const [draftTask, setDraftTask] = useState<{ daily: string; weekly: string }>({
    daily: "",
    weekly: "",
  });

  // Persist (and roll over day/week) whenever tasks change.
  useEffect(() => {
    const stored = loadTasks();
    saveTasks({
      day: stored.day,
      week: stored.week,
      daily: tasks.daily,
      weekly: tasks.weekly,
      removed,
    });
  }, [tasks, removed]);

  // Roll over to a new day/week at midnight or on return visits.
  useEffect(() => {
    const interval = setInterval(() => {
      const stored = loadTasks();
      setTasks({ daily: stored.daily, weekly: stored.weekly });
      setRemoved(stored.removed);
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const toggle = (list: "daily" | "weekly", idx: number) =>
    setTasks((current) => ({
      ...current,
      [list]: current[list].map((task, i) => (i === idx ? { ...task, done: !task.done } : task)),
    }));

  const removeTask = (list: "daily" | "weekly", idx: number) => {
    const task = tasks[list][idx];
    if (!task) return;
    // Removing a default quest keeps it gone for the rest of the day/week.
    if (!task.custom) {
      setRemoved((current) => ({ ...current, [list]: [...current[list], task.label] }));
    }
    setTasks((current) => ({ ...current, [list]: current[list].filter((_, i) => i !== idx) }));
  };

  const addTask = (list: "daily" | "weekly") => {
    const label = draftTask[list].trim();
    if (!label) return;
    setTasks((current) => ({
      ...current,
      [list]: [...current[list], { label, done: false, custom: true }],
    }));
    setDraftTask((current) => ({ ...current, [list]: "" }));
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHero
        eyebrow="Tools"
        title="Goals"
        description="Set your own targets and keep the daily and weekly routine on track."
      />

      {!connected && <ConnectPrompt what="your goal tracker" />}
      {connected && isLoading && <LoadState>Loading your profile…</LoadState>}
      {connected && error && <ErrorState error={error} />}

      {connected && !isLoading && !error && (
        <div className="space-y-4">
          {/* Advisor engine — computed from live profile data */}
          {recommendations.length > 0 && (
            <Panel>
              <div className="flex items-center gap-2">
                <IconSparkles className="size-4 text-primary" />
                <h2 className="text-xl font-semibold">Recommended next steps</h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Computed automatically from your live profile — highest-leverage progression targets
                first.
              </p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {recommendations.map((rec) => (
                  <li key={rec.title} className="glass-soft rounded-2xl p-4">
                    <p className="text-sm font-medium">{rec.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{rec.detail}</p>
                    <div className="mt-3">
                      <ProgressBar pct={rec.pct} />
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          <div className="grid gap-4 lg:grid-cols-3">
            <Panel className="lg:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">Active goals</h2>
                <div className="flex gap-2">
                  <input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="New goal..."
                    className="rounded-xl border border-input bg-secondary/40 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={() => {
                      const title = draft.trim();
                      if (!title) return;
                      setGoals((current) => [
                        ...current,
                        { title, progress: 0, due: "No date", tag: "Custom" },
                      ]);
                      setDraft("");
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/15 px-3 py-2 text-sm font-medium text-primary"
                  >
                    <IconPlus className="size-4" /> Add
                  </button>
                </div>
              </div>

              {goals.length === 0 ? (
                <Panel className="mt-6">
                  <p className="text-sm text-muted-foreground">
                    No goals yet. Add a custom goal to start tracking progress.
                  </p>
                </Panel>
              ) : (
                <ul className="mt-6 space-y-3">
                  {goals.map((goal) => (
                    <li key={goal.title} className="glass-soft rounded-2xl p-5">
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <p className="font-medium">{goal.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {goal.tag} · {goal.due}
                        </p>
                      </div>
                      <div className="mt-3">
                        <ProgressBar pct={goal.progress} />
                      </div>
                      <p className="mt-2 text-right text-xs text-muted-foreground">
                        {goal.progress}%
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <div className="space-y-4">
              {(["daily", "weekly"] as const).map((list) => (
                <Panel key={list}>
                  <h2 className="text-lg font-semibold capitalize">{list} tasks</h2>
                  <ul className="mt-4 space-y-2">
                    {tasks[list].map((task, index) => (
                      <li key={task.label} className="group flex items-center gap-1">
                        <button
                          onClick={() => toggle(list, index)}
                          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
                        >
                          <span
                            className={`flex size-4.5 shrink-0 items-center justify-center rounded-md border ${
                              task.done
                                ? "border-primary bg-primary/20 text-primary"
                                : "border-border"
                            }`}
                          >
                            {task.done && <IconCheck className="size-3" />}
                          </span>
                          <span
                            className={`min-w-0 truncate ${
                              task.done ? "text-muted-foreground line-through" : ""
                            }`}
                          >
                            {task.label}
                          </span>
                        </button>
                        <button
                          onClick={() => removeTask(list, index)}
                          aria-label={`Remove task: ${task.label}`}
                          className="shrink-0 rounded-lg p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-white/10 hover:text-danger group-hover:opacity-100"
                        >
                          <IconX className="size-3.5" />
                        </button>
                      </li>
                    ))}
                    {tasks[list].length === 0 && (
                      <li className="px-3 py-2 text-sm text-muted-foreground">
                        All tasks done or removed — add your own below.
                      </li>
                    )}
                  </ul>
                  <div className="mt-3 flex gap-2">
                    <input
                      value={draftTask[list]}
                      onChange={(e) =>
                        setDraftTask((current) => ({ ...current, [list]: e.target.value }))
                      }
                      onKeyDown={(e) => e.key === "Enter" && addTask(list)}
                      placeholder="Add a task..."
                      className="min-w-0 flex-1 rounded-xl border border-input bg-secondary/40 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                    />
                    <button
                      onClick={() => addTask(list)}
                      disabled={!draftTask[list].trim()}
                      className="flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/15 px-3 py-2 text-sm font-medium text-primary disabled:opacity-50"
                    >
                      <IconPlus className="size-4" /> Add
                    </button>
                  </div>
                </Panel>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
