// ======================================================
// File Name : AssetDetail.jsx
// Purpose   : Page-level component for AssetDetail
// ======================================================

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { assetsApi } from '../../api/assets.api';
import { AppLayout } from '../../layout/AppLayout';
import { Pill } from '../../components/ui/ui';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/common/Loader';
import { AssetCard } from '../../components/asset/AssetCard';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

// ======================================================
// START: Page Component
// ======================================================

const TABS = ['Overview', 'Depreciation Schedule', 'Transactions', 'Documents', 'Audit Trail'];
// ======================================================
// Function : AssetDetail
// Purpose  : React component that renders the 'AssetDetail' UI
// ======================================================

export function AssetDetail() {
    const { assetNumber = '845862189' } = useParams();
    const [data, setData] = useState(null);
    const [tab, setTab] = useState('Overview');
    useEffect(() => {
        setData(null);
        assetsApi.getByNumber(assetNumber).then(setData);
    }, [assetNumber]);
    if (!data) {
        return (<AppLayout active="detail" title="Asset Detail" crumb={`Home / Asset Register / ${assetNumber}`}>
        <Loader label="Loading asset…"/>
      </AppLayout>);
    }
    const { asset, timeline, depreciationSchedule } = data;
    const pctDepreciated = asset.cost !== 0 ? Math.round((asset.accumDepreciation / asset.cost) * 1000) / 10 : 0;
    return (<AppLayout active="detail" title="Asset Detail" crumb={`Home / Asset Register / ${asset.assetNumber}`}>
      <div className="page-header">
        <div>
          <h1>
            {asset.assetNumber} — {asset.description}
          </h1>
          <p>
            Company {asset.company}
            {asset.costCenter ? ` · Cost Center ${asset.costCenter}` : ''}
            {asset.location ? ` · Location ${asset.location}` : ''}
            {asset.project ? ` · Project ${asset.project}` : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" to="/assets">
            ← Back
          </Button>
          <Button variant="ghost" to="/lifecycle">
            Post Event
          </Button>
          <Button variant="primary" to="/modeling">
            Model Scenario
          </Button>
        </div>
      </div>

      <div className="mb-4" style={{ maxWidth: 360 }}>
        <AssetCard asset={asset}/>
      </div>

      <div className="grid grid-4 mb-4">
        <div className="card card-pad stat">
          <span className="label">Gross Cost</span>
          <div className="value" style={{ fontSize: 22 }}>
            {formatCurrency(asset.cost)}
          </div>
        </div>
        <div className="card card-pad stat">
          <span className="label">Accum. Depreciation</span>
          <div className="value" style={{ fontSize: 22 }}>
            {formatCurrency(asset.accumDepreciation)}
          </div>
        </div>
        <div className="card card-pad stat">
          <span className="label">Net Book Value</span>
          <div className="value" style={{ fontSize: 22 }}>
            {formatCurrency(asset.nbv)}
          </div>
        </div>
        <div className="card card-pad stat">
          <span className="label">% Depreciated</span>
          <div className="value" style={{ fontSize: 22 }}>
            {pctDepreciated}%
          </div>
          <div className="bar mt-2">
            <span style={{ width: `${Math.min(Math.abs(pctDepreciated), 100)}%` }}/>
          </div>
        </div>
      </div>

      <div className="tabs">
        {TABS.map((t) => (<div key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t}
          </div>))}
      </div>

      {tab === 'Overview' && (<div className="grid grid-2">
          <div className="card">
            <div className="card-head">
              <h3>Tax Fact Pattern</h3>
              <Pill tone="blue">Federal Tax</Pill>
            </div>
            <div className="card-pad">
              {asset.taxFactPattern ? (<table className="table" style={{ fontSize: 13 }}>
                  <tbody>
                    <tr>
                      <td className="text-muted">Placed In Service</td>
                      <td className="text-right">{formatDate(asset.taxFactPattern.placedInService)}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Recovery Period</td>
                      <td className="text-right">{asset.taxFactPattern.recoveryPeriod}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Method</td>
                      <td className="text-right">{asset.taxFactPattern.method}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Convention</td>
                      <td className="text-right">{asset.taxFactPattern.convention}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Bonus %</td>
                      <td className="text-right">{asset.taxFactPattern.bonusPct}%</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Annual Rate</td>
                      <td className="text-right">{asset.taxFactPattern.annualRate.toFixed(2)}%</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Property Type</td>
                      <td className="text-right">{asset.taxFactPattern.propertyType}</td>
                    </tr>
                  </tbody>
                </table>) : (<p className="text-muted text-sm">No detailed fact pattern on file for this asset.</p>)}
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h3>Lifecycle Timeline</h3>
              <Button variant="ghost" size="sm" to="/lifecycle">
                Manage →
              </Button>
            </div>
            <div className="card-pad">
              <div className="timeline">
                {timeline.length === 0 && <p className="text-muted text-sm">No lifecycle events recorded.</p>}
                {timeline.map((t) => (<div key={`${t.date}-${t.title}`} className={`tl-item ${t.done ? 'done' : ''}`}>
                    <div className="tl-date">{t.date}</div>
                    <div className="tl-title">{t.title}</div>
                    <div className="tl-desc">{t.description}</div>
                  </div>))}
              </div>
            </div>
          </div>
        </div>)}

      {(tab === 'Overview' || tab === 'Depreciation Schedule') && (<div className="card mt-4">
          <div className="card-head">
            <h3>Depreciation Schedule (Federal Tax)</h3>
            <span className="text-sm text-muted">Projected through life</span>
          </div>
          {depreciationSchedule.length === 0 ? (<div className="card-pad">
              <p className="text-muted text-sm">No projected schedule available for this asset yet.</p>
            </div>) : (<table className="table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th className="num">Opening NBV</th>
                  <th className="num">Rate</th>
                  <th className="num">Depreciation</th>
                  <th className="num">Accum. Depr</th>
                  <th className="num">Closing NBV</th>
                </tr>
              </thead>
              <tbody>
                {depreciationSchedule.map((row) => (<tr key={row.year}>
                    <td>{row.year}</td>
                    <td className="num">{formatCurrency(row.openingNbv, { compact: true })}</td>
                    <td className="num">{row.rate.toFixed(2)}%</td>
                    <td className="num">{formatCurrency(row.depreciation, { compact: true })}</td>
                    <td className="num">{formatCurrency(row.accumDepreciation, { compact: true })}</td>
                    <td className="num">{formatCurrency(row.closingNbv, { compact: true })}</td>
                  </tr>))}
              </tbody>
            </table>)}
        </div>)}

      {tab !== 'Overview' && tab !== 'Depreciation Schedule' && (<div className="card card-pad">
          <p className="text-muted text-sm">{tab} isn't wired up in this scaffold yet.</p>
        </div>)}
    </AppLayout>);
}


// ======================================================
// END: AssetDetail
// ======================================================

// ======================================================
// END: Page Component
// ======================================================
