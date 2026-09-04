// ======================================================
// File Name : dashboard.ts
// Purpose   : Defines HTTP route handlers for dashboard
// ======================================================

import { Router } from 'express';
import { dashboardSummary, recentActivity } from '../data/activity.js';


// ======================================================
// START: Route Handlers
// ======================================================

export const dashboardRouter = Router();

// ======================================================
// Function : GET /summary
// Purpose  : Route handler for GET /summary
// Input    : req (HTTP request)
// Output   : res (HTTP response, JSON)
// ======================================================

dashboardRouter.get('/summary', (_req, res) => {
  res.json(dashboardSummary);
});

dashboardRouter.get('/activity', (_req, res) => {
  res.json(recentActivity);
});

// ======================================================
// END: GET /summary
// ======================================================

// ======================================================
// END: Route Handlers
// ======================================================

