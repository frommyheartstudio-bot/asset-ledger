// ======================================================
// File Name : EventFormBase.jsx
// Purpose   : Shared rendering logic for the six real Lifecycle Event
//             cards (Addition, Adjustment, Transfer, Retirement,
//             Reinstatement, Reclassification). Each of those now lives
//             in its own file (Addition.jsx, Adjustment.jsx, ...) so it
//             can be edited independently, but every one of them is a
//             thin wrapper that just hands its own `schema` to THIS
//             component — the actual "Transaction Details" form, the
//             Depreciation Impact Preview panel, and the Confirm & Post
//             modal are only written once, here.
//             Cross-card state (assetNumber, formData, preview, posted,
//             confirm modal, posting) still lives in LifecycleEvents.jsx
//             (the parent) since it's shared across whichever card is
//             active — this component only receives it as props.
// ======================================================

import { Pill } from '../../../components/ui/ui';
import { Button } from '../../../components/ui/Button';
import { Input, Select } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState } from '../../../components/common/EmptyState';
import { useAssetClassRows, useAssetClasses, lifeToMonths, conventionToOption } from '../../../hooks/useAssetClasses';

// ======================================================
// START: Component Functions
// ======================================================

// ======================================================
// Function : EventFormBase
// Purpose  : React component that renders the shared per-type form UI
// ======================================================

export function EventFormBase({
    eventLabel,
    schema,
    assetNumber,
    setAssetNumber,
    formData,
    setField,
    setPreview,
    loading,
    calculatePreview,
    preview,
    posted,
    setPosted,
    confirmOpen,
    setConfirmOpen,
    postTransaction,
    posting,
    postError,
    blockMessage,
    canPost
}) {
    const assetClassNames = useAssetClasses();
    const assetClassRows = useAssetClassRows();
    // Picking an Asset Class fills Property Type / Method / Rate % /
    // Convention / Life straight from that row of the asset_classes table.
    function handleAssetClassChange(name) {
        setField('assetClass', name);
        const row = assetClassRows.find((r) => r.name === name);
        setField('propertyType', row?.propertyType ?? '');
        setField('method', row?.method ?? '');
        setField('ratePct', row?.ratePct ?? '');
        if (!row) return;
        const months = lifeToMonths(row.life);
        if (months !== null) setField('lifeMonths', String(months));
        const conv = conventionToOption(row.convention);
        if (conv) setField('convention', conv);
    }
    return (<>
      <div className="grid grid-2">
        <div className="card card-pad">
          <h3 style={{ fontSize: 14, marginBottom: 14 }}>Transaction Details — {eventLabel ?? 'Addition'}</h3>
          <Input
            label="Asset Number"
            value={assetNumber}
            placeholder="e.g. 845862189"
            hint="Required — the transaction is linked to this asset."
            onChange={(e) => setAssetNumber(e.target.value)}
          />
          {blockMessage && (<p className="text-sm" style={{ color: 'var(--danger, #dc2626)', fontWeight: 700, margin: '-6px 0 12px' }}>{blockMessage}</p>)}
          <div className="form-grid">
            {schema.map((field) => {
                if (field.type === 'readonly') {
                    return (<Input key={field.key} label={field.label} value={formData[field.key] ?? ''} readOnly placeholder="—" hint={field.hint}/>);
                }
                if (field.type === 'select') {
                    return (<Select key={field.key} label={field.label} placeholder={field.placeholder} value={formData[field.key] ?? ''} onChange={(v) => (field.optionsSource === 'assetClasses' ? handleAssetClassChange(v) : setField(field.key, v))} options={field.optionsSource === 'assetClasses' ? assetClassNames : field.options} hint={field.hint}/>);
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
            <Button variant="primary" onClick={calculatePreview} disabled={loading || !assetNumber.trim() || !!blockMessage}>
              {loading ? 'Calculating…' : 'Calculate Preview'}
            </Button>
            {!assetNumber.trim() && <span className="hint" style={{ marginLeft: 8 }}>Enter an Asset Number first</span>}
          </div>
        </div>

        <div className="card">
          {preview ? (<>
              <div className="card-head">
                <h3>Depreciation Impact Preview — {eventLabel ?? 'Addition'}</h3>
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
                  <Button variant="primary" onClick={() => setConfirmOpen(true)} disabled={posted || !!blockMessage || !canPost} title={!canPost ? 'You have view-only access to Lifecycle Events' : undefined}>
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
            <Button variant="primary" onClick={postTransaction} disabled={posting || !canPost}>
              {posting ? 'Posting…' : 'Confirm & Post'}
            </Button>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)} disabled={posting}>
              Cancel
            </Button>
          </div>}>
        <p className="text-sm">
          Post this {eventLabel ?? 'Addition'} for asset <strong>{assetNumber}</strong>? This will update the depreciation
          schedule immediately.
        </p>
        {postError && (<p className="text-sm mt-2" style={{ color: 'var(--danger, #dc2626)', fontWeight: 700 }}>{postError}</p>)}
      </Modal>
    </>);
}

// ======================================================
// END: EventFormBase
// ======================================================

// ======================================================
// END: Component Functions
// ======================================================

// ======================================================
// END OF FILE : EventFormBase.jsx
// ======================================================
