// ======================================================
// File Name : Input.jsx
// Purpose   : Reusable UI component: Input
// ======================================================


// ======================================================
// START: Component Functions
// ======================================================

/** Labeled text input matching the app's .form-row styling. */
// ======================================================
// Function : Input
// Purpose  : React component that renders the 'Input' UI
// ======================================================

export function Input({ label, hint, id, ...rest }) {
    const inputId = id ?? `input-${label.replace(/\s+/g, '-').toLowerCase()}`;
    return (<div className="form-row">
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} {...rest}/>
      {hint && <div className="hint">{hint}</div>}
    </div>);
}

// ======================================================
// END: Input
// ======================================================
/** Labeled select matching the same .form-row styling as Input. */
// ======================================================
// Function : Select
// Purpose  : React component that renders the 'Select' UI
// ======================================================

export function Select({ label, value, onChange, options, hint }) {
    return (<div className="form-row">
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (<option key={o}>{o}</option>))}
      </select>
      {hint && <div className="hint">{hint}</div>}
    </div>);
}

// ======================================================
// END: Select
// ======================================================

// ======================================================
// END: Component Functions
// ======================================================

