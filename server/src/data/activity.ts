// ======================================================
// File Name : activity.ts
// Purpose   : In-memory data store / accessors for activity
// ======================================================

import type { LifecycleActivity } from '../types.js';


// ======================================================
// START: Data Functions
// ======================================================

export const recentActivity: LifecycleActivity[] = [
  { assetNumber: '845862189', description: 'Network Rack — AWS AFS', event: 'Adjustment', amount: 882.26, date: '2026-04-21', status: 'Posted' },
  { assetNumber: '846013895', description: 'Data Center HVAC Unit', event: 'Addition', amount: 357772.10, date: '2026-04-06', status: 'Posted' },
  { assetNumber: '845990931', description: 'Fiber Transceiver Module', event: 'Transfer In', amount: 5710.33, date: '2026-04-04', status: 'Processing' },
  { assetNumber: '846321878', description: 'Temporary Test Rig', event: 'Retirement', amount: 60566.32, date: '2026-04-21', status: 'Pending' },
  { assetNumber: '845009019', description: 'Cooling Loop Assembly', event: 'Reclassification', amount: 972.73, date: '2026-04-18', status: 'Posted' }
];

export const dashboardSummary = {
  totalAssets: 24318,
  addedThisPeriod: 312,
  grossCost: 1.84e9,
  grossCostYtdDeltaPct: 4.2,
  netBookValue: 1.12e9,
  depreciationDeltaPct: -2.1,
  ytdDepreciation: 96.4e6,
  monthlyDepreciation: [
    { month: 'Jan', pct: 52 },
    { month: 'Feb', pct: 58 },
    { month: 'Mar', pct: 63 },
    { month: 'Apr', pct: 71 },
    { month: 'May', pct: 48, projected: true },
    { month: 'Jun', pct: 55, projected: true }
  ],
  assetsByClass: [
    { label: 'Network Equipment', pct: 42, color: '#2563eb' },
    { label: 'Buildings', pct: 26, color: '#0d9488' },
    { label: 'Machinery', pct: 16, color: '#7c3aed' },
    { label: 'Vehicles', pct: 10, color: '#d97706' },
    { label: 'Other', pct: 6, color: '#94a3b8' }
  ]
};

export const forecast = {
  kpis: {
    projectedDepreciationNextFY: 284.6e6,
    projectedDepreciationDeltaPct: 6.1,
    plannedCapEx: 412.0e6,
    plannedCapExProjects: 18,
    assetsFullyDepreciatingNextFY: 3142,
    projectedEndingNbv: 1.24e9,
    projectedEndingNbvDeltaPct: 10.7
  },
  expenseByYear: [
    { year: 2026, millions: 268 },
    { year: 2027, millions: 285 },
    { year: 2028, millions: 302 },
    { year: 2029, millions: 248 },
    { year: 2030, millions: 194 }
  ],
  rollForward: [
    { year: 2026, openingNbv: 1.08e9, additions: 318e6, depreciation: -268e6, retirements: -18e6, closingNbv: 1.11e9 },
    { year: 2027, openingNbv: 1.11e9, additions: 412e6, depreciation: -285e6, retirements: -24e6, closingNbv: 1.21e9 },
    { year: 2028, openingNbv: 1.21e9, additions: 390e6, depreciation: -302e6, retirements: -31e6, closingNbv: 1.27e9 },
    { year: 2029, openingNbv: 1.27e9, additions: 355e6, depreciation: -248e6, retirements: -28e6, closingNbv: 1.35e9 },
    { year: 2030, openingNbv: 1.35e9, additions: 300e6, depreciation: -194e6, retirements: -22e6, closingNbv: 1.43e9 }
  ]
};

// ======================================================
// END: Data Functions
// ======================================================

