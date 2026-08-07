import { Search } from "lucide-react";
import { Chip } from "@/components/layout/app-shell";

interface WikiSearchProps {
  query: string;
  setQuery: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  categories: string[];
  itemCount: number;
  formatNumber: (value: number) => string;
}

export function WikiSearch({
  query,
  setQuery,
  category,
  setCategory,
  categories,
  itemCount,
  formatNumber,
}: WikiSearchProps) {
  return (
    <>
      <div className="flex items-center gap-2 rounded-xl border border-input bg-secondary/40 px-3 py-2 transition-all duration-75 hover:border-ring/40">
        <Search className="size-4 text-muted-foreground" />

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${itemCount.toLocaleString()} items...`}
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((c) => (
          <Chip
            key={c}
            active={category === c}
            onClick={() => setCategory(c)}
          >
            {c}
          </Chip>
        ))}
      </div>
    </>
  );
}