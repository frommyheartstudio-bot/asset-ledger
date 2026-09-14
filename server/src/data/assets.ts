// ======================================================
// File Name : assets.ts
// Purpose   : In-memory data store / accessors for assets, backed by a
//             JSON file (server/data-store.json) so that data created
//             during a session (new assets, posted lifecycle events)
//             survives a server restart — e.g. `tsx watch` reloading
//             after a source file is edited. Swap this module for a
//             real DB repository later — nothing outside this file
//             needs to change shape-wise.
// ======================================================


import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  Asset,
  DepreciationScheduleRow,
  LifecycleEventType,
  LifecyclePreviewResult,
  LifecyclePreviewResultRow,
  TimelineEntry
} from '../types.js';



// ======================================================
// START: Data Functions
// ======================================================

// ---------- JSON-file persistence ----------
// Resolves to <server>/data-store.json whether running from src (tsx) or
// from the compiled dist/ output — both sit two levels under the server
// root (src/data/assets.ts or dist/data/assets.js).
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORE_PATH = path.join(__dirname, '..', '..', 'data-store.json');

type StoreShape = {
  assets: Asset[];
  timelines: Record<string, TimelineEntry[]>;
  depreciationSchedules: Record<string, DepreciationScheduleRow[]>;
};

// ======================================================
// Function : persist
// Purpose  : Writes the current in-memory assets/timelines/schedules to
//            data-store.json. Called after every mutation so a server
//            restart picks up right where the session left off.
// ======================================================

export function persist(): void {
  const snapshot: StoreShape = { assets, timelines, depreciationSchedules };
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(snapshot, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist data-store.json:', err);
  }
}

// ======================================================
// END: persist
// ======================================================

// Seed data — used only the first time the app runs (no data-store.json
// on disk yet). Every run after that loads whatever was last persisted.
const SEED_ASSETS: Asset[] = [
  {
    assetNumber: '845862189',
    description: 'Network Rack — AWS AFS',
    assetClass: '00.12', // Information Systems (computers & peripheral equipment)
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
    assetClass: '00.4', // Industrial Steam and Electric Generation/Distribution Systems
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
    assetClass: '00.4', // Industrial Steam and Electric Generation/Distribution Systems
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
    assetClass: '00.12', // Information Systems (computers & peripheral equipment)
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
    assetClass: '00.12', // Information Systems (computers & peripheral equipment)
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
    assetClass: '00.4', // Industrial Steam and Electric Generation/Distribution Systems
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
    assetClass: '00.12', // Information Systems (computers & peripheral equipment)
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
    assetClass: '00.4', // Industrial Steam and Electric Generation/Distribution Systems
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
    assetClass: '', // TODO: buildings are real property (Sec 1250) — not in the MACRS personal-property class list; needs its own building-depreciation handling, not an asset class code
    company: '5B',
    cost: 12_400_000,
    accumDepreciation: 2_100_000,
    nbv: 10_300_000,
    method: 'SL Mid-Month',
    status: 'Active'
  }
];

const SEED_DEPRECIATION_SCHEDULES: Record<string, DepreciationScheduleRow[]> = {
  '845862189': [
    { year: '2026 (Yr 1)', openingNbv: 580463, rate: 10.0, depreciation: 58046, accumDepreciation: 58046, closingNbv: 522417 },
    { year: '2027 (Yr 2)', openingNbv: 522417, rate: 20.0, depreciation: 116093, accumDepreciation: 174139, closingNbv: 406324 },
    { year: '2028 (Yr 3)', openingNbv: 406324, rate: 20.0, depreciation: 116093, accumDepreciation: 290232, closingNbv: 290232 },
    { year: '2029 (Yr 4)', openingNbv: 290232, rate: 20.0, depreciation: 116093, accumDepreciation: 406324, closingNbv: 174139 },
    { year: '2030 (Yr 5)', openingNbv: 174139, rate: 20.0, depreciation: 116093, accumDepreciation: 522417, closingNbv: 58046 },
    { year: '2031 (Yr 6)', openingNbv: 58046, rate: 10.0, depreciation: 58046, accumDepreciation: 580463, closingNbv: 0 }
  ]
};

