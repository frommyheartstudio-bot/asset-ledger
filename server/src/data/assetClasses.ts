// ======================================================
// File Name : assetClasses.ts
// Purpose   : Seed rows for the asset_classes table (Configuration ->
//             Asset Classes page). Inserted into Postgres once, on
//             first request, if the table is empty (see
//             db/repo.ts:seedAssetClassesIfEmpty). After that, Postgres
//             is the source of truth and this array is not read again.
//             Order matters here — it's preserved via each row's index
//             becoming its sortOrder column in the DB.
// ======================================================

// ======================================================
// START: Seed Data
// ======================================================

export interface AssetClassSeedRow {
  name: string;
  propertyType: string;
  method: string;
  ratePct: string;
  convention: string;
  life: string;
  /** Bonus % filled into the Addition form when this class is picked ("" = none stored). */
  bonusPct?: string;
}

export const ASSET_CLASS_SEED: AssetClassSeedRow[] = [
  { name: "00.11", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "7 years 0 months" },
  { name: "00.11 - ADS", propertyType: "PP - Personal Property", method: "AD - MACRS ADS", ratePct: "100", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "10 years 0 months" },
  { name: "00.11 - PRE TCJA", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "7 years 0 months" },
  { name: "00.11 - WBC", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "7 years 0 months" },
  { name: "00.12", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "5 years 0 months" },
  { name: "00.12 - ADS", propertyType: "PP - Personal Property", method: "AD - MACRS ADS", ratePct: "100", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "5 years 0 months" },
  { name: "00.12 - PRE TCJA", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "5 years 0 months" },
  { name: "00.12 - WBC", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "5 years 0 months" },
  { name: "00.13", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "5 years 0 months" },
  { name: "00.13 - ADS", propertyType: "PP - Personal Property", method: "AD - MACRS ADS", ratePct: "100", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "6 years 0 months" },
  { name: "00.22", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "5 years 0 months" },
  { name: "00.22 - ADS", propertyType: "PP - Personal Property", method: "AD - MACRS ADS", ratePct: "100", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "5 years 0 months" },
  { name: "00.241", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "5 years 0 months" },
  { name: "00.241 - ADS", propertyType: "PP - Personal Property", method: "AD - MACRS ADS", ratePct: "100", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "5 years 0 months" },
  { name: "00.241 - WBC", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "5 years 0 months" },
  { name: "00.242", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "5 years 0 months" },
  { name: "00.242 - ADS", propertyType: "PP - Personal Property", method: "AD - MACRS ADS", ratePct: "100", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "6 years 0 months" },
  { name: "00.242 - WBC", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "5 years 0 months" },
  { name: "00.25", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "7 years 0 months" },
  { name: "00.25 - ADS", propertyType: "PP - Personal Property", method: "AD - MACRS ADS", ratePct: "100", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "15 years 0 months" },
  { name: "00.27", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "5 years 0 months" },
  { name: "00.27 - ADS", propertyType: "PP - Personal Property", method: "AD - MACRS ADS", ratePct: "100", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "6 years 0 months" },
  { name: "00.27 - WBC", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "5 years 0 months" },
  { name: "00.3", propertyType: "RP - Real Property", method: "MC - MACRS", ratePct: "150", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "15 years 0 months" },
  { name: "00.3 - ADS", propertyType: "RP - Real Property", method: "AD - MACRS ADS", ratePct: "100", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "20 years 0 months" },
  { name: "00.3 - PRE TCJA", propertyType: "RP - Real Property", method: "MC - MACRS", ratePct: "150", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "15 years 0 months" },
  { name: "00.3 - WBC", propertyType: "RP - Real Property", method: "MC - MACRS", ratePct: "150", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "15 years 0 months" },
  { name: "1250", propertyType: "NR - Non-Residential Real", method: "MS - MACRS Straight Line", ratePct: "100", convention: "MM - Mid-Month", life: "39 years 0 months" },
  { name: "1250 - ADS", propertyType: "NR - Non-Residential Real", method: "AD - MACRS ADS", ratePct: "100", convention: "MM - Mid-Month", life: "40 years 0 months" },
  { name: "20.4", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "7 years 0 months" },
  { name: "20.5", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "3 years 0 months" },
  { name: "27", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "7 years 0 months" },
  { name: "27.0 - ADS", propertyType: "PP - Personal Property", method: "AD - MACRS ADS", ratePct: "100", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "11 years 0 months" },
  { name: "31.5", propertyType: "NR - Non-Residential Real", method: "MS - MACRS Straight Line", ratePct: "100", convention: "MM - Mid-Month", life: "31 years 6 months" },
  { name: "36", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "5 years 0 months" },
  { name: "36.0 - ADS", propertyType: "PP - Personal Property", method: "AD - MACRS ADS", ratePct: "100", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "6 years 0 months" },
  { name: "45", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "7 years 0 months" },
  { name: "45.0 - ADS", propertyType: "PP - Personal Property", method: "AD - MACRS ADS", ratePct: "100", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "12 years 0 months" },
  { name: "45.0 - WBC", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "7 years 0 months" },
  { name: "48.37", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "5 years 0 months" },
  { name: "48.37 - ADS", propertyType: "PP - Personal Property", method: "AD - MACRS ADS", ratePct: "100", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "8 years 0 months" },
  { name: "48.42", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "7 years 0 months" },
  { name: "48.42 - ADS", propertyType: "PP - Personal Property", method: "AD - MACRS ADS", ratePct: "100", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "10 years 0 months" },
  { name: "57", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "5 years 0 months" },
  { name: "57.0 - ADS", propertyType: "PP - Personal Property", method: "AD - MACRS ADS", ratePct: "100", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "9 years 0 months" },
  { name: "57.0 - PRE TCJA", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "5 years 0 months" },
  { name: "57.0 - WBC", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "5 years 0 months" },
  { name: "79", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "7 years 0 months" },
  { name: "79.0 - ADS", propertyType: "PP - Personal Property", method: "AD - MACRS ADS", ratePct: "100", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "10 years 0 months" },
  { name: "Acquisition", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "0 years 0 months" },
  { name: "Alternative Energy Property", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "5 years 0 months" },
  { name: "Alternative Energy Property - ADS", propertyType: "PP - Personal Property", method: "AD - MACRS ADS", ratePct: "100", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "12 years 0 months" },
  { name: "Alternative Energy Property - WBC", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "5 years 0 months" },
  { name: "Automobile", propertyType: "AL - Listed - Auto", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "5 years 0 months" },
  { name: "Book Only", propertyType: "ND - Non-Depreciable Property", method: "NO - No Depreciation", ratePct: "N/A", convention: "N/A", life: "0 years 0 months" },
  { name: "Book Only - ADS", propertyType: "ND - Non-Depreciable Property", method: "NO - No Depreciation", ratePct: "N/A", convention: "N/A", life: "0 years 0 months" },
  { name: "Book Only - No Expense", propertyType: "ND - Non-Depreciable Property", method: "NO - No Depreciation", ratePct: "N/A", convention: "N/A", life: "0 years 0 months" },
  { name: "Clean Fuel Luxury Vehicle", propertyType: "CF - Clean Fuel Luxury Vehicle", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "5 years 0 months" },
  { name: "Commercial Property - 15-Year", propertyType: "LI - Leasehold Improvements - 15-Yr. Property", method: "MS - MACRS Straight Line", ratePct: "100", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "15 years 0 months" },
  { name: "Commercial Property - NY Liberty Zone", propertyType: "CY - Commercial Property - NY LZ", method: "MS - MACRS Straight Line", ratePct: "100", convention: "MM - Mid-Month", life: "39 years 0 months" },
  { name: "Conversion", propertyType: "ND - Non-Depreciable Property", method: "NO - No Depreciation", ratePct: "N/A", convention: "N/A", life: "0 years 0 months" },
  { name: "Expense", propertyType: "PP - Personal Property", method: "SL - Straight Line", ratePct: "100", convention: "FM - Full-Month", life: "0 years 1 month" },
  { name: "Furniture & Fixtures", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "7 years 0 months" },
  { name: "Goodwill (including FASB142)", propertyType: "AM - Amortizable", method: "SL - Straight Line", ratePct: "100", convention: "FM - Full-Month", life: "15 years 0 months" },
  { name: "Indian Nonresidential Real", propertyType: "IN - Indian Nonresidential Real", method: "MS - MACRS Straight Line", ratePct: "100", convention: "MM - Mid-Month", life: "22 years 0 months" },
  { name: "Indian Personal", propertyType: "IP - Indian Reserv. - Personal", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "3 years 0 months" },
  { name: "Indian Real", propertyType: "IR - Indian Reserv. - Real", method: "MC - MACRS", ratePct: "150", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "9 years 0 months" },
  { name: "INT-00.11", propertyType: "PP - Personal Property", method: "AD - MACRS ADS", ratePct: "100", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "10 years 0 months" },
  { name: "INT-00.12", propertyType: "PP - Personal Property", method: "AD - MACRS ADS", ratePct: "100", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "5 years 0 months" },
  { name: "INT-RP39", propertyType: "NR - Non-Residential Real", method: "AD - MACRS ADS", ratePct: "100", convention: "MM - Mid-Month", life: "40 years 0 months" },
  { name: "INT-Software", propertyType: "PP - Personal Property", method: "SL - Straight Line", ratePct: "100", convention: "FM - Full-Month", life: "3 years 0 months" },
  { name: "Intangible - SS", propertyType: "AM - Amortizable", method: "SL - Straight Line", ratePct: "100", convention: "FM - Full-Month", life: "10 years 0 months" },
  { name: "Intangibles", propertyType: "AM - Amortizable", method: "SL - Straight Line", ratePct: "100", convention: "FM - Full-Month", life: "0 years 0 months" },
  { name: "Intangibles - Other", propertyType: "AM - Amortizable", method: "SL - Straight Line", ratePct: "100", convention: "FM - Full-Month", life: "15 years 0 months" },
  { name: "Kuiper Manufacturing", propertyType: "PP - Personal Property", method: "SL - Straight Line", ratePct: "100", convention: "FM - Full-Month", life: "10 years 0 months" },
  { name: "Kuiper Manufacturing - ADS", propertyType: "PP - Personal Property", method: "AD - MACRS ADS", ratePct: "100", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "10 years 0 months" },
  { name: "Land", propertyType: "LR - Realty - Land", method: "NO - No Depreciation", ratePct: "N/A", convention: "N/A", life: "0 years 0 months" },
  { name: "Land - ADS", propertyType: "LR - Realty - Land", method: "NO - No Depreciation", ratePct: "N/A", convention: "N/A", life: "0 years 0 months" },
  { name: "Land - Tax Only", propertyType: "LR - Realty - Land", method: "NO - No Depreciation", ratePct: "N/A", convention: "N/A", life: "0 years 0 months" },
  { name: "Land - Tax Only - ADS", propertyType: "LR - Realty - Land", method: "NO - No Depreciation", ratePct: "N/A", convention: "N/A", life: "0 years 0 months" },
  { name: "Leasehold Improvements", propertyType: "NR - Non-Residential Real", method: "MS - MACRS Straight Line", ratePct: "100", convention: "MM - Mid-Month", life: "39 years 0 months" },
  { name: "Leasehold Improvements - NY Liberty Zone", propertyType: "LY - Leasehold Improvement - NY LZ", method: "MS - MACRS Straight Line", ratePct: "100", convention: "MM - Mid-Month", life: "5 years 0 months" },
  { name: "Luxury Trucks & Vans", propertyType: "TL - Luxury Trucks & Vans", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "5 years 0 months" },
  { name: "Office Equipment", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "7 years 0 months" },
  { name: "On Tops", propertyType: "PP - Personal Property", method: "SL - Straight Line", ratePct: "100", convention: "FM - Full-Month", life: "0 years 1 month" },
  { name: "OnTop - No Expense", propertyType: "PP - Personal Property", method: "NC - No Calculation", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "0 years 0 months" },
  { name: "QIP", propertyType: "LI - Leasehold Improvements - 15-Yr. Property", method: "MS - MACRS Straight Line", ratePct: "100", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "15 years 0 months" },
  { name: "QIP - 39", propertyType: "NR - Non-Residential Real", method: "MS - MACRS Straight Line", ratePct: "100", convention: "MM - Mid-Month", life: "39 years 0 months" },
  { name: "QIP - ADS", propertyType: "LI - Leasehold Improvements - 15-Yr. Property", method: "SL - Straight Line", ratePct: "100", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "20 years 0 months" },
  { name: "QIP - PRE TCJA", propertyType: "NR - Non-Residential Real", method: "MS - MACRS Straight Line", ratePct: "100", convention: "MM - Mid-Month", life: "39 years 0 months" },
  { name: "QIP - WBC", propertyType: "LI - Leasehold Improvements - 15-Yr. Property", method: "MS - MACRS Straight Line", ratePct: "100", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "15 years 0 months" },
  { name: "QLHI", propertyType: "LI - Leasehold Improvements - 15-Yr. Property", method: "SL - Straight Line", ratePct: "100", convention: "FM - Full-Month", life: "15 years 0 months" },
  { name: "Qualified Improvement Property - 15-yr Property", propertyType: "LI - Leasehold Improvements - 15-Yr. Property", method: "MS - MACRS Straight Line", ratePct: "100", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "15 years 0 months" },
  { name: "Qualified Production Property", propertyType: "QP - Qualified Production Property", method: "MS - MACRS Straight Line", ratePct: "100", convention: "MM - Mid-Month", life: "39 years 0 months" },
  { name: "Research & Development - Domestic", propertyType: "AM - Amortizable", method: "SL - Straight Line", ratePct: "100", convention: "HY - Half-Year", life: "5 years 0 months" },
  { name: "Research & Development - Foreign", propertyType: "AM - Amortizable", method: "SL - Straight Line", ratePct: "100", convention: "HY - Half-Year", life: "15 years 0 months" },
  { name: "Residential Rental Property - ADS Life 30", propertyType: "RR - Residential Real", method: "MS - MACRS Straight Line", ratePct: "100", convention: "MM - Mid-Month", life: "27 years 6 months" },
  { name: "Residential Rental Property - ADS Life 40", propertyType: "RR - Residential Real", method: "MS - MACRS Straight Line", ratePct: "100", convention: "MM - Mid-Month", life: "27 years 6 months" },
  { name: "Residential Rental Property - NY Liberty Zone", propertyType: "RY - Residential Rental Property - NY LZ", method: "MS - MACRS Straight Line", ratePct: "100", convention: "MM - Mid-Month", life: "27 years 6 months" },
  { name: "Sec-59e", propertyType: "PP - Personal Property", method: "SL - Straight Line", ratePct: "100", convention: "FM - Full-Month", life: "10 years 0 months" },
  { name: "Service Agreement", propertyType: "AM - Amortizable", method: "SL - Straight Line", ratePct: "100", convention: "FM - Full-Month", life: "10 years 0 months" },
  { name: "Software", propertyType: "PP - Personal Property", method: "SL - Straight Line", ratePct: "100", convention: "FM - Full-Month", life: "3 years 0 months" },
  { name: "Software - ADS", propertyType: "PP - Personal Property", method: "AD - MACRS ADS", ratePct: "100", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "3 years 0 months" },
  { name: "Software - WBC", propertyType: "PP - Personal Property", method: "SL - Straight Line", ratePct: "100", convention: "FM - Full-Month", life: "3 years 0 months" },
  { name: "Sports Utility Vehicles", propertyType: "SV - Sport Utility Vehicles", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "5 years 0 months" },
  { name: "Subsea Cable", propertyType: "PP - Personal Property", method: "SL - Straight Line", ratePct: "100", convention: "FM - Full-Month", life: "25 years 0 months" },
  { name: "Subsea Cable - ADS", propertyType: "PP - Personal Property", method: "SL - Straight Line", ratePct: "100", convention: "FM - Full-Month", life: "25 years 0 months" },
  { name: "Supplies", propertyType: "PP - Personal Property", method: "SL - Straight Line", ratePct: "100", convention: "FM - Full-Month", life: "0 years 1 month" },
  { name: "Supplies - ADS", propertyType: "PP - Personal Property", method: "SL - Straight Line", ratePct: "100", convention: "FM - Full-Month", life: "0 years 1 month" },
  { name: "Truck", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "5 years 0 months" },
  { name: "U15YR No Bonus", propertyType: "PP - Personal Property", method: "SL - Straight Line", ratePct: "100", convention: "FM - Full-Month", life: "15 years 0 months" },
  { name: "Unspecified - Personal", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "7 years 0 months" },
  { name: "Unspecified - Real", propertyType: "NR - Non-Residential Real", method: "MS - MACRS Straight Line", ratePct: "100", convention: "MM - Mid-Month", life: "39 years 0 months" },
  { name: "US-00.11", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "7 years 0 months" },
  { name: "US-00.11 No Bonus", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "7 years 0 months" },
  { name: "US-00.12", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "5 years 0 months" },
  { name: "US-00.12 No Bonus", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "5 years 0 months" },
  { name: "US-00.241", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "5 years 0 months" },
  { name: "US-00.241 No Bonus", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "5 years 0 months" },
  { name: "US-00.3", propertyType: "RP - Real Property", method: "MC - MACRS", ratePct: "150", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "15 years 0 months" },
  { name: "US-00.3 No Bonus", propertyType: "RP - Real Property", method: "MC - MACRS", ratePct: "150", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "15 years 0 months" },
  { name: "US-23.0", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "5 years 0 months" },
  { name: "US-24.1", propertyType: "PP - Personal Property", method: "MC - MACRS", ratePct: "200", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "5 years 0 months" },
  { name: "US-Intangibles-15", propertyType: "AM - Amortizable", method: "SL - Straight Line", ratePct: "100", convention: "FM - Full-Month", life: "15 years 0 months" },
  { name: "US-QLHI", propertyType: "LI - Leasehold Improvements - 15-Yr. Property", method: "MS - MACRS Straight Line", ratePct: "100", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "15 years 0 months" },
  { name: "US-QLHI No Bonus", propertyType: "NR - Non-Residential Real", method: "MS - MACRS Straight Line", ratePct: "100", convention: "AHY - Apply Mid-Quarter test (use HY)", life: "15 years 0 months" },
  { name: "US-RP31.5", propertyType: "NR - Non-Residential Real", method: "MS - MACRS Straight Line", ratePct: "100", convention: "MM - Mid-Month", life: "31 years 6 months" },
  { name: "US-RP39", propertyType: "NR - Non-Residential Real", method: "MS - MACRS Straight Line", ratePct: "100", convention: "MM - Mid-Month", life: "39 years 0 months" },
  { name: "US-Software", propertyType: "PP - Personal Property", method: "SL - Straight Line", ratePct: "100", convention: "FM - Full-Month", life: "3 years 0 months" },
  { name: "US-Software No Bonus", propertyType: "PP - Personal Property", method: "SL - Straight Line", ratePct: "100", convention: "FM - Full-Month", life: "3 years 0 months" },
  { name: "Utility Owned Substation", propertyType: "PP - Personal Property", method: "SL - Straight Line", ratePct: "100", convention: "FM - Full-Month", life: "10 years 0 months" },
];

// ======================================================
// END: Seed Data
// ======================================================

// ======================================================
// END OF FILE : assetClasses.ts
// ======================================================
