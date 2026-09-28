// ======================================================
// File Name : lifecycle.api.js
// Purpose   : API client functions for lifecycle.api
// ======================================================

import { api } from './client';

// ======================================================
// START: API Client Functions
// ======================================================

export const lifecycleApi = {
    getEventTypes: () => api.get('/lifecycle/event-types'),
    preview: (input) => api.post('/lifecycle/preview', input),
    post: (input) => api.post('/lifecycle/post', input),
    // Bulk Import page — posts every parsed CSV row for one event type in
    // a single request; server loops the same preview+post logic per row.
    bulkImport: (input) => api.post('/lifecycle/bulk-import', input),
    // Master Data Set page — posts a batch of rows that can each carry
    // their own event type (unlike bulkImport, which shares one event
    // type across the whole batch). Covers both "same transaction to many
    // assets" and "multiple transactions on one asset".
    bulkPost: (input) => api.post('/lifecycle/bulk-post', input),
    // Posted transactions for one asset, read back from Postgres —
    // powers the Asset Detail → "Transactions" tab.
    getTransactions: (assetNumber) => api.get(`/lifecycle/transactions/${assetNumber}`),
    // Posted transactions for EVERY asset, newest first — powers the
    // Asset Register page's "Posted Lifecycle Events" table.
    getAllTransactions: (limit = 200) => api.get(`/lifecycle/transactions?limit=${limit}`)
};

// ======================================================
// END: API Client Functions
// ======================================================
