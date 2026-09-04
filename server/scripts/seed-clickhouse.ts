// ======================================================
// File Name : seed-clickhouse.ts
// Purpose   : One-time / repeatable load of the EXISTING
//             in-memory seed data (server/src/data/*.ts —
//             completely untouched) into ClickHouse tables
//             created by db/schema.sql.
// Run with  : npx tsx scripts/seed-clickhouse.ts
//             (run from inside server/)
// ======================================================

import { ch } from '../src/db/clickhouse.js';
import { assets } from '../src/data/assets.js';
import { roles, users, reportCatalog, generatedReports } from '../src/data/admin.js';
import { recentActivity, dashboardSummary, forecast } from '../src/data/activity.js';

async function seedAssets() {
  const rows = assets.map((a) => ({
    assetNumber: a.assetNumber,
    description: a.description,
    assetClass: a.assetClass,
    company: a.company,
    costCenter: a.costCenter ?? null,
    location: a.location ?? null,
    project: a.project ?? null,
    cost: a.cost,
    accumDepreciation: a.accumDepreciation,
    nbv: a.nbv,
    method: a.method,
    status: a.status,
    tfp_placedInService: a.taxFactPattern?.placedInService ?? null,
    tfp_recoveryPeriod: a.taxFactPattern?.recoveryPeriod ?? null,
    tfp_method: a.taxFactPattern?.method ?? null,
    tfp_convention: a.taxFactPattern?.convention ?? null,
    tfp_bonusPct: a.taxFactPattern?.bonusPct ?? null,
    tfp_annualRate: a.taxFactPattern?.annualRate ?? null,
    tfp_propertyType: a.taxFactPattern?.propertyType ?? null,
    disp_disposalDate: a.disposal?.disposalDate ?? null,
    disp_adAtDisposal: a.disposal?.adAtDisposal ?? null,
    disp_gainLoss: a.disposal?.gainLoss ?? null,
  }));
  await ch.insert({ table: 'assets', values: rows, format: 'JSONEachRow' });
  console.log(`assets: inserted ${rows.length} rows`);
}

async function seedActivity() {
  const rows = recentActivity.map((r) => ({
    assetNumber: r.assetNumber,
    description: r.description,
    event: r.event,
    amount: r.amount,
    eventDate: r.date,
    status: r.status,
  }));
  await ch.insert({ table: 'lifecycle_activity', values: rows, format: 'JSONEachRow' });
  console.log(`lifecycle_activity: inserted ${rows.length} rows`);
}

async function seedRoles() {
  const rows = roles.map((r) => ({
    name: r.name,
    userCount: r.userCount,
    access: r.access,
    permissions: JSON.stringify(r.permissions),
  }));
  await ch.insert({ table: 'roles', values: rows, format: 'JSONEachRow' });
  console.log(`roles: inserted ${rows.length} rows`);
}

async function seedUsers() {
  await ch.insert({ table: 'users', values: users, format: 'JSONEachRow' });
  console.log(`users: inserted ${users.length} rows`);
}

async function seedReportCatalog() {
  await ch.insert({ table: 'report_catalog', values: reportCatalog, format: 'JSONEachRow' });
  console.log(`report_catalog: inserted ${reportCatalog.length} rows`);
}

async function seedGeneratedReports() {
  const rows = generatedReports.map((r) => ({
    name: r.name,
    book: r.book,
    period: r.period,
    generatedBy: r.generatedBy,
    reportDate: r.date,
    format: r.format,
    status: r.status,
  }));
  await ch.insert({ table: 'generated_reports', values: rows, format: 'JSONEachRow' });
  console.log(`generated_reports: inserted ${rows.length} rows`);
}

async function seedDashboardSummary() {
  await ch.insert({
    table: 'dashboard_summary',
    values: [{
      totalAssets: dashboardSummary.totalAssets,
      addedThisPeriod: dashboardSummary.addedThisPeriod,
      grossCost: dashboardSummary.grossCost,
      grossCostYtdDeltaPct: dashboardSummary.grossCostYtdDeltaPct,
      netBookValue: dashboardSummary.netBookValue,
      depreciationDeltaPct: dashboardSummary.depreciationDeltaPct,
      ytdDepreciation: dashboardSummary.ytdDepreciation,
      monthlyDepreciationJson: JSON.stringify(dashboardSummary.monthlyDepreciation),
      assetsByClassJson: JSON.stringify(dashboardSummary.assetsByClass),
    }],
    format: 'JSONEachRow',
  });
  console.log('dashboard_summary: inserted 1 snapshot row');
}

async function seedForecast() {
  await ch.insert({
    table: 'forecast_snapshot',
    values: [{
      kpisJson: JSON.stringify(forecast.kpis),
      expenseByYearJson: JSON.stringify(forecast.expenseByYear),
      rollForwardJson: JSON.stringify(forecast.rollForward),
    }],
    format: 'JSONEachRow',
  });
  console.log('forecast_snapshot: inserted 1 snapshot row');
}

async function main() {
  await seedAssets();
  await seedActivity();
  await seedRoles();
  await seedUsers();
  await seedReportCatalog();
  await seedGeneratedReports();
  await seedDashboardSummary();
  await seedForecast();
  await ch.close();
  console.log('Done.');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
