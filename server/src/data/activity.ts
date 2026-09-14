// ======================================================
// File Name : activity.ts
// Purpose   : In-memory data store / accessors for activity
// ======================================================

import type { LifecycleActivity } from '../types.js';
import { assets, depreciationSchedules } from './assets.js';


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

const CLASS_COLORS: Record<string, string> = {
  'Network Equipment': '#2563eb',
  'Buildings': '#0d9488',
  'Machinery': '#7c3aed',
  'Vehicles': '#d97706',
  'Other': '#94a3b8'
};
const FALLBACK_COLORS = ['#2563eb', '#0d9488', '#7c3aed', '#d97706', '#94a3b8', '#dc2626', '#059669'];

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function monthKey(d: Date): string {
  return d.toISOString().slice(0, 7); // YYYY-MM
}

// ======================================================
// Function : monthsInServiceDuringYear
// Purpose  : How many of `year`'s 12 months this asset was actually
//            in service for — starts at its placed-in-service month if
//            that fell in `year` (else Jan), ends at its disposal month
//            if it was retired in `year` (else Dec). Lets a partial
//            first/last year split its stored annual depreciation
//            across only the months it was really on the books, instead
//            of always assuming a full 12.
// ======================================================

function monthsInServiceDuringYear(
  asset: { taxFactPattern?: { placedInService: string }; status: string; disposal?: { disposalDate: string } },
  year: string
): number {
  const pis = asset.taxFactPattern?.placedInService;
  const startMonth = pis && pis.startsWith(year) ? Number(pis.slice(5, 7)) : 1;

  let endMonth = 12;
  if (asset.status === 'Retired' && asset.disposal && asset.disposal.disposalDate.startsWith(year)) {
    endMonth = Number(asset.disposal.disposalDate.slice(5, 7));
  }

  return Math.max(endMonth - startMonth + 1, 1);
}

// ======================================================
// END: monthsInServiceDuringYear
// ======================================================

// ======================================================
// Function : computeDashboardSummary
// Purpose  : Builds the Dashboard KPI cards (Total Assets, Gross Cost,
//            Net Book Value, YTD Depreciation), the Monthly Depreciation
//            Expense chart, and the Assets by Class donut — ALL derived
//            live from the current `assets` store, so they move as
//            assets are added/edited/retired/reinstated instead of
//            sitting on fixed demo numbers.
// ======================================================

