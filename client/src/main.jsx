// ======================================================
// File Name : main.jsx
// Purpose   : Implements main
// ======================================================

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BootDataGate } from './context/BootDataGate';
import { CrashGuard } from './components/common/CrashGuard';
import App from './App';
import './styles.css';

// ======================================================
// START: main Functions
// ======================================================

createRoot(document.getElementById('root')).render(<StrictMode>
    <CrashGuard>
      <BrowserRouter>
        <BootDataGate>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BootDataGate>
      </BrowserRouter>
    </CrashGuard>
  </StrictMode>);

// ======================================================
// END: main Functions
// ======================================================

// ======================================================
// END OF FILE : main.jsx
// ======================================================
