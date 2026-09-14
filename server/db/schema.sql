-- ======================================================
-- File Name : schema.sql
-- Purpose   : ClickHouse tables mirroring server/src/data/*.ts
--             shapes exactly, so the seed script (and later,
--             real repository code) has a 1:1 mapping.
-- Run with  : clickhouse-client --multiquery < schema.sql
-- ======================================================

CREATE DATABASE IF NOT EXISTS asset_ledger;

-- ---------- assets.ts : assets ----------
CREATE TABLE IF NOT EXISTS asset_ledger.assets
(
    assetNumber        String,
    description         String,
    assetClass          String,
    company              String,
    costCenter           Nullable(String),
    location             Nullable(String),
    project               Nullable(String),
    cost                  Decimal(18,2),
    accumDepreciation     Decimal(18,2),
    nbv                    Decimal(18,2),
    method                 String,
    status                 String,          -- Active | Retired | Transferred | Fully Depreciated | Under Review
    -- taxFactPattern (flattened, all nullable — only set for some assets)
    tfp_placedInService    Nullable(Date),
    tfp_recoveryPeriod     Nullable(String),
    tfp_method             Nullable(String),
    tfp_convention         Nullable(String),
    tfp_bonusPct           Nullable(Decimal(5,2)),
    tfp_annualRate         Nullable(Decimal(5,2)),
    tfp_propertyType       Nullable(String),
    -- disposal (flattened, only set when status = 'Retired')
    disp_disposalDate      Nullable(Date),
    disp_adAtDisposal      Nullable(Decimal(18,2)),
    disp_gainLoss           Nullable(Decimal(18,2)),
    updatedAt               DateTime DEFAULT now()
)
ENGINE = ReplacingMergeTree(updatedAt)
ORDER BY (assetNumber);

-- ---------- activity.ts : recentActivity ----------
CREATE TABLE IF NOT EXISTS asset_ledger.lifecycle_activity
(
    assetNumber   String,
    description    String,
    event           String,   -- Addition | Adjustment | Transfer | Retirement | Reinstatement | Reclassification | Transfer In
    amount           Decimal(18,2),
    eventDate        Date,
    status            String,   -- Posted | Processing | Pending
    insertedAt        DateTime DEFAULT now()
)
ENGINE = MergeTree
ORDER BY (eventDate, assetNumber);

-- ---------- admin.ts : roles ----------
CREATE TABLE IF NOT EXISTS asset_ledger.roles
(
    name         String,
    userCount     UInt32,
    access         String,
    permissions     String   -- stored as JSON string, parse on read
)
ENGINE = ReplacingMergeTree
ORDER BY (name);

-- ---------- admin.ts : users ----------
CREATE TABLE IF NOT EXISTS asset_ledger.users
(
    id            String,
    name           String,
    email           String,
    role             String,
    lastActive       String,
    status            String   -- Active | Invited
)
ENGINE = ReplacingMergeTree
ORDER BY (id);

-- ---------- admin.ts : reportCatalog ----------
CREATE TABLE IF NOT EXISTS asset_ledger.report_catalog
(
    key            String,
    name            String,
    description      String
)
ENGINE = ReplacingMergeTree
ORDER BY (key);

-- ---------- admin.ts : generatedReports ----------
CREATE TABLE IF NOT EXISTS asset_ledger.generated_reports
(
    name           String,
    book            String,
    period           String,
    generatedBy       String,
    reportDate         Date,
    format              String,   -- XLSX | PDF | CSV
    status               String   -- Ready | Draft | Processing
)
ENGINE = MergeTree
ORDER BY (reportDate, name);

-- ---------- activity.ts : dashboardSummary (single-row snapshot table) ----------
CREATE TABLE IF NOT EXISTS asset_ledger.dashboard_summary
(
    snapshotAt              DateTime DEFAULT now(),
    totalAssets               UInt32,
    addedThisPeriod             UInt32,
    grossCost                    Decimal(20,2),
    grossCostYtdDeltaPct           Decimal(6,2),
    netBookValue                    Decimal(20,2),
    depreciationDeltaPct              Decimal(6,2),
    ytdDepreciation                     Decimal(20,2),
    monthlyDepreciationJson              String,   -- JSON array
    assetsByClassJson                     String    -- JSON array
)
ENGINE = ReplacingMergeTree(snapshotAt)
ORDER BY (snapshotAt);

-- ---------- activity.ts : forecast (single-row snapshot table) ----------
CREATE TABLE IF NOT EXISTS asset_ledger.forecast_snapshot
(
    snapshotAt         DateTime DEFAULT now(),
    kpisJson             String,   -- JSON object
    expenseByYearJson      String,   -- JSON array
    rollForwardJson           String   -- JSON array
)
ENGINE = ReplacingMergeTree(snapshotAt)
ORDER BY (snapshotAt);
