import React from 'react';
import Button from '../../Button';
import { usePathname } from 'next/navigation';
import { AdminProfileData } from '@/app/master-admin/types/profile';

interface HeaderProps {
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  profile: AdminProfileData | null;
  loading: boolean;
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

const Header: React.FC<HeaderProps> = ({ setIsMobileMenuOpen, profile, loading }) => {
  const pathname = usePathname();
  const page = Object.keys(pages).find(page => pathname?.startsWith(pages[page as keyof typeof pages]));
  const title = titleMap[page as keyof typeof titleMap]?.title || 'Admin Dashboard';
  const subtitle = titleMap[page as keyof typeof titleMap]?.subtitle || "";

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };


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
      <div className="flex gap-2.5 items-center justify-end">
        {!loading && profile && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="m-0 text-sm font-medium">{profile.first_name} {profile.last_name}</p>
              <p className="m-0 text-xs text-rcn-muted">{profile.email}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-medium">
              {getInitials(profile.first_name, profile.last_name)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
