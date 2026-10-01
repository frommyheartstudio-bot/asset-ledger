// ======================================================
// File Name : repo.ts
// Purpose   : Postgres (Neon) read/write layer for the core book —
//             assets, lifecycle timelines, and depreciation schedules.
//
//             This is what makes Postgres the SOURCE OF TRUTH.
//             Before this, only the asset_transactions ledger went to
//             the database; the asset master itself lived in
//             server/data-store.json, so "the database" and "what the
//             UI shows" were two different things.
//
//             Shape of the deal:
//               • hydrate()  — boot-time load, Postgres -> memory
//               • flush()    — mutation-time save, memory -> Postgres
//             The in-memory arrays stay as the request-path working
//             set (reads are synchronous everywhere in the app), but
//             every mutation is written through to Postgres.
// ======================================================

import { pool } from './postgres.js';
import type { AssetClassSeedRow } from '../data/assetClasses.js';
import type { Asset, DepreciationScheduleRow, TimelineEntry } from '../types.js';

// ======================================================
// START: Repository Functions
// ======================================================

export interface CoreSnapshot {
  assets: Asset[];
  timelines: Record<string, TimelineEntry[]>;
  depreciationSchedules: Record<string, DepreciationScheduleRow[]>;
}

// ======================================================
// Function : query
// Purpose  : Thin parameterized SELECT helper.
// ======================================================

async function query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const result = await pool.query(sql, params);
  return result.rows as T[];
}

// ======================================================
// END: query
// ======================================================

// ======================================================
// Function : n
// Purpose  : Converts a value to a finite number (0 when it is not numeric).
// ======================================================

function n(v: unknown): number {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

// ======================================================
// Function : dateOnly
// Purpose  : Formats a Postgres DATE value as a plain YYYY-MM-DD string.
// ======================================================

// Postgres DATE columns come back from `pg` as JS Date objects (local
// midnight). String(date) gives "Sun Mar 15 2026 00:00:00 GMT+0530 …",
// which is hard to parse reliably; send a plain "YYYY-MM-DD" instead.
function dateOnly(v: unknown): string {
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    const mm = String(v.getMonth() + 1).padStart(2, '0');
    const dd = String(v.getDate()).padStart(2, '0');
    return `${v.getFullYear()}-${mm}-${dd}`;
  }
  return String(v ?? '');
}

// ======================================================
// Function : orUndef
// Purpose  : Returns undefined for null / empty values, otherwise the value as a string.
// ======================================================

function orUndef(v: unknown): string | undefined {
  return v === null || v === undefined || v === '' ? undefined : String(v);
}

// ======================================================
// Function : hydrate
// Purpose  : Loads the whole core book out of Postgres at boot.
//            Ordinary table reads — no FINAL needed, Postgres rows
//            are already the current version.
// Output   : CoreSnapshot
// ======================================================

export async function hydrate(): Promise<CoreSnapshot> {
  const [assetRows, timelineRows, scheduleRows] = await Promise.all([
    query<Record<string, unknown>>(`SELECT * FROM assets ORDER BY "assetNumber"`),
    query<Record<string, unknown>>(`SELECT * FROM asset_timeline ORDER BY "assetNumber", seq`),
    query<Record<string, unknown>>(`SELECT * FROM asset_depreciation_schedule ORDER BY "assetNumber", seq`)
  ]);

  const assets: Asset[] = assetRows.map((r) => {
    const asset: Asset = {
      assetNumber: String(r.assetNumber),
      description: String(r.description ?? ''),
      assetClass: String(r.assetClass ?? ''),
      company: String(r.company ?? ''),
      costCenter: orUndef(r.costCenter),
      location: orUndef(r.location),
      project: orUndef(r.project),
      cost: n(r.cost),
      accumDepreciation: n(r.accumDepreciation),
      nbv: n(r.nbv),
      method: String(r.method ?? ''),
      status: String(r.status ?? 'Active') as Asset['status']
    };

    if (r.tfp_placedInService || r.tfp_method || r.tfp_recoveryPeriod) {
      asset.taxFactPattern = {
        placedInService: dateOnly(r.tfp_placedInService),
        recoveryPeriod: String(r.tfp_recoveryPeriod ?? ''),
        method: String(r.tfp_method ?? ''),
        convention: String(r.tfp_convention ?? ''),
        bonusPct: n(r.tfp_bonusPct),
        annualRate: n(r.tfp_annualRate),
        propertyType: String(r.tfp_propertyType ?? '')
      };
    }

    if (r.disp_disposalDate) {
      asset.disposal = {
        disposalDate: dateOnly(r.disp_disposalDate),
        adAtDisposal: n(r.disp_adAtDisposal),
        gainLoss: n(r.disp_gainLoss)
      };
    }

    return asset;
  });

  const timelines: Record<string, TimelineEntry[]> = {};
  for (const r of timelineRows) {
    const key = String(r.assetNumber);
    (timelines[key] ??= []).push({
      date: String(r.entryDate ?? ''),
      title: String(r.title ?? ''),
      description: String(r.description ?? ''),
      done: n(r.done) === 1
    });
  }

  const depreciationSchedules: Record<string, DepreciationScheduleRow[]> = {};
  for (const r of scheduleRows) {
    const key = String(r.assetNumber);
    (depreciationSchedules[key] ??= []).push({
      year: String(r.year ?? ''),
      openingNbv: n(r.openingNbv),
      rate: n(r.rate),
      depreciation: n(r.depreciation),
      accumDepreciation: n(r.accumDepreciation),
      closingNbv: n(r.closingNbv)
    });
  }

  return { assets, timelines, depreciationSchedules };
}

// ======================================================
// END: hydrate
// ======================================================

// ======================================================
// Function : toDateOrNull
// Purpose  : The store still carries dates in mixed shapes ('' included),
//            and a Postgres date/text column shouldn't get '' written to
//            it. Normalize here and write NULL when there is genuinely
//            no date, instead of failing the whole insert.
// ======================================================

function toDateOrNull(raw: unknown): string | null {
  if (!raw) return null;
  const s = String(raw).trim();
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const slash = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (slash) return `${slash[3]}-${slash[1].padStart(2, '0')}-${slash[2].padStart(2, '0')}`;
  const d = new Date(s);
  if (!Number.isNaN(d.getTime()) && d.getFullYear() > 1900 && d.getFullYear() < 2200) {
    return d.toISOString().slice(0, 10);
  }
  return null;
}

// ======================================================
// END: toDateOrNull
// ======================================================

