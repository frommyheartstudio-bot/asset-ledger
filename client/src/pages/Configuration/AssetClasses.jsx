// ======================================================
// File Name : AssetClasses.jsx
// Purpose   : Page-level component for the IRS Publication 946
//             Appendix B, Table B-1 asset class reference
// ======================================================

import { useBooks } from '../../hooks/useBooks';
import { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '../../layout/AppLayout';
import { Button } from '../../components/ui/Button';
import { Pagination, usePagination } from '../../components/ui/Pagination';
import { configApi } from '../../api/config.api';
import { downloadCsv } from '../../utils/csv';
import { getActiveAssetClassTable, invalidateCustomAssetClasses, setActiveAssetClassTable } from '../../hooks/useAssetClasses';

// ======================================================
// START: Page Component
// ======================================================

// ======================================================
// Function : exportAssetClassesCsv
// Purpose  : Builds the asset-class CSV (same 6 columns for the default
//            and the custom table) and downloads it via the shared
//            downloadCsv helper.
// ======================================================

function exportAssetClassesCsv(rows, filename) {
    const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const header = ['Name', 'Property Type', 'Method', 'Rate %', 'Convention', 'Life'];
    const lines = [header.join(',')];
    rows.forEach((r) => lines.push([r.name, r.propertyType, r.method, r.ratePct, r.convention, r.life].map(q).join(',')));
    downloadCsv(filename, lines.join('\n'));
}


// ======================================================
// Customize Table helpers
// ======================================================


// ======================================================
// Function : unique
// Purpose  : Returns the list without empty values or duplicates.
// ======================================================
function unique(list) {
    return Array.from(new Set(list.filter(Boolean)));
}

// ======================================================
// Function : CustomTable
// Purpose  : "Customize Table" - 3 rows, same columns as the default
//            table. The 3 custom rows come first (Name = Book + asset
//            type, e.g. GAAP - Acquisition, every column editable),
//            followed by all the default table rows (read-only).
// ======================================================

function CustomTable({ defaultRows, query }) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [draft, setDraft] = useState(null);
    const [busy, setBusy] = useState(false);
    const [saveError, setSaveError] = useState('');
    // Every maintained book is selectable on a rule (not just the 3 that had rows).
    const { names: bookNames } = useBooks();

    useEffect(() => {
        configApi.getCustomAssetClasses()
            .then((data) => setRows(data))
            .catch(() => setError('Could not load the customize table from the database.'))
            .finally(() => setLoading(false));
    }, []);

    const opts = useMemo(() => {
        const all = [...defaultRows, ...rows];
        return {
            books: unique([...bookNames, ...rows.map((r) => r.book)]),
            assetTypes: unique(defaultRows.map((r) => r.name)),
            propertyTypes: unique(all.map((r) => r.propertyType)),
            methods: unique(all.map((r) => r.method)),
            conventions: unique(all.map((r) => r.convention)),
        };
    }, [defaultRows, rows, bookNames]);

    // Customize Table = the editable custom rows first, then the default table rows after them.
    const match = (r) => {
        const q = query.trim().toLowerCase();
        return !q || [r.name, r.propertyType, r.method, r.convention].some((v) => String(v).toLowerCase().includes(q));
    };
    const filtered = useMemo(() => rows.filter(match), [query, rows]);
    const filteredDefaults = useMemo(() => defaultRows.filter(match), [query, defaultRows]);
    const combined = useMemo(() => [
        ...filtered.map((row) => ({ custom: true, row })),
        ...filteredDefaults.map((row) => ({ custom: false, row })),
    ], [filtered, filteredDefaults]);
    const pg = usePagination(combined);

    const startEdit = (row) => {
        const m = /(\d+)\s*years?\s*(\d+)\s*months?/i.exec(row.life || '');
        setSaveError('');
        setEditingId(row.id);
        setDraft({ ...row, lifeYears: m ? m[1] : '0', lifeMonths: m ? m[2] : '0' });
    };
    // "+ Add Rule": a blank draft row at the top of the table. Saving it creates a
    // new rule for that Book + asset type (until a rule exists the book mirrors Federal Tax).
    const startAdd = () => {
        setSaveError('');
        setEditingId('new');
        setDraft({
            book: bookNames.find((b) => b !== 'Federal Tax') ?? bookNames[0] ?? 'GAAP',
            assetType: opts.assetTypes[0] ?? '',
            propertyType: opts.propertyTypes[0] ?? '',
            method: opts.methods[0] ?? '',
            ratePct: '100',
            convention: opts.conventions[0] ?? '',
            lifeYears: '5',
            lifeMonths: '0'
        });
    };
    const cancelEdit = () => { setEditingId(null); setDraft(null); setSaveError(''); };
    const removeRow = async (row) => {
        if (!window.confirm(`Delete the rule "${row.name}"? ${row.book} will go back to mirroring Federal Tax for that asset class.`)) return;
        setBusy(true);
        setSaveError('');
        try {
            await configApi.deleteCustomAssetClass(row.id);
            setRows((rs) => rs.filter((r) => r.id !== row.id));
            invalidateCustomAssetClasses();
        } catch (e) {
            setSaveError(e.message || 'Could not delete the row.');
        } finally { setBusy(false); }
    };
    const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));

    const save = async () => {
        const { id, name: _name, lifeYears, lifeMonths, ...rest } = draft;
        const payload = { ...rest, ratePct: String(rest.ratePct).trim(), life: `${Number(lifeYears) || 0} years ${Number(lifeMonths) || 0} months` };
        setBusy(true);
        setSaveError('');
        try {
            if (editingId === 'new') {
                const created = await configApi.createCustomAssetClass(payload);
                setRows((rs) => [...rs, created]);
            } else {
                const updated = await configApi.updateCustomAssetClass(id, payload);
                setRows((rs) => rs.map((r) => (r.id === id ? updated : r)));
            }
            invalidateCustomAssetClasses();
            cancelEdit();
        } catch (e) {
            setSaveError(e.message || 'Could not save the row.');
        } finally { setBusy(false); }
    };

    const sel = (key, list) => (<select className="btn btn-ghost" value={draft[key]} onChange={(e) => set(key, e.target.value)}>
        {unique([...list, draft[key]]).map((o) => <option key={o} value={o}>{o}</option>)}
      </select>);

    const editRow = (key) => (<tr key={key}>
                  <td style={{ whiteSpace: 'nowrap' }}>{sel('book', opts.books)} {sel('assetType', opts.assetTypes)}</td>
                  <td>{sel('propertyType', opts.propertyTypes)}</td>
                  <td>{sel('method', opts.methods)}</td>
                  <td className="num"><input className="btn btn-ghost" style={{ width: 70, textAlign: 'right' }} value={draft.ratePct} onChange={(e) => set('ratePct', e.target.value)}/></td>
                  <td>{sel('convention', opts.conventions)}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <input className="btn btn-ghost" type="number" min="0" style={{ width: 56 }} value={draft.lifeYears} onChange={(e) => set('lifeYears', e.target.value)}/> yrs{' '}
                    <input className="btn btn-ghost" type="number" min="0" max="11" style={{ width: 56 }} value={draft.lifeMonths} onChange={(e) => set('lifeMonths', e.target.value)}/> mo
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <Button size="sm" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>{' '}
                    <Button size="sm" variant="ghost" onClick={cancelEdit} disabled={busy}>Cancel</Button>
                  </td>
                </tr>);

    return (<div className="card">
      <div className="card-head" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h3>Customize Table</h3>
        <Button size="sm" onClick={startAdd} disabled={editingId !== null || busy}>+ Add Rule</Button>
        <Button variant="ghost" size="sm" onClick={() => exportAssetClassesCsv([...filtered, ...filteredDefaults], 'asset_classes_custom.csv')} style={{ marginLeft: 'auto' }}>Export CSV</Button>
      </div>
      {saveError && <div className="card-pad text-sm" style={{ color: 'var(--danger, #b91c1c)' }}>{saveError}</div>}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Property Type</th>
              <th>Method</th>
              <th className="num">Rate %</th>
              <th>Convention</th>
              <th>Life</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="text-muted">Loading…</td></tr>}
            {!loading && error && <tr><td colSpan={7} className="text-muted">{error}</td></tr>}
            {editingId === 'new' && draft && editRow('new')}
            {pg.pageItems.filter((i) => i.custom).map(({ row }) => (editingId === row.id && draft
                ? editRow(row.id)
                : (<tr key={row.id}>
                  <td className="mono">{row.name}</td>
                  <td className="text-sm">{row.propertyType}</td>
                  <td className="text-sm">{row.method}</td>
                  <td className="num">{row.ratePct}</td>
                  <td className="text-sm">{row.convention}</td>
                  <td>{row.life}</td>
                  <td style={{ whiteSpace: 'nowrap' }}><Button size="sm" variant="ghost" onClick={() => startEdit(row)} disabled={editingId !== null || busy}>Edit</Button>{' '}<Button size="sm" variant="ghost" onClick={() => removeRow(row)} disabled={editingId !== null || busy}>Delete</Button></td>
                </tr>)))}
            {!loading && !error && pg.pageItems.filter((i) => !i.custom).map(({ row }, i) => (<tr key={`default-${row.name}-${i}`}>
                  <td className="mono">{row.name}</td>
                  <td className="text-sm">{row.propertyType}</td>
                  <td className="text-sm">{row.method}</td>
                  <td className="num">{row.ratePct}</td>
                  <td className="text-sm">{row.convention}</td>
                  <td>{row.life}</td>
                  <td></td>
                </tr>))}
          </tbody>
        </table>
      </div>
      <Pagination {...pg.pager}/>
    </div>);
}

