"use client";

import { Button, CustomNextLink } from "@/components";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MOCK_ORG, uid, isValidEmail, type OrgUser, type Branch } from "../../mockData";

export default function OrgPortalUserAddPage() {
  const [branches] = useState<Branch[]>(MOCK_ORG.branches);
  const router = useRouter();

  const findBranch = (id: string) => branches.find((b) => b.id === id) || null;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("User");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [notes, setNotes] = useState("");
  const [branchIds, setBranchIds] = useState<Set<string>>(new Set());
  const [deptIds, setDeptIds] = useState<Set<string>>(new Set());

  const toggleBranch = (id: string) => setBranchIds((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleDept = (id: string) => setDeptIds((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const showBranchIds = Array.from(branchIds);

  const handleSave = () => {
    // Basic validation
    const firstNameTrimmed = (firstName || "").trim();
    const lastNameTrimmed = (lastName || "").trim();
    const emailTrimmed = (email || "").trim().toLowerCase();
    
    if (!firstNameTrimmed || !lastNameTrimmed) {
      alert("First name and last name are required.");
      return;
    }
    if (!emailTrimmed || !isValidEmail(emailTrimmed)) {
      alert("Please enter a valid email.");
      return;
    }
    
    // In a real app, this would POST to an API
    // For demo purposes, just redirect back
    router.push("/org-portal/users");
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <CustomNextLink href="/org-portal/users" variant="ghost" size="sm">← User list</CustomNextLink>
      </div>
      <div className="bg-rcn-card border border-rcn-border rounded-2xl shadow-rcn overflow-hidden">
        <div className="p-4 sm:p-6">
          <h1 className="text-xl font-bold m-0">Add User</h1>
          <p className="text-sm text-rcn-muted m-0 mt-1">Create a new user and assign branches & departments.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div>
              <label className="block text-xs text-rcn-muted mb-1">First Name</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First" className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30" />
            </div>
            <div>
              <label className="block text-xs text-rcn-muted mb-1">Last Name</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last" className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-rcn-muted mb-1">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="email@example.com" className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30" />
            </div>
            <div>
              <label className="block text-xs text-rcn-muted mb-1">Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(000) 000-0000" className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30" />
            </div>
            <div>
              <label className="block text-xs text-rcn-muted mb-1">Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30">
                <option value="User">User</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
                <option value="Super Admin">Super Admin</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-rcn-muted mb-1.5">Access</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} className="rounded border-rcn-border" />
                <span className="text-sm">Admin capabilities</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded border-rcn-border" />
                <span className="text-sm">Active user</span>
              </label>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-rcn-muted mb-1">Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Optional notes" className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30 resize-y" />
            </div>
          </div>

          <div className="border-t border-rcn-border mt-6 pt-6">
            <h2 className="font-bold text-sm m-0 mb-2">Assign Branch & Department</h2>
            <p className="text-xs text-rcn-muted m-0 mb-3">Select branches and departments for this user.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs text-rcn-muted mb-1.5">Branches</label>
                <div className="border border-rcn-border rounded-xl p-3 max-h-40 overflow-auto space-y-1">
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
                <div className="border border-rcn-border rounded-xl p-3 max-h-40 overflow-auto space-y-2">
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
                  {!showBranchIds.length && <p className="text-xs text-rcn-muted m-0">Select branches to see departments.</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-rcn-border">
            <Button variant="primary" size="sm" onClick={handleSave}>Save</Button>
            <CustomNextLink href="/org-portal/users" variant="secondary" size="sm">Cancel</CustomNextLink>
          </div>
        </div>
      </div>
    </div>
  );
}
