// ======================================================
// File Name : lifecycleFormSchemas.js
// Purpose   : In-memory data store / accessors for lifecycleFormSchemas
// ======================================================


// ======================================================
// START: Data Functions
// ======================================================

/**
 * Field definitions for each Lifecycle Event card, ported 1:1 from the
 * standalone reference calculators (Htmls/pages/*.html — additions,
 * adjustments, disposals, transfers, reinstatements, reclassifications).
 * Each event type gets its own box set instead of one shared form.
 */

export const ASSET_TYPE_OPTIONS = [
  'Personal Property 3yr MACRS 200% DB (GDS)',
  'Personal Property 5yr MACRS 200% DB (GDS)',
  'Personal Property 7yr MACRS 200% DB (GDS)',
  'Personal Property 10yr MACRS 200% DB (GDS)',
  'Personal Property 15yr MACRS 150% DB (GDS)',
  'Personal Property 20yr MACRS 150% DB (GDS)',
  'Residential Rental 27.5yr SL Mid-Month (GDS)',
  'Nonresidential Real 31.5yr SL Mid-Month (GDS)',
  'Nonresidential Real 39yr SL Mid-Month (GDS)',
  'Personal Property 3yr 150% DB (GDS)',
  'Personal Property 5yr 150% DB (GDS)',
  'Personal Property 7yr 150% DB (GDS)',
  'Personal Property 10yr 150% DB (GDS)',
  'Personal Property 3yr SL (ADS)',
  'Personal Property 5yr SL (ADS)',
  'Personal Property 9yr SL (ADS)',
  'Personal Property 10yr SL (ADS)',
  'Personal Property 12yr SL (ADS)',
  'Personal Property 20yr SL (ADS)',
  'Personal Property 25yr SL (ADS)',
  'Residential Rental 30yr SL Mid-Month (ADS)',
  'Nonresidential Real 40yr SL Mid-Month (ADS)',
  'Personal Property 5yr MACRS (WBC)',
  'Personal Property 5yr MACRS (UK - 57)',
  'Book Only — No Depreciation'
];

export const RATE_TABLE_OPTIONS = [
  '— Auto (based on life/convention) —',
  'MACRS Table A-1 HY 200% DB — 5 Year',
  'MACRS Table A-1 HY 200% DB — 7 Year',
  'MACRS Table A-1 HY 200% DB — 3 Year',
  'MACRS Table A-1 HY 200% DB — 10 Year',
  'MACRS Table A-1 HY 200% DB — 15 Year',
  'MACRS Table A-1 HY 200% DB — 20 Year',
  'MACRS Table A-2 MQ Q1 200% DB',
  'MACRS Table A-3 MQ Q2 200% DB',
  'MACRS Table A-4 MQ Q3 200% DB',
  'MACRS Table A-5 MQ Q4 200% DB',
  'MACRS 150% DB Half-Year (State AMT)',
  'MACRS Table A-6 Residential 27.5yr Mid-Month',
  'MACRS Table A-7a Nonresidential 39yr Mid-Month',
  'Nonresidential Real Property SL 40yr Mid-Month',
  'Straight Line, Full-Month Convention',
  'ADS 3-Year SL Half-Year',
  'ADS 5-Year SL Half-Year',
  'ADS 9-Year SL Half-Year',
  'ADS 10-Year SL Half-Year',
  'ADS 12-Year SL Half-Year',
  'ADS 20-Year SL Half-Year',
  'ADS 25-Year SL Half-Year',
  'ADS 30-Year Residential SL Mid-Month',
  'ADS 40-Year Nonresidential SL Mid-Month',
  'Straight Line (No Bonus) Half-Year'
];

export const QUARTER_OPTIONS = ['Q1 (Jan–Mar)', 'Q2 (Apr–Jun)', 'Q3 (Jul–Sep)', 'Q4 (Oct–Dec)'];
export const METHOD_OPTIONS = ['MACRS', 'MACRS ADS', 'SL', 'MACRS Straight-Line', 'MACRS 150DB'];

