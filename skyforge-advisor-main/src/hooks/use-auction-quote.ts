import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchWikiAuctionQuote } from "@/lib/hypixel.functions";
import {
  wikiAuctionRarity,
  wikiAuctionVariants,
  type WikiAuctionVariant,
} from "@/lib/wiki-auction";

export function useAuctionQuote(
  itemId: string,
  enabled = true,
  variant: WikiAuctionVariant = "base",
) {
  const supported =
    Boolean(wikiAuctionRarity(itemId)) && wikiAuctionVariants(itemId).includes(variant);
  const query = useQuery({
    queryKey: ["wiki-auction-quote", itemId, variant],
    queryFn: () => fetchWikiAuctionQuote({ data: { itemId, variant } }),
    enabled: supported && enabled,
    staleTime: 30_000,
    refetchInterval: 30_000,
    retry: false,
  });
  const { data: quote, isError, refetch } = query;
  const validUntil = enabled && quote?.status === "quoted" ? quote.validUntil : null;
  const [expiredAt, setExpiredAt] = useState<number | null>(null);

  useEffect(() => {
    if (validUntil === null) return;
    const timer = setTimeout(
      () => {
        setExpiredAt(validUntil);
        void refetch({ cancelRefetch: false });
      },
      Math.max(0, validUntil - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [refetch, validUntil]);

  const expired = validUntil !== null && (expiredAt === validUntil || validUntil <= Date.now());
  return { supported, quote, isError, expired };
}
