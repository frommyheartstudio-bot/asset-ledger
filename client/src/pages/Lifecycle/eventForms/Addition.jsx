// ======================================================
// File Name : Addition.jsx
// Purpose   : Lifecycle Event form for the "Addition" card only. Pulls
//             its field list from FIELD_SCHEMAS.addition and its "Load
//             Test Case" options from LIFECYCLE_TEST_CASES.addition, then
//             hands both to the shared EventFormBase for rendering.
//             Addition-only changes (a new field, different validation,
//             etc.) belong in THIS file — editing it can't affect
//             Adjustment.jsx, Transfer.jsx, or any other card's file.
// ======================================================

import { FIELD_SCHEMAS } from '../../../data/lifecycleFormSchemas';
import { LIFECYCLE_TEST_CASES } from '../../../data/lifecycleTestCases';
import { EventFormBase } from './EventFormBase';

// ======================================================
// Function : Addition
// Purpose  : React component that renders the 'Addition' event form
// ======================================================

export function Addition(props) {
    return (<EventFormBase
      {...props}
      schema={FIELD_SCHEMAS.addition ?? []}
      testCases={LIFECYCLE_TEST_CASES.addition ?? []}
    />);
}

// ======================================================
// END: Addition
// ======================================================
