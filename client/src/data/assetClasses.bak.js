// ============================================================
// IRS Publication 946 (2025) – Appendix B, Table B-1
// Specific Depreciable Assets Used in All Business Activities, Except As Noted
// ============================================================
// Source: Rev. Proc. 87-56, 1987-2 C.B. 674 (as carried forward in Pub. 946, Appendix B)
// Each entry: { assetClass, class, description, macrsTable, life, convention }
// - assetClass  : IRS asset class number
// - class       : GDS property class (recovery period) driven off the asset class
// - description : Description of assets included in the class
// - macrsTable  : Applicable MACRS percentage table (Appendix A) for GDS/HY depreciation
// - life        : ADR class life, in years
// - convention  : Applicable first-year convention (Half-Year unless the mid-quarter
//                 test under section 168(d)(3) applies, which is determined at the
//                 taxpayer level, not by asset class)

export const ASSET_CLASSES = [
  {
    assetClass: '00.11',
    class: '7-Year',
    description: 'Office Furniture, Fixtures, and Equipment. Includes furniture and fixtures that are not a structural component of a building, such as desks, files, safes, and communications equipment.',
    macrsTable: 'Table A-1',
    life: 10,
    convention: 'Half-Year'
  },
  {
    assetClass: '00.12',
    class: '5-Year',
    description: 'Information Systems: computers and their peripheral equipment used in administering normal business transactions and the maintenance of business records, their retrieval and analysis.',
    macrsTable: 'Table A-1',
    life: 6,
    convention: 'Half-Year'
  },
  {
    assetClass: '00.13',
    class: '5-Year',
    description: 'Data Handling Equipment, except Computers. Includes only typewriters, calculators, adding and accounting machines, copiers, and duplicating equipment.',
    macrsTable: 'Table A-1',
    life: 6,
    convention: 'Half-Year'
  },
  {
    assetClass: '00.21',
    class: '5-Year',
    description: 'Airplanes (airframes and engines), except those used in commercial or contract carrying of passengers or freight, and all helicopters (airframes and engines).',
    macrsTable: 'Table A-1',
    life: 6,
    convention: 'Half-Year'
  },
  {
    assetClass: '00.22',
    class: '5-Year',
    description: 'Automobiles, Taxis.',
    macrsTable: 'Table A-1',
    life: 3,
    convention: 'Half-Year'
  },
  {
    assetClass: '00.23',
    class: '5-Year',
    description: 'Buses.',
    macrsTable: 'Table A-1',
    life: 9,
    convention: 'Half-Year'
  },
  {
    assetClass: '00.241',
    class: '5-Year',
    description: 'Light General Purpose Trucks. Includes trucks for use over the road (actual unloaded weight less than 13,000 pounds).',
    macrsTable: 'Table A-1',
    life: 4,
    convention: 'Half-Year'
  },
  {
    assetClass: '00.242',
    class: '5-Year',
    description: 'Heavy General Purpose Trucks. Includes heavy general purpose trucks, concrete ready-mix trucks, and ore trucks, for use over the road (actual unloaded weight 13,000 pounds or more).',
    macrsTable: 'Table A-1',
    life: 6,
    convention: 'Half-Year'
  },
  {
    assetClass: '00.25',
    class: '7-Year',
    description: 'Railroad Cars and Locomotives, except those owned by railroad transportation companies.',
    macrsTable: 'Table A-1',
    life: 15,
    convention: 'Half-Year'
  },
  {
    assetClass: '00.26',
    class: '3-Year',
    description: 'Tractor Units for Use Over-the-Road.',
    macrsTable: 'Table A-1',
    life: 4,
    convention: 'Half-Year'
  },
  {
    assetClass: '00.27',
    class: '5-Year',
    description: 'Trailers and Trailer-Mounted Containers.',
    macrsTable: 'Table A-1',
    life: 6,
    convention: 'Half-Year'
  },
  {
    assetClass: '00.28',
    class: '10-Year',
    description: 'Vessels, Barges, Tugs, and Similar Water Transportation Equipment, except those used in marine construction.',
    macrsTable: 'Table A-1',
    life: 18,
    convention: 'Half-Year'
  },
  {
    assetClass: '00.3',
    class: '15-Year',
    description: 'Land Improvements. Includes improvements directly to or added to land (sidewalks, roads, canals, waterways, drainage facilities, sewers, wharves and docks, bridges, fences, landscaping shrubbery, or radio/TV transmitting towers), whether section 1245 or 1250 property, provided such improvements are depreciable. Excludes land improvements explicitly included in another class, and buildings/structural components.',
    macrsTable: 'Table A-1',
    life: 20,
    convention: 'Half-Year'
  },
  {
    assetClass: '00.4',
    class: '15-Year',
    description: 'Industrial Steam and Electric Generation and/or Distribution Systems. Includes assets used in the production/distribution of electricity (rated capacity over 500 kW) and/or steam (rated capacity over 12,500 lbs/hour) for use in the taxpayer\u2019s own industrial manufacturing process, not ordinarily available for sale to others.',
    macrsTable: 'Table A-1',
    life: 22,
    convention: 'Half-Year'
  }
]; // end ASSET_CLASSES
