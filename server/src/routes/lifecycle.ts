// ======================================================
// File Name : lifecycle.ts
// Purpose   : Defines HTTP route handlers for lifecycle
// ======================================================

import { Router } from 'express';
import { calculateLifecyclePreview } from '../services/depreciation.js';
import { pool } from '../db/postgres.js';
import { applyLifecycleEvent, findAsset } from '../data/assets.js';
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
// Function : isAddition
// Purpose  : Event type can arrive as the label ('Addition') or the id
//            ('addition') depending on the caller — compare loosely.
// ======================================================

function isAddition(eventType: string | undefined): boolean {
  return (eventType ?? '').trim().toLowerCase() === 'addition';
}

// ======================================================
// Function : additionBlockReason
// Purpose  : STRICT one-Addition-per-asset-number rule. An asset number may
//            be capitalized exactly once, no matter how the Addition comes
//            in (single post, Bulk Import CSV, Master Data Set). Returns a
//            human-readable reason when the number is already taken, or
//            null when the Addition may go ahead. "Taken" means EITHER:
//              - the number is already in the Asset Register, OR
//              - the Postgres ledger already holds an Addition for it.
//            Because bulk endpoints post row by row and each successful
//            row lands in the register straight away, a duplicate number
//            later in the SAME batch is caught here too.
// ======================================================

async function additionBlockReason(assetNumber: string): Promise<string | null> {
  const key = assetNumber.trim();

  if (findAsset(key)) {
    return `Asset ${key} already exists — an asset number can only have one Addition.`;
  }

  const result = await pool.query<{ n: string | number }>(
    `SELECT count(*) AS n
     FROM asset_transactions
     WHERE asset_number = $1
       AND lower(event_type) = 'addition'`,
    [key]
  );
  const rows = result.rows;
  if (Number(rows[0]?.n ?? 0) > 0) {
    return `Asset ${key} already has an Addition posted — an asset number can only have one Addition.`;
  }
  return null;
}

// An Addition whose calculation came back "Needs Attention" never actually
// capitalized anything — it must not be posted, or it would burn the asset
// number (the one-Addition rule) without creating a valid asset.
function additionPreviewError(preview: { badgeText?: string; rows?: Array<{ label: string; value: string }> }): string | null {
  if (preview.badgeText !== 'Needs Attention') return null;
  const detail = (preview.rows ?? []).map((r) => `${r.label}: ${r.value}`).join('; ');
  return `Addition has validation errors — fix them and recalculate. ${detail}`.trim();
}

// ======================================================
// Class    : LifecycleValidationError
// Purpose  : Carries the right HTTP status alongside the message, so a
//            failed check can be thrown once and mapped to a response
//            wherever it's caught (single post vs. a bulk-row loop).
// ======================================================

class LifecycleValidationError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// ======================================================
// Function : assertAdditionAllowed
// Purpose  : DEDUPED — this used to be copy-pasted (isAddition check +
//            additionPreviewError + additionBlockReason) in all three of
//            /post, /bulk-import, and /bulk-post. Now it's one function
//            all three call, so the one-Addition-per-asset-number rule
//            can't quietly drift between the three entry points. Non-
//            Addition events are a no-op. Throws LifecycleValidationError
//            (400 for a bad preview, 409 for an asset number already
//            taken) instead of returning a status — the caller decides
//            what to do with that (send it as the HTTP response for a
//            single post, or record it as one failed row in a bulk loop).
// ======================================================

async function assertAdditionAllowed(
  eventType: string | undefined,
  assetNumber: string,
  preview: LifecyclePreviewResult
): Promise<void> {
  if (!isAddition(eventType)) return;

  const previewError = additionPreviewError(preview);
  if (previewError) throw new LifecycleValidationError(previewError, 400);

  const blocked = await additionBlockReason(assetNumber);
  if (blocked) throw new LifecycleValidationError(blocked, 409);
}

