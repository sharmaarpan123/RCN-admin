import React from 'react';
import { useApp } from '../../../context/AppContext';
import { fmtDate, escapeHtml, saveDB } from '../../../utils/database';
import Button from '../../../components/Button';

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
      <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <h3 className="m-0 text-sm font-semibold">Audit Log</h3>
            <p className="text-xs text-rcn-muted mt-1 mb-0">Tracks demo actions locally.</p>
          </div>
          <Button 
            variant="secondary"
            onClick={clearLog}
          >
            Clear log
          </Button>
        </div>
        <div className="overflow-auto mt-3">
          <table className="w-full border-separate border-spacing-0 overflow-hidden rounded-2xl border border-rcn-border">
            <thead>
              <tr>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Time</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">User</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Action</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody>
              {(!db.audit || db.audit.length === 0) ? (
                <tr><td colSpan={4} className="px-2.5 py-2.5 text-xs text-rcn-muted">No audit entries yet.</td></tr>
              ) : (
                db.audit.slice(0, 200).map((a: any) => (
                  <tr key={a.id}>
                    <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                      {fmtDate(a.at)}
                      <div className="text-rcn-muted font-mono text-xs">{a.at}</div>
                    </td>
                    <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top font-mono">{escapeHtml(a.who || '')}</td>
                    <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top"><b>{escapeHtml(a.action)}</b></td>
                    <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top font-mono">{escapeHtml(JSON.stringify(a.meta || {}))}</td>
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
