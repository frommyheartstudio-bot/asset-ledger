// ============================================================
// Bonus Depreciation Rates – IRC §168(k)
// Historical and current additional first-year depreciation percentages
// Source: IRC §168(k) as amended by TCJA, CARES Act, and OBBBA (P.L. 119-94, 2025);
// IRS Publication 946 (2025), Chapter 3; IRS Notice 2026-11.
// ============================================================

export const BONUS_DATA = [
  { year: '2027+', pct: 100, lpp: 100, law: 'OBBBA §168(k)', notes: 'Permanent 100% for property acquired after 1/19/2025', highlight: true },
  { year: '2026', pct: 100, lpp: 100, law: 'OBBBA §168(k)', notes: 'Permanent 100% for property acquired after 1/19/2025', highlight: true },
  { year: '2025 (acquired after 1/19/2025)', pct: 100, lpp: 100, law: 'OBBBA §168(k)', notes: '100% for property acquired after Jan 19, 2025', highlight: true },
  { year: '2025 (acquired before 1/20/2025)', pct: 40, lpp: 60, law: 'TCJA phase-out / OBBBA §168(k)(10)', notes: 'TCJA phase-out rate; OBBBA allows election of 40%' },
  { year: '2024', pct: 60, lpp: 60, law: 'TCJA §168(k)(6)(A)', notes: 'Phase-out: 60% (year 3 of 5-year phase-out)' },
  { year: '2023', pct: 80, lpp: 80, law: 'TCJA §168(k)(6)(A)', notes: 'Phase-out: 80% (year 2 of 5-year phase-out)' },
  { year: '2022 (before 1/1/2023)', pct: 100, lpp: 100, law: 'TCJA §168(k)(6)(A)', notes: 'Last year of full 100% under TCJA', highlight: true },
  { year: '2021', pct: 100, lpp: 100, law: 'TCJA §168(k)(6)(A)', notes: '100% bonus (TCJA)', highlight: true },
  { year: '2020', pct: 100, lpp: 100, law: 'TCJA §168(k)(6)(A)', notes: '100% bonus (TCJA)', highlight: true },
  { year: '2019', pct: 100, lpp: 100, law: 'TCJA §168(k)(6)(A)', notes: '100% bonus (TCJA)', highlight: true },
  { year: '2018 (after 9/27/2017)', pct: 100, lpp: 100, law: 'TCJA §168(k)(6)(A)', notes: '100% bonus; includes used property for first time', highlight: true },
  { year: '2018 (before 9/28/2017 acquisition)', pct: 40, lpp: 40, law: 'PATH Act phase-out', notes: 'Pre-TCJA acquisition: PATH Act phase-out rate' },
  { year: '2017', pct: 50, lpp: 50, law: 'PATH Act §168(k)(8)', notes: '50% bonus (PATH Act extension)' },
  { year: '2016', pct: 50, lpp: 50, law: 'PATH Act §168(k)(8)', notes: '50% bonus (PATH Act extension)' },
  { year: '2015', pct: 50, lpp: 50, law: 'PATH Act §168(k)(8)', notes: '50% bonus (PATH Act extension)' },
  { year: '2014', pct: 50, lpp: 50, law: 'TIPA §168(k)', notes: '50% bonus (Tax Increase Prevention Act retroactive extension)' },
  { year: '2013', pct: 50, lpp: 50, law: 'ATRA §168(k)', notes: '50% bonus (American Taxpayer Relief Act extension)' },
  { year: '2012', pct: 50, lpp: 50, law: 'ATRA §168(k)', notes: '50% bonus' },
  { year: '2011', pct: 100, lpp: 100, law: 'Tax Relief Act of 2010 §168(k)(5)', notes: '100% bonus (temporary full expensing)', highlight: true },
  { year: '2010 (after 9/8/2010)', pct: 100, lpp: 100, law: 'Tax Relief Act of 2010', notes: '100% for property acquired after 9/8/2010 and placed in service before 1/1/2012', highlight: true },
  { year: '2010 (before 9/9/2010)', pct: 50, lpp: 50, law: 'ARRA/SBJA §168(k)', notes: '50% bonus' },
  { year: '2009', pct: 50, lpp: 50, law: 'ARRA §168(k)', notes: '50% bonus (American Recovery and Reinvestment Act)' },
  { year: '2008', pct: 50, lpp: 50, law: 'ESA §168(k)', notes: '50% bonus (Economic Stimulus Act of 2008)' },
  { year: '2005–2007', pct: 0, lpp: 0, law: 'Expired', notes: 'No bonus depreciation available' },
  { year: '2004', pct: 50, lpp: 50, law: 'JGTRRA §168(k)', notes: '50% bonus' },
  { year: '2003', pct: 50, lpp: 50, law: 'JGTRRA §168(k)', notes: '50% bonus (Jobs and Growth Tax Relief Reconciliation Act)' },
  { year: '2002 (after 5/5/2003)', pct: 50, lpp: 50, law: 'JGTRRA §168(k)', notes: '50% bonus for property acquired after 5/5/2003' },
  { year: '2002 (before 5/6/2003)', pct: 30, lpp: 30, law: 'JCWAA §168(k)', notes: '30% bonus (Job Creation and Worker Assistance Act)' },
  { year: '2001 (after 9/10/2001)', pct: 30, lpp: 30, law: 'JCWAA §168(k)', notes: '30% bonus; property acquired after 9/10/2001' },
  { year: 'Before 9/11/2001', pct: 0, lpp: 0, law: 'N/A', notes: 'No bonus depreciation provision existed' }
];
