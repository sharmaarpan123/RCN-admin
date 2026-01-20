import React, { useState } from 'react';
import { RouterProvider, createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
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
import TopBar from './components/TopBar';

// Root component that provides context to all routes
const RootLayout: React.FC = () => {
  return (
    <AppContextProvider>
      <Outlet />
    </AppContextProvider>
  );
};

// Protected Route Component - Redirects to /login if not authenticated
const PrivateRoute: React.FC = () => {
  const { session } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <main className="flex-1 p-6 pb-10 overflow-auto">
        {/* Mobile Menu Toggle Button */}
        <button
          className="md:hidden fixed top-4 left-4 z-30 p-2 rounded-lg bg-rcn-accent text-white shadow-lg hover:bg-rcn-accent-dark transition-colors"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Main Content */}
        <div className="md:ml-0 ml-0">
          <TopBar
            title="Referral Dashboard"
            subtitle="Portal Selector and real-time inbox view."
          />
          <Outlet />
        </div>
      </main>
    </div>
  );
};

// Public Route Component - Redirects to /dashboard if already authenticated
const PublicRoute: React.FC = () => {
  const { session } = useApp();

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

// Create router configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        path: 'login',
        element: <PublicRoute />,
        children: [
          {
            index: true,
            element: <Login />,
          },
        ],
      },
      {
        path: '/',
        element: <PrivateRoute  />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: <Dashboard />,
          },
          {
            path: 'orgs',
            element: <Organizations />,
          },
          {
            path: 'userpanel',
            element: <UserPanel />,
          },
          {
            path: 'payments',
            element: <PaymentSettings />,
          },
          {
            path: 'banners',
            element: <Banners />,
          },
          {
            path: 'financials',
            element: <Financials />,
          },
          {
            path: 'reports',
            element: <Reports />,
          },
          {
            path: 'audit',
            element: <Audit />,
          },
          {
            path: 'settings',
            element: <Settings />,
          },
        ],
      },
      {
        path: '*',
        element: <Navigate to="/login" replace />,
      },
    ],
  },
]);

const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;
