// ======================================================
// File Name : chat.ts
// Purpose   : POST /api/chat — the robot assistant.
//             With ANTHROPIC_API_KEY set: Claude answers using read-only
//             tools over the live asset book (no FAQ list needed).
//             Without a key: a small built-in answerer that still uses
//             real data, so the widget works out of the box.
// ======================================================

import { Router } from 'express';
import { assets, findAsset } from '../data/assets.js';
import { computeDashboardSummary } from '../data/activity.js';
import { resolveBook } from '../data/books.js';
import { primeBookRules, viewAssetsForBook } from '../services/book-view.js';

export const chatRouter = Router();

const MODEL = process.env.CHAT_MODEL || 'claude-sonnet-4-6';
const money = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

// ---------- Read-only tools (the agent can look, never change) ----------

const TOOLS = [
  {
    name: 'get_summary',
    description: 'Dashboard totals for the active book: asset count, gross cost, net book value, accumulated depreciation, assets by class.',
    input_schema: { type: 'object', properties: {} }
  },
  {
    name: 'search_assets',
    description: 'Search assets. All filters optional. Returns up to 15 matches plus the total match count and summed cost/NBV.',
    input_schema: {
      type: 'object',
      properties: {
        q: { type: 'string', description: 'Text in asset number or description' },
        assetClass: { type: 'string' },
        status: { type: 'string', enum: ['Active', 'Retired', 'Transferred', 'Fully Depreciated', 'Under Review'] },
        company: { type: 'string' },
        location: { type: 'string' }
      }
    }
  },
  {
    name: 'get_asset',
    description: 'Full detail for one asset by asset number.',
    input_schema: { type: 'object', properties: { assetNumber: { type: 'string' } }, required: ['assetNumber'] }
  }
];

async function runTool(name: string, input: any): Promise<unknown> {
  await primeBookRules();
  const book = resolveBook(undefined);
  if (name === 'get_summary') return computeDashboardSummary(book);

  if (name === 'search_assets') {
    let list = viewAssetsForBook(assets, book);
    const has = (v?: string) => (v ?? '').toLowerCase();
    if (input.q) list = list.filter((a) => `${a.assetNumber} ${a.description}`.toLowerCase().includes(has(input.q)));
    if (input.assetClass) list = list.filter((a) => a.assetClass.toLowerCase().includes(has(input.assetClass)));
    if (input.status) list = list.filter((a) => a.status === input.status);
    if (input.company) list = list.filter((a) => a.company.toLowerCase().includes(has(input.company)));
    if (input.location) list = list.filter((a) => (a.location ?? '').toLowerCase().includes(has(input.location)));
    return {
      totalMatches: list.length,
      totalCost: list.reduce((s, a) => s + a.cost, 0),
      totalNbv: list.reduce((s, a) => s + a.nbv, 0),
      assets: list.slice(0, 15).map((a) => ({
        assetNumber: a.assetNumber, description: a.description, assetClass: a.assetClass,
        status: a.status, cost: a.cost, nbv: a.nbv, location: a.location
      }))
    };
  }

  if (name === 'get_asset') {
    const a = findAsset(String(input.assetNumber));
    return a ?? { error: 'Asset not found' };
  }
  return { error: 'Unknown tool' };
}

// ---------- Claude mode ----------

function systemPrompt(page: string, role: string) {
  return `You are the in-app assistant for "Asset Ledger", a fixed-asset and tax depreciation system (Pub 946, MACRS, bonus depreciation, multiple books, lifecycle events such as addition, transfer, retirement).
Always reply in clear English, even if the user writes in another language or style. Keep answers short, 2 to 5 lines, and plain text.
Use the tools for any question about numbers or specific assets. Never guess figures. If a tool returns nothing, say so.
You can only read data. If asked to change something, tell them which page to use (Lifecycle Events, Asset Register, Bulk Import, etc.).
App guide (use it for "how do I" questions):
- Add asset: Asset Register > "+ Add Asset" > Save Asset, or Lifecycle Events > Addition.
- Adjustment, Transfer, Retirement, Reinstatement, Reclassification: Lifecycle Events, choose the event type, select the asset, fill the fields, post.
- Retirement needs Disposal Date, Cost Disposed and Proceeds. Use Reinstatement to undo a retirement.
- Many records at once: Bulk Import (CSV template, eventType column).
- Reports: Reporting. Planning: Modeling, Forecasting. Setup: Configuration (Asset Classes, Pub 946 Tables, Bonus Depreciation, Books List). Users: User Management.
The user is on page: ${page}. Their role: ${role}.`;
}

