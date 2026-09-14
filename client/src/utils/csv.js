// ======================================================
// File Name : csv.js
// Purpose   : Minimal CSV parse/build helpers for Bulk Import
// ======================================================

// ======================================================
// Function : parseCsv
// Purpose  : Parses CSV text into an array of header-keyed objects.
//            Handles quoted fields (so values containing commas are
//            safe), but assumes one record per line like every export
//            from Excel/Sheets already produces.
// ======================================================

export function parseCsv(text, expectedHeaders = null) {
    const lines = text.replace(/\r\n/g, '\n').split('\n').filter((l) => l.trim().length > 0);
    if (lines.length === 0) return { headers: [], rows: [] };

    const parseLine = (line) => {
        const cells = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (inQuotes) {
                if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
                else if (ch === '"') { inQuotes = false; }
                else { cur += ch; }
            } else if (ch === '"') {
                inQuotes = true;
            } else if (ch === ',') {
                cells.push(cur);
                cur = '';
            } else {
                cur += ch;
            }
        }
        cells.push(cur);
        return cells.map((c) => c.trim());
    };

    const firstLineCells = parseLine(lines[0]);
    // A real header row's first cell should read "assetNumber" (case-insensitive).
    // If it doesn't — e.g. the person deleted the header row before filling in
    // data, or pasted straight from a sheet without one — line 1 is actually
    // data, not a header. Fall back to the caller-supplied expected column
    // order instead of eating that first row as a bogus header.
    const looksLikeHeader = firstLineCells[0]?.trim().toLowerCase() === 'assetnumber';

    let headers;
    let dataLines;
    if (looksLikeHeader) {
        headers = firstLineCells;
        dataLines = lines.slice(1);
    } else if (expectedHeaders) {
        headers = expectedHeaders;
        dataLines = lines; // no header consumed — every line is data
    } else {
        headers = firstLineCells;
        dataLines = lines.slice(1);
    }

    const rows = dataLines.map((line) => {
        const cells = parseLine(line);
        const obj = {};
        headers.forEach((h, i) => { obj[h] = cells[i] ?? ''; });
        return obj;
    });
    return { headers, rows, headerWasMissing: !looksLikeHeader && !!expectedHeaders };
}

// ======================================================
// Function : buildTemplateCsv
// Purpose  : Builds a downloadable CSV template — header row of
//            "assetNumber" + every field key for the given event's
//            schema — so a filled-in row maps 1:1 onto that event's
//            FIELD_SCHEMAS entry.
// ======================================================

export function buildTemplateCsv(schema) {
    const headers = ['assetNumber', ...schema.map((f) => f.key)];
    return headers.join(',') + '\n';
}

// ======================================================
// Function : downloadCsv
// Purpose  : Triggers a browser download of CSV text as a file.
// ======================================================

export function downloadCsv(filename, text) {
    const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

// ======================================================
// Function : rowsToLifecycleRows
// Purpose  : Converts parsed CSV rows into the { assetNumber, fields }
//            shape the /lifecycle/bulk-import endpoint expects, coercing
//            number/checkbox fields per the event's schema so the
//            calculator gets the same types the manual form would send.
// ======================================================

export function rowsToLifecycleRows(csvRows, schema) {
    const fieldByKey = Object.fromEntries(schema.map((f) => [f.key, f]));
    return csvRows.map((row) => {
        const fields = {};
        for (const [key, rawValue] of Object.entries(row)) {
            if (key === 'assetNumber') continue;
            const def = fieldByKey[key];
            if (!def) continue; // ignore unknown/extra columns
            const val = String(rawValue ?? '').trim();

            if (def.type === 'number') {
                // Tolerate "$", "%", and thousands-separator commas people
                // naturally type in a spreadsheet (e.g. "100%", "1,200,000").
                const cleaned = val.replace(/[$,%\s]/g, '');
                fields[key] = cleaned === '' ? '' : Number(cleaned);
            } else if (def.type === 'checkbox') {
                fields[key] = /^(true|1|yes|y)$/i.test(val);
            } else if (def.type === 'select' && Array.isArray(def.options)) {
                // Dropdown fields need the exact option string the calculator
                // matches on (e.g. "HY (Half-Year)", "Q1 (Jan–Mar)"). Accept a
                // case-insensitive match, a prefix match (e.g. "hy" ->
                // "HY (Half-Year)"), or — since people typing into a
                // spreadsheet naturally drop spaces/punctuation, e.g.
                // "Q1(jan-mar)" vs "Q1 (Jan–Mar)" — a match with spacing and
                // punctuation stripped from both sides, so the CSV doesn't
                // have to be typed character-for-character.
                const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
                const exact = def.options.find((o) => o.toLowerCase() === val.toLowerCase());
                const byPrefix = !exact && def.options.find((o) => o.toLowerCase().startsWith(val.toLowerCase()));
                const byNorm = !exact && !byPrefix && def.options.find((o) => norm(o).startsWith(norm(val)) && norm(val).length > 0);
                fields[key] = exact || byPrefix || byNorm || val;
            } else {
                fields[key] = val;
            }
        }
        return { assetNumber: row.assetNumber ?? '', fields };
    });
}

// ======================================================
// Function : findUnmatchedSelectValues
// Purpose  : Scans parsed CSV rows for select-type fields (Asset Type,
//            Convention, Quarter, etc.) whose value couldn't be matched
//            to any dropdown option — these would silently produce a
//            wrong/failed calculation server-side, so the Bulk Import
//            card surfaces them as a warning *before* Import is clicked.
// ======================================================

export function findUnmatchedSelectValues(csvRows, schema) {
    const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const selectFields = schema.filter((f) => f.type === 'select' && Array.isArray(f.options));
    const problems = [];
    csvRows.forEach((row, i) => {
        selectFields.forEach((def) => {
            const val = String(row[def.key] ?? '').trim();
            if (!val) return;
            const matched = def.options.some((o) => o.toLowerCase() === val.toLowerCase()
                || o.toLowerCase().startsWith(val.toLowerCase())
                || (norm(o).startsWith(norm(val)) && norm(val).length > 0));
            if (!matched) problems.push({ row: i + 1, assetNumber: row.assetNumber, field: def.label, value: val });
        });
    });
    return problems;
}

// ======================================================
// END: csv.js
// ======================================================
