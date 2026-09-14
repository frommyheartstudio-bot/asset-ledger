// ======================================================
// File Name : nav.js
// Purpose   : Implements nav
// ======================================================


// ======================================================
// START: Layout Component
// ======================================================

export const NAV = [
    { group: 'Overview', items: [{ id: 'dashboard', icon: '▤', label: 'Dashboard', href: '/' }] },
    {
        group: 'Asset Management',
        items: [
            { id: 'assets', icon: '▦', label: 'Asset Register', href: '/assets' },
            { id: 'detail', icon: '▣', label: 'Asset Detail', href: '/assets/845862189' },
            { id: 'lifecycle', icon: '⟳', label: 'Lifecycle Events', href: '/lifecycle' },
            { id: 'bulk-import', icon: '⇪', label: 'Bulk Import', href: '/lifecycle/bulk-import' }
        ]
    },
    {
        group: 'Planning',
        items: [
            { id: 'modeling', icon: '◈', label: 'Modeling', href: '/modeling' },
            { id: 'forecasting', icon: '📈', label: 'Forecasting', href: '/forecasting' }
        ]
    },
    { group: 'Compliance', items: [{ id: 'reporting', icon: '▧', label: 'Reporting', href: '/reporting' }] },
    {
        group: 'Configuration',
        items: [
            { id: 'pub946', icon: '📋', label: 'Pub 946 Tables', href: '/configuration/pub946' },
            { id: 'bonus', icon: '％', label: 'Bonus Depreciation', href: '/configuration/bonus-depreciation' },
            { id: 'assetClasses', icon: '🏷️', label: 'Asset Classes', href: '/configuration/asset-classes' }
        ]
    },
    { group: 'Administration', items: [{ id: 'users', icon: '◍', label: 'User Management', href: '/users' }] }
];

// ======================================================
// END: Layout Component
// ======================================================

