import React, { useState } from 'react';
import TopBar from '../components/TopBar';
import { useApp } from '../context/AppContext';
import { US_STATES, safeLower } from '../utils/database';

const Organizations: React.FC = () => {
  const { db } = useApp();
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

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm outline-none focus:border-[#b9d7c5] focus:shadow-[0_0_0_3px_rgba(31,122,75,0.12)]";
  const btnClass = "border border-rcn-border bg-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-rcn-text text-sm hover:border-[#c9ddd0] transition-colors";
  const btnPrimaryClass = "bg-rcn-accent border-rcn-accent text-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-sm hover:bg-rcn-accent-dark transition-colors";

  return (
    <>
      <TopBar 
        title="Organizations" 
        subtitle="Create and manage organizations and their internal modules." 
      />

      <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <h3 className="m-0 text-sm font-semibold">Organizations</h3>
            <p className="text-xs text-rcn-muted mt-1 mb-0">Manage organizations and their address info (state + zip included).</p>
          </div>
          <button className={btnPrimaryClass}>+ New Organization</button>
        </div>

        <div className="flex flex-wrap gap-2.5 items-end mt-3">
          <div className="flex flex-col gap-1.5 min-w-[260px] flex-1">
            <label className="text-xs text-rcn-muted">Search (Name or Location)</label>
            <input
              placeholder="Name, street, city, state, zip"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5 min-w-[120px]">
            <label className="text-xs text-rcn-muted">State</label>
            <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className={inputClass}>
              {US_STATES.map(s => <option key={s} value={s}>{s === '' ? 'All' : s}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 min-w-[120px]">
            <label className="text-xs text-rcn-muted">Zip</label>
            <input
              placeholder="Zip"
              value={zipFilter}
              onChange={(e) => setZipFilter(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="overflow-auto mt-3">
          <table className="w-full border-separate border-spacing-0 overflow-hidden rounded-2xl border border-rcn-border">
            <thead>
              <tr>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Name</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">State</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Zip</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">City</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Street</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Enabled</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrgs.length === 0 ? (
                <tr><td colSpan={7} className="px-2.5 py-2.5 text-xs text-rcn-muted">No organizations found.</td></tr>
              ) : (
                filteredOrgs.map((o: any) => (
                  <tr key={o.id}>
                    <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                      <b>{o.name}</b>
                      <div className="text-rcn-muted">{o.email}</div>
                    </td>
                    <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">{o.address.state}</td>
                    <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top font-mono">{o.address.zip}</td>
                    <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">{o.address.city}</td>
                    <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">{o.address.street}</td>
                    <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                      {o.enabled ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#b9e2c8] bg-[#f1fbf5] text-[#0b5d36]">Enabled</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#f3b8b8] bg-[#fff1f2] text-[#991b1b]">Disabled</span>
                      )}
                    </td>
                    <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                      <div className="flex gap-2">
                        <button className="border border-rcn-border bg-white px-2.5 py-2 rounded-xl text-xs font-semibold hover:border-[#c9ddd0]">Manage</button>
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

export default Organizations;
