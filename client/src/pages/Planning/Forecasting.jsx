// ======================================================
// File Name : Forecasting.jsx
// Purpose   : Page-level component for Forecasting
// ======================================================

import { useEffect, useState } from 'react';
import { reportsApi } from '../../api/reports.api';
import { AppLayout } from '../../layout/AppLayout';
import { BarsChart, StatCard } from '../../components/ui/ui';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/common/Loader';
import { formatCurrency } from '../../utils/formatCurrency';

// ======================================================
// START: Page Component
// ======================================================

// ======================================================
// Function : Forecasting
// Purpose  : React component that renders the 'Forecasting' UI
// ======================================================

export function Forecasting() {
    const [data, setData] = useState(null);
    useEffect(() => {
        reportsApi.getForecast().then(setData);
    }, []);
    const maxExpense = data ? Math.max(...data.expenseByYear.map((e) => e.millions)) : 1;
    return (<AppLayout active="forecasting" title="Forecasting" crumb="Home / Planning / Forecasting">
      <div className="page-header">
        <div>
          <h1>Depreciation Forecasting</h1>
          <p>Projected depreciation expense and capital roll-forward across the portfolio</p>
        </div>
        <div className="flex gap-2">
          <select className="btn btn-ghost">
            <option>Next 5 Years</option>
            <option>Next 10 Years</option>
          </select>
          <Button variant="primary" to="/reporting">
            Export Forecast
          </Button>
        </div>
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
              <h3>5-Year Depreciation Expense Forecast</h3>
              <span className="text-sm text-muted">$ millions</span>
            </div>
            <div className="card-pad">
              <BarsChart height={230} data={data.expenseByYear.map((e) => ({
                label: `${e.year} · $${e.millions}M`,
                pct: Math.round((e.millions / maxExpense) * 100)
            }))}/>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h3>Capital Roll-Forward Projection</h3>
            </div>
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
        </>)}
    </AppLayout>);
}

// ======================================================
// END: Forecasting
// ======================================================

// ======================================================
// END: Page Component
// ======================================================

