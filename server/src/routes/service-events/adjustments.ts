// ======================================================
// File Name : adjustments.ts
// Purpose   : Service API - ADJUSTMENT only (change the cost basis of an existing asset).
//               POST /api/service/lifecycle/adjustments        one OR many Adjustment (body decides: single object or { rows: [...] })
//               POST /api/service/lifecycle/adjustments/bulk   many Adjustments
//             Body: { assetNumber, externalRef?, fields: { ... } }  (no eventType)
//             The asset must already exist; originalCost, placedInService, life,
//             bonusPct, assetType, convention are filled from the register when
//             left out. Always required: adjustmentAmount (+ or -, not 0) and
//             effectiveDate. accountingPeriodDate defaults to effectiveDate.
//             Shorthand: amount = adjustmentAmount, date = effectiveDate, cost = originalCost.
// ======================================================

import { Router } from 'express';
import { postBulkEvents, postEvent } from '../../services/servicePipeline.js';
import type { ServiceEventSpec } from '../../services/servicePipeline.js';

export const adjustmentSpec: ServiceEventSpec = {
  eventType: 'Adjustment',
  required: ['adjustmentAmount', 'effectiveDate'],
  validate: (f) => {
    const amount = Number(f.adjustmentAmount);
    if (!Number.isFinite(amount) || amount === 0) return 'Adjustment: adjustmentAmount must be a non-zero number (negative reduces cost)';
    return null;
  }
};

export const adjustmentsRouter = Router();
adjustmentsRouter.post('/lifecycle/adjustments', (req, res) => postEvent(adjustmentSpec, req, res));
adjustmentsRouter.post('/lifecycle/adjustments/bulk', (req, res) => postBulkEvents(adjustmentSpec, req, res));
