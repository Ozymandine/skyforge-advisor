// tests/calendar.test.ts
// Unit test suite for SkyBlock Event Calendar, Jacob's 3-Crop Contest Predictor,
// Dark Auction scheduler, and Major Festival cycles.

import { describe, expect, it } from "vitest";
import {
  getSkyBlockDate,
  getJacobContests,
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

describe("Jacob contest schedule", () => {
  it("ends the active window at :35 and does not predict crops", () => {
    const hour = Date.UTC(2026, 10, 11, 18);
    const active = getJacobContests(hour + 34 * 60_000, 1)[0]!;
    expect(active.status).toBe("active");
    expect(active.endTime - active.startTime).toBe(20 * 60_000);
    expect(active).not.toHaveProperty("crops");

    const next = getJacobContests(hour + 35 * 60_000, 1)[0]!;
    expect(next.status).toBe("upcoming");
    expect(next.startTime).toBe(hour + 75 * 60_000);
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
