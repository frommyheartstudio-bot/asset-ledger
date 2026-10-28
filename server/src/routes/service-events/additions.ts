// ======================================================
// File Name : additions.ts
// Purpose   : Service API - ADDITION only.
//               POST /api/service/lifecycle/additions        one OR many Addition (body decides: single object or { rows: [...] })
//               POST /api/service/lifecycle/additions/bulk   many Additions
//             Body: { assetNumber, externalRef?, fields: { ... } }  (no eventType)
//             An Addition creates the asset, so nothing can be filled from the
//             register: cost, placedInService and accountingPeriodDate are
//             always required. (Shorthand: `date` = placedInService.)
//             Other fields: company, assetClass / assetType, lifeMonths,
//             quarter, convention, bonusPct, electOutBonus, book ...
//             (same keys as the UI Addition card).
// ======================================================

import { Router } from 'express';
import { postBulkEvents, postEvent } from '../../services/servicePipeline.js';
import type { ServiceEventSpec } from '../../services/servicePipeline.js';

const num = (v: unknown) => (typeof v === 'number' ? v : Number(v));

export const additionSpec: ServiceEventSpec = {
  eventType: 'Addition',
  required: ['cost', 'placedInService', 'accountingPeriodDate'],
  validate: (f) => {
    if (!(num(f.cost) > 0)) return 'Addition: cost must be greater than zero';
    if (f.bonusPct !== undefined && f.bonusPct !== '' && !(num(f.bonusPct) >= 0 && num(f.bonusPct) <= 100)) return 'Addition: bonusPct must be between 0 and 100';
    if (f.lifeMonths !== undefined && f.lifeMonths !== '' && !(num(f.lifeMonths) > 0)) return 'Addition: lifeMonths must be greater than zero';
    return null;
  }
};

export const additionsRouter = Router();
additionsRouter.post('/lifecycle/additions', (req, res) => postEvent(additionSpec, req, res));
additionsRouter.post('/lifecycle/additions/bulk', (req, res) => postBulkEvents(additionSpec, req, res));
