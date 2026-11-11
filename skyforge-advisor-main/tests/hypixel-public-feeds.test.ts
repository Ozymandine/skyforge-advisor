import { afterEach, describe, expect, it, vi } from "vitest";
import { HYPIXEL_FIRE_SALES_URL } from "../src/lib/calendar";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("Hypixel public event feeds", () => {
  it("reads News from the documented endpoint", async () => {
    vi.resetModules();
    const fetchMock = vi.fn(async () =>
      Response.json({
        success: true,
        items: [
          null,
          { title: "SkyBlock update", text: "Nov 11", link: "https://hypixel.net/threads/123/" },
          { title: "   " },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { getNews } = await import("../src/lib/hypixel.server");
    expect(await getNews()).toEqual([
      { title: "SkyBlock update", text: "Nov 11", link: "https://hypixel.net/threads/123/" },
    ]);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.hypixel.net/v2/skyblock/news",
      expect.anything(),
    );
  });

  it("distinguishes a valid empty Fire Sales schedule from an upstream failure", async () => {
    vi.resetModules();
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-11T18:00:00Z"));
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const unavailable = () => Response.json({ success: false }, { status: 503 });
    const fetchMock = vi.fn(async () => unavailable());
    vi.stubGlobal("fetch", fetchMock);
    const { getFireSaleSnapshot } = await import("../src/lib/hypixel.server");
    expect(await getFireSaleSnapshot()).toEqual({ sales: [], status: "unavailable" });
    fetchMock.mockImplementation(async () => Response.json({ success: true, sales: [] }));
    expect(await getFireSaleSnapshot()).toEqual({ sales: [], status: "fresh" });
    vi.setSystemTime(Date.now() + 31 * 60_000);
    fetchMock.mockImplementation(async () => unavailable());
    expect(await getFireSaleSnapshot()).toEqual({ sales: [], status: "stale" });
    expect(fetchMock).toHaveBeenCalledWith(HYPIXEL_FIRE_SALES_URL, expect.anything());
  });
});
