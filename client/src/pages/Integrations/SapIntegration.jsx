// ======================================================
// File Name : SapIntegration.jsx
// Purpose   : Integrations -> SAP. PULL-ONLY flow: click "Fetch from SAP",
//             preview the records (new / already imported / invalid), tick
//             the ones you want and "Download in our format" — a Master Data
//             Set CSV (same columns as Bulk Import). Nothing is posted to the
//             ledger from this page; upload the CSV in Bulk Import to post.
// ======================================================

import { useEffect, useState } from 'react';
import { integrationsApi } from '../../api/integrations.api';
import { AppLayout } from '../../layout/AppLayout';
import { Pill } from '../../components/ui/ui';
import { Button } from '../../components/ui/Button';
import { buildUnifiedRowsCsv, downloadCsv } from '../../utils/csv';
import { useFormOptions } from '../../hooks/useFormOptions';

const STATUS = {
    new: { tone: 'green', label: 'New' },
    imported: { tone: 'gray', label: 'Already imported' },
    invalid: { tone: 'red', label: 'Needs attention' }
};

const money = (n) => Number(n).toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function SapIntegration() {
    useFormOptions();

    const [mode, setMode] = useState('');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [records, setRecords] = useState(null); // null = not fetched yet
    const [selected, setSelected] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState('');
    const [outcome, setOutcome] = useState(null); // download result: { count, skipped }

    useEffect(() => {
        integrationsApi.sapStatus().then((r) => setMode(r.mode)).catch(() => { /* badge just stays hidden */ });
    }, []);

    async function fetchRecords(keepOutcome = false) {
        setLoading(true);
        setError('');
        if (!keepOutcome) setOutcome(null);
        try {
            const res = await integrationsApi.sapFetch({ from: from || undefined, to: to || undefined });
            setMode(res.mode);
            setRecords(res.records);
            // pre-select everything that can be imported
            setSelected(new Set(res.records.filter((r) => r.status === 'new').map((r) => r.documentId)));
        } catch (err) {
            setError(err.message || 'Fetch failed.');
        } finally {
            setLoading(false);
        }
    }

    // Pull-only: server re-reads SAP, converts to our format, we build the CSV here.
    async function downloadSelected() {
        setDownloading(true);
        setError('');
        setOutcome(null);
        try {
            const res = await integrationsApi.sapConvert({ documentIds: [...selected], from: from || undefined, to: to || undefined });
            setOutcome({ count: res.rows.length, skipped: res.skipped });
            if (res.rows.length > 0) {
                // BOM so Excel shows the en dash in "Q1 (Jan–Mar)" correctly
                downloadCsv(`sap-master-data-set-${new Date().toISOString().slice(0, 10)}.csv`, '\uFEFF' + buildUnifiedRowsCsv(res.rows));
            }
        } catch (err) {
            setError(err.message || 'Download failed.');
        } finally {
            setDownloading(false);
        }
    }

    const importable = (records ?? []).filter((r) => r.status === 'new');
    const allSelected = importable.length > 0 && importable.every((r) => selected.has(r.documentId));

    function toggle(id) {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }
    const toggleAll = () => setSelected(allSelected ? new Set() : new Set(importable.map((r) => r.documentId)));

    return (<AppLayout active="sap" title="SAP Integration" crumb="Home / Integrations / SAP">
      <div className="page-header">
        <div>
          <h1>SAP Integration {mode && <Pill tone={mode === 'live' ? 'green' : 'amber'}>{mode === 'live' ? 'Live SAP' : 'Mock data'}</Pill>}</h1>
          <p>Fetch asset acquisitions from SAP (read-only), review them, and download the ones you want as a CSV in our Bulk Import format. Nothing is posted from this page.</p>
        </div>
      </div>

      {mode === 'mock' && (<div className="card card-pad" style={{ marginBottom: 16 }}>
          <p className="text-sm" style={{ margin: 0 }}>
            <strong>Showing built-in sample data.</strong> Set <code>SAP_BASE_URL</code> in <code>server/.env</code> to connect a real SAP system. 
          </p>
        </div>)}

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div className="flex gap-2" style={{ alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-row" style={{ margin: 0 }}>
            <label htmlFor="sap-from">Capitalized from</label>
            <input id="sap-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)}/>
          </div>
          <div className="form-row" style={{ margin: 0 }}>
            <label htmlFor="sap-to">Capitalized to</label>
            <input id="sap-to" type="date" value={to} onChange={(e) => setTo(e.target.value)}/>
          </div>
          <Button onClick={() => fetchRecords()} disabled={loading || downloading}>{loading ? 'Fetching…' : 'Fetch from SAP'}</Button>
        </div>
        {error && <p className="text-sm" style={{ color: 'var(--danger, #dc2626)', marginBottom: 0 }}>{error}</p>}
      </div>

      {records && (<div className="card card-pad">
          <div className="flex items-center justify-between mb-2" style={{ flexWrap: 'wrap', gap: 8 }}>
            <h3 style={{ fontSize: 14, margin: 0 }}>
              {records.length} record(s) from SAP — {importable.length} ready to import
            </h3>
            <Button onClick={downloadSelected} disabled={downloading || loading || selected.size === 0}>
              {downloading ? 'Preparing…' : `Download in our format (${selected.size})`}
            </Button>
          </div>

          {outcome && (<p className="text-sm" style={{ margin: '0 0 8px' }}>
              <Pill tone={outcome.skipped.length > 0 ? 'amber' : 'green'}>Download ready</Pill>{' '}
              {outcome.count} row(s) converted, {outcome.skipped.length} skipped. Upload the file in Bulk Import → Master Data Set to post it.
              {outcome.skipped.map((r) => (<span key={r.documentId} className="text-muted"> · {r.assetNumber || r.documentId}: {r.error}</span>))}
            </p>)}

          {records.length === 0 ? (<p className="text-muted text-sm">SAP returned no records for this period.</p>) : (<div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th><input type="checkbox" checked={allSelected} onChange={toggleAll} disabled={importable.length === 0} aria-label="Select all"/></th>
                    <th>SAP Doc</th><th>Asset #</th><th>Company</th><th>Asset Class</th><th>Description</th>
                    <th className="text-right">Cost</th><th>Capitalized</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (<tr key={r.documentId}>
                      <td><input type="checkbox" disabled={r.status !== 'new'} checked={selected.has(r.documentId)} onChange={() => toggle(r.documentId)} aria-label={`Select ${r.assetNumber}`}/></td>
                      <td className="mono">{r.documentId}</td>
                      <td className="mono">{r.assetNumber}</td>
                      <td>{r.companyCode}</td>
                      <td>{r.assetClass}</td>
                      <td>{r.description}</td>
                      <td className="text-right">{money(r.acquisitionCost)}</td>
                      <td>{r.capitalizationDate}</td>
                      <td>
                        <Pill tone={STATUS[r.status].tone}>{STATUS[r.status].label}</Pill>
                        {r.error && <div className="text-sm text-muted">{r.error}</div>}
                      </td>
                    </tr>))}
                </tbody>
              </table>
            </div>)}
        </div>)}
    </AppLayout>);
}

// ======================================================
// END OF FILE : SapIntegration.jsx
// ======================================================
