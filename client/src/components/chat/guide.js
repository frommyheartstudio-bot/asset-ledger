// ======================================================
// File Name : guide.js
// Purpose   : "How do I...?" answers for the chat assistant, written from the
//             real menu, routes and forms of this app.
// ======================================================

export const GUIDE = [
  {
    id: 'map',
    keys: ['menu', 'pages', 'modules', 'project', 'overview', 'what can', 'where is everything', 'sections'],
    title: 'Project map',
    text: `Left menu:
- Dashboard: portfolio totals and monthly depreciation
- Asset Register: list, search, export, add assets
- Asset Detail: full record of one asset
- Lifecycle Events: addition, adjustment, transfer, retirement, reinstatement, reclassification
- Bulk Import: post many events from a CSV
- Planning: Modeling, Forecasting
- Compliance: Reporting
- Configuration: Pub 946 Tables, Bonus Depreciation, Asset Classes, Books List
- Administration: User Management`,
    link: { label: 'Open Dashboard', to: '/' }
  },
  {
    id: 'add',
    keys: ['add asset', 'new asset', 'add new', 'create asset', 'capitalize', 'addition', 'add an asset'],
    title: 'Add a new asset',
    text: `Option 1 (single asset):
1. Open Asset Register from the left menu.
2. Click "+ Add Asset" (top right) - it opens the Addition form in Lifecycle Events.
3. Fill in the form, calculate the preview and post it.

Option 2 (as a posted event):
1. Open Lifecycle Events and choose "Addition".
2. Pick the Asset Class (it auto-fills property type, method, rate %, life and bonus %).
3. Enter Asset Cost, Placed-In-Service Date and Accounting Period Date, then post.

You need edit access for this. Many assets at once: use Bulk Import.`,
    link: { label: 'Go to Add Asset', to: '/lifecycle?type=addition' }
  },
  {
    id: 'adjust',
    keys: ['adjust', 'adjustment', 'correct cost', 'change cost', 'increase cost', 'decrease cost'],
    title: 'Adjust an asset',
    text: `1. Open Lifecycle Events and choose "Adjustment".
2. Select the asset.
3. Enter Original Asset Cost, PISD, Existing Accum Depr (BOY), Prior Adjustment Balance.
4. Enter the Adjustment Amount (use a minus sign to reduce), plus Effective Date and Accounting Period Date.
5. Check Convention, Quarter and Bonus %, then post the event.`,
    link: { label: 'Open Lifecycle Events', to: '/lifecycle' }
  },
  {
    id: 'retire',
    keys: ['retire', 'retirement', 'dispose', 'disposal', 'sell asset', 'scrap', 'write off'],
    title: 'Retire (dispose of) an asset',
    text: `1. Open Lifecycle Events and choose "Retirement".
2. Select the asset.
3. Check Asset Cost, PISD, Convention, Quarter, Bonus % and BOY Accumulated Depr.
4. Enter Disposal Date, Accounting Period Date, Cost Disposed and Proceeds (sale amount).
5. Post the event. The asset status changes to Retired.

Retired by mistake? Use "Reinstatement" to bring it back.`,
    link: { label: 'Open Lifecycle Events', to: '/lifecycle' }
  },
  {
    id: 'reinstate',
    keys: ['reinstate', 'reinstatement', 'undo retire', 'bring back', 'restore asset'],
    title: 'Reinstate a retired asset',
    text: `1. Open Lifecycle Events and choose "Reinstatement".
2. Select the retired asset (fields are pre-filled from its record).
3. Confirm Original Disposal Date, A/D at Disposal, Original Gain/Loss.
4. Enter Reinstatement Date and Accounting Period, then post.`,
    link: { label: 'Open Lifecycle Events', to: '/lifecycle' }
  },
  {
    id: 'transfer',
    keys: ['transfer', 'move asset', 'change location', 'change company'],
    title: 'Transfer an asset',
    text: `1. Open Lifecycle Events and choose "Transfer".
2. Select the asset.
3. Enter Cost Transferred, Transfer Date and Accounting Period.
4. Fill Source and Dest Company, and Source and Dest Location, then post.`,
    link: { label: 'Open Lifecycle Events', to: '/lifecycle' }
  },
  {
    id: 'reclass',
    keys: ['reclass', 'reclassify', 'reclassifying', 'reclassification', 'change class', 'change asset class', 'change method'],
    title: 'Reclassify an asset',
    text: `1. Open Lifecycle Events and choose "Reclassification".
2. Select the asset.
3. Enter the Old Asset Type, Old Method, Old Life, Old Convention and Old Bonus %, then the new class details.
4. Post the event.`,
    link: { label: 'Open Lifecycle Events', to: '/lifecycle' }
  },
  {
    id: 'bulk',
    keys: ['bulk', 'import', 'csv', 'upload', 'many assets at once', 'excel'],
    title: 'Bulk import',
    text: `1. Open Bulk Import (Asset Management group), or use "Master Data Set" inside Lifecycle Events.
2. Download the CSV template.
3. Fill one row per transaction. The eventType column must be one of: Addition, Adjustment, Transfer, Retirement, Reinstatement, Reclassification.
4. Upload the file, fix any warnings, then post all.`,
    link: { label: 'Open Bulk Import', to: '/lifecycle/bulk-import' }
  },
  {
    id: 'find',
    keys: ['find asset', 'search', 'filter', 'look up', 'asset detail', 'view asset', 'export'],
    title: 'Find or export assets',
    text: `Open Asset Register. Use Search (asset number or description) and the Asset Class, Company and Status filters. "Export CSV" downloads the list (or only the rows you ticked). Click an asset to open its Asset Detail page.`,
    link: { label: 'Open Asset Register', to: '/assets' }
  },
  {
    id: 'reports',
    keys: ['report', 'reporting', 'forecast', 'forecasting', 'modeling', 'model', 'what if'],
    title: 'Reports, modeling and forecasting',
    text: `Reporting (Compliance) has the depreciation reports. Modeling and Forecasting (Planning) let you test scenarios and project future depreciation. The Dashboard shows monthly depreciation by book.`,
    link: { label: 'Open Reporting', to: '/reporting' }
  },
  {
    id: 'config',
    keys: ['configuration', 'config', 'asset class', 'asset classes', 'pub 946', 'bonus', 'books', 'book list', 'setup', 'settings'],
    title: 'Configuration',
    text: `Under Configuration: Asset Classes (class rates and life), Pub 946 Tables (MACRS rate tables), Bonus Depreciation (bonus % by period) and Books List (Federal Tax and other books). Changes here affect new events, so set them before posting assets.`,
    link: { label: 'Open Asset Classes', to: '/configuration/asset-classes' }
  },
  {
    id: 'macrs',
    keys: ['macrs', 'modified accelerated', 'recovery period', 'recovery life', 'gds', 'ads', 'pub 946', 'irs table', 'depreciation method', 'depreciation methods'],
    title: 'MACRS and recovery periods',
    text: `MACRS (Modified Accelerated Cost Recovery System) is the US tax method for depreciating assets. Each asset class has a recovery period (for example 5 or 7 years) and a rate table from IRS Pub 946. GDS is the regular system, ADS is the longer, straight-line alternative.\n\nIn this app the class you pick fills method, life, convention and rate automatically. The rate tables are under Configuration > Pub 946 Tables.`,
    link: { label: 'Open Pub 946 Tables', to: '/configuration/pub946' }
  },
  {
    id: 'convention',
    keys: ['convention', 'conventions', 'half-year', 'half year', 'mid-quarter', 'mid quarter', 'mid-month', 'mid month', 'quarter'],
    title: 'Depreciation conventions',
    text: `The convention decides how much depreciation an asset gets in its first and last year:\n- Half-Year: treated as placed in service mid-year (most common)\n- Mid-Quarter: used when more than 40% of the year's cost is placed in service in the last quarter\n- Mid-Month: used for real property\n\nThe convention is filled from the asset class on each lifecycle form and can be checked before posting.`,
    link: { label: 'Open Lifecycle Events', to: '/lifecycle' }
  },
  {
    id: 'bonus',
    keys: ['bonus depreciation', 'bonus percent', 'bonus %', 'bonus rate', 'bonus rates', 'section 179'],
    title: 'Bonus depreciation',
    text: `Bonus depreciation lets a percentage of an asset's cost be deducted in the year it is placed in service, before regular MACRS is applied to the rest. The percentage depends on the placed-in-service period.\n\nThe rates live under Configuration > Bonus Depreciation, and each Addition picks up the right % from its in-service date. Change them there before posting new assets.`,
    link: { label: 'Open Bonus Depreciation', to: '/configuration/bonus-depreciation' }
  },
  {
    id: 'straightline',
    keys: ['straight-line', 'straight line', 'declining balance', 'accelerated'],
    title: 'Straight-line vs accelerated',
    text: `Straight-line spreads the cost evenly over the recovery life. Accelerated methods (MACRS GDS, declining balance) take more depreciation in the early years and less later. The method for each asset is shown on Asset Detail and set by its asset class.`,
    link: { label: 'Open Asset Classes', to: '/configuration/asset-classes' }
  },
  {
    id: 'pis',
    keys: ['placed in service', 'placed-in-service', 'pisd', 'in service date', 'in-service date'],
    title: 'Placed-in-service date (PISD)',
    text: `The placed-in-service date is when the asset is ready and available for use. Depreciation starts from it (using the convention). It is entered on the Addition form together with the Accounting Period Date, which is the period the entry is booked in.`,
    link: { label: 'Go to Add Asset', to: '/lifecycle?type=addition' }
  },
  {
    id: 'gainloss',
    keys: ['gain', 'loss', 'gain/loss', 'proceeds', 'disposal gain', 'disposal loss'],
    title: 'Gain / loss on disposal',
    text: `When an asset is retired, gain or loss = Proceeds (sale amount) minus the asset's net book value at disposal. Enter Disposal Date, Cost Disposed and Proceeds on the Retirement form and the preview shows the result before you post.`,
    link: { label: 'Open Lifecycle Events', to: '/lifecycle' }
  },
  {
    id: 'statuses',
    keys: ['statuses', 'asset status', 'asset statuses', 'under review', 'fully depreciated', 'what does retired mean'],
    title: 'Asset statuses',
    text: `- Active: in use and depreciating\n- Fully Depreciated: cost fully written off, still in use\n- Under Review: flagged for a check\n- Transferred: moved to another company or location\n- Retired: disposed of (excluded from dashboard totals)\n\nUse the Status filter on the Asset Register to list any of them.`,
    link: { label: 'Open Asset Register', to: '/assets' }
  },
  {
    id: 'integrations',
    keys: ['sap', 'integration', 'integrations', 'erp', 'service api', 'api integration', 'connect system'],
    title: 'Integrations (SAP and API)',
    text: `Integrations has two parts:\n- SAP: pulls assets from SAP into the ledger (it uses sample data until a real SAP URL is configured)\n- API: other systems can post lifecycle events through the Service API with their own key\n\nAdmins manage both from the Integrations menu.`,
    link: { label: 'Open SAP Integration', to: '/integrations/sap' }
  },
  {
    id: 'agent',
    keys: ['agent', 'ai agent', 'sparkle', 'web search', 'confirm and post', 'confirm'],
    title: 'The AI Agent (sparkle button)',
    text: `The sparkle button next to this robot opens the AI Agent. It can read all site data, search the web, and prepare lifecycle events (for example a retirement) for you. Nothing is saved until you click "Confirm & Post" on the preview card. It needs an Anthropic API key on the server.`
  },
  {
    id: 'dashboard',
    keys: ['dashboard', 'chart', 'charts', 'pie', 'kpi', 'cards'],
    title: 'Reading the Dashboard',
    text: `The Dashboard shows total assets, gross cost, net book value and depreciation for the selected book. Monthly Depreciation Expense can be switched by book, half-year and fiscal year. "Assets by Class" shows each class's share of net book value. Retired assets are not counted in these totals.`,
    link: { label: 'Open Dashboard', to: '/' }
  },
  {
    id: 'users',
    keys: ['user', 'users', 'role', 'permission', 'access', 'invite'],
    title: 'Users and access',
    text: `Administration > User Management lets an admin add users and set what each role can view or edit. If a page or button is missing for you, your role does not have access.`,
    link: { label: 'Open User Management', to: '/users' }
  }
];

