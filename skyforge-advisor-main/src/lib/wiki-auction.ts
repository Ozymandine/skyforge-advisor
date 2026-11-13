export const WIKI_AUCTION_PAGES = 64;
export const MIN_COMPARABLE_LISTINGS = 3;
export const WIKI_AUCTION_MAX_AGE_MS = 5 * 60_000;

const variants = new Map(
  Object.entries({
    JUNGLE_AMULET: { rarity: "UNCOMMON", category: "accessories" },
    RED_CLAW_ARTIFACT: { rarity: "EPIC", category: "accessories" },
    GRAVITY_TALISMAN: { rarity: "UNCOMMON", category: "accessories" },
    FISH_AFFINITY_TALISMAN: { rarity: "RARE", category: "accessories" },
    ARTIFACT_POTION_AFFINITY: { rarity: "RARE", category: "accessories" },
    LUMBERJACK_ARTIFACT: { rarity: "RARE", category: "accessories" },
    ENDER_ARTIFACT: { rarity: "EPIC", category: "accessories" },
    ASPECT_OF_THE_END: { rarity: "RARE", category: "weapon" },
    ASPECT_OF_THE_DRAGON: { rarity: "LEGENDARY", category: "weapon" },
    ASPECT_OF_THE_VOID: { rarity: "EPIC", category: "weapon" },
    LIVID_DAGGER: { rarity: "LEGENDARY", category: "weapon" },
    UNSTABLE_DRAGON_BOOTS: { rarity: "LEGENDARY", category: "armor" },
  } satisfies Record<string, { rarity: string; category: "accessories" | "weapon" | "armor" }>),
);

export const WIKI_AUCTION_VARIANTS = ["base", "five-star"] as const;
export type WikiAuctionVariant = (typeof WIKI_AUCTION_VARIANTS)[number];

export function wikiAuctionVariants(itemId: string): readonly WikiAuctionVariant[] {
  return itemId === "LIVID_DAGGER" ? WIKI_AUCTION_VARIANTS : ["base"];
}

export function wikiAuctionRarity(itemId: string): string | undefined {
  return variants.get(itemId)?.rarity;
}

const candidateTypes = new Set(
  Array.from(variants.values(), ({ category, rarity }) => `${category}:${rarity}`),
);
const baseTags = new Set(["HideFlags", "SkullOwner", "display", "ExtraAttributes"]);
const identityAttributes = new Set(["id", "uuid", "timestamp"]);

export function matchesWikiAuctionVariant(itemId: string, tier: string, category: string): boolean {
  const variant = variants.get(itemId);
  return variant?.rarity === tier && variant.category === category;
}

export function isWikiAuctionCandidate(auction: {
  bin: boolean;
  tier: string;
  category: string;
  starting_bid: number;
}): boolean {
  return (
    auction.bin === true &&
    candidateTypes.has(`${auction.category}:${auction.tier}`) &&
    Number.isSafeInteger(auction.starting_bid) &&
    auction.starting_bid > 0
  );
}

const provenanceUuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

export function wikiListingIdentity(
  count: unknown,
  tag: Record<string, unknown> | null,
  extra: Record<string, unknown> | null,
): { itemId: string; variant: WikiAuctionVariant } | undefined {
  const id = extra?.["id"];
  const variant = typeof id === "string" ? variants.get(id) : undefined;
  if (
    typeof id !== "string" ||
    !variant ||
    count !== 1 ||
    !tag ||
    !extra ||
    !Object.keys(tag).every(
      (key) =>
        baseTags.has(key) ||
        (variant.category !== "accessories" && key === "Unbreakable" && tag[key] === 1),
    )
  )
    return undefined;

  const variantId: WikiAuctionVariant =
    id === "LIVID_DAGGER" && extra["upgrade_level"] === 5 ? "five-star" : "base";
  const hasOnlyKnownAttributes = Object.keys(extra).every(
    (key) =>
      identityAttributes.has(key) ||
      (variantId === "five-star" && key === "upgrade_level") ||
      (id === "ASPECT_OF_THE_DRAGON" &&
        (key === "bossId" || key === "spawnedFor") &&
        typeof extra[key] === "string" &&
        provenanceUuid.test(extra[key])),
  );
  return hasOnlyKnownAttributes ? { itemId: id, variant: variantId } : undefined;
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
