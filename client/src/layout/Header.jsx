// ======================================================
// File Name : Header.jsx
// Purpose   : Implements Header
// ======================================================

import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../api/auth.api';

// ======================================================
// START: Layout Component
// ======================================================

// Header search text survives page changes (cleared only by the X button).
const SEARCH_KEY = 'al_header_search';
function readSavedQuery() {
    try { return sessionStorage.getItem(SEARCH_KEY) || ''; } catch { return ''; }
}
function saveQuery(value) {
    try {
        if (value) sessionStorage.setItem(SEARCH_KEY, value);
        else sessionStorage.removeItem(SEARCH_KEY);
    } catch { /* storage unavailable - the box still works for this page */ }
}

// ======================================================
// Function : Header
// Purpose  : React component that renders the 'Header' UI
// ======================================================

export function Header({ title, crumb, onMenuClick, menuOpen, showMenuToggle }) {
    const { user, logout, hasView } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    // The header is re-mounted on every page change, so a plain useState('')
    // wiped what the person typed the moment the search jumped to the Asset
    // Register. The text now lives in sessionStorage and is only removed
    // by the X button.
    const [query, setQuery] = useState(readSavedQuery);
    const [menuIsOpen, setMenuIsOpen] = useState(false);
    const menuRef = useRef(null);

    // Login notifications — who signed in, and when. Only shown to
    // whoever can see the Users menu (Administrators, or anyone an admin
    // has explicitly granted View on it), same gate as the User
    // Management page itself. Polled rather than pushed since this
    // prototype has no websocket/SSE channel.
    const canSeeLogins = hasView('users');
    const [logins, setLogins] = useState([]);
    const [notifOpen, setNotifOpen] = useState(false);
    const notifRef = useRef(null);
    const seenKey = user ? `al_notif_seen_at:${user.id}` : null;
    const [seenAt, setSeenAt] = useState(() => (seenKey ? localStorage.getItem(seenKey) || '' : ''));

    useEffect(() => {
        if (!canSeeLogins) return;
        let cancelled = false;
        const poll = () => authApi.getLoginNotifications().then((rows) => {
            if (!cancelled) setLogins(rows);
        }).catch(() => { /* server unreachable — leave the last-known list showing */ });
        poll();
        const id = setInterval(poll, 15000);
        return () => { cancelled = true; clearInterval(id); };
    }, [canSeeLogins]);

    // Someone else's login the current user hasn't seen yet (their own
    // sign-in doesn't count as a notification about someone else).
    const unseenLogins = logins.filter((n) => n.email !== user?.email && (!seenAt || n.at > seenAt));

    const toggleNotifications = () => {
        setNotifOpen((open) => {
            const next = !open;
            if (next && seenKey) {
                const now = new Date().toISOString();
                localStorage.setItem(seenKey, now);
                setSeenAt(now);
            }
            return next;
        });
    };

    // X button: remove one notification for good (server-side), and drop it
    // from the list right away so the UI doesn't wait for the next poll.
    const removeNotification = async (e, seq) => {
        e.stopPropagation();
        setLogins((rows) => rows.filter((n) => n.seq !== seq));
        try { await authApi.deleteNotification(seq); } catch { /* next poll will restore it if the delete failed */ }
    };

    function timeAgo(iso) {
        const ms = Date.now() - new Date(iso).getTime();
        const min = Math.round(ms / 60000);
        if (min < 1) return 'Just now';
        if (min < 60) return `${min}m ago`;
        const hr = Math.round(min / 60);
        if (hr < 24) return `${hr}h ago`;
        return new Date(iso).toLocaleDateString();
    }

    // Close the account menu / notifications dropdown on an outside click.
    useEffect(() => {
        if (!menuIsOpen && !notifOpen) return;
        const handleClick = (e) => {
            if (menuIsOpen && menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuIsOpen(false);
            }
            if (notifOpen && notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [menuIsOpen, notifOpen]);

    // On the Asset Register the box mirrors whatever search is applied in
    // the URL (also covers searching from the page's own Search button).
    useEffect(() => {
        if (location.pathname !== '/assets') return;
        const fromUrl = new URLSearchParams(location.search).get('q');
        if (fromUrl) { setQuery(fromUrl); saveQuery(fromUrl); }
    }, [location.pathname, location.search]);

    const updateQuery = (value) => { setQuery(value); saveQuery(value); };

    // Global quick-search: Enter jumps to the Asset Register pre-filtered
    // by asset number / description. Filters are applied server-side.
    const runSearch = () => {
        const q = query.trim();
        if (!q) return;
        saveQuery(q);
        navigate(`/assets?q=${encodeURIComponent(q)}`);
    };

    // X button: the only thing that empties the box. Also drops the
    // applied search from the Asset Register so the table shows everything again.
    const clearSearch = () => {
        setQuery('');
        saveQuery('');
        if (location.pathname === '/assets' && new URLSearchParams(location.search).get('q')) {
            const next = new URLSearchParams(location.search);
            next.delete('q');
            const qs = next.toString();
            navigate(`/assets${qs ? `?${qs}` : ''}`, { replace: true });
        }
    };

    const handleLogout = () => {
        setMenuIsOpen(false);
        logout();
        navigate('/login', { replace: true });
    };

    return (<div className="topbar">
      {showMenuToggle && (<button className="icon-btn menu-toggle" title={menuOpen ? 'Close menu' : 'Menu'} aria-label="Toggle navigation" aria-expanded={!!menuOpen} onClick={onMenuClick}>
        {menuOpen ? '✕' : '☰'}
      </button>)}
      <div>
        <div className="page-title">{title}</div>
        <div className="breadcrumb">{crumb ?? ''}</div>
      </div>
      <div className="spacer"/>
      <div className="search">
        <span>⌕</span>
        <input
          placeholder="Search assets"
          value={query}
          onChange={(e) => updateQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && runSearch()}
        />
        {query && (<button type="button" className="search-clear" title="Clear search" aria-label="Clear search" onClick={clearSearch}>✕</button>)}
      </div>
      <div className={`icon-btn notif-btn ${canSeeLogins ? '' : 'notif-btn-static'}`} title="Notifications" ref={notifRef} onClick={canSeeLogins ? toggleNotifications : undefined} style={{ position: 'relative', cursor: canSeeLogins ? 'pointer' : 'default' }}>
        ◔{unseenLogins.length > 0 && <span className="badge-dot"/>}
        {notifOpen && (<div className="account-dropdown notif-dropdown">
            <div className="account-dropdown-who">Notifications</div>
            {logins.length === 0 && <div className="notif-empty">Nothing yet.</div>}
            {logins.map((n) => (<div className="notif-item" key={n.seq} style={n.type === 'registration' ? { cursor: 'pointer' } : undefined} onClick={n.type === 'registration' ? () => { setNotifOpen(false); navigate('/users'); } : undefined}>
                <button type="button" className="notif-close" title="Delete notification" aria-label="Delete notification" onClick={(e) => removeNotification(e, n.seq)}>✕</button>
                {n.type === 'registration' ? (<>
                  <div className="notif-item-name">🆕 New registration — {n.name} <span className="text-muted">({n.email})</span></div>
                  <div className="notif-item-when text-muted">Review in User Management · {timeAgo(n.at)}</div>
                </>) : (<>
                  <div className="notif-item-name">{n.name} <span className="text-muted">({n.role})</span></div>
                  <div className="notif-item-when text-muted">{timeAgo(n.at)}</div>
                </>)}
              </div>))}
          </div>)}
      </div>
      <div className="icon-btn" title="Help">
        ?
      </div>
      <div className="account-menu" ref={menuRef}>
        <button type="button" className="avatar" title={user?.name ?? 'Guest'} aria-haspopup="true" aria-expanded={menuIsOpen} onClick={() => setMenuIsOpen((v) => !v)}>
          {user?.initials ?? '?'}
        </button>
        {menuIsOpen && (<div className="account-dropdown">
            <div className="account-dropdown-who">{user?.name ?? 'Guest'}</div>
            <button type="button" className="account-dropdown-item" onClick={handleLogout}>
              ⏻ Log out
            </button>
          </div>)}
      </div>
    </div>);
}

// ======================================================
// END: Header
// ======================================================

// ======================================================
// END: Layout Component
// ======================================================

// ======================================================
// END OF FILE : Header.jsx
// ======================================================
