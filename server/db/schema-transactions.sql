-- ======================================================
-- File Name : schema-transactions.sql
-- Purpose   : Append-only ledger for the Lifecycle page's
--             6 event cards (Addition/Adjustment/Transfer/
--             Retirement/Reinstatement/Reclassification).
--             We never UPDATE a row here — every "Confirm &
--             Post" click inserts a new immutable row.
-- Run with  : clickhouse-client --password --multiquery < db/schema-transactions.sql
-- ======================================================

CREATE TABLE IF NOT EXISTS asset_ledger.asset_transactions
(
    transaction_id      UUID DEFAULT generateUUIDv4(),
    asset_number          String,
    event_type              String,   -- Addition | Adjustment | Transfer | Retirement | Reinstatement | Reclassification
    fields_json               String,   -- the exact form fields the user submitted (raw JSON)
    result_badge_text          String,   -- e.g. "Posted"
    result_badge_tone            String,   -- green | blue | amber | red
    result_rows_json               String,   -- preview.rows, JSON — what the right-side table shows
    result_formula_note              String,
    result_sections_json               String,   -- preview.sections, JSON (full calc breakdown)
    posted_at                            DateTime DEFAULT now(),
    posted_by                              LowCardinality(String) DEFAULT 'system'
)
ENGINE = MergeTree
ORDER BY (asset_number, posted_at);
