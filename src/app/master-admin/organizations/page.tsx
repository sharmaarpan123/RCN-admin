"use client";
import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { US_STATES, safeLower } from "@/utils/database";
import { Button, CustomReactSelect, TableLayout, type TableColumn } from "@/components";

const Organizations: React.FC = () => {
  const { db, refreshDB, showToast, openModal, closeModal } = useApp();

  // Organization table filters
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [zipFilter, setZipFilter] = useState('');

  // Organization modules state
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'branches' | 'depts' | 'users'>('profile');
  
  // Module search filters
  const [branchSearch, setBranchSearch] = useState('');
  const [deptSearch, setDeptSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm outline-none focus:border-[#b9d7c5] focus:shadow-[0_0_0_3px_rgba(31,122,75,0.12)]";
  const btnClass = "border border-rcn-border bg-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-rcn-text text-sm hover:border-[#c9ddd0] transition-colors";
  const btnSmallClass = "border border-rcn-border bg-white px-2.5 py-2 rounded-xl text-xs font-semibold hover:border-[#c9ddd0] transition-colors";
  const btnPrimaryClass = "bg-rcn-accent border-rcn-accent text-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-sm hover:bg-rcn-accent-dark transition-colors";

  const filteredOrgs = db.orgs.filter((o: any) => {
    const searchLower = safeLower(search);
    const hay = [
      o.name, o.phone, o.email,
      o.address?.street, o.address?.suite, o.address?.city, o.address?.state, o.address?.zip
    ].map(safeLower).join(' ');

    return (
      (!search || hay.includes(searchLower)) &&
      (!stateFilter || o.address?.state === stateFilter) &&
      (!zipFilter || safeLower(o.address?.zip || '').includes(safeLower(zipFilter)))
    );
  });

  const selectedOrg = selectedOrgId ? db.orgs.find((o: any) => o.id === selectedOrgId) : null;

  type OrgTableRow = { id: string; name: string; email: string; address: { state?: string; zip?: string; city?: string; street?: string }; enabled?: boolean };
  const orgTableColumns: TableColumn<OrgTableRow>[] = [
    {
      head: "Name",
      component: (o) => (
        <>
          <b>{o.name}</b>
          <div className="text-rcn-muted">{o.email}</div>
        </>
      ),
    },
    { head: "State", component: (o) => o.address?.state ?? "—" },
    { head: "Zip", component: (o) => <span className="font-mono">{o.address?.zip ?? "—"}</span> },
    { head: "City", component: (o) => o.address?.city ?? "—" },
    { head: "Street", component: (o) => o.address?.street ?? "—" },
    {
      head: "Enabled",
      component: (o) =>
        o.enabled ? (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#b9e2c8] bg-[#f1fbf5] text-[#0b5d36]">Enabled</span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#f3b8b8] bg-[#fff1f2] text-[#991b1b]">Disabled</span>
        ),
    },
    {
      head: "Actions",
      component: (o) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedOrgId(o.id);
              setActiveTab("branches");
              setTimeout(() => {
                document.getElementById("org-modules-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }, 100);
            }}
            className={btnSmallClass}
          >
            Manage
          </button>
          <button type="button" onClick={() => openOrgModal(o.id)} className={btnSmallClass}>
            Edit
          </button>
        </div>
      ),
    },
  ];

  const getFilteredBranches = () => {
    if (!selectedOrgId) return [];
    const q = safeLower(branchSearch);
    return db.branches.filter((b: any) => {
      if (b.orgId !== selectedOrgId) return false;
      if (!q) return true;
      const hay = safeLower(b.name + ' ' + b.id);
      return hay.includes(q);
    });
  };

  const getFilteredDepts = () => {
    if (!selectedOrgId) return [];
    const q = safeLower(deptSearch);
    return db.depts.filter((d: any) => {
      if (d.orgId !== selectedOrgId) return false;
      if (!q) return true;
      const branch = db.branches.find((b: any) => b.id === d.branchId);
      const hay = safeLower(d.name + ' ' + d.id + ' ' + (branch?.name || '') + ' ' + d.branchId);
      return hay.includes(q);
    });
  };

  const getFilteredUsers = () => {
    if (!selectedOrgId) return [];
    const q = safeLower(userSearch);
    return db.users.filter((u: any) => {
      if (u.orgId !== selectedOrgId) return false;
      if (!q) return true;
      const hay = safeLower([u.name, u.email, u.role, u.phone, u.notes].join(' '));
      return hay.includes(q);
    });
  };

  type OrgUserRow = { id: string; name: string; email: string; role: string; adminCap?: boolean; resetIntervalDays?: number; mfaEmail?: string; enabled?: boolean };
  const orgUserColumns: TableColumn<OrgUserRow>[] = [
    {
      head: "Name",
      component: (u) => (
        <>
          <b>{u.name}</b> <span className="text-rcn-muted font-mono text-[11px]">({u.id})</span>
        </>
      ),
    },
    { head: "Email", component: (u) => <span className="font-mono">{u.email}</span> },
    {
      head: "Role",
      component: (u) => (u.role === "ORG_ADMIN" ? "Organization Admin" : u.role === "STAFF" ? "Staff" : u.role),
    },
    {
      head: "Access",
      component: (u) =>
        u.adminCap ? (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#b9e2c8] bg-[#f1fbf5] text-[#0b5d36]">Admin capabilities</span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-rcn-border bg-rcn-bg">Active user</span>
        ),
    },
    { head: "Reset", component: (u) => <>{u.resetIntervalDays ?? "—"} days</> },
    {
      head: "MFA",
      component: (u) =>
        u.mfaEmail ? (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#b9e2c8] bg-[#f1fbf5] text-[#0b5d36]">On</span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-rcn-border bg-rcn-bg">Off</span>
        ),
    },
    {
      head: "Enabled",
      component: (u) =>
        u.enabled ? (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#b9e2c8] bg-[#f1fbf5] text-[#0b5d36]">Enabled</span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#f3b8b8] bg-[#fff1f2] text-[#991b1b]">Disabled</span>
        ),
    },
    {
      head: "Actions",
      component: (u) => (
        <button type="button" onClick={() => openUserModal(u.id)} className={btnSmallClass}>
          Edit
        </button>
      ),
    },
  ];

  type BranchTableRow = { id: string; name: string; enabled?: boolean };
  const branchTableColumns: TableColumn<BranchTableRow>[] = [
    {
      head: "Branch",
      component: (b) => (
        <>
          <b>{b.name}</b> <span className="text-rcn-muted font-mono text-[11px]">({b.id})</span>
        </>
      ),
    },
    {
      head: "Enabled",
      component: (b) =>
        b.enabled ? (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#b9e2c8] bg-[#f1fbf5] text-[#0b5d36]">Enabled</span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#f3b8b8] bg-[#fff1f2] text-[#991b1b]">Disabled</span>
        ),
    },
    {
      head: "Actions",
      component: (b) => (
        <div className="flex gap-2">
          <button type="button" onClick={() => toggleBranch(b.id)} className={btnSmallClass}>Toggle</button>
          <button type="button" onClick={() => openBranchModal(b.id)} className={btnSmallClass}>Edit</button>
        </div>
      ),
    },
  ];

  type DeptTableRow = { id: string; name: string; branchId: string; enabled?: boolean };
  const deptTableColumns: TableColumn<DeptTableRow>[] = [
    {
      head: "Branch",
      component: (d) => {
        const branch = db.branches.find((b: any) => b.id === d.branchId);
        return (
          <>
            {branch?.name || "—"} <span className="text-rcn-muted font-mono text-[11px]">({d.branchId || "—"})</span>
          </>
        );
      },
    },
    {
      head: "Department",
      component: (d) => (
        <>
          <b>{d.name}</b> <span className="text-rcn-muted font-mono text-[11px]">({d.id})</span>
        </>
      ),
    },
    {
      head: "Enabled",
      component: (d) =>
        d.enabled ? (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#b9e2c8] bg-[#f1fbf5] text-[#0b5d36]">Enabled</span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#f3b8b8] bg-[#fff1f2] text-[#991b1b]">Disabled</span>
        ),
    },
    {
      head: "Actions",
      component: (d) => (
        <div className="flex gap-2">
          <button type="button" onClick={() => toggleDept(d.id)} className={btnSmallClass}>Toggle</button>
          <button type="button" onClick={() => openDeptModal(d.id)} className={btnSmallClass}>Edit</button>
        </div>
      ),
    },
  ];

  // Helper functions
  const uid = (prefix: string) => `${prefix}_${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;

  const saveToLocalStorage = (db: any) => {
    localStorage.setItem('rcn_demo_v6', JSON.stringify(db));
    refreshDB();
  };

  // Organization Modal
  const openOrgModal = (orgId?: string) => {
    const org = orgId ? db.orgs.find((o: any) => o.id === orgId) : null;

    const modalContent = (
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold m-0">{org ? 'Edit' : 'New'} Organization</h3>
          </div>
          <Button variant="secondary" onClick={closeModal}>Close</Button>
        </div>

        <div className="h-px bg-rcn-border my-4"></div>

        <div className="grid grid-cols-1 md:grid-cols-2  gap-4">
          <div className="col-span-1">
            <div className="mb-4">
              <label className="text-xs text-rcn-muted block mb-1.5">Organization Name</label>
              <input id="org_name" defaultValue={org?.name || ''} className={inputClass} />
            </div>

            <div className="mb-4">
              <label className="text-xs text-rcn-muted block mb-1.5">Organization Phone (Must)</label>
              <input id="org_phone" defaultValue={org?.phone || ''} className={inputClass} />
            </div>

            <div className="mb-4">
              <label className="text-xs text-rcn-muted block mb-1.5">Organization Email (Must)</label>
              <input id="org_email" type="email" defaultValue={org?.email || ''} className={inputClass} />
            </div>

            <div className="mb-4">
              <label className="text-xs text-rcn-muted block mb-1.5">Organization EIN (Optional)</label>
              <input id="org_ein" defaultValue={org?.ein || ''} className={inputClass} />
            </div>

            <div className="mb-4">
              <label className="text-xs text-rcn-muted block mb-1.5">Enabled</label>
              <select id="org_enabled" defaultValue={String(org?.enabled ?? true)} className={inputClass}>
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </div>
          </div>

          <div className="col-span-1">
            <div className="bg-white border border-rcn-border rounded-2xl p-4 mb-4">
              <h3 className="text-sm font-semibold m-0 mb-3">Organization Address</h3>

              <div className="mb-3">
                <label className="text-xs text-rcn-muted block mb-1.5">Street</label>
                <input id="org_street" defaultValue={org?.address?.street || ''} className={inputClass} />
              </div>

              <div className="mb-3">
                <label className="text-xs text-rcn-muted block mb-1.5">Apt/Suite</label>
                <input id="org_suite" defaultValue={org?.address?.suite || ''} className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="text-xs text-rcn-muted block mb-1.5">City</label>
                  <input id="org_city" defaultValue={org?.address?.city || ''} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs text-rcn-muted block mb-1.5">State</label>
                  <select id="org_state" defaultValue={org?.address?.state || ''} className={inputClass}>
                    {US_STATES.map(s => <option key={s} value={s}>{s === '' ? 'Select' : s}</option>)}
                  </select>
                </div>
              </div>

              <div className="mb-0">
                <label className="text-xs text-rcn-muted block mb-1.5">Zip</label>
                <input id="org_zip" defaultValue={org?.address?.zip || ''} className={inputClass} />
              </div>
            </div>

            <div className="bg-white border border-rcn-border rounded-2xl p-4">
              <h3 className="text-sm font-semibold m-0 mb-3">Organization Contact Person</h3>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="text-xs text-rcn-muted block mb-1.5">First Name</label>
                  <input id="org_c_first" defaultValue={org?.contact?.first || ''} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs text-rcn-muted block mb-1.5">Last Name</label>
                  <input id="org_c_last" defaultValue={org?.contact?.last || ''} className={inputClass} />
                </div>
              </div>

              <div className="mb-3">
                <label className="text-xs text-rcn-muted block mb-1.5">Email</label>
                <input id="org_c_email" type="email" defaultValue={org?.contact?.email || ''} className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-0">
                <div>
                  <label className="text-xs text-rcn-muted block mb-1.5">Tel</label>
                  <input id="org_c_tel" defaultValue={org?.contact?.tel || ''} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs text-rcn-muted block mb-1.5">Fax</label>
                  <input id="org_c_fax" defaultValue={org?.contact?.fax || ''} className={inputClass} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-rcn-border my-4"></div>

        <div className="flex justify-between items-center">
          <div className="text-xs text-rcn-muted">
            {org ? 'Changes apply immediately to dropdown searches and inboxes.' : 'Create a new organization for sender/receiver selection.'}
          </div>
          <div className="flex gap-2">
            {org && (
              <Button variant="danger" onClick={() => deleteOrg(org.id)}>
                Delete
              </Button>
            )}
            <Button variant="primary" onClick={() => saveOrg(orgId)}>Save</Button>
          </div>
        </div>
      </div>
    );

    openModal(modalContent);
  };

  const saveOrg = (orgId?: string) => {
    const name = (document.getElementById('org_name') as HTMLInputElement)?.value.trim();
    const phone = (document.getElementById('org_phone') as HTMLInputElement)?.value.trim();
    const email = (document.getElementById('org_email') as HTMLInputElement)?.value.trim();
    const state = (document.getElementById('org_state') as HTMLSelectElement)?.value.trim();
    const zip = (document.getElementById('org_zip') as HTMLInputElement)?.value.trim();

    if (!name) { showToast('Organization Name is required.'); return; }
    if (!phone) { showToast('Organization Phone is required.'); return; }
    if (!email) { showToast('Organization Email is required.'); return; }
    if (!state) { showToast('State is required.'); return; }
    if (!zip) { showToast('Zip is required.'); return; }

    const obj = {
      id: orgId || uid('org'),
      name,
      phone,
      email,
      ein: (document.getElementById('org_ein') as HTMLInputElement)?.value.trim() || '',
      enabled: (document.getElementById('org_enabled') as HTMLSelectElement)?.value === 'true',
      address: {
        street: (document.getElementById('org_street') as HTMLInputElement)?.value.trim() || '',
        suite: (document.getElementById('org_suite') as HTMLInputElement)?.value.trim() || '',
        city: (document.getElementById('org_city') as HTMLInputElement)?.value.trim() || '',
        state,
        zip
      },
      contact: {
        first: (document.getElementById('org_c_first') as HTMLInputElement)?.value.trim() || '',
        last: (document.getElementById('org_c_last') as HTMLInputElement)?.value.trim() || '',
        email: (document.getElementById('org_c_email') as HTMLInputElement)?.value.trim() || '',
        tel: (document.getElementById('org_c_tel') as HTMLInputElement)?.value.trim() || '',
        fax: (document.getElementById('org_c_fax') as HTMLInputElement)?.value.trim() || ''
      },
      walletCents: orgId ? db.orgs.find((o: any) => o.id === orgId)?.walletCents || 0 : 0,
      referralCredits: orgId ? db.orgs.find((o: any) => o.id === orgId)?.referralCredits || 0 : 0
    };

    if (orgId) {
      const idx = db.orgs.findIndex((o: any) => o.id === orgId);
      db.orgs[idx] = obj;
    } else {
      db.orgs.push(obj);
    }

    saveToLocalStorage(db);
    closeModal();
    showToast('Organization saved.');
  };

  const deleteOrg = (orgId: string) => {
    if (!confirm('Delete this organization? (Demo: this removes it immediately)')) return;

    db.orgs = db.orgs.filter((o: any) => o.id !== orgId);
    db.branches = db.branches.filter((b: any) => b.orgId !== orgId);
    db.depts = db.depts.filter((d: any) => d.orgId !== orgId);
    db.users = db.users.filter((u: any) => u.orgId !== orgId);
    db.referrals = db.referrals.filter((r: any) => r.senderOrgId !== orgId && r.receiverOrgId !== orgId);

    saveToLocalStorage(db);
    closeModal();
    setSelectedOrgId('');
    showToast('Organization deleted.');
  };

  // Branch Modal
  const openBranchModal = (branchId?: string, presetOrgId?: string) => {
    const branch = branchId ? db.branches.find((b: any) => b.id === branchId) : null;
    const targetOrgId = branch?.orgId || presetOrgId || selectedOrgId || '';

    const modalContent = (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold m-0">{branch ? 'Edit' : 'New'} Branch</h3>
          <button onClick={closeModal} className={btnClass}>Close</button>
        </div>

        <div className="h-px bg-rcn-border my-4"></div>

        <div className="mb-4">
          <label className="text-xs text-rcn-muted block mb-1.5">Organization</label>
          <select id="br_org" defaultValue={targetOrgId} className={inputClass} disabled={!!presetOrgId}>
            {db.orgs.map((o: any) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="text-xs text-rcn-muted block mb-1.5">Branch Name</label>
          <input id="br_name" defaultValue={branch?.name || ''} placeholder="e.g., Main" className={inputClass} />
        </div>

        <div className="h-px bg-rcn-border my-4"></div>

        <div className="flex justify-end gap-2">
          {branch && (
            <button
              onClick={() => deleteBranch(branch.id)}
              className="border border-rcn-danger bg-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-rcn-danger text-sm hover:bg-rcn-danger hover:text-white transition-colors"
            >
              Delete
            </button>
          )}
          <button onClick={() => saveBranch(branchId)} className={btnPrimaryClass}>Save</button>
        </div>
      </div>
    );

    openModal(modalContent);
  };

  const saveBranch = (branchId?: string) => {
    const orgId = (document.getElementById('br_org') as HTMLSelectElement)?.value;
    const name = (document.getElementById('br_name') as HTMLInputElement)?.value.trim();

    if (!name) { showToast('Branch name required.'); return; }

    const obj = {
      id: branchId || uid('br'),
      orgId,
      name,
      enabled: branchId ? db.branches.find((b: any) => b.id === branchId)?.enabled ?? true : true
    };

    if (branchId) {
      const idx = db.branches.findIndex((b: any) => b.id === branchId);
      db.branches[idx] = obj;
    } else {
      db.branches.push(obj);
    }

    saveToLocalStorage(db);
    closeModal();
    showToast('Branch saved.');
  };

  const deleteBranch = (branchId: string) => {
    if (!confirm('Delete this branch?')) return;

    db.branches = db.branches.filter((b: any) => b.id !== branchId);
    db.depts = db.depts.filter((d: any) => d.branchId !== branchId);

    saveToLocalStorage(db);
    closeModal();
    showToast('Branch deleted.');
  };

  const toggleBranch = (branchId: string) => {
    const branch = db.branches.find((b: any) => b.id === branchId);
    if (branch) {
      branch.enabled = !branch.enabled;
      saveToLocalStorage(db);
    }
  };

  // Department Modal
  const openDeptModal = (deptId?: string, presetOrgId?: string) => {
    const dept = deptId ? db.depts.find((d: any) => d.id === deptId) : null;
    const targetOrgId = dept?.orgId || presetOrgId || selectedOrgId || '';

    const modalContent = (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold m-0">{dept ? 'Edit' : 'New'} Department</h3>
          <button onClick={closeModal} className={btnClass}>Close</button>
        </div>

        <div className="h-px bg-rcn-border my-4"></div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-rcn-muted block mb-1.5">Organization</label>
            <select
              id="dp_org"
              defaultValue={targetOrgId}
              className={inputClass}
              disabled={!!presetOrgId}
              onChange={(e) => {
                const dpBranchSelect = document.getElementById('dp_branch') as HTMLSelectElement;
                if (dpBranchSelect) {
                  const orgBranches = db.branches.filter((b: any) => b.orgId === e.target.value);
                  dpBranchSelect.innerHTML = orgBranches.map((b: any) =>
                    `<option value="${b.id}">${b.name}</option>`
                  ).join('');
                }
              }}
            >
              {db.orgs.map((o: any) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-rcn-muted block mb-1.5">Branch</label>
            <select id="dp_branch" defaultValue={dept?.branchId || ''} className={inputClass}>
              {db.branches.filter((b: any) => b.orgId === targetOrgId).map((b: any) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-xs text-rcn-muted block mb-1.5">Department Name</label>
          <input id="dp_name" defaultValue={dept?.name || ''} placeholder="e.g., Cardiology" className={inputClass} />
        </div>

        <div className="h-px bg-rcn-border my-4"></div>

        <div className="flex justify-end gap-2">
          {dept && (
            <button
              onClick={() => deleteDept(dept.id)}
              className="border border-rcn-danger bg-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-rcn-danger text-sm hover:bg-rcn-danger hover:text-white transition-colors"
            >
              Delete
            </button>
          )}
          <button onClick={() => saveDept(deptId)} className={btnPrimaryClass}>Save</button>
        </div>
      </div>
    );

    openModal(modalContent);
  };

  const saveDept = (deptId?: string) => {
    const orgId = (document.getElementById('dp_org') as HTMLSelectElement)?.value;
    const branchId = (document.getElementById('dp_branch') as HTMLSelectElement)?.value;
    const name = (document.getElementById('dp_name') as HTMLInputElement)?.value.trim();

    if (!name) { showToast('Department name required.'); return; }

    const obj = {
      id: deptId || uid('dp'),
      orgId,
      branchId,
      name,
      enabled: deptId ? db.depts.find((d: any) => d.id === deptId)?.enabled ?? true : true
    };

    if (deptId) {
      const idx = db.depts.findIndex((d: any) => d.id === deptId);
      db.depts[idx] = obj;
    } else {
      db.depts.push(obj);
    }

    saveToLocalStorage(db);
    closeModal();
    showToast('Department saved.');
  };

  const deleteDept = (deptId: string) => {
    if (!confirm('Delete this department?')) return;

    db.depts = db.depts.filter((d: any) => d.id !== deptId);

    saveToLocalStorage(db);
    closeModal();
    showToast('Department deleted.');
  };

  const toggleDept = (deptId: string) => {
    const dept = db.depts.find((d: any) => d.id === deptId);
    if (dept) {
      dept.enabled = !dept.enabled;
      saveToLocalStorage(db);
    }
  };

  // User Modal (Organization context)
  const openUserModal = (userId?: string, presetOrgId?: string) => {
    const user = userId ? db.users.find((u: any) => u.id === userId) : null;
    const targetOrgId = user?.orgId || presetOrgId || selectedOrgId || '';

    const modalContent = (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold m-0">{user ? 'Edit' : 'New'} User</h3>
          <button onClick={closeModal} className={btnClass}>Close</button>
        </div>

        <div className="h-px bg-rcn-border my-4"></div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="text-xs text-rcn-muted block mb-1.5">First Name</label>
                <input id="u_first" defaultValue={user?.firstName || ''} className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-rcn-muted block mb-1.5">Last Name</label>
                <input id="u_last" defaultValue={user?.lastName || ''} className={inputClass} />
              </div>
            </div>

            <div className="mb-3">
              <label className="text-xs text-rcn-muted block mb-1.5">Email</label>
              <input id="u_email" type="email" defaultValue={user?.email || ''} className={inputClass} />
            </div>

            <div className="mb-3">
              <label className="text-xs text-rcn-muted block mb-1.5">Phone (optional)</label>
              <input id="u_phone" defaultValue={user?.phone || ''} placeholder="(optional)" className={inputClass} />
            </div>

            <div className="mb-3">
              <label className="text-xs text-rcn-muted block mb-1.5">Role</label>
              <select id="u_role" defaultValue={user?.role || 'STAFF'} className={inputClass}>
                <option value="ORG_ADMIN">Organization Admin</option>
                <option value="STAFF">Staff</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="text-xs text-rcn-muted block mb-1.5">Organization</label>
              <select id="u_org" defaultValue={targetOrgId} className={inputClass} disabled={!!presetOrgId}>
                <option value="">— None —</option>
                {db.orgs.map((o: any) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="mb-3">
              <label className="text-xs text-rcn-muted block mb-1.5">Access</label>
              <select id="u_access" defaultValue={user?.adminCap ? 'ADMIN' : 'ACTIVE'} className={inputClass}>
                <option value="ACTIVE">Active user</option>
                <option value="ADMIN">Admin capabilities</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="text-xs text-rcn-muted block mb-1.5">Active user status</label>
              <select id="u_enabled" defaultValue={String(user?.enabled ?? true)} className={inputClass}>
                <option value="true">Active</option>
                <option value="false">Disabled</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="text-xs text-rcn-muted block mb-1.5">Password Reset Interval (days)</label>
              <input id="u_reset" type="number" min="1" step="1" defaultValue={user?.resetIntervalDays || 30} className={inputClass} />
            </div>

            <div className="mb-3">
              <label className="text-xs text-rcn-muted block mb-1.5">Email MFA</label>
              <select id="u_mfa" defaultValue={String(user?.mfaEmail ?? false)} className={inputClass}>
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </div>

            <div className="mb-0">
              <label className="text-xs text-rcn-muted block mb-1.5">Notes (optional)</label>
              <textarea id="u_notes" defaultValue={user?.notes || ''} placeholder="Optional notes..." className={inputClass} rows={3}></textarea>
            </div>
          </div>
        </div>

        <div className="h-px bg-rcn-border my-4"></div>

        <div className="flex justify-between items-center">
          <div className="text-xs text-rcn-muted">Changes apply immediately.</div>
          <div className="flex gap-2">
            {user && (
              <button
                onClick={() => deleteUser(user.id)}
                className="border border-rcn-danger bg-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-rcn-danger text-sm hover:bg-rcn-danger hover:text-white transition-colors"
              >
                Delete
              </button>
            )}
            <button onClick={() => saveUser(userId)} className={btnPrimaryClass}>Save</button>
          </div>
        </div>
      </div>
    );

    openModal(modalContent);
  };

  const saveUser = (userId?: string) => {
    const firstName = (document.getElementById('u_first') as HTMLInputElement)?.value.trim();
    const lastName = (document.getElementById('u_last') as HTMLInputElement)?.value.trim();
    const email = (document.getElementById('u_email') as HTMLInputElement)?.value.trim().toLowerCase();
    const phone = (document.getElementById('u_phone') as HTMLInputElement)?.value.trim();
    const role = (document.getElementById('u_role') as HTMLSelectElement)?.value;
    const orgId = (document.getElementById('u_org') as HTMLSelectElement)?.value || null;
    const adminCap = (document.getElementById('u_access') as HTMLSelectElement)?.value === 'ADMIN';
    const enabled = (document.getElementById('u_enabled') as HTMLSelectElement)?.value === 'true';
    const notes = (document.getElementById('u_notes') as HTMLTextAreaElement)?.value.trim();
    const resetIntervalDays = parseInt((document.getElementById('u_reset') as HTMLInputElement)?.value || '30', 10);
    const mfaEmail = (document.getElementById('u_mfa') as HTMLSelectElement)?.value === 'true';

    if (!firstName) { showToast('First Name required.'); return; }
    if (!lastName) { showToast('Last Name required.'); return; }
    if (!email) { showToast('Email required.'); return; }
    if (!email.includes('@')) { showToast('Invalid email.'); return; }

    if (!userId && db.users.some((u: any) => u.email.toLowerCase() === email)) {
      showToast('Email already exists.'); return;
    }

    const existing = userId ? db.users.find((u: any) => u.id === userId) : null;

    const obj = {
      id: userId || uid('u'),
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      email,
      phone,
      notes,
      role,
      orgId,
      adminCap,
      enabled,
      resetIntervalDays: isFinite(resetIntervalDays) ? resetIntervalDays : 30,
      mfaEmail,
      password: existing?.password || 'Admin123!',
      passwordChangedAt: existing?.passwordChangedAt || '',
      forceChangeNextLogin: existing?.forceChangeNextLogin ?? false,
      branchIds: existing?.branchIds || [],
      deptIds: existing?.deptIds || [],
      permissions: existing?.permissions || {
        referralDashboard: true,
        userPanel: false,
        paymentAdjustmentSettings: adminCap,
        bannerManagement: adminCap,
        financials: false,
        reports: true,
        auditLog: adminCap,
        settings: false
      }
    };

    if (userId) {
      const idx = db.users.findIndex((u: any) => u.id === userId);
      db.users[idx] = obj;
    } else {
      db.users.push(obj);
    }

    saveToLocalStorage(db);
    closeModal();
    showToast('User saved.');
  };

  const deleteUser = (userId: string) => {
    if (!confirm('Delete this user?')) return;

    db.users = db.users.filter((u: any) => u.id !== userId);

    saveToLocalStorage(db);
    closeModal();
    showToast('User deleted.');
  };

  return (
    <>
      {/* Organizations Table */}
      <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4 mb-4">
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <h3 className="m-0 text-sm font-semibold">Organizations</h3>
            <p className="text-xs text-rcn-muted mt-1 mb-0">Manage organizations and their address info (state + zip included).</p>
          </div>
          <button onClick={() => openOrgModal()} className={btnPrimaryClass}>+ New Organization</button>
        </div>

        <div className="flex flex-wrap gap-2.5 items-end mt-3">
          <div className="flex flex-col gap-1.5 min-w-[260px] flex-1">
            <label className="text-xs text-rcn-muted">Search (Name or Location)</label>
            <input
              placeholder="Name, street, city, state, zip"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5 min-w-[120px]">
            <label className="text-xs text-rcn-muted">State</label>
            <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className={inputClass}>
              {US_STATES.map(s => <option key={s} value={s}>{s === '' ? 'All' : s}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 min-w-[120px]">
            <label className="text-xs text-rcn-muted">Zip</label>
            <input
              placeholder="Zip"
              value={zipFilter}
              onChange={(e) => setZipFilter(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="overflow-auto mt-3">
          <TableLayout<OrgTableRow>
            columns={orgTableColumns}
            data={filteredOrgs as OrgTableRow[]}
            variant="bordered"
            size="sm"
            emptyMessage="No organizations found."
            getRowKey={(o) => o.id}
          />
        </div>
      </div>

      {/* Organization Modules */}
      <div id="org-modules-card" className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
        <div className="flex justify-between items-end flex-wrap gap-3">
          <div>
            <h3 className="m-0 text-sm font-semibold">Organization Modules</h3>
            <p className="text-xs text-rcn-muted mt-1 mb-0">Branches, Departments, and Users are managed inside the selected Organization.</p>
          </div>
          <div className="flex flex-col gap-1.5 w-full  md:w-[300px]">
            <label className="text-xs text-rcn-muted">Select Organization</label>
            <CustomReactSelect
              options={db.orgs.map((o: { id: string; name: string; address?: { state?: string; zip?: string } }) => ({
                value: o.id,
                label: `${o.name} — ${o.address?.state ?? ""} ${o.address?.zip ?? ""}`.trim(),
              }))}
              value={selectedOrgId}
              onChange={setSelectedOrgId}
              placeholder="— Select Organization —"
              aria-label="Select Organization"
              isClearable
              maxMenuHeight={280}
            />
          </div>
        </div>

        <div className="h-px bg-rcn-border my-4"></div>

        {!selectedOrgId ? (
          <div className="text-xs text-rcn-muted">
            Select an organization to manage branches, departments, and users.
          </div>
        ) : (
          <>
            <div className="text-xs mb-3">
              <b>{selectedOrg?.name}</b> • {selectedOrg?.enabled ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#b9e2c8] bg-[#f1fbf5] text-[#0b5d36]">Enabled</span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#f3b8b8] bg-[#fff1f2] text-[#991b1b]">Disabled</span>
              )}
              <span className="text-rcn-muted ml-2">
                • {selectedOrg?.address?.street} {selectedOrg?.address?.suite} • {selectedOrg?.address?.city}, {selectedOrg?.address?.state} {selectedOrg?.address?.zip}
              </span>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap mb-3">
              <Button
                variant="tab"
                size="sm"
                active={activeTab === 'profile'}
                onClick={() => setActiveTab('profile')}
              >
                Organization
              </Button>
              <Button
                variant="tab"
                size="sm"
                active={activeTab === 'branches'}
                onClick={() => setActiveTab('branches')}
              >
                Branches
              </Button>
              <Button
                variant="tab"
                size="sm"
                active={activeTab === 'depts'}
                onClick={() => setActiveTab('depts')}
              >
                Departments
              </Button>
              <Button
                variant="tab"
                size="sm"
                active={activeTab === 'users'}
                onClick={() => setActiveTab('users')}
              >
                Users
              </Button>
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-rcn-border rounded-2xl p-4">
                    <h3 className="text-sm font-semibold m-0 mb-2">Organization Details</h3>
                    <div className="text-xs space-y-1">
                      <div><b>Name:</b> {selectedOrg?.name}</div>
                      <div><b>Email:</b> {selectedOrg?.email || '—'}</div>
                      <div><b>Phone:</b> {selectedOrg?.phone || '—'}</div>
                      <div><b>EIN:</b> {selectedOrg?.ein || '—'}</div>
                      <div className="mt-2"><b>Address:</b> {selectedOrg?.address?.street || '—'}{selectedOrg?.address?.suite ? `, ${selectedOrg.address.suite}` : ''}, {selectedOrg?.address?.city || ''}, {selectedOrg?.address?.state || ''} {selectedOrg?.address?.zip || ''}</div>
                    </div>
                  </div>

                  <div className="bg-white border border-rcn-border rounded-2xl p-4">
                    <h3 className="text-sm font-semibold m-0 mb-2">Contact</h3>
                    <div className="text-xs space-y-1">
                      <div><b>Contact:</b> {`${selectedOrg?.contact?.first || ''} ${selectedOrg?.contact?.last || ''}`.trim() || '—'}</div>
                      <div><b>Email:</b> {selectedOrg?.contact?.email || '—'}</div>
                      <div><b>Tel:</b> {selectedOrg?.contact?.tel || '—'}</div>
                      <div><b>Fax:</b> {selectedOrg?.contact?.fax || '—'}</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button onClick={() => openOrgModal(selectedOrgId)} className={btnClass}>Edit Organization</button>
                </div>
              </div>
            )}

            {/* Branches Tab */}
            {activeTab === 'branches' && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="text-sm font-semibold m-0">Branches</h3>
                    <p className="text-xs text-rcn-muted mt-1 mb-0">Enable/disable branches within the selected organization.</p>
                  </div>
                  <button onClick={() => openBranchModal(undefined, selectedOrgId)} className={btnPrimaryClass}>+ New Branch</button>
                </div>

                <div className="flex gap-3 items-end mb-3">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-xs text-rcn-muted">Search Branches</label>
                    <input
                      value={branchSearch}
                      onChange={(e) => setBranchSearch(e.target.value)}
                      placeholder="Search by branch name or ID..."
                      className={inputClass}
                    />
                  </div>
                  <button onClick={() => setBranchSearch('')} className={btnClass}>Clear</button>
                </div>

                <div className="overflow-auto">
                  <TableLayout<BranchTableRow>
                    columns={branchTableColumns}
                    data={getFilteredBranches() as BranchTableRow[]}
                    variant="bordered"
                    size="sm"
                    emptyMessage="No branches for this organization."
                    getRowKey={(b) => b.id}
                  />
                </div>
              </div>
            )}

            {/* Departments Tab */}
            {activeTab === 'depts' && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="text-sm font-semibold m-0">Departments</h3>
                    <p className="text-xs text-rcn-muted mt-1 mb-0">Enable/disable departments within the selected organization.</p>
                  </div>
                  <button onClick={() => openDeptModal(undefined, selectedOrgId)} className={btnPrimaryClass}>+ New Department</button>
                </div>

                <div className="flex gap-3 items-end mb-3">
                  <div className="flex flex-col gap-1.5 flex-1 ">
                    <label className="text-xs text-rcn-muted">Search Departments</label>
                    <input
                      value={deptSearch}
                      onChange={(e) => setDeptSearch(e.target.value)}
                      placeholder="Search by department, branch, or ID..."
                      className={inputClass}
                    />
                  </div>
                  <button onClick={() => setDeptSearch('')} className={btnClass}>Clear</button>
                </div>

                <div className="overflow-auto">
                  <TableLayout<DeptTableRow>
                    columns={deptTableColumns}
                    data={getFilteredDepts() as DeptTableRow[]}
                    variant="bordered"
                    size="sm"
                    emptyMessage="No departments for this organization."
                    getRowKey={(d) => d.id}
                  />
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="text-sm font-semibold m-0">Users</h3>
                    <p className="text-xs text-rcn-muted mt-1 mb-0">Create and manage users within the selected organization.</p>
                  </div>
                  <button onClick={() => openUserModal(undefined, selectedOrgId)} className={btnPrimaryClass}>+ New User</button>
                </div>

                <div className="flex gap-3 items-end mb-3">
                  <div className="flex flex-col gap-1.5 flex-1 ">
                    <label className="text-xs text-rcn-muted">Search Users</label>
                    <input
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search by name, email, role, branch/department..."
                      className={inputClass}
                    />
                  </div>
                  <Button variant="secondary" onClick={() => setUserSearch('')}>Clear</Button>
                </div>

                <div className="overflow-auto">
                  <TableLayout<OrgUserRow>
                    columns={orgUserColumns}
                    data={getFilteredUsers() as OrgUserRow[]}
                    variant="bordered"
                    size="sm"
                    emptyMessage="No users for this organization."
                    getRowKey={(u) => u.id}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Organizations;
