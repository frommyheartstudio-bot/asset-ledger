// ======================================================
// File Name : config.api.js
// Purpose   : API client for Configuration pages. Asset Classes now
//             come out of Postgres (asset_classes table) instead of a
//             hardcoded array in the client bundle.
// ======================================================

import { api } from './client';

export const configApi = {
    getAssetClasses: () => api.get('/config/asset-classes'),
};
