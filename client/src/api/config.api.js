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
    getCustomAssetClasses: () => api.get('/config/asset-classes/custom'),
    updateCustomAssetClass: (id, body) => api.put(`/config/asset-classes/custom/${id}`, body),
    createCustomAssetClass: (body) => api.post('/config/asset-classes/custom', body),
    deleteCustomAssetClass: (id) => api.del(`/config/asset-classes/custom/${id}`),
};

// ======================================================
// END: API Functions
// ======================================================

// ======================================================
// END OF FILE : config.api.js
// ======================================================
