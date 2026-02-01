"use client";
import React, { useState } from 'react';
import { downloadFile } from '../../../utils/database';

const Reports: React.FC = () => {
  const [toastMessage, setToastMessage] = useState("");
  const [showToastFlag, setShowToastFlag] = useState(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setShowToastFlag(true);
    setTimeout(() => setShowToastFlag(false), 2600);
  };

  const exportJSON = () => {
    const mockData = {
      orgs: [],
      referrals: [],
      audit: [],
    };
    const json = JSON.stringify(mockData, null, 2);
    downloadFile('rcn-demo-export.json', json, 'application/json');
    showToast('JSON exported successfully.');
  };

  const downloadAuditCSV = () => {
    const rows = [['at', 'who', 'action', 'meta']];
    const csv = rows.map(r => 
      r.map(x => `"${(x ?? '').toString().replaceAll('"', '""')}"`).join(',')
    ).join('\n');
    downloadFile('audit-log.csv', csv, 'text/csv');
    showToast('Audit CSV downloaded.');
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

      {/* Toast notification */}
      <div className={`fixed right-4 bottom-4 z-60 bg-rcn-dark-bg text-rcn-dark-text border border-white/15 px-3 py-2.5 rounded-2xl shadow-rcn max-w-[360px] text-sm transition-all duration-300 ${
        showToastFlag ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}>
        {toastMessage}
      </div>
    </>
  );
};

export default Reports;
