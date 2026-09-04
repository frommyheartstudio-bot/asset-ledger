// ======================================================
// File Name : Modeling.jsx
// Purpose   : Page-level component for Modeling
// ======================================================

import { useEffect, useState } from 'react';
import { reportsApi } from '../../api/reports.api';
import { AppLayout } from '../../layout/AppLayout';
import { BarsChart } from '../../components/ui/ui';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { formatCurrency } from '../../utils/formatCurrency';

// ======================================================
// START: Page Component
// ======================================================

const TONE_PILL = { 0: 'blue', 1: 'purple', 2: 'amber' };
// ======================================================
// Function : Modeling
// Purpose  : React component that renders the 'Modeling' UI
// ======================================================

export function Modeling() {
    const [basis, setBasis] = useState(1_000_000);
    const [scenarios, setScenarios] = useState([]);
    const [results, setResults] = useState([]);
    useEffect(() => {
        reportsApi.getModelingScenarios().then((res) => {
            setBasis(res.basis);
            setScenarios(res.scenarios);
        });
    }, []);
    useEffect(() => {
        if (scenarios.length === 0)
            return;
        reportsApi.compareModelingScenarios(basis, scenarios).then((res) => setResults(res.results));
    }, [basis, scenarios]);
    function updateScenario(i, patch) {
        setScenarios((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
    }
    const maxFirstYear = Math.max(1, ...results.map((r) => r.yearlyDeduction[0] ?? 0));
    return (<AppLayout active="modeling" title="Modeling" crumb="Home / Planning / Modeling">
      <div className="page-header">
        <div>
          <h1>Scenario Modeling</h1>
          <p>Compare depreciation outcomes across tax elections and methods before committing</p>
        </div>
        <Button variant="primary">+ New Scenario</Button>
      </div>

      <div className="grid grid-3 mb-4">
        {scenarios.map((s, i) => (<div className="card card-pad" key={s.label}>
            <div className="flex justify-between items-center mb-4">
              <h3 style={{ fontSize: 14 }}>{s.label}</h3>
              <span className={`pill pill-${TONE_PILL[i] ?? 'gray'}`}>{i === 0 ? 'Current' : 'What-if'}</span>
            </div>
            <Select label="Method" value={s.method} onChange={(v) => updateScenario(i, { method: v })} options={['MACRS ADS', 'MACRS 200% DB', 'Straight-Line']}/>
            <Select label="Bonus %" value={String(s.bonusPct)} onChange={(v) => updateScenario(i, { bonusPct: Number(v) })} options={['0', '40', '60', '100']}/>
            <Select label="Recovery" value={String(s.recoveryPeriodYears)} onChange={(v) => updateScenario(i, { recoveryPeriodYears: Number(v) })} options={['5', '7', '15', '39']}/>
          </div>))}
      </div>

      <div className="card mb-4">
        <div className="card-head">
          <h3>First-Year Deduction Comparison</h3>
          <span className="text-sm text-muted">Asset basis {formatCurrency(basis, { compact: true })}</span>
        </div>
        <div className="card-pad">
          <BarsChart height={220} data={results.map((r, i) => ({
            label: `${String.fromCharCode(65 + i)} · ${formatCurrency(r.yearlyDeduction[0] ?? 0, { compact: true })}`,
            pct: Math.round(((r.yearlyDeduction[0] ?? 0) / maxFirstYear) * 100)
        }))}/>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3>Side-by-Side Projection</h3>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Year</th>
              {results.map((r, i) => (<th className="num" key={r.label}>
                  {String.fromCharCode(65 + i)} — {r.label.split('—')[1]?.trim() ?? r.label}
                </th>))}
            </tr>
          </thead>
          <tbody>
            {results[0]?.yearlyDeduction.map((_, yearIdx) => (<tr key={yearIdx}>
                <td>{2026 + yearIdx}</td>
                {results.map((r) => (<td className="num" key={r.label}>
                    {formatCurrency(r.yearlyDeduction[yearIdx] ?? 0, { compact: true })}
                  </td>))}
              </tr>))}
            <tr style={{ fontWeight: 700 }}>
              <td>Cumulative (Yr1–{results[0]?.yearlyDeduction.length ?? 4})</td>
              {results.map((r) => (<td className="num" key={r.label}>
                  {formatCurrency(r.cumulative, { compact: true })}
                </td>))}
            </tr>
          </tbody>
        </table>
      </div>
    </AppLayout>);
}

// ======================================================
// END: Modeling
// ======================================================

// ======================================================
// END: Page Component
// ======================================================

