// ======================================================
// File Name : schedule-builder.ts
// Purpose   : Two things the Dashboard/Forecasting views were missing:
//
//             1. toISODate() — ONE date normalizer. The store currently
//                holds placedInService in at least three shapes
//                ('2026-03-19', '03/06/2026', 'MAR 19, 2026'). Every
//                "is this asset in service yet?" test in the app was a
//                raw string compare, so non-ISO dates silently gave the
//                wrong answer and .slice(5,7) read garbage as a month.
//
//             2. buildSchedule() — generates a real year-by-year
//                depreciation schedule for an asset that doesn't have
//                one. Before this, 15 of 16 assets had NO schedule, so
//                the Dashboard fell back to cost x annualRate / 12 —
//                the same number every single month, which is why the
//                Monthly Depreciation Expense chart was flat/zero.
//
//             Uses the existing IRS Pub-946 tables from
//             calc-engine/rate-tables.cjs, so generated schedules match
//             what the Lifecycle calculators produce.
// ======================================================

import { defaultRecoveryYears } from './recoveryDefaults.js';
import { createRequire } from 'node:module';
import type { Asset, DepreciationScheduleRow } from '../types.js';

// ======================================================
// START: Service Functions
// ======================================================

const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const RATE_TABLES = require('../../calc-engine/rate-tables.cjs');

// ======================================================
// Function : toISODate
// Purpose  : Normalizes any date string the store might hold into
//            'YYYY-MM-DD'. Returns null when there's nothing usable,
//            so callers can decide what "unknown date" should mean
//            instead of silently comparing a bad string.
// Input    : raw (unknown)
// Output   : 'YYYY-MM-DD' | null
// ======================================================

const MONTHS: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
};

export function toISODate(raw: unknown): string | null {
  if (!raw) return null;
  const s = String(raw).trim();
  if (!s) return null;

  // Already ISO: 2026-03-19 (or a full ISO timestamp)
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  // US slash/dash form: 03/06/2026, 3-6-2026
  const slash = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (slash) {
    const mm = slash[1].padStart(2, '0');
    const dd = slash[2].padStart(2, '0');
    return `${slash[3]}-${mm}-${dd}`;
  }

  // Timeline display form: 'MAR 19, 2026' / 'Mar 19 2026'
  const named = s.match(/^([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})$/);
  if (named) {
    const mm = MONTHS[named[1].toLowerCase()];
    if (mm) return `${named[3]}-${mm}-${named[2].padStart(2, '0')}`;
  }

  // Last resort — let Date try, but only accept a sane result.
  const d = new Date(s);
  if (!Number.isNaN(d.getTime()) && d.getFullYear() > 1900 && d.getFullYear() < 2200) {
    return d.toISOString().slice(0, 10);
  }
  return null;
}

// ======================================================
// END: toISODate
// ======================================================

// ======================================================
// Function : inServiceDate
// Purpose  : The date an asset actually started depreciating. Prefers
//            the tax fact pattern's placedInService; if that's missing
//            (12 of the 16 seeded assets), falls back to the first year
//            on its stored schedule, then to its disposal year, then to
//            the start of the current fiscal year — because an asset
//            carrying cost and accumulated depreciation IS on the books
//            and must not be excluded from the expense chart just
//            because nobody filled in a date.
// ======================================================

export function inServiceDate(asset: Asset, schedule?: DepreciationScheduleRow[]): string {
  const fromTfp = toISODate(asset.taxFactPattern?.placedInService);
  if (fromTfp) return fromTfp;

  const firstYear = schedule?.[0]?.year?.match(/(\d{4})/)?.[1];
  if (firstYear) return `${firstYear}-01-01`;

  const disposal = toISODate(asset.disposal?.disposalDate);
  if (disposal) return `${disposal.slice(0, 4)}-01-01`;

  return `${new Date().getFullYear()}-01-01`;
}

// ======================================================
// END: inServiceDate
// ======================================================

// ======================================================
// Function : recoveryYears
// Purpose  : Digs a recovery period out of whatever the asset has —
//            the tax fact pattern's recoveryPeriod string ('5-Year',
//            '39'), the method name, or a sane default per asset class.
//            Never returns 0, so we can't divide by zero downstream.
// ======================================================

export function recoveryYears(asset: Asset): number {
  const raw = asset.taxFactPattern?.recoveryPeriod ?? '';
  const n = Number(String(raw).match(/(\d+(?:\.\d+)?)/)?.[1]);
  if (Number.isFinite(n) && n > 0) return n;

  if (/39/.test(asset.method)) return 39;
  if (/27\.5/.test(asset.method)) return 27.5;
  return defaultRecoveryYears(asset.assetClass);
}

