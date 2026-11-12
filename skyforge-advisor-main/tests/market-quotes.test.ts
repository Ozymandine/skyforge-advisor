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

  it("excludes mixed-generation pages and preserves actual bids", async () => {
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
    });
  });

  it("keeps a shared Bazaar timestamp on the Wiki and marks failed or old feeds stale", async () => {
    vi.resetModules();
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-11T18:00:00Z"));
    const timestamp = Date.now() - 10_000;
    let latest: number | null = timestamp;
    const fetchMock = vi.fn(async (url: string) => {
      if (url.endsWith("/resources/skyblock/items")) {
        return Response.json({ success: true, items: [{ id: "TEST_ITEM", name: "Test item" }] });
      }
      if (latest === null) return Response.json({ success: false }, { status: 503 });
      return Response.json({
        success: true,
        lastUpdated: latest,
        products: {
          TEST_ITEM: {
            quick_status: {
              buyPrice: 100,
              sellPrice: 99,
              buyVolume: 10,
              sellVolume: 10,
              buyMovingWeek: 10,
              sellMovingWeek: 10,
              buyOrders: 1,
              sellOrders: 1,
            },
          },
        },
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    const { getBazaar, getWikiItem } = await import("../src/lib/hypixel.server");
    const [board, wiki] = await Promise.all([getBazaar(), getWikiItem("TEST_ITEM")]);
    expect(board).toMatchObject({ lastUpdated: timestamp, stale: false });
    expect(wiki).toMatchObject({
      bazaar: { buyPrice: 100, sellPrice: 99 },
      bazaarUpdatedAt: timestamp,
      bazaarStale: false,
    });
    expect(fetchMock.mock.calls.filter(([url]) => url.endsWith("/skyblock/bazaar"))).toHaveLength(
      1,
    );

    vi.setSystemTime(Date.now() + 61_000);
    latest = null;
    expect(await getWikiItem("TEST_ITEM")).toMatchObject({
      bazaarUpdatedAt: timestamp,
      bazaarStale: true,
    });

    vi.setSystemTime(timestamp + 301_000);
    latest = timestamp;
    expect(await getBazaar()).toMatchObject({ lastUpdated: timestamp, stale: true });
    expect(await getWikiItem("TEST_ITEM")).toMatchObject({
      bazaarUpdatedAt: timestamp,
      bazaarStale: true,
    });
  });

  it("searches auction pages before truncating the soonest-ending listings", async () => {
    vi.resetModules();
    const now = Date.now();
    const listing = {
      tier: "RARE",
      bin: true,
      starting_bid: 100,
      highest_bid_amount: 0,
      bids: [],
      category: "weapon",
      item_lore: "",
    };
    const fetchMock = vi.fn(async (url: string) => {
      const page = Number(new URL(url).searchParams.get("page"));
      return Response.json({
        success: true,
        page,
        totalPages: 2,
        totalAuctions: 1_051,
        lastUpdated: now,
        auctions:
          page === 0
            ? Array.from({ length: 1_050 }, (_, index) => ({
                ...listing,
                uuid: `filler-${index}`,
                item_name: "Unrelated sword",
                end: now + 600_000 + index,
              }))
            : [
                {
                  ...listing,
                  uuid: "target",
                  item_name: "§9Spicy Aspect of the End",
                  end: now + 700_000,
                },
              ],
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    const { getAuctions } = await import("../src/lib/hypixel.server");
    const defaultBoard = await getAuctions(2);
    expect(defaultBoard.entries.some(({ uuid }) => uuid === "target")).toBe(false);
    const search = await getAuctions(2, "aspect of the end");
    expect(search.pagesScanned).toBe(2);
    expect(search.entries.map(({ uuid }) => uuid)).toEqual(["target"]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("retries a mostly mismatched auction snapshot without mixing generations", async () => {
    vi.resetModules();
    const timestamp = Date.now() - 5_000;
    let scans = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        const page = Number(new URL(url).searchParams.get("page"));
        if (page === 0) scans++;
        const generation = scans === 1 && page === 0 ? timestamp : timestamp + 1;
        return Response.json({
          success: true,
          page,
          totalPages: 8,
          totalAuctions: 8,
          lastUpdated: generation,
          auctions: [
            {
              uuid: `${generation}-${page}`,
              item_name: "Test Sword",
              category: "weapon",
              tier: "RARE",
              bin: true,
              starting_bid: 100,
              end: timestamp + 600_000,
            },
          ],
        });
      }),
    );
    const { getAuctions } = await import("../src/lib/hypixel.server");
    const snapshot = await getAuctions(8);
    expect(scans).toBe(2);
    expect(snapshot).toMatchObject({ pagesScanned: 8, lastUpdated: timestamp + 1 });
    expect(snapshot.entries).toHaveLength(8);
    expect(snapshot.entries.every(({ uuid }) => uuid.startsWith(`${timestamp + 1}-`))).toBe(true);
  });
});
