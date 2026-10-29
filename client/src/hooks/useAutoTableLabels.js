// ======================================================
// File Name : useAutoTableLabels.js
// Purpose   : On mobile every .table turns into stacked cards that show
//             each cell's `data-label` next to its value. Many hand-written
//             tables never set data-label, so their cards showed bare
//             values. This hook copies each column's <th> text onto the
//             matching <td> (only where one is missing) and keeps doing so
//             as pages render/re-render.
// ======================================================

import { useEffect } from 'react';

function labelTables(root) {
    root.querySelectorAll('table.table').forEach((table) => {
        const headRow = table.tHead && table.tHead.rows[0];
        if (!headRow) return;
        const labels = [];
        Array.from(headRow.cells).forEach((th) => {
            const text = (th.textContent || '').trim();
            for (let i = 0; i < (th.colSpan || 1); i++) labels.push(text);
        });
        Array.from(table.tBodies).forEach((body) => {
            Array.from(body.rows).forEach((tr) => {
                let col = 0;
                Array.from(tr.cells).forEach((td) => {
                    if (!td.hasAttribute('data-label') && labels[col]) td.setAttribute('data-label', labels[col]);
                    col += td.colSpan || 1;
                });
            });
        });
    });
}

export function useAutoTableLabels() {
    useEffect(() => {
        let frame = 0;
        const run = () => { frame = 0; labelTables(document); };
        const schedule = () => { if (!frame) frame = requestAnimationFrame(run); };
        run();
        const observer = new MutationObserver(schedule);
        observer.observe(document.body, { childList: true, subtree: true });
        return () => { observer.disconnect(); if (frame) cancelAnimationFrame(frame); };
    }, []);
}
