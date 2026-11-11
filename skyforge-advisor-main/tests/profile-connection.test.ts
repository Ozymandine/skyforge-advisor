import { afterEach, describe, expect, it, vi } from "vitest";
import { gzipSync } from "node:zlib";
import { getPlayerData } from "../src/lib/hypixel.server";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("username-only SkyBlock profiles", () => {
  it("reports missing app configuration before contacting upstream services", async () => {
    vi.stubEnv("HYPIXEL_API_KEY", "");
    const request = vi.fn();
    vi.stubGlobal("fetch", request);

    await expect(getPlayerData("Steve")).rejects.toThrow("has not been configured");
    expect(request).not.toHaveBeenCalled();
  });

  it("resolves a username and fetches the profile with the server credential", async () => {
    const key = "123e4567-e89b-12d3-a456-426614174000";
    const uuid = "123e4567e89b12d3a456426614174000";
    const profileId = "123e4567e89b12d3a456426614174001";
    vi.stubEnv("HYPIXEL_API_KEY", key);

    const request = vi.fn(async (input: string | URL, options?: RequestInit) => {
      const url = new URL(input);
      const headers = new Headers(options?.headers);
      if (url.hostname === "api.mojang.com") {
        expect(url.pathname).toBe("/users/profiles/minecraft/Steve");
        expect(headers.has("API-Key")).toBe(false);
        return Response.json({ id: uuid, name: "Steve" });
      }
      if (url.pathname === "/v2/skyblock/profiles") {
        expect(url.searchParams.get("uuid")).toBe(uuid);
        expect(headers.get("API-Key")).toBe(key);
        return Response.json({
          success: true,
          profiles: [
            {
              profile_id: profileId,
              cute_name: "Apple",
              selected: true,
              members: { [uuid]: {} },
            },
          ],
        });
      }
      return Response.json({ success: true });
    });
    vi.stubGlobal("fetch", request);

    const player = await getPlayerData("Steve");
    expect(player).toMatchObject({ username: "Steve", uuid, activeProfileId: profileId });
    expect(JSON.stringify(player)).not.toContain(key);
    expect(request).toHaveBeenCalledWith(
      expect.stringContaining("/v2/skyblock/profiles"),
      expect.anything(),
    );
  });

  it("requires readable storage and reports claimed Slayer levels separately from XP", async () => {
    const uuid = "123e4567e89b12d3a456426614174002";
    const profileId = "123e4567e89b12d3a456426614174003";
    const emptyContainer = {
      data: gzipSync(Buffer.from([10, 0, 0, 9, 0, 1, 105, 10, 0, 0, 0, 0, 0])).toString("base64"),
    };
    const incompleteContainer = { data: gzipSync(Buffer.from([10, 0, 0, 0])).toString("base64") };
    let completeStorage = false;
    vi.stubEnv("HYPIXEL_API_KEY", "123e4567-e89b-12d3-a456-426614174000");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL) => {
        const url = new URL(input);
        if (url.hostname === "api.mojang.com") return Response.json({ id: uuid, name: "Alex" });
        if (url.pathname !== "/v2/skyblock/profiles") return Response.json({ success: true });
        return Response.json({
          success: true,
          profiles: [
            {
              profile_id: profileId,
              cute_name: "Lime",
              selected: true,
              members: {
                [uuid]: {
                  inventory: {
                    inv_contents: emptyContainer,
                    ender_chest_contents: emptyContainer,
                    personal_vault_contents: emptyContainer,
                    bag_contents: { talisman_bag: emptyContainer },
                    backpack_icons: { 0: emptyContainer, 1: emptyContainer },
                    backpack_contents: completeStorage
                      ? { 0: emptyContainer, 1: emptyContainer }
                      : { 0: incompleteContainer },
                  },
                  ...(completeStorage ? { currencies: { coin_purse: 10_000_000 } } : {}),
                  slayer_bosses: {
                    wolf: { xp: 20_000, claimed_levels: { level_5: true, level_6: false } },
                  },
                },
              },
            },
          ],
        });
      }),
    );

    const player = await getPlayerData("Alex");
    expect(player.availability).toMatchObject({ accessoryStorage: false, purse: false });
    expect(player.availability?.containerIds).toContain("accessory-bag");
    expect(player.availability?.containerIds).not.toContain("backpack-0");
    expect(player.availability?.containerIds).not.toContain("backpack-1");
    expect(player.slayerOverview?.bosses.find((boss) => boss.id === "wolf")).toMatchObject({
      level: 6,
      claimedLevel: 5,
    });
    completeStorage = true;
    const complete = await getPlayerData("Alex", profileId);
    expect(complete?.availability).toMatchObject({ accessoryStorage: true, purse: true });
    expect(complete?.availability?.containerIds).toContain("backpack-1");
  });
});
