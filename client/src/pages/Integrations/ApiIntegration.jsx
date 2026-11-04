// ======================================================
// File Name : ApiIntegration.jsx
// Purpose   : Integrations -> API. A Postman-style client built into the app:
//             pick a request (one per lifecycle event + the read calls), paste
//             the x-api-key, edit the JSON body, click Send and see the status,
//             time and response. Each event is ONE request: a single object
//             posts one event, { "rows": [...] } posts many (same URL).
//             Posts made here are real and permanent (Posted By = svc:<key name>).
// ======================================================

import { useMemo, useState } from 'react';
import { integrationsApi } from '../../api/integrations.api';
import { AppLayout } from '../../layout/AppLayout';
import { Pill } from '../../components/ui/ui';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { DEFAULT_API_KEY } from '../../config/defaultApiKey';

const KEY_STORE = 'assetLedger.apiPage.key';

// ======================================================
// START: Request catalogue (mirrors the Postman collection)
// ======================================================

const today = () => new Date().toISOString().slice(0, 10);

// Per-event example `fields` (the required ones from SERVICE-API.md).
const EVENT_FIELDS = {
    Addition: () => ({ company: '5B', assetClass: '00.12', cost: 120000, placedInService: '2026-03-15', accountingPeriodDate: '2026-03-31', quarter: 'Q1 (Jan\u2013Mar)' }),
    Adjustment: () => ({ adjustmentAmount: 5000, effectiveDate: today() }),
    Transfer: () => ({ transferDate: today(), costTransferred: 10000, destCompany: '2D' }),
    Retirement: () => ({ disposalDate: today(), proceeds: 0 }),
    Reinstatement: () => ({ reinstatementDate: today() }),
    Reclassification: () => ({ effectiveDate: today(), newAssetType: '00.13' })
};

const EVENT_PATH = {
    Addition: '/lifecycle/additions',
    Adjustment: '/lifecycle/adjustments',
    Transfer: '/lifecycle/transfers',
    Retirement: '/lifecycle/retirements',
    Reinstatement: '/lifecycle/reinstatements',
    Reclassification: '/lifecycle/reclassifications'
};

const READS = [
    { id: 'me', label: 'Who am I', path: '/me' },
    { id: 'assets', label: 'Assets (list)', path: '/assets?limit=20' },
    { id: 'asset', label: 'One asset', path: '/assets/FA-1001' },
    { id: 'tx', label: 'Ledger transactions', path: '/lifecycle/transactions?assetNumber=FA-1001' },
    { id: 'ref', label: 'Status by externalRef', path: '/lifecycle/events/by-ref/ERP-ADD-1' }
];

const REQUESTS = [
    ...Object.keys(EVENT_PATH).map((ev) => ({ id: ev, group: 'Lifecycle events (single or bulk)', label: ev, method: 'POST', path: EVENT_PATH[ev], event: ev })),
    ...READS.map((r) => ({ ...r, group: 'Reads', method: 'GET' }))
];

// A fresh asset number / externalRef each time, so re-sending never trips the
// one-Addition rule or the duplicate-ref check. Non-Addition events act on an
// asset that must already exist, so they keep a placeholder to edit.
const stamp = () => String(Date.now()).slice(-7);

function singleBody(ev) {
    const id = stamp();
    return JSON.stringify({ assetNumber: ev === 'Addition' ? `FA-${id}` : 'FA-1001', externalRef: `UI-${ev.slice(0, 3).toUpperCase()}-${id}`, fields: EVENT_FIELDS[ev]() }, null, 2);
}

function bulkBody(ev) {
    const id = Number(stamp());
    const rows = [0, 1].map((i) => ({ assetNumber: ev === 'Addition' ? `FA-${id + i}` : 'FA-1001', externalRef: `UI-${ev.slice(0, 3).toUpperCase()}-${id + i}`, fields: EVENT_FIELDS[ev]() }));
    return JSON.stringify({ rows }, null, 2);
}

// ======================================================
// END: Request catalogue
// ======================================================

const pretty = (v) => (typeof v === 'string' ? v : JSON.stringify(v, null, 2));

