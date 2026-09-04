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
    post: (input) => api.post('/lifecycle/post', input)
};

// ======================================================
// END: API Client Functions
// ======================================================

