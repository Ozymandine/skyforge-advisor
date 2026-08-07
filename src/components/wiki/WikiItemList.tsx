import { ItemIcon } from "@/components/ui/item-icon";
import { RarityTag } from "@/components/layout/app-shell";
import { cn } from "@/lib/utils";

interface WikiItem {
  id: string;
  name: string;
  rarity: string;
  category: string;
}

interface WikiItemListProps {
  items: WikiItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function WikiItemList({
  items,
  selectedId,
  onSelect,
}: WikiItemListProps) {
  return (
    <div className="mt-6 grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          className={cn(
            "glass-soft flex items-center gap-3 rounded-2xl px-4 py-3 text-left",
            "transition-all duration-75 ease-out",
            "hover:scale-[1.02] hover:border-primary/40 active:scale-95",
            selectedId === item.id &&
              "ring-2 ring-primary/40 bg-primary/10",
          )}
        >
          <ItemIcon
            id={item.id}
            name={item.name}
            className="size-8 shrink-0"
          />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {item.name}
            </p>

            <div className="mt-1.5 flex items-center gap-2">
              <RarityTag rarity={item.rarity} />

              <span className="truncate text-[10px] text-muted-foreground">
                {item.category}
              </span>
            </div>
          </div>
        </button>
      ))}

      {items.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground sm:col-span-2">
          No items match that search.
        </p>
      )}
    </div>
  );
}