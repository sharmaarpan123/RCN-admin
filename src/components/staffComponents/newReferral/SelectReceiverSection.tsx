"use client";

import React, { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import CustomAsyncSelect from "@/components/CustomAsyncSelect";
import CustomReactSelect from "@/components/CustomReactSelect";
import { SectionHeader } from "./SectionHeader";
import type { OrgBranchDeptOption, ReceiverRow } from "./types";
import {
  getStaffOrganizationsApi,
  getStatesApi,
  postStaffBranchesByOrganizationsApi,
  postStaffDepartmentsByBranchesApi,
} from "@/apis/ApiCalls";
import { checkResponse } from "@/utils/commonFunc";
import { Button } from "@/components";

/** Normalize API list to options. Supports { _id, name } or { id, name }. */
function toOptions(list: unknown[]): OrgBranchDeptOption[] {
  if (!Array.isArray(list)) return [];
  return list
    .map((item: unknown) => {
      const rec = item as Record<string, unknown>;
      const id = (rec._id ?? rec.id) as string | undefined;
      const name = (rec.name ?? rec.title) as string | undefined;
      return id && name ? { value: id, label: String(name) } : null;
    })
    .filter((x): x is OrgBranchDeptOption => x !== null);
}

interface SelectReceiverSectionProps {
  stateFilter: string;
  setStateFilter: (v: string) => void;
  receiverRows: ReceiverRow[];
  setReceiverRows: React.Dispatch<React.SetStateAction<ReceiverRow[]>>;
  onOpenAddReceiver: () => void;
}

export function SelectReceiverSection({
  stateFilter,
  setStateFilter,
  receiverRows,
  setReceiverRows,
  onOpenAddReceiver,
}: SelectReceiverSectionProps) {
  const selectedOrgOptions: OrgBranchDeptOption[] = receiverRows.map((r) => ({
    value: r.organizationId,
    label: r.organizationName,
  }));

  const { data: stateOptionsFromApi = [] } = useQuery({
    queryKey: ["states"],
    queryFn: async () => {
      const res = await getStatesApi();
      if (!checkResponse({ res })) return [];
      const data = res.data?.data ?? res.data;
      const list = Array.isArray(data) ? data : [];
      return list
        .map((item: { name?: string; abbreviation?: string }) => {
          const value = item.abbreviation;
          const label = item.name;
          return value != null && label != null ? { value: String(value), label: String(label) } : null;
        })
        .filter((x): x is OrgBranchDeptOption => x != null);
    },
  });

  const stateFilterOptions: OrgBranchDeptOption[] = [
    { value: "ALL", label: "All States" },
    ...stateOptionsFromApi,
  ];

  const loadOrganizationOptions = useCallback(
    (inputValue: string) => {
      const stateParam =
        stateFilter && stateFilter !== "ALL"
          ? stateOptionsFromApi.find((s) => s.value === stateFilter)?.label ?? stateFilter
          : "";
      return getStaffOrganizationsApi({
        ...(stateParam && { state: stateParam }),
        ...(inputValue.trim() && { search: inputValue.trim() }),
      })
        .then((res) => {
          if (!checkResponse({ res })) return [];
          const data = res.data?.data ?? res.data;
          const list = Array.isArray(data) ? data : [];
          return toOptions(list);
        })
        .catch(() => []);
    },
    [stateFilter, stateOptionsFromApi]
  );

  const handleOrganizationChange = useCallback(
    (options: OrgBranchDeptOption[]) => {
      setReceiverRows((prev) => {
        const next: ReceiverRow[] = options.map((opt) => {
          const existing = prev.find((r) => r.organizationId === opt.value);
          return {
            organizationId: opt.value,
            organizationName: opt.label,
            branchId: existing?.branchId ?? null,
            branchName: existing?.branchName ?? null,
            departmentId: existing?.departmentId ?? null,
            departmentName: existing?.departmentName ?? null,
          };
        });
        return next;
      });
    },
    [setReceiverRows]
  );

  const removeRow = useCallback(
    (organizationId: string) => {
      setReceiverRows((prev) => prev.filter((r) => r.organizationId !== organizationId));
    },
    [setReceiverRows]
  );

  const updateRowBranch = useCallback(
    (organizationId: string, branchId: string, branchName: string) => {
      setReceiverRows((prev) =>
        prev.map((r) =>
          r.organizationId === organizationId
            ? {
                ...r,
                branchId,
                branchName,
                departmentId: null,
                departmentName: null,
              }
            : r
        )
      );
    },
    [setReceiverRows]
  );

  const updateRowDepartment = useCallback(
    (organizationId: string, departmentId: string, departmentName: string) => {
      setReceiverRows((prev) =>
        prev.map((r) =>
          r.organizationId === organizationId
            ? { ...r, departmentId, departmentName }
            : r
        )
      );
    },
    [setReceiverRows]
  );

  return (
    <section
      id="select-receiver"
      className="bg-white border border-rcn-border rounded-2xl shadow-rcn p-4.5 mb-3.5  relative"
    >
      <SectionHeader
        title="Select the Referral Receiver"
        subtitle="Filter by state, then search and select organizations"
        badge="Bulk referrals supported"
      />

      <div className="border border-rcn-border/60 bg-[#eef8f1] border-[#cfe6d6] rounded-[14px] p-3 mb-3">
        <p className="m-0 text-sm text-rcn-text">
          Bulk referrals are supported. When a referral is sent to multiple receivers, each
          receiver will only be able to view their own referral and will not be able to see any
          other receivers or recipient details.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
            State (business location)
          </label>
          <CustomReactSelect
            value={stateFilter}
            onChange={setStateFilter}
            options={stateFilterOptions}
            placeholder="Select state..."
            aria-label="State (business location)"
            isClearable={false}
            maxMenuHeight={280}
          />
          <p className="text-xs text-rcn-muted mt-1.5">
            Select a state to narrow down organizations.
          </p>
        </div>
        <div>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
            Organization (search and select)
          </label>
          <CustomAsyncSelect
            value={selectedOrgOptions}
            onChange={handleOrganizationChange}
            loadOptions={loadOrganizationOptions}
            placeholder="Type to search organizations..."
            aria-label="Organization"
            defaultOptions={true}
            maxMenuHeight={280}
          />
          <p className="text-xs text-rcn-muted mt-1.5">
            Select one or more organizations. Then choose branch and department per row below.
          </p>
        </div>
      </div>

      <ReceiverRowsTable
        receiverRows={receiverRows}
        updateRowBranch={updateRowBranch}
        updateRowDepartment={updateRowDepartment}
        removeRow={removeRow}
      />

      <button
        type="button"
        onClick={onOpenAddReceiver}
        className="w-full mt-2.5 flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-[14px] bg-gradient-to-b from-rcn-brand to-rcn-brand-light text-white border border-black/6 shadow-[0_10px_18px_rgba(47,125,79,.22)] font-black text-xs hover:brightness-[1.03] hover:-translate-y-px active:translate-y-0 transition-all"
      >
        <span className="w-6.5 h-6.5 rounded-xl bg-white/18 flex items-center justify-center text-base">
          ＋
        </span>
        <span>Add Referral Receiver (if not listed)</span>
      </button>
    </section>
  );
}

/** Fetches branches for one org and returns options. */
function useBranchOptions(organizationId: string): OrgBranchDeptOption[] {
  const { data } = useQuery({
    queryKey: ["staff", "branches", organizationId],
    queryFn: async () => {
      const res = await postStaffBranchesByOrganizationsApi({
        organization_ids: [organizationId],
      });
      if (!checkResponse({ res })) return [];
      const data = res.data?.data ?? res.data;
      return toOptions(Array.isArray(data) ? data : []);
    },
    enabled: !!organizationId,
  });
  return data ?? [];
}

/** Fetches departments for one branch and returns options. */
function useDepartmentOptions(branchId: string | null): OrgBranchDeptOption[] {
  const { data } = useQuery({
    queryKey: ["staff", "departments", branchId],
    queryFn: async () => {
      if (!branchId) return [];
      const res = await postStaffDepartmentsByBranchesApi({
        branch_ids: [branchId],
      });
      if (!checkResponse({ res })) return [];
      const data = res.data?.data ?? res.data;
      return toOptions(Array.isArray(data) ? data : []);
    },
    enabled: !!branchId,
  });
  return data ?? [];
}

function ReceiverRow({
  row,
  updateRowBranch,
  updateRowDepartment,
  removeRow,
}: {
  row: ReceiverRow;
  updateRowBranch: (organizationId: string, branchId: string, branchName: string) => void;
  updateRowDepartment: (organizationId: string, departmentId: string, departmentName: string) => void;
  removeRow: (organizationId: string) => void;
}) {
  const branchOptions = useBranchOptions(row.organizationId);
  const departmentOptions = useDepartmentOptions(row.branchId);

  const branchValue = row.branchId
    ? { value: row.branchId, label: row.branchName ?? row.branchId }
    : "";
  const departmentValue = row.departmentId
    ? { value: row.departmentId, label: row.departmentName ?? row.departmentId }
    : "";

  return (
    <div className="grid grid-cols-[1fr_minmax(180px,1fr)_minmax(180px,1fr)_auto] gap-2 border-b border-rcn-border last:border-b-0 py-2.5 px-2 items-start">
      <div className="min-w-0">
        <p className="m-0 text-sm font-medium text-rcn-text wrap-break-word">
          {row.organizationName}
        </p>
      </div>
      <div className="min-w-[180px]">
        <CustomReactSelect
          value={typeof branchValue === "string" ? branchValue : branchValue.value}
          onChange={(value) => {
            const opt = branchOptions.find((o: OrgBranchDeptOption) => o.value === value);
            if (opt) updateRowBranch(row.organizationId, opt.value, opt.label);
          }}
          options={branchOptions}
          placeholder="Select branch..."
          aria-label="Branch"
          isClearable
          maxMenuHeight={220}
        />
      </div>
      <div className="min-w-[180px]">
        <CustomReactSelect
          value={typeof departmentValue === "string" ? departmentValue : departmentValue.value}
          onChange={(value) => {
            const opt = departmentOptions.find((o: OrgBranchDeptOption) => o.value === value);
            if (opt) updateRowDepartment(row.organizationId, opt.value, opt.label);
          }}
          options={departmentOptions}
          placeholder="Select department..."
          aria-label="Department"
          isClearable
          maxMenuHeight={220}
          isDisabled={!row.branchId}
        />
      </div>
      <div className="w-24 shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => removeRow(row.organizationId)}
          aria-label="Remove receiver"
        >
          Remove
        </Button>
      </div>
    </div>
  );
}

function ReceiverRowsTable({
  receiverRows,
  updateRowBranch,
  updateRowDepartment,
  removeRow,
}: {
  receiverRows: ReceiverRow[];
  updateRowBranch: (organizationId: string, branchId: string, branchName: string) => void;
  updateRowDepartment: (organizationId: string, departmentId: string, departmentName: string) => void;
  removeRow: (organizationId: string) => void;
}) {
  if (receiverRows.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-rcn-muted border border-rcn-border rounded-xl bg-slate-50/50">
        No organizations selected. Use the search above to add organizations, then choose branch and
        department for each row.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-rcn-border mb-3">
      <div className="min-w-[600px] rounded-xl ">
        <div className="grid grid-cols-[1fr_minmax(180px,1fr)_minmax(180px,1fr)_auto] gap-2 bg-slate-50 border-b border-rcn-border px-2 py-2.5 text-xs font-semibold text-rcn-muted uppercase tracking-wider items-center">
          <div>Organization</div>
          <div>Branch</div>
          <div>Department</div>
          <div className="w-24 shrink-0">Action</div>
        </div>
        {receiverRows.map((row) => (
          <ReceiverRow
            key={row.organizationId}
            row={row}
            updateRowBranch={updateRowBranch}
            updateRowDepartment={updateRowDepartment}
            removeRow={removeRow}
          />
        ))}
      </div>
    </div>
  );
}
