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

## Market history store

`src/lib/market-history.server.ts` records bazaar prices + lowest BINs on every
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

- `GET /api/flips` — current top 25 Bazaar + top 25 Auction flip suggestions
  and the published accuracy score. JSON, CORS open, no auth. Intended for
  mods and third-party tools.

## SEO

- SSR is enabled — landing, wiki and market pages render real HTML.
- Regenerate `public/sitemap.xml` after item-data updates:
  `node scripts/generate-sitemap.mjs --base https://your-domain`

## Environment

Flip suggestions from the Bazaar/AH pages are logged and later re-priced, which
powers the "flip suggestion track record" (win rate + actual vs predicted
margin) shown on both market pages.

## Environment

- `HYPIXEL_API_KEY` — shared operator key pool for profile data (comma-separated
  for rotation; users' own keys are always preferred). Market pages never need
  a key.
- `CF_ACCOUNT_ID` / `CF_KV_NAMESPACE` / `CF_KV_TOKEN` — Cloudflare KV storage
  for market history (see above).

## Conventions

- All displayed game data comes from live APIs or the NEU-derived dataset —
  missing values render as "—" / "Not available", never invented.
- Server-only code lives in `*.server.ts` files.
- Run `npm run check` before committing.
