"use client";

import { getOrganizationBranchesApi, getOrganizationDepartmentsApi, deleteOrganizationDepartmentApi } from "@/apis/ApiCalls";
import type { TableColumn } from "@/components";
import { Button, TableLayout, DebouncedInput, TableActions, ConfirmModal } from "@/components";
import { DepartmentModal } from "@/components/OrgComponent/Department";
import { catchAsync, checkResponse } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/orgQueryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";

interface Branch {
  _id: string;
  name: string;
  department_count?: number;
}

interface Department {
  _id: string;
  name: string;
  branch_id?: string;
}

type DeptRow = Department & { branch_id?: { _id?: string; name?: string } };

const BRANCHES_QUERY_KEY = defaultQueryKeys.branchList;
const DEPARTMENTS_QUERY_KEY = defaultQueryKeys.departmentList;

export default function OrgPortalDepartmentsPage() {
  const [branchFilter, setBranchFilter] = useState<string>("");
  const [body, setBody] = useState<{ search: string }>({ search: "" });
  const [modal, setModal] = useState<
    | { mode: "add" }
    | { mode: "edit"; departmentId: string }
    | null
  >(null);
  const [deleteDept, setDeleteDept] = useState<{ id: string; name: string } | null>(null);
  const queryClient = useQueryClient();

  const { data: branchesData } = useQuery({
    queryKey: [...BRANCHES_QUERY_KEY, ""],
    queryFn: async () => {
      try {
        const res = await getOrganizationBranchesApi({ search: "" });
        if (!checkResponse({ res })) return [];
        return res.data;
      } catch {
        return [];
      }
    },
  });

  const branches: Branch[] = [
    ...(branchesData?.data ?? [])];
  const branchId = branchFilter || "all";

  const { data: deptApiData, isLoading } = useQuery({
    queryKey: [...DEPARTMENTS_QUERY_KEY, branchId, body.search],
    queryFn: async () => {
      if (!branchId) return { data: [] };
      try {
        const res = await getOrganizationDepartmentsApi({ branch_id: branchId, search: body.search });
        if (!checkResponse({ res })) return { data: [] };
        return res.data;
      } catch {
        return { data: [] };
      }
    },
    enabled: !!branchId,
  });

  const br = branches.find((b: Branch) => b._id === branchId) ?? null;
  const data: DeptRow[] = useMemo(() => {
    const list = deptApiData?.data ?? [];
    const branchName = br?.name;
    return list.map((dp: Department) => ({ ...dp, branchName }));
  }, [deptApiData?.data, br?.name]);

  const searchLower = body.search.trim().toLowerCase();
  const filteredData = searchLower
    ? data.filter(
      (row) =>
        (row.name ?? "").toLowerCase().includes(searchLower) ||
        (row._id ?? "").toLowerCase().includes(searchLower) ||
        (row.branch_id?.name ?? "").toLowerCase().includes(searchLower)
    )
    : data;

  const emptyMessage = !br
    ? "No branches yet. Create a branch first."
    : body.search.trim()
      ? "No departments match your search."
      : 'No departments in this branch. Click "+ Add Department" to create one.';

  const openAdd = () => {
    if (!br) return;
    setModal({ mode: "add" });
  };

  const openEdit = (departmentId: string) => {
    setModal({ mode: "edit", departmentId });
  };

  const handleDepartmentSuccess = () => {
    queryClient.invalidateQueries({ queryKey: [...DEPARTMENTS_QUERY_KEY] });
    setModal(null);
  };

  const { isPending: isDeleting, mutate: deleteDeptMutation } = useMutation({
    mutationFn: catchAsync(async (departmentId: string) => {
      const res = await deleteOrganizationDepartmentApi(departmentId);
      if (checkResponse({ res, showSuccess: true })) {
        queryClient.invalidateQueries({ queryKey: [...DEPARTMENTS_QUERY_KEY] });
        setDeleteDept(null);
      }
    }),
  });

  const handleConfirmDelete = () => {
    if (deleteDept) deleteDeptMutation(deleteDept.id);
  };

  const columns: TableColumn<DeptRow>[] = [
    {
      head: "Name",
      accessor: "name",
      component: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      head: "Branch",
      accessor: "branchName",
      component: (row) => (
        <span className="text-rcn-muted">{row.branch_id?.name ?? "—"}</span>
      ),
    },
    {
      head: "Actions",
      thClassName: "text-right",
      tdClassName: "text-right",
      component: (row) => (
        <TableActions
          onEditClick={() => openEdit(row._id)}
          setDeleteModel={() => setDeleteDept({ id: row._id, name: row.name })}
          className="justify-end"
        />
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold m-0">Department</h1>
          <p className="text-sm text-rcn-muted m-0 mt-0.5">
            Create and manage departments under a branch.
          </p>
        </div>
        <div className="flex gap-2 items-end flex-wrap">
          <div className="w-full sm:w-auto min-w-0">
            <label className="block text-xs text-rcn-muted mb-1">Branch</label>
            <select
              value={branchId}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full sm:w-auto min-w-0 px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30"
            >
              {[{ _id: "all", name: "All Branches" }, ...branches].map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={openAdd}
            disabled={!!!branches?.length}
          >
            + Add Department
          </Button>
        </div>
      </div>

      <div className="bg-rcn-card border border-rcn-border rounded-2xl shadow-rcn overflow-hidden">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <label className="sr-only" htmlFor="dept-search">
                Search departments
              </label>
              <DebouncedInput
                id="dept-search"
                value={body.search}
                onChange={(value) => setBody((prev) => ({ ...prev, search: value }))}
                placeholder="Search by name, ID, or branch"
                debounceMs={300}
              />
            </div>
            {body.search ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setBody((prev) => ({ ...prev, search: "" }))}
              >
                Clear
              </Button>
            ) : null}
          </div>
          <div className="border border-rcn-border rounded-xl overflow-hidden">
            <TableLayout<DeptRow>
              columns={columns}
              data={filteredData}
              body={body}
              setBody={(patch) => setBody((prev) => ({ ...prev, ...patch }))}
              emptyMessage={emptyMessage}
              loader={isLoading}
              wrapperClassName="min-w-[260px]"
              getRowKey={(row) => row._id}
            />
          </div>
        </div>
      </div>

      <DepartmentModal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        mode={modal?.mode ?? "add"}
        departmentId={modal?.mode === "edit" ? modal.departmentId : undefined}
        branches={branches}
        onSuccess={handleDepartmentSuccess}
      />

      <ConfirmModal
        type="delete"
        isOpen={!!deleteDept}
        onClose={() => setDeleteDept(null)}
        onConfirm={handleConfirmDelete}
        message={deleteDept ? `Are you sure you want to delete "${deleteDept.name}"?` : undefined}
        confirmDisabled={isDeleting}
      />
    </div>
  );
}
