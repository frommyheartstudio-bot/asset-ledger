// ======================================================
// File Name : AssetClasses.jsx
// Purpose   : Page-level component for the IRS Publication 946
//             Appendix B, Table B-1 asset class reference
// ======================================================

import { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '../../layout/AppLayout';
import { Button } from '../../components/ui/Button';
import { configApi } from '../../api/config.api';

// ======================================================
// START: Page Component
// ======================================================

function downloadCSV(rows) {
    const header = ['Name', 'Property Type', 'Method', 'Rate %', 'Convention', 'Life'];
    const csvRows = [header.join(',')];
    rows.forEach((r) => {
        const line = [`"${r.name.replace(/"/g, '""')}"`, `"${r.propertyType.replace(/"/g, '""')}"`, `"${r.method.replace(/"/g, '""')}"`, r.ratePct, `"${r.convention.replace(/"/g, '""')}"`, `"${r.life.replace(/"/g, '""')}"`];
        csvRows.push(line.join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'asset_classes.csv';
    a.click();
}

// ======================================================
// Function : AssetClasses
// Purpose  : React component that renders the 'Asset Classes' UI
// ======================================================

export function AssetClasses() {
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

    return (<AppLayout active="assetClasses" title="Asset Classes" crumb="Home / Configuration / Asset Classes">
      <div className="page-header">
        <div>
          <h1>Asset Classes</h1>
          <p>Name, property type, depreciation method, rate, convention, and life for every asset type on the book</p>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-pad flex items-center gap-4" style={{ flexWrap: 'wrap' }}>
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
          <Button variant="ghost" onClick={() => downloadCSV(filtered)} style={{ marginLeft: 'auto' }}>
            Export CSV
          </Button>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3>Asset Classes</h3>
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
              {filtered.map((row, i) => (<tr key={`${row.name}-${i}`}>
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
      </div>
    </AppLayout>);
}

// ======================================================
// END: AssetClasses
// ======================================================

// ======================================================
// END: Page Component
// ======================================================
