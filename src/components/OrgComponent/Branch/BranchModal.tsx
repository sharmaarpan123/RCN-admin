"use client";

import {
  createOrganizationBranchApi,
  getOrganizationBranchApi,
  updateOrganizationBranchApi,
} from "@/apis/ApiCalls";
import { Button, Modal } from "@/components";
import { catchAsync, checkResponse } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/orgQueryKeys";
import { useMutation, useQuery } from "@tanstack/react-query";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";

const inputClass =
  "w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30";

const branchSchema = yup.object({
  name: yup.string().trim().required("Branch name is required."),
});

type BranchFormValues = yup.InferType<typeof branchSchema>;

export type BranchModalMode = "add" | "edit";

export type BranchModalProps = {
  isOpen: boolean;
  onClose: () => void;
  mode: BranchModalMode;
  branchId?: string;
  onSuccess: () => void;
};

export function BranchModal({
  isOpen,
  onClose,
  mode,
  branchId,
  onSuccess,
}: BranchModalProps) {


  const { data: branchData, isLoading: isLoadingBranch } = useQuery({
    queryKey: [...defaultQueryKeys.branch, branchId],
    queryFn: async () => {
      if (!branchId) return null;
      const res = await getOrganizationBranchApi(branchId);
      if (!checkResponse({ res })) return null;
      return res?.data?.data && res?.data?.data[0];
    },
    enabled: isOpen && mode === "edit" && !!branchId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BranchFormValues>({
    defaultValues: { name: "" },
    resolver: yupResolver(branchSchema),
    values: {
      name: branchData?.name ?? "",
    },
  });

  const { isPending, mutate } = useMutation({
    mutationFn: catchAsync(
      async (vars: { name: string; branch_id?: string }) => {
        const payload = { name: vars.name.trim() };
        const res = vars.branch_id
          ? await updateOrganizationBranchApi(vars.branch_id, payload)
          : await createOrganizationBranchApi(payload);
        if (checkResponse({ res, showSuccess: true })) {
          onSuccess();
          onClose();
        }
      }
    ),
  });

  const onSubmit = (values: BranchFormValues) => {
    mutate({
      name: values.name.trim(),
      ...(branchId && { branch_id: branchId }),
    });
  };

  const isLoading = mode === "edit" && isLoadingBranch;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="420px">
      <div className="p-4">
        <h3 className="font-bold m-0">
          {mode === "add" ? "Add Branch" : "Edit Branch"}
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <label className="block text-xs text-rcn-muted mt-3 mb-1.5">
            Name
          </label>
          <input
            {...register("name")}
            placeholder="Branch name"
            className={inputClass}
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-0.5 mb-1">
              {errors.name.message}
            </p>
          )}
          {mode === "edit" && isLoadingBranch && (
            <p className="text-rcn-muted text-sm mt-2">Loading branch…</p>
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
