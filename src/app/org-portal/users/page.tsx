"use client";

import { useOrgPortal } from "@/context/OrgPortalContext";
import { Button, CustomNextLink } from "@/components";
import { useState, useMemo } from "react";

export default function OrgPortalUsersPage() {
  const {
    users,
    userDisplayName: ctxDisplayName,
    resetDemo,
  } = useOrgPortal();

  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const name = ctxDisplayName(u).toLowerCase();
      const email = (u.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [users, search, ctxDisplayName]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-xl font-bold m-0">User Manage</h1>
          <p className="text-sm text-rcn-muted m-0 mt-0.5">View users and assign branches & departments. Add or edit via pages.</p>
        </div>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email…"
            className="px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30 w-48"
          />
          <Button variant="secondary" size="sm" onClick={resetDemo}>Reset Demo</Button>
          <CustomNextLink href="/org-portal/users/add" variant="primary" size="sm">+ Add User</CustomNextLink>
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
                    <CustomNextLink href={`/org-portal/users/${u.id}`} variant="secondary" size="sm">View</CustomNextLink>
                    <span className="inline-block w-2" />
                    <CustomNextLink href={`/org-portal/users/${u.id}/edit`} variant="secondary" size="sm">Edit</CustomNextLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
