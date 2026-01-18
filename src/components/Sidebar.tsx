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
    <aside className="sidebar">
      <div className="brand">
        <div className="logo" aria-hidden="true"></div>
        <div>
          <h1>RCN Admin</h1>
          <div className="sub">
            {currentUser ? `${currentUser.name} • ${roleLabel(currentUser.role)}` : 'Signed in'}
          </div>
        </div>
      </div>

      <div className="navsec">
        <div className="label">Core</div>
        <nav className="nav">
          {canAccessView('dashboard') && (
            <a
              className={isActive('/dashboard') ? 'active' : ''}
              onClick={() => handleNavClick('/dashboard', 'dashboard')}
            >
              Referral Dashboard
            </a>
          )}
          <a
            className={isActive('/orgs') ? 'active' : ''}
            onClick={() => handleNavClick('/orgs', 'orgs')}
          >
            Organizations
          </a>
          {canAccessView('userpanel') && (
            <a
              className={isActive('/userpanel') ? 'active' : ''}
              onClick={() => handleNavClick('/userpanel', 'userpanel')}
            >
              User Panel
            </a>
          )}
        </nav>
      </div>

      <div className="navsec">
        <div className="label">Operations</div>
        <nav className="nav">
          {canAccessView('payments') && (
            <a
              className={isActive('/payments') ? 'active' : ''}
              onClick={() => handleNavClick('/payments', 'payments')}
            >
              Payment Adjustment Settings
            </a>
          )}
          {canAccessView('banners') && (
            <a
              className={isActive('/banners') ? 'active' : ''}
              onClick={() => handleNavClick('/banners', 'banners')}
            >
              Banner Management
            </a>
          )}
          {canAccessView('financials') && (
            <a
              className={isActive('/financials') ? 'active' : ''}
              onClick={() => handleNavClick('/financials', 'financials')}
            >
              Financials
            </a>
          )}
          {canAccessView('reports') && (
            <a
              className={isActive('/reports') ? 'active' : ''}
              onClick={() => handleNavClick('/reports', 'reports')}
            >
              Reports
            </a>
          )}
          {canAccessView('audit') && (
            <a
              className={isActive('/audit') ? 'active' : ''}
              onClick={() => handleNavClick('/audit', 'audit')}
            >
              Audit Log
            </a>
          )}
        </nav>
      </div>

      <div className="navsec">
        <div className="label">System</div>
        <nav className="nav">
          {canAccessView('settings') && (
            <a
              className={isActive('/settings') ? 'active' : ''}
              onClick={() => handleNavClick('/settings', 'settings')}
            >
              Settings
            </a>
          )}
          <a onClick={logout}>Logout</a>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
