import React from 'react';
import TopBar from '../../components/TopBar';
import { useApp } from '../../context/AppContext';
import { seedDemo, downloadFile, saveDB } from '../../utils/database';

const Settings: React.FC = () => {
  const { db, refreshDB, showToast } = useApp();

  const handleExportJSON = () => {
    const json = JSON.stringify(db, null, 2);
    downloadFile('rcn-demo-export.json', json, 'application/json');
    showToast('JSON exported successfully.');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(reader.result as string);
        if (!obj.orgs || !obj.users || !obj.referrals) {
          throw new Error('Invalid schema');
        }
        saveDB(obj);
        refreshDB();
        showToast('Import complete.');
      } catch (err: any) {
        showToast('Import failed: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset demo data? This clears local changes.')) {
      seedDemo();
      refreshDB();
      showToast('Demo data reset.');
    }
  };

  return (
    <>
      <TopBar 
        title="Settings" 
        subtitle="Import/export data or reset the demo." 
      />

      <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
        <h3 className="text-sm font-semibold m-0 mb-2.5">Settings</h3>
        <p className="text-xs text-rcn-muted m-0 mb-3.5">Import/export data or reset the demo.</p>
        <div className="h-px bg-rcn-border"></div>
        <div className="flex flex-wrap gap-2.5 mt-3.5">
          <button 
            className="border border-rcn-border bg-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-rcn-text text-sm hover:border-[#c9ddd0] transition-colors"
            onClick={handleExportJSON}
          >
            Export JSON
          </button>
          <label className="border border-rcn-border bg-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-rcn-text text-sm hover:border-[#c9ddd0] transition-colors inline-flex items-center gap-2.5">
            Import JSON
            <input 
              type="file" 
              accept="application/json" 
              style={{ display: 'none' }} 
              onChange={handleImportJSON} 
            />
          </label>
          <button 
            className="bg-white border border-[#f0c0c0] text-rcn-danger px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-sm hover:border-[#e0b0b0] transition-colors"
            onClick={handleResetDemo}
          >
            Reset demo data
          </button>
        </div>

        <div className="h-px bg-rcn-border my-3.5"></div>

        <div className="bg-white border border-dashed border-rcn-border rounded-2xl p-4" style={{background: '#fbfefc'}}>
          <h3 className="m-0 mb-2 text-sm font-semibold">Current selection (Admin)</h3>
          <div className="grid gap-1.5 text-xs">
            <div>Total Organizations: <span className="font-mono">{db.orgs.length}</span></div>
            <div>Total Referrals: <span className="font-mono">{db.referrals.length}</span></div>
            <div>Total Users: <span className="font-mono">{db.users.length}</span></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