export function computeDashboardSummary() {
  const totalAssets = assets.length;
  const grossCost = assets.reduce((sum, a) => sum + a.cost, 0);
  const netBookValue = assets.reduce((sum, a) => sum + a.nbv, 0);
  const ytdDepreciation = assets.reduce((sum, a) => sum + a.accumDepreciation, 0);

  const now = new Date();
  const currentMonthKey = monthKey(now);
  const addedThisPeriod = assets.filter(
    (a) => a.taxFactPattern?.placedInService?.startsWith(currentMonthKey)
  ).length;

  // No prior-period snapshot is kept, so the YTD deltas are derived
  // straight from what's on hand: cost added this calendar year as a
  // share of the book, and total depreciation taken as a share of cost.
  const currentYear = String(now.getFullYear());
  const costAddedYtd = assets
    .filter((a) => a.taxFactPattern?.placedInService?.startsWith(currentYear))
    .reduce((sum, a) => sum + a.cost, 0);
  const grossCostYtdDeltaPct = grossCost > 0 ? round1((costAddedYtd / grossCost) * 100) : 0;
  const depreciationDeltaPct = grossCost > 0 ? -round1((ytdDepreciation / grossCost) * 100) : 0;

  // Monthly Depreciation Expense — each of the trailing 6 months is
  // computed on its own, asset by asset:
  //  1. Skip the asset entirely for this month if it wasn't in service
  //     yet, or was already retired, as of that month.
  //  2. Otherwise pull ITS OWN stored depreciation schedule row for the
  //     calendar year this month falls in (declining-balance/MACRS —
  //     same table the Forecasting page reads), and split that year's
  //     total across only the months the asset was actually on the
  //     books that year (monthsInServiceDuringYear) — not a blind ÷12,
  //     so a first or final partial year lands the right monthly
  //     amount instead of over/under-counting it.
  //  3. Only when an asset has no stored schedule at all (e.g. added
  //     without a tax fact pattern) do we fall back to its flat
  //     annualRate ÷ 12 approximation.
  // Because rates genuinely differ year to year and each asset's own
  // in-service window is respected, the total for each month is its
  // own real figure — it moves up or down as assets are added, retire,
  // or cross into a new depreciation year, rather than repeating one
  // flat number.
  const monthlyDepreciation: { month: string; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0).toISOString().slice(0, 10);
    const monthYear = String(monthDate.getFullYear());
    const label = monthDate.toLocaleString('en-US', { month: 'short' });
    const value = assets.reduce((sum, a) => {
      const inServiceBy = a.taxFactPattern?.placedInService && a.taxFactPattern.placedInService <= monthEnd;
      const notYetRetired = !(a.status === 'Retired' && a.disposal && a.disposal.disposalDate <= monthEnd);
      if (!inServiceBy || !notYetRetired) return sum;

      const rows = depreciationSchedules[a.assetNumber] ?? [];
      const yearRow = rows.find((r) => r.year.startsWith(monthYear));
      if (yearRow) {
        const activeMonthsThisYear = monthsInServiceDuringYear(a, monthYear);
        return sum + yearRow.depreciation / activeMonthsThisYear;
      }
      if (a.taxFactPattern) {
        return sum + (a.cost * a.taxFactPattern.annualRate) / 100 / 12;
      }
      return sum;
    }, 0);
    monthlyDepreciation.push({ month: label, value });
  }
  // Represent monthly depreciation as a percent of the book (gross cost)
  // Add trend direction compared to previous month and mark projected
  const monthlyDepreciationChart = monthlyDepreciation.map((m, idx) => {
    const raw = grossCost > 0 ? (m.value / grossCost) * 100 : 0; // unrounded percent
    const pct = round1(raw);
    const pctLabel = pct === 0 ? '0' : pct.toFixed(1);
    const prev = idx > 0 ? monthlyDepreciation[idx - 1].value : null;
    let dir: 'up' | 'down' | null = null;
    if (prev !== null) {
      if (m.value > prev) dir = 'up';
      else if (m.value < prev) dir = 'down';
    }
    return {
      month: m.month,
      value: m.value,
      pct,
      pctRaw: raw,
      pctLabel,
      dir,
      projected: false
    };
  });

  // Assets by Class — grouped by NBV share, matching the "By NBV" label
  // already on the card. Always seed all 5 known classes (from
  // CLASS_COLORS) at 0 first, so the pie/legend always shows 5 slices
  // even when the current book has no assets in a given class yet,
  // instead of only showing whichever classes happen to be populated.
  const classTotals = new Map<string, number>(Object.keys(CLASS_COLORS).map((label) => [label, 0]));
  for (const a of assets) {
    classTotals.set(a.assetClass, (classTotals.get(a.assetClass) ?? 0) + a.nbv);
  }
  let colorIdx = 0;
  const assetsByClass = [...classTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, nbv]) => {
      const color = CLASS_COLORS[label] ?? FALLBACK_COLORS[colorIdx++ % FALLBACK_COLORS.length];
      const pct = netBookValue > 0 ? Math.round((nbv / netBookValue) * 100) : 0;
      return { label, pct, color };
    });

  return {
    totalAssets,
    addedThisPeriod,
    grossCost,
    grossCostYtdDeltaPct,
    netBookValue,
    depreciationDeltaPct,
    ytdDepreciation,
    monthlyDepreciation: monthlyDepreciationChart,
    assetsByClass
  };
}

