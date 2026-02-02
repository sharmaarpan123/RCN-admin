"use client";

import { Button, CustomNextLink, TableLayout, TableActions, type TableColumn, type TableSortState } from "@/components";
import { useState, useMemo } from "react";
import { toastSuccess } from "@/utils/toast";
import { MOCK_USERS, userDisplayName, type OrgUser } from "../mockData";

export default function OrgPortalUsersPage() {
  const [users, setUsers] = useState<OrgUser[]>(MOCK_USERS);
  const [search, setSearch] = useState("");
  const [body, setBody] = useState<TableSortState>({ sort: "name", order: 1 });

  const resetDemo = () => {
    setUsers(MOCK_USERS);
    toastSuccess("Demo reset. Organization data restored.");
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = users;
    if (q) {
      list = users.filter((u) => {
        const name = userDisplayName(u).toLowerCase();
        const email = (u.email || "").toLowerCase();
        return name.includes(q) || email.includes(q);
      });
    }
    const sortKey = body.sort;
    const dir = body.order ?? 1;
    if (!sortKey) return list;
    return [...list].sort((a, b) => {
      const an = sortKey === "name" ? userDisplayName(a) : (a[sortKey as keyof OrgUser] ?? "");
      const bn = sortKey === "name" ? userDisplayName(b) : (b[sortKey as keyof OrgUser] ?? "");
      const cmp = String(an).localeCompare(String(bn), undefined, { sensitivity: "base" });
      return dir === -1 ? -cmp : cmp;
    });
  }, [users, search, body.sort, body.order]);

  const columns: TableColumn<OrgUser>[] = useMemo(
    () => [
      { head: "Name", sortKey: "name", component: (u) => <span className="font-medium">{userDisplayName(u)}</span> },
      { head: "Email", accessor: "email", sortKey: "email", component: (u) => <span className="text-rcn-muted">{u.email || "—"}</span> },
      { head: "Role", component: (u) => (u.isAdmin ? "Admin" : (u.role || "User")) },
      { head: "Status", component: (u) => (u.isActive ? "Active" : "Inactive") },
      { head: "Assigned", component: (u) => (u.orgAssigned ? "Yes" : "No") },
      {
        head: "Actions",
        tdClassName: "text-left whitespace-nowrap",
        component: (u) => (
          <TableActions
            viewLink={`/org-portal/users/${u.id}`}
            viewButtonText="View"
            editUrl={`/org-portal/users/${u.id}/edit`}
          />
        ),
      },
    ],
    []
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-4 mb-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold m-0">User Manage</h1>
          <p className="text-sm text-rcn-muted m-0 mt-0.5">View users and assign branches & departments. Add or edit via pages.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email…"
            className="flex-1 min-w-[140px] sm:flex-initial sm:w-48 px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30"
          />
          <Button variant="secondary" size="sm" onClick={resetDemo}>Reset Demo</Button>
          <CustomNextLink href="/org-portal/users/add" variant="primary" size="sm">+ Add User</CustomNextLink>
        </div>
      </div>

      <div className="bg-rcn-card border border-rcn-border rounded-2xl shadow-rcn overflow-hidden">
        <TableLayout<OrgUser>
          columns={columns}
          data={filtered}
          body={body}
          setBody={setBody}
          emptyMessage="No users found."
          wrapperClassName="min-w-[640px]"
          getRowKey={(u) => u.id}
        />
      </div>
    </div>
  );
}
