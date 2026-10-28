import { createRequire } from 'node:module';
import { describe, expect, it, vi } from 'vitest';
import { sqlRows } from './sqlSeed.js';

// API-layer parity: a Service-API call that LEAVES Bonus % / Life BLANK must give exactly the
// same amounts as the UI / HTML calculator, which auto-fill those fields. No server, no database.

const require = createRequire(import.meta.url);
const RATE_TABLES = require('../calc-engine/rate-tables.cjs');
const byYear: Record<string, Record<string, number[]>> = {};
for (const [key, life, year, pct] of sqlRows('rate-tables.sql', 'macrs_rate_by_year')) {
  ((byYear[String(key)] ??= {})[String(life)] ??= [])[Number(year) - 1] = Number(pct);
}
const mm: Record<string, { year1: Record<string, number>; annual: number }> = {};
for (const [key, month, y1, annual] of sqlRows('rate-tables.sql', 'macrs_mm_rate')) {
  (mm[String(key)] ??= { year1: {}, annual: Number(annual) }).year1[String(month)] = Number(y1);
}
RATE_TABLES.load({ byYear, mm, adsLives: sqlRows('rate-tables.sql', 'macrs_ads_lives').map((r) => Number(r[0])) });

const cfg: Record<string, any> = {};
const method: Record<string, string> = {};
for (const [code, , propertyType, m, convention, rate] of sqlRows('asset-type-config.sql', 'asset_type_config')) {
  cfg[String(code)] = { type: propertyType, method: m, conv: convention, rate: Number(rate) };
  method[String(code)] = String(m);
}

// Stand-ins for the two DB-backed in-memory caches (Default Table: 2024 PISD = 60%).
vi.mock('../src/services/assetTypeConfig.js', () => ({
  codeForLabel: (x: string) => x,
  getEngineAssetConfig: () => cfg,
  methodForAssetCode: (c: string) => method[c] ?? 'MACRS'
}));
vi.mock('../src/data/assets.js', () => ({ findAsset: () => undefined }));
vi.mock('../src/services/bonusRates.js', () => ({
  bonusPctForDate: (d: string) => (d.startsWith('2024') ? 60 : 0),
  customBonusPct: () => null
}));

const { calculateLifecyclePreview } = await import('../src/services/depreciation.js');
const run = (eventType: any, fields: any) => calculateLifecyclePreview({ eventType, assetNumber: 'T', fields });
const same = (type: string, blank: any, explicit: any) => {
  const a = run(type, blank), b = run(type, explicit);
  expect(a.badgeText).not.toBe('Needs Attention');
  expect(a.rows).toEqual(b.rows);
  expect(a.sections).toEqual(b.sections);
};

const common = { placedInService: '2024-03-15', accountingPeriodDate: '2025-06-30', convention: 'HY (Half-Year)' };

describe('API blank Bonus % / Life = UI auto-fill', () => {
  it('Addition 39-yr: blank life derived from the asset code (not 60 months)', () => {
    const f = { ...common, cost: 100000, assetType: 'GDS-39', convention: 'Mid-Month' };
    same('Addition', f, { ...f, bonusPct: 60, lifeMonths: 468 });
  });
  it('Adjustment', () => {
    const f = { ...common, assetType: 'GDS-5', adjustmentAmount: 5000, originalCost: 50000, effectiveDate: '2025-06-30', existingAccumDepr: 30000 };
    same('Adjustment', f, { ...f, bonusPct: 60, lifeMonths: 60 });
  });
  it('Retirement', () => {
    const f = { ...common, assetType: 'GDS-7', cost: 40000, costDisposed: 10000, proceeds: 3000, disposalDate: '2025-06-30', boyAccumDepr: 20000, monthlyDeprRate: 300 };
    same('Retirement', f, { ...f, bonusPct: 60, recoveryPeriodYears: 7 });
  });
  it('Reinstatement', () => {
    const f = { ...common, assetType: 'GDS-10', originalCost: 20000, originalADAtDisposal: 8000, originalGainLoss: 500, originalDisposalDate: '2025-01-31', reinstatementDate: '2025-06-30' };
    same('Reinstatement', f, { ...f, bonusPct: 60, lifeMonths: 120 });
  });
  it('Reclassification', () => {
    const f = { ...common, oldAssetType: 'GDS-5', newAssetType: 'GDS-7', originalCost: 30000, existingAD: 12000, effectiveDate: '2025-06-30' };
    same('Reclassification', f, { ...f, oldBonusPct: 60, newBonusPct: 60, oldLifeMonths: 60, newLifeMonths: 84 });
  });
  it('an explicitly posted Bonus % / Life is never overridden', () => {
    const f = { ...common, assetType: 'GDS-5', adjustmentAmount: 5000, originalCost: 50000, effectiveDate: '2025-06-30', existingAccumDepr: 30000 };
    expect(run('Adjustment', { ...f, bonusPct: 0 }).rows).not.toEqual(run('Adjustment', { ...f, bonusPct: 60 }).rows);
  });
});

// ---- one code path: UI preview, Bulk Import, Service API and the agent all use computeLifecycleEvent ----
import { readFileSync } from 'node:fs';
describe('single calculation path', () => {
  const src = (f: string) => readFileSync(new URL(`../src/${f}`, import.meta.url), 'utf8');
  it('no entry point calls the calc-engine directly any more', () => {
    for (const f of ['routes/lifecycle.ts', 'routes/service.ts', 'services/agent-actions.ts']) {
      expect(src(f), f).not.toMatch(/calculateLifecyclePreview\(/);
    }
    for (const f of ['routes/lifecycle.ts', 'services/agent-actions.ts']) expect(src(f), f).toMatch(/computeLifecycleEvent\(/);
  });
  it('UI preview and API give identical output for the same fields', async () => {
    const { computeLifecycleEvent } = await import('../src/services/lifecycleCompute.js');
    const f = { ...common, assetType: 'GDS-5', adjustmentAmount: 5000, originalCost: 50000, effectiveDate: '2025-06-30', existingAccumDepr: 30000 };
    const ui = computeLifecycleEvent('Adjustment', 'X1', { ...f, bonusPct: 60, lifeMonths: 60 }).preview;
    const api = computeLifecycleEvent('Adjustment', 'X1', f).preview; // bonus + life left blank, like an API caller
    expect(api).toEqual(ui);
  });
});
