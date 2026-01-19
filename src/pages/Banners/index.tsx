import React, { useState } from 'react';
import TopBar from '../../components/TopBar';
import { useApp } from '../../context/AppContext';
import { safeLower } from '../../utils/database';

const Banners: React.FC = () => {
  const { db, showToast } = useApp();
  const [search, setSearch] = useState('');

  const filtered = (db.banners || []).filter((b: any) => {
    const searchLower = safeLower(search);
    const hay = safeLower((b.name || '') + ' ' + (b.linkUrl || ''));
    return !search || hay.includes(searchLower);
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
            className="bg-rcn-accent border-rcn-accent text-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-sm hover:bg-rcn-accent-dark transition-colors"
            onClick={() => showToast('Banner creation not implemented in this demo')}
          >
            + New Banner
          </button>
        </div>

        <div className="flex flex-col gap-1.5 mt-3 max-w-md">
          <label className="text-xs text-rcn-muted">Search (Name / Link)</label>
          <input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm outline-none focus:border-[#b9d7c5] focus:shadow-[0_0_0_3px_rgba(31,122,75,0.12)]"
          />
        </div>

        <div className="h-px bg-rcn-border my-3.5"></div>

        <div className="overflow-auto">
          <table className="w-full border-separate border-spacing-0 overflow-hidden rounded-2xl border border-rcn-border">
            <thead>
              <tr>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Name / Link</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Placement</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Scope</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Status</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-right align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-2.5 py-2.5 text-xs text-rcn-muted">No banners found.</td></tr>
              ) : (
                filtered.map((b: any) => (
                  <tr key={b.id}>
                    <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                      <div><strong>{b.name}</strong></div>
                      <div className="text-rcn-muted text-xs break-all">{b.linkUrl || '—'}</div>
                    </td>
                    <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">{b.placement || '—'}</td>
                    <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">{b.scope || 'GLOBAL'}</td>
                    <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                      {b.active ? (
                        <span className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-white/15 text-rcn-dark-text border-[#b9e2c8] bg-[#f1fbf5] text-[#0b5d36]">Active</span>
                      ) : (
                        <span className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-white/15 text-rcn-dark-text border-[#f3d9a1] bg-[#fff8e6] text-[#7a4a00]">Inactive</span>
                      )}
                    </td>
                    <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top text-right">
                      <div className="flex gap-1 justify-end">
                        <button className="border border-rcn-border bg-white px-2.5 py-2 rounded-xl text-xs font-semibold hover:border-[#c9ddd0]">Edit</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Banners;
