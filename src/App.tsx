import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider as AppContextProvider, useApp } from './context/AppContext';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Organizations from './pages/Organizations';
import UserPanel from './pages/SystemAcess';
import PaymentSettings from './pages/PaymentSettings';
import Banners from './pages/Banners';
import Financials from './pages/Financials';
import Reports from './pages/Reports';
import Audit from './pages/Audit';
import Settings from './pages/Settings';

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
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 p-6 pb-10 overflow-auto">
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
      <AppContextProvider>
        <AppRoutes />
      </AppContextProvider>
    </BrowserRouter>
  );
};

export default App;
