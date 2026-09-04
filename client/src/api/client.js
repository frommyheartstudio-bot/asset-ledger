// ======================================================
// File Name : client.js
// Purpose   : API client functions for client
// ======================================================


// ======================================================
// START: API Client Functions
// ======================================================

const BASE = '/api';
// ======================================================
// Function : request
// Purpose  : Implements logic for 'request'
// ======================================================

async function request(path, init) {
    const res = await fetch(`${BASE}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...init
    });
    if (!res.ok) {
        const body = await res.text();
        throw new Error(`${res.status} ${res.statusText}: ${body}`);
    }
    return res.json();
}

// ======================================================
// END: request
// ======================================================
export const api = {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) })
};

// ======================================================
// END: API Client Functions
// ======================================================

