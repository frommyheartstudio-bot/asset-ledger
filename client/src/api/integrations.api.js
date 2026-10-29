// ======================================================
// File Name : integrations.api.js
// Purpose   : API client for the Integrations pages (SAP pull import)
// ======================================================

import { api, API_BASE } from './client';

export const integrationsApi = {
    sapStatus: () => api.get('/integrations/sap/status'),
    // { from?, to? } (YYYY-MM-DD) -> { mode, records: [{..., status: 'new'|'imported'|'invalid', error?}] }
    sapFetch: (range) => api.post('/integrations/sap/fetch', range),
    // PULL-ONLY: { documentIds, from?, to? } -> { rows: [{ assetNumber, eventType, fields }], skipped: [{ documentId, assetNumber, error }] }. Nothing is posted.
    sapConvert: (input) => api.post('/integrations/sap/convert', input),
    // { documentIds, user } -> { summary: {total, posted, failed, skipped}, results: [...] }
    sapImport: (input) => api.post('/integrations/sap/import', input),
    // Postman-style call to the Service API (/api/service/...) with an x-api-key.
    // Never throws on HTTP errors: returns { status, ok, body, ms, size } so the
    // page can show 401 / 403 / 409 / 422 exactly as the server sent them.
    serviceRequest: async ({ method, path, apiKey, body }) => {
        const headers = { 'Content-Type': 'application/json' };
        if (apiKey) headers['x-api-key'] = apiKey;
        const t0 = performance.now();
        const res = await fetch(`${API_BASE}/service${path}`, { method, headers, body: method === 'GET' ? undefined : body });
        const text = await res.text();
        let parsed = null;
        try { parsed = JSON.parse(text); } catch { parsed = text; }
        return { status: res.status, ok: res.ok, body: parsed, ms: Math.round(performance.now() - t0), size: text.length };
    }
};
