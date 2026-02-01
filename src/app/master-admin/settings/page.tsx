"use client";
import React, { useState } from 'react';

const Settings: React.FC = () => {
  const [toastMessage, setToastMessage] = useState("");
  const [showToastFlag, setShowToastFlag] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  const showToast = (message: string) => {
    setToastMessage(message);
    setShowToastFlag(true);
    setTimeout(() => setShowToastFlag(false), 2600);
  };

  // Mock current user
  const currentUser = {
    id: "u_sysadmin",
    email: "sysadmin@rcn.local",
    firstName: "System",
    lastName: "Admin",
    phone: "",
    notes: "",
  };

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm outline-none focus:border-[#b9d7c5] focus:shadow-[0_0_0_3px_rgba(31,122,75,0.12)]";
  const btnClass = "border border-rcn-border bg-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-rcn-text text-sm hover:border-[#c9ddd0] transition-colors";
  const btnPrimaryClass = "bg-rcn-accent border-rcn-accent text-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-sm hover:bg-rcn-accent-dark transition-colors";
  const tabBtnClass = "border border-rcn-border bg-[#f6fbf7] px-3 py-2 rounded-full text-xs font-extrabold cursor-pointer transition-all";
  const tabBtnActiveClass = "bg-rcn-accent border-rcn-accent text-white px-3 py-2 rounded-full text-xs font-extrabold cursor-pointer transition-all";

  const handleSaveProfile = () => {
    const firstName = (document.getElementById('admin_first') as HTMLInputElement)?.value.trim();
    const lastName = (document.getElementById('admin_last') as HTMLInputElement)?.value.trim();
    const email = (document.getElementById('admin_email') as HTMLInputElement)?.value.trim().toLowerCase();

    if (!firstName) { showToast('First Name required.'); return; }
    if (!lastName) { showToast('Last Name required.'); return; }
    if (!email) { showToast('Email required.'); return; }
    if (!email.includes('@')) { showToast('Invalid email.'); return; }

    showToast('Profile updated (will be persisted via API).');
  };

  const handleSavePassword = () => {
    const newPass = (document.getElementById('admin_newpass') as HTMLInputElement)?.value;
    const confPass = (document.getElementById('admin_confpass') as HTMLInputElement)?.value;

    if (newPass || confPass) {
      if (newPass.length < 8) { showToast('Password must be at least 8 characters.'); return; }
      if (newPass !== confPass) { showToast('Passwords do not match.'); return; }
    }

    showToast('Password settings updated (will be persisted via API).');

    // Clear password fields
    if (document.getElementById('admin_newpass')) {
      (document.getElementById('admin_newpass') as HTMLInputElement).value = '';
    }
    if (document.getElementById('admin_confpass')) {
      (document.getElementById('admin_confpass') as HTMLInputElement).value = '';
    }
  };

  return (
    <>
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

      {/* Toast notification */}
      <div className={`fixed right-4 bottom-4 z-60 bg-rcn-dark-bg text-rcn-dark-text border border-white/15 px-3 py-2.5 rounded-2xl shadow-rcn max-w-[360px] text-sm transition-all duration-300 ${
        showToastFlag ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}>
        {toastMessage}
      </div>
    </>
  );
};

export default Settings;
