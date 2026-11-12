import { MP_BY_RARITY } from "./accessory-data";
import type { TailoredAction } from "./advisor-engine";
import type { PlayerDataValidated } from "./schemas";
import { formatFull } from "./skyblock";
import { getHotmTier } from "./hotm-engine";
import { isOwnedMeleeWeapon, readDisplayedCombatStats } from "./damage-simulator";
import type { WikiAuctionQuote } from "./wiki-auction";

export const RED_CLAW_ARTIFACT_ID = "RED_CLAW_ARTIFACT";
export const JUNGLE_AMULET_ID = "JUNGLE_AMULET";
export const LIVID_DAGGER_ID = "LIVID_DAGGER";

type MarketProfile = Pick<
  PlayerDataValidated,
  "activeProfileId" | "availability" | "containers" | "profiles" | "purse" | "slayerOverview"
>;

function classicPurse(player?: MarketProfile | null): number | null {
  if (
    !player?.availability?.purse ||
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
  const budget = classicPurse(player);
  if (budget === null || !player?.availability?.accessoryStorage) return null;
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
  return needsJungleAmulet(player) ? classicPurse(player) : null;
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

type CombatProfile = MarketProfile & Pick<PlayerDataValidated, "dungeons">;

export function lividDaggerBudget(player?: CombatProfile | null): number | null {
  const budget = classicPurse(player);
  if (
    budget === null ||
    !player?.availability?.accessoryStorage ||
    !player.availability.dungeonCompletions ||
    !player.dungeons?.floors.some((floor) => floor.name === "Floor 5" && floor.completions > 0)
  )
    return null;

  const items = player.containers.flatMap((container) => container.items);
  const hotbar = player.containers.find(
    (container) => container.id === "inventory" && !container.locked,
  )?.items;
  const equippedCandidate = hotbar?.find(
    (item) => item.slot < 9 && item.id === "ASPECT_OF_THE_END",
  );
  if (!equippedCandidate) return null;
  if (items.some((item) => item.id === LIVID_DAGGER_ID)) return null;

  for (const item of items) {
    const sword = item.id === "ASPECT_OF_THE_END" || isOwnedMeleeWeapon(item);
    if (!sword) continue;
    const stats = readDisplayedCombatStats(item);
    if (
      item.id !== "ASPECT_OF_THE_END" ||
      item.rarity !== "RARE" ||
      !stats ||
      stats.DAMAGE !== 100 ||
      stats.STRENGTH !== 100 ||
      (stats.CRIT_DAMAGE ?? 0) !== 0 ||
      item.stars ||
      item.reforge ||
      item.hotPotatoBooks ||
      item.rarityUpgrades ||
      (item.enchantments && Object.keys(item.enchantments).length)
    )
      return null;
  }
  return budget;
}

export function recommendLividDagger(
  budget: number | null,
  quote: WikiAuctionQuote | undefined,
  now: number,
): TailoredAction | null {
  const cost = affordableQuote(budget, quote, now);
  if (!cost) return null;
  return {
    id: "compare-livid-dagger",
    title: "Compare Livid Dagger for critical hits",
    detail:
      "You have a recorded Floor 5 clear and a base Aspect of the End in your hotbar. Look for an unmodified Legendary Livid Dagger.",
    benefit:
      "Its base 210 Damage and 50% Crit Damage improve standard critical hits over the base Aspect of the End. Keep the Aspect for teleporting.",
    cost,
    marketItemId: LIVID_DAGGER_ID,
  };
}
