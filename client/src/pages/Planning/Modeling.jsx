// ======================================================
// File Name : Modeling.jsx
// Purpose   : Page-level component for Modeling
// ======================================================

import { useEffect, useMemo, useState } from 'react';
import { reportsApi } from '../../api/reports.api';
import { assetsApi } from '../../api/assets.api';
import { AppLayout } from '../../layout/AppLayout';
import { BarsChart } from '../../components/ui/ui';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { ASSET_CLASS_CODES } from '../../data/assetClasses';
import { companyName } from '../../data/companies';
import { formatCurrency } from '../../utils/formatCurrency';

// ======================================================
// START: Page Component
// ======================================================

const TONE_PILL = { 0: 'blue', 1: 'purple', 2: 'amber' };
// ======================================================
// Function : Modeling
// Purpose  : React component that renders the 'Modeling' UI
// ======================================================

const BOOK_OPTIONS = ['Federal Tax', 'GAAP', 'State No Bonus'];
const ALL_COMPANIES = 'All Companies';
const ALL_TYPES = 'All Types';
const PROJECTION_YEARS = 4;

export function Modeling() {
    const [basis, setBasis] = useState(1_000_000);
    const [scenarios, setScenarios] = useState([]);
    const [results, setResults] = useState([]);

    // Book / Company / Asset Type filter bar — scopes the asset basis the
    // scenarios are compared against down to whatever slice of the real
    // book the person picks. Book only ever has real data for "Federal
    // Tax" in this prototype (same as Reporting's Book filter), so it's
    // offered for consistency but doesn't change the numbers. Company and
    // Asset Type are read from the real asset list, not a hardcoded
    // guess, so the picker never drifts from what's actually on the book.
    const [book, setBook] = useState('Federal Tax');
    const [company, setCompany] = useState(ALL_COMPANIES);
    const [assetType, setAssetType] = useState(ALL_TYPES);
    const [allAssets, setAllAssets] = useState([]);

    // Scenario B's bonus chain: bonus-1 and bonus-2 each give the value a
    // "chance to increase" on top of that year's own actual amount, and the
    // resulting final amount rolls forward to become next year's actual
    // amount. The base % (40 / 60 by default) applies to every projected
    // year; a per-year override in the table below carries forward as the
    // new default from that year on, until the next override.
    const [bonusBase, setBonusBase] = useState(40);
    const bonusPctByYear = useMemo(() => Array(PROJECTION_YEARS).fill(bonusBase), [bonusBase]);
    useEffect(() => {
        assetsApi.list({}).then((res) => setAllAssets(res.items ?? []));
    }, []);
    const companyOptions = useMemo(() => {
        const codes = [...new Set(allAssets.map((a) => a.company).filter(Boolean))].sort();
        return [ALL_COMPANIES, ...codes];
    }, [allAssets]);

    // The filtered basis is the summed cost of whatever assets match the
    // Company/Asset Type picked, so the scenarios below are genuinely
    // comparing "what would this slice of the book look like" — not just
    // decorative filters. Falls back to the server's default $1.0M
    // illustrative basis when nothing is filtered down (both pickers on
    // "All") or when a filter combination matches zero real assets.
    const filteredAssets = useMemo(() => allAssets.filter((a) => (company === ALL_COMPANIES || a.company === company) &&
        (assetType === ALL_TYPES || a.assetClass === assetType)), [allAssets, company, assetType]);
    const isFiltering = company !== ALL_COMPANIES || assetType !== ALL_TYPES;
    const filteredBasis = filteredAssets.reduce((sum, a) => sum + (a.cost ?? 0), 0);
    const effectiveBasis = isFiltering && filteredBasis > 0 ? filteredBasis : basis;

    // Scenario A ("Current") is supposed to be the real, already-elected
    // treatment for whatever slice of the book is filtered above — not
    // the generic MACRS ADS / 5-year placeholder every filter combo used
    // to show. Once Company + Asset Type narrow down to real assets, pull
    // A's Method/Bonus/Recovery straight off the first matching asset's
    // own tax fact pattern so the "exact" calculation is the real one.
    // recoveryPeriod is a free-text field ("5 years", "9 years"...), so
    // only override it when it actually parses; otherwise keep the
    // placeholder recovery rather than feed NaN into the projection math.
    const currentElection = useMemo(() => {
        if (!isFiltering || filteredAssets.length === 0)
            return null;
        const a = filteredAssets[0];
        const parsedYears = parseInt(a.taxFactPattern?.recoveryPeriod ?? '', 10);
        return {
            method: a.method,
            bonusPct: a.taxFactPattern?.bonusPct ?? 0,
            recoveryPeriodYears: Number.isFinite(parsedYears) && parsedYears > 0 ? parsedYears : null
        };
    }, [isFiltering, filteredAssets]);

    // A resolves to the real election above (or the placeholder when
    // nothing's filtered). B and C are both genuine, independent what-if
    // scenarios — each with its own Method/Bonus %/Recovery — so both stay
    // fully editable rather than C being derived from A + B.
    const resolvedA = useMemo(() => {
        const base = scenarios[0];
        if (!base)
            return null;
        return currentElection
            ? { ...base, method: currentElection.method, bonusPct: currentElection.bonusPct, recoveryPeriodYears: currentElection.recoveryPeriodYears ?? base.recoveryPeriodYears }
            : base;
    }, [scenarios, currentElection]);
    const effectiveScenarios = useMemo(() => scenarios.map((s, i) => (i === 0 ? resolvedA ?? s : s)), [scenarios, resolvedA]);

    useEffect(() => {
        reportsApi.getModelingScenarios().then((res) => {
            setBasis(res.basis);
            setScenarios(res.scenarios);
        });
    }, []);
    // When a Company / Asset Type slice is picked, Baseline (A) is taken
    // from those assets' own depreciation schedules for every projected
    // year (baselineFromSchedules on the server already walks each asset's
    // real forward schedule year by year, so A "chains" on its own actual
    // data with no extra client-side math needed). B and C are each their
    // own independent what-if scenario — every year of each comes straight
    // from calculateScenarioProjection for that scenario's own
    // Method/Bonus %/Recovery, with no dependency on the other columns.
    const baselineAssetKey = isFiltering ? filteredAssets.map((a) => a.assetNumber).join(',') : '';
    useEffect(() => {
        if (effectiveScenarios.length === 0)
            return;
        const baselineAssetNumbers = baselineAssetKey ? baselineAssetKey.split(',') : [];
        reportsApi.compareModelingScenarios(effectiveBasis, effectiveScenarios, baselineAssetNumbers, 2026, bonusPctByYear).then((res) => {
            setResults(res.results);
        });
    }, [effectiveBasis, effectiveScenarios, baselineAssetKey, bonusPctByYear]);
    function updateScenario(i, patch) {
        setScenarios((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
    }
    return (<AppLayout active="modeling" title="Modeling" crumb="Home / Planning / Modeling">
      <div className="page-header">
        <div>
          <h1>Scenario Modeling</h1>
          <p>Compare depreciation outcomes across tax elections and methods before committing</p>
        </div>
        <Button variant="primary">+ New Scenario</Button>
      </div>

      <div className="card card-pad mb-4">
        <div className="grid grid-3">
          <Select label="Book" value={book} onChange={setBook} options={BOOK_OPTIONS}/>
          <div className="form-row">
            <label>Company</label>
            <select value={company} onChange={(e) => setCompany(e.target.value)}>
              <option value={ALL_COMPANIES}>{ALL_COMPANIES}</option>
              {companyOptions.filter((c) => c !== ALL_COMPANIES).map((code) => (<option key={code} value={code}>{companyName(code)}</option>))}
            </select>
          </div>
          <Select label="Asset Type" value={assetType} onChange={setAssetType} options={[ALL_TYPES, ...ASSET_CLASS_CODES]}/>
        </div>
        <p className="text-sm text-muted" style={{ marginBottom: 0 }}>
          {isFiltering
            ? (filteredAssets.length > 0
                ? `${filteredAssets.length} asset${filteredAssets.length === 1 ? '' : 's'} matched · basis ${formatCurrency(filteredBasis, { compact: true })}`
                : `No assets match this filter — scenarios below use the default ${formatCurrency(basis, { compact: true })} illustrative basis`)
            : `Showing all companies and asset types · basis ${formatCurrency(basis, { compact: true })}`}
        </p>
      </div>

      <div className="grid grid-3 mb-4">
        {effectiveScenarios.map((s, i) => {
            const isEditable = i === 1 || i === 2;
            return (<div className="card card-pad" key={s.label}>
            <div className="flex justify-between items-center mb-4">
              <h3 style={{ fontSize: 14 }}>{s.label}</h3>
              <span className={`pill pill-${TONE_PILL[i] ?? 'gray'}`}>{i === 0 ? 'Current' : 'What-if'}</span>
            </div>
            {isEditable ? (
                i === 1 ? (
                // B (What-if — Bonus) rolls forward each year: each year =
                // a × Bonus%, and that amount becomes next year's "a" —
                // 2026's result rolls into 2027, and so on. Method/Recovery
                // stay pickable like before.
                <>
                  <Select label="Method" value={s.method} onChange={(v) => updateScenario(i, { method: v })} options={['MACRS ADS', 'MACRS 200% DB', 'Straight-Line']}/>
                  <div className="form-row">
                    <Select label="Bonus %" value={String(bonusBase)} onChange={(v) => setBonusBase(Number(v))} options={['0', '40', '60', '100']}/>
                    <div className="hint">≈ {formatCurrency(effectiveBasis * (bonusBase / 100), { compact: true })} on {formatCurrency(effectiveBasis, { compact: true })} basis</div>
                  </div>
                  <div className="form-row" style={{ marginBottom: 0 }}>
                    <Select label="Recovery" value={String(s.recoveryPeriodYears)} onChange={(v) => updateScenario(i, { recoveryPeriodYears: Number(v) })} options={['5', '7', '15', '39']}/>
                    <div className="hint">each year = bonus + remaining×(rate/2); the basis left over becomes next year's "a".</div>
                  </div>
                </>
                ) : (
                // C is its own independent what-if scenario — own Method,
                // own flat Bonus %, own Recovery.
                <>
                  <Select label="Method" value={s.method} onChange={(v) => updateScenario(i, { method: v })} options={['MACRS ADS', 'MACRS 200% DB', 'Straight-Line']}/>
                  <div className="form-row">
                    <Select label="Bonus %" value={String(s.bonusPct)} onChange={(v) => updateScenario(i, { bonusPct: Number(v) })} options={['0', '40', '60', '100']}/>
                    <div className="hint">≈ {formatCurrency(effectiveBasis * (s.bonusPct / 100), { compact: true })} on {formatCurrency(effectiveBasis, { compact: true })} basis</div>
                  </div>
                  <Select label="Recovery" value={String(s.recoveryPeriodYears)} onChange={(v) => updateScenario(i, { recoveryPeriodYears: Number(v) })} options={['5', '7', '15', '39']}/>
                </>
                )
            ) : (
                // A is the real, already-elected treatment, so it's shown
                // as a fixed value rather than a dropdown.
                <>
                  <div className="form-row">
                    <label>Method</label>
                    <div className="readonly-field">{s.method}</div>
                  </div>
                  <div className="form-row">
                    <label>Bonus %</label>
                    <div className="readonly-field">{s.bonusPct}%</div>
                  </div>
                  <div className="form-row" style={{ marginBottom: 0 }}>
                    <label>Recovery</label>
                    <div className="readonly-field">{s.recoveryPeriodYears} yr</div>
                    {currentElection && <div className="hint">From {filteredAssets[0]?.assetNumber}'s actual tax fact pattern, projected year by year</div>}
                  </div>
                </>
            )}
          </div>);
        })}
      </div>

      <div className="card mb-4">
        <div className="card-head">
          <h3>First-Year Deduction Comparison</h3>
          <span className="text-sm text-muted">Asset basis {formatCurrency(effectiveBasis, { compact: true })}</span>
        </div>
        <div className="card-pad">
          <BarsChart height={220} data={results.map((r, i) => ({
            month: String.fromCharCode(65 + i),
            value: r.yearlyDeduction[0] ?? 0,
            valueLabel: formatCurrency(r.yearlyDeduction[0] ?? 0, { compact: true })
        }))}/>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3>Side-by-Side Projection</h3>
        </div>
        <div className="table-wrap">
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
      </div>

    </AppLayout>);
}

// ======================================================
// END: Modeling
// ======================================================

// ======================================================
// END: Page Component
// ======================================================

