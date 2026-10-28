// ======================================================
// File Name : sap-normalize.test.ts
// Purpose   : Offline checks for SAP column / date / amount conversion.
// ======================================================

import { describe, expect, it } from 'vitest';
import { normalizeSapRecord, parseSapAmount, parseSapDate } from '../src/services/integrations/sapNormalize.js';

describe('parseSapDate', () => {
  it('handles the common SAP styles', () => {
    expect(parseSapDate('26.10.2026')).toBe('2026-10-26');
    expect(parseSapDate('20261026')).toBe('2026-10-26');
    expect(parseSapDate('2026-10-26')).toBe('2026-10-26');
    expect(parseSapDate('5/3/2026')).toBe('2026-03-05');
    expect(parseSapDate('/Date(1792972800000)/')).toBe('2026-10-26');
  });
});

describe('parseSapAmount', () => {
  it('handles European, US and SAP trailing-minus styles', () => {
    expect(parseSapAmount('1.234,56')).toBe(1234.56);
    expect(parseSapAmount('1,234.56')).toBe(1234.56);
    expect(parseSapAmount('62000')).toBe(62000);
    expect(parseSapAmount('1,234,567')).toBe(1234567);
    expect(parseSapAmount('1.234.567')).toBe(1234567);
    expect(parseSapAmount('100-')).toBe(-100);
    expect(parseSapAmount('abc')).toBeNaN();
  });
});

describe('normalizeSapRecord', () => {
  it('maps SAP technical columns and codes to our record', () => {
    const rec = normalizeSapRecord(
      { ANLN1: '000100200', BUKRS: '1000', ANLKL: '3000', AKTIV: '10.02.2026', ANSWL: '62.000,00', TXT50: 'Laptops', BELNR: '4900001' },
      { companyCodes: { '1000': '5B' }, assetClasses: { '3000': '00.12' } }
    );
    expect(rec).toEqual({
      documentId: '4900001', assetNumber: '000100200', companyCode: '5B', assetClass: '00.12',
      description: 'Laptops', acquisitionCost: 62000, capitalizationDate: '2026-02-10'
    });
  });

  it('keeps our own column names working and builds a document id when SAP has none', () => {
    const rec = normalizeSapRecord(
      { assetNumber: 'A1', companyCode: '2D', assetClass: '00.13', acquisitionCost: 10, capitalizationDate: '2026-01-05' },
      { companyCodes: {}, assetClasses: {} }
    );
    expect(rec.documentId).toBe('2D-A1');
    expect(rec.companyCode).toBe('2D');
  });
});

// ======================================================
// END OF FILE : sap-normalize.test.ts
// ======================================================
