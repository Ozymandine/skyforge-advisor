import { afterEach, describe, expect, it, vi } from "vitest";
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
});
