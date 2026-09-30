// ======================================================
// File Name : useBooks.js
// Purpose   : Every Book dropdown in the app reads its options from
//             here, so the list of books lives in one place (the server's
//             books.ts). Fetched once per page load and shared; falls back
//             to the static list so a dropdown is never empty.
//               useBooks() -> { names, books, defaultBook }
// ======================================================

import { useEffect, useState } from 'react';
import { booksApi } from '../api/books.api';
import { DEFAULT_BOOK, FALLBACK_BOOK_NAMES } from '../data/books';

let cache = null;
let inflight = null;

// ======================================================
// Function : loadBooks
// Purpose  : Fetches the book list once and remembers it. A failure is
//            not cached, so the next mount simply tries again.
// ======================================================

function loadBooks() {
    if (cache) return Promise.resolve(cache);
    if (!inflight) {
        inflight = booksApi.list()
            .then((res) => {
                if (!Array.isArray(res?.books) || res.books.length === 0) throw new Error('no books returned');
                cache = res;
                return res;
            })
            .finally(() => { inflight = null; });
    }
    return inflight;
}

// ======================================================
// Function : useBooks
// Purpose  : React hook — the book names (and full rows) for a dropdown.
// ======================================================

export function useBooks() {
    const [data, setData] = useState(cache);
    useEffect(() => {
        let alive = true;
        loadBooks()
            .then((res) => { if (alive) setData(res); })
            .catch((err) => console.error('Failed to load books:', err));
        return () => { alive = false; };
    }, []);
    const books = data?.books ?? FALLBACK_BOOK_NAMES.map((name) => ({ name }));
    return {
        names: books.map((b) => b.name),
        books,
        defaultBook: data?.defaultBook ?? DEFAULT_BOOK
    };
}

// ======================================================
// END OF FILE : useBooks.js
// ======================================================
