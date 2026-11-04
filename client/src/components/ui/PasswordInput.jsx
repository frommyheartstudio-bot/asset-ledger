// ======================================================
// File Name : PasswordInput.jsx
// Purpose   : Reusable UI component: PasswordInput — a labeled password
//             field with a "view password" eye icon, and an optional
//             "Generate" button that fills in an auto-generated strong
//             password (used wherever an admin sets someone else's
//             password). Matches the app's .form-row styling.
// ======================================================

import { useState } from 'react';
import { generateStrongPassword, passwordStrengthIssues } from '../../utils/password';

// ======================================================
// START: Component Functions
// ======================================================

// ======================================================
// Function : EyeIcon
// Purpose  : Open/closed eye glyph for the show/hide toggle
// ======================================================

function EyeIcon({ open }) {
    return open ? (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>) : (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.9 19.9 0 0 1 4.22-5.94M9.9 4.24A10.9 10.9 0 0 1 12 4c7 0 11 8 11 8a19.86 19.86 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <path d="M1 1l22 22"/>
    </svg>);
}

// ======================================================
// END: EyeIcon
// ======================================================

// ======================================================
// Function : PasswordInput
// Purpose  : React component that renders a password field with an eye
//            icon to toggle visibility. Pass showGenerate to also show
//            a "Generate" button (auto-fills a strong password) and
//            showStrength to show a live "needs: ..." hint.
// ======================================================

export function PasswordInput({
    label, hint, id, value, onChange, showGenerate = false, showStrength = false, ...rest
}) {
    const inputId = id ?? `input-${(label || 'password').replace(/\s+/g, '-').toLowerCase()}`;
    const [visible, setVisible] = useState(false);

    function handleGenerate() {
        onChange({ target: { value: generateStrongPassword() } });
        setVisible(true); // show it right after generating so it can be copied
    }

    const issues = showStrength ? passwordStrengthIssues(value || '') : [];

    return (<div className="form-row">
      <label htmlFor={inputId}>{label}</label>
      {/* One bordered flex row: [ input | eye | Generate ]. Nothing is absolutely
          positioned, so the eye can never sit under (or get hidden by) the
          Generate button on narrow phones. */}
      <div className="pw-field">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          {...rest}
        />
        <button
          type="button"
          className="pw-eye"
          onClick={() => setVisible((v) => !v)}
          title={visible ? 'Hide password' : 'View password'}
          aria-label={visible ? 'Hide password' : 'View password'}
        >
          <EyeIcon open={visible}/>
        </button>
        {showGenerate && (<button
            type="button"
            className="pw-generate"
            onClick={handleGenerate}
            title="Auto-generate a strong password"
          >
            Generate
          </button>)}
      </div>
      {hint && <div className="hint">{hint}</div>}
      {showStrength && value && (issues.length
          ? <div className="hint" style={{ color: 'var(--danger, #dc2626)' }}>Needs {issues.join(', ')}.</div>
          : <div className="hint" style={{ color: 'var(--success, #059669)' }}>Strong password.</div>)}
    </div>);
}

// ======================================================
// END: PasswordInput
// ======================================================

// ======================================================
// END: Component Functions
// ======================================================

// ======================================================
// END OF FILE : PasswordInput.jsx
// ======================================================
