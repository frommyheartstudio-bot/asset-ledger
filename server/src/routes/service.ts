// ======================================================
// File Name : service.ts
// Purpose   : Machine-to-machine API for external systems (ERP etc.) to
//             post lifecycle events and read results back. Mounted at
//             /api/service.
//             WRITE
//               POST /lifecycle/additions | adjustments | transfers | retirements |
//                    reinstatements | reclassifications   one event, ONE endpoint per type
//                    (+ /bulk on each)                    -> routes/service-events/<event>.ts
//               POST /lifecycle/events       one event, generic (eventType in body)
//               POST /lifecycle/bulk-import  many rows, ONE event type
//               POST /lifecycle/bulk-post    many rows, MIXED event types
//             READ
//               GET  /me                           who this key is + its limits
//               GET  /assets                       list / filter assets
//               GET  /assets/:assetNumber          one asset (+ schedule)
//               GET  /lifecycle/transactions       posted ledger rows, filterable + paged
//               GET  /lifecycle/events/by-ref/:ref status of an event by externalRef
//             Differences from the browser endpoints under /api/lifecycle:
//               - every request needs a valid x-api-key (serviceAuth.ts)
//               - posted_by is taken from the key's service account
//                 ("svc:<name>"), never from the request body
//               - the account may be limited to certain event types AND
//                 certain companies (reads are company-scoped too)
//               - request size and row count are capped (env-tunable)
//               - rows may carry an `externalRef` (single event: also the
//                 Idempotency-Key header) so a retry never double-posts
//                 (serviceIdempotency.ts)
//             The posting itself is the SAME code the UI uses
//             (runBulkPost in routes/lifecycle.ts).
// ======================================================

import express, { Router } from 'express';
import type { Request, Response } from 'express';
import { requireServiceKey } from '../middleware/serviceAuth.js';
import { canonicalEvent, companyAllowed } from '../services/serviceAccounts.js';
import { cleanRef, findRef } from '../services/serviceIdempotency.js';
import { countLifecycleTransactions, fetchLifecycleTransactions } from './lifecycle.js';
import { MAX_ROWS, identity, isPermitted, postedByOf, processRows, summarize, tooMany } from '../services/servicePipeline.js';
import type { ServiceRow } from '../services/servicePipeline.js';
import { serviceEventsRouter } from './service-events/index.js';
import { assets, depreciationSchedules, ensureTaxFactPatterns, findAsset, persist, timelines } from '../data/assets.js';
import { resolveBook } from '../data/books.js';
import { ensureSchedules } from '../services/schedule-builder.js';
import { primeBookRules, scheduleForBook, viewAssetForBook, viewAssetsForBook } from '../services/book-view.js';

export const serviceRouter = Router();

const BODY_LIMIT = process.env.SERVICE_BODY_LIMIT || '10mb';
const DEFAULT_PAGE = 100;
const MAX_PAGE = 500;

// Own JSON parser (bigger limit than the app default) — must run BEFORE
// the key check so an oversized body is rejected early with a clear 413.
serviceRouter.use(express.json({ limit: BODY_LIMIT }));
serviceRouter.use(requireServiceKey);

// One endpoint per event type (additions, adjustments, transfers, ...) - see routes/service-events/
serviceRouter.use(serviceEventsRouter);
console.log('[service-api] per-event routes loaded: POST /api/service/lifecycle/{additions,adjustments,transfers,retirements,reinstatements,reclassifications}[/bulk]');

const canSeeAsset = (res: Response, company: unknown) => companyAllowed(identity(res).allowedCompanies, company);

// POST /api/service/lifecycle/events
// Body: { eventType: 'Adjustment', assetNumber: 'FA-1', externalRef?: 'INV-77', fields: { ... } }
// (the ref may also come in the Idempotency-Key header)
// 201 = posted, 200 = same externalRef already posted (duplicate: true, nothing new written),
// 422 = rejected (reason in "error"), 409 = externalRef conflict / still processing,
// 403 = key not allowed this event type.
serviceRouter.post('/lifecycle/events', async (req, res) => {
  const body = req.body as { eventType?: string; assetNumber?: string; externalRef?: unknown; fields?: Record<string, unknown> };

  const eventType = canonicalEvent(body.eventType);
  if (!eventType) {
    res.status(400).json({ error: `eventType is required and must be one of: Addition, Adjustment, Transfer, Retirement, Reinstatement, Reclassification` });
    return;
  }
  if (!body.assetNumber || typeof body.assetNumber !== 'string' || !body.assetNumber.trim()) {
    res.status(400).json({ error: 'assetNumber is required' });
    return;
  }
  if (!isPermitted(res, eventType)) {
    res.status(403).json({ error: `This API key is not allowed to post ${eventType} events` });
    return;
  }

  const externalRef = body.externalRef ?? req.header('idempotency-key');
  const [result] = await processRows([{ eventType, assetNumber: body.assetNumber, externalRef, fields: body.fields ?? {} }], res);

  if (result.status === 'posted') res.status(result.duplicate ? 200 : 201).json(result);
  else res.status(result.code ? 409 : 422).json(result);
});

