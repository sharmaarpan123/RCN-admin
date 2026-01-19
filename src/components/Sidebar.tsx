import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { roleLabel, MODULE_PERMS } from '../utils/database';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
    navigate(path);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-[280px] bg-rcn-dark-bg text-rcn-dark-text p-4 border-r border-white/10 sticky top-0 h-screen overflow-auto">
      <div className="flex gap-2.5 items-center px-2.5 py-3 border-b border-white/10 mb-3">
        <div className="w-10 h-10 rounded-xl logo-gradient shadow-[0_8px_18px_rgba(0,0,0,0.25)]" aria-hidden="true"></div>
        <div>
          <h1 className="text-sm font-semibold m-0 leading-tight">RCN Admin</h1>
          <div className="text-xs text-rcn-dark-text/80">
            {currentUser ? `${currentUser.name} • ${roleLabel(currentUser.role)}` : 'Signed in'}
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="text-[11px] uppercase tracking-wider text-rcn-dark-text/65 px-2.5 py-2.5">Core</div>
        <nav className="space-y-1">
          {canAccessView('dashboard') && (
            <a
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl no-underline text-inherit mx-1.5 transition-all cursor-pointer ${
                isActive('/dashboard') ? 'bg-white/15' : 'hover:bg-white/10'
              }`}
              onClick={() => handleNavClick('/dashboard', 'dashboard')}
            >
              Referral Dashboard
            </a>
          )}
          <a
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl no-underline text-inherit mx-1.5 transition-all cursor-pointer ${
              isActive('/orgs') ? 'bg-white/15' : 'hover:bg-white/10'
            }`}
            onClick={() => handleNavClick('/orgs', 'orgs')}
          >
            Organizations
          </a>
          {canAccessView('userpanel') && (
            <a
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl no-underline text-inherit mx-1.5 transition-all cursor-pointer ${
                isActive('/userpanel') ? 'bg-white/15' : 'hover:bg-white/10'
              }`}
              onClick={() => handleNavClick('/userpanel', 'userpanel')}
            >
              User Panel
            </a>
          )}
        </nav>
      </div>

      <div className="mt-3">
        <div className="text-[11px] uppercase tracking-wider text-rcn-dark-text/65 px-2.5 py-2.5">Operations</div>
        <nav className="space-y-1">
          {canAccessView('payments') && (
            <a
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl no-underline text-inherit mx-1.5 transition-all cursor-pointer ${
                isActive('/payments') ? 'bg-white/15' : 'hover:bg-white/10'
              }`}
              onClick={() => handleNavClick('/payments', 'payments')}
            >
              Payment Adjustment Settings
            </a>
          )}
          {canAccessView('banners') && (
            <a
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl no-underline text-inherit mx-1.5 transition-all cursor-pointer ${
                isActive('/banners') ? 'bg-white/15' : 'hover:bg-white/10'
              }`}
              onClick={() => handleNavClick('/banners', 'banners')}
            >
              Banner Management
            </a>
          )}
          {canAccessView('financials') && (
            <a
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl no-underline text-inherit mx-1.5 transition-all cursor-pointer ${
                isActive('/financials') ? 'bg-white/15' : 'hover:bg-white/10'
              }`}
              onClick={() => handleNavClick('/financials', 'financials')}
            >
              Financials
            </a>
          )}
          {canAccessView('reports') && (
            <a
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl no-underline text-inherit mx-1.5 transition-all cursor-pointer ${
                isActive('/reports') ? 'bg-white/15' : 'hover:bg-white/10'
              }`}
              onClick={() => handleNavClick('/reports', 'reports')}
            >
              Reports
            </a>
          )}
          {canAccessView('audit') && (
            <a
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl no-underline text-inherit mx-1.5 transition-all cursor-pointer ${
                isActive('/audit') ? 'bg-white/15' : 'hover:bg-white/10'
              }`}
              onClick={() => handleNavClick('/audit', 'audit')}
            >
              Audit Log
            </a>
          )}
        </nav>
      </div>

      <div className="mt-3">
        <div className="text-[11px] uppercase tracking-wider text-rcn-dark-text/65 px-2.5 py-2.5">System</div>
        <nav className="space-y-1">
          {canAccessView('settings') && (
            <a
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl no-underline text-inherit mx-1.5 transition-all cursor-pointer ${
                isActive('/settings') ? 'bg-white/15' : 'hover:bg-white/10'
              }`}
              onClick={() => handleNavClick('/settings', 'settings')}
            >
              Settings
            </a>
          )}
          <a 
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl no-underline text-inherit mx-1.5 transition-all cursor-pointer hover:bg-white/10"
            onClick={logout}
          >
            Logout
          </a>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
