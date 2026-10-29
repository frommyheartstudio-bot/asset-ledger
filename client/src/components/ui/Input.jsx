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

export function Input({ label, hint, id, ...rest }) {
    const inputId = id ?? `input-${label.replace(/\s+/g, '-').toLowerCase()}`;
    return (<div className="form-row">
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} {...rest}/>
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
 * selects/clears every option at once). `value` is an array of the
 * currently-checked options; an empty array is treated as "All".
 */
// ======================================================
// Function : MultiSelect
// Purpose  : React component that renders the 'MultiSelect' UI
// ======================================================

export function MultiSelect({ label, value, onChange, options, allLabel, hint }) {
    const [open, setOpen] = useState(false);
    // `value === []` means "All" to the parent (no filter), so on its own it
    // can't tell "everything" apart from "the person unticked everything".
    // `none` remembers the second case so the boxes can really be cleared.
    const [none, setNone] = useState(false);
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

    // If the parent puts something into `value` (or options reload), the
    // "nothing ticked" state no longer applies.
    useEffect(() => { if (value.length > 0) setNone(false); }, [value]);

    const allSelected = !none && (value.length === 0 || value.length === options.length);
    const summary = none
        ? 'None selected'
        : allSelected
            ? allText
            : value.length === 1
                ? value[0]
                : `${value.length} selected`;

    // "All" box: ticked -> untick everything; unticked -> tick everything.
    const toggleAll = () => {
        if (allSelected) {
            setNone(true);
            onChange([]);
        } else {
            setNone(false);
            onChange([]);
        }
    };
    const toggleOption = (opt) => {
        // Expand the implicit "everything" state into an explicit list the
        // first time a single option is unchecked, then toggle normally.
        const current = none ? [] : (allSelected ? [...options] : value);
        const next = current.includes(opt) ? current.filter((o) => o !== opt) : [...current, opt];
        if (next.length === 0) {
            // Last box unticked: stay on "nothing ticked" instead of
            // bouncing back to All.
            setNone(true);
            onChange([]);
            return;
        }
        setNone(false);
        // Selecting every option is the same as selecting none — collapse
        // back to "All" so the summary label stays clean.
        onChange(next.length === options.length ? [] : next);
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
                <input type="checkbox" checked={allSelected || (!none && value.includes(opt))} onChange={() => toggleOption(opt)}/>
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
