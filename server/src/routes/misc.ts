// ======================================================
// File Name : misc.ts
// Purpose   : Defines HTTP route handlers for misc
// ======================================================

import { lookupAssetClass } from '../services/irs-lookup.js';
import { Router } from 'express';
import { computeForecast } from '../data/activity.js';
import { resolveBook } from '../data/books.js';
import { primeBookRules } from '../services/book-view.js';
import { isKnownBook } from '../data/books.js';
import {
  generatedReports as seedGeneratedReports,
  reportCatalog as seedReportCatalog,
  roles as seedRoles,
  users as seedUsers
} from '../data/admin.js';
import { ASSET_CLASS_SEED } from '../data/assetClasses.js';
import { createCustomAssetClass, createGeneratedReport, createUser, deleteAssetClass, deleteCustomAssetClass, deleteUser, loadAdmin, loadAssetClasses, loadClassHistory, loadCustomAssetClasses, recordClassChange, recordClassCreated, seedAdminIfEmpty, seedAssetClassesIfEmpty, updateAssetClass, updateCustomAssetClass, updateRolePermissions, updateUser } from '../db/repo.js';

// ======================================================
// Function : adminData
// Purpose  : Users / roles / reports now come out of Postgres rather
//            than the hardcoded arrays. Cached for a few seconds so a
//            page that hits four endpoints doesn't run four round
//            trips. On first run the tables are empty, so the arrays in
//            data/admin.ts are inserted once as a bootstrap.
// ======================================================

let adminCache: Awaited<ReturnType<typeof loadAdmin>> | null = null;
let adminCacheAt = 0;
const ADMIN_TTL_MS = 5000;

async function adminData() {
  if (adminCache && Date.now() - adminCacheAt < ADMIN_TTL_MS) return adminCache;
  await seedAdminIfEmpty({
    roles: seedRoles,
    users: seedUsers as unknown as Array<Record<string, unknown>>,
    reportCatalog: seedReportCatalog as unknown as Array<Record<string, unknown>>,
    generatedReports: seedGeneratedReports as unknown as Array<Record<string, unknown>>
  });
  adminCache = await loadAdmin();
  adminCacheAt = Date.now();
  return adminCache;
}

// ======================================================
// END: adminData
// ======================================================

let assetClassesCache: Awaited<ReturnType<typeof loadAssetClasses>> | null = null;
let assetClassesCacheAt = 0;
const ASSET_CLASSES_TTL_MS = 5000;

// ======================================================
// Function : assetClassesData
// Purpose  : Configuration -> Asset Classes page data, out of Postgres
//            (bootstrapped from ASSET_CLASS_SEED once, same pattern as
//            adminData above). Cached briefly since the table rarely
//            changes and the page can re-request it often.
// ======================================================

let assetClassesInflight: Promise<Awaited<ReturnType<typeof loadAssetClasses>>> | null = null;

async function assetClassesData() {
  if (assetClassesCache && Date.now() - assetClassesCacheAt < ASSET_CLASSES_TTL_MS) return assetClassesCache;
  // Several dropdowns can ask at once on first load — share one seed+read.
  if (!assetClassesInflight) {
    assetClassesInflight = (async () => {
      await seedAssetClassesIfEmpty(ASSET_CLASS_SEED);
      assetClassesCache = await loadAssetClasses();
      assetClassesCacheAt = Date.now();
      return assetClassesCache;
    })().finally(() => { assetClassesInflight = null; });
  }
  return assetClassesInflight;
}

// ======================================================
// END: assetClassesData
// ======================================================


// ======================================================
// START: Route Handlers
// ======================================================

export const forecastingRouter = Router();
// ======================================================
// Function : GET /
// Purpose  : Route handler for GET /
// Input    : req (HTTP request)
// Output   : res (HTTP response, JSON)
// ======================================================

// ======================================================
// Function : parseCsvParam
// Purpose  : Splits a comma-separated query value into a trimmed list; undefined when empty.
// ======================================================