// ======================================================
// END: recoveryYears
// ======================================================

// ======================================================
// Function : rateForYear
// Purpose  : Asks the existing calc-engine (calc-engine/rate-tables.cjs
//            lookupRate) for this asset's Pub-946 percentage in a given
//            depreciation year, using its own method/life/convention.
//            Returns null when the engine has no table for that combo,
//            so buildSchedule falls back to a straight-line curve rather
//            than inventing a rate.
// ======================================================

// ======================================================
// Function : engineMethod
// Purpose  : Maps an asset method to the method name the calc-engine understands.
// ======================================================

function engineMethod(asset: Asset): string {
  const m = `${asset.taxFactPattern?.method ?? asset.method ?? ''}`.toLowerCase();
  if (m.includes('150')) return 'MACRS 150DB';
  if (m.includes('ads')) return 'MACRS ADS';
  if (m.includes('straight') || m.startsWith('sl')) return 'MACRS Straight-Line';
  return 'MACRS';
}

// ======================================================
// Function : engineConvention
// Purpose  : Maps an asset convention to the convention code the calc-engine understands.
// ======================================================

function engineConvention(asset: Asset): string {
  const c = `${asset.taxFactPattern?.convention ?? asset.method ?? ''}`.toLowerCase();
  if (c.includes('mid-month') || c.includes('mid month') || c.includes('mm')) return 'Mid-Month';
  if (c.includes('quarter') || c.includes('mq')) return 'MQ';
  return 'HY';
}

// ======================================================
// Function : rateForYear
// Purpose  : Looks up the depreciation rate % for a year from the rate tables; null when the lookup fails or gives no rate.
// ======================================================

function rateForYear(asset: Asset, life: number, year: number, monthPIS: number): number | null {
  try {
    const rate = RATE_TABLES.lookupRate({
      method: engineMethod(asset),
      lifeYears: Math.round(life),
      convention: engineConvention(asset),
      year,
      quarter: Math.min(4, Math.max(1, Math.ceil(monthPIS / 3))),
      monthPIS
    });
    return typeof rate === 'number' && Number.isFinite(rate) && rate > 0 ? rate : null;
  } catch {
    return null;
  }
}

// ======================================================
// END: rateForYear
// ======================================================

// ======================================================
// Function : bookedContext
// Purpose  : Is this asset a backdated / booked-later Addition? Returns the
//            year + month it was booked in (from taxFactPattern.bookedPeriod)
//            together with its placed-in-service year + month. null when the
//            booked period is unknown or is before the in-service month.
//            bookedMonth === pisdMonth (same year) is a normal current-period
//            Addition: any bonus (AFYD) then lands in that one month.
// ======================================================

export function bookedContext(asset: Asset): { bookedYear: number; bookedMonth: number; pisdYear: number; pisdMonth: number } | null {
  const booked = toISODate(asset.taxFactPattern?.bookedPeriod);
  const pis = toISODate(asset.taxFactPattern?.placedInService);
  if (!booked || !pis) return null;
  const bookedYear = Number(booked.slice(0, 4));
  const bookedMonth = Number(booked.slice(5, 7));
  const pisdYear = Number(pis.slice(0, 4));
  const pisdMonth = Number(pis.slice(5, 7));
  if (bookedYear * 12 + bookedMonth < pisdYear * 12 + pisdMonth) return null;
  return { bookedYear, bookedMonth, pisdYear, pisdMonth };
}

// ======================================================
// Function : bookedYearSplit
// Purpose  : Splits the booked year's schedule row into the ONE-TIME catch-up
//            (bonus AFYD + all regular depreciation from the in-service month
//            up to the month before booking = the calculator's "Revision
//            Absorbed") that is posted in the booked month, and the ordinary
//            monthly amount for the booked month and every month after it.
//            Same maths as the Additions calculator (getCumulativeDepr).
// ======================================================

