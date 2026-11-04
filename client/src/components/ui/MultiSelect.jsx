// ======================================================
// File Name : MultiSelect.jsx
// Purpose   : Reusable UI component: MultiSelect
// ======================================================

import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import { MAX_VISIBLE_OPTIONS } from './SearchSelect';

// ======================================================
// START: Component Functions
// ======================================================

/**
 * Labeled checkbox multi-select, styled like Input/Select's .form-row.
 * Opens a checkbox panel below a summary button; the first row is
 * always a "Select All" toggle. `options` is [{ value, label }],
 * `selected` / `onChange` carry the array of selected values.
 */
// ======================================================
// Function : MultiSelect
// Purpose  : React component that renders the 'MultiSelect' UI
// ======================================================

export function MultiSelect({ label, options, selected, onChange, allLabel = 'All' }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const wrapRef = useRef(null);
    const searchable = options.length > MAX_VISIBLE_OPTIONS;
    const shown = query.trim()
        ? options.filter((o) => String(o.label).toLowerCase().includes(query.trim().toLowerCase()))
        : options;

    useEffect(() => {
        function onDocMouseDown(e) {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) { setOpen(false); setQuery(''); }
        }
        document.addEventListener('mousedown', onDocMouseDown);
        return () => document.removeEventListener('mousedown', onDocMouseDown);
    }, []);

    const allSelected = options.length > 0 && selected.length === options.length;

    function toggleAll() {
        onChange(allSelected ? [] : options.map((o) => o.value));
    }
    function toggleOne(value) {
        onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
    }

    const summary = options.length === 0
        ? 'No options'
        : allSelected
            ? allLabel
            : selected.length === 0
                ? 'None selected'
                : selected.length === 1
                    ? (options.find((o) => o.value === selected[0])?.label ?? selected[0])
                    : `${selected.length} selected`;

    return (<div className="form-row" ref={wrapRef} style={{ position: 'relative' }}>
      <label>{label}</label>
      <button type="button" className="btn btn-ghost" onClick={() => setOpen((o) => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' }}>
        <span>{summary}</span>
        <span aria-hidden="true" style={{ marginLeft: 8, flexShrink: 0 }}><Icon name={open ? 'chevronUp' : 'chevronDown'} size={14}/></span>
      </button>
      {open && (<div className="card" style={{
            position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
            zIndex: 30, boxShadow: 'var(--shadow-lg)', padding: '4px 0'
        }}>
          {searchable && (<div className="multiselect-search">
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${options.length} options…`} aria-label="Search options" autoComplete="off"/>
            </div>)}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer', borderBottom: '1px solid var(--border)' }}>
            <input type="checkbox" checked={allSelected} onChange={toggleAll}/>
            Select All
          </label>
          {/* shows 10 rows, the rest scrolls */}
          <div className="multiselect-list">
            {shown.map((o) => (<label key={o.value} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" checked={selected.includes(o.value)} onChange={() => toggleOne(o.value)}/>
                {o.label}
              </label>))}
            {shown.length === 0 && <div className="ss-empty">No matches</div>}
          </div>
        </div>)}
    </div>);
}

// ======================================================
// END: MultiSelect
// ======================================================

// ======================================================
// END: Component Functions
// ======================================================

// ======================================================
// END OF FILE : MultiSelect.jsx
// ======================================================
