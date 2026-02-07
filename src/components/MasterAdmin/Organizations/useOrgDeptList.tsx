"use client";

import { useState, useMemo } from "react";
import { toastSuccess, toastError } from "@/utils/toast";
import { TableColumn } from "@/components";
import type { DeptTableRow } from "./types";
import { BTN_SMALL_CLASS } from "./types";
import { DeptModalContent } from "./DeptModal";

const safeLower = (s: unknown) => (s ?? "").toString().toLowerCase();

export type OrgDeptListModalControl = {
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
};

export type BranchRecord = { id: string; orgId: string; name: string };
export type DeptRecord = { id: string; orgId: string; branchId: string; name: string; enabled?: boolean };

export interface UseOrgDeptListParams {
  depts: DeptRecord[];
  setDepts: React.Dispatch<React.SetStateAction<DeptRecord[]>>;
  branches: BranchRecord[];
  orgs: { id: string; name: string }[];
  selectedOrgId: string;
  modal: OrgDeptListModalControl;
}

const uid = (prefix: string) =>
  `${prefix}_${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;

export function useOrgDeptList({
  depts,
  setDepts,
  branches,
  orgs,
  selectedOrgId,
  modal,
}: UseOrgDeptListParams) {
  const { openModal, closeModal } = modal;
  const [deptSearch, setDeptSearch] = useState("");

  const getFilteredDepts = useMemo(
    () => () => {
      if (!selectedOrgId) return [];
      const q = safeLower(deptSearch);
      return depts.filter((d) => {
        if (d.orgId !== selectedOrgId) return false;
        if (!q) return true;
        const branch = branches.find((b) => b.id === d.branchId);
        const hay = safeLower(
          d.name + " " + d.id + " " + (branch?.name ?? "") + " " + d.branchId
        );
        return hay.includes(q);
      });
    },
    [depts, branches, selectedOrgId, deptSearch]
  );

  const saveDept = (deptId?: string) => {
    const orgId = (document.getElementById("dp_org") as HTMLSelectElement)?.value;
    const branchId = (document.getElementById("dp_branch") as HTMLSelectElement)?.value;
    const name = (document.getElementById("dp_name") as HTMLInputElement)?.value.trim();
    if (!name) {
      toastError("Department name required.");
      return;
    }
    const obj: DeptRecord = {
      id: deptId ?? uid("dp"),
      orgId,
      branchId,
      name,
      enabled: deptId ? depts.find((d) => d.id === deptId)?.enabled ?? true : true,
    };
    if (deptId) {
      setDepts(depts.map((d) => (d.id === deptId ? obj : d)));
    } else {
      setDepts([...depts, obj]);
    }
    closeModal();
    toastSuccess("Department saved.");
  };

  const deleteDept = (deptId: string) => {
    if (!confirm("Delete this department?")) return;
    setDepts(depts.filter((d) => d.id !== deptId));
    closeModal();
    toastSuccess("Department deleted.");
  };

  const toggleDept = (deptId: string) => {
    setDepts(depts.map((d) => (d.id === deptId ? { ...d, enabled: !d.enabled } : d)));
  };

  const openDeptModal = (deptId?: string, presetOrgId?: string) => {
    const dept = deptId ? depts.find((d) => d.id === deptId) ?? null : null;
    const targetOrgId = dept?.orgId ?? presetOrgId ?? selectedOrgId ?? "";
    openModal(
      <DeptModalContent
        dept={dept}
        targetOrgId={targetOrgId}
        presetOrgId={presetOrgId}
        orgs={orgs}
        branches={branches}
        onClose={closeModal}
        onSave={() => saveDept(deptId)}
        onDelete={dept ? () => deleteDept(dept.id) : undefined}
      />
    );
  };

  const deptTableColumns: TableColumn<DeptTableRow>[] = [
    {
      head: "Branch",
      component: (d) => {
        const branch = branches.find((b) => b.id === d.branchId);
        return (
          <>
            {branch?.name ?? "—"}{" "}
            <span className="text-rcn-muted font-mono text-[11px]">({d.branchId ?? "—"})</span>
          </>
        );
      },
    },
    {
      head: "Department",
      component: (d) => (
        <>
          <b>{d.name}</b>{" "}
          <span className="text-rcn-muted font-mono text-[11px]">({d.id})</span>
        </>
      ),
    },
    {
      head: "Status",
      component: (d) =>
        d.enabled ? (
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
      component: (d) => (
        <div className="flex gap-2">
          <button type="button" onClick={() => toggleDept(d.id)} className={BTN_SMALL_CLASS}>
            Toggle
          </button>
          <button type="button" onClick={() => openDeptModal(d.id)} className={BTN_SMALL_CLASS}>
            Edit
          </button>
        </div>
      ),
    },
  ];

  return {
    deptSearch,
    setDeptSearch,
    getFilteredDepts,
    deptTableColumns,
    openDeptModal,
  };
}
