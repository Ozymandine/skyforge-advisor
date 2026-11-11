import { useAuctionQuote } from "@/hooks/use-auction-quote";
import { MIN_COMPARABLE_LISTINGS } from "@/lib/wiki-auction";

export function WikiAuctionQuote({ itemId }: { itemId: string }) {
  const { supported, quote, isError, expired } = useAuctionQuote(itemId);

  let message: string | undefined;
  if (!supported) message = "Comparable BIN pricing is unavailable for this item type.";
  else if (isError || quote?.status === "unavailable")
    message = "The Auction House feed is unavailable.";
  else if (!quote) message = "Checking active BIN listings…";
  else if (quote.status === "stale") message = "The Auction House snapshot is stale.";
  else if (quote.status === "insufficient")
    message = `Too few comparable listings. A quote requires at least ${MIN_COMPARABLE_LISTINGS}.`;
  else if (quote.status === "unsupported")
    message = "Comparable BIN pricing is unavailable for this item type.";
  else if (expired) message = "The last quote expired. Waiting for a fresh sample.";

  const timestamp = quote && "lastUpdated" in quote ? new Date(quote.lastUpdated) : null;

  return (
    <div className="mt-3 space-y-1.5 rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-sm font-semibold">Auction House</p>
      <div role="status" className="space-y-1 text-xs text-muted-foreground">
        {message ? <p>{message}</p> : null}
        {!message && quote?.status === "quoted" ? (
          <>
            <p className="text-sm font-medium text-foreground">Lowest comparable BIN observed</p>
            <p className="text-base font-semibold tabular-nums text-foreground">
              {quote.price.toLocaleString("en-US")} coins per item
            </p>
            <p>Active asking price for one unmodified copy at base rarity.</p>
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
    </div>
  );
}