// ======================================================
// Function : computeForecast
// Purpose  : Builds the Forecasting page (KPIs, 5-Year Expense chart,
//            Capital Roll-Forward table) from each asset's own stored
//            depreciation schedule (real MACRS/Straight-Line rows,
//            already computed at capitalization time) instead of a
//            fixed 5-year demo table. 5 years starting with the
//            current calendar year, summed asset-by-asset; an asset
//            drops out of every year at/after its actual disposal
//            date and contributes its written-off NBV to that year's
//            "retirements" line instead.
// ======================================================

export function computeForecast() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const years = [0, 1, 2, 3, 4].map((i) => currentYear + i);

  function scheduleRowForYear(assetNumber: string, year: number) {
    const rows = depreciationSchedules[assetNumber] ?? [];
    return rows.find((r) => r.year.startsWith(String(year)));
  }

  function disposalYear(disposalDate: string | undefined): number | null {
    return disposalDate ? Number(disposalDate.slice(0, 4)) : null;
  }

  const rollForward = years.map((year) => {
    let openingNbv = 0;
    let depreciation = 0;
    let closingNbv = 0;
    let additions = 0;
    let retirements = 0;

    for (const a of assets) {
      const dYear = a.status === 'Retired' ? disposalYear(a.disposal?.disposalDate) : null;
      const stillInScheduleForYear = dYear === null || dYear > year;

      if (stillInScheduleForYear) {
        const row = scheduleRowForYear(a.assetNumber, year);
        if (row) {
          openingNbv += row.openingNbv;
          depreciation += row.depreciation;
          closingNbv += row.closingNbv;
        } else {
          // No stored depreciation schedule for this asset (it was
          // added without a tax fact pattern/method, e.g. via the
          // quick Add Asset form). There's no rate on file to project
          // forward with, so it honestly carries at its current NBV
          // rather than assuming a depreciation curve we don't have.
          openingNbv += a.nbv;
          closingNbv += a.nbv;
        }
      }

      if (a.taxFactPattern?.placedInService && Number(a.taxFactPattern.placedInService.slice(0, 4)) === year) {
        additions += a.cost;
      }
      if (dYear === year && a.disposal) {
        retirements += a.cost - a.disposal.adAtDisposal;
      }
    }

    return {
      year,
      openingNbv,
      additions,
      depreciation: -depreciation,
      retirements: -retirements,
      closingNbv
    };
  });

  const expenseByYear = rollForward.map((r) => ({ year: r.year, millions: round1(-r.depreciation / 1e6) }));

  const currentNbv = assets.reduce((sum, a) => sum + a.nbv, 0);
  const thisYearDepr = -rollForward[0].depreciation;
  const nextYearDepr = -rollForward[1].depreciation;
  const projectedDepreciationDeltaPct = thisYearDepr > 0 ? round1(((nextYearDepr - thisYearDepr) / thisYearDepr) * 100) : 0;

  // No forward capital-project pipeline is tracked in this app yet, so
  // Planned CapEx honestly reflects that — nothing planned means $0,
  // not a placeholder guess.
  const plannedCapEx = 0;
  const plannedCapExProjects = 0;

  let assetsFullyDepreciatingNextFY = 0;
  for (const a of assets) {
    const rows = depreciationSchedules[a.assetNumber] ?? [];
    const zeroRow = rows.find((r) => r.closingNbv <= 1);
    if (zeroRow && zeroRow.year.startsWith(String(years[1]))) assetsFullyDepreciatingNextFY += 1;
  }

  const projectedEndingNbv = rollForward[rollForward.length - 1].closingNbv;
  const projectedEndingNbvDeltaPct = currentNbv > 0 ? round1(((projectedEndingNbv - currentNbv) / currentNbv) * 100) : 0;

  return {
    kpis: {
      projectedDepreciationNextFY: nextYearDepr,
      projectedDepreciationDeltaPct,
      plannedCapEx,
      plannedCapExProjects,
      assetsFullyDepreciatingNextFY,
      projectedEndingNbv,
      projectedEndingNbvDeltaPct
    },
    expenseByYear,
    rollForward
  };
}

// ======================================================
// END: Data Functions
// ======================================================

