# SAP Integration (pull)

Menu: **Integrations -> SAP** (`/integrations/sap`). **Pull-only**: click **Fetch from SAP**, review, then
**Download in our format**. The file is a Master Data Set CSV (same columns as Bulk Import). Nothing is posted
from this page and nothing is written to SAP. To post, upload the CSV in **Bulk Import -> Master Data Set**.

Flow: `fetchSapRecords` (GET only) -> `sapNormalize.ts` (SAP columns / dates / amounts / code mapping) ->
`mapToAddition` -> `POST /api/integrations/sap/convert` -> CSV built in the browser.
(`POST /sap/import` still exists for direct posting but the SAP page no longer uses it.)

## Converting SAP data to our format (`sapNormalize.ts`)
- Column names: SAP technical names (`ANLN1` asset no., `BUKRS` company code, `ANLKL` asset class, `AKTIV`
  capitalization date, `ANSWL` acquisition value, `TXT50` description, `BELNR` document) or our own names. These
  SAP names are an ASSUMPTION until the client's real sample arrives; add aliases in `ALIASES` if they differ.
- Dates: `26.10.2026`, `20261026`, `26/10/2026`, `/Date(ms)/` -> `2026-10-26`.
- Amounts: `1.234,56`, `1,234.56`, `100-` -> number.
- No document number column: `<company>-<asset number>` is used so duplicate protection still works.
- Code mapping: edit `server/config/sap-mapping.json` (`companyCodes`, `assetClasses`: SAP code -> our code).
  Re-read on every fetch, no restart. Unlisted codes pass through unchanged. Asset classes must exist in
  Configuration -> Asset Classes, otherwise the row shows "Needs attention" and is skipped from the download.

## Modes
- **Mock** (default): built-in sample records, no setup. One sample has an unknown asset class to show an "invalid" row.
- **Live**: set in `server/.env` and restart:
  `SAP_BASE_URL=https://...`, optional `SAP_ASSETS_PATH` (default `/assets`), `SAP_API_TOKEN` (Bearer), `SAP_DEFAULT_BOOK` (default GAAP).
  The server calls `GET <SAP_BASE_URL><SAP_ASSETS_PATH>?from=&to=` and expects a JSON list (or `{ "records": [...] }`).

## Record format (SAMPLE - replace with the client's real SAP format)
`documentId, assetNumber, companyCode, assetClass, description, acquisitionCost, capitalizationDate (YYYY-MM-DD)`

Only `server/src/services/integrations/sapAdapter.ts` knows this format. When the real SAP response is known,
change `fetchSapRecords` / `mapToAddition` there — the page, duplicate check and posting stay the same.

## Duplicate protection
Imported SAP document ids are stored in `integration_imports` (created automatically). A document already
imported shows "Already imported" and is skipped. Failed rows are not recorded, so they can be retried.

## Current limits
- Acquisitions -> Addition only (Retirement / Transfer / Adjustment not mapped yet).
- Sample mapper handles personal-property classes with MACRS 200% DB half-year (3/5/7/10/15/20 yr).
  Other classes show "Needs attention" with the reason.

## Real HTTP call without a real SAP (`npm run mock-sap`)
`server/scripts/mock-sap-server.mjs` is a stand-in SAP API (read-only GET `/assets`, Bearer token, SAP column
names and date/amount styles). To make the app do a real HTTP call:
1. Terminal 1: `cd server && npm run mock-sap` (port 4100, token `demo-token`)
2. In `server/.env`: `SAP_BASE_URL=http://localhost:4100` and `SAP_API_TOKEN=demo-token`, restart the server
3. Integrations -> SAP -> Fetch from SAP (status shows live mode, the mock SAP terminal logs each request)
To go to the client's real SAP, only change those two values (and `SAP_ASSETS_PATH`), then replace the demo
entries in `server/config/sap-mapping.json` with the client's real codes.
