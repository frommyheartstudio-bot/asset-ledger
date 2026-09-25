// ======================================================
// File Name : Transfer.jsx
// Purpose   : Lifecycle Event form for the "Transfer" card only. Pulls
//             its field list from FIELD_SCHEMAS.transfer and its "Load
//             Test Case" options from LIFECYCLE_TEST_CASES.transfer, then
//             hands both to the shared EventFormBase for rendering.
//             Transfer-only changes belong in THIS file — editing it
//             can't affect any other card's file.
// ======================================================

import { FIELD_SCHEMAS } from '../../../data/lifecycleFormSchemas';
import { LIFECYCLE_TEST_CASES } from '../../../data/lifecycleTestCases';
import { EventFormBase } from './EventFormBase';

// ======================================================
// Function : Transfer
// Purpose  : React component that renders the 'Transfer' event form
// ======================================================

export function Transfer(props) {
    return (<EventFormBase
      {...props}
      schema={FIELD_SCHEMAS.transfer ?? []}
      testCases={LIFECYCLE_TEST_CASES.transfer ?? []}
    />);
}

// ======================================================
// END: Transfer
// ======================================================
