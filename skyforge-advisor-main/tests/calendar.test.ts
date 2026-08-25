// tests/calendar.test.ts
// Unit test suite for SkyBlock Event Calendar, Jacob's 3-Crop Contest Predictor,
// Dark Auction scheduler, and Major Festival cycles.

import { describe, expect, it } from "vitest";
import {
  getSkyBlockDate,
  getJacobContests,
  getDarkAuctions,
  getMajorEvents,
  formatTimeRemaining,
  SKYBLOCK_EPOCH,
  SB_DAY_MS,
  SB_MONTH_MS,
  SB_YEAR_MS,
} from "../src/lib/calendar";
import { DEFAULT_ALARM_SETTINGS, getAlarmSettings } from "../src/lib/audio-chimes";

describe("T1.16: getSkyBlockDate", () => {
  it("calculates Year 1 Month 1 Day 1 at epoch", () => {
    const date = getSkyBlockDate(SKYBLOCK_EPOCH);
    expect(date.year).toBe(1);
    expect(date.month).toBe(1);
    expect(date.monthName).toBe("Early Spring");
    expect(date.day).toBe(1);
  });

  it("calculates accurate SkyBlock year and month elapsed", () => {
    // 10 SB years later
    const futureTimestamp = SKYBLOCK_EPOCH + 10 * SB_YEAR_MS + 2 * SB_MONTH_MS + 5 * SB_DAY_MS;
    const date = getSkyBlockDate(futureTimestamp);
    expect(date.year).toBe(11);
    expect(date.month).toBe(3);
    expect(date.monthName).toBe("Late Spring");
    expect(date.day).toBe(6);
  });
});

describe("T1.16: getJacobContests (3-Crop Predictor)", () => {
  it("generates predictable 3 crops per contest", () => {
    const contests = getJacobContests(Date.now(), 5);
    expect(contests).toHaveLength(5);

    for (const contest of contests) {
      expect(contest.crops).toHaveLength(3);
      expect(contest.crops[0]?.name).toBeDefined();
      expect(contest.crops[1]?.name).toBeDefined();
      expect(contest.crops[2]?.name).toBeDefined();
      expect(contest.durationMinutes).toBe(20);
      expect(contest.startTime).toBeLessThan(contest.endTime);
    }
  });

  it("assigns distinct crops in a single contest", () => {
    const contests = getJacobContests(Date.now(), 3);
    for (const contest of contests) {
      const cropIds = contest.crops.map((c) => c.id);
      const uniqueCropIds = new Set(cropIds);
      expect(uniqueCropIds.size).toBe(3);
    }
  });
});

describe("T1.17: getDarkAuctions", () => {
  it("schedules Dark Auctions regularly with featured loot", () => {
    const auctions = getDarkAuctions(Date.now(), 3);
    expect(auctions).toHaveLength(3);

    for (const da of auctions) {
      expect(da.featuredItems).toContain("Midas Staff");
      expect(da.featuredItems).toContain("Flower of Truth");
      expect(da.recommendedCoins).toBe(50_000_000);
      expect(da.timeRemainingMs).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("T1.18: getMajorEvents", () => {
  it("calculates major recurring festivals", () => {
    const events = getMajorEvents(Date.now());
    expect(events.length).toBeGreaterThan(0);

    const eventNames = events.map((e) => e.name);
    expect(eventNames.some((n) => n.includes("Spooky Festival"))).toBe(true);
    expect(eventNames.some((n) => n.includes("Season of Jerry"))).toBe(true);
    expect(eventNames.some((n) => n.includes("New Year Celebration"))).toBe(true);
    expect(eventNames.some((n) => n.includes("Brood Mother"))).toBe(true);
    expect(eventNames.some((n) => n.includes("Magma Boss"))).toBe(true);
  });
});

describe("formatTimeRemaining", () => {
  it("formats remaining milliseconds into readable time strings", () => {
    expect(formatTimeRemaining(0)).toBe("Active now");
    expect(formatTimeRemaining(-500)).toBe("Active now");
    expect(formatTimeRemaining(45 * 1000)).toBe("0m 45s");
    expect(formatTimeRemaining(12 * 60 * 1000 + 30 * 1000)).toBe("12m 30s");
    expect(formatTimeRemaining(2 * 3600 * 1000 + 15 * 60 * 1000)).toBe("2h 15m 00s");
    expect(formatTimeRemaining(3 * 86400 * 1000 + 4 * 3600 * 1000)).toBe("3d 4h 0m");
  });
});

describe("T1.19: audio-chimes config", () => {
  it("provides default alarm settings", () => {
    const settings = getAlarmSettings();
    expect(settings.enabled).toBe(true);
    expect(settings.volume).toBeGreaterThan(0);
    expect(settings.alertMinutesBefore).toBe(5);
    expect(DEFAULT_ALARM_SETTINGS.chimeType).toBe("crystal");
  });
});
