// ======================================================
// File Name : retirements.ts
// Purpose   : Service API - RETIREMENT only (dispose / write off an asset).
//               POST /api/service/lifecycle/retirements        one OR many Retirement (body decides: single object or { rows: [...] })
//               POST /api/service/lifecycle/retirements/bulk   many Retirements
//             Body: { assetNumber, externalRef?, fields: { ... } }  (no eventType)
//             cost, costDisposed (= full cost), placedInService, recovery period,
//             bonusPct, assetType, convention come from the register when left
//             out. Always required: disposalDate. proceeds is optional (sale
//             price; leave out for a write-off). Send costDisposed for a partial
//             retirement. Shorthand: date = disposalDate, amount = costDisposed.
// ======================================================

import { Router } from 'express';
import { postBulkEvents, postEvent } from '../../services/servicePipeline.js';
import type { ServiceEventSpec } from '../../services/servicePipeline.js';

const given = (v: unknown) => v !== undefined && v !== null && !(typeof v === 'string' && v.trim() === '');

export const retirementSpec: ServiceEventSpec = {
  eventType: 'Retirement',
  required: ['disposalDate'],
  validate: (f) => {
    if (given(f.proceeds) && !(Number(f.proceeds) >= 0)) return 'Retirement: proceeds must be zero or more';
    if (given(f.costDisposed) && !(Number(f.costDisposed) > 0)) return 'Retirement: costDisposed must be greater than zero';
    if (given(f.cost) && given(f.costDisposed) && Number(f.costDisposed) > Number(f.cost)) return 'Retirement: costDisposed cannot exceed cost';
    return null;
  }
};

export const retirementsRouter = Router();
retirementsRouter.post('/lifecycle/retirements', (req, res) => postEvent(retirementSpec, req, res));
retirementsRouter.post('/lifecycle/retirements/bulk', (req, res) => postBulkEvents(retirementSpec, req, res));
