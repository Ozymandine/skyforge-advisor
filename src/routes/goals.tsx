import { createFileRoute } from "@tanstack/react-router";
import { Check, Plus } from "lucide-react";
import { useState } from "react";

import { PageHero, Panel, ProgressBar } from "@/components/layout/app-shell";
import { goals as seedGoals, tasks as seedTasks } from "@/data/mock";

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
  const [goals, setGoals] = useState(seedGoals);
  const [draft, setDraft] = useState("");
  const [tasks, setTasks] = useState(seedTasks);

  const toggle = (list: "daily" | "weekly", idx: number) =>
    setTasks((t) => ({
      ...t,
      [list]: t[list].map((task, i) => (i === idx ? { ...task, done: !task.done } : task)),
    }));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHero
        eyebrow="Tools"
        title="Goals"
        description="Set your own targets and keep the daily and weekly routine on track."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Active goals</h2>
            <div className="flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="New goal..."
                className="rounded-xl border border-input bg-secondary/40 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={() => {
                  if (!draft.trim()) return;
                  setGoals((g) => [
                    ...g,
                    { title: draft.trim(), progress: 0, due: "No date", tag: "Custom" },
                  ]);
                  setDraft("");
                }}
                className="flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/15 px-3 py-2 text-sm font-medium text-primary"
              >
                <Plus className="size-4" /> Add
              </button>
            </div>
          </div>

          <ul className="mt-6 space-y-3">
            {goals.map((g) => (
              <li key={g.title} className="glass-soft rounded-2xl p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <p className="font-medium">{g.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {g.tag} · {g.due}
                  </p>
                </div>
                <div className="mt-3">
                  <ProgressBar pct={g.progress} />
                </div>
                <p className="mt-2 text-right text-xs text-muted-foreground">{g.progress}%</p>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-4">
          {(["daily", "weekly"] as const).map((list) => (
            <Panel key={list}>
              <h2 className="text-lg font-semibold capitalize">{list} tasks</h2>
              <ul className="mt-4 space-y-2">
                {tasks[list].map((t, i) => (
                  <li key={t.label}>
                    <button
                      onClick={() => toggle(list, i)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
                    >
                      <span
                        className={`flex size-4.5 shrink-0 items-center justify-center rounded-md border ${
                          t.done ? "border-primary bg-primary/20 text-primary" : "border-border"
                        }`}
                      >
                        {t.done && <Check className="size-3" />}
                      </span>
                      <span className={t.done ? "text-muted-foreground line-through" : ""}>
                        {t.label}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </Panel>
          ))}
        </div>
      </div>
    </div>
  );
}