export function bookedYearSplit(
  asset: Asset,
  rowDepreciation: number
): { bookedYear: number; bookedMonth: number; catchUp: number; monthly: number; afyd: number; missedRegular: number; pyRegular: number; cyRegular: number } | null {
  const ctx = bookedContext(asset);
  if (!ctx) return null;
  const cost = Number(asset.cost) || 0;
  const bonusPct = Math.min(100, Math.max(0, Number(asset.taxFactPattern?.bonusPct) || 0));
  const afyd = (cost * bonusPct) / 100;

  let missedRegular = 0;
  if (ctx.bookedYear * 12 + ctx.bookedMonth > ctx.pisdYear * 12 + ctx.pisdMonth) {
    const priorMonth = ctx.bookedMonth - 1 || 12;
    const priorYear = ctx.bookedMonth - 1 ? ctx.bookedYear : ctx.bookedYear - 1;
    try {
      missedRegular = Number(RATE_TABLES.getCumulativeDepr({
        cost,
        bonusPercent: bonusPct,
        lifeYears: Math.round(recoveryYears(asset)),
        method: engineMethod(asset),
        convention: engineConvention(asset),
        pisdMonth: ctx.pisdMonth,
        pisdYear: ctx.pisdYear,
        targetYear: priorYear,
        targetMonth: priorMonth
      })) || 0;
    } catch {
      missedRegular = 0;
    }
  }

  // Prior-year portion (py_revision_absorbed): regular depreciation from PISD through Dec 31 of the
  // year BEFORE the booked year. The rest of the missed regular (Jan .. month before booking, in the
  // booked year) is the current-year portion (fed_revision_absorbed). pyRegular + cyRegular = missedRegular.
  let pyRegular = 0;
  if (missedRegular > 0 && ctx.bookedYear > ctx.pisdYear) {
    try {
      pyRegular = Number(RATE_TABLES.getCumulativeDepr({
        cost,
        bonusPercent: bonusPct,
        lifeYears: Math.round(recoveryYears(asset)),
        method: engineMethod(asset),
        convention: engineConvention(asset),
        pisdMonth: ctx.pisdMonth,
        pisdYear: ctx.pisdYear,
        targetYear: ctx.bookedYear - 1,
        targetMonth: 12
      })) || 0;
    } catch {
      pyRegular = 0;
    }
    pyRegular = Math.min(pyRegular, missedRegular);
  }
  const cyRegular = missedRegular - pyRegular;

  const catchUp = Math.min(round2(afyd + missedRegular), rowDepreciation);
  const monthsLeft = 13 - ctx.bookedMonth; // booked month .. December
  const monthly = Math.max(0, round2((rowDepreciation - catchUp) / monthsLeft));
  return { bookedYear: ctx.bookedYear, bookedMonth: ctx.bookedMonth, catchUp, monthly, afyd: round2(afyd), missedRegular: round2(missedRegular), pyRegular: round2(pyRegular), cyRegular: round2(cyRegular) };
}

// ======================================================
// Function : withBonusAndRevision
// Purpose  : Adds the two columns the Depreciation Schedule shows, using the same numbers
//            as the Additions calculator:
//              bonus            = Step 4  AFYD = Cost x Bonus%   (in the year it is recognised)
//              revisionAbsorbed = Step 6  missed regular (PISD .. month before booking)
//                                         + missed bonus; only for a backdated Addition,
//                                         in the booked year (that is where it is posted).
//            "Depreciation" stays the year's total expense, so Accum / NBV still tie out.
// ======================================================

export function withBonusAndRevision(asset: Asset, rows: DepreciationScheduleRow[]): DepreciationScheduleRow[] {
  const cost = Number(asset.cost) || 0;
  const bonusPct = Math.min(100, Math.max(0, Number(asset.taxFactPattern?.bonusPct) || 0));
  const afyd = round2((cost * bonusPct) / 100);
  const ctx = bookedContext(asset);
  const firstYear = rows[0] ? Number(rows[0].year.slice(0, 4)) : 0;

  return rows.map((r) => {
    const year = Number(r.year.slice(0, 4));
    const split = ctx && ctx.bookedYear === year ? bookedYearSplit(asset, r.depreciation) : null;
    if (split) {
      const backdated = split.bookedYear * 12 + split.bookedMonth > ctx!.pisdYear * 12 + ctx!.pisdMonth;
      return {
        ...r,
        bonus: split.afyd,
        // Current-year revision = missed bonus + missed regular inside the booked year; prior-year = regular through prior Dec 31.
        cyRevisionAbsorbed: backdated ? round2(split.afyd + split.cyRegular) : 0,
        pyRevisionAbsorbed: backdated ? split.pyRegular : 0,
        revisionAbsorbed: backdated ? round2(split.afyd + split.missedRegular) : 0
      };
    }
    // No booked period known (older asset): bonus sits in the first (in-service) year, no revision.
    return { ...r, bonus: !ctx && year === firstYear ? afyd : 0, cyRevisionAbsorbed: 0, pyRevisionAbsorbed: 0, revisionAbsorbed: 0 };
  });
}

