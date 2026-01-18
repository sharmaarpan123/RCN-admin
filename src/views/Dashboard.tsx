import React, { useState, useEffect } from 'react';
import TopBar from '../components/TopBar';
import { useApp } from '../context/AppContext';
import { US_STATES, fmtDate, escapeHtml, safeLower } from '../utils/database';

const Dashboard: React.FC = () => {
  const { db, session, refreshDB } = useApp();
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

  // Filter organizations for sender
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

  // Filter organizations for receiver
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

  const applySenderSelection = () => {
    if (!senderOrgId) {
      alert('Please select a Sender organization.');
      return;
    }
    setShowSenderInbox(true);
  };

  const applyReceiverSelection = () => {
    if (!receiverOrgId) {
      alert('Please select a Receiver organization.');
      return;
    }
    setShowReceiverInbox(true);
  };

  const clearSelection = () => {
    setSenderOrgId('');
    setReceiverOrgId('');
    setShowSenderInbox(false);
    setShowReceiverInbox(false);
  };

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
    if (status === 'Accepted') return 'ok';
    if (status === 'Rejected') return 'bad';
    if (status === 'Pending') return 'warn';
    return '';
  };

  return (
    <>
      <TopBar 
        title="Referral Dashboard" 
        subtitle="Portal Selector and real-time inbox view." 
      />

      <div className="row">
        <div className="card kpi">
          <div className="muted">Organizations</div>
          <div className="big">{totalOrgs}</div>
        </div>
        <div className="card kpi">
          <div className="muted">Referrals (All)</div>
          <div className="big">{totalRefs}</div>
        </div>
        <div className="card kpi">
          <div className="muted">Referrals (7 days)</div>
          <div className="big">{refs7Days}</div>
        </div>
        <div className="card kpi">
          <div className="muted">Pending</div>
          <div className="big">{pendingRefs}</div>
        </div>
      </div>

      <div className="hr"></div>

      <div className="banner">
        <div>
          <strong>Admin: Portal Selector</strong>
          <div className="hint">
            Select Sender and/or Receiver organizations using Name + State + Zip filters. 
            Use the separate Apply buttons to generate each inbox.
          </div>
        </div>
        <div className="flex">
          <button className="btn" onClick={clearSelection}>Clear selection</button>
        </div>
      </div>

      <div style={{ height: '12px' }}></div>

      <div className="split">
        {/* Sender Selection */}
        <div className="card">
          <div className="flex space">
            <h3 style={{ margin: 0 }}>Find Sender Organization</h3>
            {senderOrgId && <span className="tag ok">Selected</span>}
          </div>
          
          <div className="toolbar" style={{ marginTop: '10px' }}>
            <div className="field">
              <label>Name</label>
              <input
                placeholder="Search by org name"
                value={senderFilterName}
                onChange={(e) => setSenderFilterName(e.target.value)}
              />
            </div>
            <div className="field small">
              <label>State</label>
              <select value={senderFilterState} onChange={(e) => setSenderFilterState(e.target.value)}>
                {US_STATES.map(s => <option key={s} value={s}>{s === '' ? 'All' : s}</option>)}
              </select>
            </div>
            <div className="field small">
              <label>Zip</label>
              <input
                placeholder="e.g., 60601"
                value={senderFilterZip}
                onChange={(e) => setSenderFilterZip(e.target.value)}
              />
            </div>
          </div>

          <div className="field" style={{ marginTop: '10px' }}>
            <label>Sender Organization</label>
            <select value={senderOrgId} onChange={(e) => setSenderOrgId(e.target.value)}>
              <option value="">— Select Sender Organization —</option>
              {filteredSenderOrgs.map((o: any) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.address.state} {o.address.zip})
                </option>
              ))}
            </select>
          </div>

          <div className="flex" style={{ justifyContent: 'flex-end', marginTop: '10px' }}>
            <button className="btn primary" onClick={applySenderSelection}>
              Apply Sender Inbox
            </button>
          </div>
        </div>

        {/* Receiver Selection */}
        <div className="card">
          <div className="flex space">
            <h3 style={{ margin: 0 }}>Find Receiver Organization</h3>
            {receiverOrgId && <span className="tag ok">Selected</span>}
          </div>
          
          <div className="toolbar" style={{ marginTop: '10px' }}>
            <div className="field">
              <label>Name</label>
              <input
                placeholder="Search by org name"
                value={receiverFilterName}
                onChange={(e) => setReceiverFilterName(e.target.value)}
              />
            </div>
            <div className="field small">
              <label>State</label>
              <select value={receiverFilterState} onChange={(e) => setReceiverFilterState(e.target.value)}>
                {US_STATES.map(s => <option key={s} value={s}>{s === '' ? 'All' : s}</option>)}
              </select>
            </div>
            <div className="field small">
              <label>Zip</label>
              <input
                placeholder="e.g., 60563"
                value={receiverFilterZip}
                onChange={(e) => setReceiverFilterZip(e.target.value)}
              />
            </div>
          </div>

          <div className="field" style={{ marginTop: '10px' }}>
            <label>Receiver Organization</label>
            <select value={receiverOrgId} onChange={(e) => setReceiverOrgId(e.target.value)}>
              <option value="">— Select Receiver Organization —</option>
              {filteredReceiverOrgs.map((o: any) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.address.state} {o.address.zip})
                </option>
              ))}
            </select>
          </div>

          <div className="flex" style={{ justifyContent: 'flex-end', marginTop: '10px' }}>
            <button className="btn primary" onClick={applyReceiverSelection}>
              Apply Receiver Inbox
            </button>
          </div>
        </div>
      </div>

      <div className="hr"></div>

      {/* Inboxes */}
      {(showSenderInbox || showReceiverInbox) ? (
        <div className="split">
          {/* Sender Inbox */}
          <div className="card">
            <div className="flex space">
              <h3 style={{ margin: 0 }}>Sender Inbox</h3>
              <span className="tag">
                {db.orgs.find((o: any) => o.id === senderOrgId)?.name || 'Sender'}
              </span>
            </div>
            
            {showSenderInbox ? (
              <div style={{ overflow: 'auto', marginTop: '10px' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Date</th>
                      <th>Patient</th>
                      <th>Receiver</th>
                      <th>Services</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSenderReferrals().length === 0 ? (
                      <tr><td colSpan={6} className="muted">No referrals found.</td></tr>
                    ) : (
                      getSenderReferrals().map((ref: any) => {
                        const receiver = db.orgs.find((o: any) => o.id === ref.receiverOrgId);
                        return (
                          <tr key={ref.id}>
                            <td className="mono">{ref.id}</td>
                            <td>{fmtDate(ref.createdAt)}</td>
                            <td>
                              {ref.patient.last}, {ref.patient.first}
                              <div className="muted">{ref.patient.dob} • {ref.patient.gender}</div>
                            </td>
                            <td>
                              {receiver?.name || '—'}
                              <div className="muted">
                                {receiver ? `${receiver.address.city}, ${receiver.address.state} ${receiver.address.zip}` : ''}
                              </div>
                            </td>
                            <td>{ref.services}</td>
                            <td><span className={`tag ${getStatusClass(ref.status)}`}>{ref.status}</span></td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="hint" style={{ marginTop: '10px', padding: '10px', border: '1px dashed #cbd5e1', borderRadius: '12px' }}>
                Select a Sender organization and click <b>Apply Sender Inbox</b>.
              </div>
            )}
          </div>

          {/* Receiver Inbox */}
          <div className="card">
            <div className="flex space">
              <h3 style={{ margin: 0 }}>Receiver Inbox</h3>
              <span className="tag">
                {db.orgs.find((o: any) => o.id === receiverOrgId)?.name || 'Receiver'}
              </span>
            </div>
            
            {showReceiverInbox ? (
              <div style={{ overflow: 'auto', marginTop: '10px' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Date</th>
                      <th>Patient</th>
                      <th>Sender</th>
                      <th>Services</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getReceiverReferrals().length === 0 ? (
                      <tr><td colSpan={6} className="muted">No referrals found.</td></tr>
                    ) : (
                      getReceiverReferrals().map((ref: any) => {
                        const sender = db.orgs.find((o: any) => o.id === ref.senderOrgId);
                        return (
                          <tr key={ref.id}>
                            <td className="mono">{ref.id}</td>
                            <td>{fmtDate(ref.createdAt)}</td>
                            <td>
                              {ref.patient.last}, {ref.patient.first}
                              <div className="muted">{ref.patient.dob} • {ref.patient.gender}</div>
                            </td>
                            <td>
                              {sender?.name || '—'}
                              <div className="muted">
                                {sender ? `${sender.address.city}, ${sender.address.state} ${sender.address.zip}` : ''}
                              </div>
                            </td>
                            <td>{ref.services}</td>
                            <td><span className={`tag ${getStatusClass(ref.status)}`}>{ref.status}</span></td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="hint" style={{ marginTop: '10px', padding: '10px', border: '1px dashed #cbd5e1', borderRadius: '12px' }}>
                Select a Receiver organization and click <b>Apply Receiver Inbox</b>.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card">
          <h3>Side-by-side inbox view</h3>
          <p className="hint">
            Use the Find Sender/Receiver selectors above. Click <b>Apply Sender Inbox</b> and/or{' '}
            <b>Apply Receiver Inbox</b> to load each inbox. You can load one side at a time.
          </p>
        </div>
      )}
    </>
  );
};

export default Dashboard;
