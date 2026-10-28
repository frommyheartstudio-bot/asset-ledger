import { createRequire } from 'node:module';
import { describe, expect, it, vi } from 'vitest';
import { sqlRows } from './sqlSeed.js';

// Every stored HTML test case is run (a) straight through the HTML engine copy and (b) through the
// path Lifecycle Event / Bulk Import use (computeLifecycleEvent, with the inputs as FORM FIELDS).
// The numbers shown by the app must equal the HTML engine's numbers.
const require = createRequire(import.meta.url);
const RT = require('../calc-engine/rate-tables.cjs');
const byYear: any = {}, mm: any = {};
for (const [k, l, y, p] of sqlRows('rate-tables.sql', 'macrs_rate_by_year')) ((byYear[String(k)] ??= {})[String(l)] ??= [])[Number(y) - 1] = Number(p);
for (const [k, m, y1, a] of sqlRows('rate-tables.sql', 'macrs_mm_rate')) (mm[String(k)] ??= { year1: {}, annual: Number(a) }).year1[String(m)] = Number(y1);
RT.load({ byYear, mm, adsLives: sqlRows('rate-tables.sql', 'macrs_ads_lives').map((r) => Number(r[0])) });
const cfg: any = {}, method: any = {};
for (const [c, , t, m, v, r] of sqlRows('asset-type-config.sql', 'asset_type_config')) { cfg[String(c)] = { type: t, method: m, conv: v, rate: Number(r) }; method[String(c)] = String(m); }

vi.mock('../src/services/assetTypeConfig.js', () => ({ codeForLabel: (x: string) => x, getEngineAssetConfig: () => cfg, methodForAssetCode: (c: string) => method[c] ?? 'MACRS' }));
vi.mock('../src/services/bonusRates.js', () => ({ bonusPctForDate: () => null, customBonusPct: () => null }));
vi.mock('../src/data/assets.js', () => ({ findAsset: () => undefined }));
const { computeLifecycleEvent } = await import('../src/services/lifecycleCompute.js');

const ENG: any = {
  additions: ['Addition', 'additions', 'calculateAddition'], adjustments: ['Adjustment', 'adjustments', 'calculateAdjustment'],
  disposals: ['Retirement', 'disposals', 'calculateDisposal'], transfers: ['Transfer', 'transfers', 'calculateTransfer'],
  reinstatements: ['Reinstatement', 'reinstatements', 'calculateReinstatement'], reclassifications: ['Reclassification', 'reclassifications', 'calculateReclassification']
};
// engine input name -> form field name (the inverse of the mapping in services/depreciation.ts)
const RENAME: any = {
  additions: { pisd: 'placedInService', bonusPercent: 'bonusPct' },
  adjustments: { pisd: 'placedInService', bonusPercent: 'bonusPct' },
  disposals: { assetCost: 'cost', pisd: 'placedInService', bonusPercentage: 'bonusPct', boyAccumulatedDepr: 'boyAccumDepr', recoveryPeriod: 'recoveryPeriodYears' },
  transfers: { pisd: 'placedInService', bonusPercent: 'bonusPct' },
  reinstatements: { pisd: 'placedInService', bonusPercent: 'bonusPct' },
  reclassifications: { pisd: 'placedInService', oldBonusPercent: 'oldBonusPct', newBonusPercent: 'newBonusPct' }
};
const num = (s: string) => Number(String(s).replace(/[$,]/g, ''));
const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
// [row label(s) shown in the app, getter on the HTML engine's final step]
const CHECK: any = {
  additions: (r: any) => ({ 'Bonus (AFYD)': r.steps.step7.factPatternAFYD, 'Ending Accum. Depreciation': r.steps.step7.deprEndingAccum, 'Ending Net Book Value': r.steps.step7.deprNetBookValue, 'Current-Period Regular Depreciation (YTD)': r.steps.step7.ytdDeprExpense }),
  adjustments: (r: any) => ({ 'New Cost Basis': r.steps.step7.costEndingBalance, 'Bonus on Adjustment': r.steps.step7.factPatternAFYD, 'Depreciation This Period': r.steps.step7.deprInPeriod, 'Ending Accum. Depreciation': r.steps.step7.deprEndingAccum, 'Ending Net Book Value': r.steps.step7.deprNetBookValue }),
  disposals: (r: any) => ({ 'Cost Disposed': r.steps.step10.costDisposed, 'A/D Disposed (BOY)': r.steps.step10.adDisposed, 'Current-Year Depreciation to Disposal': r.steps.step10.currentYearDepreciation, 'Revision Absorbed (Backdated)': r.steps.step10.revisionAbsorbed, Proceeds: r.steps.step10.proceeds }),
  transfers: (r: any) => ({ 'NBV Received at Destination': r.steps.step9.destination.netBookValue, 'Remaining Cost at Source': r.steps.step9.source.costEndingBalance, 'Remaining A/D at Source': r.steps.step9.source.deprEndingAccum, 'Remaining NBV at Source': r.steps.step9.source.netBookValue }),
  reinstatements: (r: any) => ({ 'Restored Cost': r.steps.step7.costReinstated, 'Restored A/D (at disposal)': r.steps.step7.adReinstated, 'Gain/Loss Reversal': r.steps.step7.gainLossReversal, 'Resumed Depreciation (this period)': r.steps.step7.deprInPeriod, 'Ending Accum. Depreciation': r.steps.step7.deprEndingAccum, 'Ending Net Book Value': r.steps.step7.netBookValue }),
  reclassifications: (r: any) => ({ 'Revision (New − Old)': r.steps.step7.fedRevisionAbsorbed, 'Going-Forward Monthly Depreciation': r.steps.step7.goingForwardMonthlyDepr, 'Ending Accum. Depreciation': r.steps.step7.deprEndingAccum, 'Ending Net Book Value': r.steps.step7.netBookValue })
};

const cases = sqlRows('engine-test-cases.sql', 'engine_test_cases');
const report: string[] = [];
let compared = 0, mismatches = 0, skipped = 0;

describe('HTML engine vs Lifecycle Event / Bulk Import path (all stored HTML cases)', () => {
  it('numbers shown by the app equal the HTML engine numbers', () => {
    for (const [engine, id, , inputsJson] of cases) {
      const [eventType, file, fn] = ENG[String(engine)];
      const inputs = JSON.parse(String(inputsJson));
      const html = require(`../calc-engine/${file}.cjs`)[fn]({ ...inputs, assetConfig: cfg });
      if (html.error) { skipped++; continue; }
      const fields: any = {};
      for (const [k, v] of Object.entries(inputs)) fields[(RENAME[String(engine)] ?? {})[k] ?? k] = v;
      const app = computeLifecycleEvent(eventType, 'T-' + id, fields).preview;
      if (app.badgeText === 'Needs Attention') { mismatches++; report.push(`${engine}/${id}: app says Needs Attention but HTML engine calculated`); continue; }
      for (const [label, expected] of Object.entries<any>(CHECK[String(engine)](html))) {
        const row = app.rows.find((x: any) => x.label === label);
        compared++;
        if (!row) { mismatches++; report.push(`${engine}/${id}: row "${label}" missing in app`); continue; }
        if (Math.abs(num(row.value) - Number(expected)) > 0.0050001) { mismatches++; report.push(`${engine}/${id}: ${label}: HTML raw=${expected} APP shows=${num(row.value)}`); }
      }
    }
    console.log(`cases=${cases.length} compared values=${compared} mismatches=${mismatches} skipped(engine error)=${skipped}\n` + report.join('\n'));
    expect(report).toEqual([]);
  });
});
