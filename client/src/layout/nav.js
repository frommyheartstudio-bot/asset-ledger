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
            { id: 'lifecycle', icon: '⟳', label: 'Lifecycle Events', href: '/lifecycle' }
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
    { group: 'Administration', items: [{ id: 'users', icon: '◍', label: 'User Management', href: '/users' }] }
];

// ======================================================
// END: Layout Component
// ======================================================