const SEED_TIMELINES: Record<string, TimelineEntry[]> = {
  '845862189': [
    { date: 'MAR 19, 2026', title: 'Addition — $579,580.98', description: 'Asset capitalized and placed in service', done: true },
    { date: 'APR 21, 2026', title: 'Adjustment — +$882.26', description: 'Cost basis adjustment · revision absorbed $8.82', done: true },
    { date: 'UPCOMING', title: 'Monthly Depreciation', description: 'Next charge scheduled May 31, 2026', done: false }
  ]
};

// ======================================================
// Function : loadStore
// Purpose  : Reads data-store.json if it exists (a prior session's
//            saved state); falls back to the hardcoded seed data on
//            first run or if the file is missing/corrupt.
// ======================================================

function loadStore(): StoreShape {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<StoreShape>;
      if (Array.isArray(parsed.assets)) {
        return {
          assets: parsed.assets,
          timelines: parsed.timelines ?? {},
          depreciationSchedules: parsed.depreciationSchedules ?? {}
        };
      }
    }
  } catch (err) {
    console.error('Failed to read data-store.json, falling back to seed data:', err);
  }
  return {
    assets: SEED_ASSETS,
    timelines: SEED_TIMELINES,
    depreciationSchedules: SEED_DEPRECIATION_SCHEDULES
  };
}

// ======================================================
// END: loadStore
// ======================================================

const store = loadStore();

// In-memory "table", hydrated from data-store.json (or the seed data on
// first run). Every mutation below also calls persist() so the file stays
// in sync — that's what makes newly created assets and posted lifecycle
// events survive a server restart.
export const assets: Asset[] = store.assets;
export const depreciationSchedules: Record<string, DepreciationScheduleRow[]> = store.depreciationSchedules;
export const timelines: Record<string, TimelineEntry[]> = store.timelines;

// First run (no data-store.json yet) — write it out immediately so the
// file exists from the very first request.
if (!fs.existsSync(STORE_PATH)) persist();

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

//HEAD
// ── Apply a posted Lifecycle event to the Asset Register ────────────────
// Called right after a "Confirm & Post" click successfully writes its
// immutable row to the ClickHouse asset_transactions ledger (see
// routes/lifecycle.ts POST /post). This is what makes a posted event show
// up on the Asset Register / Asset Detail pages: it mutates (or creates)
// the matching row in the `assets` in-memory table using the exact same
// preview numbers the user saw on the Lifecycle page, and drops a matching
// entry into that asset's Lifecycle Timeline.

// ======================================================
// Function : parseMoney
// Purpose  : Turns a formatted money string (e.g. "-$1,850.00") back into
//            a plain number, so preview.rows values can drive the store.
// ======================================================

function parseMoney(value: string | undefined): number {
  if (!value) return 0;
  const negative = value.trim().startsWith('-');
  const digits = value.replace(/[^0-9.]/g, '');
  const n = parseFloat(digits);
  if (Number.isNaN(n)) return 0;
  return negative ? -n : n;
}

// ======================================================
// END: parseMoney
// ======================================================

// ======================================================
// Function : rowValue
// Purpose  : Looks up a preview row's value by its label.
// ======================================================

function rowValue(rows: LifecyclePreviewResultRow[], label: string): string | undefined {
  return rows.find((r) => r.label === label)?.value;
}

// ======================================================
// END: rowValue
// ======================================================

// ======================================================
// Function : createPlaceholder
// Purpose  : Non-Addition events reference an assetNumber that should
//            already exist. If the user posted against one that isn't in
//            the register yet, don't silently drop the event — create a
//            bare 'Under Review' row so the post is still visible.
// ======================================================

function createPlaceholder(assetNumber: string): Asset {
  const placeholder: Asset = {
    assetNumber,
    description: `Asset ${assetNumber}`,
    assetClass: 'Machinery',
    company: '5B',
    cost: 0,
    accumDepreciation: 0,
    nbv: 0,
    method: 'MACRS',
    status: 'Under Review'
  };
  assets.push(placeholder);
  persist();
  return placeholder;
}

// ======================================================
// END: createPlaceholder
// ======================================================

// ======================================================
// Function : buildTaxFactPattern
// Purpose  : Derives/updates the Tax Fact Pattern block shown on Asset
//            Detail → Overview from the submitted fields + preview rows.
// ======================================================

