// ======================================================
// File Name : Adjustment.jsx
// Purpose   : Lifecycle Event form for the "Adjustment" card only. Pulls
//             its field list from FIELD_SCHEMAS.adjustment and its "Load
//             Test Case" options from LIFECYCLE_TEST_CASES.adjustment,
//             then hands both to the shared EventFormBase for rendering.
//             Adjustment-only changes belong in THIS file — editing it
//             can't affect any other card's file.
// ======================================================

import { FIELD_SCHEMAS } from '../../../data/lifecycleFormSchemas';
import { LIFECYCLE_TEST_CASES } from '../../../data/lifecycleTestCases';
import { EventFormBase } from './EventFormBase';

// ======================================================
// Function : Adjustment
// Purpose  : React component that renders the 'Adjustment' event form
// ======================================================

export function Adjustment(props) {
    return (<EventFormBase
      {...props}
      schema={FIELD_SCHEMAS.adjustment ?? []}
      testCases={LIFECYCLE_TEST_CASES.adjustment ?? []}
    />);
}

// ======================================================
// END: Adjustment
// ======================================================
