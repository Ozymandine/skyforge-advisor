import { ItemIcon } from "@/components/ui/item-icon";
import {
  Panel,
  RarityTag,
} from "@/components/layout/app-shell";
import { RenderMinecraftLore } from "@/lib/minecraft-text";
import { formatNumber } from "@/lib/skyblock";
import type {
  LiveItem,
  WikiAbility,
  WikiRecipe,
  WikiRequirement,
} from "@/lib/skyblock";
import type { ReactNode } from "react";

interface WikiItemDetailsProps {
  item?: LiveItem | null;
  price?: {
    buyPrice?: number;
    sellPrice?: number;
    buyMovingWeek?: number;
    sellMovingWeek?: number;
  } | null;
  auction?: {
    lowestBin?: number | null;
    averageBin?: number | null;
    activeAuctions?: number | null;
  } | null;
}

function formatStatName(stat: string): string {
  return stat
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatStatValue(value: unknown): string {
  if (typeof value !== "number") {
    return String(value ?? "—");
  }

  return Number.isInteger(value)
    ? formatNumber(value)
    : value.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      });
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-5">
      <h4 className="mb-2 text-sm font-semibold">
        {title}
      </h4>

      {children}
    </section>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex min-h-10 items-center justify-between gap-4 border-b border-white/5 py-2.5 last:border-b-0">
      <dt className="shrink-0 text-xs text-muted-foreground">
        {label}
      </dt>

      <dd className="min-w-0 truncate text-right text-xs font-semibold">
        {value}
      </dd>
    </div>
  );
}

function LoreBlock({
  text,
}: {
  text: string | string[];
}) {
  const lines = Array.isArray(text) ? text : [text];

  return (
    <div className="space-y-0.5">
      {lines.map((line, index) => (
        <p
          key={index}
          className="min-h-[1.25rem]"
        >
          <RenderMinecraftLore text={line} />
        </p>
      ))}
    </div>
  );
}

function AbilityCard({
  ability,
}: {
  ability: WikiAbility;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <h5 className="font-semibold">
          {ability.name || "Ability"}
        </h5>

        <div className="flex shrink-0 gap-2 text-[10px] text-muted-foreground">
          {ability.manaCost != null && (
            <span>
              {formatNumber(ability.manaCost)} Mana
            </span>
          )}

          {ability.cooldown != null && (
            <span>
              {ability.cooldown}s
            </span>
          )}
        </div>
      </div>

      {ability.description && (
        <div className="mt-2 text-xs leading-relaxed text-muted-foreground">
          <LoreBlock text={ability.description} />
        </div>
      )}
    </div>
  );
}

function RecipeSection({
  recipe,
}: {
  recipe: WikiRecipe;
}) {
  if (!recipe.ingredients?.length) {
    return null;
  }

  return (
    <Section title="Recipe">
      <div className="space-y-2">
        {recipe.ingredients.map((ingredient, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/10 px-3 py-2.5"
          >
            <div className="min-w-0">
              <div className="truncate text-xs font-medium">
                {ingredient.name}
              </div>

              <div className="truncate text-[10px] text-muted-foreground">
                {ingredient.id}
              </div>
            </div>

            <span className="shrink-0 text-xs font-semibold">
              ×{ingredient.amount}
            </span>
          </div>
        ))}

        {(recipe.craftingType ||
          recipe.outputAmount != null) && (
          <div className="mt-3 flex flex-wrap gap-3 border-t border-white/5 pt-3 text-[10px] text-muted-foreground">
            {recipe.craftingType && (
              <span>
                Crafting: {recipe.craftingType}
              </span>
            )}

            {recipe.outputAmount != null && (
              <span>
                Output: ×{recipe.outputAmount}
              </span>
            )}
          </div>
        )}
      </div>
    </Section>
  );
}

