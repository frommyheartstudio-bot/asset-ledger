// ======================================================
// File Name : SearchSelect.jsx
// Purpose   : Reusable dropdown that (a) shows at most 10 rows at a time and
//             scrolls the rest, and (b) has a "type to search" box.
//             The list is drawn in a portal with fixed positioning, so it is
//             never clipped by a table / modal / card and it flips upward
//             when there is no room below (and stays above the mobile
//             bottom nav).
//
//             SmartSelect = plain native <select> for short lists (<= 10
//             options, best UX on phones) and SearchSelect for longer lists.
// ======================================================

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';

export const MAX_VISIBLE_OPTIONS = 10;

const SEARCH_BAR_H = 53;          // search box + its border
const LIST_PAD = 8;               // 4px top + 4px bottom inside the list
const TOPBAR_H = 60;
const BOTTOM_NAV_H = 58;
const EDGE = 8;

const toOption = (o) => (o !== null && typeof o === 'object'
    ? { value: String(o.value), label: String(o.label ?? o.value) }
    : { value: String(o), label: String(o) });

function rowHeight() {
    return window.matchMedia('(max-width: 767px)').matches ? 40 : 36;
}

// ======================================================
// Function : SearchSelect
// Props    : value, onChange(value), options (strings or {value,label}),
//            placeholder (also adds a blank "clear" row), className, style,
//            disabled, id, ariaLabel, maxVisible
// ======================================================