/** Per-card field list. `key` is what lands in formData / gets posted to the API. */
export const FIELD_SCHEMAS = {
  addition: [
    { key: 'assetType', label: 'Asset Type', type: 'select', options: ASSET_TYPE_OPTIONS },
    { key: 'cost', label: 'Asset Cost', type: 'number', placeholder: 'e.g. 120000' },
    { key: 'placedInService', label: 'Placed-In-Service Date', type: 'date' },
    { key: 'lifeMonths', label: 'Life (Months)', type: 'number', hint: 'Auto from asset type' },
    { key: 'rateTable', label: 'Rate Table', type: 'select', options: RATE_TABLE_OPTIONS },
    { key: 'convention', label: 'Convention', type: 'select', options: ['HY (Half-Year)', 'MQ (Mid-Quarter)', 'Mid-Month', 'Full-Month'] },
    { key: 'quarter', label: 'Quarter Placed in Service', type: 'select', options: QUARTER_OPTIONS },
    { key: 'bonusPct', label: 'Bonus %', type: 'number', hint: 'Auto-assigned from PIS/Type' },
    { key: 'electOutBonus', label: 'Elect Out Bonus', type: 'checkbox' },
    { key: 'accountingPeriodDate', label: 'Accounting Period Date', type: 'date' }
  ],

  adjustment: [
    { key: 'assetType', label: 'Asset Type', type: 'select', options: ASSET_TYPE_OPTIONS },
    { key: 'originalCost', label: 'Original Asset Cost', type: 'number', placeholder: 'e.g. 12707.12' },
    { key: 'placedInService', label: 'PISD', type: 'date' },
    { key: 'lifeMonths', label: 'Life (Months)', type: 'number', hint: 'Auto from asset type' },
    { key: 'existingAccumDepr', label: 'Existing Accum Depr (BOY)', type: 'number', placeholder: 'e.g. 12707.12' },
    { key: 'priorAdjBalance', label: 'Prior Adjustment Balance', type: 'number' },
    { key: 'adjustmentAmount', label: 'Adjustment Amount (+/-)', type: 'number', placeholder: 'e.g. 519134.02 or -813708.14' },
    { key: 'effectiveDate', label: 'Effective Date', type: 'date' },
    { key: 'accountingPeriodDate', label: 'Accounting Period Date', type: 'date' },
    { key: 'convention', label: 'Convention', type: 'select', options: ['HY (Half-Year)', 'MQ (Mid-Quarter)', 'Mid-Month'] },
    { key: 'quarter', label: 'Quarter Placed in Service', type: 'select', options: QUARTER_OPTIONS },
    { key: 'bonusPct', label: 'Bonus %', type: 'number', hint: 'Auto from PISD/type' },
    { key: 'electOutBonus', label: 'Elect Out Bonus', type: 'checkbox' }
  ],

  retirement: [
    { key: 'assetType', label: 'Asset Type', type: 'select', options: ASSET_TYPE_OPTIONS },
    { key: 'cost', label: 'Asset Cost', type: 'number', placeholder: 'e.g. 120000' },
    { key: 'placedInService', label: 'Placed-In-Service Date (PISD)', type: 'date' },
    { key: 'recoveryPeriodYears', label: 'Recovery Period (Years)', type: 'number', hint: 'Auto from asset type' },
    { key: 'convention', label: 'Convention', type: 'select', options: ['HY (Half-Year)', 'MQ (Mid-Quarter)', 'MM (Mid-Month)'] },
    { key: 'quarter', label: 'Quarter Placed in Service', type: 'select', options: QUARTER_OPTIONS },
    { key: 'bonusPct', label: 'Bonus % (at addition)', type: 'number', hint: 'Auto from PISD/type' },
    { key: 'boyAccumDepr', label: 'BOY Accumulated Depr.', type: 'number', placeholder: 'e.g. 62400' },
    { key: 'monthlyDeprRate', label: 'Monthly Depreciation Rate', type: 'number', placeholder: 'e.g. 1920' },
    { key: 'disposalDate', label: 'Disposal Date', type: 'date' },
    { key: 'accountingPeriodDate', label: 'Accounting Period Date', type: 'date' },
    { key: 'costDisposed', label: 'Cost Disposed', type: 'number', placeholder: 'e.g. 30000' },
    { key: 'proceeds', label: 'Proceeds', type: 'number', placeholder: 'e.g. 26250' }
  ],

  transfer: [
    { key: 'totalCost', label: 'Total Cost', type: 'number' },
    { key: 'totalAD', label: 'Total A/D', type: 'number' },
    { key: 'bonusAD', label: 'Bonus A/D', type: 'number' },
    { key: 'placedInService', label: 'PISD', type: 'date' },
    { key: 'lifeMonths', label: 'Life (Months)', type: 'number' },
    { key: 'monthlyDeprRate', label: 'Monthly Depr Rate', type: 'number' },
    { key: 'convention', label: 'Convention', type: 'select', options: ['HY', 'MQ', 'Mid-Month'] },
    { key: 'bonusPct', label: 'Bonus %', type: 'number' },
    { key: 'costTransferred', label: 'Cost Transferred', type: 'number' },
    { key: 'transferDate', label: 'Transfer Date', type: 'date' },
    { key: 'accountingPeriodDate', label: 'Accounting Period', type: 'date' },
    { key: 'sourceCompany', label: 'Source Company', type: 'text', placeholder: 'e.g. 27' },
    { key: 'destCompany', label: 'Dest Company', type: 'text', placeholder: 'e.g. 2D' },
    { key: 'sourceLocation', label: 'Source Location', type: 'text' },
    { key: 'destLocation', label: 'Dest Location', type: 'text' }
  ],

  reinstatement: [
    { key: 'assetType', label: 'Asset Type', type: 'select', options: ASSET_TYPE_OPTIONS },
    { key: 'originalCost', label: 'Original Cost', type: 'number' },
    { key: 'placedInService', label: 'PISD', type: 'date' },
    { key: 'lifeMonths', label: 'Life (Months)', type: 'number', hint: 'Auto from asset type' },
    { key: 'originalDisposalDate', label: 'Original Disposal Date', type: 'date' },
    { key: 'originalADAtDisposal', label: 'A/D at Disposal', type: 'number' },
    { key: 'originalGainLoss', label: 'Original Gain/Loss', type: 'number' },
    { key: 'convention', label: 'Convention', type: 'select', options: ['HY (Half-Year)', 'MQ (Mid-Quarter)', 'Mid-Month'] },
    { key: 'bonusPct', label: 'Bonus % (at addition)', type: 'number', hint: 'Auto from PISD/type' },
    { key: 'reinstatementDate', label: 'Reinstatement Date', type: 'date' },
    { key: 'accountingPeriodDate', label: 'Accounting Period', type: 'date' }
  ],

  reclassification: [
    { key: 'originalCost', label: 'Original Cost', type: 'number' },
    { key: 'existingAD', label: 'Existing A/D', type: 'number' },
    { key: 'placedInService', label: 'PISD', type: 'date' },
    { key: 'oldAssetType', label: 'Old Asset Type', type: 'text', placeholder: 'e.g. EQUIP-5YR' },
    { key: 'oldMethod', label: 'Old Method', type: 'select', options: METHOD_OPTIONS },
    { key: 'oldLifeMonths', label: 'Old Life (Months)', type: 'number' },
    { key: 'oldConvention', label: 'Old Convention', type: 'select', options: ['HY', 'MQ', 'Mid-Month'] },
    { key: 'oldBonusPct', label: 'Old Bonus %', type: 'number' },
    { key: 'newAssetType', label: 'New Asset Type', type: 'text', placeholder: 'e.g. EQUIP-5YR-BONUS' },
    { key: 'newMethod', label: 'New Method', type: 'select', options: METHOD_OPTIONS },
    { key: 'newLifeMonths', label: 'New Life (Months)', type: 'number' },
    { key: 'newConvention', label: 'New Convention', type: 'select', options: ['HY', 'MQ', 'Mid-Month'] },
    { key: 'newBonusPct', label: 'New Bonus %', type: 'number' },
    { key: 'effectiveDate', label: 'Effective Date', type: 'date' },
    { key: 'accountingPeriodDate', label: 'Accounting Period', type: 'date' }
  ]
};

