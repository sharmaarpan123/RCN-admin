"use client";

import type { TableColumn } from "@/components";
import { Button, DebouncedInput, TableLayout } from "@/components";
import type { OrgTableRow } from "./types";
import { INPUT_CLASS } from "./types";
interface OrganizationsTableProps {
  body: {
    page: number;
    limit: number;
    search: string;
  };
  isLoading: boolean;
  setBody: (v: { page: number; limit: number; search: string }) => void;
  data: OrgTableRow[];
  columns: TableColumn<OrgTableRow>[];
  onNewOrg: () => void;
}

export function OrganizationsTable({
  body,
  isLoading,
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
          <p className="text-xs text-rcn-muted mt-1 mb-0">Manage organizations.</p>
        </div>
        <Button variant="primary" size="sm" onClick={onNewOrg}>
          + New Organization
        </Button>
      </div>

      <div className="flex flex-wrap gap-2.5 items-end mt-3">
        <div className="flex flex-col gap-1.5 min-w-[260px] flex-1">
          <label className="text-xs text-rcn-muted">Search (Name or Location)</label>

          <DebouncedInput
            placeholder="Name, street, city, state, zip"
            value={body.search}
            onChange={(value) => setBody({ ...body, search: value })}
            className={INPUT_CLASS}
          />
        </div>


      </div>

      <div className="overflow-auto mt-3">
        <TableLayout<OrgTableRow>
          columns={columns}
          data={data}
          loader={isLoading}
          variant="bordered"
          size="sm"
          emptyMessage="No organizations found."
          getRowKey={(o) => o.organization?._id ?? o.organization_id}
        />
      </div>

      {/* <CustomPagination
        total={100}
        pageSize={body.limit}
        current={body.page}
        onChange={(page) => setBody({ ...body, page })}
      /> */}
    </div>
  );
}
