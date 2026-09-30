// ======================================================
// File Name : seed-asset-classes.ts
// Purpose   : One-off load of the 131 asset class rows into the
//             asset_classes table (Neon/Postgres). Safe to re-run —
//             does nothing if the table already has rows.
// Run with  : npm run db:seed:asset-classes
//             (run `npm run db:schema:apply` first so the table exists)
// ======================================================

import { pool } from '../src/db/postgres.js';
import { loadAssetClasses, seedAssetClassesIfEmpty } from '../src/db/repo.js';
import { ASSET_CLASS_SEED } from '../src/data/assetClasses.js';

// ======================================================
// START: Script Functions
// ======================================================

// ======================================================
// Function : main
// Purpose  : Seeds the asset_classes table from ASSET_CLASS_SEED (only when it is empty) and prints the result.
// ======================================================

async function main(): Promise<void> {
  const inserted = await seedAssetClassesIfEmpty(ASSET_CLASS_SEED);
  const rows = await loadAssetClasses();
  console.log(inserted ? `[seed] inserted ${ASSET_CLASS_SEED.length} rows` : '[seed] table already had data — skipped');
  console.log(`[seed] asset_classes now has ${rows.length} rows`);
  await pool.end();
}

main().catch((err) => {
  console.error('[seed] failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});

// ======================================================
// END: Script Functions
// ======================================================

// ======================================================
// END OF FILE : seed-asset-classes.ts
// ======================================================
