// ======================================================
// File Name : servicePipeline.ts
// Purpose   : The shared back half of every Service API write endpoint (the
//             generic /lifecycle/events AND the per-event endpoints in
//             routes/service-events/). It holds only what is identical for
//             all events: key identity, event-type permission, company
//             limit, externalRef idempotency and the call into runBulkPost.
//             What differs per event (route, required fields, validation,
//             docs) lives in that event's own file.
// ======================================================

import type { Response } from 'express';
import type { ServiceIdentity } from '../middleware/serviceAuth.js';
import { canonicalEvent, companyAllowed } from './serviceAccounts.js';
import { claimRef, cleanRef, completeRef, releaseRef } from './serviceIdempotency.js';
import { runBulkPost } from '../routes/lifecycle.js';
import type { BulkPostRow, BulkPostResult } from '../routes/lifecycle.js';
import { findAsset } from '../data/assets.js';
import { normalizeKeys } from './registerPrefill.js';
import type { Request } from 'express';

export const MAX_ROWS = Number(process.env.SERVICE_MAX_ROWS) > 0 ? Number(process.env.SERVICE_MAX_ROWS) : 500;
export const tooMany = (n: number) => `Too many rows (${n}). Maximum per request is ${MAX_ROWS}; split the batch.`;

export const identity = (res: Response): ServiceIdentity => res.locals.service as ServiceIdentity;
export const postedByOf = (res: Response) => `svc:${identity(res).name}`;

// canonical = "Addition" etc. Empty allowedEvents means every event type.
export const isPermitted = (res: Response, canonical: string) => {
  const allowed = identity(res).allowedEvents;
  return allowed.length === 0 || allowed.includes(canonical.toLowerCase());
};


// ======================================================
// Row processing (shared by all three write endpoints)
// ======================================================

export type ServiceRow = BulkPostRow & { externalRef?: unknown };
export type ServiceResult = BulkPostResult & {
  externalRef?: string;
  duplicate?: boolean;   // true = this externalRef was already posted; nothing new was written
  code?: 'ref_conflict' | 'ref_in_progress'; // lets the single-event endpoint answer 409
};

export function summarize(results: Array<{ status: 'posted' | 'failed' }>) {
  const posted = results.filter((r) => r.status === 'posted').length;
  return { total: results.length, posted, failed: results.length - posted };
}

// ======================================================
// Function : companyBlockReason
// Purpose  : Per-company limit of a key. Returns why this row may not be
//            posted, or null when it is fine (always null for a key with
//            no company limit).
//              Addition       -> the company on the row (blank = '5B', the
//                                same default the register uses) must be allowed
//              other events   -> the asset's CURRENT company must be allowed
//                                (an unknown asset is refused - a limited key
//                                may not create placeholder assets)
//              Transfer       -> the destination company must be allowed too
//            batchAdditions = companies of Additions earlier in this same
//            request (they post first, so later rows may refer to them).
// ======================================================

function companyBlockReason(
  allowed: string[],
  eventType: string,
  assetNumber: string,
  fields: Record<string, unknown>,
  batchAdditions: Map<string, string>
): string | null {
  if (allowed.length === 0) return null;
  const limit = `This API key may only use companies: ${allowed.join(', ')}`;

  if (eventType === 'Addition') {
    const company = typeof fields.company === 'string' && fields.company.trim() ? fields.company.trim() : '5B';
    return companyAllowed(allowed, company) ? null : `${limit} (this Addition is for company ${company}).`;
  }

  const key = assetNumber.trim();
  const company = findAsset(key)?.company ?? batchAdditions.get(key);
  if (company === undefined) return `Asset ${key} was not found among the companies this API key may use.`;
  if (!companyAllowed(allowed, company)) return `${limit} (asset ${key} belongs to company ${company}).`;

  if (eventType === 'Transfer') {
    const dest = typeof fields.destCompany === 'string' ? fields.destCompany.trim() : '';
    if (dest && !companyAllowed(allowed, dest)) return `${limit} (destination company ${dest}).`;
  }
  return null;
}

// ======================================================
// Function : processRows
// Purpose  : The one place every write endpoint goes through:
//              1. event type known + permitted for the key
//              2. company limit of the key
//              3. externalRef: a ref already posted returns its stored
//                 outcome (duplicate: true) instead of posting again; a ref
//                 reused for a different event is refused
//              4. the remaining rows are posted by runBulkPost - the SAME
//                 pipeline as the UI (Additions first, one row failing
//                 never stops the others)
//              5. refs of posted rows are remembered, refs of failed rows
//                 are released so the caller can fix the data and retry
//            Results come back in the original row order.
// ======================================================

