// ======================================================
// File Name : transfers.ts
// Purpose   : Service API - TRANSFER only (move an asset between companies / locations).
//               POST /api/service/lifecycle/transfers        one OR many Transfer (body decides: single object or { rows: [...] })
//               POST /api/service/lifecycle/transfers/bulk   many Transfers
//             Body: { assetNumber, externalRef?, fields: { ... } }  (no eventType)
//             totalCost, placedInService, life, sourceCompany, sourceLocation come from
//             the register when left out. Always required: transferDate and
//             costTransferred, plus a destination (destCompany and/or destLocation).
//             Shorthand: date = transferDate, amount = costTransferred, cost = totalCost.
//             A company-limited key must also be allowed to use destCompany.
// ======================================================

import { Router } from 'express';
import { postBulkEvents, postEvent } from '../../services/servicePipeline.js';
import type { ServiceEventSpec } from '../../services/servicePipeline.js';

const filled = (v: unknown) => typeof v === 'string' ? v.trim() !== '' : v !== undefined && v !== null;

export const transferSpec: ServiceEventSpec = {
  eventType: 'Transfer',
  required: ['transferDate', 'costTransferred'],
  validate: (f) => {
    if (!(Number(f.costTransferred) > 0)) return 'Transfer: costTransferred must be greater than zero';
    if (!filled(f.destCompany) && !filled(f.destLocation)) return 'Transfer: destCompany or destLocation is required';
    if (filled(f.totalCost) && Number(f.costTransferred) > Number(f.totalCost)) return 'Transfer: costTransferred cannot exceed totalCost';
    return null;
  }
};

export const transfersRouter = Router();
transfersRouter.post('/lifecycle/transfers', (req, res) => postEvent(transferSpec, req, res));
transfersRouter.post('/lifecycle/transfers/bulk', (req, res) => postBulkEvents(transferSpec, req, res));
