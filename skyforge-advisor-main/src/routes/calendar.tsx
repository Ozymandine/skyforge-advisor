import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { PageHero, Panel } from "@/components/layout/app-shell";
import { Calendar as MonthGrid } from "@/components/ui/calendar";
import { ItemIcon } from "@/components/ui/item-icon";
import { fetchFireSaleSnapshot } from "@/lib/hypixel.functions";
import { getJacobContests, HYPIXEL_FIRE_SALES_URL, REAL_HOUR } from "@/lib/calendar";
import { titleCase } from "@/lib/skyblock";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "Calendar — SkyForge" }] }),
  component: Calendar,
});

function EventTime({ timestamp }: { timestamp: number }) {
  const date = new Date(timestamp);
  return (
    <time dateTime={date.toISOString()}>
      {date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", timeZoneName: "short" })}
    </time>
  );
}

function Calendar() {
  const [today, setToday] = useState<Date>();
  const [selected, setSelected] = useState<Date>();
  const [month, setMonth] = useState<Date>();
  useEffect(() => {
    const update = () => setToday(new Date());
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const sales = useQuery({
    queryKey: ["calendar-fire-sales"],
    queryFn: () => fetchFireSaleSnapshot(),
    staleTime: 5 * 60_000,
    refetchInterval: 5 * 60_000,
  });
  const day = selected ?? today;
  const start = day && new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
  const end = day && new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1).getTime();
  const published = sales.data?.sales ?? [];
  const daySales =
    start === undefined || end === undefined
      ? []
      : published
          .filter((sale) => sale.start < end && sale.end > start)
          .sort((a, b) => a.start - b.start);
  const contests =
    start === undefined || end === undefined
      ? []
      : getJacobContests(start, Math.ceil((end - start) / REAL_HOUR) + 1).filter(
          (contest) => contest.startTime < end && contest.endTime > start,
        );
  const hasSale = (date: Date) => {
    const from = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).getTime();
    return published.some((sale) => sale.start < to && sale.end > from);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHero title="Calendar" />
      {day && (
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)]">
          <Panel className="p-3 sm:p-5">
            <MonthGrid
              mode="single"
              required
              selected={day}
              onSelect={setSelected}
              month={month ?? day}
              onMonthChange={setMonth}
              {...(today ? { today } : {})}
              modifiers={{ fireSale: hasSale }}
              modifiersClassNames={{ fireSale: "calendar-fire-sale" }}
              className="mx-auto w-fit max-w-full rounded-xl bg-transparent p-0 [--cell-size:clamp(1.9rem,9vw,2.75rem)]"
            />
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-amber-500" /> Fire Sale
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelected(today);
                  setMonth(today);
                }}
                className="rounded-md border border-border px-2 py-1.5 text-foreground transition hover:bg-primary/10"
              >
                Today
              </button>
            </div>
          </Panel>
          <Panel key={start} className="animate-fade-slide-up space-y-5">
            <h2 className="text-xl font-semibold">
              {day.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
            </h2>
            <section>
              <h3 className="flex items-center gap-2 font-semibold">
                <img
                  src="/vanilla/wheat.png"
                  alt=""
                  width={22}
                  height={22}
                  className="[image-rendering:pixelated]"
                />
                Jacob’s Farming Contest
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Estimated local times. Check the in-game calendar for crops.
              </p>
              <ul className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3 xl:grid-cols-4">
                {contests.map((contest) => {
                  const active =
                    today &&
                    today.getTime() >= contest.startTime &&
                    today.getTime() < contest.endTime;
                  return (
                    <li
                      key={contest.id}
                      className={
                        "rounded-lg border border-border px-2 py-1.5 text-xs tabular-nums " +
                        (active
                          ? "bg-primary/20 font-bold text-foreground"
                          : "bg-background/25 text-muted-foreground")
                      }
                    >
                      <EventTime timestamp={contest.startTime} />
                    </li>
                  );
                })}
              </ul>
            </section>
            <section className="border-t border-border pt-4">
              <h3 className="flex items-center gap-2 font-semibold">
                <img
                  src="/vanilla/fire_charge.png"
                  alt=""
                  width={20}
                  height={20}
                  className="[image-rendering:pixelated]"
                />
                Fire Sales
              </h3>
              <p className="mt-2 text-sm text-muted-foreground" role="status">
                {sales.isPending
                  ? "Checking the Hypixel feed…"
                  : sales.isError || sales.data?.status === "unavailable"
                    ? "The Hypixel Fire Sale feed is unavailable."
                    : sales.data?.status === "stale"
                      ? "Showing the last available schedule."
                      : daySales.length === 0
                        ? "No published Fire Sales for this day."
                        : null}
              </p>
              <ul className="divide-y divide-border">
                {daySales.map((sale) => (
                  <li
                    key={sale.item_id + sale.start}
                    className="flex flex-wrap items-center gap-2 py-2 text-sm"
                  >
                    <ItemIcon
                      id={sale.item_id}
                      name={titleCase(sale.item_id)}
                      className="size-6 shrink-0"
                    />
                    <span className="flex-1 font-medium">{titleCase(sale.item_id)}</span>
                    <span className="text-xs text-muted-foreground">
                      {start !== undefined && sale.start < start ? (
                        "In progress at midnight"
                      ) : (
                        <EventTime timestamp={sale.start} />
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-primary">
              <a
                className="hover:underline"
                href="https://hypixel.net/threads/0-9-11-city-project-farm-merchants-dwelling.3502409/"
              >
                Hypixel contest schedule
              </a>
              <a className="hover:underline" href={HYPIXEL_FIRE_SALES_URL}>
                Hypixel Fire Sale feed
              </a>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
