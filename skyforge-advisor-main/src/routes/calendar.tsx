import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { PageHero, Panel } from "@/components/layout/app-shell";
import { ItemIcon } from "@/components/ui/item-icon";
import { fetchFireSaleSnapshot } from "@/lib/hypixel.functions";
import { formatTimeRemaining, getJacobContests } from "@/lib/calendar";
import { titleCase } from "@/lib/skyblock";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "Calendar — SkyForge" }] }),
  component: Calendar,
});

function EventTime({ timestamp }: { timestamp: number }) {
  const date = new Date(timestamp);
  return (
    <time dateTime={date.toISOString()}>
      {date.toLocaleString([], {
        weekday: "short",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      })}
    </time>
  );
}

function Calendar() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);
  const sales = useQuery({
    queryKey: ["calendar-fire-sales"],
    queryFn: () => fetchFireSaleSnapshot(),
    staleTime: 5 * 60_000,
  });
  const contests = now === null ? [] : getJacobContests(now, 4);
  const visibleSales =
    now === null
      ? []
      : (sales.data?.sales ?? [])
          .filter((sale) => sale.end > now)
          .sort((a, b) => a.start - b.start);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHero title="Calendar" />
      <Panel>
        <div className="flex items-center gap-3">
          <img
            src="/vanilla/wheat.png"
            alt=""
            width={24}
            height={24}
            className="[image-rendering:pixelated]"
          />
          <h2 className="text-lg font-semibold">Jacob’s Farming Contest</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Estimated schedule. Check the in-game Calendar for crops and exact timing.
        </p>
        <ul className="mt-4 divide-y divide-border border-t border-border">
          {contests.map((contest) => (
            <li key={contest.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
              <EventTime timestamp={contest.startTime} />
              <span className="tabular-nums text-muted-foreground">
                {contest.status === "active" ? "Estimated time left · " : "Estimated start in · "}
                {formatTimeRemaining(contest.timeRemainingMs)}
              </span>
            </li>
          ))}
        </ul>
        <a
          className="text-sm text-primary hover:underline"
          href="https://hypixel.net/threads/0-9-11-city-project-farm-merchants-dwelling.3502409/"
        >
          Hypixel contest schedule
        </a>
      </Panel>
      <Panel>
        <h2 className="text-lg font-semibold">Fire Sales</h2>
        {sales.isPending && (
          <p role="status" className="mt-3 text-sm text-muted-foreground">
            Checking the Hypixel feed…
          </p>
        )}
        {(sales.isError || sales.data?.status === "unavailable") && (
          <p role="status" className="mt-3 text-sm text-muted-foreground">
            The Hypixel Fire Sale feed is unavailable.
          </p>
        )}
        {sales.data?.status === "stale" && (
          <p role="status" className="mt-3 text-sm text-muted-foreground">
            Showing the last available schedule.
          </p>
        )}
        {sales.data?.status === "fresh" && now !== null && !visibleSales.length && (
          <p className="mt-3 text-sm text-muted-foreground">
            Hypixel hasn’t published any active or upcoming Fire Sales.
          </p>
        )}
        <ul className="mt-3 divide-y divide-border">
          {visibleSales.map((sale) => (
            <li
              key={sale.item_id + sale.start}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3 text-sm"
            >
              <ItemIcon
                id={sale.item_id}
                name={titleCase(sale.item_id)}
                className="size-6 shrink-0"
              />
              <span className="flex-1 font-medium">{titleCase(sale.item_id)}</span>
              <span className="text-muted-foreground">
                {now !== null && now >= sale.start ? "Ends " : "Starts "}
                <EventTime timestamp={now !== null && now >= sale.start ? sale.end : sale.start} />
              </span>
            </li>
          ))}
        </ul>
        <a
          className="mt-2 inline-block text-sm text-primary hover:underline"
          href="https://api.hypixel.net/v2/resources/skyblock/fire_sale"
        >
          Hypixel Fire Sale feed
        </a>
      </Panel>
    </div>
  );
}
