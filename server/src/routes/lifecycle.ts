// ======================================================
// File Name : lifecycle.ts
// Purpose   : Defines HTTP route handlers for lifecycle
// ======================================================

import { Router } from 'express';
import { calculateLifecyclePreview } from '../services/depreciation.js';
import { ch } from '../db/clickhouse.js';
import { applyLifecycleEvent } from '../data/assets.js';
import type { LifecyclePreviewInput, LifecyclePreviewResult } from '../types.js';


// ======================================================
// START: Route Handlers
// ======================================================

export const lifecycleRouter = Router();

const EVENT_TYPES = [
  { id: 'addition', label: 'Addition', description: 'Capitalize a new asset into service', icon: '＋', color: 'green' },
  { id: 'adjustment', label: 'Adjustment', description: 'Change cost basis of an existing asset', icon: '✎', color: 'blue' },
  { id: 'transfer', label: 'Transfer', description: 'Move asset between org units', icon: '⇄', color: 'teal' },
  { id: 'retirement', label: 'Retirement', description: 'Dispose or write off an asset', icon: '⊗', color: 'red' },
  { id: 'reinstatement', label: 'Reinstatement', description: 'Restore a previously retired asset', icon: '↺', color: 'purple' },
  { id: 'reclassification', label: 'Reclassification', description: 'Change method, life, or convention', icon: '⇅', color: 'amber' }
];

// ======================================================
// Function : GET /event-types
// Purpose  : Route handler for GET /event-types
// Input    : req (HTTP request)
// Output   : res (HTTP response, JSON)
// ======================================================

lifecycleRouter.get('/event-types', (_req, res) => {
  res.json(EVENT_TYPES);
});

// POST /api/lifecycle/preview  — dispatches to the calculator for whichever
// of the 6 event cards was selected; `fields` is that card's own box set.
lifecycleRouter.post('/preview', (req, res) => {
  const body = req.body as Partial<LifecyclePreviewInput>;

  if (!body.eventType || !body.fields) {
    res.status(400).json({ error: 'eventType and fields are required' });
    return;
  }

  const input: LifecyclePreviewInput = {
    eventType: body.eventType,
    assetNumber: body.assetNumber ?? '',
    fields: body.fields
  };

  res.json(calculateLifecyclePreview(input));
});

// POST /api/lifecycle/post — "Confirm & Post" click. Writes ONE immutable
// row to the asset_transactions ledger (never updates existing rows —
// every post is a brand-new append). Body carries the same eventType/
// assetNumber/fields as /preview PLUS the preview result the user is
// looking at, so the ledger row matches exactly what was on screen.
lifecycleRouter.post('/post', async (req, res) => {
  const body = req.body as Partial<LifecyclePreviewInput> & { preview?: LifecyclePreviewResult };

  if (!body.eventType || !body.fields || !body.preview) {
    res.status(400).json({ error: 'eventType, fields, and preview are required' });
    return;
  }

  try {
    await ch.insert({
      table: 'asset_transactions',
      values: [{
        asset_number: body.assetNumber ?? '',
        event_type: body.eventType,
        fields_json: JSON.stringify(body.fields),
        result_badge_text: body.preview.badgeText,
        result_badge_tone: body.preview.badgeTone,
        result_rows_json: JSON.stringify(body.preview.rows),
        result_formula_note: body.preview.formulaNote,
        result_sections_json: JSON.stringify(body.preview.sections ?? []),
      }],
      format: 'JSONEachRow',
    });

    // Ledger write succeeded — now reflect the same event on the Asset
    // Register / Asset Detail pages by updating (or creating) the matching
    // in-memory asset row, using the exact preview numbers the user just
    // confirmed. This is what makes a Lifecycle post show up back on the
    // Asset Register immediately, no separate sync step needed.
    const asset = applyLifecycleEvent(
      body.eventType,
      body.assetNumber ?? '',
      body.fields,
      body.preview
    );

    res.json({ posted: true, asset });
  } catch (err) {
    console.error('Failed to post lifecycle transaction:', err);
    res.status(500).json({ error: 'Failed to post transaction to ClickHouse' });
  }
});

// POST /api/lifecycle/bulk-import — Bulk Import page's "Import All" click.
// Body: { eventType: <label, e.g. 'Addition'>, rows: [{ assetNumber, fields }, ...] }
// (all rows share one event type — the Bulk Import page renders one card,
// and therefore one CSV, per event type). Runs the exact same
// preview -> ClickHouse insert -> applyLifecycleEvent pipeline as the
// single-row /preview + /post endpoints, just looped per row, so a bulk
// import produces the same ledger rows and Asset Register updates a
// manual post would. One row failing (bad data, unknown asset, etc.)
// does not stop the rest of the batch — each row's outcome comes back
// individually so the UI can flag just the failed ones.
lifecycleRouter.post('/bulk-import', async (req, res) => {
  const body = req.body as { eventType?: string; rows?: Array<{ assetNumber?: string; fields?: Record<string, unknown> }> };

  if (!body.eventType || !Array.isArray(body.rows) || body.rows.length === 0) {
    res.status(400).json({ error: 'eventType and a non-empty rows array are required' });
    return;
  }

  const results: Array<{ assetNumber: string; status: 'posted' | 'failed'; error?: string }> = [];
  const eventType = body.eventType as LifecyclePreviewInput['eventType'];

  for (const row of body.rows) {
    const assetNumber = row.assetNumber ?? '';
    if (!assetNumber.trim()) {
      results.push({ assetNumber, status: 'failed', error: 'Missing Asset Number' });
      continue;
    }
    try {
      const input: LifecyclePreviewInput = {
        eventType,
        assetNumber,
        fields: (row.fields ?? {}) as LifecyclePreviewInput['fields']
      };
      const preview = calculateLifecyclePreview(input);

      await ch.insert({
        table: 'asset_transactions',
        values: [{
          asset_number: assetNumber,
          event_type: eventType,
          fields_json: JSON.stringify(input.fields),
          result_badge_text: preview.badgeText,
          result_badge_tone: preview.badgeTone,
          result_rows_json: JSON.stringify(preview.rows),
          result_formula_note: preview.formulaNote,
          result_sections_json: JSON.stringify(preview.sections ?? []),
        }],
        format: 'JSONEachRow',
      });

      applyLifecycleEvent(eventType, assetNumber, input.fields, preview);

      results.push({ assetNumber, status: 'posted' });
    } catch (err) {
      console.error(`Bulk import row failed for asset ${assetNumber}:`, err);
      results.push({ assetNumber, status: 'failed', error: err instanceof Error ? err.message : 'Unknown error' });
    }
  }

  res.json({ results });
});

