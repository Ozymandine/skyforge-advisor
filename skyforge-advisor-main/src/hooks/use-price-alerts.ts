// src/hooks/use-price-alerts.ts
// Persisted price-threshold alert rules, evaluated against live Bazaar data.
// A rule fires when the item's buy price crosses the threshold in the chosen
// direction. Fired rules re-arm only when the price crosses back.

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchMyAlertRules, saveMyAlertRules } from "@/lib/hypixel.functions";
import { getClientId } from "@/lib/client-id";

export type PriceAlert = {
  id: string;
  itemId: string;
  itemName: string;
  /** "below" fires when price <= threshold, "above" when price >= threshold. */
  direction: "below" | "above";
  threshold: number;
};

const STORAGE_KEY = "price-alerts";

function read(): PriceAlert[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function usePriceAlerts() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const hydrated = useRef(false);

  useEffect(() => {
    const local = read();
    setAlerts(local);
    // Pull this browser's server-side rules (per-user in Supabase when
    // configured). Union with local so nothing is lost on first sync.
    void fetchMyAlertRules({ data: { ownerId: getClientId() } })
      .then((server) => {
        if (!hydrated.current && Array.isArray(server) && server.length) {
          hydrated.current = true;
          const seen = new Set(local.map((a) => a.id));
          const merged = [...local, ...server.filter((s) => !seen.has(s.id))];
          setAlerts(merged);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {
        // offline / unconfigured — local rules still work
      });
  }, []);

  // Mirror rules to this user's server-side slot so alerts keep firing while
  // the app is closed. Sends even when empty so delete-all propagates
  // (the old code skipped empty and left stale server rules behind).
  useEffect(() => {
    if (!hydrated.current && alerts.length === 0) return;
    const t = setTimeout(() => {
      void saveMyAlertRules({
        data: { ownerId: getClientId(), rules: alerts },
      }).catch(() => {
        // ignore — local rules remain authoritative
      });
    }, 800);
    return () => clearTimeout(t);
  }, [alerts]);

  const persist = useCallback((next: PriceAlert[]) => {
    setAlerts(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // In-memory fallback for private browsing.
    }
  }, []);

  const add = useCallback(
    (alert: Omit<PriceAlert, "id">) => {
      persist([...read(), { ...alert, id: `${alert.itemId}-${alert.direction}-${Date.now()}` }]);
    },
    [persist],
  );

  const remove = useCallback((id: string) => persist(read().filter((a) => a.id !== id)), [persist]);

  return { alerts, add, remove };
}

/**
 * Evaluate alerts against current prices.
 * Returns the alerts that should fire right now (crossed since last check).
 */
export function evaluateAlerts(
  alerts: PriceAlert[],
  prices: Map<string, number>,
  lastPrices: Map<string, number>,
): { alert: PriceAlert; price: number }[] {
  const fired: { alert: PriceAlert; price: number }[] = [];

  for (const alert of alerts) {
    const price = prices.get(alert.itemId);
    if (price === undefined) continue;

    const crossed =
      alert.direction === "below"
        ? price <= alert.threshold && (lastPrices.get(alert.itemId) ?? Infinity) > alert.threshold
        : price >= alert.threshold && (lastPrices.get(alert.itemId) ?? 0) < alert.threshold;

    if (crossed) fired.push({ alert, price });
  }

  return fired;
}
