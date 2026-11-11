import { MP_BY_RARITY } from "./accessory-data";
import type { TailoredAction } from "./advisor-engine";
import type { PlayerDataValidated } from "./schemas";
import { formatFull } from "./skyblock";
import type { WikiAuctionQuote } from "./wiki-auction";

export const RED_CLAW_ARTIFACT_ID = "RED_CLAW_ARTIFACT";

type MarketProfile = Pick<
  PlayerDataValidated,
  "activeProfileId" | "availability" | "containers" | "profiles" | "purse" | "slayerOverview"
>;

export function redClawUpgradeBudget(player?: MarketProfile | null): number | null {
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
  return player.purse;
}

export function recommendRedClawUpgrade(
  budget: number | null,
  quote: WikiAuctionQuote | undefined,
  now: number,
): TailoredAction | null {
  if (
    budget === null ||
    quote?.status !== "quoted" ||
    quote.validUntil <= now ||
    quote.price > budget
  ) {
    return null;
  }
  const powerGain = MP_BY_RARITY.EPIC - MP_BY_RARITY.RARE;
  return {
    id: "upgrade-red-claw-ring",
    title: "Upgrade your Red Claw Ring",
    detail:
      "Look for an unmodified Epic Red Claw Artifact in the Auction House. You’ve claimed Wolf Slayer 5. Replace the Rare ring in your Accessory Bag with the artifact.",
    benefit: `Adds ${powerGain} Accessory Power when it replaces your Rare ring.`,
    cost: `Lowest comparable BIN observed at ${formatFull(quote.price)} coins from ${quote.comparableListings} listings. Your reported purse is ${formatFull(budget)} coins. Check the current price in game before buying.`,
    marketItemId: RED_CLAW_ARTIFACT_ID,
  };
}