const HOW_WORDS = /\b(how|where|steps?|way to|procedure|process|guide|help|navigate|go to|menu|pages?|modules?)\b/;
const ACTION_WORDS = /\b(add|create|new|adjust\w*|retire|retirement|dispose|transfer|reinstate\w*|reclass\w*|import|upload|export|capitalize)\b/;

// Overview-style questions (the follow-up chips use these): "What is in Configuration?",
// "Tell me about reports and forecasting", "Show me the project map", "Who can access which pages?".
const OVERVIEW_WORDS = /\b(what is in|what's in|tell me about|show me the|who can|what (is|are|does) (a |an |the )?\w+|explain|meaning of|define|difference between)\b/;

export function isGuideQuestion(message) {
  const t = message.toLowerCase();
  if (HOW_WORDS.test(t) || OVERVIEW_WORDS.test(t)) return true;
  // A command carrying specifics (asset number, amount, date) or a longer sentence is a TASK
  // for the AI agent, not a how-to. Without this, "retire asset 009 ..." was answered by the
  // static guide and never reached the agent.
  if (/\d/.test(t) || t.trim().split(/\s+/).length > 6) return false;
  return ACTION_WORDS.test(t);
}

export function findGuide(message) {
  const t = message.toLowerCase();
  let best = null, bestScore = 0;
  for (const g of GUIDE) {
    const score = g.keys.reduce((s, k) => (new RegExp('\\b' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b').test(t) ? s + k.length : s), 0);
    if (score > bestScore) { best = g; bestScore = score; }
  }
  return best;
}

// ------------------------------------------------------
// Related follow-up questions: after an answer, the chat shows these as
// clickable chips. Keys are guide ids (above) or data topics (data-*).
// ------------------------------------------------------
const FOLLOW_UPS = {
  add: ['How to bulk import assets?', 'How to adjust an asset?', 'How to find or export assets?', 'How many assets do we have?'],
  adjust: ['How to retire an asset?', 'How to transfer an asset?', 'How to reclassify an asset?', 'How to add a new asset?'],
  retire: ['How to reinstate a retired asset?', 'Show retired assets', 'How to adjust an asset?', 'How to transfer an asset?'],
  reinstate: ['How to retire an asset?', 'Show retired assets', 'How to adjust an asset?', 'How to add a new asset?'],
  transfer: ['How to reclassify an asset?', 'How to retire an asset?', 'How to adjust an asset?', 'How to find or export assets?'],
  reclass: ['How to transfer an asset?', 'How to adjust an asset?', 'What is in Configuration?', 'How to retire an asset?'],
  bulk: ['How to add a new asset?', 'How to find or export assets?', 'How to adjust an asset?', 'How to retire an asset?'],
  find: ['How to add a new asset?', 'Show retired assets', 'How many assets do we have?', 'How to bulk import assets?'],
  reports: ['What is in Configuration?', 'How many assets do we have?', 'What is the net book value?', 'Show me the project map'],
  config: ['How to add a new asset?', 'Tell me about reports and forecasting', 'Who can access which pages?', 'How to bulk import assets?'],
  users: ['Show me the project map', 'What is in Configuration?', 'How to add a new asset?', 'How many assets do we have?'],
  macrs: ['Explain depreciation conventions', 'Explain bonus depreciation', 'What is in Configuration?', 'How to add a new asset?'],
  convention: ['Explain MACRS', 'Explain bonus depreciation', 'How to add a new asset?', 'How to adjust an asset?'],
  bonus: ['Explain MACRS', 'Explain depreciation conventions', 'What is in Configuration?', 'How to add a new asset?'],
  straightline: ['Explain MACRS', 'Explain depreciation conventions', 'What is in Configuration?', 'How many assets do we have?'],
  pis: ['How to add a new asset?', 'Explain depreciation conventions', 'Explain bonus depreciation', 'Show me the project map'],
  gainloss: ['How to retire an asset?', 'How to reinstate a retired asset?', 'Show retired assets', 'What is the net book value?'],
  statuses: ['Show retired assets', 'Show fully depreciated assets', 'How to find or export assets?', 'How many assets do we have?'],
  integrations: ['How to bulk import assets?', 'Show me the project map', 'Who can access which pages?', 'How to add a new asset?'],
  agent: ['How many assets do we have?', 'How to retire an asset?', 'Show me the project map', 'Tell me about reports and forecasting'],
  dashboard: ['What is the net book value?', 'Show assets by class', 'Show recent activity', 'Tell me about reports and forecasting'],
  'data-class': ['Show assets by company', 'Show the highest cost assets', 'How many assets do we have?', 'What is in Configuration?'],
  'data-top': ['Show assets by class', 'Show recent activity', 'What is the net book value?', 'How to retire an asset?'],
  'data-activity': ['How to add a new asset?', 'How to adjust an asset?', 'How many assets do we have?', 'Show retired assets'],
  map: ['How to add a new asset?', 'How to retire an asset?', 'How to bulk import assets?', 'Tell me about reports and forecasting'],
  'data-count': ['What is the net book value?', 'Show retired assets', 'Show fully depreciated assets', 'How to add a new asset?'],
  'data-retired': ['How to reinstate a retired asset?', 'How many assets do we have?', 'Show fully depreciated assets', 'How to retire an asset?'],
  'data-status': ['How many assets do we have?', 'Show retired assets', 'What is the net book value?', 'How to find or export assets?'],
  'data-nbv': ['How many assets do we have?', 'Show retired assets', 'Tell me about reports and forecasting', 'How to adjust an asset?'],
  'data-asset': ['How to adjust an asset?', 'How to transfer an asset?', 'How to retire an asset?', 'How many assets do we have?'],
  default: ['How many assets do we have?', 'How to add a new asset?', 'How to retire an asset?', 'Show retired assets']
};

// Works out which topic a user message belongs to.
function topicOf(message) {
  const t = message.toLowerCase();
  if (isGuideQuestion(t)) { const g = findGuide(t); if (g) return g.id; }
  if (/^[a-z0-9-]*\d[a-z0-9-]*$/.test(t.trim())) return 'data-asset';
  if (/(recent|latest|last).*(activity|event)|activity/.test(t)) return 'data-activity';
  if (/(highest|lowest|largest|smallest|top \d|newest|oldest)/.test(t)) return 'data-top';
  if (/(by class|by company|by location|classes|companies|locations)/.test(t)) return 'data-class';
  if (/retired/.test(t)) return 'data-retired';
  if (/(fully depreciated|under review|transferred|active)/.test(t)) return 'data-status';
  if (/(net book|nbv|book value|cost|depreciation)/.test(t)) return 'data-nbv';
  if (/(how many|total|count|summary|assets)/.test(t)) return 'data-count';
  return 'default';
}

// Returns up to 4 related questions for the last thing the user asked,
// skipping any question already asked in this chat.
export function relatedQuestions(message, alreadyAsked = []) {
  const asked = new Set(alreadyAsked.map((q) => q.trim().toLowerCase()));
  const pool = [...FOLLOW_UPS[topicOf(message)], ...FOLLOW_UPS.default, ...FOLLOW_UPS.add];
  const out = [];
  for (const q of pool) {
    if (!asked.has(q.toLowerCase()) && !out.includes(q)) out.push(q);
    if (out.length === 4) break;
  }
  return out;
}
// ======================================================
// END OF FILE : guide.js
// ======================================================