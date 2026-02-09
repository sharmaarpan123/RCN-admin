"use client";

import React, { useState } from "react";
import { Button, Modal } from "@/components";
import {
  createAdminOrganizationBranchApi,
  updateAdminOrganizationBranchApi,
} from "@/apis/ApiCalls";
import { catchAsync, checkResponse } from "@/utils/commonFunc";
import { useMutation } from "@tanstack/react-query";
import { toastError } from "@/utils/toast";
import { INPUT_CLASS } from "./types";

export type BranchForModal = { _id: string; name?: string } | null;

interface BranchModalContentProps {
  branch: BranchForModal;
  selectedOrgId: string;
  selectedOrgName?: string;
  onClose: () => void;
  onSave: () => void;
  isOpen: boolean;
}

export function BranchModalContent({
  branch,
  selectedOrgId,
  selectedOrgName,
  onClose,
  onSave,
  isOpen,
}: BranchModalContentProps) {
  const [name, setName] = useState(branch?.name ?? "");

  const createMutation = useMutation({
    mutationFn: catchAsync(
      async (payload: { organizationId: string; name: string }) => {
        const res = await createAdminOrganizationBranchApi(
          payload.organizationId,
          { name: payload.name }
        );
        if (checkResponse({ res, showSuccess: true })) {
          onSave();
          onClose();
        }
      }
    ),
  });

  const updateMutation = useMutation({
    mutationFn: catchAsync(
      async (payload: { branchId: string; name: string }) => {
        const res = await updateAdminOrganizationBranchApi(
          payload.branchId,
          { name: payload.name }
        );
        if (checkResponse({ res, showSuccess: true })) {
          onSave();
          onClose();
        }
      }
    ),
  });

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toastError("Branch name required.");
      return;
    }
    if (branch) {
      updateMutation.mutate({ branchId: branch._id, name: trimmedName });
    } else {
      if (!selectedOrgId) {
        toastError("Please select an organization first.");
        return;
      }
      createMutation.mutate({ organizationId: selectedOrgId, name: trimmedName });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="420px">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold m-0">
            {branch ? "Edit Branch" : "New Branch"}
          </h3>
          <Button variant="secondary" size="sm" type="button" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="h-px bg-rcn-border my-4" />

        {!branch && (
          <div className="mb-4">
            <label className="text-xs text-rcn-muted block mb-1.5">
              Organization
            </label>
            <div className="px-3 py-2.5 rounded-xl border border-rcn-border bg-[#f5f5f5] text-sm text-rcn-muted">
              {selectedOrgName || selectedOrgId || "—"}
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="text-xs text-rcn-muted block mb-1.5">
            Branch Name
          </label>
          <input
            id="br_name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Main"
            className={INPUT_CLASS}
          />
        </div>

        <div className="h-px bg-rcn-border my-4" />

        <div className="flex justify-end gap-2">
          <Button variant="primary" size="sm" type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