// Company / Asset Type each arrive as a comma-separated list (checkbox
// multi-select on the client) — an empty/missing value keeps the
// portfolio-wide default, same as before this was a checkbox list.
function parseCsvParam(value: unknown): string[] | undefined {
  if (typeof value !== 'string' || !value) return undefined;
  const parts = value.split(',').map((v) => v.trim()).filter(Boolean);
  return parts.length ? parts : undefined;
}

forecastingRouter.get('/', async (req, res) => {
  try {
    const book = resolveBook(req.query.book);
    await primeBookRules();
    res.json(computeForecast(Number(req.query.years) || 5, {
      company: parseCsvParam(req.query.company),
      assetType: parseCsvParam(req.query.assetType)
    }, book));
  } catch (err) {
    console.error('[forecasting] failed:', err);
    res.status(500).json({ error: 'Failed to compute forecast' });
  }
});

// ======================================================
// END: GET /
// ======================================================

export const reportingRouter = Router();
// ======================================================
// Function : GET /catalog
// Purpose  : Route handler for GET /catalog
// Input    : req (HTTP request)
// Output   : res (HTTP response, JSON)
// ======================================================

reportingRouter.get('/catalog', async (_req, res) => res.json((await adminData()).reportCatalog));

// ======================================================
// END: GET /catalog
// ======================================================
// ======================================================
// Function : GET /recent
// Purpose  : Route handler for GET /recent
// Input    : req (HTTP request)
// Output   : res (HTTP response, JSON)
// ======================================================

reportingRouter.get('/recent', async (_req, res) => res.json((await adminData()).generatedReports));

// ======================================================
// END: GET /recent
// ======================================================

// ======================================================
// Function : POST /generate
// Purpose  : Records one run of the "+ Custom Report" card (name, book(s),
//            focus period, who ran it) as a GeneratedReport row so it
//            shows up in "Recently Generated Reports". The actual CSV
//            file is built and downloaded client-side (Reporting.jsx),
//            since the underlying asset rows are already loaded there —
//            this endpoint only persists the run's metadata.
// Input    : req.body { name, book, period, generatedBy, format? }
// Output   : res (HTTP response, JSON) — the created report row
// ======================================================

reportingRouter.post('/generate', async (req, res) => {
  const { name, book, period, generatedBy, format, csvContent } = req.body ?? {};
  if (!name || !String(name).trim()) {
    res.status(400).json({ error: 'Report name is required' });
    return;
  }
  if (!period || !String(period).trim()) {
    res.status(400).json({ error: 'Focus period is required' });
    return;
  }
  const created = await createGeneratedReport({
    name: String(name).trim(),
    book: book && String(book).trim() ? String(book).trim() : 'All Books',
    period: String(period).trim(),
    generatedBy: generatedBy && String(generatedBy).trim() ? String(generatedBy).trim() : 'System',
    date: new Date().toISOString().slice(0, 10),
    format: format && String(format).trim() ? String(format).trim() : 'CSV',
    status: 'Ready',
    csvContent: typeof csvContent === 'string' ? csvContent : ''
  });
  adminCache = null;
  res.status(201).json(created);
});

// ======================================================
// END: POST /generate
// ======================================================

export const configRouter = Router();
// ======================================================
// Function : GET /asset-classes
// Purpose  : Configuration -> Asset Classes page. Route handler for
//            GET /asset-classes
// Input    : req (HTTP request)
// Output   : res (HTTP response, JSON) — array of asset class rows,
//            in the same order they were supplied in
// ======================================================

configRouter.get('/asset-class-lookup', async (req, res) => {
  const q = String(req.query.q ?? '').trim().slice(0, 120);
  if (q.length < 2) return res.status(400).json({ error: 'Type a short description, e.g. "laptop"' });
  try {
    res.json(await lookupAssetClass(q));
  } catch (err) {
    console.error('[asset-class-lookup] failed:', err instanceof Error ? err.message : err);
    res.status(500).json({ error: 'Lookup failed' });
  }
});

