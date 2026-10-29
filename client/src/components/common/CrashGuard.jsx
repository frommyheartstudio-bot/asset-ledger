// ======================================================
// File Name : CrashGuard.jsx
// Purpose   : Catches a render crash anywhere below it and shows the
//             error on screen instead of leaving a blank page.
// ======================================================

import { Component } from 'react';

export class CrashGuard extends Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, info) {
        console.error('CrashGuard caught:', error, info?.componentStack);
    }

    render() {
        const { error } = this.state;
        if (!error) return this.props.children;
        return (<div style={{ padding: 24, fontFamily: 'system-ui, sans-serif', color: '#111', background: '#fff', minHeight: '100vh' }}>
          <h2 style={{ color: '#dc2626', marginTop: 0 }}>Something crashed on this page</h2>
          <p>Please send a screenshot of this box.</p>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f1f5f9', padding: 12, borderRadius: 8, fontSize: 13 }}>
            {String(error?.message || error)}
            {'\n\n'}
            {String(error?.stack || '').split('\n').slice(0, 8).join('\n')}
          </pre>
          <button type="button" onClick={() => window.location.reload()}>Reload</button>
        </div>);
    }
}
