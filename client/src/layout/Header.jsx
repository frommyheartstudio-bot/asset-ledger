// ======================================================
// File Name : Header.jsx
// Purpose   : Implements Header
// ======================================================

import { useAuth } from '../hooks/useAuth';

// ======================================================
// START: Layout Component
// ======================================================

// ======================================================
// Function : Header
// Purpose  : React component that renders the 'Header' UI
// ======================================================

export function Header({ title, crumb, onMenuClick, menuOpen, showMenuToggle }) {
    const { user } = useAuth();
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
        <input placeholder="Search assets, tags, projects…"/>
      </div>
      <div className="icon-btn" title="Notifications">
        ◔<span className="badge-dot"/>
      </div>
      <div className="icon-btn" title="Help">
        ?
      </div>
      <div className="avatar" title={user?.name ?? 'Guest'}>
        {user?.initials ?? '?'}
      </div>
    </div>);
}

// ======================================================
// END: Header
// ======================================================

// ======================================================
// END: Layout Component
// ======================================================

