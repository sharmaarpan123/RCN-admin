import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import Organizations from './views/Organizations';
import UserPanel from './views/UserPanel';
import PaymentSettings from './views/PaymentSettings';
import Banners from './views/Banners';
import Financials from './views/Financials';
import Reports from './views/Reports';
import Audit from './views/Audit';
import Settings from './views/Settings';
import './App.css';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useApp();
  return session ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  const { session } = useApp();

  if (!session) {
    return <Login />;
  }

  return (
    <div className="app">
      <Sidebar />
      <main className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/orgs" element={<PrivateRoute><Organizations /></PrivateRoute>} />
          <Route path="/userpanel" element={<PrivateRoute><UserPanel /></PrivateRoute>} />
          <Route path="/payments" element={<PrivateRoute><PaymentSettings /></PrivateRoute>} />
          <Route path="/banners" element={<PrivateRoute><Banners /></PrivateRoute>} />
          <Route path="/financials" element={<PrivateRoute><Financials /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
          <Route path="/audit" element={<PrivateRoute><Audit /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          <Route path="/login" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;
