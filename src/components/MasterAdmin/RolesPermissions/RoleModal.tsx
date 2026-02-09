"use client";

import {
  createAdminRoleApi,
  updateAdminRoleApi,
} from "@/apis/ApiCalls";
import { Button } from "@/components";
import defaultQueryKeys from "@/utils/adminQueryKeys";
import { catchAsync, checkResponse } from "@/utils/commonFunc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getAdminAssignablePermissionsApi } from "@/apis/ApiCalls";
import type { AdminRole, AssignablePermission } from "./types";
import { getRoleId, INPUT_CLASS } from "./types";

interface RoleModalProps {
  role: AdminRole | null;
  onClose: () => void;
  onSuccess: () => void;
}

function getInitialPermissionIds(role: AdminRole | null): Set<string> {
  const ids =
    role?.permissions?.map((p) => p._id) ?? role?.permission_ids ?? [];
  return new Set(ids);
}

export function RoleModal({ role, onClose, onSuccess }: RoleModalProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(role?.name ?? "");
  const [permissionIds, setPermissionIds] = useState<Set<string>>(() =>
    getInitialPermissionIds(role)
  );

  const isEdit = !!role;

  const { data: permissionsResponse } = useQuery({
    queryKey: defaultQueryKeys.assignablePermissions,
    queryFn: async () => {
      const res = await getAdminAssignablePermissionsApi();
      if (!checkResponse({ res })) return { data: [] };
      return res.data as { success?: boolean; data?: AssignablePermission[] };
    },
  });

  const permissions = useMemo(
    () => (permissionsResponse?.data ?? []) as AssignablePermission[],
    [permissionsResponse]
  );

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: defaultQueryKeys.rolesList });
  };

  const createMutation = useMutation({
    mutationFn: catchAsync(async (payload: { name: string; permission_ids: string[] }) => {
      const res = await createAdminRoleApi(payload);
      if (checkResponse({ res, showSuccess: true })) {
        invalidate();
        onSuccess();
        onClose();
      }
    }),
  });

  const updateMutation = useMutation({
    mutationFn: catchAsync(
      async (payload: { id: string; name: string; permission_ids: string[] }) => {
        const res = await updateAdminRoleApi(payload.id, {
          name: payload.name,
          permission_ids: payload.permission_ids,
        });
        if (checkResponse({ res, showSuccess: true })) {
          invalidate();
          onSuccess();
          onClose();
        }
      }
    ),
  });

  const handleSubmit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const ids = Array.from(permissionIds);
    if (isEdit && role) {
      updateMutation.mutate({
        id: getRoleId(role),
        name: trimmedName,
        permission_ids: ids,
      });
    } else {
      createMutation.mutate({ name: trimmedName, permission_ids: ids });
    }
  };

  const togglePermission = (id: string) => {
    setPermissionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setPermissionIds(new Set(permissions.map((p) => p._id)));
  const clearAll = () => setPermissionIds(new Set());

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold m-0">
          {isEdit ? "Edit Role" : "New Role"}
        </h3>
        <Button variant="secondary" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
      <div className="h-px bg-rcn-border my-4" />
      <div className="space-y-4">
        <div>
          <label className="text-xs text-rcn-muted block mb-1.5">Role name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={INPUT_CLASS}
            placeholder="e.g. Support Manager"
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs text-rcn-muted">Permissions</label>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={selectAll}>
                Select all
              </Button>
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Clear
              </Button>
            </div>
          </div>
          <div className="border border-rcn-border rounded-xl p-3 max-h-[280px] overflow-auto space-y-2">
            {permissions.length === 0 ? (
              <p className="text-xs text-rcn-muted m-0">Loading permissions…</p>
            ) : (
              permissions.map((p) => (
                <label
                  key={p._id}
                  className="flex items-start gap-2 cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={permissionIds.has(p._id)}
                    onChange={() => togglePermission(p._id)}
                    className="mt-1 rounded border-rcn-border"
                  />
                  <span>
                    <span className="font-mono text-xs text-rcn-muted">{p.key}</span>
                    {p.description ? (
                      <span className="text-rcn-muted block text-xs">{p.description}</span>
                    ) : null}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>
      </div>
      <div className="h-px bg-rcn-border my-4" />
      <div className="flex gap-2 justify-end">
        <Button variant="secondary" size="sm" onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? "Saving…" : isEdit ? "Update" : "Create"}
        </Button>
      </div>
    </div>
  );
}
