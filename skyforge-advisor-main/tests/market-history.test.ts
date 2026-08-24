// tests/market-history.test.ts
// Server-side market history store: sampling, throttling, reads, alerts.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Fresh module instance per test so module-level state doesn't leak.
async function freshStore() {
  vi.resetModules();
  return await import("../src/lib/market-history.server");
}

const HOUR = 60 * 60 * 1000;

function products(count: number, buyPrice = 100) {
  return Array.from({ length: count }, (_, i) => ({
    id: `ITEM_${i}`,
    buyPrice: buyPrice,
    sellPrice: buyPrice * 0.95,
    buyMovingWeek: count - i, // first items have highest volume
  }));
}

describe("market-history.server", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("records samples and throttles to the sample interval", async () => {
    const store = await freshStore();
    expect(store.recordMarketSample({ products: products(5) })).toBe(true);
    vi.advanceTimersByTime(1000);
    // Too soon — throttled.
    expect(store.recordMarketSample({ products: products(5) })).toBe(false);
    vi.advanceTimersByTime(6 * 60 * 1000);
    expect(store.recordMarketSample({ products: products(5) })).toBe(true);
  });

  it("returns history for sampled ids within a range", async () => {
    const store = await freshStore();
    store.recordMarketSample({ products: products(3) });
    vi.advanceTimersByTime(10 * 60 * 1000);
    store.recordMarketSample({ products: products(3, 200) });

    const history = store.getMarketHistory(["ITEM_0", "MISSING"], 24 * HOUR);
    expect(Object.keys(history)).toEqual(["ITEM_0"]);
    expect(history["ITEM_0"]).toHaveLength(2);
    expect(history["ITEM_0"]![0]!.b).toBe(100);
    expect(history["ITEM_0"]![1]!.b).toBe(200);

    // Range filtering excludes older points.
    vi.advanceTimersByTime(10 * 60 * 1000);
    store.recordMarketSample({ products: products(3, 300) });
    const short = store.getMarketHistory(["ITEM_0"], 5 * 60 * 1000);
    expect(short["ITEM_0"]).toHaveLength(1);
    expect(short["ITEM_0"]![0]!.b).toBe(300);
  });

  it("caps points per series and prunes old ones", async () => {
    const store = await freshStore();
    // Sample far more times than the cap.
    for (let i = 0; i < 12; i++) {
      store.recordMarketSample({ products: products(1, i * 10) });
      vi.advanceTimersByTime(6 * 60 * 1000);
    }
    const history = store.getMarketHistory(["ITEM_0"], 24 * HOUR);
    expect(history["ITEM_0"]!.length).toBeLessThanOrEqual(400);
    // Newest point is the most recent price.
    const points = history["ITEM_0"]!;
    expect(points[points.length - 1]!.b).toBe(110);
  });

  it("merges BIN samples into recent bazaar samples", async () => {
    const store = await freshStore();
    store.recordMarketSample({ products: products(2) });
    store.recordBinSample([{ id: "ITEM_0", lowestBin: 555 }]);

    const history = store.getMarketHistory(["ITEM_0"], 24 * HOUR);
    expect(history["ITEM_0"]![0]!.bin).toBe(555);
  });

  it("fires alert rules once per crossing, then re-arms", async () => {
    const store = await freshStore();
    store.saveAlertRules([
      {
        id: "r1",
        itemId: "ITEM_0",
        itemName: "Test Item",
        direction: "below",
        threshold: 50,
      },
    ]);

    // Above threshold — no fire.
    store.recordMarketSample({ products: products(1, 100) });
    expect(store.getNotifications()).toHaveLength(0);

    // Cross below — fires.
    vi.advanceTimersByTime(6 * 60 * 1000);
    store.recordMarketSample({ products: products(1, 40) });
    let notifications = store.getNotifications();
    expect(notifications).toHaveLength(1);
    expect(notifications[0]!.kind).toBe("price-alert");

    // Still below — no duplicate fire.
    vi.advanceTimersByTime(6 * 60 * 1000);
    store.recordMarketSample({ products: products(1, 30) });
    expect(store.getNotifications()).toHaveLength(1);

    // Cross back above — re-arms.
    vi.advanceTimersByTime(6 * 60 * 1000);
    store.recordMarketSample({ products: products(1, 100) });
    // Cross below again — fires a second time.
    vi.advanceTimersByTime(6 * 60 * 1000);
    store.recordMarketSample({ products: products(1, 20) });
    notifications = store.getNotifications();
    expect(notifications).toHaveLength(2);
  });

  it("scores flip suggestions against current prices", async () => {
    const store = await freshStore();
    store.recordMarketSample({ products: products(2, 100) });

    store.logFlipSuggestion({
      id: "f1",
      itemId: "ITEM_0",
      price: 100,
      expected: 120,
      kind: "bazaar",
    });
    store.logFlipSuggestion({
      id: "f2",
      itemId: "ITEM_1",
      price: 100,
      expected: 120,
      kind: "bazaar",
    });

    // Current prices: ITEM_0 sells at 150 (win), ITEM_1 at 50 (loss).
    const prices = new Map([
      ["ITEM_0", 150],
      ["ITEM_1", 50],
    ]);

    vi.advanceTimersByTime(15 * 60 * 1000); // older than minAge
    const accuracy = store.getFlipAccuracy(prices);
    expect(accuracy.resolved).toBe(2);
    expect(accuracy.wins).toBe(1);
    expect(accuracy.losses).toBe(1);
    expect(accuracy.winRate).toBeCloseTo(50);
    // ITEM_0: (150*0.9875 - 100)/100 = 48.1%; ITEM_1: (50*0.9875 - 100)/100 = -50.6%
    expect(accuracy.avgActualMarginPct).toBeCloseTo((48.125 + -50.625) / 2, 1);
  });

  it("ignores unresolved flips younger than the minimum age", async () => {
    const store = await freshStore();
    store.logFlipSuggestion({ id: "f1", itemId: "X", price: 10, expected: 20, kind: "ah" });
    const accuracy = store.getFlipAccuracy(new Map([["X", 30]]));
    expect(accuracy.resolved).toBe(0);
    expect(accuracy.winRate).toBeNull();
  });
});
