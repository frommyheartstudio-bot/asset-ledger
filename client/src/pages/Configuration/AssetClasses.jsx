// ======================================================
// File Name : AssetClasses.jsx
// Purpose   : Page-level component for the IRS Publication 946
//             Appendix B, Table B-1 asset class reference
// ======================================================

import { useMemo, useState } from 'react';
import { AppLayout } from '../../layout/AppLayout';
import { Button } from '../../components/ui/Button';
import { ASSET_CLASSES, ASSET_CLASSES_B2 } from '../../data/assetClasses';

// ======================================================
// START: Page Component
// ======================================================

function downloadCSV(rows) {
    const header = ['Asset Class', 'Class', 'Description', 'MACRS Table', 'Life (Years)', 'Convention'];
    const csvRows = [header.join(',')];
    rows.forEach((r) => {
        const line = [r.assetClass, r.class, `"${r.description.replace(/"/g, '""')}"`, r.macrsTable, r.life, r.convention];
        csvRows.push(line.join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'asset_classes_table_b1.csv';
    a.click();
}

// ======================================================
// Function : AssetClasses
// Purpose  : React component that renders the 'Asset Classes' UI
// ======================================================

export function AssetClasses() {
    const [query, setQuery] = useState('');
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return ASSET_CLASSES;
        return ASSET_CLASSES.filter((r) => r.assetClass.toLowerCase().includes(q)
            || r.class.toLowerCase().includes(q)
            || r.description.toLowerCase().includes(q)
            || r.macrsTable.toLowerCase().includes(q));
    }, [query]);

    return (<AppLayout active="assetClasses" title="Asset Classes" crumb="Home / Configuration / Asset Classes">
      <div className="page-header">
        <div>
          <h1>IRS Publication 946 — Asset Classes (Tables B-1 and B-2)</h1>
          <p>Specific depreciable assets used in all business activities, except as noted</p>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-pad flex items-center gap-4" style={{ flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div className="hint" style={{ marginTop: 0, marginBottom: 4 }}>Search</div>
            <input
              className="btn btn-ghost"
              style={{ width: '100%', textAlign: 'left' }}
              placeholder="Search asset class, description, or MACRS table..."
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
          <h3>Table B-1: Table of Class Lives and Recovery Periods</h3>
        </div>
        <div className="card-pad" style={{ paddingTop: 0, paddingBottom: 4 }}>
          <p className="text-muted text-sm">
            If a property is described in Table B-1, use the recovery period shown here unless the activity is
            specifically described in Table B-2, in which case Table B-2 governs. Convention shown is the default
            Half-Year convention; the Mid-Quarter convention applies instead when the mid-quarter test under
            section 168(d)(3) is met for the tax year as a whole.
          </p>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Asset Class</th>
                <th>Class</th>
                <th>Description</th>
                <th>MACRS Table</th>
                <th className="num">Life (Years)</th>
                <th>Convention</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (<tr key={row.assetClass}>
                  <td className="mono">{row.assetClass}</td>
                  <td>{row.class}</td>
                  <td className="text-sm">{row.description}</td>
                  <td>{row.macrsTable}</td>
                  <td className="num">{row.life}</td>
                  <td>{row.convention}</td>
                </tr>))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-head">
          <h3>Table B-2: Activity-Specific Depreciable Assets</h3>
        </div>
        <div className="card-pad" style={{ paddingTop: 0, paddingBottom: 4 }}>
          <p className="text-muted text-sm">Depreciable assets used in the activities listed in IRS Publication 946, Appendix B, Table B-2. Classes 01.223, 01.224, and 01.225 are assigned recovery periods but have no class life (shown as "—").</p>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Asset Class</th><th>Description</th><th className="num">Class Life (Years)</th><th className="num">GDS (Years)</th><th className="num">ADS (Years)</th></tr></thead>
            <tbody>{ASSET_CLASSES_B2.map((row) => (<tr key={row.assetClass}>
              <td className="mono">{row.assetClass}</td><td className="text-sm">{row.description}</td>
              <td className="num">{row.classLife ?? '—'}</td><td className="num">{row.gds}</td><td className="num">{row.ads}</td>
            </tr>))}</tbody>
          </table>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-pad text-muted" style={{ fontSize: 11.5, lineHeight: 1.6 }}>
          <strong>Source:</strong> IRS Publication 946 (2025), Appendix B, Table B-1 (Rev. Proc. 87-56).<br/>
          Each asset class number, property class (recovery period), ADR class life, applicable MACRS percentage
          table, and default convention is shown above for configuration lookups elsewhere in this project.
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