configRouter.get('/asset-classes', async (_req, res) => {
  try {
    res.json(await assetClassesData());
  } catch (err) {
    console.error('[asset-classes] failed:', err instanceof Error ? err.message : err);
    res.status(500).json({ error: 'Could not load asset classes' });
  }
});

// ======================================================
// END: GET /asset-classes
// ======================================================

// ======================================================
// Function : DELETE /asset-classes/:id
// Purpose  : Deletes one row of the Default Table (id = its sortOrder).
//            Drops the short-lived cache so both tables refresh at once.
// ======================================================

configRouter.delete('/asset-classes/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
    const ok = await deleteAssetClass(id);
    if (!ok) return res.status(404).json({ error: 'Row not found' });
    assetClassesCache = null;
    res.json({ ok: true });
  } catch (err) {
    console.error('[asset-classes DELETE] failed:', err instanceof Error ? err.message : err);
    res.status(500).json({ error: 'Could not delete the asset class' });
  }
});

// ======================================================
// END: DELETE /asset-classes/:id
// ======================================================

// ======================================================
// Function : PUT /asset-classes/:id
// Purpose  : Edits one row of the Default Table (id = its sortOrder).
// ======================================================

configRouter.put('/asset-classes/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
    const b = (req.body ?? {}) as Record<string, unknown>;
    const f = {
      name: str(b.name), propertyType: str(b.propertyType), method: str(b.method),
      ratePct: str(b.ratePct), convention: str(b.convention), life: str(b.life)
    };
    const missing = Object.entries(f).filter(([, v]) => !v).map(([k]) => k);
    if (missing.length) return res.status(400).json({ error: `Missing or invalid: ${missing.join(', ')}` });
    const bonusPct = bonusPctOf(b.bonusPct);
    if (bonusPct === null) return res.status(400).json({ error: 'Bonus % must be blank or a number from 0 to 100' });
    if (f.ratePct !== 'N/A' && !(Number(f.ratePct) > 0)) return res.status(400).json({ error: 'Rate % must be a positive number or N/A' });
    if (!/^\d+\s*years?\s*\d+\s*months?$/i.test(f.life)) return res.status(400).json({ error: 'Life must look like "10 years 0 months"' });
    const before = (await loadAssetClasses()).find((r) => r.id === id);
    const updated = await updateAssetClass(id, { ...f, bonusPct });
    if (!updated) return res.status(404).json({ error: 'Row not found' });
    if (before) await recordClassChange('default', `d:${id}`, before, updated, str(b.changedBy));
    assetClassesCache = null;
    await primeBookRules(true);
    res.json(updated);
  } catch (err) {
    console.error('[asset-classes PUT] failed:', err instanceof Error ? err.message : err);
    res.status(500).json({ error: 'Could not save the asset class' });
  }
});


// ======================================================
// Function : /asset-classes/custom  (Customize Table)
// Purpose  : Custom rules (Name, Property Type, Method, Rate %,
//            Convention, Life), every column editable.
// ======================================================

// ======================================================
// Function : str
// Purpose  : Returns a trimmed string for string input, otherwise an empty string.
// ======================================================

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

// Function : bonusPctOf
// Purpose  : Cleans the optional Bonus % field: '' (none), a 0-100 number as text, or null when invalid.
function bonusPctOf(v: unknown): string | null {
  const s = typeof v === 'number' ? String(v) : str(v);
  if (!s) return '';
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 && n <= 100 ? String(n) : null;
}

// Function : GET /asset-classes/history
// Purpose  : Fact Table: version history of asset class rows. ?scope=default|custom&id=N
//            for one row (popup on the Asset Classes page); no query = all rows
//            (the Addition form uses it to pick the values valid on a PIS date).
configRouter.get('/asset-classes/history', async (req, res) => {
  try {
    const scope = typeof req.query.scope === 'string' ? req.query.scope : '';
    const id = typeof req.query.id === 'string' ? req.query.id : '';
    const one = (scope === 'default' || scope === 'custom') && /^\d+$/.test(id);
    res.json(await loadClassHistory(one ? scope : undefined, one ? `${scope === 'custom' ? 'c' : 'd'}:${id}` : undefined));
  } catch (err) {
    console.error('[asset-classes/history] failed:', err instanceof Error ? err.message : err);
    res.status(500).json({ error: 'Could not load the change history' });
  }
});

