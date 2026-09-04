// ======================================================
// File Name : lifecycle.ts
// Purpose   : Defines HTTP route handlers for lifecycle
// ======================================================

import { Router } from 'express';
import { calculateLifecyclePreview } from '../services/depreciation.js';
import { ch } from '../db/clickhouse.js';
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
    res.json({ posted: true });
  } catch (err) {
    console.error('Failed to post lifecycle transaction:', err);
    res.status(500).json({ error: 'Failed to post transaction to ClickHouse' });
  }
});

// ======================================================
// END: GET /event-types
// ======================================================

// ======================================================
// END: Route Handlers
// ======================================================