// ======================================================
// END: CustomTable
// ======================================================

// ======================================================
// Function : AssetClasses
// Purpose  : React component that renders the 'Asset Classes' UI
// ======================================================

export function AssetClasses() {
    const [tab, setTab] = useState(getActiveAssetClassTable);
    const [query, setQuery] = useState('');
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        configApi.getAssetClasses()
            .then((data) => setRows(data))
            .catch(() => setError('Could not load asset classes from the database.'))
            .finally(() => setLoading(false));
    }, []);
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter((r) => r.name.toLowerCase().includes(q)
            || r.propertyType.toLowerCase().includes(q)
            || r.method.toLowerCase().includes(q)
            || r.convention.toLowerCase().includes(q));
    }, [query, rows]);

    const defaultPg = usePagination(filtered);

    return (<AppLayout active="assetClasses" title="Asset Classes" crumb="Home / Configuration / Asset Classes">
      <div className="page-header">
        <div>
          <h1>Asset Classes</h1>
          <p>Name, property type, depreciation method, rate, convention, and life for every asset type on the book</p>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-pad flex items-center gap-4" style={{ flexWrap: 'wrap' }}>
          <div style={{ minWidth: 200 }}>
            <div className="hint" style={{ marginTop: 0, marginBottom: 4 }}>Table (used by Asset Type dropdowns)</div>
            <select
              className="btn btn-ghost"
              style={{ width: '100%', textAlign: 'left' }}
              value={tab}
              onChange={(e) => { setTab(e.target.value); setActiveAssetClassTable(e.target.value); setQuery(''); }}
            >
              <option value="default">Default Table</option>
              <option value="custom">Customize Table</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div className="hint" style={{ marginTop: 0, marginBottom: 4 }}>Search</div>
            <input
              className="btn btn-ghost"
              style={{ width: '100%', textAlign: 'left' }}
              placeholder="Search name, property type, method, or convention..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {tab === 'default' && (<Button variant="ghost" onClick={() => exportAssetClassesCsv(filtered, 'asset_classes.csv')} style={{ marginLeft: 'auto' }}>
            Export CSV
          </Button>)}
        </div>
      </div>

      {tab === 'custom' && <CustomTable defaultRows={rows} query={query}/>}

      {tab === 'default' && <div className="card">
        <div className="card-head">
          <h3>Default Table</h3>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Property Type</th>
                <th>Method</th>
                <th className="num">Rate %</th>
                <th>Convention</th>
                <th>Life</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} className="text-muted">Loading…</td></tr>}
              {!loading && error && <tr><td colSpan={6} className="text-muted">{error}</td></tr>}
              {defaultPg.pageItems.map((row, i) => (<tr key={`${row.name}-${i}`}>
                  <td className="mono">{row.name}</td>
                  <td className="text-sm">{row.propertyType}</td>
                  <td className="text-sm">{row.method}</td>
                  <td className="num">{row.ratePct}</td>
                  <td className="text-sm">{row.convention}</td>
                  <td>{row.life}</td>
                </tr>))}
            </tbody>
          </table>
        </div>
        <Pagination {...defaultPg.pager}/>
      </div>}
    </AppLayout>);
}

// ======================================================
// END: AssetClasses
// ======================================================

// ======================================================
// END: Page Component
// ======================================================

// ======================================================
// END OF FILE : AssetClasses.jsx
// ======================================================
