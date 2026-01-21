import { useState } from 'react';
import { Navigate, Outlet, useMatches } from 'react-router-dom';
import Header from '../../components/MasterAdmin/Header';
import Sidebar from '../../components/MasterAdmin/Sidebar';
import { useApp } from '../../context/AppContext';
import Audit from '../../pages/MasterAdmin/Audit';
import Banners from '../../pages/MasterAdmin/Banners';
import Dashboard from '../../pages/MasterAdmin/Dashboard';
import Financials from '../../pages/MasterAdmin/Financials';
import Organizations from '../../pages/MasterAdmin/Organizations';
import PaymentSettings from '../../pages/MasterAdmin/PaymentSettings';
import Reports from '../../pages/MasterAdmin/Reports';
import Settings from '../../pages/MasterAdmin/Settings';
import UserPanel from '../../pages/MasterAdmin/SystemAcess';

const AdminLayout: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const matches = useMatches();
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

// Protected Route Component - Redirects to /login if not authenticated
const AdminProtectorRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { session } = useApp();
    if (!session) {
        return <Navigate to="/" replace />;
    }


    return children
};

const MasterAdminRoutes = [
    {
        path: '/admin',
        element: <AdminProtectorRoute><AdminLayout /></AdminProtectorRoute>,
        children: [
            {
                index: true,
                element: <Navigate to="dashboard" replace />,
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
            {
                path: '*',
                element: <Navigate to="dashboard" replace />,
            },
        ],
    },
]

export default MasterAdminRoutes;