// ======================================================
// File Name : Reinstatement.jsx
// Purpose   : Lifecycle Event form for the "Reinstatement" card only.
//             Pulls its field list from FIELD_SCHEMAS.reinstatement and
//             its "Load Test Case" options from
//             LIFECYCLE_TEST_CASES.reinstatement, then hands both to the
//             shared EventFormBase for rendering. Reinstatement-only
//             changes belong in THIS file — editing it can't affect any
//             other card's file. (Note: the "Post Event → Reinstatement"
//             prefill-from-asset logic lives in the parent,
//             LifecycleEvents.jsx, since it runs before a card is even
//             rendered.)
// ======================================================

import { FIELD_SCHEMAS } from '../../../data/lifecycleFormSchemas';
import { LIFECYCLE_TEST_CASES } from '../../../data/lifecycleTestCases';
import { EventFormBase } from './EventFormBase';

// ======================================================
// Function : Reinstatement
// Purpose  : React component that renders the 'Reinstatement' event form
// ======================================================

export function Reinstatement(props) {
    return (<EventFormBase
      {...props}
      schema={FIELD_SCHEMAS.reinstatement ?? []}
      testCases={LIFECYCLE_TEST_CASES.reinstatement ?? []}
    />);
}

// ======================================================
// END: Reinstatement
// ======================================================
