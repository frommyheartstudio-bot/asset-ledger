// ======================================================
// File Name : reinstatements.ts
// Purpose   : Service API - REINSTATEMENT only (restore a previously retired asset).
//               POST /api/service/lifecycle/reinstatements        one OR many Reinstatement (body decides: single object or { rows: [...] })
//               POST /api/service/lifecycle/reinstatements/bulk   many Reinstatements
//             Body: { assetNumber, externalRef?, fields: { ... } }  (no eventType)
//             The asset must be a retired one: original cost, PISD, life, bonusPct,
//             and the original disposal date / A-D / gain-loss are read from the
//             register. Always required: reinstatementDate. Shorthand: date = reinstatementDate.
// ======================================================

import { Router } from 'express';
import { postBulkEvents, postEvent } from '../../services/servicePipeline.js';
import type { ServiceEventSpec } from '../../services/servicePipeline.js';

export const reinstatementSpec: ServiceEventSpec = {
  eventType: 'Reinstatement',
  required: ['reinstatementDate'],
  validate: (f) => {
    if (Number.isNaN(new Date(String(f.reinstatementDate)).getTime())) return 'Reinstatement: reinstatementDate must be a valid date (YYYY-MM-DD)';
    return null;
  }
};

export const reinstatementsRouter = Router();
reinstatementsRouter.post('/lifecycle/reinstatements', (req, res) => postEvent(reinstatementSpec, req, res));
reinstatementsRouter.post('/lifecycle/reinstatements/bulk', (req, res) => postBulkEvents(reinstatementSpec, req, res));
