import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ConnectPrompt, ErrorState, LoadState } from "@/components/data-states";
import { PageHero, Panel } from "@/components/layout/app-shell";
import { usePlayer } from "@/hooks/use-account";
import { useAuctionQuote } from "@/hooks/use-auction-quote";
import { ItemIcon } from "@/components/ui/item-icon";
import { generateTailoredActionPlan } from "@/lib/advisor-engine";
import {
  JUNGLE_AMULET_ID,
  ASPECT_OF_THE_DRAGON_ID,
  LIVID_DAGGER_ID,
  RED_CLAW_ARTIFACT_ID,
  UNSTABLE_DRAGON_BOOTS_ID,
  aspectOfTheDragonsBudget,
  jungleAmuletBudget,
  lividDaggerBudget,
  recommendLividDagger,
  recommendAspectOfTheDragons,
  recommendJungleAmulet,
  recommendOdawaTrade,
  recommendRedClawUpgrade,
  recommendStarterBow,
  recommendUnstableBoots,
  redClawUpgradeBudget,
  unstableBootsBudget,
} from "@/lib/advisor-market";

export const Route = createFileRoute("/advisor")({
  head: () => ({ meta: [{ title: "Advisor — SkyForge" }] }),
  component: AdvisorRoute,
});

function AdvisorRoute() {
  const { data, isLoading, error, connected } = usePlayer();
  const baseActions = useMemo(
    () => generateTailoredActionPlan(error ? undefined : data),
    [data, error],
  );
  const budget = useMemo(() => redClawUpgradeBudget(error ? undefined : data), [data, error]);
  const miningBudget = useMemo(() => jungleAmuletBudget(error ? undefined : data), [data, error]);
  const daggerBudget = useMemo(() => lividDaggerBudget(error ? undefined : data), [data, error]);
  const market = useAuctionQuote(RED_CLAW_ARTIFACT_ID, budget !== null);
  const miningMarket = useAuctionQuote(JUNGLE_AMULET_ID, miningBudget !== null);
  const daggerMarket = useAuctionQuote(LIVID_DAGGER_ID, daggerBudget !== null);
  const aspectBudget = aspectOfTheDragonsBudget(error ? undefined : data);
  const bootsBudget = unstableBootsBudget(error ? undefined : data);
  const aspectMarket = useAuctionQuote(ASPECT_OF_THE_DRAGON_ID, aspectBudget !== null);
  const bootsMarket = useAuctionQuote(UNSTABLE_DRAGON_BOOTS_ID, bootsBudget !== null);
  const now = Date.now();
  const weaponUpgrade =
    recommendAspectOfTheDragons(
      aspectBudget,
      aspectMarket.isError || aspectMarket.expired ? undefined : aspectMarket.quote,
      now,
    ) ??
    recommendLividDagger(
      daggerBudget,
      daggerMarket.isError || daggerMarket.expired ? undefined : daggerMarket.quote,
      now,
    );
  const upgrades = [
    weaponUpgrade,
    recommendUnstableBoots(
      bootsBudget,
      bootsMarket.isError || bootsMarket.expired ? undefined : bootsMarket.quote,
      now,
    ),
    recommendStarterBow(error ? undefined : data),
    recommendRedClawUpgrade(
      budget,
      market.isError || market.expired ? undefined : market.quote,
      now,
    ),
    recommendJungleAmulet(
      miningBudget,
      miningMarket.isError || miningMarket.expired ? undefined : miningMarket.quote,
      now,
    ),
    recommendOdawaTrade(error ? undefined : data),
  ].filter((action) => action !== null);
  const actions = [
    ...upgrades,
    ...baseActions.filter((action) => !action.futureGoal),
    ...baseActions.filter((action) => action.futureGoal),
  ];
  const checkingMarket =
    (budget !== null && !market.quote && !market.isError) ||
    (miningBudget !== null && !miningMarket.quote && !miningMarket.isError) ||
    (daggerBudget !== null && !daggerMarket.quote && !daggerMarket.isError) ||
    (aspectBudget !== null && !aspectMarket.quote && !aspectMarket.isError) ||
    (bootsBudget !== null && !bootsMarket.quote && !bootsMarket.isError);

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
            {checkingMarket && (
              <p role="status" className="mt-3 text-sm text-muted-foreground">
                Checking comparable Auction House prices…
              </p>
            )}
            {actions.length ? (
              <ol className="mt-4 space-y-3">
                {actions.map((action, index) => (
                  <li
                    key={action.id}
                    className="rounded-2xl border border-border bg-background/35 p-4 sm:p-5"
                  >
                    <div className="flex items-baseline gap-3">
                      {action.marketItemId || action.simulatorWeaponId ? (
                        <ItemIcon
                          id={action.marketItemId ?? action.simulatorWeaponId ?? ""}
                          name={action.title}
                          className="size-6 shrink-0 self-center"
                        />
                      ) : (
                        <span className="w-6 shrink-0 text-sm tabular-nums text-muted-foreground">
                          {index + 1}.
                        </span>
                      )}
                      <h3 className="text-base font-semibold">{action.title}</h3>
                      {action.futureGoal && (
                        <span className="text-xs text-muted-foreground">Future goal</span>
                      )}
                    </div>
                    <div className="mt-2 space-y-2 sm:pl-9 text-sm leading-relaxed">
                      <p>{action.detail}</p>
                      <p className="text-muted-foreground">{action.benefit}</p>
                      {action.cost && <p className="text-muted-foreground">{action.cost}</p>}
                      {action.link && (
                        <Link
                          to={action.link}
                          {...(action.id.startsWith("dungeon-")
                            ? { search: { tab: "dungeons" } }
                            : {})}
                          className="inline-block text-primary hover:underline"
                        >
                          View progress
                        </Link>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-2 empty:hidden">
                        {action.marketItemId && (
                          <Link
                            to="/wiki/$itemId"
                            params={{ itemId: action.marketItemId }}
                            className="inline-block text-primary hover:underline"
                          >
                            View Wiki prices
                          </Link>
                        )}
                        {action.simulatorWeaponId && (
                          <Link
                            to="/simulator"
                            search={{ weapon: action.simulatorWeaponId }}
                            className="inline-block text-primary hover:underline"
                          >
                            Open in Damage Simulator
                          </Link>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              !checkingMarket && (
                <p className="mt-3 text-sm text-muted-foreground">
                  There isn’t enough confirmed progress to suggest a next step for this profile.
                </p>
              )
            )}
          </Panel>
        </>
      )}
    </div>
  );
}
