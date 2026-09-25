// ======================================================
// File Name : lifecycleTestCases.js
// Purpose   : In-memory data store / accessors for lifecycleTestCases
// ======================================================


// ======================================================
// START: Data Functions
// ======================================================

/**
 * Test-case scenarios for each Lifecycle Event card, ported 1:1 (100% same
 * option set) from the standalone reference calculators' "Load Test Case"
 * dropdowns (Htmls/js/additions.js, adjustments.js, disposals.js,
 * transfers.js, reinstatements.js, reclassifications.js).
 */

export const LIFECYCLE_TEST_CASES = {
  "addition": [
    {
      "id": "prod-845756880",
      "name": "Prod: Current Period 100% Bonus 5yr GDS (845756880)",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "cost": 360894.09,
        "placedInService": "2026-03-06",
        "lifeMonths": 60,
        "convention": "HY (Half-Year)",
        "bonusPct": 100,
        "accountingPeriodDate": "2026-03-31",
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "prod-845993316",
      "name": "Prod: Backdated 100% Bonus 5yr GDS (845993316)",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "cost": 924,
        "placedInService": "2025-10-27",
        "lifeMonths": 60,
        "convention": "HY (Half-Year)",
        "bonusPct": 100,
        "accountingPeriodDate": "2026-04-06",
        "quarter": "Q4 (Oct–Dec)"
      }
    },
    {
      "id": "prod-845991011",
      "name": "Prod: Backdated 0% Bonus 39yr Non-Res Real (845991011)",
      "values": {
        "assetType": "Nonresidential Real 39yr SL Mid-Month (GDS)",
        "cost": 839298.6,
        "placedInService": "2025-07-31",
        "lifeMonths": 468,
        "convention": "Mid-Month",
        "bonusPct": 0,
        "accountingPeriodDate": "2026-03-31",
        "quarter": "Q3 (Jul–Sep)"
      }
    },
    {
      "id": "prod-revision",
      "name": "Prod: Same-Year Backdated 20% Bonus Revision",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "cost": 120000,
        "placedInService": "2026-01-01",
        "lifeMonths": 60,
        "convention": "HY (Half-Year)",
        "bonusPct": 20,
        "accountingPeriodDate": "2026-04-30",
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-a1-3yr-100",
      "name": "Test: Addition 3yr 200%DB HY 100% Bonus",
      "values": {
        "assetType": "Personal Property 3yr MACRS 200% DB (GDS)",
        "cost": 1000,
        "placedInService": "2026-03-06",
        "lifeMonths": 36,
        "convention": "HY (Half-Year)",
        "bonusPct": 100,
        "accountingPeriodDate": "2026-03-31",
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-a1-3yr-40-py",
      "name": "Test: Backdated PY 3yr 200%DB HY 40% Bonus (PISD 1/1/25)",
      "values": {
        "assetType": "Personal Property 3yr MACRS 200% DB (GDS)",
        "cost": 1000,
        "placedInService": "2025-01-01",
        "lifeMonths": 36,
        "convention": "HY (Half-Year)",
        "bonusPct": 40,
        "accountingPeriodDate": "2026-03-31",
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-a1-5yr-100",
      "name": "Test: Addition 5yr 200%DB HY 100% Bonus",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "cost": 1000,
        "placedInService": "2026-03-06",
        "lifeMonths": 60,
        "convention": "HY (Half-Year)",
        "bonusPct": 100,
        "accountingPeriodDate": "2026-03-31",
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-a1-5yr-40-py",
      "name": "Test: Backdated PY 5yr 200%DB HY 40% Bonus (PISD 1/1/25)",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "cost": 1000,
        "placedInService": "2025-01-01",
        "lifeMonths": 60,
        "convention": "HY (Half-Year)",
        "bonusPct": 40,
        "accountingPeriodDate": "2026-03-31",
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-a1-7yr-40-py",
      "name": "Test: Backdated PY 7yr 200%DB HY 40% Bonus (PISD 1/1/25)",
      "values": {
        "assetType": "Personal Property 7yr MACRS 200% DB (GDS)",
        "cost": 1000,
        "placedInService": "2025-01-01",
        "lifeMonths": 84,
        "convention": "HY (Half-Year)",
        "bonusPct": 40,
        "accountingPeriodDate": "2026-03-31",
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-a1-10yr-40-py",
      "name": "Test: Backdated PY 10yr 200%DB HY 40% Bonus (PISD 1/1/25)",
      "values": {
        "assetType": "Personal Property 10yr MACRS 200% DB (GDS)",
        "cost": 1000,
        "placedInService": "2025-01-01",
        "lifeMonths": 120,
        "convention": "HY (Half-Year)",
        "bonusPct": 40,
        "accountingPeriodDate": "2026-03-31",
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-a2-5yr-mq1",
      "name": "Test: Addition 5yr 200%DB MQ-Q1 100% Bonus",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "cost": 1000,
        "placedInService": "2026-03-06",
        "lifeMonths": 60,
        "convention": "MQ (Mid-Quarter)",
        "bonusPct": 100,
        "accountingPeriodDate": "2026-03-31",
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-a3-5yr-mq2",
      "name": "Test: Addition 5yr 200%DB MQ-Q2 100% Bonus",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "cost": 1000,
        "placedInService": "2026-05-15",
        "lifeMonths": 60,
        "convention": "MQ (Mid-Quarter)",
        "bonusPct": 100,
        "accountingPeriodDate": "2026-05-31",
        "quarter": "Q2 (Apr–Jun)"
      }
    },
    {
      "id": "test-a4-5yr-mq3",
      "name": "Test: Addition 5yr 200%DB MQ-Q3 100% Bonus",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "cost": 1000,
        "placedInService": "2026-08-15",
        "lifeMonths": 60,
        "convention": "MQ (Mid-Quarter)",
        "bonusPct": 100,
        "accountingPeriodDate": "2026-08-31",
        "quarter": "Q3 (Jul–Sep)"
      }
    },
    {
      "id": "test-a5-5yr-mq4",
      "name": "Test: Addition 5yr 200%DB MQ-Q4 100% Bonus",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "cost": 1000,
        "placedInService": "2026-11-15",
        "lifeMonths": 60,
        "convention": "MQ (Mid-Quarter)",
        "bonusPct": 100,
        "accountingPeriodDate": "2026-11-30",
        "quarter": "Q4 (Oct–Dec)"
      }
    },
    {
      "id": "test-a14-3yr-100",
      "name": "Test: Addition 3yr 150%DB HY 100% Bonus",
      "values": {
        "assetType": "Personal Property 3yr 150% DB (GDS)",
        "cost": 1000,
        "placedInService": "2026-03-06",
        "lifeMonths": 36,
        "convention": "HY (Half-Year)",
        "bonusPct": 100,
        "accountingPeriodDate": "2026-03-31",
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-a14-5yr-40-py",
      "name": "Test: Backdated PY 5yr 150%DB HY 40% Bonus (PISD 1/1/25)",
      "values": {
        "assetType": "Personal Property 5yr 150% DB (GDS)",
        "cost": 1000,
        "placedInService": "2025-01-01",
        "lifeMonths": 60,
        "convention": "HY (Half-Year)",
        "bonusPct": 40,
        "accountingPeriodDate": "2026-03-31",
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-a14-7yr-40-py",
      "name": "Test: Backdated PY 7yr 150%DB HY 40% Bonus (PISD 1/1/25)",
      "values": {
        "assetType": "Personal Property 7yr 150% DB (GDS)",
        "cost": 1000,
        "placedInService": "2025-01-01",
        "lifeMonths": 84,
        "convention": "HY (Half-Year)",
        "bonusPct": 40,
        "accountingPeriodDate": "2026-03-31",
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-a8-3yr-100",
      "name": "Test: Addition 3yr SL HY 100% Bonus",
      "values": {
        "assetType": "Personal Property 3yr SL (ADS)",
        "cost": 1000,
        "placedInService": "2026-03-06",
        "lifeMonths": 36,
        "convention": "HY (Half-Year)",
        "bonusPct": 100,
        "accountingPeriodDate": "2026-03-31",
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-a8-5yr-40-py",
      "name": "Test: Backdated PY 5yr SL HY 40% Bonus (PISD 1/1/25)",
      "values": {
        "assetType": "Personal Property 5yr SL (ADS)",
        "cost": 1000,
        "placedInService": "2025-01-01",
        "lifeMonths": 60,
        "convention": "HY (Half-Year)",
        "bonusPct": 40,
        "accountingPeriodDate": "2026-03-31",
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-ads-5yr-0-py",
      "name": "Test: Backdated PY 5yr ADS SL HY 0% Bonus Foreign (PISD 1/1/25)",
      "values": {
        "assetType": "Personal Property 5yr SL (ADS)",
        "cost": 1000,
        "placedInService": "2025-01-01",
        "lifeMonths": 60,
        "convention": "HY (Half-Year)",
        "bonusPct": 0,
        "accountingPeriodDate": "2026-03-31",
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-ads-9yr-0-py",
      "name": "Test: Backdated PY 9yr ADS SL HY 0% Bonus Foreign (PISD 1/1/25)",
      "values": {
        "assetType": "Personal Property 9yr SL (ADS)",
        "cost": 1000,
        "placedInService": "2025-01-01",
        "lifeMonths": 108,
        "convention": "HY (Half-Year)",
        "bonusPct": 0,
        "accountingPeriodDate": "2026-03-31",
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-2024-5yr-60-hy",
      "name": "Test: Backdated 2024 5yr 200%DB HY 60% (PISD 6/15/24)",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "cost": 1000,
        "placedInService": "2024-06-15",
        "lifeMonths": 60,
        "convention": "HY (Half-Year)",
        "bonusPct": 60,
        "accountingPeriodDate": "2026-03-31",
        "quarter": "Q2 (Apr–Jun)"
      }
    },
    {
      "id": "test-2024-3yr-60-hy",
      "name": "Test: Backdated 2024 3yr 200%DB HY 60% (PISD 6/15/24)",
      "values": {
        "assetType": "Personal Property 3yr MACRS 200% DB (GDS)",
        "cost": 1000,
        "placedInService": "2024-06-15",
        "lifeMonths": 36,
        "convention": "HY (Half-Year)",
        "bonusPct": 60,
        "accountingPeriodDate": "2026-03-31",
        "quarter": "Q2 (Apr–Jun)"
      }
    },
    {
      "id": "test-2024-7yr-60-hy",
      "name": "Test: Backdated 2024 7yr 200%DB HY 60% (PISD 6/15/24)",
      "values": {
        "assetType": "Personal Property 7yr MACRS 200% DB (GDS)",
        "cost": 1000,
        "placedInService": "2024-06-15",
        "lifeMonths": 84,
        "convention": "HY (Half-Year)",
        "bonusPct": 60,
        "accountingPeriodDate": "2026-03-31",
        "quarter": "Q2 (Apr–Jun)"
      }
    },
    {
      "id": "test-2024-10yr-60-hy",
      "name": "Test: Backdated 2024 10yr 200%DB HY 60% (PISD 6/15/24)",
      "values": {
        "assetType": "Personal Property 10yr MACRS 200% DB (GDS)",
        "cost": 1000,
        "placedInService": "2024-06-15",
        "lifeMonths": 120,
        "convention": "HY (Half-Year)",
        "bonusPct": 60,
        "accountingPeriodDate": "2026-03-31",
        "quarter": "Q2 (Apr–Jun)"
      }
    },
    {
      "id": "test-2024-5yr-60-mq1",
      "name": "Test: Backdated 2024 5yr 200%DB MQ-Q1 60% (PISD 2/15/24)",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "cost": 1000,
        "placedInService": "2024-02-15",
        "lifeMonths": 60,
        "convention": "MQ (Mid-Quarter)",
        "bonusPct": 60,
        "accountingPeriodDate": "2026-03-31",
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-2024-5yr-60-mq3",
      "name": "Test: Backdated 2024 5yr 200%DB MQ-Q3 60% (PISD 8/15/24)",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "cost": 1000,
        "placedInService": "2024-08-15",
        "lifeMonths": 60,
        "convention": "MQ (Mid-Quarter)",
        "bonusPct": 60,
        "accountingPeriodDate": "2026-03-31",
        "quarter": "Q3 (Jul–Sep)"
      }
    },
    {
      "id": "test-2024-150db-5yr-60",
      "name": "Test: Backdated 2024 5yr 150%DB HY 60% (PISD 6/15/24)",
      "values": {
        "assetType": "Personal Property 5yr 150% DB (GDS)",
        "cost": 1000,
        "placedInService": "2024-06-15",
        "lifeMonths": 60,
        "convention": "HY (Half-Year)",
        "bonusPct": 60,
        "accountingPeriodDate": "2026-03-31",
        "quarter": "Q2 (Apr–Jun)"
      }
    },
    {
      "id": "test-2024-ads-5yr-0",
      "name": "Test: Backdated 2024 5yr ADS SL HY 0% Foreign (PISD 6/15/24)",
      "values": {
        "assetType": "Personal Property 5yr SL (ADS)",
        "cost": 1000,
        "placedInService": "2024-06-15",
        "lifeMonths": 60,
        "convention": "HY (Half-Year)",
        "bonusPct": 0,
        "accountingPeriodDate": "2026-03-31",
        "quarter": "Q2 (Apr–Jun)"
      }
    },
    {
      "id": "test-2024-39yr-0-mm",
      "name": "Test: Backdated 2024 39yr Non-Res Real MM 0% (PISD 6/15/24)",
      "values": {
        "assetType": "Nonresidential Real 39yr SL Mid-Month (GDS)",
        "cost": 1000,
        "placedInService": "2024-06-15",
        "lifeMonths": 468,
        "convention": "Mid-Month",
        "bonusPct": 0,
        "accountingPeriodDate": "2026-03-31",
        "quarter": "Q2 (Apr–Jun)"
      }
    },
    {
      "id": "test-a6-27yr-mm",
      "name": "Test: Addition 27.5yr Residential Mid-Month (Mar)",
      "values": {
        "assetType": "Residential Rental 27.5yr SL Mid-Month (GDS)",
        "cost": 1000,
        "placedInService": "2026-03-06",
        "lifeMonths": 330,
        "convention": "Mid-Month",
        "bonusPct": 0,
        "accountingPeriodDate": "2026-03-31",
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-a7a-39yr-mm",
      "name": "Test: Addition 39yr Non-Res Real Mid-Month (Mar)",
      "values": {
        "assetType": "Nonresidential Real 39yr SL Mid-Month (GDS)",
        "cost": 1000,
        "placedInService": "2026-03-06",
        "lifeMonths": 468,
        "convention": "Mid-Month",
        "bonusPct": 0,
        "accountingPeriodDate": "2026-03-31",
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-a13-30yr-mm",
      "name": "Test: Addition 30yr ADS Residential Mid-Month (Mar)",
      "values": {
        "assetType": "Residential Rental 30yr SL Mid-Month (ADS)",
        "cost": 1000,
        "placedInService": "2026-03-06",
        "lifeMonths": 360,
        "convention": "Mid-Month",
        "bonusPct": 0,
        "accountingPeriodDate": "2026-03-31",
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-a13a-40yr-mm",
      "name": "Test: Addition 40yr ADS Non-Res Mid-Month (Mar)",
      "values": {
        "assetType": "Nonresidential Real 40yr SL Mid-Month (ADS)",
        "cost": 1000,
        "placedInService": "2026-03-06",
        "lifeMonths": 480,
        "convention": "Mid-Month",
        "bonusPct": 0,
        "accountingPeriodDate": "2026-03-31",
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-bdt-cy-5yr",
      "name": "Test: Backdated CY 5yr 200%DB HY 100% Bonus (PISD 1/15/26)",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "cost": 1000,
        "placedInService": "2026-01-15",
        "lifeMonths": 60,
        "convention": "HY (Half-Year)",
        "bonusPct": 100,
        "accountingPeriodDate": "2026-03-31",
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-bdt-cy-150db",
      "name": "Test: Backdated CY 5yr 150%DB HY 100% Bonus (PISD 1/15/26)",
      "values": {
        "assetType": "Personal Property 5yr 150% DB (GDS)",
        "cost": 1000,
        "placedInService": "2026-01-15",
        "lifeMonths": 60,
        "convention": "HY (Half-Year)",
        "bonusPct": 100,
        "accountingPeriodDate": "2026-03-31",
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-bdt-cy-sl",
      "name": "Test: Backdated CY 5yr SL HY 100% Bonus (PISD 1/15/26)",
      "values": {
        "assetType": "Personal Property 5yr SL (ADS)",
        "cost": 1000,
        "placedInService": "2026-01-15",
        "lifeMonths": 60,
        "convention": "HY (Half-Year)",
        "bonusPct": 100,
        "accountingPeriodDate": "2026-03-31",
        "quarter": "Q1 (Jan–Mar)"
      }
    }
  ],
  "adjustment": [
    {
      "id": "prod-positive-100bonus",
      "name": "Prod: Positive Adj 100% Bonus 5yr GDS (845338721)",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "originalCost": 12707.12,
        "placedInService": "2026-01-22",
        "lifeMonths": 60,
        "existingAccumDepr": 12707.12,
        "priorAdjBalance": 0,
        "adjustmentAmount": 519134.02,
        "effectiveDate": "2026-01-22",
        "accountingPeriodDate": "2026-03-31",
        "convention": "HY (Half-Year)",
        "bonusPct": 100,
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "prod-negative-split",
      "name": "Prod: Negative Adj Elect-Out 7yr GDS (834020438)",
      "values": {
        "assetType": "Personal Property 7yr MACRS 200% DB (GDS)",
        "originalCost": 1252583,
        "placedInService": "2020-09-30",
        "lifeMonths": 84,
        "existingAccumDepr": 1084862.14,
        "priorAdjBalance": 0,
        "adjustmentAmount": -813708.14,
        "effectiveDate": "2026-03-01",
        "accountingPeriodDate": "2026-03-31",
        "convention": "HY (Half-Year)",
        "bonusPct": 0,
        "quarter": "Q3 (Jul–Sep)"
      }
    },
    {
      "id": "test-pos-5yr-100-current",
      "name": "Test: Positive Adj 5yr 200%DB HY 100% Bonus (current)",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "originalCost": 50000,
        "placedInService": "2026-03-01",
        "lifeMonths": 60,
        "existingAccumDepr": 50000,
        "priorAdjBalance": 0,
        "adjustmentAmount": 10000,
        "effectiveDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "convention": "HY (Half-Year)",
        "bonusPct": 100,
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-pos-5yr-40-current",
      "name": "Test: Positive Adj 5yr 200%DB HY 40% Bonus (current)",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "originalCost": 50000,
        "placedInService": "2025-01-01",
        "lifeMonths": 60,
        "existingAccumDepr": 30000,
        "priorAdjBalance": 0,
        "adjustmentAmount": 10000,
        "effectiveDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "convention": "HY (Half-Year)",
        "bonusPct": 40,
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-pos-7yr-100-current",
      "name": "Test: Positive Adj 7yr 200%DB HY 100% Bonus (current)",
      "values": {
        "assetType": "Personal Property 7yr MACRS 200% DB (GDS)",
        "originalCost": 100000,
        "placedInService": "2026-02-01",
        "lifeMonths": 84,
        "existingAccumDepr": 100000,
        "priorAdjBalance": 0,
        "adjustmentAmount": 5000,
        "effectiveDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "convention": "HY (Half-Year)",
        "bonusPct": 100,
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-pos-39yr-0-current",
      "name": "Test: Positive Adj 39yr Non-Res Real 0% Bonus (current)",
      "values": {
        "assetType": "Nonresidential Real 39yr SL Mid-Month (GDS)",
        "originalCost": 500000,
        "placedInService": "2025-03-01",
        "lifeMonths": 468,
        "existingAccumDepr": 12820,
        "priorAdjBalance": 0,
        "adjustmentAmount": 25000,
        "effectiveDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "convention": "Mid-Month",
        "bonusPct": 0,
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-neg-5yr-100-current",
      "name": "Test: Negative Adj 5yr 200%DB HY 100% Bonus (current)",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "originalCost": 50000,
        "placedInService": "2026-03-01",
        "lifeMonths": 60,
        "existingAccumDepr": 50000,
        "priorAdjBalance": 0,
        "adjustmentAmount": -5000,
        "effectiveDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "convention": "HY (Half-Year)",
        "bonusPct": 100,
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-neg-5yr-0-current",
      "name": "Test: Negative Adj 5yr 200%DB HY 0% Bonus Elect-Out (current)",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "originalCost": 100000,
        "placedInService": "2025-01-01",
        "lifeMonths": 60,
        "existingAccumDepr": 32000,
        "priorAdjBalance": 0,
        "adjustmentAmount": -20000,
        "effectiveDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "convention": "HY (Half-Year)",
        "bonusPct": 0,
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-pos-5yr-100-bdt-sy",
      "name": "Test: Backdated SY Positive Adj 5yr 100% Bonus",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "originalCost": 50000,
        "placedInService": "2026-01-15",
        "lifeMonths": 60,
        "existingAccumDepr": 50000,
        "priorAdjBalance": 0,
        "adjustmentAmount": 10000,
        "effectiveDate": "2026-01-15",
        "accountingPeriodDate": "2026-03-31",
        "convention": "HY (Half-Year)",
        "bonusPct": 100,
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-pos-5yr-40-bdt-sy",
      "name": "Test: Backdated SY Positive Adj 5yr 40% Bonus (eff Jan, proc Mar)",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "originalCost": 50000,
        "placedInService": "2025-01-01",
        "lifeMonths": 60,
        "existingAccumDepr": 30000,
        "priorAdjBalance": 0,
        "adjustmentAmount": 10000,
        "effectiveDate": "2026-01-15",
        "accountingPeriodDate": "2026-03-31",
        "convention": "HY (Half-Year)",
        "bonusPct": 40,
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-pos-7yr-60-bdt-sy",
      "name": "Test: Backdated SY Positive Adj 7yr 60% Bonus (eff Jan, proc Mar)",
      "values": {
        "assetType": "Personal Property 7yr MACRS 200% DB (GDS)",
        "originalCost": 80000,
        "placedInService": "2024-06-15",
        "lifeMonths": 84,
        "existingAccumDepr": 60000,
        "priorAdjBalance": 0,
        "adjustmentAmount": 15000,
        "effectiveDate": "2026-01-15",
        "accountingPeriodDate": "2026-03-31",
        "convention": "HY (Half-Year)",
        "bonusPct": 60,
        "quarter": "Q2 (Apr–Jun)"
      }
    },
    {
      "id": "test-pos-5yr-40-bdt-py",
      "name": "Test: Backdated PY Positive Adj 5yr 40% Bonus (eff Jun-25, proc Mar-26)",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "originalCost": 50000,
        "placedInService": "2025-01-01",
        "lifeMonths": 60,
        "existingAccumDepr": 30000,
        "priorAdjBalance": 0,
        "adjustmentAmount": 10000,
        "effectiveDate": "2025-06-15",
        "accountingPeriodDate": "2026-03-31",
        "convention": "HY (Half-Year)",
        "bonusPct": 40,
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-pos-39yr-0-bdt-py",
      "name": "Test: Backdated PY Positive Adj 39yr 0% Bonus (eff Jun-25, proc Mar-26)",
      "values": {
        "assetType": "Nonresidential Real 39yr SL Mid-Month (GDS)",
        "originalCost": 500000,
        "placedInService": "2025-03-01",
        "lifeMonths": 468,
        "existingAccumDepr": 12820,
        "priorAdjBalance": 0,
        "adjustmentAmount": 50000,
        "effectiveDate": "2025-06-15",
        "accountingPeriodDate": "2026-03-31",
        "convention": "Mid-Month",
        "bonusPct": 0,
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-pos-ads5-0-current",
      "name": "Test: Positive Adj 5yr ADS SL 0% Bonus Foreign (current)",
      "values": {
        "assetType": "Personal Property 5yr SL (ADS)",
        "originalCost": 100000,
        "placedInService": "2025-01-01",
        "lifeMonths": 60,
        "existingAccumDepr": 30000,
        "priorAdjBalance": 0,
        "adjustmentAmount": 5000,
        "effectiveDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "convention": "HY (Half-Year)",
        "bonusPct": 0,
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-pos-ads9-0-bdt-sy",
      "name": "Test: Backdated SY Positive Adj 9yr ADS SL 0% Foreign",
      "values": {
        "assetType": "Personal Property 9yr SL (ADS)",
        "originalCost": 200000,
        "placedInService": "2025-01-01",
        "lifeMonths": 108,
        "existingAccumDepr": 33333,
        "priorAdjBalance": 0,
        "adjustmentAmount": 8000,
        "effectiveDate": "2026-01-15",
        "accountingPeriodDate": "2026-03-31",
        "convention": "HY (Half-Year)",
        "bonusPct": 0,
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-neg-ads5-0-current",
      "name": "Test: Negative Adj 5yr ADS SL 0% Bonus Foreign (current)",
      "values": {
        "assetType": "Personal Property 5yr SL (ADS)",
        "originalCost": 100000,
        "placedInService": "2025-01-01",
        "lifeMonths": 60,
        "existingAccumDepr": 30000,
        "priorAdjBalance": 0,
        "adjustmentAmount": -10000,
        "effectiveDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "convention": "HY (Half-Year)",
        "bonusPct": 0,
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-pos-150db5-40-current",
      "name": "Test: Positive Adj 5yr 150%DB HY 40% Bonus (current)",
      "values": {
        "assetType": "Personal Property 5yr 150% DB (GDS)",
        "originalCost": 50000,
        "placedInService": "2025-01-01",
        "lifeMonths": 60,
        "existingAccumDepr": 27650,
        "priorAdjBalance": 0,
        "adjustmentAmount": 10000,
        "effectiveDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "convention": "HY (Half-Year)",
        "bonusPct": 40,
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-pos-150db5-100-current",
      "name": "Test: Positive Adj 5yr 150%DB HY 100% Bonus (current)",
      "values": {
        "assetType": "Personal Property 5yr 150% DB (GDS)",
        "originalCost": 50000,
        "placedInService": "2026-03-01",
        "lifeMonths": 60,
        "existingAccumDepr": 50000,
        "priorAdjBalance": 0,
        "adjustmentAmount": 10000,
        "effectiveDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "convention": "HY (Half-Year)",
        "bonusPct": 100,
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-pos-5yr-100-mq1",
      "name": "Test: Positive Adj 5yr 200%DB MQ-Q1 100% Bonus (current)",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "originalCost": 50000,
        "placedInService": "2026-02-15",
        "lifeMonths": 60,
        "existingAccumDepr": 50000,
        "priorAdjBalance": 0,
        "adjustmentAmount": 10000,
        "effectiveDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "convention": "MQ (Mid-Quarter)",
        "bonusPct": 100,
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-pos-5yr-40-mq3-bdt",
      "name": "Test: Backdated SY Positive Adj 5yr MQ-Q3 40% Bonus",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "originalCost": 50000,
        "placedInService": "2025-08-15",
        "lifeMonths": 60,
        "existingAccumDepr": 25000,
        "priorAdjBalance": 0,
        "adjustmentAmount": 10000,
        "effectiveDate": "2026-01-15",
        "accountingPeriodDate": "2026-03-31",
        "convention": "MQ (Mid-Quarter)",
        "bonusPct": 40,
        "quarter": "Q3 (Jul–Sep)"
      }
    },
    {
      "id": "test-pos-multi-adj",
      "name": "Test: Second Positive Adj with Prior Balance",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "originalCost": 60000,
        "placedInService": "2026-01-22",
        "lifeMonths": 60,
        "existingAccumDepr": 60000,
        "priorAdjBalance": 10000,
        "adjustmentAmount": 5000,
        "effectiveDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "convention": "HY (Half-Year)",
        "bonusPct": 100,
        "quarter": "Q1 (Jan–Mar)"
      }
    },
    {
      "id": "test-pos-2024-5yr-60",
      "name": "Test: Positive Adj 5yr 60% Bonus 2024 PISD (current)",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "originalCost": 80000,
        "placedInService": "2024-06-15",
        "lifeMonths": 60,
        "existingAccumDepr": 58000,
        "priorAdjBalance": 0,
        "adjustmentAmount": 10000,
        "effectiveDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "convention": "HY (Half-Year)",
        "bonusPct": 60,
        "quarter": "Q2 (Apr–Jun)"
      }
    },
    {
      "id": "test-neg-2024-5yr-60",
      "name": "Test: Negative Adj 5yr 60% Bonus 2024 PISD (current)",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "originalCost": 80000,
        "placedInService": "2024-06-15",
        "lifeMonths": 60,
        "existingAccumDepr": 58000,
        "priorAdjBalance": 0,
        "adjustmentAmount": -15000,
        "effectiveDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "convention": "HY (Half-Year)",
        "bonusPct": 60,
        "quarter": "Q2 (Apr–Jun)"
      }
    }
  ],
  "retirement": [
    {
      "id": "prod-partial-hy40",
      "name": "Prod: Partial Disposal HY 40% Bonus 5yr (840189734)",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "cost": 120000,
        "placedInService": "2025-01-01",
        "recoveryPeriodYears": 5,
        "convention": "HY (Half-Year)",
        "bonusPct": 40,
        "boyAccumDepr": 62400,
        "monthlyDeprRate": 1920,
        "disposalDate": "2026-04-30",
        "accountingPeriodDate": "2026-04-30",
        "costDisposed": 30000,
        "proceeds": 26250
      }
    },
    {
      "id": "prod-bdt-full-revision",
      "name": "Prod: Backdated Full Disposal Revision Absorbed",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "cost": 120000,
        "placedInService": "2025-01-01",
        "recoveryPeriodYears": 5,
        "convention": "HY (Half-Year)",
        "bonusPct": 40,
        "boyAccumDepr": 62400,
        "monthlyDeprRate": 1920,
        "disposalDate": "2025-12-31",
        "accountingPeriodDate": "2026-04-30",
        "costDisposed": 120000,
        "proceeds": 26250
      }
    },
    {
      "id": "test-full-5yr-100-hy",
      "name": "Test: Full Retirement 5yr 200%DB HY 100% (current)",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "cost": 1000,
        "placedInService": "2026-03-01",
        "recoveryPeriodYears": 5,
        "convention": "HY (Half-Year)",
        "bonusPct": 100,
        "boyAccumDepr": 1000,
        "monthlyDeprRate": 0,
        "disposalDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "costDisposed": 1000,
        "proceeds": 0
      }
    },
    {
      "id": "test-full-5yr-60-hy",
      "name": "Test: Full Retirement 5yr 200%DB HY 60% PISD 6/15/24 (current)",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "cost": 1000,
        "placedInService": "2024-06-15",
        "recoveryPeriodYears": 5,
        "convention": "HY (Half-Year)",
        "bonusPct": 60,
        "boyAccumDepr": 728,
        "monthlyDeprRate": 17.07,
        "disposalDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "costDisposed": 1000,
        "proceeds": 0
      }
    },
    {
      "id": "test-full-39yr-0-mm",
      "name": "Test: Full Retirement 39yr Non-Res Real MM 0% (current)",
      "values": {
        "assetType": "Nonresidential Real 39yr SL Mid-Month (GDS)",
        "cost": 1000,
        "placedInService": "2025-03-01",
        "recoveryPeriodYears": 39,
        "convention": "MM (Mid-Month)",
        "bonusPct": 0,
        "boyAccumDepr": 20,
        "monthlyDeprRate": 2.14,
        "disposalDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "costDisposed": 1000,
        "proceeds": 0
      }
    },
    {
      "id": "test-full-5yr-0-ads",
      "name": "Test: Full Retirement 5yr ADS SL HY 0% Foreign (current)",
      "values": {
        "assetType": "Personal Property 5yr SL (ADS)",
        "cost": 1000,
        "placedInService": "2025-03-01",
        "recoveryPeriodYears": 5,
        "convention": "HY (Half-Year)",
        "bonusPct": 0,
        "boyAccumDepr": 100,
        "monthlyDeprRate": 16.67,
        "disposalDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "costDisposed": 1000,
        "proceeds": 0
      }
    },
    {
      "id": "test-partial-5yr-100-hy",
      "name": "Test: Partial Retirement 5yr 200%DB HY 100% (current)",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "cost": 1000,
        "placedInService": "2026-03-01",
        "recoveryPeriodYears": 5,
        "convention": "HY (Half-Year)",
        "bonusPct": 100,
        "boyAccumDepr": 1000,
        "monthlyDeprRate": 0,
        "disposalDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "costDisposed": 500,
        "proceeds": 0
      }
    },
    {
      "id": "test-partial-5yr-60-hy",
      "name": "Test: Partial Retirement 5yr 200%DB HY 60% (current)",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "cost": 1000,
        "placedInService": "2024-06-15",
        "recoveryPeriodYears": 5,
        "convention": "HY (Half-Year)",
        "bonusPct": 60,
        "boyAccumDepr": 728,
        "monthlyDeprRate": 17.07,
        "disposalDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "costDisposed": 500,
        "proceeds": 0
      }
    },
    {
      "id": "test-full-bdt-cy-5yr-100",
      "name": "Test: Backdated CY Full Retirement 5yr 100% (PISD 1/15/26)",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "cost": 1000,
        "placedInService": "2026-01-15",
        "recoveryPeriodYears": 5,
        "convention": "HY (Half-Year)",
        "bonusPct": 100,
        "boyAccumDepr": 1000,
        "monthlyDeprRate": 0,
        "disposalDate": "2026-01-15",
        "accountingPeriodDate": "2026-03-31",
        "costDisposed": 1000,
        "proceeds": 0
      }
    },
    {
      "id": "test-full-bdt-cy-5yr-60",
      "name": "Test: Backdated CY Full Retirement 5yr 60% (PISD 6/15/24, disp 1/15/26)",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "cost": 1000,
        "placedInService": "2024-06-15",
        "recoveryPeriodYears": 5,
        "convention": "HY (Half-Year)",
        "bonusPct": 60,
        "boyAccumDepr": 728,
        "monthlyDeprRate": 17.07,
        "disposalDate": "2026-01-15",
        "accountingPeriodDate": "2026-03-31",
        "costDisposed": 1000,
        "proceeds": 0
      }
    },
    {
      "id": "test-full-bdt-py-5yr-100",
      "name": "Test: Backdated PY Full Retirement 5yr 100% (disp 6/15/25)",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "cost": 1000,
        "placedInService": "2025-03-01",
        "recoveryPeriodYears": 5,
        "convention": "HY (Half-Year)",
        "bonusPct": 100,
        "boyAccumDepr": 1000,
        "monthlyDeprRate": 0,
        "disposalDate": "2025-06-15",
        "accountingPeriodDate": "2026-03-31",
        "costDisposed": 1000,
        "proceeds": 0
      }
    },
    {
      "id": "test-full-bdt-py-5yr-60",
      "name": "Test: Backdated PY Full Retirement 5yr 60% (PISD 6/15/24, disp 6/15/25)",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "cost": 1000,
        "placedInService": "2024-06-15",
        "recoveryPeriodYears": 5,
        "convention": "HY (Half-Year)",
        "bonusPct": 60,
        "boyAccumDepr": 728,
        "monthlyDeprRate": 17.07,
        "disposalDate": "2025-06-15",
        "accountingPeriodDate": "2026-03-31",
        "costDisposed": 1000,
        "proceeds": 0
      }
    },
    {
      "id": "test-full-5yr-100-mq1",
      "name": "Test: Full Retirement 5yr 200%DB MQ-Q1 100% (current)",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "cost": 1000,
        "placedInService": "2026-02-15",
        "recoveryPeriodYears": 5,
        "convention": "MQ (Mid-Quarter)",
        "bonusPct": 100,
        "boyAccumDepr": 1000,
        "monthlyDeprRate": 0,
        "disposalDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "costDisposed": 1000,
        "proceeds": 0
      }
    },
    {
      "id": "test-full-5yr-40-mq3-bdt",
      "name": "Test: Backdated PY Full Retirement 5yr MQ-Q3 40% (disp 6/15/25)",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "cost": 1000,
        "placedInService": "2025-01-01",
        "recoveryPeriodYears": 5,
        "convention": "MQ (Mid-Quarter)",
        "bonusPct": 40,
        "boyAccumDepr": 490,
        "monthlyDeprRate": 17,
        "disposalDate": "2025-06-15",
        "accountingPeriodDate": "2026-03-31",
        "costDisposed": 1000,
        "proceeds": 0
      }
    },
    {
      "id": "test-full-150db-5yr-100",
      "name": "Test: Full Retirement 5yr 150%DB HY 100% (current)",
      "values": {
        "assetType": "Personal Property 5yr 150% DB (GDS)",
        "cost": 1000,
        "placedInService": "2026-03-01",
        "recoveryPeriodYears": 5,
        "convention": "HY (Half-Year)",
        "bonusPct": 100,
        "boyAccumDepr": 1000,
        "monthlyDeprRate": 0,
        "disposalDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "costDisposed": 1000,
        "proceeds": 0
      }
    },
    {
      "id": "test-full-150db-5yr-60-bdt",
      "name": "Test: Backdated PY Full Retirement 5yr 150%DB 60% (disp 6/15/25)",
      "values": {
        "assetType": "Personal Property 5yr 150% DB (GDS)",
        "cost": 1000,
        "placedInService": "2024-06-15",
        "recoveryPeriodYears": 5,
        "convention": "HY (Half-Year)",
        "bonusPct": 60,
        "boyAccumDepr": 660,
        "monthlyDeprRate": 12.75,
        "disposalDate": "2025-06-15",
        "accountingPeriodDate": "2026-03-31",
        "costDisposed": 1000,
        "proceeds": 0
      }
    },
    {
      "id": "test-full-ads5-0-current",
      "name": "Test: Full Retirement 5yr ADS SL 0% Foreign (current)",
      "values": {
        "assetType": "Personal Property 5yr SL (ADS)",
        "cost": 1000,
        "placedInService": "2025-03-01",
        "recoveryPeriodYears": 5,
        "convention": "HY (Half-Year)",
        "bonusPct": 0,
        "boyAccumDepr": 100,
        "monthlyDeprRate": 16.67,
        "disposalDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "costDisposed": 1000,
        "proceeds": 0
      }
    },
    {
      "id": "test-full-ads5-0-bdt-py",
      "name": "Test: Backdated PY Full Retirement 5yr ADS 0% Foreign (disp 6/15/25)",
      "values": {
        "assetType": "Personal Property 5yr SL (ADS)",
        "cost": 1000,
        "placedInService": "2025-03-01",
        "recoveryPeriodYears": 5,
        "convention": "HY (Half-Year)",
        "bonusPct": 0,
        "boyAccumDepr": 100,
        "monthlyDeprRate": 16.67,
        "disposalDate": "2025-06-15",
        "accountingPeriodDate": "2026-03-31",
        "costDisposed": 1000,
        "proceeds": 0
      }
    },
    {
      "id": "test-partial-ads5-0-current",
      "name": "Test: Partial Retirement 5yr ADS SL 0% Foreign (current)",
      "values": {
        "assetType": "Personal Property 5yr SL (ADS)",
        "cost": 1000,
        "placedInService": "2025-03-01",
        "recoveryPeriodYears": 5,
        "convention": "HY (Half-Year)",
        "bonusPct": 0,
        "boyAccumDepr": 100,
        "monthlyDeprRate": 16.67,
        "disposalDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "costDisposed": 500,
        "proceeds": 0
      }
    },
    {
      "id": "test-full-39yr-mm-bdt-cy",
      "name": "Test: Backdated CY Full Retirement 39yr MM (disp 1/15/26)",
      "values": {
        "assetType": "Nonresidential Real 39yr SL Mid-Month (GDS)",
        "cost": 1000,
        "placedInService": "2025-03-01",
        "recoveryPeriodYears": 39,
        "convention": "MM (Mid-Month)",
        "bonusPct": 0,
        "boyAccumDepr": 20,
        "monthlyDeprRate": 2.14,
        "disposalDate": "2026-01-15",
        "accountingPeriodDate": "2026-03-31",
        "costDisposed": 1000,
        "proceeds": 0
      }
    },
    {
      "id": "test-full-39yr-mm-bdt-py",
      "name": "Test: Backdated PY Full Retirement 39yr MM (disp 6/15/25)",
      "values": {
        "assetType": "Nonresidential Real 39yr SL Mid-Month (GDS)",
        "cost": 1000,
        "placedInService": "2025-03-01",
        "recoveryPeriodYears": 39,
        "convention": "MM (Mid-Month)",
        "bonusPct": 0,
        "boyAccumDepr": 20,
        "monthlyDeprRate": 2.14,
        "disposalDate": "2025-06-15",
        "accountingPeriodDate": "2026-03-31",
        "costDisposed": 1000,
        "proceeds": 0
      }
    },
    {
      "id": "test-partial-39yr-mm",
      "name": "Test: Partial Retirement 39yr MM (current)",
      "values": {
        "assetType": "Nonresidential Real 39yr SL Mid-Month (GDS)",
        "cost": 1000,
        "placedInService": "2025-03-01",
        "recoveryPeriodYears": 39,
        "convention": "MM (Mid-Month)",
        "bonusPct": 0,
        "boyAccumDepr": 20,
        "monthlyDeprRate": 2.14,
        "disposalDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "costDisposed": 500,
        "proceeds": 0
      }
    },
    {
      "id": "test-full-40yr-ads-mm",
      "name": "Test: Full Retirement 40yr ADS MM (current)",
      "values": {
        "assetType": "Nonresidential Real 40yr SL Mid-Month (ADS)",
        "cost": 1000,
        "placedInService": "2025-03-01",
        "recoveryPeriodYears": 40,
        "convention": "MM (Mid-Month)",
        "bonusPct": 0,
        "boyAccumDepr": 20,
        "monthlyDeprRate": 2.08,
        "disposalDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "costDisposed": 1000,
        "proceeds": 0
      }
    },
    {
      "id": "test-full-5yr-100-proceeds",
      "name": "Test: Full Retirement 5yr 100% with Proceeds (gain)",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "cost": 1000,
        "placedInService": "2026-03-01",
        "recoveryPeriodYears": 5,
        "convention": "HY (Half-Year)",
        "bonusPct": 100,
        "boyAccumDepr": 1000,
        "monthlyDeprRate": 0,
        "disposalDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "costDisposed": 1000,
        "proceeds": 500
      }
    },
    {
      "id": "test-partial-5yr-40-proceeds",
      "name": "Test: Partial Retirement 5yr 40% with Proceeds (loss)",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "cost": 1000,
        "placedInService": "2025-01-01",
        "recoveryPeriodYears": 5,
        "convention": "HY (Half-Year)",
        "bonusPct": 40,
        "boyAccumDepr": 520,
        "monthlyDeprRate": 16,
        "disposalDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "costDisposed": 500,
        "proceeds": 100
      }
    },
    {
      "id": "test-full-2024-5yr-60",
      "name": "Test: Full Retirement 2024 PISD 5yr 60% HY (current)",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "cost": 1000,
        "placedInService": "2024-06-15",
        "recoveryPeriodYears": 5,
        "convention": "HY (Half-Year)",
        "bonusPct": 60,
        "boyAccumDepr": 728,
        "monthlyDeprRate": 17.07,
        "disposalDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "costDisposed": 1000,
        "proceeds": 0
      }
    },
    {
      "id": "test-partial-2024-5yr-60",
      "name": "Test: Partial Retirement 2024 PISD 5yr 60% HY (current)",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "cost": 1000,
        "placedInService": "2024-06-15",
        "recoveryPeriodYears": 5,
        "convention": "HY (Half-Year)",
        "bonusPct": 60,
        "boyAccumDepr": 728,
        "monthlyDeprRate": 17.07,
        "disposalDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "costDisposed": 500,
        "proceeds": 0
      }
    },
    {
      "id": "test-full-2024-7yr-60-bdt",
      "name": "Test: Backdated PY Full Retirement 2024 7yr 60% (disp 12/31/25)",
      "values": {
        "assetType": "Personal Property 7yr MACRS 200% DB (GDS)",
        "cost": 1000,
        "placedInService": "2024-06-15",
        "recoveryPeriodYears": 7,
        "convention": "HY (Half-Year)",
        "bonusPct": 60,
        "boyAccumDepr": 657,
        "monthlyDeprRate": 8.5,
        "disposalDate": "2025-12-31",
        "accountingPeriodDate": "2026-03-31",
        "costDisposed": 1000,
        "proceeds": 0
      }
    },
    {
      "id": "test-partial-bdt-cy-5yr-100",
      "name": "Test: Backdated CY Partial Retirement 5yr 100% (disp 1/15/26)",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "cost": 1000,
        "placedInService": "2026-01-15",
        "recoveryPeriodYears": 5,
        "convention": "HY (Half-Year)",
        "bonusPct": 100,
        "boyAccumDepr": 1000,
        "monthlyDeprRate": 0,
        "disposalDate": "2026-01-15",
        "accountingPeriodDate": "2026-03-31",
        "costDisposed": 500,
        "proceeds": 0
      }
    },
    {
      "id": "test-partial-bdt-cy-5yr-40",
      "name": "Test: Backdated CY Partial Retirement 5yr 40% (disp 1/15/26)",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "cost": 1000,
        "placedInService": "2025-01-01",
        "recoveryPeriodYears": 5,
        "convention": "HY (Half-Year)",
        "bonusPct": 40,
        "boyAccumDepr": 520,
        "monthlyDeprRate": 16,
        "disposalDate": "2026-01-15",
        "accountingPeriodDate": "2026-03-31",
        "costDisposed": 500,
        "proceeds": 0
      }
    },
    {
      "id": "test-partial-bdt-py-5yr-40",
      "name": "Test: Backdated PY Partial Retirement 5yr 40% (disp 6/15/25)",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "cost": 1000,
        "placedInService": "2025-01-01",
        "recoveryPeriodYears": 5,
        "convention": "HY (Half-Year)",
        "bonusPct": 40,
        "boyAccumDepr": 520,
        "monthlyDeprRate": 16,
        "disposalDate": "2025-06-15",
        "accountingPeriodDate": "2026-03-31",
        "costDisposed": 500,
        "proceeds": 0
      }
    },
    {
      "id": "test-partial-bdt-py-5yr-60",
      "name": "Test: Backdated PY Partial Retirement 5yr 60% (PISD 6/15/24, disp 12/31/25)",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "cost": 1000,
        "placedInService": "2024-06-15",
        "recoveryPeriodYears": 5,
        "convention": "HY (Half-Year)",
        "bonusPct": 60,
        "boyAccumDepr": 728,
        "monthlyDeprRate": 17.07,
        "disposalDate": "2025-12-31",
        "accountingPeriodDate": "2026-03-31",
        "costDisposed": 500,
        "proceeds": 200
      }
    },
    {
      "id": "test-partial-bdt-py-39yr-mm",
      "name": "Test: Backdated PY Partial Retirement 39yr MM (disp 6/15/25)",
      "values": {
        "assetType": "Nonresidential Real 39yr SL Mid-Month (GDS)",
        "cost": 1000,
        "placedInService": "2025-03-01",
        "recoveryPeriodYears": 39,
        "convention": "MM (Mid-Month)",
        "bonusPct": 0,
        "boyAccumDepr": 20,
        "monthlyDeprRate": 2.14,
        "disposalDate": "2025-06-15",
        "accountingPeriodDate": "2026-03-31",
        "costDisposed": 500,
        "proceeds": 0
      }
    },
    {
      "id": "test-partial-bdt-py-ads5-0",
      "name": "Test: Backdated PY Partial Retirement 5yr ADS 0% Foreign (disp 6/15/25)",
      "values": {
        "assetType": "Personal Property 5yr SL (ADS)",
        "cost": 1000,
        "placedInService": "2025-03-01",
        "recoveryPeriodYears": 5,
        "convention": "HY (Half-Year)",
        "bonusPct": 0,
        "boyAccumDepr": 100,
        "monthlyDeprRate": 16.67,
        "disposalDate": "2025-06-15",
        "accountingPeriodDate": "2026-03-31",
        "costDisposed": 500,
        "proceeds": 0
      }
    },
    {
      "id": "test-partial-bdt-cy-150db5",
      "name": "Test: Backdated CY Partial Retirement 5yr 150%DB 100% (disp 1/15/26)",
      "values": {
        "assetType": "Personal Property 5yr 150% DB (GDS)",
        "cost": 1000,
        "placedInService": "2026-01-15",
        "recoveryPeriodYears": 5,
        "convention": "HY (Half-Year)",
        "bonusPct": 100,
        "boyAccumDepr": 1000,
        "monthlyDeprRate": 0,
        "disposalDate": "2026-01-15",
        "accountingPeriodDate": "2026-03-31",
        "costDisposed": 500,
        "proceeds": 300
      }
    }
  ],
  "transfer": [
    {
      "id": "prod-intra-844260321",
      "name": "Prod: Intra-Company Transfer (844260321)",
      "values": {
        "totalCost": 3619.93,
        "totalAD": 1882.36,
        "bonusAD": 1447.97,
        "placedInService": "2025-07-31",
        "lifeMonths": 60,
        "monthlyDeprRate": 14.48,
        "convention": "HY",
        "bonusPct": 40,
        "costTransferred": 3619.93,
        "transferDate": "2026-03-01",
        "accountingPeriodDate": "2026-03-31",
        "sourceCompany": "2D",
        "destCompany": "2D",
        "sourceLocation": "5M18",
        "destLocation": "10B4"
      }
    },
    {
      "id": "prod-partial-inter-842153067",
      "name": "Prod: Partial Inter-Company (842153067)",
      "values": {
        "totalCost": 8500.96,
        "totalAD": 4420.5,
        "bonusAD": 3400.38,
        "placedInService": "2025-02-14",
        "lifeMonths": 60,
        "monthlyDeprRate": 34.01,
        "convention": "HY",
        "bonusPct": 40,
        "costTransferred": 3362.88,
        "transferDate": "2026-01-01",
        "accountingPeriodDate": "2026-03-31",
        "sourceCompany": "27",
        "destCompany": "2D",
        "sourceLocation": "2280",
        "destLocation": "6310"
      }
    },
    {
      "id": "prod-inter-india-835482350",
      "name": "Prod: Inter-Company India ADS (835482350)",
      "values": {
        "totalCost": 4349820.6,
        "totalAD": 2174910.21,
        "bonusAD": 0,
        "placedInService": "2021-07-31",
        "lifeMonths": 108,
        "monthlyDeprRate": 40272.41,
        "convention": "HY",
        "bonusPct": 0,
        "costTransferred": 2423899.4,
        "transferDate": "2026-03-16",
        "accountingPeriodDate": "2026-03-31",
        "sourceCompany": "9Z",
        "destCompany": "I7",
        "sourceLocation": "4772",
        "destLocation": "4838"
      }
    },
    {
      "id": "prod-bdt-inter-830316858",
      "name": "Prod: Backdated PY Inter-Company (830316858)",
      "values": {
        "totalCost": 100000,
        "totalAD": 50000,
        "bonusAD": 20000,
        "placedInService": "2024-01-15",
        "lifeMonths": 60,
        "monthlyDeprRate": 1333.33,
        "convention": "HY",
        "bonusPct": 40,
        "costTransferred": 100000,
        "transferDate": "2025-09-15",
        "accountingPeriodDate": "2026-03-31",
        "sourceCompany": "27",
        "destCompany": "2D",
        "sourceLocation": "1019",
        "destLocation": "4D21"
      }
    },
    {
      "id": "test-full-intra-5yr-100-current",
      "name": "Test: Full Intra-Company 5yr 100% HY (current)",
      "values": {
        "totalCost": 1000,
        "totalAD": 1000,
        "bonusAD": 1000,
        "placedInService": "2026-03-01",
        "lifeMonths": 60,
        "monthlyDeprRate": 0,
        "convention": "HY",
        "bonusPct": 100,
        "costTransferred": 1000,
        "transferDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "sourceCompany": "27",
        "destCompany": "27",
        "sourceLocation": "1019",
        "destLocation": "4D21"
      }
    },
    {
      "id": "test-full-intra-5yr-40-current",
      "name": "Test: Full Intra-Company 5yr 40% HY (current)",
      "values": {
        "totalCost": 1000,
        "totalAD": 520,
        "bonusAD": 400,
        "placedInService": "2025-01-01",
        "lifeMonths": 60,
        "monthlyDeprRate": 16,
        "convention": "HY",
        "bonusPct": 40,
        "costTransferred": 1000,
        "transferDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "sourceCompany": "2D",
        "destCompany": "2D",
        "sourceLocation": "A1",
        "destLocation": "B2"
      }
    },
    {
      "id": "test-full-inter-us-foreign-100",
      "name": "Test: Full Inter-Company US to Foreign 5yr 100% (current)",
      "values": {
        "totalCost": 1000,
        "totalAD": 1000,
        "bonusAD": 1000,
        "placedInService": "2026-03-01",
        "lifeMonths": 60,
        "monthlyDeprRate": 0,
        "convention": "HY",
        "bonusPct": 100,
        "costTransferred": 1000,
        "transferDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "sourceCompany": "27",
        "destCompany": "I7",
        "sourceLocation": "US1",
        "destLocation": "IN1"
      }
    },
    {
      "id": "test-full-inter-foreign-us-0",
      "name": "Test: Full Inter-Company Foreign to US 5yr ADS 0% (current)",
      "values": {
        "totalCost": 1000,
        "totalAD": 300,
        "bonusAD": 0,
        "placedInService": "2025-01-01",
        "lifeMonths": 60,
        "monthlyDeprRate": 16.67,
        "convention": "HY",
        "bonusPct": 0,
        "costTransferred": 1000,
        "transferDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "sourceCompany": "I7",
        "destCompany": "27",
        "sourceLocation": "IN1",
        "destLocation": "US1"
      }
    },
    {
      "id": "test-partial-intra-5yr-40",
      "name": "Test: Partial Intra-Company 5yr 40% HY (current)",
      "values": {
        "totalCost": 1000,
        "totalAD": 520,
        "bonusAD": 400,
        "placedInService": "2025-01-01",
        "lifeMonths": 60,
        "monthlyDeprRate": 16,
        "convention": "HY",
        "bonusPct": 40,
        "costTransferred": 500,
        "transferDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "sourceCompany": "27",
        "destCompany": "27",
        "sourceLocation": "A1",
        "destLocation": "B2"
      }
    },
    {
      "id": "test-partial-inter-5yr-60",
      "name": "Test: Partial Inter-Company 5yr 60% HY (current)",
      "values": {
        "totalCost": 1000,
        "totalAD": 728,
        "bonusAD": 600,
        "placedInService": "2024-06-15",
        "lifeMonths": 60,
        "monthlyDeprRate": 17.07,
        "convention": "HY",
        "bonusPct": 60,
        "costTransferred": 300,
        "transferDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "sourceCompany": "27",
        "destCompany": "2D",
        "sourceLocation": "A1",
        "destLocation": "B2"
      }
    },
    {
      "id": "test-full-intra-bdt-cy",
      "name": "Test: Backdated CY Full Intra-Company 5yr 100% (xfer 1/1/26)",
      "values": {
        "totalCost": 1000,
        "totalAD": 1000,
        "bonusAD": 1000,
        "placedInService": "2026-01-15",
        "lifeMonths": 60,
        "monthlyDeprRate": 0,
        "convention": "HY",
        "bonusPct": 100,
        "costTransferred": 1000,
        "transferDate": "2026-01-01",
        "accountingPeriodDate": "2026-03-31",
        "sourceCompany": "27",
        "destCompany": "27",
        "sourceLocation": "A1",
        "destLocation": "B2"
      }
    },
    {
      "id": "test-partial-inter-bdt-cy",
      "name": "Test: Backdated CY Partial Inter-Company 5yr 40% (xfer 1/15/26)",
      "values": {
        "totalCost": 1000,
        "totalAD": 520,
        "bonusAD": 400,
        "placedInService": "2025-01-01",
        "lifeMonths": 60,
        "monthlyDeprRate": 16,
        "convention": "HY",
        "bonusPct": 40,
        "costTransferred": 500,
        "transferDate": "2026-01-15",
        "accountingPeriodDate": "2026-03-31",
        "sourceCompany": "27",
        "destCompany": "2D",
        "sourceLocation": "A1",
        "destLocation": "B2"
      }
    },
    {
      "id": "test-full-inter-bdt-py",
      "name": "Test: Backdated PY Full Inter-Company 5yr 40% (xfer 6/15/25)",
      "values": {
        "totalCost": 1000,
        "totalAD": 520,
        "bonusAD": 400,
        "placedInService": "2025-01-01",
        "lifeMonths": 60,
        "monthlyDeprRate": 16,
        "convention": "HY",
        "bonusPct": 40,
        "costTransferred": 1000,
        "transferDate": "2025-06-15",
        "accountingPeriodDate": "2026-03-31",
        "sourceCompany": "27",
        "destCompany": "2D",
        "sourceLocation": "A1",
        "destLocation": "B2"
      }
    },
    {
      "id": "test-partial-intra-bdt-py",
      "name": "Test: Backdated PY Partial Intra-Company 5yr 0% (xfer 6/15/25)",
      "values": {
        "totalCost": 1000,
        "totalAD": 300,
        "bonusAD": 0,
        "placedInService": "2025-01-01",
        "lifeMonths": 60,
        "monthlyDeprRate": 16.67,
        "convention": "HY",
        "bonusPct": 0,
        "costTransferred": 400,
        "transferDate": "2025-06-15",
        "accountingPeriodDate": "2026-03-31",
        "sourceCompany": "27",
        "destCompany": "27",
        "sourceLocation": "A1",
        "destLocation": "B2"
      }
    },
    {
      "id": "test-full-inter-ads9-foreign",
      "name": "Test: Full Inter-Company 9yr ADS 0% Foreign to Foreign (current)",
      "values": {
        "totalCost": 1000,
        "totalAD": 167,
        "bonusAD": 0,
        "placedInService": "2025-01-01",
        "lifeMonths": 108,
        "monthlyDeprRate": 9.26,
        "convention": "HY",
        "bonusPct": 0,
        "costTransferred": 1000,
        "transferDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "sourceCompany": "9Z",
        "destCompany": "I7",
        "sourceLocation": "IN1",
        "destLocation": "IN2"
      }
    },
    {
      "id": "test-partial-ads5-bdt-py",
      "name": "Test: Backdated PY Partial 5yr ADS 0% Foreign (xfer 6/15/25)",
      "values": {
        "totalCost": 1000,
        "totalAD": 200,
        "bonusAD": 0,
        "placedInService": "2025-01-01",
        "lifeMonths": 60,
        "monthlyDeprRate": 16.67,
        "convention": "HY",
        "bonusPct": 0,
        "costTransferred": 500,
        "transferDate": "2025-06-15",
        "accountingPeriodDate": "2026-03-31",
        "sourceCompany": "I7",
        "destCompany": "9Z",
        "sourceLocation": "IN1",
        "destLocation": "IN2"
      }
    },
    {
      "id": "test-full-150db-5yr-current",
      "name": "Test: Full Intra-Company 5yr 150%DB 100% (current)",
      "values": {
        "totalCost": 1000,
        "totalAD": 1000,
        "bonusAD": 1000,
        "placedInService": "2026-03-01",
        "lifeMonths": 60,
        "monthlyDeprRate": 0,
        "convention": "HY",
        "bonusPct": 100,
        "costTransferred": 1000,
        "transferDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "sourceCompany": "27",
        "destCompany": "27",
        "sourceLocation": "A1",
        "destLocation": "B2"
      }
    },
    {
      "id": "test-full-39yr-mm-current",
      "name": "Test: Full Inter-Company 39yr MM 0% (current)",
      "values": {
        "totalCost": 1000,
        "totalAD": 25,
        "bonusAD": 0,
        "placedInService": "2025-03-01",
        "lifeMonths": 468,
        "monthlyDeprRate": 2.14,
        "convention": "Mid-Month",
        "bonusPct": 0,
        "costTransferred": 1000,
        "transferDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "sourceCompany": "27",
        "destCompany": "2D",
        "sourceLocation": "A1",
        "destLocation": "B2"
      }
    },
    {
      "id": "test-partial-39yr-mm-bdt-py",
      "name": "Test: Backdated PY Partial 39yr MM 0% (xfer 6/15/25)",
      "values": {
        "totalCost": 1000,
        "totalAD": 20,
        "bonusAD": 0,
        "placedInService": "2025-03-01",
        "lifeMonths": 468,
        "monthlyDeprRate": 2.14,
        "convention": "Mid-Month",
        "bonusPct": 0,
        "costTransferred": 500,
        "transferDate": "2025-06-15",
        "accountingPeriodDate": "2026-03-31",
        "sourceCompany": "27",
        "destCompany": "2D",
        "sourceLocation": "A1",
        "destLocation": "B2"
      }
    },
    {
      "id": "test-round-trip",
      "name": "Test: Round-Trip Transfer (out and back)",
      "values": {
        "totalCost": 7669.57,
        "totalAD": 7669.57,
        "bonusAD": 7663.14,
        "placedInService": "2022-12-26",
        "lifeMonths": 60,
        "monthlyDeprRate": 0,
        "convention": "HY",
        "bonusPct": 100,
        "costTransferred": 7669.57,
        "transferDate": "2026-03-01",
        "accountingPeriodDate": "2026-03-31",
        "sourceCompany": "27",
        "destCompany": "27",
        "sourceLocation": "4D21",
        "destLocation": "1019"
      }
    },
    {
      "id": "test-full-inter-2024-60",
      "name": "Test: Full Inter-Company 2024 PISD 5yr 60% (current)",
      "values": {
        "totalCost": 1000,
        "totalAD": 728,
        "bonusAD": 600,
        "placedInService": "2024-06-15",
        "lifeMonths": 60,
        "monthlyDeprRate": 17.07,
        "convention": "HY",
        "bonusPct": 60,
        "costTransferred": 1000,
        "transferDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31",
        "sourceCompany": "27",
        "destCompany": "I7",
        "sourceLocation": "US1",
        "destLocation": "IN1"
      }
    },
    {
      "id": "test-partial-inter-2024-60-bdt",
      "name": "Test: Backdated PY Partial 2024 5yr 60% (xfer 12/31/25)",
      "values": {
        "totalCost": 1000,
        "totalAD": 728,
        "bonusAD": 600,
        "placedInService": "2024-06-15",
        "lifeMonths": 60,
        "monthlyDeprRate": 17.07,
        "convention": "HY",
        "bonusPct": 60,
        "costTransferred": 500,
        "transferDate": "2025-12-31",
        "accountingPeriodDate": "2026-03-31",
        "sourceCompany": "27",
        "destCompany": "2D",
        "sourceLocation": "A1",
        "destLocation": "B2"
      }
    }
  ],
  "reinstatement": [
    {
      "id": "prod-835003758",
      "name": "Prod: Reinstatement 5yr MACRS HY Elect-Out (835003758)",
      "assetNumber": "835003758",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "originalCost": 15901.28,
        "placedInService": "2021-03-22",
        "lifeMonths": 60,
        "originalDisposalDate": "2026-02-28",
        "originalADAtDisposal": 12721.02,
        "originalGainLoss": 0,
        "convention": "HY (Half-Year)",
        "bonusPct": 0,
        "reinstatementDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "prod-834412263",
      "name": "Prod: Reinstatement 9yr ADS India (834412263)",
      "assetNumber": "834412263",
      "values": {
        "assetType": "Personal Property 9yr SL (ADS)",
        "originalCost": 204912.6,
        "placedInService": "2020-10-12",
        "lifeMonths": 108,
        "originalDisposalDate": "2026-03-29",
        "originalADAtDisposal": 124494.32,
        "originalGainLoss": 0,
        "convention": "HY (Half-Year)",
        "bonusPct": 0,
        "reinstatementDate": "2026-03-30",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-reinst-5yr-100-current",
      "name": "Test: Reinstatement 5yr 200%DB HY 100% (current)",
      "assetNumber": "846100001",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "originalCost": 1000,
        "placedInService": "2026-03-01",
        "lifeMonths": 60,
        "originalDisposalDate": "2026-03-01",
        "originalADAtDisposal": 1000,
        "originalGainLoss": 0,
        "convention": "HY (Half-Year)",
        "bonusPct": 100,
        "reinstatementDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-reinst-5yr-60-current",
      "name": "Test: Reinstatement 5yr 200%DB HY 60% (current, PISD 6/15/24)",
      "assetNumber": "846100002",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "originalCost": 1000,
        "placedInService": "2024-06-15",
        "lifeMonths": 60,
        "originalDisposalDate": "2026-03-01",
        "originalADAtDisposal": 728,
        "originalGainLoss": -272,
        "convention": "HY (Half-Year)",
        "bonusPct": 60,
        "reinstatementDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-reinst-39yr-0-current",
      "name": "Test: Reinstatement 39yr Non-Res Real MM 0% (current)",
      "assetNumber": "846100003",
      "values": {
        "assetType": "Nonresidential Real 39yr SL Mid-Month (GDS)",
        "originalCost": 1000,
        "placedInService": "2025-03-01",
        "lifeMonths": 468,
        "originalDisposalDate": "2026-03-01",
        "originalADAtDisposal": 25,
        "originalGainLoss": -975,
        "convention": "Mid-Month",
        "bonusPct": 0,
        "reinstatementDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-reinst-ads5-0-current",
      "name": "Test: Reinstatement 5yr ADS SL 0% Foreign (current)",
      "assetNumber": "846100004",
      "values": {
        "assetType": "Personal Property 5yr SL (ADS)",
        "originalCost": 1000,
        "placedInService": "2025-01-01",
        "lifeMonths": 60,
        "originalDisposalDate": "2026-03-01",
        "originalADAtDisposal": 300,
        "originalGainLoss": -700,
        "convention": "HY (Half-Year)",
        "bonusPct": 0,
        "reinstatementDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-reinst-5yr-100-bdt-cy",
      "name": "Test: Backdated CY Reinstatement 5yr 100% (disp 1/15/26)",
      "assetNumber": "846100005",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "originalCost": 1000,
        "placedInService": "2026-01-15",
        "lifeMonths": 60,
        "originalDisposalDate": "2026-01-15",
        "originalADAtDisposal": 1000,
        "originalGainLoss": 0,
        "convention": "HY (Half-Year)",
        "bonusPct": 100,
        "reinstatementDate": "2026-01-20",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-reinst-5yr-60-bdt-cy",
      "name": "Test: Backdated CY Reinstatement 5yr 60% (disp 1/15/26)",
      "assetNumber": "846100006",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "originalCost": 1000,
        "placedInService": "2024-06-15",
        "lifeMonths": 60,
        "originalDisposalDate": "2026-01-15",
        "originalADAtDisposal": 728,
        "originalGainLoss": -272,
        "convention": "HY (Half-Year)",
        "bonusPct": 60,
        "reinstatementDate": "2026-01-20",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-reinst-5yr-100-bdt-py",
      "name": "Test: Backdated PY Reinstatement 5yr 100% (disp 6/15/25)",
      "assetNumber": "846100007",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "originalCost": 1000,
        "placedInService": "2025-03-01",
        "lifeMonths": 60,
        "originalDisposalDate": "2025-06-15",
        "originalADAtDisposal": 1000,
        "originalGainLoss": 0,
        "convention": "HY (Half-Year)",
        "bonusPct": 100,
        "reinstatementDate": "2025-07-01",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-reinst-5yr-60-bdt-py",
      "name": "Test: Backdated PY Reinstatement 5yr 60% (PISD 6/15/24, disp 6/15/25)",
      "assetNumber": "846100008",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "originalCost": 1000,
        "placedInService": "2024-06-15",
        "lifeMonths": 60,
        "originalDisposalDate": "2025-06-15",
        "originalADAtDisposal": 728,
        "originalGainLoss": -272,
        "convention": "HY (Half-Year)",
        "bonusPct": 60,
        "reinstatementDate": "2025-07-01",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-reinst-5yr-40-bdt-py",
      "name": "Test: Backdated PY Reinstatement 5yr 40% (PISD 1/1/25, disp 6/15/25)",
      "assetNumber": "846100009",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "originalCost": 1000,
        "placedInService": "2025-01-01",
        "lifeMonths": 60,
        "originalDisposalDate": "2025-06-15",
        "originalADAtDisposal": 520,
        "originalGainLoss": -480,
        "convention": "HY (Half-Year)",
        "bonusPct": 40,
        "reinstatementDate": "2025-07-01",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-reinst-150db5-100-current",
      "name": "Test: Reinstatement 5yr 150%DB HY 100% (current)",
      "assetNumber": "846100010",
      "values": {
        "assetType": "Personal Property 5yr 150% DB (GDS)",
        "originalCost": 1000,
        "placedInService": "2026-03-01",
        "lifeMonths": 60,
        "originalDisposalDate": "2026-03-01",
        "originalADAtDisposal": 1000,
        "originalGainLoss": 0,
        "convention": "HY (Half-Year)",
        "bonusPct": 100,
        "reinstatementDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-reinst-150db5-60-bdt-py",
      "name": "Test: Backdated PY Reinstatement 5yr 150%DB 60% (disp 6/15/25)",
      "assetNumber": "846100011",
      "values": {
        "assetType": "Personal Property 5yr 150% DB (GDS)",
        "originalCost": 1000,
        "placedInService": "2024-06-15",
        "lifeMonths": 60,
        "originalDisposalDate": "2025-06-15",
        "originalADAtDisposal": 660,
        "originalGainLoss": -340,
        "convention": "HY (Half-Year)",
        "bonusPct": 60,
        "reinstatementDate": "2025-07-01",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-reinst-ads9-0-bdt-py",
      "name": "Test: Backdated PY Reinstatement 9yr ADS 0% Foreign (disp 6/15/25)",
      "assetNumber": "846100012",
      "values": {
        "assetType": "Personal Property 9yr SL (ADS)",
        "originalCost": 1000,
        "placedInService": "2025-01-01",
        "lifeMonths": 108,
        "originalDisposalDate": "2025-06-15",
        "originalADAtDisposal": 74,
        "originalGainLoss": -926,
        "convention": "HY (Half-Year)",
        "bonusPct": 0,
        "reinstatementDate": "2025-07-01",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-reinst-ads5-0-bdt-cy",
      "name": "Test: Backdated CY Reinstatement 5yr ADS 0% Foreign (disp 1/15/26)",
      "assetNumber": "846100013",
      "values": {
        "assetType": "Personal Property 5yr SL (ADS)",
        "originalCost": 1000,
        "placedInService": "2025-01-01",
        "lifeMonths": 60,
        "originalDisposalDate": "2026-01-15",
        "originalADAtDisposal": 300,
        "originalGainLoss": -700,
        "convention": "HY (Half-Year)",
        "bonusPct": 0,
        "reinstatementDate": "2026-01-20",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-reinst-39yr-mm-bdt-py",
      "name": "Test: Backdated PY Reinstatement 39yr MM (disp 6/15/25)",
      "assetNumber": "846100014",
      "values": {
        "assetType": "Nonresidential Real 39yr SL Mid-Month (GDS)",
        "originalCost": 1000,
        "placedInService": "2025-03-01",
        "lifeMonths": 468,
        "originalDisposalDate": "2025-06-15",
        "originalADAtDisposal": 20,
        "originalGainLoss": -980,
        "convention": "Mid-Month",
        "bonusPct": 0,
        "reinstatementDate": "2025-07-01",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-reinst-40yr-ads-mm-bdt-py",
      "name": "Test: Backdated PY Reinstatement 40yr ADS MM (disp 6/15/25)",
      "assetNumber": "846100015",
      "values": {
        "assetType": "Nonresidential Real 40yr SL Mid-Month (ADS)",
        "originalCost": 1000,
        "placedInService": "2025-03-01",
        "lifeMonths": 480,
        "originalDisposalDate": "2025-06-15",
        "originalADAtDisposal": 15,
        "originalGainLoss": -985,
        "convention": "Mid-Month",
        "bonusPct": 0,
        "reinstatementDate": "2025-07-01",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-reinst-5yr-gain-reversal",
      "name": "Test: Reinstatement with Gain Reversal (current)",
      "assetNumber": "846100016",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "originalCost": 1000,
        "placedInService": "2023-01-01",
        "lifeMonths": 60,
        "originalDisposalDate": "2026-03-01",
        "originalADAtDisposal": 800,
        "originalGainLoss": 300,
        "convention": "HY (Half-Year)",
        "bonusPct": 0,
        "reinstatementDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-reinst-5yr-loss-reversal",
      "name": "Test: Reinstatement with Loss Reversal (current)",
      "assetNumber": "846100017",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "originalCost": 1000,
        "placedInService": "2024-01-01",
        "lifeMonths": 60,
        "originalDisposalDate": "2026-03-01",
        "originalADAtDisposal": 600,
        "originalGainLoss": -400,
        "convention": "HY (Half-Year)",
        "bonusPct": 60,
        "reinstatementDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-reinst-5yr-mq1-bdt-py",
      "name": "Test: Backdated PY Reinstatement 5yr MQ-Q1 40% (disp 6/15/25)",
      "assetNumber": "846100018",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "originalCost": 1000,
        "placedInService": "2025-02-15",
        "lifeMonths": 60,
        "originalDisposalDate": "2025-06-15",
        "originalADAtDisposal": 610,
        "originalGainLoss": -390,
        "convention": "MQ (Mid-Quarter)",
        "bonusPct": 40,
        "reinstatementDate": "2025-07-01",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-reinst-5yr-mq3-bdt-cy",
      "name": "Test: Backdated CY Reinstatement 5yr MQ-Q3 40% (reinst 1/5/26)",
      "assetNumber": "846100019",
      "values": {
        "assetType": "Personal Property 5yr MACRS 200% DB (GDS)",
        "originalCost": 1000,
        "placedInService": "2025-08-15",
        "lifeMonths": 60,
        "originalDisposalDate": "2025-12-31",
        "originalADAtDisposal": 490,
        "originalGainLoss": -510,
        "convention": "MQ (Mid-Quarter)",
        "bonusPct": 40,
        "reinstatementDate": "2026-01-05",
        "accountingPeriodDate": "2026-03-31"
      }
    }
  ],
  "reclassification": [
    {
      "id": "prod-845600232",
      "name": "Prod: 5yr MACRS HY 0% → 100% Bonus (845600232)",
      "values": {
        "originalCost": 2071.84,
        "existingAD": 0,
        "placedInService": "2025-11-03",
        "oldAssetType": "EQUIP-5YR",
        "oldMethod": "MACRS",
        "oldLifeMonths": 60,
        "oldConvention": "HY",
        "oldBonusPct": 0,
        "newAssetType": "EQUIP-5YR-BONUS",
        "newMethod": "MACRS",
        "newLifeMonths": 60,
        "newConvention": "HY",
        "newBonusPct": 100,
        "effectiveDate": "2025-11-03",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-method-200db-to-sl-current",
      "name": "Test: Method 200%DB → SL (current)",
      "values": {
        "originalCost": 1000,
        "existingAD": 320,
        "placedInService": "2025-03-01",
        "oldAssetType": "GDS-5",
        "oldMethod": "MACRS",
        "oldLifeMonths": 60,
        "oldConvention": "HY",
        "oldBonusPct": 100,
        "newAssetType": "ADS-5",
        "newMethod": "SL",
        "newLifeMonths": 60,
        "newConvention": "HY",
        "newBonusPct": 100,
        "effectiveDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-method-200db-to-sl-bdt-cy",
      "name": "Test: Method 200%DB → SL (backdated CY)",
      "values": {
        "originalCost": 1000,
        "existingAD": 320,
        "placedInService": "2025-03-01",
        "oldAssetType": "GDS-5",
        "oldMethod": "MACRS",
        "oldLifeMonths": 60,
        "oldConvention": "HY",
        "oldBonusPct": 100,
        "newAssetType": "ADS-5",
        "newMethod": "SL",
        "newLifeMonths": 60,
        "newConvention": "HY",
        "newBonusPct": 100,
        "effectiveDate": "2026-01-15",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-method-200db-to-sl-bdt-py",
      "name": "Test: Method 200%DB → SL (backdated PY)",
      "values": {
        "originalCost": 1000,
        "existingAD": 320,
        "placedInService": "2025-03-01",
        "oldAssetType": "GDS-5",
        "oldMethod": "MACRS",
        "oldLifeMonths": 60,
        "oldConvention": "HY",
        "oldBonusPct": 100,
        "newAssetType": "ADS-5",
        "newMethod": "SL",
        "newLifeMonths": 60,
        "newConvention": "HY",
        "newBonusPct": 100,
        "effectiveDate": "2025-06-15",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-method-200db-to-150db-current",
      "name": "Test: Method 200%DB → 150%DB (current)",
      "values": {
        "originalCost": 1000,
        "existingAD": 320,
        "placedInService": "2025-03-01",
        "oldAssetType": "GDS-5",
        "oldMethod": "MACRS",
        "oldLifeMonths": 60,
        "oldConvention": "HY",
        "oldBonusPct": 100,
        "newAssetType": "GDS150-5",
        "newMethod": "MACRS 150DB",
        "newLifeMonths": 60,
        "newConvention": "HY",
        "newBonusPct": 100,
        "effectiveDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-method-150db-to-sl-bdt-py",
      "name": "Test: Method 150%DB → SL (backdated PY)",
      "values": {
        "originalCost": 1000,
        "existingAD": 255,
        "placedInService": "2025-01-01",
        "oldAssetType": "GDS150-5",
        "oldMethod": "MACRS 150DB",
        "oldLifeMonths": 60,
        "oldConvention": "HY",
        "oldBonusPct": 40,
        "newAssetType": "ADS-5",
        "newMethod": "SL",
        "newLifeMonths": 60,
        "newConvention": "HY",
        "newBonusPct": 40,
        "effectiveDate": "2025-06-15",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-method-sl-to-200db-current",
      "name": "Test: Method SL → 200%DB (current)",
      "values": {
        "originalCost": 1000,
        "existingAD": 200,
        "placedInService": "2025-01-01",
        "oldAssetType": "ADS-5",
        "oldMethod": "SL",
        "oldLifeMonths": 60,
        "oldConvention": "HY",
        "oldBonusPct": 40,
        "newAssetType": "GDS-5",
        "newMethod": "MACRS",
        "newLifeMonths": 60,
        "newConvention": "HY",
        "newBonusPct": 40,
        "effectiveDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-method-sl-to-200db-bdt-py",
      "name": "Test: Method SL → 200%DB (backdated PY)",
      "values": {
        "originalCost": 1000,
        "existingAD": 200,
        "placedInService": "2025-01-01",
        "oldAssetType": "ADS-5",
        "oldMethod": "SL",
        "oldLifeMonths": 60,
        "oldConvention": "HY",
        "oldBonusPct": 40,
        "newAssetType": "GDS-5",
        "newMethod": "MACRS",
        "newLifeMonths": 60,
        "newConvention": "HY",
        "newBonusPct": 40,
        "effectiveDate": "2025-06-15",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-life-5yr-to-7yr-current",
      "name": "Test: Life 5yr → 7yr (current)",
      "values": {
        "originalCost": 1000,
        "existingAD": 320,
        "placedInService": "2025-03-01",
        "oldAssetType": "GDS-5",
        "oldMethod": "MACRS",
        "oldLifeMonths": 60,
        "oldConvention": "HY",
        "oldBonusPct": 100,
        "newAssetType": "GDS-7",
        "newMethod": "MACRS",
        "newLifeMonths": 84,
        "newConvention": "HY",
        "newBonusPct": 100,
        "effectiveDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-life-5yr-to-7yr-bdt-py",
      "name": "Test: Life 5yr → 7yr (backdated PY)",
      "values": {
        "originalCost": 1000,
        "existingAD": 320,
        "placedInService": "2025-01-01",
        "oldAssetType": "GDS-5",
        "oldMethod": "MACRS",
        "oldLifeMonths": 60,
        "oldConvention": "HY",
        "oldBonusPct": 40,
        "newAssetType": "GDS-7",
        "newMethod": "MACRS",
        "newLifeMonths": 84,
        "newConvention": "HY",
        "newBonusPct": 40,
        "effectiveDate": "2025-06-15",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-life-5yr-to-10yr-bdt-py",
      "name": "Test: Life 5yr → 10yr (backdated PY)",
      "values": {
        "originalCost": 1000,
        "existingAD": 320,
        "placedInService": "2025-01-01",
        "oldAssetType": "GDS-5",
        "oldMethod": "MACRS",
        "oldLifeMonths": 60,
        "oldConvention": "HY",
        "oldBonusPct": 40,
        "newAssetType": "GDS-10",
        "newMethod": "MACRS",
        "newLifeMonths": 120,
        "newConvention": "HY",
        "newBonusPct": 40,
        "effectiveDate": "2025-06-15",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-life-7yr-to-5yr-current",
      "name": "Test: Life 7yr → 5yr (current)",
      "values": {
        "originalCost": 1000,
        "existingAD": 245,
        "placedInService": "2025-01-01",
        "oldAssetType": "GDS-7",
        "oldMethod": "MACRS",
        "oldLifeMonths": 84,
        "oldConvention": "HY",
        "oldBonusPct": 40,
        "newAssetType": "GDS-5",
        "newMethod": "MACRS",
        "newLifeMonths": 60,
        "newConvention": "HY",
        "newBonusPct": 40,
        "effectiveDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-life-7yr-to-5yr-bdt-py",
      "name": "Test: Life 7yr → 5yr (backdated PY)",
      "values": {
        "originalCost": 1000,
        "existingAD": 245,
        "placedInService": "2025-01-01",
        "oldAssetType": "GDS-7",
        "oldMethod": "MACRS",
        "oldLifeMonths": 84,
        "oldConvention": "HY",
        "oldBonusPct": 40,
        "newAssetType": "GDS-5",
        "newMethod": "MACRS",
        "newLifeMonths": 60,
        "newConvention": "HY",
        "newBonusPct": 40,
        "effectiveDate": "2025-06-15",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-conv-hy-to-mq1-current",
      "name": "Test: Convention HY → MQ-Q1 (current)",
      "values": {
        "originalCost": 1000,
        "existingAD": 320,
        "placedInService": "2025-03-01",
        "oldAssetType": "GDS-5",
        "oldMethod": "MACRS",
        "oldLifeMonths": 60,
        "oldConvention": "HY",
        "oldBonusPct": 100,
        "newAssetType": "GDS-5",
        "newMethod": "MACRS",
        "newLifeMonths": 60,
        "newConvention": "MQ",
        "newBonusPct": 100,
        "effectiveDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-conv-hy-to-mq1-bdt-py",
      "name": "Test: Convention HY → MQ-Q1 (backdated PY)",
      "values": {
        "originalCost": 1000,
        "existingAD": 320,
        "placedInService": "2025-01-01",
        "oldAssetType": "GDS-5",
        "oldMethod": "MACRS",
        "oldLifeMonths": 60,
        "oldConvention": "HY",
        "oldBonusPct": 40,
        "newAssetType": "GDS-5",
        "newMethod": "MACRS",
        "newLifeMonths": 60,
        "newConvention": "MQ",
        "newBonusPct": 40,
        "effectiveDate": "2025-06-15",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-conv-mq1-to-hy-current",
      "name": "Test: Convention MQ-Q1 → HY (current)",
      "values": {
        "originalCost": 1000,
        "existingAD": 350,
        "placedInService": "2025-02-15",
        "oldAssetType": "GDS-5",
        "oldMethod": "MACRS",
        "oldLifeMonths": 60,
        "oldConvention": "MQ",
        "oldBonusPct": 40,
        "newAssetType": "GDS-5",
        "newMethod": "MACRS",
        "newLifeMonths": 60,
        "newConvention": "HY",
        "newBonusPct": 40,
        "effectiveDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-life-39yr-to-31yr-bdt-py",
      "name": "Test: Life 39yr → 31.5yr MM (backdated PY)",
      "values": {
        "originalCost": 1000,
        "existingAD": 20,
        "placedInService": "2025-03-01",
        "oldAssetType": "GDS-39",
        "oldMethod": "MACRS Straight-Line",
        "oldLifeMonths": 468,
        "oldConvention": "Mid-Month",
        "oldBonusPct": 0,
        "newAssetType": "GDS-39",
        "newMethod": "MACRS Straight-Line",
        "newLifeMonths": 378,
        "newConvention": "Mid-Month",
        "newBonusPct": 0,
        "effectiveDate": "2025-06-15",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-bonus-100-to-40-current",
      "name": "Test: Bonus 100% → 40% (current)",
      "values": {
        "originalCost": 1000,
        "existingAD": 1000,
        "placedInService": "2025-03-01",
        "oldAssetType": "GDS-5",
        "oldMethod": "MACRS",
        "oldLifeMonths": 60,
        "oldConvention": "HY",
        "oldBonusPct": 100,
        "newAssetType": "GDS-5",
        "newMethod": "MACRS",
        "newLifeMonths": 60,
        "newConvention": "HY",
        "newBonusPct": 40,
        "effectiveDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-bonus-100-to-40-bdt-py",
      "name": "Test: Bonus 100% → 40% (backdated PY)",
      "values": {
        "originalCost": 1000,
        "existingAD": 1000,
        "placedInService": "2025-03-01",
        "oldAssetType": "GDS-5",
        "oldMethod": "MACRS",
        "oldLifeMonths": 60,
        "oldConvention": "HY",
        "oldBonusPct": 100,
        "newAssetType": "GDS-5",
        "newMethod": "MACRS",
        "newLifeMonths": 60,
        "newConvention": "HY",
        "newBonusPct": 40,
        "effectiveDate": "2025-06-15",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-bonus-0-to-100-current",
      "name": "Test: Bonus 0% → 100% (current)",
      "values": {
        "originalCost": 1000,
        "existingAD": 200,
        "placedInService": "2025-01-01",
        "oldAssetType": "GDS-5",
        "oldMethod": "MACRS",
        "oldLifeMonths": 60,
        "oldConvention": "HY",
        "oldBonusPct": 0,
        "newAssetType": "GDS-5",
        "newMethod": "MACRS",
        "newLifeMonths": 60,
        "newConvention": "HY",
        "newBonusPct": 100,
        "effectiveDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-bonus-0-to-100-bdt-py",
      "name": "Test: Bonus 0% → 100% (backdated PY)",
      "values": {
        "originalCost": 1000,
        "existingAD": 200,
        "placedInService": "2025-01-01",
        "oldAssetType": "GDS-5",
        "oldMethod": "MACRS",
        "oldLifeMonths": 60,
        "oldConvention": "HY",
        "oldBonusPct": 0,
        "newAssetType": "GDS-5",
        "newMethod": "MACRS",
        "newLifeMonths": 60,
        "newConvention": "HY",
        "newBonusPct": 100,
        "effectiveDate": "2025-06-15",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-life-39yr-to-40yr-current",
      "name": "Test: Life 39yr → 40yr MM (current)",
      "values": {
        "originalCost": 1000,
        "existingAD": 25,
        "placedInService": "2025-03-01",
        "oldAssetType": "GDS-39",
        "oldMethod": "MACRS Straight-Line",
        "oldLifeMonths": 468,
        "oldConvention": "Mid-Month",
        "oldBonusPct": 0,
        "newAssetType": "ADS-40",
        "newMethod": "MACRS ADS",
        "newLifeMonths": 480,
        "newConvention": "Mid-Month",
        "newBonusPct": 0,
        "effectiveDate": "2026-03-15",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-life-40yr-to-39yr-bdt-py",
      "name": "Test: Life 40yr → 39yr MM (backdated PY)",
      "values": {
        "originalCost": 1000,
        "existingAD": 20,
        "placedInService": "2025-03-01",
        "oldAssetType": "ADS-40",
        "oldMethod": "MACRS ADS",
        "oldLifeMonths": 480,
        "oldConvention": "Mid-Month",
        "oldBonusPct": 0,
        "newAssetType": "GDS-39",
        "newMethod": "MACRS Straight-Line",
        "newLifeMonths": 378,
        "newConvention": "Mid-Month",
        "newBonusPct": 0,
        "effectiveDate": "2025-06-15",
        "accountingPeriodDate": "2026-03-31"
      }
    },
    {
      "id": "test-combined-method-life-bdt-py",
      "name": "Test: Method+Life 200%DB/5yr → SL/9yr ADS (backdated PY)",
      "values": {
        "originalCost": 1000,
        "existingAD": 320,
        "placedInService": "2025-01-01",
        "oldAssetType": "GDS-5",
        "oldMethod": "MACRS",
        "oldLifeMonths": 60,
        "oldConvention": "HY",
        "oldBonusPct": 40,
        "newAssetType": "ADS-9",
        "newMethod": "MACRS ADS",
        "newLifeMonths": 108,
        "newConvention": "HY",
        "newBonusPct": 0,
        "effectiveDate": "2025-06-15",
        "accountingPeriodDate": "2026-03-31"
      }
    }
  ]
};

// ======================================================
// END: Data Functions
// ======================================================

