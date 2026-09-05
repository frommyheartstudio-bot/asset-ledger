// ======================================================
// File Name : LifecycleEvents.jsx
// Purpose   : Page-level component for LifecycleEvents
// ======================================================

import { useEffect, useState } from 'react';
import { lifecycleApi } from '../../api/lifecycle.api';
import { AppLayout } from '../../layout/AppLayout';
import { Pill } from '../../components/ui/ui';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { FIELD_SCHEMAS, FIELD_DEFAULTS } from '../../data/lifecycleFormSchemas';
import { LIFECYCLE_TEST_CASES } from '../../data/lifecycleTestCases';


// ======================================================
// START: Page Component
// ======================================================

// ======================================================
// Function : LifecycleEvents
// Purpose  : React component that renders the 'LifecycleEvents' UI
// ======================================================

export function LifecycleEvents() {
    const [eventTypes, setEventTypes] = useState([]);
    const [selected, setSelected] = useState('addition');
    const [assetNumber, setAssetNumber] = useState('');
    // One bucket of field values per card, so switching cards never loses
    // what you typed into the other one.
    const [formDataByType, setFormDataByType] = useState(() => ({ ...FIELD_DEFAULTS }));
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [posting, setPosting] = useState(false);
    const [posted, setPosted] = useState(false);

    useEffect(() => {
        lifecycleApi.getEventTypes().then(setEventTypes);
    }, []);

    const selectedEvent = eventTypes.find((e) => e.id === selected);
    const schema = FIELD_SCHEMAS[selected] ?? [];
    const formData = formDataByType[selected] ?? {};

    function selectCard(id) {
        setSelected(id);
        setPreview(null);
    }

    function setField(key, value) {
        setFormDataByType((prev) => ({
            ...prev,
            [selected]: { ...prev[selected], [key]: value }
        }));
    }

    // "Load Test Case" — same option set (100%) as the reference calculators'
    // dropdown, ported per event type from Htmls/js/*.js. Fills every field
    // on the active card at once, the same way the standalone HTML pages do.
    const testCases = LIFECYCLE_TEST_CASES[selected] ?? [];

    function loadTestCase(caseId) {
        const tc = testCases.find((c) => c.id === caseId);
        if (!tc) return;
        setFormDataByType((prev) => ({ ...prev, [selected]: { ...tc.values } }));
        if (tc.assetNumber) setAssetNumber(tc.assetNumber);
        setPreview(null);
    }

    async function calculatePreview() {
        setLoading(true);
        setPosted(false);
        try {
            const result = await lifecycleApi.preview({
                eventType: selectedEvent?.label ?? 'Addition',
                assetNumber,
                fields: formData
            });
            setPreview(result);
        } finally {
            setLoading(false);
        }
    }

    // "Confirm & Post" — writes one immutable row to the ClickHouse
    // asset_transactions ledger. The right-side table keeps showing the
    // same calculation (preview), now marked Posted.
    async function postTransaction() {
        setPosting(true);
        try {
            await lifecycleApi.post({
                eventType: selectedEvent?.label ?? 'Addition',
                assetNumber,
                fields: formData,
                preview
            });
            setPosted(true);
            setConfirmOpen(false);
        } finally {
            setPosting(false);
        }
    }

    const crumb = `Home / Lifecycle Events${selectedEvent ? ` / ${selectedEvent.label}` : ''}`;

    return (<AppLayout active="lifecycle" title="Lifecycle Events" crumb={crumb}>
      <div className="page-header">
        <div>
          <h1>Post Lifecycle Event</h1>
          <p>Process a transaction against an asset and preview its depreciation impact</p>
        </div>
      </div>

      <div className="card card-pad mb-4">
        <h3 style={{ fontSize: 14, marginBottom: 14 }}>1. Select Event Type</h3>
        <div className="event-picker">
          {eventTypes.map((e) => (<div key={e.id} className={`event-card ${selected === e.id ? 'sel' : ''}`} onClick={() => selectCard(e.id)}>
              <div className={`ei ico-${e.color}`}>{e.icon}</div>
              <h4>{e.label}</h4>
              <p>{e.description}</p>
            </div>))}
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card card-pad">
          <h3 style={{ fontSize: 14, marginBottom: 14 }}>2. Transaction Details — {selectedEvent?.label ?? 'Addition'}</h3>
          <div className="form-row">
            <label htmlFor="lc-load-tc">Load Test Case</label>
            <select id="lc-load-tc" key={selected} defaultValue="" onChange={(e) => loadTestCase(e.target.value)}>
              <option value="">— Select —</option>
              {testCases.map((tc) => (<option key={tc.id} value={tc.id}>
                  {tc.name}
                </option>))}
            </select>
            <div className="hint">Same scenarios as the reference calculator — fills every field below.</div>
          </div>
          <Input
            label="Asset Number"
            value={assetNumber}
            placeholder="e.g. 845862189"
            hint="Required — the transaction is linked to this asset."
            onChange={(e) => setAssetNumber(e.target.value)}
          />
          <div className="form-grid">
            {schema.map((field) => {
                if (field.type === 'select') {
                    return (<Select key={field.key} label={field.label} value={formData[field.key] ?? ''} onChange={(v) => setField(field.key, v)} options={field.options} hint={field.hint}/>);
                }
                if (field.type === 'checkbox') {
                    return (<div className="form-row" key={field.key}>
                        <label htmlFor={`lc-${field.key}`}>{field.label}</label>
                        <input id={`lc-${field.key}`} type="checkbox" checked={!!formData[field.key]} onChange={(e) => setField(field.key, e.target.checked)}/>
                      </div>);
                }
                return (<Input key={field.key} label={field.label} type={field.type} value={formData[field.key] ?? ''} placeholder={field.placeholder} hint={field.hint} onChange={(e) => setField(field.key, e.target.value)}/>);
            })}
          </div>
          <div className="flex gap-2 mt-2">
            <Button variant="primary" onClick={calculatePreview} disabled={loading || !assetNumber.trim()}>
              {loading ? 'Calculating…' : 'Calculate Preview'}
            </Button>
            {!assetNumber.trim() && <span className="hint" style={{ marginLeft: 8 }}>Enter an Asset Number first</span>}
          </div>
        </div>

        <div className="card">
          {preview ? (<>
              <div className="card-head">
                <h3>Depreciation Impact Preview — {selectedEvent?.label ?? 'Addition'}</h3>
                <div className="flex gap-2">
                  <Pill tone={preview.badgeTone}>{preview.badgeText}</Pill>
                  {posted && <Pill tone="green">Posted ✓</Pill>}
                </div>
              </div>
              <div className="card-pad">
                <table className="table" style={{ fontSize: 13 }}>
                  <tbody>
                    {preview.rows.map((row) => (<tr key={row.label} style={row.emphasize ? { fontWeight: 700 } : undefined}>
                        <td className={row.emphasize ? '' : 'text-muted'}>{row.label}</td>
                        <td className="text-right">{row.value}</td>
                      </tr>))}
                  </tbody>
                </table>
                <div className="formula-note text-sm text-muted mt-2">{preview.formulaNote}</div>

                {/* Full step-by-step calculation breakdown — same formulas
                    shown in the standalone reference calculators' Results
                    panel (Htmls/pages/*.html). Collapsed by default so the
                    summary above stays the focus, but every step is here. */}
                {preview.sections && preview.sections.length > 0 && (<div className="mt-4">
                    <details className="step-sections">
                      <summary>Show full calculation ({preview.sections.length} steps)</summary>
                      <div className="mt-2">
                        {preview.sections.map((sec) => (<div className="step-section" key={sec.title}>
                            <div className="step-section-header">{sec.title}</div>
                            <table className="table step-section-table">
                              <tbody>
                                {sec.rows.map((row, i) => (<tr key={i}>
                                    <td className="text-muted">{row.label}</td>
                                    <td className="text-right">{row.value}</td>
                                  </tr>))}
                              </tbody>
                            </table>
                          </div>))}
                      </div>
                    </details>
                  </div>)}

                <div className="flex gap-2 mt-4">
                  <Button variant="primary" onClick={() => setConfirmOpen(true)} disabled={posted}>
                    {posted ? 'Posted' : 'Post Transaction'}
                  </Button>
                  <Button variant="ghost" onClick={() => { setPreview(null); setPosted(false); }}>
                    Reset
                  </Button>
                </div>
              </div>
            </>) : (<EmptyState title="No calculation yet" description="Fill in the transaction details on the left and hit Calculate — the result will show up here."/>)}
        </div>
      </div>

      <Modal open={confirmOpen} title="Confirm Transaction" onClose={() => setConfirmOpen(false)} footer={<div className="flex gap-2">
            <Button variant="primary" onClick={postTransaction} disabled={posting}>
              {posting ? 'Posting…' : 'Confirm & Post'}
            </Button>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)} disabled={posting}>
              Cancel
            </Button>
          </div>}>
        <p className="text-sm">
          Post this {selectedEvent?.label ?? 'Addition'} for asset <strong>{assetNumber}</strong>? This will update the depreciation
          schedule immediately.
        </p>
      </Modal>
    </AppLayout>);
}


// ======================================================
// END: LifecycleEvents
// ======================================================

// ======================================================
// END: Page Component
// ======================================================
