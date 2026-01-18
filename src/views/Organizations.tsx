import React, { useState } from 'react';
import TopBar from '../components/TopBar';
import { useApp } from '../context/AppContext';
import { US_STATES, safeLower, escapeHtml } from '../utils/database';

const Organizations: React.FC = () => {
  const { db, refreshDB } = useApp();
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [zipFilter, setZipFilter] = useState('');

  const filteredOrgs = db.orgs.filter((o: any) => {
    const searchLower = safeLower(search);
    const hay = [
      o.name, o.phone, o.email,
      o.address.street, o.address.suite, o.address.city, o.address.state, o.address.zip
    ].map(safeLower).join(' ');
    
    return (
      (!search || hay.includes(searchLower)) &&
      (!stateFilter || o.address.state === stateFilter) &&
      (!zipFilter || safeLower(o.address.zip).includes(safeLower(zipFilter)))
    );
  });

  return (
    <>
      <TopBar 
        title="Organizations" 
        subtitle="Create and manage organizations and their internal modules." 
      />

      <div className="card">
        <div className="flex space">
          <div>
            <h3 style={{ margin: 0 }}>Organizations</h3>
            <p className="hint">Manage organizations and their address info (state + zip included).</p>
          </div>
          <button className="btn primary">+ New Organization</button>
        </div>

        <div className="toolbar" style={{ marginTop: '12px' }}>
          <div className="field" style={{ minWidth: '260px' }}>
            <label>Search (Name or Location)</label>
            <input
              placeholder="Name, street, city, state, zip"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="field small">
            <label>State</label>
            <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
              {US_STATES.map(s => <option key={s} value={s}>{s === '' ? 'All' : s}</option>)}
            </select>
          </div>
          <div className="field small">
            <label>Zip</label>
            <input
              placeholder="Zip"
              value={zipFilter}
              onChange={(e) => setZipFilter(e.target.value)}
            />
          </div>
        </div>

        <div style={{ overflow: 'auto', marginTop: '12px' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>State</th>
                <th>Zip</th>
                <th>City</th>
                <th>Street</th>
                <th>Enabled</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrgs.length === 0 ? (
                <tr><td colSpan={7} className="muted">No organizations found.</td></tr>
              ) : (
                filteredOrgs.map((o: any) => (
                  <tr key={o.id}>
                    <td>
                      <b>{o.name}</b>
                      <div className="muted">{o.email}</div>
                    </td>
                    <td>{o.address.state}</td>
                    <td className="mono">{o.address.zip}</td>
                    <td>{o.address.city}</td>
                    <td>{o.address.street}</td>
                    <td>
                      {o.enabled ? (
                        <span className="tag ok">Enabled</span>
                      ) : (
                        <span className="tag bad">Disabled</span>
                      )}
                    </td>
                    <td>
                      <div className="flex" style={{ gap: '8px' }}>
                        <button className="btn small">Manage</button>
                        <button className="btn small">Edit</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: '14px' }}>
        <div className="flex space" style={{ alignItems: 'flex-end' }}>
          <div>
            <h3 style={{ margin: 0 }}>Organization Modules</h3>
            <p className="hint">Branches, Departments, and Users are managed inside the selected Organization.</p>
          </div>
          <div className="field" style={{ minWidth: '360px', margin: 0 }}>
            <label>Select Organization</label>
            <select>
              <option value="">— Select Organization —</option>
              {db.orgs.map((o: any) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="hr"></div>

        <div className="muted" style={{ fontSize: '12px' }}>
          Select an organization to manage branches, departments, and users.
        </div>

        <div className="subtabs" style={{ marginTop: '12px' }}>
          <button className="active">Organization</button>
          <button>Branches</button>
          <button>Departments</button>
          <button>Users</button>
        </div>

        <div className="subtabPanel active">
          <div className="muted" style={{ padding: '20px', textAlign: 'center' }}>
            Select an organization above to view details.
          </div>
        </div>
      </div>
    </>
  );
};

export default Organizations;
