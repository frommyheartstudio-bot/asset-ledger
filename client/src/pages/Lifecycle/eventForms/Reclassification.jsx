// ======================================================
// File Name : Reclassification.jsx
// Purpose   : Lifecycle Event form for the "Reclassification" card only.
//             Pulls its field list from FIELD_SCHEMAS.reclassification
//             and its "Load Test Case" options from
//             LIFECYCLE_TEST_CASES.reclassification, then hands both to
//             the shared EventFormBase for rendering. Reclassification-
//             only changes belong in THIS file — editing it can't affect
//             any other card's file.
// ======================================================

import { FIELD_SCHEMAS } from '../../../data/lifecycleFormSchemas';
import { LIFECYCLE_TEST_CASES } from '../../../data/lifecycleTestCases';
import { EventFormBase } from './EventFormBase';

// ======================================================
// Function : Reclassification
// Purpose  : React component that renders the 'Reclassification' event
//            form
// ======================================================

export function Reclassification(props) {
    return (<EventFormBase
      {...props}
      schema={FIELD_SCHEMAS.reclassification ?? []}
      testCases={LIFECYCLE_TEST_CASES.reclassification ?? []}
    />);
}

// ======================================================
// END: Reclassification
// ======================================================
