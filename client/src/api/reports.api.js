// ======================================================
// File Name : reports.api.js
// Purpose   : API client functions for reports.api
// ======================================================

import { api } from './client';

// ======================================================
// START: API Client Functions
// ======================================================

export const reportsApi = {
    getCatalog: () => api.get('/reporting/catalog'),
    getRecent: () => api.get('/reporting/recent'),
    // Planning (Modeling + Forecasting) calls live here too, since the target
    // structure only calls out one extra api file per domain group.
    getModelingScenarios: () => api.get('/modeling/scenarios'),
    compareModelingScenarios: (basis, scenarios) => api.post('/modeling/compare', { basis, scenarios }),
    getForecast: () => api.get('/forecasting')
};

// ======================================================
// END: API Client Functions
// ======================================================

