// ======================================================
// File Name : App.jsx
// Purpose   : Implements App
// ======================================================

import { Navigate, Route, Routes } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { AssetRegister } from './pages/Assets/AssetRegister';
import { AssetDetail } from './pages/Assets/AssetDetail';
import { AssetForm } from './pages/Assets/AssetForm';
import { LifecycleEvents } from './pages/Lifecycle/LifecycleEvents';
import { Modeling } from './pages/Planning/Modeling';
import { Forecasting } from './pages/Planning/Forecasting';
import { Reporting } from './pages/Compliance/Reporting';
import { Users } from './pages/Administration/Users';

// ======================================================
// START: App Functions
// ======================================================

// ======================================================
// Function : App
// Purpose  : React component that renders the 'App' UI
// ======================================================

export default function App() {
    return (<Routes>
      <Route path="/" element={<Dashboard />}/>
      <Route path="/assets" element={<AssetRegister />}/>
      <Route path="/assets/new" element={<AssetForm />}/>
      <Route path="/assets/:assetNumber" element={<AssetDetail />}/>
      <Route path="/lifecycle" element={<LifecycleEvents />}/>
      <Route path="/modeling" element={<Modeling />}/>
      <Route path="/forecasting" element={<Forecasting />}/>
      <Route path="/reporting" element={<Reporting />}/>
      <Route path="/users" element={<Users />}/>
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>);
}

// ======================================================
// END: App
// ======================================================

// ======================================================
// END: App Functions
// ======================================================

