"use client";

import React from "react";
import { TableLayout } from "@/components";
import { INPUT_CLASS, BTN_CLASS, BTN_PRIMARY_CLASS } from "./types";
import type { DeptTableRow } from "./types";
import type { TableColumn } from "@/components";

interface OrgDeptsTabProps {
  deptSearch: string;
  setDeptSearch: (v: string) => void;
  filteredDepts: DeptTableRow[];
  columns: TableColumn<DeptTableRow>[];
  onNewDept: () => void;
}

export function OrgDeptsTab({
  deptSearch,
  setDeptSearch,
  filteredDepts,
  columns,
  onNewDept,
}: OrgDeptsTabProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-sm font-semibold m-0">Departments</h3>
          <p className="text-xs text-rcn-muted mt-1 mb-0">
            Enable/disable departments within the selected organization.
          </p>
        </div>
        <button onClick={onNewDept} className={BTN_PRIMARY_CLASS}>
          + New Department
        </button>
      </div>

      <div className="flex gap-3 items-end mb-3">
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs text-rcn-muted">Search Departments</label>
          <input
            value={deptSearch}
            onChange={(e) => setDeptSearch(e.target.value)}
            placeholder="Search by department, branch, or ID..."
            className={INPUT_CLASS}
          />
        </div>
        <button onClick={() => setDeptSearch("")} className={BTN_CLASS}>
          Clear
        </button>
      </div>

      <div className="overflow-auto">
        <TableLayout<DeptTableRow>
          columns={columns}
          data={filteredDepts}
          variant="bordered"
          size="sm"
          emptyMessage="No departments for this organization."
          getRowKey={(d) => d.id}
        />
      </div>
    </div>
  );
}
