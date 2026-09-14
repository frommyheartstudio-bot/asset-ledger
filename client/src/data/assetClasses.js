// ============================================================
// IRS Publication 946 (2025) – Appendix B, Tables B-1 and B-2
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
  },
]; // end ASSET_CLASSES

// IRS Publication 946 (2025), Appendix B, Table B-2 (Depreciable Assets Used
// in the Following Activities) — kept as a separate array from Table B-1
// above so the two tables never get interleaved again. Previously this file
// had Table B-2's classes (21.0 onward) mixed into ASSET_CLASSES (Table B-1)
// as blank "See IRS Table B-2" stub rows, several bogus asset-class codes
// (00.1, 11.5, 26.5, 16.5, 10.5, 13.5 — OCR artifacts, not real IRS codes)
// mixed in, and this array only covered 01.1–20.5. That has been fixed:
// ASSET_CLASSES = Table B-1 only (00.11–00.4); this array = all of Table B-2
// (01.1–80.0). NOTE: figures for 48.11–48.45 and 49.11–49.25 (telephone and
// electric/gas utility classes) were reconstructed from a scanned copy of
// Pub. 946 and should be spot-checked against the official PDF before
// relying on them for filing.
export const ASSET_CLASSES_B2 = [
  { assetClass: '01.1', description: 'Agriculture: machinery and equipment, grain bins, and fences (no other land improvements), used in the production of crops, plants, vines and trees; livestock; farm dairies, nurseries, greenhouses, sod farms, mushroom cellars, cranberry bogs, apiaries, and fur farms; and agriculture, animal husbandry, and horticultural services.', classLife: 10, gds: 7, ads: 10 },
  { assetClass: '01.11', description: 'Cotton Ginning Assets.', classLife: 12, gds: 7, ads: 12 },
  { assetClass: '01.21', description: 'Cattle, Breeding or Dairy.', classLife: 7, gds: 5, ads: 7 },
  { assetClass: '01.221', description: 'Any breeding or work horse that is 12 years old or less at the time it is placed in service.', classLife: 10, gds: 7, ads: 10 },
  { assetClass: '01.222', description: 'Any breeding or work horse that is more than 12 years old at the time it is placed in service.', classLife: 10, gds: 3, ads: 10 },
  { assetClass: '01.223', description: 'Any race horse that is more than 2 years old at the time it is placed in service. No class life is assigned to this class.', classLife: null, gds: 3, ads: 12 },
  { assetClass: '01.224', description: 'Any horse that is more than 12 years old at the time it is placed in service and that is neither a race horse nor a horse described in class 01.222. No class life is assigned to this class.', classLife: null, gds: 3, ads: 12 },
  { assetClass: '01.225', description: 'Any horse not described in class 01.221, 01.222, 01.223, or 01.224. No class life is assigned to this class.', classLife: null, gds: 7, ads: 12 },
  { assetClass: '01.23', description: 'Hogs, Breeding.', classLife: 3, gds: 3, ads: 3 },
  { assetClass: '01.24', description: 'Sheep and Goats, Breeding.', classLife: 5, gds: 5, ads: 5 },
  { assetClass: '01.3', description: 'Farm buildings except structures included in class 01.4.', classLife: 25, gds: 20, ads: 25 },
  { assetClass: '01.4', description: 'Single purpose agricultural or horticultural structures (within the meaning of section 168(i)(13) of the Code).', classLife: 15, gds: 10, ads: 15 },
  { assetClass: '10.0', description: 'Mining: mining and quarrying of metallic and nonmetallic minerals (including sand, gravel, stone, and clay) and the milling, beneficiation, and other primary preparation of such materials.', classLife: 10, gds: 7, ads: 10 },
  { assetClass: '13.0', description: 'Offshore Drilling: floating, self-propelled and other drilling vessels, barges, platforms, and drilling equipment and support vessels such as tenders, barges, towboats, and crewboats. Excludes oil and gas production assets.', classLife: 7.5, gds: 5, ads: 7.5 },
  { assetClass: '13.1', description: 'Drilling of Oil and Gas Wells: onshore drilling, geophysical and other exploration services, and oil and gas field services such as chemical treatment, plugging and abandoning of wells, and cementing or perforating well casings.', classLife: 6, gds: 5, ads: 6 },
  { assetClass: '13.2', description: 'Exploration for and Production of Petroleum and Natural Gas Deposits: drilling of wells and production of petroleum and natural gas, including gathering pipelines, related storage facilities, and first onshore transshipment facilities. Does not include support vessels.', classLife: 14, gds: 7, ads: 14 },
  { assetClass: '13.3', description: 'Petroleum Refining: distillation, fractionation, and catalytic cracking of crude petroleum into gasoline and its other components.', classLife: 16, gds: 10, ads: 16 },
  { assetClass: '15.0', description: 'Construction: general building, special trade, heavy, and marine construction contractors; operative and investment builders; real estate subdividers and developers; and others except railroads.', classLife: 6, gds: 5, ads: 6 },
  { assetClass: '20.1', description: 'Manufacture of Grain and Grain Mill Products: flours, cereals, livestock feeds, and other grain and grain mill products.', classLife: 17, gds: 10, ads: 17 },
  { assetClass: '20.2', description: 'Manufacture of Sugar and Sugar Products: raw sugar, syrup, or finished sugar from sugar cane or sugar beets.', classLife: 18, gds: 10, ads: 18 },
  { assetClass: '20.3', description: 'Manufacture of Vegetable Oils and Vegetable Oil Products: oil from vegetable materials and related vegetable oil products.', classLife: 18, gds: 10, ads: 18 },
  { assetClass: '20.4', description: 'Manufacture of Other Food and Kindred Products not included in classes 20.1, 20.2, and 20.3.', classLife: 12, gds: 7, ads: 12 },
  { assetClass: '20.5', description: 'Manufacture of Food and Beverages—Special Handling Devices: returnable pallets, palletized containers, and fish processing equipment (boxes, baskets, carts, flaking trays) used in classes 20.1–20.4. Excludes general purpose small tools and general purpose materials handling equipment.', classLife: 4, gds: 3, ads: 4 },
  { assetClass: '21.0', description: 'Manufacture of Tobacco and Tobacco Products: cigarettes, cigars, smoking and chewing tobacco, snuff, and other tobacco products.', classLife: 15, gds: 7, ads: 15 },
  { assetClass: '22.1', description: 'Manufacture of Knitted Goods: knitted and netted fabrics and lace.', classLife: 7.5, gds: 5, ads: 7.5 },
  { assetClass: '22.2', description: 'Manufacture of Yarn, Thread, and Woven Fabric: spun yarns, threads, woven fabric, tire fabric, braided fabric, cordage, and related textile mill products.', classLife: 11, gds: 7, ads: 11 },
  { assetClass: '22.3', description: 'Manufacture of Carpets and Dyeing, Finishing, and Packaging of Textile Products and Manufacture of Medical and Dental Supplies.', classLife: 9, gds: 5, ads: 9 },
  { assetClass: '22.4', description: 'Manufacture of Textile Yarns: processing of yarns to impart bulk and/or stretch properties.', classLife: 8, gds: 5, ads: 8 },
  { assetClass: '22.5', description: 'Manufacture of Nonwoven Fabrics: nonwoven fabrics and felt goods from new materials and textile mill waste.', classLife: 10, gds: 7, ads: 10 },
  { assetClass: '23.0', description: 'Manufacture of Apparel and Other Finished Products: clothing and fabricated textile products by cutting and sewing woven fabrics, other textile products, and furs (excludes rubber and leather apparel).', classLife: 9, gds: 5, ads: 9 },
  { assetClass: '24.1', description: 'Cutting of Timber: logging machinery and equipment and roadbuilding equipment used by logging and sawmill operators and pulp manufacturers for their own account.', classLife: 6, gds: 5, ads: 6 },
  { assetClass: '24.2', description: 'Sawing of Dimensional Stock From Logs: machinery and equipment installed in permanent or well-established sawmills.', classLife: 10, gds: 7, ads: 10 },
  { assetClass: '24.3', description: 'Sawing of Dimensional Stock From Logs: machinery and equipment in sawmills with temporary foundations and minimal lumberhandling, drying, and residue disposal equipment.', classLife: 6, gds: 5, ads: 6 },
  { assetClass: '24.4', description: 'Manufacture of Wood Products, and Furniture: plywood, hardboard, flooring, veneers, furniture, and other wood products, including treatment of poles and timber.', classLife: 10, gds: 7, ads: 10 },
  { assetClass: '26.1', description: 'Manufacture of Pulp and Paper: pulp materials handling and storage, pulp mill processing, bleach processing, paper and paperboard manufacturing, and on-line finishing. Includes pollution control assets and related land improvements. Does not include pulpwood logging or hardboard manufacture.', classLife: 13, gds: 7, ads: 13 },
  { assetClass: '26.2', description: 'Manufacture of Converted Paper, Paperboard, and Pulp Products: modification or remanufacture of paper and pulp into converted products such as coated paper, bags, boxes, cartons, and envelopes.', classLife: 10, gds: 7, ads: 10 },
  { assetClass: '27.0', description: 'Printing, Publishing, and Allied Industries: letterpress, lithography, gravure, or screen printing; bookbinding, typesetting, engraving, photo-engraving, electrotyping; and publication of newspapers, books, and periodicals.', classLife: 11, gds: 7, ads: 11 },
  { assetClass: '28.0', description: 'Manufacture of Chemicals and Allied Products: basic organic and inorganic chemicals, synthetic fibers and plastics materials, finished chemical products, and photographic supplies. Includes related land improvements. Does not include finished rubber/plastic products or natural gas byproducts.', classLife: 9.5, gds: 5, ads: 9.5 },
  { assetClass: '30.1', description: 'Manufacture of Rubber Products: tires, tubes, rubber footwear, mechanical rubber goods, flooring, and rubber sundries; recapping, retreading, and rebuilding of tires.', classLife: 14, gds: 7, ads: 14 },
  { assetClass: '30.11', description: 'Manufacture of Rubber Products—Special Tools: jigs, dies, mandrels, molds, lasts, patterns, specialty containers, pallets, shells, tire molds, and accessory parts used in class 30.1.', classLife: 4, gds: 3, ads: 4 },
  { assetClass: '30.2', description: 'Manufacture of Finished Plastic Products: plastics products and molding of primary plastics for the trade. Does not include basic plastics materials or phonograph records.', classLife: 11, gds: 7, ads: 11 },
  { assetClass: '30.21', description: 'Manufacture of Finished Plastic Products—Special Tools: jigs, dies, fixtures, molds, patterns, gauges, and specialty transfer/shipping devices used in class 30.2.', classLife: 3.5, gds: 3, ads: 3.5 },
  { assetClass: '31.0', description: 'Manufacture of Leather and Leather Products: tanning, currying, and finishing of hides and skins; processing of fur pelts; finished leather products such as footwear, belting, apparel, and luggage.', classLife: 11, gds: 7, ads: 11 },
  { assetClass: '32.1', description: 'Manufacture of Glass Products: flat, blown, or pressed glass products such as float and window glass, glass containers, glassware, and fiberglass. Does not include manufacture of lenses.', classLife: 14, gds: 7, ads: 14 },
  { assetClass: '32.11', description: 'Manufacture of Glass Products—Special Tools: molds, patterns, pallets, and specialty transfer/shipping devices used in class 32.1.', classLife: 2.5, gds: 3, ads: 2.5 },
  { assetClass: '32.2', description: 'Manufacture of Cement. Does not include manufacture of concrete/concrete products or mining/extraction.', classLife: 20, gds: 15, ads: 20 },
  { assetClass: '32.3', description: 'Manufacture of Other Stone and Clay Products: products from clay and stone (brick, tile, pipe), pottery (vitreous-china, plumbing fixtures, earthenware, ceramic insulating materials), and concrete/concrete products. Does not include mining/extraction.', classLife: 15, gds: 7, ads: 15 },
  { assetClass: '33.2', description: 'Manufacture of Primary Nonferrous Metals: smelting, refining, and electrolysis of nonferrous metals from ore, pig, or scrap; rolling, drawing, alloying; castings, forgings, nails, spikes, structural shapes, tubing, wire, and cable.', classLife: 14, gds: 7, ads: 14 },
  { assetClass: '33.21', description: 'Manufacture of Primary Nonferrous Metals—Special Tools: dies, jigs, molds, patterns, fixtures, gauges, and drawings used in class 33.2. Rolls, mandrels, and refractories are included in 33.2, not this class.', classLife: 6.5, gds: 5, ads: 6.5 },
  { assetClass: '33.3', description: 'Manufacture of Foundry Products: casting of iron and steel, molding and coremaking, finishing of castings, patternmaking at the foundry, special tools, and related land improvements.', classLife: 14, gds: 7, ads: 14 },
  { assetClass: '33.4', description: 'Manufacture of Primary Steel Mill Products: smelting, reduction, refining of iron and steel from ore, pig, or scrap; rolling, drawing, alloying; steel service centers, ferrous metal forges, coke production, related land improvements and special tools.', classLife: 15, gds: 7, ads: 15 },
  { assetClass: '34.0', description: 'Manufacture of Fabricated Metal Products: metal cans, tinware, fabricated structural metal products, metal stampings, and other ferrous/nonferrous metal and wire products not elsewhere classified. Does not include non-electric heating apparatus.', classLife: 12, gds: 7, ads: 12 },
  { assetClass: '34.01', description: 'Manufacture of Fabricated Metal Products—Special Tools: dies, jigs, molds, patterns, fixtures, gauges, returnable containers, and drawings used in class 34.0.', classLife: 3, gds: 3, ads: 3 },
  { assetClass: '35.0', description: 'Manufacture of Electrical and Non-Electrical Machinery and Other Mechanical Products: finished machinery and equipment (machine tools, industrial machinery, power generation/transmission/distribution systems, HVAC, appliances, farm/construction/mining/oilfield machinery, engines, turbines, batteries, lighting, instruments, watches, medical/dental equipment, ophthalmic goods, etc.).', classLife: 10, gds: 7, ads: 10 },
  { assetClass: '36.0', description: 'Manufacture of Electronic Components, Products, and Systems: electronic communication, computation, instrumentation, and control systems; transmitters/receivers, switching stations, cameras, recorders, computers, and related components (tubes, capacitors, coils, resistors, PCBs, switches, cables, lasers, fiber optics, magnetic media). Does not include semiconductor manufacturing equipment (class 36.1).', classLife: 6, gds: 5, ads: 6 },
  { assetClass: '36.1', description: 'Any Semiconductor Manufacturing Equipment.', classLife: 5, gds: 5, ads: 5 },
  { assetClass: '37.11', description: 'Manufacture of Motor Vehicles: manufacture and assembly of finished automobiles, trucks, trailers, motor homes, and buses, plus incidental manufacturing activities (parts/subassemblies) that make up 75% or more of a facility\u2019s value toward finished-vehicle assembly.', classLife: 12, gds: 7, ads: 12 },
  { assetClass: '37.12', description: 'Manufacture of Motor Vehicles—Special Tools: jigs, dies, fixtures, molds, patterns, gauges, and specialty transfer/shipping devices owned by finished-motor-vehicle manufacturers, used in class 37.11.', classLife: 3, gds: 3, ads: 3 },
  { assetClass: '37.2', description: 'Manufacture of Aerospace Products: manufacture and assembly of airborne vehicles and component parts including hydraulic, pneumatic, electrical, and mechanical systems. Does not include electronic airborne detection, guidance, control, computation, test, navigation, or communication equipment.', classLife: 10, gds: 7, ads: 10 },
  { assetClass: '37.31', description: 'Ship and Boat Building Machinery and Equipment: manufacture and repair of ships, boats, caissons, marine drilling rigs, and special fabrications. Excludes buildings and structural components.', classLife: 12, gds: 7, ads: 12 },
  { assetClass: '37.32', description: 'Ship and Boat Building Dry Docks and Land Improvements: floating and fixed dry docks, ship basins, graving docks, shipways, piers, and related land improvements (water, sewer, electric systems). Excludes buildings and structural components.', classLife: 16, gds: 10, ads: 16 },
  { assetClass: '37.33', description: 'Ship and Boat Building—Special Tools: dies, jigs, molds, patterns, fixtures, gauges, and drawings used in classes 37.31 and 37.32.', classLife: 6.5, gds: 5, ads: 6.5 },
  { assetClass: '37.41', description: 'Manufacture of Locomotives: building or rebuilding railroad locomotives (including mining and industrial locomotives). Does not include assets of railroad transportation companies or component-only manufacturers.', classLife: 11.5, gds: 7, ads: 11.5 },
  { assetClass: '37.42', description: 'Manufacture of Railroad Cars: building or rebuilding railroad freight or passenger cars (including rail transit cars). Does not include assets of railroad transportation companies or component-only manufacturers.', classLife: 12, gds: 7, ads: 12 },
  { assetClass: '39.0', description: 'Manufacture of Athletic, Jewelry, and Other Goods: jewelry, musical instruments, toys and sporting goods, motion picture/television films and tapes, pens, pencils, office and art supplies, brooms, brushes, caskets, etc.', classLife: 12, gds: 7, ads: 12 },
  { assetClass: '40.1', description: 'Railroad Machinery and Equipment: freight-handling machinery, TOFC/COFC terminal equipment, communication systems, signals and interlockers, roadway machines, shop machinery, locomotives, freight/passenger train cars, and work equipment (ICC accounts).', classLife: 14, gds: 7, ads: 14 },
  { assetClass: '40.2', description: 'Railroad Structures and Similar Improvements: bridges, trestles, culverts, elevated structures, fences, snowsheds, signs, station/office buildings, roadway buildings, water/fuel stations, shops, enginehouses, TOFC/COFC terminals, power transmission systems, and related structures (ICC accounts).', classLife: 30, gds: 20, ads: 30 },
  { assetClass: '40.3', description: 'Railroad Wharves and Docks: wharves and docks, coal and ore wharves (ICC accounts).', classLife: 20, gds: 15, ads: 20 },
  { assetClass: '40.4', description: 'Railroad Track.', classLife: 10, gds: 7, ads: 10 },
  { assetClass: '40.51', description: 'Railroad Hydraulic Electric Generating Equipment.', classLife: 50, gds: 20, ads: 50 },
  { assetClass: '40.52', description: 'Railroad Nuclear Electric Generating Equipment.', classLife: 20, gds: 15, ads: 20 },
  { assetClass: '40.53', description: 'Railroad Steam Electric Generating Equipment.', classLife: 28, gds: 20, ads: 28 },
  { assetClass: '40.54', description: 'Railroad Steam, Compressed Air, and Other Power Plant Equipment.', classLife: 28, gds: 20, ads: 28 },
  { assetClass: '41.0', description: 'Motor Transport—Passengers: urban and interurban commercial and contract carrying of passengers by road (excludes vehicles covered under class 00.2x).', classLife: 8, gds: 5, ads: 8 },
  { assetClass: '42.0', description: 'Motor Transport—Freight: commercial and contract carrying of freight by road (excludes vehicles covered under class 00.2x).', classLife: 8, gds: 5, ads: 8 },
  { assetClass: '44.0', description: 'Water Transportation: commercial and contract carrying of freight and passengers by water (excludes vessels covered under class 00.2x). Includes related land improvements.', classLife: 20, gds: 15, ads: 20 },
  { assetClass: '45.0', description: 'Air Transport (except helicopters): commercial and contract carrying of passengers and freight by air.', classLife: 12, gds: 7, ads: 12 },
  { assetClass: '45.1', description: 'Air Transport (restricted): assets described in class 45.0 held on April 15, 1976, or acquired under a binding contract in effect on that date and thereafter.', classLife: 22, gds: 15, ads: 22 },
  { assetClass: '46.0', description: 'Pipeline Transportation: private, commercial, and contract carrying of petroleum, gas, and other products by pipes and conveyors, including trunk lines and related storage of integrated petroleum/natural gas producers.', classLife: 6, gds: 5, ads: 6 },
  { assetClass: '48.11', description: 'Telephone Central Office Buildings: assets intended to house central office equipment (FCC Part 31 Account No. 212), whether section 1245 or section 1250 property.', classLife: 45, gds: 20, ads: 45 },
  { assetClass: '48.12', description: 'Telephone Central Office Equipment: central office switching and related equipment (FCC Part 31 Account No. 221). Does not include computer-based central office switching equipment (class 48.121) or PBX equipment.', classLife: 18, gds: 10, ads: 18 },
  { assetClass: '48.121', description: 'Computer-Based Telephone Central Office Switching Equipment: equipment functioning as a computer or peripheral equipment used as telephone central office equipment. Does not include PBX equipment.', classLife: 9.5, gds: 5, ads: 9.5 },
  { assetClass: '48.13', description: 'Telephone Station Equipment: teletypewriters, telephones, booths, private exchanges, and comparable equipment (FCC Part 31 Account Nos. 231, 232, 234). Qualified technological equipment within this class is assigned a 5-year GDS recovery period.', classLife: 10, gds: 7, ads: 10 },
  { assetClass: '48.14', description: 'Telephone Distribution Plant: pole lines, cable, aerial wire, underground conduits, and comparable equipment and related land improvements (FCC Part 31 Account Nos. 241, 242.1–242.4, 243, 244).', classLife: 24, gds: 15, ads: 24 },
  { assetClass: '48.2', description: 'Radio and Television Broadcasting: assets used in radio and television broadcasting, except transmitting towers.', classLife: 6, gds: 5, ads: 6 },
  { assetClass: '48.31', description: 'Telegraph, Ocean Cable, and Satellite Communications (TOCSC): communications-related assets used to provide domestic and international radio-telegraph, wire-telegraph, ocean-cable, and satellite communications services; includes related land improvements.', classLife: 19, gds: 10, ads: 19 },
  { assetClass: '48.32', description: 'TOCSC—Electric Power Generating and Distribution Systems: generation, modulation, rectification, channelization, control, and distribution of electric power. Does not include assets installed on customers\u2019 premises.', classLife: 13, gds: 7, ads: 13 },
  { assetClass: '48.33', description: 'TOCSC—High Frequency Radio and Microwave Systems: transmitters, receivers, antenna supporting structures, antennas, transmission lines to antenna, cooling systems, and control/amplification equipment. Does not include cable and long-line systems.', classLife: 26.5, gds: 20, ads: 26.5 },
  { assetClass: '48.34', description: 'TOCSC—Cable and Long-Line Systems: transmission lines, pole lines, ocean cables, buried cable and conduit, repeaters, repeater stations, and related assets. Does not include high frequency radio or microwave systems.', classLife: 16.5, gds: 10, ads: 16.5 },
  { assetClass: '48.35', description: 'TOCSC—Central Office Control Equipment: general control, switching, and monitoring of communications signals, including electromechanical switching/channeling apparatus, multiplexing, patching/monitoring, in-house cabling, teleprinter equipment, and site improvements.', classLife: 10.5, gds: 7, ads: 10.5 },
  { assetClass: '48.36', description: 'TOCSC—Computerized Switching, Channeling, and Associated Control Equipment: central office switching computers, interfacing computers, other specialized control equipment, and site improvements.', classLife: 10, gds: 7, ads: 10 },
  { assetClass: '48.37', description: 'TOCSC—Satellite Ground Segment Property: fixed earth station equipment, antennas, satellite communications equipment, and interface equipment. Does not include general purpose equipment or satellite space segment property.', classLife: 8, gds: 5, ads: 8 },
  { assetClass: '48.38', description: 'TOCSC—Satellite Space Segment Property: satellites and equipment for telemetry, tracking, control, and monitoring used in satellite communications.', classLife: 10, gds: 7, ads: 10 },
  { assetClass: '48.39', description: 'TOCSC—Equipment Installed on Customer\u2019s Premises: computers, terminal equipment, power generation/distribution systems, private switching centers, teleprinters, facsimile equipment, and related equipment.', classLife: 13.5, gds: 7, ads: 13.5 },
  { assetClass: '48.41', description: 'Cable Television (CATV)—Headend: towers, antennas, preamplifiers, converters, modulation equipment, and program non-duplication systems. Does not include headend buildings or program origination assets.', classLife: 11, gds: 7, ads: 11 },
  { assetClass: '48.42', description: 'CATV—Subscriber Connection and Distribution Systems: trunk and feeder cable, connecting hardware, amplifiers, power equipment, passive devices, directional taps, pedestals, pressure taps, drop cables, matching transformers, multiple set connector equipment, and converters.', classLife: 10, gds: 7, ads: 10 },
  { assetClass: '48.43', description: 'CATV—Program Origination: cameras, film chains, videotape recorders, lighting, and remote location equipment, excluding vehicles. Does not include buildings and structural components.', classLife: 9, gds: 5, ads: 9 },
  { assetClass: '48.44', description: 'CATV—Service and Test: oscilloscopes, field strength meters, spectrum analyzers, and cable testing equipment; excludes vehicles.', classLife: 8.5, gds: 5, ads: 8.5 },
  { assetClass: '48.45', description: 'CATV—Microwave Systems: towers, antennas, transmitting and receiving equipment, and broad band microwave assets used in cable television service. Does not include assets used in common carrier services.', classLife: 9.5, gds: 5, ads: 9.5 },
  { assetClass: '49.11', description: 'Electric Utility Hydraulic Production Plant: hydraulic power production of electricity for sale, including related land improvements (dams, flumes, canals, waterways).', classLife: 50, gds: 20, ads: 50 },
  { assetClass: '49.12', description: 'Electric Utility Nuclear Production Plant: nuclear power production of electricity for sale and related land improvements. Does not include nuclear fuel assemblies (class 49.121).', classLife: 20, gds: 15, ads: 20 },
  { assetClass: '49.121', description: 'Electric Utility Nuclear Fuel Assemblies: initial core and replacement core nuclear fuel assemblies used in a boiling water, pressurized water, or high temperature gas reactor for electricity production. Does not include breeder reactor fuel assemblies.', classLife: 5, gds: 5, ads: 5 },
  { assetClass: '49.13', description: 'Electric Utility Steam Production Plant: steam power production of electricity for sale, combustion turbines operated in combined cycle with a conventional steam unit, and related land improvements.', classLife: 28, gds: 20, ads: 28 },
  { assetClass: '49.14', description: 'Electric Utility Transmission and Distribution Plant: transmission and distribution of electricity for sale and related land improvements (excludes initial clearing/grading land improvements per Rev. Rul. 72-403).', classLife: 30, gds: 20, ads: 30 },
  { assetClass: '49.15', description: 'Electric Utility Combustion Turbine Production Plant: electricity production for sale using jet engines, combustion turbines, diesel/gasoline/internal combustion engines, associated generators, and related land improvements. Does not include combustion turbines in combined cycle with a conventional steam unit.', classLife: 20, gds: 15, ads: 20 },
  { assetClass: '49.21', description: 'Gas Utility Distribution Facilities: includes gas water heaters and gas conversion equipment installed by the utility on customers\u2019 premises on a rental basis.', classLife: 35, gds: 20, ads: 35 },
  { assetClass: '49.221', description: 'Gas Utility Manufactured Gas Production Plants: manufacture of gas not completely interchangeable with domestic natural gas. Does not include waste-reduction/resource-recovery gas systems.', classLife: 30, gds: 20, ads: 30 },
  { assetClass: '49.222', description: 'Gas Utility Substitute Natural Gas (SNG) Production Plant (naphtha or lighter hydrocarbon feedstocks): catalytic conversion of feedstocks to a gaseous fuel completely interchangeable with domestic natural gas.', classLife: 14, gds: 7, ads: 14 },
  { assetClass: '49.223', description: 'Substitute Natural Gas—Coal Gasification: manufacture and production of pipeline-quality gas from coal using the Lurgi process with advanced methanation, including related utility assets used in the taxpayer\u2019s own gasification plant and coal mining site processes.', classLife: 18, gds: 10, ads: 18 },
  { assetClass: '49.23', description: 'Natural Gas Production Plant.', classLife: 22, gds: 15, ads: 22 },
  { assetClass: '49.24', description: 'Gas Utility Trunk Pipelines and Related Storage Facilities (excludes initial clearing/grading land improvements per Rev. Rul. 72-403).', classLife: 22, gds: 15, ads: 22 },
  { assetClass: '49.25', description: 'Liquefied Natural Gas Plant: liquefaction, storage, and regasification of natural gas including loading/unloading connections, instrumentation, pumps, vaporizers, odorizers, tanks, related land improvements, pipeline interconnections, and marine terminal facilities.', classLife: 14, gds: 7, ads: 14 },
  { assetClass: '49.3', description: 'Water Utilities: gathering, treatment, and commercial distribution of water.', classLife: 50, gds: 20, ads: 50 },
  { assetClass: '49.4', description: 'Central Steam Utility Production and Distribution: production and distribution of steam for sale. Does not include waste reduction/resource recovery plant assets.', classLife: 28, gds: 20, ads: 28 },
  { assetClass: '49.5', description: 'Waste Reduction and Resource Recovery Plants: conversion of refuse, solid waste, or biomass to heat or to a solid/liquid/gaseous fuel, plus related material recovery, handling, and other utility/land-improvement assets at the site.', classLife: 10, gds: 7, ads: 10 },
  { assetClass: '50.0', description: 'Municipal Wastewater Treatment Plant.', classLife: 24, gds: 15, ads: 24 },
  { assetClass: '51.0', description: 'Municipal Sewers. Use the straight line method over 25 years if placed in service after June 12, 1996 (unless placed in service under a binding contract in effect before June 10, 1996).', classLife: 50, gds: 20, ads: 50 },
  { assetClass: '57.0', description: 'Distributive Trades and Services: wholesale and retail trade, and personal and professional services. Includes section 1245 assets used in marketing petroleum and petroleum products. High technology medical equipment within this class is assigned a 5-year GDS recovery period.', classLife: 9, gds: 5, ads: 9 },
  { assetClass: '57.1', description: 'Distributive Trades and Services—Billboard, Service Station Buildings, and Petroleum Marketing Land Improvements: section 1250 assets used in marketing petroleum and petroleum products (excludes petroleum/natural gas trunk pipeline facilities). Includes car wash buildings and related land improvements, and billboards (section 1245 or 1250 property).', classLife: 20, gds: 15, ads: 20 },
  { assetClass: '79.0', description: 'Recreation: entertainment services provided for a fee or admission charge, such as bowling alleys, billiard and pool establishments, theaters, concert halls, and miniature golf courses. Does not include amusement/theme parks or specialized structures such as golf courses, sports stadia, race tracks, or ski slopes.', classLife: 10, gds: 7, ads: 10 },
  { assetClass: '80.0', description: 'Theme and Amusement Parks: rides, attractions, and amusements permanently situated on park land and open to the public for an admission price, plus related appurtenances, structures, and land improvements provided exclusively for park patrons. Excludes transportation equipment, administrative-service assets, warehouses, administration buildings, hotels, and motels.', classLife: 12.5, gds: 7, ads: 12.5 }
]; // end ASSET_CLASSES_B2

// ============================================================
// Single source of truth for every "Asset Class" picker in the app
// (Asset Register filter, Add/Edit Asset form, Lifecycle "Addition"
// form, etc.). Combines the codes from Table B-1 and Table B-2 above
// so the same numbers show up everywhere. If a code's meaning isn't
// obvious, look it up on the Configuration → Asset Classes page.
// ============================================================
export const ASSET_CLASS_CODES = Array.from(new Set([
  ...ASSET_CLASSES.map((r) => r.assetClass),
  ...ASSET_CLASSES_B2.map((r) => r.assetClass)
])).sort((a, b) => parseFloat(a) - parseFloat(b) || a.localeCompare(b));
