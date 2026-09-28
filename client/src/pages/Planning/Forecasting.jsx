// ======================================================
// File Name : Forecasting.jsx
// Purpose   : Page-level component for Forecasting
// ======================================================

import { Fragment, useEffect, useMemo, useState } from 'react';
import { reportsApi } from '../../api/reports.api';
import { assetsApi } from '../../api/assets.api';
import { AppLayout } from '../../layout/AppLayout';
import { StatCard } from '../../components/ui/ui';
import { Button } from '../../components/ui/Button';
import { MultiSelect } from '../../components/ui/MultiSelect';
import { useAssetClasses } from '../../hooks/useAssetClasses';
import { companyName } from '../../data/companies';
import { Loader } from '../../components/common/Loader';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { formatCurrency } from '../../utils/formatCurrency';

// ======================================================
// START: Page Component
// ======================================================

const BOOK_OPTIONS = ['Federal Tax', 'GAAP', 'State No Bonus'];

// Defaults a checkbox MultiSelect to "everything selected" once its option
// list is actually known (Company's is empty on first render, before the
// asset list has loaded) — same helper as Modeling's filter bar.
function useAutoSelectAll(options, selected, setSelected) {
    useEffect(() => {
        if (options.length && selected.length === 0) setSelected(options.map((o) => o.value));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options]);
}

// ======================================================
// Function : Forecasting
// Purpose  : React component that renders the 'Forecasting' UI
// ======================================================

