"use client";

import { useState, useMemo } from "react";
import { toastSuccess, toastError } from "@/utils/toast";
import { TableColumn } from "@/components";
import type { BranchTableRow, AdminBranchListItem } from "./types";
import { BTN_SMALL_CLASS } from "./types";
import { BranchModalContent } from "./BranchModal";

const safeLower = (s: unknown) => (s ?? "").toString().toLowerCase();

export type OrgBranchListModalControl = {
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
};

export interface UseOrgBranchListParams {
  branches: AdminBranchListItem[];
  refetchBranches: () => void;
  setDepts: React.Dispatch<React.SetStateAction<unknown[]>>;
  orgs: { id: string; name: string }[];
  selectedOrgId: string;
  modal: OrgBranchListModalControl;
}

export function useOrgBranchList({
  branches,
  refetchBranches,
  setDepts,
  orgs,
  selectedOrgId,
  modal,
}: UseOrgBranchListParams) {
  const { openModal, closeModal } = modal;
  const [branchSearch, setBranchSearch] = useState("");

  const getFilteredBranches = useMemo(
    () => (): BranchTableRow[] => {
      if (!selectedOrgId) return [];
      const q = safeLower(branchSearch);
      return branches.filter((b) => {
        const orgId = b.organization_id ?? "";
        if (orgId !== selectedOrgId) return false;
        if (!q) return true;
        const hay = safeLower((b.name ?? "") + " " + b._id);
        return hay.includes(q);
      });
    },
    [branches, selectedOrgId, branchSearch]
  );

  const saveBranch = (branchId?: string) => {
    const orgId = (document.getElementById("br_org") as HTMLSelectElement)?.value;
    const name = (document.getElementById("br_name") as HTMLInputElement)?.value.trim();
    if (!name) {
      toastError("Branch name required.");
      return;
    }
    // TODO: call create/update branch API when available; then refetch
    closeModal();
    refetchBranches();
    toastSuccess("Branch saved.");
  };

  const deleteBranch = (branchId: string) => {
    if (!confirm("Delete this branch?")) return;
    setDepts((prev: unknown[]) => (prev as { branchId: string }[]).filter((d) => d.branchId !== branchId));
    closeModal();
    refetchBranches();
    toastSuccess("Branch deleted.");
  };

  const toggleBranch = (_branchId: string) => {
    // TODO: call toggle branch API when available; then refetch
    refetchBranches();
  };

  const openBranchModal = (branchId?: string, presetOrgId?: string) => {
    const row = branchId ? branches.find((b) => b._id === branchId) ?? null : null;
    const branch = row
      ? { id: row._id, name: row.name, orgId: row.organization_id }
      : null;
    const targetOrgId = branch?.orgId ?? presetOrgId ?? selectedOrgId ?? "";
    openModal(
      <BranchModalContent
        branch={branch}
        targetOrgId={targetOrgId}
        presetOrgId={presetOrgId}
        orgs={orgs}
        onClose={closeModal}
        onSave={() => saveBranch(branchId)}
        onDelete={row ? () => deleteBranch(row._id) : undefined}
      />
    );
  };

  const branchTableColumns: TableColumn<BranchTableRow>[] = [
    {
      head: "Branch",
      component: (b) => (
        <>
          <b>{b.name ?? "—"}</b>{" "}
          <span className="text-rcn-muted font-mono text-[11px]">({b._id})</span>
        </>
      ),
    },
    {
      head: "Status",
      component: (b) =>
        (b.status === 1) ? (
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
      component: (b) => (
        <div className="flex gap-2">
          <button type="button" onClick={() => toggleBranch(b._id)} className={BTN_SMALL_CLASS}>
            Toggle
          </button>
          <button type="button" onClick={() => openBranchModal(b._id)} className={BTN_SMALL_CLASS}>
            Edit
          </button>
        </div>
      ),
    },
  ];

  return {
    branchSearch,
    setBranchSearch,
    getFilteredBranches,
    branchTableColumns,
    openBranchModal,
  };
}
