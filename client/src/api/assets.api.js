// ======================================================
// File Name : assets.api.js
// Purpose   : API client functions for assets.api
// ======================================================

import { api } from './client';

// ======================================================
// START: API Client Functions
// ======================================================

export const assetsApi = {
    getDashboardSummary: () => api.get('/dashboard/summary'),
    getDashboardActivity: () => api.get('/dashboard/activity'),
    list: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.assetClass)
            params.set('assetClass', filters.assetClass);
        if (filters.company)
            params.set('company', filters.company);
        if (filters.status)
            params.set('status', filters.status);
        return api.get(`/assets?${params.toString()}`);
    },
    getByNumber: (assetNumber) => api.get(`/assets/${assetNumber}`),
    create: (asset) => api.post('/assets', asset)
};

// ======================================================
// END: API Client Functions
// ======================================================

