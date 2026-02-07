"use client";

import { getOrganizationBranchesApi } from "@/apis/ApiCalls";
import type { TableColumn } from "@/components";
import { Button, TableLayout, DebouncedInput } from "@/components";
import { BranchModal } from "@/components/OrgComponent/Branch";
import { checkResponse } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/orgQueryKeys";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface Branch {
  _id: string;
  name: string;
  department_count?: number;
}

const BRANCHES_QUERY_KEY = defaultQueryKeys.branchList;

export default function OrgPortalBranchesPage() {
  const [modal, setModal] = useState<{ mode: "add" } | { mode: "edit"; id: string; name: string } | null>(null);
  const [body, setBody] = useState<{ search: string }>({ search: "" });
  const queryClient = useQueryClient();

  const { data: apiData, isLoading } = useQuery({
    queryKey: [...BRANCHES_QUERY_KEY, body.search],
    queryFn: async () => {
      try {
        const res = await getOrganizationBranchesApi({ search: body.search });
        if (!checkResponse({ res })) {
          return [];
        }
        return res.data;
      } catch {
        return [];
      }
    },
  });


  const branches = apiData?.data ?? [];

  const openAdd = () => setModal({ mode: "add" });

  const columns: TableColumn<Branch>[] = [
    { head: "Name", accessor: "name", component: (row) => <span className="font-medium">{row.name}</span> },
    {
      head: "Departments",
      component: (row) => (
        <span className="text-rcn-muted">{row.department_count ?? 0} departments</span>
      ),
    },
    {
      head: "Actions",
      thClassName: "text-right",
      tdClassName: "text-right",
      component: (row) => (
        <Button variant="secondary" size="sm" onClick={() => setModal({ mode: "edit", id: row._id, name: row.name })}>
          Edit
        </Button>
      ),
    },
  ];

  const handleBranchAddUpdateSuccess = () => {
    queryClient.invalidateQueries({ queryKey: [...BRANCHES_QUERY_KEY] });
    setModal(null);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold m-0">Branch</h1>
          <p className="text-sm text-rcn-muted m-0 mt-0.5">Create and manage branches for this organization.</p>
        </div>
        <Button variant="primary" size="sm" onClick={openAdd}>
          + Add Branch
        </Button>
      </div>

      <div className="bg-rcn-card border border-rcn-border rounded-2xl shadow-rcn overflow-hidden">
        <div className="p-4">
          <p className="text-xs text-rcn-muted mb-3">
            Branches belong to this organization only. Users may be assigned to multiple branches.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <label className="sr-only" htmlFor="branch-search">
                Search branches
              </label>
              <DebouncedInput
                id="branch-search"
                value={body.search}
                onChange={(value) => setBody((prev) => ({ ...prev, search: value }))}
                placeholder="Search by name or ID"
                debounceMs={300}
              />
            </div>
            {body.search ? (
              <Button variant="secondary" size="sm" onClick={() => setBody((prev) => ({ ...prev, search: "" }))}>
                Clear
              </Button>
            ) : null}
          </div>
          <div className="border border-rcn-border rounded-xl overflow-hidden">
            <TableLayout<Branch>
              columns={columns}
              data={branches}
              body={body}
              setBody={(patch) => setBody((prev) => ({ ...prev, ...patch }))}
              emptyMessage={
                body.search.trim()
                  ? "No branches match your search."
                  : 'No branches yet. Click "+ Add Branch" to create one.'
              }
              loader={isLoading}
              wrapperClassName="min-w-[260px]"
              getRowKey={(row) => row._id}
            />
          </div>
        </div>
      </div>

      <BranchModal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        mode={modal?.mode ?? "add"}
        branchId={modal?.mode === "edit" ? modal.id : undefined}
        onSuccess={handleBranchAddUpdateSuccess}
      />
    </div>
  );
}
