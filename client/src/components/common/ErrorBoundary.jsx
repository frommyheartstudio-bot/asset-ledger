// ======================================================
// File Name : ErrorBoundary.jsx
// Purpose   : Catches a crash while rendering any page and shows a message
//             with a Reload button, instead of React unmounting the whole
//             app and leaving a blank white screen. It resets itself when
//             the person navigates to another page (resetKey changes).
// ======================================================

import { Component } from 'react';
import { useLocation } from 'react-router-dom';

class Boundary extends Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, info) {
        console.error('Page crashed while rendering:', error, info?.componentStack);
    }

    componentDidUpdate(prevProps) {
        if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
            this.setState({ error: null });
        }
    }

    render() {
        if (!this.state.error) return this.props.children;
        return (<div style={{ padding: 40, maxWidth: 640, margin: '60px auto', textAlign: 'center' }}>
        <h2 style={{ marginBottom: 8 }}>Something went wrong on this page</h2>
        <p style={{ color: '#64748b', marginBottom: 16 }}>
          {String(this.state.error?.message || this.state.error)}
        </p>
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>Reload page</button>{' '}
        <a className="btn btn-ghost" href="/">Go to Dashboard</a>
      </div>);
    }
}

export function ErrorBoundary({ children }) {
    const location = useLocation();
    return <Boundary resetKey={location.pathname}>{children}</Boundary>;
}

// ======================================================
// END OF FILE : ErrorBoundary.jsx
// ======================================================
