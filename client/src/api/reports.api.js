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
    // "+ Custom Report" card (Reporting.jsx): persists the run's metadata
    // (name/book/period/who) so it shows up in "Recently Generated
    // Reports". The CSV file itself is built and downloaded client-side.
    generateReport: (payload) => api.post('/reporting/generate', payload),
    // Planning (Modeling + Forecasting) calls live here too, since the target
    // structure only calls out one extra api file per domain group.
    getModelingScenarios: () => api.get('/modeling/scenarios'),
    compareModelingScenarios: (basis, scenarios, baselineAssetNumbers = [], startYear = new Date().getFullYear(), bonusPctByYear = []) => api.post('/modeling/compare', { basis, scenarios, baselineAssetNumbers, startYear, bonusPctByYear }),
    getForecast: (years = 5, filters = {}) => {
        const params = new URLSearchParams({ years: String(years) });
        if (filters.company) params.set('company', filters.company);
        if (filters.assetType) params.set('assetType', filters.assetType);
        return api.get(`/forecasting?${params.toString()}`);
    }
};

// ======================================================
// END: API Client Functions
// ======================================================

