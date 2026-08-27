// tests/leaderboards.test.ts
import { describe, it, expect } from "vitest";
import {
  LEADERBOARD_SUBCATEGORIES,
  calculatePlayerLeaderboardStandings,
} from "@/lib/leaderboards";
import type { PlayerData } from "@/lib/skyblock";

describe("Leaderboards Engine", () => {
  it("includes the Potato War Hall of Fame honoring Technoblade", () => {
    const potatoSub = LEADERBOARD_SUBCATEGORIES.find((s) => s.id === "potato");
    expect(potatoSub).toBeDefined();
    expect(potatoSub?.topPlayers[0]?.username).toBe("Technoblade");
    expect(potatoSub?.topPlayers[0]?.value).toBe(500_000_000);
    expect(potatoSub?.topPlayers[1]?.username).toBe("Im_a_squid_kid");
  });

  it("accurately calculates elite percentile standings for high-stat players", () => {
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
      ],
      containers: [],
      slayerOverview: { totalXp: 12_000_000, bosses: [] },
      dungeons: { catacombsLevel: 45, secretsFound: 50000, classes: [], floors: [], masterMode: [] },
      fairySouls: 242,
    };

    const standings = calculatePlayerLeaderboardStandings(mockPlayer);
    expect(standings.length).toBeGreaterThan(0);

    const potatoStanding = standings.find((s) => s.subcategoryId === "potato");
    expect(potatoStanding).toBeDefined();
    expect(potatoStanding?.percentileRank).toContain("Top 0.01%");
    expect(potatoStanding?.badgeTone).toBe("emerald");

    const skillStanding = standings.find((s) => s.subcategoryId === "skill_average");
    expect(skillStanding).toBeDefined();
    expect(skillStanding?.percentileRank).toContain("Top 0.1%");
  });
});
