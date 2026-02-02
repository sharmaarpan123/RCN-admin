"use client";
import React from 'react';
import { downloadFile } from '../../../utils/database';
import { toastSuccess } from '../../../utils/toast';

const Reports: React.FC = () => {
  const exportJSON = () => {
    const mockData = {
      orgs: [],
      referrals: [],
      audit: [],
    };
    const json = JSON.stringify(mockData, null, 2);
    downloadFile('rcn-demo-export.json', json, 'application/json');
    toastSuccess('JSON exported successfully.');
  };

  const downloadAuditCSV = () => {
    const rows = [['at', 'who', 'action', 'meta']];
    const csv = rows.map(r => 
      r.map(x => `"${(x ?? '').toString().replaceAll('"', '""')}"`).join(',')
    ).join('\n');
    downloadFile('audit-log.csv', csv, 'text/csv');
    toastSuccess('Audit CSV downloaded.');
  };

  return (
    <>
      <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
        <h3 className="text-sm font-semibold m-0 mb-2.5">Reports</h3>
        <p className="text-xs text-rcn-muted m-0 mb-3.5">Quick counts and export options (demo).</p>
        <div className="h-px bg-rcn-border"></div>
        <div className="flex flex-wrap gap-2.5 mt-3.5">
          <button 
            className="border border-rcn-border bg-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-rcn-text text-sm hover:border-[#c9ddd0] transition-colors"
            onClick={exportJSON}
          >
            Export JSON
          </button>
          <button 
            className="border border-rcn-border bg-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-rcn-text text-sm hover:border-[#c9ddd0] transition-colors"
            onClick={downloadAuditCSV}
          >
            Export Audit CSV
          </button>
        </div>
      </div>
    </>
  );
};

export default Reports;
