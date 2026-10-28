// ======================================================
// File Name : mock-sap-server.mjs
// Purpose   : A stand-in for the client's SAP API, so the app can make a REAL
//             HTTP call during demos/tests (before the client gives us the real
//             SAP URL). It behaves like SAP would: read-only GET, Bearer token,
//             JSON, SAP technical column names, SAP date (DD.MM.YYYY) and
//             amount ("62.000,00") styles. It is NOT part of the app itself.
// Run       : npm run mock-sap      (port 4100, token "demo-token")
//             then in server/.env:
//               SAP_BASE_URL=http://localhost:4100
//               SAP_API_TOKEN=demo-token
// ======================================================

import http from 'node:http';

const PORT = Number(process.env.MOCK_SAP_PORT || 4100);
const TOKEN = process.env.MOCK_SAP_TOKEN || 'demo-token';

// ======================================================
// START: Dummy SAP data (SAP-style names and formats)
// ======================================================

const RECORDS = [
  { BELNR: '4900001', BUKRS: '1000', ANLN1: '000100200', ANLKL: '3000', TXT50: 'Laptops (50 units)',   AKTIV: '10.02.2026', ANSWL: '62.000,00' },
  { BELNR: '4900002', BUKRS: '2000', ANLN1: '000100201', ANLKL: '3100', TXT50: 'CNC machine',          AKTIV: '22.04.2026', ANSWL: '215.000,00' },
  { BELNR: '4900003', BUKRS: '3000', ANLN1: '000100202', ANLKL: '3200', TXT50: 'Office furniture',     AKTIV: '08.07.2026', ANSWL: '38.500,00' },
  { BELNR: '4900004', BUKRS: '1000', ANLN1: '000100203', ANLKL: '3300', TXT50: 'Delivery van',         AKTIV: '14.09.2026', ANSWL: '54.000,00' },
  { BELNR: '4900005', BUKRS: '4000', ANLN1: '000100204', ANLKL: '9999', TXT50: 'Unmapped asset class', AKTIV: '30.09.2026', ANSWL: '12.000,00' }
];

// ======================================================
// END: Dummy SAP data
// ======================================================

// Function : isoOf
// Purpose  : DD.MM.YYYY -> YYYY-MM-DD, only used to filter by from/to.
const isoOf = (d) => d.split('.').reverse().join('-');

// ======================================================
// START: HTTP server
// ======================================================

http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const send = (code, body) => {
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
  };
  console.log(`${new Date().toISOString()}  ${req.method} ${req.url}`);

  if (req.method !== 'GET') return send(405, { error: 'Read-only API: only GET is allowed' });
  if (req.headers.authorization !== `Bearer ${TOKEN}`) return send(401, { error: 'Invalid or missing token' });
  if (url.pathname !== '/assets') return send(404, { error: 'Not found' });

  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');
  const records = RECORDS.filter((r) => (!from || isoOf(r.AKTIV) >= from) && (!to || isoOf(r.AKTIV) <= to));
  send(200, { records });
}).listen(PORT, () => console.log(`Mock SAP API on http://localhost:${PORT}/assets  (token: ${TOKEN})`));

// ======================================================
// END: HTTP server
// ======================================================

// ======================================================
// END OF FILE : mock-sap-server.mjs
// ======================================================
