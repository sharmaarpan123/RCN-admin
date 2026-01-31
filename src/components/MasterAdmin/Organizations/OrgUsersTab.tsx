"use client";

import React from "react";
import { Button, TableLayout } from "@/components";
import { INPUT_CLASS, BTN_PRIMARY_CLASS } from "./types";
import type { OrgUserRow } from "./types";
import type { TableColumn } from "@/components";

interface OrgUsersTabProps {
  userSearch: string;
  setUserSearch: (v: string) => void;
  filteredUsers: OrgUserRow[];
  columns: TableColumn<OrgUserRow>[];
  onNewUser: () => void;
}

export function OrgUsersTab({
  userSearch,
  setUserSearch,
  filteredUsers,
  columns,
  onNewUser,
}: OrgUsersTabProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-sm font-semibold m-0">Users</h3>
          <p className="text-xs text-rcn-muted mt-1 mb-0">
            Create and manage users within the selected organization.
          </p>
        </div>
        <button onClick={onNewUser} className={BTN_PRIMARY_CLASS}>
          + New User
        </button>
      </div>

      <div className="flex gap-3 items-end mb-3">
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs text-rcn-muted">Search Users</label>
          <input
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Search by name, email, role, branch/department..."
            className={INPUT_CLASS}
          />
        </div>
        <Button variant="secondary" onClick={() => setUserSearch("")}>
          Clear
        </Button>
      </div>

      <div className="overflow-auto">
        <TableLayout<OrgUserRow>
          columns={columns}
          data={filteredUsers}
          variant="bordered"
          size="sm"
          emptyMessage="No users for this organization."
          getRowKey={(u) => u.id}
        />
      </div>
    </div>
  );
}
