"use client";

import React from "react";
import { Button, Modal } from "@/components";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  createAdminOrganizationDepartmentApi,
  getAdminOrganizationBranchesApi,
  updateOrganizationDepartmentApi,
} from "@/apis/ApiCalls";
import defaultQueryKeys from "@/utils/adminQueryKeys";
import { catchAsync, checkResponse } from "@/utils/commonFunc";
import { toastError } from "@/utils/toast";
import {
  INPUT_CLASS,
  type AdminDepartmentListItem,
  type AdminBranchListItem,
} from "./types";

const deptModalSchema = yup.object({
  name: yup.string().trim().required("Department name is required."),
  branch_id: yup.string().trim().required("Branch is required."),
});

export type DeptModalFormValues = yup.InferType<typeof deptModalSchema>;

type AdminBranchesApiResponse = {
  success?: boolean;
  message?: string;
  data: AdminBranchListItem[];
  meta?: unknown;
};

interface DeptModalContentProps {
  dept: AdminDepartmentListItem | null;
  selectedOrgId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onDelete?: () => void;
}

const defaultValues: DeptModalFormValues = {
  name: "",
  branch_id: "",
};

export function DeptModalContent({
  dept,
  selectedOrgId,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: DeptModalContentProps) {
  const { data: branchesResponse } = useQuery({
    queryKey: [
      ...defaultQueryKeys.organizationBranchesList,
      selectedOrgId,
      1,
      "",
    ],
    queryFn: async () => {
      const res = await getAdminOrganizationBranchesApi(selectedOrgId, {
        page: 1,
        limit: 100,
        search: "",
      });
      return res.data as AdminBranchesApiResponse;
    },
    enabled: isOpen && !!selectedOrgId,
  });

  const branchesList = branchesResponse?.data ?? [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DeptModalFormValues>({
    defaultValues,
    resolver: yupResolver(deptModalSchema),
    values: dept
      ? {
          name: dept.name ?? "",
          branch_id:
            typeof dept.branch_id === "object" && dept.branch_id?._id
              ? dept.branch_id._id
              : "",
        }
      : { ...defaultValues },
  });

  const createMutation = useMutation({
    mutationFn: catchAsync(
      async (payload: DeptModalFormValues) => {
        const res = await createAdminOrganizationDepartmentApi(selectedOrgId, {
          name: payload.name,
          branch_id: payload.branch_id,
        });
        if (checkResponse({ res, showSuccess: true })) {
          onSave();
          onClose();
        }
      }
    ),
  });

  const updateMutation = useMutation({
    mutationFn: catchAsync(
      async (payload: DeptModalFormValues) => {
        if (!dept?._id) return;
        const res = await updateOrganizationDepartmentApi(dept._id, {
          name: payload.name,
          branch_id: payload.branch_id,
        });
        if (checkResponse({ res, showSuccess: true })) {
          onSave();
          onClose();
        }
      }
    ),
  });

  const onSubmit = (data: DeptModalFormValues) => {
    if (!data.branch_id?.trim()) {
      toastError("Branch is required.");
      return;
    }
    if (dept) {
      updateMutation.mutate(data);
    } else {
      if (!selectedOrgId) {
        toastError("Please select an organization first.");
        return;
      }
      createMutation.mutate(data);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold m-0">
            {dept ? "Edit" : "New"} Department
          </h3>
          <Button type="button" variant="secondary" size="sm" onClick={handleClose}>
            Close
          </Button>
        </div>

        <div className="h-px bg-rcn-border my-4" />

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-rcn-muted block mb-1.5">
                Branch
              </label>
              <select
                {...register("branch_id")}
                className={INPUT_CLASS}
                disabled={branchesList.length === 0}
              >
                <option value="">Select branch</option>
                {branchesList.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name ?? ""}
                  </option>
                ))}
              </select>
              {errors.branch_id && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.branch_id.message}
                </p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs text-rcn-muted block mb-1.5">
              Department Name
            </label>
            <input
              {...register("name")}
              placeholder="e.g., Cardiology"
              className={INPUT_CLASS}
            />
            {errors.name && (
              <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="h-px bg-rcn-border my-4" />

          <div className="flex justify-end gap-2">
            {dept && onDelete && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onDelete}
                className="border-rcn-danger text-rcn-danger hover:bg-rcn-danger hover:text-white"
              >
                Delete
              </Button>
            )}
            <Button type="submit" variant="primary" size="sm" disabled={isSaving}>
              {isSaving ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
