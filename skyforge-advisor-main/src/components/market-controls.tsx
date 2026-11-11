import type { ReactNode } from "react";

export const marketControl =
  "min-h-10 rounded-xl border border-input bg-background/55 px-3 py-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-ring";

export function MarketControls({
  query,
  onQuery,
  sort,
  onSort,
  sorts,
  children,
}: {
  query: string;
  onQuery: (value: string) => void;
  sort: string;
  onSort: (value: string) => void;
  sorts: readonly string[];
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="min-w-44 flex-1 text-sm">
        <span className="sr-only">Search items</span>
        <input
          className={marketControl + " w-full"}
          type="search"
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Search items…"
        />
      </label>
      <label className="text-sm">
        <span className="sr-only">Sort by</span>
        <select
          className={marketControl}
          value={sort}
          onChange={(event) => onSort(event.target.value)}
        >
          {sorts.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
      {children}
    </div>
  );
}

export function MarketFreshness({
  updated,
  stale,
}: {
  updated?: number | undefined;
  stale?: boolean | undefined;
}) {
  if (!updated) return null;
  return (
    <p className="text-sm text-muted-foreground">
      {stale ? "Cached snapshot · " : "Updated "}
      <time dateTime={new Date(updated).toISOString()}>
        {new Date(updated).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
      </time>
    </p>
  );
}
