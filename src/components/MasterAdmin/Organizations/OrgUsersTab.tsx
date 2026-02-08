"use client";

import React, { useMemo, useState, useCallback } from "react";
import { Button, TableLayout, type TableColumn } from "@/components";
import {
  createOrganizationUserApi,
  deleteOrganizationUserApi,
  getAdminOrganizationUsersApi,
  updateOrganizationUserApi,
} from "@/apis/ApiCalls";
import defaultQueryKeys from "@/utils/adminQueryKeys";
import { useQuery } from "@tanstack/react-query";
import { toastSuccess, toastError } from "@/utils/toast";
import { INPUT_CLASS, BTN_PRIMARY_CLASS, BTN_SMALL_CLASS } from "./types";
import type { OrgUserRow } from "./types";
import { UserModalContent } from "./UserModal";

/** Raw item from GET /api/admin/organization/user list response. */
export type AdminOrganizationUserListItem = {
  _id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  dial_code?: string;
  phone_number?: string;
  fax_number?: string;
  role_id?: number;
  organization_id?: string;
  status?: number;
  notes?: string;
  branches?: unknown[];
  departments?: unknown[];
  createdAt?: string;
  updatedAt?: string;
  admin_cap?: boolean;
  adminCap?: boolean;
  reset_interval_days?: number;
  resetIntervalDays?: number;
  mfa_email?: boolean;
  mfaEmail?: boolean;
  [key: string]: unknown;
};

type AdminOrganizationUsersApiResponse = {
  success?: boolean;
  message?: string;
  data: AdminOrganizationUserListItem[];
  meta?: unknown;
};

/** Maps API user (first_name, last_name, role_id, status, etc.) to table row. role_id: 1 = ORG_ADMIN, 2 = STAFF, 3+ = Staff. */
function mapApiUserToRow(item: AdminOrganizationUserListItem): OrgUserRow {
  const firstLast = [item.first_name, item.last_name].filter(Boolean).join(" ").trim();
  const name = firstLast || item.email || "—";
  const role =
    item.role_id === 1 ? "ORG_ADMIN" : item.role_id === 2 ? "STAFF" : "STAFF";
  return {
    id: item._id,
    name,
    email: item.email ?? "",
    role,
    adminCap: item.admin_cap ?? item.adminCap ?? false,
    resetIntervalDays: item.reset_interval_days ?? item.resetIntervalDays,
    mfaEmail: item.mfa_email ?? item.mfaEmail ?? false,
    enabled: item.status === 1,
  };
}

/** User shape for the modal (UserModalContent). */
type ModalUser = {
  id: string;
  orgId?: string | null;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  adminCap?: boolean;
  enabled?: boolean;
  resetIntervalDays?: number;
  mfaEmail?: boolean;
  notes?: string;
};

export type OrgUsersTabModalControl = {
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
};

interface OrgUsersTabProps {
  selectedOrgId: string;
  modal: OrgUsersTabModalControl;
  invalidateUsers: () => void;
}

function orgUserRowToModalUser(row: OrgUserRow, orgId: string): ModalUser {
  const parts = (row.name ?? "").trim().split(/\s+/);
  return {
    id: row.id,
    orgId,
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" ") ?? "",
    email: row.email,
    role: row.role,
    adminCap: row.adminCap,
    resetIntervalDays: row.resetIntervalDays,
    mfaEmail: row.mfaEmail,
    enabled: row.enabled,
    phone: "",
    notes: "",
  };
}

const safeLower = (s: unknown) => (s ?? "").toString().toLowerCase();

