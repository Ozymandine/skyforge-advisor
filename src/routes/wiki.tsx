import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { ErrorState, LoadState } from "@/components/data-states";
import { Panel } from "@/components/layout/app-shell";
import { WikiSearch } from "@/components/wiki/WikiSearch";
import { WikiItemList } from "@/components/wiki/WikiItemList";
import { WikiItemDetails } from "@/components/wiki/WikiItemDetails";
import { fetchBazaar, fetchItems } from "@/lib/hypixel.functions";

export const Route = createFileRoute("/wiki")({
  head: () => ({
    meta: [
      { title: "Wiki — SkyBlock Assistant" },
      {
        name: "description",
        content:
          "Searchable index of every SkyBlock item with rarity, category and live pricing.",
      },
      {
        property: "og:title",
        content: "Wiki — SkyBlock Assistant",
      },
      {
        property: "og:description",
        content:
          "Every SkyBlock item, straight from the Hypixel resources API.",
      },
    ],
  }),
  component: Wiki,
});

function Wiki() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const items = useQuery({
    queryKey: ["items"],
    queryFn: () => fetchItems(),
    staleTime: 30 * 60_000,
  });

  const bazaar = useQuery({
    queryKey: ["bazaar"],
    queryFn: () => fetchBazaar(),
    staleTime: 60_000,
  });

  const prices = useMemo(
    () => new Map((bazaar.data?.products ?? []).map((p) => [p.id, p])),
    [bazaar.data],
  );

  const categories = useMemo(() => {
    const set = new Set((items.data ?? []).map((i) => i.category));

    return ["All", ...[...set].sort()].slice(0, 14);
  }, [items.data]);

  const results = useMemo(() => {
    const q = query.toLowerCase();

    return (items.data ?? [])
      .filter((i) =>
        category === "All" ? true : i.category === category,
      )
      .filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q),
      )
      .slice(0, 60);
  }, [items.data, query, category]);

  const selected =
    (items.data ?? []).find((i) => i.id === selectedId) ?? results[0];

  const price = selected ? prices.get(selected.id) : undefined;

  if (items.isLoading) {
    return <LoadState>Loading the item database…</LoadState>;
  }

  if (items.error) {
    return <ErrorState error={items.error} />;
  }

  if (!items.data) {
    return null;
  }

  return (
    <div className="grid items-start gap-4 lg:grid-cols-3">
      <Panel className="lg:col-span-2">
        <WikiSearch
          query={query}
          onQueryChange={setQuery}
          categories={categories}
          category={category}
          onCategoryChange={setCategory}
          itemCount={items.data.length}
        />

        <WikiItemList
          items={results}
          selectedId={selected?.id ?? null}
          onSelect={setSelectedId}
        />
      </Panel>

      <WikiItemDetails
        item={selected}
        price={price}
      />
    </div>
  );
}