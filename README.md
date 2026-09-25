# AssetLedger — React + Node.js conversion

A working full-stack conversion of the original static HTML prototype:
a **Node.js/Express API** (TypeScript, in-memory data) backing a
**React SPA** (Vite + TypeScript + React Router).

## Structure

```
asset-ledger/
├── server/     Express API — TypeScript, in-memory data layer, real
│               depreciation calculator (services/depreciation.ts)
└── client/     Vite + React + TypeScript SPA, react-router-dom routes,
                proxies /api/* to the server in dev
```

## Running it

Two terminals:

```bash
# 1. API — http://localhost:4000
cd server
npm install
npm run dev

# 2. Web app — http://localhost:5173
cd client
npm install
npm run dev
```

Open http://localhost:5173. Vite proxies `/api/*` requests to the
Express server (see `client/vite.config.ts`), so no CORS setup is
needed in dev even though `cors()` is enabled server-side too.

## What changed from the static prototype

- `assets/shell.js`'s `renderShell()` → `<Shell>` / `<Sidebar>` /
  `<Topbar>` React components (`client/src/layout/`). Active-nav
  highlighting and the breadcrumb are now props instead of a global
  function call.
- Each `*.html` page → a route component under `client/src/pages/`,
  wired up in `client/src/App.tsx` with `react-router-dom`.
- Repeated UI patterns (KPI stat cards, status pills, bar charts, the
  CSS conic-gradient donut) → reusable components in
  `client/src/components/ui.tsx`.
- All the hardcoded numbers in the HTML are now served by the API from
  `server/src/data/*.ts` (an in-memory "table" per entity — swap these
  modules for real DB queries later without touching the routes).
- The Lifecycle "Calculate Preview" and the Modeling scenario
  comparison used to show static, hand-typed numbers. They now call
  `POST /api/lifecycle/preview` and `POST /api/modeling/compare`,
  which run an actual (simplified) straight-line / half-year-convention
  depreciation calculation in `server/src/services/depreciation.ts`.
  This is illustrative, not a certified tax engine — see the note at
  the top of that file before using it for anything real.
- The original `assets/styles.css` carries over almost unchanged as
  `client/src/styles.css`; a few page-scoped `<style>` blocks
  (lifecycle event picker, report cards, user avatars) were merged in.

## 🗂️ Where is everything? (file map)

```
asset-ledger-new/
├── server/                → Backend — Node.js + Express + TypeScript
│   ├── src/
│   │   ├── index.ts          → App entry point. Starts Express, mounts all routes.
│   │   ├── types.ts           → Shared TypeScript types (Asset, Transaction, etc.)
│   │   ├── data/               → In-memory "tables" (seed data + persist logic)
│   │   │   ├── assets.ts          → asset master data + initStore()/persist()/applyLifecycleEvent()
│   │   │   ├── activity.ts         → dashboard summary + recent activity feed
│   │   │   └── admin.ts             → users, roles, report catalog
│   │   ├── db/
│   │   │   ├── postgres.ts          → Postgres (Neon) pool connection (the `pool` object)
│   │   │   └── repo.ts               → ONLY file that talks to Postgres directly
│   │   ├── routes/                    → Express routes = your API endpoints
│   │   │   ├── assets.ts                 → /api/assets/*
│   │   │   ├── dashboard.ts               → /api/dashboard/*
│   │   │   ├── lifecycle.ts                → /api/lifecycle/*  (Addition, Transfer, Post, Bulk Import/Post)
│   │   │   ├── modeling.ts                  → /api/modeling/*  (scenario comparison)
│   │   │   └── misc.ts                       → /api/forecasting, /api/reporting, /api/users
│   │   └── services/
│   │       ├── depreciation.ts               → depreciation math (straight-line etc.)
│   │       └── schedule-builder.ts            → builds year-by-year schedule rows
│   ├── calc-engine/                    → lifecycle event calculators (.cjs)
│   │   └── additions.cjs, adjustments.cjs, disposals.cjs, reclassifications.cjs,
│   │       reinstatements.cjs, transfers.cjs, rate-tables.cjs
│   ├── db/                              → 🟢 DATABASE TABLE DEFINITIONS LIVE HERE
│   │   ├── schema.sql                      → base tables (assets, users, roles, ...)
│   │   ├── schema-core.sql                  → timeline + depreciation schedule tables
│   │   └── schema-transactions.sql           → posted-event ledger table
│   ├── scripts/                          → one-off scripts (apply-schema, migrate, seed, check)
│   ├── data-store.json                    → OLD local JSON fallback (Postgres is now the real source)
│   └── .env                                → 🔒 DB password etc. (NOT committed to git)
│
└── client/                 → Frontend — React + Vite
    └── src/
        ├── main.jsx / App.jsx      → app bootstrap + route table
        ├── pages/                    → one folder per screen (Dashboard, Assets, Lifecycle, ...)
        ├── components/                → reusable UI pieces (Table, Modal, Button, AssetCard, ...)
        ├── hooks/                       → useAssets.js, useAuth.js — data-fetching hooks
        ├── api/                          → thin fetch() wrappers, one per backend resource
        ├── layout/                        → Sidebar, Header, BottomNav, Footer
        └── data/                           → static reference tables (asset classes, IRS tables)
```

