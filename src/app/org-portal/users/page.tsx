"use client";

import { getOrganizationUsersApi, deleteOrganizationUserApi } from "@/apis/ApiCalls";
import { CustomNextLink, TableLayout, TableActions, type TableColumn, type TableSortState } from "@/components";
import { DebouncedInput, ConfirmModal } from "@/components";
import { catchAsync, checkResponse } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/orgQueryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";

interface OrgUserRow {
  _id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  is_admin?: boolean;
  is_active?: boolean;
  org_assigned?: boolean;
  role?: string;
}

function userDisplayName(u: OrgUserRow): string {
  const first = (u.first_name ?? "").trim();
  const last = (u.last_name ?? "").trim();
  if (first || last) return [first, last].filter(Boolean).join(" ");
  return (u.email ?? "").trim() || "—";
}

const USERS_QUERY_KEY = defaultQueryKeys.userList;

export default function OrgPortalUsersPage() {
  const [search, setSearch] = useState("");
  const [body, setBody] = useState<TableSortState>({ order: 1 });
  const [deleteUser, setDeleteUser] = useState<{ id: string; name: string } | null>(null);
  const queryClient = useQueryClient();

  const { data: apiData, isLoading } = useQuery({
    queryKey: [...USERS_QUERY_KEY, search],
    queryFn: async () => {
      try {
        const res = await getOrganizationUsersApi({ search });
        if (!checkResponse({ res })) return { data: [] };
        return res.data;
      } catch {
        return { data: [] };
      }
    },
  });

  const { isPending: isDeleting, mutate: deleteUserMutation } = useMutation({
    mutationFn: catchAsync(async (userId: string) => {
      const res = await deleteOrganizationUserApi(userId);
      if (checkResponse({ res, showSuccess: true })) {
        queryClient.invalidateQueries({ queryKey: [...USERS_QUERY_KEY] });
        setDeleteUser(null);
      }
    }),
  });

  const handleConfirmDelete = () => {
    if (deleteUser) deleteUserMutation(deleteUser.id);
  };

  const columns: TableColumn<OrgUserRow>[] = useMemo(
    () => [
      { head: "Name", component: (u) => <span className="font-medium">{userDisplayName(u)}</span> },
      { head: "Email", accessor: "email", component: (u) => <span className="text-rcn-muted">{u.email || "—"}</span> },
      { head: "Role", component: (u) => (u.is_admin ? "Admin" : (u.role || "User")) },
      { head: "Status", component: (u) => (u.is_active !== false ? "Active" : "Inactive") },
      { head: "Assigned", component: (u) => (u.org_assigned ? "Yes" : "No") },
      {
        head: "Actions",
        tdClassName: "text-left whitespace-nowrap",
        component: (u) => (
          <TableActions
            viewLink={`/org-portal/users/${u._id}`}
            viewButtonText="View"
            editUrl={`/org-portal/users/${u._id}/edit`}
            setDeleteModel={() => setDeleteUser({ id: u._id, name: userDisplayName(u) })}
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
          <div className="flex-1 min-w-[140px] sm:flex-initial sm:w-48">
            <label className="sr-only" htmlFor="user-search">Search users</label>
            <DebouncedInput
              id="user-search"
              value={search}
              onChange={setSearch}
              placeholder="Search name or email…"
              debounceMs={300}
            />
          </div>
          <CustomNextLink href="/org-portal/users/add" variant="primary" size="sm">
            + Add User
          </CustomNextLink>
        </div>
      </div>

      <div className="bg-rcn-card border border-rcn-border rounded-2xl shadow-rcn overflow-hidden">
        <div className="p-4">
          <div className="border border-rcn-border rounded-xl overflow-hidden">
            <TableLayout<OrgUserRow>
              columns={columns}
              data={apiData?.data ?? []}
              body={body as TableSortState & Record<string, string>}
              setBody={setBody}
              emptyMessage={search.trim() ? "No users match your search." : "No users yet. Add a user to get started."}
              loader={isLoading}
              wrapperClassName="min-w-[260px]"
              getRowKey={(u) => u._id}
            />
          </div>
        </div>
      </div>

      <ConfirmModal
        type="delete"
        isOpen={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        onConfirm={handleConfirmDelete}
        message={deleteUser ? `Are you sure you want to delete "${deleteUser.name}"?` : undefined}
        confirmDisabled={isDeleting}
      />
    </div>
  );
}
