"use client";

import { useState, useMemo } from "react";
import { toastSuccess, toastError } from "@/utils/toast";
import { TableColumn } from "@/components";
import type { BranchTableRow } from "./types";
import { BTN_SMALL_CLASS } from "./types";
import { BranchModalContent } from "./BranchModal";

const safeLower = (s: unknown) => (s ?? "").toString().toLowerCase();

export type OrgBranchListModalControl = {
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
};

export type BranchRecord = { id: string; orgId: string; name: string; enabled?: boolean };

export interface UseOrgBranchListParams {
  branches: BranchRecord[];
  setBranches: React.Dispatch<React.SetStateAction<BranchRecord[]>>;
  setDepts: React.Dispatch<React.SetStateAction<unknown[]>>;
  orgs: { id: string; name: string }[];
  selectedOrgId: string;
  modal: OrgBranchListModalControl;
}

const uid = (prefix: string) =>
  `${prefix}_${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;

export function useOrgBranchList({
  branches,
  setBranches,
  setDepts,
  orgs,
  selectedOrgId,
  modal,
}: UseOrgBranchListParams) {
  const { openModal, closeModal } = modal;
  const [branchSearch, setBranchSearch] = useState("");

  const getFilteredBranches = useMemo(
    () => () => {
      if (!selectedOrgId) return [];
      const q = safeLower(branchSearch);
      return branches.filter((b) => {
        if (b.orgId !== selectedOrgId) return false;
        if (!q) return true;
        const hay = safeLower(b.name + " " + b.id);
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
    const obj: BranchRecord = {
      id: branchId ?? uid("br"),
      orgId,
      name,
      enabled: branchId ? branches.find((b) => b.id === branchId)?.enabled ?? true : true,
    };
    if (branchId) {
      setBranches(branches.map((b) => (b.id === branchId ? obj : b)));
    } else {
      setBranches([...branches, obj]);
    }
    closeModal();
    toastSuccess("Branch saved.");
  };

  const deleteBranch = (branchId: string) => {
    if (!confirm("Delete this branch?")) return;
    setBranches(branches.filter((b) => b.id !== branchId));
    setDepts((prev: unknown[]) => (prev as { branchId: string }[]).filter((d) => d.branchId !== branchId));
    closeModal();
    toastSuccess("Branch deleted.");
  };

  const toggleBranch = (branchId: string) => {
    setBranches(branches.map((b) => (b.id === branchId ? { ...b, enabled: !b.enabled } : b)));
  };

  const openBranchModal = (branchId?: string, presetOrgId?: string) => {
    const branch = branchId ? branches.find((b) => b.id === branchId) ?? null : null;
    const targetOrgId = branch?.orgId ?? presetOrgId ?? selectedOrgId ?? "";
    openModal(
      <BranchModalContent
        branch={branch}
        targetOrgId={targetOrgId}
        presetOrgId={presetOrgId}
        orgs={orgs}
        onClose={closeModal}
        onSave={() => saveBranch(branchId)}
        onDelete={branch ? () => deleteBranch(branch.id) : undefined}
      />
    );
  };

  const branchTableColumns: TableColumn<BranchTableRow>[] = [
    {
      head: "Branch",
      component: (b) => (
        <>
          <b>{b.name}</b>{" "}
          <span className="text-rcn-muted font-mono text-[11px]">({b.id})</span>
        </>
      ),
    },
    {
      head: "Status",
      component: (b) =>
        b.enabled ? (
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
          <button type="button" onClick={() => toggleBranch(b.id)} className={BTN_SMALL_CLASS}>
            Toggle
          </button>
          <button type="button" onClick={() => openBranchModal(b.id)} className={BTN_SMALL_CLASS}>
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