/** All lifecycle cards start blank — the only way to populate a card is
 *  the "Load Test Case" dropdown above the form, which should visibly
 *  fill empty fields rather than silently overwrite pre-filled
 *  placeholder values. */
export const FIELD_DEFAULTS = {
  addition: {},
  adjustment: {},
  retirement: {},
  transfer: {},
  reinstatement: {},
  reclassification: {}
};

/** Reverse lookup for the Reinstatement card's "Load Asset" picker: given
 *  an Asset Register record's `taxFactPattern`, resolve which
 *  ASSET_TYPE_OPTIONS label it corresponds to, so picking a real (Retired)
 *  asset pre-fills the same dropdown value the reference calculators use.
 *  Best-effort match by property type / method / recovery years — falls
 *  back to the 5yr GDS 200% DB default when nothing matches closely. */
// ======================================================
// Function : assetTypeLabelFromTaxFactPattern
// Purpose  : Implements logic for 'assetTypeLabelFromTaxFactPattern'
// ======================================================

export function assetTypeLabelFromTaxFactPattern(tfp) {
  if (!tfp) return ASSET_TYPE_OPTIONS[1];
  const years = parseFloat(tfp.recoveryPeriod) || 5;
  const methodText = (tfp.method || '').toUpperCase();
  const propertyType = (tfp.propertyType || '').toLowerCase();

  const find = (pred) => ASSET_TYPE_OPTIONS.find(pred);

  if (propertyType.includes('residential') || years === 27.5 || years === 30) {
    return methodText.includes('ADS')
      ? find((o) => o.startsWith('Residential Rental') && o.includes('(ADS)')) || ASSET_TYPE_OPTIONS[1]
      : find((o) => o.startsWith('Residential Rental') && o.includes('(GDS)')) || ASSET_TYPE_OPTIONS[1];
  }
  if (propertyType.includes('nonresidential') || years === 31.5 || years === 39 || years === 40) {
    return methodText.includes('ADS')
      ? find((o) => o.startsWith('Nonresidential Real') && o.includes('(ADS)')) || ASSET_TYPE_OPTIONS[1]
      : find((o) => o.startsWith('Nonresidential Real') && o.includes('(GDS)')) || ASSET_TYPE_OPTIONS[1];
  }
  if (methodText.includes('ADS')) {
    return find((o) => o.includes(`${years}yr SL (ADS)`)) || find((o) => o.endsWith('(ADS)')) || ASSET_TYPE_OPTIONS[1];
  }
  if (methodText.includes('150')) {
    return find((o) => o.includes(`${years}yr 150% DB (GDS)`)) || ASSET_TYPE_OPTIONS[4];
  }
  return find((o) => o.includes(`${years}yr MACRS 200% DB (GDS)`)) || ASSET_TYPE_OPTIONS[1];
}

