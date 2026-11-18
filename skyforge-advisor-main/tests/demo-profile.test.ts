import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/lib/hypixel.functions", () => ({ fetchPlayer: vi.fn() }));

import { fetchPlayer } from "../src/lib/hypixel.functions";
import { playerQueryOptions } from "../src/hooks/use-account";
import { createDemoProfile, DEMO_PROFILE_ID, DEMO_USERNAME } from "../src/lib/demo-profile";
import { playerDataSchema } from "../src/lib/schemas";
import { recordSnapshot } from "../src/lib/history";
import { generateTailoredActionPlan } from "../src/lib/advisor-engine";
import {
  aspectOfTheDragonsBudget,
  lividDaggerBudget,
  unstableBootsBudget,
} from "../src/lib/advisor-market";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("explicit sample profile", () => {
  it("is deterministic, labelled, schema-valid, and computes totals from its skills", () => {
    const profile = createDemoProfile();
    expect(profile).toEqual(createDemoProfile());
    expect(playerDataSchema.safeParse(profile).success).toBe(true);
    expect(profile.source).toBe("demo");
    expect(profile.availability?.containerIds).toEqual(
      profile.containers.map((container) => container.id),
    );
    expect(profile.totalSkillXp).toBe(
      profile.skills.reduce((sum, skill) => sum + skill.totalXp, 0),
    );
    expect(profile.skillAverage).toBe(
      profile.skills.reduce((sum, skill) => sum + skill.level, 0) / profile.skills.length,
    );
    expect(
      profile.profiles.find((entry) => entry.profileId === profile.activeProfileId),
    ).toBeDefined();
  });

  it("uses the sample query only with both explicit demo identifiers", async () => {
    const demo = playerQueryOptions(DEMO_USERNAME, DEMO_PROFILE_ID);
    expect(await demo.queryFn()).toMatchObject({ source: "demo" });
    expect(fetchPlayer).not.toHaveBeenCalled();
    expect(demo.queryKey[0]).toBe("demo-player");

    for (const [username, profileId] of [
      [DEMO_USERNAME, ""],
      ["Steve", DEMO_PROFILE_ID],
      ["Steve", ""],
    ]) {
      vi.mocked(fetchPlayer).mockRejectedValueOnce(new Error("Profile feed unavailable"));
      const live = playerQueryOptions(username!, profileId!);
      await expect(live.queryFn()).rejects.toThrow("Profile feed unavailable");
      expect(live.queryKey[0]).toBe("player");
    }
    expect(fetchPlayer).toHaveBeenCalledTimes(3);
  });

  it("never records sample balances as real profile history", () => {
    const storage = { getItem: vi.fn(), setItem: vi.fn() };
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", storage);
    recordSnapshot(createDemoProfile());
    expect(storage.getItem).not.toHaveBeenCalled();
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("uses the normal progression rules and does not unlock an uncleared Floor 5 weapon", () => {
    const profile = createDemoProfile();
    expect(generateTailoredActionPlan(profile)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "dungeon-next-floor", title: "Run Floor 4" }),
        expect.objectContaining({ id: "next-skill-level" }),
      ]),
    );
    expect(aspectOfTheDragonsBudget(profile)).toBe(profile.purse);
    expect(unstableBootsBudget(profile)).toBe(profile.purse);
    expect(lividDaggerBudget(profile)).toBeNull();
  });
});
