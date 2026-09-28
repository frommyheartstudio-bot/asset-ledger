// ======================================================
// File Name : BonusDepreciation.jsx
// Purpose   : Page-level component for the Bonus Depreciation
//             (IRC §168(k)) rates & rules reference
// ======================================================

import { useState } from 'react';
import { AppLayout } from '../../layout/AppLayout';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { BONUS_DATA } from '../../data/bonusDepreciation';

// ======================================================
// START: Page Component
// ======================================================

const TABS = [
    { id: 'timeline', label: 'Timeline View' },
    { id: 'rules', label: 'Eligibility Rules' },
    { id: 'limits', label: 'Vehicle Limits' }
];

const QUALIFYING_RULES = [
    { requirement: 'Property Type', details: 'MACRS property with recovery period of 20 years or less; computer software (off-the-shelf); water utility property; qualified film, television, or live theatrical production; specified plants (with election)' },
    { requirement: 'Original Use', details: 'Original use must begin with the taxpayer (first use in trade/business). Exception: used property acquired after 9/27/2017 if not previously used by taxpayer or related party.' },
    { requirement: 'Acquisition Date', details: 'Post-OBBBA (after 1/19/2025): acquired after January 19, 2025. Pre-OBBBA: acquired after September 27, 2017.' },
    { requirement: 'Placed in Service', details: 'Must be placed in service during the tax year the deduction is claimed.' },
    { requirement: 'Business Use', details: 'Must be used more than 50% for business (listed property rule).' },
    { requirement: 'Not Excluded', details: 'Cannot be: property used outside the U.S.; tax-exempt use property; tax-exempt bond-financed property; property for which taxpayer elected out; floor plan financing indebtedness property (for certain auto dealers).' }
];

const EXCLUDED_PROPERTY = [
    { property: 'Residential rental property (27.5-year)', reason: 'Recovery period exceeds 20 years' },
    { property: 'Nonresidential real property (39-year)', reason: 'Recovery period exceeds 20 years' },
    { property: 'Qualified improvement property (QIP) placed in service before 2018', reason: 'Was 39-year property before CARES Act fix' },
    { property: 'Property with elected-out class', reason: 'Taxpayer elected out of bonus for the class' },
    { property: 'Property acquired from related party', reason: '§267 or §707(b) relationship' },
    { property: 'Property converted from personal to business use', reason: 'Original use did not begin with taxpayer in business capacity' }
];

const VEHICLE_LIMITS = [
    { year: '2025', y1Bonus: '$20,400', y1NoBonus: '$12,400', y2: '$19,800', y3: '$11,900', y4: '$7,160' },
    { year: '2024', y1Bonus: '$20,400', y1NoBonus: '$12,400', y2: '$19,800', y3: '$11,900', y4: '$7,160' },
    { year: '2023', y1Bonus: '$20,200', y1NoBonus: '$12,200', y2: '$19,500', y3: '$11,700', y4: '$6,960' },
    { year: '2022', y1Bonus: '$19,200', y1NoBonus: '$11,200', y2: '$18,000', y3: '$10,800', y4: '$6,460' },
    { year: '2021', y1Bonus: '$18,200', y1NoBonus: '$10,200', y2: '$16,400', y3: '$9,800', y4: '$5,860' },
    { year: '2020', y1Bonus: '$18,100', y1NoBonus: '$10,100', y2: '$16,100', y3: '$9,700', y4: '$5,760' },
    { year: '2019', y1Bonus: '$18,100', y1NoBonus: '$10,100', y2: '$16,100', y3: '$9,700', y4: '$5,760' },
    { year: '2018', y1Bonus: '$18,000', y1NoBonus: '$10,000', y2: '$16,000', y3: '$9,600', y4: '$5,760' }
];

function pctTone(pct) {
    if (pct >= 100) return 'pill-green';
    if (pct >= 40) return 'pill-amber';
    return 'pill-red';
}

