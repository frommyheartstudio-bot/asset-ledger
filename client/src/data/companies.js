// ======================================================
// File Name : companies.js
// Purpose   : Single source of truth for Company code -> full legal
//             entity name, for any "Company" picker in the app
//             (currently: Scenario Modeling's filter bar). Assets
//             themselves only store the short code (see assets.company
//             in server/src/data/assets.ts) — this is purely a display
//             mapping so a picker can show the full name instead of a
//             bare code. An unmapped code falls back to itself so a new
//             company added to the asset data never breaks the picker.
// ======================================================

export const COMPANY_NAMES = {
  '5B': '5B Industrial Holdings, LLC',
  R9: 'R9 Manufacturing Corp.',
  '2D': '2D Logistics & Distribution, Inc.',
  GD: 'GD Global Industries, LLC',
  B110: 'B110 Ventures, LLC',
  QT: 'QT Technologies, Inc.',
  B579: 'B579 Holdings Corp.'
};

export function companyName(code) {
  return COMPANY_NAMES[code] ?? code;
}
