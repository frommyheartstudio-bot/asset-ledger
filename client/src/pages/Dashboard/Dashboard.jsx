// ======================================================
// File Name : Dashboard.jsx
// Purpose   : Page-level component for Dashboard
// ======================================================

import { useEffect, useState } from 'react';
import { assetsApi } from '../../api/assets.api';
import { AppLayout } from '../../layout/AppLayout';
import { BarsChart, Donut, Pill, StatCard } from '../../components/ui/ui';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

// ======================================================
// START: Page Component
// ======================================================

const STATUS_TONE = {
    Posted: 'green',
    Processing: 'blue',
    Pending: 'amber'
};
// ======================================================
// Function : Dashboard
// Purpose  : React component that renders the 'Dashboard' UI
// ======================================================

export function Dashboard() {
    const [summary, setSummary] = useState(null);
    const [activity, setActivity] = useState([]);
    useEffect(() => {
        assetsApi.getDashboardSummary().then(setSummary);
        assetsApi.getDashboardActivity().then(setActivity);
    }, []);
    const activityColumns = [
        { header: 'Asset #', render: (a) => <span className="mono">{a.assetNumber}</span> },
        { header: 'Description', render: (a) => a.description },
        { header: 'Event', render: (a) => a.event },
        { header: 'Amount', numeric: true, render: (a) => formatCurrency(a.amount) },
        { header: 'Date', render: (a) => formatDate(a.date) },
        { header: 'Status', render: (a) => <Pill tone={STATUS_TONE[a.status] ?? 'gray'}>{a.status}</Pill> }
    ];
    return (<AppLayout active="dashboard" title="Dashboard" crumb="Home / Dashboard">
      <div className="page-header">
        <div>
          <h1>Portfolio Dashboard</h1>
          <p>Fixed asset overview for Fiscal Year 2026 · April period</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" to="/reporting">
            Export
          </Button>
          <Button variant="primary" to="/lifecycle">
            + New Transaction
          </Button>
        </div>
      </div>

      {!summary && <Loader label="Loading dashboard…"/>}

      {summary && (<>
          <div className="grid grid-4 mb-4">
            <StatCard label="Total Assets" value={summary.totalAssets.toLocaleString()} icon="▦" icoClass="ico-blue" delta={`▲ ${summary.addedThisPeriod} added this period`} deltaDirection="up"/>
            <StatCard label="Gross Cost" value={formatCurrency(summary.grossCost, { compact: true })} icon="$" icoClass="ico-teal" delta={`▲ ${summary.grossCostYtdDeltaPct}% YTD`} deltaDirection="up"/>
            <StatCard label="Net Book Value" value={formatCurrency(summary.netBookValue, { compact: true })} icon="◈" icoClass="ico-purple" delta={`▼ ${Math.abs(summary.depreciationDeltaPct)}% depreciation`} deltaDirection="down"/>
            <StatCard label="YTD Depreciation" value={formatCurrency(summary.ytdDepreciation, { compact: true })} icon="▼" icoClass="ico-amber" delta="On schedule" deltaDirection="up"/>
          </div>

          <div className="grid grid-2 mb-4">
            <div className="card">
              <div className="card-head">
                <h3>Monthly Depreciation Expense</h3>
                <span className="link">FY2026</span>
              </div>
              <div className="card-pad">
                <BarsChart data={summary.monthlyDepreciation.map((m) => ({ label: m.month, pct: m.pct, dim: m.projected }))}/>
              </div>
            </div>

            <div className="card">
              <div className="card-head">
                <h3>Assets by Class</h3>
                <span className="link">By NBV</span>
              </div>
              <div className="card-pad flex items-center gap-4" style={{ gap: 28 }}>
                <Donut segments={summary.assetsByClass.map((c) => ({ pct: c.pct, color: c.color }))}/>
                <div className="legend">
                  {summary.assetsByClass.map((c) => (<div className="li" key={c.label}>
                      <span className="dot" style={{ background: c.color }}/>
                      {c.label} · {c.pct}%
                    </div>))}
                </div>
              </div>
            </div>
          </div>
        </>)}

      <div className="card">
        <div className="card-head">
          <h3>Recent Lifecycle Activity</h3>
          <Button variant="ghost" size="sm" to="/lifecycle">
            View all →
          </Button>
        </div>
        {activity.length === 0 ? (<EmptyState title="No recent activity" description="Lifecycle events you post will show up here."/>) : (<Table columns={activityColumns} rows={activity} rowKey={(a) => `${a.assetNumber}-${a.date}-${a.event}`} onRowClick={(a) => (window.location.href = `/assets/${a.assetNumber}`)}/>)}
      </div>
    </AppLayout>);
}

// ======================================================
// END: Dashboard
// ======================================================

// ======================================================
// END: Page Component
// ======================================================