function RequirementsSection({
  requirements,
}: {
  requirements: WikiRequirement[];
}) {
  if (!requirements.length) {
    return null;
  }

  return (
    <Section title="Requirements">
      <div className="rounded-2xl border border-white/10 bg-black/20 px-4">
        {requirements.map((requirement, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-3 border-b border-white/5 py-2.5 last:border-b-0"
          >
            <span className="text-xs text-muted-foreground">
              {formatStatName(requirement.type)}
            </span>

            <span className="text-right text-xs font-semibold">
              {requirement.level != null
                ? "Level " + requirement.level
                : requirement.value ?? "Required"}
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}

function ListSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (!items.length) {
    return null;
  }

  return (
    <Section title={title}>
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <ul className="space-y-2">
          {items.map((value, index) => (
            <li
              key={index}
              className="flex gap-2 text-xs text-muted-foreground"
            >
              <span className="text-foreground">
                •
              </span>

              <span className="min-w-0">
                {value}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

export function WikiItemDetails({
  item,
  price,
  auction,
}: WikiItemDetailsProps) {
  if (!item) {
    return (
      <Panel>
        <h3 className="text-sm font-semibold">
          Item detail
        </h3>

        <p className="mt-4 text-sm text-muted-foreground">
          Pick an item to inspect it.
        </p>
      </Panel>
    );
  }

  const stats =
    item.stats &&
    typeof item.stats === "object"
      ? Object.entries(item.stats)
      : [];

  const abilities = Array.isArray(item.abilities)
    ? item.abilities
    : [];

  const requirements = Array.isArray(
    item.requirements,
  )
    ? item.requirements
    : [];

  const hasBazaar =
    !!price &&
    (price.buyPrice != null ||
      price.sellPrice != null ||
      price.buyMovingWeek != null ||
      price.sellMovingWeek != null);

  const hasAuction =
    !!auction &&
    (auction.lowestBin != null ||
      auction.averageBin != null ||
      auction.activeAuctions != null);

  return (
    <Panel className="h-fit">
      <div className="flex items-center gap-3">
        <ItemIcon
          id={item.id}
          name={item.name}
          className="size-14 shrink-0"
        />

        <div className="min-w-0">
          <h3 className="truncate text-xl font-semibold">
            {item.name}
          </h3>

          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <RarityTag rarity={item.rarity} />

            {item.category && (
              <span className="text-xs text-muted-foreground">
                {item.category}
              </span>
            )}
          </div>
        </div>
      </div>

      <Section title="Basic Information">
        <dl className="rounded-2xl border border-white/10 bg-black/20 px-4">
          <InfoRow
            label="Item ID"
            value={item.id}
          />

          {item.material && (
            <InfoRow
              label="Material"
              value={item.material}
            />
          )}

          {item.category && (
            <InfoRow
              label="Category"
              value={item.category}
            />
          )}

          <InfoRow
            label="NPC Sell"
            value={
              item.npcSell != null
                ? formatNumber(item.npcSell) + " coins"
                : "—"
            }
          />

          {item.museumValue != null && (
            <InfoRow
              label="Museum Value"
              value={
                formatNumber(item.museumValue) +
                " coins"
              }
            />
          )}
        </dl>
      </Section>

      {stats.length > 0 && (
        <Section title="Stats">
          <dl className="rounded-2xl border border-white/10 bg-black/20 px-4">
            {stats.map(([stat, value]) => (
              <InfoRow
                key={stat}
                label={formatStatName(stat)}
                value={formatStatValue(value)}
              />
            ))}
          </dl>
        </Section>
      )}

      {abilities.length > 0 && (
        <Section title="Abilities">
          <div className="space-y-3">
            {abilities.map((ability, index) => (
              <AbilityCard
                key={index}
                ability={ability}
              />
            ))}
          </div>
        </Section>
      )}

      {requirements.length > 0 && (
        <RequirementsSection
          requirements={requirements}
        />
      )}

      {item.recipe && (
        <RecipeSection recipe={item.recipe} />
      )}

      {item.obtainedFrom &&
        item.obtainedFrom.length > 0 && (
          <ListSection
            title="Obtained From"
            items={item.obtainedFrom}
          />
        )}

      {(item.collection ||
        item.minionSource ||
        item.npcSource ||
        (item.upgradePath &&
          item.upgradePath.length > 0)) && (
        <Section title="Progression">
          <dl className="rounded-2xl border border-white/10 bg-black/20 px-4">
            {item.collection && (
              <InfoRow
                label="Collection"
                value={item.collection}
              />
            )}

            {item.minionSource && (
              <InfoRow
                label="Minion"
                value={item.minionSource}
              />
            )}

            {item.npcSource && (
              <InfoRow
                label="NPC Source"
                value={item.npcSource}
              />
            )}

            {item.upgradePath &&
              item.upgradePath.length > 0 && (
                <InfoRow
                  label="Upgrade Path"
                  value={item.upgradePath.join(
                    " → ",
                  )}
                />
              )}
          </dl>
        </Section>
      )}

      {hasBazaar && price && (
        <Section title="Bazaar">
          <dl className="rounded-2xl border border-white/10 bg-black/20 px-4">
            {price.buyPrice != null && (
              <InfoRow
                label="Buy Price"
                value={
                  formatNumber(price.buyPrice) +
                  " coins"
                }
              />
            )}

            {price.sellPrice != null && (
              <InfoRow
                label="Sell Price"
                value={
                  formatNumber(price.sellPrice) +
                  " coins"
                }
              />
            )}

            {price.buyMovingWeek != null && (
              <InfoRow
                label="Buy Volume / Week"
                value={formatNumber(
                  price.buyMovingWeek,
                )}
              />
            )}

            {price.sellMovingWeek != null && (
              <InfoRow
                label="Sell Volume / Week"
                value={formatNumber(
                  price.sellMovingWeek,
                )}
              />
            )}
          </dl>
        </Section>
      )}

      {hasAuction && auction && (
        <Section title="Auction House">
          <dl className="rounded-2xl border border-white/10 bg-black/20 px-4">
            {auction.lowestBin != null && (
              <InfoRow
                label="Lowest BIN"
                value={
                  formatNumber(
                    auction.lowestBin,
                  ) + " coins"
                }
              />
            )}

            {auction.averageBin != null && (
              <InfoRow
                label="Average BIN"
                value={
                  formatNumber(
                    auction.averageBin,
                  ) + " coins"
                }
              />
            )}

            {auction.activeAuctions != null && (
              <InfoRow
                label="Active Auctions"
                value={formatNumber(
                  auction.activeAuctions,
                )}
              />
            )}
          </dl>
        </Section>
      )}

      {item.description && (
        <Section title="Lore & Description">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 font-mono text-xs leading-relaxed text-slate-100 shadow-xl backdrop-blur-sm">
            <LoreBlock
              text={item.description}
            />
          </div>
        </Section>
      )}

      {item.wikiUrl && (
        <div className="mt-5 border-t border-white/5 pt-4">
          <a
            href={item.wikiUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
          >
            View external wiki source
          </a>
        </div>
      )}
    </Panel>
  );
}