"use client"
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '../../../context/AppContext';
import { roleLabel, MODULE_PERMS } from '../../../utils/database';
import Button from '../../Button';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, logout } = useApp();

  const canAccessView = (view: string): boolean => {
    if (!currentUser) return false;
    if (view === 'orgs') return true;
    
    const permKey = MODULE_PERMS[view as keyof typeof MODULE_PERMS];
    if (!permKey) return true;
    
    if (view === 'userpanel') {
      return currentUser.role === 'SYSTEM_ADMIN' && !!currentUser.permissions?.userPanel;
    }
    
    return !!currentUser.permissions?.[permKey];
  };

  const handleNavClick = (path: string, view: string) => {
    if (!canAccessView(view)) {
      return;
    }
    router.push(path);
    // Close mobile menu after navigation
    if (onClose) {
      onClose();
    }
  };

  const isActive = (path: string) => pathname === path;

  const navSections = [
    {
      title: 'Core',
      items: [
        {
          path: '/master-admin/dashboard',
          label: 'Referral Dashboard',
          view: 'dashboard',
          requiresPermission: true
        },
        {
          path: '/master-admin/organizations',
          label: 'Organizations',
          view: 'orgs',
          requiresPermission: false
        },
        {
          path: '/master-admin/system-access',
          label: 'Master Admin Users',
          view: 'userpanel',
          requiresPermission: true
        }
      ]
    },
    {
      title: 'Operations',
      items: [
        {
          path: '/master-admin/payment-settings',
          label: 'Payment Adjustment Settings',
          view: 'payments',
          requiresPermission: true
        },
        {
          path: '/master-admin/banners',
          label: 'Banner Management',
          view: 'banners',
          requiresPermission: true
        },
        {
          path: '/master-admin/financial',
          label: 'Financials',
          view: 'financials',
          requiresPermission: true
        },
        {
          path: '/master-admin/reports',
          label: 'Reports',
          view: 'reports',
          requiresPermission: true
        },
        {
          path: '/master-admin/audit',
          label: 'Audit Log',
          view: 'audit',
          requiresPermission: true
        }
      ]
    },
    {
      title: 'System',
      items: [
        {
          path: '/master-admin/settings',
          label: 'Settings',
          view: 'settings',
          requiresPermission: true
        }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-[280px] bg-rcn-dark-bg text-rcn-dark-text p-4 border-r border-white/10 
        h-screen overflow-auto
        md:sticky md:top-0
        fixed top-0 left-0 z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
      <div className="flex gap-2.5 items-center px-2.5 py-3 border-b border-white/10 mb-3">
        <div className="w-10 h-10 rounded-xl logo-gradient shadow-[0_8px_18px_rgba(0,0,0,0.25)]" aria-hidden="true"></div>
        <div className="flex-1">
          <h1 className="text-sm font-semibold m-0 leading-tight">RCN Admin</h1>
          <div className="text-xs text-rcn-dark-text/80">
            {currentUser ? `${currentUser.name} • ${roleLabel(currentUser.role)}` : 'Signed in'}
          </div>
        </div>
        {/* Mobile Close Button */}
        <Button
          variant="secondary"
          onClick={onClose}
          className='md:hidden'
          aria-label="Close menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>

      {navSections.map((section) => (
        <div key={section.title} className="mt-3">
          <div className="text-[11px] uppercase tracking-wider text-rcn-dark-text/65 px-2.5 py-2.5">
            {section.title}
          </div>
          <nav className="space-y-1">
            {section.items.map((item) => {
              if (item.requiresPermission && !canAccessView(item.view)) {
                return null;
              }
              return (
                <a
                  key={item.path}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl no-underline text-inherit mx-1.5 transition-all cursor-pointer ${
                    isActive(item.path) ? 'bg-white/15' : 'hover:bg-white/10'
                  }`}
                  onClick={() => handleNavClick(item.path, item.view)}
                >
                  {item.label}
                </a>
              );
            })}
            {section.title === 'System' && (
              <a 
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl no-underline text-inherit mx-1.5 transition-all cursor-pointer hover:bg-white/10"
                onClick={logout}
              >
                Logout
              </a>
            )}
          </nav>
        </div>
      ))}
    </aside>
    </>
  );
};

export default Sidebar;
