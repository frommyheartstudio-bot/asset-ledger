// ======================================================
// File Name : admin.ts
// Purpose   : In-memory data store / accessors for admin
// ======================================================

import type { GeneratedReport, ReportDefinition, Role, User } from '../types.js';


// ======================================================
// START: Data Functions
// ======================================================

export const roles: Role[] = [
  {
    name: 'Administrator',
    userCount: 5,
    access: 'Full access · user & config management',
    permissions: { viewAssets: true, postEvents: true, approvePost: true, runReports: true, manageUsers: true, editConfig: true }
  },
  {
    name: 'Tax Analyst',
    userCount: 18,
    access: 'Post events · run calcs · reporting',
    permissions: { viewAssets: true, postEvents: true, approvePost: false, runReports: true, manageUsers: false, editConfig: false }
  },
  {
    name: 'Reviewer',
    userCount: 14,
    access: 'Approve transactions · view all',
    permissions: { viewAssets: true, postEvents: false, approvePost: true, runReports: true, manageUsers: false, editConfig: false }
  },
  {
    name: 'Read-Only',
    userCount: 10,
    access: 'View assets & reports only',
    permissions: { viewAssets: true, postEvents: false, approvePost: false, runReports: true, manageUsers: false, editConfig: false }
  }
];

export const users: User[] = [
  { id: 'u1', name: 'Balaji A.', email: 'balaji.a@company.com', role: 'Administrator', lastActive: 'Just now', status: 'Active' },
  { id: 'u2', name: 'Jordan S.', email: 'jordan.s@company.com', role: 'Tax Analyst', lastActive: '2 hours ago', status: 'Active' },
  { id: 'u3', name: 'Maria R.', email: 'maria.r@company.com', role: 'Reviewer', lastActive: 'Yesterday', status: 'Active' },
  { id: 'u4', name: 'Tom P.', email: 'tom.p@company.com', role: 'Read-Only', lastActive: '3 days ago', status: 'Invited' }
];

export const reportCatalog: ReportDefinition[] = [
  { key: 'depreciation-detail', name: 'Depreciation Detail', description: 'Per-asset depreciation by book and period' },
  { key: 'roll-forward', name: 'Roll-Forward', description: 'Cost & accum. depreciation continuity' },
  { key: 'form-4562', name: 'Tax Form 4562', description: 'Depreciation & amortization filing' },
  { key: 'disposal-gain-loss', name: 'Disposal Gain/Loss', description: 'Realized gains and losses on retirements' },
  { key: 'reconciliation', name: 'Reconciliation', description: 'TC vs DDV field-by-field comparison' },
  { key: 'exceptions', name: 'Exceptions', description: 'Assets failing validation or tolerance' }
];

export const generatedReports: GeneratedReport[] = [
  { name: 'Depreciation Detail — Q1', book: 'Federal Tax', period: '2026 Q1', generatedBy: 'Balaji A.', date: '2026-04-22', format: 'XLSX', status: 'Ready' },
  { name: 'Roll-Forward Summary', book: 'GAAP', period: 'APR-26', generatedBy: 'System', date: '2026-04-21', format: 'PDF', status: 'Ready' },
  { name: 'Reconciliation — APR', book: 'Federal Tax', period: 'APR-26', generatedBy: 'Balaji A.', date: '2026-04-21', format: 'CSV', status: 'Ready' },
  { name: 'Tax Form 4562 Draft', book: 'Federal Tax', period: 'FY2026', generatedBy: 'Balaji A.', date: '2026-04-18', format: 'PDF', status: 'Draft' },
  { name: 'Exceptions — Failed Assets', book: 'Federal Tax', period: 'APR-26', generatedBy: 'System', date: '2026-04-17', format: 'CSV', status: 'Processing' }
];

// ======================================================
// END: Data Functions
// ======================================================

