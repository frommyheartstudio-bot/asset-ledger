// ======================================================
// File Name : useAssetClasses.js
// Purpose   : Every "Asset Class" / "Asset Type" dropdown in the app
//             reads its options from the asset_classes table in Postgres
//             through here, so Configuration → Asset Classes is the
//             single source. Fetched once per page load and shared.
//               useAssetClasses()    -> ordered list of names
//               useAssetClassRows()  -> full rows (name, propertyType,
//                                       method, ratePct, convention, life)
// ======================================================

import { useEffect, useMemo, useState } from 'react';
import { configApi } from '../api/config.api';

let cachedRows = null;
let inflight = null;

function fetchOnce() {
    return configApi.getAssetClasses().then((rows) => {
        if (!Array.isArray(rows) || rows.length === 0) throw new Error('no asset classes returned');
        return rows;
    });
}

// Retries a few times (the server can still be creating/seeding the table
// on the very first request) and never caches a failure or an empty list,
// so a bad first attempt can't leave every dropdown blank until a reload.
function load() {
    if (cachedRows) return Promise.resolve(cachedRows);
    if (!inflight) {
        inflight = (async () => {
            for (let attempt = 0; attempt < 4; attempt++) {
                try {
                    cachedRows = await fetchOnce();
                    return cachedRows;
                } catch {
                    await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
                }
            }
            return [];
        })().finally(() => { inflight = null; });
    }
    return inflight;
}

/** Full asset class rows from the database, in table order ([] until loaded). */
export function useAssetClassRows() {
    const [rows, setRows] = useState(cachedRows ?? []);
    useEffect(() => {
        let alive = true;
        load().then((r) => { if (alive) setRows(r); });
        return () => { alive = false; };
    }, []);
    return rows;
}

/** Ordered list of asset class names from the database ([] until loaded). */
export function useAssetClasses() {
    const rows = useAssetClassRows();
    // Names are the value stored on an asset; dedupe defensively.
    return useMemo(() => Array.from(new Set(rows.map((r) => r.name))), [rows]);
}

/** "7 years 0 months" -> 84 (months). Returns null if it can't be parsed. */
export function lifeToMonths(life) {
    const m = /(\d+)\s*years?\s*(\d+)\s*months?/i.exec(life || '');
    return m ? Number(m[1]) * 12 + Number(m[2]) : null;
}

/** DB convention code ("AHY - Apply Mid-Quarter test (use HY)") -> the
 *  option label used by the Lifecycle form's Convention dropdown. */
export function conventionToOption(convention) {
    const code = String(convention || '').split(' - ')[0].trim().toUpperCase();
    if (code === 'AHY' || code === 'HY') return 'HY (Half-Year)';
    if (code === 'MM') return 'Mid-Month';
    if (code === 'FM') return 'Full-Month';
    return null; // N/A etc. — leave whatever is already selected
}
