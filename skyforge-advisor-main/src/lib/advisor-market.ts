import { MP_BY_RARITY } from "./accessory-data";
import type { TailoredAction } from "./advisor-engine";
import type { PlayerDataValidated } from "./schemas";
import { formatFull } from "./skyblock";
import { getHotmTier } from "./hotm-engine";
import {
  ARTISANAL_SHORTBOW_ID,
  isOwnedMeleeWeapon,
  readDisplayedCombatStats,
} from "./damage-simulator";
import type { InventoryItem } from "./skyblock";
import type { WikiAuctionQuote } from "./wiki-auction";

export const RED_CLAW_ARTIFACT_ID = "RED_CLAW_ARTIFACT";
export const JUNGLE_AMULET_ID = "JUNGLE_AMULET";
export const LIVID_DAGGER_ID = "LIVID_DAGGER";
export const ASPECT_OF_THE_DRAGON_ID = "ASPECT_OF_THE_DRAGON";
export const UNSTABLE_DRAGON_BOOTS_ID = "UNSTABLE_DRAGON_BOOTS";

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
  return `${formatFull(quote.price)} coins · lowest observed comparable BIN from ${quote.comparableListings} listings. Your reported purse is ${formatFull(budget)} coins.`;
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

type CombatProfile = MarketProfile & Pick<PlayerDataValidated, "dungeons" | "skills">;

function isBaseCopy(item: InventoryItem) {
  return !(
    item.stars ||
    item.reforge ||
    item.hotPotatoBooks ||
    item.rarityUpgrades ||
    item.artOfWar ||
    item.woodSingularity ||
    item.abilityScrolls?.length ||
    [item.enchantments, item.gems, item.attributes].some(
      (entry) => entry && Object.keys(entry).length,
    )
  );
}

function readableInventory(player: MarketProfile) {
  return player.containers.find((container) => container.id === "inventory" && !container.locked);
}

function baseAspectInHotbar(player: MarketProfile) {
  const items = player.containers.flatMap((container) => container.items);
  const aspectId = "ASPECT_OF_THE_END";
  if (!readableInventory(player)?.items.some((item) => item.slot < 9 && item.id === aspectId))
    return false;
  return items.every((item) => {
    if (item.id !== aspectId && !isOwnedMeleeWeapon(item)) return true;
    const stats = readDisplayedCombatStats(item);
    return (
      item.id === aspectId &&
      item.rarity === "RARE" &&
      isBaseCopy(item) &&
      stats?.DAMAGE === 100 &&
      stats.STRENGTH === 100 &&
      (stats.CRIT_DAMAGE ?? 0) === 0
    );
  });
}

function combatLevel(player?: CombatProfile | null) {
  return player?.availability?.skillKeys.includes("COMBAT")
    ? player.skills.find((entry) => entry.key === "COMBAT")?.level
    : undefined;
}

export function lividDaggerBudget(
  player?: (MarketProfile & Pick<PlayerDataValidated, "dungeons">) | null,
): number | null {
  const budget = classicPurse(player);
  if (
    budget === null ||
    !player?.availability?.accessoryStorage ||
    !player.availability.dungeonCompletions ||
    !player.dungeons?.floors.some((floor) => floor.name === "Floor 5" && floor.completions > 0)
  )
    return null;

  return !player.containers.some((container) =>
    container.items.some((item) => item.id === LIVID_DAGGER_ID),
  ) && baseAspectInHotbar(player)
    ? budget
    : null;
}

export function aspectOfTheDragonsBudget(player?: CombatProfile | null) {
  const budget = classicPurse(player);
  return budget !== null &&
    player?.availability?.accessoryStorage &&
    (combatLevel(player) ?? -1) >= 18 &&
    !player.containers.some((container) =>
      container.items.some(
        (item) =>
          item.id === ASPECT_OF_THE_DRAGON_ID ||
          item.id === LIVID_DAGGER_ID ||
          item.id === "ASPECT_OF_THE_VOID",
      ),
    ) &&
    baseAspectInHotbar(player)
    ? budget
    : null;
}

