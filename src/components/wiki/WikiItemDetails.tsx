import { RenderMinecraftLore } from "@/lib/minecraft-text";
import { ItemIcon } from "@/components/ui/item-icon";
import { RarityTag, Panel } from "@/components/layout/app-shell";

interface WikiItemDetailsProps {
  item?: any;
  price?: any;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }

  if (typeof value === "number") {
    return value.toLocaleString();
  }

  return String(value);
}

export function WikiItemDetails({
  item,
  price,
}: WikiItemDetailsProps) {
  return (
    <Panel className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
      <p className="eyebrow">Item detail</p>

      {item ? (
        <>
          <div className="mt-3 flex items-center gap-3">
            <ItemIcon
              id={item.id}
              name={item.name}
              className="size-12 shrink-0"
            />

            <div className="min-w-0">
              <h3 className="truncate text-xl font-semibold">
                {item.name}
              </h3>

              <div className="mt-1.5 flex items-center gap-2">
                <RarityTag rarity={item.rarity} />
              </div>
            </div>
          </div>

          <dl className="mt-6 space-y-3 text-sm">
            {[
              ["Item ID", formatValue(item.id)],
              ["Category", formatValue(item.category)],
              ["NPC sell", formatValue(item.npcSell)],
              [
                "Bazaar buy",
                price ? formatValue(price.buyPrice) : "Not on Bazaar",
              ],
              [
                "Bazaar sell",
                price ? formatValue(price.sellPrice) : "—",
              ],
              [
                "Weekly volume",
                price ? formatValue(price.buyMovingWeek) : "—",
              ],
            ].map(([key, value]) => (
              <div
                key={key}
                className="flex justify-between gap-3 border-b border-white/10 pb-3"
              >
                <dt className="shrink-0 text-muted-foreground">
                  {key}
                </dt>

                <dd className="truncate font-mono text-xs font-semibold">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          {item.description && (
            <div className="mt-6">
              <p className="eyebrow mb-2">Lore & Description</p>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 font-mono text-xs leading-relaxed text-slate-100 shadow-xl backdrop-blur-sm">
                {Array.isArray(item.description) ? (
                  item.description.map(
                    (line: string, index: number) => (
                      <p
                        key={index}
                        className="min-h-[1.25rem] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                      >
                        <RenderMinecraftLore text={line} />
                      </p>
                    ),
                  )
                ) : (
                  <p className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                    <RenderMinecraftLore text={item.description} />
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          Pick an item to inspect it.
        </p>
      )}
    </Panel>
  );
}