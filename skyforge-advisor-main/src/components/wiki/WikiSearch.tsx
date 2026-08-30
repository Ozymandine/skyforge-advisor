import { IconSearch } from "@/assets/icons";

import { Chip } from "@/components/layout/app-shell";

interface WikiSearchProps {
  query: string;
  onQueryChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
  itemCount: number;
}

export function WikiSearch({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  categories,
  itemCount,
}: WikiSearchProps) {
  return (
    <div className="space-y-3 border-b border-border/60 p-4">
      <div className="group flex items-center gap-3 rounded-xl border border-input bg-secondary/40 px-3 py-2.5 transition-colors duration-150 focus-within:border-ring/50 focus-within:bg-secondary/60 hover:border-ring/30">
        <IconSearch
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground transition-colors group-focus-within:text-foreground"
        />

        <input
          type="text"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={`Search ${itemCount.toLocaleString()} items...`}
          aria-label="Search Wiki items"
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1 overflow-x-auto">
          <div className="flex w-max gap-1.5 pb-1">
            {categories.map((itemCategory) => (
              <Chip
                key={itemCategory}
                active={category === itemCategory}
                onClick={() => onCategoryChange(itemCategory)}
              >
                {itemCategory}
              </Chip>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
