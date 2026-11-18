import { afterEach, describe, expect, it, vi } from "vitest";
import { parseHistoryPoints } from "../src/lib/coflnet-history";
import { formatCoins } from "../src/lib/market-format";

const now = Date.UTC(2026, 10, 18, 15);
const rows = [
  { time: "2026-11-17T00:00:00", avg: 1_250_000, volume: 40 },
  { time: "2026-11-16T00:00:00Z", avg: 1_200_000, volume: 35 },
];

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("Coflnet history normalization", () => {
  it("reads documented objects, treats unzoned dates as UTC, sorts, and deduplicates", () => {
    const result = parseHistoryPoints(
      [...rows, rows[0], { time: "bad", avg: 2 }, { time: rows[0]!.time, avg: -1 }],
      "auction",
    );
    expect(result).toEqual([
      { t: Date.UTC(2026, 10, 16), v: 1_200_000, volume: 35 },
      { t: Date.UTC(2026, 10, 17), v: 1_250_000, volume: 40 },
    ]);
    expect(parseHistoryPoints([[now, 100]], "auction")).toBeNull();
    expect(parseHistoryPoints({ error: "unavailable" }, "auction")).toBeNull();
    expect(parseHistoryPoints([], "auction")).toEqual([]);
  });

  it("keeps the two Bazaar quote sides distinct and does not invent missing volumes", () => {
    expect(
      parseHistoryPoints(
        [{ timestamp: "2026-11-17T00:00:00", buy: 8.25, sell: 4.5, buyVolume: 1000 }],
        "bazaar",
      ),
    ).toEqual([{ t: Date.UTC(2026, 10, 17), v: 8.25, sell: 4.5 }]);
    expect(parseHistoryPoints([{ timestamp: "2026-11-17T00:00:00", buy: 8 }], "bazaar")).toBeNull();
  });

  it("preserves fractional low-priced quotes rather than rounding them to zero", () => {
    expect(formatCoins(0.42)).toBe("0.42");
    expect(formatCoins(4.76)).toBe("4.76");
    expect(formatCoins(0.001)).toBe("<0.01");
    expect(formatCoins(-0.42)).toBe("-0.42");
    expect(formatCoins(NaN)).toBe("—");
  });
});

describe("Coflnet server cache and failure states", () => {
  async function setup() {
    vi.resetModules();
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(now);
    const request = vi.fn(async () => Response.json(rows));
    vi.stubGlobal("fetch", request);
    return {
      request,
      get: (await import("../src/lib/coflnet-history.server")).getExternalPriceHistory,
    };
  }

  it("shares in-flight and cached scans and uses the documented public URL", async () => {
    const { request, get } = await setup();
    const one = get("ASPECT_OF_THE_VOID", 30, "auction");
    const two = get("ASPECT_OF_THE_VOID", 30, "auction");
    expect(one).toBe(two);
    const result = await one;
    expect(result.status).toBe("ready");
    expect(result.points).toHaveLength(2);
    await get("ASPECT_OF_THE_VOID", 30, "auction");
    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0]?.[0]).toBe(
      "https://sky.coflnet.com/api/item/price/ASPECT_OF_THE_VOID/history/month",
    );
    await get("ASPECT_OF_THE_VOID", 90, "auction");
    expect(request.mock.calls[1]?.[0]).toBe(
      "https://sky.coflnet.com/api/item/price/ASPECT_OF_THE_VOID/history/full",
    );
  });

  it("retains successful samples and their original fetch date when the feed fails", async () => {
    const { request, get } = await setup();
    const good = await get("ASPECT_OF_THE_VOID", 30, "auction");
    vi.setSystemTime(now + 16 * 60_000);
    request.mockImplementation(async () => new Response("rate limited", { status: 429 }));
    expect(await get("ASPECT_OF_THE_VOID", 30, "auction")).toMatchObject({
      status: "stale",
      failure: "rate-limited",
      fetchedAt: good.fetchedAt,
      points: good.points,
    });
  });

  it("distinguishes access errors, malformed payloads, and genuinely insufficient samples", async () => {
    const { request, get } = await setup();
    request.mockImplementation(async () => new Response("restricted", { status: 403 }));
    expect(await get("RESTRICTED_ITEM", 30, "auction")).toMatchObject({
      status: "unavailable",
      failure: "restricted",
    });
    request.mockImplementation(async () => Response.json([[now, 500]]));
    expect(await get("BAD_ITEM", 30, "auction")).toMatchObject({
      status: "unavailable",
      failure: "invalid-response",
    });
    request.mockImplementation(async () => Response.json([]));
    expect(await get("EMPTY_ITEM", 30, "auction")).toMatchObject({ status: "empty", points: [] });
  });

  it("requests Bazaar history separately and filters future and out-of-window points", async () => {
    const { request, get } = await setup();
    request.mockImplementation(async () =>
      Response.json([
        { timestamp: "2026-10-01T00:00:00", buy: 8, sell: 4 },
        { timestamp: "2026-12-01T00:00:00", buy: 9, sell: 5 },
        { timestamp: "2026-11-17T00:00:00", buy: 8, sell: 4 },
        { timestamp: "2026-11-16T00:00:00", buy: 7, sell: 3 },
      ]),
    );
    const result = await get("COAL", 30, "bazaar");
    expect(result.points).toHaveLength(2);
    expect(result.market).toBe("bazaar");
    expect(request.mock.calls[0]?.[0]).toMatch(
      /^https:\/\/sky\.coflnet\.com\/api\/bazaar\/COAL\/history\?start=/,
    );
  });
});
