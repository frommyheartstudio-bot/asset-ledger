// ======================================================
// File Name : sapNormalize.ts
// Purpose   : Turns ONE raw row from SAP (whatever its column names, date
//             style or number style) into the app's SapRecord shape, so the
//             rest of the pipeline (mapToAddition -> CSV) never sees SAP
//             quirks. Three things happen here:
//               1. Column names  : SAP technical names (ANLN1, BUKRS, ANLKL,
//                                  AKTIV, ANSWL, TXT50, BELNR) or our own
//                                  names are both accepted (case-insensitive).
//               2. Formats       : dates DD.MM.YYYY / YYYYMMDD / DD/MM/YYYY /
//                                  /Date(ms)/ -> YYYY-MM-DD; amounts like
//                                  "1.234,56", "1,234.56", "100-" -> number.
//               3. Code mapping  : SAP company code / asset class -> our code,
//                                  read from server/config/sap-mapping.json
//                                  (re-read on every call, no restart needed).
//             The SAP column list is an ASSUMPTION until the client's real
//             sample is available; add aliases to ALIASES below if it differs.
// ======================================================

import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { SapRecord } from './sapAdapter.js';

// ======================================================
// START: Column aliases
// ======================================================

// our field -> accepted SAP / alternative column names (compared lower-case)
const ALIASES: Record<keyof SapRecord, string[]> = {
  documentId: ['documentid', 'belnr', 'docno', 'documentno', 'docnumber'],
  assetNumber: ['assetnumber', 'anln1', 'assetno', 'asset', 'mainassetnumber'],
  companyCode: ['companycode', 'bukrs', 'company'],
  assetClass: ['assetclass', 'anlkl', 'class'],
  description: ['description', 'txt50', 'txt', 'name'],
  acquisitionCost: ['acquisitioncost', 'answl', 'acquisitionvalue', 'cost', 'amount'],
  capitalizationDate: ['capitalizationdate', 'aktiv', 'capitalizedon', 'capdate']
};

// ======================================================
// END: Column aliases
// ======================================================

// ======================================================
// START: Code mapping file
// ======================================================

interface CodeMapping {
  companyCodes: Record<string, string>;
  assetClasses: Record<string, string>;
}

const MAPPING_PATH = fileURLToPath(new URL('../../../config/sap-mapping.json', import.meta.url));

// Function : loadCodeMapping
// Purpose  : Reads sap-mapping.json fresh each time (so edits apply without a
//            restart). Missing/invalid file = no mapping, codes pass through.
export function loadCodeMapping(): CodeMapping {
  const empty: CodeMapping = { companyCodes: {}, assetClasses: {} };
  if (!existsSync(MAPPING_PATH)) return empty;
  try {
    const raw = JSON.parse(readFileSync(MAPPING_PATH, 'utf8')) as Partial<CodeMapping>;
    return { companyCodes: raw.companyCodes ?? {}, assetClasses: raw.assetClasses ?? {} };
  } catch (err) {
    console.error('sap-mapping.json could not be read, using no mapping:', err);
    return empty;
  }
}

// ======================================================
// END: Code mapping file
// ======================================================

// ======================================================
// START: Value parsers
// ======================================================

// Function : parseSapDate
// Purpose  : Any common SAP date style -> YYYY-MM-DD. Unknown style is
//            returned unchanged so the mapper reports it as a bad date.
export function parseSapDate(value: unknown): string {
  const s = String(value ?? '').trim();
  if (!s) return '';
  const pad = (n: string | number) => String(n).padStart(2, '0');
  let m: RegExpExecArray | null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if ((m = /^(\d{4})-(\d{2})-(\d{2})[T ]/.exec(s))) return `${m[1]}-${m[2]}-${m[3]}`;
  if ((m = /^(\d{4})(\d{2})(\d{2})$/.exec(s))) return `${m[1]}-${m[2]}-${m[3]}`;
  if ((m = /^(\d{1,2})[./](\d{1,2})[./](\d{4})$/.exec(s))) return `${m[3]}-${pad(m[2])}-${pad(m[1])}`;
  if ((m = /^\/Date\((-?\d+)(?:[+-]\d+)?\)\/$/.exec(s))) return new Date(Number(m[1])).toISOString().slice(0, 10);
  return s;
}

// Function : parseSapAmount
// Purpose  : "1.234,56", "1,234.56", "1234.56", "100-" (SAP trailing minus) -> number.
//            Returns NaN when it cannot be read, so the mapper rejects the row.
export function parseSapAmount(value: unknown): number {
  if (typeof value === 'number') return value;
  let s = String(value ?? '').trim().replace(/[^\d.,-]/g, '');
  if (!s) return NaN;
  let negative = false;
  if (s.endsWith('-')) { negative = true; s = s.slice(0, -1); }
  if (s.startsWith('-')) { negative = true; s = s.slice(1); }
  const lastDot = s.lastIndexOf('.');
  const lastComma = s.lastIndexOf(',');
  if (lastDot >= 0 && lastComma >= 0) {
    // both present: whichever comes last is the decimal separator
    s = lastComma > lastDot ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  } else if (lastComma >= 0) {
    // only commas: "12,5" / "12,50" = decimal, "1,234" / "1,234,567" = thousands
    s = /,\d{1,2}$/.test(s) && s.indexOf(',') === lastComma ? s.replace(',', '.') : s.replace(/,/g, '');
  } else if (lastDot >= 0 && s.indexOf('.') !== lastDot) {
    s = s.replace(/\./g, ''); // "1.234.567" = thousands dots
  }
  const n = Number(s);
  return Number.isFinite(n) ? (negative ? -n : n) : NaN;
}

// ======================================================
// END: Value parsers
// ======================================================

// ======================================================
// START: normalizeSapRecord
// ======================================================

// Function : normalizeSapRecord
// Purpose  : One raw SAP row -> SapRecord (see file header).
export function normalizeSapRecord(raw: Record<string, unknown>, mapping: CodeMapping = loadCodeMapping()): SapRecord {
  const lower: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw ?? {})) lower[k.toLowerCase().replace(/[\s_-]/g, '')] = v;
  const pick = (field: keyof SapRecord): string => {
    for (const alias of ALIASES[field]) {
      const v = lower[alias];
      if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim();
    }
    return '';
  };

  const rawCompany = pick('companyCode');
  const rawClass = pick('assetClass');
  const assetNumber = pick('assetNumber');
  const companyCode = mapping.companyCodes[rawCompany] ?? rawCompany;
  // No document number column? Use company + asset number so duplicate checks still work.
  const documentId = pick('documentId') || (assetNumber ? `${rawCompany || 'SAP'}-${assetNumber}` : '');

  return {
    documentId,
    assetNumber,
    companyCode,
    assetClass: mapping.assetClasses[rawClass] ?? rawClass,
    description: pick('description'),
    acquisitionCost: parseSapAmount(pick('acquisitionCost')),
    capitalizationDate: parseSapDate(pick('capitalizationDate'))
  };
}

// ======================================================
// END: normalizeSapRecord
// ======================================================

// ======================================================
// END OF FILE : sapNormalize.ts
// ======================================================
