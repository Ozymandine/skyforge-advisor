// src/lib/slayer.ts
// Complete Hypixel SkyBlock Slayer engine:
// Calculates boss levels (1–9), XP requirements, kills by tier, and permanent stat passives.

export type SlayerBossInfo = {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  currentXp: number;
  neededXp: number;
  totalKills: number;
  tierKills: Record<number, number>;
  unlockedPassives: string[];
};

export type SlayerPassives = {
  health: number;
  critDamage: number;
  speed: number;
  extraEffects: string[];
};

export type SlayerOverview = {
  totalXp: number;
  totalKills: number;
  bosses: SlayerBossInfo[];
  passives: SlayerPassives;
};

// ---------------------------------------------------------------------------
// SLAYER XP TABLES
// ---------------------------------------------------------------------------

export const STANDARD_SLAYER_XP = [
  5, // LVL 1
  15, // LVL 2
  200, // LVL 3
  1_000, // LVL 4
  5_000, // LVL 5
  20_000, // LVL 6
  100_000, // LVL 7
  400_000, // LVL 8
  1_000_000, // LVL 9
];

export const VAMPIRE_SLAYER_XP = [
  20, // LVL 1
  75, // LVL 2
  240, // LVL 3
  840, // LVL 4
  2400, // LVL 5
];

export function computeSlayerLevel(
  xp: number,
  isVampire = false,
): {
  level: number;
  maxLevel: number;
  neededXp: number;
} {
  const table = isVampire ? VAMPIRE_SLAYER_XP : STANDARD_SLAYER_XP;
  const maxLevel = table.length;
  let level = 0;

  for (let i = 0; i < table.length; i++) {
    if (xp >= table[i]!) {
      level = i + 1;
    } else {
      break;
    }
  }

  const neededXp = level < maxLevel ? table[level]! : 0;
  return { level, maxLevel, neededXp };
}

// ---------------------------------------------------------------------------
// PERMANENT STAT PASSIVES PER BOSS LEVEL
// ---------------------------------------------------------------------------

type StatBonus = {
  hp?: number;
  cd?: number;
  speed?: number;
  effect?: string;
};

const BOSS_PASSIVES: Record<string, Record<number, StatBonus>> = {
  zombie: {
    1: { hp: 2 },
    2: { hp: 2 },
    3: { hp: 3 },
    4: { hp: 3 },
    5: { hp: 4 },
    6: { hp: 4 },
    7: { hp: 5 },
    8: { hp: 5, effect: "+50% natural Health Regeneration" },
    9: { hp: 6 },
  },
  spider: {
    1: { cd: 1 },
    2: { cd: 1 },
    3: { cd: 1 },
    4: { cd: 1 },
    5: { cd: 2 },
    6: { cd: 2 },
    7: { cd: 2, effect: "+1% Combat Wisdom against Spiders" },
    8: { cd: 3 },
    9: { cd: 3 },
  },
  wolf: {
    1: { hp: 2, speed: 1 },
    2: { hp: 2 },
    3: { hp: 3 },
    4: { hp: 3 },
    5: { hp: 4, cd: 1 },
    6: { hp: 4 },
    7: { hp: 5, cd: 1 },
    8: { hp: 5, effect: "+50 Health when near wolves" },
    9: { hp: 5, cd: 1 },
  },
  enderman: {
    1: { hp: 1 },
    2: { hp: 2 },
    3: { hp: 3 },
    4: { hp: 4 },
    5: { hp: 5 },
    6: { hp: 6 },
    7: { hp: 7 },
    8: { hp: 8 },
    9: { hp: 9 },
  },
  blaze: {
    1: { hp: 3 },
    2: { hp: 3 },
    3: { hp: 4 },
    4: { hp: 4 },
    5: { hp: 5 },
    6: { hp: 5 },
    7: { hp: 6 },
    8: { hp: 6 },
    9: { hp: 7 },
  },
  vampire: {
    1: { hp: 1 },
    2: { hp: 2 },
    3: { hp: 2 },
    4: { hp: 3 },
    5: { hp: 4 },
  },
};

const BOSS_DISPLAY_NAMES: Record<string, string> = {
  zombie: "Revenant Horror",
  spider: "Tarantula Broodfather",
  wolf: "Sven Packmaster",
  enderman: "Voidgloom Seraph",
  blaze: "Inferno Demonlord",
  vampire: "Riftstalker Bloodfiend",
};

export function calculateSlayerOverview(
  slayerData:
    | Record<
        string,
        {
          xp?: number;
          boss_kills_tier?: Record<string, number>;
          claimed_levels?: Record<string, unknown>;
        }
      >
    | undefined,
): SlayerOverview {
  let totalXp = 0;
  let totalKills = 0;
  let health = 0;
  let critDamage = 0;
  let speed = 0;
  const extraEffects: string[] = [];

  const bossKeys = ["zombie", "spider", "wolf", "enderman", "blaze", "vampire"];
  const bosses: SlayerBossInfo[] = [];

  for (const key of bossKeys) {
    const raw = slayerData?.[key];
    const xp = Number(raw?.xp ?? 0);
    const isVamp = key === "vampire";
    const { level, maxLevel, neededXp } = computeSlayerLevel(xp, isVamp);

    totalXp += xp;

    const tierKills: Record<number, number> = {};
    let bossTotalKills = 0;
    for (const [tier, count] of Object.entries(raw?.boss_kills_tier ?? {})) {
      const numTier = Number(tier) + 1; // 0-indexed to 1-indexed (T1–T5)
      const kills = Number(count) || 0;
      tierKills[numTier] = kills;
      bossTotalKills += kills;
    }
    totalKills += bossTotalKills;

    // Calculate passives for this boss
    const unlockedPassives: string[] = [];
    const table = BOSS_PASSIVES[key] ?? {};
    for (let lvl = 1; lvl <= level; lvl++) {
      const bonus = table[lvl];
      if (bonus) {
        if (bonus.hp) {
          health += bonus.hp;
          unlockedPassives.push(`+${bonus.hp} HP (Level ${lvl})`);
        }
        if (bonus.cd) {
          critDamage += bonus.cd;
          unlockedPassives.push(`+${bonus.cd}% Crit Damage (Level ${lvl})`);
        }
        if (bonus.speed) {
          speed += bonus.speed;
          unlockedPassives.push(`+${bonus.speed} Speed (Level ${lvl})`);
        }
        if (bonus.effect) {
          extraEffects.push(bonus.effect);
          unlockedPassives.push(`${bonus.effect} (Level ${lvl})`);
        }
      }
    }

    bosses.push({
      id: key,
      name: BOSS_DISPLAY_NAMES[key] ?? key,
      level,
      maxLevel,
      currentXp: xp,
      neededXp,
      totalKills: bossTotalKills,
      tierKills,
      unlockedPassives,
    });
  }

  return {
    totalXp,
    totalKills,
    bosses,
    passives: {
      health,
      critDamage,
      speed,
      extraEffects,
    },
  };
}
