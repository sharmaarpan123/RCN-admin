import React, { useState } from 'react';
import TopBar from '../../components/TopBar';
import { useApp } from '../../context/AppContext';
import { safeLower } from '../../utils/database';

const Banners: React.FC = () => {
  const { db, showToast } = useApp();
  
  // Filter states
  const [search, setSearch] = useState('');
  const [placementFilter, setPlacementFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [scopeFilter, setScopeFilter] = useState('');
  const [orgFilter, setOrgFilter] = useState('');
  
  // Preview state
  const [previewPlacement, setPreviewPlacement] = useState('RIGHT_SIDEBAR');

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm outline-none focus:border-[#b9d7c5] focus:shadow-[0_0_0_3px_rgba(31,122,75,0.12)]";
  const btnClass = "border border-rcn-border bg-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-rcn-text text-sm hover:border-[#c9ddd0] transition-colors";
  const btnPrimaryClass = "bg-rcn-accent border-rcn-accent text-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-sm hover:bg-rcn-accent-dark transition-colors";

  const placementLabel = (p: string) => {
    const labels: Record<string, string> = {
      RIGHT_SIDEBAR: 'Right Sidebar',
      HEADER_STRIP: 'Header Strip',
      LOGIN_RIGHT: 'Login Right',
    };
    return labels[p] || p;
  };

  const isInDateRange = (banner: any) => {
    const now = new Date();
    if (banner.startAt) {
      const start = new Date(banner.startAt);
      if (now < start) return false;
    }
    if (banner.endAt) {
      const end = new Date(banner.endAt);
      if (now > end) return false;
    }
    return true;
  };

  const filtered = (db.banners || []).filter((b: any) => {
    const searchLower = safeLower(search);
    const hay = safeLower((b.name || '') + ' ' + (b.linkUrl || ''));
    if (search && !hay.includes(searchLower)) return false;
    
    if (placementFilter && b.placement !== placementFilter) return false;
    if (statusFilter === 'active' && !b.active) return false;
    if (statusFilter === 'inactive' && b.active) return false;
    if (scopeFilter && b.scope !== scopeFilter) return false;
    if (orgFilter) {
      if (b.scope !== 'ORG') return false;
      if (b.orgId !== orgFilter) return false;
    }
    
    return true;
  });

  const previewBanners = (db.banners || []).filter((b: any) => {
    if (!b.active) return false;
    if (!isInDateRange(b)) return false;
    if (b.placement !== previewPlacement) return false;
    
    if (b.scope === 'GLOBAL') return true;
    if (b.scope === 'ORG' && orgFilter && b.orgId === orgFilter) return true;
    
    return false;
  });

  return (
    <>
      <TopBar 
        title="Banner Management" 
        subtitle="Create and manage advertising banners used across the portal." 
      />

      <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-semibold m-0 mb-1">Banner Management</h3>
            <p className="text-xs text-rcn-muted m-0">
              Create and manage advertising banners. Banners can be Global (all organizations) or scoped to a specific organization.
            </p>
          </div>
          <button 
            className={btnPrimaryClass}
            onClick={() => showToast('Banner creation not implemented in this demo')}
          >
            + New Banner
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-rcn-muted">Search (Name / Link)</label>
            <input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-rcn-muted">Placement</label>
            <select value={placementFilter} onChange={(e) => setPlacementFilter(e.target.value)} className={inputClass}>
              <option value="">All Placements</option>
              <option value="RIGHT_SIDEBAR">Right Sidebar</option>
              <option value="HEADER_STRIP">Header Strip</option>
              <option value="LOGIN_RIGHT">Login Right</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-rcn-muted">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputClass}>
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-rcn-muted">Scope</label>
            <select value={scopeFilter} onChange={(e) => setScopeFilter(e.target.value)} className={inputClass}>
              <option value="">All Scopes</option>
              <option value="GLOBAL">Global</option>
              <option value="ORG">Organization-specific</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-rcn-muted">Organization (if scoped)</label>
            <select value={orgFilter} onChange={(e) => setOrgFilter(e.target.value)} className={inputClass}>
              <option value="">— Select Organization —</option>
              {(db.orgs || []).map((o: any) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.address?.state} {o.address?.zip})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="h-px bg-rcn-border my-3.5"></div>

        {/* Banner Table */}
        <div className="overflow-auto">
          <table className="w-full border-separate border-spacing-0 overflow-hidden rounded-2xl border border-rcn-border">
            <thead>
              <tr>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Name / Link</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Placement</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Scope</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Status</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Date Range</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-right align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-2.5 py-2.5 text-xs text-rcn-muted">No banners found.</td></tr>
              ) : (
                filtered.map((b: any) => {
                  const org = b.orgId ? db.orgs?.find((o: any) => o.id === b.orgId) : null;
                  const inRange = isInDateRange(b);
                  return (
                    <tr key={b.id}>
                      <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                        <div><strong>{b.name}</strong></div>
                        <div className="text-rcn-muted text-xs break-all">{b.linkUrl || '—'}</div>
                      </td>
                      <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                        {placementLabel(b.placement)}
                      </td>
                      <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                        {b.scope === 'GLOBAL' ? 'Global' : 'Organization'}
                        {b.scope === 'ORG' && org && (
                          <div className="text-rcn-muted text-xs">
                            {org.name} ({org.address?.state} {org.address?.zip})
                          </div>
                        )}
                      </td>
                      <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                        {b.active ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#b9e2c8] bg-[#f1fbf5] text-[#0b5d36]">Active</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#f3d9a1] bg-[#fff8e6] text-[#7a4a00]">Inactive</span>
                        )}
                        {!inRange && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#f3d9a1] bg-[#fff8e6] text-[#7a4a00] ml-1" title="Outside date range">
                            Out of range
                          </span>
                        )}
                      </td>
                      <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                        {b.startAt ? new Date(b.startAt).toLocaleDateString() : '—'} → {b.endAt ? new Date(b.endAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top text-right">
                        <div className="flex gap-1 justify-end">
                          <button 
                            onClick={() => showToast('Preview functionality not implemented')}
                            className="border border-rcn-border bg-white px-2.5 py-2 rounded-xl text-xs font-semibold hover:border-[#c9ddd0]"
                          >
                            Preview
                          </button>
                          <button 
                            onClick={() => showToast('Edit functionality not implemented')}
                            className="border border-rcn-border bg-white px-2.5 py-2 rounded-xl text-xs font-semibold hover:border-[#c9ddd0]"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => showToast('Delete functionality not implemented')}
                            className="bg-white border border-[#f0c0c0] text-rcn-danger px-2.5 py-2 rounded-xl text-xs font-semibold hover:bg-[#fff1f2]"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Preview and Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 mt-3.5">
        {/* Live Preview */}
        <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
          <h3 className="text-sm font-semibold m-0 mb-2">Live Preview</h3>
          <p className="text-xs text-rcn-muted m-0 mb-3">
            Preview uses the selected Organization filter (if any) and the placement buttons below.
          </p>

          <div className="flex flex-wrap gap-2 mb-3">
            <button 
              onClick={() => setPreviewPlacement('RIGHT_SIDEBAR')}
              className={previewPlacement === 'RIGHT_SIDEBAR' ? btnPrimaryClass : btnClass}
            >
              Right Sidebar
            </button>
            <button 
              onClick={() => setPreviewPlacement('HEADER_STRIP')}
              className={previewPlacement === 'HEADER_STRIP' ? btnPrimaryClass : btnClass}
            >
              Header Strip
            </button>
            <button 
              onClick={() => setPreviewPlacement('LOGIN_RIGHT')}
              className={previewPlacement === 'LOGIN_RIGHT' ? btnPrimaryClass : btnClass}
            >
              Login Right
            </button>
          </div>

          <div className="h-px bg-rcn-border my-3"></div>

          <div className="min-h-[160px]">
            {previewBanners.length === 0 ? (
              <p className="text-xs text-rcn-muted m-0">No active banners match the current preview filters.</p>
            ) : (
              <div className="space-y-3">
                {previewBanners.slice(0, 3).map((b: any) => {
                  const org = b.orgId ? db.orgs?.find((o: any) => o.id === b.orgId) : null;
                  return (
                    <div key={b.id} className="bg-white border border-rcn-border rounded-xl p-3">
                      <div className="text-xs text-rcn-muted mb-2">
                        {b.name} • {b.scope === 'GLOBAL' ? 'Global' : `${org?.name || 'Organization'}`}
                      </div>
                      {b.imageData || b.imageUrl ? (
                        <a 
                          href={b.linkUrl || '#'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <img 
                            src={b.imageData || b.imageUrl} 
                            alt={b.alt || b.name} 
                            className="w-full rounded-xl"
                            style={{ maxWidth: previewPlacement === 'RIGHT_SIDEBAR' ? '320px' : '100%' }}
                          />
                        </a>
                      ) : (
                        <div className="bg-rcn-bg border border-rcn-border rounded-xl p-4 text-center text-xs text-rcn-muted">
                          No image
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
          <h3 className="text-sm font-semibold m-0 mb-2">Notes</h3>
          <p className="text-xs text-rcn-muted m-0 mb-3">
            Banners are stored in the same local database as referrals and organizations, so they can be used across the portal automatically.
          </p>

          <div className="h-px bg-rcn-border my-3"></div>

          <ul className="text-xs text-rcn-text space-y-2 m-0 pl-4">
            <li>
              <strong>Global</strong> banners apply to all organizations.
            </li>
            <li>
              <strong>Organization-specific</strong> banners apply only to that organization.
            </li>
            <li>
              Start/End dates are optional; active banners outside the date range will <strong>not</strong> render.
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Banners;
