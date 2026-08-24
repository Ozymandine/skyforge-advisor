// src/components/flip-track-record.tsx
// Shared "how accurate have our flip suggestions been" panel, used by the
// Bazaar and Auction House pages. Data comes from the server-side flip log.

import { useQuery } from "@tanstack/react-query";
import { fetchFlipAccuracy } from "@/lib/hypixel.functions";

export function FlipTrackRecord() {
  const accuracyQuery = useQuery({
    queryKey: ["flip-accuracy"],
    queryFn: () => fetchFlipAccuracy(),
    staleTime: 5 * 60_000,
  });

  const accuracy = accuracyQuery.data;
  if (!accuracy || accuracy.resolved === 0) return null;

  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Flip suggestion track record
      </p>
      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs">
        <span>
          Win rate{" "}
          <span className="font-mono font-bold text-emerald-300">
            {accuracy.winRate?.toFixed(0)}%
          </span>{" "}
          <span className="text-muted-foreground">
            ({accuracy.wins}W / {accuracy.losses}L of {accuracy.resolved} resolved)
          </span>
        </span>
        <span>
          Avg actual margin{" "}
          <span
            className={`font-mono font-bold ${
              (accuracy.avgActualMarginPct ?? 0) >= 0 ? "text-emerald-300" : "text-red-300"
            }`}
          >
            {(accuracy.avgActualMarginPct ?? 0).toFixed(1)}%
          </span>{" "}
          <span className="text-muted-foreground">
            vs {(accuracy.avgExpectedMarginPct ?? 0).toFixed(1)}% predicted
          </span>
        </span>
      </div>
    </div>
  );
}
