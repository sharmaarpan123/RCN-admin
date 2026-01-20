import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { seedDemo, downloadFile, saveDB, audit, nowISO } from '../../utils/database';

const Settings: React.FC = () => {
  const { db, refreshDB, showToast, currentUser, session } = useApp();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm outline-none focus:border-[#b9d7c5] focus:shadow-[0_0_0_3px_rgba(31,122,75,0.12)]";
  const btnClass = "border border-rcn-border bg-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-rcn-text text-sm hover:border-[#c9ddd0] transition-colors";
  const btnPrimaryClass = "bg-rcn-accent border-rcn-accent text-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-sm hover:bg-rcn-accent-dark transition-colors";
  const tabBtnClass = "border border-rcn-border bg-[#f6fbf7] px-3 py-2 rounded-full text-xs font-extrabold cursor-pointer transition-all";
  const tabBtnActiveClass = "bg-rcn-accent border-rcn-accent text-white px-3 py-2 rounded-full text-xs font-extrabold cursor-pointer transition-all";

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

  const handleSaveProfile = () => {
    if (!currentUser) return;

    const firstName = (document.getElementById('admin_first') as HTMLInputElement)?.value.trim();
    const lastName = (document.getElementById('admin_last') as HTMLInputElement)?.value.trim();
    const email = (document.getElementById('admin_email') as HTMLInputElement)?.value.trim().toLowerCase();
    const phone = (document.getElementById('admin_phone') as HTMLInputElement)?.value.trim();
    const notes = (document.getElementById('admin_notes') as HTMLTextAreaElement)?.value.trim();

    if (!firstName) { showToast('First Name required.'); return; }
    if (!lastName) { showToast('Last Name required.'); return; }
    if (!email) { showToast('Email required.'); return; }
    if (!email.includes('@')) { showToast('Invalid email.'); return; }

    const userIndex = db.users.findIndex((u: any) => u.id === currentUser.id);
    if (userIndex !== -1) {
      db.users[userIndex] = {
        ...db.users[userIndex],
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        email,
        phone,
        notes,
        updatedAt: nowISO(),
      };
      saveDB(db);
      refreshDB();
      audit('profile_updated', { userId: currentUser.id });
      showToast('Profile updated successfully.');
    }
  };

  const handleSavePassword = () => {
    if (!currentUser) return;

    const newPass = (document.getElementById('admin_newpass') as HTMLInputElement)?.value;
    const confPass = (document.getElementById('admin_confpass') as HTMLInputElement)?.value;
    const resetIntervalDays = parseInt((document.getElementById('admin_reset') as HTMLInputElement)?.value || '30', 10);
    const mfaEmail = (document.getElementById('admin_mfa') as HTMLSelectElement)?.value === 'true';
    const forceChangeNextLogin = (document.getElementById('admin_force') as HTMLInputElement)?.checked;

    if (newPass || confPass) {
      if (newPass.length < 8) { showToast('Password must be at least 8 characters.'); return; }
      if (newPass !== confPass) { showToast('Passwords do not match.'); return; }
    }

    const userIndex = db.users.findIndex((u: any) => u.id === currentUser.id);
    if (userIndex !== -1) {
      const updates: any = {
        resetIntervalDays,
        mfaEmail,
        forceChangeNextLogin,
        updatedAt: nowISO(),
      };

      if (newPass) {
        updates.password = newPass;
        updates.passwordChangedAt = nowISO();
      }

      db.users[userIndex] = {
        ...db.users[userIndex],
        ...updates,
      };

      saveDB(db);
      refreshDB();
      audit('password_settings_updated', { userId: currentUser.id });
      showToast('Password settings updated successfully.');

      // Clear password fields
      (document.getElementById('admin_newpass') as HTMLInputElement).value = '';
      (document.getElementById('admin_confpass') as HTMLInputElement).value = '';
    }
  };

  return (
    <>
      {/* <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4 mb-3.5">
        <h3 className="text-sm font-semibold m-0 mb-2.5">Data Management</h3>
        <p className="text-xs text-rcn-muted m-0 mb-3.5">Import/export data or reset the demo.</p>
        <div className="h-px bg-rcn-border"></div>
        <div className="flex flex-wrap gap-2.5 mt-3.5">
          <button 
            className={btnClass}
            onClick={handleExportJSON}
          >
            Export JSON
          </button>
          <label className={`${btnClass} inline-flex items-center gap-2.5`}>
            Import JSON
            <input 
              type="file" 
              accept="application/json" 
              style={{ display: 'none' }} 
              onChange={handleImportJSON} 
            />
          </label>
          <button 
            className="bg-white border border-[#f0c0c0] text-rcn-danger px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-sm hover:bg-[#fff1f2] transition-colors"
            onClick={handleResetDemo}
          >
            Reset demo data
          </button>
        </div>

        <div className="h-px bg-rcn-border my-3.5"></div>

        <div className="bg-white border border-dashed border-rcn-border rounded-2xl p-4" style={{background: '#fbfefc'}}>
          <h3 className="m-0 mb-2 text-sm font-semibold">Current Database</h3>
          <div className="grid gap-1.5 text-xs">
            <div>Total Organizations: <span className="font-mono">{db.orgs.length}</span></div>
            <div>Total Referrals: <span className="font-mono">{db.referrals.length}</span></div>
            <div>Total Users: <span className="font-mono">{db.users.length}</span></div>
          </div>
        </div>
      </div> */}

      {/* Admin Profile & Password Management */}
      {currentUser && (
        <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
          <h3 className="text-sm font-semibold m-0 mb-2.5">Admin Profile & Password</h3>
          <p className="text-xs text-rcn-muted m-0 mb-3.5">Update your profile information and manage your password settings.</p>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              className={activeTab === 'profile' ? tabBtnActiveClass : tabBtnClass}
              onClick={() => setActiveTab('profile')}
            >
              Admin Profile
            </button>
            <button
              className={activeTab === 'password' ? tabBtnActiveClass : tabBtnClass}
              onClick={() => setActiveTab('password')}
            >
              Manage Password
            </button>
          </div>

          <div className="h-px bg-rcn-border mb-4"></div>

          {/* Admin Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-rcn-muted font-semibold">First Name</label>
                  <input 
                    id="admin_first" 
                    type="text" 
                    defaultValue={currentUser.firstName || ''} 
                    className={inputClass} 
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-rcn-muted font-semibold">Last Name</label>
                  <input 
                    id="admin_last" 
                    type="text" 
                    defaultValue={currentUser.lastName || ''} 
                    className={inputClass} 
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-rcn-muted font-semibold">Email</label>
                  <input 
                    id="admin_email" 
                    type="email" 
                    defaultValue={currentUser.email || ''} 
                    className={inputClass} 
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-rcn-muted font-semibold">Phone</label>
                  <input 
                    id="admin_phone" 
                    type="tel" 
                    defaultValue={currentUser.phone || ''} 
                    className={inputClass} 
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

             

             

              <div className="border-t border-rcn-border my-4"></div>

              <div className="flex justify-end">
                <button onClick={handleSaveProfile} className={btnPrimaryClass}>
                  Save Profile
                </button>
              </div>
            </div>
          )}

          {/* Manage Password Tab */}
          {activeTab === 'password' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex flex-col gap-1.5 mb-3">
                    <label className="text-xs text-rcn-muted font-semibold">New Password</label>
                    <input 
                      id="admin_newpass" 
                      type="password" 
                      placeholder="Leave blank to keep current" 
                      className={inputClass} 
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 mb-3">
                    <label className="text-xs text-rcn-muted font-semibold">Confirm Password</label>
                    <input 
                      id="admin_confpass" 
                      type="password" 
                      placeholder="Re-enter new password" 
                      className={inputClass} 
                    />
                  </div>

                 

                             </div>

              
              </div>

              <div className="border-t border-rcn-border my-4"></div>

              <div className="flex justify-end">
                <button onClick={handleSavePassword} className={btnPrimaryClass}>
                  Save Password Settings
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Settings;
