// ======================================================
// File Name : BulkImport.jsx
// Purpose   : Page-level component for BulkImport — six cards, one per
//             Lifecycle Event type, each letting you download a CSV
//             template for that event, upload a filled-in CSV, and
//             bulk-post every row in one go. Existing Lifecycle Events
//             page/flow is untouched — this is a new, separate page.
// ======================================================

import { useState } from 'react';
import { lifecycleApi } from '../../api/lifecycle.api';
import { AppLayout } from '../../layout/AppLayout';
import { Pill } from '../../components/ui/ui';
import { Button } from '../../components/ui/Button';
import { FIELD_SCHEMAS } from '../../data/lifecycleFormSchemas';
import { parseCsv, buildTemplateCsv, downloadCsv, rowsToLifecycleRows, findUnmatchedSelectValues } from '../../utils/csv';

// ======================================================
// START: Page Component
// ======================================================

// Same six event types the Lifecycle Events page offers — kept local
// here (rather than fetched) so the six cards render immediately.
// Matches server/src/routes/lifecycle.ts EVENT_TYPES exactly (id + label
// are what the API expects).
const EVENT_TYPES = [
    { id: 'addition', label: 'Addition', description: 'Capitalize new assets into service', icon: '＋', color: 'green' },
    { id: 'adjustment', label: 'Adjustment', description: 'Change cost basis of existing assets', icon: '✎', color: 'blue' },
    { id: 'transfer', label: 'Transfer', description: 'Move assets between org units', icon: '⇄', color: 'teal' },
    { id: 'retirement', label: 'Retirement', description: 'Dispose or write off assets', icon: '⊗', color: 'red' },
    { id: 'reinstatement', label: 'Reinstatement', description: 'Restore previously retired assets', icon: '↺', color: 'purple' },
    { id: 'reclassification', label: 'Reclassification', description: 'Change method, life, or convention', icon: '⇅', color: 'amber' }
];

// ======================================================
// Function : BulkImport
// Purpose  : React component that renders the 'BulkImport' UI
// ======================================================

export function BulkImport() {
    return (<AppLayout active="bulk-import" title="Bulk Import" crumb="Home / Lifecycle Events / Bulk Import">
      <div className="page-header">
        <div>
          <h1>Bulk Import Lifecycle Events</h1>
          <p>Upload a CSV per event type to post many transactions at once, instead of one at a time.</p>
        </div>
      </div>

      <div className="grid grid-2">
        {EVENT_TYPES.map((evt) => (<EventImportCard key={evt.id} evt={evt}/>))}
      </div>
    </AppLayout>);
}

// ======================================================
// Function : EventImportCard
// Purpose  : Self-contained card for one event type — template
//            download, file upload, parsed-row preview, and the
//            "Import All" action + per-row results for that card only.
// ======================================================