configRouter.get('/asset-classes/custom', async (_req, res) => {
  try {
    res.json(await loadCustomAssetClasses());
  } catch (err) {
    console.error('[asset-classes/custom] failed:', err instanceof Error ? err.message : err);
    res.status(500).json({ error: 'Could not load the customize table' });
  }
});

// Function : validateCustomRow
// Purpose  : Shared checks for adding / editing a custom rule row. Returns
//            the cleaned fields, or an error message string.
function validateCustomRow(body: unknown): { fields: { book: string; assetType: string; propertyType: string; method: string; ratePct: string; convention: string; life: string; bonusPct: string } } | { error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const f = {
    book: str(b.book), assetType: str(b.assetType),
    propertyType: str(b.propertyType), method: str(b.method), ratePct: str(b.ratePct),
    convention: str(b.convention), life: str(b.life)
  };
  const missing = Object.entries(f).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) return { error: `Missing or invalid: ${missing.join(', ')}` };
  if (!isKnownBook(f.book)) return { error: `Unknown book "${f.book}"` };
  if (f.ratePct !== 'N/A' && !(Number(f.ratePct) > 0)) return { error: 'Rate % must be a positive number or N/A' };
  if (!/^\d+\s*years?\s*\d+\s*months?$/i.test(f.life)) return { error: 'Life must look like "10 years 0 months"' };
  const bonusPct = bonusPctOf(b.bonusPct);
  if (bonusPct === null) return { error: 'Bonus % must be blank or a number from 0 to 100' };
  return { fields: { ...f, bonusPct } };
}

configRouter.post('/asset-classes/custom', async (req, res) => {
  try {
    const v = validateCustomRow(req.body);
    if ('error' in v) return res.status(400).json({ error: v.error });
    const created = await createCustomAssetClass(v.fields);
    await recordClassCreated('custom', `c:${created.id}`, created, str(((req.body ?? {}) as Record<string, unknown>).changedBy));
    await primeBookRules(true); // the new rule applies to that book's tables right away
    res.status(201).json(created);
  } catch (err) {
    console.error('[asset-classes/custom POST] failed:', err instanceof Error ? err.message : err);
    res.status(500).json({ error: 'Could not add the rule' });
  }
});

configRouter.delete('/asset-classes/custom/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
    const ok = await deleteCustomAssetClass(id);
    if (!ok) return res.status(404).json({ error: 'Row not found' });
    await primeBookRules(true);
    res.json({ ok: true });
  } catch (err) {
    console.error('[asset-classes/custom DELETE] failed:', err instanceof Error ? err.message : err);
    res.status(500).json({ error: 'Could not delete the rule' });
  }
});

configRouter.put('/asset-classes/custom/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
    const v = validateCustomRow(req.body);
    if ('error' in v) return res.status(400).json({ error: v.error });
    const before = (await loadCustomAssetClasses()).find((r) => r.id === id);
    const updated = await updateCustomAssetClass(id, v.fields);
    if (!updated) return res.status(404).json({ error: 'Row not found' });
    if (before) await recordClassChange('custom', `c:${id}`, before, updated, str(((req.body ?? {}) as Record<string, unknown>).changedBy));
    await primeBookRules(true); // an edited rule shows up in that book's tables right away
    res.json(updated);
  } catch (err) {
    console.error('[asset-classes/custom PUT] failed:', err instanceof Error ? err.message : err);
    res.status(500).json({ error: 'Could not save the row' });
  }
});

// ======================================================
// END: custom asset classes
// ======================================================

export const usersRouter = Router();
// ======================================================
// Function : GET /
// Purpose  : Route handler for GET /
// Input    : req (HTTP request)
// Output   : res (HTTP response, JSON)
// ======================================================

usersRouter.get('/', async (_req, res) => res.json((await adminData()).users));

