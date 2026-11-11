// SkyBlock clock and estimated Jacob contest times.

export const SKYBLOCK_EPOCH = 1560275700000; // June 11, 2019 17:55:00 UTC
export const HYPIXEL_FIRE_SALES_URL = "https://api.hypixel.net/v2/skyblock/firesales";

// Real-world time constants
export const REAL_SECOND = 1_000;
export const REAL_MINUTE = 60 * REAL_SECOND;
export const REAL_HOUR = 60 * REAL_MINUTE;
export const REAL_DAY = 24 * REAL_HOUR;

// SkyBlock time constants
// 1 SB Day = 20 real minutes (1,200,000 ms)
// 1 SB Month = 31 SB Days = 620 real minutes = 10 hours 20 minutes (37,200,000 ms)
// 1 SB Year = 12 SB Months = 372 SB Days = 7,440 real minutes = 124 real hours = 5 days 4 hours (446,400,000 ms)
export const SB_DAY_MS = 20 * REAL_MINUTE;
export const SB_MONTH_DAYS = 31;
export const SB_MONTH_MS = SB_MONTH_DAYS * SB_DAY_MS;
export const SB_YEAR_MONTHS = 12;
export const SB_YEAR_DAYS = SB_MONTH_DAYS * SB_YEAR_MONTHS; // 372 days
export const SB_YEAR_MS = SB_YEAR_DAYS * SB_DAY_MS; // 446,400,000 ms

export const SB_MONTH_NAMES = [
  "Early Spring",
  "Spring",
  "Late Spring",
  "Early Summer",
  "Summer",
  "Late Summer",
  "Early Autumn",
  "Autumn",
  "Late Autumn",
  "Early Winter",
  "Winter",
  "Late Winter",
];

export type SkyBlockDate = {
  year: number;
  month: number;
  monthName: string;
  day: number;
  hour: number;
  minute: number;
  formatted: string;
  timeString: string;
};

export function getSkyBlockDate(timestamp: number = Date.now()): SkyBlockDate {
  const elapsed = Math.max(0, timestamp - SKYBLOCK_EPOCH);

  const year = Math.floor(elapsed / SB_YEAR_MS) + 1;
  const yearRemainder = elapsed % SB_YEAR_MS;

  const monthIdx = Math.floor(yearRemainder / SB_MONTH_MS);
  const monthRemainder = yearRemainder % SB_MONTH_MS;

  const day = Math.floor(monthRemainder / SB_DAY_MS) + 1;
  const dayRemainder = monthRemainder % SB_DAY_MS;

  // 1 SB Day = 24 SB Hours, 1 SB Hour = 50 real seconds = 50,000 ms
  const totalHours = (dayRemainder / SB_DAY_MS) * 24;
  const hour = Math.floor(totalHours);
  const minute = Math.floor((totalHours - hour) * 60);

  const monthName = SB_MONTH_NAMES[monthIdx] ?? "Spring";
  const ampm = hour >= 12 ? "pm" : "am";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const displayMinute = minute.toString().padStart(2, "0");
  const timeString = `${displayHour}:${displayMinute}${ampm}`;

  return {
    year,
    month: monthIdx + 1,
    monthName,
    day,
    hour,
    minute,
    formatted: `${monthName} ${day}, Year ${year}`,
    timeString,
  };
}

// ---------------------------------------------------------------------------
// JACOB'S FARMING CONTEST PREDICTOR
// ---------------------------------------------------------------------------

export type JacobContest = {
  id: string;
  startTime: number;
  endTime: number;
  status: "active" | "upcoming";
  durationMinutes: number;
  timeRemainingMs: number;
  skyblockDate: string;
};

export function getJacobContests(
  timestamp: number = Date.now(),
  count: number = 8,
): JacobContest[] {
  // Contests occur at :15 past every real hour and last 20 minutes (1,200,000 ms)
  const CONTEST_DURATION = 20 * REAL_MINUTE;
  const contests: JacobContest[] = [];

  // Find the base hour timestamp
  const currentHourStart = Math.floor(timestamp / REAL_HOUR) * REAL_HOUR;
  const thisHourContestStart = currentHourStart + 15 * REAL_MINUTE;
  const thisHourContestEnd = thisHourContestStart + CONTEST_DURATION;

  let startOffset = 0;
  if (timestamp >= thisHourContestEnd) {
    // Current contest ended, start from next hour
    startOffset = 1;
  } else {
    // Currently active or coming up this hour
    startOffset = 0;
  }

  for (let i = startOffset; i < startOffset + count; i++) {
    const contestStart = currentHourStart + i * REAL_HOUR + 15 * REAL_MINUTE;
    const contestEnd = contestStart + CONTEST_DURATION;
    const contestIndex = Math.floor(contestStart / REAL_HOUR);

    const isActive = timestamp >= contestStart && timestamp < contestEnd;
    const timeRemainingMs = isActive ? contestEnd - timestamp : contestStart - timestamp;
    const sbDate = getSkyBlockDate(contestStart);

    contests.push({
      id: `jacob-${contestIndex}`,
      startTime: contestStart,
      endTime: contestEnd,
      status: isActive ? "active" : "upcoming",
      durationMinutes: 20,
      timeRemainingMs,
      skyblockDate: sbDate.formatted,
    });
  }

  return contests;
}

// ---------------------------------------------------------------------------
export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return "Active now";
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds.toString().padStart(2, "0")}s`;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}
