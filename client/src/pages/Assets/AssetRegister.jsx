// ======================================================
// File Name : AssetRegister.jsx
// Purpose   : Page-level component for AssetRegister
// ======================================================

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '../../layout/AppLayout';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { AssetTable } from '../../components/asset/AssetTable';
import { useAssets } from '../../hooks/useAssets';
import { ASSET_CLASS_CODES } from '../../data/assetClasses';
import { useAuth } from '../../context/AuthContext';

// ======================================================
// START: Page Component
// ======================================================

// ======================================================
// Function : AssetRegister
// Purpose  : React component that renders the 'AssetRegister' UI
// ======================================================

export function AssetRegister() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [assetClass, setAssetClass] = useState('All Classes');
    const [company, setCompany] = useState('All Companies');
    const [status, setStatus] = useState('All Statuses');
    const [method, setMethod] = useState('All Methods');
    const navigate = useNavigate();
    const { hasEdit } = useAuth();
    const canAdd = hasEdit('assets');

    // The URL is the source of truth for the search box (not local state)
    // — that way it stays in sync whether the person edits it on this page
    // or arrives here via the header search box while already on /assets,
    // where the route doesn't remount and a one-time useState() would go stale.
    const query = searchParams.get('q') ?? '';
    const handleQueryChange = (value) => {
        setSearchParams(value ? { q: value } : {}, { replace: true });
    };

    const { items, total, loading, error, reload } = useAssets({
        assetClass: assetClass === 'All Classes' ? undefined : assetClass,
        company: company === 'All Companies' ? undefined : company,
        status: status === 'All Statuses' ? undefined : status,
        method: method === 'All Methods' ? undefined : method,
        q: query || undefined
    });
    return (<AppLayout active="assets" title="Asset Register" crumb="Home / Asset Register">
      <div className="page-header">
        <div>
          <h1>Asset Register</h1>
          <p>{total.toLocaleString()} capitalized assets · Federal Tax book</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" to="/reporting">
            Export CSV
          </Button>
          {canAdd && (<Button variant="primary" to="/assets/new">
            + Add Asset
          </Button>)}
        </div>
      </div>

      <div className="card card-pad mb-4">
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(5,1fr)', gap: '0 16px' }}>
          <Input label="Search" placeholder="Asset # or description…" value={query} onChange={(e) => handleQueryChange(e.target.value)}/>
          <Select label="Asset Class" value={assetClass} onChange={setAssetClass} options={['All Classes', ...ASSET_CLASS_CODES]}/>
          <Select label="Company" value={company} onChange={setCompany} options={['All Companies', '5B', 'R9', '2D', 'GD']}/>
          <Select label="Status" value={status} onChange={setStatus} options={['All Statuses', 'Active', 'Retired', 'Transferred', 'Fully Depreciated']}/>
          <Select label="Depreciation Method" value={method} onChange={setMethod} options={['All Methods', 'MACRS', 'MACRS ADS', 'Straight-Line']}/>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={reload}/>}

      {!error && (<div className="card">
          <div className="card-head">
            <h3>Assets</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">
                Showing 1–{items.length} of {total.toLocaleString()}
              </span>
              <Button variant="ghost" size="sm" onClick={reload} disabled={loading}>
                {loading ? 'Refreshing…' : '↻ Refresh'}
              </Button>
            </div>
          </div>

          {loading && <Loader label="Loading assets…"/>}

          {!loading && items.length === 0 && (<EmptyState title="No assets match these filters" description="Try widening the Asset Class or Company filter."/>)}

          {!loading && items.length > 0 && <AssetTable assets={items} onSelect={(a) => navigate(`/assets/${a.assetNumber}`)}/>}

          <div className="card-pad flex items-center justify-between">
            <span className="text-sm text-muted">Page 1 of 1</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" disabled>
                ‹ Prev
              </Button>
              <Button variant="ghost" size="sm" disabled>
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
