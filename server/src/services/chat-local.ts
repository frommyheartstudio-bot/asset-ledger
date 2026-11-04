// ======================================================
// File Name : chat-local.ts
// Purpose   : Built-in answerer for the Asset Assistant. It needs NO API key and
//             answers from the live asset book: counts, totals, statuses, top
//             assets, groupings (class / company / location), depreciation,
//             books, recent activity, asset lookup and keyword search.
//             chat.ts also uses it as the fallback when the Claude API fails,
//             so the user never hits a dead-end "can't answer right now".
// ======================================================

import { assets } from '../data/assets.js';
import { computeDashboardSummary } from '../data/activity.js';
import { BOOKS, DEFAULT_BOOK, resolveBook } from '../data/books.js';
import { loadRecentActivity } from '../db/repo.js';
import { primeBookRules, viewAssetsForBook } from './book-view.js';
import { classLabel } from './assetClassLabels.js';

const money = (n: number) => {
  const v = Math.round(Number(n) || 0);
  return (v < 0 ? '-$' : '$') + Math.abs(v).toLocaleString('en-US');
};
const has = (t: string, re: RegExp) => re.test(t);

type A = ReturnType<typeof viewAssetsForBook>[number];

const STATUSES = ['Fully Depreciated', 'Under Review', 'Transferred', 'Retired', 'Active'] as const;

const CAPABILITIES = `I can help with:
- Totals: total assets, gross cost, net book value, accumulated depreciation, monthly depreciation
- Status: retired, active, fully depreciated, under review, transferred assets
- Rankings: highest / lowest cost or NBV assets, newest and oldest assets
- Breakdowns: assets by class, company or location
- Lookup: type an asset number (or part of a description such as "rack" or "laptop")
- Recent lifecycle activity and the list of books
- How-to: add, adjust, transfer, retire, reinstate, reclassify, bulk import, reports, configuration, users`;

function assetLine(a: A): string {
  return `${a.assetNumber} - ${a.description} (${money(a.cost)})`;
}

function assetDetail(a: A): string {
  const tf = a.taxFactPattern;
  const lines = [
    `${a.assetNumber} - ${a.description}`,
    `Class: ${a.assetClass || 'n/a'} | Status: ${a.status} | Method: ${a.method}`,
    `Company: ${a.company || 'n/a'} | Location: ${a.location || 'n/a'}`,
    `Cost ${money(a.cost)}, Accum. Dep ${money(a.accumDepreciation)}, NBV ${money(a.nbv)}.`
  ];
  if (tf?.placedInService) lines.push(`Placed in service: ${tf.placedInService} | Life: ${tf.recoveryPeriod} | Bonus: ${tf.bonusPct}%`);
  if (a.disposal) lines.push(`Disposed: ${a.disposal.disposalDate} | Gain/Loss ${money(a.disposal.gainLoss)}`);
  return lines.join('\n');
}

function groupBy(list: A[], key: (a: A) => string) {
  const m = new Map<string, { count: number; cost: number; nbv: number }>();
  for (const a of list) {
    const k = key(a) || 'Unassigned';
    const g = m.get(k) ?? { count: 0, cost: 0, nbv: 0 };
    g.count++; g.cost += a.cost; g.nbv += a.nbv;
    m.set(k, g);
  }
  return [...m.entries()].sort((x, y) => y[1].nbv - x[1].nbv);
}

// "top 5", "five highest", "3 largest" -> number (default 5, max 10)
function wantedCount(t: string): number {
  const words: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
  const n = t.match(/\b(\d{1,2})\b/)?.[1];
  if (n) return Math.min(Math.max(Number(n), 1), 10);
  for (const [w, v] of Object.entries(words)) if (new RegExp(`\\b${w}\\b`).test(t)) return v;
  return /\b(highest|largest|biggest|most|lowest|smallest|cheapest|oldest|newest|latest|first|last)\b/.test(t) && !/\b(top|assets)\b/.test(t) ? 1 : 5;
}

