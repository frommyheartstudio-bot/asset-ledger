import { fetchSapRecords, sapMode } from '../src/services/integrations/sapAdapter.ts';
console.log('mode =', sapMode());
try { console.log(JSON.stringify(await fetchSapRecords({ from: '2026-01-01', to: '2026-09-30' }), null, 1)); }
catch (e) { console.log('ERROR:', (e as Error).message); }
