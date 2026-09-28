// ======================================================
// File Name : misc.ts
// Purpose   : Defines HTTP route handlers for misc
// ======================================================

import { Router } from 'express';
import { computeForecast } from '../data/activity.js';
import {
  generatedReports as seedGeneratedReports,
  reportCatalog as seedReportCatalog,
  roles as seedRoles,
  users as seedUsers
} from '../data/admin.js';
import { ASSET_CLASS_SEED } from '../data/assetClasses.js';
import { createGeneratedReport, createUser, deleteUser, loadAdmin, loadAssetClasses, seedAdminIfEmpty, seedAssetClassesIfEmpty, updateRolePermissions, updateUser } from '../db/repo.js';

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

// Company / Asset Type each arrive as a comma-separated list (checkbox
// multi-select on the client) — an empty/missing value keeps the
// portfolio-wide default, same as before this was a checkbox list.
function parseCsvParam(value: unknown): string[] | undefined {
  if (typeof value !== 'string' || !value) return undefined;
  const parts = value.split(',').map((v) => v.trim()).filter(Boolean);
  return parts.length ? parts : undefined;
}

forecastingRouter.get('/', (req, res) => res.json(computeForecast(Number(req.query.years) || 5, {
  company: parseCsvParam(req.query.company),
  assetType: parseCsvParam(req.query.assetType)
})));

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

