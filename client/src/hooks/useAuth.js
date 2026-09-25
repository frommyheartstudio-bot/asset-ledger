// ======================================================
// File Name : useAuth.js
// Purpose   : Custom React hook: useAuth
// ======================================================

// The real implementation lives in context/AuthContext.jsx (it needs a
// Provider so the logged-in user is shared/persisted across the app,
// not re-initialized on every component that calls this hook). Re-exported
// here so existing `from '../hooks/useAuth'` imports keep working.
export { useAuth } from '../context/AuthContext';

// ======================================================
// END: useAuth
// ======================================================