// POST /api/service/lifecycle/bulk-import
// Body: { eventType: 'Addition', rows: [{ assetNumber, externalRef?, fields }, ...] }
// All rows share one event type (same contract as the Bulk Import page).
serviceRouter.post('/lifecycle/bulk-import', async (req, res) => {
  const body = req.body as { eventType?: string; rows?: Array<{ assetNumber?: string; externalRef?: unknown; fields?: Record<string, unknown> }> };

  if (!body.eventType || !Array.isArray(body.rows) || body.rows.length === 0) {
    res.status(400).json({ error: 'eventType and a non-empty rows array are required' });
    return;
  }
  if (body.rows.length > MAX_ROWS) {
    res.status(413).json({ error: tooMany(body.rows.length) });
    return;
  }
  const eventType = canonicalEvent(body.eventType);
  if (!eventType) {
    res.status(400).json({ error: `Unknown eventType "${body.eventType}"` });
    return;
  }
  if (!isPermitted(res, eventType)) {
    res.status(403).json({ error: `This API key is not allowed to post ${eventType} events` });
    return;
  }

  const results = await processRows(body.rows.map((r) => ({ ...r, eventType })), res);
  res.json({ summary: summarize(results), results });
});

// POST /api/service/lifecycle/bulk-post
// Body: { rows: [{ eventType, assetNumber, externalRef?, fields }, ...] }
// Each row carries its own event type (mixed batches allowed). Rows whose
// event type the key may not post (or that are unknown) fail individually;
// the rest are still posted. Results come back in the original row order.
serviceRouter.post('/lifecycle/bulk-post', async (req, res) => {
  const body = req.body as { rows?: ServiceRow[] };

  if (!Array.isArray(body.rows) || body.rows.length === 0) {
    res.status(400).json({ error: 'a non-empty rows array is required' });
    return;
  }
  if (body.rows.length > MAX_ROWS) {
    res.status(413).json({ error: tooMany(body.rows.length) });
    return;
  }

  const results = await processRows(body.rows, res);
  res.json({ summary: summarize(results), results });
});

// ======================================================
// READ endpoints (company-scoped to the key)
// ======================================================

// Small query-string helpers: invalid values answer 400 instead of being silently ignored.
const str = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() ? v.trim() : undefined);

function pageOf(req: Request): { limit: number; offset: number } | { error: string } {
  const limit = req.query.limit === undefined ? DEFAULT_PAGE : Number(req.query.limit);
  const offset = req.query.offset === undefined ? 0 : Number(req.query.offset);
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_PAGE) return { error: `limit must be a whole number from 1 to ${MAX_PAGE}` };
  if (!Number.isInteger(offset) || offset < 0) return { error: 'offset must be a whole number, 0 or more' };
  return { limit, offset };
}

function dateOf(value: unknown, name: string): Date | undefined | { error: string } {
  const text = str(value);
  if (!text) return undefined;
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(text) ? `${text}T00:00:00Z` : text);
  return Number.isNaN(d.getTime()) ? { error: `${name} must be a date (YYYY-MM-DD) or an ISO timestamp` } : d;
}

// GET /api/service/me — what this key is allowed to do (handy for a connection test).
serviceRouter.get('/me', (_req, res) => {
  const svc = identity(res);
  res.json({
    name: svc.name,
    postedBy: postedByOf(res),
    allowedEvents: svc.allowedEvents.length ? svc.allowedEvents : 'all',
    allowedCompanies: svc.allowedCompanies.length ? svc.allowedCompanies : 'all'
  });
});

