// ======================================================
// File Name : formatDate.js
// Purpose   : Utility helper functions for formatDate
// ======================================================


// ======================================================
// START: Utility Functions
// ======================================================

/** Format an ISO date string as e.g. "Apr 15, 2026". */
// ======================================================
// Function : formatDate
// Purpose  : Formats a value using 'formatDate'
// ======================================================

export function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

// ======================================================
// END: formatDate
// ======================================================

// ======================================================
// END: Utility Functions
// ======================================================

