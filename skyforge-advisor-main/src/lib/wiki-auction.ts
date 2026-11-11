export const WIKI_AUCTION_PAGES = 24;
export const MIN_COMPARABLE_LISTINGS = 3;
export const WIKI_AUCTION_MAX_AGE_MS = 5 * 60_000;

const supportedRarities = new Map([
  ["JUNGLE_AMULET", "UNCOMMON"],
  ["RED_CLAW_ARTIFACT", "EPIC"],
]);

export function wikiAuctionRarity(itemId: string): string | undefined {
  return supportedRarities.get(itemId);
}

const baseRarities = new Set(supportedRarities.values());
const baseTags = new Set(["HideFlags", "SkullOwner", "display", "ExtraAttributes"]);
const identityAttributes = new Set(["id", "uuid", "timestamp"]);

export function isWikiAuctionCandidate(auction: {
  bin: boolean;
  tier: string;
  category: string;
  starting_bid: number;
}): boolean {
  return (
    auction.bin === true &&
    auction.category === "accessories" &&
    baseRarities.has(auction.tier) &&
    Number.isSafeInteger(auction.starting_bid) &&
    auction.starting_bid > 0
  );
}

export function unmodifiedWikiAccessoryId(
  count: unknown,
  tag: Record<string, unknown> | null,
  extra: Record<string, unknown> | null,
): string | undefined {
  const id = extra?.["id"];
  if (
    typeof id === "string" &&
    wikiAuctionRarity(id) &&
    count === 1 &&
    tag &&
    Object.keys(tag).every((key) => baseTags.has(key)) &&
    extra &&
    Object.keys(extra).every((key) => identityAttributes.has(key))
  ) {
    return id;
  }
  return undefined;
}

export type ComparableListing = { price: number; endsAt: number };

type WikiAuctionCoverage = {
  lastUpdated: number;
  pagesScanned: number;
  totalPages: number;
  comparableListings: number;
};

export type WikiAuctionQuote =
  | { status: "unsupported" | "unavailable" }
  | ({ status: "stale" | "insufficient" } & WikiAuctionCoverage)
  | ({ status: "quoted"; price: number; validUntil: number } & WikiAuctionCoverage);

export function summarizeWikiAuctionQuote(
  snapshot: Omit<WikiAuctionCoverage, "comparableListings"> & { stale: boolean },
  listings: ComparableListing[],
  now: number,
): WikiAuctionQuote {
  const active = listings.filter((listing) => listing.endsAt > now);
  const { lastUpdated, pagesScanned, totalPages } = snapshot;
  const coverage = { lastUpdated, pagesScanned, totalPages, comparableListings: active.length };
  const staleAt = lastUpdated + WIKI_AUCTION_MAX_AGE_MS;
  if (snapshot.stale || staleAt <= now) return { ...coverage, status: "stale" };
  if (active.length < MIN_COMPARABLE_LISTINGS) return { ...coverage, status: "insufficient" };
  return {
    ...coverage,
    status: "quoted",
    price: Math.min(...active.map((listing) => listing.price)),
    validUntil: Math.min(staleAt, ...active.map((listing) => listing.endsAt)),
  };
}
