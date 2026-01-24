"use client";

import { useOrgPortal } from "@/context/OrgPortalContext";
import type { OrgUser } from "@/context/OrgPortalContext";
import { Button, Modal } from "@/components";
import { useState, useMemo } from "react";

export default function OrgPortalUsersPage() {
  const {
    org,
    users,
    userDisplayName: ctxDisplayName,
    branches,
    findBranch,
    createUser,
    saveUser,
    saveUserBranches,
    saveUserDepts,
    updatePassword,
    toggleUserActive,
    removeUserFromOrg,
    deleteUser,
    toast,
    resetDemo,
  } = useOrgPortal();

  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<
    | { mode: "add" }
    | { mode: "view"; user: OrgUser }
    | { mode: "edit"; user: OrgUser }
    | null
  >(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const name = ctxDisplayName(u).toLowerCase();
      const email = (u.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [users, search, ctxDisplayName]);

  const handleAddSave = (form: Partial<OrgUser>, branchIds: string[], branchFilter: string[], deptIds: string[]) => {
    const u = createUser();
    saveUser(u, form);
    saveUserBranches(u, branchIds);
    saveUserDepts(u, branchFilter, deptIds);
    setModal(null);
  };

  const handleEditSave = (u: OrgUser, form: Partial<OrgUser>, branchIds: string[], branchFilter: string[], deptIds: string[]) => {
    if (!saveUser(u, form)) return;
    saveUserBranches(u, branchIds);
    saveUserDepts(u, branchFilter, deptIds);
    setModal(null);
  };

  const handleDelete = (u: OrgUser) => {
    if (window.prompt(`Type DELETE to permanently delete ${ctxDisplayName(u)}:`)?.trim().toUpperCase() !== "DELETE") {
      toast("Cancelled", "Delete not confirmed.");
      return;
    }
    deleteUser(u);
    setModal(null);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-xl font-bold m-0">User Manage</h1>
          <p className="text-sm text-rcn-muted m-0 mt-0.5">View users and assign branches & departments. Add or edit via modals.</p>
        </div>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email…"
            className="px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30 w-48"
          />
          <Button variant="secondary" size="sm" onClick={resetDemo}>Reset Demo</Button>
          <Button variant="primary" size="sm" onClick={() => setModal({ mode: "add" })}>+ Add User</Button>
        </div>
      </div>

      <div className="bg-rcn-card border border-rcn-border rounded-2xl shadow-rcn overflow-hidden">
        <div className="overflow-auto">
          <table className="w-full border-collapse text-sm min-w-[700px]">
            <thead>
              <tr className="bg-rcn-bg/90">
                <th className="px-3 py-2.5 text-left text-xs uppercase tracking-wide text-rcn-muted font-semibold">Name</th>
                <th className="px-3 py-2.5 text-left text-xs uppercase tracking-wide text-rcn-muted font-semibold">Email</th>
                <th className="px-3 py-2.5 text-left text-xs uppercase tracking-wide text-rcn-muted font-semibold">Role</th>
                <th className="px-3 py-2.5 text-left text-xs uppercase tracking-wide text-rcn-muted font-semibold">Status</th>
                <th className="px-3 py-2.5 text-left text-xs uppercase tracking-wide text-rcn-muted font-semibold">Assigned</th>
                <th className="px-3 py-2.5 text-right text-xs uppercase tracking-wide text-rcn-muted font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!filtered.length && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-rcn-muted text-xs text-center">No users found.</td>
                </tr>
              )}
              {filtered.map((u) => (
                <tr key={u.id} className="border-t border-rcn-border/60 hover:bg-rcn-accent/5">
                  <td className="px-3 py-2.5 font-medium">{ctxDisplayName(u)}</td>
                  <td className="px-3 py-2.5 text-rcn-muted">{u.email || "—"}</td>
                  <td className="px-3 py-2.5">{u.isAdmin ? "Admin" : (u.role || "User")}</td>
                  <td className="px-3 py-2.5">{u.isActive ? "Active" : "Inactive"}</td>
                  <td className="px-3 py-2.5">{u.orgAssigned ? "Yes" : "No"}</td>
                  <td className="px-3 py-2.5 text-right">
                    <Button variant="secondary" size="sm" onClick={() => setModal({ mode: "view", user: u })}>View</Button>
                    <span className="inline-block w-2" />
                    <Button variant="secondary" size="sm" onClick={() => setModal({ mode: "edit", user: u })}>Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <UserModal
          mode={modal.mode}
          user={modal.mode === "add" ? null : modal.user}
          org={org}
          branches={branches}
          findBranch={findBranch}
          onClose={() => setModal(null)}
          onAddSave={handleAddSave}
          onEditSave={handleEditSave}
          onAssignSave={(u, brIds, dpIds) => { saveUserBranches(u, brIds); saveUserDepts(u, brIds, dpIds); }}
          onDelete={handleDelete}
          onToggleActive={toggleUserActive}
          onRemoveFromOrg={removeUserFromOrg}
          onUpdatePassword={updatePassword}
          onSwitchToEdit={modal.mode === "view" ? () => setModal({ mode: "edit", user: modal.user }) : undefined}
        />
      )}
    </div>
  );
}

