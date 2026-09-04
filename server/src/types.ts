// ======================================================
// File Name : types.ts
// Purpose   : Implements types
// ======================================================


// ======================================================
// START: types Functions
// ======================================================

export type AssetStatus = 'Active' | 'Retired' | 'Transferred' | 'Fully Depreciated' | 'Under Review';

export interface Asset {
  assetNumber: string;
  description: string;
  assetClass: string;
  company: string;
  costCenter?: string;
  location?: string;
  project?: string;
  cost: number;
  accumDepreciation: number;
  nbv: number;
  method: string;
  status: AssetStatus;
  taxFactPattern?: {
    placedInService: string;
    recoveryPeriod: string;
    method: string;
    convention: string;
    bonusPct: number;
    annualRate: number;
    propertyType: string;
  };
  /** Snapshot recorded at retirement — only present when status is
   *  'Retired'. Feeds the Lifecycle Events → Reinstatement card's
   *  "Load Asset" picker so it can pre-fill the original disposal facts
   *  instead of leaving generic placeholder values in the form. */
  disposal?: {
    disposalDate: string;
    adAtDisposal: number;
    gainLoss: number;
  };
}

export type LifecycleEventType =
  | 'Addition'
  | 'Adjustment'
  | 'Transfer'
  | 'Retirement'
  | 'Reinstatement'
  | 'Reclassification';

export interface LifecycleActivity {
  assetNumber: string;
  description: string;
  event: LifecycleEventType | 'Transfer In';
  amount: number;
  date: string;
  status: 'Posted' | 'Processing' | 'Pending';
}

export interface TimelineEntry {
  date: string;
  title: string;
  description: string;
  done: boolean;
}

export interface DepreciationScheduleRow {
  year: string;
  openingNbv: number;
  rate: number;
  depreciation: number;
  accumDepreciation: number;
  closingNbv: number;
}

/**
 * Each of the 6 lifecycle event cards (Addition, Adjustment, Transfer,
 * Retirement, Reinstatement, Reclassification) has its own box set — see
 * client/src/data/lifecycleFormSchemas.js, ported from the standalone
 * reference calculators. `fields` carries whatever that card's form
 * collected (already coerced to string/number/boolean on the client).
 */
export interface LifecyclePreviewInput {
  eventType: LifecycleEventType;
  assetNumber: string;
  fields: Record<string, string | number | boolean>;
}

export interface LifecyclePreviewResultRow {
  label: string;
  value: string;
  emphasize?: boolean;
}

export interface LifecyclePreviewSection {
  title: string;
  rows: LifecyclePreviewResultRow[];
}

export interface LifecyclePreviewResult {
  badgeText: string;
  badgeTone: 'green' | 'blue' | 'amber' | 'red';
  rows: LifecyclePreviewResultRow[];
  formulaNote: string;
  /** Full step-by-step calculation breakdown (Step 2 onward) — same
   *  formulas/values shown in the standalone reference calculators'
   *  "Results" panel (Htmls/pages/*.html displayResults). Rendered as
   *  collapsible sections under the summary table. */
  sections?: LifecyclePreviewSection[];
}

export interface ScenarioInput {
  label: string;
  method: 'MACRS ADS' | 'MACRS 200% DB' | 'Straight-Line';
  bonusPct: number;
  recoveryPeriodYears: number;
}

export interface Role {
  name: string;
  userCount: number;
  access: string;
  permissions: Record<string, boolean>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  lastActive: string;
  status: 'Active' | 'Invited';
}

export interface ReportDefinition {
  key: string;
  name: string;
  description: string;
}

export interface GeneratedReport {
  name: string;
  book: string;
  period: string;
  generatedBy: string;
  date: string;
  format: 'XLSX' | 'PDF' | 'CSV';
  status: 'Ready' | 'Draft' | 'Processing';
}

// ======================================================
// END: types Functions
// ======================================================

