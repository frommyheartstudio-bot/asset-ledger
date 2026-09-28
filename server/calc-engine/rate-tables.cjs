// ======================================================
// File Name : rate-tables.cjs
// Purpose   : Depreciation calc-engine module: rate-tables
// ======================================================


// ======================================================
// START: Calculation Engine Functions
// ======================================================

// ============================================================
// Shared MACRS Rate Tables — IRS Publication 946
// Used by all calculator engines for exact depreciation lookup.
// Source: TRD Appendix 7.2 + Addition Examples spreadsheet
// ============================================================

var RATE_TABLES = (function() {

  // ── Table A-1: MACRS 200% DB, Half-Year Convention ─────────
  var tableA1 = {
    3: [33.33, 44.45, 14.81, 7.41],
    5: [20.00, 32.00, 19.20, 11.52, 11.52, 5.76],
    7: [14.29, 24.49, 17.49, 12.49, 8.93, 8.92, 8.93, 4.46],
    10: [10.00, 18.00, 14.40, 11.52, 9.22, 7.37, 6.55, 6.55, 6.56, 6.55, 3.28],
    15: [5.00, 9.50, 8.55, 7.70, 6.93, 6.23, 5.90, 5.90, 5.91, 5.90, 5.91, 5.90, 5.91, 5.90, 5.91, 2.95],
    20: [3.750, 7.219, 6.677, 6.177, 5.713, 5.285, 4.888, 4.522, 4.462, 4.461, 4.462, 4.461, 4.462, 4.461, 4.462, 4.461, 4.462, 4.461, 4.462, 4.461, 2.231]
  };

  // ── Table A-2: MACRS 200% DB, Mid-Quarter Q1 ───────────────
  var tableA2_Q1 = {
    3: [58.33, 27.78, 12.35, 1.54],
    5: [35.00, 26.00, 15.60, 11.01, 11.01, 1.38],
    7: [25.00, 21.43, 15.31, 10.93, 8.75, 8.74, 8.75, 1.09],
    10: [17.50, 16.50, 13.20, 10.56, 8.45, 6.76, 6.55, 6.55, 6.56, 6.55, 0.82],
    15: [8.75, 9.13, 8.21, 7.39, 6.65, 5.99, 5.90, 5.90, 5.91, 5.90, 5.91, 5.90, 5.91, 5.90, 5.91, 0.74],
    20: [6.563, 7.000, 6.482, 5.996, 5.546, 5.130, 4.746, 4.459, 4.459, 4.459, 4.459, 4.459, 4.459, 4.459, 4.459, 4.460, 4.459, 4.460, 4.459, 4.460, 0.557]
  };

  // ── Table A-3: MACRS 200% DB, Mid-Quarter Q2 ───────────────
  var tableA2_Q2 = {
    3: [41.67, 38.89, 14.14, 5.30],
    5: [25.00, 30.00, 18.00, 11.37, 11.37, 4.26],
    7: [17.85, 23.47, 16.76, 11.97, 8.87, 8.87, 8.87, 3.34],
    10: [12.50, 17.50, 14.00, 11.20, 8.96, 7.17, 6.55, 6.55, 6.56, 6.55, 2.46],
    15: [6.25, 9.38, 8.44, 7.59, 6.83, 6.15, 5.91, 5.90, 5.91, 5.90, 5.91, 5.90, 5.91, 5.90, 5.91, 2.21],
    20: [4.688, 7.148, 6.612, 6.116, 5.658, 5.233, 4.841, 4.478, 4.463, 4.463, 4.463, 4.463, 4.463, 4.462, 4.463, 4.462, 4.463, 4.462, 4.463, 4.462, 1.673]
  };

  // ── Table A-4: MACRS 200% DB, Mid-Quarter Q3 ───────────────
  var tableA2_Q3 = {
    3: [25.00, 50.00, 16.67, 8.33],
    5: [15.00, 34.00, 20.40, 12.24, 11.30, 7.06],
    7: [10.71, 25.51, 18.22, 13.02, 9.30, 8.85, 8.86, 5.53],
    10: [7.50, 18.50, 14.80, 11.84, 9.47, 7.58, 6.55, 6.55, 6.56, 6.55, 4.10],
    15: [3.75, 9.63, 8.66, 7.80, 7.02, 6.31, 5.90, 5.90, 5.91, 5.90, 5.91, 5.90, 5.91, 5.90, 5.91, 3.69],
    20: [2.813, 7.289, 6.742, 6.237, 5.769, 5.336, 4.936, 4.566, 4.460, 4.460, 4.460, 4.460, 4.461, 4.460, 4.461, 4.460, 4.461, 4.460, 4.461, 4.460, 2.788]
  };

  // ── Table A-5: MACRS 200% DB, Mid-Quarter Q4 ───────────────
  var tableA2_Q4 = {
    3: [8.33, 61.11, 20.37, 10.19],
    5: [5.00, 38.00, 22.80, 13.68, 10.94, 9.58],
    7: [3.57, 27.55, 19.68, 14.06, 10.04, 8.73, 8.73, 7.64],
    10: [2.50, 19.50, 15.60, 12.48, 9.98, 7.99, 6.55, 6.55, 6.56, 6.55, 5.74],
    15: [1.25, 9.88, 8.89, 8.00, 7.20, 6.48, 5.90, 5.90, 5.91, 5.90, 5.91, 5.90, 5.91, 5.90, 5.91, 5.17],
    20: [0.938, 7.430, 6.872, 6.357, 5.880, 5.439, 5.031, 4.654, 4.458, 4.458, 4.458, 4.458, 4.458, 4.458, 4.458, 4.458, 4.458, 4.459, 4.458, 4.459, 3.901]
  };

  // ── Table A-14: MACRS 150% DB, Half-Year (State AMT) ───────
  var table150DB_HY = {
    3: [25.00, 37.50, 25.00, 12.50],
    5: [15.00, 25.50, 17.85, 16.66, 16.66, 8.33],
    7: [10.71, 19.13, 15.03, 12.25, 12.25, 12.25, 12.25, 6.13],
    10: [7.50, 13.88, 11.79, 10.02, 8.74, 8.74, 8.74, 8.74, 8.74, 8.74, 4.37],
    15: [5.00, 9.50, 8.55, 7.70, 6.93, 6.23, 5.90, 5.90, 5.91, 5.90, 5.91, 5.90, 5.91, 5.90, 5.91, 2.95],
    20: [3.750, 7.219, 6.677, 6.177, 5.713, 5.285, 4.888, 4.522, 4.462, 4.461, 4.462, 4.461, 4.462, 4.461, 4.462, 4.461, 4.462, 4.461, 4.462, 4.461, 2.231]
  };

  // ── Table A-7a: Nonresidential Real 39-Year, Mid-Month ─────
  // Returns percentage for given year and month placed in service (1-12)
  // Year 1 rate depends on month PIS; Years 2-39 = 2.564%; Year 40 = remainder
  var tableA7a_year1 = {
    1: 2.461, 2: 2.247, 3: 2.033, 4: 1.819, 5: 1.605, 6: 1.391,
    7: 1.177, 8: 0.963, 9: 0.749, 10: 0.535, 11: 0.321, 12: 0.107
  };
  var tableA7a_annual = 2.564; // Years 2 through 39

  // ── Table A-6: Residential Rental 27.5-Year, Mid-Month ─────
  var tableA6_year1 = {
    1: 3.485, 2: 3.182, 3: 2.879, 4: 2.576, 5: 2.273, 6: 1.970,
    7: 1.667, 8: 1.364, 9: 1.061, 10: 0.758, 11: 0.455, 12: 0.152
  };
  var tableA6_annual = 3.636; // Years 2 through 27; Year 28 varies

  // ── ADS Straight-Line, Half-Year Convention ────────────────
  // ADS uses straight-line over ADS recovery period with HY convention
  // Year 1 = (1 / life) × 0.5; Years 2 to N-1 = 1/life; Year N = remainder
  // Rates rounded to 2 decimal places to match IRS Publication 946 / BNA table precision
  // ======================================================
  // Function : adsRate
  // Purpose  : Implements logic for 'adsRate'
  // ======================================================

  function adsRate(lifeYears, year) {
    if (year === 1) return Math.round((100 / lifeYears) * 0.5 * 100) / 100;
    if (year <= lifeYears) return Math.round((100 / lifeYears) * 100) / 100;
    if (year === lifeYears + 1) return Math.round((100 / lifeYears) * 0.5 * 100) / 100; // last half-year
    return 0;
  }

  // ======================================================
  // END: adsRate
  // ======================================================

  // ── Straight-Line, Half-Year Convention ────────────────────
  // ======================================================
  // Function : slHalfYearRate
  // Purpose  : Implements logic for 'slHalfYearRate'
  // ======================================================

  function slHalfYearRate(lifeYears, year) {
    if (year === 1) return (100 / lifeYears) * 0.5;
    if (year <= lifeYears) return 100 / lifeYears;
    if (year === lifeYears + 1) return (100 / lifeYears) * 0.5;
    return 0;
  }

  // ======================================================
  // END: slHalfYearRate
  // ======================================================

  // ── Nonresidential Real Property 40-Year Mid-Month (ADS) ───
  var tableA13a_year1 = {
    1: 2.396, 2: 2.188, 3: 1.979, 4: 1.771, 5: 1.563, 6: 1.354,
    7: 1.146, 8: 0.938, 9: 0.729, 10: 0.521, 11: 0.313, 12: 0.104
  };
  var tableA13a_annual = 2.500; // Years 2 through 40

  // ── ADS Specific Recovery Period Tables (SL, Half-Year) ────
  // These are formula-based: Year 1 = (1/life)/2, Years 2-N = 1/life, Year N+1 = (1/life)/2
  var adsLives = [3, 5, 9, 10, 12, 20, 25]; // supported ADS HY lives

  // ── ADS 30-Year Residential SL Mid-Month ───────────────────
  var adsResidential30_year1 = {
    1: 1.597, 2: 1.458, 3: 1.319, 4: 1.181, 5: 1.042, 6: 0.903,
    7: 0.764, 8: 0.625, 9: 0.486, 10: 0.347, 11: 0.208, 12: 0.069
  };
  var adsResidential30_annual = 3.333; // Years 2 through 30

  // ── ADS 40-Year Nonresidential SL Mid-Month ────────────────
  var adsNonresidential40_year1 = {
    1: 1.198, 2: 1.094, 3: 0.990, 4: 0.885, 5: 0.781, 6: 0.677,
    7: 0.573, 8: 0.469, 9: 0.365, 10: 0.260, 11: 0.156, 12: 0.052
  };
  var adsNonresidential40_annual = 2.500; // Years 2 through 40

  // ── Straight-Line, Full-Month Convention ───────────────────
  // Full month of depreciation in the month placed in service
  // ======================================================
  // Function : slFullMonthRate
  // Purpose  : Implements logic for 'slFullMonthRate'
  // ======================================================

  function slFullMonthRate(lifeMonths, monthsInYear) {
    return (100 / lifeMonths) * monthsInYear;
  }

  // ======================================================
  // END: slFullMonthRate
  // ======================================================

  // Full-Month convention: Year 1 gets full months from PIS month through Dec
  // ======================================================
  // Function : fullMonthYear1Rate
  // Purpose  : Implements logic for 'fullMonthYear1Rate'
  // ======================================================

  function fullMonthYear1Rate(lifeYears, monthPIS) {
    var monthlyRate = 100 / (lifeYears * 12);
    var monthsInYear1 = 12 - monthPIS + 1; // includes PIS month
    return monthlyRate * monthsInYear1;
  }

  // ======================================================
  // END: fullMonthYear1Rate
  // ======================================================

  // ── Straight-Line (No Bonus) — Generic ─────────────────────
  // Simple straight-line with half-year convention (same as SL HY)
  // Year 1 = (1/life) × 50%, Years 2-N = 1/life, Year N+1 = remainder
  // Already handled by slHalfYearRate function

  // ── Lookup Function ────────────────────────────────────────
  // Returns the annual depreciation percentage for a given year
  // based on method, life, convention, and placement details.
  // ======================================================
  // Function : lookupRate
  // Purpose  : Implements logic for 'lookupRate'
  // ======================================================

  function lookupRate(params) {
    var method = params.method;         // 'MACRS', 'MACRS ADS', 'SL', 'MACRS 150DB'
    var lifeYears = params.lifeYears;   // e.g., 5, 7, 39
    var convention = params.convention; // 'HY', 'MQ', 'Mid-Month', 'Full-Month'
    var year = params.year;             // depreciation year (1-based)
    var quarter = params.quarter || 1;  // quarter placed in service (for MQ)
    var monthPIS = params.monthPIS || 1; // month placed in service (for Mid-Month)

    // MACRS 200% DB with Half-Year
    if ((method === 'MACRS' || method === 'MACRS 200DB') && convention === 'HY') {
      if (tableA1[lifeYears] && year <= tableA1[lifeYears].length) {
        return tableA1[lifeYears][year - 1];
      }
    }

    // MACRS 200% DB with Mid-Quarter
    if ((method === 'MACRS' || method === 'MACRS 200DB') && convention === 'MQ') {
      var mqTable;
      if (quarter === 1) mqTable = tableA2_Q1;
      else if (quarter === 2) mqTable = tableA2_Q2;
      else if (quarter === 3) mqTable = tableA2_Q3;
      else mqTable = tableA2_Q4;
      if (mqTable[lifeYears] && year <= mqTable[lifeYears].length) {
        return mqTable[lifeYears][year - 1];
      }
    }

    // MACRS 150% DB with Half-Year (State AMT)
    if (method === 'MACRS 150DB' && convention === 'HY') {
      if (table150DB_HY[lifeYears] && year <= table150DB_HY[lifeYears].length) {
        return table150DB_HY[lifeYears][year - 1];
      }
    }

    // Nonresidential Real Property 39-Year Mid-Month (Table A-7a)
    if (method === 'MACRS Straight-Line' && convention === 'Mid-Month' && lifeYears === 39) {
      if (year === 1) return tableA7a_year1[monthPIS] || 0;
      if (year >= 2 && year <= 39) return tableA7a_annual;
      if (year === 40) {
        // Remainder to reach 100%
        var taken = (tableA7a_year1[monthPIS] || 0) + tableA7a_annual * 38;
        return Math.max(0, 100 - taken);
      }
      return 0;
    }

    // Residential Rental 27.5-Year Mid-Month (Table A-6)
    if (method === 'MACRS Straight-Line' && convention === 'Mid-Month' && (lifeYears === 27 || lifeYears === 28)) {
      if (year === 1) return tableA6_year1[monthPIS] || 0;
      if (year >= 2 && year <= 27) return tableA6_annual;
      if (year === 28) {
        var taken6 = (tableA6_year1[monthPIS] || 0) + tableA6_annual * 26;
        return Math.max(0, 100 - taken6);
      }
      return 0;
    }

    // ADS Straight-Line Half-Year
    if (method === 'MACRS ADS' && (convention === 'HY' || convention === 'Half-Year')) {
      return adsRate(lifeYears, year);
    }

    // Nonresidential Real Property 40-Year Mid-Month (ADS Table A-13a)
    if (method === 'MACRS ADS' && convention === 'Mid-Month' && lifeYears === 40) {
      if (year === 1) return tableA13a_year1[monthPIS] || 0;
      if (year >= 2 && year <= 40) return tableA13a_annual;
      if (year === 41) {
        var taken40 = (tableA13a_year1[monthPIS] || 0) + tableA13a_annual * 39;
        return Math.max(0, 100 - taken40);
      }
      return 0;
    }

    // ADS 30-Year Residential SL Mid-Month
    if (method === 'MACRS ADS' && convention === 'Mid-Month' && lifeYears === 30) {
      if (year === 1) return adsResidential30_year1[monthPIS] || 0;
      if (year >= 2 && year <= 30) return adsResidential30_annual;
      if (year === 31) {
        var taken30 = (adsResidential30_year1[monthPIS] || 0) + adsResidential30_annual * 29;
        return Math.max(0, 100 - taken30);
      }
      return 0;
    }

    // Straight-Line with Full-Month Convention
    if (convention === 'Full-Month' || convention === 'FM') {
      if (year === 1) return fullMonthYear1Rate(lifeYears, monthPIS);
      var annualRate = 100 / lifeYears;
      if (year >= 2 && year <= lifeYears) return annualRate;
      if (year === lifeYears + 1) {
        // Last year: remainder (months not covered in year 1)
        var monthsInYear1 = 12 - monthPIS + 1;
        var monthlyR = 100 / (lifeYears * 12);
        return monthlyR * (12 - monthsInYear1);
      }
      return 0;
    }

    // Generic Straight-Line Half-Year
    if (method === 'SL' && convention === 'HY') {
      return slHalfYearRate(lifeYears, year);
    }

    // Fallback: straight-line
    if (lifeYears > 0) {
      return 100 / lifeYears;
    }
    return 0;
  }

  // ======================================================
  // END: lookupRate
  // ======================================================

  // ── Monthly Rate from Annual Table ─────────────────────────
  // Given cost, method, life, convention, PISD, and target date,
  // returns the monthly depreciation amount for that period.
  // ======================================================
  // Function : getMonthlyDepr
  // Purpose  : Retrieves data related to 'getMonthlyDepr'
  // ======================================================

  function getMonthlyDepr(params) {
    var cost = params.cost;
    var bonusPercent = params.bonusPercent || 0;
    var basis = cost * (1 - bonusPercent / 100); // depreciable basis after bonus
    var lifeYears = params.lifeYears;
    var method = params.method;
    var convention = params.convention;
    var pisdMonth = params.pisdMonth || 1;
    var pisdYear = params.pisdYear;
    var targetYear = params.targetYear;
    var targetMonth = params.targetMonth;

    // Determine which depreciation year we're in
    var deprYear = targetYear - pisdYear + 1;
    if (deprYear < 1) return 0;

    // Get the annual rate for this depreciation year
    var annualRate = lookupRate({
      method: method,
      lifeYears: lifeYears,
      convention: convention,
      year: deprYear,
      quarter: Math.ceil(pisdMonth / 3),
      monthPIS: pisdMonth
    });

    // Annual depreciation amount
    var annualDepr = basis * (annualRate / 100);

    // Monthly = annual / 12
    return annualDepr / 12;
  }

  // ======================================================
  // END: getMonthlyDepr
  // ======================================================

  // ── Cumulative Depreciation Through a Date ─────────────────
  // Calculates total regular depreciation from PISD through target date
  // ======================================================
  // Function : getCumulativeDepr
  // Purpose  : Retrieves data related to 'getCumulativeDepr'
  // ======================================================

  function getCumulativeDepr(params) {
    var cost = params.cost;
    var bonusPercent = params.bonusPercent || 0;
    var basis = cost * (1 - bonusPercent / 100);
    var lifeYears = params.lifeYears;
    var method = params.method;
    var convention = params.convention;
    var pisdMonth = params.pisdMonth || 1;
    var pisdYear = params.pisdYear;
    var targetYear = params.targetYear;
    var targetMonth = params.targetMonth;

    var totalDepr = 0;
    var maxDeprYear = lifeYears + 1; // +1 for half-year last year

    for (var dy = 1; dy <= maxDeprYear; dy++) {
      var calendarYear = pisdYear + dy - 1;
      if (calendarYear > targetYear) break;

      var annualRate = lookupRate({
        method: method,
        lifeYears: lifeYears,
        convention: convention,
        year: dy,
        quarter: Math.ceil(pisdMonth / 3),
        monthPIS: pisdMonth
      });

      var annualDepr = basis * (annualRate / 100);

      if (calendarYear === targetYear) {
        // Partial year — count months through target month
        if (calendarYear === pisdYear) {
          // PIS year: count from PISD month through target month
          // Mid-Month convention: half month in PIS month
          if (convention === 'Mid-Month') {
            var monthsFromPISD = targetMonth - pisdMonth + 0.5; // half month in PIS month + full months after
            if (monthsFromPISD < 0.5) monthsFromPISD = 0.5;
            // Year 1 annual rate covers (12 - pisdMonth + 0.5) months worth
            var year1Months = 12 - pisdMonth + 0.5;
            totalDepr += annualDepr * (monthsFromPISD / year1Months);
          } else {
            // HY/MQ: Year 1 rate already has convention. If target is same year as PISD,
            // prorate by months from PISD through target vs full year
            var monthsFromStart = targetMonth - pisdMonth + 1;
            if (monthsFromStart <= 0) monthsFromStart = 1;
            var totalMonthsInYear = 12 - pisdMonth + 1;
            totalDepr += annualDepr * (monthsFromStart / totalMonthsInYear);
          }
        } else {
          // Not PIS year — prorate full year by months through target
          var monthsInThisYear = targetMonth;
          totalDepr += annualDepr * (monthsInThisYear / 12);
        }
      } else {
        totalDepr += annualDepr;
      }
    }

    // Cap at basis (handle negative costs correctly)
    if (basis >= 0) {
      if (totalDepr > basis) totalDepr = basis;
    } else {
      if (totalDepr < basis) totalDepr = basis;
    }
    return totalDepr;
  }

  // ======================================================
  // END: getCumulativeDepr
  // ======================================================

  // ── Public API ─────────────────────────────────────────────
  return {
    lookupRate: lookupRate,
    getMonthlyDepr: getMonthlyDepr,
    getCumulativeDepr: getCumulativeDepr,
    // Expose raw tables for display/debugging
    tables: {
      'A1_HY_200DB': tableA1,
      'A2_MQ_Q1_200DB': tableA2_Q1,
      'A3_MQ_Q2_200DB': tableA2_Q2,
      'A4_MQ_Q3_200DB': tableA2_Q3,
      'A5_MQ_Q4_200DB': tableA2_Q4,
      'A14_150DB_HY': table150DB_HY,
      'A7a_39yr_MM': { year1: tableA7a_year1, annual: tableA7a_annual },
      'A6_27yr_MM': { year1: tableA6_year1, annual: tableA6_annual },
      'A13a_40yr_MM': { year1: tableA13a_year1, annual: tableA13a_annual },
      'ADS_30yr_Residential_MM': { year1: adsResidential30_year1, annual: adsResidential30_annual },
      'ADS_40yr_Nonresidential_MM': { year1: adsNonresidential40_year1, annual: adsNonresidential40_annual },
      'ADS_HY_lives': adsLives
    }
  };
})();

// ---- appended for Node/CommonJS use (server-side reuse of the browser calculator) ----
module.exports = RATE_TABLES;

// ======================================================
// END: Calculation Engine Functions
// ======================================================