// ======================================================
// END: GET /
// ======================================================
// ======================================================
// Function : GET /roles
// Purpose  : Route handler for GET /roles
// Input    : req (HTTP request)
// Output   : res (HTTP response, JSON)
// ======================================================

usersRouter.get('/roles', async (_req, res) => res.json((await adminData()).roles));

// ======================================================
// END: GET /roles
// ======================================================

// ======================================================
// Function : PUT /roles/:name
// Purpose  : Toggle one capability for a role in the Permission
//            Matrix. This is what actually drives a user's default
//            access — the Sidebar reads a signed-in user's role
//            permissions and hides any nav item whose capability is
//            off, so ticking/unticking here changes what that
//            role's users see, not just what the matrix displays.
// Input    : req.body { capabilityKey, value }
// Output   : res (HTTP response, JSON) — the updated role
// ======================================================

usersRouter.put('/roles/:name', async (req, res) => {
  const { capabilityKey, value } = req.body ?? {};
  if (!capabilityKey || typeof value !== 'boolean') {
    res.status(400).json({ error: 'capabilityKey and a boolean value are required' });
    return;
  }
  const updated = await updateRolePermissions(req.params.name, String(capabilityKey), value);
  if (!updated) {
    res.status(404).json({ error: 'Role not found' });
    return;
  }
  adminCache = null;
  res.json(updated);
});

// ======================================================
// END: PUT /roles/:name
// ======================================================

// ======================================================
// Function : POST /
// Purpose  : Create (invite) a new user, persisted to Postgres.
// Input    : req.body { name, email, role, status? }
// Output   : res (HTTP response, JSON) — the created user
// ======================================================

usersRouter.post('/', async (req, res) => {
  const { name, email, role, status, password, menuAccess } = req.body ?? {};
  if (!name || !email || !role || !password) {
    res.status(400).json({ error: 'name, email, role and password are required' });
    return;
  }
  const user = {
    id: 'u' + Date.now().toString(36),
    name: String(name),
    email: String(email),
    role: String(role),
    lastActive: 'Never',
    status: String(status || 'Invited'),
    password: String(password),
    menuAccess: menuAccess && typeof menuAccess === 'object' ? menuAccess : undefined
  };
  await createUser(user);
  adminCache = null;
  const { password: _pw, ...safe } = user;
  res.status(201).json(safe);
});

// ======================================================
// END: POST /
// ======================================================

// ======================================================
// Function : PUT /:id
// Purpose  : Edit a user's name/email/role/status/Page Access. Role
//            still drives their default menus/capabilities (see the
//            Permission Matrix); menuAccess, when sent (from the
//            Edit User modal's per-menu View/Edit checkboxes), overrides
//            that default per menu for this one user.
// Input    : req.body { name, email, role, status, menuAccess? }
// Output   : res (HTTP response, JSON) — the updated user
// ======================================================

usersRouter.put('/:id', async (req, res) => {
  const { name, email, role, status, password, menuAccess } = req.body ?? {};
  if (!name || !email || !role) {
    res.status(400).json({ error: 'name, email and role are required' });
    return;
  }
  const updated = await updateUser(req.params.id, {
    name: String(name),
    email: String(email),
    role: String(role),
    status: String(status || 'Active'),
    password: password ? String(password) : undefined,
    menuAccess: menuAccess && typeof menuAccess === 'object' ? menuAccess : undefined
  });
  if (!updated) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  adminCache = null;
  res.json(updated);
});

// ======================================================
// END: PUT /:id
// ======================================================

// ======================================================
// Function : DELETE /:id
// Purpose  : Remove a user.
// Output   : res (HTTP response, JSON) — { deleted: true }
// ======================================================

usersRouter.delete('/:id', async (req, res) => {
  const ok = await deleteUser(req.params.id);
  if (!ok) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  adminCache = null;
  res.json({ deleted: true });
});

// ======================================================
// END: DELETE /:id
// ======================================================

// ======================================================
// END: Route Handlers
// ======================================================

// ======================================================
// END OF FILE : misc.ts
// ======================================================
