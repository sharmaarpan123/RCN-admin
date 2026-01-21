import React, { useState } from 'react';
import { RouterProvider, createBrowserRouter, Navigate, Outlet, useMatches } from 'react-router-dom';
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
import Header from './components/Header';

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
  const matches = useMatches();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Get the current route's metadata
  const currentRoute = matches[matches.length - 1];
  const { title = 'Dashboard', subtitle = '' } = (currentRoute?.handle as { title?: string; subtitle?: string }) || {};

  return (
    <div className="min-h-screen flex">
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <main className="flex-1 p-6 pb-10 overflow-auto">

        {/* Main Content */}
        <div className="md:ml-0 ml-0">
          <Header
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            title={title}
            subtitle={subtitle}
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
        element: <PrivateRoute />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: <Dashboard />,
            handle: {
              title: 'Referral Dashboard',
              subtitle: 'Portal Selector and real-time inbox view.'
            }
          },
          {
            path: 'orgs',
            element: <Organizations />,
            handle: {
              title: 'Organizations',
              subtitle: 'Manage organizations, branches, departments, and users.'
            }
          },
          {
            path: 'userpanel',
            element: <UserPanel />,
            handle: {
              title: 'Master Admin Users',
              subtitle: 'Manage system administrators and access control.'
            }
          },
          {
            path: 'payments',
            element: <PaymentSettings />,
            handle: {
              title: 'Payment Settings',
              subtitle: 'Configure payment methods, fees, and bonuses.'
            }
          },
          {
            path: 'banners',
            element: <Banners />,
            handle: {
              title: 'Banner Management',
              subtitle: 'Create and manage promotional banners across the platform.'
            }
          },
          {
            path: 'financials',
            element: <Financials />,
            handle: {
              title: 'Financials',
              subtitle: 'View financial reports, invoices, and transactions.'
            }
          },
          {
            path: 'reports',
            element: <Reports />,
            handle: {
              title: 'Reports',
              subtitle: 'Generate and export system reports.'
            }
          },
          {
            path: 'audit',
            element: <Audit />,
            handle: {
              title: 'Audit Log',
              subtitle: 'Track system activities and user actions.'
            }
          },
          {
            path: 'settings',
            element: <Settings />,
            handle: {
              title: 'Settings',
              subtitle: 'Manage your profile and system preferences.'
            }
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
