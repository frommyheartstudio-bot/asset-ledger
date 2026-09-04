// ======================================================
// File Name : assets.ts
// Purpose   : In-memory data store / accessors for assets
// ======================================================

import type { Asset, DepreciationScheduleRow, TimelineEntry } from '../types.js';


// ======================================================
// START: Data Functions
// ======================================================

// In-memory "table". Swap this module for a real DB repository later —
// nothing outside this file needs to change shape-wise.
export const assets: Asset[] = [
  {
    assetNumber: '845862189',
    description: 'Network Rack — AWS AFS',
    assetClass: 'Network Equipment',
    company: '5B',
    costCenter: '7410',
    location: '1B51',
    project: 'N37W',
    cost: 580463.24,
    accumDepreciation: 11609.26,
    nbv: 568853.98,
    method: 'MACRS ADS',
    status: 'Active',
    taxFactPattern: {
      placedInService: '2026-03-19',
      recoveryPeriod: '5 years',
      method: 'MACRS ADS (Straight-Line)',
      convention: 'Half-Year',
      bonusPct: 0,
      annualRate: 20.0,
      propertyType: 'Personal Property'
    }
  },
  {
    assetNumber: '846013895',
    description: 'Data Center HVAC Unit',
    assetClass: 'Machinery',
    company: 'B110',
    cost: 357919,
    accumDepreciation: 7158,
    nbv: 350761,
    method: 'MACRS ADS',
    status: 'Active'
  },
  {
    assetNumber: '845603468',
    description: 'Substation Transformer',
    assetClass: 'Machinery',
    company: 'QT',
    cost: 339_300_000,
    accumDepreciation: 11_300_000,
    nbv: 328_000_000,
    method: 'MACRS ADS',
    status: 'Active'
  },
  {
    assetNumber: '846006799',
    description: 'Rack PDU Assembly',
    assetClass: 'Network Equipment',
    company: 'R9',
    cost: 39694,
    accumDepreciation: 794,
    nbv: 38900,
    method: 'MACRS ADS',
    status: 'Active'
  },
  {
    assetNumber: '845990931',
    description: 'Fiber Transceiver Module',
    assetClass: 'Network Equipment',
    company: '2D',
    cost: 5710.33,
    accumDepreciation: 5710.33,
    nbv: 0,
    method: 'MACRS',
    status: 'Fully Depreciated'
  },
  {
    assetNumber: '846321878',
    description: 'Temporary Test Rig',
    assetClass: 'Machinery',
    company: 'B579',
    cost: 48200,
    accumDepreciation: 42350,
    nbv: 5850,
    method: 'MACRS 200% DB',
    status: 'Retired',
    taxFactPattern: {
      placedInService: '2022-09-01',
      recoveryPeriod: '5 years',
      method: 'MACRS 200% DB (GDS)',
      convention: 'Half-Year',
      bonusPct: 0,
      annualRate: 11.52,
      propertyType: 'Personal Property'
    },
    disposal: {
      disposalDate: '2026-01-31',
      adAtDisposal: 42350,
      gainLoss: -1850
    }
  },
  {
    assetNumber: '845771204',
    description: 'Legacy Storage Array',
    assetClass: 'Network Equipment',
    company: '2D',
    cost: 182400,
    accumDepreciation: 138600,
    nbv: 43800,
    method: 'MACRS ADS',
    status: 'Retired',
    taxFactPattern: {
      placedInService: '2020-11-10',
      recoveryPeriod: '9 years',
      method: 'MACRS ADS (Straight-Line)',
      convention: 'Half-Year',
      bonusPct: 0,
      annualRate: 11.11,
      propertyType: 'Personal Property'
    },
    disposal: {
      disposalDate: '2025-11-30',
      adAtDisposal: 138600,
      gainLoss: 4200
    }
  },
  {
    assetNumber: '845009019',
    description: 'Cooling Loop Assembly',
    assetClass: 'Machinery',
    company: 'GD',
    cost: -973,
    accumDepreciation: -162,
    nbv: -811,
    method: 'MACRS ADS',
    status: 'Under Review'
  },
  {
    assetNumber: '844117702',
    description: 'Warehouse — Building 12',
    assetClass: 'Buildings',
    company: '5B',
    cost: 12_400_000,
    accumDepreciation: 2_100_000,
    nbv: 10_300_000,
    method: 'SL Mid-Month',
    status: 'Active'
  }
];

export const depreciationSchedules: Record<string, DepreciationScheduleRow[]> = {
  '845862189': [
    { year: '2026 (Yr 1)', openingNbv: 580463, rate: 10.0, depreciation: 58046, accumDepreciation: 58046, closingNbv: 522417 },
    { year: '2027 (Yr 2)', openingNbv: 522417, rate: 20.0, depreciation: 116093, accumDepreciation: 174139, closingNbv: 406324 },
    { year: '2028 (Yr 3)', openingNbv: 406324, rate: 20.0, depreciation: 116093, accumDepreciation: 290232, closingNbv: 290232 },
    { year: '2029 (Yr 4)', openingNbv: 290232, rate: 20.0, depreciation: 116093, accumDepreciation: 406324, closingNbv: 174139 },
    { year: '2030 (Yr 5)', openingNbv: 174139, rate: 20.0, depreciation: 116093, accumDepreciation: 522417, closingNbv: 58046 },
    { year: '2031 (Yr 6)', openingNbv: 58046, rate: 10.0, depreciation: 58046, accumDepreciation: 580463, closingNbv: 0 }
  ]
};

export const timelines: Record<string, TimelineEntry[]> = {
  '845862189': [
    { date: 'MAR 19, 2026', title: 'Addition — $579,580.98', description: 'Asset capitalized and placed in service', done: true },
    { date: 'APR 21, 2026', title: 'Adjustment — +$882.26', description: 'Cost basis adjustment · revision absorbed $8.82', done: true },
    { date: 'UPCOMING', title: 'Monthly Depreciation', description: 'Next charge scheduled May 31, 2026', done: false }
  ]
};

// ======================================================
// Function : findAsset
// Purpose  : Implements logic for 'findAsset'
// ======================================================

export function findAsset(assetNumber: string): Asset | undefined {
  return assets.find((a) => a.assetNumber === assetNumber);
}

// ======================================================
// END: findAsset
// ======================================================

// ======================================================
// END: Data Functions
// ======================================================

