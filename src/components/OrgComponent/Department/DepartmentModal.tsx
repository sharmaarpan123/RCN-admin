
"use client";

import {
  createOrganizationDepartmentApi,
  updateOrganizationDepartmentApi,
} from "@/apis/ApiCalls";
import { Button, Modal } from "@/components";
import { catchAsync, checkResponse } from "@/utils/commonFunc";
import { toastError } from "@/utils/toast";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

const inputClass =
  "w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30";

export type DepartmentModalMode = "add" | "edit";

export type BranchOption = { _id: string; name: string };

export type DepartmentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  mode: DepartmentModalMode;
  branchId?: string;
  departmentId?: string;
  initialName?: string;
  branches: BranchOption[];
  onSuccess: () => void;
};

export function DepartmentModal({
  isOpen,
  onClose,
  mode,
  branchId,
  departmentId,
  initialName = "",
  branches,
  onSuccess,
}: DepartmentModalProps) {
  const [name, setName] = useState(initialName);
  const [selectedBranchId, setSelectedBranchId] = useState(branchId ?? "");

  const { isPending, mutate } = useMutation({
    mutationFn: catchAsync(
      async (vars: {
        mode: DepartmentModalMode;
        name: string;
        branch_id?: string;
        department_id?: string;
      }) => {
        const n = (vars.name || "").trim();
        if (!n) {
          toastError("Department name is required.");
          return;
        }
        if (vars.mode === "add") {
          const bid = vars.branch_id?.trim();
          if (!bid) {
            toastError("Please select a branch.");
            return;
          }
          const res = await createOrganizationDepartmentApi({ name: n, branch_id: bid });
          if (checkResponse({ res, showSuccess: true })) {
            onSuccess();
            onClose();
          }
        } else if (vars.mode === "edit" && vars.department_id) {
          const res = await updateOrganizationDepartmentApi(vars.department_id, { name: n , branch_id: vars.branch_id });
          if (checkResponse({ res, showSuccess: true })) {
            onSuccess();
            onClose();
          }
        }
      }
    ),
  });

  const handleSave = () => {
    const n = name.trim();
    if (!n) {
      toastError("Department name is required.");
      return;
    }
    if (mode === "add") {
      mutate({ mode: "add", name: n, branch_id: selectedBranchId });
    } else if (mode === "edit" && departmentId) {
      mutate({ mode: "edit", name: n, department_id: departmentId });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4">
        <h3 className="font-bold m-0">
          {mode === "add" ? "Add Department" : "Edit Department"}
        </h3>
        {mode === "add" && (
          <>
            <label className="block text-xs text-rcn-muted mt-3 mb-1.5">Branch</label>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className={`${inputClass} mb-2`}
            >
              <option value="">Select branch</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </>
        )}
        <label className="block text-xs text-rcn-muted mt-2 mb-1.5">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Department name"
          className={inputClass}
        />
        <div className="flex gap-2 mt-4 justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
