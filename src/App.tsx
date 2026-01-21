import React from 'react';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import Login from './components/Login';
import { AppProvider as AppContextProvider, useApp } from './context/AppContext';
import MasterAdminRoutes from './routes/MasterAdmin';

// Root component that provides context to all routes
const RootLayout: React.FC = () => {
  return (
    <AppContextProvider>
      <Outlet />
    </AppContextProvider>
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



const App: React.FC = () => {
  // Create router configuration
  const router = createBrowserRouter([
    {
      path: '/',
      element: <RootLayout />,
      children: [
        {
          index: true,
          element: <>Home page</>,
        },
        {
          path: '/login',
          element: <PublicRoute />,
          children: [
            {
              index: true,
              element: <Login />,
            },
          ],
        },
        ...MasterAdminRoutes,
        {
          path: '*',
          element: <Navigate to="/" replace />,
        },
      ],
    },
  ]);
  return <RouterProvider router={router} />;
};

export default App;