// ======================================================
// END: assetTypeLabelFromTaxFactPattern
// ======================================================

/** Reinstatement card's "Convention" select uses the long labels
 *  ('HY (Half-Year)', 'MQ (Mid-Quarter)', 'Mid-Month'); the Asset
 *  Register's taxFactPattern.convention uses plain text ('Half-Year',
 *  'Mid-Quarter', 'Mid-Month'). */
// ======================================================
// Function : conventionLabelFromTaxFactPattern
// Purpose  : Implements logic for 'conventionLabelFromTaxFactPattern'
// ======================================================

export function conventionLabelFromTaxFactPattern(conventionText) {
  const c = (conventionText || '').trim();
  if (c.startsWith('Half')) return 'HY (Half-Year)';
  if (c.startsWith('Mid-Quarter')) return 'MQ (Mid-Quarter)';
  if (c.startsWith('Mid-Month')) return 'Mid-Month';
  return 'HY (Half-Year)';
}

// ======================================================
// END: conventionLabelFromTaxFactPattern
// ======================================================

/** '5 years' / '9 years' / '5' -> 60 / 108 / 60 (months) */
// ======================================================
// Function : lifeMonthsFromRecoveryPeriod
// Purpose  : Implements logic for 'lifeMonthsFromRecoveryPeriod'
// ======================================================

export function lifeMonthsFromRecoveryPeriod(recoveryPeriod) {
  const years = parseFloat(recoveryPeriod);
  return Number.isFinite(years) ? Math.round(years * 12) : 60;
}

// ======================================================
// END: lifeMonthsFromRecoveryPeriod
// ======================================================

/** Builds the Reinstatement card's field values from a real Asset Register
 *  record (must be status 'Retired' and carry a `disposal` snapshot —
 *  see server/src/data/assets.ts). Disposal-specific facts (disposal date,
 *  A/D at disposal, gain/loss) come from `asset.disposal`; everything else
 *  comes from `asset.taxFactPattern`. Returns null if the asset can't be
 *  reinstated (not Retired, or missing a disposal snapshot). */
// ======================================================
// Function : reinstatementFieldsFromAsset
// Purpose  : Implements logic for 'reinstatementFieldsFromAsset'
// ======================================================

export function reinstatementFieldsFromAsset(asset) {
  if (!asset || asset.status !== 'Retired' || !asset.disposal) return null;
  const tfp = asset.taxFactPattern;
  return {
    assetType: assetTypeLabelFromTaxFactPattern(tfp),
    originalCost: String(asset.cost),
    placedInService: tfp ? tfp.placedInService : '',
    lifeMonths: String(lifeMonthsFromRecoveryPeriod(tfp && tfp.recoveryPeriod)),
    originalDisposalDate: asset.disposal.disposalDate,
    originalADAtDisposal: String(asset.disposal.adAtDisposal),
    originalGainLoss: String(asset.disposal.gainLoss),
    convention: conventionLabelFromTaxFactPattern(tfp && tfp.convention),
    bonusPct: String(tfp ? tfp.bonusPct : 0)
    // reinstatementDate / accountingPeriodDate are transaction-specific
    // (today's date, this period's close) — left for the user to set.
  };
}

// ======================================================
// END: reinstatementFieldsFromAsset
// ======================================================

// ======================================================
// END: Data Functions
// ======================================================

