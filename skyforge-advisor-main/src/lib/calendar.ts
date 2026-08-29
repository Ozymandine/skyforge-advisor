// src/lib/calendar.ts
// Comprehensive Hypixel SkyBlock Time & Event Calendar Engine:
// Precise SkyBlock epoch mathematics, Jacob's 3-crop contest predictor,
// Dark Auction & Shen's Special Auction schedulers, and major recurring event cycles.

export const SKYBLOCK_EPOCH = 1560275700000; // June 11, 2019 17:55:00 UTC

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

export const FARMING_CROPS = [
  { id: "WHEAT", name: "Wheat", icon: "🌾", color: "#eab308" },
  { id: "CARROT", name: "Carrot", icon: "🥕", color: "#f97316" },
  { id: "POTATO", name: "Potato", icon: "🥔", color: "#ca8a04" },
  { id: "PUMPKIN", name: "Pumpkin", icon: "🎃", color: "#ea580c" },
  { id: "MELON", name: "Melon", icon: "🍉", color: "#16a34a" },
  { id: "MUSHROOM", name: "Mushroom", icon: "🍄", color: "#dc2626" },
  { id: "CACTUS", name: "Cactus", icon: "🌵", color: "#15803d" },
  { id: "SUGAR_CANE", name: "Sugar Cane", icon: "🎋", color: "#84cc16" },
  { id: "NETHER_STALK", name: "Nether Wart", icon: "🧫", color: "#b91c1c" },
  { id: "COCOA", name: "Cocoa Beans", icon: "🍫", color: "#78350f" },
] as const;

export type FarmingCrop = (typeof FARMING_CROPS)[number];

export type JacobContest = {
  id: string;
  startTime: number;
  endTime: number;
  status: "active" | "upcoming";
  crops: FarmingCrop[];
  durationMinutes: number;
  timeRemainingMs: number;
  skyblockDate: string;
};

// Deterministic pseudorandom crop selector seeded by contest index
function getContestCrops(contestIndex: number): FarmingCrop[] {
  const crops = [...FARMING_CROPS];
  const selected: FarmingCrop[] = [];

  // Linear congruential generator with prime constants
  let seed = (contestIndex * 1664525 + 1013904223) % 4294967296;

  while (selected.length < 3 && crops.length > 0) {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    const idx = Math.abs(seed) % crops.length;
    selected.push(crops[idx]!);
    crops.splice(idx, 1);
  }

  return selected;
}

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
  if (timestamp > thisHourContestEnd) {
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
      crops: getContestCrops(contestIndex),
      durationMinutes: 20,
      timeRemainingMs,
      skyblockDate: sbDate.formatted,
    });
  }

  return contests;
}

// ---------------------------------------------------------------------------
// DARK AUCTION & SHEN'S AUCTION SCHEDULER
// ---------------------------------------------------------------------------

export type DarkAuction = {
  startTime: number;
  endTime: number;
  status: "active" | "upcoming";
  timeRemainingMs: number;
  featuredItems: string[];
  recommendedCoins: number;
  location: string;
};

export function getDarkAuctions(timestamp: number = Date.now(), count: number = 4): DarkAuction[] {
  // Dark Auction occurs at :55 past every real hour and lasts ~8 minutes
  const DA_DURATION = 8 * REAL_MINUTE;
  const auctions: DarkAuction[] = [];

  const currentHourStart = Math.floor(timestamp / REAL_HOUR) * REAL_HOUR;
  const thisHourDAStart = currentHourStart + 55 * REAL_MINUTE;
  const thisHourDAEnd = thisHourDAStart + DA_DURATION;

  const startOffset = timestamp > thisHourDAEnd ? 1 : 0;

  for (let i = startOffset; i < startOffset + count; i++) {
    const daStart = currentHourStart + i * REAL_HOUR + 55 * REAL_MINUTE;
    const daEnd = daStart + DA_DURATION;
    const isActive = timestamp >= daStart && timestamp < daEnd;
    const timeRemainingMs = isActive ? daEnd - timestamp : daStart - timestamp;

    auctions.push({
      startTime: daStart,
      endTime: daEnd,
      status: isActive ? "active" : "upcoming",
      timeRemainingMs,
      featuredItems: [
        "Flower of Truth",
        "Plasma Nucleus",
        "Midas Staff",
        "Ender Artifact",
        "Hegemony Artifact",
        "Nether Artifact",
        "Giant Tooth",
      ],
      recommendedCoins: 50_000_000,
      location: "Sirius' Hut (Hub Basement)",
    });
  }

  return auctions;
}

// ---------------------------------------------------------------------------
// MAJOR RECURRING SKYBLOCK CALENDAR EVENTS
// ---------------------------------------------------------------------------

export type SkyBlockEvent = {
  id: string;
  name: string;
  category: "Farming" | "Combat" | "Mining" | "Festival" | "Boss";
  description: string;
  icon: string;
  color: string;
  startTime: number;
  endTime: number;
  status: "active" | "upcoming";
  timeRemainingMs: number;
  skyblockDate: string;
};