**Rule of thumb:** UI screen → `client/src/pages/`. API call → `server/src/routes/`.
Actual database table (columns) → `server/db/*.sql`. Depreciation math →
`server/src/services/depreciation.ts`.

## 🗃️ Database tables — full list (11 tables + 1 view)

All real tables live in `server/db/` as plain SQL (Postgres/Neon), applied in this order:
`schema.sql` → `schema-core.sql` → `schema-transactions.sql` (see `POSTGRES.md`).

| # | Table | Holds | Defined in |
|---|---|---|---|
| 1 | `assets` | Asset master (cost, NBV, method, status, tax facts, disposal info) | schema.sql |
| 2 | `lifecycle_activity` | Recent-activity feed on the Dashboard | schema.sql |
| 3 | `roles` | Role names + permission matrix | schema.sql |
| 4 | `users` | User accounts | schema.sql |
| 5 | `report_catalog` | List of report *types* available | schema.sql |
| 6 | `generated_reports` | Reports actually generated (Compliance page) | schema.sql |
| 7 | `dashboard_summary` | KPI snapshot row for the Dashboard | schema.sql |
| 8 | `forecast_snapshot` | 5-yr forecast snapshot | schema.sql |
| 9 | `asset_timeline` | Lifecycle Timeline shown on Asset Detail page | schema-core.sql |
| 10 | `asset_depreciation_schedule` | Year-by-year depreciation rows per asset | schema-core.sql |
| 11 | `asset_transactions` | Every "Confirm & Post" click — immutable ledger | schema-transactions.sql |
| — | `v_monthly_depreciation` (VIEW) | Same monthly-depreciation number as the Dashboard chart, queryable in SQL | schema-core.sql |

Credentials to connect are in `server/.env` (`DATABASE_URL`, the Neon connection
string) — gitignored on purpose, it holds the password.

## 🖱️ Click → Table map (what gets touched when you click something)

| Screen / Action (click) | API route hit | Table(s) touched |
|---|---|---|
| Open **Dashboard** | `GET /api/dashboard/summary` | `dashboard_summary`, `assets` |
| Dashboard → **Recent Activity** panel | `GET /api/dashboard/activity` | `lifecycle_activity` |
| Open **Asset Register** | `GET /api/assets` | `assets` |
| Click an asset row → **Asset Detail** | `GET /api/assets/:assetNumber` | `assets`, `asset_timeline`, `asset_depreciation_schedule` |
| Asset Detail → **Transactions** / **Audit Trail** tabs | `GET /api/lifecycle/transactions/:assetNumber` | `asset_transactions` |
| Asset Register → **Posted Lifecycle Events** table | `GET /api/lifecycle/transactions` | `asset_transactions` |
| Lifecycle event card → **Calculate Preview** | `POST /api/lifecycle/preview` | none saved — pure calculation |
| Lifecycle event card → **Confirm & Post** | `POST /api/lifecycle/post` | `asset_transactions` (new row) **+** `assets`, `asset_timeline`, `asset_depreciation_schedule` (all rewritten via `applyLifecycleEvent` → `repo.ts` `flush()`) |
| **Bulk Import** (CSV, one event type) → Import All | `POST /api/lifecycle/bulk-import` | same 4 tables as above, once per row |
| **Master Data Set** → Post All | `POST /api/lifecycle/bulk-post` | same 4 tables as above, once per row (Additions processed first) |
| **Planning → Modeling** → Compare Scenarios | `POST /api/modeling/compare` | none saved — pure calculation |
| **Planning → Forecasting** | `GET /api/forecasting` | `forecast_snapshot`, `asset_depreciation_schedule` |
| **Compliance → Reporting** | `GET /api/reporting/catalog`, `GET /api/reporting/recent` | `report_catalog`, `generated_reports` |
| **Administration → Users** | `GET /api/users`, `GET /api/users/roles` | `users`, `roles` |
| **Configuration → Asset Classes / Bonus Depreciation / Pub 946 Tables** | (none — served from `client/src/data/*.js`) | none — hardcoded reference data, not DB tables |

