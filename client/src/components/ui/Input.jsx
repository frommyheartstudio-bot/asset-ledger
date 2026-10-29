// ======================================================
// File Name : Input.jsx
// Purpose   : Reusable UI component: Input
// ======================================================

import { useEffect, useRef, useState } from 'react';

// ======================================================
// START: Component Functions
// ======================================================

/** Labeled text input matching the app's .form-row styling. */
// ======================================================
// Function : Input
// Purpose  : React component that renders the 'Input' UI
// ======================================================

export function Input({ label, hint, id, onClear, ...rest }) {
    const inputId = id ?? `input-${label.replace(/\s+/g, '-').toLowerCase()}`;
    // Pass onClear to get a small X inside the box (shown only while it has text).
    const showClear = typeof onClear === 'function' && String(rest.value ?? '') !== '';
    return (<div className="form-row">
      <label htmlFor={inputId}>{label}</label>
      {onClear ? (<div style={{ position: 'relative' }}>
          <input id={inputId} {...rest} style={{ ...(rest.style ?? {}), paddingRight: 30 }}/>
          {showClear && (<button type="button" title="Clear" aria-label={`Clear ${label}`} onClick={onClear} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 14, lineHeight: 1, color: 'var(--text-muted, #64748b)' }}>✕</button>)}
        </div>) : (<input id={inputId} {...rest}/>)}
      {hint && <div className="hint">{hint}</div>}
    </div>);
}

// ======================================================
// END: Input
// ======================================================
/** Labeled select matching the same .form-row styling as Input. */
// ======================================================
// Function : Select
// Purpose  : React component that renders the 'Select' UI
// ======================================================

export function Select({ label, value, onChange, options, hint, placeholder }) {
    return (<div className="form-row">
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (<option key={o}>{o}</option>))}
      </select>
      {hint && <div className="hint">{hint}</div>}
    </div>);
}

// ======================================================
// END: Select
// ======================================================

/**
 * Labeled multi-select matching the same .form-row styling as Select, but
 * lets the person tick several options (plus a top "All …" checkbox that
 * ticks / unticks every option at once).
 *
 * `value` is either
 *   - null / undefined  -> "All" (nothing narrowed; every box ticked), or
 *   - an array          -> exactly the ticked options. [] really means NONE.
 * `onChange` receives null when everything is ticked again, otherwise the array.
 *
 * (Before, "empty array" meant "All", so unticking "All" just produced [] again
 * and the box could never be cleared.)
 */
// ======================================================
// Function : MultiSelect
// Purpose  : React component that renders the 'MultiSelect' UI
// ======================================================

export function MultiSelect({ label, value, onChange, options, allLabel, hint }) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);
    const allText = allLabel ?? `All ${label}`;

    useEffect(() => {
        if (!open) return undefined;
        const onDocClick = (e) => {
            if (rootRef.current && !rootRef.current.contains(e.target))
                setOpen(false);
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, [open]);

    const list = Array.isArray(value) ? value : null;           // null => everything
    const ticked = list ?? options;
    const allSelected = list === null || (options.length > 0 && options.every((o) => list.includes(o)));
    const summary = allSelected
        ? allText
        : ticked.length === 0
            ? 'None selected'
            : ticked.length === 1
                ? ticked[0]
                : `${ticked.length} selected`;

    // Ticking "All" selects everything; unticking it clears everything.
    const toggleAll = () => onChange(allSelected ? [] : null);
    const toggleOption = (opt) => {
        const next = ticked.includes(opt) ? ticked.filter((o) => o !== opt) : [...ticked, opt];
        // Everything ticked again is the same as "All".
        onChange(options.length > 0 && options.every((o) => next.includes(o)) ? null : next);
    };

    return (<div className="form-row" ref={rootRef}>
      <label>{label}</label>
      <div className={`multiselect ${open ? 'is-open' : ''}`}>
        <button type="button" className="multiselect-trigger" onClick={() => setOpen((o) => !o)}>
          <span>{summary}</span>
          <span className="multiselect-caret">▾</span>
        </button>
        {open && (<div className="multiselect-panel">
            <label className="multiselect-option multiselect-option-all">
              <input type="checkbox" checked={allSelected} onChange={toggleAll}/>
              <span>{allText}</span>
            </label>
            <div className="multiselect-divider"/>
            {options.map((opt) => (<label className="multiselect-option" key={opt}>
                <input type="checkbox" checked={ticked.includes(opt)} onChange={() => toggleOption(opt)}/>
                <span>{opt}</span>
              </label>))}
          </div>)}
      </div>
      {hint && <div className="hint">{hint}</div>}
    </div>);
}

// ======================================================
// END: MultiSelect
// ======================================================

// ======================================================
// END: Component Functions
// ======================================================

// ======================================================
// END OF FILE : Input.jsx
// ======================================================