export async function processRows(rows: ServiceRow[], res: Response): Promise<ServiceResult[]> {
  const svc = identity(res);
  const postedBy = postedByOf(res);
  const results: ServiceResult[] = new Array(rows.length);
  const toPost: BulkPostRow[] = [];
  const toPostIndex: number[] = [];
  const claimed = new Map<number, string>();   // row index -> externalRef this request now owns
  const refsInBatch = new Set<string>();
  const batchAdditions = new Map<string, string>();

  try {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const assetNumber = typeof row.assetNumber === 'string' ? row.assetNumber : '';
      const eventType = canonicalEvent(row.eventType);
      const fields = (row.fields ?? {}) as Record<string, unknown>;

      if (!eventType) {
        results[i] = { assetNumber, eventType: String(row.eventType ?? ''), status: 'failed', error: row.eventType ? `Unknown event type "${row.eventType}"` : 'Missing Event Type' };
        continue;
      }
      if (!assetNumber.trim()) {
        results[i] = { assetNumber, eventType, status: 'failed', error: 'Missing Asset Number' };
        continue;
      }
      if (!isPermitted(res, eventType)) {
        results[i] = { assetNumber, eventType, status: 'failed', error: `This API key is not allowed to post ${eventType} events` };
        continue;
      }

      let ref: string | null;
      try { ref = cleanRef(row.externalRef); } catch (err) {
        results[i] = { assetNumber, eventType, status: 'failed', error: err instanceof Error ? err.message : 'Invalid externalRef' };
        continue;
      }

      const blocked = companyBlockReason(svc.allowedCompanies, eventType, assetNumber, fields, batchAdditions);
      if (blocked) {
        results[i] = { assetNumber, eventType, status: 'failed', error: blocked, ...(ref ? { externalRef: ref } : {}) };
        continue;
      }

      if (ref) {
        if (refsInBatch.has(ref)) {
          results[i] = { assetNumber, eventType, status: 'failed', externalRef: ref, error: `externalRef "${ref}" appears more than once in this request - each event needs its own ref.` };
          continue;
        }
        refsInBatch.add(ref);

        const claim = await claimRef(svc.name, ref, eventType, assetNumber.trim());
        if (!claim.claimed) {
          const sameEvent = claim.eventType === eventType && claim.assetNumber === assetNumber.trim();
          if (!sameEvent) {
            results[i] = { assetNumber, eventType, status: 'failed', externalRef: ref, code: 'ref_conflict', error: `externalRef "${ref}" was already used for a different event (${claim.eventType} on ${claim.assetNumber}).` };
          } else if (claim.state === 'posted') {
            results[i] = { assetNumber, eventType, status: 'posted', externalRef: ref, duplicate: true };
          } else {
            results[i] = { assetNumber, eventType, status: 'failed', externalRef: ref, code: 'ref_in_progress', error: `externalRef "${ref}" is still being processed - retry in a moment.` };
          }
          continue;
        }
        claimed.set(i, ref);
      }

      if (eventType === 'Addition') {
        const company = typeof fields.company === 'string' && fields.company.trim() ? fields.company.trim() : '5B';
        batchAdditions.set(assetNumber.trim(), company);
      }
      toPost.push({ eventType, assetNumber, fields });
      toPostIndex.push(i);
    }

    if (toPost.length > 0) {
      const posted = await runBulkPost(toPost, postedBy);
      for (let j = 0; j < posted.length; j++) {
        const i = toPostIndex[j];
        const ref = claimed.get(i);
        results[i] = { ...posted[j], ...(ref ? { externalRef: ref } : {}) };
        if (ref) {
          if (posted[j].status === 'posted') {
            await completeRef(svc.name, ref, { assetNumber: posted[j].assetNumber.trim(), eventType: posted[j].eventType, status: 'posted' });
          } else {
            await releaseRef(svc.name, ref);
          }
          claimed.delete(i);
        }
      }
    }
  } finally {
    // Anything still claimed here means posting threw unexpectedly - free the refs so a retry works.
    for (const ref of claimed.values()) await releaseRef(svc.name, ref).catch(() => undefined);
  }

  return results;
}


// ======================================================
// Per-event endpoints: HTTP mechanics shared, rules NOT shared
// ======================================================
// Each event file (routes/service-events/<event>.ts) declares its own
// ServiceEventSpec - its required fields and its own validate() - and mounts
// two routes with postSingleEvent / postBulkEvents. Nothing here switches on
// the event type.

export interface ServiceEventSpec {
  /** Canonical label, e.g. 'Adjustment'. Fixed by the route - the caller never sends it. */
  eventType: string;
  /** Fields the caller must always send for this event (the register cannot fill them). */
  required: string[];
  /** This event's own extra rules. Return an error text, or null when fine. */
  validate: (fields: Record<string, unknown>) => string | null;
}

