import React, { useState } from 'react';
import TopBar from '../components/TopBar';
import { useApp } from '../context/AppContext';
import { roleLabel, safeLower } from '../utils/database';

const UserPanel: React.FC = () => {
  const { db } = useApp();
  const [search, setSearch] = useState('');
  const [enabledFilter, setEnabledFilter] = useState('');

  const systemAdmins = db.users.filter((u: any) => u.role === 'SYSTEM_ADMIN');
  
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

  return (
    <>
      <TopBar 
        title="Master Admin Users" 
        subtitle="Users who can access the Master Admin Panel (no organization affiliation)." 
      />

      <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <h3 className="m-0 text-sm font-semibold">Master Admin Users</h3>
            <p className="text-xs text-rcn-muted mt-1 mb-0">
              Master Admin users belong only to this Admin Panel and have no affiliation with any organization.
            </p>
          </div>
          <button className={btnPrimaryClass}>+ New Master Admin User</button>
        </div>

        <div className="flex flex-wrap gap-2.5 items-end mt-3">
          <div className="flex flex-col gap-1.5 min-w-[280px] flex-1">
            <label className="text-xs text-rcn-muted">Search</label>
            <input
              placeholder="Name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={inputClass}
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

        <div className="overflow-auto mt-3">
          <table className="w-full border-separate border-spacing-0 overflow-hidden rounded-2xl border border-rcn-border">
            <thead>
              <tr>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Name</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Email</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Phone</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Role</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Access</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Reset</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">MFA</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Enabled</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-2.5 py-2.5 text-xs text-rcn-muted">No master admin users found.</td></tr>
              ) : (
                filtered.map((u: any) => (
                  <tr key={u.id}>
                    <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                      <b>{u.name}</b>
                      <div className="text-rcn-muted">{u.firstName} {u.lastName}</div>
                    </td>
                    <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top font-mono">{u.email}</td>
                    <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top font-mono">{u.phone || '—'}</td>
                    <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">{roleLabel(u.role)}</td>
                    <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                      {u.adminCap ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#b9e2c8] bg-[#f1fbf5] text-[#0b5d36]">Admin capabilities</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border border-rcn-border bg-[#f8fcf9]">Active user</span>
                      )}
                    </td>
                    <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">{u.resetIntervalDays || '—'} days</td>
                    <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                      {u.mfaEmail ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#b9e2c8] bg-[#f1fbf5] text-[#0b5d36]">On</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border border-rcn-border bg-[#f8fcf9]">Off</span>
                      )}
                    </td>
                    <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                      {u.enabled ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#b9e2c8] bg-[#f1fbf5] text-[#0b5d36]">Enabled</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#f3b8b8] bg-[#fff1f2] text-[#991b1b]">Disabled</span>
                      )}
                    </td>
                    <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                      <button className="border border-rcn-border bg-white px-2.5 py-2 rounded-xl text-xs font-semibold hover:border-[#c9ddd0]">Edit</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-rcn-muted mt-2.5 mb-0">
          Organization users are managed under <b>Organizations → Organization Modules → Users</b>.
        </p>
      </div>
    </>
  );
};

export default UserPanel;