export async function localAnswer(message: string, assetNumber?: string): Promise<string> {
  const t = message.toLowerCase().trim().replace(/[?!.]+$/g, '');
  await primeBookRules();
  const book = resolveBook(undefined);
  const all = viewAssetsForBook(assets, book);
  const live = all.filter((a) => a.status !== 'Retired'); // same rule as the Dashboard

  // ---- small talk ----
  if (has(t, /^(hi+|hello+|hey+|hy+|hyy+|vanakkam|good (morning|afternoon|evening))\b/) && t.split(/\s+/).length <= 4) {
    return `Hello! I'm the Asset Ledger assistant. Ask me about your assets, totals, statuses or how to do something in the app.`;
  }
  if (has(t, /\b(thanks|thank you|thx|nandri|ok thanks)\b/)) return `You're welcome! Ask me anything else about your assets.`;
  if (has(t, /^(bye|goodbye|see you|ok bye)\b/)) return `Goodbye! I'm here whenever you need me.`;
  if (has(t, /\b(who are you|what can you (do|answer)|what do you do|capabilit|what (all )?can i ask|^help$|^menu$)\b/)) return CAPABILITIES;

  // ---- one asset by number (any word with a digit) ----
  const tokens: string[] = [...(message.match(/[A-Za-z0-9-]*\d[A-Za-z0-9-]*/g) ?? [])];
  if (assetNumber) tokens.push(assetNumber);
  for (const tok of tokens) {
    const a = all.find((x) => x.assetNumber.toLowerCase() === tok.toLowerCase());
    if (a) return assetDetail(a);
  }
  const bare = /^[A-Za-z0-9-]*\d[A-Za-z0-9-]*$/.test(message.trim()) ? message.trim() : null;
  if (bare) {
    const partial = all.filter((x) => x.assetNumber.toLowerCase().includes(bare.toLowerCase()));
    if (partial.length) return `${partial.length} asset(s) matching ${bare}:\n` + partial.slice(0, 8).map((x) => `${x.assetNumber} - ${x.description}`).join('\n');
    return `No asset found with number ${bare}. Open the Asset Register to search.`;
  }

  // ---- recent lifecycle activity ----
  if (has(t, /\b(recent|latest|last|history)\b.*\b(activity|activities|events?|transactions?|postings?)\b|\b(activity|lifecycle) (log|history|feed)\b|^(recent )?activity$/)) {
    try {
      const rows = (await loadRecentActivity()).slice(-6).reverse();
      if (!rows.length) return 'There is no lifecycle activity yet.';
      return `Last ${rows.length} lifecycle event(s):\n` + rows.map((r) => `${r.assetNumber} - ${r.event} ${money(r.amount)} on ${r.date} (${r.status})`).join('\n');
    } catch { return 'I could not load recent activity right now. Open Lifecycle Events to see it.'; }
  }

  // ---- books ----
  if (has(t, /\b(books?|gaap|federal tax)\b/) && !has(t, /(net book|book value|nbv)/)) {
    const names = BOOKS.map((b) => b.name);
    if (!names.length) return 'No books are configured yet. Open Books List under Configuration.';
    return `Books: ${names.join(', ')}.\nDefault book: ${DEFAULT_BOOK || names[0]}.\nBook of record: ${BOOKS.filter((b) => b.bookOfRecord).map((b) => b.name).join(', ') || 'not set'}.\nManage them under Configuration > Books List.`;
  }

  // ---- status lists / counts ----
  const status = STATUSES.find((s) => t.includes(s.toLowerCase())) ?? (has(t, /\bdisposed|\bscrapped|\bsold\b/) ? 'Retired' : undefined);
  if (status && !has(t, /\b(how to|how do i|steps?)\b/)) {
    const list = all.filter((a) => a.status === status);
    if (!list.length) return `There are no ${status.toLowerCase()} assets.`;
    const total = list.reduce((s, a) => s + a.cost, 0);
    return `${list.length} ${status.toLowerCase()} asset(s), total cost ${money(total)}:\n` + list.slice(0, 8).map(assetLine).join('\n') + (list.length > 8 ? `\n...and ${list.length - 8} more. See the Asset Register.` : '');
  }

  // ---- rankings: highest / lowest / newest / oldest ----
  const wantsHigh = has(t, /\b(highest|largest|biggest|most expensive|costliest|top|max(imum)?)\b/);
  const wantsLow = has(t, /\b(lowest|smallest|cheapest|least expensive|min(imum)?|bottom)\b/);
  const wantsNew = has(t, /\b(newest|latest|most recent|recently (added|placed))\b/) && has(t, /\bassets?\b/);
  const wantsOld = has(t, /\boldest|earliest\b/);
  if ((wantsHigh || wantsLow || wantsNew || wantsOld) && has(t, /\b(assets?|cost|nbv|value|expensive|equipment)\b/)) {
    const n = wantedCount(t);
    const byNbv = has(t, /\b(nbv|book value|net book)\b/);
    let list = [...live];
    let label: string;
    if (wantsNew || wantsOld) {
      const d = (a: A) => a.taxFactPattern?.placedInService ?? '';
      list = list.filter((a) => d(a)).sort((a, b) => (wantsOld ? d(a).localeCompare(d(b)) : d(b).localeCompare(d(a))));
      label = wantsOld ? 'oldest (by placed-in-service date)' : 'newest (by placed-in-service date)';
      return `${Math.min(n, list.length)} ${label} asset(s):\n` + list.slice(0, n).map((a) => `${a.assetNumber} - ${a.description} (placed ${d(a)}, ${money(a.cost)})`).join('\n');
    }
    const val = (a: A) => (byNbv ? a.nbv : a.cost);
    const ascending = wantsLow && !wantsHigh;
    list.sort((a, b) => (ascending ? val(a) - val(b) : val(b) - val(a)));
    label = `${wantsLow && !wantsHigh ? 'lowest' : 'highest'} ${byNbv ? 'NBV' : 'cost'}`;
    return `${Math.min(n, list.length)} ${label} asset(s):\n` + list.slice(0, n).map((a) => `${a.assetNumber} - ${a.description} (${byNbv ? 'NBV ' + money(a.nbv) : 'cost ' + money(a.cost)})`).join('\n');
  }

  // ---- one class by code (e.g. "00.12") ----
  const classCodes = [...new Set(all.map((a) => a.assetClass).filter(Boolean))];
  const codeHit = classCodes.find((c) => new RegExp(`(^|[^0-9.])${c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^0-9])`).test(t));
  if (codeHit) {
    const list = live.filter((a) => a.assetClass === codeHit);
    const label = classLabel(codeHit);
    return `Class ${codeHit}${label !== codeHit ? ` (${label})` : ''}: ${list.length} asset(s), cost ${money(list.reduce((x, a) => x + a.cost, 0))}, NBV ${money(list.reduce((x, a) => x + a.nbv, 0))}.\n` + list.slice(0, 8).map(assetLine).join('\n');
  }

  // ---- groupings ----
  if (has(t, /\b(by|per|each|which|list|show|all|what|breakdown|split|group)\b.*\b(class(es)?|categor(y|ies)|types?)\b|\bassets? classes?\b/) && !has(t, /\b(how to|how do i)\b/)) {
    const g = groupBy(live, (a) => {
      if (!a.assetClass) return 'Unclassified';
      const label = classLabel(a.assetClass);
      return label !== a.assetClass ? `${a.assetClass} (${label})` : a.assetClass;
    });
    if (!g.length) return 'There are no assets yet.';
    return `Assets by class (${g.length}):\n` + g.map(([k, v]) => `${k}: ${v.count} asset(s), cost ${money(v.cost)}, NBV ${money(v.nbv)}`).join('\n');
  }
  if (has(t, /\b(companies|company|entities|entity)\b/) && !has(t, /\b(transfer|how to)\b/)) {
    const named = [...new Set(all.map((a) => a.company).filter(Boolean))].find((c) => new RegExp(`\\b${c.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(t) && c.length > 1);
    if (named) {
      const list = live.filter((a) => a.company === named);
      return `Company ${named}: ${list.length} asset(s), cost ${money(list.reduce((s, a) => s + a.cost, 0))}, NBV ${money(list.reduce((s, a) => s + a.nbv, 0))}.\n` + list.slice(0, 6).map(assetLine).join('\n');
    }
    const g = groupBy(live, (a) => a.company);
    return `Assets by company (${g.length}):\n` + g.map(([k, v]) => `${k}: ${v.count} asset(s), cost ${money(v.cost)}, NBV ${money(v.nbv)}`).join('\n');
  }
  if (has(t, /\b(locations?|sites?|plants?|where are)\b/) && !has(t, /\b(transfer|change location|how to)\b/)) {
    const g = groupBy(live, (a) => a.location ?? '');
    return `Assets by location (${g.length}):\n` + g.map(([k, v]) => `${k}: ${v.count} asset(s), cost ${money(v.cost)}, NBV ${money(v.nbv)}`).join('\n');
  }

  // ---- depreciation / totals ----
  // Totals come straight from the same non-retired rows the Dashboard sums, so they
  // never fail even if the heavier dashboard calculation is unavailable.
  const sum = {
    totalAssets: live.length,
    grossCost: live.reduce((x, a) => x + a.cost, 0),
    netBookValue: live.reduce((x, a) => x + a.nbv, 0),
    accum: live.reduce((x, a) => x + a.accumDepreciation, 0)
  };
  const dash = () => { try { return computeDashboardSummary(book) as any; } catch (e) { console.error('[chat-local] dashboard summary failed:', e instanceof Error ? e.message : e); return null; } };

  if (has(t, /\b(monthly|per month|this month|each month|month by month|depreciation expense)\b/) && has(t, /depreciation|expense/)) {
    const rows: { month: string; value: number }[] = dash()?.monthlyDepreciation ?? [];
    if (rows.length) return `Monthly depreciation expense (${book}):\n` + rows.map((r) => `${r.month}: ${money(r.value)}`).join('\n') + `\nOpen the Dashboard for the chart.`;
    return 'I could not calculate monthly depreciation right now. Open the Dashboard to see the chart.';
  }
  if (has(t, /\badded\b.*\b(period|month)\b|\bnew assets\b.*\b(this|month)\b/)) {
    const d = dash();
    const monthKey = new Date().toISOString().slice(0, 7);
    const added = d ? d.addedThisPeriod : live.filter((a) => a.taxFactPattern?.placedInService?.startsWith(monthKey)).length;
    return `Assets added this period: ${added}.\nActive assets: ${sum.totalAssets}`;
  }
  if (has(t, /(net book|nbv|book value)/)) return `Net book value: ${money(sum.netBookValue)}\nGross cost: ${money(sum.grossCost)}\nAccumulated depreciation: ${money(sum.accum)}`;
  if (has(t, /(accum|accumulated|depreciation)/)) return `Accumulated depreciation: ${money(sum.accum)}\nGross cost: ${money(sum.grossCost)}\nNet book value: ${money(sum.netBookValue)}`;
  if (has(t, /(gross cost|total cost|cost of (all )?assets|capitali[sz]ed|portfolio value|worth)/)) return `Gross cost: ${money(sum.grossCost)}\nNet book value: ${money(sum.netBookValue)}\nActive assets: ${sum.totalAssets}`;
  if (has(t, /(how many|total|count|number of|summary|overview|dashboard|portfolio|status of (the )?(site|portfolio)|site update)/)) {
    const retired = all.length - live.length;
    return `Active assets: ${sum.totalAssets}\nGross cost: ${money(sum.grossCost)}\nNet book value: ${money(sum.netBookValue)}\nAccumulated depreciation: ${money(sum.accum)}` + (retired ? `\n(${retired} retired asset(s) are not counted.)` : '');
  }

  // ---- keyword search in description / class / company / location ----
  const stop = new Set(['the', 'a', 'an', 'of', 'for', 'in', 'on', 'to', 'is', 'are', 'do', 'we', 'have', 'any', 'show', 'me', 'find', 'search', 'list', 'give', 'tell', 'about', 'what', 'which', 'asset', 'assets', 'with', 'and', 'or', 'my', 'our', 'all', 'please', 'there', 'get', 'can', 'you', 'i']);
  const words = t.split(/[^a-z0-9.\-]+/).filter((w) => w.length > 1 && !stop.has(w));
  if (words.length) {
    const scored = all
      .map((a) => {
        const hay = `${a.assetNumber} ${a.description} ${a.assetClass} ${classLabel(a.assetClass)} ${a.company} ${a.location ?? ''} ${a.project ?? ''}`.toLowerCase();
        return { a, score: words.filter((w) => hay.includes(w)).length };
      })
      .filter((x) => x.score > 0)
      .sort((x, y) => y.score - x.score);
    const best = scored.filter((x) => x.score === scored[0]?.score);
    if (best.length) return `${best.length} asset(s) matching "${words.join(' ')}":\n` + best.slice(0, 8).map((x) => assetLine(x.a)).join('\n') + (best.length > 8 ? `\n...and ${best.length - 8} more. Use Asset Register search.` : '');
  }

  return `I couldn't find an answer for that. ${CAPABILITIES}`;
}

// ======================================================
// END OF FILE : chat-local.ts
// ======================================================