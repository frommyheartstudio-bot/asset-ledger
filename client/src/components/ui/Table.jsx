// ======================================================
// File Name : Table.jsx
// Purpose   : Reusable UI component: Table
// ======================================================


// ======================================================
// START: Component Functions
// ======================================================

/** Generic data table matching the app's .table styling. Pass column definitions and rows. */
// ======================================================
// Function : Table
// Purpose  : React component that renders the 'Table' UI
// ======================================================

export function Table({ columns, rows, rowKey, onRowClick }) {
    return (<table className="table">
      <thead>
        <tr>
          {columns.map((c) => (<th key={c.header} className={c.numeric ? 'num' : ''} style={c.width ? { width: c.width } : undefined}>
              {c.header}
            </th>))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (<tr key={rowKey(row)} onClick={onRowClick ? () => onRowClick(row) : undefined}>
            {columns.map((c) => (<td key={c.header} className={c.numeric ? 'num' : ''} data-label={c.header}>
                {c.render(row)}
              </td>))}
          </tr>))}
      </tbody>
    </table>);
}

// ======================================================
// END: Table
// ======================================================

// ======================================================
// END: Component Functions
// ======================================================

