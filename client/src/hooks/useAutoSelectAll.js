// ======================================================
// File Name : useAutoSelectAll.js
// Purpose   : Shared hook used by the Reporting, Modeling and Forecasting
//             filter bars to default a MultiSelect to "everything selected".
// ======================================================

import { useEffect, useRef } from 'react';

// ======================================================
// START: Hook Functions
// ======================================================

// ======================================================
// Function : useAutoSelectAll
// Purpose  : Defaults a checkbox MultiSelect to "everything selected"
//            once its option list is actually known (the list is empty
//            on first render, before the asset list has loaded). Only runs
//            ONCE per hook instance: if the person later unticks "Select All"
//            (selected becomes []), a re-fetch of the options must not tick
//            everything again behind their back.
// ======================================================

export function useAutoSelectAll(options, selected, setSelected) {
    const done = useRef(false);
    useEffect(() => {
        if (done.current || !options.length) return;
        done.current = true;
        if (selected.length === 0) setSelected(options.map((o) => o.value));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options]);
}

// ======================================================
// END: useAutoSelectAll
// ======================================================

// ======================================================
// END: Hook Functions
// ======================================================

// ======================================================
// END OF FILE : useAutoSelectAll.js
// ======================================================