export function ApiIntegration() {
    const { hasEdit } = useAuth();
    const canSend = hasEdit('api');

    const [reqId, setReqId] = useState('Addition');
    const [path, setPath] = useState(EVENT_PATH.Addition);
    const [body, setBody] = useState(() => singleBody('Addition'));
    const [apiKey, setApiKey] = useState(() => { try { return sessionStorage.getItem(KEY_STORE) ?? DEFAULT_API_KEY; } catch { return DEFAULT_API_KEY; } });
    const [sending, setSending] = useState(false);
    const [bodyError, setBodyError] = useState('');
    const [response, setResponse] = useState(null);

    const current = REQUESTS.find((r) => r.id === reqId);
    const isEvent = Boolean(current.event);
    const groups = useMemo(() => [...new Set(REQUESTS.map((r) => r.group))], []);

    function pick(id) {
        const r = REQUESTS.find((x) => x.id === id);
        setReqId(id);
        setPath(r.path);
        setBody(r.event ? singleBody(r.event) : '');
        setBodyError('');
        setResponse(null);
    }

    function changeKey(v) {
        setApiKey(v);
        try { sessionStorage.setItem(KEY_STORE, v); } catch { /* storage unavailable - key just isn't remembered */ }
    }

    async function send() {
        setBodyError('');
        if (isEvent) {
            try { JSON.parse(body); } catch (e) { setBodyError(`Body is not valid JSON: ${e.message}`); return; }
        }
        setSending(true);
        setResponse(null);
        try {
            setResponse(await integrationsApi.serviceRequest({ method: current.method, path: path.startsWith('/') ? path : `/${path}`, apiKey: apiKey.trim(), body: isEvent ? body : undefined }));
        } catch (err) {
            setResponse({ status: 0, ok: false, body: { error: `Could not reach the server: ${err.message}` }, ms: 0, size: 0 });
        } finally {
            setSending(false);
        }
    }

    const rb = response?.body;
    const results = Array.isArray(rb?.results) ? rb.results : [];
    const tone = !response ? 'gray' : response.ok ? 'green' : 'red';

    return (<AppLayout active="api" title="API" crumb="Home / Integrations / API">
      <div className="page-header">
        <div>
          <h1>API</h1>
          <p>Send requests to the Service API from here, the way you would in Postman. One request per event: a single object posts one event, <code>{'{ "rows": [ ... ] }'}</code> posts many. Posts are real and permanent.</p>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card card-pad">
          <h3 style={{ fontSize: 14, marginTop: 0 }}>1. Request</h3>

          <div className="form-row">
            <label htmlFor="api-key">API key (npm run service-account -- create &lt;name&gt;)</label>
            <input id="api-key" type="password" autoComplete="off" value={apiKey} onChange={(e) => changeKey(e.target.value)} placeholder="paste the full key, e.g. alk_..."/>
            <div className="hint">{apiKey === DEFAULT_API_KEY && DEFAULT_API_KEY ? 'Default key is pre-filled. ' : ''}Kept only for this browser tab.</div>
          </div>

          <div className="form-row">
            <label htmlFor="api-req">Request</label>
            <select id="api-req" value={reqId} onChange={(e) => pick(e.target.value)}>
              {groups.map((g) => (<optgroup key={g} label={g}>
                  {REQUESTS.filter((r) => r.group === g).map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                </optgroup>))}
            </select>
          </div>

          <div className="form-row">
            <label htmlFor="api-path">URL</label>
            <div className="flex gap-2">
              <Pill tone={current.method === 'POST' ? 'green' : 'blue'}>{current.method}</Pill>
              <input id="api-path" style={{ flex: 1 }} className="mono" value={path} onChange={(e) => setPath(e.target.value)} readOnly={isEvent}/>
            </div>
            <div className="hint mono">/api/service{path}</div>
          </div>

          {isEvent && (<div className="form-row">
              <label htmlFor="api-body">Body (JSON)</label>
              <div className="flex gap-2 mb-2">
                <Button variant="ghost" size="sm" onClick={() => { setBody(singleBody(current.event)); setBodyError(''); }}>Single example</Button>
                <Button variant="ghost" size="sm" onClick={() => { setBody(bulkBody(current.event)); setBodyError(''); }}>Bulk example</Button>
                <Button variant="ghost" size="sm" onClick={() => { try { setBody(JSON.stringify(JSON.parse(body), null, 2)); setBodyError(''); } catch (e) { setBodyError(`Body is not valid JSON: ${e.message}`); } }}>Beautify</Button>
              </div>
              <textarea id="api-body" className="mono" rows={16} spellCheck={false} value={body} onChange={(e) => setBody(e.target.value)} style={{ width: '100%' }}/>
              {bodyError && <p className="text-sm" style={{ color: 'var(--danger, #dc2626)' }}>{bodyError}</p>}
              <div className="hint">Examples get a fresh asset number and externalRef each time. Adjustment / Transfer / Retirement / Reinstatement / Reclassification need an asset that already exists - change <code>FA-1001</code>.</div>
            </div>)}

          <div className="flex gap-2 mt-2">
            <Button onClick={send} disabled={sending || !canSend || !apiKey.trim()}>{sending ? 'Sending…' : 'Send'}</Button>
          </div>
          {!canSend && <p className="text-sm text-muted" style={{ marginTop: 8 }}>You have view-only access to this page, so Send is disabled.</p>}
        </div>

        <div className="card card-pad">
          <h3 style={{ fontSize: 14, marginTop: 0 }}>2. Response</h3>
          {!response && <p className="text-muted text-sm">Nothing sent yet.</p>}
          {response && (<>
            <p style={{ margin: '0 0 8px' }}>
              <Pill tone={tone}>HTTP {response.status || 'no response'}</Pill>{' '}
              <span className="text-sm text-muted">{response.ms} ms · {response.size} B</span>{' '}
              {rb?.summary && <span className="text-sm">{rb.summary.posted} posted, {rb.summary.failed} failed (of {rb.summary.total})</span>}
              {rb?.duplicate && <span className="text-sm">same externalRef already posted - nothing new written</span>}
              {!response.ok && rb?.error && <span className="text-sm">{rb.error}</span>}
            </p>
            {results.length > 0 && (<div style={{ maxHeight: 220, overflow: 'auto', marginBottom: 8 }}>
                <table className="table">
                  <thead><tr><th>Asset #</th><th>Status</th><th>Error</th></tr></thead>
                  <tbody>
                    {results.map((r, i) => (<tr key={i}>
                        <td className="mono">{r.assetNumber}</td>
                        <td><Pill tone={r.status === 'posted' ? 'green' : 'red'}>{r.status}{r.duplicate ? ' (duplicate)' : ''}</Pill></td>
                        <td className="text-sm">{r.error || ''}</td>
                      </tr>))}
                  </tbody>
                </table>
              </div>)}
            <pre className="mono text-sm" style={{ maxHeight: 360, overflow: 'auto', margin: 0, whiteSpace: 'pre-wrap' }}>{pretty(rb)}</pre>
          </>)}
        </div>
      </div>
    </AppLayout>);
}

// ======================================================
// END OF FILE : ApiIntegration.jsx
// ======================================================
