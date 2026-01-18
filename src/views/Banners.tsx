import React, { useState } from 'react';
import TopBar from '../components/TopBar';
import { useApp } from '../context/AppContext';
import { safeLower } from '../utils/database';

const Banners: React.FC = () => {
  const { db, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [placementFilter, setPlacementFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [scopeFilter, setScopeFilter] = useState('');

  const filtered = (db.banners || []).filter((b: any) => {
    const searchLower = safeLower(search);
    const hay = safeLower((b.name || '') + ' ' + (b.linkUrl || '') + ' ' + (b.imageUrl || ''));
    
    return (
      (!search || hay.includes(searchLower)) &&
      (!placementFilter || b.placement === placementFilter) &&
      (!statusFilter || (statusFilter === 'active' ? b.active : !b.active)) &&
      (!scopeFilter || b.scope === scopeFilter)
    );
  });

  return (
    <>
      <TopBar 
        title="Banner Management" 
        subtitle="Create and manage advertising banners used across the portal." 
      />

      <div className="card">
        <div className="split">
          <div>
            <h3>Banner Management</h3>
            <p className="hint">
              Create and manage advertising banners. Banners can be Global (all organizations) or scoped to a specific organization.
            </p>
          </div>
          <button className="btn primary" onClick={() => showToast('Banner creation not implemented in this demo')}>
            + New Banner
          </button>
        </div>

        <div className="grid3" style={{ marginTop: '12px' }}>
          <div className="field">
            <label>Search (Name / Link)</label>
            <input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Placement</label>
            <select value={placementFilter} onChange={(e) => setPlacementFilter(e.target.value)}>
              <option value="">All Placements</option>
              <option value="RIGHT_SIDEBAR">Right Sidebar</option>
              <option value="HEADER_STRIP">Header Strip</option>
              <option value="LOGIN_RIGHT">Login Right</option>
            </select>
          </div>
          <div className="field">
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="grid2" style={{ marginTop: '10px' }}>
          <div className="field">
            <label>Scope</label>
            <select value={scopeFilter} onChange={(e) => setScopeFilter(e.target.value)}>
              <option value="">All Scopes</option>
              <option value="GLOBAL">Global</option>
              <option value="ORG">Organization-specific</option>
            </select>
          </div>
          <div className="field">
            <label>Organization (if scoped)</label>
            <select>
              <option value="">All Organizations</option>
              {db.orgs.map((o: any) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="hr"></div>

        <div style={{ overflow: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Name / Link</th>
                <th>Placement</th>
                <th>Scope</th>
                <th>Status</th>
                <th>Date Range</th>
                <th className="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="muted">No banners found.</td></tr>
              ) : (
                filtered.map((b: any) => (
                  <tr key={b.id}>
                    <td>
                      <div><strong>{b.name}</strong></div>
                      <div className="muted" style={{ fontSize: '12px', overflowWrap: 'anywhere' }}>
                        {b.linkUrl || '—'}
                      </div>
                    </td>
                    <td>{b.placement || '—'}</td>
                    <td>{b.scope || 'GLOBAL'}</td>
                    <td>
                      {b.active ? (
                        <span className="pill ok">Active</span>
                      ) : (
                        <span className="pill warn">Inactive</span>
                      )}
                    </td>
                    <td>
                      {b.startAt ? b.startAt.slice(0, 10) : '—'} → {b.endAt ? b.endAt.slice(0, 10) : '—'}
                    </td>
                    <td className="right">
                      <button className="btn small">Preview</button>
                      <button className="btn small">Edit</button>
                      <button className="btn danger small">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid2" style={{ marginTop: '14px' }}>
        <div className="card">
          <h3>Live Preview</h3>
          <p className="hint">Preview uses the selected Organization filter (if any) and the placement buttons.</p>
          <div className="pillRow" style={{ marginTop: '8px' }}>
            <button className="btn">Right Sidebar</button>
            <button className="btn">Header Strip</button>
            <button className="btn">Login Right</button>
          </div>
          <div className="hr"></div>
          <div style={{ minHeight: '160px' }}>
            <div className="muted">No preview available</div>
          </div>
        </div>
        <div className="card">
          <h3>Notes</h3>
          <p className="hint">
            Banners are stored in the same local database as referrals and organizations, 
            so they can be used across the portal automatically.
          </p>
          <div className="hr"></div>
          <ul style={{ margin: 0, paddingLeft: '18px' }}>
            <li><strong>Global</strong> banners apply to all organizations.</li>
            <li><strong>Organization-specific</strong> banners apply only to that organization.</li>
            <li>Start/End dates are optional; active banners outside the date range will not render.</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Banners;
