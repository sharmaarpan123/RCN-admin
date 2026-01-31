"use client";

import React from "react";
import { TableLayout } from "@/components";
import { US_STATES } from "@/utils/database";
import { INPUT_CLASS, BTN_PRIMARY_CLASS } from "./types";
import type { OrgTableRow } from "./types";
import type { TableColumn } from "@/components";

interface OrganizationsTableProps {
  search: string;
  setSearch: (v: string) => void;
  stateFilter: string;
  setStateFilter: (v: string) => void;
  zipFilter: string;
  setZipFilter: (v: string) => void;
  filteredOrgs: OrgTableRow[];
  columns: TableColumn<OrgTableRow>[];
  onNewOrg: () => void;
}

export function OrganizationsTable({
  search,
  setSearch,
  stateFilter,
  setStateFilter,
  zipFilter,
  setZipFilter,
  filteredOrgs,
  columns,
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
        <div className="flex flex-col gap-1.5 min-w-[120px]">
          <label className="text-xs text-rcn-muted">State</label>
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className={INPUT_CLASS}
          >
            {US_STATES.map((s) => (
              <option key={s} value={s}>
                {s === "" ? "All" : s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5 min-w-[120px]">
          <label className="text-xs text-rcn-muted">Zip</label>
          <input
            placeholder="Zip"
            value={zipFilter}
            onChange={(e) => setZipFilter(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div className="overflow-auto mt-3">
        <TableLayout<OrgTableRow>
          columns={columns}
          data={filteredOrgs}
          variant="bordered"
          size="sm"
          emptyMessage="No organizations found."
          getRowKey={(o) => o.id}
        />
      </div>
    </div>
  );
}
