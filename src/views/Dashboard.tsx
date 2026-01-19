import React, { useState } from 'react';
import TopBar from '../components/TopBar';
import { useApp } from '../context/AppContext';
import { US_STATES, fmtDate, safeLower } from '../utils/database';

const Dashboard: React.FC = () => {
  const { db } = useApp();
  const [senderFilterName, setSenderFilterName] = useState('');
  const [senderFilterState, setSenderFilterState] = useState('');
  const [senderFilterZip, setSenderFilterZip] = useState('');
  const [senderOrgId, setSenderOrgId] = useState('');
  
  const [receiverFilterName, setReceiverFilterName] = useState('');
  const [receiverFilterState, setReceiverFilterState] = useState('');
  const [receiverFilterZip, setReceiverFilterZip] = useState('');
  const [receiverOrgId, setReceiverOrgId] = useState('');

  const [showSenderInbox, setShowSenderInbox] = useState(false);
  const [showReceiverInbox, setShowReceiverInbox] = useState(false);

  // KPIs
  const totalOrgs = db.orgs.length;
  const totalRefs = db.referrals.length;
  const since7 = new Date();
  since7.setDate(since7.getDate() - 7);
  const refs7Days = db.referrals.filter((r: any) => new Date(r.createdAt) >= since7).length;
  const pendingRefs = db.referrals.filter((r: any) => r.status === "Pending").length;

  // Filter organizations
  const filteredSenderOrgs = db.orgs.filter((o: any) => {
    if (!o.enabled) return false;
    const name = safeLower(o.name);
    const zip = safeLower(o.address.zip);
    const state = o.address.state;
    return (
      (!senderFilterName || name.includes(safeLower(senderFilterName))) &&
      (!senderFilterState || state === senderFilterState) &&
      (!senderFilterZip || zip.includes(safeLower(senderFilterZip)))
    );
  });

  const filteredReceiverOrgs = db.orgs.filter((o: any) => {
    if (!o.enabled) return false;
    const name = safeLower(o.name);
    const zip = safeLower(o.address.zip);
    const state = o.address.state;
    return (
      (!receiverFilterName || name.includes(safeLower(receiverFilterName))) &&
      (!receiverFilterState || state === receiverFilterState) &&
      (!receiverFilterZip || zip.includes(safeLower(receiverFilterZip)))
    );
  });

  const getSenderReferrals = () => {
    if (!senderOrgId) return [];
    return db.referrals
      .filter((r: any) => r.senderOrgId === senderOrgId)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getReceiverReferrals = () => {
    if (!receiverOrgId) return [];
    return db.referrals
      .filter((r: any) => r.receiverOrgId === receiverOrgId)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getStatusClass = (status: string) => {
    if (status === 'Accepted') return 'border-[#b9e2c8] bg-[#f1fbf5] text-[#0b5d36]';
    if (status === 'Rejected') return 'border-[#f3b8b8] bg-[#fff1f2] text-[#991b1b]';
    if (status === 'Pending') return 'border-[#f3d9a1] bg-[#fff8e6] text-[#7a4a00]';
    return '';
  };

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm outline-none focus:border-[#b9d7c5] focus:shadow-[0_0_0_3px_rgba(31,122,75,0.12)]";
  const btnClass = "border border-rcn-border bg-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-rcn-text hover:border-[#c9ddd0] transition-colors";
  const btnPrimaryClass = "bg-rcn-accent border-rcn-accent text-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold hover:bg-rcn-accent-dark transition-colors";

  return (
    <>
      <TopBar 
        title="Referral Dashboard" 
        subtitle="Portal Selector and real-time inbox view." 
      />

      <div className="flex flex-wrap gap-3.5">
        <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4 flex-1 min-w-[180px]">
          <div className="text-rcn-muted text-sm">Organizations</div>
          <div className="text-2xl font-extrabold mt-2">{totalOrgs}</div>
        </div>
        <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4 flex-1 min-w-[180px]">
          <div className="text-rcn-muted text-sm">Referrals (All)</div>
          <div className="text-2xl font-extrabold mt-2">{totalRefs}</div>
        </div>
        <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4 flex-1 min-w-[180px]">
          <div className="text-rcn-muted text-sm">Referrals (7 days)</div>
          <div className="text-2xl font-extrabold mt-2">{refs7Days}</div>
        </div>
        <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4 flex-1 min-w-[180px]">
          <div className="text-rcn-muted text-sm">Pending</div>
          <div className="text-2xl font-extrabold mt-2">{pendingRefs}</div>
        </div>
      </div>

      <div className="h-px bg-rcn-border my-3.5"></div>

      <div className="banner-gradient border border-rcn-accent/20 rounded-2xl p-3 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <strong className="text-rcn-dark-bg">Admin: Portal Selector</strong>
          <div className="text-xs text-rcn-muted mt-1">
            Select Sender and/or Receiver organizations using Name + State + Zip filters. 
            Use the separate Apply buttons to generate each inbox.
          </div>
        </div>
        <div className="flex gap-2.5">
          <button 
            className={btnClass}
            onClick={() => {
              setSenderOrgId('');
              setReceiverOrgId('');
              setShowSenderInbox(false);
              setShowReceiverInbox(false);
            }}
          >
            Clear selection
          </button>
        </div>
      </div>

      <div className="h-3"></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-start">
        {/* Sender Selection */}
        <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
          <div className="flex justify-between items-center">
            <h3 className="m-0 text-sm font-semibold">Find Sender Organization</h3>
            {senderOrgId && <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#b9e2c8] bg-[#f1fbf5] text-[#0b5d36]">Selected</span>}
          </div>
          
          <div className="flex flex-wrap gap-2.5 items-end mt-2.5">
            <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
              <label className="text-xs text-rcn-muted">Name</label>
              <input
                placeholder="Search by org name"
                value={senderFilterName}
                onChange={(e) => setSenderFilterName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5 min-w-[120px]">
              <label className="text-xs text-rcn-muted">State</label>
              <select value={senderFilterState} onChange={(e) => setSenderFilterState(e.target.value)} className={inputClass}>
                {US_STATES.map(s => <option key={s} value={s}>{s === '' ? 'All' : s}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5 min-w-[120px]">
              <label className="text-xs text-rcn-muted">Zip</label>
              <input
                placeholder="e.g., 60601"
                value={senderFilterZip}
                onChange={(e) => setSenderFilterZip(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mt-2.5">
            <label className="text-xs text-rcn-muted">Sender Organization</label>
            <select value={senderOrgId} onChange={(e) => setSenderOrgId(e.target.value)} className={inputClass}>
              <option value="">— Select Sender Organization —</option>
              {filteredSenderOrgs.map((o: any) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.address.state} {o.address.zip})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end mt-2.5">
            <button 
              className={btnPrimaryClass}
              onClick={() => {
                if (!senderOrgId) {
                  alert('Please select a Sender organization.');
                  return;
                }
                setShowSenderInbox(true);
              }}
            >
              Apply Sender Inbox
            </button>
          </div>
        </div>

        {/* Receiver Selection */}
        <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
          <div className="flex justify-between items-center">
            <h3 className="m-0 text-sm font-semibold">Find Receiver Organization</h3>
            {receiverOrgId && <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#b9e2c8] bg-[#f1fbf5] text-[#0b5d36]">Selected</span>}
          </div>
          
          <div className="flex flex-wrap gap-2.5 items-end mt-2.5">
            <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
              <label className="text-xs text-rcn-muted">Name</label>
              <input
                placeholder="Search by org name"
                value={receiverFilterName}
                onChange={(e) => setReceiverFilterName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5 min-w-[120px]">
              <label className="text-xs text-rcn-muted">State</label>
              <select value={receiverFilterState} onChange={(e) => setReceiverFilterState(e.target.value)} className={inputClass}>
                {US_STATES.map(s => <option key={s} value={s}>{s === '' ? 'All' : s}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5 min-w-[120px]">
              <label className="text-xs text-rcn-muted">Zip</label>
              <input
                placeholder="e.g., 60563"
                value={receiverFilterZip}
                onChange={(e) => setReceiverFilterZip(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mt-2.5">
            <label className="text-xs text-rcn-muted">Receiver Organization</label>
            <select value={receiverOrgId} onChange={(e) => setReceiverOrgId(e.target.value)} className={inputClass}>
              <option value="">— Select Receiver Organization —</option>
              {filteredReceiverOrgs.map((o: any) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.address.state} {o.address.zip})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end mt-2.5">
            <button 
              className={btnPrimaryClass}
              onClick={() => {
                if (!receiverOrgId) {
                  alert('Please select a Receiver organization.');
                  return;
                }
                setShowReceiverInbox(true);
              }}
            >
              Apply Receiver Inbox
            </button>
          </div>
        </div>
      </div>

      <div className="h-px bg-rcn-border my-3.5"></div>

      {/* Inboxes */}
      {(showSenderInbox || showReceiverInbox) ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-start">
          {/* Sender Inbox */}
          <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
            <div className="flex justify-between items-center">
              <h3 className="m-0 text-sm font-semibold">Sender Inbox</h3>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border border-rcn-border bg-[#f8fcf9]">
                {db.orgs.find((o: any) => o.id === senderOrgId)?.name || 'Sender'}
              </span>
            </div>
            
            {showSenderInbox ? (
              <div className="overflow-auto mt-2.5">
                <table className="w-full border-separate border-spacing-0 overflow-hidden rounded-2xl border border-rcn-border">
                  <thead>
                    <tr>
                      <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">ID</th>
                      <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Date</th>
                      <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Patient</th>
                      <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Receiver</th>
                      <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Services</th>
                      <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSenderReferrals().length === 0 ? (
                      <tr><td colSpan={6} className="px-2.5 py-2.5 text-xs text-rcn-muted">No referrals found.</td></tr>
                    ) : (
                      getSenderReferrals().map((ref: any) => {
                        const receiver = db.orgs.find((o: any) => o.id === ref.receiverOrgId);
                        return (
                          <tr key={ref.id}>
                            <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top font-mono">{ref.id}</td>
                            <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">{fmtDate(ref.createdAt)}</td>
                            <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                              {ref.patient.last}, {ref.patient.first}
                              <div className="text-rcn-muted">{ref.patient.dob} • {ref.patient.gender}</div>
                            </td>
                            <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                              {receiver?.name || '—'}
                              <div className="text-rcn-muted">
                                {receiver ? `${receiver.address.city}, ${receiver.address.state} ${receiver.address.zip}` : ''}
                              </div>
                            </td>
                            <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">{ref.services}</td>
                            <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border ${getStatusClass(ref.status)}`}>
                                {ref.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-xs text-rcn-muted mt-2.5 p-2.5 border border-dashed border-rcn-border rounded-xl">
                Select a Sender organization and click <b>Apply Sender Inbox</b>.
              </div>
            )}
          </div>

          {/* Receiver Inbox */}
          <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
            <div className="flex justify-between items-center">
              <h3 className="m-0 text-sm font-semibold">Receiver Inbox</h3>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border border-rcn-border bg-[#f8fcf9]">
                {db.orgs.find((o: any) => o.id === receiverOrgId)?.name || 'Receiver'}
              </span>
            </div>
            
            {showReceiverInbox ? (
              <div className="overflow-auto mt-2.5">
                <table className="w-full border-separate border-spacing-0 overflow-hidden rounded-2xl border border-rcn-border">
                  <thead>
                    <tr>
                      <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">ID</th>
                      <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Date</th>
                      <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Patient</th>
                      <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Sender</th>
                      <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Services</th>
                      <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getReceiverReferrals().length === 0 ? (
                      <tr><td colSpan={6} className="px-2.5 py-2.5 text-xs text-rcn-muted">No referrals found.</td></tr>
                    ) : (
                      getReceiverReferrals().map((ref: any) => {
                        const sender = db.orgs.find((o: any) => o.id === ref.senderOrgId);
                        return (
                          <tr key={ref.id}>
                            <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top font-mono">{ref.id}</td>
                            <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">{fmtDate(ref.createdAt)}</td>
                            <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                              {ref.patient.last}, {ref.patient.first}
                              <div className="text-rcn-muted">{ref.patient.dob} • {ref.patient.gender}</div>
                            </td>
                            <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                              {sender?.name || '—'}
                              <div className="text-rcn-muted">
                                {sender ? `${sender.address.city}, ${sender.address.state} ${sender.address.zip}` : ''}
                              </div>
                            </td>
                            <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">{ref.services}</td>
                            <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border ${getStatusClass(ref.status)}`}>
                                {ref.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-xs text-rcn-muted mt-2.5 p-2.5 border border-dashed border-rcn-border rounded-xl">
                Select a Receiver organization and click <b>Apply Receiver Inbox</b>.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
          <h3 className="text-sm font-semibold m-0 mb-2.5">Side-by-side inbox view</h3>
          <p className="text-xs text-rcn-muted m-0">
            Use the Find Sender/Receiver selectors above. Click <b>Apply Sender Inbox</b> and/or{' '}
            <b>Apply Receiver Inbox</b> to load each inbox. You can load one side at a time.
          </p>
        </div>
      )}
    </>
  );
};

export default Dashboard;
