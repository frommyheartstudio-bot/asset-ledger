// ======================================================
// File Name : AssetRegister.jsx
// Purpose   : Page-level component for AssetRegister
// ======================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../layout/AppLayout';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { AssetTable } from '../../components/asset/AssetTable';
import { useAssets } from '../../hooks/useAssets';

// ======================================================
// START: Page Component
// ======================================================

// ======================================================
// Function : AssetRegister
// Purpose  : React component that renders the 'AssetRegister' UI
// ======================================================

export function AssetRegister() {
    const [assetClass, setAssetClass] = useState('All Classes');
    const [company, setCompany] = useState('All Companies');
    const navigate = useNavigate();
    const { items, total, loading, error, reload } = useAssets({
        assetClass: assetClass === 'All Classes' ? undefined : assetClass,
        company: company === 'All Companies' ? undefined : company
    });
    return (<AppLayout active="assets" title="Asset Register" crumb="Home / Asset Register">
      <div className="page-header">
        <div>
          <h1>Asset Register</h1>
          <p>24,318 capitalized assets · Federal Tax book</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" to="/reporting">
            Export CSV
          </Button>
          <Button variant="primary" to="/assets/new">
            + Add Asset
          </Button>
        </div>
      </div>

      <div className="card card-pad mb-4">
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', gap: '0 16px' }}>
          <Select label="Asset Class" value={assetClass} onChange={setAssetClass} options={['All Classes', 'Network Equipment', 'Buildings', 'Machinery', 'Vehicles']}/>
          <Select label="Company" value={company} onChange={setCompany} options={['All Companies', '5B', 'R9', '2D', 'GD']}/>
          <Select label="Status" value="Active" onChange={() => { }} options={['Active', 'Retired', 'Transferred', 'Fully Depreciated']}/>
          <Select label="Depreciation Method" value="All Methods" onChange={() => { }} options={['All Methods', 'MACRS', 'MACRS ADS', 'Straight-Line']}/>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={reload}/>}

      {!error && (<div className="card">
          <div className="card-head">
            <h3>Assets</h3>
            <span className="text-sm text-muted">
              Showing 1–{items.length} of {total.toLocaleString()}
            </span>
          </div>

          {loading && <Loader label="Loading assets…"/>}

          {!loading && items.length === 0 && (<EmptyState title="No assets match these filters" description="Try widening the Asset Class or Company filter."/>)}

          {!loading && items.length > 0 && <AssetTable assets={items} onSelect={(a) => navigate(`/assets/${a.assetNumber}`)}/>}

          <div className="card-pad flex items-center justify-between">
            <span className="text-sm text-muted">Page 1 of 3,040</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                ‹ Prev
              </Button>
              <Button variant="ghost" size="sm">
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