export function recommendAspectOfTheDragons(
  budget: number | null,
  quote: WikiAuctionQuote | undefined,
  now: number,
): TailoredAction | null {
  const cost = affordableQuote(budget, quote, now);
  return cost
    ? {
        id: "buy-aspect-of-the-dragons",
        title: "Upgrade to Aspect of the Dragons",
        detail:
          "You meet Combat 18 and carry a base Aspect of the End. Look for a base Legendary Aspect of the Dragons for overworld melee.",
        benefit:
          "Adds 125 base weapon Damage at the same 100 Strength. Keep the Aspect of the End for teleporting.",
        cost,
        marketItemId: ASPECT_OF_THE_DRAGON_ID,
        simulatorWeaponId: ASPECT_OF_THE_DRAGON_ID,
      }
    : null;
}

export function unstableBootsBudget(player?: CombatProfile | null) {
  const budget = classicPurse(player);
  if (
    budget === null ||
    !player?.availability?.accessoryStorage ||
    !player.availability.containerIds.includes("armor") ||
    (combatLevel(player) ?? -1) < 16 ||
    player.containers.some((container) =>
      container.items.some(
        (item) =>
          item.id !== "END_BOOTS" &&
          (item.id.endsWith("_BOOTS") ||
            item.lore.some((line) => /\bBOOTS$/.test(line.replace(/§./g, "").trim()))),
      ),
    )
  )
    return null;
  const armor = player.containers.find(
    (container) => container.id === "armor" && !container.locked,
  );
  const boots = armor?.items.find((item) => item.id === "END_BOOTS" && item.rarity === "EPIC");
  const stats = boots && readDisplayedCombatStats(boots);
  return boots && isBaseCopy(boots) && stats?.HEALTH === 15 && stats.DEFENSE === 25 ? budget : null;
}

export function recommendUnstableBoots(
  budget: number | null,
  quote: WikiAuctionQuote | undefined,
  now: number,
): TailoredAction | null {
  const cost = affordableQuote(budget, quote, now);
  return cost
    ? {
        id: "buy-unstable-dragon-boots",
        title: "Compare Unstable Dragon Boots for combat",
        detail:
          "You meet Combat 16 and wear base Ender Boots. Compare unmodified Unstable Dragon Boots for overworld combat. Keep your Ender Boots for the End-specific bonuses and loadouts.",
        benefit:
          "Outside The End, the base swap adds 45 Health, 65 Defense, 5% Crit Chance and 15% Crit Damage.",
        cost,
        marketItemId: UNSTABLE_DRAGON_BOOTS_ID,
      }
    : null;
}

export function recommendStarterBow(player?: CombatProfile | null): TailoredAction | null {
  const level = combatLevel(player);
  const mode = player?.profiles.find(
    (profile) => profile.profileId === player.activeProfileId,
  )?.gameMode;
  if (
    !player?.availability?.accessoryStorage ||
    !readableInventory(player) ||
    level === undefined ||
    level < 4 ||
    level >= 12 ||
    (mode !== "Classic" && mode !== "Ironman") ||
    !player.availability.purse ||
    !Number.isFinite(player.purse) ||
    player.purse < 600 ||
    player.containers.some((container) =>
      container.items.some(
        (item) =>
          item.id.endsWith("_SHORTBOW") ||
          item.id === "TERMINATOR" ||
          item.lore.some((line) => /\b(?:SHORT)?BOW$/.test(line.replace(/§./g, "").trim())),
      ),
    )
  )
    return null;
  return {
    id: "buy-starter-bow",
    title: "Pick up an Artisanal Shortbow",
    detail:
      "You meet Combat 4. Visit the Weaponsmith in the Hub and buy the bow. Bring arrows to use it.",
    benefit: "Gives you an instant-firing ranged weapon for targets that accept arrows.",
    cost: "600 coins for the bow",
    simulatorWeaponId: ARTISANAL_SHORTBOW_ID,
  };
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
    simulatorWeaponId: LIVID_DAGGER_ID,
  };
}
