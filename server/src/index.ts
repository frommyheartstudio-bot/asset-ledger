// ======================================================
// File Name : index.ts
// Purpose   : Implements index
// ======================================================

import cors from 'cors';
import express from 'express';
import { assetsRouter } from './routes/assets.js';
import { dashboardRouter } from './routes/dashboard.js';
import { forecastingRouter, reportingRouter, usersRouter } from './routes/misc.js';
import { lifecycleRouter } from './routes/lifecycle.js';
import { modelingRouter } from './routes/modeling.js';


// ======================================================
// START: index Functions
// ======================================================

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/dashboard', dashboardRouter);
app.use('/api/assets', assetsRouter);
app.use('/api/lifecycle', lifecycleRouter);
app.use('/api/modeling', modelingRouter);
app.use('/api/forecasting', forecastingRouter);
app.use('/api/reporting', reportingRouter);
app.use('/api/users', usersRouter);

app.listen(PORT, () => {
  console.log(`AssetLedger API listening on http://localhost:${PORT}`);
});

// ======================================================
// END: index Functions
// ======================================================

