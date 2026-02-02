"use client";
import React, { useState } from 'react';
import { TableLayout, type TableColumn, Modal } from '../../../components';
import { toastSuccess, toastError } from '../../../utils/toast';
import { MOCK_SYSTEM_ADMINS } from './mockData';

const safeLower = (s: any) => (s || "").toString().toLowerCase();
const roleLabel = (r: string) => {
  if (r === "SYSTEM_ADMIN") return "System Admin";
  if (r === "ORG_ADMIN") return "Organization Admin";
  if (r === "STAFF") return "Staff";
  return r;
};

const uid = (prefix = "id") => {
  return prefix + "_" + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2);
};

const UserPanel: React.FC = () => {
  // Mock data state
  const [users, setUsers] = useState(MOCK_SYSTEM_ADMINS);

  const [search, setSearch] = useState('');
  const [enabledFilter, setEnabledFilter] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  const systemAdmins = users.filter((u: any) => u.role === 'SYSTEM_ADMIN');
  
  type MasterAdminRow = { id: string; name: string; firstName?: string; lastName?: string; email: string; phone?: string; role: string; adminCap?: boolean; resetIntervalDays?: number; mfaEmail?: boolean; enabled?: boolean };
  const systemAccessColumns: TableColumn<MasterAdminRow>[] = [
    {
      head: "Name",
      component: (u) => (
        <>
          <b>{u.name}</b>
          <div className="text-rcn-muted">{u.firstName} {u.lastName}</div>
        </>
      ),
    },
    { head: "Email", accessor: "email", tdClassName: "font-mono" },
    { head: "Phone", component: (u) => <span className="font-mono">{u.phone || '—'}</span> },
    { head: "Role", component: (u) => roleLabel(u.role) },
    {
      head: "Access",
      component: (u) =>
        u.adminCap ? (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#b9e2c8] bg-[#f1fbf5] text-[#0b5d36]">Admin capabilities</span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border border-rcn-border bg-[#f8fcf9]">Active user</span>
        ),
    },
    { head: "Reset", component: (u) => <>{u.resetIntervalDays || '—'} days</> },
    {
      head: "MFA",
      component: (u) =>
        u.mfaEmail ? (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#b9e2c8] bg-[#f1fbf5] text-[#0b5d36]">On</span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border border-rcn-border bg-[#f8fcf9]">Off</span>
        ),
    },
    {
      head: "Enabled",
      component: (u) =>
        u.enabled ? (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#b9e2c8] bg-[#f1fbf5] text-[#0b5d36]">Enabled</span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#f3b8b8] bg-[#fff1f2] text-[#991b1b]">Disabled</span>
        ),
    },
    {
      head: "",
      component: (u) => (
        <button
          type="button"
          onClick={() => openUserModal(u.id)}
          className="border border-rcn-border bg-white px-2.5 py-2 rounded-xl text-xs font-semibold hover:border-[#c9ddd0]"
        >
          Edit
        </button>
      ),
    },
  ];

  const filtered = systemAdmins.filter((u: any) => {
    const searchLower = safeLower(search);
    const hay = [u.name, u.firstName, u.lastName, u.email, u.phone, u.role, u.notes]
      .map(safeLower).join(' ');
    const okQ = !search || hay.includes(searchLower);
    const okEn = !enabledFilter || String(!!u.enabled) === enabledFilter;
    return okQ && okEn;
  });

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm outline-none focus:border-[#b9d7c5] focus:shadow-[0_0_0_3px_rgba(31,122,75,0.12)]";
  const btnClass = "border border-rcn-border bg-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-rcn-text text-sm hover:border-[#c9ddd0] transition-colors";
  const btnPrimaryClass = "bg-rcn-accent border-rcn-accent text-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-sm hover:bg-rcn-accent-dark transition-colors";

  const closeUserModal = () => {
    setActiveTab('profile');
    setIsUserModalOpen(false);
    setEditingUserId(null);
  };

  const openUserModal = (userId: string | null = null) => {
    setEditingUserId(userId ?? null);
    setActiveTab('profile');
    setIsUserModalOpen(true);
  };

  const user = editingUserId ? users.find((u: any) => u.id === editingUserId) : null;
  const isEdit = !!user;

  const handleSaveUser = (userId: string | null) => {
    const firstName = (document.getElementById('u_first') as HTMLInputElement)?.value.trim();
    const lastName = (document.getElementById('u_last') as HTMLInputElement)?.value.trim();
    const email = (document.getElementById('u_email') as HTMLInputElement)?.value.trim().toLowerCase();
    const phone = (document.getElementById('u_phone') as HTMLInputElement)?.value.trim();
    const adminCap = (document.getElementById('u_access') as HTMLSelectElement)?.value === 'ADMIN';
    const enabled = (document.getElementById('u_enabled') as HTMLSelectElement)?.value === 'true';
    const notes = (document.getElementById('u_notes') as HTMLTextAreaElement)?.value.trim();
    const resetIntervalDays = parseInt((document.getElementById('u_reset') as HTMLInputElement)?.value || '30', 10);
    const mfaEmail = (document.getElementById('u_mfa') as HTMLSelectElement)?.value === 'true';
    const forceChangeNextLogin = (document.getElementById('u_force') as HTMLInputElement)?.checked;
    const newPass = (document.getElementById('u_newpass') as HTMLInputElement)?.value;
    const confPass = (document.getElementById('u_confpass') as HTMLInputElement)?.value;

    if (!firstName) { toastError('First Name required.'); return; }
    if (!lastName) { toastError('Last Name required.'); return; }
    if (!email) { toastError('Email required.'); return; }
    if (!email.includes('@')) { toastError('Invalid email.'); return; }

    if (!userId && users.some((u: any) => u.email.toLowerCase() === email)) {
      toastError('Email already exists.');
      return;
    }

    const existing = userId ? users.find((u: any) => u.id === userId) : null;
    let password = existing?.password || 'Admin123!';
    let passwordChangedAt = existing?.passwordChangedAt || '';

    if (newPass || confPass) {
      if (newPass.length < 8) { toastError('Password must be at least 8 characters.'); return; }
      if (newPass !== confPass) { toastError('Passwords do not match.'); return; }
      password = newPass;
      passwordChangedAt = new Date().toISOString();
    }

    const permissions = {
      referralDashboard: (document.getElementById('perm_dashboard') as HTMLInputElement)?.checked ?? true,
      userPanel: (document.getElementById('perm_userpanel') as HTMLInputElement)?.checked ?? true,
      paymentAdjustmentSettings: (document.getElementById('perm_payments') as HTMLInputElement)?.checked ?? true,
      bannerManagement: (document.getElementById('perm_banners') as HTMLInputElement)?.checked ?? true,
      financials: (document.getElementById('perm_financials') as HTMLInputElement)?.checked ?? true,
      reports: (document.getElementById('perm_reports') as HTMLInputElement)?.checked ?? true,
      auditLog: (document.getElementById('perm_audit') as HTMLInputElement)?.checked ?? true,
      settings: (document.getElementById('perm_settings') as HTMLInputElement)?.checked ?? true,
    };

    const userObj: any = {
      id: userId || uid('u'),
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      email,
      phone,
      notes,
      role: 'SYSTEM_ADMIN',
      orgId: null,
      adminCap,
      enabled,
      resetIntervalDays,
      mfaEmail,
      password,
      passwordChangedAt,
      forceChangeNextLogin,
      permissions,
      branchIds: [],
      deptIds: [],
    };

    if (existing) {
      setUsers(users.map((u) => (u.id === userId ? userObj : u)));
    } else {
      setUsers([...users, userObj]);
    }

    closeUserModal();
    toastSuccess('User saved.');
  };

  const handleDeleteUser = (userId: string) => {
    if (!window.confirm('Delete this user?')) return;

    setUsers(users.filter((u: any) => u.id !== userId));
    closeUserModal();
    toastSuccess('User deleted.');
  };

  return (
    <>
      <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <h3 className="m-0 text-sm font-semibold">Master Admin Users</h3>
            <p className="text-xs text-rcn-muted mt-1 mb-0">
              Master Admin users belong only to this Admin Panel and have no affiliation with any organization.
            </p>
          </div>
          <button onClick={() => openUserModal()} className={btnPrimaryClass}>+ New Master Admin User</button>
        </div>

        <div className="flex flex-wrap gap-2.5 items-end mt-3">
          <div className="flex flex-col gap-1.5 min-w-[280px] flex-1">
            <label className="text-xs text-rcn-muted">Search</label>
            <input
              placeholder="Name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${inputClass} ring-2 ring-[#b9d7c5]/30 border-[#b9d7c5]/60`}
              aria-label="Search master admin users"
            />
          </div>

          <div className="flex flex-col gap-1.5 min-w-[120px]">
            <label className="text-xs text-rcn-muted">Status</label>
            <select value={enabledFilter} onChange={(e) => setEnabledFilter(e.target.value)} className={inputClass}>
              <option value="">All</option>
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 min-w-[120px]">
            <label className="text-xs text-rcn-muted opacity-0 pointer-events-none">-</label>
            <button className={btnClass} onClick={() => { setSearch(''); setEnabledFilter(''); }}>
              Clear
            </button>
          </div>
        </div>

        <div className="mt-3">
          <TableLayout<MasterAdminRow>
            columns={systemAccessColumns}
            data={filtered}
            variant="bordered"
            size="sm"
            emptyMessage="No master admin users found."
            getRowKey={(row) => row.id}
          />
        </div>

        <p className="text-xs text-rcn-muted mt-2.5 mb-0">
          Organization users are managed under <b>Organizations → Organization Modules → Users</b>.
        </p>
      </div>

      <Modal isOpen={isUserModalOpen} onClose={closeUserModal} maxWidth="900px">
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold m-0">{isEdit ? 'Edit' : 'New'} Master Admin User</h3>
              <p className="text-sm text-rcn-muted mt-1 mb-0">Master Admin users belong only to this Admin Panel and have no affiliation with any organization.</p>
            </div>
            <button onClick={closeUserModal} className={btnClass}>Close</button>
          </div>

          <div className="border-b border-rcn-border mb-4"></div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                activeTab === 'profile'
                  ? 'bg-rcn-accent text-white border border-rcn-accent'
                  : 'bg-[#f6fbf7] border border-rcn-border hover:border-[#b9d7c5]'
              }`}
            >
              User Profile
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                activeTab === 'password'
                  ? 'bg-rcn-accent text-white border border-rcn-accent'
                  : 'bg-[#f6fbf7] border border-rcn-border hover:border-[#b9d7c5]'
              }`}
            >
              Manage Password
            </button>
          </div>

          {activeTab === 'profile' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-rcn-muted font-semibold">First Name</label>
                    <input id="u_first" defaultValue={user?.firstName || ''} className={inputClass} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-rcn-muted font-semibold">Last Name</label>
                    <input id="u_last" defaultValue={user?.lastName || ''} className={inputClass} />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 mb-3">
                  <label className="text-xs text-rcn-muted font-semibold">Email</label>
                  <input id="u_email" type="email" defaultValue={user?.email || ''} className={inputClass} />
                </div>
                <div className="flex flex-col gap-1.5 mb-3">
                  <label className="text-xs text-rcn-muted font-semibold">Phone (optional)</label>
                  <input id="u_phone" defaultValue={user?.phone || ''} placeholder="(optional)" className={inputClass} />
                </div>
                <div className="flex flex-col gap-1.5 mb-3">
                  <label className="text-xs text-rcn-muted font-semibold">Role</label>
                  <input type="text" value="System Admin" readOnly className={inputClass} />
                </div>
                <div className="flex flex-col gap-1.5 mb-3">
                  <label className="text-xs text-rcn-muted font-semibold">Organization</label>
                  <input type="text" value="— (Master Admin only)" readOnly className={inputClass} />
                </div>
              </div>
              <div>
                <div className="flex flex-col gap-1.5 mb-3">
                  <label className="text-xs text-rcn-muted font-semibold">Access</label>
                  <select id="u_access" defaultValue={user?.adminCap ? 'ADMIN' : 'ACTIVE'} className={inputClass}>
                    <option value="ACTIVE">Active user</option>
                    <option value="ADMIN">Admin capabilities</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 mb-3">
                  <label className="text-xs text-rcn-muted font-semibold">Active user status</label>
                  <select id="u_enabled" defaultValue={String(user?.enabled ?? true)} className={inputClass}>
                    <option value="true">Active</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
                <div className="bg-[#fbfefc] border border-rcn-border rounded-xl p-3 mb-3">
                  <h4 className="text-sm font-semibold m-0 mb-2">Module Access</h4>
                  <p className="text-xs text-rcn-muted mb-3">Control which Admin Panel modules this user can access.</p>
                  <div className="flex flex-wrap gap-2">
                    <label className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs border border-rcn-border bg-white hover:border-[#b9d7c5] cursor-pointer">
                      <input type="checkbox" id="perm_dashboard" defaultChecked={user?.permissions?.referralDashboard ?? true} />
                      Referral Dashboard
                    </label>
                    <label className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs border border-rcn-border bg-white hover:border-[#b9d7c5] cursor-pointer">
                      <input type="checkbox" id="perm_userpanel" defaultChecked={user?.permissions?.userPanel ?? true} />
                      User Panel
                    </label>
                    <label className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs border border-rcn-border bg-white hover:border-[#b9d7c5] cursor-pointer">
                      <input type="checkbox" id="perm_payments" defaultChecked={user?.permissions?.paymentAdjustmentSettings ?? true} />
                      Payment Settings
                    </label>
                    <label className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs border border-rcn-border bg-white hover:border-[#b9d7c5] cursor-pointer">
                      <input type="checkbox" id="perm_banners" defaultChecked={user?.permissions?.bannerManagement ?? true} />
                      Banner Management
                    </label>
                    <label className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs border border-rcn-border bg-white hover:border-[#b9d7c5] cursor-pointer">
                      <input type="checkbox" id="perm_financials" defaultChecked={user?.permissions?.financials ?? true} />
                      Financials
                    </label>
                    <label className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs border border-rcn-border bg-white hover:border-[#b9d7c5] cursor-pointer">
                      <input type="checkbox" id="perm_reports" defaultChecked={user?.permissions?.reports ?? true} />
                      Reports
                    </label>
                    <label className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs border border-rcn-border bg-white hover:border-[#b9d7c5] cursor-pointer">
                      <input type="checkbox" id="perm_audit" defaultChecked={user?.permissions?.auditLog ?? true} />
                      Audit Log
                    </label>
                    <label className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs border border-rcn-border bg-white hover:border-[#b9d7c5] cursor-pointer">
                      <input type="checkbox" id="perm_settings" defaultChecked={user?.permissions?.settings ?? true} />
                      Settings
                    </label>
                  </div>
                  <div className="border-t border-rcn-border my-2"></div>
                  <p className="text-xs text-rcn-muted m-0">Tip: Enable User Panel only if this Master Admin should manage other Master Admin users.</p>
                </div>
                <div className="flex flex-col gap-1.5 mb-3">
                  <label className="text-xs text-rcn-muted font-semibold">Notes (optional)</label>
                  <textarea id="u_notes" defaultValue={user?.notes || ''} placeholder="Optional notes..." rows={3} className={inputClass} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-rcn-muted font-semibold">Current Assignments (read-only)</label>
                  <textarea value="Branches: —\nDepartments: —" readOnly rows={2} className={inputClass} />
                </div>
                <p className="text-xs text-rcn-muted mt-2 mb-0">Master Admin users are not attached to branches/departments.</p>
              </div>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex flex-col gap-1.5 mb-3">
                  <label className="text-xs text-rcn-muted font-semibold">New Password</label>
                  <input
                    id="u_newpass"
                    type="password"
                    placeholder={user ? 'Leave blank to keep current password' : 'Default is Admin123!'}
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1.5 mb-3">
                  <label className="text-xs text-rcn-muted font-semibold">Confirm Password</label>
                  <input id="u_confpass" type="password" placeholder="Confirm new password" className={inputClass} />
                </div>
                <label className="inline-flex items-center gap-2 mt-2 cursor-pointer">
                  <input type="checkbox" id="u_force" defaultChecked={user?.forceChangeNextLogin ?? !user} />
                  <span className="text-sm">Force change at next login</span>
                </label>
                <p className="text-xs text-rcn-muted mt-3 mb-0">Passwords are stored locally in your browser for demo purposes only.</p>
              </div>
              <div>
                <div className="flex flex-col gap-1.5 mb-3">
                  <label className="text-xs text-rcn-muted font-semibold">Password Reset Interval (days)</label>
                  <input id="u_reset" type="number" min={1} step={1} defaultValue={user?.resetIntervalDays || 30} className={inputClass} />
                </div>
                <div className="flex flex-col gap-1.5 mb-3">
                  <label className="text-xs text-rcn-muted font-semibold">Email Multi-Factor Authentication (MFA)</label>
                  <select id="u_mfa" defaultValue={String(user?.mfaEmail ?? false)} className={inputClass}>
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 mb-3">
                  <label className="text-xs text-rcn-muted font-semibold">Last Password Change</label>
                  <input type="text" readOnly value={user?.passwordChangedAt || '—'} className={inputClass} />
                </div>
                <p className="text-xs text-rcn-muted mt-3 mb-0">To set a password for a new user, enter it above and Save (or keep default).</p>
              </div>
            </div>
          )}

          <div className="border-t border-rcn-border my-4"></div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-rcn-muted m-0">Changes apply immediately.</p>
            <div className="flex gap-2">
              {isEdit && editingUserId && (
                <button
                  onClick={() => handleDeleteUser(editingUserId)}
                  className="bg-white border border-[#f0c0c0] text-rcn-danger px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-sm hover:bg-[#fff1f2] transition-colors"
                >
                  Delete
                </button>
              )}
              <button onClick={() => handleSaveUser(editingUserId)} className={btnPrimaryClass}>
                Save
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default UserPanel;
