// ======================================================
// File Name : Sidebar.jsx
// Purpose   : Implements Sidebar
// ======================================================

import { useState } from 'react';
import { NavLink, useMatch } from 'react-router-dom';
import { NAV } from './nav';

// ======================================================
// START: Layout Component
// ======================================================

// Groups that collapse/expand as a dropdown when their header is
// clicked, instead of always showing their items. Every other group
// (Overview, Asset Management, Administration) keeps the old
// always-expanded behavior.
const COLLAPSIBLE_GROUPS = ['Planning', 'Compliance', 'Configuration'];

/** open/onClose control the off-canvas state on mobile/tablet (<1001px); ignored/no-op on desktop. */
// ======================================================
// Function : Sidebar
// Purpose  : React component that renders the 'Sidebar' UI
// ======================================================

export function Sidebar({ active, open, onClose }) {
    // Starts with whichever collapsible group contains the active page
    // already open, so navigating straight to e.g. /forecasting doesn't
    // hide the very item you're on.
    const [openGroups, setOpenGroups] = useState(() => {
        const initial = {};
        for (const g of NAV) {
            if (COLLAPSIBLE_GROUPS.includes(g.group)) {
                initial[g.group] = g.items.some((it) => it.id === active);
            }
        }
        return initial;
    });

    const toggleGroup = (group) => {
        setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));
    };

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

        {NAV.map((g) => {
            const collapsible = COLLAPSIBLE_GROUPS.includes(g.group);
            const isOpen = !collapsible || openGroups[g.group];
            return (<div className="nav-group" key={g.group}>
            {collapsible ? (<button type="button" className="label label-toggle" onClick={() => toggleGroup(g.group)} aria-expanded={isOpen}>
                <span>{g.group}</span>
                <span className={`chevron ${isOpen ? 'open' : ''}`}>▾</span>
              </button>) : (<div className="label">{g.group}</div>)}
            {isOpen && g.items.map((it) => (<NavLink key={it.id} to={it.href} end className={`nav-item ${it.id === active ? 'active' : ''}`} onClick={onClose}>
                <span className="ico">{it.icon}</span>
                <span>{it.label}</span>
              </NavLink>))}
          </div>);
        })}

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

