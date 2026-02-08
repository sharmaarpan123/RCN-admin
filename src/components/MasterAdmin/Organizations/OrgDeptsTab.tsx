"use client";

import { getAdminOrganizationDepartmentsApi, putAdminDepartmentToggleApi } from "@/apis/ApiCalls";
import { DebouncedInput, TableColumn, TableLayout } from "@/components";
import defaultQueryKeys from "@/utils/adminQueryKeys";
import { catchAsync, checkResponse } from "@/utils/commonFunc";
import { toastError, toastSuccess } from "@/utils/toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DeptModalContent } from "./DeptModal";
import type { DeptTableRow } from "./types";
import { AdminDepartmentListItem, BTN_CLASS, BTN_SMALL_CLASS } from "./types";

interface OrgDeptsTabProps {
  selectedOrgId: string;
  modal: { openModal: (content: React.ReactNode) => void; closeModal: () => void };
}

type DeptMoodal = {
  isOpen: boolean;
  deptId: string | null;
}

export function OrgDeptsTab({
  selectedOrgId,
}: OrgDeptsTabProps) {
  const queryClient = useQueryClient();
  const [deptModal, setDeptModal] = useState<DeptMoodal>({ isOpen: false, deptId: null });
  const [deptSearch, setDeptSearch] = useState("");

  const invalidateDepts = () =>
    queryClient.invalidateQueries({ queryKey: defaultQueryKeys.organizationDepartmentList });

  const { data, isLoading } = useQuery({
    queryKey: [...defaultQueryKeys.organizationDepartmentList, selectedOrgId],
    queryFn: async () => {
      const res = await getAdminOrganizationDepartmentsApi(selectedOrgId);
      if (!checkResponse({ res })) return [];
      return res?.data?.data as AdminDepartmentListItem[] ?? [];
    },
    enabled: !!selectedOrgId,
  });

  const deptsList = data ?? [];

  const saveDept = () => {
    const name = (document.getElementById("dp_name") as HTMLInputElement)?.value.trim();
    if (!name) {
      toastError("Department name required.");
      return;
    }
    setDeptModal({ isOpen: false, deptId: null });
    invalidateDepts();
    toastSuccess("Department saved.");
  };

  const deleteDept = (deptId: string) => {
    void deptId; // reserved for delete API
    if (!confirm("Delete this department?")) return;
    setDeptModal({ isOpen: false, deptId: null });
    invalidateDepts();
    toastSuccess("Department deleted.");
  };

  const toggleDept = catchAsync(async (deptId: string) => {
    const res = await putAdminDepartmentToggleApi(deptId);
    if (!checkResponse({ res })) return
    invalidateDepts();
  });

  const openDeptModal = (deptId: string) => {
    setDeptModal({ isOpen: true, deptId: deptId, });
  };

  const deptTableColumns: TableColumn<DeptTableRow>[] = [
    {
      head: "Branch",
      component: (d) => {
        return d?.branch_id?.name ?? "—";
      },
    },
    {
      head: "Department",
      component: (d) => (
        <>
          <b>{d.name}</b>{" "}
          <span className="text-rcn-muted font-mono text-[11px]">({d._id})</span>
        </>
      ),
    },
    {
      head: "Status",
      component: (d) =>
        d.status == 1 ? (
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
          <button type="button" onClick={() => toggleDept(d._id)} className={BTN_SMALL_CLASS}>
            Toggle
          </button>
          <button type="button" onClick={() => openDeptModal(d._id)} className={BTN_SMALL_CLASS}>
            Edit
          </button>
        </div>
      ),
    },
  ];

  const dept = deptModal.deptId ? data?.find((d) => d._id === deptModal.deptId) ?? null : null;

  return (
    <div>
      <DeptModalContent
        dept={dept}
        isOpen={deptModal.isOpen}
        onClose={() => setDeptModal({ isOpen: false, deptId: null })}
        onSave={() => saveDept()}
        onDelete={dept ? () => deleteDept(dept?._id ?? "") : undefined}
      />
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-sm font-semibold m-0">Departments</h3>
          <p className="text-xs text-rcn-muted mt-1 mb-0">
            Enable/disable departments within the selected organization.
          </p>
        </div>
      </div>

      <div className="flex gap-3 items-end mb-3">
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs text-rcn-muted">Search Departments</label>
          <DebouncedInput
            id="dept-search"
            value={deptSearch}
            onChange={(value) => setDeptSearch(value)}
            placeholder="Search by department, branch, or ID..."
            debounceMs={300}
          />
        </div>
        <button onClick={() => setDeptSearch("")} className={BTN_CLASS}>
          Clear
        </button>
      </div>

      <div className="overflow-auto">
        <TableLayout<DeptTableRow>
          columns={deptTableColumns}
          data={deptsList}
          variant="bordered"
          size="sm"
          emptyMessage="No departments for this organization."
          getRowKey={(d) => d._id}
          loader={isLoading}
        />
      </div>
    </div>
  );
}
