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

  return (
    <>
      <TopBar 
        title="Master Admin Users" 
        subtitle="Users who can access the Master Admin Panel (no organization affiliation)." 
      />

      <div className="card">
        <div className="flex space">
          <div>
            <h3 style={{ margin: 0 }}>Master Admin Users</h3>
            <p className="hint">
              Master Admin users belong only to this Admin Panel and have no affiliation with any organization.
            </p>
          </div>
          <button className="btn primary">+ New Master Admin User</button>
        </div>

        <div className="toolbar" style={{ marginTop: '12px' }}>
          <div className="field" style={{ minWidth: '280px' }}>
            <label>Search</label>
            <input
              placeholder="Name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="field small">
            <label>Status</label>
            <select value={enabledFilter} onChange={(e) => setEnabledFilter(e.target.value)}>
              <option value="">All</option>
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </div>

          <div className="field small">
            <label>&nbsp;</label>
            <button className="btn" onClick={() => { setSearch(''); setEnabledFilter(''); }}>
              Clear
            </button>
          </div>
        </div>

        <div style={{ overflow: 'auto', marginTop: '12px' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Access</th>
                <th>Reset</th>
                <th>MFA</th>
                <th>Enabled</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="muted">No master admin users found.</td></tr>
              ) : (
                filtered.map((u: any) => (
                  <tr key={u.id}>
                    <td>
                      <b>{u.name}</b>
                      <div className="muted">{u.firstName} {u.lastName}</div>
                    </td>
                    <td className="mono">{u.email}</td>
                    <td className="mono">{u.phone || '—'}</td>
                    <td>{roleLabel(u.role)}</td>
                    <td>
                      {u.adminCap ? (
                        <span className="tag ok">Admin capabilities</span>
                      ) : (
                        <span className="tag">Active user</span>
                      )}
                    </td>
                    <td>{u.resetIntervalDays || '—'} days</td>
                    <td>
                      {u.mfaEmail ? (
                        <span className="tag ok">On</span>
                      ) : (
                        <span className="tag">Off</span>
                      )}
                    </td>
                    <td>
                      {u.enabled ? (
                        <span className="tag ok">Enabled</span>
                      ) : (
                        <span className="tag bad">Disabled</span>
                      )}
                    </td>
                    <td>
                      <button className="btn small">Edit</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="hint" style={{ marginTop: '10px' }}>
          Organization users are managed under <b>Organizations → Organization Modules → Users</b>.
        </p>
      </div>
    </>
  );
};

export default UserPanel;