export function OrgUsersTab({
  selectedOrgId,
  modal,
  invalidateUsers,
}: OrgUsersTabProps) {
  const [userSearch, setUserSearch] = useState("");
  const { openModal, closeModal } = modal;

  const saveUser = useCallback(
    async (userId?: string) => {
      const firstName = (document.getElementById("u_first") as HTMLInputElement)?.value.trim();
      const lastName = (document.getElementById("u_last") as HTMLInputElement)?.value.trim();
      const email = (document.getElementById("u_email") as HTMLInputElement)?.value.trim().toLowerCase();
      const phone = (document.getElementById("u_phone") as HTMLInputElement)?.value.trim();
      const role = (document.getElementById("u_role") as HTMLSelectElement)?.value;
      const orgId = (document.getElementById("u_org") as HTMLSelectElement)?.value ?? selectedOrgId;
      const enabled = (document.getElementById("u_enabled") as HTMLSelectElement)?.value === "true";
      const notes = (document.getElementById("u_notes") as HTMLTextAreaElement)?.value.trim();
      const resetIntervalDays = parseInt(
        (document.getElementById("u_reset") as HTMLInputElement)?.value ?? "30",
        10
      );

      if (!firstName) {
        toastError("First Name required.");
        return;
      }
      if (!lastName) {
        toastError("Last Name required.");
        return;
      }
      if (!email) {
        toastError("Email required.");
        return;
      }
      if (!email.includes("@")) {
        toastError("Invalid email.");
        return;
      }

      const roleId = role === "ORG_ADMIN" ? 1 : 2;
      const body = {
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phone || undefined,
        organization_id: orgId || undefined,
        role_id: roleId,
        status: enabled ? 1 : 0,
        notes: notes || undefined,
        reset_interval_days: Number.isFinite(resetIntervalDays) ? resetIntervalDays : 30,
      };

      try {
        if (userId) {
          await updateOrganizationUserApi(userId, body);
        } else {
          await createOrganizationUserApi(body);
        }
        closeModal();
        invalidateUsers();
        toastSuccess("User saved.");
      } catch {
        toastError("Failed to save user.");
      }
    },
    [selectedOrgId, closeModal, invalidateUsers]
  );

  const deleteUser = useCallback(
    async (userId: string) => {
      if (!confirm("Delete this user?")) return;
      try {
        await deleteOrganizationUserApi(userId);
        closeModal();
        invalidateUsers();
        toastSuccess("User deleted.");
      } catch {
        toastError("Failed to delete user.");
      }
    },
    [closeModal, invalidateUsers]
  );

  const openUserModal = useCallback(
    (user: ModalUser | null | undefined, presetOrgId?: string) => {
      const targetOrgId = user?.orgId ?? presetOrgId ?? selectedOrgId ?? "";
      openModal(
        <UserModalContent
          user={user ?? null}
          targetOrgId={targetOrgId}
          presetOrgId={presetOrgId}
          onClose={closeModal}
          onSave={() => saveUser(user?.id)}
          onDelete={user ? () => deleteUser(user.id) : undefined}
        />
      );
    },
    [selectedOrgId, openModal, closeModal, saveUser, deleteUser]
  );

  const { data: usersResponse, isLoading } = useQuery({
    queryKey: [...defaultQueryKeys.organizationUsersList, selectedOrgId],
    queryFn: async () => {
      const res = await getAdminOrganizationUsersApi(selectedOrgId);
      return res.data as AdminOrganizationUsersApiResponse;
    },
    enabled: !!selectedOrgId,
  });

  const usersList = useMemo(() => {
    const raw = usersResponse?.data ?? [];
    return raw.map(mapApiUserToRow);
  }, [usersResponse?.data]);

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return usersList;
    const q = safeLower(userSearch);
    return usersList.filter((u) => {
      const hay = safeLower([u.name, u.email, u.role].filter(Boolean).join(" "));
      return hay.includes(q);
    });
  }, [usersList, userSearch]);

  const columns: TableColumn<OrgUserRow>[] = useMemo(
    () => [
      {
        head: "Name",
        component: (u) => (
          <>
            <b>{u.name}</b>{" "}
            <span className="text-rcn-muted font-mono text-[11px]">({u.id})</span>
          </>
        ),
      },
      { head: "Email", component: (u) => <span className="font-mono">{u.email ?? ""}</span> },
      {
        head: "Status",
        component: (u) =>
          u.enabled ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#b9e2c8] bg-[#f1fbf5] text-[#0b5d36]">
              Enabled
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#f3b8b8] bg-[#fff1f2] text-[#991b1b]">
              Disabled
            </span>
          ),
      },
      {
        head: "Actions",
        component: (u) => (
          <button
            type="button"
            onClick={() => openUserModal(orgUserRowToModalUser(u, selectedOrgId))}
            className={BTN_SMALL_CLASS}
          >
            Edit
          </button>
        ),
      },
    ],
    [selectedOrgId, openUserModal]
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-sm font-semibold m-0">Users</h3>
          <p className="text-xs text-rcn-muted mt-1 mb-0">
            Create and manage users within the selected organization.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openUserModal(undefined, selectedOrgId)}
          className={BTN_PRIMARY_CLASS}
        >
          + New User
        </button>
      </div>

      <div className="flex gap-3 items-end mb-3">
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs text-rcn-muted">Search Users</label>
          <input
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Search by name, email, role..."
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
          loader={isLoading}
        />
      </div>
    </div>
  );
}
