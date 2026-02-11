"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getOrganizationBranchesApi,
  getOrganizationDepartmentsApi,
  updateOrganizationUserBranchApi,
} from "@/apis/ApiCalls";
import { Button } from "@/components";
import { catchAsync, checkResponse } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/orgQueryKeys";

export type BranchWithDepts = {
  _id: string;
  name: string;
  departments: { _id: string; name: string }[];
};

type UserBranchDepartmentAssignProps = {
  userId: string;
  initialBranchIds: string[];
  initialDeptIds: string[];
  onSave: () => void;
  disabled?: boolean;
};

export function UserBranchDepartmentAssign({
  userId,
  initialBranchIds,
  initialDeptIds,
  onSave,
  disabled = false,
}: UserBranchDepartmentAssignProps) {
  const queryClient = useQueryClient();
  const [localBranchIds, setLocalBranchIds] = useState<string[]>(initialBranchIds);
  const [localDeptIds, setLocalDeptIds] = useState<string[]>(initialDeptIds);

  const {
    data: branchesWithDepts,
    isLoading: isLoadingBranches,
  } = useQuery({
    queryKey: [...defaultQueryKeys.branchList, "with-departments"],
    queryFn: async (): Promise<BranchWithDepts[]> => {
      const res = await getOrganizationBranchesApi({ search: "" });
      if (!checkResponse({ res })) return [];
      const list = res.data?.data ?? [];
      const withDepts: BranchWithDepts[] = await Promise.all(
        list.map(async (b: { _id: string; name: string }) => {
          const dRes = await getOrganizationDepartmentsApi({ branch_id: b._id });
          const departments = checkResponse({ res: dRes }) ? (dRes.data?.data ?? []) : [];
          return {
            _id: b._id,
            name: b.name,
            departments: departments.map((d: { _id: string; name: string }) => ({ _id: d._id, name: d.name })),
          };
        })
      );
      return withDepts;
    },
  });

  const branches = branchesWithDepts ?? [];
  const branchIdSet = new Set(localBranchIds);
  const deptIdSet = new Set(localDeptIds);

  const toggleBranch = (id: string) => {
    const next = branchIdSet.has(id) ? localBranchIds.filter((b) => b !== id) : [...localBranchIds, id];
    setLocalBranchIds(next);
    if (branchIdSet.has(id)) {
      const br = branches.find((b) => b._id === id);
      const deptIdsInBranch = (br?.departments ?? []).map((d) => d._id);
      setLocalDeptIds((prev) => prev.filter((d) => !deptIdsInBranch.includes(d)));
    }
  };

  const toggleDept = (id: string) => {
    const next = deptIdSet.has(id) ? localDeptIds.filter((d) => d !== id) : [...localDeptIds, id];
    setLocalDeptIds(next);
  };

  const updateMutation = useMutation({
    mutationFn: catchAsync(
      async (vars: { userId: string; payload: { branch_id: string; department_ids: string[] }[] }) => {
        const res = await updateOrganizationUserBranchApi(vars.userId, vars.payload);
        if (checkResponse({ res, showSuccess: true })) {
          queryClient.invalidateQueries({ queryKey: [...defaultQueryKeys.user, vars.userId] });
          onSave();
        }
      }
    ),
  });

  const handleSaveAssignment = () => {
    const payload = localBranchIds.map((branchId) => {
      const br = branches.find((b) => b._id === branchId);
      const departmentIds = (br?.departments ?? []).filter((d) => deptIdSet.has(d._id)).map((d) => d._id);
      return { branch_id: branchId, department_ids: departmentIds };
    });
    updateMutation.mutate({ userId, payload });
  };

  const isLoading = isLoadingBranches;

  return (
    <div className="border-t border-rcn-border mt-6 pt-6">
      <h2 className="font-bold text-sm m-0 mb-2">Assign Branch & Department</h2>
      <p className="text-xs text-rcn-muted m-0 mb-3">Select branches and departments for this user.</p>
      <div className="flex flex-wrap gap-2 mb-3">
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleSaveAssignment}
          disabled={isLoading || disabled || updateMutation.isPending}
        >
          {updateMutation.isPending ? "Saving…" : "Save assignment"}
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs text-rcn-muted mb-1.5">Branches</label>
          <div className="border border-rcn-border rounded-xl p-3 max-h-40 overflow-auto space-y-1">
            {branches.map((b) => (
              <label key={b._id} className="flex items-center gap-2 py-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={branchIdSet.has(b._id)}
                  onChange={() => toggleBranch(b._id)}
                  className="rounded border-rcn-border"
                  disabled={isLoading || disabled}
                />
                <span className="text-sm">{b.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs text-rcn-muted mb-1.5">Departments (by branch)</label>
          <div className="border border-rcn-border rounded-xl p-3 max-h-40 overflow-auto space-y-2">
            {localBranchIds.map((brId) => {
              const br = branches.find((b) => b._id === brId);
              if (!br) return null;
              return (
                <div key={br._id}>
                  <p className="text-xs font-bold text-rcn-accent m-0 mb-1">{br.name}</p>
                  {(br.departments ?? []).map((d) => (
                    <label key={d._id} className="flex items-center gap-2 py-0.5 ml-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={deptIdSet.has(d._id)}
                        onChange={() => toggleDept(d._id)}
                        className="rounded border-rcn-border"
                        disabled={isLoading || disabled}
                      />
                      <span className="text-sm">{d.name}</span>
                    </label>
                  ))}
                </div>
              );
            })}
            {!localBranchIds.length && (
              <p className="text-xs text-rcn-muted m-0">Select branches to see departments.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
