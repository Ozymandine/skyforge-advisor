import { createFileRoute } from "@tanstack/react-router";

import { PageHero, Panel, ProgressBar, StatRow } from "@/components/layout/app-shell";
import { ConnectPrompt, ErrorState, LoadState } from "@/components/data-states";
import { usePlayer } from "@/hooks/use-account";
import { formatFull } from "@/lib/skyblock";

export const Route = createFileRoute("/net-worth")({
  head: () => ({
    meta: [
      { title: "Net Worth — SkyBlock Assistant" },
      {
        name: "description",
        content: "Portfolio valuation across purse, bank, inventory, armor and storage.",
      },
      { property: "og:title", content: "Net Worth — SkyBlock Assistant" },
      {
        property: "og:description",
        content: "Full breakdown of your SkyBlock portfolio valuation.",
      },
    ],
  }),
  component: NetWorth,
});

function NetWorth() {
  const { data, isLoading, error, connected } = usePlayer();

  const total = data ? data.purse + (data.bank ?? 0) : 0;
  const containers = data?.containers ?? [];
  const containerItems = containers.reduce((sum, container) => sum + container.items.length, 0);
  const bankPct = total > 0 ? Math.round(((data?.bank ?? 0) / total) * 100) : 0;
  const pursePct = total > 0 ? Math.round(((data?.purse ?? 0) / total) * 100) : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHero
        eyebrow="Economy"
        title="Net Worth"
        description="A full valuation of everything the profile holds, priced against live market data."
      />

      {!connected && <ConnectPrompt what="your live net worth" />}
      {connected && isLoading && <LoadState>Loading net worth data…</LoadState>}
      {connected && error && <ErrorState error={error} />}

      {connected && data && (
        <>
          <StatRow
            stats={[
              { label: "Total net worth", value: formatFull(total), sub: "Purse + bank" },
              {
                label: "Purse",
                value: formatFull(data.purse),
                sub: "Coins currently on hand",
              },
              {
                label: "Bank",
                value: data.bank === null ? "Hidden" : formatFull(data.bank),
                sub: "Bank balance",
              },
              {
                label: "Containers",
                value: String(containers.length),
                sub: `${containerItems} total items`,
              },
            ]}
          />

          <div className="grid gap-4 lg:grid-cols-3">
            <Panel className="lg:col-span-2">
              <h2 className="text-xl font-semibold">Portfolio breakdown</h2>
              <ul className="mt-6 space-y-4">
                <li>
                  <div className="flex items-baseline justify-between text-sm">
                    <p className="font-medium">Purse</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {formatFull(data.purse)} · {pursePct}%
                    </p>
                  </div>
                  <div className="mt-2">
                    <ProgressBar pct={pursePct} />
                  </div>
                </li>
                <li>
                  <div className="flex items-baseline justify-between text-sm">
                    <p className="font-medium">Bank</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {data.bank === null ? "Hidden" : `${formatFull(data.bank)} · ${bankPct}%`}
                    </p>
                  </div>
                  <div className="mt-2">
                    <ProgressBar pct={data.bank === null ? 0 : bankPct} />
                  </div>
                </li>
              </ul>
            </Panel>

            <Panel>
              <h2 className="text-xl font-semibold">Top containers</h2>
              <ul className="mt-6 space-y-3">
                {containers.map((container) => (
                  <li
                    key={container.id}
                    className="glass-soft flex items-center justify-between gap-3 rounded-xl px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{container.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {container.items.length} item{container.items.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-primary">
                      {formatFull(container.items.length)}
                    </p>
                  </li>
                ))}
                {containers.length === 0 && (
                  <li className="text-sm text-muted-foreground">
                    No container data is available for this profile.
                  </li>
                )}
              </ul>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}