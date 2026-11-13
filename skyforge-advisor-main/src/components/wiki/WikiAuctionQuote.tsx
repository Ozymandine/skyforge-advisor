import { useAuctionQuote } from "@/hooks/use-auction-quote";
import { useState } from "react";
import {
  MIN_COMPARABLE_LISTINGS,
  wikiAuctionVariants,
  type WikiAuctionVariant,
} from "@/lib/wiki-auction";
import { Link } from "@tanstack/react-router";
import { titleCase } from "@/lib/skyblock";

export function WikiAuctionQuote({ itemId, name }: { itemId: string; name?: string }) {
  const variants = wikiAuctionVariants(itemId);
  const [selected, setSelected] = useState<WikiAuctionVariant>("base");
  const variant = variants.includes(selected) ? selected : "base";
  const { supported, quote, isError, expired } = useAuctionQuote(itemId, true, variant);
  const variantDescription =
    variant === "five-star"
      ? "Five stars at base rarity, with no other upgrades."
      : "Unmodified copy at base rarity.";

  let message: string | undefined;
  if (!supported) message = "Comparable BIN pricing is unavailable for this item type.";
  else if (isError || quote?.status === "unavailable")
    message = "The Auction House feed is unavailable.";
  else if (!quote) message = "Checking active BIN listings…";
  else if (quote.status === "stale") message = "The Auction House snapshot is stale.";
  else if (quote.status === "insufficient")
    message = `A quote requires at least ${MIN_COMPARABLE_LISTINGS} active BIN listings for this variant.`;
  else if (quote.status === "unsupported")
    message = "Comparable BIN pricing is unavailable for this item type.";
  else if (expired) message = "The last quote expired. Waiting for a fresh sample.";

  const timestamp = quote && "lastUpdated" in quote ? new Date(quote.lastUpdated) : null;

  return (
    <div className="mt-3 space-y-1.5 rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-sm font-semibold">Auction House</p>
      {variants.length > 1 && (
        <label className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          Item variant
          <select
            className="rounded-lg border border-border bg-background/75 px-2 py-1.5 text-foreground"
            value={variant}
            onChange={(event) =>
              setSelected(event.target.value === "five-star" ? "five-star" : "base")
            }
          >
            <option value="base">Unmodified</option>
            <option value="five-star">Five stars only</option>
          </select>
        </label>
      )}
      <div role="status" className="space-y-1 text-xs text-muted-foreground">
        {message ? <p>{message}</p> : null}
        {!message && quote?.status === "quoted" ? (
          <>
            <p className="text-sm font-medium text-foreground">Lowest comparable BIN observed</p>
            <p className="text-base font-semibold tabular-nums text-foreground">
              {quote.price.toLocaleString("en-US")} coins per item
            </p>
            <p>Active asking price for one item. {variantDescription}</p>
          </>
        ) : null}
        {quote && "pagesScanned" in quote && timestamp ? (
          <>
            <p>
              {quote.comparableListings} comparable{" "}
              {quote.comparableListings === 1 ? "listing" : "listings"}
              {" · "}
              {quote.pagesScanned} of {quote.totalPages} pages scanned
              {quote.pagesScanned < quote.totalPages ? " (partial scan)" : ""}
            </p>
            <p>
              Hypixel snapshot{" "}
              <time dateTime={timestamp.toISOString()}>
                {timestamp.toISOString().slice(0, 19).replace("T", " ")} UTC
              </time>
            </p>
          </>
        ) : null}
      </div>
      {supported && (
        <Link
          to="/auction-house"
          search={{ q: name ?? titleCase(itemId) }}
          className="inline-block text-xs font-medium text-primary hover:underline"
        >
          Search all variants in the Auction House
        </Link>
      )}
    </div>
  );
}
