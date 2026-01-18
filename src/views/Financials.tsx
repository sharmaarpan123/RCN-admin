import React from 'react';
import TopBar from '../components/TopBar';
import { useApp } from '../context/AppContext';
import { centsToMoney } from '../utils/database';

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

      <div className="card">
        <div className="flex space">
          <div>
            <h3 style={{ margin: 0 }}>Financials</h3>
            <p className="hint">Totals for referrals and income across the network (demo).</p>
          </div>
          <button className="btn">Refresh</button>
        </div>

        <div className="hr"></div>

        <div className="grid2">
          <div className="card" style={{ boxShadow: 'none', borderRadius: '14px', background: 'rgba(255,255,255,.55)' }}>
            <div className="muted" style={{ fontSize: '12px' }}>Total referrals</div>
            <div style={{ fontSize: '28px', fontWeight: 800 }}>{totalReferrals}</div>
            <div className="hint" style={{ marginTop: '4px' }}>All referrals created in the system.</div>
          </div>

          <div className="card" style={{ boxShadow: 'none', borderRadius: '14px', background: 'rgba(255,255,255,.55)' }}>
            <div className="muted" style={{ fontSize: '12px' }}>Total income (net)</div>
            <div style={{ fontSize: '28px', fontWeight: 800 }}>${centsToMoney(netCents)}</div>
            <div className="hint" style={{ marginTop: '4px' }}>Gross collected minus bonuses paid.</div>
          </div>
        </div>

        <div style={{ height: '10px' }}></div>

        <div className="grid2">
          <div className="card" style={{ boxShadow: 'none', borderRadius: '14px', background: 'rgba(255,255,255,.55)' }}>
            <div className="muted" style={{ fontSize: '12px' }}>Gross collected</div>
            <div style={{ fontSize: '22px', fontWeight: 800 }}>${centsToMoney(grossCents)}</div>
            <div className="hint" style={{ marginTop: '4px' }}>Fees + credit purchases recorded in the ledger.</div>
          </div>

          <div className="card" style={{ boxShadow: 'none', borderRadius: '14px', background: 'rgba(255,255,255,.55)' }}>
            <div className="muted" style={{ fontSize: '12px' }}>Bonuses paid out</div>
            <div style={{ fontSize: '22px', fontWeight: 800 }}>${centsToMoney(bonusCents)}</div>
            <div className="hint" style={{ marginTop: '4px' }}>Sender bonuses from receiver-paid referrals.</div>
          </div>
        </div>

        <div className="hr"></div>

        <div className="grid2">
          <div className="card" style={{ boxShadow: 'none', borderRadius: '14px' }}>
            <div className="flex space">
              <h3 style={{ margin: 0 }}>Referrals by organization</h3>
              <span className="tag">Sent vs received</span>
            </div>
            <div style={{ overflow: 'auto', marginTop: '12px' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Organization</th>
                    <th>State</th>
                    <th>Sent</th>
                    <th>Received</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {db.orgs.map((org: any) => {
                    const sent = db.referrals.filter((r: any) => r.senderOrgId === org.id).length;
                    const received = db.referrals.filter((r: any) => r.receiverOrgId === org.id).length;
                    return (
                      <tr key={org.id}>
                        <td><b>{org.name}</b> <span className="muted mono" style={{ fontSize: '12px' }}>({org.id})</span></td>
                        <td className="mono">{org.address.state}</td>
                        <td className="mono">{sent}</td>
                        <td className="mono">{received}</td>
                        <td className="mono"><b>{sent + received}</b></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card" style={{ boxShadow: 'none', borderRadius: '14px' }}>
            <div className="flex space">
              <h3 style={{ margin: 0 }}>Referrals by state</h3>
              <span className="tag">Sender & receiver</span>
            </div>
            <div className="hint" style={{ marginTop: '6px' }}>
              Counts are based on the sender/receiver organization state.
            </div>
            <div style={{ marginTop: '10px' }}>
              <div className="muted" style={{ fontSize: '12px' }}>Stats by state coming soon in full implementation.</div>
            </div>
          </div>
        </div>

        <div className="hr"></div>

        <div className="flex space">
          <div>
            <h4 style={{ margin: 0 }}>Invoices</h4>
            <p className="hint">
              Invoices are generated automatically when an organization purchases credits.
            </p>
          </div>
          <div className="pillRow">
            <span className="tag">Count: 0</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Financials;
