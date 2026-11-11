import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("market snapshots", () => {
  it("keeps negative spreads and preserves the upstream timestamp on failure", async () => {
    vi.resetModules();
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-11T18:00:00Z"));
    const timestamp = Date.now() - 5000;
    const fetchMock = vi.fn(async (url: string) => {
      if (url.endsWith("/skyblock/items")) return Response.json({ success: true, items: [] });
      return Response.json({
        success: true,
        lastUpdated: timestamp,
        products: {
          TEST_ITEM: {
            quick_status: {
              buyPrice: 100,
              sellPrice: 99,
              buyVolume: 10,
              sellVolume: 10,
              buyMovingWeek: 10,
              sellMovingWeek: 10,
            },
          },
        },
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    const { getBazaar } = await import("../src/lib/hypixel.server");
    const fresh = await getBazaar();
    expect(fresh.lastUpdated).toBe(timestamp);
    expect(fresh.products[0]?.spread).toBe(-0.25);
    fetchMock.mockImplementation(async () => Response.json({ success: false }, { status: 503 }));
    vi.setSystemTime(Date.now() + 61_000);
    const stale = await getBazaar();
    expect(stale).toMatchObject({ lastUpdated: timestamp, stale: true, products: fresh.products });
  });

  it("excludes mixed-generation pages and never assigns profit to a bid", async () => {
    vi.resetModules();
    const timestamp = Date.now();
    const listing = {
      uuid: "bid",
      item_name: "Test item",
      tier: "COMMON",
      bin: false,
      starting_bid: 100,
      highest_bid_amount: 200,
      end: timestamp + 600_000,
      bids: [{}],
      category: "misc",
      item_lore: "",
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        const page = Number(new URL(url).searchParams.get("page"));
        return Response.json({
          success: true,
          page,
          totalPages: 2,
          totalAuctions: 3,
          lastUpdated: timestamp + page,
          auctions:
            page === 0
              ? [listing, { ...listing, uuid: "bin", bin: true, starting_bid: 900 }]
              : [{ ...listing, uuid: "different-generation" }],
        });
      }),
    );
    const { getAuctions } = await import("../src/lib/hypixel.server");
    const snapshot = await getAuctions(2);
    expect(snapshot).toMatchObject({ pagesScanned: 1, totalPages: 2, lastUpdated: timestamp });
    expect(snapshot.entries).toHaveLength(2);
    expect(snapshot.entries.find((entry) => entry.uuid === "bid")).toMatchObject({
      topBid: 200,
      profit: 0,
    });
  });
});
