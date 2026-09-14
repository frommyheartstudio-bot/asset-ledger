// ======================================================
// File Name : clickhouse.ts
// Purpose   : Single shared ClickHouse client for the server.
//             Import { ch } from './db/clickhouse.js' anywhere
//             you need to run a query. Does NOT touch any
//             existing routes/data files — purely additive.
// ======================================================

import { createClient } from '@clickhouse/client';

export const ch = createClient({
  url: process.env.CLICKHOUSE_URL || 'http://localhost:8123',
  username: process.env.CLICKHOUSE_USER || 'default',
  password: process.env.CLICKHOUSE_PASSWORD || '',
  database: process.env.CLICKHOUSE_DB || 'asset_ledger',
});

// Quick connectivity check — call this once at server boot if you
// want an early, clear error instead of a failure on first query.
export async function pingClickHouse(): Promise<boolean> {
  try {
    const result = await ch.ping();
    return result.success;
  } catch {
    return false;
  }
}
