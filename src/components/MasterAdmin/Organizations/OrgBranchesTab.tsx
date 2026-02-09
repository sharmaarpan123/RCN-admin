"use client";

import type { TableColumn } from "@/components";
import { Button, DebouncedInput, TableLayout } from "@/components";
import { getAdminOrganizationBranchesApi } from "@/apis/ApiCalls";
import defaultQueryKeys from "@/utils/adminQueryKeys";
import { checkResponse } from "@/utils/commonFunc";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { adminBranchTableColumns } from "./columns";
import type { AdminBranchListItem, BranchListBody, BranchTableRow } from "./types";

interface OrgBranchesTabProps {
  selectedOrgId: string;
  onNewBranch: () => void;
  onEditBranch: (branch: { _id: string; name?: string }) => void;
  onToggleBranch: (branchId: string) => void;
}

type AdminBranchesApiResponse = { success?: boolean; message?: string; data: AdminBranchListItem[]; meta?: unknown };

export function OrgBranchesTab({
  selectedOrgId,
  onNewBranch,
  onEditBranch,
  onToggleBranch,
}: OrgBranchesTabProps) {
  const [body, setBody] = useState<BranchListBody>({ page: 1, limit: 10, search: "" });

  const { data: branchesResponse, isLoading } = useQuery({
    queryKey: [...defaultQueryKeys.organizationBranchesList, selectedOrgId, body.page, body.search],
    queryFn: async () => {
      const res = await getAdminOrganizationBranchesApi(selectedOrgId, body);
      if (!checkResponse({ res })) return { data: [] } as AdminBranchesApiResponse;
      return res.data as AdminBranchesApiResponse;
    },
    enabled: !!selectedOrgId,
  });

  const branchesList = useMemo(() => branchesResponse?.data ?? [], [branchesResponse?.data]);
  const columns: TableColumn<BranchTableRow>[] = useMemo(
    () =>
      adminBranchTableColumns({
        onToggleBranch,
        openBranchModal: onEditBranch,
      }),
    [onToggleBranch, onEditBranch]
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-sm font-semibold m-0">Branches</h3>
          <p className="text-xs text-rcn-muted mt-1 mb-0">
            Enable/disable branches within the selected organization.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={onNewBranch}>
          + New Branch
        </Button>
      </div>

      <div className="flex gap-3 items-end mb-3">
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs text-rcn-muted">Search Branches</label>
          <DebouncedInput
            id="branch-search"
            value={body.search}
            onChange={(value) => setBody((prev) => ({ ...prev, search: value }))}
            placeholder="Search by branch name or ID..."
            debounceMs={300}
          />
        </div>
        <Button variant="secondary" size="sm" onClick={() => setBody((prev) => ({ ...prev, search: "" }))}>
          Clear
        </Button>
      </div>

      <div className="overflow-auto">
        <TableLayout<BranchTableRow>
          columns={columns}
          data={branchesList}
          variant="bordered"
          size="sm"
          emptyMessage="No branches for this organization."
          getRowKey={(b) => (b as { _id: string })._id}
          loader={isLoading}
        />
      </div>
    </div>
  );
}