const isBlank = (v: unknown) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');

/** Returns why this row is unacceptable for the event, or null. Shorthand keys (date, cost, amount) count. */
export function checkEventRow(spec: ServiceEventSpec, assetNumber: unknown, rawFields: unknown): string | null {
  if (typeof assetNumber !== 'string' || !assetNumber.trim()) return 'assetNumber is required';
  const fields = normalizeKeys(spec.eventType, (rawFields && typeof rawFields === 'object' ? rawFields : {}) as Record<string, unknown>);
  const missing = spec.required.filter((k) => isBlank(fields[k]));
  if (missing.length) return `${spec.eventType} needs: ${missing.join(', ')}`;
  return spec.validate(fields);
}

// POST <event path>   Body: { assetNumber, externalRef?, fields: { ... } }   (eventType is NOT sent)
// 201 posted | 200 duplicate externalRef | 400 bad request | 403 key not allowed | 409 ref conflict | 422 rejected
export async function postSingleEvent(spec: ServiceEventSpec, req: Request, res: Response): Promise<void> {
  const body = (req.body ?? {}) as { eventType?: string; assetNumber?: string; externalRef?: unknown; fields?: Record<string, unknown> };

  if (body.eventType && canonicalEvent(body.eventType) !== spec.eventType) {
    res.status(400).json({ error: `This endpoint only posts ${spec.eventType} events - remove eventType from the body or use /lifecycle/events.` });
    return;
  }
  if (!isPermitted(res, spec.eventType)) {
    res.status(403).json({ error: `This API key is not allowed to post ${spec.eventType} events` });
    return;
  }
  const problem = checkEventRow(spec, body.assetNumber, body.fields);
  if (problem) {
    res.status(400).json({ error: problem });
    return;
  }

  const externalRef = body.externalRef ?? req.header('idempotency-key');
  const [result] = await processRows([{ eventType: spec.eventType, assetNumber: body.assetNumber, externalRef, fields: body.fields ?? {} }], res);

  if (result.status === 'posted') res.status(result.duplicate ? 200 : 201).json(result);
  else res.status(result.code ? 409 : 422).json(result);
}

// POST <event path>/bulk   Body: { rows: [{ assetNumber, externalRef?, fields }, ...] }  - all rows are this one event
export async function postBulkEvents(spec: ServiceEventSpec, req: Request, res: Response): Promise<void> {
  const body = (req.body ?? {}) as { rows?: Array<{ assetNumber?: string; externalRef?: unknown; fields?: Record<string, unknown> }> };

  if (!Array.isArray(body.rows) || body.rows.length === 0) {
    res.status(400).json({ error: 'a non-empty rows array is required' });
    return;
  }
  if (body.rows.length > MAX_ROWS) {
    res.status(413).json({ error: tooMany(body.rows.length) });
    return;
  }
  if (!isPermitted(res, spec.eventType)) {
    res.status(403).json({ error: `This API key is not allowed to post ${spec.eventType} events` });
    return;
  }

  // Rows that break this event's own rules fail alone; the rest are posted.
  const results: ServiceResult[] = new Array(body.rows.length);
  const good: ServiceRow[] = [];
  const goodIndex: number[] = [];
  body.rows.forEach((row, i) => {
    const assetNumber = typeof row.assetNumber === 'string' ? row.assetNumber : '';
    const problem = checkEventRow(spec, row.assetNumber, row.fields);
    if (problem) {
      results[i] = { assetNumber, eventType: spec.eventType, status: 'failed', error: problem };
    } else {
      good.push({ ...row, eventType: spec.eventType });
      goodIndex.push(i);
    }
  });
  if (good.length > 0) {
    const posted = await processRows(good, res);
    posted.forEach((r, j) => { results[goodIndex[j]] = r; });
  }
  res.json({ summary: summarize(results), results });
}


// POST <event path>   ONE endpoint per event: the body decides single vs bulk.
//   single : { assetNumber, externalRef?, fields: { ... } }
//   bulk   : { rows: [ { assetNumber, externalRef?, fields }, ... ] }   (a bare JSON array also works)
// The old <event path>/bulk URL still works and does the same thing.
export async function postEvent(spec: ServiceEventSpec, req: Request, res: Response): Promise<void> {
  const body = req.body as unknown;
  if (Array.isArray(body)) req.body = { rows: body };
  const isBulk = Array.isArray((req.body as { rows?: unknown } | undefined)?.rows);
  if (isBulk) await postBulkEvents(spec, req, res);
  else await postSingleEvent(spec, req, res);
}

// ======================================================
// END OF FILE : servicePipeline.ts
// ======================================================
