// ======================================================
// File Name : Table.jsx
// Purpose   : Reusable UI component: Table
// ======================================================


// ======================================================
// START: Component Functions
// ======================================================

/**
 * Generic data table matching the app's .table styling. Pass column definitions and rows.
 *
 * Optional `selection` prop adds a leading checkbox column:
 *   { selectedKeys: Set<key>, allSelected: bool, someSelected: bool,
 *     onToggleRow: (key) => void, onToggleAll: () => void }
 * When omitted, the table renders exactly as before (no checkbox column).
 */
// ======================================================
// Function : Table
// Purpose  : React component that renders the 'Table' UI
// ======================================================

export function Table({ columns, rows, rowKey, onRowClick, selection }) {
    return (<div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {selection && (<th className="checkbox-col">
                <input type="checkbox" checked={selection.allSelected} ref={(el) => {
                    if (el) el.indeterminate = !selection.allSelected && selection.someSelected;
                }} onChange={selection.onToggleAll} aria-label="Select all rows"/>
              </th>)}
            {columns.map((c) => (<th key={c.header} className={c.numeric ? 'num' : ''} style={c.width ? { width: c.width } : undefined}>
                {c.header}
              </th>))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const key = rowKey(row);
            return (<tr key={key} onClick={onRowClick ? () => onRowClick(row) : undefined}>
              {selection && (<td className="checkbox-col" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={selection.selectedKeys.has(key)} onChange={() => selection.onToggleRow(key)} aria-label={`Select row ${key}`}/>
                </td>)}
              {columns.map((c) => (<td key={c.header} className={c.numeric ? 'num' : ''} data-label={c.header}>
                  {c.render(row)}
                </td>))}
            </tr>);
          })}
        </tbody>
      </table>
    </div>);
}

// ======================================================
// END: Table
// ======================================================

// ======================================================
// END: Component Functions
// ======================================================

