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
import type { Asset, DepreciationScheduleRow, TimelineEntry } from '../types.js';

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

function n(v: unknown): number {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

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
        placedInService: String(r.tfp_placedInService ?? ''),
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
        disposalDate: String(r.disp_disposalDate),
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

  const mappedUsers = users.map((u) => ({
    id: String(u.id),
    name: String(u.name ?? ''),
    email: String(u.email ?? ''),
    role: String(u.role ?? ''),
    lastActive: String(u.lastActive ?? ''),
    status: String(u.status ?? ''),
    menuAccess: safeJson(u.menuAccess)
    // password intentionally omitted — write-only, never sent to the client
  }));

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
      status: String(r.status ?? '')
    }))
  };
}

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
}): Promise<Record<string, unknown>> {
  const rows = await query<Record<string, unknown>>(
    `INSERT INTO generated_reports (name, book, period, "generatedBy", "reportDate", format, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING name, book, period, "generatedBy", "reportDate" AS date, format, status`,
    [input.name, input.book, input.period, input.generatedBy, input.date, input.format, input.status]
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

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    lastActive: updated.lastActive,
    status: updated.status,
    menuAccess: safeJson(updated.menuAccess)
  };
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

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    lastActive: updated.lastActive,
    status: updated.status,
    menuAccess: safeJson(updated.menuAccess)
  };
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
