import { MP_BY_RARITY } from "./accessory-data";
import type { TailoredAction } from "./advisor-engine";
import type { PlayerDataValidated } from "./schemas";
import { formatFull } from "./skyblock";
import { getHotmTier } from "./hotm-engine";
import type { WikiAuctionQuote } from "./wiki-auction";

export const RED_CLAW_ARTIFACT_ID = "RED_CLAW_ARTIFACT";
export const JUNGLE_AMULET_ID = "JUNGLE_AMULET";

type MarketProfile = Pick<
  PlayerDataValidated,
  "activeProfileId" | "availability" | "containers" | "profiles" | "purse" | "slayerOverview"
>;

function spendablePurse(player?: MarketProfile | null): number | null {
  if (
    !player?.availability?.accessoryStorage ||
    !player.availability.purse ||
    !Number.isFinite(player.purse) ||
    player.purse <= 0 ||
    player.profiles.find((profile) => profile.profileId === player.activeProfileId)?.gameMode !==
      "Classic"
  ) {
    return null;
  }

  return player.purse;
}

export function redClawUpgradeBudget(player?: MarketProfile | null): number | null {
  const budget = spendablePurse(player);
  if (budget === null || !player) return null;
  const wolf = player.slayerOverview?.bosses.find((boss) => boss.id === "wolf");
  if ((wolf?.claimedLevel ?? 0) < 5) return null;

  const bag = player.containers.find((container) => container.id === "accessory-bag");
  const ring = bag?.items.find(
    (item) => item.id === "RED_CLAW_RING" && item.rarity === "RARE" && !item.reforge,
  );
  if (
    !ring ||
    player.containers.some((container) =>
      container.items.some(
        (item) =>
          item.id === RED_CLAW_ARTIFACT_ID ||
          (item.id === "RED_CLAW_RING" && item.rarity !== "RARE"),
      ),
    )
  ) {
    return null;
  }
  return budget;
}

function affordableQuote(budget: number | null, quote: WikiAuctionQuote | undefined, now: number) {
  if (
    budget === null ||
    quote?.status !== "quoted" ||
    quote.validUntil <= now ||
    quote.price > budget
  )
    return null;
  return `Lowest comparable BIN observed at ${formatFull(quote.price)} coins from ${quote.comparableListings} listings. Your reported purse is ${formatFull(budget)} coins. Check the current price in game before buying.`;
}

export function recommendRedClawUpgrade(
  budget: number | null,
  quote: WikiAuctionQuote | undefined,
  now: number,
): TailoredAction | null {
  const cost = affordableQuote(budget, quote, now);
  if (!cost) return null;
  const powerGain = MP_BY_RARITY.EPIC - MP_BY_RARITY.RARE;
  return {
    id: "upgrade-red-claw-ring",
    title: "Upgrade your Red Claw Ring",
    detail:
      "Look for an unmodified Epic Red Claw Artifact in the Auction House. You’ve claimed Wolf Slayer 5. Replace the Rare ring in your Accessory Bag with the artifact.",
    benefit: `Adds ${powerGain} Accessory Power when it replaces your Rare ring.`,
    cost,
    marketItemId: RED_CLAW_ARTIFACT_ID,
  };
}

type MiningProfile = MarketProfile & Pick<PlayerDataValidated, "skills" | "collections" | "hotm">;

function needsJungleAmulet(player?: MiningProfile | null): player is MiningProfile {
  return Boolean(
    player?.availability?.accessoryStorage &&
    player.collections.some(
      (collection) => collection.id === "GEMSTONE_COLLECTION" && collection.amount > 0,
    ) &&
    !player.containers.some((container) =>
      container.items.some((item) => item.id === JUNGLE_AMULET_ID),
    ),
  );
}

export function jungleAmuletBudget(player?: MiningProfile | null): number | null {
  return needsJungleAmulet(player) ? spendablePurse(player) : null;
}

export function recommendJungleAmulet(
  budget: number | null,
  quote: WikiAuctionQuote | undefined,
  now: number,
): TailoredAction | null {
  const cost = affordableQuote(budget, quote, now);
  if (!cost) return null;
  return {
    id: "buy-jungle-amulet",
    title: "Get a Jungle Amulet for gemstone mining",
    detail:
      "Your profile has progress in Gemstone Collection. Look for an unmodified Uncommon Jungle Amulet and equip it in your Accessory Bag.",
    benefit: "+10 Gemstone Fortune while mining gemstones.",
    cost,
    marketItemId: JUNGLE_AMULET_ID,
  };
}

export function recommendOdawaTrade(player?: MiningProfile | null): TailoredAction | null {
  if (!needsJungleAmulet(player)) return null;
  const mode = player.profiles.find(
    (profile) => profile.profileId === player.activeProfileId,
  )?.gameMode;
  const mining = player.skills.find((skill) => skill.key === "MINING");
  if (
    mode !== "Ironman" ||
    !mining ||
    mining.level < 12 ||
    !player.hotm ||
    getHotmTier(player.hotm.xp) < 4
  )
    return null;
  const inventory = player.containers.find(
    (container) => container.id === "inventory" && !container.locked,
  );
  const count = (id: string) =>
    inventory?.items
      .filter((item) => item.id === id && Number.isSafeInteger(item.count) && item.count > 0)
      .reduce((total, item) => total + item.count, 0) ?? 0;
  if (count("JUNGLE_HEART") < 4 || count("SLUDGE_JUICE") < 500) return null;
  return {
    id: "trade-jungle-amulet",
    title: "Trade with Odawa for a Jungle Amulet",
    detail:
      "Find Odawa in the Crystal Hollows Jungle and trade the materials in your inventory. You meet the Mining 12 and Heart of the Mountain 4 entry requirements.",
    benefit: "+10 Gemstone Fortune while mining gemstones.",
    cost: "4 Jungle Hearts and 500 Sludge Juice",
  };
}