export function SearchSelect({
    value, onChange, options, placeholder, allowEmpty,
    className = '', style, disabled = false, id, ariaLabel, maxVisible = MAX_VISIBLE_OPTIONS
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [active, setActive] = useState(0);
    const [pos, setPos] = useState(null);
    const triggerRef = useRef(null);
    const panelRef = useRef(null);
    const listRef = useRef(null);
    const inputRef = useRef(null);

    const normalized = useMemo(() => options.map(toOption), [options]);
    const current = String(value ?? '');
    const selected = normalized.find((o) => o.value === current);
    const placeholderText = placeholder ?? '— Select —';
    const showEmptyRow = allowEmpty ?? (placeholder !== undefined && placeholder !== '');

    const filtered = useMemo(() => {
        const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
        const rows = tokens.length
            ? normalized.filter((o) => { const l = o.label.toLowerCase(); return tokens.every((t) => l.includes(t)); })
            : normalized;
        return !tokens.length && showEmptyRow ? [{ value: '', label: placeholderText, empty: true }, ...rows] : rows;
    }, [normalized, query, showEmptyRow, placeholderText]);

    // ---- positioning (fixed, flips up if no room below) ----
    function place() {
        const el = triggerRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const vv = window.visualViewport;
        const viewBottom = vv ? vv.offsetTop + vv.height : window.innerHeight;
        const vw = window.innerWidth;
        const navH = window.matchMedia('(max-width: 1000px)').matches ? BOTTOM_NAV_H : 0;

        const below = viewBottom - r.bottom - navH - EDGE - 4;
        const above = r.top - TOPBAR_H - EDGE - 4;
        const desired = SEARCH_BAR_H + Math.min(filtered.length, maxVisible) * rowHeight() + LIST_PAD;
        const openUp = below < Math.min(desired, 240) && above > below;
        const avail = Math.max(120, openUp ? above : below);
        const panelH = Math.min(desired, avail);

        const width = Math.min(Math.max(r.width, 240), vw - EDGE * 2);
        const left = Math.max(EDGE, Math.min(r.left, vw - width - EDGE));
        setPos({
            left, width, openUp,
            top: openUp ? undefined : r.bottom + 4,
            bottom: openUp ? window.innerHeight - r.top + 4 : undefined,
            listMax: Math.max(rowHeight() * 3, panelH - SEARCH_BAR_H)
        });
    }

    useLayoutEffect(() => { if (open) place(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [open, filtered.length]);

    useEffect(() => {
        if (!open) return undefined;
        const onScroll = (e) => { if (panelRef.current && panelRef.current.contains(e.target)) return; place(); };
        const onDown = (e) => {
            if (panelRef.current?.contains(e.target) || triggerRef.current?.contains(e.target)) return;
            close();
        };
        window.addEventListener('resize', place);
        window.addEventListener('scroll', onScroll, true);
        window.visualViewport?.addEventListener('resize', place);
        document.addEventListener('mousedown', onDown);
        document.addEventListener('touchstart', onDown, { passive: true });
        return () => {
            window.removeEventListener('resize', place);
            window.removeEventListener('scroll', onScroll, true);
            window.visualViewport?.removeEventListener('resize', place);
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('touchstart', onDown);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, filtered.length]);

    // focus the search box + scroll the current value into view when opening
    useEffect(() => {
        if (!open) return;
        const idx = Math.max(0, filtered.findIndex((o) => o.value === current));
        setActive(idx);
        requestAnimationFrame(() => {
            inputRef.current?.focus({ preventScroll: true });
            listRef.current?.querySelector('[data-selected="true"]')?.scrollIntoView({ block: 'nearest' });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    useEffect(() => { setActive(0); }, [query]);

    function close() { setOpen(false); setQuery(''); }
    function choose(opt) { onChange(opt.value); close(); triggerRef.current?.focus({ preventScroll: true }); }

    function onKeyDown(e) {
        if (e.key === 'Escape') { e.preventDefault(); close(); triggerRef.current?.focus({ preventScroll: true }); return; }
        if (e.key === 'Tab') { close(); return; }
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const next = Math.min(filtered.length - 1, Math.max(0, active + (e.key === 'ArrowDown' ? 1 : -1)));
            setActive(next);
            listRef.current?.children[next]?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filtered[active]) choose(filtered[active]);
        }
    }

    return (<>
      <button
        type="button" id={id} ref={triggerRef} disabled={disabled}
        className={`ss-trigger ${open ? 'is-open' : ''} ${className}`} style={style}
        aria-haspopup="listbox" aria-expanded={open} aria-label={ariaLabel}
        onClick={() => (open ? close() : setOpen(true))}
        onKeyDown={(e) => { if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { e.preventDefault(); setOpen(true); } }}
      >
        <span className={`ss-value ${selected && selected.value !== '' ? '' : 'ss-placeholder'}`}>{selected && selected.value !== '' ? selected.label : placeholderText}</span>
        <span className="ss-caret"><Icon name="chevronDown" size={14}/></span>
      </button>
      {open && pos && createPortal(<div
          ref={panelRef} className="ss-panel" role="presentation"
          style={{ left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom }}
        >
          <div className="ss-search">
            <input
              ref={inputRef} type="text" value={query} autoComplete="off" autoCorrect="off" spellCheck={false}
              placeholder={`Search ${normalized.length} options…`} aria-label="Search options"
              onChange={(e) => setQuery(e.target.value)} onKeyDown={onKeyDown}
            />
            {query && <button type="button" className="ss-clear" aria-label="Clear search" onClick={() => { setQuery(''); inputRef.current?.focus(); }}>✕</button>}
          </div>
          <div ref={listRef} className="ss-list" role="listbox" style={{ maxHeight: pos.listMax }}>
            {filtered.length === 0
                ? <div className="ss-empty">No matches for “{query}”</div>
                : filtered.map((o, i) => (<div
                    key={`${o.value}-${i}`} role="option" aria-selected={o.value === current}
                    data-selected={o.value === current && !o.empty}
                    className={`ss-option ${i === active ? 'is-active' : ''} ${o.value === current && !o.empty ? 'is-selected' : ''} ${o.empty ? 'is-empty-row' : ''}`}
                    onMouseEnter={() => setActive(i)} onClick={() => choose(o)}
                  >{o.label}</div>))}
          </div>
        </div>, document.body)}
    </>);
}

// ======================================================
// Function : SmartSelect
// Purpose  : native <select> when the list is short, SearchSelect otherwise.
//            nativeClassName / nativeStyle style the native one;
//            className / style style the SearchSelect trigger.
// ======================================================

export function SmartSelect({
    value, onChange, options, placeholder, allowEmpty, className, style, nativeClassName, nativeStyle,
    disabled, id, ariaLabel, maxVisible = MAX_VISIBLE_OPTIONS
}) {
    const normalized = useMemo(() => options.map(toOption), [options]);
    if (normalized.length > maxVisible) {
        return (<SearchSelect
          value={value} onChange={onChange} options={normalized} placeholder={placeholder} allowEmpty={allowEmpty}
          className={className} style={style} disabled={disabled} id={id} ariaLabel={ariaLabel} maxVisible={maxVisible}
        />);
    }
    return (<select
      id={id} aria-label={ariaLabel} className={nativeClassName} style={nativeStyle ?? style} disabled={disabled}
      value={value} onChange={(e) => onChange(e.target.value)}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {normalized.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
    </select>);
}

// ======================================================
// END OF FILE : SearchSelect.jsx
// ======================================================
