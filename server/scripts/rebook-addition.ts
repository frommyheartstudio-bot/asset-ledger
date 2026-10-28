// ======================================================
// File Name : rebook-addition.ts
// Purpose   : One-off fix for an Addition that was posted BEFORE the "booked period" fix.
//             Tells the asset which accounting period it was booked in, then rebuilds its
//             schedule so the closed prior years are empty and the whole catch-up
//             (bonus + missed regular) sits in the booked month.
// Run with  : npx tsx --env-file=.env scripts/rebook-addition.ts <assetNumber> <accountingPeriodDate YYYY-MM-DD>
// Example   : npx tsx --env-file=.env scripts/rebook-addition.ts 77777779 2026-09-23
// ======================================================

import { pool } from '../src/db/postgres.js';
import { initRateTables } from '../src/services/rateTables.js';
import { assets, bookEntries, depreciationSchedules, findAsset, initStore, persistNow } from '../src/data/assets.js';
import { buildSchedule } from '../src/services/schedule-builder.js';
import { syncBookEntries } from '../src/services/book-view.js';

async function main(): Promise<void> {
  const [assetNumber, booked] = process.argv.slice(2);
  if (!assetNumber || !/^\d{4}-\d{2}-\d{2}$/.test(booked ?? '')) {
    console.error('Usage: rebook-addition.ts <assetNumber> <accountingPeriodDate YYYY-MM-DD>');
    process.exit(1);
  }
  await initRateTables();
  await initStore();

  const asset = findAsset(assetNumber);
  if (!asset?.taxFactPattern) throw new Error(`Asset ${assetNumber} not found (or has no fact pattern)`);

  asset.taxFactPattern.bookedPeriod = booked;
  const rows = buildSchedule(asset);
  if (rows.length === 0) throw new Error('Could not build a schedule for this asset');
  depreciationSchedules[assetNumber] = rows;
  syncBookEntries([asset]);
  await persistNow();

  console.log(`Rebooked ${assetNumber} in ${booked}:`);
  console.table(rows.slice(0, 3));
  void assets; void bookEntries;
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
