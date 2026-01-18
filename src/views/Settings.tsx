import React from 'react';
import TopBar from '../components/TopBar';
import { useApp } from '../context/AppContext';
import { seedDemo, downloadFile, saveDB } from '../utils/database';

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

      <div className="card">
        <h3>Settings</h3>
        <p className="hint">Import/export data or reset the demo.</p>
        <div className="hr"></div>
        <div className="row">
          <button className="btn" onClick={handleExportJSON}>
            Export JSON
          </button>
          <label className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            Import JSON
            <input 
              type="file" 
              accept="application/json" 
              style={{ display: 'none' }} 
              onChange={handleImportJSON} 
            />
          </label>
          <button className="btn danger" onClick={handleResetDemo}>
            Reset demo data
          </button>
        </div>

        <div className="hr"></div>

        <div className="card" style={{ boxShadow: 'none', borderRadius: '14px', border: '1px dashed var(--border)', background: '#fbfefc' }}>
          <h3 style={{ margin: '0 0 8px 0' }}>Current selection (Admin)</h3>
          <div style={{ fontSize: '12px', display: 'grid', gap: '6px' }}>
            <div>Total Organizations: <span className="mono">{db.orgs.length}</span></div>
            <div>Total Referrals: <span className="mono">{db.referrals.length}</span></div>
            <div>Total Users: <span className="mono">{db.users.length}</span></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
