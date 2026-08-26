// tests/hypixel-rank.test.ts
// Unit test suite for Hypixel rank parsing & Minecraft-authentic formatting.

import { describe, expect, it } from "vitest";
import { parseHypixelRank } from "../src/lib/hypixel-rank";

describe("Hypixel Rank Parsing & Formatting", () => {
  it("parses MVP++ (SUPERSTAR) with custom plus color", () => {
    const rank = parseHypixelRank({
      monthlyPackageRank: "SUPERSTAR",
      rankPlusColor: "GOLD",
    });

    expect(rank.name).toBe("SUPERSTAR");
    expect(rank.tag).toBe("MVP++");
    expect(rank.plusColor).toBe("#FFAA00"); // GOLD
  });

  it("parses MVP+ with custom plus color", () => {
    const rank = parseHypixelRank({
      newPackageRank: "MVP_PLUS",
      rankPlusColor: "BLACK",
    });

    expect(rank.name).toBe("MVP_PLUS");
    expect(rank.tag).toBe("MVP+");
    expect(rank.plusColor).toBe("#000000"); // BLACK
  });

  it("parses VIP+ and VIP ranks", () => {
    const vipPlus = parseHypixelRank({ packageRank: "VIP_PLUS" });
    expect(vipPlus.name).toBe("VIP_PLUS");
    expect(vipPlus.tag).toBe("VIP+");

    const vip = parseHypixelRank({ packageRank: "VIP" });
    expect(vip.name).toBe("VIP");
    expect(vip.tag).toBe("VIP");
  });

  it("parses special staff & creator ranks (YOUTUBER, ADMIN, GM)", () => {
    const yt = parseHypixelRank({ rank: "YOUTUBER" });
    expect(yt.name).toBe("YOUTUBER");
    expect(yt.tag).toBe("YOUTUBE");

    const admin = parseHypixelRank({ rank: "ADMIN" });
    expect(admin.name).toBe("ADMIN");
    expect(admin.tag).toBe("ADMIN");

    const gm = parseHypixelRank({ rank: "GAME_MASTER" });
    expect(gm.name).toBe("GAME_MASTER");
    expect(gm.tag).toBe("GM");
  });

  it("defaults unranked players to NON", () => {
    const non = parseHypixelRank({});
    expect(non.name).toBe("NON");
    expect(non.tag).toBe("");
  });
});