// ======================================================
// Function : flush
// Purpose  : Writes the current in-memory book back to Postgres.
//            `assets` is upserted (INSERT ... ON CONFLICT (assetNumber)
//            DO UPDATE) — same role the ReplacingMergeTree engine played
//            in ClickHouse, but explicit here. Timeline and schedule
//            rows are delete-then-insert per asset, so a list that
//            shrinks doesn't leave orphaned rows behind. Runs inside a
//            transaction so a flush is all-or-nothing.
// Input    : snapshot (the live assets/timelines/schedules)
// ======================================================

export async function flush(snapshot: CoreSnapshot): Promise<void> {
  const { assets, timelines, depreciationSchedules } = snapshot;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (assets.length > 0) {
      for (const a of assets) {
        await client.query(
          `INSERT INTO assets (
             "assetNumber", description, "assetClass", company, "costCenter", location, project,
             cost, "accumDepreciation", nbv, method, status,
             "tfp_placedInService", "tfp_recoveryPeriod", "tfp_method", "tfp_convention", "tfp_bonusPct", "tfp_annualRate", "tfp_propertyType",
             "disp_disposalDate", "disp_adAtDisposal", "disp_gainLoss", "updatedAt"
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22, now())
           ON CONFLICT ("assetNumber") DO UPDATE SET
             description = EXCLUDED.description,
             "assetClass" = EXCLUDED."assetClass",
             company = EXCLUDED.company,
             "costCenter" = EXCLUDED."costCenter",
             location = EXCLUDED.location,
             project = EXCLUDED.project,
             cost = EXCLUDED.cost,
             "accumDepreciation" = EXCLUDED."accumDepreciation",
             nbv = EXCLUDED.nbv,
             method = EXCLUDED.method,
             status = EXCLUDED.status,
             "tfp_placedInService" = EXCLUDED."tfp_placedInService",
             "tfp_recoveryPeriod" = EXCLUDED."tfp_recoveryPeriod",
             "tfp_method" = EXCLUDED."tfp_method",
             "tfp_convention" = EXCLUDED."tfp_convention",
             "tfp_bonusPct" = EXCLUDED."tfp_bonusPct",
             "tfp_annualRate" = EXCLUDED."tfp_annualRate",
             "tfp_propertyType" = EXCLUDED."tfp_propertyType",
             "disp_disposalDate" = EXCLUDED."disp_disposalDate",
             "disp_adAtDisposal" = EXCLUDED."disp_adAtDisposal",
             "disp_gainLoss" = EXCLUDED."disp_gainLoss",
             "updatedAt" = now()`,
          [
            a.assetNumber,
            a.description,
            a.assetClass,
            a.company,
            a.costCenter ?? null,
            a.location ?? null,
            a.project ?? null,
            a.cost,
            a.accumDepreciation,
            a.nbv,
            a.method,
            a.status,
            toDateOrNull(a.taxFactPattern?.placedInService),
            a.taxFactPattern?.recoveryPeriod ?? null,
            a.taxFactPattern?.method ?? null,
            a.taxFactPattern?.convention ?? null,
            a.taxFactPattern?.bonusPct ?? null,
            a.taxFactPattern?.annualRate ?? null,
            a.taxFactPattern?.propertyType ?? null,
            toDateOrNull(a.disposal?.disposalDate),
            a.disposal?.adAtDisposal ?? null,
            a.disposal?.gainLoss ?? null
          ]
        );
      }
    }

    // Clear then re-insert, so shrinking lists don't leave stale rows.
    const touched = [...new Set([...Object.keys(timelines), ...Object.keys(depreciationSchedules)])];
    if (touched.length > 0) {
      await client.query(`DELETE FROM asset_timeline WHERE "assetNumber" = ANY($1::text[])`, [touched]);
      await client.query(`DELETE FROM asset_depreciation_schedule WHERE "assetNumber" = ANY($1::text[])`, [touched]);
    }

    for (const [assetNumber, entries] of Object.entries(timelines)) {
      for (const [seq, e] of entries.entries()) {
        await client.query(
          `INSERT INTO asset_timeline ("assetNumber", seq, "entryDate", title, description, done, "updatedAt")
           VALUES ($1,$2,$3,$4,$5,$6, now())`,
          [assetNumber, seq, e.date, e.title, e.description, e.done ? 1 : 0]
        );
      }
    }

    for (const [assetNumber, rows] of Object.entries(depreciationSchedules)) {
      for (const [seq, r] of rows.entries()) {
        await client.query(
          `INSERT INTO asset_depreciation_schedule
             ("assetNumber", seq, year, "fiscalYear", "openingNbv", rate, depreciation, "accumDepreciation", "closingNbv", "updatedAt")
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, now())`,
          [
            assetNumber,
            seq,
            r.year,
            Number(r.year.match(/(\d{4})/)?.[1] ?? 0),
            r.openingNbv,
            r.rate,
            r.depreciation,
            r.accumDepreciation,
            r.closingNbv
          ]
        );
      }
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ======================================================
// END: flush
// ======================================================

// ======================================================
// Function : queueFlush
// Purpose  : persist() is called synchronously from ~8 places in the
//            request path (applyLifecycleEvent, POST /assets, bulk
//            import, ...). Rather than making all of them async — and
//            risking two overlapping writes racing each other — every
//            call collapses into a single serialized write-behind: one
//            flush in flight at a time, and at most one more queued.
//            The caller returns immediately; the write still happens.
// ======================================================

let inFlight: Promise<void> | null = null;
let pending = false;
let snapshotSource: (() => CoreSnapshot) | null = null;

// ======================================================
// Function : registerSnapshotSource
// Purpose  : Registers the function that supplies the current in-memory snapshot to be flushed to Postgres.
// ======================================================

export function registerSnapshotSource(fn: () => CoreSnapshot): void {
  snapshotSource = fn;
}

export function queueFlush(): void {
  if (!snapshotSource) return;
  pending = true;
  if (inFlight) return;

  const run = async (): Promise<void> => {
    while (pending) {
      pending = false;
      try {
        await flush(snapshotSource!());
      } catch (err) {
        console.error('[postgres] flush failed — retrying on next mutation:', err);
        break;
      }
    }
    inFlight = null;
  };

  inFlight = run();
}

// ======================================================
// Function : flushNow
// Purpose  : Awaitable flush, for shutdown and for the migration
//            script where "fire and forget" isn't good enough.
// ======================================================

export async function flushNow(): Promise<void> {
  if (inFlight) await inFlight;
  if (snapshotSource) await flush(snapshotSource());
}

// ======================================================
// END: queueFlush
// ======================================================

// ======================================================
// Function : loadAdmin
// Purpose  : Users / roles / report catalog / generated reports, read
//            from Postgres instead of the hardcoded arrays in
//            data/admin.ts. Those arrays now act as a bootstrap seed
//            only (see seedAdminIfEmpty below), so the Administration
//            and Reporting pages are reading real table data.
// ======================================================

export async function loadAdmin() {
  const [roles, users, reportCatalog, generatedReports] = await Promise.all([
    query<Record<string, unknown>>(`SELECT * FROM roles ORDER BY name`),
    query<Record<string, unknown>>(`SELECT * FROM users ORDER BY id`),
    query<Record<string, unknown>>(`SELECT * FROM report_catalog ORDER BY key`),
    query<Record<string, unknown>>(`SELECT * FROM generated_reports ORDER BY "reportDate" DESC, name`)
  ]);

  const mappedUsers = users.map(toUserView);

  return {
    // userCount is derived from the real users table below rather than a
    // separately-stored counter — that counter was seeded with arbitrary
    // placeholder numbers and only ever nudged by ±1 on create/delete, so
    // it drifted from what the Users list actually showed (e.g. staying
    // at "5 Administrators" after a delete+invite round-trip). Counting
    // the live rows means Roles & Permissions always matches Users.
    roles: roles.map((r) => ({
      name: String(r.name),
      userCount: mappedUsers.filter((u) => u.role === String(r.name)).length,
      access: String(r.access ?? ''),
      permissions: safeJson(r.permissions)
    })),
    users: mappedUsers,
    reportCatalog: reportCatalog.map((r) => ({
      key: String(r.key),
      name: String(r.name ?? ''),
      description: String(r.description ?? '')
    })),
    generatedReports: generatedReports.map((r) => ({
      name: String(r.name ?? ''),
      book: String(r.book ?? ''),
      period: String(r.period ?? ''),
      generatedBy: String(r.generatedBy ?? ''),
      date: String(r.reportDate ?? ''),
      format: String(r.format ?? ''),
      status: String(r.status ?? ''),
      csvContent: String(r.csvContent ?? '')
    }))
  };
}

// ======================================================
// Function : toUserView
// Purpose  : Maps a raw users row to the shape sent to the client. The
//            password is intentionally omitted (write-only, never sent).
// ======================================================

function toUserView(u: Record<string, unknown>): Record<string, unknown> {
  return {
    id: String(u.id),
    name: String(u.name ?? ''),
    email: String(u.email ?? ''),
    role: String(u.role ?? ''),
    lastActive: String(u.lastActive ?? ''),
    status: String(u.status ?? ''),
    menuAccess: safeJson(u.menuAccess)
  };
}

// ======================================================
// Function : safeJson
// Purpose  : Parses a JSON string into a menuAccess object; returns {} when it is malformed.
// ======================================================

function safeJson(raw: unknown): Record<string, boolean> {
  try {
    return JSON.parse(String(raw ?? '{}'));
  } catch {
    return {};
  }
}

// ======================================================
// END: loadAdmin
// ======================================================

// ======================================================
// Function : seedAdminIfEmpty
// Purpose  : First-run bootstrap for the admin tables, so a fresh
//            Postgres database isn't an empty Administration page.
// ======================================================

export async function seedAdminIfEmpty(seed: {
  roles: Array<{ name: string; userCount: number; access: string; permissions: Record<string, boolean> }>;
  users: Array<Record<string, unknown>>;
  reportCatalog: Array<Record<string, unknown>>;
  generatedReports: Array<Record<string, unknown>>;
}): Promise<boolean> {
  const [{ c }] = await query<{ c: string }>(`SELECT count(*) AS c FROM users`);
  if (Number(c) > 0) return false;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const r of seed.roles) {
      await client.query(
        `INSERT INTO roles (name, "userCount", access, permissions) VALUES ($1,$2,$3,$4)
         ON CONFLICT (name) DO UPDATE SET "userCount" = EXCLUDED."userCount", access = EXCLUDED.access, permissions = EXCLUDED.permissions`,
        [r.name, r.userCount, r.access, JSON.stringify(r.permissions)]
      );
    }

    for (const u of seed.users as Array<Record<string, unknown>>) {
      await client.query(
        `INSERT INTO users (id, name, email, role, "lastActive", status, password, "menuAccess")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (id) DO NOTHING`,
        [
          u.id, u.name, u.email, u.role, u.lastActive, u.status,
          (u.password as string | undefined) ?? '',
          JSON.stringify(u.menuAccess ?? {})
        ]
      );
    }

    for (const r of seed.reportCatalog as Array<Record<string, unknown>>) {
      await client.query(
        `INSERT INTO report_catalog (key, name, description) VALUES ($1,$2,$3)
         ON CONFLICT (key) DO NOTHING`,
        [r.key, r.name, r.description]
      );
    }

    for (const r of seed.generatedReports as Array<Record<string, unknown>>) {
      await client.query(
        `INSERT INTO generated_reports (name, book, period, "generatedBy", "reportDate", format, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [r.name, r.book, r.period, r.generatedBy, r.date, r.format, r.status]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  return true;
}

// ======================================================
// END: seedAdminIfEmpty
// ======================================================

// ======================================================
// Function : loadAssetClasses / seedAssetClassesIfEmpty
// Purpose  : Configuration -> Asset Classes page. Same first-run
//            bootstrap shape as seedAdminIfEmpty above: seeds the
//            asset_classes table from the array in
//            data/assetClasses.ts exactly once (only when the table
//            is empty), then every read afterward comes straight out
//            of Postgres — Postgres is the source of truth from then
//            on, same as the asset book itself.
// ======================================================

// `id` is the row's sortOrder (primary key) - lets the UI delete a default row.
export type AssetClassRow = AssetClassSeedRow & { id?: number };

// Creates the table on first use, so the page works even if nobody ran
// `npm run db:schema:apply` yet (same DDL as db/schema.sql). Runs once.
let assetClassesTableReady: Promise<void> | null = null;
// ======================================================
// Function : ensureAssetClassesTable
// Purpose  : Creates the asset_classes table on first use (runs once).
// ======================================================

function ensureAssetClassesTable(): Promise<void> {
  if (!assetClassesTableReady) {
    assetClassesTableReady = pool.query(
      `CREATE TABLE IF NOT EXISTS asset_classes (
         "sortOrder"     INTEGER PRIMARY KEY,
         name            TEXT NOT NULL,
         "propertyType"  TEXT NOT NULL,
         method          TEXT NOT NULL,
         "ratePct"       TEXT NOT NULL,
         convention      TEXT NOT NULL,
         life            TEXT NOT NULL
       )`
    ).then(async () => {
      // Bonus % column (added later). When the column is new, rows named "... No Bonus" get 0
      // so they fill 0 into the Addition form; every other row stays blank until edited.
      const had = await query<Record<string, unknown>>(`SELECT 1 FROM information_schema.columns WHERE table_name='asset_classes' AND column_name='bonusPct'`);
      await pool.query(`ALTER TABLE asset_classes ADD COLUMN IF NOT EXISTS "bonusPct" TEXT NOT NULL DEFAULT ''`);
      if (!had.length) await pool.query(`UPDATE asset_classes SET "bonusPct"='0' WHERE name ILIKE '%No Bonus%'`);
      // One-time repair: the seed once lost the leading zero on the 00.xx classes
      // ("0.11", "0.12", "0.241" ... instead of "00.11", "00.12", "00.241").
      // Add the missing zero (only when the "00." name isn't already taken); harmless when already fixed.
      await pool.query(
        `UPDATE asset_classes a SET name='0' || a.name
          WHERE a.name ~ '^0\\.[0-9]+$'
            AND NOT EXISTS (SELECT 1 FROM asset_classes b WHERE b.name='0' || a.name)`
      );
      // Keep anything that already refers to an old name in step (tables may not exist yet - ignore).
      await pool.query(`UPDATE assets SET "assetClass"='0' || "assetClass" WHERE "assetClass" ~ '^0\\.[0-9]+$'`).catch(() => undefined);
      await pool.query(`UPDATE asset_class_custom_table SET "assetType"='0' || "assetType" WHERE "assetType" ~ '^0\\.[0-9]+$'`).catch(() => undefined);
    }).catch((err) => { assetClassesTableReady = null; throw err; });
  }
  return assetClassesTableReady;
}

// ======================================================
// Function : loadAssetClasses
// Purpose  : Reads every asset class row from Postgres in sort order.
// ======================================================

export async function loadAssetClasses(): Promise<AssetClassRow[]> {
  await ensureAssetClassesTable();
  const rows = await query<Record<string, unknown>>(
    `SELECT * FROM asset_classes ORDER BY "sortOrder" ASC`
  );
  return rows.map((r) => ({
    id: Number(r.sortOrder),
    name: String(r.name ?? ''),
    propertyType: String(r.propertyType ?? ''),
    method: String(r.method ?? ''),
    ratePct: String(r.ratePct ?? ''),
    convention: String(r.convention ?? ''),
    life: String(r.life ?? ''),
    bonusPct: String(r.bonusPct ?? '')
  }));
}

// ======================================================
// Function : deleteAssetClass
// Purpose  : Deletes one default asset class row (by its sortOrder id); false when it doesn't exist.
// ======================================================

export async function deleteAssetClass(id: number): Promise<boolean> {
  await ensureAssetClassesTable();
  const rows = await query<Record<string, unknown>>(`DELETE FROM asset_classes WHERE "sortOrder"=$1 RETURNING "sortOrder"`, [id]);
  return rows.length > 0;
}

// ======================================================
// Function : updateAssetClass
// Purpose  : Edits one Default Table row (by its sortOrder id) and returns the
//            saved row (null when it doesn't exist). When the Name is changed,
//            assets and Customize Table rules that used the old name follow it.
// ======================================================

export async function updateAssetClass(id: number, f: Omit<AssetClassRow, 'id'>): Promise<AssetClassRow | null> {
  await ensureAssetClassesTable();
  const old = await query<Record<string, unknown>>(`SELECT name FROM asset_classes WHERE "sortOrder"=$1`, [id]);
  if (!old.length) return null;
  const oldName = String(old[0].name ?? '');
  const rows = await query<Record<string, unknown>>(
    `UPDATE asset_classes
        SET name=$2, "propertyType"=$3, method=$4, "ratePct"=$5, convention=$6, life=$7, "bonusPct"=$8
      WHERE "sortOrder"=$1
      RETURNING *`,
    [id, f.name, f.propertyType, f.method, f.ratePct, f.convention, f.life, f.bonusPct ?? '']
  );
  if (oldName !== f.name) {
    await pool.query(`UPDATE assets SET "assetClass"=$2 WHERE "assetClass"=$1`, [oldName, f.name]).catch(() => undefined);
    await pool.query(`UPDATE asset_class_custom_table SET "assetType"=$2 WHERE "assetType"=$1`, [oldName, f.name]).catch(() => undefined);
  }
  const r = rows[0];
  return {
    id: Number(r.sortOrder),
    name: String(r.name ?? ''),
    propertyType: String(r.propertyType ?? ''),
    method: String(r.method ?? ''),
    ratePct: String(r.ratePct ?? ''),
    convention: String(r.convention ?? ''),
    life: String(r.life ?? ''),
    bonusPct: String(r.bonusPct ?? '')
  };
}

// ======================================================
// Function : seedAssetClassesIfEmpty
// Purpose  : Inserts the seed rows only when the asset_classes table is empty; returns whether it inserted.
// ======================================================

export async function seedAssetClassesIfEmpty(seed: AssetClassRow[]): Promise<boolean> {
  await ensureAssetClassesTable();
  const [{ c }] = await query<{ c: string }>(`SELECT count(*) AS c FROM asset_classes`);
  if (Number(c) > 0) return false;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (let i = 0; i < seed.length; i++) {
      const r = seed[i];
      await client.query(
        `INSERT INTO asset_classes ("sortOrder", name, "propertyType", method, "ratePct", convention, life, "bonusPct")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT ("sortOrder") DO NOTHING`,
        [i, r.name, r.propertyType, r.method, r.ratePct, r.convention, r.life, r.bonusPct ?? (/no bonus/i.test(r.name) ? '0' : '')]
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
  return true;
}

// ======================================================
// END: loadAssetClasses / seedAssetClassesIfEmpty
// ======================================================

// ======================================================
// Function : Custom asset classes (Configuration -> Asset Classes ->
//            "Customize Table")
// Purpose  : User-added rules, same 6 columns as the default table (Name, Property
//            Type, Method, Rate %, Convention, Life). The Name is the Book
//            followed by the asset type, e.g. "GAAP - Acquisition"; the
//            two parts are stored separately so each can be edited.
//            Starts empty. The default asset_classes table is not touched
//            by edits here.
// ======================================================

export interface CustomAssetClassRow extends AssetClassRow {
  id: number;
  book: string;
  assetType: string;
}

// The 3 starter rows this table used to be seeded with. They are no longer
// wanted: the Customize Table starts empty (only the default rows show under
// the custom rules). They are deleted once from databases that already have them.
const LEGACY_STARTER_ROWS: Array<Omit<CustomAssetClassRow, 'id' | 'name'>> = [
  { book: 'GAAP', assetType: 'Acquisition', propertyType: 'PP - Personal Property', method: 'SL - Straight Line', ratePct: '100', convention: 'FM - Full-Month', life: '0 years 0 months' },
  { book: 'GAAP', assetType: 'Alternative Energy Property', propertyType: 'PP - Personal Property', method: 'SL - Straight Line', ratePct: '100', convention: 'FM - Full-Month', life: '10 years 0 months' },
  { book: 'GAAP', assetType: 'Alternative Energy Property - ADS', propertyType: 'PP - Personal Property', method: 'SL - Straight Line', ratePct: '100', convention: 'FM - Full-Month', life: '10 years 0 months' }
];

let customRowsTableReady: Promise<void> | null = null;
// ======================================================
// Function : ensureCustomRowsTable
// Purpose  : Creates the asset_class_custom_table on first use (runs once).
// ======================================================

function ensureCustomRowsTable(): Promise<void> {
  if (!customRowsTableReady) {
    customRowsTableReady = pool.query(
      `CREATE TABLE IF NOT EXISTS asset_class_custom_table (
         id              SERIAL PRIMARY KEY,
         book            TEXT NOT NULL,
         "assetType"     TEXT NOT NULL,
         "propertyType"  TEXT NOT NULL,
         method          TEXT NOT NULL,
         "ratePct"       TEXT NOT NULL,
         convention      TEXT NOT NULL,
         life            TEXT NOT NULL,
         "bonusPct"      TEXT NOT NULL DEFAULT ''
       )`
    ).then(() => pool.query(`ALTER TABLE asset_class_custom_table ADD COLUMN IF NOT EXISTS "bonusPct" TEXT NOT NULL DEFAULT ''`)).then(() => undefined).catch((err) => { customRowsTableReady = null; throw err; });
  }
  return customRowsTableReady;
}

// ======================================================
// Function : toCustomRow
// Purpose  : Maps a raw custom-table row to a CustomAssetClassRow (Name = asset type; Book is its own field).
// ======================================================

function toCustomRow(r: Record<string, unknown>): CustomAssetClassRow {
  const book = String(r.book ?? '');
  const assetType = String(r.assetType ?? '');
  return {
    id: Number(r.id),
    book,
    assetType,
    name: assetType, // Book is a separate field - it is not part of the Name
    propertyType: String(r.propertyType ?? ''),
    method: String(r.method ?? ''),
    ratePct: String(r.ratePct ?? ''),
    convention: String(r.convention ?? ''),
    life: String(r.life ?? ''),
    bonusPct: String(r.bonusPct ?? '')
  };
}

// ======================================================
// Function : loadCustomAssetClasses
// Purpose  : Reads the custom asset class rows (rules the user added). No starter rows are seeded.
// ======================================================

export async function loadCustomAssetClasses(): Promise<CustomAssetClassRow[]> {
  await ensureCustomRowsTable();
  // One-time cleanup: remove the 3 old starter rows (only if still exactly as
  // seeded - an edited row is a real rule and is kept). A marker row records
  // that this ran, so nothing is ever re-seeded or re-deleted afterwards.
  await pool.query(`CREATE TABLE IF NOT EXISTS asset_class_custom_starter_removed (done BOOLEAN NOT NULL)`);
  const [{ m }] = await query<{ m: string }>(`SELECT count(*) AS m FROM asset_class_custom_starter_removed`);
  if (Number(m) === 0) {
    for (const r of LEGACY_STARTER_ROWS) {
      await pool.query(
        `DELETE FROM asset_class_custom_table
          WHERE book=$1 AND "assetType"=$2 AND "propertyType"=$3 AND method=$4
            AND "ratePct"=$5 AND convention=$6 AND life=$7`,
        [r.book, r.assetType, r.propertyType, r.method, r.ratePct, r.convention, r.life]
      );
    }
    await pool.query(`INSERT INTO asset_class_custom_starter_removed (done) VALUES (true)`);
  }
  const rows = await query<Record<string, unknown>>(`SELECT * FROM asset_class_custom_table ORDER BY id ASC`);
  return rows.map(toCustomRow);
}

// ======================================================
// Function : updateCustomAssetClass
// Purpose  : Updates one custom asset class row and returns the saved row (null when not found).
// ======================================================

export async function updateCustomAssetClass(id: number, f: Omit<CustomAssetClassRow, 'id' | 'name'>): Promise<CustomAssetClassRow | null> {
  await ensureCustomRowsTable();
  const rows = await query<Record<string, unknown>>(
    `UPDATE asset_class_custom_table
        SET book=$2, "assetType"=$3, "propertyType"=$4, method=$5,
            "ratePct"=$6, convention=$7, life=$8, "bonusPct"=$9
      WHERE id=$1
      RETURNING *`,
    [id, f.book, f.assetType, f.propertyType, f.method, f.ratePct, f.convention, f.life, f.bonusPct ?? '']
  );
  return rows.length ? toCustomRow(rows[0]) : null;
}

// ======================================================
// Function : createCustomAssetClass
// Purpose  : Adds one custom asset class row (a depreciation rule for one
//            Book + asset type) and returns it. A book has no rule for an
//            asset class until a row like this exists — until then it just
//            mirrors Federal Tax (services/book-view.ts).
// ======================================================

export async function createCustomAssetClass(f: Omit<CustomAssetClassRow, 'id' | 'name'>): Promise<CustomAssetClassRow> {
  await ensureCustomRowsTable();
  const rows = await query<Record<string, unknown>>(
    `INSERT INTO asset_class_custom_table (book, "assetType", "propertyType", method, "ratePct", convention, life, "bonusPct")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [f.book, f.assetType, f.propertyType, f.method, f.ratePct, f.convention, f.life, f.bonusPct ?? '']
  );
  return toCustomRow(rows[0]);
}

// ======================================================
// Function : deleteCustomAssetClass
// Purpose  : Deletes one custom asset class row; false when it doesn't exist.
// ======================================================

export async function deleteCustomAssetClass(id: number): Promise<boolean> {
  await ensureCustomRowsTable();
  const rows = await query<Record<string, unknown>>(`DELETE FROM asset_class_custom_table WHERE id=$1 RETURNING id`, [id]);
  return rows.length > 0;
}

// ======================================================
// END: Custom asset classes
// ======================================================

// ======================================================
// Function : Asset class FACT TABLE (effective-dated versions)
// Purpose  : The Fact Table is append-only and permanent: rows are only ever
//            inserted (Postgres triggers reject UPDATE, DELETE and TRUNCATE),
//            so every update ever made to an asset class stays visible.
//            Every edit of a Default Table or Customize Table row is kept as
//            a version: the values that apply FROM the day of the edit.
//            The first edit of a row also stores its original values as a
//            baseline version (effectiveFrom 1900-01-01). Anything dated
//            before an edit keeps resolving to the older version, so e.g.
//            "Bonus 100% until yesterday, 90% from today" leaves old
//            assets at 100% (see resolveClassVersion callers).
//            classKey = "d:<sortOrder>" (default row) or "c:<id>" (custom rule).
// ======================================================

export interface ClassChange { field: string; from: string; to: string }
export interface ClassVersion {
  id: number;
  scope: 'default' | 'custom';
  classKey: string;
  name: string;
  book: string;
  effectiveFrom: string;
  changedAt: string;
  changedBy: string;
  propertyType: string;
  method: string;
  ratePct: string;
  convention: string;
  life: string;
  bonusPct: string;
  changes: ClassChange[];
}

export const CLASS_BASELINE_DATE = '1900-01-01';
const TRACKED_FIELDS = ['name', 'book', 'propertyType', 'method', 'ratePct', 'convention', 'life', 'bonusPct'] as const;

let historyTableReady: Promise<void> | null = null;
// ======================================================
// Function : ensureHistoryTable
// Purpose  : Creates the asset_class_fact_table table on first use (runs once), carries over rows
//            of its earlier name (asset_class_history), and installs the triggers that make it
//            append-only.
// ======================================================

function ensureHistoryTable(): Promise<void> {
  if (!historyTableReady) {
    historyTableReady = pool.query(
      `CREATE TABLE IF NOT EXISTS asset_class_fact_table (
         id               SERIAL PRIMARY KEY,
         scope            TEXT NOT NULL,
         "classKey"       TEXT NOT NULL,
         name             TEXT NOT NULL DEFAULT '',
         book             TEXT NOT NULL DEFAULT '',
         "effectiveFrom"  DATE NOT NULL,
         "changedAt"      TIMESTAMPTZ NOT NULL DEFAULT now(),
         "changedBy"      TEXT NOT NULL DEFAULT '',
         "propertyType"   TEXT NOT NULL DEFAULT '',
         method           TEXT NOT NULL DEFAULT '',
         "ratePct"        TEXT NOT NULL DEFAULT '',
         convention       TEXT NOT NULL DEFAULT '',
         life             TEXT NOT NULL DEFAULT '',
         "bonusPct"       TEXT NOT NULL DEFAULT '',
         changes          TEXT NOT NULL DEFAULT '[]'
       )`
    ).then(async () => {
      // The carry-over and the append-only triggers are extras: if the database refuses either,
      // log it and keep going so the Fact Table itself still loads and records.
      try {
      // Earlier builds called this table asset_class_history: copy its rows over once.
      const old = await query<Record<string, unknown>>(`SELECT to_regclass('asset_class_history') AS t`);
      if (old[0]?.t) {
        const [{ c }] = await query<{ c: string }>(`SELECT count(*) AS c FROM asset_class_fact_table`);
        if (Number(c) === 0) {
          await pool.query(
            `INSERT INTO asset_class_fact_table (scope, "classKey", name, book, "effectiveFrom", "changedAt", "changedBy", "propertyType", method, "ratePct", convention, life, "bonusPct", changes)
             SELECT scope, "classKey", name, book, "effectiveFrom", "changedAt", "changedBy", "propertyType", method, "ratePct", convention, life, "bonusPct", changes
               FROM asset_class_history ORDER BY id`
          );
        }
      }
      // Append-only: nothing may ever change or remove a Fact Table row.
      await pool.query(
        `CREATE OR REPLACE FUNCTION asset_class_fact_table_locked() RETURNS trigger AS $f$
         BEGIN RAISE EXCEPTION 'asset_class_fact_table is append-only: rows cannot be changed or deleted'; END;
         $f$ LANGUAGE plpgsql;
         DROP TRIGGER IF EXISTS asset_class_fact_table_no_change ON asset_class_fact_table;
         CREATE TRIGGER asset_class_fact_table_no_change BEFORE UPDATE OR DELETE ON asset_class_fact_table
           FOR EACH ROW EXECUTE FUNCTION asset_class_fact_table_locked();
         DROP TRIGGER IF EXISTS asset_class_fact_table_no_truncate ON asset_class_fact_table;
         CREATE TRIGGER asset_class_fact_table_no_truncate BEFORE TRUNCATE ON asset_class_fact_table
           FOR EACH STATEMENT EXECUTE FUNCTION asset_class_fact_table_locked();`
      );
      } catch (err) {
        console.error('[fact-table] carry-over / append-only triggers not installed:', err instanceof Error ? err.message : err);
      }
    }).then(() => undefined).catch((err) => { historyTableReady = null; throw err; });
  }
  return historyTableReady;
}

// ======================================================
// Function : toVersion
// Purpose  : Maps a raw history row to a ClassVersion.
// ======================================================

function toVersion(r: Record<string, unknown>): ClassVersion {
  const eff = r.effectiveFrom instanceof Date ? r.effectiveFrom.toISOString().slice(0, 10) : String(r.effectiveFrom ?? '').slice(0, 10);
  let changes: ClassChange[] = [];
  try { changes = JSON.parse(String(r.changes ?? '[]')); } catch { changes = []; }
  return {
    id: Number(r.id),
    scope: r.scope === 'custom' ? 'custom' : 'default',
    classKey: String(r.classKey ?? ''),
    name: String(r.name ?? ''),
    book: String(r.book ?? ''),
    effectiveFrom: eff,
    changedAt: r.changedAt instanceof Date ? r.changedAt.toISOString() : String(r.changedAt ?? ''),
    changedBy: String(r.changedBy ?? ''),
    propertyType: String(r.propertyType ?? ''),
    method: String(r.method ?? ''),
    ratePct: String(r.ratePct ?? ''),
    convention: String(r.convention ?? ''),
    life: String(r.life ?? ''),
    bonusPct: String(r.bonusPct ?? ''),
    changes
  };
}

// ======================================================
// Function : recordClassChange
// Purpose  : Called after an edit. Does nothing when no tracked field changed;
//            otherwise stores the baseline (first edit only) and the new
//            version effective from today.
// ======================================================

export async function recordClassChange(
  scope: 'default' | 'custom',
  classKey: string,
  beforeRow: object,
  afterRow: object,
  changedBy: string
): Promise<void> {
  await ensureHistoryTable();
  const before = beforeRow as Record<string, unknown>;
  const after = afterRow as Record<string, unknown>;
  const changes: ClassChange[] = [];
  for (const f of TRACKED_FIELDS) {
    const a = String(before[f] ?? '');
    const b = String(after[f] ?? '');
    if (a !== b) changes.push({ field: f, from: a, to: b });
  }
  if (!changes.length) return;
  const insert = (v: Record<string, unknown>, eff: string | null, by: string, ch: ClassChange[]) => pool.query(
    `INSERT INTO asset_class_fact_table (scope, "classKey", name, book, "effectiveFrom", "changedBy", "propertyType", method, "ratePct", convention, life, "bonusPct", changes)
     VALUES ($1,$2,$3,$4, COALESCE($5::date, CURRENT_DATE), $6,$7,$8,$9,$10,$11,$12,$13)`,
    [scope, classKey, String(v.name ?? ''), String(v.book ?? ''), eff, by, String(v.propertyType ?? ''), String(v.method ?? ''),
      String(v.ratePct ?? ''), String(v.convention ?? ''), String(v.life ?? ''), String(v.bonusPct ?? ''), JSON.stringify(ch)]
  );
  const [{ c }] = await query<{ c: string }>(`SELECT count(*) AS c FROM asset_class_fact_table WHERE scope=$1 AND "classKey"=$2`, [scope, classKey]);
  if (Number(c) === 0) await insert(before, CLASS_BASELINE_DATE, 'Original', []);
  await insert(after, null, changedBy || 'Unknown', changes);
}

// ======================================================
// Function : recordClassCreated
// Purpose  : Writes the first Fact Table entry of a newly added rule (its original values).
// ======================================================

export async function recordClassCreated(scope: 'default' | 'custom', classKey: string, rowObj: object, createdBy: string): Promise<void> {
  await ensureHistoryTable();
  const v = rowObj as Record<string, unknown>;
  const [{ c }] = await query<{ c: string }>(`SELECT count(*) AS c FROM asset_class_fact_table WHERE scope=$1 AND "classKey"=$2`, [scope, classKey]);
  if (Number(c) > 0) return;
  await pool.query(
    `INSERT INTO asset_class_fact_table (scope, "classKey", name, book, "effectiveFrom", "changedBy", "propertyType", method, "ratePct", convention, life, "bonusPct", changes)
     VALUES ($1,$2,$3,$4,$5::date,$6,$7,$8,$9,$10,$11,$12,'[]')`,
    [scope, classKey, String(v.name ?? ''), String(v.book ?? ''), CLASS_BASELINE_DATE, createdBy || 'Unknown', String(v.propertyType ?? ''), String(v.method ?? ''),
      String(v.ratePct ?? ''), String(v.convention ?? ''), String(v.life ?? ''), String(v.bonusPct ?? '')]
  );
}

// ======================================================
// Function : loadClassHistory
// Purpose  : Versions oldest-first (by effective date, then id). Optionally limited to one class.
// ======================================================

export async function loadClassHistory(scope?: string, classKey?: string): Promise<ClassVersion[]> {
  await ensureHistoryTable();
  const rows = scope && classKey
    ? await query<Record<string, unknown>>(`SELECT * FROM asset_class_fact_table WHERE scope=$1 AND "classKey"=$2 ORDER BY "effectiveFrom" ASC, id ASC`, [scope, classKey])
    : await query<Record<string, unknown>>(`SELECT * FROM asset_class_fact_table ORDER BY "effectiveFrom" ASC, id ASC`);
  return rows.map(toVersion);
}

// ======================================================
// END: Asset class change history
// ======================================================

// ======================================================
// Function : createGeneratedReport
// Purpose  : Insert one row into generated_reports — called when the
//            Reporting page's "+ Custom Report" card is submitted, so
//            the run shows up in "Recently Generated Reports" the same
//            way the seeded rows do (see loadAdmin's generatedReports
//            mapping, which reads this table back out ordered by
//            reportDate DESC).
// ======================================================

export async function createGeneratedReport(input: {
  name: string;
  book: string;
  period: string;
  generatedBy: string;
  date: string;
  format: string;
  status: string;
  csvContent?: string;
}): Promise<Record<string, unknown>> {
  const rows = await query<Record<string, unknown>>(
    `INSERT INTO generated_reports (name, book, period, "generatedBy", "reportDate", format, status, "csvContent")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING name, book, period, "generatedBy", "reportDate" AS date, format, status, "csvContent"`,
    [input.name, input.book, input.period, input.generatedBy, input.date, input.format, input.status, input.csvContent ?? '']
  );
  return rows[0];
}

// ======================================================
// END: createGeneratedReport
// ======================================================

// ======================================================
// Function : createUser
// Purpose  : Insert a new user row. Role headcounts are no longer a
//            stored counter (see loadAdmin) — they're derived live
//            from this table, so there's nothing else to update here.
// ======================================================

export async function createUser(input: {
  id: string;
  name: string;
  email: string;
  role: string;
  lastActive: string;
  status: string;
  password: string;
  menuAccess?: Record<string, { view: boolean; edit: boolean }>;
}): Promise<void> {
  await pool.query(
    `INSERT INTO users (id, name, email, role, "lastActive", status, password, "menuAccess")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [input.id, input.name, input.email, input.role, input.lastActive, input.status, input.password, JSON.stringify(input.menuAccess ?? {})]
  );
}

// ======================================================
// END: createUser
// ======================================================

// ======================================================
// Function : updateUser
// Purpose  : Edit an existing user (name/email/role/status/password).
// ======================================================

export async function updateUser(id: string, patch: {
  name: string;
  email: string;
  role: string;
  status: string;
  password?: string;
  menuAccess?: Record<string, { view: boolean; edit: boolean }>;
}): Promise<Record<string, unknown> | null> {
  const [existing] = await query<Record<string, unknown>>(`SELECT * FROM users WHERE id = $1`, [id]);
  if (!existing) return null;

  const updated = {
    id,
    name: patch.name,
    email: patch.email,
    role: patch.role,
    lastActive: String(existing.lastActive ?? ''),
    status: patch.status,
    // Only overwrite the stored password if a new one was actually
    // submitted — leaving the field blank means "keep current password".
    password: patch.password ? patch.password : String(existing.password ?? ''),
    // Only overwrite menuAccess when the caller actually sent a Page
    // Access map (e.g. from the Edit User modal). A plain rename/role
    // change from elsewhere shouldn't wipe out per-user overrides.
    menuAccess: JSON.stringify(patch.menuAccess ?? safeJson(existing.menuAccess))
  };

  await pool.query(
    `UPDATE users SET name = $2, email = $3, role = $4, status = $5, password = $6, "menuAccess" = $7 WHERE id = $1`,
    [updated.id, updated.name, updated.email, updated.role, updated.status, updated.password, updated.menuAccess]
  );

  return toUserView(updated);
}

// ======================================================
// END: updateUser
// ======================================================

// ======================================================
// Function : updateRolePermissions
// Purpose  : Flip a single capability on/off for a role in the
//            Permission Matrix. Reads the existing row, merges the one
//            changed capability into the stored permissions JSON, and
//            writes it back.
// ======================================================

export async function updateRolePermissions(
  name: string,
  capabilityKey: string,
  value: boolean
): Promise<{ name: string; access: string; permissions: Record<string, boolean> } | null> {
  const [existing] = await query<Record<string, unknown>>(`SELECT * FROM roles WHERE name = $1`, [name]);
  if (!existing) return null;

  const permissions = safeJson(existing.permissions);
  permissions[capabilityKey] = value;

  const updated = {
    name,
    access: String(existing.access ?? ''),
    permissions: JSON.stringify(permissions)
  };
  await pool.query(`UPDATE roles SET permissions = $2 WHERE name = $1`, [name, updated.permissions]);

  return { name, access: updated.access, permissions };
}

// ======================================================
// END: updateRolePermissions
// ======================================================

// ======================================================
// Function : deleteUser
// Purpose  : Remove a user row. Role headcounts recompute on next
//            read (see loadAdmin), so no separate counter to update.
// ======================================================

export async function deleteUser(id: string): Promise<boolean> {
  const result = await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
}

// ======================================================
// END: deleteUser
// ======================================================

// ======================================================
// Function : emailTaken
// Purpose  : Case-insensitive existence check used by self-registration
//            (POST /api/auth/register) so two people can't register the
//            same work email.
// ======================================================

export async function emailTaken(email: string): Promise<boolean> {
  const [existing] = await query<{ id: string }>(`SELECT id FROM users WHERE lower(email) = lower($1)`, [email]);
  return !!existing;
}

// ======================================================
// END: emailTaken
// ======================================================

// ======================================================
// Function : verifyLogin
// Purpose  : Real (still-prototype: plaintext) credential check for
//            POST /api/auth/login. Looks the row up by email — case
//            insensitive, since that's how people actually type emails —
//            and compares the stored password. On a match, flips an
//            "Invited" user to "Active" and stamps lastActive, same as
//            the old client-only mock used to fake, except this is now
//            the thing that actually gates access (see ProtectedRoute).
// ======================================================

export async function verifyLogin(email: string, password: string): Promise<Record<string, unknown> | null | 'PENDING'> {
  const [existing] = await query<Record<string, unknown>>(`SELECT * FROM users WHERE lower(email) = lower($1)`, [email]);
  if (!existing) return null;
  if (String(existing.password ?? '') !== password) return null;
  // Self-registered accounts sit in "Pending" until an admin reviews them
  // in User Management and assigns a role / Page Access, then saves —
  // that Save is what flips status to "Active". Until then, correct
  // credentials still don't get in.
  if (String(existing.status ?? '') === 'Pending') return 'PENDING';

  const updated = {
    id: String(existing.id),
    name: String(existing.name ?? ''),
    email: String(existing.email ?? ''),
    role: String(existing.role ?? ''),
    lastActive: 'Just now',
    status: 'Active',
    menuAccess: String(existing.menuAccess ?? '{}')
  };

  await pool.query(`UPDATE users SET "lastActive" = $2, status = $3 WHERE id = $1`, [updated.id, updated.lastActive, updated.status]);

  return toUserView(updated);
}

// ======================================================
// END: verifyLogin
// ======================================================

// ======================================================
// Function : markInactive
// Purpose  : Flip a user's status to "Inactive" on sign-out (POST
//            /api/auth/logout). Mirrors verifyLogin flipping it to
//            "Active" on sign-in. A no-op (returns false) if the id
//            doesn't exist, e.g. a stale session — logout should still
//            succeed client-side either way.
// ======================================================

export async function markInactive(id: string): Promise<boolean> {
  const result = await pool.query(`UPDATE users SET status = 'Inactive' WHERE id = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
}

// ======================================================
// END: markInactive
// ======================================================

// ======================================================
// Notification feed (header bell) — persisted in Postgres.
// Rows are never trimmed automatically; they go away only via
// deleteNotification (the X button in the UI).
// ======================================================

export interface NotificationRow {
  seq: number;
  id: string;
  name: string;
  email: string;
  role: string;
  at: string;
  type: 'login' | 'registration';
}

let notificationsTableReady: Promise<unknown> | null = null;
// ======================================================
// Function : ensureNotificationsTable
// Purpose  : Creates the notifications table on first use (runs once; retries if creation failed).
// ======================================================

function ensureNotificationsTable(): Promise<unknown> {
  if (!notificationsTableReady) {
    notificationsTableReady = pool.query(
      `CREATE TABLE IF NOT EXISTS notifications (
         seq BIGSERIAL PRIMARY KEY,
         id TEXT NOT NULL DEFAULT '',
         name TEXT NOT NULL DEFAULT '',
         email TEXT NOT NULL DEFAULT '',
         role TEXT NOT NULL DEFAULT '',
         at TEXT NOT NULL DEFAULT '',
         type TEXT NOT NULL DEFAULT 'login'
       )`
    ).catch((err) => { notificationsTableReady = null; throw err; });
  }
  return notificationsTableReady;
}

// ======================================================
// Function : addNotification
// Purpose  : Saves one sign-in / registration notification to Postgres.
// ======================================================

export async function addNotification(n: Omit<NotificationRow, 'seq'>): Promise<void> {
  await ensureNotificationsTable();
  await pool.query(
    `INSERT INTO notifications (id, name, email, role, at, type) VALUES ($1,$2,$3,$4,$5,$6)`,
    [n.id, n.name, n.email, n.role, n.at, n.type]
  );
}

// ======================================================
// Function : listNotifications
// Purpose  : Reads every notification, newest first.
// ======================================================

export async function listNotifications(): Promise<NotificationRow[]> {
  await ensureNotificationsTable();
  const rows = await query<Record<string, unknown>>(`SELECT * FROM notifications ORDER BY seq DESC`);
  return rows.map((r) => ({
    seq: Number(r.seq),
    id: String(r.id),
    name: String(r.name),
    email: String(r.email),
    role: String(r.role),
    at: String(r.at),
    type: r.type === 'registration' ? 'registration' : 'login'
  }));
}

// ======================================================
// Function : deleteNotification
// Purpose  : Deletes one notification by seq; returns true when a row was removed.
// ======================================================

export async function deleteNotification(seq: number): Promise<boolean> {
  await ensureNotificationsTable();
  const result = await pool.query(`DELETE FROM notifications WHERE seq = $1`, [seq]);
  return (result.rowCount ?? 0) > 0;
}

// ======================================================
// END: Repository Functions
// ======================================================

// ======================================================
// END OF FILE : repo.ts
// ======================================================