**Key idea:** every **Confirm & Post** click (single, Bulk Import, or Master
Data Set) is the one action that touches **4 tables in one go** —
`asset_transactions` (immutable ledger row) plus `assets`, `asset_timeline`,
and `asset_depreciation_schedule` (rewritten to reflect the new state).
Everything else on the site is either a read-only page load or a
client-side/preview-only calculation that saves nothing.

## API surface

| Method | Path | Notes |
|---|---|---|
| GET | `/api/dashboard/summary` | KPIs, monthly chart, class mix |
| GET | `/api/dashboard/activity` | Recent lifecycle activity |
| GET | `/api/assets?assetClass=&company=&status=&method=&q=` | Filterable register |
| GET | `/api/assets/:assetNumber` | Asset + timeline + schedule |
| GET | `/api/lifecycle/event-types` | Event type picker options |
| POST | `/api/lifecycle/preview` | **Live** depreciation preview calc |
| GET | `/api/modeling/scenarios` | Default scenario set |
| POST | `/api/modeling/compare` | **Live** scenario projection calc |
| GET | `/api/forecasting` | 5-yr forecast + roll-forward |
| GET | `/api/reporting/catalog` | Report type catalog |
| GET | `/api/reporting/recent` | Recently generated reports |
| GET | `/api/users` | Users |
| GET | `/api/users/roles` | Roles + permission matrix |

## Known gaps / next steps

- No auth — every route is open, matching the prototype's scope.
- Persistence now runs through Postgres (Neon) — see `POSTGRES.md`.
- Pagination on the Asset Register is cosmetic (shows the small seed
  set); wire up real paging once there's a real data source.
- Asset Detail's "Documents" tab is stubbed — no file storage is
  connected. "Overview", "Depreciation Schedule", "Transactions", and
  "Audit Trail" are all live now; Audit Trail reads the same
  Postgres `asset_transactions` ledger as Transactions, and every
  post now records the real logged-in user in `posted_by` (via
  `postedBy` in the /post, /bulk-import, and /bulk-post request
  bodies) instead of always defaulting to "system".
- **Production checklist**: `server/.env` is gitignored on purpose
  (it holds the Neon connection string), so it does NOT travel with a
  `git push` to your live host. `server/src/index.ts` refuses to boot
  at all if it can't reach Postgres — so if the live server has no
  `DATABASE_URL` set, it exits on startup and every page (Overview,
  Depreciation Schedule, Transactions, Audit Trail) will look empty,
  even though it works locally. Set that variable in your hosting
  platform's environment-variables screen (Render/Railway/Fly/etc.),
  same value as your local `server/.env`. If the client is deployed
  separately from the server, also set `VITE_API_URL` at build time
  to the server's public URL — otherwise the client calls `/api/...`
  on its OWN domain, which has no API behind it.
  Check `GET https://<your-server-domain>/api/health` — it should
  return `{ ok: true, postgres: true }`.
- The depreciation math is intentionally simplified (see the note in
  `services/depreciation.ts`); replace with a real tax engine before
  this touches actual filings.
- `server/CREATE`, `server/tsx`, and `server/asset-ledger-server@0.1.0`
  are stray **0-byte junk files** (likely from a mistyped terminal
  command) — they are not used by the app and are safe to delete.
