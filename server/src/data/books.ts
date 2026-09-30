// ======================================================
// File Name : books.ts
// Purpose   : The master list of books the ledger maintains. Until now
//             the whole app ran on ONE book (Federal Tax); this is the
//             single source of truth for every book so each table's
//             Book dropdown, the /api/books endpoint and the server-side
//             book resolution all agree.
//             Rows mirror the "Books List" sheet (Name, Description,
//             Book of Record, Period Close Date, Reporting Month End,
//             Reporting Year End).
// ======================================================

// ======================================================
// START: Book Definitions
// ======================================================

export interface BookDef {
  name: string;
  description: string;
  bookOfRecord: boolean;
  periodCloseDate: string;
  reportingMonthEnd: string;
  reportingYearEnd: string;
}

/** The book every page opens on — the one the app has always shown. */
export const DEFAULT_BOOK = 'Federal Tax';

export const BOOKS: BookDef[] = [
  { name: 'GAAP', description: 'The GAAP Book', bookOfRecord: true, periodCloseDate: '2017-12-31', reportingMonthEnd: '2018-12-31', reportingYearEnd: '2018-12-31' },
  { name: 'Federal Tax', description: 'The Federal Tax - Regular Book', bookOfRecord: false, periodCloseDate: '2017-12-31', reportingMonthEnd: '2018-12-31', reportingYearEnd: '2018-12-31' },
  { name: 'Federal Tax - E&P', description: 'Federal Tax - E&P', bookOfRecord: false, periodCloseDate: '2017-12-31', reportingMonthEnd: '2018-12-31', reportingYearEnd: '2018-12-31' },
  { name: 'DE', description: 'Copy of Federal Tax', bookOfRecord: false, periodCloseDate: '2017-12-31', reportingMonthEnd: '2018-12-31', reportingYearEnd: '2018-12-31' },
  { name: 'IA', description: 'IA desc', bookOfRecord: false, periodCloseDate: '2017-12-31', reportingMonthEnd: '2018-12-31', reportingYearEnd: '2018-12-31' },
  { name: 'IL', description: 'IL desc', bookOfRecord: false, periodCloseDate: '2017-12-31', reportingMonthEnd: '2018-12-31', reportingYearEnd: '2018-12-31' },
  { name: 'MS', description: 'MS desc', bookOfRecord: false, periodCloseDate: '2017-12-31', reportingMonthEnd: '2018-12-31', reportingYearEnd: '2018-12-31' },
  { name: 'NE', description: 'Copy of Federal Tax', bookOfRecord: false, periodCloseDate: '2017-12-31', reportingMonthEnd: '2018-12-31', reportingYearEnd: '2018-12-31' },
  { name: 'OK', description: 'Copy of Federal Tax', bookOfRecord: false, periodCloseDate: '2017-12-31', reportingMonthEnd: '2018-12-31', reportingYearEnd: '2018-12-31' },
  { name: 'OR', description: 'Copy of Federal Tax', bookOfRecord: false, periodCloseDate: '2017-12-31', reportingMonthEnd: '2018-12-31', reportingYearEnd: '2018-12-31' },
  { name: 'State AMT - QIP', description: 'Copy of State No Bonus - AMT', bookOfRecord: false, periodCloseDate: '2017-12-31', reportingMonthEnd: '2020-08-31', reportingYearEnd: '2020-12-31' },
  { name: 'State No Bonus', description: 'Federal Tax without Bonus', bookOfRecord: false, periodCloseDate: '2017-12-31', reportingMonthEnd: '2018-12-31', reportingYearEnd: '2018-12-31' },
  { name: 'State No Bonus - AMT', description: 'Federal Tax without Bonus', bookOfRecord: false, periodCloseDate: '2017-12-31', reportingMonthEnd: '2020-08-31', reportingYearEnd: '2020-12-31' },
  { name: 'State QIP', description: 'State QIP desc', bookOfRecord: false, periodCloseDate: '2017-12-31', reportingMonthEnd: '2018-12-31', reportingYearEnd: '2018-12-31' },
  { name: 'TN', description: 'TN desc', bookOfRecord: false, periodCloseDate: '2017-12-31', reportingMonthEnd: '2018-12-31', reportingYearEnd: '2018-12-31' }
];

export const BOOK_NAMES: string[] = BOOKS.map((b) => b.name);

// ======================================================
// Function : resolveBook
// Purpose  : Turns whatever came in on a query string / body into a
//            known book name (case-insensitive, trimmed). Anything
//            missing or unknown falls back to DEFAULT_BOOK so a bad
//            ?book= value can never 500 a page — it just shows the
//            default book.
// Input    : raw (unknown)
// Output   : a name from BOOK_NAMES
// ======================================================

export function resolveBook(raw: unknown): string {
  if (typeof raw !== 'string') return DEFAULT_BOOK;
  const wanted = raw.trim().toLowerCase();
  if (!wanted) return DEFAULT_BOOK;
  return BOOK_NAMES.find((n) => n.toLowerCase() === wanted) ?? DEFAULT_BOOK;
}

// ======================================================
// Function : isKnownBook
// Purpose  : True when the value names one of the maintained books.
// ======================================================

export function isKnownBook(raw: unknown): boolean {
  return typeof raw === 'string' && BOOK_NAMES.some((n) => n.toLowerCase() === raw.trim().toLowerCase());
}

// ======================================================
// END: Book Definitions
// ======================================================

// ======================================================
// END OF FILE : books.ts
// ======================================================
