// ======================================================
// File Name : modeling.ts
// Purpose   : Defines HTTP route handlers for modeling
// ======================================================

import { Router } from 'express';
import { calculateScenarioProjection } from '../services/depreciation.js';
import type { ScenarioInput } from '../types.js';


// ======================================================
// START: Route Handlers
// ======================================================

export const modelingRouter = Router();

const DEFAULT_BASIS = 1_000_000;

const DEFAULT_SCENARIOS: ScenarioInput[] = [
  { label: 'Scenario A — Baseline', method: 'MACRS ADS', bonusPct: 0, recoveryPeriodYears: 5 },
  { label: 'Scenario B — Bonus', method: 'MACRS 200% DB', bonusPct: 100, recoveryPeriodYears: 5 },
  { label: 'Scenario C — Elect ADS', method: 'Straight-Line', bonusPct: 0, recoveryPeriodYears: 7 }
];

// ======================================================
// Function : GET /scenarios
// Purpose  : Route handler for GET /scenarios
// Input    : req (HTTP request)
// Output   : res (HTTP response, JSON)
// ======================================================

modelingRouter.get('/scenarios', (_req, res) => {
  res.json({ basis: DEFAULT_BASIS, scenarios: DEFAULT_SCENARIOS });
});

// POST /api/modeling/compare — { basis?: number, scenarios: ScenarioInput[] }
modelingRouter.post('/compare', (req, res) => {
  const basis = Number(req.body?.basis ?? DEFAULT_BASIS);
  const scenarios: ScenarioInput[] = req.body?.scenarios ?? DEFAULT_SCENARIOS;

  const results = scenarios.map((s) => calculateScenarioProjection(basis, s));
  res.json({ basis, results });
});

// ======================================================
// END: GET /scenarios
// ======================================================

// ======================================================
// END: Route Handlers
// ======================================================