// GET /api/service/assets?book=&company=&status=&assetClass=&method=&q=&limit=&offset=
serviceRouter.get('/assets', async (req, res) => {
  const page = pageOf(req);
  if ('error' in page) { res.status(400).json({ error: page.error }); return; }

  const book = resolveBook(req.query.book);
  await primeBookRules();

  const company = str(req.query.company);
  const status = str(req.query.status);
  const assetClass = str(req.query.assetClass);
  const method = str(req.query.method);
  const q = str(req.query.q)?.toLowerCase();

  const visible = assets.filter((a) => canSeeAsset(res, a.company));
  let results = viewAssetsForBook(visible, book);
  if (company) results = results.filter((a) => a.company.toUpperCase() === company.toUpperCase());
  if (status) results = results.filter((a) => a.status === status);
  if (assetClass) results = results.filter((a) => a.assetClass === assetClass);
  if (method) results = results.filter((a) => a.method === method);
  if (q) results = results.filter((a) => a.assetNumber.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));

  results = [...results].sort((a, b) => a.assetNumber.localeCompare(b.assetNumber));
  res.json({
    book,
    total: results.length,
    limit: page.limit,
    offset: page.offset,
    items: results.slice(page.offset, page.offset + page.limit)
  });
});

// GET /api/service/assets/:assetNumber?book=
// 404 both for an unknown asset and for one outside the key's companies (existence is not revealed).
serviceRouter.get('/assets/:assetNumber', async (req, res) => {
  const book = resolveBook(req.query.book);
  await primeBookRules();
  const asset = findAsset(req.params.assetNumber);
  if (!asset || !canSeeAsset(res, asset.company)) {
    res.status(404).json({ error: 'Asset not found' });
    return;
  }
  if (!asset.taxFactPattern) {
    ensureSchedules([asset], depreciationSchedules);
    if (ensureTaxFactPatterns([asset], depreciationSchedules).length > 0) persist();
  }
  res.json({
    book,
    asset: viewAssetForBook(asset, book),
    timeline: timelines[asset.assetNumber] ?? [],
    depreciationSchedule: scheduleForBook(asset, book)
  });
});

// GET /api/service/lifecycle/transactions?assetNumber=&eventType=&since=&until=&mine=true&limit=&offset=
// Posted ledger rows, newest first. mine=true -> only rows this key posted itself.
serviceRouter.get('/lifecycle/transactions', async (req, res) => {
  const page = pageOf(req);
  if ('error' in page) { res.status(400).json({ error: page.error }); return; }

  const since = dateOf(req.query.since, 'since');
  const until = dateOf(req.query.until, 'until');
  if (since && 'error' in since) { res.status(400).json(since); return; }
  if (until && 'error' in until) { res.status(400).json(until); return; }

  const eventTypeRaw = str(req.query.eventType);
  const eventType = eventTypeRaw ? canonicalEvent(eventTypeRaw) : undefined;
  if (eventTypeRaw && !eventType) { res.status(400).json({ error: `Unknown eventType "${eventTypeRaw}"` }); return; }

  const assetNumber = str(req.query.assetNumber);
  const limited = identity(res).allowedCompanies.length > 0;

  // Company-limited key: only ledger rows of assets in its companies. An asset
  // outside them behaves like an unknown one (empty result, nothing revealed).
  let assetNumbers: string[] | undefined;
  if (limited) {
    assetNumbers = assets.filter((a) => canSeeAsset(res, a.company)).map((a) => a.assetNumber);
    if (assetNumber && !assetNumbers.includes(assetNumber)) assetNumbers = [];
  }

  const filter = {
    assetNumber: assetNumber && !limited ? assetNumber : undefined,
    assetNumbers: limited ? (assetNumber ? assetNumbers!.filter((n) => n === assetNumber) : assetNumbers) : undefined,
    eventType,
    since: since as Date | undefined,
    until: until as Date | undefined,
    postedBy: req.query.mine === 'true' ? postedByOf(res) : undefined
  };

  try {
    const [total, items] = await Promise.all([
      countLifecycleTransactions(filter),
      fetchLifecycleTransactions({ ...filter, limit: page.limit, offset: page.offset })
    ]);
    res.json({ total, limit: page.limit, offset: page.offset, items });
  } catch (err) {
    console.error('Service API: could not read transactions:', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// GET /api/service/lifecycle/events/by-ref/:ref
// "Did my event with this externalRef go through?" - the answer to a timed-out POST.
// state 'posted' = it is in the ledger, 'pending' = being processed right now, 404 = never seen / failed.
serviceRouter.get('/lifecycle/events/by-ref/:ref', async (req, res) => {
  let ref: string | null;
  try { ref = cleanRef(req.params.ref); } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Invalid externalRef' });
    return;
  }
  const found = ref ? await findRef(identity(res).name, ref) : null;
  if (!found) {
    res.status(404).json({ error: 'No event with this externalRef (it was never received, or it failed and can be re-sent)' });
    return;
  }
  res.json(found);
});

// ======================================================
// END OF FILE : service.ts
// ======================================================
