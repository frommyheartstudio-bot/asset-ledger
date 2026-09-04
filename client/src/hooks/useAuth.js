// ======================================================
// File Name : useAuth.js
// Purpose   : Custom React hook: useAuth
// ======================================================

import { useCallback, useState } from 'react';

// ======================================================
// START: Hook Functions
// ======================================================

// NOTE: the server in this project doesn't expose auth routes yet, so this is
// a lightweight local-only stand-in (no network calls) — replace the login()
// body with a real /api/auth call once the server supports it.
const MOCK_USER = { id: 'u1', name: 'Balaji A.', initials: 'BA' };
// ======================================================
// Function : useAuth
// Purpose  : Custom hook that provides 'useAuth' state/behaviour
// ======================================================

export function useAuth() {
    const [user, setUser] = useState(MOCK_USER);
    const login = useCallback(() => setUser(MOCK_USER), []);
    const logout = useCallback(() => setUser(null), []);
    return { user, isAuthenticated: !!user, login, logout };
}

// ======================================================
// END: useAuth
// ======================================================

// ======================================================
// END: Hook Functions
// ======================================================