// --- User Modal (Add / View / Edit) ---
function UserModal({
  mode,
  user,
  org,
  branches,
  findBranch,
  onClose,
  onAddSave,
  onEditSave,
  onAssignSave,
  onDelete,
  onToggleActive,
  onRemoveFromOrg,
  onUpdatePassword,
  onSwitchToEdit,
}: {
  mode: "add" | "view" | "edit";
  user: OrgUser | null;
  org: { name: string };
  branches: () => { id: string; name: string; departments?: { id: string; name: string }[] }[];
  findBranch: (id: string) => { id: string; name: string; departments?: { id: string; name: string }[] } | null;
  onClose: () => void;
  onAddSave: (form: Partial<OrgUser>, branchIds: string[], branchFilter: string[], deptIds: string[]) => void;
  onEditSave: (u: OrgUser, form: Partial<OrgUser>, branchIds: string[], branchFilter: string[], deptIds: string[]) => void;
  onAssignSave: (u: OrgUser, branchIds: string[], deptIds: string[]) => void;
  onDelete: (u: OrgUser) => void;
  onToggleActive: (u: OrgUser) => void;
  onRemoveFromOrg: (u: OrgUser) => void;
  onUpdatePassword: (u: OrgUser) => void;
  onSwitchToEdit?: () => void;
}) {
  const brs = branches();
  const isView = mode === "view";
  const isAdd = mode === "add";

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [role, setRole] = useState(user?.role ?? "User");
  const [isAdmin, setIsAdmin] = useState(user?.isAdmin ?? false);
  const [isActive, setIsActive] = useState(user?.isActive ?? true);
  const [notes, setNotes] = useState(user?.notes ?? "");
  const [branchIds, setBranchIds] = useState<Set<string>>(new Set(user?.branchIds ?? []));
  const [deptIds, setDeptIds] = useState<Set<string>>(new Set(user?.deptIds ?? []));
  const [showPassword, setShowPassword] = useState(false);
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");

  const toggleBranch = (id: string) => setBranchIds((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleDept = (id: string) => setDeptIds((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  const showBranchIds = Array.from(branchIds);

  const handleSave = () => {
    const form: Partial<OrgUser> = { firstName, lastName, email, phone, role, isAdmin, isActive, notes };
    const brIds = Array.from(branchIds);
    const dpIds = Array.from(deptIds);
    if (isAdd) {
      onAddSave(form, brIds, brIds, dpIds);
    } else if (user) {
      onEditSave(user, form, brIds, brIds, dpIds);
    }
  };

  const handleAssignSave = () => {
    if (!user) return;
    onAssignSave(user, Array.from(branchIds), Array.from(deptIds));
  };

  const handlePassword = () => {
    if (!user) return;
    if (p1.length < 8) return;
    if (p1 !== p2) return;
    onUpdatePassword(user);
    setP1("");
    setP2("");
    setShowPassword(false);
  };

  return (
    <Modal isOpen onClose={onClose} maxWidth="640px">
      <div className="p-4 max-h-[85vh] overflow-auto">
        <h3 className="font-bold m-0">{isAdd ? "Add User" : isView ? "View User" : "Edit User"}</h3>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div>
            <label className="block text-xs text-rcn-muted mb-1">First Name</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} readOnly={isView} placeholder="First" className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30 read-only:bg-rcn-bg/50" />
          </div>
          <div>
            <label className="block text-xs text-rcn-muted mb-1">Last Name</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} readOnly={isView} placeholder="Last" className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30 read-only:bg-rcn-bg/50" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-rcn-muted mb-1">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} readOnly={isView} type="email" placeholder="email@example.com" className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30 read-only:bg-rcn-bg/50" />
          </div>
          <div>
            <label className="block text-xs text-rcn-muted mb-1">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} readOnly={isView} placeholder="(000) 000-0000" className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30 read-only:bg-rcn-bg/50" />
          </div>
          <div>
            <label className="block text-xs text-rcn-muted mb-1">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} disabled={isView} className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30 disabled:bg-rcn-bg/50">
              <option value="User">User</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
              <option value="Super Admin">Super Admin</option>
            </select>
          </div>
          {!isView && (
            <>
              <label className="col-span-2 block text-xs text-rcn-muted mb-1">Access</label>
              <label className="col-span-2 flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} className="rounded border-rcn-border" />
                <span className="text-sm">Admin capabilities</span>
              </label>
              <label className="col-span-2 flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded border-rcn-border" />
                <span className="text-sm">Active user</span>
              </label>
            </>
          )}
          <div className="col-span-2">
            <label className="block text-xs text-rcn-muted mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} readOnly={isView} rows={2} placeholder="Optional notes" className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30 read-only:bg-rcn-bg/50 resize-y" />
          </div>
        </div>

        <div className="border-t border-rcn-border mt-4 pt-4">
          <h4 className="font-bold text-sm m-0 mb-2">Assign Branch & Department</h4>
          <p className="text-xs text-rcn-muted m-0 mb-2">Select branches and departments for this user.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-rcn-muted mb-1.5">Branches</label>
              <div className="border border-rcn-border rounded-xl p-2 max-h-32 overflow-auto space-y-1">
                {brs.map((b) => (
                  <label key={b.id} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input type="checkbox" checked={branchIds.has(b.id)} onChange={() => toggleBranch(b.id)} className="rounded border-rcn-border" />
                    <span className="text-sm">{b.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-rcn-muted mb-1.5">Departments (by branch)</label>
              <div className="border border-rcn-border rounded-xl p-2 max-h-32 overflow-auto space-y-2">
                {showBranchIds.map((brId) => {
                  const br = findBranch(brId);
                  if (!br) return null;
                  return (
                    <div key={br.id}>
                      <p className="text-xs font-bold text-rcn-accent m-0 mb-1">{br.name}</p>
                      {(br.departments ?? []).map((d) => (
                        <label key={d.id} className="flex items-center gap-2 py-0.5 ml-2 cursor-pointer">
                          <input type="checkbox" checked={deptIds.has(d.id)} onChange={() => toggleDept(d.id)} className="rounded border-rcn-border" />
                          <span className="text-sm">{d.name}</span>
                        </label>
                      ))}
                    </div>
                  );
                })}
                {!showBranchIds.length && <p className="text-xs text-rcn-muted m-0">Select branches (Branches) that contain the departments to show.</p>}
              </div>
            </div>
          </div>
          <p className="text-xs text-rcn-muted mt-2">Select branches above; departments are listed for those branches.</p>
        </div>

        {!isAdd && user && (
          <div className="border-t border-rcn-border mt-4 pt-4">
            <h4 className="font-bold text-sm m-0 mb-2">Manage Password</h4>
            {!showPassword ? (
              <Button variant="secondary" size="sm" onClick={() => setShowPassword(true)}>Change Password</Button>
            ) : (
              <div className="space-y-2">
                <input type="password" value={p1} onChange={(e) => setP1(e.target.value)} placeholder="New password (8+ chars)" className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border" />
                <input type="password" value={p2} onChange={(e) => setP2(e.target.value)} placeholder="Confirm" className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border" />
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" onClick={handlePassword} disabled={p1.length < 8 || p1 !== p2}>Update Password</Button>
                  <Button variant="secondary" size="sm" onClick={() => { setShowPassword(false); setP1(""); setP2(""); }}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-6 justify-between">
          <div className="flex gap-2">
            {!isAdd && user && (
              <>
                <Button variant="secondary" size="sm" onClick={() => onToggleActive(user)}>{user.isActive ? "Deactivate" : "Activate"}</Button>
                <Button variant="danger" size="sm" onClick={() => onRemoveFromOrg(user)} disabled={!user.orgAssigned}>Remove from Org</Button>
                <Button variant="danger" size="sm" onClick={() => onDelete(user)}>Delete</Button>
              </>
            )}
          </div>
          <div className="flex gap-2">
            {isView && user && onSwitchToEdit && <Button variant="primary" size="sm" onClick={onSwitchToEdit}>Edit</Button>}
            {isView && user && <Button variant="primary" size="sm" onClick={handleAssignSave}>Save assignments</Button>}
            {(isAdd || !isView) && <Button variant="primary" size="sm" onClick={handleSave}>Save</Button>}
            <Button variant="secondary" size="sm" onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
