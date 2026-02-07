"use client";

import {
  createOrganizationDepartmentApi,
  getOrganizationDepartmentApi,
  updateOrganizationDepartmentApi,
} from "@/apis/ApiCalls";
import { Button, Modal } from "@/components";
import { catchAsync, checkResponse } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/orgQueryKeys";
import { useMutation, useQuery } from "@tanstack/react-query";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

const inputClass =
  "w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30";

const departmentSchema = yup.object({
  name: yup.string().trim().required("Department name is required."),
  branch_id: yup.string().required("Please select a branch."),
});

type DepartmentFormValues = yup.InferType<typeof departmentSchema>;

export type DepartmentModalMode = "add" | "edit";

export type BranchOption = { _id: string; name: string };

export type { DepartmentFormValues };

export type DepartmentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  mode: DepartmentModalMode;
  departmentId?: string;
  branches: BranchOption[];
  onSuccess: () => void;
};

export function DepartmentModal({
  isOpen,
  onClose,
  mode,
  departmentId,
  branches,
  onSuccess,
}: DepartmentModalProps) {

  const { data: departmentData, isLoading: isLoadingDepartment } = useQuery({
    queryKey: [...defaultQueryKeys.department, departmentId],
    queryFn: async () => {
      if (!departmentId) return null;
      const res = await getOrganizationDepartmentApi(departmentId);
      if (!checkResponse({ res })) return null;
      return res?.data?.data;
    },
    enabled: isOpen && mode === "edit" && !!departmentId,
  });

  const {
    register,
    handleSubmit,

    formState: { errors },
  } = useForm<DepartmentFormValues>({
    defaultValues: { name: "", branch_id: "" },
    resolver: yupResolver(departmentSchema),
    values: {
      name: departmentData?.name ?? "",
      branch_id: departmentData?.branch_id ?? "",
    },
  });



  const { isPending, mutate } = useMutation({
    mutationFn: catchAsync(
      async (vars: { name: string; branch_id: string; department_id?: string }) => {
        const payload = { name: vars.name.trim(), branch_id: vars.branch_id };
        const res = vars.department_id
          ? await updateOrganizationDepartmentApi(vars.department_id, payload)
          : await createOrganizationDepartmentApi(payload);
        if (checkResponse({ res, showSuccess: true })) {
          onSuccess();
          onClose();
        }
      }
    ),
  });

  const onSubmit = (values: DepartmentFormValues) => {
    mutate({
      name: values.name.trim(),
      branch_id: values.branch_id,
      ...(departmentId && { department_id: departmentId }),
    });
  };

  const isLoading = mode === "edit" && isLoadingDepartment;
  const canSubmit = mode === "add" || (mode === "edit" && departmentData);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4">
        <h3 className="font-bold m-0">
          {mode === "add" ? "Add Department" : "Edit Department"}
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {(mode === "add" || (mode === "edit" && canSubmit)) && (
            <>
              <label className="block text-xs text-rcn-muted mt-3 mb-1.5">
                Branch
              </label>
              <select
                {...register("branch_id")}
                className={`${inputClass} mb-2`}
                disabled={mode === "edit"}
              >
                <option value="">Select branch</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
              {errors.branch_id && (
                <p className="text-red-500 text-xs mt-0.5 mb-1">
                  {errors.branch_id.message}
                </p>
              )}
            </>
          )}
          <label className="block text-xs text-rcn-muted mt-2 mb-1.5">
            Name
          </label>
          <input
            {...register("name")}
            placeholder="Department name"
            className={inputClass}
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-0.5 mb-1">
              {errors.name.message}
            </p>
          )}
          {mode === "edit" && isLoadingDepartment && (
            <p className="text-rcn-muted text-sm mt-2">Loading department…</p>
          )}
          <div className="flex gap-2 mt-4 justify-end">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isPending || isLoading}
            >
              {isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
