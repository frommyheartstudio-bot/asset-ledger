-- ======================================================
-- File Name : schema.sql
-- Purpose   : Postgres (Neon) tables mirroring server/src/data/*.ts
--             shapes exactly, so the repo layer (server/src/db/repo.ts)
--             has a 1:1 mapping. Converted from the original ClickHouse
--             schema — same table/column names, quoted where they're
--             camelCase so Postgres doesn't fold them to lowercase.
-- Run with  : psql "$DATABASE_URL" -f schema.sql
--             or: npm run db:schema:apply   (pg-based, no psql needed)
-- ======================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------- assets.ts : assets ----------
CREATE TABLE IF NOT EXISTS assets
(
    "assetNumber"        TEXT PRIMARY KEY,
    description          TEXT NOT NULL DEFAULT '',
    "assetClass"         TEXT NOT NULL DEFAULT '',
    company              TEXT NOT NULL DEFAULT '',
    "costCenter"         TEXT,
    location             TEXT,
    project              TEXT,
    cost                 NUMERIC(18,2) NOT NULL DEFAULT 0,
    "accumDepreciation"  NUMERIC(18,2) NOT NULL DEFAULT 0,
    nbv                  NUMERIC(18,2) NOT NULL DEFAULT 0,
    method               TEXT NOT NULL DEFAULT '',
    status               TEXT NOT NULL DEFAULT 'Active',  -- Active | Retired | Transferred | Fully Depreciated | Under Review
    -- taxFactPattern (flattened, all nullable — only set for some assets)
    "tfp_placedInService" DATE,
    "tfp_recoveryPeriod"  TEXT,
    "tfp_method"          TEXT,
    "tfp_convention"      TEXT,
    "tfp_bonusPct"        NUMERIC(5,2),
    "tfp_annualRate"      NUMERIC(5,2),
    "tfp_propertyType"    TEXT,
    -- disposal (flattened, only set when status = 'Retired')
    "disp_disposalDate"   DATE,
    "disp_adAtDisposal"   NUMERIC(18,2),
    "disp_gainLoss"       NUMERIC(18,2),
    "updatedAt"           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Existing deployments created before the tax-fact-pattern / disposal
-- columns existed (e.g. migrated over from ClickHouse before these were
-- added): CREATE TABLE IF NOT EXISTS above won't add them to an
-- already-existing table, so pick them up here too.
ALTER TABLE assets ADD COLUMN IF NOT EXISTS "tfp_placedInService" DATE;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS "tfp_recoveryPeriod" TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS "tfp_method" TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS "tfp_convention" TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS "tfp_bonusPct" NUMERIC(5,2);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS "tfp_annualRate" NUMERIC(5,2);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS "tfp_propertyType" TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS "disp_disposalDate" DATE;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS "disp_adAtDisposal" NUMERIC(18,2);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS "disp_gainLoss" NUMERIC(18,2);

-- ---------- activity.ts : recentActivity ----------
CREATE TABLE IF NOT EXISTS lifecycle_activity
(
    id            BIGSERIAL PRIMARY KEY,
    "assetNumber" TEXT NOT NULL,
    description   TEXT NOT NULL DEFAULT '',
    event         TEXT NOT NULL,   -- Addition | Adjustment | Transfer | Retirement | Reinstatement | Reclassification | Transfer In
    amount        NUMERIC(18,2) NOT NULL DEFAULT 0,
    "eventDate"   DATE NOT NULL,
    status        TEXT NOT NULL,   -- Posted | Processing | Pending
    "insertedAt"  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lifecycle_activity_event_date ON lifecycle_activity ("eventDate", "assetNumber");

-- ---------- admin.ts : roles ----------
CREATE TABLE IF NOT EXISTS roles
(
    name         TEXT PRIMARY KEY,
    "userCount"  INTEGER NOT NULL DEFAULT 0,
    access       TEXT NOT NULL DEFAULT '',
    permissions  TEXT NOT NULL DEFAULT '{}'   -- stored as JSON string, parse on read
);

-- ---------- admin.ts : users ----------
CREATE TABLE IF NOT EXISTS users
(
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL DEFAULT '',
    email         TEXT NOT NULL DEFAULT '',
    role          TEXT NOT NULL DEFAULT '',
    "lastActive"  TEXT NOT NULL DEFAULT '',
    status        TEXT NOT NULL DEFAULT '',      -- Active | Invited
    password      TEXT NOT NULL DEFAULT '',      -- prototype only: plaintext, never returned to the client
    "menuAccess"  TEXT NOT NULL DEFAULT '{}'     -- JSON: { [menuId]: { view: bool, edit: bool } } — per-user override of the Role's Permission Matrix defaults
);

-- Existing deployments created before these columns existed:
-- CREATE TABLE IF NOT EXISTS above won't add them, so pick them up here too.
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS "menuAccess" TEXT NOT NULL DEFAULT '{}';

-- ---------- admin.ts : reportCatalog ----------
CREATE TABLE IF NOT EXISTS report_catalog
(
    key          TEXT PRIMARY KEY,
    name         TEXT NOT NULL DEFAULT '',
    description  TEXT NOT NULL DEFAULT ''
);

-- ---------- admin.ts : generatedReports ----------
CREATE TABLE IF NOT EXISTS generated_reports
(
    id             BIGSERIAL PRIMARY KEY,
    name           TEXT NOT NULL,
    book           TEXT NOT NULL DEFAULT '',
    period         TEXT NOT NULL DEFAULT '',
    "generatedBy"  TEXT NOT NULL DEFAULT '',
    "reportDate"   DATE NOT NULL,
    format         TEXT NOT NULL,   -- XLSX | PDF | CSV
    status         TEXT NOT NULL    -- Ready | Draft | Processing
);
CREATE INDEX IF NOT EXISTS idx_generated_reports_date ON generated_reports ("reportDate", name);

-- ---------- activity.ts : dashboardSummary (single-row snapshot table) ----------
CREATE TABLE IF NOT EXISTS dashboard_summary
(
    "snapshotAt"                TIMESTAMPTZ PRIMARY KEY DEFAULT now(),
    "totalAssets"                INTEGER NOT NULL DEFAULT 0,
    "addedThisPeriod"            INTEGER NOT NULL DEFAULT 0,
    "grossCost"                  NUMERIC(20,2) NOT NULL DEFAULT 0,
    "grossCostYtdDeltaPct"       NUMERIC(6,2) NOT NULL DEFAULT 0,
    "netBookValue"               NUMERIC(20,2) NOT NULL DEFAULT 0,
    "depreciationDeltaPct"       NUMERIC(6,2) NOT NULL DEFAULT 0,
    "ytdDepreciation"            NUMERIC(20,2) NOT NULL DEFAULT 0,
    "monthlyDepreciationJson"    TEXT NOT NULL DEFAULT '[]',   -- JSON array
    "assetsByClassJson"          TEXT NOT NULL DEFAULT '[]'    -- JSON array
);

-- ---------- activity.ts : forecast (single-row snapshot table) ----------
CREATE TABLE IF NOT EXISTS forecast_snapshot
(
    "snapshotAt"           TIMESTAMPTZ PRIMARY KEY DEFAULT now(),
    "kpisJson"             TEXT NOT NULL DEFAULT '{}',   -- JSON object
    "expenseByYearJson"    TEXT NOT NULL DEFAULT '[]',   -- JSON array
    "rollForwardJson"      TEXT NOT NULL DEFAULT '[]'    -- JSON array
);
