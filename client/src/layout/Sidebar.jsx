// ======================================================
// File Name : Sidebar.jsx
// Purpose   : Implements Sidebar
// ======================================================

import { NavLink, useMatch } from 'react-router-dom';
import { NAV } from './nav';

// ======================================================
// START: Layout Component
// ======================================================

/** open/onClose control the off-canvas state on mobile/tablet (<1001px); ignored/no-op on desktop. */
// ======================================================
// Function : Sidebar
// Purpose  : React component that renders the 'Sidebar' UI
// ======================================================

export function Sidebar({ active, open, onClose }) {
    return (<>
      <div className={`sidebar-backdrop ${open ? 'show' : ''}`} onClick={onClose} aria-hidden="true"/>
      <aside className={`sidebar ${open ? 'show' : ''}`}>
        <div className="brand">
          <div className="logo">
            <span className="mark">FA</span>
            <span>AssetLedger</span>
          </div>
          <div className="sub">Fixed Asset Management</div>
        </div>

        {NAV.map((g) => (<div className="nav-group" key={g.group}>
            <div className="label">{g.group}</div>
            {g.items.map((it) => (<NavLink key={it.id} to={it.href} end className={`nav-item ${it.id === active ? 'active' : ''}`} onClick={onClose}>
                <span className="ico">{it.icon}</span>
                <span>{it.label}</span>
              </NavLink>))}
          </div>))}

        <div className="foot">Prototype v0.1 · Fiscal Year 2026</div>
      </aside>
    </>);
}

// ======================================================
// END: Sidebar
// ======================================================
// Helper to derive which nav id is "active" for asset-detail-style dynamic routes.
// ======================================================
// Function : useActiveNavId
// Purpose  : Custom hook that provides 'useActiveNavId' state/behaviour
// ======================================================

export function useActiveNavId(explicit) {
    const isAssetDetail = useMatch('/assets/:assetNumber');
    if (explicit)
        return explicit;
    if (isAssetDetail)
        return 'detail';
    return '';
}

// ======================================================
// END: useActiveNavId
// ======================================================

// ======================================================
// END: Layout Component
// ======================================================