// ======================================================
// Function : buildSchedule
// Purpose  : Produces the year-by-year rows the Dashboard chart and the
//            Forecasting roll-forward read. Starts from the asset's
//            CURRENT book position (cost less accumulated depreciation),
//            not from a clean slate, so a part-depreciated asset picks
//            up where it actually is. MACRS percentages when the asset
//            has a table-driven fact pattern; straight-line over the
//            remaining life otherwise. Never emits negative
//            depreciation and never drives closing NBV below zero.
// Input    : asset
// Output   : DepreciationScheduleRow[]
// ======================================================

export function buildSchedule(asset: Asset): DepreciationScheduleRow[] {
  const cost = Number(asset.cost) || 0;
  if (cost <= 0) return [];

  const life = recoveryYears(asset);
  const pis = inServiceDate(asset);
  const startYear = Number(pis.slice(0, 4));
  const monthPIS = Number(pis.slice(5, 7)) || 1;

  // Bonus (AFYD) is expensed in Year 1; regular MACRS runs on what is left (cost - AFYD).
  const bonusPct = Math.min(100, Math.max(0, Number(asset.taxFactPattern?.bonusPct) || 0));
  const afyd = round2((cost * bonusPct) / 100);
  const basis = cost - afyd;

  const rows: DepreciationScheduleRow[] = [];
  let accum = 0;
  let openingNbv = cost;

  // One extra year: both MACRS half-year/mid-month and the straight-line
  // fallback spill a partial final year past the nominal recovery period.
  const totalYears = Math.ceil(life) + 1;

  for (let i = 0; i < totalYears; i++) {
    if (openingNbv <= 0.005) break;

    // Pub-946 table rate when the engine has one for this asset's
    // method/life/convention; otherwise straight-line with a half year
    // at each end, matching the convention the rest of the app assumes.
    const slRate = i === 0 || i === Math.ceil(life) ? (100 / life) / 2 : 100 / life;
    const ratePct = rateForYear(asset, life, i + 1, monthPIS) ?? slRate;

    let depreciation = round2((basis * ratePct) / 100) + (i === 0 ? afyd : 0);
    if (accum + depreciation > cost) depreciation = round2(cost - accum);
    if (depreciation < 0) depreciation = 0;

    accum = round2(accum + depreciation);
    const closingNbv = round2(cost - accum);

    rows.push({
      year: `${startYear + i} (Yr ${i + 1})`,
      openingNbv: round2(openingNbv),
      // With bonus the row's rate is the effective % of cost (100% bonus -> 100.00%).
      rate: bonusPct > 0 ? round2((depreciation / cost) * 100) : round2(ratePct),
      depreciation,
      accumDepreciation: accum,
      closingNbv
    });

    openingNbv = closingNbv;
  }

  // Backdated Addition into a LATER year: the earlier years are closed, so nothing is
  // posted back into them. Fold every earlier year into the year the Addition was booked.
  const booked = bookedContext(asset);
  if (booked && booked.bookedYear > startYear) {
    const upTo = rows.filter((r) => Number(r.year.slice(0, 4)) <= booked.bookedYear);
    const rest = rows.filter((r) => Number(r.year.slice(0, 4)) > booked.bookedYear);
    const folded = round2(upTo.reduce((t, r) => t + r.depreciation, 0));
    const bookedRow: DepreciationScheduleRow = {
      year: `${booked.bookedYear} (Yr ${booked.bookedYear - startYear + 1})`,
      openingNbv: round2(cost),
      rate: round2((folded / cost) * 100),
      depreciation: folded,
      accumDepreciation: folded,
      closingNbv: round2(cost - folded)
    };
    return [bookedRow, ...rest];
  }

  return rows;
}

// ======================================================
// END: buildSchedule
// ======================================================

// ======================================================
// Function : ensureSchedules
// Purpose  : Backfills a generated schedule for every asset that has
//            none. Called once at boot and again after any mutation
//            that creates an asset, so no asset can ever sit invisible
//            to the Dashboard chart the way 15 of 16 did before.
//            Returns the asset numbers it filled in, for the boot log.
// ======================================================

export function ensureSchedules(
  assetList: Asset[],
  schedules: Record<string, DepreciationScheduleRow[]>
): string[] {
  const filled: string[] = [];
  for (const asset of assetList) {
    const existing = schedules[asset.assetNumber];
    if (existing && existing.length > 0) continue;
    const built = buildSchedule(asset);
    if (built.length > 0) {
      schedules[asset.assetNumber] = built;
      filled.push(asset.assetNumber);
    }
  }
  return filled;
}

// ======================================================
// END: ensureSchedules
// ======================================================

// ======================================================
// Function : round2
// Purpose  : Rounds a number to 2 decimal places.
// ======================================================

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ======================================================
// END: Service Functions
// ======================================================

// ======================================================
// END OF FILE : schedule-builder.ts
// ======================================================