// ======================================================
// Function : insertLifecycleTransaction
// Purpose  : DEDUPED — the same asset_transactions INSERT used to be
//            copy-pasted in /post, /bulk-import, and /bulk-post. Now
//            it's one function all three call, so the ledger's column
//            list only has to be kept correct in one place. Writes
//            exactly one immutable row per call — this table is
//            append-only, never updated.
// ======================================================

async function insertLifecycleTransaction(params: {
  assetNumber: string;
  eventType: string;
  fields: Record<string, unknown>;
  preview: LifecyclePreviewResult;
  postedBy: string | undefined;
}): Promise<void> {
  await pool.query(
    `INSERT INTO asset_transactions
       (asset_number, event_type, fields_json, result_badge_text, result_badge_tone,
        result_rows_json, result_formula_note, result_sections_json, posted_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [
      params.assetNumber.trim(),
      params.eventType,
      JSON.stringify(params.fields),
      params.preview.badgeText,
      params.preview.badgeTone,
      JSON.stringify(params.preview.rows),
      params.preview.formulaNote,
      JSON.stringify(params.preview.sections ?? []),
      params.postedBy?.trim() || 'system'
    ]
  );
}

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
  const body = req.body as Partial<LifecyclePreviewInput> & { preview?: LifecyclePreviewResult; postedBy?: string };

  if (!body.eventType || !body.fields || !body.preview) {
    res.status(400).json({ error: 'eventType, fields, and preview are required' });
    return;
  }

  try {
    await assertAdditionAllowed(body.eventType, body.assetNumber ?? '', body.preview);

    await insertLifecycleTransaction({
      assetNumber: body.assetNumber ?? '',
      eventType: body.eventType,
      fields: body.fields,
      preview: body.preview,
      postedBy: body.postedBy,
    });

    // Ledger write succeeded — now reflect the same event on the Asset
    // Register / Asset Detail pages by updating (or creating) the matching
    // in-memory asset row, using the exact preview numbers the user just
    // confirmed. This is what makes a Lifecycle post show up back on the
    // Asset Register immediately, no separate sync step needed.
    const asset = applyLifecycleEvent(
      body.eventType,
      (body.assetNumber ?? '').trim(),
      body.fields,
      body.preview
    );

    res.json({ posted: true, asset });
  } catch (err) {
    if (err instanceof LifecycleValidationError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    console.error('Failed to post lifecycle transaction:', err);
    res.status(500).json({ error: 'Failed to post transaction' });
  }
});

// POST /api/lifecycle/bulk-import — Bulk Import page's "Import All" click.
// Body: { eventType: <label, e.g. 'Addition'>, rows: [{ assetNumber, fields }, ...] }
// (all rows share one event type — the Bulk Import page renders one card,
// and therefore one CSV, per event type). Runs the exact same
// preview -> Postgres insert -> applyLifecycleEvent pipeline as the
// single-row /preview + /post endpoints, just looped per row, so a bulk
// import produces the same ledger rows and Asset Register updates a
// manual post would. One row failing (bad data, unknown asset, etc.)
// does not stop the rest of the batch — each row's outcome comes back
// individually so the UI can flag just the failed ones.
lifecycleRouter.post('/bulk-import', async (req, res) => {
  const body = req.body as { eventType?: string; postedBy?: string; rows?: Array<{ assetNumber?: string; fields?: Record<string, unknown> }> };

  if (!body.eventType || !Array.isArray(body.rows) || body.rows.length === 0) {
    res.status(400).json({ error: 'eventType and a non-empty rows array are required' });
    return;
  }

  const results: Array<{ assetNumber: string; status: 'posted' | 'failed'; error?: string }> = [];
  const eventType = body.eventType as LifecyclePreviewInput['eventType'];
  const postedBy = body.postedBy?.trim() || 'system';

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

      await assertAdditionAllowed(eventType, assetNumber, preview);

      await insertLifecycleTransaction({
        assetNumber,
        eventType,
        fields: input.fields,
        preview,
        postedBy,
      });

      applyLifecycleEvent(eventType, assetNumber.trim(), input.fields, preview);

      results.push({ assetNumber, status: 'posted' });
    } catch (err) {
      console.error(`Bulk import row failed for asset ${assetNumber}:`, err);
      results.push({ assetNumber, status: 'failed', error: err instanceof Error ? err.message : 'Unknown error' });
    }
  }

  res.json({ results });
});

// POST /api/lifecycle/bulk-post — Master Data Set page's "Post All" click.
// Body: { rows: [{ eventType: <label>, assetNumber, fields }, ...] }
// Unlike /bulk-import (one eventType shared by every row, CSV-driven), each
// row here carries its OWN eventType — that's what lets one request cover
// both Master Data Set modes:
//   • "Same Transaction -> Many Assets": every row shares eventType, differs
//     by assetNumber (fields are identical across rows, set once on screen).
//   • "Multiple Transactions -> One Asset": every row shares assetNumber,
//     differs by eventType + fields (several event cards queued for one
//     asset, posted together).
// Runs the exact same preview -> Postgres insert -> applyLifecycleEvent
// pipeline as /bulk-import, just keyed per row instead of per file. One
// row failing does not stop the rest — each row's outcome comes back
// individually so the UI can flag just the failed ones.
lifecycleRouter.post('/bulk-post', async (req, res) => {
  const body = req.body as {
    postedBy?: string;
    rows?: Array<{ eventType?: string; assetNumber?: string; fields?: Record<string, unknown> }>;
  };

  if (!Array.isArray(body.rows) || body.rows.length === 0) {
    res.status(400).json({ error: 'a non-empty rows array is required' });
    return;
  }

  const postedBy = body.postedBy?.trim() || 'system';
  type BulkPostResult = { assetNumber: string; eventType: string; status: 'posted' | 'failed'; error?: string };
  const results: BulkPostResult[] = new Array(body.rows.length);

  // A mixed file (e.g. asset 01 Addition, asset 02 Retirement, asset 02
  // Adjustment) can list rows in any order. Process every Addition FIRST
  // (file order kept within each group), so an asset created by an Addition
  // in this same file already exists when its Adjustment/Retirement/etc. is
  // applied — otherwise those events would auto-create a placeholder asset
  // and the real Addition would then be rejected by the one-Addition rule.
  // Results are still returned in the ORIGINAL row order so the UI can map
  // each outcome back to its CSV line.
  const order = body.rows
    .map((row, index) => ({ row, index, first: isAddition(row.eventType) ? 0 : 1 }))
    .sort((x, y) => x.first - y.first || x.index - y.index);

  for (const { row, index } of order) {
    const assetNumber = row.assetNumber ?? '';
    const eventType = (row.eventType ?? '') as LifecyclePreviewInput['eventType'];

    if (!assetNumber.trim()) {
      results[index] = { assetNumber, eventType, status: 'failed', error: 'Missing Asset Number' };
      continue;
    }
    if (!eventType) {
      results[index] = { assetNumber, eventType, status: 'failed', error: 'Missing Event Type' };
      continue;
    }

    try {
      const input: LifecyclePreviewInput = {
        eventType,
        assetNumber,
        fields: (row.fields ?? {}) as LifecyclePreviewInput['fields']
      };
      const preview = calculateLifecyclePreview(input);

      await assertAdditionAllowed(eventType, assetNumber, preview);

      await insertLifecycleTransaction({
        assetNumber,
        eventType,
        fields: input.fields,
        preview,
        postedBy,
      });

      applyLifecycleEvent(eventType, assetNumber.trim(), input.fields, preview);

      results[index] = { assetNumber, eventType, status: 'posted' };
    } catch (err) {
      console.error(`Bulk post row failed for asset ${assetNumber} (${eventType}):`, err);
      results[index] = { assetNumber, eventType, status: 'failed', error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }

  res.json({ results });
});

// Row shape shared by both /transactions endpoints below.
type TransactionRow = {
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
  posted_at_ts: string | number;
  posted_by: string;
};

// ======================================================
// Function : fetchLifecycleTransactions
// Purpose  : DEDUPED — GET /transactions and GET /transactions/:assetNumber
//            used to each run their own (near-identical, only the WHERE
//            clause and LIMIT differed) SELECT + row-mapping. Now both
//            call this one function, so the column list and the JSON-
//            column parsing only have to be correct in one place. Pass
//            assetNumber to filter to one asset (Asset Detail → Transactions
//            tab); omit it to get every asset's ledger, newest first,
//            capped at `limit` (Asset Register → Posted Lifecycle Events).
// ======================================================

async function fetchLifecycleTransactions(options: { assetNumber?: string; limit?: number }) {
  const params: unknown[] = [];
  let whereClause = '';
  let limitClause = '';

  if (options.assetNumber) {
    params.push(options.assetNumber);
    whereClause = `WHERE asset_number = $${params.length}`;
  } else {
    params.push(Math.min(options.limit ?? 200, 1000));
    limitClause = `LIMIT $${params.length}`;
  }

  const result = await pool.query<TransactionRow>(
    `SELECT
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
       extract(epoch FROM posted_at) AS posted_at_ts,
       posted_by
     FROM asset_transactions
     ${whereClause}
     ORDER BY posted_at DESC
     ${limitClause}`,
    params
  );

  const raw = result.rows;

  return raw.map((row) => ({
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
    postedAt: toIsoUtc(row.posted_at_ts, row.posted_at),
    postedBy: row.posted_by,
  }));
}

// GET /api/lifecycle/transactions — reads back every posted lifecycle event
// for EVERY asset from the Postgres asset_transactions ledger, newest
// first. This is what powers the Asset Register page's "Posted Lifecycle
// Events" table: clicking a row there shows the full calculation (badge,
// summary rows, formula note, and the full step-by-step sections breakdown)
// exactly as it looked at the moment it was posted.
lifecycleRouter.get('/transactions', async (req, res) => {
  try {
    const items = await fetchLifecycleTransactions({ limit: Number(req.query.limit) || 200 });
    res.json({ total: items.length, items });
  } catch (err) {
    console.error('Failed to fetch lifecycle transactions:', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// GET /api/lifecycle/transactions/:assetNumber — reads back everything that
// has been "Confirm & Post"-ed for this asset from the Postgres
// asset_transactions ledger, newest first. This is what powers the
// Asset Register → Asset Detail → "Transactions" tab: clicking a row on
// that tab shows the full calculation (badge, summary rows, formula note,
// and the full step-by-step sections breakdown) exactly as it looked at
// the moment it was posted.
lifecycleRouter.get('/transactions/:assetNumber', async (req, res) => {
  try {
    const items = await fetchLifecycleTransactions({ assetNumber: req.params.assetNumber });
    res.json({ total: items.length, items });
  } catch (err) {
    console.error('Failed to fetch lifecycle transactions:', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Postgres `timestamptz` can come back as a zone-less-looking string ('2026-09-19 10:00:00')
// in the SERVER's timezone. `new Date()` in the browser reads that as the
// BROWSER's local time, so every timestamp was shifted by the difference
// between the two zones (that's the wrong time on the Audit Trail). The epoch
// seconds from toUnixTimestamp() are zone-independent, so send a real UTC ISO
// string instead — the browser then converts it to the viewer's own zone.
function toIsoUtc(epochSeconds: string | number | undefined, fallback: string): string {
  const secs = Number(epochSeconds);
  if (Number.isFinite(secs) && secs > 0) return new Date(secs * 1000).toISOString();
  return fallback;
}

// Small helper — the *_json columns come back as plain
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