async function askClaude(message: string, history: { role: string; text: string }[], page: string, role: string) {
  const messages: any[] = [
    ...history.slice(-8).map((h) => ({ role: h.role === 'user' ? 'user' : 'assistant', content: h.text })),
    { role: 'user', content: message }
  ];

  for (let turn = 0; turn < 5; turn++) {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY as string,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({ model: MODEL, max_tokens: 600, system: systemPrompt(page, role), tools: TOOLS, messages })
    });
    if (!r.ok) throw new Error(`Claude API ${r.status}`);
    const data: any = await r.json();

    if (data.stop_reason !== 'tool_use') {
      return (data.content as any[]).filter((c) => c.type === 'text').map((c) => c.text).join('\n').trim();
    }
    messages.push({ role: 'assistant', content: data.content });
    const results = [];
    for (const block of data.content.filter((c: any) => c.type === 'tool_use')) {
      results.push({ type: 'tool_result', tool_use_id: block.id, content: JSON.stringify(await runTool(block.name, block.input)) });
    }
    messages.push({ role: 'user', content: results });
  }
  return "Sorry, I couldn't work out an answer to that. Could you rephrase it?";
}

// ---------- Built-in mode (no API key) ----------

async function localAnswer(message: string, assetNumber?: string): Promise<string> {
  const t = message.toLowerCase();
  const num = message.match(/\b\d{6,}\b/)?.[0] ?? assetNumber;

  if (num && /(detail|info|cost|nbv|value|status|asset)/.test(t)) {
    const a = findAsset(num) as any;
    if (a) {
      return `Asset ${a.assetNumber}: ${a.description}\nClass: ${a.assetClass} | Status: ${a.status}\nCost ${money(a.cost)}, Accum. Dep ${money(a.accumDepreciation)}, NBV ${money(a.nbv)}.`;
    }
  }
  if (/(summary|total|how many|count|dashboard|nbv|book value|cost)/.test(t)) {
    const s: any = computeDashboardSummary(resolveBook(undefined));
    return `Active assets: ${s.totalAssets}\nGross cost: ${money(s.grossCost)}\nNet book value: ${money(s.netBookValue)}\nAccumulated depreciation: ${money(s.ytdDepreciation)}`;
  }
  const status = (['Retired', 'Fully Depreciated', 'Under Review', 'Transferred', 'Active'] as const).find((s) => t.includes(s.toLowerCase()));
  if (status) {
    const list = assets.filter((a) => a.status === status);
    return `${status} assets: ${list.length}. ` + list.slice(0, 5).map((a) => `${a.assetNumber} (${a.description})`).join(', ');
  }
  return 'I could not find data for that. Try "total assets", "net book value", "retired assets", or type an asset number. (For full AI answers, add ANTHROPIC_API_KEY to server/.env.)';
}

// ---------- Route ----------

chatRouter.post('/', async (req, res) => {
  const { message, history = [], page = '/', role = 'user', assetNumber } = req.body ?? {};
  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'message required' });
  }
  try {
    await primeBookRules();
    if (process.env.ANTHROPIC_API_KEY) {
      const reply = await askClaude(message.slice(0, 1000), history, page, role);
      return res.json({ reply, mode: 'ai' });
    }
    res.json({ reply: await localAnswer(message, assetNumber), mode: 'local' });
  } catch (err) {
    console.error('[chat] failed:', err);
    res.json({ reply: "Sorry, I can't answer right now. Please try again in a moment.", mode: 'error' });
  }
});
