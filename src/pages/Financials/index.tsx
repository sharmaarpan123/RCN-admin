import React from 'react';
import TopBar from '../../components/TopBar';
import { useApp } from '../../context/AppContext';
import { centsToMoney } from '../../utils/database';

const Financials: React.FC = () => {
  const { db } = useApp();

  const totalReferrals = db.referrals.length;
  const grossCents = 0; // Simplified for demo
  const bonusCents = 0;
  const netCents = grossCents - bonusCents;

  return (
    <>
      <TopBar 
        title="Financials" 
        subtitle="Total referrals, referrals by organization/state, and income summary." 
      />

      <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <h3 className="m-0 text-sm font-semibold">Financials</h3>
            <p className="text-xs text-rcn-muted mt-1 mb-0">Totals for referrals and income across the network (demo).</p>
          </div>
          <button className="border border-rcn-border bg-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-rcn-text text-sm hover:border-[#c9ddd0] transition-colors">
            Refresh
          </button>
        </div>

        <div className="h-px bg-rcn-border my-3.5"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="bg-white border border-rcn-border rounded-2xl shadow-none p-4" style={{background: 'rgba(255,255,255,0.55)'}}>
            <div className="text-rcn-muted text-xs">Total referrals</div>
            <div className="text-3xl font-extrabold mt-1">{totalReferrals}</div>
            <div className="text-xs text-rcn-muted mt-1">All referrals created in the system.</div>
          </div>

          <div className="bg-white border border-rcn-border rounded-2xl shadow-none p-4" style={{background: 'rgba(255,255,255,0.55)'}}>
            <div className="text-rcn-muted text-xs">Total income (net)</div>
            <div className="text-3xl font-extrabold mt-1">${centsToMoney(netCents)}</div>
            <div className="text-xs text-rcn-muted mt-1">Gross collected minus bonuses paid.</div>
          </div>
        </div>

        <div className="h-2.5"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="bg-white border border-rcn-border rounded-2xl shadow-none p-4" style={{background: 'rgba(255,255,255,0.55)'}}>
            <div className="text-rcn-muted text-xs">Gross collected</div>
            <div className="text-2xl font-extrabold mt-1">${centsToMoney(grossCents)}</div>
            <div className="text-xs text-rcn-muted mt-1">Fees + credit purchases recorded in the ledger.</div>
          </div>

          <div className="bg-white border border-rcn-border rounded-2xl shadow-none p-4" style={{background: 'rgba(255,255,255,0.55)'}}>
            <div className="text-rcn-muted text-xs">Bonuses paid out</div>
            <div className="text-2xl font-extrabold mt-1">${centsToMoney(bonusCents)}</div>
            <div className="text-xs text-rcn-muted mt-1">Sender bonuses from receiver-paid referrals.</div>
          </div>
        </div>

        <div className="h-px bg-rcn-border my-3.5"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          <div className="bg-white border border-rcn-border rounded-2xl shadow-none p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="m-0 text-sm font-semibold">Referrals by organization</h3>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border border-rcn-border bg-[#f8fcf9]">Sent vs received</span>
            </div>
            <div className="overflow-auto">
              <table className="w-full border-separate border-spacing-0 overflow-hidden rounded-2xl border border-rcn-border">
                <thead>
                  <tr>
                    <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Organization</th>
                    <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">State</th>
                    <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Sent</th>
                    <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Received</th>
                    <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {db.orgs.map((org: any) => {
                    const sent = db.referrals.filter((r: any) => r.senderOrgId === org.id).length;
                    const received = db.referrals.filter((r: any) => r.receiverOrgId === org.id).length;
                    return (
                      <tr key={org.id}>
                        <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                          <b>{org.name}</b> <span className="text-rcn-muted font-mono text-xs">({org.id})</span>
                        </td>
                        <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top font-mono">{org.address.state}</td>
                        <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top font-mono">{sent}</td>
                        <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top font-mono">{received}</td>
                        <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top font-mono"><b>{sent + received}</b></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-rcn-border rounded-2xl shadow-none p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="m-0 text-sm font-semibold">Referrals by state</h3>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border border-rcn-border bg-[#f8fcf9]">Sender & receiver</span>
            </div>
            <div className="text-xs text-rcn-muted mt-2">
              Counts are based on the sender/receiver organization state.
            </div>
            <div className="mt-2.5 text-xs text-rcn-muted">
              Stats by state coming soon in full implementation.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Financials;
