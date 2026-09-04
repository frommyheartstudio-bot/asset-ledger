// ======================================================
// File Name : users.api.js
// Purpose   : API client functions for users.api
// ======================================================

import { api } from './client';

// ======================================================
// START: API Client Functions
// ======================================================

export const usersApi = {
    getRoles: () => api.get('/users/roles'),
    getUsers: () => api.get('/users')
};

// ======================================================
// END: API Client Functions
// ======================================================

