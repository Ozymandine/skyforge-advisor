import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ConnectPrompt, ErrorState, LoadState } from "@/components/data-states";
import { PageHero, Panel } from "@/components/layout/app-shell";
import { usePlayer } from "@/hooks/use-account";
import { generateTailoredActionPlan } from "@/lib/advisor-engine";

export const Route = createFileRoute("/advisor")({
  head: () => ({ meta: [{ title: "Advisor — SkyForge" }] }),
  component: AdvisorRoute,
});

function AdvisorRoute() {
  const { data, isLoading, error, connected } = usePlayer();
  const actions = useMemo(() => generateTailoredActionPlan(data), [data]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHero title="Advisor" />
      {!connected && <ConnectPrompt what="your next steps" />}
      {connected && isLoading && <LoadState>Loading profile…</LoadState>}
      {connected && error && <ErrorState error={error} />}
      {connected && !isLoading && !error && !data && (
        <p role="status">Profile data is unavailable.</p>
      )}
      {data && (
        <>
          <Panel>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold">Next steps</h2>
              <span className="text-sm text-muted-foreground">{data.username}</span>
            </div>
            {actions.length ? (
              <ol className="mt-4 space-y-3">
                {actions.map((action, index) => (
                  <li
                    key={action.id}
                    className="rounded-2xl border border-border bg-background/35 p-4 sm:p-5"
                  >
                    <div className="flex items-baseline gap-3">
                      <span className="text-sm tabular-nums text-muted-foreground">
                        {index + 1}.
                      </span>
                      <h3 className="text-base font-semibold">{action.title}</h3>
                    </div>
                    <div className="mt-2 space-y-2 pl-6 text-sm leading-relaxed">
                      <p>{action.detail}</p>
                      <p className="text-muted-foreground">{action.benefit}</p>
                      {action.cost && <p className="text-muted-foreground">{action.cost}</p>}
                      {action.link && (
                        <Link
                          to={action.link}
                          {...(action.id === "repeat-dungeon-floor"
                            ? { search: { tab: "dungeons" } }
                            : {})}
                          className="inline-block text-primary hover:underline"
                        >
                          View progress
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                There isn’t enough confirmed progress to suggest a next step for this profile.
              </p>
            )}
          </Panel>
          <p className="text-sm text-muted-foreground">
            Gear upgrades are omitted until ownership, requirements, and prices can be verified.
          </p>
        </>
      )}
    </div>
  );
}
