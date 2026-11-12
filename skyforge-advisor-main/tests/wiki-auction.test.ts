import { gzipSync } from "node:zlib";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const jungleId = "JUNGLE_AMULET";
const redClawId = "RED_CLAW_ARTIFACT";
const now = Date.parse("2026-11-11T18:00:00Z");

function nbtString(value: string) {
  const data = Buffer.from(value);
  const length = Buffer.alloc(2);
  length.writeUInt16BE(data.length);
  return Buffer.concat([length, data]);
}

function itemBytes(id: string, count = 1, attributes: string[] = [], weapon = false) {
  return gzipSync(
    Buffer.concat([
      Buffer.from([10, 0, 0, 9]), // Root compound and item list
      nbtString("i"),
      Buffer.from([10, 0, 0, 0, 1, 1]), // One compound, starting with a byte
      nbtString("Count"),
      Buffer.from([count, 10]),
      nbtString("tag"),
      ...(weapon ? [Buffer.from([1]), nbtString("Unbreakable"), Buffer.from([1])] : []),
      Buffer.from([10]),
      nbtString("ExtraAttributes"),
      Buffer.from([8]),
      nbtString("id"),
      nbtString(id),
      ...attributes.flatMap((key) => [Buffer.from([1]), nbtString(key), Buffer.from([1])]),
      Buffer.from([0, 0, 0, 0]), // End ExtraAttributes, tag, item and root
    ]),
  ).toString("base64");
}

function listing(uuid: string, price: number, overrides: Record<string, unknown> = {}) {
  return {
    uuid,
    bin: true,
    category: "accessories",
    tier: "UNCOMMON",
    item_name: "Jungle Amulet",
    item_bytes: { data: itemBytes(jungleId) },
    starting_bid: price,
    end: now + 600_000,
    ...overrides,
  };
}

function snapshotPage(page: number, auctions: unknown[], lastUpdated = now, totalPages = 1) {
  return Response.json({ success: true, page, totalPages, lastUpdated, auctions });
}

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(now);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Wiki active BIN quotes", () => {
  it("shares a scan and matches canonical single base variants from consistent pages only", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      const page = Number(new URL(url).searchParams.get("page"));
      if (page === 0) {
        return snapshotPage(
          page,
          [
            listing("match-a", 430),
            listing("match-b", 440, { item_name: "Different display name" }),
            listing("same-name-different-id", 1, { item_bytes: itemBytes("OTHER") }),
            listing("recombobulated", 1, {
              item_bytes: itemBytes(jungleId, 1, ["rarity_upgrades"]),
            }),
            listing("unknown", 1, { item_bytes: itemBytes(jungleId, 1, ["new_modifier"]) }),
            listing("enriched", 1, { item_bytes: itemBytes(jungleId, 1, ["talisman_enrichment"]) }),
            listing("wrong-rarity", 1, { tier: "EPIC" }),
            listing("stack", 1, { item_bytes: itemBytes(jungleId, 2) }),
            listing("no-nbt", 1, { item_bytes: undefined, item_id: jungleId }),
            listing("invalid-nbt", 1, { item_bytes: "!" }),
            listing("bid", 1, { bin: false }),
            listing("expired", 1, { end: now }),
            listing("invalid-price", 0),
          ],
          now,
          4,
        );
      }
      if (page === 1) {
        return snapshotPage(
          page,
          [
            listing("match-a", 1),
            listing("match-c", 400),
            listing("red-claw", 1, { tier: "EPIC", item_bytes: itemBytes(redClawId) }),
          ],
          now,
          4,
        );
      }
      if (page === 2) return snapshotPage(page, [listing("wrong-snapshot", 1)], now + 1, 4);
      return snapshotPage(1, [listing("wrong-page-number", 1)], now, 4);
    });
    vi.stubGlobal("fetch", fetchMock);
    const { getWikiAuctionQuote } = await import("../src/lib/hypixel.server");
    expect(await getWikiAuctionQuote("LOG_2")).toEqual({ status: "unsupported" });
    expect(fetchMock).not.toHaveBeenCalled();
    const [jungle, redClaw] = await Promise.all([
      getWikiAuctionQuote(jungleId),
      getWikiAuctionQuote(redClawId),
    ]);
    expect(jungle).toEqual({
      status: "quoted",
      price: 400,
      lastUpdated: now,
      pagesScanned: 2,
      totalPages: 4,
      comparableListings: 3,
      validUntil: now + 300_000,
    });
    expect(redClaw).toEqual({
      status: "insufficient",
      lastUpdated: now,
      pagesScanned: 2,
      totalPages: 4,
      comparableListings: 1,
    });
    expect(await getWikiAuctionQuote(jungleId)).toEqual(jungle);
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("rechecks listing expiry within a cached snapshot", async () => {
    const fetchMock = vi.fn(async () =>
      snapshotPage(0, [listing("a", 1, { end: now + 1000 }), listing("b", 2), listing("c", 3)]),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { getWikiAuctionQuote } = await import("../src/lib/hypixel.server");
    expect(await getWikiAuctionQuote(jungleId)).toMatchObject({
      status: "quoted",
      validUntil: now + 1000,
    });
    vi.setSystemTime(now + 1000);
    expect(await getWikiAuctionQuote(jungleId)).toEqual({
      status: "insufficient",
      comparableListings: 2,
      lastUpdated: now,
      pagesScanned: 1,
      totalPages: 1,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("compares base weapons while excluding altered copies and mismatched categories", async () => {
    const id = "ASPECT_OF_THE_END";
    const raw = { category: "weapon", tier: "RARE", item_bytes: itemBytes(id, 1, [], true) };
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        snapshotPage(0, [
          listing("base-one", 300, raw),
          listing("base-two", 320, raw),
          listing("base-three", 305, raw),
          listing("wrong-category", 1, { ...raw, category: "accessories" }),
          listing("enchanted", 1, { ...raw, item_bytes: itemBytes(id, 1, ["enchantments"], true) }),
          listing("starred", 1, { ...raw, item_bytes: itemBytes(id, 1, ["upgrade_level"], true) }),
        ]),
      ),
    );
    const { getWikiAuctionQuote } = await import("../src/lib/hypixel.server");
    expect(await getWikiAuctionQuote(id)).toMatchObject({
      status: "quoted",
      price: 300,
      comparableListings: 3,
    });
  });

  it("withholds prices after a failed refresh or when Hypixel's snapshot is old", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const rows = [listing("a", 1), listing("b", 2), listing("c", 3)];
    const fetchMock = vi.fn(async () => snapshotPage(0, rows));
    vi.stubGlobal("fetch", fetchMock);
    const { getWikiAuctionQuote } = await import("../src/lib/hypixel.server");
    expect(await getWikiAuctionQuote(jungleId)).toMatchObject({ status: "quoted" });
    vi.setSystemTime(now + 180_000);
    fetchMock.mockImplementation(async () => Response.json({ success: false }, { status: 503 }));
    const stale = {
      status: "stale",
      comparableListings: 3,
      lastUpdated: now,
      pagesScanned: 1,
      totalPages: 1,
    };
    expect(await getWikiAuctionQuote(jungleId)).toEqual(stale);
    vi.setSystemTime(now + 300_000);
    fetchMock.mockImplementation(async () => snapshotPage(0, rows));
    expect(await getWikiAuctionQuote(jungleId)).toEqual(stale);
  });

  it("reports a cold feed failure separately", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ success: false }, { status: 503 })),
    );
    const { getWikiAuctionQuote } = await import("../src/lib/hypixel.server");
    expect(await getWikiAuctionQuote(jungleId)).toEqual({ status: "unavailable" });
  });
});
