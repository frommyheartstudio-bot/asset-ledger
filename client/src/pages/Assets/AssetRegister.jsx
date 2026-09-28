// ======================================================
// File Name : AssetRegister.jsx
// Purpose   : Page-level component for AssetRegister
// ======================================================

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '../../layout/AppLayout';
import { Button } from '../../components/ui/Button';
import { Input, MultiSelect } from '../../components/ui/Input';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { AssetTable } from '../../components/asset/AssetTable';
import { useAssets } from '../../hooks/useAssets';
import { useAssetClasses } from '../../hooks/useAssetClasses';
import { useAuth } from '../../context/AuthContext';

// ======================================================
// START: Page Component
// ======================================================

const COMPANY_OPTIONS = ['5B', 'R9', '2D', 'GD'];
const STATUS_OPTIONS = ['Active', 'Retired', 'Transferred', 'Fully Depreciated'];
const METHOD_OPTIONS = ['MACRS', 'MACRS ADS', 'Straight-Line'];

// ======================================================
// Function : downloadCsv
// Purpose  : Builds a CSV file from asset rows and triggers a browser
//            download — no server round-trip needed since the rows are
//            already loaded on the page (selected rows, or all filtered
//            rows when nothing is checked).
// ======================================================

function downloadCsv(assets) {
    const headers = ['Asset #', 'Description', 'Class', 'Co.', 'Cost', 'Accum. Depr', 'NBV', 'Method', 'Status'];
    const escape = (value) => {
        const s = String(value ?? '');
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = assets.map((a) => [
        a.assetNumber, a.description, a.assetClass, a.company, a.cost, a.accumDepreciation, a.nbv, a.method, a.status
    ].map(escape).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `asset-register-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

// ======================================================
// Function : AssetRegister
// Purpose  : React component that renders the 'AssetRegister' UI
// ======================================================

export function AssetRegister() {
    const assetClassNames = useAssetClasses();
    const [searchParams, setSearchParams] = useSearchParams();
    // Empty array == "All" for each filter — MultiSelect lets the person
    // tick any combination of Asset Class / Company / Status / Method.
    const [assetClass, setAssetClass] = useState([]);
    const [company, setCompany] = useState([]);
    const [status, setStatus] = useState([]);
    const [method, setMethod] = useState([]);
    const [selectedKeys, setSelectedKeys] = useState(() => new Set());
    const navigate = useNavigate();
    const { hasEdit } = useAuth();
    const canAdd = hasEdit('assets');

    // The URL is the source of truth for the *applied* search text (so the
    // header search box, which navigates to /assets?q=..., keeps working).
    // The box on this page edits a draft; nothing is applied — not the
    // search text, not the four dropdown filters — until the Search button
    // is clicked (or Enter is pressed in the search box).
    const query = searchParams.get('q') ?? '';
    const [draftQuery, setDraftQuery] = useState(query);
    useEffect(() => { setDraftQuery(query); }, [query]);

    // Dropdown filters actually in effect (copied from the draft on Search).
    const [applied, setApplied] = useState({ assetClass: [], company: [], status: [], method: [] });
    const handleSearch = () => {
        const q = draftQuery.trim();
        setSearchParams(q ? { q } : {}, { replace: true });
        setApplied({ assetClass: [...assetClass], company: [...company], status: [...status], method: [...method] });
    };

    // Class/Company/Status/Method filtering happens client-side below so
    // several values can be picked at once — the API only understands one
    // value per filter. The search text still filters server-side.
    const { items, total, loading, error, reload } = useAssets({ q: query || undefined });

    const filteredItems = useMemo(() => {
        return items.filter((a) => (applied.assetClass.length === 0 || applied.assetClass.includes(a.assetClass))
            && (applied.company.length === 0 || applied.company.includes(a.company))
            && (applied.status.length === 0 || applied.status.includes(a.status))
            && (applied.method.length === 0 || applied.method.includes(a.method)));
    }, [items, applied]);

    // A row selected under one filter shouldn't silently linger once the
    // filters change and it's no longer even on screen.
    useEffect(() => {
        setSelectedKeys(new Set());
    }, [query, applied]);

    // Client-side pagination over the filtered list. Page resets to 1
    // whenever the applied filters/search or the page size change.
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);
    useEffect(() => { setPage(1); }, [query, applied, pageSize]);
    const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const pageStart = (currentPage - 1) * pageSize;
    const pageItems = useMemo(() => filteredItems.slice(pageStart, pageStart + pageSize), [filteredItems, pageStart, pageSize]);

    // Header checkbox works on the rows of the current page; ticked rows
    // stay ticked while moving between pages (Export CSV uses all of them).
    const allSelected = pageItems.length > 0 && pageItems.every((a) => selectedKeys.has(a.assetNumber));
    const someSelected = pageItems.some((a) => selectedKeys.has(a.assetNumber)) && !allSelected;
    const selection = {
        selectedKeys,
        allSelected,
        someSelected,
        onToggleRow: (key) => setSelectedKeys((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key); else next.add(key);
            return next;
        }),
        onToggleAll: () => setSelectedKeys((prev) => {
            const next = new Set(prev);
            pageItems.forEach((a) => { if (allSelected) next.delete(a.assetNumber); else next.add(a.assetNumber); });
            return next;
        })
    };

    const handleExport = () => {
        const rows = selectedKeys.size > 0 ? filteredItems.filter((a) => selectedKeys.has(a.assetNumber)) : filteredItems;
        downloadCsv(rows);
    };

    return (<AppLayout active="assets" title="Asset Register" crumb="Home / Asset Register">
      <div className="page-header">
        <div>
          <h1>Asset Register</h1>
          <p>{total.toLocaleString()} capitalized assets · Federal Tax book</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleExport}>
            Export CSV{selectedKeys.size > 0 ? ` (${selectedKeys.size})` : ''}
          </Button>
          {canAdd && (<Button variant="primary" to="/assets/new">
            + Add Asset
          </Button>)}
        </div>
      </div>

      <div className="card card-pad mb-4">
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(5,1fr)', gap: '0 16px' }}>
          <Input label="Search" placeholder="Asset # or description…" value={draftQuery} onChange={(e) => setDraftQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}/>
          <MultiSelect label="Asset Class" value={assetClass} onChange={setAssetClass} options={assetClassNames} allLabel="All Classes"/>
          <MultiSelect label="Company" value={company} onChange={setCompany} options={COMPANY_OPTIONS} allLabel="All Companies"/>
          <MultiSelect label="Status" value={status} onChange={setStatus} options={STATUS_OPTIONS} allLabel="All Statuses"/>
          <MultiSelect label="Depreciation Method" value={method} onChange={setMethod} options={METHOD_OPTIONS} allLabel="All Methods"/>
        </div>
        <div className="flex gap-2" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
          <Button variant="primary" type="button" onClick={handleSearch}>Search</Button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={reload}/>}

      {!error && (<div className="card">
          <div className="card-head">
            <h3>Assets</h3>
            <div className="flex items-center gap-2">
              {selectedKeys.size > 0 && (<span className="text-sm text-muted">{selectedKeys.size} selected</span>)}
              <span className="text-sm text-muted">
                Showing {filteredItems.length === 0 ? 0 : pageStart + 1}–{pageStart + pageItems.length} of {filteredItems.length.toLocaleString()}
              </span>
              <Button variant="ghost" size="sm" onClick={reload} disabled={loading}>
                {loading ? 'Refreshing…' : '↻ Refresh'}
              </Button>
            </div>
          </div>

          {loading && <Loader label="Loading assets…"/>}

          {!loading && filteredItems.length === 0 && (<EmptyState title="No assets match these filters" description="Try widening the Asset Class or Company filter."/>)}

          {!loading && filteredItems.length > 0 && (<div className="table-paged"><AssetTable assets={pageItems} onSelect={(a) => navigate(`/assets/${a.assetNumber}`)} selection={selection}/></div>)}

          <div className="card-pad flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">Page {currentPage} of {totalPages}</span>
              <select className="btn btn-ghost btn-sm" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} aria-label="Rows per page">
                {[10, 25, 50, 100].map((n) => (<option key={n} value={n}>{n} / page</option>))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setPage(currentPage - 1)} disabled={currentPage <= 1}>
                ‹ Prev
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setPage(currentPage + 1)} disabled={currentPage >= totalPages}>
                Next ›
              </Button>
            </div>
          </div>
        </div>)}
    </AppLayout>);
}

// ======================================================
// END: AssetRegister
// ======================================================

// ======================================================
// END: Page Component
// ======================================================