function buildTaxFactPattern(
  fields: Record<string, string | number | boolean>,
  rows: LifecyclePreviewResultRow[],
  prior?: Asset['taxFactPattern']
): Asset['taxFactPattern'] {
  const methodConv = rowValue(rows, 'Method / Convention') ?? '';
  const [method, convention] = methodConv.split('/').map((s) => s?.trim());
  const bonusPct = typeof fields.bonusPct === 'number' ? fields.bonusPct : Number(fields.bonusPct);
  // 'Current-Year Rate' is the % this addition is actually depreciating at
  // (from the MACRS/SL rate table lookup) — this is what the Dashboard's
  // Monthly Depreciation Expense chart and the Forecasting roll-forward
  // both multiply against cost. It used to be dropped on the floor here
  // (hardcoded to prior?.annualRate ?? 0), which silently zeroed out every
  // newly-added asset's contribution to those two views.
  const rateRow = rowValue(rows, 'Current-Year Rate');
  const annualRate = rateRow ? parseMoney(rateRow) : undefined;

  return {
    placedInService: typeof fields.placedInService === 'string' && fields.placedInService ? fields.placedInService : prior?.placedInService ?? '',
    recoveryPeriod: rowValue(rows, 'Recovery Life') ?? prior?.recoveryPeriod ?? '',
    method: method || prior?.method || 'MACRS',
    convention: convention || prior?.convention || 'Half-Year',
    bonusPct: Number.isFinite(bonusPct) ? bonusPct : prior?.bonusPct ?? 0,
    annualRate: annualRate ?? prior?.annualRate ?? 0,
    propertyType: prior?.propertyType ?? 'Personal Property'
  };
}

// ======================================================
// END: buildTaxFactPattern
// ======================================================

// ======================================================
// Function : pushTimelineEntry
// Purpose  : Prepends a "just posted" entry to this asset's Lifecycle
//            Timeline (shown on Asset Detail → Overview).
// ======================================================

function pushTimelineEntry(assetNumber: string, eventType: LifecycleEventType, preview: LifecyclePreviewResult): void {
  const entry: TimelineEntry = {
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase(),
    title: `${eventType} — ${preview.badgeText}`,
    description: preview.formulaNote,
    done: true
  };
  timelines[assetNumber] = [entry, ...(timelines[assetNumber] ?? [])];
}

// ======================================================
// END: pushTimelineEntry
// ======================================================

// ======================================================
// Function : applyLifecycleEvent
// Purpose  : Updates (or creates) the Asset Register row for a posted
//            Lifecycle event, using the same preview numbers the user
//            confirmed on-screen. Returns the resulting Asset.
// ======================================================

// ======================================================
// Function : inferAssetClass
// Purpose  : The Lifecycle "Addition" card now has its own Asset Class
//            select (see client/src/data/lifecycleFormSchemas.js) — use
//            whatever the user picked there. If it's missing (e.g. an
//            older test case posted before that field existed), fall
//            back to a best-guess from the tax Asset Type string rather
//            than always defaulting to 'Machinery': real-property tax
//            types are Buildings, everything else keeps the previous
//            'Machinery' fallback since Personal Property tax types
//            don't otherwise distinguish equipment from vehicles.
//            Fixes the Dashboard "Assets by Class" pie silently
//            collapsing toward one class over time, since every new
//            addition used to land in the same bucket regardless of
//            what was actually being capitalized.
// ======================================================

function inferAssetClass(fields: Record<string, string | number | boolean>): string {
  if (typeof fields.assetClass === 'string' && fields.assetClass) return fields.assetClass;
  const assetType = typeof fields.assetType === 'string' ? fields.assetType : '';
  if (/residential|nonresidential/i.test(assetType)) return 'Buildings';
  return 'Machinery';
}

// ======================================================
// END: inferAssetClass
// ======================================================