function EventImportCard({ evt }) {
    const schema = FIELD_SCHEMAS[evt.id] ?? [];
    const [fileName, setFileName] = useState('');
    const [rows, setRows] = useState([]); // parsed CSV rows (raw, header-keyed)
    const [parseError, setParseError] = useState('');
    const [dropdownWarnings, setDropdownWarnings] = useState([]);
    const [importing, setImporting] = useState(false);
    const [results, setResults] = useState(null); // { posted, failed, items }

    function downloadTemplate() {
        downloadCsv(`${evt.id}-template.csv`, buildTemplateCsv(schema));
    }

    function onFileChange(e) {
        const file = e.target.files?.[0];
        setResults(null);
        setParseError('');
        setRows([]);
        setDropdownWarnings([]);
        if (!file) return;
        setFileName(file.name);
        file.text().then((text) => {
            try {
                const expectedHeaders = ['assetNumber', ...schema.map((f) => f.key)];
                const { rows: parsed, headerWasMissing } = parseCsv(text, expectedHeaders);
                if (parsed.length === 0) { setParseError('No data rows found in this file.'); return; }
                const missingAsset = parsed.filter((r) => !r.assetNumber?.trim()).length;
                if (missingAsset > 0) { setParseError(`${missingAsset} row(s) are missing an Asset Number.`); }
                else if (headerWasMissing) {
                    setParseError(`Heads up: this file had no header row, so columns were matched by position (assetNumber, ${schema.map((f) => f.key).join(', ')}). Double-check the preview below before importing.`);
                }
                setDropdownWarnings(findUnmatchedSelectValues(parsed, schema));
                setRows(parsed);
            } catch {
                setParseError('Could not read this file as CSV.');
            }
        });
    }

    async function importAll() {
        setImporting(true);
        setResults(null);
        try {
            const lifecycleRows = rowsToLifecycleRows(rows, schema);
            const res = await lifecycleApi.bulkImport({ eventType: evt.label, rows: lifecycleRows });
            const posted = res.results.filter((r) => r.status === 'posted').length;
            const failed = res.results.length - posted;
            setResults({ posted, failed, items: res.results });
        } catch (err) {
            setParseError(err.message || 'Bulk import failed.');
        } finally {
            setImporting(false);
        }
    }

    function reset() {
        setFileName('');
        setRows([]);
        setParseError('');
        setDropdownWarnings([]);
        setResults(null);
    }

    return (<div className="card card-pad">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`ei ico-${evt.color}`}>{evt.icon}</div>
          <div>
            <h3 style={{ fontSize: 14, margin: 0 }}>{evt.label}</h3>
            <p className="text-muted text-sm" style={{ margin: 0 }}>{evt.description}</p>
          </div>
        </div>
        {results && <Pill tone={results.failed > 0 ? 'amber' : 'green'}>{results.posted} posted{results.failed > 0 ? `, ${results.failed} failed` : ''}</Pill>}
      </div>

      <div className="flex gap-2 mt-2 mb-2">
        <Button variant="ghost" size="sm" onClick={downloadTemplate}>Download CSV Template</Button>
        {(fileName || rows.length > 0 || results) && (<Button variant="ghost" size="sm" onClick={reset}>Reset</Button>)}
      </div>

      <div className="form-row">
        <label htmlFor={`file-${evt.id}`}>Upload filled-in CSV</label>
        <input id={`file-${evt.id}`} type="file" accept=".csv,text/csv" onChange={onFileChange}/>
        {fileName && <div className="hint">{fileName}</div>}
      </div>

      {parseError && <p className="text-sm" style={{ color: 'var(--danger, #dc2626)' }}>{parseError}</p>}

      {dropdownWarnings.length > 0 && !results && (<div className="mt-1">
          <p className="text-sm" style={{ color: 'var(--warning, #b45309)', fontWeight: 700 }}>These values don't match any dropdown option — check spelling against the form:</p>
          <ul className="text-sm text-muted">
            {dropdownWarnings.slice(0, 6).map((w, i) => (<li key={i}>Row {w.row} ({w.assetNumber || 'no asset #'}) — {w.field}: "{w.value}"</li>))}
          </ul>
          {dropdownWarnings.length > 6 && <p className="text-sm text-muted">…and {dropdownWarnings.length - 6} more.</p>}
        </div>)}

      {rows.length > 0 && !results && (<>
          <p className="text-sm text-muted mt-2">{rows.length} row(s) ready to import.</p>
          <div style={{ maxHeight: 160, overflow: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
            <table className="table" style={{ fontSize: 12 }}>
              <thead>
                <tr>{Object.keys(rows[0]).map((h) => (<th key={h}>{h}</th>))}</tr>
              </thead>
              <tbody>
                {rows.slice(0, 5).map((r, i) => (<tr key={i}>{Object.keys(rows[0]).map((h) => (<td key={h}>{r[h]}</td>))}</tr>))}
              </tbody>
            </table>
          </div>
          {rows.length > 5 && <p className="text-sm text-muted">…and {rows.length - 5} more.</p>}
          <Button variant="primary" size="sm" className="mt-2" onClick={importAll} disabled={importing}>
            {importing ? 'Importing…' : `Import All (${rows.length})`}
          </Button>
        </>)}

      {results && results.failed > 0 && (<div className="mt-2">
          <p className="text-sm" style={{ fontWeight: 700 }}>Failed rows:</p>
          <ul className="text-sm text-muted">
            {results.items.filter((r) => r.status !== 'posted').map((r, i) => (<li key={i}>{r.assetNumber || '(no asset #)'}: {r.error}</li>))}
          </ul>
        </div>)}
    </div>);
}

// ======================================================
// END: BulkImport
// ======================================================

// ======================================================
// END: Page Component
// ======================================================
