"use client";

import { CustomNextLink } from "@/components";
import { useOrgPortal } from "@/context/OrgPortalContext";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrgPortalUserViewPage() {
  const params = useParams<{ id: string }>();

  const {
    users,
    userDisplayName: ctxDisplayName,
    branches,
    findBranch,

  } = useOrgPortal();

  const user = users.find((u) => u.id === params.id);
  const brs = branches();

  const [branchIds, setBranchIds] = useState<Set<string>>(new Set(user?.branchIds ?? []));
  const [deptIds, setDeptIds] = useState<Set<string>>(new Set(user?.deptIds ?? []));
  const showBranchIds = Array.from(branchIds);

  useEffect(() => {
    if (user) {
      setBranchIds(new Set(user.branchIds ?? []));
      setDeptIds(new Set(user.deptIds ?? []));
    }
  }, [user]);



  if (!user) {
    return (
      <div>
        <CustomNextLink href="/org-portal/users" variant="ghost" size="sm">← User list</CustomNextLink>
        <p className="mt-4 text-rcn-muted">User not found.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <CustomNextLink href="/org-portal/users" variant="ghost" size="sm">← User list</CustomNextLink>
      </div>
      <div className="bg-rcn-card border border-rcn-border rounded-2xl shadow-rcn overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold m-0">View User</h1>
              <p className="text-sm text-rcn-muted m-0 mt-1">{ctxDisplayName(user)}</p>
            </div>
            <CustomNextLink href={`/org-portal/users/${user.id}/edit`} variant="primary" size="sm">Edit</CustomNextLink>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div>
              <label className="block text-xs text-rcn-muted mb-1">First Name</label>
              <input value={user.firstName} readOnly className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-rcn-bg/50 read-only:bg-rcn-bg/50" />
            </div>
            <div>
              <label className="block text-xs text-rcn-muted mb-1">Last Name</label>
              <input value={user.lastName} readOnly className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-rcn-bg/50 read-only:bg-rcn-bg/50" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-rcn-muted mb-1">Email</label>
              <input value={user.email || ""} readOnly className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-rcn-bg/50 read-only:bg-rcn-bg/50" />
            </div>
            <div>
              <label className="block text-xs text-rcn-muted mb-1">Phone</label>
              <input value={user.phone || ""} readOnly className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-rcn-bg/50 read-only:bg-rcn-bg/50" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs text-rcn-muted mb-1">Notes</label>
              <textarea value={user.notes || ""} readOnly rows={2} className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-rcn-bg/50 read-only:bg-rcn-bg/50 resize-y" />
            </div>
          </div>

          <div className="border-t border-rcn-border mt-6 pt-6">
            <h2 className="font-bold text-sm m-0 mb-2">Assign Branch & Department</h2>
            <p className="text-xs text-rcn-muted m-0 mb-3">Edit assignments below and click Save assignments.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs text-rcn-muted mb-1.5">Branches</label>
                <div className="border border-rcn-border rounded-xl p-3 max-h-40 overflow-auto space-y-1">
                  {brs.map((b) => (
                    <label key={b.id} className="flex items-center gap-2 py-1 cursor-pointer">
                      <input readOnly type="checkbox" checked={branchIds.has(b.id)} className="rounded border-rcn-border" />
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
                            <input readOnly type="checkbox" checked={deptIds.has(d.id)} className="rounded border-rcn-border" />
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



          <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-rcn-border justify-between">

            <CustomNextLink href="/org-portal/users" variant="secondary" size="sm" className="shrink-0">Back to list</CustomNextLink>
          </div>
        </div>
      </div>
    </div>
  );
}
