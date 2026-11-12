// ======================================================
// File Name : report-detail.ts
// Purpose   : Builds the full-detail rows behind the Reporting Center CSV.
//             One row per Asset x Book x Year: every asset field and fact-pattern
//             value, plus that year's depreciation schedule line (bonus, revision
//             absorbed, depreciation, year-end accumulated depreciation and NBV).
//             Reads the same sources as Asset Detail (viewAssetForBook,
//             scheduleForBook, withBonusAndRevision) so the CSV ties out with the screen.
// ======================================================

import type { Asset, DepreciationScheduleRow } from '../types.js';
import { scheduleForBook, viewAssetForBook } from './book-view.js';
import { toISODate, withBonusAndRevision } from './schedule-builder.js';

// ======================================================
// START: Types
// ======================================================

export interface ReportDetailRow {
  // Asset
  book: string;
  ruleSource: string;
  ruleName: string;
  assetNumber: string;
  description: string;
  assetClass: string;
  company: string;
  costCenter: string;
  location: string;
  project: string;
  status: string;
  // Fact pattern
  placedInService: string;
  bookedPeriod: string;
  recoveryPeriod: string;
  method: string;
  convention: string;
  propertyType: string;
  bonusPct: number;
  bonusAmount: number;
  annualRate: number;
  // Current position
  cost: number;
  accumDepreciation: number;
  nbv: number;
  // Disposal (retired assets only)
  disposalDate: string;
  adAtDisposal: number | '';
  gainLoss: number | '';
  // Schedule year (blank when the asset has no schedule)
  year: string;
  yearEndDate: string;
  openingNbv: number | '';
  rate: number | '';
  bonus: number | '';
  cyRevisionAbsorbed: number | '';
  pyRevisionAbsorbed: number | '';
  pyBonusRevisionAbsorbed: number | '';
  depreciation: number | '';
  yearEndAccumDepreciation: number | '';
  closingNbv: number | '';
}

// ======================================================
// END: Types
// ======================================================

const r2 = (n: unknown): number => Math.round((Number(n) || 0) * 100) / 100;

// ======================================================
// Function : buildReportDetailRows
// Purpose  : Rows for every ticked book, narrowed to the chosen companies /
//            asset types. An empty company / asset type list means "no filter".
//            Every schedule year is included, so the bonus and year-end
//            balances of the whole life are in the file.
// ======================================================

export function buildReportDetailRows(
  allAssets: Asset[],
  books: string[],
  companies: string[] = [],
  assetTypes: string[] = []
): ReportDetailRow[] {
  const companySet = new Set(companies);
  const typeSet = new Set(assetTypes);
  const picked = allAssets.filter(
    (a) => (companySet.size === 0 || companySet.has(a.company)) && (typeSet.size === 0 || typeSet.has(a.assetClass))
  );

  const out: ReportDetailRow[] = [];
  for (const book of books) {
    for (const asset of picked) {
      const view = viewAssetForBook(asset, book);
      const tfp = view.taxFactPattern;
      const cost = r2(view.cost);
      const bonusPct = Number(tfp?.bonusPct) || 0;

      const base = {
        book,
        ruleSource: view.ruleSource ?? '',
        ruleName: view.ruleName ?? '',
        assetNumber: view.assetNumber,
        description: view.description ?? '',
        assetClass: view.assetClass ?? '',
        company: view.company ?? '',
        costCenter: view.costCenter ?? '',
        location: view.location ?? '',
        project: view.project ?? '',
        status: view.status ?? '',
        placedInService: toISODate(tfp?.placedInService) ?? '',
        bookedPeriod: toISODate(tfp?.bookedPeriod) ?? '',
        recoveryPeriod: tfp?.recoveryPeriod ?? '',
        method: tfp?.method ?? view.method ?? '',
        convention: tfp?.convention ?? '',
        propertyType: tfp?.propertyType ?? '',
        bonusPct,
        bonusAmount: r2((cost * bonusPct) / 100),
        annualRate: r2(tfp?.annualRate),
        cost,
        accumDepreciation: r2(view.accumDepreciation),
        nbv: r2(view.nbv),
        disposalDate: view.disposal?.disposalDate ?? '',
        adAtDisposal: view.disposal ? r2(view.disposal.adAtDisposal) : ('' as const),
        gainLoss: view.disposal ? r2(view.disposal.gainLoss) : ('' as const)
      };

      const schedule: DepreciationScheduleRow[] = withBonusAndRevision(view, scheduleForBook(asset, book));
      if (schedule.length === 0) {
        out.push({
          ...base,
          year: '', yearEndDate: '', openingNbv: '', rate: '', bonus: '', cyRevisionAbsorbed: '',
          pyRevisionAbsorbed: '', pyBonusRevisionAbsorbed: '', depreciation: '', yearEndAccumDepreciation: '', closingNbv: ''
        });
        continue;
      }

      for (const row of schedule) {
        const y = String(row.year).match(/\d{4}/)?.[0] ?? String(row.year);
        out.push({
          ...base,
          year: String(row.year),
          yearEndDate: /^\d{4}$/.test(y) ? `${y}-12-31` : '',
          openingNbv: r2(row.openingNbv),
          rate: r2(row.rate),
          bonus: r2(row.bonus),
          cyRevisionAbsorbed: r2(row.cyRevisionAbsorbed ?? row.revisionAbsorbed),
          pyRevisionAbsorbed: r2(row.pyRevisionAbsorbed),
          pyBonusRevisionAbsorbed: r2((row as { pyBonusRevisionAbsorbed?: number }).pyBonusRevisionAbsorbed),
          depreciation: r2(row.depreciation),
          yearEndAccumDepreciation: r2(row.accumDepreciation),
          closingNbv: r2(row.closingNbv)
        });
      }
    }
  }
  return out;
}

// ======================================================
// END OF FILE : report-detail.ts
// ======================================================
