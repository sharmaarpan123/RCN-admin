"use client";

import {
  deleteAdminRoleApi,
  getAdminRolesApi,
} from "@/apis/ApiCalls";
import type { TableColumn } from "@/components";
import { Button, ConfirmModal, DebouncedInput, Modal, TableLayout } from "@/components";
import defaultQueryKeys from "@/utils/adminQueryKeys";
import { catchAsync, checkResponse } from "@/utils/commonFunc";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { rolesTableColumns } from "./columns";
import { RoleModal } from "./RoleModal";
import type { AdminRole, RoleTableRow } from "./types";
import { getRoleId, INPUT_CLASS } from "./types";

type RolesApiResponse = {
  success?: boolean;
  message?: string;
  data?: AdminRole[];
};

export function RolesPermissionsPage() {
  const queryClient = useQueryClient();
  const [body, setBody] = useState<{ search: string }>({
    search: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editRole, setEditRole] = useState<AdminRole | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RoleTableRow | null>(null);

  const { data: listResponse, isLoading } = useQuery({
    queryKey: defaultQueryKeys.rolesList,
    queryFn: async () => {
      const res = await getAdminRolesApi();
      if (!checkResponse({ res })) return { data: [] } as RolesApiResponse;
      return (res?.data ?? { data: [] }) as RolesApiResponse;
    },
  });

  const list = useMemo(
    () => (listResponse?.data ?? []) as AdminRole[],
    [listResponse]
  );

  const filteredList = useMemo(() => {
    if (!body.search.trim()) return list;
    const q = body.search.toLowerCase();
    return list.filter(
      (r) =>
        (r.name ?? "").toLowerCase().includes(q) ||
        getRoleId(r).toLowerCase().includes(q)
    );
  }, [list, body.search]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: defaultQueryKeys.rolesList });
  };

  const openNew = () => {
    setEditRole(null);
    setModalOpen(true);
  };

  const openEdit = (role: RoleTableRow) => {
    setEditRole(role);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditRole(null);
  };

  const handleDelete = () => {
    const role = deleteTarget;
    setDeleteTarget(null);
    if (!role) return;
    const id = getRoleId(role);
    if (!id) return;
    catchAsync(async () => {
      const res = await deleteAdminRoleApi(id);
      if (checkResponse({ res, showSuccess: true })) invalidate();
    })();
  };

  const columns: TableColumn<RoleTableRow>[] = useMemo(
    () =>
      rolesTableColumns({
        onEdit: openEdit,
        onDelete: (r) => setDeleteTarget(r),
      }),
    []
  );

  return (
    <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4 mb-4">
      <Modal isOpen={modalOpen} onClose={closeModal} maxWidth="560px">
        <RoleModal
          key={editRole ? getRoleId(editRole) : "new"}
          role={editRole}
          onClose={closeModal}
          onSuccess={invalidate}
        />
      </Modal>

      <ConfirmModal
        type="delete"
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete role"
        message={
          deleteTarget
            ? `Are you sure you want to delete the role "${deleteTarget.name}"? This action cannot be undone.`
            : "Are you sure you want to delete this role?"
        }
      />

      <div className="flex justify-end items-start flex-wrap gap-3">
        
        <Button variant="primary" size="md" onClick={openNew}>
          + New Role
        </Button>
      </div>

      <div className="flex flex-wrap gap-2.5 items-end mt-3">
        <div className="flex flex-col gap-1.5 min-w-[260px] flex-1">
          <label className="text-xs text-rcn-muted">Search</label>
          <DebouncedInput
            placeholder="Role name or ID"
            value={body.search}
            onChange={(v) => setBody({ ...body, search: v })}
            className={INPUT_CLASS}
          />
        </div>
        <Button variant="secondary" size="md" onClick={() => setBody({ ...body, search: "" })}>
          Clear
        </Button>
      </div>

      <div className="overflow-auto mt-3">
        <TableLayout<RoleTableRow>
          columns={columns}
          data={filteredList}
          loader={isLoading}
          variant="bordered"
          size="sm"
          emptyMessage="No roles yet. Create a role to get started."
          getRowKey={(row) => getRoleId(row) || row.name || ""}
        />
      </div>
    </div>
  );
}
