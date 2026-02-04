/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button, Modal } from "@/components";
import { toastError } from "@/utils/toast";
import { createOrganizationBranchApi, updateOrganizationBranchApi } from "@/apis/ApiCalls";
import { catchAsync, checkResponse } from "@/utils/commonFunc";

const inputClass =
  "w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30";

export type BranchModalMode = "add" | "edit";

export type BranchModalProps = {
  isOpen: boolean;
  onClose: () => void;
  mode: BranchModalMode;
  organizationId?: string;
  branchId?: string;
  initialName?: string;
  onSuccess: (name: string) => void;
};

export function BranchModal({
  isOpen,
  onClose,
  mode,
  branchId,
  initialName = "",
  onSuccess,
}: BranchModalProps) {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (isOpen) setName(initialName);
  }, [isOpen, initialName]);

  const { isPending, mutate } = useMutation({
    mutationFn: catchAsync(
      async (vars: { mode: BranchModalMode; name: string }) => {
        const n = (vars.name || "").trim();
        if (!n) {
          toastError("Branch name is required.");
          return;
        }
        if (vars.mode === "add") {
          const res = await createOrganizationBranchApi({ name: n });
          if (checkResponse({ res, showSuccess: true })) {
            onSuccess((vars?.name || "").trim());
            onClose();
          };
        } else if (vars.mode === "edit" && branchId) {
          const res = await updateOrganizationBranchApi(branchId, { name: n });
          if (checkResponse({ res, showSuccess: true })) {
            onSuccess((vars?.name || "").trim());
            onClose();
          };
        }
      }
    ),

  });

  const handleSave = () => {
    const n = name.trim();
    if (!n) {
      toastError("Branch name is required.");
      return;
    }
    if (mode === "add") {
      mutate({ mode: "add", name: n });
    } else if (mode === "edit" && branchId) {
      mutate({ mode: "edit", name: n });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="420px">
      <div className="p-4">
        <h3 className="font-bold m-0">{mode === "add" ? "Add Branch" : "Edit Branch"}</h3>
        <label className="block text-xs text-rcn-muted mt-3 mb-1.5">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Branch name"
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
