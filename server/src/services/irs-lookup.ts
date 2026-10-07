// ======================================================
// File Name : irs-lookup.ts
// Purpose   : Finds the IRS asset class + recovery period for a plain
//             description ("Dell laptop", "delivery van"). Free, no API key.
//             1) Tries to read IRS Pub 946 Table B-1 live from irs.gov
//                (cached 24h in memory).
//             2) If irs.gov cannot be reached / parsed, uses the built-in
//                copy of the common Table B-1 rows below.
//             Then scores the rows by keyword and returns the best matches.
// ======================================================

export interface ClassRow { code: string; description: string; classLife: string; gds: string; ads: string }
export interface LookupMatch extends ClassRow { score: number }
export interface LookupResult { source: 'irs.gov (live)' | 'built-in Table B-1'; matches: LookupMatch[] }

const IRS_URL = 'https://www.irs.gov/publications/p946';

// Built-in fallback (Rev. Proc. 87-56 / Pub 946 Table B-1, common rows).
const BUILT_IN: ClassRow[] = [
  { code: '00.11', description: 'Office furniture, fixtures and equipment: desks, chairs, filing cabinets, safes, copiers, fax machines, calculators, typewriters, telephones', classLife: '10', gds: '7', ads: '10' },
  { code: '00.12', description: 'Information systems: computers, laptops, servers, desktops, monitors, printers, peripheral equipment, networking', classLife: '6', gds: '5', ads: '5' },
  { code: '00.13', description: 'Data handling equipment except computers: typewriters, calculators, adding and copying machines', classLife: '6', gds: '5', ads: '6' },
  { code: '00.21', description: 'Airplanes (airframes and engines) not used in commercial or contract carrying of passengers or freight', classLife: '6', gds: '5', ads: '6' },
  { code: '00.22', description: 'Automobiles, taxis, cars', classLife: '3', gds: '5', ads: '5' },
  { code: '00.23', description: 'Buses', classLife: '9', gds: '5', ads: '9' },
  { code: '00.241', description: 'Light general purpose trucks: actual unloaded weight less than 13,000 pounds, pickup truck, van, light truck', classLife: '4', gds: '5', ads: '5' },
  { code: '00.242', description: 'Heavy general purpose trucks: actual unloaded weight 13,000 pounds or more, heavy truck, delivery truck, lorry, concrete ready mix trucks', classLife: '6', gds: '5', ads: '6' },
  { code: '00.25', description: 'Railroad cars and locomotives', classLife: '15', gds: '7', ads: '15' },
  { code: '00.26', description: 'Tractor units for use over-the-road', classLife: '4', gds: '3', ads: '4' },
  { code: '00.27', description: 'Trailers and trailer-mounted containers', classLife: '6', gds: '5', ads: '6' },
  { code: '00.28', description: 'Vessels, barges, tugs and similar water transportation equipment, boats', classLife: '18', gds: '10', ads: '18' },
  { code: '00.3', description: 'Land improvements: sidewalks, roads, drainage, fences, landscaping, shrubbery, parking lots, bridges', classLife: '20', gds: '15', ads: '20' },
  { code: '00.4', description: 'Industrial steam and electric generation or distribution systems', classLife: '22', gds: '15', ads: '22' },
  { code: '57.0', description: 'Distributive trades and services: retail and wholesale, store equipment, shelving, display, point of sale, cash registers', classLife: '9', gds: '5', ads: '9' },
  { code: '79.0', description: 'Recreation: amusement, gym, fitness equipment, theme parks, bowling', classLife: '10', gds: '7', ads: '10' },
  { code: '80.0', description: 'Theaters and producers of live theatrical presentations', classLife: '10', gds: '7', ads: '10' }
];

const STOP = new Set(['the', 'and', 'for', 'with', 'new', 'used', 'a', 'an', 'of', 'to', 'in', 'on', 'except', 'not']);
const tokens = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter((t) => t.length > 1 && !STOP.has(t));
const stem = (t: string) => t.replace(/(ies|es|s)$/, '');

// ---------- live read of irs.gov (best effort) ----------

let liveCache: { rows: ClassRow[]; at: number } | null = null;
const DAY = 24 * 60 * 60 * 1000;

const clean = (h: string) => h.replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

export function parseTableB1(html: string): ClassRow[] {
  const rows: ClassRow[] = [];
  for (const tr of html.match(/<tr[\s\S]*?<\/tr>/gi) ?? []) {
    const cells = (tr.match(/<t[dh][\s\S]*?<\/t[dh]>/gi) ?? []).map(clean);
    if (cells.length < 4 || !/^\d{2}(\.\d{1,3})?$/.test(cells[0])) continue;
    const [code, description, classLife, gds, ads] = cells;
    if (!/^\d/.test(gds ?? '') && !/^\d/.test(classLife ?? '')) continue;
    rows.push({ code, description, classLife, gds, ads: ads ?? '' });
  }
  return rows;
}

async function liveRows(): Promise<ClassRow[] | null> {
  if (liveCache && Date.now() - liveCache.at < DAY) return liveCache.rows;
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 8000);
    const r = await fetch(IRS_URL, { signal: ctl.signal, headers: { 'user-agent': 'AssetLedger/0.1' } });
    clearTimeout(timer);
    if (!r.ok) return null;
    const rows = parseTableB1(await r.text());
    if (rows.length < 20) return null; // page layout changed -> use the built-in table
    liveCache = { rows, at: Date.now() };
    return rows;
  } catch {
    return null;
  }
}

// ---------- matching ----------

function score(q: string[], row: ClassRow): number {
  const desc = tokens(row.description).map(stem);
  let s = 0;
  for (const t of q.map(stem)) {
    if (desc.includes(t)) s += 3;
    else if (desc.some((d) => d.startsWith(t) || t.startsWith(d))) s += 1;
  }
  return s;
}

export async function lookupAssetClass(query: string): Promise<LookupResult> {
  const q = tokens(query);
  // Built-in rows carry the extra everyday words (laptop, van...), so they are always scored too.
  const live = await liveRows();
  const pool = new Map<string, ClassRow & { src: number }>();
  for (const r of BUILT_IN) pool.set(r.code, { ...r, src: 0 });
  if (live) for (const r of live) {
    const b = pool.get(r.code);
    pool.set(r.code, b ? { ...r, description: `${r.description}. ${b.description}`, src: 1 } : { ...r, src: 1 });
  }
  const matches = [...pool.values()]
    .map((r) => ({ code: r.code, description: r.description.slice(0, 220), classLife: r.classLife, gds: r.gds, ads: r.ads, score: score(q, r) }))
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
  return { source: live ? 'irs.gov (live)' : 'built-in Table B-1', matches };
}
