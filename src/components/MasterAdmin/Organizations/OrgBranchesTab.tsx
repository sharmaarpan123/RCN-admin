"use client";

import { TableLayout } from "@/components";
import { INPUT_CLASS, BTN_CLASS, BTN_PRIMARY_CLASS } from "./types";
import type { BranchTableRow } from "./types";
import type { TableColumn } from "@/components";

interface OrgBranchesTabProps {
  branchSearch: string;
  setBranchSearch: (v: string) => void;
  filteredBranches: BranchTableRow[];
  columns: TableColumn<BranchTableRow>[];
  onNewBranch: () => void;
}

export function OrgBranchesTab({
  branchSearch,
  setBranchSearch,
  filteredBranches,
  columns,
  onNewBranch,
}: OrgBranchesTabProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-sm font-semibold m-0">Branches</h3>
          <p className="text-xs text-rcn-muted mt-1 mb-0">
            Enable/disable branches within the selected organization.
          </p>
        </div>
        <button onClick={onNewBranch} className={BTN_PRIMARY_CLASS}>
          + New Branch
        </button>
      </div>

      <div className="flex gap-3 items-end mb-3">
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs text-rcn-muted">Search Branches</label>
          <input
            value={branchSearch}
            onChange={(e) => setBranchSearch(e.target.value)}
            placeholder="Search by branch name or ID..."
            className={INPUT_CLASS}
          />
        </div>
        <button onClick={() => setBranchSearch("")} className={BTN_CLASS}>
          Clear
        </button>
      </div>

      <div className="overflow-auto">
        <TableLayout<BranchTableRow>
          columns={columns}
          data={filteredBranches}
          variant="bordered"
          size="sm"
          emptyMessage="No branches for this organization."
          getRowKey={(b) => b.id}
        />
      </div>
    </div>
  );
}
