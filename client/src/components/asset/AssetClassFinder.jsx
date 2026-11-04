// ======================================================
// File Name : AssetClassFinder.jsx
// Purpose   : "Find class" box for the Addition form. Type what the asset is
//             ("Dell laptop"); the server looks the IRS class + recovery
//             period up (irs.gov Pub 946 Table B-1) and shows matches. Clicking
//             a match selects that class in the form (only if it exists in
//             Configuration -> Asset Classes).
// ======================================================

import { useState } from 'react';
import { configApi } from '../../api/config.api';

export function AssetClassFinder({ classNames, onPick }) {
    const [q, setQ] = useState('');
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    async function find() {
        if (q.trim().length < 2) return;
        setBusy(true); setError(''); setResult(null);
        try { setResult(await configApi.lookupAssetClass(q.trim())); }
        catch (e) { setError(e?.message || 'Lookup failed'); }
        finally { setBusy(false); }
    }
    const inTable = (code) => classNames.find((n) => n === code || n === `US-${code}` || n === code.replace(/\.0$/, ''));

    return (<div className="class-finder">
      <div className="class-finder-title">Find asset class (IRS Pub 946)</div>
      <div className="class-finder-row">
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && find()}
          placeholder="e.g. Dell laptop, delivery truck" aria-label="Describe the asset"/>
        <button type="button" onClick={find} disabled={busy} className="btn btn-primary">{busy ? 'Searching…' : 'Find'}</button>
      </div>
      {error && <p style={{ color: '#dc2626', fontSize: 12, margin: '8px 0 0' }}>{error}</p>}
      {result && (<div style={{ marginTop: 10 }}>
        {result.matches.length === 0 && <p style={{ fontSize: 12, margin: 0 }}>No match found. Pick the Asset Class manually below.</p>}
        {result.matches.map((m) => {
            const target = inTable(m.code);
            return (<div key={m.code} className="class-finder-match">
              <div className="class-finder-match-text"><strong>{m.code}</strong> · GDS {m.gds} yrs · ADS {m.ads || '—'} yrs · class life {m.classLife}
                <div style={{ color: '#64748b' }}>{m.description}</div></div>
              <button type="button" className="btn btn-ghost btn-sm class-finder-use" disabled={!target} title={target ? '' : 'This class is not in your Asset Classes table'}
                onClick={() => onPick(target)}>{target ? 'Use' : 'Not in table'}</button>
            </div>);
        })}
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Source: {result.source}. Please confirm the class before posting.</div>
      </div>)}
    </div>);
}
