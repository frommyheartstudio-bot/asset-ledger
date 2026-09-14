// ======================================================
// File Name : LifecycleEvents.jsx
// Purpose   : Page-level component for LifecycleEvents
// ======================================================

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { lifecycleApi } from '../../api/lifecycle.api';
import { assetsApi } from '../../api/assets.api';
import { AppLayout } from '../../layout/AppLayout';
import { Pill } from '../../components/ui/ui';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { FIELD_SCHEMAS, FIELD_DEFAULTS, reinstatementFieldsFromAsset } from '../../data/lifecycleFormSchemas';
import { LIFECYCLE_TEST_CASES } from '../../data/lifecycleTestCases';


// ======================================================
// START: Page Component
// ======================================================

// ======================================================
// Function : LifecycleEvents
// Purpose  : React component that renders the 'LifecycleEvents' UI
// ======================================================

export function LifecycleEvents() {
    const [searchParams] = useSearchParams();
    const typeFromUrl = searchParams.get('type');
    const assetFromUrl = searchParams.get('asset');

    const [eventTypes, setEventTypes] = useState([]);
    const [selected, setSelected] = useState(typeFromUrl);
    const [assetNumber, setAssetNumber] = useState(assetFromUrl ?? '');
    // True only when we land here with a type already picked (Post Event
    // dropdown on Asset Detail) — that flow collapses the type picker
    // into a one-line summary since the choice is already made. Coming in
    // via the sidebar (no type in the URL) keeps the cards on screen even
    // after picking one, so switching event types is a single click.
    const [cardsCollapsed, setCardsCollapsed] = useState(!!typeFromUrl);
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

    // /lifecycle is a single Route, so navigating between "/lifecycle"
    // (sidebar, no params) and "/lifecycle?type=...&asset=..." (Post
    // Event dropdown) re-renders this same component instead of
    // remounting it — the useState initializers above only run once, on
    // the very first mount. Keep the selection/asset in sync with the
    // URL on every navigation so both entry points behave correctly
    // every time, not just on first load.
    useEffect(() => {
        setSelected(typeFromUrl);
        setAssetNumber(assetFromUrl ?? '');
        setCardsCollapsed(!!typeFromUrl);
        setPreview(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [typeFromUrl, assetFromUrl]);

    // "Post Event → Reinstatement" on Asset Detail lands here with the real
    // asset's own number in the URL, but until now only that number was
    // carried over — every other field (original cost, PISD, life,
    // original disposal date, A/D at disposal, gain/loss, convention,
    // bonus %) still had to be typed in by hand, which is exactly how a
    // reinstatement can quietly end up describing a different asset than
    // the one that was actually retired. Fetch that same asset's record and
    // prefill the whole card from it — same data, not just the number.
    useEffect(() => {
        if (typeFromUrl !== 'reinstatement' || !assetFromUrl) return;
        let cancelled = false;
        assetsApi.getByNumber(assetFromUrl)
            .then(({ asset }) => {
                if (cancelled) return;
                const fields = reinstatementFieldsFromAsset(asset);
                if (!fields) return;
                const today = new Date().toISOString().slice(0, 10);
                setFormDataByType((prev) => ({
                    ...prev,
                    reinstatement: {
                        ...fields,
                        // Transaction-specific, not part of the original asset —
                        // default to today, user can still change them.
                        reinstatementDate: today,
                        accountingPeriodDate: today
                    }
                }));
            })
            .catch(() => {
                // Lookup failed (e.g. asset not found) — leave the card blank
                // like before rather than blocking the page.
            });
        return () => { cancelled = true; };
    }, [typeFromUrl, assetFromUrl]);

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
        // Only auto-fill the demo asset number when no real asset number is
        // already loaded (e.g. via the Asset Detail "Post Event" flow's
        // ?asset= param, or typed in manually). Otherwise a test case's own
        // sample assetNumber would silently overwrite the real asset being
        // worked on, posting the transaction against the wrong asset.
        if (tc.assetNumber && !assetNumber.trim()) setAssetNumber(tc.assetNumber);
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
        {cardsCollapsed ? (<div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 style={{ fontSize: 14, margin: 0 }}>Event Type:</h3>
              <span style={{ fontWeight: 700 }}>{selectedEvent?.label ?? 'Addition'}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { setSelected(null); setCardsCollapsed(false); setPreview(null); }}>
              Change
            </Button>
          </div>) : (<>
            <h3 style={{ fontSize: 14, marginBottom: 14 }}>Select Event Type</h3>
            <div className="event-picker">
              {eventTypes.map((e) => (<div key={e.id} className={`event-card ${selected === e.id ? 'sel' : ''}`} onClick={() => selectCard(e.id)}>
                  <div className={`ei ico-${e.color}`}>{e.icon}</div>
                  <h4>{e.label}</h4>
                  <p>{e.description}</p>
                </div>))}
            </div>
          </>)}
      </div>

      {selected && (<div className="grid grid-2">
        <div className="card card-pad">
          <h3 style={{ fontSize: 14, marginBottom: 14 }}>Transaction Details — {selectedEvent?.label ?? 'Addition'}</h3>
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
                      <div className="mt-2 step-sections-body">
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
      </div>)}

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
