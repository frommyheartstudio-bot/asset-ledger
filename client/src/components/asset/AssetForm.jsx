// ======================================================
// File Name : AssetForm.jsx
// Purpose   : Reusable UI component: AssetForm
// ======================================================

import { useState } from 'react';
import { Input, Select } from '../ui/Input';
import { Button } from '../ui/Button';

// ======================================================
// START: Component Functions
// ======================================================

const ASSET_CLASSES = ['Network Equipment', 'Buildings', 'Machinery', 'Vehicles'];
const METHODS = ['MACRS ADS', 'MACRS 200% DB', 'Straight-Line'];
/** Add/edit form for a single asset. Used by the Assets/AssetForm page. */
// ======================================================
// Function : AssetForm
// Purpose  : React component that renders the 'AssetForm' UI
// ======================================================

export function AssetForm({ initial, onSubmit, submitLabel = 'Save Asset' }) {
    const [description, setDescription] = useState(initial?.description ?? '');
    const [assetClass, setAssetClass] = useState(initial?.assetClass ?? ASSET_CLASSES[0]);
    const [company, setCompany] = useState(initial?.company ?? '');
    const [cost, setCost] = useState(String(initial?.cost ?? ''));
    const [method, setMethod] = useState(initial?.method ?? METHODS[0]);
    function handleSubmit() {
        onSubmit({
            ...initial,
            description,
            assetClass,
            company,
            cost: Number(cost.replace(/,/g, '')) || 0,
            method
        });
    }
    return (<div className="card card-pad">
      <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. CNC Machine #4"/>
      <div className="form-grid">
        <Select label="Asset Class" value={assetClass} onChange={setAssetClass} options={ASSET_CLASSES}/>
        <Input label="Company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. 5B"/>
        <Input label="Cost" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0"/>
        <Select label="Depreciation Method" value={method} onChange={setMethod} options={METHODS}/>
      </div>
      <div className="flex gap-2 mt-2">
        <Button variant="primary" onClick={handleSubmit}>
          {submitLabel}
        </Button>
      </div>
    </div>);
}

// ======================================================
// END: AssetForm
// ======================================================

// ======================================================
// END: Component Functions
// ======================================================