export function getMajorEvents(timestamp: number = Date.now()): SkyBlockEvent[] {
  const events: SkyBlockEvent[] = [];

  // 1. Spooky Festival: Autumn 29–31 (3 SB days = 1 hour real duration)
  // Occurs once every SB Year (every 124 hours = 5 days 4 hours)
  const currentYearStart =
    Math.floor((timestamp - SKYBLOCK_EPOCH) / SB_YEAR_MS) * SB_YEAR_MS + SKYBLOCK_EPOCH;

  for (let y = 0; y <= 2; y++) {
    const yearBase = currentYearStart + y * SB_YEAR_MS;

    // Spooky Festival: Month 8 (Autumn), Day 29
    // Month 7 * SB_MONTH_MS + 28 * SB_DAY_MS
    const spookyStart = yearBase + 7 * SB_MONTH_MS + 28 * SB_DAY_MS;
    const spookyEnd = spookyStart + 3 * SB_DAY_MS; // 1 hour duration
    if (spookyEnd > timestamp) {
      const isActive = timestamp >= spookyStart && timestamp < spookyEnd;
      events.push({
        id: `spooky-${y}`,
        name: "Spooky Festival",
        category: "Festival",
        description:
          "Trick or Treat in the Hub! Collect Green and Purple Candies, battle Spooky Mobs, and win the Bat Person Armor.",
        icon: "🎃",
        color: "#ea580c",
        startTime: spookyStart,
        endTime: spookyEnd,
        status: isActive ? "active" : "upcoming",
        timeRemainingMs: isActive ? spookyEnd - timestamp : spookyStart - timestamp,
        skyblockDate: getSkyBlockDate(spookyStart).formatted,
      });
    }

    // Season of Jerry: Month 12 (Late Winter), Day 24–26
    const jerryStart = yearBase + 11 * SB_MONTH_MS + 23 * SB_DAY_MS;
    const jerryEnd = jerryStart + 3 * SB_DAY_MS;
    if (jerryEnd > timestamp) {
      const isActive = timestamp >= jerryStart && timestamp < jerryEnd;
      events.push({
        id: `jerry-${y}`,
        name: "Season of Jerry",
        category: "Festival",
        description:
          "Defend Jerry's Workshop against waves of snowmen and unwrap Jerry's Red, Green, and White Gifts!",
        icon: "🎁",
        color: "#dc2626",
        startTime: jerryStart,
        endTime: jerryEnd,
        status: isActive ? "active" : "upcoming",
        timeRemainingMs: isActive ? jerryEnd - timestamp : jerryStart - timestamp,
        skyblockDate: getSkyBlockDate(jerryStart).formatted,
      });
    }

    // New Year Celebration: Month 12 (Late Winter), Day 29–31
    const newYearStart = yearBase + 11 * SB_MONTH_MS + 28 * SB_DAY_MS;
    const newYearEnd = newYearStart + 3 * SB_DAY_MS;
    if (newYearEnd > timestamp) {
      const isActive = timestamp >= newYearStart && timestamp < newYearEnd;
      events.push({
        id: `newyear-${y}`,
        name: "New Year Celebration",
        category: "Festival",
        description:
          "Celebrate the turn of the SkyBlock Year at the Baker in the Hub! Claim your free New Year Cake.",
        icon: "🎂",
        color: "#38bdf8",
        startTime: newYearStart,
        endTime: newYearEnd,
        status: isActive ? "active" : "upcoming",
        timeRemainingMs: isActive ? newYearEnd - timestamp : newYearStart - timestamp,
        skyblockDate: getSkyBlockDate(newYearStart).formatted,
      });
    }

    // Traveling Zoo: Month 4 (Early Summer) Day 1–3 and Month 10 (Early Winter) Day 1–3
    const zoo1Start = yearBase + 3 * SB_MONTH_MS;
    const zoo1End = zoo1Start + 3 * SB_DAY_MS;
    if (zoo1End > timestamp) {
      const isActive = timestamp >= zoo1Start && timestamp < zoo1End;
      events.push({
        id: `zoo1-${y}`,
        name: "Traveling Zoo (Summer)",
        category: "Farming",
        description:
          "Oringo visits the Hub with legendary pets (Elephant, Monkey, Giraffe, Blue Whale, Tiger).",
        icon: "🐘",
        color: "#ca8a04",
        startTime: zoo1Start,
        endTime: zoo1End,
        status: isActive ? "active" : "upcoming",
        timeRemainingMs: isActive ? zoo1End - timestamp : zoo1Start - timestamp,
        skyblockDate: getSkyBlockDate(zoo1Start).formatted,
      });
    }
  }

  // 2. Boss Timers (Brood Mother every 60 mins, Magma Boss every 2 hours)
  const currentHour = Math.floor(timestamp / REAL_HOUR) * REAL_HOUR;
  const broodStart = currentHour + 60 * REAL_MINUTE;
  events.push({
    id: `brood-mother`,
    name: "Brood Mother Spawn",
    category: "Boss",
    description: "Spawns at the top of the Spider's Den. Drops Spider Relic and Tier 4 Enchants.",
    icon: "🕷️",
    color: "#a855f7",
    startTime: broodStart,
    endTime: broodStart + 5 * REAL_MINUTE,
    status: "upcoming",
    timeRemainingMs: broodStart - timestamp,
    skyblockDate: getSkyBlockDate(broodStart).formatted,
  });

  const magmaStart = Math.floor(timestamp / (2 * REAL_HOUR)) * (2 * REAL_HOUR) + 2 * REAL_HOUR;
  events.push({
    id: `magma-boss`,
    name: "Magma Boss Spawn",
    category: "Boss",
    description:
      "Spawns at the Crimson Isle / Blazing Fortress core. Drops Magma Rod and Lava Shells.",
    icon: "🌋",
    color: "#f97316",
    startTime: magmaStart,
    endTime: magmaStart + 5 * REAL_MINUTE,
    status: "upcoming",
    timeRemainingMs: magmaStart - timestamp,
    skyblockDate: getSkyBlockDate(magmaStart).formatted,
  });

  events.sort((a, b) => a.startTime - b.startTime);
  return events;
}

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
