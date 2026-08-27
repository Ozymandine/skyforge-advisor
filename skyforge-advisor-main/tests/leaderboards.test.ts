// tests/leaderboards.test.ts
import { describe, it, expect } from "vitest";
import {
  LEADERBOARD_SUBCATEGORIES,
  calculatePlayerLeaderboardStandings,
} from "@/lib/leaderboards";
import type { PlayerData } from "@/lib/skyblock";

describe("Leaderboards Engine", () => {
  it("includes all Elite SkyBlock collection categories mapped to real endpoints", () => {
    const diamondSub = LEADERBOARD_SUBCATEGORIES.find((s) => s.id === "diamond");
    expect(diamondSub).toBeDefined();
    expect(diamondSub?.eliteId).toBe("diamond");

    const potatoSub = LEADERBOARD_SUBCATEGORIES.find((s) => s.id === "potato");
    expect(potatoSub).toBeDefined();
    expect(potatoSub?.eliteId).toBe("potato");
  });

  it("accurately calculates player standings and exact numbers", () => {
    const mockPlayer: PlayerData = {
      uuid: "test-uuid",
      username: "ProGamer",
      activeProfileId: "prof-1",
      profiles: [],
      purse: 10_000_000_000,
      bank: 5_000_000_000,
      skillAverage: 55.5,
      totalSkillXp: 500_000_000,
      skills: [],
      collections: [
        {
          id: "POTATO_ITEM",
          name: "Potato",
          category: "Farming",
          amount: 60_000_000,
          tier: 12,
          maxTier: 12,
        },
        {
          id: "DIAMOND",
          name: "Diamond",
          category: "Mining",
          amount: 25_612,
          tier: 8,
          maxTier: 12,
        },
      ],
      containers: [],
      slayerOverview: { totalXp: 12_000_000, bosses: [] },
      dungeons: { catacombsLevel: 45, catacombsXp: 45_000_000, secretsFound: 50000, classes: [], floors: [], masterMode: [] },
      fairySouls: 242,
    };

    const standings = calculatePlayerLeaderboardStandings(mockPlayer);
    expect(standings.length).toBeGreaterThan(0);

    const potatoStanding = standings.find((s) => s.subcategoryId === "potato");
    expect(potatoStanding).toBeDefined();
    expect(potatoStanding?.formattedPlayerValue).toBe("60,000,000");

    const diamondStanding = standings.find((s) => s.subcategoryId === "diamond");
    expect(diamondStanding).toBeDefined();
    expect(diamondStanding?.formattedPlayerValue).toBe("25,612");
  });
});
