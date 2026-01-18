import React from 'react';
import TopBar from '../components/TopBar';
import { useApp } from '../context/AppContext';
import { downloadFile, audit } from '../utils/database';

const Reports: React.FC = () => {
  const { db, showToast } = useApp();

  const exportJSON = () => {
    const json = JSON.stringify(db, null, 2);
    downloadFile('rcn-demo-export.json', json, 'application/json');
    audit('export_json', {});
    showToast('JSON exported successfully.');
  };

  const downloadAuditCSV = () => {
    const rows = [['at', 'who', 'action', 'meta']];
    (db.audit || []).forEach((a: any) => {
      rows.push([a.at, a.who, a.action, JSON.stringify(a.meta || {})]);
    });
    const csv = rows.map(r => 
      r.map(x => `"${(x ?? '').toString().replaceAll('"', '""')}"`).join(',')
    ).join('\n');
    downloadFile('audit-log.csv', csv, 'text/csv');
    audit('export_audit_csv', { count: (db.audit || []).length });
    showToast('Audit CSV downloaded.');
  };

  return (
    <>
      <TopBar 
        title="Reports" 
        subtitle="Quick counts and export options (demo)." 
      />

      <div className="card">
        <h3>Reports</h3>
        <p className="hint">Quick counts and export options (demo).</p>
        <div className="hr"></div>
        <div className="row">
          <button className="btn" onClick={exportJSON}>
            Export JSON
          </button>
          <button className="btn" onClick={downloadAuditCSV}>
            Export Audit CSV
          </button>
        </div>
      </div>
    </>
  );
};

export default Reports;
