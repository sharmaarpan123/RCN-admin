import React from 'react';
import Button from '../../Button';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

const titleMap = {
  dashboard: {
    title: 'Referral Dashboard',
    subtitle: 'Portal Selector and real-time inbox view.'
  },
  organizations: {
    title: 'Organizations',
    subtitle: 'Manage organizations, branches, departments, and users.'
  },
  rolesPermissions: {
    title: 'Roles & Permissions',
    subtitle: 'Create and manage roles and assign permissions.'
  },
  systemAccess: {
    title: 'Master Admin Users',
    subtitle: 'Manage system administrators and access control.'
  },
  paymentSettings: {
    title: 'Payment Settings',
    subtitle: 'Configure payment methods, fees, and bonuses.'
  },
  banners: {
    title: 'Banner Management',
    subtitle: 'Create and manage promotional banners across the platform.'
  },
  contentPage: {
    title: 'Content (CMS)',
    subtitle: 'Add and edit CMS pages (e.g. About, Terms, Privacy).'
  },
  financial: {
    title: 'Financial',
    subtitle: 'View financial reports, invoices, and transactions.'
  },
  reports: {
    title: 'Reports',
    subtitle: 'Generate and export system reports.'
  },
  audit: {
    title: 'Audit Log',
    subtitle: 'Track system activities and user actions.'
  },
  settings: {
    title: 'Settings',
    subtitle: 'Manage your profile and system preferences.'
  }
}

const pages =
{
  dashboard: '/master-admin/dashboard',
  organizations: '/master-admin/organizations',
  rolesPermissions: '/master-admin/roles-permissions',
  systemAccess: '/master-admin/system-access',
  paymentSettings: '/master-admin/payment-settings',
  banners: '/master-admin/banners',
  contentPage: '/master-admin/content-page',
  financial: '/master-admin/financial',
  reports: '/master-admin/reports',
  audit: '/master-admin/audit',
  settings: '/master-admin/settings',
};

const Header: React.FC<HeaderProps> = ({ setIsMobileMenuOpen }) => {
  const pathname = usePathname();
  const page = Object.keys(pages).find(page => pathname?.startsWith(pages[page as keyof typeof pages]));
  const title = titleMap[page as keyof typeof titleMap]?.title || 'Admin Dashboard';
  const subtitle = titleMap[page as keyof typeof titleMap]?.subtitle || "";


  return (
    <div className="flex gap-3 items-center justify-between mb-4">
      {/* Mobile Menu Toggle Button */}
      <Button
        variant="primary"
        className=" md:hidden" onClick={() => setIsMobileMenuOpen(true)}
        aria-label="Open menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </Button>
      <div>
        <h2 className="m-0 text-lg font-bold">{title}</h2>
        <p className="mt-1 mb-0 text-rcn-muted text-sm">{subtitle}</p>
      </div>
      <div className="flex gap-2.5 items-center justify-end"></div>
    </div>
  );
};

export default Header;
