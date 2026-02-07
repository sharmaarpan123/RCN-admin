"use client";

import React from "react";
import { TableLayout } from "@/components";
import { US_STATES } from "@/utils/database";
import { INPUT_CLASS, BTN_PRIMARY_CLASS } from "./types";
import type { OrgTableRow } from "./types";
import type { TableColumn } from "@/components";
import CustomPagination from "@/components/CustomPagination";
interface OrganizationsTableProps {
  body: {
    page: number;
    limit: number;
    search: string;
  };
  setBody: (v: { page: number; limit: number; search: string }) => void;
  data: OrgTableRow[];
  columns: TableColumn<OrgTableRow>[];
  onNewOrg: () => void;
}

export function OrganizationsTable({
  body,
  setBody,
  columns,
  data,

  onNewOrg,
}: OrganizationsTableProps) {
  return (
    <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4 mb-4">
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          <h3 className="m-0 text-sm font-semibold">Organizations</h3>
          <p className="text-xs text-rcn-muted mt-1 mb-0">
            Manage organizations and their address info (state + zip included).
          </p>
        </div>
        <button onClick={onNewOrg} className={BTN_PRIMARY_CLASS}>
          + New Organization
        </button>
      </div>

      <div className="flex flex-wrap gap-2.5 items-end mt-3">
        <div className="flex flex-col gap-1.5 min-w-[260px] flex-1">
          <label className="text-xs text-rcn-muted">Search (Name or Location)</label>
          <input
            placeholder="Name, street, city, state, zip"
            value={body.search}
            onChange={(e) => setBody({ ...body, search: e.target.value })}
            className={INPUT_CLASS}
          />
        </div>


      </div>

      <div className="overflow-auto mt-3">
        <TableLayout<OrgTableRow>
          columns={columns}
          data={data}
          variant="bordered"
          size="sm"
          emptyMessage="No organizations found."
          getRowKey={(o) => o.organization?._id ?? o.organization_id}
        />
      </div>

      <CustomPagination
        total={100}
        pageSize={body.limit}
        current={body.page}
        onChange={(page) => setBody({ ...body, page })}
      />
    </div>
  );
}
