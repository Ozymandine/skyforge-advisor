// src/lib/history.ts
// Local historical snapshots of the connected SkyBlock profile.
// Stored in localStorage (one snapshot per profile per day, capped at 90
// entries) so the Analytics page can show real trends over time without a
// backend. Snapshots are recorded automatically whenever live profile data
// loads.

export type ProfileSnapshot = {
  /** Epoch ms of the snapshot. */
  t: number;
  /** Purse + bank at snapshot time. */
  netWorth: number;
  skillAverage: number;
  totalSkillXp: number;
  fairySouls: number;
  collections: number;
};

const STORAGE_PREFIX = "sba.history.";
const MAX_SNAPSHOTS = 90;
const DAY_MS = 24 * 60 * 60 * 1000;

function storageKey(uuid: string, profileId: string): string {
  return `${STORAGE_PREFIX}${uuid}.${profileId || "active"}`;
}

function readSnapshots(key: string): ProfileSnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is ProfileSnapshot =>
        !!entry && typeof entry === "object" && typeof (entry as ProfileSnapshot).t === "number",
    );
  } catch {
    return [];
  }
}

function writeSnapshots(key: string, snapshots: ProfileSnapshot[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(snapshots.slice(-MAX_SNAPSHOTS)));
  } catch {
    // Storage full or unavailable — history is best-effort.
  }
}

/**
 * Record a daily snapshot for the profile. No-ops if a snapshot for today
 * already exists (the existing entry is refreshed with the latest values).
 */
/** Minimal shape needed to record a snapshot (structural, validation-friendly). */
export type SnapshotSource = {
  uuid: string;
  activeProfileId: string;
  purse: number;
  bank: number | null;
  skillAverage: number;
  totalSkillXp: number;
  fairySouls: number;
  collections: unknown[];
};

export function recordSnapshot(data: SnapshotSource): void {
  const key = storageKey(data.uuid, data.activeProfileId);
  const snapshots = readSnapshots(key);
  const now = Date.now();
  const todayStart = new Date().setHours(0, 0, 0, 0);

  const snapshot: ProfileSnapshot = {
    t: now,
    netWorth: data.purse + (data.bank ?? 0),
    skillAverage: data.skillAverage,
    totalSkillXp: data.totalSkillXp,
    fairySouls: data.fairySouls,
    collections: data.collections.length,
  };

  const todayIndex = snapshots.findIndex((s) => s.t >= todayStart);
  if (todayIndex >= 0) {
    snapshots[todayIndex] = snapshot;
  } else {
    snapshots.push(snapshot);
  }

  writeSnapshots(key, snapshots);
}

/** All recorded snapshots for a profile, oldest first. */
export function getHistory(uuid: string, profileId: string): ProfileSnapshot[] {
  return readSnapshots(storageKey(uuid, profileId));
}

/** Clear recorded history for a profile. */
export function clearHistory(uuid: string, profileId: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKey(uuid, profileId));
}

/** True when at least two snapshots exist so a trend can be drawn. */
export function hasTrend(history: ProfileSnapshot[]): boolean {
  return history.length >= 2;
}

/** Days since the oldest snapshot (minimum 1 when history exists). */
export function historySpanDays(history: ProfileSnapshot[]): number {
  if (history.length < 2) return 0;
  return Math.max(1, Math.round((history[history.length - 1]!.t - history[0]!.t) / DAY_MS));
}
