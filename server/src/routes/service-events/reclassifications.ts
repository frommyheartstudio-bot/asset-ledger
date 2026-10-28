// ======================================================
// File Name : reclassifications.ts
// Purpose   : Service API - RECLASSIFICATION only (change method, life, convention or bonus).
//               POST /api/service/lifecycle/reclassifications        one OR many Reclassification (body decides: single object or { rows: [...] })
//               POST /api/service/lifecycle/reclassifications/bulk   many Reclassifications
//             Body: { assetNumber, externalRef?, fields: { ... } }  (no eventType)
//             The "old*" values, originalCost and PISD come from the register when
//             left out. Always required: effectiveDate and newAssetType. At least
//             one of newMethod / newLifeMonths / newConvention / newBonusPct should
//             differ from the old value (the calculator rejects a no-change).
//             Shorthand: date = effectiveDate.
// ======================================================

import { Router } from 'express';
import { postBulkEvents, postEvent } from '../../services/servicePipeline.js';
import type { ServiceEventSpec } from '../../services/servicePipeline.js';

export const reclassificationSpec: ServiceEventSpec = {
  eventType: 'Reclassification',
  required: ['effectiveDate', 'newAssetType'],
  validate: (f) => {
    if (f.newLifeMonths !== undefined && f.newLifeMonths !== '' && !(Number(f.newLifeMonths) > 0)) return 'Reclassification: newLifeMonths must be greater than zero';
    if (f.newBonusPct !== undefined && f.newBonusPct !== '' && !(Number(f.newBonusPct) >= 0 && Number(f.newBonusPct) <= 100)) return 'Reclassification: newBonusPct must be between 0 and 100';
    return null;
  }
};

export const reclassificationsRouter = Router();
reclassificationsRouter.post('/lifecycle/reclassifications', (req, res) => postEvent(reclassificationSpec, req, res));
reclassificationsRouter.post('/lifecycle/reclassifications/bulk', (req, res) => postBulkEvents(reclassificationSpec, req, res));
