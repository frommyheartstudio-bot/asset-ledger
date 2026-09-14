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
- No persistence — data resets on server restart. The `server/src/data/`
  modules are shaped so swapping in Postgres/Prisma (or anything else)
  only touches those files, not the route handlers.
- Pagination on the Asset Register is cosmetic (shows the small seed
  set); wire up real paging once there's a real data source.
- Asset Detail's "Transactions", "Documents", and "Audit Trail" tabs
  are stubbed — only "Overview" and "Depreciation Schedule" are live.
- The depreciation math is intentionally simplified (see the note in
  `services/depreciation.ts`); replace with a real tax engine before
  this touches actual filings.
