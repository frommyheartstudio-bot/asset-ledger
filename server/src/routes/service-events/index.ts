// ======================================================
// File Name : index.ts
// Purpose   : Collects the six per-event Service API routers. Mounted in
//             routes/service.ts AFTER the key check, so every route here
//             already needs a valid x-api-key.
// ======================================================

import { Router } from 'express';
import { additionsRouter } from './additions.js';
import { adjustmentsRouter } from './adjustments.js';
import { transfersRouter } from './transfers.js';
import { retirementsRouter } from './retirements.js';
import { reinstatementsRouter } from './reinstatements.js';
import { reclassificationsRouter } from './reclassifications.js';

export const serviceEventsRouter = Router();
serviceEventsRouter.use(additionsRouter, adjustmentsRouter, transfersRouter, retirementsRouter, reinstatementsRouter, reclassificationsRouter);
