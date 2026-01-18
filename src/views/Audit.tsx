import React from 'react';
import TopBar from '../components/TopBar';
import { useApp } from '../context/AppContext';
import { fmtDate, escapeHtml, saveDB } from '../utils/database';

const Audit: React.FC = () => {
  const { db, refreshDB, showToast } = useApp();

  const clearLog = () => {
    if (window.confirm('Clear audit log?')) {
      db.audit = [];
      saveDB(db);
      refreshDB();
      showToast('Audit log cleared.');
    }
  };

  return (
    <>
      <TopBar 
        title="Audit Log" 
        subtitle="Review actions performed in this demo." 
      />

      <div className="card">
        <div className="flex space">
          <div>
            <h3 style={{ margin: 0 }}>Audit Log</h3>
            <p className="hint">Tracks demo actions locally.</p>
          </div>
          <button className="btn" onClick={clearLog}>
            Clear log
          </button>
        </div>
        <div style={{ overflow: 'auto', marginTop: '12px' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {(!db.audit || db.audit.length === 0) ? (
                <tr><td colSpan={4} className="muted">No audit entries yet.</td></tr>
              ) : (
                db.audit.slice(0, 200).map((a: any) => (
                  <tr key={a.id}>
                    <td>
                      {fmtDate(a.at)}
                      <div className="muted mono">{a.at}</div>
                    </td>
                    <td className="mono">{escapeHtml(a.who || '')}</td>
                    <td><b>{escapeHtml(a.action)}</b></td>
                    <td className="mono">{escapeHtml(JSON.stringify(a.meta || {}))}</td>
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

export default Audit;
