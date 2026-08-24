// src/hooks/use-price-alerts.ts
// Persisted price-threshold alert rules, evaluated against live Bazaar data.
// A rule fires when the item's buy price crosses the threshold in the chosen
// direction. Fired rules re-arm only when the price crosses back.

import { useCallback, useEffect, useState } from "react";
import { saveAlertRules } from "@/lib/hypixel.functions";

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

  useEffect(() => {
    setAlerts(read());
  }, []);

  // Mirror rules to the server so alerts keep firing while the app is closed
  // (the market history sampler evaluates them on every live fetch).
  useEffect(() => {
    if (alerts.length === 0) return;
    void saveAlertRules({ data: alerts });
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
