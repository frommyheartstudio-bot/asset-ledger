// ======================================================
// File Name : misc.ts
// Purpose   : Defines HTTP route handlers for misc
// ======================================================

import { Router } from 'express';
import { forecast } from '../data/activity.js';
import { generatedReports, reportCatalog, roles, users } from '../data/admin.js';


// ======================================================
// START: Route Handlers
// ======================================================

export const forecastingRouter = Router();
// ======================================================
// Function : GET /
// Purpose  : Route handler for GET /
// Input    : req (HTTP request)
// Output   : res (HTTP response, JSON)
// ======================================================

forecastingRouter.get('/', (_req, res) => res.json(forecast));

// ======================================================
// END: GET /
// ======================================================

export const reportingRouter = Router();
// ======================================================
// Function : GET /catalog
// Purpose  : Route handler for GET /catalog
// Input    : req (HTTP request)
// Output   : res (HTTP response, JSON)
// ======================================================

reportingRouter.get('/catalog', (_req, res) => res.json(reportCatalog));

// ======================================================
// END: GET /catalog
// ======================================================
// ======================================================
// Function : GET /recent
// Purpose  : Route handler for GET /recent
// Input    : req (HTTP request)
// Output   : res (HTTP response, JSON)
// ======================================================

reportingRouter.get('/recent', (_req, res) => res.json(generatedReports));

// ======================================================
// END: GET /recent
// ======================================================

export const usersRouter = Router();
// ======================================================
// Function : GET /
// Purpose  : Route handler for GET /
// Input    : req (HTTP request)
// Output   : res (HTTP response, JSON)
// ======================================================

usersRouter.get('/', (_req, res) => res.json(users));

// ======================================================
// END: GET /
// ======================================================
// ======================================================
// Function : GET /roles
// Purpose  : Route handler for GET /roles
// Input    : req (HTTP request)
// Output   : res (HTTP response, JSON)
// ======================================================

usersRouter.get('/roles', (_req, res) => res.json(roles));

// ======================================================
// END: GET /roles
// ======================================================

// ======================================================
// END: Route Handlers
// ======================================================

