"use client";

import {
  createAdminOrganizationUserApi,
  deleteOrganizationUserApi,
  getAdminOrganizationUsersApi,
  updateOrganizationUserApi,
} from "@/apis/ApiCalls";
import { Button, TableLayout, type TableColumn } from "@/components";
import { DebouncedInput } from "@/components/DebouncedInput";
import { adminCreateUserSchema } from "@/schemas/adminOrganizationUser";
import defaultQueryKeys from "@/utils/adminQueryKeys";
import { checkResponse } from "@/utils/commonFunc";
import { toastError, toastSuccess } from "@/utils/toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import type { AdminOrganizationUserListItem } from "./types";
import { INPUT_CLASS } from "./types";
import { UserModalContent, type UserModalFormValues } from "./UserModal";
import ConfirmModal from "@/components/ConfirmModal";

type AdminOrganizationUsersApiResponse = {
  success?: boolean;
  message?: string;
  data: AdminOrganizationUserListItem[];
  meta?: unknown;
};

interface OrgUsersTabProps {
  selectedOrgId: string;

  invalidateUsers: () => void;
}



export function OrgUsersTab({
  selectedOrgId,

  invalidateUsers,
}: OrgUsersTabProps) {
  const [body, setbody] = useState<{ search: string }>({ search: "" });
  const [userModal, setUserModal] = useState<{ isOpen: boolean, userId?: string | null, mode: "edit" | "create" }>({ isOpen: false, userId: null, mode: "create" });
  const [deleteUserModal, setDeleteUserModal] = useState<{ isOpen: boolean, userId?: string | null }>({ isOpen: false, userId: null });

  const saveUserMutation = useMutation({
    mutationFn: async ({
      data,
      userId,
    }: {
      data: UserModalFormValues;
      userId?: string;
    }) => {
      const updateBody = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email.trim().toLowerCase(),
        dial_code: data.dial_code || undefined,
        phone_number: data.phone_number || undefined,
        fax_number: data.fax_number || undefined,
        organization_id: data.organization_id || selectedOrgId || undefined,
        status: data.status,
        notes: data.notes || undefined,
      };

      if (userId) {
        const res = await updateOrganizationUserApi(userId, updateBody);
        if (!checkResponse({ res, showSuccess: true })) throw new Error("Update failed.");
        return { mode: "update" as const };
      }

      const createBody = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email.trim().toLowerCase(),
        ...(data.dial_code ? { dial_code: data.dial_code } : {}),
        ...(data.phone_number ? { phone_number: data.phone_number } : {}),
        ...(data.fax_number ? { fax_number: data.fax_number } : {}),
        ...(data.notes ? { notes: data.notes } : {}),
      };
      const parsed = adminCreateUserSchema.shape.body.safeParse(createBody);
      if (!parsed.success) {
        const first = parsed.error.flatten().formErrors[0];
        throw new Error(first ?? "Invalid form data.");
      }
      const res = await createAdminOrganizationUserApi(selectedOrgId, parsed.data);
      if (!checkResponse({ res, showSuccess: true })) throw new Error("Create failed.");
      return { mode: "create" as const };
    },
    onSuccess: (result) => {
      toastSuccess(result.mode === "update" ? "User updated." : "User created.");
      invalidateUsers();
      setUserModal({ isOpen: false, userId: null, mode: "create" });
    },
    onError: (err: Error) => {
      toastError(err.message ?? "Failed to save user.");
    },
  });


  const deleteUserConfirmation = useCallback(
    async (userId: string) => {

      try {
        const res = await deleteOrganizationUserApi(userId);
        if (checkResponse({ res, showSuccess: true })) {
          toastSuccess("User deleted.");
          invalidateUsers();
          setDeleteUserModal({ isOpen: false, userId: null });
        }
      } catch {
        toastError("Failed to delete user.");
      }
    },
    [invalidateUsers]
  );




  const { data: usersResponse, isLoading } = useQuery({
    queryKey: [...defaultQueryKeys.organizationUsersList, selectedOrgId, body.search],
    queryFn: async () => {
      const res = await getAdminOrganizationUsersApi(selectedOrgId, { ...body });
      if (!checkResponse({ res })) return { data: [] } as AdminOrganizationUsersApiResponse;
      return res.data as AdminOrganizationUsersApiResponse;
    },
    enabled: !!selectedOrgId,
  });




  const columns: TableColumn<AdminOrganizationUserListItem>[] = useMemo(
    () => [
      {
        head: "Name",
        component: (u) => {
          const name = [u.first_name, u.last_name].filter(Boolean).join(" ").trim() || u.email || "—";
          return (
            <>
              <b>{name}</b>{" "}
              <span className="text-rcn-muted font-mono text-[11px]">({u._id})</span>
            </>
          );
        },
      },
      { head: "Email", component: (u) => <span className="font-mono">{u.email ?? ""}</span> },
      {
        head: "Status",
        component: (u) =>
          u.status === 1 ? (
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
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setUserModal({ isOpen: true, userId: u._id, mode: "edit" })}
            >
              Edit
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDeleteUserModal({ isOpen: true, userId: u._id })}
              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div>
      <ConfirmModal
        type="delete"
        isOpen={deleteUserModal.isOpen}
        onClose={() => setDeleteUserModal({ isOpen: false, userId: null })}
        onConfirm={() => deleteUserConfirmation(deleteUserModal.userId ?? "")}
      />
      <UserModalContent
        isOpen={userModal.isOpen}
        userId={userModal.userId ?? undefined}
        targetOrgId={selectedOrgId}
        presetOrgId={selectedOrgId}
        mode={userModal.mode}
        onClose={() => setUserModal({ isOpen: false, userId: null, mode: "create" })}
        onSave={(data) => saveUserMutation.mutate({ data, userId: userModal.userId ?? undefined })}
        isPending={saveUserMutation.isPending}
      />
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-sm font-semibold m-0">Users</h3>
          <p className="text-xs text-rcn-muted mt-1 mb-0">
            Create and manage users within the selected organization.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setUserModal({ isOpen: true, userId: null, mode: "create" })}>
          + New User
        </Button>
      </div>

      <div className="flex gap-3 items-end mb-3">
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs text-rcn-muted">Search Users</label>
          <DebouncedInput
            value={body.search}
            onChange={(value: string) => setbody({ ...body, search: value })}
            placeholder="Search by name, email, role..."
            className={INPUT_CLASS}
            debounceMs={500}
          />
        </div>
        <Button variant="secondary" onClick={() => setbody({ ...body, search: "" })}>
          Clear
        </Button>
      </div>

      <div className="overflow-auto">
        <TableLayout<AdminOrganizationUserListItem>
          columns={columns}
          data={usersResponse?.data ?? []}
          variant="bordered"
          size="sm"
          emptyMessage="No users for this organization."
          getRowKey={(u) => u._id}
          loader={isLoading}
        />
      </div>
    </div>
  );
}
