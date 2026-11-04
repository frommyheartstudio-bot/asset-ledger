// ======================================================
// File Name : Pagination.jsx
// Purpose   : Shared client-side pagination for every table.
//               const pg = usePagination(rows);      // rows -> pg.pageItems
//               ...render pg.pageItems in the table...
//               <Pagination {...pg.pager}/>          // Page x of y, rows per page, Prev / Next
//             The bar hides itself when everything fits on the smallest
//             page size, so tiny tables stay clean. The page resets to 1
//             whenever the rows change length (filter/search) or the
//             page size changes.
// ======================================================

import { useEffect, useMemo, useState } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';

// ======================================================
// START: Component Functions
// ======================================================

const PAGE_SIZES = [10, 25, 50, 100];

// ======================================================
// Function : usePagination
// Purpose  : Hook that slices a list into pages and returns the current page items plus the pager props.
// ======================================================
export function usePagination(items, initialSize = 10) {
    const [pageSize, setPageSize] = useState(initialSize);
    const [page, setPage] = useState(1);
    const total = items.length;
    useEffect(() => { setPage(1); }, [total, pageSize]);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * pageSize;
    const pageItems = useMemo(() => items.slice(start, start + pageSize), [items, start, pageSize]);
    return {
        pageItems,
        pager: { total, page: currentPage, totalPages, pageSize, setPage, setPageSize }
    };
}

// ======================================================
// Function : PagerBar
// Purpose  : Presentational pager: "Showing 1–10 of 21", rows-per-page select
//            and a  < Page 1 of 3 >  stepper. Used by Pagination and by the
//            Asset Register (which paginates its own list).
// ======================================================
export function PagerBar({ total, page, totalPages, pageSize, setPage, setPageSize, sizes = PAGE_SIZES }) {
    const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const end = Math.min(total, page * pageSize);
    return (<div className="pager">
      <div className="pager-range">Showing <b>{start}–{end}</b> of <b>{total.toLocaleString()}</b></div>
      <select className="pager-size" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} aria-label="Rows per page">
        {sizes.map((n) => (<option key={n} value={n}>{n} / page</option>))}
      </select>
      <div className="pager-stepper" role="navigation" aria-label="Pagination">
        <button type="button" className="pager-btn" onClick={() => setPage(page - 1)} disabled={page <= 1} aria-label="Previous page"><Icon name="chevronLeft" size={20}/></button>
        <span className="pager-current">Page <b>{page}</b> of {totalPages}</span>
        <button type="button" className="pager-btn" onClick={() => setPage(page + 1)} disabled={page >= totalPages} aria-label="Next page"><Icon name="chevronRight" size={20}/></button>
      </div>
    </div>);
}

// ======================================================
// Function : Pagination
// Purpose  : PagerBar that hides itself when everything fits on one page.
// ======================================================
export function Pagination(props) {
    if (props.total <= PAGE_SIZES[0]) return null;
    return <PagerBar {...props}/>;
}

// ======================================================
// END: Component Functions
// ======================================================

// ======================================================
// END OF FILE : Pagination.jsx
// ======================================================