function downloadBonusCSV() {
    const rows = ['Year Placed in Service,Bonus %,Longer Production Period %,Legislative Authority,Notes'];
    BONUS_DATA.forEach((r) => {
        rows.push(`"${r.year}",${r.pct},${r.lpp},"${r.law}","${r.notes}"`);
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'bonus_depreciation_rates.csv';
    a.click();
}

// ======================================================
// Function : BonusDepreciation
// Purpose  : React component that renders the 'Bonus Depreciation' UI
// ======================================================

export function BonusDepreciation() {
    const [tab, setTab] = useState('timeline');

    const rulesColumns = [
        { header: 'Requirement', render: (r) => <strong>{r.requirement}</strong> },
        { header: 'Details', render: (r) => r.details }
    ];
    const excludedColumns = [
        { header: 'Excluded Property', render: (r) => r.property },
        { header: 'Reason', render: (r) => r.reason }
    ];
    const limitsColumns = [
        { header: 'Year Placed in Service', render: (r) => r.year },
        { header: 'Year 1 (with Bonus)', numeric: true, render: (r) => r.y1Bonus },
        { header: 'Year 1 (no Bonus)', numeric: true, render: (r) => r.y1NoBonus },
        { header: 'Year 2', numeric: true, render: (r) => r.y2 },
        { header: 'Year 3', numeric: true, render: (r) => r.y3 },
        { header: 'Year 4+', numeric: true, render: (r) => r.y4 }
    ];

    return (<AppLayout active="bonus" title="Bonus Depreciation" crumb="Home / Configuration / Bonus Depreciation">
      <div className="page-header">
        <div>
          <h1>Bonus Depreciation Rates — IRC §168(k)</h1>
          <p>Historical and current additional first-year depreciation percentages</p>
        </div>
      </div>

      <div className="tabs">
        {TABS.map((t) => (<div key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </div>))}
      </div>

      {tab === 'timeline' && (<>
          <div className="card mb-4">
            <div className="card-pad flex items-center gap-4" style={{ flexWrap: 'wrap' }}>
              <div className="legend" style={{ flexDirection: 'row', gap: 20 }}>
                <div className="li"><span className="dot" style={{ background: 'var(--green)' }}/>100% (Full expensing)</div>
                <div className="li"><span className="dot" style={{ background: 'var(--amber)' }}/>Partial bonus (phase-out)</div>
                <div className="li"><span className="dot" style={{ background: 'var(--red)' }}/>No bonus / expired</div>
              </div>
              <Button variant="ghost" onClick={downloadBonusCSV} style={{ marginLeft: 'auto' }}>
                Export CSV
              </Button>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h3>Bonus Depreciation Percentage by Year Placed in Service</h3>
            </div>
            <div className="card-pad" style={{ paddingTop: 0, paddingBottom: 4 }}>
              <p className="text-muted text-sm">
                IRC §168(k) additional first-year depreciation allowance. Applies to qualified property with recovery period of 20 years or less, computer software, water utility property, and qualified film/TV/live theatrical productions.
              </p>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Year Placed in Service</th>
                    <th className="num">Bonus %</th>
                    <th>Longer Production Period / Aircraft</th>
                    <th>Legislative Authority</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {BONUS_DATA.map((row) => (<tr key={row.year} style={row.highlight ? { background: '#f0fdf4' } : undefined}>
                      <td>{row.year}</td>
                      <td className="num"><span className={`pill ${pctTone(row.pct)}`}>{row.pct}%</span></td>
                      <td>{row.lpp !== row.pct ? `${row.lpp}%` : '—'}</td>
                      <td className="text-muted text-sm">{row.law}</td>
                      <td className="text-muted text-sm">{row.notes}</td>
                    </tr>))}
                </tbody>
              </table>
            </div>
          </div>
        </>)}

      {tab === 'rules' && (<>
          <div className="card mb-4">
            <div className="card-head"><h3>Qualifying Property Rules</h3></div>
            <div className="card-pad" style={{ paddingTop: 0, paddingBottom: 4 }}>
              <p className="text-muted text-sm">Property must meet all of the following to qualify for bonus depreciation under §168(k).</p>
            </div>
            <Table columns={rulesColumns} rows={QUALIFYING_RULES} rowKey={(r) => r.requirement}/>
          </div>
          <div className="card">
            <div className="card-head"><h3>Property NOT Eligible for Bonus</h3></div>
            <Table columns={excludedColumns} rows={EXCLUDED_PROPERTY} rowKey={(r) => r.property}/>
          </div>
        </>)}

      {tab === 'limits' && (<div className="card">
          <div className="card-head"><h3>Luxury Auto Depreciation Limits (Passenger Vehicles)</h3></div>
          <div className="card-pad" style={{ paddingTop: 0, paddingBottom: 4 }}>
            <p className="text-muted text-sm">IRC §280F limits on depreciation for passenger automobiles. Amounts shown include bonus depreciation where applicable. Updated annually by IRS Revenue Procedures.</p>
          </div>
          <Table columns={limitsColumns} rows={VEHICLE_LIMITS} rowKey={(r) => r.year}/>
          <div className="card-pad" style={{ paddingTop: 4 }}>
            <p className="text-muted text-sm">
              Note: SUVs/trucks over 6,000 lbs GVWR are exempt from §280F limits but subject to §179 SUV limit ($30,500 for 2024). Vehicles over 6,000 lbs can take full bonus depreciation without the luxury auto cap.
            </p>
          </div>
        </div>)}

      <div className="card mt-4">
        <div className="card-pad text-muted" style={{ fontSize: 11.5, lineHeight: 1.7 }}>
          <strong>Sources:</strong><br/>
          • IRC §168(k) as amended by TCJA (P.L. 115-97, 2017), CARES Act (P.L. 116-136, 2020), and One Big Beautiful Bill Act (OBBBA, P.L. 119-94, 2025).<br/>
          • IRS Publication 946 (2025), Chapter 3 — Claiming the Special Depreciation Allowance.<br/>
          • IRS Notice 2026-11 — Interim Guidance on Additional First Year Depreciation Deduction under §168(k).<br/>
          • Revenue Procedure 2024-13 (luxury auto limits for 2024); Revenue Procedure 2025-16 (2025 limits).<br/><br/>
          <strong>Key OBBBA Change (2025):</strong> Bonus depreciation permanently restored to 100% for qualified property acquired after January 19, 2025. Property acquired before that date but placed in service in 2025 gets 40% (or 60% for longer production period property/aircraft).
        </div>
      </div>
    </AppLayout>);
}

// ======================================================
// END: BonusDepreciation
// ======================================================

// ======================================================
// END: Page Component
// ======================================================