// GET /api/lifecycle/transactions — reads back every posted lifecycle event
// for EVERY asset from the ClickHouse asset_transactions ledger, newest
// first. This is what powers the Asset Register page's "Posted Lifecycle
// Events" table: clicking a row there shows the full calculation (badge,
// summary rows, formula note, and the full step-by-step sections breakdown)
// exactly as it looked at the moment it was posted — same shape as the
// per-asset endpoint below, just without the WHERE clause.
lifecycleRouter.get('/transactions', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 200, 1000);

  try {
    const result = await ch.query({
      query: `
        SELECT
          transaction_id,
          asset_number,
          event_type,
          fields_json,
          result_badge_text,
          result_badge_tone,
          result_rows_json,
          result_formula_note,
          result_sections_json,
          posted_at,
          posted_by
        FROM asset_transactions
        ORDER BY posted_at DESC
        LIMIT {limit:UInt32}
      `,
      query_params: { limit },
      format: 'JSONEachRow',
    });

    const raw = await result.json<{
      transaction_id: string;
      asset_number: string;
      event_type: string;
      fields_json: string;
      result_badge_text: string;
      result_badge_tone: string;
      result_rows_json: string;
      result_formula_note: string;
      result_sections_json: string;
      posted_at: string;
      posted_by: string;
    }>();

    const items = raw.map((row) => ({
      transactionId: row.transaction_id,
      assetNumber: row.asset_number,
      eventType: row.event_type,
      fields: safeParse(row.fields_json, {}),
      preview: {
        badgeText: row.result_badge_text,
        badgeTone: row.result_badge_tone,
        rows: safeParse(row.result_rows_json, []),
        formulaNote: row.result_formula_note,
        sections: safeParse(row.result_sections_json, []),
      },
      postedAt: row.posted_at,
      postedBy: row.posted_by,
    }));

    res.json({ total: items.length, items });
  } catch (err) {
    console.error('Failed to fetch lifecycle transactions:', err);
    res.status(500).json({ error: 'Failed to fetch transactions from ClickHouse' });
  }
});

// GET /api/lifecycle/transactions/:assetNumber — reads back everything that
// has been "Confirm & Post"-ed for this asset from the ClickHouse
// asset_transactions ledger, newest first. This is what powers the
// Asset Register → Asset Detail → "Transactions" tab: clicking a row on
// that tab shows the full calculation (badge, summary rows, formula note,
// and the full step-by-step sections breakdown) exactly as it looked at
// the moment it was posted.
lifecycleRouter.get('/transactions/:assetNumber', async (req, res) => {
  const { assetNumber } = req.params;

  try {
    const result = await ch.query({
      query: `
        SELECT
          transaction_id,
          asset_number,
          event_type,
          fields_json,
          result_badge_text,
          result_badge_tone,
          result_rows_json,
          result_formula_note,
          result_sections_json,
          posted_at,
          posted_by
        FROM asset_transactions
        WHERE asset_number = {assetNumber:String}
        ORDER BY posted_at DESC
      `,
      query_params: { assetNumber },
      format: 'JSONEachRow',
    });

    const raw = await result.json<{
      transaction_id: string;
      asset_number: string;
      event_type: string;
      fields_json: string;
      result_badge_text: string;
      result_badge_tone: string;
      result_rows_json: string;
      result_formula_note: string;
      result_sections_json: string;
      posted_at: string;
      posted_by: string;
    }>();

    const items = raw.map((row) => ({
      transactionId: row.transaction_id,
      assetNumber: row.asset_number,
      eventType: row.event_type,
      fields: safeParse(row.fields_json, {}),
      preview: {
        badgeText: row.result_badge_text,
        badgeTone: row.result_badge_tone,
        rows: safeParse(row.result_rows_json, []),
        formulaNote: row.result_formula_note,
        sections: safeParse(row.result_sections_json, []),
      },
      postedAt: row.posted_at,
      postedBy: row.posted_by,
    }));

    res.json({ total: items.length, items });
  } catch (err) {
    console.error('Failed to fetch lifecycle transactions:', err);
    res.status(500).json({ error: 'Failed to fetch transactions from ClickHouse' });
  }
});

// Small helper — ClickHouse gives us the *_json columns back as plain
// strings; never let one malformed row take down the whole response.
function safeParse<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

// ======================================================
// END: GET /event-types
// ======================================================

// ======================================================
// END: Route Handlers
// ======================================================