export function Forecasting() {
    const [data, setData] = useState(null);
    const [years, setYears] = useState(5);

    // Book / Company / Asset Type filter bar — each a checkbox multi-select
    // (with a Select All row) instead of a single dropdown, so any
    // combination of books/companies/asset types can be picked at once,
    // same pattern as Modeling's filter bar. Book only ever has real data
    // for "Federal Tax" in this prototype (offered for consistency,
    // doesn't change the numbers). Company and Asset Type are read from
    // the real asset list and, when narrowed, scope the forecast down to
    // that slice of the book instead of the whole portfolio.
    const [books, setBooks] = useState(BOOK_OPTIONS);
    const [companies, setCompanies] = useState([]);
    const assetClassNames = useAssetClasses();
    const ASSET_TYPE_OPTIONS = useMemo(() => assetClassNames.map((c) => ({ value: c, label: c })), [assetClassNames]);
    const [assetTypes, setAssetTypes] = useState([]);
    // Once the DB list arrives, start with everything selected ("All Types").
    useEffect(() => { setAssetTypes(assetClassNames); }, [assetClassNames]);
    const [allAssets, setAllAssets] = useState([]);

    useEffect(() => {
        assetsApi.list({}).then((res) => setAllAssets(res.items ?? []));
    }, []);
    const companyOptions = useMemo(() => {
        const codes = [...new Set(allAssets.map((a) => a.company).filter(Boolean))].sort();
        return codes.map((code) => ({ value: code, label: companyName(code) }));
    }, [allAssets]);
    useAutoSelectAll(companyOptions, companies, setCompanies);

    // A checkbox group only actually narrows the forecast once fewer than
    // every known option is checked — all-checked (or, briefly before the
    // options load, zero-checked) means "don't filter on this at all".
    const companyIsFiltering = companyOptions.length > 0 && companies.length > 0 && companies.length < companyOptions.length;
    const assetTypeIsFiltering = assetTypes.length > 0 && assetTypes.length < ASSET_TYPE_OPTIONS.length;

    // The dropdowns above only edit a *draft*. The forecast is re-run (and
    // the "scoped to" note updates) only when the Submit button is clicked,
    // which copies the draft into `applied`. Starts as "no filter" = whole
    // portfolio.
    const [applied, setApplied] = useState({ company: undefined, assetType: undefined });
    const submitFilters = () => {
        setApplied({
            company: companyIsFiltering ? [...companies] : undefined,
            assetType: assetTypeIsFiltering ? [...assetTypes] : undefined
        });
    };
    const isFiltering = !!applied.company || !!applied.assetType;

    // Year rows in the forecast table expand into that year's 12 months,
    // each with its own calculated depreciation amount — same drill-down
    // pattern as Asset Detail's Depreciation Schedule. Only one year open
    // at a time; months are fetched on first expand and cached per year
    // so re-clicking the same year doesn't re-fetch.
    const [expandedYear, setExpandedYear] = useState(null);
    const [monthlyByYear, setMonthlyByYear] = useState({});
    const [monthlyLoading, setMonthlyLoading] = useState(false);
    const [monthlyError, setMonthlyError] = useState(null);

    useEffect(() => {
        setData(null);
        reportsApi.getForecast(years, {
            company: applied.company,
            assetType: applied.assetType
        }).then(setData);
        setExpandedYear(null);
        setMonthlyByYear({});
    }, [years, applied]);

    function toggleYear(year) {
        if (expandedYear === year) {
            setExpandedYear(null);
            return;
        }
        setExpandedYear(year);
        setMonthlyError(null);
        if (!monthlyByYear[year]) {
            setMonthlyLoading(true);
            assetsApi.getMonthlyDepreciation(year)
                .then((res) => setMonthlyByYear((prev) => ({ ...prev, [year]: res.months })))
                .catch((err) => setMonthlyError(err.message || 'Failed to load monthly detail'))
                .finally(() => setMonthlyLoading(false));
        }
    }
    return (<AppLayout active="forecasting" title="Forecasting" crumb="Home / Planning / Forecasting">
      <div className="page-header">
        <div>
          <h1>Depreciation Forecasting</h1>
          <p>Projected depreciation expense and capital roll-forward across the portfolio</p>
        </div>
        <div className="flex gap-2">
          <select className="btn btn-ghost" value={years} onChange={(e) => setYears(Number(e.target.value))}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>Next {n} Year{n > 1 ? 's' : ''}</option>
            ))}
          </select>
          <Button variant="primary" to="/reporting">
            Export Forecast
          </Button>
        </div>
      </div>

      <div className="card card-pad mb-4">
        <div className="grid grid-3">
          <MultiSelect label="Book" options={BOOK_OPTIONS.map((b) => ({ value: b, label: b }))} selected={books} onChange={setBooks} allLabel="All Books"/>
          <MultiSelect label="Company" options={companyOptions} selected={companies} onChange={setCompanies} allLabel="All Companies"/>
          <MultiSelect label="Asset Type" options={ASSET_TYPE_OPTIONS} selected={assetTypes} onChange={setAssetTypes} allLabel="All Types"/>
        </div>
        <div className="flex gap-2" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
          <Button variant="primary" type="button" onClick={submitFilters}>Submit</Button>
        </div>
        {isFiltering && (<p className="text-sm text-muted" style={{ marginBottom: 0 }}>
            Forecast scoped to {applied.company ? applied.company.map((c) => companyName(c)).join(', ') : 'all companies'}
            {applied.assetType ? `, ${applied.assetType.join(', ')}` : ''}.
          </p>)}
      </div>

      {!data && <Loader label="Loading forecast…"/>}

      {data && (<>
          <div className="grid grid-4 mb-4">
            <StatCard label="FY2027 Projected Depr." value={formatCurrency(data.kpis.projectedDepreciationNextFY, { compact: true })} delta={`▲ ${data.kpis.projectedDepreciationDeltaPct}%`} deltaDirection="up"/>
            <StatCard label="Planned CapEx" value={formatCurrency(data.kpis.plannedCapEx, { compact: true })} delta={`▲ ${data.kpis.plannedCapExProjects} projects`} deltaDirection="up"/>
            <StatCard label="Assets Fully Depr. FY27" value={data.kpis.assetsFullyDepreciatingNextFY.toLocaleString()} delta="retiring basis" deltaDirection="down"/>
            <StatCard label="Projected Ending NBV" value={formatCurrency(data.kpis.projectedEndingNbv, { compact: true })} delta={`▲ ${data.kpis.projectedEndingNbvDeltaPct}%`} deltaDirection="up"/>
          </div>

          <div className="card mb-4">
            <div className="card-head">
              <h3>{years}-Year Depreciation Expense Forecast</h3>
              <span className="text-sm text-muted">click a year for the monthly breakdown</span>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th className="num">Depreciation Expense</th>
                  </tr>
                </thead>
                <tbody>
                  {data.expenseByYear.map((e) => {
                    const isOpen = expandedYear === e.year;
                    return (<Fragment key={e.year}>
                      <tr onClick={() => toggleYear(e.year)} style={{ cursor: 'pointer' }}>
                        <td><span style={{ display: 'inline-block', width: 14 }}>{isOpen ? '▾' : '▸'}</span>{e.year}</td>
                        <td className="num" data-label="Depreciation Expense">{formatCurrency(e.millions * 1e6, { compact: true })}</td>
                      </tr>
                      {isOpen && (<tr>
                          <td colSpan={2} style={{ background: 'var(--surface-2, #f8fafc)', padding: 0 }}>
                            <div className="card-pad" style={{ paddingTop: 12, paddingBottom: 12 }}>
                              {monthlyLoading && !monthlyByYear[e.year] ? (<Loader label="Loading months…"/>) : monthlyError ? (
                                <ErrorMessage message={monthlyError} onRetry={() => toggleYear(e.year)}/>
                              ) : (<div className="table-wrap" style={{ maxHeight: 'none', overflowY: 'visible' }}>
                                  <table className="table" style={{ fontSize: 12 }}>
                                    <thead>
                                      <tr>
                                        <th>Month</th>
                                        <th className="num">Depreciation</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(monthlyByYear[e.year] ?? []).map((m) => (<tr key={m.month}>
                                          <td>{m.month}{m.projected ? ' *' : ''}</td>
                                          <td className="num" data-label="Depreciation">{formatCurrency(m.value, { compact: true })}</td>
                                        </tr>))}
                                    </tbody>
                                  </table>
                                  {(monthlyByYear[e.year] ?? []).some((m) => m.projected) && (<p className="text-sm text-muted mt-1" style={{ marginBottom: 0 }}>* projected — calculated from each asset's own forward depreciation schedule.</p>)}
                                </div>)}
                            </div>
                          </td>
                        </tr>)}
                    </Fragment>);
                })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h3>Capital Roll-Forward Projection</h3>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th className="num">Opening NBV</th>
                    <th className="num">Additions</th>
                    <th className="num">Depreciation</th>
                    <th className="num">Retirements</th>
                    <th className="num">Closing NBV</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rollForward.map((r) => (<tr key={r.year}>
                      <td>{r.year}</td>
                      <td className="num">{formatCurrency(r.openingNbv, { compact: true })}</td>
                      <td className="num">{formatCurrency(r.additions, { compact: true })}</td>
                      <td className="num">({formatCurrency(Math.abs(r.depreciation), { compact: true })})</td>
                      <td className="num">({formatCurrency(Math.abs(r.retirements), { compact: true })})</td>
                      <td className="num">{formatCurrency(r.closingNbv, { compact: true })}</td>
                    </tr>))}
                </tbody>
              </table>
            </div>
          </div>
        </>)}
    </AppLayout>);
}

// ======================================================
// END: Forecasting
// ======================================================

// ======================================================
// END: Page Component
// ======================================================

