// src/lib/skyblockApi.ts
// Slothpixel proxy + normalization with server-safe fetch, retries and short caching.

const SKILL_KEYS = [
  { key: "combat", cap: 60 },
  { key: "mining", cap: 60 },
  { key: "farming", cap: 60 },
  { key: "fishing", cap: 50 },
  { key: "foraging", cap: 50 },
  { key: "enchanting", cap: 60 },
  { key: "alchemy", cap: 50 },
  { key: "taming", cap: 60 },
  { key: "carpentry", cap: 50 },
  { key: "runecrafting", cap: 25 },
  { key: "social", cap: 25 },
];

type CachedPayload = { ts: number; payload: any };
const CACHE: Map<string, CachedPayload> = new Map();
const CACHE_TTL = Number(process.env.SLOTHPIXEL_CACHE_TTL_MS || 30_000); // 30s default

async function safeFetchJson(url: string, attempts = 2) {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`slothpixel:${res.status}`);
      return await res.json();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, 200 * (i + 1)));
      }
    }
  }
  throw lastErr;
}

export async function getLiveSkyBlockData(username: string): Promise<any> {
  if (!username || typeof username !== "string") {
    return { error: "No username provided." };
  }

  const name = username.trim();
  if (!name) return { error: "No username provided." };
  if (name.length > 64) return { error: "Username too long." };

  const key = name.toLowerCase();
  const cached = CACHE.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.payload;

  try {
    const raw = await safeFetchJson(
      `https://api.slothpixel.me/api/skyblock/players/${encodeURIComponent(name)}`
    );

    if (!raw || !raw.skills) {
      const err = { error: `No active SkyBlock profile data found for ${name}.` };
      CACHE.set(key, { ts: Date.now(), payload: err });
      return err;
    }

    const skills = SKILL_KEYS.map(({ key: k, cap }) => {
      const s: any = raw.skills[k] || {};
      const level = Math.floor(Number(s.level || 0));
      const currentXp = Math.floor(Number(s.xp ?? s.currentXp ?? 0));
      const target = Math.floor(Number(s.nextXp ?? s.target ?? 0) || 0);
      const pct = target ? Math.min(100, Math.round((currentXp / target) * 100)) : 0;
      return {
        name: k.charAt(0).toUpperCase() + k.slice(1),
        key: `SKILL_${k.toUpperCase()}`,
        level,
        totalXp: Math.round(Number(s.totalXp ?? s.xp ?? 0)),
        currentXp,
        neededXp: target,
        pct: Number.isFinite(pct) ? pct : 0,
        maxed: level >= cap,
        cap,
      };
    });

    const payload = {
      username: name,
      profile: {
        username: name,
        profileName: raw.active_profile_name ?? raw.active_profile ?? "Standard",
        profileType: "Standard",
        skyblockLevel: Math.floor(Number(raw.stats?.skyblock_level || 0) / 100),
      },
      skills,
      totalCollectionTiers: Number(raw.collections_unlocked ?? 0),
      maxCollectionTiers: 484,
      collections: raw.collections ?? [],
      netWorth: {
        total: Math.floor(Number(raw.stats?.networth ?? raw.banking?.balance ?? 0)),
        soulbound: 0,
        purse: Math.floor(Number(raw.purse ?? 0)),
        bank:
          raw.banking && raw.banking.balance != null ? Math.floor(Number(raw.banking.balance)) : null,
        breakdown: [
          { label: "Purse", value: Math.floor(Number(raw.purse ?? 0)) },
          {
            label: "Bank",
            value: raw.banking && raw.banking.balance != null ? Math.floor(Number(raw.banking.balance)) : 0,
          },
        ],
        topAssets: raw.top_assets ?? [],
      },
      raw,
    };

    CACHE.set(key, { ts: Date.now(), payload });
    return payload;
  } catch (err) {
    console.error("SkyBlock API Fetch Error:", err);
    return { error: "Failed to connect to SkyBlock services. Please try again." };
  }
}