export function applyLifecycleEvent(
  eventType: LifecycleEventType,
  assetNumber: string,
  fields: Record<string, string | number | boolean>,
  preview: LifecyclePreviewResult
): Asset {
  const rows = preview.rows;
  const existing = findAsset(assetNumber);
  let asset: Asset;

  switch (eventType) {
    case 'Addition': {
      const cost = typeof fields.cost === 'number' ? fields.cost : Number(fields.cost) || 0;
      const accumDepreciation = parseMoney(rowValue(rows, 'Ending Accum. Depreciation'));
      const nbv = parseMoney(rowValue(rows, 'Ending Net Book Value'));
      const methodConv = rowValue(rows, 'Method / Convention') ?? '';
      const method = methodConv.split('/')[0]?.trim();

      if (existing) {
        existing.cost = cost || existing.cost;
        existing.accumDepreciation = accumDepreciation;
        existing.nbv = nbv;
        existing.status = 'Active';
        if (method) existing.method = method;
        existing.taxFactPattern = buildTaxFactPattern(fields, rows, existing.taxFactPattern);
        asset = existing;
      } else {
        asset = {
          assetNumber,
          description: typeof fields.description === 'string' && fields.description ? fields.description : `New ${String(fields.assetType ?? 'Asset')}`,
          assetClass: inferAssetClass(fields),
          company: typeof fields.company === 'string' && fields.company ? fields.company : '5B',
          cost,
          accumDepreciation,
          nbv,
          method: method || 'MACRS',
          status: 'Active',
          taxFactPattern: buildTaxFactPattern(fields, rows)
        };
        assets.push(asset);
      }
      break;
    }

    case 'Adjustment': {
      asset = existing ?? createPlaceholder(assetNumber);
      const newCost = parseMoney(rowValue(rows, 'New Cost Basis'));
      asset.cost = newCost || asset.cost;
      asset.accumDepreciation = parseMoney(rowValue(rows, 'Ending Accum. Depreciation'));
      asset.nbv = parseMoney(rowValue(rows, 'Ending Net Book Value'));
      break;
    }

    case 'Transfer': {
      asset = existing ?? createPlaceholder(assetNumber);
      const destCompany = typeof fields.destCompany === 'string' ? fields.destCompany : undefined;
      const destLocation = typeof fields.destLocation === 'string' ? fields.destLocation : undefined;
      if (destCompany) asset.company = destCompany;
      if (destLocation) asset.location = destLocation;

      const remainingCost = parseMoney(rowValue(rows, 'Remaining Cost at Source'));
      const remainingAD = parseMoney(rowValue(rows, 'Remaining A/D at Source'));
      const remainingNBV = parseMoney(rowValue(rows, 'Remaining NBV at Source'));
      if (remainingCost) asset.cost = remainingCost;
      asset.accumDepreciation = remainingAD || asset.accumDepreciation;
      asset.nbv = remainingNBV || asset.nbv;
      asset.status = 'Transferred';
      break;
    }

    case 'Retirement': {
      asset = existing ?? createPlaceholder(assetNumber);
      const costDisposed = parseMoney(rowValue(rows, 'Cost Disposed'));
      const nbvDisposed = parseMoney(rowValue(rows, 'Net Book Value Disposed'));
      const glRow = rows.find((r) => ['Gain', 'Loss', 'No Gain/Loss'].includes(r.label));

      asset.status = 'Retired';
      asset.accumDepreciation = costDisposed - nbvDisposed || asset.accumDepreciation;
      asset.nbv = Math.max(asset.cost - asset.accumDepreciation, 0);
      asset.disposal = {
        disposalDate: typeof fields.disposalDate === 'string' && fields.disposalDate ? fields.disposalDate : new Date().toISOString().slice(0, 10),
        adAtDisposal: asset.accumDepreciation,
        gainLoss: glRow ? parseMoney(glRow.value) : 0
      };
      break;
    }

    case 'Reinstatement': {
      asset = existing ?? createPlaceholder(assetNumber);
      const restoredCost = parseMoney(rowValue(rows, 'Restored Cost'));
      asset.status = 'Active';
      if (restoredCost) asset.cost = restoredCost;
      asset.accumDepreciation = parseMoney(rowValue(rows, 'Ending Accum. Depreciation'));
      asset.nbv = parseMoney(rowValue(rows, 'Ending Net Book Value'));
      delete asset.disposal;
      break;
    }

    case 'Reclassification': {
      asset = existing ?? createPlaceholder(assetNumber);
      const newMlc = rowValue(rows, 'New Method / Life / Convention');
      if (newMlc) asset.method = newMlc.split('/')[0]?.trim() || asset.method;
      asset.accumDepreciation = parseMoney(rowValue(rows, 'Ending Accum. Depreciation'));
      asset.nbv = parseMoney(rowValue(rows, 'Ending Net Book Value'));
      break;
    }

    default:
      asset = existing ?? createPlaceholder(assetNumber);
  }

  pushTimelineEntry(assetNumber, eventType, preview);
  persist();
  return asset;
}

// ======================================================
// END: applyLifecycleEvent
// ======================================================

// ======================================================
// END: Data Functions
// ======================================================

