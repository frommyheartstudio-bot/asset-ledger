// ======================================================
// File Name : assets.ts
// Purpose   : Defines HTTP route handlers for assets
// ======================================================

import { Router } from 'express';
import { assets, depreciationSchedules, findAsset, timelines } from '../data/assets.js';


// ======================================================
// START: Route Handlers
// ======================================================

export const assetsRouter = Router();

// GET /api/assets?assetClass=&company=&status=&method=&q=
// ======================================================
// Function : GET /
// Purpose  : Route handler for GET /
// Input    : req (HTTP request)
// Output   : res (HTTP response, JSON)
// ======================================================

assetsRouter.get('/', (req, res) => {
  const { assetClass, company, status, method, q } = req.query as Record<string, string | undefined>;

  let results = assets;
  if (assetClass && assetClass !== 'All Classes') results = results.filter((a) => a.assetClass === assetClass);
  if (company && company !== 'All Companies') results = results.filter((a) => a.company === company);
  if (status) results = results.filter((a) => a.status === status);
  if (method && method !== 'All Methods') results = results.filter((a) => a.method === method);
  if (q) {
    const needle = q.toLowerCase();
    results = results.filter(
      (a) => a.assetNumber.includes(needle) || a.description.toLowerCase().includes(needle)
    );
  }

  res.json({
    total: results.length,
    items: results
  });
});

// POST /api/assets — capitalize a new asset (in-memory only, for the Add Asset page).
assetsRouter.post('/', (req, res) => {
  const body = req.body as Partial<(typeof assets)[number]>;
  const assetNumber = body.assetNumber ?? String(800000000 + Math.floor(Math.random() * 90000000));
  const cost = body.cost ?? 0;

  const newAsset = {
    assetNumber,
    description: body.description ?? 'Untitled Asset',
    assetClass: body.assetClass ?? 'Machinery',
    company: body.company ?? '5B',
    cost,
    accumDepreciation: 0,
    nbv: cost,
    method: body.method ?? 'Straight-Line',
    status: 'Active' as const
  };

  assets.push(newAsset);
  res.status(201).json(newAsset);
});

// ======================================================
// END: GET /
// ======================================================

// ======================================================
// Function : GET /:assetNumber
// Purpose  : Route handler for GET /:assetNumber
// Input    : req (HTTP request)
// Output   : res (HTTP response, JSON)
// ======================================================

assetsRouter.get('/:assetNumber', (req, res) => {

// ======================================================
// END: GET /:assetNumber
// ======================================================
  const asset = findAsset(req.params.assetNumber);
  if (!asset) {
    res.status(404).json({ error: 'Asset not found' });
    return;
  }
  res.json({
    asset,
    timeline: timelines[asset.assetNumber] ?? [],
    depreciationSchedule: depreciationSchedules[asset.assetNumber] ?? []
  });
});

// ======================================================
// END: Route Handlers
// ======================================================

