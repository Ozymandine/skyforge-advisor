# SkyForge Advisor

Hypixel SkyBlock analytics: live profile stats, market intelligence (Bazaar/AH
flips), a full item encyclopedia, crafting cost analysis, and progression
recommendations.

**Stack:** TanStack Start (SPA, React 19), Tailwind CSS 4, TanStack Query,
Cloudflare-ready via Nitro.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm run preview` | Production build / preview |
| `npm run check` | Typecheck + lint + tests (run before committing) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` / `test:watch` | Vitest |
| `npm run lint` / `format` | ESLint / Prettier |

## Data pipeline

All static item knowledge is derived from the
[NotEnoughUpdates repo](https://github.com/NotEnoughUpdates/NotEnoughUpdates-REPO)
— no gameplay data is hand-written or invented.

```
node scripts/generate-recipes.mjs      # recipes + per-item extras (see below)
node scripts/audit-item-data.mjs       # coverage report for the extras file
node scripts/generate-item-registry.mjs
node scripts/sync-wiki-icons.mjs
```

`generate-recipes.mjs` clones NEU (sparse) and writes:

- `src/lib/items/generated-recipes.json` — ingredient lists per craftable item
- `src/lib/items/generated-items-extra.json` — per item: crafting grid,
  canonical wiki URL, **lore, stats, requirements and abilities** (parsed from
  NEU tooltip text), used to enrich items that the Hypixel API no longer
  documents.

Re-run it whenever you want fresh game data; then run the audit script to see
coverage.

## Wiki Auction House quotes

The Wiki quotes single, unmodified copies of Jungle Amulet, Red Claw Artifact,
Gravity Talisman, Fish Affinity Talisman, Potion Affinity Artifact, Lumberjack
Artifact, Ender Artifact, Aspect of the End, Aspect of the Void, and Livid Dagger.
It matches the canonical item ID and stack count in the
listing's decoded NBT, requires base rarity, and excludes unknown item metadata
and modifiers. Each quote requires at least three active, unique BIN listings.

The Wiki shows the lowest asking price observed, listing count, Hypixel
snapshot timestamp, and matching pages scanned. It scans up to 24 pages from
one Hypixel snapshot and shares the cached scan across supported Wiki items
within each server instance. Prices are withheld when the feed fails, the
snapshot is over five minutes old, or fewer than three listings qualify.

Advisor can use the Red Claw Artifact quote for a Classic profile that has
claimed Wolf Slayer 5 and has a Rare Red Claw Ring without a reforge in its
Accessory Bag. It checks the reported purse and readable inventory, Accessory Bag, Ender
Chest, Personal Vault, and any reported backpacks before suggesting the
purchase. The advice is withheld if a Red Claw Artifact is already visible in
storage, the asking price exceeds the purse, or a required input is unavailable.
Gemstone miners can get a comparable Jungle Amulet quote or a verified Odawa
trade on Ironman. A Classic player with a recorded Floor 5 clear, a base
Aspect of the End in the hotbar, and enough reported coins can compare it with
a base Livid Dagger. Dungeon next steps use reported XP, recorded clears, and
published floor requirements.

Bazaar prices use Hypixel's indicative order quotes. The Wiki labels an older
or cached quote as stale and preserves Hypixel's original timestamp. Stale
quotes are excluded from alerts and new history samples.

## Damage Simulator and pet data

The simulator uses the Hypixel item catalog for sword, longsword, qualifying
axe, bow, and wand presets. It calculates standard overworld melee hits and
effective health. A readable owned weapon or equipped piece contributes its
displayed overworld stats. Other player bonuses can be entered manually.
The mob list records published health and applies mitigation when a defense
value is available or entered. Bow, ability, and dungeon mechanics require
separate damage models.

The pet catalog and XP curves come from the pinned MIT-licensed
[NotEnoughUpdates data](https://github.com/NotEnoughUpdates/NotEnoughUpdates-REPO).
Pet combat presets estimate base stats between the source's level endpoints.
Run `node scripts/generate-pet-catalog.mjs <NEU-commit-SHA>` to refresh the tables.

## Market history store

`src/lib/market-history.server.ts` records Bazaar quotes on every
live fetch (throttled to one sample / 5 min, 14-day retention) into
`.data/market-store.json`. It also evaluates price-alert rules server-side and
queues notifications.

- History/alerts survive across sessions and visitors.
- On read-only serverless filesystems it degrades to in-memory per isolate.
- **24/7 sampling:** ping `/cron-sample` (a hidden route) every few minutes
  from any uptime monitor or cron job — sampling is throttled internally, so
  frequent pings are harmless.

### Storage backend

| Env vars | Behavior |
| --- | --- |
| `CF_ACCOUNT_ID` + `CF_KV_NAMESPACE` + `CF_KV_TOKEN` | Persists to Cloudflare KV (recommended for production — survives isolate resets) |
| unset | Falls back to `.data/market-store.json` on disk (dev/preview) |

## Public API

- `GET /api/flips` — current Bazaar order spreads, the snapshot timestamp, and
  quote-based tracking. Spreads assume both orders fill at the observed
  prices and include the standard sell fee. Intended for mods and third-party
  tools.

## SEO

- SSR is enabled — landing, wiki and market pages render real HTML.
- Regenerate `public/sitemap.xml` after item-data updates:
  `node scripts/generate-sitemap.mjs --base https://your-domain`

## Flip track record

Flip suggestions from the Bazaar/AH pages are logged and later re-priced, which
powers the "flip suggestion track record" (win rate + actual vs predicted
margin) shown on both market pages.

## Environment

- `HYPIXEL_API_KEY` — the server-only key for the registered SkyForge application.
  Set it in `.env.local` for Vite development or in your hosting environment and
  redeploy. Visitors connect with their Minecraft Java username. Market pages
  can run without this credential.
- `CF_ACCOUNT_ID` / `CF_KV_NAMESPACE` / `CF_KV_TOKEN` — Cloudflare KV storage
  for market history (see above).
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` (+ `VITE_` variants) — per-user alerts
  and webhooks. See `supabase/migrations/0001_user_store.sql`.
- `PUBLIC_API_ORIGINS` — comma-separated origins allowed CORS on `/api/*`.
  Empty = same-origin only.
- Copy `.env.example` to `.env` for local dev (never commit `.env`).

## Conventions

- All displayed game data comes from live APIs or the NEU-derived dataset —
  missing values render as "—" / "Not available", never invented.
- Server-only code lives in `*.server.ts` files.
- Run `npm run check` before committing.
