// ======================================================
// File Name : config.api.js
// Purpose   : API client for Configuration pages. Asset Classes now
//             come out of Postgres (asset_classes table) instead of a
//             hardcoded array in the client bundle.
// ======================================================

import { api } from './client';

// ======================================================
// START: API Functions
// ======================================================

export const configApi = {
    getAssetClasses: () => api.get('/config/asset-classes'),
    lookupAssetClass: (q) => api.get(`/config/asset-class-lookup?q=${encodeURIComponent(q)}`),
    updateAssetClass: (id, body) => api.put(`/config/asset-classes/${id}`, body),
    deleteAssetClass: (id) => api.del(`/config/asset-classes/${id}`),
    getCustomAssetClasses: () => api.get('/config/asset-classes/custom'),
    updateCustomAssetClass: (id, body) => api.put(`/config/asset-classes/custom/${id}`, body),
    createCustomAssetClass: (body) => api.post('/config/asset-classes/custom', body),
    deleteCustomAssetClass: (id) => api.del(`/config/asset-classes/custom/${id}`),
    getClassHistory: (scope, id) => api.get(`/config/asset-classes/history?scope=${scope}&id=${id}`),
    getAllClassHistory: () => api.get('/config/asset-classes/history'),
};

// ======================================================
// END: API Functions
// ======================================================

// ======================================================
// END OF FILE : config.api.js
// ======================================================
